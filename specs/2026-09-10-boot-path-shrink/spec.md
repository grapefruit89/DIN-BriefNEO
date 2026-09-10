---
id: spec-2026-09-10-boot-path-shrink
title: 'Spec: Boot-Path-Shrink + anchor-scope-Nutzenprüfung'
type: spec
status: active
created: '2026-09-10'
updated: '2026-09-10'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/spec
  - boot-path
  - css
doc_links:
  - DECISION-LOG
  - ADR-JS
code_links:
  - 'website/js/boot-state.js'
  - 'website/js/boot-theme.js'
  - 'website/css/sidebar.css'
---

# Spec: Boot-Path-Shrink + anchor-scope-Nutzenprüfung

## Hintergrund

Externer Review (2026-09-10) nannte zwei Nachfolgepunkte:

1. **Bonus:** Nach Verlagerung der Präsentations-Strings ins CSS (Commit-Pending-Batch) kann `boot-state.js` weiter schrumpfen — für das modullose Fenster vor dem Modulstart.
2. **Punkt 1:** `anchor-scope` als Ersatz für die nth-of-type-Index-Kette des Segment-Control-Pills — laut eigener Voranalyse fragwürdiger Nutzen (stabile, feste Optionszahl 2/3; „Surgical Changes").

## Anforderungen

### A1 — Boot-Path-Shrink (umsetzen)

`boot-state.js` darf nur noch das setzen, was `boot-theme.js` (Head, blockierend) nicht abdeckt:

- **Remove:** Erneutes Setzen von `data-theme` + `color-scheme` auf `html` **und** `body` (Zeilen 40–47) — `boot-theme.js` setzt `html[data-theme]` + `html`-`colorScheme` bereits vor First Paint. CSS deckt `body` über `[data-theme="…"] body`-Descendant-Selektoren ab; `color-scheme` erbt. CSS-Tripel-Selektoren (`:root[…]`, `[…] body`, `body[…]`) in `variables.css:97–114` bleiben unangetastet.
- **Keep:** Theme-Button-Block (`data-appearance` + `title`/`aria-label`) — `boot-theme.js` läuft vor `<body>`, kann den Button nicht erreichen; korrektes Label/Titel im Boot-Fenster.
- **Keep:** Radios (CSS-Attributselektoren), Draft-Restore (`setHTML`), Postvermerk, `font-custom-active`-Klasse (Boot-Fenster-Zustand für Chip).
- **Gate:** Fitness 100 %; Live-CDP: gespeichertes Theme `light` → `::before`-Label sofort korrekt nach Navigation (kein „Auto"-Blinken), `color-scheme` korrekt.

### A2 — anchor-scope (Nutzenprüfung vor Implementierung)

Entscheidungsgatter: Implementierung nur, wenn **beide** erfüllt:

- (i) Segment-Control-Slide-Animation bleibt funktional gleichwertig erhalten.
- (ii) Live-CDP-Verifikation am echten Control (Pill-Position bei Klick, Fokusverhalten).

Ergebnis der Analyse (siehe plan.md): Gate **nicht erfüllt** → Defer als dokumentierte Notiz im DECISION-LOG.

## Generalisierungs-Check

- Boot-Shrink verallgemeinerbar als Regel für `llm_boilerplate`: „Zwei Boot-Skripte (Head/Body) dürfen sich nicht überlappen — jedes Attribut genau ein Owner."
- anchor-scope-Erkenntnis dokumentieren: Anchor-Wechsel springt (keine Interpolation) — nicht geeignet für slide/track-Patterns mit Transition.

## Außerhalb des Scopes

- Umbau der `body[data-theme]`-CSS-Tripel-Selektoren in `variables.css` (funktioniert, chirurgisch lasen).
- Entfernen der `font-custom-active`-Klasse zugunsten von `:root:has(#din-custom-font-style)` (mehrfach in layout/reset/signature.css verankert → Churn).
