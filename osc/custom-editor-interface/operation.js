import { capitalizeFirstLetter, decoderBase64ToUtf8 } from "../helpers.js";

export const selectFunc = (content, { file, title }) => {
  content.links = [
    ...content.links,
    {
      rel: "related",
      href: `../../${file}`,
      type: "application/json",
      title: `${capitalizeFirstLetter(file.split("/")[0].slice(0, -1))}: ${title}`,
    },
  ];
  return content;
};

export const unselectFunc = (content, { file }) => {
  content.links = content.links.filter((link) => link.href !== `../../${file}`);
  return content;
};

export const operationOn = [
  {
    type: "Collection",
    "osc:type": "product",
  },
  {
    type: "Collection",
    "osc:type": "project",
  },
];

export const saveFunc = async (
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

        const finalContent = {
          data: stringifyIfNeeded(
            content,
            decoderBase64ToUtf8(fileDetails.content),
          ),
          type: "string",
        };

        await createAndUpdateFile(
          session,
          path,
          path,
          finalContent,
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
            rel: childPath.includes("projects/") ? "related" : "child",
            href: `../../${childPath}`,
            type: "application/json",
            title: childTitle,
          },
        ];

        const finalContent = {
          data: stringifyIfNeeded(
            content,
            decoderBase64ToUtf8(fileDetails.content),
          ),
          type: "string",
        };

        await createAndUpdateFile(
          session,
          path,
          path,
          finalContent,
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

export default Operation;
