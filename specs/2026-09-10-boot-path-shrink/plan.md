---
id: plan-2026-09-10-boot-path-shrink
title: 'Plan: Boot-Path-Shrink + anchor-scope-Nutzenprüfung'
type: plan
status: active
created: '2026-09-10'
updated: '2026-09-10'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/plan
spec_links:
  - spec-2026-09-10-boot-path-shrink
---

# Plan

## Schritt 1 — Analyse (erledigt)

Befunde:

| boot-state.js-Block | Owner | Entscheidung |
|---|---|---|
| `html`/`body` `data-theme` + `colorScheme` (Z. 40–47) | `boot-theme.js` (Head, vor First Paint) | **Remove** — exakte Duplizierung |
| Theme-Button `data-appearance` + `title`/`aria-label` | nur hier möglich (Boot-Fenster) | Keep |
| Radios `setRadioSync` | nur hier (CSS-Attributselektoren) | Keep |
| Draft-Restore via `setHTML` | nur hier | Keep |
| Postvermerk | nur hier | Keep |
| `font-custom-active` | nur hier (Boot-Fenster) | Keep |

CSS-Abhängigkeit verifiziert: `variables.css` deckt `body` über `[data-theme="…"] body` ab; `color-scheme` erbt von `html`.

## Schritt 2 — anchor-scope-Nutzenprüfung (erledigt)

1. **Support:** `anchor-scope` ist Chrome 131+ (caniuse/BCD), also in der 150+-Baseline. *Support ist nicht das Problem.*
2. **Geometrie:** Radio-Inputs sind `.sr-only` (1×1 px). Anker muss auf `input:checked + label` zeigen (volle Zellengeometrie) — machbar via eine Sibling-Regel, nth-of-type-Kette entfällt.
3. **Killer:** Anchor-Wechsel wird **nicht interpoliert** — `position-anchor`-Wechsel springt instant. Die 0.3s-Slide-Animation des Pills (`transform`-Transition, Kern-UX des Controls) geht verloren und ist mit Anchor-Positioning nicht reproduzierbar.
4. „Unbegrenzt viele Optionen"-Argument greift nicht: feste Optionszahl (2/3), Index-Kette deckt bis 4 ab.

**Urteil:** Gatter A2 (i) verfehlt → **Defer** mit DECISION-LOG-Notiz.

## Schritt 3 — Umsetzung Boot-Shrink

- `boot-state.js`: Z. 40–47 entfernen; Theme-Button-Block (Z. 48–55) unverändert; Kommentar (Z. 6–11) aktualisieren (Theme/ColorScheme-Restore entfällt als Aufgabe).
- Keine Änderungen an `boot-theme.js`, `variables.css`, `02-settings-manager.js`.

## Schritt 4 — Verifikation

- Gate (`node tools/build_db.js`) → 100 %.
- Live-CDP frischer Tab: Theme `light` → Boot-Label sofort `☀️ Hell`, `color-scheme` am `body` korrekt, Segment-Control-Pill unberührt (Klickzyklus Layout A/B).

## Schritt 5 — Protokoll

- DECISION-LOG: (a) Boot-Shrink-Eintrag mit Owner-Regel, (b) anchor-scope-Defer-Notiz.
- `node tools/log_session.js`.
