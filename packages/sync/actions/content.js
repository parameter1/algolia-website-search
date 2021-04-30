const Joi = require('@parameter1/joi');
const transform = require('@algolia-website-search/transformers');
const batch = require('@algolia-website-search/utils/batch');
const { iterateCursor } = require('@parameter1/mongodb/utils');
const tenantProjections = require('./content/tenant-projection');

const getIndexFor = ({ tenant, algolia }) => algolia.initIndex(`${tenant}_platform_content`);

const standardProjection = {
  type: 1,
  name: 1,
  fullName: 1,
  status: 1,
  body: 1,
  teaser: 1,
  published: 1,
  unpublished: 1,
  created: 1,
  updated: 1,
  'mutations.Website.primarySite': 1,
  'mutations.Website.primarySection': 1,
  'mutations.Website.name': 1,
  'mutations.Website.body': 1,
  'mutations.Website.teaser': 1,
  sectionQuery: 1,
  company: 1,
  labels: 1,
  relatedTo: 1,
  taxonomy: 1,

  authors: 1,
  contributors: 1,
  listingContacts: 1,
  marketingContacts: 1,
  photographers: 1,
  publicContacts: 1,
  salesContacts: 1,

  customAttributes: 1,

  createdBy: 1,
  updatedBy: 1,
};

const getTenantProjection = ({ tenant }) => {
  const tenantProjection = (tenantProjections[tenant]) ? tenantProjections[tenant] : {};
  return tenantProjection;
};

module.exports = {
  clear: async (params, { tenant, algolia }) => {
    const index = getIndexFor({ tenant, algolia });
    return index.clearObjects();
  },

  /**
   *
   */
  deleteOne: async (params = {}, { tenant, algolia }) => {
    const { id } = await Joi.object({
      id: Joi.number().required(),
    }).validateAsync(params);

    const index = getIndexFor({ tenant, algolia });
    return index.deleteObject(`${id}`);
  },

  /**
   *
   */
  saveAll: async (params, {
    algolia,
    dataloaders,
    repos,
    tenant,
  }) => {
    const limit = 1000;
    const index = getIndexFor({ tenant, algolia });
    const { platformContent } = repos;
    const query = {};
    const totalCount = await platformContent.countDocuments({ query });
    const projection = { ...standardProjection, ...getTenantProjection({ tenant }) };

    const retriever = async ({ skip }) => platformContent.find({
      query,
      options: {
        sort: { _id: -1 },
        limit,
        skip,
        projection,
      },
    });

    const handler = async ({ results: cursor }) => {
      const objects = [];
      await iterateCursor(cursor, async (doc) => {
        const object = await transform('platform.content', { doc, tenant }, { dataloaders, repos });
        objects.push(object);
      });
      await index.saveObjects(objects);
    };

    await batch({
      name: 'content.saveAll',
      totalCount,
      limit,
      handler,
      retriever,
    });
  },

  /**
   *
   */
  saveOne: async (params = {}, {
    algolia,
    dataloaders,
    repos,
    tenant,
  }) => {
    const { id } = await Joi.object({
      id: Joi.number().required(),
    }).validateAsync(params);
    const index = getIndexFor({ tenant, algolia });
    const projection = { ...standardProjection, ...getTenantProjection({ tenant }) };
    const doc = await repos.platformContent.findById({ id, options: { strict: true, projection } });
    const object = await transform('platform.content', { doc, tenant }, { dataloaders, repos });
    return index.saveObject(object);
  },
};
