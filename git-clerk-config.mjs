import "https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.js";

import createSchemaMap from "./src/schema-map/create-schema-map.js";
import createAutomation from "./src/automation/create-automation.js";
import createCustomEditorInterfaces from "./src/custom-editor-interface/create-custom-editor-interfaces.js";
import createGenerateEnums from "./src/generate-enums/create-generate-enums.js";
import createI18n from "./src/i18n/create-i18n.js";

export default function GitClerkConfiguration(config) {
  globalThis.schemaMap = createSchemaMap(config);
  globalThis.automation = createAutomation(config);
  globalThis.customEditorInterfaces = createCustomEditorInterfaces(config);
  globalThis.generateEnums = config.generateEnums ? createGenerateEnums : null;
  globalThis.i18n = createI18n(config);

  globalThis.gitClerkConfig = {
    schemaMap: globalThis.schemaMap,
    automation: globalThis.automation,
    customEditorInterfaces: globalThis.customEditorInterfaces,
    generateEnums: globalThis.generateEnums,
    i18n: globalThis.i18n,
  };
}

window.GitClerkConfiguration = GitClerkConfiguration;
