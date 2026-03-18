import { decoderBase64ToUtf8 } from "../helpers.js";

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

export default async function handleFileContentUpdate(
  value,
  content,
  editorInterface,
) {
  const filename = editorInterface.file(value);
  const fileContent = await fetchFileContent(filename);
  const title = fileContent.title;

  return editorInterface.operation.select(content, {
    file: filename,
    title: title,
  });
}
