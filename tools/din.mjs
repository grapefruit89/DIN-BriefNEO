#!/usr/bin/env node
/**
 * tools/din.mjs — der eine Einstiegspunkt für `tools/` (Etappe 1).
 *
 * Warum: ein Agent musste bisher 37 Dateinamen kennen; `tools/README.md` war
 * unvollständig und teils falsch. Hier gibt es einen Hilfe-Baum und ein
 * Manifest (`din tools --json`) — kein Raten.
 *
 * Architektur (Etappe 1, bewusst langweilig):
 *   din.mjs  → delegiert als Kindprozess an die BESTEHENDEN Skripte.
 *   Kein `await import()` auf CJS-Altlasten, keine Fachlogik, keine Kopie.
 *   stdio wird direkt durchgereicht (`stdio: 'inherit'`), damit `dev live`
 *   und interaktive Messungen unverändert funktionieren.
 *
 * Schichtung (Ziel, siehe tools/CONSOLIDATION-BLUEPRINT.md §0):
 *   din.mjs → fitness/ → laws/     (laws/ importiert niemals fitness/)
 * Etappe 1 berührt diese Schichtung noch nicht — sie verschiebt nichts.
 *
 * Aufruf: node tools/din.mjs [bereich] [befehl] [flags] [--] [argumente]
 * Exit:   0 ok · 1 Gate/Test rot · 2 Aufruf-/Vorbedingungsfehler · 3 IO/Render
 *
 * Null Abhängigkeiten: nur `node:`-Builtins.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ------------------------------------------------------------------ Wurzel */

const HIER =
  import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

/** Nächstes Verzeichnis mit `package.json` + Name `din-briefneo`. */
function findeRepoWurzel(start) {
  let dir = start;
  for (let i = 0; i < 6; i += 1) {
    const pkg = path.join(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        if (JSON.parse(readFileSync(pkg, 'utf8')).name === 'din-briefneo') {
          return dir;
        }
      } catch {
        /* kaputte package.json: weiter nach oben suchen */
      }
    }
    const hoch = path.dirname(dir);
    if (hoch === dir) break;
    dir = hoch;
  }
  return null;
}

const REPO_ROOT = findeRepoWurzel(HIER);

if (!REPO_ROOT) {
  console.error(
    `din: keine Repo-Wurzel ab ${HIER} gefunden (package.json mit name "din-briefneo").`,
  );
  process.exit(2);
}

/* ------------------------------------------------------------------ Katalog */

/**
 * Werkzeug-Landkarte. `file` ist relativ zur Repo-Wurzel; `entry` ist der
 * kanonische Aufruf für Menschen und Agenten.
 * @type {{ name: string, group: string, summary: string, file: string, gate: boolean, status?: string }[]}
 */
