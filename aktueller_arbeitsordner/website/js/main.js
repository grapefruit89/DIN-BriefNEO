// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

import { runLiveDiagnostics } from './healthcheck.js';
/* js/main.js */
import { StorageManager } from './storage.js';
import { Constants } from './constants.js';
import { SalutationFeature } from './salutation-engine.js';
import { MetadataService } from './metadata.js';
import { SignatureFeature } from './signature.js';
import { initAddressServices } from './geoapify.js';

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

  // Popover Toast Element
  const globalToast = document.getElementById('toast-v4');

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
    enforceLineLimits();
    initAddressServices({ onToast: showToast, onSaveDraft: saveDraftData });

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
  
  // --- LOKALES AUTO-ADRESSBUCH (CSS Anchor Positioning) ---
  const dropdown = document.getElementById('local-address-dropdown');
  const empfName = document.getElementById('empfaenger-name');
  const empfFirma = document.getElementById('empfaenger-firma');
  let hideTimeout;

  function renderAddressDropdown(query = '') {
    if (!dropdown) return;
    const book = StorageManager.getAddressBook();
    const q = query.toLowerCase().replace(/<[^>]*>?/gm, "").trim();
    
    const filtered = book.filter(a => {
      const txt = (a.name + " " + a.firma + " " + a.strasse + " " + a.ort).toLowerCase();
      return txt.includes(q);
    });

    if (filtered.length === 0) {
      try { dropdown.hidePopover(); } catch(e){}
      return;
    }

    dropdown.replaceChildren();
    filtered.slice(0, 5).forEach(a => {
      const div = document.createElement('div');
      div.className = 'address-suggestion-item';
      
      const strong = document.createElement('strong');
      strong.textContent = a.firma ? a.firma : a.name;
      const br = document.createElement('br');
      const small = document.createElement('small');
      small.textContent = `${a.strasse}, ${a.ort}`;
      
      div.appendChild(strong);
      div.appendChild(br);
      div.appendChild(small);

      div.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent blur
        document.getElementById('empfaenger-name').textContent = a.name;
        document.getElementById('empfaenger-firma').textContent = a.firma;
        document.getElementById('empfaenger-strasse').textContent = a.strasse;
        document.getElementById('empfaenger-ort').textContent = a.ort;
        saveDraftData();
        try { dropdown.hidePopover(); } catch(e){}
        showToast("Kontakt geladen", "success");
      });
      dropdown.appendChild(div);
    });

    try {
      dropdown.showPopover();
    } catch(e){}
  }

  [empfName, empfFirma].forEach(elem => {
    if(!elem) return;
    elem.addEventListener('focus', () => {
      clearTimeout(hideTimeout);
      renderAddressDropdown(elem.textContent);
    });
    elem.addEventListener('input', () => {
      renderAddressDropdown(elem.textContent);
    });
    elem.addEventListener('blur', () => {
      hideTimeout = setTimeout(() => {
        try { dropdown.hidePopover(); } catch(e){}
      }, 200);
    });
  });



  // --- WYSIWYG POSTVERMERK (CSS Anchor Positioning) ---
  const pvDropdown = document.getElementById('postvermerk-dropdown');
  const pvInput = document.getElementById('postvermerk');
  let pvHideTimeout;

  const pvOptions = [
    "Einschreiben",
    "Einschreiben Einwurf",
    "Einschreiben Rückschein",
    "Einschreiben Wert",
    "Persönlich",
    "Vertraulich",
    "Persönlich / Vertraulich",
    "Nicht nachsenden!",
    "Bei Umzug mit neuer Anschrift zurück",
    "Warensendung",
    "Büchersendung",
    "Einschreiben / Rückschein <br> Persönlich"
  ];

  function renderPvDropdown() {
    if (!pvDropdown) return;
    pvDropdown.replaceChildren();
    
    pvOptions.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'pv-item';
      div.textContent = opt;
      div.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent blur
        pvInput.textContent = opt;
        saveDraftData();
        try { pvDropdown.hidePopover(); } catch(e){}
        showToast("Vermerk gesetzt", "success");
      });
      pvDropdown.appendChild(div);
    });
    try { pvDropdown.showPopover(); } catch(e){}
  }

  if (pvInput) {
    pvInput.addEventListener('click', () => {
      clearTimeout(pvHideTimeout);
      renderPvDropdown();
    });
    pvInput.addEventListener('focus', () => {
      clearTimeout(pvHideTimeout);
      renderPvDropdown();
    });
    pvInput.addEventListener('blur', () => {
      pvHideTimeout = setTimeout(() => {
        try { pvDropdown.hidePopover(); } catch(e){}
      }, 200);
    });
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
        let cleanFragment = document.createDocumentFragment();
        let useFallback = true;
        
        // Try native W3C Sanitizer API first (Chrome 119+)
        const dummyDiv = document.createElement('div');
        if (dummyDiv.setHTML) {
          try {
            dummyDiv.setHTML(html, { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'], attributes: {'span': ['class']} });
            // Wenn der Parser durchläuft, extrahieren wir die bereinigten Nodes
            while (dummyDiv.firstChild) {
              cleanFragment.appendChild(dummyDiv.firstChild);
            }
            useFallback = false;
          } catch(e) {
            // Falls die Sanitizer Config noch nicht vom Browser unterstützt wird,
            // (z.B. weil die Spec noch draft ist), fallen wir auf den manuellen Filter zurück.
            console.warn('[Paste] Native setHTML Sanitizer failed, using fallback.');
          }
        }
        
        if (useFallback) {
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

          doc.body.childNodes.forEach(child => {
            cleanFragment.appendChild(sanitizeNode(child));
          });
        }

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

    // Auto-Save editables (Global State & Debouncing)
    let debounceSaveTimer = null;
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      elem.addEventListener('input', () => {
        clearTimeout(debounceSaveTimer);
        debounceSaveTimer = setTimeout(() => {
          saveDraftData();
          console.log('[Store] Global State auto-saved (debounced 400ms).');
        }, 400);
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
      document.documentElement.style.removeProperty('color-scheme'); // Inherits system color scheme
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

  
  function updateDocumentTitle() {
    const betreff = document.getElementById('betreff')?.textContent.trim() || 'Unbenannt';
    const firma = document.getElementById('empfaenger-firma')?.textContent.trim();
    const name = document.getElementById('empfaenger-name')?.textContent.trim();
    const empfaenger = firma ? firma : (name ? name : 'Unbekannt');
    
    let dateStr = 'YYYY-MM-DD';
    try {
      dateStr = Temporal.Now.plainDateISO().toString();
    } catch(e) {
      console.warn("Temporal API missing, date string unavailable.");
    }

    const sanitizedBetreff = betreff.replace(/[^a-zA-Z0-9äöüÄÖÜß \-_]/g, '');
    const sanitizedEmpfaenger = empfaenger.replace(/[^a-zA-Z0-9äöüÄÖÜß \-_]/g, '').replace(/ /g, '-');
    
    document.title = dateStr + '_' + sanitizedEmpfaenger + ' ' + sanitizedBetreff;
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
    updateDocumentTitle();
  }

  // --- HTML LINE LIMITS ENFORCER (Single Line / Max 2 Lines) ---
  function enforceLineLimits() {
    const singleLineIds = [
      'info-name', 'info-street', 'info-city', 'info-tel', 'info-email',
      'datum', 'anrede', 'grussformel', 'unterschrift',
      'empfaenger-name', 'empfaenger-firma', 'empfaenger-strasse', 'empfaenger-ort',
      'absender'
    ];
    const maxTwoLinesIds = ['betreff'];
    const allFields = [...singleLineIds, ...maxTwoLinesIds];

    allFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      // 1. Prevent Enter key and enforce max length
      el.addEventListener('keydown', (e) => {
        // Erlaube Navigation, Löschen und Shortcuts
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

        if (e.key === 'Enter') {
          if (singleLineIds.includes(id)) {
            e.preventDefault(); // Never allow Enter
          } else if (maxTwoLinesIds.includes(id)) {
            // Allow max 1 newline
            const text = el.innerText || el.textContent;
            const newlines = (text.match(/\n/g) || []).length;
            if (newlines >= 1) {
              e.preventDefault();
            }
          }
          return;
        }

        // KISS Max Length Check
        const maxLength = singleLineIds.includes(id) ? 80 : 120;
        const currentText = el.textContent || '';
        
        if (currentText.length >= maxLength) {
          const selection = window.getSelection();
          // Nur blockieren, wenn nicht gerade Text markiert ist (denn der würde ja überschrieben werden)
          if (!selection.rangeCount || selection.getRangeAt(0).collapsed) {
            e.preventDefault();
          }
        }
      });

      // 2. Filter Paste (override default contenteditable behavior)
      el.addEventListener('paste', (e) => {
        e.preventDefault();
        let pasteText = (e.originalEvent || e).clipboardData.getData('text/plain');
        
        if (singleLineIds.includes(id)) {
          // Replace all newlines with a space
          pasteText = pasteText.replace(/[\r\n]+/g, ' ').trim();
        } else if (maxTwoLinesIds.includes(id)) {
          // Keep at most 2 lines
          const lines = pasteText.split(/[\r\n]+/).filter(l => l.trim().length > 0);
          pasteText = lines.slice(0, 2).join('\n');
        }

        // Apply KISS Max Length to pasted text
        const maxLength = singleLineIds.includes(id) ? 80 : 120;
        const currentText = el.textContent || '';
        const selection = window.getSelection();
        let selectionLength = 0;
        if (selection.rangeCount) {
          selectionLength = selection.toString().length;
        }
        
        const availableSpace = maxLength - (currentText.length - selectionLength);
        if (availableSpace <= 0) return; // Kein Platz mehr
        if (pasteText.length > availableSpace) {
          pasteText = pasteText.substring(0, availableSpace);
        }

        // Use modern selection API if possible
        if (selection.rangeCount) {
          selection.deleteFromDocument();
          selection.getRangeAt(0).insertNode(document.createTextNode(pasteText));
          selection.collapseToEnd();
        }
        
        // Trigger input event manually so that dynamic squeezing updates
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });

      // 3. Dynamic Squeezing (only squeeze when getting full)
      el.addEventListener('input', () => {
        const currentText = el.textContent || '';
        if (currentText.length > 60) {
          el.classList.add('squeezed');
        } else {
          el.classList.remove('squeezed');
        }
      });
    });
  }

  function loadDraftData() {
    const draft = StorageManager.loadDraft('current');
    if (draft) {
      Object.keys(draft).forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
          if (id === 'brieftext') {
            if (elem.setHTML) {
              // Sanitizer API config if supported (experimental in Chrome)
              try {
                elem.setHTML(draft[id], { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'] });
              } catch(e) {
                elem.setHTML(draft[id]);
              }
            } else if (elem.setHTMLUnsafe) {
              elem.setHTMLUnsafe(draft[id]);
            } else {
              elem.textContent = draft[id]; // Strict Chrome 149 baseline: no innerHTML fallback
            }
          } else {
            elem.textContent = draft[id];
          }
        }
      });
    }

    // Auto-fill today's date via native W3C Temporal API if datum element is empty
    updateDocumentTitle();

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
      elem.replaceChildren(); // Fast, native way to clear content instead of innerHTML = ''
      elem.textContent = '';
    });
    saveDraftData();
    checkTextOverflow();
    showToast(Constants.TOASTS.RESET_SUCCESS, 'success');
  }
});


