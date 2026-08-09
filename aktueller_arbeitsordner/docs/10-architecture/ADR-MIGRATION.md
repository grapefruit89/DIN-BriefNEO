---
id: adr-migration
title: 'ADR-MIGRATION — Extraktion zur llm_boilerplate'
type: adr
status: active
created: '2026-07-02'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-ANTIPATTERN
  - constitution
code_links:
  - tools/build_db.js
  - tools/log_session.js
  - tools/reconciliation.js
error_patterns:
  - migration
  - extraktion
  - llm boilerplate
  - generalisierung
  - base.json
  - project.json
supersedes: []
---

# ADR: Architektur für Extraktion zur llm_boilerplate

## Kontext

DIN-Brief Neo dient als Testballon für KI-gestützte Entwicklungsmuster, die später in einer generischen `llm_boilerplate` wiederverwendet werden sollen. Um dies zu ermöglichen, muss das Projekt strikt in generische und projektspezifische Bestandteile getrennt sein.

## Entscheidung

Wir haben uns für eine **geschichtete Architektur** entschieden, bei der Tools und Regeln physisch vom Website-Code separiert sind:

1. **Website-Code (`website/`)**: Enthält die reine Anwendung (DIN-Brief spezifisch). Wird nicht extrahiert.

2. **Tools (`tools/`)**: Enthält Node.js-Skripte wie `build_db.js`, `log_session.js` und `reconciliation.js`. Diese Skripte sind generisch und konfigurierbar.

3. **Antipatterns (`tools/antipatterns/`)**: Die KI-Regeln sind in Layer unterteilt:

   - `base.json`: Universelle Regeln (z.B. Temporal/Date API)

   - `project.json`: Nur DIN-Brief spezifisch

## Konsequenzen

Diese Architektur ist als "fait accompli" (bereits umgesetzt) zu betrachten.
Zukünftige KI-Regeln, die nicht ausschließlich DIN-Brief betreffen, **müssen zwingend** in `base.json` oder `web.json` eingetragen werden, damit sie automatisch in die `llm_boilerplate` übernommen werden können.
Regeln, die nur für DIN-Brief Neo gelten, kommen in `project.json`.