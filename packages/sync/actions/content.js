const Joi = require('@parameter1/joi');
const transform = require('@algolia-website-search/transformers');

const getIndexFor = ({ tenant, algolia }) => algolia.initIndex(`${tenant}_platform_content`);

const projection = {
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
};

module.exports = {
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
  saveAll: async () => {

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
    const doc = await repos.platformContent.findById({ id, options: { strict: true, projection } });
    const object = await transform('platform.content', { doc }, { dataloaders });
    return index.saveObject(object);
  },
};
