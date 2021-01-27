import _ from 'lodash';

import * as io from 'io-ts';
import { Label } from './labels';

const LogHeaders = io.type({
  tags: io.string,
  name: io.string,
  callSite: io.string,
  timestamp: io.number
}, 'LogHeaders');

export type LogHeaders = io.TypeOf<typeof LogHeaders>;
const LogBody = io.union([
  io.array(Label),
  io.array(io.unknown),
], 'LogBody')

const LogEntry = io.type({
  headers: LogHeaders,
  body: LogBody,
  logType: io.string,
  page: io.number
}, 'LogEntry');

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
