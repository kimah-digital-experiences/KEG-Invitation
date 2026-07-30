import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

const temporaryRoot = await mkdtemp(path.join(tmpdir(), "keg-generator-"));
const outputPath = path.join(temporaryRoot, "qa-wedding");
const command = [
  "scripts/create-invitation.mjs",
  "qa-wedding",
  "--config",
  "config/invitation.json",
  "--output",
  outputPath,
];

try {
  const firstRun = spawnSync(process.execPath, command, { encoding: "utf8" });
  if (firstRun.status !== 0) throw new Error(firstRun.stderr || firstRun.stdout);

  const expectedFiles = [
    "index.html",
    "css/styles.css",
    "js/app.js",
    "js/config.js",
    "config/invitation.json",
    "README.md",
    "assets/demo/gallery-1.svg",
    "assets/demo/gallery-2.svg",
    "assets/demo/gallery-3.svg",
    "assets/demo/gallery-4.svg",
  ];
  for (const file of expectedFiles) await access(path.join(outputPath, file));

  const browserConfig = await readFile(path.join(outputPath, "js", "config.js"), "utf8");
  const context = { window: {}, Object };
  vm.runInNewContext(browserConfig, context);
  if (context.window.INVITATION_CONFIG.site.basePath !== "/qa-wedding/") {
    throw new Error("La CLI no derivó la ruta pública desde el slug");
  }
  if (context.window.INVITATION_CONFIG.cover.monogram !== "EM") {
    throw new Error("La CLI no derivó el monograma configurable");
  }

  const secondRun = spawnSync(process.execPath, command, { encoding: "utf8" });
  if (secondRun.status === 0 || !/ya existe/i.test(secondRun.stderr)) {
    throw new Error("La CLI debe rechazar una salida existente sin sobrescribirla");
  }

  console.log("Generador automático válido: crea una instancia aislada, completa y no sobrescribe.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
