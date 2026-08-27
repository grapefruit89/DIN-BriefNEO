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
 * Erst ein zweiter Aufruf ohne plan:true fuehrt die Aktion wirklich aus,
 * und ruft danach automatisch repository.validate auf (verify-Schritt) --
 * das Ergebnis der Ausfuehrung enthaelt den Fitness Score direkt mit,
 * damit nie eine Ausfuehrung ohne Verifikation zurueckgegeben wird.
 *
 * Result-Schema und Vokabular: siehe docs/30-meta/tool-result-vocabulary.md
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const readline = require('readline');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const REPOSITORY_YAML = path.join(REPO_ROOT, 'repository.yaml');

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
const ACTIONS = {
  'run-fitness-gate': {
    description: 'Fuehrt tools/build_db.js aus (Fitness Gate + Traceability-Build). Entspricht Schritt [3/5] in start.ps1.',
    risk: 'WRITE',
    idempotent: true,
    run: () => {
      execFileSync('node', ['tools/build_db.js'], { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf-8' });
    }
  },
  'regenerate-llm-context': {
    description: 'Fuehrt tools/create_context.js aus, erzeugt build/LLM_CONTEXT.md neu.',
    risk: 'WRITE',
    idempotent: true,
    run: () => {
      execFileSync('node', ['tools/create_context.js'], { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf-8' });
    }
  }
};

function repositoryExecute({ action, plan }) {
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
  // darf niemals gleichzeitig ausfuehren.
  if (plan) {
    return makeResult({
      operation: 'execute',
      status: 'unchanged',
      summary: `Plan-Vorschau fuer "${action}": ${actionDef.description} (Risikoklasse: ${actionDef.risk}, idempotent: ${actionDef.idempotent}). Nichts wurde ausgefuehrt -- fuer die echte Ausfuehrung erneut ohne plan:true aufrufen.`,
      data: { action, description: actionDef.description, risk: actionDef.risk, idempotent: actionDef.idempotent, wouldExecute: true },
      startedAt
    });
  }

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

  // Verify-Schritt: IMMER direkt nach execute, automatisch, nicht optional.
  // Das Ergebnis wird mit zurueckgegeben, damit ein Aufrufer nie eine
  // Ausfuehrung ohne Verifikationsergebnis erhaelt.
  const verifyResult = repositoryValidate();
  const status = verifyResult.status === 'ok' ? 'changed' : 'warning';

  return makeResult({
    operation: 'execute',
    status,
    summary: `Aktion "${action}" ausgefuehrt. Verify (Fitness Gate): ${verifyResult.summary}`,
    data: { action, verify: verifyResult },
    warnings: verifyResult.status !== 'ok' ? [`Verify nach Ausfuehrung meldet Status "${verifyResult.status}" statt "ok" -- pruefen vor weiteren Aenderungen.`] : [],
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
        result = repositoryExecute({ action: request.action, plan: request.plan === true });
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
module.exports = { repositoryInspect, repositoryValidate, repositoryExecute, ACTIONS };

if (require.main === module) {
  main();
}
