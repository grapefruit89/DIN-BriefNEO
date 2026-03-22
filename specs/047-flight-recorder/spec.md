---
id: SPEC-047
title: Expert Flight Recorder & Data View
tags: [expert-mode, performance, ai, logging]
status: draft
weight: 90
criticality: HIGH
created: 2026-03-20
traceability: [DIN-SYS-RECORDER]
---
# Feature Specification: Expert Flight Recorder & Data View


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-RECORDER]`
- **Requirement**: Implementierung eines Black-Box Loggers und eines Akinator-Style KI-Interface-Blueprints.

---

## ?? Requirements *(mandatory)*

### FR-001: The Black-Box Logger (Session-Storage)
- **Was**: Ein internes Log-System, das Systemereignisse, Fehler und Warnungen erfasst.
- **Persistence**: Die letzten 50 Log-Eintraege MUST im `sessionStorage` persistiert werden.

### FR-002: Performance Tracing & Chrome Console
- **Grouping**: Logs MUST via `console.groupCollapsed()` unter "DIN-BriefNEO Flight-Recorder" gebündelt werden.
- **Timing**: Nutzung von `performance.mark()` zur Messung von ZIP-Latency und API-Dauer.

### FR-003: Expert Console UI (Dashboard)
- **Trigger**: 5-facher Klick auf V-Tag.
- **Features**: Live-Logs, JSON-State-Viewer, Log-Export (CSV/TXT).

### FR-004: The AI-Interview Protocol (Akinator-Style)
- **Was**: Ein "KI-Blueprint Button" im Data-Editor.
- **Prompt Content**: Der kopierte Prompt MUST die KI (Claude/Gemini) anweisen, ein interaktives Interview-Verfahren mit dem Nutzer zu starten:
    - **Phase 1 (Absender)**: Abfrage/Vervollständigung der Absenderdaten.
    - **Phase 2 (Empfnger)**: Abfrage der Empfängerdaten inklusive KI-basierter Validierung.
    - **Phase 3 (Inhalt)**: Erstellung des Brieftextes im Dialog.
    - **Phase 4 (Extraktion)**: Automatische Generierung eines einzeiligen, prägnanten Betreffs aus dem fertigen Text.
- **Final Output**: Die KI MUST am Ende das vollständige JSON-Paket für den Re-Import in NEO bereitstellen.

### FR-005: Instant Schema Validation
- **Logik**: Der Data-Editor MUST eingefügte JSON-Pakete in Echtzeit gegen das NEO-Schema validieren.

## Success Criteria *(mandatory)*
- **SC-001**: **The Blueprint Flow**: Ein Nutzer kann ohne Vorwissen durch den KI-Prompt einen vollständigen, validierten Briefinhalt im Dialog erzeugen.
- **SC-002**: **Performance Visibility**: In den Chrome DevTools (Performance Tab) sind die NEO-Timing-Marken (ZIP/API) sichtbar.

`n`n---`n`n# ?? Vanilla UI Hardening Addendum (from Awesome Tips)`n`n- **FR-011: CSS-Only Console Toggle**: Die Sichtbarkeit der Expert-Konsole MUST bevorzugt via CSS `:target` gesteuert werden, um die JavaScript-Logik für das UI-State-Management minimal zu halten.`n- **FR-012: Selection Purity**: Die gesamte Expert-Konsole MUST `user-select: none` nutzen, damit Log-Texte beim Markieren des Briefes niemals versehentlich mitkopiert werden.
`n`n---`n`n# ?? CSS-Only Modal Architecture (from Awesome CSS)`n`n- **FR-013: Expert-Mode Modal via :target**: Das Öffnen und Schließen der Expert-Konsole MUST bevorzugt via CSS `:target` Pseudo-Klasse gesteuert werden.`n    - **Trigger**: Der V-Tag Button (5-Klick) lst einen `window.location.hash = "#expert-console"` aus.`n    - **Visibility**: Das CSS `.expert-console:target { display: block; visibility: visible; }` reagiert sofort.`n    - **Benefit**: Keine JS-Status-Variablen fr "isModalOpen" nötig. Das UI reagiert rein auf die URL-URL-ID-Verschmelzung. Das ist unkaputtbar (robust).
`n`n---`n`n# ?? Popover API Upgrade (Expert Console)`n`n- **FR-014: Top-Layer Console**: Die Expert-Konsole MUST das native `popover` Attribut nutzen.`n- **JS Elimination**: Die Steuerung der Sichtbarkeit via JavaScript (Toggle-Funktionen) ist ERSATZLOS GESTRICHEN. Das Erscheinen wird rein über das `popovertarget` Attribut am V-Tag gesteuert.`n- **Top Layer Guarantee**: Da die Konsole im "Top Layer" des Browsers gerendert wird, kann sie niemals durch das fixierte DIN-Blatt oder andere Container verdeckt werden.
