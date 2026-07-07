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
import { initPostvermerk } from './postvermerk.js';
import { initDevTools } from './dev-tools.js';

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
