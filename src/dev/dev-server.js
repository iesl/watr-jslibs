
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
let srcClientRoot = path.resolve(srcRoot, 'client');
let distRoot = path.resolve(projectRoot, 'dist');
let projectParent = path.resolve(projectRoot, '..');
let watrmarksLib = path.resolve(projectParent, './watr-marks/js/target/scala-2.12');

console.log('srcRoot', srcRoot);
console.log('srcClientRoot', srcClientRoot);
console.log('projectRoot', projectRoot);

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
        // .get('/entry/:entry/image/page/:page', async function(ctx, next) {
        //     let { entry: entry, page: page } = ctx.params;
        //     let file = `page-${page}.opt.png`;
        //     let basepath = `${entryRoot(entry)}/page-images/`;
        //     await send(ctx, file, { root: basepath });
        // })
        // .get('/menu', async function(ctx, next) {
        //     ctx.body = await JSON.stringify(menu);
        // })
    ;

    app
        .use(router.routes())
        .use(router.allowedMethods())
        .use(json())
        .use(webpackDevMiddleware(compiler, {
            publicPath: config.output.publicPath
        }));

    const server = app.listen(9000, function() {
        console.log('Koa is listening to http://localhost:9000');
    });
}

run();


