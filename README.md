# KEG — plantilla configurable de invitaciones

KEG es la experiencia de invitaciones de boda de **KIMAH Digital Experiences**. Esta fase convierte la invitación estática original en una plantilla reutilizable sin framework ni proceso de compilación, conservando su narrativa vertical, portada, paleta, tipografías, fotografías, animaciones y controles.

> La configuración incluida es ficticia y funciona en modo demostración. No envía RSVP, no abre WhatsApp, no ejecuta pagos ni incorpora analítica.

## Arquitectura

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Contenido y datos | `config/invitation.config.js` | Identidad, fecha, textos, secciones, recursos e integraciones |
| Presentación | `styles.css` | Identidad visual responsive y movimiento reducido |
| Comportamiento | `src/app.js` | Render, portada, countdown, audio, foco y RSVP demo |
| Validación | `src/validate-config.js` | Contrato y errores accionables |
| Recursos | `assets/images/`, `assets/music/` | Imágenes y audio sustituibles |
| Pruebas | `tests/` | Contrato, privacidad, rutas, recursos y render declarativo |
| Auditoría | `docs/INITIAL_AUDIT.md` | Estado de partida, integraciones y riesgos |

`index.html` es un shell semántico mínimo. Las rutas son relativas, por lo que funcionan tanto localmente como bajo `/KEG-Invitation/` en GitHub Pages. No se cambió ninguna configuración de Pages.

## Ejecutar localmente

Requiere Node.js 18 o posterior solo para el servidor y pruebas; la aplicación no tiene dependencias de producción.

```bash
npm run serve
# abrir http://localhost:4173/KEG-Invitation/
npm test
```

No abra el archivo con `file://`: los módulos ES requieren un servidor HTTP.

## Preparar un nuevo pedido

1. Duplica y edita **solo** `config/invitation.config.js` para nombres, título, idioma, mensajes, fecha ISO con offset, zona horaria, ubicaciones, itinerario, dress code, regalos, RSVP y tema.
2. Sustituye las imágenes conservando las rutas configuradas o actualiza `resources.hero.src` y `resources.gallery[].src`.
3. Usa JPG/WebP optimizado, perfil sRGB, aproximadamente 720–1.600 px en el lado largo y menos de 400 KB cuando sea viable. Mantén una proporción coherente y completa siempre `alt`.
4. Sustituye `assets/music/background.mp3` únicamente con audio licenciado. Ajusta `music.src`, `initialVolume`, `loop`, `title`, `controls`, `licenseVerified` y luego `enabled`.
5. Activa o desactiva cada bloque con `sections.<nombre>.enabled`. Las ubicaciones también admiten `items[].enabled`. No dejes habilitada una galería vacía.
6. Ejecuta `npm test` y corrige todos los errores antes de solicitar revisión.

### Campos obligatorios

`identity.id`, `identity.siteTitle`, ambos nombres de `identity.couple` y `event.startsAt` son obligatorios. El `id` debe ser estable y no contener datos sensibles. `startsAt` debe ser ISO 8601 con offset, por ejemplo `2027-10-16T17:00:00-06:00`; el countdown usa únicamente este valor. `event.timeZone` controla la presentación de fecha.

Son opcionales las URL de mapa, contacto, métodos de regalo y música. Toda URL externa habilitada debe ser HTTPS. Cada elemento necesita un `id` único. Una integración habilitada requiere su configuración mínima.

### Secciones configurables

La configuración completa incluida sirve como ejemplo coherente: portada, hero/countdown, familias y fecha, ubicaciones, galería, itinerario, detalles, regalos, RSVP y contacto. Cambiar `enabled` a `false` evita renderizar el bloque, sin dejar huecos ni listeners apuntando a elementos ausentes.

### Ubicaciones y mapas

Ceremonia y recepción se configuran de forma independiente con título, sede, dirección visible, hora, ayuda, URL y visibilidad. La muestra no contiene dirección ni coordenadas reales. Una URL vacía presenta “Mapa no configurado” en lugar de un enlace roto.

### RSVP e integraciones futuras

`integrations.rsvp.mode` es `demo`: el formulario valida campos en el navegador, muestra carga y luego declara explícitamente que **no envió ni almacenó datos**. Nunca se realiza `fetch`. WhatsApp, analítica y contacto están deshabilitados.

Un transporte real futuro debe implementarse como adaptador separado, autenticar del lado servidor, devolver un acuse verificable y aplicar consentimiento, retención, rate limiting y protección antiabuso. No coloque tokens, credenciales o secretos en la configuración: todo archivo del repositorio y del sitio Pages es público. No habilite `production` mientras use valores demo.

### Accesibilidad y música

La portada se abre con clic, Enter o Espacio y mueve el foco al contenido. Los controles tienen foco visible, el RSVP anuncia su estado y las fotografías tienen texto alternativo. `prefers-reduced-motion: reduce` elimina transiciones y scroll suave. El audio está deshabilitado por defecto; cuando se habilita, solo intenta reproducirse por una acción explícita sobre su control, maneja bloqueos del navegador y ofrece reproducir/pausar con estado accesible.

## Validación y pruebas

```bash
npm test                 # suite completa
npm run validate:config  # esquema, URLs, ids y modo demo
npm run check:assets     # existencia de recursos configurados
npm run check:sensitive  # endpoints, secretos y datos heredados conocidos
```

Las pruebas comprueban configuración, fecha/countdown, sustitución declarativa, secciones habilitadas/deshabilitadas, apertura y teclado, foco, movimiento reducido, música, RSVP demo, rutas relativas, recursos y ausencia de integraciones activas. El smoke HTTP se ejecuta con `npm run serve` y una petición a `/KEG-Invitation/`.

## Recursos, licencias y limitaciones

Las tipografías Playfair Display y Montserrat se cargan desde Google Fonts; revise sus licencias SIL Open Font License y la política de privacidad aplicable antes de producción. El audio heredado carece de licencia verificable y permanece **deshabilitado**. Las cinco fotografías migradas tampoco incluyen evidencia de autorización en el repositorio: se conservan temporalmente para revisión humana y paridad visual, no deben presentarse como material genérico ni publicarse para otro pedido; sustitúyalas por recursos autorizados antes de aprobar.

No existe backend, CMS, generador visual, despliegue independiente por invitación ni preview aislada. Esas capacidades, pagos, WhatsApp real y arquitectura multi-invitación quedan fuera de Fase 1.

## Lista de comprobación de pedido

- [ ] Identificador, título, idioma, pareja, iniciales y metadatos actualizados.
- [ ] Fecha ISO, offset, zona horaria, hora visible y estado posterior verificados.
- [ ] Todos los textos y familias revisados; ningún dato del pedido anterior permanece.
- [ ] Ceremonia/recepción y URL HTTPS verificadas sin coordenadas privadas innecesarias.
- [ ] Fotografías autorizadas, optimizadas, ordenadas y con `alt` específico.
- [ ] Música autorizada, volumen y controles comprobados; o música deshabilitada.
- [ ] Secciones innecesarias deshabilitadas sin huecos.
- [ ] Regalos sin cuentas públicas; enlaces revisados.
- [ ] RSVP permanece demo hasta disponer de backend aprobado.
- [ ] WhatsApp permanece deshabilitado hasta revisión de privacidad.
- [ ] Pruebas, detección de secretos y smoke bajo `/KEG-Invitation/` pasan.
- [ ] Revisión responsive a 320, 390, 768 y 1440 px, teclado, foco y movimiento reducido.
- [ ] Licencias, privacidad y consentimiento aprobados.
