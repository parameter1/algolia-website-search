module.exports = async ({ doc, tenant }) => {
  const tenantTransformers = {
    ascend_minex: {
      country: doc.country,
    },
  };
  return (tenantTransformers[tenant]) ? tenantTransformers[tenant] : {};
};
