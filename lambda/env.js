const {
  cleanEnv,
  str,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  ALGOLIA_API_KEY: str({ desc: 'The Algolia website search API key (must be writeable)' }),
  MONGO_URI: str({ desc: 'The BaseCMS MongoDB instance to connect to.' }),
});
