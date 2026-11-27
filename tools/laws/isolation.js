/**
 * tools/laws/isolation.js — Hermetik-Gate fuer `website/` (Catalog A45)
 *
 * A45 ("projektfremde Pfade/Kontexte in der App -- hermetische Grenzen") stand seit
 * 2026-06 im Law Catalog, wurde aber von nichts geprueft. Dieses Modul macht daraus
 * eine Invariante: `website/` muss sich OHNE jeden anderen Ordner des Repositories
 * ausliefern und starten lassen -- kopiert man den Ordner allein auf einen Webserver,
 * darf nichts fehlen.
 *
 * Geprueft wird jede Referenz in website/**.{html,css,js}:
 *   1. kein Pfad, der aus `website/` herausfuehrt (`../..`, `/docs/`, `/tools/`)
 *   2. keine absoluten Dateisystempfade (`C:\...`, `/home/...`)
 *   3. keine ladenden Verweise auf fremde Hosts (A38) -- die Allowlist gilt nur
 *      fuer optionale Fach-APIs per fetch(), nie fuer Script/Style/Font/Bild.
 *
 * AUSDRUECKLICH ERLAUBT: `@adr [[Doc]]` / `@guide [[Doc]]` in Kommentaren. Das ist
 * Traceability, kein Ladevorgang -- sie haben null Laufzeitwirkung. Umgekehrt prueft
 * tools/links.js, dass diese Dokumente existieren. Beide Richtungen zusammen:
 * Doku darf verschwinden, ohne dass die App bricht; sie soll es aber nicht unbemerkt.
 *
 * Aufrufvertrag wie tools/links.js und tools/imr.js:
 *   checkIsolation(targetDir) -> { violations: [{file, line, message}], filesChecked }
 */

const fs = require('fs');
const path = require('path');

/** Hosts, die als optionale Fach-API per fetch() erlaubt sind (Catalog A38). */
const API_ALLOWLIST = ['api.geoapify.com', 'photon.komoot.io', 'api.zippopotam.us'];

/** Attribute, die tatsaechlich eine Ressource LADEN (im Gegensatz zu <a href>). */
const LOADING_ATTR = /\b(?:src|srcset|data-src)\s*=\s*["']([^"']+)["']|<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(html|css|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

/** Fuehrt ein relativer Pfad aus `website/` heraus? */
function escapesRoot(ref, fileRelDir) {
  if (/^(https?:|data:|mailto:|#|javascript:)/i.test(ref)) return false;
  if (ref.startsWith('/')) return true;                 // absolut = verlaesst den Ordner
  const resolved = path.posix.normalize(path.posix.join(fileRelDir, ref));
  return resolved.startsWith('..');
}

/**
 * @param {string} targetDir
 * @returns {{violations: {file: string, line: number, message: string}[], filesChecked: number}}
 */
function checkIsolation(targetDir) {
  const violations = [];
  const root = path.join(targetDir, 'website');
  if (!fs.existsSync(root)) return { violations, filesChecked: 0 };

  const files = walk(root);

  for (const abs of files) {
    const rel = path.relative(targetDir, abs).replace(/\\/g, '/');
    const relDir = path.posix.dirname(rel.replace(/^website\//, ''));
    const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);

    lines.forEach((line, i) => {
      const ln = i + 1;

      // (2) absolute Dateisystempfade
      const fsPath = line.match(/["'](?:[A-Za-z]:\\|\/(?:home|Users|mnt|var)\/)[^"']*["']/);
      if (fsPath) {
        violations.push({ file: rel, line: ln, message: `A45: absoluter Dateisystempfad ${fsPath[0]}` });
      }

      // (1) Pfade, die website/ verlassen -- import/from/url()
      const refRe = /(?:from\s*|import\s*\(\s*|url\(\s*)["']([^"']+)["']/g;
      let m;
      while ((m = refRe.exec(line)) !== null) {
        const ref = m[1];
        if (/^https?:/i.test(ref)) {
          const host = (ref.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
          if (!API_ALLOWLIST.includes(host)) {
            violations.push({ file: rel, line: ln, message: `A38/A45: fremder Host "${host}" nicht in der Allowlist` });
          }
          continue;
        }
        if (escapesRoot(ref, relDir)) {
          violations.push({ file: rel, line: ln, message: `A45: Referenz "${ref}" fuehrt aus website/ heraus` });
        }
      }

      /* (1b) fetch(): A45-Praezisierung 2026-11-22.
       *
       * Ein `fetch('/pfad')` laedt KEINE Datei aus dem Repository. Es fragt den
       * Server, der `website/` ausliefert, nach einem URL-Pfad. Kopiert man den
       * Ordner allein auf einen fremden Webserver, antwortet der Pfad mit 404 —
       * und die App laeuft vollstaendig weiter, weil der Aufruf optional ist.
       * Die Isolation (A45) ist damit nicht beruehrt.
       *
       * Verboten bleiben hier: fremde Hosts (A38-Allowlist), absolute
       * Dateisystempfade (Regel 2 oben) und `../..`, weil das auch als URL aus
       * dem ausgelieferten Ordner herauszeigt. */
      const fetchRe = /\bfetch\(\s*(?:new\s+URL\(\s*)?["']([^"']+)["']/g;
      let f;
      while ((f = fetchRe.exec(line)) !== null) {
        const ref = f[1];
        if (/^https?:/i.test(ref)) {
          const host = (ref.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
          if (!API_ALLOWLIST.includes(host)) {
            violations.push({ file: rel, line: ln, message: `A38: fremder Host "${host}" nicht in der Allowlist` });
          }
          continue;
        }
        if (ref.startsWith('/')) continue; // Same-Origin-URL-Pfad, kein Repo-Pfad
        const resolved = path.posix.normalize(path.posix.join(relDir, ref));
        if (resolved.startsWith('..')) {
          violations.push({ file: rel, line: ln, message: `A45: fetch("${ref}") zeigt aus website/ heraus` });
        }
      }

      // (3) ladende Attribute in HTML
      LOADING_ATTR.lastIndex = 0;
      let a;
      while ((a = LOADING_ATTR.exec(line)) !== null) {
        if (/\brel\s*=\s*["']canonical["']/i.test(line)) continue;
        const ref = a[1] || a[2];
        if (!ref || /^data:/i.test(ref)) continue;
        if (/^https?:/i.test(ref)) {
          const host = (ref.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
          violations.push({ file: rel, line: ln, message: `A38: ladender Verweis auf externen Host "${host}" (Script/Style/Font/Bild duerfen NIE extern sein)` });
          continue;
        }
        if (escapesRoot(ref, relDir)) {
          violations.push({ file: rel, line: ln, message: `A45: geladene Ressource "${ref}" liegt ausserhalb von website/` });
        }
      }
    });
  }

  return { violations, filesChecked: files.length };
}

module.exports = { checkIsolation };

if (require.main === module) {
  const targetDir = path.resolve(__dirname, '../..');
  const { violations, filesChecked } = checkIsolation(targetDir);
  if (violations.length === 0) {
    console.log(`ISOLATION OK: ${filesChecked} Dateien geprueft, keine Verstoesse.`);
  } else {
    console.log(`ISOLATION: ${violations.length} Verstoss/Verstoesse:`);
    for (const v of violations) console.log(`  ${v.file}:${v.line}: ${v.message}`);
    process.exitCode = 1;
  }
}
