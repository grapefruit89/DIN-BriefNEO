# SPEC-076-Plan: Smart Deadline Implementation

## 1. Technisches Design
Wir nutzen die bereits implementierte `Logic.calculateDeadlines()` Funktion und verknüpfen sie tiefer mit der `ui.js`.

### Architektur:
1.  **Context Detection:** `Logic.detectContext(text)` scannt auf Keywords.
2.  **UI-Sync:** Ein `Signal`-ähnlicher Mechanismus (Subscriber) in `ui.js` triggert die Anzeige des Popovers.
3.  **Positioning:** `anchor-name: --anchor-date` und `--anchor-text` sorgen für die punktgenaue Platzierung des Popovers via CSS.

## 2. Implementierungsschritte
1.  **Refine Logic:** `calculateDeadlines` in `logic.js` auf Herz und Nieren prüfen (Temporal TimeZone).
2.  **HTML Structure:** Sicherstellen, dass das Popover-Element in `index.html` die richtige Klasse hat.
3.  **JS Handler:** `_handleSmartDeadlines` in `ui.js` finalisieren.
4.  **CSS:** Styling des Popovers für den "Fühlbaren Nutzen" (Transitions, Hover-Effekte).
