# SPEC-090-Plan: UI/UX Platinum Polish Implementation

## 1. Technisches Design
Wir veredeln die bestehende CSS-Struktur und fügen eine zentrale Shortcut-Logik hinzu.

### Meilensteine:
1.  **CSS-Variables Update:** Einführung von `--space-unit: 7px` und abhängigen Skalen.
2.  **Backdrop-Filter:** Implementierung von `backdrop-filter: blur(8px)` für alle Modals.
3.  **Haptic Feedback:** CSS Transitions und `:active`-States für interaktive Elemente.
4.  **Focus States:** Nutzung von `:focus-visible` für saubere Outlines.
5.  **Shortcut Manager:** Erweiterung der `ui.js` um einen globalen Keydown-Listener.

## 2. Implementierungsschritte
1.  **Refine CSS:** Aktualisierung der `css/app-ui.css`.
2.  **JS Logic:** Implementierung der Shortcuts in `UIController.init()`.
