const client = require('./client');
const factory = require('./repo/factory');

module.exports = ({ tenant } = {}) => factory({ tenant, client });
