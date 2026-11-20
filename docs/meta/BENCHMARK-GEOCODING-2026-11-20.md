---
id: benchmark-geocoding-2026-11-20
title: "Geocoding-Benchmark — Ergebnisbericht (Geoapify vs. Nominatim vs. Photon)"
type: report
status: completed
created: '2026-11-20'
updated: '2026-11-20'
tags:
  - din-briefneo
  - din-briefneo/meta
  - geocoding
  - benchmark
doc_links:
  - '[[ARBEITSANWEISUNG-GEOCODING-BENCHMARK]]'
  - '[[BACKLOG-ARCHIV]]'
  - '[[BACKLOG]]'
code_links:
  - 'website/js/address.js'
depends_on: []
---

# Geocoding-Benchmark — Ergebnisbericht

**Datum:** 2026-11-20, 10:04–10:25 CET
**Auftrag:** `/home/moritz/repos/DIN-BriefNEO/docs/meta/ARBEITSANWEISUNG-GEOCODING-BENCHMARK.md`
**Messrechner:** Nobara-PC, `192.168.2.33`, kabelgebunden (`enp5s0`), Telekom-Anschluss
**Rohdaten:** `/tmp/opencode/geocoding-bench/raw.json`, `retest.json`, `*.q*.json`
**Skripte:** `/tmp/opencode/geocoding-bench/bench.mjs`, `retest.mjs`, `burst2.mjs`, `analyze.py`

## 1. Ergebnis in einem Satz

**Kein Wechsel.** Geoapify bleibt der einzige für Autocomplete nutzbare Provider: Nominatim verbietet Autocomplete per Policy, Photon sperrt die IP nach wenigen Sekunden Last. Photon ist objektiv der schnellste, aber als öffentliche Abhängigkeit unbrauchbar.

## 2. Pflicht-Tabelle (Format aus Abschnitt 4)

| Provider | Latenz (Median) | Latenz (p95) | Trefferquote (Top-1) | Burst-Stabilität (429) | Fazit |
|---|---:|---:|---:|---|---|
| **Geoapify (global)** | **860 ms** (n=30, warm) · 1006 ms kalt | **6219 ms** (warm) · 4194 ms kalt | **4/9 (44 %)** | **stabil**: 5 parallel → 5×200; 5 req/s → 10×200; kein 429 | Einziger nutzbarer Provider; langsam, aber vertraglich und technisch tragfähig |
| **OSM Nominatim** | **19 ms** (warm) · 227 ms kalt | **26 ms** (warm) · 2127 ms kalt | **4/9 (44 %)** | **nicht testbar**: Policy erlaubt max. 1 req/s; 5 bei 1 req/s → 5×200 | **Disqualifiziert**: Autocomplete ist per Policy ausdrücklich verboten |
| **Komoot Photon** | **34 ms** (warm) · 109 ms kalt | **128 ms** (warm) · 279 ms kalt | **5/9 (56 %)** | **instabil**: 5 req/s → 503; nach ~25 Requests **IP-Block (TCP-RST)** | **Disqualifiziert**: schnell, aber öffentliche Instanz drosselt/sperrt |
| *Geoapify EU (Zusatz)* | *799 ms* (n=20) | *6370 ms* | *4/9* | *nicht separat getestet* | *Kein Latenzvorteil gegenüber global* |

> Median/p95 „warm“ = Keep-Alive-Verbindung (Browser-Regelfall). „Kalt“ = neue TCP/TLS-Verbindung je Request (erster Tastendruck nach Seitenaufruf).

## 3. Latenz im Detail (TTFB, ms)

| Provider | Lauf | n | min | p50 | p95 | max |
|---|---|---:|---:|---:|---:|---:|
| Geoapify global | kalt | 10 | 405 | 1006 | 4194 | 6335 |
| Geoapify global | warm 1 | 10 | 382 | 860 | 4005 | 6295 |
| Geoapify global | warm 2 | 10 | 427 | 1041 | 4177 | 6413 |
| Geoapify global | Retest warm | 10 | 490 | 731 | 3870 | 6125 |
| **Geoapify global** | **alle warm** | **30** | **382** | **860** | **6219** | **6413** |
| Nominatim | kalt | 10 | 94 | 227 | 2127 | 3012 |
| Nominatim | warm 2 | 10 | 18 | 19 | 26 | 29 |
| Photon | kalt | 10 | 83 | 109 | 279 | 313 |
| Photon | warm 2 | 10 | 26 | 34 | 128 | 130 |
| Geoapify EU | warm 2 | 10 | 276 | 711 | 4400 | 6434 |

**Auffällig:** `Bahnhofstr 1 20095` braucht bei Geoapify in **allen vier** Serien konsistent ~6,3 s (6335 / 6295 / 6413 / 6125 ms). Alle anderen Queries liegen bei 0,4–1,6 s. Das ist query-spezifisch, nicht Netzrauschen.

