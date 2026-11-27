#!/usr/bin/env node
/**
 * tools/check-feature.js
 *
 * Prüft Web-Plattform- und CSS/HTML/JS-Features gegen maschinenlesbare
 * Upstream-Daten (web-features, @mdn/browser-compat-data, baseline-browser-mapping)
 * bezüglich der Projekt-Baseline Chrome 150+.
 *
 * @adr [[ADR-RUNTIME-CONTEXT]]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CHROME_BASELINE = 150;
const DIN_HOME = process.env.DIN_BRIEFNEO_HOME || path.join(os.homedir(), '.din-briefneo');
const CACHE_DIR = path.join(DIN_HOME, 'feature-cache');
const NODE_MODULES = path.join(CACHE_DIR, 'node_modules');

const WF_DATA_PATH = path.join(NODE_MODULES, 'web-features', 'data.json');
const BCD_DATA_PATH = path.join(NODE_MODULES, '@mdn', 'browser-compat-data', 'data.json');
const BBM_PATH = path.join(NODE_MODULES, 'baseline-browser-mapping', 'dist', 'index.cjs');

/**
 * Stellt sicher, dass der Feature-Cache existiert und installiert ist.
 */
function ensureCacheInstalled() {
  if (!fs.existsSync(WF_DATA_PATH) || !fs.existsSync(BCD_DATA_PATH)) {
    console.log('[check-feature] Feature-Cache fehlt. Führe initialen Download durch...');
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      const pkgPath = path.join(CACHE_DIR, 'package.json');
      if (!fs.existsSync(pkgPath)) {
        const pkg = {
          name: 'din-briefneo-feature-cache',
          private: true,
          description: 'Isolierter Recherche-Cache fuer Web-Plattform- und Baseline-Daten',
          dependencies: {
            '@mdn/browser-compat-data': '^8.1.6',
            'baseline-browser-mapping': '^2.11.29',
            'web-features': '^3.43.0'
          }
        };
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
      }
      execSync('npm install --prefix ' + CACHE_DIR + ' --no-audit --no-fund', { stdio: 'inherit' });
      console.log('[check-feature] Feature-Cache erfolgreich aufgebaut.\n');
    } catch (err) {
      console.error('[check-feature] FEHLER: Cache-Installation fehlgeschlagen:', err.message);
      process.exit(1);
    }
  }
}

/**
 * Aktualisiert die Upstream-Pakete auf @latest.
 */
function refreshCache() {
  console.log('[check-feature] Aktualisiere Upstream-Daten auf @latest...');
  try {
    execSync(
      'npm install --prefix ' + CACHE_DIR + ' @mdn/browser-compat-data@latest web-features@latest baseline-browser-mapping@latest --no-audit --no-fund',
      { stdio: 'inherit' }
    );
    console.log('[check-feature] Upstream-Daten erfolgreich aktualisiert.');
  } catch (err) {
    console.warn('[check-feature] WARNUNG: Aktualisierung fehlgeschlagen. Bestehender Cache bleibt aktiv:', err.message);
  }
}

/**
 * Lädt die Cache-Daten.
 */
function loadDatasets() {
  ensureCacheInstalled();
  const wf = JSON.parse(fs.readFileSync(WF_DATA_PATH, 'utf8'));
  const bcd = JSON.parse(fs.readFileSync(BCD_DATA_PATH, 'utf8'));
  return { wf, bcd };
}

/**
 * Normalisiert den Suchbegriff.
 */
function normalizeInput(raw) {
  let s = raw.trim().toLowerCase();
  
  // Syntax-Stripping für Selektoren und Tags
  s = s.replace(/^<|>$/g, ''); // <dialog> -> dialog
  s = s.replace(/^:+/, '');    // ::picker / :has -> picker / has
  s = s.replace(/\(\)$/, '');   // has() -> has

  // Optionale Präfixe wie "css ", "html ", "js " strippen
  const stripped = s.replace(/^(css|html|js|api)\s+/i, '');

  let prop = s;
  let subval = null;

  if (s.includes(':')) {
    const parts = s.split(':').map(p => p.trim());
    prop = parts[0];
    subval = parts[1];
  }

  const slug = stripped.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return { raw: raw.trim(), prop, subval, clean: s, stripped, slug };
}

/**
 * Sucht in BCD nach Support-Daten.
 */
