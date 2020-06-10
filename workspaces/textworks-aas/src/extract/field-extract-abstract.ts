import _ from "lodash";
import path from "path";
import { Transform } from "stream";
import through from "through2";
import fs from "fs-extra";
import { Field, ExtractionFunction, readMetaProps, filterUrl, runFileVerification, runHtmlTidy, initialEnv, ExtractionEnv, bindTasks } from "~/extract/field-extract";

import { makeCssTreeNormalFormFromNode, writeNormalizedHtml, makeCssTreeNormalForm } from "./reshape-html";

import {
  readFile,
  findByLineMatch,
  getSubtextOrUndef,
  findByQuery,
  queryContent,
  urlGuard,
  findInMeta,
  getMatchingLines,
  findByLineMatchTE,
  findInMetaTE,
} from "~/extract/field-extract-utils";

import { prettyPrint, BufferedLogger, ExpandedDir } from "commons";
import { writeDefaultEntryLogs, readMetaFile } from '~/qa-editing/qa-logging';
import { ReviewEnv } from './qa-review-abstracts';

type PipelineFunction = (lines: string[], content: string, url?: string, httpStatus?: number) => Partial<Field>;


export function findAbstractV2(_cssNormLines: string[], htmlContent: string): Field {
  const cssNormalForm = makeCssTreeNormalForm(htmlContent, /* useXmlMode= */ false)
  // const field = findByLineMatch(["global.document.metadata"], { lineOffset: -1, lineCount: 1 })(cssNormLines);
  const evidence = "global.document.metadata";
  const opts = {
    lineOffset: -1,
    lineCount: 1,
    indentOffset: 0,
    evidenceEnd: [],
  };
  const res = getMatchingLines([evidence], opts, cssNormalForm);
  const metadataLine = res[0];
  const field: Field = {
    name: "abstract",
    evidence,
  };

  if (metadataLine) {
    const jsonStart = metadataLine.indexOf("{");
    const jsonEnd = metadataLine.lastIndexOf("}");
    const lineJson = metadataLine.slice(jsonStart, jsonEnd + 1);
    try {
      const metadataObj = JSON.parse(lineJson);
      const abst = metadataObj["abstract"];
      field.value = abst;
    } catch (e) {
      prettyPrint({ e, lineJson });
    }
  }
  return field;
}

export function findAbstractV7(
  _cssNormLines: string[],
  fileContent: string,
): Field {

  const query = "section#main .card-title";
  const [field, maybeAbstract, $] = queryContent(query, fileContent);
  const abstrParent = maybeAbstract.parents()[0];

  const cssNormalParent = makeCssTreeNormalFormFromNode($(abstrParent));
  field.value = getSubtextOrUndef(cssNormalParent);

  return field;
}

// TODO: track how often a rule 'fires' (use log entry which tracks evidence (as a string), and index#)
// TODO: figure out how to review abstract finding filtered by rule/url/author/year/venue/etc
//       : rule    filter=[(/evidence=/) && /meta/ && /@DCTerms/]
//       : url
//       : author
//       : year
//       : venue
// TODO: use titles to help find abstracts
// TODO: expand spidering to crawl sub-frames
// TODO: extract titles, pdf links, author names
// TODO: create REST API for openreview based on html extraction
// TODO: handle multi-metadataLine findInMeta examples
// TODO: maybe expand filtered log handling to automatically comb logs in reverse-creation order, and add a 'compact' function to trim and delete old entries
// TODO: figure out if there is a better html parser for handling both self-closing and script tags properly


export function findAbstractV8(
  _normLines: string[],
  fileContent: string,
): Field {
  const query = "div.content > div > div.row > div.col-md-12";
  const [field, maybeAbstract] = queryContent(query, fileContent);
  const cssNormal = makeCssTreeNormalFormFromNode(maybeAbstract);
  const maybeAbstr = _.takeWhile(
    cssNormal.slice(1),
    l => !l.includes("col-md-12"),
  );
  field.value = getSubtextOrUndef(maybeAbstr);

  return field;
}


