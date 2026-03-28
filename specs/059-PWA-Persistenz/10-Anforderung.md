---
id: SPEC-059-ANF
title: PWA & Persistence Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: PWA & Persistence Logic

## 1. Domain-Spec
Etablierung einer "Zero-Loss" Datenhaltung. Transformation der Web-Instanz in eine installierbare, offline-fähige Desktop-Experience (Aviation Grade Reliability).

## 2. Functional Requirements (FR)

### FR-001: Passive Persistence (Auto-Save)
- **Doctrine:** Der Nutzer muss sich niemals um das Speichern kümmern (Zero-Action Save).
- **Triggers:**
  - `Event: blur` auf jedem Atom.
  - `Idle-Detection:` Speicherung nach 2s Inaktivität im Edit-Mode.
  - `Critical:` Persistierung vor Tab-Close (`beforeunload`).

### FR-002: Standalone-Compliance (PWA)
- **Execution:** Vollständige Installation als Desktop-App möglich.
- **UI-Isolation:** Start im "Standalone"-Modus (Zero Browser-Chrome, keine URL-Bar).
- **Offline-Integrity:** Kern-Assets (HTML/CSS/JS) MÜSSEN ohne Internetverbindung laden.

### FR-003: Recovery-Logic
- Bei Neustart MUSS der letzte persistierte State (IMR 4.0) ohne Nutzerinteraktion rehydriert werden.
