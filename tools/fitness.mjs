#!/usr/bin/env node
/**
 * tools/fitness.mjs — Konsolidierte Fitness-Engine für DIN-BriefNEO.
 *
 * Verschmilzt:
 *   - structure-stand: SHA-256 Hash-Helfer gegen Git-Drift (computeStand, STAND_RE, bodyOf)
 *   - repo-map-check: Wegweiser-Gate (checkRepoMap)
 *   - reconciliation: Reality Reconciliation & Antipattern Score Engine (evaluateAntipatterns, runReconciliation)
 *   - build_db: SSoT-Build & docs/STRUCTURE.md Generator (buildDatabase)
 *
 * CLI:
 *   node tools/fitness.mjs [-q]
 *   node tools/fitness.mjs --only-rules
 *   node tools/fitness.mjs repo-map
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { parseArgs } from "node:util";
import { execFileSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import * as laws from "./laws.mjs";
const { matchFilePattern } = laws;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT = path.resolve(__dirname, "..");

/* ==================================================================
   1. Structure-Stand (SHA-256 Hash-Helfer)
   ================================================================== */
export const STAND_RE = /<!-- Stand: ([a-f0-9]{64}|__STAND__) -->/;

export function bodyOf(text) {
  const m = text.match(STAND_RE);
  if (!m || m.index === undefined) return text;
  const after = m.index + m[0].length;
  return text.slice(after).replace(/^\r?\n/, "");
}

export function computeStand(text) {
  return crypto.createHash("sha256").update(bodyOf(text), "utf8").digest("hex");
}

/* ==================================================================
   2. Repo-Map-Check (Wegweiser-Gate)
   ================================================================== */