**Nominatim-Cache-Legende:** `x-cache: MISS` bei wiederholter Query — die 19 ms sind **keine** Cache-Treffer, sondern reine Serverzeit auf bestehender Verbindung. Der Verbindungsaufbau kostet 100–200 ms (TLS nach Düsseldorf).

## 4. Ergebnisqualität (Top-1, Lauf warm 2)

| # | Query | Geoapify | Nominatim | Photon |
|---|---|---|---|---|
| 1 | `Pariser Platz 1 Berlin` | ✅ Brandenburger Tor, 10117 | ✅ | ✅ |
| 2 | `Willy-Brandt-Straße 1` | ❌ Bergisch Gladbach | ❌ Hanau | ✅ Bundeskanzleramt, 10557 |
| 3 | `Hauptstr 42 Koeln` | ❌ 51143, „Hauptstr.“ | ❌ 51143 | ❌ 50999, „Sürther Hauptstraße“ |
| 4 | `Goethestr. 12 Frankfurt` | ✅ 60313 | ✅ | ✅ |
| 5 | `Am Markt 3 Leipzig` | ❌ 04178 Leipzig | ❌ Kitzscher | ❌ Kitzscher |
| 6 | `80331 Muenchen Marienplatz` | ✅ | ✅ | ✅ |
| 7 | `Bahnhofstr 1 20095` | ❌ Pfronten | ❌ Roding | ❌ Denzlingen |
| 8 | `Dorfstr 5 Hintertupf` | — (fiktiv) | — | — (Treffer in Österreich) |
| 9 | `Friedrichstr 100` | ✅ Sankt Augustin (valide, aber nicht Berlin) | ❌ „Bölschestraße 100“ | ❌ Thorn, PL |
| 10 | `Schillerweg 7a` | ❌ Hausnummer „7“ (Suffix verloren) | ✅ 7A Oranienburg | ✅ 7A Oranienburg |

**Trefferquote:** Geoapify 4/9, Nominatim 4/9, Photon 5/9 (Query 8 fiktiv, ausgeschlossen).

## 5. Burst / Rate-Limiting

| Provider | Test | Ergebnis |
|---|---|---|
| Geoapify | 5 parallel, je eigene Verbindung (~10 req/s) | 5× HTTP 200, Wand 5,0 s (Tail 4,99 s) |
| Geoapify | 5 Requests, 200 ms Abstand (5 req/s), je eigene Verbindung | 5× HTTP 200, Wand 9,2 s (Tail 6,26 s) |
| Geoapify | 10 Requests, 200 ms Abstand (5 req/s) | 10× HTTP 200, TTFB 187–978 ms; **kein 429** |
| Photon | 5 parallel, je eigene Verbindung | 5× HTTP 200, Wand 334 ms |
| Photon | 5 Requests, 200 ms Abstand | 200, 200, 200, **503**, 200 |
| Photon | 10 Requests, 200 ms Abstand | 8× 200, **503**, **ECONNREFUSED** → danach **IP-Block** |
| Nominatim | 5 Requests bei 1 req/s (policy-konform) | 5× HTTP 200 |

**Photon-Sperre belegt:** direkter Verbindungsversuch → TCP-RST (`Failed to connect ... 21 ms`, IP `116.202.51.114`); derselbe Aufruf über einen Drittpfad (`r.jina.ai`) → HTTP 200 mit korrektem JSON. Der Server läuft also, **unsere IP ist gesperrt**. Das deckt sich mit der Photon-README: „Extensive usage will be throttled or completely banned.“

**Nominatim-Burst bewusst nicht bei 5 req/s gefahren:** Die Policy erlaubt maximal 1 req/s und verbietet Autocomplete ausdrücklich („will get you banned“). Ein 5-req/s-Test wäre eine bewusste Policy-Verletzung ohne Erkenntnisgewinn.

## 6. Offline-/Self-Host-Fähigkeit (belegt)

| | Geoapify | Nominatim | Photon |
|---|---|---|---|
| Betriebsmodell | nur Cloud-API; auf der Pricing-Seite kein Self-Host-/On-Prem-Angebot | Docker `mediagis/nominatim:5.3` | **kein offizielles Docker-Image** (`komoot/photon` auf Docker Hub: „object not found“); JAR + GraphHopper-Dump |
| Image / Paket | — | **378,2 MB** (2026-10-26) | Photon-JAR + Dump |
| Datenmenge | — | Deutschland-PBF **4,89 GB** (2026-11-20) | Deutschland-Dump **7,49 GB** komprimiert (2026-11-17); Planet **63,27 GB** |
| RAM | — | min. **2 GB**; Planet 128 GB empfohlen | Planet: **≥64 GB** empfohlen; mit `-Xmx8G` auch weniger |
| Platte | — | Planet 1 TB | Planet ~95 GB (2026) |
| Fair-Use | 3.000 Credits/Tag, 5 req/s (Free Tier, Pricing-Seite bestätigt) | max. 1 req/s, **kein Autocomplete** | „reasonable limit“, Drosselung/Sperre ohne Vorwarnung |

