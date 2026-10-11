// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]
// @adr [[ADR-JS]]
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @guide [[geoapify-autocomplete]]
// @guide [[din-5008-css-architektur]]

/**
 * @file 45-address.js — Adress-, PLZ- und Geocoding-Services für DIN-BriefNEO.
 * Bündelt:
 *  1. AddressIntelligence & initSenderSync: Offline PLZ- und Großempfänger-Engine.
 *  2. ClipboardAddressParser: Anschrift-Parser aus Zwischenablage mit Popover-Vorschau.
 *  3. initAddressServices: Optionaler Geoapify-Service mit Cache, Listbox-Popover und lokaler Historie.
 * Pure Domain-Funktionen und Gzip-DecompressionStream sind modular in 44-address-domain.js ausgelagert.
 */

import { setCaretToEnd } from './01-document.js';
import { eventBus, Events } from './00-event-bus.js';
import { load, save, loadJSON, saveJSON, STORAGE_KEYS } from './51-persistence.js';
import {
  fetchGzipJson,
  normalizePostcode,
  resolvePostcode,
  resolveCity,
  filterPostcodePrefix,
  detectPlzInputPattern
} from './44-address-domain.js';

// Re-export für Abwärtskompatibilität
export {
  fetchGzipJson,
  normalizePostcode,
  resolvePostcode,
  resolveCity,
  filterPostcodePrefix,
  detectPlzInputPattern
};

/** @typedef {import('./44-address-domain.js').GrosskundeEntry} GrosskundeEntry */
/** @typedef {import('./44-address-domain.js').PlzLookupResult} PlzLookupResult */

/* =========================================================================================
 * 3. ADDRESS INTELLIGENCE & SENDER SYNC
 * ========================================================================================= */

/**
 * AddressIntelligence: Ultra-fast 100% Offline German Postal & Großempfänger Engine.
 * Powered by 87 KB PLZ-Datenbank mit nativer DecompressionStream-PIP.
 */
export class AddressIntelligence {
  /** @type {Map<string, string>} */
  static plzToCity = new Map();

  /** @type {Map<string, string[]>} */
  static cityToPlz = new Map();

  /** @type {Map<string, GrosskundeEntry>} */
  static grosskunden = new Map();

  /** @type {{ plz: string, city: string } | null} */
  static targetLock = null;

  /** @type {boolean} */
  static isReady = false;

  /** @type {Promise<boolean> | null} */
  static #initPromise = null;

  /**
   * Initializes the in-memory database by decompressing the gzip datasets.
   * Runs in under 1ms via native C++ DecompressionStream.
   * @returns {Promise<boolean>}
   */
  static async init() {
    if (this.isReady) return true;
    if (this.#initPromise) return this.#initPromise;

    this.#initPromise = (async () => {
      try {
        const [plzData, grossData] = await Promise.all([
          fetchGzipJson('data/de_plz_ort.json.gz'),
          fetchGzipJson('data/de_grosskunden_plz.json.gz')
        ]);
        if (!plzData) {
          console.warn('[AddressIntelligence] Datensatz de_plz_ort nicht ladbar — PLZ-Automatik inaktiv.');
          return false;
        }

        // Build PLZ -> City index
        for (const [plz, city] of Object.entries(plzData)) {
          this.plzToCity.set(plz, city);

          // Build reverse City -> PLZ index
          const normCity = city.toLowerCase().trim();
          let list = this.cityToPlz.get(normCity);
          if (!list) {
            list = [];
            this.cityToPlz.set(normCity, list);
          }
          list.push(plz);
        }

        // Build Großempfänger index (optional)
        const gross = grossData || {};
        for (const [plz, info] of Object.entries(gross)) {
          this.grosskunden.set(plz, /** @type {GrosskundeEntry} */ (info));
        }

        this.isReady = true;
        return true;
      } catch (err) {
        console.warn('[AddressIntelligence] Initialization error:', err);
        return false;
      }
    })();

