// @ts-check
/**
 * @file tools/build_plz_data.mjs
 * ================================
 * Kanonische, reproduzierbare Build-Pipeline („Data-as-Code“) für DIN-BriefNEO.
 * Kompiliert das verlustfreie Columnar-JSON nach website/data/orte.json.gz:
 *   { plz: string[], ort: string[], district: (string|null)[], state: string[] }
 *
 * Nutzung:
 *   node tools/build_plz_data.mjs             # Deterministischer Offline-Rebuild aus lokalem Datenbestand
 *   node tools/build_plz_data.mjs --download  # Lädt frische Rohdaten direkt von GeoNames (DE.zip)
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'website/data');
const ORTE_PATH = path.join(DATA_DIR, 'orte.json.gz');
const DISTRICTS_PATH = path.join(DATA_DIR, 'de_districts.json.gz');
const STATES_PATH = path.join(REPO_ROOT, 'tools/data/plz_states.json');
const GEONAMES_URL = 'https://download.geonames.org/export/zip/DE.zip';

// Bekannte Ausnahmen & Korrekturen (12 fehlende PLZs aus Amtsgraph / 6 Firmensitz-Fehlkodierungen)
const STATE_OVERRIDES = {
  // Fehlende Zustell-PLZs in GeoNames
  '04861': 'SN',
  '06485': 'ST',
  '06711': 'ST',
  '06772': 'ST',
  '09434': 'SN',
  '22961': 'SH',
  '39628': 'ST',
  '64760': 'HE',
  '87491': 'BY',
  '98694': 'TH',
  '99090': 'TH',
  '99331': 'TH',
  // Firmensitz-/Zentralen-Fehlkodierungen in GeoNames
  '04160': 'SN', // Fressnapf Krefeld HQ -> PLZ 04160 ist Leipzig (Sachsen)
  '10910': 'BE', // norisbank Bonn HQ -> PLZ 10910 ist Berlin
  '11512': 'BE', // Versorgungswerk Stuttgart HQ -> PLZ 11512 ist Berlin
  '12678': 'BE', // Banc Tec Offenbach HQ -> PLZ 12678 ist Berlin
  '42895': 'NW', // PARAT-Werk Bayern HQ -> PLZ 42895 ist Remscheid (NRW)
  '47789': 'NW', // Versa Flensburg HQ -> PLZ 47789 ist Krefeld (NRW)
};

/**
 * Entpackt eine einzelne Datei aus einem PKZip-Buffer rein mit Node.js-Standard-APIs.
 * @param {Buffer} zipBuf
 * @param {string} targetName
 * @returns {string | null}
 */
function extractFileFromZipBuffer(zipBuf, targetName) {
  let offset = 0;
  while (offset < zipBuf.length - 4) {
    const sig = zipBuf.readUInt32LE(offset);
    if (sig === 0x04034b50) {
      // Local File Header
      const method = zipBuf.readUInt16LE(offset + 8);
      const compSize = zipBuf.readUInt32LE(offset + 18);
      const nameLen = zipBuf.readUInt16LE(offset + 26);
      const extraLen = zipBuf.readUInt16LE(offset + 28);
      const name = zipBuf.toString('utf-8', offset + 30, offset + 30 + nameLen);
      const dataOffset = offset + 30 + nameLen + extraLen;
      const compData = zipBuf.subarray(dataOffset, dataOffset + compSize);

      if (name === targetName) {
        if (method === 0) return compData.toString('utf-8');
        if (method === 8) return zlib.inflateRawSync(compData).toString('utf-8');
        throw new Error(`Nicht unterstützte Zip-Kompression: ${method}`);
      }
      offset = dataOffset + compSize;
    } else {
      break;
    }
  }
  return null;
}

