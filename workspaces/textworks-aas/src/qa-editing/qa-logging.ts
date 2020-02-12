import _ from "lodash";
import path from "path";
import fs from "fs-extra";
import {Stream} from "stream";
import pumpify from "pumpify";
import es from "event-stream";
import urlparse from "url-parse";

import {initBufferedLogger, BufferedLogger} from "~/util/logging";
import {filterStream} from "~/util/stream-utils";
import {ExpandedDir} from "~/corpora/corpus-browser";

export function resolveLogfileName(logpath: string, phase: string): string {
  return path.resolve(logpath, logfileName(phase));
}

export function logfileName(phase: string): string {
  return `qa-review-${phase}-log.json`;
}

export function initLogger(logpath: string, phase: string, append: boolean = false): BufferedLogger {
  const logname = resolveLogfileName(logpath, phase);
  if (fs.existsSync(logname)) {
    if (!append) {
      throw new Error(
        `log ${logname} already exists. Move or delete before running`,
      );
    }
  }
  return initBufferedLogger(logname);
}

export function writeDefaultEntryLogs(
  log: BufferedLogger,
  entryDir: ExpandedDir,
): void {
  const propfile = path.join(entryDir.dir, "entry-props.json");
  if (!fs.existsSync(propfile)) return;

  const entryProps = fs.readJsonSync(
    path.join(entryDir.dir, "entry-props.json"),
  );

  const dblpId: string = entryProps.dblpConfId;
  const [, , venue, year] = dblpId.split("/");
  const url: string = entryProps.url;
  const urlp = urlparse(url);

  log.setHeader("entry", entryDir.dir);

  log.append(`entry.url.host=${urlp.host}`);
  log.append(`entry.venue=${venue}`);
  log.append(`entry.venue.year=${year}`);
}


export function createFilteredLogStream(
  logfile: string,
  filters: RegExp[],
): Stream {
  const logReader: fs.ReadStream = fs.createReadStream(logfile);

  return pumpify.obj(
    logReader,
    es.split(),
    es.parse(),

    filterStream((chunk: any) => {
      if (filters.length === 0) return true;

      const statusLogs: string[] = chunk.message.logBuffer;
      return _.every(filters, f => _.some(statusLogs, l => f.test(l)));
    }),
  );
}
