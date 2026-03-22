/**
 * js/state.js — Central State Authority
 * Claude Brief · DIN 5008 Generator
 * ─────────────────────────────────────────────────────────
 * ES6 Module. Zero DOM. Zero side-effects.
 *
 * Cursor-safety contract:
 *   DOM writers in ui.js must check `document.activeElement`
 *   before patching innerHTML on a focused field.
 *   This module is ignorant of the DOM entirely.
 */

export const DEFAULT_STATE = {
  config: {
    layout:        'form-b',   // 'form-a' | 'form-b'
    dateFormat:    'de',       // 'de' | 'long' | 'iso'
    formality:     'formal',   // 'formal' | 'polite' | 'casual'
    recipientType: 'none',     // 'none' | 'male' | 'female'
    showGuides:    false,
  },
  content: {
    senderName:       '',
    senderStreet:     '',
    senderZipCity:    '',
    senderPhone:      '',
    senderEmail:      '',
    returnAddress:    '',
    specialNote:      '',
    recipientCompany: '',
    recipientSalut:   '',
    recipientName:    '',
    recipientStreet:  '',
    recipientZip:     '',
    recipientCity:    '',
    date:             '',
    subject:          '',
    salutation:       '',
    body:             '',
    greeting:         '',
    signatureName:    '',
  },
  profile: {
    company: '', name: '',   street: '',
    zip:     '', city: '',   phone:  '',
    email:   '', iban:  '',
  },
};

export const STORAGE_KEY = 'claude_brief_state';
const MAX_HISTORY = 60;
const clone = (obj) => JSON.parse(JSON.stringify(obj));

/* ─────────────────────────────────────────────────────────────
   StateManager
───────────────────────────────────────────────────────────── */
export class StateManager {
  constructor() {
    this._raw       = clone(DEFAULT_STATE);
    this._listeners = new Set();
    this._history   = [];
    this._histIdx   = -1;
    this._navigating = false;

    this.state = this._makeProxy(this._raw);
    this._pushHistory();
  }

  /* ── Subscription ────────────────────────────────────────────── */
  subscribe(fn)   { this._listeners.add(fn); }
  unsubscribe(fn) { this._listeners.delete(fn); }

  _emit(path, value, scope) {
    this._listeners.forEach(fn => fn(path, value, scope));
  }

  /* ── Serialize / Load ────────────────────────────────────────── */
  serialize() { return clone(this._raw); }

  /**
   * Replace full state. Pass null/undefined to reset to DEFAULT_STATE.
   * Preserves current profile when resetting content only.
   * @param {object|null} data
   * @param {boolean} keepHistory
   */
  load(data, keepHistory = false) {
    const incoming = data ? clone(data) : clone(DEFAULT_STATE);

    // On a "reset" (no data), keep existing profile
    if (!data) {
      incoming.profile = clone(this._raw.profile);
    }

    // Merge so that new DEFAULT_STATE keys are always present
    const merged = clone(DEFAULT_STATE);
    ['config', 'content', 'profile'].forEach(k => {
      if (incoming[k]) Object.assign(merged[k], incoming[k]);
    });

    this._raw  = merged;
    this.state = this._makeProxy(this._raw);
    this._emit('root', this._raw, 'load');

    if (!keepHistory) {
      this._history = [];
      this._histIdx = -1;
      this._pushHistory();
    }
  }

  /* ── Undo / Redo ─────────────────────────────────────────────── */
  _pushHistory() {
    if (this._navigating) return;
    const snap = this.serialize();
    if (this._history.length > 0) {
      const last = JSON.stringify(this._history[this._histIdx]);
      if (last === JSON.stringify(snap)) return;
    }
    this._history = this._history.slice(0, this._histIdx + 1);
    this._history.push(snap);
    if (this._history.length > MAX_HISTORY) this._history.shift();
    this._histIdx = this._history.length - 1;
  }

  pushHistory() { this._pushHistory(); }

  undo() {
    if (this._histIdx > 0) {
      this._navigating = true;
      this._histIdx--;
      this.load(this._history[this._histIdx], true);
      this._navigating = false;
      return true;
    }
    return false;
  }

  redo() {
    if (this._histIdx < this._history.length - 1) {
      this._navigating = true;
      this._histIdx++;
      this.load(this._history[this._histIdx], true);
      this._navigating = false;
      return true;
    }
    return false;
  }

  /* ── Persistence ─────────────────────────────────────────────── */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.serialize()));
    } catch (e) { /* quota exceeded – silent */ }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      this.load(JSON.parse(raw));
      return true;
    } catch (e) { return false; }
  }

  /* ── Reactive Proxy ──────────────────────────────────────────── */
  _makeProxy(target, path = []) {
    const self = this;
    return new Proxy(target, {
      get(obj, prop) {
        const val = obj[prop];
        if (val !== null && typeof val === 'object') {
          return self._makeProxy(val, [...path, prop]);
        }
        return val;
      },
      set(obj, prop, value) {
        if (obj[prop] === value) return true;
        obj[prop] = value;
        const fullPath = [...path, prop].join('.');
        const scope    = path.length ? path[0] : prop;
        self._emit(fullPath, value, scope);
        return true;
      },
    });
  }
}
