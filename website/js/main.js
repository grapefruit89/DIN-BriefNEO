// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

import { AddressIntelligence, initAddressServices, initSenderSync } from './address.js';
import { ClipboardAddressParser } from './clipboard-parser.js';
import { Events, eventBus, initToastSystem } from './core.js';
import { collectDraft, UIProtections } from './document.js';
import { DraftManager } from './draft-manager.js';
/* js/main.js */
import { applyLetterDate, initImportExport, MetadataService, migrateStorage, requestPersistentStorage } from './persistence.js';
import { SalutationFeature } from './salutation.js';
import { SettingsManager } from './settings.js';
import { SignatureFeature } from './signature.js';

/**
 * Setzt den Postvermerk im Blattfeld und hält die Auswahlliste synchron.
 * Das Feld ist die Wahrheit (Sichtbarkeit folgt aus seinem Text), die Liste
 * ist nur Bedienoberfläche.
 * @param {string} [value]
 */
function syncPostvermerkFromSidebar(value) {
  const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  const field = document.getElementById('vermerke');
  if (!field) return;

  const val = typeof value === 'string' ? value : (sel?.value ?? '');
  if (sel && sel.value !== val) sel.value = val;

  if (!val) {
    field.textContent = '';
    field.removeAttribute('data-visible');
    return;
  }
  field.textContent = val;
  field.setAttribute('data-visible', 'true');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * Sichtbarer Fallback, wenn ein kritischer Boot-Schritt scheitert. Ohne ihn
 * bliebe die Seite in einem halb initialisierten Zustand stehen, ohne dass
 * der Nutzer den Grund sieht.
 * @param {string} schritt
 * @param {unknown} fehler
 */
function zeigeBootFehler(schritt, fehler) {
  const box = document.createElement('div');
  box.setAttribute('role', 'alert');
  box.style.cssText =
    'position:fixed;inset:auto 0 0 0;z-index:9999;padding:12px 16px;background:#7f1d1d;color:#fff;' +
    'font:14px/1.4 system-ui,sans-serif;white-space:pre-wrap';
  box.textContent =
    `Start fehlgeschlagen (${schritt}). Die Seite ist nicht vollständig funktionsfähig.\n` +
    (fehler instanceof Error ? fehler.message : String(fehler));
  document.body.appendChild(box);
}

/**
 * Führt einen Boot-Schritt aus. Unkritische Fehler werden protokolliert, der
 * Start läuft weiter; kritische zeigen den Fallback und brechen ab.
 * @param {string} name
 * @param {() => void} fn
 * @param {{ critical?: boolean }} [optionen]
 */
function bootStep(name, fn, { critical = false } = {}) {
  try {
    fn();
  } catch (fehler) {
    console.error(`[Bootstrap] ${name} fehlgeschlagen:`, fehler);
    if (critical) {
      zeigeBootFehler(name, fehler);
      throw fehler;
    }
  }
}

function initApp() {
  // Kritische Barriere: ohne Briefblatt und Betreff ist nichts benutzbar.
  bootStep('DOM-Grundgerüst', () => {
    if (!document.querySelector('din-blatt') || !document.getElementById('betreff')) {
      throw new Error('Briefblatt (din-blatt) oder Betreff fehlt im DOM.');
    }
  }, { critical: true });

  bootStep('Schema-Migration', () => migrateStorage());
  bootStep('Altlasten entfernen', () => {
    /* Binär-Assets liegen seit Schema-Umstellung in IndexedDB ([[ADR-BINARY-ASSETS]]).
     * Die alten Base64-Schlüssel werden bewusst verworfen, nicht migriert. */
    localStorage.removeItem('din_custom_font');
    localStorage.removeItem('din_signature_asset');
  });
  bootStep('Dauerhafter Speicher', () => requestPersistentStorage());

  const draftManager = new DraftManager();
  bootStep('Entwurf laden', () => draftManager.loadDraft());
  bootStep('Postvermerk', () => {
    syncPostvermerkFromSidebar(document.getElementById('vermerke')?.textContent || '');
  });
  bootStep('Briefdatum', () => applyLetterDate());

  const uiProtections = new UIProtections();
  bootStep('UI-Schutz', () => uiProtections.init());

  const settingsManager = new SettingsManager();
  bootStep('Einstellungen', () => settingsManager.init());

  bootStep('Plugins', () => {
    const controller = () => import('./multipage-controller.js');
    eventBus.subscribe(Events.PLUGIN_MULTIPAGE_TOGGLED, (payload) => {
      controller()
        .then((m) => (payload?.active ? m.mountMultipage() : m.unmountMultipage()))
        .catch((err) => console.error('[Plugins] Mehrseiten-Umschaltung fehlgeschlagen:', err));
    });
    // Der persistierte Zustand wurde beim Settings-Init publiziert, bevor dieses
    // Abo existierte — deshalb der explizite Start.
    if (settingsManager.settings.pluginMultipage) {
      controller()
        .then((m) => m.mountMultipage())
        .catch((err) => console.error('[Plugins] Mehrseiten-Start fehlgeschlagen:', err));
    }
  });

  bootStep('Globale Listener', () => attachGlobalListeners(draftManager, uiProtections));
  bootStep('Toast-System', () => initToastSystem());
  bootStep('Absender-Sync', () => initSenderSync());
  bootStep('Adressdienste', () => initAddressServices());
  bootStep('Import/Export', () => initImportExport({ collectDraft }));
  bootStep('Clipboard-Button', () => ClipboardAddressParser.wireSidebarButton());
  bootStep('Anrede', () => new SalutationFeature(settingsManager).init());
  bootStep('Signatur', () => new SignatureFeature(settingsManager).init());
  bootStep('Testdaten', () => initTestData());
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
    // Natives select: ein change-Event deckt Maus, Tastatur und Picker ab.
    const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
    if (pvSelect) {
      pvSelect.addEventListener('change', () => {
        syncPostvermerkFromSidebar(pvSelect.value);
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
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

  /** Feste Beispielbriefe: gleiche Endstrecke, nur mit vorgegebener Besetzung. */
  /** @type {Array<{ id: string, sender: string, recipient: string, hook: string, szenario: string }>} */
  const demos = [
    { id: 'btn-demo-besen', sender: 'Harry Potter', recipient: 'Spider-Man', hook: 'Besen', szenario: 'kuendigung' },
    { id: 'btn-demo-netze', sender: 'Spider-Man', recipient: 'Jack Sparrow', hook: 'Spinnennetz', szenario: 'beschwerde' }
  ];
  for (const demo of demos) {
    const btn = /** @type {HTMLButtonElement | null} */ (document.getElementById(demo.id));
    if (!btn) continue;
    btn.addEventListener('click', async () => {
      try {
        const plugin = await import('../addons/testbrief/testbrief.js');
        await plugin.starteDemoBrief(demo.sender, demo.recipient, demo.hook, demo.szenario);
      } catch (error) {
        console.warn('[Demo] Testbrief-Plugin nicht verfügbar:', error);
        btn.disabled = true;
      }
    });
  }
}
