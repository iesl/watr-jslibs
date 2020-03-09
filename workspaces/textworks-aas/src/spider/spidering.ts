import prompts from "prompts";
import _ from "lodash";
import fs from "fs-extra";
import path from "path";
import { Stream, Transform } from "stream";
import pumpify from "pumpify";

import { fetchUrl } from "~/spider/axios-scraper";

import {
  throughFunc,
  csvStream,
  initEnv, throughEnvFunc, sliceStream, makeCorpusEntryLeadingPath,
  filterEnvStream,
  expandDir,
  prettyPrint
} from "commons";


import { createLogger, format, transports, Logger } from "winston";
import { fetchViaFirefox, FetchUrlFn, ShutdownFn } from "./browser-scraper";
import { makeNowTimeString } from 'commons';
const { combine, timestamp } = format;

type CorpusPath = string
type UrlToCorpusPath = (url: string, noteId: string) => CorpusPath;
type TimestampFilename = (fn: string) => string;

export interface SpideringEnv {
  logger: Logger;
  takeScreenshot: boolean;
  fetchFunction: FetchUrlFn;
  promptFunction: (url: string) => Promise<UserAction[]>;
  urlToCorpusPath: UrlToCorpusPath;
  timestampFilename: TimestampFilename;
}

export interface SpideringOptions {
  interactive: boolean;
  useBrowser: boolean;
  cwd: string;
  corpusRoot: string;
  logpath: string;
  input?: string;
}

export const defaultSpideringOptions: SpideringOptions = {
  interactive: true,
  useBrowser: true,
  cwd: ".",
  corpusRoot: ".",
  logpath: "./spidering.log",
};


interface SpideringRec {
  url: string;
  noteId: string;
  // outpath?: string;
  // path?: string;
  // dlpath: () => string;
}

function initLogger(logpath: string): Logger {
  const logname = path.resolve(logpath, "spider-log.json");
  const logger = createLogger({
    level: "info",
    format: combine(timestamp(), format.prettyPrint()),
    transports: [
      new transports.File({ filename: logname }),
      new transports.Console(),
    ],
  });

  return logger;
}

export function oneoff(inputCsv: string, inputJson: string, logpath: string) {
  const logname = path.resolve(logpath, "oneoff.log");

  const pump = pumpify.obj(
    csvStream(inputCsv),
  );

  pump.on("data", () => true);

}

export function createSpideringInputStream(csvfile: string): Stream {
  return pumpify.obj(
    csvStream(csvfile),
    throughFunc((csvRec: string[]) => {
      const [noteId, dblpConfId] = csvRec;
      const url = csvRec[csvRec.length-1];
      return {
        url,
        noteId,
        dblpConfId
      }
    })
  );
}

async function processOneSpiderRec(rec: SpideringRec, env: SpideringEnv, currStream: Transform) {
  const url = rec.url;

  let fetched: string | undefined;

  async function _loop(actions: UserAction[]): Promise<void> {
    if (actions.length === 0) return;
    const nextAction = actions[0];

    switch (nextAction.action) {
      case "download":
        fetched = await env.fetchFunction(env, url);
        break;
      case "skip":
        break;
      case "quit":
        env.logger.info({ event: "user exiting spider" });
        currStream.destroy();
        break;
    }
    return _loop(_.tail(actions));
  }

  const nextActions = await env.promptFunction(rec.url);
  await _loop(nextActions);

  if (fetched) {
    env.logger.info({ event: "url fetched", url });
    const downloadDir = env.urlToCorpusPath(url, rec.noteId);
    const downloadFilenamez = env.timestampFilename("download.html");
    const downloadFilepath = path.resolve(downloadDir, downloadFilenamez);
    // const downloadFilename = spideringRecs.getRecDownloadFilename(rec);
    const exists = fs.existsSync(downloadFilepath);
    if (exists) {
      fs.removeSync(downloadFilepath);
    }
    fs.mkdirsSync(downloadDir);
    fs.writeFileSync(downloadFilepath, fetched);
  } else {
    env.logger.info({ event: "url not fetched", url });
  }
}


const filterUndownloadedUrls = filterEnvStream((rec: SpideringRec, env: SpideringEnv) => {
  const downloadDir = env.urlToCorpusPath(rec.url, rec.noteId);
  const dirExists = fs.existsSync(downloadDir);
  if (!dirExists) {
    return true;
  }

  const expanded = expandDir(downloadDir);

  const hasHtml = _.some(
    expanded.files,
    f => f.startsWith("download") && f.endsWith("html")
  );
  if (hasHtml) {
    env.logger.info({ event: "skipping url: already downloaded"});
  }

  return !hasHtml;
});

export async function createSpider(opts: SpideringOptions) {
  const logger = initLogger(opts.logpath);
  logger.info({ event: "initializing spider", config: opts });

  const input = opts.input;
  if (!input) {
    logger.info({ event: "fatal error: no input file", config: opts });
    return;
  }

  const timestampFilename = (filename: string) => {
    const timeString = makeNowTimeString();
    const basename = path.basename(filename);
    const ext = path.extname(filename);
    return `${basename}-${timeString}${ext}`;
  };

  const urlToCorpusPath = (url: string, noteId: string) => {
    const cwd = opts.cwd;
    const corpusRoot = path.resolve(cwd, opts.corpusRoot);
    const leading = makeCorpusEntryLeadingPath(url);
    return path.resolve(corpusRoot, leading, `${noteId}.d`)
  };

  const prompt = opts.interactive ? promptForAction : alwaysDownload;
  const fetchfn = opts.useBrowser ? fetchViaFirefox : fetchViaAxios;

  const [fetcher, closeFetcher] = await fetchfn();

  const env: SpideringEnv = {
    logger,
    takeScreenshot: false,
    fetchFunction: fetcher,
    promptFunction: prompt,
    timestampFilename,
    urlToCorpusPath,
  };

  const inputStream = createSpideringInputStream(input);
  const str = pumpify.obj(
    inputStream,
    initEnv(() => env),
    filterUndownloadedUrls,
    throughEnvFunc(processOneSpiderRec),
  );

  logger.info({ event: "starting spider" });

  str.on("data", () => undefined);

  str.on("end", () => {
    logger.info({ event: "shutting down spider" });
    closeFetcher();
  });

}

