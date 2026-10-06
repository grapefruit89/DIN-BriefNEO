// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

/* js/main.js */
import { StorageManager, Constants } from './51-storage.js';
import { SalutationFeature } from './41-salutation-engine.js';
import { MetadataService } from './53-metadata.js';
import { SignatureFeature } from './42-signature.js';
import { initAddressServices } from './43-geoapify.js';
import { showToast, initToastSystem } from './32-toast.js';
import { initSenderSync, AddressIntelligence } from './45-address-intelligence.js';
import { DraftManager } from './01-draft-manager.js';
import { SettingsManager } from './02-settings-manager.js';
import { UIProtections } from './03-ui-protections.js';

import { applyLetterDate } from './47-date-format.js';
import { ClipboardAddressParser } from './46-clipboard-address-parser.js';
import { initImportExport } from './52-import-export.js';

/**
 * Synchronisiert die Postvermerk-Auswahl mit dem Blattfeld.
 * @param {{ overwrite?: boolean }} [options]
 */
function syncPostvermerkFromSidebar({ overwrite = false } = {}) {
  const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  const field = document.getElementById('postvermerk');
  if (!sel || !field) return;
  if (overwrite || !field.textContent.trim()) field.textContent = sel.value;
}

document.addEventListener('DOMContentLoaded', () => {
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');

  initApp();

  function initApp() {
    // Schema-Migration vor dem ersten Restore
    StorageManager.migrate();
    const draftManager = new DraftManager();
    draftManager.loadDraft();
    syncPostvermerkFromSidebar();

    try {
      applyLetterDate();
    } catch (e) {
      console.warn('[Bootstrap] applyLetterDate fehlgeschlagen:', e);
    }

    const uiProtections = new UIProtections();
    try {
      uiProtections.init();
    } catch (e) {
      console.error('[Bootstrap] uiProtections.init fehlgeschlagen:', e);
    }

    // Layout- und Textanpassung laufen rein über natives CSS ('field-sizing', 'text-fit', 'overflow: clip')

    const settingsManager = new SettingsManager();
    try {
      settingsManager.init();
    } catch (e) {
      console.error('[Bootstrap] settingsManager.init fehlgeschlagen:', e);
    }

    attachGlobalListeners(draftManager, uiProtections);

    try {
      initToastSystem();
    } catch (e) {
      console.error('[Bootstrap] initToastSystem fehlgeschlagen:', e);
    }

    try {
      initSenderSync();
    } catch (e) {
      console.error('[Bootstrap] initSenderSync fehlgeschlagen:', e);
    }

    try {
      initAddressServices({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });
    } catch (e) {
      console.error('[Bootstrap] initAddressServices fehlgeschlagen:', e);
    }

    try {
      initImportExport({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });
    } catch (e) {
      console.error('[Bootstrap] initImportExport fehlgeschlagen:', e);
    }

    try {
      ClipboardAddressParser.wireSidebarButton({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });
    } catch (e) {
      console.error('[Bootstrap] ClipboardAddressParser.wireSidebarButton fehlgeschlagen:', e);
    }

    // Zentrale Settings-Instanz: Features teilen sich dieselbe Referenz
    const settingsContext = {
      settings: settingsManager.settings,
      save: () => {
        StorageManager.saveSettings(settingsManager.settings);
        settingsManager.applySettings();
      }
    };

    try {
      const salutation = new SalutationFeature(() => draftManager.saveDraft(), settingsContext);
      salutation.init();
    } catch (e) {
      console.error('[Bootstrap] SalutationFeature.init fehlgeschlagen:', e);
    }

    try {
      const signature = new SignatureFeature(settingsContext);
      signature.init();
    } catch (e) {
      console.error('[Bootstrap] SignatureFeature.init fehlgeschlagen:', e);
    }
  }

  /**
   * @param {DraftManager} draftManager
   * @param {UIProtections} uiProtections
   */
  function attachGlobalListeners(draftManager, uiProtections) {
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        // Druck-Lifecycle: Metadaten vorbereiten und nach dem Druck aufräumen
        const metaCtx = MetadataService.prepare();
        window.addEventListener('afterprint', () => {
          MetadataService.restore(metaCtx);
        }, { once: true });
        window.print();
      });
    }

    const resetDialog = /** @type {HTMLDialogElement} */ (document.getElementById('reset-dialog'));
    if (btnReset && resetDialog) {
      resetDialog.addEventListener('close', () => {
        if (resetDialog.returnValue === 'confirm') {
          draftManager.resetDraft();
          applyLetterDate();
          AddressIntelligence.targetLock = null;
        }
      });
    }

    const briefblatt = document.querySelector('din-a4') || document;
    briefblatt.addEventListener('input', (e) => {
      if (e.target instanceof Element && e.target.closest('[contenteditable]')) {
        draftManager.scheduleAutoSave();
      }
    });
    document.querySelectorAll('select[data-speichern]').forEach(el => {
      el.addEventListener('change', () => {
        /* Aktive Auswahl des Users -> ueberschreibt (siehe Guard an der Funktion). */
        if (el.id === 'seitenleiste-postvermerk-select') syncPostvermerkFromSidebar({ overwrite: true });
        draftManager.scheduleAutoSave();
      });
    });
  }
});
