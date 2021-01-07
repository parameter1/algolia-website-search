const {
  cleanEnv,
  str,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  MONGO_URI: str({ desc: 'The BaseCMS MongoDB instance to connect to.' }),
});
