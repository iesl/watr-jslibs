import _ from "lodash";

import {
  createLogger,
  format,
  transports,
  Logger,
} from "winston";

const { combine, timestamp, prettyPrint } = format;
import logform from "logform";
import { newIdGenerator } from './utils';

const nextId = newIdGenerator();

const uniqIdFormat = logform.format((info) => {
  info.id = nextId();
  return info;
});

export function createFileAndConsoleLogger(logfile: string): Logger {
  return createLogger({
    level: "info",
    format: combine(timestamp(), prettyPrint()),
    transports: [
      new transports.File({ filename: logfile }),
      new transports.Console(),
    ],
  });
}

export function createConsoleLogger(): Logger {
  return createLogger({
    level: "info",
    format: combine(timestamp(), prettyPrint()),
    transports: [
      new transports.Console(),
    ],
  });
}

function initLogger(logname: string): Logger {
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

type Loggable = string | object;

/**
 * Maintains logs and headers so that they can be written all together,
 *   as a single Json record
 */
export interface BufferedLogger {
  logger: Logger;
  logBuffer: Loggable[];
  headers: [string, string][];
  append(obj: Loggable): void;
  setHeader(key: string, value: string): void;
  commitLogs(): void;
  commitAndClose(): Promise<void>;
}

export function initBufferedLogger(logname: string): BufferedLogger {
  return {
    logger: initLogger(logname),
    logBuffer: [],
    headers: [],
    append: function(o: Loggable) {
      this.logBuffer.push(o);
    },
    setHeader: function(key: string, value: string) {
      this.headers.push([key, value]);
    },
    commitLogs: function() {
      const logBuffer = this.logBuffer;
      const hdrs = _.fromPairs(this.headers);
      const logData = {
        ...hdrs,
        logBuffer: [...logBuffer],
      }
      this.logger.info(logData);
      _.remove(logBuffer, () => true);
      _.remove(this.headers, () => true);
    },
    commitAndClose: function() {
      const self = this;
      self.commitLogs();
      return promisifyLoggerClose(self.logger);
    },
  };
}

export async function promisifyLoggerClose(logger: Logger): Promise<void> {
  return new Promise((resolve) => {
    logger.on('close', function () {
      // console.log('promisifyLoggerClose: close');
      resolve();
    });
    logger.on('end', function () {
      // console.log('promisifyLoggerClose: end');
    });
    logger.on('finish', function () {
      // console.log('promisifyLoggerClose: finish');
      logger.close();
    });
    logger.end();
  });
}


