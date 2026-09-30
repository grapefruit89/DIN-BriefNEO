'use strict';
/**
 * docs_index.js — EIN Builder fuer den kompletten Doku-/Repo-Index.
 * =================================================================
 * Warum: Agenten sollen Informationen EXAKT finden (Datei + Zeile), statt
 * ganze Dateien zu lesen (Token-Verbrennung). Dieser Index ist die einzige
 * Wahrheit fuer Retrieval und wird aus zwei Quellen gespeist:
 *
 *   Markdown (.md)         -> documents + sections (H1-H6, mit Zeilennummern)
 *   Code (website/tools/agent) -> je Datei EINE Section (Volltext durchsuchbar)
 *   git ls-files (Inventar) -> files (wo liegt welche Datei, Rolle, Groesse)
 *   Beziehungen            -> links (from_path -> to_ref aus doc_links/code_links/
 *                             depends_on + Code-Annotationen @adr/@guide)
 *   Volltextsuche          -> sections_fts (unicode61, EXTERNAL-CONTENT, Prefix von Wortvarianten)
 *                             sections_fts_tri (trigram, nur Doku, reiner Fallback: mittlere Teilwoerter)
 *
 * Aufgerufen von:
 *   - tools/build_db.js (Fitness Gate: ein Kommando = Gate + Index)
 *   - agent/mcp/dinbrief-mcp (Query-Schicht, ensureFresh)
 *
 * Design-Regeln:
 *   - Markdown bleibt Source of Truth; die DB ist ABGELEITET und jederzeit
 *     neu baubar (nie hand-editieren).
 *   - Zero-Dependency: nur Node core (fs/path/child_process) + node:sqlite.
 *   - Getrennt von agent/cache/DIN-Brief_docs.db (Session-Log von
 *     tools/log_session.js) -- keine Namenskollision.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const REPO_ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(REPO_ROOT, 'agent', 'cache', 'docs_search.db');
const DOC_SIZE_EXEMPT_FILES = new Set([]); // (reserviert; derzeit ungenutzt)

// Verzeichnisse, die NICHT zum Doku-Korpus gehoeren (Code, Dumps, generierte
// Artefakte, lokaler Muell).
const IGNORE_DIRS = new Set([
  'website', '.git', 'tools', 'build', 'venv', 'node_modules',
  '.agents', '.claude', 'cache', 'scratch', '.opencode'
]);

const TEXT_EXT = new Set(['.md', '.js', '.mjs', '.cjs', '.css', '.html', '.json',
  '.yaml', '.yml', '.py', '.ps1', '.bat', '.svg', '.txt', '.toml', '.sh']);

/** @returns {string[]} absolute Pfade aller .md-Dateien im Doku-Korpus */
function collectMarkdownFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        out.push(path.join(dir, entry.name));
      }
    }
  };
  walk(REPO_ROOT);
  return out;
}

/**
 * Minimaler Frontmatter-Parser (bewusst kein YAML-Dependency, gleiche
 * Beschraenkung wie tools/build_db.js: flache Schluessel der obersten Ebene).
 * @param {string} raw
 * @returns {{ meta: {title?: string, status?: string, tags: string[], doc_links: string[], code_links: string[], depends_on: string[]}, bodyStartLine: number }}
 */
