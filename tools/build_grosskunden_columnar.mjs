// @ts-check
/**
 * @file tools/build_grosskunden_columnar.mjs
 * ===========================================
 * Migriert und kompiliert das Großkunden- und Behördenverzeichnis nach Columnar-JSON:
 *   { plz: string[], name: string[], city: string[], typ: string[], all_names?: (string[] | null)[] }
 * Deterministisch aufsteigend sortiert nach PLZ mit zlib Level 9 Kompression.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const TARGET_PATH = path.join(REPO_ROOT, 'website/data/grosskunden.json.gz');

console.log('===========================================================');
console.log('DIN-BriefNEO: Grosskunden Columnar Build-Pipeline');
console.log('===========================================================');

if (!fs.existsSync(TARGET_PATH)) {
  throw new Error(`Quelldatei nicht gefunden: ${TARGET_PATH}`);
}

const rawGz = fs.readFileSync(TARGET_PATH);
const rawJson = JSON.parse(zlib.gunzipSync(rawGz).toString('utf-8'));

/** @type {Record<string, { name: string, city: string, typ: string, all_names?: string[] }>} */
const sourceEntries = {};

if (rawJson.plz && Array.isArray(rawJson.plz)) {
  console.log(`[1/3] Vorhandene Datei ist bereits Columnar (${rawJson.plz.length} Einträge). Re-sortiere...`);
  for (let i = 0; i < rawJson.plz.length; i++) {
    const p = rawJson.plz[i];
    sourceEntries[p] = {
      name: rawJson.name[i] || '',
      city: rawJson.city[i] || '',
      typ: rawJson.typ[i] || 'Firma',
      all_names: rawJson.all_names?.[i] || undefined
    };
  }
} else {
  console.log(`[1/3] Lese bestehende Key-Value-Map (${Object.keys(rawJson).length} Einträge)...`);
  Object.assign(sourceEntries, rawJson);
}

// Deterministische aufsteigende Sortierung nach PLZ
const sortedPlzs = Object.keys(sourceEntries).sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));

/** @type {{ plz: string[], name: string[], city: string[], typ: string[], all_names: (string[] | null)[] }} */
const columnar = {
  plz: [],
  name: [],
  city: [],
  typ: [],
  all_names: []
};

for (const p of sortedPlzs) {
  const item = sourceEntries[p];
  columnar.plz.push(p);
  columnar.name.push(item.name || '');
  columnar.city.push(item.city || '');
  columnar.typ.push(item.typ || 'Firma');
  columnar.all_names.push(item.all_names && item.all_names.length > 1 ? item.all_names : null);
}

console.log(`[2/3] Columnar-Projektion erzeugt: ${columnar.plz.length} Datensätze aufsteigend sortiert.`);
// Invarianz-Prüfung: Strikt aufsteigend sortiert
for (let i = 1; i < columnar.plz.length; i++) {
  if (columnar.plz[i - 1] >= columnar.plz[i]) {
    throw new Error(`Sortierungs-Invarianz verletzt: ${columnar.plz[i - 1]} >= ${columnar.plz[i]}`);
  }
}

const jsonBuffer = Buffer.from(JSON.stringify(columnar), 'utf-8');
const gzBuffer = zlib.gzipSync(jsonBuffer, { level: 9 });

fs.writeFileSync(TARGET_PATH, gzBuffer);
console.log(`[3/3] Erfolgreich geschrieben: ${TARGET_PATH}`);
console.log(`      Vorher: ${(rawGz.length / 1024).toFixed(1)} KB -> Nachher: ${(gzBuffer.length / 1024).toFixed(1)} KB`);
console.log('===========================================================');
