import express from "express";
import getFileContent from "./get-file-content.js";
import fs from "fs";
import path from "path";
import url from "url";

const app = express();
const port = 4004;

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  const host = req.protocol + "://" + req.get("host");
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <p>OSC Config can be loaded from - <a href="${host}/osc-config.mjs">${host}/osc-config.mjs</a></p>
    <code>import OSCConfiguration from "${host}/osc-config.mjs";</code>
  `);
});

app.get(`/osc-config.mjs`, async (req, res) =>
  getFileContent(res, "osc-config.mjs"),
);

// Serve all files from the "osc" directory as ES modules
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const oscDir = path.join(__dirname, "osc");

if (fs.existsSync(oscDir)) {
  const entries = fs.readdirSync(oscDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      // Serve file directly inside osc/
      app.get(
        `/osc/${entry.name}`,
        async (req, res) => await getFileContent(res, entry.name, "osc"),
      );
    } else if (entry.isDirectory()) {
      const subDir = path.join(oscDir, entry.name);
      const subFiles = fs.readdirSync(subDir, { withFileTypes: true });
      for (const subFile of subFiles) {
        if (subFile.isFile()) {
          // Serve file inside osc/{dir}/
          app.get(
            `/osc/${entry.name}/${subFile.name}`,
            async (req, res) =>
              await getFileContent(
                res,
                subFile.name,
                path.join("osc", entry.name),
              ),
          );
        }
      }
    }
  }
}

app.listen(port, () => console.log(`The server is listening on port ${port}`));
