import { runLiveDiagnostics } from './healthcheck.js';
/* js/main.js */
import { StorageManager } from './storage.js';
import { Constants } from './constants.js';
import { SalutationFeature } from './salutation-engine.js';
import { MetadataService } from './metadata.js';
import { SignatureFeature } from './signature.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM ELEMENTS ---
  const shell = document.getElementById('app-shell');
  const paper = document.querySelector('din-a4');
  const viewport = document.getElementById('viewport');
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');
  
  // Sidebar UI elements
  const btnFormA = document.getElementById('btn-form-a');
  const btnFormB = document.getElementById('btn-form-b');
  const btnThemeLight = document.getElementById('btn-theme-light');
  const btnThemeDark = document.getElementById('btn-theme-dark');
  const btnThemeAuto = document.getElementById('btn-theme-auto');
  const btnToggleGuides = document.getElementById('btn-toggle-guides');
  
  // Font upload & manager elements
  const btnFontUploadTrigger = document.getElementById('btn-upload-font-trigger');
  const btnResetFont = document.getElementById('btn-reset-font');
  const fontStatusLabel = document.getElementById('font-status-label');
  const fontUploader = document.getElementById('font-uploader');
  
  // Font stack segmented control buttons
  const btnFontSans = document.getElementById('btn-font-sans');
  const btnFontSerif = document.getElementById('btn-font-serif');
  const btnFontMono = document.getElementById('btn-font-mono');

  // Text selection & formatting elements
  const formatToolbar = document.getElementById('format-toolbar');
  const btnBold = document.getElementById('btn-bold');
  const btnUnderline = document.getElementById('btn-underline');
  const btnQuote = document.getElementById('btn-quote');
  const brieftext = document.getElementById('brieftext');

  // Popover Toast Element
  const globalToast = document.getElementById('toast-v4');

  // Address Autocomplete UI elements
  const inputGeoapifyKey = document.getElementById('input-geoapify-key');
  const inputAddressSearch = document.getElementById('input-address-search');
  const addressSuggestions = document.getElementById('address-suggestions');
  const autocompleteInfoBox = document.getElementById('autocomplete-info-box');
  const geoapifyKeyContainer = document.getElementById('geoapify-key-container');
  const btnProviderPhoton = document.getElementById('btn-provider-photon');
  const btnProviderGeoapify = document.getElementById('btn-provider-geoapify');

  // Load baseline settings
  let settings = StorageManager.loadSettings();

  // --- Initialize App ---
  initApp();

  function initApp() {
    applySettings();
    loadDraftData();
    initFontInjection();
    attachGlobalListeners();
    attachFormattingToolbar();
    checkTextOverflow();
    initGeoapify();

    // Init Salutation
    const salutation = new SalutationFeature(saveDraftData);
    salutation.init();

    // Init Signature Feature
    const sigContext = {
      settings: settings,
      saveSettings: () => StorageManager.saveSettings(settings)
    };
    const signature = new SignatureFeature(sigContext);
    signature.init();
  }

  // --- OFFLINE FONT INJECTION (1-Font Limit for file://) ---
  function initFontInjection() {
    const savedFont = StorageManager.loadCustomFont();
    if (savedFont) {
      injectFont(savedFont);
      updateFontStatusUI(true);
    } else {
      updateFontStatusUI(false);
    }
  }

  function injectFont(base64Font) {
    let fontStyle = document.getElementById('din-custom-font-style');
    if (!fontStyle) {
      fontStyle = document.createElement('style');
      fontStyle.id = 'din-custom-font-style';
      document.head.appendChild(fontStyle);
    }
    fontStyle.textContent = `
      @font-face {
        font-family: 'AptosCustom';
        src: url('${base64Font}') format('woff2');
      }
    `;
  }

  function updateFontStatusUI(hasCustomFont) {
    if (!fontStatusLabel || !btnResetFont) return;
    if (hasCustomFont) {
      fontStatusLabel.textContent = "Aktiv: Eigene WOFF2 Schrift";
      btnResetFont.style.display = "block";
      document.body.classList.add('font-custom-active');
    } else {
      fontStatusLabel.textContent = "Aktiv: System-UI Standardschrift";
      btnResetFont.style.display = "none";
      document.body.classList.remove('font-custom-active');
    }
  }

  // --- DUAL-PROVIDER ADDRESS SERVICE (Photon / Geoapify / Zippopotam) ---
  function initGeoapify() {
    if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !autocompleteInfoBox || !geoapifyKeyContainer || !btnProviderPhoton || !btnProviderGeoapify) return;

    let activeAbortController = null;
    let debounceSearchTimeout = null;
    let keyDebounceTimeout = null;

    // Load initial settings
    const activeProvider = settings.addressProvider || 'photon';
    const savedKey = StorageManager.loadGeoapifyKey();
    inputGeoapifyKey.value = savedKey;

    applyProviderUIState(activeProvider);

    // Provider Switches Click Listeners
    btnProviderPhoton.addEventListener('click', () => {
      settings.addressProvider = 'photon';
      updateSettings();
      applyProviderUIState('photon');
      showToast("📡 Adress-Suche: Photon (kostenlos) aktiv", "info");
    });

    btnProviderGeoapify.addEventListener('click', () => {
      settings.addressProvider = 'geoapify';
      updateSettings();
      applyProviderUIState('geoapify');
      showToast("🔑 Adress-Suche: Geoapify Premium aktiv", "info");
    });

    // Key input handler with Heartbeat Validation
    inputGeoapifyKey.addEventListener('input', () => {
      clearTimeout(keyDebounceTimeout);
      const val = inputGeoapifyKey.value.trim();

      keyDebounceTimeout = setTimeout(async () => {
        if (!val) {
          StorageManager.saveGeoapifyKey('');
          applyProviderUIState('geoapify');
          showToast("🗑️ Geoapify API-Key entfernt", "info");
          return;
        }

        try {
          // Heartbeat validation via Header (Sicherer)
          const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1`, {
            headers: { "X-Api-Key": val }
          });
          if (res.ok) {
            StorageManager.saveGeoapifyKey(val);
            applyProviderUIState('geoapify');
            showToast("🔑 Geoapify Key gültig!", "success");
          } else {
            showToast("❌ Geoapify Key ungültig", "error");
          }
        } catch (err) {
          showToast("❌ Fehler bei der Key-Validierung", "error");
        }
      }, 500);
    });

    function applyProviderUIState(provider) {
      btnProviderPhoton.classList.remove('active');
      btnProviderGeoapify.classList.remove('active');

      /* 
       * 🚨 OBSOLETE JS ANIMATION/COLLAPSE HACKS REMOVED:
       * Statt display: none/flex manuell per JS zu togglen (was keine Transition zulaesst),
       * nutzen wir 'interpolate-size: allow-keywords' und 'display: allow-discrete' in CSS.
       * JS toggelt lediglich die active-Klasse, und der Browser animiert stufenlos
       * die Hoehe (0 -> auto) und die Opacitaet hardwarebeschleunigt auf GPU-Ebene!
       */
      const setBoxHTML = (html) => {
        if (autocompleteInfoBox.setHTML) {
          autocompleteInfoBox.setHTML(html);
        } else {
          autocompleteInfoBox.innerHTML = html;
        }
      };

      if (provider === 'photon') {
        btnProviderPhoton.classList.add('active');
        geoapifyKeyContainer.classList.remove('active');
        
        inputAddressSearch.disabled = false;
        setBoxHTML(`📡 <b>Photon aktiv</b> (kostenlose OpenStreetMap-Suche, kein API-Key erforderlich).`);
        autocompleteInfoBox.style.borderColor = 'var(--border-color)';
        autocompleteInfoBox.style.color = 'var(--text-muted)';
      } else {
        btnProviderGeoapify.classList.add('active');
        geoapifyKeyContainer.classList.add('active');

        const key = StorageManager.loadGeoapifyKey();
        if (key) {
          inputAddressSearch.disabled = false;
          setBoxHTML(`✅ <b>Geoapify bereit!</b> Premium-Suche aktiv.`);
          autocompleteInfoBox.style.borderColor = 'var(--c-success)';
          autocompleteInfoBox.style.color = 'var(--c-success)';
        } else {
          inputAddressSearch.disabled = true;
          inputAddressSearch.value = '';
          addressSuggestions.style.display = 'none';
          setBoxHTML(`🔑 Trage deinen API-Key ein, um die Adress-Vervollständigung freizuschalten. <a href="https://myprojects.geoapify.com/register" target="_blank" style="color: var(--accent-color); text-decoration: underline; pointer-events: auto;">Hier kostenlos registrieren</a>.`);
          autocompleteInfoBox.style.borderColor = 'var(--border-color)';
          autocompleteInfoBox.style.color = 'var(--text-muted)';
        }
      }
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

      const provider = settings.addressProvider || 'photon';
      let url = '';
      let fetchOptions = { signal: activeAbortController.signal };

      // Load cached sender coordinates for Proximity-Biasing
      let coords = null;
      try {
        coords = JSON.parse(localStorage.getItem('din_sender_coords'));
      } catch (e) {}

      if (provider === 'photon') {
        const bbox = "5.0,45.0,16.0,56.0"; // Deutschland Bbox
        url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5&bbox=${bbox}`;
        
        // Apply Proximity Biasing if coordinates are active
        if (coords && coords.lat && coords.lon) {
          url += `&lat=${coords.lat}&lon=${coords.lon}`;
        }
      } else if (provider === 'geoapify') {
        const key = StorageManager.loadGeoapifyKey();
        if (!key) {
          showToast("Geoapify Key fehlt. Bitte in Sidebar eintragen.", "warning");
          return;
        }
        url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=de&limit=5`;
        
        // Apply Proximity Biasing if coordinates are active
        if (coords && coords.lat && coords.lon) {
          url += `&bias=proximity:${coords.lon},${coords.lat}`;
        }
        
        fetchOptions.headers = { "X-Api-Key": key };
      }

      try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) throw new Error('API Request failed');
        const data = await response.json();

        let parsedSuggestions = [];
        if (provider === 'photon' && data.features) {
          parsedSuggestions = _parsePhoton(data.features);
        } else if (provider === 'geoapify' && data.features) {
          parsedSuggestions = _parseGeoapify(data.features);
        }

        renderSuggestions(parsedSuggestions);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[Address] Autocomplete search failed:', err);
          showToast(Constants.TOASTS.ADDRESS_ERROR, 'error');
          addressSuggestions.style.display = 'none';
        }
      }
    }

    function _parsePhoton(features) {
      return features.map(f => {
        const p = f.properties;
        return {
          street: p.street || p.name || "",
          housenumber: p.housenumber || "",
          postcode: p.postcode || "",
          city: p.city || p.town || p.village || "",
          formatted: [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(", ")
        };
      }).filter(s => s.street && s.city);
    }

    function _parseGeoapify(features) {
      return features.map(f => {
        const p = f.properties;
        return {
          street: p.street || "",
          housenumber: p.housenumber || "",
          postcode: p.postcode || "",
          city: p.city || "",
          formatted: [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(", ")
        };
      }).filter(s => s.street && s.city);
    }

    function renderSuggestions(suggestions) {
      /* 
       * 🚨 LLM ARCHITECTURE NOTE & JS REMOVAL COMMENT:
       * Hier wurde jeglicher JavaScript-Positionierungs- und Koordinatenberechnungscode 
       * (getBoundingClientRect, manuelle Offsets, Breitenabgleiche und Fenster-Resize-Listener) 
       * bewusst entfernt bzw. komplett vermieden!
       * Die Platzierung und dynamische Größenanpassung des Adress-Vorschlags-Dropdowns
       * erfolgt nun 100% deklarativ im CSS über die W3C CSS Anchor Positioning API 
       * (position-anchor: --address-input, position-area: bottom span-x und width: anchor-size(width)).
       * JavaScript steuert ausschließlich den Sichtbarkeitsstatus (display: block/none).
       */
      addressSuggestions.replaceChildren();

      if (suggestions.length === 0) {
        addressSuggestions.style.display = 'none';
        return;
      }

      suggestions.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.formatted;
        
        li.addEventListener('click', () => {
          selectSuggestion(item);
        });

        addressSuggestions.appendChild(li);
      });

      addressSuggestions.style.display = 'block';
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

      addressSuggestions.style.display = 'none';
      inputAddressSearch.value = '';

      saveDraftData();
      showToast(Constants.TOASTS.ADDRESS_SUCCESS, 'success');
    }

    // Close suggestions dropdown on outside clicks
    document.addEventListener('click', (e) => {
      if (e.target !== inputAddressSearch && e.target !== addressSuggestions) {
        addressSuggestions.style.display = 'none';
      }
    });

    // --- ZIPPOPOTAM PLZ AUTO-LOOKUP ---
    const empfOrtEl = document.getElementById('empfaenger-ort');
    if (empfOrtEl) {
      empfOrtEl.addEventListener('input', () => {
        const text = empfOrtEl.textContent.trim();
        const zipMatch = text.match(/^(\d{5})/);
        if (zipMatch) {
          const zip = zipMatch[1];
          clearTimeout(empfOrtEl._zipDebounce);
          empfOrtEl._zipDebounce = setTimeout(async () => {
            try {
              const res = await fetch(`https://api.zippopotam.us/de/${zip}`);
              if (!res.ok) return;
              const data = await res.json();
              if (data.places && data.places.length > 0) {
                const city = data.places[0]["place name"];
                const newText = `${zip} ${city}`;
                
                // Caret protection
                if (document.activeElement === empfOrtEl) {
                  const selection = window.getSelection();
                  const offset = selection.focusOffset;
                  empfOrtEl.textContent = newText;
                  
                  // Restore caret to end
                  const range = document.createRange();
                  range.selectNodeContents(empfOrtEl);
                  range.collapse(false);
                  selection.removeAllRanges();
                  selection.addRange(range);
                } else {
                  empfOrtEl.textContent = newText;
                }
                
                saveDraftData();
                showToast(`Ort gefunden: ${city}`, "info");
              }
            } catch (err) {
              console.warn('[ZIP] Zippopotam Lookup failed:', err);
            }
          }, 300);
        }
      });
    }

    // --- AUTOMATIC SENDER COORDINATES LOOKUP FOR PROXIMITY BIASING ---
    const absenderEl = document.getElementById('absender');
    if (absenderEl) {
      const checkSenderPLZ = () => {
        const text = absenderEl.textContent.trim();
        const zipMatch = text.match(/\b\d{5}\b/);
        if (zipMatch) {
          const zip = zipMatch[0];
          
          // Load cached coords to prevent duplicate API hits
          let cached = {};
          try {
            cached = JSON.parse(localStorage.getItem('din_sender_coords') || '{}');
          } catch(e){}

          if (cached.zip === zip) return; // Already cached!

          // Fetch coordinates
          clearTimeout(absenderEl._zipDebounce);
          absenderEl._zipDebounce = setTimeout(async () => {
            try {
              const res = await fetch(`https://api.zippopotam.us/de/${zip}`);
              if (!res.ok) return;
              const data = await res.json();
              if (data.places && data.places.length > 0) {
                const place = data.places[0];
                const coords = {
                  lat: parseFloat(place.latitude),
                  lon: parseFloat(place.longitude),
                  zip: zip,
                  city: place["place name"]
                };
                localStorage.setItem('din_sender_coords', JSON.stringify(coords));
                console.log('[Proximity] Geocoded sender coords cached:', coords);
              }
            } catch (err) {
              console.warn('[Proximity] Sender ZIP lookup failed:', err);
            }
          }, 1000); // 1s delay during active typing
        }
      };

      absenderEl.addEventListener('input', checkSenderPLZ);
      // Run once on boot to extract initial PLZ from loaded draft absender
      setTimeout(checkSenderPLZ, 500);
    }
  }

  // --- CENTRAL TOAST QUEUE MANAGER (Stacking Prevention with Symmetrical Native Transitions) ---
  const toastQueue = [];
  let isToastActive = false;

  function showToast(message, type = 'info') {
    toastQueue.push({ message, type });
    processToastQueue();
  }

  function processToastQueue() {
    if (isToastActive || toastQueue.length === 0 || !globalToast) return;

    isToastActive = true;
    const { message, type } = toastQueue.shift();

    globalToast.textContent = message;
    globalToast.className = `toast-container type-${type}`;

    try {
      globalToast.showPopover();

      /* 
       * 🚨 OBSOLETE JS CODE REMOVED & REPLACED BY MODERN CSS:
       * Durch 'transition-behavior: allow-discrete' und '@starting-style' in floating.css
       * ist das komplexe Lauschen auf 'animationend' in JS vollkommen ueberfluessig geworden!
       * Der Browser steuert die symmetrische Ein-/Ausblend-Animation vollkommen autonom.
       * JS triggert nach 3s einfach hidePopover(), den Rest macht die Engine auf GPU-Ebene.
       */
      let cleanedUp = false;
      const cleanupPopover = () => {
        if (cleanedUp) return;
        cleanedUp = true;

        if (globalToast.matches(':popover-open')) {
          globalToast.hidePopover();
        }
        
        // Warte, bis die native CSS-Austritts-Animation (250ms) vollstaendig beendet ist
        setTimeout(() => {
          isToastActive = false;
          processToastQueue();
        }, 300);
      };

      const displayTimeout = setTimeout(cleanupPopover, 3000);
      
      globalToast.onclick = () => {
        clearTimeout(displayTimeout);
        cleanupPopover();
      };
    } catch (e) {
      console.warn('[Toast] Popover API failure:', e);
      isToastActive = false;
      setTimeout(processToastQueue, 200);
    }
  }

  // --- WHATSAPP-STYLE FORMATTING TOOLBAR & SHORTCUTS ---
  function attachFormattingToolbar() {
    if (!formatToolbar || !brieftext) return;

    const selectionAnchor = document.getElementById('selection-anchor');

    // Debounced Selection Change listener for performance (50ms)
    let selectionTimeout;
    document.addEventListener('selectionchange', () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(handleSelectionChange, 50);
    });

    // Native-like DOM Tree Traversal to find formatting states zukunftsfähig
    function isSelectionInsideTag(tagName) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return false;
      
      const isCustomComment = tagName === 'comment';
      const actualTag = isCustomComment ? 'SPAN' : tagName;

      let node = selection.anchorNode;
      while (node && node !== brieftext) {
        const name = node.nodeName.toUpperCase();
        if (name === actualTag.toUpperCase() || 
            (actualTag.toUpperCase() === 'B' && name === 'STRONG')) {
          if (isCustomComment && !node.classList.contains('din-comment')) {
            // Keep searching upwards
          } else {
            return true;
          }
        }
        node = node.parentNode;
      }
      return false;
    }

    function getBlockquoteAncestor(anchorNode) {
      let node = anchorNode;
      while (node && node !== brieftext) {
        if (node.nodeName === 'BLOCKQUOTE') return node;
        node = node.parentNode;
      }
      return null;
    }

    function handleSelectionChange() {
      const selection = window.getSelection();

      // Vorfilter: Is something selected?
      if (selection.isCollapsed || selection.toString().trim().length === 0) {
        hideToolbar();
        return;
      }

      // Scope-Filter: Is selection strictly inside brieftext?
      if (!brieftext.contains(selection.anchorNode)) {
        hideToolbar();
        return;
      }

      // Read Range coordinates
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position the external anchor exactly at the start of the selection relative to the body
      if (selectionAnchor) {
        selectionAnchor.style.top = `${rect.top}px`;
        selectionAnchor.style.left = `${rect.left}px`;
      }

      // Open Popover first so offsetHeight/offsetWidth are calculated by browser
      if (!formatToolbar.matches(':popover-open')) {
        try {
          formatToolbar.showPopover();
        } catch (e) {
          console.warn('[Toolbar] showPopover failed:', e);
        }
      }

      // Zustandserkennung & A11y
      const isBold = isSelectionInsideTag('B');
      const isUnderline = isSelectionInsideTag('U');
      const isQuote = isSelectionInsideTag('BLOCKQUOTE');
      const isComment = isSelectionInsideTag('comment');
      const btnComment = document.getElementById('btn-comment');

      if (isBold) {
        btnBold.classList.add('active');
        btnBold.setAttribute('aria-pressed', 'true');
      } else {
        btnBold.classList.remove('active');
        btnBold.setAttribute('aria-pressed', 'false');
      }

      if (isUnderline) {
        btnUnderline.classList.add('active');
        btnUnderline.setAttribute('aria-pressed', 'true');
      } else {
        btnUnderline.classList.remove('active');
        btnUnderline.setAttribute('aria-pressed', 'false');
      }

      if (isQuote) {
        btnQuote.classList.add('active');
        btnQuote.setAttribute('aria-pressed', 'true');
      } else {
        btnQuote.classList.remove('active');
        btnQuote.setAttribute('aria-pressed', 'false');
      }

      if (btnComment) {
        if (isComment) {
          btnComment.classList.add('active');
          btnComment.setAttribute('aria-pressed', 'true');
        } else {
          btnComment.classList.remove('active');
          btnComment.setAttribute('aria-pressed', 'false');
        }
      }
    }

    function hideToolbar() {
      if (formatToolbar.matches(':popover-open')) {
        formatToolbar.hidePopover();
      }
    }

    // Custom pure DOM selection formatting implementation replacing deprecated execCommand
    function toggleFormat(tagName) {
      const selection = window.getSelection();
      if (selection.isCollapsed || !brieftext.contains(selection.anchorNode)) return;

      const range = selection.getRangeAt(0);
      
      const isCustomComment = tagName === 'comment';
      const actualTag = isCustomComment ? 'SPAN' : tagName;
      
      if (isSelectionInsideTag(tagName)) {
        // UNWRAP
        let node = selection.anchorNode;
        let formatNode = null;
        while (node && node !== brieftext) {
          const name = node.nodeName.toUpperCase();
          if (name === actualTag.toUpperCase() || (actualTag.toUpperCase() === 'B' && name === 'STRONG')) {
            if (isCustomComment && !node.classList.contains('din-comment')) {
               // Keep searching
            } else {
              formatNode = node;
              break;
            }
          }
          node = node.parentNode;
        }
        
        if (formatNode) {
          const parent = formatNode.parentNode;
          const fragment = document.createDocumentFragment();
          while (formatNode.firstChild) {
            fragment.appendChild(formatNode.firstChild);
          }
          parent.replaceChild(fragment, formatNode);
        }
      } else {
        // WRAP
        const wrapper = document.createElement(actualTag.toLowerCase());
        if (isCustomComment) wrapper.className = 'din-comment';
        try {
          wrapper.appendChild(range.extractContents());
          range.insertNode(wrapper);
          selection.selectAllChildren(wrapper);
        } catch (err) {
          console.warn('[Format] Failed to wrap range:', err);
        }
      }
      
      // Clean up empty tags and merge adjacent text nodes
      brieftext.normalize();
      
      saveDraftData();
      handleSelectionChange();
    }

    // Button Click Formatting Logic with immediate UI updating
    btnBold.addEventListener('click', (e) => {
      e.preventDefault();
      toggleFormat('B');
    });

    btnUnderline.addEventListener('click', (e) => {
      e.preventDefault();
      toggleFormat('U');
    });

    btnQuote.addEventListener('click', (e) => {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection.isCollapsed || !brieftext.contains(selection.anchorNode)) return;

      const range = selection.getRangeAt(0);
      const bq = getBlockquoteAncestor(selection.anchorNode);

      if (bq) {
        // UNWRAP: Replace blockquote with its children
        const parent = bq.parentNode;
        while (bq.firstChild) {
          parent.insertBefore(bq.firstChild, bq);
        }
        parent.removeChild(bq);
      } else {
        // WRAP: Wrap range contents in a blockquote
        const quote = document.createElement('blockquote');
        quote.appendChild(range.extractContents());
        range.insertNode(quote);
      }

      saveDraftData();
      handleSelectionChange();
    });

    const btnComment = document.getElementById('btn-comment');
    if(btnComment) {
      btnComment.addEventListener('click', (e) => {
        e.preventDefault();
        toggleFormat('comment');
      });
    }

    // Custom non-standard shortcuts only (Standard Strg+B / Strg+U left to native browser)
    brieftext.addEventListener('keydown', (e) => {
      // Custom blockquote shortcut: Strg+Shift+9
      if (e.ctrlKey && e.shiftKey && e.key === '9') {
        e.preventDefault();
        btnQuote.click();
      }
    });

    // Strikter HTML-Paste-Filter (behält nur strong, b, u, s)
    brieftext.addEventListener('paste', (e) => {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');

      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      if (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        function sanitizeNode(node) {
          const allowedTags = ['B', 'STRONG', 'U', 'S', 'BLOCKQUOTE'];
          
          if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent);
          }
          
          if (node.nodeType !== Node.ELEMENT_NODE) return document.createTextNode('');
          
          let newNode;
          if (allowedTags.includes(node.nodeName)) {
             newNode = document.createElement(node.nodeName.toLowerCase());
          } else if (node.nodeName === 'SPAN' && node.classList.contains('din-comment')) {
             newNode = document.createElement('span');
             newNode.className = 'din-comment';
          } else {
             const frag = document.createDocumentFragment();
             node.childNodes.forEach(child => {
               frag.appendChild(sanitizeNode(child));
             });
             return frag;
          }
          
          node.childNodes.forEach(child => {
            newNode.appendChild(sanitizeNode(child));
          });
          
          return newNode;
        }

        const cleanFragment = document.createDocumentFragment();
        doc.body.childNodes.forEach(child => {
          cleanFragment.appendChild(sanitizeNode(child));
        });

        if (cleanFragment.childNodes.length === 0) {
            range.insertNode(document.createTextNode(text));
        } else {
            const lastChild = cleanFragment.lastChild;
            range.insertNode(cleanFragment);
            if (lastChild) {
                range.setStartAfter(lastChild);
                range.collapse(true);
            }
        }
      } else {
        range.insertNode(document.createTextNode(text));
        selection.collapseToEnd();
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
      saveDraftData();
    });

    // Drag-and-Drop HTML Filter
    brieftext.addEventListener('drop', (e) => {
      e.preventDefault();
      const text = e.dataTransfer.getData('text/plain');

      // Find drop coordinate range
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      }
      saveDraftData();
    });
  }

  // --- TEXT HEIGHT OVERFLOW WARNING ---
  function checkTextOverflow() {
    if (!brieftext) return;
    
    // Printable core area maximum height is ~120mm on scale, which is roughly 450px inside 94vh container
    const maxTextHeight = 450;
    
    if (brieftext.scrollHeight > maxTextHeight) {
      paper.classList.add('overflow-warn');
    } else {
      paper.classList.remove('overflow-warn');
    }
  }

  // --- GLOBAL EVENT LISTENERS & TRIGGERS ---
  function attachGlobalListeners() {
    // Helper for safe native W3C View Transitions
    function transitionState(updateFn) {
      if (document.startViewTransition) {
        document.startViewTransition(updateFn);
      } else {
        updateFn();
      }
    }

    // Font Stack Toggles
    if (btnFontSans) {
      btnFontSans.addEventListener('click', () => {
        settings.systemFont = 'sans';
        updateSettings();
        showToast("🔤 Systemschrift: Sans-Serif aktiv", "info");
      });
    }
    if (btnFontSerif) {
      btnFontSerif.addEventListener('click', () => {
        settings.systemFont = 'serif';
        updateSettings();
        showToast("🔤 Systemschrift: Serif aktiv", "info");
      });
    }
    if (btnFontMono) {
      btnFontMono.addEventListener('click', () => {
        settings.systemFont = 'mono';
        updateSettings();
        showToast("🔤 Systemschrift: Monospace aktiv", "info");
      });
    }

    // Layout Form switches
    btnFormA.addEventListener('click', () => {
      transitionState(() => {
        settings.layout = 'form-a';
        updateSettings();
      });
    });
    
    btnFormB.addEventListener('click', () => {
      transitionState(() => {
        settings.layout = 'form-b';
        updateSettings();
      });
    });

    // Theme select toggles
    btnThemeLight.addEventListener('click', () => {
      transitionState(() => {
        settings.theme = 'light';
        updateSettings();
      });
    });

    btnThemeDark.addEventListener('click', () => {
      transitionState(() => {
        settings.theme = 'dark';
        updateSettings();
      });
    });

    btnThemeAuto.addEventListener('click', () => {
      transitionState(() => {
        settings.theme = 'auto';
        updateSettings();
      });
    });

    // Guides
    btnToggleGuides.addEventListener('click', () => {
      settings.guides = !settings.guides;
      updateSettings();
    });

    // Print
    btnPrint.addEventListener('click', () => {
      showToast(Constants.TOASTS.PRINT_PENDING, 'info');
      const metaCtx = MetadataService.prepare();
      
      setTimeout(() => {
        window.print();
        MetadataService.restore(metaCtx);
      }, 100);
    });

    // Reset
    btnReset.addEventListener('click', () => {
      if (confirm('Möchtest du alle Texte wirklich zurücksetzen?')) {
        resetDraft();
      }
    });

    // Font upload trigger click
    btnFontUploadTrigger.addEventListener('click', () => {
      fontUploader.click();
    });

    // Font reset click listener
    btnResetFont.addEventListener('click', () => {
      localStorage.removeItem("din_custom_font");
      const fontStyle = document.getElementById('din-custom-font-style');
      if (fontStyle) fontStyle.remove();
      updateFontStatusUI(false);
      showToast("🗑️ Eigene Schriftart entfernt", "success");
    });

    // Font file uploader change listener
    fontUploader.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check format
      if (!file.name.endsWith('.woff2')) {
        showToast(Constants.TOASTS.FONT_FORMAT_ERROR, 'error');
        return;
      }

      // Check file size (60 KB limit)
      const maxSizeInBytes = Constants.LIMITS.FONT_SIZE_MAX_KB * 1024;
      if (file.size > maxSizeInBytes) {
        showToast(Constants.TOASTS.FONT_SIZE_ERROR, 'error');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Font = event.target.result;
        const success = StorageManager.saveCustomFont(base64Font);
        if (success) {
          injectFont(base64Font);
          updateFontStatusUI(true);
          showToast(Constants.TOASTS.FONT_UPLOAD_SUCCESS, 'success');
        } else {
          showToast('❌ Fehler beim dauerhaften Speichern der Schriftart', 'error');
        }
      };
      reader.readAsDataURL(file);
    });

    // Auto-Save editables
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      elem.addEventListener('input', () => {
        saveDraftData();
        if (elem.id === 'brieftext') {
          checkTextOverflow();
        }
      });
    });
  }

  // --- SAVE & DRAFT MANAGEMENT ---
  function applySettings() {
    // 1. Layout Mode A/B
    if (settings.layout === 'form-a') {
      shell.classList.remove('form-b');
      shell.classList.add('form-a');
      btnFormA.classList.add('active');
      btnFormB.classList.remove('active');
    } else {
      shell.classList.remove('form-a');
      shell.classList.add('form-b');
      btnFormB.classList.add('active');
      btnFormA.classList.remove('active');
    }

    // 2. Color Schemes (Theme light-dark supported)
    if (settings.theme === 'light') {
      document.documentElement.style.colorScheme = 'light';
      btnThemeLight.classList.add('active');
      btnThemeDark.classList.remove('active');
      btnThemeAuto.classList.remove('active');
    } else if (settings.theme === 'dark') {
      document.documentElement.style.colorScheme = 'dark';
      btnThemeDark.classList.add('active');
      btnThemeLight.classList.remove('active');
      btnThemeAuto.classList.remove('active');
    } else {
      document.documentElement.removeAttribute('style'); // Inherits system color scheme
      btnThemeAuto.classList.add('active');
      btnThemeLight.classList.remove('active');
      btnThemeDark.classList.remove('active');
    }

    // 3. Layout Guides overlay
    /* 
     * 🚨 LLM ARCHITECTURE NOTE & JS REDUCTION COMMENT:
     * Dank '@property --guide-opacity' in variables.css ist JavaScript komplett 
     * entlastet von jeglichen Animationsschleifen, Intervallen oder CSS-Klassen-Fading-Hacks!
     * JS setzt den Variablenwert direkt als pure Zahl (0.15 oder 0), und der Browser 
     * animiert die Sichtbarkeit der Loch- und Falzmarken stufenlos und nativ auf GPU-Ebene.
     */
    if (settings.guides) {
      document.documentElement.style.setProperty('--guide-opacity', '0.15');
      btnToggleGuides.textContent = '📐 Guides ausblenden';
      btnToggleGuides.classList.add('primary');
    } else {
      document.documentElement.style.setProperty('--guide-opacity', '0');
      btnToggleGuides.textContent = '📐 Guides einblenden';
      btnToggleGuides.classList.remove('primary');
    }

    // 4. System Font Stacks
    if (btnFontSans && btnFontSerif && btnFontMono) {
      document.body.classList.remove('font-stack-sans', 'font-stack-serif', 'font-stack-mono');
      
      btnFontSans.classList.remove('active');
      btnFontSerif.classList.remove('active');
      btnFontMono.classList.remove('active');

      if (settings.systemFont === 'serif') {
        document.body.classList.add('font-stack-serif');
        btnFontSerif.classList.add('active');
      } else if (settings.systemFont === 'mono') {
        document.body.classList.add('font-stack-mono');
        btnFontMono.classList.add('active');
      } else {
        document.body.classList.add('font-stack-sans');
        btnFontSans.classList.add('active');
      }
    }
  }

  function updateSettings() {
    StorageManager.saveSettings(settings);
    applySettings();
  }

  function saveDraftData() {
    const draft = {};
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      // Save innerHTML for brieftext to persist formatting tags, textContent for others
      if (elem.id === 'brieftext') {
        draft[elem.id] = elem.innerHTML;
      } else {
        draft[elem.id] = elem.textContent;
      }
    });
    StorageManager.saveDraft('current', draft);
  }

  function loadDraftData() {
    const draft = StorageManager.loadDraft('current');
    if (draft) {
      Object.keys(draft).forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
          if (id === 'brieftext') {
            if (elem.setHTML) {
              elem.setHTML(draft[id]);
            } else {
              elem.innerHTML = draft[id];
            }
          } else {
            elem.textContent = draft[id];
          }
        }
      });
    }

    // Auto-fill today's date via native W3C Temporal API if datum element is empty
    const datumEl = document.getElementById('datum');
    if (datumEl && !datumEl.textContent.trim()) {
      /* 
       * 🚨 LEGACY DATE API BAN & JS REPLACEMENT COMMENT:
       * Jegliche Verwendung von legacy Date() oder externen Moment/Date-Fns CDNs 
       * ist gemaess ADR-ANTIPATTERN.md Punkt 6 absolut verboten!
       * Wir nutzen stattdessen ausschliesslich die native W3C Temporal API.
       * Sie ist vollkommen zeitzonensicher, unveraenderlich (immutable) und
       * liefert hier das exakte lokale Systemdatum normgerecht formatiert.
       */
      try {
        const today = Temporal.Now.plainDateISO();
        const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        datumEl.textContent = `${today.day}. ${months[today.month - 1]} ${today.year}`;
        saveDraftData();
      } catch (e) {
        console.warn('[Temporal] Failed to auto-fill date via Temporal API:', e);
      }
    }
  }

  function resetDraft() {
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      elem.innerHTML = '';
      elem.textContent = '';
    });
    saveDraftData();
    checkTextOverflow();
    showToast(Constants.TOASTS.RESET_SUCCESS, 'success');
  }
});


