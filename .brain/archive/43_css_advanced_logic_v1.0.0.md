# 43 — CSS Advanced Logic & Typed attr() v1.0.0

## I. BEFUND
Typed `attr()` und `CSS if()` verlagern domänenbasierte Design-Logik in die C++-Engine.

## II. ARCHITEKTONISCHE BEDEUTUNG
- **Data-Driven Styling**: Umschalten von Layouts (z. B. Form A vs. Form B) erfordert keine JS-Klassen-Toggles mehr. Das HTML-Data-Attribut (z. B. `data-form="B"`) dient als SSoT.
- **Native if/else**: CSS berechnet Abstände dynamisch basierend auf Variablen und Attributen.
- **"Logic-Lite" Frontend**: HTML speichert den Zustand, CSS berechnet die Geometrie, JS hat im Layout-Prozess keinen Einflussbereich mehr.

## III. STATUS
- **Gültig ab**: Chrome Baseline 147
- **Doktrin**: Data-Attribute Driven CSS Logic
