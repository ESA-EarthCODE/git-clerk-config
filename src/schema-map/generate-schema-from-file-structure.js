export default function generateSchemaFromFileStructure(
  fileStructure,
  defaultSchemaDetails,
) {
  const schemaArr = [];

  // Root is always 'catalog'
  if (fileStructure.rootPath && fileStructure.type === "catalog") {
    if (
      !defaultSchemaDetails ||
      !defaultSchemaDetails.catalog_schema ||
      !defaultSchemaDetails.collection_schema
    ) {
      throw new Error(
        "defaultSchemaDetails.catalog_schema and defaultSchemaDetails.collection_schema are required",
      );
    }
    schemaArr.push({
      path: `${fileStructure.rootPath}catalog.json`,
      url: defaultSchemaDetails.catalog_schema,
    });
  }

  function traverseFileStructureNode(node, currPath) {
    if (
      !defaultSchemaDetails ||
      !defaultSchemaDetails.catalog_schema ||
      !defaultSchemaDetails.collection_schema
    ) {
      throw new Error(
        "defaultSchemaDetails.catalog_schema and defaultSchemaDetails.collection_schema are required",
      );
    }
    // If it's a catalog but not the root
    if (node.type === "catalog" && currPath && currPath !== "") {
      schemaArr.push({
        path: `${currPath}catalog.json`,
        url: defaultSchemaDetails.catalog_schema,
        ...defaultSchemaDetails,
      });
    }

    // If it's a collection
    if (node.type === "collection") {
      schemaArr.push({
        path: `${currPath}collection.json`,
        url: defaultSchemaDetails.collection_schema,
        ...defaultSchemaDetails,
      });
    }

    // Traverse children if any
    if (node.children) {
      Object.entries(node.children).forEach(([key, child]) => {
        let newPath;
        if (currPath === "" && fileStructure.rootPath) {
          newPath = "/" + fileStructure.rootPath + "/" + key + "/";
        } else {
          newPath = currPath + key + "/";
        }
        traverseFileStructureNode(child, newPath);
      });
    }
  }

  // Start traversal from top-level children of FILE_STRUCTURE
  if (fileStructure.children && fileStructure.rootPath) {
    Object.entries(fileStructure.children).forEach(([key, child]) => {
      const childPath = "/" + fileStructure.rootPath + "/" + key + "/";
      traverseFileStructureNode(child, childPath);
    });
  }

  return schemaArr;
}
