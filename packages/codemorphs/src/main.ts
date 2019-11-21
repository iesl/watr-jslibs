import _ from 'lodash';

import {
  setupVueComponent,
} from './refactors';


import commander from 'commander';
const program = new commander.Command();
program.version('0.0.1');

program
  .version('0.0.1')
  .option('-C, --chdir <path>', 'change the working directory')
  .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
  .option('-T, --no-tests', 'ignore test hook');

program
  .command('setup-component <name> <indir>')
  .alias('comp')
  .description('setup vue component')
  .option('-c, --tsconfig <path>', 'path to tsconfig.json for target project')
  .action(function(name: string, root: string, options: any) {
    const tsconfig = options.tsconfig;
    console.log(`vue component setup: tsconfig=${tsconfig}`);
    setupVueComponent(tsconfig, name, root);
  });


program.parse(process.argv);
