import { invitationConfig as config } from "../config/invitation.config.js";
import { validateConfig } from "./validate-config.js";

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const names = `${config.identity.couple.partner1} <span class="heroAmp">&amp;</span> ${config.identity.couple.partner2}`;
const section = (id, className, content) => `<section class="section reveal ${className}" id="${id}" data-section="${id}">${content}</section>`;

function applyMetadata() {
  document.documentElement.lang = config.identity.language;
  document.title = config.identity.siteTitle;
  $("meta[name='description']").content = config.identity.metadata.description;
  const colors = config.theme.colors;
  Object.entries({ "--green": colors.primary, "--deep": colors.deep, "--paper": colors.paper, "--paper2": colors.paperSoft, "--ink": colors.text, "--gold": colors.gold }).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
  document.documentElement.style.setProperty("--font-title", config.theme.fonts.heading);
  document.documentElement.style.setProperty("--font-body", config.theme.fonts.body);
  document.documentElement.style.setProperty("--hero-image", `url("${config.resources.hero.src}")`);
}

function renderOpening() {
  if (!config.opening.enabled) return "";
  return `<div class="gate" id="gate" role="dialog" aria-modal="true" aria-labelledby="gateTitle"><div class="gate-card"><div class="gate-kicker">${escapeHtml(config.identity.welcome)}</div><h1 class="gate-names" id="gateTitle">${names}</h1><div class="env-wrap" id="envWrap" role="button" tabindex="0" aria-label="Abrir invitación"><div class="env-letter"><div class="env-letter-inner"><div class="env-letter-title">${names}</div><div class="env-letter-sub">${escapeHtml(config.identity.opening)}</div></div></div><div class="envelope-demo" aria-hidden="true"><span>${escapeHtml(config.identity.couple.initials)}</span></div></div><p id="guestLine"></p><p id="paxLine"></p><p class="gate-tip">Presiona Enter o toca el sobre para abrir</p></div></div>`;
}

function renderHero() {
  const s = config.sections.hero; if (!s.enabled) return "";
  const music = config.resources.music;
  return `<section class="hero" id="inicio" data-section="hero"><div class="hero-grid"><div class="hero-left">${music.enabled && music.controls ? `<button class="musicBtn" id="musicBtn" type="button" aria-pressed="false">Reproducir ${escapeHtml(music.title)}</button>` : ""}<p>${escapeHtml(config.identity.mainPhrase)}</p><h2 class="heroTitle">${names}</h2>${config.event.countdown.enabled ? `<div class="countBox" aria-live="polite"><h3>${escapeHtml(config.event.countdown.title)}</h3><div class="countNums"><div class="countCell"><div class="countVal" id="cdDays">0</div><div class="countLab">días</div></div><div class="countCell"><div class="countVal" id="cdHours">0</div><div class="countLab">horas</div></div><div class="countCell"><div class="countVal" id="cdMins">0</div><div class="countLab">min</div></div><div class="countCell"><div class="countVal" id="cdSecs">0</div><div class="countLab">seg</div></div></div><p id="countdownState"></p></div>` : ""}<button class="btn small outline" id="heroCta" type="button">${escapeHtml(s.cta)}</button></div><div class="hero-right"><div class="hex"><img class="hexImg configurable-image" src="${escapeHtml(config.resources.hero.src)}" alt="${escapeHtml(config.resources.hero.alt)}" width="720" height="960" fetchpriority="high"></div></div></div></section>`;
}

