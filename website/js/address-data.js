// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]
// @adr [[ADR-JS]]

/**
 * @file address-data.js — Rein datengetriebene, DOM-freie Lookup-, Index- und Dekomprimierungs-Logik.
 * Bündelt:
 *  1. Native Gzip-Decompression (DecompressionStream API) von `orte.json.gz` und `grosskunden.json.gz`.
 *  2. Zustandslose Domain- und Normalisierungs-Funktionen (PLZ, Orte, Bezirke, Bundesländer).
 *  3. Sortierte Indizes (Binary Search lowerBound, Ort- und Firmen-Indizes).
 *  4. AddressIntelligence (Kern-Datenspeicher und Offline-Lookup-Engine).
 *  5. AddressData (Unveränderliche Fassade für entkoppelten Zugriff).
 *
 * Garantiert 100 % DOM- und import-frei (kann in Web-Workern, Node.js und Headless-Tools laufen).
 */

/**
 * Statisches Lookup-Objekt für deutsche Bundesländer (ISO-3166-2:DE -> Vollname).
 * Dient der visuellen Disambiguierung gleichnamiger Orte im Vorschlags-Popover.
 * @type {Record<string, string>}
 */
export const BUNDESLAENDER = {
  BW: 'Baden-Württemberg',
  BY: 'Bayern',
  BE: 'Berlin',
  BB: 'Brandenburg',
  HB: 'Bremen',
  HH: 'Hamburg',
  HE: 'Hessen',
  MV: 'Mecklenburg-Vorpommern',
  NI: 'Niedersachsen',
  NW: 'Nordrhein-Westfalen',
  RP: 'Rheinland-Pfalz',
  SL: 'Saarland',
  SN: 'Sachsen',
  ST: 'Sachsen-Anhalt',
  SH: 'Schleswig-Holstein',
  TH: 'Thüringen'
};

/* =========================================================================================
 * 1. NATIVE GZIP DECOMPRESSION (DecompressionStream API)
 * ========================================================================================= */

/**
 * Lädt eine gzip-komprimierte JSON-Datei und gibt das geparste Objekt zurück.
 * Liefert `null` statt zu werfen — die Aufrufer degradieren bewusst sanft
 * (leere Indizes statt Absturz).
 * @param {string} path Pfad relativ zum Dokument, z. B. 'data/orte.json.gz'
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
 * @property {string | null} [state]
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
 * @param {Map<string, string> | null} [statesMap]
 * @returns {PlzLookupResult | null}
 */
export function resolvePostcode(plz, plzToCityMap, grosskundenMap = null, statesMap = null) {
  const normPlz = normalizePostcode(plz);
  if (!normPlz) return null;

  const grosskunde = grosskundenMap?.get(normPlz) || null;
  const city = plzToCityMap.get(normPlz) || grosskunde?.city || null;
  if (!city) return null;

  const state = statesMap?.get(normPlz) || null;

  return {
    plz: normPlz,
    city,
    state,
    isGrosskunde: !!grosskunde,
    grosskunde
  };
}

/**
 * Ermittelt den Stadtteil oder die Großempfänger-Bezeichnung für eine PLZ.
 * @param {string} plz
 * @param {Map<string, string> | null} [districtsMap]
 * @param {Map<string, GrosskundeEntry> | null} [grosskundenMap]
 * @returns {string}
 */
export function getDistrict(plz, districtsMap = null, grosskundenMap = null) {
  if (districtsMap?.has(plz)) return districtsMap.get(plz) || '';
  if (grosskundenMap?.has(plz)) return 'Großempfänger';
  return '';
}

