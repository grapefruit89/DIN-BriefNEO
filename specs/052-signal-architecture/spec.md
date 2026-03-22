---
id: SPEC-052
title: Aviation Signal & Event Architecture
tags: [architecture, events, signals, platin]
status: cemented
weight: 60
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Aviation Signal Architecture

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-SIG]`
- **Requirement**: Ein deterministisches, entkoppeltes Kommunikationssystem zwischen State und UI.
- **Rationale**: Direkte DOM-Manipulationen führen zu "Spaghetti-Code". Signale garantieren Vorhersehbarkeit.

---

## ??? Requirements *(mandatory)*

### FR-001: Custom Event Prefixing
- **Was**: Alle internen Events MUST mit `din:` gepräfxt sein.
- **Zement**: `din:state-update`, `din:ui-reset`, `din:print-start`.

### FR-002: Event Delegation Authority
- **Was**: Es gibt nur EINEN zentralen Listener auf dem `#brief-container`.
- **Logik**: Nutzung von `.closest('[data-field]')` zur Identifizierung der Quelle. Keine fragmentierten Listener auf Einzel-Inputs [ANTI-021].

### FR-003: Atomic Abort Protocol
- **Zement**: Jeder dynamisch hinzugefügte Listener MUST einen `AbortController` nutzen. Cleanup erfolgt atomar beim Modul-Unload.

## Success Criteria *(mandatory)*
- **SC-001**: **Zero Ghost Listeners**: Nach einem UI-Reset sind keine alten Event-Listener im Memory Profiler sichtbar.
