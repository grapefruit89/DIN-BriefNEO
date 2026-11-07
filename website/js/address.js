// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]
// @adr [[ADR-JS]]
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @guide [[geoapify-autocomplete]]
// @guide [[din-5008-css-architektur]]

/**
 * @file address.js — Konsolidierter Adress-, PLZ- und Geocoding-Cluster für DIN-BriefNEO.
 * Bündelt:
 *  1. Native Gzip-Decompression (DecompressionStream API) & zustandslose Domain-Funktionen.
 *  2. AddressIntelligence & initSenderSync: Offline PLZ- und Großempfänger-Engine.
 *  3. ClipboardAddressParser: Anschrift-Parser aus Zwischenablage mit Popover-Vorschau.
 *  4. initAddressServices: Optionaler Geoapify-Service mit Cache, Listbox-Popover und lokaler Historie.
 */

import { Constants, Events, eventBus } from './core.js';
import { setCaretToEnd } from './document.js';
import { load, loadJSON, STORAGE_KEYS, save, saveJSON } from './persistence.js';

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
function bindListSelection(popoverEl, items, select) {
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

/* =========================================================================================
 * 1. NATIVE GZIP DECOMPRESSION (DecompressionStream API)
 * ========================================================================================= */

/**
 * Lädt eine gzip-komprimierte JSON-Datei und gibt das geparste Objekt zurück.
 * Liefert `null` statt zu werfen — die Aufrufer degradieren bewusst sanft
 * (leere Indizes statt Absturz).
 * @param {string} path Pfad relativ zum Dokument, z. B. 'data/de_plz_ort.json.gz'
 * @returns {Promise<any|null>}
 */
export async function fetchGzipJson(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const stream = response.body?.pipeThrough(new DecompressionStream('gzip'));
    if (!stream) return null;
    return JSON.parse(await new Response(stream).text());
  } catch (err) {
    console.warn(`[gzip] Laden fehlgeschlagen: ${path}`, err);
    return null;
  }
}

/* =========================================================================================
 * 2. PURE DOMAIN FUNCTIONS (Zustandslose Fachlogik)
 * ========================================================================================= */

/**
 * @typedef {object} GrosskundeEntry
 * @property {string} name
 * @property {string} city
 * @property {string} [typ]
 * @property {string[]} [all_names]
 * @property {boolean} [is_building]
 * @property {string} [notes]
 */

/**
 * @typedef {object} PlzLookupResult
 * @property {string} plz
 * @property {string} city
 * @property {boolean} isGrosskunde
 * @property {GrosskundeEntry | null} grosskunde
 */

/**
 * Validiert und normalisiert eine deutsche Postleitzahl.
 * @param {unknown} input
 * @returns {string | null} 5-stellige PLZ oder null
 */
export function normalizePostcode(input) {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  const str = String(input).trim();
  return /^\d{5}$/.test(str) ? str : null;
}

/**
 * Löst eine 5-stellige PLZ gegen die In-Memory-Maps auf.
 * @param {string} plz
 * @param {Map<string, string>} plzToCityMap
 * @param {Map<string, GrosskundeEntry> | null} [grosskundenMap]
 * @returns {PlzLookupResult | null}
 */
export function resolvePostcode(plz, plzToCityMap, grosskundenMap = null) {
  const normPlz = normalizePostcode(plz);
  if (!normPlz) return null;

  const grosskunde = grosskundenMap?.get(normPlz) || null;
  const city = plzToCityMap.get(normPlz) || grosskunde?.city || null;
  if (!city) return null;

  return {
    plz: normPlz,
    city,
    isGrosskunde: !!grosskunde,
    grosskunde
  };
}

/**
 * Löst einen Ortsnamen gegen die In-Memory-Maps auf (exakte Treffer zuerst, danach Präfix).
 * @param {string} query
 * @param {Map<string, string[]>} cityToPlzMap
 * @param {Map<string, string>} plzToCityMap
 * @param {number} [limit=10]
 * @param {Map<string, string> | null} [districtsMap]
 * @param {Map<string, GrosskundeEntry> | null} [grosskundenMap]
 * @returns {{ plz: string, city: string, district?: string }[]}
 */
