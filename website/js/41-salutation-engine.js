// @ts-check
// @adr [[ADR-JS]] {SalutationEngine}
// 80/20 Pure B2B Salutation & Closing Engine for DIN-Brief Neo
// Focus: Clean B2B correspondence without exotic edge-case bloat.
// Principles:
// 1. 80/20 Rule: 3 crisp styles (Förmlich, Höflich, Locker) with matched salutation + closing pairs.
// 2. No Bloat: No "Hochachtungsvoll" or exotic edge cases.
// 3. ContentEditable-First: Any manual user edit locks the field (dirty flag).
// 4. In-flight Guard: Typing "herr " or "frau " never corrupts into "Hallo herr,".
// 5. Offline Zero-Click: 951 Vornamen aus data/de_vornamen_gender.json.gz (gzip) erkennen das Geschlecht ohne Präfix.

import { StorageManager, Constants } from './51-storage.js';
import { showToast } from './32-toast.js';
import { fetchGzipJson } from './05-gzip.js';

/**
 * Offline-Gender-Index aus data/de_vornamen_gender.json.gz (2,6 KB gzip,
 * geladen wie in 45-address-intelligence via DecompressionStream).
 * Bis zum Load liefert Zero-Click-Detection die neutrale Anrede.
 * @type {{ male: Set<string>, female: Set<string>, ready: Promise<void> | null }}
 */
const NAME_INDEX = { male: new Set(), female: new Set(), ready: null };

/**
 * Lädt das Vornamen-Wörterbuch einmalig beim Init.
 * @returns {Promise<void>}
 */
function ensureNameIndex() {
  if (NAME_INDEX.ready) return NAME_INDEX.ready;
  NAME_INDEX.ready = (async () => {
    /* Gemeinsame gzip-Pipeline (05-gzip.js). Liefert bei jedem Fehler null
     * -> Sets bleiben leer -> neutrale Anrede (sanfte Degradation). */
    const json = await fetchGzipJson('data/de_vornamen_gender.json.gz');
    if (!json) return;
    for (const name of json.m || []) NAME_INDEX.male.add(String(name).toLowerCase());
    for (const name of json.f || []) NAME_INDEX.female.add(String(name).toLowerCase());
  })();
  return NAME_INDEX.ready;
}

/**
 * @param {string} [f]
 * @returns {'formal' | 'polite' | 'casual'}
 */
function normalizeFormality(f) {
  /** @type {Record<string, 'formal' | 'polite' | 'casual'>} */
  const map = {
    formal: "formal", förmlich: "formal", foermlich: "formal",
    polite: "polite", höflich: "polite", hoeflich: "polite",
    casual: "casual", modern: "casual", locker: "casual",
  };
  return map[(f || "").toLowerCase()] || "formal";
}

