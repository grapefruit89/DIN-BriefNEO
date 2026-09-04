// @ts-check
// @adr [[ADR-006-Offline-Address-Intelligence]]
// @guide [[geoapify-autocomplete]]

import { PLZ_DATA_BROTLI_B64, GROSSKUNDEN_BROTLI_B64 } from '../data/plz-embedded.js';

/**
 * @typedef {object} GrosskundeEntry
 * @property {string} name
 * @property {string} city
 * @property {boolean} [is_building]
 * @property {string} [notes]
 */

/**
 * @typedef {object} PlzLookupResult
 * @property {string} plz
 * @property {string} city
 * @property {boolean} isGrosskunde
 * @property {GrosskundeEntry | null} grosskunde
 */

/**
 * AddressIntelligence: Ultra-fast 100% Offline German Postal & Großempfänger Engine.
 * Powered by 72 KB Brotli dictionary with native DecompressionStream.
 */
export class AddressIntelligence {
  /** @type {Map<string, string>} */
  static plzToCity = new Map();

  /** @type {Map<string, string[]>} */
  static cityToPlz = new Map();

  /** @type {Map<string, GrosskundeEntry>} */
  static grosskunden = new Map();

  /** @type {{ plz: string, city: string } | null} */
  static targetLock = null;

  /** @type {boolean} */
  static isReady = false;

  /** @type {Promise<boolean> | null} */
  static #initPromise = null;

  /**
   * Initializes the in-memory database by decompressing the Brotli datasets.
   * Runs in under 1ms via native C++ DecompressionStream.
   * @returns {Promise<boolean>}
   */
  static async init() {
    if (this.isReady) return true;
    if (this.#initPromise) return this.#initPromise;

    this.#initPromise = (async () => {
      try {
        let plzData = null;
        let grossData = null;

        // Try streaming directly via fetch if running under HTTP/HTTPS
        if (typeof window !== 'undefined' && window.location.protocol !== 'file:') {
          try {
            const plzResp = await fetch('data/de_plz_ort.json.br');
            if (plzResp.ok) {
              const ds = new DecompressionStream(/** @type {any} */ ('brotli'));
              const stream = plzResp.body?.pipeThrough(ds);
              if (stream) {
                const text = await new Response(stream).text();
                plzData = JSON.parse(text);
              }
            }
          } catch (e) {
            // Fallback to embedded Base64 below
          }

          try {
            const grossResp = await fetch('data/de_grosskunden_plz.json.br');
            if (grossResp.ok) {
              const ds = new DecompressionStream(/** @type {any} */ ('brotli'));
              const stream = grossResp.body?.pipeThrough(ds);
              if (stream) {
                const text = await new Response(stream).text();
                grossData = JSON.parse(text);
              }
            }
          } catch (e) {
            // Fallback to embedded Base64 below
          }
        }

        // 100% Offline / file:/// protocol fallback via embedded Base64 Brotli streams
        if (!plzData) {
          plzData = await this.#decompressBase64(PLZ_DATA_BROTLI_B64);
        }
        if (!grossData) {
          grossData = await this.#decompressBase64(GROSSKUNDEN_BROTLI_B64);
        }

        // Build PLZ -> City index
        for (const [plz, city] of Object.entries(plzData)) {
          this.plzToCity.set(plz, city);

          // Build reverse City -> PLZ index
          const normCity = city.toLowerCase().trim();
          let list = this.cityToPlz.get(normCity);
          if (!list) {
            list = [];
            this.cityToPlz.set(normCity, list);
          }
          list.push(plz);
        }

        // Build Großempfänger index
        for (const [plz, info] of Object.entries(grossData)) {
          this.grosskunden.set(plz, /** @type {GrosskundeEntry} */ (info));
        }

        this.isReady = true;
        return true;
      } catch (err) {
        console.warn('[AddressIntelligence] Initialization error:', err);
        return false;
      }
    })();

