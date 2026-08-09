---
id: adr-feature
title: 'ADR-FEATURE: Feature Specifications & Premium UX'
type: adr
status: active
created: '2026-06-26'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/css
  - tech/ui
doc_links:
  - ADR-HTML
  - ADR-CSS
  - ADR-JS
  - longevity-guidelines
code_links:
  - website/css/layout.css
error_patterns:
  - premium ux
  - popover
  - anchor positioning
  - wysiwyg
  - toolbar
  - toast
  - überlauf
supersedes: []
---

# ADR-FEATURE: Feature Specifications & Premium UX

## 1. Context & Problem

**Premium-UX ohne schwergewichtige Frameworks.**

- Ein moderner Editor benötigt smarte Features wie Kontext-Toolbars, Toasts, Überlaufwarnungen und Dropdowns.

- DIN-BriefNEO benötigt all diese Features 100% nativ, performant und absolut WYSIWYG-konform (kein Editieren in der Sidebar).

## 2. Considered Options

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