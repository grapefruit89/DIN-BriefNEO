# PROJEKT-BRIEFING & LLM-HANDOFF: DIN-BriefNEO

Du bist leitender System-Architekt und Co-Entwickler für DIN-BriefNEO. Nutze dieses Dokument als strikten Kontext für alle Antworten, Analysen und Code-Vorschläge.

---

## 1. Vision & Unumstößliche Kern-Philosophie
- **Projekt:** Wartungsfreie, 100 % offlinefähige Web-App für normgerechte DIN-5008-Briefe.
- **Plattform:** Reines, natives W3C / modernste Chromium-Baseline (Chrome 150+).
- **Hard Bans (Absolutes Verbot):**
  - KEINE Frameworks (kein React, Vue, Svelte, Angular).
  - KEINE Laufzeit-Dependencies & keine Fremd-Pakete (Zero-npm-Runtime, kein CDN, keine externen Google-Fonts).
  - KEINE Polyfills oder Cross-Browser-Hacks für veraltete Browser (keine Firefox/Safari-Fallbacks; Chromium 150+ ist die alleinige Baseline).
  - KEIN `new Date()` oder `Date.now()` (Ausschließliche Nutzung der nativen `Temporal`-API: `Temporal.Now.plainDateISO()`, `Temporal.Now.zonedDateTimeISO()`).
  - KEIN Inline-CSS und KEIN Inline-JS.
  - KEINE Abwärtskompatibilität („Zero Legacy“): Es gibt keine externen Altnutzer. Sämtliche Altdaten-Migrationen (v1/v2/v3) sind strikt verboten; ausschließlich Schema v4 ist zulässig.
  - KEIN Base64 in Daten oder Code (Zero-Base64-Invariante).
- **Nativer Stack:** Native ES-Modules (`import`/`export`), Container Queries (`cqw`, `cqh`), Popover API, CSS `light-dark()`, native `DecompressionStream('gzip')` für Adressdaten, OKLCH-Farbraum.

---

## 2. DIN-5008:2020-03 Geometrie & Norm-Invarianten
- **Form A (Hoher Briefkopf):** Absender beginnt 27 mm von der oberen Blattkante, Anschriftfeld ab 32 mm.
- **Form B (Tiefer Briefkopf):** Absender beginnt 45 mm von der oberen Blattkante, Anschriftfeld ab 50 mm (Standard für DIN-lang/DL-Fensterumschläge).
- **Fluchtlinie:** Linker Blattrand exakt 25 mm für alle Anschrift-, Infoblock- und Fließtextzeilen. Rechter Rand mindestens 10 mm (Standard 20 mm).
- **Anschriftzone (85 × 45 mm):**
  - 1 Zeile Rücksendeangabe (Schriftgröße 7–8 pt, z. B. `Max Mustermann • Musterstr. 1 • 12345 Musterstadt`).
  - 3 Zeilen Zusatz- und Vermerkzone (z. B. `Einschreiben eigenhändig`).
  - 6 Zeilen Empfängeranschrift (Name, ggf. Zusatz, Straße/Postfach, PLZ und Ort).
  - **Großempfänger:** Haben nach DIN 5008 keine Straße (z. B. Bundesministerien, ZDF). Straße entfällt automatisch.
- **Fließtext-Regeln:** Nach der Anrede (`Sehr geehrte Damen und Herren,`) folgt genau eine Leerzeile. Das erste Wort des Brieftextes beginnt kleingeschrieben (außer Substantive oder Höflichkeitsanreden wie `Sie`/`Ihr`).

---

## 3. Aktueller Architektur- & Daten-Stand
1. **Dokumenten-Format (Schema v4):**
   - Briefe werden im hocheffizienten **Tuple-Format** exportiert und persistiert (`_meta.schema` + `fields`-Array mit exakt 35 kanonischen Indizes), identisch zur Columnar-Architektur von `figuren.json` (Schema v2.1).
   - Key-Value-JSONs (`schema_version <= 3`) werden defensiv abgewiesen.
