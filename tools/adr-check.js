#!/usr/bin/env node
/**
 * tools/adr-check.js — Präventiver ADR-Drift-Wächter für DIN-BriefNEO
 *
 * Erkennt präventiv die typischen ADR-Drift-Klassen:
 * 1. 1:1-Bijektion code_links ↔ Dateisystem (ADR-CSS.md, ADR-JS.md)
 * 2. Annotation-Guard (@adr [[...]] in den ersten 5 Zeilen aller website/js/*.js)
 * 3. Registry-Zähler (Textzähler vs. code_links.length)
 * 4. Verwaiste Assets (Referenzen auf gelöschte Dateien in docs/10-architecture/ADR-*.md als Warnung)
 *
 * @adr [[ADR-OMNITRACEABILITY]]
 */

const fs = require('fs');
const path = require('path');

const VERSION = '1.0.0';
const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Parst die Liste der code_links aus dem YAML-Frontmatter einer Markdown-Datei.
 * @param {string} filePath
 * @returns {string[]}
 */
function parseCodeLinks(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return [];
  const fm = match[1];
  const lines = fm.split(/\r?\n/);
  let inCodeLinks = false;
  const links = [];
  for (const line of lines) {
    if (/^code_links:\s*$/.test(line)) {
      inCodeLinks = true;
      continue;
    }
    if (inCodeLinks) {
      if (/^\s+-\s+['"]?([^'"]+)['"]?/.test(line)) {
        const m = line.match(/^\s+-\s+['"]?([^'"]+)['"]?/);
        if (m) links.push(m[1].trim());
      } else if (/^[a-zA-Z_]/.test(line)) {
        inCodeLinks = false;
      }
    }
  }
  return links;
}

/**
 * Führt alle 4 Prüfregeln aus.
 * @returns {object}
 */
