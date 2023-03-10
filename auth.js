var request = require('request');
var parseString = require('xml2js').parseString;
var fs = require('fs');

var api = require('./api');

module.exports = function(anime) {
    anime.login = function(username, password, callback) {
        var self = this;
        var ret = {
            success: true,
            username: '',
            id: '',
            message: ''
        };

        request({
            'url': api['VERIFY_CREDENTIALS'],
            'headers': {
                'User-Agent': api['USER_AGENT']
            },
            'auth': {
                'user': username,
                'pass': password,
                'sendImmediately': true
            }
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                saveLogin(username, password, function(err) {
                    if (err) {
                        ret.success = false;
                        ret.message = 'Credentials could not be saved';

                        callback(ret);
                    } else {
                        parseString(body, function(err, result) {
                            ret.username = result.user.username[0];
                            ret.id = result.user.id[0];

                            callback(ret);
                        });
                    }
                });
            } else {
                ret.success = false;
                ret.message = 'Credentials not valid'

                callback(ret);
            }
        });
    };

    anime.logout = function(callback) {
        removeLogin(callback);
    };

    anime.retrieveLogin = function(callback) {
        fs.readFile(getAuthFile(), function(err, data) {
            var json = {};
            if (!err) {
                json = JSON.parse(data);
            }

            callback(err, json);
        });
    };

    function saveLogin(username, password, callback) {
        var json = JSON.stringify({
            'username': username,
            'password': password
        });
        fs.writeFile(getAuthFile(), json, function(err) {
            callback(err);
        });
    }

    function removeLogin(callback) {
        fs.unlink(getAuthFile(), callback);
    }

    function getAuthFile() {
        var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        return home + '/.anime';
    }
};
