const algoliasearch = require('algoliasearch');
const { ALGOLIA_APP_ID, ALGOLIA_API_KEY } = require('./env');

module.exports = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
