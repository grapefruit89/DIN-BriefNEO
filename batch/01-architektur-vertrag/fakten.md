# Fakten zum Ist-Zustand

**Erzeugt von `tools/batch-facts.mjs --scheibe 01` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --scheibe 01 --check` bricht ab, wenn das Blatt
nicht mehr zum Quelltext passt. Alle Zahlen sind aus den Dateien gezaehlt.

## Umfang

- HTML-Dateien: 1, JS-Dateien: 28, CSS-Dateien: 5
- Zeilen gesamt: HTML 473, JS 11642, CSS 3500
- Tests: 385 (`it(`-Aufrufe in `test/all.js`, statisch gezaehlt)
- Antipattern-Regeln: 51 (Summe aus `tools/antipatterns/*.json`)
- Fitness-Score: bewusst nicht hier — entsteht nur durch `node tools/build_db.js`

## Groesste Dateien (Top 15)

| Datei | Zeilen |
|---|---:|
| `website/addons/testbrief/testbrief.js` | 1534 |
| `website/js/address.js` | 1375 |
| `website/css/sidebar.css` | 1320 |
| `website/js/address-data.js` | 1070 |
| `website/js/persistence.js` | 888 |
| `website/js/document.js` | 823 |
| `website/css/sheet-common.css` | 767 |
| `website/addons/clipboard-parser/clipboard-parser.js` | 628 |
| `website/css/sheet-multipage.css` | 603 |
| `website/js/draft-manager.js` | 489 |
| `website/index.html` | 473 |
| `website/css/base.css` | 456 |
| `website/js/format.js` | 452 |
| `website/js/font-feature.js` | 386 |
| `website/addons/verlauf/verlauf.js` | 361 |

## CSS: Kennzahlen je Datei

| Datei | Zeilen | `!important` | ID-Selektoren | Custom Properties | `@scope` | `@function` |
|---|---:|---:|---:|---:|---:|---:|
| `website/css/base.css` | 456 | 25 | 29 | 83 | 0 | 11 |
| `website/css/sheet-common.css` | 767 | 4 | 131 | 9 | 2 | 1 |
| `website/css/sheet-multipage.css` | 603 | 68 | 63 | 10 | 3 | 0 |
| `website/css/sheet.css` | 354 | 26 | 21 | 0 | 3 | 3 |
| `website/css/sidebar.css` | 1320 | 2 | 98 | 4 | 0 | 0 |

## DOM-Zustands-Schreiber in JS

Grundlage fuer Issue #17/#18. Gezaehlt werden nur Schreibzugriffe auf Attribute,
`dataset` und Custom Properties — objekt-interne Felder (`this.#state.dirty`)
sind per Regex nicht sicher von lokalen Variablen zu trennen und bleiben draussen.

| Zustand | Schreibzugriffe | Dateien |
|---|---:|---|
| `role` | 8 | js/address.js (5), addons/clipboard-parser/clipboard-parser.js (1), js/draft-manager.js (1), js/main.js (1) |
| `aria-selected` | 6 | js/address.js (6) |
| `data-anlagen` | 4 | addons/testbrief/testbrief.js (2), js/boot.js (1), js/draft-model.js (1) |
| `data-fuss` | 4 | addons/geschaeftsangaben/geschaeftsangaben.js (1), addons/testbrief/testbrief.js (1), js/boot.js (1), js/draft-model.js (1) |
| `state` | 4 | js/signature.js (3), js/draft-manager.js (1) |
| `aria-disabled` | 3 | js/address.js (3) |
| `aria-pressed` | 3 | js/document.js (3) |
| `fontState` | 3 | js/font-feature.js (3) |
| `index` | 3 | js/address.js (2), addons/clipboard-parser/clipboard-parser.js (1) |
| `--active-font-family` | 2 | js/font-feature.js (2) |
| `--rand-u` | 2 | js/boot.js (1), js/settings.js (1) |
| `data-plugin-multipage` | 2 | js/boot.js (1), js/settings.js (1) |
| `data-plugin-testbrief` | 2 | js/boot.js (1), js/settings.js (1) |
| `data-theme` | 2 | js/boot.js (1), js/settings.js (1) |
| `delegated` | 2 | js/address.js (2) |
| `seiten` | 2 | js/multipage-controller.js (2) |
| `status` | 2 | js/address.js (2) |
| `type` | 2 | js/core.js (2) |
| `--i` | 1 | js/multipage-controller.js (1) |
| `--sig-rot` | 1 | js/signature.js (1) |
| `--sig-scale` | 1 | js/signature.js (1) |
| `--sig-x` | 1 | js/signature.js (1) |
| `--sig-y` | 1 | js/signature.js (1) |
| `aria-activedescendant` | 1 | js/address.js (1) |
| `aria-busy` | 1 | js/addons.js (1) |
| `aria-expanded` | 1 | js/address.js (1) |
| `aria-label` | 1 | js/settings.js (1) |
| `aria-live` | 1 | js/draft-manager.js (1) |
| `data-active` | 1 | addons/testbrief/testbrief.js (1) |
| `data-autofill-aus` | 1 | addons/testbrief/testbrief.js (1) |
| `data-booting` | 1 | js/boot.js (1) |
| `data-injected` | 1 | js/persistence.js (1) |
| `data-layout` | 1 | js/boot.js (1) |
| `data-marks` | 1 | js/boot.js (1) |
| `data-placeholder` | 1 | js/address.js (1) |
| `data-plugin-geschaeftsangaben` | 1 | js/boot.js (1) |
| `data-systemschriften` | 1 | js/font-feature.js (1) |
| `data-voll` | 1 | js/document.js (1) |
| `hasImage` | 1 | js/signature.js (1) |
| `ortFarbe` | 1 | js/address.js (1) |
| `tabindex` | 1 | addons/clipboard-parser/clipboard-parser.js (1) |
| `title` | 1 | js/settings.js (1) |
| `typ` | 1 | js/address.js (1) |

## Importgraph (wer wird am haeufigsten importiert)

| Modul | Importeure |
|---|---:|
| `core.js` | 10 |
| `field.js` | 9 |
| `persistence.js` | 7 |
| `state.js` | 7 |
| `state-binding.js` | 6 |
| `document.js` | 4 |
| `draft-model.js` | 4 |
| `format.js` | 3 |
| `addons.js` | 2 |
| `address.js` | 2 |
| `binary-storage.js` | 2 |
| `font-feature.js` | 2 |
| `schema.js` | 2 |
| `address-data.js` | 1 |
| `clipboard-parser.js` | 1 |
| `draft-manager.js` | 1 |
| `salutation.js` | 1 |
| `settings.js` | 1 |
| `signature.js` | 1 |

- Kanten gesamt: 67
- Module ohne eingehende Importe (Einstiegspunkte oder tot): `boot-state.js`, `boot.js`, `geschaeftsangaben.js`, `main.js`, `multipage-controller.js`, `testbrief.js`, `verlauf.js`, `webmcp-bridge.js`
