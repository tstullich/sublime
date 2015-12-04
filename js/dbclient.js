const bluebird = require('bluebird');
const env = require('habitat');
const redis = require('redis');

bluebird.promisifyAll(redis); // Promisfy module for easier asynchronous calls

var dbclient = module.exports = {};

var config = env.load('.env/redis-cli.conf');

function getID() {
    var client = redis.createClient(config.port, config.address);
    // Increment the item_ID field to create a new ID
    return client.incrAsync('item_ID')
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

// Function to add a new item to the database. Returns boolean indicating whether or not operation succeeded
dbclient.setItem = function*(img_name, title, testimonial) {
    // Test our inputs before continuing
    if (typeof img_name === undefined || typeof title === undefined) {
        console.log('[REDIS] ERROR: Not enough parameters defined. Cannot perform SET.');
        return false;
    }
    testimonial = typeof testimonial !== 'undefined' ? testimonial : '';
    console.log('HMSET Params: %s %s %s', img_name, title, testimonial);

    var client = redis.createClient(config.port, config.address);
    var itemID = yield getID();
    console.log('[REDIS] New Item ID: %s', itemID);
    // Testimonials are optional so we need to determine how we set the data
    return client.hmsetAsync(itemID, 'img_name', img_name, 'title', title, 'testimonial', testimonial)
    .then(function() {
        return client.lpushAsync('item_list', itemID) // Need to push new ID to list of items
        .then(function() {
            console.log('[REDIS] Set Item operations Succeeded');
            return true; // if the operations succeeded return true
        })
        .catch(function(err) {
            console.log('[REDIS] %s', err);
        });
        client.quit();
    })
    .catch(function(err) {
        console.log('[REDIS] ERROR: %s',  err);
        client.quit();
        return false;
    });
}

dbclient.getItem = function*(item_id) {
    if (typeof item_id === undefined) {
        console.log('[REDIS] ERROR: Not enough parameters defined. Cannot perform GET');
    }

    var client = redis.createClient(config.port, config.address);
    return client.hmgetAsync(item_id, 'img_name', 'title', 'testimonial')
    .then(function(reply) {
        console.log('[REDIS] GET ITEM reply: ' + reply);
        client.quit();

        // This is terrible and I hate it. Need to change this ASAP
        var result = {};
        result['img_name'] = reply[0];
        result['title'] = reply[1];
        result['testimonial'] = reply[2] !== null ? reply[2] : 'N/A';
        return JSON.stringify(result); // wrapping our reply to JSON
    })
    .catch(function(err) {
        console.log('[REDIS] ERROR: ' + err);
        client.quit();
    });
}
