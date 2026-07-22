---
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: sqlite-vec
status: active
tags:
- phase1
- sqlite-vec
- hybrid-search
- embedding
- build
- generalisierbarkeit
- tools
title: 'Phase 1: sqlite-vec Integration – Detaillierte Umsetzungsanleitung'
type: concept
updated: '2026-07-07'
---

# Phase 1: sqlite-vec Integration – Detaillierte Umsetzungsanleitung

> [!NOTE]
> **Status:** In Planung / Teilweise umgesetzt
> **Zweck:** Detaillierter Implementierungsplan für die semantische Vektor-Suche via sqlite-vec.

**Ziel:** Die bestehende `DIN-Brief_docs.db` (SQLite + FTS5) um Vektor-Embeddings mit `sqlite-vec` erweitern, um Hybrid Search (keyword + semantic) mit Reciprocal Rank Fusion (RRF) zu ermöglichen. Alles integriert in den bestehenden Build-Prozess. Reconciliation + Fitness Score bleiben das harte Qualitäts-Gate.

**Leitplanken (aus Research + Projektprinzipien):**

- Bleib bei **Single-File SQLite** (kein externes DB-System).

- Nutze **sqlite-vec** (offizielle leichtgewichtige Extension, 384-Dim Embeddings mit all-MiniLM-L6-v2).

- Content-Hash-Caching: Nur bei geändertem Inhalt neu embedden (Performance + Determinismus).

- Alles passiert **im Build** (`node tools/build_db.js`).

- Keine schweren neuen Abhängigkeiten wo möglich; Extension muss separat bereitgestellt werden.

- Generalisierbarkeit: Die Erweiterung soll später sauber in die `llm_boilerplate` übernehmbar sein.

**Voraussetzungen für diese Phase:**

- Node.js (aktuell verwendetes `node:sqlite` / `DatabaseSync`).

- Die `sqlite-vec` Extension Datei (z.B. `vec0.dll` auf Windows, `vec0.so` auf Linux, `vec0.dylib` auf macOS). Download von https://github.com/asg017/sqlite-vec/releases (passend zu deiner Plattform und SQLite-Version).

- Optional später: Lokaler Embedding-Generator (z.B. via `@xenova/transformers` für reines JS, offline).

---

## Arbeitspaket 1: Schema-Erweiterung (Priorität 1, klein)

**Ziel:** Die `documents` Tabelle und verwandte Tabellen um Spalten für Embeddings und Caching erweitern.

**Änderungen in `tools/build_db.js` (im SQL-Generierungs-Teil):**

Finde den Abschnitt wo Tabellen gedroppt und neu erstellt werden (ca. nach `console.log('Compiling documentation database...');`).

**Ersetze/Ergänze die CREATE TABLE documents um:**

```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT,
  content TEXT NOT NULL,
  content_hash TEXT,                    -- NEU: SHA-256 des Inhalts für Caching
  embedding BLOB,                       -- NEU: Vektor als BLOB (für sqlite-vec)
  embedding_model TEXT DEFAULT 'all-MiniLM-L6-v2',  -- NEU: Modell-Info
  embedding_dim INTEGER DEFAULT 384     -- NEU: Dimension
);
```

**Zusätzlich neue Tabelle für die Vektor-Suche (virtuell via sqlite-vec):**

```sql
-- Wird später mit sqlite-vec Extension geladen
CREATE VIRTUAL TABLE IF NOT EXISTS vec_documents USING vec0(
  embedding FLOAT[384]  -- Muss zur embedding_dim passen
);
```

**Hinweis:** Da Tabellen jedes Mal gedroppt werden (`DROP TABLE IF EXISTS documents;`), ist das Adden der Spalten unkritisch. Die virtuellen Tabellen werden nach dem Laden der Extension erstellt.

Aktualisiere auch die INSERT-Statements später (siehe AP 3).

---

## Arbeitspaket 2: Content-Hash-Caching (Priorität 2, mittel)

**Ziel:** Vor dem Embedden prüfen, ob sich der Dokumentinhalt geändert hat. Nur dann neu berechnen und speichern.

**Implementierung in `tools/build_db.js`:**

Füge am Anfang der `main()` oder als Helper hinzu:

```js
const crypto = require('crypto');

function computeContentHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}
```

Im Schleifen-Teil, wo Dokumente verarbeitet werden (nach dem Parsen von YAML und Inhalt):

```js
const contentHash = computeContentHash(doc.content);

// Später beim INSERT oder Update:
if (existingHash !== contentHash || !existingEmbedding) {
  // Nur dann Embedding generieren (siehe AP 3)
  const embedding = await generateEmbedding(doc.content);  // Platzhalter
  // Speichern
}
```

**Im SQL-INSERT für documents** (im String-Building):

Erweitere die VALUES um die neuen Spalten:

```js
sql += `INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  '${escapeSql(doc.path)}',
  '${escapeSql(doc.title)}',
  '${escapeSql(doc.status)}',
  '${escapeSql(doc.content)}',
  '${contentHash}',
  ?,  -- BLOB für Embedding (später binden)
  'all-MiniLM-L6-v2',
  384
);`;
```