function renderSections() {
  const s = config.sections; const output = [];
  if (s.story.enabled) output.push(section("historia", "paper-soft", `<div class="container center"><h2>${escapeHtml(s.story.title)}</h2><p class="dateIntro">${escapeHtml(s.story.intro)}</p><div class="parentsGrid">${s.story.families.map((f) => `<div class="parentsCol"><div class="parentRole">${escapeHtml(f.role)}</div>${f.names.map(n => `<div class="parentName">${escapeHtml(n)}</div>`).join("")}</div>`).join('<div class="and">&amp;</div>')}</div><div class="dateCard"><div class="dateSide">${escapeHtml(new Intl.DateTimeFormat(config.event.locale, { weekday: "long", timeZone: config.event.timeZone }).format(new Date(config.event.startsAt)))}</div><div class="dateMid">${new Date(config.event.startsAt).toLocaleString(config.event.locale, { day: "2-digit", timeZone: config.event.timeZone })}</div><div class="dateSide">${escapeHtml(config.event.displayedTime)}</div></div><p class="dateBottom">${escapeHtml(new Intl.DateTimeFormat(config.event.locale, { month: "long", year: "numeric", timeZone: config.event.timeZone }).format(new Date(config.event.startsAt)))}</p><blockquote class="quoteBox"><p class="quoteText">${escapeHtml(s.story.quote)}</p><cite class="quoteRef">${escapeHtml(s.story.quoteSource)}</cite></blockquote></div>`));
  if (s.locations.enabled) output.push(section("lugares", "paper", `<div class="container center"><h2>${escapeHtml(s.locations.title)}</h2><div class="twoCols">${s.locations.items.filter(x => x.enabled).map(x => `<article class="eventCard"><h3 class="eventTitle">${escapeHtml(x.title)}</h3><p class="eventPlace">${escapeHtml(x.venue)}</p><p class="eventMeta">${escapeHtml(x.address)}<br>${escapeHtml(x.time)}<br>${escapeHtml(x.helperText)}</p>${x.mapUrl ? `<a class="btn small" href="${escapeHtml(x.mapUrl)}" target="_blank" rel="noopener noreferrer">Abrir mapa</a>` : `<span class="demo-note">Mapa no configurado</span>`}</article>`).join("")}</div></div>`));
  if (s.gallery.enabled) output.push(section("galeria", "paper-soft", `<div class="container center"><h2>${escapeHtml(s.gallery.title)}</h2><div class="galleryGrid">${config.resources.gallery.map((x, i) => `<figure class="ph ${String.fromCharCode(97+i)}"><img class="configurable-image" src="${escapeHtml(x.src)}" alt="${escapeHtml(x.alt)}" loading="lazy" width="720" height="960"><figcaption class="sr-only">${escapeHtml(x.caption)}</figcaption></figure>`).join("")}</div></div>`));
  if (s.itinerary.enabled) output.push(section("itinerario", "paper", `<div class="container center"><h2>${escapeHtml(s.itinerary.title)}</h2><p>${escapeHtml(s.itinerary.subtitle)}</p><ol class="timeline">${s.itinerary.items.map(x => `<li class="tItem"><time class="tTime">${escapeHtml(x.time)}</time><p class="tDesc">${escapeHtml(x.title)}</p></li>`).join("")}</ol></div>`));
  if (s.details.enabled || s.gifts.enabled) output.push(section("detalles", "paper-soft", `<div class="container center"><h2>${escapeHtml(s.details.title)}</h2><div class="split2">${s.details.enabled ? `<article class="infoBlock"><h3 class="infoTitle">Código de vestimenta</h3><p class="infoText">${escapeHtml(s.details.dressCode)}<br>${escapeHtml(s.details.restrictions)}<br>${escapeHtml(s.details.reservedColors)}</p><ul>${s.details.recommendations.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul></article>` : ""}${s.gifts.enabled ? `<article class="infoBlock"><h3 class="infoTitle">${escapeHtml(s.gifts.title)}</h3><p class="infoText">${escapeHtml(s.gifts.intro)}</p>${s.gifts.methods.map(x => x.url ? `<a href="${escapeHtml(x.url)}">${escapeHtml(x.label)}</a>` : `<p>${escapeHtml(x.label)}</p>`).join("")}</article>` : ""}</div></div>`));
  if (s.rsvp.enabled) output.push(section("confirmacion", "paper", `<div class="container center"><h2>${escapeHtml(s.rsvp.title)}</h2><p>${escapeHtml(s.rsvp.text)}</p><form id="rsvpForm" class="formWrap"><div class="fieldRow"><label for="rsvpName">Nombre</label><input class="field" id="rsvpName" name="name" required autocomplete="name"></div><fieldset class="fieldRow"><legend>¿Asistirás?</legend><label><input type="radio" name="attendance" value="Sí" required> Sí</label> <label><input type="radio" name="attendance" value="No"> No</label></fieldset><button class="btn" id="rsvpBtn" type="submit">${escapeHtml(s.rsvp.submitLabel)}</button><p class="statusMsg" id="rsvpStatus" role="status" aria-live="polite"></p></form></div>`));
  return output.join("");
}

function startCountdown() {
  if (!config.event.countdown.enabled) return;
  const target = Date.parse(config.event.startsAt);
  const update = () => { const diff = Math.max(0, target - Date.now()); const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60]; ["cdDays", "cdHours", "cdMins", "cdSecs"].forEach((id, i) => { const el = document.getElementById(id); if (el) el.textContent = String(values[i]); }); if (!diff) $("#countdownState").textContent = config.event.countdown.expiredText; return diff; };
  update(); const timer = setInterval(() => { if (!update()) clearInterval(timer); }, 1000);
}

