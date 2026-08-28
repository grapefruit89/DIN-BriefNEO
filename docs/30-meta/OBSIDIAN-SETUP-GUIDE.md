---
id: obsidian-setup-guide
title: 'Obsidian-taugliche Projektdokumentation — Setup-Guide'
type: guide
status: active
created: '2026-08-07'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/guide
  - status/active
  - type/guide
  - tech/obsidian
  - schema-v6
doc_links:
  - CLAUDE
  - AGENTS
code_links:
  - 'tools/add_wikilinks.py'
error_patterns:
  - obsidian
  - frontmatter
  - wikilink
  - schema v6
  - yaml
  - graph
  - doc_links
  - error_patterns
  - supersedes
  - vier anker
  - folder structure
supersedes: []
depends_on: []
---

# Obsidian-taugliche Projektdokumentation — Setup-Guide

> Dieses Dokument erklärt, wie man Markdown-Dateien Obsidian-kompatibel macht:
> **YAML-Frontmatter + `[[Wikilinks]]` = Wissensgraph**.
> Entwickelt als universelles Oneshot-Template für beliebige Software- und Dokumentations-Projekte.

---

## 0. Voraussetzungen & Ersteinrichtung

Bevor dieses Schema angewendet wird, muss das Projekt korrekt in Obsidian geöffnet sein:

