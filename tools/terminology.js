/**
 * tools/terminology.js — Terminologie-Gate ("Ein Sachverhalt, ein Begriff")
 *
 * Prueft, dass in lebenden Dokumenten keine verdraengte Begriffsvariante steht.
 *
 * ENTWURFSPRINZIP: Die Begriffsliste wird NICHT hier gepflegt, sondern aus der
 * Tabelle "Kanonische Begriffe" in docs/20-implementation/glossary.md geparst.
 * Sonst waere dieses Modul selbst die zweite Kopie des Kanons -- genau der Fehler,
 * den die Regel verhindern soll (AGENTS.md 5.1 "Ein Fakt, ein Ort").
 *
 * Aufrufvertrag wie tools/links.js und tools/imr.js:
 *   checkTerminology(targetDir) -> { violations: [{file, line, found, canonical}], canonCount }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GLOSSARY = 'docs/20-implementation/glossary.md';

/** Dateien, die bewusst ungeprueft bleiben. */
const EXCLUDED = [
  'docs/90-archive/',            // eingefroren (status: archived)
  'docs/30-meta/DECISION-LOG.md',// append-only Chronik, Alteintraege sind Zeitdokumente
  'research/',                   // Laborarchiv
  GLOSSARY,                      // enthaelt die verdraengten Varianten per Definition
  'tools/terminology.js'
];

/**
 * Liest die Kanon-Tabelle aus dem Glossar.
 * Erwartetes Zeilenformat: | **Kanonisch** | Variante, Variante | Beschreibung |
 * @param {string} targetDir
 * @returns {{canonical: string, variants: string[]}[]}
 */
function parseCanon(targetDir) {
  const file = path.join(targetDir, GLOSSARY);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);

  const start = lines.findIndex(l => /^##\s.*Kanonische Begriffe/.test(l));
  if (start === -1) return [];
  // Nur bis zur naechsten H2/H3 lesen -- die "nicht zusammenlegen"-Tabelle
  // darunter ist bewusst KEINE Verbotsliste.
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^###?\s/.test(lines[i])) { end = i; break; }
  }

  const entries = [];
  for (const line of lines.slice(start, end)) {
    const m = line.match(/^\|\s*\*\*(.+?)\*\*.*?\|\s*(.+?)\s*\|/);
    if (!m) continue;
    const canonical = m[1].replace(/\(.*?\)/g, '').trim();
    const variants = m[2]
      .split(',')
      .map(v => v.replace(/\(.*?\)/g, '').replace(/[*`]/g, '').trim())
      .filter(v => v && v !== '—' && !/^siehe/i.test(v));
    if (variants.length) entries.push({ canonical, variants });
  }
  return entries;
}

/**
 * @param {string} targetDir
 * @returns {{violations: {file: string, line: number, found: string, canonical: string}[], canonCount: number}}
 */
function checkTerminology(targetDir) {
  const canon = parseCanon(targetDir);
  const violations = [];
  if (canon.length === 0) return { violations, canonCount: 0 };

  let tracked = [];
  try {
    tracked = execSync('git ls-files "*.md"', { cwd: targetDir, encoding: 'utf-8' })
      .split('\n').map(s => s.trim()).filter(Boolean);
  } catch {
    return { violations, canonCount: canon.length };
  }

  const files = tracked.filter(f => !EXCLUDED.some(ex => f === ex || f.startsWith(ex)));

  for (const rel of files) {
    const abs = path.join(targetDir, rel);
    let lines;
    try {
      lines = fs.readFileSync(abs, 'utf-8').split(/\r?\n/);
    } catch { continue; }

    let inCode = false;
    lines.forEach((line, i) => {
      if (/^\s*```/.test(line)) { inCode = !inCode; return; }
      if (inCode) return;                     // Codebloecke sind keine Prosa
      const prose = line.replace(/`[^`]*`/g, ''); // Inline-Code ausblenden

      for (const { canonical, variants } of canon) {
        for (const variant of variants) {
          const re = new RegExp(`(^|[^\\w-])${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'i');
          if (re.test(prose)) {
            violations.push({ file: rel, line: i + 1, found: variant, canonical });
          }
        }
      }
    });
  }

  return { violations, canonCount: canon.length };
}

module.exports = { checkTerminology, parseCanon };
