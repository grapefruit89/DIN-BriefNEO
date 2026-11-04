// @ts-check
// @adr [[ADR-JS]] 
// @guide [[no-scroll-techniques]] 

import { istBriefbar, resolveFirma, resolveOrt, resolveStrasse, waehleAnker } from '../addons/testbrief.js';
import { AddressIntelligence, ClipboardAddressParser, initAddressServices, initSenderSync } from './address.js';
import { Events, eventBus, initToastSystem } from './core.js';
import { collectDraft, DraftManager, UIProtections } from './document.js';
/* js/main.js */
import { applyLetterDate, initImportExport, MetadataService, migrateStorage } from './persistence.js';
import { SalutationEngine, SalutationFeature } from './salutation.js';
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
  const field = document.getElementById('postvermerk');
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
    const draftManager = new DraftManager();
    draftManager.loadDraft();
    const initPv = document.getElementById('postvermerk')?.textContent || '';
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
        const anlagenEl = document.getElementById('anlagen-text');
        if (anlagenEl && anlagenSwitch.checked && !anlagenEl.textContent?.trim()) {
          const li = document.createElement('li');
          li.textContent = 'Anlage 1';
          anlagenEl.replaceChildren(li);
        }
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
    }
  }

/* =========================================================================================
 * TESTDATEN-GENERATOR (TESTBRIEF & FELDER LEEREN)
 * ========================================================================================= */

/** @type {any[] | null} */
let heroesCache = null;
/** @type {any[] | null} */
let heroesPool = null;
let heroIndex = 0;
/** @type {any | null} */
let lastHero = null;

/**
 * Zieht ein belegtes Thema für den Text.
 * Reihenfolge: Alias → einzelne Organisation → Hook → Franchise.
 * Erfundene Platzhalter entfallen; Franchise ist notfalls der einzige belegte Wert.
 * @param {any} char
 * @returns {string}
 */
function getCharHook(char) {
  const anker = waehleAnker(char);
  if (anker) return anker.text;
  const franchise = String(char?.franchise ?? '').trim();
  return franchise || 'einer dringenden Angelegenheit';
}

/**
 * Generiert einen passenden Betreff zum gewürfelten Thema.
 * Doppelpunkt-Form: das Thema steht als Nachtrag, damit keine Kasus-Fehler
 * entstehen („bezüglich Netz" wäre falsch).
 * @param {string} themenHook
 * @returns {string}
 */
