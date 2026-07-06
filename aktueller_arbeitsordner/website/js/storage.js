// @adr [[ADR-DATA-PERSISTENCE]] 
// @guide [[glossary]] 

/* js/storage.js */

/* @adr [[ADR-DATA-PERSISTENCE]] {StorageModule} */
export const StorageManager = {
  // Load local address book
  getAddressBook() {
    try {
      const list = localStorage.getItem("din_brief_addressbook");
      return list ? JSON.parse(list) : [];
    } catch (e) {
      return [];
    }
  },

  // Save an address to the local address book (max 100)
  saveToAddressBook(addressObj) {
    if (!addressObj.name && !addressObj.firma) return false;
    try {
      let book = this.getAddressBook();
      const cleanStr = (s) => (s || "").replace(/<[^>]*>?/gm, "").trim();
      const name = cleanStr(addressObj.name);
      const firma = cleanStr(addressObj.firma);
      const strasse = cleanStr(addressObj.strasse);
      const ort = cleanStr(addressObj.ort);
      if (!name && !firma) return false;
      
      // Remove duplicate if exists (to move it to top)
      book = book.filter(a => !(cleanStr(a.name) === name && cleanStr(a.firma) === firma && cleanStr(a.strasse) === strasse && cleanStr(a.ort) === ort));
      
      book.unshift({ name, firma, strasse, ort });
      if (book.length > 100) book = book.slice(0, 100);
      localStorage.setItem("din_brief_addressbook", JSON.stringify(book));
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern im Adressbuch:", e);
      return false;
    }
  },

  // Save specific draft data
  saveDraft(key, data) {
    try {
      localStorage.setItem(`din_draft_${key}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern im LocalStorage:", e);
      return false;
    }
  },

  // Load draft data
  loadDraft(key) {
    try {
      const item = localStorage.getItem(`din_draft_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("Fehler beim Laden aus dem LocalStorage:", e);
      return null;
    }
  },

  // Save profile data (Sender details)
  saveProfile(profile) {
    try {
      localStorage.setItem("din_profile", JSON.stringify(profile));
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern des Profils:", e);
      return false;
    }
  },

  // Load profile data
  loadProfile() {
    try {
      const profile = localStorage.getItem("din_profile");
      return profile ? JSON.parse(profile) : null;
    } catch (e) {
      console.error("Fehler beim Laden des Profils:", e);
      return null;
    }
  },

  // Save settings (Theme, Form, Guides status)
  saveSettings(settings) {
    try {
      localStorage.setItem("din_settings", JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern der Einstellungen:", e);
      return false;
    }
  },

  // Load settings
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

  // Save base64 encoded custom font (1-Font Limit for file:// compatibility)
  saveCustomFont(base64Font) {
    try {
      localStorage.setItem("din_custom_font", base64Font);
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern der Schriftart im LocalStorage:", e);
      return false;
    }
  },

  // Load base64 encoded custom font
  loadCustomFont() {
    try {
      return localStorage.getItem("din_custom_font");
    } catch (e) {
      console.error("Fehler beim Laden der Schriftart aus dem LocalStorage:", e);
      return null;
    }
  },

  // Save Geoapify API key
  saveGeoapifyKey(key) {
    try {
      localStorage.setItem("din_geoapify_key", key);
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern des Geoapify Keys:", e);
      return false;
    }
  },

  // Load Geoapify API key
  loadGeoapifyKey() {
    try {
      return localStorage.getItem("din_geoapify_key") || "";
    } catch (e) {
      console.error("Fehler beim Laden des Geoapify Keys:", e);
      return "";
    }
  }
};
