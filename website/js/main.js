// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

import { AddressIntelligence, ClipboardAddressParser, initAddressServices, initSenderSync } from './address.js';
import { Events, eventBus, initToastSystem } from './core.js';
import { collectDraft, DraftManager, UIProtections } from './document.js';
/* js/main.js */
import { applyLetterDate, initImportExport, MetadataService, migrateStorage } from './persistence.js';
import { SalutationFeature } from './salutation.js';
import { SettingsManager, SignatureFeature } from './settings.js';

/**
 * Synchronisiert die Postvermerk-Auswahl mit dem Blattfeld und dem Popover-Trigger.
 * @param {string} [value]
 */
function syncPostvermerkFromSidebar(value) {
  const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  const triggerLabel = document.getElementById('postvermerk-trigger-label');
  const triggerBtn = document.getElementById('btn-postvermerk-trigger');
  const popover = document.getElementById('postvermerk-popover');
  const field = document.getElementById('vermerke');
  if (!field) return;

  const val = typeof value === 'string' ? value : (sel?.value ?? '');
  if (!val) {
    field.textContent = '';
    field.removeAttribute('data-visible');
    if (sel) sel.value = '';
    if (triggerLabel) triggerLabel.textContent = '— kein —';
    if (triggerBtn) triggerBtn.removeAttribute('data-active');
  } else {
    field.textContent = val;
    field.setAttribute('data-visible', 'true');
    if (sel && sel.value !== val) sel.value = val;
    if (triggerLabel) triggerLabel.textContent = val;
    if (triggerBtn) triggerBtn.setAttribute('data-active', 'true');
  }

  if (popover) {
    popover.querySelectorAll('.popover-item').forEach(item => {
      const isSelected = (item.getAttribute('data-value') || '') === val;
      item.setAttribute('aria-selected', String(isSelected));
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  // Schema-Migration vor dem ersten Restore
    migrateStorage();
    /* Binär-Assets liegen seit Schema-Umstellung in IndexedDB ([[ADR-BINARY-ASSETS]]).
     * Die alten Base64-Schlüssel werden bewusst verworfen, nicht migriert. */
    try {
      localStorage.removeItem('din_custom_font');
      localStorage.removeItem('din_signature_asset');
    } catch {}
    const draftManager = new DraftManager();
    draftManager.loadDraft();
    const initPv = document.getElementById('vermerke')?.textContent || '';
    syncPostvermerkFromSidebar(initPv);

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

    try {
      initTestData();
    } catch (e) {
      console.error('[Bootstrap] initTestData fehlgeschlagen:', e);
    }

    // Eingebaute Debug-Funktionen (?debug=autocomplete, ?debug=json oder ?debug=autocomplete,json)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const debugVal = urlParams.get('debug') || '';
      const debugModes = debugVal.split(',').map(s => s.trim().toLowerCase());

      if (debugModes.includes('autocomplete')) {
        const panel = document.getElementById('panel-autocomplete');
        if (panel) panel.hidden = false;
        import('./debug-panel.js').then(m => m.mountAutocompletePanel()).catch(err => {
          console.error('[DebugPanel] Autocomplete Initialisierung fehlgeschlagen:', err);
        });
      }

      if (debugModes.includes('json')) {
        const panel = document.getElementById('panel-json');
        if (panel) panel.hidden = false;
        import('./debug-panel.js').then(m => m.mountJsonPanel()).catch(err => {
          console.error('[DebugPanel] JSON Initialisierung fehlgeschlagen:', err);
        });
      }
    } catch (e) {
      console.error('[Bootstrap] Debug-Module fehlgeschlagen:', e);
    }
  }

  /**
   * @param {DraftManager} draftManager
   * @param {UIProtections} [_uiProtections]
   */
  function attachGlobalListeners(draftManager, _uiProtections) {
    const btnPrint = document.getElementById('btn-print');
    const btnReset = document.getElementById('btn-reset');
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
    const undoHinweis = /** @type {HTMLElement | null} */ (document.getElementById('undo-hinweis'));
    const btnUndoReset = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-undo-reset'));
    const undoHinweisClose = /** @type {HTMLButtonElement | null} */ (document.getElementById('undo-hinweis-close'));
    /** @type {any} */
    let undoTimer = null;

    const clearUndoSnapshot = () => {
      if (undoTimer) {
        clearTimeout(undoTimer);
        undoTimer = null;
      }
      try {
        sessionStorage.removeItem('din_reset_snapshot');
      } catch (e) {
        console.warn('[Undo] sessionStorage.removeItem fehlgeschlagen:', e);
      }
      try {
        if (undoHinweis?.matches(':popover-open')) {
          undoHinweis.hidePopover();
        }
      } catch (_) {}
    };

    if (btnReset && resetDialog) {
      resetDialog.addEventListener('close', () => {
        const confirmed = resetDialog.returnValue === 'confirm';
        queueMicrotask(() => { resetDialog.returnValue = ''; });
        if (!confirmed) return;

        // Nur der letzte Reset ist rückgängig. Ein weiterer Reset überschreibt den Snapshot.
        let snapshotSaved = false;
        try {
          const snapshot = collectDraft();
          sessionStorage.setItem('din_reset_snapshot', JSON.stringify(snapshot));
          snapshotSaved = true;
        } catch (e) {
          console.warn('[Undo] Snapshot konnte nicht in sessionStorage gesichert werden:', e);
        }

        draftManager.resetDraft();
        applyLetterDate();
        AddressIntelligence.targetLock = null;

        if (snapshotSaved && undoHinweis) {
          try {
            undoHinweis.showPopover();
            if (undoTimer) clearTimeout(undoTimer);
            undoTimer = setTimeout(clearUndoSnapshot, 5000);
          } catch (e) {
            console.warn('[Undo] Popover konnte nicht geöffnet werden:', e);
          }
        }
      });
    }

    if (btnUndoReset) {
      btnUndoReset.addEventListener('click', () => {
        try {
          const raw = sessionStorage.getItem('din_reset_snapshot');
          if (raw) {
            const data = JSON.parse(raw);
            draftManager.restoreDraft(data);
          }
        } catch (e) {
          console.error('[Undo] Fehler beim Wiederherstellen des Snapshots:', e);
        }
        clearUndoSnapshot();
      });
    }

    if (undoHinweisClose) {
      undoHinweisClose.addEventListener('click', clearUndoSnapshot);
    }

    const briefblatt = document.querySelector('din-blatt') || document;
    briefblatt.addEventListener('input', (e) => {
      try {
        if (sessionStorage.getItem('din_reset_snapshot')) {
          clearUndoSnapshot();
        }
      } catch (_) {}
      if (e.target instanceof Element && e.target.closest('[contenteditable]')) {
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      }
    });
    const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
    if (pvSelect) {
      pvSelect.addEventListener('click', (e) => {
        const option = e.target instanceof Element ? e.target.closest('option') : null;
        if (!option) return;
        syncPostvermerkFromSidebar(/** @type {HTMLOptionElement} */ (option).value);
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
      pvSelect.addEventListener('change', () => {
        syncPostvermerkFromSidebar(pvSelect.value);
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
    }

    // Native HTML Popover Integration für Postvermerk
    const pvPopover = /** @type {HTMLElement & { hidePopover: () => void } | null} */ (document.getElementById('postvermerk-popover'));
    const pvTrigger = document.getElementById('btn-postvermerk-trigger');
    if (pvPopover && pvTrigger) {
      pvPopover.addEventListener('toggle', (e) => {
        const isOpen = /** @type {ToggleEvent} */ (e).newState === 'open';
        pvTrigger.setAttribute('aria-expanded', String(isOpen));
      });

      pvPopover.addEventListener('click', (e) => {
        const btn = /** @type {HTMLElement | null} */ (e.target)?.closest('.popover-item');
        if (!btn) return;
        const val = btn.getAttribute('data-value') || '';
        syncPostvermerkFromSidebar(val);
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
        try { pvPopover.hidePopover(); } catch(_) {}
      });

      pvPopover.addEventListener('keydown', (e) => {
        const items = /** @type {HTMLElement[]} */ (Array.from(pvPopover.querySelectorAll('.popover-item')));
        const active = document.activeElement;
        const idx = items.indexOf(/** @type {HTMLElement} */ (active));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = idx < items.length - 1 ? idx + 1 : 0;
          items[next]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = idx > 0 ? idx - 1 : items.length - 1;
          items[prev]?.focus();
        } else if (e.key === 'Escape') {
          try { pvPopover.hidePopover(); } catch(_) {}
          pvTrigger.focus();
        }
      });
    }
    const anlagenSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
    if (anlagenSwitch) {
      anlagenSwitch.addEventListener('change', () => {
        const anlagenEl = document.getElementById('anlagen-angabe');
        if (anlagenEl && anlagenSwitch.checked && !anlagenEl.textContent?.trim()) {
          const li = document.createElement('li');
          li.textContent = 'Anlage 1';
          anlagenEl.replaceChildren(li);
        }
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
    }
  }

/**
 * Verdrahtet den Testbrief-Button. Das Plugin wird erst beim Klick geladen,
 * damit die Figurendaten nicht im Startpfad liegen.
 */
function initTestData() {
  const btnTestbrief = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-testbrief'));
  if (!btnTestbrief) return;

  btnTestbrief.addEventListener('click', async () => {
    try {
      const plugin = await import('../addons/testbrief/testbrief.js');
      await plugin.starteTestbrief();
    } catch (error) {
      console.warn('[Testbrief] Plugin nicht verfügbar:', error);
      btnTestbrief.disabled = true;
      btnTestbrief.title = 'Testbrief-Plugin nicht gefunden';
    }
  });
}
