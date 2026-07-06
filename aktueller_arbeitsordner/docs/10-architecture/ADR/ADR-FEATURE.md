---
aliases:
- Feature Specifications
- Premium UX
chosen_option: ''
created: '2026-07-06'
date: 2026-05-24
deciders:
- morit
- antigravity
decision_options: []
depends_on: []
last-reviewed: 2026-07-02
project: DIN-BriefNEO
related:
- '[[ADR-HTML]]'
- '[[ADR-CSS]]'
- '[[ADR-JS]]'
- '[[longevity-guidelines]]'
status: accepted
tags:
- adr
- features
- popovers
- selections
- styling
- highlights
title: 'ADR-FEATURE: Feature Specifications & Premium UX'
type: adr
updated: '2026-07-06'
---

# ADR-FEATURE: Feature Specifications & Premium UX

## 1. Context & Problem

**Premium-UX ohne schwergewichtige Frameworks.**
- Ein moderner Editor benötigt smarte Features wie Kontext-Toolbars, Toasts, Überlaufwarnungen und Dropdowns.
- Klassische Herangehensweisen stützen sich hierfür auf schwere JS-Frameworks (React, Vue) und manuelle Berechnungen.
- DIN-BriefNEO benötigt all diese Features 100% nativ, performant und absolut WYSIWYG-konform (kein Editieren in der Sidebar).

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Native Web-APIs & Anchor Positioning) | CSS Anchor Positioning, `@starting-style`, Popovers | Zero-JS-Animation, WYSIWYG-Treue, native Performance | Benötigt sehr neue Chromium-Versionen | Keine | **Gewählt** |
| **Option B** (JS-basierte Libraries) | Popper.js, React-Toasts, Framer Motion | Breite Browserunterstützung | Abhängigkeit, Aufblähen der Codebase | Wartung | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Ausschließliche Nutzung modernster Web-Standards) entschieden.**

### Begründung
- **Strict WYSIWYG:** Eingaben passieren *ausschließlich* auf dem Blatt. Sidebar ist nur für Toggles. Dropdowns nutzen CSS Anchor Positioning am jeweiligen Papier-Element.
- **WhatsApp-Style Toolbar:** Das Format-Popover verankert sich rein über CSS an der Textselektion. JS steuert nur die Sichtbarkeit und Format-Logik.
- **Toasts:** Die Toast-Queue delegiert die Ein-/Ausblendeanimation komplett ans CSS (`@starting-style`, `transition-behavior: allow-discrete`). JS ruft nur `show/hidePopover()`.
- **A4-Überlauf-Warnung:** JS prüft die Texthöhe (max 120mm) und fügt eine Warn-Klasse hinzu, ohne den Scroll zu behindern.

## 4. Consequences

### Positive Auswirkungen
- **Flüssige UX:** Native CSS-Animationen sind maximal hardwarebeschleunigt.
- **Klarer Code:** Popover-Logik ohne JS-Rechnen (`getBoundingClientRect` entfällt).
- **Zukunftssicherheit:** Nutzung von Features, die ab 2024 zum Standard gehören.

### Risiken & Negative Auswirkungen
- Setzt tiefes Wissen über modernste CSS-Standards voraus.

## 5. Implementation & Verification

- CSS Anchor Positioning und `@starting-style` sind in `layout.css` aktiv.
- JavaScript ist strikt von Positionsberechnungen für Toolbars befreit.
- Einhaltung von WYSIWYG ist durch die Antipattern-Verfassung garantiert.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-CSS]]
- [[ADR-JS]]
- [[longevity-guidelines]]