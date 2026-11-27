#!/usr/bin/env node
// @ts-check
/**
 * @file tools/content.mjs — Deep Module: Daten-Pipelines & Inhalts-Wächter
 * =========================================================================
 * Bündelt alle Daten-, Dokumentations- und Recherche-Werkzeuge für DIN-BriefNEO:
 * 1. buildPlzData: Columnar-PLZ & State Pipeline (`website/data/orte.json.gz`)
 * 2. buildGrosskunden: Großkunden Columnar Build (`website/data/grosskunden.json.gz`)
 * 3. syncBacklog: Backlog-Tabelle synchronisieren & Drift prüfen (`docs/meta/BACKLOG.md`)
 * 4. generateDossier: Test-Dossier generieren & prüfen (`docs/meta/TEST-DOSSIER.md`)
 * 5. queryFeature: Chrome Platform Status & MDN BCD Upstream Ground-Truth Abfrage
 * 6. checkAdr: Präventiver ADR-Drift-Wächter (Bijektion, Annotation, Zähler, Assets)
 *
 * Nutzung:
 *   node tools/content.mjs plz [--download] [--neu]
 *   node tools/content.mjs grosskunden
 *   node tools/content.mjs backlog [--check]
 *   node tools/content.mjs tests [--check]
 *   node tools/content.mjs feature <feature-name> | --milestone <version>
 *   node tools/content.mjs adr [--json]
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

// ============================================================================
// 1. PLZ & STATES PIPELINE (Data-as-Code)
// ============================================================================

const DATA_DIR = path.join(REPO_ROOT, 'website/data');
const ORTE_PATH = path.join(DATA_DIR, 'orte.json.gz');
const DISTRICTS_PATH = path.join(DATA_DIR, 'de_districts.json.gz');
const STATES_PATH = path.join(REPO_ROOT, 'tools/data/plz_states.json');
const GEONAMES_URL = 'https://download.geonames.org/export/zip/DE.zip';

// Bekannte Ausnahmen & Korrekturen (12 fehlende PLZs aus Amtsgraph / 6 Firmensitz-Fehlkodierungen)
const STATE_OVERRIDES = {
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
  '04160': 'SN',
  '10910': 'BE',
  '11512': 'BE',
  '12678': 'BE',
  '42895': 'NW',
  '47789': 'NW',
};

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

export async function buildPlzData(argv = process.argv.slice(2)) {
  console.log('===========================================================');
  console.log('DIN-BriefNEO: Kanonischer Columnar-PLZ & State Pipeline');
  console.log('===========================================================');

  const shouldDownload = argv.includes('--download');
  const shouldAddNew = argv.includes('--neu');

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

  if (fs.existsSync(DISTRICTS_PATH)) {
    const distRaw = JSON.parse(zlib.gunzipSync(fs.readFileSync(DISTRICTS_PATH)).toString('utf-8'));
    for (const [p, d] of Object.entries(distRaw)) {
      existingDistricts[p] = d;
    }
  }

  if (fs.existsSync(STATES_PATH)) {
    const stRaw = JSON.parse(fs.readFileSync(STATES_PATH, 'utf-8'));
    for (const [p, s] of Object.entries(stRaw)) {
      if (!existingStates[p]) existingStates[p] = s;
    }
  }

  /** @type {Record<string, { ort: string, state: string, kreis?: string | null, kreisKey?: string | null }>} */
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

  /** @type {Map<string, { ort: string, district: string | null, state: string, kreis: string | null, kreisKey: string | null }>} */
  const mergedMap = new Map();

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

  console.log('[4/5] Führe normative Invarianz-Prüfungen durch...');
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

  const k = (plz) => columnar.kreisKey[columnar.plz.indexOf(plz)];
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

  console.log('[5/5] Komprimiere und speichere Ziel-Assets...');
  const jsonString = JSON.stringify(columnar);
  const gzBuf = zlib.gzipSync(jsonString, { level: 9 });
  fs.writeFileSync(ORTE_PATH, gzBuf);

  fs.mkdirSync(path.dirname(STATES_PATH), { recursive: true });
  fs.writeFileSync(STATES_PATH, JSON.stringify(statesExport, null, 2));

  console.log(`===========================================================`);
  console.log(`✓ ERFOLGREICH: ${columnar.plz.length} Postleitzahlen generiert`);
  console.log(`  Ziel:        website/data/orte.json.gz (${(gzBuf.length / 1024).toFixed(1)} KB Gzip)`);
  console.log(`  Referenz:    tools/data/plz_states.json`);
  console.log(`===========================================================`);
  return 0;
}

