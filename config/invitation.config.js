/**
 * Configuración pública de ejemplo para una invitación KEG.
 * Este archivo se sirve al navegador: nunca incluya secretos ni datos privados.
 */
export const invitationConfig = {
  schemaVersion: 1,
  identity: {
    id: "keg-demo-luna-sol",
    internalName: "Pedido demostrativo Luna y Sol",
    siteTitle: "Luna & Sol | Invitación de boda",
    language: "es",
    couple: { partner1: "Luna", partner2: "Sol", initials: "L&S" },
    mainPhrase: "Nos elegimos para compartir el camino",
    welcome: "Con mucha alegría queremos celebrar contigo.",
    opening: "Abre el sobre para descubrir nuestra invitación",
    closing: "Gracias por ser parte de esta historia.",
    credits: "Una experiencia de KIMAH Digital Experiences",
    metadata: {
      description: "Invitación demostrativa y configurable de KIMAH Digital Experiences.",
      image: "assets/images/hero-couple.jpg"
    }
  },
  event: {
    startsAt: "2027-10-16T17:00:00-06:00",
    timeZone: "America/Tegucigalpa",
    locale: "es-HN",
    dateFormat: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    displayedTime: "5:00 p. m.",
    city: "Ciudad de ejemplo",
    countdown: { enabled: true, title: "Faltan", expiredText: "¡Hoy celebramos!", afterEvent: "message" }
  },
  opening: { enabled: true, guestQueryParameter: "invitados", seatsQueryParameter: "cupos", defaultGuest: "Invitado especial", defaultSeats: 1 },
  sections: {
    hero: { enabled: true, title: "Nuestra boda", cta: "Ver la invitación" },
    story: {
      enabled: true, title: "Con la bendición de nuestras familias",
      intro: "Tenemos el honor de invitarte a celebrar nuestra unión.",
      families: [
        { role: "Familia de Luna", names: ["Familia Aurora", "Familia Jardín"] },
        { role: "Familia de Sol", names: ["Familia Horizonte", "Familia Estrella"] }
      ],
      quote: "El amor convierte cada día compartido en un nuevo comienzo.", quoteSource: "Mensaje demostrativo"
    },
    locations: {
      enabled: true, title: "Ceremonia y recepción",
      items: [
        { id: "ceremony", enabled: true, title: "Ceremonia", venue: "Jardín de muestra", address: "Dirección demostrativa, sin ubicación real", time: "5:00 p. m.", helperText: "Te recomendamos llegar 20 minutos antes.", mapUrl: "" },
        { id: "reception", enabled: true, title: "Recepción", venue: "Salón de muestra", address: "Dirección demostrativa, sin ubicación real", time: "7:00 p. m.", helperText: "A continuación de la ceremonia.", mapUrl: "" }
      ]
    },
    gallery: { enabled: true, title: "Nuestros momentos" },
    itinerary: {
      enabled: true, title: "Itinerario", subtitle: "Una tarde para recordar",
      items: [
        { id: "arrival", time: "4:40 p. m.", title: "Llegada de invitados" },
        { id: "ceremony-moment", time: "5:00 p. m.", title: "Ceremonia" },
        { id: "photos", time: "6:15 p. m.", title: "Fotografías" },
        { id: "dinner", time: "7:00 p. m.", title: "Cena" },
        { id: "toast", time: "8:00 p. m.", title: "Brindis" },
        { id: "dance", time: "8:30 p. m.", title: "Baile" }
      ]
    },
    details: { enabled: true, title: "Detalles del evento", dressCode: "Formal de jardín", recommendations: ["Lleva calzado cómodo", "Considera una prenda ligera para la noche"], restrictions: "Evento para adultos", reservedColors: "Por favor reserva blanco y marfil para la pareja." },
    gifts: { enabled: true, title: "Regalos", intro: "Tu presencia es nuestro mejor regalo.", methods: [{ id: "presence", label: "Un abrazo y tus buenos deseos", url: "" }] },
    rsvp: { enabled: true, title: "Confirma tu asistencia", deadline: "2027-09-18", text: "Esta plantilla está en modo demostración; no se enviarán ni almacenarán datos.", fields: [{ id: "name", label: "Nombre", type: "text", required: true }, { id: "attendance", label: "¿Asistirás?", type: "select", required: true, options: ["Sí", "No"] }], submitLabel: "Probar confirmación", loadingText: "Procesando…", successText: "Demostración completada: no se enviaron ni almacenaron datos.", errorText: "No fue posible procesar la demostración." },
    contact: { enabled: false, title: "Contacto", displayName: "Contacto demostrativo", phone: "", message: "Hola, deseo consultar sobre la invitación.", url: "" }
  },
  resources: {
    hero: { src: "assets/images/hero-couple.jpg", alt: "Pareja en una fotografía de demostración" },
    gallery: [
      { id: "gallery-1", src: "assets/images/gallery-01.jpg", alt: "Recuerdo de la pareja, imagen demostrativa", caption: "Un momento especial" },
      { id: "gallery-2", src: "assets/images/gallery-02.jpg", alt: "Retrato de la pareja, imagen demostrativa", caption: "Juntos" },
      { id: "gallery-3", src: "assets/images/gallery-03.jpg", alt: "Celebración de la pareja, imagen demostrativa", caption: "Celebrar el camino" },
      { id: "gallery-4", src: "assets/images/gallery-04.jpg", alt: "Detalle de la pareja, imagen demostrativa", caption: "Nuestra historia" }
    ],
    music: { enabled: false, src: "assets/music/background.mp3", title: "Música de la invitación", initialVolume: 0.35, loop: true, controls: true, licenseVerified: false }
  },
  integrations: {
    rsvp: { mode: "demo", endpoint: "", method: "POST" },
    whatsapp: { enabled: false, phone: "", url: "" },
    analytics: { enabled: false }
  },
  theme: {
    colors: { primary: "#0f6b49", deep: "#041a11", paper: "#e7f2ec", paperSoft: "#d4eadf", text: "#061f14", gold: "#b89455" },
    fonts: { heading: "'Playfair Display', Georgia, serif", body: "'Montserrat', system-ui, sans-serif" },
    ornaments: { enabled: true }
  }
};
