# Feature Specification: Aviation Command Center (Keyboard & Shortcuts)

**Feature Branch**: `050-keyboard-shortcuts`  
**Created**: 2026-03-20  
**Status**: Draft  
**Source**: Inspired by dypsilon/frontend-dev-bookmarks [PAT-KY-01]
**Weighting**: 80/100 | **Criticality**: HIGH (Efficiency)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-KEYBOARD]`
- **Requirement**: Implementierung einer konsistenten Tastatur-Steuerung.
- **Principle Check**: **IV. VANILLA PURITY**: Nutzung der nativen KeyboardEvent API.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Rationale**: Ein Profi-Editor muss "blind" bedienbar sein. Mauswege müssen minimiert werden.

---

## ??? Requirements *(mandatory)*

### FR-001: Standard DIN-Shortcuts
- **Was**: Unterstützung der gängigen Tastenkombinationen.
- **Zement**:
    - `STRG + S`: Trigger SPEC-030 (Portable HTML Export).
    - `STRG + P`: Trigger SPEC-011 (Pre-Flight Export Engine).
    - `STRG + Z / Y`: Undo / Redo Logik (SPEC-012).
    - `STRG + B / I / U`: Fett, Kursiv, Unterstrichen.

### FR-002: Seamless Zone Navigation (TAB)
- **Logik**: Die `TAB`-Taste MUST den Fokus in der logischen DIN-Reihenfolge verschieben:
    - Absender (falls auf Blatt) -> Empfänger -> Betreff -> Anrede -> Body -> Grußformel -> Anlagen.
- **Reverse**: `SHIFT + TAB` MUST die Reihenfolge umkehren.

### FR-003: Physical Layout Independence
- **Technik**: Das System MUST bei Shortcuts die `KeyboardEvent.code` API nutzen (z.B. `KeyS` statt `s`).
- **Warum**: Damit Shortcuts auch auf anderen Tastatur-Layouts (z.B. US/AZERTY) zuverlässig funktionieren.

### FR-004: Special Character Quick-Input
- **Was**: Erleichterte Eingabe von DIN-Sonderzeichen.
- **Logik**: NEO bietet Shortcuts für:
    - `Mittelpunkt` ( · ): Für die Rücksendezeile (SPEC-006).
    - `Geschütztes Leerzeichen` (NBSP): Für Einheiten und Abkürzungen.

## Success Criteria *(mandatory)*
- **SC-001**: **No-Mouse Challenge**: Ein versierter Nutzer kann einen vollständigen Standard-Brief schreiben und als PDF speichern, ohne die Maus einmal zu berühren.
- **SC-002**: **Latency**: Die Reaktion auf einen Shortcut erfolgt in < 16ms (60fps Mandat).