// ============================================================================
// 2. GROSSKUNDEN COLUMNAR PIPELINE
// ============================================================================

const GROSSKUNDEN_TARGET = path.join(REPO_ROOT, 'website/data/grosskunden.json.gz');

export function buildGrosskunden() {
  console.log('===========================================================');
  console.log('DIN-BriefNEO: Grosskunden Columnar Build-Pipeline');
  console.log('===========================================================');

  if (!fs.existsSync(GROSSKUNDEN_TARGET)) {
    throw new Error(`Quelldatei nicht gefunden: ${GROSSKUNDEN_TARGET}`);
  }

  const rawGz = fs.readFileSync(GROSSKUNDEN_TARGET);
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
  for (let i = 1; i < columnar.plz.length; i++) {
    if (columnar.plz[i - 1] >= columnar.plz[i]) {
      throw new Error(`Sortierungs-Invarianz verletzt: ${columnar.plz[i - 1]} >= ${columnar.plz[i]}`);
    }
  }

  const jsonBuffer = Buffer.from(JSON.stringify(columnar), 'utf-8');
  const gzBuffer = zlib.gzipSync(jsonBuffer, { level: 9 });

  fs.writeFileSync(GROSSKUNDEN_TARGET, gzBuffer);
  console.log(`[3/3] Erfolgreich geschrieben: ${GROSSKUNDEN_TARGET}`);
  console.log(`      Vorher: ${(rawGz.length / 1024).toFixed(1)} KB -> Nachher: ${(gzBuffer.length / 1024).toFixed(1)} KB`);
  console.log('===========================================================');
  return 0;
}

// ============================================================================
// 3. BACKLOG SYNCHRONISATION & DRIFT CHECK
// ============================================================================

const BACKLOG_DATEI = path.join(REPO_ROOT, 'docs/meta/BACKLOG.md');

