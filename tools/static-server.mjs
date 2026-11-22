// tools/static-server.mjs — Zero-Dependency Static-Server für lokale Test-/Debug-Läufe.
//
// Liefert das Repo-Verzeichnis aus und setzt auf JEDER Antwort (auch 404) harte
// No-Cache-Header. Damit kann kein Browser eine alte JS-Version aus dem Cache
// ziehen — die frühere ?v=panelsN-Pflege in test/index.html ist überflüssig.

import { existsSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.gz': 'application/gzip',
  '.map': 'application/json; charset=utf-8'
};

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0'
};

/**
 * @param {string} root Absolutpfad, der als Web-Wurzel dient
 * @param {number} [wunschPort] 0 = freier Port
 * @returns {Promise<{ server: import('node:http').Server, port: number, close: () => Promise<void> }>}
 */
/**
 * Entwickler-Komfort: liegt der Geoapify-Key in einer lokalen Datei, liefert
 * ihn dieser Server unter `/__geokey` aus — damit nach einem Reload (oder in
 * einem frischen Profil) die Strassensuche sofort laeuft, ohne den Key jedes
 * Mal zu tippen. Bewusst NUR hier und nicht in `website/`: in Produktion gibt
 * es den Endpunkt nicht (404), die App verhaelt sich dann normal.
 *
 * Pfad: $DIN_GEOKEY_FILE oder ~/.secrets/geoapify. Fehlt die Datei: 404.
 * Der Wert wird nie geloggt.
 * @returns {string | null}
 */
function liesDevGeokey() {
  const datei = process.env.DIN_GEOKEY_FILE || path.join(os.homedir(), '.secrets', 'geoapify');
  try {
    if (!existsSync(datei)) return null;
    const wert = readFileSync(datei, 'utf8').trim();
    return wert || null;
  } catch {
    return null;
  }
}

export async function startStaticServer(root, wunschPort = 0) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (url.pathname === '/__geokey') {
      const key = liesDevGeokey();
      if (!key) {
        res.writeHead(404, { ...NO_CACHE, 'Content-Type': 'text/plain; charset=utf-8' }).end('Kein Dev-Key');
        return;
      }
      res.writeHead(200, { ...NO_CACHE, 'Content-Type': 'text/plain; charset=utf-8' }).end(key);
      return;
    }
    let pfad;
    try {
      pfad = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    } catch {
      res.writeHead(400, NO_CACHE).end('Bad Request');
      return;
    }
    if (!pfad.startsWith(root + path.sep) || !existsSync(pfad) || !statSync(pfad).isFile()) {
      res.writeHead(404, { ...NO_CACHE, 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found');
      return;
    }
    const typ = MIME[path.extname(pfad).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { ...NO_CACHE, 'Content-Type': typ });
    res.end(readFileSync(pfad));
  });

  const port = await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(wunschPort, '127.0.0.1', () => resolve(/** @type {import('node:net').AddressInfo} */ (server.address()).port));
  });

  return {
    server,
    port,
    close: () => new Promise((resolve) => server.close(() => resolve()))
  };
}
