// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

import { AddressIntelligence, initAddressServices, initSenderSync } from './address.js';
import { ClipboardAddressParser } from './clipboard-parser.js';
import { Events, eventBus, hidePopoverSafe, initToastSystem, showPopoverSafe } from './core.js';
import { collectDraft, initFormatSync, toggleBlockquote, toggleInlineFormat, UIProtections } from './document.js';
import { DraftManager } from './draft-manager.js';
import { FontFeature } from './font-feature.js';
import { applyLetterDate, formatTelefonnummer } from './format.js';
/* js/main.js */
import { initImportExport, MetadataService, requestPersistentStorage } from './persistence.js';
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

  bootStep('Altlasten entfernen', () => {
    /* Binär-Assets liegen seit Schema-Umstellung in IndexedDB ([[ADR-BINARY-ASSETS]]).
     * Die alten Base64-Schlüssel werden bewusst verworfen, nicht migriert. */
    localStorage.removeItem('din_custom_font');
    localStorage.removeItem('din_signature_asset');
  });
  bootStep('Dauerhafter Speicher', () => requestPersistentStorage());

  const draftManager = new DraftManager();
  bootStep('Entwurf laden', () => {
    draftManager.loadDraft();
    AddressIntelligence.targetLock = null;
  });
  bootStep('Postvermerk', () => {
    syncPostvermerkFromSidebar(document.getElementById('vermerke')?.textContent || '');
  });
  bootStep('Briefdatum', () => applyLetterDate());

  const uiProtections = new UIProtections();
  bootStep('UI-Schutz', () => uiProtections.init());
  bootStep('Telefon-Formatierung', () => setupPhoneFormatting());

  const settingsManager = new SettingsManager();
  bootStep('Einstellungen', () => settingsManager.init());

  bootStep('Plugins', () => {
    const controller = () => import('./multipage-controller.js');
    eventBus.subscribe(Events.PLUGIN_MULTIPAGE_TOGGLED, (payload) => {
      controller()
        .then((m) => (payload?.active ? m.mountMultipage() : m.unmountMultipage()))
        .catch((err) => console.error('[Plugins] Mehrseiten-Umschaltung fehlgeschlagen:', err));
    });
    // Mehrseiten-Modus ist fest eingeschaltet ([[ADR-EINSEITEN-STILLGELEGT]]).
    controller()
      .then((m) => m.mountMultipage())
      .catch((err) => console.error('[Plugins] Mehrseiten-Start fehlgeschlagen:', err));
  });

  bootStep('Globale Listener', () => attachGlobalListeners(draftManager));
  bootStep('Toast-System', () => initToastSystem());
  bootStep('Absender-Sync', () => initSenderSync());
  bootStep('Adressdienste', () => initAddressServices());
  bootStep('Import/Export', () => initImportExport({ collectDraft }));
  bootStep('Clipboard-Button', () => ClipboardAddressParser.wireSidebarButton());
  bootStep('Anrede', () => new SalutationFeature(settingsManager).init());
  bootStep('Signatur', () => new SignatureFeature(settingsManager).init());
  bootStep('Schriftart', () => new FontFeature(settingsManager).init());
  bootStep('Testdaten', () => initTestData());

  /* Letzter Schritt: Platzhalter freigeben (FOUC-Schutz, sheet-common.css).
   * Erst hier sind Entwurf, Briefdatum und Unterschrift gesetzt — vorher
   * wuerden die Platzhaltertexte kurz auf dem Papier stehen. */
  bootStep('Darstellung freigeben', () => {
    document.documentElement.dataset.ready = 'true';
  });
}

  /**
   * @param {DraftManager} draftManager
   */
  function attachGlobalListeners(draftManager) {
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
    let hasUndoSnapshot = false;

    const clearUndoSnapshot = () => {
      hasUndoSnapshot = false;
      if (undoTimer) {
        clearTimeout(undoTimer);
        undoTimer = null;
      }
      try {
        sessionStorage.removeItem('din_reset_snapshot');
      } catch (e) {
        console.warn('[Undo] sessionStorage.removeItem fehlgeschlagen:', e);
      }
      hidePopoverSafe(undoHinweis);
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
          hasUndoSnapshot = true;
          showPopoverSafe(undoHinweis);
          if (undoTimer) clearTimeout(undoTimer);
          undoTimer = setTimeout(clearUndoSnapshot, 5000);
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
            AddressIntelligence.targetLock = null;
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
      if (hasUndoSnapshot) {
        clearUndoSnapshot();
      }
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
        if (anlagenEl instanceof HTMLTextAreaElement && anlagenSwitch.checked && !anlagenEl.value.trim()) {
          anlagenEl.value = 'Anlage 1';
        }
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
    }

    // Fuss- und Teilbetreff-Schalter haben keine eigene UI-Logik (die Sichtbarkeit
    // steuert CSS ueber :has()), brauchen aber denselben Speicherimpuls: ohne ihn
    // landet ihr Zustand nie im Entwurf und ist nach einem Neuladen weg.
    for (const id of ['toggle-fuss', 'toggle-teilbetreff']) {
      const schalter = /** @type {HTMLInputElement | null} */ (document.getElementById(id));
      if (!schalter) continue;
      schalter.addEventListener('change', () => {
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
    }

    // Textformatierung (B, I, ❝): Range-API, kein nativer Editing-Befehl (A52). pointerdown
    // + preventDefault haelt Fokus und Selection im #text, sonst wirkt der
    // Umbau ins Leere und auf Touch kollabiert die Auswahl.
    const btnBold = document.getElementById('btn-bold');
    const btnItalic = document.getElementById('btn-italic');
    const btnQuote = document.getElementById('btn-quote');
    const textEl = document.getElementById('text');
    if (btnBold && btnItalic && btnQuote && textEl) {
      for (const btn of [btnBold, btnItalic, btnQuote]) {
        btn.addEventListener('pointerdown', (e) => e.preventDefault());
      }
      btnBold.addEventListener('click', () => toggleInlineFormat(textEl, 'b'));
      btnItalic.addEventListener('click', () => toggleInlineFormat(textEl, 'i'));
      btnQuote.addEventListener('click', () => toggleBlockquote(textEl));
      initFormatSync();
    }
  }

/**
 * Verdrahtet die Testdaten- & Demo-Buttons. Das Plugin wird erst beim Klick geladen,
 * damit weder Figurendaten noch Demo-Texte im Startpfad liegen.
 */
function initTestData() {
  const btnTestbrief = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-testbrief'));
  if (btnTestbrief) {
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

  const btnDemoLang = document.getElementById('btn-demo-lang');
  if (btnDemoLang) {
    btnDemoLang.addEventListener('click', async () => {
      try {
        const { fuelleDemoText } = await import('../addons/testbrief/testbrief.js');
        fuelleDemoText('lang');
      } catch (error) {
        console.warn('[Testbrief] Demo-Text nicht verfügbar:', error);
      }
    });
  }

  const btnDemoKurz = document.getElementById('btn-demo-kurz');
  if (btnDemoKurz) {
    btnDemoKurz.addEventListener('click', async () => {
      try {
        const { fuelleDemoText } = await import('../addons/testbrief/testbrief.js');
        fuelleDemoText('kurz');
      } catch (error) {
        console.warn('[Testbrief] Demo-Text nicht verfügbar:', error);
      }
    });
  }
}

/**
 * DIN 5008 11.3.2: Formatierung deutscher Rufnummern beim Verlassen des Telefonfeldes.
 * Bewusst nur bei blur, nicht während des Tippens.
 */
function setupPhoneFormatting() {
  const tel = document.getElementById('absender-tel');
  if (!tel) return;
  tel.addEventListener('blur', () => {
    const current = (tel.textContent || '').trim();
    if (!current) return;
    const formatted = formatTelefonnummer(current);
    if (formatted && formatted !== current) {
      tel.textContent = formatted;
      tel.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

