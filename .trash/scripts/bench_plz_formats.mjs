// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import zlib from 'node:zlib';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const DATA_FILE = path.join(REPO_ROOT, 'website/data/orte.json.gz');

if (!fs.existsSync(DATA_FILE)) {
  console.error(`Datendatei nicht gefunden: ${DATA_FILE}`);
  process.exit(1);
}

// 1. Originaldaten laden
const rawGzip = fs.readFileSync(DATA_FILE);
const origJson = zlib.gunzipSync(rawGzip).toString('utf-8');
const parsedRaw = JSON.parse(origJson);

/** @type {Record<string, string>} */
const origMap = {};
if (parsedRaw.plz && Array.isArray(parsedRaw.plz)) {
  for (let i = 0; i < parsedRaw.plz.length; i++) {
    origMap[parsedRaw.plz[i]] = parsedRaw.ort[i];
  }
} else {
  Object.assign(origMap, parsedRaw);
}
const entryCount = Object.keys(origMap).length;

console.log(`================================================================`);
console.log(`BENCHMARK: PLZ- & Adressdaten-Formate (${entryCount} Einträge)`);
console.log(`Node.js ${process.version} · V8 Engine Benchmark`);
console.log(`================================================================\n`);

// 2. Datensätze für alle 4 Formate vorbereiten
// Format 1a: Status Quo Repo (Key-Value Dict: { "10026": "Berlin", ... })
const jsonDict = JSON.stringify(origMap);

// Format 1b: Status Quo Prompt (Objekt-Array: [{ plz: "10026", ort: "Berlin" }, ...])
const arrObjects = Object.entries(origMap).map(([plz, ort]) => ({ plz, ort }));
const jsonObjArr = JSON.stringify(arrObjects);

// Format 2: Option A (Tupel-Array: [["10026", "Berlin"], ...])
const arrTuples = Object.entries(origMap).map(([plz, ort]) => [plz, ort]);
const jsonTuples = JSON.stringify(arrTuples);

// Format 3: Option B (Spaltenbasiertes Columnar-JSON: { plz: [...], ort: [...] })
const columnar = {
  plz: Object.keys(origMap),
  ort: Object.values(origMap),
};
const jsonColumnar = JSON.stringify(columnar);

const formats = [
  { name: '1. Dict / KV-Map (Status Quo Repo)', json: jsonDict },
  { name: '2. Objekt-Array (Status Quo Prompt)', json: jsonObjArr },
  { name: '3. Option A (Tupel-Array)', json: jsonTuples },
  { name: '4. Option B (Columnar JSON)', json: jsonColumnar },
];

// --- Metrik 1: Dateigrößen (Roh, Gzip, Brotli) ---
console.log(`### 1. Dateigrößen-Vergleich\n`);
console.log(`| Format | Roh (Bytes) | Gzip (Bytes) | Brotli (Bytes) | vs. Dict (Gz) | vs. Obj-Arr (Gz) |`);
console.log(`|---|---|---|---|---|---|`);

