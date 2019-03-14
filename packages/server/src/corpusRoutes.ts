
import * as _ from 'lodash';

import { Context } from "koa";
import path from "path";
import  Router from "koa-router";
import { realpathSync } from "fs-extra";

import klaw from "klaw-sync";

export function readCorpusEntries(corpusRoot: string): ReadonlyArray<any> {
  let entries = klaw(corpusRoot, { depthLimit: 1 });

  return _.flatMap(entries, data => {
    const p = data.path.slice(corpusRoot.length, data.path.length);
    const isPDF = p.endsWith(".pdf");
    if (isPDF) {
      const stableId = p.split(/[/]/)[1];
      const dirname = path.dirname(data.path);
      const paths = klaw(dirname).map(p => p.path);
      const e = {
        stableId,
        paths,
        entryRoot: dirname
      };
      return [e]
    }

    return [];
  });
}


export function initFileBasedRoutes(corpusRootPath: string): Router {
  const apiRouter = new Router();
  const corpusRoot = realpathSync(corpusRootPath);

  apiRouter.prefix("/api")
    .get("/corpus/entries", async (ctx: Context) => {
      const { start, len } = ctx.query;
      const offset: number = start? parseInt(start) : 0;
      const length: number = len? parseInt(len) : 50;
      const entries = await readCorpusEntries(corpusRoot);
      const entrySlice = entries.slice(offset, offset+length);

      ctx.body = {
        entries: entrySlice,
        corpusSize: entries.length,
        offset: offset,
        window: length
      };
    })
  ;

  return apiRouter;

}