export const AbstractPipeline: PipelineFunction[] = [

  //  oxfordscholarship.com
  findInMeta('@description content'),

  // teses.usp.br
  findInMeta('@DCTERMS.abstract content'),

  // spiedigitallibrary.org
  findInMeta('@citation_abstract content'),

  findInMeta('@DC.description content'),

  urlGuard(
    ["bmva.rog"],
    findByLineMatch(
      ["p", "h2", "| Abstract"],
      { lineOffset: -2 }
    ),
  ),

  urlGuard(
    ["easychair.org"],
    findByLineMatch(
      ["h3", "| Abstract", "|"],
      { lineOffset: -1 }
    ),
  ),
  urlGuard(
    ["igi-global.com"],
    findByLineMatch(
      ['span', 'h2', '| Abstract'],
      { lineOffset: 0, evidenceEnd: ['footer'] }
    ),
  ),

  urlGuard(
    ["ijcai.org/Abstract"],
    findByLineMatch(
      ['|', 'p', '|'],
      { lineOffset: -1, lineCount: 1 }
    ),
  ),

  urlGuard(
    ["etheses.whiterose.ac.uk"],
    findByLineMatch(
      ['h2', '| Abstract'],
      { lineOffset: -1 }
    ),
  ),

  urlGuard(
    ["ndss-symposium.org/ndss-paper"],
    findByLineMatch(
      [' +|', ' +p', ' +p', ' +|'],
      { lineOffset: 1 }
    ),
  ),

  urlGuard(
    ["openreview.net"],
    findByLineMatch(
      ['.note-content-field', '| Abstract', '.note-content-value'],
      { lineOffset: 2 }
    ),
  ),

  // www.lrec-conf.org/
  findByLineMatch(['tr', 'td', '| Abstract', 'td']),

  // eccc.weizmann.ac.il/report
  findByLineMatch(['b', '| Abstract', 'br', 'p', '|'], { lineOffset: 3 }),

  findByQuery("div.hlFld-Abstract div.abstractInFull"),
  findByLineMatch(["div #abstract"]),
  findAbstractV2,

  findByLineMatch(["section.*.Abstract", "h2.*.Heading", "Abstract"]),

  findByLineMatch(["div .hlFld-Abstract", "div", "div", "h2"], { lineOffset: 2 }),

  findByLineMatch(["div", "h3.*.label", "Abstract"]),

  findByLineMatch(["div", "strong", "| Abstract"]),

  findByLineMatch(["section .full-abstract", "h2", "| Abstract"]),

  findByLineMatch(
    ["div.*#abstract", "h4", "Abstract"],
    { evidenceEnd: ["div.*#paperSubject", "h4", "Keywords"] }
  ),

  findByLineMatch(
    ['div', 'h4', '| Abstract', 'p'],
    { evidenceEnd: ['div'] }
  ),

  findAbstractV7,
  findAbstractV8,

  findByQuery("div#body > div#main > div#content > div#abstract"),

  findByQuery("div#content-inner > div#abs > blockquote"), //

  findByQuery("div#Abs1-content > p"),
  findByQuery("div.main-container > div > p.abstract"),

  findByQuery("div > div > div.w3-container > p"),

  findByLineMatch(["div.itemprop='about'"]),
  findByLineMatch(["div", "div", "h5", "Abstract", "div"]),
  findByLineMatch(["h3", "ABSTRACT", "p"], { lineOffset: 2 }),

  findByLineMatch(["span.+ContentPlaceHolder.+LabelAbstractPopUp"]),

  findByLineMatch(["div", "article", "section", "h2", "^ +| Abstract", "div", "p"]),

  findByLineMatch(["p #contentAbstract_full", "article", "section", "h2", "^ +| Abstract", "div", "p"]),
  findByLineMatch(['.field-name-field-paper-description']),
  findByLineMatch(["| Abstract", "td itemprop='description'"]),

  // Maybe superceded by the one after
  // findByLineMatch(["Abstract", "section .abstract", "p .chapter-para", "strong", "Summary:"]),
  // findByLineMatch([
  //   "h2.+abstract-title",
  //   "^ +| Abstract",
  //   "section .abstract",
  //   "p .chapter-para"
  // ]),

  findByLineMatch([
    "div .abstract itemprop='description'",
  ]),

  findByLineMatch([
    "section .abstract",
  ]),

  findByLineMatch([
    "div .abstractSection",
    "p"
  ]),
  findByQuery("div.metadata  div.abstract"),
  findByLineMatch([".cPageSubtitle", "| Abstract"], {
    evidenceEnd: [".cPageSubtitle", "| \\w"],
  }),

  findByLineMatch(["^ +p", "^ +b", "^ +| Abstract:"], {
    indentOffset: -2,
    evidenceEnd: ["^ +p", "^ +b"],
  }),

  findByLineMatch(["^ +i", "^ +b", "^ +| Abstract:"], {
    indentOffset: -4,
    evidenceEnd: ["^ +p"],
  }),

  findByLineMatch(["p", "span .subAbstract"]),

];


