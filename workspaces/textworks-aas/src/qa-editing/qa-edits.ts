import _ from "lodash";
import pumpify from "pumpify";
import fs from "fs-extra";
import path from "path";

import {
  ExpandedDir,
  expandDir,
} from "~/corpora/corpus-browser";

import { writeDefaultEntryLogs, createFilteredLogStream} from "./qa-logging";
import {  initEnv, throughEnvFunc, throughFunc,  filterEnvStream} from "commons";
import { BufferedLogger, initBufferedLogger} from "commons";
import {gatherAbstractFiles} from "~/corpora/bundler";
import {Field} from "~/extract/field-extract";
import { runInteractive } from './qa-interactive';
import {
  createRadix,
  Radix,
  radInsert,
  radGet,
} from "commons";

interface ReviewArgs {
  corpusRoot: string;
  logpath: string;
  inputlog: string;
  outputlog: string;
  filters?: string[];
}

interface ReviewEnv {
  logger: BufferedLogger;
  interactive: boolean;
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
    initEnv<any, ReviewEnv>(() => ({ logger: initBufferedLogger(outputlog), interactive: false })),
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
  if (env.interactive) {
    await reviewInteractive(logger, entryDir);
  } else {
    await reviewNonInteractive(logger, entryDir);
  }
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

  { name: "clip @ 'Keywords'",
    precondition: (str) => {
      const regex = /(Keywords)/;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /(Keywords).*$/;
      const strim = str.trim();
      return strim.replace(regex, "");
    }
  },
  { name: "clip @ 'Full Text: PDF'",
    precondition: (str) => {
      const regex = /(Full Text:).*$/;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /(Full Text:).*$/;
      const strim = str.trim();
      return strim.replace(regex, "");
    }
  },
  { name: "clip @ 'Related Material'",
    precondition: (str) => {
      const regex = /Related Material/;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /Related Material.*$/;
      const strim = str.trim();
      return strim.replace(regex, "");
    }
  },

  { name: "No Abstract Available",
    precondition: (str) => {
      const regex = /no abstract available/i;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: () => {
      return '';
    }
  },

  { name: "clip @ Disqus comments",
    precondition: (str) => {
      const regex = /Comments[\d ]+Comments.*$/i;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /Comments[\d ]+Comments.*$/i;
      const strim = str.trim();
      return strim.replace(regex, "");
    }
  },
  { name: "clip @ trailing tags <.. />",
    precondition: (str) => {
      const regex = /<ETX.*$/i;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /<ETX.*$/i;
      const strim = str.trim();
      return strim.replace(regex, "");
    }
  },
  { name: "clip @ trailing <",
    precondition: (str) => {
      const regex = /<$/i;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /<$/i;
      const strim = str.trim();
      return strim.replace(regex, "");
    }
  },
  { name: "trim extra space",
    precondition: (str) => {
      const regex = /[ ][ ]+/g;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /[ ]+/g;
      const strim = str.trim();
      return strim.replace(regex, " ");
    }
  },
  { name: "remove newlines",
    precondition: () => {
      return true;
    },
    run: (str) => {
      return str.split('\n').join(' ');
    }
  },
  { name: "abstract too short",
    precondition: (str) => {
      return str.length < 120;
    },
    run: (str) => {
      if (str.length < 120) {
        return '';
      }
      return str;
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

async function reviewNonInteractive(logger: BufferedLogger, entryDir: ExpandedDir): Promise<void> {
  const abstractFilesWithFields: Array<[string, Field[]]> =
    gatherAbstractFiles(entryDir);

  const abstractStrs: Array<TupleSSN> =
    _(abstractFilesWithFields)
    .flatMap(([filename, fields]) => {
      return _.map(fields, (f, i) => [filename, f.value, i] as TupleSSN)
        .filter(([, v]) => v !== undefined);
    })
    .map(([fn, f, i]) => {
      const cleaned = applyCleaningRules(f!.trim());
      return [fn, cleaned, i] as TupleSSN;
    })
    .filter(([, f,]) => f!==undefined && f.length > 0)
    .value();

  if (abstractStrs.length > 0) {
    const abs = abstractStrs[0][1];
    logger.append(`field.abstract.value=${abs}`);
  }
}

function applyCleaningRules(abstractStr: string): string {
  let cleanedAbs = abstractStr;
  _.each(CleaningRules, (rule, i) => {
    if (rule.precondition(cleanedAbs)) {
      cleanedAbs = rule.run(cleanedAbs);
    }
  });
  return cleanedAbs.trim();
}
