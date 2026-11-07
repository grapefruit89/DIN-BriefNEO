// test/runner.js — Zero-Dependency Mini-Test-Runner (Option B, DECISION-LOG 2026-09-10).
// Kein Framework, keine npm-Abhängigkeit: describe/it/asserts + DOM-Report.
// Ergebnisse werden zusätzlich als `window.__TEST_RESULTS` bereitgestellt, damit
// ein headless Runner (tools/test-runner.mjs) sie ohne DOM-Parsing abholen kann.
/* eslint-disable no-console */

/** @type {{name: string, tests: {desc: string, fn: () => void | Promise<void>}[]}[]} */
const suites = [];
/** @type {{name: string, tests: {desc: string, fn: () => void | Promise<void>}[]} | null} */
let current = null;

/**
 * @param {string} name
 * @param {() => void} fn
 */
export function describe(name, fn) {
  current = { name, tests: [] };
  suites.push(current);
  try { fn(); } finally { current = null; }
}

/**
 * @param {string} desc
 * @param {() => void | Promise<void>} fn
 */
export function it(desc, fn) {
  if (!current) throw new Error('it() muss innerhalb von describe() aufgerufen werden');
  current.tests.push({ desc, fn });
}

/**
 * @param {unknown} condition
 * @param {string} [msg]
 */
export function assert(condition, msg = 'Assertion fehlgeschlagen') {
  if (!condition) throw new Error(msg);
}

/**
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string} [msg]
 */
export function assertEqual(actual, expected, msg = '') {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg} — erwartet: ${b}, erhalten: ${a}`);
}

/**
 * Liest einen optionalen `?filter=<regex>` aus der URL. Ungültige Ausdrücke
 * werden ignoriert (mit Warnung), damit ein Tippfehler nicht die ganze Suite killt.
 * @returns {RegExp | null}
 */
function leseFilter() {
  if (typeof location === 'undefined') return null;
  const raw = new URLSearchParams(location.search).get('filter');
  if (!raw) return null;
  try {
    return new RegExp(raw, 'i');
  } catch (e) {
    console.warn(`[Runner] Ungültiger Filter "${raw}" ignoriert:`, e);
    return null;
  }
}

/**
 * Führt alle registrierten Suiten aus und rendert den Report ins DOM (#test-report)
 * und die Konsole. Läuft async weiter, wenn ein Test async ist.
 * @returns {Promise<boolean>} true, wenn alle Tests bestanden haben
 */
export async function run() {
  const reportEl = document.getElementById('test-report') ?? document.body;
  const filter = leseFilter();
  let total = 0;
  let passed = 0;
  let skipped = 0;
  const failures = [];

  for (const suite of suites) {
    const h = document.createElement('h2');
    h.textContent = suite.name;
    reportEl.appendChild(h);
    for (const test of suite.tests) {
      if (filter && !filter.test(`${suite.name} › ${test.desc}`)) {
        skipped++;
        continue;
      }
      total++;
      const line = document.createElement('div');
      try {
        await test.fn();
        passed++;
        line.textContent = `  ✓ ${test.desc}`;
        line.style.color = 'var(--test-pass, #0a7d32)';
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        failures.push(`${suite.name} › ${test.desc}: ${message}`);
        line.textContent = `  ✗ ${test.desc} — ${message}`;
        line.style.color = 'var(--test-fail, #b3261e)';
      }
      reportEl.appendChild(line);
      console.log(line.textContent);
    }
  }

  const failed = total - passed;
  const summaryText = `${total} Tests: ${passed} bestanden, ${failed} fehlgeschlagen${skipped ? `, ${skipped} übersprungen` : ''}`;
  const summary = document.createElement('p');
  summary.textContent = summaryText;
  summary.style.fontWeight = 'bold';
  reportEl.appendChild(summary);
  console.log(`\n${summaryText}`);
  for (const f of failures) {
    console.error(`✗ ${f}`);
  }

  /** @type {any} */ (window).__TEST_RESULTS = { total, passed, failed, skipped, failures };
  /** @type {any} */ (window).__TESTS_PASSED = total === passed;
  document.title = total === passed ? '✓ Tests' : '✗ Tests';
  return total === passed;
}
