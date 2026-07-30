import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

test("no quedan endpoints activos, teléfonos, finanzas, secretos ni datos heredados", async () => {
  const files = execFileSync("git", ["ls-files", "*.html", "*.js", "*.mjs", "*.md", "*.json"], { encoding: "utf8" }).trim().split("\n").filter(Boolean).filter(file => !file.startsWith("docs/MIGRATION_") && file !== "tests/security.test.mjs");
  const text = (await Promise.all(files.map(file => readFile(file, "utf8")))).join("\n");
  const forbidden = [/script\.google\.com\/macros/i, /wa\.me\//i, /AKfy[a-z0-9_-]+/i, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i, /(?:api[_-]?key|token|secret)\s*[:=]\s*["'][^"']{8,}/i, /cuenta de ahorro/i, /BODA-PERALTA-MACHADO/i, /Ana Josse/i, /Daniel Peralta/i];
  forbidden.forEach(pattern => assert.doesNotMatch(text, pattern));
});

test("la aplicación no usa fetch ni almacenamiento para RSVP demo", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  assert.doesNotMatch(app, /\bfetch\s*\(/);
  assert.doesNotMatch(app, /localStorage|sessionStorage|indexedDB/);
  assert.match(app, /mode === "demo"/);
});
