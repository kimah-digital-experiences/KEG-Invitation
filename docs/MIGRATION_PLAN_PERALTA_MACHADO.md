# Plan de migración de BODA-PERALTA-MACHADO a Polaris

## 0. Alcance, método y nivel de certeza

Este documento es una auditoría **sin cambios funcionales**. Se inspeccionaron todos los archivos versionados, la estructura del DOM, las seis hojas de estilo embebidas, los cinco bloques JavaScript, las referencias de red y los recursos binarios. La rama auditada contiene una aplicación estática sin herramienta de compilación, manifiesto de dependencias ni pruebas.

El repositorio `k-invitations` no está disponible en este entorno de trabajo y el acceso remoto fue rechazado (HTTP 403). Por ello, las afirmaciones sobre Polaris se basan en el contrato indicado para la migración (`Scene Registry`, `createCollectionScene`, `event-config.js`, `resources-manifest`, countdown, gallery, hero, overlays, audio/autoplay, navigation y transition manager), no en una revisión de su implementación concreta. Las rutas, firmas y capacidades deben verificarse contra la versión de Polaris que reciba el PR de integración. El plan distingue explícitamente entre hallazgos comprobados y decisiones sujetas a ese *compatibility spike*.

## 1. Resumen ejecutivo

La invitación es una SPA estática monolítica: `index.html` concentra 3.971 líneas de marcado, CSS y JavaScript; las fotografías y la canción son los únicos recursos locales externos. No existe separación entre contenido, presentación y comportamiento. La experiencia narrativa real es:

1. portada bloqueante con sobre personalizado por URL;
2. apertura animada y arranque de música;
3. hero con nombres, foto y countdown;
4. bendición de los padres, fecha y cita bíblica;
5. ceremonia y recepción;
6. galería;
7. itinerario;
8. protocolo, regalos y modal bancario;
9. confirmación por WhatsApp y formulario;
10. cierre.

La migración es viable sin rediseño si se trata el aspecto actual como contrato visual. El mayor error sería trasladar el HTML monolítico literalmente a una única escena: conservaría deuda y anularía los beneficios de Polaris. Se recomienda una colección `peralta-machado` configurada por datos, con ocho escenas registradas y dos overlays globales, reutilizando servicios Polaris solamente después de pruebas de paridad.

Los riesgos principales son: (a) tres implementaciones simultáneas del control de audio; (b) fecha calculada en la zona horaria del dispositivo pese a mencionar Tegucigalpa; (c) RSVP `no-cors`, que comunica éxito sin comprobarlo; (d) 362 declaraciones `!important` y múltiples capas de parches responsive; (e) información bancaria y endpoint expuestos en cliente; y (f) imágenes remotas/decoraciones embebidas que hoy no tienen una política de carga inequívoca.

**Estimación base:** 14–21 jornadas de ingeniería, más 3–5 jornadas de QA visual/contenido, suponiendo que Polaris ya cubra los componentes declarados y que no cambie el backend RSVP. La auditoría de APIs Polaris puede desplazar la cifra.

## 2. Arquitectura actual

### 2.1 Estructura del proyecto

| Ruta | Responsabilidad actual | Observación |
|---|---|---|
| `index.html` | Documento, estilos, SVG, escenas, configuración y lógica | Monolito de 137 KB/3.971 líneas; seis `<style>` y cinco `<script>` |
| `CANCION.mp3` | Música de fondo | 7.348.393 bytes; MP3 local con `preload="auto"` |
| `assets/fotos/FOTO-1.jpg` | Galería | 27.303 bytes |
| `assets/fotos/FOTO-3.jpg` | Galería | 92.723 bytes |
| `assets/fotos/FOTO-4.jpg` | Galería | 87.151 bytes |
| `assets/fotos/FOTO-5.jpg` | Galería | 193.240 bytes |
| `assets/fotos/FOTO-14.jpg` | Retrato del hero | 75.129 bytes |
| `assets/fotos/.gitkeep` | Marcador de directorio | Obsoleto ahora que el directorio no está vacío |
| `README.md` | Nombre del proyecto | No documenta ejecución, despliegue ni arquitectura |

No hay `package.json`, bundler, módulos, componentes, tests, CI, servicio worker ni configuración de despliegue. La ejecución depende de servir los archivos estáticos (no de abrir necesariamente `file://`, debido a recursos de red y `fetch`).

### 2.2 Separación de responsabilidades y acoplamiento

- **Contenido:** textos, fecha, teléfonos, URL de mapa, cuentas bancarias y endpoint RSVP están escritos directamente en HTML o JavaScript.
- **Vista:** todo el DOM vive en `index.html`; 22 SVG inline mezclan iconografía y estructura.
- **Tema:** los tokens iniciales conviven con valores literales y tokens posteriores que redefinen nombres como `--radius` y `--shadow`.
- **Interacción:** selectores por ID/clase acoplan listeners a la forma exacta del DOM.
- **Estado:** clases globales en `body` (`gate-done`, `inv-open`, `modal-open`) gobiernan apertura y overlays; no existe ciclo de vida/desmontaje.
- **Integraciones:** Google Apps Script, WhatsApp, Maps, Google Fonts y Unsplash se invocan directamente desde navegador.

### 2.3 Reutilización, duplicación y deuda

