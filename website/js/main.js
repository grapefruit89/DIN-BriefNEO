// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

/* js/main.js */
import { saveJSON, migrateStorage, STORAGE_KEYS, MetadataService, applyLetterDate, initImportExport } from './persistence.js';
import { SalutationFeature } from './salutation.js';
import { SettingsManager, SignatureFeature } from './settings.js';
import { initToastSystem, eventBus, Events } from './core.js';
import { initAddressServices, initSenderSync, AddressIntelligence, ClipboardAddressParser } from './address.js';
import { DraftManager, UIProtections, collectDraft } from './document.js';

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
    migrateStorage();
    const draftManager = new DraftManager();
    const hasDraft = draftManager.loadDraft();
    if (!hasDraft) syncPostvermerkFromSidebar();

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
      initAddressServices();
    } catch (e) {
      console.error('[Bootstrap] initAddressServices fehlgeschlagen:', e);
    }

    try {
      initImportExport({ collectDraft });
    } catch (e) {
      console.error('[Bootstrap] initImportExport fehlgeschlagen:', e);
    }

    try {
      ClipboardAddressParser.wireSidebarButton();
    } catch (e) {
      console.error('[Bootstrap] ClipboardAddressParser.wireSidebarButton fehlgeschlagen:', e);
    }

    try {
      const salutation = new SalutationFeature(settingsManager);
      salutation.init();
    } catch (e) {
      console.error('[Bootstrap] SalutationFeature.init fehlgeschlagen:', e);
    }

    try {
      const signature = new SignatureFeature(settingsManager);
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
    /** @type {any} */
    let metaCtx = null;
    window.addEventListener('beforeprint', () => {
      metaCtx = MetadataService.prepare();
    });
    window.addEventListener('afterprint', () => {
      if (metaCtx) {
        MetadataService.restore(metaCtx);
        metaCtx = null;
      }
    });

    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    const resetDialog = /** @type {HTMLDialogElement} */ (document.getElementById('reset-dialog'));
    if (btnReset && resetDialog) {
      resetDialog.addEventListener('close', () => {
        const confirmed = resetDialog.returnValue === 'confirm';
        queueMicrotask(() => { resetDialog.returnValue = ''; });
        if (!confirmed) return;
        draftManager.resetDraft();
        applyLetterDate();
        AddressIntelligence.targetLock = null;
      });
    }

    const briefblatt = document.querySelector('din-a4') || document;
    briefblatt.addEventListener('input', (e) => {
      if (e.target instanceof Element && e.target.closest('[contenteditable]')) {
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      }
    });
    document.querySelectorAll('select[data-speichern]').forEach(el => {
      el.addEventListener('change', () => {
        /* Aktive Auswahl des Users -> ueberschreibt (siehe Guard an der Funktion). */
        if (el.id === 'seitenleiste-postvermerk-select') syncPostvermerkFromSidebar({ overwrite: true });
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
    });
  }
});
