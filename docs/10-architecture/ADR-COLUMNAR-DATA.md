---
id: adr-columnar-data
title: 'ADR-013: Verlustfreies Columnar-JSON & Deterministische Daten-Pipeline'
type: adr
status: active
created: '2026-11-09'
updated: '2026-11-09'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-JS
  - ADR-OFFLINE-ADDRESS-INTELLIGENCE
  - Immutable-Law-Catalog
code_links:
  - package.json
  - tools/build_plz_data.mjs
  - tools/build_columnar_data.mjs
  - tools/data/plz_states.json
  - website/data/orte.json.gz
  - website/data/grosskunden.json.gz
  - website/js/address.js
error_patterns:
  - columnar json
  - plz datenbank
  - ortsteile verlust
  - bundesland disambiguierung
supersedes: []
depends_on: []
---

# ADR-013: Verlustfreies Columnar-JSON & Deterministische Daten-Pipeline

## 1. Kontext & Problemstellung

Die Adress- und PLZ-Intelligenz von DIN-BriefNEO arbeitet 100 % clientseitig und offline (Tier-1-Lookup gemäß [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]). Historisch war der Datenbestand in `website/data/` jedoch fragmentiert und redundant gewachsen:
1. **Datei-Dubletten:** `de_plz_ort.json.gz` und `orte.json.gz` waren identische Zwillinge (je 68 KB, identischer SHA256 `c5e4c12c815741d3`), ebenso `de_grosskunden_plz.json.gz` und `grosskunden.json.gz` (je 55 KB).
2. **Daten-Fragmentierung:** Ortsteile (`de_districts.json.gz`) waren in einer separaten Datei ausgelagert, wodurch mehrere asynchrone HTTP-Requests und Mapping-Schritte im Client nötig waren.
3. **V8-Engine Overhead bei Key-Value / Objekt-Arrays:**
   - Ein Key-Value-Dictionary (`{ "53840": "Troisdorf", ... }`) kann weder Ortsteile noch Bundesländer verlustfrei abbilden.
   - Ein klassisches Objekt-Array (`[{ plz: "53840", ort: "Troisdorf", ... }]`) erzeugt über 10.000 einzelne JS-Objekt-Allokationen im Heap und erhöht den Garbage-Collection-Druck (GC-Pressure).
4. **Fehlende Disambiguierung gleichnamiger Orte:** Orte wie *Neustadt*, *Münster* oder *Hausen* existieren mehrfach in unterschiedlichen Bundesländern. Ohne Bundesland-Zuordnung im UI war eine gezielte Auswahl unmöglich.

---

## 2. Entscheidung: Spaltenbasiertes Columnar-JSON

Wir konsolidieren den gesamten deutschen PLZ-, Orts-, Ortsteil- und Bundesland-Bestand in einer einzigen, spaltenbasierten Datei `website/data/orte.json.gz`.

### Benchmark-Vergleich (10.184 PLZ-Datensätze)

| Format | Heap-Speicher (V8) | Parse-Zeit (V8) | Payload (Gzip) | Index-Erstellung |
|---|:---:|:---:|:---:|:---:|
| **Key-Value Map** | 982,3 KB | 0,99 ms | 55,0 KB | 3,7 ms (Object.entries) |
| **Objekt-Array** | 628,6 KB | 1,84 ms | 57,8 KB | 2,9 ms (Array-Loop) |
| **Columnar-JSON (Dieser Standard)** | **335,3 KB** | **0,89 ms** | **66,7 KB** | **1,6 ms (Index-Schleife)** |

**Vorteile des Columnar-Formats:**
* **-65,8 % V8-Heap-Bedarf:** Der Browser allokiert exakt 4 flache `FixedArray`-Speicherblöcke im RAM statt 10.184 Einzelobjekten.
* **Single-Pass-Iteration:** Keine Zwischenobjekte, keine `Object.entries()`-Kosten.
* **Verlustfreie Ortsteile & Bundesländer:** Jede Zeile $i$ verknüpft PLZ, Hauptort, Ortsteil(e) und ISO-Bundesland-Kürzel.

---

## 3. Dateistruktur in `website/data/`

Nach der Bereinigung verbleiben exakt drei schlanke, autoritative Datensätze (Gesamt-Payload: 139 KB statt zuvor 267 KB):

