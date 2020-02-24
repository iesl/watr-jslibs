//
import _ from "lodash";
import pumpify from "pumpify";
import {
  throughFunc,
  throughAccum,
  progressCount,
} from "~/util/stream-utils";

import {
  createRadix,
  radUpsert,
  Radix,
  radTraverseValues,
} from "~/util/radix-tree";

import { createFilteredLogStream } from './qa-logging';

interface CorpusStats {
  urlCount: number;
  absCount: number;
  missingAbs: number;
}

export function collectAbstractExtractionStats(
  fromLog: string,
  filters?: string[],
) {
  const filterREs: RegExp[] =
    filters !== undefined ? filters.map(f => new RegExp(f)) : [];

  const pipef = pumpify.obj(
    createFilteredLogStream(fromLog, filterREs),
    throughFunc((log: any) => log.message),
    progressCount(1000),
    // sliceStream(0, 10),
    cstats,
  );

  pipef.on("data", (radStats: Radix<CorpusStats>) => {
    // prettyPrint({summary});
    console.log("accumulating stats");

    const accumStats = createRadix<CorpusStats>();

    radTraverseValues(radStats, (path, stats) => {
      // path.pop();
      while (path.length > 0) {
        radUpsert(accumStats, path, accStats => {
          if (accStats) {
            return {
              urlCount: stats.urlCount + accStats.urlCount,
              absCount: stats.absCount + accStats.absCount,
              missingAbs: stats.missingAbs + accStats.missingAbs,
            };
          }
          return stats;
        });
        path.pop();
      }
    });

    const allStats: string[] = [];
    radTraverseValues(accumStats, (path, stats) => {
      const {urlCount, absCount, missingAbs} = stats;
      const venue = _.join(path, " / ").padEnd(24);
      allStats.push(
        `${venue} urls: ${urlCount}; abs# ${absCount}; missing# ${missingAbs}`,
      );
    });
    const sorted = _.sortBy(allStats);

    console.log(_.join(sorted, "\n"));
  });
}

function getLogEntry(key: string, entries: string[]): string | undefined {
  const fs = entries
    .filter(e => e.includes(key))
    .map(e => e.split("="))
    .map(([, v]) => v);

  return fs.length > 0 ? fs[0] : undefined;
}

const cstats = throughAccum<any, Radix<CorpusStats>>(
  (radix: Radix<CorpusStats>, t: any) => {
    const logBuffer: string[] = t.logBuffer;
    // const entryPath: string = t.entry;
    const host = getLogEntry("entry.url.host", logBuffer)!;
    const venue = getLogEntry("entry.venue", logBuffer)!;
    // const numAbstracts = getLogEntry("abstract.instance.count", logBuffer);
    const abstractValue = getLogEntry("field.abstract.value", logBuffer);
    // const hasAbsFiles = getLogEntry("abstract.files=false", logBuffer);

    const absCount = abstractValue === undefined ? 0 : 1;
    const missingAbs = absCount === 1 ? 0 : 1;

    // prettyPrint({ logBuffer, numAbstracts, hasAbsFiles });
    const hostpath = host.split(".").reverse();
    const radpaths = [hostpath, [venue], "00-CORPUS_TOTALS"];
    _.each(radpaths, p => {
      radUpsert(radix, p, (stats?: CorpusStats) => {
        if (stats) {
          return {
            urlCount: stats.urlCount + 1,
            absCount: stats.absCount + absCount,
            missingAbs: stats.missingAbs + missingAbs,
          };
        }
        return {urlCount: 1, absCount, missingAbs};
      });
    });

    return radix;
  },
  createRadix(),
);
