import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

test("shell y scripts son compatibles con Pages bajo subdirectorio", () => {
  assert.match(html, /src="src\/app\.js"/);
  assert.match(html, /href="styles\.css"/);
  assert.doesNotMatch(html, /(?:src|href)="\//);
});

test("apertura, teclado, foco, navegación vertical y RSVP demo están implementados", () => {
  assert.match(app, /e\.key === "Enter"/); assert.match(app, /e\.key === " "/);
  assert.match(app, /focus\(\{ preventScroll: true \}\)/);
  assert.match(app, /scrollIntoView/); assert.match(app, /event\.preventDefault\(\)/);
  assert.match(app, /config\.sections\.rsvp\.successText/);
});

test("movimiento reducido, foco visible y overflow horizontal están protegidos", () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /focus-visible/);
  assert.match(css, /overflow-x: (?:hidden|clip)/);
});

test("render usa contenido y recursos desde la configuración", () => {
  assert.match(app, /config\.identity\.couple/);
  assert.match(app, /config\.resources\.gallery/);
  assert.match(app, /if \(s\.gallery\.enabled\)/);
  assert.match(app, /if \(s\.locations\.enabled\)/);
});
