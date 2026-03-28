# SPEC-075: Modern UI Baseline (Low Hanging Fruits)

## 1. Status Quo
Das Projekt nutzt bereits moderne APIs, aber an einigen Stellen schleppen wir noch "Legacy-Pattern" mit (Date-Objekte, Inline-Event-Handler, JS-basierte Layout-Hacks).

## 2. Zielsetzung (Anforderung)
Einführung von Chrome 147+ Basistechnologien zur Reduktion von JavaScript-Komplexität und Verbesserung der visuellen Qualität.
- **Präzision:** Temporal API für alle Zeitberechnungen.
- **Ästhetik:** OKLCH-Farbraum für alle CSS-Farben.
- **Effizienz:** Native Browser-Features (Invoker Commands, CSS Anchor, field-sizing) statt JS-Workarounds.

## 3. Akzeptanzkriterien
- Keine `new Date()` Aufrufe mehr.
- Alle Farben in `oklch()`.
- Keine `onchange=""` Attribute im HTML.
- `field-sizing: content` regelt das Wachstum von Textfeldern.
- Sanfte Animationen via `@starting-style` ohne JS-Zustände.
