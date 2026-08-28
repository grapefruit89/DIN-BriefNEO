// @ts-check
// @adr [[ADR-JS]] 
// @guide [[glossary]] 

// @ts-check
import { StorageManager } from './52-storage.js';
import { Constants } from './51-constants.js';
import { showToast } from './32-toast.js';

export const SALUTATION = Object.freeze({
  TITLES: ["Prof. Dr.", "Dipl.-Ing.", "Prof.", "Dr.", "Mag."],
});

/**
 * @param {string} f
 * @returns {string}
 */
function normalizeFormality(f) {
  const map = {
    formal: "formal", förmlich: "formal", foermlich: "formal",
    polite: "polite", höflich: "polite", hoeflich: "polite",
    casual: "casual", modern: "casual", locker: "casual",
  };
  return map[/** @type {keyof typeof map} */ ((f || "").toLowerCase())] || "formal";
}

/* @adr [[ADR-JS]] {SalutationEngine} */
export const SalutationEngine = {
  /**
   * @param {string} name
   */
  splitTitles(name) {
    let rest = (name || "").trim();
    const sorted = [...SALUTATION.TITLES].sort((a, b) => b.length - a.length);
    const found = [];
    let changed = true;
    while (changed) {
      changed = false;
      for (const t of sorted) {
        const low = rest.toLowerCase();
        const tl = t.toLowerCase();
        if (low === tl || low.startsWith(tl + " ")) {
          found.push(t);
          rest = rest.slice(t.length).trim();
          changed = true;
          break;
        }
      }
    }
    return { titles: found.join(" "), name: rest };
  },

  /**
   * @param {{ firstName?: string, lastName?: string, company?: string, type?: string, formality?: string }} [param0]
   */
  derive({ firstName = "", lastName = "", company = "", type = "none", formality = "formal" } = {}) {
    const style = normalizeFormality(formality);
    const fn = firstName.trim();
    const ln = lastName.trim();
    const co = company.trim();

    const { titles, name: cleanLast } = this.splitTitles(ln || fn);

    if ((!cleanLast && !fn) || (co && !fn && !ln)) {
      return this.getFallback(style);
    }

    const tp = titles ? `${titles} ` : "";
    const surname = cleanLast || fn;

    if (style === "formal") {
      if (type === "female") return `Sehr geehrte Frau ${tp}${surname},`;
      if (type === "male") return `Sehr geehrter Herr ${tp}${surname},`;
      return "Sehr geehrte Damen und Herren,"; 
    }

    if (style === "polite") {
      if (type === "female") return `Guten Tag Frau ${tp}${surname},`;
      if (type === "male") return `Guten Tag Herr ${tp}${surname},`;
      return `Guten Tag ${[fn, ln].filter(Boolean).join(" ")},`.replace(/\s+/g, " ");
    }

    return `Hallo ${fn || surname},`;
  },

  /**
   * @param {string} [formality]
   */
  getClosing(formality = "formal") {
    const style = normalizeFormality(formality);
    if (style === "casual") return "Beste Grüße";
    if (style === "polite") return "Herzliche Grüße";
    return "Mit freundlichen Grüßen";
  },

  /**
   * @param {string} [formality]
   */
  getFallback(formality = "formal") {
    const style = normalizeFormality(formality);
    if (style === "casual") return "Hallo zusammen,";
    if (style === "polite") return "Guten Tag,";
    return "Sehr geehrte Damen und Herren,";
  }
};

/* @adr [[ADR-JS]] {SalutationFeature} */
export class SalutationFeature {
  /**
   * @param {(() => void) | null} saveDraftDataCallback
   */
  constructor(saveDraftDataCallback) {
    this.saveDraftData = saveDraftDataCallback;
    this.settings = StorageManager.loadSettings();
    if (!this.settings.formality) this.settings.formality = 'formal';
    if (!this.settings.recipientType) this.settings.recipientType = 'none';
  }

  init() {
    this.settings = StorageManager.loadSettings();
    this.isReady = false;
    
    // UI Wirings
    this._wireFormality();
    this._wireGender();
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

    const genderBtn = document.getElementById(`btn-gender-${this.settings.recipientType}`);
    if (genderBtn) /** @type {HTMLInputElement} */ (genderBtn).checked = true;
  }

  _wireFormality() {
    ['formal', 'polite', 'casual'].forEach(style => {
      const btn = document.getElementById(`btn-style-${style}`);
      if (btn) {
        btn.addEventListener('change', () => {
          if (!this.isReady) return;
          this.settings.formality = style;
          this.settings.salutationDirty = false;
          this.settings.closingDirty = false;
          StorageManager.saveSettings(this.settings);
          this._regenerateSalutation({ force: true });
          this._regenerateClosing({ force: true });
        });
      }
    });
  }