1. **Obsidian installieren:** Von [obsidian.md](https://obsidian.md) herunterladen und installieren.
2. **Repository als Vault öffnen:** In Obsidian auf *"Open folder as vault"* klicken und den **Wurzelordner des Projekts** auswählen (nicht einen Unterordner).
3. **Wikilinks aktivieren:** Unter *Settings → Files & Links → Use `[[Wikilinks]]`* einschalten — **unbedingt vor dem ersten Schreiben von Links**, sonst fügt Obsidian normale Markdown-Links statt `[[Wikilinks]]` ein — erkennbar an eckigen gefolgt von runden Klammern.
4. **Attachment-Pfad festlegen:** Unter *Settings → Files & Links → Default location for new attachments* → `docs/assets/` setzen, damit eingefügte Bilder nicht den Root-Ordner verschmutzen.
5. **Ausschlüsse konfigurieren:** Unter *Settings → Files & Links → Excluded files* folgende Muster ausschließen, damit Build-Artefakte und Agent-Logs nicht in den Graph fließen:
   ```
   .agents/
   agent/cache/
   .git/
   .venv/
   build/
   node_modules/
   ```

---

## 1. Was Obsidian braucht

Obsidian baut seinen **Graphen** aus zwei Quellen:

| Quelle | Zweck | Beispiel |
|---|---|---|
| `[[Wikilinks]]` im Body-Text | Graph-Kanten (Verbindungen) | `Siehe [[ADR-ANTIPATTERN]]` |
| YAML-Frontmatter `doc_links` | Deklarierte Abhängigkeiten (maschinenlesbar) | `doc_links: [constitution, adr-css]` |
| YAML-Frontmatter `tags` | Cluster-Gruppen im Graphen | `tags: [projektname/adr, status/active]` |

**Faustregel:** `[[Wikilinks]]` im Body = sichtbare Kanten im Graph. Frontmatter-`doc_links` = maschinenlesbare Metadaten für KI-Agenten und SQL-Indexierer.

> ⚠️ **Wichtig:** `doc_links` speichert reine Dokument-IDs — **kein** `[[...]]`-Markup. Wikilink-Syntax in YAML-Metadaten bricht SQL-Joins und RAG-Pipelines. Die Graph-Kanten entstehen aus den `[[Wikilinks]]` im Body-Text.

---

## 2. YAML-Frontmatter — Schema V6

Jede `.md`-Datei beginnt mit einem YAML-Block zwischen `---`.

### 2.1 Minimal Schema (Pflicht für jede Datei)

```yaml
---
id: 'eindeutiger-kebab-case-bezeichner'   # Pflicht — maschinenlesbare ID
title: 'Menschenlesbarer Titel'           # Pflicht — Obsidian-Anzeige
type: adr | guide | reference | audit-report | ai-context | project-plan | meta | roadmap | changelog | spec
status: active | archived | draft | deprecated | superseded
created: '2026-08-07'                     # ISO 8601 Datum, in einfachen Anführungszeichen
updated: '2026-08-07'
tags:
  - <project-id>                          # Pflicht: mindestens Projekt-Tag
  - <project-id>/<topic>                  # Empfohlen: hierarchischer Untertag
---
```

> ⚠️ **YAML-Sonderzeichen:** Alle String-Werte mit Sonderzeichen (`:`, `|`, `#`, `—`) **müssen** in einfachen Anführungszeichen stehen. `title: ADR: Titel` bricht den Parser — korrekt: `title: 'ADR: Titel'`.

> ⚠️ **Encoding:** Dateien müssen als **UTF-8 ohne BOM** gespeichert werden. Windows-Tools erzeugen manchmal `UTF-8 BOM` (`﻿`), wodurch Obsidian das `---` nicht erkennt und das Frontmatter ignoriert.

### 2.2 Extended Schema (optional für Hub-Dokumente)

Für ADRs, Registries, Verfassungs-Dokumente und zentrale Guides:

```yaml
doc_links:                     # Verwandte Dokumente — reine IDs, KEIN [[...]]-Markup
  - constitution
  - adr-antipattern
code_links:                    # Verwandte Code-Dateien — relative Pfade vom Projekt-Root
  - 'tools/add_wikilinks.py'
supersedes:                    # Ersetzte ältere Dokumente — reine IDs
  - adr-migration-legacy
error_patterns:                # KI-Suchbarkeit — YAML-Array, nicht Pipe-String
  - schlüsselwort
  - synonym
  - fachbegriff
```

### 2.3 Welcher `type` für welche Datei?

| Datei-Inhalt | `type` |
|---|---|
| Architektur-Entscheidung | `adr` |
| Anleitung / How-To | `guide` |
| Referenz / Katalog | `reference` |
| Audit-Bericht / Report | `audit-report` |
| KI-Kontext (CLAUDE.md, AGENTS.md) | `ai-context` |
| Projektplan / Meilensteine | `project-plan` |
| Meta-Dokument (README) | `meta` |
| Zukunfts-Ideen (unverbindlich) | `roadmap` |
| Versionshistorie | `changelog` |
| Technische Spezifikation | `spec` |

### 2.4 `error_patterns` — KI-Suchbarkeit

Das `error_patterns`-Feld enthält Keywords, mit denen ein KI-Agent dieses Dokument findet — *bevor* er den Inhalt liest. Denkweise: "Welche Begriffe würde jemand benutzen, wenn er ein Problem hat, das dieses Dokument löst?"

> ⚠️ **Wichtig:** `error_patterns` ist **kein** Obsidian-Standardfeld — Obsidian kennt es nicht und zeigt es nur als generisches Metadaten-Feld an. Es ist ausschließlich für KI-Agenten und SQL-Indexierer gedacht (z. B. `build_db.py`).

```yaml
# Beispiele für Hub-Dokumente (domänen-agnostisch):

# ADR-0001-architecture-overview.md
error_patterns:
  - architecture
  - overview
  - system design
  - decision

# component-registry.md
error_patterns:
  - component
  - registry
  - api
  - module

# law-catalog.md
error_patterns:
  - forbidden
  - must-use
  - invariant
  - rule
  - policy
```

Nicht jedes Dokument braucht `error_patterns` — primär **Hub-Dokumente** (ADRs, Registry, Verfassung) sowie zentrale Setup-Guides wie dieser.

### 2.5 `supersedes` — Dokumenten-Lineage

Wenn ein neues Dokument ein altes ersetzt, wird das maschinenlesbar verknüpft. Das alte Dokument bekommt `status: superseded` und bleibt stehen — **niemals löschen, nur superseden**:

```yaml
# Neues Dokument:
supersedes:
  - adr-migration-legacy

# Altes Dokument (adr-migration-legacy.md):
status: superseded
# Im Body ergänzen: "Superseded by [[neues-adr]] (2026-08-07)"
```

---

## 3. `[[Wikilinks]]` — Die drei Patterns

### Pattern 1 — Einfacher Link (empfohlen)
```markdown
Siehe [[constitution]] für die Projektverfassung.
```
→ Obsidian zeigt den Dateinamen als Linktext, Kante im Graph.

### Pattern 2 — Link mit Display-Text
```markdown
Siehe [[constitution|Projekt-Verfassung]] für Details.
```
→ Anzeige: "Projekt-Verfassung", Ziel: `constitution.md`.

### Pattern 3 — Link mit Überschriften-Anker
```markdown
Siehe [[ADR-0002-technology-stack#Entscheidung]] für die Implementierung.
```
→ Springt direkt zur Überschrift im Zieldokument.

> ⚠️ **Anker-Risiko:** Wenn eine Überschrift umbenannt wird, bricht der Deep-Link lautlos. Für stabile Links kritischer Abschnitte stattdessen Block-IDs verwenden: `^block-id` am Ende eines Absatzes, dann `[[Dokument#^block-id]]`.

### Namenskonvention — Eindeutigkeit erzwingen

Obsidian löst `[[Dateiname]]` **ordnerübergreifend** auf. Wenn zwei Dateien in verschiedenen Ordnern denselben Namen haben (z. B. `README.md`), verlinkt Obsidian unvorhersehbar.

**Regel:** Jeder Markdown-Dateiname im Projekt muss **global eindeutig** sein. Vermeide generische Namen wie `notes.md`, `index.md`, `overview.md` in Unterordnern.

### Was NICHT verlinkt werden soll
- Inhalte in Code-Blöcken (` ``` ... ``` `)
- Inline-Code (`` `dateiname.md` ``)
- Externe URLs `[text](https://...)`
- Allgemeine Wörter die zufällig wie Dateinamen aussehen

---

## 4. Empfohlene Ordner-Struktur für den Graphen

Ein guter Obsidian-Graph entsteht wenn Dokumente **thematisch gruppiert** und **bidirektional verlinkt** sind.

### Das Vier-Anker-Prinzip

Die bewährteste Struktur folgt vier festen Ankern, die in *jedem* Projekt dieselbe Bedeutung haben:

| Ordner | Anker | Bedeutung | Inhalt |
|---|---|---|---|
| `00-foundation/` | `_0` Fundament | Wissen & Governance — niemals ausführbarer Code | Verfassung, Gesetze, Prinzipien |
| `10-architecture/` | `_1` Zugang | Einstieg & Entscheidungen | ADRs, Registry, Architektur-Überblick |
| `20–80-...` | `_2–_8` Freie Mitte | Projektspezifisch | Implementation, Meta, Tooling... |
| `90-policy/` | `_9` Leitplanken | Verbote & Invarianten | Workflows, Verbotslisten, Assertions |

Wer dieses Muster kennt, findet sich in jedem Repo sofort zurecht — `00` ist immer das Fundament, `90` immer die Regeln.

```
<project_root>/
├── CLAUDE.md              # KI-Kontext → verlinkt auf AGENTS, constitution
├── AGENTS.md              # KI-Kontext → verlinkt auf law-catalog, workflow-policy
├── README.md              # Haupt-Einstieg → verlinkt auf alle Hub-Dokumente
│
└── docs/
    ├── 00-foundation/     # ANKER _0: Governance — Wissen, kein ausführbarer Code
    │   ├── constitution.md         ← Hub: alle ADRs verlinken hierhin
    │   ├── law-catalog.md          ← Hub: Must-Use / Forbidden Regeln
    │   └── longevity-guidelines.md
    │
    ├── 10-architecture/   # ANKER _1: Architektur-Entscheidungen & Einstieg
    │   ├── component-registry.md   ← Hub: alle Komponenten/APIs
    │   └── ADR/
    │       ├── ADR-0001-architecture-overview.md
    │       ├── ADR-0002-technology-stack.md
    │       └── ...
    │
    ├── 20-implementation/ # FREIE MITTE: Implementation-Cluster
    │   ├── getting-started.md
    │   └── Guides/
    │
    ├── 30-meta/           # FREIE MITTE: Meta-Cluster
    │   ├── CHANGELOG.md
    │   ├── ROADMAP.md
    │   └── OBSIDIAN-SETUP-GUIDE.md  ← dieses Dokument
    │
    ├── 40-tooling/        # FREIE MITTE: Build & Tools
    │
    └── 90-policy/         # ANKER _9: Leitplanken
        ├── workflow-policy.md
        └── assertions/    # Invarianten-Code (siehe llm_boilerplate)
```

**Hub-Dokumente** (werden von vielen anderen verlinkt) bilden die großen Knoten im Graphen. Identifiziere sie früh und verlinke aktiv auf sie.

---

## 5. Automatisches Wikilink-Hinzufügen — `add_wikilinks.py`

### Voraussetzungen & Funktionsweise

- **Voraussetzung:** Python 3.8+ (nur Standardbibliothek — keine `pip`-Installationen nötig)
- **Suchbereich:** Scannt alle `.md`-Dateien in `docs/` und im Projektordner rekursiv
- **Logik:** Erstellt einen Index aller Dateinamen, ersetzt im Fließtext unverlinkte `dateiname.md`-Nennungen durch `[[dateiname]]`
- **Schützt automatisch:** YAML-Frontmatter, Code-Blöcke, Inline-Code, bestehende `[[links]]`, Markdown-Links

```bash
# Arbeitsverzeichnis wechseln (falls nötig)
cd aktueller_arbeitsordner

# Dry-Run: nur anzeigen was geändert würde
python tools/add_wikilinks.py

# Änderungen anwenden
python tools/add_wikilinks.py --apply
```

> ⚠️ **Windows CRLF:** Das Skript liest und schreibt mit `encoding="utf-8-sig"`, um BOM-Fehler zu vermeiden. Falls gemischte Zeilenumbrüche entstehen, eine `.gitattributes` mit `*.md text eol=lf` hinzufügen.

---

## 6. Tags für schöne Graph-Cluster

Tags gruppieren Dokumente im Graphen visuell. **Hierarchische Tags** (mit `/`) erlauben Untergruppen:

```yaml
tags:
  - <project-id>               # Root-Tag: alle Docs des Projekts, z.B. 'myproject'
  - <project-id>/adr           # Untergruppe: nur ADRs
  - <project-id>/guide         # Untergruppe: nur Guides
  - status/active              # Status-Tag (active, archived, draft, deprecated, superseded)
  - type/reference             # Typ-Tag
  - tech/typescript            # Technologie-Tag
  - standard/iso-27001         # Standard-Tag
```

In Obsidian → Graph View → Groups: Tags als Farb-Gruppen zuweisen.

> **Konsistenz-Regel:** Alle Tags in **lower-kebab-case**. Niemals gemischte Schreibweise (`#type/Reference` und `#type/reference` sind zwei verschiedene Tags).

---

## 7. Checkliste — Neue Datei Obsidian-ready machen

```
[ ] YAML-Frontmatter hinzugefügt (id, title, type, status, created, updated, tags, doc_links, code_links)
[ ] Alle String-Werte mit Sonderzeichen in einfachen Anführungszeichen
[ ] doc_links mit reinen IDs gefüllt (KEIN [[...]]-Markup)
[ ] Im Body-Text: Schlüsseldokumente mit [[Wikilinks]] verknüpft
[ ] Tags konsistent und hierarchisch (projektname/thema, status/active)
[ ] error_patterns befüllt (für Hub-Dokumente und zentrale Guides)
[ ] supersedes gesetzt falls dieses Dokument ein älteres ersetzt
[ ] Dateiname global eindeutig im gesamten Projekt
[ ] Datei in README.md oder DOCUMENTATION-MAP.md gelistet
[ ] add_wikilinks.py laufen lassen (Dry-Run → Apply)
[ ] Obsidian Graph View: Kanten zur neuen Datei sichtbar?
```

---

## 8. Obsidian-Einstellungen für optimalen Graph

> Diese Einstellungen sollten **vor dem ersten Schreiben** konfiguriert werden (siehe auch Abschnitt 0).

1. **Core Plugin: Graph View** → aktiviert (default)
2. **Core Plugin: Backlinks** → aktiviert — zeigt wer auf ein Dokument linkt
3. **Settings → Files & Links → Use `[[Wikilinks]]`** → eingeschaltet ← **kritisch, zuerst**
4. **Settings → Files & Links → Default location for new attachments** → `docs/assets/`
5. **Settings → Files & Links → Excluded files** → `.agents/, agent/cache/, .git/, .venv/, build/, node_modules/`
6. **Graph View → Filters:** `tag:#<project-id>` um nur Projektdocs zu sehen
7. **Graph View → Groups:** Tags als Farben zuweisen für thematische Cluster

---

*Erstellt: 2026-08-07 | Aktualisiert: 2026-08-07 | Universelles Obsidian Graph Documentation Template*
*Schema V6 — inspiriert vom Dezimal-Anker-Prinzip (00–90) | Review: Aviation Grade Platinum (Gemini Agent Team, 2026-08-07)*
