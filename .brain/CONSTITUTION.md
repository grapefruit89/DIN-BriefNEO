# Architectural Constitution (SSoT)
**Status**: VERIFIED | **Compliance**: PLATINUM 2026 | **Authority**: SUPREME

## I. CORE ARCHITECTURAL PRINCIPLES

### §1 Technological Hierarchy (Aviation Layering)
Each feature MUST be implemented at the lowest possible layer:
1. **Native HTML** (Structure, Semantics, Popover API, Invokers)
2. **Native CSS** (Layout @layer, mm-precision, OKLCH colors, contrast-color())
3. **Vanilla JavaScript** (IMR Registry, EditContext, Persistence, Logic)
4. **Public APIs** (Resilient external services — optional only)

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

## II. VISUAL INTEGRITY MANDATE
Zero layout shift after initialization. Every pixel is deterministic.

## III. DATA SOVEREIGNTY
The JSON data model is the single source of truth. HTML is strictly the presentation layer.
