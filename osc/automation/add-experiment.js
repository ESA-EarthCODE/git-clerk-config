import { isBase64, isUrl, decoderBase64ToUtf8 } from "../helpers.js";

export default function addExperimentAutomation() {
  return {
    id: "add-experiment",
    title: "Add OSC experiment",
    description:
      "Add a OSC files in the correct folder via id from file content",
    hidden: true,
    inputSchema: {
      type: "object",
      properties: {
        product: {
          type: "string",
        },
        workflow: {
          type: "string",
        },
        experiment: {
          type: "string",
        },
      },
    },
    steps: [
      {
        type: "add",
        path: async (input) => {
          let content = input.product;

          if (!input.product) {
            return false;
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

          globalThis.productStore = content;

          return `/products/${content.id}/collection.json`;
        },
        content: (input) => globalThis.productStore,
      },
      {
        type: "edit",
        path: (input) => `/products/catalog.json`,
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel: "child",
              href: `./${globalThis.productStore.id}/collection.json`,
              type: "application/json",
              title:
                globalThis.productStore.title || globalThis.productStore.id,
            },
          ];
          return content;
        },
      },
      {
        type: "edit",
        path: (input) =>
          `/products/${globalThis.productStore.id}/collection.json`,
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
              parentLink.title = `Products`;
            }
            const viaLink = content.links.find((l) => l.rel === "via");
            if (!viaLink) {
              content.links.push({
                rel: "via",
                href: input.product?.startsWith("https://")
                  ? input.product
                  : "https://demo.esa.int/",
                title: "Access",
              });
            }
          }

          return content;
        },
      },
      {
        type: "add",
        path: async (input) => {
          let content = input.workflow;

          if (!input.workflow) {
            return false;
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

          globalThis.workflowStore = content;

          return `/workflows/${content.id}/record.json`;
        },
        content: (input) => globalThis.workflowStore,
      },
      {
        type: "edit",
        path: (input) => `/workflows/catalog.json`,
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel: "item",
              href: `./${globalThis.workflowStore.id}/record.json`,
              type: "application/json",
              title:
                globalThis.workflowStore.title || globalThis.workflowStore.id,
            },
          ];
          return content;
        },
      },
      {
        type: "edit",
        path: (input) =>
          `/workflows/${globalThis.workflowStore.id}/record.json`,
        transform: (content, input) => {
          // Links
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
              parentLink.title = `Workflows`;
            }
            const viaLink = content.properties.links.find(
              (l) => l.rel === "via",
            );
            if (!viaLink) {
              content.properties.links.push({
                rel: "via",
                href: input.workflow?.startsWith("https://")
                  ? input.workflow
                  : "https://eoresults.esa.int/",
                title: "Access",
              });
            }
          }

          return content;
        },
      },
      {
        type: "add",
        path: async (input) => {
          let content = input.experiment;

          if (!input.experiment) {
            return false;
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

          globalThis.experimentStore = content;

          return `/experiments/${content.id}/record.json`;
        },
        content: (input) => globalThis.experimentStore,
      },
      {
        type: "edit",
        path: (input) => `/experiments/catalog.json`,
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel: "item",
              href: `./${globalThis.experimentStore.id}/record.json`,
              type: "application/json",
              title:
                globalThis.experimentStore.title ||
                globalThis.experimentStore.id,
            },
          ];
          return content;
        },
      },
      {
        type: "edit",
        path: (input) =>
          `/experiments/${globalThis.experimentStore.id}/record.json`,
        transform: (content, input) => {
          // Links
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
              parentLink.title = `Experiments`;
            }
            const viaLink = content.properties.links.find(
              (l) => l.rel === "via",
            );
            if (!viaLink) {
              content.properties.links.push({
                rel: "via",
                href: input.experiment?.startsWith("https://")
                  ? input.experiment
                  : "https://eoresults.esa.int/",
                title: "Access",
              });
            }
          }

          return content;
        },
      },
    ],
  };
}
