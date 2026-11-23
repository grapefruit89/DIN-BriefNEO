---
id: chrome-css-radar
title: 'Chrome-CSS-Radar 2026 — was kommt, was wir schon nutzen'
type: reference
status: active
created: '2026-11-23'
updated: '2026-11-23'
tags:
  - din-briefneo
  - css
  - research
  - bleeding-edge
doc_links:
  - '[[ADR-CSS]]'
  - '[[BACKLOG]]'
code_links:
  - 'website/css/sheet-multipage.css'
  - 'website/css/base.css'
depends_on: []
---

# Chrome-CSS-Radar 2026

> **Quelle:** Chromestatus-Dump vom 03.09.2026 (`chrome_features_2026.json`,
> 433 Features) plus die Fundlisten aus demselben Lauf. Ausgewertet wurden die
> **90 CSS-Features**; die meisten tragen im Dump **keinen Meilenstein** — es ist
> also ein Radar für „kommt", nicht für „ist in Version X".
>
> **Aktualisieren:** `node tools/query_chrome_feature.mjs "<thema>"` (live gegen
> chromestatus) oder `website/tools/browser-audit.html` im Browser.

## 1. Was wir bereits nutzen (Baseline Chromium 150+)

| Feature | Wo | Wofür |
|---|---|---|
| `column-wrap` / `column-height` (Multicol L2) | `sheet-multipage.css` | echte Seitenbänder, Mehrseiten-Umbruch |
| `text-box-trim` | `base.css` | optische Zeilenhöhe, DIN-Satzbild |
| `field-sizing: content` | `sidebar.css` | Feldhöhe ohne JS-Messung |
| `@starting-style` | `sidebar.css` | Einblenden ohne Timer-Hacks |
| `light-dark()` + `color-scheme` | `base.css` | Hell/Dunkel/System |
| `color-mix()` in OKLCH | `base.css` | Themes ohne Farbtabellen |
| `:has()` | `sheet.css`, `sidebar.css` | Zustand ohne Klassen-JS |
| `@property` | `base.css` | typisierte Custom Properties |
| Anchor Positioning | Adressvorschläge | Popover am Feld |
| Popover API + Top Layer | Toasts, Listen, Dialoge | kein z-index-Stapel |
| Invoker Commands (`commandfor`) | Dialoge | Dialoge ohne Click-Handler |

## 2. Kandidaten, die zu DIN-BriefNEO passen

| Feature | Was es bringt | Warum bei uns |
|---|---|---|
| **Unprintable areas via CSS** | Drucker geben ihre nicht bedruckbaren Ränder an CSS | DIN-5008 lebt von Randmaßen; heute raten wir 20 mm |
| **CSSPageDescriptor für `@page`** | `@page`-Deskriptoren als CSSOM-Objekt statt String-Bau | Der Folgeseiten-Kopf wird per `adoptedStyleSheets` gebaut — würde typsicher |
| **`margin-trim`** | erste/letzte Kind-Marge fällt weg | Blatt-Innenabstände ohne `:first-child`-Regeln |
| **`text-indent: hanging each-line`** | hängender Einzug je Absatz | typischer Behördenbrief-Satz |
| **`text-decoration-inset` / `skip-spaces`** | Unterstreichungen sitzen richtig, überspringen Leerzeichen | Link-/Hervorhebungs-Optik im Satz |
| **`text-overflow: <string>`** + **Clip bei Interaktion** | eigener Abschneide-Text; beim Bearbeiten wird der volle Wert sichtbar | lange Firmennamen im Anschriftfeld |
| **`shrink-to-fit container`** | Container schrumpft auf längste Zeile | Anschriftblock/Betreff ohne Breiten-JS |
| **`contrast-color()`** | Textfarbe automatisch kontrastierend | Akzentflächen, Buttons, AA-Kontrast |
| **Relative Alpha (`alpha()`)** | Alpha relativ zur Ursprungsfarbe | Theme-Varianten ohne neue Tokens |
| **`at-rule()` / `named-feature()` in `@supports`** | Feature-Erkennung rein in CSS | progressive Enhancement ohne JS-Abfrage |
| **Element-scoped View Transitions** (M147) | Übergang auf einem Element statt Vollseite | Formular A/B ohne Flackern |
| **CSS mixins (`@mixin`)** | wiederverwendbare Deklarationsblöcke | die wiederkehrenden Blatt-Regeln |
| **`font-width` / `FontFace.width`** | Breitenachse sauber ansprechen | Inter/Arial-Metrik ohne `font-stretch`-Krücke |
| **`::highlight(*)`** | alle Custom Highlights auf einmal | falls Suche/Markierung kommt (heute geparkt) |

## 3. Nur beobachten (kein Bedarf)

`scroll-snap-*`-Feinheiten, `overscroll-behavior: chain`, Masonry/Grid-Lanes,
`random()`, `kashida`, Ruby-Properties, `border-shape`, `window-drag`,
`CSS Symbols()`, Scroll-Triggered Animations, `flex-wrap: balance`.

## 4. Regeln für die Übernahme

1. **Kein Polyfill, keine Library** — ein Feature kommt erst, wenn Chromium es
   ohne Flag liefert (Baseline-Regel im [[ADR-CSS]]).
2. **HTML vor CSS vor JS** — ein CSS-Feature, das eine JS-Messung ersetzt, ist
   immer willkommen (siehe `field-sizing`).
3. **Ein Feature, ein Commit, ein Messlauf** — vor dem Umbau
   `node tools/print-messung.mjs` laufen lassen, damit „vorher/nachher" belegt ist.
