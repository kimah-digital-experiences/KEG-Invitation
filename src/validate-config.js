const HTTP_PROTOCOLS = new Set(["https:"]);

export function validateConfig(config, { production = false } = {}) {
  const errors = [];
  const warnings = [];
  const required = [["identity.id", config?.identity?.id], ["identity.siteTitle", config?.identity?.siteTitle], ["identity.couple.partner1", config?.identity?.couple?.partner1], ["identity.couple.partner2", config?.identity?.couple?.partner2], ["event.startsAt", config?.event?.startsAt]];
  required.forEach(([field, value]) => { if (!String(value || "").trim()) errors.push(`${field}: campo obligatorio ausente`); });
  if (config?.event?.startsAt && Number.isNaN(Date.parse(config.event.startsAt))) errors.push("event.startsAt: fecha ISO inválida");
  const ids = [];
  config?.sections?.locations?.items?.forEach((item) => { ids.push(item.id); if (item.enabled && (!item.title || !item.venue)) errors.push(`locations.${item.id}: requiere title y venue`); });
  config?.sections?.itinerary?.items?.forEach((item) => ids.push(item.id));
  config?.resources?.gallery?.forEach((item) => ids.push(item.id));
  const duplicates = ids.filter((id, index) => id && ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`Identificadores duplicados: ${[...new Set(duplicates)].join(", ")}`);
  if (config?.sections?.gallery?.enabled && !config?.resources?.gallery?.length) errors.push("resources.gallery: la galería habilitada está vacía");
  const urls = [];
  config?.sections?.locations?.items?.forEach((item) => item.mapUrl && urls.push([`locations.${item.id}.mapUrl`, item.mapUrl]));
  [config?.sections?.contact?.url, config?.integrations?.rsvp?.endpoint, config?.integrations?.whatsapp?.url].forEach((url, i) => url && urls.push([["contact.url", "rsvp.endpoint", "whatsapp.url"][i], url]));
  urls.forEach(([field, value]) => { try { if (!HTTP_PROTOCOLS.has(new URL(value).protocol)) errors.push(`${field}: solo se permite HTTPS`); } catch { errors.push(`${field}: URL inválida`); } });
  if (config?.integrations?.rsvp?.mode !== "demo" && !config?.integrations?.rsvp?.endpoint) errors.push("integrations.rsvp.endpoint: requerido fuera del modo demo");
  if (config?.integrations?.whatsapp?.enabled && !config?.integrations?.whatsapp?.phone) errors.push("integrations.whatsapp.phone: requerido al habilitar WhatsApp");
  if (config?.resources?.music?.enabled && !config?.resources?.music?.src) errors.push("resources.music.src: requerido al habilitar música");
  if (config?.resources?.music?.src && !config.resources.music.licenseVerified) warnings.push("resources.music: licencia no verificada; no habilitar en producción");
  if (production && config?.integrations?.rsvp?.mode === "demo") errors.push("integrations.rsvp.mode: la configuración de demostración no puede marcarse como producción");
  return { valid: errors.length === 0, errors, warnings };
}
