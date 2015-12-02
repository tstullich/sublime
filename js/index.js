const jade = require('jade');
const koala = require('koala');
const router = require('koa-router')();
const dbClient = require('./dbclient');
// const env = require('habitat');

console.log('Starting up...')

// Set up koala
var app = koala({
    fileServer: {
        maxAge: '1 minute'
    }
});

// Configure routes
router.get('/', function *index() {
    var pageGen = jade.compileFile('templates/index.jade');
    this.type = 'html';
    this.status = 200;
    this.body = pageGen({pageTitle:'Sublime Handmades | Home'});
});

router.get('/gallery', function *about() {
    var pageGen = jade.compileFile('templates/gallery.jade');
    this.type = 'html';
    this.status = 200;
    this.body = pageGen({pageTitle:'Sublime Handmades | Gallery'});
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
console.log('Listening on port 3000 in directory %s', __dirname);
