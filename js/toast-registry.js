/**
 * Central Toast Registry - SSoT for all system notifications.
 */
export const TOASTS = {
  save_success: {
    text: "Brief erfolgreich gespeichert ✓",
    type: "success",
    duration: 2500,
  },
  export_success: {
    text: "JSON-Export abgeschlossen",
    type: "info",
    duration: 2500,
  },
  import_success: {
    text: "Brief erfolgreich geladen",
    type: "success",
    duration: 3000,
  },
  import_error: {
    text: "❌ Import fehlgeschlagen: Ungültige Datei",
    type: "error",
    duration: 5000,
  },
  deadline_set: {
    text: "📅 Frist gesetzt: {date}",
    type: "info",
    duration: 3000,
  },
  iban_invalid: {
    text: "⚠️ Ungültige IBAN erkannt",
    type: "warning",
    duration: 4000,
  },
  night_mode_auto: {
    text: "🌙 Nachtmodus automatisch aktiviert (21:00)",
    type: "info",
    duration: 4000,
  },
  address_overflow: {
    text: "⚠️ Adresszeilen überschritten (max. 6)",
    type: "warning",
    duration: 5000,
  },
};
