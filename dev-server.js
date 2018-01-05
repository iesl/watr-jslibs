
/* global require __dirname */

const options = require('commander');
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const path = require('path');
const send = require('koa-send');
const json = require('koa-json');
// const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const config = require('./webpack.config.js');
const compiler = webpack(config);

const fs = require('fs');

const _ = require('lodash');


const router = new Router();
const app = new Koa();

let serverRoot = path.resolve(__dirname, '..' );
let srcRoot = path.resolve(__dirname, 'src');
let srcClientRoot = path.resolve(srcRoot, 'client');
let distRoot = path.resolve(__dirname, '.');
// let watrmarksLib = path.resolve(serverRoot, '../watr-marks/js/target/scala-2.12/watrmarks-fastopt.js');
let watrmarksLib = path.resolve(serverRoot, './watr-marks/js/target/scala-2.12');

// console.log('serverRoot', serverRoot);

let r = render(app, {
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

    let entryRoot = entry => `${options.corpusRoot}/${entry}`;


    // let corpusEntries = buildCorpusEntryTable(options);
    // let menu = buildMenu(options, corpusEntries);

    router
        .get('/', async function (ctx, next) {
            ctx.body = 'hello there'; // ctx.render('menu-main');
        })
        .get('/reflow-widget', async function (ctx) {
            await ctx.render('reflow-widget', {
                initscript: 'reflow-widget.js'
            });
        })
        // .post('/api/v1/label', koaBody(), async function(ctx) {
        //     console.log(ctx.request.body);
        //     ctx.body = JSON.stringify(ctx.request.body);
        //     // this.body = {};

        // })
        // .get('/entry/:entry/image/page/:page', async function(ctx, next) {
        //     let { entry: entry, page: page } = ctx.params;
        //     let file = `page-${page}.opt.png`;
        //     let basepath = `${entryRoot(entry)}/page-images/`;
        //     await send(ctx, file, { root: basepath });
        // })
        // .get('/entry/:entry/image/thumb/:page', async function(ctx, next) {
        //     let { entry: entry, page: page } = ctx.params;
        //     let file = `page-${page}.png`;
        //     let basepath = `${entryRoot(entry)}/page-thumbs/`;
        //     console.log('thumb', basepath, file);
        //     await send(ctx, file, { root: basepath });
        // })
        // .get('/vtrace/json/:entry/:log', async function(ctx, next) {
        //     // let basepath = options.corpusRoot + '/'+ ctx.params.entry + '/tracelogs';
        //     let entry  = ctx.params.entry;
        //     let log  = ctx.params.log;
        //     let basepath = `${entryRoot(entry)}/tracelogs`;
        //     console.log("GET /vtrace/json/:entry/:log", basepath, '/', log);
        //     console.log("GET /vtrace/json/:entry/:log", basepath, '/', log, 'entry=', entry);
        //     await send(ctx, log, {
        //         root: basepath
        //     });
        // })
        // .get('/vtrace/:entry/', async function(ctx, next) {
        //     let { entry: entry } = ctx.params;
        //     // ctx.redirect(`/vtrace/${entry}/textgrid.json`);
        //     // ctx.status = 301;
        //     await ctx.render('annot-main');
        // })
        // .get('/vtrace/:entry/:logfile', async function(ctx, next) {
        //     let { entry: entry, logfile: logfile } = ctx.params;
        //     await ctx.render('annot-main', {
        //         locals: {ctx: {entry: entry, logfile: logfile}}
        //     });
        // })
        // .get('/menu', async function(ctx, next) {
        //     ctx.body = await JSON.stringify(menu);
        // })
    ;

    app
        .use(router.routes())
        .use(router.allowedMethods())
        .use(json())
    ;
    //     .use(webpackDevMiddleware(compiler, {
    //         publicPath: config.output.publicPath
    //     }));
    // app
        // .use(webpackDevMiddleware(compiler, {
        //     publicPath: config.output.publicPath
        // }));
        // .use(bodyParser())

    var server = app.listen(3000, function() {
        console.log('Koa is listening to http://localhost:3000');
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
