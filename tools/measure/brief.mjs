#!/usr/bin/env node
// @ts-check
/**
 * tools/measure/brief.mjs — Messung des Testbrief-Generators -- ohne Browser.
 *
 * Prüft die Eigenschaften, die der Klick auf „Testbrief" erzeugen soll, an
 * derselben Logik: `waehleBesetzung`, `getCharHook`, `waehleSzenario` und
 * `generateNerdText` werden aus dem Addon importiert, nicht nachgebaut.
 *
 * Aufruf:
 *   node tools/measure/brief.mjs -n 50 -q
 *   node tools/measure/brief.mjs -n 1000 -q
 *   node tools/measure/brief.mjs --json
 *   node tools/measure/brief.mjs -s abmahnung
 */

process.removeAllListeners('warning');

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import {
  Figurenkatalog,
  franchiseKey,
  generateNerdText,
  getCharHook,
  hatHooks,
  hatWonkaBezug,
  randomBetreff,
  SZENARIEN,
  waehleBesetzung,
  waehleSzenario
} from '../../website/addons/testbrief/testbrief.js';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const KATALOG = path.join(HIER, '..', '..', 'website', 'addons', 'testbrief', 'figuren.json');

/**
 * Misst den Testbrief-Generator über N Briefe (ohne Browser).
 * Ohne `options.argv` werden die Prozess-Argumente gelesen.
 * @param {{ argv?: string[] }} [options]
 * @returns {Promise<number>} Exit-Code (0 ok · 1 Fehler)
 */
