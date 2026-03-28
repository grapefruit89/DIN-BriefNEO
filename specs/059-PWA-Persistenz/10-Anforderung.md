---
id: SPEC-059-ANF
title: PWA & Persistence Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: PWA & Persistence Logic

## 1. Domain-Spec
Etablierung einer "Zero-Loss" Datenhaltung. Transformation der Web-Instanz in eine installierbare, offline-fÃ¤hige Desktop-Experience (High-Integrity Reliability).

## 2. Functional Requirements (FR)

### FR-001: Passive Persistence (Auto-Save)
- **Doctrine:** Der Nutzer muss sich niemals um das Speichern kÃ¼mmern (Zero-Action Save).
- **Triggers:**
  - `Event: blur` auf jedem Atom.
  - `Idle-Detection:` Speicherung nach 2s InaktivitÃ¤t im Edit-Mode.
  - `Critical:` Persistierung vor Tab-Close (`beforeunload`).

### FR-002: Standalone-Compliance (PWA)
- **Execution:** VollstÃ¤ndige Installation als Desktop-App mÃ¶glich.
- **UI-Isolation:** Start im "Standalone"-Modus (Zero Browser-Chrome, keine URL-Bar).
- **Offline-Integrity:** Kern-Assets (HTML/CSS/JS) MÃœSSEN ohne Internetverbindung laden.

### FR-003: Recovery-Logic
- Bei Neustart MUSS der letzte persistierte State (IMR 4.0) ohne Nutzerinteraktion rehydriert werden.

