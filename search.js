var request = require('request');
var parseString = require('xml2js').parseString;

var api = require('./api');

module.exports = function(anime) {

    anime.search = function(query, callback) {
        var ret = {
            success: true,
            message: ''
        };

        anime.retrieveLogin(function(err, json) {
            if (err) {
                ret.success = false;
                ret.message = 'Please login with `anime login`';

                callback(ret);
            } else {
                search(query, json, callback, ret);
            }
        });
    };

    function search(query, auth, callback, ret) {
        request({
            'url': api['SEARCH'] + encodeURIComponent(query),
            'headers': {
                'User-Agent': api['USER_AGENT']
            },
            'auth': {
                'user': auth.username,
                'pass': auth.password,
                'sendImmediately': true
            }
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                
                parseString(body, function(err, result) {
                    var searchResults = [];
                    var entries = result.anime.entry;

                    for (var i = 0; i < Math.min(10, entries.length); i++) {
                        var english = (toString.call(entries[i].english) === "[object Array]") ? entries[i].english[0] : entries[i].english;
                        var sres = {
                            title: entries[i].title[0],
                            id: entries[i].id[0],
                            english: english,
                            episodes: entries[i].episodes[0]
                        }
                        searchResults.push(sres);
                    }

                    ret.searchResults = searchResults;
                    callback(ret);
                });

            } else {
                ret.success = false;
                ret.message = (response && response.statusCode === 204) ? 'No such animes found' : error.toString();

                callback(ret);
            }
        });
    }

};
