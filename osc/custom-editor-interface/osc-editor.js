import handleFileContentUpdate from "./handle-file-content-update.js";
import { handleLoaderPostMessage } from "../helpers.js";

// Example of how to build a custom editor can be found here:
// https://github.com/json-editor/json-editor/blob/master/docs/custom-editor.html
class OSCEditor extends JSONEditor.AbstractEditor {
  register() {
    super.register();
  }

  unregister() {
    super.unregister();
  }

  // Build the editor UI
  build() {
    const options = this.options;
    const description = this.schema.description;
    const theme = this.theme;
    const startVals = this.defaults.startVals[this.key];
    const editorInterface = globalThis.customEditorInterfaces[this.key];

    // Create label and description elements if not in compact mode
    if (!options.compact)
      this.header = this.label = theme.getFormInputLabel(
        this.getTitle(),
        this.isRequired(),
      );
    if (description)
      this.description = theme.getFormInputDescription(
        this.translateProperty(description),
      );
    if (options.infoText)
      this.infoButton = theme.getInfoButton(
        this.translateProperty(options.infoText),
      );

    const selector = document.createElement("select");

    // Add options to the select input
    const enumOptions = this.schema.enum || this.schema.items.enum || [];
    enumOptions.forEach((value) => {
      const id =
        editorInterface.customDataDecoder && value
          ? editorInterface.customDataDecoder(value)
          : value;
      const optionElement = document.createElement("option");
      optionElement.text = id ? editorInterface.enumsMetaData[id].text : "";
      optionElement.value = id;
      selector.appendChild(optionElement);
    });

    this.input = selector;
    this.input.id = this.formname;
    this.input.name = this.formname;
    this.input.value = startVals;
    let previousVal = startVals;

    if (this.schema.type === "array") {
      this.input.multiple = true;
      this.input.size = enumOptions.length > 10 ? 10 : enumOptions.length;
      this.input.style.height = "unset";

      if (startVals) {
        startVals.forEach((val) => {
          Array.from(this.input.options).forEach((opt) => {
            if (
              opt.value ===
              (editorInterface.customDataDecoder
                ? editorInterface.customDataDecoder(val)
                : val)
            ) {
              opt.selected = true;
            }
          });
        });
      }
    } else if (this.schema.type === "string") {
      this.input.value = startVals ? startVals : "";
    }

    // Add an event listener for changes on the input element
    this.input.addEventListener("change", async (e) => {
      // Retrieve the current content from the JSON editor
      let content = this.jsoneditor.getValue();

      // Check if the content change is valid based on the editor interface's operation type
      const isValidContentChange = editorInterface.operation.on.some(
        (operation) =>
          content.type === operation.type &&
          content["osc:type"] === operation["osc:type"],
      );

      if (isValidContentChange) {
        // Show loader while processing the change
        handleLoaderPostMessage(true);

        // Handle changes for array type schema
        if (this.schema.type === "array") {
          // Unselect previous values
          if (previousVal) {
            for (const val of previousVal) {
              content = editorInterface.operation.unselect(content, {
                file: editorInterface.file(
                  editorInterface.customDataDecoder
                    ? editorInterface.customDataDecoder(val)
                    : val,
                ),
              });
            }
          }
          // Update previous values with the newly selected options
          previousVal = Array.from(e.target.selectedOptions).map((option) =>
            editorInterface.customDataEncoder
              ? editorInterface.customDataEncoder(option.value)
              : option.value,
          );
          // Update content with the new selections
          for (const val of previousVal) {
            content = await handleFileContentUpdate(
              editorInterface.customDataDecoder
                ? editorInterface.customDataDecoder(val)
                : val,
              content,
              editorInterface,
            );
          }
        } else {
          // Handle changes for non-array type schema
          if (previousVal)
            content = editorInterface.operation.unselect(content, {
              file: editorInterface.file(previousVal),
            });
          // Update previous value with the newly selected option
          previousVal = e.target.value;

          // Update content with the new selection
          if (previousVal) {
            content = await handleFileContentUpdate(
              previousVal,
              content,
              editorInterface,
            );
          }
        }

        // Set the updated content back to the OSC editor
        content[this.key] = previousVal;
        this.jsoneditor.setValue(content);
        this.jsoneditor.showValidationErrors();

        // Make sure to stay on the same tab and not move away on value set (which resets the view)
        const tabPanelsHolder = this.input.closest(".je-tabholder--clear");
        if (tabPanelsHolder) {
          const tabPanel = this.input.closest(".je-indented-panel");
          const tabsHolder =
            tabPanelsHolder.parentElement.querySelector(".je-tabholder--top");
          const tabId = tabPanel.getAttribute("id");

          // Make current tab content visible again
          tabPanelsHolder
            .querySelectorAll(".je-tabholder--clear > .je-indented-panel")
            .forEach((panel) =>
              panel === tabPanel
                ? (panel.style.display = "block")
                : (panel.style.display = "none"),
            );
          // make current tab highlighted again
          tabsHolder
            .querySelectorAll(".je-tab--top")
            .forEach((tab) =>
              tab.getAttribute("id") === tabId
                ? Object.assign(tab.style, { opacity: 1, background: "white" })
                : Object.assign(tab.style, {
                    opacity: 0.5,
                    background: "unset",
                  }),
            );
        }

        // Scroll the input into view and hide the loader after a delay
        setTimeout(() => {
          this.input.scrollIntoView({ block: "center" });
          handleLoaderPostMessage(false);
        }, 300);
      } else {
        // If the content change is not valid, update the value directly
        this.value =
          this.schema.type === "array"
            ? Array.from(e.target.selectedOptions).map((option) => option.value)
            : e.target.value;

        // Trigger the onChange event
        this.onChange(true);
      }
    });

    this.control = theme.getFormControl(
      this.label,
      this.input,
      this.description,
      this.infoButton,
    );

    this.container.appendChild(this.control);
  }

  // Destroy the editor and remove all associated elements
  destroy() {
    if (this.label && this.label.parentNode)
      this.label.parentNode.removeChild(this.label);
    if (this.description && this.description.parentNode)
      this.description.parentNode.removeChild(this.description);
    if (this.input && this.input.parentNode)
      this.input.parentNode.removeChild(this.input);
    super.destroy();
  }

  showValidationErrors(errors) {
    if (this.jsoneditor.options.show_errors === "always") {
    } else if (
      !this.is_dirty &&
      this.previous_error_setting === this.jsoneditor.options.show_errors
    )
      return;

    this.previous_error_setting = this.jsoneditor.options.show_errors;

    const addMessage = (messages, error) => {
      if (error.path === this.path) {
        messages.push(error.message);
      }
      return messages;
    };
    const messages = errors.reduce(addMessage, []);

    if (messages.length) {
      this.theme.addInputError(this.input, `${messages.join(". ")}.`);
    } else {
      this.theme.removeInputError(this.input);
    }
  }
}

export default OSCEditor;
