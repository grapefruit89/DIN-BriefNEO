/**
 * Link-Kohärenz-Gate (Regel `links`, severity critical).
 *
 * Prüft in allen Markdown-Dateien:
 *  - inline Wikilinks `[[Ziel]]` (inkl. `|Alias` und `#Anker`)
 *  - Frontmatter-Listen `doc_links`, `depends_on`, `supersedes`
 * gegen die real existierenden Datei-Namen (Basenames) im Repository.
 *
 * Ausgenommen (bewusst, siehe agent/skills/architecture-drift-audit/references/aufraeum-playbook.md):
 *  - Code-Fences (Beispiel-Snippets)
 *  - Inline-Code-Spans (`[[…]]` in Backticks = Beispiel-Syntax)
 *  - Template-Platzhalter (ADR-XXX, ADR-YYY, _Template_Obsidian, ...)
 *  - Chroniken (DECISION-LOG, CHANGELOG) und docs/90-archive/
 *  - generierte Artefakte (Code-Referenzen, Function-Traceability)
 *  - `supersedes` (Lineage: verweist bewusst auf ersetzte/entfernte Alt-Dokumente)
 *
 * @adr [[ADR-OMNITRACEABILITY]]
 */
const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['.git', 'node_modules', 'venv', 'cache', '.agents', '.opencode', '.claude'];
const STRIP_EXT = /\.(md|json|js|css|html|canvas|ya?ml)$/i;
const PLACEHOLDER = /^(adr-x+$|adr-y+$|_template|\.{3}|…)$/i;
const SCAN_SKIP = [
  'docs/30-meta/DECISION-LOG.md',
  'docs/30-meta/CHANGELOG.md',
  'docs/10-architecture/Code-Referenzen.md',
  'docs/10-architecture/Function-Traceability.md',
];

/*
 * Generierte, bewusst nicht versionierte Doku-Artefakte (.gitignore).
 * Sie sind nicht nur als Scan-QUELLE auszunehmen (SCAN_SKIP), sondern auch
 * als Link-ZIEL: nach einem frischen Clone existieren sie noch nicht, und
 * `Function-Traceability.md` entsteht ueberhaupt nur im Python-Pfad
 * (build_db.py), nicht in build_db.js. Ohne diese Liste meldet das Gate
 * 8 tote Wikilinks und kann auf dem dokumentierten Linux-Einstieg
 * (`node tools/build_db.js`) niemals 100 % erreichen — obwohl AGENTS.md §2
 * genau das vor jeder Aenderung verlangt.
 * Die Dateien sind legitime Ziele; ihre Existenz ist nur zeitpunktabhaengig.
 */
const GENERATED_TARGETS = new Set([
  'Code-Referenzen',
  'Function-Traceability',
]);
const FM_KEYS = ['doc_links', 'code_links', 'depends_on'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.includes(e.name)) walk(path.join(dir, e.name), out);
    } else {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function resolves(target, targetDir, stems) {
  const clean = target.replace(STRIP_EXT, '');
  /* Generierte Artefakte gelten unabhaengig von ihrer momentanen Existenz
   * als aufloesbar (siehe GENERATED_TARGETS). */
  if (GENERATED_TARGETS.has(path.basename(clean))) return true;
  if (target.includes('/')) {
    return (
      fs.existsSync(path.join(targetDir, target)) ||
      fs.existsSync(path.join(targetDir, target + '.md')) ||
      stems.has(path.basename(clean))
    );
  }
  return stems.has(clean);
}

/** code_links sind Dateipfade: relativ zur Repo-Wurzel ODER zum Dokument. */
function resolvesPath(target, targetDir, absFile) {
  const cands = [path.join(targetDir, target), path.join(path.dirname(absFile), target)];
  return cands.some((p) => fs.existsSync(p) || fs.existsSync(p + '.md'));
}

function scanWikilinks(content) {
  const out = [];
  let inFence = false;
  content.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const clean = line.replace(/`[^`]*`/g, ' ');
    for (const m of clean.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const raw = m[1].split('|')[0].split('#')[0].trim();
      if (raw) out.push({ target: raw, line: i + 1 });
    }
  });
  return out;
}

function scanFrontmatterLinks(content) {
  const out = [];
  const fm = content.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return out;
  let key = null;
  for (const line of fm[1].split(/\r?\n/)) {
    const head = line.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (head) {
      const k = head[1].toLowerCase();
      key = FM_KEYS.includes(k) ? k : null;
      const inline = head[2].trim();
      if (key && inline && inline !== '[]') {
        for (const it of inline.replace(/^\[|\]$/g, '').split(',')) {
          const t = it.trim().replace(/['"]/g, '');
          if (t) out.push({ target: t, key });
        }
      }
      continue;
    }
    if (line.trim() === '') continue;
    if (!/^\s/.test(line)) {
      key = null;
      continue;
    }
    if (key) {
      const item = line.match(/^\s*-\s+(.+)$/);
      if (item) out.push({ target: item[1].trim().replace(/['"]/g, ''), key });
    }
  }
  return out;
}

function checkLinks(targetDir) {
  const violations = [];
  const allFiles = walk(targetDir);
  const stems = new Set(allFiles.map((f) => path.basename(f).replace(/\.[^.]+$/, '')));

  for (const abs of allFiles) {
    const rel = path.relative(targetDir, abs).replace(/\\/g, '/');
    if (!rel.endsWith('.md')) continue;
    if (rel.includes('90-archive/') || SCAN_SKIP.includes(rel)) continue;

    const content = fs.readFileSync(abs, 'utf8');

    for (const { target, line } of scanWikilinks(content)) {
      if (PLACEHOLDER.test(target)) continue;
      if (!resolves(target, targetDir, stems)) {
        violations.push({ file: rel, message: `Toter Wikilink [[${target}]] (Zeile ${line})` });
      }
    }

    for (const { target, key } of scanFrontmatterLinks(content)) {
      if (PLACEHOLDER.test(target)) continue;
      const ok = key === 'code_links'
        ? resolvesPath(target, targetDir, abs)
        : resolves(target, targetDir, stems);
      if (!ok) {
        violations.push({ file: rel, message: `Toter Frontmatter-${key}: "${target}"` });
      }
    }
  }

  return { violations };
}

if (require.main === module) {
  const targetDir = path.resolve(__dirname, '..');
  const { violations } = checkLinks(targetDir);
  if (violations.length === 0) {
    console.log('LINKS OK: keine toten Wikilinks/Frontmatter-Links.');
  } else {
    console.log(`LINKS: ${violations.length} Verstoss/Verstoesse:`);
    for (const v of violations) console.log(`  ${v.file}: ${v.message}`);
  }
}

module.exports = { checkLinks };
