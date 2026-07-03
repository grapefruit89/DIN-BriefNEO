// @adr [[ADR-API]] 
// @guide [[geoapify-autocomplete]] 

import { StorageManager } from './storage.js';

export function initAddressServices({ onToast, onSaveDraft }) {
  const inputGeoapifyKey = document.getElementById('input-geoapify-key');
  const geoapifyKeyContainer = document.getElementById('geoapify-key-container');
  const inputAddressSearch = document.getElementById('input-address-search');
  const addressSuggestions = document.getElementById('address-suggestions');
  const addressSearchContainer = document.getElementById('address-search-container');

  if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !geoapifyKeyContainer || !addressSearchContainer) return;

  let activeAbortController = null;
  let debounceSearchTimeout = null;
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

  function setUIMode(mode) {
    if (mode === 'has_key') {
      geoapifyKeyContainer.style.display = 'none';
      addressSearchContainer.style.display = 'flex';
      inputAddressSearch.disabled = false;
    } else {
      geoapifyKeyContainer.style.display = 'flex';
      addressSearchContainer.style.display = 'none';
      inputAddressSearch.disabled = true;
      inputAddressSearch.value = '';
      try { addressSuggestions.hidePopover(); } catch(e) {}
    }
  }

  // --- LOCAL ADDRESS BOOK FEATURE ---
  function getLocalAddressBook() {
    try {
      return JSON.parse(localStorage.getItem('din_local_addresses')) || [];
    } catch(e) { return []; }
  }

  function saveToLocalAddressBook(item) {
    const book = getLocalAddressBook();
    // Check if already exists (by formatted string)
    if (!book.find(entry => entry.formatted === item.formatted)) {
      book.unshift(item); // Add to top
      if (book.length > 50) book.pop(); // Keep max 50
      localStorage.setItem('din_local_addresses', JSON.stringify(book));
    }
  }

  function fuzzySearchLocal(query) {
    const book = getLocalAddressBook();
    const q = query.toLowerCase();
    return book.filter(item => item.formatted.toLowerCase().includes(q)).slice(0, 5);
  }

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
      coords = JSON.parse(localStorage.getItem('din_sender_coords'));
    } catch (e) {}

    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=de&limit=5`;
    if (coords && coords.lat && coords.lon) {
      url += `&bias=proximity:${coords.lon},${coords.lat}`;
    }

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) throw new Error('API Request failed');
      const data = await response.json();

      const parsedSuggestions = (data.features || []).map(f => {
        const p = f.properties;
        return {
          street: p.street || "",
          housenumber: p.housenumber || "",
          postcode: p.postcode || "",
          city: p.city || "",
          formatted: [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(", "),
          source: 'geoapify'
        };
      }).filter(s => s.street && s.city);

      // Merge local and geoapify, avoiding exact duplicates
      const combined = [...localMatches];
      parsedSuggestions.forEach(ps => {
        if (!combined.find(c => c.formatted === ps.formatted)) {
          combined.push(ps);
        }
      });

      renderSuggestions(combined.slice(0, 6), query);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('[Address] Autocomplete search failed:', err);
        
        // Wenn der API Call fehlschlägt, ist der Key vermutlich tot
        StorageManager.saveGeoapifyKey('');
        document.getElementById('input-geoapify-key').value = '';
        setUIMode('no_key');
        if (onToast) onToast("❌ Geoapify API-Key ist ungültig oder abgelaufen! Bitte neu eintragen.", 'error');
        
        try { addressSuggestions.hidePopover(); } catch(e) {}
      }
    }
  }

  function renderSuggestions(suggestions, query) {
    addressSuggestions.replaceChildren();

    if (suggestions.length === 0) {
      try { addressSuggestions.hidePopover(); } catch(e) {}
      return;
    }

    suggestions.forEach(item => {
      const li = document.createElement('li');
      // Highlight the matched substring
      li.innerHTML = highlightMatch(item.formatted, query);
      
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

    try { addressSuggestions.showPopover(); } catch(e) {}
  }

  function selectSuggestion(item) {
    const empfStrasse = document.getElementById('empfaenger-strasse');
    const empfOrt = document.getElementById('empfaenger-ort');

    if (empfStrasse) {
      empfStrasse.textContent = `${item.street} ${item.housenumber}`.trim();
    }
    if (empfOrt) {
      empfOrt.textContent = `${item.postcode} ${item.city}`.trim();
    }

    try { addressSuggestions.hidePopover(); } catch(e) {}
    inputAddressSearch.value = '';

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
      const text = empfOrtEl.textContent.trim();
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
                const range = document.createRange();
                range.selectNodeContents(empfOrtEl);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);

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
    let absenderTimeout = null;
    absenderPlzOrtEl.addEventListener('input', () => {
      clearTimeout(absenderTimeout);
      absenderTimeout = setTimeout(() => {
        const text = absenderPlzOrtEl.textContent.trim();
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
