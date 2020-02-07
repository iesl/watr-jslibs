import _ from "lodash";
import path from "path";
import fs from "fs-extra";
import pump from "pump";
import {csvStream} from "~/util/parse-csv";
import {throughFunc, sliceStream, progressCount} from "~/util/stream-utils";

import hash from "object-hash";
import {expandedDir, ExpandedDir} from "./corpus-browser";
import {prettyPrint} from "~/util/pretty-print";
import {
  createRadix,
  radInsert,
  radTraverseValues,
  radUpsert,
} from "~/util/radix-tree";

interface Accum {
  noteId: string;
  dblpConfId: string;
  url: string;
  corpusPath: string;
}

type AccumKey = keyof Accum;

export function jsonifyCSV(fields: AccumKey[], row: string[]): Partial<Accum> {
  const acc: Partial<Accum> = {};
  _.each(row, (rf, ri) => {
    acc[fields[ri]] = rf;
  });
  return acc;
}

export function makeCorpusEntryLeadingPath(s: string): string {
  const sHash = hash(s, {algorithm: "sha1", encoding: "hex"});
  const leadingPath = sHash
    .slice(0, 2)
    .split("")
    .join("/");
  return leadingPath;
}

const matchingFiles = (re: RegExp) => (fs: string[]) =>
  fs.filter(f => re.test(f));

interface CorpusStats {
  urlCount: number;
  absCount: number;
  missingAbs: number;
}

function gatherAbstracts(expDir: ExpandedDir): string[] {
  const afs = matchingFiles(/ex.abs.json$/)(expDir.files);
  return afs.map(af => {
    const exAbs = fs.readJsonSync(path.join(expDir.dir, af));
    return exAbs.value;
  });
}

export function createCorpusEntryManifests(urlCsv: string, corpusRoot: string) {
  console.log(`createCorpusEntryManifests`);
  const radStats = createRadix<CorpusStats>();

  const collectStats = throughFunc((acc: Partial<Accum>) => {
    const url: string = acc.url!;
    if (url === "no_url") return;

    const noteId: string = acc.noteId!;

    const leadingPath = makeCorpusEntryLeadingPath(url);
    const leafPath = `${acc.noteId}.d`;
    const entryPath = path.join(corpusRoot, leadingPath, leafPath);

    const entryPathExists = fs.existsSync(entryPath);
    if (entryPathExists) {
      const expDir = expandedDir(entryPath);
      const entryProps = fs.readJsonSync(
        path.join(expDir.dir, "entry-props.json"),
      );

      const urlAbstracts = gatherAbstracts(expDir);
      const absCount = urlAbstracts.length === 0 ? 0 : 1;
      const missingAbs = urlAbstracts.length === 0 ? 1 : 0;

      const dblpId: string = entryProps.dblpConfId;
      const dblpParts = _.tail(dblpId.split("/"));
      dblpParts.push(noteId);

      radInsert(radStats, dblpParts, {urlCount: 1, absCount, missingAbs});

      return;
    }

    console.log(`Error: problem processing ${noteId} ${url}`);
    return;
  });

  const csvRowToJson = _.curry(jsonifyCSV)(["noteId", "dblpConfId", "url"]);

  const pipeline = pump(
    csvStream(urlCsv),
    // sliceStream(0, 10),
    progressCount(1000),
    throughFunc(csvRowToJson),
    collectStats,
    (err: Error) => {
      console.log(`Error:`, err);
    },
  );

  pipeline.on("end", () => {
    console.log("accumulating stats");

    const accumStats = createRadix<CorpusStats>();

    radTraverseValues(radStats, (path, stats) => {
      path.pop();
      while (path.length > 0) {
        radUpsert(accumStats, path, accStats => {
          if (accStats) {
            return {
              urlCount: stats.urlCount + accStats.urlCount,
              absCount: stats.absCount + accStats.absCount,
              missingAbs: stats.missingAbs + accStats.missingAbs,
            };
          }
          return stats;
        });
        path.pop();
      }
    });

    const allStats: string[] = [];
    radTraverseValues(accumStats, (path, stats) => {
      const {urlCount, absCount, missingAbs} = stats;
      const venue = _.join(path, " / ").padEnd(24);
      allStats.push(
        `${venue} urls: ${urlCount}; abs# ${absCount}; missing# ${missingAbs}`,
      );
    });
    const sorted = _.sortBy(allStats);

    console.log(_.join(sorted, "\n"));
  });

  pipeline.on("data", () => {});
}
