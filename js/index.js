const jade = require('jade');
const koala = require('koala');
const router = require('koa-router')();

console.log('Starting up...')

var app = koala({
    fileServer: {
        maxAge: '1 minute'
    }
});

router.get('/', function *index(next) {
    yield next;
    var pageGen = jade.compileFile('js/index.jade');
    this.body = pageGen({pageTitle:'Sublime Handmades | Home'});
});

router.get('/gallery', function *about(next) {
    yield next;
    var pageGen = jade.compileFile('js/gallery.jade');
    this.body = pageGen({pageTitle:'Sublime Handmades | Gallery'});
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
console.log('Listening on port 3000 in directory %s', __dirname);
