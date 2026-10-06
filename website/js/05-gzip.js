// @ts-check
// @adr [[ADR-JS]] {GzipLoader}
// @guide [[glossary]]

/**
 * Zentraler nativer Lesepfad für gzip-komprimierte JSON-Datensätze in `website/data/`.
 * Nutzt die native DecompressionStream-API des Browsers ohne externe Bibliotheken.
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
