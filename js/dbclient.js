const bluebird = require('bluebird');
const env = require('habitat');
const redis = require('redis');

bluebird.promisifyAll(redis); // Promisfy module for easier asynchronous calls

var dbclient = module.exports = {};

var config = env.load('.env/redis-cli.conf');

function getID() {
    var client = redis.createClient(config.port, config.address);
    return client.getAsync('item_ID')
    .then(function(reply) {
        client.quit();
        var result = reply;
        return result;
    })
    .catch(function(err) {
        client.quit();
        console.log('[REDIS] ERROR:' + err);
    });
}

dbclient.setItem = function*(img_name, title, testimonial) {
    var client = redis.createClient(config.port, config.address);
    testimonial = testimonial || 0; // testimonial can be optional so we need to check if it exists
    var itemID = yield getID();
    console.log('ID: ' + itemID);
    if (testimonial) {
        return client.hmsetAsync(img_name, 'title', title, 'testimonial', testimonial)
        .then(function() {
            console.log('[REDIS] SET succeeded');
            client.quit();
            return true; // if the put succeeded return true
        })
        .catch(function(err) {
            console.log('[REDIS] ERROR: ' + err);
            client.quit();
            return false;
        });
    }
    else {
        return client.hmset(img_name, 'title', title, 'testimonial', '') // if no testimonial exists we set is as empty String
        .then(function() {
            console.log('[REDIS] SET succeeded');
            client.quit();
            return true;
        })
        .catch(function(err) {
            console.log('[REDIS] ERROR: ' + err);
            client.quit();
            return false;
        });
    }
}

dbclient.getItem = function*(img_name) {
    var client = redis.createClient(config.port, config.address);
    return client.hmgetAsync(img_name, 'title', 'testimonial')
    .then(function(reply) {
        console.log('[REDIS] GET ITEM reply: ' + reply);
        client.quit();
        var result = JSON.stringify(reply); // wrapping our reply to JSON
        return result;
    })
    .catch(function(err) {
        console.log('[REDIS] ERROR: ' + err);
        client.quit();
    });
}
