
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const path = require('path');
const send = require('koa-send');
const fs = require('fs');
const router = new Router();
const app = new Koa();

render(app, {
    root: path.join(__dirname, 'view'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    debug: false
});



function run (options) {

    router
        .get('/vtrace', async function(ctx, next) {
            console.log("/vtrace sending", options.basename);
            await send(ctx, options.basename, { root: options.dirname });
        })
        .get('/js/:file', async function(ctx, next) {
            await send(ctx, ctx.params.file, { root: __dirname + '/js' });
        })
        .get('/lib/:file', async function(ctx, next) {
            await send(ctx, ctx.params.file, { root: __dirname + '/lib' });
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
