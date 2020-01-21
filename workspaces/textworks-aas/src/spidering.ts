
import prompts from 'prompts';
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';


import { csvToPathTree } from './parse-csv';
import { traverseUrls } from './radix-tree';
import { getHtml } from './get-urls';


type CBFunc = () => Promise<void>;

export function initPaths(csvfile: string, outdir: string) {
  let fns: CBFunc[] = []

  csvToPathTree(csvfile).then((treeObj: any) => {

    traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
      const ask = askUser(url, hashId, treePath, outdir);
      fns = _.concat(fns, ask);
    });
  }).then(async () => {
    const chain = _.chain(fns).reduce(async (acc, action) => {
      return acc.then(action)
        .catch(err => {
          console.log("error: ", err);
        }) ;
    }, Promise.resolve());

    return chain.value()
      .catch((err) => {
        console.log("error: ", err);
      });
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


export async function downloadAll(csvfile: string, outdir: string) {
  const workingDir = path.resolve(outdir);
  const pauseLength = 4 * 1000;

  let fns: CBFunc[] = []

  csvToPathTree(csvfile).then((treeObj: any) => {
    traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
      if (url === 'no_url') {
        console.log(`no url for ${_.join(treePath, ' / ')}`);
      } else {
        const basepathArr = _.concat(treePath, [hashId]);
        const basepath = path.join(workingDir, ...basepathArr);
        const filepath = path.join(basepath, 'download.html');
        const htmlExists = fs.existsSync(filepath);

        if (!htmlExists) {
          console.log(`queuing ${url}`);
          const fn = async () => {
            console.log(`downloading ${url} to ${basepath}`);
            fs.mkdirsSync(basepath);
            await getHtml(url, filepath);
            return new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, pauseLength);
            })
          };
          fns = _.concat(fns, fn);
        } else {
          console.log(`already have ${url} in ${basepath}`);
        }
      }
    });
    return Promise.resolve();
  }).then(async () => {
    const torun = fns.slice(0, 1000);
    console.log(`running ${fns.length} callbacks`);

    const chain = _.chain(torun).reduce(async (acc, action) => {
      return acc.then(action)
        .catch(err => {
          console.log("error0: ", err);
        }) ;
    }, Promise.resolve());

    return chain.value()
      .catch((err) => {
        console.log("error1: ", err);
      });
  });


}


function askUser(url: string, hashId: string, treePath: string[], outdir: string) {
  return async () => {
    const workingDir = path.resolve(outdir);
    const pathstr = _.join(treePath, '/');
    console.log(`working dir: ${workingDir}`);
    console.log(`${pathstr}`);
    console.log(`   url: ${url}`)
    console.log(`   hid: ${hashId}`)
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'What do?',
      choices: [
        { title: 'Download', value: 'download' },
        { title: 'Skip', value: 'skip' },
        { title: 'Quit', value: 'quit' }
      ],
      initial: 0
    })
    switch (response.value) {
      case 'download':
        const basepathArr = _.concat(treePath, [hashId]);
        const basepath = path.join(workingDir, ...basepathArr);
        const filepath = path.join(basepath, 'download.html');
        const exists = fs.existsSync(filepath);
        if (exists) {
          fs.removeSync(filepath);
        }
        console.log(`downloading ${url}`)
        console.log(`    to ${basepath}`)
        fs.mkdirsSync(basepath);
        await getHtml(url, filepath);
        break
      case 'skip':
        break
      case 'quit':
        process.exit();
        break
    }
  }
}

export function runGetHtml(url: string, output: string) {
  console.log(`writing ${url} to ${output}`)
  getHtml(url, output).then(() => {
    const tmp = fs.readFileSync(output);
    const text = tmp.toString();
    console.log(text);
  })
}

import parse5 from 'parse5';
import { Document, TreeAdapter, Node } from 'parse5';

//@ts-ignore
import * as treeAdapter from 'parse5/lib/tree-adapters/default';

import { prettyPrint } from './pretty-print';

type WalkerNode = Node | object;

function walkTree(document: Document, treeAdapter: TreeAdapter, handler: (node: WalkerNode) => void) {

  for (let stack = treeAdapter.getChildNodes(document).slice(); stack.length; ) {
    const node = stack.shift();
    if (node !== undefined) {
      const children = treeAdapter.getChildNodes(node);

      handler(node);

      if (children && children.length) {
        stack = children.concat(stack);
      }
    }
  }
}
export function examineHtml(csvfile: string, outdir: string) {
  const workingDir = path.resolve(outdir);

  csvToPathTree(csvfile).then((treeObj: any) => {
    traverseUrls(treeObj, (_url: string, hashId: string, treePath: string[]) => {

      const basepathArr = _.concat(treePath, [hashId]);
      const basepath = path.join(workingDir, ...basepathArr);
      const filepath = path.join(basepath, 'download.html');
      const exists = fs.existsSync(filepath);
      if (exists) {
        const buf = fs.readFileSync(filepath);
        const fileContent = buf.toString();
        const document = parse5.parse(fileContent);
        walkTree(document, treeAdapter, (node: WalkerNode) => {
          const elem: any = node as any;

          const nname = elem.nodeName;
          const tag = elem.tagName;
          prettyPrint({ nname, tag });

        });

        prettyPrint({ document });
      }
    });
  })
}
