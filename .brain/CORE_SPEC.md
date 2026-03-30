---
id: BRAIN-002-SPEC
title: "Core Specification (IMR 4.0)"
version: 4.0.0
status: "active"
geometry: "DIN 5008:2020-03"
last_audit: 2026-03-28
tags:
  - specification
  - din-5008
  - imr-4-0
related:
  - "[[CONSTITUTION]]"
  - "[[ANTI_PATTERN]]"
---

# Core Specification (IMR 4.0)

## 1. ATOMIC CUSTOM ELEMENTS

The system implements a 19-atom model using native Custom Elements.

- **Header Atoms:** `din-absender-vorname`, `din-absender-nachname`, `din-absender-strasse`, `din-absender-ort`.
- **Recipient Atoms:** `din-empfaenger-firma`, `din-empfaenger-name`, `din-empfaenger-strasse`, `din-empfaenger-ort`.
- **Logic Atoms:** `din-text` (Source), `din-text-mirror` (View).
- **Behavior:** All atoms implement `contenteditable="plaintext-only"` and are bound via `EditContext API`.

## 2. TEMPORAL ENGINE

- **Capture:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`.
- **Target:** `<din-date>` (Standalone at 50mm Y / 125mm X).

## 3. PHYSICAL GEOMETRY (SSoT)

- **Form A (Small Header):** 27mm top offset for address zone.
- **Form B (Standard Header):** 45mm top offset for address zone.
- **Enforcement:** Zero-JS layout. Logic resides entirely in `app-ui.css` @layer geometry.

## 4. NATIVE LAYOUT & RENDERING (Chrome 147+)

- **Field Sizing:** `field-sizing: content` for all textfields (Zero-Scroll Mandate).
- **Scope Isolation:** `@scope (#paper)` for all `din-*` selectors to prevent style leakage.
- **Typed Properties:** `@property` for all 19 CMA-coordinates (Precise sub-pixel layout).
- **Mirror Security:** `setHTML()` with Sanitizer API for `din-text-mirror` and ghosting.
- **Input Handling:** EditContext API with `textupdate` events for Category B elements.
- **Transitions:** Scoped View Transitions for Form A/B layout morphing.
- **Reactivity (Future):** Native Signals API for zero-proxy state management.
- **Conditionals (Future):** CSS `if()` logic for declarative Form A/B geometry.