function extractAbstract(exDir: ExpandedDir, log: BufferedLogger): void {
  const entryBasename = path.basename(exDir.dir);
  log.append(`field.abstract.extract.entry=${entryBasename}`);

  const htmlFiles = exDir.files
    .filter(f => f.endsWith(".html"))
    .map(f => path.resolve(exDir.dir, f));

  _.each(htmlFiles, htmlFile => {
    const extrAbsFilename = `${htmlFile}.ex.abs.json`;
    const metafile = path.resolve(exDir.dir, 'meta');

    if (fs.existsSync(extrAbsFilename)) {
      console.log(
        `skipping: abstracts file already exists: ${extrAbsFilename}`,
      );
      return;
    }

    const metaProps = readMetaFile(metafile);

    if (!metaProps) {
      log.append(`error=NoMetaFileFound`);
      return;
    }

    const { responseUrl, status } = metaProps;
    const fileBase = path.basename(htmlFile);
    log.append(`field.abstract.extract.file=${fileBase}`);
    console.log(`extracting abstract from ${htmlFile}`);

    writeNormalizedHtml(htmlFile);

    const cssNormFile = `${htmlFile}.norm.txt`;

    const htmlContent = readFile(htmlFile);
    const normFileContent = readFile(cssNormFile);

    if (!(htmlContent && normFileContent)) {
      console.log(`.html and .norm.txt did not exist in ${exDir}`);
      return;
    }

    const cssNormalForm = normFileContent.split("\n");

    let resultField: Partial<Field> = {};

    _.each(AbstractPipeline, (pf, pfNum) => {
      const { value, complete } = resultField;
      if (complete || value) return;

      const res: Partial<Field> = pf(cssNormalForm, htmlContent, responseUrl, status);
      if (res.value !== undefined) {
        resultField = res;
        log.append(`field.abstract.extract.method=${pfNum + 1}`);
        log.append(`field.abstract.extract.evidence=${res.evidence || 'undefined'}`);
      }
    });

    if (resultField.value !== undefined) {
      log.append(`field.abstract.extract=true`);
      fs.writeJsonSync(extrAbsFilename, [resultField]);
    } else {
      log.append(`field.abstract.extract=false`);
    }
    return;
  });
}

export function extractAbstractTransformFromScrapy(log: BufferedLogger, env: ReviewEnv): Transform {
  return through.obj(
    (exDir: ExpandedDir, _enc: string, next: (err: any, v: any) => void) => {
      try {
        log.append(`action=extractAbstractTransformFromScrapy`);
        writeDefaultEntryLogs(log, exDir, env);
        extractAbstract(exDir, log);
      } catch (err) {
        console.log(`err ${err}`);
      }
      log.commitLogs();
      return next(null, exDir);
    },
  );
}


