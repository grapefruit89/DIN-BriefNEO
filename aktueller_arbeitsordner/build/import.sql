PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS document_tags;
DROP TABLE IF EXISTS document_relations;
DROP TABLE IF EXISTS reconciliation_log;
DROP TABLE IF EXISTS antipattern_definitions;
DROP TABLE IF EXISTS documents;

CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT,
  content TEXT NOT NULL,
  content_hash TEXT,
  embedding BLOB,
  embedding_model TEXT DEFAULT 'all-MiniLM-L6-v2',
  embedding_dim INTEGER DEFAULT 384
);

CREATE VIRTUAL TABLE IF NOT EXISTS vec_documents USING vec0(embedding FLOAT[384]);

CREATE TABLE document_tags (
  document_id INTEGER,
  tag TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag)
);

CREATE TABLE document_relations (
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  FOREIGN KEY (source_path) REFERENCES documents (path) ON DELETE CASCADE,
  PRIMARY KEY (source_path, target_path, relation_type)
);

CREATE TABLE antipattern_definitions (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  graveyard_ref TEXT,
  pattern TEXT NOT NULL,
  file_patterns TEXT NOT NULL,
  exemptions TEXT
);

CREATE TABLE IF NOT EXISTS fitness_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  score REAL NOT NULL,
  metadata_score REAL NOT NULL,
  coherence_score REAL NOT NULL,
  conformance_score REAL NOT NULL,
  features_score REAL NOT NULL,
  details_json TEXT
);

CREATE TABLE IF NOT EXISTS agent_session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE reconciliation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_path TEXT,
  check_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  antipattern_id TEXT,
  FOREIGN KEY (antipattern_id) REFERENCES antipattern_definitions (id) ON DELETE SET NULL
);

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Anleitung.md',
  'Anleitung',
  'active',
  '# 🚨 CRITICAL DIRECTIVE FOR ALL AI AGENTS 🚨

**WARNING: DO NOT MODIFY ANYTHING IN THIS REPOSITORY!**
This is a reference project only. You are strictly forbidden from altering, deleting, creating, oder compiling ANY files within this absolute path:
`C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\aktueller_arbeitsordner\`

Your ONLY permitted action in this directory is to **READ** files to understand the architectural principles. Look, learn, and apply the principles to your own target repository (whether it''s Web or NixOS).

---

# Das "Next-Level" Agentic-Workflow Blueprint

Dieses Projekt ist das perfekte Blueprint für unsere hochstrukturierte Arbeitsweise. Egal ob wir an einer Web-App oder an **NixOS-Systemkonfigurationen** arbeiten – die Herangehensweise, wie wir Wissen konservieren, planen und Architekturen aufbauen, bleibt identisch.

## 1. Das Mindset: Vanilla & Zero-Dependency (Web & NixOS)
Wir meiden Komplexität und "Magie" von drittanbietern.
- **Im Web:** 100% Vanilla JS/CSS. Keine Frameworks wie React, keine Build-Tools. Die native Engine (Popover API, CSS Anchors) erledigt die Arbeit.
- **In NixOS:** Analog dazu nutzen wir native Nix-Flakes, saubere Module und vermeiden unnötige Abstraktionen oder fremde "Wrapper", wenn die nativen NixOS-Optionen ausreichen. "Keep it simple and robust."

## 2. Der Agentic Workflow (Wie wir planen)
Wir arbeiten hochstrukturiert, bevor auch nur eine Zeile Code geschrieben wird:
1. **Analysieren:** Wir lesen den aktuellen Zustand (z.B. Nix-Config oder JS-Files) und konsultieren die Wissens-Datenbank.
2. **Implementation Plan:** Wir erstellen einen detaillierten `.md` Plan. Der Nutzer muss diesem Plan mit einem expliziten *Go* zustimmen. Offene Fragen oder Warnungen heben wir mit GitHub-Alerts (`> [!IMPORTANT]`) hervor.
3. **Task-Checkliste:** Wir tracken den Fortschritt in einer atomaren `task.md`.
4. **Walkthrough:** Nach getaner Arbeit fassen wir das Ergebnis und den Mehrwert zusammen. Kein ungefragtes "Verschlimmbessern" bestehender, funktionierender Logik.

---

# 🧠 Knowledge Management & Single Source of Truth

Das Herzstück unserer perfekten Zusammenarbeit ist, dass das KI-System nichts vergisst und Entscheidungen Monate später noch nachvollziehen kann. Dies erreichen wir durch ein stark vernetztes Doku- und Datenbank-System.

## A. ADRs (Architecture Decision Records)
Sobald eine fundamentale Entscheidung getroffen wird (z.B. "Wir nutzen jetzt das native Toast Popover" oder "Wir strukturieren NixOS-Home-Manager Module nach Topics"), schreiben wir ein kurzes ADR.
- **Wo:** `docs/10-architecture/ADR/`
- **Warum:** Damit zukünftige Agenten lesen können, *warum* etwas so gebaut wurde und es nicht aus Unwissenheit "weg-refactoren".

## B. Guides & Traceability
- **Guides:** Für komplexe Systeme (wie das Toast-System oder ein spezielles NixOS-Deployment) schreiben wir `docs/20-implementation/Guides/`.
- **Verknüpfung im Code:** In den Quellcode-Dateien platzieren wir Meta-Tags (z.B. `// @adr [[ADR-Toast-Architecture]]` oder `# @guide [[nixos-deployment]]`). Das triggert den Agenten, diese Dateien bei Änderungen als Kontext zu laden.

## C. Die MCP-Datenbanken (MemDB & SQLite)
Das ist der absolute "Next-Level" Trick: Wir verlassen uns nicht nur auf Markdown-Dateien! 
Wir nutzen unsere **Model Context Protocol (MCP)** Tools (wie `din_brief_sqlite` oder `nixos_sqlite`), um High-Level-Erkenntnisse ("Insights") permanent ins Langzeitgedächtnis zu pushen.
- **Der Befehl:** Wenn wir eine Architektur verabschieden, nutzen wir z.B. das Tool `append_insight` und schreiben die Essenz der Entscheidung in die SQLite Datenbank.
- **Der Effekt:** Wenn der Nutzer Monate später in einem völlig neuen Chat etwas fragt, kann das Modell über `read_query` oder semantische Suche in der Datenbank sofort die alten Insights und Architektur-Präferenzen abrufen. Das System lernt physisch mit.

---
**An den Agenten, der das liest:**
Nutze exakt diese 3 Säulen (ADRs, Guides, Datenbank-Insights) und den strukturierten Planning-Workflow für das Projekt, in dem du *eigentlich* arbeitest (z.B. dein NixOS-Projekt). Lese die `docs/` hier als Referenz, aber verändere in diesem Ordner *niemals* etwas!',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'boilerplate.config.json',
  'boilerplate.config.json',
  'active',
  '{
  "projectName": "DIN-Brief Neo",
  "boilerplateVersion": "1.0.0",
  "activeAntipatterns": [
    "base",
    "web",
    "project"
  ],
  "paths": {
    "docsDir": "./docs",
    "codeDir": "./website"
  },
  "featureChecks": {
    "strictMetadata": true,
    "strictLinks": true
  }
}
',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'boilerplate.config.json'), 'json');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/00-foundation/constitution.md',
  'Verfassung (Constitution) — DIN-BriefNEO',
  'active',
  '# Verfassung (Constitution) — DIN-BriefNEO

Dieses Dokument ist das unverrückbare und absolut bindende Regelwerk (Rulebook) des Projekts **DIN-BriefNEO**. Jede technische Entscheidung und Code-Implementierung muss bedingungslos mit dieser Verfassung im Einklang stehen.

---

## 1. Mission & Vision
DIN-BriefNEO ist eine minimalistische, hochperformante und vollkommen autarke Webanwendung zur Erstellung und zum PDF-Druck formaler Briefe nach der deutschen Norm **DIN 5008 (Form A & B)**. 
Das Projekt ist extrem langlebig konzipiert: Es läuft vollständig lokal im Browser, ohne Server und ohne Build-Systeme, und bleibt über Jahrzehnte hinweg direkt ausführbar.

---

## 2. Die fundamentalen Verbote (DONT''s)

### ❌ Fette Frameworks & Build-Tools
Es dürfen **keine** Frontend-Frameworks (React, Vue, Angular, Svelte, Next.js etc.) verwendet werden. Ebenso sind CSS-Utility-Frameworks (wie TailwindCSS) und Build-Tools (webpack, Vite, esbuild, Babel) verboten. Die Ausführung erfolgt über standardkonforme, pure ES-Module.

### ❌ Absolutes Scroll-Verbot
In der gesamten Anwendung darf **kein einziger Scrollbalken** auftauchen – weder vertikal noch horizontal. Jedes UI-Element, jede Sidebar und das Briefblatt selbst müssen sich elastisch und ohne Überlauf innerhalb der exakten Grenzen des Viewports bewegen.

### ❌ Keine Native App & Keine Browser-Erweiterung
DIN-BriefNEO wird ausschließlich als responsive, standardkonforme **Webseite / Web App (PWA)** entwickelt. Es werden unter keinen Umständen native Apps (Electron, Capacitor) oder Browser-Erweiterungen (WebExtensions) gebaut.

### ❌ Keine komplexen Server-Datenbanken
Wir verzichten auf serverseitige Datenbanken oder Speicher-APIs, die einen aktiven Serverkontext zwingend voraussetzen (wie OPFS ohne Service Worker).

### ❌ Keine externen Abhängigkeiten & CDNs (Absolute Dependency Purity)
Es dürfen keine externen CDNs, Bibliotheken, Web-Fonts (z. B. Google Fonts) oder Skripte über das Netzwerk geladen werden. Die Anwendung muss vollkommen autark und isoliert im Offline-Zustand funktionieren. Alle Ressourcen (Schriften, CSS, JS) müssen lokal im Verzeichnis liegen.

---

## 3. Die fundamentalen Gebote (DO''s)

### ✅ HTML > CSS > JavaScript
Entwickelt wird streng nach dem Prinzip der absteigenden Komplexität:
1. **HTML First:** Verwendung nativer, semantischer HTML5-Elemente (z. B. `<dialog>`, `<popover>`, `contenteditable="plaintext-only"`).
2. **CSS Second:** Layouts (CSS Grid, Flexbox), Interaktionen (Checked-Tricks, native Popover-Events) und Themes werden vorrangig über CSS gelöst.
3. **JavaScript Last:** JS fungiert ausschließlich als deklarative Logik-Schicht (API-Abfragen, LocalStorage-Sync, Berechnungen).

### ✅ Lokale Persistenz rein über LocalStorage
Alle Briefentwürfe, Profileinstellungen und API-Schlüssel werden ausschließlich über die native **Web Storage API (LocalStorage)** des Browsers gesichert. Dies garantiert maximale Offline-Fähigkeit ohne Server.

### ✅ Nutzung moderner CSS-Features (Chrome 148+ Baseline)
Da die Ziel-Laufzeitumgebung Google Chrome v148+ ist, nutzen wir modernste native CSS-APIs:
- `light-dark()` zur automatischen Theme-Steuerung.
- `oklch()` für exakte, harmonische Farbräume.
- **CSS Anchor Positioning** für Tooltips und Menüs ohne JS.
- `field-sizing: content` für automatisch wachsende Eingaben ohne Scrollbars.

### ✅ Spec-First Workflow
Keine Codeänderung ohne Spezifikation. Jedes neue Feature durchläuft die Stufen:
`Specify` (Anforderung klären) ➔ `Plan` (Technologie wählen) ➔ `Tasks` (Tickets schreiben) ➔ `Implement` (Code schreiben).

### ✅ Technische Schuldenfreiheit
Jede Abweichung von den Kernprinzipien oder jede optionale Erweiterung/Abhängigkeit muss zwingend über eine MADR-konforme ADR begründet, dokumentiert und freigegeben werden. Technische Schulden sind ausgeschlossen.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/constitution.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/constitution.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/constitution.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/00-foundation/Immutable-Law-Catalog.md',
  'Immutable Law Catalog (MUST-USE vs FORBIDDEN)',
  'active',
  '# DIN‑BriefNEO — Immutable Architectural Law: MUST‑USE vs. ANTIPATTERN Catalog

**Status:** Eternal · Non‑Negotiable · Redundantly Embedded
**Baseline:** Chrome 148+ (2026) · Zero Dependencies · file:/// Offline‑First
**Override Rule:** Any change to this catalog requires a formal ADR explicitly referencing this document and a unanimous approval by all project architects.

------

## PART I — MUST‑USE TECHNOLOGY CATALOG

Every technology, API, pattern, and practice that MUST be used exclusively. No alternatives are permitted. Each entry includes: exact name, governing W3C/WHATWG specification or living standard, minimum Chrome version, and architectural purpose.

### HTML Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| H1   | Semantic Custom Elements (`<din‑5008>`, `<din‑page>`, `<din‑address‑zone>`, `<din‑recipient>`, `<din‑infoblock>`, `<din‑subject>`, `<din‑salutation>`, `<din‑body>`, `<din‑closing>`, `<din‑signature>`, `<din‑attachments>`, `<din‑footer>`, `<din‑bank‑data>`, `<din‑fiscal‑data>`, `<din‑vcard>`) | HTML Living Standard §4.13 Custom Elements | 54 | Isomorphic mapping to DIN 5008 semantic zones; enables @scope isolation, container queries, and LLM‑readable DOM structure |
| H2   | `popover="manual"` (Native Popover API) | HTML Living Standard §6.12 The popover attribute | 114 | Browser‑managed top‑layer; no z‑index collisions; light‑dismiss‑ready; used for format‑toolbar, toasts, all overlays |
| H3   | `contenteditable="plaintext‑only"` | HTML Living Standard §7.5 Editing | 132 | Structural XSS prevention for metadata fields; no HTML injection possible at browser level |
| H4   | `contenteditable="true"` (letter body only) | HTML Living Standard §7.5 Editing | 1 | Enables controlled inline formatting (bold, underline, blockquote) exclusively in the letter core |
| H5   | Invoker Commands API (`commandfor`, `command`) | HTML Living Standard §6.12.5 Invoker Commands | 135 | JS‑free triggering of popovers, dialogs, and custom commands; eliminates event‑listener overhead |
| H6   | `<dialog>` element with `.showModal()` | HTML Living Standard §4.11.4 The dialog element | 37 | Focus‑trapped, modal‑layer dialog for destructive actions; proper accessibility semantics |
| H7   | `<script type="module">` (ES Modules) | HTML Living Standard §4.12.1 The script element | 61 | Native module system; no bundlers; explicit dependency graph; file:/// compatible |
| H8   | No inline scripts (except anti‑FOUC IIFE) | Project Constitution | — | Prevents CSP violations; maintains strict separation of concerns |
| H9   | Unique `id` attributes throughout | HTML Living Standard §3.2.6 Global attributes | 1 | No undefined behavior from duplicate IDs; reliable JS/CSS targeting |
| H10  | WAI‑ARIA attributes (`aria‑pressed`, `aria‑hidden`) | WAI‑ARIA 1.2 / HTML Living Standard §3.2.6 | 1 | Screen‑reader feedback for formatting states and UI visibility; mandated by accessibility guidelines |
| H11  | `<meta name="chrome‑minimum‑version" content="148">` | Project Constitution | 148 | Explicitly guards against older Chrome versions that lack required APIs |

### CSS Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| C1   | `oklch()` color space (EXCLUSIVELY) | CSS Color Level 4 §10.2 OKLCH | 111 | Perceptually uniform; mathematically precise contrast/lightness manipulation; enables Relative Color Syntax |
| C2   | `light‑dark()` function | CSS Color Level 5 §4.1 | 123 | JS‑free theme switching; browser automatically selects correct value based on `color‑scheme` |
| C3   | CSS Anchor Positioning (`anchor‑name`, `position‑anchor`, `position‑area`, `position‑try‑options`, `anchor‑scope`) | CSS Anchor Positioning Level 1 | 125 | JS‑free positioning of popovers/tooltips relative to anchor elements; eliminates all manual coordinate calculations |
| C4   | View Transitions API (`document.startViewTransition()`) | CSS View Transitions Level 1 | 126 | Hardware‑accelerated, browser‑optimized cross‑fades for form A/B switching, theme changes, navigation |
| C5   | `@scope` at‑rule | CSS Cascading Level 6 §6.3 | 118 | Hermetic style isolation for DIN‑a4 components; no Shadow DOM complexity needed |
| C6   | `@property` with typed custom properties | CSS Properties and Values API Level 1 | 146 | Enables animated, typed CSS custom properties (e.g., `‑‑guide‑opacity` as `<number>`) |
| C7   | Relative Color Syntax (`oklch(from …)`) | CSS Color Level 5 §4.2 | 119 | Dynamically computes color variants (hover, glow, complementary) from base colors; no static color copies |
| C8   | `interpolate‑size: allow‑keywords` | CSS Values Level 4 | 129 | Enables native transitions to/from `height: auto`; no JS `max‑height` hacks |
| C9   | `calc‑size(auto, …)` | CSS Values Level 4 | 129 | Smooth transitions for expanding/collapsing sidebar modules |
| C10  | `field‑sizing: content` | CSS Basic User Interface Level 4 | 123 | Auto‑growing input fields without JS ResizeObserver; scroll‑free text areas |
| C11  | `contrast‑color()` | CSS Color Level 6 | 147 | Automatic, browser‑calculated accessible text color on accent backgrounds; WCAG 2.2 compliant |
| C12  | Scroll‑driven Animations (`animation‑timeline: scroll()`) | CSS Scroll‑driven Animations Level 1 | 115 | Render‑loop‑free animations tied to scroll position |
| C13  | `:has()` parent selector | CSS Selectors Level 4 §6.6 | 105 | Reactive UI states without JS: e.g., `:root:has(#layout‑a:checked)` for form switching |
| C14  | Container Queries (`container‑type: size`, `cqw`, `cqh`) | CSS Containment Level 3 | 105 | Proportional DIN 5008 scaling; all dimensions in relative units; pixel‑perfect WYSIWYG |
| C15  | Discrete Transitions (`@starting‑style`, `transition‑behavior: allow‑discrete`) | CSS Transitions Level 2 / CSS Positioned Layout Level 4 | 117 | Smooth entry/exit animations for popovers and toasts; no JS animation libraries |
| C16  | Native CSS Nesting | CSS Nesting Level 1 | 120 | Hierarchical style organization without preprocessors |
| C17  | No vendor prefixes (`‑webkit‑`, `‑moz‑`, etc.) | CSS Snapshot 2026 | 148 | All used features are standardized; prefixes are dead weight |
| C18  | `var()` ALWAYS with fallback (`var(‑‑prop, fallback)`) | CSS Custom Properties Level 1 | 49 | Prevents silent rendering failures when a custom property is missing |
| C19  | `overflow: hidden` on `html` and `body` | CSS Overflow Level 3 | 1 | Absolute scroll‑bar prohibition; app‑shell feel |
| C20  | `@media print` with dedicated print styles | CSS Conditional Rules Level 3 | 1 | Print sovereignty: white paper, black text, no sidebars, no guides |
| C21  | `text‑overflow: ellipsis` | CSS Overflow Level 3 | 1 | Clean truncation of overflowing text in constrained areas |
| C22  | `hyphens: auto` with `lang="de"` | CSS Text Level 3 | 55 | Correct German hyphenation in the letter body |

### JavaScript Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| J1   | Temporal API (`Temporal.Now.plainDateISO()`) | ECMAScript 2025 §Temporal | 146 | Immutable, timezone‑safe, offline‑capable date handling; replaces all legacy Date usage |
| J2   | EditContext API | HTML Living Standard §7.6 The EditContext API | 121 | High‑performance, low‑level text input for contenteditable areas; superior to raw contenteditable for letter body |
| J3   | Sanitizer API + `element.setHTML()` | HTML Sanitizer API | 147 | Native XSS protection for dynamic HTML insertion; replaces unsanitized innerHTML |
| J4   | `replaceChildren()` for clearing containers | DOM Living Standard §4.2.6 Interface ParentNode | 86 | Modern, spec‑conformant alternative to `innerHTML = ''''`; no parser invocation |
| J5   | `AbortController` for all `fetch()` calls | Fetch Living Standard §5.1 | 66 | Cancels in‑flight requests; prevents race conditions during rapid typing |
| J6   | `fetch()` API exclusively (no XHR) | Fetch Living Standard | 42 | Promise‑based, cleaner, standard‑conformant network requests |
| J7   | ES Modules with explicit `.js` extensions | ECMAScript 2025 §Modules | 61 | Native dependency graph; file:/// compatible; no bundler needed |
| J8   | Selection & Range API for ALL text formatting | HTML Living Standard §7.4 The Selection API / DOM Living Standard §4.3 Interface Range | 1 | Wraps/unwraps text in `<b>`, `<u>`, `<blockquote>` without deprecated execCommand |
| J9   | `Promise.withResolvers()` | ECMAScript 2025 §Promise | 119 | Cleaner async control flow; external resolve/reject assignment |
| J10  | `Array.prototype.toSorted()`, `.toReversed()`, `.with()` | ECMAScript 2025 §Array | 110 | Immutable array operations; no unintended side effects |
| J11  | `Object.groupBy()` | ECMAScript 2025 §Object | 117 | Native data grouping; replaces complex `reduce()` loops |
| J12  | `Math.sumPrecise()` | ECMAScript 2025 §Math | 147 | Lossless floating‑point summation for DIN geometry calculations |
| J13  | `Navigation` API | Navigation API Living Standard | 102 | Modern, event‑driven routing for single‑page app navigation |
| J14  | Debounced `selectionchange` listener (50ms) | HTML Living Standard §7.4 | 1 | Toggles popover visibility only; does NOT calculate positions (CSS Anchor Positioning handles that) |
| J15  | External `<div id="selection‑anchor">` for CSS Anchor Positioning bridge | Project Architectural Decision | 125 | Temporary, tolerated JS coordinate assignment to a DOM‑external anchor; the ONLY exception to the "no JS for layout" rule |

### Storage & Persistence Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| S1   | `localStorage` API EXCLUSIVELY | Web Storage Living Standard | 4 | Only stable, CORS‑free storage under file:///; holds drafts, settings, custom fonts, API keys |
| S2   | JSON serialization for all stored data | ECMAScript 2025 §JSON | 1 | Structured, parseable, debuggable persistence format |
| S3   | Base64 encoding for custom WOFF2 fonts | Web Storage Living Standard + FileReader API | 1 | Offline font storage without external CDNs |

### Tooling & External Dependencies Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| T1   | Zero runtime dependencies | Project Constitution | — | file:/// double‑click execution; no npm packages in production |
| T2   | No CDNs, no external servers | Project Constitution | — | DSGVO‑compliant; fully offline; no IP leaks to third parties |
| T3   | Local system‑font stacks | CSS Fonts Level 3 | 1 | Reliable, offline typography; optional WOFF2 uploader for custom fonts |
| T4   | Inline SVGs for all icons | SVG 1.1 / CSS Images Level 3 | 1 | No icon font downloads; crisp at any resolution; accessible |
| T5   | Node.js dev‑tools (Playwright, vision scripts) strictly limited to build‑time | Project Constitution | — | Clear boundary: dev‑tools are NOT part of the delivery artifact |

### Documentation & LLM‑First Layer

| #    | MUST‑USE | Specification / Standard | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| D1   | Markdown with YAML frontmatter for ALL specs, ADRs, guides, changelogs | CommonMark + YAML 1.2 | Human‑readable, Git‑diffable, machine‑parseable documentation |
| D2   | SQLite FTS5 knowledge base (`DIN‑Brief_docs.db`) | SQLite 3.43+ | LLM‑first hybrid keyword+fulltext search; prefix indexes (`''2 3''`); `unicode61` tokenizer for German |
| D3   | Automatic FTS5 sync triggers (`tbl_ai`, `tbl_ad`, `tbl_au`) | SQLite 3.43+ | Real‑time index updates on INSERT/DELETE/UPDATE |
| D4   | Pre‑defined views (`v_accepted_adrs`, `v_active_docs`, `v_document_index`) | SQLite 3.43+ | O(1) LLM access to common queries; no repetitive JOINs |
| D5   | `DIN‑Brief_docs.db` compiled directly via Node.js `node:sqlite` module | Node.js 22.5+ | Zero‑dependency build; no external `sqlite3.exe`; FTS5 guaranteed |
| D6   | `MASTER‑DO‑DONT‑DEPRECATED.md` as central SSoT lawbook | Project Constitution | Single authoritative reference for all MUST‑USE and ANTIPATTERN items |
| D7   | ALL AI agents receive this complete MUST‑USE/ANTIPATTERN catalog as system prompt | Project Constitution | No agent can plead ignorance; guaranteed compliance in every interaction |
| D8   | MCP configuration: exactly four relevant servers (SQLite documents, SQLite memory, project‑scoped filesystem, Context7) | Model Context Protocol 1.0 | Hermetic project isolation; no cross‑contamination with other projects |

------

## PART II — FORBIDDEN ANTIPATTERN CATALOG

Every technology, API, pattern, and practice that is eternally banned. Each entry includes: the banned item, the exact MUST‑USE replacement, and the precise reason for its banishment. Violations are rejected in code review automatically.

### Legacy JavaScript APIs

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A1   | `new Date()` / `Date.now()` / `Date.parse()` | Temporal API (`Temporal.Now.plainDateISO()`) | Mutability, 0‑based months, unreliable timezone handling, flawed design recognized by TC39 |
| A2   | `document.execCommand()` / `document.queryCommandState()` | Selection & Range API with DOM traversal | Deprecated; being removed from browser engines; unpredictable behavior across versions |
| A3   | `XMLHttpRequest` (XHR) | `fetch()` API | Outdated, non‑Promise, blocking‑prone; fetch is the modern standard |
| A4   | `innerHTML` for dynamic content (unsanitized) | `element.setHTML()` with Sanitizer API, or `textContent` | XSS vulnerability; unsanitized HTML injection from user input or API responses |
| A5   | `element.innerHTML = ''''` (for clearing) | `element.replaceChildren()` | Invokes HTML parser unnecessarily; performance and security anti‑pattern |
| A6   | `event.returnValue` / `event.cancelBubble` | `event.preventDefault()` / `event.stopPropagation()` | Deprecated; proprietary Microsoft relics |
| A7   | `document.all` | `document.getElementById()` / `document.querySelector()` | Deprecated proprietary Microsoft relic; kept only for legacy compatibility |
| A8   | `document.clear()` | Standard DOM manipulation (`replaceChildren()`) | Removed from the standard |
| A9   | `document.createEvent()` | `new Event()` constructor | Deprecated; replaced by standard Event constructor |
| A10  | `window.showModalDialog()` | `<dialog>` element + `.showModal()` | Removed from Chrome since version 37; blocking, non‑accessible |
| A11  | `HTMLInputElement.align` / `HTMLElement.style.pixelLeft` | Standard CSS (Flexbox, Grid, absolute positioning) | Removed; proprietary IE‑era pixel values |
| A12  | `setTimeout` / `setInterval` for UI animations | CSS `@keyframes`, `transition`, `animation` | JS‑driven animations block the main thread; CSS animations are hardware‑accelerated and compositor‑friendly; JS timers ONLY as safety nets (e.g., 3000ms toast timeout) |
| A13  | Vendor prefixes (`‑webkit‑`, `‑moz‑`, `‑ms‑`, `‑o‑`) | Standardized, prefix‑free CSS | Dead weight in Chrome 148+; all used features are standardized |
| A14  | `webkitRequestAnimationFrame` / `mozRequestAnimationFrame` | `requestAnimationFrame` | Prefixes removed; standard API is cross‑browser stable |
| A15  | `console.log()` in production code | Deactivated custom logging wrapper | Exposes sensitive data, slows DOM processing; must be stripped or globally muted |

### Legacy Color Spaces & Styling

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A16  | Hex colors (`#RRGGBB`, `#RGB`) | `oklch()` | Non‑perceptually‑uniform; blocks Relative Color Syntax; unpredictable contrast scaling |
| A17  | `rgb()` / `rgba()` | `oklch()` | Non‑perceptually‑uniform; inferior to OKLCH for all color operations |
| A18  | `hsl()` / `hsla()` | `oklch()` | Perceptually distorted lightness; mathematically inferior for dynamic color computation |
| A19  | Named CSS colors (`white`, `black`, `red`, `gray`, etc.) | `oklch()` equivalents | Inconsistent rendering across browsers; cannot be used with Relative Color Syntax |
| A20  | `transparent` keyword | `oklch(0% 0 0 / 0%)` | Preferred to use OKLCH with zero alpha for consistency |
| A21  | CSS Preprocessors (Sass, Less, Stylus) | Native CSS Nesting + Custom Properties | Build‑step dependency; native CSS nesting is a W3C living standard |
| A22  | CSS‑in‑JS (Styled Components, Emotion, etc.) | Pure CSS stylesheets with `@scope` and `@property` | JS runtime overhead; violates CSS‑first principle; complicates file:/// execution |
| A23  | `@import` in CSS files | Native `<link>` tags in HTML | Blocks parallel loading; performance anti‑pattern |
| A24  | `var()` WITHOUT fallback | `var(--prop, fallback)` | Silent rendering failure if custom property is undefined |
| A25  | Inline `style="..."` attributes for colors or layout | External CSS stylesheets with `@scope` | Breaks `@scope` isolation; overrides Relative Color Syntax design tokens; the ONLY exception: temporary JS coordinates for the external selection anchor |
| A26  | `filter: invert(1)` for dark mode | `light‑dark()` with OKLCH | Destroys color integrity, especially on the letter paper; inaccessible |

### External Dependencies & Frameworks

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A27  | Any SPA framework (React, Vue, Svelte, Angular, etc.) | Vanilla HTML/CSS/JS ES Modules | Massive dependency chains; build‑system requirement; rapid obsolescence; incompatible with file:/// |
| A28  | jQuery | Native DOM APIs (`querySelector`, `fetch`, `classList`, etc.) | Obsolete; all functionality is now native, faster, and standards‑compliant |
| A29  | CSS utility frameworks (TailwindCSS, Bootstrap) | Native CSS with `@scope`, `@property`, and semantic classes | Destroys semantic CSS architecture; requires build tools; Tailwind generates massive unused class bloat |
| A30  | TypeScript / Babel / any JS transpiler | Vanilla ES Modules with JSDoc for type hints | Build‑step dependency; breaks file:/// double‑click; native ESM suffices |
| A31  | Build tools (Webpack, Vite, esbuild, Rollup) | Native ESM `<script type="module">` | Unnecessary complexity; browser is the runtime compiler; build tools break over time |
| A32  | JS utility libraries (Lodash, Underscore, Ramda) | Native ES6+ Array/Object methods (`map`, `filter`, `reduce`, `find`, etc.) | Bloat; native methods are faster, standardized, and always available |
| A33  | JS animation libraries (GSAP, Anime.js, jQuery.animate) | CSS `@keyframes`, `transition`, `animation`, View Transitions API | Main‑thread blocking; CSS animations are hardware‑accelerated, compositor‑friendly, and JS‑free |

### Storage & Networking

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A34  | IndexedDB | `localStorage` | Requires HTTPS or localhost; throws SecurityError under file:///; overkill for DIN‑Brief data volumes |
| A35  | OPFS (Origin Private File System) | `localStorage` | Undefined, unreliable behavior under file:/// in Chrome on Windows; Corset Rule 7 explicitly forbids it |
| A36  | File System Access API | `localStorage` | Requires HTTPS; throws SecurityError under file:/// |
| A37  | Service Workers (under file:///) | Pure file:/// with relative paths (no SW needed) | Registration throws SecurityError under file:///; all assets are local, so offline capability is inherent |
| A38  | External CDNs (cdnjs, unpkg, Google Fonts, etc.) | Local system‑font stacks + optional WOFF2 Base64 upload | Breaches DSGVO (IP leak to third party); destroys offline capability; creates dependency on external server availability |

### Icons & Fonts

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A39  | Icon CDNs (FontAwesome, Lucide, Material Icons CDN) | Inline SVGs | DSGVO violation; offline‑killer; loads hundreds of unused glyphs |
| A40  | Icon fonts (any `.woff`/`.woff2` icon font) | Inline SVGs | Entire font loaded for a handful of icons; inaccessible; poor rendering at small sizes |
| A41  | Google Fonts or any external font service | Local system‑font stacks + optional WOFF2 Base64 upload | DSGVO violation; offline‑killer; IP leak to Google servers |

### Structural & Architectural

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A42  | Duplicate `id` attributes anywhere in the DOM | Unique `id` attributes (W3C conformance) | Undefined behavior; `getElementById()` returns unpredictable results; HTML validation failure |
| A43  | Scrollbars anywhere in the viewport | `overflow: hidden` on `html`/`body`; internal `overflow‑y: auto` with hidden scrollbar for sidebars | Destroys premium app‑shell aesthetics; violates DIN 5008 WYSIWYG proportionality |
| A44  | Non‑semantic `<div>`/`<span>` overuse | Semantic Custom Elements from the IMR 4.0 catalog | Impaired readability for developers and LLMs; no structural meaning; harder to style with `@scope` |
| A45  | Project‑crossing references (e.g., NixOS paths in DIN‑Brief configuration) | Hermetic project isolation; strict directory boundaries; MCP server scope enforcement | Hallucination risk; context contamination; corrupted audits |
| A46  | `page-break-before: always;` on layout roots | `page-break-after: avoid;` or controlled printing | Results in a completely blank first page during PDF generation |
| A47  | Complex UI components inside `contenteditable="true"` | Isolate text and visual components as siblings within a non-editable wrapper | Browser wipes inner HTML structure completely when user types |

------

## PART III — REDUNDANT EMBEDDING MANDATE

This catalog is not a suggestion. It is architectural law and must be redundantly embedded in every relevant project file. Loss of any single file must not result in loss of this knowledge.

The catalog (both MUST‑USE and ANTIPATTERN lists) shall be embedded, in whole or in structured parts, in the following locations:

| #    | File | Embedding Method |
| :--- | :--- | :--- |
| E1   | `constitution.md` (Project Constitution) | Full catalog as an appendix titled "Immutable Technology Law" |
| E2   | `MASTER‑DO‑DONT‑DEPRECATED.md` | This file IS the lawbook; it shall contain the complete, unabridged catalog as its primary content |
| E3   | `Guides/longevity‑guidelines.md` | MUST‑USE items integrated into the "5 Pillars of Longevity"; ANTIPATTERNS in the deprecated APIs table |
| E4   | `ADR/ADR‑TECH‑STACK.md` | All MUST‑USE items listed in the technology stack tables with rationale |
| E5   | `ADR/ADR‑ANTIPATTERN.md` | All ANTIPATTERN items documented with their full reasoning and replacements |
| E6   | `ADR/ADR‑CSS.md` | CSS‑specific MUST‑USE and ANTIPATTERN subsets |
| E7   | `ADR/ADR‑JS.md` | JS‑specific MUST‑USE and ANTIPATTERN subsets |
| E8   | `ADR/ADR‑HTML.md` | HTML‑specific MUST‑USE and ANTIPATTERN subsets |
| E9   | `DEV‑INFO.md` (Feature Detection Matrix) | Each MUST‑USE item listed with its detection method and Chrome baseline |
| E10  | `README‑DB.md` (LLM‑First Database Guide) | SQLite‑related MUST‑USE items documented as the database schema reference |
| E11  | `README.md` (Master Portal) | A summary section "Unser unveränderliches Technologie‑Gesetz" with a link to `MASTER‑DO‑DONT‑DEPRECATED.md` |
| E12  | `GEMINI.md` / System Prompt for ALL AI agents | Complete catalog injected as a system prompt or rules file; agents must reject any proposal violating an ANTIPATTERN |
| E13  | SQLite knowledge base (`DIN‑Brief_docs.db`) | The catalog document itself indexed into the `documents` table with tags `[law, must‑use, antipattern, immutable]` and full‑text searchable via FTS5 |
| E14  | `DIN‑Brief_docs.db` pre‑defined view `v_law_catalog` | A dedicated view exposing all MUST‑USE and ANTIPATTERN items for LLM retrieval |
| E15  | `.github/CODEREVIEW.md` or equivalent | Automated code review checklist referencing this catalog; any PR violating an ANTIPATTERN is auto‑rejected |

------

## PART IV — AMENDMENT PROTOCOL

This catalog is immutable. Any proposed change—addition, removal, or modification—must follow this protocol:

1. A formal ADR must be written, explicitly referencing this document.
2. The ADR must justify the change with technical evidence (not opinion).
3. The ADR must be reviewed and approved by all active project architects.
4. Upon approval, the ADR itself becomes part of the catalog, and all redundant embeddings (E1–E15) must be updated synchronously.
5. The SQLite knowledge base must be re‑compiled and the affected views refreshed.

No change takes effect until all five steps are complete.

------

## PART V — ENFORCEMENT

**Code Review:** Every pull request is checked against this catalog. Any line of code using an ANTIPATTERN is automatically rejected with a reference to the specific item number.

**AI Agents:** Every AI assistant receives this catalog as a system prompt or rules file. Any suggestion violating the catalog must be immediately retracted. AI agents may NOT suggest workarounds or exceptions.

**CI/CD:** A linting pipeline (if introduced) must include: OKLCH‑only color validation, Temporal API usage checker, execCommand/Date()/innerHTML detectors, and duplicate ID validator.

**Build‑Time:** The Node.js build script (`build_db.js`) validates the catalog''s presence in the database and logs a warning if the `v_law_catalog` view is missing or empty.

------

**This document is effective immediately and supersedes all prior technology guidelines. It applies to all present and future contributors—human and artificial.**',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/Immutable-Law-Catalog.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/Immutable-Law-Catalog.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/Immutable-Law-Catalog.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/Immutable-Law-Catalog.md'), 'rules');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/Immutable-Law-Catalog.md'), 'standards');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/Immutable-Law-Catalog.md'), 'law');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/00-foundation/longevity-guidelines.md',
  'Guide: Longevity & W3C Native Standards Guidelines (Longevity Guide)',
  'active',
  '# Longevity & W3C Native Standards Guidelines (Longevity Guide)

## 1. Die Philosophie der "Wartungsfreiheit auf Lebenszeit"

> [!important] 10+ Jahre Wartungsfreiheit
> Moderne Webentwicklung leidet unter massiver Kurzlebigkeit. Frameworks veralten in wenigen Jahren, Build-Tools brechen durch Node.js-Versionswechsel, und externe CDNs verschwinden oder ändern ihre Pfade. 
> 
> **DIN-BriefNEO** bricht radikal mit diesem Zyklus. Ziel ist eine **möglichst lange Lebensdauer ohne Wartungsaufwand** (im Idealfall viele Jahre). Der Briefbogen muss im Jahr 2036 in jedem gängigen Webbrowser exakt so geladen, gerendert und bedient werden können wie heute.
> 
> Dies erreichen wir nicht durch Verzicht auf moderne Features, sondern durch das unnachgiebige Vertrauen in **native, standardisierte W3C/WHATWG Browser-Schnittstellen**.

### 1.1. Sicherheit vor Kompatibilität (Chrome 149+ Baseline)

> [!warning] Zero-Compromise Policy
> Ab Version X dieses Projekts gilt eine strikte, gnadenlose Null-Toleranz-Politik gegenüber Legacy-Fallbacks. Wir akzeptieren bewusst, dass das Projekt auf älteren Browsern bricht (Chrome 149+ Baseline), anstatt unsichere oder veraltete Praktiken beizubehalten.
> - **DOM-Manipulation:** `innerHTML` ist strengstens untersagt. Es dürfen ausschließlich sichere, native Methoden zur Injektion von Daten genutzt werden. Hierbei ist die Native W3C Sanitizer API (`setHTML()`) als Standard zu priorisieren. `setHTMLUnsafe()` ist nur als absolute Ausnahme (oder temporärer Fallback) bei bewusst gewünschtem ungefilterten HTML zulässig. Für einfachen Text gilt `textContent`.
> - **Datums-APIs:** Das veraltete `new Date()` Objekt wird nicht mehr toleriert. Wir setzen kompromisslos auf die W3C `Temporal` API, ohne Polyfills und ohne Fallbacks.

---

## 2. Die 5 Säulen der Langlebigkeit (Longevity Pillars)

### Säule 1: Der "Zero-Dependency" Pakt
Es dürfen **keinerlei externe Bibliotheken** (weder npm-Packages noch Skripte über CDN) in das Projekt integriert werden.
*   **Warum?** Bibliotheken wie React, Vue, jQuery oder Lodash ändern ihre APIs oder werden nicht mehr gepflegt. Native JavaScript-Standards hingegen brechen niemals abwärtskompatibel. Der Code, den wir schreiben, ist so nah an der Browser-Engine, dass er immun gegen Veraltung ist.
*   **Konkret:** DOM-Manipulation erfolgt über native Methoden (`querySelector`, `append`), Datumsformatierung über die native `Intl`-API und Netzwerkanfragen über `fetch`.

### Säule 2: 100%ige Autarkie (Offline-by-Default)
Die Anwendung muss vollständig autark funktionieren und lauffähig sein, wenn sie lokal als `file:///index.html` per Doppelklick geöffnet wird – selbst ohne Internetverbindung.
*   **Warum?** Wenn die Anwendung externe Ressourcen (z. B. Google Fonts oder CDN-Skripte) lädt, bricht sie zusammen, sobald der Benutzer offline ist oder die Server der Drittanbieter nicht erreichbar sind. Zudem verstößt jeder ungefragte IP-Abfluss an Dritte gegen die DSGVO.
*   **Konkret:** Alle Stylesheets, SVG-Bilder und Schriften werden lokal abgelegt oder im Bedarfsfall (Schriften-Manager) als Base64-Strings direkt im LocalStorage gesichert.

### Säule 3: W3C / WHATWG "Living Standards" Vorrang
Es werden ausschließlich Features genutzt, die im offiziellen HTML-, CSS- und JS-Standard als stabile "Living Standards" verankert sind und breite Browser-Unterstützung genießen.
*   **Warum?** Experimentelle Browser-Features (z. B. Vendor-Präfixe wie `-webkit-` oder proprietäre APIs) können jederzeit entfernt werden. Standardisierte Schnittstellen sind durch die W3C-Garantie der Abwärtskompatibilität geschützt.
*   **Konkret:** Wir nutzen die native **Popover API** für Toolbars und Toasts, **Container Queries** (`cqw`/`cqh`) für die proportionale Skalierung und die **Selection/Range-API** für Textformatierungen.

### Säule 4: Build-Tool-Immunität (Kein Compiler)
Die Anwendung nutzt **keinen** Compiler, keinen Bundler und kein Transpilier-Werkzeug (kein Webpack, kein Vite, kein Babel, kein Sass-Compiler). Wir akzeptieren nur dann einen Bundler, wenn er optional und ohne Breaking Changes bleibt.
*   **Warum?** Build-Tools sind die häufigste Ursache, warum alte Webprojekte nach Jahren nicht mehr gebaut werden können. Node.js-Updates brechen alte Konfigurationen, Abhängigkeiten blockieren sich gegenseitig.
*   **Konkret:** Das JavaScript ist reines, natives **ES-Modules (ESM)** mit expliziten Dateiendungen (z. B. `import { x } from ''./y.js''`). Der Browser selbst ist der Laufzeit-Compiler. Das CSS ist reines CSS3 mit nativen CSS-Variablen und CSS Nesting.

### Säule 5: LocalStorage als einziger Datenspeicher
Alle persistenten Daten (Entwürfe, Profilvorlagen, Schriften) werden ausschließlich im **LocalStorage** gesichert.
*   **Warum?** Moderne APIs wie IndexedDB, OPFS (Origin Private File System) oder die File System Access API setzen aus Sicherheitsgründen einen sicheren Server-Kontext (HTTPS oder `localhost`) voraus. Im lokalen Kontext (`file:///`) werfen sie Sicherheitsfehler. LocalStorage ist seit Chrome 4 (2010) die stabilste, CORS-freie und universellste Speicher-API der Web-Geschichte.

---

## 3. Richtlinien für zukunftssicheres Schreiben von Code

### A. JavaScript: Deklarativ & Sicher vor "deprecation"
*   **Vermeide deprecated APIs:** Nutze niemals veraltete Methoden wie `document.execCommand` oder `document.queryCommandState` zur Textmanipulation. Nutze stattdessen die zukunftssichere **Selection & Range API**, um Textknoten im DOM-Baum sauber zu traversieren und zu verändern.
*   **Standard-Shortcuts respektieren:** Schreibe keine eigenen Keydown-Handler für Standard-Shortcuts wie `Strg+B` oder `Strg+U`. Überlasse diese dem Standardverhalten des Webbrowsers im `contenteditable`-Bereich.
*   **Explizite ESM-Importe:** Importiere Module immer mit ihrer vollständigen Dateiendung `.js`.
    ```javascript
    // Richtig
    import { StorageManager } from ''./storage.js'';
    
    // Falsch
    import { StorageManager } from ''./storage'';
    ```

### B. CSS: Proportional & Deklarativ statt JS-Berechnung
*   **Layout über CSS, nicht JS:** Berechne Schriftgrößen oder Abstände niemals mit JavaScript `ResizeObserver`-Schleifen. Nutze stattdessen **CSS Container Queries** (`container-type: size` auf `<din-a4>`) und proportionale Einheiten (`cqw` und `cqh`).
*   **Keine JS-Farbinversionen:** Nutze für den Dark Mode niemals globale Filter (`filter: invert(1)`). Definiere stattdessen saubere, kontraststarke Farbvariablen über die native CSS-Funktion `light-dark()` mit standardisierten **OKLCH-Farbräumen**.
*   **Natives CSS Nesting:** Nutze die moderne native CSS-Verschachtelung statt CSS-Preprozessoren (wie SCSS oder Less).
    ```css
    /* Richtig & Nativ */
    din-a4 {
      background: white;
      &.overflow-warn {
        outline: 2px dashed red;
      }
    }
    ```

---

## 4. Deprecated Web-APIs & ihre modernen, stabilen Alternativen (Chrome 148+ / W3C Living Standard)

Für Entwickler und KIs gilt diese Tabelle als striktes Verbot veralteter Techniken und als Richtlinie für deren modernen Ersatz:

| Deprecated / Veraltet / Blockiert | Moderne Alternative (stabil, Chrome 148+) | Erläuterung & Rationale | Verweis |
| :--- | :--- | :--- | :--- |
| `document.execCommand` | **Selection & Range API** + `contenteditable` | `execCommand` ist veraltet und wird schrittweise aus den Browser-Engines gelöscht. Für die Toolbar-Formatierung nutzen wir die präzise Selection & Range API mit DOM-Manipulationen (`insertNode` / `extractContents`). | [[ADR-JS]] |
| `document.queryCommandState` | **Eigene DOM-Traversierung** (z. B. `isSelectionInsideTag`) | Da `queryCommandState` veraltet ist, prüfen wir den Formatierungszustand zukunftssicher über eine rekursive DOM-Baum-Suche nach oben bis zum Container `#brieftext`. | [[ADR-JS]] |
| `RGB` / `HSL` (für CSS-Farben) | **`oklch()` Farbräume** | RGB/HSL leiden unter ungleichmäßiger wahrgenommener Helligkeit. `oklch()` ist mathematisch präzise, wahrnehmungsgleichmäßig und ab Chrome 111+ voll etabliert. | [[ADR-CSS]] |
| `setTimeout` / `setInterval` für UI-Animationen | **CSS `@keyframes`, `transition`, `animation`** | Native CSS-Animationen sind hardwarebeschleunigt, stabiler und ressourcenschonender. JS-Timer werden ausschließlich als minimales Safety-Net (z. B. 3200ms bei Toasts) genutzt. | [[ADR-FEATURE]] |
| `XMLHttpRequest` (XHR) | **`fetch()` API** | `fetch()` ist der moderne, Promise-basierte, native Webstandard für asynchrone HTTP-Netzwerkanfragen und vollständig CORS-kompatibel. | [[ADR-API]] |
| `IndexedDB` / `OPFS` / `File System Access API` (unter `file://`) | **`localStorage` API** | Komplexe Speicher-APIs setzen zwingend HTTPS voraus. Unter `file:///` werfen sie Browser-Sicherheitsfehler. `localStorage` ist die einzig stabile, synchrone Offline-Speicherlösung für Doppelklick-Apps. | [[ADR-JS]], [[ADR-ANTIPATTERN]] |
| Externe CDNs / Google Web Fonts | **Lokaler System-Font-Stack** + optionaler **WOFF2-Uploader** | Externe Verbindungen zerstören die Offline-Lauffähigkeit und verstoßen gegen die DSGVO (IP-Abfluss). Schriften werden lokal deklariert oder per Base64 offline gesichert. | [[ADR-CSS]], [[ADR-FEATURE]] |
| `@import` in CSS-Dateien | Native **`link`-Tags** im HTML | `@import` in CSS blockiert das parallele Laden von Stylesheets im Browser. Mehrere native `<link>`-Tags laden Stylesheets parallel und performanter. | [[ADR-CSS]] |
| `var()` ohne Fallback | **`var(--prop, fallback)`** mit Standard-Redundanz | Um Darstellungsfehler bei unvorhergesehenen CSS-Definitionen zu vermeiden, müssen CSS-Variablen immer mit einem sinnvollen Fallback-Wert deklariert werden. | [[ADR-CSS]] |
| `user-select: none` (alleinstehend) | **`user-select: none`** + **`aria-hidden="true"`** | Um unbeabsichtigte Auswahlen auf Steuerelementen (z. B. der Toolbar) zu unterbinden, ist `user-select: none` erlaubt, muss aber aus Barrierefreiheitsgründen mit `aria-hidden` gekoppelt werden. | [[ADR-HTML]] |
| `console.log` in Produktion | Deaktivierbares **Custom Logging** oder Löschen | Debug-Logs in Produktion verlangsamen die Performance und können sensible Anwendungsdaten exponieren. Sie müssen vor Release entfernt oder global stummgeschaltet werden. | [[ADR-JS]] |
| `innerHTML` / `insertAdjacentHTML` für unsichere Inhalte | **`textContent`** oder **`createTextNode`** | Verhindert XSS-Sicherheitslücken beim Einfügen externer Daten (z. B. aus der Adress-API). Textinhalte werden als reiner Plaintext verarbeitet. | [[ADR-JS]] |
| `document.write` / `eval` | **Moderne DOM APIs** | Komplett veraltete und unsichere Methoden. Dürfen unter keinen Umständen in der Applikation vorkommen. | [[ADR-JS]] |

> [!TIP]
> **Nutzung von CSS Anchor Positioning ab Chrome 148+:**
> Da dieses Projekt exklusiv für moderne Laufzeitumgebungen ab Chrome 148+ entwickelt wird, nutzen wir das native **CSS Anchor Positioning** ohne Vorbehalte und ohne künstlichen JavaScript-Berechnungsoverhead! Dies vereinfacht die Positionierung von schwebenden Elementen (wie dem Format-Popover `#format-toolbar` oder Toasts) radikal, da sie rein deklarativ im CSS an ihren Anker gekoppelt werden. Ewiggestrige Browser-Engines ohne Support werden konsequent ignoriert (keine Rücksichtnahme für Plattformen, die hinterherhinken!).

---

## 5. Konsequenz

Jede Code-Modifikation wird im Code-Review unnachgiebig auf diese Richtlinien geprüft. Ein Feature, das eine externe Abhängigkeit einführt, die Offline-Kompatibilität beeinträchtigt oder auf nicht-standardisierten APIs aufbaut, wird bedingungslos abgelehnt. 

**Wir bauen kein kurzlebiges MVP – wir bauen ein digitales Denkmal.**



## 6. Regelmäßige Review
Da Web-Standards stetig weiterentwickelt werden, empfehlen wir eine Überprüfung dieser Richtlinien in regelmäßigen Abständen (z. B. alle 2 Jahre), um neue, stabile W3C-Standards in das Projekt aufzunehmen.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/00-foundation/README.md',
  '00-foundation README',
  'active',
  '# 00 Foundation
Das unveränderliche Fundament des Projekts.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/README.md'), 'readme');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/README.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/00-foundation/spec.md',
  'Spezifikation (Spec) — DIN-BriefNEO Baseline Features',
  'active',
  '# Spezifikation (Spec) — DIN-BriefNEO Baseline Features

> [!NOTE]
> Die exakten Maße und Geometriedaten gemäß dem DIN 5008 Standard findest du in unserem hochpräzisen Dokument. Dieses Dokument dient als Single Source of Truth (SSoT) für alle physischen Abstände.

Dieses Dokument beschreibt die Kernfunktionen des Refactored Prototyps. Jedes Feature ist nach dem **Spec-Kit-Modell** in Anforderung (`Specify`), Plan (`Plan`) und Aufgaben (`Tasks`) unterteilt.

---

## 🟢 Baseline Features (Umgesetzt)

#### Feature 1: Elastischer Viewport (No-Scroll Auto-Zoom)

### 1. Specify (Das "Was")
* **User Story:** Als Anwender möchte ich den virtuellen DIN A4 Briefbogen auf jedem Bildschirm (Desktop, Laptop, Tablet) vollständig und ohne Scrollbalken im Blick haben, damit ich das Brief-Layout direkt bearbeiten kann.
* **Akzeptanzkriterien:**
  - Das Briefblatt behält das exakte Seitenverhältnis von 210:297 (DIN A4).
  - Es entstehen weder vertikale noch horizontale Scrollbalken im Browserfenster.
  - Bei Größenänderung des Browserfensters skaliert das Blatt flüssig.

### 2. Plan (Das "Wie")
* **Technischer Ansatz:** 
  - Wir verzichten vollständig auf JavaScript-basierte Resize-Listener und transform-Skalierungen.
  - Das `<din-a4>` Element erhält eine feste, viewport-relative Höhe (`height: 94vh`) und ein exaktes DIN A4 Seitenverhältnis (`aspect-ratio: 210 / 297`).
  - Wir deklarieren `<din-a4>` als Container (`container-type: size`).
  - Alle Kind-Elemente, Schriftgrößen, Abstände und Positionen auf dem Briefbogen werden über relative Container Query Units (`cqw` und `cqh`) proportional skaliert. Bei Skalierung des Viewports skaliert das gesamte Brief-Layout pixelperfekt mit.

### 3. Tasks (Die Aufgaben)
- [x] `#viewport` und `din-a4` im HTML-Markup anlegen.
- [x] Globales `overflow: hidden` auf `html` und `body` setzen.
- [x] Container Query Units (`cqw`/`cqh`) und container-type deklarieren.
- [x] CSS-Sizing und proportionale Abstände in `css/layout.css` verankern.

---

### Feature 2: DIN Layout-Wechsler (Form A vs. Form B)

### 1. Specify (Das "Was")
* **User Story:** Als Briefschreiber möchte ich zwischen den offiziellen DIN 5008 Layouts "Form A" (Kopfhöhe 27mm) und "Form B" (Kopfhöhe 45mm) wechseln können, um verschiedene Briefbogen-Standards zu bedienen.
* **Akzeptanzkriterien:**
  - Der Wechsel erfolgt über eine Schaltfläche in der Sidebar.
  - Die Abstände von Absender, Empfänger, Infoblock, Faltmarken und Briefkern passen sich augenblicklich an die DIN-Vorgaben an.

### 2. Plan (Das "Wie")
* **Technischer Ansatz:**
  - Die Sidebar enthält Buttons für "Form A" und "Form B".
  - Das Script fügt bei Klick dem App-Shell-Element die Klasse `.form-a` oder `.form-b` hinzu.
  - Im CSS (`css/layout.css`) sind alle Positionen (z. B. Falzmarken, Top-Positionen des Briefkerns) in Abhängigkeit von dieser Klasse deklariert.

### 3. Tasks (Die Aufgaben)
- [x] Layout-Buttons im HTML-Sidebar-Bereich erstellen.
- [x] CSS-Positionierungsklassen für `.form-a` und `.form-b` schreiben.
- [x] Klick-Listener in `js/main.js` registrieren, der Klassen toggelt und die Einstellungen speichert.

---

### Feature 3: Native Color Schemes (Light- & Dark-Mode)

### 1. Specify (Das "Was")
* **User Story:** Als Anwender möchte ich die App in einem hellen, dunklen oder sich automatisch an das System anpassenden Modus nutzen, um ermüdungsfrei arbeiten zu können.
* **Akzeptanzkriterien:**
  - Umschalter in der Sidebar für "Hell", "Dunkel" und "System".
  - Die Farben passen sich harmonisch an. Das Briefpapier selbst bleibt für die Bearbeitungs-Klarheit weiß (analog zum physischen Druck).

### 2. Plan (Das "Wie")
* **Technischer Ansatz:**
  - Nutzung des nativen CSS-Features `color-scheme: light dark` und `light-dark(hell, dunkel)`.
  - Farbzuweisung über OKLCH Custom Properties in `css/variables.css`.
  - JS manipuliert ausschließlich das Attribut `style.colorScheme` des HTML-Elements für manuelles Überschreiben.

### 3. Tasks (Die Aufgaben)
- [x] Theme-Variablen in `css/variables.css` mit `light-dark()` deklarieren.
- [x] Segmented Control in der Sidebar für Themes einrichten.
- [x] Theme-Anwendungslogik in `js/main.js` einbauen.

---

### Feature 4: LocalStorage Auto-Save & Draft-Management

### 1. Specify (Das "Was")
* **User Story:** Als Briefschreiber möchte ich, dass jeder geschriebene Buchstabe im Briefbogen sofort lokal gesichert wird, damit ich bei einem versehentlichen Tab-Schließen oder Browser-Absturz keine Daten verliere.
* **Akzeptanzkriterien:**
  - Automatisches lautloses Speichern im Hintergrund bei Tastatureingaben.
  - Automatisches Wiederherstellen des letzten Entwurfs beim Öffnen der Webseite.

### 2. Plan (Das "Wie")
* **Technischer Ansatz:**
  - Briefelemente nutzen `contenteditable="plaintext-only"`.
  - Jedes editierbare Element erhält eine eindeutige `id`.
  - Bei jedem `input`-Event auf einem Editier-Feld liest das Script alle Texte aus, baut ein JSON-Objekt und speichert es unter `din_draft_current` im LocalStorage.
  - Beim Laden der Seite (`DOMContentLoaded`) wird das Objekt eingelesen und die Felder befüllt.

### 3. Tasks (Die Aufgaben)
- [x] Eindeutige IDs und `contenteditable="plaintext-only"` im HTML vergeben.
- [x] Hilfsmodul `js/storage.js` für LocalStorage-Verwaltung anlegen.
- [x] Auto-Save Event-Listener in `js/main.js` verknüpfen.
- [x] Lade-Logik beim Systemstart implementieren.

---

### Feature 5: Scroll-freier Multipage-Wechsler (Karussell)

### 1. Specify (Das "Was")
* **User Story:** Als Briefschreiber möchte ich lange Briefe verfassen können, die über eine Seite hinausgehen, ohne dass Scrollbalken entstehen oder Text abgeschnitten wird, indem der Brief nahtlos auf neue, separat navigierbare Seiten paginiert wird.
* **Akzeptanzkriterien:**
  - Der Anwender kann über Navigationsbuttons im Viewport (Zurück, Weiter, Neue Seite) zwischen den Seiten wechseln.
  - Das Briefblatt scrollt nicht, sondern wird horizontal verschoben (Karussell-Effekt).
  - Ein Page-Indicator zeigt die aktuelle Seite und die Gesamtseitenanzahl an (z. B. "Seite 1 / 2").
  - Beim Drucken werden alle Seiten untereinander als reguläre Einzelseiten gedruckt.

### 2. Plan (Das "Wie")
* **Technischer Ansatz:**
  - Wir fügen einen horizontalen Flexbox-Träger (`#paper`) ein, der mehrere `<din-a4>`-Blätter nebeneinander enthält.
  - Die Navigation erfolgt über ein CSS-Translation-Attribut auf dem `#paper`-Element: `transform: translateX(calc(-100% * (var(--page-current, 1) - 1)))`.
  - JS manipuliert die CSS Variable `--page-current` und die Anzahl der Kind-Elemente.
  - Neue Seiten werden aus einem `<template id="tpl-din-page">` instanziiert und dem DOM hinzugefügt.
  - Für den Druck wird das Karussell per CSS aufgehoben (`transform: none`, `display: block` unter `@media print`).

### 3. Tasks (Die Aufgaben)
- [ ] Multipage-Träger `#paper` in `index.html` einbetten und Navigation-Controls ergänzen.
- [ ] HTML `<template id="tpl-din-page">` für neue Blätter definieren.
- [ ] CSS-Karussell-Transformation und Karussell-Button-Styles in `css/layout.css` implementieren.
- [ ] Druck-Layout in `css/layout.css` anpassen, um alle Seiten untereinander zu drucken.
- [ ] Paginierungs-, Navigations- und Add-Page-Logik in `js/main.js` integrieren.
- [ ] LocalStorage-Sicherungsmodul in `js/main.js` und `js/storage.js` anpassen, um mehrseitige Inhalte zu speichern.

---

### Feature 6: Zentralisierung aller Konstanten und Feedback-Meldungen (Toasts)

### 1. Specify (Das "Was")
* **User Story:** Als Entwickler möchte ich alle Systemgrenzen (z. B. Undo/Redo Limits, Dateigrößen, API-Debounce) und alle Systemrückmeldungen (Erfolgsmeldungen, Warnungen, Validierungsfehler) an einem zentralen Ort pflegen können, um den Code übersichtlich zu halten und spätere Übersetzungen (Lokalisierung) zu vereinfachen.
* **Akzeptanzkriterien:**
  - Keine hartcodierten Strings für Erfolgsmeldungen, Warnungen oder Fehler in den JavaScript-Dateien.
  - Alle Texte und Fehlermeldungen sind in einem zentralen Objekt gekapselt.
  - Systemkonstanten (wie Speicher-Keys oder Dateigrößenbegrenzungen) werden aus derselben SSoT bezogen.

### 2. Plan (Das "Wie")
* **Technischer Ansatz:**
  - Wir erstellen eine eigenständige ES-Moduldatei `js/constants.js`.
  - Alle UI-bezogenen Meldungen (Toasts), Storage-Keys und Grenzwerte werden als exportierbares `Constants`-Objekt bereitgestellt.
  - JS-Module (`js/main.js`, `js/storage.js` etc.) importieren dieses Modul und greifen dynamisch auf die Strings zu (z. B. `Constants.TOASTS.PROFILE_SAVED`).

### 3. Tasks (Die Aufgaben)
- [x] Zentrales Constants-Modul `js/constants.js` anlegen und befüllen.
- [x] JS-Logikdateien umschreiben, um hartcodierte Texte durch Importe aus `constants.js` zu ersetzen.

---

# Zukünftiges Backlog (Phase 3 Feature-Roadmap)

> [!NOTE]
> Die folgenden Features befinden sich im ruhenden Planungs-Backlog und werden aktuell nicht aktiv verfolgt.

## 🟡 Backlog (Geplant / Zurückgestellt)

> [!WARNING]
> Die folgenden Features befinden sich im Backlog und werden aktuell nicht aktiv verfolgt, da sie teilweise den strikten Zero-Dependency und Wartungsfreiheits-Regeln widersprechen könnten.

#### Feature 7: Auto-Kompakt Layout-Modus (Form A/B Auto-Switch)
* **Specify (Das "Was"):** Als Briefschreiber möchte ich, dass die Anwendung bei langem Brieftext automatisch von Form B auf Form A wechselt, falls dadurch der Text gerade so auf eine einzige Seite passt, um Zeit und Papier zu sparen.
* **Akzeptanzkriterien:**
  - Option "Automatisch" in der Sidebar unter "DIN-Brief Layout".
  - Echtzeit-Berechnung des vertikalen Textüberlaufs über relative Ratios (Grenze: Y: 235mm, Ratio `0.791`).
  - Wenn Text in Form B überläuft, aber in Form A passt, erfolgt ein flüssiger Wechsel zu Form A.
  - Bei Textkürzung erfolgt der automatische Rückwechsel zu Form B.

### Feature 8: Anrede-Stil & Auto-Gender Engine
* **Specify (Das "Was"):** Als Briefschreiber möchte ich den Stil der Anrede (Förmlich, Höflich, Modern) in der Sidebar wählen können, und die Anwendung soll basierend auf dem Empfängernamen automatisch das Geschlecht ermitteln und die passende Anrede und Grußformel vorschlagen.
* **Akzeptanzkriterien:**
  - Segmented Control in der Sidebar für "Anrede-Stil" (Förmlich, Höflich, Modern).
  - Automatisches Scannen des Empfängernamens auf Titel (Dr., Prof.) und Geschlechtsmerkmale via RegExp.
  - Auto-Generierung von Anrede und Grußformel über "Ghost-Sync", solange der Benutzer diese nicht manuell editiert hat. Manual Overrides haben absolute Priorität.

### Feature 9: Integriertes Absender-Profil (Persönliche Daten)
* **Specify (Das "Was"):** Als regelmäßiger Briefschreiber möchte ich meine persönlichen Kontaktdaten, Bankdaten und Footer-Zusätze dauerhaft in der Sidebar speichern können, damit diese bei jedem neuen Brief automatisch in den Briefkopf und die Fußzeile eingepflegt werden.
* **Akzeptanzkriterien:**
  - Einklappbares Formular "Absender-Profil" in der Sidebar.
  - Persistent gespeicherte Profildaten unter `din_profile` im LocalStorage.
  - Automatisches Befüllen von `#absender`, `#info-tel` und Brieffooter beim Speichern und beim Systemstart.

### Feature 10: Premium Ambient Dark Mode (Time- & System-based)
* **Specify (Das "Was"):** Als Benutzer möchte ich abends und nachts dezent und ohne grelles Licht Briefe schreiben, ohne dass eine fehlerhafte Farbinversion die Brief-Ästhetik ruiniert. Der Nachtmodus soll sich abends automatisch aktivieren.
* **Akzeptanzkriterien:**
  - Segmented Control für "Theme" (Hell, Dunkel, Auto).
  - Modus "Auto" schaltet abends/nachts (18:00 - 06:00 Uhr) oder bei System-Dark-Preference automatisch in den Dark Mode um (30s clock interval check).
  - Keine Inversions-Filter! Das Briefpapier wird im Dark Mode in edles, warmes Dunkelgrau (`oklch(28% 0.01 250)`) gefärbt, das die Augen schont.
  - Beim Drucken wird das Papier ausnahmslos reinweiß mit schwarzem Text ausgegeben (Druck-Souveränität).

### Feature 11: Easter-Egg High-Integrity Dev-Panel (Popover-based)
* **Specify (Das "Was"):** Als Entwickler möchte ich ein verstecktes Diagnose-Panel direkt in der Web-App aufrufen können, indem ich 3-mal schnell hintereinander auf das Versions-Badge im Fußbereich klicke, um den Bereitschaftsbericht aller 25 Bleeding-Edge-Features live einzusehen.
* **Akzeptanzkriterien:**
  - 3-Klick-Easter-Egg auf `#dev-easter-egg` im Footer (1000ms Timeout-Fenster).
  - Einblendung über ein natives HTML5 Popover `#dev-popover` (`popover="manual"`) ohne zusätzliche Bibliotheken.
  - Dynamisches Ausführen der 25 Diagnosetests bei jedem Öffnen und Befüllen der Tabelle.
  - Schließen-Button (`&times;`) und ein Button zum manuellen Leeren der Browser-Konsole im Overlay.
  - Perfekte Scrollbarkeit der Tabelle im Overlay ohne Beeinträchtigung des Haupt-Layouts.
  - Vollständig produktiv implementiert und einsatzbereit.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/spec.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/spec.md'), 'spec');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/00-foundation/spec.md'), 'requirements');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-ANTIPATTERN.md',
  'ADR-ANTIPATTERN: Forbidden Practices & Antipatterns',
  'accepted',
  '# Architectural Decision Record (ADR): Forbidden Practices & Antipatterns

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Um die Langlebigkeit, Wartungsfreiheit, extreme Performance und uneingeschränkte Offline-Lauffähigkeit von **DIN-BriefNEO** zu sichern, müssen bestimmte, im modernen Web oft übliche Praktiken strikt verboten werden. Dieses Dokument dient als unnachgiebige "Verfassung" zur Einhaltung der Projekt-Bedingungen.

---

## Verbotene Praktiken (Antipatterns)

### 0. Chrome 149+ Baseline & Keine Legacy-Fallbacks (Striktes Verbot)
Ab Version X des Projekts werden **keine Legacy-Fallbacks** mehr toleriert. Dies gilt insbesondere für unsichere DOM-Manipulationen (wie `innerHTML`) oder veraltete Native-APIs (wie `new Date()`). Das Projekt akzeptiert bewusst eine strikte Chrome 149+ Baseline. Sicherheit und Code-Sauberkeit haben absoluten Vorrang vor abwärtskompatibler Funktionalität für ältere Browser.
*   **Ausnahme-Verbot für setHTMLUnsafe():** Die Methode `setHTMLUnsafe()` ist als Standard verboten und darf nur verwendet werden, wenn bewusst unsicheres/ungefiltertes HTML benötigt wird. Andernfalls ist zwingend `setHTML()` (die Native W3C Sanitizer API) oder `textContent` (für Plain-Text) zu nutzen.

### 1. Verwendung von Frameworks & Build-Tools (Striktes Verbot)
Es dürfen **keine** Frameworks wie React, Vue, Svelte, Angular oder Bibliotheken wie jQuery oder TailwindCSS eingebunden werden.
*   **Begründung:** Frameworks führen zu massiver Komplexität, Abhängigkeiten und erfordern Build-Systeme (Vite, Webpack). Die Applikation MUSS reines Vanilla HTML5, Vanilla CSS3 und reines Vanilla JS ES-Modules verwenden, damit sie für den Endanwender für Jahrzehnte wartungsfrei bleibt.

### 2. Externe CDNs & Google Web Fonts (Striktes Verbot)
Es dürfen **keinerlei** externen Scripts, Stylesheets oder Webfonts über CDNs oder externe Server geladen werden (z. B. Google Fonts).
*   **Begründung:** Verstößt gegen die DSGVO (IP-Abfluss) und zerstört die Offline-Lauffähigkeit der App. Alle Assets müssen zu 100 % lokal abgelegt und offline verfügbar sein.
*   **Verweis:** Siehe [[ADR-CSS|ADR-CSS.md]] zur Typografie und [[ADR-FEATURE|ADR-FEATURE.md]] zum Schriftarten-Manager.

### 3. Komplexere lokale Storage-APIs (OPFS, IndexedDB, File System API)
Die Verwendung von IndexedDB, Origin Private File System (OPFS), File System Access API oder der Storage-API im weiteren Sinne ist untersagt.
*   **Begründung:** Diese APIs erfordern zwingend einen sicheren Kontext (HTTPS oder `localhost`). Wird die `index.html` als lokale Datei per Doppelklick geöffnet (`file:///`), werfen diese APIs im Browser Sicherheits-Exceptions und blockieren den Ladezyklus.
*   **Entscheidung:** **LocalStorage** ist die einzige persistente Speicher-API, die unter `file://` garantiert stabil und ausnahmslos in Chrome 148+ funktioniert.

### 4. Veraltetes document.execCommand (Striktes Verbot)
Die Nutzung von `document.execCommand` für selbstentwickelte Editorelemente (wie Zitate) ist untersagt.
*   **Begründung:** Die API ist *deprecated* (veraltet) und wird in modernen Browser-Engines schrittweise entfernt. Für die Toolbar-Formatierung nutzen wir ausschließlich native Browser-Shortcuts oder die zukunftssichere Selection & Range API.
*   **Verweis:** Siehe [[ADR-JS|ADR-JS.md]] zur DOM-Baum-Durchquerung.

### 5. Scrollbalken im Viewport (Striktes Verbot)
Die Sichtbarkeit von Scrollbalken im normalen Anwendungsfenster (ausgenommen bewusster Browser-Zoom des Nutzers) ist verboten.
*   **Begründung:** Stört die Ästhetik des Premium-Designs und beeinträchtigt das WYSIWYG-Konzept des Briefbogens.
*   **Verweis:** Siehe [[ADR-CSS|ADR-CSS.md]] zur Viewport-Sperre.

### 6. Verwendung von Legacy-Datums-APIs (new Date(), moment.js, date-fns) (Striktes Verbot)
Die Verwendung des klassischen JavaScript `Date`-Objekts (`new Date()`) sowie externer Datumsbibliotheken wie `moment.js`, `date-fns` oder `luxon` ist strikt untersagt.
*   **Begründung:** Das klassische `Date`-Objekt gilt in W3C-Standardisierungskreisen als historisch fehlkonstruiert (Veränderbarkeit / Mutability, unzuverlässige Zeitzonenberechnungen, 0-basierte Monatsindizes, fehleranfällige Schaltjahrlogik). Moment.js und Co. blähen die Codebasis auf und verletzen den Zero-Dependency-Pakt.
*   **Entscheidung:** Die zukunftsweisende W3C **Temporal API** (`globalThis.Temporal`) ist die exklusive Datums-Engine der Anwendung. Sie ist vollkommen fehlerfrei, immutable, unterstützt Zeitzonen und deutsche Kalenderformate nativ und läuft vollständig offline ohne eine einzige Library.

### 7. Verwendung von Nicht-OKLCH Farbräumen (HEX, RGB, RGBA, HSL, HSLA, Named Colors) (Striktes Verbot)
Die Verwendung jeglicher klassischer Farbräume wie HEX-Codes (`#HEX`), RGB/RGBA, HSL/HSLA oder Named CSS Colors (`white`, `black`, `red`, `gray` etc.) in Stylesheets oder inline-Styles ist strikt untersagt.
*   **Begründung:** Der moderne OKLCH-Farbraum ist wahrnehmungslinear (perceptually uniform) und ermöglicht im Gegensatz zu klassischen Modellen mathematisch exakte Helligkeits-, Sättigungs- und Kontrastberechnungen (wichtig für harmonische Relative Color Syntax Formeln). HEX und Co. verhalten sich bei Skalierungen unvorhersehbar und verhindern ein mathematisch konsistentes Themes-Design.
*   **Entscheidung:** Sämtliche Farbdeklarationen dürfen **ausschließlich** im `oklch()` Format deklariert werden. Die einzige Ausnahme bildet das pure CSS-Schlüsselwort `transparent` (welches bevorzugt durch `oklch(0% 0 0 / 0%)` ersetzt wird).

### 8. Verwendung von CSS-Präprozessoren (Sass, Less) oder CSS-in-JS (Striktes Verbot)
Die Verwendung von Sass, Less, Stylus oder JavaScript-basierten Stylesystemen (z. B. Styled Components, Emotion) ist verboten.
*   **Begründung:** CSS Nesting und CSS Custom Properties sind mittlerweile native W3C Living Standards und werden vollumfänglich von der Browser-Engine unterstützt. Präprozessoren erfordern Build-Systeme, und CSS-in-JS erzeugt massiven JS-Laufzeit-Overhead, was unsere Säulen der Einfachheit und Wartungsfreiheit verletzt.

### 9. Externe Icon-CDNs (FontAwesome, Lucide) oder massive Webfonts-Icons (Striktes Verbot)
Die Einbindung von Icon-Fonts (z. B. Material Icons) oder externen Scripts/Stylesheets von Icon-Providern ist strikt untersagt.
*   **Begründung:** Verletzt das DSGVO-Datenschutzprinzip (IP-Abfluss an externe Server) und bricht die Offline-Lauffähigkeit. Icon-Schriften laden oft Hunderte ungenutzte Grafiken und blähen die Ladezeit auf. Icons müssen stattdessen sauber als Inline-SVGs oder hochkomprimierte lokale SVG-Einzeldateien realisiert werden.

### 10. Schwere JS-Hilfsbibliotheken (Lodash, Underscore) & JS-Transpiler (TypeScript, Babel) (Striktes Verbot)
Die Einbindung externer JS-Utility-Suites oder das Erzwingen von TypeScript-Kompilierungsschleifen für den Web-Code ist verboten.
*   **Begründung:** Vanilla ES6+ verfügt über hervorragende native Methoden (`map`, `filter`, `reduce`, `find` etc.), die Bibliotheken wie Lodash komplett obsolet machen. TypeScript-Kompilierer zerstören den unmittelbaren "Doppelklick-Start" der unveränderten lokalen Quelldateien. Wir schreiben reines Vanilla JS ES-Modules.

### 11. JS-gestützte Animationsbibliotheken (GSAP, Anime.js) (Striktes Verbot)
Die Verwendung von Animationsbibliotheken (GSAP, Anime.js, jQuery animate) ist untersagt.
*   **Begründung:** JS-gesteuerte Animationen belasten den Haupt-Thread des Browsers. CSS Transitions, `@starting-style`, `@keyframes` und die native View Transitions API laufen hochoptimiert und hardwarebeschleunigt asynchron auf dem Compositor Thread (Grafikkarte), was flüssige 120Hz-Animationen garantiert.

### 12. Inline-CSS-Styles für Layout, Farben und Positionen (Striktes Verbot)
Die Verwendung von inline `style="..."` Attributen für strukturelle oder gestalterische Zwecke (ausgenommen Koordinaten-Offsets bei Selektionen) ist verboten.
*   **Begründung:** Inline-Styles hebeln die `@scope (din-a4)` Geometrie-Kapselung aus und stören die Wiederverwendbarkeit von CSS OKLCH design tokens. Alle visuellen Anweisungen müssen strikt in den entsprechenden Stylesheets deklariert werden.

---

## Konsequenzen
*   Jede Code-Änderung, die gegen eines dieser zwölf Antipatterns verstößt, wird im Code-Review sofort verworfen.


*   Die Lauffähigkeit unter `file:///index.html` ist die oberste QA-Voraussetzung.

---

## Verknüpfungen
*   Siehe [[ADR-HTML|ADR-HTML.md]] zu `contenteditable` und Popover.
*   Siehe [[ADR-CSS|ADR-CSS.md]] zum reinen CSS-Zoom.
*   Siehe [[ADR-JS|ADR-JS.md]] zur JavaScript-Reglementierung.
*   Siehe [[ADR-API|ADR-API.md]] zur Header-Sicherheit.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-API.md',
  'ADR-API: External Services & APIs (Geoapify, Zippopotam & Header Security)',
  'accepted',
  '# ADR-API: External Services & APIs

## 1. Context & Problem

**Sichere, serverlose Adress-Vervollständigung und externe Datenabfragen.**
- Viele Autocomplete-Lösungen (wie Google Places) benötigen dicke SDKs und zwingen Nutzer zur Kreditkartenangabe. Offizielle Libraries (z.B. `@geoapify/geocoder-autocomplete`) injizieren schwer anpassbare DOM-Elemente und brechen unsere WYSIWYG-Regel.
- DIN-BriefNEO benötigt ein schnelles, datenschutzkonformes API-Konzept, das vollständig im lokalen Kontext (`file:///` oder lokaler Webserver) läuft, ohne Backend-Server.
- API-Keys dürfen nicht via URL-Parameter geleakt werden.
- Lokale Treffer (beim Geo-Autocomplete) sollen per Proximity Bias zuerst erscheinen.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Geoapify + Header-Auth + Custom Fetch) | Native Nutzung per `fetch()`, Key im Header (`X-Api-Key`), natives CSS-Anchor-Popover für Resultate | Zero SDK, höchste Sicherheit vor Leaks, 100% WYSIWYG-Treue | Caching muss selbst programmiert werden | Keine | **Gewählt** |
| **Option B** (Google SDK) | Google Places Library laden | Bekannt, hohe Datenqualität | Zwang zu Kreditkarte, schwergewichtiges JS | Datenschutz | Abgelehnt |
| **Option C** (Offizielle NPM Library) | `@geoapify/geocoder-autocomplete` nutzen | Schnell implementiert | Zerstört WYSIWYG durch eigene DOM-Elemente | Bundle-Size | Abgelehnt |
| **Option D** (Photon API) | Kostenloses OSM-Backend | Kein Key nötig | Zu schlechte Datenqualität | Usability | Abgelehnt (Deprecated) |

## 3. Decision

**Wir haben uns für Option A (Geoapify & Zippopotam REST APIs via Custom Fetch) entschieden.**

### Begründung
- **Zero-Dependency:** Der Verzicht auf NPM-Libraries entspricht der Zero-JS-Philosophie.
- **Header-Security:** Der API-Key wird **strikt per HTTP-Header** (`X-Api-Key`) gesendet, niemals in der URL. Das verhindert Leaks.
- **Natives UI:** Das Resultat-Popover verankert sich nahtlos über W3C CSS Anchor Positioning, das DOM bleibt sauber von Fremdelementen.
- **Dynamischer Proximity Bias:** Statt eines statischen Fallbacks ermittelt die Logik via Zippopotam (`api.zippopotam.us`) die `lat`/`lon` der eingegebenen 5-stelligen Absender-PLZ und nutzt diese für `bias=proximity` bei Geoapify.
- **Performance:** Strenges Debouncing (`300ms`), Limits (`limit=5`) und `AbortController` halten API-Calls minimal und verhindern Race Conditions.

## 4. Consequences

### Positive Auswirkungen
- **Maximale Kontrolle & WYSIWYG-Treue:** Das DOM bleibt zu 100% in unserer Hand.
- **Hohe Sicherheit:** Keys leaken nicht in Server-Logs oder Proxys.
- **Top Performance & Relevanz:** Adressen in der Nähe des Absenders werden priorisiert. Überflüssige Requests werden abgebrochen.

### Risiken & Negative Auswirkungen
- Setzt aktive Internetverbindung voraus für Autocomplete (manuelle Eingabe geht weiterhin offline).
- Caching muss bei Bedarf selbst (oder durch AbortController/Debouncing) verwaltet werden.

## 5. Implementation & Verification

- Die Header-Security-Regel ist in `main.js` für jeden Geoapify-Aufruf verankert.
- Photon wurde restlos als Antipattern deklariert.
- Das Dropdown ist als `popover="manual"` mit CSS Anchor an das Eingabefeld gebunden.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-JS]]
- [[ADR-FEATURE]]
- [[longevity-guidelines]]

---

### Feature Checks

```javascript feature-check
f("Geoapify Autocomplete", typeof globalThis.fetch === "function", "Chrome 42", "Produktiv"),
f("CSS Anchor Positioning", CSS.supports("anchor-name: --test"), "Chrome 125", "Produktiv")
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-BETREFF.md',
  'ADR-BETREFF: Positionierung des Betrefffeldes & PDF-Export',
  'accepted',
  '# ADR-BETREFF: Betreff-Logik, Falzmarken und dynamischer PDF-Titel

## 1. Context & Problem

**Fehlerhafte Falzmarken und statische PDF-Exporte.**
- Die Falzmarken (`.din-mark`) kollidierten optisch mit dem Betrefffeld, da sie als 100% breite Linien durch das Dokument schnitten.
- Beim nativen PDF-Export (`window.print()`) fehlte ein dynamischer Dateiname. Der Standardname der Webseite wurde übernommen, was für abgelegte DIN-Briefe unzureichend ist.
- Es wird eine Lösung benötigt, die sowohl die optischen DIN-Normen einhält als auch einen sauberen Datei-Workflow ohne zusätzliche Bibliotheken ermöglicht.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Native Print) | `document.title` live manipulieren für PDF-Namen | Zero JS-Libs, nutzt nativen Druckdialog | Nur beim direkten "Als PDF speichern" verfügbar | Keine | **Gewählt** |
| **Option B** (Blob Download) | PDF über `html2pdf` o.ä. generieren und Blob herunterladen | Volle Kontrolle über Dateinamen | Erfordert JS-Libraries, bricht Zero-Dependency-Regel | Hohe Wartungskosten | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Native Print) und CSS-Kürzung entschieden.**

### Begründung
- Die Falzmarken (`.din-mark`) wurden im CSS auf exakt `8mm` (`width: calc(8 / 210 * 100cqw);`) gekürzt.
- Für den PDF-Namen wird in `main.js` der `<title>` dynamisch generiert: `YYYY-MM-DD_{empfänger} {Betreff}`.
- Zur Datumsgenerierung wird primär die W3C **Temporal API** genutzt (siehe [[ADR-ANTIPATTERN]]).

## 4. Consequences

### Positive Auswirkungen
- **Perfekte Optik:** Der Betreff wird nicht mehr durchschnitten.
- **Beste UX:** Native Nutzung des Browser-Druckdialogs mit perfektem Dateinamen-Vorschlag.
- **Zero-Dependency:** Komplett mit Standard-APIs gelöst.

### Risiken & Negative Auswirkungen
- Fallback-Pflicht: `Date()` muss als Fallback vorhanden sein, falls `Temporal` auf alten iOS-Geräten fehlt.

### Langfristige Auswirkungen
- **Architektur-Dogma:** Kein Einsatz von Blob-Libraries (`html2pdf` etc.) für PDF-Exporte gestattet.

## 5. Implementation & Verification

- **CSS:** Kürzung der Falzmarken in `layout.css` implementiert.
- **JS:** `updateDocumentTitle()` läuft asynchron bei Eingaben und setzt `<title>`.
- **Regeln:** Native API-Nutzung ist im Antipattern-Catalog manifestiert.

## 6. Related Documents

- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-CSS.md',
  'ADR-CSS: CSS Architecture & Proportional Zoom',
  'accepted',
  '# ADR-CSS: CSS Architecture & Proportional Zoom

## 1. Context & Problem

**WYSIWYG Skalierung ohne Scrollbalken.**
- Klassische Webanwendungen brechen oft das WYSIWYG-Prinzip durch unkontrolliertes Scrollen oder verzerrte Proportionen.
- Der DIN-BriefNEO-Bogen muss unter allen Bedingungen pixelperfekt proportional skaliert und absolut ohne Scrollbalken im Fenster dargestellt werden.
- Komplexe Layout-Aufgaben (Zoom, Theming, Positionierung) sollen ohne JavaScript gelöst werden, um die Langlebigkeit zu maximieren.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Pure CSS) | `aspect-ratio`, Container Queries (`cqw`/`cqh`), native APIs (`light-dark`, Anchor Positioning) | 100% Zero-JS, maximale Performance | Erfordert Chrome 148+ | Text overflow bei zu viel Text | **Gewählt** |
| **Option B** (JS-Driven) | ResizeObserver + `transform: scale()` | Abwärtskompatibel | Ruckeln, asynchrone Berechnungen | Hoher Wartungsaufwand | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Pure CSS Architecture) entschieden.**

### Begründung
- **Reiner CSS-Zoom:** `<din-a4>` wird auf `height: 94vh` und `aspect-ratio: 210 / 297` fixiert.
- **Container Queries:** Alle inneren Maße verwenden `cqw` und `cqh`, um proportional zum Papierbogen zu skalieren.
- **Absolute Viewport-Sperre:** `overflow: hidden` auf `html` und `body` verhindert Scrollbalken.
- **Natives Theming:** Nutzung von `light-dark()` und W3C Relative Color Syntax (RCS) im OKLCH-Farbraum.
- **Anchor Positioning:** W3C CSS Anchor Positioning für Dropdowns (z.B. `#address-suggestions`).
- **CSS @property & interpolate-size:** Für flüssige native Transitionen auf Custom Properties und `auto`-Maße.
- **CSS @scope:** Vollständige Kapselung der Briefblatt-Stile (`@scope (din-a4)`).
- **Zero-JS State Toggles:** Nutzung von `:has()` und Checkboxen für UI-State.

## 4. Consequences

### Positive Auswirkungen
- Absolut flüssige, stufenlose Echtzeit-Skalierung auf allen Displays.
- 100% WYSIWYG-konform: Druck = Bildschirm.
- JavaScript wird von Layout-Aufgaben vollständig befreit.
- Automatisch harmonisierte Farbschemata (RCS) im perceptually uniform OKLCH-Farbraum.

### Risiken & Negative Auswirkungen
- Texte müssen in der Höhe begrenzt sein (z. B. auf 1 A4-Seite), da Overflow-Scrolling deaktiviert ist.
- Bindung an hochmoderne Chromium-Engines (Chrome 148+).
- **Print CSS Saftey:** Strenge Vorgaben im `@media print` erforderlich (`height: auto !important`, `overflow: visible !important`). Die Nutzung von `page-break-before: always;` auf Container-Ebene führt zwingend zu leeren PDFs (siehe Law Catalog A46).

### Langfristige Auswirkungen
- **Architektur-Stabilität:** Die Codebasis bleibt extrem JS-arm und profitiert direkt von Engine-Optimierungen.

## 5. Implementation & Verification

- Alle CSS-Variablen sind in `layout.css` als OKLCH deklariert.
- Container-Maße (`cqw`, `cqh`) sind in der CSS-Basis verankert.
- `overflow: hidden` ist produktiv.
- Einhaltung wird durch die Anti-Pattern-Linter-Regeln für JS-basiertes Styling überprüft.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-JS]]
- [[longevity-guidelines]]
- [[ADR-ANTIPATTERN]]

---

### Feature Checks

```javascript feature-check
// f("Feature Name", Bedingung, "Chrome XXX", "Status")
f("CSS :has() Selektor", typeof CSS !== "undefined" && CSS.supports && CSS.supports("selector(:has(div))"), "Chrome 105", "Produktiv"),
f("CSS field-sizing: content", typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing: content"), "Chrome 123", "Produktiv")
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-DATA-PERSISTENCE.md',
  'ADR-DATA-PERSISTENCE: Daten-Speicherung & Datumshandling',
  'accepted',
  '# ADR-DATA-PERSISTENCE: Daten-Speicherung & Datumshandling

## 1. Context & Problem

**Zuverlässige, wartungsfreie lokale Datenspeicherung.**
- Die Anwendung muss ihre Daten (Inhalte des Briefes, Absenderdaten) zuverlässig lokal speichern können.
- Es gibt keinen Backend-Server und keine Datenbank (`file:///` Ausführung).
- Die W3C `Date()` API ist bekanntermaßen fehleranfällig, asymmetrisch und schwer zu parsen, was besonders bei Brief-Daten zu Problemen führt.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (LocalStorage + Temporal) | `localStorage` für Daten, W3C `Temporal` API für Daten | Zero Dependencies, 100% lokal, persistiert über Sessions hinweg, exaktes Datumshandling | Speichergrenze ca. 5MB, Temporal braucht auf alten iOS Geräten Fallbacks | Keine | **Gewählt** |
| **Option B** (IndexedDB + Moment.js) | `IndexedDB` für große Daten, `Moment.js` für Daten | Viel Speicherplatz | Asynchron (komplex), Library-Abhängigkeit (bricht Zero-Dependency-Regel) | Hohe Wartungskosten | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (LocalStorage + Temporal API) entschieden.**

### Begründung
- `localStorage` (via `Storage-API`) ist die einfachste, stabilste und am längsten unterstützte Methode, Key-Value-Daten synchron lokal abzulegen.
- Der aktuelle Briefzustand (Draft) wird in Echtzeit serialisiert und in `localStorage` abgelegt.
- Zur Generierung von Zeitstempeln (z.B. für den PDF-Export oder das Datum-Feld) wird **ausschließlich** die moderne W3C `Temporal` API genutzt (z.B. `Temporal.Now.plainDateISO()`). Die fehleranfällige `Date()` API ist strikt verboten (außer als absolutes Fallback für alte Safari-Versionen).

## 4. Consequences

### Positive Auswirkungen
- **Wartungsfreiheit:** Keine Datenbanken, keine asynchronen Transactions, keine externen Libraries.
- **Offline-First:** Funktioniert nahtlos ohne Internet.
- **Präzision:** Die W3C Temporal API garantiert absolut exakte ISO-Strings und Datumsberechnungen ohne Zeitzonen-Fehler.

### Risiken & Negative Auswirkungen
- `localStorage` ist auf ca. 5-10 MB begrenzt (reicht für Millionen von Text-Briefen, aber nicht für massive Bildanhänge).
- Die W3C Temporal API ist noch relativ neu (erfordert moderne Browser oder einen minimalen Polyfill/Fallback).

## 5. Implementation & Verification

- Die gesamte Speicherlogik ist in `main.js` (`saveDraftData()`, `loadDraftData()`) implementiert.
- Das W3C Temporal API-Mandat ist in den Anti-Pattern Linter-Regeln verankert.
- Ein Fallback auf `Date()` ist für iOS Safari in `main.js` eingebaut.

## 6. Related Documents

- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-FEATURE.md',
  'ADR-FEATURE: Feature Specifications & Premium UX',
  'accepted',
  '# ADR-FEATURE: Feature Specifications & Premium UX

## 1. Context & Problem

**Premium-UX ohne schwergewichtige Frameworks.**
- Ein moderner Editor benötigt smarte Features wie Kontext-Toolbars, Toasts, Überlaufwarnungen und Dropdowns.
- Klassische Herangehensweisen stützen sich hierfür auf schwere JS-Frameworks (React, Vue) und manuelle Berechnungen.
- DIN-BriefNEO benötigt all diese Features 100% nativ, performant und absolut WYSIWYG-konform (kein Editieren in der Sidebar).

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Native Web-APIs & Anchor Positioning) | CSS Anchor Positioning, `@starting-style`, Popovers | Zero-JS-Animation, WYSIWYG-Treue, native Performance | Benötigt sehr neue Chromium-Versionen | Keine | **Gewählt** |
| **Option B** (JS-basierte Libraries) | Popper.js, React-Toasts, Framer Motion | Breite Browserunterstützung | Abhängigkeit, Aufblähen der Codebase | Wartung | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Ausschließliche Nutzung modernster Web-Standards) entschieden.**

### Begründung
- **Strict WYSIWYG:** Eingaben passieren *ausschließlich* auf dem Blatt. Sidebar ist nur für Toggles. Dropdowns nutzen CSS Anchor Positioning am jeweiligen Papier-Element.
- **WhatsApp-Style Toolbar:** Das Format-Popover verankert sich rein über CSS an der Textselektion. JS steuert nur die Sichtbarkeit und Format-Logik.
- **Toasts:** Die Toast-Queue delegiert die Ein-/Ausblendeanimation komplett ans CSS (`@starting-style`, `transition-behavior: allow-discrete`). JS ruft nur `show/hidePopover()`.
- **A4-Überlauf-Warnung:** JS prüft die Texthöhe (max 120mm) und fügt eine Warn-Klasse hinzu, ohne den Scroll zu behindern.

## 4. Consequences

### Positive Auswirkungen
- **Flüssige UX:** Native CSS-Animationen sind maximal hardwarebeschleunigt.
- **Klarer Code:** Popover-Logik ohne JS-Rechnen (`getBoundingClientRect` entfällt).
- **Zukunftssicherheit:** Nutzung von Features, die ab 2024 zum Standard gehören.

### Risiken & Negative Auswirkungen
- Setzt tiefes Wissen über modernste CSS-Standards voraus.

## 5. Implementation & Verification

- CSS Anchor Positioning und `@starting-style` sind in `layout.css` aktiv.
- JavaScript ist strikt von Positionsberechnungen für Toolbars befreit.
- Einhaltung von WYSIWYG ist durch die Antipattern-Verfassung garantiert.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-CSS]]
- [[ADR-JS]]
- [[longevity-guidelines]]',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-HTML.md',
  'ADR-HTML: HTML Architecture & Semantic Structure',
  'accepted',
  '# ADR-HTML: HTML Architecture & Semantic Structure

## 1. Context & Problem

**Strukturierung des Brief-Editors ohne überladenes DOM.**
- Klassische Texteditoren nutzen tiefe div-Suppen und komplexe JS-Dialoge.
- Der DIN-BriefNEO-Editor muss leichtgewichtig, nativ barrierefrei, performant und extrem standardkonform aufgebaut sein.
- Es muss verhindert werden, dass Nutzer versehentlich formatierte Inhalte in reine Datenfelder kopieren.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Native HTML5) | Custom Elements (`<din-*>`), `popover="manual"`, `contenteditable="plaintext-only"` | Zero Dependencies, semantic DOM, nativer Top-Layer | `plaintext-only` braucht moderne Browser | Keine | **Gewählt** |
| **Option B** (Div-Suppe + JS) | Alles in `<div>`, Dialoge über z-index und JS gesteuert | Abwärtskompatibel | `z-index` Kämpfe, schwere Lesbarkeit, JS-Aufwand | Hoher Wartungsaufwand | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Striktes HTML5 & Native APIs) entschieden.**

### Begründung
- **Custom Elements:** Wir nutzen semantische HTML5 Custom Elements (`<din-a4>`, `<din-absender>`, etc.), um Geometriebereiche im CSS klar zu trennen und die DOM-Lesbarkeit zu erhöhen.
- **Native Popovers:** Dialoge & Toolbars nutzen `popover="manual"` für ein konfliktfreies Rendern im **Top-Layer** (ohne `z-index`-Hacks).
- **Editierbarkeit:** Einzeilige Metadaten (Betreff, Anschrift) nutzen `contenteditable="plaintext-only"`. Nur der Briefkörper (`#brieftext`) nutzt `contenteditable="true"`.
- **Barrierefreiheit:** ARIA-Attribute (`aria-pressed="true/false"`) werden nativ für Toolbar-Buttons gepflegt.

## 4. Consequences

### Positive Auswirkungen
- **Maximale Lesbarkeit:** Der DOM-Baum ist selbsterklärend und semantisch korrekt.
- **Wartungsfreiheit:** Keine externen UI- oder Dialog-Libraries nötig.
- **Sicherheit:** `plaintext-only` schützt Strukturfelder zuverlässig vor unerwünschten Formatierungen aus der Zwischenablage.

### Risiken & Negative Auswirkungen
- `contenteditable="plaintext-only"` erfordert Chromium-basierte Browser (Chrome 148+, Edge).
- **Contenteditable Integrity Risk:** Das direkte Verschachteln von strukturellen oder interaktiven Elementen (wie z.B. `<img id="signature-image">`) als Kind-Elemente von `contenteditable="true"` führt bei Texteingabe zwingend zum Verlust der Struktur, da der Browser den inneren DOM-Baum rigoros überschreibt. Lösung: Immer als Geschwister-Elemente in einem isolierten Wrapper kapseln (Siehe Law Catalog A47).

## 5. Implementation & Verification

- Alle Brief-Elemente im `index.html` sind als `<din-*>` Tags deklariert.
- Popovers und Toolbars nutzen das `popover`-Attribut.
- Einhaltung wird durch die Anti-Pattern Linter-Regeln für JS-basiertes Styling überprüft.

## 6. Related Documents

- [[ADR-CSS]]
- [[ADR-JS]]
- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-JS.md',
  'ADR-JS: JavaScript Constraints & JS as a Crutch',
  'accepted',
  '# ADR-JS: JavaScript Constraints & "JS as a Crutch"

## 1. Context & Problem

**JS-Überladung und "JS as a Crutch".**
- Webapplikationen nutzen oft JavaScript für visuelle Effekte und Layout-Berechnungen.
- Das führt zu Performance-Einbußen, Rucklern und technischer Schuld.
- In DIN-BriefNEO soll JS streng auf eine logische Begleitschicht reduziert werden.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Strikt reglementiertes JS) | JS nur für DOM-Range-Selektion, APIs, Persistenz, View Transitions | Maximale Stabilität, CSS übernimmt Layout (Anchor) | Höherer Lernaufwand bei CSS | Keine | **Gewählt** |
| **Option B** (JS-Driven UI) | JS für ResizeObserver, `execCommand`, Toolbar-Position | Einfach, bekannt | Veraltete APIs, Ruckeln bei Repaints | Wartbarkeit | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Striktes JS-Einsatzverbot für Rendering) entschieden.**

### Begründung
- **Verbot von JS-Layouting:** JS darf keine CSS-Stile für Layout, Rendering oder visuelle Effekte setzen (Toolbar nutzt CSS Anchor Positioning).
- **Reglementierte Aufgaben:** JS darf nur genutzt werden für: (1) Selection/Range API, (2) Paste-Sanitizing, (3) LocalStorage, (4) Externe API-Anfragen, (5) Toast-Queue, (6) Canvas-Bildkomprimierung für LocalStorage-Limits.
- **Verbot von `execCommand`:** Textformatierungen werden über die W3C Selection & Range API umgesetzt.
- **Sichere DOM-Manipulation (`setHTML` vs `setHTMLUnsafe`):** `innerHTML` ist als Antipattern eingestuft und strikt verboten (XSS-Gefahr). Als Standardfall ist die W3C Sanitizer API (`setHTML()`) zu bevorzugen. `setHTMLUnsafe()` darf nur als absoluter Ausnahmefall (oder Fallback für ältere Engines) verwendet werden, wenn bewusst ungefiltertes HTML injiziert werden muss. Für reinen Text ist ausschließlich `textContent` zu nutzen.
- **View Transitions API:** Native `document.startViewTransition()` wird für UI-Zustandswechsel verwendet, anstatt händisch via JS zu animieren.

## 4. Consequences

### Positive Auswirkungen
- **Schlanker Code:** JavaScript-Logik bleibt absolut minimiert (<18 KB).
- **Robustheit:** Die App läuft layout-stabil, selbst wenn JS verzögert oder blockiert.
- **Zukunftssicherheit:** Veraltete APIs wie `execCommand` werden nicht mehr verwendet.

### Risiken & Negative Auswirkungen
- Visuelle Statustoggles erfordern teilweise fortgeschrittenes CSS (z.B. Segmented Controls, `:has()`).

## 5. Implementation & Verification

- CSS Anchor Positioning ersetzt ehemalige JS-Koordinatenberechnung.
- `execCommand` ist in den Anti-Pattern-Regeln verboten.
- Die reine DOM-basierte Datenkopplung (wie in `sender-sync.js`) demonstriert den Verzicht auf globale State-Stores zugunsten reaktiver DOM-Updates für das Ausfüllen des Absenders.
- View Transitions sind in `main.js` für Formularwechsel und Theme-Toggles produktiv.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-CSS]]
- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]

---

### Feature Checks

```javascript feature-check
f("Temporal API", typeof globalThis.Temporal !== "undefined", "Chrome 146", "Future-Proof"),
f("View Transitions (Scoped)", typeof document.startViewTransition !== "undefined", "Chrome 146", "Future-Proof"),
f("Sanitizer API (Native)", typeof globalThis.Sanitizer !== "undefined", "Chrome 147", "Future-Proof"),
f("Promise.withResolvers()", typeof Promise.withResolvers !== "undefined", "Chrome 119", "Produktiv")
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-OMNITRACEABILITY.md',
  'ADR-OMNI: OmniTraceability System',
  'rejected',
  '# ADR-OMNI: OmniTraceability System

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
- `start.ps1` garantiert durch die Reality Reconciliation einen *Evolutionary Fitness Score* von 100%.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-Toast-Architecture.md',
  'ADR - Toast Architecture (Next Level)',
  'accepted',
  '# Architecture Decision Record: Next-Level Toast System

## Context
The application required a robust notification system (Toasts). Previous implementations relied on complex `display: none` toggles, manual event listeners for outside clicks, and simplistic JavaScript timeouts that often resulted in "notification spam" when users triggered rapid events (e.g., clicking save repeatedly).
We needed a system that is robust, visually appealing, accessible (a11y), and dependency-free (Vanilla JS/CSS).

## Decision
We decided to completely overhaul the Toast architecture with a "Next Level" approach based purely on modern W3C standards:

1. **Native Popover API (`popover="manual"`)**:
   Instead of using `z-index` wars, the Toast is hoisted to the native Top-Layer of the browser.
2. **CSS `@starting-style` & Discrete Transitions**:
   We eliminated JS-based animation listeners. The browser natively handles symmetric enter/exit animations via `allow-discrete` transitions on the `display` property.
3. **Multi-Stacking (Spam Prevention)**:
   Instead of queuing 10 identical messages, the system deduplicates. If the exact same message is triggered while active, it increments a visual badge (`x2`, `x3`) and triggers a CSS `@keyframes shake` animation to provide feedback without visual clutter.
4. **Actionable & Sticky Toasts**:
   The API allows passing an `action` object (e.g., "Undo" button) and supports a `sticky` mode for progress indicators that do not automatically expire.
5. **W3C Accessibility (ARIA)**:
   The Toast container is strictly marked with `role="alert"`, `aria-live="assertive"`, and `aria-atomic="true"`, ensuring Screenreaders announce notifications immediately.
6. **Swipe-to-Dismiss**:
   Using `PointerEvents`, the Toast can be swiped horizontally to dismiss it intuitively, mimicking native mobile OS behavior.

## Consequences
- **Positive**: Zero external dependencies. Extremely performant. Best-in-class UX and Accessibility. The codebase (`js/toast.js`) is fully decoupled from `main.js`.
- **Negative**: Relies on modern browser features (Popover API, `@starting-style`). Browsers older than ~late 2023 will not render the enter/exit animations gracefully, though the logic degrades safely.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/ADR-ÜBERSICHT.md',
  'ADR-Übersicht',
  'active',
  '# ADR-Übersicht (Dataview)

> [!info] Über dieses Dokument
> Dieses Dashboard nutzt das **Obsidian Dataview-Plugin**, um alle Architectural Decision Records (ADRs) des Projekts `DIN-BriefNEO` automatisch aufzulisten.

## Aktive Entscheidungen

```dataview
TABLE status, date as Datum, last-reviewed as "Zuletzt geprüft", deciders as Entscheider
FROM "ADR"
WHERE type = "adr" AND (status = "accepted" OR status = "proposed") AND project = "DIN-BriefNEO"
SORT date DESC
```

## Veraltet / Abgelehnt

```dataview
TABLE status, date as Datum, last-reviewed as "Zuletzt geprüft", deciders as Entscheider
FROM "ADR"
WHERE type = "adr" AND (status = "deprecated" OR status = "rejected") AND project = "DIN-BriefNEO"
SORT date DESC
```

## Entwürfe (Drafts)

```dataview
TABLE status, date as Datum, last-reviewed as "Zuletzt geprüft", deciders as Entscheider
FROM "ADR"
WHERE type = "adr" AND status = "draft" AND project = "DIN-BriefNEO"
SORT date DESC
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/Archive/ADR-MIGRATION.md',
  'ADR-MIGRATION: Extraktion zur llm_boilerplate',
  'accepted',
  '# ADR: Architektur für Extraktion zur llm_boilerplate

## Kontext
DIN-Brief Neo dient als Testballon für KI-gestützte Entwicklungsmuster, die später in einer generischen `llm_boilerplate` wiederverwendet werden sollen. Um dies zu ermöglichen, muss das Projekt strikt in generische und projektspezifische Bestandteile getrennt sein.

## Entscheidung
Wir haben uns für eine **geschichtete Architektur** entschieden, bei der Tools und Regeln physisch vom Website-Code separiert sind:

1. **Website-Code (`website/`)**: Enthält die reine Anwendung (DIN-Brief spezifisch). Wird nicht extrahiert.
2. **Tools (`tools/`)**: Enthält Node.js-Skripte wie `build_db.js`, `log_session.js` und `reconciliation.js`. Diese Skripte sind generisch und konfigurierbar.
3. **Antipatterns (`tools/antipatterns/`)**: Die KI-Regeln sind in Layer unterteilt:
   - `base.json`: Universelle Regeln (z.B. Temporal/Date API)
   - `web.json`: Allgemeine Web-Regeln (execCommand, XHR, innerHTML, etc.)
   - `project.json`: Nur DIN-Brief spezifisch

## Konsequenzen
Diese Architektur ist als "fait accompli" (bereits umgesetzt) zu betrachten.
Zukünftige KI-Regeln, die nicht ausschließlich DIN-Brief betreffen, **müssen zwingend** in `base.json` oder `web.json` eingetragen werden, damit sie automatisch in die `llm_boilerplate` übernommen werden können.
Regeln, die nur für DIN-Brief Neo gelten, kommen in `project.json`.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/Code-Referenzen.md',
  'Code-Referenzen',
  'active',
  '# Code-Referenzen

Diese Datei wird automatisch von `build_db.js` generiert und listet alle Architektur- und Guide-Verknüpfungen aus dem Quellcode auf.

| Code Datei | Zeile | ADR | Guide |
| :--- | :--- | :--- | :--- |
| website/index.html | 1 | [[ADR-HTML]] | - |
| website/index.html | 2 | - | [[din-5008-layout]] |
| website/js/constants.js | 1 | [[ADR-JS]] | - |
| website/js/constants.js | 2 | - | [[glossary]] |
| website/js/dev-tools.js | 1 | [[ADR-DATA-PERSISTENCE]] | - |
| website/js/geoapify.js | 1 | [[ADR-API]] | - |
| website/js/geoapify.js | 2 | - | [[geoapify-autocomplete]] |
| website/js/geoapify.js | 6 | [[ADR-API]] | - |
| website/js/main.js | 1 | [[ADR-JS]] | - |
| website/js/main.js | 2 | - | [[no-scroll-techniques]] |
| website/js/metadata.js | 1 | [[ADR-JS]] | - |
| website/js/metadata.js | 2 | - | [[glossary]] |
| website/js/salutation-engine.js | 1 | [[ADR-JS]] | - |
| website/js/salutation-engine.js | 2 | - | [[glossary]] |
| website/js/salutation-engine.js | 19 | [[ADR-JS]] | - |
| website/js/salutation-engine.js | 87 | [[ADR-JS]] | - |
| website/js/sender-sync.js | 1 | [[ADR-JS]] | - |
| website/js/sender-sync.js | 2 | - | [[glossary]] |
| website/js/signature.js | 1 | [[ADR-JS]] | - |
| website/js/signature.js | 2 | - | [[glossary]] |
| website/js/signature.js | 5 | [[ADR-JS]] | - |
| website/js/storage.js | 1 | [[ADR-DATA-PERSISTENCE]] | - |
| website/js/storage.js | 2 | - | [[glossary]] |
| website/js/storage.js | 6 | [[ADR-DATA-PERSISTENCE]] | - |
| website/js/toast.js | 1 | [[ADR-JS]] | - |
| website/js/toast.js | 2 | - | [[chrome-modern-css]] |
| website/js/toast.js | 4 | [[ADR-JS]] | - |
| website/css/floating.css | 1 | [[ADR-CSS]] | - |
| website/css/floating.css | 2 | - | [[chrome-modern-css]] |
| website/css/layout.css | 1 | [[ADR-CSS]] | - |
| website/css/layout.css | 2 | - | [[din-5008-geometry]] |
| website/css/reset.css | 1 | [[ADR-CSS]] | - |
| website/css/reset.css | 2 | - | [[chrome-modern-css]] |
| website/css/variables.css | 1 | [[ADR-CSS]] | - |
| website/css/variables.css | 2 | - | [[chrome-modern-css]] |',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR/Code-Referenzen.md'), 'autogenerated');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR/Code-Referenzen.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR/Code-Referenzen.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR/Code-Referenzen.md'), 'code');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/Support/ADR-TEMPLATE.md',
  'ADR-XXX: [Kurzer, präziser Titel der Entscheidung]',
  'chosen',
  '# ADR-XXX: [Kurzer, präziser Titel]

## 1. Context & Problem

**Kurze, präzise Beschreibung des Problems (max. 5–6 Sätze).**

- Was ist das konkrete Problem?
- Warum ist eine Entscheidung notwendig?
- Welcher Kontext ist relevant?

> [!info] Hintergrund (optional)
> Nur bei Bedarf für zusätzlichen Kontext. Nicht übertreiben.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** | ... | ... | ... | ... | ... |
| **Option B** | ... | ... | ... | ... | ... |
| **Option C** | ... | ... | ... | ... | ... |

## 3. Decision

**Wir haben uns für Option X entschieden.**

### Begründung

- Punkt 1 (kurz & präzise)
- Punkt 2
- Punkt 3

## 4. Consequences

### Positive Auswirkungen
- ...
- ...

### Risiken & Negative Auswirkungen
- ...
- ...

### Langfristige Auswirkungen
- ...

## 5. Implementation & Verification

- Was wurde konkret umgesetzt?
- Wie wird die Einhaltung der Entscheidung sichergestellt? (z.B. durch Reconciliation, Code-Review, Tests, Antipattern-Regeln)
- Gibt es offene Punkte?

## 6. Related Documents

- [[longevity-guidelines]]
- [[ADR-YYY]]
- [[constitution]]

---

### Feature Checks (falls relevant)

```javascript feature-check
// f("Feature Name", Bedingung, "Chrome XXX", "Status")
```

---

## Hinweise zur Nutzung dieses Templates

- **Frontmatter ist verpflichtend** und muss vollständig ausgefüllt werden.
- Der Abschnitt **"Context & Problem"** soll kurz und fokussiert bleiben.
- Die **Entscheidung** muss klar und unmissverständlich formuliert sein.
- Redundanzen zu `longevity-guidelines.md` und `constitution.md` vermeiden — stattdessen verlinken.
- Jede ADR sollte **eine klare Entscheidung** treffen, keine Essays schreiben.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR/Support/Code-Referenzen.md',
  'Code-Referenzen',
  'active',
  '# Code-Referenzen

Diese Datei wird automatisch von `build_db.js` generiert und listet alle Architektur-Verknüpfungen aus dem Quellcode auf.

| Code Datei | Zeile | Architektur-Entscheidung |
| :--- | :--- | :--- |
| website/js/main.js | 1296 | [[ADR-JS]] |
| website/js/signature.js | 1 | [[ADR-JS]] |
| website/css/layout.css | 1 | [[ADR-CSS]] |',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/ADR-005-Sender-Synchronization.md',
  'Sender Synchronization Logic (Absenderblock -> Rücksendezeile)',
  'accepted',
  '# ADR-005: Sender Synchronization Logic

## Context
In previous iterations of the DIN-BriefNEO project, the "Informationsblock" (metadata block on the right side of the letter) was removed in an attempt to simplify the UI for private letters. This inadvertently destroyed a core UX feature of the original `din-5008-css` template: The automatic synchronization of the sender''s name and address into the `Rücksendezeile` (the tiny return address line above the recipient) and the `Maschinenschrift` (the typed name below the signature).

The user firmly requested this logic to be restored and declared it an invariant principle for the project: Changes to the sender metadata must seamlessly and automatically mirror into the respective letter elements to prevent double data entry.

## Decision
We restore the `<din-infoblock>` (or sender input fields) and introduce a dedicated synchronization script (`sender-sync.js`) that enforces the following data flow:
1. `info-name`, `info-street`, and `info-city` are the single source of truth for the sender''s address.
2. An `input` event listener continuously concatenates these fields with a separator (e.g., ` • `) and injects the result into the `<din-absender id="absender">` element (Rücksendezeile).
3. The `info-name` field is additionally mirrored into the `<div id="unterschrift">` (Maschinenschrift) element.

## Consequences
- **Positive:** Restores the beloved "magic" synchronization from the original template, drastically improving UX.
- **Positive:** Prevents the return address line and the signature name from going out of sync with the main sender block.
- **Negative:** Requires strict DOM structure. The `unterschrift` element must be carefully managed so that `contenteditable` does not destroy sibling elements (like the signature image).

## Implementation Rules
- **Rule 1:** The signature image (`#signature-image`) MUST reside in a separate DOM container outside of the `contenteditable` `#unterschrift` element.
- **Rule 2:** The `sender-sync.js` module MUST be loaded during the initial application setup in `main.js`.
- **Rule 3:** This logic is considered **core functionality** and MUST NOT be removed in future refactoring attempts.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR-005-Sender-Synchronization.md'), 'architecture');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR-005-Sender-Synchronization.md'), 'ui');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR-005-Sender-Synchronization.md'), 'ux');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/ADR-005-Sender-Synchronization.md'), 'sync');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/Architecture-Compliance-Matrix.md',
  'Architecture Compliance Matrix (IMR 4.0 Standard)',
  'active',
  '# 🛠 Architecture Compliance Matrix (IMR 4.0 Standard)

> [!IMPORTANT]
> **Baseline:** Chrome 147+ ist die verbindliche Plattform. Die Platinum Validation Pipeline (PVP) prüft alle Commits gegen diese Baseline. Ältere Browser werden explizit nicht unterstützt.

Diese Matrix definiert die technologischen Leitplanken für DIN-BriefNEO.  
Wir wenden die **Chrome 147+ Baseline** konsequent an, um eine *Pure & Flat Architecture* ohne Legacy-Ballast zu garantieren.

---

### 🚦 Status-System
- ✅ **Aktiv**      → Im Code implementiert und aktiv genutzt.
- 🟡 **Geplant**    → Definitiv in nächsten 2 Sprints (Q2 2026).
- 📋 **Roadmap**    → Langfristige Planung (2026/2027).
- 🧪 **Experimentell** → In Test-Suites aktiv, noch nicht produktiv.

> [!TIP]
> Nutze `npm run check:compliance`, um die Einhaltung dieser Matrix in deinem lokalen Workspace zu verifizieren.

---

### 0. Platinum Basistechnologie (Universell)

| Icon / Name            | Moderne API (**TARGET**)      | Strategie & Best Practice (inkl. Quellen) | Status |
|------------------------|-------------------------------|-------------------------------------------|--------|
| **Layering**           | `CSS @layer`                  | Hierarchie vor Spezifität – löst Kaskadenkonflikte. | ✅ Aktiv |
| **Typed Props**        | `@property`                   | Typsicherheit für CMA-Koordinaten (mm-Präzision). | ✅ Aktiv |
| **CSS-Isolation**      | `@scope`                      | Isoliert Paper-CSS ohne Shadow-DOM-Nachteile. | ✅ Aktiv |
| **Animations**         | `interpolate-size`            | Native Layout-Anims für `height: auto`. | ✅ Aktiv |
| **Farbe**              | `oklch()`                     | Wahrnehmungsgetreue Farben & `color-mix()`. | ✅ Aktiv |
| **Theming**            | `light-dark()`                | Zero-JS System-Farbschema-Umschaltung. | ✅ Aktiv |
| **Overflow**           | `@container scroll-state`     | Native Überlauf-Warnung ohne JS-Listener. | ✅ Aktiv |
| **Layout**             | Container Queries             | Komponenten reagieren auf A4‑Platz (`size`). | ✅ Aktiv |
| **Logik (CSS)**        | `:has()`                      | Zero-JS State Management (Layout/Theme/Guides). | ✅ Aktiv |
| **Typografie**         | `font-feature-settings`       | Tabellenziffern & Slashed-Zero für IBAN/Datum. | ✅ Aktiv |
| **Auto-Resize**        | `field-sizing: content`       | Textfelder wachsen organisch mit dem Inhalt. | ✅ Aktiv |
| **3D-Carousel**        | `--position`, `--i` Vars      | Dynamische 3D-Transformationen ohne JS (v4.8.0). | ✅ Aktiv |
| **Toast-System**       | CSS Keyframes + `popover`      | Vollständige CSS-Choreographie, kein `setTimeout`. | ✅ Aktiv |
| **Form C Layout**      | `:has(#state-layout-c)`       | Flexbox-basiertes, gestapeltes Layout (v4.8.0). | ✅ Aktiv |
| **Auto-Detection**     | `_updateSalutation()`         | Erkennung von "Frau/Herr/Ms/Mr" im Anschriftfeld. | ✅ Aktiv |
| **Ghost-Text**         | `data-salutation`             | Platzhalter-Vorschläge via CSS `:empty::before`. | ✅ Aktiv |
| **Footer Auto-Hide**   | `din-fuss > *:empty`          | Leere Fußzeilen-Elemente automatisch ausblenden. | ✅ Aktiv |
| **Positioning**        | CSS Anchor                    | Popovers kleben ohne JS am Anker. | 📋 Roadmap |
| **Overlays**           | `<dialog>` + `popover`        | Native Modals & Tooltips (ADR-017). | ✅ Aktiv |
| **Invokers**           | Invoker Commands              | Deklarative Button-Trigger (`commandfor`). | 📋 Roadmap |
| **Hover-Invoker**      | `interesttarget`              | Zero‑JS‑Tooltips (Chrome 147+). | 📋 Roadmap |
| **Logik (Zeit)**       | Temporal API                  | Fehlerfreie Datumsberechnung (ADR-017). | ✅ Aktiv |
| **Sicherheit**         | Sanitizer API                 | XSS‑Schutz durch `setHTML()` statt `innerHTML`. | ✅ Aktiv |
| **Typografie**         | `text-wrap: balance / pretty` | Vermeidet Witwen & Waisen; optische Balance. | 🟡 Geplant |
| **Attr‑Config**        | `attr(data-* type)`           | Typisierte CSS‑Werte direkt aus HTML. | 🟡 Geplant |
| **Validierung**        | Constraint API                | Browser‑eigene Formularvalidierung nutzen. | ✅ Aktiv |

---

## 🏗️ Implementierungspfade & High‑End APIs

| Icon / Name          | Pfad / API                     | Strategie & Best Practice |
|----------------------|--------------------------------|---------------------------|
| **Dateisystem**      | FileSystem Access              | Server‑Only: direktes Schreiben auf Disk. `/WICG/file-system-access` |
| **Persistenz**       | OPFS                           | Origin Private File System für High‑Perf State. `/WICG/file-system-access` |
| **Reaktivität**      | `Proxy` Objects                | SSoT (Single Source of Truth) via Proxy Traps. `/tc39/ecma262` |
| **Grafik**           | SVG (inline)                   | Vektorscharfe Logos & Wasserzeichen. `/W3C/SVG2` |
| **Performance**      | `scheduler.postTask()`         | Priorisierung von UI‑Updates. `/WICG/scheduling-apis` |
| **Events**           | Custom Events                  | Kommunikation zwischen Entitäten. `/whatwg/html` |
| **Sanitization**     | Sanitizer API                  | Standardisierte HTML‑Säuberung. `/WICG/sanitizer-api` |
| **Edit Context**     | `EditContext API`              | Direkte Kontrolle über den Input-Stream. `/WICG/edit-context` |
| **Print Logic**      | `@media print`                 | Optimierung für PDF-Export. `/W3C/css-break-3` |

---

## ⚠️ Bekannte Architektur-Einschränkungen

### 1. IMR & Multi-Page Synchronisation
Die **Input Mapping Registry (IMR)** nutzt aktuell `document.querySelector()`, was konzeptionell nur das **erste Vorkommen** eines DIN-Tags im DOM synchronisiert. 
- **Auswirkung:** Auf Folgeseiten (`din-A4` Instanzen > 1) werden IMR-Daten (wie Kopfzeilen oder Absenderdaten) nicht automatisch aktualisiert, wenn sie dort erneut vorkommen.
- **Strategie:** Für die aktuelle Phase ist dies akzeptabel, da Kopfdaten nur auf Seite 1 gedruckt werden. Eine zukünftige Erweiterung auf `querySelectorAll()` mit Page-Index-Mapping ist für das Backlog (v5.0) geplant.

### 2. PDF-Metadaten (Print-to-PDF)
XMP-Metadaten können über den nativen Browser-Druckdialog (`window.print()`) nicht in den PDF-Stream eingebettet werden.
- **Strategie:** Wir nutzen die **OCR-Bridge** (unsichtbarer Textblock im Body) als Primärstrategie für Systeme wie Paperless-ngx. Dateinamen werden via `document.title` manipuliert.

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[issues/#2_Architecture_Compliance_Matrix]] | Technologie-Leitplanken |
| [[issues/#1 DIN 5008 HTML Tag Glossar]] | Alle 45+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.8 | **Letzte Sync:** 2026-04-01

---

## 🔗 Verwandte Dokumente (Dataview)

```dataview
TABLE 
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
```

---

**Status:** ACTIVE  
**Nächste Überprüfung:** 2026-06-30  
**Verantwortlich:** Lead Systems Architect',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/Function-Traceability.md',
  'Function Traceability Matrix',
  'active',
  '# Function Traceability Matrix

Die Function Traceability Matrix ist das Herzstück unseres Compliance-Systems. Sie beweist, dass jede Zeile Logik in `website/` durch eine Spezifikation oder Architektur-Entscheidung legitimiert ist.

## 📖 Wie man dieses Dokument liest
Dieses Dokument aggregiert die bidirektionalen Verbindungen zwischen Code und Dokumentation.
- **Funktion / Modul:** Der funktionale Name der Logik (oft abgeleitet vom Dateinamen).
- **Code Datei:** Die physische Datei im Dateisystem (`website/`).
- **Architektur-Record (ADR):** Die Architektur-Entscheidung, die begründet, *warum* der Code existiert und *wie* er sich in das Gesamtsystem einfügt.
- **Implementierungs-Guide:** Die konkrete Anleitung, *wie* der Code zu schreiben und zu warten ist (Best Practices).

## 🤖 Automatisierte Mapping-Tabelle

> [!WARNING]
> **Manuelle Eingriffe in der Tabelle verboten!**
> Die Tabelle innerhalb der HTML-Kommentare unten wird zu 100% maschinell durch `tools/build_db.py` (früher `tools/build_db.js`) erzeugt. Bitte trage hier keine neuen Zeilen manuell ein, da sie beim nächsten Build überschrieben werden.

Das Python-Skript `tools/build_db.py` liest die `@adr`- und `@guide`-Tags aus den Quellcode-Dateien (`website/`) aus und generiert diese Tabelle beim Build-Prozess (`start.ps1`) neu. 
Das stellt sicher, dass unsere Datenbank (SQLite) und das Obsidian-Frontend immer synchron sind.

Um einen neuen Knotenpunkt hinzuzufügen:
1. Schreibe die neue Code-Datei.
2. Füge den Header-Kommentar `/* @adr [[ADR-Name]] */` in die Code-Datei ein (bei CSS auch `/* @guide [[Guide-Name]] */`).
3. Führe `start.ps1` aus.

<!-- BEGIN AUTOMATED MATRIX -->
| Funktion / Modul | Code Datei | Architektur-Record (ADR) | Implementierungs-Guide |
| :--- | :--- | :--- | :--- |
| **Floating** | `website/css/floating.css` | [[ADR-CSS]] | [[chrome-modern-css]] |
| **Layout** | `website/css/layout.css` | [[ADR-CSS]] | [[din-5008-geometry]] |
| **Reset** | `website/css/reset.css` | [[ADR-CSS]] | [[chrome-modern-css]] |
| **Variables** | `website/css/variables.css` | [[ADR-CSS]] | [[chrome-modern-css]] |
| **Index** | `website/index.html` | [[ADR-HTML]] | [[din-5008-layout]] |
| **Constants** | `website/js/constants.js` | [[ADR-JS]] | [[glossary]] |
| **Geoapify** | `website/js/geoapify.js` | [[ADR-API]] | [[geoapify-autocomplete]] |
| **initAddressServices** | `website/js/geoapify.js` | [[ADR-API]] |  |
| **Healthcheck** | `website/js/healthcheck.js` | [[ADR-JS]] | [[testing-guide]] |
| **Main** | `website/js/main.js` | [[ADR-JS]] | [[no-scroll-techniques]] |
| **Dynamic Squeezing** | `website/js/main.js` | [[ADR-JS]] |  |
| **JSON Data-IO** | `website/js/main.js` | [[ADR-DATA-PERSISTENCE]] |  |
| **Metadata** | `website/js/metadata.js` | [[ADR-JS]] | [[glossary]] |
| **Salutation-engine** | `website/js/salutation-engine.js` | [[ADR-JS]] | [[glossary]] |
| **SalutationEngine** | `website/js/salutation-engine.js` | [[ADR-JS]] |  |
| **SalutationFeature** | `website/js/salutation-engine.js` | [[ADR-JS]] |  |
| **Signature** | `website/js/signature.js` | [[ADR-JS]] | [[glossary]] |
| **SignatureFeature** | `website/js/signature.js` | [[ADR-JS]] |  |
| **Storage** | `website/js/storage.js` | [[ADR-DATA-PERSISTENCE]] | [[glossary]] |
| **StorageModule** | `website/js/storage.js` | [[ADR-DATA-PERSISTENCE]] |  |
| **Toast** | `website/js/toast.js` | [[ADR-JS]] | [[chrome-modern-css]] |
| **ToastSystem** | `website/js/toast.js` | [[ADR-JS]] |  |
<!-- END AUTOMATED MATRIX -->

---

## 📝 Manuelle Notizen & Ausnahmen

Alles außerhalb der automatisierten HTML-Kommentare ist für **manuelle Notizen** vorgesehen. Hier dokumentieren wir Architektur-Ausnahmen, globale Infrastruktur oder Legacy-Vermerke, die durch das automatisierte Code-Tagging nicht sinnvoll erfasst werden können.

### 📌 Regeln für manuelle Einträge
1. **Nur für echte Ausnahmen:** Wenn eine Datei ein @adr oder @guide Tag enthalten kann, dann nutze die automatisierte Matrix!
2. **Klarer Grund:** Begründe, warum diese Datei manuell dokumentiert wird.
3. **Lebende Dokumentation:** Halte diese Sektion sauber.

### 🛡️ Bekannte Infrastruktur-Ausnahmen

| Funktion / Modul | Code Datei | Grund für Ausnahme |
| :--- | :--- | :--- |
| **CSS Reset** | `website/css/reset.css` | Globales CSS-Reset. Ändert sich nicht, keine spezifische ADR-Verknüpfung notwendig. |
| **CSS Variables** | `website/css/variables.css` | Deklariert Basis-Tokens. Die Architektur-Entscheidung liegt bei den nutzenden CSS-Dateien. |
| **Start-Skript** | `start.ps1` | Build-Skript & Fitness-Gate. Läuft außerhalb des Web-Kontexts (PowerShell). |
| **Log-Session** | `tools/log_session.js` | Teil der Tooling-Infrastruktur für KI-Agenten, nicht Teil der Geschäftslogik. |',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/IMR-Registry.md',
  'IMR 4.0 — Die Definitive DIN 5008 Registry (Platinum Master)',
  'active',
  '# IMR 4.0 — Die Definitive DIN 5008 Registry (Platinum Master)

> [!NOTE]
> Das Anschriftfeld hat eine feste Höhe von 45mm[^1]. Überlaufender Text wird durch den Overflow-Alarm (`@container scroll-state`) visuell markiert.

> **Single Source of Truth (SSoT)** für die Platinum Validation Pipeline (PVP).  
> Diese Liste definiert alle **45 atomaren Daten-Tags** (inkl. Guides) mit Positionierung, Ausrichtung und Wachstumsverhalten.

**Version:** 4.8.0 | **Letzte Aktualisierung:** 2026-04-01 | **GitHub Issue:** [#1](https://github.com/grapefruit89/DIN-BriefNEO/issues/1)

---

## 📊 **Übersicht**

<details>
<summary>📋 Bereichs-Übersicht & Container-Struktur</summary>

| Bereich | Tags | Container | Wuchs-Verhalten |
|---------|------|-----------|-----------------|
| **Absender-Zone** | 8 | `<din-absender>` | Top-Down |
| **Anschriftfeld** | 8 | `<din-anschriftfeld>` | Top-Down (Fix 45mm) |
| **Metadaten & Infoblock** | 8 | `<din-infoblock>` | Top-Down |
| **Briefkern** | 6 | `<din-kern>` | Dynamisch |
| **Fußzeile** | 12 | `<din-fuss>` | Spalten-basiert |
| **Systemkomponenten** | 3 | – | – |

</details>

---

## 🗺️ **Architektur-Übersicht**

```mermaid
graph TD
    subgraph Input
        A[User Input]
    end
    
    subgraph Container
        B[din-absender]
        C[din-anschriftfeld]
        D[din-infoblock]
        E[din-kern]
        F[din-fuss]
    end
    
    subgraph Output
        G[HTML Rendering]
        H[CSS Positioning]
        I[JSON State]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    
    B --> G
    B --> H
    B --> I
    
    C --> G
    C --> H
    C --> I
    
    D --> G
    D --> H
    D --> I
    
    E --> G
    E --> H
    E --> I
    
    F --> G
    F --> H
    F --> I
```

---

## 🏢 1. Absender-Zone (Branding)

**Container:** `<din-absender>`  
**Position:** X: `25mm` | Y: `var(--din-y-header-start)`  
**Standard:** Form A: `27mm` | Form B: `45mm`

| Tag | Beschreibung | Ausrichtung | Validierung | DIN / Context7 |
|:---|:---|:---:|:---|:---|
| `<din-branding-logo>` | Firmenlogo (SVG/Base64) | Rechts | — | [`/whatwg/html`](https://html.spec.whatwg.org/) |
| `<din-absender-vorname>` | Vorname Absender | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-nachname>` | Nachname Absender | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-strasse>` | Straße & Hausnr. | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-ort>` | PLZ & Ort | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-zusatz>` | Adresszusatz | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-mail>` | E-Mail Adresse | Links | `type="email"` | `mailto:` |
| `<din-absender-tel>` | Telefonnummer | Links | `type="tel"` | `tel:` |

---

## ✉️ 2. Anschriftfeld (Empfänger)

**Container:** `<din-anschriftfeld>`  
**Position:** X: `25mm` | Y: Form A: `32mm` | Form B: `50mm`  
**Max-Breite:** `85mm` | **Höhe:** `45mm` (Fix)

| Tag | Beschreibung | Zeile | Ausrichtung | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---|:---|
| `<din-rucksendezeile>` | Kleinstzeile | 1 (fix) | Links | `font-size: 8pt` | DIN 5008: 16.1.2 |
| `<din-zusaetze>` | Vermerke/Zusätze | 2-4 | Links | — | DIN 5008: 16.1.3 |
| `<din-empfaenger-firma>` | Firmenname | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-abteilung>` | Abteilung | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-vorname>` | Vorname | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-nachname>` | Nachname | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-strasse>` | Straße & Hausnr. | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-ort>` | PLZ & Ort | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |

> ⚠️ **Wichtig:** Das Anschriftfeld hat eine **feste Höhe von 45mm**. Überlaufender Text wird abgeschnitten (DIN 5008 Konformität).

---

## 📅 3. Metadaten & Infoblock

**Container:** `<din-infoblock>`  
**Position:** X: `125mm` | Y (A): `32mm` | Y (B): `50mm`  
**Wuchs:** Top-Down

| Tag | Beschreibung | Y (A) | Y (B) | Ausrichtung | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---:|:---|:---|
| `<din-datum>` | Briefdatum | 74 | 92 | Links | `Temporal.PlainDate` | DIN 5008: 17.2 |
| `<din-ihr-zeichen>` | Ihr Zeichen | Flow | Flow | Links | — | DIN 5008: 17.1 |
| `<din-ihr-schreiben>` | Ihr Schreiben vom | Flow | Flow | Links | `ISO-8601` | [`/tc39/proposal-temporal`](https://tc39.es/proposal-temporal/) |
| `<din-unser-zeichen>` | Unser Zeichen | Flow | Flow | Links | — | DIN 5008: 17.1 |
| `<din-unser-schreiben>` | Bezugsdatum | Flow | Flow | Links | `ISO-8601` | [`/tc39/ecma262`](https://tc39.es/ecma262/) |
| `<din-durchwahl>` | Direkte Telefonnr. | Flow | Flow | Links | `type="tel"` | `tel:` |
| `<din-email-direkt>` | Direkte E-Mail | Flow | Flow | Links | `type="email"` | `mailto:` |
| `<din-internet>` | Web-URL | Flow | Flow | Links | `type="url"` | [`/whatwg/html`](https://html.spec.whwg.org/) |

---

## 📝 4. Briefkern (Dynamischer Inhalt)

**Container:** `<din-kern>`  
**Position:** X: `25mm` | Y (A): `91mm` | Y (B): `109mm`  
**Max-Breite:** `165mm` | **Wuchs:** Top-Down (dynamisch, triggert Paginierung)

| Tag | Beschreibung | Y (A) | Y (B) | Ausrichtung | Zeilen | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---:|:---:|:---|:---|
| `<din-betreff>` | Betreff (fett) | Flow | Flow | Links | **Einzeilig*** | Max 2 Zeilen | DIN 5008: 18 |
| `<din-anrede>` | Anredeformel | Flow | Flow | Links | **Einzeilig** | — | DIN 5008: 19 |
| `<din-text>` | Haupt-Inhalt | Flow | Flow | Blocksatz* | **Mehrzeilig** | Sanitizer API | DIN 5008: 20 |
| `<din-grussformel>` | Grußformel | Flow | Flow | Links | **Einzeilig** | — | DIN 5008: 21 |
| `<din-unterschrift>` | Unterzeichner | Flow | Flow | Links | **Einzeilig** | — | DIN 5008: 22 |
| `<din-anlagen>` | Anlagenverzeichnis | Flow | Flow | Links | **Mehrzeilig** | — | DIN 5008: 23 |

> ℹ️ *Betreff: Startet zwingend UNTER der ersten Falzmarke (105mm/87mm). Smart-Squeezing versucht ihn einzeilig zu halten.*

> ℹ️ **Blocksatz mit Silbentrennung** wird für DIN-Briefe empfohlen:  
> `text-align: justify; text-justify: inter-word; hyphens: auto;`


---

## 📄 5. Fußzeile (Footer) – 4 Spalten

**Container:** `<din-fuss>`  
**Position:** X: `25mm` | Y: `241mm`  
**Max-Breite:** `165mm` | **Wuchs:** Spalten-basiert  
**Layout:** 4 Spalten (je 25% Breite)

| Tag | Beschreibung | Spalte | Y | Ausrichtung | Zeilen | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---:|:---:|:---|:---|
| `<din-fuss-firma>` | Firmenbezeichnung | 1 | 241 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-sitz>` | Firmensitz | 1 | 246 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-gericht>` | Registergericht | 1 | 251 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-hrb>` | Handelsregister-Nr. | 1 | 256 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-vorstand>` | Vorstand / Inhaber | 2 | 241 | Links | **Mehrzeilig** | — | DIN 5008: 24 |
| `<din-fuss-gf>` | Geschäftsführer | 2 | 251 | Links | **Mehrzeilig** | — | DIN 5008: 24 |
| `<din-fuss-stnr>` | Steuernummer | 3 | 241 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-ustid>` | USt-IdNr. | 3 | 246 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-bank>` | Name der Bank | 4 | 241 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-iban>` | IBAN | 4 | 246 | Links | **Einzeilig** | `BigInt` Mod-97 | ISO 13616 |
| `<din-fuss-bic>` | BIC | 4 | 251 | Links | **Einzeilig** | `regex` | ISO 9362 |
| `<din-fuss-anschrift>` | Hausanschrift | 4 | 256 | Links | **Einzeilig** | — | DIN 5008: 24 |

---

## 🛠️ 6. Systemkomponenten (Guides)

Diese Tags dienen der internen Visualisierung und Compliance-Kontrolle.

`<din-falz-oben>`
:   Obere Faltmarke (DIN 5008 SSO Fixpunkt). Positioniert sich fix bei Form A: `87mm` | Form B: `105mm`.

`<din-falz-unten>`
:   Untere Faltmarke (DIN 5008 SSO Fixpunkt). Positioniert sich fix bei Form A: `181mm` | Form B: `210mm`.

`<din-lochmarke>`
:   Lochmarke (DIN 5008 Mitte). Positioniert sich absolut fix bei `148.5mm`.

`<din-overlay>`
:   SVG-Referenz-Overlay für den visuellen Layout-Audit (Platinum Feature).

---

## ✨ 7. Auto-Detection & Intelligente Vorschläge (v4.8.0)

| Feature | Implementierung | Beschreibung |
|---------|-----------------|--------------|
| **Empfänger-Typ Auto-Erkennung** | `js/ui.js` → `_updateSalutation()` | Scannt Anschriftfeld nach "Frau", "Herr", "Ms", "Mr". Setzt `recipientType` dynamisch. |
| **Ghost-Text Anrede** | `data-salutation` Attribut | Vorschlag basierend auf Stil und Empfänger. Sichtbar solange Feld leer ist. |
| **Ghost-Text Grußformel** | `data-greeting` Attribut | Vorschlag basierend auf Stil. Sichtbar solange Feld leer ist. |

---

## 🎠 8. 3D-Carousel Systemvariablen (v4.8.0)

| Variable / Selektor | Beschreibung | Verwendung |
|---------------------|--------------|------------|
| `--position` | Aktive Seite im Carousel | 1-basiert, steuert 3D-Transformation |
| `--i` | Individueller Seiten-Index | Pro `din-A4` Element, für Distanzberechnung |
| `din-fuss > *:empty` | Automatisches Ausblenden | Leere Footer-Elemente werden nicht gerendert |

---

## 📐 9. Layout-Varianten (Form C)

| Modus | CSS-Selektor | Beschreibung |
|-------|--------------|--------------|
| **Form C (Modern)** | `:root:has(#state-layout-c:checked)` | Flexbox-basiertes, fließendes Layout ohne absolute Positionierung. Alle Elemente gestapelt. |

---

[^1]: DIN 5008:2020-03, Abschnitt 16.1.4 – Maße des Anschriftfeldes für Fensterbriefe.

## 📝 Changelog

| Datum | Version | Änderung | Autor |
|-------|---------|----------|-------|
| 2026-04-01 | 4.8.0 | Auto-Erkennung Empfänger-Typ hinzugefügt | [@grapefruit89](https://github.com/grapefruit89) |
| 2026-04-01 | 4.8.0 | Ghost-Text für Anrede/Grußformel dokumentiert | [@grapefruit89](https://github.com/grapefruit89) |
| 2026-04-01 | 4.8.0 | 3D-Carousel CSS-Variablen (`--position`, `--i`) ergänzt | [@grapefruit89](https://github.com/grapefruit89) |
| 2026-04-01 | 4.8.0 | Form C Layout dokumentiert | [@grapefruit89](https://github.com/grapefruit89) |
| 2026-04-01 | 4.8.0 | Footer leere Elemente Auto-Hide dokumentiert | [@grapefruit89](https://github.com/grapefruit89) |
| 2026-03-31 | 4.7.0 | Initiale Version | [@grapefruit89](https://github.com/grapefruit89) |

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[issues/#2_Architecture_Compliance_Matrix]] | Technologie-Leitplanken |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.8 | **Letzte Sync:** 2026-04-01

---

## 🔗 Verwandte Dokumente (Dataview)

```dataview
TABLE 
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
```

---

**Status:** ACTIVE  
**Nächste Überprüfung:** 2026-04-30  
**Verantwortlich:** Lead Systems Architect',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/IMR-Toast-Registry.md',
  'IMR Toast Registry',
  'active',
  '# IMR Toast Registry

Dieses Dokument ist die **Single Source of Truth** für alle System-Benachrichtigungen (Toasts), die über das native Popover-System in der Anwendung ausgegeben werden.

Das Toast-System (`js/toast.js`) nutzt eine dynamische Laufzeit (`2000ms + 30ms pro Zeichen`, maximal `5000ms`) und verfügt über eine Deduplizierungs-Warteschlange ("Spam-Schutz") sowie Hover-to-Pause Mechaniken.

## Toast Level & Styling

Alle Toasts verwenden native CSS-Transitions (`@starting-style`) und definieren ihre Farb-Akzente über die Semantik-Klasse `.type-{level}`.

| Level | CSS Klasse | Accent Color | Einsatzgebiet |
| :--- | :--- | :--- | :--- |
| **Info** | `.type-info` | `var(--c-primary)` | Neutrale System-Hinweise (Standard). |
| **Success** | `.type-success` | `var(--c-success)` | Erfolgreiche Aktionen (Speichern, Key validiert). |
| **Warning** | `.type-warning` | `var(--c-warning)` | Nicht-kritische Fehler (z.B. API Limit erreicht). |
| **Error** | `.type-error` | `var(--c-danger)` | Kritische Systemfehler (API Key ungültig). |

---

## Registrierte System-Toasts

Hier werden die exakten Wording-Strings definiert, die vom System getriggert werden.

> [!NOTE]
> Die Icons (Emojis) sind harter Bestandteil des Strings und werden im JavaScript (`showToast`) mit übergeben.

### 💾 Storage & Persistence
- **Draft gesichert:** `💾 Entwurf automatisch gespeichert` (Level: `info`)
- **Manuell gesichert:** `💾 Entwurf gespeichert` (Level: `success`)
- **Reset:** `🗑️ Alle Eingaben gelöscht` (Level: `warning`)

### 🔑 Geoapify & Address API
- **Key gültig:** `🔑 Geoapify Key gültig!` (Level: `success`)
- **Key ungültig:** `❌ Geoapify Key ungültig` (Level: `error`)
- **Key Error:** `❌ Fehler bei der Key-Validierung` (Level: `error`)
- **API Offline/Limit:** `❌ Geoapify API-Key ist ungültig oder abgelaufen! Bitte neu eintragen.` (Level: `error`)
- **Adresse übernommen:** `Adresse übernommen & gespeichert` (Level: `success`)

### 🔤 Font Manager
- **Upload erfolgreich:** `Font erfolgreich geladen` (Level: `success`)
- **Upload Fehler:** `Fehler beim Lesen der Schriftart` (Level: `error`)

### ⚙️ Healthcheck / Diagnostics
- **Plausibility Error:** Wird dynamisch mit dem betroffenen DOM-Element generiert, z.B. `[Architektur-Warnung] Element #xyz fehlt!` (Level: `warning`)

---',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/IMR-Toast-Registry.md'), 'din-briefneo/registry');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/IMR-Toast-Registry.md'), 'tech/ui');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/IMR-Toast-Registry.md'), 'components/toast');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/OmniTraceability.md',
  'OmniTraceability Systemarchitektur',
  'active',
  '# OmniTraceability Systemarchitektur

Das OmniTraceability-System garantiert, dass Quellcode und Dokumentation niemals asynchron laufen. Es schlägt die Brücke zwischen dem Quellcode (`website/`) und der Dokumentation (`docs/`), sodass jede logische Entität immer zweifelsfrei auf ihre architektonischen Entscheidungen (ADRs) und Implementierungs-Richtlinien (Guides) zurückgeführt werden kann.

## 🔄 Langfristige Wartungsanleitung (How-To)

Dieses System ist auf 3-5 Jahre Wartbarkeit ausgelegt. Im Gegensatz zu freitextlichen Wikis wird dieses System aktiv am Quellcode verankert. So gehst du in der Praxis damit um:

### Szenario A: Ein neues Feature wird entwickelt
1. **Entscheidung fällen:** Erstelle ein neues ADR aus dem `docs/10-architecture/ADR/Support/ADR-TEMPLATE.md`. Fülle die `decision_options` im Frontmatter aus und wähle die beste Option (`chosen_option`).
2. **Code schreiben:** Erstelle die neue Code-Datei, z.B. `website/js/feature.js`.
3. **Traceability herstellen:** Setze in Zeile 1 der Code-Datei den Header-Kommentar: 
   ```javascript
   /* @adr [[ADR-NEUES-FEATURE]] */
   ```
4. **Build:** Führe `start.ps1` aus. Das Feature erscheint automatisch im Build-Prozess und in der Matrix.

### Szenario B: Eine Architektur wird verworfen (Refactoring)
1. **Code löschen:** Lösche oder überschreibe den nicht mehr benötigten Code in `website/`.
2. **ADR archivieren:** Öffne das zugehörige ADR und ändere das Frontmatter auf `status: deprecated`.
3. **Kontext bewahren:** Füge im ADR unter "Consequences" einen kurzen Satz hinzu, warum das Konzept verworfen wurde. Das Wissen bleibt somit als Lektion erhalten.

### Szenario C: Ein globaler CSS-Bug wird behoben
1. **Kein neues ADR nötig:** Wenn es sich nur um die Korrektur einer bestehenden Logik handelt, ohne eine architektonische Entscheidung zu fällen, schreibe den Code einfach. Die Verknüpfung bleibt bestehen.
2. **Matrix manuell annotieren:** Falls die Datei eine spezielle Ausnahme darstellt (z.B. ein externes Polyfill), trage es unter "Manuelle Notizen" in der [[Function-Traceability]] ein.

## 🗄️ Relationales Architekturmodell (SQLite)

Das System ist nicht nur für Menschen (Obsidian), sondern explizit für eine spätere SQLite-Datenbank konzipiert.
Das Frontmatter aller `docs/` Dateien sowie die Header-Kommentare der `website/` Dateien bilden ein klares SQL-Schema ab:

1. **`tbl_concepts`**: Wird aus dem YAML Frontmatter extrahiert (`id`, `title`, `type`, `status`).
2. **`tbl_code_entities`**: Wird aus den Dateien im Ordner `website/` extrahiert.
3. **`tbl_concept_links`**: Die Mapping-Tabelle. Wird aus den Arrays `doc_links` und `code_links` sowie aus den `@adr` und `@guide` Code-Tags generiert.

Dadurch kann das Wissen später mit SQL-Abfragen durchsucht werden, z.B.:
```sql
SELECT title FROM tbl_concepts WHERE type = ''adr'' AND status = ''active'';
```

## 🛡️ Verbindliche Regeln (AGENTS.md)

Kein Feature darf den `main`-Branch erreichen, wenn seine Traceability-Kette gebrochen ist. Dies wird durch das automatisierte Fitness-Gate beim Ausführen von `start.ps1` verifiziert. Wenn eine Datei keine Verknüpfung aufweist, blockiert das Skript den Release-Prozess.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/10-architecture/README.md',
  '10-architecture README',
  'active',
  '# 10 Architecture
Architektur-Entscheidungen und Traceability.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/README.md'), 'readme');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/10-architecture/README.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/glossary.md',
  'Guide: Fachbegriff-Glossar: glossary.md',
  'active',
  '# Fachbegriff-Glossar: glossary.md

> [!info] Glossar & Dokumentations-Map
> Dieses Glossar bietet eine alphabetisch sortierte Übersicht und Kurzerklärungen zu allen Kerntechnologien, Web-APIs und Konzepten, die im **DIN-BriefNEO**-Projekt verwendet werden.
> 
> ```mermaid
> graph TD
>     G[glossary] -->|Erklärt Begriffe für| D1[din-5008-geometry]
>     G -->|Referenziert| D2[din-5008-layout]
>     G -->|Ergänzt| L[longevity-guidelines]
>     L --> C[chrome-modern-css]
>     L --> N[no-scroll-techniques]
>     T[testing-guide] -.->|Überprüft| G
> ```

---

## 🔤 Begriffslexikon

### `AbortController`
*   **Kurzdefinition:** Eine native JavaScript-API, mit der eine oder mehrere Webanfragen (z. B. `fetch`) vorzeitig abgebrochen werden können.
*   **Nutzen im Projekt:** Schützt vor Race Conditions bei der Adress-Autovervollständigung, indem alte Netzwerk-Requests sofort abgebrochen werden, wenn der Benutzer einen neuen Buchstaben eintippt.
*   **Verweis:** Siehe [[ADR-API#4-race-condition-schutz-via-abortcontroller|ADR-API.md]] und [[longevity-guidelines|longevity-guidelines.md]].

### `container-type: size`
*   **Kurzdefinition:** Eine CSS-Eigenschaft, die ein HTML-Element als Container deklariert, dessen Abmessungen (Breite und Höhe) isoliert überwacht werden, um relationale Abfragen für Kind-Elemente zu ermöglichen.
*   **Nutzen im Projekt:** Deklariert auf dem `<din-a4>`-Blatt, um proportionale CSS-Layoutberechnungen unabhängig von der Skalierung des übergeordneten Fensters durchzuführen.
*   **Verweis:** Siehe [[ADR-CSS#2-container-queries--proportionale-einheiten-cqw--cqh|ADR-CSS.md]] und [[din-5008-geometry|din-5008-geometry.md]].

### `cqw` / `cqh` (CSS Container Query Units)
*   **Kurzdefinition:** Proportionale CSS-Maßeinheiten, die sich auf genau 1 % der Breite (`cqw`) oder Höhe (`cqh`) des nächsten übergeordneten Containers beziehen.
*   **Nutzen im Projekt:** Alle Ränder, Abstände und Schriftgrößen des DIN-Briefs sind in `cqw` deklariert. Dadurch wächst und schrumpft das gesamte Layout pixelperfekt proportional mit, wenn das Blatt skaliert wird (Vektor-Skalierung).
*   **Veranschaulichung:**
    ```mermaid
    flowchart LR
        A["Blatt &lt;din-a4&gt;<br/>(container-type: size)"]
        A -->|1% Breite| B["1 cqw"]
        A -->|1% Höhe| C["1 cqh"]
        B -.->|Beispiel: 25mm Lochrand| D["11.905 cqw"]
        C -.->|Beispiel: 45mm Kopfhöhe| E["15.152 cqh"]
    ```
*   **Verweis:** Siehe [[ADR-CSS#2-container-queries--proportionale-einheiten-cqw--cqh|ADR-CSS.md]] und [[din-5008-geometry|din-5008-geometry.md]].

### `fetch()` API
*   **Kurzdefinition:** Die moderne, Promise-basierte JavaScript-Schnittstelle zum asynchronen Laden und Senden von Netzwerkressourcen.
*   **Nutzen im Projekt:** Führt die asynchronen Adresssuchen über Photon und Geoapify im Hintergrund aus und validiert den API-Key per Heartbeat.
*   **Verweis:** Siehe [[ADR-API#1-dual-provider-autocomplete-photon--geoapify|ADR-API.md]].

### `Geoapify API`
*   **Kurzdefinition:** Ein kommerzieller, hochperformanter Premium-Geocoding-Dienst zur Adress-Vervollständigung und Validierung.
*   **Nutzen im Projekt:** Dient als optionaler Premium-Adress-Provider in der Sidebar (erfordert Key, geschützt über Header-Security).
*   **Verweis:** Siehe [[ADR-API#1-dual-provider-autocomplete-photon--geoapify|ADR-API.md]] und [[ADR-FEATURE#4-automatisches-proximity-biasing|ADR-FEATURE.md]].

### `IMR 4.0` (Input Mapping Registry)
*   **Kurzdefinition:** Die zentrale Architektur-Registry, die eine bidirektionale Verbindung zwischen Custom HTML5 Elements und Daten-Objektstrukturen deklariert.
*   **Nutzen im Projekt:** Synchronisiert die `contenteditable`-Felder lautlos mit dem internen Zustand für das Auto-Saving im LocalStorage.
*   **Verweis:** Siehe [[ADR-HTML#1-imr-40-custom-elements-fur-geometrie-bereiche|ADR-HTML.md]] und [[ADR-JS#2-reglementierte-aufgabenbereiche-fur-javascript|ADR-JS.md]].

### `light-dark()`
*   **Kurzdefinition:** Eine native CSS-Funktion, die automatisch den ersten übergebenen Farbwert wählt, wenn Light Mode aktiv ist, und den zweiten Wert, wenn Dark Mode aktiv ist.
*   **Nutzen im Projekt:** Ermöglicht die komplett JS-freie, flüssige Echtzeit-Themeumschaltung aller UI-Elemente direkt im CSS.
*   **Verweis:** Siehe [[ADR-CSS#4-natives-lightdark-mode-theme-light-dark|ADR-CSS.md]] und [variables.css](../../website/css/variables.css).

### `localStorage` API
*   **Kurzdefinition:** Die stabilste und universellste Offline-Speicher-API im Browser zur persistenten Speicherung von Zeichenketten.
*   **Nutzen im Projekt:** Sichert Entwürfe, Einstellungen, API-Keys und Base64-Schriftarten lokal ab – **die einzige persistente API, die unter dem Doppelklick-Kontext `file:///` fehlerfrei funktioniert.**
*   **Verweis:** Siehe [[ADR-JS#2-reglementierte-aufgabenbereiche-fur-javascript|ADR-JS.md]] und [[ADR-ANTIPATTERN#3-komplexere-lokale-storage-apis-opfs-indexeddb-file-system-api|ADR-ANTIPATTERN.md]].

### `oklch()` Farbraum
*   **Kurzdefinition:** Ein zukunftsweisender, wahrnehmungsgleichmäßiger (perceptually uniform) CSS-Farbraum, basierend auf Helligkeit (L), Buntheit (C) und Farbton (H).
*   **Nutzen im Projekt:** Garantiert präzise Kontraststufen, fehlerfreie Grauabstufungen und ein absolut premium-artiges Dark-Paper-Theme ohne Farbverzerrungen.
*   **Verweis:** Siehe [[ADR-CSS#4-natives-lightdark-mode-theme-light-dark|ADR-CSS.md]] und [variables.css](../../website/css/variables.css).

### `Photon API`
*   **Kurzdefinition:** Ein komplett kostenfreier, OpenStreetMap-basierter Geocoding-Suchdienst (betrieben von Komoot).
*   **Nutzen im Projekt:** Dient als Standard-Adress-Provider in der Sidebar. Funktioniert keyless und ohne Kreditkartenregistrierung.
*   **Verweis:** Siehe [[ADR-API#1-dual-provider-autocomplete-photon--geoapify|ADR-API.md]].

### Popover API (`popover="manual"`)
*   **Kurzdefinition:** Der native HTML5-Standard zur Platzierung von Overlay-Elementen im globalen Top-Layer des Webbrowsers.
*   **Nutzen im Projekt:** Steuert die schwebende WhatsApp-Toolbar und die Popover-Toasts nativ auf Browserebene. Verhindert jegliche Z-Index-Kollisionen im CSS.
*   **Verweis:** Siehe [[ADR-HTML#2-native-html-popover-api--dialogs|ADR-HTML.md]] und [[ADR-FEATURE#1-whatsapp-style-selection-toolbar-popover|ADR-FEATURE.md]].

### Selection & Range API
*   **Kurzdefinition:** Native Browser-APIs zur präzisen Manipulation und Positionsberechnung von markierten Textbereichen im DOM-Baum.
*   **Nutzen im Projekt:** Platziert die Formatierungs-Toolbar pixelgenau über dem Cursor und formatiert Textbereiche (B, U, Blockquote) zukunftssicher ohne veraltete JavaScript-Befehle.
*   **Verweis:** Siehe [[ADR-JS#3-verbot-von-verarbeitetem-execcommand-fur-custom-formate|ADR-JS.md]].

### `Zippopotam`
*   **Kurzdefinition:** Eine extrem schlanke, freie und globale API zur Geocodierung und Validierung von Postleitzahlen.
*   **Nutzen im Projekt:** Löst 5-stellige deutsche PLZs im Empfängerfeld im Hintergrund auf, um den Ortsnamen automatisch hinzuzufügen.
*   **Verweis:** Siehe [[ADR-API#5-zippopotam-plz-auto-lookup|ADR-API.md]].


### Falzmarke / Faltmarke
Kleine Hilfslinien am linken Blattrand (oft 105 mm und 210 mm von oben bei Form B). Sie markieren die genauen Stellen, an denen das Blatt horizontal geknickt werden muss, damit die Adresse perfekt im Sichtfenster des Briefumschlags erscheint.

### Fensterumschlag / DL-Umschlag
Ein Standard-Briefumschlag (Format DIN lang / DL) mit einem transparenten Sichtfenster auf der linken Seite. Die DIN 5008 stellt sicher, dass das Anschriftfeld genau in diesem Fenster sichtbar ist.

### No-Scroll-Layout
Ein Web-Design-Konzept, bei dem die Anwendung (wie dieser Brief-Editor) immer exakt in den sichtbaren Viewport (100vh / 100vw) passt, ohne dass der Benutzer scrollen muss. Alle Bedienelemente sind stets sichtbar.

### Single Source of Truth (SSoT)
Ein Architekturprinzip. Ein bestimmter Wert (z.B. die Y-Position der Falzmarke) existiert nur an **einem einzigen, zentralen Ort** im Code (z.B. als CSS Custom Property `--fold-1-y`). Alle anderen Komponenten lesen diesen Wert nur aus. Es gibt keine redundanten Kopien des Wertes, was Fehler bei Updates verhindert.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/Guides/chrome-modern-css.md',
  'Guide: Modern CSS Features (Chrome 148+ Baseline)',
  'active',
  '# Modern CSS Features (Chrome 148+ Baseline)

Dieses Dokument listet die modernen CSS-Features auf, die im Projekt **DIN-Brief Neo** verwendet werden. Da die App eine strikte Chrome 148+ (Edge/Opera äquivalent) Engine voraussetzt, können wir auf Polyfills und Fallbacks verzichten und hochmoderne Web-Plattform-Features nativ nutzen.

## 1. Farbthemen & Design Tokens

### 1.1 `light-dark()` Funktion
Eine CSS-Funktion, die abhängig vom berechneten `color-scheme` des Elements entweder einen hellen oder dunklen Farbwert zurückgibt.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Wir nutzen dies intensiv für unseren nativen Dark Mode ohne JavaScript-Klassen-Toggling auf jedem Element.

### 1.2 `oklch()` Farbraum
Ein wahrnehmungsgerechter Farbraum, der konsistente Helligkeitsstufen (Lightness) und Sättigungen (Chroma) über alle Farbtöne (Hue) hinweg bietet.

> **Relevanz für DIN-BriefNEO:** **Mittel**. Wird vereinzelt für extrem präzise Schatten und sanfte Grauabstufungen in der Sidebar genutzt, um ein Premium-Gefühl zu erzeugen.

---

## 2. Layout & Responsiveness

### 2.1 `container-type: size` + Container-Einheiten (`cqw` / `cqh`)
Container Queries erlauben es, dass sich Elemente an der Größe ihres *Containers* anstatt des Viewports orientieren. `cqw` und `cqh` sind prozentuale Einheiten bezogen auf diesen Container.

> **Relevanz für DIN-BriefNEO:** **Extrem Hoch**. Das ist das Herzstück unseres No-Scroll-Layouts! Der Briefbogen (`<din-a4>`) skaliert sich dynamisch in den verfügbaren Platz. Alle DIN 5008 Abstände (wie Falzmarken) werden in `cqh` und `cqw` berechnet, damit das Blatt stufenlos zoombar ist, ohne dass die Maßstäbe brechen.

### 2.2 `field-sizing: content`
Erlaubt Input-Feldern und Textareas, ohne JavaScript-Hacks automatisch mit ihrem Inhalt mitzuwachsen.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Perfekt für kleine, editierbare Bereiche (wie den Betreff), bei denen wir kein `contenteditable` nutzen, aber trotzdem ein Auto-Grow-Verhalten brauchen.

---

## 3. Interaktion & UI

### 3.1 `:has()` Pseudo-Klasse
Der CSS-Parent-Selector. Erlaubt es, ein Elternelement basierend auf seinem Inhalt (Kinder) zu stylen.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Wird genutzt, um z.B. Warn-Rahmen um den Briefkern zu zeichnen, falls eines der inneren Kinder (wie der Text) einen Überlauf (`overflow`) erzeugt.

### 3.2 Popover API (`popover`)
Ein nativer Weg, um UI-Elemente über den Rest der Seite zu legen (Top-Layer), inklusive Light-Dismiss (Schließen durch Klick daneben) und ESC-Taste-Support, völlig ohne z-index-Kämpfe.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Wird für die schwebende "WhatsApp-Style" Formatierungsleiste (Fett, Kursiv) genutzt, die über dem Text auftaucht.

### 3.3 CSS Anchor Positioning
Ermöglicht das absolute Positionieren eines Elements (z.B. ein Tooltip) *relativ* zu einem anderen "Anker"-Element, ohne dass sie im DOM verschachtelt sein müssen.

> **Relevanz für DIN-BriefNEO:** **Niedrig (Aktuell)**. Zukünftig extrem spannend, um Dropdowns (wie bei der Adress-Autovervollständigung) präzise an ein `contenteditable`-Feld zu heften, ohne den Layout-Flow des DIN-Briefs zu stören.

---

## Feature-Stabilität & Prüfung

Da wir auf Engine-Version **Chrome 148+** (bzw. 149+) setzen, sind **alle oben genannten Features stabil verfügbar** und benötigen keine Prefix-Hacks oder Polyfills. Ein manueller Feature-Check per JavaScript (wie in alten Versionen dieses Dokuments) ist unnötig und entfernt worden, da wir eine harte Engine-Grenze als Vorbedingung für die Nutzung der Applikation definieren.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/Guides/din-5008-precise-layout-lessons.md',
  'DIN 5008 Layout Principles (Lessons Learned from LaTeX)',
  'active',
  '# DIN 5008 Layout Principles (Lessons Learned from LaTeX)

In der frühen Explorationsphase von DIN-Brief NEO haben wir das LaTeX-Paket `GerLaTeXLetter` tiefgehend analysiert. Während LaTeX für eine reine Web-Applikation (Vanilla JS, offline-first) ungeeignet ist, lieferte es entscheidende konzeptionelle Erkenntnisse ("Lessons Learned"), die direkt in unsere CSS-Architektur eingeflossen sind.

## 1. Absolute Koordinaten statt relativer Abstände
**Die LaTeX-Philosophie:** Ein LaTeX-Brief definiert das Layout nicht über relative Margins (z. B. "mach den Abstand nach oben etwas größer"), sondern über absolute Koordinaten auf einem A4-Gitter (z. B. `\setplength{toaddrvpos}{45mm}`).

**Unsere Übernahme ins Web:** 
Wir haben das Box-Model-Denken (Margins, Paddings, relative Prozentwerte) für das Seitenlayout verworfen. Stattdessen nutzen wir in `layout.css`:
- **CSS Custom Properties (Typed)**: `--pos-y-address: 45mm;`
- **Absolute Positionierung**: Alle semantischen Zonen (`<din-address-zone>`, `<din-infoblock>`) werden absolut innerhalb der `<din-page>` positioniert.
- Dadurch garantieren wir pixel- und millimetergenaue PDF-Ausgaben, die exakt in ein DIN-Fensterkuvert passen.

## 2. Strikte Trennung von Form A und Form B
**Die LaTeX-Philosophie:** LaTeX-Klassen bieten harte Schalter für Form A (hoher Briefkopf) und Form B (niedriger Briefkopf), wodurch sich das gesamte Y-Koordinatensystem verschiebt.

**Unsere Übernahme ins Web:**
Wir spiegeln diese Binärlogik über CSS-Variablen-Scopes. Ein simpler Toggle auf dem Root-Element (`<html data-form="A">`) überschreibt die Y-Koordinaten der Variablen. Kein JavaScript muss die Zonen berechnen; das CSS-Grid adaptiert sich nahtlos.

## 3. Falz- und Lochmarken (Fold & Punch Marks)
**Die LaTeX-Philosophie:** Millimetergenaue Linien am linken Blattrand, um das Lochen und Falten für Kuverts zu erleichtern.

**Unsere Übernahme ins Web:**
Wir zeichnen diese Marken rein mit CSS (`::before` und `::after` Pseudo-Elementen) an fixen Y-Koordinaten (z.B. 87mm, 105mm, 148.5mm, 192mm, 210mm). Diese Marken sind im `print`-Stylesheet deaktivierbar, falls der Nutzer Blanko-Briefpapier verwendet.

## 4. Semantische Datenstruktur
**Die LaTeX-Philosophie:** Trennung von Daten (`\setkomavar{fromname}{Max Mustermann}`) und Repräsentation (dem finalen Layout).

**Unsere Übernahme ins Web:**
- Wir verwenden semantische Custom Elements (`<din-sender>`, `<din-recipient>`).
- Wir trennen visuelle Struktur (CSS) strikt von den Inhalten. 

---

**Fazit:** LaTeX hat uns gelehrt, dass man für Briefe nicht in *Fließtext-Dokumenten*, sondern in *technischen Zeichnungen* denken muss. DIN-Brief NEO ist im Kern keine Textverarbeitung, sondern eine technische Zeichnung (Gitter) auf einem A4-Canvas, implementiert mit modernsten Web-Standards.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/Guides/din-5008-precise-layout-lessons.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/Guides/din-5008-precise-layout-lessons.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/Guides/din-5008-precise-layout-lessons.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/Guides/din-5008-precise-layout-lessons.md'), 'rules');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/Guides/din-5008-precise-layout-lessons.md'), 'layout');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/Guides/geoapify-autocomplete.md',
  'Guide: Geoapify Autocomplete Implementierung',
  'active',
  '# Guide: Geoapify Autocomplete Implementierung

> [!tip] Was ist dieser Guide?
> Dieser Guide beschreibt, wie wir die Geoapify Autocomplete API in DIN-Brief Neo einsetzen, **ohne** externe Bibliotheken (wie `@geoapify/geocoder-autocomplete`) zu laden, um strikt WYSIWYG und Zero-Dependencies zu wahren.

## 1. Einleitung & Zielsetzung

Um die Empfängeradresse im DIN-Brief autovervollständigen zu können, nutzen wir die REST API von Geoapify. Ein externes Brainstorming hat aufgezeigt, dass Debouncing, Limitierungen und "Proximity Biasing" (Bevorzugen von lokalen Adressen) extrem wichtig für Performance und User Experience sind.

## 2. Best Practices der Implementierung

Wir haben die folgenden Best Practices direkt in unserem Custom Fetch-Wrapper in `main.js` umgesetzt:

- **Regel 1: Debouncing (300ms)**
  - Wir senden nicht bei jedem Tastendruck einen Request. Stattdessen warten wir 300ms, bis der Nutzer aufhört zu tippen. Das schont das API-Limit massiv.
- **Regel 2: Strikte Limits (`limit=5`)**
  - Wir rufen maximal 5 Ergebnisse ab. Ein zu langes Dropdown bricht das Layout und verschlechtert die Performance.
- **Regel 3: Dynamischer Proximity Bias**
  - Statt hartcodierten Koordinaten (z. B. Bonn) lesen wir dynamisch die PLZ des **Absenders** aus. Die API liefert dann zuerst Ergebnisse in der Nähe des Absenders.

### Code-Beispiele (Custom Fetch vs. Library)

Nutze Diff-Blöcke (`diff`), um zu veranschaulichen, warum wir die offizielle Library meiden:

```diff
- import { GeocoderAutocomplete } from ''@geoapify/geocoder-autocomplete'';
- const autocomplete = new GeocoderAutocomplete(container, ''API_KEY'');
+ // Neuer Zero-JS/WYSIWYG Ansatz via native fetch()
+ let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&lang=de&limit=5`;
+ if (coords) url += `&bias=proximity:${coords.lon},${coords.lat}`;
+ const res = await fetch(url, { headers: { "X-Api-Key": key } });
```

### Syntax Highlighting: Das Caching

Langfristig kann (wie im Brainstorming vorgeschlagen) ein In-Memory-Cache implementiert werden, um doppelte Abfragen (z.B. wenn der User Rücktaste drückt) abzufangen:

```javascript
// Geplantes In-Memory-Cache (zukünftige Optimierung)
const geoCache = new Map();

async function cachedGeoFetch(query, coords) {
  const cacheKey = query + (coords ? coords.lat : '''');
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey);
  
  // fetch...
  geoCache.set(cacheKey, data);
  return data;
}
```

## 3. Komplexere Zusammenhänge

<details>
<summary>Deep Dive: Woher kommen die Bias-Koordinaten? (Klicken)</summary>
Die Geoapify API erfordert für das `bias=proximity` Argument Breiten- und Längengrade (Latitude/Longitude). Da der Nutzer in einem DIN-Brief oft seinen eigenen Wohnort eingibt (z.B. "53111 Bonn"), haben wir einen separaten Hook eingebaut: Sobald der Nutzer seine PLZ im Absenderfeld tippt, fragen wir im Hintergrund die freie API `zippopotam.us` ab. Diese liefert uns die Lat/Lon-Koordinaten der Absender-PLZ zurück. Diese Koordinaten speichern wir im `localStorage` (`din_sender_coords`) und hängen sie als dynamischen Bias an jeden Geoapify-Request an. Das führt dazu, dass jemand aus Hamburg primär Hamburger Adressen vorgeschlagen bekommt.
</details>

## 4. Feature Checks

Da wir auf nativem `fetch` und modernem ES6 basieren:

```javascript feature-check
// f("Geoapify Native Fetch", typeof globalThis.fetch === "function", "Chrome 42", "Produktiv")
```


## 3. Fehlerbehandlung & Fallback-Strategie
Da externe APIs ausfallen können (Rate Limits, Offline-Szenarien, API-Downtime), muss die Fehlerbehandlung robust sein.
Schlägt der Request an Geoapify fehl, werfen wir keinen UI-blockierenden Fehler, sondern fangen diesen ab und wechseln – sofern konfiguriert – sofort auf den kostenlosen Photon Fallback-Provider, oder stoppen die Autocomplete-Vorschläge einfach leise (Graceful Degradation).

## 4. Rate Limiting & Performance
Die Geoapify API hat in der kostenlosen Stufe strikte Limits (z.B. 3.000 Requests pro Tag).
Das strenge Debouncing (300-500ms) und ein geplantes, lokales **Caching** von Suchbegriffen (aktuell noch in Planung / noch nicht implementiert) sind unsere primären Abwehrwerkzeuge gegen das Limit.

## 5. Datenschutz (Privacy)
Geoapify erhält den gesuchten Adressstring sowie die berechneten GPS-Koordinaten (für das Proximity Biasing).
**WICHTIG:** Es werden **keine** persönlichen Absenderdaten, Namen oder Briefinhalte an den Dienst übertragen.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/Guides/GUIDE-TEMPLATE.md',
  'Guide: [Thema des Guides]',
  'draft | active | deprecated',
  '# Guide: [Titel]

> [!tip] Was ist dieser Guide?
> Kurze Erklärung, warum dieser Guide existiert und für wen er gedacht ist.  
> Im Gegensatz zu einem ADR dokumentiert ein Guide *wie* etwas umgesetzt wird (Best Practices, Techniken, Workflows).

## 1. Einleitung & Zielsetzung

Kurze Einleitung:
- Was ist das Ziel dieses Guides?
- Welches Problem löst er?
- Welche Annahmen gibt es?

## 2. Best Practices & Regeln

Hier kommen die konkreten Richtlinien. Nutze Checklisten oder nummerierte Listen:

- **Regel 1**: ...
  - [x] Wird bereits umgesetzt
  - [ ] Noch ausstehend
- **Regel 2**: ...

### Vorher / Nachher Beispiele

Nutze `diff` Blöcke, wenn es um Code-Verbesserungen geht:

```diff
- // Alter Ansatz
- element.style.top = calculatedTop + ''px'';

+ // Neuer deklarativer Ansatz
+ element.style.positionAnchor = ''--selection-anchor'';
```

## 3. Komplexere Zusammenhänge

Falls ein Thema tiefergehend erklärt werden muss:

<details>
<summary>Deep Dive: [Thema] (Klicken zum Ausklappen)</summary>

Hier können längere Erklärungen, Diagramme oder Hintergrundwissen stehen.

</details>

## 4. Feature Checks (falls relevant)

Falls dieser Guide moderne Web-APIs voraussetzt oder erklärt:

```javascript feature-check
// f("Feature Name", typeof globalThis.Feature !== "undefined", "Chrome XXX", "Produktiv")
```

## 5. Verwandte Dokumente

- [[longevity-guidelines]]
- [[ADR-XXX]]
- [[glossary]]

---

## Hinweise zur Nutzung dieses Templates

- **Frontmatter ist verpflichtend**
- Der Guide soll **praktisch** und **umsetzbar** sein (keine reinen Theorie-Texte)
- Nutze `diff`-Blöcke und `<details>` für bessere Lesbarkeit
- Halte den Guide möglichst **kurz und fokussiert** (max. 1–2 Bildschirmseiten ideal)
- Verlinke stark auf ADRs und andere Guides statt Inhalte zu duplizieren',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/Guides/no-scroll-techniques.md',
  'Guide: Technischer Guide: No-Scroll-Techniken (Viewport-Perfect Layouts)',
  'active',
  '# Technischer Guide: No-Scroll-Techniken (Viewport-Perfect Layouts)

> [!important] Viewport-Perfect Layouts
> Dieses Dokument beschreibt die Design- und Implementierungsmuster, um ein ausnahmsloses Scroll-Verbot in der Anwendung durchzusetzen. Das Ziel ist eine Anwendung, die sich perfekt und elastisch in die Grenzen des Viewports einpasst.

---

## 1. Das globale Sicherheitsnetz
Um jegliches versehentliche Scrollen im Keim zu ersticken, erhält die oberste Ebene des HTML-Dokuments eine absolute Sperre:

```css
/* css/reset.css */
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100dvh; /* Dynamische Viewport-Höhe (beachtet mobile Adressleisten) */
  overflow: hidden; /* Scrollbalken auf Top-Level verbieten (interne Container wie Sidebar dürfen scrollen) */
  /* user-select: none hier entfernt, da es global problematisch für Barrierefreiheit ist. Wird nur lokal auf UI-Elemente wie Toolbar angewendet. */
}
```

---

## 2. Die Flexbox- & Grid-Kaskade
Die Benutzeroberfläche wird mit einem App-Shell-Layout strukturiert. Alle Container müssen die Höhe ihrer Eltern-Elemente erben und dürfen diese niemals überschreiten.

```css
#app-shell {
  display: grid;
  grid-template-columns: 280px 1fr; /* Feste Sidebar-Breite + flexibler Briefbereich */
  width: 100%;
  height: 100%;
}
```

### Die Sidebar (Links)
Die Sidebar erhält eine eigene Höhenbegrenzung. Wenn Steuerelemente den Platz überschreiten, muss ein elastischer Scrollbereich *nur* für diese Kontrollgruppe eingerichtet werden, wobei der äußere Scrollbalken ausgeblendet wird:

```css
aside {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  background-color: var(--sidebar-bg);
}

#sidebar-scroll-area {
  flex: 1;
  overflow-y: auto; /* Erlaubt internes Scrollen nur bei extrem kleinen Screens */
  scrollbar-width: none; /* Firefox: Scrollbalken ausblenden */
}

#sidebar-scroll-area::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Edge: Scrollbalken ausblenden */
}
```

---

## 3. Der Brief-Viewport (Rechts)
Der Briefbereich (Paper Viewport) muss das Briefblatt (A4) elegant skalieren, anstatt zu scrollen. 

### Skalierung statt Scrollen (Dynamic Zooming)
Anstatt das A4-Blatt (210mm x 297mm) auf kleineren Bildschirmen überstehen zu lassen, nutzen wir CSS-Skalierung, damit es immer komplett sichtbar bleibt:

```css
#paper-viewport {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--viewport-bg);
}

din-a4 {
  height: 94vh; /* Passt sich perfekt dem Viewport an */
  aspect-ratio: 210 / 297; /* Exaktes DIN A4 Seitenverhältnis */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background: white;
  container-type: size; /* Ermöglicht proportionale cqw/cqh Maße */
}
```

---

## 4. Auto-Resizing ohne Scroll-Auslöser
Wenn Text in ein Feld eingegeben wird, darf sich dieses nicht vergrößern und das Layout sprengen.

### Das `field-sizing` Wunder
Wir nutzen `field-sizing: content` auf unseren Texteingaben. Dies passt die Größe des Elements automatisch an den Inhalt an, verhindert aber in Verbindung mit `max-height` ein unbegrenztes Wachstum:

```css
din-text, [contenteditable] {
  field-sizing: content;
  max-height: 150mm; /* Maximale Texthöhe auf dem Blatt */
  overflow: hidden; /* Scrollbalken innerhalb der Textelemente unterbinden */
  outline: none;
}
```

---

## 5. Defensive CSS-Techniken zur Vermeidung von Layout-Sprengungen
- **Nutze `box-sizing: border-box`:** Jedes Element im Projekt muss diese Eigenschaft besitzen, damit Padding und Border die Gesamtbreite/-höhe nicht erhöhen.
- **Vermeide absolute Pixelwerte bei Höhen:** Nutze relative Einheiten wie `rem`, `%`, `vh` oder `dvh` für Layout-Skelette.
- **Umgang mit langen Wörtern:** Verwende `word-break: break-word` und `hyphens: auto`, um horizontalen Textüberlauf zu verhindern.


## 4. Verhalten bei sehr kleinen Viewports (< 700px)
Da wir ein hartes `min-height: 800px` und proportionale Skalierung erzwingen, würde das Dokument auf extrem kleinen Smartphones zwangsläufig aus dem Bildbereich ragen.
Hier greift eine Medienabfrage, die entweder das No-Scroll-Konzept aufweicht (Scrollen erlauben) oder einen klaren Hinweis zeigt, dass die Desktop-Ansicht erforderlich ist.

## 5. Warnung zu `field-sizing: content`
Während `field-sizing` ein exzellentes CSS-Feature für Auto-Grow Inputs ist, funktioniert es in einigen Engines noch nicht absolut fehlerfrei oder verzögert. Als Fallback oder Alternative für sehr komplexe Felder kann ein `ResizeObserver` oder ein Set aus `min-height` und `max-height` herangezogen werden.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/Guides/toast-system.md',
  'Guide: Toast Notifications System',
  'active',
  '# Guide: Using the Next-Level Toast System

The Toast system is a decoupled, highly advanced UI module located at `js/toast.js`. It leverages modern native W3C specifications (Popover API, Discrete Transitions, ARIA-Live Regions) to provide accessible and smooth notifications.

## Basic Usage

To show a simple notification, import the `showToast` function and pass your message:

```javascript
import { showToast } from ''./toast.js'';

// Info (Default)
showToast(''Dies ist eine Info'');

// Success
showToast(''Speichern erfolgreich!'', ''success'');

// Warning
showToast(''Verbindung langsam...'', ''warning'');

// Error
showToast(''API Key abgelaufen!'', ''error'');
```

The system will automatically calculate the display duration based on the text length (up to a maximum of 5 seconds) and handle deduplication for you.

## Advanced Features

### 1. Actionable Toasts (Buttons)
You can attach an interactive button to the Toast by passing an `action` object in the options parameter:

```javascript
showToast(''Entwurf gelöscht.'', ''warning'', {
  action: {
    label: ''Rückgängig'',
    callback: () => {
      console.log(''Rückgängig ausgeführt!'');
      // ... restore logic ...
    }
  }
});
```

### 2. Sticky Toasts & Updatable Progress
For background tasks (like PDF generation or bulk sending), you can make a Toast "sticky" so it never automatically disappears. You can then update its content via `updateToast`.

```javascript
import { showToast, updateToast } from ''./toast.js'';

const taskId = ''pdf-gen-123'';

// Start a sticky toast
showToast(''Generiere 500 PDFs... [░░░░░░] 0%'', ''info'', {
  sticky: true,
  id: taskId
});

// Later, update it as progress continues
setTimeout(() => {
  updateToast(taskId, ''Generiere 500 PDFs... [████░░] 60%'', ''info'');
}, 2000);

// Finally, convert it to a success message and let it close naturally or keep it sticky
setTimeout(() => {
  // If you call showToast with the exact same message, it increments the badge.
  // To replace a sticky toast completely with an auto-closing one, you could close it and spawn a new one,
  // or just update it manually. Currently, updateToast just updates the DOM.
  updateToast(taskId, ''✅ 500 PDFs fertig!'', ''success'');
}, 4000);
```

### 3. Built-in User Interactions
You do not need to code anything for these features, they are built-in:
- **Swipe-to-Dismiss**: Users can mouse-drag or touch-swipe the toast to the right to throw it off the screen.
- **Hover-to-Pause**: Hovering the mouse over the toast stops the timeout countdown.
- **Counter Badges (x2, x3)**: Triggering the exact same message while it is already visible will shake the toast and increment a small counter badge, preventing visual spam.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/implementation/sqlite-vec.md',
  'Phase 1: sqlite-vec Integration – Detaillierte Umsetzungsanleitung',
  'active',
  '# Phase 1: sqlite-vec Integration – Detaillierte Umsetzungsanleitung

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

Finde den Abschnitt wo Tabellen gedroppt und neu erstellt werden (ca. nach `console.log(''Compiling documentation database...'');`).

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
  embedding_model TEXT DEFAULT ''all-MiniLM-L6-v2'',  -- NEU: Modell-Info
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
const crypto = require(''crypto'');

function computeContentHash(content) {
  return crypto.createHash(''sha256'').update(content, ''utf8'').digest(''hex'');
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
  ''${escapeSql(doc.path)}'',
  ''${escapeSql(doc.title)}'',
  ''${escapeSql(doc.status)}'',
  ''${escapeSql(doc.content)}'',
  ''${contentHash}'',
  ?,  -- BLOB für Embedding (später binden)
  ''all-MiniLM-L6-v2'',
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
const Database = require(''node:sqlite'').DatabaseSync;  // Bestehender Import anpassen falls nötig

// Extension laden (Node 22+ unterstützt loadExtension in vielen Builds)
const db = new Database('':memory:'');  // Oder die finale DB
try {
  db.loadExtension(''./vec0'');  // Pfad anpassen, z.B. ''extensions/vec0'' oder absoluter Pfad
  console.log(''sqlite-vec Extension erfolgreich geladen.'');
} catch (err) {
  console.warn(''Warnung: sqlite-vec Extension konnte nicht geladen werden. Vektor-Suche deaktiviert für diesen Build.'');
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
  // const { pipeline } = await import(''@xenova/transformers'');
  // const extractor = await pipeline(''feature-extraction'', ''Xenova/all-MiniLM-L6-v2'');
  // const output = await extractor(text, { pooling: ''mean'', normalize: true });
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
const Database = require(''node:sqlite'').DatabaseSync;

function hybridSearch(dbPath, queryText, limit = 10) {
  const db = new Database(dbPath);

  // Lade Extension falls nötig (wie in build)
  try { db.loadExtension(''./vec0''); } catch (e) {}

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
SELECT * FROM hybrid_search(''dein suchbegriff'', 5);
```

---

## Arbeitspaket 5: Reconciliation-Erweiterung (Priorität 5, klein)

**Ziel:** Neuen Check: "Alle Dokumente haben aktuelle Embeddings?"

**In `tools/reconciliation.js` (im FEATURE_CHECKS oder neuen Check):**

```js
// Erweitere den Report
const embeddingCheck = {
  name: ''Embeddings present and up-to-date'',
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
const { hybridSearch } = require(''./tools/hybrid_search'');
const results = hybridSearch(''DIN-Brief_docs.db'', ''Faltmarken und DIN 5008'', 5);
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

Phase 1 ist machbar in 1–3 Sitzungen, wenn wir fokussiert bleiben.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/implementation/sqlite-vec.md'), 'phase1');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/implementation/sqlite-vec.md'), 'sqlite-vec');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/implementation/sqlite-vec.md'), 'hybrid-search');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/implementation/sqlite-vec.md'), 'embedding');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/implementation/sqlite-vec.md'), 'build');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/implementation/sqlite-vec.md'), 'generalisierbarkeit');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/implementation/sqlite-vec.md'), 'tools');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/README.md',
  '20-implementation README',
  'active',
  '# 20 Implementation
Praktische Anleitungen und How-Tos.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/README.md'), 'readme');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/20-implementation/README.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/Salutation-Engine.md',
  'Salutation & Logic Engine Matrix (IMR 4.0 Standard)',
  'active',
  '# Salutation & Logic Engine Matrix (IMR 4.0 Standard)

> [!NOTE]
> Die Salutation Engine ist vollständig von der UI entkoppelt (ADR-017). Änderungen in `salutation.js` haben keinen Einfluss auf das visuelle Rendering.

> [!TIP]
> Für neue Anrede-Formate: Erweitere einfach die `TITLES`-Liste in `salutation.js` – die Engine priorisiert automatisch längere Titel.

Diese Matrix definiert die Architektur der Geschäftslogik für DIN-BriefNEO.  
Sie folgt dem **Flat & Pure Architecture [ADR-017]** Prinzip: Klare Trennung zwischen Datenverarbeitung (Engine) und Darstellung (UI-Bridge).

---

## 📌 Quick Links

| Bereich | Link |
|---------|------|
| 📖 **Dokumentation** | [Wiki](https://github.com/din-briefneo/salutation-engine/wiki) |
| 🐛 **Issues** | [Issues](https://github.com/din-briefneo/salutation-engine/issues) |
| 🔄 **CI/CD** | [Actions](https://github.com/din-briefneo/salutation-engine/actions) |
| 📊 **Test Coverage** | [Coverage Report](https://din-briefneo.github.io/salutation-engine/coverage/) |
| 📦 **npm Package** | [npm](https://www.npmjs.com/package/@din-briefneo/salutation-engine) |

---

## 🚦 Status Badges

![Version](https://img.shields.io/badge/version-10.0.0--platinum-blue)
![Build](https://img.shields.io/github/actions/workflow/status/din-briefneo/salutation-engine/ci.yml?branch=main)
![Coverage](https://img.shields.io/codecov/c/github/din-briefneo/salutation-engine)
![License](https://img.shields.io/github/license/din-briefneo/salutation-engine)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## 🧠 Engine Architecture (The Core Three)


| Modul | Rolle | Fokus-Technologie | Strategischer Vorteil |
|-------|-------|-------------------|----------------------|
| **`engine.js`** | Der Verwalter | `Proxy` State + `localStorage` / `OPFS` | Reaktive SSoT mit Zero-Setup-Persistenz |
| **`logic.js`** | Der Handwerker | `Temporal` API + `Sanitizer` API | Robuste Date-Arithmetik und sicheres Markdown |
| **`salutation.js`** | Der Etikette-Experte | Pattern Matching & Sorting | Intelligente Anreden mit automatischer Titel-Priorisierung |

---

## 📋 Logik- & Validierungs-Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Markdown** | Zero-Width Ghosting Pattern | `logic.js` | Erhält Markdown-Marker für Editierbarkeit ohne Layout-Shift |
| **Zeit/Datum** | `Temporal.Now.plainDateISO()` | `logic.js` | Eliminiert Legacy `Date()`-Bugs bei Zeitzonen |
| **Adress-Check** | 6-Zeilen-Validierung | `logic.js` | DIN 5008: max. 6 Zeilen im Anschriftfeld |
| **IBAN-Check** | Modulo-97 (`BigInt`) | `logic.js` | Mathematisch korrekte Prüfziffernvalidierung |
| **Rücksendung** | Interpunktion-Generator | `logic.js` | DIN 5008: Einzeilige Rücksendezeile mit Mittelpunkten |

---

## 🎩 Salutation & Etiquette Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Titel-Scan** | Greedy Regex Matching (priorisiert Länge) | `salutation.js` | Erkennt "Prof. Dr." vor "Dr." – robust gegen Mehrfach-Titel |
| **Auto-Erkennung** | Personentyp-Erkennung (Herr/Frau/Ms/Mr) | `salutation.js` | Automatische Auswahl der passenden Anrede-Logik |
| **Anrede-Stil** | 3‑stufiger Formality‑Switch | `salutation.js` | Formal / Modern (Guten Tag) / Locker (Hallo) |
| **Ghost-Text Anrede** | `data-salutation` Attribut-Bridge | `salutation.js` | Vorschläge via CSS `:empty::before` (Platinum v4.8) |
| **Grußformel** | Smart‑Default Generator | `salutation.js` | Passende Abschlüsse (Beste Grüße vs. Mit freundlichen Grüßen) |
| **Ghost-Text Gruß** | `data-greeting` Attribut-Bridge | `salutation.js` | Vorschläge via CSS `:empty::before` (Platinum v4.8) |
| **Firmen-Fall** | Co‑Presence Detection | `salutation.js` | Erkennt "Firma ohne Person" → neutrale Anrede |
| **DIN-Fehler** | Punctuation Validator | `salutation.js` | DIN 5008: Warnt bei Komma/Punkt nach Grußformel |

---

## 🔗 Dokumenten-Navigation

| Issue | Dokument | Zweck |
|-------|----------|-------|
| [#1](https://github.com/grapefruit89/DIN-BriefNEO/issues/1) | IMR 4.0 Registry | Alle 45+ DIN-Tags |
| [#2](https://github.com/grapefruit89/DIN-BriefNEO/issues/2) | Architecture Compliance | Technologie-Leitplanken |
| [#3](https://github.com/grapefruit89/DIN-BriefNEO/issues/3) | Feature Matrix | Projekt-Fortschritt |
| [#4](https://github.com/grapefruit89/DIN-BriefNEO/issues/4) | Salutation Engine | Logik-Dokumentation |
| [#5](https://github.com/grapefruit89/DIN-BriefNEO/issues/5) | CSS Glossar | CSS-Features Referenz |

**Gesamtversion:** 10.0 | **Letzte Sync:** 2026-04-01

---

## 🔗 Verwandte Dokumente (Dataview)

```dataview
TABLE 
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
```

**Status:** ACTIVE  
**Nächste Überprüfung:** 2026-06-30  
**Verantwortlich:** Lead Logic Developer',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/20-implementation/testing-guide.md',
  'Guide: Interaktiver Test-Leitfaden: testing-guide.md',
  'active',
  '# Interaktiver Test-Leitfaden: testing-guide.md

> [!info] Testing Guide
> Dieser Testing-Guide beschreibt alle manuellen Testfälle, um die Refactored Baseline-Features von **DIN-BriefNEO** systematisch und reproduzierbar auf Fehler zu überprüfen.

---

## 🧪 Manuelle Testfälle (QA-Protokoll)

### 1. Textverarbeitung & Formatierung

#### Testfall 1: Plaintext-Paste-Filter
*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist leer oder befüllt.
*   **Aktion:** Einen formatierten Text kopieren und einfügen.
*   **Erwartetes Ergebnis:** Bedingungslose Befreiung von Formatierungen, Farben, fremden Schriften und Links. Reiner Plaintext.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 2: Plaintext-Drag-and-Drop-Filter
*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist aktiv.
*   **Aktion:** Formatierten Text via Drag-and-Drop in das Feld ziehen.
*   **Erwartetes Ergebnis:** Reiner Text, alle Format-Reste rückstandslos entfernt.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 3: WhatsApp-Style Selection Popover Toolbar
*   **Ausgangssituation:** Der Brieftext enthält Text.
*   **Aktion:** Text markieren. Auf B (Fett) oder U (Unterstrichen) klicken. Erneut markieren.
*   **Erwartetes Ergebnis:** Toolbar schwebt im Top-Layer. Buttons leuchten auf bei aktivem Status.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 4: Blockquote-Toggling (Range API Unwrap)
*   **Ausgangssituation:** Ein Absatz im Brieftext ist markiert.
*   **Aktion:** Zitat-Symbol klicken. Erneut klicken.
*   **Erwartetes Ergebnis:** Zitat wird zum `<blockquote>`. Beim zweiten Klick wird der `<blockquote>`-Tag sicher entfernt, der Text bleibt als normaler Fließtext erhalten (Unwrap ohne Textverdopplung).
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 13: Keyboard-only Bedienung der Toolbar
*   **Ausgangssituation:** Der Brieftext ist aktiv.
*   **Aktion:** Text mit Umschalt+Pfeiltasten markieren, Toolbar muss per Tabulator/Tastatur-Shortcuts nutzbar sein.
*   **Erwartetes Ergebnis:** Barrierefreie Nutzung ohne Maus möglich.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

---

### 2. Layout & Interaktion

#### Testfall 5: Toast-Notification Queue (Stacking-Schutz)
*   **Aktion:** 5- bis 10-mal sehr schnell auf Sidebar-Buttons klicken.
*   **Erwartetes Ergebnis:** Kein hässliches Übereinanderstapeln. Meldungen erscheinen sauber nacheinander.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 10: A4-Überlaufwarnung **[Prio 1]**
*   **Aktion:** Viel Text einfügen, bis das Seitenende berührt wird.
*   **Erwartetes Ergebnis:** Gestrichelter roter Rahmen, Warn-Badge, Toast-Meldung.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 11: Sehr langer Betreff (Überlauf) **[Prio 1]**
*   **Aktion:** Betreff über 2 Zeilen füllen und Enter drücken.
*   **Erwartetes Ergebnis:** Blockiert Eingabe, roter Warnrahmen bei Zeile 3.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 14: Form A vs Form B Wechsel mit Inhalt
*   **Aktion:** Brief füllen, dann in Sidebar Form wechseln.
*   **Erwartetes Ergebnis:** Inhalt bleibt exakt erhalten, Positionen (Falzmarken, Fenster) wechseln nahtlos per CSS-Variable.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

---

### 3. Schriften & APIs

#### Testfall 6: Schriftarten-Wechsel (System Stacks)
*   **Aktion:** Zwischen Sans, Serif, Mono wechseln.
*   **Erwartetes Ergebnis:** Schriftart des gesamten Briefs ändert sich synchron.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 7: WOFF2-Uploader
*   **Aktion:** Lokale Schrift hochladen, F5 drücken.
*   **Erwartetes Ergebnis:** Schrift wird sofort angewendet und überlebt einen Reload via Base64 LocalStorage.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 8: Dual-Provider Adress-Autocomplete **[Prio 1]**
*   **Aktion:** API testen, Keys eintragen.
*   **Erwartetes Ergebnis:** Wechsel funktioniert, fehlender Key blockiert Suche sauber.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 9: PLZ-Proximity-Biasing & Zippopotam
*   **Aktion:** Absender-PLZ eintragen und dann Empfänger suchen.
*   **Erwartetes Ergebnis:** Lokale Adressen werden präferiert; Zippopotam löst PLZ korrekt auf.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 12: Sonderzeichen in Adresse
*   **Aktion:** Adresse mit Umlauten (ä,ö,ü) und "ß" in die Suche eingeben.
*   **Erwartetes Ergebnis:** Adress-API verarbeitet und rendert Sonderzeichen korrekt im DOM ohne Encoding-Fehler.
*   **Status:**
    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/Architecture-Evolution.md',
  'Architecture Evolution (Why we built it this way)',
  'active',
  '# Architecture Evolution (Why we built it this way)

Dieses Dokument fasst die wichtigsten architektonischen Lektionen aus alten KI-Reviews (Claude, GPT, Grok) zusammen und erklärt, **warum** DIN-Brief NEO so radikal auf native Web-Standards und Verzicht setzt. 

Es soll neuen Agenten (und Entwicklern) helfen, die Gründe hinter dem strengen Regelwerk in der `AGENTS.md` und dem `Immutable Law Catalog` zu verstehen.

---

## 1. Warum kein React, Vue oder Svelte?
**Die Ausgangslage:** Moderne Frontend-Entwicklung nutzt fast ausschließlich reaktive Frameworks, da sie State-Management und Komponenten-Architekturen vereinfachen.
**Das Problem:**
- **Kurzlebigkeit:** Framework-APIs (z.B. React Hooks vs. Class Components) ändern sich alle paar Jahre.
- **Abhängigkeiten:** Tausende npm-Pakete werden benötigt. Eines veraltet, und das Projekt bricht beim Build.
- **Komplexität beim Drucken:** Virtuelle DOMs (VDOM) machen es extrem schwer, die Millimeter-Präzision für den Druck (PDF via Browser) zu kontrollieren, da der echte DOM asynchron aktualisiert wird.
**Die Lösung:** Wir nutzen **Vanilla JS + Web Components** (Custom Elements). Die nativen Schnittstellen des Browsers bleiben stabil (Rückwärtskompatibilität des Webs).

## 2. Warum LocalStorage statt OPFS (Origin Private File System)?
**Die Ausgangslage:** Das OPFS gilt als die moderne, performante Lösung für Dateioperationen im Browser.
**Das Problem:** 
- OPFS ist stark an **Origin-Sicherheitskonzepte (CORS/HTTPS)** gebunden. 
- Da das oberste Ziel von DIN-Brief NEO ist, **100% offline aus dem `file:///` Protokoll** heraus ausführbar zu sein (für maximale Privatsphäre und Dauerhaftigkeit), schlagen OPFS-Aufrufe ohne lokalen Webserver oft fehl oder werfen Security Errors.
**Die Lösung:** `localStorage` funktioniert selbst beim Doppelklick auf die `.html` Datei auf der lokalen Festplatte. Es ist synchron, überall unterstützt und völlig ausreichend für Textdokumente.

## 3. Warum wir so streng geworden sind (Der "Immutable Law Catalog")
**Die Ausgangslage:** In frühen Versionen (v4.8 und früher) durften LLMs relativ frei entscheiden, wie sie Features implementieren. 
**Das Problem:** 
- Jeder Agent brachte seine eigenen Präferenzen mit (Agent A nutzte `innerHTML`, Agent B nutzte externe CDNs für Icons, Agent C fügte ein Build-Tool hinzu). 
- Das Projekt verlor seine Kernidentität und die "Zero-Dependency" Regel wurde schleichend gebrochen.
**Die Lösung:** Die Einführung eines extrem strengen, nicht verhandelbaren Regelwerks (der Immutable Law Catalog) und der **Evolutionary Fitness Score**. Agenten werden programmatisch gezwungen (`.\start.ps1`), sich an die Vanilla-JS und Privacy-First-Regeln zu halten. 

## 4. Warum kein Tailwind CSS?
**Die Ausgangslage:** Tailwind ist Branchenstandard für schnelles Styling.
**Das Problem:**
- Tailwind erfordert einen Build-Step (PostCSS), um nicht gebrauchte Klassen herauszufiltern.
- Die Klassen überschwemmen den DOM, was spätere DOM-Auswertungen (z.B. durch LLMs oder für PDF-Generierung) erschwert.
**Die Lösung:** Native CSS-Features sind mächtig genug. Mit **CSS `@layer`** für Kapselung, **Container Queries (`@container`)** für relative Skalierung auf dem A4-Blatt und **CSS Variables (`--var`)** bauen wir ein sauberes, rein semantisches Layout ohne Build-Tool.

---

**Fazit:** DIN-Brief NEO opfert Entwickler-Bequemlichkeiten (Frameworks, npm) zugunsten von radikaler Überlebensfähigkeit, Datenschutz und minimaler Angriffsfläche. Jede Code-Zeile soll auch in 10 Jahren noch exakt so im Browser funktionieren.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/Architecture-Evolution.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/Architecture-Evolution.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/Architecture-Evolution.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/Architecture-Evolution.md'), 'architecture');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/CHANGELOG.md',
  'Changelog (Dokumentation)',
  'active',
  '# Changelog (Dokumentation)

Alle wichtigen Änderungen an der Systemdokumentation dieses Repositories werden in dieser Datei nach dem "Keep a Changelog"-Standard gepflegt.

> [!NOTE]
> Dieses Changelog trackt alle Änderungen an der Architektur, dem Quellcode (HTML, CSS, JS) und der Dokumentation von DIN-BriefNEO. Alle W3C-Modernisierungsstufen sind produktiv implementiert.

---

## [15.0.0] - 2026-05-27

### Added
*   **CSS Anchor Positioning:** Vollständige Umstellung des Adress-Vorschlags-Dropdowns (`#address-suggestions`) auf die native W3C CSS Anchor Positioning API im Stylesheet (`layout.css`). Es koppelt sich nun absolut ruckelfrei und performant an das Eingabefeld (`#input-address-search`) und nutzt `position-area: bottom span-x` mit automatischer Umklappung (`flip-block`).
*   **CSS View Transitions API:** Kapselung aller Benutzer-initiierten Layout-Wechsel (Form A / Form B) und Farbschema-Wechsel (Hell / Dunkel / Auto) in `document.startViewTransition()` für butterweiche, hardwarebeschleunigte und native Seitenüberblendungen direkt über die Browser-Engine.
*   **CSS @starting-style & Discrete Transitions:** Umstellung der WhatsApp-Style Auswahl-Toolbar (`#format-toolbar`) und des Toast-Feedbacks (`#toast-v4`) auf native CSS discrete transitions unter Verwendung von `transition-behavior: allow-discrete` und `@starting-style` in `floating.css`. 
*   **CSS @property & Guides-Fading:** Registrierung der CSS-Variablen `--guide-opacity` als Typ `<number>` in `variables.css` und Aktivierung einer flüssigen Transition auf `:root`. Hilfslinien blenden sich nun absolut stufenlos ein und aus.
*   **CSS Relative Color Syntax (RCS):** Dynamische Farbberechnung für `--accent-glow`, `--accent-hover`, `--danger-hover` und die Hilfslinien-Farbe (`--guide-color`) direkt im CSS abgeleitet von ihren Basisfarben im OKLCH-Farbraum. Die Hilfslinien nutzen nun eine triadisch verschobene 120-Grad-Farbton-Formel für automatischen, perfekt harmonisierten Kontrast.
*   **CSS interpolate-size (height: auto Transitions):** Globale Deklaration von `interpolate-size: allow-keywords` auf `:root` in `variables.css`. Umstellung des API-Key-Eingabebereichs (`#geoapify-key-container`) auf native Höhen- und Deckkraft-Übergänge zwischen `height: 0` und `height: auto` in `layout.css`.
*   **W3C Temporal API Datum-Autobefüllung:** Nativer Einsatz der ultra-modernen W3C Temporal API (`Temporal.Now.plainDateISO()`) zur vollautomatischen Befüllung des Datum-Textfeldes (`#datum`) in DIN-5008-konformem deutschem Format beim ersten Systemstart.
*   **CSS @scope Isolation & Nesting:** Deklarative Kapselung aller physischen Briefbogen-Stile (`din-a4` und Nachfahren) über `@scope (din-a4)` in `layout.css`. Schützt die Briefgeometrie vollständig vor globalen Kollisionen.
*   **Ausschließliches OKLCH-Farbmandat:** Kompromisslose Umstellung sämtlicher Stylesheets und inline-Styles (HEX `#HEX`, RGB, RGBA, named colors) auf den modernen, wahrnehmungslinearen OKLCH-Farbraum (`oklch()`).
*   **Reaktive :has() Fokusierung:** Einsatz des Parent Selectors `:has()` in `layout.css` zur automatischen Verstärkung des Ambient Glows auf dem Briefbogen, sobald ein editierbares Feld fokussiert wird.

### Changed

*   **Entscheidungs-Log:** Die Entscheidungen für CSS Anchor Positioning, View Transitions, Discrete Transitions, @property, Relative Color Syntax, interpolate-size, Temporal API, `@scope` und OKLCH-Farbmandat in `ADR-CSS.md`, `ADR-JS.md`, `ADR-FEATURE.md`, `ADR-ANTIPATTERN.md` und `DECISION-LOG.md` dokumentiert.
*   **Strikter Legacy-Date- & Farb-Ban:** Offizielle Ächtung von klassischem `new Date()`, externen Datums-Bibliotheken sowie allen klassischen Farbräumen (HEX, RGB, HSL) in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md`.
*   **Proaktive Antipattern-Verfassung:** Ausweitung der Verbote um 5 neue Regeln (Ausschluss von CSS-Präprozessoren, Icon-CDNs, JS-Hilfsbibliotheken/TypeScript, JS-Animationsbibliotheken und gestalterischen Inline-Styles) in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md` zum dauerhaften Schutz der Build-freien Offline-Architektur.
*   **JS-Bereinigungs-Dokumentation:** Ausführliche Architekturkommentare wurden in `main.js` (`renderSuggestions`, `processToastQueue`, `applySettings`, `applyProviderUIState` und `loadDraftData`) integriert, um den bewussten Verzicht auf JavaScript-Positions-, Keyframe-, Kontrast-, Fading-, Größen-Animations- und legacy Datums-Steuerungen zugunsten nativer W3C-Standards zu dokumentieren.
*   **Toast-Queue Vereinfachung:** Entfernung von obsoleten `@keyframes` aus `floating.css` und Vereinfachung des JS-Toast-Lifecycles in `main.js` (Ersatz von fehleranfälligen `animationend`-Listenern durch eine native, CSS-gesteuerte Austritts-Animation).
*   **API-Key-Steuerung:** Entfernung von unschönen inline-Styles in `index.html` und Ablösung von manuellen JavaScript-Größen-Animationsversuchen durch einfaches `.classList` Toggling.



## [Unreleased] - 2026-05-25

### Added
*   **Datenbank-Architektur:** Spezifikation der LLM-first SQLite-Dokumenten-Datenbank in **[../40-tooling/README-DB.md](../40-tooling/README-DB.md)** verankert.
*   **Datenbank-Compiler:** Das zero-dependency Node.js-Skript `build_db.js` zur vollautomatischen Generierung der SQLite-Datenbank aus den Markdown-Dateien angelegt.
*   **GitHub-Automatisierung:** Die Workflow-Vorlage `github_action_workflow.txt` für die vollautomatische Datenbank-Aktualisierung bei jedem Push erstellt.
*   **Entwicklerbereich:** Die Diagnose-Ansicht und Feature-Erkennungs-Matrix **[DEV-INFO.md](DEV-INFO.md)** zur Validierung von 25 absoluten Bleeding-Edge-Features der Web-Plattform angelegt und das Easter-Egg High-Integrity Dev-Panel (Feature 11) spezifiziert.
*   **Mermaid-Diagramme:** Visuelle Systemarchitektur und Spec-Kit-Lifecycle in `README.md` eingebettet.
*   **Zustandsdiagramm:** Toast-Queue-Lifecycle in `ADR-FEATURE.md` verankert.
*   **Netzwerkdiagramm:** Asynchroner Ablauf des Dual-Provider Adressdienstes in `ADR-API.md` integriert.
*   **YAML Frontmatter:** Obsidian- und KI-kompatible Metadaten-Blöcke an den Anfang aller 7 ADR-Dateien gestellt.
*   **Guides:** Das zentrale Fachbegriff-Glossar **[glossary.md](../20-implementation/glossary.md)** mit integrierten CSS-Container-Skizzen angelegt.
*   **Guides:** Der interaktive manuelle QA-Testleitfaden **[testing-guide.md](../20-implementation/testing-guide.md)** für alle Baseline-Features 1 bis 6 erstellt.
*   **Entscheidungs-Log:** Das chronologische Logbuch **[DECISION-LOG.md](DECISION-LOG.md)** zur historischen Nachverfolgbarkeit aller Systementscheidungen angelegt.
*   **Maschinen-Index:** Die Datei **[index.json](../../build/index.json)** als maschinenlesbarer Index aller Dokumente angelegt.

### Changed
*   **README.md:** Zum zentralen Master-Portal und Dokumenten-Wegweiser ausgebaut und Links zu den neuen Guides `DEV-INFO.md` und `../40-tooling/README-DB.md` unter den Status & Spezifikationen ergänzt.
*   **index.json:** Um Metadaten-Einträge für `DEV-INFO.md` und `../40-tooling/README-DB.md` erweitert.
*   **DECISION-LOG.md:** Neue architektonische Entscheidungen zur Feature-Prüfungs-Matrix, zum Easter-Egg Popover-Dashboard und zur LLM-first SQLite-Architektur dokumentiert.
*   **longevity-guidelines.md:** Pfadkorrekturen der ADR-Links auf relative `../ADR/`-Pfade korrigiert und plattformübergreifende CSS-Anchor-Positioning Warnungen integriert.
*   **spec.md:** Phase 3 Zukunftsplanung um Spezifikation für Easter-Egg High-Integrity Dev-Panel (Feature 11) erweitert.
*   **tasks.md & task.md:** Planungs-Checklisten bereinigt und an den rein dokumentationsfokussierten Baseline-Stand angepasst.
*   **ADR-HTML/CSS/JS/API/FEATURE/ANTIPATTERN/TECH-STACK.md:** Verlinkungen zur unbiegsamen Verfassung `longevity-guidelines.md` in den Verknüpfungs-Abschnitten bidirektional verankert.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/CHANGELOG.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/CHANGELOG.md'), 'changelog');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/CHANGELOG.md'), 'history');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/DECISION-LOG.md',
  'Chronologisches Entscheidungs-Log: DECISION-LOG.md',
  'active',
  '# Chronologisches Entscheidungs-Log: DECISION-LOG.md

Dieses Dokument protokolliert alle grundlegenden technologischen und architektonischen Entscheidungen des **DIN-BriefNEO**-Projekts in zeitlicher Reihenfolge. Es ergänzt die thematischen Architecture Decision Records (ADRs) um eine historische Perspektive.

---

## 📅 Chronologie der Entscheidungen

### 2026-05-24 – Longevity-Verfassung deklariert
*   **Entscheidung:** Etablierung des unbiegsamen W3C-Standard-Manifests und der 5 Säulen der Langlebigkeit (Zero-Dependency-Pakt, 100% Offline-Autarkie, W3C-Living-Standards, Build-Tool-Immunität, LocalStorage-Sovereignty).
*   **Grund:** Sicherung einer wartungsfreien Überlebensdauer des Briefbogen-Editors von 10+ Jahren bei lokaler Ausführung.
*   **Quelle:** [[longevity-guidelines|longevity-guidelines.md]]
*   **Status:** Aktiviert

---

### 2026-05-24 – Thematische ADR-Struktur eingeführt
*   **Entscheidung:** Aufteilung der Architektur-Entscheidungen in sieben hochgradig modulare, thematisch sortierte Dokumente (HTML, CSS, JS, API, Antipattern, Feature, Tech-Stack) mit gegenseitiger bidirektionaler Verknüpfung.
*   **Grund:** Bessere Übersichtlichkeit, Vermeidung eines unlesbaren Riesen-Dokuments, hervorragende Maschinenlesbarkeit für LLMs.
*   **Quelle:** Ordner `[ADR/](../10-architecture/ADR/)`
*   **Status:** Aktiviert

---

### 2026-05-24 – Next-Level-Visualisierungen & Lifecycles
*   **Entscheidung:** Integration standardisierter Mermaid-Flussdiagramme in README, Features und APIs zur visuellen Aufbereitung des Spec-Kit-Lifecycles und der Datenströme.
*   **Grund:** Sofortiges, visuelles Erfassen komplexer Zusammenhänge für menschliche Entwickler und diagrammfähige LLMs.
*   **Quelle:** [[README|README.md]], [[ADR-FEATURE|ADR-FEATURE.md]], [[ADR-API|ADR-API.md]]
*   **Status:** Aktiviert

---

### 2026-05-24 – Proportionaler CSS-Zoom statt ResizeObserver
*   **Entscheidung:** Der DIN A4 Bogen wird rein CSS-basiert über `height: 94vh`, `aspect-ratio: 210/297` und Container Queries (`cqw`/`cqh`) skaliert.
*   **Grund:** Vermeidung jeglichen JavaScript-Berechnungsoverheads, Beseitigung von ResizeObserver-Schleifen, perfekte Skalierungs-Sicherheit auf allen Displays.
*   **Quelle:** [[ADR-CSS|ADR-CSS.md]]
*   **Status:** Aktiviert

---

### 2026-05-24 – LocalStorage statt OPFS/IndexedDB
*   **Entscheidung:** Persistent Auto-Save wird ausschließlich über die synchrone `localStorage` API abgewickelt. OPFS und IndexedDB werden explizit auf die Antipattern-Liste gesetzt.
*   **Grund:** OPFS, IndexedDB und File System Access APIs werfen im lokalen Doppelklick-Sicherheitskontext (`file:///`) schwerwiegende CORS-Exceptions. LocalStorage ist die einzig verlässliche Option für serverlose Offline-Apps.
*   **Quelle:** [[ADR-JS|ADR-JS.md]], [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]]
*   **Status:** Aktiviert

---

### 2026-05-24 – API-Header-Security & AbortController
*   **Entscheidung:** Geoapify API-Schlüssel werden ausschließlich über HTTP-Header `X-Api-Key` übermittelt. Laufende Anfragen werden bei neuen Tastenanschlägen via `AbortController` abgebrochen.
*   **Grund:** Schutz der API-Keys vor dem Leaken in Logfiles (Verhinderung von URL-Exponierung). Schutz der Anwendung vor Race Conditions bei schnellem Tippen.
*   **Quelle:** [[ADR-API|ADR-API.md]]
*   **Status:** Aktiviert

---

### 2026-05-24 – Selection & Range API statt execCommand
*   **Entscheidung:** Textformatierungen im Briefkern werden rein über die native Selection & Range API und DOM-Manipulationen gelöst. `document.execCommand` wird strikt verboten.
*   **Grund:** `execCommand` ist veraltet (*deprecated*) und wird schrittweise aus modernen Browser-Engines entfernt. Wir nutzen zukunftssichere Standard-APIs.
*   **Quelle:** [[ADR-JS|ADR-JS.md]], [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]]
*   **Status:** Aktiviert

---

### 2026-05-24 – YAML Frontmatter & JSON-Index
*   **Entscheidung:** Ausstatten aller Architektur-Dateien mit standardisiertem YAML Frontmatter und Anlage eines zentralen Maschinen-Index `index.json`.
*   **Grund:** Ermöglicht die automatische, blitzschnelle Indexierung des gesamten Repositories für Obsidian-Notes und AI-LLM-Ingestion mit einem einzigen Lesevorgang.
*   **Quelle:** [ADR/](../10-architecture/ADR/), [index.json](../../build/index.json)
*   **Status:** Aktiviert

---

### 2026-05-24 – Etablierung des Entwicklerbereichs & Feature-Prüfung (DEV-INFO.md)
*   **Entscheidung:** Schaffung einer dedizierten Diagnose-Referenz `DEV-INFO.md` zur systematischen Erkennung von 14 W3C-Living-Standards und experimentellen Features auf Basis von `check_readiness.js`.
*   **Grund:** Bietet vollständige Transparenz über den Reifegrad modernster Web-APIs in der Chrome 147/148/149+ Zielumgebung und liefert ein robustes, kopierbares F12-Konsole-Skript.
*   **Quelle:** [[DEV-INFO|DEV-INFO.md]], [index.json](../../build/index.json)
*   **Status:** Aktiviert

---

### 2026-05-24 – Massive Expansion des Diagnose-Guides & Easter-Egg Panel Spezifikation
*   **Entscheidung:** Erweiterung der Feature-Matrix in `DEV-INFO.md` von 14 auf 25 absolute Bleeding-Edge-Features der Web-Plattform und Spezifizierung eines 3-Klick-Easter-Eggs mit einem nativen HTML5 Popover-Overlay im Dokument `spec.md` (Feature 11).
*   **Grund:** Reaktion auf die exzellenten Browser-Testergebnisse des Benutzers (Chrome 148+), die unerwartet breite Unterstützung modernster Standards zeigen. Ermöglicht maximale JS-Einsparungen durch Nutzung nativer HTML5/CSS-Mechanismen (z. B. Popover API) für das zukünftige Entwickler-Dashboard.
*   **Quelle:** [[DEV-INFO|DEV-INFO.md]], [[spec|spec.md]]
*   **Status:** Aktiviert

---

### 2026-05-25 – Einführung der LLM-First SQLite-Datenbank-Architektur & README-DB.md
*   **Entscheidung:** Etablierung eines serverlosen Hybrid-Datenbankmodells zur KI-optimierten Aufbereitung des gesamten Projektwissens. Die Markdown-Dateien bleiben die Quell-Ebenen (Git-Master), während eine SQLite-Datenbank `docs.db` automatisch über ein Node.js-Kompilierskript `build_db.js` generiert und über einen Model Context Protocol (MCP) Server bereitgestellt wird. Spezifizierung der Architektur im Dokument `README-DB.md`.
*   **Grund:** Beseitigt Token-Engpässe, überwindet fehlende Indexierungsstrukturen unstrukturierter Verzeichnisse und befähigt KIs (z. B. Claude via Desktop-MCP), relationale, hocheffiziente Suchen (inkl. FTS5-Volltextsuche) auf der Doku auszuführen, anstatt ganze Dateien einlesen zu müssen.
*   **Quelle:** [[README-DB|README-DB.md]], [index.json](../../build/index.json), `build_db.js`, `github_action_workflow.txt`
*   **Status:** Aktiviert

---

### 2026-05-27 – Schritt 1: CSS Anchor Positioning für Adress-Vorschläge
*   **Entscheidung:** Ablösung aller manuellen JavaScript-basierten Positions- und Breitenberechnungen für das Adress-Autocomplete-Dropdown `#address-suggestions` zugunsten der W3C CSS Anchor Positioning API unter Verwendung der standardisierten `position-area: bottom span-x` Syntax.
*   **Grund:** Reduziert die Codekomplexität in `main.js` signifikant, überlässt die exakte Layoutplatzierung nativ der Browser-Engine auf Grafikkarten-Ebene und eliminiert Layout-Ruckeln oder asynchrone Offsets vollständig.
*   **Quelle:** [[ADR-CSS|ADR-CSS.md]], `layout.css`, `main.js`
*   **Status:** Aktiviert

---

### 2026-05-27 – Schritt 2: CSS View Transitions API für flüssige Layout- & Theme-Wechsel
*   **Entscheidung:** Kapselung aller UI-Layoutänderungen (Form A / Form B) und Theme-Umschaltungen (Hell / Dunkel / Auto) in der modernen W3C View Transitions API (`document.startViewTransition()`).
*   **Grund:** Ermöglicht hardwarebeschleunigte, vollautomatische und optisch ansprechende Übergänge direkt über die Rendering-Engine des Browsers, ohne dass aufwändige CSS-Klassen oder zeitgesteuerte JavaScript-Fade-Operationen geschrieben werden müssen.
*   **Quelle:** [[ADR-JS|ADR-JS.md]], `main.js`
*   **Status:** Aktiviert

---

### 2026-05-27 – Schritt 3: CSS @starting-style & Discrete Transitions für Popovers
*   **Entscheidung:** Umstellung des Toast-Feedbacks (`#toast-v4`) und der Auswahl-Toolbar (`#format-toolbar`) auf native CSS discrete transitions unter Verwendung von `@starting-style` und `transition-behavior: allow-discrete` (für `display` und `overlay` Eigenschaften).
*   **Grund:** Beseitigt komplexe `@keyframes` Animationen und macht das fehleranfällige JavaScript-seitige Lauschen auf `animationend`-Events sowie manuelle Transition-Klassen komplett überflüssig. JavaScript übernimmt rein die Statuskontrolle des Popovers, während der Browser Ein- und Ausblendungen flüssig steuert.
*   **Quelle:** [[ADR-FEATURE|ADR-FEATURE.md]], `floating.css`, `main.js`
*   **Status:** Aktiviert

---

### 2026-05-27 – Schritt 4: CSS @property & Guides-Fading
*   **Entscheidung:** Registrierung der CSS-Custom-Property `--guide-opacity` als Typ `<number>` im CSS und Implementierung einer flüssigen Transition auf `:root`.
*   **Grund:** Beseitigt jegliche JavaScript-Animationsschleifen oder Intervalle zum Ein-/Ausblenden der Hilfslinien. Der Browser interpoliert den Opacity-Übergang von `0.15` auf `0` vollkommen selbstständig und hardwarebeschleunigt auf GPU-Ebene, sobald JS den Variablenwert ändert.
*   **Quelle:** [[ADR-CSS|ADR-CSS.md]], `variables.css`, `main.js`
*   **Status:** Aktiviert

---

### 2026-05-27 – Schritt 5: CSS Relative Color Syntax (RCS)
*   **Entscheidung:** Umstellung aller funktionalen, abgeleiteten Farbtöne (z. B. `--accent-glow`, `--danger-hover` und `--guide-color`) auf die native W3C Relative Color Syntax (RCS) im OKLCH-Farbraum.
*   **Grund:** Beseitigt statische Farbwert-Kopien und das JavaScript-seitige Errechnen von Farbkontrasten. Der Browser berechnet harmonische Schattierungen (z. B. 120-Grad-Farbwinkelverschiebung für kontrastreiche, aber perfekt harmonisierte Hilfslinien) völlig eigenständig. Das Farbschema bleibt dadurch mathematisch perfekt konsistent bei jeglichem Akzentfarbenwechsel.
*   **Quelle:** [[ADR-CSS|ADR-CSS.md]], `variables.css`
*   **Status:** Aktiviert

---

### 2026-05-27 – Schritt 6: CSS interpolate-size für native Auto-Maß-Animationen
*   **Entscheidung:** Globale Deklaration von `interpolate-size: allow-keywords` auf `:root` und Umstellung des API-Key-Eingabebereichs (`#geoapify-key-container`) auf native Höhen- und Deckkraft-Transitionen zwischen `height: 0` und `height: auto` unter Verwendung von CSS-Klassentoggles.
*   **Grund:** Eliminiert alle JavaScript-Hacks, Intervalle oder `max-height`-Tricks zum Auf- und Zuklappen von Oberflächenmodulen. JavaScript steuert ausschließlich die Statusklasse (`.active`), während die Browser-Renderengine den stufenlosen Größenübergang performant auf GPU-Ebene berechnet.
*   **Quelle:** [[ADR-CSS|ADR-CSS.md]], `layout.css`, `main.js`
*   **Status:** Aktiviert

---

### 2026-05-27 – Schritt 7: JS Temporal API Mandat & Datum-Autobefüllung
*   **Entscheidung:** Strikter Ausschluss des klassischen JS `Date`-Objekts und externer Datumsbibliotheken (Prohibitiv-Eintrag in `ADR-ANTIPATTERN.md`). Einführung der W3C **Temporal API** (`Temporal.Now.plainDateISO()`) zur vollautomatischen Befüllung des Datumsfeldes (`#datum`) in DIN-5008-konformem deutschem Format beim ersten Laden.
*   **Grund:** Beseitigt fehleranfälliges Datums-Parsing, Mutability-Risiken und CDNs. Die Temporal API liefert unveränderliche, normative und zeitzonensichere Datumsarithmetik direkt im Browser.
*   **Quelle:** [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]], `main.js`
*   **Status:** Aktiviert

---

### 2026-06-12 – Korrektur + Platzierung: AGENTS.md im korrekten Root (Obsidian_Main) + Verhaltensvertrag für KI-Agenten
*   **Entscheidung:** AGENTS.md mit dem bereitgestellten Testballon-Vertrag wurde zunächst versehentlich im duplizierten Baum unter `Other_Projects\DIN-Brief Neo` angelegt (mit neuerarbeitsordner). Korrigiert und neu platziert direkt im aktiven Root: `Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\AGENTS.md`. Zusätzlich Eintrag in diesem DECISION-LOG und Pointer im aktueller_arbeitsordner/README.md hinzugefügt. Pre- und Post-Build mit vollem Reconciliation & Fitness Check (100 %) durchgeführt.
*   **Grund:** Der echte aktive Arbeitsordner (`aktueller_arbeitsordner/`, mit reconciliation.js, log_session.js, vollem Fitness-Score etc.) liegt hier unter Obsidian_Main, direkt neben der generischen llm_boilerplate. Der Other_Projects-Ordner war eine ältere Kopie. Der Vertrag macht Reconciliation Loop, 100% Fitness, Pre/Post-Builds, Session-Logging und Generalisierbarkeits-Priorisierung verbindlich und positioniert DIN-Brief Neo explizit als Testballon.
*   **Quelle:** User-Korrektur-Hinweis (korrekter Pfad), genehmigter Plan, lokale tools/build_db.js + reconciliation (Fitness 100%), aktueller_arbeitsordner/tools/log_session.js
*   **Status:** Aktiviert

---

### 2026-06-12 – AGENTS.md massiv geschärft (Verhaltensvertrag v2)
*   **Entscheidung:** Die ursprüngliche AGENTS.md wurde auf Basis detaillierten User-Feedbacks deutlich nachgeschärft: harte "MUSS" / "DARF NICHT"-Sprache statt weicher "sollst", Workflow mit expliziten Triggern ("vor jeder relevanten Änderung"), Generalisierungs-Pflicht als eigene zentrale Kernregel mit ADR/Migrationspfad-Anforderung, Logging-Befehl realistisch an die aktuelle Struktur (`aktueller_arbeitsordner/tools/log_session.js`) angepasst, Dokument kürzer, direkter und weniger erklärend gehalten. Zusätzlich Referenzen zu reconciliation.js, Fitness-Score-Output und boilerplate-Mustern ergänzt.
*   **Grund:** Die erste Version war als Entwurf brauchbar, aber als bindender Vertrag für Grok Build und zukünftige Agenten zu weich, vage und zu lang. Schärfere Formulierung stellt sicher, dass Regeln nicht weich interpretiert werden können. Pre- und Post-Build mit 100% Fitness Score durchgeführt.
*   **Quelle:** User-Feedback (Kritikpunkte zu Sprache, Workflow, Logging-Pfad, Generalisierbarkeit), aktuelle AGENTS.md, lokale tools (build_db.js + reconciliation, log_session.js)
*   **Status:** Aktiviert

---

### 2026-06-12 – AGENTS.md finale polierte Version
*   **Entscheidung:** Letzte Feinschliff-Version der AGENTS.md: Logging-Pfad mit explizitem Hinweis auf den aktuellen Stand (Datei liegt in `aktueller_arbeitsordner/tools/`, Fallback auf `../llm_boilerplate/tools/` falls temporär nicht vorhanden) ergänzt. Zusammenfassung am Ende knackiger und bündiger formuliert. Konsequenzen bei Vertragsverletzung noch deutlicher gemacht ("Vertragsverletzung = Änderung wird abgelehnt. Punkt."). Pre- und Post-Build mit 100% Fitness Score.
*   **Grund:** Praktische Umsetzbarkeit verbessern (realistischer Logging-Befehl) und die Verbindlichkeit noch einmal unterstreichen, bevor Grok Build vollständig unter diesem Vertrag arbeitet.
*   **Quelle:** User-Feedback zur finalen Version, aktuelle AGENTS.md, lokale tools (build_db.js + reconciliation + log_session.js)
*   **Status:** Aktiviert

---

### 2026-06-12 – AGENTS.md finale optimierte Version (User-Feedback Iteration)
*   **Entscheidung:** Vollständig überarbeitete finale Version mit folgenden Verbesserungen: Kurze harte "Core Rules"-Zusammenfassung (TL;DR) ganz oben, Logging-Abschnitt praktikabel gemacht mit klarem Hinweis auf aktuellen Stand + Fallback auf llm_boilerplate, Generalisierungs-Pflicht noch präziser (bei jedem Feature/Regel + explizite Vorschlagspflicht), Sprache überall auf "muss / darf nicht / ist verboten" verschärft, explizite Erwähnung von constitution.md + MASTER-DO-DONT-DEPRECATED.md als zu respektierende Quellen, klarer Eskalationsmechanismus bei wiederholten Verstößen, kurzer Abschnitt zur Beziehung DIN-Brief Neo ↔ llm_boilerplate (kopieren vs. referenzieren), Regelung für Änderungen an AGENTS.md selbst hinzugefügt. Pre- und Post-Build mit 100% Fitness Score durchgeführt.
*   **Grund:** Die vorherige Version war bereits gut, aber noch nicht optimal in Struktur (TL;DR fehlte), praktischer Umsetzbarkeit (Logging) und Präzision einzelner Formulierungen. Ziel: maximale Eignung für Grok Build und den Testballon-Use-Case.
*   **Quelle:** Detailliertes User-Feedback (Struktur, Logging-Schwachstelle, Generalisierungs-Pflicht, fehlende Themen, Konsequenzen), aktuelle AGENTS.md, lokale tools (build_db.js + reconciliation + log_session.js)
*   **Status:** Aktiviert

---

### 2026-06-12 – Layered Antipatterns + Migrations-Roadmap für Boilerplate-Extraktion
*   **Entscheidung:** Einführung der vom User empfohlenen Struktur unter `aktueller_arbeitsordner/tools/antipatterns/{base.json, web.json, project.json}` (statt flachem antipatterns.json). Regeln migriert und geschichtet (DIN-spezifische Exemptions in project.json). `boilerplate.config.json` angelegt. `reconciliation.js` auf layered Loading mit ID-basiertem Merge umgestellt (project überschreibt web/base korrekt, inkl. Exemptions). Zusätzlich `MIGRATION-ROADMAP-TO-BOILERPLATE.md` mit priorisierter Schritt-für-Schritt-Roadmap erstellt (Phase 1: Layered Antipatterns, Phase 2: Tools generisch, Phase 3: Doku, Phase 4: Extraktion). Pre/Post-Builds durchgeführt (Fitness nach Override-Fix wieder 100%).
*   **Grund:** Ermöglicht später saubere, mechanische Extraktion der generischen Teile (base/web Rules + Tools) in die llm_boilerplate mit minimalem manuellem Aufräumen. Entspricht direkt der Generalisierungs-Pflicht aus AGENTS.md (jede Lösung auf Generalisierbarkeit prüfen und aktiv überführen). Klare Trennung project.json als "Mülleimer" für DIN-spezifisches.
*   **Quelle:** User-Vorschlag zur Ordnerstruktur + Roadmap, aktuelle llm_boilerplate/tools/antipatterns/ als Referenz, DIN flat antipatterns.json + reconciliation.js, AGENTS.md Core Rules.
*   **Status:** Aktiviert

---

### 2026-06-12 – Hybrid Spec-Driven Workflow Integration (spec-kit + our strengths)
*   **Entscheidung:** Adopted useful elements from GitHub spec-kit into our system without adopting the whole thing: 
  - Created `aktueller_arbeitsordner/.specify/` (hidden, for agent-specific artifacts like constitution reference and templates – highly extractable).
  - Created `specs/` with numbered structure (001-hybrid-workflow-integration/spec.md as first example) for traceability.
  - Created `HYBRID-SPEC-DRIVEN-WORKFLOW.md` defining the combined process (spec-kit phases Constitution→Spec→Plan→Tasks→Implement + our mandatory Reconciliation/Fitness/Log/Generalisierungs gates at the end).
  - Added `.specify/templates/spec.md` and `.specify/constitution.md` (reference).
  - All changes followed Pre/Post build (100%), log_session, and this DECISION-LOG entry.
*   **Grund:** spec-kit excels at lightweight, structured, agent-friendly workflow and organization. Our system is superior in quality enforcement and antifragility. Hybrid gives us the best of both for the Testballon goal (easy extraction of generic patterns to llm_boilerplate).
*   **Quelle:** Detailed user comparison of spec-kit vs our DIN + Boilerplate system, AGENTS.md Generalisierungs-Pflicht and Core Rules, existing MIGRATION-ROADMAP.
*   **Status:** Aktiviert

---

### 2026-06-12 – Light Mode vs Full Mode eingeführt (Vereinfachung zur Reduktion von Fehleranfälligkeit)
*   **Entscheidung:** Gestuften Workflow in AGENTS.md und HYBRID-SPEC-DRIVEN-WORKFLOW.md etabliert: 
  - **Light Mode** (Default für die meisten Änderungen): Pre-Build → Änderung → Post-Build (muss 100% Fitness) → Loggen + kurzer (1-2 Sätze) Generalisierungs-Vermerk im DECISION-LOG.md. Kein zwingendes spec.md/plan/tasks.
  - **Full Mode** (nur für wichtige Features/Architektur/boilerplate-relevante Arbeit): Zusätzlich spec/plan/tasks Struktur + expliziter ausführlicher Generalisierungs-Check.
  - Core Rules (Builds vor/nach, 100% Score, Logging, Respektierung der Verfassung) gelten **immer**.
  - AGENTS.md um dedizierten Abschnitt "Light Mode vs Full Mode" erweitert (nach Core Rules) und Workflow-Sektion angepasst.
  - Pre/Post-Build 100%, mit log_session.js geloggt.
*   **Grund:** Vereinfachung reduziert Einstiegshürde und Fehleranfälligkeit erheblich (weniger manuelle Schritte bei Alltags-Änderungen), ohne die Kernstärken (Reconciliation, Fitness Score, Generalisierungs-Pflicht, Audit) zu verlieren. 70-80% der Arbeit kann nun im leichten Modus laufen.
*   **Quelle:** User-Feedback zur hohen Komplexität des Hybrid-Workflows, AGENTS.md Vertrag, vorherige Integration von spec-kit-Ideen.
*   **Status:** Aktiviert

---

### 2026-06-12 – start.ps1 hinzugefügt (einfache Ein-Klick Automatisierung für Light Mode)
*   **Entscheidung:** Einfaches `start.ps1` Skript im Root von `aktueller_arbeitsordner` erstellt. Es:
  - Prüft Node.js
  - Wechselt automatisch ins korrekte Verzeichnis
  - Führt den vollen Build (Reconciliation + Fitness + DB) aus
  - Gibt klare Hinweise für Light Mode Nutzung
*   **Grund:** Der größte aktuelle Pain Point war die manuelle Einrichtung und der "wo bin ich und was muss ich tippen"-Aufwand. Mit `.\start.ps1` wird der Light Mode Alltag extrem einfach (ein Befehl). Folgt strikt dem AGENTS.md Light Mode Prinzip und dem User-Wunsch nach automatischer Einrichtung.
*   **Quelle:** User-Feedback ("einrichtung sollte einigermassen automatisch gehen... den rest soll sowieso die ki machen"), aktuelle Komplexitäts-Diskussion, vorheriger Status-Überblick.
*   **Status:** Aktiviert

---

### 2026-06-12 – Phase 1 Ausarbeitung: Detaillierte Umsetzungsanleitung für sqlite-vec Integration
*   **Entscheidung:** Umfassende, priorisierte Implementierungsanleitung für Phase 1 (Fundament stärken mit sqlite-vec) als `PHASE1-SQLITE-VEC-IMPLEMENTATION.md` im `aktueller_arbeitsordner/` abgelegt. Enthält exakte Arbeitspakete 1–6 mit konkreten Code-Snippets (Schema-Erweiterung, Content-Hash-Caching, Extension-Loading, Hybrid Search via RRF, Reconciliation-Check-Erweiterung, Dokumentation), Leitplanken, Risiken und nächsten Schritten. Folgt dem User-Vorschlag für pragmatische, fokussierte Phase 1 (keine neuen Visionen, nur das technische Fundament für Hybrid Search / Embedded Knowledge Graph).
*   **Grund:** Der User bat explizit um eine "klare, konkrete Ausarbeitung für Phase 1" statt weiterer hoher Visionen. Die Datei dient als direkt ausführbare Anleitung für den nächsten technischen Schritt (Single-File SQLite + FTS5 + sqlite-vec + RRF), während Reconciliation/Fitness/Logging/Generalisierbarkeit erhalten bleiben. Pre/Post-Build 100% + Session-Log durchgeführt.
*   **Quelle:** User-Message mit Phasen-Vorschlag + detaillierter Research (sqlite-vec statt Chroma etc.), aktuelle Projektstruktur (build_db.js, reconciliation.js, bestehende DB-Schema), AGENTS.md (Generalisierungs-Pflicht + Build-Gates).
*   **Status:** Aktiviert

---

### 2026-06-12 – Archiv-Restrukturierung (vorsichtige, dokumentierte Variante des Aufräum-Auftrags)
*   **Entscheidung:** Den vorgeschlagenen Aufräum-Auftrag in der vorsichtigen Variante ausgeführt (Restrukturieren + Dokumentieren statt Massenlöschung, wie in der Bewertung empfohlen). 
  - Archiv neu strukturiert in:
    - `archiv/old-project-snapshots/` (DIN-BriefNEO und din-5008-css-forked-for-later)
    - `archiv/external-references/` (die vier fremden Forks: din-5008-css, din5008-generator, GerLaTeXLetter, letter)
    - `archiv/deprecated-agent-artifacts/` (loose files + alte Agent-Artefakte)
  - Eigene_quellen/ und fremde_quellen/ aufgelöst.
  - Loose Dateien von der Root-Ebene (Claude-..., deepseek.md, alte .db Kopien) in deprecated-agent-artifacts/ verschoben.
  - Für jeden Unterordner und den gesamten archiv/ eine klare README.md angelegt mit Herkunft, Archivierungsgrund und möglichem Nutzen.
  - Keine .git etc. aus Snapshots entfernt (Teil der historischen Aufzeichnung); nur Struktur bereinigt.
*   **Grund:** Reduziert kognitive Last für neue Agenten massiv, ohne historischen Referenzwert zu zerstören (wichtig im Testballon-Kontext). Passt zu AGENTS.md Ziel der Einfachheit und zur Forderung nach dokumentierter Generalisierbarkeit. Der aktive `aktueller_arbeitsordner/` war bereits weitgehend clean.
*   **Quelle:** Der detaillierte Aufräum-Auftrag im Handover-Dokument (Desktop), eigene vorherige Bewertung (vorsichtiger Ansatz), aktuelle Struktur-Analyse (viele alte .git/.brain in Snapshots).
*   **Status:** Aktiviert
*   **Auswirkung auf Fitness:** Pre- und Post-Build beide 100%. Keine Auswirkung auf gescannte Docs (archiv wird nicht vom Build erfasst).

---

### 2026-06-12 – start.ps1 weiter verbessert (Usability für Light Mode)
*   **Entscheidung:** start.ps1 erweitert, sodass es jetzt auch direkt aus dem übergeordneten "DIN-Brief Neo/" Ordner aufgerufen werden kann (automatisches Wechseln in aktueller_arbeitsordner/). Macht den täglichen Light Mode Einstieg noch robuster und einfacher.
*   **Grund:** Teil von Schritt 2 (AGENTS.md & Usability) nach dem Aufräumen. Ziel: "die einrichtung sollte einigermaßen automatisch gehen".
*   **Quelle:** AGENTS.md (Light Mode als Default), User-Wunsch nach einfacher Nutzung.
*   **Status:** Aktiviert

---

### 2026-06-12 – Phase 1, Arbeitspaket 1: Schema-Erweiterung für sqlite-vec
*   **Entscheidung:** In `tools/build_db.js` das Schema der `documents` Tabelle um die Spalten `content_hash`, `embedding` (BLOB), `embedding_model` und `embedding_dim` erweitert. Zusätzlich die virtuelle Tabelle `vec_documents USING vec0(embedding FLOAT[384])` für sqlite-vec angelegt. Der INSERT-Befehl wurde angepasst (neue Felder zunächst mit NULL-Platzhaltern, da die eigentliche Befüllung in Paket 2/3 erfolgt).
*   **Grund:** Erster Schritt von Phase 1 (siehe PHASE1-SQLITE-VEC-IMPLEMENTATION.md). Vorbereitung für Content-Hash-Caching und Vektor-Embeddings, um später Hybrid Search (FTS5 + vec + RRF) zu ermöglichen. Änderung ist bewusst generisch gehalten, damit sie später sauber in die llm_boilerplate übernommen werden kann.
*   **Quelle:** PHASE1-SQLITE-VEC-IMPLEMENTATION.md (Arbeitspaket 1), bestehendes Build-Schema, AGENTS.md (Generalisierungs-Pflicht).
*   **Status:** Aktiviert
*   **Auswirkung:** Pre- und Post-Build beide 100% Fitness Score. Keine kritischen Violations. Der Build funktioniert weiterhin (neue Spalten nullable bzw. mit Defaults).

---









- **2026-06-30 - PDF Re-Import entfernt (Simplicity First)**: Der fehleranf�llige und komplexe Ansatz, Daten-State als unsichtbaren Text in PDFs zu schmuggeln, wurde entfernt. metadata.js setzt nun nur noch <title> und Meta-Tags. Generalisierbarkeit: PDF-Export-Code sollte nie versuchen, Backups in die Druckausgabe zu hacken; saubere Trennung von Export und State-Save ist stabiler und wartbarer.

- **2026-06-30 - Optionale Layout-Bl�cke (Zero-JS)**: Postvermerk, Anlagen und Verteiler wurden als CSS-only Toggle (via :has) in die Sidebar integriert. Generalisierbarkeit: Komplexe UI-Zust�nde lassen sich mit nativen CSS :has() und Checkboxen elegant und robust ohne JS abbilden, was die App-Logik extrem vereinfacht.

- **2026-06-30 - Canvas Signature Compressor (Zero-JS/Offline)**: Ein neues Feature zum Einf�gen grafischer Unterschriften. Zur Schonung des 5MB localStorage Limits wird ein unsichtbarer Canvas-Kompressor genutzt. Generalisierbarkeit: Gro�e Bin�rdaten lassen sich im Browser per Canvas extrem ressourcenschonend f�r den localStorage aufbereiten (Zero-Server-Architektur).',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DECISION-LOG.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DECISION-LOG.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DECISION-LOG.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DECISION-LOG.md'), 'decision-log');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DECISION-LOG.md'), 'architecture');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/DEV-INFO.md',
  'Entwicklerbereich & Feature-Prüfung',
  'active',
  '# 🛠️ DIN-BriefNEO — Entwicklerbereich & Feature-Prüfung

Dieses Dokument dient als reines **Live-Diagnose-Tool** und Feature-Erkennungs-Matrix für die Validierung moderner Webtechnologien. Es ist keine Architektur-Vorgabe (diese finden sich in den ADRs) im Kontext unserer **Chrome 147/148/149+ Baseline**. Es basiert auf der originalen `check_readiness.js` und wurde massiv erweitert, um **25 absolute Bleeding-Edge-Features** der modernen Web-Plattform systematisch zu erkennen. 

Darüber hinaus spezifizieren wir hier das Konzept für ein **geheimes Easter-Egg-Entwickler-Overlay**, das später mit minimalem JavaScript-Einsatz direkt in das Frontend integriert werden kann.

---

## 🧐 Rationale & Zweck

Getreu **Säule 3 unserer [[longevity-guidelines|Longevity Guidelines]]** (W3C Living Standards & Native APIs) verzichtet dieses Projekt vollständig auf proprietäre Frameworks. Die Testergebnisse deines Chrome 148+ Browsers haben bewiesen, dass selbst hochinnovative Features wie die `Temporal API`, `CSS if() Logic` und native `Sanitizer` bereits vollständig einsatzbereit sind!

Indem wir ein umfassendes Spektrum an Bleeding-Edge-Features scannen, ermitteln wir exakt, welche modernsten W3C-APIs wir nutzen können, um JavaScript einzusparen und die Codebasis noch schlanker, wartungsfreier und robuster zu gestalten.

---

## 🕵️‍♂️ Das Feature-Prüfungs-Prinzip

Wir unterscheiden bei der Bewertung von Web-APIs drei klar definierte Zustände:

1. **Aktiviert (Produktiv):** Vollständig abwärtskompatible, stabile W3C-Standards, die in allen modernen Browsern (Chrome, Safari, Firefox) nativ implementiert sind.
2. **Future-Proof (Inaktiv):** Modernste W3C-Kandidaten, die bereits in Chromium-Engines bereitstehen, aber mangels breiter Cross-Browser-Stabilität oder aufgrund experimentellen Status noch nicht in den Produktiv-Code einfließen dürfen.
3. **Verboten (Antipattern):** Veraltete (*deprecated*) oder riskante APIs, die laut **[[MASTER-DO-DONT-DEPRECATED|MASTER-DO-DONT-DEPRECATED.md]]** strikt untersagt sind (z. B. `execCommand` oder OPFS/IndexedDB unter `file://`).

---

## 📊 Bleeding-Edge Feature-Prüfungs-Matrix (25 Features)

Die folgende Tabelle listet alle 25 Kernfeatures auf, die wir zur Validierung der Browser-Umgebung überprüfen:

| Nr. | Feature / API | Erkennungsmethode (CSS / JS) | Baseline-Plattform | Architektur-Nutzen | Longevity-Status & Empfehlung |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Temporal API** | `typeof globalThis.Temporal !== ''undefined''` | Chrome 146 / Stable | Behebt alle Designfehler des alten `Date`-Objekts. | ✅ **Aktiviert (Produktiv)**<br>Nativ in Chrome 148 im Einsatz. |
| 2 | **CSS @property** | `CSS.supports("--x: 1mm") && typeof window.CSSPropertyRule !== "undefined"` | Chrome 146 / Stable | Ermöglicht typisierte CSS-Variablen für flüssige Transitionen. | ✅ **Aktiviert (Produktiv)**<br>Unser Standard für registered Custom Properties. |
| 3 | **CSS @scope** | `typeof CSSScopeRule !== "undefined"` | Chrome 118 / Stable | Native Kapselung von CSS-Regeln ohne Shadow DOM. | ✅ **Aktiviert (Produktiv)**<br>Kapselt din-a4-Komponenten sauber ab. |
| 4 | **CSS if() Logic** | `CSS.supports("top: if(style(--x: 1): 1px; else: 2px)")` | Chrome 148 | Deklarative logische Weichen direkt im CSS ohne JS. | ⏳ **Future-Proof (Inaktiv)**<br>Revolutionär für Dynamic Styling. |
| 5 | **Scroll-State Queries** | `CSS.supports("container-type: scroll-state")` | Chrome 147 | Container-Abfragen basierend auf dem Scroll-Zustand. | ⏳ **Future-Proof (Inaktiv)**<br>Experimenteller Entwurf. |
| 6 | **Native Invokers** (`commandfor`) | `"commandfor" in document.createElement("button")` | Chrome 147 | Deklarative Trigger für Popovers und Dialoge ohne JS-Listener. | ⏳ **Future-Proof (Inaktiv)**<br>Im Entwurf. |
| 7 | **Advanced attr() Typisierung** | `CSS.supports("width: attr(data-x type(<length>))")` | Chrome 133 / 149 | Liest Daten-Attribute direkt als typisierte CSS-Einheiten ein. | ⏳ **Future-Proof (Inaktiv)**<br>Befindet sich in Standardisierung. |
| 8 | **View Transitions (Scoped)** | `typeof document.startViewTransition !== ''undefined''` | Chrome 146 / Stable | Flüssige, native Übergänge bei Zustands- und Seitenwechseln. | ✅ **Aktiviert (Produktiv)**<br>Steuert stufenlose Layout- und Theme-Wechsel. |
| 9 | **CSS contrast-color()** | `CSS.supports("color: contrast-color(white)")` | Chrome 147 | Automatische, barrierefreie Textkontraste direkt über den Browser. | ✅ **Aktiviert (Produktiv)**<br>Automatischer, barrierefreier Textkontrast. |
| 10 | **CSS border-shape** | `CSS.supports("border-shape: circle")` | Chrome 147 | Deklaratives Abrunden und Formen von Elementrahmen im CSS. | ⏳ **Future-Proof (Inaktiv)**<br>Experimenteller Entwurf. |
| 11 | **Math.sumPrecise** | `typeof Math.sumPrecise !== "undefined"` | Chrome 147 | Verlustfreie und präzise Fließkomma-Additionen direkt in JS. | ⏳ **Future-Proof (Inaktiv)**<br>Befindet sich im Standardisierungsprozess. |
| 12 | **Sanitizer API (Native)** | `typeof globalThis.Sanitizer !== "undefined"` | Chrome 147 | Browser-nativer Schutz vor Cross-Site-Scripting (XSS). | ⏳ **Future-Proof (Inaktiv)**<br>Warten auf Spezifikations-Stabilisierung. |
| 13 | **Element.setHTML()** | `typeof Element.prototype.setHTML !== "undefined"` | Chrome 147 | Sicheres Einfügen von HTML über integrierten Sanitizer. | ⏳ **Future-Proof (Inaktiv)**<br>`textContent` bleibt produktiver Standard. |
| 14 | **CSS calc-size(auto)** | `CSS.supports("height: calc-size(auto, 100%)")` | Chrome 129 / Stable | Ermöglicht mathematische Berechnungen und Transitionen auf `auto`. | ⏳ **Future-Proof (Inaktiv)**<br>Exzellent für flüssige Sidebar-Toggles. |
| 15 | **CSS Anchor Positioning** | `CSS.supports("anchor-name: --foo")` | Chrome 125 / Stable | Nativer Verankerungs-Mechanismus für Popovers ohne JS. | ✅ **Aktiviert (Produktiv)**<br>Positioniert Adress-Dropdown und Format-Toolbar. |
| 16 | **CSS field-sizing: content** | `CSS.supports("field-sizing: content")` | Chrome 123 / Stable | Auto-skalierende Textfelder ohne JS-Resize-Listener. | ✅ **Aktiviert (Produktiv)**<br>Perfekt für `#brieftext`. |
| 17 | **CSS light-dark()** | `CSS.supports("color: light-dark(black, white)")` | Chrome 123 / Stable | Native Theme-Zuweisungen im CSS ohne JS-Klassen-Toggles. | ✅ **Aktiviert (Produktiv)**<br>Unser Standard in `variables.css`. |
| 18 | **CSS Relative Color Syntax** | `CSS.supports("color: oklch(from red l c h)")` | Chrome 119 / Stable | Berechnet neue Farben relativ von einer Basis-Farbvariable. | ✅ **Aktiviert (Produktiv)**<br>Ermöglicht dynamische Farbvarianten im CSS. |
| 19 | **CSS Scroll-driven Animations** | `CSS.supports("animation-timeline: scroll()")` | Chrome 115 / Stable | Renderschleifenfreie Animationen gekoppelt an das Scrollen. | ⏳ **Future-Proof (Inaktiv)**<br>Kann für Premium-Effekte genutzt werden. |
| 20 | **CSS Custom State Pseudo-Class** | `CSS.supports("selector(:state(--foo))")` | Chrome 125 / Stable | Erlaubt das native Stylen von Custom Element States von außen. | ⏳ **Future-Proof (Inaktiv)**<br>Enorm mächtig für Web-Components. |
| 21 | **Navigation API** | `typeof globalThis.navigation !== "undefined"` | Chrome 102 / Stable | Moderne, ereignisgesteuerte Navigation ohne History-API-Schmerz. | ⏳ **Future-Proof (Inaktiv)**<br>Zukunftssicheres Routing. |
| 22 | **Speculation Rules API** | `HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")` | Chrome 109 / Stable | Deklaratives Prerendering und Prefetching von Folgeseiten. | ❌ **Nicht empfohlen (Ressourcen-Fresser)**<br>Prerendering frisst 50-150MB RAM im Hintergrund. Für unseren Autocomplete-Dienst nutzen wir stattdessen schlankes, W3C-natives **ESM Lazy Loading (`import()`)**! |
| 23 | **Array toSorted / toReversed / with** | `typeof Array.prototype.toSorted !== "undefined"` | Chrome 110 / Stable | Kopierende, nicht-destruktive Array-Operationen direkt in JS. | ✅ **Aktiviert (Produktiv)**<br>Schützt Daten-Arrays vor unbeabsichtigter Mutation. |
| 24 | **Object.groupBy()** | `typeof Object.groupBy !== "undefined"` | Chrome 117 / Stable | Nativer Gruppierungs-Mechanismus für Daten-Arrays. | ✅ **Aktiviert (Produktiv)**<br>Ersetzt komplexe `reduce()`-Schleifen. |
| 25 | **Promise.withResolvers()** | `typeof Promise.withResolvers !== "undefined"` | Chrome 119 / Stable | Vereinfachte Zuweisung von Resolve/Reject außerhalb des Promise. | ✅ **Aktiviert (Produktiv)**<br>Macht asynchrone Event-Kopplungen extrem elegant. |

---

## 🏛️ Konzept: Geheimer Easter-Egg Entwickler-Bereich

Um diese detaillierten Infos direkt in deiner Web-App abrufbar zu machen, implementieren wir ein **Easter-Egg-Konzept**, das die Einhaltung unserer W3C-Verfassung perfekt wahrt: Es nutzt die native **HTML5 Popover API** zur Darstellung des Overlays, wodurch wir komplexe UI-Modul-Bibliotheken einsparen und mit minimalem JavaScript-Kleber auskommen.

### 📐 Das HTML-Markup (In der Sidebar oder im Fußbereich)
Der Text der Versionsnummer im Fußbereich dient als Klick-Trigger. Das Popover-Element selbst liegt unauffällig am Ende des HTML-Bodys:

```html
<!-- Klick-Trigger im Footer -->
<div class="footer-version">
  <span>DIN-BriefNEO</span>
  <!-- Das ID-Attribut für die JS-Kopplung -->
  <span id="dev-easter-egg" class="version-badge" title="3x schnell klicken für Systemdiagnose">v26.0</span>
</div>

<!-- Das native Popover-Overlay -->
<div id="dev-popover" popover="manual" class="premium-dev-popover">
  <div class="popover-header">
    <h3>🛫 System-Diagnose & W3C-Ready Report</h3>
    <button popovertarget="dev-popover" popovertargetaction="hide" class="close-btn">&times;</button>
  </div>
  <div class="popover-body">
    <p class="diagnostic-meta">
      <strong>Zielplattform:</strong> Chrome 147+ Baseline | 
      <strong>Echtzeit-Status:</strong> <span id="diag-timestamp"></span>
    </p>
    <div class="table-scroll-container">
      <table id="diag-table">
        <thead>
          <tr>
            <th>Feature / API</th>
            <th>Status</th>
            <th>Baseline</th>
            <th>Empfehlung</th>
          </tr>
        </thead>
        <tbody id="diag-results">
          <!-- Wird dynamisch befüllt -->
        </tbody>
      </table>
    </div>
    <div class="popover-footer">
      <span>Entwicklungs-Status: <code>Produktiv aktiv</code></span>
      <button onclick="console.clear(); console.log(''Konsole zurückgesetzt.'');" class="action-btn">Konsole leeren</button>
    </div>
  </div>
</div>
```

### 🎨 Das Styling (Strikte CSS-Kapselung in `floating.css`)
```css
/* Der Trigger als interaktives Element */
.version-badge {
  cursor: pointer;
  user-select: none;
  font-family: monospace;
}

/* Das Popover: Nutzt den nativen :popover-open Zustand */
.premium-dev-popover {
  border: 1px solid var(--border-color);
  background: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#111111, #eeeeee);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  padding: 24px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  margin: auto; /* Perfekt zentriert im Viewport */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Scrollbarer Tabellenbereich */
.table-scroll-container {
  flex: 1;
  overflow-y: auto;
  margin: 16px 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

/* Tabelle stylen */
.premium-dev-popover #diag-table, #diag-table th {
  width: 100%;
  border-collapse: collapse;
  font-family: sans-serif;
  font-size: 0.9rem;
}

.premium-dev-popover #diag-table th, .premium-dev-popover #diag-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.premium-dev-popover #diag-table th {
  background: light-dark(#f4f4f4, #2d2d2d);
  font-weight: bold;
}
```

### ⚡ Die Logik (Ultra-schlanker, performanter JS-Code in `main.js`)
Das JavaScript führt die 25 Diagnosetests im Hintergrund aus, baut die Tabellenzeilen dynamisch auf und verwaltet den 3-Klick-Zustand des Ostereis:

```javascript
(function initDevEasterEgg() {
  const trigger = document.getElementById("dev-easter-egg");
  const popover = document.getElementById("dev-popover");
  
  if (!trigger || !popover) return;
  
  let clickCount = 0;
  let clickTimeout = null;
  
  trigger.addEventListener("click", () => {
    clickCount++;
    
    // Timeout zurücksetzen, um langsame Klicks nicht als Serie zu werten
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => { clickCount = 0; }, 1000);
    
    if (clickCount === 3) {
      clickCount = 0;
      clearTimeout(clickTimeout);
      
      // Live-Diagnose ausführen und Popover öffnen
      runLiveDiagnostics();
      popover.showPopover();
    }
  });
  
  function runLiveDiagnostics() {
    const f = (name, supported, baseline, rec) => ({ name, supported, baseline, rec });
    
    // Die Feature-Liste wird nun automatisch per Compiler (tools/build_healthcheck.js) 
    // aus den `javascript feature-check` Blöcken der ADRs und Guides generiert.
    // Siehe website/js/healthcheck.js für die aggregierte Liste.
    const features = [];
    if (typeof window.DIN_FEATURES !== ''undefined'') {
      features.push(...window.DIN_FEATURES);
    }
    
    // Zeitstempel setzen
    document.getElementById("diag-timestamp").textContent = new Date().toLocaleTimeString();
    
    // Tabellen-Inhalt aufbauen
    const tbody = document.getElementById("diag-results");
    tbody.innerHTML = features.map(feat => {
      const statusIcon = feat.supported ? "🟢 READY" : "🔴 PENDING";
      const statusClass = feat.supported ? "ready" : "pending";
      return `
        <tr>
          <td><strong>${feat.name}</strong></td>
          <td class="status-cell ${statusClass}">${statusIcon}</td>
          <td><code>${feat.baseline}</code></td>
          <td><em>${feat.rec}</em></td>
        </tr>
      `;
    }).join("");
  }
})();
```

---

## 💻 Kopierbares All-In-One F12 Diagnose-Skript (25 Features)

Kopiere diesen erweiterten Block und füge ihn in deine Browser-Konsole ein, um das **vollständige 25-Feature-Ergebnis** direkt auszugeben:

```javascript
/**
 * 🛫 DIN-BriefNEO — High-Integrity Bleeding-Edge Report (v26.1)
 * ──────────────────────────────────────────────────────────────
 * Kopiere diesen Code und führe ihn in deiner F12-Konsole aus.
 */
(function checkBleedingEdgeReadiness() {
  const f = (name, supported, baseline, benefit) => ({ name, supported, baseline, benefit });

  const features = [
    f("Temporal API", typeof globalThis.Temporal !== "undefined", "Chrome 146", "Fehlerfreie Datumsarithmetik & Zeitzonen"),
    f("CSS @property (Typed OM)", typeof CSS !== "undefined" && CSS.supports && CSS.supports("--x: 1mm") && typeof window.CSSPropertyRule !== "undefined", "Chrome 146", "Typisierte Custom Properties für CSS-Transitionen"),
    f("CSS @scope (Isolation)", typeof CSSScopeRule !== "undefined", "Chrome 118", "Native Stil-Kapselung ohne Shadow-DOM-Kopfschmerz"),
    f("CSS if() Logic", typeof CSS !== "undefined" && CSS.supports && CSS.supports("top: if(style(--x: 1): 1px; else: 2px)"), "Chrome 148", "Deklarative logische Weichen direkt im Stylesheet"),
    f("Scroll-State Queries", typeof CSS !== "undefined" && CSS.supports && CSS.supports("container-type: scroll-state"), "Chrome 147", "Container Queries basierend auf dem Scroll-Zustand"),
    f("Native Invokers (commandfor)", "commandfor" in document.createElement("button"), "Chrome 147", "Natives Triggern von Popovers ohne JS-Eventlistener"),
    f("Advanced attr() Typisierung", typeof CSS !== "undefined" && CSS.supports && CSS.supports("width: attr(data-x type(<length>))"), "Chrome 133/149", "Attribute direkt als typisierte CSS-Werte einlesen"),
    f("View Transitions (Scoped)", typeof document.startViewTransition !== "undefined", "Chrome 146", "Flüssige, native Animationswechsel bei Seiten-Transitions"),
    f("CSS contrast-color()", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: contrast-color(white)"), "Chrome 147", "Browser-generierter barrierefreier Textkontrast"),
    f("CSS border-shape", typeof CSS !== "undefined" && CSS.supports && CSS.supports("border-shape: circle"), "Chrome 147", "Nicht-rechteckige Elementgrenzen rein über CSS"),
    f("Math.sumPrecise", typeof Math.sumPrecise !== "undefined", "Chrome 147", "Verlustfreie Gleitkomma-Summierung in JS"),
    f("Sanitizer API (Native)", typeof globalThis.Sanitizer !== "undefined", "Chrome 147", "Browser-nativer XSS-Schutz für dynamische HTML-Strings"),
    f("Element.setHTML()", typeof Element.prototype.setHTML !== "undefined", "Chrome 147", "Sicheres HTML-Einfügen über den nativen Sanitizer"),
    f("CSS calc-size(auto)", typeof CSS !== "undefined" && CSS.supports && CSS.supports("height: calc-size(auto, 100%)"), "Chrome 129", "Verlässliche CSS-Transitionen auf die Höhe ''auto''"),
    f("CSS Anchor Positioning", typeof CSS !== "undefined" && CSS.supports && CSS.supports("anchor-name: --foo"), "Chrome 125", "Natives Verankern von Popovers ohne JS-Berechnungen"),
    f("CSS field-sizing: content", typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing: content"), "Chrome 123", "Automatisch mitwachsende Textfelder ohne JS-Listener"),
    f("CSS light-dark()", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: light-dark(black, white)"), "Chrome 123", "Nativer Hell-/Dunkelmodus ohne JS-Klassenspielereien"),
    f("CSS Relative Color Syntax", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: oklch(from red l c h)"), "Chrome 119", "Farben relativ von Custom-Property-Basen berechnen"),
    f("CSS Scroll-driven Animations", typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: scroll()"), "Chrome 115", "Flüssige, rendering-effiziente Scroll-Animationen"),
    f("CSS Custom State Pseudo-Class", typeof CSS !== "undefined" && CSS.supports && CSS.supports("selector(:state(--foo))"), "Chrome 125", "Custom Elements direkt über native Pseudo-Klassen stylen"),
    f("Navigation API", typeof globalThis.navigation !== "undefined", "Chrome 102", "Ersetzt die fehleranfällige History API im Single-Page-Routing"),
    f("Speculation Rules API", typeof HTMLScriptElement !== "undefined" && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules"), "Chrome 109", "Nicht empfohlen (Verbraucht massive RAM/CPU-Ressourcen im Hintergrund)"),
    f("Array.prototype.toSorted", typeof Array.prototype.toSorted !== "undefined", "Chrome 110", "Mutationsfreie, kopierende Array-Sortierung in JS"),
    f("Object.groupBy()", typeof Object.groupBy !== "undefined", "Chrome 117", "Natives Gruppieren von Daten-Arrays ohne reduce-Kopfstände"),
    f("Promise.withResolvers()", typeof Promise.withResolvers !== "undefined", "Chrome 119", "Promise-Auflösungen von außerhalb der Instanziierung steuern")
  ];

  let timestamp = new Date().toISOString();
  try {
    if (typeof globalThis.Temporal !== "undefined") {
      timestamp = Temporal.Now.plainDateTimeISO().toString();
    }
  } catch (e) {}

  const header =
    `# 🛫 DIN-BriefNEO — Bleeding-Edge W3C Diagnostics\n` +
    `## Live-Diagnose: ${timestamp}\n\n` +
    `| Nr. | Feature / API | Status | Baseline | Architektur-Nutzen (Soll) |\n` +
    `| :--- | :--- | :--- | :--- | :--- |\n`;

  const rows = features
    .map((feat, i) => {
      const icon = feat.supported ? "✅ **READY**" : "⏳ *PENDING*";
      return `| ${(i+1).toString().padStart(2)} | ${feat.name.padEnd(30)} | ${icon.padEnd(12)} | ${feat.baseline.padEnd(14)} | ${feat.benefit} |`;
    })
    .join("\n");

  const footer = `\n\n---\n**Diagnose abgeschlossen.** Dein Chrome 148+ macht dich zum Web-Entwickler der Zukunft.`;

  console.clear();
  console.log(header + rows + footer);
})();
```

---

## 🔗 Verwandte Dokumente
*   ⚖️ **[[MASTER-DO-DONT-DEPRECATED|MASTER-DO-DONT-DEPRECATED.md]]:** Unser unumstößliches Gesetzbuch für technologische Verbote.
*   📚 **[[longevity-guidelines|longevity-guidelines.md]]:** Die W3C-Verfassung von DIN-BriefNEO.
*   🧭 **[[MODERNIZATION-GUIDE|MODERNIZATION-GUIDE.md]]:** Strategische Einschätzungen zu künftigen Technologiewechseln.
*   📄 **[[spec|spec.md]]:** System-Spezifikation für die Baseline-Features.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DEV-INFO.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DEV-INFO.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DEV-INFO.md'), 'dev-tools');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DEV-INFO.md'), 'feature-detection');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DEV-INFO.md'), 'chrome-baseline');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DEV-INFO.md'), 'diagnostics');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DEV-INFO.md'), 'easter-egg');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/DOCUMENTATION-MAP.md',
  'Dokumenten-Landkarte & Wegweiser',
  'active',
  '# Dokumenten-Landkarte & Wegweiser

Um das Projekt übersichtlich und hochgradig transparent zu halten, ist die Dokumentation in modular verlinkte Single Sources of Truth (SSoTs) gegliedert.

## 🏛️ Philosophie & Gesetzgebung
* **[Longevity Guidelines](../00-foundation/longevity-guidelines.md):** Die unverrückbare "Verfassung" für Wartungsfreiheit (Zero-Dependency, 100% Offline-Autarkie).
* **[Master Lawbook](../00-foundation/Immutable-Law-Catalog.md):** Die zentrale Referenz für alle technologischen Entscheidungen, Verbote und Ersatzstrategien.
* **[AGENTS.md](../../../AGENTS.md):** Bindender Vertrag für alle KI-Agenten (Reconciliation, 100% Fitness, Logging).
* **[DEV-INFO.md](DEV-INFO.md):** Entwicklerbereich & Feature-Prüfungs-Matrix.

## 🗺️ Status, Spezifikationen & Guides
* **[Spezifikation (spec.md)](../00-foundation/spec.md):** Die Kernanforderungen der Features und Backlog.
* **[No-Scroll Techniken](../20-implementation/Guides/no-scroll-techniques.md):** Anleitung für Viewport-Perfect Layouts.
* **[Testing Guide](../20-implementation/testing-guide.md):** Interaktives QA-Protokoll und Testfälle.
* **[LLM-First Datenbank-Guide (README-DB.md)](../40-tooling/README-DB.md):** Spezifikation der SQLite-DB und MCP-Architektur.

## 🏗️ Architektur-Entscheidungen (ADRs)
Alle grundlegenden Design-Entscheidungen sind thematisch im Ordner **[ADR/](../10-architecture/ADR/)** dokumentiert:
* **[ADR-HTML](../10-architecture/ADR/ADR-HTML.md):** Custom Elements, Popover API, `contenteditable`.
* **[ADR-CSS](../10-architecture/ADR/ADR-CSS.md):** Proportionaler Zoom, Container Queries, `light-dark()`.
* **[ADR-JS](../10-architecture/ADR/ADR-JS.md):** JavaScript-Reglementierung, Selection API.
* **[ADR-API](../10-architecture/ADR/ADR-API.md):** External Services & APIs (Geoapify, Zippopotam & Header Security).
* **[ADR-DATA-PERSISTENCE](../10-architecture/ADR/ADR-DATA-PERSISTENCE.md):** Lokale Speicherstrategien.

## 📦 Implementierungsdetails
* **[SQLite-Vec Integration](../20-implementation/implementation/sqlite-vec.md):** Plan für Vektor-Suche.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DOCUMENTATION-MAP.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/DOCUMENTATION-MAP.md'), 'map');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/FEATURE-INVENTORY.md',
  'Feature-Bestandsaufnahme: FEATURE-INVENTORY.md',
  'active',
  '# Feature-Bestandsaufnahme: FEATURE-INVENTORY.md

Dieses Dokument bietet eine vollständige, tabellarische Bestandsaufnahme aller im Refactored Baseline-Prototyp von **DIN-BriefNEO** fertig implementierten Features, geordnet nach Funktionskategorien.

---

## 📊 Feature-Inventar (Baseline-Stand)

| Kategorie | Feature / Technik | Verwendete APIs / Techniken | Status | Hinweise / Modernisierungspotenzial |
| :--- | :--- | :--- | :--- | :--- |
| **Layout & CSS** | Proportionaler CSS-Zoom | `height: 94vh`, `aspect-ratio: 210/297`, `container-type: size`, CSS units `cqw`/`cqh` | **Implementiert** | Keine JS-ResizeObserver nötig. Vollkommen flüssiges Skalieren auf allen Displays. |
| **Layout & CSS** | Absolute Viewport-Sperre | CSS `overflow: hidden` auf `html` & `body` | **Implementiert** | Verhindert native Scrollbalken für echtes App-Shell-Erlebnis. |
| **Layout & CSS** | Layout-Modus A/B Toggler | CSS-Klassen `.form-a` und `.form-b` auf `#app-shell` gekoppelt mit relativen Positionen | **Implementiert** | Wird per Knopfdruck in der Sidebar getoggelt und speichert Einstellungen. |
| **Farben & Themes** | Natives Theme-Umschalten | CSS `light-dark()`, `@media (prefers-color-scheme)`, `style.colorScheme` | **Implementiert** | Umschaltbar über Sidebar (Hell, Dunkel, Auto). JS manipuliert nur das Attribut. |
| **Farben & Themes** | OKLCH Farb-Harmonisierung | CSS `oklch()` Farbdefinitionen in `variables.css` | **Implementiert** | Extrem glatte Farbverläufe und hervorragende Kontraststufen. |
| **Text & Format** | Strikter Plaintext-Schutz | `contenteditable="plaintext-only"` auf Metadaten-Feldern | **Implementiert** | Verhindert das Einfügen von HTML-Müll nativ auf Browserebene (Chrome 148+). |
| **Text & Format** | Formatierbarer Brieftext | `contenteditable="true"` auf `#brieftext` | **Implementiert** | Ermöglicht Inline-Stile (Fett, Unterstrichen, Blockquote) im Briefkern. |
| **Text & Format** | WhatsApp-Style Popover Toolbar | `popover="manual"`, CSS Anchor Positioning | **Implementiert** | Erscheint nativ im Top-Layer direkt an der Textselektion verankert. Viewport-Ausweichmanöver werden rein CSS-basiert gesteuert. |
| **Text & Format** | Sicherer Plaintext-Paste-Filter | Event-Handler `paste` & `drop` auf `#brieftext` mit `clipboardData.getData(''text/plain'')` | **Implementiert** | Bereinigt eingefügten Text bedingungslos von Word- & Web-HTML-Resten. |
| **UI-Komponenten** | Toast-Notification Queue | `popover="manual"`, JS `toastQueue` Stack, CSS `@keyframes` | **Implementiert** | Stapelt Toasts nacheinander ab. JS Safety-Net (3.200ms) verhindert Blockierung im Energiesparmodus. |
| **Persistenz** | persistent Auto-Save | `localStorage` API, serialisiertes JSON in `din_draft_current` | **Implementiert** | Sichert jeden Tastendruck sofort lokal und lädt Entwurf beim Systemstart. |
| **Schriftarten** | System-Font Toggler | Deklarierte CSS-Stapel `.font-stack-sans`, `.serif`, `.mono` | **Implementiert** | Umschaltbar über Segmented Control in der Sidebar. |
| **Schriftarten** | Offline WOFF2-Uploader | FileReader API, Base64-Injektion in `@font-face` im Head | **Implementiert** | Erlaubt Offline-Uploads eigener Schriften (< 60 KB). Speichert Base64 persistent im LocalStorage. |
| **Externe APIs** | Dual-Provider Autocomplete | Asynchrones `fetch()`, Signal-Aborting, UI switches | **Implementiert** | Umschaltung Photon (Komoot/OSM) keyless vs. Geoapify Premium (API-Key über Header `X-Api-Key`). |
| **Externe APIs** | Zippopotam PLZ-Lookup | Asynchrones `fetch()` auf Zippopotam API bei 5-stelliger PLZ | **Implementiert** | Vervollständigt den Ortsnamen im Feld `#empfaenger-ort` im Hintergrund. |
| **Externe APIs** | Proximity Biasing | PLZ-Extraktion auf `#absender`, caching und Koordinaten-Injektion | **Implementiert** | Priorisiert Autocomplete-Ergebnisse im Umkreis des Absenders (+100km). |
| **Barrierefreiheit** | A11y Status-Feedback | HTML `aria-pressed` & `aria-hidden` | **Implementiert** | Gibt den Aktivitätszustand der Toolbar barrierefrei an Screenreader weiter. |
| **Druck / Export** | Druck-Souveränität | CSS `@media print` Stylesheets | **Implementiert** | Blendet Guides & Sidebar aus, erzwingt reinweißes A4-Druckbild auf Papier. |

---

## 🔗 Verweise
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die verbotenen Praktiken dieser Features.
*   Siehe [[ADR-TECH-STACK|ADR-TECH-STACK.md]] für die detaillierten Erläuterungen der Webtechniken.
*   Siehe [[spec|spec.md]] für die ursprünglichen Baseline-Anforderungen.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/FEATURE-INVENTORY.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/FEATURE-INVENTORY.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/FEATURE-INVENTORY.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/Feature-Matrix.md',
  'Logische Gruppen — Feature-Matrix (Platinum Master)',
  'active',
  '# Logische Gruppen — Feature-Matrix (Platinum Master)

> [!IMPORTANT]
> **Nächster Sprint:** Seitenumbrüche (#58) und DIN-Overlay (#57) sind priorisiert. Das @din-briefneo/core-team überwacht die Compliance.

> [!TIP]
> Alle Issues sind mit GitHub-Labels versehen. Filtere nach `group:geometry` für Geometrie-spezifische Aufgaben.

Diese Matrix definiert den aktuellen Funktionsumfang von DIN-BriefNEO und die Roadmap für die kommenden Platinum-Sessionen.

---

## 🎯 Platinum Sprint Q2 2026 (Current Focus)

- [x] Variable-First Form A/B Switching (#55)
- [x] Refactor Fold Marks to 4mm Standard (#54)
- [x] CSS Capability Matrix & Platinum Glossary (v4.8.0)
- [x] 3D-Carousel & Toast Animation System
- [ ] Finalize Address-Autocomplete integration (#42)
- [ ] Integrate DIN-Referenz-SVG Overlay (#57)
- [ ] Implement CMA-Sensor for Page Breaks (#58)

---

## 📌 Quick Links

| Bereich                    | Link                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| 🗺️ **Roadmap**             | [GitHub Projects](https://github.com/din-briefneo/din-briefneo/projects)                            |
| 🐛 **Bug melden**          | [New Issue](https://github.com/din-briefneo/din-briefneo/issues/new?template=bug_report.yml)        |
| ✨ **Feature vorschlagen** | [New Feature](https://github.com/din-briefneo/din-briefneo/issues/new?template=feature_request.yml) |
| 📊 **Milestones**          | [Milestones](https://github.com/din-briefneo/din-briefneo/milestones)                               |

---

## 🚦 Projekt-Status

![Progress](https://img.shields.io/badge/Overall_Progress-76%25-blue)
![Completed](https://img.shields.io/badge/Completed-26_of_34-green)
![Open](https://img.shields.io/badge/Open-8-red)
![Platinum](https://img.shields.io/badge/Platinum_Session-2026-gold)

---

## Gruppe 1: Identität & Adress-Intelligenz

| Funktion                | Beschreibung                                    | Status                                                  | Upgrade-Potenzial                           | 🔗 Issue / PR                                                 |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| **Adress-Autocomplete** | API-Anbindung für schnelle Empfänger-Eingabe    | ✅ Aktiv | Geoapify Premium – aktuell Photon (OSM)     | [#42](https://github.com/din-briefneo/din-briefneo/issues/42) |
| **Adress-Validierung**  | Prüfung der 6-Zeilen-Regel nach DIN 5008        | ✅ Aktiv | Länder-spezifische PLZ-Validierung          | [#43](https://github.com/din-briefneo/din-briefneo/issues/43) |
| **Branding-Atome**      | Native Unterstützung für Logo und Wasserzeichen | ✅ Aktiv | Base64-Optimierung – localStorage-Effizienz | [#44](https://github.com/din-briefneo/din-briefneo/issues/44) |
| **Empfänger-Parser**    | Automatisches Erkennen von Geschlecht/Titeln    | ✅ Aktiv | Firmen-Erkennung – "GmbH/AG" Erkennung      | [#45](https://github.com/din-briefneo/din-briefneo/issues/45) |
| **Profil-Management**   | Granulare Speicherung von Kontakt- & Bankdaten  | ✅ Aktiv | Mehrere Profile – Privat/Büro Wechsel       | [#46](https://github.com/din-briefneo/din-briefneo/issues/46) |
| **Rücksendezeile**      | Automatische Generierung der Kleinstzeile       | ✅ Aktiv | Internationales Format – c/o Anpassungen    | [#47](https://github.com/din-briefneo/din-briefneo/issues/47) |

---

## Gruppe 2: Inhalts-Engine & WYSIWYG

| Funktion                | Beschreibung                                 | Status                                                  | Upgrade-Potenzial                        | 🔗 Issue / PR                                                 |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Ghost-Mirror**        | Echtzeit-Markdown-Vorschau ohne Verschiebung | ✅ Aktiv | Syntax-Highlighting für Markdown-Marker  | [#48](https://github.com/din-briefneo/din-briefneo/issues/48) |
| **Native Sanitization** | XSS-Schutz via Browser-native Sanitizer API  | ✅ Aktiv | CSP-Header – Trusted Types Integration   | [#49](https://github.com/din-briefneo/din-briefneo/issues/49) |
| **Plaintext-Only**      | Striktes Plaintext-Handling in allen Feldern | ✅ Aktiv | Paste-Filter mit Whitelist für `<br>`    | [#50](https://github.com/din-briefneo/din-briefneo/issues/50) |
| **Salutation Engine**   | Automatische Generierung der DIN-Anrede      | ✅ Aktiv | Firmen-Anrede – "Damen und Herren" Logik | [#51](https://github.com/din-briefneo/din-briefneo/issues/51) |
| **Smart Deadlines**     | Kontextsensitive Termin-Vorschläge           | ✅ Aktiv | Feiertags-API – Regionale Prüfung        | [#52](https://github.com/din-briefneo/din-briefneo/issues/52) |
| **Styling Buttons**     | Toolbar für Fett, Unterstrichen, Zitate      | ✅ Aktiv | Keyboard Shortcuts – Strg+B/I/U          | [#53](https://github.com/din-briefneo/din-briefneo/issues/53) |
| **Ghost-Text Anrede**   | Platzhalter via `data-salutation`            | ✅ Aktiv | Individuelle Vorschläge pro Kontakt-Typ  | [#71](https://github.com/din-briefneo/din-briefneo/issues/71) |

---

## Gruppe 3: Geometrie & Compliance

| Funktion               | Beschreibung                                   | Status                                                  | Upgrade-Potenzial                     | 🔗 Issue / PR                                                 |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| **Faltmarken**         | Präzise Positionierung nach DIN 5008           | ✅ Aktiv | Toggle für Hilfslinien in der Sidebar | [#54](https://github.com/din-briefneo/din-briefneo/issues/54) |
| **Form A/B Switch**    | Mechanische Umschaltung der Kopfhöhe via CSS   | ✅ Aktiv | Persistenz via LocalStorage           | [#55](https://github.com/din-briefneo/din-briefneo/issues/55) |
| **IMR 4.0 Atome**      | Alle 45 DIN-Felder als eigenständige Objekte   | ✅ Aktiv | IMR-Catalog Generator für Agenten     | [#56](https://github.com/din-briefneo/din-briefneo/issues/56) |
| **Layout-Guides**      | Visuelle Hilfslinien zur Ausrichtungskontrolle | ✅ Aktiv | DIN-Referenz-SVG Overlay              | [#57](https://github.com/din-briefneo/din-briefneo/issues/57) |
| **3D-Carousel**        | Native CSS-Variablen Transformation           | ✅ Aktiv | Hardware-Beschleunigung optimiert     | [#72](https://github.com/din-briefneo/din-briefneo/issues/72) |
| **Form C Layout**      | Flexbox-basiertes gestapeltes Layout           | ✅ Aktiv | Responsive Breakpoints für Mobile     | [#73](https://github.com/din-briefneo/din-briefneo/issues/73) |
| **Footer Auto-Hide**   | Leere Spalten via CSS ausblenden               | ✅ Aktiv | Zero-Layout-Shift Optimierung         | [#74](https://github.com/din-briefneo/din-briefneo/issues/74) |
| **Seitenumbrüche**     | Native Unterstützung für mehrseitige Briefe    | ⏳ Offen | Duplex-Erkennung – Leerseiten-Logik   | [#58](https://github.com/din-briefneo/din-briefneo/issues/58) |

---

## Gruppe 4: Infrastruktur & Daten-IO

| Funktion            | Beschreibung                               | Status                                                  | Upgrade-Potenzial                          | 🔗 Issue / PR                                                 |
| ------------------- | ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| **Flight Recorder** | Telemetrie und Notfall-Wiederherstellung   | ✅ Aktiv | Log-Export als JSON für Bug-Reports        | [#59](https://github.com/din-briefneo/din-briefneo/issues/59) |
| **JSON Data-IO**    | Import/Export des kompletten Briefzustands | ✅ Aktiv | Schema-Validator gegen IMR 4.0             | [#60](https://github.com/din-briefneo/din-briefneo/issues/60) |
| **Print CSS**       | Vektorscharfer PDF-Export via Print-Styles | ✅ Aktiv | PDF-Metadaten – Titel/Autor im PDF         | [#61](https://github.com/din-briefneo/din-briefneo/issues/61) |
| **PWA Standalone**  | Offline-Fähigkeit und Installation als App | ✅ Aktiv | Update-Benachrichtigung via Service Worker | [#62](https://github.com/din-briefneo/din-briefneo/issues/62) |
| **SSoT Constants**  | Zentrale Geometrie-Definition              | ✅ Aktiv | Typed CSS Properties (`@property`)         | [#63](https://github.com/din-briefneo/din-briefneo/issues/63) |
| **Toast-System**    | Pure-CSS Benachrichtigungssystem           | ✅ Aktiv | `@starting-style` für flüssige Entries   | [#75](https://github.com/din-briefneo/din-briefneo/issues/75) |

---

## 🔗 Dokumenten-Navigation

| Issue | Dokument | Zweck |
|-------|----------|-------|
| [#1](https://github.com/grapefruit89/DIN-BriefNEO/issues/1) | IMR 4.0 Registry | Alle 45+ DIN-Tags |
| [#2](https://github.com/grapefruit89/DIN-BriefNEO/issues/2) | Architecture Compliance | Technologie-Leitplanken |
| [#3](https://github.com/grapefruit89/DIN-BriefNEO/issues/3) | Feature Matrix | Projekt-Fortschritt |
| [#4](https://github.com/grapefruit89/DIN-BriefNEO/issues/4) | Salutation Engine | Logik-Dokumentation |
| [#5](https://github.com/grapefruit89/DIN-BriefNEO/issues/5) | CSS Glossar | CSS-Features Referenz |

**Gesamtversion:** 4.8 | **Letzte Sync:** 2026-04-01

---

## 🔗 Verwandte Dokumente (Dataview)

```dataview
TABLE 
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
```


---

## Gruppe 5: Zukunfts-Features (Roadmap 2026/2027)

| Funktion            | Beschreibung                               | Status     | Technologie                   | 🔗 Issue / PR                                                 | Priorität                                                |
| ------------------- | ------------------------------------------ | ---------- | ----------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| **Brief-Archiv**    | IndexedDB für hunderte gespeicherte Briefe | 🔴 Geplant | IndexedDB + Volltextsuche     | [#64](https://github.com/din-briefneo/din-briefneo/issues/64) | ![High](https://img.shields.io/badge/🔴-Hoch-red)        |
| **Serienbrief**     | CSV-Import → Batch-Generierung             | 🔴 Geplant | CSV-Parser + Batch-Logic      | [#65](https://github.com/din-briefneo/din-briefneo/issues/65) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Poststempel**     | Internetmarke via Deutsche Post API        | 🔴 Geplant | Deutsche Post Direkt API      | [#66](https://github.com/din-briefneo/din-briefneo/issues/66) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Fristen-Rechner** | Automatische Berechnung nach BGB           | 🟡 Analyse | Temporal API + Feiertags-API  | [#67](https://github.com/din-briefneo/din-briefneo/issues/67) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Sprachsteuerung** | Diktat via Web Speech API                  | 🔴 Geplant | Web Speech API                | [#68](https://github.com/din-briefneo/din-briefneo/issues/68) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |
| **vCard QR-Code**   | Kontaktdaten als QR im Briefkopf           | 🔴 Geplant | QR-Code Generator             | [#69](https://github.com/din-briefneo/din-briefneo/issues/69) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |
| **Lokale KI**       | Grammatik- und Stilprüfung offline         | 🔴 Geplant | Gemini Nano (Chrome Built-in) | [#70](https://github.com/din-briefneo/din-briefneo/issues/70) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |

---

## 📊 Platinum Fortschritts-Matrix

| Gruppe                             | Gesamt | ✅ Erledigt | ⏳ Offen | Fortschritt                           | Status                                                             |
| ---------------------------------- | ------ | ----------- | -------- | ------------------------------------- | ------------------------------------------------------------------ |
| **Identität & Adress-Intelligenz** | 6      | 6           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Inhalts-Engine & WYSIWYG**       | 7      | 7           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Geometrie & Compliance**         | 8      | 7           | 1        | ![87%](https://progress-bar.dev/87)   | ![In Progress](https://img.shields.io/badge/In_Progress-⚡-yellow) |
| **Infrastruktur & Daten-IO**       | 6      | 6           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Zukunfts-Features**              | 7      | 0           | 7        | ![0%](https://progress-bar.dev/0)     | ![Roadmap](https://img.shields.io/badge/Roadmap-📅-blue)           |
| **GESAMT**                         | **34** | **26**      | **8**    | ![76%](https://progress-bar.dev/76)   | —                                                                  |

---

**Status:** ACTIVE  
**Version:** Platinum Master v4.8  
**Maintainer:** @grapefruit89',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/QUELLEN-UND-LERNGESCHICHTE.md',
  'Quellen & Lerngeschichte',
  'active',
  '# Quellen & Lerngeschichte

Dieses Dokument dokumentiert die Historie und die wichtigsten externen Referenzen, die bei der Entstehung von DIN-Brief NEO (Pure Refactored Edition) geholfen haben. Es ersetzt die eingebetteten Git-Repos im ehemaligen `archiv/`-Ordner.

## 🏛️ Evolution zur Vanilla-JS Architektur

DIN-Brief NEO hat eine lange Reise hinter sich:
- **Frühe Phasen:** Primitive `<textarea>`-basierte UIs, die keine Geometrie-Kontrolle erlaubten.
- **V4.8 Ära:** Viele JavaScript-Module (11+), die zuständigkeitsübergreifend arbeiteten. Externe Abhängigkeiten wie QR-Code Generatoren brachen das Zero-Dependency-Versprechen.
- **Pure Refactored Edition (Jetzt):** Wir haben uns für den **harten Vanilla-JS-Weg** entschieden. Kein React, keine Build-Tools. Die aktuelle Architektur setzt zu 100% auf native Web-Standards:
  - `contenteditable="true"` kombiniert mit der Selection & Range API
  - CSS Layers (`@layer`) und Scoping (`@scope`) für isoliertes Styling
  - Native Popover API
  - Keine externen CDNs. Alles funktioniert lokal unter `file:///` oder einem simplen `localhost:8000`.

---

## 📚 Externe Referenzen

### `din-5008-css`
- **Herkunft:** Externe CSS-Bibliothek für DIN-5008-konformes Layout
- **Was wir gelernt haben:** Wie andere das DIN-5008-Layout in reinem CSS angehen — vor allem Abstände und Zonen. Unser Ansatz ist deutlich präziser und nutzt moderne CSS-Features (`@layer`, `@scope`, Container Queries) statt älterer Hacks.
- **Was wir übernommen haben:** Konzept der festen mm-Abstände als CSS-Custom-Properties — bei uns konsequent umgesetzt, um exakte DIN-Maße zu garantieren.

### `din-5008-css-forked-for-later`
- **Herkunft:** Fork der obigen Bibliothek für frühe Experimente
- **Was wir gelernt haben:** Was passiert, wenn man externe Abhängigkeiten forkt statt selbst zu bauen — Drift, Wartungsaufwand, Versionskonflikte. Das hat unsere Zero-Dependency-Entscheidung final bestätigt.

### `din5008-generator`
- **Herkunft:** Externes Projekt zur dokumentenbasierten DIN-5008-Generierung
- **Was wir gelernt haben:** Generatoransätze (HTML-Template + Daten -> Dokument) funktionieren nicht gut für interaktive Live-Editoren. Bestätigt unseren WYSIWYG-im-Browser-Ansatz.

### `letter`
- **Herkunft:** Einfaches HTML/JS Brief-UI aus der frühen Explorationsphase
- **Was wir gelernt haben:** Primitive `<textarea>`-basierte Letter-UIs verlieren sofort DIN-Geometrie-Kontrolle. Hat den Weg für strukturierte DOM-Manipulation geebnet.

### `GerLaTeXLetter`
- **Herkunft:** LaTeX-basiertes Briefvorlagen-System für deutsche Geschäftsbriefe
- **Was wir gelernt haben:** LaTeX beherrscht DIN 5008 präzise (mm-genaue Satzspiegelkontrolle), ist aber kein Webformat. Hat unsere Überzeugung gestärkt, dass pixelgenaues Layout im Browser möglich ist — ohne LaTeX oder PDF-Umwege.
- **Was wir übernommen haben:** Die Denkweise, Layout-Zonen als absolute mm-Koordinaten zu definieren statt als relative Abstände. *(Detaillierter beschrieben in `docs/20-implementation/Guides/din-5008-precise-layout-lessons.md`)*.

---

## 🗄️ Eigene Projektsnapshots

### `DIN-BriefNEO` (V4.8, Stand ~April 2026)
- **Was es war:** Die komplette alte Codebasis vor dem großen Refactoring — mit 11 JS-Modulen und 6 CSS-Dateien.
- **Warum ersetzt:** Zu viele Zuständigkeiten pro Datei, keine klare Longevity-Strategie, noch kein Fitness-Score-System.
- **Was wir übernommen haben:**
  - Grundprinzip der strukturierten HTML-Elemente
  - Salutation-Engine-Logik als Referenz für die neue `main.js`
  - Die DIN-5008-Referenz-SVGs (`assets/reference-DIN_5008_Form_A.svg` / `Form_B.svg`)
- **Was wir bewusst weggelassen haben:**
  - Externe Bibliotheken (z. B. `qrcode.js`), da sie gegen unser Zero-Dependency-Pakt verstoßen.
  - Komplexe LocalStorage-Archive in separaten Dateien — stattdessen setzen wir auf eine minimalistische Draft-Speicherung.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/QUELLEN-UND-LERNGESCHICHTE.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/QUELLEN-UND-LERNGESCHICHTE.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/QUELLEN-UND-LERNGESCHICHTE.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/QUELLEN-UND-LERNGESCHICHTE.md'), 'history');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/README.md',
  '30-meta README',
  'active',
  '# 30 Meta
Projekt-Kontext, Geschichte und Status.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/README.md'), 'readme');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/README.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/30-meta/ROADMAP.md',
  'Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md',
  'active',
  '# Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md

Dieses Dokument dient als offene Ideensammlung fÃ¼r zukÃ¼nftige Erweiterungen von **DIN-BriefNEO**. Alle EintrÃ¤ge sind **unverbindlich** und befinden sich im Status des reinen Brainstormings oder wurden aufgrund architektonischer HÃ¼rden zurÃ¼ckgestellt. 

---

## ðŸ’¡ Ideensammlung & Brainstorming

### 1. Mehrseitiges Horizontal-Karussell
*   **Beschreibung:** ErmÃ¶glicht das Schreiben von mehrseitigen Briefen, die im Editor horizontal verschoben werden (Karussell-Effekt), um vertikales Scrollen im Viewport komplett zu vermeiden.
*   **Status:** **ZurÃ¼ckgestellt** (Aufgeschoben in Phase 1 / Backlog).
*   **Herausforderung:** Hohe JS-KomplexitÃ¤t bei der Paginierung und automatischen Text-Schnittstelle. Niedrige PrioritÃ¤t, da 95% aller DIN 5008 Briefe auf eine Seite passen.

### 2. Nativer PDF-Export (Client-side)
*   **Beschreibung:** Erzeugung eines echten PDF-Downloads direkt im Browser (z. B. via `pdf-lib` oder `jspdf`), anstatt den System-Druckdialog nutzen zu mÃ¼ssen.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** GrÃ¶ÃŸeres Datenvolumen durch Bibliotheken. Verletzt die W3C-First und Zero-Dependency SÃ¤ulen, da Client-Side PDF-Erzeugung im Browser extrem komplex ist. Bevorzugt bleibt der native, wartungsfreie Druckdialog (`window.print()`) mit optimiertem CSS.

### 3. Google Places API (Adress-Autocomplete Alternative)
*   **Beschreibung:** Einbindung der Google Places API als dritter Adress-Provider in der Sidebar fÃ¼r weltweite Premium-Ergebnisse.
*   **Status:** **ZurÃ¼ckgestellt** (Antipattern).
*   **Herausforderung:** Erfordert zwingend das Laden des Google Maps JS SDKs Ã¼ber CDN (verletzt SÃ¤ule 2 und SÃ¤ule 4) sowie eine Kreditkarte bei der Registrierung. Da Geoapify und Photon kostenfrei und rein REST-basiert Ã¼ber `fetch` laufen, bietet Google Places keinen architektonischen Benefit.

### 4. Erweiterte Formatierungsoptionen im Markdown-Parser
*   **Beschreibung:** Ausbau des `parseMarkdown`-Moduls in `logic.js` zur nativen UnterstÃ¼tzung von geordneten/ungeordneten Listen, Ãœberschriften (`#`, `##`) und Tabellen im Briefkern.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Muss penibel mit dem WhatsApp-Selection-Popover synchronisiert werden, damit sich Formatierungen nicht gegenseitig blockieren.

### 5. Offline-Service-Worker (PWA)
*   **Beschreibung:** Integration eines Service Workers (`sw.js`) zum Caching aller lokalen Assets, um die Anwendung als installierbare Progressive Web App (PWA) auf dem Desktop zu betreiben.
*   **Status:** **ZurÃ¼ckgestellt**.
*   **Herausforderung:** Service Worker setzen zwingend HTTPS voraus. Unter `file:///` werfen sie Browser-Sicherheitsfehler. Da das Ã–ffnen der lokalen `index.html` per Doppelklick auch ohne Service Worker offline perfekt funktioniert (da alle Assets lokal liegen), ist der Nutzen im Vergleich zum Risiko minimal.

### 6. Sprachsteuerung & Diktat (Web Speech API)
*   **Beschreibung:** Integration der nativen `webkitSpeechRecognition`-Schnittstelle in der Sidebar, um Brieftexte per Stimme einzudiktieren.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Web Speech ist derzeit noch plattformspezifisch (funktioniert hervorragend in Chrome/Safari, gar nicht in Firefox). Zudem erfordert es eine aktive Internetverbindung zur Google/Apple-Cloud zur Spracherkennung.

---

## ðŸ”— Verweise
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] zur Vermeidung von CDN- oder Drittanbieter-Bibliotheken bei diesen Ideen.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] fÃ¼r das strikte Verbot von CDN-Verbindungen.

- [ ] **Client-Side AI Integration**: API Key Eingabe via Settings-Modal (gespeichert in localStorage). Direkte Anbindung an OpenAI/Anthropic/Gemini via etch für Text-Expansion, Tonfall-Änderung und Rechtschreibkorrektur.


### 4. LLM-Features in der App (Zauberstab / Roter Faden)
*   **Beschreibung:** API-Keys im LocalStorage speichern und direkt im Dev-Sidebar oder im UI Buttons anbieten, um den Text per Knopfdruck ''frmlich zu formulieren'' oder ''Fllwrter zu entfernen''.
*   **Status:** **Geplant** (Auf Wunsch von Moritz fr zuknftige Diskussion aufgenommen).
*   **Herausforderung:** LLM-Client (OpenAI/Gemini) in Vanilla JS schreiben, ohne dass die Bundle-Size explodiert oder npm-Pakete ntig werden. Sichere Aufbewahrung der API-Keys im Browser.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/ROADMAP.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/ROADMAP.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/ROADMAP.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/ROADMAP.md'), 'roadmap');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/30-meta/ROADMAP.md'), 'future');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/40-tooling/README-DB.md',
  'LLM-First Dokumenten-Datenbank & MCP-Architektur',
  'active',
  '# 🗄️ DIN-BriefNEO — LLM-First Dokumenten-Datenbank & MCP-Architektur

Dieses Dokument spezifiziert die Architektur und Nutzung unserer **LLM-first Dokumenten-Datenbank** (`DIN-Brief_docs.db`). Um KIs (Large Language Models) einen blitzschnellen, strukturierten und token-schonenden Zugriff auf das gesamte Projektwissen zu ermöglichen, kompilieren wir unsere Markdown-Dokumente automatisch in eine relationale SQLite-Datenbank.

Durch die Kopplung mit einem **Model Context Protocol (MCP) Server** kann deine KI über gezielte SQL-Abfragen in Millisekunden genau die benötigten Informationen extrahieren, anstatt riesige Kontextmengen laden zu müssen.

---

## 🏛️ Das Hybrid-Architekturmodell (FTS5 Goldstandard)

Wir trennen strikt zwischen Pflege und Konsum der Dokumentation. Der Kompilierungsprozess läuft vollkommen direkt und abhängigkeitsfrei in Node.js:

```mermaid
flowchart TD
    Human[Mensch / Entwickler] -->|Pflegt .md Dateien| MD_Files[Markdown-Dokumente / ADRs / Guides]
    MD_Files -->|Git Push| GitHub[GitHub Action / CI Pipeline]
    MD_Files -->|Lokales Script| Node_Compiler[build_db.js Compiler]
    Node_Compiler -->|Direkte Erstellung via node:sqlite| SQLite_File[(DIN-Brief_docs.db SQLite Datei)]
    GitHub -->|Automatische Generierung| SQLite_File
    SQLite_File -->|MCP-Server Anbindung| MCP_Bridge[SQLite-MCP-Server]
    MCP_Bridge -->|Gezielte SQL-Abfragen| LLM[KI-Assistent / Claude / Cursor]
```

1. **Master Source of Truth (Markdown):** Alle ADRs, Guides und Spezifikationen werden als menschenlesbare, hervorragend in Git versionierbare `.md`-Dateien gepflegt.
2. **Direkter Node-Compiler (Zero-Dependency):** Über das moderne, in Node.js eingebaute native Modul `node:sqlite` wird die SQLite-Datei `DIN-Brief_docs.db` direkt und performant in einer Transaktion generiert, ohne auf externe Binaries (`sqlite3.exe`) oder schwere npm-Pakete (`better-sqlite3`) angewiesen zu sein.
3. **Schnittstelle (MCP):** Das LLM kommuniziert nicht mit Rohdateien, sondern stellt über standardisierte Werkzeuge des SQLite-MCP-Servers präzise relationale Abfragen an die Datenbank.

---

## 📊 Das Datenbankschema

Die Datenbank `DIN-Brief_docs.db` ist relational normalisiert und gleichzeitig für ultraschnelles Retrieval denormalisiert aufgebaut:

### 1. Tabelle: `documents`
Enthält die Kerninformationen aller Systemdokumente.

*   `id` (INTEGER, Primary Key, Auto-Increment)
*   `path` (TEXT, Unique, Not Null) — Der relative Pfad zum Dokument (z. B. `ADR/ADR-CSS.md`)
*   `title` (TEXT, Not Null) — Der aus dem YAML Frontmatter extrahierte Titel
*   `status` (TEXT) — Der aktuelle Status des Dokuments (z. B. `accepted`, `active`)
*   `content` (TEXT, Not Null) — Der bereinigte Markdown-Inhalt (ohne YAML-Header)
*   `tags` (TEXT) — Alle Schlagworte als leerzeichengetrennter Plaintext (z. B. `''css layout containers''`), benötigt für den FTS5 External Content Sync.

### 2. Tabelle: `document_tags`
Ermöglicht eine 1:n Verknüpfung von Schlagworten für eine hochpräzise relationale Filterung.

*   `document_id` (INTEGER, Foreign Key referencing `documents(id)` on delete cascade)
*   `tag` (TEXT, Not Null) — Das Schlagwort (z. B. `css`, `popover`, `security`)
*   *Composite Primary Key:* `(document_id, tag)`
*   *Sekundärindex:* `idx_document_tags_tag` auf die Spalte `tag` zur Beschleunigung von relationalen Schlagwortabfragen.

### 3. Virtuelle Tabelle: `documents_fts` (Full-Text Search 5)
Die hochoptimierte FTS5-Such-Engine für hybride Volltext- und Schlagwortabfragen.

*   *Engine:* SQLite FTS5 (Volltextsuche)
*   *Spalten:* `content`, `title`, `path`, `tags`
*   *Externe Inhaltstabelle:* Gekoppelt mit `documents` über `content=''documents''` und `content_rowid=''id''`. Dies vermeidet Daten-Redundanz und hält die FTS-Abfragen extrem speichereffizient.
*   *Tokenizer:* `unicode61` (Speziell für deutsche Inhalte optimiert; diakritika-resistent für Umlaute `ä`, `ö`, `ü`, `ß` und frei von englischen Stemming-Verzerrungen).
*   *Prefix-Indizes:* Konfiguriert mit `prefix=''2 3''`, um blitzschnelle Autovervollständigungen und Präfix-Suchen (z. B. `anch*`) zu unterstützen.

#### 🔄 Automatische Synchronisations-Trigger
Die FTS5-Volltexttabelle wird durch drei integrierte SQLite-Trigger vollautomatisch mit der Quelltabelle `documents` synchron gehalten:
*   `tbl_ai` (AFTER INSERT)
*   `tbl_ad` (AFTER DELETE)
*   `tbl_au` (AFTER UPDATE)

---

## ⚡ Abfrage-Beispiele & Views (SQL-Leitfaden für KIs)

KIs können direkt auf vordefinierte, hochperformante Views zugreifen, die komplexe Abfragen kapseln:

### 1. View: `v_accepted_adrs`
Gibt alle akzeptierten ADRs mit ihren Tags zurück (Filterung in $O(1)$ über das `documents.tags` Feld):
```sql
SELECT id, path, title, status, tags FROM v_accepted_adrs;
```

### 2. View: `v_active_docs`
Gibt alle aktiven Systemdokumente zurück (perfekt für das globale RAG-Retrieval):
```sql
SELECT id, path, title, status, tags FROM v_active_docs;
```

### 3. View: `v_document_index`
Ein schlanker Index aller erfassten Dokumente:
```sql
SELECT id, path, title, status, tags FROM v_document_index;
```

### 4. Hybride Volltext- & Schlagwortsuche via FTS5 MATCH
Findet alle Dokumente mit dem Tag `css`, die das Wort `popover` im Inhalt oder Titel besitzen:
```sql
SELECT title, path 
FROM documents_fts 
WHERE documents_fts MATCH ''tags:css AND popover'';
```

---

## ⚙️ Generierung & Kompilierung

### A. Lokale Generierung (Entwickler-Befehl)
Führe im Hauptverzeichnis des Projekts einfach folgendes PowerShell-Skript aus, um die Datenbank aus den aktuellen Markdown-Dateien zu kompilieren:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\morit\Documents\Update_DIN-Brief_DB.ps1
```

Das Skript löscht die alte DB-Datei zur Konsistenzsicherung und kompiliert die neue `DIN-Brief_docs.db` direkt über Node.js.

---

## 🔗 Verweise
*   ⚖️ **[Immutable Law Catalog](../00-foundation/Immutable-Law-Catalog.md):** Unser unumstößliches Gesetzbuch für technologische Verbote.
*   📚 **[longevity-guidelines.md](../00-foundation/longevity-guidelines.md):** Die übergeordnete W3C-Verfassung.
*   🛠️ **[DEV-INFO.md](../30-meta/DEV-INFO.md):** Unsere 25-Feature Diagnose- und Feature-Erkennungs-Matrix.


## 🔍 Aktueller Status der Vektor-Suche (Semantic Search)
Es ist geplant, die reine FTS5-Volltextsuche durch eine **Hybrid Search (Volltext + semantische Suche)** zu ersetzen.
Dazu soll die Erweiterung `sqlite-vec` integriert werden, welche die Speicherung von Embeddings und Vektor-Distanzen nativ in SQLite erlaubt.
Der detaillierte Implementierungsplan liegt unter: **[docs/implementation/sqlite-vec.md](../20-implementation/implementation/sqlite-vec.md)**.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/40-tooling/README-DB.md'), 'database');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/40-tooling/README-DB.md'), 'sqlite');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/40-tooling/README-DB.md'), 'mcp');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/40-tooling/README-DB.md'), 'llm-first');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/40-tooling/README-DB.md'), 'tooling');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/40-tooling/README.md',
  '40-tooling README',
  'active',
  '# 40 Tooling
Dokumentation der Build- und Infrastruktur-Scripte.
Hinweis: Diese Schicht ist noch im Aufbau.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/40-tooling/README.md'), 'readme');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/40-tooling/README.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/40-tooling/Wiki-Bundler.md',
  'Wiki Bundle & Context Pack Template',
  'active',
  '# 📚 OmniTraceability Wiki Bundle

> **Generiert am:** {{ GENERATION_DATE }}
> **Scope:** {{ BUNDLE_SCOPE }} (Z.B. "Full Project" oder "Feature: Geoapify")

## 🤖 System Prompt (LLM Anweisungen)

Du bist ein KI-Agent, der im Projekt **DIN-Brief Neo** arbeitet.
Dieses Dokument enthält den gebündelten Architektur- und Implementierungskontext für deinen zugewiesenen Scope.

**Wichtigste Regeln:**
1. Beachte strikt die Vorgaben in `AGENTS.md` (Branchless Workflow, 100% Fitness Score, Logging).
2. Nutze Vanilla CSS und Vanilla JS (keine Build-Tools im Frontend, kein Tailwind, kein React).
3. Halte dich an das KISS-Prinzip (Keep It Simple, Stupid).
4. Wenn du Quellcode schreibst, verknüpfe ihn durch Header-Tags `/* @adr [[ADR-Name]] {FunctionName} */` mit den unten aufgeführten Architektur-Dokumenten.

---

## 🗺️ OmniTraceability Matrix (Auszug)

Die folgende Matrix zeigt, wie der Code mit der Dokumentation verknüpft ist. 

{{ TRACEABILITY_MATRIX_CONTENT }}

---

## 🏛️ Architektur-Entscheidungen (ADRs)

{{ ADR_CONTENT_CHUNKS }}

---

## 📖 Implementierungs-Guides

{{ GUIDE_CONTENT_CHUNKS }}

---

## 🛠️ Code Snippets & Referenzen

{{ RELEVANT_CODE_SNIPPETS }}

---
*End of Wiki Bundle*',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW.md',
  'Hybrid Spec-Driven Workflow (spec-kit ideas + Reconciliation)',
  'active',
  '# Hybrid Spec-Driven + Reconciliation Workflow

This combines the best of GitHub spec-kit (clear phased development with AI) with our strengths (Reconciliation Loop, Fitness Score 100%, layered antipatterns, audit trail via log_session, Generalisierungs-Pflicht).

## Why Hybrid?

- spec-kit strength: Simple, agent-friendly phases (Constitution → Spec → Plan → Tasks → Implement).
- Our strength: Mandatory quality gates (Pre/Post Build with Evolutionary Fitness Score), Generalisierungs-Pflicht for boilerplate extraction, full KI audit (log_session.js), antifragile antipattern layering.

We keep .specify/ for agent-specific artifacts (easy to extract for llm_boilerplate) and specs/ for numbered, traceable features.

## Core Principles (from AGENTS.md)

- Build **before** and **after** every relevant change.
- Fitness Score **MUST** be 100%.
- Log every action.
- Check Generalisierbarkeit for every solution and propose extraction to llm_boilerplate.

## The Hybrid Phases + Light / Full Mode

**Wichtig:** Es gibt einen gestuften Workflow, um Komplexität und Fehleranfälligkeit zu senken (siehe AGENTS.md Abschnitt "Light Mode vs Full Mode").

- **Light Mode** (Standard für die meisten Änderungen): Nur die Kernschritte Pre-Build → Änderung → Post-Build (100%) → Loggen + kurzer Generalisierungs-Vermerk im DECISION-LOG.md. Kein zwingendes spec.md.

- **Full Mode** (wichtige Features, Architektur, boilerplate-relevante Arbeit): Der komplette unten beschriebene Prozess mit spec/plan/tasks + explizitem Generalisierungs-Check.

1. **Constitution** (setup / major updates)
   - Location: `.specify/constitution.md` (or reference to `constitution.md` + `MASTER-DO-DONT-DEPRECATED.md`).
   - Defines project philosophy, longevity rules, what must be respected (no frameworks, DIN 5008, etc.).
   - Agent must read this first.
   - Update only with Pre/Post build + log + DECISION-LOG entry.

2. **Specify** (feature or major change – Full Mode)
   - Create `specs/NNN-short-name/spec.md` (numbered for history and traceability, like spec-kit).
   - Content: Requirements, acceptance criteria, context, links to existing ADRs/Guides.
   - Use templates from `.specify/templates/spec.md`.
   - Pre-build, then create the spec file.
   - Document Generalisierbarkeit potential here (Full Mode: ausführlich).

3. **Plan** (Full Mode)
   - In the same `specs/NNN-.../plan.md` or linked ADR.
   - Technical design, architecture decisions, which layers of antipatterns are affected.
   - Identify what can be generalized to llm_boilerplate.
   - Pre/Post build required if code/docs change.

4. **Tasks** (Full Mode)
   - `specs/NNN-.../tasks.md` (checklist, like spec-kit).
   - Break down into small, verifiable steps.
   - Each task should note if it touches generic (base/web) vs project-specific.

5. **Implement**
   - Code / docs changes.
   - Strictly follow constitution, MASTER-DO-DONT, AGENTS.md, and the spec (if Full Mode).
   - Use layered antipatterns (base/web/project.json) for rules.
   - Light Mode: Direkt nach kurzer Beschreibung im DECISION-LOG.

6. **Reconcile & Verify** (mandatory – immer)
   - **Always** run `node tools/build_db.js` (or the wrapper) **before** starting implementation and **after** completing.
   - Must achieve **EVOLUTIONARY FITNESS SCORE: 100%**.
   - Fix all critical/high violations.
   - Log the entire session/action with `log_session.js` (include what was generalized).

7. **Generalize & Extract** (Testballon duty)
   - For every completed feature: Explicitly decide and document:
     - Stays project-specific (in project.json or website/)?
     - Can move to base/web in antipatterns?
     - Can become a generic tool / template / guide for llm_boilerplate?
   - Light Mode: 1-2 Sätze im DECISION-LOG.
   - Full Mode: Ausführlich im spec.md + Vorschläge.
   - Propose concrete pull/extraction steps.
   - Update MIGRATION-ROADMAP-TO-BOILERPLATE.md or DECISION-LOG.md.

## Folder Usage for Easy Extraction

- `.specify/` : Agent instructions, constitution, templates, memory. Highly extractable to llm_boilerplate.
- `specs/` : Numbered feature work. Mostly project-specific, but plans can note generalizable parts.
- `tools/antipatterns/{base,web,project}.json` : The layered rules are the #1 extraction target.
- `tools/` (reconciliation, build_db, log_session, etc.): Generic by design.
- `website/` : Pure application code – do not extract.
- `constitution.md` / `MASTER-DO-DONT-DEPRECATED.md` : Core philosophy – parts can be generalized.

## How to Start a New Feature (Agent Instructions)

1. Read `.specify/constitution.md`, AGENTS.md, and relevant specs/ADRs.
2. Pre-build.
3. Create `specs/NNN-new-thing/spec.md` (copy template if available).
4. Create plan and tasks.
5. Implement + reconcile (Post-build 100%).
6. Log.
7. Document generalization proposal.

This keeps the lightweight, structured flow from spec-kit while enforcing our quality and generalizability gates.

See also:
- AGENTS.md (Core Rules and Logging)
- MIGRATION-ROADMAP-TO-BOILERPLATE.md
- aktueller_arbeitsordner/constitution.md',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'workflow');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'spec-driven');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'reconciliation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'agents');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'generalisierbarkeit');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/90-policy/README.md',
  '90-policy README',
  'active',
  '# 90 Policy
Globale Regeln, Workflows und Strukturvorgaben.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/90-policy/README.md'), 'readme');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/90-policy/README.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/index.md',
  'DIN-BriefNEO OmniTraceability',
  'active',
  '# 🚀 DIN-BriefNEO: OmniTraceability Hub

Willkommen in der Single Source of Truth (SSoT) des DIN-BriefNEO Projekts. 
Dieses Wiki dient als maschinenlesbarer Navigator durch die Architektur, Spezifikationen und Entscheidungen des Projekts. Es ist das Fundament für unsere kompromisslose Traceability und die Schnittstelle zwischen Mensch (Obsidian) und Maschine (LLM & SQLite).

## 🧭 Kernnavigation

### Das Fundament
- **[[OmniTraceability]]**: Die Systemarchitektur der lückenlosen Nachverfolgbarkeit. Hier erfährst du, wie der Lebenszyklus unserer Software funktioniert und wie du das System langfristig wartest.
- **[[Function-Traceability]]**: Das automatisierte Code-zu-Dokumentation Mapping. Die Matrix, die unsere Code-Base zusammenhält.

### Die Umsetzung
- **[Architektur-Entscheidungen (ADRs)](10-architecture/ADR/ADR-ÜBERSICHT.md)**: Alle verbindlichen Architektur-Regeln. Das "Warum".
- **[Guides & Manuals](20-implementation/Guides/GUIDE-TEMPLATE.md)**: Technische Leitfäden zur Umsetzung (z.B. CSS, Geometry). Das "Wie".
- **[[core/spec]]**: Die unumstößlichen funktionalen und fachlichen Anforderungen an die DIN 5008. Das "Was".

---

## 🧠 Für KI-Agenten (System-Prompt)

> [!TIP]
> Dieses System nutzt bidirektionale Traceability. Es ist dir als KI-Agent **strikt untersagt**, Feature-Branches zu erstellen. Wir arbeiten **branchless auf `main`**.
> 
> Wenn du Code-Dateien in `website/` modifizierst, konsultiere **zwingend** die in der Datei verlinkten ADRs und Guides über die `[[Wikilinks]]` in den Header-Kommentaren. Das Frontmatter dieses Wikis wird nächtlich in eine SQLite-Vektordatenbank kompiliert und muss streng formatiert bleiben. Niemals das Frontmatter-Schema verändern!',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'README.md',
  'DIN-BriefNEO: Pure Refactored Edition',
  'active',
  '# ✉️ DIN-BriefNEO: Pure Refactored Edition

Willkommen im offiziellen Arbeitsverzeichnis von **DIN-BriefNEO (Pure Refactored Edition)**. 

Dieses Projekt ist eine datenschutzkonforme, **100% offline-fähige** und wartungsfreie Web-Applikation zur pixelperfekten Erstellung normkonformer Briefe nach dem offiziellen deutschen Standard **DIN 5008 (Form A und Form B)**.

---

## ⚡ Quick Start

Das Projekt nutzt modernen, nativen W3C-Code (ES-Modules und CSS Layers). Aufgrund von Browser-Sicherheitsrichtlinien (CORS) muss die App zwingend über einen lokalen Webserver gestartet werden, anstatt per `file://`-Protokoll.

1. **App starten (Nutzer):** Ein Doppelklick auf die `start.bat` im Hauptverzeichnis reicht aus. Es startet ein lokaler Python-Server (auf Port 8000) im Hintergrund und öffnet die App automatisch im Browser.
2. **Entwickler-Check (Agenten):** Führe das Skript `.\start.ps1` aus.
   - Dieses Skript prüft den Code (Reconciliation Loop) und stellt sicher, dass der **Fitness Score bei 100%** liegt.

---

## 🏛️ Die Philosophie (Wartungsfreiheit auf Lebenszeit)

Dieses Projekt bricht radikal mit der Kurzlebigkeit moderner Web-Frameworks. Wir vertrauen zu 100% auf native, standardisierte W3C/WHATWG-Schnittstellen. Unser Ziel ist eine **Überlebensspanne von vielen Jahren ohne eine einzige Zeile Wartungsaufwand**.

- 🚫 **Keine Frameworks:** Weder React, noch Vue, noch Svelte.
- 🚫 **Keine Compiler:** Weder Webpack, noch Babel, noch Sass.
- 🚫 **Keine externen Abhängigkeiten:** Keine CDNs, keine Google Fonts, vollständige Offline-Autarkie (Privacy-first).
- ✅ **Native Standards:** Wir nutzen Container Queries, Popover API, CSS `light-dark()` und die Selection/Range API.

---

## 🗺️ Dokumentation

Das Projekt ist extrem detailliert dokumentiert, um KI-Agenten und Entwicklern einen perfekten Einstieg zu bieten.

👉 **Zur vollständigen [Dokumenten-Landkarte (DOCUMENTATION-MAP.md)](docs/30-meta/DOCUMENTATION-MAP.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

---

## 🤖 KI-Entwicklung (Light Mode vs. Full Mode)

Um Komplexität zu minimieren, nutzen KI-Agenten einen gestuften Workflow:

| Modus | Wann? | Schritte |
|---|---|---|
| 🟢 **Light Mode** | Bugfixes, kleine Anpassungen | Pre-Build → Änderung → Post-Build (100% Fitness Pflicht!) → Logging (`log_session.js`) |
| 🔴 **Full Mode** | Wichtige Features, Architektur | Wie Light Mode, aber **zusätzlich** ein Architektur-Dokument unter `specs/` anlegen. |

> **Achtung:** Jede Aktion in diesem Projekt muss strikt gegen die [Longevity Guidelines](docs/00-foundation/longevity-guidelines.md) geprüft werden.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README.md'), 'readme');

-- Antipattern Definitions
INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'B2',
  'critical',
  'javascript',
  'Legacy Date API (new Date, Date.now, Date.parse) is forbidden. Use Temporal API instead.',
  'A1',
  '\bnew\s+Date\(|\bDate\.now\(|\bDate\.parse\(',
  '["*.js"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'W1',
  'critical',
  'javascript',
  'document.execCommand is deprecated and forbidden. Use Selection & Range API.',
  'A2',
  '\bexecCommand\(|\bqueryCommandState\(',
  '["*.js"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'W2',
  'high',
  'javascript',
  'XMLHttpRequest (XHR) is deprecated. Use fetch() API.',
  'A3',
  '\bXMLHttpRequest\b',
  '["*.js"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'W3',
  'high',
  'javascript',
  'Unsanitized innerHTML assignments are unsafe. Use textContent or Sanitizer API where possible.',
  'A4',
  '\.innerHTML\s*=',
  '["*.js"]',
  '[{"file":"website/js/healthcheck.js"}]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'W4',
  'high',
  'css',
  'Hex colors (#RRGGBB, #RGB) are forbidden. Use oklch().',
  'A16',
  '#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b',
  '["*.css"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'W5',
  'high',
  'css',
  'rgb/rgba colors are forbidden. Use oklch().',
  'A17',
  '\brgba?\(.*?\)',
  '["*.css"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'W6',
  'high',
  'css',
  'hsl/hsla colors are forbidden. Use oklch().',
  'A18',
  '\bhsla?\(.*?\)',
  '["*.css"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'A38',
  'critical',
  'general',
  'External connections (CDNs, scripts, stylesheets) are forbidden except for allowed autocomplete and reference APIs.',
  'A38',
  'https?:\/\/(?!(?:photon\.komoot\.io|api\.geoapify\.com|api\.zippopotam\.us|myprojects\.geoapify\.com|www\.w3\.org))[a-zA-Z0-9.-]+',
  '["*.html","*.css","*.js"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'W7',
  'critical',
  'general',
  'Google Fonts are forbidden for DSGVO and offline security reasons.',
  'A41',
  'fonts\.googleapis\.com|fonts\.gstatic\.com',
  '["*.html","*.css"]',
  '[]'
);

INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (
  'P1',
  'high',
  'antipattern',
  'setHTMLUnsafe() ist nur erlaubt, wenn der Anwendungsfall bewusst unsicheres/ungefiltertes HTML erfordert. Standardfall = setHTML().',
  NULL,
  'setHTMLUnsafe',
  '["*.js"]',
  '[{"file":"website/js/main.js"},{"file":"website/js/healthcheck.js"}]'
);

-- Document Relations
-- Evolutionary Fitness History
INSERT INTO fitness_history (score, metadata_score, coherence_score, conformance_score, features_score, details_json) VALUES (
  100,
  100,
  100,
  100,
  100,
  '[]'
);

-- Current Reconciliation Diagnostics
-- Code Links
CREATE TABLE IF NOT EXISTS tbl_code_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  adr_ref TEXT,
  guide_ref TEXT
);

INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/index.html', 1, 'ADR-HTML', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/index.html', 2, '', 'din-5008-layout');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/constants.js', 1, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/constants.js', 2, '', 'glossary');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/dev-tools.js', 1, 'ADR-DATA-PERSISTENCE', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/geoapify.js', 1, 'ADR-API', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/geoapify.js', 2, '', 'geoapify-autocomplete');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/geoapify.js', 6, 'ADR-API', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/main.js', 1, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/main.js', 2, '', 'no-scroll-techniques');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/metadata.js', 1, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/metadata.js', 2, '', 'glossary');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/salutation-engine.js', 1, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/salutation-engine.js', 2, '', 'glossary');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/salutation-engine.js', 19, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/salutation-engine.js', 87, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/sender-sync.js', 1, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/sender-sync.js', 2, '', 'glossary');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/signature.js', 1, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/signature.js', 2, '', 'glossary');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/signature.js', 5, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/storage.js', 1, 'ADR-DATA-PERSISTENCE', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/storage.js', 2, '', 'glossary');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/storage.js', 6, 'ADR-DATA-PERSISTENCE', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/toast.js', 1, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/toast.js', 2, '', 'chrome-modern-css');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/js/toast.js', 4, 'ADR-JS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/floating.css', 1, 'ADR-CSS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/floating.css', 2, '', 'chrome-modern-css');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/layout.css', 1, 'ADR-CSS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/layout.css', 2, '', 'din-5008-geometry');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/reset.css', 1, 'ADR-CSS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/reset.css', 2, '', 'chrome-modern-css');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/variables.css', 1, 'ADR-CSS', '');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('website/css/variables.css', 2, '', 'chrome-modern-css');

