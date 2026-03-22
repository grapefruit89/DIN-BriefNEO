---
id: SPEC-032
title: Agent-Grade Quality Gates
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Agent-Grade Quality Gates


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-VALIDATION-GATE]`
- **Requirement**: Implementierung von professionellen Validierungs-Regeln vor dem Druck.
- **Rationale**: Ein Brief darf nur dann gedruckt/exportiert werden, wenn er 100% posttauglich ist.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Verhindert Porto-Verschwendung und Rückläufer durch ungültige Adress-Formate.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Strict Address Validation**:
    - **PLZ-Check**: MUST 5 Ziffern für deutsche Adressen erzwingen.
    - **Line Count**: Die Anschriftzone MUST maximal 6 Zeilen enthalten.
    - **Line Width**: Zeilen dürfen maximal ~55 Zeichen (bei 11pt) lang sein, um nicht aus dem Fenster zu ragen.
- **FR-002: Safety Margin (Einschreiben)**:
    - Das System MUST eine optionale "Einschreiben-Sicherheitsmarge" unterstützen, bei der die Adresse erst bei **66mm** (statt 62.7mm) beginnt, um Platz für API-Versand-Banner (z.B. LetterXpress) zu lassen.
- **FR-003: Return Address Length**:
    - Die Rücksendezeile MUST auf maximal 90 Zeichen begrenzt werden (Fensterbreite).
- **FR-004: Pre-Print Check**:
    - Der Druck-Button MUST erst aktiv werden (oder eine Warnung ausgeben), wenn alle Quality-Gates bestanden sind.

## Success Criteria *(mandatory)*

- **SC-001**: **Postal Compliance**: 100% der exportierten Briefe sind ohne Nachbearbeitung durch die Post (DL-Fensterumschlag) zustellbar.
- **SC-002**: **Validation Clarity**: Fehlermeldungen müssen exakt benennen, welche Zeile oder welches Feld die Norm verletzt.

`n`n---`n`n# ?? International Validation Addendum (Markup-First)`n`n- **FR-005: Context-Aware PLZ-Check**: Das System MUST die Validierung der Postleitzahl an das gewählte Zielland anpassen:`n    - **DE**: 5 Ziffern (`pattern="\d{5}"`)`n    - **AT / CH / LI / LU**: 4 Ziffern (`pattern="\d{4}"`)`n- **FR-006: Soft-Toast Validation**: Bei einer Verletzung der PLZ-Norm MUST ein "Soft-Toast" (SPEC-042) erscheinen:`n    - **Inhalt**: "Hinweis: Die PLZ scheint für [LAND] nicht korrekt zu sein. Bitte prüfen."`n    - **Verhalten**: Der Toast darf den Schreibfluss nicht blockieren (Non-modal).`n- **FR-007: Native API Usage**: Die Validierung MUST primär über die Browser-native **Constraint Validation API** erfolgen. JavaScript dient nur als Brücke zum Toast-System.
`n`n---`n`n# ?? Cross-Browser Quality Addendum`n`n- **FR-008: Interop Baseline Check**: Das System MUST vor dem Release gegen die "Baseline 2025" (Widely Available) von caniuse.com geprüft werden.`n- **FR-009: Purity Degradation**: Falls ein High-End Feature (z.B. Temporal) nicht vorhanden ist, MUST NEO eine funktionale Basis-Logik (Fallback) bereitstellen, die den Kernprozess (Brief schreiben & drucken) nicht behindert.
