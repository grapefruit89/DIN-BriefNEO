// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] 
// @guide [[glossary]] 

/* js/storage.js */

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
      console.error("Fehler beim Speichern im LocalStorage:", e);
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
      console.error("Fehler beim Laden aus dem LocalStorage:", e);
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
      console.error("Fehler beim Speichern der Einstellungen:", e);
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
      systemFont: "sans",
      addressProvider: "photon"
    };
    try {
      const settings = localStorage.getItem("din_settings");
      return settings ? JSON.parse(settings) : defaultSettings;
    } catch (e) {
      console.error("Fehler beim Laden der Einstellungen:", e);
      return defaultSettings;
    }
  },

  /**
   * Save base64 encoded custom font (1-Font Limit for file:// compatibility)
   * @param {string} base64Font
   * @returns {boolean}
   */
  saveCustomFont(base64Font) {
    try {
      localStorage.setItem("din_custom_font", base64Font);
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern der Schriftart im LocalStorage:", e);
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
      console.error("Fehler beim Laden der Schriftart aus dem LocalStorage:", e);
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
      console.error("Fehler beim Speichern des Geoapify Keys:", e);
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
      console.error("Fehler beim Laden des Geoapify Keys:", e);
      return "";
    }
  }
};
