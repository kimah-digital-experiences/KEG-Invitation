const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../js/config.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const config = context.window.INVITATION_CONFIG;
const errors = [];
const required = ["site", "couple", "event", "texts", "locations", "itinerary", "gallery", "music", "gifts", "rsvp", "sections"];
required.forEach((key) => { if (!config[key]) errors.push(`Falta ${key}`); });
if (Number.isNaN(Date.parse(config.event?.dateTime))) errors.push("event.dateTime no es una fecha ISO válida");
if (!Array.isArray(config.locations) || !config.locations.length) errors.push("locations debe contener al menos un lugar");
if (!config.rsvp?.demoMode || config.rsvp.endpoint || config.rsvp.whatsappUrl) errors.push("RSVP debe permanecer en demo y sin integraciones por defecto");
if (config.gifts?.bankAccounts?.length) errors.push("Las cuentas bancarias deben estar vacías por defecto");
const localAssets = [...config.gallery, config.music.src].filter(Boolean).filter((asset) => !/^https?:/.test(asset));
localAssets.forEach((asset) => { if (!fs.existsSync(path.join(__dirname, "..", asset))) errors.push(`Recurso inexistente: ${asset}`); });
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Configuración y recursos válidos; integraciones desactivadas.");
