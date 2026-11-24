// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

import { initAddonDispatcher } from './addons.js';
import { AddressIntelligence, initAddressServices, initSenderSync } from './address.js';
import { initApi } from './api.js';
import { Events, eventBus, initToastSystem } from './core.js';
import { initDatePicker } from './date-picker.js';
import { initFormatSync, toggleBlockquote, toggleInlineFormat, UIProtections } from './document.js';
import { DraftManager } from './draft-manager.js';
import { Field } from './field.js';
import { FontFeature } from './font-feature.js';
import { applyLetterDate, formatTelefonnummer } from './format.js';
import { initLiveBridge } from './live-bridge.js';
import { installiereLog } from './log.js';
import { initImportExport, MetadataService, requestPersistentStorage } from './persistence.js';
import { SalutationFeature } from './salutation.js';
import { initAgentenHilfe, SettingsManager } from './settings.js';
import { SignatureFeature } from './signature.js';
import { letterState, toWire } from './state.js';
import { applyState, applyValue, initStateBinding } from './state-binding.js';
import { initWebMCP } from './webmcp.js';

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
     ("Postvermerk") - gemeldet 2026-11-12. Seit D1 ist der Zustand die Quelle:
     applyValue schreibt Feld und DOM in einem Schritt. */
  applyValue('vermerke', val, 'logic');
}

/* Ringpuffer fuer Fehler/Warnungen: laeuft vor dem ersten Boot-Schritt, damit
   auch ein Fehler waehrend initApp im Debug-Panel auftaucht. */
