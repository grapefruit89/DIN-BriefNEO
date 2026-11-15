# Fakten zur Layer-Kaskade (B59)

**Erzeugt von `tools/batch-facts.mjs --scheibe 06` — nicht von Hand bearbeiten.**
`--check` bricht ab, wenn dieses Blatt nicht mehr zum Quelltext passt.
Zaehlweise: **Vorkommen**, nicht Zeilen.

## 1. Kennzahlen

| Datei | Zeilen | `!important` | davon Druck | `@layer` | `@scope` | `@media print`-Bloecke |
|---|---:|---:|---:|---:|---:|---:|
| `base.css` | 402 | 25 | 17 | 0 | 0 | 1 |
| `sheet-multipage.css` | 612 | 61 | 36 | 1 | 2 | 2 |
| **Summe (diese zwei Dateien)** | | **86** | **53** | | | |

Die anderen beiden geladenen Dateien sind nicht im Anhang:
`sidebar.css` (1.263 Zeilen, 3 `!important`, 0 `@scope`) und
`sheet-common.css` (726 Zeilen, 1 `!important`, 0 `@scope`).

## 2. `@scope`-Bloecke

**sheet-multipage.css**

| Zeile | Block |
|---:|---|
| 111 | `@scope (din-blatt)` |
| 607 | `@scope (din-blatt)` |

## 3. Die Bildschirm-Sperre: Regeln OHNE `@media screen`

Diese Regeln gelten im Druck mit — deshalb braucht der Druckblock `!important`.
Sie sind der Grund, warum `@layer` erst nach dem Umbau greift.

| Zeile | Selektor | Deklaration |
|---:|---|---|
| 72 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `overflow-y: hidden !important;` |
| 73 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `display: flex !important;` |
| 74 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `justify-content: center !important;` |
| 75 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `align-items: center !important;` |
| 76 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `padding: 10px 20px !important;` |
| 82 | `body[data-seiten]:not([data-seiten="1"]) #viewport,#viewport[data-seit` | `overflow-y: auto !important;` |
| 83 | `body[data-seiten]:not([data-seiten="1"]) #viewport,#viewport[data-seit` | `display: block !important;` |
| 84 | `body[data-seiten]:not([data-seiten="1"]) #viewport,#viewport[data-seit` | `padding: 40px 20px 80px !important;` |
| 91 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `display: flex !important;` |
| 92 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `justify-content: center !important;` |
| 93 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `align-items: center !important;` |
| 94 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `height: 100% !important;` |
| 95 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `width: 100% !important;` |
| 96 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `container-type: normal !important;` |
| 101 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `display: flex !important;` |
| 102 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `justify-content: center !important;` |
| 103 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `align-items: flex-start !important;` |
| 104 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `min-height: 100% !important;` |
| 105 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `height: auto !important;` |
| 106 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `width: 100% !important;` |
| 107 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `container-type: normal !important;` |

## 4. Alle `!important` je Datei

```
Datei | Zeile | Kontext | @scope | Selektor | Deklaration
```

