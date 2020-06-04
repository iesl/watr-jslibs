import _ from "lodash";

import fs from "fs-extra";

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


export function createConsoleLogger(): Logger {
  return createLogger({
    level: "info",
    format: combine(timestamp(), prettyPrint()),
    transports: [
      new transports.Console(),
    ],
  });
}

export function createFileAndConsoleLogger(logfile: string): Logger {
  const logger = createConsoleLogger();
  const transportA = newFileStreamTransport(logfile);
  logger.add(transportA);
  return logger;
}


export function newFileStreamTransport(logname: string): transports.StreamTransportInstance {
  const logWriteStream = fs.createWriteStream(logname, { flags: 'a' });
  const streamTransport = new transports.Stream({
    stream: logWriteStream,
    format: format.combine(format.timestamp(), format.json()),
  });
  return streamTransport;

}

function initLogger(logname: string): Logger {
  const transportA = newFileStreamTransport(logname);
  transportA.format = format.combine(format.timestamp(), format.json());
  const lognamePretty = `${logname}.pretty.txt`;
  const transportB = newFileStreamTransport(lognamePretty);
  transportB.format = format.combine(format.prettyPrint());

  const logger = createLogger({
    level: "info",
    format: format.combine(uniqIdFormat()),
    transports: [
      transportA,
      transportB,
    ],
  });

  return logger;
}

type MakeTransport = () => LogTransport;

export async function flushAndReopen(
  // logpath: string,
  logger: Logger,
  transportFs: MakeTransport[]
): Promise<void> {
  // logger.pause();
  // logger.cork();

  const allPromises = _(logger.transports)
    .map((trn) => {
      logger.remove(trn);
      return trn;
    })
    .map(trn => {
      if (!trn) return Promise.resolve();

      const endPromise = new Promise((resolve) => {

        trn.on("end", () => {
          console.log('transport end');
        });
        trn.on("close", () => {
          console.log('transport closed');
          // resolve();
        });

        trn.on("finish", () => {
          console.log('transport finished');
          _(transportFs)
            .map(f => f())
            .each(t => logger.add(t));

          // logger.resume();
          // logger.uncork();
          resolve();
        })
        trn.destroy();
      });

      return endPromise;
    })
    .value();

  return Promise.all(allPromises).then(() => undefined);
}

type Loggable = string | any;

/**
 * Maintains logs and headers so that they can be written all together,
 *   as a single Json record
 */
export interface BufferedLogger {
  logger: Logger;
  logBuffer: Loggable[];
  append(obj: Loggable): void;
  commitLogs(): Promise<void>;
  commitAndClose(): Promise<void>;
}

import * as LogTransport from 'winston-transport';

export function initBufferedLogger(
  logname: string,
  transportFs: MakeTransport[]
): BufferedLogger {
  return {
    logger: initLogger(logname),
    logBuffer: [],
    append: function(o: Loggable): void {
      this.logBuffer.push(o);
    },
    commitLogs: function(): Promise<void> {
      const logBuffer = [...this.logBuffer];
      _.remove(this.logBuffer, () => true);

      const logData = {
        logBuffer: [...logBuffer],
      }
      this.logger.info(logData);

      return Promise.resolve();
      // return flushAndReopen(this.logger, transportFs);
    },
    commitAndClose: function(): Promise<void> {
      this.commitLogs();
      const p = promisifyLoggerClose(this.logger);
      this.logger.end();
      return p;
    },
  };
}

export async function promisifyLoggerClose(logger: Logger): Promise<void> {
  return new Promise((resolve) => {
    logger.on('finish', function() {
      resolve();
    });
  });
}
