---
id: architecture-readme
title: '10-architecture — Architektur-Entscheidungen & Traceability'
type: meta
status: active
created: '2026-07-07'
updated: '2026-08-08'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/meta
doc_links:
  - IMR-Registry
  - ADR-ANTIPATTERN
  - constitution
error_patterns:
  - architektur
  - adr
  - 10-architecture
  - entscheidung
  - traceability
  - imr
  - registry
supersedes: []
---

# 10-architecture — Architektur-Entscheidungen & Traceability

Anker `_1` im Dezimalrahmen — Einstieg in das Systemverständnis. Wer das Projekt verstehen will, beginnt hier.

## Hub-Dokumente (immer zuerst lesen)

- [[IMR-Registry]] ⭐⭐⭐ — Single Source of Truth: alle Custom Tags, Zonen
- [[ADR-ANTIPATTERN]] ⭐⭐⭐ — Verbotsregister, vor jeder Änderung lesen
- [[Architecture-Compliance-Matrix]] — Welche ADR regiert welche Datei?
- [[ADR-OMNITRACEABILITY]] — Wie Code und Docs verknüpft sind (inkl. How-To)
- [[Function-Traceability]] — Funktions-Traceability-Matrix

## ADRs — Thematische Architektur-Entscheidungen

| ADR | Thema |
|---|---|
| [[ADR-HTML]] | HTML-Struktur, Custom Elements, IMR-Tags |
| [[ADR-CSS]] | CSS-Architektur: Anchor Positioning, @scope, oklch, @layer |
| [[ADR-JS]] | JS-Architektur: Temporal, StorageManager, ES-Module |
| [[ADR-API]] | Externe APIs: Geoapify, Photon |
| [[ADR-DATA-PERSISTENCE]] | localStorage-Sovereignty, StorageManager-Pflicht |
| [[ADR-FEATURE]] | Premium UX: Popover, WYSIWYG-Toolbar, Anchor Positioning |
| [[ADR-BETREFF]] | Betreff-Feld spezifisch |
| [[adr-toast-system]] | Toast-System Architektur & Registry |
| [[ADR-OMNITRACEABILITY]] | Traceability-System & How-To |
| [[ADR-005-Sender-Synchronization]] | Absender-Synchronisation |
| [[ADR-PROFILE-MANAGEMENT]] | Profil-Management-Lücke (Doku sagte ✅, Code hat es nicht) |

## Historisch / Support

- [[ADR-MIGRATION]] — Archivierte/migrierte Entscheidungen
- [[ADR-TEMPLATE]] — Template für neue ADRs (liegt in `30-meta/`)
- [[Code-Referenzen]] — Autogeneriert: Code ↔ ADR Verknüpfungen
