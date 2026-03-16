import { isBase64, isUrl, decoderBase64ToUtf8 } from '../helpers.js';

export default function addVarProjProdBundleAutomation() {
  return {
    id: "add-var-proj-prod-bundle",
    title: "Add Variable, Project & Product",
    description:
      "Add a Variable, Project and Product from external content, then open the Product.",
    hidden: true,
    inputSchema: {
      type: "object",
      properties: {
        variable: {
          type: "string",
        },
        project: {
          type: "string",
        },
        product: {
          type: "string",
        },
      },
    },
    steps: [
      {
        type: "add",
        path: async (input) => {
          let content = input.variable;

          if (!input.variable) {
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

          globalThis.variableStore = content;

          return `/variables/${content.id}/catalog.json`;
        },
        content: (input) => globalThis.variableStore,
      },
      {
        type: "edit",
        path: (input) => `/variables/catalog.json`,
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel: "child",
              href: `./${globalThis.variableStore.id}/catalog.json`,
              type: "application/json",
              title:
                globalThis.variableStore.title || globalThis.variableStore.id,
            },
          ];
          return content;
        },
      },
      {
        type: "edit",
        path: (input) =>
          `/variables/${globalThis.variableStore.id}/catalog.json`,
        transform: (content, input) => {
          if (!content.stac_extensions) {
            content.stac_extensions = [];
          }

          const requiredExtensions = [
            "https://stac-extensions.github.io/osc/v1.0.0/schema.json",
            "https://stac-extensions.github.io/themes/v1.0.0/schema.json",
          ];
          requiredExtensions.forEach((extension) => {
            if (!content.stac_extensions.includes(extension)) {
              content.stac_extensions.push(extension);
            }
          });

          if (content.links) {
            const rootLink = content.links.find((l) => l.rel === "root");
            if (rootLink) {
              rootLink.href = "../../catalog.json";
              rootLink.title = "Open Science Catalog";
            }
            const parentLink = content.links.find((l) => l.rel === "parent");
            if (parentLink) {
              parentLink.href = "../catalog.json";
              parentLink.title = "Variables";
            }
            const viaLink = content.links.find((l) => l.rel === "via");
            if (!viaLink) {
              content.links.push({
                rel: "via",
                href: input.variable?.startsWith("https://")
                  ? input.variable
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
          let content = input.project;

          if (!input.project) {
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

          globalThis.projectStore = content;

          return `/projects/${content.id}/collection.json`;
        },
        content: (input) => globalThis.projectStore,
      },
      {
        type: "edit",
        path: (input) => `/projects/catalog.json`,
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel: "child",
              href: `./${globalThis.projectStore.id}/collection.json`,
              type: "application/json",
              title: globalThis.projectStore.title || globalThis.projectStore.id,
            },
          ];
          return content;
        },
      },
      {
        type: "edit",
        path: (input) =>
          `/projects/${globalThis.projectStore.id}/collection.json`,
        transform: (content, input) => {
          if (!content.stac_extensions) {
            content.stac_extensions = [];
          }

          const requiredExtensions = [
            "https://stac-extensions.github.io/osc/v1.0.0/schema.json",
            "https://stac-extensions.github.io/themes/v1.0.0/schema.json",
          ];
          requiredExtensions.forEach((extension) => {
            if (!content.stac_extensions.includes(extension)) {
              content.stac_extensions.push(extension);
            }
          });

          if (content.links) {
            const rootLink = content.links.find((l) => l.rel === "root");
            if (rootLink) {
              rootLink.href = "../../catalog.json";
              rootLink.title = "Open Science Catalog";
            }
            const parentLink = content.links.find((l) => l.rel === "parent");
            if (parentLink) {
              parentLink.href = "../catalog.json";
              parentLink.title = "Projects";
            }
            const viaLink = content.links.find((l) => l.rel === "via");
            if (!viaLink) {
              content.links.push({
                rel: "via",
                href: input.project?.startsWith("https://")
                  ? input.project
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
              title: globalThis.productStore.title || globalThis.productStore.id,
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

          const requiredExtensions = [
            "https://stac-extensions.github.io/osc/v1.0.0/schema.json",
            "https://stac-extensions.github.io/themes/v1.0.0/schema.json",
          ];
          requiredExtensions.forEach((extension) => {
            if (!content.stac_extensions.includes(extension)) {
              content.stac_extensions.push(extension);
            }
          });
          if (content.links) {
            const rootLink = content.links.find((l) => l.rel === "root");
            if (rootLink) {
              rootLink.href = "../../catalog.json";
              rootLink.title = "Open Science Catalog";
            }
            const parentLink = content.links.find((l) => l.rel === "parent");
            if (parentLink) {
              parentLink.href = "../catalog.json";
              parentLink.title = "Products";
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
        type: "navigate",
        path: (input) =>
          `/products/${globalThis.productStore.id}/collection.json`,
      },
    ],
  }
}