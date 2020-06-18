import _ from "lodash";
import path from "path";
import { Transform } from "stream";
import through from "through2";
import {
  Field,
  ExtractionFunction,
  readMetaProps,
  filterUrl,
  runFileVerification,
  runHtmlTidy,
  initialEnv,
  ExtractionEnv,
  bindTasks,
  runCssNormalize,
  runLoadResponseBody,
  resetEnvForAttemptChain,
  tapWith,
  modEnv,
  readCachedFile,
  verifyHttpResponseCode,
} from "~/extract/core/field-extract";

// import { makeCssTreeNormalFormFromNode } from "./reshape-html";
import fs from "fs-extra";

import { pipe } from 'fp-ts/lib/pipeable';
import * as Arr from 'fp-ts/lib/Array';
import * as TE from 'fp-ts/lib/TaskEither';
import { isRight } from 'fp-ts/lib/Either'

import {
  // getSubtextOrUndef,
  // queryContent,
  findByLineMatchTE,
  findInMetaTE,
} from "~/extract/core/field-extract-utils";

import { BufferedLogger, ExpandedDir } from "commons";
import { ExtractionLog } from '../core/extraction-records';
import { ReviewEnv, applyCleaningRules } from './data-clean-abstracts';
import { writeDefaultEntryLogs } from '../logging/logging';

export const findInGlobalDocumentMetadata: ExtractionFunction =
  env => {
    const { fileContentMap, extractionEvidence } = env;
    const fileContent = fileContentMap['html-tidy'];
    if (!fileContent) {
      return TE.left('findInMetaTE');
    }
    const fileContentLines = fileContent.lines;

    const metadataLine = _.filter(
      fileContentLines,
      metadataLine => /global.document.metadata/.test(metadataLine)
    )[0];

    if (!metadataLine) {
      return TE.left(`findInGlobalDocumentMetadata: metadata line not found`);
    }

    const jsonStart = metadataLine.indexOf("{");
    const jsonEnd = metadataLine.lastIndexOf("}");
    const lineJson = metadataLine.slice(jsonStart, jsonEnd + 1);
    try {
      const field: Field = {
        name: "abstract",
        evidence: "",
      };
      const metadataObj = JSON.parse(lineJson);
      const abst = metadataObj["abstract"];
      field.value = abst;
      env.fields.push(field);
      extractionEvidence.push('html-tidy');
      extractionEvidence.push('global.document.metadata["abstract"]');
      return TE.right(env);
    } catch (e) {
      return TE.left(e.toString());
    }
  };


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


export function loadExtractionLog(entryPath: string): ExtractionLog {
  const extractionArtifacts = path.resolve(entryPath, 'extraction-artifacts');
  const extractionLog = path.resolve(extractionArtifacts, 'extract-abstract-log.json');
  const log = fs.readJsonSync(extractionLog);
  return log;
}

export function extractAbstractTransformFromScrapy(log: BufferedLogger, env: ReviewEnv): Transform {
  return through.obj(
    async (exDir: ExpandedDir, _enc: string, next: (err: any, v: any) => void) => {
      log.append('action', 'extract-abstract');
      writeDefaultEntryLogs(log, exDir, env);

      const extractionArtifacts = path.resolve(exDir.dir, 'extraction-artifacts');
      const artifactDirExists = fs.existsSync(extractionArtifacts);
      if (env.overwrite && artifactDirExists) {
        fs.emptyDirSync(extractionArtifacts);
      }
      if (!artifactDirExists) {
        fs.mkdirSync(extractionArtifacts);
      }
      const extractionContent = fs.readdirSync(extractionArtifacts);
      if (extractionContent.length > 0) {
        console.log(`skipping already-processed`);
        return log.commitLogs()
          .then(() => next(null, exDir));
      }
      return runAbstractFinders(AbstractPipelineUpdate, exDir.dir, log)
        .then(() => {
          const logBuffer = log.logBuffer;
          const extractionLog = path.resolve(extractionArtifacts, 'extract-abstract-log.json');
          fs.writeJsonSync(extractionLog, logBuffer);
        })
        .then(() => log.commitLogs())
        .then(() => next(null, exDir));
    },
  );
}

