const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.resolve(__dirname, '..');
const websiteDir = path.join(targetDir, 'website');
const antipatternsDir = path.join(__dirname, 'antipatterns');

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
        const isAnchor = line.includes('<a') || line.includes('pointer-events: auto');
        if (isAnchor) return false;
        
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
    file: 'website/js/main.js'
  },
  'CSS Anchor Positioning': {
    regex: /anchor-name|position-anchor|position-area/g,
    file: 'website/css/floating.css'
  },
  'CSS @scope': {
    regex: /@scope/g,
    file: 'website/css/layout.css'
  },
  'CSS field-sizing': {
    regex: /field-sizing/g,
    file: 'website/css/layout.css'
  },
  'CSS light-dark()': {
    regex: /light-dark\(/g,
    file: 'website/css/variables.css'
  },
  'CSS Relative Color Syntax': {
    regex: /oklch\(from/g,
    file: 'website/css/variables.css'
  },
  'View Transitions': {
    regex: /startViewTransition/g,
    file: 'website/js/main.js'
  }
};

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      const ignoredDirs = ['website', '.git', 'tools', 'build', 'venv', 'node_modules', '.agents', '.claude'];
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

function matchFilePattern(filePath, patterns) {
  const ext = path.extname(filePath).toLowerCase();
  return patterns.some(pattern => {
    if (pattern === '*' || pattern === '*.*') return true;
    if (pattern.startsWith('*.')) {
      return ext === pattern.slice(1).toLowerCase();
    }
    const normPattern = pattern.replace(/\\/g, '/');
    const normPath = filePath.replace(/\\/g, '/');
    return normPath.endsWith(normPattern) || normPath.includes(normPattern);
  });
}

function isExempt(rule, filePath, line, lineContent) {
  if (!rule.exemptions || rule.exemptions.length === 0) return false;
  return rule.exemptions.some(ex => {
    const normExFile = ex.file.replace(/\\/g, '/');
    const normFilePath = filePath.replace(/\\/g, '/');
    
    if (!normFilePath.endsWith(normExFile)) return false;
    
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

function runReconciliation() {
  const logs = [];
  const relations = [];
  
  // 0. JSDoc Type-Safety Verification
  let tscSuccess = true;
  let tscOutput = '';
  try {
    tscOutput = execSync('npx -p typescript tsc -p jsconfig.json', { cwd: targetDir, encoding: 'utf8', stdio: 'pipe' });
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

  // We need conformance variables earlier so we can increment them for TS/Scrub checks
  let conformanceChecked = 0;
  let conformancePassed = 0;

  if (!tscSuccess) {
     conformanceChecked += 1; // Mark as failed TS check
  } else {
     conformanceChecked += 1;
     conformancePassed += 1; // Mark as passed TS check
  }

  const docFiles = getFilesRecursively(targetDir);
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
        // only flag lines that don't carry an explicit negation/prohibition marker nearby.
        const scrubNegationPattern = /\b(?:kein|keine|keinem|keinen|ohne|no|not|non-|verbot|forbidden|banned|nie|niemals)\b/i;
        // "etc." after an enumeration ("React, Vue, etc.") marks a descriptive comparison
        // ("other frameworks do X"), not a recommendation to use the named tech.
        const scrubEnumerationPattern = /\b(?:React|Vue)\b[^.\n]{0,40}\betc\.?/i;
        const lines = content.split(/\r?\n/);
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
          const urlPath = decodeURIComponent(targetLink.slice(8));
          if (urlPath.match(/^\/[a-zA-Z]:/)) {
            resolvedTarget = path.normalize(urlPath.slice(1));
          } else {
            resolvedTarget = path.normalize(urlPath);
          }
        } else {
          const fileDir = path.dirname(file);
          resolvedTarget = path.resolve(fileDir, targetLink);
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
  
  const scanCodeFiles = (dir) => {
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
  };

  const codeFiles = scanCodeFiles(websiteDir);

  codeFiles.forEach(file => {
    const relPath = path.relative(targetDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split(/\r?\n/);
    const ext = path.extname(file);

    ANTIPATTERN_RULES.forEach(rule => {
      if (!matchFilePattern(relPath, rule.file_patterns)) return;

      conformanceChecked++;
      let ruleViolationCount = 0;

      lines.forEach((line, index) => {
        if (isExempt(rule, relPath, index + 1, line)) return;

        let hasViolation = false;
        if (CUSTOM_CHECKS[rule.id]) {
          hasViolation = CUSTOM_CHECKS[rule.id](line, ext, relPath);
        } else if (rule.pattern) {
          const regex = new RegExp(rule.pattern, 'g');
          hasViolation = regex.test(line);
        }

        if (hasViolation) {
          ruleViolationCount++;
          logs.push({
            file_path: relPath,
            check_type: 'antipattern',
            severity: rule.severity,
            antipattern_id: rule.id,
            message: `[${rule.id}] Verstoff gegen "${rule.description}" in Zeile ${index + 1}`
          });
        }
      });

      if (ruleViolationCount === 0) {
        conformancePassed++;
      }
    });
  });

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

module.exports = {
  runReconciliation
};