export function checkRepoMap(root = ROOT) {
  const MAP_REL = "docs/meta/AUFGABEN-WEGWEISER.md";
  const MAP = path.join(root, MAP_REL);
  if (!fs.existsSync(MAP)) return { ok: false, fehler: [`FEHLT: ${MAP_REL}`] };

  const text = fs.readFileSync(MAP, "utf8");
  const fehler = [];

  const pfade = new Set();
  const re = /`((?:website|tools|test|docs)\/[^`\s]+)`/g;
  for (const match of text.matchAll(re)) {
    const pfad = match[1].replace(/[.,;:]+$/, "").replace(/[#?].*$/, "");
    if (pfad.includes("*")) continue;
    pfade.add(pfad);
  }
  for (const pfad of pfade) {
    if (!fs.existsSync(path.join(root, pfad))) fehler.push(`FEHLT: ${pfad}`);
  }

  const jsDir = path.join(root, "website", "js");
  const module = fs.existsSync(jsDir) ? fs.readdirSync(jsDir).filter((f) => f.endsWith(".js")) : [];
  for (const datei of module) {
    const rel = `website/js/${datei}`;
    if (!text.includes(rel)) fehler.push(`NICHT ERWÄHNT: ${rel}`);
  }

  const agentsPath = path.join(root, "AGENTS.md");
  if (fs.existsSync(agentsPath)) {
    const lines = fs.readFileSync(agentsPath, "utf8").split("\n").length;
    if (lines > 70) fehler.push(`BUDGET-OVERFLOW: AGENTS.md hat ${lines} Zeilen (Limit: 70).`);
  } else {
    fehler.push("FEHLT: AGENTS.md im Projekt-Root.");
  }

  const mapPath = path.join(root, "map.md");
  if (fs.existsSync(mapPath)) {
    const lines = fs.readFileSync(mapPath, "utf8").split("\n").length;
    if (lines > 100) fehler.push(`BUDGET-OVERFLOW: map.md hat ${lines} Zeilen (Limit: 100).`);
  } else {
    fehler.push("FEHLT: map.md im Projekt-Root.");
  }

  return { ok: fehler.length === 0, fehler, pfadeCount: pfade.size, moduleCount: module.length };
}

/* ==================================================================
   3. Reconciliation & Antipattern Score Engine
   ================================================================== */

const standHelper = { STAND_RE, computeStand, bodyOf };

// os already imported
// execSync already imported

const targetDir = ROOT;
const DIN_HOME = process.env.DIN_BRIEFNEO_HOME || path.join(os.homedir(), '.din-briefneo');
const websiteDir = path.join(targetDir, 'website');
const antipatternsDir = path.join(ROOT, 'tools', 'antipatterns');

// Layered antipattern loading for generalizability to llm_boilerplate
// See boilerplate.config.json and tools/antipatterns/{base,web,project}.json
const ruleMap = new Map();

function loadRulesFile(filePath, isOptional = false) {
  if (!fs.existsSync(filePath)) {
    if (isOptional) return;
    console.error(`FATAL: Rule file not found at ${filePath}.`);
    process.exit(1);
  }

  let fileContent;
  try {
    fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`FATAL: Failed to parse ${filePath}: ${err.message}`);
    process.exit(1);
  }

  const rules = fileContent.rules || [];
  rules.forEach(rule => {
    const required = ['id', 'severity', 'category', 'description', 'file_patterns', 'pattern'];
    for (const field of required) {
      const missing = field === 'pattern'
        ? (rule.pattern === undefined || rule.pattern === null)
        : !rule[field];
      if (missing) {
        console.error(`FATAL: Rule ${rule.id || 'unknown'} in ${path.basename(filePath)} is missing required field ${field}.`);
        process.exit(1);
      }
    }
    const allowedSeverities = ['critical', 'high', 'medium', 'low', 'warning', 'info'];
    if (!allowedSeverities.includes(rule.severity)) {
      console.error(`FATAL: Rule ${rule.id} has invalid severity "${rule.severity}".`);
      process.exit(1);
    }
    if (rule.max_violations !== undefined) {
      if (!Number.isInteger(rule.max_violations) || rule.max_violations < 0) {
        console.error(`FATAL: Rule ${rule.id} has invalid max_violations "${rule.max_violations}" (integer >= 0 expected).`);
        process.exit(1);
      }
    }
    if (rule.replacement !== undefined && typeof rule.replacement !== 'string') {
      console.error(`FATAL: Rule ${rule.id} has invalid replacement (string expected).`);
      process.exit(1);
    }
    if (rule.ignore_line_pattern !== undefined) {
      if (typeof rule.ignore_line_pattern !== 'string' || !rule.ignore_line_pattern) {
        console.error(`FATAL: Rule ${rule.id} has invalid ignore_line_pattern (non-empty string expected).`);
        process.exit(1);
      }
      try {
        new RegExp(rule.ignore_line_pattern);
      } catch {
        console.error(`FATAL: Rule ${rule.id} has an invalid ignore_line_pattern regex.`);
        process.exit(1);
      }
    }
    if (rule.multiline !== undefined && typeof rule.multiline !== 'boolean') {
      console.error(`FATAL: Rule ${rule.id} has invalid multiline flag (boolean expected).`);
      process.exit(1);
    }
    for (const ex of rule.exemptions || []) {
      if (!ex || typeof ex.file !== 'string' || !ex.file) {
        console.error(`FATAL: Rule ${rule.id} has an exemption without "file".`);
        process.exit(1);
      }
      if (ex.pattern !== undefined) {
        try {
          new RegExp(ex.pattern);
        } catch {
          console.error(`FATAL: Rule ${rule.id} has an exemption with an invalid pattern.`);
          process.exit(1);
        }
      }
    }
    try {
      new RegExp(rule.pattern || '^$', 'g');
    } catch (e) {
      console.error(`FATAL: Rule ${rule.id} contains invalid regex pattern.`);
      process.exit(1);
    }

    // Add or override by ID (later layers win)
    ruleMap.set(rule.id, rule);
  });
}

// 1. Load base layer (always required for general rules)
loadRulesFile(path.join(antipatternsDir, 'base.json'));

// 2. Load active layers (web + project for DIN-Brief Neo)
// In a full setup this would come from boilerplate.config.json activeAntipatterns
const activeLayers = ['web', 'project'];
activeLayers.forEach(layer => {
  loadRulesFile(path.join(antipatternsDir, `${layer}.json`), true);
});

const ANTIPATTERN_RULES = Array.from(ruleMap.values());

/* Severities, die melden, aber nicht blockieren. Sie zaehlen auch nicht in den
 * Fitness-Nenner: sonst faellt der Score unter 100 %, obwohl die Regel bewusst
 * kein Gate ist (so sind P2 und P38 deklariert). */
const NEUTRAL_SEVERITIES = new Set(['warning', 'info']);

const CUSTOM_CHECKS = {
  'A38': (line, ext, relPath) => {
    if (ext === '.js') {
      const fetchMatch = line.match(/fetch\s*\(\s*['"`](https?:\/\/.*?)['"`]/);
      if (fetchMatch) {
        const url = fetchMatch[1];
        const allowed = ['photon.komoot.io', 'api.geoapify.com', 'api.zippopotam.us'];
        if (!allowed.some(domain => url.includes(domain))) {
          return true;
        }
      }
    }
    if (ext === '.html') {
      const resourceMatch = line.match(/(?:src|href)\s*=\s*['"`](https?:\/\/.*?)['"`]/);
      if (resourceMatch) {
        const url = resourceMatch[1];
        const isNonLoading = line.includes('<a') || line.includes('pointer-events: auto') || line.includes('rel="canonical"') || line.includes("rel='canonical'");
        if (isNonLoading) return false;
        
        const allowed = ['photon.komoot.io', 'api.geoapify.com', 'api.zippopotam.us', 'www.w3.org', 'myprojects.geoapify.com'];
        if (!allowed.some(domain => url.includes(domain))) {
          return true;
        }
      }
    }
    if (ext === '.css') {
      const urlMatch = line.match(/url\s*\(\s*['"`]?(https?:\/\/.*?)['"`]?\s*\)/);
      if (urlMatch) {
        const url = urlMatch[1];
        const allowed = ['photon.komoot.io', 'api.geoapify.com', 'api.zippopotam.us'];
        if (!allowed.some(domain => url.includes(domain))) {
          return true;
        }
      }
    }
    return false;
  }
};

const FEATURE_CHECKS = {
  'Temporal API': {
    regex: /Temporal/g,
    file: 'website/js/format.js'
  },
  'CSS Anchor Positioning': {
    regex: /anchor-name|position-anchor|position-area/g,
    file: 'website/css/sidebar.css'
  },
  'CSS @scope': {
    regex: /@scope/g,
    file: 'website/css/sheet-common.css'
  },
  'CSS light-dark()': {
    regex: /light-dark\(/g,
    file: 'website/css/base.css'
  },
  'CSS Relative Color Syntax': {
    regex: /oklch\(from/g,
    file: 'website/css/sheet-common.css'
  },
  'View Transitions': {
    /* Stand 2026-11-16: die Implementierung liegt in core.js (transitionOn).
       Vorher stand sie doppelt in settings.js und font-feature.js. */
    regex: /startViewTransition/g,
    file: 'website/js/core.js'
  }
};

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      const ignoredDirs = ['website', '.git', 'tools', 'build', 'venv', 'node_modules', '.agents', '.claude', 'cache', '.trash', 'Papierkorb'];
      if (!ignoredDirs.includes(file)) {
        getFilesRecursively(name, fileList);
      }
    } else if (file.endsWith('.md') || file.endsWith('.json')) {
      fileList.push(name);
    }
  }
  return fileList;
}

function parseYamlFrontmatter(content) {
  const meta = { title: '', status: '', tags: [], relations: [], _rawKeys: [] };
  const match = content.match(/^\uFEFF?---\r?\n([\s\S]+?)\r?\n---/);
  if (match) {
    const yamlLines = match[1].split(/\r?\n/);
    let inRelations = false;
    let currentRelation = null;

    for (const line of yamlLines) {
      if (!line.startsWith(' ') && !line.startsWith('-')) {
        inRelations = false;
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim().toLowerCase();
          meta._rawKeys.push(key);
          let value = parts.slice(1).join(':').trim();
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
          } else {
            value = value.replace(/['"]/g, '');
          }
          if (key === 'title') meta.title = value;
          if (key === 'status') meta.status = value;
          if (key === 'tags') meta.tags = Array.isArray(value) ? value : [value];
          if (key === 'relations') inRelations = true;
        }
      } else if (inRelations) {
        const trimmed = line.trim();
        if (trimmed.startsWith('-')) {
          if (currentRelation) meta.relations.push(currentRelation);
          currentRelation = { type: '', target: '' };
          const pair = trimmed.slice(1).trim().split(':');
          if (pair.length >= 2) {
            const k = pair[0].trim().toLowerCase();
            const v = pair.slice(1).join(':').trim().replace(/['"]/g, '');
            if (k === 'type') currentRelation.type = v;
            if (k === 'target') currentRelation.target = v;
          }
        } else if (currentRelation) {
          const pair = trimmed.split(':');
          if (pair.length >= 2) {
            const k = pair[0].trim().toLowerCase();
            const v = pair.slice(1).join(':').trim().replace(/['"]/g, '');
            if (k === 'type') currentRelation.type = v;
            if (k === 'target') currentRelation.target = v;
          }
        }
      }
    }
    if (currentRelation) meta.relations.push(currentRelation);
  }
  return meta;
}

// Dateimuster-Abgleich liegt in tools/filematch.js -- dieselbe Logik nutzt
// tools/lawcoverage.js fuer die Totsonden-Erkennung. Siehe Kopf dort.


function isExempt(rule, filePath, line, lineContent) {
  if (!rule.exemptions || rule.exemptions.length === 0) return false;
  return rule.exemptions.some(ex => {
    const normExFile = ex.file.replace(/\\/g, '/');
    const normFilePath = filePath.replace(/\\/g, '/');
    
    if (!normFilePath.endsWith(normExFile)) return false;

    /* Muster-Ausnahme (B1): exemptiert alle Zeilen, auf die das Muster passt.
     * Robuster als Zeilennummern, die bei jeder Refaktorierung verrutschen. */
    if (ex.pattern) {
      try {
        return new RegExp(ex.pattern).test(lineContent);
      } catch {
        return false;
      }
    }

    if (ex.line_range) {
      if (ex.line_range === '*') return true;
      const rangeMatch = ex.line_range.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (line >= start && line <= end) return true;
      }
      const singleLine = parseInt(ex.line_range, 10);
      if (!isNaN(singleLine) && line === singleLine) return true;
    }
    
    if (rule.id === 'A4' && normFilePath.endsWith('main.js') && lineContent.includes('.innerHTML =')) {
      return true;
    }
    
    if (!ex.line_range) return true;
    
    return false;
  });
}

/**
 * Einzige Auswertung der Antipattern-Regeln — von der vollen Reconciliation
 * (Fitness Gate) UND von `--only-rules` (pre-commit Stufe 4) genutzt. Zwei
 * getrennte Schleifen gab es bis 2026-11-10; sie liefen auseinander, sobald
 * eine Regel mehr konnte als die andere (max_violations wurde nur hier gelesen).
 *
 * Treffer werden pro REGEL ueber alle Dateien gesammelt, nicht pro Datei: nur so
 * ist eine Ratsche formulierbar ("25 bekannte Stellen erlaubt, die 26. bricht").
 * @param {string[]} codeFiles
 */
function evaluateAntipatterns(codeFiles) {
  const ruleHits = new Map();
  ANTIPATTERN_RULES.forEach(rule => ruleHits.set(rule.id, { rule, hits: [] }));

  codeFiles.forEach(file => {
    const relPath = path.relative(targetDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split(/\r?\n/);
    const ext = path.extname(file);

    ANTIPATTERN_RULES.forEach(rule => {
      if (!matchFilePattern(relPath, rule.file_patterns)) return;
      const stat = ruleHits.get(rule.id);
      /* Kommentarzeilen vor der Regel-Prüfung verwerfen (optional, pro Regel).
       * Bewusst konservativ: nur Zeilen, die mit //, * oder /* beginnen —
       * Inline-Kommentare bleiben ein (selteneres) False Negative. */
      const ignoreRe = rule.ignore_line_pattern ? new RegExp(rule.ignore_line_pattern) : null;

      /* Multi-Line-Regeln (multiline: true) werden gegen den ganzen Datei-Inhalt
       * geprüft, damit Muster wie P26 auch über Zeilenumbrüche greifen. Die
       * Zeilennummer stammt aus dem Match-Index, nicht aus einer Zeilenschleife. */
      if (rule.multiline) {
        if (CUSTOM_CHECKS[rule.id]) return; // Multiline ist nur für Regex-Sonden definiert.
        const regex = new RegExp(rule.pattern, 'g');
        const seenLines = new Set();
        for (const m of content.matchAll(regex)) {
          const line = content.slice(0, m.index).split(/\r?\n/).length;
          if (seenLines.has(line)) continue;
          const lineContent = lines[line - 1] ?? '';
          if (ignoreRe && ignoreRe.test(lineContent)) continue;
          if (isExempt(rule, relPath, line, lineContent)) continue;
          seenLines.add(line);
          stat.hits.push({ file_path: relPath, line });
        }
        return;
      }

      lines.forEach((line, index) => {
        if (ignoreRe && ignoreRe.test(line)) return;
        if (isExempt(rule, relPath, index + 1, line)) return;

        let hasViolation = false;
        if (CUSTOM_CHECKS[rule.id]) {
          hasViolation = CUSTOM_CHECKS[rule.id](line, ext, relPath);
        } else if (rule.pattern) {
          const regex = new RegExp(rule.pattern, 'g');
          hasViolation = regex.test(line);
        }

        if (hasViolation) {
          stat.hits.push({ file_path: relPath, line: index + 1 });
        }
      });
    });
  });

  const logs = [];
  let checked = 0;
  let passed = 0;
  let neutral = 0;

  ruleHits.forEach(({ rule, hits }) => {
    checked++;
    const max = Number.isInteger(rule.max_violations) ? rule.max_violations : 0;
    if (hits.length <= max) {
      passed++;
      return;
    }
    /* Hinweis-Regeln werden gemeldet, aber weder als bestanden noch als
     * durchgefallen gezaehlt (siehe NEUTRAL_SEVERITIES). */
    if (NEUTRAL_SEVERITIES.has(rule.severity)) neutral++;
    const ersatz = rule.replacement ? ` Ersatz: ${rule.replacement}` : '';
    for (const hit of hits) {
      logs.push({
        file_path: hit.file_path,
        check_type: 'antipattern',
        severity: rule.severity,
        antipattern_id: rule.id,
        line: hit.line,
        message: `[${rule.id}] Verstoss gegen "${rule.description}" in Zeile ${hit.line} (${hits.length} Treffer, erlaubt ${max}).${ersatz}`
      });
    }
  });

  return { checked, passed, neutral, logs };
}

// Liest eine einfache YAML-Liste (Key auf eigener Zeile, darunter eingerueckte
// "- item"-Eintraege) aus repository.yaml. Kein voller YAML-Parser -- nur das,
// was die Taxonomie-Allowlists brauchen.
function readYamlList(raw, key) {
  const lines = raw.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)([A-Za-z_]+):\s*$/);
    if (!m || m[2] !== key) continue;
    const baseIndent = m[1].length;
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j];
      if (line.trim() === '') continue;
      const indent = line.match(/^(\s*)/)[1].length;
      if (indent <= baseIndent) break;
      const item = line.match(/^\s*-\s+(.+?)\s*$/);
      if (item) out.push(item[1]);
    }
    break;
  }
  return out;
}

function scanCodeFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      results = results.concat(scanCodeFiles(name));
    } else {
      const ext = path.extname(name);
      if (['.html', '.css', '.js'].includes(ext)) {
        results.push(name);
      }
    }
  });
  return results;
}

