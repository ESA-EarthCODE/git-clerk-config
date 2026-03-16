import { isBase64, isUrl, decoderBase64ToUtf8 } from '../helpers.js';

export default function editFileAutomation() {
  return {
    id: "edit-file",
    title: "Open external file",
    description: "Edit file in the current branch",
    hidden: true,
    inputSchema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          minLength: 1,
        },
      },
      required: ["file"],
    },
    steps: [
      {
        type: "add",
        path: (input) => input.file.split("/main/")[1],
        content: async (input) => {
          let content = input.file;
          let error = null;

          try {
            if (isUrl(content)) {
              const response = await fetch(content);
              if (!response.ok) {
                throw new Error("Failed to fetch content from URL");
              }
              content = await response.json();
            } else if (isBase64(content)) {
              content = decoderBase64ToUtf8(content);
            } else {
              content = decodeURIComponent(content);
            }
          } catch (e) {
            error = e;
          }

          return error || content;
        },
      },
      {
        type: "navigate",
        path: (input) => input.file.split("/main/")[1],
      },
    ],
  }
}