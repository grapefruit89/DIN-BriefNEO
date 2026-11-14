# Fakten zur Kaskade

**Erzeugt von `tools/batch-facts.mjs --scheibe 03` — nicht von Hand bearbeiten.**
Alle Zahlen und Zeilen sind aus den CSS-Dateien gelesen. Gezaehlt werden
**Vorkommen** von `!important`, nicht Zeilen (eine Zeile kann zwei tragen).

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

| Datei | Zeilen | `!important` | davon in `@media print` | ID-Selektoren | Custom Properties | `@layer` | `@scope` | `@function` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `base.css` | 359 | 24 | 17 | 4 | 67 | 0 | 0 | 7 |
| `sheet-common.css` | 721 | 2 | 0 | 138 | 10 | 0 | 2 | 0 |
| `sheet-multipage.css` | 641 | 100 | 73 | 72 | 9 | 0 | 2 | 6 |
| `sheet.css` (stillgelegt) | 354 | 26 | 21 | 22 | 0 | 0 | 3 | 3 |
| `sidebar.css` | 1270 | 3 | 0 | 120 | 3 | 0 | 0 | 0 |

Im Betrieb (ohne `sheet.css`): **129** `!important`, davon **90**
in `@media print`-Kontexten. `@layer` kommt **0**-mal vor.

## 3. `!important` nach Eigenschaft

| Eigenschaft | Vorkommen |
|---|---:|
| `display` | 19 |
| `height` | 6 |
| `width` | 6 |
| `margin` | 6 |
| `container-type` | 5 |
| `font-size` | 5 |
| `#viewport { padding` | 5 |
| `#app-shell { display` | 4 |
| `background` | 4 |
| `min-height` | 4 |
| `padding` | 4 |
| `margin-bottom` | 4 |
| `box-shadow` | 3 |
| `justify-content` | 3 |
| `align-items` | 3 |

## 4. Die `!important`-Regeln in `sheet-multipage.css`

Block = der zuletzt gesehene Selektor (bei `@media`-Kontexten der Selektor
davor). "print" heisst: steht in einem `@media print`-Block
(Zeilen 478, 635).

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
| 473 | — | `:root:has(#toggle-anlagen:checked) #anlagenvermerk` | `@top-left { content` |
| 474 | — | `:root:has(#toggle-anlagen:checked) #anlagenvermerk` | `@top-right { content` |
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
| 520 | ja | `din-blatt` | `position` |
| 521 | ja | `din-blatt` | `transform` |
| 522 | ja | `din-blatt` | `box-shadow` |
| 525 | ja | `din-blatt` | `margin` |
| 526 | ja | `din-blatt` | `width` |
| 527 | ja | `din-blatt` | `max-width` |
| 528 | ja | `din-blatt` | `min-width` |
| 529 | ja | `din-blatt` | `height` |
| 532 | ja | `din-blatt` | `min-height` |
| 533 | ja | `din-blatt` | `container-type` |
| 537 | ja | `#kern` | `min-height` |
| 538 | ja | `#kern` | `padding` |
| 545 | ja | `#kern` | `box-decoration-break` |
| 546 | ja | `#kern` | `width` |
| 547 | ja | `#kern` | `box-sizing` |
| 548 | ja | `#kern` | `column-count` |
| 549 | ja | `#kern` | `column-height` |
| 550 | ja | `#kern` | `column-wrap` |
| 551 | ja | `#kern` | `row-gap` |
| 552 | ja | `#kern` | `background` |
| 553 | ja | `#kern` | `filter` |
| 554 | ja | `#kern` | `display` |
| 558 | ja | `#kern` | `#spacer { height` |
| 559 | ja | `#kern` | `… [data-layout="form-a"] #spacer { height` |
| 561 | ja | `#kern` | `ohne !important) geklemmt — ein normaler max-hei` |
| 562 | ja | `#kern` | `!important-height. Sie lieferten also nie 98,46m` |
| 567 | ja | `#betreff` | `display` |
| 568 | ja | `#betreff` | `font-size` |
| 569 | ja | `#betreff` | `font-weight` |
| 570 | ja | `#betreff` | `line-height` |
| 571 | ja | `#betreff` | `margin-bottom` |
| 572 | ja | `#betreff` | `text-wrap` |
| 576 | ja | `#anrede` | `display` |
| 577 | ja | `#anrede` | `font-size` |
| 578 | ja | `#anrede` | `line-height` |
| 579 | ja | `#anrede` | `margin-bottom` |
| 583 | ja | `#text` | `display` |
| 584 | ja | `#text` | `font-size` |
| 585 | ja | `#text` | `line-height` |
| 586 | ja | `#text` | `text-align` |
| 587 | ja | `#text` | `hyphens` |
| 588 | ja | `#text` | `text-wrap` |
| 589 | ja | `#text` | `orphans` |
| 590 | ja | `#text` | `widows` |
| 597 | ja | `#text p` | `margin` |
| 601 | ja | `#text p:last-child` | `margin-bottom` |
| 605 | ja | `#grussformel` | `display` |
| 606 | ja | `#grussformel` | `font-size` |
| 607 | ja | `#grussformel` | `margin-top` |
| 608 | ja | `#grussformel` | `margin-bottom` |
| 609 | ja | `#grussformel` | `break-after` |
| 610 | ja | `#grussformel` | `page-break-after` |
| 614 | ja | `#unterschrift` | `font-size` |
| 615 | ja | `#unterschrift` | `font-weight` |
| 621 | ja | `#anlagenvermerk` | `break-inside` |
| 622 | ja | `#anlagenvermerk` | `page-break-inside` |
| 627 | ja | `:root:not(:has(#toggle-anlagen:checked)) #anlagenvermerk` | `display` |
| 638 | ja | `body[data-seiten="1"] :scope` | `margin` |

## 5. Grenzen dieses Blatts

- Der Scanner erkennt Bloecke, deren `{` am Zeilenende steht, und den
  `@media print`-Kontext. Einzeilige Regeln und verschachtelte Selektoren in
  einer Zeile werden nicht aufgeloest.
- **Keine Spezifitaetsberechnung.** Welche `!important`-Regel eine andere
  schlaegt, steht hier nicht — dafuer braucht es Selektorvergleich, nicht Regex.
  Das ist eine Aufgabe des Reviews, nicht des Blatts.
