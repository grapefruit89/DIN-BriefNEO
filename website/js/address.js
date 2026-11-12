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

    matches.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

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

    bindListSelection(popoverEl, matches, selectItem);
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
      if (el === absender) rueckModus = 'manuell';
      else unterschriftModus = 'manuell';
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
    rueckModus = 'unklar';
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
    renderSuggestions(localMatches, query, false);

    // 2. REMOTE SEARCH (Debounced)
    debounceSearchTimeout = setTimeout(() => {
      performAddressSearch(query, localMatches, generation);
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

      /** @type {AddressEntry[]} */
      const parsedSuggestions = (data.results || []).map((/** @type {any} */ p) => {
        return {
          street: p.street || '',
          housenumber: p.housenumber || '',
          postcode: p.postcode || '',
          city: p.city || '',
          formatted: p.formatted || [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(', '),
          source: 'geoapify'
        };
      }).filter((/** @type {AddressEntry} */ s) => s.street && s.city);

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
  function mergeAndRender(localMatches, remoteMatches, query) {
    /** @type {AddressEntry[]} */
    const combined = [...localMatches];
    remoteMatches.forEach(ps => {
      if (!combined.find(c => c.formatted === ps.formatted)) {
        combined.push(ps);
      }
    });
    renderSuggestions(combined, query, true);
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

    if (allowZeroClick && suggestions.length > 5) {
      renderedSuggestions = [];
      const statusLi = document.createElement('li');
      statusLi.className = 'suggestion-hint';
      statusLi.setAttribute('role', 'option');
      statusLi.setAttribute('aria-disabled', 'true');
      statusLi.setAttribute('aria-selected', 'false');
      Field.setValue(statusLi, `${suggestions.length} Treffer – bitte PLZ oder Straße ergänzen`);
      addressSuggestions.appendChild(statusLi);
      showPopoverSafe(addressSuggestions);
      return;
    }

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

    bindListSelection(addressSuggestions, renderedSuggestions, selectSuggestion);

    showPopoverSafe(addressSuggestions);
  }

  /**
   * @param {AddressEntry} item
   */
  function selectSuggestion(item) {
    const empfStrasse = feld('empfaenger-strasse');
    const empfOrt = feld('empfaenger-ort');

    if (empfStrasse) {
      Field.setValue(empfStrasse, `${item.street} ${item.housenumber}`.trim());
    }
    if (empfOrt) {
      Field.setValue(empfOrt, `${item.postcode} ${item.city}`.trim());
    }

    hidePopoverSafe(addressSuggestions);
    if (inputAddressSearch) inputAddressSearch.value = '';

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
        const text = absenderPlzOrtEl.textContent ? absenderPlzOrtEl.textContent.trim() : '';
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
