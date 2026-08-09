// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

/* js/main.js */
import { StorageManager } from './52-storage.js';
import { Constants } from './51-constants.js';
import { SalutationFeature } from './41-salutation-engine.js';
import { MetadataService } from './53-metadata.js';
import { SignatureFeature } from './42-signature.js';
import { initAddressServices } from './43-geoapify.js';
import { showToast, initToastSystem } from './32-toast.js';
import { initSenderSync } from './44-sender-sync.js';
import { DraftManager } from './01-draft-manager.js';
import { FormatToolbar } from './31-format-toolbar.js';
import { SettingsManager } from './02-settings-manager.js';
import { UIProtections } from './03-ui-protections.js';
import { initPostvermerk } from './33-postvermerk.js';
import { initDevTools } from './54-dev-tools.js';

import { DateFormatter } from './47-date-format.js';
import { TextFitEngine } from './48-text-fit.js';

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

    const textFitEngine = new TextFitEngine({
      onToast: (msg, type) => showToast(msg, type || 'warning'),
      onSaveDraft: () => draftManager.saveDraft()
    });
    // Feature Trace: TextFitEngine is handled inside textFitEngine
    textFitEngine.init();



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

    const dateContext = {
      settings: settingsManager.settings,
      saveSettings: () => {
        StorageManager.saveSettings(settingsManager.settings);
        settingsManager.applySettings();
      }
    };
    const dateFormatter = new DateFormatter(dateContext);
    dateFormatter.init();

    attachGlobalListeners(draftManager, uiProtections);
    
    const brieftextEl = document.getElementById('brieftext');
    const formatToolbarEl = document.getElementById('format-toolbar');
    if (brieftextEl && formatToolbarEl) {
      const formatToolbarInstance = new FormatToolbar(
        brieftextEl,
        formatToolbarEl,
        () => draftManager.saveDraft()
      );
      formatToolbarInstance.init();
    }
    
    // --- MODULE INITIALIZATION ---
    initToastSystem();
    initSenderSync();
    initAddressServices({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });
    initPostvermerk({ 
      onSaveDraft: () => draftManager.saveDraft(),
      settings: settingsManager.settings,
      saveSettings: () => {
        StorageManager.saveSettings(settingsManager.settings);
        settingsManager.applySettings();
      }
    });
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
  /**
   * @param {DraftManager} draftManager
   * @param {UIProtections} uiProtections
   */
  function attachGlobalListeners(draftManager, uiProtections) {
    // Print
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        showToast(Constants.TOASTS.PRINT_PENDING, 'info');
        const metaCtx = MetadataService.prepare();
        
        setTimeout(() => {
          window.print();
          MetadataService.restore(metaCtx);
        }, 100);
      });
    }

    // Reset
    const resetDialog = /** @type {HTMLDialogElement} */ (document.getElementById('reset-dialog'));
    if (btnReset && resetDialog) {

      resetDialog.addEventListener('close', () => {
        if (resetDialog.returnValue === 'confirm') {
          draftManager.resetDraft();
        }
      });
    }

    // Auto-Save on Input
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('input', () => {
        draftManager.scheduleAutoSave();
      });
    });
  }
});

