---
id: tooling-overview
title: 'Build-Tooling — Skripte & Context-Pack Template'
type: guide
status: active
created: '2026-08-07'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/guide
  - tech/llm
doc_links:
  - README-DB
  - OmniTraceability
  - HYBRID-SPEC-DRIVEN-WORKFLOW
code_links:
  - 'tools/wiki_bundler.py'
  - 'tools/create_context.js'
  - 'tools/build_db.js'
  - 'tools/add_wikilinks.py'
  - 'tools/verify_compliance.py'
error_patterns:
  - tooling
  - build
  - skripte
  - wiki bundler
  - context pack
  - wiki_bundler
  - llm context
  - bundle
  - add_wikilinks
supersedes: []
---

# Build-Tooling — Skripte & Context-Pack Template

Alle ausführbaren Build-Skripte liegen in `tools/`. Datenbankarchitektur (SQLite, FTS5, MCP): → [[README-DB]] in `20-implementation/`.

## Skripte in `tools/`

| Skript | Zweck |
|---|---|
| `build_db.js` / `build_db.py` | Kompiliert Markdown → SQLite (`DIN-Brief_docs.db`) |
| `wiki_bundler.py` | Bündelt Docs zu einem LLM-Kontext-Pack |
| `add_wikilinks.py` | Ergänzt `[[Wikilinks]]` automatisch im Fließtext |
| `verify_compliance.py` | Fitness-Check (Metadata / Coherence / Conformance / Features) |
| `log_session.js` | Session-Logging für Audit-Trail |
| `reconciliation.js` | Antipattern-Abgleich |
| `create_context.js` | Context-Bundle-Generierung |
| `inject_yaml.js` | YAML-Frontmatter-Injektion |

## Wiki Bundler — Context Pack Template

`tools/wiki_bundler.py` / `tools/create_context.js` erzeugen ein LLM-Kontext-Pack: ein kompaktes Dokument das ADRs, Guides und Code-Referenzen für einen bestimmten Scope bündelt. Scope-Optionen: `"Full Project"`, `"Feature: Geoapify"`, `"Feature: TextFit"` etc.

### Generiertes Template-Format

```markdown
> **Generiert am:** {{ GENERATION_DATE }}
> **Scope:** {{ BUNDLE_SCOPE }}

## System Prompt (LLM Anweisungen)

Du bist ein KI-Agent im Projekt DIN-Brief Neo.
Dieses Dokument enthält den gebündelten Architektur- und Implementierungskontext.

**Wichtigste Regeln:**
1. Beachte AGENTS.md (Branchless Workflow, 100% Fitness Score, Logging).
2. KISS-Prinzip.
3. Header-Tags in Quellcode: /* @adr [[ADR-Name]] {FunctionName} */

## OmniTraceability Matrix (Auszug)

{{ TRACEABILITY_MATRIX_CONTENT }}

## Architektur-Entscheidungen (ADRs)

{{ ADR_CONTENT_CHUNKS }}

## Implementierungs-Guides

{{ GUIDE_CONTENT_CHUNKS }}

## Code Snippets & Referenzen

{{ RELEVANT_CODE_SNIPPETS }}
```

## Fitness Gate

Nach jeder Änderung: `.\start.ps1` muss **100% Evolutionary Fitness Score** liefern. Kein Merge ohne grünes Gate.
