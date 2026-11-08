#!/usr/bin/env node
// @ts-check
/**
 * Messung des Testbrief-Generators -- ohne Browser.
 *
 * Prüft die Eigenschaften, die der Klick auf „Testbrief" erzeugen soll, an
 * derselben Logik: `waehleBesetzung`, `getCharHook`, `waehleSzenario` und
 * `generateNerdText` werden aus dem Addon importiert, nicht nachgebaut.
 *
 * Aufruf:
 *   node tools/testbrief-messung.mjs            (1000 Briefe)
 *   node tools/testbrief-messung.mjs --briefe 5000
 *
 * Exit-Code 1, sobald eine Sollgrenze verletzt ist -- damit ist das Skript
 * als Gate verwendbar.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  franchiseKey,
  generateNerdText,
  getCharHook,
  hatHooks,
  randomBetreff,
  waehleBesetzung,
  waehleSzenario
} from '../website/addons/testbrief/testbrief.js';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const KATALOG = path.join(HIER, '..', 'website', 'addons', 'testbrief', 'charactere.json');

/** Sollgrenzen -- bewusst als Zahlen an einer Stelle. */
const SOLL = {
  absenderMitHook: 1,
  hookImBetreff: 1,
  hookImText: 1,
  franchiseKreuzung: 1,
  maxHookAnteil: 0.08,
  szenarioMin: 0.1,
  szenarioMax: 0.25
};

const args = process.argv.slice(2);
const iBriefe = args.indexOf('--briefe');
const ANZAHL = iBriefe >= 0 ? Number(args[iBriefe + 1]) : 1000;

const katalog = JSON.parse(fs.readFileSync(KATALOG, 'utf-8'));
const figuren = Array.isArray(katalog) ? katalog : katalog.figuren;

/** @param {number} n @returns {string} */
const prozent = (n) => `${(n * 100).toFixed(1)} %`;

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

for (let i = 0; i < ANZAHL; i++) {
  const { sender, recipient, dritte } = waehleBesetzung(figuren);
  const themenHook = getCharHook(sender);
  const szenario = waehleSzenario();
  const betreff = randomBetreff(themenHook, szenario);
  const text = generateNerdText(sender, recipient, dritte, themenHook, szenario);

  if (hatHooks(sender)) absenderMitHook++;
  if (betreff.includes(themenHook)) hookImBetreff++;
  if (text.includes(themenHook)) hookImText++;
  if (franchiseKey(sender) !== franchiseKey(recipient)) franchiseKreuzung++;

  hookZaehler.set(themenHook, (hookZaehler.get(themenHook) ?? 0) + 1);
  szenarioZaehler.set(szenario.id, (szenarioZaehler.get(szenario.id) ?? 0) + 1);
  kombinationen.add(`${sender.name}|${themenHook}|${recipient.name}`);
}

const quote = (wert) => wert / ANZAHL;
const haeufigsterHook = [...hookZaehler.entries()].sort((a, b) => b[1] - a[1])[0];

if (quote(absenderMitHook) < SOLL.absenderMitHook) {
  fehler.push(`Absender ohne Hook: ${ANZAHL - absenderMitHook} von ${ANZAHL}`);
}
if (quote(hookImBetreff) < SOLL.hookImBetreff) {
  fehler.push(`Hook fehlt im Betreff: ${ANZAHL - hookImBetreff} von ${ANZAHL}`);
}
if (quote(hookImText) < SOLL.hookImText) {
  fehler.push(`Hook fehlt im Text: ${ANZAHL - hookImText} von ${ANZAHL}`);
}
if (quote(franchiseKreuzung) < SOLL.franchiseKreuzung) {
  fehler.push(`Gleiches Franchise bei ${ANZAHL - franchiseKreuzung} von ${ANZAHL} Briefen`);
}
if (haeufigsterHook && quote(haeufigsterHook[1]) > SOLL.maxHookAnteil) {
  fehler.push(`Monokultur: „${haeufigsterHook[0]}" in ${prozent(quote(haeufigsterHook[1]))} der Briefe`);
}
for (const [id, n] of szenarioZaehler) {
  if (quote(n) < SOLL.szenarioMin || quote(n) > SOLL.szenarioMax) {
    fehler.push(`Szenario „${id}" ungleich verteilt: ${prozent(quote(n))}`);
  }
}

const hooksGesamt = figuren.reduce(
  (summe, c) => summe + (Array.isArray(c.hooks) ? c.hooks.filter((h) => String(h ?? '').trim()).length : 0),
  0
);
const mitHooks = figuren.filter(hatHooks).length;

console.log(`Testbrief-Messung -- ${ANZAHL} Briefe`);
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
console.log(`  verschiedene Kombinationen:    ${kombinationen.size} von ${ANZAHL}`);
if (haeufigsterHook) {
  console.log(`  häufigster Hook:               „${haeufigsterHook[0]}" (${prozent(quote(haeufigsterHook[1]))})`);
}
console.log('');
console.log('SZENARIEN');
for (const [id, n] of [...szenarioZaehler.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id.padEnd(30)} ${prozent(quote(n))}`);
}
console.log('');

if (fehler.length > 0) {
  console.log('VERDICT: FAIL');
  for (const f of fehler) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('VERDICT: ok');