function runReconciliation() {
  const logs = [];
  const relations = [];

  // We need conformance variables earlier so we can increment them for TS/Scrub checks
  let conformanceChecked = 0;
  let conformancePassed = 0;

  // 0. JSDoc Type-Safety Verification
  let tscBin = null;
  const extTsc = path.join(DIN_HOME, 'node_modules', '.bin', 'tsc');
  const localTsc = path.join(targetDir, 'node_modules', '.bin', 'tsc');

  if (fs.existsSync(extTsc)) {
    tscBin = extTsc;
  } else if (fs.existsSync(localTsc)) {
    tscBin = localTsc;
  } else {
    try {
      execSync('tsc --version', { stdio: 'pipe' });
      tscBin = 'tsc';
    } catch (e) {
      // Nicht im System-PATH gefunden
    }
  }

  if (!tscBin) {
    logs.push({
      file_path: 'jsconfig.json',
      check_type: 'type-safety',
      severity: 'critical',
      message: 'TypeScript-Compiler nicht gefunden. Bitte tools/setup-din-home.sh ausführen oder DIN_BRIEFNEO_HOME setzen.'
    });
    conformanceChecked += 1;
  } else {
    let tscSuccess = true;
    let tscOutput = '';
    try {
      tscOutput = execSync(`"${tscBin}" -p jsconfig.json`, { cwd: targetDir, encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      tscSuccess = false;
      tscOutput = error.stdout || error.message;
    }

    if (!tscSuccess) {
      const tscLines = tscOutput.split('\n').filter(l => l.trim().length > 0);
      let parsedErrors = 0;
      tscLines.forEach(line => {
        const match = line.match(/^(.+?):(\d+):(\d+)\s+-\s+error\s+(TS\d+):\s+(.+)$/);
        if (match) {
          parsedErrors++;
          logs.push({
            file_path: match[1].replace(/\\/g, '/'),
            check_type: 'type-safety',
            severity: 'high',
            message: `TypeScript Error ${match[4]}: ${match[5]} (Line ${match[2]})`
          });
        }
      });
      if (parsedErrors === 0) {
        logs.push({
          file_path: 'jsconfig.json',
          check_type: 'type-safety',
          severity: 'high',
          message: `TypeScript Compilation failed: ${tscOutput.substring(0, 200)}...`
        });
      }
    }

    conformanceChecked += 1;
    if (tscSuccess) {
      conformancePassed += 1;
    }
  }

  // --- Taxonomie-Check (repository.yaml / taxonomy) -----------------------
  // Jede GETRACKTE Datei muss unter einem erlaubten Top-Level-Ordner oder in
  // der Root-Datei-Allowlist liegen. git ls-files -> untracked lokaler Muell
  // (.directory, scratch/, .opencode/) ist irrelevant. Allowlists kommen aus
  // repository.yaml (SSOT), damit Doku und Durchsetzung nicht driften.
  conformanceChecked += 1;
  {
    let taxonomyViolations = [];
    try {
      const repoYaml = fs.readFileSync(path.join(targetDir, 'repository.yaml'), 'utf-8');
      const allowedDirs = readYamlList(repoYaml, 'allowed_top_level');
      const allowedRootFiles = readYamlList(repoYaml, 'allowed_root_files');
      if (allowedDirs.length > 0 && allowedRootFiles.length > 0) {
        const tracked = execSync('git ls-files', { cwd: targetDir, encoding: 'utf-8' })
          .split('\n').map(s => s.trim()).filter(Boolean);
        for (const rel of tracked) {
          const top = rel.includes('/') ? rel.split('/')[0] : null;
          const ok = top === null ? allowedRootFiles.includes(rel) : allowedDirs.includes(top);
          if (!ok) taxonomyViolations.push(rel);
        }
      }
    } catch (err) {
      logs.push({
        file_path: 'repository.yaml',
        check_type: 'taxonomy',
        severity: 'low',
        message: `Taxonomie-Check uebersprungen: ${err.message}`
      });
      taxonomyViolations = [];
    }
    if (taxonomyViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of taxonomyViolations) {
        logs.push({
          file_path: v,
          check_type: 'taxonomy',
          severity: 'critical',
          message: `Datei liegt ausserhalb der Taxonomie (repository.yaml/taxonomy): ${v}`
        });
      }
    }
  }

  // --- IMR-Check (docs/10-architecture/IMR-Registry.md = SSOT) --------------
  // Werkzeug: tools/imr.js. Prueft die Registry-Invarianten (45 Atome, 3 System,
  // 42 Inhalt, keine verbotenen Aliase), dass der Website-Code nur registrierte
  // `din-*` verwendet und dass die `data-*`-Geometrie exakt der Registry entspricht.
  conformanceChecked += 1;
  {
    let imrViolations = [];
    try {
      imrViolations = laws.checkImr(targetDir).violations;
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Fitness-Score nicht heben.
      imrViolations = [{ file: 'tools/imr.js', message: `IMR-Check fehlgeschlagen (fail-closed): ${err.message}` }];
    }
    if (imrViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of imrViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'imr',
          severity: 'critical',
          message: v.message
        });
      }
    }
  }

  // --- Link-Check (Wikilinks [[...]] + Frontmatter doc_links/depends_on) ----
  // Werkzeug: tools/links.js. Faengt tote Wikilinks/Frontmatter-Links, die der
  // Markdown-Link-Check weiter unten NICHT sieht (der prueft nur `[](path)`).
  // Ausnahmen (Code-Fences/-Spans, Template-Platzhalter, Chronik, 90-archive,
  // supersedes-Lineage): siehe tools/links.js.
  conformanceChecked += 1;
  {
    let linkViolations = [];
    try {
      linkViolations = laws.checkLinks(targetDir).violations;
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Fitness-Score nicht heben.
      linkViolations = [{ file: 'tools/links.js', message: `Link-Check fehlgeschlagen (fail-closed): ${err.message}` }];
    }
    if (linkViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of linkViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'links',
          severity: 'critical',
          message: v.message
        });
      }
    }
  }

  // --- Hermetik-Check (website/ muss allein lauffaehig sein, Catalog A45) ---
  // Werkzeug: tools/isolation.js. A45 stand seit 2026-06 im Catalog, wurde aber von
  // nichts geprueft. Jetzt Invariante: kopiert man website/ allein auf einen Webserver,
  // darf nichts fehlen. @adr/@guide-Kommentare bleiben erlaubt (Traceability ohne
  // Laufzeitwirkung) -- deren Gegenstueck prueft tools/links.js.
  conformanceChecked += 1;
  {
    let isoViolations = [];
    try {
      isoViolations = laws.checkIsolation(targetDir).violations;
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Fitness-Score nicht heben.
      isoViolations = [{ file: 'tools/isolation.js', line: 1, message: `Hermetik-Check fehlgeschlagen (fail-closed): ${err.message}` }];
    }
    if (isoViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of isoViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'isolation',
          severity: 'critical',
          message: `${v.message} (Zeile ${v.line})`
        });
      }
    }
  }

  // --- Struktur-Gate: Gesetze, die ein Parser statt Regex prueft ---
  conformanceChecked += 1;
  {
    let structuralViolations = [];
    try {
      structuralViolations = laws.checkStructuralLaws(targetDir);
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Fitness-Score nicht heben.
      structuralViolations = [{ file: 'tools/structural-laws.js', line: 1, message: `Struktur-Gate fehlgeschlagen (fail-closed): ${err.message}` }];
    }
    if (structuralViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of structuralViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'structural_laws',
          severity: 'critical',
          message: `${v.message} (Zeile ${v.line})`
        });
      }
    }
  }

  // --- Meta-Gate: die Pruefer selbst (Law Catalog <-> Sonden) ---
  // Werkzeug: tools/lawcoverage.js. Anlass: dreimal stand eine Norm ungeprueft da,
  // und die Inventur fand Sonden, die Gesetze beanspruchten, die es nicht gibt (A16/A20),
  // bzw. Gesetze durchsetzten, ohne sie zu benennen (W1/W3). Geprueft wird die
  // VERBINDUNG Norm<->Pruefung, nicht die Abdeckungsquote: die wird nur berichtet,
  // weil eine erzwungene 100%-Quote nur Schein-Sonden erzeugen wuerde.
  conformanceChecked += 1;
  {
    let covViolations = [];
    let coverage = null;
    try {
      const res = laws.checkLawCoverage(targetDir);
      covViolations = res.violations;
      coverage = res.coverage;
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Fitness-Score nicht heben.
      covViolations = [{ file: 'tools/lawcoverage.js', line: 1, message: `Meta-Gate fehlgeschlagen (fail-closed): ${err.message}` }];
    }
    if (covViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of covViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'law_coverage',
          severity: 'critical',
          message: `${v.message} (Zeile ${v.line})`
        });
      }
    }
    if (coverage) {
      logs.push({
        file_path: 'docs/norm/Immutable-Law-Catalog.md',
        check_type: 'law_coverage',
        severity: 'info',
        message: `Abdeckung: ${coverage.covered}/${coverage.laws} A-Gesetze maschinell geprueft. Ohne Pruefung: ${coverage.uncovered.join(', ')}`
      });
    }
  }

  // --- Terminologie-Check ("Ein Sachverhalt, ein Begriff", AGENTS.md 5.5) ---
  // Werkzeug: tools/terminology.js. Die Begriffsliste steht NICHT im Code, sondern
  // in der Tabelle "Kanonische Begriffe" in docs/norm/glossary.md --
  // sonst waere das Modul selbst die zweite Kopie des Kanons. Ausgenommen:
  // archive (eingefroren), DECISION-LOG (append-only), research/, das Glossar selbst.
  conformanceChecked += 1;
  {
    let termViolations = [];
    try {
      termViolations = laws.checkTerminology(targetDir).violations;
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Fitness-Score nicht heben.
      termViolations = [{ file: 'tools/terminology.js', line: 1, found: err.message, canonical: 'tool muss laden' }];
    }
    if (termViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of termViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'terminology',
          severity: 'critical',
          message: `Verdraengte Begriffsvariante "${v.found}" in Zeile ${v.line} -- kanonisch ist "${v.canonical}" (siehe glossary.md, Kanonische Begriffe)`
        });
      }
    }
  }

  // --- ID-Check ("Ein Punkt, eine ID", ID-Register 2026-11-17) ---
  // Werkzeug: tools/id-register.js. Die Nummernkreise stehen NICHT im Code,
  // sondern in docs/meta/ID-REGISTER.md. Geprueft werden: Aufloesbarkeit
  // jeder B-Referenz, Verwendung ausgelaufener Praefixe (S/R/F/T/M) und die
  // Deckung des Registers gegen Law Catalog, Antipattern-Datei und Backlog.
  conformanceChecked += 1;
  {
    let idViolations = [];
    try {
      idViolations = laws.checkIds(targetDir).violations;
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Fitness-Score nicht heben.
      idViolations = [{ file: 'tools/id-register.js', line: 1, rule: 'FAIL-CLOSED', message: `ID-Check fehlgeschlagen (fail-closed): ${err.message}` }];
    }
    if (idViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of idViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'ids',
          severity: 'critical',
          message: `${v.message} (${v.rule}, Zeile ${v.line})`
        });
      }
    }
  }

  const docFiles = getFilesRecursively(targetDir);
  if (!fs.existsSync(path.join(targetDir, 'docs', 'STRUCTURE.md'))) {
    logs.push({
      file_path: 'docs/STRUCTURE.md',
      check_type: 'structure-fresh',
      severity: 'critical',
      message: 'docs/STRUCTURE.md existiert nicht. Bitte mit "node tools/build_db.js" generieren.'
    });
  }
  let metadataChecked = 0;
  let metadataPassed = 0;
  let linksChecked = 0;
  let linksPassed = 0;

  for (const file of docFiles) {
    const relPath = path.relative(targetDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8');
    
    if (file.endsWith('.md')) {
      const meta = parseYamlFrontmatter(content);
      
      if (relPath.startsWith('docs/')) {
        const v6RequiredFields = ['id', 'created', 'updated', 'title', 'type', 'status', 'doc_links', 'code_links', 'depends_on', 'tags'];
        v6RequiredFields.forEach(f => {
          metadataChecked++;
          if (meta._rawKeys && meta._rawKeys.includes(f)) {
            metadataPassed++;
          } else {
            logs.push({
              file_path: relPath,
              check_type: 'metadata',
              severity: 'high',
              message: `Pflicht-Metadatenfeld "${f}" (V6) fehlt im YAML-Header.`
            });
          }
        });

        // Scrub Check for banned terms.
        // Negations/comparisons ("kein React", "No raw `innerHTML`", "ohne innerHTML")
        // and enumerations of forbidden tech are legitimate documentation, not violations —
        // likewise a line classified "HARD BAN" in the Law Catalog: the catalog MUST be able
        // to name what it forbids, otherwise the norm cannot be written down at all.
        // only flag lines that don't carry an explicit negation/prohibition marker nearby.
        const scrubNegationPattern = /\b(?:kein|keine|keinem|keinen|ohne|no|not|non-|verbot|forbidden|ban|banned|nie|niemals|unzulaessig|untersagt)\b/i;
        // "etc." after an enumeration ("React, Vue, etc.") marks a descriptive comparison
        // ("other frameworks do X"), not a recommendation to use the named tech.
        const scrubEnumerationPattern = /\b(?:React|Vue)\b[^.\n]{0,40}\betc\.?/i;
        const lines = content.split(/\r?\n/);
        /* Zeilenzahl ohne die leere Zelle hinter dem letzten Newline: eine Datei
           mit 405 Zeilen endet auf "\n", split() liefert dann 406 Eintraege und
           meldete "406 Zeilen" fuer eine 405-Zeilen-Datei (B79). */
        const zeilenZahl = lines.length - (content.endsWith('\n') ? 1 : 0);
        lines.forEach((line, index) => {
          // Look one line back too: a "Warum kein Framework?"-style heading or lead-in
          // right above the match also establishes negation context for the paragraph.
          const context = (lines[index - 1] || '') + ' ' + line;
          const isNegated = scrubNegationPattern.test(context) || scrubEnumerationPattern.test(line);
          if (/\b(?:React|Vue|innerHTML)\b/.test(line) && !isNegated) {
            conformanceChecked++; // Failed scrub check
            logs.push({
              file_path: relPath,
              check_type: 'scrub-check',
              severity: 'high',
              message: `Banned technology term (React/Vue/innerHTML) found in docs: "${line.trim()}" (Line ${index + 1})`
            });
          }
        });

        // P5: Doku-Groessenwarnung (>400 Zeilen). Ausnahmen: DECISION-LOG
        // (append-only Chronik), generierte Code-Referenzen und die IMR-Registry
        // (normative SSOT des Fachmodells — darf nicht gesplittet werden).
        const docSizeExempt = ['docs/meta/DECISION-LOG.md', 'docs/meta/DECISION-LOG-2026-H1.md', 'docs/norm/Code-Referenzen.md', 'docs/norm/IMR-Registry.md', 'docs/norm/din5008.md'];
        /* Bereits archivierte Dokumente sind von der Groessenregel ausgenommen:
         * Die Regel fordert als Abhilfe genau den Umzug nach docs/archive/ —
         * sie dort weiter zu melden ist eine unerfuellbare Forderung (das Archiv
         * ist eingefroren und wird bewusst nicht nachtraeglich gesplittet). */
        const isArchived = relPath.includes('archive/') || relPath.includes('audit/');
        if (zeilenZahl > 400 && !docSizeExempt.includes(relPath) && !isArchived) {
          logs.push({
            file_path: relPath,
            check_type: 'doc-size',
            severity: 'low',
            message: `Doku-Datei hat ${zeilenZahl} Zeilen (>400). Aufteilen oder nach docs/archive/ verschieben (Ausnahme: DECISION-LOG).`
          });
        }

        // Drift-Guard: structure-fresh. Prueft, dass die Stand-Zeile zum Inhalt
        // der Datei passt (Inhalts-Hash, kein Commit-Hash/keine Uhrzeit - sonst
        // war die Datei nach jedem Commit erneut "dirty").
        if (relPath === 'docs/STRUCTURE.md') {
          const standMatch = content.match(/<!-- Stand: ([0-9a-f]{6,64}) -->/);
          const expected = standHelper.computeStand(content);
          if (!standMatch || standMatch[1] !== expected) {
            logs.push({
              file_path: relPath,
              check_type: 'structure-fresh',
              severity: 'critical',
              message: `docs/STRUCTURE.md passt nicht zu seinem Stand-Hash (${expected}). Bitte mit "node tools/build_db.js" regenerieren.`
            });
          }
        }
      }

      if (meta.relations) {
        meta.relations.forEach(rel => {
          linksChecked++;
          const targetPath = path.resolve(targetDir, rel.target);
          const relTargetPath = path.relative(targetDir, targetPath).replace(/\\/g, '/');
          
          const validTypes = ['implements', 'depends_on', 'specifies', 'refers_to', 'supersedes'];
          if (!validTypes.includes(rel.type)) {
            logs.push({
              file_path: relPath,
              check_type: 'link',
              severity: 'high',
              message: `Ungueltiger Beziehungs-Typ "${rel.type}" (Erlaubt: ${validTypes.join(', ')}).`
            });
          }

          if (fs.existsSync(targetPath)) {
            linksPassed++;
            relations.push({
              source_path: relPath,
              target_path: relTargetPath,
              relation_type: rel.type
            });
          } else {
            logs.push({
              file_path: relPath,
              check_type: 'link',
              severity: 'high',
              message: `Ungueltige Relation: Zieldatei "${rel.target}" existiert nicht.`
            });
          }
        });
      }

      const linkRegex = /\[.*?\]\((?!https?:\/\/|mailto:)(.*?)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        linksChecked++;
        let targetLink = match[1].split('#')[0];
        if (!targetLink) {
          linksPassed++;
          continue;
        }

        let resolvedTarget;
        if (targetLink.startsWith('file:///')) {
          const urlPath = decodeURIComponent(targetLink.slice(7));
          if (urlPath.match(/^\/[a-zA-Z]:/)) {
            resolvedTarget = path.normalize(urlPath.slice(1));
          } else {
            resolvedTarget = path.normalize(urlPath);
          }
        } else {
          // Bei Symlinks muss relativ zum ZIEL
          // aufgeloest werden, sonst ist eine der beiden Ansichten immer rot.
          let basis;
          try {
            basis = path.dirname(fs.realpathSync(file));
          } catch {
            basis = path.dirname(file);
          }
          resolvedTarget = path.resolve(basis, targetLink);
        }

        if (fs.existsSync(resolvedTarget)) {
          linksPassed++;
        } else {
          logs.push({
            file_path: relPath,
            check_type: 'link',
            severity: 'high',
            message: `Toter Markdown-Link: "${targetLink}" existiert nicht.`
          });
        }
      }
    }
  }

  const metadataScore = metadataChecked > 0 ? (metadataPassed / metadataChecked) * 100 : 100;
  const coherenceScore = linksChecked > 0 ? (linksPassed / linksChecked) * 100 : 100;
  
  const codeFiles = scanCodeFiles(websiteDir);

  const antipatterns = evaluateAntipatterns(codeFiles);
  /* Hinweis-Regeln zaehlen weder als bestanden noch als durchgefallen —
   * sie blockieren nicht und duerfen den Score nicht druecken. */
  conformanceChecked += antipatterns.checked - antipatterns.neutral;
  conformancePassed += antipatterns.passed;
  logs.push(...antipatterns.logs);

  const conformanceScore = conformanceChecked > 0 ? (conformancePassed / conformanceChecked) * 100 : 100;

  let featuresChecked = 0;
  let featuresPassed = 0;

  Object.keys(FEATURE_CHECKS).forEach(featureName => {
    featuresChecked++;
    const check = FEATURE_CHECKS[featureName];
    const codeFilePath = path.join(targetDir, check.file);

    if (fs.existsSync(codeFilePath)) {
      const content = fs.readFileSync(codeFilePath, 'utf-8');
      check.regex.lastIndex = 0;
      
      if (check.regex.test(content)) {
        featuresPassed++;
      } else {
        logs.push({
          file_path: check.file,
          check_type: 'feature',
          severity: 'medium',
          message: `Deklariertes Feature "${featureName}" konnte im Code nicht nachgewiesen werden.`
        });
      }
    } else {
      logs.push({
        file_path: check.file,
        check_type: 'feature',
        severity: 'high',
        message: `Zieldatei fuer Feature-Check "${featureName}" existiert nicht.`
      });
    }
  });

  const featuresScore = featuresChecked > 0 ? (featuresPassed / featuresChecked) * 100 : 100;

  const totalScore = (metadataScore + coherenceScore + conformanceScore + featuresScore) / 4;
  const success = !logs.some(log => log.severity === 'critical');

  return {
    success,
    score: parseFloat(totalScore.toFixed(2)),
    dimensions: {
      metadata: parseFloat(metadataScore.toFixed(2)),
      coherence: parseFloat(coherenceScore.toFixed(2)),
      conformance: parseFloat(conformanceScore.toFixed(2)),
      features: parseFloat(featuresScore.toFixed(2))
    },
    relations,
    logs,
    rules: ANTIPATTERN_RULES
  };
}



