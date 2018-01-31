
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
const config = require('./webpack.config.js');
const compiler = webpack(config);

// const bodyParser = require('koa-bodyparser');
// const koaBody = require('koa-body');
// const fs = require('fs');
// const _ = require('lodash');


const router = new Router();
const app = new Koa();

let serverRoot = path.resolve(__dirname, '..' );
let srcRoot = path.resolve(__dirname, 'src');
let srcClientRoot = path.resolve(srcRoot, 'client');
let distRoot = path.resolve(__dirname, '.');
// let watrmarksLib = path.resolve(serverRoot, '../watr-marks/js/target/scala-2.12/watrmarks-fastopt.js');
let watrmarksLib = path.resolve(serverRoot, './watr-marks/js/target/scala-2.12');

// console.log('serverRoot', serverRoot);

render(app, {
    root: path.join(srcRoot, 'view'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    debug: false
});

// Serve public assets

router
    .get('/dist/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: distRoot + '/dist' });
    })
    .get('/view/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: path.join(srcRoot, 'view') });
    })
    .get('/scalajs/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: watrmarksLib });
    })
    .get('/client/lib/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: path.join(srcClientRoot, 'lib') });
    })
    .get('/style/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: distRoot + '/style' });
    })
;


function run (options) {

    // let entryRoot = entry => `${options.corpusRoot}/${entry}`;

    router
        .get('/:page', async function (ctx) {
            let { page: page } = ctx.params;
            console.log('rendering', page);
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

    var server = app.listen(9000, function() {
        console.log('Koa is listening to http://localhost:9000');
    });
}

run({
    corpusRoot: '../../datasets/test-corpora.d/corpus-test'
});



// options
//     .version('1.0')
//     .option('--corpus [corpus root]', 'root path of corpus')
//     .parse(process.argv);

// if (options.corpus == undefined) {
//     options.help();
// }

// var cwd = process.cwd();

// var root = cwd + '/' + options.corpus;
// options.corpusRoot = root;

// console.log('starting in corpus', root);

// require('./server.js').run(options);
