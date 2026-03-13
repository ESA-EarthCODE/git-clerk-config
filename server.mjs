import express from "express";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4001;

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  const host = req.protocol + "://" + req.get("host");
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <p>OSC Config can be loaded from - <a href="${host}/osc-config.mjs">${host}/osc-config.mjs</a></p>
    <code>import OSCConfiguration from "${host}/osc-config.mjs";</code>
  `);
});

app.get("/osc-config.mjs", async (req, res) => {
  try {
    const filePath = join(__dirname, "osc-config.mjs");
    const content = await readFile(filePath, "utf-8");
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(content);
  } catch (error) {
    res.status(500).send("Error reading osc-config.mjs");
  }
});

app.listen(port, () => console.log(`The server is listening on port ${port}`));
