# Evidencia de validación responsive

Fecha: 2026-07-30

| Viewport | Reglas verificadas | Overflow horizontal |
| ---: | --- | --- |
| 320 px | breakpoint móvil de 520 px | guardas presentes |
| 390 px | breakpoint móvil de 520 px | guardas presentes |
| 768 px | layout fluido de tablet | guardas presentes |
| 1440 px | layout desktop | guardas presentes |

La evidencia anterior la genera la validación estática `scripts/validate-css.js`: comprueba estructura, selectores utilizados, breakpoints y las guardas `overflow-x`, `max-width` y tracks de grid contraíbles.

## Capturas pendientes

No se incluyen capturas renderizadas porque el entorno de ejecución no contiene un navegador. Los intentos reales de instalar Chromium y Playwright fueron bloqueados con HTTP 403 por la red del entorno. Antes de aprobar el Draft PR debe ejecutarse una revisión visual en un navegador real en los cuatro anchos indicados y adjuntar las capturas al PR. Esta tabla no se presenta como sustituto de esa revisión visual.