async function fetchViaAxios(): Promise<[FetchUrlFn, ShutdownFn]> {
  const fetch: FetchUrlFn = async (env, url) => {
    return fetchUrl(env, url);
  };
  const shutdown: ShutdownFn = async () => undefined;
  return [fetch, shutdown];
}

async function alwaysDownload(): Promise<UserAction[]> {
  return [{ action: "download" }];
}

interface UserAction {
  action: string;
  value?: string;
}

async function promptForAction(url: string): Promise<UserAction[]> {
  async function _loop(actionQueue: UserAction[]) {
    const actions: UserAction[] = [];
    const res = await prompts({
      type: "select",
      name: "value",
      message: `What to do with ${url}?`,
      choices: [
        { title: "Download", value: "download" },
        { title: "Skip", value: "skip" },
        { title: "Quit", value: "quit" },
      ],
      initial: 0,
    });

    const action = res.value;

    switch (action) {
      case "mark":
        actions.push({ action });
        actions.push(...(await _loop([])));
        break;
      case "filter": {
        const filter = await promptForFilter();
        actions.push({ action, value: filter });
        actions.push(...(await _loop([])));
        break;
      }
      default:
        actions.push({ action });
        break;
    }

    return _.concat(actionQueue, actions);
  }

  return _loop([]);
}
async function promptForFilter(): Promise<string> {
  return prompts({
    type: "text",
    name: "value",
    message: `Enter url filter regex`,
  }).then(r => r.value);
}



















// export async function createSpiderOldVer(opts: SpideringOptions) {
//   const logger = initLogger(opts.logpath);
//   logger.info({event: "initializing spider", config: opts});

//   const input = opts.input;
//   if (!input) {
//     logger.info({event: "fatal error: no input file", config: opts});
//     return;
//   }
//   const inputBuf = fs.readFileSync(input);
//   const rawRecs: Partial<SpideringRec>[] = JSON.parse(inputBuf.toString());

//   const srecs: SpideringRec[] = rawRecs.map(rec => {
//     const p1 = rec.outpath;
//     const p2 = rec.path;
//     const url = rec.url || 'undefined_url';

//     return {
//       url,
//       path: p1,
//       outpath: p2,
//       dlpath() {
//         return p1 ? p1 : p2 ? p2 : "tmp-spider-dl.html";
//       },
//     };
//   });
//   const spideringRecs: SpideringRecs = {
//     ...opts,
//     recs: srecs,
//     getRecDownloadDirectory(rec: SpideringRec): string {
//       const root = opts.cwd;
//       const rel = rec.dlpath();
//       return path.join(root, rel);
//     },
//     getRecDownloadFilename(rec: SpideringRec): string {
//       const basepath = this.getRecDownloadDirectory(rec);
//       return path.join(basepath, "download.html");
//     },
//   };

//   let prompt = opts.interactive ? promptForAction : alwaysDownload;
//   const fetchfn = opts.useBrowser ? fetchViaFirefox : fetchViaAxios;

//   const [fetcher, closeFetcher] = await fetchfn();

//   const env: SpideringEnv = {
//     logger,
//     takeScreenshot: false,
//   };

//   logger.info({event: "starting spider"});

//   let filter = ".*";

//   await runMapThenables(spideringRecs.recs, async (rec: SpideringRec) => {
//     const url = rec.url;

//     if (url.match(filter) === null) {
//       return;
//     }
//     let fetched: string | undefined;

//     async function _loop(actions: UserAction[]): Promise<void> {
//       if (actions.length === 0) return;
//       const nextAction = actions[0];

//       switch (nextAction.action) {
//         case "download":
//           fetched = await fetcher(env, url);
//           break;
//         case "skip":
//           break;
//         case "all":
//           prompt = alwaysDownload;
//           fetched = await fetcher(env, url);
//           break;
//         case "mark":
//           break;
//         case "filter":
//           filter = nextAction.value? nextAction.value : filter;
//           break;
//         case "quit":
//           logger.info({event: "user exiting spider"});
//           closeFetcher();
//           process.exit();
//       }
//       return _loop(_.tail(actions));
//     }

//     const nextActions = await prompt(rec.url);
//     await _loop(nextActions);

//     if (fetched) {
//       logger.info({event: "url fetched", url});
//       const downloadDir = spideringRecs.getRecDownloadDirectory(rec);
//       const downloadFilename = spideringRecs.getRecDownloadFilename(rec);
//       const exists = fs.existsSync(downloadFilename);
//       if (exists) {
//         fs.removeSync(downloadFilename);
//       }
//       fs.mkdirsSync(downloadDir);
//       fs.writeFileSync(downloadFilename, fetched);
//     } else {
//       logger.info({event: "url not fetched", url});
//     }
//   });

//   closeFetcher();
// }
