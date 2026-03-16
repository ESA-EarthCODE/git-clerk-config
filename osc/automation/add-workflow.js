import { isBase64, isUrl, decoderBase64ToUtf8 } from '../helpers.js';

export default function addWorkflowAutomation() {
  return {
      id: "add-workflow",
      title: "Add external workflow file",
      description: "Add a workflow in the correct folder via id from file content",
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
          path: async (input) => {
            let content = input.file;
  
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
              return;
            }
  
            automationContentStore = JSON.parse(content);
  
            return `/workflows/${automationContentStore.id}/record.json`;
          },
          content: (input) => automationContentStore,
        },
        {
          type: "navigate",
          path: (input) => `/workflows/${automationContentStore.id}/record.json`,
        },
      ],
    }
}