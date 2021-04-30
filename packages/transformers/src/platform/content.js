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
module.exports = async ({ doc, tenant }, { dataloaders, repos }) => {
  const scheduledSectionIds = getAsArray(doc, 'sectionQuery').map((q) => q.sectionId);

  const [scheduledSections, scheduledMagazines, scheduledEmail] = await Promise.all([
    (async () => {
      if (!scheduledSectionIds.length) return [];
      return dataloaders.websiteSection.loadMany({
        ids: [...new Set(scheduledSectionIds)],
        projection: { site: 1 },
      });
    })(),
    (async () => {
      const cursor = await repos.magazineSchedule.find({
        query: { 'content.$id': doc._id, status: 1 },
        projection: { product: 1, issue: 1, section: 1 },
      });
      return cursor.toArray();
    })(),
    (async () => {
      const cursor = await repos.emailSchedule.find({
        query: { 'content.$id': doc._id, status: 1 },
        projection: { product: 1, section: 1 },
      });
      return cursor.toArray();
    })(),
  ]);

  const magazineSchedules = scheduledMagazines.reduce((sets, { product, issue, section }) => {
    if (product) sets.publicationIds.add(`${product}`);
    if (issue) sets.issueIds.add(issue);
    if (issue && section) sets.issueSectionIds.add(`${issue}_${section}`);
    return sets;
  }, {
    publicationIds: new Set(),
    issueIds: new Set(),
    issueSectionIds: new Set(),
  });

  const emailSchedules = scheduledEmail.reduce((sets, { product, section }) => {
    if (product) sets.newsletterIds.add(`${product}`);
    if (section) sets.sectionIds.add(section);
    return sets;
  }, {
    newsletterIds: new Set(),
    sectionIds: new Set(),
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
    emailSchedules: {
      newsletterIds: [...emailSchedules.newsletterIds],
      sectionIds: [...emailSchedules.sectionIds],
    },
    created: dateToUNIX(doc.created || new Date(0)),
    updated: dateToUNIX(doc.updated || new Date(0)),
    published: dateToUNIX(doc.published),
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
