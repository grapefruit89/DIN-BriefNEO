// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 


/* js/main.js */
import { StorageManager } from './storage.js';
import { Constants } from './constants.js';
import { SalutationFeature } from './salutation-engine.js';
import { MetadataService } from './metadata.js';
import { SignatureFeature } from './signature.js';
import { initAddressServices } from './geoapify.js';
import { showToast, initToastSystem } from './toast.js';
import { initSenderSync } from './sender-sync.js';
import { initAddressBookSaveButton } from './address-book-helper.js';
import { DraftManager } from './draft-manager.js';
import { FormatToolbar } from './format-toolbar.js';

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



  // Load baseline settings
  let settings = StorageManager.loadSettings();

  // --- Initialize App ---
  initApp();

  function initApp() {
    window.draftManager = new DraftManager();
    window.draftManager.loadDraft();
    window.draftManager.enableEventMode();

    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('input', () => {
        window.draftManager.scheduleAutoSave();
        if (el.id === 'brieftext' || el.id === 'anlagen-text') {
          if (typeof checkTextOverflow === 'function') checkTextOverflow();
        }
      });
    });

    const datumEl = document.getElementById('datum');
    if (datumEl && !datumEl.textContent.trim()) {
      try {
        const today = Temporal.Now.plainDateISO();
        const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        datumEl.textContent = `${today.day}. ${months[today.month - 1]} ${today.year}`;
        window.draftManager.saveDraft();
      } catch (e) {}
    }

    applySettings();
    initFontInjection();
    attachGlobalListeners();
    const formatToolbarInstance = new FormatToolbar(
      document.getElementById('brieftext'),
      document.getElementById('format-toolbar')
    );
    formatToolbarInstance.init();
    checkTextOverflow();
    enforceLineLimits();
    initAddressBookSaveButton();
    // --- MODULE INITIALIZATION ---
    // Note: showToast is imported directly
    initToastSystem();
    initSenderSync();
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
  // (Local Address Book logic moved to geoapify.js and address-book-helper.js)

  // --- WYSIWYG POSTVERMERK (Sidebar Select) ---
  const sidebarPvSelect = document.getElementById('sidebar-pv-select');
  const pvInput = document.getElementById('postvermerk');

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

  if (sidebarPvSelect && pvInput) {
    pvOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt.replace('<br>', '/'); // visually strip <br> in select
      sidebarPvSelect.appendChild(option);
    });

    sidebarPvSelect.addEventListener('change', (e) => {
      if (!e.target.value) return;
      
      const val = e.target.value;
      pvInput.replaceChildren();
      const parts = val.split('<br>');
      parts.forEach((part, index) => {
        if (index > 0) pvInput.appendChild(document.createElement('br'));
        pvInput.appendChild(document.createTextNode(part.trim()));
      });
      
      saveDraftData();
      showToast("Vermerk gesetzt", "success");
      sidebarPvSelect.value = ""; // Reset to placeholder
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
        try {
          document.startViewTransition(updateFn);
        } catch(e) {
          updateFn(); // Fallback if transition is already running or crashes
        }
      } else {
        updateFn(); // Fallback for unsupported browsers
      }
    }

    // Font Stack Toggles
    if (btnFontSans) {
      btnFontSans.addEventListener('click', () => {
        settings.systemFont = 'sans';
        updateSettings();
      });
    }
    if (btnFontSerif) {
      btnFontSerif.addEventListener('click', () => {
        settings.systemFont = 'serif';
        updateSettings();
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
        if (elem.id === 'brieftext' || elem.id === 'anlagen-text') {
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
      document.documentElement.dataset.theme = 'light';
      btnThemeLight.classList.add('active');
      btnThemeDark.classList.remove('active');
      btnThemeAuto.classList.remove('active');
    } else if (settings.theme === 'dark') {
      document.documentElement.style.colorScheme = 'dark';
      document.documentElement.dataset.theme = 'dark';
      btnThemeDark.classList.add('active');
      btnThemeLight.classList.remove('active');
      btnThemeAuto.classList.remove('active');
    } else {
      document.documentElement.style.removeProperty('color-scheme'); // Inherits system color scheme
      delete document.documentElement.dataset.theme;
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
      btnToggleGuides.textContent = '📐 Falz- & Lochmarken ausblenden';
      btnToggleGuides.classList.add('primary');
    } else {
      document.documentElement.style.setProperty('--guide-opacity', '0');
      btnToggleGuides.textContent = '📐 Falz- & Lochmarken einblenden';
      btnToggleGuides.classList.remove('primary');
    }

    // 4. System Font Stacks
    if (btnFontSans && btnFontSerif) {
      document.body.classList.remove('font-stack-sans', 'font-stack-serif');
      
      btnFontSans.classList.remove('active');
      btnFontSerif.classList.remove('active');

      if (settings.systemFont === 'serif') {
        document.body.classList.add('font-stack-serif');
        btnFontSerif.classList.add('active');
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
    if (window.draftManager) window.draftManager._updateDocumentTitle();
  }

  function saveDraftData() {
    if (window.draftManager) window.draftManager.saveDraft();
  }

  // --- HTML LINE LIMITS ENFORCER (Single Line / Max 2 Lines) ---
  function enforceLineLimits() {
    const multiLineIds = ['brieftext', 'anlagen-text'];
    const maxTwoLinesIds = ['betreff'];
    
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
        
        if (e.key === 'Enter') {
          if (multiLineIds.includes(el.id)) {
            return;
          } else if (maxTwoLinesIds.includes(el.id)) {
            const text = el.innerText || el.textContent;
            if (text.split('\n').length >= 2) {
              e.preventDefault();
            }
          } else {
            e.preventDefault();
          }
        }
      });
      
      el.addEventListener('paste', (e) => {
        if (multiLineIds.includes(el.id)) return;
        
        e.preventDefault();
        let text = (e.originalEvent || e).clipboardData.getData('text/plain');
        if (maxTwoLinesIds.includes(el.id)) {
            text = text.split('\n').slice(0, 2).join('\n');
        } else {
            text = text.replace(/[\r\n]+/g, ' ');
        }
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(text));
        selection.collapseToEnd();
      });
    });
  });
  }

  function resetDraft() {
    if (window.draftManager) {
      window.draftManager.resetDraft();
      if (typeof checkTextOverflow === 'function') checkTextOverflow();
    }
  }
});



// /* @adr [[ADR-DATA-PERSISTENCE]] {JSON Data-IO} */
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


