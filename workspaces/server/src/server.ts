
import Koa, { Context } from 'koa';
import  Router from 'koa-router';
import  path   from 'path';
import  send   from 'koa-send';
import  json   from 'koa-json';
import opts from 'commander';

import { initFileBasedRoutes } from './corpusRoutes';

const rootRouter = new Router();
const app = new Koa();

opts
  .version('0.1.0')
  .option('--corpus <path>', 'Path to corpus')
  .option('--public <path>', 'Path public assets')
  .parse(process.argv)
;

const distRoot =  opts.public;
const corpusRoot =  opts.corpus;

rootRouter
  .get('/', async function (ctx: Context) {
    await send(ctx, 'index.html', { root: distRoot  });
  })
  // .get('/:file', async function(ctx: Context) {
  //   console.log('getting file ', cts.params.file)
  //   await send(ctx, ctx.params.file, { root: distRoot  });
  // })
  .get('/fonts/:file', async function(ctx: Context) {
    await send(ctx, ctx.params.file, { root: path.join(distRoot, 'fonts') });
  })
  .get('/*', async function (ctx: Context) {
    await send(ctx, 'index.html', { root: distRoot  });
  })
;

const apiRouter = initFileBasedRoutes(corpusRoot);

rootRouter.use(async function (ctx: Context, next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  return next();
}, apiRouter.routes());

app
  .use(rootRouter.routes())
  .use(rootRouter.allowedMethods())
  .use(json())
;

app.listen(9000, function() {
  console.log('Koa is listening to http://localhost:9000');
});
