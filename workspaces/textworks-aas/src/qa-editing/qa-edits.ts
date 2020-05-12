import _ from "lodash";
import pumpify from "pumpify";
import fs from "fs-extra";
// import path from "path";

import {
  ExpandedDir,
  expandDir,
  // makeCorpusEntryLeadingPath,
} from "commons";

import { writeDefaultEntryLogs, createFilteredLogStream } from "./qa-logging";
import { initEnv, throughEnvFunc, filterEnvStream } from "commons";
import { BufferedLogger, initBufferedLogger } from "commons";
import { gatherAbstractFiles } from "~/corpora/bundler";
import { Field } from "~/extract/field-extract";
import { runInteractive } from './qa-interactive';
// import { getLogEntry } from './qa-stats';

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

export async function cleanAbstracts({
  outputlog,
  inputlog,
  filters,
  // corpusRoot
}: ReviewArgs) {

  const filterREs: RegExp[] =
    filters !== undefined ? filters.map(f => new RegExp(f)) : [];

  const didExtract = /field.abstract.extract=true/;
  filterREs.push(didExtract);

  const pipef = pumpify.obj(
    createFilteredLogStream(inputlog, filterREs),
    initEnv<any, ReviewEnv>(() => ({ logger: initBufferedLogger(outputlog), interactive: false })),
    throughEnvFunc((log: any) => {
      // const { url, noteId, logBuffer } = log.message;
      const { entry  } = log.message;

      // const corpusEntryId = getLogEntry("field.abstract.extract.entry", logBuffer);
      // const leading = makeCorpusEntryLeadingPath(url);
      // const entryPath = path.resolve(corpusRoot, leading, `${noteId}.d`)

      // const propfile = path.join(entry, "entry-props.json");
      // const entryExists = fs.existsSync(entry);
      // const propfileExists = fs.existsSync(propfile);

      // if (entryExists && !propfileExists) {
      //   fs.writeJsonSync(propfile, log.message);
      // }
      return entry;
    }),
    filterEnvStream((path: string) => fs.existsSync(path)),
    throughEnvFunc(expandDir),
    throughEnvFunc(cleanExtractedAbstract),
  );

  pipef.on("data", () => true);
}

async function cleanExtractedAbstract(entryDir: ExpandedDir, env: ReviewEnv) {
  const { logger } = env;
  writeDefaultEntryLogs(logger, entryDir);
  if (env.interactive) {
    await cleanAbstractInteractive(logger, entryDir);
  } else {
    await cleanAbstractNonInteractive(logger, entryDir);
  }
  logger.commitAndClose();
}


export interface CleaningRule {
  name: string;
  precondition(str: string): boolean;
  run(str: string): string;

}
const CleaningRules: CleaningRule[] = [
  {
    name: "starts w/'abstract'",
    precondition: (str) => {
      const strim = str.trim();
      return (/^abstract/i).test(strim);
    },
    run: (str) => {
      const strim = str.trim();
      return strim.replace(/^abstract */i, "");
    }
  },

  {
    name: "clip @ 'References'",
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

  {
    name: "clip @ 'Keywords'",
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
  {
    name: "clip @ 'Full Text: PDF'",
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
  {
    name: "clip @ 'Related Material'",
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

  {
    name: "No Abstract Available",
    precondition: (str) => {
      const regex = /no abstract available/i;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: () => {
      return '';
    }
  },

  {
    name: "clip @ Disqus comments",
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
  {
    name: "clip @ trailing tags <.. />",
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
  {
    name: "clip @ trailing <",
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
  {
    name: "trim extra space",
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
  {
    name: "remove newlines",
    precondition: () => {
      return true;
    },
    run: (str) => {
      return str.split('\n').join(' ');
    }
  },
  {
    name: "abstract too short",
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

async function cleanAbstractInteractive(logger: BufferedLogger, entryDir: ExpandedDir): Promise<void> {
  const abstractFilesWithFields: Array<[string, Field[]]> =
    gatherAbstractFiles(entryDir);

  const abstractStrs: Array<TupleSSN> =
    _(abstractFilesWithFields)
      .flatMap(([filename, fields]) => {
        return _.map(fields, (f, i) => [filename, f.value, i] as TupleSSN)
          .filter(([, v]) => v !== undefined);
      })
      .map(([fn, f, i]) => [fn, f ? f.trim() : "", i] as TupleSSN)
      .value();

  if (abstractStrs.length > 0) {
    const [, abs] = abstractStrs[0];
    return runInteractive({ abstractStr: abs, cleaningRules: CleaningRules, logger });
  }
}

async function cleanAbstractNonInteractive(logger: BufferedLogger, entryDir: ExpandedDir): Promise<void> {
  const abstractFilesWithFields: Array<[string, Field[]]> =
    gatherAbstractFiles(entryDir);

  const abstractStrs: Array<TupleSSN> =
    _(abstractFilesWithFields)
      .flatMap(([filename, fields]) => {
        return _.map(fields, (f, i) => [filename, f.value, i] as TupleSSN)
          .filter(([, v]) => v !== undefined);
      })
      .map(([fn, f, i]) => {
        const cleaned = applyCleaningRules(f ? f.trim() : "");
        return [fn, cleaned, i] as TupleSSN;
      })
      .filter(([, f,]) => f !== undefined && f.length > 0)
      .value();

  if (abstractStrs.length > 0) {
    const abs = abstractStrs[0][1];
    logger.append(`field.abstract.value=${abs}`);
  }
}

function applyCleaningRules(abstractStr: string): string {
  let cleanedAbs = abstractStr;
  _.each(CleaningRules, (rule) => {
    if (rule.precondition(cleanedAbs)) {
      cleanedAbs = rule.run(cleanedAbs);
    }
  });
  return cleanedAbs.trim();
}
