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

import { applyLetterDate } from './47-date-format.js';
import { TextFitEngine } from './48-text-fit.js';

function syncPostvermerkFromSidebar() {
  const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById('sidebar-pv-select'));
  const field = document.getElementById('postvermerk');
  const toggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-postvermerk'));
  if (!sel || !field) return;
  if (sel.value) {
    field.textContent = sel.value;
    if (toggle) toggle.checked = true;
  } else {
    field.textContent = '';
    if (toggle) toggle.checked = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');

  initApp();

  function initApp() {
    const draftManager = new DraftManager();
    draftManager.loadDraft();
    draftManager.enableEventMode();
    syncPostvermerkFromSidebar();
    applyLetterDate();

    const uiProtections = new UIProtections();
    uiProtections.init();

    const textFitEngine = new TextFitEngine({
      onToast: (msg, type) => showToast(msg, type || 'warning'),
      onSaveDraft: () => draftManager.saveDraft()
    });
    textFitEngine.init();

    const settingsManager = new SettingsManager();
    settingsManager.init();

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

    initToastSystem();
    initSenderSync();
    initAddressServices({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });

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

  /**
   * @param {DraftManager} draftManager
   * @param {UIProtections} uiProtections
   */
  function attachGlobalListeners(draftManager, uiProtections) {
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

    const resetDialog = /** @type {HTMLDialogElement} */ (document.getElementById('reset-dialog'));
    if (btnReset && resetDialog) {
      resetDialog.addEventListener('close', () => {
        if (resetDialog.returnValue === 'confirm') {
          draftManager.resetDraft();
          applyLetterDate();
        }
      });
    }

    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('input', () => {
        draftManager.scheduleAutoSave();
      });
    });
    document.querySelectorAll('select[data-persist]').forEach(el => {
      el.addEventListener('change', () => {
        if (el.id === 'sidebar-pv-select') syncPostvermerkFromSidebar();
        draftManager.scheduleAutoSave();
      });
    });
    const btnAnlagen = document.getElementById('btn-anlagen-toggle');
    if (btnAnlagen) {
      btnAnlagen.addEventListener('click', () => {
        const toggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
        const pressed = btnAnlagen.getAttribute('aria-pressed') === 'true';
        btnAnlagen.setAttribute('aria-pressed', pressed ? 'false' : 'true');
        if (toggle) toggle.checked = !pressed;
        draftManager.scheduleAutoSave();
      });
    }
  }
});
