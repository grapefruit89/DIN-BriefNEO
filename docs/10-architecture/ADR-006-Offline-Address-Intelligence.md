---
id: ADR-006
title: 'ADR-006: Offline Address Intelligence (Brotli Compact Engine & Fallback Architecture)'
type: adr
status: active
created: '2026-09-04'
updated: '2026-09-04'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-JS
  - ADR-HTML
  - Immutable-Law-Catalog
  - longevity-guidelines
code_links:
  - website/js/43-geoapify.js
  - research/research_results/de_plz_ort.json.br
error_patterns:
  - adr-api
  - plz lookup
  - brotli dictionary
  - offline geocoding
  - autocomplete
  - address intelligence
supersedes:
  - ADR-API
depends_on: []
---

# ADR-006: Offline Address Intelligence (Brotli Compact Engine & Fallback Architecture)

## Context

Bisher basierte die Adress- und PLZ-Vervollständigung auf dem Konzept aus `ADR-API.md`, welches für jede Tastenanschlags-Interaktion externe Cloud-APIs (Geoapify und Zippopotam) via `fetch()` abfragte.

Dies führte zu drei kritischen Schwachstellen:
1. **Latenz:** 150 bis 300 ms Netzwerk-Latenz pro Tastendruck machten die Formular-Interaktion träge.
2. **API-Key- und Online-Zwang:** Ohne aktiven Internetzugang oder ohne konfigurierten Geoapify-API-Key war keine intelligente Unterstützung vorhanden.
3. **Verstoß gegen das Offline-First-Prinzip:** DIN-Brief Neo muss laut `Immutable-Law-Catalog.md` und `constitution.md` autark und unter `file:///` lauffähig sein.

Mit der Erstellung des optimierten, nur **70,5 KB** großen Brotli-gepackten PLZ/Ort-Wörterbuchs (`research/research_results/de_plz_ort.json.br`) steht ein vollständiger Datenbestand aller deutschen Postleitzahlen und Ortsnamen zur Verfügung, der clientseitig in **unter 0,2 ms** abgefragt werden kann.

## Entscheidung

`ADR-API.md` wird vollständig durch dieses Dokument (`ADR-006`) abgelöst. Wir etablieren eine zweistufige Offline-First-Architektur für alle Adress-Eingaben:

### 1. Primärquelle: Lokales Brotli-Dictionary (Tier 1)
- Die ca. 70,5 KB große Binärdatei `de_plz_ort.json.br` dient als autoritative, lokale Datenquelle für alle PLZ- und Ortsabfragen.
- Die Dekomprimierung erfolgt nativ über die Standard-Browser-API `DecompressionStream('brotli')` (unterstützt ab Chrome 117+, voll kompatibel mit Baseline Chrome 148+).
- Das resultierende Mapping (PLZ ↔ Ort) wird als indizierte Lookup-Tabelle im Hauptspeicher gehalten.
- **Bidirektionale Zero-Latency-Vervollständigung:**
  - Eingabe einer 5-stelligen PLZ führt sofort und synchron zur automatischen Befüllung des Ortsnamens.
  - Eingabe eines Ortsnamens schlägt passende PLZ-Präfixe vor.
- **Null Netzwerkanfragen** für PLZ- und Ortsabgleiche.

### 2. Sekundärquelle: Optionale Cloud-Anreicherung (Tier 2 Fallback)
- Externe APIs (Photon / OpenStreetMap und Geoapify) sind rein **optional** und dienen ausschließlich der Straßen- und Hausnummern-Vervollständigung.
- Sie dürfen niemals die primäre PLZ/Ort-Auflösung blockieren.
- Wenn Geoapify genutzt wird, muss der API-Key weiterhin über den sicheren Header `x-api-key` übertragen werden, und jeder Request muss über einen `AbortController` abgesichert sein.
- Schlägt ein externer Request fehl (Offline, Rate-Limit, ungültiger Key), verbleibt das System transparent und ohne Fehlermeldung auf Tier 1.

## Konsequenzen

- **Positiv (Sofortige Latenzfreiheit):** Adressvervollständigung reagiert in unter 1 ms, kein "Tipp-Stau" mehr.
- **Positiv (100% Offline-Resilienz):** PLZ- und Ortsvalidierung funktionieren im Flugzeug, im Funkloch und komplett ohne Internetzugang.
- **Positiv (Datenschutz / DSGVO):** Keine Nutzeradressen werden an Dritte übertragen, solange nur PLZ und Ort getippt werden.
- **Negativ / Aufwand:** Das Brotli-Asset (`de_plz_ort.json.br`) muss in den Distributions-Assets mitgeliefert werden (~70 KB zusätzliches Dateivolumen).
