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
| `base.css` | 359 | 24 | 17 | 4 | 67 | 0 | 0 | 6 |
| `sheet-common.css` | 723 | 1 | 0 | 123 | 10 | 0 | 1 | 0 |
| `sheet-multipage.css` | 605 | 63 | 38 | 56 | 9 | 0 | 2 | 6 |
| `sheet.css` (stillgelegt) | 354 | 23 | 21 | 22 | 0 | 0 | 1 | 0 |
| `sidebar.css` | 1270 | 3 | 0 | 111 | 3 | 0 | 0 | 0 |

Im Betrieb (ohne `sheet.css`): **91** `!important`, davon **55**
in `@media print`-Kontexten. `@layer` kommt **0**-mal vor.

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
| `min-height` | 4 |
| `padding` | 4 |
| `width` | 4 |
| `justify-content` | 3 |
| `align-items` | 3 |
| `overflow` | 3 |
| `transform` | 3 |
| `transition` | 2 |

## 4. Die `!important`-Regeln in `sheet-multipage.css`

Block = der zuletzt gesehene Selektor (bei `@media`-Kontexten der Selektor
davor). "print" heisst: steht in einem `@media print`-Block
(Zeilen 447, 466, 478, 599).

| Zeile | print | Selektor | Eigenschaft |
|---:|:---:|---|---|
| 53 | — | `#viewport` | `overflow-x` |
| 56 | — | `#viewport` | `min-height` |
| 64 | — | `#viewport[data-seiten="1"]` | `overflow-y` |
| 65 | — | `#viewport[data-seiten="1"]` | `display` |
| 66 | — | `#viewport[data-seiten="1"]` | `justify-content` |
| 67 | — | `#viewport[data-seiten="1"]` | `align-items` |
| 68 | — | `#viewport[data-seiten="1"]` | `padding` |
| 74 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `overflow-y` |
| 75 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `display` |
| 76 | — | `#viewport[data-seiten]:not([data-seiten="1"])` | `padding` |
| 83 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `display` |
| 84 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `justify-content` |
| 85 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `align-items` |
| 86 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `height` |
| 87 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `width` |
| 88 | — | `#viewport[data-seiten="1"] #brief-ansicht` | `container-type` |
| 93 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `display` |
| 94 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `justify-content` |
| 95 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `align-items` |
| 96 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `min-height` |
| 97 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `height` |
| 98 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `width` |
| 99 | — | `#viewport[data-seiten]:not([data-seiten="1"]) #brief-ansicht` | `container-type` |
| 122 | — | `body[data-seiten="1"] :scope` | `margin` |
| 276 | — | `#spacer` | `display` |
| 473 | ja | `:root:has(#toggle-anlagen:checked) #anlagenvermerk` | `@top-left { content` |
| 474 | ja | `:root:has(#toggle-anlagen:checked) #anlagenvermerk` | `@top-right { content` |
| 481 | ja | `html, body` | `overflow` |
| 482 | ja | `html, body` | `height` |
| 483 | ja | `html, body` | `background` |
| 487 | ja | `#probe` | `display` |
| 493 | ja | `#anschriftfeld::after, #folgekoepfe, .folgekopf-screen` | `display` |
| 503 | ja | `#app-shell #viewport` | `padding` |
| 504 | ja | `#app-shell #viewport` | `background` |
| 505 | ja | `#app-shell #viewport` | `height` |
| 506 | ja | `#app-shell #viewport` | `overflow` |
| 507 | ja | `#app-shell #viewport` | `display` |
| 508 | ja | `#app-shell #viewport` | `container-type` |
| 513 | ja | `body[data-seiten="1"] #brief-ansicht` | `margin` |
| 514 | ja | `body[data-seiten="1"] #brief-ansicht` | `width` |
| 515 | ja | `body[data-seiten="1"] #brief-ansicht` | `display` |
| 516 | ja | `body[data-seiten="1"] #brief-ansicht` | `container-type` |
| 524 | ja | `din-blatt` | `transform` |
| 527 | ja | `din-blatt` | `margin` |
| 528 | ja | `din-blatt` | `min-width` |
| 529 | ja | `din-blatt` | `height` |
| 532 | ja | `din-blatt` | `min-height` |
| 533 | ja | `din-blatt` | `container-type` |
| 537 | ja | `#kern` | `min-height` |
| 538 | ja | `#kern` | `padding` |
| 545 | ja | `#kern` | `box-decoration-break` |
| 546 | ja | `#kern` | `column-count` |
| 547 | ja | `#kern` | `column-height` |
| 548 | ja | `#kern` | `column-wrap` |
| 549 | ja | `#kern` | `row-gap` |
| 550 | ja | `#kern` | `background` |
| 551 | ja | `#kern` | `filter` |
| 570 | ja | `#text p` | `margin` |
| 574 | ja | `#text p:last-child` | `margin-bottom` |
| 585 | ja | `#unterschriftsbild-container` | `break-inside` |
| 586 | ja | `#unterschriftsbild-container` | `page-break-inside` |
| 591 | ja | `:root:not(:has(#toggle-anlagen:checked)) #anlagenvermerk` | `display` |
| 602 | ja | `body[data-seiten="1"] :scope` | `margin` |

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
