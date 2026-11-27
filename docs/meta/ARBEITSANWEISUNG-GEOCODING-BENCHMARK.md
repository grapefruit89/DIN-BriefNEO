---
id: arbeitsanweisung-geocoding-benchmark
title: "Arbeitsanweisung: Geocoding Benchmark (Geoapify vs. Nominatim vs. Photon)"
type: plan
status: active
created: '2026-11-20'
updated: '2026-11-20'
tags:
  - din-briefneo
  - din-briefneo/meta
  - geocoding
  - benchmark
summary: "Dokumentation und Spezifikation für Arbeitsanweisung: Geocoding Benchmark (Geoapify vs. Nominatim vs. Photon)."
doc_links:
  - [[BACKLOG-ARCHIV]]
  - [[BACKLOG]]
  - [[BENCHMARK-GEOCODING-2026-11-20]]
code_links:
  - website/js/address.js
  - website/js/main.js
depends_on:
---
# Arbeitsanweisung: Geocoding Benchmark (Geoapify vs. Nominatim vs. Photon)

**Kontext:** Für die Adress-Autovervollständigung im Empfängerfeld nutzt DIN-BriefNEO aktuell ein optimiertes Geoapify-Setup (BYOK, Pre-Warming, 300 ms Debounce, LRU-Cache, EU-Bias). Das Backlog-Item B28 (Multi-Provider Abstraktion) wurde verworfen, da freie Alternativen (OSM Nominatim, Komoot Photon) in Vortests subjektiv zu träge waren.

**Ziel dieser Arbeitsanweisung:** Ein anderer Agent soll einen deterministischen, wiederholbaren Latenz- und Qualitätsvergleich zwischen Geoapify, Nominatim und Photon durchführen.

---

## 1. Testkandidaten & Endpunkte

1. **Geoapify Autocomplete API (Baseline):**
   - Endpunkt: `https://api.geoapify.com/v1/geocode/autocomplete?text={query}&filter=countrycode:de&format=json&apiKey={key}`
   - Free Tier: 3.000 Requests/Tag (5 Req/s).
2. **OSM Nominatim (Öffentliche Instanz):**
   - Endpunkt: `https://nominatim.openstreetmap.org/search?q={query}&countrycodes=de&format=json&addressdetails=1&limit=5`
   - Policy: Max. 1 Req/s. **Strikter User-Agent Pflicht** (Platzhalter wie `example.invalid` erzeugen sofort HTTP 403; erfordert echten Kontakt wie `mailto:user@domain.de`).
   - **Wichtig:** Die OSM Usage Policy verbietet Autocomplete ausdrücklich (*„Auto-complete search … you must not implement such a service“* — Verstoß führt zum IP-Bann).
3. **Komoot Photon:**
   - Endpunkt: `https://photon.komoot.io/api/?q={query}&lang=de&limit=5`
   - Basis: OSM-Daten via ElasticSearch.
   - **Wichtig:** Öffentliche Instanz drosselt bei Last und sperrt IPs per TCP-RST / 503 nach kurzen Bursts (~25 Anfragen bei 5 Req/s).

---

## 2. Test-Szenarien (Korpus typischer deutscher Adressen)

Der Test muss jeweils 10 standardisierte Adress-Suchanfragen abdecken:

| Nr. | Eingabe (Query) | Erwartete Zieladresse | Typ |
|---|---|---|---|
| 1 | `Pariser Platz 1 Berlin` | Brandenburger Tor, 10117 Berlin | Prominenter Platz |
| 2 | `Willy-Brandt-Straße 1` | Bundeskanzleramt, 10557 Berlin | Bindestrich-Straße |
| 3 | `Hauptstr 42 Koeln` | Hauptstraße 42, 50996 Köln (Umlaut) | Abkürzung ohne Punkt |
| 4 | `Goethestr. 12 Frankfurt` | Goethestraße 12, 60313 Frankfurt am Main | Punktierte Straße |
| 5 | `Am Markt 3 Leipzig` | Markt 3, 04109 Leipzig | Platz / Innenstadt |
| 6 | `80331 Muenchen Marienplatz` | Marienplatz, 80331 München | PLZ zuerst |
| 7 | `Bahnhofstr 1 20095` | Bahnhofstraße 1, 20095 Hamburg | PLZ am Ende |
| 8 | `Dorfstr 5 Hintertupf` | Ländliche Dorfstraße | Kleinstadt / Dorf |
| 9 | `Friedrichstr 100` | Mehrdeutige Großstadt-Straße | Ohne Ortsangabe |
| 10 | `Schillerweg 7a` | Hausnummer mit Buchstabe | Suffix |

> **Hinweise zum Test-Korpus aus der Praxis:**
> - Query 3 (`Hauptstr 42 Koeln`): Mehrdeutig, da Köln mehrere Hauptstraßen besitzt (z. B. Porz 51143, Sürth 50999).
> - Query 5 (`Am Markt 3 Leipzig`): „Am Markt“ ist eine andere Straße als „Markt 3, 04109 Leipzig“.
> - Query 7 (`Bahnhofstr 1 20095`): Nicht existent in Hamburg (Overpass findet 0 Treffer für Bahnhofstr. 1 in 20095).

---

## 3. Messgrößen (Zu erfassende Metriken)

Für jeden der 3 Provider sind über 3 Durchläufe (kalt, warm 1, warm 2) zu messen:
1. **Latenz (TTFB & Gesamtdauer in ms):** Min, Max, Median ($p_{50}$), $p_{95}$.
2. **Ergebnisqualität:**
   - Wurden PLZ, Ort, Straße und Hausnummer sauber strukturiert zurückgegeben?
   - Steht das richtige Ergebnis auf Platz 1?
3. **Rate-Limiting / HTTP 429:**
   - Verhalten bei schnellen Tastenanschlägen (Burst mit 5 Requests innerhalb 500 ms).
4. **Offline-/Self-Host-Fähigkeit:**
   - Docker-Image-Größe und RAM-Bedarf bei lokalem Betrieb (z. B. Photon Docker Container).

---

## 4. Ergebnisbericht & Akzeptanzkriterium

Der Agent liefert die Ergebnisse als Markdown-Tabelle im Format:
```markdown
| Provider | Latenz (Median) | Latenz (p95) | Trefferquote (Top-1) | Burst-Stabilität (429) | Fazit |
```

**Entscheidungsschwelle für DIN-BriefNEO:**
- Ein Wechsel oder Fallback lohnt sich nur, wenn ein freier Provider median unter **150 ms** antwortet und bei 5 Requests/s stabil ohne HTTP 429 bleibt.
- Bleiben Nominatim/Photon bei > 400 ms oder drosseln sie, bleibt Geoapify als alleiniger Provider bestätigt.

---

## 5. Durchgeführte Benchmarks

- **2026-11-20:** Vollständiger Benchmark-Bericht siehe [[BENCHMARK-GEOCODING-2026-11-20]].
  - *Ergebnis:* Kein Wechsel. Nominatim verbietet Autocomplete per Policy; Photon blockiert IP nach Last-Burst; Geoapify bleibt stabil und ist als einziger Anbieter vertraglich/technisch für clientseitiges Autocomplete tragfähig.