const WERKZEUGE = [
  // Meta
  { name: 'din', group: 'meta', summary: 'Dieser Einstiegspunkt: Routing, Hilfe-Baum, Werkzeug-Landkarte', file: 'tools/din.mjs', gate: false },

  // Laufzeit-Modul (Etappe 3)
  { name: 'runtime', group: 'runtime', summary: 'Öffentliche Schnittstelle: startServer, findBrowser, launch, runTests, startLive', file: 'tools/runtime/index.mjs', gate: false },
  { name: 'runtime/browser', group: 'runtime', summary: 'Chrome/Chromium-Erkennung findBrowser() (plattformübergreifend)', file: 'tools/runtime/browser.mjs', gate: false },
  { name: 'runtime/static-server', group: 'runtime', summary: 'No-Cache-Server mit Dual-Root: website/, /__fonts, /__geokey', file: 'tools/runtime/static-server.mjs', gate: false },
  { name: 'runtime/launch', group: 'runtime', summary: 'Headless-Chrome-Start: mkdtemp-Profil, spawn, Port-Warten, Aufräumen', file: 'tools/runtime/launch.mjs', gate: false },
  { name: 'runtime/cdp', group: 'runtime', summary: 'CDP-Client (WebSocket/JSON-RPC): findeSeite, verbinde, evaluate', file: 'tools/runtime/cdp.mjs', gate: false },
  { name: 'runtime/runner', group: 'runtime', summary: 'Test-Runner für Unit-Suite (test/index.html), liefert Exit-Code', file: 'tools/runtime/runner.mjs', gate: true },
  { name: 'runtime/mcp-live', group: 'runtime', summary: 'MCP-Live-Kanal (stdio + SSE) für website/js/live-bridge.js', file: 'tools/runtime/mcp-live.mjs', gate: false },

  // Dev (Shims bleiben die kanonischen Pfade)
  { name: 'dev', group: 'dev', summary: 'Server 8088 + Debug-Browser (CDP 9222): start|stop|status|live|key', file: 'tools/dev.sh', gate: false },
  { name: 'serve', group: 'dev', summary: '19-Zeilen-Wrapper: startet static-server auf website/', file: 'tools/serve.mjs', gate: false },
  { name: 'static-server', group: 'dev', summary: 'SHIM → tools/runtime/static-server.mjs (Pfad bleibt stabil)', file: 'tools/static-server.mjs', gate: false, status: 'shim' },
  { name: 'browser', group: 'dev', summary: 'SHIM → tools/runtime/browser.mjs (Pfad bleibt stabil)', file: 'tools/browser.mjs', gate: false, status: 'shim' },
  { name: 'debug-session', group: 'dev', summary: 'Manuelle Debug-Session: CDP, Screenshots, Netzwerk (kein Automatismus)', file: 'tools/debug-session.mjs', gate: false },
  { name: 'mcp-live', group: 'dev', summary: 'SHIM → tools/runtime/mcp-live.mjs (settings.js/dev.sh nennen diesen Pfad)', file: 'tools/mcp-live.mjs', gate: false, status: 'shim' },
  { name: 'seed-geoapify', group: 'dev', summary: 'Geoapify-Key aus ~/.secrets in localStorage des Debug-Browsers', file: 'tools/seed-geoapify.mjs', gate: false },
  { name: 'setup-din-home', group: 'dev', summary: 'CI-Schritt: Home-Verzeichnis für tsc/CDP vorbereiten', file: 'tools/setup-din-home.sh', gate: true },

  // Messen (Ziel: measure/)
  { name: 'mess.js', group: 'measure', summary: 'In-Page-Messfunktion für CDP evaluate_script (sourcePath-Vertrag)', file: 'tools/mess.js', gate: false },
  { name: 'mess', group: 'measure', summary: 'CLI-Transport für mess.js gegen CDP 9222', file: 'tools/mess.mjs', gate: false },
  { name: 'mess-print', group: 'measure', summary: 'Dieselben Messwerte wie mess, aber in Druck-Emulation', file: 'tools/mess-print.mjs', gate: false },
  { name: 'print-messung', group: 'measure', summary: 'PDF-Wahrheit: Seiten, yMax, Unterrand (6 Assertions in test/all.js)', file: 'tools/print-messung.mjs', gate: true },
  { name: 'testbrief-messung', group: 'measure', summary: 'Testbrief-Generator ohne Browser messen (n Sätze, Szenario)', file: 'tools/testbrief-messung.mjs', gate: false },
  { name: 'paint-probe', group: 'measure', summary: 'TTC/Paint-Timing über CDP: --runs, --profile local|cpu6|slow', file: 'tools/paint-probe.mjs', gate: false },
  { name: 'druck-pixel', group: 'measure', summary: '4 Referenzbriefe als PDF für Vorher/Nachher-Pixel-Diffs', file: 'tools/druck-pixel.mjs', gate: false },

  // Fitness (Ziel: fitness/)
  { name: 'build_db', group: 'fitness', summary: 'Fitness-Gate + docs/STRUCTURE.md (Wegweiser + Score), -q still', file: 'tools/build_db.js', gate: true },
  { name: 'reconciliation', group: 'fitness', summary: 'Score-Engine, lädt 8 Sonden; --only-rules für Pre-Commit', file: 'tools/reconciliation.js', gate: true },
  { name: 'fitness/structure-stand', group: 'fitness', summary: 'SHA-256-Stand-Helfer: bodyOf, computeStand, STAND_RE', file: 'tools/fitness/structure-stand.js', gate: true },
  { name: 'structure-stand', group: 'fitness', summary: 'CommonJS-Shim → fitness/structure-stand.js (alter Pfad bleibt)', file: 'tools/structure-stand.js', gate: true },
  { name: 'repo-map-check', group: 'fitness', summary: 'Wegweiser-Gate: genannte Pfade existieren, JS-Module erwähnt', file: 'tools/repo-map-check.mjs', gate: true },

  // Gesetze (Ziel: laws/)
  { name: 'laws/scan', group: 'laws', summary: 'Glob→RegExp-Matcher: globToRegExp, matchFilePattern', file: 'tools/laws/scan.mjs', gate: true },
  { name: 'filematch', group: 'laws', summary: 'CommonJS-Shim → laws/scan.mjs (alter Pfad bleibt)', file: 'tools/filematch.js', gate: true },
  { name: 'imr', group: 'laws', summary: 'IMR-Registry-Sonde (docs/norm/IMR-Registry.md)', file: 'tools/imr.js', gate: true },
  { name: 'structural-laws', group: 'laws', summary: 'Struktur-Gesetze des Repos', file: 'tools/structural-laws.js', gate: true },
  { name: 'isolation', group: 'laws', summary: 'Isolations-Gesetze (Module dürfen nicht wild importieren)', file: 'tools/isolation.js', gate: true },
  { name: 'links', group: 'laws', summary: 'Wikilink-/Pfad-Sonde für Docs', file: 'tools/links.js', gate: true },
  { name: 'terminology', group: 'laws', summary: 'Terminologie-Sonde', file: 'tools/terminology.js', gate: true },
  { name: 'lawcoverage', group: 'laws', summary: 'Meta-Gate: Abdeckung der Gesetze durch Tests', file: 'tools/lawcoverage.js', gate: true },
  { name: 'id-register', group: 'laws', summary: 'ID-Register-Sonde (Ziel: laws/, nicht content/)', file: 'tools/id-register.js', gate: true },

  // Inhalte (Ziel: content/)
  { name: 'adr-check', group: 'content', summary: 'ADR-Format-Check, eigenes CLI (manuell)', file: 'tools/adr-check.js', gate: false },
  { name: 'backlog-sync', group: 'content', summary: 'BACKLOG.md-Übersichtstabelle schreiben oder prüfen (--check)', file: 'tools/backlog-sync.mjs', gate: false },
  { name: 'test-dossier', group: 'content', summary: 'docs/30-meta/TEST-DOSSIER.md schreiben oder prüfen (--check)', file: 'tools/test-dossier.mjs', gate: false },
  { name: 'build_plz_data', group: 'content', summary: 'PLZ-Stammdaten bauen (Quartals-Workflow, --download/--neu)', file: 'tools/build_plz_data.mjs', gate: false },
  { name: 'build_grosskunden_columnar', group: 'content', summary: 'Grosskunden-Spaltenformat bauen (CI-Schritt)', file: 'tools/build_grosskunden_columnar.mjs', gate: false },
  { name: 'query_chrome_feature', group: 'content', summary: 'Chrome-Feature-Verfügbarkeit abfragen', file: 'tools/query_chrome_feature.mjs', gate: false },

  // Tests
  { name: 'test-runner', group: 'test', summary: 'SHIM → tools/runtime/runner.mjs (npm test, CI, Wegweiser)', file: 'tools/test-runner.mjs', gate: true, status: 'shim' },

  // Einmal-/Altlasten (Ziel: Archiv bzw. oneoff/)
  { name: 'check-feature', group: 'oneoff', summary: 'TOT: kein Aufrufer, installiert zur Laufzeit npm-Pakete', file: 'tools/check-feature.js', gate: false, status: 'archivkandidat' },
  { name: 'og-image', group: 'oneoff', summary: 'Einmaliger OG-Image-Generator (kein Aufrufer, Port 8099)', file: 'tools/og-image.mjs', gate: false, status: 'einmalig' },
  { name: 'seeder-diff', group: 'oneoff', summary: 'Einmal-Differenztest batch/05 — wird archiviert (Blueprint K5)', file: 'tools/seeder-diff.mjs', gate: false, status: 'archivkandidat' },
];