function checkAntipatternsOnly() {
  const codeFiles = scanCodeFiles(websiteDir);
  const { checked, neutral, logs } = evaluateAntipatterns(codeFiles);

  for (const log of logs) {
    const marker = NEUTRAL_SEVERITIES.has(log.severity) ? 'HINWEIS' : log.severity.toUpperCase();
    console.error(`[${marker}] ${log.file_path}:${log.line} - ${log.message}`);
  }

  const blockierend = logs.filter(log => !NEUTRAL_SEVERITIES.has(log.severity));
  if (blockierend.length > 0) {
    console.error(`\n❌ ${blockierend.length} blockierende Antipattern-Verletzung(en) gefunden.`);
    process.exit(1);
  }

  const hinweis = neutral > 0 ? `, ${neutral} Hinweis-Regel(n) ausserhalb des Budgets` : '';
  console.log(`✓ ${checked} Antipattern-Regeln geprüft: 0 blockierende Verstöße${hinweis}.`);
  process.exit(0);
}



export { runReconciliation, evaluateAntipatterns };

/* ==================================================================
   4. Build DB & docs/STRUCTURE.md Generator
   ================================================================== */
process.removeAllListeners('warning');



// os already imported
// parseArgs already imported


const { values: options } = parseArgs({
  options: {
    quiet: {
      type: 'boolean',
      short: 'q',
      default: false
    },
    silent: {
      type: 'boolean',
      default: false
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      default: false
    }
  },
  strict: false
});

