# SPEC-075-Plan: Modern UI Baseline Implementation

## 1. Technisches Design
Wir nutzen die nativen Chrome-Features ab Version 147. 

### Meilensteine:
1.  **Date Migration:** `new Date()` -> `Temporal API`.
2.  **Color Refactoring:** Hex/RGBA -> `oklch()`.
3.  **UI-Structure:** HTML `onchange` entfernen, Event-Delegation in `ui.js`.
4.  **Modern CSS:** `field-sizing: content`, `text-wrap: balance`, `@starting-style`.
5.  **Native Interaction:** `popovertarget` -> `commandfor`.

## 2. Teststrategie
- Visuelle Prüfung via Puppeteer auf Chrome 147 Baseline.
- Validierung der Date-Strings (Temporal ISO vs. German Format).
- Sicherstellen, dass die Event-Delegation alle Layout-Switches erkennt.
