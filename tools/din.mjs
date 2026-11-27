#!/usr/bin/env node
/**
 * tools/din.mjs — der eine Einstiegspunkt für `tools/` (DIN-BriefNEO).
 *
 * Warum: ein Agent musste bisher Dutzende Dateinamen kennen; hier gibt es einen
 * klaren Hilfe-Baum und ein Manifest (`din tools --json`) — kein Raten.
 *
 * Architektur:
 *   din.mjs delegiert als Kindprozess an die 5 großen Deep Modules:
 *   1. tools/runtime.mjs  (Server, Browser, CDP, Tests, Live-Kanal)
 *   2. tools/measure.mjs  (Geometrie, Druck, PDF-Wahrheit, TTC, Testbrief)
 *   3. tools/laws.mjs     (Verfassungs- & Architektur-Sonden)
 *   4. tools/fitness.mjs  (Fitness Gate, Reality Reconciliation, Wegweiser)
 *   5. tools/content.mjs  (PLZ, Grosskunden, Backlog, Tests, Feature, ADR)
 *   Plus: tools/dev.sh (Starter) und tools/fonts/subset_fonts.py.
 *
 * stdio wird direkt durchgereicht (`stdio: 'inherit'`), damit `dev live`
 * und interaktive Messungen unverändert funktionieren.
 *
 * Aufruf: node tools/din.mjs [bereich] [befehl] [flags] [--] [argumente]
 * Exit:   0 ok · 1 Gate/Test rot · 2 Aufruf-/Vorbedingungsfehler · 3 IO/Render
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
 * Werkzeug-Landkarte der 5 Deep Modules + Hilfswerkzeuge.
 * @type {{ name: string, group: string, summary: string, file: string, gate: boolean, status?: string }[]}
 */
const WERKZEUGE = [
  // Meta
  { name: 'din', group: 'meta', summary: 'Dieser Einstiegspunkt: Routing, Hilfe-Baum, Werkzeug-Landkarte', file: 'tools/din.mjs', gate: false },

  // Laufzeit-Modul
  { name: 'runtime', group: 'runtime', summary: 'Deep Module: Server (Port 8088), Headless Browser, CDP, Runner, MCP-Live, Debug-Session', file: 'tools/runtime.mjs', gate: true },

  // Dev-Starter
  { name: 'dev', group: 'dev', summary: 'Dev-Starter: Server 8088 + Debug-Browser (CDP 9222): start|stop|status|live|key', file: 'tools/dev.sh', gate: false },

  // Messen
  { name: 'measure', group: 'measure', summary: 'Deep Module: Bildschirm-, Druck- & PDF-Geometrie, TTC-Timing, Testbriefe & Pixel-Diffs', file: 'tools/measure.mjs', gate: true },

  // Fitness
  { name: 'fitness', group: 'fitness', summary: 'Deep Module: Reality Reconciliation Score-Engine, Wegweiser-Gate & docs/STRUCTURE.md', file: 'tools/fitness.mjs', gate: true },

  // Gesetze
  { name: 'laws', group: 'laws', summary: 'Deep Module: 7 Verfassungs-Sonden (IMR, Struktur, Isolation, Links, Terme, Abdeckung, IDs)', file: 'tools/laws.mjs', gate: true },

  // Inhalte
  { name: 'content', group: 'content', summary: 'Deep Module: Columnar-PLZ & Grosskunden, Backlog-Sync, Test-Dossier, Chrome-Feature, ADR-Check', file: 'tools/content.mjs', gate: false },

  // Schriften
  { name: 'fonts', group: 'fonts', summary: 'DIN-5008-Font-Subsetting (Inter → website/fonts; lokale Testschriften)', file: 'tools/fonts/subset_fonts.py', gate: false },
];

/**
 * Jede Skript-Datei, die der Katalog nicht kennt, landet als `sonstiges`
 * in der Landkarte. So kann das Manifest nicht still veralten (`tools --json`).
 */
