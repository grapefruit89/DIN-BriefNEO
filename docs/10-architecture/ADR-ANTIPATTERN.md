---
id: adr-antipattern
title: 'ADR-ANTIPATTERN: aufgelöst in den Immutable Law Catalog'
type: adr
status: superseded
created: '2026-06-26'
updated: '2026-10-02'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/superseded
  - type/adr
doc_links:
  - Immutable-Law-Catalog
  - DECISION-LOG
code_links: []
error_patterns:
  - antipattern
  - verboten
  - forbidden
supersedes: []
depends_on: []
---

# ADR-ANTIPATTERN — aufgelöst am 2026-10-02

> [!warning] Dieses Dokument führt keine Normen mehr
> Es war eine **zweite Verbotsliste** neben dem [[Immutable-Law-Catalog]] — mit eigener
> Nummerierung (`Abschnitt 0–18`) und eigener Pflege. Genau das verbietet PART III des
> Catalogs („Single Source, keine 15 Kopien"). Die Verbote gelten unverändert weiter,
> sie stehen jetzt **nur noch** im Catalog.
>
> Diese Datei bleibt als **Umschlüsselungstabelle** bestehen, weil der append-only
> [[DECISION-LOG]] und `docs/90-archive/` auf sie verweisen. Nicht erweitern.

## Abschnitt → Gesetz

| alt | Thema | neu im Catalog |
| :--- | :--- | :--- |
| Abs. 0 | `setHTMLUnsafe()` statt Sanitizer | **H11** |
| Abs. 1 | Frameworks & Build-Tools | **A51** (vorher nur indirekt über T1) |
| Abs. 2 | Externe CDNs, Google Fonts | A38, A41 |
| Abs. 3 | IndexedDB / OPFS / File System Access | S1, A34–A36 |
| Abs. 4 | `document.execCommand` | **A52** |
| Abs. 5 | Unkontrollierte Viewport-Scrollbalken | A43 |
| Abs. 6 | Legacy-Datums-APIs | TM1, A48 |
| Abs. 7 | Farbkette OKLCH → … → Named | C1, A16–A20 |
| Abs. 8 | CSS-Präprozessoren, CSS-in-JS | A21, A22 |
| Abs. 9 | Icon-CDNs, Icon-Fonts | A39, A40 |
| Abs. 10 | Lodash, Produkt-Transpiler | **A53** |
| Abs. 11 | JS-Animationsbibliotheken | **A54** |
| Abs. 12 | Inline-CSS für Layout/Farbe | A25 |
| Abs. 13 | JS-Text-Fitting, Layout-Polling | A49 |
| Abs. 14 | JS-Formatierungs-Interzeptoren | **A55** |
| Abs. 15 | Toast Pointer-Drag, `z-index` | **A56** |
| Abs. 16 | Radio-Segmented für binäre Toggles | **A57** |
| Abs. 17 | Radio-Gruppen für Theme-Wahl | **A58** |
| Abs. 18 | `Temporal.Now` ohne IANA-Zone | A50 |

Fett = Verbot hatte vorher **keine** Catalog-ID und existierte nur hier.

Zusätzlich aus [[GEMINI]] und [[CLAUDE]] in den Catalog überführt: **A59** (Papier ist
theme-unabhängig), **A60** (kein JS-Klassen-Toggle für UI-Zustand), **A61** (schreibendes
`innerHTML`), **A62** (`aria-pressed` statt `.active`) sowie die Druck-Gegenpflicht in A46.

## Verknüpfungen

* [[Immutable-Law-Catalog]] — alle gültigen Normen
* [[DECISION-LOG]] — Beschluss und Begründung
