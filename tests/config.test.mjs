import test from "node:test";
import assert from "node:assert/strict";
import { invitationConfig as config } from "../config/invitation.config.js";
import { validateConfig } from "../src/validate-config.js";

test("carga una configuración ficticia válida", () => {
  const result = validateConfig(config);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(config.integrations.rsvp.mode, "demo");
  assert.equal(config.integrations.rsvp.endpoint, "");
  assert.equal(config.integrations.whatsapp.enabled, false);
});

test("la cuenta regresiva depende de una única fecha ISO configurada", () => {
  assert.ok(Number.isFinite(Date.parse(config.event.startsAt)));
  assert.equal(config.event.startsAt.match(/^\d{4}-\d{2}-\d{2}T/).length, 1);
});

test("detecta secciones inválidas, ids duplicados y producción demo", () => {
  const broken = structuredClone(config);
  broken.resources.gallery = [];
  broken.sections.itinerary.items[0].id = broken.sections.locations.items[0].id;
  const result = validateConfig(broken, { production: true });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /galería habilitada está vacía/);
  assert.match(result.errors.join(" "), /Identificadores duplicados/);
  assert.match(result.errors.join(" "), /demostración/);
});

test("las secciones principales tienen interruptor enabled", () => {
  ["hero", "story", "locations", "gallery", "itinerary", "details", "gifts", "rsvp", "contact"].forEach(key => assert.equal(typeof config.sections[key].enabled, "boolean", key));
});
