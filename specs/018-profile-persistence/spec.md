---
id: SPEC-018
title: Profile Persistence
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Profile Persistence


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PROFILE]`
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: All profile data stays local. **II. HYBRID ARCHITECTURE**: Preserves fields even if hidden.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Ein Anwender darf seine Absenderdaten und Assets (Logo/Signatur) niemals doppelt eingeben müssen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Absender-Profil speichern (P1)
Als Anwender möchte ich meine persönlichen Daten (Name, Adresse, IBAN) einmalig eingeben, damit sie bei jedem neuen Brief automatisch ausgefüllt werden.

**Acceptance Scenarios**:
1. **Given** das Profil ist befüllt, **When** ich die Seite neu lade, **Then** sind Absendername und Adresse sofort wieder im Brief vorhanden.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Data Isolation**: Das System MUST das Profil-Objekt (`profile`) strikt vom Inhalts-Objekt (`content`) trennen.
- **FR-002: Multi-Asset Persistence**: Das Profil MUST Logos (SPEC-005) und digitale Unterschriften (SPEC-024) dauerhaft im `LocalStorage` halten.
- **FR-003: Validation Guard**: Die IBAN im Profil MUST in Echtzeit validiert werden (Mining from Claude).
- **FR-004: Master Reset**: Das System MUST eine Option bieten, NUR den Briefinhalt zu löschen, während das Profil (der Absender) erhalten bleibt.

### Data Schema (Ghost Data)
- **Field**: `profile.iban` | **Type**: `String` | **UI**: Control Center Modal (SPEC-049)
- **Field**: `profile.senderName` | **Type**: `String` | **UI**: Control Center Modal (SPEC-049)

## Success Criteria *(mandatory)*

- **SC-001**: **Persistence Fidelity**: 100% der Profildaten überleben Browser-Neustarts und Sitzungs-Wechsel.
- **SC-002**: **No Re-Entry**: Nach der Ersteinrichtung muss ein neuer Brief in weniger als 5 Sekunden (nur Betreff/Text tippen) versandfertig sein.

`n`n---`n`n# ?? HTML-Native Addendum`n`n- **FR-005: Native Accordions**: Falls das Profil in einem aufklappbaren Bereich dargestellt wird, MUST das HTML5 `<details>` Element genutzt werden.`n- **Exclusive Toggle**: Durch Nutzung des `name`-Attributs (z.B. `<details name="settings">`) MUST sichergestellt werden, dass sich andere Bereiche automatisch schließen (Aviation-Grade UI ohne JS).

