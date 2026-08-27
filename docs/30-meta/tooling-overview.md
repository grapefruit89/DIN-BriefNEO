---
id: tooling-overview
title: Tool-Inventur — tools/
status: active
type: reference
created: '2026-08-07'
updated: '2026-08-27'
tags:
- din-briefneo
- meta
- tooling
- agent
doc_links:
- '[[AGENTS]]'
- '[[tool-result-vocabulary]]'
code_links:
- 'tools/reconciliation.js'
- 'tools/build_db.js'
- 'tools/build_db.py'
- 'tools/create_context.js'
- 'tools/log_session.js'
- 'tools/add_wikilinks.py'
- 'tools/build_canvas.js'
- 'tools/test_text_fit_harness.js'
depends_on: []
supersedes: []
---

# Tool-Inventur — tools/

> **Ueberarbeitet 2026-08-27** (Lauf 2): Diese Version ersetzt den Stand vom
> 2026-08-07. Die alte Fassung listete `wiki_bundler.py` und
> `verify_compliance.py` als aktive Tools (beide liegen inzwischen in
> `tools/archive/`, siehe Abschnitt "tools/archive/" unten) und beschrieb
> fuer `create_context.js` ein Platzhalter-Template-Format
> (`{{ GENERATION_DATE }}` etc.), das nicht mehr dem tatsaechlichen
> Skriptverhalten entspricht — `create_context.js` buendelt heute schlicht
> die `CORE_FILES`-Liste ohne Platzhalter-Ersetzung. Diese Inventur
> beschreibt den Ist-Stand; das alte Template-Format ist nicht mehr gueltig.

Strukturierte Uebersicht aller Skripte in `tools/`: Zweck, Ein-/Ausgabe,
Abhaengigkeiten, Aufrufer, Risikoklasse. Herkunft: ChatGPT-Brainstorm
"Repo Struktur Refactoring", Antwort 5 (A2) — als Dokument nachgezogen,
weil sie fuer den kuenftigen MCP-Server (`agent/mcp/dinbrief-mcp/`)
Voraussetzung ist: Der Server muss wissen was jedes Tool tut, bevor er es
exponieren kann. Risikoklassen (READ/WRITE/DESTRUCTIVE) und
IDEMPOTENT/NON_IDEMPOTENT-Kennzeichnung folgen dem Vokabular aus
[[tool-result-vocabulary]].

## reconciliation.js

- **Zweck**: Fitness Gate. Prueft Metadata-Vollstaendigkeit (Schema V6),
  Link-Koharenz, Konformitaet gegen Antipattern-Regeln (`tools/antipatterns/`)
  und Feature-Checks. Liefert den Fitness Score.
- **Input**: `docs/**/*.md`, `website/**`, `tools/antipatterns/{base,web,project}.json`,
  `docs/30-meta/schema-v6.json`
- **Output**: Score-Objekt `{score, dimensions: {metadata, coherence, conformance, features}, success, logs, relations, rules}`,
  wird von `build_db.js` importiert (nicht nur ueber CLI aufgerufen)
- **Abhaengigkeiten**: keine externen npm-Pakete, reines Node core (`fs`, `path`, `child_process`)
- **Aufrufer**: `tools/build_db.js` (per `require('./reconciliation.js')`), `start.ps1` (Zeile 65, indirekt ueber build_db.js)
- **Risikoklasse**: READ (liest nur, schreibt nichts)
- **Idempotenz**: IDEMPOTENT (gleicher Repo-Zustand -> gleiches Ergebnis)
- **Safe-to-delete**: NEIN — zentrales Gate, von AGENTS.md als verbindlich vorausgesetzt

## build_db.js

- **Zweck**: Ruft `reconciliation.js` auf, erzeugt daraus `build/import.sql`
  (SQLite-Import-Statements fuer die Function Traceability Matrix) sowie
  `docs/10-architecture/Code-Referenzen.md`.
- **Input**: Ergebnis von `runReconciliation()`, `docs/**/*.md` Frontmatter (`code_links`)
- **Output**: `build/import.sql`, `docs/10-architecture/Code-Referenzen.md`
- **Abhaengigkeiten**: `tools/reconciliation.js` (intern), Node core
- **Aufrufer**: `start.ps1` (Zeile 65)
- **Risikoklasse**: WRITE (erzeugt/ueberschreibt generierte Artefakte, keine Quelldateien)
- **Idempotenz**: IDEMPOTENT (deterministische Neuerzeugung aus demselben Repo-Stand)
- **Safe-to-delete**: NEIN — Teil der Build-Pipeline

