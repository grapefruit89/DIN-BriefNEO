---
id: tooling-overview
title: Tool-Inventur — tools/
status: active
type: reference
created: '2026-08-07'
updated: '2026-09-30'
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
- 'tools/docs_index.js'
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

- **Zweck**: OPTIONALER Vektor-Zweig (Phase 4), NICHT der kanonische Builder — baut die SQLite-Vektordatenbank mit Embeddings fuer semantische Suche ueber die Dokumentation.
- **Input**: `docs/**/*.md` (via `frontmatter`-Package geparst), Markdown-Rendering via `markdown-it`
- **Output**: SQLite mit `sqlite_vec`-Erweiterung
- **Abhaengigkeiten**: externe Python-Pakete `frontmatter`, `markdown-it` (`markdown_it`), `sqlite_vec`, `sentence_transformers` (PyTorch-basiert, schwergewichtig) — verlaesst die Zero-Dependency-Doktrin
- **Aufrufer**: `scripts/start.ps1` (Zeile 116, mit Fallback auf System-Python falls keine `.venv/` existiert; gecacht ueber `tools/pipeline-cache.ps1`, laeuft nur bei geaenderten Inputs in `docs/` oder `website/`)
- **Risikoklasse**: WRITE (ueberschreibt die Vektor-DB)
- **Idempotenz**: NON_IDEMPOTENT (Embedding-Modelle koennen bei Versionswechsel leicht abweichende Vektoren liefern)
- **Safe-to-delete**: NEIN — einzige Quelle fuer semantische Doku-Suche

## docs_index.js

- **Zweck**: EIN Builder fuer den Retrieval-Index — Datei-Inventar (`git ls-files`), Dokumente + Abschnitte (H1-H6, mit Zeilennummern) und FTS5-Volltext (`bm25`/`snippet`). Die Query-Schicht des MCP (`agent/mcp/dinbrief-mcp/docs.js`) re-exportiert dieses Modul.
- **Input**: `docs`-Korpus `.md` **plus Code** (`website/`, `tools/`, `agent/`; eine Section je Datei) + `git ls-files`
- **Output**: `agent/cache/docs_search.db` (abgeleitet, jederzeit neu baubar; gitignored)
- **Abhaengigkeiten**: Node core + `node:sqlite` (Zero-Dependency)
- **Aufrufer**: `tools/build_db.js` (baut den Index im Gate-Lauf mit), `agent/mcp/dinbrief-mcp` (`ensureFresh` bei Query)
- **Risikoklasse**: WRITE (nur in `agent/cache/`, keine Quelldateien)
- **Idempotenz**: IDEMPOTENT (deterministisch aus demselben Repo-Stand)
- **Safe-to-delete**: JA — reine Ableitung, wird beim naechsten Gate-Lauf neu gebaut

### docs_search.db — Technische Dokumentation

**Pfad:** `agent/cache/docs_search.db` (in `.gitignore`, regenerierbar)
**Bauen:** `node tools/docs_index.js` (wird von `build_db.js` im Gate-Lauf mitgebaut)
**Bausteine:** Node.js `node:sqlite` (DatabaseSync), FTS5 (SQLite-Erweiterung), `git ls-files`

---

#### Build-Prozess (tools/docs_index.js)

```
1. collectMarkdownFiles()  — Walkt das Repo, findet alle .md-Dateien (ignoriert website/, tools/, .git/, etc.)
2. collectTrackedFiles()   — git ls-files → {path, top, ext, size_bytes, lines}
3. createSchema()          — DROP + CREATE aller Tabellen + FTS5-Virtual-Tables + Indizes
4. Transaktion:
   a. files: alle tracked Dateien in files-Tabelle
   b. documents + sections: jede .md-Datei → Frontmatter parsen → in Abschnitte (H1-H6) zerlegen
   c. links: doc_links/code_links/depends_on aus Frontmatter + @adr/@guide-Annotationen im Code
   d. Code-Volltext: jede .js/.css/.html-Datei → EINE Section (Volltext durchsuchbar)
   e. sections_fts: INSERT INTO sections_fts(sections_fts) VALUES('rebuild') — External-Content-FTS
5. VACUUM — DB optimieren
```

