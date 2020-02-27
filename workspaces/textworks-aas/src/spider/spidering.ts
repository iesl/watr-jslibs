import prompts from "prompts";
import _ from "lodash";
import fs from "fs-extra";
import path from "path";

import {fetchUrl} from "~/spider/axios-scraper";

import {runMapThenables} from "commons";


import {createLogger, format, transports, Logger} from "winston";
import {fetchViaFirefox, FetchUrlFn, ShutdownFn} from "./browser-scraper";
const {combine, timestamp} = format;

export interface SpideringEnv {
  logger: Logger;
  takeScreenshot: boolean;
}

export interface SpideringOptions {
  interactive: boolean;
  useBrowser: boolean;
  cwd: string;
  downloads: string;
  logpath: string;
  input?: string;
}

export const defaultSpideringOptions: SpideringOptions = {
  interactive: true,
  useBrowser: true,
  cwd: ".",
  downloads: ".",
  logpath: "./spidering.log",
};

interface SpideringRecs extends SpideringOptions {
  recs: SpideringRec[];
  getRecDownloadDirectory(rec: SpideringRec): string;
  getRecDownloadFilename(rec: SpideringRec): string;
}

interface SpideringRec {
  url: string;
  outpath?: string;
  path?: string;
  dlpath: () => string;
}

function initLogger(logpath: string): Logger {
  const logname = path.resolve(logpath, "spider-log.json");
  const logger = createLogger({
    level: "info",
    format: combine(timestamp(), format.prettyPrint()),
    transports: [
      new transports.File({filename: logname}),
      new transports.Console(),
    ],
  });

  return logger;
}

export async function createSpider(opts: SpideringOptions) {
  const logger = initLogger(opts.logpath);
  logger.info({event: "initializing spider", config: opts});

  const input = opts.input;
  if (!input) {
    logger.info({event: "fatal error: no input file", config: opts});
  }
  const inputBuf = fs.readFileSync(input!);
  const rawRecs: Partial<SpideringRec>[] = JSON.parse(inputBuf.toString());

  const srecs: SpideringRec[] = rawRecs.map(rec => {
    const p1 = rec.outpath;
    const p2 = rec.path;
    return {
      url: rec.url!,
      path: p1,
      outpath: p2,
      dlpath() {
        return p1 ? p1 : p2 ? p2 : "tmp-spider-dl.html";
      },
    };
  });
  const spideringRecs: SpideringRecs = {
    ...opts,
    recs: srecs,
    getRecDownloadDirectory(rec: SpideringRec): string {
      const root = opts.cwd;
      const rel = rec.dlpath();
      return path.join(root, rel);
    },
    getRecDownloadFilename(rec: SpideringRec): string {
      const basepath = this.getRecDownloadDirectory(rec);
      return path.join(basepath, "download.html");
    },
  };

  let prompt = opts.interactive ? promptForAction : alwaysDownload;
  const fetchfn = opts.useBrowser ? fetchViaFirefox : fetchViaAxios;

  const [fetcher, closeFetcher] = await fetchfn();

  const env: SpideringEnv = {
    logger,
    takeScreenshot: false,
  };

  logger.info({event: "starting spider"});

  let filter = ".*";

  await runMapThenables(spideringRecs.recs, async (rec: SpideringRec) => {
    const url = rec.url;

    if (url.match(filter) === null) {
      return;
    }
    let fetched: string | undefined;

    async function _loop(actions: UserAction[]): Promise<void> {
      if (actions.length === 0) return;
      const nextAction = actions[0];

      switch (nextAction.action) {
        case "download":
          fetched = await fetcher(env, url);
          break;
        case "skip":
          break;
        case "all":
          prompt = alwaysDownload;
          fetched = await fetcher(env, url);
          break;
        case "mark":
          break;
        case "filter":
          filter = nextAction.value!;
          break;
        case "quit":
          logger.info({event: "user exiting spider"});
          closeFetcher();
          process.exit();
      }
      return _loop(_.tail(actions));
    }

    const nextActions = await prompt(rec.url);
    await _loop(nextActions);

    if (fetched) {
      logger.info({event: "url fetched", url});
      const downloadDir = spideringRecs.getRecDownloadDirectory(rec);
      const downloadFilename = spideringRecs.getRecDownloadFilename(rec);
      const exists = fs.existsSync(downloadFilename);
      if (exists) {
        fs.removeSync(downloadFilename);
      }
      fs.mkdirsSync(downloadDir);
      fs.writeFileSync(downloadFilename, fetched);
    } else {
      logger.info({event: "url not fetched", url});
    }
  });

  closeFetcher();
}

async function fetchViaAxios(): Promise<[FetchUrlFn, ShutdownFn]> {
  const fetch: FetchUrlFn = async (env, url) => {
    return fetchUrl(env, url);
  };
  const shutdown: ShutdownFn = async () => {};
  return [fetch, shutdown];
}

async function alwaysDownload(): Promise<UserAction[]> {
  return [{action: "download"}];
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
        {title: "Download", value: "download"},
        {title: "Skip", value: "skip"},
        {title: "Mark", value: "mark"},
        {title: "Filter", value: "filter"},
        {title: "Continue non-interactive", value: "all"},
        {title: "Quit", value: "quit"},
      ],
      initial: 0,
    });

    const action = res.value;

    switch (action) {
      case "mark":
        actions.push({action});
        actions.push(...(await _loop([])));
        break;
      case "filter":
        const filter = await promptForFilter();
        actions.push({action, value: filter});
        actions.push(...(await _loop([])));
        break;
      default:
        actions.push({action});
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
