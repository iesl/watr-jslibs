import _ from 'lodash';

import path from 'path';
import { fileOrDie, dirOrDie, fileOrUndef } from './utils';

import cmds from 'caporal';
import { initCorpus } from './field-extract';
import { prettyPrint } from './pretty-print';
const program = cmds;

program
  .command('re-init', 'tmp command: move old corpus files to better format')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--corpus-root <path>', 'root download path')
  .option('--csv <file>', 'input csv file ', program.STRING)
  .action((_args: any, opts: any, _logger: any) => {
    prettyPrint({ opts, _args });
    const cwd = dirOrDie(opts.cwd);
    const csvfile = path.join(cwd, opts.csv);
    const corpusRoot = dirOrDie(path.join(cwd, opts.corpusRoot));

    initCorpus(csvfile, corpusRoot);
  });


program.parse(process.argv);
