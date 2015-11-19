var jade = require('jade');
var mount = require('koa-mount')
var koa = require('koa')

function *index(next) {
    yield next;
    // compile
    var fn = jade.compileFile('index.jade');
    this.body = fn({pageTitle:'Sublime Handmades | Home'});
}

var app = koa();

app.use(mount(index));
app.listen(3000);
console.log('listening on port 3000');
console.log('Path: %s', this.path)
