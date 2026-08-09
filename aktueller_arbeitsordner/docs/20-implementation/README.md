---
id: implementation-readme
title: '20-implementation — Praktische Anleitungen & How-Tos'
type: meta
status: active
created: '2026-07-07'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/meta
doc_links:
  - Salutation-Engine
  - glossary
  - testing-guide
error_patterns:
  - implementation
  - guide
  - anleitung
  - how-to
  - 20-implementation
supersedes: []
---

# 20-implementation — Praktische Anleitungen & How-Tos

Freie Mitte im Dezimalrahmen (`_2–_8`). Hier liegt das Implementierungswissen: Guides, Feature-Dokumentation, Glossar.

## Feature-Dokumentation

- [[Salutation-Engine]] — Anrede-Logik: Auto-Detection, Fallbacks, SPEC-002
- [[glossary]] — Projektbegriffe und Definitionen
- [[testing-guide]] — Test-Anleitung und -Strategie
- [[README-DB]] — LLM-First SQLite-Datenbank: Schema, FTS5, MCP-Anbindung, SQL-Views

## Technische Guides

| Guide | Thema |
|---|---|
| [[din-5008-css-architektur]] | DIN 5008 Layout-Philosophie + Chrome 148+ CSS-Feature-Referenz |
| [[geoapify-autocomplete]] | Adress-Autocomplete (Geoapify + Photon) |
| [[no-scroll-techniques]] | Zero-Scroll-Policy: Techniken und Patterns |
| [[toast-system]] | Toast-System v4 Implementation Guide |

## Forschung / Roadmap

- [[sqlite-vec]] — SQLite Vector Search (Hybrid FTS5 + Semantic Search, Implementierungsplan)

## Templates

- [[GUIDE-TEMPLATE]] — Template für neue How-To Guides (liegt in `30-meta/`)
