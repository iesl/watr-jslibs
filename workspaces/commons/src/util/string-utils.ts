import _ from "lodash";

import sliceAnsi from 'slice-ansi';
import chalk from 'chalk';
import wrapAnsi from 'wrap-ansi';
import * as Diff from 'diff';


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
      .rgb(r + 128, g + 128, b + 128)
      .bgRgb(b, g, r)(mid);

    res = pre + midclr + end;
  });

  return res;
}

export function clipParagraph(width: number, height: number, para: string): string {

  const wrappedLines = wrapAnsi(para, width).split('\n');

  let clipped: string;
  if (wrappedLines.length > height) {
    const elidedStartLine = _.clamp(height - 4, 1, wrappedLines.length);
    const clippedHead = wrappedLines.slice(0, elidedStartLine).join("\n");
    const len = wrappedLines.length;
    const clippedEnd = wrappedLines.slice(len - 3).join("\n");
    const clippedCount = len - height;
    const middle = `... + ${clippedCount} lines`;
    clipped = _.join([clippedHead, middle, clippedEnd], '\n');
  } else {
    clipped = wrappedLines.join("\n");
  }

  return clipped;
}

export function stripMargin(block: string): string {
  const lines = block.split("\n");
  const stripped = stripMargins(lines);
  return stripped.join("\n");
}

export function stripMargins(lines: string[]): string[] {
  return _
    .map(lines, l => {
      const ltrim = l.trimLeft();
      if (ltrim.startsWith("|")) {
        return ltrim.slice(1);
      }
      return l;
    });
}

type DiffCharsArgs = {
  brief: boolean
}

export interface AddChange {
  kind: 'add';
  value: string;
  count: number;
}
export interface RemoveChange {
  kind: 'remove';
  value: string;
  count: number;
}

export interface Unchanged {
  kind: 'unchanged';
  value?: string;
  count: number;
}
export type Change = AddChange | RemoveChange | Unchanged;

export function isAdd(c: Change): c is AddChange {
  return c.kind === 'add';
}
export function isRemove(c: Change): c is AddChange {
  return c.kind === 'remove';
}
export function isUnchanged(c: Change): c is AddChange {
  return c.kind === 'unchanged';
}

export function diffByChars(stra: string, strb: string, opts?: DiffCharsArgs): Change[] {
  const brief = opts && opts.brief;
  const changes = Diff.diffChars(stra, strb);
  const asPairs = _.map(changes, (change) => _.toPairs(change));
  const filterUndefs = _.map(asPairs, change => _.filter(change, ([,v]) => !_.isNil(v)));
  const asObjects = _.map(filterUndefs, change => _.fromPairs(change));
  return _.map(asObjects, obj => {
    const { added, removed, count, value } = obj;
    if (added) return ({ kind: 'add', value, count });
    if (removed) return ({ kind: 'remove', value, count });
    if (brief) return ({ kind: 'unchanged', count });
    return ({ kind: 'unchanged', value, count });
  });
}


