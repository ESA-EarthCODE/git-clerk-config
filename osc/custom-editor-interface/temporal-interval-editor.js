class TemporalIntervalEditor extends JSONEditor.AbstractEditor {
  register() {
    super.register();
  }

  unregister() {
    super.unregister();
  }

  build() {
    // const properties = this.schema.properties;
    const options = this.options;
    const description = this.schema.description;
    const theme = this.theme;

    const deepValue = function (obj, path) {
      for (var i = 0, path = path.split("."), len = path.length; i < len; i++) {
        obj = obj?.hasOwnProperty(path[i]) ? obj[path[i]] : undefined;
      }
      return obj;
    };
    const startVals = deepValue(
      this.defaults.startVals,
      this.path.replace("root.", ""),
    );

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

    // create
    const dateTimeStart = document.createElement("input");
    dateTimeStart.setAttribute("type", "date");
    dateTimeStart.setAttribute(
      "value",
      startVals && startVals[0] !== null ? startVals[0].split("T")[0] : "2024-01-01T00:00",
    );
    const dateTimeEnd = document.createElement("input");
    dateTimeEnd.setAttribute("type", "date");
    dateTimeEnd.setAttribute(
      "value",
      startVals && startVals[1] !== null ? startVals[1].split("T")[0] : "2024-01-01T00:00",
    );
    const temporalInterval = document.createElement("div");
    temporalInterval.appendChild(dateTimeStart);
    temporalInterval.appendChild(dateTimeEnd);
    temporalInterval.style.display = "flex";
    //

    this.input = temporalInterval;
    this.input.id = this.formname;
    this.control = theme.getFormControl(
      this.label,
      this.input,
      this.description,
      this.infoButton,
    );

    if (this.schema.readOnly || this.schema.readonly) {
      this.disable(true);
      this.input.disabled = true;
    }

    // Add event listener for change events on the input
    const changeEventHandler = (element, type) => {
      element.addEventListener("change", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.value) {
          this.value = [null, null];
        }
        this.value[type === "start" ? 0 : 1] =
          `${element.value}T${type === "start" ? "00:00:00" : "23:59:59"}Z`;
        this.onChange(true);
      });
    };
    changeEventHandler(dateTimeStart, "start");
    changeEventHandler(dateTimeEnd, "end");

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
    if (this.jsoneditor.options.show_errors === 'always') { } else if (!this.is_dirty && this.previous_error_setting === this.jsoneditor.options.show_errors) return

    this.previous_error_setting = this.jsoneditor.options.show_errors

    const addMessage = (messages, error) => {
      if (error.path === this.path) {
        messages.push(error.message)
      }
      return messages
    }
    const messages = errors.reduce(addMessage, [])

    if (messages.length) {
      this.theme.addInputError(this.input, `${messages.join('. ')}.`)
    } else {
      this.theme.removeInputError(this.input)
    }
  }
}

export default TemporalIntervalEditor;