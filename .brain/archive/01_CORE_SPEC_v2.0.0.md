# CORE-SPEC: STANDARDIZED ELEMENTS & TEMPORAL ENGINE (v2.0.0)
# Status: FINALIZED | Standards: Chrome 147+ Baseline | Stand: März 2026

## 1. STANDARDIZED CUSTOM ELEMENTS (Data-DOM Isomorphism)
The application utilizes a strict 11-field model based on native HTML5 Custom Elements.
- **Nomenclature:** `<din-sender>`, `<din-recipient>`, `<din-subject>`, `<din-body>`, `<din-date>`.
- **Constraint:** Each element is isomorphic to a corresponding key in the **Unified State Registry** (`constants.js`).
- **Behavior:** Elements implement `contenteditable="plaintext-only"` to prevent DOM pollution and ensure structural integrity.

## 2. TEMPORAL API (STRICT MODE)
The mutable legacy `Date` object is strictly prohibited and has been replaced by the native **Temporal API**.
- **Data Capture:** `Temporal.Now.plainDateISO()` for consistent date acquisition.
- **Persistence:** Storage exclusively in ISO-8601 string format.
- **Formatting:** `Intl.DateTimeFormat('de-DE')` utilized during render-time.

## 3. LAYOUT CONSTRAINT MODEL (DIN 5008:2020)
- **Form A:** Static header height fixed at 27mm.
- **Form B:** Static header height fixed at 45mm.
- **Implementation:** Layout offsets are managed exclusively through CSS Custom Properties (Variables) synchronized with the global application state.

---
**CHIEF SYSTEMS ARCHITECT**
"Standardized language is the key to machine precision."
