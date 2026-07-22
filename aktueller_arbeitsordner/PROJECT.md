# Project: DIN-Brief Neo Anti-Flicker & Synchronous Hydration

## Architecture
- Anti-Flicker & Layout State Hydration Architecture
- Form A / Form B HTML State & CSS `:has()` toggle pattern (no JS class toggling for layout)
- Anti-flicker synchronous inline script in `<head>` and/or before `</body>` reading `localStorage` synchronously before first paint

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: FOUC & Layout Shift Audit | Audit initial load, Form A/B toggle, CSS/JS hydration, identifying all flickering causes | none | DONE |
| 2 | M2: Synchronous Hydration Implementation | Fix inline script SyntaxError, key mismatches, CSS @import, remove setTimeout delays, enforce 100% fitness score | M1 | DONE |
| 3 | M3: Comprehensive Verification & Audit Gate | Multi-agent review, verification of zero FOUC/layout shift, 100% fitness gate, Forensic Auditor check | M2 | DONE |

## Interface Contracts & Guidelines
- Must strictly follow `AGENTS.md` and `Immutable-Law-Catalog.md`.
- No raw `innerHTML` without `DOMParser`.
- No `setTimeout` / `requestAnimationFrame` for initial layout state hydration.
- Verification command: `.\start.ps1` (must yield 100% Evolutionary Fitness Score).
