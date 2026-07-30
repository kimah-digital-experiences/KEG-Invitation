# KEG Invitation — plantilla configurable

Invitación estática, sin frameworks, preparada para publicarse bajo `/KEG-Invitation/` en GitHub Pages. El diseño, las animaciones de apertura y el recorrido vertical se conservan, mientras que el contenido de ejemplo es completamente ficticio.

## Personalizar una invitación

Toda la información editable vive en **`js/config.js`**. No es necesario tocar el HTML:

1. Cambia `couple`, `event`, `texts` y `family`.
2. Edita `locations` e `itinerary`; deja `mapUrl` vacío hasta contar con un enlace público revisado.
3. Copia imágenes optimizadas dentro de `assets/` y actualiza las rutas de `gallery`. Usa rutas relativas para mantener compatibilidad con GitHub Pages.
4. Configura `music.src` y cambia `music.enabled` a `true` solo si tienes permiso para publicar el audio.
5. Activa o desactiva bloques con los booleanos de `sections` y los `enabled` de música/regalos/RSVP.
6. Ejecuta `npm test` antes de publicar.

Para probar localmente, ejecuta `python3 -m http.server 8000` y abre `http://localhost:8000/KEG-Invitation/` si el repositorio está servido desde su directorio padre, o `http://localhost:8000/` desde la raíz del repositorio.

## Seguridad por defecto

- Los nombres, domicilios, fechas y lugares incluidos son ficticios.
- RSVP funciona exclusivamente como demostración en el navegador: no hace `fetch`, no envía ni persiste respuestas.
- `rsvp.endpoint` y `rsvp.whatsappUrl` están vacíos.
- `gifts.bankAccounts` está vacío y no se muestran datos bancarios.
- La personalización por URL se limita a texto escapado y a un número de personas entre 1 y 20.

Si en el futuro se implementa un envío real, no pongas secretos en este repositorio: usa un servicio con consentimiento, validación del lado del servidor, protección contra abuso y una política de privacidad. Modifica también las validaciones deliberadamente; no las evites.

## Estructura

- `js/config.js`: configuración central.
- `js/app.js`: renderizado, interacciones, cuenta regresiva y RSVP demo.
- `css/styles.css`: presentación y animaciones existentes.
- `assets/demo/`: recursos ficticios de muestra.
- `scripts/`: comprobaciones sin dependencias externas.

## Validación

```bash
npm test
```

La validación comprueba campos obligatorios, fecha ISO, existencia de recursos, modo demo, integraciones vacías y patrones básicos de datos sensibles. Es una defensa auxiliar, no sustituye una revisión humana.
