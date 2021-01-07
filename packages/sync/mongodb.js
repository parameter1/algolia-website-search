const MongoDBClient = require('@parameter1/mongodb/client');
const { MONGO_URI } = require('./env');
const { join } = require('path');
const { name, version } = require(join(process.cwd(), 'package.json'));

module.exports = new MongoDBClient({
  url: MONGO_URI,
  options: { appname: `${name} v${version}` },
});
