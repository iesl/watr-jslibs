
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
    ctx.body = 'Hello World';
});

// app.listen(3000);


var server = app.listen(3000, function() {
    console.log('Koa is listening to http://localhost:3000');
});


