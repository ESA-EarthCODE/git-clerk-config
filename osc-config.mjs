import GitClerkConfiguration from "./git-clerk-config.mjs";

const SCHEMA = [
  {
    path: "/eo-missions/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/eo-missions/parent.json",
  },
  {
    defaultSchemaDetails: true,
    path: "/eo-missions/<id>/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/eo-missions/children.json",
  },
  {
    path: "/experiments/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/experiments/parent.json",
  },
  {
    defaultSchemaDetails: true,
    path: "/experiments/<id>/record.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/experiments/children.json",
  },
  {
    path: "/products/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/products/parent.json",
  },
  {
    defaultSchemaDetails: true,
    path: "/products/<id>/collection.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/products/children.json",
  },
  {
    path: "/projects/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/projects/parent.json",
  },
  {
    defaultSchemaDetails: true,
    path: "/projects/<id>/collection.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/projects/children.json",
  },
  {
    path: "/themes/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/themes/parent.json",
  },
  {
    defaultSchemaDetails: true,
    path: "/themes/<id>/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/themes/children.json",
  },
  {
    path: "/variables/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/variables/parent.json",
  },
  {
    defaultSchemaDetails: true,
    path: "/variables/<id>/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/variables/children.json",
  },
  {
    path: "/workflows/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/workflows/parent.json",
  },
  {
    defaultSchemaDetails: true,
    path: "/workflows/<id>/record.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/workflows/children.json",
  },
];

export default function OSCConfiguration(config = {}) {
  const preview = new URL(import.meta.url).href.replace(
    "/osc-config.mjs",
    "/osc.html",
  );
  const defaultSchemaDetails = {
    preview: preview,
    content: {},
    jsonform: {
      propertiesToggle: true,
      options: {
        display_required_only: true,
        disable_properties: false,
      },
    },
  };

  GitClerkConfiguration({
    schema: SCHEMA,
    defaultSchemaDetails: defaultSchemaDetails,
    ...config,
  });
}

window.OSCConfiguration = OSCConfiguration;
