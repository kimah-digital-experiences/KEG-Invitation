/** Configuración central de la invitación. Usa únicamente datos que puedas publicar. */
window.INVITATION_CONFIG = Object.freeze({
  site: { basePath: "/KEG-Invitation/", language: "es", title: "Elena & Mateo | Invitación" },
  couple: { person1: "Elena Rivera", person2: "Mateo Flores", short1: "Elena", short2: "Mateo" },
  guest: { defaultLabel: "INVITADO ESPECIAL", defaultPartySize: 2, allowUrlPersonalization: true },
  event: {
    dateTime: "2027-05-22T17:00:00-06:00", dateLabel: { day: "22", month: "Mayo", year: "2027", time: "5:00 PM" },
    city: "Ciudad Ejemplo", country: "País de Demostración", confirmationDeadline: "30 de abril de 2027"
  },
  texts: {
    invitation: "Tenemos el gusto de invitarte a celebrar nuestra boda.",
    quote: "El amor convierte cada camino compartido en hogar.",
    galleryTitle: "Nuestra historia", itineraryTitle: "Itinerario",
    gifts: "Nuestro mejor regalo es tu presencia.", rsvp: "Esta plantilla está en modo demostración: tu respuesta no será enviada."
  },
  family: { person1: ["Laura Rivera", "Carlos Rivera"], person2: ["Sofía Flores", "Andrés Flores"] },
  locations: [
    { title: "Ceremonia", time: "5:00 PM", name: "Jardín Los Robles", address: "Avenida Ficticia 123", mapUrl: "" },
    { title: "Recepción", time: "7:00 PM", name: "Salón Horizonte", address: "Calle Demostración 456", mapUrl: "" }
  ],
  itinerary: [
    { time: "5:00 PM", title: "Ceremonia" }, { time: "6:30 PM", title: "Fotografías" },
    { time: "7:00 PM", title: "Recepción" }, { time: "8:00 PM", title: "Cena" }, { time: "9:00 PM", title: "Baile" }
  ],
  gallery: ["assets/demo/gallery-1.svg", "assets/demo/gallery-2.svg", "assets/demo/gallery-3.svg", "assets/demo/gallery-4.svg"],
  music: { enabled: false, src: "", autoplayAfterOpen: false },
  gifts: { enabled: true, message: "Tu compañía es suficiente.", bankAccounts: [] },
  rsvp: { enabled: true, demoMode: true, endpoint: "", whatsappUrl: "", successMessage: "Respuesta simulada. No se enviaron datos." },
  sections: { date: true, locations: true, gallery: true, itinerary: true, dressCode: true, gifts: true, rsvp: true }
});
