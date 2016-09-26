const pug = require('pug');
const koala = require('koala');
const router = require('koa-router')();
const db = require('./js/dbclient');

console.log('Starting up...')

// Set up koala
var app = koala({
    fileServer: {
        maxAge: '1 minute'
    }
});

// Configure routes
router.get('/', function *index() {
    var pageGen = pug.compileFile('templates/index.pug');
    this.type = 'html';
    this.status = 200;
    this.body = pageGen({pageTitle:'Sublime Handmades | Gallery'});
});

router.get('/gallery', function *about() {
    var pageGen = pug.compileFile('templates/gallery.pug');
    this.type = 'html';
    this.status = 200;
    this.body = pageGen({pageTitle:'Sublime Handmades | Gallery'});
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
console.log('Listening on port 3000 in directory %s', __dirname);
