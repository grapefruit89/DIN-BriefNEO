// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]

/**
 * @file 44-address-domain.js — Reine Fachlogik für deutsche PLZ- und Adressauflösung.
 * Vollständig zustandslose, pure Funktionen ohne DOM, Storage oder Netzwerk-Abhängigkeiten.
 */

/**
 * @typedef {object} GrosskundeEntry
 * @property {string} name
 * @property {string} city
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

  const city = plzToCityMap.get(normPlz);
  if (!city) return null;

  const grosskunde = grosskundenMap?.get(normPlz) || null;
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
 * @returns {{ plz: string, city: string }[]}
 */
export function resolveCity(query, cityToPlzMap, plzToCityMap, limit = 10) {
  const q = String(query || '').toLowerCase().trim();
  if (q.length < 2) return [];

  /** @type {{ plz: string, city: string }[]} */
  const results = [];

  // 1. Exakte Treffer zuerst
  const exactPlzs = cityToPlzMap.get(q);
  if (exactPlzs) {
    const canonicalCity = plzToCityMap.get(exactPlzs[0]) || query;
    for (const plz of exactPlzs) {
      results.push({ plz, city: canonicalCity });
      if (results.length >= limit) return results;
    }
  }

  // 2. Präfix-Treffer
  for (const [normCity, plzs] of cityToPlzMap.entries()) {
    if (normCity !== q && normCity.startsWith(q)) {
      const canonicalCity = plzToCityMap.get(plzs[0]) || normCity;
      for (const plz of plzs) {
        results.push({ plz, city: canonicalCity });
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

/**
 * Filtert PLZs nach einem 2- bis 4-stelligen Ziffern-Präfix.
 * @param {string} prefix
 * @param {Map<string, string>} plzToCityMap
 * @param {number} [limit=10]
 * @returns {{ plz: string, city: string }[]}
 */
export function filterPostcodePrefix(prefix, plzToCityMap, limit = 10) {
  const p = String(prefix || '').trim();
  if (p.length < 2 || p.length > 4 || !/^\d+$/.test(p)) return [];

  /** @type {{ plz: string, city: string }[]} */
  const matches = [];
  for (const [plz, city] of plzToCityMap.entries()) {
    if (plz.startsWith(p)) {
      matches.push({ plz, city });
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