function runAdrCheck() {
  const cssAdrPath = path.join(REPO_ROOT, 'docs/10-architecture/ADR-CSS.md');
  const jsAdrPath = path.join(REPO_ROOT, 'docs/10-architecture/ADR-JS.md');

  // --- REGEL 1: 1:1-Bijektion code_links ↔ Dateisystem ---
  const cssCodeLinks = parseCodeLinks(cssAdrPath);
  const jsCodeLinks = parseCodeLinks(jsAdrPath);

  const physicalCssDir = path.join(REPO_ROOT, 'website/css');
  const physicalCss = fs.existsSync(physicalCssDir)
    ? fs.readdirSync(physicalCssDir).filter(f => f.endsWith('.css')).map(f => 'website/css/' + f).sort()
    : [];

  const physicalJsDir = path.join(REPO_ROOT, 'website/js');
  const physicalJs = fs.existsSync(physicalJsDir)
    ? fs.readdirSync(physicalJsDir).filter(f => f.endsWith('.js') && !f.endsWith('.d.ts')).map(f => 'website/js/' + f).sort()
    : [];

  const orphanCodeLinks = [];
  for (const link of [...cssCodeLinks, ...jsCodeLinks]) {
    if (!fs.existsSync(path.join(REPO_ROOT, link))) {
      orphanCodeLinks.push(link);
    }
  }

  const missingCss = physicalCss.filter(f => !cssCodeLinks.includes(f));
  const missingJs = physicalJs.filter(f => !jsCodeLinks.includes(f));

  const regel1Ok = orphanCodeLinks.length === 0 && missingCss.length === 0 && missingJs.length === 0;

  // --- REGEL 2: Annotation-Guard ---
  const missingAnnotation = [];
  for (const jsFile of physicalJs) {
    const absPath = path.join(REPO_ROOT, jsFile);
    const lines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/).slice(0, 5);
    const hasAdr = lines.some(line => /@adr\s+\[\[.+?\]\]/.test(line));
    if (!hasAdr) {
      missingAnnotation.push(jsFile);
    }
  }
  const regel2Ok = missingAnnotation.length === 0;

  // --- REGEL 3: Registry-Zähler ---
  const cssContent = fs.existsSync(cssAdrPath) ? fs.readFileSync(cssAdrPath, 'utf8') : '';
  const jsContent = fs.existsSync(jsAdrPath) ? fs.readFileSync(jsAdrPath, 'utf8') : '';

  const cssMatch = cssContent.match(/exakt\s*[*_]*\s*(\d+)\s*[*_]*\s*aktive/i);
  const jsMatch = jsContent.match(/Die\s*[*_]*\s*(\d+)\s*[*_]*\s*Module/i);

  const cssCounter = cssMatch ? parseInt(cssMatch[1], 10) : null;
  const jsCounter = jsMatch ? parseInt(jsMatch[1], 10) : null;

  const regel3CssOk = cssCounter === cssCodeLinks.length;
  const regel3JsOk = jsCounter === jsCodeLinks.length;
  const regel3Ok = regel3CssOk && regel3JsOk;

  // --- REGEL 4: Verwaiste Assets ---
  const adrDir = path.join(REPO_ROOT, 'docs/10-architecture');
  const adrFiles = fs.existsSync(adrDir)
    ? fs.readdirSync(adrDir).filter(f => f.startsWith('ADR-') && f.endsWith('.md')).sort()
    : [];
  const fileRefRegex = /(?:`|"|\x27|\b)([a-zA-Z0-9_\-\.\/]+\.(?:css|js|json\.gz|svg))(?:`|"|\x27|\b)/g;

  const findings = [];

  for (const file of adrFiles) {
    const content = fs.readFileSync(path.join(adrDir, file), 'utf8');
    const lines = content.split(/\r?\n/);
    let inFence = false;
    let inAntipattern = false;

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('```')) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;

      if (line.includes('Antipattern') || file === 'ADR-ANTIPATTERN.md') {
        inAntipattern = true;
      }
      if (inAntipattern && line.startsWith('## ') && !line.includes('Antipattern')) {
        inAntipattern = false;
      }
      if (inAntipattern) return;

      const lower = line.toLowerCase();
      if (
        lower.includes('bündelt') ||
        lower.includes('vormalig') ||
        lower.includes('ehemals') ||
        lower.includes('gelöscht') ||
        lower.includes('entfernt') ||
        lower.includes('entfallen') ||
        lower.includes('berichtigt') ||
        lower.includes('optionales release-artefakt') ||
        lower.includes('z.b.') ||
        lower.includes('eliminated') ||
        lower.includes('hard ban')
      ) {
        return;
      }

      if (line.includes('Moment.js')) return;
      if (file === 'ADR-HTML.md' && (line.includes('link rel="stylesheet"') || line.includes('script type="module"'))) return;
      if (file === 'ADR-EVENT-DRIVEN-ARCHITECTURE.md' && (line.includes('44-address-domain.js') || line.includes('51-persistence.js'))) return;

      let match;
      while ((match = fileRefRegex.exec(line)) !== null) {
        const ref = match[1];
        if (ref.startsWith('http') || ref.startsWith('@') || ref.startsWith('api.') || ref.includes('node_modules')) continue;

        let exists = false;
        const checkPath = path.resolve(REPO_ROOT, ref);
        if (fs.existsSync(checkPath)) exists = true;
        if (!exists && !ref.includes('/')) {
          const candidates = [
            path.join(REPO_ROOT, 'website/js', ref),
            path.join(REPO_ROOT, 'website/css', ref),
            path.join(REPO_ROOT, 'website/data', ref),
            path.join(REPO_ROOT, 'website/assets', ref),
            path.join(REPO_ROOT, 'tools', ref)
          ];
          for (const c of candidates) {
            if (fs.existsSync(c)) { exists = true; break; }
          }
        }

        if (!exists) {
          findings.push({ file, line: idx + 1, reference: ref });
        }
      }
    });
  }

  // Sortierung: ADR-TOAST-SYSTEM.md zuerst, dann alphabetisch nach Datei und Zeile
  findings.sort((a, b) => {
    if (a.file === 'ADR-TOAST-SYSTEM.md' && b.file !== 'ADR-TOAST-SYSTEM.md') return -1;
    if (b.file === 'ADR-TOAST-SYSTEM.md' && a.file !== 'ADR-TOAST-SYSTEM.md') return 1;
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });

  const exitCode = (regel1Ok && regel2Ok && regel3Ok) ? 0 : 1;

  return {
    regel1: {
      status: regel1Ok ? 'ok' : 'error',
      css: { expected: physicalCss.length, actual: cssCodeLinks.length, missing: missingCss },
      js: { expected: physicalJs.length, actual: jsCodeLinks.length, missing: missingJs },
      orphan_code_links: orphanCodeLinks
    },
    regel2: {
      status: regel2Ok ? 'ok' : 'error',
      files_checked: physicalJs.length,
      missing_annotation: missingAnnotation
    },
    regel3: {
      status: regel3Ok ? 'ok' : 'error',
      adr_css: { counter: cssCounter, code_links: cssCodeLinks.length },
      adr_js: { counter: jsCounter, code_links: jsCodeLinks.length }
    },
    regel4: {
      status: findings.length > 0 ? 'warning' : 'ok',
      findings
    },
    exit_code: exitCode
  };
}

