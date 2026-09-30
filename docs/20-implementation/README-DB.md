---
id: readme-db
title: 'README-DB — Retrieval-Index (SQLite): Bedienung & Spezifikation'
type: reference
status: active
created: '2026-06-26'
updated: '2026-09-30'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/reference
  - tech/sqlite
  - tech/fts5
  - tech/mcp
doc_links:
  - Immutable-Law-Catalog
  - longevity-guidelines
  - ADR-OMNITRACEABILITY
  - DEV-INFO
  - sqlite-vec
code_links:
  - 'tools/docs_index.js'
  - 'tools/build_db.js'
  - 'tools/log_session.js'
  - 'agent/mcp/dinbrief-mcp/index.js'
error_patterns:
  - datenbank
  - sqlite
  - fts5
  - mcp
  - retrieval
  - volltext
  - index
  - bedienungsanleitung
supersedes: []
depends_on: []
---

# README-DB — Retrieval-Index (SQLite): Bedienung & Spezifikation

## 0. Prinzip (zuerst lesen)

- **Wahrheit sind Markdown, Code und die Dateiliste (Git).** Die SQLite ist **abgeleiteter Zustand** — ein Cache, um Informationen *exakt* (Datei + Zeile) zu finden, statt ganze Dateien zu lesen.
- **Ein Builder** erzeugt alles: `tools/docs_index.js`. Keine zweite Quelle, keine Hand-Edits.
- **In der DB wird nichts gepflegt.** Quelle ändern → neu bauen → fertig.

## 1. Bedienungsanleitung

### 1.1 Was liegt wo?

Zwei getrennte SQLite-Dateien, beide in `agent/cache/` (gitignored, regenerierbar):

| Datei | Rolle | Autor |
|---|---|---|
| `docs_search.db` | **Retrieval-Index** (Suche, Outline, Graph) | `tools/docs_index.js` |
| `DIN-Brief_docs.db` | **Session-Log** (Protokoll) | `tools/log_session.js` |

### 1.2 Fragen stellen (ohne SQL)

Im Agenten über die MCP-Tools des `dinbrief`-Servers:

- `docs_search("begriff")` — Volltext, liefert Pfad + Zeile + Snippet. Mehrere Begriffe = **UND**; Option `source=doc|code|all`.
- `docs_get("ADR-CSS")` — nur das Überschriften-Gerippe; mit zweitem Argument `docs_get("ADR-CSS", "Begruendung")` genau ein Abschnitt.
- `docs_related("ADR-JS")` — Graph: was hängt an diesem Ziel / was verweist darauf.

### 1.3 Von Hand (CLI)

```bash
node tools/docs_index.js build
node tools/docs_index.js search "falzmarke" --limit=5
node tools/docs_index.js search "showToast" --source=code
node tools/docs_index.js get "IMR-Registry" Case-Contract   # ohne 2. Arg = Gerippe
node tools/docs_index.js related ADR-JS
```

### 1.4 Neu bauen / frisch halten

```bash
node tools/build_db.js     # Fitness Gate + Index (force rebuild)
```

Automatisch:
- **jeder Commit** → `.githooks/pre-commit` baut den Index mit.
- **jede Abfrage** → `ensureFresh()` prüft und baut nur bei Bedarf.
- nach `git pull` / Branch-Wechsel → `.githooks/post-checkout` bzw. `post-merge`.

### 1.5 Wenn etwas komisch wirkt

- **Ergebnis wirkt veraltet?** `ensureFresh()` baut neu, wenn: DB fehlt **oder** eine getrackte Datei neuer ist (**mtime**) **oder** das Datei-Set abweicht (Anzahl / fehlende Datei). Sonst erzwingen: `node tools/build_db.js`.
- **DB fehlt / frischer Klon?** Einmal `node tools/build_db.js` — die DB ist gitignored und wird **nicht** mitgeklont.

## 2. Schema (exakt, aus `sqlite_master`)