**Reutilizable conceptualmente:** `.container`, `.section`, botones, divisores, tarjetas, bloques informativos, reveal, paleta, tipografía, modal, timeline y cuadrícula de galería. Deben portarse como estilos de colección o props de componentes, no copiarse globalmente.

**Duplicación/acumulación:**

- Seis bloques CSS etiquetados por versiones (`v10`, `v10_4`, `v10_6`, `v10_7_4`) se sobreescriben; hay 22 media queries y 362 `!important`.
- El audio registra controladores en el bloque principal, `v10-audio-fix` y `V10.2 Audio Toggle Robust`; un clic puede alcanzar más de un listener y alternar dos veces.
- El formulario recibe un prevent-default global y otro específico.
- `document.getElementById("bgMusic") || document.getElementById("bgMusic")` es redundante.
- El sobre tiene `tabindex="0"` duplicado y listeners inline más listeners para `pointerup`, `touchend`, `click` y teclado; `opened` reduce, pero no elimina, eventos redundantes.
- El fallback de extensiones busca variantes incompatibles con un manifiesto determinista y puede repetir intentos.
- Permanecen reglas para `.ph.*` con imágenes Unsplash aunque la galería activa usa `<img>` locales, y la lógica busca `.hex-photo` mientras el markup visible usa `.hexImg`; son indicios de código legado.
- El switch `modeToggle` se declara como emulación visual sin comportamiento; debe retirarse o definirse, no migrarse como función real.

## 3. Lectura técnica por capa

### 3.1 HTML y experiencia existente

| Bloque actual | Función | Estado/particularidades | Destino Polaris |
|---|---|---|---|
| `audio#bgMusic` | Música global | Fuente `CANCION.mp3`, preload auto | Servicio de audio de colección |
| `.gate#gate` | Portada/overlay | Diálogo modal, sobre SVG, nombres, invitado, cupos, aviso de volumen | `InvitationOpening` overlay/scene |
| `section#inicio.hero` | Hero | Play/pausa, nombres, countdown, foto hexagonal, CTA | `WeddingHero` |
| `#appContent` | Contenedor narrativo | Oculto/revelado por apertura | Shell/scene viewport Polaris |
| `section#fecha` | Familia y fecha | Padres de ambos, invitación, fecha/hora/ciudad, 1 Juan 4:19 | `BlessingAndDate` |
| `section#lugares` | Eventos | Dos tarjetas para ceremonia y recepción; misma sede/mapa | `WeddingVenues` |
| `section#galeria` | Fotos | Cuatro fotos locales, lazy loading | `WeddingGallery` |
| `section#itinerario` | Cronograma | Ocho hitos entre 17:00 y 23:00 | `WeddingItinerary` |
| `section#rsvp` | Protocolo/regalos | Dress code, política sin niños, lluvia, modal y cuentas | `GuestGuidance` + `GiftOptions` overlay |
| `section#confirmacion` | RSVP | Deadline, WhatsApp, Sí/No, nombre y Apps Script | `WeddingRsvp` |
| `footer` | Cierre | Frase/cierre visual | Parte de `WeddingClosing` o footer de RSVP |
| `.modeToggle` | Adorno | Sin listener/semántica de botón | No migrar hasta confirmar intención |

**Ausencias relevantes:** no hay navegación persistente, mapa embebido, vídeo, carrusel/lightbox ni sección de historia. El desplazamiento nativo es la navegación principal; el CTA usa `scrollIntoView`. No deben inventarse escenas o controles que cambien la narrativa.

### 3.2 CSS

**Identidad que se debe conservar:**

- Paleta verde profunda/musgo (`#041a11` a `#0f6b49`), papeles verde claro (`#e7f2ec`, `#d4eadf`, `#c8e3d7`), tinta `#061f14` y dorados (`#b89455`, `#d7be86`, `#9f7c3d`).
- `Playfair Display` para títulos y `Montserrat` para texto/UI, con fallbacks actuales.
- Tarjetas redondeadas, sombras suaves, textura/ornamento floral, sobre, sello y foto hexagonal.
- Alternancia de superficies `paper`/`paper-soft`, composición de dos columnas en escritorio y apilado móvil.
- Revelado/transiciones y animación del sobre (`letterOut`); flotación ornamental (`floaty`).

**Migrar a tokens Polaris:** colores semánticos, familias/pesos tipográficos, radios, sombras, gutters, ancho de contenido, curvas y duraciones. Crear un scope de colección (por ejemplo `[data-collection="peralta-machado"]`) para impedir fuga a otras experiencias. Normalizar tokens duplicados solo después de capturas de referencia.

**Mantener como CSS específico de colección:** geometría del sobre/sello, clip/máscara hexagonal, ornamentación floral, timeline, composición de padres y detalles de tarjetas. La fidelidad requiere conservar inicialmente las reglas efectivas calculadas, no la cascada histórica completa.

**Sustituir por sistema Polaris:** reset, contenedores, botones base, overlay/focus lock, spacing genérico, estados disabled/loading, helpers de accesibilidad y reveal/transitions si ofrecen paridad.