export const AbstractPipelineUpdate: ExtractionFunction[][] = [

  [findInMetaTE('@description content')],
  [findInMetaTE('@DCTERMS.abstract content')],
  [findInMetaTE('@citation_abstract content')],
  [findInMetaTE('@abstract content')],
  [findInMetaTE('@DC.[Dd]escription content')],
  [findInMetaTE("prop='og:description'")],

  [
    filterUrl(/bmva.rog/),
    findByLineMatchTE(
      ["p", "h2", "| Abstract"],
      { lineOffset: -2 }
    )
  ], [
    filterUrl(/easychair.org/),
    findByLineMatchTE(
      ["h3", "| Abstract", "|"],
      { lineOffset: -1 }
    )
  ],
  [
    filterUrl(/igi-global.com/),
    findByLineMatchTE(
      ['span', 'h2', '| Abstract'],
      { lineOffset: 0, evidenceEnd: ['footer'] }
    )
  ], [
    filterUrl(/ijcai.org\/Abstract/),
    findByLineMatchTE(
      ['|', 'p', '|'],
      { lineOffset: -1, lineCount: 1 }
    )
  ], [
    filterUrl(/etheses.whiterose.ac.uk/),
    findByLineMatchTE(
      ['h2', '| Abstract'],
      { lineOffset: -1 }
    )
  ], [
    filterUrl(/ndss-symposium.org\/ndss-paper/),
    findByLineMatchTE(
      [' +|', ' +p', ' +p', ' +|'],
      { lineOffset: 1 }
    )
  ], [
    filterUrl(/openreview.net/),
    findByLineMatchTE(
      ['.note-content-field', '| Abstract', '.note-content-value'],
      { lineOffset: 2 }
    )
  ], [
    filterUrl(/ieee.org/),
    findInGlobalDocumentMetadata,
  ],

  // 13. www.lrec-conf.org/
  [findByLineMatchTE(['tr', 'td', '| Abstract', 'td'])],

  // eccc.weizmann.ac.il/report
  [findByLineMatchTE(['b', '| Abstract', 'br', 'p', '|'], { lineOffset: 3 })],

  // [ findByQuery("div.hlFld-Abstract div.abstractInFull")],
  [findByLineMatchTE(["div #abstract"])],

  // // [ findAbstractV2, ]

  [findByLineMatchTE(["section.*.Abstract", "h2.*.Heading", "Abstract"])],

  [findByLineMatchTE(["div .hlFld-Abstract", "div", "div", "h2"], { lineOffset: 2 })],

  [findByLineMatchTE(["div", "h3.*.label", "Abstract"])],

  [findByLineMatchTE(["div", "strong", "| Abstract"])],

  [findByLineMatchTE(["section .full-abstract", "h2", "| Abstract"])],

  [findByLineMatchTE(
    ["div.*#abstract", "h4", "Abstract"],
    { evidenceEnd: ["div.*#paperSubject", "h4", "Keywords"] }
  )],

  [findByLineMatchTE(
    ['div', 'h4', '| Abstract', 'p'],
    { evidenceEnd: ['div'] }
  )],
  // 23.
  [findByLineMatchTE(["div.itemprop='about'"])],
  [findByLineMatchTE(["div", "div", "h5", "Abstract", "div"])],
  [findByLineMatchTE(["h3", "ABSTRACT", "p"], { lineOffset: 2 })],

  [findByLineMatchTE(["h3", "| Abstract", "p .abstract"], { lineOffset: 0 })],

  [findByLineMatchTE(["span.+ContentPlaceHolder.+LabelAbstractPopUp"])],
  [findByLineMatchTE(["div", "article", "section", "h2", "^ +| Abstract", "div", "p"])],
  [findByLineMatchTE(["p #contentAbstract_full", "article", "section", "h2", "^ +| Abstract", "div", "p"])],
  [findByLineMatchTE(['.field-name-field-paper-description'])],
  [findByLineMatchTE(["| Abstract", "td itemprop='description'"])],

  [findByLineMatchTE(["div .abstract itemprop='description'"])],
  [findByLineMatchTE(["section .abstract"])],
  [findByLineMatchTE(["div .abstractSection", "p"])],

  // [ findByQuery("div.metadata  div.abstract")],
  [
    findByLineMatchTE(
      [".cPageSubtitle", "| Abstract"],
      { evidenceEnd: [".cPageSubtitle", "| \\w"], }
    )
  ],

  [
    findByLineMatchTE(
      ["^ +p", "^ +b", "^ +| Abstract:"],
      { indentOffset: -2, evidenceEnd: ["^ +p", "^ +b"], }
    )
  ],

  [
    findByLineMatchTE(
      ["^ +i", "^ +b", "^ +| Abstract:"],
      { indentOffset: -4, evidenceEnd: ["^ +p"] }
    )
  ],

  [findByLineMatchTE(["p", "span .subAbstract"])],
];

