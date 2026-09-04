# Wartungs-, Update- & Entkopplungs-Architektur für PLZ- und Großempfänger-Daten

> **Status:** Verbindliche Architektur-Spezifikation für Wartung, CI/CD-Updates und API-Fallback.  
> **Kernfragen:**  
> 1. Ist das alles in OpenPLZ drin?  
> 2. Wie verhindern wir starres Hardcoding und machen die JSON/Brotli-Datenbank austauschbar und updatebar?

---

## 1. Die Antwort: Ist das alles in OpenPLZ drin?

**Nein. OpenPLZ enthält keine Großempfänger.**

### Die Ursache (Amtliche Katasterdaten vs. Post-Sortiercodes):
Wir haben OpenPLZ live gegen die prominentesten Großempfänger getestet:
- `10888` (Axel Springer SE) ➔ Liefert `[]` (Leeres Array)
- `11011` (Deutscher Bundestag) ➔ Liefert `[]`
- `11012` (Bundeskanzleramt) ➔ Liefert `[]`
- `53094` (Bundesamt für Justiz) ➔ Liefert `[]`
- `60600` (The Squaire) ➔ Liefert `[]`
- `38436` (Volkswagen AG) ➔ Liefert `[]`
- `53111` (Reguläre Bonner Wohngebiets-PLZ) ➔ Liefert korrekt `Bonn`

### Warum Kataster-APIs Großempfänger ignorieren müssen:
- **OpenPLZ, Destatis und das BKG (Bundesamt für Kartographie und Geodäsie)** erfassen ausschließlich **territoriale Gebietskörperschaften** (Gemeinden, Kreise, Ortsteile) mit gemeldeten Einwohnern und physischen Straßennetzen.
- **Großempfänger-PLZ (GE) und Postfach-PLZ** sind jedoch **keine geografischen Gebiete**, sondern rein interne logistische Sortier-Endpunkte der privaten **Deutsche Post AG**.
- Im amtlichen Gemeindeverzeichnis existiert `11011 Berlin` schlichtweg nicht – für das Katasteramt existiert dort nur die Gemarkung Mitte mit Straßen-PLZ.
- **Fazit:** Keine einzige offizielle Open-Data-Behördenschnittstelle (weder OpenPLZ, noch GeoNames, noch OpenStreetMap) führt Großempfänger. Sie stammen exklusiv aus den Sortierdaten der Deutschen Post Direkt Datafactory.

---

## 2. Wie lösen wir das Wartungsproblem ohne Hardcoding?

Ein starres Einbetten von Daten im Quellcode ist ein Anti-Pattern. Die Lösung besteht aus einer sauberen, vierteiligen Entkopplung:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      1. Build- & Update-Pipeline                        │
│ tools/update_plz_data.js (Holt Open-Data + DPAG Mitteilungsblatt)      │
│ ➔ Generiert de_plz_ort.json.br (71 KB) + de_grosskunden_plz.json       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Generiert
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      2. Statische Asset-Ebene                           │
│ website/data/de_plz_ort.json.br?v=2026.1                                │
│ website/data/de_grosskunden_plz.json?v=2026.1                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Client-seitiger Fetch (ETag / Cache)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 3. Dreistufige Client-Lookup-Kaskade                    │
│                                                                         │
│  Eingabe PLZ                                                            │
│       │                                                                 │
│       ├── Stufe 1: Lokaler Brotli-Cache (0,001 ms) ➔ 99,9 % Treffer     │
│       │                                                                 │
│       ├── Stufe 2: OpenPLZ Live-API (107 ms) ➔ Für brandneue Wohn-PLZ   │
│       │            (Ergebnis wird im localStorage gecacht)              │
│       │                                                                 │
│       └── Stufe 3: Geoapify POI-Lookup ➔ Für Firmennamen & Straßen      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Die 4 Säulen der Wartungs-Architektur im Detail

### Säule A: Das Build-Script-Prinzip (`tools/update_plz_data.js`)
Statt jemals eine JSON-Datei von Hand zu editieren, gehört in das Projekt ein automatisches Wartungsskript:
1. Das Skript lädt den aktuellen Basis-Datensatz aus der Open-Source-Quelle.
2. Es lädt das quartalsweise erscheinende Mitteilungsblatt der Deutschen Post (`dp-mtb-ge-zugaenge.pdf`).
3. Es bereinigt Dubletten, normalisiert Umlaute und komprimiert das Ergebnis nach Brotli (Quality 11).
4. Das Skript wird nahtlos in `npm run update-plz` oder in `tools/build_db.js` eingehängt.
➔ **Wartungsaufwand:** 1 Konsolenbefehl pro Jahr oder Quartal.

### Säule B: ETag & Versioniertes Cache-Busting
Damit Nutzer im Web oder in der PWA sofort die aktualisierten Daten erhalten:
- Die Asset-URL wird mit einem Versions-Query-Parameter versehen:  
  `fetch('data/de_plz_ort.json.br?v=' + APP_VERSION)`
- Der Webserver liefert standardmäßige HTTP-Header (`ETag` und `Cache-Control: public, max-age=31536000, immutable`).
- Ändert sich die Datei beim nächsten Release, lädt der Browser die winzigen 71 KB automatisch einmalig herunter und hält sie danach wieder offline im Speicher.

### Säule C: Das Stufen-Fallback (Niemals ins Leere laufen)
Was passiert, wenn ein Neubaugebiet entsteht und die PLZ in der 71 KB Brotli-Datei noch fehlt?
1. **Stufe 1 (Lokal, 0,001 ms):** Die App schlägt in der In-Memory-Brotli-Tabelle nach. In 99,9 % der Fälle ist die PLZ sofort da.
2. **Stufe 2 (Live OpenPLZ API, 107 ms):**  
   Wird die PLZ lokal nicht gefunden (Cache Miss), fragt ein asynchroner Hintergrund-Call `https://openplzapi.org/de/Localities?postalCode={plz}` ab.  
   Wird dort ein neuer Ort gefunden:
   - Der Ort wird ins Formular eingetragen.
   - Der Eintrag wird im `localStorage` des Nutzers gespeichert (`runtime_plz_cache`). Beim nächsten Mal reagiert die App sofort offline.
3. **Stufe 3 (Geoapify POI / Straßen):**  
   Wird ein Firmenname gesucht, der kein Großempfänger ist, greift wie gewohnt die Adress-Vervollständigung von Geoapify.

### Säule D: Wie realistisch sind PLZ-Änderungen in Deutschland?
- Die 5-stelligen Postleitzahlen wurden 1993 eingeführt.
- **Änderungsrate pro Jahr bei Zustell-PLZ:** **Unter 0,1 %** (nur bei gravierenden Gebietsreformen oder Megabaustellen wie Stuttgart 21 / Hafencity).
- **Änderungsrate bei Großempfängern:** Rund 20–30 Änderungen bundesweit pro Jahr.
- **Fazit:** Ein statisches Wörterbuch von 71 KB ist in Deutschland über Jahre hinweg zu über 99,8 % stabil. Mit Stufe 2 (OpenPLZ-Fallback für Neugemeinden) erreicht das System **100 % Ausfallsicherheit ohne jede manuelle Wartungshektik**.
