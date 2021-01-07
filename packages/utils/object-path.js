const { get } = require('object-path');

module.exports = {
  get,
  getAsArray: (obj, path) => {
    const value = get(obj, path, []);
    return value && typeof value === 'object' ? value : {};
  },
  getAsObject: (obj, path) => {
    const value = get(obj, path, []);
    return value && typeof value === 'object' ? value : {};
  },
};
