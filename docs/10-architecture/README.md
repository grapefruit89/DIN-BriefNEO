---
id: architecture-readme
title: '10-architecture — Architektur-Entscheidungen & Traceability'
type: meta
status: active
created: '2026-07-07'
updated: '2026-09-30'
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
depends_on: []
code_links: []
---

# 10-architecture — Architektur-Entscheidungen & Traceability

Anker `_1` im Dezimalrahmen — Einstieg in das Systemverständnis. Wer das Projekt verstehen will, beginnt hier.

## Hub-Dokumente (immer zuerst lesen)

- [[IMR-Registry]] ⭐⭐⭐ — Single Source of Truth: alle Custom Tags, Zonen
- [[Immutable-Law-Catalog]] ⭐⭐⭐ — alle Verbote und MUST-USE, vor jeder Änderung lesen
- [[ADR-ANTIPATTERN]] — aufgelöst 2026-10-02, nur noch Umschlüsselungstabelle `Abschnitt → Gesetz`
- [[ADR-OMNITRACEABILITY]] — Wie Code und Docs verknüpft sind (inkl. How-To, Compliance & bekannte Einschränkungen)
- [[Function-Traceability]] — Funktions-Traceability-Matrix (generiert durch `tools/build_db.py`, **nicht versioniert**)

## ADRs — Thematische Architektur-Entscheidungen

| ADR | Thema |
|---|---|
| [[ADR-HTML]] | HTML-Struktur, Custom Elements, IMR-Tags, WYSIWYG & Toolbars (integriert ehem. ADR-FEATURE) |
| [[ADR-CSS]] | CSS-Architektur: Container Queries, Falzmarken, Anchor Positioning, oklch (integriert ehem. ADR-BETREFF) |
| [[ADR-JS]] | JS-Architektur: Temporal, StorageManager, ES-Module |
| [[ADR-DATA-PERSISTENCE]] | localStorage-Sovereignty, StorageManager-Pflicht |
| [[ADR-TOAST-SYSTEM]] | Toast-System Architektur & Registry |
| [[ADR-OMNITRACEABILITY]] | Traceability-System & How-To |
| [[ADR-SENDER-SYNCHRONIZATION]] | Absender-Synchronisation |
| [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]] | Offline Address Intelligence (70,5 KB Brotli-Dictionary & Fallback-Architektur) |

## Historisch / Support

- Migrierte/archivierte Entscheidungen — siehe `docs/90-archive/`
- [[ADR-TEMPLATE]] — Template für neue ADRs (liegt in `30-meta/`)
- [[Code-Referenzen]] — Autogeneriert (Code ↔ ADR Verknüpfungen, `tools/build_db.js`, **nicht versioniert**)