function findInBCD(bcd, norm) {
  const { prop, subval } = norm;
  const results = [];

  // 1. CSS Properties
  if (bcd.css && bcd.css.properties) {
    const pData = bcd.css.properties[prop];
    if (pData) {
      if (subval && pData[subval] && pData[subval].__compat) {
        results.push({
          source: '@mdn/browser-compat-data',
          category: 'css.properties.' + prop + '.' + subval,
          compat: pData[subval].__compat,
          name: prop + ': ' + subval
        });
      }
      if (pData.__compat) {
        results.push({
          source: '@mdn/browser-compat-data',
          category: 'css.properties.' + prop,
          compat: pData.__compat,
          name: prop
        });
      }
    }
  }

  // 2. CSS Selectors
  if (bcd.css && bcd.css.selectors) {
    const sData = bcd.css.selectors[prop];
    if (sData && sData.__compat) {
      results.push({
        source: '@mdn/browser-compat-data',
        category: 'css.selectors.' + prop,
        compat: sData.__compat,
        name: ':' + prop
      });
    }
  }

  // 3. HTML Elements
  if (bcd.html && bcd.html.elements) {
    const elData = bcd.html.elements[prop];
    if (elData) {
      if (subval && elData[subval] && elData[subval].__compat) {
        results.push({
          source: '@mdn/browser-compat-data',
          category: 'html.elements.' + prop + '.' + subval,
          compat: elData[subval].__compat,
          name: '<' + prop + ' ' + subval + '>'
        });
      }
      if (elData.__compat) {
        results.push({
          source: '@mdn/browser-compat-data',
          category: 'html.elements.' + prop,
          compat: elData.__compat,
          name: '<' + prop + '>'
        });
      }
    }
    // Durchsuche globale Attribute / Attribute anderer Elemente
    if (!elData && !subval) {
      for (const [tag, tData] of Object.entries(bcd.html.elements)) {
        if (tData[prop] && tData[prop].__compat) {
          results.push({
            source: '@mdn/browser-compat-data',
            category: 'html.elements.' + tag + '.' + prop,
            compat: tData[prop].__compat,
            name: tag + '[' + prop + ']'
          });
        }
      }
    }
  }

  // 4. JS Builtins & API
  if (bcd.javascript && bcd.javascript.builtins) {
    const jData = bcd.javascript.builtins[prop];
    if (jData && jData.__compat) {
      results.push({
        source: '@mdn/browser-compat-data',
        category: 'javascript.builtins.' + prop,
        compat: jData.__compat,
        name: prop
      });
    }
  }
  if (bcd.api) {
    const aData = bcd.api[prop];
    if (aData && aData.__compat) {
      results.push({
        source: '@mdn/browser-compat-data',
        category: 'api.' + prop,
        compat: aData.__compat,
        name: prop + ' API'
      });
    }
  }

  return results;
}

/**
 * Sucht in web-features nach High-Level Feature-Status.
 */
function findInWebFeatures(wf, norm) {
  const { clean, prop, stripped, slug } = norm;
  const results = [];

  // 1. Exakte ID-Prüfung (clean, prop, slug, stripped)
  const candidateKeys = [clean, prop, slug, stripped].filter(Boolean);
  for (const k of candidateKeys) {
    if (wf.features[k]) {
      results.push({ id: k, feat: wf.features[k] });
      return results;
    }
  }

  // 2. Suche nach Name oder Alias (exakt)
  const searchCandidates = [clean, stripped, slug].map(s => s.replace(/[^a-z0-9]/g, ''));
  for (const [id, f] of Object.entries(wf.features)) {
    const fName = (f.name || '').toLowerCase();
    const fNameClean = fName.replace(/[^a-z0-9]/g, '');
    const fIdClean = id.replace(/[^a-z0-9]/g, '');

    if (searchCandidates.includes(fIdClean) || searchCandidates.includes(fNameClean) || fName.toLowerCase() === stripped || fName.toLowerCase() === clean) {
      results.push({ id, feat: f });
      return results;
    }
  }

  // 3. Fallback: Enthält-Suche, wenn sonst nichts gefunden
  if (clean.length >= 3) {
    const q = stripped.length >= 3 ? stripped : clean;
    for (const [id, f] of Object.entries(wf.features)) {
      const fName = (f.name || '').toLowerCase();
      if (id.includes(q) || fName.includes(q)) {
        results.push({ id, feat: f });
      }
    }
  }

  return results;
}

/**
 * Extrahiert den sauberen Versionsstring aus BCD- oder web-features-Supportwerten.
 */
function extractVersion(val) {
  if (!val) return null;
  if (Array.isArray(val)) {
    const versions = [];
    for (const item of val) {
      if (item && item.version_added && typeof item.version_added === 'string') {
        versions.push(item.version_added);
      } else if (item && item.version_added === true) {
        return true;
      }
    }
    if (versions.length > 0) {
      versions.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      return versions[0];
    }
    return val[0]?.version_added || null;
  }
  if (typeof val === 'object') {
    return val.version_added !== undefined ? val.version_added : null;
  }
  return val;
}

