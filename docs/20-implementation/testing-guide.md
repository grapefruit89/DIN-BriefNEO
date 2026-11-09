---
id: testing-guide
title: 'Test-Architektur & Qualitätssicherung'
type: guide
status: active
created: '2026-06-26'
updated: '2026-11-09'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/guide
doc_links:
  - Salutation-Engine
  - glossary
  - spec
code_links:
  - test/all.js
  - tools/test-runner.mjs
  - test/corpus/run.js
  - test/corpus/address-cases.json
error_patterns:
  - testing
  - testfaelle
  - qa protokoll
  - testrunner
  - regression
supersedes: []
depends_on: []
---

# Test-Architektur & Qualitätssicherung: testing-guide.md

DIN-BriefNEO setzt auf ein kompromissloses, zweistufiges Testkonzept: Eine headless Chromium-gestützte Unit-Testsuite für DOM-, State- und Storage-Interaktionen sowie ein isolierter Node.js-Regressionstest für Adress-, Straßen- und Anrede-Parser.

---

## 🏛️ Die zwei Säulen der Test-Architektur

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Säule 1: Unit-Testsuite                            │
│  test/all.js (183 Tests) in test/index.html                            │
│  ➔ Headless Chromium 150+ via tools/test-runner.mjs (CDP Protocol)      │
│  ➔ Befehl: npm test                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                      Säule 2: Adress- & Anrede-Korpus                   │
│  test/corpus/address-cases.json + run.js                                │
│  ➔ Schneller Regressionslauf für Namens-, Straßen- & Impressumserkennung │
│  ➔ Befehl: node test/corpus/run.js                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Säule 1: Headless Unit-Testsuite (`test/all.js`)

Die Unit-Testsuite validiert alle Module unter realen Browserbedingungen gegen die DOM- und Web-Plattform-APIs von Chromium 150+.

### Testumfang & Kategorien
- **DraftManager & Speicherschutz (B53, B54):** Autosave-Debounce, EventBus-Synchronisation, QuotaExceededError-Schutz und `ariaNotify`-Fallback.
- **Import & Export (B55):** Schema v4 Validierung, atomare Speicherabsicherung vor `location.reload()`.
- **SalutationEngine:** 80/20 B2B-Anrede-Erkennung, Adelstitel, akademische Grade, Doppelnamen und Stil-Umschaltung (`formal`, `polite`, `casual`).
- **Mikro-Typografie (DIN 5008):** Geschützte Leerzeichen bei Abkürzungen (`z. B.`), Geldbeträgen, Paragrafen und Einheiten.
- **Font- & Signatur-Manager:** IndexedDB-Blob-Persistenz, Drag-and-Drop, Skalierungs- und Rotations-Matrizen.

### Ausführung & CLI-Flags

```bash
# Vollständige Suite headless ausführen
npm test

# Gezielte Testgruppen filtern (Regex)
node tools/test-runner.mjs --filter="Salutation"
node tools/test-runner.mjs --filter="B54|B55"

# CI-Modus (überspringen, falls kein Browser installiert ist)
node tools/test-runner.mjs --allow-missing-browser

# Maschinenlesbare JSON-Ausgabe
node tools/test-runner.mjs --json
```

---

## 2. Säule 2: Adress- & Korpus-Regression (`test/corpus/`)

Das Adress-Korpus prüft den heuristischen `ClipboardAddressParser` und die Namenszerlegung gegen reale Adress- und Impressumstexte.

### Struktur des Testkorpus
- **Testdefinition:** `test/corpus/address-cases.json` enthält reale Datensätze mit erwarteten Feldern (`name`, `strasse`, `plz`, `ort`, `anrede`).
- **Testkategorien:**
  - `street`: Straßen- und Hausnummernerkennung (inkl. Bindestriche, Zusätze wie „UG“, „Hinterhaus“).
  - `floor`: Stockwerks- und Gebäudeteilangaben.
  - `metadata`: Zuverlässiges Ignorieren von Telefon-, Fax-, Mail- und Registerzeilen.
  - `negative`: Schutz vor Fehlinterpretationen von reinen Firmen- oder Vereinsnamen.
  - `postfach`: Postfach-Adressen nach DIN 5008.
  - `unfolding`: Entfaltung kommagetrennter, einzeiliger Adressen.
  - `salutation`: Korrekte Anrederive nach Namensparsing.

### Ausführung

```bash
# Adress-Korpus ausführen
node test/corpus/run.js
```

---

## 3. Manuelle Validierungs-Checkliste (Smoke Tests)

Für visuelle Endkontrollen vor Releases:

1. **DIN-5008 Layout & Faltmarken:**
   - Briefbogen auf DIN-A4-Darstellung prüfen (210 × 297 mm).
   - Prüfen, ob Faltmarke 1 (105 mm) und Faltmarke 2 (210 mm) sowie Lochmarke (148,5 mm) exakt sitzen.
2. **Druckvorschau (`Ctrl + P` / `Cmd + P`):**
   - Header, Footer, Seitenleiste und UI-Buttons müssen via `@media print` ausgeblendet sein.
   - Kein zweiter, leerer Seitenüberlauf bei Standardbriefen (Zero-Scroll-Garantie).
3. **Responsive Seitenleiste:**
   - Schalter „Einstellungen“ toggelt Sidebar via `:has()` sauber ohne Layout-Sprünge.
