
import _ from 'lodash';
// import path from "path";
// import fs from "fs-extra";

import {
  // listSrcFiles,
  setupVueComponent,
} from './util/test';


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
  // .option('-r, --root <path>', 'parent directory in which to setup component')
  .action(function(name: string, root: string, options: any) {
    // const path = options.path;
    const tsconfig = options.tsconfig;
    console.log(`vue component setup: tsconfig=${tsconfig}`);
    setupVueComponent(tsconfig, name, root);
  });

// program
//   .command('exec <cmd>')
//   .alias('ex')
//   .description('execute the given remote cmd')
//   .option('-e, --exec_mode <mode>', 'Which exec mode to use')
//   .action(function(cmd: any, options: any) {
//     console.log('exec "%s" using %s mode', cmd, options.exec_mode);
//   }).on('--help', function() {
//     console.log('  Examples:');
//     console.log();
//     console.log('    $ deploy exec sequential');
//     console.log('    $ deploy exec async');
//     console.log();
//   });

// program
//   .command('*')
//   .action(function(env: any) {
//     console.log('deploying "%s"', env);
//   });


program.parse(process.argv);


// // import { readCorpusEntries } from './corpusRoutes';

// // function pp(a: any): string {
// //   return JSON.stringify(a, undefined, 2);
// // }

// function range(val: string): [number, number] {
//   const [start, len] = val.split('..').map(Number);
//   return [start, len];
// }

// function asFile(s: string): string {
//   return path.normalize(s);
// }

// program
//   .command('list')
//   .option('-c, --corpus <path>', 'corpus root path', asFile)
//   .option('-r, --range <rbegin>..<rend>', 'listing offsets', range)
//   .action((cmd: any) => {
//     const [rbegin, rend] = cmd.range;
//     // const corpusRoot = cmd.corpus;

//     console.log(`listCorpusEntries ${rbegin} - ${rend}`);

//     // const entries = readCorpusEntries(corpusRoot, rbegin, rend);
//     // console.log(pp(entries));
//   })
// ;
