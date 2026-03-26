# 41 — CSS Kinetic State-Machine v1.0.0

## I. BEFUND
Chrome 144+ bietet Container Scroll-State Queries (`@container scroll-state()`) und `calc-size()`.

## II. ARCHITEKTONISCHE BEDEUTUNG
- **Native Intrinsische Animationen**: `calc-size()` ermöglicht nahtlose Übergänge zu und von intrinsischen Werten (`auto`, `max-content`) ohne JavaScript-Höhenberechnungen.
- **Scroll-Observer Obsolet**: Erkennung von Textüberlauf (`scrollable`) oder Sticky-Zuständen wandert komplett in die C++-Layout-Pipeline.
- **Jank-Frei**: 120fps Rendering für kinetische UI-Elemente, da der V8-Main-Thread umgangen wird.

## III. STATUS
- **Gültig ab**: Chrome Baseline 147
- **Doktrin**: CSS-Exclusive Kinetic Feedback
