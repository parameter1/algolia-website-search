const Joi = require('@parameter1/joi');
const transform = require('@algolia-website-search/transformers');

const getIndexFor = ({ tenant, algolia }) => algolia.initIndex(`${tenant}_platform_content`);

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
  saveAll: async () => {},

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
    const doc = await repos.platformContent.findById({ id, options: { strict: true } });
    const object = await transform('platform.content', { doc }, { dataloaders });
    return index.saveObject(object);
  },
};
