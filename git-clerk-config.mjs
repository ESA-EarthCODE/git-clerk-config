import "https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.js";

import createSchemaMap from "./osc/schema-map/create-schema-map.js";
import createAutomation from "./osc/automation/create-automation.js";
import createCustomEditorInterfaces from "./osc/custom-editor-interface/create-custom-editor-interfaces.js";
import createGenerateEnums from "./osc/generate-enums/create-generate-enums.js";
import createI18n from "./osc/i18n/create-i18n.js";

export default function GitClerkConfiguration(config = {}) {
  globalThis.schemaMap = createSchemaMap(config);
  globalThis.automation = createAutomation();
  globalThis.customEditorInterfaces = createCustomEditorInterfaces();
  globalThis.generateEnums = createGenerateEnums;
  globalThis.i18n = createI18n();

  globalThis.gitClerkConfig = {
    schemaMap: globalThis.schemaMap,
    automation: globalThis.automation,
    customEditorInterfaces: globalThis.customEditorInterfaces,
    generateEnums: globalThis.generateEnums,
    i18n: globalThis.i18n,
  };
}

window.GitClerkConfiguration = GitClerkConfiguration;
