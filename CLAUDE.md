---
id: claude-context
title: CLAUDE.md — Einstieg für Claude & Claude Code
type: ai-context
status: active
created: '2026-08-07'
updated: '2026-10-02'
tags:
- din-briefneo
- meta
- ai-context
- claude
doc_links:
- AGENTS
- Immutable-Law-Catalog
- glossary
code_links: []
depends_on: []
---

# CLAUDE.md

**DIN-BriefNEO** — browserbasierter Geschäftsbriefeditor nach **DIN 5008:2020-03**.
Vanilla HTML/CSS/JS, keine Abhängigkeiten, kein Build-Schritt.
Solo-Entwickler: Mo (@grapefruit89).

> [!important] Diese Datei enthält bewusst keine Regeln und keinen Projektstatus
> Bis 2026-10-02 standen hier eine eigene Verbotsliste, ein kompletter Dateibaum und
> Status-Snapshots. Alle drei waren falsch geworden:
>
> - Der Verbotsblock empfahl als `new Date()`-Ersatz ausgerechnet
>   `Temporal.Now.plainDateISO()` — **per A50 verboten**, weil ohne IANA-Zone. Die Kopie
>   wurde beim A50-Beschluss schlicht vergessen.
> - Er behauptete „Nur `oklch()` — immer", während **C1** eine Fallback-Kette erlaubt.
> - Der Dateibaum listete `44-sender-sync.js`, `48-text-fit.js`, `51-constants.js`,
>   `52-storage.js` und einen `ADR/`-Unterordner — alle längst entfernt.
> - Status-Stempel („76 % fertig, Stand 2026-04-01") veralten per Konstruktion; §5.4 in
>   [[AGENTS]] verbietet sie deshalb in Kontextdateien.
>
> Siehe [[DECISION-LOG]], Eintrag 2026-10-02.

## Lies zuerst

1. **[[AGENTS]]** — bindender Verhaltensvertrag: Workflow, Fitness Gate, Doku-Regeln (§5),
   Arbeitsweise (§7a).
2. **[[Immutable-Law-Catalog]]** — alle Verbote und MUST-USE, mit IDs. Höchste Instanz;
   bei Konflikt mit jeder anderen Datei gewinnt dieser Katalog.
3. **[[glossary]]** — kanonische Begriffe. Ein Sachverhalt, ein Wort.

Gesetze werden über ihre **ID** zitiert (`A52`, `H11`, `S1`) — nie über Abschnittsnummern
oder aus dem Gedächtnis.

## Orientierung

| Bereich | Inhalt |
| :--- | :--- |
| `website/` | Produktionscode. `index.html`, `css/` (9 Dateien, `@layer`), `js/` (flach, Domäne im Zehner-Präfix), `data/` (`.json.gz`) |
| `docs/00-foundation/` | Verfassungsebene: Catalog, [[constitution]], [[longevity-guidelines]], [[spec]] |
| `docs/10-architecture/` | [[IMR-Registry]] (SSoT für die 45 Atome) und die thematischen ADRs |
| `docs/20-implementation/` | Guides und [[glossary]] |
| `docs/30-meta/` | [[DECISION-LOG]] (append-only), [[BACKLOG]], Arbeitsweise, Tooling |
| `docs/90-archive/` | eingefrorene Einmal-Artefakte, `status: archived` |
| `tools/` | Fitness Gate und Build. Node nur in der Entwicklung, nie im Produkt (T5) |

Die **lebende** Strukturquelle ist die generierte Datenbank aus `node tools/build_db.js`,
nicht ein Baum in einer Markdown-Datei.

## Start

```bash
start.bat                 # lokaler Webserver auf Port 8088 (einziger Laufzeitkontext)
node tools/build_db.js    # Fitness Gate — muss 100 % melden, vor und nach jeder Änderung
```

Protokollpflicht nach jeder Änderung: `node tools/log_session.js` (siehe [[AGENTS]] §8).
