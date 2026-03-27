---
id: ROADMAP-001-MODERNIZATION
title: Modern Baseline 2026 - Implementation Roadmap
version: 1.0.0
status: active
last_updated: 2026-03-27
priority_sorting: Effort (Low to High)
---

# Modernization Roadmap: DIN-BriefNEO

This document tracks the migration from legacy web patterns to the Blink Engine 2026 (Chrome 147+) standards.

## Phase 1: Quick Wins (Low Effort)

### [x] R1: Native Typography & Sizing
- **Target:** `text-wrap: balance` for subject lines, `field-sizing: content` for input fields.
- **Benefit:** Eliminates "orphans" and JS-based auto-resize hacks.
- **Complexity:** 1/10

### [x] R2: Layout Precision (CSS Math)
- **Target:** Replace `calc()` with `round()`, `rem()`, `mod()`.
- **Benefit:** Perfect 1mm alignment on the DIN grid without JS interference.
- **Complexity:** 2/10

### [x] R3: Perceptual Colors (OKLCH)
- **Target:** Migration from `rgba`/`hex` to `oklch()` and `light-dark()`.
- **Benefit:** Accessible contrast and unified theme logic.
- **Complexity:** 3/10

## Phase 2: Diagnostic & Utility (Medium Effort)

### [x] R4: Structured Telemetry
- **Target:** `ReportingObserver` and standardized `console.group` logging.
- **Benefit:** Professional debugging and automated error reporting.
- **Complexity:** 4/10

### [x] R5: Native View Transitions
- **Target:** Use `document.startViewTransition()` for Form A/B layout morphing.
- **Benefit:** High-performance, native UI animations.
- **Complexity:** 5/10

### [x] R6: Priority Task Scheduling
- **Target:** Replace `setTimeout(0)` with `scheduler.postTask()`.
- **Benefit:** Prevents UI jank during heavy background operations (e.g., storage).
- **Complexity:** 6/10

## Phase 3: Architectural Refactoring (High Effort)

### [ ] R7: Declarative Routing (URLPattern)
- **Target:** Use `URLPattern API` for state and template matching.
- **Benefit:** Robust, standardized routing without custom regex logic.
- **Complexity:** 7/10

### [ ] R8: Native Modals (Dialog)
- **Target:** Refactor custom `div` modals to HTML `<dialog>` + `inert`.
- **Benefit:** Native Focus Traps and Accessibility out-of-the-box.
- **Complexity:** 8/10

### [ ] R9: Reactive Signals
- **Target:** Replace manual DOM-sync logic with native Signal patterns.
- **Benefit:** Framework-less reactivity at engine-level speed.
- **Complexity:** 10/10

---
*Roadmap established on 2026-03-27. Starting with Phase 1.*
