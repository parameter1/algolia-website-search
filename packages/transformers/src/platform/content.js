const cheerio = require('cheerio');
const { get, getAsArray } = require('@algolia-website-search/utils/object-path');
const dateToUNIX = require('@algolia-website-search/utils/date-to-unix');

/**
 * @param {object} input
 * @param {object} input.doc The BaseCMS content document to transform
 * @param {object} context
 * @param {object} context.dataloaders The BaseCMS dataloaders
 */
module.exports = async ({ doc }, { dataloaders }) => {
  const scheduledSectionIds = getAsArray(doc, 'sectionQuery').map((q) => q.sectionId);
  const scheduledSections = scheduledSectionIds.length
    ? await dataloaders.websiteSection.loadMany({
      ids: [...new Set(scheduledSectionIds)],
      projection: { site: 1 },
    }) : [];

  const scheduledSiteIds = scheduledSections.map((section) => get(section, 'site.oid')).filter((id) => id);

  const body = (get(doc, 'mutations.Website.body', doc.body) || '').trim();
  const $ = cheerio.load(body);
  const bodyStripped = $('body').text()
    .replace(/%\{\[.+\]\}%/g, '')
    .replace(/[\n\t]/g, ' ')
    .replace(/\s\s+/g, '')
    .trim();

  return {
    objectID: doc._id,
    type: doc.type,
    name: get(doc, 'mutations.Website.name', doc.name),
    teaser: get(doc, 'mutations.Website.teaser', doc.teaser),
    body: bodyStripped.substring(0, 50000), // prevent large bodies
    status: doc.status,
    primarySiteId: `${get(doc, 'mutations.Website.primarySite')}`,
    primarySectionId: get(doc, 'mutations.Website.primarySection.oid'),
    websiteSchedules: {
      siteIds: [...new Set(scheduledSiteIds.map((id) => `${id}`))],
      sectionIds: [...new Set(scheduledSectionIds)],
    },
    created: dateToUNIX(doc.created),
    updated: dateToUNIX(doc.updated),
    published: dateToUNIX(doc.published),
    unpublished: dateToUNIX(doc.unpublished),
  };
};
