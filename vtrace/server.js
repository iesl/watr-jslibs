
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

function run (options) {

    let dirEntries = fs.readdirSync(options.corpusRoot);


    let corpusEntries = _.filter(dirEntries, function(entry) {
        let path = options.corpusRoot + '/' + entry;
        let stats = fs.statSync(path);
        return stats.isDirectory() && entry.endsWith(".d");
    });

    console.log("corpusEntries", corpusEntries);

    let menu = _.map(corpusEntries, (entry) => {
        let path = options.corpusRoot + '/' + entry + '/tracelogs/tracelog.json' ;
        let stats = fs.statSync(path);
        let menuEntry = {
            'entry': entry
        };

        if(stats.isFile()) {
            menuEntry.logfile =  path;
        }
        return menuEntry;
    });

    router
        .get('/vtrace/:entry', async function(ctx, next) {
            await ctx.render('vtracer');
        })
        .get('/vtrace/json/:entry', async function(ctx, next) {
            let basepath = options.corpusRoot + '/'+ ctx.params.entry + '/tracelogs';
            console.log("/vtrace/json root ", basepath);
            await send(ctx, 'tracelog.json', {
                root: basepath
            });
        })
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

function runSingleLog (options) {


    router
        .get('/vtrace', async function(ctx, next) {
            console.log("/vtrace sending", options.basename);
            await send(ctx, options.basename, { root: options.dirname });
        })
        .get('/', async function (ctx, next) {
            await ctx.render('index');
        })
    ;

    app.use(router.routes())
        .use(router.allowedMethods());


    var server = app.listen(3000, function() {
        console.log('Koa is listening to http://localhost:3000');
    });
}

exports.run = run;
