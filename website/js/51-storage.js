// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]]
// @guide [[glossary]]

/**
 * @typedef {object} DinSettings
 * @property {'auto' | 'light' | 'dark' | string} theme
 * @property {'form-a' | 'form-b' | string} layout
 * @property {boolean} guides
 * @property {'formal' | 'polite' | 'casual' | string} formality
 */

/**
 * System- und Validierungs-Konstanten.
 */
export const Constants = {
  LIMITS: {
    HISTORY_MAX_ITEMS: 50,    // Undo/Redo Cap
    FONT_SIZE_MAX_KB: 60      // Max size für Base64-Schriftarten (LocalStorage Limitierung)
  },
  SCHEMA_VERSION: 1,
  TOASTS: {
    FONT_SIZE_ERROR: '❌ Datei zu groß! (Schriftarten dürfen maximal 60 KB groß sein)',
    FONT_FORMAT_ERROR: '❌ Falsches Dateiformat! (Nur .woff2 Dateien erlaubt)',
    SALUTATION_PUNCTUATION: '⚠️ Anrede sollte mit einem Komma enden (DIN 5008)',
    CLOSING_PUNCTUATION: '⚠️ Grußformel sollte ohne Komma oder Punkt enden (DIN 5008)'
  }
};

/**
 * Standard-Einstellungen für UI und Typografie.
 * @type {DinSettings}
 */
export const DEFAULT_SETTINGS = {
  theme: 'auto',
  layout: 'form-b',
  guides: true,
  formality: 'formal'
};

/**
 * Zentrale LocalStorage-Schlüssel.
 */
export const STORAGE_KEYS = {
  draft: 'din_draft_current',
  settings: 'din_settings',
  font: 'din_custom_font',
  geoapifyKey: 'din_geoapify_key',
  addresses: 'din_local_addresses',
  senderCoords: 'din_sender_coords',
  schema: 'din_schema_version'
};

/**
 * Liest einen Rohwert (String) aus dem LocalStorage.
 * @param {string} key
 * @param {string | null} [fallback]
 * @returns {string | null}
 */
export function load(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Schreibt einen Rohwert (String) in den LocalStorage.
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
export function save(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Entfernt einen Schlüssel aus dem LocalStorage.
 * @param {string} key
 * @returns {boolean}
 */
export function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Liest ein JSON-Objekt aus dem LocalStorage.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function loadJSON(key, fallback) {
  const raw = load(key);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(fallback) && typeof fallback === 'object') {
      return /** @type {T} */ ({ ...fallback, ...parsed });
    }
    return /** @type {T} */ (parsed ?? fallback);
  } catch {
    return fallback;
  }
}

/**
 * Serialisiert und schreibt ein JSON-Objekt in den LocalStorage.
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function saveJSON(key, value) {
  try {
    return save(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/**
 * Führt anstehende Schema-Migrationen sequenziell und idempotent aus.
 */
export function migrateStorage() {
  const version = Number(load(STORAGE_KEYS.schema, '0')) || 0;
  if (version === Constants.SCHEMA_VERSION) return;
  save(STORAGE_KEYS.schema, String(Constants.SCHEMA_VERSION));
}

/**
 * Schlanke Fassade für bestehende Module.
 */
export const StorageManager = {
  load,
  save,
  remove,
  loadJSON,
  saveJSON,
  migrate: migrateStorage,
  /** @param {string} key @param {any} data */
  saveDraft: (key, data) => saveJSON(key === 'current' ? STORAGE_KEYS.draft : `din_draft_${key}`, data),
  /** @param {string} key @returns {any} */
  loadDraft: (key) => loadJSON(key === 'current' ? STORAGE_KEYS.draft : `din_draft_${key}`, /** @type {any} */ (null)),
  /** @param {any} settings */
  saveSettings: (settings) => saveJSON(STORAGE_KEYS.settings, settings),
  /** @returns {DinSettings} */
  loadSettings: () => loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  /** @param {string} font */
  saveCustomFont: (font) => save(STORAGE_KEYS.font, font),
  loadCustomFont: () => load(STORAGE_KEYS.font, null),
  removeCustomFont: () => remove(STORAGE_KEYS.font),
  /** @param {string} key */
  saveGeoapifyKey: (key) => save(STORAGE_KEYS.geoapifyKey, key),
  loadGeoapifyKey: () => load(STORAGE_KEYS.geoapifyKey, '') || '',
  /** @returns {Array<any>} */
  loadLocalAddresses: () => loadJSON(STORAGE_KEYS.addresses, /** @type {Array<any>} */ ([])),
  /** @param {Array<any>} book */
  saveLocalAddresses: (book) => saveJSON(STORAGE_KEYS.addresses, book),
  /** @returns {{ lat: number, lon: number } | null} */
  loadSenderCoords: () => /** @type {{ lat: number, lon: number } | null} */ (loadJSON(STORAGE_KEYS.senderCoords, /** @type {any} */ (null))),
  /** @param {{ lat: number, lon: number }} coords */
  saveSenderCoords: (coords) => saveJSON(STORAGE_KEYS.senderCoords, coords)
};
