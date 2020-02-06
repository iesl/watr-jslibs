import _ from "lodash";
import path from "path";
import fs from "fs-extra";
import pump from "pump";
import {csvStream} from "~/util/parse-csv";
import {throughFunc, sliceStream, progressCount} from "~/util/stream-utils";

// import {prettyPrint} from "~/util/pretty-print";

import hash from "object-hash";
import {expandedDir} from "./corpus-browser";
import { prettyPrint } from '~/util/pretty-print';

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

    const leadingPath = makeCorpusEntryLeadingPath(url);
    const leafPath = `${acc.noteId}.d`;
    const entryPath = path.join(corpusRoot, leadingPath, leafPath);

    const entryPathExists = fs.existsSync(entryPath);
    if (entryPathExists) {
      const expDir = expandedDir(entryPath);
      const entryProps = fs.readJsonSync(path.join(expDir.dir, 'entry-props.json'));

      prettyPrint({ entryProps });

      return;
    }

    console.log(`Error: problem processing ${noteId} ${url}`);
    return;
  });

  const pipeline = pump(
    csvstr,
    sliceStream(0, 10),
    progressCount(1000),
    csvToObj,
    rewrite,
    (err: Error) => {
      console.log(`Error:`, err);
    },
  );

  pipeline.on("data", () => {});
}
