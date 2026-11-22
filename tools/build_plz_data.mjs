// @ts-check
/**
 * @file tools/build_plz_data.mjs
 * ================================
 * Kanonische, reproduzierbare Build-Pipeline („Data-as-Code“) für DIN-BriefNEO.
 * Kompiliert das verlustfreie Columnar-JSON nach website/data/orte.json.gz:
 *   { plz: string[], ort: string[], district: (string|null)[], state: string[],
 *     kreis: (string|null)[], kreisKey: (string|null)[] }
 *
 * `kreis`/`kreisKey` (Landkreis-Name und 5-stelliger Kreisschluessel) kommen aus
 * der Quelle und dienen der Orts-Disambiguierung: gleicher Kurzname in
 * verschiedenen Kreisen = verschiedene Orte (Neustadt an der Waldnaab vs.
 * Neustadt am Kulm). Ohne `--download` bleiben beide Spalten null.
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
 *
 * Warum über das zentrale Verzeichnis: das GeoNames-Archiv setzt im lokalen
 * Header das "Data-Descriptor"-Flag (Bit 3), dort steht die komprimierte
 * Groesse als 0. Der fruehere Weg (lokaler Header der Reihe nach) lief
 * deshalb ins Leere — `--download` brach mit "DE.txt konnte nicht extrahiert
 * werden" ab (gemessen 2026-11-22). Groesse und Kompression stehen
 * zuverlaessig im zentralen Verzeichnis am Dateiende.
 * @param {Buffer} zipBuf
 * @param {string} targetName
 * @returns {string | null}
 */