## build_db.py

- **Zweck**: Python-Gegenstueck zu build_db.js — baut die SQLite-Vektordatenbank
  (`DIN-Brief_docs.db`) mit Embeddings fuer semantische Suche ueber die Dokumentation.
- **Input**: `docs/**/*.md` (via `frontmatter`-Package geparst), Markdown-Rendering via `markdown-it`
- **Output**: `DIN-Brief_docs.db` (SQLite mit `sqlite_vec`-Erweiterung)
- **Abhaengigkeiten**: externe Python-Pakete `frontmatter`, `markdown-it` (`markdown_it`), `sqlite_vec`, `sentence_transformers` (PyTorch-basiert, schwergewichtig)
- **Aufrufer**: `start.ps1` (Zeile 85, mit Fallback auf System-Python falls keine `.venv/` existiert)
- **Risikoklasse**: WRITE (ueberschreibt `DIN-Brief_docs.db`)
- **Idempotenz**: NON_IDEMPOTENT (Embedding-Modelle koennen bei Versionswechsel leicht abweichende Vektoren liefern)
- **Safe-to-delete**: NEIN — einzige Quelle fuer semantische Doku-Suche

## create_context.js

- **Zweck**: Buendelt die wichtigsten Kern-Dokumente (`CORE_FILES`) zu einer
  einzigen `build/LLM_CONTEXT.md` fuer schnellen Kontextaufbau bei Sessionstart.
- **Input**: `README.md`, `docs/index.md`, `AGENTS.md`, `docs/00-foundation/{constitution,longevity-guidelines,Immutable-Law-Catalog,spec}.md`
- **Output**: `build/LLM_CONTEXT.md`
- **Abhaengigkeiten**: keine, reines Node core
- **Aufrufer**: `start.ps1` (Zeile 61)
- **Risikoklasse**: WRITE (nur generiertes Artefakt, kein Quellcode)
- **Idempotenz**: IDEMPOTENT
- **Safe-to-delete**: NEIN — Teil der Build-Pipeline, wird von AGENTS.md Light Mode Schritt 2 vorausgesetzt

## log_session.js

- **Zweck**: Protokolliert Agenten-Aktionen in `agent_session_logs`-Tabelle
  der SQLite-DB (`DIN-Brief_docs.db`). Freitext-basiert (`action_type` ist
  aktuell kein festes Vokabular — siehe [[tool-result-vocabulary]] fuer das Zielbild).
- **Input**: CLI-Argumente `--agent --action --file --desc`
- **Output**: neue Zeile in `agent_session_logs` (SQLite)
- **Abhaengigkeiten**: `node:sqlite` (Node 22.5+) mit Fallback auf npm-Paket `sqlite3`
- **Aufrufer**: manuell nach jeder relevanten Aenderung, laut AGENTS.md Paragraph 8 verbindlich
- **Risikoklasse**: WRITE (nur additiv, kein Ueberschreiben bestehender Zeilen)
- **Idempotenz**: NON_IDEMPOTENT (jeder Aufruf erzeugt einen neuen Log-Eintrag, auch bei identischen Argumenten)
- **Safe-to-delete**: NEIN — einzige Protokollierungspflicht laut Governance-Vertrag

## add_wikilinks.py

- **Zweck**: Findet unverlinkte Dokumentnennungen in `.md`-Dateien und wandelt
  sie automatisch in `[[Wikilinks]]` um. Ueberspringt Frontmatter, Codebloecke,
  bestehende Links.
- **Input**: `docs/**/*.md`
- **Output**: modifizierte `.md`-Dateien (mit `--dry-run`-Option zur Vorschau ohne Schreiben)
- **Abhaengigkeiten**: Python-Standardbibliothek
- **Aufrufer**: NICHT Teil von `start.ps1` oder `deploy.yml` — manuelles Wartungstool, nur bei Bedarf von Hand aufgerufen
- **Risikoklasse**: WRITE (aendert Quelldateien; hat aber einen Dry-Run-Modus)
- **Idempotenz**: IDEMPOTENT (bereits verlinkte Mentions werden uebersprungen)
- **Safe-to-delete**: Kandidat fuer spaeteren Review — nuetzlich, aber nicht in der Pipeline verankert; vor einer Loeschung pruefen ob es noch aktiv genutzt wird

