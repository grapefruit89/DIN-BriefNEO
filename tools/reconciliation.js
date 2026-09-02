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
