import _ from "lodash";
import pump from "pump";
import path from "path";
import fs from "fs-extra";

import es from "event-stream";
import {createLogger, format, transports, Logger} from "winston";
import logform from "logform";

import {
  newCorpusEntryStream,
  expandDirTrans,
  ExpandedDir,
} from "~/corpora/corpus-browser";

import {sliceStream, prettyPrintTrans, tapStream} from "~/util/stream-utils";

import {gatherAbstractRecs} from "~/corpora/bundler";
import {prettyPrint} from "~/util/pretty-print";

function resolveLogfileName(logpath: string, phase: string): string {
  return path.resolve(logpath, logfileName(phase));
}
function logfileName(phase: string): string {
  return `qa-review-${phase}-log.json`;
}

export function newIdGenerator() {
  let currId = -1;
  const nextId = () => {
    currId +=1;
    return currId;
  };
  return nextId;
}

const nextId = newIdGenerator();


const uniqIdFormat = logform.format((info, _opts) => {
  info.id = nextId();
  return info;
});

function initLogger(logpath: string, phase: string): Logger {
  // TODO if log already exists, exit..

  const logname = resolveLogfileName(logpath, phase);
  const logger = createLogger({
    level: "info",
    format: format.combine(
      uniqIdFormat()
    ),
    transports: [
      new transports.File({
        filename: logname,
        format: format.combine(format.timestamp(), format.json()),
      }),
      new transports.Console({
        format: format.combine(format.prettyPrint()),
      }),
    ],
  });

  return logger;
}

// function logStatus(log: Logger, entryDir: ExpandedDir, status: string): void {
//   log.info({
//     status,
//   });
// }
// const writeStatus = _.curry(logStatus)(log, entryDir);

function reviewEntry(log: Logger, entryDir: ExpandedDir) {
  const statusLogs: string[] = [];
  const writeStatus = (s: string) => statusLogs.push(s);
  const abstractRecs = gatherAbstractRecs(entryDir);
  const abstractStrs = abstractRecs
    .map(r => r.value)
    .filter(r => r !== undefined);

  if (abstractRecs.length === 0) {
    // No extraction files exist
    writeStatus("field.abstract.files=false");
  } else if (abstractStrs.length === 0) {
    // no discernable abstracts identified
    writeStatus("field.abstract.instance=false");
  } else {
    // at least one abstract available.
    writeStatus(`field.abstract.instance.count=${abstractStrs.length}`);
    // sanityCheckAbstract()
    //    if startsWith('abstract') 'field.abstract.ok.leadword'
    //    if field.len>40 'field.abstract.ok.length'
    //       else 'field.abstract.not-ok.length'
    //    if field.matches(some-filter-regex-list) 'field.abstract.not-ok.length'
  }

  log.info({
    statusLogs,
  });
}

//
// export async function reviewCorpus(): walk review status logs, filter by status, url, venue
// export async function initCorpusReview: write init status log per entry

interface ReviewCorpusArgs {
  corpusRoot: string;
  logpath: string;
  phase: string;
  prevPhase: string;
}

export async function reviewCorpus({
  corpusRoot,
  logpath,
  phase,
  prevPhase,
}: ReviewCorpusArgs) {
  if (phase === "init") {
    return initReviewCorpus({corpusRoot, logpath});
  }
  return interactiveReviewCorpus({corpusRoot, logpath, phase, prevPhase});
}

async function interactiveReviewCorpus({
  corpusRoot,
  logpath,
  phase,
  prevPhase,
}: ReviewCorpusArgs) {
  const logger = initLogger(logpath, phase);
  const prevLog = resolveLogfileName(logpath, prevPhase);
  prettyPrint({prevLog});

  const logReader = fs.createReadStream(prevLog);

  const pipe = pump(
    logReader,
    es.split(),
    es.parse(),
    prettyPrintTrans("json"),
    (err?: Error) => {
      if (err) {
        console.log(`Error:`, err);
      } else {
        console.log(`Done.`);
      }
    },
  );

  pipe.on("data", () => {});
}

function initReviewCorpus({corpusRoot, logpath}: Partial<ReviewCorpusArgs>) {
  const entryStream = newCorpusEntryStream(corpusRoot!);
  const logger = initLogger(logpath!, "init");
  const reviewFunc = _.curry(reviewEntry)(logger);
  const pipe = pump(
    entryStream,
    sliceStream(0, 10),
    // progressCount(3),
    expandDirTrans,
    tapStream(reviewFunc),
    // prettyPrintTrans("progress"),
    (err?: Error) => {
      if (err) {
        console.log(`Error:`, err);
      } else {
        console.log(`Done.`);
      }
    },
  );

  pipe.on("data", () => {});
}