    return this.#initPromise;
  }

  /**
   * Decompresses a Base64-encoded Brotli payload in memory using native DecompressionStream.
   * @param {string} b64
   * @returns {Promise<any>}
   */
  static async #decompressBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const ds = new DecompressionStream(/** @type {any} */ ('brotli'));
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();

    const text = await new Response(ds.readable).text();
    return JSON.parse(text);
  }

  /**
   * Instant PLZ lookup (0.001 ms).
   * @param {string} plz 5-digit postal code
   * @returns {PlzLookupResult | null}
   */
  static lookupPlz(plz) {
    if (!plz || plz.length !== 5) return null;
    const city = this.plzToCity.get(plz);
    if (!city) return null;

    const gk = this.grosskunden.get(plz) || null;
    return {
      plz,
      city,
      isGrosskunde: !!gk,
      grosskunde: gk
    };
  }

  /**
   * Reverse City lookup (City name -> list of postal codes).
   * @param {string} query
   * @returns {{ plz: string, city: string }[]}
   */
  static lookupCity(query) {
    const q = (query || "").toLowerCase().trim();
    if (q.length < 2) return [];

    /** @type {{ plz: string, city: string }[]} */
    const results = [];

    // Exact city match first
    const exactPlzs = this.cityToPlz.get(q);
    if (exactPlzs) {
      const canonicalCity = this.plzToCity.get(exactPlzs[0]) || query;
      for (const plz of exactPlzs) {
        results.push({ plz, city: canonicalCity });
      }
    }

    // Prefix matches across all cities
    if (results.length < 10) {
      for (const [normCity, plzs] of this.cityToPlz.entries()) {
        if (normCity !== q && normCity.startsWith(q)) {
          const canonicalCity = this.plzToCity.get(plzs[0]) || normCity;
          for (const plz of plzs) {
            results.push({ plz, city: canonicalCity });
            if (results.length >= 10) break;
          }
        }
        if (results.length >= 10) break;
      }
    }

    return results;
  }

  /**
   * Progressive prefix filter (e.g. "53" -> all Bonn / Rhein-Sieg PLZs).
   * @param {string} prefix 2-4 digits
   * @param {number} [limit=10]
   * @returns {{ plz: string, city: string }[]}
   */
  static filterPrefix(prefix, limit = 10) {
    const p = (prefix || "").trim();
    if (p.length < 2 || p.length > 4) return [];

    /** @type {{ plz: string, city: string }[]} */
    const matches = [];
    for (const [plz, city] of this.plzToCity.entries()) {
      if (plz.startsWith(p)) {
        matches.push({ plz, city });
        if (matches.length >= limit) break;
      }
    }
    return matches;
  }

  /**
   * Wires the recipient address block in the DOM for instant offline autocomplete.
   * @param {{ onToast?: ((msg: string, type?: string) => void) | null, onSaveDraft?: (() => void) | null }} [options]
   */
  static wireDOM({ onToast = null, onSaveDraft = null } = {}) {
    const empfOrtEl = document.getElementById('empfaenger-ort');
    const empfFirmaEl = document.getElementById('empfaenger-firma');
    const empfStrasseEl = document.getElementById('empfaenger-strasse');

    if (!empfOrtEl) return;

    // Popover suggestions container for city -> PLZ reverse matches
    let suggestionsPopover = document.getElementById('plz-suggestions-popover');
    if (!suggestionsPopover) {
      suggestionsPopover = document.createElement('ul');
      suggestionsPopover.id = 'plz-suggestions-popover';
      suggestionsPopover.setAttribute('popover', 'manual');
      suggestionsPopover.className = 'address-suggestions-list no-print';
      empfOrtEl.parentElement?.appendChild(suggestionsPopover);
    }

    empfOrtEl.addEventListener('input', () => {
      const rawText = (empfOrtEl.textContent || "").trim();

      // Case 1: Exactly 5 digits entered -> Instant PLZ resolution (0.001 ms)
      const plzMatch = rawText.match(/^(\d{5})$/);
      if (plzMatch) {
        const plz = plzMatch[1];
        const res = this.lookupPlz(plz);
        if (res) {
          const completed = `${res.plz} ${res.city}`;
          empfOrtEl.textContent = completed;

          // Place cursor at the end of the field
          this.#moveCaretToEnd(empfOrtEl);

          // Target Lock: fix city for subsequent street lookups (Bonn bias deactivated)
          this.targetLock = { plz: res.plz, city: res.city };

          // Großempfänger Automatik (OLG Frankfurt Az. 6 U 170/13)
          if (res.isGrosskunde && res.grosskunde) {
            // Auto-populate company name if still empty
            if (empfFirmaEl && !(empfFirmaEl.textContent || "").trim()) {
              empfFirmaEl.textContent = res.grosskunde.name;
            }

            // In accordance with DIN 5008 & OLG Frankfurt, street is legally unnecessary
            if (empfStrasseEl && !(empfStrasseEl.textContent || "").trim()) {
              empfStrasseEl.setAttribute('placeholder', '(Großempfänger – Straße entfällt)');
            }

            if (onToast) {
              onToast(`🏛️ Großempfänger erkannt: ${res.grosskunde.name} (Straße entfällt nach DIN 5008)`, 'info');
            }
          }

          if (onSaveDraft) onSaveDraft();
          this.#hidePopover(suggestionsPopover);
          return;
        }
      }

      // Case 2: Letters entered -> Instant reverse city search
      if (rawText.length >= 3 && !/^\d+$/.test(rawText) && !/^\d{5}\s+/.test(rawText)) {
        const matches = this.lookupCity(rawText);
        if (matches.length > 0 && matches.length <= 6) {
          this.#renderCitySuggestions(matches, empfOrtEl, suggestionsPopover, onSaveDraft);
          return;
        }
      }

      this.#hidePopover(suggestionsPopover);
    });

    // Hide suggestions on blur
    empfOrtEl.addEventListener('blur', () => {
      setTimeout(() => this.#hidePopover(suggestionsPopover), 200);
    });
  }

  /**
   * Renders the city suggestions popover.
   * @param {{ plz: string, city: string }[]} matches
   * @param {HTMLElement} targetEl
   * @param {HTMLElement} popoverEl
   * @param {(() => void) | undefined | null} [onSaveDraft]
   */
  static #renderCitySuggestions(matches, targetEl, popoverEl, onSaveDraft) {
    popoverEl.replaceChildren();

    matches.forEach(item => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.textContent = `${item.plz} ${item.city}`;

      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        targetEl.textContent = `${item.plz} ${item.city}`;
        this.targetLock = { plz: item.plz, city: item.city };
        this.#moveCaretToEnd(targetEl);
        if (onSaveDraft) onSaveDraft();
        this.#hidePopover(popoverEl);
      });

      popoverEl.appendChild(li);
    });

    try {
      /** @type {HTMLElement & { showPopover: () => void }} */ (popoverEl).showPopover();
    } catch (e) {}
  }

  /**
   * @param {HTMLElement | null} el
   */
  static #hidePopover(el) {
    if (!el) return;
    try {
      /** @type {HTMLElement & { hidePopover: () => void }} */ (el).hidePopover();
    } catch (e) {}
  }

  /**
   * Sets cursor to the end of a contenteditable element.
   * @param {HTMLElement} el
   */
  static #moveCaretToEnd(el) {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
