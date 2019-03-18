import opts from 'commander';
import * as _ from 'lodash';
import path from "path";
// import fs from "fs-extra";

import { readCorpusEntries } from './corpusRoutes';

function range(val: string): [number, number] {
  const [start, len] = val.split('..').map(Number);
  return [start, len];
}

function asFile(s: string): string {
  const normalPath = path.normalize(s);

  // const exists = fs.existsSync(normalPath);
  // const stat = fs.statSync(normalPath);
  // const isDir = stat.isDirectory();
  return normalPath;
}

opts
  .command('list')
  .option('-c, --corpus <path>', 'corpus root path', asFile)
  .option('-r, --range <rbegin>..<rend>', 'listing offsets', range)
  .action((cmd: any) => {
    const [rbegin, rend] = cmd.range;
    const corpusRoot = cmd.corpus;

    console.log(`listCorpusEntries ${rbegin} - ${rend}`);

    const entries = readCorpusEntries(corpusRoot, rbegin, rend);
    console.log(entries);
  })
;

opts
  .command('split')
  .action((cmd) => {
    console.log('split', cmd);

  })
;

// const corpusRoot =  opts.corpus;

opts.parse(process.argv);