export function syncBacklog(argv = process.argv.slice(2)) {
  const CHECK = argv.includes('--check');

  const text = fs.readFileSync(BACKLOG_DATEI, 'utf-8');
  const eintraege = [...text.matchAll(/^### (B\d+) · (.+?) · \*\*([SMLN])\*\* · (⭐+)/gm)]
    .map(([, nr, titel, aufwand, roi]) => ({ nr, titel, aufwand, roi }))
    .sort((a, b) => Number(a.nr.slice(1)) - Number(b.nr.slice(1)));

  const tabelle = [
    '## Übersicht',
    '',
    `${eintraege.length} offene Punkte. Details unterhalb, nach Art gruppiert.`,
    '',
    '| Nr | Aufgabe | Aufwand | Nutzen |',
    '|---|---|:---:|:---:|',
    ...eintraege.map((e) => `| **${e.nr}** | ${e.titel.replace(/\|/g, '\\|')} | ${e.aufwand} | ${e.roi} |`),
  ].join('\n');

  const treffer = text.match(/^## Übersicht\n[\s\S]*?(?=^## )/m);
  if (!treffer) {
    console.error('BACKLOG.md: Abschnitt "## Übersicht" fehlt');
    return 1;
  }

  const ist = treffer[0].trimEnd();
  const soll = tabelle.trimEnd();

  if (ist === soll) {
    console.log(`Backlog-Tabelle aktuell (${eintraege.length} Einträge).`);
    return 0;
  }

  if (CHECK) {
    console.error('Backlog-Tabelle driftet gegen die Einträge. Neu schreiben: node tools/content.mjs backlog');
    return 1;
  }

  fs.writeFileSync(BACKLOG_DATEI, text.replace(treffer[0], `${soll}\n`), 'utf-8');
  console.log(`Backlog-Tabelle neu geschrieben (${eintraege.length} Einträge).`);
  return 0;
}

// ============================================================================
// 4. TEST-DOSSIER GENERATOR & CHECK
// ============================================================================

const TEST_ALL_DATEI = path.join(REPO_ROOT, 'test/all.js');
const DOSSIER_ZIEL = path.join(REPO_ROOT, 'docs/meta/TEST-DOSSIER.md');

export function generateDossier(argv = process.argv.slice(2)) {
  const CHECK = argv.includes('--check');

  const zeilen = fs.readFileSync(TEST_ALL_DATEI, 'utf-8').split('\n');

  /** @type {{ name: string, indent: number }[]} */
  const stapel = [];
  const gruppen = new Map();
  let ohneGruppe = 0;

  const reDescribe = /^(\s*)describe\(\s*(['"`])(.*?)\2/;
  const reIt = /^(\s*)it\(\s*(['"`])(.*?)\2/;
  const reEnde = /^(\s*)\}\);\s*$/;

  for (const zeile of zeilen) {
    const d = zeile.match(reDescribe);
    if (d) {
      stapel.push({ name: d[3], indent: d[1].length });
      continue;
    }
    if (zeile.match(reIt)) {
      if (!stapel.length) { ohneGruppe++; continue; }
      const pfad = stapel.map((s) => s.name).join(' › ');
      gruppen.set(pfad, (gruppen.get(pfad) ?? 0) + 1);
      continue;
    }
    const e = zeile.match(reEnde);
    if (e && stapel.length && stapel[stapel.length - 1].indent === e[1].length) stapel.pop();
  }

  const gesamt = [...gruppen.values()].reduce((a, b) => a + b, 0) + ohneGruppe;
  const liste = [...gruppen.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'));

  const inhalt = `---
id: "test-dossier"
title: "Test-Dossier: was die ${gesamt} Fälle abdecken"
status: "active"
type: "reference"
created: "2026-11-15"
updated: "2026-11-15"
tags:
- din-briefneo
- meta
- tests
- dossier
doc_links:
- '[[AGENTS]]'
- '[[AUFGABEN-WEGWEISER]]'
code_links:
- 'test/all.js'
depends_on: []
supersedes: []
---

# Test-Dossier

**Erzeugt von \`tools/content.mjs tests\` — nicht von Hand bearbeiten.**
\`node tools/content.mjs tests --check\` bricht ab, wenn dieses Verzeichnis nicht
mehr zu \`test/all.js\` passt.

**Zahl:** ${gesamt} Fälle in ${liste.length} Gruppen${ohneGruppe ? ` plus ${ohneGruppe} ohne Gruppe` : ''}.
Gezählt per Textsuche über \`describe(\`/\`it(\` am Zeilenanfang — auskommentierte
und dynamisch erzeugte Fälle zählen **nicht** mit. Die Einzelfälle stehen im
Lauf (\`node tools/runtime.mjs test\`); hier steht, **wo** sie liegen und **wie
dick** ein Bereich abgedeckt ist.

| Gruppe | Fälle |
|---|---:|
${liste.map(([pfad, n]) => `| ${pfad.replace(/\|/g, '\\|')} | ${n} |`).join('\n')}
`;

  const soll = `${inhalt.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
  const ist = fs.existsSync(DOSSIER_ZIEL) ? fs.readFileSync(DOSSIER_ZIEL, 'utf-8') : '';

  if (ist === soll) {
    console.log(`Test-Dossier aktuell (${gesamt} Fälle, ${liste.length} Gruppen).`);
    return 0;
  }
  if (CHECK) {
    console.error('docs/meta/TEST-DOSSIER.md weicht von test/all.js ab.');
    console.error('Neu schreiben: node tools/content.mjs tests');
    return 1;
  }
  fs.writeFileSync(DOSSIER_ZIEL, soll, 'utf-8');
  console.log(`TEST-DOSSIER.md neu erzeugt (${gesamt} Fälle, ${liste.length} Gruppen, ${soll.split('\n').length} Zeilen).`);
  return 0;
}

// ============================================================================
// 5. CHROME PLATFORM STATUS & MDN BCD UPSTREAM GROUND-TRUTH
// ============================================================================

async function fetchChromeStatus(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();
  const cleanJson = text.replace(/^\)\]\}'\r?\n/, '');
  return JSON.parse(cleanJson);
}

async function queryByMilestone(ms) {
  console.log(`\n🔍 Abfrage Chrome Platform Status für Milestone ${ms}...`);
  const url = `https://chromestatus.com/api/v0/features?milestone=${encodeURIComponent(ms)}`;
  const data = await fetchChromeStatus(url);

  console.log(`📦 Gesamt: ${data.total_count || 0} Features in Chrome ${ms}\n`);
  const byType = data.features_by_type || {};

  for (const [groupName, features] of Object.entries(byType)) {
    if (!features || features.length === 0) continue;
    console.log(`\n=== ${groupName.toUpperCase()} (${features.length}) ===`);
    for (const f of features) {
      console.log(`  • ${f.name} [ID: ${f.id}]`);
      if (f.summary) {
        const shortSummary = f.summary.replace(/[\r\n]+/g, ' ').substring(0, 100);
        console.log(`    ↳ ${shortSummary}...`);
      }
    }
  }
}

async function queryByFeature(term) {
  console.log(`\n🔍 Suche Upstream-Status für Feature: "${term}"...`);
  const url = `https://chromestatus.com/api/v0/features?q=${encodeURIComponent(term)}`;
  const data = await fetchChromeStatus(url);

  const features = data.features || [];
  if (features.length === 0) {
    console.log(`\n⚠️  Kein Feature zu "${term}" in Chrome Platform Status gefunden.`);
    console.log(`   ↳ Hinweis: Wenn ein CSS/JS-Feature hier nicht existiert (z. B. "string-set"),`);
    console.log(`     wurde es von Chromium weder implementiert noch vorgeschlagen.\n`);
    return;
  }

  console.log(`\n✓ ${features.length} Treffer auf chromestatus.com gefunden:\n`);

  features.slice(0, 10).forEach((f, idx) => {
    const desktopMs = f.browsers?.chrome?.desktop || f.browsers?.chrome?.status?.milestone_str || 'Unbekannt';
    const statusText = f.browsers?.chrome?.status?.text || (typeof desktopMs === 'number' ? `Enabled (M${desktopMs})` : desktopMs);
    const category = f.category || 'Web Platform';

    console.log(`${idx + 1}. ${f.name}`);
    console.log(`   Status:    ${statusText} (Chrome Desktop: ${desktopMs})`);
    console.log(`   Kategorie: ${category}`);
    if (f.summary) {
      const summaryClean = f.summary.replace(/[\r\n]+/g, ' ').substring(0, 140);
      console.log(`   Info:      ${summaryClean}...`);
    }
    console.log(`   Link:      https://chromestatus.com/feature/${f.id}\n`);
  });
}

export async function queryFeature(args = process.argv.slice(2)) {
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(`
Nutzung:
  node tools/content.mjs feature <feature-name>
  node tools/content.mjs feature --milestone <version>

Beispiele:
  node tools/content.mjs feature popover
  node tools/content.mjs feature "anchor positioning"
  node tools/content.mjs feature string-set
  node tools/content.mjs feature --milestone 150
`);
    return 0;
  }

  const milestoneIndex = args.indexOf('--milestone');
  const milestone = milestoneIndex !== -1 ? args[milestoneIndex + 1] : null;
  const query = milestone ? null : args.join(' ').trim();

  try {
    if (milestone) await queryByMilestone(milestone);
    else if (query) await queryByFeature(query);
  } catch (err) {
    console.error(`❌ Fehler beim Abfragen von chromestatus.com: ${err.message}`);
    return 1;
  }
  return 0;
}

// ============================================================================
// 6. ADR DRIFT GUARD
// ============================================================================

export function parseCodeLinks(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return [];
  const fm = match[1];
  const lines = fm.split(/\r?\n/);
  let inCodeLinks = false;
  const links = [];
  for (const line of lines) {
    if (/^code_links:\s*$/.test(line)) {
      inCodeLinks = true;
      continue;
    }
    if (inCodeLinks) {
      if (/^\s+-\s+['"]?([^'"]+)['"]?/.test(line)) {
        const m = line.match(/^\s+-\s+['"]?([^'"]+)['"]?/);
        if (m) links.push(m[1].trim());
      } else if (/^[a-zA-Z_]/.test(line)) {
        inCodeLinks = false;
      }
    }
  }
  return links;
}

export function runAdrCheck() {
  const cssAdrPath = path.join(REPO_ROOT, 'docs/css/ADR-CSS.md');
  const jsAdrPath = path.join(REPO_ROOT, 'docs/js/ADR-JS.md');

  // Regel 1: 1:1-Bijektion code_links ↔ Dateisystem
  const cssCodeLinks = parseCodeLinks(cssAdrPath);
  const jsCodeLinks = parseCodeLinks(jsAdrPath);

  const physicalCssDir = path.join(REPO_ROOT, 'website/css');
  const physicalCss = fs.existsSync(physicalCssDir)
    ? fs.readdirSync(physicalCssDir).filter(f => f.endsWith('.css')).map(f => 'website/css/' + f).sort()
    : [];

  const physicalJsDir = path.join(REPO_ROOT, 'website/js');
  const physicalJs = fs.existsSync(physicalJsDir)
    ? fs.readdirSync(physicalJsDir).filter(f => f.endsWith('.js') && !f.endsWith('.d.ts')).map(f => 'website/js/' + f).sort()
    : [];

  const orphanCodeLinks = [];
  for (const link of [...cssCodeLinks, ...jsCodeLinks]) {
    if (!fs.existsSync(path.join(REPO_ROOT, link))) {
      orphanCodeLinks.push(link);
    }
  }

  const missingCss = physicalCss.filter(f => !cssCodeLinks.includes(f));
  const missingJs = physicalJs.filter(f => !jsCodeLinks.includes(f));

  const regel1Ok = orphanCodeLinks.length === 0 && missingCss.length === 0 && missingJs.length === 0;

  // Regel 2: Annotation-Guard
  const missingAnnotation = [];
  for (const jsFile of physicalJs) {
    const absPath = path.join(REPO_ROOT, jsFile);
    const lines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/).slice(0, 5);
    const hasAdr = lines.some(line => /@adr\s+\[\[.+?\]\]/.test(line));
    if (!hasAdr) {
      missingAnnotation.push(jsFile);
    }
  }
  const regel2Ok = missingAnnotation.length === 0;

  // Regel 3: Registry-Zähler
  const cssContent = fs.existsSync(cssAdrPath) ? fs.readFileSync(cssAdrPath, 'utf8') : '';
  const jsContent = fs.existsSync(jsAdrPath) ? fs.readFileSync(jsAdrPath, 'utf8') : '';

  const cssMatch = cssContent.match(/exakt\s*[*_]*\s*(\d+)\s*[*_]*\s*aktive/i);
  const jsMatch = jsContent.match(/Die\s*[*_]*\s*(\d+)\s*[*_]*\s*Module/i);

  const cssCounter = cssMatch ? parseInt(cssMatch[1], 10) : null;
  const jsCounter = jsMatch ? parseInt(jsMatch[1], 10) : null;

  const regel3CssOk = cssCounter === cssCodeLinks.length;
  const regel3JsOk = jsCounter === jsCodeLinks.length;
  const regel3Ok = regel3CssOk && regel3JsOk;

  // Regel 4: Verwaiste Assets
  const adrFiles = [];
  function collectAdrs(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory() && ent.name !== 'archive') collectAdrs(full);
      else if (ent.isFile() && ent.name.startsWith('ADR-') && ent.name.endsWith('.md')) adrFiles.push(full);
    }
  }
  collectAdrs(path.join(REPO_ROOT, 'docs'));
  adrFiles.sort();
  const fileRefRegex = /(?:`|"|\x27|\b)([a-zA-Z0-9_\-\.\/]+\.(?:css|js|json\.gz|svg))(?:`|"|\x27|\b)/g;

  const findings = [];

  for (const adrPath of adrFiles) {
    const file = path.basename(adrPath);
    const content = fs.readFileSync(adrPath, 'utf8');
    const lines = content.split(/\r?\n/);
    let inFence = false;
    let inAntipattern = false;

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('```')) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;

      if (line.includes('Antipattern') || file === 'ADR-ANTIPATTERN.md') {
        inAntipattern = true;
      }
      if (inAntipattern && line.startsWith('## ') && !line.includes('Antipattern')) {
        inAntipattern = false;
      }
      if (inAntipattern) return;

      const lower = line.toLowerCase();
      if (
        lower.includes('bündelt') ||
        lower.includes('vormalig') ||
        lower.includes('ehemals') ||
        lower.includes('gelöscht') ||
        lower.includes('entfernt') ||
        lower.includes('entfallen') ||
        lower.includes('berichtigt') ||
        lower.includes('optionales release-artefakt') ||
        lower.includes('z.b.') ||
        lower.includes('eliminated') ||
        lower.includes('hard ban')
      ) {
        return;
      }

      if (line.includes('Moment.js')) return;
      if (file === 'ADR-HTML.md' && (line.includes('link rel="stylesheet"') || line.includes('script type="module"'))) return;
      if (file === 'ADR-EVENT-DRIVEN-ARCHITECTURE.md' && (line.includes('44-address-domain.js') || line.includes('51-persistence.js'))) return;

      let match;
      while ((match = fileRefRegex.exec(line)) !== null) {
        const ref = match[1];
        if (ref.startsWith('http') || ref.startsWith('@') || ref.startsWith('api.') || ref.includes('node_modules')) continue;

        let exists = false;
        const checkPath = path.resolve(REPO_ROOT, ref);
        if (fs.existsSync(checkPath)) exists = true;
        if (!exists && !ref.includes('/')) {
          const candidates = [
            path.join(REPO_ROOT, 'website/js', ref),
            path.join(REPO_ROOT, 'website/css', ref),
            path.join(REPO_ROOT, 'website/data', ref),
            path.join(REPO_ROOT, 'website/assets', ref),
            path.join(REPO_ROOT, 'tools', ref)
          ];
          for (const c of candidates) {
            if (fs.existsSync(c)) { exists = true; break; }
          }
        }

        if (!exists) {
          findings.push({ file, line: idx + 1, reference: ref });
        }
      }
    });
  }

  findings.sort((a, b) => {
    if (a.file === 'ADR-TOAST-SYSTEM.md' && b.file !== 'ADR-TOAST-SYSTEM.md') return -1;
    if (b.file === 'ADR-TOAST-SYSTEM.md' && a.file !== 'ADR-TOAST-SYSTEM.md') return 1;
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });

  const exitCode = (regel1Ok && regel2Ok && regel3Ok) ? 0 : 1;

  return {
    regel1: {
      status: regel1Ok ? 'ok' : 'error',
      css: { expected: physicalCss.length, actual: cssCodeLinks.length, missing: missingCss },
      js: { expected: physicalJs.length, actual: jsCodeLinks.length, missing: missingJs },
      orphan_code_links: orphanCodeLinks
    },
    regel2: {
      status: regel2Ok ? 'ok' : 'error',
      files_checked: physicalJs.length,
      missing_annotation: missingAnnotation
    },
    regel3: {
      status: regel3Ok ? 'ok' : 'error',
      adr_css: { counter: cssCounter, code_links: cssCodeLinks.length },
      adr_js: { counter: jsCounter, code_links: jsCodeLinks.length }
    },
    regel4: {
      status: findings.length > 0 ? 'warning' : 'ok',
      findings
    },
    exit_code: exitCode
  };
}

function printAdrHuman(res) {
  console.log('adr-check — Ergebnis\n');

  const totalRegistered = res.regel1.css.actual + res.regel1.js.actual;
  const totalExpected = res.regel1.css.expected + res.regel1.js.expected;
  if (res.regel1.status === 'ok') {
    console.log(`Regel 1 (Bijektion): ✅ ${totalRegistered}/${totalExpected} Dateien registriert`);
  } else {
    console.log(`Regel 1 (Bijektion): ❌ Fehler (${totalRegistered}/${totalExpected} registriert)`);
    if (res.regel1.orphan_code_links.length > 0) {
      console.log(`  - Nicht-existente code_links: ${res.regel1.orphan_code_links.join(', ')}`);
    }
    if (res.regel1.css.missing.length > 0) {
      console.log(`  - Fehlend in ADR-CSS.md: ${res.regel1.css.missing.join(', ')}`);
    }
    if (res.regel1.js.missing.length > 0) {
      console.log(`  - Fehlend in ADR-JS.md: ${res.regel1.js.missing.join(', ')}`);
    }
  }

  if (res.regel2.status === 'ok') {
    console.log(`Regel 2 (Annotation): ✅ ${res.regel2.files_checked}/${res.regel2.files_checked} Dateien haben @adr-Tag`);
  } else {
    console.log(`Regel 2 (Annotation): ❌ Fehlende Tags in ${res.regel2.missing_annotation.join(', ')}`);
  }

  if (res.regel3.status === 'ok') {
    console.log(`Regel 3 (Registry-Zähler): ✅ ADR-CSS ${res.regel3.adr_css.counter}/${res.regel3.adr_css.code_links}, ADR-JS ${res.regel3.adr_js.counter}/${res.regel3.adr_js.code_links}`);
  } else {
    console.log(`Regel 3 (Registry-Zähler): ❌ Zähler-Abweichung (CSS: ${res.regel3.adr_css.counter} vs ${res.regel3.adr_css.code_links}, JS: ${res.regel3.adr_js.counter} vs ${res.regel3.adr_js.code_links})`);
  }

  if (res.regel4.findings.length === 0) {
    console.log('Regel 4 (Verwaiste Assets): ✅ Keine verwaisten Assets gefunden');
  } else {
    console.log(`Regel 4 (Verwaiste Assets): ⚠ ${res.regel4.findings.length} Funde`);
    for (const f of res.regel4.findings) {
      const extra = f.reference === 'layout.css' ? ' (nicht existent)' : '';
      console.log(`  - ${f.file}:${f.line} → ${f.reference}${extra}`);
    }
  }

  console.log('');
  if (res.exit_code === 0) {
    if (res.regel4.findings.length > 0) {
      console.log('Status: PASS (Regel 1-3 OK, Regel 4 nur Warnungen)');
    } else {
      console.log('Status: PASS (Alle Regeln OK)');
    }
  } else {
    console.log('Status: FAIL (Fehler in Regel 1, 2 oder 3)');
  }
  console.log(`Exit-Code: ${res.exit_code}`);
}

export function checkAdr(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(`Usage: node tools/content.mjs adr [options]

Präventiver ADR-Drift-Wächter für DIN-BriefNEO.
Prüft die 4 Regeln:
  Regel 1: 1:1-Bijektion code_links ↔ Dateisystem (ADR-CSS, ADR-JS)
  Regel 2: Annotation-Guard (@adr [[...]] in den ersten 5 Zeilen von website/js/*.js)
  Regel 3: Registry-Zähler (Textzähler vs. code_links.length)
  Regel 4: Verwaiste Assets (Referenzen auf gelöschte Dateien in docs/10-architecture/ADR-*.md)

Optionen:
  --json       Maschinenlesbare JSON-Ausgabe
  --help       Hilfe anzeigen`);
    return 0;
  }

  const res = runAdrCheck();

  if (argv.includes('--json')) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    printAdrHuman(res);
  }

  return res.exit_code;
}