**Staleness-Erkennung:** `indexIsStale()` vergleicht DB-mtime mit allen Quelldateien + files-Tabelle mit git ls-files. Nur bei Änderungen wird neu gebaut.

---

#### Schema

**Tabellen:**

| Tabelle | Zweck | Wichtige Spalten |
|---|---|---|
| `documents` | Dokument-Metadaten | `path` (UNIQUE), `title`, `status`, `tags`, `line_count`, `mtime_ms` |
| `sections` | Abschnitte (H1-H6) | `doc_id` (FK → documents), `level`, `heading`, `start_line`, `end_line`, `body` |
| `files` | Code-Dateien | `path` (PK), `top` (erste Zeile), `ext`, `size_bytes`, `lines` |
| `links` | Wikilinks + Code-Links | `from_path`, `kind`, `to_ref`, `to_path` |
| `sections_fts` | FTS5-Volltext (unicode61) | `heading`, `body` — Tokenizer: `unicode61 remove_diacritics 2` |
| `sections_fts_tri` | FTS5-Trigram-Suche | `heading`, `body` — Tokenizer: `trigram remove_diacritics 1` |

**Indizes:**
- `idx_sections_doc` auf `sections(doc_id)` — schnelle Abschnitts-Lookup pro Dokument
- `idx_files_top` auf `files(top)` — Gruppierung nach Top-Level-Verzeichnis
- `idx_links_from`, `idx_links_to`, `idx_links_ref` auf `links` — schnelle Link-Abfragen
- `idx_links_uniq` UNIQUE auf `links(from_path, kind, to_ref)` — verhindert Duplikate

**FTS5-Details:**
- `sections_fts`: External-Content-Tabelle (content='sections'). Wort-basierte Volltextsuche mit `bm25()`-Ranking und `snippet()`. Tokenizer: `unicode61 remove_diacritics 2` (sprachneutral, Umlaute bleiben).
- `sections_fts_tri`: Trigram-basierte Suche (3-Zeichen-Folgen). Gut für Teilstrings und Tippfehler. Wird nur als Fallback genutzt, wenn die Wort-Suche 0 Treffer liefert.

---

#### Query-Schicht (tools/docs_index.js)

**Funktionen:**

| Funktion | Zweck | Rückgabe |
|---|---|---|
| `search(query, opts)` | Zweistufige Volltextsuche: UND (alle Terme) → OR-Fallback → Trigram-Fallback | `{query, source, count, results: [{path, title, heading, start_line, snippet, match}]}` |
| `get({path, section})` | Dokument-Umriss (nur Überschriften) ODER genau ein Abschnitt | `{ok, path, title, outline}` oder `{ok, path, heading, body}` |
| `related(ref)` | Beziehungsgraph: ausgehende + eingehende Links | `{ref, outgoing: [{kind, to_ref, to_path}], incoming: [{from_path, kind, to_ref}]}` |
| `ensureFresh()` | Baut Index nur neu, wenn veraltet | `{rebuilt: boolean, ...}` |

**Query-Beispiele:**

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('agent/cache/docs_search.db');

// 1. Volltextsuche mit Ranking
const results = db.prepare(`
  SELECT d.path, d.title, snippet(sections_fts, 1, '<b>', '</b>', '…', 12) AS snippet
  FROM sections_fts
  JOIN documents d ON d.id = sections_fts.rowid
  WHERE sections_fts MATCH ?
  ORDER BY bm25(sections_fts)
  LIMIT 10
`).all('toast');

// 2. Trigram-Suche (Teilstring, Tippfehler-tolerant)
const fuzzy = db.prepare(`
  SELECT d.path, d.title
  FROM sections_fts_tri
  JOIN documents d ON d.id = sections_fts_tri.rowid
  WHERE sections_fts_tri MATCH ?
  LIMIT 10
`).all('"toast"');