export function resolveCity(query, cityToPlzMap, plzToCityMap, limit = 10, districtsMap = null, grosskundenMap = null) {
  const q = String(query || '').toLowerCase().trim();
  if (q.length < 2) return [];

  /** @type {{ plz: string, city: string, district?: string }[]} */
  const results = [];

  /**
   * @param {string} plz
   * @returns {string}
   */
  const attachDistrict = (plz) => {
    if (districtsMap?.has(plz)) return districtsMap.get(plz) || '';
    if (grosskundenMap?.has(plz)) return 'Großempfänger';
    return '';
  };

  // 1. Exakte Treffer zuerst
  const exactPlzs = cityToPlzMap.get(q);
  if (exactPlzs) {
    const canonicalCity = plzToCityMap.get(exactPlzs[0]) || query;
    for (const plz of exactPlzs) {
      results.push({ plz, city: canonicalCity, district: attachDistrict(plz) });
      if (results.length >= limit) return results;
    }
  }

  // 2. Präfix-Treffer
  for (const [normCity, plzs] of cityToPlzMap.entries()) {
    if (normCity !== q && normCity.startsWith(q)) {
      const canonicalCity = plzToCityMap.get(plzs[0]) || normCity;
      for (const plz of plzs) {
        results.push({ plz, city: canonicalCity, district: attachDistrict(plz) });
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

/**
 * Filtert PLZs nach einem 2- bis 5-stelligen Ziffern-Präfix.
 * @param {string} prefix
 * @param {Map<string, string>} plzToCityMap
 * @param {number} [limit=10]
 * @param {Map<string, string> | null} [districtsMap]
 * @param {Map<string, GrosskundeEntry> | null} [grosskundenMap]
 * @returns {{ plz: string, city: string, district?: string }[]}
 */
export function filterPostcodePrefix(prefix, plzToCityMap, limit = 10, districtsMap = null, grosskundenMap = null) {
  const p = String(prefix || '').trim();
  if (p.length < 2 || p.length > 5 || !/^\d+$/.test(p)) return [];

  /**
   * @param {string} plz
   * @returns {string}
   */
  const attachDistrict = (plz) => {
    if (districtsMap?.has(plz)) return districtsMap.get(plz) || '';
    if (grosskundenMap?.has(plz)) return 'Großempfänger';
    return '';
  };

  /** @type {{ plz: string, city: string, district?: string }[]} */
  const matches = [];
  for (const [plz, city] of plzToCityMap.entries()) {
    if (plz.startsWith(p)) {
      matches.push({ plz, city, district: attachDistrict(plz) });
      if (matches.length >= limit) break;
    }
  }
  return matches;
}

/**
 * Erkennt den semantischen Eingabetyp eines Textes im Empfänger-Ort-Feld.
 * @param {string} rawText
 * @returns {{ type: 'plz_exact' | 'plz_prefix' | 'city_name' | 'unknown', value: string }}
 */
export function detectPlzInputPattern(rawText) {
  const text = String(rawText || '').trim();
  const exactMatch = text.match(/^(\d{5})$/);
  if (exactMatch) {
    return { type: 'plz_exact', value: exactMatch[1] };
  }
  const prefixMatch = text.match(/^(\d{2,4})$/);
  if (prefixMatch) {
    return { type: 'plz_prefix', value: prefixMatch[1] };
  }
  if (text.length >= 2 && !/^\d/.test(text)) {
    return { type: 'city_name', value: text };
  }
  return { type: 'unknown', value: text };
}

/* =========================================================================================
 * 3. ADDRESS INTELLIGENCE & SENDER SYNC
 * ========================================================================================= */

/**
 * Normalisiert Text für fehlertolerante Suche (lowercase, Umlaute).
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');
}

/**
 * Erzeugt den 3-stelligen Präfix-Index für PLZs (Case A).
 * @param {Map<string, string>} plzToCityMap
 * @returns {Map<string, Set<string>>}
 */
export function buildPrefixIndex(plzToCityMap) {
  /** @type {Map<string, Set<string>>} */
  const prefixIndex = new Map();
  for (const [plz, city] of plzToCityMap.entries()) {
    if (plz.length >= 3) {
      const p3 = plz.slice(0, 3);
      let s = prefixIndex.get(p3);
      if (!s) {
        s = new Set();
        prefixIndex.set(p3, s);
      }
      s.add(city);
    }
  }
  return prefixIndex;
}

/**
 * Erzeugt den Ort-Index (Stadtname -> Liste von PLZs) (Case B).
 * @param {Map<string, string>} plzToCityMap
 * @returns {Map<string, string[]>}
 */
export function buildOrtIndex(plzToCityMap) {
  /** @type {Map<string, string[]>} */
  const ortIndex = new Map();
  for (const [plz, city] of plzToCityMap.entries()) {
    const canonical = city.trim();
    let list = ortIndex.get(canonical);
    if (!list) {
      list = [];
      ortIndex.set(canonical, list);
    }
    list.push(plz);

    const lower = canonical.toLowerCase();
    if (lower !== canonical) {
      let lList = ortIndex.get(lower);
      if (!lList) {
        lList = [];
        ortIndex.set(lower, lList);
      }
      lList.push(plz);
    }
  }
  return ortIndex;
}

/**
 * Erzeugt den durchsuchbaren Firmen- & Großkunden-Index aus grosskunden.json.gz (Case C).
 * Indexiert auch all_names (Behörden-Mehrfachbelegungen).
 * @param {Map<string, GrosskundeEntry>} grosskundenMap
 */
export function buildFirmenIndex(grosskundenMap) {
  /** @type {Array<{ plz: string, name: string, city: string, typ: string, normName: string }>} */
  const entries = [];
  /** @type {Map<string, Array<{ plz: string, name: string, city: string, typ: string }>>} */
  const mapByName = new Map();

  for (const [plz, info] of grosskundenMap.entries()) {
    if (!info) continue;
    const name = info.name || '';
    const city = info.city || '';
    const typ = info.typ || 'Firma';

    const item = { plz, name, city, typ, normName: normalizeText(name) };
    entries.push(item);

    const normKey = normalizeText(name);
    let list = mapByName.get(normKey);
    if (!list) {
      list = [];
      mapByName.set(normKey, list);
    }
    list.push(item);

    if (Array.isArray(info.all_names)) {
      for (const alt of info.all_names) {
        if (alt && alt !== name) {
          const altItem = { plz, name: alt, city, typ, normName: normalizeText(alt) };
          entries.push(altItem);
          const altNormKey = normalizeText(alt);
          let aList = mapByName.get(altNormKey);
          if (!aList) {
            aList = [];
            mapByName.set(altNormKey, aList);
          }
          aList.push(altItem);
        }
      }
    }
  }

  return {
    entries,
    /**
     * @param {string} name
     */
    get(name) {
      const q = normalizeText(name);
      return mapByName.get(q) || entries.filter(e => e.normName.startsWith(q));
    },
    /**
     * @param {string} query
     * @param {number} [limit=12]
     */
    search(query, limit = 12) {
      const nq = normalizeText(query);
      if (nq.length < 3) return [];
      const prefixMatches = entries.filter(e => e.normName.startsWith(nq));
      if (prefixMatches.length >= limit) return prefixMatches.slice(0, limit);
      if (nq.length >= 5) {
        const containsMatches = entries.filter(e => !e.normName.startsWith(nq) && e.normName.includes(nq));
        return [...prefixMatches, ...containsMatches].slice(0, limit);
      }
      return prefixMatches;
    }
  };
}

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

  /** @type {Map<string, string>} */
  static districts = new Map();

  /** @type {Map<string, Set<string>>} */
  static prefixIndex = new Map();

  /** @type {Map<string, string[]>} */
  static ortIndex = new Map();

  /** @type {string[]} */
  static ortList = [];

  /** @type {any} */
  static firmenIndex = null;

  /** @type {{ plz?: string, city: string } | null} */
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
    if (AddressIntelligence.isReady) return true;
    if (AddressIntelligence.#initPromise) return AddressIntelligence.#initPromise;

    AddressIntelligence.#initPromise = (async () => {
      try {
        /** @param {string} relPath */
        const loadDataset = (relPath) => {
          return fetchGzipJson(relPath)
            .then(d => d || fetchGzipJson(`../website/${relPath}`))
            .then(d => d || fetchGzipJson(`website/${relPath}`));
        };

        const [plzData, grossData, distData] = await Promise.all([
          loadDataset('data/orte.json.gz').then(d => d || loadDataset('data/de_plz_ort.json.gz')),
          loadDataset('data/grosskunden.json.gz').then(d => d || loadDataset('data/de_grosskunden_plz.json.gz')),
          loadDataset('data/de_districts.json.gz')
        ]);
        if (!plzData) {
          console.warn('[AddressIntelligence] Datensatz de_plz_ort nicht ladbar — PLZ-Automatik inaktiv.');
          return false;
        }

        // Build PLZ -> City index
        for (const [plz, city] of Object.entries(plzData)) {
          AddressIntelligence.plzToCity.set(plz, city);

          // Build reverse City -> PLZ index
          const normCity = city.toLowerCase().trim();
          let list = AddressIntelligence.cityToPlz.get(normCity);
          if (!list) {
            list = [];
            AddressIntelligence.cityToPlz.set(normCity, list);
          }
          list.push(plz);
        }

        // Build Großempfänger index (optional)
        const gross = grossData || {};
        for (const [plz, info] of Object.entries(gross)) {
          AddressIntelligence.grosskunden.set(plz, /** @type {GrosskundeEntry} */ (info));
        }

        // Build Districts index (optional)
        const districts = distData || {};
        for (const [plz, name] of Object.entries(districts)) {
          AddressIntelligence.districts.set(plz, String(name));
        }

        // Indizes für Case A, B, C aufbauen (< 15 ms)
        AddressIntelligence.prefixIndex = buildPrefixIndex(AddressIntelligence.plzToCity);
        AddressIntelligence.ortIndex = buildOrtIndex(AddressIntelligence.plzToCity);
        AddressIntelligence.ortList = Array.from(new Set(AddressIntelligence.plzToCity.values())).toSorted((a, b) => a.localeCompare(b, 'de'));
        AddressIntelligence.firmenIndex = buildFirmenIndex(AddressIntelligence.grosskunden);

        AddressIntelligence.isReady = true;
        return true;
      } catch (err) {
        console.warn('[AddressIntelligence] Initialization error:', err);
        return false;
      }
    })();

    return AddressIntelligence.#initPromise;
  }

  /**
   * Instant PLZ lookup (0.001 ms).
   * @param {string} plz 5-digit postal code
   * @returns {PlzLookupResult | null}
   */
  static lookupPlz(plz) {
    return resolvePostcode(plz, AddressIntelligence.plzToCity, AddressIntelligence.grosskunden);
  }

  /**
   * Reverse City lookup (City name -> list of postal codes).
   * @param {string} query
   * @param {number} [limit=30]
   * @returns {{ plz: string, city: string, district?: string }[]}
   */
  static lookupCity(query, limit = 30) {
    return resolveCity(query, AddressIntelligence.cityToPlz, AddressIntelligence.plzToCity, limit, AddressIntelligence.districts, AddressIntelligence.grosskunden);
  }

  /**
   * Progressive prefix filter (e.g. "53" -> all Bonn / Rhein-Sieg PLZs).
   * @param {string} prefix 2-5 digits
   * @param {number} [limit=30]
   * @returns {{ plz: string, city: string, district?: string }[]}
   */
  static filterPrefix(prefix, limit = 30) {
    return filterPostcodePrefix(prefix, AddressIntelligence.plzToCity, limit, AddressIntelligence.districts, AddressIntelligence.grosskunden);
  }

  /**
   * Case A: PLZ-Präfix-Suche (3–4 Ziffern).
   * Regel:
   * - Bei <= 15 Treffern: ALLE passenden PLZs direkt anzeigen (keine Zusammenfassung).
   * - Bei > 15 Treffern: Stadt-Zusammenfassung mit Anzahl ("Stadt (N PLZs)") nach Häufigkeit.
   * @param {string} prefix 3-4 digits
   * @param {number} [limit=15]
   * @returns {Array<{ plz?: string, name: string, city: string, typ: string, district?: string, plzCount: number, isSinglePlz: boolean }>}
   */
  static lookupPrefix(prefix, limit = 15) {
    const p = String(prefix || '').trim();
    if (p.length < 3 || p.length > 4 || !/^\d+$/.test(p)) return [];

    /** @type {Array<{ plz: string, city: string }>} */
    const matches = [];
    /** @type {Map<string, string[]>} */
    const cityMap = new Map();

    for (const [plz, city] of AddressIntelligence.plzToCity.entries()) {
      if (plz.startsWith(p)) {
        matches.push({ plz, city });
        let list = cityMap.get(city);
        if (!list) {
          list = [];
          cityMap.set(city, list);
        }
        list.push(plz);
      }
    }

    // REGEL 1: Wenn <= 15 Treffer -> alle PLZs direkt anzeigen
    if (matches.length <= 15) {
      const sortedMatches = matches.toSorted((a, b) => a.plz.localeCompare(b.plz, 'de'));
      return sortedMatches.map(m => ({
        plz: m.plz,
        name: m.city,
        city: m.city,
        typ: 'Stadt',
        district: AddressIntelligence.districts.get(m.plz) || '',
        plzCount: 1,
        isSinglePlz: true
      }));
    }

    // REGEL 2: Wenn > 15 Treffer -> Stadt-Zusammenfassung nach Häufigkeit
    const sorted = Array.from(cityMap.entries()).toSorted((a, b) => {
      const diff = b[1].length - a[1].length;
      if (diff !== 0) return diff;
      return a[0].localeCompare(b[0], 'de');
    });

    return sorted.slice(0, limit).map(([city, plzs]) => ({
      plz: plzs.length === 1 ? plzs[0] : undefined,
      name: city,
      city: city,
      typ: 'Stadt',
      district: plzs.length === 1 ? (AddressIntelligence.districts.get(plzs[0]) || '') : '',
      plzCount: plzs.length,
      isSinglePlz: plzs.length === 1
    }));
  }

  /**
   * Universelle Suche (Städte + Firmen/Behörden/Gerichte/Institutionen).
   * Regel: Städte immer zuerst, Firmen danach.
   * @param {string} query
   * @param {number} [limit=12]
   * @returns {{ totalCount: number, items: Array<{ plz?: string, name: string, city: string, typ: string, district?: string, isSinglePlz?: boolean, plzCount?: number }> }}
   */
  static lookupUniversal(query, limit = 12) {
    const rawQ = String(query || '').trim();
    const nq = normalizeText(rawQ);
    if (nq.length < 3) return { totalCount: 0, items: [] };

    // Exakter Prefix-Match auf den tatsächlich eingegebenen String
    const searchPrefix = nq;

    /** @type {Array<{ plz?: string, name: string, city: string, typ: string, district?: string, isSinglePlz?: boolean, plzCount?: number }>} */
    const cityItems = [];

    // 1. Städte-Suche
    for (const city of AddressIntelligence.ortList) {
      const normCity = normalizeText(city);
      if (normCity.startsWith(searchPrefix)) {
        const plzs = AddressIntelligence.ortIndex.get(city) || [];
        if (plzs.length === 1) {
          const singlePlz = plzs[0];
          cityItems.push({
            plz: singlePlz,
            name: city,
            city: city,
            typ: 'Stadt',
            district: AddressIntelligence.districts.get(singlePlz) || '',
            isSinglePlz: true,
            plzCount: 1
          });
        } else {
          cityItems.push({
            name: city,
            city: city,
            typ: 'Stadt',
            district: '',
            isSinglePlz: false,
            plzCount: plzs.length
          });
        }
      }
    }

    // Sortierung Städte:
    // 1. Exakter Stadt-Treffer zuerst
    // 2. Städte mit mehreren PLZs (Großstädte/Zentren) vor 1-PLZ-Orten
    // 3. Alphabetisch
    const sortedCityItems = cityItems.toSorted((a, b) => {
      const aNorm = normalizeText(a.name);
      const bNorm = normalizeText(b.name);
      const aIsExact = aNorm === nq || a.name.toLowerCase() === rawQ.toLowerCase();
      const bIsExact = bNorm === nq || b.name.toLowerCase() === rawQ.toLowerCase();
      if (aIsExact && !bIsExact) return -1;
      if (!aIsExact && bIsExact) return 1;

      const aCount = a.plzCount || 1;
      const bCount = b.plzCount || 1;
      if (aCount !== bCount && (aCount > 1 || bCount > 1)) {
        return bCount - aCount;
      }

      return a.name.localeCompare(b.name, 'de');
    });

    // 2. Firmen/Behörden-Suche (3. Firmen/Behörden alphabetisch)
    /** @type {Array<any>} */
    const firmenMatches = AddressIntelligence.firmenIndex ? AddressIntelligence.firmenIndex.search(searchPrefix, limit * 2) : [];
    const firmenItems = firmenMatches.map((/** @type {any} */ f) => ({
      plz: f.plz,
      name: f.name,
      city: f.city,
      typ: f.typ,
      district: AddressIntelligence.districts.get(f.plz) || '',
      isSinglePlz: true
    }));
    const sortedFirmenItems = firmenItems.toSorted((a, b) => a.name.localeCompare(b.name, 'de'));

    const totalCount = sortedCityItems.length + sortedFirmenItems.length;
    // Städte immer zuerst, danach Firmen/Behörden
    const items = [...sortedCityItems, ...sortedFirmenItems].slice(0, limit);

    return { totalCount, items };
  }

  /**
   * Liefert alle PLZs einer bestimmten Stadt (sortiert aufsteigend), optional gefiltert nach PLZ-Präfix.
   * Führt einen Plausibilitäts-Check durch und schließt fremde Leitregionen/Postfach-Anomalien aus.
   * @param {string} cityName
   * @param {string} [plzPrefix='']
   * @returns {Array<{ plz: string, name: string, city: string, typ: string, district: string, isSinglePlz: boolean }>}
   */
  static lookupCityPlzs(cityName, plzPrefix = '') {
    const normTarget = normalizeText(cityName);
    const canonicalCity = AddressIntelligence.ortList.find(c => normalizeText(c) === normTarget) || cityName;
    const allPlzs = AddressIntelligence.ortIndex.get(canonicalCity) || [];
    const prefix = String(plzPrefix || '').trim();

    // Plausibilitäts-Check: Ermittle dominante Leitbereich-Ziffer der Stadt
    const digitCounts = new Map();
    for (const p of allPlzs) {
      const d = p[0];
      digitCounts.set(d, (digitCounts.get(d) || 0) + 1);
    }
    let dominantD = '';
    let maxCount = 0;
    for (const [d, count] of digitCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantD = d;
      }
    }

    const plausibel = allPlzs.filter(p => {
      // Wenn eine Stadt mehrere PLZs hat, muss die 1. Ziffer zur dominanten Leitregion passen
      if (allPlzs.length >= 5 && dominantD && p[0] !== dominantD) {
        return false;
      }
      // Wenn in Grosskunden vorhanden und dort andere Stadt hinterlegt ist: ausschließen
      const gk = AddressIntelligence.grosskunden.get(p);
      if (gk?.city && normalizeText(gk.city) !== normTarget) {
        return false;
      }
      return true;
    });

    const filtered = prefix ? plausibel.filter(p => p.startsWith(prefix)) : plausibel;
    const sorted = filtered.toSorted((a, b) => {
      // Zustell-PLZ (mit Stadtteil oder nicht in grosskunden) vor reinen Grosskunden/Postfach; jeweils numerisch
      const isSonderA = !AddressIntelligence.districts.has(a) && AddressIntelligence.grosskunden.has(a) ? 1 : 0;
      const isSonderB = !AddressIntelligence.districts.has(b) && AddressIntelligence.grosskunden.has(b) ? 1 : 0;
      if (isSonderA !== isSonderB) return isSonderA - isSonderB;
      return a.localeCompare(b, 'de');
    });

    return sorted.map(plz => ({
      plz,
      name: canonicalCity,
      city: canonicalCity,
      typ: 'Stadt',
      district: AddressIntelligence.districts.get(plz) || '',
      isSinglePlz: true
    }));
  }

  /**
   * Löst Texteingaben im Ort-Feld auf:
   * - Exakter Stadtmatch oder 1 einzelner Präfixmatch -> direkt PLZs oder Sofort-Fill
   * - Stadt + PLZ-Filter (z. B. "bonn 53") -> gefilterte PLZs
   * - Mehrere Städte -> universelle Stadtauswahl
   * @param {string} rawText
   * @param {number} [limit=12]
   * @returns {{ mode: 'single_fill' | 'city_plzs' | 'city_list', city?: string, plz?: string, items: Array<any>, totalCount: number }}
   */
  static resolveCityInput(rawText, limit = 12) {
    const text = String(rawText || '').trim();
    if (text.length < 3) return { mode: 'city_list', items: [], totalCount: 0 };

    // 1. Fall: Stadt + PLZ-Filter (z. B. "bonn 53", "st. augustin 53" oder "münchen 80" via /v flag)
    const cityPlzMatch = text.match(/^([\p{L}\s\-\/.]+?)\s+(\d{1,5})$/v);
    if (cityPlzMatch) {
      const cityPart = cityPlzMatch[1].trim();
      const plzPrefix = cityPlzMatch[2].trim();
      const normPart = normalizeText(cityPart);

      const exactCity = AddressIntelligence.ortList.find(c => normalizeText(c) === normPart);
      const prefixCities = !exactCity ? AddressIntelligence.ortList.filter(c => normalizeText(c).startsWith(normPart)) : [];
      const targetCity = exactCity || (prefixCities.length === 1 ? prefixCities[0] : null);

      if (targetCity) {
        const plzs = AddressIntelligence.lookupCityPlzs(targetCity, plzPrefix);
        return {
          mode: 'city_plzs',
          city: targetCity,
          items: plzs,
          totalCount: plzs.length
        };
      }
    }

    // 2. Fall: Reiner Text (z. B. "bonn", "bonnd", "bon")
    const nq = normalizeText(text);
    const exactCity = AddressIntelligence.ortList.find(c => normalizeText(c) === nq);
    const matchingCities = AddressIntelligence.ortList.filter(c => normalizeText(c).startsWith(nq));

    // Regel 1: Exakter Match auf Stadtname
    if (exactCity) {
      const plzs = AddressIntelligence.ortIndex.get(exactCity) || [];
      if (plzs.length === 1) {
        return {
          mode: 'single_fill',
          city: exactCity,
          plz: plzs[0],
          items: [],
          totalCount: 1
        };
      }
      const items = AddressIntelligence.lookupCityPlzs(exactCity);
      return {
        mode: 'city_plzs',
        city: exactCity,
        items,
        totalCount: items.length
      };
    }

    // Regel 2: Präfix mit genau 1 Stadt-Match und 1 PLZ -> sofort füllen
    if (matchingCities.length === 1) {
      const targetCity = matchingCities[0];
      const plzs = AddressIntelligence.ortIndex.get(targetCity) || [];
      if (plzs.length === 1) {
        return {
          mode: 'single_fill',
          city: targetCity,
          plz: plzs[0],
          items: [],
          totalCount: 1
        };
      }
    }

    // Regel 3: Reiner Text liefert die Stadt-Auswahlliste
    const univ = AddressIntelligence.lookupUniversal(text, limit);
    // Wenn Städte matchen: reine Stadtliste anzeigen (Firmen nur wenn keine Städte matchen)
    const hasCities = univ.items.some(i => i.typ === 'Stadt');
    const items = hasCities ? univ.items.filter(i => i.typ === 'Stadt') : univ.items;

    return {
      mode: 'city_list',
      items,
      totalCount: items.length
    };
  }

  /**
   * Wendet die Auswahl eines Eintrags aus dem Autocomplete auf die DOM-Elemente an.
   * Erzwingt strikte Trennung:
   * - Stadt: füllt NUR das Ort-Feld, Firma-Feld bleibt unberührt!
   * - Firma/Behörde: Doppel-Fill (Ort-Feld = "PLZ City", Firma-Feld = Name).
   * @param {any} item
   * @param {{ textContent: string | null, setAttribute?: (k: string, v: string) => void }} ortEl
   * @param {{ textContent: string | null, setAttribute?: (k: string, v: string) => void } | null} [firmaEl]
   * @param {{ textContent: string | null, setAttribute?: (k: string, v: string) => void } | null} [strasseEl]
   * @returns {{ note?: string }}
   */
  static applySelection(item, ortEl, firmaEl = null, strasseEl = null) {
    if (!item) return {};

    if (item.typ === 'Stadt') {
      if (item.plz) {
        ortEl.textContent = `${item.plz} ${item.city}`;
      } else {
        ortEl.textContent = item.city;
      }
      ortEl.setAttribute?.('data-autofilled', 'true');
      // WICHTIG: firmaEl wird bei Stadt NIEMALS befüllt!
      return {};
    }

    // Firma / Behörde / Gericht / Institution -> DOPPEL-FILL
    if (item.plz && item.city) {
      ortEl.textContent = `${item.plz} ${item.city}`;
      ortEl.setAttribute?.('data-autofilled', 'true');
    }
    if (firmaEl) {
      firmaEl.textContent = item.name;
      firmaEl.setAttribute?.('data-autofilled', 'true');
    }
    if (strasseEl && !(strasseEl.textContent || '').trim()) {
      strasseEl.setAttribute?.('data-placeholder', '(Großempfänger – Straße entfällt)');
    }
    return {};
  }

  /**
   * Wires the recipient address block in the DOM for instant offline autocomplete.
   */
  static wireDOM() {
    const empfOrtEl = document.getElementById('empfaenger-ort');
    const empfFirmaEl = document.getElementById('empfaenger-firma');
    const empfStrasseEl = document.getElementById('empfaenger-strasse');

    if (!empfOrtEl) return;
    if (empfOrtEl.dataset.wired === 'true') return;
    empfOrtEl.dataset.wired = 'true';

    // Popover suggestions container
    const suggestionsPopover = document.getElementById('plz-suggestions-popover');
    if (!suggestionsPopover) return;

    /** @type {any} */
    let debounceTimer = null;
    let userEditing = false;

    empfOrtEl.addEventListener('beforeinput', (/** @type {any} */ e) => {
      if (e.inputType?.startsWith('delete')) {
        userEditing = true;
      } else if (e.inputType === 'insertText' && /\d/.test(e.data || '')) {
        userEditing = false;
      }
    });

    empfOrtEl.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        userEditing = true;
      }
    });

    suggestionsPopover.addEventListener('mousedown', () => {
      userEditing = false;
    });

    // Schutz vor Überschreiben: Manuelle Tastatureingaben entfernen data-autofilled
    /** @param {HTMLElement} el */
    const trackManualInput = (el) => {
      el.addEventListener('input', (/** @type {Event} */ e) => {
        if (!/** @type {InputEvent} */ (e).isComposing) {
          el.removeAttribute('data-autofilled');
        }
      });
    };
    trackManualInput(empfOrtEl);
    if (empfFirmaEl) trackManualInput(empfFirmaEl);

    // Eingabe im Ort-Feld (Case A & B & Universelles Suchfeld)
    empfOrtEl.addEventListener('input', (/** @type {any} */ e) => {
      if (e?.inputType?.startsWith('delete')) {
        userEditing = true;
      } else if (e?.inputType === 'insertText' && /\d/.test(e.data || '')) {
        userEditing = false;
      }

      const rawText = (empfOrtEl.textContent || "").trim();

      if (!rawText) {
        userEditing = false;
      }

      if (debounceTimer) clearTimeout(debounceTimer);

      const maxItems = maxSuggestions();

      // 0–2 Zeichen: Nichts anzeigen & Popover leeren
      if (rawText.length < 3) {
        AddressIntelligence.#hidePopover(suggestionsPopover);
        suggestionsPopover.replaceChildren();
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
              eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: warn, type: 'warning' });
            }
          }

          const completed = `${res.plz} ${res.city}`;
          empfOrtEl.textContent = completed;
          empfOrtEl.setAttribute('data-autofilled', 'true');

          AddressIntelligence.targetLock = { plz: res.plz, city: res.city };

          // Großkunde / Behörde Automatik
          if (res.isGrosskunde && res.grosskunde) {
            if (empfFirmaEl && (!(empfFirmaEl.textContent || "").trim() || empfFirmaEl.getAttribute('data-autofilled') === 'true')) {
              empfFirmaEl.textContent = res.grosskunde.name;
              empfFirmaEl.setAttribute('data-autofilled', 'true');
            }
            if (empfStrasseEl && !(empfStrasseEl.textContent || "").trim()) {
              empfStrasseEl.setAttribute('data-placeholder', '(Großempfänger – Straße entfällt)');
            }
            const toastMsg = Constants.TOASTS.ADDRESS.GROSSKUNDE_RECOGNIZED(res.grosskunde.name);
            eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: toastMsg, type: 'info' });
          }

          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
          AddressIntelligence.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
          return;
        } else {
          // Keine PLZ gefunden oder Nutzer editiert/löscht gerade (userEditing === true) -> KEIN Auto-Fill!
          AddressIntelligence.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
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
          AddressIntelligence.#renderUniversalSuggestions(matches, matches.length, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, null, isDirectPlzList);
        } else {
          AddressIntelligence.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
        }
        return;
      }

      // Case 3: Text (>= 3 Zeichen) -> Sofortiger Exakter Match / Präfix / Universell
      if (rawText.length >= 3 && !/^\d/.test(rawText)) {
        const res = AddressIntelligence.resolveCityInput(rawText, maxItems);
        if (res.mode === 'single_fill' && res.plz && res.city && !userEditing) {
          const completed = `${res.plz} ${res.city}`;
          empfOrtEl.textContent = completed;
          empfOrtEl.setAttribute('data-autofilled', 'true');
          AddressIntelligence.targetLock = { plz: res.plz, city: res.city };
          setCaretToEnd(empfOrtEl);
          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
          AddressIntelligence.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
          return;
        }

        if (res.items.length > 0) {
          const isPlzList = res.mode === 'city_plzs';
          AddressIntelligence.#renderUniversalSuggestions(res.items, res.totalCount, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, null, isPlzList);
        } else {
          AddressIntelligence.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
        }
        return;
      }

      AddressIntelligence.#hidePopover(suggestionsPopover);
      suggestionsPopover.replaceChildren();
    });

    // Case C: Eingabe im Firma-Feld (Großkunden & Behörden Direkt-Lookup)
    if (empfFirmaEl) {
      empfFirmaEl.addEventListener('input', () => {
        const rawText = (empfFirmaEl.textContent || "").trim();

        if (debounceTimer) clearTimeout(debounceTimer);

        if (rawText.length < 3) {
          AddressIntelligence.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
          return;
        }

        debounceTimer = setTimeout(() => {
          const maxItems = maxSuggestions();
          /** @type {Array<any>} */
          const matches = AddressIntelligence.firmenIndex ? AddressIntelligence.firmenIndex.search(rawText, maxItems) : [];
          if (matches.length > 0) {
            const formatted = matches.map((/** @type {any} */ m) => ({
              plz: m.plz,
              name: m.name,
              city: m.city,
              typ: m.typ,
              district: AddressIntelligence.districts.get(m.plz) || '',
              isSinglePlz: true
            }));
            AddressIntelligence.#renderUniversalSuggestions(formatted, matches.length, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, empfFirmaEl);
          } else {
            AddressIntelligence.#hidePopover(suggestionsPopover);
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
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        for (const [idx, item] of items.entries()) {
          item.setAttribute('aria-selected', String(idx === nextIndex));
        }
        items[nextIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        for (const [idx, item] of items.entries()) {
          item.setAttribute('aria-selected', String(idx === prevIndex));
        }
        items[prevIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (items.length > 0) {
          e.preventDefault();
          const targetIndex = Math.max(currentIndex, 0);
          items[targetIndex]?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        AddressIntelligence.#hidePopover(suggestionsPopover);
      }
    };

    empfOrtEl.addEventListener('keydown', handleKeyNav);
    if (empfFirmaEl) empfFirmaEl.addEventListener('keydown', handleKeyNav);
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
  static #renderUniversalSuggestions(matches, totalCount, ortEl, firmaEl, strasseEl, popoverEl, anchorEl = null, isPlzList = false) {
    const render = () => {
      popoverEl.replaceChildren();

      /** @param {any} item */
      const selectItem = (item) => {
        // Stadt mit mehreren PLZs: sofort die PLZ-Liste öffnen.
        if (item.typ === 'Stadt' && !item.isSinglePlz) {
          const plzs = AddressIntelligence.lookupCityPlzs(item.city);
          AddressIntelligence.#renderUniversalSuggestions(plzs, plzs.length, ortEl, firmaEl, strasseEl, popoverEl, anchorEl, true);
          return;
        }

        const res = AddressIntelligence.applySelection(item, ortEl, firmaEl, strasseEl);
        AddressIntelligence.targetLock = { city: item.city, plz: item.plz };
        if (res?.note) {
          eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: res.note, type: 'info' });
        }
        setCaretToEnd(anchorEl || ortEl);
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
        AddressIntelligence.#hidePopover(popoverEl);
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
          plzSpan.textContent = item.plz;
          leftWrapper.appendChild(plzSpan);
          leftWrapper.appendChild(document.createTextNode(' '));
        }

        // Name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'city-val';
        nameSpan.textContent = item.name;
        leftWrapper.appendChild(nameSpan);

        // Typ-Badge wenn nicht Stadt
        if (item.typ && item.typ !== 'Stadt') {
          const badge = document.createElement('span');
          badge.className = 'ac-badge';
          badge.textContent = `[${item.typ}]`;
          leftWrapper.appendChild(badge);

          const citySub = document.createElement('span');
          citySub.className = 'city-sub';
          citySub.textContent = item.city;
          leftWrapper.appendChild(citySub);
        } else if (!item.isSinglePlz && (item.plzCount || 0) > 1) {
          const countSub = document.createElement('span');
          countSub.className = 'city-sub';
          countSub.textContent = `(${item.plzCount} PLZs)`;
          leftWrapper.appendChild(countSub);
        }

        li.appendChild(leftWrapper);

        // Stadtteil nur in Klammern anzeigen, wenn in Daten vorhanden
        if (item.district) {
          li.appendChild(document.createTextNode(' '));
          const districtSpan = document.createElement('span');
          districtSpan.className = 'district-val';
          districtSpan.textContent = `(${item.district})`;
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
        hintLi.textContent = `${totalCount} Treffer – tippe weiter`;
        popoverEl.appendChild(hintLi);
      }

      bindListSelection(popoverEl, matches, selectItem);
    };

    render();

    try {
      /** @type {HTMLElement & { showPopover: () => void }} */ (popoverEl).showPopover();
    } catch {}
  }

  /**
   * @param {HTMLElement | null} el
   */
  static #hidePopover(el) {
    if (!el) return;
    try {
      /** @type {HTMLElement & { hidePopover: () => void }} */ (el).hidePopover();
    } catch {}
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
  const prefix = titles.length ? `${titles.join(' ')} ` : '';
  return `${prefix}${firstName.charAt(0).toUpperCase()}. ${rest}`;
}

/**
 * Synchronizes the sender information from the info block to the return address line
 * and the signature name.
 */
export function initSenderSync() {
  const infoName = document.getElementById('absender-name');
  const infoStreet = document.getElementById('absender-strasse');
  const infoCity = document.getElementById('absender-ort');
  const absender = document.getElementById('rucksendeangabe');
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
  /** Typische deutsche Rechtsformen und Organisationen (ES2024 /v flag, case-insensitive) */
  static CORP_REGEX = /(?<!\p{L})(?:gmbh\s*&\s*co\.?\s*kg|kgaa|corp(?:oration)?|inc(?:orporated)?|ltd|limited|llc|plc|gmbh|ag|se|kg|ohg|gbr|universit[äa]t|hochschule|verband|stiftung|beh[öo]rde|finanzamt|amtsgericht|landgericht|institut|verlag|kanzlei|rechtsanw[äa]lte|praxis|apotheke|b[üu]ro|agentur|studio|klinik(?:en|um)?|hotel|restaurant|[\p{L}\-]*bank|sparkasse|verein|e\.\s*v\.|e\.\s*k\.|e\.\s*g\.|haftungsbeschr[äa]nkt)(?!\p{L})/iv;

  /** Unternehmergesellschaft (UG) & Genossenschaft (eG) case-sensitive (ohne /i), um Kollisionen mit Geschossen ("ug", "EG") zu verhindern */
  static CORP_UG_REGEX = /(?<!\p{L})(?:UG|eG)(?!\p{L})/v;

  /**
   * Prüft, ob ein Text eine Firmenbezeichnung oder Rechtsform enthält.
   * @param {string} text
   * @returns {boolean}
   */
  static isCorporate(text) {
    if (!text) return false;
    return ClipboardAddressParser.CORP_REGEX.test(text) || ClipboardAddressParser.CORP_UG_REGEX.test(text);
  }

  /** Anreden und Empfänger-Prefixe (ES2024 /v flag) */
  static PERSON_PREFIX_REGEX = /^(?:herrn?|frau|dr\.?|prof\.?|z\.?\s*hd\.?|zu\s*h[äa]nden)(?!\p{L})/iv;

  /**
   * Straßensuffixe für Komposita (Hauptstraße, Musterweg, Eichenpfad, Schillerplatz, Schlossberg, Campus).
   * Nur nach hinten wortbegrenzt, damit vorangestellte Buchstaben (Haupt-) erlaubt sind.
   */
  static STREET_SUFFIX = /(?:str(?:aße|asse|\.)?|weg|gasse|allee|platz|damm|ring|ufer|zeile|chaussee|pfad|steig|grund|graben|rain|stiege|wall|bruch|promenade|berg|campus)(?!\p{L})/iv;

  /**
   * Eigenständige Straßenwörter (Am Markt, Zum Tor, Im Park, Kirchhof).
   * Beidseitig wortbegrenzt, um Falschtreffer in normalen Wörtern auszuschließen.
   */
  static STREET_WORD = /(?<!\p{L})(?:markt|park|tor|h[öo]fe?|speersort|spitze|bellevue|anger|feld|kamp|garten|berg)(?!\p{L})/iv;

  /** Straßen-Präpositionen (Am, An der, Im, Auf dem, Zum, Zur, etc.) */
  static STREET_PREPOSITION = /^(?:am|an\s+der|an\s+den|im|in\s+der|in\s+den|auf\s+dem|auf\s+der|zum|zur|unter\s+den|hinter\s+dem|bei\s+der|vor\s+dem)\s+/iv;

  /** Echte Hausnummer am Zeilenende (1-3 Ziffern, z. B. " 5", " 12a", " 10-12", " 3 EG", " 5, UG") */
  static HOUSE_NUMBER_END = /(?:^|\s)\d{1,3}\s*[\p{L}]?(?:\s*[\-–\/]\s*\d{1,3}\s*[\p{L}]?)?(?:\s*[,\/]?\s*(?:EG|OG|UG|DG|\d+\.?\s*(?:OG|Stock|Etage|Stockwerk)|HH|VH|WHG|App\.?\s*\d+))?\s*$/iv;

  /**
   * Geschoss- und Gebäudeteil-Zusätze (EG, OG, UG, DG etc.) — verlangt Trennzeichen oder Ziffer davor.
   * Architektonischer Trade-off: Durch das Abtrennen vor isCorporate() wird "Musterstr. 5 UG" nicht als
   * Unternehmergesellschaft fehlklassifiziert. Im Parser ist dies sicher, da isStreetLine() ausschließlich
   * auf Zeilen unmittelbar über dem PLZ-Anker (Zeile i-1 / i-2) angewendet wird.
   */
  static FLOOR_SUFFIX = /(?:[\s,\/]+|(?<=\d))(?:EG|OG|UG|DG|\d+\.?\s*(?:OG|Stock|Etage|Stockwerk)|HH|VH|Seitenflügel|Vorderhaus|Hinterhaus|App\.?\s*\d+|Whg\.?\s*\d+)\s*$/iv;

  /** Zeilen-Marker für nicht-adressrelevante Metadaten (Telefon, Mobil, Web, Bank, Register etc.) */
  static METADATA_LINE_REGEX = /^(?:(?:tel|telefon|mobil|mobilfunk|handy|fon|phone|fax|telefax)(?!\p{L})\s*[:.+\(\d\/]|(?:e-?mail|email)\s*[:.\-@]|www\.|https?:\/\/|(?:amtsgericht|landgericht)\s*[:\s].*\bhr[ab]\b|handelsregister\s*[:\s]|hr[ab]\b\s*[:\s]*\d+|ust-?id(?:nr)?|steuernummer|st\.-?nr|iban\s*:?\s*[a-z]{2}\d{2}|bic\s*:?\s*[a-z0-9]{8,11}(?!\p{L})|bankverbindung(?!\p{L})\s*[:\s]|(?:geschäftsführer|geschäftsführung|vorstand|aufsichtsrat|vorsitzender|vertreten durch)\s*:|ihr zeichen|unsere zeichen|datum:)/iv;

  /** Abschnittsüberschriften, die nicht als Empfängername interpretiert werden dürfen */
  static SECTION_LABEL_REGEX = /^(?:hauptsitz|niederlassung|standort|filiale|zentrale|werk|postadresse|postanschrift|hausanschrift|anschrift|adresse|impressum|kontakt)[:\s]*$/iv;

  /** PLZ + Ortsname Erkennung (ES2024 /v flag mit Unicode-Buchstabenklassen) */
  static PLZ_ORT_REGEX = /(?<!\d)(\d{5})\s+([\p{Lu}\p{Lt}][\p{L}\s\-\/.]+?)(?=\s*(?:[,;\(]|$|\b(?:tel|fax|e-mail)\b))/v;

  /**
   * Prüft, ob eine Textzeile als Straßenzeile oder Postfach in Frage kommt.
   * Schließt Firmen- und Rechtsformzeilen (isCorporate) strikt aus.
   * @param {string} rawLine
   * @returns {boolean}
   */
  static isStreetLine(rawLine) {
    if (!rawLine) return false;

    // Geschossangaben (EG, UG, 1. OG) vor dem Check abtrennen, damit z. B. "3 EG" nicht als e.G. fehlschlägt
    const line = rawLine.trim().replace(ClipboardAddressParser.FLOOR_SUFFIX, '').trim();

    if (ClipboardAddressParser.isCorporate(line)) return false;
    if (/^postfach\s+\d+/iv.test(line)) return true;

    const hasHouseNumber = ClipboardAddressParser.HOUSE_NUMBER_END.test(rawLine);
    const hasStreetKeyword = ClipboardAddressParser.STREET_SUFFIX.test(line) || ClipboardAddressParser.STREET_WORD.test(line);
    const hasPreposition = ClipboardAddressParser.STREET_PREPOSITION.test(line);

    // 1. Mit Hausnummer: Straßensuffix/Wort ODER Straßen-Präposition
    if (hasHouseNumber && (hasStreetKeyword || hasPreposition)) return true;

    // 2. Ohne Hausnummer: Nur eindeutige Straßenkomposita (Hauptstraße, Karl-Marx-Straße, Dr.-Külz-Ring, Hohenzollernring)
    // Verhindert, dass Nachnamen wie "Hans Hering" (endet auf -ring) oder "Petra Wall" als Straße gewertet werden.
    // Bei "-ring" ohne Hausnummer: Erfordert Bindestrich (Dr.-Külz-Ring) oder mindestens 7 Zeichen vor dem Suffix.
    if (!hasHouseNumber) {
      const isUnambiguousStreet = /(?:^|\s)(?:[\p{L}\-.]*(?:stra(?:ß|ss)e|str\.|gasse|allee|chaussee|weg|[\-]ring)|\p{L}{7,}ring)$/iv.test(line);
      return isUnambiguousStreet || (hasPreposition && ClipboardAddressParser.STREET_WORD.test(line));
    }

    return false;
  }

  /**
   * Extrahiert Adress-Kandidaten aus unstrukturiertem Text.
   * @param {string} text
   * @returns {AddressCandidate[]}
   */
  static parse(text) {
    if (!text || typeof text !== 'string') return [];

    let lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Stufe 1: Unfolding für einzeilige, kommagetrennte Adressen (z. B. Google Maps / CSV)
    if (lines.length === 1 && lines[0].includes(',')) {
      lines = lines[0].split(',').map(l => l.trim()).filter(Boolean);
    }

    /** @type {AddressCandidate[]} */
    const candidates = [];

    // PASS 1: Mehrzeilige Adressblöcke (PLZ-Zeile als Anker)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const plzMatch = line.match(ClipboardAddressParser.PLZ_ORT_REGEX);
      if (!plzMatch) continue;

      const plz = plzMatch[1];
      const ort = plzMatch[2].trim().split(/[,;(]|\b(Tel|Fax|E-Mail|Telefon)\b/i)[0].trim();
      if (i === 0) continue;

      // Kontextregel: Eine Zeile mit Hausnummer direkt über dem PLZ-Anker ist eine
      // Straße, auch wenn kein Suffix sie auszeichnet ("Technologiepark 1",
      // "Gewerbegebiet Süd" als eingeschobene Zeile dazwischen). Rechtsformen
      // bleiben ausgeschlossen, sonst würde "Park Hotel GmbH" zur Straße.
      /** @param {number} idx @returns {boolean} */
      const alsStrasse = (idx) => {
        const kandidat = lines[idx];
        if (ClipboardAddressParser.isStreetLine(kandidat)) return true;
        return ClipboardAddressParser.HOUSE_NUMBER_END.test(kandidat)
          && !ClipboardAddressParser.isCorporate(kandidat);
      };

      let streetLineIndex = i - 1;
      let prevLine = lines[streetLineIndex].trim();
      let isStreet = alsStrasse(streetLineIndex);

      if (!isStreet && i >= 2) {
        if (alsStrasse(i - 2)) {
          streetLineIndex = i - 2;
          prevLine = lines[i - 2].trim();
          isStreet = true;
        }
      }

      if (!isStreet) continue;

      const street = prevLine.replace(/^(?:postanschrift|hausanschrift|anschrift|adresse|postadresse)\s*:\s*/iv, '').replace(/,+$/, '').trim();

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      // Maximal 3 Zeilen vor der Straße betrachten
      /** @type {string[]} */
      const preLines = [];
      for (let j = streetLineIndex - 1; j >= Math.max(0, streetLineIndex - 4); j--) {
        const l = lines[j].trim();
        if (l.length > 90 || l.includes('|')) break;
        if (ClipboardAddressParser.METADATA_LINE_REGEX.test(l)) continue;
        if (ClipboardAddressParser.PLZ_ORT_REGEX.test(l) || /^\d{5}\b/.test(l)) break; // Stopp bei vorangehender Adresse
        if (ClipboardAddressParser.SECTION_LABEL_REGEX.test(l)) continue;

        const cleanL = l
          .replace(/^(?:anbieterin|anbieter|unsere daten|kontakt|impressum|herausgeber|geschäftsführung|vertreten durch)\s*:\s*/iv, '')
          .replace(/^(?:geschäftsführer(?:in)?|vorstand|vorsitzende[rn]?)\s+/iv, '')
          .trim();
        if (cleanL && !cleanL.endsWith(':')) preLines.unshift(cleanL);
      }

      if (preLines.length === 1) {
        const single = preLines[0];
        if (ClipboardAddressParser.PERSON_PREFIX_REGEX.test(single)) {
          candName = single;
        } else if (ClipboardAddressParser.isCorporate(single)) {
          candFirma = single;
        } else {
          candName = single;
        }
      } else if (preLines.length === 2) {
        const l0 = preLines[0];
        const l1 = preLines[1];

        const isCO = /^(?:c\s*\/\s*o|bei)\s+/iv.test(l1);

        if (isCO) {
          if (ClipboardAddressParser.isCorporate(l0)) {
            candFirma = l0;
          } else {
            candName = l0;
          }
          candZusatz = l1;
        } else if (ClipboardAddressParser.isCorporate(l0) || ClipboardAddressParser.PERSON_PREFIX_REGEX.test(l1)) {
          candFirma = l0;
          if (ClipboardAddressParser.PERSON_PREFIX_REGEX.test(l1) || !/\d/.test(l1)) {
            candName = l1.replace(/^(?:z\.\s*hd\.|zu\s*händen)\s*:?\s*/iv, '').trim();
          } else {
            candZusatz = l1;
          }
        } else if (ClipboardAddressParser.isCorporate(l1)) {
          candFirma = l1;
          candName = l0;
        } else {
          candFirma = l0;
          candName = l1.replace(/^(?:z\.\s*hd\.|zu\s*händen)\s*:?\s*/iv, '').trim();
        }
      } else if (preLines.length >= 3) {
        candFirma = preLines[preLines.length - 3];
        candZusatz = preLines[preLines.length - 2];
        candName = preLines[preLines.length - 1].replace(/^(?:z\.\s*hd\.|zu\s*händen)\s*:?\s*/iv, '').trim();
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
      const plzMatch = lastPart.match(ClipboardAddressParser.PLZ_ORT_REGEX);
      if (!plzMatch) continue;

      const streetPart = parts[parts.length - 2];
      if (!ClipboardAddressParser.isStreetLine(streetPart)) continue;

      const nameParts = parts.slice(0, parts.length - 2);
      const first = nameParts[0] || '';
      const second = nameParts[1] || '';

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      // Ein einzelnes Wort ohne Personen-Prefix ist in einer Einzeiler-Adresse
      // fast immer ein Firmenname ("Acme"), kein Vor- oder Nachname.
      const istEinzelwort = first.length > 0 && !/\s/.test(first);
      if (ClipboardAddressParser.isCorporate(first) || istEinzelwort) {
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
    const empfNameEl = document.getElementById('empfaenger-name');
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

    // UX-4: Visuelles Feedback beim erfolgreichen Einfügen aus der Zwischenablage
    const fieldsToFlash = [empfFirmaEl, empfNameEl, empfStrasseEl, empfOrtEl];
    for (const f of fieldsToFlash) {
      if (f) f.classList.add('flash-success');
    }
    setTimeout(() => {
      for (const f of fieldsToFlash) {
        if (f) f.classList.remove('flash-success');
      }
    }, 500);

    const label = candidate.firma || candidate.name || candidate.strasse;
    const toastMsg = Constants.TOASTS.CLIPBOARD.APPLIED(label, candidate.ort);
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
          notify(Constants.TOASTS.CLIPBOARD.UNSUPPORTED, 'error');
          return;
        }

        const text = await navigator.clipboard.readText();
        if (!text?.trim()) {
          notify(Constants.TOASTS.CLIPBOARD.EMPTY, 'warning');
          return;
        }

        const candidates = ClipboardAddressParser.parse(text);

        if (candidates.length === 0) {
          notify(Constants.TOASTS.CLIPBOARD.NO_ADDRESS, 'warning');
          return;
        }

        if (candidates.length === 1) {
          ClipboardAddressParser.applyCandidate(candidates[0]);
          return;
        }

        // Mehrere Adressen gefunden: Popover zur Auswahl öffnen
        if (popover) {
          popover.replaceChildren();

          const header = document.createElement('li');
          header.className = 'autocomplete-header';
          header.textContent = `📋 ${candidates.length} Adressen gefunden:`;
          popover.appendChild(header);

          /** @param {any} cand */
          const selectCandidate = (cand) => {
            ClipboardAddressParser.applyCandidate(cand);
            // @ts-ignore
            popover.hidePopover();
          };

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

            item.dataset.index = String(idx);
            popover.appendChild(item);
          });

          bindListSelection(popover, candidates, selectCandidate);

          // @ts-ignore
          popover.showPopover();
        } else {
          notify(Constants.TOASTS.CLIPBOARD.MULTIPLE(candidates.length), 'warning');
        }
      } catch (err) {
        console.warn('[Clipboard] Lesefehler:', err);
        notify(Constants.TOASTS.CLIPBOARD.PERMISSION_DENIED, 'error');
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
  const geoapifyKeyContainer = /** @type {HTMLDetailsElement | null} */ (document.getElementById('geoapify-key-container'));
  const btnGeoapifyKey = /** @type {HTMLElement | null} */ (document.getElementById('btn-geoapify-key'));
  const statusHint = document.getElementById('geoapify-status-hint');
  const inputAddressSearch = /** @type {HTMLInputElement | null} */ (document.getElementById('input-anschrift-suche'));
  const addressSuggestions = document.getElementById('anschrift-vorschlaege');
  const addressSearchContainer = document.getElementById('anschrift-suche-container');

  // #geoapify-key-container ist seit dem Umbau auf <form id="geoapify-key-form">
  // nicht mehr vorhanden. Der Knoten darf die Initialisierung nicht blockieren —
  // sonst laufen AddressIntelligence.init() und wireDOM() weiter unten nie.
  if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !addressSearchContainer) return;

  /**
   * @param {string} msg
   * @param {string} [type]
   */
  const notify = (msg, type = 'info') => {
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: msg, type });
  };

  /**
   * @param {'empty' | 'valid' | 'invalid'} state
   * @param {string} [hint]
   */
  function setGeoapifyState(state, hint = '') {
    if (btnGeoapifyKey) {
      btnGeoapifyKey.dataset.geoapifyState = state;
      const labels = {
        empty: 'Geoapify API-Key hinterlegen',
        valid: 'Geoapify aktiv (Key ändern)',
        invalid: 'Key ungültig – neu eingeben'
      };
      btnGeoapifyKey.setAttribute('aria-label', labels[state]);
    }
    if (statusHint) {
      statusHint.textContent = hint;
    }
  }

  if (geoapifyKeyContainer) {
    geoapifyKeyContainer.addEventListener('toggle', () => {
      if (geoapifyKeyContainer.open) inputGeoapifyKey.focus();
    });
  }

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

  if (!savedKey) {
    setGeoapifyState('empty');
    if (geoapifyKeyContainer) geoapifyKeyContainer.open = false;
  } else {
    validateKeyWithHeartbeat(savedKey, { isInitial: true });
  }

  // Key input handler with Heartbeat Validation
  inputGeoapifyKey.addEventListener('input', () => {
    clearTimeout(keyDebounceTimeout);
    const val = inputGeoapifyKey.value.trim();

    if (!val) {
      save(STORAGE_KEYS.geoapifyKey, '');
      setGeoapifyState('empty');
      return;
    }

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
      setGeoapifyState('empty');
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
        setGeoapifyState('valid');
        if (geoapifyKeyContainer) geoapifyKeyContainer.open = false;
      } else if (res.status === 401 || res.status === 403) {
        save(STORAGE_KEYS.geoapifyKey, '');
        setGeoapifyState('invalid', 'Key ungültig oder abgelaufen (401/403)');
        if (geoapifyKeyContainer) geoapifyKeyContainer.open = true;
        if (!isInitial) {
          notify(Constants.TOASTS.GEOAPIFY.KEY_INVALID, 'error');
        }
      } else {
        // 429/5xx: Server vorübergehend nicht bereit -> Key behalten und als valid einstufen
        save(STORAGE_KEYS.geoapifyKey, key);
        setGeoapifyState('valid');
        if (geoapifyKeyContainer) geoapifyKeyContainer.open = false;
      }
    } catch {
      if (!inputGeoapifyKey || inputGeoapifyKey.value.trim() !== key) return;
      // Netzwerk/Timeout: Key behalten und valid bleiben (Offline-Resilienz)
      save(STORAGE_KEYS.geoapifyKey, key);
      setGeoapifyState('valid');
      if (geoapifyKeyContainer) geoapifyKeyContainer.open = false;
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
      try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch {}
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
          const keyEl = /** @type {HTMLInputElement | null} */ (document.getElementById('input-geoapify-key'));
          if (keyEl) keyEl.value = '';
          setGeoapifyState('invalid', 'Key abgelaufen (401/403)');
          if (geoapifyKeyContainer) geoapifyKeyContainer.open = true;
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
      try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch {}
      return;
    }

    if (allowZeroClick && suggestions.length > 5) {
      renderedSuggestions = [];
      const statusLi = document.createElement('li');
      statusLi.className = 'suggestion-hint';
      statusLi.setAttribute('role', 'option');
      statusLi.setAttribute('aria-disabled', 'true');
      statusLi.setAttribute('aria-selected', 'false');
      statusLi.textContent = `${suggestions.length} Treffer – bitte PLZ oder Straße ergänzen`;
      addressSuggestions.appendChild(statusLi);
      try { (/** @type {HTMLElement & { showPopover: () => void }} */ (addressSuggestions)).showPopover(); } catch {}
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
      
      li.dataset.index = String(index);
      addressSuggestions.appendChild(li);
    });

    bindListSelection(addressSuggestions, renderedSuggestions, selectSuggestion);

    try { (/** @type {HTMLElement & { showPopover: () => void }} */ (addressSuggestions)).showPopover(); } catch {}
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

    try { (/** @type {HTMLElement & { hidePopover: () => void }} */ (addressSuggestions)).hidePopover(); } catch {}
    if (inputAddressSearch) inputAddressSearch.value = '';

    saveToLocalAddressBook(item);

    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
  }

  // --- TIER 1: OFFLINE ADDRESS INTELLIGENCE ---
  AddressIntelligence.init().then(() => {
    AddressIntelligence.wireDOM();
  });

  // Geoapify für Absender PLZ → speichert Lat/Lon für Proximity Bias
  const absenderPlzOrtEl = document.getElementById('absender-ort') || document.getElementById('rucksendeangabe');
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
