#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  normalizeInvitationConfig,
  readInvitationInput,
  serializeBrowserConfig,
  validateInvitationConfig,
} from "./lib/invitation-config.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(repositoryRoot, "config", "invitation.json");
const outputPath = path.join(repositoryRoot, "js", "config.js");
const checkOnly = process.argv.includes("--check");

const input = await readInvitationInput(sourcePath);
const config = normalizeInvitationConfig(input);
const errors = await validateInvitationConfig(config, { assetsRoot: repositoryRoot });

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const output = serializeBrowserConfig(config);

if (checkOnly) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== output) {
    console.error("js/config.js no coincide con config/invitation.json. Ejecuta npm run generate.");
    process.exit(1);
  }
  console.log("Configuración generada sincronizada con su fuente declarativa.");
} else {
  await writeFile(outputPath, output, "utf8");
  console.log("js/config.js generado desde config/invitation.json.");
}
