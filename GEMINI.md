---
id: gemini-context
title: GEMINI.md — Einstieg für Gemini & Gemini CLI
type: ai-context
status: active
created: '2026-07-01'
updated: '2026-11-09'
tags:
  - din-briefneo
  - meta
  - ai-context
  - gemini
doc_links:
  - AGENTS
  - Immutable-Law-Catalog
code_links: []
depends_on: []
---

# GEMINI.md

**DIN-BriefNEO** — browserbasierter Geschäftsbriefeditor nach **DIN 5008:2020-03**.  
Vanilla HTML/CSS/JS, keine Abhängigkeiten, kein Build-Schritt.

## Verbindlicher Leitfaden

Alle Verhaltensregeln, Workflows, Qualitäts-Gates und Architekturvorgaben sind zentral und verbindlich in **[[AGENTS]]** definiert.  
Alle Gesetze, Verbote und MUST-USE-Regeln sind in **[[Immutable-Law-Catalog]]** verankert.

## Start & Verifikation

```bash
start.bat                 # lokaler Webserver auf Port 8088 (Windows)
./start.sh                # lokaler Webserver auf Port 8088 (Linux)
npm test                  # Headless Chrome Unit-Tests & Korpus-Gate
node tools/build_db.js    # SSoT-Build & Fitness Gate (muss 100.0% clean melden)
```