const isQuiet = (options.quiet || options.silent || !process.stdout.isTTY) && !options.verbose;

// targetDir, DIN_HOME already ROOT
const BUILD_DIR = path.join(DIN_HOME, 'build');
const CACHE_DIR = path.join(DIN_HOME, 'cache');
// Externe Auslagerung: BUILD_DIR und CACHE_DIR bei Bedarf anlegen
fs.mkdirSync(BUILD_DIR, { recursive: true });
fs.mkdirSync(CACHE_DIR, { recursive: true });

// standHelper already defined above

const REPO_JSON_PATH = path.join(ROOT, 'docs', 'norm', 'repository.json');

/** @returns {{html?: any[], css?: any[], js?: any[], addons?: any[], data?: any[]}} */
function ladeRepository() {
  return JSON.parse(fs.readFileSync(REPO_JSON_PATH, 'utf8'));
}

/**
 * @param {{file: string, adr?: string, guide?: string, desc: string}} eintrag
 * @returns {string}
 */
function tabellenZeile(eintrag) {
  const adr = eintrag.adr && eintrag.adr.trim() ? eintrag.adr.trim() : '-';
  const guide = eintrag.guide && eintrag.guide.trim() ? eintrag.guide.trim() : '-';
  return `| ${eintrag.file} | ${adr} | ${guide} | ${eintrag.desc} |`;
}

