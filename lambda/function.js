const sync = require('@algolia-website-search/sync');
const mongodb = require('@algolia-website-search/sync/mongodb');
const { AWS_EXECUTION_ENV } = require('./env');

const { log } = console;

exports.handler = async (event = {}, context = {}) => {
  // see https://docs.atlas.mongodb.com/best-practices-connecting-to-aws-lambda/
  context.callbackWaitsForEmptyEventLoop = false;

  const { tenantKey, contentId } = event;

  log(`Saving ${tenantKey}.platform.content*${contentId} to Algolia...`);
  const response = await sync({ tenant: tenantKey, action: 'content.saveOne' }, { id: contentId });

  if (!AWS_EXECUTION_ENV) await mongodb.close();
  return response;
};
