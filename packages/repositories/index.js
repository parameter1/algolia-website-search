const factory = require('./repo/factory');

/**
 *
 * @param {object} params
 * @param {string} params.tenant The BaseCMS tenant key
 * @param {MongoDBClient} params.client The BaseCMS MongDB client
 */
module.exports = ({ tenant, client } = {}) => factory({ tenant, client });
