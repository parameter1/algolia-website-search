const { get } = require('@algolia-website-search/utils/object-path');
const platform = require('./platform');

const transformers = { platform };

module.exports = async (path, args, context) => {
  const transformer = get(transformers, path);
  if (!transformer) throw new Error(`No website search transformer found for ${path}`);
  return transformer(args, context);
};
