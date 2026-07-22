// @ts-check
// @guide [[geoapify-autocomplete]] 

import { StorageManager } from '../30-utils/02-storage.js';

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
  const inputAddressSearch = /** @type {HTMLInputElement | null} */ (document.getElementById('input-address-search'));
  const addressSuggestions = document.getElementById('address-suggestions');
  const addressSearchContainer = document.getElementById('address-search-container');

  if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !geoapifyKeyContainer || !addressSearchContainer) return;

  /** @type {AbortController | null} */
  let activeAbortController = null;
  /** @type {any} */
  let debounceSearchTimeout = null;
  /** @type {any} */
  let keyDebounceTimeout = null;

  // Load initial settings
  const savedKey = StorageManager.loadGeoapifyKey() || '';
  inputGeoapifyKey.value = savedKey;

  // Initial validation check if we have a key
  if (savedKey.trim()) {
    validateKeyWithHeartbeat(savedKey.trim());
  } else {
    setUIMode('no_key');
  }

  // Key input handler with Heartbeat Validation
  inputGeoapifyKey.addEventListener('input', () => {
    clearTimeout(keyDebounceTimeout);
    const val = inputGeoapifyKey.value.trim();

    keyDebounceTimeout = setTimeout(async () => {
      if (!val) {
        StorageManager.saveGeoapifyKey('');
        setUIMode('no_key');
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
      setUIMode('no_key');
    }
  });

  /**
   * @param {string} key
   */
  async function validateKeyWithHeartbeat(key) {
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1`, {
        headers: { "X-Api-Key": key }
      });
      if (res.ok) {
        StorageManager.saveGeoapifyKey(key);
        setUIMode('has_key');
        if (onToast) onToast("🔑 Geoapify Key gültig!", "success");
      } else {
        setUIMode('invalid_key');
        if (onToast) onToast("❌ Geoapify Key ungültig", "error");
      }
    } catch (err) {
      setUIMode('invalid_key');
      if (onToast) onToast("❌ Fehler bei der Key-Validierung", "error");
    }
  }

  /**
   * @param {string} mode
   */
  function setUIMode(mode) {
    const wrapper = document.getElementById('geoapify-wrapper');
    if (!wrapper || !inputAddressSearch || !addressSuggestions) return;
    
    wrapper.classList.toggle('has-api-key', mode === 'has_key');
    
    if (mode === 'has_key') {
      inputAddressSearch.disabled = false;
    } else {
      inputAddressSearch.disabled = true;
      inputAddressSearch.value = '';
      try { /** @type {any} */ (addressSuggestions).hidePopover(); } catch(e) {}
    }
  }

  // --- LOCAL ADDRESS BOOK FEATURE ---
  /**
   * @returns {AddressEntry[]}
   */
  function getLocalAddressBook() {
    try {
      const saved = localStorage.getItem('din_local_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
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
      localStorage.setItem('din_local_addresses', JSON.stringify(book));
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

  /**
   * @param {string} text
   * @param {string} query
   * @returns {string}
   */
  function highlightMatch(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<b>$1</b>');
  }

  // Debounced Search input handler (300ms)
  inputAddressSearch.addEventListener('input', () => {
    clearTimeout(debounceSearchTimeout);
    const query = inputAddressSearch.value.trim();

    if (query.length < 3) {
      addressSuggestions.style.display = 'none';
      return;
    }

    debounceSearchTimeout = setTimeout(() => {
      performAddressSearch(query);
    }, 300);
  });

  /**
   * @param {string} query
   */
  async function performAddressSearch(query) {
    if (activeAbortController) activeAbortController.abort();
    activeAbortController = new AbortController();

    const localMatches = fuzzySearchLocal(query);
    localMatches.forEach(m => m.source = 'local');

    const key = StorageManager.loadGeoapifyKey();
    if (!key) {
      // Nur lokale Suche rendern, wenn kein Key
      renderSuggestions(localMatches, query);
      return;
    }

    let fetchOptions = { 
      signal: activeAbortController.signal,
      headers: { "X-Api-Key": key }
    };

    // Load cached sender coordinates for Proximity-Biasing
    let coords = null;
    try {
      const savedCoords = localStorage.getItem('din_sender_coords');
      coords = savedCoords ? JSON.parse(savedCoords) : null;
    } catch (e) {}

    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=de&limit=5`;
    if (coords && coords.lat && coords.lon) {
      url += `&bias=proximity:${coords.lon},${coords.lat}`;
    }

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) throw new Error('API Request failed');
      const data = await response.json();

      /** @type {AddressEntry[]} */
      const parsedSuggestions = (data.features || []).map((/** @type {any} */ f) => {
        const p = f.properties;
        return {
          street: p.street || "",
          housenumber: p.housenumber || "",
          postcode: p.postcode || "",
          city: p.city || "",
          formatted: [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(", "),
          source: 'geoapify'
        };
      }).filter((/** @type {AddressEntry} */ s) => s.street && s.city);

      // Merge local and geoapify, avoiding exact duplicates
      /** @type {AddressEntry[]} */
      const combined = [...localMatches];
      parsedSuggestions.forEach(ps => {
        if (!combined.find(c => c.formatted === ps.formatted)) {
          combined.push(ps);
        }
      });

      renderSuggestions(combined.slice(0, 6), query);
    } catch (err) {
      const error = /** @type {any} */ (err);
      if (error.name !== 'AbortError') {
        console.warn('[Address] Autocomplete search failed:', error);
        
        // Wenn der API Call fehlschlägt, ist der Key vermutlich tot
        StorageManager.saveGeoapifyKey('');
        const keyEl = /** @type {HTMLInputElement | null} */ (document.getElementById('input-geoapify-key'));
        if (keyEl) keyEl.value = '';
        setUIMode('no_key');
        if (onToast) onToast("❌ Geoapify API-Key ist ungültig oder abgelaufen! Bitte neu eintragen.", 'error');
        
        try { /** @type {any} */ (addressSuggestions).hidePopover(); } catch(e) {}
      }
    }
  }

  /**
   * @param {AddressEntry[]} suggestions
   * @param {string} query
   */
  function renderSuggestions(suggestions, query) {
    if (!addressSuggestions) return;
    addressSuggestions.replaceChildren();

    if (suggestions.length === 0) {
      try { /** @type {any} */ (addressSuggestions).hidePopover(); } catch(e) {}
      return;
    }

    suggestions.forEach(item => {
      const li = document.createElement('li');
      // Use textContent to avoid innerHTML vulnerabilities (Antipattern Fix)
      li.textContent = item.formatted;
      
      if (item.source === 'local') {
         const badge = document.createElement('span');
         badge.textContent = "⭐ Lokal";
         badge.style.cssText = "float:right; font-size: 0.65rem; color: var(--accent-color); background: var(--segment-bg); padding: 2px 4px; border-radius: 4px;";
         li.appendChild(badge);
      }
      
      li.addEventListener('click', () => {
        selectSuggestion(item);
      });

      addressSuggestions.appendChild(li);
    });

    try { /** @type {any} */ (addressSuggestions).showPopover(); } catch(e) {}
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

    try { /** @type {any} */ (addressSuggestions).hidePopover(); } catch(e) {}
    if (inputAddressSearch) inputAddressSearch.value = '';

    // Save selected address to local address book for future offline usage
    saveToLocalAddressBook(item);

    if (onSaveDraft) onSaveDraft();
    if (onToast) onToast("Adresse übernommen & gespeichert", 'success');
  }

  // NOTE: document click listener removed because popover="auto" natively handles outside clicks!

  // --- ZIPPOPOTAM PLZ AUTO-LOOKUP ---
  const empfOrtEl = document.getElementById('empfaenger-ort');
  if (empfOrtEl) {
    empfOrtEl.addEventListener('input', () => {
      const text = empfOrtEl.textContent ? empfOrtEl.textContent.trim() : '';
      const plzMatch = text.match(/^(\d{5})$/);
      if (plzMatch) {
        const plz = plzMatch[1];
        fetch(`https://api.zippopotam.us/de/${plz}`)
          .then(r => r.json())
          .then(data => {
            if (data && data.places && data.places.length > 0) {
              const ort = data.places[0]["place name"];
              const neu = `${plz} ${ort}`;
              if (text !== neu) {
                empfOrtEl.textContent = neu;
                
                // Cursor ans Ende setzen
                const selection = window.getSelection();
                if (selection) {
                  const range = document.createRange();
                  range.selectNodeContents(empfOrtEl);
                  range.collapse(false);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }

                if (onSaveDraft) onSaveDraft();
              }
            }
          }).catch(() => {});
      }
    });
  }

  // Zippopotam für Absender PLZ -> speichert Lat/Lon für Geoapify Proximity Bias
  const absenderPlzOrtEl = document.getElementById('absender-plz-ort');
  if (absenderPlzOrtEl) {
    /** @type {any} */
    let absenderTimeout = null;
    absenderPlzOrtEl.addEventListener('input', () => {
      clearTimeout(absenderTimeout);
      absenderTimeout = setTimeout(() => {
        const text = absenderPlzOrtEl.textContent ? absenderPlzOrtEl.textContent.trim() : '';
        const match = text.match(/(\d{5})/);
        if (match) {
          const plz = match[1];
          fetch(`https://api.zippopotam.us/de/${plz}`)
            .then(r => r.json())
            .then(data => {
              if (data && data.places && data.places.length > 0) {
                const place = data.places[0];
                const lat = place.latitude;
                const lon = place.longitude;
                localStorage.setItem('din_sender_coords', JSON.stringify({ lat, lon }));
              }
            }).catch(() => {});
        }
      }, 500);
    });
  }
}
