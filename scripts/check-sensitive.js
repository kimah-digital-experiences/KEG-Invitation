const fs = require("node:fs");
const path = require("node:path");
const files = ["index.html", "js/config.js", "js/app.js", "README.md"];
const forbidden = [
  [/script\.google\.com|wa\.me|api\.whatsapp\.com/i, "endpoint o WhatsApp real"],
  [/\b(?:cuenta|account)\s*(?:n[úu]mero|number|#)?\s*[:=-]?\s*\d{6,}/i, "posible cuenta bancaria"],
  [/\b\+?\d{10,15}\b/, "posible teléfono"]
];
const findings = [];
files.forEach((file) => { const text = fs.readFileSync(path.join(__dirname, "..", file), "utf8"); forbidden.forEach(([pattern, label]) => { if (pattern.test(text)) findings.push(`${file}: ${label}`); }); });
if (findings.length) { console.error(findings.join("\n")); process.exit(1); }
console.log("No se detectaron endpoints, teléfonos ni cuentas bancarias reales.");
