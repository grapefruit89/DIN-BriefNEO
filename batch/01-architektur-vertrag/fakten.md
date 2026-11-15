# Fakten zum Ist-Zustand

**Erzeugt von `tools/batch-facts.mjs --scheibe 01` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --scheibe 01 --check` bricht ab, wenn das Blatt
nicht mehr zum Quelltext passt. Alle Zahlen sind aus den Dateien gezaehlt.

## Umfang

- HTML-Dateien: 1, JS-Dateien: 21, CSS-Dateien: 5
- Zeilen gesamt: HTML 466, JS 10389, CSS 3306
- Tests: 342 (`it(`-Aufrufe in `test/all.js`, statisch gezaehlt)
- Antipattern-Regeln: 51 (Summe aus `tools/antipatterns/*.json`)
- Fitness-Score: bewusst nicht hier — entsteht nur durch `node tools/build_db.js`

## Groesste Dateien (Top 15)

| Datei | Zeilen |
|---|---:|
| `website/addons/testbrief/testbrief.js` | 1510 |
| `website/js/address.js` | 1314 |
| `website/css/sidebar.css` | 1270 |
| `website/js/address-data.js` | 1066 |
| `website/js/document.js` | 932 |
| `website/js/persistence.js` | 895 |
| `website/css/sheet-common.css` | 723 |
| `website/js/clipboard-parser.js` | 615 |
| `website/css/sheet-multipage.css` | 600 |
| `website/js/draft-manager.js` | 550 |
| `website/index.html` | 466 |
| `website/js/format.js` | 450 |
| `website/addons/verlauf/verlauf.js` | 361 |
| `website/css/base.css` | 359 |
| `website/css/sheet.css` | 354 |

## CSS: Kennzahlen je Datei

| Datei | Zeilen | `!important` | ID-Selektoren | Custom Properties | `@scope` | `@function` |
|---|---:|---:|---:|---:|---:|---:|
| `website/css/base.css` | 359 | 24 | 4 | 67 | 0 | 7 |
| `website/css/sheet-common.css` | 723 | 2 | 138 | 10 | 2 | 0 |
| `website/css/sheet-multipage.css` | 600 | 69 | 67 | 9 | 2 | 6 |
| `website/css/sheet.css` | 354 | 26 | 22 | 0 | 3 | 3 |
| `website/css/sidebar.css` | 1270 | 3 | 120 | 3 | 0 | 0 |

## DOM-Zustands-Schreiber in JS

Grundlage fuer Issue #17/#18. Gezaehlt werden nur Schreibzugriffe auf Attribute,
`dataset` und Custom Properties — objekt-interne Felder (`this.#state.dirty`)
sind per Regex nicht sicher von lokalen Variablen zu trennen und bleiben draussen.

| Zustand | Schreibzugriffe | Dateien |
|---|---:|---|
| `role` | 8 | js/address.js (5), js/clipboard-parser.js (1), js/draft-manager.js (1), js/main.js (1) |
| `dirty` | 7 | js/salutation.js (4), js/document.js (1), js/draft-manager.js (1), js/format.js (1) |
| `aria-selected` | 6 | js/address.js (6) |
| `state` | 4 | js/signature.js (3), js/draft-manager.js (1) |
| `aria-disabled` | 3 | js/address.js (3) |
| `aria-pressed` | 3 | js/document.js (3) |
| `data-autofilled` | 3 | js/address.js (3) |
| `fontState` | 3 | js/font-feature.js (3) |
| `index` | 3 | js/address.js (2), js/clipboard-parser.js (1) |
| `quelle` | 3 | js/address.js (2), js/draft-manager.js (1) |
| `--active-font-family` | 2 | js/font-feature.js (2) |
| `--rand-u` | 2 | js/boot.js (1), js/settings.js (1) |
| `data-plugin-multipage` | 2 | js/boot.js (1), js/settings.js (1) |
| `data-plugin-testbrief` | 2 | js/boot.js (1), js/settings.js (1) |
| `data-theme` | 2 | js/boot.js (1), js/settings.js (1) |
| `delegated` | 2 | js/address.js (2) |
| `ready` | 2 | js/boot.js (1), js/main.js (1) |
| `seiten` | 2 | js/multipage-controller.js (2) |
| `status` | 2 | js/address.js (2) |
| `type` | 2 | js/core.js (2) |
| `wired` | 2 | js/address.js (2) |
| `--i` | 1 | js/multipage-controller.js (1) |
| `--sig-rot` | 1 | js/signature.js (1) |
| `--sig-scale` | 1 | js/signature.js (1) |
| `--sig-x` | 1 | js/signature.js (1) |
| `--sig-y` | 1 | js/signature.js (1) |
| `aria-activedescendant` | 1 | js/address.js (1) |
| `aria-expanded` | 1 | js/address.js (1) |
| `aria-label` | 1 | js/settings.js (1) |
| `aria-live` | 1 | js/draft-manager.js (1) |
| `data-active` | 1 | addons/testbrief/testbrief.js (1) |
| `data-autofill-aus` | 1 | addons/testbrief/testbrief.js (1) |
| `data-injected` | 1 | js/persistence.js (1) |
| `data-layout` | 1 | js/boot.js (1) |
| `data-marks` | 1 | js/boot.js (1) |
| `data-placeholder` | 1 | js/address.js (1) |
| `data-seeded` | 1 | js/boot-state.js (1) |
| `data-ueberlauf` | 1 | js/document.js (1) |
| `data-ueberlauf-zeilen` | 1 | js/document.js (1) |
| `data-voll` | 1 | js/document.js (1) |
| `feldtyp` | 1 | js/draft-manager.js (1) |
| `ortFarbe` | 1 | js/address.js (1) |
| `tabindex` | 1 | js/clipboard-parser.js (1) |
| `title` | 1 | js/settings.js (1) |
| `typ` | 1 | js/address.js (1) |

## Importgraph (wer wird am haeufigsten importiert)

| Modul | Importeure |
|---|---:|
| `core.js` | 10 |
| `field.js` | 9 |
| `persistence.js` | 6 |
| `address.js` | 3 |
| `document.js` | 3 |
| `format.js` | 3 |
| `address-data.js` | 2 |
| `binary-storage.js` | 2 |
| `clipboard-parser.js` | 2 |
| `font-feature.js` | 2 |
| `draft-manager.js` | 1 |
| `salutation.js` | 1 |
| `settings.js` | 1 |
| `signature.js` | 1 |

- Kanten gesamt: 46
- Module ohne eingehende Importe (Einstiegspunkte oder tot): `boot-state.js`, `boot.js`, `main.js`, `multipage-controller.js`, `testbrief.js`, `verlauf.js`, `webmcp-bridge.js`
