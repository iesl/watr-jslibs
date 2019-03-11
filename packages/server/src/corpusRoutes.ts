
import { Context } from "koa";
import  Router from "koa-router";
import fsx, { realpathSync } from "fs-extra";

import klaw from "klaw";

export function initFileBasedRoutes(corpusRoot: string): Router {
  const apiRouter = new Router();
  const rp = realpathSync(corpusRoot);
  console.log('corpusRoot', rp);

  apiRouter.prefix("/api")
    .get("/corpus/entries", async (ctx: Context, next) => {
      const { start, len } = ctx.query;
      const offset: number = start? parseInt(start) : 0;
      const length: number = len? parseInt(len) : 50;

      const p = new Promise((resolve, reject) => {
        let entries: any[] = [];
        klaw(corpusRoot, { depthLimit: 1 })
          .on('data', (data) => {
            const p = data.path.slice(rp.length, data.path.length);
            const isPDF = p.endsWith('.pdf');
            if (isPDF) {
              const stableId = p.split(/[/]/)[1];
              const e = {
                stableId
              };
              entries.push(e);
            }
          })
          .on('end', () => {
            resolve(entries);
          });
      });

      const entries: any[] = await p;
      const entrySlice = entries.slice(offset, offset+length);

      ctx.body = {
        entries: entrySlice,
        corpusSize: entries.length,
        offset: offset
        window: length
      };
    })
  ;

  return apiRouter;

}
