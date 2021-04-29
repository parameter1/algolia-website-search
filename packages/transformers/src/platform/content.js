const cheerio = require('cheerio');
const { get, getAsArray, getAsObject } = require('@algolia-website-search/utils/object-path');
const dateToUNIX = require('@algolia-website-search/utils/date-to-unix');
const { iterateCursor } = require('@parameter1/mongodb/utils');
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
module.exports = async ({ doc, tenant }, { dataloaders, repos }) => {
  const scheduledSectionIds = getAsArray(doc, 'sectionQuery').map((q) => q.sectionId);
  const scheduledSections = scheduledSectionIds.length
    ? await dataloaders.websiteSection.loadMany({
      ids: [...new Set(scheduledSectionIds)],
      projection: { site: 1 },
    }) : [];

  const magazineSchedulesCursor = await repos.magazineSchedule.find({
    query: { 'content.$id': doc._id, status: 1 },
    projection: { product: 1, issue: 1, section: 1 },
  });
  const magazineSchedules = {
    publicationIds: new Set(),
    issueIds: new Set(),
    issueSectionIds: new Set(),
  };
  await iterateCursor(magazineSchedulesCursor, async ({ product, issue, section }) => {
    if (product) magazineSchedules.publicationIds.add(`${product}`);
    if (issue) magazineSchedules.issueIds.add(issue);
    if (issue && section) magazineSchedules.issueSectionIds.add(`${issue}_${section}`);
  });

  const scheduledSiteIds = scheduledSections.map((section) => get(section, 'site.oid')).filter((id) => id);

  const body = (get(doc, 'mutations.Website.body', doc.body) || '').trim();
  const $ = cheerio.load(body);
  const bodyStripped = $('body').text()
    .replace(/%\{\[.+\]\}%/g, '')
    .replace(/[\n\t]/g, ' ')
    .replace(/\s\s+/g, '')
    .trim();

  const { createdBy, updatedBy } = doc;

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
    magazineSchedules: {
      publicationIds: [...magazineSchedules.publicationIds],
      issueIds: [...magazineSchedules.issueIds],
      issueSectionIds: [...magazineSchedules.issueSectionIds],
    },
    created: dateToUNIX(doc.created || new Date(0)),
    updated: dateToUNIX(doc.updated || new Date(0)),
    published: dateToUNIX(doc.published || new Date(0)),
    unpublished: dateToUNIX(doc.unpublished || new Date(9999999990000)),
    ...(createdBy && { createdById: `${createdBy}` }),
    ...(updatedBy && { updatedById: `${updatedBy}` }),
    companyId: doc.company,
    labels: getAsArray(doc, 'labels'),
    relatedToIds: getAsArray(doc, 'relatedTo').map((o) => o.oid),
    taxonomyIds: getAsArray(doc, 'taxonomy').map((o) => o.oid),
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
