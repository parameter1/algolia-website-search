const { handler } = require('./function');

handler({
  tenantKey: 'randallreilly_all',
  contentId: 14733067,
}).catch((e) => setImmediate(() => { throw e; }));
