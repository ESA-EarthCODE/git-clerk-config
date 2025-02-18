import "https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.js";

// CHANGE THESE BASED ON DEPLOYMENT //
const BASE_PATH = "/";
const HOST_URL = "http://localhost:8080";
// // // // // // // // // // // // //

globalThis.ghConfig = {
  githubRepo: "ESA-EarthCODE/open-science-catalog-metadata-testing",
  githubAuthToken: () => {
    return new Promise((resolve) => {
      import(
        "https://cdn.jsdelivr.net/npm/@luigi-project/client/luigi-client.js"
      ).then(() => {
        LuigiClient.addInitListener((initialContext) => {
          const ghToken = initialContext.user.githubToken;
          resolve(ghToken);
        });
      });
    });
  },
};

globalThis.basePath = BASE_PATH;

function decoderBase64ToUtf8(str) {
  return decodeURIComponent(escape(atob(str)));
}

const handleLoaderPostMessage = (enable = true) => {
  window.parent.postMessage(
    {
      type: enable ? "ENABLE_LOADER_POSTMESSAGE" : "DISABLE_LOADER_POSTMESSAGE",
    },
    "*",
  );
};

const fetchFileContent = async (filePath) => {
  const token = await globalThis.ghConfig.config.auth;
  const owner = globalThis.ghConfig.config.username;
  const repo = globalThis.ghConfig.config.repo;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      headers: {
        Authorization: `token ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file content from ${filePath}`);
  }

  const fileContent = await response.json();
  const decodedContent = JSON.parse(decoderBase64ToUtf8(fileContent.content));

  return decodedContent;
};

const handleFileContentUpdate = async (value, content, editorInterface) => {
  const filename = editorInterface.file(value);
  const fileContent = await fetchFileContent(filename);
  const title = fileContent.title;

  return editorInterface.operation.select(content, {
    file: filename,
    title: title,
  });
};

globalThis.schemaMap = [
  {
    path: "/eo-missions/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/eo-missions/parent.json",
  },
  {
    path: "/eo-missions/<id>/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/eo-missions/children.json",
    preview: `${HOST_URL}/osc.html`,
  },
  {
    path: "/products/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/products/parent.json",
  },
  {
    path: "/products/<id>/collection.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/products/children.json",
    preview: `${HOST_URL}/osc.html`,
  },
  {
    path: "/projects/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/projects/parent.json",
  },
  {
    path: "/projects/<id>/collection.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/projects/children.json",
    preview: `${HOST_URL}/osc.html`,
  },
  {
    path: "/themes/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/themes/parent.json",
  },
  {
    path: "/themes/<id>/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/themes/children.json",
    preview: `${HOST_URL}/osc.html`,
  },
  {
    path: "/variables/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/variables/parent.json",
  },
  {
    path: "/variables/<id>/catalog.json",
    url: "https://esa-earthcode.github.io/open-science-catalog-validation/schemas/variables/children.json",
    preview: `${HOST_URL}/osc.html`,
  },
];

globalThis.automation = [
  {
    title: "Bootstrap Product",
    description:
      "Bootstrap a new file with the correct folder structure and ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          minLength: 1,
          default: self.crypto.randomUUID(),
          options: {
            hidden: true,
          },
        },
        title: {
          type: "string",
          minLength: 1,
        },
      },
      required: ["id", "title"],
    },
    steps: [
      {
        type: "add",
        path: (input) => `/products/${input.id}/collection.json`,
        content: (input) => ({ id: input.id, title: input.title }),
      },
      {
        type: "edit",
        path: "/products/catalog.json",
        transform: (content, input) => {
          content.links = [
            ...content.links,
            {
              rel: "child",
              href: `./${input.id}/collection.json`,
              type: "application/json",
              title: input.title,
            },
          ];
          return content;
        },
      },
      {
        type: "navigate",
        path: (input) => `/products/${input.id}/collection.json`,
      },
    ],
  },
];

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
    enumOptions.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.text = option.text;
      optionElement.value = option.value;
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
          for (const val of previousVal) {
            content = editorInterface.operation.unselect(content, {
              file: editorInterface.file(
                editorInterface.customDataDecoder
                  ? editorInterface.customDataDecoder(val)
                  : val,
              ),
            });
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

        // Set the updated content back to the JSON editor
        content[this.key] = previousVal;
        this.jsoneditor.setValue(content);

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
}

class UUIDEditor extends JSONEditor.AbstractEditor {
  register() {
    super.register();
  }

  unregister() {
    super.unregister();
  }

  build() {
    const options = this.options;
    const description = this.schema.description;
    const theme = this.theme;
    const startVals = this.defaults.startVals[this.key];

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

    /* Set field to readonly */
    this.disable(true);

    const input = document.createElement("input");
    this.input = input;
    this.input.type = "text";
    this.input.id = this.formname;
    this.input.name = this.formname;
    this.input.value = startVals || self.crypto.randomUUID();

    this.control = theme.getFormControl(
      this.label,
      this.input,
      this.description,
      this.infoButton,
    );

    this.container.appendChild(this.control);

    if (!startVals) {
      setTimeout(() => {
        this.value = this.input.value;
        this.onChange(true);
      }, 100);
    }
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
}

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
      startVals ? startVals[0].split("T")[0] : "2024-01-01T00:00",
    );
    const dateTimeEnd = document.createElement("input");
    dateTimeEnd.setAttribute("type", "date");
    dateTimeEnd.setAttribute(
      "value",
      startVals ? startVals[1].split("T")[0] : "2024-01-01T00:00",
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
}

