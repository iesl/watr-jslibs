import prompts from 'prompts';
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';


import { fetchUrl } from './get-urls';

import { Builder, WebDriver, By, until } from 'selenium-webdriver';
import { runMapThenables } from './utils';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, prettyPrint } = format;

export interface SpideringEnv {
  logger: Logger;
}
export interface SpideringOptions {
  interactive: boolean;
  useBrowser: boolean;
  rootDir: string;
  downloadDir: string;
  loggingPath: string;
  spiderInputFile?: string;
}

export const defaultSpideringOptions: SpideringOptions = {
  interactive: true,
  useBrowser: true,
  rootDir: '.',
  downloadDir: '.',
  loggingPath: './spidering.log',
}


interface SpideringRecs extends SpideringOptions {
  recs: SpideringRec[];
  getRecDownloadDirectory(rec: SpideringRec): string;
  getRecDownloadFilename(rec: SpideringRec): string;
}

interface SpideringRec {
  url: string;
  outpath: string;
}


type FetchUrlFn = (env: SpideringEnv, url: string) => Promise<string|undefined>;
type ShutdownFn = () => Promise<void>;

function initLogger(logname: string): Logger {
  const logger = createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      prettyPrint()
    ),
    transports: [
      new transports.File({ filename: logname }),
      new transports.Console()
    ]
  });

  return logger;
}

export async function createSpider(opts: SpideringOptions) {
  const logger = initLogger(path.join(opts.rootDir, opts.loggingPath));
  logger.info({ event: 'initializing spider', config: opts });

  const input = opts.spiderInputFile;
  if (!input) {
    logger.info({ event: 'fatal error: no input file', config: opts });
  }
  const inputBuf = fs.readFileSync(input!);
  const srecs: SpideringRec[] = JSON.parse(inputBuf.toString());
  const spideringRecs: SpideringRecs = {
    ...opts,
    recs: srecs,
    getRecDownloadDirectory(rec: SpideringRec): string {
      const root = opts.rootDir;
      const rel = rec.outpath;
      return path.join(root, rel);
    },
    getRecDownloadFilename(rec: SpideringRec): string {
      const basepath = this.getRecDownloadDirectory(rec);
      return path.join(basepath, 'download.html');
    }
  };;

  let prompt = opts.interactive?  promptForAction : alwaysDownload;
  const fetchfn = opts.useBrowser? fetchViaFirefox: fetchViaAxios;

  const [fetcher, closeFetcher] = await fetchfn();

  const env: SpideringEnv = {
    logger
  };

  logger.info({ event: 'starting spider' });

  runMapThenables(spideringRecs.recs, async (rec: SpideringRec) => {
    const url = rec.url;
    let fetched: string | undefined;
    const nextAction = await prompt();
    switch (nextAction) {
      case 'download':
        fetched = await fetcher(env, url);
        break;
      case 'skip':
        break;
      case 'all':
        prompt = alwaysDownload;
        fetched = await fetcher(env, url);
        break;
      case 'quit':
        logger.info({ event: 'user exiting spider' });
        closeFetcher();
        process.exit();
    }

    if (fetched) {
      logger.info({ event: 'url fetched', url });
      const downloadDir = spideringRecs.getRecDownloadDirectory(rec);
      const downloadFilename = spideringRecs.getRecDownloadFilename(rec);
      const exists = fs.existsSync(downloadFilename);
      if (exists) {
        fs.removeSync(downloadFilename);
      }
      fs.mkdirsSync(downloadDir);
      fs.writeFileSync(downloadFilename, fetched);

    } else {
      logger.info({ event: 'url not fetched', url });
    }
  });


  closeFetcher();
}

async function fetchViaAxios(): Promise<[FetchUrlFn, ShutdownFn]> {
  const fetch: FetchUrlFn = async (env, url) => {
    return fetchUrl(env, url);
  };
  const shutdown: ShutdownFn = async () => {

  };
  return [fetch, shutdown];
}

