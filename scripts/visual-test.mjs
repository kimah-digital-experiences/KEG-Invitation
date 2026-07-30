import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const widths = [320, 390, 768, 1440];
const port = 4173;
const origin = `http://127.0.0.1:${port}`;
const url = `${origin}/KEG-Invitation/`;
const evidenceDir = "evidence/visual";
const repositoryRoot = process.cwd();
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg"
};
await mkdir(evidenceDir, { recursive: true });

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, origin).pathname);
    if (!pathname.startsWith("/KEG-Invitation/")) {
      response.writeHead(404).end("Not found");
      return;
    }

    const relativePath = pathname.slice("/KEG-Invitation/".length) || "index.html";
    const filePath = path.resolve(repositoryRoot, relativePath);
    if (!filePath.startsWith(`${repositoryRoot}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    if (!(await stat(filePath)).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(port, "127.0.0.1", resolve);
});
const stopServer = () => server.close();

const browser = await chromium.launch({ headless: true });
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    const integrationRequests = [];
    await page.route("https://fonts.googleapis.com/**", (route) => route.fulfill({
      status: 200,
      contentType: "text/css",
      body: ""
    }));
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
    page.on("request", (request) => {
      if (/wa\.me|whatsapp|script\.google|\/exec(?:\?|$)|webhook/i.test(request.url())) integrationRequests.push(request.url());
    });

    await page.goto(url, { waitUntil: "networkidle" });
    const cover = await page.evaluate(() => {
      const envelope = document.querySelector(".envelope").getBoundingClientRect();
      const seal = document.querySelector(".envelope-seal").getBoundingClientRect();
      return {
        envelope: { width: envelope.width, height: envelope.height },
        seal: { width: seal.width, height: seal.height },
        monogram: document.querySelector(".envelope-seal").textContent.trim(),
        openLabel: document.querySelector("#envelopeOpenLabel").textContent.trim()
      };
    });
    const envelopeRatio = cover.envelope.width / cover.envelope.height;
    if (envelopeRatio < 1.5 || envelopeRatio > 1.7) {
      throw new Error(`${width}px: el sobre no conserva su proporción rectangular 16:10 (${envelopeRatio.toFixed(2)})`);
    }
    if (cover.seal.width / cover.envelope.width > .2) {
      throw new Error(`${width}px: el sello vuelve a dominar visualmente el sobre`);
    }
    const coverMatchesConfig = await page.evaluate(() => (
      document.querySelector(".envelope-seal").textContent.trim() === window.INVITATION_CONFIG.cover.monogram
      && document.querySelector("#envelopeOpenLabel").textContent.trim() === window.INVITATION_CONFIG.cover.openLabel
    ));
    if (!coverMatchesConfig) throw new Error(`${width}px: la portada no refleja la configuración`);
    await page.screenshot({ path: `${evidenceDir}/${width}-portada.png`, fullPage: true });
    await page.locator("#envWrap").click();
    await page.waitForTimeout(650);
    await page.screenshot({ path: `${evidenceDir}/${width}-apertura.png`, fullPage: true });
    await page.locator("body.gate-done").waitFor();
    await page.locator("#gate").waitFor({ state: "hidden" });
    await page.locator("#appContent").waitFor({ state: "visible" });

    const enabledSections = await page.evaluate(() => Object.entries(window.INVITATION_CONFIG.sections).filter(([, enabled]) => enabled).map(([name]) => name));
    const renderedSections = await page.locator("#sections > section").count();
    if (renderedSections !== enabledSections.length) throw new Error(`${width}px: se esperaban ${enabledSections.length} secciones y se renderizaron ${renderedSections}`);

    for (const section of await page.locator("#sections > section").all()) await section.scrollIntoViewIfNeeded();
    await page.locator("#rsvpName").fill("Invitado de prueba");
    await page.locator("#rsvpForm button[type=submit]").click();
    await page.locator("#rsvpMsg").filter({ hasText: "No se enviaron datos" }).waitFor();
    await page.locator("#footer").scrollIntoViewIfNeeded();

    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      rsvp: window.INVITATION_CONFIG.rsvp,
      bankAccounts: window.INVITATION_CONFIG.gifts.bankAccounts,
      trailingSpace: document.documentElement.scrollHeight
        - (document.querySelector("#footer").getBoundingClientRect().bottom + window.scrollY)
    }));
    if (state.overflow > 1) throw new Error(`${width}px: overflow horizontal de ${state.overflow}px`);
    if (state.trailingSpace > 2) throw new Error(`${width}px: espacio vacío de ${state.trailingSpace}px después del footer`);
    if (!state.rsvp.demoMode || state.rsvp.endpoint || state.rsvp.whatsappUrl) throw new Error(`${width}px: RSVP o integración real habilitada`);
    if (state.bankAccounts.length) throw new Error(`${width}px: existen cuentas bancarias configuradas`);
    if (consoleErrors.length) throw new Error(`${width}px: errores de consola:\n${consoleErrors.join("\n")}`);
    if (failedRequests.length) throw new Error(`${width}px: solicitudes fallidas:\n${failedRequests.join("\n")}`);
    if (integrationRequests.length) throw new Error(`${width}px: solicitudes de integración:\n${integrationRequests.join("\n")}`);

    await page.screenshot({ path: `${evidenceDir}/${width}-recorrido-completo.png`, fullPage: true });
    await context.close();
    console.log(`✓ ${width}px: sobre rectangular, apertura, recorrido, RSVP demo, red y overflow`);
  }

  const reducedContext = await browser.newContext({
    viewport: { width: 390, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce"
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.route("https://fonts.googleapis.com/**", (route) => route.fulfill({
    status: 200,
    contentType: "text/css",
    body: ""
  }));
  await reducedPage.goto(url, { waitUntil: "networkidle" });
  await reducedPage.locator("#envWrap").click();
  await reducedPage.locator("body.gate-done").waitFor({ timeout: 500 });
  await reducedContext.close();
  console.log("✓ prefers-reduced-motion: apertura inmediata y sin animación obligatoria");
} finally {
  await browser.close();
  stopServer();
}