**Wichtig für Caching:** Lade vor dem Verarbeiten die bestehenden Hashes aus der DB (oder aus vorherigem Run). Da der Build die DB dropt, speichere Hashes temporär oder verarbeite in-memory zuerst.

**Empfehlung für sauberes Caching:**

- Lese zuerst alle existierenden `path` + `content_hash` + `embedding` aus der alten DB (bevor DROP).

- Vergleiche Hashes im JS-Code.

- Nur geänderte/neue Dokumente bekommen ein frisches Embedding.

---

## Arbeitspaket 3: sqlite-vec Integration (Priorität 3, mittel)

**Ziel:** Die Extension laden, virtuelle Tabelle anlegen und Embeddings befüllen.

**Voraussetzung:** Die Extension-Datei muss verfügbar sein (z.B. im Projekt-Root oder in einem `extensions/` Ordner).

**In `tools/build_db.js` (am Anfang der main(), vor Reconciliation oder DB-Erstellung):**

```js
const Database = require('node:sqlite').DatabaseSync;  // Bestehender Import anpassen falls nötig

// Extension laden (Node 22+ unterstützt loadExtension in vielen Builds)
const db = new Database(':memory:');  // Oder die finale DB
try {
  db.loadExtension('./vec0');  // Pfad anpassen, z.B. 'extensions/vec0' oder absoluter Pfad
  console.log('sqlite-vec Extension erfolgreich geladen.');
} catch (err) {
  console.warn('Warnung: sqlite-vec Extension konnte nicht geladen werden. Vektor-Suche deaktiviert für diesen Build.');
  console.warn(err.message);
  // Fallback: Build läuft weiter ohne Vektoren (Fitness-Score anpassen)
}
```

**Nach dem Erstellen der documents Tabelle:**

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS vec_documents USING vec0(embedding FLOAT[384]);
```

**Befüllen der Vektor-Tabelle (nachdem Embeddings berechnet wurden):**

Für jedes Dokument mit Embedding:

```js
// Nach dem INSERT in documents (mit lastInsertRowid oder separater Query für ID)
const docId = ...;  // ID des Dokuments
// Embeddings als Float32Array oder Buffer
const embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer);

sql += `INSERT INTO vec_documents (rowid, embedding) VALUES (${docId}, ?);`;
// Binde den Buffer beim Ausführen
```

**Embedding-Generierung (Platzhalter – implementiere hier):**

```js
async function generateEmbedding(text) {
  // TODO Phase 1: Lokales Modell einbinden
  // Beispiel mit @xenova/transformers (offline, JS-only):
  // const { pipeline } = await import('@xenova/transformers');
  // const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  // const output = await extractor(text, { pooling: 'mean', normalize: true });
  // return Array.from(output.data);  // 384-dim Float Array

  // Für ersten Test: Zufalls-Vektor (später ersetzen!)
  return Array.from({ length: 384 }, () => Math.random() - 0.5);
}
```

**Wichtig:** Da der aktuelle Code synchron ist, passe auf Async/await auf oder mache den Build async.

**Update der Reconciliation (siehe AP 5).**

---

## Arbeitspaket 4: Hybrid Search Funktion (Priorität 4, mittel)

**Ziel:** Eine wiederverwendbare Query-Funktion/Query, die Keyword (FTS5) + Vector + RRF kombiniert.

**Erstelle eine neue Datei oder erweitere `tools/build_db.js` (besser: neue Datei `tools/hybrid_search.js` für Generalisierbarkeit):**

```js
// tools/hybrid_search.js
const Database = require('node:sqlite').DatabaseSync;

function hybridSearch(dbPath, queryText, limit = 10) {
  const db = new Database(dbPath);

  // Lade Extension falls nötig (wie in build)
  try { db.loadExtension('./vec0'); } catch (e) {}

  // 1. FTS5 Matches
  const ftsQuery = `
    SELECT documents.id, documents.path, documents.title, rank
    FROM documents 
    JOIN documents_fts ON documents.id = documents_fts.rowid
    WHERE documents_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `;
  // (Hinweis: Du brauchst eine FTS5 Tabelle – siehe unten)

  // 2. Vector Search (angenommen Embedding für Query generiert)
  const queryEmbedding = /* generateEmbedding(queryText) */;
  const vecQuery = `
    SELECT documents.id, documents.path, documents.title, 
           distance
    FROM vec_documents 
    JOIN documents ON vec_documents.rowid = documents.id
    WHERE embedding MATCH ? AND k = ?
    ORDER BY distance
  `;

  // 3. RRF Fusion (Reciprocal Rank Fusion)
  const hybridSQL = `
    WITH fts AS (
      -- FTS5 subquery mit Ranks
    ),
    vec AS (
      -- Vector subquery
    ),
    combined AS (
      SELECT id, path, title,
             (1.0 / (60 + fts_rank)) + (1.0 / (60 + vec_rank)) as rrf_score
      FROM ...
    )
    SELECT * FROM combined ORDER BY rrf_score DESC LIMIT ?;
  `;

  return db.prepare(hybridSQL).all(queryText, queryEmbedding /*, limit */);
}

