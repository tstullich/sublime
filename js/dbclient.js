const env = require('habitat');
const redis = require('redis');

var dbclient = module.exports = {};

var config = env.load('.env/redis-cli.conf');

dbclient.setItem = function(img_name, title, testimonial) {
    var client = redis.createClient(config.port, config.address);
    testimonial = testimonial || 0; // testimonial can be optional so we need to check if it exists
    if (testimonial) {
        client.hmset(img_name, 'title', title, 'testimonial', testimonial);
    }
    else {
        client.hmset(img_name, 'title', title, 'testimonial', ''); // if no testimonial exists we set is as empty String
    }
    client.quit();
}

dbclient.getItem = function(img_name) {
    var client = redis.createClient(config.port, config.address);
    client.hmget(img_name, 'title', 'testimonial', function(err, reply) {
        if (err) {
            console.log('[REDIS] ' + err);
        }
        else {
            console.log('[REDIS] GET Response: ' + reply[0]);
            console.log('[REDIS] GET Response: ' + reply[1]);
        }
        client.quit();
    });
}
