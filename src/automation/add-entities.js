import { slugify } from "../helpers.js";
import createAutomationEntitiesFromFileStructure from "./create-automation-entities-from-file-structure.js";

function convertIdsInPath(path, idObj) {
  if (!path) return path;
  // split on '/' and replace segments starting with <id
  return path
    .split("/")
    .map((seg) => {
      // seg could be '<id1>' etc
      if (seg.startsWith("<id") && seg.endsWith(">") && seg in idObj) {
        return idObj[seg];
      }
      return seg;
    })
    .join("/");
}

export default function addEntitiesAutomation(config) {
  const slugifyFunc = config.slugify || slugify;
  const automationDetails = config.automationDetails || {};
  const fileStructure = config.fileStructure || {};
  const entities =
    config.automationEntities ||
    createAutomationEntitiesFromFileStructure(
      fileStructure,
      automationDetails,
      slugifyFunc,
    );

  return entities.map((entity) => {
    const pathArr = entity.path.split("/");
    let pathProperties = {};
    const ids = pathArr
      .map((el) => (el.startsWith("<id") ? el : null))
      .filter((id) => id !== null);

    ids.forEach((id) => {
      const idTitle = id.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      pathProperties = {
        ...pathProperties,
        [id]: {
          type: "string",
          minLength: 1,
          title: `Path name for <strong>'${idTitle}'</strong>`,
          description: `Add path name for the nested collection - '${entity.path.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(idTitle, `<strong>${idTitle}</strong>`)}'`,
        },
      };
    });

    return {
      title: `Add ${entity.title}`,
      description: `Bootstrap a new OSC ${entity.title} with the correct folder structure and ID.`,
      inputSchema: {
        type: "object",
        properties: {
          title: {
            title: `${entity.title} title`,
            type: "string",
            minLength: 1,
          },
          ...pathProperties,
        },
        required: ["title", ...ids],
      },
      steps: [
        {
          type: "add",
          path: (input) =>
            `/${convertIdsInPath(entity.path, input)}/${slugifyFunc(input.title)}/${entity.fileName}`,
          content: (input) => entity.initValue(input),
        },
        {
          type: "edit",
          path: (input) =>
            `/${convertIdsInPath(entity.path, input)}/catalog.json`,
          transform: (content, input) => {
            content.links = [
              ...content.links,
              {
                rel: entity.relType,
                href: entity.linkHref
                  ? entity.linkHref(
                      convertIdsInPath(entity.path, input),
                      `${slugifyFunc(input.title)}/${entity.fileName}`,
                    )
                  : `./${slugifyFunc(input.title)}/${entity.fileName}`,
                type: "application/json",
                title: input.title,
              },
            ];
            return content;
          },
        },
        {
          type: "navigate",
          path: (input) =>
            `/${convertIdsInPath(entity.path, input)}/${slugifyFunc(input.title)}/${entity.fileName}`,
        },
      ],
    };
  });
}
