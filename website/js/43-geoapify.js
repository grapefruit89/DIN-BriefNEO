// @ts-check
// @guide [[geoapify-autocomplete]] 

import { StorageManager } from './51-storage.js';
import { AddressIntelligence } from './45-address-intelligence.js';

/**
 * @typedef {object} AddressEntry
 * @property {string} street
 * @property {string} housenumber
 * @property {string} postcode
 * @property {string} city
 * @property {string} formatted
 * @property {string} [source]
 */

/**
 * @param {{ onToast: ((msg: string, type?: string) => void) | null, onSaveDraft: (() => void) | null }} params
 */
export function initAddressServices({ onToast, onSaveDraft }) {
  const inputGeoapifyKey = /** @type {HTMLInputElement | null} */ (document.getElementById('input-geoapify-key'));
  const geoapifyKeyContainer = document.getElementById('geoapify-key-container');
  const inputAddressSearch = /** @type {HTMLInputElement | null} */ (document.getElementById('input-anschrift-suche'));
  const addressSuggestions = document.getElementById('anschrift-vorschlaege');
  const addressSearchContainer = document.getElementById('anschrift-suche-container');

  if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !geoapifyKeyContainer || !addressSearchContainer) return;

  /** @type {AbortController | null} */
  let activeAbortController = null;
  /** @type {any} */
  let debounceSearchTimeout = null;
  /** @type {any} */
  let keyDebounceTimeout = null;
  /** @type {AddressEntry[]} */
  let renderedSuggestions = [];
  let activeSuggestionIndex = -1;

  // Load initial settings
  const savedKey = StorageManager.loadGeoapifyKey() || '';
  inputGeoapifyKey.value = savedKey;

  // Key input handler with Heartbeat Validation
  inputGeoapifyKey.addEventListener('input', () => {
    clearTimeout(keyDebounceTimeout);
    const val = inputGeoapifyKey.value.trim();

    keyDebounceTimeout = setTimeout(async () => {
      if (!val) {
        StorageManager.saveGeoapifyKey('');
        return;
      }
      validateKeyWithHeartbeat(val);
    }, 500);
  });

  // Double click to reset key
  inputAddressSearch.addEventListener('dblclick', () => {
    if(confirm("Geoapify API-Key ändern?")) {
      StorageManager.saveGeoapifyKey('');
      inputGeoapifyKey.value = '';
    }
  });

  /**
   * @param {string} key
   */
  async function validateKeyWithHeartbeat(key) {
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1&apiKey=${encodeURIComponent(key)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        StorageManager.saveGeoapifyKey(key);
        /* Kein Success-Toast (TOASTS-Policy in 51-storage.js: Erfolg ist
         * still; assertive Alerts nur für Fehler. Grok-Re-Review Priorität 3.) */
      } else if (res.status === 401 || res.status === 403) {
        StorageManager.saveGeoapifyKey('');
        if (onToast) onToast("❌ Geoapify Key ungültig", "error");
      } else {
        // 429/5xx: Key behalten und still bleiben
        StorageManager.saveGeoapifyKey(key);
      }
    } catch (err) {
      // Netzwerk/Timeout: Key behalten und still bleiben
      StorageManager.saveGeoapifyKey(key);
    }
  }



  // --- LOCAL ADDRESS BOOK FEATURE ---
  /**
   * @returns {AddressEntry[]}
   */
  function getLocalAddressBook() {
    return /** @type {AddressEntry[]} */ (StorageManager.loadLocalAddresses());
  }

  /**
   * @param {AddressEntry} item
   */
  function saveToLocalAddressBook(item) {
    const book = getLocalAddressBook();
    // Check if already exists (by formatted string)
    if (!book.find(entry => entry.formatted === item.formatted)) {
      book.unshift(item); // Add to top
      if (book.length > 50) book.pop(); // Keep max 50
      StorageManager.saveLocalAddresses(book);
    }
  }

  /**
   * @param {string} query
   * @returns {AddressEntry[]}
   */
  function fuzzySearchLocal(query) {
    const book = getLocalAddressBook();
    const q = query.toLowerCase();
    return book.filter(item => item.formatted.toLowerCase().includes(q)).slice(0, 5);
  }

  
  // Geoapify In-Memory Cache (verhindert doppelte API-Calls für dieselben Strings)
  /** @type {Map<string, AddressEntry[]>} */
  const apiCache = new Map();

  // Tastatursteuerung fuer das native Listbox-Popover.
  inputAddressSearch.addEventListener('keydown', (event) => {
    if (!renderedSuggestions.length) return;
    const key = event.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const direction = key === 'ArrowDown' ? 1 : -1;
      activeSuggestionIndex = (activeSuggestionIndex + direction + renderedSuggestions.length) % renderedSuggestions.length;
      addressSuggestions.querySelectorAll('[role=option]').forEach((option, index) => {
        option.setAttribute('aria-selected', String(index === activeSuggestionIndex));
      });
      inputAddressSearch.setAttribute('aria-activedescendant', `anschrift-vorschlag-${activeSuggestionIndex}`);
    } else if (key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      selectSuggestion(renderedSuggestions[activeSuggestionIndex]);
    } else if (key === 'Escape') {
      activeSuggestionIndex = -1;
      inputAddressSearch.removeAttribute('aria-activedescendant');
    }
  });

  // Optimierter Input Handler
  inputAddressSearch.addEventListener('input', () => {
    clearTimeout(debounceSearchTimeout);
    const query = inputAddressSearch.value.trim();

    if (query.length < 3) {
      try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch(e) {}
      return;
    }

    // 1. INSTANT LOCAL SEARCH: Ohne Debounce sofort anzeigen! (0ms Latenz)
    const localMatches = fuzzySearchLocal(query);
    localMatches.forEach(m => m.source = 'local');
    renderSuggestions(localMatches, query, false);

    // 2. REMOTE SEARCH (Debounced)
    debounceSearchTimeout = setTimeout(() => {
      performAddressSearch(query, localMatches);
    }, 200); // Reduziert von 300ms auf 200ms für ein "snappier" Gefühl
  });

  /**
   * @param {string} query
   * @param {AddressEntry[]} localMatches
   */
  async function performAddressSearch(query, localMatches) {
    if (activeAbortController) activeAbortController.abort();
    activeAbortController = new AbortController();

    if (!navigator.onLine) return;

    const key = StorageManager.loadGeoapifyKey();
    if (!key) return;

    // 3. CACHE HIT: Sofortiges Rendering ohne Netzwerk!
    /* Lock-sensitiver Cache-Key: dieselbe Straße unter verschiedenen
     * Ziel-PLZ liefert verschiedene Treffer. */
    const lock = AddressIntelligence.targetLock;
    const cacheKey = `${lock ? lock.plz + ' ' : ''}${query}`.toLowerCase();
    if (apiCache.has(cacheKey)) {
      mergeAndRender(localMatches, apiCache.get(cacheKey) || [], query);
      return;
    }

    let fetchOptions = {
      signal: AbortSignal.any([activeAbortController.signal, AbortSignal.timeout(8000)]),
    };
    const coords = StorageManager.loadSenderCoords();

    /* Target Lock (Audit H2): Geoapify kennt keinen `postcode:`-Filter-Typ
     * (apidocs: filter-Typen sind countrycode/type/boundary/place) und
     * mehrere filter= Params überschreiben sich gegenseitig. Das
     * dokumentierte Pattern für "Straße, PLZ Ort" ist die Text-Anreicherung. */
    const searchText = lock ? `${query}, ${lock.plz} ${lock.city}` : query;
    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&apiKey=${encodeURIComponent(key)}&lang=de&limit=5&format=json&filter=countrycode:de`;
    if (!lock && coords && coords.lat && coords.lon) {
      url += `&bias=proximity:${coords.lon},${coords.lat}`;
    }

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        /* 🚨 ARCHITECTURAL GUARD (H2): Der Key wird NUR bei HTTP 401/403
         * gelöscht. NIEMALS bei 429/5xx/Timeout/Netzwerk — der alte Bug
         * meldete temporäre Fehler als "Key ungültig" und vernichtete ihn. */
        if (response.status === 401 || response.status === 403) {
          StorageManager.saveGeoapifyKey('');
          const keyEl = /** @type {HTMLInputElement | null} */ (document.getElementById('input-geoapify-key'));
          if (keyEl) keyEl.value = '';
          if (onToast) onToast('❌ Geoapify API-Key ist ungültig oder abgelaufen! Bitte neu eintragen.', 'error');
        } else {
          console.warn('[Address] Autocomplete HTTP ' + response.status);
          if (onToast) onToast('⚠️ Geoapify vorübergehend nicht erreichbar (Status ' + response.status + ').', 'warning');
        }
        return;
      }
      const data = await response.json();

      /** @type {AddressEntry[]} */
      const parsedSuggestions = (data.results || []).map((/** @type {any} */ p) => {
        return {
          street: p.street || "",
          housenumber: p.housenumber || "",
          postcode: p.postcode || "",
          city: p.city || "",
          formatted: p.formatted || [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(", "),
          source: 'geoapify'
        };
      }).filter((/** @type {AddressEntry} */ s) => s.street && s.city);

      // Speichere die Remote-Antwort im Cache
      apiCache.set(cacheKey, parsedSuggestions);

      mergeAndRender(localMatches, parsedSuggestions, query);
    } catch (err) {
      const error = /** @type {Error} */ (err);
      if (error.name !== 'AbortError') {
        /* Netzwerk-/Timeout-Fehler: Key bleibt unangetastet (Audit H2). */
        console.warn('[Address] Autocomplete search failed:', error);
        if (onToast) onToast('⚠️ Geoapify-Suche fehlgeschlagen (Netzwerk?). Der Key bleibt erhalten.', 'warning');
      }
    }
  }

  /**
   * @param {AddressEntry[]} localMatches 
   * @param {AddressEntry[]} remoteMatches 
   * @param {string} query 
   */
  function mergeAndRender(localMatches, remoteMatches, query) {
    /** @type {AddressEntry[]} */
    const combined = [...localMatches];
    remoteMatches.forEach(ps => {
      if (!combined.find(c => c.formatted === ps.formatted)) {
        combined.push(ps);
      }
    });
    renderSuggestions(combined, query, true);
  }

  /**
   * @param {AddressEntry[]} suggestions
   * @param {string} query
   * @param {boolean} allowZeroClick
   */
  function renderSuggestions(suggestions, query, allowZeroClick) {
    if (!addressSuggestions) return;
    addressSuggestions.replaceChildren();
    renderedSuggestions = suggestions.slice(0, 5);
    activeSuggestionIndex = -1;
    inputAddressSearch?.removeAttribute('aria-activedescendant');

    if (suggestions.length === 0) {
      try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch(e) {}
      return;
    }

    if (allowZeroClick && suggestions.length > 5) {
      renderedSuggestions = [];
      const status = document.createElement('li');
      status.setAttribute('role', 'status');
      status.textContent = `${suggestions.length} Treffer – bitte PLZ oder Straße ergänzen`;
      addressSuggestions.appendChild(status);
      try { (/** @type {HTMLElement & { showPopover: () => void }} */ (addressSuggestions)).showPopover(); } catch(e) {}
      return;
    }

    renderedSuggestions.forEach((item, index) => {
      const li = document.createElement('li');
      li.id = `anschrift-vorschlag-${index}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      // Use textContent to avoid innerHTML vulnerabilities (Antipattern Fix)
      li.textContent = item.formatted;
      
      if (item.source === 'local') {
         const badge = document.createElement('span');
         badge.textContent = "⭐ Lokal";
         badge.className = "badge-local";
         li.appendChild(badge);
      }
      
      li.addEventListener('click', () => {
        selectSuggestion(item);
      });

      addressSuggestions.appendChild(li);
    });

    try { (/** @type {HTMLElement & { showPopover: () => void }} */ (addressSuggestions)).showPopover(); } catch(e) {}
  }

  /**
   * @param {AddressEntry} item
   */
  function selectSuggestion(item) {
    const empfStrasse = document.getElementById('empfaenger-strasse');
    const empfOrt = document.getElementById('empfaenger-ort');

    if (empfStrasse) {
      empfStrasse.textContent = `${item.street} ${item.housenumber}`.trim();
    }
    if (empfOrt) {
      empfOrt.textContent = `${item.postcode} ${item.city}`.trim();
    }

    try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch(e) {}
    if (inputAddressSearch) inputAddressSearch.value = '';

    // Save selected address to local address book for future offline usage
    saveToLocalAddressBook(item);

    if (onSaveDraft) onSaveDraft();
    /* Kein Success-Toast (TOASTS-Policy: still bei Erfolg) */
  }

  // NOTE: document click listener removed because popover="auto" natively handles outside clicks!

  // --- TIER 1: OFFLINE ADDRESS INTELLIGENCE (72 KB BROTLI ENGINE) ---
  AddressIntelligence.init().then(() => {
    AddressIntelligence.wireDOM({ onToast, onSaveDraft });
  });

  // Geoapify für Absender PLZ → speichert Lat/Lon für Proximity Bias (kein zweiter Host nötig)
  const absenderPlzOrtEl = document.getElementById('absender-ort') || document.getElementById('rucksendezeile');
  if (absenderPlzOrtEl) {
    /** @type {any} */
    let absenderTimeout = null;
    absenderPlzOrtEl.addEventListener('input', () => {
      if (!navigator.onLine) return;
      clearTimeout(absenderTimeout);
      absenderTimeout = setTimeout(() => {
        const key = StorageManager.loadGeoapifyKey();
        if (!key) return;
        const text = absenderPlzOrtEl.textContent ? absenderPlzOrtEl.textContent.trim() : '';
        const match = text.match(/(\d{5})/);
        if (match) {
          const plz = match[1];
          fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(plz)}&type=postcode&filter=countrycode:de&format=json&apiKey=${encodeURIComponent(key)}&limit=1`, {
              signal: AbortSignal.timeout(8000),
            })
            .then(r => r.json())
            .then(data => {
              if (data && data.results && data.results.length > 0) {
                const result = data.results[0];
                if (result.lat && result.lon) {
                  StorageManager.saveSenderCoords({ lat: result.lat, lon: result.lon });
                }
              }
            }).catch(() => {});
        }
      }, 500);
    });
  }
}