/** @type {Record<string, number>} */
const gzSizes = {};
for (const fmt of formats) {
  const rawBytes = Buffer.byteLength(fmt.json, 'utf-8');
  const gzBytes = zlib.gzipSync(fmt.json, { level: 9 }).length;
  const brBytes = zlib.brotliCompressSync(fmt.json, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length;
  gzSizes[fmt.name] = gzBytes;
  const vsDict = ((gzBytes / (gzSizes[formats[0].name] || gzBytes) - 1) * 100).toFixed(1);
  const vsObj = ((gzBytes / (gzSizes[formats[1].name] || gzBytes) - 1) * 100).toFixed(1);
  console.log(
    `| **${fmt.name}** | ${(rawBytes / 1024).toFixed(1)} KB (${rawBytes} B) | **${(gzBytes / 1024).toFixed(1)} KB** (${gzBytes} B) | **${(brBytes / 1024).toFixed(1)} KB** | ${Number(vsDict) > 0 ? `+${vsDict}` : vsDict}% | ${Number(vsObj) > 0 ? `+${vsObj}` : vsObj}% |`
  );
}
console.log('\n');

// --- Metrik 2: JSON.parse() Geschwindigkeit (100 Durchläufe) ---
console.log(`### 2. Parse-Geschwindigkeit (100 Iterationen JSON.parse)\n`);
console.log(`| Format | Parse Ø (ms) | Median (ms) | Min (ms) | Max (ms) |`);
console.log(`|---|---|---|---|---|`);

for (const fmt of formats) {
  // Warmup
  for (let i = 0; i < 10; i++) JSON.parse(fmt.json);

  const times = [];
  for (let i = 0; i < 100; i++) {
    const t0 = performance.now();
    const obj = JSON.parse(fmt.json);
    const t1 = performance.now();
    times.push(t1 - t0);
    if (!obj) throw new Error('parse error');
  }

  times.sort((a, b) => a - b);
  const avg = times.reduce((s, v) => s + v, 0) / times.length;
  const med = times[Math.floor(times.length / 2)];
  const min = times[0];
  const max = times[times.length - 1];

  console.log(`| **${fmt.name}** | **${avg.toFixed(3)} ms** | ${med.toFixed(3)} ms | ${min.toFixed(3)} ms | ${max.toFixed(3)} ms |`);
}
console.log('\n');

// --- Metrik 3: Speicherbedarf (V8 Heap Footprint) ---
console.log(`### 3. V8 Speicherbedarf (Heap-Delta für geparste Struktur)\n`);
console.log(`| Format | Heap Delta (KB) | GC-Objekt-Anzahl geschätzt |`);
console.log(`|---|---|---|`);

for (const fmt of formats) {
  if (global.gc) global.gc();
  const before = process.memoryUsage().heapUsed;
  /** @type {any[]} */
  const holder = [];
  for (let i = 0; i < 10; i++) {
    holder.push(JSON.parse(fmt.json));
  }
  const after = process.memoryUsage().heapUsed;
  const deltaPerCopy = (after - before) / 10 / 1024;

  let objCountEstimate = '';
  if (fmt.name.includes('Dict')) objCountEstimate = `1 Objekt mit ${entryCount} Properties`;
  else if (fmt.name.includes('Objekt-Array')) objCountEstimate = `1 Array + ${entryCount} Objekte`;
  else if (fmt.name.includes('Tupel')) objCountEstimate = `1 Array + ${entryCount} Sub-Arrays`;
  else if (fmt.name.includes('Columnar')) objCountEstimate = `1 Objekt + 2 Arrays (${entryCount} Strings)`;

  console.log(`| **${fmt.name}** | **${deltaPerCopy.toFixed(1)} KB** | ${objCountEstimate} |`);
  holder.length = 0;
  if (global.gc) global.gc();
}
console.log('\n');

// --- Metrik 4: Such-Performance (Prefix-Matching) ---
console.log(`### 4. Such-Performance (1.000 Suchabfragen je Modus)\n`);
console.log(`| Format | PLZ-Suche ("538...") (ms gesamt) | Ort-Suche ("Trois...") (ms gesamt) | Ø je Query (µs) |`);
console.log(`|---|---|---|---|`);

// Test 1: Dict
{
  const data = JSON.parse(jsonDict);
  let totalFound = 0;
  const t0 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (const [plz] of Object.entries(data)) {
      if (plz.startsWith('538')) totalFound++;
    }
  }
  const tPlz = performance.now() - t0;

  const t1 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (const [, ort] of Object.entries(data)) {
      if (ort.startsWith('Trois')) totalFound++;
    }
  }
  const tOrt = performance.now() - t1;
  const totalAvgUs = (((tPlz + tOrt) / 2000) * 1000).toFixed(1);
  console.log(`| **1. Dict (KV-Map)** | ${tPlz.toFixed(2)} ms (Treffer: ${totalFound / 2000}) | ${tOrt.toFixed(2)} ms | ${totalAvgUs} µs |`);
}

// Test 2: Objekt-Array
{
  const data = JSON.parse(jsonObjArr);
  let totalFound = 0;
  const t0 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].plz.startsWith('538')) totalFound++;
    }
  }
  const tPlz = performance.now() - t0;

  const t1 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].ort.startsWith('Trois')) totalFound++;
    }
  }
  const tOrt = performance.now() - t1;
  const totalAvgUs = (((tPlz + tOrt) / 2000) * 1000).toFixed(1);
  console.log(`| **2. Objekt-Array** | ${tPlz.toFixed(2)} ms (Treffer: ${totalFound / 2000}) | ${tOrt.toFixed(2)} ms | ${totalAvgUs} µs |`);
}

// Test 3: Tupel-Array
{
  const data = JSON.parse(jsonTuples);
  let totalFound = 0;
  const t0 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (let i = 0; i < data.length; i++) {
      if (data[i][0].startsWith('538')) totalFound++;
    }
  }
  const tPlz = performance.now() - t0;

  const t1 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (let i = 0; i < data.length; i++) {
      if (data[i][1].startsWith('Trois')) totalFound++;
    }
  }
  const tOrt = performance.now() - t1;
  const totalAvgUs = (((tPlz + tOrt) / 2000) * 1000).toFixed(1);
  console.log(`| **3. Option A (Tupel)** | ${tPlz.toFixed(2)} ms (Treffer: ${totalFound / 2000}) | ${tOrt.toFixed(2)} ms | ${totalAvgUs} µs |`);
}

// Test 4: Columnar JSON
{
  const data = JSON.parse(jsonColumnar);
  const plzArr = data.plz;
  const ortArr = data.ort;
  const len = plzArr.length;
  let totalFound = 0;

  const t0 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (let i = 0; i < len; i++) {
      if (plzArr[i].startsWith('538')) totalFound++;
    }
  }
  const tPlz = performance.now() - t0;

  const t1 = performance.now();
  for (let q = 0; q < 1000; q++) {
    for (let i = 0; i < len; i++) {
      if (ortArr[i].startsWith('Trois')) totalFound++;
    }
  }
  const tOrt = performance.now() - t1;
  const totalAvgUs = (((tPlz + tOrt) / 2000) * 1000).toFixed(1);
  console.log(`| **4. Option B (Columnar)** | **${tPlz.toFixed(2)} ms** (Treffer: ${totalFound / 2000}) | **${tOrt.toFixed(2)} ms** | **${totalAvgUs} µs** |`);
}

console.log(`\n================================================================`);