**Responsive:** los cortes observados son 980/960/900/720/640/560/520/420 px, con safe-area variables. Antes de consolidarlos, levantar capturas a 320, 375, 390, 430, 768, 1024 y 1440 px. Mantener `env(safe-area-inset-*)`; reducir breakpoints únicamente con evidencia visual. Añadir una variante explícita para `prefers-reduced-motion`, pues hoy el comportamiento se condiciona parcialmente a `no-preference` pero no forma una política integral.

### 3.3 JavaScript

| Capacidad | Implementación actual | Clasificación | Acción |
|---|---|---|---|
| Countdown | `setInterval` cada segundo; `new Date(2026,2,28,17)` local | Específica pero sustituible | Componente Polaris con ISO `2026-03-28T17:00:00-06:00`; limpiar intervalo al desmontar |
| Apertura | estado `opened`, clases y tres timeouts | Específica/valiosa | Adaptar a ciclo de transición; preservar timings 1.080/1.100/1.680 ms tras medir |
| Invitados | query `invitados`, split por `y`, `&`, coma o `;` | Reutilizable con corrección | Parser/guest context; definir contrato, encoding y cupos explícitos |
| Música | múltiples listeners y helpers | Obsoleta por duplicación | Reemplazar completamente por audio manager Polaris y un único control |
| Autoplay | `play()` después del gesto de apertura | Reutilizable | Delegar a política Polaris; fallback visible ante bloqueo |
| Fallback imágenes | prueba extensiones por error | Obsoleta | Manifiesto con rutas exactas y error asset controlado |
| Reveal | clases CSS/estado global | Sustituible | transition/reveal manager con reduced motion |
| RSVP | POST form-urlencoded `no-cors` a Apps Script | Específica/riesgosa | Adapter RSVP; no declarar éxito sin acuse verificable |
| WhatsApp | construye mensaje al clic | Reutilizable | Helper configurable con teléfono/texto en config |
| Selector Sí/No | botones + hidden input | Reutilizable | Campo del componente RSVP con accesibilidad de grupo |
| Modal regalos | clases, Escape, backdrop | Sustituible | Overlay Polaris con foco, retorno de foco y scroll lock |
| Copiar cuenta | Clipboard API + `execCommand` | Reutilizable parcialmente | Utility Polaris; mantener fallback solo si soporta navegadores objetivo |
| Prevent submit global | listener capture en cada formulario | Obsoleto | Eliminar; cada form debe poseer semántica propia |
| Toggle visual | sin comportamiento | Obsoleto/indeterminado | No incorporar hasta decisión de producto |

No hay carga modular, router, observers, gestión central de errores o cancelación de operaciones. Los listeners viven durante toda la página, aceptable hoy por ser un documento único, pero incompatible con escenas montables si Polaris recicla DOM.

## 4. Arquitectura Polaris propuesta

> Propuesta de integración a validar contra el árbol y contratos reales de `k-invitations`.

```text
collections/peralta-machado/
├── event-config.js             # todo el contenido y endpoints no secretos
├── resources-manifest.js       # IDs lógicos, rutas, tipos y estrategia de carga
├── scene-registry.js           # orden y factories
├── styles/
│   ├── tokens.css              # tema de la colección
│   └── collection.css          # geometría/ornamentos específicos
├── scenes/
│   ├── invitation-opening.js
│   ├── wedding-hero.js
│   ├── blessing-and-date.js
│   ├── wedding-venues.js
│   ├── wedding-gallery.js
│   ├── wedding-itinerary.js
│   ├── guest-guidance.js
│   └── wedding-rsvp-closing.js
└── components/                 # solo piezas que Polaris no suministre
    ├── envelope-opening.js
    ├── parents-blessing.js
    ├── wedding-timeline.js
    └── gift-options.js
```

La ruta exacta debe adaptarse a convenciones reales. La colección debería limitarse a declarar `id`, tema, recursos, config y escenas. Servicios transversales (audio, autoplay, transición, navegación, overlay, telemetría/errores y RSVP transport) deben ser inyectados por el motor, nunca instanciados como singletons locales.

### Contrato de escena recomendado

Cada factory debe recibir `{ config, resources, services }`, producir una escena compatible con `createCollectionScene`, declarar recursos críticos/diferidos y devolver cleanup de timers/listeners. No debe consultar IDs globales ni importar contenido de otra escena. El registry controla orden, transiciones y navegación; la config controla datos; el manifiesto resuelve assets.

## 5. Mapeo escena por escena

### Escena 1 — `InvitationOpening`

**Origen:** `.gate`. **Conserva:** nombres, destinatario, cantidad, sobre/sello SVG, texto de apertura, aviso y secuencia animada. **Props:** pareja, `guestContext`, monograma, textos, preferencias de audio. **Servicios:** overlay, transition manager, audio/autoplay. **Decisión:** si Polaris exige una escena de apertura, registrarla como primera escena; si dispone de opening overlay global, usarlo para no sumar un paso de navegación. El gesto debe desbloquear audio y entrada una sola vez.

### Escena 2 — `WeddingHero`

**Origen:** `#inicio`. **Conserva:** composición dividida, foto hexagonal, ornamentación, countdown, control musical y CTA. **Reutiliza:** hero, countdown, audio control, resource resolver. **Específico:** marco hexagonal y ornamento. La CTA avanza a la siguiente escena mediante navigation, sin selector DOM.

### Escena 3 — `BlessingAndDate`

