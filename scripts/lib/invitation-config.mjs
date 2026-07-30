import { access, readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULTS = {
  site: { basePath: "./", language: "es", title: "" },
  cover: {
    eyebrow: "Invitación",
    letterLabel: "Una celebración para recordar",
    openLabel: "Abrir invitación",
    hint: "Toca el sobre para descubrir los detalles",
    monogram: "",
  },
  guest: { defaultLabel: "INVITADO ESPECIAL", defaultPartySize: 1, allowUrlPersonalization: true },
  event: { timeZone: "America/Tegucigalpa", dateLabel: {} },
  texts: {
    invitation: "Tenemos el gusto de invitarte a celebrar con nosotros.",
    quote: "",
    galleryTitle: "Nuestra historia",
    itineraryTitle: "Itinerario",
    dressCode: "Formal",
    gifts: "Nuestro mejor regalo es tu presencia.",
    rsvp: "Confirma tu asistencia.",
  },
  family: { person1: [], person2: [] },
  locations: [],
  itinerary: [],
  gallery: [],
  music: { enabled: false, src: "", autoplayAfterOpen: false },
  gifts: { enabled: false, message: "", bankAccounts: [] },
  rsvp: {
    enabled: true,
    demoMode: true,
    endpoint: "",
    whatsappUrl: "",
    successMessage: "Respuesta simulada. No se enviaron datos.",
  },
  sections: {
    date: true,
    locations: true,
    gallery: true,
    itinerary: true,
    dressCode: true,
    gifts: true,
    rsvp: true,
  },
};

const isObject = (value) => value != null && typeof value === "object" && !Array.isArray(value);

function mergeConfig(base, override) {
  if (!isObject(override)) return structuredClone(override ?? base);
  const result = structuredClone(base);
  for (const [key, value] of Object.entries(override)) {
    result[key] = isObject(value) && isObject(result[key])
      ? mergeConfig(result[key], value)
      : structuredClone(value);
  }
  return result;
}

function firstInitial(value, language) {
  return Array.from(String(value || "").trim())[0]?.toLocaleUpperCase(language) || "";
}

function deriveDateLabel(event, language) {
  const date = new Date(event.dateTime);
  if (Number.isNaN(date.valueOf())) return event.dateLabel;

  const parts = new Intl.DateTimeFormat(language, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: event.timeZone,
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  const month = value("month");

  return {
    day: event.dateLabel.day || value("day"),
    month: event.dateLabel.month || `${month.charAt(0).toLocaleUpperCase(language)}${month.slice(1)}`,
    year: event.dateLabel.year || value("year"),
    time: event.dateLabel.time || new Intl.DateTimeFormat(language, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: event.timeZone,
    }).format(date),
  };
}

export function normalizeInvitationConfig(input, options = {}) {
  const config = mergeConfig(DEFAULTS, input);
  const language = config.site.language || "es";

  if (options.basePath) config.site.basePath = options.basePath;
  if (!config.site.title && config.couple?.short1 && config.couple?.short2) {
    config.site.title = `${config.couple.short1} & ${config.couple.short2} | Invitación`;
  }
  if (!config.cover.monogram && config.couple?.short1 && config.couple?.short2) {
    config.cover.monogram = `${firstInitial(config.couple.short1, language)}${firstInitial(config.couple.short2, language)}`;
  }
  config.event.dateLabel = deriveDateLabel(config.event, language);

  return config;
}

function isSafeLocalPath(value) {
  if (!value || path.posix.isAbsolute(value) || value.includes("\\") || value.includes("\0")) return false;
  return !value.split("/").includes("..");
}

function isSecureUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function getLocalAssetPaths(config) {
  const assets = [...config.gallery, config.music.src].filter(Boolean);
  return [...new Set(assets.filter((asset) => !/^https?:\/\//i.test(asset)))];
}

export async function validateInvitationConfig(config, options = {}) {
  const errors = [];
  const requiredRoots = [
    "site", "cover", "couple", "guest", "event", "texts", "locations", "itinerary",
    "gallery", "music", "gifts", "rsvp", "sections",
  ];
  const requireText = (value, label) => {
    if (typeof value !== "string" || !value.trim()) errors.push(`${label} debe contener texto`);
  };

  requiredRoots.forEach((key) => {
    if (config[key] == null) errors.push(`Falta ${key}`);
  });
  requireText(config.site?.language, "site.language");
  requireText(config.site?.title, "site.title");
  requireText(config.site?.basePath, "site.basePath");
  if (config.site?.basePath && !/^(?:\.\/|\/.*\/)$/.test(config.site.basePath)) {
    errors.push("site.basePath debe ser './' o una ruta que empiece y termine en '/'");
  }

  ["person1", "person2", "short1", "short2"].forEach((key) => requireText(config.couple?.[key], `couple.${key}`));
  ["eyebrow", "letterLabel", "openLabel", "hint", "monogram"].forEach((key) => requireText(config.cover?.[key], `cover.${key}`));
  if (Array.from(config.cover?.monogram || "").length > 4) errors.push("cover.monogram admite como máximo 4 caracteres");

  if (Number.isNaN(Date.parse(config.event?.dateTime))) errors.push("event.dateTime no es una fecha ISO válida");
  try {
    new Intl.DateTimeFormat(config.site?.language || "es", { timeZone: config.event?.timeZone }).format();
  } catch {
    errors.push("event.timeZone no es una zona horaria IANA válida");
  }
  ["day", "month", "year", "time"].forEach((key) => requireText(config.event?.dateLabel?.[key], `event.dateLabel.${key}`));
  requireText(config.event?.city, "event.city");

  if (!Number.isInteger(config.guest?.defaultPartySize)
    || config.guest.defaultPartySize < 1
    || config.guest.defaultPartySize > 20) {
    errors.push("guest.defaultPartySize debe ser un entero entre 1 y 20");
  }
  if (!Array.isArray(config.locations) || !config.locations.length) {
    errors.push("locations debe contener al menos un lugar");
  }
  config.locations?.forEach((location, index) => {
    ["title", "time", "name", "address"].forEach((key) => requireText(location[key], `locations[${index}].${key}`));
    if (location.mapUrl && !isSecureUrl(location.mapUrl)) errors.push(`locations[${index}].mapUrl debe usar HTTPS`);
  });
  if (!Array.isArray(config.itinerary)) errors.push("itinerary debe ser un arreglo");
  if (!Array.isArray(config.gallery)) errors.push("gallery debe ser un arreglo");
  if (config.sections?.gallery && !config.gallery?.length) errors.push("gallery requiere recursos cuando la sección está activa");

  for (const [key, value] of Object.entries(config.sections || {})) {
    if (typeof value !== "boolean") errors.push(`sections.${key} debe ser booleano`);
  }
  if (!config.rsvp?.demoMode || config.rsvp.endpoint || config.rsvp.whatsappUrl) {
    errors.push("RSVP debe permanecer en demo y sin integraciones por defecto");
  }
  if (config.gifts?.bankAccounts?.length) errors.push("Las cuentas bancarias deben estar vacías por defecto");
  if (config.music?.enabled && !config.music.src) errors.push("music.src es obligatorio cuando music.enabled es true");

  const assetReferences = [...config.gallery, config.music.src].filter(Boolean);
  for (const asset of assetReferences) {
    if (/^https?:\/\//i.test(asset)) {
      if (!isSecureUrl(asset)) errors.push(`El recurso remoto debe usar HTTPS: ${asset}`);
    } else if (!isSafeLocalPath(asset)) {
      errors.push(`Ruta de recurso local no segura: ${asset}`);
    }
  }

  if (options.assetsRoot) {
    for (const asset of getLocalAssetPaths(config)) {
      try {
        await access(path.join(options.assetsRoot, asset));
      } catch {
        errors.push(`Recurso inexistente: ${asset}`);
      }
    }
  }

  return errors;
}

export function serializeBrowserConfig(config) {
  const json = JSON.stringify(config, null, 2)
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

  return `/** Archivo generado desde config/invitation.json. No lo edites manualmente. */
(() => {
  const deepFreeze = (value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  };

  window.INVITATION_CONFIG = deepFreeze(${json});
})();
`;
}

export async function readInvitationInput(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}
