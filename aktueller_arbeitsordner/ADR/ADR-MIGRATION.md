---
title: ADR - Extraktion zur llm_boilerplate
status: accepted
tags:
  - adr
  - architecture
  - boilerplate
  - generalisierbarkeit
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
   - `web.json`: Allgemeine Web-Regeln (execCommand, XHR, innerHTML, etc.)
   - `project.json`: Nur DIN-Brief spezifisch

## Konsequenzen
Diese Architektur ist als "fait accompli" (bereits umgesetzt) zu betrachten.
Zukünftige KI-Regeln, die nicht ausschließlich DIN-Brief betreffen, **müssen zwingend** in `base.json` oder `web.json` eingetragen werden, damit sie automatisch in die `llm_boilerplate` übernommen werden können.
Regeln, die nur für DIN-Brief Neo gelten, kommen in `project.json`.
