// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

import { AddressIntelligence, initAddressServices, initSenderSync } from './address.js';
import { ClipboardAddressParser } from './clipboard-parser.js';
import { Events, eventBus, initToastSystem } from './core.js';
import { collectDraft, initFormatSync, toggleBlockquote, toggleInlineFormat, UIProtections } from './document.js';
import { DraftManager } from './draft-manager.js';
import { Field } from './field.js';
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

  /* Field statt textContent: #vermerke ist seit 2026-11-12 ein <input>.
     Mit textContent blieb das Feld leer und zeigte nur seinen Platzhalter
     ("Postvermerk") - gemeldet 2026-11-12. */
  if (!val) {
    Field.setValue(field, '');
    field.removeAttribute('data-visible');
    return;
  }
  Field.setValue(field, val);
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

/**
 * Wie `bootStep`, aber liefert den Wert und meldet den Fehler sichtbar.
 *
 * Warum es das gibt: `new DraftManager()` stand vorher nackt in `initApp`. Der
 * Konstruktor haengt die Speicher-Abos (`draft-manager.js`, `#initEventBus`);
 * wirft er, bricht `initApp` ohne jede Meldung ab — die Seite sieht normal aus
 * und speichert nichts. Gemessen 2026-11-12: das Abo auf
 * `DOCUMENT_SAVE_REQUESTED` entsteht ausschliesslich im Konstruktor.
 * @template T
 * @param {string} name
 * @param {() => T} fn
 * @returns {T}
 */
function kritischerWert(name, fn) {
  try {
    return fn();
  } catch (fehler) {
    console.error(`[Bootstrap] ${name} fehlgeschlagen:`, fehler);
    zeigeBootFehler(name, fehler);
    throw fehler;
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

  const draftManager = kritischerWert('Speicher-Abos', () => new DraftManager());
  /* Kritisch, weil ein stiller Fehlschlag hier den gespeicherten Entwurf
     verbirgt: die Seite startet leer, der naechste Tastendruck speichert darueber.
     Besser sichtbar abbrechen als den Entwurf ueberschreiben. */
  bootStep('Entwurf laden', () => {
    draftManager.loadDraft();
    AddressIntelligence.targetLock = null;
  }, { critical: true });
  bootStep('Postvermerk', () => {
    syncPostvermerkFromSidebar(Field.getValue(document.getElementById('vermerke')));
  });
  bootStep('Briefdatum', () => applyLetterDate());

  const uiProtections = kritischerWert('UI-Schutz-Objekt', () => new UIProtections());
  bootStep('UI-Schutz', () => uiProtections.init());
  bootStep('Telefon-Formatierung', () => setupPhoneFormatting());

  const settingsManager = kritischerWert('Einstellungen-Objekt', () => new SettingsManager());
  bootStep('Einstellungen', () => settingsManager.init());

  bootStep('Plugins', () => {
    // Mehrseiten-Modus ist fest eingeschaltet ([[ADR-EINSEITEN-STILLGELEGT]]).
    // Kein Umschalt-Signal mehr: der Controller wird genau einmal gemountet.
    import('./multipage-controller.js')
      .then((m) => m.mountMultipage())
      .catch((err) => console.error('[Plugins] Mehrseiten-Start fehlgeschlagen:', err));
  });

  /* Kritisch: hier entsteht der Listener input -> Speichern. Faellt er aus,
     tippt der Nutzer in eine vollstaendig wirkende App, und nichts wird
     gespeichert (main.js:191, gemessen 2026-11-12). */
  bootStep('Globale Listener', () => attachGlobalListeners(draftManager), { critical: true });
  bootStep('Toast-System', () => initToastSystem());
  bootStep('Absender-Sync', () => initSenderSync());
  bootStep('Adressdienste', () => initAddressServices());
  bootStep('Import/Export', () => initImportExport({ collectDraft }));
  bootStep('Clipboard-Button', () => ClipboardAddressParser.wireSidebarButton());
  bootStep('Anrede', () => new SalutationFeature(settingsManager).init());
  bootStep('Signatur', () => new SignatureFeature(settingsManager).init());
  bootStep('Schriftart', () => new FontFeature(settingsManager).init());
  bootStep('Testdaten', () => initTestData());

  bootStep('Darstellung freigeben', () => {
    // data-ready schaltet die Platzhalter frei (siehe sheet-common.css).
    // Bei Fehlschlag dieses Schritts versteckt boot.js sie nach 2 s (Sicherheitsnetz).
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

    if (btnReset && resetDialog) {
      resetDialog.addEventListener('close', () => {
        const confirmed = resetDialog.returnValue === 'confirm';
        queueMicrotask(() => { resetDialog.returnValue = ''; });
        if (!confirmed) return;

        /* Kein zweites Undo-Popover: der Dialog fragt bereits „Möchtest du
           alle Texte wirklich zurücksetzen?". Ein „Rückgängig"-Hinweis danach
           erklärt den Nutzer für unmündig (Entscheidung 2026-11-12). */
        draftManager.resetDraft();
        applyLetterDate();
        AddressIntelligence.targetLock = null;
      });
    }

    const briefblatt = document.querySelector('din-blatt') || document;
    briefblatt.addEventListener('input', (e) => {
      if (
        e.target instanceof Element &&
        e.target.closest('[contenteditable], input[data-atom], textarea[data-feldtyp]')
      ) {
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

    // Der Fuss-Schalter hat keine eigene UI-Logik, braucht aber denselben
    // Speicherimpuls: ohne ihn landet sein Zustand nie im Entwurf und ist nach
    // einem Neuladen weg.
    for (const id of ['toggle-fuss']) {
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
    /* Field statt textContent: `#absender-tel` ist seit 2026-11-12 ein
       <input>. textContent ist dort immer leer - die Formatierung lief
       dadurch nie (gemeldet 2026-11-12 im Umfeld des Empfaenger-Feldes). */
    const current = Field.getValue(tel).trim();
    if (!current) return;
    const formatted = formatTelefonnummer(current);
    if (formatted && formatted !== current) {
      Field.setValue(tel, formatted);
      tel.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

