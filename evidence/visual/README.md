# Evidencia visual responsive

El workflow **Validate invitation** ejecuta `scripts/visual-test.mjs` con Chromium real en cada push y pull request hacia `main`.

## Matriz y capturas

Para cada ancho se generan dos PNG como artefacto `visual-evidence` del check de GitHub Actions:

| Resolución | Portada | Recorrido completo |
| ---: | --- | --- |
| 320 × 900 | `320-portada.png` | `320-recorrido-completo.png` |
| 390 × 900 | `390-portada.png` | `390-recorrido-completo.png` |
| 768 × 900 | `768-portada.png` | `768-recorrido-completo.png` |
| 1440 × 900 | `1440-portada.png` | `1440-recorrido-completo.png` |

Las imágenes se escriben en `evidence/visual/` durante el job y se publican incluso si una comprobación posterior falla. No se versionan capturas generadas localmente para evitar evidencia obsoleta.

## Comprobaciones automatizadas

En cada resolución, la prueba:

1. Sirve la aplicación en `/KEG-Invitation/` y captura la portada.
2. Abre la invitación, recorre todas las secciones configuradas y captura la página completa.
3. Comprueba que el número de secciones renderizadas corresponda con las secciones habilitadas.
4. Envía el formulario de demostración y verifica el mensaje local de no envío.
5. Falla ante overflow horizontal, errores de consola o solicitudes de red fallidas.
6. Falla si detecta solicitudes a WhatsApp, Google Script, webhooks o endpoints similares.
7. Verifica `demoMode`, endpoint y WhatsApp vacíos, y ausencia de cuentas bancarias.

Los resultados y PNG válidos deben consultarse en el artefacto del último run de GitHub Actions asociado al PR; el PR debe permanecer en Draft si el job no está verde.
