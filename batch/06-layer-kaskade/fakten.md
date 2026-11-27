---
status: completed
type: reference
tags:
  - batch
  - layer-kaskade
  - fakten
summary: 'Fakten und Kennzahlen zur Layer-Kaskade (B59)'
sections: [1-kennzahlen, 2-scope-bloecke, 3-die-bildschirm-sperre-regeln-ohne-media-screen, 4-alle-important-je-datei]
---
# Fakten zur Layer-Kaskade (B59)

**Erzeugt von `tools/batch-facts.mjs --scheibe 06` — nicht von Hand bearbeiten.**
`--check` bricht ab, wenn dieses Blatt nicht mehr zum Quelltext passt.
Zaehlweise: **Vorkommen**, nicht Zeilen.

## 1. Kennzahlen

| Datei | Zeilen | `!important` | davon Druck | `@layer` | `@scope` | `@media print`-Bloecke |
|---|---:|---:|---:|---:|---:|---:|
| `base.css` | 456 | 25 | 17 | 0 | 0 | 1 |
| `sheet-multipage.css` | 603 | 61 | 36 | 1 | 2 | 2 |
| **Summe (diese zwei Dateien)** | | **86** | **53** | | | |

Die anderen beiden geladenen Dateien sind nicht im Anhang:
`sidebar.css` (1.263 Zeilen, 3 `!important`, 0 `@scope`) und
`sheet-common.css` (726 Zeilen, 1 `!important`, 0 `@scope`).

## 2. `@scope`-Bloecke

**sheet-multipage.css**

| Zeile | Block |
|---:|---|
| 99 | `@scope (din-blatt)` |
| 598 | `@scope (din-blatt)` |

## 3. Die Bildschirm-Sperre: Regeln OHNE `@media screen`

Diese Regeln gelten im Druck mit — deshalb braucht der Druckblock `!important`.
Sie sind der Grund, warum `@layer` erst nach dem Umbau greift.

| Zeile | Selektor | Deklaration |
|---:|---|---|
| 60 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `overflow-y: hidden !important;` |
| 61 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `display: flex !important;` |
| 62 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `justify-content: center !important;` |
| 63 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `align-items: center !important;` |
| 64 | `body:not([data-seiten]) #viewport,body[data-seiten="1"] #viewport,#vie` | `padding: 10px 20px !important;` |
| 70 | `body[data-seiten]:not([data-seiten="1"]) #viewport,#viewport[data-seit` | `overflow-y: auto !important;` |
| 71 | `body[data-seiten]:not([data-seiten="1"]) #viewport,#viewport[data-seit` | `display: block !important;` |
| 72 | `body[data-seiten]:not([data-seiten="1"]) #viewport,#viewport[data-seit` | `padding: 40px 20px 80px !important;` |
| 79 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `display: flex !important;` |
| 80 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `justify-content: center !important;` |
| 81 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `align-items: center !important;` |
| 82 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `height: 100% !important;` |
| 83 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `width: 100% !important;` |
| 84 | `body:not([data-seiten]) #brief-ansicht,body[data-seiten="1"] #brief-an` | `container-type: normal !important;` |
| 89 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `display: flex !important;` |
| 90 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `justify-content: center !important;` |
| 91 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `align-items: flex-start !important;` |
| 92 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `min-height: 100% !important;` |
| 93 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `height: auto !important;` |
| 94 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `width: 100% !important;` |
| 95 | `body[data-seiten]:not([data-seiten="1"]) #brief-ansicht,#viewport[data` | `container-type: normal !important;` |

## 4. Alle `!important` je Datei

```
Datei | Zeile | Kontext | @scope | Selektor | Deklaration
```