async function fetchViaFirefox(): Promise<[FetchUrlFn, ShutdownFn]> {
  const driver = await initBrowser();

  const fetch: FetchUrlFn = async (env, url) => {
    return getPageHtml(env, driver, url);
  };
  const shutdown: ShutdownFn = driver.quit;
  return [fetch, shutdown];
}


async function initBrowser(): Promise<WebDriver> {
  const bldr = new Builder();
  bldr.forBrowser('firefox');
  bldr.getCapabilities().setAcceptInsecureCerts(true);
  return bldr.build();
}


interface SpideringRule {
  urlre: RegExp;
  rule: (env: SpideringEnv, wd: WebDriver, url: string) => Promise<string|undefined>;
}

// Rules:
const SpideringRules: SpideringRule[] = [
  { urlre: new RegExp('aaai\.org.+/paper/view/.*'),
    rule: async (env, wd: WebDriver, url: string) => {
      const { logger } = env;
      try {
        // re-write the url
        const newUrl = url.replace('/view/', '/viewPaper/');
        await wd.get(newUrl);
        await wd.wait(until.elementLocated(By.id('abstract')), 5000);
        const pageSource = await wd.getPageSource();
        const i = pageSource.indexOf('<h4>Abstract');
        if (i < 0) {
          logger.info({ event: 'rule post-assert failed', url });
        }
        return pageSource;
      } catch (err) {
        logger.info({
          event: 'rule exception',
          msg: `error in getPageHtml: ${err}`,
          url,
        });
        return undefined;

      }
    }},
  { urlre: new RegExp('doi\.org/10\.1609/.*'),
    rule: async (_env, wd: WebDriver, url: string) => {
      try {

        await wd.get(url);
        await wd.wait(until.elementLocated(By.className('abstract')), 5000);
        const pageSource = await wd.getPageSource();
        const i = pageSource.indexOf('Abstract</h3>');
        if (i < 0) {
          console.log('warning: rule possible did not succeed');
        }
        return pageSource;
      } catch (err) {
        console.log(`error in getPageHtml: ${err}`);
        return undefined;

      }
    }},
  { urlre: new RegExp('//doi\.org/.*'),
    rule: async (_env, wd: WebDriver, url: string) => {
      try {
        // General doi.org rules

        await wd.get(url);
        // wait for a forward/redirect
        await wd.wait(until.urlMatches(/!(doi\.org)/));

        // const currUrl = await wd.getCurrentUrl();


        await wd.wait(until.elementLocated(By.className('abstract')), 5000);
        const pageSource = await wd.getPageSource();
        const i = pageSource.indexOf('Abstract</h3>');
        if (i < 0) {
          console.log('warning: rule possible did not succeed');
        }
        return pageSource;
      } catch (err) {
        console.log(`error in getPageHtml: ${err}`);
        return undefined;

      }
    }}
  // e.g., ieeexplore.ieee.org
  //    class='row result-item'
];

async function defaultRule(env: SpideringEnv, driver: WebDriver, url: string) {
  const { logger } = env;
  try {
    logger.info({
      event: 'use rule: default',
      url,
    });
    await driver.get(url)
    await driver.sleep(2000)
    return driver.getPageSource()
      .catch(err => {
        console.log(`error in getPageHtml: ${err}`);
        return undefined;
      });
  } catch (err) {
    console.log(`error in getPageHtml: ${err}`);
    return;
  }
}

async function getPageHtml(env: SpideringEnv, driver: WebDriver, url: string): Promise<string|undefined> {
  const { logger } = env;

  const applicableRules = SpideringRules.filter(r => r.urlre.test(url));
  const len = applicableRules.length;
  // let rule: (wd: WebDriver, url: string) => Promise<string|undefined> = defaultRule;
  let rule: SpideringRule = { urlre: new RegExp('.*'), rule: defaultRule };
  switch (len) {
    case 0:
      break;
    case 1:
      rule = applicableRules[0];
      break;
    default:
      rule = applicableRules[0];
      const allRules = applicableRules.map(r => r.urlre.source)
      console.log(`Warning: multiple rules found for url ${url}: ${allRules} `);
      break;
  }
  logger.info({
    event: `use rule: match ${rule.urlre.source}`,
    url,
  });
  return rule.rule(env, driver, url)
    .catch(err => {
      logger.info({
        event: 'get url exception',
        msg: err,
        url,
      });
      console.log(`error in getPageHtml: ${err}`);
      return undefined;
    });
}

