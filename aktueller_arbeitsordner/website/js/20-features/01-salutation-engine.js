// @adr [[ADR-JS]] 
// @guide [[glossary]] 

import { StorageManager } from '../30-utils/02-storage.js';

export const SALUTATION = Object.freeze({
  TITLES: ["Prof. Dr.", "Dipl.-Ing.", "Prof.", "Dr.", "Mag."],
});

function normalizeFormality(f) {
  const map = {
    formal: "formal", förmlich: "formal", foermlich: "formal",
    polite: "polite", höflich: "polite", hoeflich: "polite",
    casual: "casual", modern: "casual", locker: "casual",
  };
  return map[(f || "").toLowerCase()] || "formal";
}

/* @adr [[ADR-JS]] {SalutationEngine} */
export const SalutationEngine = {
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

  getClosing(formality = "formal") {
    const style = normalizeFormality(formality);
    if (style === "casual") return "Beste Grüße";
    if (style === "polite") return "Herzliche Grüße";
    return "Mit freundlichen Grüßen";
  },

  getFallback(formality = "formal") {
    const style = normalizeFormality(formality);
    if (style === "casual") return "Hallo zusammen,";
    if (style === "polite") return "Guten Tag,";
    return "Sehr geehrte Damen und Herren,";
  }
};

/* @adr [[ADR-JS]] {SalutationFeature} */
export class SalutationFeature {
  constructor(saveDraftDataCallback) {
    this.saveDraftData = saveDraftDataCallback;
    this.settings = StorageManager.loadSettings();
    if (!this.settings.formality) this.settings.formality = 'formal';
    if (!this.settings.recipientType) this.settings.recipientType = 'none';
  }

  init() {
    this._wireFormality();
    this._wireGender();
    this._wireRecipientName();
    this._wireManualEdits();

    this._applyUIState();
    this._regenerateSalutation({ onlyIfEmpty: true });
    this._regenerateClosing({ onlyIfEmpty: true });
  }

  _applyUIState() {
    ['formal', 'polite', 'casual'].forEach(style => {
      const btn = document.getElementById(`btn-style-${style}`);
      if (btn) btn.setAttribute('aria-pressed', this.settings.formality === style ? 'true' : 'false');
    });

    ['none', 'female', 'male'].forEach(gender => {
      const btn = document.getElementById(`btn-gender-${gender}`);
      if (btn) btn.setAttribute('aria-pressed', this.settings.recipientType === gender ? 'true' : 'false');
    });
  }

  _wireFormality() {
    ['formal', 'polite', 'casual'].forEach(style => {
      const btn = document.getElementById(`btn-style-${style}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.settings.formality = style;
          this.settings.salutationDirty = false;
          this.settings.closingDirty = false;
          StorageManager.saveSettings(this.settings);
          this._applyUIState();
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
        btn.addEventListener('click', () => {
          this.settings.recipientType = gender;
          StorageManager.saveSettings(this.settings);
          this._applyUIState();
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
    if (anrede) anrede.addEventListener('input', () => {
      this.settings.salutationDirty = true;
      StorageManager.saveSettings(this.settings);
    });
    if (gruss) gruss.addEventListener('input', () => {
      this.settings.closingDirty = true;
      StorageManager.saveSettings(this.settings);
    });
  }

  _readDOMState() {
    const nameStr = (document.getElementById('empfaenger-name')?.textContent || "").trim();
    const parts = nameStr.split(' ');
    const lastName = parts.length > 1 ? parts.pop() : nameStr;
    const firstName = parts.length > 0 ? parts.join(' ') : "";
    const company = (document.getElementById('empfaenger-firma')?.textContent || "").trim();

    return {
      firstName,
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

  _setField(el, value) {
    if (document.activeElement === el) return; 
    el.textContent = value;
    if (this.saveDraftData) this.saveDraftData();
  }
}