**Origen:** `#fecha`. **Conserva:** bendición, cuatro padres con roles, invitación, tarjeta de fecha y cita bíblica. **Nuevo:** `ParentsBlessing`, salvo que Polaris permita bloques arbitrarios dentro de `createCollectionScene`. Mantener como una escena porque hoy constituye una unidad narrativa y visual.

### Escena 4 — `WeddingVenues`

**Origen:** `#lugares`. **Conserva:** tarjetas separadas de ceremonia y recepción, iconos, horario, sede y CTA a Maps. **Reutiliza:** collection scene/card/link externo; quizá componente location existente. Aunque comparten ubicación, conservar las dos tarjetas para no alterar el mensaje.

### Escena 5 — `WeddingGallery`

**Origen:** `#galeria`. **Conserva:** cuatro imágenes, orden, crops/aspect ratios y carga lazy. **Reutiliza:** gallery Polaris si soporta layout editorial; de lo contrario usar un adaptador de layout, no un carrusel nuevo. No añadir lightbox si no forma parte de la experiencia actual.

### Escena 6 — `WeddingItinerary`

**Origen:** `#itinerario`. **Conserva:** encabezado, línea vertical, ocho hitos, iconos, tiempos y textos. **Nuevo probable:** variante `WeddingTimeline` data-driven. Debe aceptar hora textual porque los intervalos no son homogéneos.

### Escena 7 — `GuestGuidance`

**Origen:** `#rsvp` (nombre engañoso). **Conserva:** vestimenta, restricciones/avisos, regalos y trigger del modal. **Overlay asociado:** `GiftOptions`, con cuentas y copy-to-clipboard. No fusionar inicialmente con RSVP: visualmente es protocolo y regalos, no confirmación.

### Escena 8 — `WeddingRsvpClosing`

**Origen:** `#confirmacion` + `footer`. **Conserva:** deadline, CTA WhatsApp, selección Sí/No, nombre, feedback y cierre. **Reutiliza:** RSVP/form + closing si Polaris los ofrece. Puede renderizar dos bloques dentro de una escena para preservar continuidad; dividir solo si pruebas de navegación demuestran paridad.

### Overlays y navegación

- `InvitationOpening`: overlay de entrada o primera escena modal.
- `GiftOptions`: overlay sobre `GuestGuidance`, con focus trap, Escape, backdrop, retorno de foco y scroll lock.
- Navegación: scroll/avance secuencial del motor; no crear menú visible. Preservar links externos para Maps/WhatsApp.
- Transiciones: las escenas entran con el reveal actual; el sobre conserva su animación diferenciada.

## 6. Mapeo componente por componente

| Pieza actual | Componente/servicio Polaris candidato | Estrategia |
|---|---|---|
| `.section` + `.container` | `createCollectionScene` | Reutilizar estructura y lifecycle; tema scoped |
| Hero dividido | `hero` | Configurar; extender con slot de foto hexagonal si existe |
| `.countBox` | `countdown` | Reutilizar con timezone explícita y estado posterior |
| `.galleryGrid` | `gallery` | Reutilizar si preserva masonry/editorial; variante si no |
| `.gate` | `overlays` + transition manager | Overlay especializado `EnvelopeOpening` |
| `#giftModal` | `overlays` | Reutilizar infraestructura; contenido específico |
| `#bgMusic`, botón y autoplay | `audio` + `autoplay` | Sustitución total de listeners locales |
| CTA/scroll | `navigation` | Navegar por ID de escena, no por ID DOM |
| `.reveal` | transition manager | Mapear opacidad/translate/duración y reduced motion |
| Formulario | RSVP | Reutilizar UI/estado si admite transport adapter |
| Apps Script | adapter RSVP | Encapsular request/resultado; exigir contrato verificable |
| tarjetas de sede | location/card existente o collection blocks | Componer sin duplicar estilos globales |
| timeline | componente nuevo/variante | Data-driven con icon slot y hora textual |
| padres | componente nuevo | Dos familias/roles accesibles y responsive |
| sobre SVG | componente nuevo específico | Conservar paths/gradients y animación |
| regalos/cuentas | componente nuevo específico | Datos desde config; modal e infraestructura reutilizados |

## 7. Inventario de recursos

### 7.1 Archivos locales para `resources-manifest`

| ID lógico sugerido | Archivo | Tipo/tamaño | Uso | Carga |
|---|---|---:|---|---|
| `music.main` | `CANCION.mp3` | audio/mpeg, 7.348.393 B | Música de fondo | metadata/tras gesto; evitar descargar todo antes de apertura si Polaris lo permite |
| `hero.portrait` | `assets/fotos/FOTO-14.jpg` | image/jpeg, 75.129 B | Hero hexagonal | crítica, preload |
| `gallery.photo01` | `assets/fotos/FOTO-1.jpg` | image/jpeg, 27.303 B | Galería, posición 1 | diferida |
| `gallery.photo03` | `assets/fotos/FOTO-3.jpg` | image/jpeg, 92.723 B | Galería, posición 2 | diferida |
| `gallery.photo04` | `assets/fotos/FOTO-4.jpg` | image/jpeg, 87.151 B | Galería, posición 3 | diferida |
| `gallery.photo05` | `assets/fotos/FOTO-5.jpg` | image/jpeg, 193.240 B | Galería, posición 4 | diferida |