async function alwaysDownload(): Promise<string> {
  return 'download';
}

async function promptForAction(): Promise<string> {
  return prompts({
    type: 'select',
    name: 'value',
    message: `What to do?`,
    choices: [
      { title: 'Download', value: 'download' },
      { title: 'Skip', value: 'skip' },
      { title: 'All', value: 'all' },
      { title: 'Quit', value: 'quit' }
    ],
    initial: 0
  }).then(r => r.value);
}


// async function waitFor(ms: number): Promise<void> {
//   return new Promise<void>((resolve) => {
//     setTimeout(() => {
//       resolve();
//     }, ms)
//   })
// }

// let usePrompt = true;
// async function promptToFetch(url: string, driver: WebDriver): Promise<string|undefined> {
//   const pauseLength = 2 * 1000;

//   async function doFetch(): Promise<string|undefined> {
//     return getPageHtml(driver, url);
//   }

//   if (!usePrompt) {
//     return waitFor(pauseLength).then(doFetch);
//   }

//   const response = await prompts({
//     type: 'select',
//     name: 'value',
//     message: `view: ${url}`,
//     choices: [
//       { title: 'Download', value: 'download' },
//       { title: 'Skip', value: 'skip' },
//       { title: 'All', value: 'all' },
//       { title: 'Quit', value: 'quit' }
//     ],
//     initial: 0
//   })
//   switch (response.value) {
//     case 'download':
//       return getPageHtml(driver, url);
//     case 'skip':
//       break;
//     case 'all':
//       usePrompt = false;
//       return getPageHtml(driver, url);
//     case 'quit':
//       splog({ event: 'user exiting spider' });
//       await driver.quit();
//       process.exit();
//   }
//   return;
// }


// async function spiderRec_Prompt_Browser(driver: WebDriver, spideringRecs: SpideringRecs, rec: SpideringRec) {
//   const url: string = rec.url;
//   const recBasepath = spideringRecs.getRecDownloadDirectory(rec);
//   const recFilepath = spideringRecs.getRecDownloadFilename(rec);

//   const exists = fs.existsSync(recFilepath);
//   if (exists) {
//     fs.removeSync(recFilepath);
//   }
//   const response = await promptToFetch(url, driver);
//   splog({
//     event: 'downloaded url',
//     topath: recFilepath,
//     replaced: exists,
//     url,
//   });
//   fs.mkdirsSync(recBasepath);
//   fs.writeFileSync(recFilepath, response);
// }


// async function interactiveSpiderViaFF(recJson: string, _outdir: string, urlfilter: string) {
//   console.log(`using url filter ${urlfilter}`);
//   splog({
//     event: 'starting spider',
//     urlfilter,
//   });

//   const tmp = fs.readFileSync(recJson);
//   const asJson: any[] = JSON.parse(tmp.toString());

//   const filterRE = new RegExp(urlfilter);
//   const driver = await initBrowser();

//   runMapThenables(asJson, async (rec: any) => {
//     const url: string = rec.url;
//     splog({
//       event: 'input url',
//       url,
//     });

//     const matchesFilter = filterRE.test(url);
//     const tmpSkip = url.includes('ieeexplore');
//     const invalidUrl = url.includes('no_url');

//     if (!matchesFilter || tmpSkip || invalidUrl) {
//       splog({
//         event: 'filtered url',
//         url,
//       });
//       return;
//     }

//     const basepath = rec.path;
//     const filepath = path.join(basepath, 'download.html');

