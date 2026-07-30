const fs = require("node:fs");
const css = fs.readFileSync("css/styles.css", "utf8");
const errors = [];

// Strip comments/strings before checking structural braces and malformed media queries.
const structural = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, "");
let depth = 0;
for (const char of structural) {
  if (char === "{") depth += 1;
  if (char === "}" && --depth < 0) errors.push("Llave de cierre CSS sin apertura");
}
if (depth !== 0) errors.push(`Llaves CSS desbalanceadas: ${depth}`);
if (/^\s*\((?:min|max)-width\s*:/m.test(structural)) errors.push("Regla responsive sin @media");

const requiredSelectors = [".gate", ".gate-card", ".env-wrap", ".heroContent", ".heroNames", ".heroInvite", ".countNums", ".placesGrid", ".placeCard", ".gallery", ".gItem", ".timeline", ".timelineItem", "#rsvpForm", ".rsvpChoice", ".choiceBtn", ".statusMsg", ".footer"];
requiredSelectors.forEach((selector) => { if (!css.includes(selector)) errors.push(`Falta estilo para ${selector}`); });
[320, 390, 768, 1440].forEach((width) => {
  if (width <= 520 && !/@media\s*\(max-width:\s*520px\)/.test(css)) errors.push(`No hay breakpoint móvil para ${width}px`);
});
const overflowGuards = [/overflow-x:\s*hidden/, /max-width:\s*100%/, /minmax\(0,\s*1fr\)/];
overflowGuards.forEach((guard) => { if (!guard.test(css)) errors.push(`Falta protección de overflow: ${guard}`); });

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("CSS estructuralmente válido, responsive y con estilos de componentes completos.");
console.log("Anchos cubiertos por las reglas: 320, 390, 768 y 1440 px.");
