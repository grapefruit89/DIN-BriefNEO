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
- Must strictly follow `AGENTS.md` and `docs/Meta/MASTER-DO-DONT-DEPRECATED.md`.
- Numbered Domain Architecture: JS files in `website/js/20-features/` or `10-ui/`.
- No raw `innerHTML` without `DOMParser`.
- Verification command: `.\start.ps1` (must yield 100% Evolutionary Fitness Score).

## Code Layout
- `website/index.html`
- `website/css/`
- `website/js/main.js` (orchestrator)
- `website/js/00-core/`
- `website/js/10-ui/`
- `website/js/20-features/`
- `website/js/30-utils/`
