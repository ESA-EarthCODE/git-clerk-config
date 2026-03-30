import generateSchemaFromFileStructure from "./generate-schema-from-file-structure.js";

export default function createSchemaMap(config = {}) {
  const defaultSchemaDetails = config.defaultSchemaDetails || {};
  const schema =
    config.schema ||
    generateSchemaFromFileStructure(
      config.fileStructure || {},
      defaultSchemaDetails,
    );

  if (!schema || !schema.length) {
    throw new Error("Schema is required or fileStructure is required");
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
