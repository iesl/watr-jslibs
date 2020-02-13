import _ from "lodash";
import pumpify from "pumpify";
import fs from "fs-extra";
import path from "path";

import {
  ExpandedDir,
  expandDir,
} from "~/corpora/corpus-browser";
import { writeDefaultEntryLogs, createFilteredLogStream} from "./qa-logging";
import { sliceStream, initEnv, throughEnvFunc, throughFunc, filterStream, filterEnvStream} from "~/util/stream-utils";
import { BufferedLogger, initBufferedLogger} from "~/util/logging";
import {gatherAbstractFiles} from "~/corpora/bundler";
import {Field} from "~/extract/field-extract";
import { runInteractive } from './qa-interactive';
import {
  createRadix,
  Radix,
  radInsert,
  radGet,
} from "~/util/radix-tree";

interface ReviewArgs {
  corpusRoot: string;
  logpath: string;
  inputlog: string;
  outputlog: string;
  filters?: string[];
}

interface ReviewEnv {
  logger: BufferedLogger;
}

function entryPathToRadPath(entry: string): string[] {
  const base = path.basename(entry);
  const [baseroot] = base.split('.');
  const radpath = baseroot.split('');
  return radpath;
}

async function createResumeFilter(logfile: string): Promise<Radix<boolean>> {
  if (!fs.existsSync(logfile)) return createRadix();

  return new Promise((resolve) => {
    const radFilter = createRadix<boolean>();
    const pipef = pumpify.obj(
      createFilteredLogStream(logfile, []),
      throughFunc((log: any) => {
        const entryPath = log.message.entry;
        const radpath = entryPathToRadPath(entryPath);
        radInsert(radFilter, radpath, true);
      })
    );

    pipef.on("data", () => true);
    pipef.on("end", () => resolve(radFilter));
  });
}

export async function reviewAbstractQuality({
  outputlog,
  inputlog,
  filters,
}: ReviewArgs) {

  // outputlog exists, start from where it left off...
  const radFilter = await createResumeFilter(outputlog);
  const shouldSkip = (entryPath: string) => {
    const radpath = entryPathToRadPath(entryPath);
    const isInFilter = radGet(radFilter, radpath) !== undefined;
    if (isInFilter) {
      console.log(`Skipping filtered ${entryPath}`)
    }
    return !isInFilter;
  };

  const filterREs: RegExp[] =
    filters !== undefined ? filters.map(f => new RegExp(f)) : [];

  const pipef = pumpify.obj(
    createFilteredLogStream(inputlog, filterREs),
    initEnv(() => ({ logger: initBufferedLogger(outputlog) })),
    throughEnvFunc((log: any) => log.message.entry),
    filterEnvStream(shouldSkip),
    throughEnvFunc(expandDir),
    throughEnvFunc(reviewEntry),
  );

  pipef.on("data", () => true);
}

async function reviewEntry(entryDir: ExpandedDir, env: ReviewEnv) {
  const { logger } = env;
  writeDefaultEntryLogs(logger, entryDir);
  await reviewInteractive(logger, entryDir);
  logger.commitAndClose();
}


export interface CleaningRule {
  name: string;
  precondition(str: string): boolean;
  run(str: string): string;

}
const CleaningRules: CleaningRule[] = [
  { name: "starts w/'abstract'",
    precondition: (str) => {
      const strim = str.trim();
      return (/^abstract/i).test(strim);
    },
    run: (str) => {
      const strim = str.trim();
      return strim.replace(/^abstract */i, "");
    }
  },

  { name: "clip @ 'References'",
    precondition: (str) => {
      const regex = /(References|REFERENCES)/;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /(References|REFERENCES).*$/;
      const strim = str.trim();
      return strim.replace(regex, "");
    }
  },

];

type TupleSSN = readonly [string, string, number];

async function reviewInteractive(logger: BufferedLogger, entryDir: ExpandedDir): Promise<void> {
  const abstractFilesWithFields: Array<[string, Field[]]> =
    gatherAbstractFiles(entryDir);

  const abstractStrs: Array<TupleSSN> =
    _(abstractFilesWithFields)
    .flatMap(([filename, fields]) => {
      return _.map(fields, (f, i) => [filename, f.value, i] as TupleSSN)
        .filter(([, v]) => v !== undefined);
    })
    .map(([fn, f, i]) => [fn, f!.trim(), i] as TupleSSN)
    .value();

  if (abstractStrs.length > 0) {
    const [filename, abs, num] = abstractStrs[0];
    return runInteractive({ abstractStr: abs, cleaningRules: CleaningRules, logger });
  }
}
