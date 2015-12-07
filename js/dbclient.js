const bluebird = require('bluebird');
const env = require('habitat');
const redis = require('redis');

bluebird.promisifyAll(redis); // Promisfy module for easier asynchronous calls

var dbclient = module.exports = {};

var config = env.load('.env/redis-cli.conf');

// Creates a new item ID every time this function is called
function getNewID() {
    var client = redis.createClient(config.port, config.address);
    // Increment the item_ID field to create a new ID
    return client.incrAsync('item_ID')
    .then(function(reply) {
        client.quit();
        var id = reply;
        return id;
    })
    .catch(function(err) {
        client.quit();
        console.log('[REDIS] %', err);
    });
}

// Function to add a new item to the database. Returns boolean indicating whether or not operation succeeded
dbclient.setItem = function*(imgName, title, testimonial) {
    // Test our inputs before continuing
    if (typeof imgName === undefined || typeof title === undefined) {
        console.log('[REDIS] ERROR: Not enough parameters defined. Cannot perform SET.');
        return false;
    }
    // Testimonials are optional so we need to check if it has been defined
    testimonial = typeof testimonial !== 'undefined' ? testimonial : '';

    var client = redis.createClient(config.port, config.address);
    var itemID = yield getNewID();
    return client.hmsetAsync(itemID, 'imgName', imgName, 'title', title, 'testimonial', testimonial)
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
        console.log('[REDIS] %s',  err);
        client.quit();
        return false;
    });
}

// Finds a single item in database based on the item id
dbclient.getItem = function*(itemID) {
    if (typeof itemID === undefined) {
        console.log('[REDIS] ERROR: Not enough parameters defined. Cannot perform GET');
        return null;
    }

    var client = redis.createClient(config.port, config.address);
    return client.hgetallAsync(itemID)
    .then(function(reply) {
        console.log('[REDIS] GET ITEM reply: %s', reply);
        client.quit();
        return JSON.stringify(reply); // transform our reply to JSON before returning
    })
    .catch(function(err) {
        console.log('[REDIS] %s', err);
        client.quit();
    });
}

/* Queries the database to find a range of item IDs and returns it in a JSON object
 * The reply will return the items from the most recent item pushed into the
 * list, which means that a startIndex at 0 will return the most recent item.
 * Think of the list as a stack rather than a traditional list.
 * TODO will need to implement some bounds-checking since Redis does not do this by default
 */
dbclient.getItemIDs = function*(startIndex, numItems) {
    var client = redis.createClient(config.port, config.address);
    return client.lrangeAsync('item_list', startIndex, numItems - 1)
    .then(function(reply) {
        client.quit();
        return JSON.stringify(reply);
    })
    .catch(function(err) {
        console.log('[REDIS] %s' + err);
        client.quit();
    });
}

// Removes an item from the database based on the item id
// Returns a boolean to indicate if the two operations succeeded
dbclient.deleteItem = function*(itemID) {
    var client = redis.createClient(config.port, config.address);
    // We will first delete the hash key that has our values mapped to it
    return client.delAsync(itemID)
    .then(function(reply) {
        console.log('[REDIS] Removed hashed object: %s', reply);
        // Removing the item from our list of up-to-date item IDs
        return client.lremAsync('item_list', 1, itemID)
        .then(function(reply) {
            console.log('[REDIS] Removed ID from list')
            client.quit();
            return true;
        })
        .catch(function(err) {
            console.log('[REDIS] %s', err);
            client.quit();
            return false;
        });
    })
    .catch(function(err) {
        console.log('[REDIS] %s', err);
        client.quit();
        return false;
    });
}
