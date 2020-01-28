
import { createLogger, format, transports, LeveledLogMethod } from 'winston';
const { combine, timestamp, prettyPrint } = format;

export function progressLogger(logname: string): LeveledLogMethod {
  const logger = createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      prettyPrint()
    ),
    transports: [
      new transports.File({ filename: logname }),
      new transports.Console()
    ]
  });

  return logger.info;
}
