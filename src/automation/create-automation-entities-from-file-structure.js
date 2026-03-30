export default function createAutomationEntitiesFromFileStructure(
  fileStructure,
  automationDetails,
  slugify,
) {
  const entities = [];

  function traverseFileStructureNode(node, currPathArr) {
    if (node.type === "collection") {
      // Compose path (without fileName) from currPathArr
      let adjustedPathArr = [...currPathArr];
      // Find indexes of elements in currPathArr that start with <id
      const idIndexes = currPathArr
        .map((el, idx) => (el.startsWith("<id") ? idx : -1))
        .filter((idx) => idx !== -1);

      adjustedPathArr = adjustedPathArr.filter(
        (_, idx) => idx !== idIndexes[idIndexes.length - 1],
      );

      const joinedPath = adjustedPathArr.join("/");
      entities.push({
        title: node.title || "Collection",
        path: joinedPath,
        fileName: "collection.json",
        relType: "child",
        initValue: (input) => input,
        ...automationDetails,
      });
      return; // collections have no children
    }
    if (node.children) {
      const children = Object.entries(node.children);
      for (const [key, child] of children) {
        const nextPathArr = [...currPathArr, key];
        traverseFileStructureNode(child, nextPathArr);
      }
    }
  }

  if (fileStructure) {
    if (!fileStructure.rootPath)
      throw new Error("fileStructure requires rootPath");
    for (const [key, child] of Object.entries(fileStructure.children || {})) {
      const pathArr = [fileStructure.rootPath, key];
      traverseFileStructureNode(child, pathArr);
    }
  }
  return entities;
}
