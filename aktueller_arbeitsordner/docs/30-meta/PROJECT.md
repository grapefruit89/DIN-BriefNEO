---
id: project-text-fit
title: 'Projekt-Plan: Text-Fit Algorithmus'
type: project-plan
status: active
created: '2026-07-01'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/project-plan
error_patterns:
  - text-fit
  - text fit algorithmus
  - scrollWidth
  - contenteditable
  - milestones
supersedes: []
doc_links:
  - IMR-Registry
  - ADR-JS
  - ADR-CSS
  - Function-Traceability
code_links:
  - website/js/02-settings-manager.js
  - website/js/48-text-fit.js
---

# Project: DIN-Brief Neo Text-Fit Algorithm

## Architecture
- Single-line contenteditable text-fit monitoring and escalation architecture.
- Group-synchronized CSS states (`data-text-fit="condensed"`, `data-text-fit="shrink"`) on parent containers (e.g. `#empfaenger`, `#infoblock`).
- Pixel-based width measurement (`scrollWidth` vs `clientWidth`) for `.single-line` contenteditable elements.
- Input blocking (keypress/paste prevention & rollback) + Toast warning ("Maximalbreite erreicht") on Level 2 overflow.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: FOUC & Layout Shift Audit | Audit initial load, Form A/B toggle | none | DONE |
| 2 | M2: Synchronous Hydration Implementation | Fix inline script & storage | M1 | DONE |
| 3 | M3: Comprehensive Verification & Audit Gate | Multi-agent review & fitness gate | M2 | DONE |
| 4 | M4: Single-Line Text-Fit Algorithm | Pixel measurement, group escalation, input blocking & toast | M3 | IN_PROGRESS |

## Interface Contracts & Guidelines
- Must strictly follow `AGENTS.md` and [[Immutable-Law-Catalog]].
- Flat JS Architecture: Domain encoded in tens digit (`0x`=core, `3x`=ui, `4x`=features, `5x`=utils).
- No raw `innerHTML` without `DOMParser`.
- Verification command: `.\start.ps1` (must yield 100% Evolutionary Fitness Score).

## Code Layout
- `website/index.html`
- `website/css/`
- `website/js/main.js` (orchestrator, alle Imports)
- `website/js/0x-*.js` (core: draft-manager, settings, ui-protections)
- `website/js/3x-*.js` (ui: format-toolbar, toast, postvermerk)
- `website/js/4x-*.js` (features: salutation, signature, geoapify, date-format, text-fit)
- `website/js/5x-*.js` (utils: constants, storage, metadata, dev-tools)
