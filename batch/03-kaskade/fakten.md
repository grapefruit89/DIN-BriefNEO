# Fakten zur Kaskade

**Erzeugt von `tools/batch-facts.mjs --scheibe 03` — nicht von Hand bearbeiten.**
Alle Zahlen und Zeilen sind aus den CSS-Dateien gelesen. Gezaehlt werden
**Vorkommen** von `!important`, nicht Zeilen (eine Zeile kann zwei tragen).

Zwei Regeln, die das Blatt anwendet und die man kennen muss:

1. **Kommentare zaehlen nicht.** Der Scanner entfernt `/* … */` vor dem
   Zaehlen. Ohne das zaehlt er die Historie mit — in `sheet-multipage.css`
   standen vier `!important` in einem Kommentar ueber entfernte Regeln
   (Zeilen 558, 559, 561, 562). Gefunden vom externen Review am 2026-11-15.
2. **`@page` ist Druck.** Die Spalte „im Druckkontext" umfasst
   `@media print` **und** `@page`-Bloecke (Randboxen wie `@top-right`).
   Ein Reviewer, der nur `@media print` zaehlt, kommt auf 2 weniger.

## 1. Ladereihenfolge

| Zeile in `index.html` | Datei |
|---:|---|
| 32 | `css/base.css` |
| 33 | `css/sidebar.css` |
| 34 | `css/sheet-common.css` |
| 35 | `css/sheet-multipage.css` |

Quelle der Wahrheit ist die Reihenfolge der `<link>`-Elemente: bei gleicher
Spezifitaet gewinnt die spaetere Datei. `sheet.css` wird **nicht** geladen.

## 2. Kennzahlen je Datei

| Datei | Zeilen | `!important` | davon im Druckkontext | ID-Selektoren | Custom Properties | `@layer` | `@scope` | `@function` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `base.css` | 456 | 25 | 17 | 23 | 83 | 0 | 0 | 9 |
| `sheet-common.css` | 767 | 3 | 0 | 120 | 9 | 0 | 1 | 0 |
| `sheet-multipage.css` | 603 | 61 | 38 | 52 | 10 | 1 | 2 | 0 |
| `sheet.css` (stillgelegt) | 354 | 23 | 21 | 21 | 0 | 0 | 1 | 0 |
| `sidebar.css` | 1320 | 2 | 0 | 91 | 4 | 0 | 0 | 0 |

Im Betrieb (ohne `sheet.css`): **91** `!important`, davon **55**
in `@media print`-Kontexten. `@layer` kommt **1**-mal vor.

## 3. `!important` nach Eigenschaft

| Eigenschaft | Vorkommen |
|---|---:|
| `display` | 15 |
| `height` | 6 |
| `margin` | 6 |
| `container-type` | 5 |
| `#viewport { padding` | 5 |
| `#app-shell { display` | 4 |
| `background` | 4 |
| `padding` | 4 |
| `width` | 4 |
| `justify-content` | 3 |
| `align-items` | 3 |
| `min-height` | 3 |
| `overflow` | 3 |
| `transform` | 3 |
| `transition` | 2 |

## 4. Die `!important`-Regeln in `sheet-multipage.css`

Block = der zuletzt gesehene Selektor (bei `@media`-Kontexten der Selektor
davor). "print" heisst: steht in einem `@media print`-Block
(Zeilen 445, 463, 475, 597).