Registrar dimensiones intrínsecas, alt, peso y estrategia en el formato soportado. Confirmar orientación/crop visual antes de generar variantes. `.gitkeep` no es recurso.

### 7.2 Recursos inline o remotos

- **22 SVG inline:** sobre, sello, ornamentos, iconos de eventos/timeline/RSVP/regalos y WhatsApp. Mantener SVG inline cuando se anime o herede color; mover los iconos genéricos al sistema Polaris solo si son visualmente idénticos. IDs de gradiente/filtro deben quedar namespaced para evitar colisiones entre escenas.
- **Cuatro data-URI SVG florales** utilizados como backgrounds de esquinas: extraer a un recurso lógico único con transformaciones CSS o registrarlos como recursos generados; evitar cuatro copias percent-encoded.
- **Google Fonts:** Playfair Display 400/600/700 y Montserrat 300/400/500/600. Declararlas como recursos/tokens del tema según política Polaris; valorar self-hosting por privacidad/rendimiento/licencias.
- **Unsplash:** existen referencias a cinco fotos/URLs en reglas de fondo, incluida una URL hero. Algunas parecen legado de placeholders. Antes de migrar, ejecutar cobertura CSS y registrar solo las realmente renderizadas; si una es visible, fijar un asset aprobado local para impedir cambios/remoción remota.
- **No hay vídeo, archivos SVG independientes, fuentes locales ni icon fonts.**
- El texto `musica.mp3` aparece como referencia residual, pero el `<source>` activo es `CANCION.mp3`; no debe entrar al manifiesto sin una referencia efectiva.

## 8. Inventario de configuración para `event-config.js`

Toda la siguiente información debe salir de HTML/JS. El esquema es ilustrativo y debe adaptarse al contrato real de Polaris:

```js
export default {
  id: 'peralta-machado',
  locale: 'es-HN',
  couple: {
    partner1: { displayName: 'Daniel', fullName: 'Daniel Peralta' },
    partner2: { displayName: 'Ana Josse', fullName: 'Ana Josse Machado' },
    monogram: 'D&A'
  },
  event: {
    startsAt: '2026-03-28T17:00:00-06:00',
    timezone: 'America/Tegucigalpa',
    city: 'Tegucigalpa',
    display: { weekday: 'SÁBADO', day: '28', month: 'MARZO', year: '2026', time: '5:00 PM' }
  },
  parents: [
    { side: 'groom', role: 'PADRE DEL NOVIO', name: 'Víctor Peralta' },
    { side: 'groom', role: 'MADRE DEL NOVIO', name: 'Mercedes Castro' },
    { side: 'bride', role: 'PADRE DE LA NOVIA', name: 'Marco Machado' },
    { side: 'bride', role: 'MADRE DE LA NOVIA', name: 'Ana Cecilia Gómez' }
  ],
  quote: { text: 'Nosotros amamos porque él nos amó primero.', attribution: '1 Juan 4:19' },
  venues: [
    { kind: 'ceremony', title: 'Ceremonia civil y religiosa', name: 'El Mirador HN', mapUrl: 'https://maps.app.goo.gl/ruHVNbzbjQC7MS3q7' },
    { kind: 'reception', title: 'Recepción', name: 'El Mirador HN', mapUrl: 'https://maps.app.goo.gl/ruHVNbzbjQC7MS3q7' }
  ],
  gallery: ['gallery.photo01', 'gallery.photo03', 'gallery.photo04', 'gallery.photo05'],
  itinerary: [/* ocho objetos { timeLabel, description, icon } */],
  guestGuidance: { dressCode: '...', adultsOnly: '...', weatherNotice: '...' },
  gifts: { intro: '...', accounts: [/* banco, tipo, moneda, titular, número */] },
  rsvp: {
    deadline: '...',
    endpoint: 'https://script.google.com/macros/s/.../exec',
    whatsapp: { countryCode: '504', number: '31790033', templates: {/* yes/no */} },
    attendanceOptions: [
      { value: 'Sí', label: 'Sí, asistiré' },
      { value: 'No', label: 'Con gratitud, no podré asistir' }
    ]
  },
  invitation: { guestQueryParam: 'invitados', defaultLabel: 'INVITADO ESPECIAL' },
  music: { resource: 'music.main', autoplayAfterOpening: true },
  copy: { openingHint: '...', audioNotice: '...', countdownTitle: 'Nos casamos en:', closing: '...' }
};
```

Además de los valores visibles en el ejemplo, inventariar literalmente antes de implementar: texto de invitación, todos los metadatos de sede y horarios, ocho entradas del itinerario, dress code completo, política infantil, aviso de clima, instrucciones de regalos, titular/banco/moneda/número de cada cuenta, fecha límite RSVP, placeholders, estados enviando/éxito/error, mensaje WhatsApp para Sí y No, textos del botón musical, alt/ARIA y texto del footer.

**Privacidad/seguridad:** `event-config.js` sigue siendo público. No debe contener secretos. El endpoint, teléfono y cuentas ya son públicos en el cliente, pero producto/legal debe aprobar su exposición. Un token o credencial futura debe residir del lado servidor. En logs y telemetría, tratar invitado, asistencia y user-agent como datos personales.

