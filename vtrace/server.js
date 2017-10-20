
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const path = require('path');
const send = require('koa-send');
const json = require('koa-json');
const fs = require('fs');
const _ = require('underscore');

const router = new Router();
const app = new Koa();

render(app, {
    root: path.join(__dirname, 'view'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    debug: false
});

// Serve public assets

router
    .get('/js/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: __dirname + '/www' });
    })
    .get('/lib/:file', async function(ctx, next) {
        await send(ctx, ctx.params.file, { root: __dirname + '/lib' });
    }) ;

function buildCorpusEntryTable(options) {

    let dirEntries = fs.readdirSync(options.corpusRoot);

    let corpusEntries = _.filter(dirEntries, function(entry) {
        let path = options.corpusRoot + '/' + entry;
        let stats = fs.statSync(path);
        return stats.isDirectory() && entry.endsWith(".d");
    });

    return corpusEntries;
}

function buildMenuOrig(options, corpusEntries) {
    let menu = _.map(corpusEntries, (entry) => {
        let path = options.corpusRoot + '/' + entry + '/tracelogs/tracelog.json' ;

        if (fs.exists(path)) {
            let stats = fs.statSync(path);
            let menuEntry = {
                'entry': entry
            };

            if(stats.isFile()) {
                menuEntry.logfile =  path;
            }
            return menuEntry;
        } else {
            let menuEntry = {
                'entry': entry,
                'logfile': ""
            };

            return menuEntry;

        }
    });
    return menu;
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
            let basepath = options.corpusRoot + '/'+ ctx.params.entry + '/tracelogs';
            let logfile = ctx.params.log;
            console.log("/vtrace/json root ", basepath, '/', logfile);
            await send(ctx, logfile, {
                root: basepath
            });
        })
        .get('/vtrace/:entry/', async function(ctx, next) {
            let { entry: entry } = ctx.params;
            ctx.redirect(`/vtrace/${entry}/page-0-textgrid.json`);
            ctx.status = 301;

            // let { entry: entry } = ctx.params;
            // await ctx.render('vtracer', {
            //     locals: {context: {entry: entry, logfile: `${entry}/tracelogs/page-0-textgrid.json`}}
            // });
        })
        .get('/vtrace/:entry/:logfile', async function(ctx, next) {
            let { entry: entry, logfile: logfile } = ctx.params;
            await ctx.render('vtracer', {
                locals: {ctx: {entry: entry, logfile: logfile}}
            });
        })
        // .get('/vtrace/:entry/:logfile', async function(ctx, next) {
        //     await ctx.render('vtracer');
        // })
        .get('/menu', async function(ctx, next) {
            ctx.body = await JSON.stringify(menu);
        })
        .get('/', async function (ctx, next) {
            await ctx.render('menu');
        })
    ;

    app.use(router.routes())
        .use(router.allowedMethods())
        .use(json())
    ;


    var server = app.listen(3000, function() {
        console.log('Koa is listening to http://localhost:3000');
    });
}


exports.run = run;
