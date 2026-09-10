// test/runner.js — Zero-Dependency Mini-Test-Runner (Option B, DECISION-LOG 2026-09-10).
// Kein Framework, keine npm-Abhängigkeit: describe/it/asserts + DOM-Report.
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
  if (actual !== expected) {
    throw new Error(`${msg} — erwartet: ${JSON.stringify(expected)}, erhalten: ${JSON.stringify(actual)}`);
  }
}

/**
 * Führt alle registrierten Suites aus und rendert den Report ins DOM (#test-report)
 * und die Konsole. Läuft async weiter, wenn ein Test async ist.
 * @returns {Promise<boolean>} true, wenn alle Tests bestanden haben.
 */
export async function run() {
  const reportEl = document.getElementById('test-report') ?? document.body;
  let total = 0;
  let passed = 0;
  const failures = [];
  for (const suite of suites) {
    const h = document.createElement('h2');
    h.textContent = suite.name;
    reportEl.appendChild(h);
    for (const test of suite.tests) {
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
  const summary = document.createElement('p');
  summary.textContent = `${total} Tests: ${passed} bestanden, ${total - passed} fehlgeschlagen`;
  summary.style.fontWeight = 'bold';
  reportEl.appendChild(summary);
  console.log(`\n${summary.textContent}`);
  failures.forEach((f) => console.error(`✗ ${f}`));
  document.title = total === passed ? '✓ Tests' : '✗ Tests';
  return total === passed;
}
