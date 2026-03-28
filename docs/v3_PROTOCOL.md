# Architecture Protocol: v3_PROTOCOL.md
# v4.0 Standard Implementation
**Status**: ACTIVE | **Version**: 4.0.0 | **Baseline**: Chrome 147+

This protocol outlines the execution strategy for maintaining IMR 4.0 integrity across the application lifecycle.

---

## 1. Technical Invariants

### 1.1 Atomic Data Sync
- **Doctrine**: Data flows from Atom (`<din-*>`) to State (`proxy`) via `EditContext`.
- **Enforcement**: Any manual DOM manipulation of atoms outside the defined `IMR` mapping is a **SPEC_VIOLATION**.

### 1.2 Structural Integrity (Ghost-Mirror)
- **Pattern**: Source Atom (`<din-text>`) is visually suppressed in focus-loss states.
- **Renderer**: Mirror Atom (`<din-text-mirror>`) provides the formatted view using **Native Sanitizer API**.
- **Constraint**: The Mirror MUST be 100% reactive to the Source Atom.

### 1.3 Precision Mathematics
- **Standard**: All financial and geometric calculations use `PrecisionMath`.
- **Resolution**: Geometry is calculated with 0.001mm precision.
- **Financials**: Cent-based integer math or native `Math.sumPrecise`.

---

## 2. Component Specification

| Scope | Requirement | Technology |
| :--- | :--- | :--- |
| **Input** | `plaintext-only` | EditContext API |
| **Security** | Automated Sanitization | Sanitizer API (`CORE_SANITIZER`) |
| **Styling** | Perceptual Uniformity | OKLCH Colors |
| **Date/Time** | Deterministic | Temporal API |
| **Geometry** | Zero-JS Positioning | CSS Anchor Positioning |

---

## 3. Deployment Gates (PVP)

1.  **Registry Validation**: Check all tags against IMR 4.0 catalog.
2.  **Security Sweep**: Audit for `innerHTML` usage.
3.  **Terminology Check**: Ensure compliance with **v4.0 Standard** terminology.

**Lead Systems Architect**
*Gemini CLI*
