const {
  cleanEnv,
  str,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  ALGOLIA_APP_ID: str({ desc: 'The Algolia website search application ID', default: '05JLREVGZ4' }),
  ALGOLIA_API_KEY: str({ desc: 'The Algolia website search API key (must be writeable)' }),
  MONGO_URI: str({ desc: 'The BaseCMS MongoDB instance to connect to.' }),
});
