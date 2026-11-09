---
id: claude-context
title: CLAUDE.md — Einstieg für Claude & Claude Code
type: ai-context
status: active
created: '2026-08-07'
updated: '2026-11-09'
tags:
  - din-briefneo
  - meta
  - ai-context
  - claude
doc_links:
  - AGENTS
  - Immutable-Law-Catalog
code_links: []
depends_on: []
---

# CLAUDE.md

**DIN-BriefNEO** — browserbasierter Geschäftsbriefeditor nach **DIN 5008:2020-03**.  
Vanilla HTML/CSS/JS, keine Abhängigkeiten, kein Build-Schritt.  
Solo-Entwickler: Mo (@grapefruit89).

## Verbindlicher Leitfaden

Alle Verhaltensregeln, Workflows, Qualitäts-Gates und Architekturvorgaben sind zentral und verbindlich in **[[AGENTS]]** definiert.  
Alle Gesetze, Verbote und MUST-USE-Regeln sind in **[[Immutable-Law-Catalog]]** verankert.

## Start & Verifikation

```bash
tools/start.bat           # lokaler Webserver auf Port 8088 (Windows)
./tools/start.sh          # lokaler Webserver auf Port 8088 (Linux)
npm test                  # Headless Chrome Unit-Tests & Korpus-Gate
node tools/build_db.js    # SSoT-Build & Fitness Gate (muss 100.0% clean melden)
```
