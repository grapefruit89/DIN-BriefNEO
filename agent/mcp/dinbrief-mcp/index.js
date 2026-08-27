#!/usr/bin/env node
/**
 * dinbrief-mcp — duenner MCP-Server fuer DIN-BriefNEO
 * ====================================================
 * Lauf 2, erste Ausbaustufe: nur zwei Operationen, absichtlich minimal.
 * Herkunft: ChatGPT-Brainstorm "Repo Struktur Refactoring" (Antwort 9,
 * Prioritaet 5 von 5 — "erst ein duenner MCP-Server mit nur
 * repository.inspect/.validate").
 *
 * Dieser Server exponiert NUR, er implementiert nicht neu:
 * - repository.inspect  liest repository.yaml und gibt die Struktur zurueck
 * - repository.validate  ruft tools/reconciliation.js auf (bestehendes Fitness Gate)
 *
 * Bewusst NICHT enthalten (Ponytail-Leiter Schritt 5 beachtet: bevor eine
 * eigene MCP-SDK-Abhaengigkeit gezogen wird, erst pruefen ob das Protokoll
 * einfach genug ist, es ohne SDK zu implementieren):
 * - kein externes MCP-SDK-Paket, reines Node core + STDIO-JSON-RPC-Minimalimplementierung
 * - keine Schreiboperationen (kein repository.execute) — das ist bewusst
 *   Lauf 3, nicht Teil dieser ersten Ausbaustufe
 *
 * Result-Schema und Vokabular: siehe docs/30-meta/tool-result-vocabulary.md
 */

const fs = require('fs');
const path = require('path');
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

// --- STDIO JSON-RPC-Minimalschleife ---------------------------------------
// Bewusst kein volles MCP-SDK (siehe Kommentar oben). Nimmt Zeilen von
// stdin entgegen der Form {"operation": "inspect"|"validate"} und
// beantwortet sie mit einer Zeile JSON auf stdout, nach dem Result-Schema
// aus docs/30-meta/tool-result-vocabulary.md.
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
      default:
        result = {
          operation: request.operation || 'unknown',
          status: 'failed',
          summary: `Unbekannte Operation "${request.operation}". Verfuegbar: inspect, validate.`,
          data: {}, artifacts: [], warnings: [], errors: [],
          metadata: { tool: 'agent/mcp/dinbrief-mcp/index.js', timestamp: new Date().toISOString(), duration_ms: 0 }
        };
    }
    process.stdout.write(JSON.stringify(result) + '\n');
  });
}

// Exportiert fuer Tests / direkten Aufruf aus anderen Skripten,
// startet die STDIO-Schleife nur wenn direkt ausgefuehrt.
module.exports = { repositoryInspect, repositoryValidate };

if (require.main === module) {
  main();
}