//     const exists = fs.existsSync(filepath);
//     if (exists) {
//       fs.removeSync(filepath);
//     }
//     const response = await promptToFetch(url, driver);
//     splog({
//       event: 'downloaded url',
//       topath: filepath,
//       replaced: exists,
//       url,
//     });
//     fs.mkdirsSync(basepath);
//     fs.writeFileSync(filepath, response);
//   });

// }

// function interactiveSpider(csvfile: string, outdir: string) {
//   let fns: CBFunc[] = []

//   csvToPathTree(csvfile).then((treeObj: any) => {

//     traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
//       const ask = askToContinueDownload(url, hashId, treePath, outdir);
//       fns = _.concat(fns, ask);
//     });
//   }).then(async () => {
//     const chain = _.chain(fns).reduce(async (acc, action) => {
//       return acc.then(action)
//         .catch(err => {
//           console.log("error: ", err);
//         }) ;
//     }, Promise.resolve());

//     return chain.value()
//       .catch((err) => {
//         console.log("error: ", err);
//       });
//   }).catch(err => {
//     console.log("error: ", err);
//   });
// }


// async function spiderAll(csvfile: string, outdir: string) {
//   const workingDir = path.resolve(outdir);
//   const pauseLength = 2 * 1000;

//   let fns: CBFunc[] = []

//   csvToPathTree(csvfile).then((treeObj: any) => {
//     traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
//       if (url === 'no_url') {
//         console.log(`no url for ${_.join(treePath, ' / ')}`);
//       } else {
//         const basepathArr = _.concat(treePath, [hashId]);
//         const basepath = path.join(workingDir, ...basepathArr);
//         const filepath = path.join(basepath, 'download.html');
//         const htmlExists = fs.existsSync(filepath);

//         if (!htmlExists) {
//           console.log(`queuing ${url}`);
//           const fn = async () => {
//             console.log(`downloading ${url} to ${basepath}`);
//             fs.mkdirsSync(basepath);
//             await getHtml(url, filepath);
//             return new Promise<void>((resolve) => {
//               setTimeout(() => {
//                 resolve();
//               }, pauseLength);
//             })
//           };
//           fns = _.concat(fns, fn);
//         } else {
//           console.log(`already have ${url} in ${basepath}`);
//         }
//       }
//     });
//     return Promise.resolve();
//   }).then(async () => {
//     const torun = fns; // .slice(0, 1000);
//     console.log(`running ${fns.length} callbacks`);

//     const chain = _.chain(torun).reduce(async (acc, action) => {
//       return acc.then(action)
//         .catch(err => {
//           console.log("error0: ", err);
//         }) ;
//     }, Promise.resolve());

//     return chain.value()
//       .catch((err) => {
//         console.log("error1: ", err);
//       });
//   });


// }


// function askToContinueDownload(url: string, hashId: string, treePath: string[], outdir: string) {
//   return async () => {
//     const workingDir = path.resolve(outdir);
//     const pathstr = _.join(treePath, '/');
//     console.log(`working dir: ${workingDir}`);
//     console.log(`${pathstr}`);
//     console.log(`   url: ${url}`)
//     console.log(`   hid: ${hashId}`)
//     const response = await prompts({
//       type: 'select',
//       name: 'value',
//       message: 'What do?',
//       choices: [
//         { title: 'Download', value: 'download' },
//         { title: 'Skip', value: 'skip' },
//         { title: 'Quit', value: 'quit' }
//       ],
//       initial: 0
//     })
//     switch (response.value) {
//       case 'download':
//         const basepathArr = _.concat(treePath, [hashId]);
//         const basepath = path.join(workingDir, ...basepathArr);
//         const filepath = path.join(basepath, 'download.html');
//         const exists = fs.existsSync(filepath);
//         if (exists) {
//           fs.removeSync(filepath);
//         }
//         console.log(`downloading ${url}`)
//         console.log(`    to ${basepath}`)
//         fs.mkdirsSync(basepath);
//         await getHtml(url, filepath);
//         break
//       case 'skip':
//         break
//       case 'quit':
//         process.exit();
//     }
//   }
// }
