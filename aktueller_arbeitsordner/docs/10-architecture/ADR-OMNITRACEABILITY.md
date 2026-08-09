---
id: ADR-OMNITRACEABILITY
title: 'ADR-OMNI: OmniTraceability System'
type: adr
status: active
created: '2026-07-06'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/llm
doc_links:
  - Function-Traceability
  - constitution
  - README-DB
code_links:
  - tools/build_db.py
  - tools/reconciliation.js
  - tools/build_db.js
error_patterns:
  - omnitraceability
  - traceability
  - fitness
  - fitness score
  - build_db
  - reconciliation
  - schema v6
supersedes:
  - doc-omnitraceability
---

# ADR-OMNI: OmniTraceability System

Das OmniTraceability-System garantiert, dass Quellcode und Dokumentation niemals asynchron laufen. Es schlägt die Brücke zwischen `website/` und `docs/`, sodass jede logische Entität immer zweifelsfrei auf ihre architektonischen Entscheidungen (ADRs) und Implementierungs-Richtlinien (Guides) zurückgeführt werden kann.

## 1. Context & Problem

**Nachvollziehbarkeit und Langlebigkeit**

- Das DIN-BriefNEO Projekt zielt auf maximale Langlebigkeit und Nachvollziehbarkeit.

- Bisherige Systeme wiesen Inkonsistenzen auf, da Dokumentations-Metadaten nicht standardisiert und maschinell auslesbar waren.

- Das Crawlen von `venv` und `node_modules` führte zu Build-Failures (Fitness Violations).

- Die Function-Traceability Matrix wurde manuell gepflegt — extrem fehleranfällig.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Bewertung |
|--------|--------------|----------|-----------|---------|
| **Option A** (Python & V6) | Strikte Nutzung von Schema V6 + `build_db.py` für Matrix-Generierung. | SQLite-Integration, saubere Crawler-Ausnahmen, maschinenlesbar. | Python-Abhängigkeit im Build, Migration aller Alt-Dokumente nötig. | **Gewählt** |
| **Option B** (JS-Only) | `build_db.js` als primärer Generator, lockere Frontmatter-Regeln. | Keine Migration nötig. | Schlechte LLM-Integration, anfällig für manuelle Fehler, nicht zukunftssicher. | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Python-Based Matrix Generation & Strict Frontmatter V6) entschieden.**

### Begründung

- **Frontmatter Schema V6:** Jede Markdown-Datei in `docs/` muss standardisierte Felder enthalten (`created`, `updated`, `doc_links`, `code_links`). Grundlage für SQLite-Import und Obsidian Graph-Views.

- **Python-basierte Traceability Matrix:** `Function-Traceability.md` wird vollautomatisiert durch `tools/build_db.py` generiert. Das Skript extrahiert `@adr`- und `@guide`-Metadaten aus dem Source Code und fügt sie zwischen `<!-- BEGIN AUTOMATED MATRIX -->`-Blöcke ein.

- **Crawler Exclusions:** `reconciliation.js` und `build_db.js` ignorieren zwingend `venv/`, `node_modules/`, `.agents/`, `.claude/` — eliminiert False-Positives im Evolutionary Fitness Score.

- **Branchless Workflow:** Alle KI-Agenten arbeiten streng auf `main` (Solo-Entwickler-Paradigma).

## 4. Consequences

### Positive Auswirkungen

- **100% SSoT:** Code und Dokumentation sind bidirektional gekoppelt.

- **Automatisierte Abhängigkeiten:** `doc_links`/`code_links` und die Matrix machen immer klar, welcher Code von welcher Architektur-Entscheidung abhängt ("Source" und "Sink").

- **Sauberer Build-Prozess:** Keine fehlschlagenden Fitness Checks durch Drittanbieter-Code.

### Langfristige Auswirkungen

- **Zukunftssichere Vektorisierung:** Schema V6 bereitet alle Markdown-Dateien optimal für RAG und Vektor-Datenbanken (`sqlite-vec`) vor.

