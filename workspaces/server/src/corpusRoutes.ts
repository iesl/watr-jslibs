
import _ from 'lodash';

import pumpify from "pumpify";

import { Context } from "koa";
import  Router from "koa-router";

import {
  corpusEntryStream,
  expandDirTrans,
  CorpusEntry,
} from "commons/dist/corpora";

import {
  sliceStream
} from "commons/dist/util/stream-utils";

import { realpathSync } from 'fs-extra';

export interface CorpusPage {
  corpusEntries: CorpusEntry[];
  offset: number;
}

export async function readCorpusEntries(
  corpusRoot: string,
  start: number,
  len: number
): Promise<CorpusPage> {
  const entryStream = corpusEntryStream(corpusRoot);
  const pipe = pumpify.obj(
    entryStream,
    sliceStream(start, len),
    expandDirTrans,
  );

  return new Promise((resolve) => {
    const entries: CorpusEntry[] = [];
    pipe.on("data", (data: CorpusEntry) => {
      entries.push(data);
    });
    pipe.on("end", () => {
      const corpusPage = {
        corpusEntries: entries,
        offset: start
      };
      resolve(corpusPage);
    });
  })
}


export function initFileBasedRoutes(corpusRootPath: string): Router {
  const apiRouter = new Router();
  const corpusRoot = realpathSync(corpusRootPath);

  apiRouter.prefix("/api")
    .get("/corpus/entries", async (ctx: Context) => {
      const { start, len } = ctx.query;
      const offset: number = start? parseInt(start) : 0;
      const length: number = len? parseInt(len) : 50;
      const corpusPage = await readCorpusEntries(corpusRoot, offset, length);

      ctx.body = corpusPage;
    })
  ;

  return apiRouter;

}