/**
 * Baut die Tabelle "Produktionscode" aus docs/10-architecture/repository.json.
 * Neue Dateien brauchen nur dort einen Eintrag.
 * @returns {string}
 */
function produktionscodeTabelle() {
  const repo = ladeRepository();
  const zeilen = ['| Datei | @adr | @guide | Haupt-Export |', '|---|---|---|---|'];
  for (const gruppe of ['html', 'css', 'js', 'addons', 'data']) {
    for (const eintrag of repo[gruppe] || []) zeilen.push(tabellenZeile(eintrag));
  }
  return zeilen.join('\n');
}

/**
 * Fail-closed: die @adr/@guide-Angaben in repository.json muessen zu den
 * Annotationen in den Dateikoepfen passen. Sonst wuerde die generierte
 * Tabelle luegen — genau das soll die SSoT verhindern.
 */
function pruefeRepositoryDrift() {
  const repo = ladeRepository();
  const probleme = [];
  for (const gruppe of ['css', 'js', 'addons']) {
    for (const eintrag of repo[gruppe] || []) {
      const pfad = path.join(ROOT, 'website', eintrag.file);
      if (!fs.existsSync(pfad)) {
        probleme.push(`${eintrag.file}: Datei existiert nicht`);
        continue;
      }
      const kopf = fs.readFileSync(pfad, 'utf8').split('\n').slice(0, 40).join('\n');
      const liste = (re) => [...new Set([...kopf.matchAll(re)].map((m) => m[1]))].sort();
      const adrDatei = liste(/@adr \[\[([^\]]+)\]\]/g);
      const guideDatei = liste(/@guide \[\[([^\]]+)\]\]/g);
      const split = (wert) => String(wert || '').split(',').map((s) => s.trim()).filter(Boolean).sort();
      const adrJson = split(eintrag.adr);
      const guideJson = split(eintrag.guide);
      if (adrDatei.join('|') !== adrJson.join('|')) {
        probleme.push(`${eintrag.file}: @adr JSON [${adrJson.join(', ')}] vs Datei [${adrDatei.join(', ')}]`);
      }
      if (guideDatei.join('|') !== guideJson.join('|')) {
        probleme.push(`${eintrag.file}: @guide JSON [${guideJson.join(', ')}] vs Datei [${guideDatei.join(', ')}]`);
      }
    }
  }
  if (probleme.length) {
    throw new Error(`repository.json driftet gegen die Dateien:\n  - ${probleme.join('\n  - ')}`);
  }
}

