// @ts-check
// @adr [[ADR-JS]] {GzipLoader}
// @guide [[glossary]]

/**
 * 🚨 ARCHITECTURAL GUARD (eine gzip-Pipeline):
 * Einziger Lesepfad fuer die gzip-komprimierten Datensaetze in `website/data/`.
 * Vorher stand dieselbe Kette (fetch -> DecompressionStream('gzip') ->
 * Response.text() -> JSON.parse) dreimal im Code — zweimal in
 * 45-address-intelligence.js, einmal in 41-salutation-engine.js — jeweils mit
 * eigenem try/catch-Dialekt und eigenem Fehlerverhalten.
 *
 * Dekomprimiert wird 100 % nativ (C++ DecompressionStream). ES IST UNTERSAGT,
 * eine JS-Inflate-Bibliothek, einen Build-Schritt oder einen zweiten
 * Lesepfad einzufuehren (Immutable Law: Zero-Dependency).
 *
 * Kein file://-Zweig: Die App laeuft ausschliesslich ueber einen lokalen
 * Webserver ([[ADR-RUNTIME-CONTEXT]]). Die frueher hier gefuehrte
 * Base64-Variante bediente nur den geloeschten Embed-Fallback.
 */

/**
 * Laedt eine gzip-komprimierte JSON-Datei und gibt das geparste Objekt zurueck.
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
