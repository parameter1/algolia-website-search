/**
 * Converts a Date object to a UNIX timestamp (less milliseconds).
 *
 * @param {Date?} date
 */
module.exports = (date) => {
  if (!(date instanceof Date)) return undefined;
  return Math.round(date.valueOf() / 1000);
};