/* @adr [[ADR-JS]] {SalutationEngine} */
export const SalutationEngine = {
  /**
   * The 3 matched 80/20 B2B Closings.
   */
  CLOSINGS: Object.freeze({
    formal: "Mit freundlichen Grüßen",
    polite: "Freundliche Grüße",
    casual: "Beste Grüße"
  }),

  /**
   * Pure 80/20 B2B Salutation Derivation.
   * Produces crisp, standard German greetings without title acrobatics.
   * @param {{ rawName?: string, rawCompany?: string, formality?: string }} [opts]
   */
  derive({ rawName = "", rawCompany = "", formality = "formal" } = {}) {
    const style = normalizeFormality(formality);
    const text = (rawName || "").trim();
    const company = (rawCompany || "").trim();

    // 1. Company or empty input -> Standard formal fallback
    if (!text || (company && !text)) {
      return this.getFallback(style);
    }

    // 2. Explicit prefix check ("Herr", "Herrn", "Frau")
    let gender = "none";
    let nameWithoutPrefix = text;
    const prefixMatch = text.match(/^(herrn?|frau)\b\s*/i);
    if (prefixMatch) {
      gender = prefixMatch[1].toLowerCase().startsWith("herr") ? "male" : "female";
      nameWithoutPrefix = text.slice(prefixMatch[0].length).trim();

      // In-flight guard: User only typed "herr " or "frau " so far
      if (!nameWithoutPrefix) {
        if (style === "casual") return "Hallo,";
        if (style === "polite") return gender === "female" ? "Guten Tag Frau," : "Guten Tag Herr,";
        return gender === "female" ? "Sehr geehrte Frau," : "Sehr geehrter Herr,";
      }
    }

    // 3. Strip optional titles cleanly (80/20 standard: keine Titelakrobatik)
    const cleanName = nameWithoutPrefix.replace(/(?:^|\s)(Prof\.\s*Dr\.|Prof\.|Dr\.|Dipl\.-Ing\.|Mag\.)(?:\s+|$)/gi, ' ').trim();

    // 4. Split Name with noble particle support (von, zu, van, de, etc.)
    const parts = cleanName.split(/\s+/).filter(Boolean);
    let lastName = "";
    let firstName = "";

    if (parts.length <= 1) {
      lastName = parts[0] || "";
    } else {
      const nobleParticles = new Set(["von", "zu", "van", "de", "der", "den", "vom", "zur", "und"]);
      const nameTokens = [...parts];
      const lastToken = nameTokens.pop() || "";
      const particleTokens = [];

      while (nameTokens.length > 0 && nobleParticles.has(nameTokens[nameTokens.length - 1].toLowerCase())) {
        particleTokens.unshift(nameTokens.pop());
      }

      lastName = particleTokens.length > 0 ? `${particleTokens.join(" ")} ${lastToken}` : lastToken;
      firstName = nameTokens.join(" ");
    }

    // 5. Zero-Click Gender Detection (data/de_vornamen_gender.json.gz)
    if (gender === "none") {
      const checkWord = (firstName || lastName).toLowerCase().split(/[\s-]+/)[0];
      if (NAME_INDEX.male.has(checkWord)) gender = "male";
      else if (NAME_INDEX.female.has(checkWord)) gender = "female";
    }

    // 6. Matched Output Pairs (80/20 B2B)
    if (style === "formal") {
      if (gender === "female") return `Sehr geehrte Frau ${lastName},`;
      if (gender === "male") return `Sehr geehrter Herr ${lastName},`;
      return "Sehr geehrte Damen und Herren,";
    }

    if (style === "polite") {
      if (gender === "female") return `Guten Tag Frau ${lastName},`;
      if (gender === "male") return `Guten Tag Herr ${lastName},`;
      return "Guten Tag,";
    }

    // Casual / Locker
    if (firstName) return `Hallo ${firstName},`;
    if (lastName) return `Hallo ${lastName},`;
    return "Hallo,";
  },

  getClosing(formality = "formal") {
    const style = normalizeFormality(formality);
    return this.CLOSINGS[style] || this.CLOSINGS.formal;
  },

  getFallback(formality = "formal") {
    const style = normalizeFormality(formality);
    if (style === "casual") return "Hallo,";
    if (style === "polite") return "Guten Tag,";
    return "Sehr geehrte Damen und Herren,";
  }
};

/* @adr [[ADR-JS]] {SalutationFeature} */
export class SalutationFeature {
  /**
   * 🚨 ARCHITECTURAL GUARD (ein Settings-Owner):
   * `settingsContext` ist das GETEILTE Settings-Objekt des SettingsManager
   * (gleiches Muster wie SignatureFeature). Vorher lud diese Klasse per
   * `StorageManager.loadSettings()` eine EIGENE Kopie und schrieb sie an
   * sechs Stellen vollständig zurück — jede Theme-/Layout-/Hilfslinien-
   * Änderung, die der SettingsManager nach dem Laden vornahm, wurde beim
   * nächsten Anrede-Wechsel mit dem veralteten Snapshot überschrieben
   * (Last-Write-Wins auf stale Daten).
   * NIEMALS hier wieder `loadSettings()` aufrufen oder ein zweites
   * Settings-Objekt anlegen.
   * @param {(() => void) | null} saveDraftDataCallback
   * @param {{ settings: any, save: () => void } | null} [settingsContext]
   */
  constructor(saveDraftDataCallback, settingsContext = null) {
    this.saveDraftData = saveDraftDataCallback;
    /** @type {{ settings: any, save: () => void } | null} */
    this._settingsContext = settingsContext;
    this.settings = settingsContext ? settingsContext.settings : StorageManager.loadSettings();
    if (!this.settings.formality) this.settings.formality = 'formal';
  }

  /**
   * Persistiert über den gemeinsamen Owner, damit kein Fremdfeld verliert.
   * @returns {void}
   */
  _saveSettings() {
    if (this._settingsContext) this._settingsContext.save();
    else StorageManager.saveSettings(this.settings);
  }

  init() {
    this.isReady = false;
    ensureNameIndex();
    this._wireFormality();
    this._wireRecipientName();
    this._wireManualEdits();
    this._applyUIState();
    this._regenerateSalutation({ onlyIfEmpty: true });
    this._regenerateClosing({ onlyIfEmpty: true });
    this.isReady = true;
  }