function generateStructureMap(targetDir) {
  pruefeRepositoryDrift();
  // Datum OHNE Uhrzeit-Zugriff (kein new Date): der letzte Commit, der die
  // Quellen (docs/, ohne dieses Artefakt) geaendert hat. Bleibt ueber Laeufe
  // hinweg stabil -> die Datei ist idempotent; der Vergleich ignoriert `updated:`
  // ohnehin, es loest also nie eine Neuschreibung aus.
  let isoDate = '2026-10-17';
  try {
    // execFileSync statt execSync: unter Windows zerlegt cmd.exe die
    // einfachen Anführungszeichen des Pathspecs (':!docs') und git bricht mit
    // "Invalid path" ab. Ohne Shell gibt es diese Klasse Fehler nicht.
// execFileSync already imported
    isoDate =
      execFileSync('git', ['log', '-1', '--format=%cs', '--', 'docs', ':(exclude)docs/STRUCTURE.md'], {
        cwd: targetDir,
        encoding: 'utf8',
      }).trim() || isoDate;
  } catch (e) {}

  const structMd = `---
id: structure
title: 'Repo-Struktur — DIN-BriefNEO'
type: reference
status: active
type: index
summary: "Autogenerierte Strukturübersicht aller Module, Werkzeuge und Dokumentation für DIN-BriefNEO."
created: '2026-10-17'
updated: '${isoDate}'
tags:
  - autogenerated
  - structure
  - repo-map
doc_links:
  - index
code_links: []
depends_on: []
---

<!-- AUTOGENERATED - DO NOT EDIT -->
<!-- Stand: __STAND__ -->
<!-- Regeneriert durch: node tools/fitness/build_db.js -->

# Repo-Struktur — DIN-BriefNEO

## Produktionscode (\`website/\`)
${produktionscodeTabelle()}
## Werkzeuge (\`tools/\`)
| Datei / Modul | Zweck |
|---|---|
| din.mjs | Zentrale CLI: Test, Fitness, Laws, Dev, Measure, Data, Docs, Content |
| dev.sh | Server 8088 + Debug-Browser (CDP :9222) mit Altprozess-Bereinigung |
| runtime/ | M1: Browser-, CDP- und Dev-Laufzeit (static-server, cdp, runner, mcp-live) |
| measure/ | M2: Geometrie-, Druck-, PDF-, TTC- und Pixel-Messung |
| fitness/ | M3: Score-Engine, DB-Build, Stand-Hash, Repo-Map-Check |
| laws/ | M4: Die 7 Verfassungs-Sonden (imr, structural, isolation, links, terms, coverage, ids) |
| content/ | M5: Daten-Pipelines & Inhalts-Sync (PLZ, Grosskunden, Backlog, Dossier, Chrome-Radar, ADR) |
| fonts/ | DIN-5008 Font-Subsetting (Python) |
| oneoff/ | Archivierte Einmalskripte (check-feature, og-image, seeder-diff) |
| browser-audit.html | Interaktives Browser-Feature-Audit (GUI) |

## Dokumentation (\`docs/\`)
| Ordner | Zweck |
|---|---|
| css/ | CSS-Architektur, Sheets, Geometrie, Multi-Page, No-Scroll |
| js/ | JS-Module, State-Management, Salutation, Autocomplete |
| data/ | Daten-Pipelines, PLZ- und Großkundendaten |
| fonts/ | Typografie & DIN-5008 Schriften |
| addons/ | Addon-Dokumentation & Erweiterungen |
| norm/ | Verfassung, Law Catalog, Longevity Guidelines, Spezifikation, IMR |
| meta/ | Arbeitsweise, Decision-Log, Backlog, Roadmap, Tooling-Übersicht |
| archive/ | Eingefrorene historische Artefakte & Reviews (nicht normativ) |
| audit/ | Zeitbezogene Sprint- und Review-Spezifikationen |

## Tests (\`test/\`)
| Datei | Zweck |
|---|---|
| all.js | Unit-Tests (Sanitizer, Caret, Domain-Funktionen) |
| runner.js | Zero-Dependency Test-Runner (Konsole & Browser) |
| index.html | Test-Einstiegspunkt für den Browser |
`;

  // Stand = Inhalts-Hash des Rumpfs; damit ist die Datei idempotent (Lauf 2
  // schreibt nichts). Zeitabhaengige Felder ('updated:') werden beim Vergleich
  // neutralisiert, damit sie allein keine Neuschreibung ausloesen.
  const stand = standHelper.computeStand(structMd);
  const finalMd = structMd.replace('__STAND__', stand);

  const structurePath = path.join(targetDir, 'docs', 'STRUCTURE.md');
  if (fs.existsSync(structurePath)) {
    const existing = fs.readFileSync(structurePath, 'utf8');
    const normalize = (s) => s.replace(/^updated: .*$/m, 'updated: <t>');
    if (normalize(existing) === normalize(finalMd)) {
      return;
    }
  }
  fs.writeFileSync(structurePath, finalMd, 'utf8');
}