// 3. Alle Abschnitte eines Dokuments
const sections = db.prepare(`
  SELECT level, heading, start_line, end_line
  FROM sections
  WHERE doc_id = (SELECT id FROM documents WHERE path = ?)
  ORDER BY start_line
`).all('docs/30-meta/DECISION-LOG.md');

// 4. Wikilinks von einem Dokument
const links = db.prepare(`
  SELECT kind, to_ref, to_path FROM links WHERE from_path = ?
`).all('docs/30-meta/DECISION-LOG.md');
```

**CLI-Bedienung:**
```bash
node tools/docs_index.js build                    # Neuen Index erzwingen
node tools/docs_index.js search "toast"           # Volltextsuche
node tools/docs_index.js get docs/30-meta/DECISION-LOG.md  # Dokument-Umriss
node tools/docs_index.js related ADR-JS           # Beziehungsgraph
```

**Verbesserungsideen für Agenten:**
- `documents.mtime_ms` könnte für Incremental-Updates genutzt werden (nur geänderte Dateien neu indizieren)
- `files.top` (erste Zeile) könnte für Code-Suche genutzt werden
- `links.to_path` ist oft NULL — könnte für Link-Checks verwendet werden
- `sections_fts_tri` könnte für Tippfehler-Korrektur genutzt werden (aktuell nur Fallback)

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

## Betriebs-Details — SQLite-Datenbanken

### 1. Session-Log-Schema (DIN-Brief_docs.db)

```sql
CREATE TABLE IF NOT EXISTS agent_session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT NOT NULL
);
```

- **Primary Key:** `id` (automatisch)
- **Defaults:** `timestamp` (aktuelle Zeit)
- **Constraints:** `NOT NULL` auf allen Spalten außer `id` und `timestamp`
- **Indizes:** Keine (append-only, keine Abfragen nach bestimmten Spalten)

### 2. Aufruf-Kontext (docs_search.db)

**Abfragestellen:**

| Stelle | Funktion | Zweck |
|---|---|---|
| `agent/mcp/dinbrief-mcp/index.js:534` | `docsSearch()` | Volltextsuche über docs/ |
| `agent/mcp/dinbrief-mcp/index.js:538` | `docsGet()` | Dokument-Umriss oder Abschnitt |
| `agent/mcp/dinbrief-mcp/index.js:542` | `docsRelated()` | Beziehungsgraph |
| `agent/mcp/dinbrief-mcp/docs.js:10` | `ensureIndex()` | Re-export von `ensureFresh()` |

**ensureFresh():** Wird **automatisch** bei jedem `docsSearch`/`docsGet`/`docsRelated`-Aufruf aufgerufen. Der Agent muss es **nicht** explizit tun.

**Logik:** `ensureFresh()` → `buildIndex({force: false})` → `indexIsStale()` → nur bei Änderungen neu gebaut.

### 3. Build-Lifecycle

**Automatischer Build:** `tools/build_db.js` (Fitness Gate) ruft `buildIndex({force: true})` auf. Läuft bei jedem `node tools/build_db.js`.

**Manueller Build:** `node tools/docs_index.js build`

**Kein git-Hook, kein npm-Script.** Der Build läuft nur über das Fitness Gate oder manuell.

**Wann sollte der Agent "build" neu laufen lassen?**
- Nach Änderungen an `docs/` oder `website/` (das Fitness Gate macht das automatisch)
- Wenn `ensureFresh()` meldet, dass der Index veraltet ist (passiert automatisch)

### 4. Nutzungs-Regel

**Keine dokumentierte Regel.** Sinnvolle Regel:

> **Nutze `docs_search.db` für:**
> - Volltextsuche über `docs/` (z.B. "wo ist X dokumentiert?")
> - Dokument-Umriss (nur Überschriften, kein ganzes Dokument)
> - Beziehungsgraph (welche Dokumente verlinken auf X?)
>
> **Nutze grep für:**
> - Codesuche (wo steht `--c-blatt-night`?)
> - Dateisuche (welche Dateien existieren?)
> - Struktursuche (welche Funktionen gibt es?)

### 5. Stale-Erkennung

**Mechanik:** `indexIsStale()` in `tools/docs_index.js:326-346`

```js
function indexIsStale(mdFiles, tracked = []) {
  if (!fs.existsSync(DB_PATH)) return true;  // DB fehlt
  const dbMtime = fs.statSync(DB_PATH).mtimeMs;
  // (a) irgendeine Quelldatei neuer als die DB?
  for (const f of mdFiles) {
    try { if (fs.statSync(f).mtimeMs > dbMtime) return true; } catch {}
  }
  for (const t of tracked) {
    try { if (fs.statSync(path.join(REPO_ROOT, t.path)).mtimeMs > dbMtime) return true; } catch {}
  }
  // (b) Datei-Set geändert (neu/gelöscht)?
  try {
    const db = new DatabaseSync(DB_PATH, { readOnly: true });
    const n = db.prepare('SELECT COUNT(*) c FROM files').get().c;
    const have = new Set(db.prepare('SELECT path FROM files').all().map((r) => r.path));
    db.close();
    if (n !== tracked.length) return true;
    for (const t of tracked) if (!have.has(t.path)) return true;
  } catch { return true; }
  return false;
}
```

**Mechanismen:**
- **mtime-Vergleich:** DB-mtime vs. Quelldateien-mtime
- **Datei-Set-Vergleich:** `files`-Tabelle vs. `git ls-files`

**ensureFresh():** **Full rebuild**, kein Incremental. Wenn `indexIsStale()` `true` zurückgibt, wird die komplette DB neu gebuilt (DROP + CREATE + INSERT + VACUUM).

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

### DIN-Brief_docs.db — Technische Dokumentation

**Pfad:** `agent/cache/DIN-Brief_docs.db` (in `.gitignore`, regenerierbar)
**Geschrieben von:** `tools/log_session.js` (append-only)
**Bausteine:** Node.js `node:sqlite` (DatabaseSync) mit Fallback auf npm-Paket `sqlite3`

---

#### Build-Prozess (tools/log_session.js)

```
1. CLI-Argumente parsen: --agent, --action, --file, --desc
2. agent/cache/ erstellen (falls nicht vorhanden)
3. Datenbank öffnen (oder erstellen)
4. CREATE TABLE IF NOT EXISTS agent_session_logs (id, timestamp, agent_name, action_type, file_path, description)
5. INSERT INTO agent_session_logs VALUES (...)
6. DB schließen
```

**Wichtig:** Die Tabelle wird nur beim ersten Aufruf erstellt. Danach nur noch INSERT (append-only).

---

#### Schema

**Tabelle:**

| Tabelle | Zweck | Wichtige Spalten |
|---|---|---|
| `agent_session_logs` | Session-Log | `id` (PK), `timestamp` (automatisch), `agent_name`, `action_type`, `file_path`, `description` |

**Indizes:** Keine (append-only, keine Abfragen nach bestimmten Spalten)

---

#### Query-Beispiele

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('agent/cache/DIN-Brief_docs.db');

// 1. Letzte 10 Sessions
const recent = db.prepare(`
  SELECT timestamp, agent_name, action_type, file_path
  FROM agent_session_logs
  ORDER BY timestamp DESC
  LIMIT 10
`).all();

// 2. Alle Aktionen an einer Datei
const fileHistory = db.prepare(`
  SELECT timestamp, agent_name, action_type, description
  FROM agent_session_logs
  WHERE file_path = ?
  ORDER BY timestamp DESC
`).all('website/js/32-toast.js');

// 3. Aktionstyp-Statistik
const stats = db.prepare(`
  SELECT action_type, COUNT(*) AS count
  FROM agent_session_logs
  GROUP BY action_type
  ORDER BY count DESC
`).all();
```

**CLI-Bedienung:**
```bash
node tools/log_session.js --agent "opencode" --action "refactor: ..." --file "website/js/32-toast.js" --desc "..."
```

**Verbesserungsideen für Agenten:**
- `action_type` könnte ein festes Vokabular erhalten (siehe [[tool-result-vocabulary]])
- `file_path` könnte normalisiert werden (relativ zum Repo-Root)
- Ein Index auf `file_path` würde Datei-Historien beschleunigen

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
