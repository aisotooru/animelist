#!/usr/bin/env node

var program = require('commander');
var prompt = require('prompt');

var anime = require('./index');

program
    .option('login, --login', 'Login to MyAnimeList')
    .option('logout, --logout', 'Logout of MyAnimeList')
    .option('add, --add <anime-name status(optional)>', 'Add an anime to your MyAnimeList, status is `completed` by default and can be watching|completed|onhold|dropped|plantowatch')
    .parse(process.argv);

if (program.login) {
    var schema = {
        properties: {
            username: {
                required: true
            },
            password: {
                required: true,
                hidden: true,
                message: 'password (typing will be hidden)'
            }
        }
    }
    prompt.message = 'Credentials';

    prompt.start();

    prompt.get(schema, function(err, result) {
        anime.login(result.username, result.password, function(ret) {
            if (ret.success) {
                console.log('Success!');
                console.log(ret);
            } else {
                console.log('Unsuccessful! ' + ret.message)
            }
        });
    });
} else if (program.logout) {
    anime.logout(function(err) {
        if (!err) {
            console.log('Successfully logged out!');
        }
    });
} else if (program.add) {
    anime.search(program.add, function(ret) {
        if (ret.success) {

            if (ret.searchResults.length > 1) {
                for (var i = 0; i < ret.searchResults.length; i++) {
                    var english = (ret.searchResults[i].english.length > 0) ? ('(' + ret.searchResults[i].english + ')') : '';
                    var name = ret.searchResults[i].title + ' ' + english;
                    console.log('[' + (i + 1) + '] ' + name);
                }

                var schema = {
                    properties: {
                        number: {
                            required: true,
                            pattern: /^[0-9]+/,
                            description: '[#] anime to add'
                        }
                    }
                }
                prompt.message = 'Choose';

                prompt.start();

                prompt.get(schema, function(err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    addAnime(ret.searchResults[result.number - 1].id, ret.searchResults[result.number - 1].episodes, program.args[0] || 'completed');
                });
            } else {
                addAnime(ret.searchResults[0].id, ret.searchResults[0].episodes, program.args[0] || 'completed');
            }

        } else {
            console.log('Unsuccessful! ' + ret.message);
        }
    });
} else {
    program.help();
}

function addAnime(id, episodes, status) {
    anime.add(id, episodes, status, function(ret) {
        if (ret.success) {
            console.log('Added successfully!');
        } else {
            console.log(ret.message);
        }
    });
}
