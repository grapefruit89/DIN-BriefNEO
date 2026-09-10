---
id: tooling-overview
title: Tool-Inventur — tools/
status: active
type: reference
created: '2026-08-07'
updated: '2026-09-10'
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
- 'tools/pipeline-cache.ps1'
- 'tools/log_session.js'
- 'tools/test_text_fit_harness.js'
depends_on: []
supersedes: []
---

# Tool-Inventur — tools/

> **Ueberarbeitet 2026-09-10** (Lauf 3): `tools/archive/`, `add_wikilinks.py`
> und `build_canvas.js` wurden geloescht (Git-History haelt sie); die
> zugehoerigen Abschnitte sind entfallen. Vorheriger Stand (Lauf 2,
> 2026-08-27) ersetzte eine Fassung, die `wiki_bundler.py` und
> `verify_compliance.py` als aktive Tools listete (Archivmaterial,
> inzwischen ebenfalls geloescht). Diese Inventur
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
- **Aufrufer**: `tools/build_db.js` (per `require('./reconciliation.js')`), `scripts/start.ps1` (Zeile 89, indirekt ueber build_db.js, ungecacht -- Fitness Gate laeuft immer)
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
- **Aufrufer**: `scripts/start.ps1` (Zeile 89, ungecacht -- Fitness Gate laeuft immer)
- **Risikoklasse**: WRITE (erzeugt/ueberschreibt generierte Artefakte, keine Quelldateien)
- **Idempotenz**: IDEMPOTENT (deterministische Neuerzeugung aus demselben Repo-Stand)
- **Safe-to-delete**: NEIN — Teil der Build-Pipeline

## build_db.py

- **Zweck**: Python-Gegenstueck zu build_db.js — baut die SQLite-Vektordatenbank
  (`DIN-Brief_docs.db`) mit Embeddings fuer semantische Suche ueber die Dokumentation.
- **Input**: `docs/**/*.md` (via `frontmatter`-Package geparst), Markdown-Rendering via `markdown-it`
- **Output**: `DIN-Brief_docs.db` (SQLite mit `sqlite_vec`-Erweiterung)
- **Abhaengigkeiten**: externe Python-Pakete `frontmatter`, `markdown-it` (`markdown_it`), `sqlite_vec`, `sentence_transformers` (PyTorch-basiert, schwergewichtig)
- **Aufrufer**: `scripts/start.ps1` (Zeile 116, mit Fallback auf System-Python falls keine `.venv/` existiert; gecacht ueber `tools/pipeline-cache.ps1`, laeuft nur bei geaenderten Inputs in `docs/` oder `website/`)
- **Risikoklasse**: WRITE (ueberschreibt `DIN-Brief_docs.db`)
- **Idempotenz**: NON_IDEMPOTENT (Embedding-Modelle koennen bei Versionswechsel leicht abweichende Vektoren liefern)
- **Safe-to-delete**: NEIN — einzige Quelle fuer semantische Doku-Suche

## create_context.js

- **Zweck**: Buendelt die wichtigsten Kern-Dokumente (`CORE_FILES`) zu einer
  einzigen `build/LLM_CONTEXT.md` fuer schnellen Kontextaufbau bei Sessionstart.
- **Input**: `README.md`, `docs/index.md`, `AGENTS.md`, `docs/00-foundation/{constitution,longevity-guidelines,Immutable-Law-Catalog,spec}.md`
- **Output**: `build/LLM_CONTEXT.md`
- **Abhaengigkeiten**: keine, reines Node core
- **Aufrufer**: `scripts/start.ps1` (Zeile 80, gecacht ueber `tools/pipeline-cache.ps1`, laeuft nur bei geaenderten Inputs)
- **Risikoklasse**: WRITE (nur generiertes Artefakt, kein Quellcode)
- **Idempotenz**: IDEMPOTENT
- **Safe-to-delete**: NEIN — Teil der Build-Pipeline, wird von AGENTS.md Light Mode Schritt 2 vorausgesetzt

## pipeline-cache.ps1

