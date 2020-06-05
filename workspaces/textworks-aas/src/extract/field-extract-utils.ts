import _ from "lodash";
import fs from "fs-extra";
import path from "path";
import * as cheerio from "cheerio";
import { Field } from "./field-extract";

import { makeCssTreeNormalFormFromNode } from "./reshape-html";
import { prettyPrint } from 'commons';

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

export function cheerioLoad(
  fileContent: string,
  useXmlMode: boolean = true
): CheerioStatic {
  const $ = cheerio.load(fileContent, {
    _useHtmlParser2: true,
    recognizeSelfClosing: true,
    normalizeWhitespace: false,
    xmlMode: useXmlMode,
    decodeEntities: true
  });
  return $;
}

export function queryContent(
  query: string,
  fileContent: string,
): [Field, Cheerio, CheerioStatic] {
  const field: Field = {
    name: "abstract",
    evidence: `jquery:[${query}]`,
  };
  const $ = cheerioLoad(fileContent);
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

export function getMatchingLines(
  evidence: string[],
  options: LineMatchOptions,
  cssNormLines: string[],
): string[] {
  const { lineOffset, lineCount, evidenceEnd } = options;

  const evidenceStartIndex = findIndexForLines(cssNormLines, evidence);

  if (evidenceStartIndex > -1) {
    const fromIndex = evidenceStartIndex + evidence.length + lineOffset;

    let toIndex = lineCount > 0 ? fromIndex + lineCount : cssNormLines.length;

    if (evidenceEnd.length > 0) {
      toIndex = findIndexForLines(cssNormLines, evidenceEnd, fromIndex);
    }

    return cssNormLines.slice(fromIndex, toIndex);
  }
  return [];
}

export function _byLineMatch(
  evidence: string[],
  options: LineMatchOptions,
  cssNormLines: string[],
): Field {
  const { indentOffset } = options;
  const evType = _.join(_.map(evidence, (e) => `/${e}/`), " _ ");

  const field: Field = {
    name: "abstract",
    evidence: `lines:[${evType}]`
  };

  const matchingLines = getMatchingLines(evidence, options, cssNormLines);
  if (matchingLines.length === 0) return field;

  const sub = findSubContentAtIndex(
    matchingLines,
    0,
    matchingLines.length,
    indentOffset
  );

  field.value = getSubtextOrUndef(sub);
  return field;
}

type ExtractorFunction = (cssNormLines: string[], htmlContent: string, url?: string, responseCode?: number) => Partial<Field>;

export function urlGuard(
  urlTests: string[],
  exf: ExtractorFunction
): ExtractorFunction {
  const utests = _.map(urlTests, t => new RegExp(t));
  const haveUrlTests = utests.length > 0;

  return (cssNormLines: string[], htmlContent: string, url?: string, responseCode?: number): Partial<Field> => {
    const urlMatch = (
      url === undefined
      || !haveUrlTests
      || _.some(utests, t => url && t.test(url))
    );

    if (responseCode !== 200) {
      return {
        error: `status code != 200 (was ${responseCode})`
      };
    }
    if (urlMatch) {
      const innerResult = exf(cssNormLines, htmlContent);
      if (haveUrlTests) {
        const testStr = _.join(_.map(urlTests, t => `/${t}/`), " || ");
        const priorEvidence = innerResult.evidence ? ` && ${innerResult.evidence}` : '';
        const expandedEvidence = `url:[${testStr}]${priorEvidence}`;
        innerResult.evidence = expandedEvidence;
      }
      return innerResult;
    }
    return {
      complete: false
    };
  };
}

export function findInMeta(
  evidence: string,
): (str: string[]) => Field {

  const opts = {
    lineOffset: -1,
    lineCount: 1,
    indentOffset: 0,
    evidenceEnd: [],
  };
  const ev = `^ *meta.+${evidence}`;

  const field: Field = {
    name: "abstract",
    evidence: `meta:[${evidence}]`,
  };

  return (ss: string[]): Field => {
    const res = getMatchingLines([ev], opts, ss);
    const value = res[0];

    if (value) {
      const i = value.indexOf("='");
      const ilast = value.lastIndexOf("'")
      const justAbstract = value.slice(i + 2, ilast);

      field.value = justAbstract;
    }
    return field;
  }
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