function randomBetreff(themenHook) {
  const options = [
    `Dringende Mitteilung: ${themenHook}`,
    `Sachstand und Maßnahmenkatalog: ${themenHook}`,
    `Außerordentliche Kündigung: ${themenHook}`,
    `Fristsetzung und Aufforderung zur Stellungnahme: ${themenHook}`,
    `Kooperationsvereinbarung und Beistandspakt: ${themenHook}`
  ];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Erzeugt den Text anhand der gewürfelten Familie (n = 0..3 Dritte).
 * @param {any} sender
 * @param {any} recipient
 * @param {any[]} dritte
 * @param {string} themenHook
 * @returns {string}
 */
function generateNerdText(sender, recipient, dritte, themenHook) {
  const n = dritte.length;
  const sName = sender.buergerlicherName || sender.name;
  const sHook = getCharHook(sender);
  const sOrt = resolveOrt(sender) || 'hier';
  const rOrt = resolveOrt(recipient) || 'dort';

  if (n === 0) {
    const templatesA = [
      `hiermit kündige ich unsere bisherige Vereinbarung mit sofortiger Wirkung.\n\nDie jüngsten Entwicklungen rund um ${themenHook} machen eine Fortführung für mich schlicht unmöglich. Als ${sName} (${sHook}) kann ich die damit verbundenen Risiken in ${sOrt} nicht länger verantworten.\n\nIch bitte um schriftliche Bestätigung über das Vertragsende und den Verbleib aller Unterlagen.`,
      `bezugnehmend auf unsere Situation unterbreite ich Ihnen einen dringenden Vorschlag zur Zusammenarbeit.\n\nDie Lage bezüglich ${themenHook} erfordert entschlossenes Handeln unserer beiden Seiten. Gerne stelle ich meine Erfahrungen als ${sName} (${sHook}) zur Verfügung, um eine geordnete Lösung für ${rOrt} herbeizuführen.\n\nÜber eine kurzfristige Rückmeldung zur Abstimmung der nächsten Schritte freue ich mich.`,
      `ich wende mich heute mit einem formellen Auskunftsersuchen an Ihre Adresse.\n\nIn den vergangenen Tagen sind vermehrt Fragen zu ${themenHook} aufgetreten, die Ihre Zuständigkeit in ${rOrt} berühren. Zur Wahrung meiner berechtigten Interessen fordere ich Sie hiermit auf, den aktuellen Sachstand darzulegen.\n\nNach fruchtlosem Fristablauf behalte ich mir weitere Schritte vor.`
    ];
    return templatesA[Math.floor(Math.random() * templatesA.length)];
  }

  if (n === 1) {
    const d0Name = dritte[0].buergerlicherName || dritte[0].name;
    const d0Hook = getCharHook(dritte[0]);
    const d0Ort = resolveOrt(dritte[0]) || 'seinem Quartier';
    const templatesB = [
      `ich muss Ihnen heute von einem besorgniserregenden Vorfall berichten.\n\n${d0Name} (${d0Hook}) hat die Lage in Bezug auf ${themenHook} vollkommen eskaliert. Was zunächst harmlos schien, bedroht inzwischen die Ordnung von ${sOrt} bis nach ${rOrt}.\n\nIch ersuche Sie dringend um Beistand und eine gemeinsame Lagebesprechung.`,
      `auf Empfehlung von ${d0Name} (${d0Hook}) trete ich heute direkt mit Ihnen in Kontakt.\n\nGemeinsam haben wir analysiert, dass ${themenHook} einer neuen Vereinbarung zwischen uns bedarf. Die Expertise aus ${d0Ort} belegt eindeutig, dass ein abgestimmtes Vorgehen unerlässlich ist.\n\nBitte teilen Sie mir zeitnah mit, wann Ihnen ein persönlicher Austausch möglich ist.`
    ];
    return templatesB[Math.floor(Math.random() * templatesB.length)];
  }

  if (n === 2) {
    const d0Name = dritte[0].buergerlicherName || dritte[0].name;
    const d0Hook = getCharHook(dritte[0]);
    const d1Name = dritte[1].buergerlicherName || dritte[1].name;
    const d1Hook = getCharHook(dritte[1]);
    const templatesC = [
      `die Ereignisse der letzten Tage zwingen mich zu diesem außerordentlichen Schreiben.\n\n${d0Name} (${d0Hook}) und ${d1Name} (${d1Hook}) haben wegen ${themenHook} einen offenen Konflikt begonnen. Die Auswirkungen sind mittlerweile bis in meine Wirkungsstätte spürbar.\n\nIch fordere Sie als Verantwortliche auf, unverzüglich mäßigend auf beide Parteien einzuwirken.`,
      `nach vertraulicher Rücksprache mit ${d0Name} (${d0Hook}) sowie ${d1Name} (${d1Hook}) wende ich mich an Sie.\n\nWir sind übereingekommen, dass die Vorkommnisse um ${themenHook} eine gemeinsame Stellungnahme verlangen. Unsere Kräfte stehen bereit, um Schaden von ${rOrt} abzuwenden.\n\nIch erwarte Ihre verbindliche Rückäußerung binnen zehn Werktagen.`
    ];
    return templatesC[Math.floor(Math.random() * templatesC.length)];
  }

  // n === 3
  const d0Name = dritte[0].buergerlicherName || dritte[0].name;
  const d0Hook = getCharHook(dritte[0]);
  const d1Name = dritte[1].buergerlicherName || dritte[1].name;
  const d1Hook = getCharHook(dritte[1]);
  const d2Name = dritte[2].buergerlicherName || dritte[2].name;
  const d2Hook = getCharHook(dritte[2]);
  const templatesD = [
    `zur Abwendung einer drohenden Krise berufe ich hiermit eine Dringlichkeitssitzung ein.\n\nSowohl ${d0Name} (${d0Hook}), ${d1Name} (${d1Hook}) als auch ${d2Name} (${d2Hook}) haben bestätigt, dass ${themenHook} außer Kontrolle geraten ist. Es bedarf unseres geschlossenen Auftretens.\n\nIch bitte Sie, sich unverzüglich für den gemeinsamen Termin bereitzuhalten.`,
    `hiermit übermittle ich Ihnen den konsolidierten Lagebericht unserer Beobachter.\n\nDie Berichte von ${d0Name} (${d0Hook}), ${d1Name} (${d1Hook}) und ${d2Name} (${d2Hook}) stimmen überein: Das Thema ${themenHook} erfordert sofortige Schutzmaßnahmen auf beiden Seiten.\n\nBitte bestätigen Sie den Erhalt dieser Mitteilung und leiten Sie die vereinbarten Notfallprotokolle ein.`
  ];
  return templatesD[Math.floor(Math.random() * templatesD.length)];
}

/**
 * Lädt die 325 konsolidierten Figuren einmalig asynchron (Lazy Load beim ersten Klick).
 * @returns {Promise<any[] | null>}
 */
async function loadHeroes() {
  if (heroesCache) return heroesCache;
  try {
    const res = await fetch('data/charaktere_konsolidiert.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    heroesCache = Array.isArray(data) ? data : (data.figuren || []);
    return heroesCache;
  } catch (err) {
    console.error('[TestData] Fehler beim Laden der Figuren:', err);
    return null;
  }
}

/**
 * Fisher-Yates-Shuffle.
 * @param {any[]} arr
 * @returns {any[]}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Zieht den nächsten Helden aus dem Pool mit Reshuffle-Ausschluss des letzten Helden.
 * @param {any[]} heroes
 * @returns {any}
 */
function nextHero(heroes) {
  if (!heroesPool || heroIndex >= heroesPool.length) {
    const filtered = lastHero ? heroes.filter(h => h !== lastHero) : heroes;
    heroesPool = shuffle(filtered);
    heroIndex = 0;
  }
  const hero = heroesPool[heroIndex++];
  lastHero = hero;
  return hero;
}

/**
 * Extrahiert den Nachnamen (letztes Wort vor eventuellen Klammern).
 * @param {string} fullName
 * @returns {string}
 */
function extractNachname(fullName) {
  if (!fullName) return '';
  const clean = fullName.replace(/\s*\([^)]*\)/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : clean;
}

/**
 * Leitet die Anrede ab: Prüft recipient.geschlecht (m/w/d), nutzt ansonsten
 * die SalutationEngine als Fallback und endet bei neutralem DIN-Standard.
 * @param {any} _sender
 * @param {any} recipient
 * @returns {string}
 */
function deriveAnrede(_sender, recipient) {
  if (recipient?.geschlecht) {
    const nachname = extractNachname(recipient.buergerlicherName || recipient.name);
    if (recipient.geschlecht === 'm') return `Sehr geehrter Herr ${nachname},`;
    if (recipient.geschlecht === 'w') return `Sehr geehrte Frau ${nachname},`;
    if (recipient.geschlecht === 'd') return `Sehr geehrte*r ${nachname},`;
  }
  const candidate = recipient.buergerlicherName || recipient.name || '';
  const derived = SalutationEngine.derive({ rawName: candidate, formality: 'formal' });
  if (derived && derived !== 'Sehr geehrte Damen und Herren,' && derived !== 'Guten Tag,') {
    return derived;
  }
  return 'Sehr geehrte Damen und Herren,';
}

/**
 * Setzt den Textinhalt eines Elements und feuert ein bubbelndes input-Event.
 * @param {string} id
 * @param {string} value
 */
function setField(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Befüllt alle Felder des Briefes mit zwei Pflichtfiguren und 0..3 Dritten.
 */
async function wuerfelTestbrief() {
  const heroes = await loadHeroes();
  if (!heroes) return;
  const usableHeroes = heroes.filter(istBriefbar);
  if (usableHeroes.length < 5) {
    console.warn('[TestData] Nicht genug Charaktere mit vollständigen Adressen.');
    return;
  }

  // 1. Pflicht-Charaktere
  const sender = nextHero(usableHeroes);
  const recipient = nextHero(usableHeroes);

  // 2. Gewürfelte Dritte (n = 0..3)
  const numDritte = Math.floor(Math.random() * 4);
  const dritte = [];
  for (let i = 0; i < numDritte; i++) {
    dritte.push(nextHero(usableHeroes));
  }

  // 3. Thema aus allen beteiligten Charakteren würfeln
  const allChars = [sender, recipient, ...dritte];
  const themenChar = allChars[Math.floor(Math.random() * allChars.length)];
  const themenHook = getCharHook(themenChar);

  const senderName = sender.buergerlicherName || sender.name;
  const recipientName = recipient.buergerlicherName || recipient.name;

  // 4. Lucky-Luke-Fix: Keine erfundenen Fallbacks
  setField('absender-namenszeile', senderName);
  setField('absender-strasse', resolveStrasse(sender));
  setField('absender-ort', resolveOrt(sender));
  setField('absender-tel', '+49 228 123456-78');
  setField('absender-mail', `${senderName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@beispiel.de`);

  const rucksendeTeile = [senderName, resolveStrasse(sender), resolveOrt(sender)].filter(Boolean);
  setField('rucksendezeile', rucksendeTeile.join(' • '));

  // 5. Empfänger
  // Firmenzeile nur bei einer einzelnen belegten Organisation — kein Berufs-Blob.
  setField('empfaenger-firma', resolveFirma(recipient));
  setField('empfaenger-namenszeile', recipientName);
  setField('empfaenger-strasse', resolveStrasse(recipient));
  setField('empfaenger-ort', resolveOrt(recipient));

  // 6. Briefkern
  setField('betreff', randomBetreff(themenHook));
  setField('anrede', deriveAnrede(sender, recipient));
  setField('text', generateNerdText(sender, recipient, dritte, themenHook));
  setField('grussformel', 'Mit freundlichen Grüßen');
  setField('unterschrift', senderName);
  applyLetterDate();

  // 7. Zusatzblöcke & Postvermerk zurücksetzen
  const anlagenToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  if (anlagenToggle) {
    anlagenToggle.checked = false;
    document.getElementById('anlagen-text')?.replaceChildren();
  }
  const fussToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
  if (fussToggle) {
    fussToggle.checked = false;
  }
  syncPostvermerkFromSidebar('');

  // 8. Entwurf persistieren
  eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
}

/**
 * Leert ausnahmslos alle editierbaren Felder sofort und ohne Bestätigung.
 */
function felderLeeren() {
  document.querySelectorAll('[contenteditable]').forEach(el => {
    if (el.getAttribute('data-feldtyp') === 'systemwert' || el.id === 'datum') return;
    el.textContent = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  applyLetterDate();

  const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  if (pvSelect) pvSelect.selectedIndex = 0;
  const stilSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
  if (stilSelect) stilSelect.selectedIndex = 0;

  syncPostvermerkFromSidebar('');

  const anlagenToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  if (anlagenToggle) {
    anlagenToggle.checked = false;
    document.getElementById('anlagen-text')?.replaceChildren();
  }
  const fussToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
  if (fussToggle) {
    fussToggle.checked = false;
  }

  eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
}

/**
 * Verdrahtet die neuen Footer-Buttons.
 */
function initTestData() {
  const btnTestbrief = document.getElementById('btn-testbrief');
  const btnFelderLeeren = document.getElementById('btn-felder-leeren');

  if (btnTestbrief) {
    btnTestbrief.addEventListener('click', () => {
      wuerfelTestbrief().catch(err => console.error('[TestData] Fehler:', err));
    });
  }

  if (btnFelderLeeren) {
    btnFelderLeeren.addEventListener('click', () => {
      felderLeeren();
    });
  }
}