export async function measureBrief(options = {}) {
  const argv = options.argv ?? process.argv.slice(2);

  const { values: werte } = parseArgs({
    args: argv,
    options: {
      count: {
        type: 'string',
        short: 'n',
        default: '50'
      },
      quiet: {
        type: 'boolean',
        short: 'q',
        default: false
      },
      json: {
        type: 'boolean',
        default: false
      },
      scenario: {
        type: 'string',
        short: 's'
      },
      briefe: {
        type: 'string'
      }
    },
    strict: false
  });

  const rawCount = werte.briefe ?? werte.count;
  const count = Math.max(1, parseInt(String(rawCount), 10) || 50);

  /** @type {any} */
  let selectedScenario = null;
  if (werte.scenario) {
    selectedScenario = SZENARIEN.find((s) => s.id === werte.scenario);
    if (!selectedScenario) {
      const valid = SZENARIEN.map((s) => s.id).join(', ');
      if (werte.json) {
        console.log(JSON.stringify({ count, errors: 1, ms: 0, ok: false, error: `Unbekanntes Szenario: ${werte.scenario}` }));
      } else {
        console.error(`Unbekanntes Szenario „${werte.scenario}". Gültig: ${valid}`);
      }
      return 1;
    }
  }

  const anzahlSzenarien = SZENARIEN.length;
  const szenarioErwartung = 1 / anzahlSzenarien;

  /** Sollgrenzen für statistische Stichproben (>= 500 Durchläufe) */
  const SOLL = {
    absenderMitHook: 1,
    hookImBetreff: 1,
    hookImText: 1,
    franchiseKreuzung: 1,
    maxHookAnteil: 0.08,
    szenarioMin: Math.max(0.02, szenarioErwartung * 0.35),
    szenarioMax: Math.min(0.25, szenarioErwartung * 2.2)
  };

  const katalogJson = JSON.parse(fs.readFileSync(KATALOG, 'utf-8'));
  const fk = new Figurenkatalog(katalogJson);
  const figuren = Array.from({ length: fk.count }, (_, i) => fk.get(i));

  /** @type {string[]} */
  const fehler = [];
  /** @type {Map<string, number>} */
  const hookZaehler = new Map();
  /** @type {Map<string, number>} */
  const szenarioZaehler = new Map();
  /** @type {Set<string>} */
  const kombinationen = new Set();
  let absenderMitHook = 0;
  let hookImBetreff = 0;
  let hookImText = 0;
  let franchiseKreuzung = 0;

  const t0 = performance.now();

  for (let i = 0; i < count; i++) {
    const { sender, recipient, dritte } = waehleBesetzung(figuren);
    const themenHook = getCharHook(sender);
    const szenario = selectedScenario || waehleSzenario();
    const betreff = randomBetreff(themenHook, szenario);
    const text = generateNerdText(sender, recipient, dritte, themenHook, szenario);

    const senderHasHook = hatHooks(sender);
    const subjectHasHook = betreff.includes(themenHook);
    const textHasHook = text.includes(themenHook);
    const validCrossing = franchiseKey(sender) !== franchiseKey(recipient) || hatWonkaBezug(sender, recipient);

    if (senderHasHook) absenderMitHook++;
    if (subjectHasHook) hookImBetreff++;
    if (textHasHook) hookImText++;
    if (validCrossing) franchiseKreuzung++;

    // Fail-fast bei Brief-Invarianz-Verletzung
    if (!senderHasHook) {
      fehler.push(`Brief #${i + 1}: Absender „${sender.name}" hat keinen Hook.`);
      break;
    }
    if (!subjectHasHook) {
      fehler.push(`Brief #${i + 1}: Hook „${themenHook}" fehlt im Betreff: „${betreff}".`);
      break;
    }
    if (!textHasHook) {
      fehler.push(`Brief #${i + 1}: Hook „${themenHook}" fehlt im Text (Absender: ${sender.name}).`);
      break;
    }
    if (!validCrossing) {
      fehler.push(`Brief #${i + 1}: Ungültige Besetzung ohne Franchise-Kreuzung/Wonka-Bezug: ${sender.name} <-> ${recipient.name}.`);
      break;
    }

    hookZaehler.set(themenHook, (hookZaehler.get(themenHook) ?? 0) + 1);
    szenarioZaehler.set(szenario.id, (szenarioZaehler.get(szenario.id) ?? 0) + 1);
    kombinationen.add(`${sender.name}|${themenHook}|${recipient.name}`);
  }

  const t1 = performance.now();
  const ms = Math.round(t1 - t0);

  // Statistische Verteilung nur bei repräsentativer Stichprobe (>= 500) und ohne Szenario-Filter
  if (fehler.length === 0 && !selectedScenario && count >= 500) {
    const quote = (wert) => wert / count;
    const haeufigsterHook = [...hookZaehler.entries()].sort((a, b) => b[1] - a[1])[0];
    if (haeufigsterHook && quote(haeufigsterHook[1]) > SOLL.maxHookAnteil) {
      fehler.push(`Monokultur: „${haeufigsterHook[0]}" in ${(quote(haeufigsterHook[1]) * 100).toFixed(1)} % der Briefe`);
    }
    for (const [id, n] of szenarioZaehler) {
      if (quote(n) < SOLL.szenarioMin || quote(n) > SOLL.szenarioMax) {
        fehler.push(`Szenario „${id}" ungleich verteilt: ${(quote(n) * 100).toFixed(1)} %`);
      }
    }
  }

  const ok = fehler.length === 0;

  if (werte.json) {
    console.log(JSON.stringify({
      count,
      errors: fehler.length,
      ms,
      ok
    }));
    return ok ? 0 : 1;
  }

  if (werte.quiet) {
    if (ok) {
      console.log(`✓ Testbrief Messung: ${count}/${count} stabil (${ms}ms)`);
      return 0;
    } else {
      console.error(`✗ Testbrief Messung: ${fehler.length} Fehler (${ms}ms)`);
      for (const f of fehler) console.error(`  - ${f}`);
      return 1;
    }
  }

  // Ausführliche Ausgabe (wenn weder --quiet noch --json)
  const quote = (wert) => (wert / count);
  /** @param {number} n @returns {string} */
  const prozent = (n) => `${(n * 100).toFixed(1)} %`;
  const haeufigsterHook = [...hookZaehler.entries()].sort((a, b) => b[1] - a[1])[0];
  const hooksGesamt = figuren.reduce(
    (summe, c) => summe + (Array.isArray(c.hooks) ? c.hooks.filter((h) => String(h ?? '').trim()).length : 0),
    0
  );
  const mitHooks = figuren.filter(hatHooks).length;

  console.log(`Testbrief-Messung -- ${count} Briefe`);
  console.log('');
  console.log('DATENBESTAND');
  console.log(`  Figuren:                       ${figuren.length}`);
  console.log(`  mit mindestens einem Hook:     ${mitHooks} (${prozent(mitHooks / figuren.length)})`);
  console.log(`  Hooks gesamt:                  ${hooksGesamt}`);
  console.log(`  Hooks je Figur (Schnitt):      ${(hooksGesamt / figuren.length).toFixed(2)}`);
  console.log('');
  console.log('ERGEBNIS');
  console.log(`  Absender mit Hook:             ${prozent(quote(absenderMitHook))}`);
  console.log(`  Hook im Betreff:               ${prozent(quote(hookImBetreff))}`);
  console.log(`  Hook im Text:                  ${prozent(quote(hookImText))}`);
  console.log(`  Franchise-Kreuzung:            ${prozent(quote(franchiseKreuzung))}`);
  console.log(`  verschiedene Kombinationen:    ${kombinationen.size} von ${count}`);
  if (haeufigsterHook) {
    console.log(`  häufigster Hook:               „${haeufigsterHook[0]}" (${prozent(quote(haeufigsterHook[1]))})`);
  }
  console.log('');
  console.log('SZENARIEN');
  for (const [id, n] of [...szenarioZaehler.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${id.padEnd(30)} ${prozent(quote(n))}`);
  }
  console.log('');

  if (!ok) {
    console.log('VERDICT: FAIL');
    for (const f of fehler) console.log(`  - ${f}`);
    return 1;
  }
  console.log(`✓ Testbrief Messung: ${count}/${count} stabil (${ms}ms)`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await measureBrief());
}
