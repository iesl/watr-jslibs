import Koa, { Context } from 'koa';
import Router from 'koa-router';
import json from 'koa-json';
import koaBody from 'koa-body';

import {
  csvStream,
  streamPump,
} from "commons";
// import { arglib } from "commons";
// const { opt, config, registerCmd } = arglib;
// registerCmd(
//   "portal-server",
//   "remove records from csv that have already been spidered",
//   config(
//     opt.cwd,
//   )
// )((opts: any) => {
//   const { scrapyLog, csv } = opts;
// });

import {
  createLogger,
  format,
  transports,
  Logger,
} from "winston";
// const { combine, timestamp, prettyPrint } = format;

export function createAppLogger(): Logger {
  return createLogger({
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: "portal-rest-service.log",
        dirname: "./logs",
        tailable: true,
      })
    ],
  });
}

export function readOrderCsv(csvfile: string): Promise<void> {
  const inputStream = csvStream(csvfile);
  const log = createAppLogger();

  const pumpBuilder = streamPump.createPump()
    .viaStream<string[]>(inputStream)
    .throughF((csvRec: string[]) => {
      const [noteId, dblpConfId, title, url, authorId] = csvRec;
      const rec = {
        noteId, dblpConfId, url, title, authorId
      };
      log.log({
        level: 'info',
        message: 'rest-portal-input',
        id: `${noteId}+${url}`,
        ...rec
      });
      return rec
    })
  ;


  // TODO save the records to local file
  // generate log entries suitable for filebeat consumption
  const p = pumpBuilder
    .toPromise()
    .then(() => undefined)
  ;

  return p;
}

async function postBatchCsv(ctx: Context, next: () => Promise<any>): Promise<Router> {
  console.log('postBatchCsv');
  const { files } = ctx.request;

  console.log('postBatchCsv', files);
  if (files) {
    const { data } = files;
    await readOrderCsv(data.path)
    ctx.response.body = { status: 'ok' };
  } else {
    ctx.response.body = { status: 'error' };
  }

  return next();
}

async function getBatchCsv(ctx: Context, next: () => Promise<any>): Promise<Router> {
  const p = ctx.path;
  console.log('getBatchCsv');

  return next();
}

async function getRoot(ctx: Context, next: () => Promise<any>): Promise<Router> {
  const p = ctx.path;
  console.log('getRoot');

  return next();
}

function initPortalRouter(): Router {
  const apiRouter = new Router({
  });
  const pathPrefix = '/extractor'

  apiRouter
    .get(new RegExp(`${pathPrefix}/`), getRoot)
    .post(new RegExp(`${pathPrefix}/batch.csv`), postBatchCsv)
    .get(new RegExp(`${pathPrefix}/batch.csv`), getBatchCsv)
    ;

  return apiRouter;

}


const rootRouter = new Router();
const portalRouter = initPortalRouter();
const app = new Koa();


const port = 3100;


rootRouter
  .use("/", ((ctx: Context, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    return next();
  }))
  .use(koaBody({ multipart: true }))
  .use(portalRouter.routes())
  .use(portalRouter.allowedMethods())
  ;

app
  .use(rootRouter.routes())
  .use(rootRouter.allowedMethods())
  .use(json({ pretty: false }))
  ;

app.listen(port, function() {
  console.log(`Koa is listening to http://localhost:${port}`);
});
