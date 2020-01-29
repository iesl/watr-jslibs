import _ from 'lodash';

import path from 'path';
import { fileOrDie, dirOrDie, fileOrUndef } from '~/util/utils';

import cmds from 'caporal';
import { initCorpus } from '~/extract/field-extract';
import { prettyPrint } from '~/util/pretty-print';
import { writeExtractedFieldsToCorpus } from '~/corpora/bundler';
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



program
  .command('write-data', 'tmp cmd')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--corpus-root <path>', 'root download path')
  .option('--logfile <file>', 'input log file ', program.STRING)
  .option('--csv <file>', 'input csv file ', program.STRING)
  .action((_args: any, opts: any, _logger: any) => {
    const cwd = dirOrDie(opts.cwd);
    const logfile = fileOrDie(opts.logfile, cwd);
    const csvfile = fileOrDie(opts.csv, cwd);
    const corpusRoot = dirOrDie(opts.corpusRoot, cwd);
    prettyPrint({ cwd, logfile, csvfile, corpusRoot });

    // packageData(csvfile, logfile);
    writeExtractedFieldsToCorpus(csvfile, logfile).then(() => {
      console.log('program: done');
    });


  });

program
  .command('stream-corpus', 'skeletal command to demo streaming through all entries in a file-base corpus')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--corpus-root <path>', 'root download path')
  .action((_args: any, opts: any, _logger: any) => {
    prettyPrint({ opts, _args });
    const cwd = dirOrDie(opts.cwd);
    const corpusRoot = dirOrDie(path.join(cwd, opts.corpusRoot));



  });


program.parse(process.argv);