  _applyUIState() {
    const formalBtn = document.getElementById(`btn-style-${this.settings.formality}`);
    if (formalBtn) /** @type {HTMLInputElement} */ (formalBtn).checked = true;
  }

  _wireFormality() {
    const apply = (/** @type {'formal' | 'polite' | 'casual'} */ style) => {
      if (!this.isReady) return;
      this.settings.formality = style;
      this._saveSettings();
      this._regenerateSalutation({ force: true });
      this._regenerateClosing({ force: true });
    };
    (/** @type {('formal' | 'polite' | 'casual')[]} */ (['formal', 'polite', 'casual'])).forEach(style => {
      const btn = document.getElementById(`btn-style-${style}`);
      if (btn) btn.addEventListener('change', () => apply(style));
    });
  }

  _wireRecipientName() {
    const fields = ['empfaenger-namenszeile', 'empfaenger-firma'];
    fields.forEach(tag => {
      const el = document.getElementById(tag);
      if (el) el.addEventListener('input', () => this._regenerateSalutation());
    });
  }

  /**
   * ContentEditable-First: Locks fields when edited, auto-resets when cleared.
   */
  _wireManualEdits() {
    const anrede = document.getElementById('anrede');
    const gruss = document.getElementById('grussformel');

    if (anrede) {
      anrede.addEventListener('input', () => {
        const text = (anrede.textContent || "").trim();
        if (!text) {
          // AUTO-RESET: User cleared field -> Re-enable auto-generation
          delete anrede.dataset.dirty;
          this.settings.salutationDirty = false;
          this._saveSettings();
          this._regenerateSalutation({ force: true });
        } else {
          // USER LOCK: Manual edit is sacred -> Hands off!
          anrede.dataset.dirty = "true";
          delete anrede.dataset.generated;
          this.settings.salutationDirty = true;
          this._saveSettings();
        }
      });
      anrede.addEventListener('blur', () => this._validatePunctuation(anrede, 'anrede'));
    }

    if (gruss) {
      gruss.addEventListener('input', () => {
        const text = (gruss.textContent || "").trim();
        if (!text) {
          delete gruss.dataset.dirty;
          this.settings.closingDirty = false;
          this._saveSettings();
          this._regenerateClosing({ force: true });
        } else {
          gruss.dataset.dirty = "true";
          delete gruss.dataset.generated;
          this.settings.closingDirty = true;
          this._saveSettings();
        }
      });
      gruss.addEventListener('blur', () => this._validatePunctuation(gruss, 'grussformel'));
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {'anrede'|'grussformel'} kind
   */
  _validatePunctuation(el, kind) {
    const dirty = kind === 'anrede' ? this.settings.salutationDirty : this.settings.closingDirty;
    if (!dirty) return;
    const text = (el.textContent || "").trim();
    if (!text) return;
    if (kind === 'anrede' && !text.endsWith(',')) {
      showToast(Constants.TOASTS.SALUTATION_PUNCTUATION, 'warning');
    } else if (kind === 'grussformel' && /[,.]$/.test(text)) {
      showToast(Constants.TOASTS.CLOSING_PUNCTUATION, 'warning');
    }
  }

  _regenerateSalutation({ force = false, onlyIfEmpty = false } = {}) {
    const el = document.getElementById('anrede');
    if (!el) return;

    // CONTENTEDITABLE MANDATE: Never overwrite manual user input unless forced
    if (!force && (this.settings.salutationDirty || el.dataset.dirty === "true")) {
      return;
    }

    const current = (el.textContent || "").trim();
    if (onlyIfEmpty && current) return;

    const rawName = document.getElementById('empfaenger-namenszeile')?.textContent || "";
    const rawCompany = document.getElementById('empfaenger-firma')?.textContent || "";

    const value = SalutationEngine.derive({
      rawName,
      rawCompany,
      formality: this.settings.formality
    });

    this._setField(el, value, { force });
  }

  _regenerateClosing({ force = false, onlyIfEmpty = false } = {}) {
    const el = document.getElementById('grussformel');
    if (!el) return;

    if (!force && (this.settings.closingDirty || el.dataset.dirty === "true")) {
      return;
    }

    const current = (el.textContent || "").trim();
    if (onlyIfEmpty && current) return;

    const value = SalutationEngine.getClosing(this.settings.formality);
    this._setField(el, value, { force });
  }

  /**
   * @param {HTMLElement} el
   * @param {string} value
   * @param {{ force?: boolean }} [opts]
   */
  _setField(el, value, opts = {}) {
    if (!opts.force && document.activeElement === el) return;
    el.textContent = value;
    el.dataset.generated = "true";
    if (this.saveDraftData) this.saveDraftData();
  }
}
