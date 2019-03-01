
import Koa, { Context } from 'koa';
import  Router from 'koa-router';
import  render from 'koa-ejs';
import  path   from 'path';
import  send   from 'koa-send';
import  json   from 'koa-json';
import opts from 'commander';


const router = new Router();
const app = new Koa();

const projectRoot = path.resolve(__dirname, '../..' );
// const srcRoot = path.resolve(projectRoot, 'src');
// const devRoot = path.resolve(srcRoot, 'dev');
// const devDataRoot = path.resolve(devRoot, 'data');
// const srcClientRoot = path.resolve(srcRoot, 'client');
const projectParent = path.resolve(projectRoot, '..');
const watrmarksLib = path.resolve(projectParent, './watr-marks/js/target/scala-2.12');


opts
  .version('0.1.0')
  .option('--corpus <path>', 'Path to corpus')
  .option('--public <path>', 'Path public assets')
  .parse(process.argv)
;


console.log('corpus root', opts.corpus);
console.log('corpus root', opts.public);
const distRoot =  opts.public;// path.resolve(projectRoot, 'dist');


// console.log('srcRoot', srcRoot);
// console.log('srcClientRoot', srcClientRoot);
// console.log('projectRoot', projectRoot);
// console.log('devData', devDataRoot);
// console.log('config publicPath', config.output.path);

// render(app, {
//   root: path.join(devRoot, 'view'),
//   layout: 'template',
//   viewExt: 'html',
//   cache: false,
//   debug: false
// });

// Serve public assets

router
  .get('/:file', async function(ctx: Context) {
    await send(ctx, ctx.params.file, { root: distRoot  });
  })
  .get('/fonts/:file', async function(ctx: Context) {
    await send(ctx, ctx.params.file, { root: path.join(distRoot, 'fonts') });
  })
  .get('/dist/:file', async function(ctx: Context) {
    await send(ctx, ctx.params.file, { root: distRoot  });
  })
  .get('/scalajs/:file', async function(ctx: Context) {
    await send(ctx, ctx.params.file, { root: watrmarksLib });
  })
  // .get('/client/lib/:file', async function(ctx: Context) {
  //   await send(ctx, ctx.params.file, { root: path.join(srcClientRoot, 'lib') });
  // })
  // .get('/style/:file', async function(ctx: Context) {
  //   await send(ctx, ctx.params.file, { root: srcRoot + '/style' });
  // })
  // .get('/image/page/:pagenum', async function(ctx: Context) {
  //   const pagenum = ctx.params.pagenum;
  //   const p = path.resolve(devDataRoot, `corpus-entry-0/page-images`);
  //   const file = `page-${pagenum}.opt.png`;
  //   await send(ctx, file, { root: p } );
  // })
  // .get('/data/textgrids/:num', async function(ctx: Context) {
  //   const num = ctx.params.num;
  //   const p = path.resolve(devDataRoot, `textgrids`);
  //   const file = `textgrid-${num}.json`;
  //   await send(ctx, file, { root: p  });
  // })
  // .get('/data/textgrid', async function(ctx: Context) {
  //   const p = path.resolve(devDataRoot, `corpus-entry-0`);
  //   const file = 'textgrid.json';
  //   await send(ctx, file, { root: p  });
  // })
  // .get('/data/tracelog/:num', async function(ctx: Context) {
  //   const num = ctx.params.num;
  //   const p = path.resolve(devDataRoot, `tracelogs`);
  //   const file = `tracelog-${num}.json`;
  //   await send(ctx, file, { root: p  });
  // })
  // .get('/api/v1/corpus/artifacts/entry/:stableId/image/page/:pagenum' , async function(ctx: Context) {
  //   const pagenum = ctx.params.pagenum;
  //   const p = path.resolve(devDataRoot, `corpus-entry-0/page-images`);
  //   const file = `page-${pagenum}.opt.png`;
  //   await send(ctx, file, { root: p } );
  // })
  // .get('/api/v1/labeling/zones/undefined' , async function(ctx: Context) {
  //   ctx.body = {};
  // })
;


function run () {

  router
    .get('/', async function (ctx: Context) {
      await send(ctx, 'index.html', { root: distRoot  });
    })
    .get('/app.js', async function (ctx: Context) {
      await send(ctx, 'app.js', { root: distRoot  });
    })
  ;

  app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(json())
  ;
  // .use(webpackDevMiddleware(compiler, {
  //     publicPath: config.output.path
  // }))

  // const server =
  app.listen(9000, function() {
    console.log('Koa is listening to http://localhost:9000');
  });
}

run();