function wireInteractions() {
  const gate = $("#gate"); const opener = $("#envWrap");
  const open = () => { if (!gate || gate.classList.contains("is-opening")) return; gate.classList.add("is-opening"); setTimeout(() => { document.body.classList.add("gate-done"); gate.setAttribute("aria-hidden", "true"); $("#inicio")?.focus({ preventScroll: true }); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100); };
  opener?.addEventListener("click", open); opener?.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  $("#heroCta")?.addEventListener("click", () => $("main [data-section]:not([data-section='hero'])")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  const form = $("#rsvpForm"); form?.addEventListener("submit", (event) => { event.preventDefault(); const status = $("#rsvpStatus"); const button = $("#rsvpBtn"); button.disabled = true; status.textContent = config.sections.rsvp.loadingText; setTimeout(() => { status.textContent = config.integrations.rsvp.mode === "demo" ? config.sections.rsvp.successText : config.sections.rsvp.errorText; button.disabled = false; }, 300); });
  const audio = $("#bgMusic"), musicButton = $("#musicBtn"); musicButton?.addEventListener("click", async () => { try { if (audio.paused) await audio.play(); else audio.pause(); musicButton.setAttribute("aria-pressed", String(!audio.paused)); musicButton.textContent = audio.paused ? `Reproducir ${config.resources.music.title}` : `Pausar ${config.resources.music.title}`; } catch { musicButton.textContent = "No se pudo reproducir el audio"; } });
}

function init() {
  const validation = validateConfig(config); if (!validation.valid) { $("#configErrors").hidden = false; $("#configErrors").textContent = `Error de configuración: ${validation.errors.join("; ")}`; return; }
  applyMetadata(); const guest = new URLSearchParams(location.search).get(config.opening.guestQueryParameter) || config.opening.defaultGuest; const seats = Number(new URLSearchParams(location.search).get(config.opening.seatsQueryParameter)) || config.opening.defaultSeats;
  $("#app").innerHTML = `${renderOpening()}${config.resources.music.enabled ? `<audio id="bgMusic" preload="metadata" ${config.resources.music.loop ? "loop" : ""} src="${escapeHtml(config.resources.music.src)}"></audio>` : ""}<main id="appContent" tabindex="-1">${renderHero()}${renderSections()}</main><footer><p>${escapeHtml(config.identity.closing)}</p><p>${escapeHtml(config.identity.credits)}</p></footer>`;
  if ($("#guestLine")) $("#guestLine").textContent = guest; if ($("#paxLine")) $("#paxLine").textContent = `${seats} ${seats === 1 ? "cupo" : "cupos"}`;
  if (!config.opening.enabled) document.body.classList.add("gate-done"); if ($("#inicio")) $("#inicio").setAttribute("tabindex", "-1"); if ($("#bgMusic")) $("#bgMusic").volume = Math.min(1, Math.max(0, config.resources.music.initialVolume));
  wireInteractions(); startCountdown(); document.body.classList.add("config-ready");
}

init();
