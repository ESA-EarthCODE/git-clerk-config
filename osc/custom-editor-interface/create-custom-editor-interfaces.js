import OSCEditor from "./osc-editor.js";
import TemporalIntervalEditor from "./temporal-interval-editor.js";
import Operation from "./operation.js";
import OSCStringEditor from "./string-editor.js";

export default function createCustomEditorInterfaces() {
  return {
    "osc:project": {
      type: "string",
      format: "osc-project",
      func: OSCEditor,
      path: "projects",
      file: (pathname) => `projects/${pathname}/collection.json`,
      operation: Operation,
      enumsMetaData: {},
    },
    "osc:experiment": {
      type: "string",
      format: "osc-experiment",
      func: OSCEditor,
      path: "experiments",
      file: (pathname) => `experiments/${pathname}/record.json`,
      operation: Operation,
      enumsMetaData: {},
    },
    themes: {
      type: "array",
      format: "themes",
      func: OSCEditor,
      path: "themes",
      file: (pathname) => `themes/${pathname}/catalog.json`,
      operation: Operation,
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
      func: OSCEditor,
      path: "eo-missions",
      file: (pathname) => `eo-missions/${pathname}/catalog.json`,
      operation: Operation,
      enumsMetaData: {},
    },
    "osc:variables": {
      type: "array",
      format: "osc-variables",
      func: OSCEditor,
      path: "variables",
      file: (pathname) => `variables/${pathname}/catalog.json`,
      operation: Operation,
      enumsMetaData: {},
    },
    "osc:workflows": {
      type: "array",
      format: "osc-workflows",
      func: OSCEditor,
      path: "workflows",
      file: (pathname) => `workflows/${pathname}/record.json`,
      operation: Operation,
      enumsMetaData: {},
    },
    temporalInterval: {
      type: "array",
      format: "temporal-interval",
      func: TemporalIntervalEditor,
    },
    updated: {
      type: "string",
      format: "date-time",
      func: OSCStringEditor,
    },
  };
}
