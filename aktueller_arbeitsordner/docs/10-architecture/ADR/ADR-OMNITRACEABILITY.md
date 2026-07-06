---
id: adr-omnitraceability
title: "ADR-OMNI: OmniTraceability System"
type: adr
status: accepted
chosen_option: "option-a"

decision_options:
  - id: "option-a"
    label: "Python-Based Matrix Generation & Strict Frontmatter V6"
    status: chosen
  - id: "option-b"
    label: "JavaScript-based Matrix Generation"
    status: rejected

doc_links:
  - "[[doc-function-traceability]]"
code_links:
  - "tools/build_db.py"
  - "tools/reconciliation.js"
depends_on: []
tags: 
  - adr
  - architecture
  - documentation
created: 2026-07-06
updated: 2026-07-06
---

# ADR-OMNI: OmniTraceability System

## 1. Context & Problem

**Nachvollziehbarkeit und Langlebigkeit**
- Das DIN-BriefNEO Projekt zielt darauf ab, maximale Langlebigkeit und Nachvollziehbarkeit zu garantieren.
- Bisherige Systeme wiesen Inkonsistenzen auf, da Dokumentations-Metadaten (wie Frontmatter) nicht standardisiert und maschinell auslesbar waren.
- Das Crawlen von `venv` und `node_modules` führte zu Build-Failures (Fitness Violations), da externe Dateien gescannt wurden.
- Die Function-Traceability Matrix wurde manuell gepflegt, was extrem fehleranfällig war.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Python & V6) | Strikte Nutzung des Schema V6 Frontmatters und Auslagerung der Matrix-Generierung in `build_db.py` (Zukunfts-Standard). | Erlaubt SQLite-Integration, saubere Trennung von Crawler-Ausnahmen, maschinenlesbar. | Erfordert Migration aller Alt-Dokumente. | Python-Abhängigkeit im Build-Prozess. | **Gewählt** |
| **Option B** (JS-Only) | Beibehalten von `build_db.js` als primärem Generator und lockere Frontmatter-Regeln. | Keine Migration nötig. | Schlechte Integration mit Vektor-DBs und LLMs, anfällig für manuelle Fehler. | Veraltet schnell, nicht zukunftssicher. | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Python-Based Matrix Generation & Strict Frontmatter V6) entschieden.**

### Begründung
- **Frontmatter Schema V6:** Jede Markdown-Datei in `docs/10-architecture/ADR` und `docs/20-implementation/Guides` muss nun standardisierte Felder wie `created`, `updated`, und `depends_on` enthalten. Dies bildet die Grundlage für den SQLite-Import und Obsidian Graph-Views.
- **Python-basierte Traceability Matrix:** Die Function-Traceability Matrix (`Function-Traceability.md`) wird nun vollautomatisiert durch `tools/build_db.py` generiert. Das Skript extrahiert `@adr` und `@guide` Metadaten aus dem Source Code und fügt sie zwischen die `<!-- BEGIN AUTOMATED MATRIX -->` Blöcke ein.
- **Crawler Exclusions:** Die JS-Tools (`reconciliation.js` und `build_db.js`) wurden aktualisiert, um zwingend virtuelle Umgebungen (`venv/`, `node_modules/`, `.agents/`, `.claude/`) zu ignorieren. Dies eliminiert False-Positives im *Evolutionary Fitness Score*.
- **Branchless Workflow:** Um den Overhead zu minimieren, arbeiten alle KI-Agenten streng auf dem `main`-Branch (Solo-Entwickler-Paradigma).

## 4. Consequences

### Positive Auswirkungen
- **100% SSoT (Single Source of Truth):** Code und Dokumentation sind nun bidirektional gekoppelt. 
- **Automatisierte Abhängigkeiten:** Durch `depends_on` und die Matrix ist immer klar, welcher Code von welcher Architektur-Entscheidung abhängig ist ("Source" und "Sink").
- **Sauberer Build-Prozess:** Keine fehlschlagenden CI-Pipelines durch Drittanbieter-Code in `venv`.

### Langfristige Auswirkungen
- **Zukunftssichere Vektorisierung:** Durch das strikte Schema V6 sind alle Markdown-Dateien optimal für RAG (Retrieval-Augmented Generation) und Vektor-Datenbanken (`sqlite-vec`) vorbereitet.

## 5. Phase 2: Semantik, Chunking & Bundling (Roadmap)

Um das OmniTraceability-System zukunftssicher und LLM-freundlich zu machen, wurden folgende architektonische Entscheidungen für **Phase 2** getroffen:

### 5.1 Robuster Markdown-Parser (`markdown-it-py`)
Die Regex-basierte Extraktion in `build_db.py` wird durch `markdown-it-py` (inkl. `markdown-it-wikilink` Plugin) ersetzt. Dies verhindert Parsing-Fehler und ermöglicht das verlässliche Extrahieren von Headings und Links.

### 5.2 Semantisches Chunking (`tbl_concept_chunks`)
Anstatt ganze Dokumente in die Vektor-Datenbank (`sqlite-vec`) zu laden, werden Dokumente an `##` Markdown-Headings aufgespalten (Chunking). Dies erhöht die Präzision der semantischen Suche drastisch.

### 5.3 Inkrementeller Build (`content_hash`)
`build_db.py` wird die Felder `updated` und (sofern eingeführt) `content_hash` auslesen. Unveränderte Dateien werden beim Build übersprungen, was die Performance beim Vektorisieren schützt.

### 5.4 Wiki Bundler / Context Pack Generator
Ein neues Skript `wiki_bundler.py` wird eingeführt. 
- **Zweck:** Es aggregiert den Architektur-Kontext für KI-Agenten in ein einziges, riesiges Artefakt (`Wiki-Bundle-Template.md`).
- **Parameterisierung:** Das Skript kann Parameter annehmen (z.B. `--scope Geoapify`), um einen *Context Pack* zu generieren, der nur die exakt relevanten ADRs, Guides und Code-Snippets für dieses spezifische Feature bündelt.

## 6. Implementation & Verification
- `tools/migrate_frontmatter.py` wurde erfolgreich angewandt, um Altlasten sicher in Schema V6 zu überführen.
- `start.ps1` garantiert durch die Reality Reconciliation einen *Evolutionary Fitness Score* von 100%.
