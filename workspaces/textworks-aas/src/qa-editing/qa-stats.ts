//
import _ from "lodash";
import pumpify from "pumpify";
import fs from "fs-extra";

import {
  throughFunc,
  throughAccum,
} from "commons";

import { createFilteredLogStream } from './qa-logging';
import { streamUtils } from 'commons';
const  { promisifyReadableEnd } = streamUtils;

export async function collectAbstractExtractionStats(
  fromLog: string,
  tofile: string,
  filters?: string[],
): Promise<void> {
  const filterREs: RegExp[] =
    filters !== undefined ? filters.map(f => new RegExp(f)) : [];

  filterREs.push(/field.abstract.value=/);

  const pipef = pumpify.obj(
    createFilteredLogStream(fromLog, filterREs),
    throughFunc((log: any) => log.message),
    writeAbstracts
  );

  pipef.on("data", (data: any[]) => {
    console.log(`write abstracts to ${tofile}`);
    fs.writeJsonSync(tofile, data);
  });
  return promisifyReadableEnd(pipef);
}

export function getLogEntry(key: string, entries: string[]): string | undefined {
  const fs = entries
    .filter(e => e.includes(key))
    .map(e => e.split("="))
    .map(([, v]) => v);

  return fs.length > 0 ? fs[0] : undefined;
}

const writeAbstracts = throughAccum<any, any[]>(
  (accum: any[], t: any) => {
    const logBuffer: string[] = t.logBuffer;
    const noteId = getLogEntry("entry.noteId", logBuffer);
    const abstractValue = getLogEntry("field.abstract.value", logBuffer);
    const res = {
      noteId,
      fields: [
        {
          name: "abstract",
          value: abstractValue
        }
      ]
    };

    return _.concat(accum, res);
  },
  []
);
