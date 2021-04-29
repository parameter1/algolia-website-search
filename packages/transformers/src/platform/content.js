const cheerio = require('cheerio');
const { get, getAsArray, getAsObject } = require('@algolia-website-search/utils/object-path');
const dateToUNIX = require('@algolia-website-search/utils/date-to-unix');
const getTenantTransformer = require('./content/tenant-transformers');

const { isArray } = Array;

const contactFields = [
  'authors',
  'contributors',
  'listingContacts',
  'marketingContacts',
  'photographers',
  'publicContacts',
  'salesContacts',
];

/**
 * @param {object} args
 * @param {object} args.doc The BaseCMS content document to transform
 * @param {object} context
 * @param {object} context.dataloaders The BaseCMS dataloaders
 */
module.exports = async ({ doc, tenant }, { dataloaders }) => {
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

  const {
    company,
    labels,
    relatedTo,
    taxonomy,
  } = doc;

  const standardTransformer = {
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
    created: dateToUNIX(doc.created || new Date(0)),
    updated: dateToUNIX(doc.updated || new Date(0)),
    published: dateToUNIX(doc.published || new Date(0)),
    unpublished: dateToUNIX(doc.unpublished || new Date(9999999990000)),
    ...(company && { companyId: company }),
    labels: isArray(labels) ? labels : [],
    relatedToIds: isArray(relatedTo) ? relatedTo.map((o) => o.oid) : [],
    taxonomyIds: isArray(taxonomy) ? taxonomy.map((o) => o.oid) : [],
    contacts: contactFields.reduce((o, field) => {
      // convert `authors` into `authorIds`, etc.
      const key = `${field.replace(/s$/, '')}Ids`;
      const ids = isArray(doc[field]) ? doc[field] : [];
      return { ...o, [key]: ids };
    }, {}),
    customAttributes: getAsObject(doc, 'customAttributes'),
  };

  const tenantTransformer = await getTenantTransformer({ doc, tenant });

  return { ...standardTransformer, ...tenantTransformer };
};
