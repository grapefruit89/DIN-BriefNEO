---
id: SPEC-049
title: The Paper-First Control Center (Modal)
tags: [specification, ui, dialog, html5]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: The Paper-First Control Center (Modal)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-CONTROL]`
- **Anti-Pattern Check**: Verhindert das neue Anti-Pattern [ANTI-019] (Sidebar-Clutter).
- **Philosophy**: "What You See Is What You Get". Der Bildschirm gehört zu 100% dem Papier. Alles andere ist Peripherie.

---

## ??? Requirements *(mandatory)*

### FR-001: The Omnipotent Dialog
- **Was**: Sämtliche Einstellungen, die nicht direkt durch Tippen auf das Papier gelöst werden können, MUST in einem zentralen, nativen HTML5 `<dialog>` Element (Modal) ausgelagert werden.
- **Inhalt des Modals**:
    - **Profil (SPEC-018)**: Eingabe von Absender, IBAN, Logo.
    - **APIs (SPEC-038)**: Eingabe und Validierung der privaten API-Keys.
    - **Layout (SPEC-044)**: Der Umschalter zwischen Form A und Form B.
    - **Aktionen**: Buttons für "Drucken / PDF", "JSON Export", "Alles Löschen".

### FR-002: Native HTML5 Invoker (Zero-JS Open)
- **Logik**: Das Öffnen des Modals (z.B. über einen kleinen "Zahnrad"-Button am Bildschirmrand) MUST über die modernsten HTML-Attribute (z.B. `popovertarget` oder die Invoker API) gesteuert werden, um den JS-Overhead zu minimieren.

### FR-003: Pure Paper View (Zero Peripheral Distraction)
- **Regel**: Wenn das Modal geschlossen ist, MUST der Bildschirm ausschließlich das 210x297mm große DIN-Blatt (ggf. skaliert) und einen unauffälligen Zugangs-Button zum Control Center zeigen. Keine permanenten Sidebars, keine Menüleisten.

## Success Criteria *(mandatory)*
- **SC-001**: **Absolute Immersion**: Der Nutzer hat das Gefühl, ein echtes Blatt Papier auf dem Schreibtisch liegen zu haben.
- **SC-002**: **No-Sidebar Guarantee**: Keine Sidebar nimmt dem Papier in der Breite Platz weg.

