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
 */

/**
 * Laedt eine gzip-komprimierte JSON-Datei und gibt das geparste Objekt zurueck.
 * Liefert `null` statt zu werfen — die Aufrufer degradieren bewusst sanft
 * (leere Indizes statt Absturz).
 * @param {string} path Pfad relativ zum Dokument, z. B. 'data/de_plz_ort.json.gz'
 * @returns {Promise<any|null>}
 */
export async function fetchGzipJson(path) {
  /* Unter file:// ist fetch() lokaler Dateien CORS-blockiert (Origin null).
   * Der Aufrufer entscheidet, ob er einen Fallback hat. */
  if (typeof window === 'undefined' || window.location.protocol === 'file:') return null;
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

/**
 * Dekomprimiert eine Base64-kodierte gzip-Payload im Speicher.
 * Wird nur vom eingebetteten Offline-Fallback genutzt.
 * @param {string} b64 Reine Base64-Payload (ohne data:-Praefix)
 * @returns {Promise<any|null>}
 */
export async function decompressGzipBase64(b64) {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();

    return JSON.parse(await new Response(ds.readable).text());
  } catch (err) {
    console.warn('[gzip] Base64-Dekompression fehlgeschlagen', err);
    return null;
  }
}
