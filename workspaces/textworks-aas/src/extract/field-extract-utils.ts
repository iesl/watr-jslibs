import _ from "lodash";
import fs from "fs-extra";
import path from "path";
import * as cheerio from "cheerio";
import {Field} from "./field-extract";

import {makeCssTreeNormalFormFromNode} from "./reshape-html";

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
  // TODO remove this hack
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
  startIndex: number = 0,
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
  index: number,
): string[] {
  const l0 = fileLines[index];
  const i0 = indentLevel(l0);
  const ls = fileLines.slice(index);
  const sub = _.takeWhile(ls, lN => i0 <= indentLevel(lN));

  return sub;
}

export function queryContent(
  query: string,
  fileContent: string,
): [Field, Cheerio, CheerioStatic] {
  let field: Field = {
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
  field.value = getSubtextOrUndef(cssNormal);
  return field;
}

function _byLineMatch(
  evidence: string[],
  evidenceOffset: number,
  cssNormLines: string[],
): Field {
  return _byLineMatchEnd(evidence, [], evidenceOffset, cssNormLines);
}

function _byLineMatchEnd(
  evidence: string[],
  evidenceEnd: string[],
  evidenceOffset: number,
  cssNormLines: string[],
): Field {
  let field: Field = {
    name: "abstract",
    evidence: _.join(evidence, " > "),
  };
  const index = findIndexForLines(cssNormLines, evidence);
  if (index > -1) {
    let searchWindow = cssNormLines;
    let startIndex = index;
    if (evidenceEnd.length > 0) {
      const endIndex = findIndexForLines(cssNormLines, evidenceEnd, index);
      searchWindow = cssNormLines.slice(index, endIndex);
      startIndex = 0;
    }
    const offset = evidenceOffset ? evidenceOffset : 0;

    const sub = findSubContentAtIndex(
      searchWindow,
      startIndex + offset,
    );

    field.value = getSubtextOrUndef(sub);
  }
  return field;
}

export const findByLineMatch = _.curry(_byLineMatch);
export const findByLineMatchEnd = _.curry(_byLineMatchEnd);
export const findByQuery = _.curry(_findByQuery);

export function getSubtextOrUndef(strs: string[]): string | undefined {
  const justText = filterText(strs);
  const abs = _.join(justText, " ").trim();

  if (abs.length > 0) {
    return abs;
  }
  return undefined;
}

export const suspiciousAbstractRegexes = [
  "^</div>",
  '^<div class="item abstract">',
  "^<p><i>",
  "^limited training samples and prevent",
  "^each argume",
  "^However, m",
  "^Frontmatter for Workshop Proceedings.",
  "^This is the preface",
  "^Preface to the 2018 KDD Workshop on Cau",
  "^Presents the welcome message from the conference proceedings.",
  "^The conference offers a note of thanks and lists its reviewers.",
  "^Provides a listing of current committee members and society officers.",
  "^This correspondence calls attenti",
  "^Prospective authors are requested to submit new, unpublished manuscripts",
  "^The seven papers in this special section",
].map(s => new RegExp(s));