// Dev Mode Trigger: Button Click
document.getElementById('btn-dev-popover')?.addEventListener('click', () => {
  runLiveDiagnostics();
  const popover = document.getElementById('dev-popover');
  if (popover && !popover.matches(':popover-open')) {
     popover.showPopover();
  }
});


// @adr [[ADR-JS]]
// JSON Export (Dev Tool)
document.getElementById('btn-copy-json')?.addEventListener('click', async (e) => {
  const btn = e.target;
  const originalText = btn.textContent;
  btn.textContent = 'Kopiere...';
  
  // Note: Only brieftext supports HTML formatting natively
  const state = {
    absender: document.getElementById('absender')?.textContent,
    empfaengerName: document.getElementById('empfaenger-name')?.textContent,
    empfaengerFirma: document.getElementById('empfaenger-firma')?.textContent,
    empfaengerStrasse: document.getElementById('empfaenger-strasse')?.textContent,
    empfaengerOrt: document.getElementById('empfaenger-ort')?.textContent,
    betreff: document.getElementById('betreff')?.textContent,
    anrede: document.getElementById('anrede')?.textContent,
    brieftext: document.getElementById('brieftext')?.innerHTML, // Keep HTML serialization
    grussformel: document.getElementById('grussformel')?.textContent,
    unterschrift: document.getElementById('unterschrift')?.textContent,
  };
  
  try {
    await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    btn.textContent = '✅ Kopiert!';
  } catch (err) {
    btn.textContent = '❌ Fehler';
  }
  
  setTimeout(() => { btn.textContent = originalText; }, 2000);
});


// JSON Import (Dev Tool)
document.getElementById('btn-paste-json')?.addEventListener('click', async (e) => {
  const btn = e.target;
  const originalText = btn.textContent;
  btn.textContent = 'Füge ein...';
  try {
    const text = await navigator.clipboard.readText();
    const state = JSON.parse(text);
    for (const key of Object.keys(state)) {
      const elem = document.getElementById(key);
      if (elem) {
        if (key === 'brieftext') {
          if (elem.setHTML) {
            try { elem.setHTML(state[key], { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'] }); }
            catch(e) { elem.setHTML(state[key]); }
          }
          else if (elem.setHTMLUnsafe) elem.setHTMLUnsafe(state[key]);
          else elem.textContent = state[key]; // Strict Chrome 149 baseline: no innerHTML
        } else {
          elem.textContent = state[key];
        }
      }
    }
    btn.textContent = '✅ Eingefügt!';
  } catch (err) {
    btn.textContent = '❌ Fehler';
    console.error(err);
  }
  setTimeout(() => { btn.textContent = originalText; }, 2000);
});
