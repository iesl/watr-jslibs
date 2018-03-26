
/* global require __dirname */

// const options = require('commander');
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const path = require('path');
const send = require('koa-send');
const json = require('koa-json');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const config = require('../../webpack.config.js');
const compiler = webpack(config);

const router = new Router();
const app = new Koa();

let projectRoot = path.resolve(__dirname, '../..' );
let srcRoot = path.resolve(projectRoot, 'src');
let devRoot = path.resolve(srcRoot, 'dev');
let devDataRoot = path.resolve(devRoot, 'data');
let srcClientRoot = path.resolve(srcRoot, 'client');
let distRoot = path.resolve(projectRoot, 'dist');
let projectParent = path.resolve(projectRoot, '..');
let watrmarksLib = path.resolve(projectParent, './watr-marks/js/target/scala-2.12');

console.log('srcRoot', srcRoot);
console.log('srcClientRoot', srcClientRoot);
console.log('projectRoot', projectRoot);
console.log('devData', devDataRoot);
console.log('config publicPath', config.output.path);

render(app, {
    root: path.join(devRoot, 'view'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    debug: false
});

// Serve public assets

router
    .get('/dist/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: distRoot  });
    })
    .get('/view/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: path.join(devRoot, 'view') });
    })
    .get('/scalajs/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: watrmarksLib });
    })
    .get('/client/lib/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: path.join(srcClientRoot, 'lib') });
    })
    .get('/style/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: srcRoot + '/style' });
    })
    .get('/image/page/:pagenum', async function(ctx, next) {
        let pagenum = ctx.params.pagenum;
        let p = path.resolve(devDataRoot, `corpus-entry-0/page-images`);
        let file = `page-${pagenum}.opt.png`;
        await send(ctx, file, { root: p } );
    })
    .get('/data/textgrid', async function(ctx, next) {
        let p = path.resolve(devDataRoot, `corpus-entry-0`);
        let file = 'textgrid.json';
        await send(ctx, file, { root: p  });
    })
    .get('/api/v1/corpus/artifacts/entry/:stableId/image/page/:pagenum' , async function(ctx, next) {
        let pagenum = ctx.params.pagenum;
        let p = path.resolve(devDataRoot, `corpus-entry-0/page-images`);
        let file = `page-${pagenum}.opt.png`;
        await send(ctx, file, { root: p } );
    })
    .get('/api/v1/labeling/zones/undefined' , async function(ctx, next) {
        ctx.body = {};
    })
;


function run (options) {

    router
        .get('/', async function (ctx) {
            await ctx.render('index', {});
        })
        .get('/:page', async function (ctx) {
            let { page: page } = ctx.params;
            await ctx.render(page, {});
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

    const server = app.listen(9000, function() {
        console.log('Koa is listening to http://localhost:9000');
    });
}

run();
