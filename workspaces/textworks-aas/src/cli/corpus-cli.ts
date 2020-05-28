import _ from "lodash";

import path from "path";
import yargs from "yargs";
import { arglib } from "commons";

import { runAbstractFinderOnScrapyCache } from "~/qa-editing/qa-review";
import { collectAbstractExtractionStats } from '~/qa-editing/qa-stats';
import { pruneCrawledFromCSV } from '~/openreview/workflow';

const { opt, config } = arglib;

yargs.command(
  "openreview-prune-csv",
  "remove records from csv that have already been spidered",
  config(
    opt.cwd,
    opt.existingFile("scrapyLog: ..."),
    opt.existingFile("csv: ..."),
  ),
  (opts: any) => {
    const { scrapyLog, csv } = opts;
    Promise.all([
      pruneCrawledFromCSV(scrapyLog, csv)
    ]).then(() => {
      console.log('done');
    })
  },
);


yargs.command(
  "write-abstracts-to-file",
  "gather all of the abstracts that have been extracted and write them to a single json file",
  config(
    opt.cwd,
    opt.existingDir("corpus-root: root directory for corpus files"),
  ),
  (args: any) => {

    const { corpusRoot } = args;
    const fromLogFile = 'qa-review-abstract-cleaner-log.json';
    const fromLog = path.resolve(corpusRoot, fromLogFile);
    const toFile = path.resolve(corpusRoot, 'all-abstracts.json');
    const filters: string[] = [];

    collectAbstractExtractionStats(
      fromLog, toFile, filters
    ).then(() => {
      console.log('done');
    });
  },
);

yargs.command(
  "find-abstracts-in-cache",
  "run the abstract field extractors over htmls in corpus",
  config(
    opt.cwd,
    opt.existingDir("corpus-root: root directory for corpus files"),
  ),
  (args: any) => {

    const { corpusRoot } = args;
    const scrapyLog = path.resolve(corpusRoot, 'crawler.log');
    const logpath = corpusRoot;
    const csvFile = path.resolve(corpusRoot, 'dblp_urls.csv');

    runAbstractFinderOnScrapyCache(
      corpusRoot,
      logpath,
      scrapyLog,
      csvFile,
    ).then(() => {
      console.log('done');
    });
  },
);
