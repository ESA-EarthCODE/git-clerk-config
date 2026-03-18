import { slugify } from "../helpers.js";

const entities = [
  {
    title: "Product",
    path: "products",
    fileName: "collection.json",
    relType: "child",
    initValue: (input) => ({
      id: slugify(input.title),
      title: input.title,
      created: new Date().toISOString().replace(/\.[0-9]{3}/, ""),
      "osc:status": "completed",
      type: "Collection",
      "osc:type": "product",
    }),
  },
  {
    title: "Project",
    path: "projects",
    fileName: "collection.json",
    relType: "child",
    initValue: (input) => ({
      id: slugify(input.title),
      title: input.title,
      "osc:status": "completed",
      type: "Collection",
      "osc:type": "project",
    }),
  },
];

export default function addEntitiesAutomation() {
  return entities.map((entity) => ({
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
      },
      required: ["title"],
    },
    steps: [
      {
        type: "add",
        path: (input) =>
          `/${entity.path}/${slugify(input.title)}/${entity.fileName}`,
        content: (input) => entity.initValue(input),
      },
      {
        type: "edit",
        path: `/${entity.path}/catalog.json`,
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel: entity.relType,
              href: `./${slugify(input.title)}/${entity.fileName}`,
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
          `/${entity.path}/${slugify(input.title)}/${entity.fileName}`,
      },
    ],
  }));
}
