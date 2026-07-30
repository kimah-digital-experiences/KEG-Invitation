import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const widths = [320, 390, 768, 1440];
const port = 4173;
const origin = `http://127.0.0.1:${port}`;
const url = `${origin}/KEG-Invitation/`;
const evidenceDir = "evidence/visual";
await mkdir(evidenceDir, { recursive: true });

const server = spawn("python3", ["-m", "http.server", String(port), "--directory", ".."], {
  cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"]
});
const stopServer = () => server.kill("SIGTERM");
process.on("exit", stopServer);

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No se pudo iniciar ${url}`);
}

const browser = await chromium.launch({ headless: true });
try {
  await waitForServer();
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
    await page.screenshot({ path: `${evidenceDir}/${width}-portada.png`, fullPage: true });
    await page.locator("#envWrap").click();
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
      bankAccounts: window.INVITATION_CONFIG.gifts.bankAccounts
    }));
    if (state.overflow > 1) throw new Error(`${width}px: overflow horizontal de ${state.overflow}px`);
    if (!state.rsvp.demoMode || state.rsvp.endpoint || state.rsvp.whatsappUrl) throw new Error(`${width}px: RSVP o integración real habilitada`);
    if (state.bankAccounts.length) throw new Error(`${width}px: existen cuentas bancarias configuradas`);
    if (consoleErrors.length) throw new Error(`${width}px: errores de consola:\n${consoleErrors.join("\n")}`);
    if (failedRequests.length) throw new Error(`${width}px: solicitudes fallidas:\n${failedRequests.join("\n")}`);
    if (integrationRequests.length) throw new Error(`${width}px: solicitudes de integración:\n${integrationRequests.join("\n")}`);

    await page.screenshot({ path: `${evidenceDir}/${width}-recorrido-completo.png`, fullPage: true });
    await context.close();
    console.log(`✓ ${width}px: portada, apertura, recorrido, RSVP demo, red y overflow`);
  }
} finally {
  await browser.close();
  stopServer();
}
