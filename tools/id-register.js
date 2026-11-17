/**
 * tools/id-register.js — ID-Gate ("Ein Punkt, eine ID")
 *
 * Prueft drei Dinge gegen das Register in docs/30-meta/ID-REGISTER.md:
 *
 *  1. AUFLOESBARKEIT: Jede `B<n>`-Referenz in lebenden Dokumenten muss in
 *     BACKLOG.md (offen), BACKLOG-ARCHIV.md (erledigt) oder in der
 *     Prinzipien-Gruppe B1-B5 des Registers existieren.
 *  2. AUSLAUF: Ausgelaufene Praefixe (S, R, F, T, M) duerfen nicht mehr als
 *     ID zitiert werden — weder im Fliesstext noch in Backticks.
 *  3. REGISTER-DECKUNG: Die im Register genannten Bereiche muessen zur
 *     Wirklichkeit passen (A/H aus dem Law Catalog, P aus project.json,
 *     B aus den beiden Backlog-Dateien). Wer eine Norm hinzufuegt, ohne das
 *     Register zu pflegen, faellt hier auf.
 *
 * ENTWURFSPRINZIP wie tools/terminology.js: Die Listen stehen NICHT im Code,
 * sondern werden aus dem Register geparst. Sonst waere dieses Modul die zweite
 * Kopie des Kanons (AGENTS.md 5.1 "Ein Fakt, ein Ort").
 *
 * Aufrufvertrag:
 *   checkIds(targetDir) -> { violations: [{file, line, found, rule, message}], families }
 */

const fs = require('fs');
const path = require('path');

const REGISTER = 'docs/30-meta/ID-REGISTER.md';
const BACKLOG = 'docs/30-meta/BACKLOG.md';
const ARCHIV = 'docs/30-meta/BACKLOG-ARCHIV.md';
const LAW_CATALOG = 'docs/00-foundation/Immutable-Law-Catalog.md';
const PROJECT_ANTIPATTERNS = 'tools/antipatterns/project.json';

/** Lebende Dokumente: hier wird geprueft. */
const SCAN_DIRS = ['docs', 'batch', 'skills'];
/** Bewusst ungeprueft — Zeitdokumente und Quelle statt Fliesstext. */
const EXCLUDED = [
  'docs/90-archive/',
  'docs/audit/',
  'docs/30-meta/DECISION-LOG.md',
  'docs/30-meta/DECISION-LOG-2026-H1.md',
  'docs/30-meta/ID-REGISTER.md',
  'docs/00-foundation/din5008.md', // wortgetreues Normzitat, enthaelt OCR-Artefakte
  'Papierkorb/',
  'research/'
];

