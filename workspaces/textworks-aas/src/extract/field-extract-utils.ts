import _ from "lodash";
import fs from "fs-extra";
import path from "path";
import * as cheerio from "cheerio";
import { Field } from "./field-extract";

import { makeCssTreeNormalFormFromNode } from "./reshape-html";
import { prettyPrint } from 'commons/dist';

export function readFile(
  leading: string,
  ...more: string[]
): string | undefined {
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
  if (!s) return -1;

  let i = 0;
  const l = s.length;
  while (i < l && s.charAt(i) === " ") i++;
  return i;
}

export function stripMargin(lines: string[]): string[] {
  return _.map(lines, l => {
    const ltrim = l.trimLeft();
    if (ltrim.startsWith("|")) {
      return ltrim.slice(1);
    }
    return l;
  });
}

export function filterText(lines: string[]): string[] {
  return _.map(lines, _.trim)
    .filter(l => l.startsWith("|"))
    .map(l => l.substr(1));
}

export function findIndexForLines(
  fileLines: string[],
  matchLines: string[],
  startIndex = 0,
): number {
  if (matchLines.length === 0) {
    return -1;
  }
  const index = fileLines.findIndex((_line, lineNum) => {
    if (lineNum < startIndex) return false;

    return _.every(matchLines, (matchLine, matchNum) => {
      const currLine = fileLines[lineNum + matchNum];
      return currLine && currLine.match(matchLine);
    });
  });

  return index;
}

export function findSubContentAtIndex(
  fileLines: string[],
  startIndex: number,
  endIndex: number,
  indentOffset: number
): string[] {
  const line0 = fileLines[startIndex];
  const indent0 = indentLevel(line0) + indentOffset;
  const ls = fileLines.slice(startIndex, endIndex);
  // prettyPrint({ msg: 'findSubContentAtIndex', line0, indent0 })

  const sub = _.takeWhile(ls, lineN => {
    const indentN = indentLevel(lineN);
    // prettyPrint({ msg: '    findSub', lineN, indentN })
    return indent0 <= indentN;
  });

  return sub;
}

export function queryContent(
  query: string,
  fileContent: string,
): [Field, Cheerio, CheerioStatic] {
  const field: Field = {
    name: "abstract",
    evidence: `query=${query}`,
  };
  const $ = cheerio.load(fileContent);
  return [field, $(query), $]
}

function _findByQuery(
  query: string,
  _normLines: string[],
  fileContent: string,
): Field {
  const [field, maybeAbstract] = queryContent(query, fileContent);
  const cssNormal = makeCssTreeNormalFormFromNode(maybeAbstract);
  // prettyPrint({ msg: '_findByQuery', field, cssNormal });
  field.value = getSubtextOrUndef(cssNormal);
  return field;
}

export interface LineMatchOptions {
  lineOffset: number;
  lineCount: number;
  indentOffset: number;
  evidenceEnd: string[];
}

export const defaultLineMatchOptions: LineMatchOptions = {
  lineOffset: 0,
  lineCount: 0,
  indentOffset: 0,
  evidenceEnd: [],
};

function _byLineMatch(
  evidence: string[],
  options: LineMatchOptions,
  cssNormLines: string[],
): Field {
  const { lineOffset, lineCount, indentOffset, evidenceEnd } = options;
  const evType = _.join(_.map(evidence, (e) => `/${e}/`), "; ");

  const field: Field = {
    name: "abstract",
    evidence: `line-match: ${evType}`
  };

  const evidenceStartIndex = findIndexForLines(cssNormLines, evidence);

  // prettyPrint({ msg: '_byLineMatch', evidenceStartIndex });

  if (evidenceStartIndex > -1) {
    const fromIndex = evidenceStartIndex + evidence.length + lineOffset;

    let toIndex = lineCount > 0 ? fromIndex + lineCount : cssNormLines.length;

    if (evidenceEnd.length > 0) {
      toIndex = findIndexForLines(cssNormLines, evidenceEnd, fromIndex);
    }

    const searchWindow = cssNormLines.slice(fromIndex, toIndex);
    // prettyPrint({ msg: '_byLineMatch', fromIndex, toIndex, searchWindow });

    const sub = findSubContentAtIndex(
      cssNormLines,
      fromIndex,
      toIndex,
      indentOffset
    );

    field.value = getSubtextOrUndef(sub);
  }
  return field;
}

export function findByLineMatch(
  evidence: string[],
  options?: Partial<LineMatchOptions>,
): (str: string[]) => Field {
  const opts = _.assign({}, defaultLineMatchOptions, options);
  return _.curry(_byLineMatch)(evidence)(opts);
}

export const findByQuery = _.curry(_findByQuery);

export function getSubtextOrUndef(strs: string[]): string | undefined {
  const justText = filterText(strs);
  const abs = _.join(justText, " ").trim();

  if (abs.length > 0) {
    return abs;
  }
  return undefined;
}





// function _byLineMatchZZ(

//   evidence: string[],
//   options: LineMatchOptions,
//   cssNormLines: string[],
// ): Field {
//   const { lineOffset, lineCount, indentOffset, evidenceEnd } = options;

//   const field: Field = {
//     name: "abstract",
//     evidence: _.join(evidence, " > "),
//   };
//   const index = findIndexForLines(cssNormLines, evidence);

//   prettyPrint({ msg: '_byLineMatchEnd', index });

//   if (index > -1) {
//     let searchWindow = cssNormLines;
//     let startIndex = index;
//     let endIndex = lineCount > 0? startIndex + lineCount : cssNormLines.length;

//     if (evidenceEnd.length > 0) {
//       endIndex = findIndexForLines(cssNormLines, evidenceEnd, index+1);
//     }
//     searchWindow = cssNormLines.slice(startIndex, endIndex);
//     prettyPrint({ msg: '_byLineMatchEnd', startIndex, endIndex });

//     startIndex = 0;


//     const sub = findSubContentAtIndex(
//       searchWindow,
//       startIndex + lineOffset,
//       endIndex,
//       indentOffset
//     );

//     field.value = getSubtextOrUndef(sub);
//   }
//   return field;
// }
