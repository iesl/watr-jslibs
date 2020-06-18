import _, { Dictionary } from "lodash";

import {
  ExpandedDir, expandDirTrans, throughFunc, promisifyReadableEnd,
} from "commons";

import { BufferedLogger, } from "commons";
import { UrlGraph, InputRec } from '~/openreview/workflow';
import pumpify from "pumpify";
import { runInteractiveReviewUI } from '~/qa-review/interactive-ui';
import { scrapyCacheDirs } from './cli-main';
import { initLogger } from '../logging/logging';

export interface ReviewEnv {
  logger: BufferedLogger;
  overwrite: boolean;
  urlGraph: UrlGraph;
  csvLookup: Dictionary<InputRec>;
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
    name: "starts w/non-word",
    precondition: (str) => {
      const strim = str.trim();
      return (/^\W+/i).test(strim);
    },
    run: (str) => {
      const strim = str.trim();
      return strim.replace(/^\W+/i, "");
    }
  },

  {
    name: "clip @ Cite This Paper",
    precondition: (str) => {
      const regex = /Cite This Paper Abstract/i;
      return regex.test(str);
    },
    run: (str) => {
      const regex = /Cite This Paper Abstract/i;
      let [, post] = str.split(regex);
      post = post? post.trim() : '';
      return post;
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
      return str.length < 200;
    },
    run: () => ''
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
    name: "clip before /Graphical abstract Download/",
    precondition: (str) => {
      const regex = /Graphical abstract Download/i;
      return regex.test(str);
    },
    run: (str) => {
      const regex = /Graphical abstract Download/i;
      let [pre,] = str.split(regex);
      pre = pre? pre.trim() : '';
      return pre;
    }
  },

  {
    name: "Catch-alls: e.g., /^Home Page Papers|^Complexity/..",
    precondition: (str) => {
      const regexes = [
        /Home Page Papers/i,
        /Complexity . Journal Menu/,
        /no abstract available/i,
        /^Download.Article/i,
        /Open Access Article/i,
        /For authors For reviewers/,
        /Banner art adapted from/i,
        /a collection of accepted abstracts/i,
      ];
      const strim = str.trim();
      return regexes.some(re => re.test(strim));
    },
    run: () => {
      return '';
    }
  },
  {
    name: "/Home Archives/ >> maybe /Abstract.*/",
    precondition: (str) => {
      const regex = /^Home Archives/;
      const strim = str.trim();
      return regex.test(strim);
    },
    run: (str) => {
      const regex = /Abstract/;
      let [, post] = str.split(regex);
      post = post? post.trim() : '';
      return post;
    }
  },
];


async function reviewAbstractExtraction(logger: BufferedLogger, entryDir: ExpandedDir): Promise<void> {
  await runInteractiveReviewUI({ entryPath: entryDir, logger });
}


export async function runInteractiveFieldReview(
  cacheRoot: string,
  logpath: string,
  // scrapyLog: string,
  // csvFile: string,
): Promise<void> {

  const dirEntryStream = scrapyCacheDirs(cacheRoot);
  const logger = initLogger(logpath, "interactive-review", true);

  try {
    const pipe = pumpify.obj(
      dirEntryStream,
      // sliceStream(0, 20),
      // filterStream((path: string) => /011b8/.test(path)),
      expandDirTrans,
      throughFunc((exDir: ExpandedDir) => {
        return reviewAbstractExtraction(logger, exDir);
      }),
    );

    console.log('starting runAbstractFinderOnScrapyCache');
    return promisifyReadableEnd(pipe)
      .then(() => {
        console.log('finished runAbstractFinderOnScrapyCache');
      })
      .catch(error => {
        console.log('Error: runAbstractFinderOnScrapyCache', error);
      })
    ;

  } catch (error) {
    console.log('runAbstractFinderOnScrapyCache', error);
  }
}

export interface CleaningRuleResult {
  input: string;
  output: string;
  rule: string;
}

export function applyCleaningRules(abstractStr: string): [string, CleaningRuleResult[]] {
  let currentAbstract = abstractStr;
  const cleaningResults: CleaningRuleResult[] = [];
  _.each(CleaningRules, (rule) => {
    if (rule.precondition(currentAbstract)) {
      const cleaned = rule.run(currentAbstract);
      if (cleaned !== currentAbstract) {
        cleaningResults.push({
          input: currentAbstract,
          output: cleaned,
          rule: rule.name
        });
      }
      currentAbstract = cleaned;
    }
  });
  return [currentAbstract, cleaningResults];
}
