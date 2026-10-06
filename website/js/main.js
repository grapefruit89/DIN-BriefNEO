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
 * 🚨 ARCHITECTURAL GUARD (ein Listener-Owner):
 * Einziger Sync-Pfad zwischen Postvermerk-Select und Papierfeld. boot-state.js
 * setzt nur den Initialwert und registriert bewusst KEINE Listener mehr.
 *
 * Die beiden Modi sind nicht austauschbar:
 *  - `overwrite: false` (Boot/Restore): Feld ist 100 % contenteditable (Doktrin),
 *    darf also manuell getippten Draft-Text nicht vernichten.
 *  - `overwrite: true` (aktive Auswahl): eine bewusste Vorlagen-Wahl des Users
 *    ersetzt den Feldinhalt — sonst waere das Dropdown wirkungslos, sobald
 *    einmal Text im Feld steht.
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
    // Schema-Migration VOR dem ersten Restore (DeepSeek-Longevity-Review).
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

    // 🚨 ARCHITECTURAL GUARD (JS-Kill Phase 1 / Chromium 123+):
    // Text-fitting & dynamic field scaling are 100% NATIVE CSS ('field-sizing: content',
    // 'text-fit: shrink 60%', 'overflow: clip', 'text-wrap: balance/pretty').
    // DO NOT import or re-create legacy text-fitting modules or DOM element width comparison loops.
    // Future LLMs / KIs: Replacing native CSS with JS loops is a STRICT HARD BAN (Catalog A49).

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

    /* 🚨 ARCHITECTURAL GUARD (ein Settings-Owner):
     * `settingsManager.settings` ist das EINZIGE Settings-Objekt der App.
     * Features bekommen es injiziert und persistieren ausschliesslich über
     * diesen Kontext — niemals per eigenem StorageManager.loadSettings().
     * Sonst entstehen parallele Snapshots, die sich gegenseitig ueberschreiben. */
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
        /* 🚨 ARCHITECTURAL GUARD (natives Druck-Lifecycle):
         * Aufraeumen haengt am nativen 'afterprint'-Event, NICHT an einem
         * Timer. Vorher: setTimeout(…, 100) — eine Magic Number, die bei
         * langsam oeffnendem Druckdialog zu frueh restaurierte (Metadaten
         * waren dann schon wieder weg, bevor der Dialog sie las).
         * DOM-Mutationen aus prepare() sind synchron wirksam; es gibt
         * nichts, worauf zu warten waere.
         * NIEMALS wieder einen Timer um window.print() legen. */
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
