---
id: BRAIN-001-CONST
title: "Architecture Specification (SSoT)"
version: 4.0.0
status: "verified"
compliance: "v4.0-Stable"
authority: "Lead Architect"
last_audit: 2026-03-28
tags:
  - architecture
  - ssot
  - mission-critical
related:
  - "[[CORE_SPEC]]"
  - "[[ANTI_PATTERN]]"
aliases:
  - "Architecture Protocol"
---

# Architecture Specification (SSoT)

## I. CORE ARCHITECTURAL PRINCIPLES

### §1 Technological Hierarchy (Structural Layering)
Each feature MUST be implemented at the lowest possible layer:
1. **Native HTML** (Structure, Semantics, Popover API, Invokers)
2. **Native CSS** (Layout @layer, 0.001mm-precision, OKLCH colors, contrast-color())
3. **Vanilla JavaScript** (IMR Registry, EditContext, Persistence, Logic)
4. **Public APIs** (Fault-tolerant external services — optional only)

### §2 Zero-Width Marker Strategy (WYSIWYG)
The physical 1:1 print preview is the primary constraint.
- Markdown control characters (`*`, `_`) visible in the editor MUST NOT affect text flow width.
- Execution: `.md-marker { display: inline-block; width: 0; overflow: visible; }`

### §3 Structural Zoning (IMR 4.0)
The document consists of 19 atomic fields defined in the `Isomorphic Master Registry`.
- **Category A (Atoms):** Single-line, `plaintext-only` fields (e.g., `<din-absender-vorname>`).
- **Category B (Flow):** The `<din-text>` element with EditContext support.

### §4 Chrome Baseline (147+)
- No polyfills. No `@supports` guards for core APIs (Anchor Positioning, Sanitizer, Temporal).
- The system evolves synchronously with the Blink engine.

## II. VISUAL STABILITY REQUIREMENT
Zero layout shift after initialization. Every pixel is deterministic.

## III. UNIFIED DATA STATE
The JSON data model is the single source of truth (SSoT). HTML is strictly the presentation layer.
