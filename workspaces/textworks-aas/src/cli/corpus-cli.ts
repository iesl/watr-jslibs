import _ from 'lodash';

import { dirOrDie } from '~/util/utils';

import cmds from 'caporal';
const program = cmds;

import { prettyPrint } from '~/util/pretty-print';
import { corpusStats } from '~/corpora/corpus-browser';

program
  .command('stats', 'collect some coverage stats')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--corpus-root <path>', 'root download path')
  .action((_args: any, opts: any, _logger: any) => {
    const cwd = dirOrDie(opts.cwd);
    const corpusRoot = dirOrDie(opts.corpusRoot, cwd);
    prettyPrint({ corpusRoot });
    corpusStats(corpusRoot);
  });


program.parse(process.argv);
