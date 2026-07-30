import { invitationConfig } from "../config/invitation.config.js";
import { validateConfig } from "../src/validate-config.js";
const result = validateConfig(invitationConfig);
result.warnings.forEach(warning => console.warn(`ADVERTENCIA: ${warning}`));
if (!result.valid) { result.errors.forEach(error => console.error(`ERROR: ${error}`)); process.exitCode = 1; } else console.log("Configuración válida");
