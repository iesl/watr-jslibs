import _ from "lodash";

// import { Rect, RectRepr, Shape } from "./shapes";
import * as io from 'io-ts';
// import { either, isRight } from 'fp-ts/lib/Either'
import { Label } from "./transcript";

const LogHeaders = io.type({
  tags: io.string,
  name: io.string,
  callSite: io.string,
  timestamp: io.number
});

export type LogHeaders = io.TypeOf<typeof LogHeaders>;

const LogEntry = io.type({
  headers: LogHeaders,
  body: io.array(Label),
  logType: io.string,
  page: io.number
});

export type LogEntry = io.TypeOf<typeof LogEntry>;

export const Tracelog = io.array(LogEntry);
export type Tracelog = io.TypeOf<typeof Tracelog>;

export interface LogEntryGroup {
  groupKey: string;
  logEntries: LogEntry[];
}

export function groupTracelogsByKey(tracelog: Tracelog): LogEntryGroup[] {
  const keyFunc = (l: LogEntry) => {
    return `p${l.page + 1}. ${l.headers.callSite} ${l.headers.tags}`;
  };

  const keyedLogs = _.map(tracelog, tl => [tl, keyFunc(tl)] as const);

  const groupedLogs = _.groupBy(keyedLogs, ([, key]) => key);
  const groupedLogPairs = _.toPairs(groupedLogs);
  const entryGroups = _.map(groupedLogPairs, ([groupKey, logs]) => {
    return {
      groupKey,
      logEntries: logs.map(([l,]) => l)
    }
  });

  return entryGroups;
}
