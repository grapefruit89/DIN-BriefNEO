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

import { setCaretToEnd } from './document.js';
import { eventBus, Events, Constants } from './core.js';
import { load, save, loadJSON, saveJSON, STORAGE_KEYS } from './persistence.js';

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
    if (this.isReady) return true;
    if (this.#initPromise) return this.#initPromise;

    this.#initPromise = (async () => {
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

        // Build Districts index (optional)
        const districts = distData || {};
        for (const [plz, name] of Object.entries(districts)) {
          this.districts.set(plz, String(name));
        }

        // Indizes für Case A, B, C aufbauen (< 15 ms)
        this.prefixIndex = buildPrefixIndex(this.plzToCity);
        this.ortIndex = buildOrtIndex(this.plzToCity);
        this.ortList = Array.from(new Set(this.plzToCity.values())).toSorted((a, b) => a.localeCompare(b, 'de'));
        this.firmenIndex = buildFirmenIndex(this.grosskunden);

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
   * @param {number} [limit=30]
   * @returns {{ plz: string, city: string, district?: string }[]}
   */
  static lookupCity(query, limit = 30) {
    return resolveCity(query, this.cityToPlz, this.plzToCity, limit, this.districts, this.grosskunden);
  }

  /**
   * Progressive prefix filter (e.g. "53" -> all Bonn / Rhein-Sieg PLZs).
   * @param {string} prefix 2-5 digits
   * @param {number} [limit=30]
   * @returns {{ plz: string, city: string, district?: string }[]}
   */
  static filterPrefix(prefix, limit = 30) {
    return filterPostcodePrefix(prefix, this.plzToCity, limit, this.districts, this.grosskunden);
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

    for (const [plz, city] of this.plzToCity.entries()) {
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
        district: this.districts.get(m.plz) || '',
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
      district: plzs.length === 1 ? (this.districts.get(plzs[0]) || '') : '',
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
    for (const city of this.ortList) {
      const normCity = normalizeText(city);
      if (normCity.startsWith(searchPrefix)) {
        const plzs = this.ortIndex.get(city) || [];
        if (plzs.length === 1) {
          const singlePlz = plzs[0];
          cityItems.push({
            plz: singlePlz,
            name: city,
            city: city,
            typ: 'Stadt',
            district: this.districts.get(singlePlz) || '',
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
    const firmenMatches = this.firmenIndex ? this.firmenIndex.search(searchPrefix, limit * 2) : [];
    const firmenItems = firmenMatches.map((/** @type {any} */ f) => ({
      plz: f.plz,
      name: f.name,
      city: f.city,
      typ: f.typ,
      district: this.districts.get(f.plz) || '',
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
    const canonicalCity = this.ortList.find(c => normalizeText(c) === normTarget) || cityName;
    const allPlzs = this.ortIndex.get(canonicalCity) || [];
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
      const gk = this.grosskunden.get(p);
      if (gk?.city && normalizeText(gk.city) !== normTarget) {
        return false;
      }
      return true;
    });

    const filtered = prefix ? plausibel.filter(p => p.startsWith(prefix)) : plausibel;
    const sorted = filtered.toSorted((a, b) => {
      // Zustell-PLZs (mit Stadtteil) zuerst, danach Sonder-PLZs; jeweils aufsteigend nach PLZ
      const distA = this.districts.has(a) ? 1 : 0;
      const distB = this.districts.has(b) ? 1 : 0;
      if (distA !== distB) return distB - distA;
      return a.localeCompare(b, 'de');
    });

    return sorted.map(plz => ({
      plz,
      name: canonicalCity,
      city: canonicalCity,
      typ: 'Stadt',
      district: this.districts.get(plz) || '',
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

    // 1. Fall: Stadt + PLZ-Filter (z. B. "bonn 53" oder "münchen 80")
    const cityPlzMatch = text.match(/^([a-zA-ZäöüÄÖÜß\s\-]+?)\s+(\d{1,5})$/);
    if (cityPlzMatch) {
      const cityPart = cityPlzMatch[1].trim();
      const plzPrefix = cityPlzMatch[2].trim();
      const normPart = normalizeText(cityPart);

      const exactCity = this.ortList.find(c => normalizeText(c) === normPart);
      const prefixCities = !exactCity ? this.ortList.filter(c => normalizeText(c).startsWith(normPart)) : [];
      const targetCity = exactCity || (prefixCities.length === 1 ? prefixCities[0] : null);

      if (targetCity) {
        const plzs = this.lookupCityPlzs(targetCity, plzPrefix);
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
    const exactCity = this.ortList.find(c => normalizeText(c) === nq);
    const matchingCities = this.ortList.filter(c => normalizeText(c).startsWith(nq));

    // Regel 1: Exakter Match auf Stadtname
    if (exactCity) {
      const plzs = this.ortIndex.get(exactCity) || [];
      if (plzs.length === 1) {
        return {
          mode: 'single_fill',
          city: exactCity,
          plz: plzs[0],
          items: [],
          totalCount: 1
        };
      }
      const items = this.lookupCityPlzs(exactCity);
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
      const plzs = this.ortIndex.get(targetCity) || [];
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
    const univ = this.lookupUniversal(text, limit);
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

      const maxItems = window.innerWidth < 600 ? 8 : 12;

      // 0–2 Zeichen: Nichts anzeigen & Popover leeren
      if (rawText.length < 3) {
        this.#hidePopover(suggestionsPopover);
        suggestionsPopover.replaceChildren();
        return;
      }

      // Case 1: Genau 5 Ziffern -> Sofortiger Lookup (0 ms)
      const plzMatch = rawText.match(/^(\d{5})$/);
      if (plzMatch) {
        const plz = plzMatch[1];
        const res = this.lookupPlz(plz);
        if (res && !userEditing) {
          // Plausibilitäts-Check: Passt PLZ zu vorher gewähltem Ort?
          if (this.targetLock && this.targetLock.city) {
            const allowedPlzs = this.ortIndex.get(this.targetLock.city) || [];
            if (allowedPlzs.length > 0 && !allowedPlzs.includes(plz)) {
              const warn = `PLZ ${plz} gehört nicht zu ${this.targetLock.city} – meinten Sie ${res.city}?`;
              eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: warn, type: 'warning' });
            }
          }

          const completed = `${res.plz} ${res.city}`;
          empfOrtEl.textContent = completed;
          empfOrtEl.setAttribute('data-autofilled', 'true');

          this.targetLock = { plz: res.plz, city: res.city };

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
          this.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
          return;
        } else {
          // Keine PLZ gefunden oder Nutzer editiert/löscht gerade (userEditing === true) -> KEIN Auto-Fill!
          this.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
          return;
        }
      }

      // Case 2: 3–4 Ziffern -> Sofortige Präfix-Suche
      const prefixMatch = rawText.match(/^(\d{3,4})$/);
      if (prefixMatch) {
        const prefix = prefixMatch[1];
        const matches = this.lookupPrefix(prefix, 15);
        if (matches.length > 0) {
          const isDirectPlzList = matches.every(m => m.isSinglePlz && m.plz);
          this.#renderUniversalSuggestions(matches, matches.length, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, null, isDirectPlzList);
        } else {
          this.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
        }
        return;
      }

      // Case 3: Text (>= 3 Zeichen) -> Sofortiger Exakter Match / Präfix / Universell
      if (rawText.length >= 3 && !/^\d/.test(rawText)) {
        const res = this.resolveCityInput(rawText, maxItems);
        if (res.mode === 'single_fill' && res.plz && res.city && !userEditing) {
          const completed = `${res.plz} ${res.city}`;
          empfOrtEl.textContent = completed;
          empfOrtEl.setAttribute('data-autofilled', 'true');
          this.targetLock = { plz: res.plz, city: res.city };
          this.#moveCaretToEnd(empfOrtEl);
          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
          this.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
          return;
        }

        if (res.items.length > 0) {
          const isPlzList = res.mode === 'city_plzs';
          this.#renderUniversalSuggestions(res.items, res.totalCount, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, null, isPlzList);
        } else {
          this.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
        }
        return;
      }

      this.#hidePopover(suggestionsPopover);
      suggestionsPopover.replaceChildren();
    });

    // Case C: Eingabe im Firma-Feld (Großkunden & Behörden Direkt-Lookup)
    if (empfFirmaEl) {
      empfFirmaEl.addEventListener('input', () => {
        const rawText = (empfFirmaEl.textContent || "").trim();

        if (debounceTimer) clearTimeout(debounceTimer);

        if (rawText.length < 3) {
          this.#hidePopover(suggestionsPopover);
          suggestionsPopover.replaceChildren();
          return;
        }

        debounceTimer = setTimeout(() => {
          const maxItems = window.innerWidth < 600 ? 8 : 12;
          /** @type {Array<any>} */
          const matches = this.firmenIndex ? this.firmenIndex.search(rawText, maxItems) : [];
          if (matches.length > 0) {
            const formatted = matches.map((/** @type {any} */ m) => ({
              plz: m.plz,
              name: m.name,
              city: m.city,
              typ: m.typ,
              district: this.districts.get(m.plz) || '',
              isSinglePlz: true
            }));
            this.#renderUniversalSuggestions(formatted, matches.length, empfOrtEl, empfFirmaEl, empfStrasseEl, suggestionsPopover, empfFirmaEl);
          } else {
            this.#hidePopover(suggestionsPopover);
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
          const targetIndex = currentIndex >= 0 ? currentIndex : 0;
          items[targetIndex]?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.#hidePopover(suggestionsPopover);
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

      matches.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

        // Farb-Klasse nach Typ
        const typLower = (item.typ || '').toLowerCase();
        if (typLower === 'firma') li.classList.add('ac-firma');
        else if (typLower === 'behörde' || typLower === 'behoerde') li.classList.add('ac-behoerde');
        else if (typLower === 'gericht') li.classList.add('ac-gericht');
        else if (typLower === 'institution') li.classList.add('ac-institution');
        else li.classList.add('ac-city');

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

        let isSelectionHandled = false;
        /** @param {Event} [e] */
        const triggerSelection = (e) => {
          if (isSelectionHandled) return;
          isSelectionHandled = true;
          if (e) e.preventDefault();
          setTimeout(() => { isSelectionHandled = false; }, 100);

          // Wenn in der Stadtliste eine Stadt mit mehreren PLZs angeklickt wird: sofort PLZ-Liste öffnen!
          if (item.typ === 'Stadt' && !item.isSinglePlz) {
            const plzs = this.lookupCityPlzs(item.city);
            this.#renderUniversalSuggestions(plzs, plzs.length, ortEl, firmaEl, strasseEl, popoverEl, anchorEl, true);
            return;
          }

          const res = this.applySelection(item, ortEl, firmaEl, strasseEl);
          this.targetLock = { city: item.city, plz: item.plz };
          if (res?.note) {
            eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: res.note, type: 'info' });
          }
          this.#moveCaretToEnd(anchorEl || ortEl);
          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
          this.#hidePopover(popoverEl);
        };

        // mousedown: Verhindert Fokusverlust (blur) des Eingabefeldes auf dem Desktop
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          triggerSelection(e);
        });

        // click: Für Touchscreen-Taps, Screenreader & synthetische Klicks
        li.addEventListener('click', (e) => {
          triggerSelection(e);
        });

        popoverEl.appendChild(li);
      });

      // Hinweiszeile wenn mehr Treffer als Limit vorhanden (NICHT bei reinen PLZ-Listen einer Stadt!)
      // Valide ARIA-Hierarchie: Als li[role="option"][aria-disabled="true"] im ul[role="listbox"]
      const maxItems = window.innerWidth < 600 ? 8 : 12;
      if (!isPlzList && totalCount > maxItems) {
        const hintLi = document.createElement('li');
        hintLi.className = 'suggestion-hint';
        hintLi.setAttribute('role', 'option');
        hintLi.setAttribute('aria-disabled', 'true');
        hintLi.setAttribute('aria-selected', 'false');
        hintLi.textContent = `${totalCount} Treffer – tippe weiter`;
        popoverEl.appendChild(hintLi);
      }
    };

    render();

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
        if (!text || !text.trim()) {
          notify(Constants.TOASTS.CLIPBOARD.EMPTY, 'warning');
          return;
        }

        const candidates = this.parse(text);

        if (candidates.length === 0) {
          notify(Constants.TOASTS.CLIPBOARD.NO_ADDRESS, 'warning');
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
  const geoapifyKeyContainer = document.getElementById('geoapify-key-container');
  const btnGeoapifyKey = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-geoapify-key'));
  const statusHint = document.getElementById('geoapify-status-hint');
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

  /**
   * @param {boolean} open
   */
  function setContainerVisible(open) {
    if (!geoapifyKeyContainer) return;
    geoapifyKeyContainer.hidden = !open;
    if (btnGeoapifyKey) {
      btnGeoapifyKey.setAttribute('aria-expanded', String(open));
    }
  }

  if (btnGeoapifyKey) {
    btnGeoapifyKey.addEventListener('click', () => {
      const willOpen = Boolean(geoapifyKeyContainer.hidden);
      setContainerVisible(willOpen);
      if (willOpen) inputGeoapifyKey.focus();
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
    setContainerVisible(false);
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
        setContainerVisible(false);
      } else if (res.status === 401 || res.status === 403) {
        save(STORAGE_KEYS.geoapifyKey, '');
        setGeoapifyState('invalid', 'Key ungültig oder abgelaufen (401/403)');
        setContainerVisible(true);
        if (!isInitial) {
          notify(Constants.TOASTS.GEOAPIFY.KEY_INVALID, 'error');
        }
      } else {
        // 429/5xx: Server vorübergehend nicht bereit -> Key behalten und als valid einstufen
        save(STORAGE_KEYS.geoapifyKey, key);
        setGeoapifyState('valid');
        setContainerVisible(false);
      }
    } catch (err) {
      if (!inputGeoapifyKey || inputGeoapifyKey.value.trim() !== key) return;
      // Netzwerk/Timeout: Key behalten und valid bleiben (Offline-Resilienz)
      save(STORAGE_KEYS.geoapifyKey, key);
      setGeoapifyState('valid');
      setContainerVisible(false);
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
          const btnKey = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-geoapify-key'));
          if (btnKey) {
            btnKey.dataset.geoapifyState = 'invalid';
            btnKey.setAttribute('aria-label', 'Key ungültig – neu eingeben');
            btnKey.setAttribute('aria-expanded', 'true');
          }
          const cont = document.getElementById('geoapify-key-container');
          if (cont) cont.hidden = false;
          const hint = document.getElementById('geoapify-status-hint');
          if (hint) hint.textContent = 'Key abgelaufen (401/403)';
          notify(Constants.TOASTS.GEOAPIFY.KEY_EXPIRED, 'error');
        } else {
          console.warn('[Address] Autocomplete HTTP ' + response.status);
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
      const statusLi = document.createElement('li');
      statusLi.className = 'suggestion-hint';
      statusLi.setAttribute('role', 'option');
      statusLi.setAttribute('aria-disabled', 'true');
      statusLi.setAttribute('aria-selected', 'false');
      statusLi.textContent = `${suggestions.length} Treffer – bitte PLZ oder Straße ergänzen`;
      addressSuggestions.appendChild(statusLi);
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
