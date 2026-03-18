export default function createSchemaMap() {
  const preview = new URL(import.meta.url).href.replace(
    "/osc-config.mjs",
    "/osc.html",
  );
  const schemaDefaults = {
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

  return [
    {
      path: "/eo-missions/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/eo-missions/parent.json",
    },
    {
      ...schemaDefaults,
      path: "/eo-missions/<id>/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/eo-missions/children.json",
    },
    {
      path: "/experiments/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/experiments/parent.json",
    },
    {
      ...schemaDefaults,
      path: "/experiments/<id>/record.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/experiments/children.json",
    },
    {
      path: "/products/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/products/parent.json",
    },
    {
      ...schemaDefaults,
      path: "/products/<id>/collection.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/products/children.json",
    },
    {
      path: "/projects/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/projects/parent.json",
    },
    {
      ...schemaDefaults,
      path: "/projects/<id>/collection.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/projects/children.json",
    },
    {
      path: "/themes/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/themes/parent.json",
    },
    {
      ...schemaDefaults,
      path: "/themes/<id>/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/themes/children.json",
    },
    {
      path: "/variables/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/variables/parent.json",
    },
    {
      ...schemaDefaults,
      path: "/variables/<id>/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/variables/children.json",
    },
    {
      path: "/workflows/catalog.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/workflows/parent.json",
    },
    {
      ...schemaDefaults,
      path: "/workflows/<id>/record.json",
      url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/workflows/children.json",
    },
  ];
}
