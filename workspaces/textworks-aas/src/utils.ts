
import _ from "lodash";
import path from 'path';
import fs from 'fs-extra';

export function getOrDie<T>(v: T | null | undefined, msg: string = "null|undef"): T {
  if (v === null || v === undefined) {
    throw new Error(`Error: ${msg}`);
  }
  return v;
}

export function dirOrDie(file: string|undefined, ...ps: string[]): string {
  let pres = file;
  if (file) {
    pres = path.resolve(...ps, file)
    const exists = fs.existsSync(pres);
    const valid = exists? fs.statSync(pres).isDirectory() : false;
    if (valid) {
      return pres;
    }
  }
  console.log(`Dir Error: ${pres} doesn't exist`);
  process.exit();
  // just to quiet the return errors:
  throw new Error();
}

export function fileOrDie(file: string|undefined, ...ps: string[]): string {
  let pres = file;
  if (file) {
    pres = path.resolve(...ps, file)
    const exists = fs.existsSync(pres);
    const valid = exists? fs.statSync(pres).isFile() : false;
    if (valid) {
      return pres;
    }
  }
  console.log(`File Error: ${pres} doesn't exist`);
  process.exit();
  // just to quiet the return errors:
  throw new Error();
}

export async function runMapThenables<V>(vs: ArrayLike<V>, f: (v: V) => Promise<any>): Promise<void> {
  if (vs.length > 0) {
    const v0 = vs[0];
    return f(v0).then(() => {
      return runMapThenables(_.tail(vs), f);
    }).catch(err => {
      console.log("runMapThenables: error: ", err);
    });
  }
  return;
}
