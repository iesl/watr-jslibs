import _ from "lodash";
import path from "path";
import fs from "fs-extra";
import split from "split2";
import pump from "pump";
import through from "through2";
import * as csv from "fast-csv";
import {csvStream} from "~/util/parse-csv";
import {
  throughFunc,
  createReadStream,
  sliceStream,
  progressCount,
} from "~/util/stream-utils";
import {prettyPrint} from "~/util/pretty-print";
import hash from "object-hash";
import {expandDir, expandedDir} from "./corpus-browser";

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

export function createCorpusEntryManifests(urlCsv: string, corpusRoot: string) {
  console.log(`createCorpusEntryManifests`);

  const jsonify = _.curry(jsonifyCSV)(["noteId", "dblpConfId", "url"]);
  const csvToObj = throughFunc(jsonify);

  const csvstr = csvStream(urlCsv);

  const rewrite = throughFunc((acc: Partial<Accum>) => {
    const url: string = acc.url!;
    if (url === "no_url") return;

    const noteId: string = acc.noteId!;
    const dblpConfId: string = acc.dblpConfId!;
    // console.log(`Checking ${noteId}/${url}`);
    // console.log(`.`);

    const leadingPath = makeCorpusEntryLeadingPath(url);
    const leafPath = `${acc.noteId}.d`;
    const entryPath = path.join(corpusRoot, leadingPath, leafPath);

    const entryPathExists = fs.existsSync(entryPath);
    if (entryPathExists) {
      const expDir = expandedDir(entryPath);
      const metaFiles = matchingFiles(/entry-meta/)(expDir.files);
      const entryMeta = metaFiles.map(f => {
        const meta = fs.readJsonSync(path.join(expDir.dir, f));
        return {
          id: meta.id,
          url: meta.url,
        };
      });
      const idAndUrlMatch = entryMeta.every(({id, url}) => {
        return noteId === id && url === acc.url;
      });
      if (!idAndUrlMatch) {
        console.log(`Error: id/url do not match for ${noteId} ${url}`);
      }
      // prettyPrint({acc, entryPathExists, entryPath});
    } else {
      console.log(`Error: no corpus path for ${noteId} ${url}`);
    }

    // resolve corpus entry path
    return "ok";
  });

  const pipeline = pump(
    csvstr,
    // sliceStream(0, 10),
    progressCount(1000),
    csvToObj,
    rewrite,
    (err: Error) => {
      console.log(`Error:`, err);
    },
  );

  pipeline.on("data", err => {});
}