export async function runAbstractFinders(
  extractionPipeline: ExtractionFunction[][],
  entryPath: string,
  log: BufferedLogger
): Promise<void> {
  const entryName = path.basename(entryPath);

  const extractionAttempts: TE.TaskEither<ExtractionEnv, string>[] =
    Arr.array.mapWithIndex(
      extractionPipeline,
      (index: number, exFns: ExtractionFunction[]) => {
        const init: ExtractionEnv = _.merge({}, initialEnv, { entryPath });
        const introFns = [
          resetEnvForAttemptChain,
          readMetaProps,
          runFileVerification(/(html|xml)/i),
          verifyHttpResponseCode,
          runLoadResponseBody,
          readCachedFile('html-tidy'),
          runHtmlTidy,
          readCachedFile('css-normal'),
          runCssNormalize,
        ];
        const outroFns = [
          modEnv(env => {
            env.fileContentMap = {};
            let evidence = env.extractionEvidence.join(" ++ ");
            evidence = evidence ? `${evidence} ++ ` : '';
            const fieldsWithEvidence = env.fields.map(f => {
              const allEvidence = `${evidence}${f.evidence}`
              f.evidence = allEvidence;
              return f;
            });
            env.fields = fieldsWithEvidence;
            return env;
          }),
          tapWith((env) => console.log(`Completed attempt-chain #${index} for entry ${entryName}; ${env.metaProps.responseUrl}`)),
        ];
        const allFns = _.concat(introFns, exFns, outroFns);
        const inner = bindTasks(init, allFns);
        return pipe(
          inner,
          TE.swap,
        );
      });

  const sequenceT = Arr.array.sequence(TE.taskEither);
  const allAttempts = await sequenceT(extractionAttempts)();
  if (isRight(allAttempts)) {
    const errors = allAttempts.right;
    const fatalErrors = _.filter(errors, err => /^FATAL/.test(err));
    if (fatalErrors.length > 0) {
      const uniqFatal = _.uniq(fatalErrors);
      const loggableErrors = uniqFatal.join("; ");
      log.append('field.extract.errors', loggableErrors);
    } else {
      log.append('field.found', false);
    }
    console.log(`No extracted abstract for ${entryName}`)
  } else {
    const { fields } = allAttempts.left;
    const cleanedFields = _.map(fields, field => {
      const abs = field.value;
      let cleaned: string | undefined = undefined;
      if (abs) {
        const [cleaned0, cleaningRuleResults] = applyCleaningRules(abs);
        cleaned = cleaned0;
        if (cleaningRuleResults.length > 0) {
          field.cleaning = cleaningRuleResults;
        }
      }
      if (cleaned && cleaned.length > 0) {
        field.value = cleaned;
      } else {
        field.value = undefined;
      }
      return field;
    });
    log.append('field.list', cleanedFields);
  }
}
