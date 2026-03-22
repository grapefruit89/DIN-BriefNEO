---
id: SPEC-014
title: Digital Signature Overlay
tags: [specification, din-5008, platin]
status: cemented
weight: 70
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Digital Signature Overlay


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-SIGN]`
- **Source Pattern**: `[PAT-MV-02]` (Unterschriften-Positionierung) & `[PAT-NK-02]` (Base64).
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: Scan wird als Base64 im Profil gespeichert.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 70 
- **Fulfillment Target**: 100% (Transparenz & Positionierung)
- **Rationale**: Ersetzt den analogen Arbeitsschritt des Unterschreibens und macht den PDF-Versand nahtlos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unterschrift hochladen (P1)
Als Anwender möchte ich einen Scan meiner Unterschrift hochladen, damit ich Briefe digital versenden kann, die wie handunterschrieben aussehen.

**Acceptance Scenarios**:
1. **Given** der Profil-Bereich ist offen, **When** ich ein transparentes PNG wähle, **Then** wird dieses sicher im State gespeichert.

### User Story 2 - Perfekte Platzierung (P1)
Als Anwender möchte ich, dass die Unterschrift exakt über der Grußformel und dem getippten Namen "schwebt", ohne Text zu verdecken.

**Independent Test**: Unterschrift hochladen -> Druckvorschau öffnen -> Prüfung: Die Unterschrift muss leicht versetzt über dem Namen liegen (wie im echten Leben).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: PNG-Preferation**: Das System MUST den Upload von PNG-Dateien bevorzugen, um Transparenz (Alpha-Kanal) zu unterstützen.
- **FR-002: Base64 Storage**: Der Scan MUST als Base64-String im `profile.signatureData` gespeichert werden.
- **FR-003: Positioning Logic**: Die Unterschrift MUST absolut über dem Signaturbereich positioniert werden (via CSS/SVG).
- **FR-004: UX-Hint (RemoveBG)**: Das System MUST im Upload-Dialog einen hilfreichen Link/Kommentar zu Tools wie "Remove.bg" anzeigen, falls der Nutzer ein JPEG mit weißem Hintergrund hochlädt.
- **FR-005: Scale Control**: Das System MUST sicherstellen, dass die Unterschrift eine realistische Größe (max. 60mm Breite) nicht überschreitet.

## Success Criteria *(mandatory)*

- **SC-001**: **No Background**: Die Unterschrift darf den darunterliegenden Text nicht durch einen weißen Kasten verdecken (Transparenz-Garantie).
- **SC-002**: **Print Stability**: Die Unterschrift darf beim PDF-Export nicht verrutschen.

