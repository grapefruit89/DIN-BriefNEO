# DIN-BriefNEO — Anti-Pattern Registry
[v4.1 Pure Edition Update]

## DEP-P001: localStorage for high-volume data
- **Status:** PARTIALLY RELAXED
- **Rule:** localStorage is ALLOWED for state synchronization < 50KB.
- **Reason:** Ensuring file:// compatibility and Zero-JS DNA. OPFS remains preferred for large assets if available.

## DEP-C004: setTimeout for UI logic
- **Status:** BANNED
- **Rule:** Use CSS Transitions/Animations or RequestIdleCallback. 
- **Exception:** Debouncing user input (Storage-Sync).

## DEP-UI01: Imperative DOM Toggles
- **Status:** BANNED
- **Rule:** Use :has(), Popover API and Anchor Positioning.