| `base.css:19` | global | — | `:is([hidden], .hidden)` | `display: none !important;` |
| `base.css:56` | global | — | `:root[data-booting="true"] *,:root[data-boot` | `transition: none !important;` |
| `base.css:71` | global | — | `*, *::before, *::after` | `animation-duration: 0.01ms !im` |
| `base.css:72` | global | — | `*, *::before, *::after` | `animation-iteration-count: 1 !` |
| `base.css:73` | global | — | `*, *::before, *::after` | `transition-duration: 0.01ms !i` |
| `base.css:74` | global | — | `*, *::before, *::after` | `transition-delay: 0ms !importa` |
| `base.css:75` | global | — | `*, *::before, *::after` | `scroll-behavior: auto !importa` |
| `base.css:83` | global | — | `#hinweis-v4:popover-open` | `animation-duration: var(--hinw` |
| `base.css:407` | Druck | — | `:root, body, din-blatt` | `color-scheme: light !important` |
| `base.css:408` | Druck | — | `:root, body, din-blatt` | `print-color-adjust: exact !imp` |
| `base.css:411` | Druck | — | `?` | `din-falzmarke-1, din-falzmarke` |
| `base.css:413` | Druck | — | `?` | `din-falzmarke-1::after, din-fa` |
| `base.css:418` | Druck | — | `:root[data-marks="false"] din-falzmarke-1,:r` | `visibility: hidden !important;` |
| `base.css:421` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:421` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:421` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:421` | Druck | — | `?` | `#app-shell { display: block !i` |
| `base.css:423` | Druck | — | `?` | `.unterschriftsbild-rahmen { ou` |
| `base.css:428` | Druck | — | `[contenteditable]:empty::before,[data-placeh` | `display: none !important;` |
| `base.css:437` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `outline: none !important;` |
| `base.css:438` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `box-shadow: none !important;` |
| `base.css:439` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `background: transparent !impor` |
| `base.css:440` | Druck | — | `[contenteditable],:is(textarea[data-feldtyp]` | `border-radius: 0 !important;` |
| `base.css:445` | Druck | — | `textarea[data-feldtyp]::placeholder` | `color: transparent !important;` |
| `base.css:454` | Druck | — | `#rucksendeangabe` | `border-radius: 0 !important;` |
| `sheet-multipage.css:60` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `overflow-y: hidden !important;` |
| `sheet-multipage.css:61` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `display: flex !important;` |
| `sheet-multipage.css:62` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `justify-content: center !impor` |
| `sheet-multipage.css:63` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `align-items: center !important` |
| `sheet-multipage.css:64` | global | — | `body:not([data-seiten]) #viewport,body[data-` | `padding: 10px 20px !important;` |
| `sheet-multipage.css:70` | global | — | `body[data-seiten]:not([data-seiten="1"]) #vi` | `overflow-y: auto !important;` |
| `sheet-multipage.css:71` | global | — | `body[data-seiten]:not([data-seiten="1"]) #vi` | `display: block !important;` |
| `sheet-multipage.css:72` | global | — | `body[data-seiten]:not([data-seiten="1"]) #vi` | `padding: 40px 20px 80px !impor` |
| `sheet-multipage.css:79` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `display: flex !important;` |
| `sheet-multipage.css:80` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `justify-content: center !impor` |
| `sheet-multipage.css:81` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `align-items: center !important` |
| `sheet-multipage.css:82` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `height: 100% !important;` |
| `sheet-multipage.css:83` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `width: 100% !important;` |
| `sheet-multipage.css:84` | global | — | `body:not([data-seiten]) #brief-ansicht,body[` | `container-type: normal !import` |
| `sheet-multipage.css:89` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `display: flex !important;` |
| `sheet-multipage.css:90` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `justify-content: center !impor` |
| `sheet-multipage.css:91` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `align-items: flex-start !impor` |
| `sheet-multipage.css:92` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `min-height: 100% !important;` |
| `sheet-multipage.css:93` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `height: auto !important;` |
| `sheet-multipage.css:94` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `width: 100% !important;` |
| `sheet-multipage.css:95` | global | — | `body[data-seiten]:not([data-seiten="1"]) #br` | `container-type: normal !import` |
| `sheet-multipage.css:118` | global | ja | `body:not([data-seiten]) :scope,  body[data-s` | `margin: 0 auto !important;` |
| `sheet-multipage.css:272` | global | ja | `#spacer` | `display: block !important;` |
| `sheet-multipage.css:470` | global | — | `?` | `@top-left { content: none !imp` |
| `sheet-multipage.css:471` | global | — | `?` | `@top-right { content: none !im` |
| `sheet-multipage.css:478` | Druck | — | `html, body` | `overflow: visible !important;` |
| `sheet-multipage.css:479` | Druck | — | `html, body` | `height: auto !important;` |
| `sheet-multipage.css:480` | Druck | — | `html, body` | `background: oklch(100% 0 0) !i` |
| `sheet-multipage.css:484` | Druck | — | `#probe` | `display: none !important;` |
| `sheet-multipage.css:490` | Druck | — | `aside, .nicht-drucken, [popover], #hinweis-v` | `display: none !important;` |
| `sheet-multipage.css:500` | Druck | — | `#app-shell #viewport` | `padding: 0 !important;` |
| `sheet-multipage.css:501` | Druck | — | `#app-shell #viewport` | `background: transparent !impor` |
| `sheet-multipage.css:502` | Druck | — | `#app-shell #viewport` | `height: auto !important;` |
| `sheet-multipage.css:503` | Druck | — | `#app-shell #viewport` | `overflow: visible !important;` |
| `sheet-multipage.css:504` | Druck | — | `#app-shell #viewport` | `display: block !important;` |
| `sheet-multipage.css:505` | Druck | — | `#app-shell #viewport` | `container-type: normal !import` |
| `sheet-multipage.css:510` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `margin: 0 !important;` |
| `sheet-multipage.css:511` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `width: 210mm !important;` |
| `sheet-multipage.css:512` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `display: block !important;` |
| `sheet-multipage.css:513` | Druck | — | `#brief-ansicht,  body[data-seiten="1"] #brie` | `container-type: normal !import` |
| `sheet-multipage.css:521` | Druck | — | `din-blatt` | `transform: none !important;` |
| `sheet-multipage.css:524` | Druck | — | `din-blatt` | `margin: -25mm 0 0 0 !important` |
| `sheet-multipage.css:525` | Druck | — | `din-blatt` | `min-width: 210mm !important;` |
| `sheet-multipage.css:526` | Druck | — | `din-blatt` | `height: auto !important;` |
| `sheet-multipage.css:529` | Druck | — | `din-blatt` | `min-height: 0 !important;` |
| `sheet-multipage.css:530` | Druck | — | `din-blatt` | `container-type: normal !import` |
| `sheet-multipage.css:534` | Druck | — | `#kern` | `min-height: 0 !important;` |
| `sheet-multipage.css:535` | Druck | — | `#kern` | `padding: 25mm 20mm 0 25mm !imp` |
| `sheet-multipage.css:542` | Druck | — | `#kern` | `box-decoration-break: slice !i` |
| `sheet-multipage.css:543` | Druck | — | `#kern` | `column-count: auto !important;` |
| `sheet-multipage.css:544` | Druck | — | `#kern` | `column-height: auto !important` |
| `sheet-multipage.css:545` | Druck | — | `#kern` | `column-wrap: nowrap !important` |
| `sheet-multipage.css:546` | Druck | — | `#kern` | `row-gap: normal !important;` |
| `sheet-multipage.css:547` | Druck | — | `#kern` | `background: none !important;` |
| `sheet-multipage.css:548` | Druck | — | `#kern` | `filter: none !important;` |
| `sheet-multipage.css:568` | Druck | — | `#text p` | `margin: 0 0 1.5mm 0 !important` |
| `sheet-multipage.css:572` | Druck | — | `#text p:last-child` | `margin-bottom: 0 !important;` |
| `sheet-multipage.css:583` | Druck | — | `#unterschriftsbild-container` | `break-inside: avoid !important` |
| `sheet-multipage.css:584` | Druck | — | `#unterschriftsbild-container` | `page-break-inside: avoid !impo` |
| `sheet-multipage.css:589` | Druck | — | `:root:not([data-anlagen="true"]) din-anlagen` | `display: none !important;` |
| `sheet-multipage.css:600` | Druck | ja | `body[data-seiten="1"] :scope` | `margin: -25mm 0 0 0 !important` |
