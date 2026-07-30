#!/usr/bin/env node
import { access, copyFile, mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  getLocalAssetPaths,
  normalizeInvitationConfig,
  readInvitationInput,
  serializeBrowserConfig,
  validateInvitationConfig,
} from "./lib/invitation-config.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseArguments(argv) {
  const options = {
    slug: argv[0],
    configPath: path.join(repositoryRoot, "config", "invitation.json"),
    outputPath: null,
    basePath: null,
  };

  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === "--config" && value) {
      options.configPath = path.resolve(value);
      index += 1;
    } else if (argument === "--output" && value) {
      options.outputPath = path.resolve(value);
      index += 1;
    } else if (argument === "--base-path" && value) {
      options.basePath = value;
      index += 1;
    } else {
      throw new Error(`Argumento no reconocido: ${argument}`);
    }
  }

  options.outputPath ||= path.join(repositoryRoot, "generated", options.slug || "");
  options.basePath ||= `/${options.slug || ""}/`;
  return options;
}

function generatedReadme(config, slug) {
  return `# ${config.couple.short1} & ${config.couple.short2}

Invitación estática generada automáticamente desde la plantilla KEG.

## Publicación

Publica el contenido completo de esta carpeta en la ruta \`${config.site.basePath}\`.
Los recursos son relativos y la invitación no necesita compilación ni dependencias de ejecución.

## Regeneración

Esta salida corresponde a la instancia \`${slug}\`. Para cambiar datos, edita el JSON de origen
y vuelve a ejecutar la CLI desde el repositorio de la plantilla. El generador nunca sobrescribe
una salida existente.
`;
}

async function ensureMissing(targetPath) {
  try {
    await access(targetPath);
    throw new Error(`La salida ya existe: ${targetPath}. No se modificó ningún archivo.`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function copyIntoOutput(relativePath, outputPath) {
  const source = path.join(repositoryRoot, relativePath);
  const destination = path.join(outputPath, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (!options.slug || !validSlug.test(options.slug)) {
  console.error(
    "Uso: npm run create:invitation -- <slug> "
      + "[--config archivo.json] [--output carpeta] [--base-path /ruta/]",
  );
  process.exit(1);
}

if (options.outputPath === repositoryRoot || options.outputPath === path.parse(options.outputPath).root) {
  console.error("La carpeta de salida no puede ser la raíz del repositorio ni del sistema.");
  process.exit(1);
}

let stagingPath = null;
try {
  await ensureMissing(options.outputPath);
  const input = await readInvitationInput(options.configPath);
  const config = normalizeInvitationConfig(input, { basePath: options.basePath });
  const errors = await validateInvitationConfig(config, { assetsRoot: repositoryRoot });

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }

  await mkdir(path.dirname(options.outputPath), { recursive: true });
  stagingPath = await mkdtemp(path.join(
    path.dirname(options.outputPath),
    `.${path.basename(options.outputPath)}.tmp-`,
  ));
  for (const file of ["index.html", "css/styles.css", "js/app.js"]) {
    await copyIntoOutput(file, stagingPath);
  }
  for (const asset of getLocalAssetPaths(config)) {
    await copyIntoOutput(asset, stagingPath);
  }

  await mkdir(path.join(stagingPath, "config"), { recursive: true });
  await mkdir(path.join(stagingPath, "js"), { recursive: true });
  await writeFile(
    path.join(stagingPath, "config", "invitation.json"),
    `${JSON.stringify(config, null, 2)}\n`,
    "utf8",
  );
  await writeFile(path.join(stagingPath, "js", "config.js"), serializeBrowserConfig(config), "utf8");
  await writeFile(path.join(stagingPath, "README.md"), generatedReadme(config, options.slug), "utf8");
  await rename(stagingPath, options.outputPath);
  stagingPath = null;

  console.log(`Invitación "${options.slug}" creada en ${options.outputPath}`);
  console.log(`Ruta pública configurada: ${config.site.basePath}`);
} catch (error) {
  if (stagingPath) await rm(stagingPath, { recursive: true, force: true });
  console.error(error.message);
  process.exitCode = 1;
}
