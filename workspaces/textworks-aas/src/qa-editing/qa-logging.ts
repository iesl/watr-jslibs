import _ from "lodash";
import path from "path";
import fs from "fs-extra";
import { Stream } from "stream";
import pumpify from "pumpify";
import urlparse from "url-parse";
import split from 'split';

import { initBufferedLogger, BufferedLogger } from "commons";
import { filterStream } from "commons";
import { ExpandedDir } from "commons";
import { ReviewEnv } from '~/extract/qa-review-abstracts';

export function resolveLogfileName(logpath: string, phase: string): string {
  return path.resolve(logpath, logfileName(phase));
}

export function logfileName(phase: string): string {
  return `qa-review-${phase}-log.json`;
}

export function initLogger(logpath: string, phase: string, append = false): BufferedLogger {
  const logname = resolveLogfileName(logpath, phase);
  if (fs.existsSync(logname)) {
    if (!append) {
      throw new Error(
        `log ${logname} already exists. Move or delete before running`,
      );
    }
  }
  // const fst = () => newFileStreamTransport(logpath)
  return initBufferedLogger(logname);
}

export interface MetaFile {
  url: string;
  responseUrl: string;
  status: number;
}

export function readMetaFile(metafile: string): MetaFile | undefined {
  if (!fs.existsSync(metafile)) return;

  const metaPropsBuf = fs.readFileSync(metafile);
  const metaPropsStr = metaPropsBuf.toString();
  const fixed = _.replace(metaPropsStr, /'/g, '"');
  const metaProps = JSON.parse(fixed);
  const { url, response_url, status } = metaProps;
  return {
    url,
    status,
    responseUrl: response_url,
  };
}

export function writeDefaultEntryLogs(
  log: BufferedLogger,
  entryDir: ExpandedDir,
  env: ReviewEnv,
): void {
  const metafile = path.join(entryDir.dir, "meta");

  log.append('entry.dir', entryDir.dir);
  const metaProps = readMetaFile(metafile);

  if (!metaProps) return;

  const { url, responseUrl } = metaProps;
  const urlp = urlparse(url);
  log.append('entry.url', url);
  log.append('entry.url.host', urlp.host);
  log.append('entry.response_url', responseUrl);
  // get the original url from the meta/csv
  const fallbackUrl = env.csvLookup[url];
  let maybeOriginalUrl = [fallbackUrl];

  const fetchChain = env.urlGraph.getUrlFetchChain(url);
  if (!fallbackUrl) {
    maybeOriginalUrl = _.map(fetchChain, furl => env.csvLookup[furl])
      .filter(d => d !== undefined);
  }

  if (maybeOriginalUrl.length > 0) {
    const originalRec = maybeOriginalUrl[0];
    const { noteId } = originalRec;
    log.append('entry.noteId', noteId);
    log.append('entry.url.original', originalRec.url);
  }
}

export function createFilteredLogStream(
  logfile: string,
  filters: RegExp[],
): Stream {
  const logExists = fs.existsSync(logfile);
  if (!logExists) {
    console.log(`ERROR: no log ${logfile}`);
  }
  const logReader: fs.ReadStream = fs.createReadStream(logfile);

  return pumpify.obj(
    logReader,
    split(JSON.parse),

    filterStream((chunk: any) => {
      if (filters.length === 0) return true;

      const statusLogs: string[] = chunk.message.logBuffer;
      return _.every(filters, f => _.some(statusLogs, l => f.test(l)));
    }),
  );
}

export type ExtractionLog = Record<string, any>;

export interface GroundTruthLog {
  original: ExtractionLog;
  correct: ExtractionLog;
  incorrect: ExtractionLog;
  added: ExtractionLog;
}

export function loadGroundTruthLog(path: string): GroundTruthLog | undefined {
  if (!fs.existsSync(path)) {
    return;
  }
  return fs.readJsonSync(path);
}

export function saveGroundTruthLog(path: string, log: GroundTruthLog): void {
  if (fs.existsSync(path)) {
    fs.removeSync(path);
  }
  fs.writeJsonSync(path, log);
}
export function initGroundTruthLog(extractionLog: ExtractionLog): GroundTruthLog {
  return {
    original: extractionLog,
    correct: {},
    incorrect: {},
    added: {}
  };
}

export function labelGroundTruth(log: GroundTruthLog, entryRE: RegExp, asTrue: boolean): GroundTruthLog {
  const keyValPairs = _.toPairs(log.original);
  const labeled = _.filter(keyValPairs, ([key]) => {
    return entryRE.test(key);
  });
  const labeledRec = _.fromPairs(labeled);
  const toMerge = asTrue ? { correct: labeledRec } : { incorrect: labeledRec };
  const updated = _.merge({}, log, toMerge)
  return updated;
}

export function addGroundTruthRec(log: GroundTruthLog, rec: ExtractionLog): GroundTruthLog {
  return _.merge({}, log, { added: rec })
}
