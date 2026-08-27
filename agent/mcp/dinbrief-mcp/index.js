#!/usr/bin/env node
/**
 * dinbrief-mcp — duenner MCP-Server fuer DIN-BriefNEO
 * ====================================================
 * Lauf 2, zweite Ausbaustufe: drei Operationen.
 * Herkunft: ChatGPT-Brainstorm "Repo Struktur Refactoring" (Antwort 9,
 * Prioritaet 5 von 5).
 *
 * Dieser Server exponiert NUR, er implementiert nicht neu:
 * - repository.inspect   liest repository.yaml und gibt die Struktur zurueck
 * - repository.validate  ruft tools/reconciliation.js auf (bestehendes Fitness Gate)
 * - repository.execute   fuehrt EINE aus einer festen Allowlist bekannter,
 *                         bereits existierender Pipeline-Schritte aus
 *
 * Bewusst NICHT enthalten (Ponytail-Leiter Schritt 5 beachtet: bevor eine
 * eigene MCP-SDK-Abhaengigkeit gezogen wird, erst pruefen ob das Protokoll
 * einfach genug ist, es ohne SDK zu implementieren):
 * - kein externes MCP-SDK-Paket, reines Node core + STDIO-JSON-RPC-Minimalimplementierung
 * - keine freie Codeausfuehrung -- repository.execute kennt NUR die Aktionen
 *   in der ACTIONS-Registry unten, kein beliebiger Shell-Befehl ist erreichbar
 *
 * Plan -> Execute -> Verify (siehe docs/30-meta/tool-result-vocabulary.md):
 * repository.execute verlangt IMMER zuerst einen Aufruf mit {"plan": true},
 * der nur eine Vorschau liefert und NICHTS veraendert (status: "unchanged").
 * Diese Vorschau liefert eine plan_id zurueck, gebunden an einen Hash der
 * von der Aktion betroffenen Dateien. Erst ein zweiter Aufruf MIT dieser
 * plan_id fuehrt die Aktion wirklich aus -- und nur, wenn der Hash seither
 * unveraendert ist (siehe "Plan-Bindung" unten). Ein execute-Aufruf OHNE
 * gueltige plan_id wird abgelehnt (status: "blocked"). Nach Ausfuehrung
 * ruft der Server automatisch repository.validate auf (verify-Schritt) --
 * das Ergebnis der Ausfuehrung enthaelt den Fitness Score direkt mit,
 * damit nie eine Ausfuehrung ohne Verifikation zurueckgegeben wird.
 *
 * Plan-Bindung (seit Lauf 2, Nachbesserung nach externem Review):
 * Vorher konnte "execute" ohne vorherigen "plan"-Aufruf ausgefuehrt werden
 * -- die Doku sagte "zwingend", der Code erzwang es nicht. Gefunden bei
 * einer externen Ist-Pruefung (ChatGPT, 2026-08-27, siehe repository.yaml
 * open_items "plan-execute-verify-zustandslos"). Jetzt: plan_id + Hash der
 * betroffenen Dateien werden unter .agents/cache/plans/<plan_id>.json
 * abgelegt (Ablage ausserhalb von git, siehe .gitignore), TTL 10 Minuten,
 * Single-Use (Plan wird nach erfolgreicher Pruefung geloescht -- kein
 * Replay eines alten Plans moeglich). execute prueft: Plan existiert,
 * nicht abgelaufen, gleiche Aktion, Datei-Hash unveraendert seit dem Plan.
 * Nur bei allen vier Bedingungen wird ausgefuehrt.
 *
 * Intent-Verification (Nachbesserung nach Architecture Drift Audit,
 * 2026-08-27): Verify pruefte bisher AUSSCHLIESSLICH den Fitness Score --
 * nicht ob die Aktion ihr eigentliches Ziel erreicht hat (z.B. wurde
 * build/LLM_CONTEXT.md bei "regenerate-llm-context" tatsaechlich neu
 * geschrieben?). Jede ACTIONS-Aktion hat jetzt ein outputPath-Feld; vor
 * und nach run() wird dessen Hash verglichen. Nur wenn sich der Output
 * tatsaechlich geaendert hat (oder die Aktion als nicht-output-aendernd
 * markiert ist), gilt der Intent als erreicht -- das Ergebnis landet in
 * data.verify.intent, zusaetzlich zum weiterhin gepruefeten Fitness Score.
 * Der erzeugte/veraenderte Output-Pfad wird ausserdem in artifacts
 * eingetragen (vorher immer leer, siehe "Ephemer vs. persistent" in
 * docs/30-meta/tool-result-vocabulary.md).
 *
 * Result-Schema und Vokabular: siehe docs/30-meta/tool-result-vocabulary.md
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const readline = require('readline');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const REPOSITORY_YAML = path.join(REPO_ROOT, 'repository.yaml');
const PLAN_DIR = path.join(REPO_ROOT, '.agents', 'cache', 'plans');
const PLAN_TTL_MS = 10 * 60 * 1000; // 10 Minuten -- lang genug zum Nachdenken, kurz genug gegen veraltete Plaene

// --- Minimaler YAML-Reader ---------------------------------------------
// repository.yaml ist absichtlich einfach strukturiert (kein Multi-Doc,
// keine Anker/Referenzen). Statt einer externen YAML-Dependency zu ziehen
// (Ponytail-Frage 5: "gibt es bereits eine Dependency dafuer?" -> nein
// noetig fuer diesen begrenzten Anwendungsfall), wird hier bewusst nur so
// viel geparst wie fuer repository.inspect gebraucht wird: eine flache
// Zeilen-basierte Extraktion der Top-Level- und Zweitebene-Skalarwerte.
// Bei wachsender YAML-Komplexitaet: an dieser Stelle auf eine echte
// YAML-Bibliothek wechseln, nicht den Parser hier weiter aufblaehen.
function readRepositoryYamlRaw() {
  if (!fs.existsSync(REPOSITORY_YAML)) {
    throw new Error(`repository.yaml nicht gefunden unter ${REPOSITORY_YAML}`);
  }
  return fs.readFileSync(REPOSITORY_YAML, 'utf-8');
}

function makeResult({ operation, status, summary, data = {}, artifacts = [], warnings = [], errors = [], startedAt }) {
  return {
    operation,
    status,
    summary,
    data,
    artifacts,
    warnings,
    errors,
    metadata: {
      tool: 'agent/mcp/dinbrief-mcp/index.js',
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startedAt
    }
  };
}

// --- repository.inspect --------------------------------------------------
function repositoryInspect() {
  const startedAt = Date.now();
  try {
    const raw = readRepositoryYamlRaw();
    return makeResult({
      operation: 'inspect',
      status: 'ok',
      summary: 'repository.yaml gelesen und als Rohtext zurueckgegeben.',
      data: { path: REPOSITORY_YAML, raw },
      startedAt
    });
  } catch (err) {
    return makeResult({
      operation: 'inspect',
      status: 'blocked',
      summary: `repository.yaml konnte nicht gelesen werden: ${err.message}`,
      errors: [err.message],
      startedAt
    });
  }
}

// --- repository.validate --------------------------------------------------
// Ruft das bestehende Fitness Gate auf, statt es neu zu implementieren.
// tools/reconciliation.js exportiert bereits eine aufrufbare Funktion
// (siehe tools/build_db.js, das denselben Weg nutzt).
function repositoryValidate() {
  const startedAt = Date.now();
  try {
    const { runReconciliation } = require(path.join(REPO_ROOT, 'tools', 'reconciliation.js'));
    const result = runReconciliation();
    const status = result.success ? (result.score === 100 ? 'ok' : 'warning') : 'failed';
    return makeResult({
      operation: 'validate',
      status,
      summary: `Fitness Score: ${result.score}% (metadata ${result.dimensions.metadata}%, coherence ${result.dimensions.coherence}%, conformance ${result.dimensions.conformance}%, features ${result.dimensions.features}%)`,
      data: result,
      warnings: (result.logs || []).filter(l => l.severity === 'medium' || l.severity === 'low'),
      errors: (result.logs || []).filter(l => l.severity === 'critical' || l.severity === 'high'),
      startedAt
    });
  } catch (err) {
    return makeResult({
      operation: 'validate',
      status: 'blocked',
      summary: `Fitness Gate konnte nicht ausgefuehrt werden: ${err.message}`,
      errors: [err.message],
      startedAt
    });
  }
}

// --- repository.execute ----------------------------------------------------
// Feste Allowlist bekannter, bereits existierender Aktionen. KEINE freie
// Codeausfuehrung -- jede Aktion ruft ein Tool auf, das es in tools/ schon
// gibt (siehe docs/30-meta/tooling-overview.md). Neue Aktionen werden hier
// bewusst manuell ergaenzt, nie dynamisch aus Nutzereingaben konstruiert.
//
// affectedPaths: Dateien/Ordner, die diese Aktion liest bzw. deren Inhalt
// das Ergebnis beeinflusst. Wird fuer die Plan-Bindung gehasht (siehe
// unten) -- bewusst NICHT das ganze Repo, sonst wuerde jede beliebige
// Aenderung irgendwo im Projekt jeden offenen Plan ungueltig machen, auch
// wenn sie mit der Aktion nichts zu tun hat.
// outputPath: die Datei, die diese Aktion erzeugt/aktualisiert -- wird
// (a) nach erfolgreicher Ausfuehrung in data.artifacts eingetragen und
// (b) fuer die Intent-Verification vor/nach run() gehasht (siehe oben).
// run-fitness-gate schreibt zwei Dateien (import.sql, Code-Referenzen.md);
// import.sql als Haupt-Output gewaehlt, da es das direkte, unmittelbare
// Ergebnis von build_db.js ist (Code-Referenzen.md wird nur bei
// vorhandenen code_links-Frontmatter-Eintraegen aktualisiert, ist also
// nicht bei jedem Lauf garantiert unterschiedlich).
const ACTIONS = {
  'run-fitness-gate': {
    description: 'Fuehrt tools/build_db.js aus (Fitness Gate + Traceability-Build). Entspricht Schritt [3/5] in start.ps1.',
    risk: 'WRITE',
    idempotent: true,
    affectedPaths: ['docs', 'website', 'tools/antipatterns', 'tools/reconciliation.js', 'tools/build_db.js', 'docs/30-meta/schema-v6.json'],
    outputPath: 'build/import.sql',
    run: () => {
      execFileSync('node', ['tools/build_db.js'], { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf-8' });
    }
  },
  'regenerate-llm-context': {
    description: 'Fuehrt tools/create_context.js aus, erzeugt build/LLM_CONTEXT.md neu.',
    risk: 'WRITE',
    idempotent: true,
    affectedPaths: ['README.md', 'docs/index.md', 'AGENTS.md', 'docs/00-foundation', 'tools/create_context.js'],
    outputPath: 'build/LLM_CONTEXT.md',
    run: () => {
      execFileSync('node', ['tools/create_context.js'], { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf-8' });
    }
  }
};

// --- Plan-Bindung ----------------------------------------------------------
// Dateibasiert statt In-Memory: der Server wird pro Aufruf typischerweise
// als neuer Prozess gestartet (siehe README-Beispiele, zwei separate
// `echo ... | node index.js`-Aufrufe) -- ein In-Memory-Store wuerde also
// nichts zwischen plan- und execute-Aufruf binden. Ablage unter
// .agents/cache/plans/ (bereits gitignored, da .agents/ schon in
// .gitignore steht). TTL + Single-Use halten die Datei-Ablage klein und
// verhindern das Ausfuehren veralteter oder bereits verbrauchter Plaene.

function hashPaths(relativePaths) {
  const hasher = crypto.createHash('sha256');
  const files = [];

  for (const rel of relativePaths.slice().sort()) {
    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) continue; // fehlender optionaler Pfad aendert den Hash bewusst nicht
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.isFile()) files.push(full);
        }
      };
      walk(abs);
    } else if (stat.isFile()) {
      files.push(abs);
    }
  }

  for (const f of files.sort()) {
    hasher.update(f);
    hasher.update(fs.readFileSync(f));
  }
  return hasher.digest('hex');
}

// Hash einer einzelnen Datei fuer die Intent-Verification. Getrennt von
// hashPaths() (das ist fuer die Plan-Bindung ueber mehrere Pfade gedacht) --
// hier reicht ein einfacher Hash oder "missing", wenn die Datei (noch)
// nicht existiert, z.B. vor dem allerersten Lauf einer Aktion.
function hashSingleFile(relativePath) {
  const abs = path.join(REPO_ROOT, relativePath);
  if (!fs.existsSync(abs)) return null;
  const hasher = crypto.createHash('sha256');
  hasher.update(fs.readFileSync(abs));
  return hasher.digest('hex');
}

function ensurePlanDir() {
  if (!fs.existsSync(PLAN_DIR)) {
    fs.mkdirSync(PLAN_DIR, { recursive: true });
  }
}

function createPlan(action, actionDef) {
  ensurePlanDir();
  const planId = crypto.randomBytes(16).toString('hex');
  const record = {
    planId,
    action,
    repoHash: hashPaths(actionDef.affectedPaths || []),
    createdAt: Date.now(),
    expiresAt: Date.now() + PLAN_TTL_MS
  };
  fs.writeFileSync(path.join(PLAN_DIR, `${planId}.json`), JSON.stringify(record), 'utf-8');
  return record;
}

// Gibt entweder { ok: true, record } oder { ok: false, reason } zurueck --
// nie wirft, damit repositoryExecute jeden Ablehnungsgrund als klare
// summary/error zurueckgeben kann statt einer rohen Exception.
function consumePlan(planId, action) {
  const planPath = path.join(PLAN_DIR, `${planId}.json`);
  if (!fs.existsSync(planPath)) {
    return { ok: false, reason: `Kein Plan mit dieser plan_id gefunden (unbekannt, bereits verbraucht, oder abgelaufen und aufgeraeumt).` };
  }

  let record;
  try {
    record = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
  } catch (err) {
    fs.unlinkSync(planPath);
    return { ok: false, reason: `Plan-Datei war korrupt und wurde entfernt: ${err.message}` };
  }

  // Single-Use: Plan-Datei wird in jedem Fall entfernt, sobald sie gelesen
  // wurde -- unabhaengig davon, ob die Pruefung unten erfolgreich ist. Ein
  // fehlgeschlagener Versuch verbraucht den Plan bewusst mit (kein Retry
  // mit derselben plan_id gegen einen mittlerweile veralteten Hash).
  fs.unlinkSync(planPath);

  if (Date.now() > record.expiresAt) {
    return { ok: false, reason: `Plan ist abgelaufen (TTL ${PLAN_TTL_MS / 1000}s). Neuen Plan mit plan:true anfordern.` };
  }
  if (record.action !== action) {
    return { ok: false, reason: `Plan wurde fuer Aktion "${record.action}" erstellt, execute wurde aber fuer "${action}" aufgerufen.` };
  }

  const actionDef = ACTIONS[action];
  const currentHash = hashPaths(actionDef.affectedPaths || []);
  if (currentHash !== record.repoHash) {
    return { ok: false, reason: `Repository-Zustand hat sich seit dem Plan geaendert (Hash weicht ab). Neuen Plan anfordern, damit die Vorschau wieder zum aktuellen Stand passt.` };
  }

  return { ok: true, record };
}

function repositoryExecute({ action, plan, planId }) {
  const startedAt = Date.now();

  if (!action || !ACTIONS[action]) {
    return makeResult({
      operation: 'execute',
      status: 'blocked',
      summary: `Unbekannte oder fehlende Aktion "${action}". Verfuegbar: ${Object.keys(ACTIONS).join(', ')}.`,
      errors: [`action muss eine der folgenden sein: ${Object.keys(ACTIONS).join(', ')}`],
      startedAt
    });
  }

  const actionDef = ACTIONS[action];

  // Plan-Schritt: NUR Vorschau, veraendert nichts. Siehe "Plan -> Execute ->
  // Verify" in docs/30-meta/tool-result-vocabulary.md -- eine plan-Anfrage
  // darf niemals gleichzeitig ausfuehren. Liefert eine plan_id zurueck, die
  // an den aktuellen Hash der betroffenen Dateien gebunden ist.
  if (plan) {
    const record = createPlan(action, actionDef);
    return makeResult({
      operation: 'execute',
      status: 'unchanged',
      summary: `Plan-Vorschau fuer "${action}": ${actionDef.description} (Risikoklasse: ${actionDef.risk}, idempotent: ${actionDef.idempotent}). Nichts wurde ausgefuehrt -- fuer die echte Ausfuehrung erneut MIT dieser plan_id aufrufen (gueltig ${PLAN_TTL_MS / 1000}s, einmalig verwendbar).`,
      data: { action, description: actionDef.description, risk: actionDef.risk, idempotent: actionDef.idempotent, wouldExecute: true, plan_id: record.planId, expires_in_seconds: PLAN_TTL_MS / 1000 },
      startedAt
    });
  }

  // Execute-Schritt: verlangt zwingend eine gueltige plan_id aus einem
  // vorherigen plan:true-Aufruf fuer GENAU diese Aktion und GENAU diesen
  // Repo-Zustand. Ohne plan_id oder mit ungueltiger/abgelaufener/
  // nicht-passender plan_id wird abgelehnt -- das ist die technische
  // Haerte, die vorher fehlte (siehe Kommentar am Dateianfang).
  if (!planId) {
    return makeResult({
      operation: 'execute',
      status: 'blocked',
      summary: `Aktion "${action}" abgelehnt: keine plan_id angegeben. Zuerst mit {"operation":"execute","action":"${action}","plan":true} planen, dann die zurueckgegebene plan_id hier mitgeben.`,
      data: { action },
      errors: ['plan_id fehlt -- execute ohne vorherigen plan-Aufruf ist nicht erlaubt.'],
      startedAt
    });
  }

  const planCheck = consumePlan(planId, action);
  if (!planCheck.ok) {
    return makeResult({
      operation: 'execute',
      status: 'blocked',
      summary: `Aktion "${action}" abgelehnt: ${planCheck.reason}`,
      data: { action, plan_id: planId },
      errors: [planCheck.reason],
      startedAt
    });
  }

  // Hash des erwarteten Outputs VOR der Ausfuehrung -- Grundlage fuer die
  // Intent-Verification unten (hat sich der Output tatsaechlich geaendert?).
  const outputHashBefore = actionDef.outputPath ? hashSingleFile(actionDef.outputPath) : null;

  // Execute-Schritt: fuehrt die Aktion tatsaechlich aus.
  try {
    actionDef.run();
  } catch (err) {
    return makeResult({
      operation: 'execute',
      status: 'failed',
      summary: `Aktion "${action}" ist fehlgeschlagen: ${err.message}`,
      data: { action },
      errors: [err.message],
      startedAt
    });
  }

  // Intent-Verification: hat die Aktion ihr eigentliches Ziel erreicht,
  // nicht nur "Fitness Score ist 100%"? Bei Aktionen mit outputPath wird
  // geprueft, ob sich der Output-Hash tatsaechlich geaendert hat (oder neu
  // entstanden ist, falls er vorher fehlte). Das ist ein Minimal-Check --
  // beweist nur "etwas hat sich geaendert", nicht "die Aenderung ist
  // inhaltlich korrekt" (das bleibt weiterhin Aufgabe des Fitness Gate).
  let intentResult = null;
  if (actionDef.outputPath) {
    const outputHashAfter = hashSingleFile(actionDef.outputPath);
    const changed = outputHashAfter !== null && outputHashAfter !== outputHashBefore;
    intentResult = {
      output_path: actionDef.outputPath,
      changed,
      summary: changed
        ? `${actionDef.outputPath} wurde tatsaechlich veraendert.`
        : outputHashAfter === null
          ? `${actionDef.outputPath} existiert auch nach der Ausfuehrung nicht -- Aktion hat ihr Ziel nicht erreicht.`
          : `${actionDef.outputPath} ist nach der Ausfuehrung UNVERAENDERT -- Aktion hat inhaltlich nichts bewirkt (Hash identisch zu vorher).`
    };
  }

  // Verify-Schritt: IMMER direkt nach execute, automatisch, nicht optional.
  // Das Ergebnis wird mit zurueckgegeben, damit ein Aufrufer nie eine
  // Ausfuehrung ohne Verifikationsergebnis erhaelt. Fitness Score UND (wo
  // anwendbar) Intent-Verification muessen beide stimmen, damit status
  // "changed" wird -- ein unveraenderter Output bei WRITE-Risikoklasse ist
  // ein Warnsignal, auch wenn der Fitness Score weiterhin 100% ist.
  const verifyResult = repositoryValidate();
  const fitnessOk = verifyResult.status === 'ok';
  const intentOk = intentResult === null || intentResult.changed;
  const status = (fitnessOk && intentOk) ? 'changed' : 'warning';

  const warnings = [];
  if (!fitnessOk) {
    warnings.push(`Verify nach Ausfuehrung meldet Status "${verifyResult.status}" statt "ok" -- pruefen vor weiteren Aenderungen.`);
  }
  if (intentResult && !intentResult.changed) {
    warnings.push(`Intent-Verification: ${intentResult.summary}`);
  }

  return makeResult({
    operation: 'execute',
    status,
    summary: `Aktion "${action}" ausgefuehrt. Verify (Fitness Gate): ${verifyResult.summary}${intentResult ? ` | Intent: ${intentResult.summary}` : ''}`,
    data: { action, verify: { ...verifyResult, intent: intentResult } },
    artifacts: (intentResult && intentResult.changed) ? [actionDef.outputPath] : [],
    warnings,
    startedAt
  });
}

// --- STDIO JSON-RPC-Minimalschleife ---------------------------------------
// Bewusst kein volles MCP-SDK (siehe Kommentar oben). Nimmt Zeilen von
// stdin entgegen der Form {"operation": "inspect"|"validate"|"execute", ...}
// und beantwortet sie mit einer Zeile JSON auf stdout, nach dem Result-
// Schema aus docs/30-meta/tool-result-vocabulary.md.
function main() {
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  rl.on('line', (line) => {
    let request;
    try {
      request = JSON.parse(line);
    } catch (err) {
      process.stdout.write(JSON.stringify({
        operation: 'unknown',
        status: 'failed',
        summary: `Ungueltiges JSON empfangen: ${err.message}`,
        data: {}, artifacts: [], warnings: [], errors: [err.message],
        metadata: { tool: 'agent/mcp/dinbrief-mcp/index.js', timestamp: new Date().toISOString(), duration_ms: 0 }
      }) + '\n');
      return;
    }

    let result;
    switch (request.operation) {
      case 'inspect':
        result = repositoryInspect();
        break;
      case 'validate':
        result = repositoryValidate();
        break;
      case 'execute':
        result = repositoryExecute({ action: request.action, plan: request.plan === true, planId: request.plan_id });
        break;
      default:
        result = {
          operation: request.operation || 'unknown',
          status: 'failed',
          summary: `Unbekannte Operation "${request.operation}". Verfuegbar: inspect, validate, execute.`,
          data: {}, artifacts: [], warnings: [], errors: [],
          metadata: { tool: 'agent/mcp/dinbrief-mcp/index.js', timestamp: new Date().toISOString(), duration_ms: 0 }
        };
    }
    process.stdout.write(JSON.stringify(result) + '\n');
  });
}

// Exportiert fuer Tests / direkten Aufruf aus anderen Skripten,
// startet die STDIO-Schleife nur wenn direkt ausgefuehrt.
module.exports = { repositoryInspect, repositoryValidate, repositoryExecute, ACTIONS, hashPaths, hashSingleFile, PLAN_DIR };

if (require.main === module) {
  main();
}
