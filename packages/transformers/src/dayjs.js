const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

module.exports = dayjs
  .extend(utc)
  .extend(timezone);
