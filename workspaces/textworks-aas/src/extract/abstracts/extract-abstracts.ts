import _ from "lodash";
import path from "path";
import {
  readMetaProps,
  filterUrl,
  runFileVerification,
  runHtmlTidy,
  initialEnv,
  runCssNormalize,
  runLoadResponseBody,
  // readCachedFile,
  verifyHttpResponseCode,
  readCachedNormalFile,
} from "~/extract/core/field-extract";

import { pipe } from 'fp-ts/lib/pipeable';
import * as Arr from 'fp-ts/lib/Array';
import * as TE from 'fp-ts/lib/TaskEither';
import * as Task from 'fp-ts/lib/Task';
import { isRight, isLeft } from 'fp-ts/lib/Either'

import {
  findByLineMatchTE,
  findInMetaTE,
} from "~/extract/core/field-extract-utils";

import { BufferedLogger, prettyPrint } from "commons";
import { AbstractCleaningRules } from './data-clean-abstracts';
import { ExtractionFunction, Field, ExtractionEnv, resetEnvForAttemptChain, tapWith, bindTasks, applyCleaningRules, bindTasksEAF } from '../core/extraction-process';
import { hasCorpusFile, writeCorpusFile, readCorpusFile } from '~/corpora/corpus-file-walkers';
import { ExtractionLog } from '../core/extraction-records';

export const findInGlobalDocumentMetadata: ExtractionFunction =
  env => {
    // const { fileContentMap, extractionEvidence } = env;
    const { fileContentMap } = env;
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
      // extractionEvidence.push('html-tidy');
      // extractionEvidence.push('global.document.metadata["abstract"]');
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


export const extractionLogName = 'extract-abstract-log.json';

function extractionLogExists(entryPath: string): boolean {
  return hasCorpusFile(entryPath, 'extracted-fields', extractionLogName)
}

export function readExtractionLog(entryPath: string): ExtractionLog | undefined {
  return readCorpusFile(entryPath, 'extracted-fields', extractionLogName)
}

function writeExtractionLog(entryPath: string, content: any): boolean {
  return writeCorpusFile(entryPath, 'extracted-fields', extractionLogName, content);
}

export const skipIfAbstractLogExisits = (entryPath: string): boolean => {
  const exists = extractionLogExists(entryPath);
  if (exists) {
    console.log(`skipping: file ${extractionLogName} already exists`);
  }
  return !exists;
};

export interface ExtractionAppContext {
  log: BufferedLogger;
}

export const extractAbstractTransform =
  async (entryPath: string, ctx: ExtractionAppContext): Promise<void> => {
    const { log } = ctx;
    log.append('action', 'extract-abstract');
    console.log(`starting extraction on ${entryPath}`);

    return runAbstractFinders(AbstractPipelineUpdate, entryPath, log)
      .then(() => writeExtractionLog(entryPath, log.logBuffer))
      .then(() => console.log(`extracted ${entryPath}`))
      .then(() => log.commitLogs());
  };

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


// Run once before any inidiviual rules/attempts
const PipelineLeadingFunctions = [
  // resetEnvForAttemptChain,
  readMetaProps,
  runFileVerification(/(html|xml)/i),
  verifyHttpResponseCode,
  runLoadResponseBody,
  readCachedNormalFile('html-tidy'),
  runHtmlTidy,
  readCachedNormalFile('css-normal'),
  runCssNormalize,
];

// const sequenceArrOfTE = Arr.array.sequence(TE.taskEither);
const sequenceArrOfTask = Arr.array.sequence(Task.task);

export async function runAbstractFinders(
  extractionPipeline: ExtractionFunction[][],
  entryPath: string,
  log: BufferedLogger
): Promise<void> {

  const init: ExtractionEnv = _.merge({}, initialEnv, { entryPath, verbose: false });
  const leadingPipeline = bindTasksEAF(PipelineLeadingFunctions);
  const maybeEnv = await leadingPipeline(init)();

  if (isLeft(maybeEnv)) {
    prettyPrint({ maybeEnv });
    return;
  }
  const leadingEnv = maybeEnv.right;

  const attemptTask = _.map(extractionPipeline, (ep) => {
    const attemptEnv: ExtractionEnv = _.merge({}, leadingEnv);
    const attemptPipeline = bindTasksEAF(ep);
    const foldedEitherToRight = pipe(
      attemptEnv,
      attemptPipeline,
      TE.fold<string, ExtractionEnv, ExtractionEnv>(
        (err: string) => {
          attemptEnv.attemptError = err;
          return () => Promise.resolve(attemptEnv);
        },
        (succ: ExtractionEnv) => () => Promise.resolve(succ)
      )
    );
    return foldedEitherToRight;
  });

  const attemptedTasks = await sequenceArrOfTask(attemptTask)();

  _.each(attemptedTasks, (attempt) => {
    const { fields } = attempt;
    if (fields.length > 0) {
      // prettyPrint({ fields });
      const cleanedFields = _.map(fields, field => {
        const fieldValue = field.value;
        let cleaned: string | undefined = undefined;
        if (fieldValue) {
          const [cleaned0, cleaningRuleResults] = applyCleaningRules(AbstractCleaningRules, fieldValue);
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
  });
}







































export async function runAbstractFindersOldVer(
  extractionPipeline: ExtractionFunction[][],
  entryPath: string,
  log: BufferedLogger
): Promise<void> {
  const entryName = path.basename(entryPath);

  const extractionAttempts: TE.TaskEither<ExtractionEnv, string>[] =
    Arr.array.mapWithIndex(
      extractionPipeline,
      (index: number, exFns: ExtractionFunction[]) => {

        const init: ExtractionEnv = _.merge({}, initialEnv, { entryPath, verbose: true });
        const introFns = [
          resetEnvForAttemptChain,
          readMetaProps,
          runFileVerification(/(html|xml)/i),
          verifyHttpResponseCode,
          runLoadResponseBody,
          readCachedNormalFile('html-tidy'),
          runHtmlTidy,
          readCachedNormalFile('css-normal'),
          runCssNormalize,
        ];
        const outroFns = [
          // modEnv(env => {
          //   env.fileContentMap = {};
          //   let evidence = env.extractionEvidence.join(" ++ ");
          //   evidence = evidence ? `${evidence} ++ ` : '';
          //   const fieldsWithEvidence = env.fields.map(f => {
          //     const allEvidence = `${evidence}${f.evidence}`
          //     f.evidence = allEvidence;
          //     return f;
          //   });
          //   env.fields = fieldsWithEvidence;
          //   return env;
          // }),
          tapWith((env) => console.log(`Completed attempt-chain #${index} for entry ${entryName}; ${env.metaProps.responseUrl}`)),
        ];
        const allFns = _.concat(introFns, exFns, outroFns);
        const inner = bindTasks(init, allFns);
        return pipe(
          inner,
          TE.mapLeft(s => {
            console.log(`Error:`, s);
            return s;
          }),
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
        const [cleaned0, cleaningRuleResults] = applyCleaningRules(AbstractCleaningRules, abs);
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
