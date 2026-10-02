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
import { initSenderSync } from './45-address-intelligence.js';
import { DraftManager } from './01-draft-manager.js';
import { FormatToolbar } from './31-format-toolbar.js';
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

/**
 * Keeps the control surface at its authored visual size when desktop page zoom
 * changes via Ctrl+/Ctrl-. This is deliberately scoped to the Seitenleiste:
 * Das DIN-Blatt nutzt bereits physische Einheiten und bleibt im normalen
 * Viewport-Koordinatensystem des Browsers. The initial DPR captures OS/display scaling;
 * only later DPR changes are interpreted as page zoom.
 */
function stabilizeSidebarForPageZoom() {
  const seitenleiste = document.querySelector('aside');
  if (!seitenleiste) return;
  const initialDpr = window.devicePixelRatio || 1;
  const apply = () => {
    const currentDpr = window.devicePixelRatio || initialDpr;
    const zoomRatio = currentDpr / initialDpr;
    seitenleiste.style.setProperty('--seitenleisten-zoom', String(1 / zoomRatio));
  };
  apply();
  window.addEventListener('resize', apply, { passive: true });
  window.visualViewport?.addEventListener('resize', apply, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');

  stabilizeSidebarForPageZoom();
  initApp();

  function initApp() {
    // Schema-Migration VOR dem ersten Restore (DeepSeek-Longevity-Review).
    StorageManager.migrate();
    const draftManager = new DraftManager();
    draftManager.loadDraft();
    syncPostvermerkFromSidebar();
    applyLetterDate();

    const uiProtections = new UIProtections();
    uiProtections.init();

    // 🚨 ARCHITECTURAL GUARD (JS-Kill Phase 1 / Chrome 123+ / Baseline 2024-2026):
    // Text-fitting & dynamic field scaling are 100% NATIVE CSS ('field-sizing: content',
    // 'text-fit: shrink 60%', 'overflow: clip', 'text-wrap: balance/pretty').
    // DO NOT import or re-create legacy text-fitting modules or DOM element width comparison loops.
    // Future LLMs / KIs: Replacing native CSS with JS loops is a STRICT HARD BAN (Catalog A49).

    const settingsManager = new SettingsManager();
    settingsManager.init();

    attachGlobalListeners(draftManager, uiProtections);

    const textEl = document.getElementById('text');
    const formatToolbarEl = document.getElementById('format-toolbar');
    if (textEl && formatToolbarEl) {
      const formatToolbarInstance = new FormatToolbar(
        textEl,
        formatToolbarEl,
        () => draftManager.saveDraft()
      );
      formatToolbarInstance.init();
    }

    initToastSystem();
    initSenderSync();
    initAddressServices({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });
    initImportExport({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });
    ClipboardAddressParser.wireSidebarButton({ onToast: showToast, onSaveDraft: () => draftManager.saveDraft() });

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

    const salutation = new SalutationFeature(() => draftManager.saveDraft(), settingsContext);
    salutation.init();

    /* SignatureFeature erwartet historisch `saveSettings` als Methodennamen. */
    const sigContext = {
      settings: settingsContext.settings,
      saveSettings: settingsContext.save
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
