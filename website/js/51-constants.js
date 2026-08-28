// @ts-check
// @adr [[ADR-JS]] 
// @guide [[glossary]] 

/* js/constants.js */

export const Constants = {
  // Database Schema Version
  SCHEMA_VERSION: 10,

  // LocalStorage Keys
  // ACHTUNG: Nur LocalStorage nutzen, da OPFS, IndexedDB und File System Access API
  // unter file:// (lokaler Aufruf per Doppelklick) mangels HTTPS/Sicherheitskontext blockiert werden!
  STORAGE: {
    DRAFT_CURRENT: 'din_draft_current',
    PROFILE: 'din_profile',
    SETTINGS: 'din_settings',
    CUSTOM_FONT: 'din_custom_font',
    GEOAPIFY_KEY: 'din_geoapify_key'
  },

  // System Limits
  LIMITS: {
    HISTORY_MAX_ITEMS: 50,    // Undo/Redo Cap
    API_DEBOUNCE_MS: 300,     // Auto-complete delay
    MAX_PAGES: 12,            // Hard limit on pages (Roadmap)
    FONT_SIZE_MAX_KB: 60      // Max size für Base64-Schriftarten (LocalStorage Limitierung)
  },

  // Centralized UI Messages (Toasts)
  TOASTS: {
    // Success messages
    PROFILE_SAVED: '💾 Profil erfolgreich gespeichert',
    DRAFT_SAVED: '💾 Briefentwurf automatisch gesichert',
    FONT_UPLOAD_SUCCESS: '🎉 Eigene Schriftart erfolgreich geladen!',
    PAGE_ADDED: '➕ Neue Seite hinzugefügt',
    RESET_SUCCESS: '🗑️ Brief erfolgreich zurückgesetzt',
    ADDRESS_SUCCESS: '✅ Empfänger-Adresse automatisch ausgefüllt!',
    
    // Info / Actions
    PRINT_PENDING: '🖨️ Druck wird vorbereitet...',
    INTL_MODE_ON: '🌍 Internationaler Modus aktiv (PLZ freigegeben)',
    
    // Warnings / Errors
    PAGE_LIMIT_REACHED: '⚠️ Maximal 12 Seiten erlaubt',
    FONT_SIZE_ERROR: '❌ Datei zu groß! (Schriftarten dürfen maximal 60 KB groß sein)',
    FONT_FORMAT_ERROR: '❌ Falsches Dateiformat! (Nur .woff2 Dateien erlaubt)',
    ZIP_INVALID: '⚠️ Hinweis: Eine deutsche PLZ sollte 5-stellig sein',
    RECIPIENT_LIMIT: '⚠️ Maximale Zeilenlänge im Empfängerfeld erreicht (6 Zeilen)',
    SUBJECT_LIMIT: '⚠️ Maximale Zeilenlänge im Betreff erreicht (2 Zeilen)',
    PAGE_OVERFLOW: '⚠️ Seite voll! Bitte neue Seite (+) anlegen',
    ADDRESS_ERROR: '❌ Fehler bei der Adress-Suche. Bitte Internetverbindung & API-Key prüfen.',
    SALUTATION_PUNCTUATION: '⚠️ Anrede sollte mit einem Komma enden (DIN 5008)',
    CLOSING_PUNCTUATION: '⚠️ Grußformel sollte ohne Komma oder Punkt enden (DIN 5008)'
  }
};
