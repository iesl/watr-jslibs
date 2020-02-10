import _ from "lodash";
import pump from "pump";
import path from "path";
import fs from "fs-extra";

import es from "event-stream";
import {createLogger, format, transports, Logger} from "winston";
import logform from "logform";
import urlparse from "url-parse";

import {
  newCorpusEntryStream,
  expandDirTrans,
  ExpandedDir,
} from "~/corpora/corpus-browser";

import {
  prettyPrintTrans,
  tapStream,
  progressCount,
  handlePumpError,
  filterStream,
} from "~/util/stream-utils";

import {gatherAbstractFiles} from "~/corpora/bundler";

function resolveLogfileName(logpath: string, phase: string): string {
  return path.resolve(logpath, logfileName(phase));
}
function logfileName(phase: string): string {
  return `qa-review-${phase}-log.json`;
}

export function newIdGenerator() {
  let currId = -1;
  const nextId = () => {
    currId += 1;
    return currId;
  };
  return nextId;
}

const nextId = newIdGenerator();

const uniqIdFormat = logform.format((info, _opts) => {
  info.id = nextId();
  return info;
});

type Loggable = string | object;
interface BufferedLogger {
  logger: Logger;
  logBuffer: Loggable[];
  append(obj: Loggable): void;
  commitLogs(): void;
}

function initBufferedLogger(logpath: string, phase: string): BufferedLogger {
  return {
    logger: initLogger(logpath, phase),
    logBuffer: [],
    append: function(o: Loggable) {
      this.logBuffer.push(o);
    },
    commitLogs: function() {
      const logBuffer = this.logBuffer;
      this.logger.info({
        logBuffer,
      });
      _.remove(logBuffer, () => true);
    },
  };
}
function initLogger(logpath: string, phase: string): Logger {
  const logname = resolveLogfileName(logpath, phase);
  if (fs.existsSync(logname)) {
    throw new Error(
      `log ${logname} already exists. Move or delete before running`,
    );
  }

  const logger = createLogger({
    level: "info",
    format: format.combine(uniqIdFormat()),
    transports: [
      new transports.File({
        filename: logname,
        format: format.combine(format.timestamp(), format.json()),
      }),
      new transports.File({
        filename: `${logname}.pretty.txt`,
        format: format.combine(format.prettyPrint()),
      }),
    ],
  });

  return logger;
}

// function logStatus(
//   log: Logger,
//   entryDir: ExpandedDir,
//   statusLogs: string[],
// ): void {
//   const entry = entryDir.dir;
//   log.info({
//     entry,
//     statusLogs,
//   });
// }

export function filteredReviewLogStream(
  logpath: string,
  phase: string,
  filters: RegExp[],
): pump.Stream {
  const logfile = resolveLogfileName(logpath, phase);
  const logReader = fs.createReadStream(logfile);

  return pump(
    logReader,
    es.split(),
    es.parse(),

    filterStream((chunk: any) => {
      if (filters.length === 0) return true;

      const statusLogs: string[] = chunk.message.logBuffer;
      return _.every(filters, f => _.some(statusLogs, l => f.test(l)));
    }),
    handlePumpError,
  );
}

function sanityCheckAbstract(log: BufferedLogger, entryDir: ExpandedDir): void {
  const abstractFiles = gatherAbstractFiles(entryDir);
  const abstractStrs = _(abstractFiles)
    .flatMap(([filename, fields]) => {
      return _.map(fields, (f, i) => [filename, f.value, i] as const).filter(
        ([, v]) => v !== undefined,
      );
    })
    .map(([fn, f, i]) => [fn, f!.trim(), i])
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
    let entryStatus = "ok";

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
        log.append(`field.abstract.instance[${filename}:${fieldNum}].length.ok`);
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
  // const statusLogs: string[] = [];

  const propfile = path.join(entryDir.dir, "entry-props.json");
  if (!fs.existsSync(propfile)) return;

  const entryProps = fs.readJsonSync(
    path.join(entryDir.dir, "entry-props.json"),
  );

  // const log.append = (s: string) => log.append(s);

  const dblpId: string = entryProps.dblpConfId;
  const [, , venue, year] = dblpId.split("/");
  const url: string = entryProps.url;
  const urlp = urlparse(url);
  log.append(`entry.url.host=${urlp.host}`);
  log.append(`entry.venue=${venue}`);
  log.append(`entry.venue.year=${year}`);

  sanityCheckAbstract(log, entryDir);

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
}: ReviewCorpusArgs) {
  if (phase === "init") {
    return initReviewCorpus({corpusRoot, logpath});
  }
  return interactiveReviewCorpus({corpusRoot, logpath, phase, prevPhase});
}

export async function interactiveReviewCorpus({
  // corpusRoot,
  logpath,
  // phase,
  prevPhase,
  filters,
}: ReviewCorpusArgs) {
  // const logger = initLogger(logpath, phase);
  // const prevLog = resolveLogfileName(logpath, prevPhase);
  // prettyPrint({prevLog});
  let filterREs: RegExp[] = [];
  if (filters !== undefined) {
    filterREs = filters.map(f => new RegExp(f));
  }

  // const logReader = fs.createReadStream(prevLog);
  const instr = filteredReviewLogStream(logpath, prevPhase, filterREs);

  const pipe = pump(instr, prettyPrintTrans("json"), (err?: Error) => {
    if (err) {
      console.log(`Error:`, err);
    } else {
      console.log(`Done.`);
    }
  });

  pipe.on("data", () => {});
}

function initReviewCorpus({corpusRoot, logpath}: Partial<ReviewCorpusArgs>) {
  const entryStream = newCorpusEntryStream(corpusRoot!);
  const logger = initBufferedLogger(logpath!, "init");
  const reviewFunc = _.curry(reviewEntry)(logger);
  const pipe = pump(
    entryStream,
    // sliceStream(0, 400),
    progressCount(500),
    expandDirTrans,
    // prettyPrintTrans("progress"),
    tapStream(reviewFunc),
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