- **Zweck**: Hash-basierte Skip-Logik fuer `scripts/start.ps1`. Berechnet SHA256 ueber
  die Inputs eines Pipeline-Schritts (`create_context.js`, `build_db.py`) und
  entscheidet anhand eines gespeicherten Vergleichswerts, ob der Schritt
  erneut laufen muss oder uebersprungen werden kann. `reconciliation.js`/
  `build_db.js` (Fitness Gate) ist davon bewusst ausgenommen -- laeuft immer.
- **Input**: Datei-/Verzeichnispfade des jeweiligen Pipeline-Schritts (von
  `scripts/start.ps1` uebergeben), bestehender Cache-Inhalt aus `agent/cache/pipeline-hashes.json`
- **Output**: `agent/cache/pipeline-hashes.json` (gitignored, da `agent/cache/`
  bereits in `.gitignore` steht) -- kein versioniertes Artefakt
- **Abhaengigkeiten**: keine, reines PowerShell Core (`System.Security.Cryptography.SHA256`)
- **Aufrufer**: `scripts/start.ps1` (dot-sourced vor den Pipeline-Schritten, Zeile 36)
- **Risikoklasse**: WRITE (schreibt nur die lokale, gitignorete Cache-Datei, keine Quell- oder Build-Artefakte)
- **Idempotenz**: IDEMPOTENT (gleicher Eingabe-Hash -> gleiches Skip/Run-Ergebnis)
- **Safe-to-delete**: NEIN -- Teil der aktiven Build-Pipeline seit Commit 753681c

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

## test_text_fit_harness.js

- **Zweck**: Empirischer Test-Harness fuer `TextFitEngine` und `UIProtections`
  (Textueberlauf-Handling im Editor). Simuliert Browser-APIs (`Range`, DOM-Mocks)
  ausserhalb eines echten Browsers.
- **Input**: keine externen Dateien, Testfaelle sind im Skript selbst definiert
- **Output**: Konsolen-Testergebnisse (Pass/Fail)
- **Abhaengigkeiten**: keine, reines Node core mit selbstgebauten Mocks
- **Aufrufer**: NICHT Teil von `scripts/start.ps1` oder `deploy.yml` — manuell bei Aenderungen an `48-text-fit.js` auszufuehren
- **Risikoklasse**: READ (fuehrt nur Tests aus, schreibt nichts)
- **Idempotenz**: IDEMPOTENT
- **Safe-to-delete**: NEIN — einziger automatisierter Test fuer eine funktional komplexe Komponente (Textumbruch-Erkennung)

## Zusammenfassung: Pipeline-Reihenfolge (scripts/start.ps1)

1. `tools/create_context.js` (Zeile 80) — **gecacht**: laeuft nur, wenn sich
   `README.md`, `docs/index.md`, `AGENTS.md` oder `docs/00-foundation/`
   seit dem letzten Lauf geaendert haben (SHA256-Hash-Vergleich, siehe
   `tools/pipeline-cache.ps1`).
2. `tools/build_db.js` (Zeile 89) — ruft intern `tools/reconciliation.js`
   auf. **Ungecacht, laeuft bei jedem Aufruf** — bewusst, weil dies der
   Fitness Gate ist und AGENTS.md Paragraph 2 den Score vor UND nach jeder
   Aenderung verlangt, ungecacht.
3. `tools/build_db.py` (Zeile 116) — **gecacht**: laeuft nur, wenn sich
   `docs/` oder `website/` seit dem letzten Lauf geaendert haben.

Seit Commit 753681c (Lauf 2, "scripts/start.ps1 Caching + repository.execute")
laufen Schritt 1 und 3 also nicht mehr bei jedem Aufruf komplett durch,
sondern nur bei tatsaechlich geaenderten Inputs. `-Force` erzwingt den
vollen Durchlauf ungeachtet der Caches. Der vormals hier dokumentierte
Punkt "laeuft immer komplett durch" (Antwort 5 des ChatGPT-Brainstorms,
"Agenten-Infrastruktur entschlacken") ist damit erledigt — der zugehoerige
`open_items`-Eintrag in `repository.yaml` wurde entsprechend aktualisiert.

## Fitness Gate

Nach jeder Aenderung: `.\scripts\start.ps1` muss **100% Evolutionary Fitness Score**
liefern. Kein Merge ohne gruenes Gate (aus der vorherigen Fassung dieses
Dokuments uebernommen — weiterhin gueltig, siehe AGENTS.md Paragraph 2).
