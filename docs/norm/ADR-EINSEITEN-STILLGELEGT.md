---
id: adr-einseiten-stillgelegt
title: 'ADR-EINSEITEN-STILLGELEGT: Einzelseiten-Modus abgeschaltet'
type: adr
status: active
created: '2026-11-10'
updated: '2026-11-10'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/css
doc_links:
  - '[[ADR-CSS]]'
  - '[[ADR-JS]]'
  - '[[ARCHITECTURE-MAP]]'
code_links:
  - 'website/index.html'
  - 'website/js/boot.js'
  - 'website/js/settings.js'
  - 'website/js/main.js'
depends_on: []
---

# ADR-EINSEITEN-STILLGELEGT: Einzelseiten-Modus abgeschaltet

## Status

Angenommen (2026-11-10). `website/css/sheet.css` bleibt als Datei erhalten,
ist aber nicht mehr verlinkt und nicht mehr umschaltbar.

## Kontext

Der Schalter „Mehrseiten-Modus (Beta)" in der Sidebar schaltete zwischen zwei
vollständigen Layout-Engines: `sheet.css` (Einzelseite) und
`sheet-multipage.css` (Mehrseite). Zwei gemessene Defekte (CDP, Cache aus,
1600 × 1000, 2026-11-10):

**1. Stil-FOUC beim Umschalten.** `boot.js` tauschte `link.href` — das ist
**nicht** render-blockierend. Frame-Timeline im Einzelseiten-Modus:

| Zeit | Zustand |
|---|---|
| 38 ms | nackter Dokumentfluss: `din-datum` `inline`, 16 px, x = 24 y = 1060; `din-anlagenvermerk` `inline`, y = 1212 |
| 48 ms | Blattlayout: `din-datum` `position: absolute`, x = 150 y = 868 |

**2. Das Blatt war 0 × 0.** `din-blatt` berechnet seine Breite als
`min(100cqw, 100cqh × …)`. `100cqh` bezieht sich auf `#brief-ansicht`,
dessen Höhe allein vom Kind kommt — und das Kind trägt `contain: size`
(größenunabhängig). Die Containerhöhe bleibt damit 0, die Blattbreite wird 0,
alle `cqw`/`cqh`-Schriftgrößen fallen auf 0 px: `#datum` und `#unterschrift`
waren unsichtbar.

Die Kette gemessen: `din-blatt` 0 × 0 → `#brief-ansicht` 252 × **0** →
`#viewport`.

## Entscheidung

Der Einzelseiten-Modus wird **stillgelegt**, nicht gelöscht:

- Der Schalter verschwindet aus der Sidebar.
- `data-plugin-multipage` ist fest `true`; ein altes
  `pluginMultipage: false` im `localStorage` wird ignoriert.
- Es gibt keinen Stylesheet-Tausch mehr; `sheet-multipage.css` ist fest
  verlinkt und render-blockierend.
- `main.js` mountet den Mehrseiten-Controller immer.
- `website/css/sheet.css` bleibt unverändert erhalten (keine Datei gelöscht).
  Der Rückweg für den Modus führt ausschließlich über die Git-Historie:
  `unmountMultipage()` wurde entfernt, weil es nach dem Stilllegen keinen
  erreichbaren Aufrufer mehr hatte.

## Begründung

1. **Kein FOUC-Pfad mehr:** Was nie getauscht wird, kann nicht nachrücken.
2. **Der Modus war nicht benutzbar:** 0 × 0 ist kein Schönheitsfehler, sondern
   ein leeres Blatt.
3. **Die Reparatur wäre eine zweite Layout-Engine:** die zirkuläre
   Container-Höhe zu brechen, hieße `sheet.css` neu zu dimensionieren — für
   einen Modus, der als „Beta" beschriftet war und parallel zu
   `sheet-multipage.css` gepflegt werden müsste.

## Konsequenzen

- `docs/10-architecture/ADR-JS.md`, `ARCHITECTURE-MAP.md` und
  `website/css/README.md` beschreiben den festen Mehrseiten-Betrieb.
- `website/css/sidebar.css` verliert die tote Regel
  `[data-plugin-multipage="false"] .workbench-box`.
- Ein Test sichert die Migration: eine alte Einstellung `pluginMultipage:
  false` darf `data-plugin-multipage` nicht mehr auf `false` ziehen.
- Wer den Modus reaktivieren will, braucht einen neuen ADR **und** eine
  render-blockierende Auslieferung des Blatt-Stylesheets (z. B. Auswahl
  vor dem `<link>` per blockierendem Script).

## Alternativen

- **Reparieren:** Höhe für `#brief-ansicht` bzw. `dvh` statt `cqh` — verworfen,
  weil danach eine zweite Engine dauerhaft mitgepflegt werden müsste.
- **Nur dokumentieren:** verworfen, weil der Schalter sonst weiterhin zu einem
  leeren Blatt führt.