function parseFrontmatter(raw) {
  const meta = { title: undefined, status: undefined, tags: [], doc_links: [], code_links: [], depends_on: [] };
  const LIST_KEYS = { tags: 'tags', doc_links: 'doc_links', code_links: 'code_links', depends_on: 'depends_on' };
  const lines = raw.split(/\r?\n/);
  if (lines[0] !== '---') return { meta, bodyStartLine: 0 };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { end = i; break; }
  }
  if (end === -1) return { meta, bodyStartLine: 0 };

  let listKey = null;
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    const item = line.match(/^\s*-\s+(.+?)\s*$/);
    if (item) {
      if (listKey) {
        const val = item[1].replace(/\s*#.*$/, '').trim().replace(/['"]/g, '');
        if (val) meta[listKey].push(val);
      }
      continue;
    }
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1].toLowerCase();
    const value = kv[2].replace(/\s*#.*$/, '').trim();
    if (key === 'title') { meta.title = value.replace(/['"]/g, ''); listKey = null; }
    else if (key === 'status') { meta.status = value.replace(/['"]/g, ''); listKey = null; }
    else if (LIST_KEYS[key]) {
      listKey = LIST_KEYS[key];
      if (value === '' || value === '[]') { meta[listKey] = []; }
      else if (value.startsWith('[')) meta[listKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
    } else {
      listKey = null;
    }
  }
  return { meta, bodyStartLine: end + 1 };
}

/**
 * Zerlegt das Dokument in Abschnitte (H1-H6). start_line/end_line sind
 * 1-basierte Zeilennummern in der ROHEN Datei (direkt per Read anspringbar).
 * @param {string} raw
 * @param {number} bodyStartLine
 */
function splitSections(raw, bodyStartLine) {
  const lines = raw.split(/\r?\n/);
  const marks = [];
  for (let i = bodyStartLine; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*?)\s*$/);
    if (m) marks.push({ idx: i, level: m[1].length, heading: m[2] });
  }
  const sections = [];
  const pushRange = (startIdx, endIdxExclusive, level, heading) => {
    const body = lines.slice(startIdx, endIdxExclusive).join('\n').trim();
    if (body === '' && heading === '') return;
    sections.push({ level, heading, start_line: startIdx + 1, end_line: endIdxExclusive, body });
  };
  if (marks.length === 0) { pushRange(bodyStartLine, lines.length, 0, ''); return sections; }
  if (marks[0].idx > bodyStartLine) pushRange(bodyStartLine, marks[0].idx, 0, '');
  for (let i = 0; i < marks.length; i++) {
    const next = i + 1 < marks.length ? marks[i + 1].idx : lines.length;
    pushRange(marks[i].idx + 1, next, marks[i].level, marks[i].heading);
  }
  return sections;
}

/** Liefert das git-Tracked-Inventar als {path, top, ext, size_bytes, lines}. */
function collectTrackedFiles() {
  let tracked = [];
  try {
    tracked = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf-8' })
      .split('\n').map(s => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
  const out = [];
  for (const rel of tracked) {
    const abs = path.join(REPO_ROOT, rel);
    let size = null;
    let lines = null;
    try {
      const st = fs.statSync(abs);
      size = st.size;
      if (TEXT_EXT.has(path.extname(rel).toLowerCase()) && size < 2_000_000) {
        lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/).length;
      }
    } catch { /* Datei fehlt im Working Tree (z.B. geloescht) */ }
    out.push({
      path: rel,
      top: rel.includes('/') ? rel.split('/')[0] : '(root)',
      ext: path.extname(rel).toLowerCase() || null,
      size_bytes: size,
      lines
    });
  }
  return out;
}

function createSchema(db) {
  db.exec(`
    DROP TABLE IF EXISTS sections_fts_tri;
    DROP TABLE IF EXISTS sections_fts;
    DROP TABLE IF EXISTS sections;
    DROP TABLE IF EXISTS documents;
    DROP TABLE IF EXISTS files;
    DROP TABLE IF EXISTS links;
    CREATE TABLE documents (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      path        TEXT UNIQUE NOT NULL,
      title       TEXT,
      status      TEXT,
      tags        TEXT,
      line_count  INTEGER,
      mtime_ms    INTEGER
    );
    CREATE TABLE sections (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id     INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      level      INTEGER NOT NULL,
      heading    TEXT,
      start_line INTEGER NOT NULL,
      end_line   INTEGER NOT NULL,
      body       TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE sections_fts USING fts5(heading, body, content='sections', content_rowid='id', tokenize = "unicode61 remove_diacritics 2");
    CREATE VIRTUAL TABLE sections_fts_tri USING fts5(heading, body, tokenize = "trigram remove_diacritics 1");
    CREATE INDEX idx_sections_doc ON sections(doc_id);
    CREATE TABLE files (
      path       TEXT PRIMARY KEY,
      top        TEXT,
      ext        TEXT,
      size_bytes INTEGER,
      lines      INTEGER
    );
    CREATE INDEX idx_files_top ON files(top);
    CREATE TABLE links (
      from_path TEXT NOT NULL,
      kind      TEXT NOT NULL,
      to_ref    TEXT NOT NULL,
      to_path   TEXT
    );
    CREATE INDEX idx_links_from ON links(from_path);
    CREATE INDEX idx_links_to   ON links(to_path);
    CREATE INDEX idx_links_ref  ON links(to_ref);
    CREATE UNIQUE INDEX idx_links_uniq ON links(from_path, kind, to_ref);
  `);
}

/**
 * Baut den Index vollstaendig neu auf.
 * @param {{force?: boolean}} [opts]
 * @returns {{rebuilt: boolean, documents: number, sections: number, files: number, db_path: string}}
 */
function buildIndex(opts = {}) {
  const mdFiles = collectMarkdownFiles();
  const tracked = collectTrackedFiles();

  if (!opts.force && !indexIsStale(mdFiles, tracked)) {
    return { rebuilt: false, documents: null, sections: null, files: null, links: null, db_path: DB_PATH };
  }

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');
  createSchema(db);

  const insDoc = db.prepare('INSERT INTO documents (path, title, status, tags, line_count, mtime_ms) VALUES (?, ?, ?, ?, ?, ?)');
  const insSec = db.prepare('INSERT INTO sections (doc_id, level, heading, start_line, end_line, body) VALUES (?, ?, ?, ?, ?, ?)');
  const insFtsTri = db.prepare('INSERT INTO sections_fts_tri (rowid, heading, body) VALUES (?, ?, ?)');
  const insFile = db.prepare('INSERT OR REPLACE INTO files (path, top, ext, size_bytes, lines) VALUES (?, ?, ?, ?, ?)');
  const insLink = db.prepare('INSERT OR IGNORE INTO links (from_path, kind, to_ref, to_path) VALUES (?, ?, ?, ?)');

  // Auflösung: Basename -> Doku-Pfad (doc_links/@adr) bzw. existierender Tracked-Pfad (code_links).
  const trackedPaths = new Set(tracked.map(t => t.path));
  const docByStem = new Map();
  for (const abs of mdFiles) {
    const rel = path.relative(REPO_ROOT, abs).split(path.sep).join('/');
    docByStem.set(rel.replace(/\.md$/, '').split('/').pop(), rel);
  }
  const resolveRef = (ref) => {
    const stem = String(ref).replace(/\.(md|json|js|css|html|ya?ml)$/i, '');
    if (docByStem.has(stem)) return docByStem.get(stem);
    return trackedPaths.has(ref) ? ref : null;
  };
  const CODE_EXT = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.json', '.yaml', '.yml', '.py', '.ps1', '.sh']);

  let docCount = 0, secCount = 0, fileCount = 0, linkCount = 0;
  db.exec('BEGIN');
  try {
    for (const rel of tracked) {
      insFile.run(rel.path, rel.top, rel.ext, rel.size_bytes, rel.lines);
      fileCount++;
    }
    for (const abs of mdFiles) {
      let raw;
      try { raw = fs.readFileSync(abs, 'utf8'); } catch { continue; }
      const rel = path.relative(REPO_ROOT, abs).split(path.sep).join('/');
      const { meta, bodyStartLine } = parseFrontmatter(raw);
      const lineCount = raw.split(/\r?\n/).length;
      const mtime = fs.statSync(abs).mtimeMs;
      const info = insDoc.run(rel, meta.title || rel, meta.status || null, meta.tags.join(' '), lineCount, mtime);
      const docId = Number(info.lastInsertRowid);
      docCount++;
      for (const s of splitSections(raw, bodyStartLine)) {
        const r = insSec.run(docId, s.level, s.heading, s.start_line, s.end_line, s.body);
        insFtsTri.run(Number(r.lastInsertRowid), s.heading, s.body);
        secCount++;
      }
      for (const [kind, list] of [['doc', meta.doc_links], ['code', meta.code_links], ['depends_on', meta.depends_on]]) {
        for (const ref of list) { insLink.run(rel, kind, ref, resolveRef(ref)); linkCount++; }
      }
    }
    // Code: EIN Durchlauf -- Annotationen (@adr/@guide) + Volltext (Section je Datei).
    const ANNOTATION = /@(adr|guide)\s+\[\[([^\]]+)\]\]/g;
    const INDEX_EXT = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.py', '.sh']);
    const INDEX_TOPS = new Set(['website', 'tools', 'agent']);
    for (const t of tracked) {
      const ext = path.extname(t.path).toLowerCase();
      const isAnnot = CODE_EXT.has(ext);
      const wantsIndex = INDEX_EXT.has(ext) && INDEX_TOPS.has(t.path.split('/')[0])
        && !t.path.includes('/data/') && !t.path.includes('node_modules')
        && !(t.size_bytes != null && t.size_bytes > 200_000);
      if (!isAnnot && !wantsIndex) continue;
      let raw;
      try { raw = fs.readFileSync(path.join(REPO_ROOT, t.path), 'utf8'); } catch { continue; }
      if (isAnnot) {
        for (const m of raw.matchAll(ANNOTATION)) {
          const target = m[2].trim();
          insLink.run(t.path, m[1], target, resolveRef(target));
          linkCount++;
        }
      }
      if (wantsIndex) {
        const lineCount = raw.split(/\r?\n/).length;
        const info = insDoc.run(t.path, t.path, 'code', null, lineCount, fs.statSync(path.join(REPO_ROOT, t.path)).mtimeMs);
        const docId = Number(info.lastInsertRowid);
        docCount++;
        const r = insSec.run(docId, 0, t.path, 1, lineCount, raw);
        secCount++;
      }
    }
    // External-content-FTS einmalig aus der Content-Tabelle (sections) indizieren.
    db.exec(`INSERT INTO sections_fts(sections_fts) VALUES('rebuild');`);
    db.exec('COMMIT');
    db.exec('VACUUM');
  } catch (err) {
    db.exec('ROLLBACK');
    db.close();
    throw err;
  }
  db.close();
  return { rebuilt: true, documents: docCount, sections: secCount, files: fileCount, links: linkCount, db_path: DB_PATH };
}

/** Rebuild-Trigger: DB fehlt oder aelter als die neueste Quelldatei. */
function indexIsStale(mdFiles, tracked = []) {
  if (!fs.existsSync(DB_PATH)) return true;
  const dbMtime = fs.statSync(DB_PATH).mtimeMs;
  // (a) irgendeine Quelldatei (Doku ODER Code) neuer als die DB?
  for (const f of mdFiles) {
    try { if (fs.statSync(f).mtimeMs > dbMtime) return true; } catch { /* ignore */ }
  }
  for (const t of tracked) {
    try { if (fs.statSync(path.join(REPO_ROOT, t.path)).mtimeMs > dbMtime) return true; } catch { /* ignore */ }
  }
  // (b) Datei-Set geaendert (neu/geloescht)? -> Abgleich mit der files-Tabelle.
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

/** Baut nur neu, wenn der Index fehlt oder veraltet ist. */
function ensureFresh() {
  return buildIndex({ force: false });
}

/** Tokens fuer FTS5: nur Buchstaben/Ziffern/_/- (sprachneutral, Umlaute bleiben). */
function tokenize(query) {
  return String(query || '').match(/[\p{L}\p{N}_-]+/gu) || [];
}

/** unicode61-Query: exakter Begriff, Prefix (*) fuer Wortvarianten. */
function buildWordQuery(query, mode = 'AND') {
  const terms = new Set();
  for (const t of tokenize(query)) terms.add(t.toLowerCase());
  if (terms.size === 0) return '';
  const join = mode === 'OR' ? ' OR ' : ' AND ';
  return [...terms].map(t => (t.length >= 3 ? `"${t}"*` : `"${t}"`)).join(join);
}

/** trigram-Query: Teilwort-Suche fuer mittlere Substrings (nur Terme >= 3 Zeichen; keine Tippfehler-Korrektur). */
function buildSubstringQuery(query) {
  const toks = tokenize(query).filter(t => t.length >= 3);
  if (toks.length === 0) return '';
  return toks.map(t => `"${t.replace(/"/g, '""')}"`).join(' OR ');
}

/**
 * Volltextsuche ueber Abschnitte. Liefert kleine Treffer (Pfad + Zeilen +
 * Snippet), nie ganze Dateien. Zweistufig: erst Wort-Suche
 * (unicode61, bm25), dann — falls zu wenig Treffer — Teilwort-Suche (trigram).
 * @param {string} query
 * @param {{limit?: number}} [opts]
 */
function search(query, opts = {}) {
  ensureFresh();
  const limit = Math.min(Math.max(Number(opts.limit) || 8, 1), 50);
  const source = opts.source === 'code' || opts.source === 'doc' ? opts.source : 'all';
  const andQ = buildWordQuery(query, 'AND');
  const orQ = buildWordQuery(query, 'OR');
  const subQ = buildSubstringQuery(query);
  if (andQ === '' && subQ === '') return { query: String(query || ''), source, count: 0, results: [] };
  const srcCond = source === 'code' ? "AND d.status='code'"
    : source === 'doc' ? "AND (d.status IS NULL OR d.status <> 'code')" : '';

  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  try {
    const runMatch = (table, match, cap) => match === '' ? [] : db.prepare(`
      SELECT s.id AS sid, d.path, d.title, d.status, s.level, s.heading, s.start_line, s.end_line,
             snippet(${table}, 1, '<<', '>>', ' … ', 14) AS snippet,
             bm25(${table}) AS score
      FROM ${table}
      JOIN sections s  ON s.id = ${table}.rowid
      JOIN documents d ON d.id = s.doc_id
      WHERE ${table} MATCH ? ${srcCond}
      ORDER BY score
      LIMIT ?
    `).all(match, cap);

    const seen = new Set();
    const results = [];
    const add = (row, kind) => {
      if (seen.has(row.sid)) return;
      seen.add(row.sid);
      const { sid, ...rest } = row;
      results.push({ ...rest, match: kind });
    };
    // 1) UND (alle Terme) = praezise; 2) OR-Fallback; 3) Trigram NUR als reiner Fallback (0 Treffer).
    for (const row of runMatch('sections_fts', andQ, limit)) add(row, 'word');
    if (results.length === 0 && orQ !== andQ) {
      for (const row of runMatch('sections_fts', orQ, limit)) add(row, 'word-or');
    }
    if (results.length === 0 && subQ !== '') {
      for (const row of runMatch('sections_fts_tri', subQ, limit)) {
        if (results.length >= limit) break;
        add(row, 'substring');
      }
    }
    return { query: String(query || ''), source, count: results.length, results };
  } finally {
    db.close();
  }
}

/** Loest einen (ggf. unvollstaendigen) Pfad auf einen indizierten Doku-Pfad auf. */
function resolveDocPath(db, input) {
  const want = String(input || '').trim().replace(/^\.\//, '').split(path.sep).join('/');
  if (want === '') return null;
  const exact = db.prepare('SELECT path FROM documents WHERE path = ?').get(want);
  if (exact) return exact.path;
  const matches = db.prepare('SELECT path FROM documents WHERE path LIKE ? ORDER BY length(path) LIMIT 6').all(`%${want}%`);
  if (matches.length === 1) return matches[0].path;
  return matches.length === 0 ? null : { ambiguous: matches.map(m => m.path) };
}

/**
 * Holt den Umriss eines Dokuments ODER genau einen Abschnitt -- nie die
 * ganze Datei (Token-Disziplin).
 * @param {{path: string, section?: string}} args
 */
function get(args = {}) {
  ensureFresh();
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  try {
    const resolved = resolveDocPath(db, args.path);
    if (resolved === null) return { ok: false, error: `Kein Dokument gefunden fuer "${args.path}".` };
    if (typeof resolved === 'object') return { ok: false, error: `Pfad mehrdeutig fuer "${args.path}".`, candidates: resolved.ambiguous };

    const doc = db.prepare('SELECT id, path, title, status, tags, line_count FROM documents WHERE path = ?').get(resolved);
    const headings = db.prepare('SELECT level, heading, start_line, end_line FROM sections WHERE doc_id = ? ORDER BY start_line').all(doc.id);

    const section = String(args.section || '').trim();
    if (section === '') {
      return {
        ok: true,
        path: doc.path,
        title: doc.title,
        status: doc.status,
        tags: doc.tags ? doc.tags.split(' ').filter(Boolean) : [],
        line_count: doc.line_count,
        outline: headings.map(h => ({ level: h.level, heading: h.heading, start_line: h.start_line })),
        hint: 'Nur das Gerippe. Fuer Inhalt einen Abschnitt per section=<Ueberschrift> holen.'
      };
    }

    const needle = section.toLowerCase();
    const hits = headings.filter(h => (h.heading || '').toLowerCase().includes(needle));
    if (hits.length === 0) {
      return { ok: false, error: `Kein Abschnitt passt zu "${section}".`, outline: headings.map(h => h.heading) };
    }
    if (hits.length > 1) {
      return { ok: false, error: `Abschnitt "${section}" mehrdeutig.`, candidates: hits.map(h => ({ heading: h.heading, start_line: h.start_line })) };
    }
    const full = db.prepare('SELECT body FROM sections WHERE doc_id = ? AND start_line = ?').get(doc.id, hits[0].start_line);
    return {
      ok: true,
      path: doc.path,
      heading: hits[0].heading,
      level: hits[0].level,
      start_line: hits[0].start_line,
      end_line: hits[0].end_line,
      body: full.body
    };
  } finally {
    db.close();
  }
}

/**
 * Beziehungsgraph: ausgehende Links einer Quelle + eingehende Verweise auf ein
 * Ziel. `ref` ist ein Pfad (docs/x.md) ODER ein Basename (@adr-Ziel, z.B. ADR-JS).
 * @param {string} ref
 * @returns {{ref: string, outgoing: object[], incoming: object[]}}
 */
function related(ref) {
  ensureFresh();
  const needle = String(ref || '').trim();
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  try {
    const outgoing = db.prepare(
      'SELECT kind, to_ref, to_path FROM links WHERE from_path = ? OR from_path LIKE ? ORDER BY kind, to_ref'
    ).all(needle, '%/' + needle);
    const incoming = db.prepare(
      'SELECT from_path, kind, to_ref FROM links WHERE to_ref = ? OR to_path = ? OR to_ref LIKE ? ORDER BY from_path, kind'
    ).all(needle, needle, '%/' + needle);
    return { ref: needle, outgoing, incoming };
  } finally {
    db.close();
  }
}

module.exports = {
  REPO_ROOT, DB_PATH,
  buildIndex, ensureFresh, search, get, related,
  collectMarkdownFiles, collectTrackedFiles, splitSections, parseFrontmatter,
  // Aliase fuer die MCP-Schicht (sprechende Namen):
  docsSearch: search, docsGet: get, docsRelated: related, ensureIndex: ensureFresh
};
