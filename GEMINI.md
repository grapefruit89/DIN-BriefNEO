---
id: gemini-context
title: GEMINI.md — Einstieg für Gemini & Gemini CLI
type: ai-context
status: active
created: '2026-07-01'
updated: '2026-10-02'
tags:
- din-briefneo
- meta
- ai-context
- gemini
doc_links:
- AGENTS
- Immutable-Law-Catalog
- glossary
code_links: []
depends_on: []
---

# GEMINI.md

> [!important] Diese Datei enthält bewusst keine Regeln
> Bis 2026-10-02 standen hier 28 nummerierte Regeln — eine dritte Fassung des
> Verbotskanons neben [[Immutable-Law-Catalog]] und `ADR-ANTIPATTERN`. Sie war in sich
> widersprüchlich (Regel 13 verlangte `.innerHTML`, Regel 15 verbot es; Regel 28 verlangte
> Radio-Toggles, die das ADR als Antipattern führte) und teilweise überholt.
>
> Alles Normative steht jetzt im Law Catalog, alles zur Arbeitsweise in [[AGENTS]].
> Siehe [[DECISION-LOG]], Eintrag 2026-10-02.

## Lies zuerst

1. **[[AGENTS]]** — der bindende Verhaltensvertrag. Enthält Workflow, Fitness Gate,
   Doku-Regeln (§5) und Arbeitsweise (§7a).
2. **[[Immutable-Law-Catalog]]** — alle Verbote und MUST-USE. Höchste Instanz.
3. **[[glossary]]** — die kanonischen Begriffe. Ein Sachverhalt, ein Wort.

## Wo das Fachwissen liegt

| Frage | Dokument |
| :--- | :--- |
| Was leistet das Produkt fachlich? | [[spec]] |
| Browser-Baseline, Langlebigkeitsprinzipien | [[longevity-guidelines]] |
| Welcher Laufzeitkontext gilt? | [[ADR-RUNTIME-CONTEXT]] |
| DIN-Geometrie, die 45 Atome, Zonen | [[IMR-Registry]] |
| HTML-Entscheidungen, `contenteditable`, Popover | [[ADR-HTML]] |
| CSS: Anchor Positioning, `@scope`, View Transitions | [[ADR-CSS]] |
| JS: Temporal, Selection/Range, StorageManager | [[ADR-JS]] |
| Speicherstrategie | [[ADR-DATA-PERSISTENCE]] |
| Absender-Synchronisation (Kernfeature) | [[ADR-SENDER-SYNCHRONIZATION]] |
| Anrede- und Grußformel-Logik | [[Salutation-Engine]] |
| Zero-Scroll-Techniken | [[no-scroll-techniques]] |
| Warum etwas so entschieden wurde | [[DECISION-LOG]] |
| Was als Nächstes ansteht | [[BACKLOG]] |

## Start

```bash
start.bat                 # lokaler Webserver auf Port 8088
node tools/build_db.js    # Fitness Gate — muss 100 % melden
```
