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
doc_links:
  - '[[BACKLOG-ARCHIV]]'
  - '[[BACKLOG]]'
code_links:
  - 'website/js/address.js'
  - 'website/js/main.js'
depends_on: []
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
   - Policy: Max. 1 Req/s, strikter `User-Agent` erforderlich.
3. **Komoot Photon:**
   - Endpunkt: `https://photon.komoot.io/api/?q={query}&lang=de&limit=5`
   - Basis: OSM-Daten via ElasticSearch.

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
