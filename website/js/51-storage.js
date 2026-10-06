// @ts-check
// @adr [[ADR-JS]] 
// @guide [[glossary]] 


/* State-Layer: System-Konstanten (ehem. 51-constants.js) + LocalStorage-Persistenz (ehem. 52-storage.js), zusammengeführt am 2026-09-09 (Kohäsion: Constants definieren die Storage-Keys, StorageManager konsumiert sie). */

/* js/constants.js */

export const Constants = {

  // LocalStorage Keys
  // ACHTUNG: Nur LocalStorage nutzen. Begruendung ist NICHT mehr file:// (die App
  // laeuft ueber einen lokalen Webserver, siehe ADR-RUNTIME-CONTEXT), sondern:
  // localStorage ist SYNCHRON lesbar -> Boot-Restore ohne await, kein FOUC.
  // OPFS/IndexedDB/File System Access sind asynchron und hier ohne Gewinn (A34-A36).
  // Hinweis: Die konkreten Key-Strings ('din_*') leben in den save/load-Methoden und den
  // Boot-Skripten (klassische <script src>-Skripte, koennen keine Module importieren).
  LIMITS: {
    HISTORY_MAX_ITEMS: 50,    // Undo/Redo Cap
    FONT_SIZE_MAX_KB: 60      // Max size für Base64-Schriftarten (LocalStorage Limitierung)
  },

  /**
   * Schema-Version der Datenstrukturen für Storage-Migrationen und Import/Export.
   */
  SCHEMA_VERSION: 1,

  // Zentrale UI-Hinweise (Toasts) für Fehler und Validierungen
  TOASTS: {
    // Warnings / Errors
    FONT_SIZE_ERROR: '❌ Datei zu groß! (Schriftarten dürfen maximal 60 KB groß sein)',
    FONT_FORMAT_ERROR: '❌ Falsches Dateiformat! (Nur .woff2 Dateien erlaubt)',
    SALUTATION_PUNCTUATION: '⚠️ Anrede sollte mit einem Komma enden (DIN 5008)',
    CLOSING_PUNCTUATION: '⚠️ Grußformel sollte ohne Komma oder Punkt enden (DIN 5008)'
  }
};

/* js/storage.js */

// TODO(profile-management): Absender-Profile (IBAN/Bankdaten, Privat/Büro-Wechsel) sind
// geplant, aber NICHT implementiert. Siehe [[ADR-PROFILE-MANAGEMENT]] für Kontext und
// Implementierungshinweise (textContent statt innerHTML, LocalStorage-only, kein neuer
// Persistenz-Layer). Kein aktiver Auftrag — nur Platzhalter für künftige Session.

/* @adr [[ADR-DATA-PERSISTENCE]] {StorageModule} */
export const StorageManager = {
  /**
   * Save specific draft data
   * @param {string} key
   * @param {any} data
   * @returns {boolean}
   */
  saveDraft(key, data) {
    try {
      localStorage.setItem(`din_draft_${key}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("[Storage] Fehler beim Speichern im LocalStorage:", e);
      return false;
    }
  },

  /**
   * Load draft data
   * @param {string} key
   * @returns {any}
   */
  loadDraft(key) {
    try {
      const item = localStorage.getItem(`din_draft_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("[Storage] Fehler beim Laden aus dem LocalStorage:", e);
      return null;
    }
  },

  /**
   * Save settings (Theme, Form, Guides status)
   * @param {any} settings
   * @returns {boolean}
   */
  saveSettings(settings) {
    try {
      localStorage.setItem("din_settings", JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error("[Storage] Fehler beim Speichern der Einstellungen:", e);
      return false;
    }
  },

  /**
   * Load settings
   * @returns {any}
   */
  loadSettings() {
    const defaultSettings = {
      theme: "auto",
      layout: "form-b",
      guides: true,
      formality: "formal"
    };
    try {
      const settings = localStorage.getItem("din_settings");
      return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (e) {
      console.error("[Storage] Fehler beim Laden der Einstellungen:", e);
      return defaultSettings;
    }
  },

  /**
   * Führt anstehende Schema-Migrationen sequenziell aus und aktualisiert die Version.
   * @returns {void}
   */
  migrate() {
    let version = Number(localStorage.getItem('din_schema_version')) || 0;
    if (version === Constants.SCHEMA_VERSION) return;
    // Migrationsschritte sequenziell von version aufwärts ausführen
    localStorage.setItem('din_schema_version', String(Constants.SCHEMA_VERSION));
  },

  /**
   * Save base64 encoded custom font (1-Font-Limit wegen localStorage-Quota)
   * @param {string} base64Font
   * @returns {boolean}
   */
  saveCustomFont(base64Font) {
    try {
      localStorage.setItem("din_custom_font", base64Font);
      return true;
    } catch (e) {
      console.error("[Storage] Fehler beim Speichern der Schriftart im LocalStorage:", e);
      return false;
    }
  },

  /**
   * Load base64 encoded custom font
   * @returns {string | null}
   */
  loadCustomFont() {
    try {
      return localStorage.getItem("din_custom_font");
    } catch (e) {
      console.error("[Storage] Fehler beim Laden der Schriftart aus dem LocalStorage:", e);
      return null;
    }
  },

  /**
   * Save Geoapify API key
   * @param {string} key
   * @returns {boolean}
   */
  saveGeoapifyKey(key) {
    try {
      localStorage.setItem("din_geoapify_key", key);
      return true;
    } catch (e) {
      console.error("[Storage] Fehler beim Speichern des Geoapify Keys:", e);
      return false;
    }
  },

  /**
   * Load Geoapify API key
   * @returns {string}
   */
  loadGeoapifyKey() {
    try {
      return localStorage.getItem("din_geoapify_key") || "";
    } catch (e) {
      console.error("[Storage] Fehler beim Laden des Geoapify Keys:", e);
      return "";
    }
  },

  /**
   * Remove custom font from LocalStorage
   * @returns {boolean}
   */
  removeCustomFont() {
    try {
      localStorage.removeItem("din_custom_font");
      return true;
    } catch (e) {
      console.error("[Storage] Fehler beim Entfernen der Schriftart:", e);
      return false;
    }
  },

  /**
   * Load local address book
   * @returns {Array<any>}
   */
  loadLocalAddresses() {
    try {
      const saved = localStorage.getItem("din_local_addresses");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("[Storage] Fehler beim Laden des Adressbuchs:", e);
      return [];
    }
  },

  /**
   * Save local address book
   * @param {Array<any>} book
   * @returns {boolean}
   */
  saveLocalAddresses(book) {
    try {
      localStorage.setItem("din_local_addresses", JSON.stringify(book));
      return true;
    } catch (e) {
      console.error("[Storage] Fehler beim Speichern des Adressbuchs:", e);
      return false;
    }
  },

  /**
   * Load sender coordinates for proximity bias
   * @returns {{ lat: number, lon: number } | null}
   */
  loadSenderCoords() {
    try {
      const saved = localStorage.getItem("din_sender_coords");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("[Storage] Fehler beim Laden der Koordinaten:", e);
      return null;
    }
  },

  /**
   * Save sender coordinates for proximity bias
   * @param {{ lat: number, lon: number }} coords
   * @returns {boolean}
   */
  saveSenderCoords(coords) {
    try {
      localStorage.setItem("din_sender_coords", JSON.stringify(coords));
      return true;
    } catch (e) {
      console.error("[Storage] Fehler beim Speichern der Koordinaten:", e);
      return false;
    }
  }
};
