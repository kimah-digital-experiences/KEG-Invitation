import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
const root = new URL("../", import.meta.url).pathname;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".jpg": "image/jpeg", ".mp3": "audio/mpeg" };
createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/KEG-Invitation\/?/, "");
  let file = normalize(join(root, pathname || "index.html"));
  try { if (!(await stat(file)).isFile()) file = join(file, "index.html"); const data = await readFile(file); res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }); res.end(data); } catch { res.writeHead(404); res.end("Not found"); }
}).listen(4173, "127.0.0.1", () => console.log("KEG: http://127.0.0.1:4173/KEG-Invitation/"));
