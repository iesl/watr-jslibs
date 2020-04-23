import _ from "lodash";

import pumpify from "pumpify";

import {
  corpusEntryStream,
  expandDirTrans,
  ExpandedDir,
} from "commons";


import { tapStream, progressCount, throughFunc } from "commons";

import { gatherAbstractFiles } from "~/corpora/bundler";
import { BufferedLogger } from "commons";
import { extractAbstractTransform } from "~/extract/field-extract-abstract";
import {
  initLogger,
  resolveLogfileName,
  createFilteredLogStream,
  writeDefaultEntryLogs,
} from "./qa-logging";

export function sanityCheckAbstract(log: BufferedLogger, entryDir: ExpandedDir): void {
  const abstractFiles = gatherAbstractFiles(entryDir);
  const abstractStrs = _(abstractFiles)
    .flatMap(([filename, fields]) => {
      return _
        .map(fields, (f, i) => [filename, f.value, i] as const)
        .filter(([, v]) => v !== undefined);
    })
    .map(([fn, f, i]) => [fn, f ? f.trim() : "", i])
    .value();

  if (abstractFiles.length === 0) {
    // No extraction files exist
    log.append("field.abstract.files=false");
  } else if (abstractStrs.length === 0) {
    // no discernable abstracts identified
    log.append("field.abstract.instance=false");
  } else {
    const uniqAbs = _.uniqBy(abstractStrs, v => v[1]);
    const uniqAbsCount = uniqAbs.length;
    const absCount = abstractStrs.length;
    // let entryStatus = "ok";

    log.append(`field.abstract.instance.count=${absCount}`);
    if (uniqAbsCount !== absCount) {
      log.append(`field.abstract.instance.uniq.count=${uniqAbsCount}`);
    }

    _.each(uniqAbs, ([filename, field, fieldNum]) => {
      let abstractStr = field as string;

      if (abstractStr == undefined) {
        return;
      }
      abstractStr = abstractStr.trim();
      const lowcase = abstractStr.toLowerCase();

      if (abstractStr.length < 40) {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].length.not-ok`,
        );
      } else {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].length.ok`,
        );
      }

      if (lowcase.startsWith("abstract")) {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].startword.ok`,
        );
      }

      const filterExprs = [/abstract[ ]+unavailable/];

      _.each(filterExprs, exp => {
        if (exp.test(lowcase)) {
          log.append(
            `field.abstract.instance[${filename}:${fieldNum}].filter[${exp.source}].not-ok`,
          );
        }
      });
    });
  }
}

function reviewEntry(log: BufferedLogger, entryDir: ExpandedDir) {
  try {
    writeDefaultEntryLogs(log, entryDir);
    sanityCheckAbstract(log, entryDir);
  } catch (e) {
    console.log(`Error: `, e);
  }

  log.commitLogs();
}

interface ReviewCorpusArgs {
  corpusRoot: string;
  logpath: string;
  phase: string;
  prevPhase: string;
  filters?: string[];
}

export async function reviewCorpus({
  corpusRoot,
  logpath,
  phase,
  prevPhase,
  filters,
}: ReviewCorpusArgs) {
  if (phase === "init") {
    return initReviewCorpus({ corpusRoot, logpath });
  }
  interactiveReviewCorpus({ corpusRoot, logpath, phase, prevPhase, filters });
}

export async function interactiveReviewCorpus({
  // corpusRoot,
  logpath,
  phase,
  prevPhase,
  filters,
}: ReviewCorpusArgs) {
  const logger = initLogger(logpath, phase);

  const filterREs: RegExp[] =
    filters !== undefined ? filters.map(f => new RegExp(f)) : [];

  const logfile = resolveLogfileName(logpath, prevPhase);

  const pipef = pumpify.obj(
    createFilteredLogStream(logfile, filterREs),
    // Perform some custom action for each log:
    // e.g., run abstract extraction
    throughFunc((log: any) => log.message.entry),
    expandDirTrans,
    extractAbstractTransform(logger),
  );

  pipef.on("data", () => true);
}

function initReviewCorpus({
  corpusRoot,
  logpath,
}: Pick<ReviewCorpusArgs, "corpusRoot" | "logpath">) {
  const entryStream = corpusEntryStream(corpusRoot);
  const logger = initLogger(logpath, "init");
  const reviewFunc = _.curry(reviewEntry)(logger);
  const pipe = pumpify.obj(
    entryStream,
    // sliceStream(0, 100),
    progressCount(500),
    expandDirTrans,
    tapStream(reviewFunc),
  );

  pipe.on("data", () => undefined);
}

export function runAbstractFinder({
  corpusRoot,
  logpath,
}: Pick<ReviewCorpusArgs, "corpusRoot" | "logpath">) {
  const entryStream = corpusEntryStream(corpusRoot);
  const logger = initLogger(logpath, "abstract-finder");
  const pipe = pumpify.obj(
    entryStream,
    progressCount(500),
    expandDirTrans,
    extractAbstractTransform(logger),
  );

  pipe.on("data", () => undefined);
}
