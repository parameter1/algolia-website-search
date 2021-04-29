const { getAsArray } = require('@parameter1/utils');
const AbstractBaseRepo = require('./abstract');

const resources = [
  {
    namespace: 'email',
    models: ['Schedule'],
  },
  {
    namespace: 'magazine',
    models: ['Schedule'],
  },
  {
    namespace: 'platform',
    models: ['Asset', 'Content', 'Product', 'Taxonomy', 'User'],
  },
  {
    namespace: 'website',
    models: ['Section', 'Option'],
  },
];

const collatableFields = {
  platformContent: ['name'],
  platformProduct: ['name', 'fullName'],
  platformTaxonomy: ['name', 'fullName'],
  websiteOption: ['name'],
  websiteSection: ['name', 'fullName'],
};

module.exports = ({ tenant, client } = {}) => resources.reduce((all, { namespace, models }) => {
  const repos = models.reduce((o, model) => {
    const key = `${namespace}${model}`;
    const repo = new AbstractBaseRepo({
      tenant,
      namespace,
      model,
      client,
      collatableFields: getAsArray(collatableFields, key),
    });
    return { ...o, [key]: repo };
  }, {});
  return { ...all, ...repos };
}, {});
