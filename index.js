var anime = {}

require('./auth')(anime);
require('./search')(anime);
require('./list')(anime);

module.exports = anime;
