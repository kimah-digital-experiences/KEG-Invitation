import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { invitationConfig as config } from "../config/invitation.config.js";

test("todos los recursos configurados existen y usan rutas relativas", async () => {
  const paths = [config.resources.hero.src, ...config.resources.gallery.map(x => x.src), config.resources.music.src];
  for (const path of paths) {
    assert.doesNotMatch(path, /^(?:\/|https?:|file:)/, path);
    assert.doesNotMatch(path, /\.\./, path);
    await access(new URL(`../${path}`, import.meta.url));
  }
});
