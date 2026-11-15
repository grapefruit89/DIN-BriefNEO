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
| `base.css` | 402 | 25 | 17 | 22 | 67 | 0 | 0 | 6 |
| `sheet-common.css` | 728 | 1 | 0 | 123 | 10 | 0 | 1 | 0 |
| `sheet-multipage.css` | 613 | 61 | 38 | 56 | 9 | 1 | 2 | 6 |
| `sheet.css` (stillgelegt) | 354 | 23 | 21 | 22 | 0 | 0 | 1 | 0 |
| `sidebar.css` | 1272 | 3 | 0 | 94 | 3 | 0 | 0 | 0 |

Im Betrieb (ohne `sheet.css`): **90** `!important`, davon **55**
in `@media print`-Kontexten. `@layer` kommt **1**-mal vor.

## 3. `!important` nach Eigenschaft

| Eigenschaft | Vorkommen |
|---|---:|
| `display` | 14 |
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
(Zeilen 455, 473, 485, 607).

| Zeile | print | Selektor | Eigenschaft |
|---:|:---:|---|---|
| 72 | — | `#viewport[data-seiten="1"]` | `overflow-y` |
| 73 | — | `#viewport[data-seiten="1"]` | `display` |
| 74 | — | `#viewport[data-seiten="1"]` | `justify-content` |
| 75 | — | `#viewport[data-seiten="1"]` | `align-items` |
| 76 | — | `#viewport[data-seiten="1"]` | `padding` |
| 82 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `overflow-y` |
| 83 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `display` |
| 84 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `padding` |
| 91 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `display` |
| 92 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `justify-content` |
| 93 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `align-items` |
| 94 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `height` |
| 95 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `width` |
| 96 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `container-type` |
| 101 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `display` |
| 102 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `justify-content` |
| 103 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `align-items` |
| 104 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `min-height` |
| 105 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `height` |
| 106 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `width` |
| 107 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `container-type` |
| 130 | — | `body[data-seiten="1"] :scope` | `margin` |
| 284 | — | `#spacer` | `display` |
| 480 | ja | `:root:has(#toggle-anlagen:checked) #anlagenvermerk` | `@top-left { content` |
| 481 | ja | `:root:has(#toggle-anlagen:checked) #anlagenvermerk` | `@top-right { content` |
| 488 | ja | `html, body` | `overflow` |
| 489 | ja | `html, body` | `height` |
| 490 | ja | `html, body` | `background` |
| 494 | ja | `#probe` | `display` |
| 500 | ja | `#anschriftfeld::after, #folgekoepfe, .folgekopf-screen` | `display` |
| 510 | ja | `#app-shell #viewport` | `padding` |
| 511 | ja | `#app-shell #viewport` | `background` |
| 512 | ja | `#app-shell #viewport` | `height` |
| 513 | ja | `#app-shell #viewport` | `overflow` |
| 514 | ja | `#app-shell #viewport` | `display` |
| 515 | ja | `#app-shell #viewport` | `container-type` |
| 520 | ja | `body[data-seiten="1"] #brief-ansicht` | `margin` |
| 521 | ja | `body[data-seiten="1"] #brief-ansicht` | `width` |
| 522 | ja | `body[data-seiten="1"] #brief-ansicht` | `display` |
| 523 | ja | `body[data-seiten="1"] #brief-ansicht` | `container-type` |
| 531 | ja | `din-blatt` | `transform` |
| 534 | ja | `din-blatt` | `margin` |
| 535 | ja | `din-blatt` | `min-width` |
| 536 | ja | `din-blatt` | `height` |
| 539 | ja | `din-blatt` | `min-height` |
| 540 | ja | `din-blatt` | `container-type` |
| 544 | ja | `#kern` | `min-height` |
| 545 | ja | `#kern` | `padding` |
| 552 | ja | `#kern` | `box-decoration-break` |
| 553 | ja | `#kern` | `column-count` |
| 554 | ja | `#kern` | `column-height` |
| 555 | ja | `#kern` | `column-wrap` |
| 556 | ja | `#kern` | `row-gap` |
| 557 | ja | `#kern` | `background` |
| 558 | ja | `#kern` | `filter` |
| 578 | ja | `#text p` | `margin` |
| 582 | ja | `#text p:last-child` | `margin-bottom` |
| 593 | ja | `#unterschriftsbild-container` | `break-inside` |
| 594 | ja | `#unterschriftsbild-container` | `page-break-inside` |
| 599 | ja | `:root:not(:has(#toggle-anlagen:checked)) #anlagenvermerk` | `display` |
| 610 | ja | `body[data-seiten="1"] :scope` | `margin` |

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