function extractFileFromZipBuffer(zipBuf, targetName) {
  let eocd = -1;
  const untergrenze = Math.max(0, zipBuf.length - 66_000);
  for (let i = zipBuf.length - 22; i >= untergrenze; i--) {
    if (zipBuf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;

  const entryCount = zipBuf.readUInt16LE(eocd + 10);
  let p = zipBuf.readUInt32LE(eocd + 16);

  for (let n = 0; n < entryCount; n++) {
    if (zipBuf.readUInt32LE(p) !== 0x02014b50) return null;
    const method = zipBuf.readUInt16LE(p + 10);
    const compSize = zipBuf.readUInt32LE(p + 20);
    const nameLen = zipBuf.readUInt16LE(p + 28);
    const extraLen = zipBuf.readUInt16LE(p + 30);
    const commentLen = zipBuf.readUInt16LE(p + 32);
    const localOffset = zipBuf.readUInt32LE(p + 42);
    const name = zipBuf.toString('utf-8', p + 46, p + 46 + nameLen);

    if (name === targetName) {
      /* Datenposition aus dem LOKALEN Header: dessen Extra-Feld kann sich in
         der Laenge vom zentralen Eintrag unterscheiden. */
      const lNameLen = zipBuf.readUInt16LE(localOffset + 26);
      const lExtraLen = zipBuf.readUInt16LE(localOffset + 28);
      const dataOffset = localOffset + 30 + lNameLen + lExtraLen;
      const compData = zipBuf.subarray(dataOffset, dataOffset + compSize);
      if (method === 0) return compData.toString('utf-8');
      if (method === 8) return zlib.inflateRawSync(compData).toString('utf-8');
      throw new Error(`Nicht unterstützte Zip-Kompression: ${method}`);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

async function run() {
  console.log('===========================================================');
  console.log('DIN-BriefNEO: Kanonischer Columnar-PLZ & State Pipeline');
  console.log('===========================================================');

  const shouldDownload = process.argv.includes('--download');
  /* Neue PLZ aus der Quelle werden nur mit `--neu` uebernommen. Ohne diesen
     Schalter waeren beim ersten --download 642 Eintraege dazugekommen, fast
     ausschliesslich Behoerden und Firmen (Finanzamt Dresden, AOK, Agentur fuer
     Arbeit ...). Die gehoeren in grosskunden.json.gz, nicht ins Ortsverzeichnis
     (gemessen 2026-11-22). */
  const shouldAddNew = process.argv.includes('--neu');

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
        /* Spalte 7/8: Landkreis-Name und 5-stelliger Kreisschluessel.
           Nicht Teil des 8-stelligen AGS (Destatis), aber ausreichend, um
           gleichnamige Orte in verschiedenen Kreisen zu trennen. */
        const kreis = parts[7]?.trim() || null;
        const kreisKey = parts[8]?.trim() || null;
        if (plz && /^\d{5}$/.test(plz) && ort && state) {
          if (!sourceData[plz]) {
            sourceData[plz] = { ort, state, kreis, kreisKey };
          }
        }
      }
    }
    console.log(`      GeoNames: ${Object.keys(sourceData).length} Roh-PLZ extrahiert.`);
  }

  // 3. Normalisierung & Verlustfreie Aggregation
  /** @type {Map<string, { ort: string, district: string | null, state: string, kreis: string | null, kreisKey: string | null }>} */
  const mergedMap = new Map();

  // Zuerst bestehende Orte übernehmen (Name bleibt kuratiert)
  for (const [plz, ort] of Object.entries(existingOrte)) {
    const dist = existingDistricts[plz] || null;
    const state = STATE_OVERRIDES[plz] || existingStates[plz] || sourceData[plz]?.state || '';
    mergedMap.set(plz, {
      ort,
      district: dist,
      state,
      kreis: sourceData[plz]?.kreis ?? null,
      kreisKey: sourceData[plz]?.kreisKey ?? null
    });
  }

  // Ggf. neue PLZs aus GeoNames übernehmen (nur mit --neu)
  let uebersprungen = 0;
  for (const [plz, data] of Object.entries(sourceData)) {
    if (!shouldAddNew && !mergedMap.has(plz)) {
      uebersprungen++;
      continue;
    }
    if (!mergedMap.has(plz)) {
      const state = STATE_OVERRIDES[plz] || data.state;
      mergedMap.set(plz, {
        ort: data.ort,
        district: null,
        state,
        kreis: data.kreis ?? null,
        kreisKey: data.kreisKey ?? null
      });
    }
  }

  if (uebersprungen > 0) {
    console.log(`      Neue PLZ nicht uebernommen: ${uebersprungen} (dafuer --neu setzen)`);
  }
  const ohneKreis = Array.from(mergedMap.values()).filter((e) => !e.kreisKey).length;
  if (ohneKreis === mergedMap.size) {
    console.warn('      WARNUNG: keine Kreis-Daten vorhanden — Build ohne --download? Dann bleiben kreis/kreisKey leer.');
  } else if (ohneKreis > 0) {
    console.log(`      Kreis-Daten: ${mergedMap.size - ohneKreis} von ${mergedMap.size} PLZ abgedeckt`);
  }

  /* Ortsnamen, die keine Staedte sind. Bei Grossempfaenger-PLZ steht in der
     Quelle der Firmen-/Stellenname in der Orts-Spalte ("HUK-Coburg",
     "Kundenservice Paket", "Deutsche Post AG Zentrale"). In der Vorschlagsliste
     sieht das aus wie eine Stadt und wirkt unserioes (gemeldet 2026-11-22).
     Bei KREISFREIEN Staedten nennt der Kreis die Stadt eindeutig - nur dort
     wird ersetzt. Landkreise sind mehrdeutig (Landkreis Muenchen enthaelt
     viele Gemeinden), dort bleibt der Name unangetastet. */
  const INSTITUTION = /(GmbH|mbH|\bAG\b|\bKG\b|e\.V\.|Klinikum|Bibliothek|Universität|Hochschule|IHK|AOK|BKK|IKK|Finanzamt|Jobcenter|Landratsamt|Stadtverwaltung|Versicherung|Bank|Sparkasse|Verlag|Kammer|Kasse|Post AG|Telekom|Rundfunk|Deutsche Bahn)/;
  let stadtKorrigiert = 0;
  for (const [plz, eintrag] of mergedMap) {
    const m = /^(Kreisfreie Stadt|Stadt)\s+(.+)$/.exec(eintrag.kreis || '');
    if (!m) continue;
    const stadt = m[2].trim();
    if (!INSTITUTION.test(eintrag.ort) || eintrag.ort.trim().toLowerCase() === stadt.toLowerCase()) continue;
    mergedMap.set(plz, { ...eintrag, ort: stadt });
    stadtKorrigiert++;
  }
  if (stadtKorrigiert > 0) {
    console.log(`      Ortsnamen aus dem Kreis ersetzt: ${stadtKorrigiert} (Grossempfaenger-PLZ)`);
  }

  // 4. Columnar Projection & Sortierung
  console.log('[3/5] Erzeuge sortierte Columnar-Projektion...');
  const sorted = Array.from(mergedMap.entries()).sort(([a], [b]) => a.localeCompare(b, 'de', { numeric: true }));

  /** @type {{ plz: string[], ort: string[], district: (string | null)[], state: string[], kreis: (string | null)[], kreisKey: (string | null)[] }} */
  const columnar = {
    plz: [],
    ort: [],
    district: [],
    state: [],
    kreis: [],
    kreisKey: []
  };

  /** @type {Record<string, string>} */
  const statesExport = {};

  for (const [plz, item] of sorted) {
    columnar.plz.push(plz);
    columnar.ort.push(item.ort);
    columnar.district.push(item.district);
    columnar.state.push(item.state);
    columnar.kreis.push(item.kreis);
    columnar.kreisKey.push(item.kreisKey);
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

  /* Kreis-Spalte: Grundlage der Orts-Disambiguierung. Der Fall, der sich
     NICHT trennen laesst, wird hier festgehalten — so faellt auf, wenn ein
     spaeteres Datenupdate die Schluessel verschiebt. */
  const k = (plz) => columnar.kreisKey[columnar.plz.indexOf(plz)];
  const n33 = columnar.plz.indexOf('93333');
  if (k('92660') && k('95514') && k('93333')) {
    if (k('92660') !== k('95514')) {
      throw new Error('Normverletzung: 92660/95514 liegen im selben Kreis (09374) — Kreis-Schluessel verschoben!');
    }
    if (k('93333') === k('92660')) {
      throw new Error('Normverletzung: 93333 (Landkreis Kelheim) darf nicht im Kreis von 92660 liegen!');
    }
    if (k('53840') !== k('53842') || k('53844') !== k('53840')) {
      throw new Error('Normverletzung: Troisdorf-PLZ muessen denselben Kreis tragen!');
    }
    console.log('      ✓ Kreis-Schluessel: Neustadt 09374 (92660+95514) getrennt von 09273 (93333)');
  } else {
    console.warn('      WARNUNG: keine Kreis-Daten — Invarianz-Pruefung uebersprungen (Build ohne --download?)');
  }

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