// Dev Mode Trigger: 3-Klick
let clickCount = 0;
let clickTimeout = null;
document.addEventListener('click', (e) => {
  clickCount++;
  clearTimeout(clickTimeout);
  clickTimeout = setTimeout(() => { clickCount = 0; }, 1000);
  if (clickCount === 3) {
    clickCount = 0;
    clearTimeout(clickTimeout);
    runLiveDiagnostics();
    const popover = document.getElementById('dev-popover');
    if (popover && !popover.matches(':popover-open')) {
       popover.showPopover();
    }
  }
});


// @adr [[ADR-JS]]
// JSON Export (Dev Tool)
document.getElementById('btn-copy-json')?.addEventListener('click', async (e) => {
  const btn = e.target;
  const originalText = btn.textContent;
  btn.textContent = 'Kopiere...';
  
  const state = {
    absender: document.getElementById('absender')?.innerHTML,
    empfaengerName: document.getElementById('empfaenger-name')?.innerHTML,
    empfaengerFirma: document.getElementById('empfaenger-firma')?.innerHTML,
    empfaengerStrasse: document.getElementById('empfaenger-strasse')?.innerHTML,
    empfaengerOrt: document.getElementById('empfaenger-ort')?.innerHTML,
    betreff: document.getElementById('betreff')?.innerHTML,
    anrede: document.getElementById('anrede')?.innerHTML,
    brieftext: document.getElementById('brieftext')?.innerHTML,
    grussformel: document.getElementById('grussformel')?.innerHTML,
    unterschrift: document.getElementById('unterschrift')?.innerHTML,
  };
  
  try {
    await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    btn.textContent = '✅ Kopiert!';
  } catch (err) {
    btn.textContent = '❌ Fehler';
  }
  
  setTimeout(() => { btn.textContent = originalText; }, 2000);
});