function lies(targetDir, rel) {
  const p = path.join(targetDir, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

function dateienSammeln(targetDir) {
  const out = [];
  const gehe = (rel) => {
    const abs = path.join(targetDir, rel);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = path.posix.join(rel, e.name);
      if (e.isDirectory()) gehe(r);
      else if (/\.(md)$/.test(e.name)) out.push(r);
    }
  };
  SCAN_DIRS.forEach(gehe);
  return out.filter((f) => !EXCLUDED.some((x) => f.startsWith(x)));
}

/** Bereiche aus der Tabelle "Aktive Nummernkreise" lesen. */
function registerLesen(targetDir) {
  const text = lies(targetDir, REGISTER);
  const familien = new Map();
  let imAbschnitt = false;
  for (const zeile of text.split(/\r?\n/)) {
    if (/^##\s+Aktive Nummernkreise/.test(zeile)) imAbschnitt = true;
    else if (/^##\s/.test(zeile)) imAbschnitt = false;
    if (!imAbschnitt) continue;
    const m = zeile.match(/^\|\s*`([A-Z]{1,3})`\s*\|.*\|\s*([A-Z]{1,3})(\d+)(?:[–-]([A-Z]{1,3})?(\d+))?\s*\|/);
    if (!m) continue;
    const [, prefix, , von, , bis] = m;
    familien.set(prefix, { von: Number(von), bis: Number(bis || von) });
  }
  // Prinzipien-Gruppe B1-B5 (Sonderfall, siehe Register)
  familien.set('B_PRINZIPIEN', { von: 1, bis: 5 });
  return familien;
}

function maxId(text, muster) {
  let max = 0;
  for (const treffer of text.matchAll(muster)) {
    const n = Number(treffer[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
}

/** Praefixe aus der Tabelle "Ausgelaufene Praefixe" lesen. */
function ausgelaufenePraefixe(targetDir) {
  const text = lies(targetDir, REGISTER);
  const out = new Set();
  let imAbschnitt = false;
  for (const zeile of text.split(/\r?\n/)) {
    if (/^##\s+Ausgelaufene Pr/.test(zeile)) imAbschnitt = true;
    else if (/^##\s/.test(zeile)) imAbschnitt = false;
    if (!imAbschnitt) continue;
    const m = zeile.match(/^\|\s*`([A-Z]{1,3})`\s*\|/);
    if (m) out.add(m[1]);
  }
  return out;
}

function backlogIds(targetDir) {
  const ids = new Set();
  for (const t of lies(targetDir, BACKLOG).matchAll(/^### (B\d+) ·/gm)) ids.add(t[1]);
  for (const t of lies(targetDir, ARCHIV).matchAll(/^\|\s*(B\d+)\s*\|/gm)) ids.add(t[1]);
  return ids;
}

/**
 * @param {string} targetDir
 * @returns {{violations: {file: string, line: number, found: string, rule: string, message: string}[], families: number}}
 */
function checkIds(targetDir) {
  const violations = [];
  const familien = registerLesen(targetDir);
  if (familien.size === 0) {
    return {
      violations: [
        { file: REGISTER, line: 1, found: '—', rule: 'register', message: 'ID-Register fehlt oder hat keine Tabelle "Aktive Nummernkreise"' }
      ],
      families: 0
    };
  }

  // --- 3. Register-Deckung gegen die Quellen der Wahrheit ---
  const deckung = [
    ['A', LAW_CATALOG, /\|\s*A(\d{1,3})\s*\|/g],
    ['H', LAW_CATALOG, /\|\s*H(\d{1,3})\s*\|/g],
    ['P', PROJECT_ANTIPATTERNS, /"id":\s*"P(\d{1,3})"/g],
    ['W', 'tools/antipatterns/web.json', /"id":\s*"W(\d{1,3})"/g],
    ['B', BACKLOG, /^### (B\d+) ·/gm]
  ];
  for (const [prefix, quelle, muster] of deckung) {
    const f = familien.get(prefix);
    if (!f) {
      violations.push({ file: REGISTER, line: 1, found: prefix, rule: 'register', message: `Praefix ${prefix} fehlt in der Tabelle "Aktive Nummernkreise"` });
      continue;
    }
    const text = lies(targetDir, quelle);
    if (!text) continue;
    const istMax = prefix === 'B'
      ? Math.max(...[...text.matchAll(muster)].map((m) => Number(m[1].slice(1))))
      : maxId(text, muster);
    if (istMax > f.bis) {
      violations.push({
        file: REGISTER,
        line: 1,
        found: `${prefix}${istMax}`,
        rule: 'register',
        message: `${quelle} enthaelt ${prefix}${istMax}, das Register nennt nur ${prefix}${f.von}-${prefix}${f.bis}. Register nachziehen.`
      });
    }
  }

  // --- 1. + 2. Referenzen in lebenden Dokumenten ---
  const bekannt = backlogIds(targetDir);
  const praemien = familien.get('B_PRINZIPIEN');
  const ausgelaufen = ausgelaufenePraefixe(targetDir);

  for (const rel of dateienSammeln(targetDir)) {
    const zeilen = lies(targetDir, rel).split(/\r?\n/);
    for (let i = 0; i < zeilen.length; i++) {
      const zeile = zeilen[i];

      for (const m of zeile.matchAll(/\bB(\d{1,3})\b/g)) {
        const id = `B${m[1]}`;
        const n = Number(m[1]);
        const istPrinzip = praemien && n >= praemien.von && n <= praemien.bis;
        if (!bekannt.has(id) && !istPrinzip) {
          violations.push({
            file: rel,
            line: i + 1,
            found: id,
            rule: 'aufloesbar',
            message: `${id} ist weder in ${BACKLOG}/${ARCHIV} noch ein Prinzip B1-B5 (siehe ${REGISTER})`
          });
        }
      }

      // Ausgelaufene Praefixe nur in ID-Form (Backticks) — Fliesstext wie
      // "S1" in "Stufe 1" oder "M2" in einem Namen bleibt unangetastet.
      for (const m of zeile.matchAll(/`([SRFTM]\d{1,2})`/g)) {
        if (!ausgelaufen.has(m[1][0])) continue;
        violations.push({
          file: rel,
          line: i + 1,
          found: m[1],
          rule: 'ausgelaufen',
          message: `Das Praefix ${m[1][0]} ist ausgelaufen; Alias-Tabelle in ${REGISTER} nennt die heutige ID`
        });
      }
    }
  }

  return { violations, families: familien.size };
}

module.exports = { checkIds };
