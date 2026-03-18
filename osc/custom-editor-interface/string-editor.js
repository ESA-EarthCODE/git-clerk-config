import { StringEditor } from "https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/src/editors/string.js/+esm";

class OSCStringEditor extends StringEditor {
  build() {
    super.build();
    if (this.key === "updated") {
      setTimeout(() => {
        this.setValueToInputField(
          new Date().toISOString().replace(/\.[0-9]{3}/, ""),
        );
      });
    }
  }
}

export default OSCStringEditor;