| `base.css:19` | global | — | `:is([hidden], .hidden)` | `display: none !important;` |
| `base.css:49` | global | — | `:root:not([data-seeded="true"]):not([data-re` | `transition: none !important;` |
| `base.css:64` | global | — | `*, *::before, *::after` | `animation-duration: 0.01ms !im` |
| `base.css:65` | global | — | `*, *::before, *::after` | `animation-iteration-count: 1 !` |
| `base.css:66` | global | — | `*, *::before, *::after` | `transition-duration: 0.01ms !i` |
| `base.css:67` | global | — | `*, *::before, *::after` | `transition-delay: 0ms !importa` |
| `base.css:68` | global | — | `*, *::before, *::after` | `scroll-behavior: auto !importa` |
| `base.css:76` | global | — | `#hinweis-v4:popover-open` | `animation-duration: var(--hinw` |
| `base.css:353` | Druck | — | `:root, body, din-blatt` | `color-scheme: light !important` |
| `base.css:354` | Druck | — | `:root, body, din-blatt` | `print-color-adjust: exact !imp` |
| `base.css:357` | Druck | — | `?` | `din-falzmarke-1, din-falzmarke` |
| `base.css:359` | Druck | — | `?` | `din-falzmarke-1::after, din-fa` |
| `base.css:364` | Druck | — | `:root[data-marks="false"] din-falzmarke-1,:r` | `visibility: hidden !important;` |
| `base.css:367` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:367` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:367` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:367` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:369` | Druck | — | `?` | `.unterschriftsbild-rahmen { ou` |
| `base.css:374` | Druck | — | `[contenteditable]:empty::before,[data-placeh` | `display: none !important;` |
| `base.css:383` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `outline: none !important;` |
| `base.css:384` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `box-shadow: none !important;` |
| `base.css:385` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `background: transparent !impor` |
| `base.css:386` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `border-radius: 0 !important;` |
| `base.css:391` | Druck | — | `textarea[data-feldtyp]::placeholder` | `color: transparent !important;` |
| `base.css:400` | Druck | — | `#rucksendeangabe` | `border-radius: 0 !important;` |
| `sheet-multipage.css:72` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `overflow-y: hidden !important;` |
| `sheet-multipage.css:73` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `display: flex !important;` |
| `sheet-multipage.css:74` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `justify-content: center !impor` |
| `sheet-multipage.css:75` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `align-items: center !important` |
| `sheet-multipage.css:76` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `padding: 10px 20px !important;` |
| `sheet-multipage.css:82` | global | — | `body[data-seiten]:not([data-seiten="1"]) #vi` | `overflow-y: auto !important;` |
| `sheet-multipage.css:83` | global | — | `body[data-seiten]:not([data-seiten="1"]) #vi` | `display: block !important;` |
| `sheet-multipage.css:84` | global | — | `body[data-seiten]:not([data-seiten="1"]) #vi` | `padding: 40px 20px 80px !impor` |
| `sheet-multipage.css:91` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `display: flex !important;` |
| `sheet-multipage.css:92` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `justify-content: center !impor` |
| `sheet-multipage.css:93` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `align-items: center !important` |
| `sheet-multipage.css:94` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `height: 100% !important;` |
| `sheet-multipage.css:95` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `width: 100% !important;` |
| `sheet-multipage.css:96` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `container-type: normal !import` |
| `sheet-multipage.css:101` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `display: flex !important;` |
| `sheet-multipage.css:102` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `justify-content: center !impor` |
| `sheet-multipage.css:103` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `align-items: flex-start !impor` |
| `sheet-multipage.css:104` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `min-height: 100% !important;` |
| `sheet-multipage.css:105` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `height: auto !important;` |
| `sheet-multipage.css:106` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `width: 100% !important;` |
| `sheet-multipage.css:107` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `container-type: normal !import` |
| `sheet-multipage.css:130` | global | ja | `body:not([data-seiten]) :scope,  body[data-s` | `margin: 0 auto !important;` |
| `sheet-multipage.css:284` | global | ja | `#spacer` | `display: block !important;` |
| `sheet-multipage.css:480` | global | — | `?` | `@top-left { content: none !imp` |
| `sheet-multipage.css:481` | global | — | `?` | `@top-right { content: none !im` |
| `sheet-multipage.css:488` | Druck | — | `html, body` | `overflow: visible !important;` |
| `sheet-multipage.css:489` | Druck | — | `html, body` | `height: auto !important;` |
| `sheet-multipage.css:490` | Druck | — | `html, body` | `background: oklch(100% 0 0) !i` |
| `sheet-multipage.css:494` | Druck | — | `#probe` | `display: none !important;` |
| `sheet-multipage.css:500` | Druck | — | `aside, .nicht-drucken, [popover], #hinweis-v` | `display: none !important;` |
| `sheet-multipage.css:510` | Druck | — | `#app-shell #viewport` | `padding: 0 !important;` |
| `sheet-multipage.css:511` | Druck | — | `#app-shell #viewport` | `background: transparent !impor` |
| `sheet-multipage.css:512` | Druck | — | `#app-shell #viewport` | `height: auto !important;` |
| `sheet-multipage.css:513` | Druck | — | `#app-shell #viewport` | `overflow: visible !important;` |
| `sheet-multipage.css:514` | Druck | — | `#app-shell #viewport` | `display: block !important;` |
| `sheet-multipage.css:515` | Druck | — | `#app-shell #viewport` | `container-type: normal !import` |
| `sheet-multipage.css:520` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `margin: 0 !important;` |
| `sheet-multipage.css:521` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `width: 210mm !important;` |
| `sheet-multipage.css:522` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `display: block !important;` |
| `sheet-multipage.css:523` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `container-type: normal !import` |
| `sheet-multipage.css:531` | Druck | — | `din-blatt` | `transform: none !important;` |
| `sheet-multipage.css:534` | Druck | — | `din-blatt` | `margin: -25mm 0 0 0 !important` |
| `sheet-multipage.css:535` | Druck | — | `din-blatt` | `min-width: 210mm !important;` |
| `sheet-multipage.css:536` | Druck | — | `din-blatt` | `height: auto !important;` |
| `sheet-multipage.css:539` | Druck | — | `din-blatt` | `min-height: 0 !important;` |
| `sheet-multipage.css:540` | Druck | — | `din-blatt` | `container-type: normal !import` |
| `sheet-multipage.css:544` | Druck | — | `#kern` | `min-height: 0 !important;` |
| `sheet-multipage.css:545` | Druck | — | `#kern` | `padding: 25mm 20mm 0 25mm !imp` |
| `sheet-multipage.css:552` | Druck | — | `#kern` | `box-decoration-break: slice !i` |
| `sheet-multipage.css:553` | Druck | — | `#kern` | `column-count: auto !important;` |
| `sheet-multipage.css:554` | Druck | — | `#kern` | `column-height: auto !important` |
| `sheet-multipage.css:555` | Druck | — | `#kern` | `column-wrap: nowrap !important` |
| `sheet-multipage.css:556` | Druck | — | `#kern` | `row-gap: normal !important;` |
| `sheet-multipage.css:557` | Druck | — | `#kern` | `background: none !important;` |
| `sheet-multipage.css:558` | Druck | — | `#kern` | `filter: none !important;` |
| `sheet-multipage.css:577` | Druck | — | `#text p` | `margin: 0 0 2.25mm 0 !importan` |
| `sheet-multipage.css:581` | Druck | — | `#text p:last-child` | `margin-bottom: 0 !important;` |
| `sheet-multipage.css:592` | Druck | — | `#unterschriftsbild-container` | `break-inside: avoid !important` |
| `sheet-multipage.css:593` | Druck | — | `#unterschriftsbild-container` | `page-break-inside: avoid !impo` |
| `sheet-multipage.css:598` | Druck | — | `:root:not(:has(#toggle-anlagen:checked)) din` | `display: none !important;` |
| `sheet-multipage.css:609` | Druck | ja | `body[data-seiten="1"] :scope` | `margin: -25mm 0 0 0 !important` |