## 9. Componentes Polaris reutilizables (pendientes de validación)

1. **`createCollectionScene`:** base de las ocho escenas, con slots o composición para evitar wrappers ad hoc.
2. **Countdown:** usar si soporta fecha ISO, timezone IANA, cleanup y estado `completed`.
3. **Gallery:** usar si acepta manifiesto, lazy load, alt y layout actual sin forzar carrusel.
4. **Hero:** usar si admite composición a dos columnas, control de audio y media con máscara.
5. **Overlays:** usar para apertura y regalos si ofrece focus trap, Escape, retorno de foco, `aria-modal` y bloqueo de scroll.
6. **Audio/autoplay:** única autoridad de reproducción/estado; arranque dentro del gesto de apertura y recuperación ante bloqueo.
7. **Navigation:** avance secuencial/CTA sin menú nuevo; deep-link solo si no altera apertura.
8. **Transition manager:** reveal y secuencia de apertura con cancelación/cleanup y reduced motion.
9. **RSVP (si existe):** reutilizar validación/estados/UI; conectar adapter Apps Script o backend recomendado.

### Checklist del compatibility spike

- Localizar versiones y firmas reales de los componentes anteriores.
- Revisar colecciones Wedding, Baby Shower, Santorini/Tropical Birthday y Christmas Dinner para seguir convenciones, no copiarlas a ciegas.
- Confirmar lifecycle, registro/desregistro y navegación scroll vs snap.
- Confirmar formato real de `event-config.js` y `resources-manifest`.
- Confirmar estrategia CSS (modules, layers, shadow DOM o scope) y política de assets/fonts.
- Confirmar soporte de SSR/static deploy, query params y base paths.
- Confirmar pruebas existentes (unitarias, contract, visuales, e2e, accesibilidad y presupuesto de recursos).

## 10. Componentes nuevos necesarios

| Componente | Necesidad | Alcance mínimo |
|---|---|---|
| `EnvelopeOpening` | Identidad central sin equivalente confirmado | SVG actual, datos de invitado, animación, gesto único, reduced motion, callbacks open/audio |
| `ParentsBlessing` | Layout semántico de dos familias | roles/nombres desde datos, responsive y lectura accesible |
| `WeddingTimeline` | Ocho hitos e iconografía específica | array configurable, time label libre, icon slot, línea y apilado móvil |
| `GiftOptions` | Regalos bancarios en overlay | lista configurable, clipboard, feedback live; usa overlay Polaris |
| `HexPortrait` o variante de media | Foto y ornamentos propios | máscara/crop actuales, alt y dimensiones estables |
| `AppsScriptRsvpAdapter` | Integración heredada | serialización, timeout/cancelación, estados reales; temporal si backend cambia |
| `GuestContextAdapter` | Personalización por URL | parseo validado, límites, cupos explícitos y API consumible por opening/RSVP |

Antes de crear cada pieza, comprobar que Polaris no la cubra. Los nuevos componentes visuales específicos deben vivir dentro de la colección; adapters genéricos y accesibles podrían promoverse al motor en un PR separado.

## 11. Riesgos y mitigaciones

| Prioridad | Riesgo | Impacto | Mitigación/criterio de salida |
|---|---|---|---|
| **Alta** | No se auditó el código real de Polaris en este entorno | Estimación/API podrían variar | Compatibility spike bloqueante; actualizar ADR/matriz con rutas y firmas reales |
| **Alta** | Audio tiene tres toggles y políticas móviles sensibles | Doble toggle, silencio o autoplay bloqueado | Un solo audio manager; e2e iOS Safari/Android Chrome/desktop; estado ARIA sincronizado |
| **Alta** | RSVP `no-cors` siempre muestra éxito tras `fetch` opaco | Falsas confirmaciones y pérdida de datos | Endpoint CORS/acuse, proxy o reconciliación; pruebas de éxito/error/offline; no afirmar éxito sin confirmación |
| **Alta** | Fecha usa zona local del invitado | Countdown incorrecto fuera de Honduras | ISO con `-06:00` + `America/Tegucigalpa`; pruebas con TZ distintas |
| **Alta** | Cascada CSS con 362 `!important` y overrides versionados | Regresiones visuales por orden/especificidad | Baselines visuales antes de extraer; CSS scoped; migración escena a escena |
| **Alta** | Datos personales/bancarios y endpoint son públicos | Privacidad, abuso/spam | Revisión producto/legal, rate limiting/backend, minimización y no registrar PII |
| **Media** | Overlay actual carece de focus trap/retorno de foco | Accesibilidad/teclado | Overlay Polaris validado con axe y teclado |
| **Media** | Eventos redundantes pointer/touch/click/inline | Apertura múltiple o conflictos con motor | Evento primario único y callback idempotente; eliminar inline en migración |
| **Media** | Query `invitados` infiere cupos desde nombres | Cupos erróneos (nombres compuestos/grupos) | Parámetros separados/ID firmado o `guestCount` explícito; compatibilidad temporal documentada |
| **Media** | Dependencia de Fonts, Unsplash, Maps, WhatsApp y Apps Script | Offline/CSP/latencia/disponibilidad | Inventario allowlist, fallbacks, self-host de assets aprobados, pruebas CSP |
| **Media** | SVG IDs inline pueden colisionar al montar escenas | Gradientes/filtros incorrectos | Namespace por componente/instancia |
| **Media** | Recursos sin dimensiones/variantes modernas | CLS y rendimiento móvil | width/height, decode/lazy, WebP/AVIF solo con comparación visual y fallback |
| **Media** | Lifecycle actual no limpia intervalos/listeners/timeouts | Fugas al navegar/remontar escenas | cleanup obligatorio y prueba repetida mount/unmount |
| **Baja** | `.gitkeep`, `.ph.*`, `.hex-photo`, `musica.mp3`, mode toggle residuales | Ruido/confusión | No migrar sin evidencia; limpiar solo en PR posterior aprobado |
| **Baja** | HTML presenta pequeños defectos semánticos | Lectores/validación | Validación HTML, headings, botones/enlaces y ARIA en QA sin alterar estética |

