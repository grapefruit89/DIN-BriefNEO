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
import { SettingsManager } from './settings-manager.js';
import { UIProtections } from './ui-protections.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM ELEMENTS ---
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');

  // --- Initialize App ---
  initApp();

  function initApp() {
    window.draftManager = new DraftManager();
    window.draftManager.loadDraft();
    window.draftManager.enableEventMode();
    
    window.uiProtections = new UIProtections();
    window.uiProtections.init();

    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('input', () => {
        window.draftManager.scheduleAutoSave();
        if (el.id === 'brieftext' || el.id === 'anlagen-text') {
          if (window.uiProtections) window.uiProtections.checkTextOverflow();
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

    const settingsManager = new SettingsManager();
    // Feature Trace: document.startViewTransition is now handled inside settingsManager._transitionState
    settingsManager.init();

    attachGlobalListeners();
    
    const formatToolbarInstance = new FormatToolbar(
      document.getElementById('brieftext'),
      document.getElementById('format-toolbar')
    );
    formatToolbarInstance.init();
    
    window.uiProtections.checkTextOverflow();
    initAddressBookSaveButton();
    
    // --- MODULE INITIALIZATION ---
    initToastSystem();
    initSenderSync();
    initAddressServices({ onToast: showToast, onSaveDraft: () => window.draftManager?.saveDraft() });
    
    const salutation = new SalutationFeature(() => window.draftManager?.saveDraft());
    salutation.init();

    const sigContext = {
      settings: settingsManager.settings,
      saveSettings: () => {
        StorageManager.saveSettings(settingsManager.settings);
        settingsManager.applySettings();
      }
    };
    const signature = new SignatureFeature(sigContext);
    signature.init();
  }

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
      
      if (window.draftManager) window.draftManager.saveDraft();
      showToast("Vermerk gesetzt", "success");
      sidebarPvSelect.value = ""; // Reset to placeholder
    });
  }

  // --- GLOBAL EVENT LISTENERS & TRIGGERS ---
  function attachGlobalListeners() {
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
        window.draftManager?.resetDraft();
        if (window.uiProtections) window.uiProtections.checkTextOverflow();
      }
    });

    // Auto-Save editables (Global State & Debouncing)
    let debounceSaveTimer = null;
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      elem.addEventListener('input', () => {
        clearTimeout(debounceSaveTimer);
        debounceSaveTimer = setTimeout(() => {
          if (window.draftManager) window.draftManager.saveDraft();
          console.log('[Store] Global State auto-saved (debounced 400ms).');
        }, 400);
        if (elem.id === 'brieftext' || elem.id === 'anlagen-text') {
          if (window.uiProtections) window.uiProtections.checkTextOverflow();
        }
      });
    });
  }
});

// /* @adr [[ADR-DATA-PERSISTENCE]] {JSON Data-IO} */
// JSON Export (Dev Tool)
document.getElementById('btn-copy-json')?.addEventListener('click', async (e) => {
  const btn = e.target;
  const originalText = btn.textContent;
  btn.textContent = 'Kopiere...';
  
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
