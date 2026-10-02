/**
 * tools/lawcoverage.js — prueft die Pruefer (Meta-Gate ueber den Law Catalog)
 *
 * ANLASS: Dreimal in Folge stellte sich heraus, dass eine Norm des Katalogs von
 * nichts geprueft wurde (@adr-Dokumentenschutz, Terminologie, A45). Die Inventur
 * vom 2026-10-02 fand zusaetzlich drei Defekte einer neuen Klasse: Sonden, die
 * eine Gesetzesnummer BEANSPRUCHEN, die es nicht gibt (A16/A20), Sonden, die ein
 * Gesetz beanspruchen und nichts pruefen (leeres Pattern), und Sonden, die ein
 * Gesetz tatsaechlich durchsetzen, es aber nicht benennen (leeres catalog_ref).
 *
 * Alle drei sind derselbe Fehler: die Verbindung zwischen Norm und Pruefung ist
 * unbelegt. Dieses Modul macht sie belegbar.
 *
 * GEPRUEFT WIRD (harte Verstoesse):
 *   1. Jede `catalog_ref` in tools/antipatterns/*.json zeigt auf eine ID, die es
 *      im Immutable Law Catalog wirklich gibt.
 *   2. Keine Sonde beansprucht ein Gesetz, ohne es zu pruefen: wer `catalog_ref`
 *      setzt und `check: "regex"` fuehrt, braucht ein nicht-leeres `pattern`.
 *   3. Eine Sonde, die ein HARD-BAN-Gesetz prueft, darf nicht als `info`
 *      eingestuft sein — sonst bleibt der Verstoss folgenlos.
 *
 * BEWUSST NUR BERICHTET, NICHT ERZWUNGEN: die Abdeckungsquote. Viele Gesetze sind
 * nicht per Regex pruefbar (A43 "unkontrolliertes Scrolling", A47 "komplexe UI in
 * contenteditable"). Ein Gate, das 100 % Abdeckung fordert, erzwaenge Schein-Sonden
 * — genau das Gegenteil des Ziels. Die Quote steht im Log, damit sie nicht
 * unsichtbar verfaellt.
 *
 * Aufrufvertrag wie tools/isolation.js, tools/links.js, tools/imr.js:
 *   checkLawCoverage(repoRoot) -> { violations: [{file, line, message}], filesChecked, coverage }
 */

const fs = require('fs');
const path = require('path');
const { matchFilePattern } = require('./filematch.js');

const CATALOG = 'docs/00-foundation/Immutable-Law-Catalog.md';
const PROBE_DIR = 'tools/antipatterns';

/**
 * Gesetze, die kein Regex-Pattern durchsetzt, sondern ein eigenes Modul. Diese
 * Liste ist bewusst kurz und handgefuehrt: ein Modul hier einzutragen, ohne dass
 * es die Norm wirklich prueft, waere derselbe Selbstbetrug, den dieses Werkzeug
 * verhindern soll. Jeder Eintrag braucht einen Gegentest im DECISION-LOG.
 */
const TOOL_ENFORCED = { A45: 'tools/isolation.js' };

/** Liest alle normativen IDs (erste Tabellenspalte) samt Typ aus dem Katalog. */
function readCatalog(repoRoot) {
  const file = path.join(repoRoot, CATALOG);
  if (!fs.existsSync(file)) return null;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const ids = new Map(); // id -> { type, line }
  lines.forEach((text, i) => {
    const m = text.match(/^\|\s*([A-Z]+\d+)\s*\|\s*([^|]*)\|/);
    if (m) ids.set(m[1], { type: m[2].trim(), line: i + 1 });
  });
  return ids;
}

/** Findet die Zeilennummer einer Sonden-ID in ihrer JSON-Datei (fuer brauchbare Fehlermeldungen). */
function lineOfRule(raw, ruleId) {
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => new RegExp(`"id"\\s*:\\s*"${ruleId}"`).test(l));
  return idx === -1 ? 1 : idx + 1;
}

/** Alle Dateien, die der Antipattern-Scanner ueberhaupt liest (.html/.css/.js). */
function scannableFiles(repoRoot) {
  const out = [];
  const SKIP = new Set(['node_modules', '.git', 'build', 'agent', 'research']);
  (function walk(dir) {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entries) {
      if (SKIP.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (['.html', '.css', '.js'].includes(path.extname(e.name).toLowerCase())) {
        out.push(path.relative(repoRoot, full).replace(/\\/g, '/'));
      }
    }
  })(repoRoot);
  return out;
}

