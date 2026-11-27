// tools/runtime/static-server.mjs — Zero-Dependency Static-Server für lokale Test-/Debug-Läufe.
//
// Liefert das Repo-Verzeichnis aus und setzt auf JEDER Antwort (auch 404) harte
// No-Cache-Header. Damit kann kein Browser eine alte JS-Version aus dem Cache
// ziehen — die frühere ?v=panelsN-Pflege in test/index.html ist überflüssig.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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

/**
 * Entwickler-Komfort fuer Schriften, die NICHT ins Repo duerfen (Lizenz:
 * Aptos = Microsoft, Michelangelus = kommerziell).
 *
 * Die App laedt sie relativ aus `website/fonts/` (A45: kein Pfad aus
 * `website/` heraus). Fehlt die Datei dort, liefert dieser Server sie aus dem
 * lokalen Ordner `<repo>/fonts/` — genau wie `/__geokey` den Key aus
 * `~/.secrets/` durchreicht. Auf einem fremden Webserver fehlt beides: 404,
 * der Browser faellt auf seine Ersatzschrift zurueck. Kein Fehler.
 *
 * @param {string} root Web-Wurzel
 * @returns {string | null} Pfad zu <repo>/fonts, wenn es ihn gibt
 */
function findeFontsOrdner(root) {
  const repoRoot = path.basename(root) === 'website' ? path.dirname(root) : root;
  const kandidat = path.join(repoRoot, 'fonts');
  try {
    return existsSync(kandidat) && statSync(kandidat).isDirectory() ? kandidat : null;
  } catch {
    return null;
  }
}

/**
 * Entwickler-Komfort: listet die Schriften, die NUR lokal in `<repo>/fonts/`
 * liegen (Lizenz — Aptos ist Microsoft, Michelangelus kommerziell — oder
 * eigene Testschriften). `fonts/` ist komplett gitignoriert, also ist der
 * Ordner die Wahrheit und nicht eine Liste im HTML.
 *
 * Auf einem fremden Webserver gibt es diesen Endpunkt nicht (404): die Auswahl
 * bleibt dann auf den mitgelieferten Schriften, und es wird keine Datei
 * angefordert, die dort gar nicht liegt.
 *
 * @param {string | null} ordner
 * @returns {{ datei: string, name: string, familie: string }[]}
 */
function liesLokaleSchriften(ordner) {
  if (!ordner) return [];
  const ERLAUBT = new Set(['.woff2', '.ttf', '.otf']);
  /* Was bereits ausgeliefert wird, ist keine "lokale Testschrift": Inter liegt
     als Subset in website/fonts/. Die Liberation-Quelldateien werden seit
     2026-11-27 nicht mehr gebaut, bleiben aber ausgeblendet, damit der
     Altbestand nicht als waehlbare Schrift in der App auftaucht. */
  const AUSGELIEFERT = /^(inter|liberationsans)/i;
  let dateien;
  try {
    dateien = readdirSync(ordner);
  } catch {
    return [];
  }
  /** @type {Map<string, { datei: string, ext: string }>} */
  const gewaehlt = new Map();
  for (const datei of dateien) {
    if (datei.startsWith('.')) continue;
    const ext = path.extname(datei).toLowerCase();
    if (!ERLAUBT.has(ext)) continue;
    const stem = datei.slice(0, -ext.length);
    if (AUSGELIEFERT.test(stem)) continue;
    /* Schluessel klein schreiben: sonst gelten "Aptos.ttf" und "aptos.woff2"
       als zwei Schriften (real passiert am 2026-11-23). */
    const schluessel = stem.toLowerCase().replace(/[\s_]+/g, '-');
    const vorher = gewaehlt.get(schluessel);
    /* woff2 gewinnt gegen ttf/otf: kleiner und ohne Umwandlung nutzbar. */
    if (!vorher || (ext === '.woff2' && vorher.ext !== '.woff2')) {
      gewaehlt.set(schluessel, { datei, ext, stem });
    }
  }
  return [...gewaehlt.values()]
    .map(({ datei, stem }) => {
      const name = stem
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((wort) => wort.charAt(0).toUpperCase() + wort.slice(1))
        .join(' ');
      return { datei, name, familie: `Lokal-${name.replace(/[^A-Za-z0-9]+/g, '-')}` };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export async function startStaticServer(root, wunschPort = 0) {
  const fontsOrdner = findeFontsOrdner(root);
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
    if (url.pathname === '/__fonts') {
      const liste = liesLokaleSchriften(fontsOrdner);
      res.writeHead(200, { ...NO_CACHE, 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(liste));
      return;
    }
    let pfad;
    try {
      pfad = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    } catch {
      res.writeHead(400, NO_CACHE).end('Bad Request');
      return;
    }
    let lieferbar = pfad.startsWith(root + path.sep) && existsSync(pfad) && statSync(pfad).isFile();

    /* Schriften-Fallback: nur fuer Dateien in einem `fonts/`-Ordner, nur
       innerhalb von <repo>/fonts. Nie fuer andere Pfade. */
    if (!lieferbar && fontsOrdner && pfad.includes(`${path.sep}fonts${path.sep}`)) {
      const kandidat = path.join(fontsOrdner, path.basename(pfad));
      if (kandidat.startsWith(fontsOrdner + path.sep) && existsSync(kandidat) && statSync(kandidat).isFile()) {
        pfad = kandidat;
        lieferbar = true;
      }
    }

    if (!lieferbar) {
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
