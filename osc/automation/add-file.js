import {
  isBase64,
  isUrl,
  capitalizeFirstLetter,
  decoderBase64ToUtf8,
} from "../helpers.js";

export default function addFileAutomation() {
  return {
    id: "add-file",
    title: "Add external OSC file",
    description:
      "Add a OSC file in the correct folder via id from file content",
    hidden: true,
    inputSchema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          minLength: 1,
        },
        type: {
          type: "string",
        },
      },
      required: ["file", "type"],
    },
    steps: [
      {
        type: "add",
        path: async (input) => {
          let content = input.file;

          if (!input.file) {
            throw new Error('Missing parameter: "file"');
          }
          if (!input.type) {
            throw new Error('Missing parameter: "type"');
          }

          try {
            if (isUrl(content)) {
              const response = await fetch(content);
              if (!response.ok) {
                throw new Error("Failed to fetch content from URL");
              }
              content = await response.json();
            } else if (isBase64(content)) {
              content = JSON.parse(decoderBase64ToUtf8(content));
            } else {
              content = JSON.parse(decodeURIComponent(content));
            }
          } catch (e) {
            return;
          }

          automationContentStore = content;

          return `/${input.type}s/${automationContentStore.id}/${input.type === "experiment" || input.type === "workflow" ? "record" : "collection"}.json`;
        },
        content: (input) => automationContentStore,
      },
      {
        type: "edit",
        path: (input) =>
          `/${input.type}s/${automationContentStore.id}/${input.type === "experiment" || input.type === "workflow" ? "record" : "collection"}.json`,
        transform: (content, input) => {
          if (!content.stac_extensions) {
            content.stac_extensions = [];
          }

          // Extensions
          const requiredExtensions = [
            "https://stac-extensions.github.io/osc/v1.0.0/schema.json",
            "https://stac-extensions.github.io/themes/v1.0.0/schema.json",
            // "https://stac-extensions.github.io/cf/v0.2.0/schema.json"
          ];
          requiredExtensions.forEach((extension) => {
            if (!content.stac_extensions.includes(extension)) {
              content.stac_extensions.push(extension);
            }
          });

          // Links
          if (content.links) {
            const rootLink = content.links.find((l) => l.rel === "root");
            if (rootLink) {
              rootLink.href = "../../catalog.json";
              rootLink.title = "Open Science Catalog";
            }
            const parentLink = content.links.find((l) => l.rel === "parent");
            if (parentLink) {
              parentLink.href = "../catalog.json";
              parentLink.title = `${capitalizeFirstLetter(input.type)}s`;
            }
            const viaLink = content.links.find((l) => l.rel === "via");
            if (!viaLink) {
              content.links.push({
                rel: "via",
                href: input.file?.startsWith("https://")
                  ? input.file
                  : "https://eoresults.esa.int/",
                title: "Access",
              });
            }
          }
          if (content.properties?.links) {
            const rootLink = content.properties.links.find(
              (l) => l.rel === "root",
            );
            if (rootLink) {
              rootLink.href = "../../catalog.json";
              rootLink.title = "Open Science Catalog";
            }
            const parentLink = content.properties.links.find(
              (l) => l.rel === "parent",
            );
            if (parentLink) {
              parentLink.href = "../catalog.json";
              parentLink.title = `${capitalizeFirstLetter(input.type)}s`;
            }
            const viaLink = content.properties.links.find(
              (l) => l.rel === "via",
            );
            if (!viaLink) {
              content.properties.links.push({
                rel: "via",
                href: input.file?.startsWith("https://")
                  ? input.file
                  : "https://eoresults.esa.int/",
                title: "Access",
              });
            }
          }

          return content;
        },
      },
      {
        type: "edit",
        path: (input) => `/${input.type}s/catalog.json`,
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel:
                input.type === "experiment" || input.type === "workflow"
                  ? "item"
                  : "child",
              href: `./${automationContentStore.id}/${input.type === "experiment" || input.type === "workflow" ? "record" : "collection"}.json`,
              type: "application/json",
              title: automationContentStore.title || automationContentStore.id,
            },
          ];
          return content;
        },
      },
      {
        type: "navigate",
        path: (input) =>
          `/${input.type}s/${automationContentStore.id}/${input.type === "experiment" || input.type === "workflow" ? "record" : "collection"}.json`,
      },
    ],
  };
}
