// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

/* js/main.js */
import { StorageManager } from './30-utils/02-storage.js';
import { Constants } from './30-utils/01-constants.js';
import { SalutationFeature } from './20-features/01-salutation-engine.js';
import { MetadataService } from './30-utils/03-metadata.js';
import { SignatureFeature } from './20-features/02-signature.js';
import { initAddressServices } from './20-features/03-geoapify.js';
import { showToast, initToastSystem } from './10-ui/02-toast.js';
import { initSenderSync } from './20-features/04-sender-sync.js';
import { initAddressBookSaveButton } from './20-features/05-address-book-helper.js';
import { DraftManager } from './00-core/01-draft-manager.js';
import { FormatToolbar } from './10-ui/01-format-toolbar.js';
import { SettingsManager } from './00-core/02-settings-manager.js';
import { UIProtections } from './00-core/03-ui-protections.js';
import { initPostvermerk } from './10-ui/03-postvermerk.js';
import { initDevTools } from './30-utils/04-dev-tools.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM ELEMENTS ---
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');

  // --- Initialize App ---
  initApp();

  function initApp() {
    const draftManager = new DraftManager();
    draftManager.loadDraft();
    draftManager.enableEventMode();
    
    const uiProtections = new UIProtections();
    uiProtections.init();

    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('input', () => {
        draftManager.scheduleAutoSave();
        if (el.id === 'brieftext' || el.id === 'anlagen-text') {
          uiProtections.checkTextOverflow();
        }
      });
    });

    const datumEl = document.getElementById('datum');
    if (datumEl && !datumEl.textContent.trim()) {
      try {
        const today = Temporal.Now.plainDateISO();
        const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        datumEl.textContent = `${today.day}. ${months[today.month - 1]} ${today.year}`;
        draftManager.saveDraft();
      } catch (e) {}
    }

    const settingsManager = new SettingsManager();
    // Feature Trace: document.startViewTransition is now handled inside settingsManager._transitionState
    settingsManager.init();

    attachGlobalListeners(draftManager, uiProtections);
    
    const formatToolbarInstance = new FormatToolbar(
      document.getElementById('brieftext'),
      document.getElementById('format-toolbar'),
      () => draftManager.saveDraft()
    );
    formatToolbarInstance.init();
    
    uiProtections.checkTextOverflow();
    initAddressBookSaveButton();
    
    // --- MODULE INITIALIZATION ---
    initToastSystem();
    initSenderSync();
    initAddressServices({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });
    initPostvermerk(() => draftManager.saveDraft());
    initDevTools();
    
    const salutation = new SalutationFeature(() => draftManager.saveDraft());
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

  // --- GLOBAL EVENT LISTENERS & TRIGGERS ---
  function attachGlobalListeners(draftManager, uiProtections) {
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
        draftManager.resetDraft();
        uiProtections.checkTextOverflow();
      }
    });

    // Auto-Save editables (Global State & Debouncing)
    let debounceSaveTimer = null;
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      elem.addEventListener('input', () => {
        clearTimeout(debounceSaveTimer);
        debounceSaveTimer = setTimeout(() => {
          draftManager.saveDraft();
          console.log('[Store] Global State auto-saved (debounced 400ms).');
        }, 400);
        if (elem.id === 'brieftext' || elem.id === 'anlagen-text') {
          uiProtections.checkTextOverflow();
        }
      });
    });
  }
});
