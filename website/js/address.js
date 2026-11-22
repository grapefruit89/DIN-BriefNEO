// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]
// @adr [[ADR-JS]]
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @guide [[geoapify-autocomplete]]
// @guide [[din-5008-css-architektur]]

/**
 * @file address.js — Konsolidierter Adress-, PLZ- und Geocoding-Cluster für DIN-BriefNEO (DOM- & UI-Layer).
 * Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js`.
 * Bündelt:
 *  1. AddressIntelligence.wireDOM & initSenderSync: Offline PLZ- und Großempfänger-Engine.
 *  2. initAddressServices: Optionaler Geoapify-Service mit Cache, Listbox-Popover und lokaler Historie.
 */

import {
  AddressData,
  AddressIntelligence,
  BUNDESLAENDER,
  buildFirmenIndex,
  buildOrtIndex,
  fetchGzipJson,
  getDistrict,
  lowerBound,
  normalizePostcode,
  normalizeText,
  resolveCity,
  resolvePostcode
} from './address-data.js';
import { ClipboardAddressParser } from './clipboard-parser.js';
import { Constants, Events, eventBus, hidePopoverSafe, notify, showPopoverSafe } from './core.js';
import { setCaretToEnd } from './document.js';
import { Field } from './field.js';
import { geoCacheHole, geoCacheSetze, geoCacheZaehle } from './geo-cache.js';
import { load, loadJSON, STORAGE_KEYS, save, saveJSON } from './persistence.js';
import { letterState, setMeta } from './state.js';
import { applyValue, commitElement } from './state-binding.js';
import { initVorschlagsliste, klemmeAnSatzspiegel } from './suggestion-list.js';

export {
  AddressData,
  AddressIntelligence,
  BUNDESLAENDER,
  buildFirmenIndex,
  buildOrtIndex,
  ClipboardAddressParser,
  fetchGzipJson,
  getDistrict,
  lowerBound,
  normalizePostcode,
  normalizeText,
  resolveCity,
  resolvePostcode
};

/**
 * Statische Formular-Knoten einmal auflösen statt bei jedem Event erneut.
 * `isConnected` fängt den Fall ab, dass ein Element ersetzt wurde (Tests,
 * Re-Mount) — dann wird genau einmal neu gesucht.
 * @type {Map<string, HTMLElement | null>}
 */
const feldCache = new Map();

/** @param {string} id @returns {HTMLElement | null} */
export function feld(id) {
  let el = feldCache.get(id);
  if (!el?.isConnected) {
    el = document.getElementById(id);
    feldCache.set(id, el);
  }
  return el;
}

/**
 * Bewegt die Auswahl in einer ARIA-Listbox mit Umlauf und markiert sie.
 * Beide Vorschlagslisten (offline und Geoapify) nutzen dieselbe Routine.
 * @param {HTMLElement[]} items
 * @param {number} von Index der aktuellen Auswahl (-1 = keine)
 * @param {1 | -1} richtung
 * @returns {number} neuer Index
 */
function navigiereListe(items, von, richtung) {
  const naechster = von < 0
    ? (richtung > 0 ? 0 : items.length - 1)
    : (von + richtung + items.length) % items.length;
  for (const [idx, item] of items.entries()) {
    item.setAttribute('aria-selected', String(idx === naechster));
  }
  items[naechster]?.scrollIntoView({ block: 'nearest' });
  return naechster;
}

/**
 * Eine Delegation pro Popover statt zwei Listener pro Eintrag. Die Vorschlags-
 * listen werden bei jedem Tastendruck neu gebaut (`replaceChildren`); Listener
 * an den Einträgen würden dabei jedes Mal neu allokiert und verworfen.
 */
/** @type {WeakMap<Element, {items: any[], select: (item: any) => void, guard: boolean}>} */
const listSelectionState = new WeakMap();

/**
 * @param {HTMLElement | null} popoverEl
 * @param {any[]} items
 * @param {(item: any) => void} select
 */
export function bindListSelection(popoverEl, items, select) {
  if (!popoverEl) return;
  listSelectionState.set(popoverEl, { items, select, guard: false });
  if (popoverEl.dataset.delegated === 'true') return;
  popoverEl.dataset.delegated = 'true';

  /** @param {Event} e */
  const handle = (e) => {
    const target = e.target instanceof Element ? e.target.closest('li[data-index]') : null;
    if (!(target instanceof HTMLElement)) return;
    const state = listSelectionState.get(popoverEl);
    if (!state) return;

    if (e.type === 'keydown') {
      const ke = /** @type {KeyboardEvent} */ (e);
      if (ke.key !== 'Enter' && ke.key !== ' ') return;
      e.preventDefault();
    } else if (e.type === 'mousedown') {
      e.preventDefault(); /* Fokus im Eingabefeld halten (Desktop) */
      state.guard = true;
      setTimeout(() => { state.guard = false; }, 100);
    } else if (state.guard) {
      return; /* click nach mousedown: bereits behandelt */
    }

    const item = state.items[Number(target.dataset.index)];
    if (item) state.select(item);
  };

  popoverEl.addEventListener('mousedown', handle);
  popoverEl.addEventListener('click', handle);
  popoverEl.addEventListener('keydown', handle);
}

/**
 * Vorschlags-Limit: schmale Viewports bekommen weniger Einträge.
 * Die Zahl ist Datenlogik (wie viele Treffer die Liste aufnimmt), keine Layout-Regel —
 * deshalb hier zentral und nicht im CSS.
 */
  const SUGGESTION_BREAKPOINT_PX = 600;
/* 24 statt 12: das Popover reicht bis kurz vor den Blattrand (~25 Zeilen). */
const maxSuggestions = () => (window.innerWidth < SUGGESTION_BREAKPOINT_PX ? 10 : 24);


/** Listener-Register (ersetzt data-wired am Ort-Feld). */
let adressfelderVerdrahtet = false;

/**
 * Wires the recipient address block in the DOM for instant offline autocomplete.
 */