/**
 * Jede Skript-Datei, die der Katalog nicht kennt, landet als `sonstiges`
 * in der Landkarte. So kann das Manifest nicht still veralten (`tools --json`).
 */
function ergaenzeUnbekannte(eintraege) {
  let dateien = [];
  try {
    dateien = readdirSync(path.join(REPO_ROOT, 'tools')).filter((f) =>
      /\.(js|mjs|sh)$/.test(f),
    );
  } catch {
    return eintraege;
  }
  const bekannt = new Set(eintraege.map((e) => path.basename(e.file)));
  const fehlend = dateien
    .filter((f) => !bekannt.has(f))
    .sort()
    .map((f) => ({
      name: path.basename(f).replace(/\.(js|mjs|sh)$/, ''),
      group: 'sonstiges',
      summary: 'nicht katalogisiert — bitte in tools/din.mjs ergänzen',
      file: `tools/${f}`,
      gate: false,
      status: 'unbekannt',
    }));
  return [...eintraege, ...fehlend];
}

/* ------------------------------------------------------------------ Delegation */

/**
 * Startet ein bestehendes Skript als Kindprozess und übernimmt dessen Exit-Code.
 * `stdio: 'inherit'` ist Absicht: `dev live` und Messungen bleiben interaktiv.
 */
