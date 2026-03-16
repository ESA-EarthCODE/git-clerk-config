import "https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.js";

import createSchemaMap from "./osc/schema-map/create-schema-map.js";
import createAutomation from "./osc/automation/create-automation.js";
import createCustomEditorInterfaces from "./osc/custom-editor-interface/create-custom-editor-interfaces.js";
import createGenerateEnums from "./osc/generate-enums/create-generate-enums.js";

export default function OSCConfiguration(config = {}) {
  globalThis.schemaMap = createSchemaMap();
  globalThis.automation = createAutomation();
  globalThis.customEditorInterfaces = createCustomEditorInterfaces();
  globalThis.generateEnums = createGenerateEnums;
}

window.OSCConfiguration = OSCConfiguration;
