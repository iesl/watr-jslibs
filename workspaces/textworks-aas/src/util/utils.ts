
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
}

export function fileOrUndef(file: string|undefined, ...ps: string[]): string|undefined {
  let pres = file;
  if (file) {
    pres = path.resolve(...ps, file)
    const exists = fs.existsSync(pres);
    const valid = exists? fs.statSync(pres).isFile() : false;
    if (valid) {
      return pres;
    }
  }
  return undefined;
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
  return Promise.resolve();
}


export function makeNowTimeString(): string {
  const now = new Date();
  const timeOpts = {
    timeStyle: "medium",
    hour: "2-digit",
    minute: "2-digit",
    seconds: "2-digit",
    hour12: false,
  };
  const nowTime = now.toLocaleTimeString("en-US", timeOpts);

  const timestamp = nowTime.replace(/:/g, ".");
  return timestamp;
}

import chalk from 'chalk';


export function matchAll(re: RegExp, str: string): Array<[number, number]> {
  const re0 = RegExp(re);
  const matchOffsets: [number, number][] = [];
  let matchArr;
  while ((matchArr = re0.exec(str)) !== null) {
    const mstr = matchArr[0];
    const mstart = matchArr.index;
    const last = re0.lastIndex
    const mend = last > 0 ? last : mstart + mstr.length;
    matchOffsets.push([mstart, mend])
  }
  return matchOffsets;
}

export function highlightStringRegions(input: string, matches: Array<[number, number]>): string {
  type ArrT = string | [string, number[]];
  // highlight rule matches
  const inputArr: ArrT[] = input.split('');

  _.each(matches, ([mstart, mend], mindex) => {
    const whichHL = mindex + 1;
    const st = inputArr[mstart];
    const end = inputArr[mend];
    let st1: ArrT = st;
    let end1: ArrT = end;
    if (typeof st === 'string') {
      st1 = [st, [whichHL]];
    } else {
      const [ch, offsets] = st;
      offsets.push(whichHL);
      st1 = [ch, offsets];
    }
    if (typeof end === 'string') {
      end1 = [end, [-whichHL]];
    } else {
      const [ch, offsets] = end;
      offsets.push(-whichHL);
      end1 = [ch, offsets];
    }
    inputArr[mstart] = st1;
    inputArr[mend] = end1;
  });

  const hlstrings: string[] = [];
  let currString: string[] = [];
  let activeHLs: number[] = [];
  _.each(inputArr, elem => {
    if (typeof elem === 'string') {
      currString.push(elem);
    } else {
      const [ch, offsets] = elem;
      // apply current hightlights
      const lastStr = currString.join("")
      let hlstr = lastStr;
      if (activeHLs.length > 0) {
        hlstr = chalk.rgb(255, 240, 10)(lastStr);
      }
      hlstrings.push(hlstr);
      currString = [ch];

      const begins = offsets.filter(o => o > 0);
      const ends = offsets.filter(o => o < 0);
      const hl0 = _.filter(activeHLs, (h) => !_.includes(ends, -h));
      const hl1 = _.concat(hl0, begins);
      const hl2 = _.uniq(hl1);
      activeHLs = hl2;
    }
  });
  const finalHl = hlstrings.join("") + currString.join("");
  return finalHl;
}