function ergaenzeUnbekannte(eintraege) {
  let dateien = [];
  try {
    dateien = readdirSync(path.join(REPO_ROOT, 'tools')).filter((f) =>
      /\.(js|mjs|sh|py)$/.test(f),
    );
  } catch {
    return eintraege;
  }
  const bekannt = new Set(eintraege.map((e) => path.basename(e.file)));
  const fehlend = dateien
    .filter((f) => !bekannt.has(f))
    .sort()
    .map((f) => ({
      name: path.basename(f).replace(/\.(js|mjs|sh|py)$/, ''),
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
    'din fitness [-q] [--only-rules] [repo-map]',
  ],
  [
    'laws',
    'Gesetzes-Sonden: IMR, Struktur, Isolation, Links, Terme, Abdeckung, IDs',
    'din laws [all|imr|structure|isolation|links|terms|coverage|ids]',
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
    'content',
    'Inhalts-Werkzeuge direkt: Chrome-Feature, ADR-Check',
    'din content feature <begriff> | din content adr [--json]',
  ],
  [
    'tools',
    'Vollständige Werkzeug-Landkarte (für LLMs)',
    'din tools [--json]',
  ],
];

const UNTERBEFEHLE = {
  measure: [
    ['sheet', 'Bildschirm-Geometrie numerisch (measureSheet)', 'din measure sheet [ids…]'],
    ['print', 'Dieselben Werte in Druck-Emulation (measurePrint)', 'din measure print [url] [breite]'],
    ['pdf', 'PDF-Wahrheit: Seiten/yMax/Unterrand (measurePdf)', 'din measure pdf --saetze 42 [--rand-u 30] [--json]'],
    ['brief', 'Testbrief-Generator ohne Browser (measureBrief)', 'din measure brief -n 50 [-q] [--json]'],
    ['ttc', 'Paint-/TTC-Timing über CDP (probeTtc)', 'din measure ttc --runs 30 --profile all'],
    ['pixel', '4 Referenzbriefe als PDF (diffPixels)', 'din measure pixel <zielordner>'],
  ],
  dev: [
    ['start', 'Server + Debug-Browser neu starten (Default)', 'din dev start'],
    ['stop', 'Server, Live-Kanal und Debug-Browser stoppen', 'din dev stop'],
    ['status', 'Ports, Prozesse, Tabs zeigen', 'din dev status'],
    ['live', 'MCP-Live-Kanal im Vordergrund (stdio direkt)', 'din dev live'],
    ['key', 'Geoapify-Key in den Debug-Browser legen', 'din dev key'],
  ],
  data: [
    ['plz', 'PLZ-Stammdaten bauen (Columnar)', 'din data plz [--download|--neu]'],
    ['grosskunden', 'Grosskunden-Spaltenformat bauen', 'din data grosskunden'],
  ],
  docs: [
    ['backlog', 'BACKLOG.md-Tabelle synchronisieren/ prüfen', 'din docs backlog [--check]'],
    ['tests', 'TEST-DOSSIER.md schreiben/ prüfen', 'din docs tests [--check]'],
    ['index', 'docs/STRUCTURE.md + Fitness-Score erzeugen', 'din docs index'],
  ],
  content: [
    ['feature', 'Chrome-Feature-Status abfragen (chromestatus.com)', 'din content feature popover'],
    ['adr', 'ADR-Drift-Check: Bijektion, Annotationen, Zähler', 'din content adr [--json]'],
  ],
  tools: [
    ['--json', 'Landkarte als JSON', 'din tools --json'],
    ['', 'Landkarte als Tabelle (Default)', 'din tools'],
  ],
  laws: [
    ['', 'Alle Sonden (Default)', 'din laws'],
    ['imr', 'IMR-Registry + Geometrie', 'din laws imr'],
    ['structure', 'Strukturgesetze (A42, A57, A58, A24, A59)', 'din laws structure'],
    ['isolation', 'Hermetik-Gate website/ (A45)', 'din laws isolation'],
    ['links', 'Wikilinks + Frontmatter-Links', 'din laws links'],
    ['terms', 'Terminologie gegen glossary.md', 'din laws terms'],
    ['coverage', 'Meta-Gate: Gesetzes-Abdeckung', 'din laws coverage'],
    ['ids', 'ID-Register (B-Referenzen, Präfixe)', 'din laws ids'],
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
    '  • din delegiert an die 5 konsolidierten Deep Modules in tools/.',
    '  • Unbekannte Flags gehen unverändert an das Modul weiter.',
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
      : e.file.endsWith('.py')
        ? `python3 ${e.file}`
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
    runtime: 'LAUFZEIT (tools/runtime.mjs)',
    dev: 'DEV-STARTER (tools/dev.sh)',
    measure: 'MESSEN (tools/measure.mjs)',
    fitness: 'FITNESS (tools/fitness.mjs)',
    laws: 'GESETZE (tools/laws.mjs)',
    content: 'INHALTE (tools/content.mjs)',
    fonts: 'SCHRIFTEN (tools/fonts/)',
    test: 'TESTS',
    sonstiges: 'NICHT KATALOGISIERT',
  };
  const zeilen = [`Werkzeug-Landkarte (${eintraege.length} Werkzeuge in tools/)`];
  const rang = {
    meta: 0,
    runtime: 1,
    dev: 2,
    measure: 3,
    fitness: 4,
    laws: 5,
    content: 6,
    fonts: 7,
    test: 8,
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
    zeilen.push(`  ${gate} ${e.file.padEnd(32)}${e.summary}${status}`);
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
      return nodeSkript('tools/runtime.mjs', ['test', ...rest]);

    case 'fitness':
      return nodeSkript('tools/fitness.mjs', rest);

    case 'laws':
      return nodeSkript('tools/laws.mjs', rest);

    case 'dev':
      return bashSkript('tools/dev.sh', rest);

    case 'measure':
      return nodeSkript('tools/measure.mjs', rest);

    case 'data':
      return nodeSkript('tools/content.mjs', rest);

    case 'docs': {
      const unter = rest[0];
      const weite = rest.slice(1);
      if (unter === 'backlog') return nodeSkript('tools/content.mjs', ['backlog', ...weite]);
      if (unter === 'tests') return nodeSkript('tools/content.mjs', ['tests', ...weite]);
      if (unter === 'index') return nodeSkript('tools/fitness.mjs', ['-q', ...weite]);
      return unbekannt('Unterbefehl', 'docs', unter);
    }

    case 'content':
      return nodeSkript('tools/content.mjs', rest);

    case 'tools':
      return landkarte(rest.includes('--json'));

    default:
      return unbekannt('Bereich', null, bereich);
  }
}

process.exitCode = main(process.argv.slice(2));
