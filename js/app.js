(() => {
  "use strict";
  const config = window.INVITATION_CONFIG;
  const required = ["site", "couple", "event", "locations", "itinerary", "gallery", "rsvp", "sections"];
  const errors = required.filter((key) => !config || config[key] == null);
  if (errors.length) { document.body.textContent = `Configuración incompleta: ${errors.join(", ")}`; return; }

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const names = `${config.couple.short1} <span class="heroAmp">&amp;</span> ${config.couple.short2}`;
  document.documentElement.lang = config.site.language;
  document.title = config.site.title;
  document.querySelectorAll("[data-names]").forEach((node) => { node.innerHTML = names; });

  const params = new URLSearchParams(location.search);
  const rawGuest = config.guest.allowUrlPersonalization ? (params.get("invitados") || "") : "";
  const guest = rawGuest.replace(/[<>]/g, "").trim() || config.guest.defaultLabel;
  const partySize = Math.max(1, Math.min(20, Number(params.get("personas")) || config.guest.defaultPartySize));
  document.querySelector("#guestLine").textContent = guest;
  document.querySelector("#paxLine").textContent = `- ${partySize} ${partySize === 1 ? "PERSONA" : "PERSONAS"} -`;
  document.querySelector("#invitationText").textContent = config.texts.invitation;

  const section = (id, title, body, tone = "paper-soft") => `<section class="section reveal ${tone}" id="${id}"><div class="container"><h2>${escapeHtml(title)}</h2><div class="divider"></div>${body}</div></section>`;
  const parts = [];
  if (config.sections.date) parts.push(section("fecha", "Nuestra boda", `<p class="quote">${escapeHtml(config.texts.quote)}</p><div class="dateBlock"><strong>${escapeHtml(config.event.dateLabel.day)} / ${escapeHtml(config.event.dateLabel.month)} / ${escapeHtml(config.event.dateLabel.year)}</strong><br>${escapeHtml(config.event.dateLabel.time)}</div>`));
  if (config.sections.locations) parts.push(section("lugares", "Lugares", `<div class="placesGrid">${config.locations.map((place) => `<article class="placeCard"><h3>${escapeHtml(place.title)}</h3><strong>${escapeHtml(place.time)}</strong><p>${escapeHtml(place.name)}<br>${escapeHtml(place.address)}</p>${place.mapUrl ? `<a class="btn small" href="${escapeHtml(place.mapUrl)}" target="_blank" rel="noopener noreferrer">Ver mapa</a>` : ""}</article>`).join("")}</div>`, "paper"));
  if (config.sections.gallery) parts.push(section("galeria", config.texts.galleryTitle, `<div class="gallery">${config.gallery.map((src, i) => `<figure class="gItem"><img loading="lazy" src="${escapeHtml(src)}" alt="Imagen de demostración ${i + 1}"></figure>`).join("")}</div>`));
  if (config.sections.itinerary) parts.push(section("itinerario", config.texts.itineraryTitle, `<div class="timeline">${config.itinerary.map((item) => `<article class="timelineItem"><strong>${escapeHtml(item.time)}</strong><h3>${escapeHtml(item.title)}</h3></article>`).join("")}</div>`, "paper"));
  if (config.sections.dressCode) parts.push(section("vestimenta", "Código de vestimenta", "<p>Formal</p>"));
  if (config.sections.gifts && config.gifts.enabled) parts.push(section("regalos", "Regalos", `<p>${escapeHtml(config.gifts.message || config.texts.gifts)}</p>${config.gifts.bankAccounts.length ? "<p>Opciones configuradas por el anfitrión.</p>" : '<p class="statusMsg">Transferencias bancarias desactivadas.</p>'}`, "paper"));
  if (config.sections.rsvp && config.rsvp.enabled) parts.push(section("confirmacion", "Confirmación", `<p>${escapeHtml(config.texts.rsvp)}</p><form id="rsvpForm"><label>Nombre<input class="field" id="rsvpName" required autocomplete="name"></label><div class="rsvpChoice"><button class="choiceBtn" type="button" data-answer="Sí">Sí asistiré</button><button class="choiceBtn" type="button" data-answer="No">No podré asistir</button></div><button class="btn" type="submit">Simular confirmación</button><div class="statusMsg" id="rsvpMsg" role="status"></div></form>`));
  document.querySelector("#sections").innerHTML = parts.join("");
  document.querySelector("#footer").textContent = `${config.couple.short1} & ${config.couple.short2} • ${config.event.city}`;

  const target = new Date(config.event.dateTime);
  const renderCountdown = () => { const seconds = Math.max(0, Math.floor((target - Date.now()) / 1000)); const values = [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]; document.querySelector("#countNums").innerHTML = values.map((v, i) => `<div class="countCell"><div class="countVal">${v}</div><div class="countLab">${["Días","Horas","Minutos","Segundos"][i]}</div></div>`).join(""); };
  renderCountdown(); setInterval(renderCountdown, 1000);

  document.querySelector("#envWrap").addEventListener("click", () => {
    const gate = document.querySelector("#gate");
    const appContent = document.querySelector("#appContent");
    gate.classList.add("open");
    setTimeout(() => {
      document.body.classList.add("gate-done");
      document.body.classList.remove("gate-open");
      gate.hidden = true;
      appContent.hidden = false;
    }, 500);
  });
  let answer = "Sí";
  document.querySelectorAll("[data-answer]").forEach((button) => button.addEventListener("click", () => { answer = button.dataset.answer; document.querySelectorAll("[data-answer]").forEach((item) => item.classList.toggle("active", item === button)); }));
  document.querySelector("#rsvpForm")?.addEventListener("submit", (event) => { event.preventDefault(); const message = document.querySelector("#rsvpMsg"); if (!config.rsvp.demoMode || config.rsvp.endpoint || config.rsvp.whatsappUrl) { message.textContent = "Envío bloqueado: esta plantilla solo admite el modo demostración."; return; } message.textContent = `${config.rsvp.successMessage} Respuesta: ${answer}.`; });

  const audio = new Audio();
  const musicButton = document.querySelector("#musicBtn");
  if (config.music.enabled && config.music.src) { musicButton.hidden = false; audio.src = config.music.src; musicButton.addEventListener("click", async () => { if (audio.paused) { try { await audio.play(); musicButton.textContent = "❚❚ Música"; } catch { musicButton.textContent = "Audio de muestra no disponible"; } } else { audio.pause(); musicButton.textContent = "▶ Música"; } }); }
})();
