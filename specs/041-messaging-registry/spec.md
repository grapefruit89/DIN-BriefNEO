---
id: SPEC-041
title: Central Messaging & Toast Registry
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Central Messaging & Toast Registry


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-MESSAGING]`
- **Lexicon Check**: "Toast-ID", "Compliance-Trigger", "UI-Hint", "Aviation-Alert".
- **Anti-Pattern Check**: Verhindert [ANTI-013] (Hardcoded Strings in der Logik).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Rationale**: Zentrale Pflege aller Warnungen und Hinweise. Ermglicht schnelles Anpassen von DIN-Begrndungen ohne Code-Eingriffe.

---

## Requirements *(mandatory)*

### FR-001: The MESSAGES Registry Object
- **Was**: Eine zentrale Datenstruktur (ES6 Frozen Object), die alle Texte enthlt.
- **Logik**: Die Struktur MUST hierarchisch sein:
    - `COMPLIANCE`: DIN-spezifische Warnungen (z.B. Klammern in Telefonnr.).
    - `UI_HINTS`: Tipps fr den Nutzer (z.B. "Betreff prefix entfernt").
    - `ERRORS`: Systemfehler (z.B. "LocalStorage voll").
- **Fields**: Jede Message MUST eine `id`, einen `text` und einen `type` (info, warn, error) haben.

### FR-002: DIN-Reference Injection
- **Was**: Hinterlegung der DIN-Begrndung pro Toast.
- **Logik**: Jede Compliance-Message MUST (optional) ein Feld `din_ref` (z.B. "DIN 5008:2020, Kap. 8.2") enthalten, das bei Bedarf (Expert Mode) angezeigt werden kann.

### FR-003: Performance-First Access
- **Was**: Blitzschneller Zugriff auf Texte.
- **Logik**: Da die Registry ein statisches JS-Objekt ist (kein `fetch` einer JSON nötig), MUST der Zugriff in O(1) Zeit erfolgen (direkter Key-Zugriff).

### FR-004: Internationalization Ready (i18n)
- **Logik**: Die Struktur MUST so aufgebaut sein, dass sie spter leicht auf `EN` erweitert werden kann (z.B. `MESSAGES.DE.COMPLIANCE.PHONE`).

## Success Criteria *(mandatory)*
- **SC-001**: **Centralization**: 100% aller im UI sichtbaren Strings befinden sich in dieser Registry. Keine hndischen Texte in den Controllern.
- **SC-002**: **Consistency**: Alle Toasts nutzen dasselbe visuelle Format (Typografie & Farbe) basierend auf ihrem Registry-Typ.

