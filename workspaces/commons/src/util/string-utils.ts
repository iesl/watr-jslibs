import _ from "lodash";

import sliceAnsi from 'slice-ansi';
import chalk from 'chalk';
import wrapAnsi from 'wrap-ansi';


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


export function highlightRegions(input: string, matches: Array<[number, number]>): string {
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


export function clipParagraph(width: number, height: number, para: string): string {

  const wrappedLines = wrapAnsi(para, width).split('\n');

  let clipped: string;
  if (wrappedLines.length > height) {
    const elidedStartLine = _.clamp(height-4, 1, wrappedLines.length);
    const clippedHead = wrappedLines.slice(0, elidedStartLine).join("\n");
    const len = wrappedLines.length;
    const clippedEnd = wrappedLines.slice(len-3).join("\n");
    const clippedCount = len-height;
    const middle = `... + ${clippedCount} lines`;
    clipped = _.join([clippedHead, middle, clippedEnd], '\n');
  } else {
    clipped = wrappedLines.join("\n");
  }

  return clipped;
}
