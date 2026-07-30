# Evidencia visual responsive

El workflow **Validate invitation** ejecuta `scripts/visual-test.mjs` con Chromium real en cada push y pull request hacia `main`.

## Matriz y capturas

Para cada ancho se generan tres PNG como artefacto `visual-evidence` del check de GitHub Actions:

| Resolución | Portada | Apertura | Recorrido completo |
| ---: | --- | --- | --- |
| 320 × 900 | `320-portada.png` | `320-apertura.png` | `320-recorrido-completo.png` |
| 390 × 900 | `390-portada.png` | `390-apertura.png` | `390-recorrido-completo.png` |
| 768 × 900 | `768-portada.png` | `768-apertura.png` | `768-recorrido-completo.png` |
| 1440 × 900 | `1440-portada.png` | `1440-apertura.png` | `1440-recorrido-completo.png` |

Las imágenes se escriben en `evidence/visual/` durante el job y se publican incluso si una comprobación posterior falla. No se versionan capturas generadas localmente para evitar evidencia obsoleta.

## Comprobaciones automatizadas

En cada resolución, la prueba:

1. Sirve la aplicación en `/KEG-Invitation/` y captura la portada.
2. Comprueba que el sobre conserve una proporción rectangular 16:10 y que el sello ocupe menos del 20 % de su ancho.
3. Confirma que el monograma y el texto de apertura provengan de la configuración.
4. Abre la invitación, recorre todas las secciones configuradas y captura la página completa.
5. Comprueba que el número de secciones renderizadas corresponda con las secciones habilitadas.
6. Envía el formulario de demostración y verifica el mensaje local de no envío.
7. Falla ante overflow horizontal, errores de consola o solicitudes de red fallidas.
8. Falla si detecta solicitudes a WhatsApp, Google Script, webhooks o endpoints similares.
9. Verifica `demoMode`, endpoint y WhatsApp vacíos, y ausencia de cuentas bancarias.
10. Repite la apertura con `prefers-reduced-motion: reduce` y exige una transición inmediata.

Los resultados y PNG válidos deben consultarse en el artefacto del último run de GitHub Actions asociado al PR; el PR debe permanecer en Draft si el job no está verde.
