const sync = require('@algolia-website-search/sync');
const mongodb = require('@algolia-website-search/sync/mongodb');

const { log } = console;

/**
 * This is a sample content `saveOne` sync lambda function.
 *
 * This assumes that the `tenant` key value and the content `id` args are passed to the lambda.
 * For now these are just pre-set by the function, but need to be dynamic in real life.
 *
 * Everything else inside this function can be used in the actual lambda as-is (I think...)
 *
 * Note: The `MONGO_URI`  and `ALGOLIA_API_KEY` env vars need to be set.
 *
 */
const run = async ({ tenant = 'randallreilly_all', id = 14733067 } = {}) => {
  log('Connecting to MongoDB...');
  await mongodb.connect();

  log(`Saving ${tenant}.platform.content*${id} to Algolia...`);
  await sync({ tenant, action: 'content.saveOne' }, { id });

  // @todo this perhaps should not run in the actual lambda, in order to keep the connection alive??
  // for now it probably doesn't matter
  await mongodb.close();
  log('DONE!');
};

// this call wouldn't actually be used in AWS
run().catch((e) => setImmediate(() => { throw e; }));