AddressIntelligence.wireDOM = function wireDOM() {
  const empfOrtEl = feld('empfaenger-ort');
  const empfFirmaEl = feld('empfaenger-firma');
  const empfStrasseEl = feld('empfaenger-strasse');

  if (!empfOrtEl) return;
  if (adressfelderVerdrahtet) return;
  adressfelderVerdrahtet = true;

  // Popover suggestions container
  const suggestionsPopover = feld('plz-suggestions-popover');
  if (!suggestionsPopover) return;

  /** @type {any} */
  let ortDebounceTimer = null;
  /** @type {any} */
  let firmaDebounceTimer = null;
  let userEditing = false;

  const clearPopover = () => {
    if (ortDebounceTimer) {
      clearTimeout(ortDebounceTimer);
      ortDebounceTimer = null;
    }
    if (firmaDebounceTimer) {
      clearTimeout(firmaDebounceTimer);
      firmaDebounceTimer = null;
    }
    hidePopoverSafe(suggestionsPopover);
    suggestionsPopover.replaceChildren();
  };

  // userEditing wird im input-Handler direkt aus event.inputType abgeleitet
  // (delete vs. insertText). Die früheren beforeinput/keydown-Listener waren
  // doppelt; nur der Popover-Klick muss den Zustand zurücksetzen.
  suggestionsPopover.addEventListener('mousedown', () => {
    userEditing = false;
  });

  // Schutz vor Überschreiben: Manuelle Tastatureingaben entwerten den Auto-Ursprung
  /** @param {HTMLElement} el */
  const trackManualInput = (el) => {
    el.addEventListener('input', (/** @type {Event} */ e) => {
      const ev = /** @type {InputEvent} */ (e);
      if (!ev.isComposing) {
        /* Nur ein echtes Nutzereingreifen raeumt die Ziel-Sperre ab und hebt
         * data-autofill-aus auf. Sonst loescht ein programmatisch gefuelltes
         * Feld seine eigene Sperre: der Clipboard-Import setzt targetLock und
         * schickt danach ein synthetisches input-Event (B3-01, geprueft
         * 2026-11-12). `isTrusted` ist bei dispatchEvent() false. */
        if (ev.isTrusted) {
          if (el === empfOrtEl) AddressIntelligence.targetLock = null;
          el.removeAttribute('data-autofill-aus');
          /* Herkunft ist jetzt Nutzertext: ersetzt data-autofilled. */
          setMeta(letterState, el.id, { herkunft: 'manuell' });
        }
      }
    });
  };
  trackManualInput(empfOrtEl);
  if (empfFirmaEl) trackManualInput(empfFirmaEl);

  /* Tab/Blur schliesst die Liste. Hover ist kein Zustand: ohne Fokus hat die
     Liste nichts mehr anzuzeigen (gemeldet 2026-11-22). Mousedown auf einen
     Eintrag ruft preventDefault, deshalb bleibt der Fokus beim Klick erhalten. */
  for (const el of [empfOrtEl, empfFirmaEl]) {
    if (!el) continue;
    el.addEventListener('blur', () => hidePopoverSafe(suggestionsPopover));
  }

  // Eingabe im Ort-Feld (Case A & B & Universelles Suchfeld)
  empfOrtEl.addEventListener('input', (/** @type {any} */ e) => {
    // Fiktive Testbrief-Adresse: nicht aufloesen, nicht ueberschreiben.
    if (empfOrtEl.hasAttribute('data-autofill-aus')) return;
    /* Programmgesteuertes Fuellen (Testbrief) schickt ein Event OHNE
       inputType; echte Eingaben (Tastatur, Paste) haben einen. Nur die
       oeffnen die Liste - sonst blitzen alle Dropdowns kurz auf (2026-11-22). */
    if (!(e instanceof InputEvent) || !e.inputType) return;
    if (e?.inputType?.startsWith('delete')) {
      userEditing = true;
    } else if (e?.inputType === 'insertText' && /\d/.test(e.data || '')) {
      userEditing = false;
    }

    const rawText = Field.getValue(empfOrtEl).trim();

    if (!rawText) {
      userEditing = false;
    }

    if (ortDebounceTimer) clearTimeout(ortDebounceTimer);

    const maxItems = maxSuggestions();

    // 0–2 Zeichen: Nichts anzeigen & Popover leeren, TargetLock lösen
    if (rawText.length < 3) {
      AddressIntelligence.targetLock = null;
      clearPopover();
      return;
    }

    // Case 1: Genau 5 Ziffern -> Sofortiger Lookup (0 ms)
    const plzMatch = rawText.match(/^(\d{5})$/);
    if (plzMatch) {
      const plz = plzMatch[1];
      /* 180 ms warten: tippt der Nutzer weiter ("53250 Bonn"), wird nicht
         mitten im Wort ergaenzt ("53250 Bonn Bonn", gemeldet 2026-11-22).
         Wer bei den fuenf Ziffern stehen bleibt, sieht die Ergaenzung sofort. */
      if (ortDebounceTimer) clearTimeout(ortDebounceTimer);
      ortDebounceTimer = setTimeout(() => {
        ortDebounceTimer = null;
        if (Field.getValue(empfOrtEl).trim() !== plz) return;
        const res = AddressIntelligence.lookupPlz(plz);
        if (res && !userEditing) {
          const completed = `${res.plz} ${res.city}`;
          applyValue('empfaenger-ort', completed, 'auto');

          AddressIntelligence.targetLock = { plz: res.plz, city: res.city };

          // Großkunde / Behörde Automatik
          if (res.isGrosskunde && res.grosskunde) {
            if (empfFirmaEl && (!Field.getValue(empfFirmaEl).trim() || letterState.meta['empfaenger-firma']?.herkunft === 'auto')) {
              applyValue('empfaenger-firma', res.grosskunde.name, 'auto');
            }
            if (empfStrasseEl && !Field.getValue(empfStrasseEl).trim()) {
              empfStrasseEl.setAttribute('data-placeholder', '(Großempfänger – Straße entfällt)');
            }
          }

          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
          clearPopover();
        } else {
          // Keine PLZ gefunden oder Nutzer editiert/löscht gerade -> KEIN Auto-Fill!
          clearPopover();
        }
      }, 180);
      return;
    }

    // Case 2: 3–4 Ziffern -> Sofortige Präfix-Suche
    const prefixMatch = rawText.match(/^(\d{3,4})$/);
    if (prefixMatch) {
      const prefix = prefixMatch[1];
      const matches = AddressIntelligence.lookupPrefix(prefix, 15);
      if (matches.length > 0) {
        const isDirectPlzList = matches.every(m => m.isSinglePlz && m.plz);
        renderUniversalSuggestions(matches, matches.length, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, null, isDirectPlzList);
      } else {
        clearPopover();
      }
      return;
    }

    // Case 3: Text (>= 3 Zeichen) -> Sofortiger Exakter Match / Präfix / Universell
    if (rawText.length >= 3 && !/^\d/.test(rawText)) {
      const res = AddressIntelligence.resolveCityInput(rawText, maxItems);
      if (res.mode === 'single_fill' && res.plz && res.city && !userEditing) {
        const completed = `${res.plz} ${res.city}`;
        applyValue('empfaenger-ort', completed, 'auto');
        AddressIntelligence.targetLock = { plz: res.plz, city: res.city };
        setCaretToEnd(empfOrtEl);
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
        clearPopover();
        return;
      }

      if (res.items.length > 0) {
        const isPlzList = res.mode === 'city_plzs';
        renderUniversalSuggestions(res.items, res.totalCount, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, null, isPlzList);
      } else {
        clearPopover();
      }
      return;
    }

    clearPopover();
  });

  /* Absender-Ort: dieselbe Offline-Liste wie der Empfänger, aber bewusst OHNE
     Großkunden und ohne Firmenfeld — der Absender ist eine Person oder Stelle,
     keine Behörde. Die Liste hängt per CSS-Anker an DIESEM Feld
     (--anchor-absender-ort), damit sie immer darunter aufklappt. */
  const absOrtEl = feld('absender-ort');
  if (absOrtEl) {
    /** @type {any} */
    let absTimer = null;

    /** @param {string} plz @param {string} city */
    const schreibeAbsender = (plz, city) => {
      applyValue('absender-ort', `${plz || ''} ${city || ''}`.trim(), 'auto');
      /* initSenderSync haengt an DOCUMENT_CHANGED (bisher nur Undo/Redo/Reset).
         Ohne dieses Signal blieb die Ruecksendezeile leer, wenn der Ort aus der
         Vorschlagsliste kam statt getippt zu werden (gemeldet 2026-11-22). */
      eventBus.publish(Events.DOCUMENT_CHANGED, { origin: 'auto', feld: 'absender-ort' });
      eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
    };

    /** @param {Array<any>} liste @param {boolean} [alle] */
    const zeichneAbsender = (liste, alle = false) =>
      renderUniversalSuggestions(
        liste,
        liste.length,
        absOrtEl,
        null,
        null,
        suggestionsPopover,
        absOrtEl,
        alle,
        {
          nurOrte: true,
          /** @param {any} item */
          beiWahl: (item) => {
            /* Stadtsammelzeile ("Neustadt (9 PLZs)"): erst die PLZ zeigen. */
            if ((item.plzCount || 0) > 1 && !item.plz) {
              zeichneAbsender(AddressIntelligence.lookupCityPlzs(item.city), true);
              return true;
            }
            schreibeAbsender(item.plz || '', item.city || item.name || '');
            setCaretToEnd(absOrtEl);
            hidePopoverSafe(suggestionsPopover);
            return true;
          }
        }
      );

    absOrtEl.addEventListener('blur', () => hidePopoverSafe(suggestionsPopover));
    absOrtEl.addEventListener('input', (/** @type {Event} */ ev) => {
      if (!(ev instanceof InputEvent) || !ev.inputType) return;
      const raw = Field.getValue(absOrtEl).trim();
      if (absTimer) clearTimeout(absTimer);
      if (raw.length < 3) {
        hidePopoverSafe(suggestionsPopover);
        return;
      }
      /* Fünf Ziffern: PLZ + Ort, ohne Großkunden-Logik. Ebenfalls 180 ms
         Verzoegerung, damit Weitertippen nicht ergaenzt wird. */
      if (/^\d{5}$/.test(raw)) {
        absTimer = setTimeout(() => {
          absTimer = null;
          if (Field.getValue(absOrtEl).trim() !== raw) return;
          const res = AddressIntelligence.lookupPlz(raw);
          if (res) {
            schreibeAbsender(res.plz, res.city);
            hidePopoverSafe(suggestionsPopover);
          }
        }, 180);
        return;
      }
      absTimer = setTimeout(() => {
        const res = AddressIntelligence.resolveCityInput(raw, maxSuggestions());
        zeichneAbsender(res.items, res.mode === 'city_plzs');
      }, 120);
    });
  }

  // Case C: Eingabe im Firma-Feld (Großkunden & Behörden Direkt-Lookup)
  if (empfFirmaEl) {
    empfFirmaEl.addEventListener('input', (/** @type {Event} */ ev) => {
      // Fiktive Testbrief-Firma: kein Grosskunden-Lookup.
      if (empfFirmaEl.hasAttribute('data-autofill-aus')) return;
      if (!(ev instanceof InputEvent) || !ev.inputType) return;
      const rawText = Field.getValue(empfFirmaEl).trim();

      if (firmaDebounceTimer) clearTimeout(firmaDebounceTimer);

      if (rawText.length < 3) {
        clearPopover();
        return;
      }

      firmaDebounceTimer = setTimeout(() => {
        const maxItems = maxSuggestions();
        /** @type {Array<any>} */
        const matches = AddressIntelligence.firmenIndex ? AddressIntelligence.firmenIndex.search(rawText, maxItems) : [];
        if (matches.length > 0) {
          const formatted = matches.map((/** @type {any} */ m) => ({
            plz: m.plz,
            name: m.name,
            city: m.city,
            typ: m.typ,
            district: AddressIntelligence.getDistrict(m.plz),
            isSinglePlz: true
          }));
          renderUniversalSuggestions(formatted, matches.length, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, empfFirmaEl);
        } else {
          clearPopover();
        }
      }, 150);
    });
  }

  // Keyboard navigation in suggestions popover
  /** @param {KeyboardEvent} e */
  const handleKeyNav = (e) => {
    if (!suggestionsPopover.matches(':popover-open')) return;

    const items = Array.from(suggestionsPopover.querySelectorAll('li:not([aria-disabled="true"])'));
    if (items.length === 0) return;

    const currentIndex = items.findIndex(item => item.getAttribute('aria-selected') === 'true');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigiereListe(/** @type {HTMLElement[]} */ (items), currentIndex, 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigiereListe(/** @type {HTMLElement[]} */ (items), currentIndex, -1);
    } else if (e.key === 'Enter') {
      if (items.length > 0) {
        e.preventDefault();
        const targetIndex = Math.max(currentIndex, 0);
        items[targetIndex]?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hidePopoverSafe(suggestionsPopover);
    }
  };

  empfOrtEl.addEventListener('keydown', handleKeyNav);
  if (empfFirmaEl) empfFirmaEl.addEventListener('keydown', handleKeyNav);
  /* Beide Ortfelder fuellen dasselbe Popover - ohne diese Zeile reagierte die
     Absender-Liste nicht auf Pfeile/Enter (gemessen 2026-11-22). */
  if (absOrtEl) absOrtEl.addEventListener('keydown', handleKeyNav);
};

/**
 * Ab dieser PLZ-Zahl lohnt eine Stadt-Zeile mit Unterliste.
 *
 * Darunter ist die Unterliste nur ein zusaetzlicher Klick fuer dieselbe
 * Information: "troi" zeigte eine Zeile "Troisdorf (3 PLZs)", die man erst
 * aufklappen musste (gemeldet 2026-11-12). Bis 7 PLZs stehen sie direkt in
 * der Liste, ab 8 bleibt die Zeile (sonst wird die Liste lang und unruhig).
 */
export const GRUPPE_AB_PLZ = 8;

/**
 * Klappt Stadt-Zeilen mit wenigen PLZs direkt in die Liste aus.
 *
 * Name vs. Zweck (docs/meta/SEMANTIC-ANCHORS.md, Abschnitt 3): "flach" meint
 * die DATENFORM (Sammelzeilen zu Einzelzeilen), das Muster heisst
 * **Progressive Disclosure**.
 *
 * Muster: **Progressive Disclosure** — grosse Staedte bleiben eine Zeile
 * ("Neustadt · 9 PLZs"), kleine klappen sofort auf. Ueber `GRUPPE_AB_PLZ`
 * entscheidet die Datenlage, nicht die Ansicht.
 *
 *
 * Entfernt dabei Dubletten: `resolveCityInput('troi')` liefert sowohl
 * "Troisdorf (3 PLZs)" als auch "Troisdorf 53840" — nach dem Ausklappen waere
 * die 53840 zweimal da. Der Schluessel enthaelt den Typ, damit eine Behoerde
 * mit derselben PLZ nicht verschwindet.
 * @param {Array<any>} liste
 * @param {number} [limit] Obergrenze der AUSGEGEBENEN Zeilen. Ohne sie lieferte
 *   "neu" 38 Zeilen, obwohl die Liste auf 12 Treffer begrenzt war (gemessen
 *   2026-11-22) — das Aufklappen passiert nach der Begrenzung.
 * @returns {Array<any>}
 */
export function flacheVorschlaege(liste, limit = Number.POSITIVE_INFINITY) {
  const out = [];
  const gesehen = new Set();
  for (const item of liste) {
    if (out.length >= limit) break;
    const plzAnzahl = item.plzCount || 0;
    const ausklappen = item.typ === 'Stadt' && !item.isSinglePlz && plzAnzahl > 1 && plzAnzahl < GRUPPE_AB_PLZ;
    for (const eintrag of ausklappen ? AddressIntelligence.lookupCityPlzs(item.city) : [item]) {
      const schluessel = `${eintrag.typ || ''}|${eintrag.plz || eintrag.name || ''}`;
      if (gesehen.has(schluessel)) continue;
      gesehen.add(schluessel);
      out.push(eintrag);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/**
 * Standard-Naehe fuer die Strassen-Suche (Bonn, Heimfallpunkt 2026-11-22).
 * Ohne Treffer-Sperre (`targetLock`) wird hiernach gewichtet.
 */
export const STRASSEN_BIAS = Object.freeze({ lon: 7.0982068, lat: 50.73743 });

/**
 * Query fuer die Strassen-Autovervollstaendigung (Geoapify).
 * `type=street` und ein kleines Limit sind der ganze Geschwindigkeits-
 * unterschied (gemessen 2026-11-22, gleiche Leitung):
 *   limit=20, ohne type .................. 1751 ms
 *   limit=8,  type=street ................  536 ms (2. Lauf 353 ms)
 * `filter=countrycode:de` bleibt noetig: ohne ihn kamen oesterreichische
 * Treffer zu "Hauptstrasse" (gemessen). Mit type=street kostet er kaum.
 * `bias=proximity` ist eine weiche Relevanz-Gewichtung (**proximity bias**):
 * Naegeles Treffer zuerst, ohne fremde Treffer auszuschliessen.
 * @param {string} text
 * @param {string} key
 * @param {{ lon: number, lat: number }} [bias]
 * @returns {string}
 */
export function strassenSuchPfad(text, key, bias = STRASSEN_BIAS) {
  const params = new URLSearchParams({
    text,
    apiKey: key,
    lang: 'de',
    limit: '8',
    type: 'street',
    filter: 'countrycode:de',
    format: 'json',
    bias: `proximity:${bias.lon},${bias.lat}`
  });
  return `/v1/geocode/autocomplete?${params.toString()}`;
}

/**
 * Kuerzt generische Bestandteile aus Organisationsnamen fuer die ANZEIGE
 * ("Deutsche Postbank AG Niederlassung Hamburg (Giro)" -> "Deutsche Postbank AG
 * Hamburg (Giro)"). Gesucht und gespeichert wird weiter der volle Name; der
 * Tooltip der Zeile zeigt ihn.
 * @param {string} name
 * @returns {string}
 */
export function verkuerzeName(name) {
  return String(name || '')
    .replace(/\b(?:eine\s+)?(?:Niederlassung|Filiale|Geschäftsstelle|Hauptverwaltung|Belegarchiv)(?:\s+(?:der|des))?\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Anzahl der Ortstoene. Reihenfolge im CSS: Goldwinkel-Abstaende (weit auseinander). */
export const ORT_FARBEN = 20;

/**
 * Vergibt die Pastellfarben (1..ORT_FARBEN) in der Reihenfolge der Liste.
 *
 * Nicht per Hash: dabei fielen zwei verschiedene Orte regelmaessig auf
 * denselben Ton ("ten" -> Teningen und Tensfeld beide gruen, gemeldet
 * 2026-11-13). Hier bekommt jeder NEUE Ort den naechsten freien Ton, gleiche
 * Orte (auch spaeter in der Liste) denselben. Damit sind benachbarte Gruppen
 * immer unterscheidbar, solange die Liste nicht mehr als ORT_FARBEN Orte hat;
 * danach wiederholen sich die Toene.
 *
 * Der Schluessel besteht aus Name + Bundesland + Kreis. Das Bundesland allein
 * reichte nicht: "neustadt" liefert fuenf bayerische Staedte, die alle als
 * "Neustadt (Bayern)" erscheinen (gemessen 2026-11-22). Mit dem Kreis werden
 * vier davon getrennt; nur 92660/95514 bleiben zusammen, weil sie im selben
 * Landkreis liegen - dafuer waere der 8-stellige Gemeindeschluessel noetig.
 *
 * @param {Array<any>} eintraege
 * @param {(eintrag: any) => string} [kreisVon] liefert den Kreis-Schluessel
 *   je Eintrag (die Liste selbst traegt ihn nicht immer).
 * @returns {string[]} Farbe je Eintrag, gleiche Laenge wie `eintraege`
 */
export function farbenFuerListe(eintraege, kreisVon) {
  const jeOrt = new Map();
  let naechste = 1;
  return eintraege.map((eintrag) => {
    const kreis = eintrag.kreisKey || (kreisVon ? kreisVon(eintrag) : '') || '';
    /* Stadtteile bekommen eigene Toene (Bonn war vorher komplett gruen).
       Schluessel ist der ERSTE Stadtteil: die Spalte listet je PLZ mehrere
       ("Friedrichshain, Kreuzberg"), wodurch derselbe Stadtteil mehrere Toene
       bekam (gemeldet 2026-11-22: Friedrichshain in 4 Farben). */
    const stadtteil = String(eintrag.district || '').split(',')[0].trim();
    const ort = `${eintrag.city || eintrag.name || ''}|${eintrag.state || ''}|${kreis}|${stadtteil}`;
    if (!jeOrt.has(ort)) {
      jeOrt.set(ort, String(naechste));
      naechste = (naechste % ORT_FARBEN) + 1;
    }
    return jeOrt.get(ort);
  });
}

/**
 * Renders the suggestions popover with type badges and color coding.
 * @param {Array<any>} matches
 * @param {number} totalCount
 * @param {HTMLElement} ortEl
 * @param {HTMLElement | null} firmaEl
 * @param {HTMLElement | null} strasseEl
 * @param {HTMLElement} popoverEl
 * @param {HTMLElement | null} [anchorEl]
 * @param {boolean} [isPlzList=false]
 * @param {{ nurOrte?: boolean, beiWahl?: (item: any) => boolean }} [optionen]
 *   `nurOrte`: Firmen/Behoerden ausblenden (Absender). `beiWahl`: eigene
 *   Auswahl-Logik; `true` = behandelt.
 */
function renderUniversalSuggestions(matches, totalCount, ortEl, firmaEl, strasseEl, popoverEl, anchorEl = null, isPlzList = false, optionen = {}) {
  const render = () => {
    popoverEl.replaceChildren();

    /** @param {any} item */
    const selectItem = (item) => {
      /* Eigene Auswahl (Absender-Ort): der Aufrufer entscheidet, was mit dem
         Treffer passiert, und meldet mit `true`, dass er ihn behandelt hat. */
      if (optionen.beiWahl?.(item)) return;
      /* Stadtteil-Gruppe (grosse Stadt): deren PLZ anzeigen. */
      if (Array.isArray(item.plzs)) {
        renderUniversalSuggestions(item.plzs, item.plzs.length, ortEl, firmaEl, strasseEl, popoverEl, anchorEl, true);
        return;
      }
      // Stadt mit mehreren PLZs: sofort die PLZ-Liste öffnen.
      if (item.typ === 'Stadt' && !item.isSinglePlz) {
        const plzs = AddressIntelligence.lookupCityPlzs(item.city);
        renderUniversalSuggestions(plzs, plzs.length, ortEl, firmaEl, strasseEl, popoverEl, anchorEl, true);
        return;
      }

      const auswahl = AddressIntelligence.applySelection(item, ortEl, firmaEl, strasseEl);
      for (const id of auswahl.auto) {
        const el = document.getElementById(id);
        if (el) commitElement(el, 'auto', { renderIt: false });
      }
      AddressIntelligence.targetLock = { city: item.city, plz: item.plz };
      setCaretToEnd(anchorEl || ortEl);
      eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
      hidePopoverSafe(popoverEl);
    };

    /* Exakte Stadt-Treffer (city_plzs) zeigen ALLE PLZ dieser Stadt; nur
       gemischte Vorschlagslisten werden auf die Listengroesse gekappt. */
    /* Reihenfolge: erst Orte (Stadtteile), dann Behörden/Gerichte, dann Firmen.
       Innerhalb der Blöcke bleibt die Trefferreihenfolge erhalten. */
    const rang = (/** @type {any} */ e) => {
      const t = (e.typ || 'Stadt').toLowerCase();
      if (t === 'stadt') return 0;
      if (t === 'behörde' || t === 'behoerde' || t === 'gericht') return 1;
      return 2;
    };
    /* Der Absender zeigt nur Orte: eine Stadt bringt aus lookupCityPlzs auch
       ihre Grossempfaenger mit, die gehoeren nicht in die Ruecksendezeile. */
    const quelle = optionen.nurOrte
      ? matches.filter((e) => (e.typ || 'Stadt') === 'Stadt')
      : matches;
    const eintraege = flacheVorschlaege(quelle, isPlzList ? Number.POSITIVE_INFINITY : maxSuggestions())
      .toSorted((a, b) => {
        const ra = rang(a);
        const rb = rang(b);
        if (ra !== rb) return ra - rb;
        /* Innerhalb von Block 1: Zeilen MIT Stadtteil zuerst, die ohne
           Zusatzangabe (219 von 284 in Berlin) nach hinten. */
        if (ra === 0) {
          const ha = a.district ? 0 : 1;
          const hb = b.district ? 0 : 1;
          if (ha !== hb) return ha - hb;
        }
        return 0;
      });

    if (!eintraege.length) {
      hidePopoverSafe(popoverEl);
      return;
    }

    /* Bundesland nur, wenn es die Zeile von den anderen desselben Namens
       unterscheidet: bei "frankfurt am main" sind 114 Zeilen Hessen, zwei
       tragen faelschlich NW — nur die beiden bekommen den Zusatz. */
    /** @type {Map<string, Map<string, number>>} */
    const staatenJeName = new Map();
    for (const e of eintraege) {
      const n = e.name || e.city || '';
      const st = e.state || '';
      if (!st) continue;
      let m = staatenJeName.get(n);
      if (!m) { m = new Map(); staatenJeName.set(n, m); }
      m.set(st, (m.get(st) || 0) + 1);
    }
    /** @param {any} e @param {string} st */
    const zeigeStaat = (e, st) => {
      const m = staatenJeName.get(e.name || e.city || '');
      if (!m || m.size < 2) return false;
      let max = 0;
      for (const c of m.values()) if (c > max) max = c;
      return (m.get(st) || 0) < max;
    };
    const farben = farbenFuerListe(eintraege, (e) => (e.plz ? AddressIntelligence.getKreisKey(e.plz) : ''));
    /* Namen, die in dieser Liste in MEHREREN Kreisen vorkommen: nur dort zeigt
       die Zeile den Landkreis ("Neustadt (Landkreis Kelheim)"). Kommt der Name
       mehrfach im selben Kreis vor (Bonn, Troisdorf: eine Stadt, viele PLZ),
       bleibt die gewohnte Ortsteil-/Bundesland-Anzeige. */
    const kreiseJeName = new Map();
    for (const e of eintraege) {
      const n = e.name || e.city || '';
      let set = kreiseJeName.get(n);
      if (!set) {
        set = new Set();
        kreiseJeName.set(n, set);
      }
      set.add(e.plz ? AddressIntelligence.getKreisKey(e.plz) || '' : '');
    }

    eintraege.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      /* Ortsfarbe: verschiedene Orte = verschiedene Toene, gleiche Stadt
         durchgehend gleich (siehe farbenFuerListe). */
      /* Großempfänger/Behörden bekommen KEINE Ortsfarbe: sie sind keine Orte,
         und eine lange Liste davon soll ruhig bleiben (2026-11-22). */
      if ((item.typ || 'Stadt') === 'Stadt') li.dataset.ortFarbe = farben[index];

      // Typ als Datum ins Markup; das Aussehen entscheidet das CSS (beide Listen).
      const typLower = (item.typ || '').toLowerCase();
      li.dataset.typ = typLower === 'behörde' ? 'behoerde' : typLower || 'city';

      const leftWrapper = document.createElement('span');
      leftWrapper.className = 'suggestion-main';

      // PLZ falls vorhanden
      if (item.plz) {
        const plzSpan = document.createElement('span');
        plzSpan.className = 'plz-val';
        Field.setValue(plzSpan, item.plz);
        leftWrapper.appendChild(plzSpan);
        leftWrapper.appendChild(document.createTextNode(' '));
      }

      // Name
      const nameSpan = document.createElement('span');
      nameSpan.className = 'city-val';
      Field.setValue(nameSpan, verkuerzeName(item.name));
      leftWrapper.appendChild(nameSpan);

      /* Kein [Firma]/[Behörde]-Badge mehr: der Typ steckt in der Farbe des
         Balkens und der Schrift (CSS, data-typ). Die Stadt steht als Zusatz. */
      if (item.typ && item.typ !== 'Stadt') {
        const citySub = document.createElement('span');
        citySub.className = 'city-sub';
        Field.setValue(citySub, `· ${item.city}`);
        leftWrapper.appendChild(citySub);
      } else if (!item.isSinglePlz && (item.plzCount || 0) > 1) {
        const countSub = document.createElement('span');
        countSub.className = 'city-sub';
        Field.setValue(countSub, `· ${item.plzCount} PLZs`);
        leftWrapper.appendChild(countSub);
      }

      li.appendChild(leftWrapper);

      // UI-Disambiguierung: Bundesland und/oder Stadtteil zur Orientierung anzeigen
      const stateCode = item.state || (item.plz ? AddressIntelligence.getState(item.plz) : '');
      const stateName = stateCode ? (BUNDESLAENDER[stateCode] || stateCode) : '';

      /* Zusatz ohne Klammern: "· Zentrum, Castell" statt "(Zentrum, Castell)". */
      let extraText = '';
      const mehrfach = (kreiseJeName.get(item.name || item.city || '')?.size || 0) > 1;
      const kreisName = mehrfach && item.plz ? AddressIntelligence.getKreis(item.plz) : '';
      if (kreisName) {
        extraText = `· ${kreisName}`;
      } else if (item.district) {
        /* Nur der erste Ortsteil. "· Ippendorf" statt "· Ippendorf +2":
           die Zahl war unklar und die Liste wurde vorher abgeschnitten.
           Alle Ortsteile stehen im Tooltip. */
        const erster = String(item.district).split(',')[0].trim();
        extraText = `· ${erster || item.district}`;
      } else if (stateName && zeigeStaat(item, stateCode)) {
        extraText = `· ${stateName}`;
      }

      /* Bei Großempfängern sagt das Badge schon, was es ist — der Zusatz
         "· Großempfänger" wurde abgeschnitten und raubte dem Namen Platz. */
      if (item.typ && item.typ !== 'Stadt') extraText = '';
      /* WCAG 1.4.1 ("Farbe nie als einziges Mittel"): Bei Firmen, Behoerden und
         Gerichten steckt der Typ sonst NUR in der Farbe (data-typ -> color).
         Deshalb zusaetzlich als Text - im Tooltip und fuer Vorleseprogramme
         (.sr-only), ohne die Liste lauter zu machen (Vorgabe 2026-11-22). */
      const typWort = item.typ && item.typ !== 'Stadt' ? String(item.typ) : '';
      const titelZusatz = typWort || (item.district ? String(item.district) : '');
      if (titelZusatz) li.title = `${item.name || item.city || ''} — ${titelZusatz}`;
      if (typWort) {
        const nurVorlesen = document.createElement('span');
        nurVorlesen.className = 'sr-only';
        nurVorlesen.textContent = ` — ${typWort}`;
        li.appendChild(nurVorlesen);
      }
      if (extraText) {
        li.appendChild(document.createTextNode(' '));
        const districtSpan = document.createElement('span');
        districtSpan.className = 'district-val';
        Field.setValue(districtSpan, extraText);
        li.appendChild(districtSpan);
      }

      li.dataset.index = String(index);
      popoverEl.appendChild(li);
    });

    // Hinweiszeile wenn mehr Treffer als Limit vorhanden (NICHT bei reinen PLZ-Listen einer Stadt!)
    // Valide ARIA-Hierarchie: Als li[role="option"][aria-disabled="true"] im ul[role="listbox"]
    const maxItems = maxSuggestions();
    if (!isPlzList && totalCount > maxItems) {
      const hintLi = document.createElement('li');
      hintLi.className = 'suggestion-hint';
      hintLi.setAttribute('role', 'option');
      hintLi.setAttribute('aria-disabled', 'true');
      hintLi.setAttribute('aria-selected', 'false');
      Field.setValue(hintLi, `${totalCount} Treffer – tippe weiter`);
      popoverEl.appendChild(hintLi);
    }

    bindListSelection(popoverEl, eintraege, selectItem);
    /* So weit nach unten wie das Blatt erlaubt (20 mm Rand) — weniger
       Scrollen bei langen Listen (Vorgabe 2026-11-22). */
    klemmeAnSatzspiegel(popoverEl, /** @type {HTMLElement} */ (anchorEl || ortEl));
  };

  render();

  showPopoverSafe(popoverEl);
}

/**
 * Abbreviates the first name (e.g., "Moritz Baumeister" -> "M. Baumeister")
 * @param {string} fullName
 * @returns {string}
 */
function abbreviateName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  let idx = 0;
  const titles = [];
  while (idx < parts.length - 1 && parts[idx].endsWith('.')) {
    titles.push(parts[idx]);
    idx++;
  }
  if (idx >= parts.length - 1) return fullName;
  const firstName = parts[idx];
  const rest = parts.slice(idx + 1).join(' ');
  const prefix = titles.length ? `${titles.join(' ')} ` : '';
  return `${prefix}${firstName.charAt(0).toUpperCase()}. ${rest}`;
}

/**
 * Muster: **derived state mit klebrigem Nutzer-Override** (wie "controlled vs.
 * uncontrolled input"): die Zeile folgt der Automatik, solange niemand sie
 * anfasst — danach gehoert sie dem Menschen und wird nicht mehr ueberschrieben.
 *
 * Entscheidet, ob die Ruecksendezeile neu geschrieben werden darf.
 * Reine Funktion, damit die vier Faelle ohne DOM-Zustand testbar sind:
 * leer/Entwurf -> schreiben, Nutzertext -> stehen lassen, geloescht -> leer lassen.
 * @param {{ modus: 'unklar'|'auto'|'manuell', letzterAutowert: string|null,
 *           aktuell: string, auto: string, street: string, city: string }} lage
 * @returns {{ modus: 'unklar'|'auto'|'manuell', schreiben: boolean, letzterAutowert: string|null }}
 */
export function spiegelEntscheidung(lage) {
  let { modus, letzterAutowert } = lage;
  const { aktuell, auto } = lage;

  /* Leeres Feld ist immer "noch nicht gefuellt": wer die Zeile loescht, bekommt
     sie beim naechsten Absender-Edit zurueck (Entscheidung 2026-11-12). */
  if (aktuell === '') return { modus: 'auto', schreiben: auto !== '', letzterAutowert: auto };

  if (modus === 'unklar') {
    /* Automatikwerte sind "Name • Strasse • Ort" (2 oder 3 Teile). Der
       Vergleich mit Strasse/Ort taugt nicht: maxlength schneidet die Zeile ab,
       dann passt der Schwanz nicht mehr und die Zeile galt als Nutzertext
       (gemessen 2026-11-12 an "Professor X • … • Salem Center, Westchester
       County, New" — 85 Zeichen, hart gekuerzt). Deshalb entscheidet das
       Format: zwei oder mehr " • "-Teile = vom Helfer. */
    const teile = aktuell.split(' • ').map((teil) => teil.trim());
    const siehtAutomatischAus = aktuell === '' || teile.length >= 2;
    modus = siehtAutomatischAus ? 'auto' : 'manuell';
    if (modus === 'auto') letzterAutowert = aktuell;
  }
  if (modus !== 'auto') return { modus, schreiben: false, letzterAutowert };
  /* Von Hand geaendert oder geloescht: ab jetzt Nutzertext. */
  if (letzterAutowert !== null && aktuell !== letzterAutowert) {
    return { modus: 'manuell', schreiben: false, letzterAutowert };
  }
  if (auto === aktuell) return { modus, schreiben: false, letzterAutowert };
  return { modus, schreiben: true, letzterAutowert: auto };
}

/**
 * Synchronizes the sender information from the info block to the return address line
 * and the signature name.
 */
export function initSenderSync() {
  const infoName = feld('absender-name');
  const infoStreet = feld('absender-strasse');
  const infoCity = feld('absender-ort');
  const absender = feld('rucksendeangabe');
  const unterschrift = feld('unterschrift');

  if (!infoName || !infoStreet || !infoCity || !absender || !unterschrift) return;

  /** @param {HTMLElement | null} el @returns {string} */
  const lies = (el) => Field.getValue(el).trim();

  /* Segment-Spiegelung (Vorgabe 2026-11-22): die Ruecksendezeile besteht aus
     hoechstens drei Teilen (Name • Strasse • Ort). Ein Feld aendert nur SEIN
     Segment — ein von Hand editierter Ort bleibt stehen, wenn spaeter der Name
     geaendert wird. */
  /** @type {string[]} */
  let segmente = ['', '', ''];
  /* Nur eine Zeile mit drei Teilen laesst sich feldweise spiegeln. Wer etwas
     Freies hineinschreibt ("EIGENE ZEILE VON HAND"), behaelt sie komplett. */
  let strukturiert = true;
  /**
   * @param {string} text
   * @param {boolean} [manuell] true = Nutzer hat getippt (dann entscheidet die
   *   Struktur, ob feldweise gespiegelt werden darf); false = wir lesen nur.
   */
  const setzeSegmente = (text, manuell = false) => {
    const teile = String(text || '').split(' • ');
    if (manuell) strukturiert = teile.length >= 3 || String(text || '').trim() === '';
    segmente = [0, 1, 2].map((i) => (teile[i] ?? '').trim());
  };
  setzeSegmente(lies(absender));

  /** @type {'unklar'|'auto'|'manuell'} */
  let unterschriftModus = 'unklar';
  let schreibeGerade = false;

  /** @param {HTMLElement | null} el @param {string} wert */
  const schreibe = (el, wert) => {
    if (!el) return;
    schreibeGerade = true;
    Field.setValue(el, wert);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    schreibeGerade = false;
  };

  /**
   * Uebernimmt genau ein Absenderfeld in sein Segment und schreibt die Zeile.
   * @param {number} i
   * @param {string} roh
   */
  const spiegleFeld = (i, roh) => {
    if (!strukturiert) return;
    if (segmente.every((p) => p === '')) {
      /* Leere Zeile: alle drei Teile aus den Feldern aufbauen. */
      segmente = [abbreviateName(lies(infoName)), lies(infoStreet), lies(infoCity)];
    } else {
      segmente[i] = i === 0 ? abbreviateName(roh.trim()) : roh.trim();
    }
    const neu = segmente.filter((p) => p.length > 0).join(' • ');
    if (lies(absender) !== neu) schreibe(absender, neu);
  };

  /* Von Hand geaendert: Segmente aus dem Text uebernehmen. Ab dann bleiben sie
     stehen, bis das zugehoerige Absenderfeld wieder angefasst wird. */
  absender.addEventListener('input', () => {
    if (schreibeGerade) return;
    setzeSegmente(lies(absender), true);
    setMeta(letterState, 'rucksendeangabe', { herkunft: 'manuell' });
  });

  unterschrift.addEventListener('input', () => {
    if (schreibeGerade) return;
    unterschriftModus = 'manuell';
  });

  const spiegleUnterschrift = () => {
    const name = lies(infoName);
    const jetzt = lies(unterschrift);
    if (unterschriftModus === 'unklar') {
      unterschriftModus = jetzt === '' || jetzt === name ? 'auto' : 'manuell';
    }
    if (unterschriftModus === 'auto' && jetzt !== name) schreibe(unterschrift, name);
  };

  infoName.addEventListener('input', () => {
    spiegleFeld(0, lies(infoName));
    spiegleUnterschrift();
  });
  infoStreet.addEventListener('input', () => spiegleFeld(1, lies(infoStreet)));
  infoCity.addEventListener('input', () => spiegleFeld(2, lies(infoCity)));

  eventBus.subscribe(Events.DOCUMENT_CHANGED, (/** @type {any} */ payload) => {
    /* Undo/Redo/Reset: Segmente aus dem Zustand neu lesen.
       Auswahl aus einer Vorschlagsliste (payload.feld): NUR dieses Segment
       nachziehen - sonst blieb die Zeile beim getippten Fragment stehen
       (gemeldet 2026-11-22: "Kettelers" statt "Kettelerstrasse"). */
    if (payload?.feld === 'absender-name') {
      spiegleFeld(0, lies(infoName));
    } else if (payload?.feld === 'absender-strasse') {
      spiegleFeld(1, lies(infoStreet));
    } else if (payload?.feld === 'absender-ort') {
      spiegleFeld(2, lies(infoCity));
    } else {
      setzeSegmente(lies(absender));
    }
    spiegleUnterschrift();
  });
}

/* =========================================================================================
 * 5. GEOAPIFY & ADDRESS SEARCH SERVICES
 * ========================================================================================= */

/**
 * @typedef {object} AddressEntry
 * @property {string} street
 * @property {string} housenumber
 * @property {string} postcode
 * @property {string} city
 * @property {string} formatted
 * @property {string} [source]
 */

/**
 * Relevanz eines Geoapify-Treffers fuer die eingegebene Suche (0 = bester).
 *
 * Vorher standen die Treffer in Antwort-Reihenfolge (bei lokal zuerst, dann
 * remote) — fuer den Nutzer wirkte das zufaellig. PLZ-Treffer zaehlen vor
 * Stadt vor "irgendwo enthalten".
 * @param {{ street?: string, postcode?: string, city?: string, formatted?: string }} item
 * @param {string} query
 * @returns {number} 0..5
 */
export function adressRelevanz(item, query) {
  const q = String(query || '').trim().toLowerCase();
  const plz = String(item.postcode || '');
  const street = String(item.street || '').toLowerCase();
  const city = String(item.city || '').toLowerCase();
  const alles = String(item.formatted || '').toLowerCase();
  if (!q) return 5;
  if (/^\d+$/.test(q) && plz === q) return 0;
  if (/^\d+$/.test(q) && plz.startsWith(q)) return 1;
  if (street.startsWith(q)) return 2;
  if (city.startsWith(q)) return 3;
  if (alles.includes(q)) return 4;
  return 5;
}

/**
 * Initialisiert Adress-Dienste (Geoapify, Offline-Intelligence, Absender-Proximity).
 */
export function initAddressServices() {
  const inputGeoapifyKey = /** @type {HTMLInputElement | null} */ (feld('input-geoapify-key'));
  const statusEl = feld('geoapify-status');
  const inputAddressSearch = /** @type {HTMLInputElement | null} */ (feld('input-anschrift-suche'));
  const addressSuggestions = feld('anschrift-vorschlaege');
  const addressSearchContainer = feld('anschrift-suche-container');

  if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !addressSearchContainer) return;

  /**
   * @param {'valid' | 'invalid' | 'pending' | 'error' | ''} status
   * @param {string} [text]
   */
  function setGeoapifyState(status, text = '') {
    if (inputGeoapifyKey) inputGeoapifyKey.dataset.status = status;
    if (statusEl) {
      statusEl.dataset.status = status;
      Field.setValue(statusEl, text);
    }
  }

  /** @type {AbortController | null} */
  let activeAbortController = null;
  /* Zaehlt jede Eingabe im Suchfeld. Eine Antwort darf nur rendern, wenn ihre
   * Generation noch die aktuelle ist (B3-03): der Abort greift nur, wenn
   * danach ein NEUER Request startet — bei "Feld geleert" oder "< 3 Zeichen"
   * startet keiner, und die alte Antwort blieb stehen. */
  let anfrageKennung = 0;
  /** @type {any} */
  let debounceSearchTimeout = null;
  /** @type {any} */
  let keyDebounceTimeout = null;
  /** @type {AddressEntry[]} */
  let renderedSuggestions = [];
  let activeSuggestionIndex = -1;
  /* Cache-Schluessel der angezeigten Adress-Treffer (LFU-Signal beim Klick,
     siehe geo-cache.js). */
  let letzterAdressSchluessel = '';

  // Load initial settings
  const savedKey = load(STORAGE_KEYS.geoapifyKey, '') || '';
  inputGeoapifyKey.value = savedKey;

  if (!savedKey) {
    setGeoapifyState('', '');
  } else {
    setGeoapifyState('valid', '✓ Key aktiv und gespeichert.');
    validateKeyWithHeartbeat(savedKey);
  }

  // Key input handler with Heartbeat Validation
  inputGeoapifyKey.addEventListener('input', () => {
    clearTimeout(keyDebounceTimeout);
    const val = inputGeoapifyKey.value.trim();

    if (!val) {
      save(STORAGE_KEYS.geoapifyKey, '');
      setGeoapifyState('', '');
      return;
    }

    setGeoapifyState('pending', '⏳ Prüfe Key…');
    keyDebounceTimeout = setTimeout(() => {
      validateKeyWithHeartbeat(val);
    }, 500);
  });

  // A11y: Sync aria-expanded state of combobox with popover toggle
  addressSuggestions.addEventListener('toggle', (e) => {
    inputAddressSearch.setAttribute('aria-expanded', String(/** @type {any} */ (e).newState === 'open'));
  });

  /**
   * @param {string} key
   */
  async function validateKeyWithHeartbeat(key) {
    if (!key) {
      save(STORAGE_KEYS.geoapifyKey, '');
      setGeoapifyState('', '');
      return;
    }

    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1&apiKey=${encodeURIComponent(key)}`, {
        signal: AbortSignal.timeout(8000),
      });
      // Guard gegen asynchrone Race Conditions: Gilt IMMER (auch initial)
      if (!inputGeoapifyKey || inputGeoapifyKey.value.trim() !== key) return;

      if (res.ok) {
        save(STORAGE_KEYS.geoapifyKey, key);
        setGeoapifyState('valid', '✓ Key aktiv und gespeichert.');
      } else if (res.status === 401 || res.status === 403) {
        save(STORAGE_KEYS.geoapifyKey, '');
        setGeoapifyState('invalid', '✗ Key ungültig (401/403).');
      } else {
        // 429/5xx: Server vorübergehend nicht bereit -> Key behalten
        save(STORAGE_KEYS.geoapifyKey, key);
        setGeoapifyState('error', '⚠️ Server nicht erreichbar – Key beibehalten.');
      }
    } catch {
      if (!inputGeoapifyKey || inputGeoapifyKey.value.trim() !== key) return;
      // Netzwerk/Timeout: Key behalten und valid bleiben (Offline-Resilienz)
      save(STORAGE_KEYS.geoapifyKey, key);
      setGeoapifyState('error', '⚠️ Offline / Netzwerkfehler – Key nicht geprüft.');
    }
  }

  /**
   * Sucht im eingebauten PLZ-/Ortsverzeichnis (ohne Netz, ohne Key).
   * Liefert nur Ort/PLZ - das Verzeichnis kennt keine Strassennamen.
   * @param {string} query
   * @returns {AddressEntry[]}
   */
  function sucheOffline(query) {
    try {
      const q = String(query || '').trim();
      /* PLZ-Suche: lookupUniversal durchsucht nur Namen. 5 Ziffern = exakt,
         3-4 = Praefix (lookupPrefix kennt nur diesen Bereich). */
      if (/^\d{5}$/.test(q)) {
        const stadt = AddressIntelligence.plzToCity.get(q);
        if (stadt) return [{ street: '', housenumber: '', postcode: q, city: stadt, formatted: `${q} ${stadt}`, source: 'offline' }];
        return [];
      }
      if (/^\d{3,4}$/.test(q)) {
        /** @type {AddressEntry[]} */
        const treffer = (AddressIntelligence.lookupPrefix(q, 8) || []).map((t) => {
          const plz = String(t.plz || '');
          const stadt = String(t.city || '');
          return { street: '', housenumber: '', postcode: plz, city: stadt, formatted: `${plz} ${stadt}`.trim(), source: 'offline' };
        });
        return treffer;
      }
      const res = AddressIntelligence.lookupUniversal(query, 8);
      return (res.items || []).map((i) => {
        const plz = i.plz || '';
        const stadt = i.city || i.name || '';
        const istOrt = i.typ === 'Stadt';
        return {
          street: '',
          housenumber: '',
          postcode: plz,
          city: stadt,
          formatted: istOrt
            ? [plz, stadt].filter(Boolean).join(' ')
            : `${i.name}${plz ? `, ${plz} ${stadt}` : ''}`,
          source: 'offline'
        };
      });
    } catch {
      return [];
    }
  }

  // --- LOCAL ADDRESS BOOK FEATURE ---
  /**
   * @returns {AddressEntry[]}
   */
  function getLocalAddressBook() {
    return /** @type {AddressEntry[]} */ (loadJSON(STORAGE_KEYS.addresses, []));
  }

  /**
   * @param {AddressEntry} item
   */
  function saveToLocalAddressBook(item) {
    const book = getLocalAddressBook();
    if (!book.find(entry => entry.formatted === item.formatted)) {
      book.unshift(item);
      if (book.length > 50) book.pop();
      saveJSON(STORAGE_KEYS.addresses, book);
    }
  }

  /**
   * @param {string} query
   * @returns {AddressEntry[]}
   */
  function fuzzySearchLocal(query) {
    const book = getLocalAddressBook();
    const q = query.toLowerCase();
    return book.filter(item => item.formatted.toLowerCase().includes(q)).slice(0, 5);
  }

  /* Geoapify laeuft auf zwei erreichbaren Hosts mit identischer API
     (geprueft 2026-11-15: beide antworten auf eine ungueltige Key-Anfrage mit
     demselben 401-Body). Der zweite wird nur benutzt, wenn der erste mit
     5xx oder Netzwerkfehler ausfaellt — bei 4xx ist die Anfrage falsch, dann
     hilft kein anderer Host. */
  const GEOAPIFY_HOSTS = ['https://api.geoapify.com', 'https://api-eu.geoapify.com'];

  /**
   * Holt JSON mit Host-Failover. Pro Versuch ein eigener Timeout, sonst waere
   * der zweite Versuch schon abgelaufen, wenn der erste ihn verbraucht hat.
   * @param {string} pfad Pfad inkl. Query, beginnend mit "/"
   * @param {AbortController} controller
   * @returns {Promise<{ antwort: Response, host: string }>}
   */
  async function holeMitFailover(pfad, controller) {
    let letzterFehler = null;
    for (const host of GEOAPIFY_HOSTS) {
      try {
        const antwort = await fetch(host + pfad, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
        });
        if (antwort.ok || antwort.status < 500) return { antwort, host };
        letzterFehler = new Error(`HTTP ${antwort.status} von ${host}`);
      } catch (err) {
        if (/** @type {Error} */ (err).name === 'AbortError') throw err;
        letzterFehler = err;
      }
    }
    throw letzterFehler ?? new Error('Kein Geoapify-Host erreichbar');
  }

  /* Zwei Ebenen: Session-Map (sofort, LRU) und ein Ring im localStorage, der
     auch einen Reload ueberlebt (geo-cache.js, 512 KB). Strasse-Treffer werden
     dafuer auf die Felder gekuerzt, die die Liste braucht: 9,8 KB -> 0,4 KB je
     Suchbegriff (gemessen 2026-11-22), 1 MB fasst damit ~2.900 statt ~104. */
  /** @type {Map<string, AddressEntry[]>} */
  const apiCache = new Map();
  const CACHE_MAX = 100;

  /** @param {string} key @returns {AddressEntry[] | undefined} */
  function mapHole(key) {
    const wert = apiCache.get(key);
    if (wert) {
      apiCache.delete(key);
      apiCache.set(key, wert);
    }
    return wert;
  }

  /** @param {string} key @param {AddressEntry[]} wert */
  function mapSetze(key, wert) {
    if (apiCache.size >= CACHE_MAX) {
      const aeltester = apiCache.keys().next().value;
      if (typeof aeltester === 'string') apiCache.delete(aeltester);
    }
    apiCache.set(key, wert);
  }

  /** @param {string} key @returns {AddressEntry[] | undefined} */
  function cacheHole(key) {
    const ausMap = mapHole(key);
    if (ausMap) return ausMap;
    const roh = /** @type {any} */ (geoCacheHole(key));
    if (!roh || !Array.isArray(roh.d)) return undefined;
    /* Im Ring liegen Strasse-Treffer als Zeilen [street, hausnr, plz, ort, land]
       (9,8 KB -> 0,4 KB), Adressfelder-Treffer unveraendert als Objekte. */
    const wert = /** @type {AddressEntry[]} */ (
      roh.art === 'strasse'
        ? roh.d.map((/** @type {any[]} */ r) => ({
            street: r[0],
            housenumber: r[1],
            postcode: r[2],
            city: r[3],
            country_code: r[4]
          }))
        : roh.d
    );
    mapSetze(key, wert);
    return wert;
  }

  /** @param {string} key @param {AddressEntry[]} wert */
  function cacheSetze(key, wert) {
    mapSetze(key, wert);
    if (key.startsWith('strasse:')) {
      geoCacheSetze(key, {
        art: 'strasse',
        d: wert.map((/** @type {any} */ r) => [
          r.street || '',
          r.housenumber || '',
          r.postcode || '',
          r.city || '',
          r.country_code || ''
        ])
      });
    } else {
      geoCacheSetze(key, { art: 'adresse', d: wert });
    }
  }

  /* Verbindung vorwaermen, sobald der Nutzer das Feld anfasst: der erste
     Tastendruck trifft dann auf eine offene Verbindung statt auf DNS+TLS.
     Bewusst per JS statt als <link rel="preconnect"> in index.html: A38
     verbietet dort jeden externen Verweis. Hier oeffnet es nur einen Socket
     zu einem Origin, den die CSP ohnehin fuer fetch erlaubt. */
  let vorgewaermt = false;
  function waermeVerbindungVor() {
    if (vorgewaermt) return;
    vorgewaermt = true;
    for (const host of GEOAPIFY_HOSTS) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = host;
      link.crossOrigin = 'anonymous';
      document.head.append(link);
    }
  }

  /* Kein `once`: hat das Feld beim Laden schon den Fokus (Autofokus, Reload mit
     gespeichertem Fokus), ist das `focus`-Event längst vorbei und ein
     `once`-Listener liefe nie — im Test genau so passiert. Die Funktion ist
     über `vorgewaermt` ohnehin idempotent. */
  inputAddressSearch.addEventListener('focus', waermeVerbindungVor);
  inputAddressSearch.addEventListener('input', waermeVerbindungVor);
  inputAddressSearch.addEventListener('blur', () => hidePopoverSafe(addressSuggestions));
  if (document.activeElement === inputAddressSearch) waermeVerbindungVor();

  // Tastatursteuerung für das native Listbox-Popover
  inputAddressSearch.addEventListener('keydown', (event) => {
    if (!renderedSuggestions.length) return;
    const key = event.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const optionen = /** @type {HTMLElement[]} */ (Array.from(addressSuggestions.querySelectorAll('[role=option]')));
      const richtung = /** @type {1 | -1} */ (key === 'ArrowDown' ? 1 : -1);
      activeSuggestionIndex = navigiereListe(optionen, activeSuggestionIndex, richtung);
      inputAddressSearch.setAttribute('aria-activedescendant', `anschrift-vorschlag-${activeSuggestionIndex}`);
    } else if (key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      selectSuggestion(renderedSuggestions[activeSuggestionIndex]);
    } else if (key === 'Escape') {
      activeSuggestionIndex = -1;
      inputAddressSearch.removeAttribute('aria-activedescendant');
    }
  });

  // Optimierter Input Handler
  inputAddressSearch.addEventListener('input', () => {
    clearTimeout(debounceSearchTimeout);
    const query = inputAddressSearch.value.trim();
    const generation = ++anfrageKennung;

    if (query.length < 3) {
      if (activeAbortController) activeAbortController.abort();
      hidePopoverSafe(addressSuggestions);
      return;
    }

    // 1. INSTANT LOCAL SEARCH: Ohne Debounce sofort anzeigen! (0ms Latenz)
    const localMatches = fuzzySearchLocal(query);
    for (const m of localMatches) {
      m.source = 'local';
    }
    /* Ohne API-Key war das Feld praktisch tot: nur das persoenliche
       Adressbuch wurde durchsucht. Jetzt kommt das eingebaute PLZ-/Orts-
       verzeichnis dazu - es kennt Orte, PLZ, Ortsteile und Firmen, aber
       KEINE Strassennamen. Strassen brauchen weiter den Key. */
    const offlineMatches = sucheOffline(query);
    const sofort = fusioniereNachRelevanz([localMatches, offlineMatches], query);

    if (!sofort.length && !load(STORAGE_KEYS.geoapifyKey, '')) {
      zeigeSuchHinweis('Keine Treffer im Ortsverzeichnis. Strassen suchen braucht einen API-Schlüssel (Einstellungen).');
    } else {
      renderSuggestions(sofort, query, false);
    }

    // 2. REMOTE SEARCH (Debounced)
    debounceSearchTimeout = setTimeout(() => {
      performAddressSearch(query, sofort, generation);
    }, 200);
  });

  /**
   * @param {string} query
   * @param {AddressEntry[]} localMatches
   * @param {number} generation
   */
  async function performAddressSearch(query, localMatches, generation) {
    if (activeAbortController) activeAbortController.abort();
    activeAbortController = new AbortController();

    if (!navigator.onLine) return;

    const key = load(STORAGE_KEYS.geoapifyKey, '');
    if (!key) return;

    // 3. CACHE HIT: Sofortiges Rendering ohne Netzwerk!
    const lock = AddressIntelligence.targetLock;
    const cacheKey = `${lock ? `${lock.plz} ` : ''}${query}`.toLowerCase();
    letzterAdressSchluessel = cacheKey;
    const ausCache = cacheHole(cacheKey);
    if (ausCache) {
      mergeAndRender(localMatches, ausCache, query);
      return;
    }

    const coords = /** @type {{ lat: number, lon: number } | null} */ (loadJSON(STORAGE_KEYS.senderCoords, null));

    const searchText = lock ? `${query}, ${lock.plz} ${lock.city}` : query;
    let pfad = `/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&apiKey=${encodeURIComponent(key)}&lang=de&limit=5&format=json&filter=countrycode:de`;
    if (!lock && coords?.lat && coords?.lon) {
      pfad += `&bias=proximity:${coords.lon},${coords.lat}`;
    }

    try {
      const { antwort: response } = await holeMitFailover(pfad, activeAbortController);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          save(STORAGE_KEYS.geoapifyKey, '');
          const keyEl = /** @type {HTMLInputElement | null} */ (feld('input-geoapify-key'));
          if (keyEl) keyEl.value = '';
          setGeoapifyState('invalid', '✗ Key abgelaufen (401/403).');
          notify(Constants.TOASTS.GEOAPIFY.KEY_EXPIRED, 'error');
        } else {
          console.warn(`[Address] Autocomplete HTTP ${response.status}`);
          notify(Constants.TOASTS.GEOAPIFY.UNAVAILABLE(response.status), 'warning');
        }
        return;
      }
      const data = await response.json();

      /* Hausnummern raus (Nutzerwunsch 2026-11-13): es geht um die korrekten
         Strassennamen. Die Anzeige ist Strasse + PLZ + Ort, ohne Nummer; so
         fallen auch die vielen Treffer derselben Strasse zu einem zusammen. */
      const gesehen = new Set();
      /** @type {AddressEntry[]} */
      const parsedSuggestions = (data.results || []).map((/** @type {any} */ p) => {
        const street = p.street || '';
        const postcode = p.postcode || '';
        const city = p.city || '';
        return {
          street,
          housenumber: '',
          postcode,
          city,
          formatted: [street, [postcode, city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
          source: 'geoapify'
        };
      }).filter((/** @type {AddressEntry} */ s) => {
        if (!s.city && !s.postcode) return false;
        const schluessel = `${s.street}|${s.postcode}`;
        if (gesehen.has(schluessel)) return false;
        gesehen.add(schluessel);
        return true;
      });
      /* Frueher mussten Strasse UND Stadt vorhanden sein; jede Stadt- oder
         PLZ-Suche (ohne Strasse) fiel damit komplett raus - "Troisdorf" und
         "53840" zeigten gar nichts (gemeldet 2026-11-13). */

      cacheSetze(cacheKey, parsedSuggestions);
      letzterAdressSchluessel = cacheKey;
      /* Ueberholte Antwort verwerfen: der Nutzer hat inzwischen weitergetippt
       * oder das Feld geleert (B3-03). */
      if (generation !== anfrageKennung) return;
      mergeAndRender(localMatches, parsedSuggestions, query);
    } catch (err) {
      const error = /** @type {Error} */ (err);
      if (error.name !== 'AbortError') {
        console.warn('[Address] Autocomplete search failed:', error);
        notify(Constants.TOASTS.GEOAPIFY.NETWORK_ERROR, 'warning');
      }
    }
  }

  /**
   * @param {AddressEntry[]} localMatches 
   * @param {AddressEntry[]} remoteMatches 
   * @param {string} query 
   */
  /**
   * Mischt Quellen dublettenfrei und sortiert nach Relevanz.
   * @param {AddressEntry[][]} quellen
   * @param {string} query
   * @returns {AddressEntry[]}
   */
  function fusioniereNachRelevanz(quellen, query) {
    /** @type {AddressEntry[]} */
    const combined = [];
    for (const quelle of quellen) {
      for (const eintrag of quelle) {
        if (combined.some((c) => c.formatted === eintrag.formatted)) continue;
        combined.push(eintrag);
      }
    }
    combined.sort((a, b) => adressRelevanz(a, query) - adressRelevanz(b, query));
    return combined;
  }

  /**
   * @param {AddressEntry[]} localMatches
   * @param {AddressEntry[]} remoteMatches
   * @param {string} query
   */
  function mergeAndRender(localMatches, remoteMatches, query) {
    renderSuggestions(fusioniereNachRelevanz([localMatches, remoteMatches], query), query, true);
  }

  /**
   * @param {AddressEntry[]} suggestions
   * @param {string} _query
   * @param {boolean} allowZeroClick
   */
  function renderSuggestions(suggestions, _query, allowZeroClick) {
    if (!addressSuggestions) return;
    addressSuggestions.replaceChildren();
    renderedSuggestions = suggestions.slice(0, 5);
    activeSuggestionIndex = -1;
    inputAddressSearch?.removeAttribute('aria-activedescendant');

    if (suggestions.length === 0) {
      hidePopoverSafe(addressSuggestions);
      return;
    }

    /* Bei mehr als 5 Treffern stand hier NUR der Hinweis - man konnte nichts
       anklicken. Jetzt: die besten 5 plus Hinweis als letzte Zeile. */
    const mehrAlsFuenf = allowZeroClick && suggestions.length > 5;

    renderedSuggestions.forEach((item, index) => {
      const li = document.createElement('li');
      li.id = `anschrift-vorschlag-${index}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      Field.setValue(li, item.formatted);
      
      if (item.source === 'local') {
        const badge = document.createElement('span');
        Field.setValue(badge, '⭐ Lokal');
        badge.className = 'badge-local';
        li.appendChild(badge);
      }
      
      li.dataset.index = String(index);
      addressSuggestions.appendChild(li);
    });

    if (mehrAlsFuenf) {
      const statusLi = document.createElement('li');
      statusLi.className = 'suggestion-hint';
      statusLi.setAttribute('role', 'option');
      statusLi.setAttribute('aria-disabled', 'true');
      statusLi.setAttribute('aria-selected', 'false');
      Field.setValue(statusLi, `${suggestions.length} Treffer – bitte PLZ oder Straße ergänzen`);
      addressSuggestions.appendChild(statusLi);
    }

    bindListSelection(addressSuggestions, renderedSuggestions, selectSuggestion);
    if (inputAddressSearch) klemmeAnSatzspiegel(addressSuggestions, inputAddressSearch);

    showPopoverSafe(addressSuggestions);
  }

  /**
   * Eine einzelne, nicht anklickbare Hinweiszeile im Vorschlags-Popover.
   * @param {string} text
   */
  function zeigeSuchHinweis(text) {
    if (!addressSuggestions) return;
    addressSuggestions.replaceChildren();
    renderedSuggestions = [];
    activeSuggestionIndex = -1;
    const li = document.createElement('li');
    li.className = 'suggestion-hint';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-disabled', 'true');
    li.setAttribute('aria-selected', 'false');
    Field.setValue(li, text);
    addressSuggestions.appendChild(li);
    if (inputAddressSearch) klemmeAnSatzspiegel(addressSuggestions, inputAddressSearch);
    showPopoverSafe(addressSuggestions);
  }

  /**
   * @param {AddressEntry} item
   */
  function selectSuggestion(item) {
    const empfStrasse = feld('empfaenger-strasse');
    const empfOrt = feld('empfaenger-ort');

    /* LFU-Signal: nur eine Uebernahme ins Feld macht den Suchbegriff wertvoll. */
    geoCacheZaehle(letzterAdressSchluessel);

    /* Nur fuellen, was der Treffer wirklich hat: ein Stadt-/PLZ-Treffer hat
       keine Strasse und darf das Empfaengerfeld nicht leeren. */
    if (empfStrasse && item.street) {
      applyValue('empfaenger-strasse', item.street, 'auto');
    }
    if (empfOrt && (item.postcode || item.city)) {
      applyValue('empfaenger-ort', `${item.postcode} ${item.city}`.trim(), 'auto');
    }

    hidePopoverSafe(addressSuggestions);
    /* Zustand mit aufraeumen: sonst zeigen ArrowDown/Enter auf Treffer einer
     * Suche, die der Nutzer schon abgeschlossen hat (Befund aus F4). */
    renderedSuggestions = [];
    activeSuggestionIndex = -1;
    if (inputAddressSearch) {
      inputAddressSearch.value = '';
      inputAddressSearch.removeAttribute('aria-activedescendant');
    }

    saveToLocalAddressBook(item);

    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
  }

  // --- TIER 1: OFFLINE ADDRESS INTELLIGENCE ---
  AddressIntelligence.init().then(() => {
    AddressIntelligence.wireDOM();
  });

  // Geoapify für Absender PLZ → speichert Lat/Lon für Proximity Bias
  const absenderPlzOrtEl = feld('absender-ort') || feld('rucksendeangabe');
  if (absenderPlzOrtEl) {
    /** @type {any} */
    let absenderTimeout = null;
    absenderPlzOrtEl.addEventListener('input', () => {
      // Fiktiver Testbrief-Ort: kein Geoapify-Abruf fuer eine Fantasie-PLZ.
      if (absenderPlzOrtEl.hasAttribute('data-autofill-aus')) return;
      if (!navigator.onLine) return;
      clearTimeout(absenderTimeout);
      absenderTimeout = setTimeout(() => {
        const key = load(STORAGE_KEYS.geoapifyKey, '');
        if (!key) return;
        /* Field.getValue, nicht textContent: bei einem <input> ist textContent
           immer leer. Das Feld ist seit 2026-11-12 ein <input> — der Zugriff
           ueber Field ist deshalb Pflicht, nicht Vorsorge (B3-Review, Befund
           B12/S6). */
        const text = Field.getValue(absenderPlzOrtEl).trim();
        const match = text.match(/(\d{5})/);
        if (match) {
          const plz = match[1];
          fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(plz)}&type=postcode&filter=countrycode:de&format=json&apiKey=${encodeURIComponent(key)}&limit=1`, {
            signal: AbortSignal.timeout(8000),
          })
            .then(r => r.json())
            .then(data => {
              if (data?.results?.length) {
                const result = data.results[0];
                if (result.lat && result.lon) {
                  saveJSON(STORAGE_KEYS.senderCoords, { lat: result.lat, lon: result.lon });
                }
              }
            }).catch(console.debug);
        }
      }, 500);
    });
  }

  /* Strassen-Vorschlaege (Geoapify) fuer BEIDE Strassenfelder: Absender und
     Empfaenger. Bedienung kommt aus `initVorschlagsliste`; hier stehen nur
     Abruf (mit LRU-Cache) und was beim Klick passiert.
     - gesucht wird nur der getippte Name, unabhaengig von anderen Feldern
     - Relevanz per Naehe (Standard Bonn)
     - ohne API-Key oder ohne Netz: keine Liste (offline-first)
     - laufende Anfrage wird beim naechsten Tastendruck abgebrochen */
  const strassePopover = feld('strasse-vorschlaege');
  if (strassePopover) {
    /** @type {AbortController | null} */
    let strassenController = null;
    /* Schluessel der zuletzt angezeigten Strasse-Treffer. Beim Klick wird er
       gezaehlt (LFU: gewaehlte Begriffe bleiben laenger im Ring). */
    let letzterStrassenSchluessel = '';

    /** @param {any} r Geoapify-Treffer @returns {{ text: string, zusatz: string, wert: any }} */
    const zuVorschlag = (r) => ({
      text: [r.street, r.housenumber].filter(Boolean).join(' '),
      zusatz: `· ${[r.postcode, r.city].filter(Boolean).join(' ')}`,
      wert: r
    });

    /** @param {string} text */
    const holeStrassen = async (text) => {
      if (text.length < 3 || !navigator.onLine) return [];
      const key = load(STORAGE_KEYS.geoapifyKey, '');
      if (!key) return [];
      const schluessel = `strasse:${text.toLowerCase()}`;
      letzterStrassenSchluessel = schluessel;
      const ausCache = cacheHole(schluessel);
      /* Auch eine LEERE Trefferliste ist ein Ergebnis: sonst fragt jeder
         erneute Tastendruck dieselbe nichtsnutzige Zeichenfolge wieder an
         (Vorgabe 2026-11-22: "alle Ergebnisse speichern"). */
      if (ausCache) return ausCache.map(zuVorschlag);

      strassenController?.abort();
      strassenController = new AbortController();
      try {
        const { antwort } = await holeMitFailover(
          strassenSuchPfad(text, key),
          strassenController
        );
        if (!antwort.ok) return [];
        const daten = await antwort.json();
        const treffer = (daten?.results || []).filter((/** @type {any} */ r) => r.street);
        if (!treffer.length) {
          cacheSetze(schluessel, []);
          return [];
        }
        cacheSetze(schluessel, /** @type {any} */ (treffer));
        return treffer.map(zuVorschlag);
      } catch (err) {
        /* Abbruch ist kein Fehler: der naechste Tastendruck fragt neu. */
        if (/** @type {Error} */ (err)?.name !== 'AbortError') {
          console.debug('[Address] Strassen-Vorschlaege fehlgeschlagen:', err);
        }
        return [];
      }
    };

    /** @param {string} feldId @param {string} ortId */
    const initStrasse = (feldId, ortId) => {
      const el = feld(feldId);
      if (!el) return;
      /* Erster Tastendruck: Socket vorwaermen (derselbe Weg wie beim
         Adress-Suchfeld, kein externer Verweis im HTML -> A38 bleibt gruen). */
      el.addEventListener('focus', waermeVerbindungVor);
      initVorschlagsliste({
        feld: el,
        popover: strassePopover,
        /* 180 ms statt 350: das Geoapify-Beispiel antwortet beim Tippen
           schneller (Vorgabe 2026-11-22: "etwas langsam"). */
        verzoegerung: 180,
        hole: holeStrassen,
        beiWahl: (/** @type {any} */ v) => {
          const r = v.wert || {};
          /* Erst hier zaehlt der Begriff als "gebraucht" - nicht beim Tippen.
             Das ist die Admission-Policy des Rings (siehe geo-cache.js):
             nur eine Uebernahme ins Feld macht eine Abfrage wertvoll. */
          geoCacheZaehle(letzterStrassenSchluessel);
          applyValue(feldId, v.text, 'auto');
          /* Passende PLZ/Ort immer mitschreiben. */
          const ortFeld = feld(ortId);
          const plzOrt = `${r.postcode || ''} ${r.city || ''}`.trim();
          if (ortFeld && plzOrt) {
            applyValue(ortId, plzOrt, 'auto');
            AddressIntelligence.targetLock = { plz: r.postcode || '', city: r.city || '' };
            eventBus.publish(Events.DOCUMENT_CHANGED, { origin: 'auto', feld: ortId });
          }
          eventBus.publish(Events.DOCUMENT_CHANGED, { origin: 'auto', feld: feldId });
          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
        }
      });
    };

    initStrasse('absender-strasse', 'absender-ort');
    initStrasse('empfaenger-strasse', 'empfaenger-ort');
  }
}