const selectFunc = (content, { file, title }) => {
  content.links = [
    ...content.links,
    {
      rel: "related",
      href: `../../${file}`,
      type: "application/json",
      title: title,
    },
  ];
  return content;
};

const unselectFunc = (content, { file }) => {
  content.links = content.links.filter((link) => link.href !== `../../${file}`);
  return content;
};

const operationOn = [
  {
    type: "Collection",
    "osc:type": "product",
  },
  {
    type: "Collection",
    "osc:type": "project",
  },
];

const saveFunc = async (
  newIds,
  oldIds,
  customEditorInterface,
  childPath,
  childTitle,
  session,
  { createAndUpdateFile, getFileDetails, stringifyIfNeeded },
) => {
  // Convert single ID strings to arrays for consistent handling
  const newIdsArr = !Array.isArray(newIds)
    ? [newIds]
    : customEditorInterface.customDataDecoder
      ? newIds.map(customEditorInterface.customDataDecoder)
      : newIds;
  const oldIdsArr = !Array.isArray(oldIds)
    ? [oldIds]
    : customEditorInterface.customDataDecoder
      ? oldIds.map(customEditorInterface.customDataDecoder)
      : oldIds;

  // Only proceed if the IDs have actually changed
  if (newIdsArr && oldIdsArr && newIdsArr.toString() !== oldIdsArr.toString()) {
    const loaderEle = document.getElementById("loader-text");

    // Handle removed links - remove child link from files that are no longer selected
    const removedIds = oldIdsArr.filter((id) => !newIdsArr.includes(id));
    for (let id of removedIds) {
      const path = customEditorInterface.file(id);
      loaderEle.innerText = `Removing child link from ${path}`;
      const fileDetails = await getFileDetails(session, path);
      if (fileDetails.status !== "error") {
        let content = JSON.parse(decoderBase64ToUtf8(fileDetails.content));
        // Remove the link to this child from the file's links array
        content.links = content.links.filter(
          (link) => link.href !== `../../${childPath}`,
        );

        await createAndUpdateFile(
          session,
          path,
          path,
          stringifyIfNeeded(content, decoderBase64ToUtf8(fileDetails.content)),
          fileDetails.sha,
        );
      }
    }

    // Handle added links - add child link to newly selected files
    const addedIds = newIdsArr.filter((id) => !oldIdsArr.includes(id));
    for (let id of addedIds) {
      const path = customEditorInterface.file(id);
      loaderEle.innerText = `Adding child link to ${path}`;
      const fileDetails = await getFileDetails(session, path);
      if (fileDetails.status !== "error") {
        let content = JSON.parse(decoderBase64ToUtf8(fileDetails.content));
        // Add a new child link to the file's links array
        content.links = [
          ...content.links,
          {
            rel: "child",
            href: `../../${childPath}`,
            type: "application/json",
            title: childTitle,
          },
        ];

        await createAndUpdateFile(
          session,
          path,
          path,
          stringifyIfNeeded(content, decoderBase64ToUtf8(fileDetails.content)),
          fileDetails.sha,
        );
      }
    }
  }
};

const Operation = {
  on: operationOn,
  select: selectFunc,
  unselect: unselectFunc,
  save: saveFunc,
};

globalThis.customEditorInterfaces = {
  "osc:project": {
    type: "string",
    format: "osc-project",
    func: OSCEditor,
    path: "projects",
    file: (pathname) => `projects/${pathname}/collection.json`,
    operation: Operation,
  },
  themes: {
    type: "array",
    format: "osc-themes",
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
  },
  "osc:missions": {
    type: "array",
    format: "osc-missions",
    func: OSCEditor,
    path: "eo-missions",
    file: (pathname) => `eo-missions/${pathname}/catalog.json`,
    operation: Operation,
  },
  "osc:variables": {
    type: "array",
    format: "osc-variables",
    func: OSCEditor,
    path: "variables",
    file: (pathname) => `variables/${pathname}/catalog.json`,
    operation: Operation,
  },
  id: {
    type: "string",
    format: "uuid",
    func: UUIDEditor,
  },
  temporalInterval: {
    type: "array",
    format: "temporal-interval",
    func: TemporalIntervalEditor,
  },
};

globalThis.generateEnums = async (
  schemaMetaDetails,
  session,
  cache,
  { getFileDetails },
) => {
  if (schemaMetaDetails.schema.allOf) {
    for (const property of Object.keys(globalThis.customEditorInterfaces)) {
      const propertyAvailable =
        schemaMetaDetails.schema.allOf[1].properties[property];
      if (propertyAvailable) {
        let path = globalThis.customEditorInterfaces[property].path;
        const catalog = await getFileDetails(
          session,
          `${path}/catalog.json`,
          cache,
        );
        const links = JSON.parse(decoderBase64ToUtf8(catalog.content)).links;
        const enumValues = links
          .map((link) =>
            link.rel === "child"
              ? {
                  value: link.href.split("/")[1],
                  text: link.title,
                }
              : null,
          )
          .filter(Boolean);
        if (propertyAvailable.items) {
          propertyAvailable.items.enum = enumValues;
        } else {
          propertyAvailable.enum = [
            {
              value: "",
              text: "Select a value",
            },
            ...enumValues,
          ];
        }
      }
    }
  }

  return schemaMetaDetails;
};