  _wireGender() {
    ['none', 'female', 'male'].forEach(gender => {
      const btn = document.getElementById(`btn-gender-${gender}`);
      if (btn) {
        btn.addEventListener('change', () => {
          if (!this.isReady) return;
          this.settings.recipientType = gender;
          StorageManager.saveSettings(this.settings);
          this._regenerateSalutation();
        });
      }
    });
  }

  _wireRecipientName() {
    const fields = ['empfaenger-name', 'empfaenger-firma'];
    fields.forEach(tag => {
      const el = document.getElementById(tag);
      if (el) el.addEventListener('input', () => this._regenerateSalutation());
    });
  }

  _wireManualEdits() {
    const anrede = document.getElementById('anrede');
    const gruss = document.getElementById('grussformel');
    if (anrede) {
      anrede.addEventListener('input', () => {
        this.settings.salutationDirty = true;
        delete anrede.dataset.generated;
        StorageManager.saveSettings(this.settings);
      });
      anrede.addEventListener('blur', () => this._validatePunctuation(anrede, 'anrede'));
    }
    if (gruss) {
      gruss.addEventListener('input', () => {
        this.settings.closingDirty = true;
        delete gruss.dataset.generated;
        StorageManager.saveSettings(this.settings);
      });
      gruss.addEventListener('blur', () => this._validatePunctuation(gruss, 'grussformel'));
    }
  }

  /**
   * DIN 5008: Anrede endet mit Komma ("Sehr geehrte Frau Mueller,"),
   * Gruszformel endet OHNE Komma/Punkt ("Mit freundlichen Gruessen").
   * Validiert nur manuell editierten Text -- Engine-generierte Vorschlaege
   * sind per Konstruktion korrekt (siehe SalutationEngine.derive/getClosing).
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

  _readDOMState() {
    let nameStr = (document.getElementById('empfaenger-name')?.textContent || "").trim();
    const company = (document.getElementById('empfaenger-firma')?.textContent || "").trim();

    // 1. Auto-detect and strip explicit Anrede like "Herr" or "Frau"
    const lowerName = nameStr.toLowerCase();
    if (lowerName.startsWith("herr ") || lowerName.startsWith("herrn ")) {
      nameStr = nameStr.replace(/^(Herrn|Herr)\s+/i, '');
      if (this.settings.recipientType === 'none') {
        this.settings.recipientType = 'male';
        this._applyUIState();
      }
    } else if (lowerName.startsWith("frau ")) {
      nameStr = nameStr.replace(/^Frau\s+/i, '');
      if (this.settings.recipientType === 'none') {
        this.settings.recipientType = 'female';
        this._applyUIState();
      }
    }

    // 2. Extract titles BEFORE splitting first/last name
    const { titles, name: nameWithoutTitles } = SalutationEngine.splitTitles(nameStr);

    // 3. Split remaining string into first and last name
    const parts = nameWithoutTitles.split(' ');
    const lastName = parts.length > 1 ? parts.pop() : nameWithoutTitles;
    const firstName = parts.length > 0 ? parts.join(' ') : "";

    return {
      firstName: titles ? `${titles} ${firstName}`.trim() : firstName, // Pass titles down in firstName so derive can find them
      lastName,
      company,
      type: this.settings.recipientType,
      formality: this.settings.formality,
    };
  }

  _regenerateSalutation({ force = false, onlyIfEmpty = false } = {}) {
    if (!force && this.settings.salutationDirty) return;

    const el = document.getElementById('anrede');
    if (!el) return;
    
    const current = el.textContent || "";
    if (onlyIfEmpty && current.trim()) return;

    const value = SalutationEngine.derive(this._readDOMState());
    this._setField(el, value);
  }

  _regenerateClosing({ force = false, onlyIfEmpty = false } = {}) {
    if (!force && this.settings.closingDirty) return;

    const el = document.getElementById('grussformel');
    if (!el) return;

    const current = el.textContent || "";
    if (onlyIfEmpty && current.trim()) return;

    const value = SalutationEngine.getClosing(this._readDOMState().formality);
    this._setField(el, value);
  }

  /**
   * @param {HTMLElement} el
   * @param {string} value
   */
  _setField(el, value) {
    if (document.activeElement === el) return; 
    el.textContent = value;
    el.dataset.generated = "true"; // Ghost-Markierung: Engine-Vorschlag, kein Nutzertext -- siehe layout.css/print.css
    if (this.saveDraftData) this.saveDraftData();
  }
}