```sql
CREATE TABLE documents (            -- eine Zeile je indexierter Datei
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  path        TEXT UNIQUE NOT NULL,
  title       TEXT,                 -- md: Frontmatter-Titel; code: Pfad
  status      TEXT,                 -- md: Frontmatter-Status; code: 'code'
  tags        TEXT,                 -- md: Tags, space-joined
  line_count  INTEGER,
  mtime_ms    INTEGER
);

CREATE TABLE sections (             -- md: je Ueberschrift H1-H6; code: je Datei
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_id     INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  level      INTEGER NOT NULL,      -- md: 1-6; code: 0
  heading    TEXT,
  start_line INTEGER NOT NULL,      -- 1-basiert in der ROHEN Datei
  end_line   INTEGER NOT NULL,
  body       TEXT NOT NULL
);

CREATE TABLE files (                -- Inventar aus `git ls-files`
  path       TEXT PRIMARY KEY,
  top        TEXT, ext TEXT, size_bytes INTEGER, lines INTEGER
);

CREATE TABLE links (                -- Beziehungsgraph
  from_path TEXT NOT NULL,          -- Quelle (Doku ODER Code)
  kind      TEXT NOT NULL,          -- doc | code | depends_on | adr | guide
  to_ref    TEXT NOT NULL,          -- Ziel wie geschrieben
  to_path   TEXT                    -- aufgeloest (Doku-Pfad), sonst NULL
);
```

**Indizes / Constraints:** `documents.path` UNIQUE; `idx_sections_doc(doc_id)`;
`idx_files_top(top)`; `idx_links_from(from_path)`, `idx_links_to(to_path)`,
`idx_links_ref(to_ref)`, **UNIQUE** `idx_links_uniq(from_path, kind, to_ref)`.

## 3. FTS-Architektur

```sql
-- Haupt-Volltext: EXTERNAL CONTENT (Text liegt nur in `sections`, hier nur der Index)
CREATE VIRTUAL TABLE sections_fts USING fts5(heading, body,
  content='sections', content_rowid='id', tokenize = "unicode61 remove_diacritics 2");

-- Teilwort-Fallback: eigenstaendig, NUR Doku-Sections
CREATE VIRTUAL TABLE sections_fts_tri USING fts5(heading, body,
  tokenize = "trigram remove_diacritics 1");
```

**Suchkaskade** in `search()` — greift von exakt nach unscharf:

1. **UND** (alle Terme, als Wort-**Präfix** `"term"*`) auf `sections_fts` → präzise.
2. bei **0** Treffern: **ODER** auf `sections_fts`.
3. bei **0** Treffern: **Trigramm** (`sections_fts_tri`) für Wortmitten (`fslinie` → `hilfslinien`).

`source=doc|code|all` filtert über `documents.status`. `snippet()` und
`bm25()` laufen auf beiden FTS-Tabellen; external-content liefert den
Snippet-Text aus `sections`, ohne ihn doppelt zu speichern.

## 4. Datenherkunft (Quelle → Tabellen)

| Quelle | `documents` | `sections` | `links` |
|---|---|---|---|
| **Markdown** (`docs/**`, `agent/**/*.md`, Root-MD) | 1 Zeile | je H1–H6 eine Section | Frontmatter `doc_links`/`code_links`/`depends_on` |
| **Code** (`website/`, `tools/`, `agent/`; `.js/.mjs/.cjs/.css/.html/.py/.sh`; ohne `*/data/`, ohne > 200 KB) | 1 Zeile (`status='code'`) | **eine** Section je **Datei** (level 0, Heading = Pfad, Body = Inhalt) | `@adr`/`@guide`-Annotationen |
| **`git ls-files`** | – | – | → `files` (Inventar) |

## 5. Link-Graph

`links.kind` unterscheidet die Herkunft der Kante:

- `doc` — Frontmatter `doc_links` (Doku → Doku)
- `code` — Frontmatter `code_links` (Doku → Code)
- `depends_on` — Frontmatter `depends_on`
- `adr` / `guide` — Code-Annotation `@adr [[…]]` / `@guide [[…]]` (Code → Doku)

`to_path` ist das aufgelöste Ziel, wenn der `to_ref` ein Doku-Basename ist
(z. B. `ADR-JS` → `docs/10-architecture/ADR-JS.md`), sonst `NULL`.
Damit sind „wer referenziert X" und „was hängt an Y" ein Index-Zugriff
(`docs_related`).

