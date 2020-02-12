import prompts from "prompts";
import _ from "lodash";
import pumpify from "pumpify";

import {
  newCorpusEntryStream,
  expandDirTrans,
  ExpandedDir,
} from "~/corpora/corpus-browser";
import {initLogger, writeDefaultEntryLogs} from "./qa-logging";
import { progressCount, sliceStream, throughAsyncFunc} from "~/util/stream-utils";
import {BufferedLogger} from "~/util/logging";
import {gatherAbstractFiles} from "~/corpora/bundler";
import {Field} from "~/extract/field-extract";
import { runInteractive } from './qa-interactive';

interface ReviewArgs {
  corpusRoot: string;
  logpath: string;
  phase: string;
  prevPhase: string;
  filters?: string[];
}

export function reviewAbstractQuality({
  corpusRoot,
  logpath,
}: Pick<ReviewArgs, "corpusRoot" | "logpath">) {
  const entryStream = newCorpusEntryStream(corpusRoot);
  const logger = initLogger(logpath, "init", true);
  const reviewFunc = _.curry(reviewEntry)(logger);
  const pipe = pumpify.obj(
    entryStream,
    sliceStream(0, 8),
    progressCount(2),
    expandDirTrans,
    throughAsyncFunc(reviewFunc),
  );

  pipe.on("data", () => {});
}

async function reviewEntry(log: BufferedLogger, entryDir: ExpandedDir) {
  writeDefaultEntryLogs(log, entryDir);
  await reviewInteractive(log, entryDir);
  log.commitLogs();
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

async function reviewInteractive(log: BufferedLogger, entryDir: ExpandedDir): Promise<void> {
  // Display:
  //    abstract
  //    Rules list
  //      - test to apply => rule name
  //    User actions
  //      apply/unapply rule(s)
  //      tag abstract : ok/rules not working/needs new rule/
  //      filter by: url
  const abstractFilesWithFields: Array<[string, Field[]]> = gatherAbstractFiles(
    entryDir,
  );

  const abstractStrs: Array<readonly [string, string, number]> =
    _(abstractFilesWithFields)
    .flatMap(([filename, fields]) => {
      return _.map(fields, (f, i) => [filename, f.value, i] as const)
        .filter(([, v]) => v !== undefined);
    })
    .map(([fn, f, i]) => [fn, f!.trim(), i] as const)
    .value();

  if (abstractStrs.length > 0) {
    const [filename, abs, num] = abstractStrs[0];
    return runInteractive({ abstractStr: abs, cleaningRules: CleaningRules });
  }
}
