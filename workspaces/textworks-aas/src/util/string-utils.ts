import _ from "lodash";

import sliceAnsi from 'slice-ansi';
import chalk from 'chalk';
import { prettyPrint } from './pretty-print';


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


export function highlightRegions2(input: string, matches: Array<[number, number]>): string {
  let res = input;
  _.each(matches, ([mstart, mend], mindex) => {
    const pre = sliceAnsi(res, 0, mstart);
    const mid = sliceAnsi(res, mstart, mend);
    const end = sliceAnsi(res, mend);
    // prettyPrint({ pre, mid, end });
    const r = (mindex * 13 * 13) % 64;
    const g = (mindex * 7 * 13) % 64;
    const b = (mindex * 5 * 13) % 64;
    const midclr = chalk // .underline(mid);
      .rgb(r+128, g+128, b+128)
      .bgRgb(b, g, r)(mid);

    res = pre + midclr + end;
  });

  return res;
}
export function highlightRegions0(input: string, matches: Array<[number, number]>): string {
  let res = input;
  _.each(matches, ([mstart, mend], mindex) => {
    const pre = sliceAnsi(res, 0, mstart);
    const mid = sliceAnsi(res, mstart, mend);
    const end = sliceAnsi(res, mend);
    // prettyPrint({ pre, mid, end });
    const r = (mindex * 13 * 13) % 64;
    const g = (mindex * 7 * 13) % 64;
    const b = (mindex * 5 * 13) % 64;
    const midclr = chalk // .underline(mid);
      .rgb(r+128, g+128, b+128)
      .bgRgb(b, g, r)(mid);

    res = pre + midclr + end;
  });

  return res;
}
/**
 * splitEnv:
 *   strEnv = [ ['abcde', {env}] ]
 *   split(strEnv, 2, 4) => [ sliceIndex=1
 *                            [ ['ab', {env}], ['cd', {env}], ['e', {env}] ]
 *                         ]
 *   split(strEnv, 1, 3) => [ sliceIndex=[2, 3]
 *                            [ ['a', {env}], ['b', {env}], ['c', {env}], ['d', {env}], ['e', {env}] ]
 */

export function highlightRegions(input: string, matches: Array<[number, number]>): string {
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
