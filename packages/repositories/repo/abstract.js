const { Repo } = require('@parameter1/mongodb/repo');
const { titleize } = require('inflected');

const namespaces = [
  'brevity',
  'configuration',
  'email',
  'magazine',
  'platform',
  'website',
];

class AbstractBaseRepo extends Repo {
  /**
   *
   * @param {object} params
   * @param {string} params.tenant The Base tenant key, e.g acbm_fcp
   * @param {string} params.namespace The Base namespace, e.g platform or website
   * @param {string} params.model The Base namespace model, e.g Content or Section
   * @param {MongoDBClient} params.client The MongoDB client
   * @param {string[]} params.collatableFields Fields to use collation on when sorting
   */
  constructor({
    tenant,
    namespace,
    model,
    client,
  } = {}) {
    if (!tenant || !namespace || !model) throw new Error('The tenant, namespace, and model params are required.');
    if (!namespaces.includes(namespace)) throw new Error(`The provided namespace ${namespace} is invalid.`);

    super({
      name: `${namespace} ${titleize(model).toLocaleLowerCase()}`,
      client,
      dbName: `${tenant}_${namespace}`,
      collectionName: model,
    });
  }
}

module.exports = AbstractBaseRepo;