## 6. Build- und Freshness-Modell

```
node tools/build_db.js            -> buildIndex({force:true})    (Fitness Gate)
  .githooks/pre-commit            ruft build_db.js bei jedem Commit
  .githooks/post-checkout|merge   buildIndex({force:true}) nach Pull/Branchwechsel
MCP (dinbrief-mcp/docs.js = re-export von docs_index.js)
  ensureFresh() = buildIndex({force:false})  bei jeder Abfrage
```

**Rebuild-Ablauf:** alles `DROP`+`CREATE` → Markdown-Sections + Code-Sections
+ `files` + `links` einfügen → `INSERT INTO sections_fts(sections_fts)
VALUES('rebuild')` → `COMMIT` → **`VACUUM`** (ohne VACUUM schrumpft die Datei
nach dem Neuaufbau nicht).

**Staleness** (`ensureFresh`): neu bauen, wenn DB fehlt **oder** eine getrackte
Datei neuer ist (mtime) **oder** das Datei-Set abweicht (Anzahl / fehlende Datei).
Zero-Dependency über das in Node eingebaute `node:sqlite`.

## 7. Query-/MCP-Schnittstelle

| Funktion (`tools/docs_index.js`) | MCP-Tool | Zweck |
|---|---|---|
| `search(query, {limit, source})` | `docs_search` | Volltext (3 Stufen), Pfad + Zeile + Snippet |
| `get({path, section})` | `docs_get` | Outline (Ueberschriften + Zeilen) oder ein Abschnitt |
| `related(ref)` | `docs_related` | ausgehende/eingehende Links (Graph) |

## 8. Invarianten

- **Ein Builder.** Nur `tools/docs_index.js` schreibt `docs_search.db`;
  nur `tools/log_session.js` schreibt `DIN-Brief_docs.db`.
- **Nie hand-editieren.** Die DBs sind gitignored und jederzeit neu baubar.
- **Keine Autorität in der DB.** Fachliche/metadatenbezogene Wahrheit steht
  ausschließlich in Markdown/Code; die DB ist ein Abbild davon.
- **`sections_fts` ist external-content** — Text genau einmal (`sections`).
- **Trigramm nur als reiner Fallback** (erst bei 0 Wort-Treffern) → kein Rauschen.

## 9. Regenerierbarkeit / Gitignore

Beide Dateien liegen unter `agent/cache/` und sind über `.gitignore`
ausgeschlossen: Sie werden **nicht versioniert** und müssen nach einem
frischen Klon einmalig gebaut werden (`node tools/build_db.js`).

## 10. Groessen-/Mengenstand (Beispiel, 2026-09-30)

```
documents 143 (55 md + 40 code)   sections 1211
files     224                     links 281
sections_fts_tri 1171 (nur md)    DB ~6,6 MB     Build ~1,4 s
```

## 11. Bewusst NICHT enthalten (Guardrail)

Diese DB bleibt ein schlankes Retrieval-Werkzeug. **Nicht** aufnehmen ohne
belegten Retrieval-Schmerz:

- keine Symbol-/AST-Datenbank (kein Sprach-Parser, keine Funktions-Zerlegung)
- keine Code-Granularisierung unterhalb der Datei
- keine Chunk-Schicht
- keine Embeddings / Vector Search / Hybrid Search / Reranker
- keine Content-Hashes (mtime + Datei-Set genuegen)
- keine zusätzliche Repository-Metadaten-Duplikation
- keine manuelle Pflege der SQLite-Dateien
- keine fachliche Wahrheit ausschließlich in SQLite

## Verweise

- [[Immutable-Law-Catalog]] — Technologische Leitplanken (MUST-USE / FORBIDDEN)
- [[longevity-guidelines]] — Native-Standards-/Longevity-Leitlinie
- [[ADR-OMNITRACEABILITY]] — Wie Code und Doku verknüpft sind (Traceability)
- [[DEV-INFO]] — Feature-Erkennungs-Matrix (Chrome 150+)
- [[sqlite-vec]] — geparkte Idee (Hybrid-Search), nicht Teil dieser DB