// export type ExtractionFunction = (env: ExtractionEnv) => TE.TaskEither<string, ExtractionEnv>;
export const AbstractPipelineUpdate: ExtractionFunction[][] = [

  [
    filterUrl(/ieee.org/),
    runHtmlTidy,
    findInGlobalDocumentMetadata,
  ],
  [
    filterUrl(/ndss-symposium.org\/ndss-paper/),
    runHtmlTidy,
    findByLineMatchTE(
      [' +|', ' +p', ' +p', ' +|'],
      { lineOffset: 1 }
    )
  ],

  [

    //  oxfordscholarship.com
    findInMetaTE('@description content'),
  ]

  // // teses.usp.br
  // findInMeta('@DCTERMS.abstract content'),

  // // spiedigitallibrary.org
  // findInMeta('@citation_abstract content'),

  // findInMeta('@DC.description content'),

  // urlGuard(
  //   ["bmva.rog"],
  //   findByLineMatch(
  //     ["p", "h2", "| Abstract"],
  //     { lineOffset: -2 }
  //   ),
  // ),

  // urlGuard(
  //   ["easychair.org"],
  //   findByLineMatch(
  //     ["h3", "| Abstract", "|"],
  //     { lineOffset: -1 }
  //   ),
  // ),
  // urlGuard(
  //   ["igi-global.com"],
  //   findByLineMatch(
  //     ['span', 'h2', '| Abstract'],
  //     { lineOffset: 0, evidenceEnd: ['footer'] }
  //   ),
  // ),

  // urlGuard(
  //   ["ijcai.org/Abstract"],
  //   findByLineMatch(
  //     ['|', 'p', '|'],
  //     { lineOffset: -1, lineCount: 1 }
  //   ),
  // ),

  // urlGuard(
  //   ["etheses.whiterose.ac.uk"],
  //   findByLineMatch(
  //     ['h2', '| Abstract'],
  //     { lineOffset: -1 }
  //   ),
  // ),

  // urlGuard(
  //   ["ndss-symposium.org/ndss-paper"],
  //   findByLineMatch(
  //     [' +|', ' +p', ' +p', ' +|'],
  //     { lineOffset: 1 }
  //   ),
  // ),

  // urlGuard(
  //   ["openreview.net"],
  //   findByLineMatch(
  //     ['.note-content-field', '| Abstract', '.note-content-value'],
  //     { lineOffset: 2 }
  //   ),
  // ),

];

import { pipe } from 'fp-ts/lib/pipeable';
import * as Arr from 'fp-ts/lib/Array';
import * as TE from 'fp-ts/lib/TaskEither';
// import * as E from 'fp-ts/lib/Either';
// import { fold } from "fp-ts/lib/Monoid";

export interface FieldFinderEnv {
  failures: string[];
  successes: ExtractionEnv[];
}

export function findInGlobalDocumentMetadata(env: ExtractionEnv): TE.TaskEither<string, ExtractionEnv> {
  const { fileContentBuffer } = env;

  const metadataLine = _.filter(
    fileContentBuffer,
    metadataLine => /global.document.metadata/.test(metadataLine)
  )[0];

  const field: Field = {
    name: "abstract",
    evidence: "<todo>",
  };

  if (!metadataLine) {
    return TE.left(`findInGlobalDocumentMetadata: metadata line not found`);
  }


  const jsonStart = metadataLine.indexOf("{");
  const jsonEnd = metadataLine.lastIndexOf("}");
  const lineJson = metadataLine.slice(jsonStart, jsonEnd + 1);
  try {
    const metadataObj = JSON.parse(lineJson);
    const abst = metadataObj["abstract"];
    field.value = abst;
    env.fields.push(field);
    return TE.right(env);
  } catch (e) {
    return TE.left(e.toString());
  }
}


import { isRight } from 'fp-ts/lib/Either'

export const tapWith: (f: (env: ExtractionEnv) => void) => ExtractionFunction =
  f => env => {
    const originalEnv = _.merge({}, env);
    f(env);
    return TE.right(originalEnv);
  };
export async function runAbstractFinders(extractionPipeline: ExtractionFunction[][], entryPath: string): Promise<void> {

  const extractionAttempts: TE.TaskEither<ExtractionEnv, string>[] =
    Arr.array.mapWithIndex(
      extractionPipeline,
      (index: number, exFns: ExtractionFunction[]) => {
        const init: ExtractionEnv = { ...initialEnv, entryPath };
        const introFns = [
          tapWith(() => console.log(`Running attempt-chain ${index}`)),
          runFileVerification(/html/i),
          readMetaProps,
        ];
        const allFns = _.concat(introFns, exFns);
        const inner = bindTasks(init, allFns);
        return pipe(inner, TE.swap);
      });

  const sequenceT = Arr.array.sequence(TE.taskEitherSeq);
  const sadf = await sequenceT(extractionAttempts)();
  if (isRight(sadf)) {
    const errors = sadf.right;
    prettyPrint({ errors });
  } else {
    const { fields } = sadf.left;
    prettyPrint({ fields });
  }
}
