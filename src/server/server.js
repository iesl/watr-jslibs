
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const path = require('path');
const send = require('koa-send');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');

const fs = require('fs');

const _ = require('lodash');


const router = new Router();
const app = new Koa();

let serverRoot = path.resolve(__dirname, '..');
let distRoot = path.resolve(serverRoot, '..');

console.log('serverRoot', serverRoot);

render(app, {
    root: path.join(serverRoot, 'view'),
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
    .get('/style/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: serverRoot + '/style' });
    })
;


function buildCorpusEntryTable(options) {

    let dirEntries = fs.readdirSync(options.corpusRoot);

    let corpusEntries = _.filter(dirEntries, function(entry) {
        let path = options.corpusRoot + '/' + entry;
        let stats = fs.statSync(path);
        return stats.isDirectory() && entry.endsWith(".d");
    });

    return corpusEntries;
}

function buildMenu(options, corpusEntries) {
    let menu = _.map(corpusEntries, (entry) => {
        let tracelogDir = options.corpusRoot + '/' + entry + '/tracelogs' ;

        let dirEntries = fs.readdirSync(tracelogDir);

        let logEntries = _.filter(dirEntries, function(entry) {
            let path = tracelogDir + '/' + entry;
            let stats = fs.statSync(path);
            return stats.isFile() && entry.endsWith(".json");
        });

        let fqLogPaths = _.map(logEntries, (e) => {
            return entry + '/' + e;
        });

        let menuEntry = {
            'entry': entry,
            'logfiles': fqLogPaths
        };

        return menuEntry;

    });
    return menu;
}


function run (options) {

    let entryRoot = entry => `${options.corpusRoot}/${entry}`;


    let corpusEntries = buildCorpusEntryTable(options);

    let menu = buildMenu(options, corpusEntries);

    router
        .post('/api/v1/label', koaBody(), async function(ctx) {
            console.log(ctx.request.body);
            ctx.body = JSON.stringify(ctx.request.body);
            // this.body = {};

        })
        .get('/entry/:entry/image/page/:page', async function(ctx, next) {
            let { entry: entry, page: page } = ctx.params;
            let file = `page-${page}.opt.png`;
            let basepath = `${entryRoot(entry)}/page-images/`;
            await send(ctx, file, { root: basepath });
        })
        .get('/entry/:entry/image/thumb/:page', async function(ctx, next) {
            let { entry: entry, page: page } = ctx.params;
            let file = `page-${page}.png`;
            let basepath = `${entryRoot(entry)}/page-thumbs/`;
            console.log('thumb', basepath, file);
            await send(ctx, file, { root: basepath });
        })
        .get('/vtrace/json/:entry/:log', async function(ctx, next) {
            // let basepath = options.corpusRoot + '/'+ ctx.params.entry + '/tracelogs';
            let entry  = ctx.params.entry;
            let log  = ctx.params.log;
            let basepath = `${entryRoot(entry)}/tracelogs`;
            console.log("GET /vtrace/json/:entry/:log", basepath, '/', log);
            console.log("GET /vtrace/json/:entry/:log", basepath, '/', log, 'entry=', entry);
            await send(ctx, log, {
                root: basepath
            });
        })
        .get('/vtrace/:entry/', async function(ctx, next) {
            let { entry: entry } = ctx.params;
            // ctx.redirect(`/vtrace/${entry}/textgrid.json`);
            // ctx.status = 301;
            await ctx.render('annot-main');
        })
        .get('/vtrace/:entry/:logfile', async function(ctx, next) {
            let { entry: entry, logfile: logfile } = ctx.params;
            await ctx.render('annot-main', {
                locals: {ctx: {entry: entry, logfile: logfile}}
            });
        })
        .get('/menu', async function(ctx, next) {
            ctx.body = await JSON.stringify(menu);
        })
        .get('/', async function (ctx, next) {
            await ctx.render('menu-main');
        })
    ;


    app.use(router.routes())
        .use(router.allowedMethods())
        .use(json())
        // .use(bodyParser())
    ;
    // app.use(async (ctx, next) => {
    //     // the parsed body will store in ctx.request.body
    //     // if nothing was parsed, body will be an empty object {}
    //     ctx.body = ctx.request.body;
    //     await next();
    // });
    // app.use(koaBody());
    // app.use(ctx => {
    //     ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
    // });


    var server = app.listen(3000, function() {
        console.log('Koa is listening to http://localhost:3000');
    });
}


exports.run = run;