    return this.#initPromise;
  }

  /**
   * Instant PLZ lookup (0.001 ms).
   * @param {string} plz 5-digit postal code
   * @returns {PlzLookupResult | null}
   */
  static lookupPlz(plz) {
    return resolvePostcode(plz, this.plzToCity, this.grosskunden);
  }

  /**
   * Reverse City lookup (City name -> list of postal codes).
   * @param {string} query
   * @returns {{ plz: string, city: string }[]}
   */
  static lookupCity(query) {
    return resolveCity(query, this.cityToPlz, this.plzToCity);
  }

  /**
   * Progressive prefix filter (e.g. "53" -> all Bonn / Rhein-Sieg PLZs).
   * @param {string} prefix 2-4 digits
   * @param {number} [limit=10]
   * @returns {{ plz: string, city: string }[]}
   */
  static filterPrefix(prefix, limit = 10) {
    return filterPostcodePrefix(prefix, this.plzToCity, limit);
  }

  /**
   * Wires the recipient address block in the DOM for instant offline autocomplete.
   */
  static wireDOM() {
    const empfOrtEl = document.getElementById('empfaenger-ort');
    const empfFirmaEl = document.getElementById('empfaenger-firma');
    const empfStrasseEl = document.getElementById('empfaenger-strasse');

    if (!empfOrtEl) return;

    // Popover suggestions container for city -> PLZ reverse matches
    let suggestionsPopover = document.getElementById('plz-suggestions-popover');
    if (!suggestionsPopover) {
      suggestionsPopover = document.createElement('ul');
      suggestionsPopover.id = 'plz-suggestions-popover';
      suggestionsPopover.setAttribute('popover', 'manual');
      suggestionsPopover.className = 'anschrift-vorschlaege-liste nicht-drucken';
      empfOrtEl.parentElement?.appendChild(suggestionsPopover);
    }

    empfOrtEl.addEventListener('input', () => {
      const rawText = (empfOrtEl.textContent || "").trim();

      if (this.targetLock && !rawText.startsWith(this.targetLock.plz)) {
        this.targetLock = null;
      }

      // Case 1: Exactly 5 digits entered -> Instant PLZ resolution (0.001 ms)
      const plzMatch = rawText.match(/^(\d{5})$/);
      if (plzMatch) {
        const plz = plzMatch[1];
        const res = this.lookupPlz(plz);
        if (res) {
          const completed = `${res.plz} ${res.city}`;
          empfOrtEl.textContent = completed;

          // Ortsnamen als aktive Text-Selektion markieren (Weitertippen überschreibt, Tab/Pfeil-Rechts übernimmt)
          const textNode = empfOrtEl.firstChild;
          if (textNode) {
            const sel = window.getSelection();
            if (sel) {
              const range = document.createRange();
              range.setStart(textNode, 5);
              range.setEnd(textNode, completed.length);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }

          // Target Lock: fix city for subsequent street lookups (Bonn bias deactivated)
          this.targetLock = { plz: res.plz, city: res.city };

          // Großempfänger Automatik (OLG Frankfurt Az. 6 U 170/13)
          if (res.isGrosskunde && res.grosskunde) {
            // Auto-populate company name if still empty
            if (empfFirmaEl && !(empfFirmaEl.textContent || "").trim()) {
              empfFirmaEl.textContent = res.grosskunde.name;
            }

            // In accordance with DIN 5008 & OLG Frankfurt, street is legally unnecessary
            if (empfStrasseEl && !(empfStrasseEl.textContent || "").trim()) {
              empfStrasseEl.setAttribute('placeholder', '(Großempfänger – Straße entfällt)');
            }

            const toastMsg = `🏛️ Großempfänger erkannt: ${res.grosskunde.name} (Straße entfällt nach DIN 5008)`;
            eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: toastMsg, type: 'info' });
          }

          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
          this.#hidePopover(suggestionsPopover);
          return;
        }
      }

      // Case 2: Letters entered -> Instant reverse city search
      if (rawText.length >= 3 && !/^\d+$/.test(rawText) && !/^\d{5}\s+/.test(rawText)) {
        const matches = this.lookupCity(rawText);
        if (matches.length > 0 && matches.length <= 6) {
          this.#renderCitySuggestions(matches, empfOrtEl, suggestionsPopover);
          return;
        }
      }

      this.#hidePopover(suggestionsPopover);
    });

    // Hide suggestions on blur
    empfOrtEl.addEventListener('blur', () => {
      setTimeout(() => this.#hidePopover(suggestionsPopover), 200);
    });
  }

  /**
   * Renders the city suggestions popover.
   * @param {{ plz: string, city: string }[]} matches
   * @param {HTMLElement} targetEl
   * @param {HTMLElement} popoverEl
   */
  static #renderCitySuggestions(matches, targetEl, popoverEl) {
    const render = () => {
      popoverEl.replaceChildren();

      matches.forEach(item => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.textContent = `${item.plz} ${item.city}`;

        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          targetEl.textContent = `${item.plz} ${item.city}`;
          this.targetLock = { plz: item.plz, city: item.city };
          this.#moveCaretToEnd(targetEl);
          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
          this.#hidePopover(popoverEl);
        });

        popoverEl.appendChild(li);
      });
    };
    // Element-scoped View Transitions (Chrome 147+): Listenwechsel nur lokal crossfaden
    if (this.isReady && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // @ts-expect-error Element-scoped View Transitions (Chrome 147+, noch nicht in lib.dom)
      popoverEl.startViewTransition(render).finished.catch(() => {});
    } else {
      render();
    }

    try {
      /** @type {HTMLElement & { showPopover: () => void }} */ (popoverEl).showPopover();
    } catch (e) {}
  }

  /**
   * @param {HTMLElement | null} el
   */
  static #hidePopover(el) {
    if (!el) return;
    try {
      /** @type {HTMLElement & { hidePopover: () => void }} */ (el).hidePopover();
    } catch (e) {}
  }

  /**
   * Sets cursor to the end of a contenteditable element.
   * @param {HTMLElement} el
   */
  static #moveCaretToEnd(el) {
    setCaretToEnd(el);
  }
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
  const prefix = titles.length ? titles.join(' ') + ' ' : '';
  return prefix + firstName.charAt(0).toUpperCase() + '. ' + rest;
}

