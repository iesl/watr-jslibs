
import prompts from 'prompts';
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';


import { csvToPathTree } from './parse-csv';
import { traverseUrls } from './radix-tree';
import { getHtml } from './get-urls';

type CBFunc = () => Promise<void>;

/**
 * TODO: Get all unspidered htmls, find abstracts
 *   - create a root-level status document to record spidering/extraction state
 *     entry:  { key, statusRecords: [ status.record ] }
 *     key: { url, noteId, dblpId }
 *     status-record: { type: 'extract', field: 'abstract', code: 'error|success'}
 *                  : { type: 'spider', code: 'ok'}
 */


export async function interactiveSpiderViaFF(recJson: string, _outdir: string) {
  const tmp = fs.readFileSync(recJson);
  const asJson: any[] = JSON.parse(tmp.toString());

  const driver = await initBrowser();
  runMapThenables(asJson, async (rec: any) => {
    const url: string = rec.url;

    if (url.includes('ieeexplore') || url.includes('no_url')) {
      console.log(`skipping ieeexplore: ${url}`)
      return;
    }
    const basepath = rec.path;
    const filepath = path.join(basepath, 'download.html');

    const exists = fs.existsSync(filepath);
    if (exists) {
      fs.removeSync(filepath);
    }
    const response = await promptToFetch(url, driver);
    console.log(`downloading ${url}`)
    console.log(`    to ${filepath}`)
    console.log(`    replaced: ${exists}`)
    fs.mkdirsSync(basepath);
    fs.writeFileSync(filepath, response);
  });

}

export function interactiveSpider(csvfile: string, outdir: string) {
  let fns: CBFunc[] = []

  csvToPathTree(csvfile).then((treeObj: any) => {

    traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
      const ask = askToContinueDownload(url, hashId, treePath, outdir);
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
}


export async function spiderAll(csvfile: string, outdir: string) {
  const workingDir = path.resolve(outdir);
  const pauseLength = 2 * 1000;

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
    const torun = fns; // .slice(0, 1000);
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


function askToContinueDownload(url: string, hashId: string, treePath: string[], outdir: string) {
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

import { Builder, WebDriver } from 'selenium-webdriver';
import { runMapThenables } from './utils';


export async function initBrowser() {
  return new Builder().forBrowser('firefox').build();
}

export async function getPageHtml(driver: WebDriver, url: string): Promise<string|undefined> {
  /// need special rule handling for various page types...
  // e.g., ieeexplore.ieee.org
  //    class='row result-item'


  // await driver.get(url).then(() => driver.sleep(3*1000))
  return driver.get(url)
    .then(() => driver.getPageSource())
    .catch(err => {
      console.log(`error in getPageHtml: ${err}`);
      return undefined;
    });
}


export async function waitFor(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms)
  })
}
// function promptToFetch(url: string, hashId: string, treePath: string[], outdir: string) {
let usePrompt = true;
async function promptToFetch(url: string, driver: WebDriver): Promise<string|undefined> {
  const pauseLength = 2 * 1000;

  async function doFetch(): Promise<string|undefined> {
    return getPageHtml(driver, url);
  }

  if (!usePrompt) {
    console.log(`> ${url}`);
    return waitFor(pauseLength).then(doFetch);
  }

  const response = await prompts({
    type: 'select',
    name: 'value',
    message: `view: ${url}`,
    choices: [
      { title: 'Download', value: 'download' },
      { title: 'Skip', value: 'skip' },
      { title: 'All', value: 'all' },
      { title: 'Quit', value: 'quit' }
    ],
    initial: 0
  })
  switch (response.value) {
    case 'download':
      return getPageHtml(driver, url);
    case 'skip':
      break;
    case 'all':
      usePrompt = false;
      return getPageHtml(driver, url);
    case 'quit':
      await driver.quit();
      process.exit();
  }
  return;
}

export async function fetchViaFirefox(urlFile: string, _outdir: string) {
  const exists = fs.existsSync(urlFile);
  if (! exists) {
    console.log(`Exiting: file ${urlFile} doesn't exist.`)
    return Promise.resolve();
  }

  const urlBuf = fs.readFileSync(urlFile);
  const urls = urlBuf.toString().split('\n').map(l => l.trim()).filter(l => l.length>0);


  const driver = await initBrowser();

  runMapThenables(urls, async (url: string) => {
    const html = await promptToFetch(url, driver)
    console.log(html);
  });
}