/**
 * Gibt das Ergebnis im Standard-Konsolenformat aus.
 * @param {object} res
 */
function printHuman(res) {
  console.log('adr-check.js — Ergebnis\n');

  // Regel 1
  const totalRegistered = res.regel1.css.actual + res.regel1.js.actual;
  const totalExpected = res.regel1.css.expected + res.regel1.js.expected;
  if (res.regel1.status === 'ok') {
    console.log(`Regel 1 (Bijektion): ✅ ${totalRegistered}/${totalExpected} Dateien registriert`);
  } else {
    console.log(`Regel 1 (Bijektion): ❌ Fehler (${totalRegistered}/${totalExpected} registriert)`);
    if (res.regel1.orphan_code_links.length > 0) {
      console.log(`  - Nicht-existente code_links: ${res.regel1.orphan_code_links.join(', ')}`);
    }
    if (res.regel1.css.missing.length > 0) {
      console.log(`  - Fehlend in ADR-CSS.md: ${res.regel1.css.missing.join(', ')}`);
    }
    if (res.regel1.js.missing.length > 0) {
      console.log(`  - Fehlend in ADR-JS.md: ${res.regel1.js.missing.join(', ')}`);
    }
  }

  // Regel 2
  if (res.regel2.status === 'ok') {
    console.log(`Regel 2 (Annotation): ✅ ${res.regel2.files_checked}/${res.regel2.files_checked} Dateien haben @adr-Tag`);
  } else {
    console.log(`Regel 2 (Annotation): ❌ Fehlende Tags in ${res.regel2.missing_annotation.join(', ')}`);
  }

  // Regel 3
  if (res.regel3.status === 'ok') {
    console.log(`Regel 3 (Registry-Zähler): ✅ ADR-CSS ${res.regel3.adr_css.counter}/${res.regel3.adr_css.code_links}, ADR-JS ${res.regel3.adr_js.counter}/${res.regel3.adr_js.code_links}`);
  } else {
    console.log(`Regel 3 (Registry-Zähler): ❌ Zähler-Abweichung (CSS: ${res.regel3.adr_css.counter} vs ${res.regel3.adr_css.code_links}, JS: ${res.regel3.adr_js.counter} vs ${res.regel3.adr_js.code_links})`);
  }

  // Regel 4
  if (res.regel4.findings.length === 0) {
    console.log('Regel 4 (Verwaiste Assets): ✅ Keine verwaisten Assets gefunden');
  } else {
    console.log(`Regel 4 (Verwaiste Assets): ⚠ ${res.regel4.findings.length} Funde`);
    for (const f of res.regel4.findings) {
      const extra = f.reference === 'layout.css' ? ' (nicht existent)' : '';
      console.log(`  - ${f.file}:${f.line} → ${f.reference}${extra}`);
    }
  }

  console.log('');
  if (res.exit_code === 0) {
    if (res.regel4.findings.length > 0) {
      console.log('Status: PASS (Regel 1-3 OK, Regel 4 nur Warnungen)');
    } else {
      console.log('Status: PASS (Alle Regeln OK)');
    }
  } else {
    console.log('Status: FAIL (Fehler in Regel 1, 2 oder 3)');
  }
  console.log(`Exit-Code: ${res.exit_code}`);
}

function printHelp() {
  console.log(`Usage: node tools/adr-check.js [options]

Präventiver ADR-Drift-Wächter für DIN-BriefNEO.
Prüft die 4 Regeln:
  Regel 1: 1:1-Bijektion code_links ↔ Dateisystem (ADR-CSS, ADR-JS)
  Regel 2: Annotation-Guard (@adr [[...]] in den ersten 5 Zeilen von website/js/*.js)
  Regel 3: Registry-Zähler (Textzähler vs. code_links.length)
  Regel 4: Verwaiste Assets (Referenzen auf gelöschte Dateien in docs/10-architecture/ADR-*.md)

Optionen:
  --json       Maschinenlesbare JSON-Ausgabe
  --help       Hilfe anzeigen
  --version    Version anzeigen

Exit-Codes:
  0 = Alle Regeln OK oder nur Regel-4-Warnungen
  1 = Mindestens ein Fehler in Regel 1, 2 oder 3`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`adr-check v${VERSION}`);
    process.exit(0);
  }

  const res = runAdrCheck();

  if (args.includes('--json')) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    printHuman(res);
  }

  process.exit(res.exit_code);
}

if (require.main === module) {
  main();
}

module.exports = { runAdrCheck, parseCodeLinks };
