
import Koa, { Context } from 'koa';
import  Router from 'koa-router';
import  path   from 'path';
import  send   from 'koa-send';
import  json   from 'koa-json';
import opts from 'commander';


const router = new Router();
const app = new Koa();

opts
  .version('0.1.0')
  .option('--corpus <path>', 'Path to corpus')
  .option('--public <path>', 'Path public assets')
  .parse(process.argv)
;

const distRoot =  opts.public;

router
  .get('/', async function (ctx: Context) {
    await send(ctx, 'index.html', { root: distRoot  });
  })
  .get('/:file', async function(ctx: Context) {
    await send(ctx, ctx.params.file, { root: distRoot  });
  })
  .get('/fonts/:file', async function(ctx: Context) {
    await send(ctx, ctx.params.file, { root: path.join(distRoot, 'fonts') });
  })
  // .get('/app.js', async function (ctx: Context) {
  //   await send(ctx, 'app.js', { root: distRoot  });
  // })
;

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(json())
;

app.listen(9000, function() {
  console.log('Koa is listening to http://localhost:9000');
});
