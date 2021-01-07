const createLoaders = require('@algolia-website-search/dataloaders');
const createRepos = require('@algolia-website-search/repositories');
const { get } = require('@algolia-website-search/utils');

const algolia = require('./algolia');
const mongodb = require('./mongodb');
const actions = require('./actions');

module.exports = async ({ tenant, action }, args = {}) => {
  const repos = createRepos({ tenant, client: mongodb });
  const dataloaders = await createLoaders({ repos });

  const fn = get(actions, action);
  if (typeof fn !== 'function') throw new Error(`No action found for ${action}`);

  const context = {
    algolia,
    dataloaders,
    repos,
    tenant,
  };
  return fn(args, context);
};
