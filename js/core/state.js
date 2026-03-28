/**
 * js/core/state.js — Central State Authority (IMR 4.0)
 * [ADR-013] Isomorphic State Mapping
 */

import { temporalReviver } from './temporal-utils.js';

export const STORAGE_KEY = 'neo_brief_state_v14_master';

export const DEFAULT_STATE = Object.freeze({
  content: {
    // 1. Identität (Atome)
    sender_fn:      '',
    sender_ln:      '',
    sender_st:      '',
    sender_city:    '',

    // 2. Anschriftzone (Atome)
    return_line:    '',
    supplement:     '',
    rect_co:        '',
    rect_name:      '',
    rect_st:        '',
    rect_city:      '',

    // 3. Metadaten
    ref_ihr:        '',
    ref_unser:      '',
    date:           '',

    // 4. Brief-Kern
    subject:        '',
    salutation:     '',
    body:           '', // Wir behalten 'body' als Key für Kompatibilität mit dem Markdown-Parser
    greeting:       '',
    signature:      '',
    attachments:    '',

    // 5. Abschluss
    footer:         '',
  },
  config: {
    layout:     'form-b',
    guides:     true,
    theme:      'day',
    dateFormat: 'de',
    profiles:   {}
  },
  profile: {
    fn: '', ln: '', street: '', city: '', iban: '',
  },
});

const clone = obj => JSON.parse(JSON.stringify(obj));

export class StateManager {
  constructor() {
    this._raw      = clone(DEFAULT_STATE);
    this._listeners = new Set();
    this.state = this._makeProxy(this._raw);
  }

  subscribe(fn)   { this._listeners.add(fn); }
  unsubscribe(fn) { this._listeners.delete(fn); }
  _emit(path, value, scope) { this._listeners.forEach(fn => fn(path, value, scope)); }

  serialize() { return clone(this._raw); }
  
  save() { 
    // Passive Persistence: IOCoordinator handles this
    console.debug('[StateManager] Internal State Updated.');
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      this.load(JSON.parse(raw, temporalReviver));
      return true;
    } catch { return false; }
  }

  load(data) {
    const incoming = data ? clone(data) : clone(DEFAULT_STATE);
    this._raw  = incoming;
    this.state = this._makeProxy(this._raw);
    this._emit('root', this._raw, 'load');
  }

  updateFromOPFS(data) {
    if (!data) return;
    Object.keys(data).forEach(section => {
      if (this._raw[section] && typeof data[section] === 'object') {
        Object.keys(data[section]).forEach(key => {
            this._raw[section][key] = temporalReviver(key, data[section][key]);
        });
      } else {
        this._raw[section] = temporalReviver(section, data[section]);
      }
    });
    this._emit('root', this._raw, 'opfs');
  }

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
        self._emit(fullPath, value, scope, 'proxy');
        return true;
      },
    });
  }
}