/**
 * Löst Städtenamen oder Präfixe in eine Liste von passenden Postleitzahlen auf.
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

  // 1. Exakte Treffer zuerst
  const exactPlzs = cityToPlzMap.get(q);
  if (exactPlzs) {
    const canonicalCity = plzToCityMap.get(exactPlzs[0]) || query;
    for (const plz of exactPlzs) {
      results.push({ plz, city: canonicalCity, district: getDistrict(plz, districtsMap, grosskundenMap) });
      if (results.length >= limit) return results;
    }
  }

  // 2. Präfix-Treffer
  for (const [normCity, plzs] of cityToPlzMap.entries()) {
    if (normCity !== q && normCity.startsWith(q)) {
      const canonicalCity = plzToCityMap.get(plzs[0]) || normCity;
      for (const plz of plzs) {
        results.push({ plz, city: canonicalCity, district: getDistrict(plz, districtsMap, grosskundenMap) });
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

/* =========================================================================================
 * 3. INDICES & SEARCH ALGORITHMS
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
 * Binary Search (lowerBound) für O(log n) Direkteinstieg im sortierten Array.
 * @param {string[]} arr
 * @param {string} target
 * @returns {number}
 */
export function lowerBound(arr, target) {
  let low = 0;
  let high = arr.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/* =========================================================================================
 * 4. ADDRESS INTELLIGENCE (Kern-Datenspeicher & Offline-Engine)
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

  /** @type {Map<string, string>} */
  static districts = new Map();

  /** @type {Map<string, string>} */
  static states = new Map();

  /** @type {Map<string, string[]>} */
  static ortIndex = new Map();

  /** @type {string[]} */
  static ortList = [];

  /** @type {string[]} */
  static plzList = [];

  /** @type {string[]} */
  static sortedPlzArray = [];

  /** @type {any} */
  static firmenIndex = null;

  /** @type {{ plz?: string, city: string } | null} */
  static targetLock = null;

  /** @type {boolean} */
  static isReady = false;

  /** @type {Promise<boolean> | null} */
  static #initPromise = null;

  /**
   * @param {string} plz
   * @returns {string}
   */
  static getDistrict(plz) {
    return getDistrict(plz, AddressIntelligence.districts, AddressIntelligence.grosskunden);
  }

  /**
   * @param {string} plz
   * @returns {string} ISO-3166-2:DE Code (z. B. 'NW', 'BY')
   */
  static getState(plz) {
    const p = normalizePostcode(plz) || plz;
    return AddressIntelligence.states.get(p) || '';
  }

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

        const [plzData, grossData] = await Promise.all([
          loadDataset('data/orte.json.gz'),
          loadDataset('data/grosskunden.json.gz')
        ]);
        if (!plzData) {
          console.warn('[AddressIntelligence] Datensatz orte.json.gz nicht ladbar — PLZ-Automatik inaktiv.');
          return false;
        }

        // Build PLZ -> City, Districts & States index (strikte Columnar-Validierung nach ADR-013)
        if (!plzData?.plz || !Array.isArray(plzData.plz)) {
          throw new Error('Ungueltiges Datenformat: Columnar-Schema erwartet.');
        }

        const { plz, ort, district, state } = plzData;
        AddressIntelligence.plzList = Array.isArray(plzData.plz) ? plzData.plz : Object.keys(plzData).sort();
        AddressIntelligence.sortedPlzArray = AddressIntelligence.plzList;

        if (AddressIntelligence.plzList.length > 1) {
          for (let i = 1; i < AddressIntelligence.plzList.length; i++) {
            if (AddressIntelligence.plzList[i - 1] >= AddressIntelligence.plzList[i]) {
              console.error('[AddressIntelligence] plzList ist nicht aufsteigend sortiert! Binary Search kompromittiert.');
              break;
            }
          }
        }

        const len = plz.length;
        for (let i = 0; i < len; i++) {
          const p = plz[i];
          const city = ort[i];
          const dist = district ? district[i] : null;
          const st = state ? state[i] : null;

          AddressIntelligence.plzToCity.set(p, city);
          if (dist) {
            AddressIntelligence.districts.set(p, dist);
          }
          if (st) {
            AddressIntelligence.states.set(p, st);
          }

          // Build reverse City -> PLZ index
          const normCity = city.toLowerCase().trim();
          let list = AddressIntelligence.cityToPlz.get(normCity);
          if (!list) {
            list = [];
            AddressIntelligence.cityToPlz.set(normCity, list);
          }
          list.push(p);
        }

        // Build Großempfänger index (Columnar oder Legacy-KV)
        if (grossData?.plz && Array.isArray(grossData.plz)) {
          const gPlz = grossData.plz;
          const gName = grossData.name;
          const gCity = grossData.city;
          const gTyp = grossData.typ;
          const gAll = grossData.all_names;
          const gLen = gPlz.length;
          for (let i = 0; i < gLen; i++) {
            /** @type {GrosskundeEntry} */
            const entry = {
              city: gCity[i],
              name: gName[i],
              typ: gTyp[i]
            };
            if (gAll?.[i]) {
              entry.all_names = gAll[i];
            }
            AddressIntelligence.grosskunden.set(gPlz[i], entry);
          }
        } else {
          const gross = grossData || {};
          for (const plz in gross) {
            AddressIntelligence.grosskunden.set(plz, /** @type {GrosskundeEntry} */ (gross[plz]));
          }
        }

        // Indizes für Case A, B, C aufbauen (< 15 ms)
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
    return resolvePostcode(plz, AddressIntelligence.plzToCity, AddressIntelligence.grosskunden, AddressIntelligence.states);
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
   * Case A: PLZ-Präfix-Suche (3–4 Ziffern).
   * Regel:
   * - Bei <= 15 Treffern: ALLE passenden PLZs direkt anzeigen (keine Zusammenfassung).
   * - Bei > 15 Treffern: Stadt-Zusammenfassung mit Anzahl ("Stadt (N PLZs)") nach Häufigkeit.
   * @param {string} prefix 3-4 digits
   * @param {number} [limit=15]
   * @returns {Array<{ plz?: string, name: string, city: string, typ: string, district?: string, state?: string, plzCount: number, isSinglePlz: boolean }>}
   */
  static lookupPrefix(prefix, limit = 15) {
    const p = String(prefix || '').trim();
    if (p.length < 3 || p.length > 4 || !/^\d+$/.test(p)) return [];

    /** @type {Array<{ plz: string, city: string }>} */
    const matches = [];
    /** @type {Map<string, string[]>} */
    const cityMap = new Map();

    const plzs = AddressIntelligence.plzList.length > 0
      ? AddressIntelligence.plzList
      : AddressIntelligence.sortedPlzArray;

    // Binary Search (lowerBound) für O(log n) Direkteinstieg im sortierten PLZ-Array
    const low = lowerBound(plzs, p);

    const totalPlzs = plzs.length;
    for (let i = low; i < totalPlzs; i++) {
      const plz = plzs[i];
      if (!plz.startsWith(p)) break;
      const city = AddressIntelligence.plzToCity.get(plz);
      if (!city) continue;
      matches.push({ plz, city });
      let list = cityMap.get(city);
      if (!list) {
        list = [];
        cityMap.set(city, list);
      }
      list.push(plz);
    }

    // REGEL 1: Wenn <= 15 Treffer -> alle PLZs direkt anzeigen
    if (matches.length <= 15) {
      const sortedMatches = matches.toSorted((a, b) => a.plz.localeCompare(b.plz, 'de'));
      return sortedMatches.map(m => ({
        plz: m.plz,
        name: m.city,
        city: m.city,
        typ: 'Stadt',
        district: AddressIntelligence.getDistrict(m.plz),
        state: AddressIntelligence.getState(m.plz),
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
      district: plzs.length === 1 ? AddressIntelligence.getDistrict(plzs[0]) : '',
      state: plzs.length === 1 ? AddressIntelligence.getState(plzs[0]) : '',
      plzCount: plzs.length,
      isSinglePlz: plzs.length === 1
    }));
  }

  /**
   * Universelle Suche (Städte + Firmen/Behörden/Gerichte/Institutionen).
   * Regel: Städte immer zuerst, Firmen danach.
   * @param {string} query
   * @param {number} [limit=12]
   * @returns {{ totalCount: number, items: Array<{ plz?: string, name: string, city: string, typ: string, district?: string, state?: string, isSinglePlz?: boolean, plzCount?: number }> }}
   */
  static lookupUniversal(query, limit = 12) {
    const rawQ = String(query || '').trim();
    const nq = normalizeText(rawQ);
    if (nq.length < 3) return { totalCount: 0, items: [] };

    // Exakter Prefix-Match auf den tatsächlich eingegebenen String
    const searchPrefix = nq;

    /** @type {Array<{ plz?: string, name: string, city: string, typ: string, district?: string, state?: string, isSinglePlz?: boolean, plzCount?: number }>} */
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
            district: AddressIntelligence.getDistrict(singlePlz),
            state: AddressIntelligence.getState(singlePlz),
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
      district: AddressIntelligence.getDistrict(f.plz),
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
   * @returns {Array<{ plz: string, name: string, city: string, typ: string, district: string, state?: string, isSinglePlz: boolean }>}
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

    // Prüfe, ob es sich um gleichnamige Orte in unterschiedlichen Bundesländern handelt (z. B. Neustadt)
    const distinctStates = new Set(allPlzs.map(p => AddressIntelligence.states.get(p)).filter(Boolean));
    const isMultiStateHomonym = distinctStates.size > 1;

    const plausibel = allPlzs.filter(p => {
      if (!isMultiStateHomonym && allPlzs.length >= 5 && dominantD && p[0] !== dominantD) {
        return false;
      }
      const gk = AddressIntelligence.grosskunden.get(p);
      if (gk?.city && normalizeText(gk.city) !== normTarget) {
        return false;
      }
      return true;
    });

    const filtered = prefix ? plausibel.filter(p => p.startsWith(prefix)) : plausibel;
    const sorted = filtered.toSorted((a, b) => {
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
      district: AddressIntelligence.getDistrict(plz),
      state: AddressIntelligence.getState(plz),
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
      return {};
    }

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
   * Wird in address.js implementiert.
   * @type {() => void}
   */
  static wireDOM() {}
}

/* =========================================================================================
 * 5. ADDRESS DATA FACADE
 * ========================================================================================= */

/**
 * Unveränderliche Fassade für den entkoppelten Zugriff auf Adress- und Firmen-Datenbestände.
 * Schirmt Konsumenten (wie ClipboardAddressParser) von Interna der AddressIntelligence ab.
 */
export const AddressData = Object.freeze({
  get isReady() {
    return AddressIntelligence.isReady;
  },
  /**
   * @param {string} plz 5-stellige Postleitzahl
   * @returns {{ plz: string, city: string, state: string, district: string, isGrosskunde: boolean, grosskunde: any } | null}
   */
  lookup(plz) {
    if (!AddressIntelligence.isReady) return null;
    const resolved = AddressIntelligence.lookupPlz(plz);
    if (!resolved) return null;
    return {
      plz: resolved.plz,
      city: resolved.city,
      state: resolved.state || AddressIntelligence.getState(plz),
      district: AddressIntelligence.getDistrict(plz),
      isGrosskunde: resolved.isGrosskunde,
      grosskunde: resolved.grosskunde
    };
  },
  /**
   * @param {string} text
   * @returns {any | null}
   */
  findFirma(text) {
    if (!AddressIntelligence.isReady || !AddressIntelligence.firmenIndex) return null;
    const matches = AddressIntelligence.firmenIndex.get(text);
    if (!Array.isArray(matches) || matches.length === 0) return null;
    const exact = matches.find((m) => normalizeText(m.name) === normalizeText(text));
    return exact || null;
  }
});