/**
 * Formatiert den Versionswert.
 */
function formatVersion(v) {
  const extracted = extractVersion(v);
  if (extracted === true) return 'ja (frühe Version)';
  if (extracted === false || extracted === null || extracted === undefined) return 'nicht unterstützt';
  return String(extracted).endsWith('+') ? String(extracted) : extracted + '+';
}

/**
 * Führt den Feature-Lookup durch und gibt das strukturierte Ergebnis zurück.
 */
function evaluateFeature(query, datasets) {
  const { wf, bcd } = datasets;
  const norm = normalizeInput(query);

  const wfMatches = findInWebFeatures(wf, norm);
  const bcdMatches = findInBCD(bcd, norm);

  if (wfMatches.length === 0 && bcdMatches.length === 0) {
    return {
      query: norm.raw,
      found: false
    };
  }

  let title = norm.raw;
  let sources = [];
  let baselineStatus = 'unbekannt';
  let baselineDate = null;
  let chromeVer = null;
  let firefoxVer = null;
  let safariVer = null;

  // Auswertung web-features (High-Level)
  if (wfMatches.length > 0) {
    sources.push('web-features');
    const bestWF = wfMatches[0];
    title = bestWF.feat.name || bestWF.id;
    const b = bestWF.feat.status?.baseline;
    if (b === 'high') {
      baselineStatus = 'widely available';
      baselineDate = bestWF.feat.status?.baseline_low_date || bestWF.feat.status?.baseline_high_date || null;
    } else if (b === 'low') {
      baselineStatus = 'newly available';
      baselineDate = bestWF.feat.status?.baseline_low_date || null;
    } else if (b === false) {
      baselineStatus = 'limited availability';
    }

    if (bestWF.feat.status?.support) {
      chromeVer = bestWF.feat.status.support.chrome || null;
      firefoxVer = bestWF.feat.status.support.firefox || null;
      safariVer = bestWF.feat.status.support.safari || null;
    }

    // Wenn Aggregate-Support für Chrome fehlt, aber by_compat_key existiert
    if (!chromeVer && bestWF.feat.status?.by_compat_key) {
      const chromeVersions = [];
      for (const [key, val] of Object.entries(bestWF.feat.status.by_compat_key)) {
        const c = val.support?.chrome;
        if (c && typeof c === 'string') {
          chromeVersions.push(c);
        }
      }
      if (chromeVersions.length > 0) {
        // Sortiere numerisch und nimm die früheste Version (Kernunterstützung)
        chromeVersions.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        chromeVer = chromeVersions[0];
      }
    }
  }

  // Auswertung BCD (Detaillierte Atom-Wahrheit)
  if (bcdMatches.length > 0) {
    sources.push('@mdn/browser-compat-data');
    const bestBCD = bcdMatches[0];
    if (sources.length === 1) {
      title = bestBCD.name || bestBCD.category;
    }
    const sup = bestBCD.compat.support;
    if (sup) {
      const c = extractVersion(sup.chrome);
      const f = extractVersion(sup.firefox);
      const s = extractVersion(sup.safari);

      // BCD hat Vorrang für atomare Engine-Versionen
      if (c !== null && c !== undefined) chromeVer = c;
      if (f !== null && f !== undefined) firefoxVer = f;
      if (s !== null && s !== undefined) safariVer = s;
    }
  } else if (norm.slug && bcd.css && bcd.css.properties) {
    // Falls kein direkter BCD Match, aber z.B. position-anchor zu anchor-positioning passt
    const relatedKeys = ['position-' + norm.slug, norm.slug, 'position-anchor'];
    for (const rk of relatedKeys) {
      if (bcd.css.properties[rk] && bcd.css.properties[rk].__compat) {
        sources.push('@mdn/browser-compat-data');
        const sup = bcd.css.properties[rk].__compat.support;
        if (sup && sup.chrome) {
          const c = extractVersion(sup.chrome);
          if (c) chromeVer = c;
        }
        break;
      }
    }
  }

  // Dedupliziere Sources
  sources = Array.from(new Set(sources));

  // Projekt-Baseline Evaluation (Chrome 150+)
  let projectStatus = '';
  let statusBadge = '';
  let hint = null;

  let chromeNum = null;
  if (typeof chromeVer === 'string') {
    chromeNum = parseInt(chromeVer, 10);
  } else if (chromeVer === true) {
    chromeNum = 1;
  }

  if (chromeVer === false || chromeVer === null) {
    statusBadge = '❌ NICHT NUTZBAR';
    projectStatus = 'in Chromium bisher nicht implementiert';
  } else if (!isNaN(chromeNum) && chromeNum <= CHROME_BASELINE) {
    statusBadge = '✅ NUTZBAR';
    projectStatus = `Chrome 150+ erfüllt, unterstützt ab Chrome ${formatVersion(chromeVer)}`;
  } else if (!isNaN(chromeNum) && chromeNum > CHROME_BASELINE) {
    statusBadge = '⚠️ NUR WENN BASELINE ANGEHOBEN WIRD';
    projectStatus = `erfordert Chrome ${formatVersion(chromeVer)}, aktuell Baseline ${CHROME_BASELINE}`;
  } else {
    statusBadge = '❓ UNKLAR';
    projectStatus = `Versionsangabe nicht eindeutig parsbahr: ${chromeVer}`;
  }

  // Zusatz-Hinweis für Chrome-only
  if (chromeNum !== null && chromeNum <= CHROME_BASELINE && (firefoxVer === false || safariVer === false)) {
    hint = '⚠️ Chrome-only-Feature (keine plattformweite Baseline für Firefox/Safari)';
  }

  return {
    query: norm.raw,
    found: true,
    title,
    sources,
    baselineStatus: baselineDate ? `${baselineStatus} (seit ${baselineDate})` : baselineStatus,
    support: {
      chrome: formatVersion(chromeVer),
      firefox: formatVersion(firefoxVer),
      safari: formatVersion(safariVer)
    },
    statusBadge,
    projectStatus,
    hint
  };
}

