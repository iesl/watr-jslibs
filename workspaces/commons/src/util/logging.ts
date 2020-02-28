import _ from "lodash";

import {
  createLogger,
  format,
  transports,
  LeveledLogMethod,
  Logger,
} from "winston";

const {combine, timestamp, prettyPrint} = format;
import logform from "logform";

export function newIdGenerator() {
  let currId = -1;
  const nextId = () => {
    currId += 1;
    return currId;
  };
  return nextId;
}

const nextId = newIdGenerator();

const uniqIdFormat = logform.format((info) => {
  info.id = nextId();
  return info;
});

export function progressLogger(logname: string): LeveledLogMethod {
  const logger = createLogger({
    level: "info",
    format: combine(timestamp(), prettyPrint()),
    transports: [
      new transports.File({filename: logname}),
      new transports.Console(),
    ],
  });

  return logger.info;
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
export interface BufferedLogger {
  logger: Logger;
  logBuffer: Loggable[];
  headers: [string, string][];
  append(obj: Loggable): void;
  setHeader(key: string, value: string): void;
  commitLogs(): void;
  commitAndClose(): void;
}

export function initBufferedLogger(logname: string): BufferedLogger {
  return {
    logger: initLogger(logname),
    logBuffer: [],
    headers: [],
    append: function(o: Loggable) {
      this.logBuffer.push(o);
    },
    setHeader: function (key: string, value: string) {
      this.headers.push([key, value]);
    },
    commitLogs: function() {
      const logBuffer = this.logBuffer;
      const hdrs = _.fromPairs(this.headers);
      const logData = {
        ...hdrs,
        logBuffer: [ ...logBuffer ],
      }
      this.logger.info(logData);
      _.remove(logBuffer, () => true);
      _.remove(this.headers, () => true);
    },
    commitAndClose: function() {
      this.commitLogs();
      this.logger.close();
    },
  };
}
