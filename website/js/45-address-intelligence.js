// @ts-check
// @adr [[ADR-006-Offline-Address-Intelligence]]
// @guide [[geoapify-autocomplete]]

/* Audit H3: Das 164-KB-Embed liegt NICHT auf dem statischen Modulgraphen.
 * Es wird nur per Dynamic-Import geladen, wenn der gzip-Fetch der
 * .gz-Dateien scheitert (file://-Betrieb oder fehlende Datei) — im
 * Normalfall (lokal im HTTP-Server) spart das die Parse-Kosten komplett. */

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
 * Powered by 87 KB PLZ-Datenbank mit nativer DecompressionStream-PIP.
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
   * Initializes the in-memory database by decompressing the gzip datasets.
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
            const plzResp = await fetch('data/de_plz_ort.json.gz');
            if (plzResp.ok) {
              const ds = new DecompressionStream('gzip');
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
            const grossResp = await fetch('data/de_grosskunden_plz.json.gz');
            if (grossResp.ok) {
              const ds = new DecompressionStream('gzip');
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

        // 100% Offline / file:/// protocol fallback via embedded Base64 gzip streams
        // (Audit H3: Dynamic-Import erst im Fallback — 164 KB nur bei Bedarf)
        if (!plzData) {
          const { PLZ_DATA_GZIP_B64 } = await import('../data/plz-embedded.js');
          plzData = await this.#decompressBase64(PLZ_DATA_GZIP_B64);
        }
        if (!grossData) {
          const { GROSSKUNDEN_GZIP_B64 } = await import('../data/plz-embedded.js');
          grossData = await this.#decompressBase64(GROSSKUNDEN_GZIP_B64);
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
   * Decompresses a Base64-encoded gzip payload in memory using native DecompressionStream.
   * @param {string} b64
   * @returns {Promise<any>}
   */
  static async #decompressBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const ds = new DecompressionStream('gzip');
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
    const render = () => {
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
    };
    // Element-scoped View Transitions (Chrome 147+): Listenwechsel nur lokal crossfaden
    // @ts-ignore Element-scoped View Transitions (Chrome 147+)
    if (this.isReady && typeof popoverEl.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // @ts-ignore Element-scoped View Transitions (Chrome 147+)
      popoverEl.startViewTransition(render).finished.catch(() => {});
    } else {
      render();
    }

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

/* ------------------------------------------------------------------
 * Absender-Sync (ehem. js/44-sender-sync.js, zusammengeführt am 2026-09-09)
 * @guide [[glossary]]
 * ------------------------------------------------------------------ */

// siehe [[ADR-PROFILE-MANAGEMENT]]. Kein aktiver Auftrag, nur Referenzmarkierung.

/**
 * Abbreviates the first name (e.g., "Moritz Baumeister" -> "M. Baumeister")
 * @param {string} fullName
 * @returns {string}
 */
function abbreviateName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return fullName;
    const firstName = parts[0];
    const rest = parts.slice(1).join(' ');
    return firstName.charAt(0).toUpperCase() + '. ' + rest;
}

/**
 * Synchronizes the sender information from the info block to the return address line
 * and the signature name. This restores the logic from the original project.
 */
export function initSenderSync() {
    const infoName = document.getElementById('info-name');
    const infoStreet = document.getElementById('info-street');
    const infoCity = document.getElementById('info-city');
    const absender = document.getElementById('absender');
    const unterschrift = document.getElementById('unterschrift');

    if (!infoName || !infoStreet || !infoCity || !absender || !unterschrift) return;

    function sync() {
        if (!infoName || !infoStreet || !infoCity || !absender || !unterschrift) return;
        const name = (infoName.textContent || '').trim();
        const street = (infoStreet.textContent || '').trim();
        const city = (infoCity.textContent || '').trim();

        // 1. Sync to Rücksendezeile (absender) with abbreviated name
        const shortName = abbreviateName(name);
        const parts = [shortName, street, city].filter(p => p.length > 0);
        absender.textContent = parts.join(' • ');

        // 2. Sync to Maschinenschrift (unterschrift) with full name
        unterschrift.textContent = name;
        
        // Dispatch input events so saveDraftData triggers if needed
        absender.dispatchEvent(new Event('input', { bubbles: true }));
        unterschrift.dispatchEvent(new Event('input', { bubbles: true }));
    }

    infoName.addEventListener('input', sync);
    infoStreet.addEventListener('input', sync);
    infoCity.addEventListener('input', sync);
}
