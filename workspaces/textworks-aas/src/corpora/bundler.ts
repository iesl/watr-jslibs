import _ from "lodash";
import path from "path";
import fs from "fs-extra";

import { ExpandedDir } from "commons";
import { Field } from '~/extract/field-extract';

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

const matchingFiles = (re: RegExp) => (fs: string[]) =>
  fs.filter(f => re.test(f));

export function gatherAbstractFiles(expDir: ExpandedDir): Array<[string, Field[]]> {
  const afs = matchingFiles(/ex.abs.json$/)(expDir.files);
  return afs.map(af => {
    const fields: Field[] = fs.readJsonSync(path.join(expDir.dir, af));
    return [af, fields];
  });
}
