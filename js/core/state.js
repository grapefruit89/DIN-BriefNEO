/**
 * js/core/state.js — Central State Authority (V13 Platinum)
 * DIN-BriefNEO | SPEC-007, ADR-003
 * ─────────────────────────────────────────────────────────
 * ES6 Module. Zero DOM. Zero Side-Effects.
 *
 * CONFIG-ZWEIG ELIMINIERT (2026-03-20 / ANTI-025):
 *   state.config.* existiert nicht mehr.
 *   Config-State lebt in #paper.dataset.* (HTML-Attribut).
 *   Nur noch: content (Brieffelder) + profile (Absender-Daten).
 *
 * Cursor-Safety-Contract:
 *   DOM-Schreiber in ui.js prüfen document.activeElement
 *   bevor sie ein fokussiertes Feld überschreiben.
 */

export const STORAGE_KEY = 'neo_brief_state_v13';

export const DEFAULT_STATE = Object.freeze({
  content: {
    date:             '',
    subject:          '',
    salutation:       '',
    body:             '',
    greeting:         '',
    signatureName:    '',
    returnAddress:    '',
    recipientName:    '',
    specialNote:      '',
    // Erweiterte Felder (für zukünftige Specs)
    senderName:       '',
    senderStreet:     '',
    senderZipCity:    '',
    senderPhone:      '',
    senderEmail:      '',
  },
  profile: {
    company: '', name:  '',  street: '',
    zip:     '', city:  '',  phone:  '',
    email:   '', iban:  '',
  },
});

const MAX_HISTORY = 60;
const clone = obj => JSON.parse(JSON.stringify(obj));

export class StateManager {
  constructor() {
    this._raw      = clone(DEFAULT_STATE);
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

  load(data, keepHistory = false) {
    const incoming = data ? clone(data) : clone(DEFAULT_STATE);

    // Reset: Profil erhalten, Content leeren
    if (!data) incoming.profile = clone(this._raw.profile);

    // Merge: neue DEFAULT_STATE-Keys immer präsent
    const merged = clone(DEFAULT_STATE);
    ['content', 'profile'].forEach(k => {
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
      if (JSON.stringify(this._history[this._histIdx]) === JSON.stringify(snap)) return;
    }
    this._history = this._history.slice(0, this._histIdx + 1);
    this._history.push(snap);
    if (this._history.length > MAX_HISTORY) this._history.shift();
    this._histIdx = this._history.length - 1;
  }

  pushHistory() { this._pushHistory(); }

  undo() {
    if (this._histIdx <= 0) return false;
    this._navigating = true;
    this._histIdx--;
    this.load(this._history[this._histIdx], true);
    this._navigating = false;
    return true;
  }

  redo() {
    if (this._histIdx >= this._history.length - 1) return false;
    this._navigating = true;
    this._histIdx++;
    this.load(this._history[this._histIdx], true);
    this._navigating = false;
    return true;
  }

  /* ── LocalStorage ────────────────────────────────────────────── */
  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.serialize())); }
    catch { /* quota exceeded — silent */ }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      this.load(JSON.parse(raw));
      return true;
    } catch { return false; }
  }

  /* ── Reactive Proxy ──────────────────────────────────────────── */
  _makeProxy(target, path = []) {
    const self = this;
    return new Proxy(target, {
      get(obj, prop) {
        const val = obj[prop];
        if (val !== null && typeof val === 'object')
          return self._makeProxy(val, [...path, prop]);
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
