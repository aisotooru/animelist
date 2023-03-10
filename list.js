var request = require('request');
var parseString = require('xml2js').parseString;

var api = require('./api');

module.exports = function(anime) {

    anime.add = function(id, episodes, status, callback) {
        var ret = {
            success: true,
            message: ''
        };

        anime.retrieveLogin(function(err, json) {
            add(id, episodes, status, json, callback, ret);
        });
    };

    function add(id, episodes, status, auth, callback, ret) {
        request({
            'url': api['ADD'] + id + '.xml',
            'auth': {
                'user': auth.username,
                'pass': auth.password,
                'sendImmediately': true
            },
            'headers': {
                'User-Agent': api['USER_AGENT']
            },
            'method': 'POST',
            'form': constructXML(episodes, status)
        }, function(error, response, body) {
            if (!error && Math.floor(response.statusCode / 10) === 20) {

                callback(ret);

            } else {
                ret.success = false;
                ret.message = response.statusCode;

                callback(ret);
            }
        });
    }

    function constructXML(episodes, status) {
        return {
            data: '<?xml version="1.0" encoding="UTF-8"?>' +
                '<entry>' +
                '<status>' + status + '</status>' +
                '<episode>' + ((status === 'completed') ? episodes : '0') + '</episode>' +
                '</entry>'
        };
    }

}
