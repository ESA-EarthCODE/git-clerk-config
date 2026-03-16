import { decoderBase64ToUtf8 } from '../helpers.js';

export default async function createGenerateEnums (
  schemaMetaDetails,
  session,
  cache,
  { getFileDetails }
) {
  if (schemaMetaDetails.schema.allOf) {
    for (const property of Object.keys(globalThis.customEditorInterfaces)) {
      const hidden = document.createElement("div");
      const jsoneditor = new JSONEditor(hidden, {
        schema: schemaMetaDetails.schema,
      });
      schemaMetaDetails.schema = {
        ...schemaMetaDetails.schema,
        ...jsoneditor.expandSchema(jsoneditor.schema),
      };
      hidden.remove();
      const editorInterface = globalThis.customEditorInterfaces[property];
      let propertyAvailable =
        editorInterface.func?.name === "OSCEditor" &&
        (schemaMetaDetails.schema.properties[property]
          || schemaMetaDetails.schema.properties?.properties?.properties[property]);
      if (propertyAvailable) {
        let path = editorInterface.path;
        editorInterface.enumsMetaData = {};
        const catalog = await getFileDetails(
          session,
          `${path}/catalog.json`,
          cache,
        );
        const links = JSON.parse(decoderBase64ToUtf8(catalog.content)).links;
        const enumValues = links
          .sort((a, b) => a.title?.localeCompare(b.title))
          .map((link) => {
            if (link.rel === "child" || link.rel === "item") {
              const value = link.href.split("/")[1];
              const text = link.title;
              editorInterface.enumsMetaData[value] = { text, value };
              return editorInterface.customDataEncoder
                ? editorInterface.customDataEncoder(value)
                : value;
            }
            return null;
          })
          .filter(Boolean);
        const definition = propertyAvailable["$ref"]
          ? schemaMetaDetails.schema.definitions[
              propertyAvailable["$ref"].replace("#/allOf/0/definitions/", "")
            ]
          : {};
        if (propertyAvailable.items) {
          propertyAvailable.items.enum = enumValues;
        } else if (definition.items) {
          propertyAvailable.items = {};
          propertyAvailable.items.enum = enumValues;
        } else {
          propertyAvailable.enum = ["", ...enumValues];
        }
      }
    }
  }

  return schemaMetaDetails;
}