## 12. Estrategia de migración

### Principios de ejecución

1. **Golden master primero:** capturas, vídeo de apertura, audio/estado, textos y flujos constituyen el contrato.
2. **Datos antes que vistas:** config y manifest permiten probar contenido sin reescribir diseño.
3. **Vertical slices por escena:** implementar, comparar y estabilizar una unidad narrativa cada vez.
4. **Infraestructura compartida sobre parches:** servicios Polaris para lifecycle, audio, overlay y navegación; CSS específico solo para identidad.
5. **Feature flag/route paralela:** la versión actual permanece disponible hasta aprobar paridad; no hacer reemplazo irreversible.
6. **Sin rediseño oportunista:** mejoras de seguridad/accesibilidad funcionalmente necesarias se aíslan y documentan; cambios estéticos quedan fuera.

### Fases y criterios

**Fase A — Baseline y contrato (2–3 días).** Congelar commit fuente, ejecutar experience matrix, capturar vistas/animaciones y transcribir contenido. Salida: baselines aprobados y lista de navegadores.

**Fase B — Compatibility spike Polaris (1–2 días).** Auditar engine y colecciones existentes, confirmar contratos/rutas, registrar desviaciones de este plan. Salida: matriz con “reutiliza/extiende/nuevo” respaldada por código.

**Fase C — Esqueleto de colección y datos (2–3 días).** Registrar colección bajo flag, crear config/manifest tipados/validados y smoke test sin cambiar ruta productiva. Salida: recursos resolubles y config completa.

**Fase D — Núcleo audiovisual (2–4 días).** Opening + hero, audio único, autoplay, countdown y transición. Salida: paridad de primer gesto y hero en matriz de dispositivos.

**Fase E — Narrativa central (3–4 días).** Blessing/date, venues, gallery e itinerary. Salida: orden, responsive y recursos equivalentes.

**Fase F — Guest flow (3–4 días).** Guidance, gift overlay, WhatsApp y RSVP adapter. Salida: foco/teclado, copy, confirmación real y protección de PII acordadas.

**Fase G — Hardening/cutover (3–5 días).** Visual regression, e2e, accesibilidad, rendimiento, reduced motion, navegadores y rollback. Salida: aprobación de diseño/contenido/QA y route switch reversible.

## 13. Roadmap por Pull Requests

Todos los PR deben ser pequeños, desplegables o detrás de flag y sin mezclar limpieza general.

### PR 1 — Auditoría y baselines

- Este documento y, en el repositorio Polaris, evidencia automatizada de baseline si su política lo permite.
- Sin código funcional.
- Aprobadores: owner de Polaris, diseño/contenido y privacidad para datos sensibles.

### PR 2 — Registro mínimo de colección, config y manifest

- Entrada `peralta-machado` deshabilitada/no productiva.
- `event-config.js`, esquema/validación y `resources-manifest`.
- Tests de config, IDs, existencia de recursos y duplicados.
- No renderizar todavía la ruta pública.

### PR 3 — Opening, guest context y audio

- `InvitationOpening`/`EnvelopeOpening`.
- Adapter de query param compatible y política futura de cupos.
- Audio/autoplay Polaris; elimina duplicación solo dentro de la nueva colección.
- E2E de gesto, teclado, bloqueo autoplay y reduced motion.

### PR 4 — Hero y countdown

- Hero, retrato hexagonal, CTA y countdown timezone-safe.
- Visual snapshots responsive y tests de fecha antes/después del evento.

### PR 5 — Blessing/date y venues

- Dos escenas registradas, datos completos y links Maps.
- Tests de orden, contenido, enlaces y responsive.

### PR 6 — Gallery e itinerary

- Manifiesto/lazy loading de fotos y layout equivalente.
- Timeline data-driven con ocho hitos e iconos namespaced.
- Visual/performance checks.

### PR 7 — Guest guidance y regalos

- Dress code/avisos y overlay accesible de regalos.
- Clipboard y feedback; revisión de exposición bancaria.
- Tests de foco, Escape, backdrop y fallback.

### PR 8 — RSVP, WhatsApp y closing

- UI y adapter, validación, estados, cancelación/timeout y mensajes configurables.
- No aceptar `opaque` como éxito salvo decisión explícita y documentada.
- Tests contract/e2e con backend de prueba; no enviar registros reales desde CI.

### PR 9 — Paridad, activación y rollback

