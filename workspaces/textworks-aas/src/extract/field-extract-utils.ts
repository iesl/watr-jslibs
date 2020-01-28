import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';
import { prettyPrint } from './pretty-print';

export function readFile(leading: string, ...more: string[]): string|undefined {
  const filepath = path.join(leading, ...more);
  const exists = fs.existsSync(filepath);
  if (exists) {
    const buf = fs.readFileSync(filepath);
    const fileContent = buf.toString().trim();
    return fileContent;
  }
  return undefined;
}


export function indentLevel(s: string): number {
  // TODO remove this hack
  if (!s) return -1;

  let i = 0;
  const l = s.length;
  while(i < l && s.charAt(i)===' ') i++;
  return i;
}

export function stripMargin(lines: string[]): string[] {
  return _.map(lines, l => {
    if (l.trimLeft().startsWith('|')) {
      return l.trimLeft().slice(1);
    }
    return l;
  })
}

export function filterText(lines: string[]): string[] {
  return _.map(lines, _.trim)
    .filter(l => l.startsWith('|'))
    .map(l => l.substr(1));
}

export function findIndexForLines(fileLines: string[], matchLines: string[], startIndex: number=0): number {
  // console.log(`findIndexForLines: start: ${startIndex}`);

  if (matchLines.length===0) {
    return -1;
  }
  const index = fileLines.findIndex((line, lineNum) => {
    if (lineNum < startIndex) return false;

    return _.every(matchLines, (matchLine, matchNum) => {
      const currLine = fileLines[lineNum + matchNum];
      return currLine && currLine.match(matchLine);
    });
  });

  return index;
}

export function findSubContentAtIndex(fileLines: string[], index: number): string[] {
  // let i = index;
  let l0 = fileLines[index];
  let indent0 = indentLevel(l0);
  const ls = fileLines.slice(index);
  const sub = _.takeWhile(ls, (lN) => {
    let indentN = indentLevel(lN);
    return indent0 <= indentN;
  });

  return sub;
}

export const suspiciousAbstractRegexes = [
  '^</div>',
  '^<div class="item abstract">',
  '^<p><i>',
  '^limited training samples and prevent',
  '^each argume',
  '^However, m',
  '^Frontmatter for Workshop Proceedings.',
  '^This is the preface',
  '^Preface to the 2018 KDD Workshop on Cau',
  '^Presents the welcome message from the conference proceedings.',
  '^The conference offers a note of thanks and lists its reviewers.',
  '^Provides a listing of current committee members and society officers.',
  '^This correspondence calls attenti',
  '^Prospective authors are requested to submit new, unpublished manuscripts',
  '^The seven papers in this special section',
].map(s => new RegExp(s));