### 1. `website/data/orte.json.gz` (66,7 KB)
Kanonische spaltenbasierte Datenbank aller 10.184 deutschen Postleitzahlen:
```json
{
  "plz": ["01067", "53840", "53844", "92660"],
  "ort": ["Dresden", "Troisdorf", "Troisdorf", "Neustadt"],
  "district": [null, "Troisdorf-Mitte, Oberlar, FWH", "Bergheim, Eschmar, Müllekoven, Sieglar", null],
  "state": ["SN", "NW", "NW", "BY"]
}
```
* `plz`: 5-stellige deutsche Postleitzahl (String, strikt aufsteigend sortiert).
* `ort`: Offizieller Gemeindename / Hauptort.
* `district`: Eingemeindete Ortsteile, Stadtteile oder Leitbereiche (oder `null`).
* `state`: 2-Zeichen ISO-3166-2:DE Bundesland-Code (`NW`, `BY`, `BE`, `BW`, `HE`, etc.).

### 2. `website/data/grosskunden.json.gz` (55,0 KB)
Behörden-, Gerichts-, Rundfunk- und Firmen-Großempfänger mit eigener PLZ nach DIN 5008 (Wegfall der Straßenzeile):
```json
{
  "11011": { "city": "Berlin", "name": "Deutscher Bundestag", "typ": "Behörde" },
  "53094": { "city": "Bonn", "name": "Bundesamt für Justiz", "typ": "Behörde" },
  "50656": { "city": "Köln", "name": "Westdeutscher Rundfunk", "typ": "Institution" }
}
```

*Hinweis:* Der ehemalige Teilkatalog `bundesbehoerden.json.gz` (498 Behörden) ist zu 100 % in `grosskunden.json.gz` integriert; die redundante Zwischendatei wurde bereinigt.

---

## 4. Datenherkunft & Lizenzen

| Datensatz | Primärquelle | Lizenz | Bereinigungs- & Qualitätsregeln |
|---|---|---|---|
| **Zustell-PLZ & Orte** | GeoNames DE Export & BKG Open Data | CC-BY 4.0 / dl-de/by-2-0 | Administrative Präfixe bereinigt; Amtsgraph als Ground-Truth; 0 Firmen in orte. |
| **Ortsteile** | OpenStreetMap / Postal Boundaries | ODbL / Open Data | Aggregiert pro PLZ (z. B. Troisdorf 53840/53842/53844); historische Dubletten entfernt. |
| **Bundesland-Codes** | ISO-3166-2:DE / Statistisches Bundesamt | Gemeinfrei | Falschzuordnungen aus Firmensitzen bereinigt (z. B. norisbank 10910 -> BE statt NW). |
| **Großkunden** | DPAG Mitteilungsblatt & service.bund.de | Amtliches Werk / Fair Use | Typ-Klassifikation in *Behörde*, *Gericht*, *Institution*, *Firma*. |

---

## 5. Reproduzierbarkeit (Der 5-Jahres-Befehl)

Die Kompilierung des Datensatzes ist 100 % deterministisch, offline-fähig und benötigt keine externen Netzwerkverbindungen.

### Der Rebuild-Befehl:
```bash
npm run build:data
# bzw. direkt via Node.js:
node tools/build_plz_data.mjs

# Optional: Frische Rohdaten direkt von GeoNames ziehen:
node tools/build_plz_data.mjs --download
```

### Was der Befehl ausführt:
1. Liest die autoritative PLZ- und Ortsteil-Basis aus `website/data/orte.json.gz` (Schutz vor Verlust der 303 manuellen Ortsteile wie Troisdorf 53840/53842/53844).
2. Verknüpft die deterministische ISO-3166-2:DE Mapping-Tabelle aus `tools/data/plz_states.json` (mit Ausnahmen/Firmensitz-Korrekturen).
3. Bei `--download`: Lädt `DE.zip` von GeoNames herunter und entpackt `DE.txt` rein im Arbeitsspeicher ohne Festplatten-Müll.
4. Sortiert strikt numerisch nach PLZ (`01067` bis `99998`).
5. Führt automatisierte Sanity- und Invarianz-Prüfungen durch (Troisdorf-Ortsteile, Berlin, München, homonyme Neustadt-Codes).
6. Schreibt die Datei mit Gzip-Level 9 (`mtime=0`) komprimiert nach `website/data/orte.json.gz` zurück.

---

## 6. Normative DIN-5008-Invariante

* **UI-Darstellung:** Im Dropdown der Seitenleiste (`suggestionsPopover`) wird das Bundesland bei Homonymen zur Orientierung angezeigt:  
  `35279 Neustadt (Hessen)`  
  `53577 Neustadt (Rheinland-Pfalz)`  
  `92660 Neustadt (Bayern)`
* **Briefblatt-Invariante (Strikt DIN 5008):**  
  Beim Klick oder bei der Übernahme landet im Anschriftfeld des Briefes ausnahmslos `[PLZ] [Ort]` (z. B. `35279 Neustadt`). **Weder das Bundesland noch der ISO-Code werden jemals in den Brief übernommen.**
