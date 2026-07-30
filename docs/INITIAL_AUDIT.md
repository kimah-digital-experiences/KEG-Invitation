# Auditoría inicial de KEG — Fase 1

## Base y publicación

La base local inspeccionada fue `e2e349dfa2f5b4f5811b1828e682ef59521de625`. El entorno no contenía rama `main` ni remoto configurado; se añadió `origin`, pero el acceso de red devolvió HTTP 403, por lo que no fue posible confirmar o descargar un `main` más reciente. El árbol estaba limpio y no había trabajo local ajeno. La implementación se realizó en `feat/keg-configurable-template` sin tocar configuración de GitHub Pages ni publicar producción.

## Estructura y tecnología de partida

Era una SPA estática sin build, manifiesto de dependencias, pruebas ni CI: un `index.html` monolítico de 3.971 líneas contenía HTML, seis bloques CSS y cinco scripts; fuera de él solo había cinco JPEG, un MP3 y documentación. El punto de entrada era `index.html`. Usaba rutas locales relativas compatibles con el subdirectorio de Pages, además de Google Fonts y fondos Unsplash remotos.

## Recorrido narrativo

1. Portada modal con sobre y acción de apertura.
2. Hero con pareja, fotografía, música y countdown.
3. Familias, fecha y cita.
4. Ceremonia y recepción.
5. Galería.
6. Itinerario.
7. Protocolo, vestimenta, regalos y modal financiero.
8. RSVP por WhatsApp y formulario.
9. Cierre.

El scroll vertical nativo era la navegación. No había botones intermedios, router, lightbox, CMS ni backend propio.

## Datos e integraciones detectados

El HTML y JavaScript repetían nombres y apellidos de una pareja real, familiares, fecha y ciudad; incluían un teléfono/WhatsApp, enlace real de Maps, dos cuentas bancarias con titulares, endpoint activo de Google Apps Script y mensajes RSVP. El documento de migración también reproducía esos valores. Todo fue eliminado del código y documentación actual y sustituido por configuración ficticia. La configuración predeterminada no contiene teléfono, dirección real, coordenadas, datos bancarios, pagos, endpoint, token ni analítica.

El RSVP original hacía POST `no-cors` y comunicaba éxito sin poder verificar respuesta. Había tres implementaciones solapadas del audio. Ambos riesgos se reemplazaron por un modo demo sin red y un único controlador de audio opt-in. WhatsApp, contacto, música y analítica quedan deshabilitados.

## Recursos, rutas, licencias y rendimiento

Las fotos locales sumaban menos de 500 KB y ya usaban lazy loading en galería; el MP3 era el recurso más pesado. Se reorganizaron con nombres de rol bajo `assets/images` y `assets/music`; hero tiene dimensiones declaradas y galería usa lazy loading. Las rutas siguen siendo relativas, sin asumir `/`.

No había atribución o prueba de licencia para fotografías ni canción. Para evitar eliminación irreversible y conservar paridad, se retienen en la rama, claramente marcadas para reemplazo y con audio deshabilitado. Los fondos Unsplash redundantes se eliminaron de la presentación activa. Google Fonts sigue siendo una dependencia externa con fallback local y `display=swap` suministrado por su CSS.

## CSS, responsive y accesibilidad

La paleta verde/musgo, dorados, papeles, Playfair/Montserrat, tarjetas, hero, marco hexagonal, galería y transiciones definen la identidad. La hoja original acumulaba numerosos overrides, `!important` y breakpoints. Fase 1 conserva la cascada efectiva para reducir riesgo visual y añade variables configurables, prevención de overflow, objetivos táctiles, foco visible y una política integral de movimiento reducido.

La portada tenía semántica y teclado parcialmente duplicados, pero no gestionaba claramente retorno/movimiento de foco; el modal de regalos tenía gestión incompleta. La nueva apertura acepta clic/Enter/Espacio, evita aperturas repetidas y mueve foco al hero. El formulario tiene labels, fieldset y estado vivo. Sin JavaScript se muestra un fallback honesto; no se inventan detalles del evento que podrían desincronizarse de la configuración.

## Seguridad, privacidad y calidad

No se detectó almacenamiento local ni analítica. Los mayores riesgos eran PII pública, finanzas, endpoint activo, éxito RSVP no verificable, dependencias remotas y licencias desconocidas. La validación ahora detecta obligatorios, fechas, galerías vacías, IDs duplicados, URLs no HTTPS, integraciones incompletas, licencia de audio y uso accidental de demo como producción. Las pruebas rastrean patrones de secretos, endpoints y datos heredados conocidos.

## Decisiones conservadoras y deuda

- No se introdujo framework, bundler, backend ni dependencia npm.
- No se alteró Pages, Actions ni arquitectura de despliegue.
- No se reordenan dinámicamente secciones: el orden narrativo sigue fijado para proteger composición; `enabled` controla visibilidad.
- Las fotografías heredadas requieren sustitución/autorización antes de reutilización real.
- La hoja CSS heredada conserva deuda de cascada que conviene reducir solo con regresión visual automatizada.
- No hubo navegador automatizado disponible en el entorno; la paridad visual absoluta requiere revisión humana.
