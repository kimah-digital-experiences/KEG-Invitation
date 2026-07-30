# Estado de validación visual responsive

Fecha del último intento: 2026-07-30.

## Resultado

La validación visual real continúa **bloqueada y no se considera completada**. Este entorno no incluye Chromium, Chrome, Firefox, Playwright, Puppeteer ni otro motor gráfico. Además:

- La instalación de Chromium mediante `apt-get` fue bloqueada por el proxy con HTTP 403.
- La descarga de Playwright mediante `npx` fue bloqueada por el registro con HTTP 403.
- El acceso al PR #3 y a GitHub mediante `curl`/Git también fue bloqueado por el túnel con HTTP 403.

Por este motivo, este directorio no contiene capturas: no se generó ni se adjuntó evidencia visual ficticia. El PR debe permanecer en Draft hasta ejecutar la matriz en un navegador real.

## Verificaciones que sí se ejecutaron

La aplicación se sirvió desde el directorio padre con:

```bash
python3 -m http.server 8765 --directory /workspace
```

Se comprobó correctamente la ruta `/KEG-Invitation/` y la carga HTTP de `css/styles.css` y `js/app.js`. También pasó `npm test`, incluida la revisión estática para 320, 390, 768 y 1440 px y las guardas contra overflow. Estas comprobaciones **no sustituyen** una validación renderizada.

## Matriz pendiente en navegador

En 320, 390, 768 y 1440 px se debe capturar y revisar:

1. Portada antes de abrir.
2. Animación de apertura y hero posterior.
3. Recorrido vertical completo y todas las secciones habilitadas.
4. Una sección deshabilitada desde `js/config.js`.
5. Ausencia de scroll horizontal y superposiciones.
6. Consola sin errores y red sin solicitudes de RSVP, WhatsApp ni endpoints reales.
7. RSVP demo sin envío y regalos sin cuentas bancarias.

Las capturas reales deberán guardarse en este mismo directorio antes de aprobar el PR.