installiereLog();

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
    /* Zustand steht schon aus boot-state.js (vor dem Paint). Nur schreiben,
       wenn Liste und Feld wirklich auseinanderlaufen — sonst zweiter Schreiber. */
    const pvWert = Field.getValue(document.getElementById('vermerke')).trim();
    const pvAuswahl = /** @type {HTMLSelectElement | null} */ (
      document.getElementById('seitenleiste-postvermerk-select')
    );
    if (!pvAuswahl || pvAuswahl.value !== pvWert) syncPostvermerkFromSidebar(pvWert);
  });
  bootStep('Briefdatum', () => applyLetterDate());

  const uiProtections = kritischerWert('UI-Schutz-Objekt', () => new UIProtections());
  bootStep('UI-Schutz', () => uiProtections.init());
  /* D1: Die Naht DOM↔Zustand. Bewusst NACH UIProtections, damit der Commit
     den bereits gekürzten Endwert liest (Bubble-Reihenfolge). Root ist das
     Dokument, weil die Toggles und der Postvermerk außerhalb von <din-blatt>
     liegen; die Feld-Allowlist filtert alles Fremde. */
  bootStep('Zustandsbindung', () => initStateBinding(document), { critical: true });
  bootStep('Telefon-Formatierung', () => setupPhoneFormatting());

  const settingsManager = kritischerWert('Einstellungen-Objekt', () => new SettingsManager());
  bootStep('Einstellungen', () => settingsManager.init());

  /* Referenzen für den reload-freien Import (D1 Stufe 6): Signatur und
     Schrift wenden ihre Einstellungen sonst nur in init() an. */
  /** @type {SignatureFeature | null} */
  let signatureFeature = null;
  /** @type {FontFeature | null} */
  let fontFeature = null;

  bootStep('Plugins', () => {
    // Mehrseiten-Modus ist fest eingeschaltet ([[ADR-EINSEITEN-STILLGELEGT]]).
    // Kein Umschalt-Signal mehr: der Controller wird genau einmal gemountet.
    void (async () => {
      const m = await import('./multipage-controller.js');
      m.mountMultipage();
    })().catch((err) => console.error('[Plugins] Mehrseiten-Start fehlgeschlagen:', err));
  });

  /* Kritisch: hier entsteht der Listener input -> Speichern. Faellt er aus,
     tippt der Nutzer in eine vollstaendig wirkende App, und nichts wird
     gespeichert (main.js:191, gemessen 2026-11-12). */
  bootStep('Globale Listener', () => attachGlobalListeners(draftManager), { critical: true });
  bootStep('Toast-System', () => initToastSystem());
  bootStep('Absender-Sync', () => initSenderSync());
  bootStep('Adressdienste', () => initAddressServices());
  bootStep('Datums-Kalender', () => initDatePicker());
  bootStep('Agenten-API', () => initApi());
  /* Nach der API: Werkzeuge brauchen dinApi. Ohne WebMCP im Browser bleibt
     window.dinBriefAgent für den Live-Kanal stehen (tools/mcp-live.mjs). */
  bootStep('Agenten-Werkzeuge', () => void initWebMCP());
  /* Nur aktiv, wenn die URL #agent=<token> trägt: dann wählt sich die Seite
     bei tools/mcp-live.mjs ein (ohne Flag, ohne Debug-Port). */
  bootStep('Agenten-Kanal', () => initLiveBridge());
  bootStep('Agenten-Hilfe', () => initAgentenHilfe());
  bootStep('Import/Export', () => initImportExport({
    collectDraft: () => toWire(letterState),
    /* D1 Stufe 6: Import ohne Reload. applyState ersetzt RAM + Projektion;
       die Persistenz hat applyImportedData bereits als Gate geschrieben. */
    applyImport: (/** @type {any} */ result) => applyState(result.fields, {
      settings: settingsManager,
      clearHistory: () => draftManager.clearHistory(),
      applyLetterDate,
      afterRender: () => {
        signatureFeature?.applyTransform();
        fontFeature?.applyInitialFont();
        AddressIntelligence.targetLock = null;
      }
    })
  }));
  bootStep('Anrede', () => new SalutationFeature(settingsManager).init());
  bootStep('Signatur', () => {
    signatureFeature = new SignatureFeature(settingsManager);
    signatureFeature.init();
  });
  bootStep('Schriftart', () => {
    fontFeature = new FontFeature(settingsManager);
    fontFeature.init();
  });
  bootStep('Addons', () => initAddonDispatcher());

  /* Debug-Panel: Schalter in den Einstellungen (Standard aus). Modul wird nur
     bei Bedarf geladen; Sichtbarkeit macht CSS (:has), nicht dieses Skript. */
  bootStep('Debug-Panel', () => {
    const schalter = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-debug'));
    if (!schalter) return;
    const laden = () => {
      void (async () => {
        const m = await import('./debug-panel.js');
        m.initDebugPanel();
      })().catch((err) => console.debug('[Debug-panel] konnte nicht laden:', err));
    };
    if (schalter.checked) laden();
    schalter.addEventListener('change', () => {
      if (schalter.checked) laden();
    });
  });

  bootStep('Darstellung freigeben', () => {
    /* Idempotentes Netz: boot-state.js hat die Maske bereits entfernt. Steht
       sie hier noch (Seeder ausgefallen), wird sie jetzt freigegeben. Der
       1800-ms-Timer in boot.js ist die letzte Rueckfallebene. */
    if (typeof performance !== 'undefined' && performance.mark) performance.mark('ready');
    document.documentElement.removeAttribute('data-booting');
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
      /* Einfacher Druckzaehler fuer das Debug-Panel (kein Produktivwert). */
      try {
        const bisher = Number(localStorage.getItem('din_print_count') || '0') || 0;
        localStorage.setItem('din_print_count', String(bisher + 1));
      } catch {
        /* Speicher voll/gesperrt: der Zaehler ist nicht wichtig genug fuer eine Meldung. */
      }
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

    /* Kein eigener input->save-Listener mehr: state-binding.js ist der eine
       Schreibpfad (Zustand + DOCUMENT_SAVE_REQUESTED). Zwei Listener würden
       denselben Vorgang doppelt melden. */
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
        /* Attribut schreibt renderRootFlags() (state-binding). Hier bleibt nur
           die Default-Befüllung des Anlagentexts. */
        const anlagenEl = document.getElementById('anlagen-angabe');
        if (anlagenEl instanceof HTMLTextAreaElement && anlagenSwitch.checked && !anlagenEl.value.trim()) {
          applyValue('anlagen-angabe', 'Anlage 1', 'logic');
        }
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

