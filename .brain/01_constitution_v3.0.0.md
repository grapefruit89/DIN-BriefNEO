---
id: BRAIN-001-ARCHITECTURE-GUIDELINES
title: DIN-BriefNEO Architectural Guidelines v3.0.0
version: 3.0.0
status: verified
last_audit: 2026-03-27
tags: [mission-critical, production-ready, architecture, guidelines]
supersedes: [01_constitution_v2.0.0.md, constitution_v1.0.0.md]
authority: Core architectural guidelines for the DIN-BriefNEO system.
---

# 01 — Architectural Guidelines v3.0.0

## I. CORE ARCHITECTURAL PRINCIPLES (SSoT)

### §1 Technological Hierarchy (Layered Architecture)
Each feature MUST be implemented at the lowest possible layer of the stack:
1. **Native HTML** (Structure, Semantics, Interaction via Popover/Invokers)
2. **Native CSS** (Layout via `@layer`, Precision via `mm`, Logic via `:has()`)
3. **Vanilla JavaScript** (Semantic Data Model, Visual Overlay Layer Synchronization, Persistence)
4. **Public APIs** (Anonymous services for ZIP/Interest rates — optional & resilient)

### §2 Zero-Width Marker Strategy
The 1:1 physical print preview is the primary constraint of the system.
- Markdown control characters (`*`, `_`) visible in the editor MUST NOT affect the physical width of the text flow.
- Implementation: `md-marker { display: inline-block; width: 0; overflow: hidden; }` within the visual overlay layer.

### §3 Structural Zoning (Constraint Management)
The document is divided into two immutable categories:
- **Category A (Static Header Data):** All `din-` tags except the body. These are single-line, `plaintext-only` fields constrained to millimeter precision.
- **Category B (Dynamic Flow Zone):** The `<din-body>` element, which supports dynamic content (lists, tables) and the Visual Overlay Layer.

### §4 Mission-Critical Baseline (Chrome 147+)
- Baseline: Google Chrome 147.0+.
- Strict utilization of native browser features (Anchor Positioning, Invoker Commands, Sanitizer API).
- **Constraint:** No polyfills, no `@supports` guards, and no backporting. The system evolves synchronously with the browser engine.

## II. VISUAL INTEGRITY MANDATE
Any layout shift after initialization is considered a critical system failure. The layout must remain absolutely stable during all input events.

## III. DATA SOVEREIGNTY (UNIFIED STATE)
The JSON data model is the single source of truth (SSoT). HTML is exclusively the presentation layer. The system state is governed entirely by the data model.