## 5. Phase 2: Semantik, Chunking & Bundling (Roadmap)

### 5.1 Robuster Markdown-Parser (`markdown-it-py`)

Regex-basierte Extraktion in `build_db.py` wird durch `markdown-it-py` (inkl. `markdown-it-wikilink` Plugin) ersetzt. Verhindert Parsing-Fehler, ermöglicht zuverlässige Extraktion von Headings und Links.

### 5.2 Semantisches Chunking (`tbl_concept_chunks`)

Dokumente werden an `##`-Headings aufgespalten statt als Ganzes geladen. Erhöht die Präzision der semantischen Suche in `sqlite-vec` drastisch.

### 5.3 Inkrementeller Build (`content_hash`)

`build_db.py` liest `updated`- und `content_hash`-Felder aus. Unveränderte Dateien werden beim Build übersprungen.

### 5.4 Wiki Bundler / Context Pack Generator

`wiki_bundler.py` aggregiert den Architektur-Kontext für KI-Agenten in ein einziges Artefakt. Mit `--scope`-Parameter für feature-spezifische Context Packs. Siehe [[tooling-overview]].

## 6. Betrieb & Wartung — How-To

Dieses System ist auf 3–5 Jahre Wartbarkeit ausgelegt. Aktiv am Quellcode verankert, nicht nur Freitext-Wiki.

### Szenario A: Neues Feature entwickeln

1. **Entscheidung fällen:** Erstelle ein neues ADR aus `docs/30-meta/ADR-TEMPLATE.md`.
2. **Code schreiben:** Erstelle die Code-Datei, z.B. `website/js/feature.js`.
3. **Traceability herstellen:** Setze in Zeile 1 den Header-Kommentar:
   ```javascript
   /* @adr [[ADR-NEUES-FEATURE]] */
   ```
4. **Build:** Führe `start.ps1` aus. Das Feature erscheint automatisch in der Matrix.

### Szenario B: Architektur verworfen (Refactoring)

1. **Code löschen:** Lösche oder überschreibe den nicht mehr benötigten Code in `website/`.
2. **ADR archivieren:** Ändere das Frontmatter auf `status: deprecated`.
3. **Kontext bewahren:** Füge unter "Consequences" kurz ein, warum das Konzept verworfen wurde. Das Wissen bleibt als Lektion erhalten.

### Szenario C: Globaler CSS-Bug behoben

1. **Kein neues ADR nötig:** Korrektur bestehender Logik ohne neue Architektur-Entscheidung — Code einfach schreiben. Die Verknüpfung bleibt bestehen.
2. **Matrix manuell annotieren:** Falls die Datei eine Ausnahme darstellt (z.B. externes Polyfill), unter "Manuelle Notizen" in [[Function-Traceability]] eintragen.

## 7. Relationales Architekturmodell (SQLite)

Das Frontmatter aller `docs/`-Dateien und die Header-Kommentare der `website/`-Dateien bilden ein klares SQL-Schema ab:

- **`tbl_concepts`:** Wird aus YAML-Frontmatter extrahiert (`id`, `title`, `type`, `status`).
- **`tbl_code_entities`:** Wird aus Dateien in `website/` extrahiert.
- **`tbl_concept_links`:** Mapping-Tabelle aus `doc_links`, `code_links` sowie `@adr`/`@guide` Code-Tags.

```sql
SELECT title FROM tbl_concepts WHERE type = 'adr' AND status = 'active';
```

Siehe [[README-DB]] für vollständiges Schema und Build-Befehle.

## 8. Implementation & Verification

- `tools/migrate_frontmatter.py` wurde erfolgreich angewandt, um Altlasten in Schema V6 zu überführen.

- `start.ps1` garantiert durch Reality Reconciliation einen Evolutionary Fitness Score von 100%.

- Kein Feature darf `main` erreichen, wenn seine Traceability-Kette gebrochen ist — das Fitness Gate blockiert den Release-Prozess automatisch.