## 7. Korpus-Defekte (wichtig für die Interpretation)

Drei der zehn Sollwerte sind fragwürdig; sie erklären einen Großteil der „Fehlschläge“:

1. **Query 3** (`Hauptstr 42 Koeln` → Soll 50996): Alle drei Provider liefern 51143 (Köln-Porz) bzw. 50999 (andere Straße). In einer Stadt mit mehreren „Hauptstraßen“ ist die Query mehrdeutig; der Sollwert ist nicht verifiziert.
2. **Query 5** (`Am Markt 3 Leipzig` → Soll „Markt 3, 04109“): „Am Markt“ ist eine andere Straße als „Markt“. Geoapify findet „Am Markt 3, 04178 Leipzig“, die anderen Kitzscher. Die Query adressiert das Ziel nicht.
3. **Query 7** (`Bahnhofstr 1 20095` → Soll Hamburg): Kein Provider findet Hamburg; Overpass findet **0** Objekte „Bahnhofstraße 1“ in Hamburg. Die Adresse existiert dort wahrscheinlich nicht.
4. **Query 9** ist bewusst mehrdeutig; alle drei liefern unterschiedliche Städte. Geoapify liefert mit Sankt Augustin eine valide „Friedrichstraße 100“, nicht Berlin.

Auf den vier weitgehend eindeutigen Queries (1, 4, 6, 10): **Geoapify 3/4, Nominatim 4/4, Photon 4/4**. Photons Rückstand in der Gesamtwertung stammt fast ausschließlich aus den mehrdeutigen Queries.

## 8. Entscheidung nach der Schwelle aus Abschnitt 4

Die Regel lautet: Wechsel/Fallback nur, wenn ein freier Provider **median < 150 ms** antwortet **und** bei **5 req/s stabil ohne 429** bleibt.

- **Nominatim:** 19 ms warm / 227 ms kalt → Schwelle knapp verfehlt (kalt) **und** Policy verbietet Autocomplete. **Nicht verwendbar.**
- **Photon:** 34 ms warm / 109 ms kalt → Schwelle erfüllt, **aber** bei 5 req/s 503 und anschließender IP-Block. **Nicht verwendbar.**
- **Geoapify:** 860 ms Median → Schwelle verfehlt, **aber** der einzige Provider ohne Sperre/Policy-Verstoß. **Bleibt.**

Damit ist die Backlog-Aussage „freie Alternativen subjektiv zu träge“ **teilweise falsch**: Photon ist objektiv schneller als Geoapify. Es scheitert nicht an der Latenz, sondern an der öffentlichen Verfügbarkeit. Wer Photon wirklich will, muss ihn selbst betreiben (7,5 GB Dump, ≥64 GB RAM empfohlen) — für eine reine Browser-App ohne Server kein gangbarer Weg.

## 9. Reproduktion

```bash
# Key: /home/moritz/.secrets/geoapify (33 Bytes)
cd /tmp/opencode/geocoding-bench
node bench.mjs        # 4 Provider × 3 Läufe × 10 Queries, 1,1 s Pacing
node retest.mjs       # Geoapify-Wiederholung + korrekte Burst-Tests
node burst2.mjs       # 10 Requests bei 5 req/s
python3 analyze.py    # Tabellen + Scoring
```

**Wichtig für Nachbauer:** Nominatim akzeptiert keinen Platzhalter-UA. Mit `example.invalid` kam HTTP 403 „Access denied“; mit einer echten Kontaktadresse (`moritz@m7c5.de`) HTTP 200. Die Arbeitsanweisung sollte diesen Punkt ergänzen.

## 10. Einschränkungen

- Eine Maschine, ein Netz, ein Zeitfenster (10:04–10:25). Absolute Latenzen sind standort- und tageszeitabhängig; die Rangfolge (Photon ≪ Nominatim ≪ Geoapify) war über alle Serien stabil.
- Node HTTP/1.1 vs. curl HTTP/2 geprüft: kein materieller Unterschied (H1 250–576 ms, H2 250–569 ms). Die Geoapify-Latenz ist server-/lastabhängig, nicht protokollbedingt.
- Nominatim wurde nach dem Burst nicht weiter belastet; Photon ist seit ~10:20 für diese IP gesperrt.
- Geoapify-Free-Tier (3.000/Tag, 5 req/s) von der Pricing-Seite bestätigt, nicht durch einen Quota-Test verifiziert.