// ============================================================================
// CLI DISPATCHER
// ============================================================================

function printUsage() {
  console.log(`
DIN-BriefNEO Content Module (tools/content.mjs)
==============================================
Kanonischer Daten- und Inhaltsmanager.

Befehle:
  plz          Baut das verlustfreie Columnar-PLZ-Asset (orte.json.gz)
               Optionen: --download, --neu
  grosskunden  Kompiliert das Großkundenverzeichnis (grosskunden.json.gz)
  backlog      Synchronisiert die BACKLOG.md Übersichtstabelle
               Optionen: --check (prüft auf Drift)
  tests        Erzeugt docs/meta/TEST-DOSSIER.md aus test/all.js
               Optionen: --check (prüft auf Drift)
  feature      Fragt chromestatus.com nach Feature-Status ab
               Optionen: <name>, --milestone <version>
  adr          Führt den präventiven ADR-Drift-Check aus
               Optionen: --json, --help

Beispiele:
  node tools/content.mjs plz
  node tools/content.mjs backlog --check
  node tools/content.mjs tests --check
  node tools/content.mjs feature popover
  node tools/content.mjs adr
`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const [cmd, ...args] = process.argv.slice(2);

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printUsage();
    process.exit(0);
  }

  try {
    switch (cmd) {
      case 'plz':
        await buildPlzData(args);
        break;
      case 'grosskunden':
        buildGrosskunden();
        break;
      case 'backlog':
        process.exitCode = syncBacklog(args);
        break;
      case 'tests':
      case 'dossier':
        process.exitCode = generateDossier(args);
        break;
      case 'feature':
        process.exitCode = await queryFeature(args);
        break;
      case 'adr':
        process.exitCode = checkAdr(args);
        break;
      default:
        console.error(`Unbekannter Befehl: "${cmd}". Siehe --help.`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`\n❌ FEHLER in content.mjs [${cmd}]:`, err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
