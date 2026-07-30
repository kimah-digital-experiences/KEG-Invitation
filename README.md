# KEG Invitation — plantilla automática

Invitación de boda estática, sin framework ni dependencias de ejecución. Conserva el recorrido
vertical de KEG, incorpora una portada premium con sobre rectangular y usa un flujo automático
inspirado en Polaris: **configuración → validación → generación aislada → revisión visual**.

## Crear una invitación automáticamente

1. Copia `config/invitation.json` y completa los datos del nuevo evento.
2. Mantén las rutas de fotos y audio relativas al repositorio.
3. Ejecuta:

```bash
npm run create:invitation -- boda-ejemplo \
  --config ./datos-boda.json \
  --output ./generated/boda-ejemplo \
  --base-path /boda-ejemplo/
```

La CLI:

- valida contenido, fecha, zona horaria, rutas y recursos;
- deriva título, fecha y monograma cuando no se proporcionan;
- crea una copia estática completa y lista para publicar;
- conserva RSVP, WhatsApp y cuentas bancarias desactivados por defecto;
- rechaza carpetas existentes y nunca sobrescribe otra invitación.

La salida predeterminada es `generated/<slug>/`. Esa carpeta no se versiona y puede trasladarse
a un repositorio o publicación independiente.

## Actualizar la demostración del repositorio

`config/invitation.json` es la fuente de verdad. `js/config.js` es un archivo generado y no debe
editarse manualmente.

```bash
npm run generate
npm test
```

## Personalización disponible

- `cover`: textos de portada y monograma del sello.
- `couple`, `event`, `texts` y `family`: contenido principal.
- `locations`, `itinerary` y `gallery`: lugares, agenda e imágenes.
- `sections`: visibilidad de cada bloque.
- `music`, `gifts` y `rsvp`: capacidades opcionales, seguras por defecto.
- Parámetros `?invitados=...&personas=...`: personalización limitada, escapada y acotada entre
  1 y 20 personas.

## Seguridad por defecto

- El contenido incluido es ficticio.
- RSVP funciona solo como demostración local y no realiza solicitudes.
- `rsvp.endpoint` y `rsvp.whatsappUrl` permanecen vacíos.
- `gifts.bankAccounts` permanece vacío.
- La CLI solo acepta recursos HTTPS o rutas locales sin traversal.
- Los datos generados quedan congelados en profundidad durante la ejecución.

## Validación

```bash
npm test
npm run test:visual
```

Las pruebas verifican configuración, sincronización reproducible, recursos, datos sensibles,
CSS, funcionamiento de la CLI, sobre rectangular, apertura, cuatro resoluciones, reducción de
movimiento, overflow, consola, red y RSVP de demostración.
