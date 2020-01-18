//
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';

import { getHtml } from './get-urls';
import { csvToPathTree, printSummary, traverseObject } from './parse-csv';
import {prettyPrint} from  './pretty-print';

import cmds from 'caporal';
const program = cmds;

program
  .command('load', 'load csv and report some info')
  .argument('<file>', 'csv file name')
  .action((args: any, _opts: any, _logger: any) => {
    loadcsv(args.file)
  });

program
  .command('init-paths', 'create dir structure for html/pdf downloads')
  .argument('<file>', 'csv file name')
  .action((args: any, _opts: any, _logger: any) => {
    initPaths(args.file)
  });

program
  .command('get', 'get html')
  .argument('<url>', 'url to fetch')
  .argument('<output>', 'output file')
  .action((args: any, _opts: any, _logger: any) => {
    runGetHtml(args.url, args.output);
  });



function runGetHtml(url: string, output: string) {
  console.log(`writing ${url} to ${output}`)
  getHtml(url, output).then(() => {
    const tmp = fs.readFileSync(output);
    const text = tmp.toString();
    console.log(text);
  })
}

function loadcsv(csvfile: string) {
  csvToPathTree(csvfile).then((treeObj: any) => {
    printSummary(treeObj);
  });
}

const traverseUrls = (accObj: any, fn: (url: string, hid: string, treePath: string[]) => void) => {
  console.log('traverseUrls; ');

  traverseObject((currObj, currPath) => {

    console.log('    p=', currPath);
    if (_.isArray(currObj)) {
      console.log('   isArray: ', currObj);
      _.each(currObj, ([url, hashId]) => {
        console.log('        url=', url);
        console.log('        hid=', hashId);
        fn(url, hashId, currPath);
      });
    }
  }, accObj);
}

import prompts from 'prompts';

type CBFunc = () => Promise<void>;

function initPaths(csvfile: string) {
    let fns: CBFunc[] = []
    let urlnum = 0;

    csvToPathTree(csvfile).then((treeObj: any) => {
      // prettyPrint({ treeObj });

      traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
        if (0 <= urlnum && urlnum < 5) {
          const ask = askUser(url, hashId, treePath);
          fns = _.concat(fns, ask);
        }
        urlnum += 1;
      });
    }).then(async () => {
      // console.log(`fns = ${fns}`);
      try {
        const chain = _.chain(fns).reduce(async (acc, action) => {
          return acc.then(action)
            .catch(err => {
              console.log("error: ", err);
            }) ;
        }, Promise.resolve());

        await chain.value()
          .catch((err) => {
            console.log("error: ", err);
          });
      } catch (err) {
        console.log("error: ", err);
      }
    }).catch(err => {
      console.log("error: ", err);
    });

	process.on('exit' , () => {
		console.log( '>>> exit' ) ;
	}) ;

	process.once( 'beforeExit' , () => {
		console.log( '>>> beforeExit' ) ;
	}) ;
}

function askUser(url: string, hashId: string, treePath: string[]) {
  return async () => {
    const pathstr = _.join(treePath, '/');
    console.log(`${pathstr}`);
    console.log(`   url: ${url}`)
    console.log(`   hid: ${hashId}`)
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'What do?',
      choices: [
        { title: 'Download', value: 'download' },
        { title: 'Print', value: 'print' },
        { title: 'Quit', value: 'quit' }
      ],
      initial: 0
    })
    switch (response.value) {
      case 'download':
        const fullpath = _.concat(treePath, [hashId, 'downloaded.html']);
        const downloadPath = path.join(...fullpath);
        console.log(`downloading ${url}`)
        console.log(`    to ${downloadPath}`)
        // fs.mkdirsSync()
        // await getHtml(url, output);
        break
      case 'skip':
        break
      case 'quit':
        process.exit();
        break
    }
  }
}

program.parse(process.argv);