function buildDatabase(targetDir = ROOT, { quiet = false } = {}) {
  const startTime = performance.now();
  const isQ = isQuiet || quiet;
  const trashDir = path.join(targetDir, '.trash');
  if (!fs.existsSync(trashDir) || fs.readdirSync(trashDir).length === 0) {
    console.error("🔴 Build failed: Invariante verletzt — '.trash/' existiert nicht oder ist leer!");
    process.exit(1);
  }
  // Wegweiser-Gate (E3): genannte Pfade existieren, jedes JS-Modul ist erwaehnt.
  const mapRes = checkRepoMap(targetDir);
  if (!mapRes.ok) {
    console.error('🔴 Build failed: Wegweiser-Gate (AUFGABEN-WEGWEISER.md):');
    for (const f of mapRes.fehler) console.error(f);
    process.exit(1);
  }

  generateStructureMap(targetDir);
  if (!isQ) console.log('Running Reality Reconciliation & Fitness Check...');
  const report = runReconciliation();

  if (!isQuiet) {
    console.log('\n==================================================');
    console.log(`EVOLUTIONARY FITNESS SCORE: ${report.score}%`);
    console.log('--------------------------------------------------');
    console.log(`- Metadata Score:    ${report.dimensions.metadata}%`);
    console.log(`- Coherence Score:   ${report.dimensions.coherence}%`);
    console.log(`- Conformance Score: ${report.dimensions.conformance}%`);
    console.log(`- Features Score:    ${report.dimensions.features}%`);
    console.log('==================================================\n');

    if (report.logs.length > 0) {
      console.log('Diagnoses and Violations:');
      report.logs.forEach(log => {
        const icon = log.severity === 'critical' ? '🔴 [CRITICAL]' : log.severity === 'high' ? '🟡 [HIGH]' : log.severity === 'medium' ? '🔵 [MEDIUM]' : '⚪ [LOW]';
        console.log(`${icon} (${log.check_type}) in ${log.file_path || 'Global'}: ${log.message}`);
      });
      console.log('');
    }
  }

  if (!report.success || report.score < 100) {
    if (isQuiet) {
      console.error(`✗ Fitness Score: ${report.score}% (< 100.0%)`);
      report.logs.forEach(log => {
        const icon = log.severity === 'critical' ? '🔴 [CRITICAL]' : log.severity === 'high' ? '🟡 [HIGH]' : log.severity === 'medium' ? '🔵 [MEDIUM]' : '⚪ [LOW]';
        console.error(`${icon} (${log.check_type}) in ${log.file_path || 'Global'}: ${log.message}`);
      });
    } else {
      console.error('🔴 Build failed: Critical architectural violations found or Fitness Score < 100%! Generation stopped.');
    }
    process.exit(1);
  }

  // Tri-direktionale Code-Verknüpfung (Code-Referenzen.md & Function-Traceability.md)
  const codeDirs = [path.join(targetDir, 'website'), path.join(targetDir, 'website', 'js'), path.join(targetDir, 'website', 'css')];
  const codeLinks = [];
  codeDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isFile() && (f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.html'))) {
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        lines.forEach((line, idx) => {
          const adrMatch = line.match(/@adr\s+\[\[(.*?)\]\](?:\s+\{(.*?)\})?/);
          const guideMatch = line.match(/@guide\s+\[\[(.*?)\]\](?:\s+\{(.*?)\})?/);
          if (adrMatch || guideMatch) {
            const adrRef = adrMatch ? adrMatch[1] : '';
            const guideRef = guideMatch ? guideMatch[1] : '';
            const funcName = (adrMatch && adrMatch[2]) || (guideMatch && guideMatch[2]) || null;
            const relPath = path.relative(targetDir, p).replace(/\\/g, '/');
            
            // Vermeide Duplikate durch mehrfache codeDirs (z.B. website/ vs website/js)
            if (!codeLinks.some(l => l.file === relPath && l.line === idx + 1)) {
              codeLinks.push({ file: relPath, line: idx + 1, adr: adrRef, guide: guideRef, funcName });
            }
          }
        });
      }
    });
  });

  // Generate Code-Referenzen.md into BUILD_DIR
  if (codeLinks.length > 0) {
    let md = `---
id: adr-code-referenzen
title: Code-Referenzen
type: adr
status: active
doc_links: []
code_links: []
depends_on: []
tags:
  - autogenerated
  - adr
  - guide
  - code
created: 2026-07-06
updated: 2026-07-06
chosen_option: ""
decision_options: []
---

# Code-Referenzen

Diese Datei wird automatisch von \`build_db.js\` generiert und listet alle Architektur- und Guide-Verknüpfungen aus dem Quellcode auf.

`;
    md += '| Code Datei | Zeile | ADR | Guide |\n';
    md += '| :--- | :--- | :--- | :--- |\n';
    codeLinks.forEach(link => {
       const adrStr = link.adr ? `[[${link.adr}]]` : '-';
       const guideStr = link.guide ? `[[${link.guide}]]` : '-';
       md += `| ${link.file} | ${link.line} | ${adrStr} | ${guideStr} |\n`;
    });
    fs.writeFileSync(path.join(BUILD_DIR, 'Code-Referenzen.md'), md, 'utf8');

    // Generate Function-Traceability.md into BUILD_DIR
    const matrix = new Map();
    codeLinks.forEach(link => {
      const key = `${link.file}::${link.funcName || ''}`;
      if (!matrix.has(key)) {
        matrix.set(key, { file: link.file, funcName: link.funcName, adrs: new Set(), guides: new Set() });
      }
      const entry = matrix.get(key);
      if (link.adr) entry.adrs.add(link.adr);
      if (link.guide) entry.guides.add(link.guide);
    });

    let ftMd = `---
id: doc-function-traceability
title: Function Traceability Matrix
type: reference
status: active
tags:
  - autogenerated
  - architecture
  - traceability
---

# Function Traceability Matrix

Diese Datei wird automatisch von \`build_db.js\` generiert und bildet alle Quellcode-Dateien auf Architektur-Records (ADR) und Guides ab.

| Funktion / Modul | Code Datei | Architektur-Record (ADR) | Implementierungs-Guide |
| :--- | :--- | :--- | :--- |
`;
    Array.from(matrix.keys()).sort().forEach(k => {
      const entry = matrix.get(k);
      const basename = path.basename(entry.file);
      const displayName = entry.funcName || basename.replace(/\.(js|css|html)$/, '').replace(/^[0-9]+-/, '').replace(/^./, c => c.toUpperCase());
      const adrs = Array.from(entry.adrs).sort().map(a => `[[${a}]]`).join(', ') || '-';
      const guides = Array.from(entry.guides).sort().map(g => `[[${g}]]`).join(', ') || '-';
      ftMd += `| **${displayName}** | \`${entry.file}\` | ${adrs} | ${guides} |\n`;
    });
    fs.writeFileSync(path.join(BUILD_DIR, 'Function-Traceability.md'), ftMd, 'utf8');
  }

  const durationMs = Math.round(performance.now() - startTime);
  console.log(`✓ Fitness Score: 100.0% (clean) [${durationMs}ms]`);
  return 0;
}

// Als Modul geladen (z. B. von tools/build_db.js) darf das Gate nicht schon beim
// require() loslaufen; der Direktaufruf `node tools/fitness/build_db.js` bleibt
// identisch. `generateStructure` schreibt nur docs/STRUCTURE.md (kein Score).


export const generateStructure = generateStructureMap;
export { buildDatabase, generateStructureMap };

/* ==================================================================
   CLI Dispatcher
   ================================================================== */
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("repo-map")) {
    const res = checkRepoMap(ROOT);
    if (!res.ok) {
      for (const f of res.fehler) console.error(f);
      console.error(`\n❌ Wegweiser-Gate: ${res.fehler.length} Problem(e).`);
      return 1;
    }
    console.log(`✓ Wegweiser: ${res.pfadeCount} Pfade geprüft, ${res.moduleCount} Module erwähnt.`);
    return 0;
  }

  if (args.includes("--only-rules") || args.includes("rules")) {
    return checkAntipatternsOnly();
  }

  const quiet = args.includes("-q") || args.includes("--quiet");
  return buildDatabase(ROOT, { quiet });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().then((code) => { process.exitCode = typeof code === "number" ? code : 0; });
}
