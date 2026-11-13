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
import { load, loadJSON, STORAGE_KEYS, save, saveJSON } from './persistence.js';

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
function bewegeAuswahl(items, von, richtung) {
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
const maxSuggestions = () => (window.innerWidth < SUGGESTION_BREAKPOINT_PX ? 8 : 12);

/**
 * Wires the recipient address block in the DOM for instant offline autocomplete.
 */
AddressIntelligence.wireDOM = function wireDOM() {
  const empfOrtEl = feld('empfaenger-ort');
  const empfFirmaEl = feld('empfaenger-firma');
  const empfStrasseEl = feld('empfaenger-strasse');

  if (!empfOrtEl) return;
  if (empfOrtEl.dataset.wired === 'true') return;
  empfOrtEl.dataset.wired = 'true';

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

  // Schutz vor Überschreiben: Manuelle Tastatureingaben entfernen data-autofilled
  /** @param {HTMLElement} el */
  const trackManualInput = (el) => {
    el.addEventListener('input', (/** @type {Event} */ e) => {
      const ev = /** @type {InputEvent} */ (e);
      if (!ev.isComposing) {
        el.removeAttribute('data-autofilled');
        /* Nur ein echtes Nutzereingreifen raeumt die Ziel-Sperre ab und hebt
         * data-autofill-aus auf. Sonst loescht ein programmatisch gefuelltes
         * Feld seine eigene Sperre: der Clipboard-Import setzt targetLock und
         * schickt danach ein synthetisches input-Event (B3-01, geprueft
         * 2026-11-12). `isTrusted` ist bei dispatchEvent() false. */
        if (ev.isTrusted) {
          if (el === empfOrtEl) AddressIntelligence.targetLock = null;
          el.removeAttribute('data-autofill-aus');
        }
      }
    });
  };
  trackManualInput(empfOrtEl);
  if (empfFirmaEl) trackManualInput(empfFirmaEl);

  // Eingabe im Ort-Feld (Case A & B & Universelles Suchfeld)
  empfOrtEl.addEventListener('input', (/** @type {any} */ e) => {
    // Fiktive Testbrief-Adresse: nicht aufloesen, nicht ueberschreiben.
    if (empfOrtEl.hasAttribute('data-autofill-aus')) return;
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
      const res = AddressIntelligence.lookupPlz(plz);
      if (res && !userEditing) {
        // Plausibilitäts-Check: Passt PLZ zu vorher gewähltem Ort?
        if (AddressIntelligence.targetLock?.city) {
          const allowedPlzs = AddressIntelligence.ortIndex.get(AddressIntelligence.targetLock.city) || [];
          if (allowedPlzs.length > 0 && !allowedPlzs.includes(plz)) {
            const warn = `PLZ ${plz} gehört nicht zu ${AddressIntelligence.targetLock.city} – meinten Sie ${res.city}?`;
            notify(warn, 'warning');
          }
        }

        const completed = `${res.plz} ${res.city}`;
        Field.setValue(empfOrtEl, completed);
        empfOrtEl.setAttribute('data-autofilled', 'true');

        AddressIntelligence.targetLock = { plz: res.plz, city: res.city };

        // Großkunde / Behörde Automatik
        if (res.isGrosskunde && res.grosskunde) {
          if (empfFirmaEl && (!Field.getValue(empfFirmaEl).trim() || empfFirmaEl.getAttribute('data-autofilled') === 'true')) {
            Field.setValue(empfFirmaEl, res.grosskunde.name);
            empfFirmaEl.setAttribute('data-autofilled', 'true');
          }
          if (empfStrasseEl && !Field.getValue(empfStrasseEl).trim()) {
            empfStrasseEl.setAttribute('data-placeholder', '(Großempfänger – Straße entfällt)');
          }
          const toastMsg = Constants.TOASTS.ADDRESS.GROSSKUNDE_RECOGNIZED(res.grosskunde.name);
          notify(toastMsg, 'info');
        }

        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
        clearPopover();
        return;
      } else {
        // Keine PLZ gefunden oder Nutzer editiert/löscht gerade (userEditing === true) -> KEIN Auto-Fill!
        clearPopover();
        return;
      }
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
        Field.setValue(empfOrtEl, completed);
        empfOrtEl.setAttribute('data-autofilled', 'true');
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

  // Case C: Eingabe im Firma-Feld (Großkunden & Behörden Direkt-Lookup)
  if (empfFirmaEl) {
    empfFirmaEl.addEventListener('input', () => {
      // Fiktive Testbrief-Firma: kein Grosskunden-Lookup.
      if (empfFirmaEl.hasAttribute('data-autofill-aus')) return;
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
      bewegeAuswahl(/** @type {HTMLElement[]} */ (items), currentIndex, 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      bewegeAuswahl(/** @type {HTMLElement[]} */ (items), currentIndex, -1);
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
 * Entfernt dabei Dubletten: `resolveCityInput('troi')` liefert sowohl
 * "Troisdorf (3 PLZs)" als auch "Troisdorf 53840" — nach dem Ausklappen waere
 * die 53840 zweimal da. Der Schluessel enthaelt den Typ, damit eine Behoerde
 * mit derselben PLZ nicht verschwindet.
 * @param {Array<any>} liste
 * @returns {Array<any>}
 */
export function flacheVorschlaege(liste) {
  const out = [];
  const gesehen = new Set();
  for (const item of liste) {
    const plzAnzahl = item.plzCount || 0;
    const ausklappen = item.typ === 'Stadt' && !item.isSinglePlz && plzAnzahl > 1 && plzAnzahl < GRUPPE_AB_PLZ;
    for (const eintrag of ausklappen ? AddressIntelligence.lookupCityPlzs(item.city) : [item]) {
      const schluessel = `${eintrag.typ || ''}|${eintrag.plz || eintrag.name || ''}`;
      if (gesehen.has(schluessel)) continue;
      gesehen.add(schluessel);
      out.push(eintrag);
    }
  }
  return out;
}

/** Anzahl der Pastelltoene fuer die Ortsunterscheidung. */
export const ORT_FARBEN = 6;

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
 * Der Schluessel enthaelt Bundesland/Stadtteil: "neustadt" liefert neun Orte
 * mit demselben Namen, die sich nur im Bundesland unterscheiden.
 * @param {Array<any>} eintraege
 * @returns {string[]} Farbe je Eintrag, gleiche Laenge wie `eintraege`
 */
export function farbenFuerListe(eintraege) {
  const jeOrt = new Map();
  let naechste = 1;
  return eintraege.map((eintrag) => {
    const ort = `${eintrag.city || eintrag.name || ''}|${eintrag.state || eintrag.district || ''}`;
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
 */
function renderUniversalSuggestions(matches, totalCount, ortEl, firmaEl, strasseEl, popoverEl, anchorEl = null, isPlzList = false) {
  const render = () => {
    popoverEl.replaceChildren();

    /** @param {any} item */
    const selectItem = (item) => {
      // Stadt mit mehreren PLZs: sofort die PLZ-Liste öffnen.
      if (item.typ === 'Stadt' && !item.isSinglePlz) {
        const plzs = AddressIntelligence.lookupCityPlzs(item.city);
        renderUniversalSuggestions(plzs, plzs.length, ortEl, firmaEl, strasseEl, popoverEl, anchorEl, true);
        return;
      }

      AddressIntelligence.applySelection(item, ortEl, firmaEl, strasseEl);
      AddressIntelligence.targetLock = { city: item.city, plz: item.plz };
      setCaretToEnd(anchorEl || ortEl);
      eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
      hidePopoverSafe(popoverEl);
    };

    const eintraege = flacheVorschlaege(matches);
    const farben = farbenFuerListe(eintraege);

    eintraege.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      /* Ortsfarbe: verschiedene Orte = verschiedene Toene, gleiche Stadt
         durchgehend gleich (siehe farbenFuerListe). */
      li.dataset.ortFarbe = farben[index];

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
      Field.setValue(nameSpan, item.name);
      leftWrapper.appendChild(nameSpan);

      // Typ-Badge wenn nicht Stadt
      if (item.typ && item.typ !== 'Stadt') {
        const badge = document.createElement('span');
        badge.className = 'ac-badge';
        Field.setValue(badge, `[${item.typ}]`);
        leftWrapper.appendChild(badge);

        const citySub = document.createElement('span');
        citySub.className = 'city-sub';
        Field.setValue(citySub, item.city);
        leftWrapper.appendChild(citySub);
      } else if (!item.isSinglePlz && (item.plzCount || 0) > 1) {
        const countSub = document.createElement('span');
        countSub.className = 'city-sub';
        Field.setValue(countSub, `(${item.plzCount} PLZs)`);
        leftWrapper.appendChild(countSub);
      }

      li.appendChild(leftWrapper);

      // UI-Disambiguierung: Bundesland und/oder Stadtteil zur Orientierung anzeigen
      const stateCode = item.state || (item.plz ? AddressIntelligence.getState(item.plz) : '');
      const stateName = stateCode ? (BUNDESLAENDER[stateCode] || stateCode) : '';

      let extraText = '';
      if (item.district) {
        extraText = `(${item.district})`;
      } else if (stateName) {
        extraText = `(${stateName})`;
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

  /** @param {string} name @param {string} street @param {string} city */
  const baueRueckzeile = (name, street, city) =>
    [abbreviateName(name), street, city].filter((p) => p.length > 0).join(' • ');

  /* Drei Zustaende statt Textvergleich. Textvergleich war die Ursache dafuer,
   * dass eine aus dem Entwurf geladene Zeile ("Light Yagami • …") als
   * Nutzertext galt und nie wieder mit Initialen geschrieben wurde
   * (gemessen 2026-11-12).
   *   unklar  — direkt nach dem Laden, wird beim ersten Sync entschieden
   *   auto    — der Helfer besitzt die Zeile und darf sie ersetzen
   *   manuell — der Nutzer hat sie angefasst; sie bleibt stehen
   * "manuell" entsteht durch jede Eingabe in das Feld, also auch durch
   * Loeschen: dann bleibt die Zeile leer. */
  /** @type {'unklar'|'auto'|'manuell'} */
  let rueckModus = 'unklar';
  /** @type {'unklar'|'auto'|'manuell'} */
  let unterschriftModus = 'unklar';
  /** @type {string|null} */
  let letzterAutowert = null;
  let schreibeGerade = false;

  /** @param {HTMLElement | null} el @param {string} wert */
  const schreibe = (el, wert) => {
    if (!el) return;
    schreibeGerade = true;
    Field.setValue(el, wert);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    schreibeGerade = false;
  };

  for (const el of [absender, unterschrift]) {
    if (!el) continue;
    el.addEventListener('input', () => {
      if (schreibeGerade) return; // eigener Schreibvorgang, kein Nutzer
      if (el === absender) {
        rueckModus = 'manuell';
        absender.dataset.quelle = 'manuell';
      } else unterschriftModus = 'manuell';
    });
  }

  function sync() {
    const name = lies(infoName);
    const street = lies(infoStreet);
    const city = lies(infoCity);
    const auto = baueRueckzeile(name, street, city);
    const aktuell = lies(absender);

    // 1. Ruecksendezeile
    const entscheidung = spiegelEntscheidung({
      modus: rueckModus,
      letzterAutowert,
      aktuell,
      auto,
      street,
      city
    });
    rueckModus = entscheidung.modus;
    /* Herkunft am Feld markieren: collectDraft() nimmt sie als
       `<id>__quelle` in den Entwurf, #restoreState() setzt sie zurueck. */
    if (absender) {
      if (rueckModus === 'unklar') absender.removeAttribute('data-quelle');
      else absender.dataset.quelle = rueckModus;
    }
    letzterAutowert = entscheidung.letzterAutowert;
    if (entscheidung.schreiben) schreibe(absender, auto);

    // 2. Maschinenschrift (voller Name, ohne Initialen)
    const jetztUnterschrift = lies(unterschrift);
    if (unterschriftModus === 'unklar') {
      unterschriftModus = jetztUnterschrift === '' || jetztUnterschrift === name ? 'auto' : 'manuell';
    }
    if (unterschriftModus === 'auto' && jetztUnterschrift !== name) schreibe(unterschrift, name);
  }

  infoName.addEventListener('input', sync);
  infoStreet.addEventListener('input', sync);
  infoCity.addEventListener('input', sync);

  eventBus.subscribe(Events.DOCUMENT_CHANGED, () => {
    /* Undo/Redo und Reset stellen einen fremden Stand wieder her: Zustand neu
     * entscheiden lassen, statt ihn zu raten. */
    /* Nur die Rücksendezeile neu entscheiden: sie kann per Undo einen
       fremden Stand zurueckbekommen. Die Maschinenschrift bleibt eine reine
       Spiegelung des Namens (Test: "Maschinenschrift folgt weiterhin dem
       Namen"). */
    /* Die Herkunft steht im Entwurf (`data-quelle`), also nicht raten: nur
     * wenn sie fehlt (Altbestand, Reset), bleibt der Modus offen. */
    const gespeichert = absender?.getAttribute('data-quelle');
    rueckModus = gespeichert === 'auto' || gespeichert === 'manuell' ? gespeichert : 'unklar';
    letzterAutowert = null;
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
  let suchGeneration = 0;
  /** @type {any} */
  let debounceSearchTimeout = null;
  /** @type {any} */
  let keyDebounceTimeout = null;
  /** @type {AddressEntry[]} */
  let renderedSuggestions = [];
  let activeSuggestionIndex = -1;

  // Load initial settings
  const savedKey = load(STORAGE_KEYS.geoapifyKey, '') || '';
  inputGeoapifyKey.value = savedKey;

  if (!savedKey) {
    setGeoapifyState('', '');
  } else {
    setGeoapifyState('valid', '✓ Key aktiv und gespeichert.');
    validateKeyWithHeartbeat(savedKey, { isInitial: true });
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
   * @param {{ isInitial?: boolean }} [options]
   */
  async function validateKeyWithHeartbeat(key, { isInitial = false } = {}) {
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
        if (!isInitial) {
          notify(Constants.TOASTS.GEOAPIFY.KEY_INVALID, 'error');
        }
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

  // Geoapify In-Memory Cache
  /** @type {Map<string, AddressEntry[]>} */
  const apiCache = new Map();

  // Tastatursteuerung für das native Listbox-Popover
  inputAddressSearch.addEventListener('keydown', (event) => {
    if (!renderedSuggestions.length) return;
    const key = event.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const optionen = /** @type {HTMLElement[]} */ (Array.from(addressSuggestions.querySelectorAll('[role=option]')));
      const richtung = /** @type {1 | -1} */ (key === 'ArrowDown' ? 1 : -1);
      activeSuggestionIndex = bewegeAuswahl(optionen, activeSuggestionIndex, richtung);
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
    const generation = ++suchGeneration;

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
    const sofort = mischeNachRelevanz([localMatches, offlineMatches], query);

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
    if (apiCache.has(cacheKey)) {
      mergeAndRender(localMatches, apiCache.get(cacheKey) || [], query);
      return;
    }

    const fetchOptions = {
      signal: AbortSignal.any([activeAbortController.signal, AbortSignal.timeout(8000)]),
    };
    const coords = /** @type {{ lat: number, lon: number } | null} */ (loadJSON(STORAGE_KEYS.senderCoords, null));

    const searchText = lock ? `${query}, ${lock.plz} ${lock.city}` : query;
    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&apiKey=${encodeURIComponent(key)}&lang=de&limit=5&format=json&filter=countrycode:de`;
    if (!lock && coords?.lat && coords?.lon) {
      url += `&bias=proximity:${coords.lon},${coords.lat}`;
    }

    try {
      const response = await fetch(url, fetchOptions);
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

      /* Deckel gegen monoton wachsenden Speicher (SMELL aus dem Review):
         aeltester Eintrag fliegt raus, wenn der Cache voll ist. */
      const aeltesterSchluessel = apiCache.keys().next().value;
      if (apiCache.size >= 100 && typeof aeltesterSchluessel === 'string') {
        apiCache.delete(aeltesterSchluessel);
      }
      apiCache.set(cacheKey, parsedSuggestions);
      /* Ueberholte Antwort verwerfen: der Nutzer hat inzwischen weitergetippt
       * oder das Feld geleert (B3-03). */
      if (generation !== suchGeneration) return;
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
  function mischeNachRelevanz(quellen, query) {
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
    renderSuggestions(mischeNachRelevanz([localMatches, remoteMatches], query), query, true);
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
    showPopoverSafe(addressSuggestions);
  }

  /**
   * @param {AddressEntry} item
   */
  function selectSuggestion(item) {
    const empfStrasse = feld('empfaenger-strasse');
    const empfOrt = feld('empfaenger-ort');

    /* Nur fuellen, was der Treffer wirklich hat: ein Stadt-/PLZ-Treffer hat
       keine Strasse und darf das Empfaengerfeld nicht leeren. */
    if (empfStrasse && item.street) {
      Field.setValue(empfStrasse, item.street);
    }
    if (empfOrt && (item.postcode || item.city)) {
      Field.setValue(empfOrt, `${item.postcode} ${item.city}`.trim());
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
}