| Zeile | print | Selektor | Eigenschaft |
|---:|:---:|---|---|
| 60 | — | `#viewport[data-seiten="1"]` | `overflow-y` |
| 61 | — | `#viewport[data-seiten="1"]` | `display` |
| 62 | — | `#viewport[data-seiten="1"]` | `justify-content` |
| 63 | — | `#viewport[data-seiten="1"]` | `align-items` |
| 64 | — | `#viewport[data-seiten="1"]` | `padding` |
| 70 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `overflow-y` |
| 71 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `display` |
| 72 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `padding` |
| 79 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `display` |
| 80 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `justify-content` |
| 81 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `align-items` |
| 82 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `height` |
| 83 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `width` |
| 84 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `container-type` |
| 89 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `display` |
| 90 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `justify-content` |
| 91 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `align-items` |
| 92 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `min-height` |
| 93 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `height` |
| 94 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `width` |
| 95 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `container-type` |
| 118 | — | `body[data-seiten="1"] :scope` | `margin` |
| 272 | — | `#spacer` | `display` |
| 470 | ja | `:root[data-anlagen="true"] #anlagenvermerk` | `@top-left { content` |
| 471 | ja | `:root[data-anlagen="true"] #anlagenvermerk` | `@top-right { content` |
| 478 | ja | `html, body` | `overflow` |
| 479 | ja | `html, body` | `height` |
| 480 | ja | `html, body` | `background` |
| 484 | ja | `#probe` | `display` |
| 490 | ja | `#anschriftfeld::after, #folgekoepfe, .folgekopf-screen` | `display` |
| 500 | ja | `#app-shell #viewport` | `padding` |
| 501 | ja | `#app-shell #viewport` | `background` |
| 502 | ja | `#app-shell #viewport` | `height` |
| 503 | ja | `#app-shell #viewport` | `overflow` |
| 504 | ja | `#app-shell #viewport` | `display` |
| 505 | ja | `#app-shell #viewport` | `container-type` |
| 510 | ja | `body[data-seiten="1"] #brief-ansicht` | `margin` |
| 511 | ja | `body[data-seiten="1"] #brief-ansicht` | `width` |
| 512 | ja | `body[data-seiten="1"] #brief-ansicht` | `display` |
| 513 | ja | `body[data-seiten="1"] #brief-ansicht` | `container-type` |
| 521 | ja | `din-blatt` | `transform` |
| 524 | ja | `din-blatt` | `margin` |
| 525 | ja | `din-blatt` | `min-width` |
| 526 | ja | `din-blatt` | `height` |
| 529 | ja | `din-blatt` | `min-height` |
| 530 | ja | `din-blatt` | `container-type` |
| 534 | ja | `#kern` | `min-height` |
| 535 | ja | `#kern` | `padding` |
| 542 | ja | `#kern` | `box-decoration-break` |
| 543 | ja | `#kern` | `column-count` |
| 544 | ja | `#kern` | `column-height` |
| 545 | ja | `#kern` | `column-wrap` |
| 546 | ja | `#kern` | `row-gap` |
| 547 | ja | `#kern` | `background` |
| 548 | ja | `#kern` | `filter` |
| 568 | ja | `#text p` | `margin` |
| 572 | ja | `#text p:last-child` | `margin-bottom` |
| 583 | ja | `#unterschriftsbild-container` | `break-inside` |
| 584 | ja | `#unterschriftsbild-container` | `page-break-inside` |
| 589 | ja | `:root:not([data-anlagen="true"]) #anlagenvermerk` | `display` |
| 600 | ja | `body[data-seiten="1"] :scope` | `margin` |

## 5. Grenzen dieses Blatts

- Der Scanner erkennt Bloecke, deren `{` am Zeilenende steht, und den
  `@media print`-Kontext. Einzeilige Regeln und verschachtelte Selektoren in
  einer Zeile werden nicht aufgeloest.
- **Keine Spezifitaetsberechnung.** Welche `!important`-Regel eine andere
  schlaegt, steht hier nicht — dafuer braucht es Selektorvergleich, nicht Regex.
  Das ist eine Aufgabe des Reviews, nicht des Blatts.
- **Kein Selektorvergleich zwischen Dateien.** Ob zwei Regeln wirklich
  gegeneinander laufen, entscheidet erst der Druck. Das Blatt liefert die
  Kandidaten, nicht das Urteil.