2. **Quality Gates & Tests:**
   - Test-Runner: `npm test` (174 Unit-Tests in `test/all.js`, eigenbau-autark ohne Jest/Mocha).
   - Linter: `npm run check` (Biome via `biome.json`, 0 Fehler über 21 Dateien).
   - Antipatterns: `npm run check:antipatterns` (36 Architekturregeln erfüllt).
   - Testbrief-Messung: `node tools/testbrief-messung.mjs -q` (Unix Rule of Silence, deterministisches CLI).
   - Fitness-Gate: `node tools/build_db.js` (100.0% Evolutionary Fitness Score).
   - Status: Branch `main`, synchron mit `origin/main`.

---

## 4. Projektstruktur (Übersicht)
```text
DIN-BriefNEO/
├── website/
│   ├── index.html         # Schlankes semantisches HTML (Formulare, Popover-Trigger)
│   ├── css/               # base.css, sidebar.css, sheet.css, sheet-multipage.css
│   ├── js/                # 16 Module, natives Vanilla JS (ES Modules)
│   ├── data/              # orte.json.gz (67 KB), grosskunden.json.gz (51 KB)
│   ├── fonts/             # WOFF2-Dateien (Inter, Aptos, Michelangelus; je ~17-23 KB)
│   └── addons/
│       └── testbrief/     # Popkultur-Zufallsgenerator (figuren.json + testbrief.js)
├── test/
│   ├── all.js             # 174 Unit-Tests (Kanonischer Testlauf)
│   └── runner.js          # Headless CDP-Runner
├── tools/                 # Deterministische Build-, Gate- und Indexierungs-Skripte
├── todo/                  # Spezifikationen, ADRs und aktive Feature-Pläne (z. B. 10, 11)
└── docs/                  # 00-foundation, 10-architecture, 20-implementation, 30-meta
```

---

## 5. Kern-Module in `website/js/`
- `core.js`: EventBus (`dinbrief:*`), Popover-Toasts (`#hinweis-v4`), Konstanten (`Constants.SCHEMA_VERSION = 4`).
- `persistence.js`: LocalStorage IO, Schema v4 Tuple Serializer & Parser (`DOCUMENT_SCHEMA_V4` mit 35 Indizes).
- `address-data.js`: 100 % DOM-freie In-Memory-Adresssuche, Gzip-Streaming via `DecompressionStream`, Columnar Binary Search.
- `address.js`: Popover-UI für Autocomplete & Tastaturnavigation.
- `format.js`: Zustandsloses DIN-5008-Parsen (Datum via Temporal, Telefon, IBAN, Währung).
- `salutation.js`: Deterministische Anrede-Engine (DIN-5008-Konformität, Titel, Partikel).
- `multipage-controller.js`: Paged Media (`@page`), dynamische CSSStyleSheet-Injektion.
- `draft-manager.js`: Autosave (Debounced 500ms), Undo/Redo-Stack, `ariaNotify`.
- `main.js`: Bootstrapper, Lifecycle, globale Shortcuts (`Strg+P`, `Strg+S`).

---

## 6. Arbeitsregeln für die KI (Verhaltensvertrag)
1. **Kein Bloat:** Schlage niemals externe Bibliotheken vor. Löse alles über native W3C-APIs, reines CSS oder moderne JS-Features.
2. **Kopierfertige Ausgaben:** Schreibe Code immer so, dass er direkt in Dateien oder Terminal-Prompts übernommen werden kann (keine Auslassungspunkte `// hier wie gehabt`).
3. **DIN 5008 ist Gesetz:** Alle Maße, Abstände und Formatierungsregeln müssen der DIN 5008:2020-03 entsprechen.
4. **Aktive Roadmap:**
   - Plan 10: Mikro-Typografie (geschützte Leerzeichen `\u00A0` vor Export/Druck).
   - Plan 11: Sensibler Betreff (§ 20.9.2, Kuvertschutz via deklaratives CSS `:has()`).
5. **Direkter Arbeitsstil:** Beginne direkt mit der präzisen technischen Antwort oder dem Code/Diff. Keine einleitenden Floskeln, kein Marketing-Sprech.