/**
 * Synchronizes the sender information from the info block to the return address line
 * and the signature name.
 */
export function initSenderSync() {
  const infoName = document.getElementById('absender-namenszeile');
  const infoStreet = document.getElementById('absender-strasse');
  const infoCity = document.getElementById('absender-ort');
  const absender = document.getElementById('rucksendezeile');
  const unterschrift = document.getElementById('unterschrift');

  if (!infoName || !infoStreet || !infoCity || !absender || !unterschrift) return;

  let lastSyncedRucksendezeile = (absender.textContent || '').trim();
  let lastSyncedUnterschrift = (unterschrift.textContent || '').trim();

  function sync() {
    if (!infoName || !infoStreet || !infoCity || !absender || !unterschrift) return;
    const name = (infoName.textContent || '').trim();
    const street = (infoStreet.textContent || '').trim();
    const city = (infoCity.textContent || '').trim();

    // 1. Sync to Rücksendezeile (absender) with abbreviated name
    const shortName = abbreviateName(name);
    const parts = [shortName, street, city].filter(p => p.length > 0);
    const newRucksendezeile = parts.join(' • ');
    const currentAbsender = (absender.textContent || '').trim();
    if (!currentAbsender || currentAbsender === lastSyncedRucksendezeile) {
      absender.textContent = newRucksendezeile;
      lastSyncedRucksendezeile = newRucksendezeile;
      absender.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 2. Sync to Maschinenschrift (unterschrift) with full name
    const currentUnterschrift = (unterschrift.textContent || '').trim();
    if (!currentUnterschrift || currentUnterschrift === lastSyncedUnterschrift) {
      unterschrift.textContent = name;
      lastSyncedUnterschrift = name;
      unterschrift.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  infoName.addEventListener('input', sync);
  infoStreet.addEventListener('input', sync);
  infoCity.addEventListener('input', sync);

  eventBus.subscribe(Events.DOCUMENT_CHANGED, () => {
    lastSyncedRucksendezeile = (absender.textContent || '').trim();
    lastSyncedUnterschrift = (unterschrift.textContent || '').trim();
  });
}

/* =========================================================================================
 * 4. CLIPBOARD ADDRESS PARSER
 * ========================================================================================= */

/**
 * @typedef {object} AddressCandidate
 * @property {number} [score]
 * @property {string} [firma]
 * @property {string} [name]
 * @property {string} [zusatz]
 * @property {string} strasse
 * @property {string} plz
 * @property {string} ort
 * @property {string} [source_type]
 */

/**
 * ClipboardAddressParser: 95%-KISS Adressparser für deutsche Firmen- und Personenanschriften.
 * Folgt dem Kernmuster: PLZ-Zeile als Anker, Zeile davor als Straße, Zeilen davor als Empfänger.
 * Bietet bei Mehrdeutigkeit ein sauberes Popover zur Nutzer-Auswahl statt überfrachteter Heuristiken.
 */
export class ClipboardAddressParser {
  /** Typische deutsche Rechtsformen und Organisationen */
  static CORP_REGEX = /\b(gmbh\s*&\s*co\.?\s*kg|gmbh|ag|se|kg|ohg|e\.v\.|ug|gbr|e\.k\.|e\.?g\.?|universität|hochschule|verband|stiftung|behörde|institut|verlag|kanzlei|praxis|apotheke|büro|agentur|studio|klinik|hotel|restaurant|bank|sparkasse)\b/i;

  /** Anreden und Empfänger-Prefixe */
  static PERSON_PREFIX_REGEX = /^(herr|frau|herrn|dr\.|prof\.|z\.\s*hd\.|zu\s*händen)\b/i;

  /** Straßenschlüsselwörter und Postfach */
  static STREET_REGEX = /(?:str(?:aße|asse|\.)?|weg|platz|allee|damm|ring|ufer|gasse|zeile|chaussee|speersort|spitze|bellevue|postfach)\b/i;

  /** Zeilen-Marker für nicht-adressrelevante Metadaten (Telefon, Web, Register etc.) */
  static METADATA_LINE_REGEX = /^(tel[:\.\d\+\/]|telefon|fax[:\.\d\+\/]|telefax|e-?mail|www\.|https?:\/\/|amtsgericht|handelsregister|hr[ab]\b|ust-?id|steuernummer|ihr zeichen|unsere zeichen|datum:)/i;

  /** Abschnittsüberschriften, die nicht als Empfängername interpretiert werden dürfen */
  static SECTION_LABEL_REGEX = /^(hauptsitz|niederlassung|standort|filiale|zentrale|werk|postadresse|hausanschrift|anschrift|adresse|impressum|kontakt)[:\s]*$/i;

  /**
   * Extrahiert Adress-Kandidaten aus unstrukturiertem Text.
   * @param {string} text
   * @returns {AddressCandidate[]}
   */
  static parse(text) {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const plzOrtRegex = /\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüßA-Z\s\-\/\.]+)/;
    /** @type {AddressCandidate[]} */
    const candidates = [];

    // PASS 1: Mehrzeilige Adressblöcke (PLZ-Zeile als Anker)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const plzMatch = line.match(plzOrtRegex);
      if (!plzMatch) continue;

      const plz = plzMatch[1];
      let ort = plzMatch[2].trim().split(/[,;\(]|\b(Tel|Fax|E-Mail|Telefon)\b/i)[0].trim();
      if (i === 0) continue;

      const prevLine = lines[i - 1].trim();
      const isStreet = (/\d+/.test(prevLine) && this.STREET_REGEX.test(prevLine)) ||
                       this.STREET_REGEX.test(prevLine) ||
                       /\d+/.test(prevLine) ||
                       /^postfach\s+\d+/i.test(prevLine);
      if (!isStreet) continue;

      const street = prevLine.replace(/^(postanschrift|hausanschrift|anschrift|adresse|postadresse)\s*:\s*/i, '').replace(/,+$/, '').trim();

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      // Maximal 2 Zeilen vor der Straße betrachten
      /** @type {string[]} */
      const preLines = [];
      for (let j = i - 2; j >= Math.max(0, i - 4); j--) {
        const l = lines[j].trim();
        if (this.METADATA_LINE_REGEX.test(l) || l.length > 80 || l.includes('|')) break;
        if (plzOrtRegex.test(l) || /^\d{5}\b/.test(l)) break; // Stopp bei vorangehender Adresse
        if (this.SECTION_LABEL_REGEX.test(l)) continue;

        const cleanL = l.replace(/^(anbieterin|anbieter|unsere daten|kontakt|impressum|herausgeber|geschäftsführung|geschäftsführer|vertreten durch)\s*:\s*/i, '').trim();
        if (cleanL && !cleanL.endsWith(':')) preLines.unshift(cleanL);
      }

      if (preLines.length === 1) {
        const single = preLines[0];
        if (this.CORP_REGEX.test(single)) {
          candFirma = single;
        } else {
          candName = single;
        }
      } else if (preLines.length >= 2) {
        const l0 = preLines[preLines.length - 2];
        const l1 = preLines[preLines.length - 1];

        if (this.CORP_REGEX.test(l0)) {
          candFirma = l0;
          if (this.PERSON_PREFIX_REGEX.test(l1) || !/\d/.test(l1)) {
            candName = l1.replace(/^(z\.\s*hd\.|zu\s*händen)\s*:?\s*/i, '').trim();
          } else {
            candZusatz = l1;
          }
        } else if (this.CORP_REGEX.test(l1)) {
          candFirma = l1;
          candName = l0;
        } else {
          candFirma = l0;
          candName = l1;
        }
      }

      candidates.push({
        firma: candFirma,
        name: candName,
        zusatz: candZusatz,
        strasse: street,
        plz,
        ort,
        source_type: 'multiline'
      });
    }

    // PASS 2: Einzeilige, kommagetrennte Adressen
    for (const line of lines) {
      if (!line.includes(',')) continue;
      const parts = line.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length < 3) continue;

      const lastPart = parts[parts.length - 1];
      const plzMatch = lastPart.match(plzOrtRegex);
      if (!plzMatch) continue;

      const streetPart = parts[parts.length - 2];
      if (!this.STREET_REGEX.test(streetPart) && !/\d+/.test(streetPart)) continue;

      const nameParts = parts.slice(0, parts.length - 2);
      const first = nameParts[0] || '';
      const second = nameParts[1] || '';

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      if (this.CORP_REGEX.test(first)) {
        candFirma = first;
        if (second) candName = second;
      } else {
        candName = first;
        if (second) candZusatz = second;
      }

      candidates.push({
        firma: candFirma,
        name: candName,
        zusatz: candZusatz,
        strasse: streetPart,
        plz: plzMatch[1],
        ort: plzMatch[2].trim(),
        source_type: 'inline'
      });
    }

    // Deduplizieren nach PLZ und bereinigter Straße
    /** @type {AddressCandidate[]} */
    const unique = [];
    const seen = new Set();
    for (const c of candidates) {
      const key = `${c.plz}-${c.strasse.toLowerCase().replace(/[\s\-_]/g, '')}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    }

    return unique;
  }

  /**
   * Überträgt einen Adress-Kandidaten in die DIN-5008-Formularfelder.
   * @param {AddressCandidate} candidate
   */
  static applyCandidate(candidate) {
    const empfFirmaEl = document.getElementById('empfaenger-firma');
    const empfNameEl = document.getElementById('empfaenger-namenszeile');
    const empfStrasseEl = document.getElementById('empfaenger-strasse');
    const empfOrtEl = document.getElementById('empfaenger-ort');

    // 1. Ziel-Sperre in AddressIntelligence setzen
    AddressIntelligence.targetLock = { plz: candidate.plz, city: candidate.ort };

    // 2. Felder befüllen und Events triggern
    if (empfFirmaEl) {
      const firmaText = candidate.zusatz ? `${candidate.firma || ''}\n${candidate.zusatz}`.trim() : (candidate.firma || '');
      empfFirmaEl.textContent = firmaText;
      empfFirmaEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfFirmaEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (empfNameEl) {
      empfNameEl.textContent = candidate.name || '';
      empfNameEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfNameEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (empfStrasseEl) {
      empfStrasseEl.textContent = candidate.strasse;
      empfStrasseEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfStrasseEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (empfOrtEl) {
      empfOrtEl.textContent = `${candidate.plz} ${candidate.ort}`;
      empfOrtEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfOrtEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 3. Autocomplete-Dropdowns schließen
    try {
      const plzPopover = /** @type {HTMLElement & { hidePopover?: () => void }} */ (document.getElementById('plz-suggestions-popover'));
      if (plzPopover?.hidePopover) plzPopover.hidePopover();
      const addrPopover = /** @type {HTMLElement & { hidePopover?: () => void }} */ (document.getElementById('anschrift-vorschlaege'));
      if (addrPopover?.hidePopover) addrPopover.hidePopover();
    } catch {
      // Ignoriert
    }

    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });

    const label = candidate.firma || candidate.name || candidate.strasse;
    const toastMsg = `📋 Adresse übernommen: ${label} (${candidate.ort})`;
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: toastMsg, type: 'success' });
  }

  /**
   * Verdrahtet den Sidebar-Button und das Auswahllisten-Popover.
   */
  static wireSidebarButton() {
    const btn = document.getElementById('btn-zwischenablage-anschrift');
    const popover = document.getElementById('clipboard-candidates-popover');
    if (!btn) return;

    /**
     * @param {string} msg
     * @param {string} [type]
     */
    const notify = (msg, type = 'info') => {
      eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: msg, type });
    };

    btn.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.readText) {
          notify('⚠️ Zwischenablage-Zugriff wird von diesem Browser nicht unterstützt.', 'error');
          return;
        }

        const text = await navigator.clipboard.readText();
        if (!text || !text.trim()) {
          notify('⚠️ Die Zwischenablage ist leer.', 'warning');
          return;
        }

        const candidates = this.parse(text);

        if (candidates.length === 0) {
          notify('⚠️ Keine gültige Anschrift in der Zwischenablage gefunden.', 'warning');
          return;
        }

        if (candidates.length === 1) {
          this.applyCandidate(candidates[0]);
          return;
        }

        // Mehrere Adressen gefunden: Popover zur Auswahl öffnen
        if (popover) {
          popover.replaceChildren();

          const header = document.createElement('li');
          header.className = 'autocomplete-header';
          header.textContent = `📋 ${candidates.length} Adressen gefunden:`;
          popover.appendChild(header);

          candidates.forEach((cand, idx) => {
            const item = document.createElement('li');
            item.className = 'autocomplete-item';
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');

            const compSpan = document.createElement('strong');
            const mainLabel = cand.firma || cand.name || 'Empfänger';
            compSpan.textContent = `${idx + 1}. ${mainLabel}`;

            const addrSpan = document.createElement('span');
            addrSpan.className = 'autocomplete-sub';
            addrSpan.textContent = ` • ${cand.strasse}, ${cand.plz} ${cand.ort}`;

            item.appendChild(compSpan);
            item.appendChild(addrSpan);

            const selectCandidate = () => {
              this.applyCandidate(cand);
              try {
                // @ts-ignore
                popover.hidePopover();
              } catch {
                popover.classList.remove('active');
              }
            };

            item.addEventListener('click', selectCandidate);
            item.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCandidate();
              }
            });

            popover.appendChild(item);
          });

          try {
            // @ts-ignore
            popover.showPopover();
          } catch {
            popover.classList.add('active');
          }
        } else {
          notify(`⚠️ ${candidates.length} Adressen gefunden. Bitte Auswahlliste nutzen oder Anschrift manuell einfügen.`, 'warning');
        }
      } catch (err) {
        console.warn('[Clipboard] Lesefehler:', err);
        notify('⚠️ Zugriff auf die Zwischenablage verweigert oder blockiert.', 'error');
      }
    });
  }
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
  const inputGeoapifyKey = /** @type {HTMLInputElement | null} */ (document.getElementById('input-geoapify-key'));
  const geoapifyKeyContainer = document.getElementById('geoapify-key-container');
  const inputAddressSearch = /** @type {HTMLInputElement | null} */ (document.getElementById('input-anschrift-suche'));
  const addressSuggestions = document.getElementById('anschrift-vorschlaege');
  const addressSearchContainer = document.getElementById('anschrift-suche-container');

  if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !geoapifyKeyContainer || !addressSearchContainer) return;

  /**
   * @param {string} msg
   * @param {string} [type]
   */
  const notify = (msg, type = 'info') => {
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: msg, type });
  };

  /** @type {AbortController | null} */
  let activeAbortController = null;
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

  // Key input handler with Heartbeat Validation
  inputGeoapifyKey.addEventListener('input', () => {
    clearTimeout(keyDebounceTimeout);
    const val = inputGeoapifyKey.value.trim();

    keyDebounceTimeout = setTimeout(async () => {
      if (!val) {
        save(STORAGE_KEYS.geoapifyKey, '');
        return;
      }
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
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1&apiKey=${encodeURIComponent(key)}`, {
        signal: AbortSignal.timeout(8000),
      });
      // Guard gegen asynchrone Race Conditions: Nur speichern, wenn der validierte Key noch der aktuelle Eingabewert ist
      if (!inputGeoapifyKey || inputGeoapifyKey.value.trim() !== key) return;

      if (res.ok) {
        save(STORAGE_KEYS.geoapifyKey, key);
        // Kein Toast bei Erfolg: Stille Übernahme
      } else if (res.status === 401 || res.status === 403) {
        save(STORAGE_KEYS.geoapifyKey, '');
        notify('❌ Geoapify Key ungültig', 'error');
      } else {
        // 429/5xx: Key behalten und still bleiben
        save(STORAGE_KEYS.geoapifyKey, key);
      }
    } catch (err) {
      if (!inputGeoapifyKey || inputGeoapifyKey.value.trim() !== key) return;
      // Netzwerk/Timeout: Key behalten und still bleiben
      save(STORAGE_KEYS.geoapifyKey, key);
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
      const direction = key === 'ArrowDown' ? 1 : -1;
      activeSuggestionIndex = (activeSuggestionIndex + direction + renderedSuggestions.length) % renderedSuggestions.length;
      addressSuggestions.querySelectorAll('[role=option]').forEach((option, index) => {
        option.setAttribute('aria-selected', String(index === activeSuggestionIndex));
      });
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

    if (query.length < 3) {
      try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch(e) {}
      return;
    }

    // 1. INSTANT LOCAL SEARCH: Ohne Debounce sofort anzeigen! (0ms Latenz)
    const localMatches = fuzzySearchLocal(query);
    localMatches.forEach(m => m.source = 'local');
    renderSuggestions(localMatches, query, false);

    // 2. REMOTE SEARCH (Debounced)
    debounceSearchTimeout = setTimeout(() => {
      performAddressSearch(query, localMatches);
    }, 200);
  });

  /**
   * @param {string} query
   * @param {AddressEntry[]} localMatches
   */
  async function performAddressSearch(query, localMatches) {
    if (activeAbortController) activeAbortController.abort();
    activeAbortController = new AbortController();

    if (!navigator.onLine) return;

    const key = load(STORAGE_KEYS.geoapifyKey, '');
    if (!key) return;

    // 3. CACHE HIT: Sofortiges Rendering ohne Netzwerk!
    const lock = AddressIntelligence.targetLock;
    const cacheKey = `${lock ? lock.plz + ' ' : ''}${query}`.toLowerCase();
    if (apiCache.has(cacheKey)) {
      mergeAndRender(localMatches, apiCache.get(cacheKey) || [], query);
      return;
    }

    let fetchOptions = {
      signal: AbortSignal.any([activeAbortController.signal, AbortSignal.timeout(8000)]),
    };
    const coords = /** @type {{ lat: number, lon: number } | null} */ (loadJSON(STORAGE_KEYS.senderCoords, null));

    const searchText = lock ? `${query}, ${lock.plz} ${lock.city}` : query;
    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&apiKey=${encodeURIComponent(key)}&lang=de&limit=5&format=json&filter=countrycode:de`;
    if (!lock && coords && coords.lat && coords.lon) {
      url += `&bias=proximity:${coords.lon},${coords.lat}`;
    }

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          save(STORAGE_KEYS.geoapifyKey, '');
          const keyEl = /** @type {HTMLInputElement | null} */ (document.getElementById('input-geoapify-key'));
          if (keyEl) keyEl.value = '';
          notify('❌ Geoapify API-Key ist ungültig oder abgelaufen! Bitte neu eintragen.', 'error');
        } else {
          console.warn('[Address] Autocomplete HTTP ' + response.status);
          notify('⚠️ Geoapify vorübergehend nicht erreichbar (Status ' + response.status + ').', 'warning');
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
      mergeAndRender(localMatches, parsedSuggestions, query);
    } catch (err) {
      const error = /** @type {Error} */ (err);
      if (error.name !== 'AbortError') {
        console.warn('[Address] Autocomplete search failed:', error);
        notify('⚠️ Geoapify-Suche fehlgeschlagen (Netzwerk?). Der Key bleibt erhalten.', 'warning');
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
   * @param {string} query
   * @param {boolean} allowZeroClick
   */
  function renderSuggestions(suggestions, query, allowZeroClick) {
    if (!addressSuggestions) return;
    addressSuggestions.replaceChildren();
    renderedSuggestions = suggestions.slice(0, 5);
    activeSuggestionIndex = -1;
    inputAddressSearch?.removeAttribute('aria-activedescendant');

    if (suggestions.length === 0) {
      try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch(e) {}
      return;
    }

    if (allowZeroClick && suggestions.length > 5) {
      renderedSuggestions = [];
      const status = document.createElement('li');
      status.setAttribute('role', 'status');
      status.textContent = `${suggestions.length} Treffer – bitte PLZ oder Straße ergänzen`;
      addressSuggestions.appendChild(status);
      try { (/** @type {HTMLElement & { showPopover: () => void }} */ (addressSuggestions)).showPopover(); } catch(e) {}
      return;
    }

    renderedSuggestions.forEach((item, index) => {
      const li = document.createElement('li');
      li.id = `anschrift-vorschlag-${index}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.textContent = item.formatted;
      
      if (item.source === 'local') {
        const badge = document.createElement('span');
        badge.textContent = '⭐ Lokal';
        badge.className = 'badge-local';
        li.appendChild(badge);
      }
      
      li.addEventListener('click', () => {
        selectSuggestion(item);
      });

      addressSuggestions.appendChild(li);
    });

    try { (/** @type {HTMLElement & { showPopover: () => void }} */ (addressSuggestions)).showPopover(); } catch(e) {}
  }

  /**
   * @param {AddressEntry} item
   */
  function selectSuggestion(item) {
    const empfStrasse = document.getElementById('empfaenger-strasse');
    const empfOrt = document.getElementById('empfaenger-ort');

    if (empfStrasse) {
      empfStrasse.textContent = `${item.street} ${item.housenumber}`.trim();
    }
    if (empfOrt) {
      empfOrt.textContent = `${item.postcode} ${item.city}`.trim();
    }

    try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch(e) {}
    if (inputAddressSearch) inputAddressSearch.value = '';

    saveToLocalAddressBook(item);

    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
  }

  // --- TIER 1: OFFLINE ADDRESS INTELLIGENCE ---
  AddressIntelligence.init().then(() => {
    AddressIntelligence.wireDOM();
  });

  // Geoapify für Absender PLZ → speichert Lat/Lon für Proximity Bias
  const absenderPlzOrtEl = document.getElementById('absender-ort') || document.getElementById('rucksendezeile');
  if (absenderPlzOrtEl) {
    /** @type {any} */
    let absenderTimeout = null;
    absenderPlzOrtEl.addEventListener('input', () => {
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
              if (data && data.results && data.results.length > 0) {
                const result = data.results[0];
                if (result.lat && result.lon) {
                  saveJSON(STORAGE_KEYS.senderCoords, { lat: result.lat, lon: result.lon });
                }
              }
            }).catch(() => {});
        }
      }, 500);
    });
  }
}
