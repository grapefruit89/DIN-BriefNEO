# Fakten zum Ist-Zustand (maschinell erzeugt, 2026-11-14)

Alle Zahlen sind gemessen, nicht geschaetzt. Pfade relativ zu `/home/moritz/repos/DIN-BriefNEO/`.

## Umfang

- HTML-Dateien: 1, JS-Module: 20, CSS-Dateien: 5
- Zeilen gesamt: HTML 457, JS 10032, CSS 3259
- Tests: 332 · Antipattern-Regeln: 50 · Fitness-Gate: 100,0 %

## Groesste Dateien (Top 15)

| Datei | Zeilen |
|---|---:|
| `website/addons/testbrief/testbrief.js` | 1513 |
| `website/js/address.js` | 1315 |
| `website/css/sidebar.css` | 1242 |
| `website/js/address-data.js` | 1067 |
| `website/js/document.js` | 933 |
| `website/js/persistence.js` | 877 |
| `website/css/sheet-common.css` | 714 |
| `website/css/sheet-multipage.css` | 642 |
| `website/js/clipboard-parser.js` | 616 |
| `website/js/draft-manager.js` | 567 |
| `website/index.html` | 457 |
| `website/js/format.js` | 451 |
| `website/js/main.js` | 373 |
| `website/css/base.css` | 363 |
| `website/js/salutation.js` | 341 |

## CSS: Kennzahlen je Datei

| Datei | Zeilen | `!important` | Selektoren mit ID | Custom Properties | `@scope` | `@function` |
|---|---:|---:|---:|---:|---:|---:|
| `website/css/sidebar.css` | 1242 | 3 | 118 | 3 | 0 | 0 |
| `website/css/sheet-common.css` | 714 | 3 | 134 | 16 | 2 | 0 |
| `website/css/sheet-multipage.css` | 642 | 100 | 68 | 9 | 2 | 6 |
| `website/css/base.css` | 363 | 24 | 4 | 67 | 0 | 7 |
| `website/css/sheet.css` | 298 | 23 | 22 | 0 | 1 | 0 |

## Zustands-Schreiber in JS (Grundlage fuer Issue #17/#18)

| Zustand | Schreibzugriffe | Dateien |
|---|---:|---|
| `dirty` | 7 | document.js (1), draft-manager.js (1), format.js (1), salutation.js (4) |
| `state` | 4 | draft-manager.js (1), signature.js (3) |
| `data-anlagen` | 4 | boot.js (1), draft-manager.js (2), main.js (1) |
| `data-fuss` | 4 | boot.js (1), draft-manager.js (2), main.js (1) |
| `data-visible` | 4 | boot-state.js (1), draft-manager.js (1), main.js (1), testbrief.js (1) |
| `fontState` | 3 | font-feature.js (3) |
| `data-theme` | 3 | boot.js (1), settings.js (2) |
| `index` | 3 | address.js (2), clipboard-parser.js (1) |
| `quelle` | 3 | address.js (2), draft-manager.js (1) |
| `data-autofilled` | 3 | address.js (3) |
| `type` | 2 | core.js (2) |
| `schrift-eigene-aktiv` | 2 | font-feature.js (2) |
| `--active-font-family` | 2 | font-feature.js (2) |
| `ready` | 2 | boot.js (1), main.js (1) |
| `data-plugin-testbrief` | 2 | boot.js (1), settings.js (1) |
| `data-plugin-multipage` | 2 | boot.js (1), settings.js (1) |
| `--rand-u` | 2 | boot.js (1), settings.js (1) |
| `delegated` | 2 | address.js (2) |
| `wired` | 2 | address.js (2) |
| `status` | 2 | address.js (2) |
| `seiten` | 2 | multipage-controller.js (2) |
| `data-gesetzt` | 2 | boot-state.js (1), main.js (1) |
| `flash-success` | 2 | webmcp-bridge.js (2) |
| `--sig-x` | 1 | signature.js (1) |
| `--sig-y` | 1 | signature.js (1) |
| `--sig-scale` | 1 | signature.js (1) |
| `--sig-rot` | 1 | signature.js (1) |
| `data-layout` | 1 | boot.js (1) |
| `data-marks` | 1 | boot.js (1) |
| `layout` | 1 | settings.js (1) |
| `marks` | 1 | settings.js (1) |
| `ortFarbe` | 1 | address.js (1) |
| `typ` | 1 | address.js (1) |
| `data-placeholder` | 1 | address.js (1) |
| `--i` | 1 | multipage-controller.js (1) |
| `data-voll` | 1 | document.js (1) |
| `data-ueberlauf` | 1 | document.js (1) |
| `data-ueberlauf-zeilen` | 1 | document.js (1) |
| `feldtyp` | 1 | draft-manager.js (1) |
| `data-injected` | 1 | persistence.js (1) |
| `data-seeded` | 1 | boot-state.js (1) |
| `data-autofill-aus` | 1 | testbrief.js (1) |
| `data-active` | 1 | testbrief.js (1) |

## Importgraph (wer wird am haeufigsten importiert)

| Modul | Importeure |
|---|---:|
| `core.js` | 9 |
| `field.js` | 9 |
| `persistence.js` | 6 |
| `document.js` | 3 |
| `address.js` | 3 |
| `format.js` | 3 |
| `binary-storage.js` | 2 |
| `font-feature.js` | 2 |
| `address-data.js` | 2 |
| `clipboard-parser.js` | 2 |
| `draft-manager.js` | 1 |
| `salutation.js` | 1 |

- Kanten gesamt: 45
- Module ohne eingehende Importe (Einstiegspunkte oder tot): `boot.js`, `multipage-controller.js`, `main.js`, `boot-state.js`, `webmcp-bridge.js`, `testbrief.js`

