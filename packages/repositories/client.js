const MongoDBClient = require('@parameter1/mongodb/client');
const { MONGO_URI } = require('./env');
const { name, version } = require('../../package.json');

module.exports = new MongoDBClient({
  url: MONGO_URI,
  options: { appname: `${name} v${version}` },
});
