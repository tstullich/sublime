const jade = require('jade');
const koala = require('koala');
const router = require('koa-router')();

var app = koala();

router.get('/', function *index(next) {
    yield next;
    var pageGen = jade.compileFile('js/index.jade');
    this.body = pageGen({pageTitle:'Sublime Handmades | Home'});
});

router.get('/contact', function *contact(next) {
    yield next;
    var pageGen = jade.compileFile('js/contact.jade');
    this.body = pageGen({pageTitle:'Sublime Handmades | Contact Me'});
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
console.log('listening on port 3000 in directory %s', __dirname);