function checkLawCoverage(repoRoot) {
  const violations = [];
  const catalog = readCatalog(repoRoot);
  if (!catalog) {
    return { violations: [{ file: CATALOG, line: 1, message: 'Law Catalog nicht gefunden — Abdeckung nicht pruefbar.' }], filesChecked: 0, coverage: null };
  }

  const probeDir = path.join(repoRoot, PROBE_DIR);
  const files = fs.existsSync(probeDir) ? fs.readdirSync(probeDir).filter((f) => f.endsWith('.json')) : [];

  const enforced = new Map(); // Gesetzes-ID -> [Sonden-IDs mit wirksamer Pruefung]
  const targetFiles = scannableFiles(repoRoot);

  for (const fname of files) {
    const rel = `${PROBE_DIR}/${fname}`;
    const raw = fs.readFileSync(path.join(probeDir, fname), 'utf8');
    let doc;
    try {
      doc = JSON.parse(raw);
    } catch (e) {
      violations.push({ file: rel, line: 1, message: `Sondendatei ist kein gueltiges JSON: ${e.message}` });
      continue;
    }

    for (const rule of doc.rules || []) {
      const rid = rule.id || '?';
      const ln = lineOfRule(raw, rid);
      const refs = rule.catalog_ref || [];
      const isRegex = rule.check === 'regex';
      const hasPattern = typeof rule.pattern === 'string' && rule.pattern.length > 0;

      for (const ref of refs) {
        // (1) toter Verweis
        if (!catalog.has(ref)) {
          violations.push({ file: rel, line: ln, message: `Sonde ${rid} beruft sich auf "${ref}" — diese ID gibt es im Law Catalog nicht.` });
          continue;
        }
        // (2) beansprucht, prueft aber nichts
        if (isRegex && !hasPattern) {
          violations.push({ file: rel, line: ln, message: `Sonde ${rid} beansprucht ${ref}, hat aber check:"regex" ohne Pattern — sie prueft nichts.` });
          continue;
        }
        // (3) HARD BAN darf nicht folgenlos sein
        const type = (catalog.get(ref).type || '').toUpperCase();
        if (isRegex && hasPattern && type.includes('HARD BAN') && rule.severity === 'info') {
          violations.push({ file: rel, line: ln, message: `Sonde ${rid} prueft HARD BAN ${ref}, ist aber severity:"info" — der Verstoss bliebe folgenlos.` });
        }
        if (isRegex && hasPattern) {
          if (!enforced.has(ref)) enforced.set(ref, []);
          enforced.get(ref).push(rid);
        }
      }

      // (2b) wirksame Sonde ohne jede Zuordnung: die Durchsetzung ist unsichtbar
      // (4) TOTE SONDE: Dateimuster, das keine einzige reale Datei trifft. Genau so
      // waren P3/P4/P5 jahrelang wirkungslos ("website/js/*.js" wurde literal verglichen).
      if (isRegex && hasPattern && !targetFiles.some((f) => matchFilePattern(f, rule.file_patterns))) {
        violations.push({ file: rel, line: ln, message: `Sonde ${rid} trifft mit file_patterns ${JSON.stringify(rule.file_patterns)} keine einzige Datei — sie ist wirkungslos.` });
      }

      const reason = typeof rule.no_catalog_ref_reason === 'string' ? rule.no_catalog_ref_reason.trim() : '';
      if (isRegex && hasPattern && refs.length === 0 && !reason) {
        violations.push({ file: rel, line: ln, message: `Sonde ${rid} prueft etwas, nennt aber kein catalog_ref — die Durchsetzung ist nicht nachvollziehbar. Entweder das Gesetz eintragen oder "no_catalog_ref_reason" setzen (bewusst norm-freie Sonde).` });
      }
    }
  }

  // Abdeckung nur berichten (siehe Kopfkommentar).
  const laws = [...catalog.keys()].filter((id) => id.startsWith('A'));
  for (const [lawId, tool] of Object.entries(TOOL_ENFORCED)) {
    if (catalog.has(lawId)) {
      if (!enforced.has(lawId)) enforced.set(lawId, []);
      enforced.get(lawId).push(tool);
    }
  }
  const covered = laws.filter((id) => enforced.has(id));
  const coverage = {
    laws: laws.length,
    covered: covered.length,
    uncovered: laws.filter((id) => !enforced.has(id)),
    byLaw: Object.fromEntries([...enforced].map(([k, v]) => [k, v])),
  };

  return { violations, filesChecked: files.length, coverage };
}

module.exports = { checkLawCoverage };
