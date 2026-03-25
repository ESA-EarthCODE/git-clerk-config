import SelectEditor from "./select-editor.js";
import TemporalIntervalEditor from "./temporal-interval-editor.js";
import Operation from "./operation.js";
import UpdateStringEditor from "./update-string-editor.js";

const EDITORS = {
  SelectEditor,
  TemporalIntervalEditor,
  UpdateStringEditor,
};

export default function createCustomEditorInterfaces(config) {
  const editors = config.editors;
  const editorOperationOn = config.editorOperationOn;
  let customEditorInterfaces = {};

  if (!editors) {
    throw new Error("Editor is required");
  }

  Object.keys(editors).forEach((id) => {
    let editor = editors[id];
    if (!editor.type || !editor.format || !editor.func) {
      throw new Error(
        `Editor '${id}' is missing required fields: type, format and func`,
      );
    }

    if (editor.operation === true) {
      editor.operation = {
        ...Operation,
        on: editorOperationOn || {},
      };
    }

    if (typeof editor.func === "string") {
      editor.func = EDITORS[editor.func];
    }

    customEditorInterfaces = {
      ...customEditorInterfaces,
      [id]: editor,
    };
  });

  return customEditorInterfaces;
}
