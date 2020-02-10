import _ from "lodash";
import pump from "pump";
import path from "path";
import fs from "fs-extra";
import through from "through2";

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
  sliceStream,
  prettyPrintTrans,
  tapStream,
  progressCount,
  handlePumpError,
  filterStream,
} from "~/util/stream-utils";

import {gatherAbstractFiles} from "~/corpora/bundler";
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

function initLogger(logpath: string, phase: string): Logger {
  // TODO if log already exists, exit..



  const logname = resolveLogfileName(logpath, phase);
  if (fs.existsSync(logname)) {
    throw new Error(`log ${logname} already exists. Move or delete before running`);
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

function logStatus(
  log: Logger,
  entryDir: ExpandedDir,
  statusLogs: string[],
): void {
  const entry = entryDir.dir;
  log.info({
    entry,
    statusLogs,
  });
}

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

      const statusLogs: string[] = chunk.message.statusLogs;
      return _.every(filters, f => _.some(statusLogs, l => f.test(l)));
    }),
    handlePumpError,
  );
}

function reviewEntry(log: Logger, entryDir: ExpandedDir) {
  const statusLogs: string[] = [];

  const propfile = path.join(entryDir.dir, "entry-props.json");
  if (!fs.existsSync(propfile)) return;

  const entryProps = fs.readJsonSync(
    path.join(entryDir.dir, "entry-props.json"),
  );

  const writeStatus = (s: string) => statusLogs.push(s);

  const dblpId: string = entryProps.dblpConfId;
  const [, , venue, year] = dblpId.split("/");
  const url: string = entryProps.url;
  const urlp = urlparse(url);
  writeStatus(`entry.url.host=${urlp.host}`);
  writeStatus(`entry.venue=${venue}`);
  writeStatus(`entry.venue.year=${year}`);

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
    writeStatus("field.abstract.files=false");
  } else if (abstractStrs.length === 0) {
    // no discernable abstracts identified
    writeStatus("field.abstract.instance=false");
  } else {
    const uniqAbs = _.uniqBy(abstractStrs, v => v[1]);
    const uniqAbsCount = uniqAbs.length;
    const absCount = abstractStrs.length;
    let entryStatus = "ok";

    writeStatus(`field.abstract.instance.count=${absCount}`);
    if (uniqAbsCount !== absCount) {
      writeStatus(`field.abstract.instance.uniq.count=${uniqAbsCount}`);
    }

    _.each(uniqAbs, ([filename, field, fieldNum]) => {
      let abstractStr = field as string;

      if (abstractStr == undefined) {
        return;
      }
      abstractStr = abstractStr.trim();
      const lowcase = abstractStr.toLowerCase();

      if (abstractStr.length < 40) {
        writeStatus(
          `field.abstract.instance[${filename}:${fieldNum}].length.not-ok`,
        );
      } else {
        writeStatus(
          `field.abstract.instance[${filename}:${fieldNum}].length.ok`,
        );
      }

      if (lowcase.startsWith("abstract")) {
        writeStatus(
          `field.abstract.instance[${filename}:${fieldNum}].startword.ok`,
        );
      }

      const filterExprs = [/abstract[ ]+unavailable/];

      _.each(filterExprs, exp => {
        if (exp.test(lowcase)) {
          writeStatus(
            `field.abstract.instance[${filename}:${fieldNum}].filter[${exp.source}].not-ok`,
          );
        }
      });
    });
  }

  logStatus(log, entryDir, statusLogs);
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
  phase,
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
  const logger = initLogger(logpath!, "init");
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