function delegiere(programm, argumente) {
  const ergebnis = spawnSync(programm, argumente, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (ergebnis.error) {
    console.error(`din: Kindprozess fehlgeschlagen: ${programm}`);
    console.error(`     ${ergebnis.error.message}`);
    return 2;
  }
  if (typeof ergebnis.status === 'number') return ergebnis.status;
  // Signal (z. B. Ctrl+C): 128+n ist die Shell-Konvention.
  return 128 + (ergebnis.signal ? 1 : 0);
}

const nodeSkript = (relativ, argumente) =>
  delegiere(process.execPath, [path.join(REPO_ROOT, relativ), ...argumente]);

const bashSkript = (relativ, argumente) =>
  delegiere('bash', [path.join(REPO_ROOT, relativ), ...argumente]);

/* ------------------------------------------------------------------ Hilfe */

const BEREICHE = [
  [
    'test',
    'Unit- + Korpus-Tests (headless Chromium, test/index.html)',
    'din test [--json] [--filter=X] [--allow-missing-browser]',
  ],
  [
    'fitness',
    'Fitness-Gate + Score (build_db) oder nur Regeln (Pre-Commit)',
    'din fitness [-q] [--only-rules]',
  ],
  [
    'dev',
    'Dev-Server 8088 + Debug-Browser CDP 9222',
    'din dev start|stop|status|live|key [--vanilla]',
  ],
  [
    'measure',
    'Geometrie, Druck, PDF, TTC, Testbrief messen',
    'din measure sheet|print|pdf|brief|ttc|pixel [flags]',
  ],
  [
    'data',
    'Daten-Pipelines (PLZ, Grosskunden)',
    'din data plz [--download|--neu] | din data grosskunden',
  ],
  [
    'docs',
    'Doku-Sync: Backlog, Test-Dossier, Struktur-Index',
    'din docs backlog|tests|index [--check]',
  ],
  [
    'tools',
    'Vollständige Werkzeug-Landkarte (für LLMs)',
    'din tools [--json]',
  ],
];

const UNTERBEFEHLE = {
  measure: [
    ['sheet', 'Bildschirm-Geometrie numerisch (mess.mjs)', 'din measure sheet [ids…]'],
    ['print', 'Dieselben Werte in Druck-Emulation', 'din measure print [url] [breite]'],
    ['pdf', 'PDF-Wahrheit: Seiten/yMax/Unterrand', 'din measure pdf --saetze 42 [--rand-u 30] [--json]'],
    ['brief', 'Testbrief-Generator ohne Browser', 'din measure brief -n 50 [-q] [--json]'],
    ['ttc', 'Paint-/TTC-Timing über CDP', 'din measure ttc --runs 30 --profile all'],
    ['pixel', '4 Referenzbriefe als PDF (Pixel-Diff)', 'din measure pixel <zielordner>'],
  ],
  dev: [
    ['start', 'Server + Debug-Browser neu starten (Default)', 'din dev start'],
    ['stop', 'Server, Live-Kanal und Debug-Browser stoppen', 'din dev stop'],
    ['status', 'Ports, Prozesse, Tabs zeigen', 'din dev status'],
    ['live', 'MCP-Live-Kanal im Vordergrund (stdio direkt)', 'din dev live'],
    ['key', 'Geoapify-Key in den Debug-Browser legen', 'din dev key'],
  ],
  data: [
    ['plz', 'PLZ-Stammdaten bauen', 'din data plz [--download|--neu]'],
    ['grosskunden', 'Grosskunden-Spaltenformat bauen', 'din data grosskunden'],
  ],
  docs: [
    ['backlog', 'BACKLOG.md-Tabelle synchronisieren/ prüfen', 'din docs backlog [--check]'],
    ['tests', 'TEST-DOSSIER.md schreiben/ prüfen', 'din docs tests [--check]'],
    ['index', 'docs/STRUCTURE.md + Fitness-Score erzeugen', 'din docs index'],
  ],
  tools: [
    ['--json', 'Landkarte als JSON', 'din tools --json'],
    ['', 'Landkarte als Tabelle (Default)', 'din tools'],
  ],
};

function hilfe(bereich) {
  const zeilen = [];
  if (bereich && UNTERBEFEHLE[bereich]) {
    zeilen.push(`din ${bereich} — Unterbefehle`, '');
    for (const [name, text, beispiel] of UNTERBEFEHLE[bereich]) {
      zeilen.push(`  ${(name || '(default)').padEnd(12)} ${text}`);
      zeilen.push(`  ${''.padEnd(12)} → ${beispiel}`, '');
    }
    zeilen.push('Details: din --help');
    console.log(zeilen.join('\n'));
    return 0;
  }
  if (bereich && BEREICHE.some(([n]) => n === bereich)) {
    const [, text, beispiel] = BEREICHE.find(([n]) => n === bereich);
    console.log(
      [
        `din ${bereich} — ${text}`,
        '',
        `Aufruf: ${beispiel}`,
        'Flags werden unverändert an das Kindskript weitergegeben.',
        'Übersicht: din --help',
      ].join('\n'),
    );
    return 0;
  }
  if (bereich) {
    console.error(`din: unbekannter Bereich "${bereich}".`);
    console.error('Bekannt: ' + BEREICHE.map(([n]) => n).join(', '));
    return 2;
  }
  zeilen.push(
    'din — ein Einstiegspunkt für tools/ (DIN-BriefNEO)',
    '',
    'Aufruf:',
    '  din <bereich> [befehl] [flags] [--] [argumente an das kindskript]',
    '',
    'Bereiche:',
  );
  for (const [name, text, beispiel] of BEREICHE) {
    zeilen.push(`  ${name.padEnd(9)} ${text}`, `  ${''.padEnd(9)} → ${beispiel}`);
  }
  zeilen.push(
    '',
    'Beispiele:',
    '  din                        dieser Hilfe-Baum',
    '  din dev                    Server 8088 + Browser CDP 9222',
    '  din dev live               MCP-Live-Kanal im Vordergrund',
    '  din test                   Unit-Tests (430 Fälle)',
    '  din fitness                Fitness-Gate, muss 100.0 % sein',
    '  din fitness --only-rules   nur Antipattern-Regeln (Pre-Commit)',
    '  din measure pdf --saetze 42 --json',
    '  din tools --json           Maschinenlesbare Werkzeug-Landkarte',
    '',
    'Regeln:',
    '  • din ist nur Routing: jeder Befehl startet das bestehende Skript',
    '    als Kindprozess mit stdio: inherit (kein Import, keine Kopie).',
    '  • Unbekannte Flags gehen unverändert an das Kindskript.',
    '  • Exit-Codes: 0 ok · 1 Gate/Test rot · 2 Aufruf-/Vorbedingung · 3 IO/Render',
    '',
    `Repo: ${REPO_ROOT}`,
  );
  console.log(zeilen.join('\n'));
  return 0;
}

/* ------------------------------------------------------------------ Landkarte */

function landkarte(alsJson) {
  const eintraege = ergaenzeUnbekannte(WERKZEUGE).map((e) => ({
    name: e.name,
    group: e.group,
    summary: e.summary,
    file: e.file,
    gate: e.gate,
    entry: e.file.endsWith('.sh')
      ? `bash ${e.file}`
      : `node ${e.file}`,
    ...(e.status ? { status: e.status } : {}),
  }));

  if (alsJson) {
    console.log(
      JSON.stringify(
        {
          repo: 'din-briefneo',
          generatedBy: 'tools/din.mjs',
          root: REPO_ROOT,
          count: eintraege.length,
          groups: [...new Set(eintraege.map((e) => e.group))],
          tools: eintraege,
        },
        null,
        2,
      ),
    );
    return 0;
  }

  const gruppenTitel = {
    meta: 'META',
    runtime: 'LAUFZEIT',
    dev: 'DEV / RUNTIME',
    measure: 'MESSEN',
    fitness: 'FITNESS',
    laws: 'GESETZE',
    content: 'INHALTE',
    test: 'TESTS',
    oneoff: 'EINMAL / ARCHIV',
    sonstiges: 'NICHT KATALOGISIERT',
  };
  const zeilen = [`Werkzeug-Landkarte (${eintraege.length} Skripte in tools/)`];
  const rang = {
    meta: 0,
    runtime: 1,
    dev: 2,
    measure: 3,
    fitness: 4,
    laws: 5,
    content: 6,
    test: 7,
    oneoff: 8,
    sonstiges: 9,
  };
  const sortiert = [...eintraege].sort(
    (a, b) => (rang[a.group] ?? 9) - (rang[b.group] ?? 9) || a.file.localeCompare(b.file),
  );
  let letzteGruppe = '';
  for (const e of sortiert) {
    if (e.group !== letzteGruppe) {
      zeilen.push('', `${gruppenTitel[e.group] ?? e.group.toUpperCase()}`);
      letzteGruppe = e.group;
    }
    const gate = e.gate ? '⛨' : ' ';
    const status = e.status ? ` [${e.status}]` : '';
    zeilen.push(`  ${gate} ${e.file.padEnd(44)}${e.summary}${status}`);
  }
  zeilen.push('', 'Legende: ⛨ = Teil eines Gates (CI, Hook oder Test).');
  console.log(zeilen.join('\n'));
  return 0;
}

/* ------------------------------------------------------------------ Dispatch */

function unbekannt(was, bereich, wert) {
  console.error(`din: unbekannt ${was}${wert ? ` "${wert}"` : ''}.`);
  if (bereich && UNTERBEFEHLE[bereich]) {
    const namen = UNTERBEFEHLE[bereich].map(([n]) => n || '(default)').join(', ');
    console.error(`     Bekannt: ${namen}`);
  } else {
    console.error(`     Bekannt: ${BEREICHE.map(([n]) => n).join(', ')}`);
  }
  console.error('     Hilfe: din --help');
  return 2;
}

function main(argv) {
  const bereich = argv[0];
  const rest = argv.slice(1);

  if (!bereich || bereich === 'help' || bereich === '-h' || bereich === '--help') {
    return hilfe(bereich === 'help' ? rest[0] : undefined);
  }
  if (rest.includes('-h') || rest.includes('--help')) {
    return hilfe(bereich);
  }

  switch (bereich) {
    case 'test':
      return nodeSkript('tools/test-runner.mjs', rest);

    case 'fitness': {
      const nurRegeln =
        rest.includes('--only-rules') || rest[0] === 'rules';
      if (nurRegeln) {
        const weiter = rest.filter((a) => a !== '--only-rules' && a !== 'rules');
        return nodeSkript('tools/reconciliation.js', ['--only-rules', ...weiter]);
      }
      const still = rest.includes('-q') || rest.includes('--quiet');
      const weiter = rest.filter((a) => a !== '-q' && a !== '--quiet');
      return nodeSkript('tools/build_db.js', [...(still ? ['-q'] : []), ...weiter]);
    }

    case 'dev': {
      // dev.sh liest seinen Unterbefehl als erstes Argument (Default: start),
      // kennt zusätzlich mess/--vanilla/help — also unverändert durchreichen.
      // `live` erbt stdin/stdout/stderr direkt (stdio: inherit) und bleibt
      // damit ein echter Vordergrundprozess (Ctrl+C erreicht das Kind).
      return bashSkript('tools/dev.sh', rest);
    }

    case 'measure': {
      const unter = rest[0];
      const weiter = rest.slice(1);
      const ziel = {
        sheet: 'tools/mess.mjs',
        print: 'tools/mess-print.mjs',
        pdf: 'tools/print-messung.mjs',
        brief: 'tools/testbrief-messung.mjs',
        ttc: 'tools/paint-probe.mjs',
        pixel: 'tools/druck-pixel.mjs',
      }[unter];
      if (!ziel) return unbekannt('Unterbefehl', 'measure', unter);
      return nodeSkript(ziel, weiter);
    }

    case 'data': {
      const unter = rest[0];
      const weite = rest.slice(1);
      if (unter === 'plz') return nodeSkript('tools/build_plz_data.mjs', weite);
      if (unter === 'grosskunden')
        return nodeSkript('tools/build_grosskunden_columnar.mjs', weite);
      return unbekannt('Unterbefehl', 'data', unter);
    }

    case 'docs': {
      const unter = rest[0];
      const weite = rest.slice(1);
      if (unter === 'backlog') return nodeSkript('tools/backlog-sync.mjs', weite);
      if (unter === 'tests') return nodeSkript('tools/test-dossier.mjs', weite);
      if (unter === 'index') return nodeSkript('tools/build_db.js', ['-q', ...weite]);
      return unbekannt('Unterbefehl', 'docs', unter);
    }

    case 'tools':
      return landkarte(rest.includes('--json'));

    default:
      return unbekannt('Bereich', null, bereich);
  }
}

process.exitCode = main(process.argv.slice(2));