## build_canvas.js

- **Zweck**: Erzeugt eine Obsidian-`.canvas`-Datei aus allen `.md`-Dateien
  im Projekt (ausserhalb von `website/`, `.git/`, `tools/`, `scratch/`, `node_modules/`),
  vermutlich zur visuellen Navigation der Dokumentation in Obsidian.
- **Input**: alle `.md`-Dateien im Repo (ausserhalb der ausgeschlossenen Ordner)
- **Output**: `.canvas`-Datei (Pfad im Skript zu verifizieren, nicht Teil dieser Inventur-Pruefung)
- **Abhaengigkeiten**: keine, reines Node core
- **Aufrufer**: NICHT Teil von `start.ps1` oder `deploy.yml` — manuelles Tool
- **Risikoklasse**: WRITE (schreibt eine generierte Datei)
- **Idempotenz**: IDEMPOTENT (deterministisch aus demselben Dateibestand)
- **Safe-to-delete**: Kandidat fuer spaeteren Review — Nutzen haengt davon ab, ob Obsidian-Canvas-Ansicht noch aktiv genutzt wird

## test_text_fit_harness.js

- **Zweck**: Empirischer Test-Harness fuer `TextFitEngine` und `UIProtections`
  (Textueberlauf-Handling im Editor). Simuliert Browser-APIs (`Range`, DOM-Mocks)
  ausserhalb eines echten Browsers.
- **Input**: keine externen Dateien, Testfaelle sind im Skript selbst definiert
- **Output**: Konsolen-Testergebnisse (Pass/Fail)
- **Abhaengigkeiten**: keine, reines Node core mit selbstgebauten Mocks
- **Aufrufer**: NICHT Teil von `start.ps1` oder `deploy.yml` — manuell bei Aenderungen an `48-text-fit.js` auszufuehren
- **Risikoklasse**: READ (fuehrt nur Tests aus, schreibt nichts)
- **Idempotenz**: IDEMPOTENT
- **Safe-to-delete**: NEIN — einziger automatisierter Test fuer eine funktional komplexe Komponente (Textumbruch-Erkennung)

## tools/archive/ (nicht einzeln inventarisiert)

Enthaelt abgeloeste Einmal-Skripte (`inject_yaml.js`, `migrate_and_scrub*.py`,
`migrate_frontmatter.py`, `packer.js`, `validate_foundation_frontmatter.py`,
`verify_compliance*.py`, `wiki_bundler.py`, `fix_frontmatter_oneoff.py`,
`antipatterns.json`). Diese sind bewusst nicht Teil der aktiven Tool-Inventur,
da sie historische Migrationen dokumentieren, keine wiederkehrende Funktion
erfuellen und laut Namenskonvention (`archive/`) als abgeschlossen gelten.
Vor einer endgueltigen Loeschung: pruefen ob eine der Migrationen bei einem
kuenftigen Schema-Wechsel als Vorlage dienen koennte.

## Zusammenfassung: Pipeline-Reihenfolge (start.ps1)

1. `tools/create_context.js` (Zeile 61)
2. `tools/build_db.js` (Zeile 65) — ruft intern `tools/reconciliation.js` auf
3. `tools/build_db.py` (Zeile 85)

Alle drei laufen bei **jedem** `start.ps1`-Aufruf komplett durch — das ist der
in Antwort 5 des ChatGPT-Brainstorms als "Agenten-Infrastruktur entschlacken"
bezeichnete, bislang nicht angegangene Punkt (siehe `repository.yaml`,
Abschnitt `open_items`).

## Fitness Gate

Nach jeder Aenderung: `.\start.ps1` muss **100% Evolutionary Fitness Score**
liefern. Kein Merge ohne gruenes Gate (aus der vorherigen Fassung dieses
Dokuments uebernommen — weiterhin gueltig, siehe AGENTS.md Paragraph 2).
