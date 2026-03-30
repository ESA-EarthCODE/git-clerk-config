import GitClerkConfiguration from "./git-clerk-config.mjs";
import { slugify } from "./src/helpers.js";
import addFileAutomation from "./src/automation/add-file.js";
import addExperimentAutomation from "./src/automation/add-experiment.js";
import addVarProjProdBundleAutomation from "./src/automation/add-var-proj-prod-bundle.js";
import editFileAutomationAutomation from "./src/automation/edit-file.js";

const EDITOR_CONFIG = {
  "osc:project": {
    type: "string",
    format: "osc-project",
    func: "SelectEditor",
    path: "projects",
    file: (pathname) => `projects/${pathname}/collection.json`,
    operation: true,
    enumsMetaData: {},
  },
  "osc:experiment": {
    type: "string",
    format: "osc-experiment",
    func: "SelectEditor",
    path: "experiments",
    file: (pathname) => `experiments/${pathname}/record.json`,
    operation: true,
    enumsMetaData: {},
  },
  themes: {
    type: "array",
    format: "themes",
    func: "SelectEditor",
    path: "themes",
    file: (pathname) => `themes/${pathname}/catalog.json`,
    operation: true,
    customDataEncoder: (data) => ({
      scheme: "https://github.com/stac-extensions/osc#theme",
      concepts: [
        {
          id: data,
        },
      ],
    }),
    customDataDecoder: (data) => data.concepts[0].id,
    enumsMetaData: {},
  },
  "osc:missions": {
    type: "array",
    format: "osc-missions",
    func: "SelectEditor",
    path: "eo-missions",
    file: (pathname) => `eo-missions/${pathname}/catalog.json`,
    operation: true,
    enumsMetaData: {},
  },
  "osc:variables": {
    type: "array",
    format: "osc-variables",
    func: "SelectEditor",
    path: "variables",
    file: (pathname) => `variables/${pathname}/catalog.json`,
    operation: true,
    enumsMetaData: {},
  },
  "osc:workflows": {
    type: "array",
    format: "osc-workflows",
    func: "SelectEditor",
    path: "workflows",
    file: (pathname) => `workflows/${pathname}/record.json`,
    operation: true,
    enumsMetaData: {},
  },
  temporalInterval: {
    type: "array",
    format: "temporal-interval",
    func: "TemporalIntervalEditor",
  },
};

const EDITOR_OPERATION_ON = [
  {
    type: "Collection",
    "osc:type": "product",
  },
  {
    type: "Collection",
    "osc:type": "project",
    linkRel: "related",
  },
];

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

const I18N = {
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      buttonText: {
        automation: "Add...",
      },
    },
  },
};

const AUTOMATION_ENTITIES = [
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

export default function OSCConfiguration() {
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

  const fileAutomation = addFileAutomation();
  const experimentAutomation = addExperimentAutomation();
  const varProjProdBundleAutomation = addVarProjProdBundleAutomation();
  const editFileAutomation = editFileAutomationAutomation();

  GitClerkConfiguration({
    schema: SCHEMA,
    defaultSchemaDetails: defaultSchemaDetails,
    editors: EDITOR_CONFIG,
    editorOperationOn: EDITOR_OPERATION_ON,
    i18n: I18N,
    automationEntities: AUTOMATION_ENTITIES,
    customAutomation: [
      varProjProdBundleAutomation,
      editFileAutomation,
      fileAutomation,
      experimentAutomation,
    ],
    slugify: slugify,
    generateEnums: true,
  });
}

window.OSCConfiguration = OSCConfiguration;