/**
 * Listet alle Feature-Gruppen aus web-features auf.
 */
function listGroups(wf) {
  console.log('\n=== Verfügbare Feature-Gruppen (web-features) ===\n');
  if (!wf.groups) {
    console.log('Keine Gruppen-Definitionen gefunden.');
    return;
  }
  const entries = Object.entries(wf.groups).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [id, g] of entries) {
    console.log(`• ${id.padEnd(24)}: ${g.name || id}`);
  }
  console.log(`\nGesamt: ${entries.length} Gruppen.\n`);
}

/**
 * Zeigt die CLI-Hilfe an.
 */
function showHelp() {
  console.log(`
Verwendung: node tools/check-feature.js [OPTIONEN] <SUCHBEGRIFF>

Prüft CSS/HTML/JS-Features gegen die Projekt-Baseline Chrome 150+
unter Verwendung von web-features und @mdn/browser-compat-data.

Optionen:
  <suchbegriff>     Feature-Name, CSS-Eigenschaft, Selektor oder Attribut
  --refresh         Aktualisiert Upstream-Daten auf @latest
  --list-groups     Listet alle Feature-Gruppen aus web-features auf
  --json            Maschinenlesbare JSON-Ausgabe
  --help, -h        Zeigt diese Hilfe an
  --version, -v     Versionsanzeige

Beispiele:
  node tools/check-feature.js "text-fit: shrink"
  node tools/check-feature.js ":has"
  node tools/check-feature.js "text-wrap: balance"
  node tools/check-feature.js "CSS Anchor Positioning"
  node tools/check-feature.js --json "field-sizing"
`);
}

/**
 * Hauptprogramm
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('check-feature v1.0.0 (DIN-BriefNEO, Chrome 150+ Baseline)');
    process.exit(0);
  }

  if (args.includes('--refresh')) {
    ensureCacheInstalled();
    refreshCache();
    process.exit(0);
  }

  const isJson = args.includes('--json');
  const queryArgs = args.filter(a => !a.startsWith('--') && !a.startsWith('-'));

  const datasets = loadDatasets();

  if (args.includes('--list-groups')) {
    listGroups(datasets.wf);
    process.exit(0);
  }

  if (queryArgs.length === 0) {
    console.error('Fehler: Kein Suchbegriff angegeben. Siehe --help.');
    process.exit(1);
  }

  const query = queryArgs.join(' ');
  const res = evaluateFeature(query, datasets);

  if (isJson) {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }

  if (!res.found) {
    console.log(`\nFeature:  ${res.query}`);
    console.log(`Status:   ❓ NICHT in Upstream-Daten gefunden`);
    console.log(`Hinweis:  Rechtschreibung prüfen oder Feature existiert noch nicht als Standard.\n`);
    process.exit(0);
  }

  console.log(`\nFeature:  ${res.title}`);
  console.log(`Quellen:  ${res.sources.join(', ')}`);
  console.log(`Baseline: ${res.baselineStatus}`);
  console.log(`Support:`);
  console.log(`  • Chrome:  ${res.support.chrome}`);
  console.log(`  • Firefox: ${res.support.firefox}`);
  console.log(`  • Safari:  ${res.support.safari}`);
  console.log(`Status:   ${res.statusBadge} (${res.projectStatus})`);
  if (res.hint) {
    console.log(`Hinweis:  ${res.hint}`);
  }
  console.log('');
}

main();