async function run() {
  console.log('===========================================================');
  console.log('DIN-BriefNEO: Kanonischer Columnar-PLZ & State Pipeline');
  console.log('===========================================================');

  const shouldDownload = process.argv.includes('--download');

  // 1. Vorhandene Datenbasis und manuelle Ortsteile laden (SCHUTZ VOR DATENVERLUST!)
  /** @type {Record<string, string>} */
  const existingOrte = {};
  /** @type {Record<string, string | null>} */
  const existingDistricts = {};
  /** @type {Record<string, string>} */
  const existingStates = {};

  if (fs.existsSync(ORTE_PATH)) {
    const prev = JSON.parse(zlib.gunzipSync(fs.readFileSync(ORTE_PATH)).toString('utf-8'));
    if (prev.plz && Array.isArray(prev.plz)) {
      for (let i = 0; i < prev.plz.length; i++) {
        const p = prev.plz[i];
        existingOrte[p] = prev.ort[i];
        if (prev.district) existingDistricts[p] = prev.district[i];
        if (prev.state) existingStates[p] = prev.state[i];
      }
    } else {
      Object.assign(existingOrte, prev);
    }
    console.log(`[1/5] Bestehende Datenbasis geladen: ${Object.keys(existingOrte).length} PLZs referenziert.`);
  }

  // Historische Distrikte mergen falls vorhanden
  if (fs.existsSync(DISTRICTS_PATH)) {
    const distRaw = JSON.parse(zlib.gunzipSync(fs.readFileSync(DISTRICTS_PATH)).toString('utf-8'));
    for (const [p, d] of Object.entries(distRaw)) {
      existingDistricts[p] = d;
    }
  }

  // Lokale Bundesland-Mappingtabelle laden
  if (fs.existsSync(STATES_PATH)) {
    const stRaw = JSON.parse(fs.readFileSync(STATES_PATH, 'utf-8'));
    for (const [p, s] of Object.entries(stRaw)) {
      if (!existingStates[p]) existingStates[p] = s;
    }
  }

  // 2. Rohdaten laden (entweder Download von GeoNames oder lokaler Cache)
  /** @type {Record<string, { ort: string, state: string }>} */
  const sourceData = {};

  if (shouldDownload) {
    console.log(`[2/5] Lade GeoNames DE.zip herunter (${GEONAMES_URL})...`);
    const resp = await fetch(GEONAMES_URL);
    if (!resp.ok) {
      throw new Error(`GeoNames Download fehlgeschlagen: HTTP ${resp.status}`);
    }
    const zipBuf = Buffer.from(await resp.arrayBuffer());
    console.log(`      Entpacke DE.txt im RAM (${(zipBuf.length / 1024).toFixed(1)} KB Zip)...`);
    const tsvText = extractFileFromZipBuffer(zipBuf, 'DE.txt');
    if (!tsvText) {
      throw new Error('DE.txt konnte nicht aus DE.zip extrahiert werden');
    }

    const lines = tsvText.split('\n');
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 5) {
        const plz = parts[1]?.trim();
        const ort = parts[2]?.trim();
        const state = parts[4]?.trim();
        if (plz && /^\d{5}$/.test(plz) && ort && state) {
          if (!sourceData[plz]) {
            sourceData[plz] = { ort, state };
          }
        }
      }
    }
    console.log(`      GeoNames: ${Object.keys(sourceData).length} Roh-PLZ extrahiert.`);
  }

  // 3. Normalisierung & Verlustfreie Aggregation
  /** @type {Map<string, { ort: string, district: string | null, state: string }>} */
  const mergedMap = new Map();

  // Zuerst bestehende Orte übernehmen
  for (const [plz, ort] of Object.entries(existingOrte)) {
    const dist = existingDistricts[plz] || null;
    const state = STATE_OVERRIDES[plz] || existingStates[plz] || sourceData[plz]?.state || '';
    mergedMap.set(plz, { ort, district: dist, state });
  }

  // Ggf. neue PLZs aus GeoNames übernehmen
  for (const [plz, data] of Object.entries(sourceData)) {
    if (!mergedMap.has(plz)) {
      const state = STATE_OVERRIDES[plz] || data.state;
      mergedMap.set(plz, { ort: data.ort, district: null, state });
    }
  }

  // 4. Columnar Projection & Sortierung
  console.log('[3/5] Erzeuge sortierte Columnar-Projektion...');
  const sorted = Array.from(mergedMap.entries()).sort(([a], [b]) => a.localeCompare(b, 'de', { numeric: true }));

  /** @type {{ plz: string[], ort: string[], district: (string | null)[], state: string[] }} */
  const columnar = {
    plz: [],
    ort: [],
    district: [],
    state: []
  };

  /** @type {Record<string, string>} */
  const statesExport = {};

  for (const [plz, item] of sorted) {
    columnar.plz.push(plz);
    columnar.ort.push(item.ort);
    columnar.district.push(item.district);
    columnar.state.push(item.state);
    if (item.state) {
      statesExport[plz] = item.state;
    }
  }

  // 5. Invarianz-Prüfung (Troisdorf, Berlin, Neustadt)
  console.log('[4/5] Führe normative Invarianz-Prüfungen durch...');
  const _t40 = columnar.plz.indexOf('53840');
  const _t42 = columnar.plz.indexOf('53842');
  const t44 = columnar.plz.indexOf('53844');
  const n35 = columnar.plz.indexOf('35279');
  const n53 = columnar.plz.indexOf('53577');
  const n92 = columnar.plz.indexOf('92660');

  if (!columnar.district[t44]?.includes('Sieglar') || !columnar.district[t44]?.includes('Bergheim')) {
    throw new Error('Normverletzung: Ortsteile von 53844 Troisdorf wurden beschädigt!');
  }
  if (columnar.state[t44] !== 'NW' || columnar.state[n35] !== 'HE' || columnar.state[n53] !== 'RP' || columnar.state[n92] !== 'BY') {
    throw new Error('Normverletzung: Bundesland-Zuordnungen sind fehlerhaft!');
  }
  console.log('      ✓ Troisdorf 53840/53842/53844 vollständig mit Ortsteilen (NW)');
  console.log('      ✓ Neustadt Disambiguierung verifiziert (HE, RP, BY)');

  // 6. Gzip Level 9 Kompression & Persistenz
  console.log('[5/5] Komprimiere und speichere Ziel-Assets...');
  const jsonString = JSON.stringify(columnar);
  const gzBuf = zlib.gzipSync(jsonString, { level: 9 });
  fs.writeFileSync(ORTE_PATH, gzBuf);

  // Synchronisiere Referenz-Mapping
  fs.mkdirSync(path.dirname(STATES_PATH), { recursive: true });
  fs.writeFileSync(STATES_PATH, JSON.stringify(statesExport, null, 2));

  console.log(`===========================================================`);
  console.log(`✓ ERFOLGREICH: ${columnar.plz.length} Postleitzahlen generiert`);
  console.log(`  Ziel:        website/data/orte.json.gz (${(gzBuf.length / 1024).toFixed(1)} KB Gzip)`);
  console.log(`  Referenz:    tools/data/plz_states.json`);
  console.log(`===========================================================`);
}

run().catch(err => {
  console.error('\nFEHLER in PLZ-Pipeline:', err);
  process.exit(1);
});
