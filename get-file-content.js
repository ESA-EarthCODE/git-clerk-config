import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function getFileContent(response, fileName, path) {
  try {
    const filePath = path
      ? join(__dirname, path, fileName)
      : join(__dirname, fileName);
    const content = await readFile(filePath, "utf-8");
    response.setHeader("Content-Type", "application/javascript");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.send(content);
  } catch (error) {
    response
      .status(500)
      .send(
        `Error reading ${path ? path + "/" + fileName : fileName}: ${error}`,
      );
  }
}
