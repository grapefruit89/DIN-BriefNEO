/**
 * C:\Users\morit\Desktop\DIN-BriefNEO\js\core\state.js
 * Central State Authority (V13 Platinum)
 */

import { temporalReviver } from './temporal-utils.js';

export const STORAGE_KEY = 'neo_brief_state_v14_master';

export const DEFAULT_STATE = Object.freeze({
  content: {
    // 1. Identität & Branding
    header:         '',
    logo:           '',
    sender_details: '',
    vcard:          '',

    // 2. Anschriftzone
    address_zone:   '',
    return_line:    '',
    supplement:     '',
    recipient:      '',

    // 3. Metadaten & Leitwörter
    infoblock:      '',
    ref_line:       '',
    date:           '',

    // 4. Brief-Kern
    subject:        '',
    salutation:     '',
    body:           '',
    closing:        '',
    signature:      '',
    attachments:    '',

    // 5. Compliance & Sicherheit
    amount:         '',
    bank_data:      '',
    fiscal_data:    '',
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
    company: '', name:  '',  street: '',
    zip:     '', city:  '',  phone:  '',
    email:   '', iban:  '',
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
  
  /**
   * [TOMB-L008] Debouncing via setTimeout/setInterval is strictly forbidden.
   * Persistence is now handled via Phoenix Protocol (IOCoordinator) and Native IdleDetector API.
   */
  save() { 
    // No-op: IOCoordinator subscribes to changes and saves to OPFS.
    console.debug('[StateManager] Save triggered (Storage Agnostic)');
  }

  loadFromStorage() {
    try {
      // Temporary Fallback: Check if we still have migration data in localStorage
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

  /**
   * [AVIATION GRADE] Ingest data from OPFS
   */
  updateFromOPFS(data) {
    if (!data) return;
    
    // Perform a deep merge without triggering recursive saves
    // We update the _raw object directly and then emit a single 'opfs' scoped event
    Object.keys(data).forEach(section => {
      if (this._raw[section] && typeof data[section] === 'object') {
        Object.keys(data[section]).forEach(key => {
            // [CMD-3] Revive Temporal objects from OPFS strings
            this._raw[section][key] = temporalReviver(key, data[section][key]);
        });
      } else {
        this._raw[section] = temporalReviver(section, data[section]);
      }
    });

    this._emit('root', this._raw, 'opfs');
    console.info('[StateManager] Successfully merged OPFS state with Temporal Reviver.');
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
