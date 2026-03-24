export default function createSchemaMap(config = {}) {
  const schema = config.schema;
  const defaultSchemaDetails = config.defaultSchemaDetails;

  if (!schema || !schema.length) {
    throw new Error("Schema is required");
  }

  return schema.map((details) => {
    if (details.defaultSchemaDetails === true && defaultSchemaDetails) {
      return {
        ...defaultSchemaDetails,
        ...details,
      };
    } else {
      return details;
    }
  });
}