- Suite visual completa, performance/accessibility budgets y dispositivo real.
- Activar por feature flag/canary; observar errores/RSVP; documentar rollback.
- Retirar la ruta anterior únicamente en un PR posterior tras ventana estable.

## 14. Estimación técnica

| Trabajo | Ingeniería | QA/diseño/contenido | Confianza |
|---|---:|---:|---|
| Baseline + auditoría Polaris | 3–5 d | 1 d | Media (repositorio Polaris no inspeccionado) |
| Config, manifest y registro | 2–3 d | 0,5 d | Media-alta |
| Opening, audio, guest context | 3–4 d | 1 d | Media |
| Hero/countdown | 1,5–2,5 d | 0,5 d | Media-alta |
| Blessing, venues, gallery, timeline | 3–4 d | 1 d | Media-alta |
| Guidance, gifts, RSVP/WhatsApp | 3–4 d | 1 d | Media-baja por backend |
| Hardening y cutover | 2–3 d | 1–2 d | Media |
| **Total** | **14–21 d** | **3–5 d** | **±30%** |

Una persona puede completar el camino crítico en 4–6 semanas calendario contando revisiones. Dos personas pueden paralelizar escenas y pruebas después de fijar contratos, pero no reducen a la mitad opening/audio ni cutover. Añadir 2–5 días si gallery/RSVP/overlay de Polaris no admiten extensión, si se exige nuevo backend, o si faltan dispositivos de prueba.

## 15. Plan de validación y definición de terminado

### Matriz mínima

- Viewports: 320×568, 375×667, 390×844, 430×932, 768×1024, 1024×768 y 1440×900.
- Navegadores: iOS Safari, Android Chrome, Safari/Chrome/Firefox/Edge desktop en versiones soportadas por Polaris.
- Modos: reduced motion, teclado, touch, red lenta/offline parcial, autoplay permitido/bloqueado y timezone distinto de Honduras.
- Invitados: sin parámetro, uno, dos con “y”, caracteres acentuados, cadena larga/malformada y cupo explícito futuro.
- RSVP: Sí/No, nombre vacío, éxito confirmado, error HTTP, timeout, offline y doble submit.

### Checks automatizados recomendados

- Unit: parser de invitado, timezone/countdown, serializers, mensajes y cleanup.
- Contract: schema de config/manifest y adapter RSVP con servidor simulado.
- E2E: apertura → audio → navegación → modal → RSVP, sin depender de servicios reales.
- Visual: snapshot por escena/viewport más captura de estados opening/modal/loading/error.
- Accessibility: axe, teclado, orden de foco, nombres accesibles, contraste y reduced motion.
- Performance: peso crítico, LCP/CLS, carga diferida de galería y ausencia de descarga duplicada de audio/imágenes.

**Terminado** significa paridad visual aprobada; mismos contenidos/orden/enlaces/audio; RSVP verificable; cero error de consola; overlays accesibles; lifecycle sin acumulación; budgets Polaris cumplidos; config/manifiesto como únicas fuentes de contenido/recursos; observabilidad y rollback documentados.

## 16. Recomendaciones finales

1. No iniciar escenas hasta poder inspeccionar Polaris y cerrar el compatibility spike.
2. Preservar el original como referencia inmutable y migrar detrás de una ruta/flag paralela.
3. Definir `America/Tegucigalpa` como autoridad temporal y una política post-evento.
4. Resolver el contrato RSVP antes del cutover: un response opaco no prueba persistencia.
5. Modelar invitado y cupos por separado; mantener `?invitados=` solo como compatibilidad de entrada.
6. Hacer del audio manager Polaris la única autoridad y probar en dispositivos reales.
7. Consolidar CSS por estilos computados y evidencia visual, no mediante eliminación masiva de `!important`.
8. Mantener ornamentos, sobre, paleta, tipografías, crops y secuencia; son identidad, no deuda.
9. No migrar reglas/assets residuales sin demostrar que aparecen en producción.
10. Revisar privacidad de RSVP, user-agent, teléfono y cuentas; no incorporar secretos a la config pública.
11. Añadir dimensiones/alt a recursos y namespacing a SVG sin modificar su apariencia.
12. Posponer optimización de formatos y cualquier cambio visual hasta después de alcanzar paridad y medir.

## 17. Decisiones abiertas antes de implementar

1. ¿Cuál es el commit/versión objetivo de Polaris y dónde viven realmente registry, config y manifests?
2. ¿La apertura es una Scene registrada o un overlay de colección?
3. ¿Polaris navega por scroll continuo, snap o montaje/desmontaje? ¿Cómo preserva música global?
4. ¿Cuál es la lista oficial de navegadores y el presupuesto de performance?
5. ¿Cuál es la fecha límite RSVP literal y qué textos completos han sido aprobados?
6. ¿La cantidad debe inferirse de nombres o existe una fuente de invitados/cupos?
7. ¿Apps Script puede devolver CORS/JSON verificable o se requiere proxy/backend nuevo?
8. ¿Las cuentas bancarias deben seguir públicas y copiables?
9. ¿Las referencias Unsplash se renderizan en producción o son únicamente CSS legado?
10. ¿El switch visual representa un modo futuro o debe excluirse de la colección?

Estas decisiones no impiden documentar la migración, pero sí bloquean una implementación profesional sin suposiciones funcionales o visuales.