module.exports = { hybridSearch };
```

**FTS5 Tabelle anlegen (im build_db.js SQL):**

Falls noch nicht vorhanden (aus aktuellem Code erweitern):

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(content, path, title);
-- Trigger oder manuelles Befüllen beim Build
```

**Empfehlung:** Im Build alle Dokumente in FTS5 + vec_documents befüllen.

**Test-Query Beispiel:**

```sql
-- Nach Build in sqlite3 CLI oder Node:
SELECT * FROM hybrid_search('dein suchbegriff', 5);
```

---

## Arbeitspaket 5: Reconciliation-Erweiterung (Priorität 5, klein)

**Ziel:** Neuen Check: "Alle Dokumente haben aktuelle Embeddings?"

**In `tools/reconciliation.js` (im FEATURE_CHECKS oder neuen Check):**

```js
// Erweitere den Report
const embeddingCheck = {
  name: 'Embeddings present and up-to-date',
  passed: true,
  details: []
};

files.forEach(file => {
  if (/* Markdown file */) {
    const hash = computeContentHash(content);
    // Query DB: SELECT content_hash, embedding FROM documents WHERE path = ?
    if (!row.embedding || row.content_hash !== hash) {
      embeddingCheck.passed = false;
      embeddingCheck.details.push(`Missing/outdated embedding for ${path}`);
    }
  }
});

report.dimensions.features = ... ; // Anpassen falls nötig
report.logs.push(...);
```

**Update `build_db.js`:** Rufe den erweiterten Check auf und integriere in den Fitness Score.

**Im Score:** Wenn Embeddings fehlen, z.B. leichte Abzug auf "Features Score" (nicht critical, damit Build nicht sofort bricht während Migration).

---

## Arbeitspaket 6: Dokumentation (Priorität 6, klein)

**Erstelle / aktualisiere eine Datei:**

`aktueller_arbeitsordner/tools/README-VECTOR-SEARCH.md` (oder in `Guides/`):

- Kurze Anleitung: Wie Hybrid Search aufrufen (Beispiel-Code + SQL).

- Hinweis auf Caching und wann neu embeddet wird.

- Beispiel-Queries für Agenten (z.B. "Finde ähnliche ADRs zu Farbthemen").

- Link zum Reconciliation (Fitness Score prüft Embeddings).

**Minimal-Beispiel in der Doku:**

```js
const { hybridSearch } = require('./tools/hybrid_search');
const results = hybridSearch('DIN-Brief_docs.db', 'Faltmarken und DIN 5008', 5);
```

---

## Nächste Schritte nach dieser Anleitung

1. **Vorbereitung:** Lade `sqlite-vec` Extension herunter und lege sie neben dem Projekt (oder in `tools/extensions/`).

2. **Test-Implementierung:** Starte mit AP 1 + 2 (Schema + Hash) – das ist risikoarm.

3. **Danach AP 3** (Extension + Vektoren).

4. Teste die Hybrid Search.

5. Erweitere Reconciliation.

6. Dokumentiere.

7. **Post-Build + Log** nach jedem größeren Schritt (per AGENTS.md).

8. Prüfe Fitness Score – bei Problemen (z.B. fehlende Extension) graceful degrade (Build läuft, aber ohne Vektoren + Warnung im Score).

**Risiken & Hinweise:**

- `node:sqlite` + `loadExtension` funktioniert nicht auf allen Node-Builds (manchmal braucht man `better-sqlite3` mit `unsafeLoadExtension`). Teste früh.

- Embedding-Generierung: Für echte lokale Nutzung `@xenova/transformers` hinzufügen (kleine Abhängigkeit, aber offline-fähig).

- Performance: Bei vielen Docs (>1000) Caching + batching wichtig.

- Generalisierbarkeit: Die neuen Funktionen (`hybrid_search.js`) sollten später 1:1 in die `llm_boilerplate/tools/` wandern können.

---

**Wie weiter?**

Diese Anleitung ist bewusst detailliert, damit du (oder ein Agent) sie Schritt für Schritt abarbeiten kannst.

Möchtest du, dass ich als Nächstes:

- Den Code für eines der Arbeitspakete (z.B. AP 1+2) direkt in die Dateien schreibe (mit search_replace)?

- Ein separates `tools/hybrid_search.js` Gerüst anlege?

- Die Anleitung noch kürzer mache (nur die Top 3 Pakete)?

- Oder direkt mit der Implementierung von AP 1 (Schema) starte und dann build + log?

Sag mir den nächsten konkreten Schritt – ich führe ihn aus (inkl. Pre/Post-Build + Logging per Vertrag). 

Phase 1 ist machbar in 1–3 Sitzungen, wenn wir fokussiert bleiben.