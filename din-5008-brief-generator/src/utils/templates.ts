import { 
  Trash2, 
  Briefcase,
  HelpCircle 
} from 'lucide';

/* ------------------------------------------------------------------
 * [Pre-configured beautiful German DIN Templates]
 * ------------------------------------------------------------------ */
export const TEMPLATES = {
  kuendigung: {
    label: "Kündigung Mietvertrag",
    icon: Trash2,
    data: {
      senderCompany: "",
      senderName: "Max Mustermann",
      senderStreet: "Musterstraße 42",
      senderZipCity: "12345 Musterstadt",
      senderPhone: "+49 170 1234567",
      senderEmail: "max.mustermann@mail.de",
      returnAddressSmall: "Max Mustermann · Musterstraße 42 · 12345 Musterstadt",
      specialNotes: "EINSCHREIBEN EIGENHÄNDIG",
      recipientCompany: "Muster-Wohnungsbau GmbH",
      recipientName: "Frau Sabine Keller",
      recipientStreet: "Immobiliengasse 7",
      recipientZip: "54321",
      recipientCity: "München",
      subject: "Kündigung des Mietvertrags für die Wohnung Nr. 12 (3. OG)",
      body: "hiermit kündige ich den bestehenden Mietvertrag für die oben genannte Wohnung unter Einhaltung der gesetzlichen Frist von drei Monaten zum nächstmöglichen Zeitpunkt (voraussichtlich zum Ende des kommenden Quartals).\n\nBitte senden Sie mir eine schriftliche Bestätigung dieser Kündigung unter Angabe des verbindlichen Beendigungszeitpunkts zu.\n\nIch bedanke mich ganz herzlich für das stets angenehme und unkomplizierte Mietverhältnis.\n\nBezüglich der Übergabetermine werde ich mich in Kürze telefonisch mit Ihnen in Verbindung setzen.",
      closing: "Mit freundlichen Grüßen",
      signatureName: "Max Mustermann",
      attachments: "1 Anlage: Kopie Übergabeprotokoll"
    }
  },
  bewerbung: {
    label: "Bewerbungsschreiben",
    icon: Briefcase,
    data: {
      senderCompany: "",
      senderName: "Carla Codiererin",
      senderStreet: "Tech-Allee 101",
      senderZipCity: "80331 München",
      senderPhone: "+49 89 555-9002",
      senderEmail: "carla.develops@web.de",
      returnAddressSmall: "Carla Codiererin · Tech-Allee 101 · 80331 München",
      specialNotes: "BEWERBUNG",
      recipientCompany: "Digital Solutions AG",
      recipientName: "Herr Thomas Recruiting-Manager",
      recipientStreet: "Startup-Ring 5",
      recipientZip: "10115",
      recipientCity: "Berlin",
      subject: "Bewerbung als Senior Frontend Engineer — Referenz ID #9822",
      body: "mit großem Interesse habe ich Ihre Stellenausschreibung auf Ihrer Karriere-Webseite gelesen. Da meine Qualifikationen in modernem CSS, HTML und TypeScript exakt zu Ihren Anforderungen passen, möchte ich mich Ihnen gerne vorstellen.\n\nIn meiner bisherigen Laufbahn habe ich mich intensiv auf barrierefreie, performante Web-Anwendungen spezialisiert. Das Einhalten semantischer Standards und die Optimierung mit modernen CSS-Methoden (wie Layers, OKLCH und CSS Grid) ist mein Steckenpferd.\n\nIch freue mich auf die Gelegenheit, Sie in einem persönlichen Gespräch von meinen Stärken zu überzeugen.",
      closing: "Mit freundlichen Grüßen",
      signatureName: "Carla Codiererin",
      attachments: "3 Anlagen: Lebenslauf, Zeugnisse, Zertifikate"
    }
  },
  anfrage: {
    label: "Einfache Anfrage",
    icon: HelpCircle,
    data: {
      senderCompany: "Musterfirma & Söhne",
      senderName: "Sabine Müller",
      senderStreet: "Gewerbepark Nord 4",
      senderZipCity: "50667 Köln",
      senderPhone: "+49 221 999120",
      senderEmail: "mueller@musterfirma.de",
      returnAddressSmall: "Musterfirma & Söhne · Gewerbepark Nord 4 · 50667 Köln",
      specialNotes: "",
      recipientCompany: "Werkzeugbaubedarf GmbH",
      recipientName: "Herr Michael Schmitt",
      recipientStreet: "Industriestraße 88",
      recipientZip: "20095",
      recipientCity: "Hamburg",
      subject: "Anfrage bezüglich Verfügbarkeit und Konditionen",
      body: "ich hoffe, es geht Ihnen gut.\n\nFür unser anstehendes Infrastrukturprojekt benötigen wir größere Stückzahlen Ihrer Präzisions-Stahlwinkel. Bitte teilen Sie uns mit, ob die Artikel innerhalb der nächsten 4 Wochen lieferbar sind und welche Mengenrabatte Sie uns anbieten können.\n\nGerne nehmen wir auch ein kurzes, unverbindliches Angebot von Ihnen entgegen.",
      closing: "Beste Grüße",
      signatureName: "Sabine Müller",
      attachments: "1 Anlage: Einkaufsliste"
    }
  }
};
