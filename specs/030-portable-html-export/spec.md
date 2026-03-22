---
id: SPEC-030
title: Portable HTML State Export
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Portable HTML State Export


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-PORTABLE]`
- **Anti-Pattern Check**: Verhindert hässliche, überlange URLs (Rejected SPEC-025).
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: The exported file is self-contained and works locally.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Verlustfreie Datenübertragung)
- **Rationale**: Ermöglicht das Speichern von "echten" Dateien auf der Festplatte, die man wie Dokumente verwalten kann.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: JSON Wrapping**: Das System MUST alle relevanten State-Daten (Content, Profile, Config) in ein JSON-Objekt serialisieren.
- **FR-002: Portable HTML Wrapper**: Beim Klick auf "Speichern" MUST das System eine kleine HTML-Datei zum Download anbieten.
- **FR-003: Embedded Data**: Diese Datei MUST das JSON-Objekt in einem `<script>`-Block enthalten.
- **FR-004: Re-Opening Logic**: Beim Öffnen der exportierten HTML-Datei MUST diese automatisch die Haupt-App (NEO) aufrufen und die Daten via `postMessage` oder ein ähnliches sicheres Verfahren übergeben.
- **FR-005: Offline-Safety**: Der Export MUST auch funktionieren, wenn der Nutzer offline ist (Base64-kodierter Download).

## Success Criteria *(mandatory)*

- **SC-001**: **Clean URL**: Die URL im Browser bleibt sauber und übersichtlich (kein Daten-Müll in der Adresszeile).
- **SC-002**: **Portability**: Eine gespeicherte Brief-Datei kann per E-Mail verschickt und vom Empfänger (sofern er Zugriff auf NEO hat) sofort editiert werden.

