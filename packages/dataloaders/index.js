const MongoDBLoader = require('@parameter1/dataloader-mongodb');

module.exports = async ({ repos }) => {
  const loaders = {};
  await Promise.all(Object.keys(repos).map(async (key) => {
    const repo = repos[key];
    const collection = await repo.collection();
    loaders[key] = new MongoDBLoader({ collection });
  }));
  return loaders;
};
