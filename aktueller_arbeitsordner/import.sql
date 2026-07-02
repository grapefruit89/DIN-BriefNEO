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
  '.specify/constitution.md',
  'Agent Constitution Reference (spec-kit style)',
  'active',
  '# Constitution Reference for Agents

This is the agent-focused view in `.specify/constitution.md` (inspired by spec-kit).

**Full authoritative version:** See `../constitution.md` + `../MASTER-DO-DONT-DEPRECATED.md` in the aktueller_arbeitsordner root.

## Key Points Agents Must Internalize

- DIN-Brief Neo is a **Testballon** for the generic llm_boilerplate.
- Strict longevity: Vanilla web tech only, no frameworks, 10+ year maintainability.
- Reconciliation + 100% Fitness Score is **mandatory** before/after changes (see AGENTS.md).
- Generalisierungs-Pflicht: Every solution must be evaluated for extraction to the boilerplate.
- Layered antipatterns: base / web / project (see tools/antipatterns/).
- Full audit: Every action logged via log_session.js.

## Workflow Integration

Use the hybrid phases documented in `../HYBRID-SPEC-DRIVEN-WORKFLOW.md`:
Constitution (this) → Specify (specs/NNN-xxx/spec.md) → Plan → Tasks → Implement → **Reconcile + Log** (our addition).

Update this file only when the main constitution changes, with Pre/Post build and logging.

This separation (.specify/ for agent artifacts) makes extraction to llm_boilerplate cleaner.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = '.specify/constitution.md'), 'constitution');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = '.specify/constitution.md'), 'agents');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = '.specify/constitution.md'), 'spec-driven');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  '.specify/templates/spec.md',
  '[NNN-Short-Name] Feature Title',
  'draft',
  '# Spec: [NNN-Short-Name] Feature Title

## Context / Background
(Why now? Links to existing ADRs, constitution, MASTER-DO-DONT, or previous specs.)

## Requirements
- Must ...
- Should ...

## Acceptance Criteria
- [ ] Criterion 1 (measurable)
- [ ] ...

## Generalisierbarkeit Check (mandatory per AGENTS.md)
- Can this be extracted to llm_boilerplate? (base/web rules, generic tool, template?)
- Proposed extraction steps:
- Risks of project-specific coupling:

## Related
- ADR/...
- Guides/...
- specs/previous/...',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = '.specify/templates/spec.md'), 'feature');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = '.specify/templates/spec.md'), 'spec');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-ANTIPATTERN.md',
  'Architectural Decision Record (ADR): Forbidden Practices & Antipatterns',
  'accepted',
  '# Architectural Decision Record (ADR): Forbidden Practices & Antipatterns

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Um die Langlebigkeit, Wartungsfreiheit, extreme Performance und uneingeschränkte Offline-Lauffähigkeit von **DIN-BriefNEO** zu sichern, müssen bestimmte, im modernen Web oft übliche Praktiken strikt verboten werden. Dieses Dokument dient als unnachgiebige "Verfassung" zur Einhaltung der Projekt-Bedingungen.

---

## Verbotene Praktiken (Antipatterns)

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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-ANTIPATTERN.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-ANTIPATTERN.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-ANTIPATTERN.md'), 'antipattern');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-ANTIPATTERN.md'), 'rules');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-ANTIPATTERN.md'), 'boundaries');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-ANTIPATTERN.md'), 'security');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-ANTIPATTERN.md'), 'local-context');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-API.md',
  'ADR: External API Integrations & Header Security',
  'accepted',
  '# Architectural Decision Record (ADR): External API Integrations & Header Security

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Eine effiziente, datenschutzkonforme und reibungsfreie Adress-Vervollständigung ist ein zentrales Komfortmerkmal. Viele gebräuchliche Autocomplete-Lösungen (wie die Google Places API) erfordern jedoch die Angabe von Kreditkarten bei der Registrierung und beeinträchtigen durch schwere SDKs die Performance und Offline-Fähigkeit. Das **DIN-BriefNEO**-Projekt benötigt ein schnelles, kostenloses und datenschutzkonformes API-Konzept, das vollständig unter lokalen Kontexten (`file:///`) operiert.

---

## Entscheidungen

### 1. Dual-Provider Autocomplete (Photon & Geoapify)
Wir implementieren einen asynchronen Adressdienst in der Sidebar, der zwei separate Provider anbindet:
*   **Photon (Komoot/OSM):** 100% kostenlos und **ohne API-Key** nutzbar. Die Abfragen werden standardmäßig auf eine Deutschland-Boundingbox (`bbox=5.0,45.0,16.0,56.0`) eingegrenzt, um präzise, inländische Vorschläge zu liefern.
*   **Geoapify (Premium):** Erfordert einen API-Key. Das Eingabefeld wird dynamisch ein- und ausgeblendet.

```mermaid
sequenceDiagram
    autonumber
    actor User as Benutzer
    participant Search as Autocomplete Input
    participant JS as main.js (JS-Controller)
    participant API as API Provider (Photon / Geoapify)
    participant Zip as Zippopotam API
    
    User->{Search}: Tippt Empfängeradresse (>2 Zeichen)
    JS->>API: fetch() Request mit AbortController-Signal
    Note over API: Wenn neu getippt: AbortController bricht alten Request ab
    API-->>JS: JSON Features
    JS-->>Search: Render Dropdown-Liste
    User->{Search}: Wählt Adresse aus
    JS->>User: Füllt Empfänger-DOM aus
    
    Note over User: Ort & PLZ Eingabe
    User->{Search}: Gibt 5-stellige PLZ in Ort-Feld ein
    JS->>Zip: fetch() Zippopotam PLZ Lookup
    Zip-->>JS: Ortsname
    JS->>User: Ergänzt Ortsnamen automatisch
```


### 2. Header-Security für API-Keys
Bei der Anbindung von Geoapify wird der API-Key **ausschließlich** über den sicheren HTTP-Header `X-Api-Key` an den Web-Service übermittelt – niemals als URL-Parameter!
*   **Begründung:** Verhindert das Exponieren oder Leaken des Schlüssels in Netzwerk-Caches, Web-Proxys, DNS-Logs oder Browser-Verlaufseinträgen.

### 3. Key Heartbeat-Validierung
Bei Eingabe eines Geoapify API-Keys wird dieser mit 500ms Debounce asynchron per Heartbeat-Anfrage (`text=Bonn&limit=1`) validiert.
*   **Ablauf:** Liefert die API ein erfolgreiches `ok` (Status 200), wird der Key dauerhaft gespeichert und das Suchfeld freigeschaltet. Andernfalls wird der Key verworfen und ein Fehler-Toast ausgegeben.

### 4. Race-Condition-Schutz via AbortController
Um unvollständige oder veraltete Netzwerkeingänge bei schnellem Tippen abzusichern, bricht JS laufende Fetch-Anfragen über die native `AbortController`-API (`signal`) sofort ab, sobald eine neue Tastatureingabe erfolgt.

### 5. Zippopotam PLZ Auto-Lookup
Wir integrieren einen Listener auf das Feld *PLZ & Ort* (`#empfaenger-ort`). Gibt der Benutzer eine 5-stellige deutsche Postleitzahl ein, fragt das System im Hintergrund die kostenlose **Zippopotam API** (`https://api.zippopotam.us/de/${zip}`) ab und ergänzt den Ortsnamen automatisch (z. B. *"93049 Regensburg"*).

---

## Konsequenzen
*   **Vorteile:**
    *   Hundertprozentig datenschutzkonform und DSGVO-freundlich.
    *   Keinerlei Kosten oder Kreditkartenzwang für den Anwender.
    *   Vollständige `file:///`-Kompatibilität ohne CORS-Probleme.
    *   Zuverlässiger Schutz vor veralteten Netzwerkeingängen dank Aborting.
*   **Nachteile:**
    *   Die Autovervollständigung setzt eine aktive Internetverbindung voraus (manuelle Eingaben auf dem Briefpapier sind jedoch jederzeit offline möglich).

---

## Verknüpfungen
*   Siehe [[ADR-HTML|ADR-HTML.md]] für die Einbettung des Widgets.
*   Siehe [[ADR-JS|ADR-JS.md]] für Drosselung und Datenbindung.
*   Siehe [[ADR-FEATURE|ADR-FEATURE.md]] für das Proximity-Biasing mit Absender-PLZ.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] für das Verbot schwerer Google SDKs.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'api');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'autocomplete');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'security');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'photon');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'geoapify');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-API.md'), 'zippopotam');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-CSS.md',
  'ADR: CSS Architecture & Proportional Zoom',
  'accepted',
  '# Architectural Decision Record (ADR): CSS Architecture & Proportional Zoom

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Klassische Webanwendungen brechen oft das WYSIWYG-Prinzip durch unkontrolliertes Scrollen, verzerrte Proportionen bei Größenänderungen oder JavaScript-gesteuerte Element-Skalierungen. Der **DIN-BriefNEO**-Bogen muss unter allen Bedingungen pixelperfekt proportional skaliert und absolut ohne Scrollbalken im Anwendungsfenster dargestellt werden.

---

## Entscheidungen

### 1. Reiner CSS-Zoom & Aspect-Ratio (Kein JS-ResizeObserver)
Der DIN-A4 Bogen `<din-a4>` wird deklarativ auf `height: 94vh` und `aspect-ratio: 210 / 297` fixiert.
*   **Begründung:** Durch die Definition von `height: 94vh` passt sich das Briefpapier stufenlos und passgenau der Viewport-Höhe des Browsers an. Die Aspect-Ratio garantiert ein mathematisch exaktes A4-Verhältnis auf jedem Bildschirm – vollkommen ohne JavaScript-Hilfen.
*   **Verweis:** Siehe [[no-scroll-techniques|no-scroll-techniques.md]] für detaillierte No-Scroll-Strategien.

### 2. Container Queries & Proportionale Einheiten (`cqw` / `cqh`)
Wir setzen auf dem `<din-a4>` Bogen `container-type: size` und berechnen alle inneren Abstände, Falzmarken, Margins und Schriftgrößen in Container-Breiten (`cqw`) und -Höhen (`cqh`).
*   **Formeln:** 1 mm entspricht `calc(1 / 210 * 100cqw)` in der Breite und `calc(1 / 297 * 100cqh)` in der Höhe.
*   **Begründung:** Schrumpft oder wächst das Papier durch Browser-Zoom, skaliert das gesamte Brief-Layout mitsamt Texten, Linien und Marken pixelperfekt mit, da sich alle Werte proportional auf die Größe des Eltern-Containers beziehen.
*   **Verweis:** Siehe [[din-5008-geometry|din-5008-geometry.md]] für alle normkonformen Umrechnungen.

### 3. Absolute Viewport-Sperre (`overflow: hidden`)
Auf `html` und `body` wird ein ausnahmsloses vertikales und horizontales Scrollverbot (`overflow: hidden`) auferlegt.
*   **Begründung:** Dies verhindert Doppel-Scrollbalken und garantiert ein echtes, premium-artiges Applikationsgefühl im Full-Screen-Modus.

### 4. Natives Light/Dark-Mode Theme (`light-dark()`)
Wir nutzen das native CSS-Farbschema-Feature `light-dark()` in Kombination mit OKLCH-Farbräumen für harmonische und augenfreundliche Kontraste.
*   **Begründung:** Erlaubt eine vollkommen JS-freie Theme-Umschaltung direkt im CSS, indem der Browser je nach `color-scheme` automatisch die passenden Variablen rendert.

### 5. CSS Anchor Positioning API für Floating-Elemente
Wir nutzen die native W3C CSS Anchor Positioning API für das Adress-Autocomplete-Dropdown (`#address-suggestions`) und koppeln es direkt im CSS an sein Anker-Element (`#input-address-search`).
*   **Begründung:** Durch die rein deklarative Verankerung im CSS entfallen sämtliche fehleranfälligen JavaScript-Positionsberechnungen, Resize-Listener und Scroll-Eventhandler. Der Browser führt die Layout-Platzierung hochoptimiert auf der Rendering-Ebene aus, was asynchrone Offsets und Layout-Ruckeln vollständig eliminiert.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 125/147 (inkl. position-area).

### 6. CSS @property für animierbare Custom Properties
Wir registrieren die CSS-Variable `--guide-opacity` über das native `@property`-Feature mit der Syntax `<number>`.
*   **Begründung:** Ohne Typregistrierung behandelt der Browser CSS-Variablen als reinen Text, wodurch sie nicht flüssig interpoliert (animiert) werden können. Durch die Typisierung als `<number>` kann der Browser Werteübergänge von `0.15` auf `0` mathematisch berechnen. Wir deklarieren die Transition `--guide-opacity 0.25s` direkt auf `:root`, wodurch das Ein- und Ausblenden der Hilfslinien vollkommen stufenlos und nativ abläuft.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 146.

### 7. CSS Relative Color Syntax (RCS)
Wir nutzen die W3C Relative Color Syntax (RCS) im OKLCH-Farbraum, um funktionale Farbvarianten (z. B. `--accent-glow`, `--danger-hover` und `--guide-color`) dynamisch und mathematisch aus ihren jeweiligen Basisfarben zu berechnen.
*   **Formeln:** `--accent-glow: oklch(from var(--accent-color) l c h / 15%)`, `--danger-hover: oklch(from var(--danger-color) calc(l - 0.06) c h)` und `--guide-color: oklch(from var(--accent-color) calc(l - 0.05) c calc(h + 120))`.
*   **Begründung:** Anstatt Dutzende statische Farbtöne manuell zu deklarieren, berechnet der Browser alle harmonischen Schattierungen, Glanzeffekte und sogar farbliche Komplementärkontraste (z. B. Hilfslinien im triadisch verschobenen 120-Grad-Farbwinkel) vollautomatisch. Das garantiert perfekte ästhetische Konsistenz, selbst wenn die Primärfarbe dynamisch gewechselt wird.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 119.

---

### 8. CSS interpolate-size: allow-keywords für native Transitionen auf "auto"-Maße
Wir deklarieren `interpolate-size: allow-keywords` global auf `:root` (bzw. auf dem `html`-Element), um die Einschränkung aufzuheben, dass CSS-Transitionen und -Animationen nur auf feste Pixel- oder Prozentmaße angewendet werden können.
*   **Begründung:** Bisher mussten expandierende oder kollabierende Layoutbereiche (wie das API-Key-Eingabefeld `#geoapify-key-container`) umständlich über JavaScript-Höhenberechnungen oder unschöne `max-height`-Hacks (mit festen Werten) animiert werden. Durch die Aktivierung von `interpolate-size` schaltet der Browser native Überblendungen und Größenänderungen von `0` auf `height: auto` völlig eigenständig frei. In Kombination mit discrete transitions (`display: allow-discrete`) gleitet der API-Key-Bereich bei Providerwechseln nun seidenweich und absolut flüssig auf- und zu.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 129.

---

### 9. Native CSS @scope Isolation
Wir kapseln alle physischen Briefblatt-Stile (`din-a4` und dessen Nachfahren) deklarativ über das native CSS `@scope (din-a4)`-Feature ein.
*   **Begründung:** Bisher drohten globale CSS-Klassen (z.B. `.din-mark`, `#absender`, `#infoblock`) mit Styles der App-Shell oder Sidebar zu kollidieren. Die `@scope` API isoliert alle Briefblatt-Klassen und -Regeln vollständig, ohne dass ein aufwendiger Shadow DOM aufgebaut werden muss. Das sichert absolute Geometrie-Immunität für das Briefpapier.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 118.

---

### 10. Ausschließliches OKLCH-Farbmandat & Legacy-Farbverbot
Wir verpflichten uns zur ausschließlichen Nutzung des W3C **OKLCH-Farbraums** (`oklch()`) für sämtliche Farbwerte, Verläufe und Schatten.
*   **Begründung:** OKLCH ist ein wahrnehmungslinearer (perceptually uniform) Farbraum, der Helligkeit (`L`), Buntheit (`C`) und Farbton (`H`) mathematisch gleichmäßig trennt. Dies ist die absolute Voraussetzung für die fehlerfreie Funktion der CSS Relative Color Syntax (RCS), um harmonische, dynamische Kontraste abzuleiten (z. B. Hilfslinien im komplementären Triadic-Kontrast). HEX, RGB oder HSL verhalten sich bei mathematischer Manipulation unvorhersehbar und sind verboten.
*   **Verweis:** Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] (Antipattern 7).

---

## Konsequenzen
*   **Vorteile:**
    *   Absolut flüssige, stufenlose Echtzeit-Skalierung auf allen Displays.
    *   Hundertprozentig WYSIWYG-konform: Das Druckergebnis entspricht exakt der Bildschirmdarstellung.
    *   Keine Performance-Einbußen durch JS-Resize-Listener.
    *   JavaScript wird vollständig von Layout- und Positionsaufgaben entkoppelt (100% Trennung von Struktur und Stil).
    *   Flüssige, stufenlose Überblendungen von UI-Elementen (wie Hilfslinien) direkt über CSS-Variablen-Interpolation.
    *   Vollautomatische, mathematisch harmonisierte Farbschemata direkt über die W3C Relative Color Syntax.
    *   Völlig native CSS-Größenanimationen auf Keywords (wie `height: auto`) ohne JS-Berechnungen oder `max-height`-Hacks.
    *   Vollständige Kapselungs-Sicherheit der Briefbogen-Geometrie durch native CSS `@scope` Isolation.
    *   Mathematisch perfekte Farbstimmigkeit und Ambient Contrast durch 100 % konsequente OKLCH-Farben.
*   **Nachteile:**
    *   Texte müssen in der Höhe begrenzt sein (z. B. auf 1 A4-Seite), da unkontrolliertes Hinausfließen zu einem Textüberlauf führt (siehe `ADR-FEATURE.md` zur Überlaufwarnung).
    *   Setzt eine moderne Chromium-Engine voraus (Chrome 129+ für `interpolate-size` Unterstützung).


---

## Verknüpfungen
*   Siehe [[ADR-HTML|ADR-HTML.md]] für die Struktur der Custom-Elements.
*   Siehe [[ADR-JS|ADR-JS.md]] für das Blockieren von JS-basiertem Styling.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] für das Verbot von Scrollbalken.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.



### 5. Zero-JS UI State Toggles (via :has() und Checkboxen)
Komplexe Sichtbarkeitszust�nde von UI-Elementen (wie das Ein- und Ausblenden von optionalen Briefbl�cken wie Postvermerk, Anlagen, Verteiler) werden ausschlie�lich nativ �ber CSS abgebildet. Durch die Kombination von unsichtbaren <input type="checkbox"> in der Sidebar und :root:has(#id:checked) target-element { display: block; } im CSS eliminieren wir jeglichen JavaScript Event-Listener und State-Management Code f�r reines UI-Toggling.


## Feature Checks
```javascript feature-check
f("CSS :has() Selektor", typeof CSS !== "undefined" && CSS.supports && CSS.supports("selector(:has(div))"), "Chrome 105", "Produktiv"),
f("CSS field-sizing: content", typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing: content"), "Chrome 123", "Produktiv")
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-CSS.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-CSS.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-CSS.md'), 'css');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-CSS.md'), 'layout');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-CSS.md'), 'zoom');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-CSS.md'), 'containers');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-CSS.md'), 'theming');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-FEATURE.md',
  'ADR: Feature Specifications & Premium UX',
  'accepted',
  '# Architectural Decision Record (ADR): Feature Specifications & Premium UX

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Ein ansprechendes, premium-artiges Schreiberlebnis zeichnet sich durch flüssige Mikro-Animationen, native Interaktionselemente und intelligente Automationen aus. Für **DIN-BriefNEO** sollen spezifische Features definiert werden, die die Applikation von einer einfachen Webseite zu einem nativen Editor-Erlebnis erheben.

---

## Entscheidungen

### 1. WhatsApp-Style Selection Toolbar (Popover)
Anstelle eines unruhigen statischen Editors blenden wir eine schwebende Formatierungs-Toolbar (`#format-toolbar`) ein, sobald der Benutzer Text innerhalb des Brieftextes markiert.
*   **Zustandserkennung:** Ein zukunftssicherer DOM-Traversal Algorithmus ermittelt, ob der ausgewählte Bereich fett, unterstrichen oder als Zitat formatiert ist. Ist dies der Fall, leuchtet der entsprechende Button smaragdgrün und erhält das Attribut `aria-pressed="true"`.
*   **Viewport-Kollisionsprüfung:** Die Toolbar wird rein CSS-basiert über **CSS Anchor Positioning** direkt an die Textselektion verankert. Die Viewport-Kollision und Ausweichmanöver (z. B. nach unten klappen) werden nativ im Browser über `position-try-options` gesteuert, wodurch wir jeglichen JavaScript-Berechnungsoverhead eliminieren!
*   **Verweis:** Siehe [[ADR-JS|ADR-JS.md]] zur Range-API und [[ADR-HTML|ADR-HTML.md]] zum Popover.

### 2. Toast-Queue mit nativem Ein-/Ausblende-Lifecycle
Toast-Meldungen werden in einer zentralen Warteschlange (`toastQueue`) verarbeitet, um überlappende Einblendungen ("Stacking") zu verhindern.
*   **Nativer Transitions-Lifecycle:** Anstelle von komplexen, manuellen JavaScript-Animationstriggern oder einer ununterbrechbaren 3-Sekunden-CSS-Keyframe-Animation nutzen wir die W3C-Standards `@starting-style` und `transition-behavior: allow-discrete` (für die CSS-Eigenschaften `display` und `overlay`). 
*   **Vorteil:** JavaScript steuert ausschließlich die Öffnung und Schließung des Popovers (`showPopover()` / `hidePopover()`), während der Browser die Ein- und Ausblendungs-Animationen (Slipping & Fading) vollkommen autonom und sauber getrennt im CSS ausführt. Ein einfaches 3.000ms JavaScript-Timeout regelt die Verweildauer, was das fehleranfällige Lauschen auf `animationend`-Events vollständig überflüssig macht.


```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> EventTriggered : showToast(message, type)
    EventTriggered --> QueueActive : In Toast-Queue geschoben
    QueueActive --> ToastShowing : showPopover() gerufen
    ToastShowing --> ToastShowing : Animation läuft
    ToastShowing --> Closed : click / animationend / 3.2s Safety-Timeout
    Closed --> QueueCheck : hidePopover()
    QueueCheck --> Idle : Queue leer
    QueueCheck --> QueueActive : Nächster Toast vorhanden
```


### 3. Schriftarten-Manager & WOFF2-Uploader
Der Editor bietet zwei Wege zur Typografie-Auswahl:
*   **System-Schriftstapel:** Auswahl von Sans, Serif oder Mono (siehe [[ADR-CSS|ADR-CSS.md]]).
*   **Offline-WOFF2-Uploader:** Der Benutzer kann eine eigene `.woff2`-Schrift hochladen. JS liest diese per `FileReader` ein, validiert die Dateigröße (< 60 KB) und speichert sie als Base64 im LocalStorage unter `din_custom_font`. Sie wird als `@font-face` mit Namen `''AptosCustom''` injiziert und überschreibt dank der CSS-Klasse `body.font-custom-active` alle System-Stapel.

### 4. Automatisches Proximity-Biasing
Zur Regionalkontrolle der Adress-Autovervollständigung liest die Applikation PLZ-Codes direkt aus dem Eingabefeld **Absenderzeile** (`#absender`) aus.
*   **Funktionsweise:** Findet der Scanner eine 5-stellige PLZ im Absenderbereich, wird sie asynchron via Zippopotam geocodiert. Die gefundenen Koordinaten (`latitude` & `longitude`) werden im Cache abgelegt. Zukünftige Suchen via Photon (`&lat=&lon`) und Geoapify (`&bias=proximity:`) werden automatisch auf die Region des Absenders fokussiert (NRW-Priorisierung).
*   **Verweis:** Siehe [[ADR-API|ADR-API.md]] zur API-Verkabelung.

### 5. A4-Überlauf-Warnung
Sobald die Texthöhe von `#brieftext` das Druckbereichs-Limit von `120mm` (~450px) überschreitet, fügt JS dem Papier die CSS-Klasse `overflow-warn` hinzu. Dadurch färbt sich der Blattrand rot und ein roter Warnhinweis erscheint.

---

## Konsequenzen
*   **Vorteile:**
    *   Herausragende Premium-UX: Die App fühlt sich extrem flüssig, nativ und durchdacht an.
    *   Volle Kontrolle über Speicher limits und API-Ressourcen.
    *   Automatisches Geocoding schont API-Kontingente und bietet Komfort ohne Setup.
*   **Nachteile:**
    *   Komplexes Zusammenspiel von APIs und DOM-Event-Handhabung.

---

## Verknüpfungen
*   Siehe [[ADR-HTML|ADR-HTML.md]] zu nativem Popover und `contenteditable`.
*   Siehe [[ADR-CSS|ADR-CSS.md]] zur Typografie und Zoom-Einheiten.
*   Siehe [[ADR-JS|ADR-JS.md]] zur Selection/Range-API.
*   Siehe [[ADR-API|ADR-API.md]] zum Zippopotam PLZ Auto-Lookup.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-FEATURE.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-FEATURE.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-FEATURE.md'), 'features');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-FEATURE.md'), 'popovers');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-FEATURE.md'), 'selections');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-FEATURE.md'), 'styling');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-FEATURE.md'), 'highlights');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-HTML.md',
  'ADR: HTML Architecture & Semantic Structure',
  'accepted',
  '# Architectural Decision Record (ADR): HTML Architecture & Semantic Structure

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Klassische Texteditoren basieren oft auf riesigen, unübersichtlichen DOM-Bäumen und JavaScript-basierten Dialogen. Für den **DIN-BriefNEO**-Editor soll eine Struktur etabliert werden, die maximal wartbar, nativ barrierefrei, extrem performant und standardkonform ist. Die semantische Struktur soll den Browser-eigenen Dokumentenfluss respektieren und unnötige JavaScript-Krücken vermeiden.

---

## Entscheidungen

### 1. IMR 4.0 Custom Elements für Geometrie-Bereiche
Wir nutzen semantische HTML5 Custom Elements (z. B. `<din-a4>`, `<din-absender>`, `<din-anschriftfeld>`, `<din-infoblock>`, `<din-kern>`, `<din-text>`, `<din-fuss>`).
*   **Begründung:** Dies ermöglicht eine glasklare Trennung der DIN 5008 Geometriebereiche im CSS und erhöht die semantische Lesbarkeit des Dokuments drastisch.
*   **Verweis:** Siehe [[din-5008-geometry|din-5008-geometry.md]] für die exakten Geometrie-Vorgaben.

### 2. Native HTML Popover API & Dialogs
Für alle Popups (wie die schwebende Textauswahl-Toolbar und Toasts) nutzen wir das native HTML-Attribut `popover="manual"`.
*   **Begründung:** Native Popovers werden vom Browser automatisch im **Top-Layer** über allen anderen Elementen gerendert. Dies verhindert CSS-Z-Index-Kollisionen und macht Hilfsbibliotheken komplett überflüssig.

### 3. Strikte contenteditable-Reglementierung
*   Alle einzeiligen Metadaten-Felder (Betreff, Anschrift, Ränder, Infoblock) nutzen `contenteditable="plaintext-only"`.
*   Der Brieftext selbst (`#brieftext`) nutzt `contenteditable="true"`.
*   **Begründung:** `plaintext-only` verhindert nativ, dass der Benutzer formatierten HTML-Müll (z. B. Schriftgrößen oder Webfarben) in strukturelle Briefbereiche einfügt, während `contenteditable="true"` im Brieftext gezieltes Fett-, Unterstreichungs- und Zitat-Styling erlaubt.
*   **Verweis:** Siehe [[ADR-JS|ADR-JS.md]] für den dazugehörigen JavaScript Paste/Drop-Filter.

### 4. Barrierefreiheit (A11y)
*   Die Toolbar-Buttons erhalten bei aktiver Formatierung das Attribut `aria-pressed="true"`, andernfalls `aria-pressed="false"`.
*   Alle interaktiven Steuerelemente besitzen eindeutige IDs für Web-Tests und Screenreader.

---

## Konsequenzen
*   **Vorteile:**
    *   Glasklare, lesbare DOM-Struktur.
    *   Hervorragende Barrierefreiheit ohne JavaScript-Bibliotheken.
    *   Keine Z-Index-Kämpfe im Top-Layer.
*   **Nachteile:**
    *   `contenteditable="plaintext-only"` erfordert Chromium-basierte Browser (Chrome 148+, Edge), was durch unsere Baseline-Festlegung abgedeckt ist.

---

## Verknüpfungen
*   Siehe [[ADR-CSS|ADR-CSS.md]] für das proportionale Styling der Custom Elements.
*   Siehe [[ADR-JS|ADR-JS.md]] für die Validierung und Steuerung der Editables.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] für das Verbot von Frameworks.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-HTML.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-HTML.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-HTML.md'), 'html');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-HTML.md'), 'semantics');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-HTML.md'), 'contenteditable');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-HTML.md'), 'popover');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-JS.md',
  'ADR: JavaScript Constraints & JS as a Crutch',
  'accepted',
  '# Architectural Decision Record (ADR): JavaScript Constraints & "JS as a Crutch"

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Moderne Webapplikationen neigen dazu, JavaScript für visuelle Effekte, Rendering-Operationen und Layout-Berechnungen einzusetzen. Dies erhöht die Fehleranfälligkeit, verschlechtert die Ladezeit und führt zu technischer Schuld. Im **DIN-BriefNEO**-Projekt soll JavaScript streng auf eine logische Begleitschicht reduziert werden.

---

## Entscheidungen

### 1. Striktes JS-Einsatzverbot für Styling & Rendering
Jegliche JavaScript-gestützte Steuerung von visuellen Effekten, Layout-Rendern oder CSS-Styles ist verboten.
*   **Keine Ausnahmen:** Da wir exklusiv für moderne Laufzeitumgebungen ab Chrome 148+ entwickeln, wird selbst die schwebende Textauswahl-Toolbar (`#format-toolbar`) rein CSS-basiert über **CSS Anchor Positioning** an die Selektion verankert. Es wird keinerlei JS zur Koordinaten-Berechnung benötigt.
*   **Begründung:** Stabilität, Robustheit und eine saubere Codebasis. Das Layout bleibt stabil, selbst wenn JavaScript abstürzt oder im Browser blockiert wird.

### 2. Reglementierte Aufgabenbereiche für JavaScript
JavaScript darf ausschließlich für folgende sechs Aufgabenbereiche eingesetzt werden:
1.  **Textauswahl & Format-Aktionen:** Ein gedrosselter `selectionchange`-Listener (50ms Debounce) steuert ausschließlich die Sichtbarkeit (Sichtbar-Zustand des Popovers) und setzt bei Klick Formatierungen über die Selection & Range API um. Die Positionierung der Toolbar erfolgt rein über CSS Anchor Positioning.
2.  **Sicherer Paste/Drop-Schutz:** Abfangen von Paste- und Drop-Events auf `#brieftext`, um HTML-Formatmüll unnachgiebig zu entfernen und ausschließlich reinen Plaintext (`text/plain`) einzufügen.
3.  **Daten-Synchronisation & Auto-Save:** Automatisches Speichern und Laden von Textinhalten in den LocalStorage bei jeder Eingabe.
4.  **Externe API-Anfragen:** Abfragen an Photon, Geoapify (inklusive Heartbeat-Check) und Zippopotam.
5.  **Toast-Queue & Popover-Lifecycle:** Verwaltung der Toast-Warteschlange zur Vermeidung von überlappenden Einblendungen.
6.  **Datum-Autobefüllung:** Nativer Einsatz der **W3C Temporal API** (`Temporal.Now.plainDateISO()`) zur zeitzonensicheren, unveränderlichen und fehlerfreien Bestimmung des lokalen Systemdatums im normativem deutschen Format beim Erststart.


### 3. Verbot von veraltetem `execCommand` für Custom-Formate
Für Zitate (`<blockquote>`) nutzen wir die native Selection & Range API (`extractContents` / `insertNode`) zum sauberen Wrappen und Entpacken (Unwrap) des DOMs.
*   **Zustandserkennung:** Wir ermitteln die aktiven Formate (Fett, Unterstrichen, Zitat) über eine zukunftssichere, native DOM-Baum-Traversierung nach oben bis zum Container `#brieftext`. Wir verzichten komplett auf veraltete APIs (wie `queryCommandState`).
*   **Shortcuts:** Wir überlassen standardmäßige Shortcuts (`Strg+B` / `Strg+U`) dem nativen Standardverhalten des Browsers im `contenteditable`-Bereich. Es werden keine eigenen Keydown-Handler für diese Shortcuts geschrieben.

### 4. Native View Transitions API für flüssige Zustandsübergänge
Wir kapseln alle Benutzer-initiierten UI-Layoutänderungen (z. B. Umschalten zwischen Form A und Form B) sowie Theme-Wechsel (Hell/Dunkel/Auto) vollständig in der modernen W3C View Transitions API (`document.startViewTransition()`).
*   **Begründung:** Durch die native Kapselung entfällt das Schreiben von manuellen CSS-Animationsklassen oder komplexen JavaScript-basierten Fade-Operationen. Der Browser erzeugt automatisch Vorher-Nachher-Snapshots und animiert die Layout-Elemente mit maximaler Hardware-Beschleunigung und seidenweichen Übergängen direkt auf der Render-Pipeline.
*   **Fallback:** Sollte das Feature nicht unterstützt werden, wird die Zustandsänderung synchron als direkter Fallback ohne visuelle Übergänge ausgeführt, wodurch die App abwärtskompatibel bleibt.


---

## Konsequenzen
*   **Vorteile:**
    *   Schlanker Code (<18 KB JavaScript insgesamt).
    *   Zukunftssichere APIs (Selection/Range, Popover).
    *   Hocheffizientes Drosseln verhindert Performance-Engpässe bei Mausbewegungen.
*   **Nachteile:**
    *   Erhöhter CSS-Einsatz für visuelle Statustoggles (z. B. Segmented Controls, Guides).

---

## Verknüpfungen
*   Siehe [[ADR-HTML|ADR-HTML.md]] für `contenteditable` und native Popover.
*   Siehe [[ADR-CSS|ADR-CSS.md]] für die reinen CSS-Zoom-Techniken.
*   Siehe [[ADR-API|ADR-API.md]] für API-Vorschriften.
*   Siehe [[ADR-FEATURE|ADR-FEATURE.md]] für Details zur Toast-Queue und Toolbar.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] für das Verbot von Frameworks.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.

### 5. Canvas-Komprimierung fOr groYe Binrdaten
Wir nutzen ein unsichtbares OffscreenCanvas oder regulres <canvas> (wie im SignatureFeature), um vom Nutzer hochgeladene Bilder clientseitig massiv zu komprimieren (max 400px), bevor sie als Base64 im localStorage gespeichert werden. Dies verhindert das schnelle Sprengen des 5MB Speicherlimits und zementiert die serverlose, offline-fhige Architektur der Anwendung.


## Feature Checks
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-JS.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-JS.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-JS.md'), 'js');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-JS.md'), 'scripting');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-JS.md'), 'event-handling');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-JS.md'), 'dom-selection');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-JS.md'), 'constraints');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-TECH-STACK.md',
  'Architectural Decision Record (ADR): Unified Web Technology Stack & Rationales',
  'accepted',
  '# Architectural Decision Record (ADR): Unified Web Technology Stack & Rationales

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Für eine wartungsfreie, performante, datenschutzkonforme und vollständig offline-fähige Anwendung unter der strikten Prämisse der lokalen Kompatibilität (`file:///index.html` per Doppelklick öffnen) müssen alle eingesetzten Webtechnologien sorgfältig ausgewählt werden. Dieses Dokument zentralisiert alle genutzten HTML5-APIs, CSS3-Module und JavaScript-Konstrukte und begründet deren Wahl im Vergleich zu üblichen Alternativen.

---

## 📊 Der Technologie-Stack im Überblick

### 1. HTML (Struktur & Barrierefreiheit)

| Webtechnologie / API | Konkrete Verwendung | Rationale & Vorteile | Verweis |
| :--- | :--- | :--- | :--- |
| **`contenteditable="plaintext-only"`** | Einstellige Metadaten-Felder (Betreff, Anschrift, Datum) | Verhindert nativ (ohne JS-Filter), dass der Benutzer formatierten HTML-Müll aus Word oder Webseiten in DIN-Strukturfelder einfügt. | [[ADR-HTML|ADR-HTML.md]] |
| **`contenteditable="true"`** | Hauptbrieftext (`#brieftext`) | Erlaubt kontrollierte, inline-formatierte Textstrukturen (Fett, Unterstrichen, Zitate). | [[ADR-HTML|ADR-HTML.md]] |
| **Native Popover API (`popover="manual"`)** | Formatierungs-Toolbar und Popover-Toasts | Browser rendert diese Elemente automatisch im **Top-Layer**. Keine CSS `z-index`-Kollisionen mehr, keine Frameworks oder JS-Bibliotheken nötig. | [[ADR-HTML|ADR-HTML.md]], [[ADR-FEATURE|ADR-FEATURE.md]] |
| **HTML5 Custom Elements** | `<din-a4>`, `<din-absender>`, `<din-anschriftfeld>` etc. | Ermöglicht eine glasklare Trennung der DIN 5008 Geometriebereiche im CSS und erhöht die semantische Lesbarkeit des DOM-Baums drastisch. | [[ADR-HTML|ADR-HTML.md]] |
| **A11y ARIA Attributes** | `aria-pressed="true/false"` auf den Formatierungsbuttons | Gewährleistet native Barrierefreiheit und präzise Screenreader-Ansagen über den Format-Status des markierten Textes. | [[ADR-HTML|ADR-HTML.md]] |

---

### 2. CSS (Visuals, Layout & Proportionalität)

| Webtechnologie / API | Konkrete Verwendung | Rationale & Vorteile | Verweis |
| :--- | :--- | :--- | :--- |
| **`oklch()` Farbräume** | Gesamte Farbpalette der Anwendung | Wahrnehmungskonformer (perceptually uniform) Farbraum. Erlaubt präzise, mathematisch stimmige Helligkeitskontrollen und extrem harmonische, augenschonende Farbübergänge. | [[ADR-CSS|ADR-CSS.md]] |
| **`light-dark()` Funktion** | Dynamische Theme-Farben in `variables.css` | Erlaubt eine vollkommen JS-freie Theme-Umschaltung direkt im CSS, indem der Browser je nach `color-scheme` automatisch die passenden Variablen rendert. | [[ADR-CSS|ADR-CSS.md]] |
| **`container-type: size`** | Deklariert auf dem `<din-a4>`-Blatt | Kapselt die physischen A4-Proportionen in einen isolierten Container, um proportionale Layoutberechnungen für Kind-Elemente freizuschalten. | [[ADR-CSS|ADR-CSS.md]] |
| **Container Query Units (`cqw` / `cqh`)** | Alle Margins, Paddings, Positionen & Schriftgrößen | 100% pixelperfektes Vektor-Skalieren! Wächst oder schrumpft das Papier durch Browser-Zoom, skaliert das gesamte DIN-Layout proportional mit. | [[ADR-CSS|ADR-CSS.md]], [[din-5008-geometry|din-5008-geometry.md]] |
| **`aspect-ratio: 210 / 297`** | Größenberechnung des `<din-a4>`-Blatts | Garantiert das mathematisch exakte Seitenverhältnis von DIN A4 auf jedem Bildschirm – vollkommen ohne JavaScript-Hilfen. | [[ADR-CSS|ADR-CSS.md]] |
| **`height: 94vh`** | Höhenlimitierung des Briefbogens | Verhindert, dass das Papier den vertikalen Viewport überschreitet, und passt sich stufenlos und passgenau der Bildschirmhöhe an. | [[ADR-CSS|ADR-CSS.md]] |
| **`overflow: hidden` on Body** | Absolute Viewport-Sperre | Verhindert Doppel-Scrollbalken und garantiert ein echtes, premium-artiges Applikationsgefühl im Full-Screen-Modus. | [[ADR-CSS|ADR-CSS.md]], [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] |
| **`@media print` Overrides** | Druck- und PDF-Erzeugung | Zwingt die Farben des Briefbogens beim Ausdrucken/Drucken in PDF bedingungslos auf einen reinweißen Hintergrund mit schwarzer Tinte (Druck-Souveränität). | [[ADR-CSS|ADR-CSS.md]], [[ADR-FEATURE|ADR-FEATURE.md]] |
| **CSS Anchor Positioning** | Schwebende Formatierungs-Toolbar (`#format-toolbar`) | Ermöglicht das vollkommen JS-freie, rein CSS-basierte Verankern der schwebenden Toolbar direkt an die Textselektion. | [[ADR-CSS|ADR-CSS.md]], [[ADR-FEATURE|ADR-FEATURE.md]] |

---

### 3. JavaScript (Logische Begleitschicht)

| Webtechnologie / API | Konkrete Verwendung | Rationale & Vorteile | Verweis |
| :--- | :--- | :--- | :--- |
| **`localStorage` API** | Persistentes Speichern von Entwürfen, API-Schlüsseln, Profilen und Schriften | **Die einzige persistente Speicher-API, die unter `file://` (lokaler Doppelklick) uneingeschränkt funktioniert.** OPFS, IndexedDB und File System Access APIs werden mangels HTTPS/Server-Kontext blockiert. | [[ADR-JS|ADR-JS.md]], [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] |
| **Selection & Range API** | Text-Formatierung (`#brieftext`) | Ermöglicht das präzise Einbetten von Zitat-Wrappern (`blockquote`) und die Handhabung von Textauswahlen ohne veraltete APIs (wie `execCommand`). | [[ADR-JS|ADR-JS.md]] |
| **`AbortController` API** | Abbruch laufender Fetch-Anfragen | Verhindert Race Conditions und unnötige API-Verzögerungen beim schnellen Tippen in den Suchfeldern, indem veraltete Requests abgebrochen werden. | [[ADR-API|ADR-API.md]] |
| **`fetch()` mit `Headers`** | Geoapify Premium Autocomplete Suchen | Übermittelt API-Schlüssel sicher im HTTP-Header (`X-Api-Key`) statt in der URL-Query. Verhindert Key-Leaks in Web-Proxys, DNS-Logs und Browser-Verläufen. | [[ADR-API|ADR-API.md]] |
| **`FileReader` API** | Offline WOFF2-Font-Uploader | Liest die hochgeladene Schriftdatei asynchron als Base64-Data-URL ein, um sie persistent in den LocalStorage zu sichern. | [[ADR-FEATURE|ADR-FEATURE.md]] |
| **Discrete Transitions & Simple JS Timer** | Popover Toast-Lebenszyklus | Nutzt native CSS Discrete Transitions (`transition-behavior: allow-discrete` und `@starting-style` in `floating.css`) und einen simplen 3.000ms JS-Timer (`setTimeout`) für symmetrisches Ein-/Ausblenden auf GPU-Ebene. | [[ADR-FEATURE|ADR-FEATURE.md]] |
| **W3C Temporal API** (`Temporal.Now.plainDateISO()`) | Automatische Befüllung des Datumsfeldes (`#datum`) | Native, vollständig offline-fähige und unveränderliche (immutable) Kalender- und Datumsarithmetik ohne CDN-Abhängigkeiten. Beseitigt legacy Date-Mängel. | [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]], [[ADR-JS|ADR-JS.md]] |
| **`Element.setHTML()`** (Sanitizer API) | XSS-sichere HTML-Eingaben | Sanitiert Rich-HTML-Zuweisungen im Browser nativ gegen Cross-Site-Scripting (XSS). | [[ADR-JS|ADR-JS.md]] |
| **CSS `contrast-color()`** | Barrierefreier Textkontrast | Automatische, browserseitige Kontrastberechnung für primäre Buttons und aktive Steuerelemente. | [[ADR-CSS|ADR-CSS.md]] |


---

## 🚫 Ausgeschlossene Technologien & Antipatterns

Um die kompromisslose Langlebigkeit und Offline-Fähigkeit zu sichern, wurden folgende, im Web oft gängigen Ansätze **explizit verboten**:
1.  **SPA-Frameworks (React, Vue) & CSS-Utility-Frameworks (TailwindCSS):** Verhindert Abhängigkeiten, Build-Komplexität (Vite/Webpack) und garantiert, dass die Anwendung auch in Jahrzehnten ohne Wartung nativ in jedem Browser läuft.
2.  **Externe CDNs (Google Fonts, CDNs):** Zerstört die Offline-Fähigkeit und verletzt die DSGVO (IP-Abfluss an Drittserver).
3.  **IndexedDB / OPFS / File System Access API:** Werfen im lokalen Kontext (`file:///index.html`) schwerwiegende Sicherheits-Exceptions. LocalStorage ist der einzig sichere Weg.
4.  **`document.execCommand`:** Veraltet (*deprecated*) und kurz vor der Entfernung aus modernen Engines. Wir nutzen stattdessen die zukunftssichere Selection & Range API.

---

## Konsequenzen
*   **Vorteile:**
    *   Maximale Zukunftssicherheit durch die ausschließliche Nutzung stabiler, nativer W3C-Standards.
    *   Hervorragende Performance (<18 KB JS, <10 KB CSS) ohne jeglichen Build-Overhead.
    *   100% offline-kompatibel und sofort lauffähig (Doppelklick-Start).
*   **Nachteile:**
    *   Erfordert fundiertes Wissen über native Web-APIs anstelle von vorgefertigten Framework-Abstraktionen.

---

## Verknüpfungen
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TECH-STACK.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TECH-STACK.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TECH-STACK.md'), 'tech-stack');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TECH-STACK.md'), 'architecture');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TECH-STACK.md'), 'choices');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TECH-STACK.md'), 'rationales');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TECH-STACK.md'), 'w3c');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-TEMPLATE.md',
  'ADR-000: [Titel der Architektur-Entscheidung]',
  'draft | proposed | accepted | rejected | deprecated',
  '# Architectural Decision Record (ADR): [Titel]

> [!info] Info-Block (Hintergrund)
> Dies ist ein Template. Nutze diese Callouts (`> [!info]`, `> [!warning]`, `> [!danger]`, `> [!tip]`), um wichtige kontextuelle Informationen für andere Entwickler oder KI-Agenten hervorzuheben. Sie verbessern die Lesbarkeit enorm.

## 1. Kontext & Problemstellung

Beschreibe hier das Problem, das gelöst werden muss. Verlinke gerne auf andere Dokumente mit Wiki-Links, z. B. [[longevity-guidelines]].

<details>
<summary>Historischer Kontext (Klicken zum Ausklappen)</summary>
Nutze das `<details>`-Tag, um sehr lange oder sekundäre Erklärungen zu verstecken, damit das Dokument beim ersten Überfliegen übersichtlich bleibt.
</details>

## 2. Betrachtete Optionen

Nutze Tabellen, um verschiedene technische Lösungswege strukturiert gegenüberzustellen:

| Option | Vorteil | Nachteil |
| :--- | :--- | :--- |
| **Option A** (Native API) | Zero Dependencies, rasend schnell | Braucht modernen Browser (Chrome 148+) |
| **Option B** (npm Library) | Abwärtskompatibel | Bläht das Bundle auf, Sicherheitsrisiko |

## 3. Die Entscheidung

> [!success] Wir haben uns für **Option A** entschieden.

### Begründung
Nutze hier einfache Checklisten, um Argumente oder Anforderungen abzuhaken:
- [x] Entspricht der Zero-JS-Philosophie
- [x] Erfüllt den 100% Fitness Score
- [ ] Unterstützt veraltete IE11-Browser (bewusst ignoriert)

## 4. Architektur-Diagramm

Nutze Mermaid-Diagramme, um Workflows oder Datenflüsse visuell darzustellen (anstatt sie nur in Textform zu erklären):

```mermaid
graph TD
    A[Nutzer klickt] --> B{Hat Browser Feature X?}
    B -- Ja --> C[Nutze native Web API]
    B -- Nein --> D[Zeige sanften Fallback]
```

## 5. Feature Checks (Living Documentation)

Falls diese Entscheidung auf modernen Browser-APIs basiert, deklariere den nativen Feature-Check hier. Der Compiler (`tools/build_healthcheck.js`) zieht diesen Block automatisch heraus und baut daraus die Test-Suite für die Website:

```javascript feature-check
// Erklärung: Dieser Block wird aus dem Markdown gelesen. Er darf keinen echten Code ausführen, 
// sondern nur die ''f()''-Funktion für den Healthcheck aufrufen!
// Beispiel: f("Feature Name", typeof globalThis.Feature !== "undefined", "Chrome 120", "Produktiv")
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TEMPLATE.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TEMPLATE.md'), 'template');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/ADR-TEMPLATE.md'), 'architektur');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/Code-Referenzen.md',
  'Code-Referenzen',
  'active',
  '# Code-Referenzen

Diese Datei wird automatisch von `build_db.js` generiert und listet alle Architektur-Verknüpfungen aus dem Quellcode auf.

| Code Datei | Zeile | Architektur-Entscheidung |
| :--- | :--- | :--- |
| website/js/main.js | 1192 | [[ADR-JS]] |
| website/js/signature.js | 1 | [[ADR-JS]] |
| website/css/layout.css | 1 | [[ADR-CSS]] |',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/Code-Referenzen.md'), 'autogenerated');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/Code-Referenzen.md'), 'adr');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ADR/Code-Referenzen.md'), 'code');

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
  'CHANGELOG.md',
  'Changelog (Dokumentation)',
  'active',
  '# Changelog (Dokumentation)

Alle wichtigen Änderungen an der Systemdokumentation dieses Repositories werden in dieser Datei nach dem "Keep a Changelog"-Standard gepflegt.

> [!NOTE]
> Dieses Changelog trackt alle Änderungen an der Architektur, dem Quellcode (HTML, CSS, JS) und der Dokumentation von DIN-BriefNEO. Die SPEC-ONLY-PHASE wurde erfolgreich abgeschlossen, und alle W3C-Modernisierungsstufen sind produktiv implementiert.

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
*   **SPEC-ONLY-PHASE aufgehoben:** Offizielle Löschung der `.SPEC-ONLY-PHASE` Sperrdateien und Übergang in die aktive Code-Modernisierungsphase.
*   **Entscheidungs-Log:** Die Entscheidungen für CSS Anchor Positioning, View Transitions, Discrete Transitions, @property, Relative Color Syntax, interpolate-size, Temporal API, `@scope` und OKLCH-Farbmandat in `ADR-CSS.md`, `ADR-JS.md`, `ADR-FEATURE.md`, `ADR-ANTIPATTERN.md` und `DECISION-LOG.md` dokumentiert.
*   **Strikter Legacy-Date- & Farb-Ban:** Offizielle Ächtung von klassischem `new Date()`, externen Datums-Bibliotheken sowie allen klassischen Farbräumen (HEX, RGB, HSL) in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md`.
*   **Proaktive Antipattern-Verfassung:** Ausweitung der Verbote um 5 neue Regeln (Ausschluss von CSS-Präprozessoren, Icon-CDNs, JS-Hilfsbibliotheken/TypeScript, JS-Animationsbibliotheken und gestalterischen Inline-Styles) in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md` zum dauerhaften Schutz der Build-freien Offline-Architektur.
*   **JS-Bereinigungs-Dokumentation:** Ausführliche Architekturkommentare wurden in `main.js` (`renderSuggestions`, `processToastQueue`, `applySettings`, `applyProviderUIState` und `loadDraftData`) integriert, um den bewussten Verzicht auf JavaScript-Positions-, Keyframe-, Kontrast-, Fading-, Größen-Animations- und legacy Datums-Steuerungen zugunsten nativer W3C-Standards zu dokumentieren.
*   **Toast-Queue Vereinfachung:** Entfernung von obsoleten `@keyframes` aus `floating.css` und Vereinfachung des JS-Toast-Lifecycles in `main.js` (Ersatz von fehleranfälligen `animationend`-Listenern durch eine native, CSS-gesteuerte Austritts-Animation).
*   **API-Key-Steuerung:** Entfernung von unschönen inline-Styles in `index.html` und Ablösung von manuellen JavaScript-Größen-Animationsversuchen durch einfaches `.classList` Toggling.



## [Unreleased] - 2026-05-25

### Added
*   **Datenbank-Architektur:** Spezifikation der LLM-first SQLite-Dokumenten-Datenbank in **[README-DB.md](README-DB.md)** verankert.
*   **Datenbank-Compiler:** Das zero-dependency Node.js-Skript `build_db.js` zur vollautomatischen Generierung der SQLite-Datenbank aus den Markdown-Dateien angelegt.
*   **GitHub-Automatisierung:** Die Workflow-Vorlage `github_action_workflow.txt` für die vollautomatische Datenbank-Aktualisierung bei jedem Push erstellt.
*   **Entwicklerbereich:** Die Diagnose-Ansicht und Feature-Erkennungs-Matrix **[DEV-INFO.md](DEV-INFO.md)** zur Validierung von 25 absoluten Bleeding-Edge-Features der Web-Plattform angelegt und das Easter-Egg High-Integrity Dev-Panel (Feature 11) spezifiziert.
*   **Mermaid-Diagramme:** Visuelle Systemarchitektur und Spec-Kit-Lifecycle in `README.md` eingebettet.
*   **Zustandsdiagramm:** Toast-Queue-Lifecycle in `ADR-FEATURE.md` verankert.
*   **Netzwerkdiagramm:** Asynchroner Ablauf des Dual-Provider Adressdienstes in `ADR-API.md` integriert.
*   **YAML Frontmatter:** Obsidian- und KI-kompatible Metadaten-Blöcke an den Anfang aller 7 ADR-Dateien gestellt.
*   **Guides:** Das zentrale Fachbegriff-Glossar **[glossary.md](Guides/glossary.md)** mit integrierten CSS-Container-Skizzen angelegt.
*   **Guides:** Der interaktive manuelle QA-Testleitfaden **[testing-guide.md](Guides/testing-guide.md)** für alle Baseline-Features 1 bis 6 erstellt.
*   **Entscheidungs-Log:** Das chronologische Logbuch **[DECISION-LOG.md](DECISION-LOG.md)** zur historischen Nachverfolgbarkeit aller Systementscheidungen angelegt.
*   **Maschinen-Index:** Die Datei **[index.json](index.json)** als maschinenlesbarer Index aller Dokumente angelegt.

### Changed
*   **README.md:** Zum zentralen Master-Portal und Dokumenten-Wegweiser ausgebaut und Links zu den neuen Guides `DEV-INFO.md` und `README-DB.md` unter den Status & Spezifikationen ergänzt.
*   **index.json:** Um Metadaten-Einträge für `DEV-INFO.md` und `README-DB.md` erweitert.
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'CHANGELOG.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'CHANGELOG.md'), 'changelog');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'CHANGELOG.md'), 'history');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'constitution.md',
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'constitution.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'constitution.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'constitution.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'DECISION-LOG.md',
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
*   **Quelle:** Ordner `[ADR/](ADR/)`
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
*   **Quelle:** [ADR/](ADR/), [index.json](index.json)
*   **Status:** Aktiviert

---

### 2026-05-24 – Etablierung des Entwicklerbereichs & Feature-Prüfung (DEV-INFO.md)
*   **Entscheidung:** Schaffung einer dedizierten Diagnose-Referenz `DEV-INFO.md` zur systematischen Erkennung von 14 W3C-Living-Standards und experimentellen Features auf Basis von `check_readiness.js`.
*   **Grund:** Bietet vollständige Transparenz über den Reifegrad modernster Web-APIs in der Chrome 147/148/149+ Zielumgebung und liefert ein robustes, kopierbares F12-Konsole-Skript.
*   **Quelle:** [[DEV-INFO|DEV-INFO.md]], [index.json](index.json)
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
*   **Quelle:** [[README-DB|README-DB.md]], [index.json](index.json), `build_db.js`, `github_action_workflow.txt`
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DECISION-LOG.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DECISION-LOG.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DECISION-LOG.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DECISION-LOG.md'), 'decision-log');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DECISION-LOG.md'), 'architecture');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'DEV-INFO.md',
  'Entwicklerbereich & Feature-Prüfung',
  'active',
  '# 🛠️ DIN-BriefNEO — Entwicklerbereich & Feature-Prüfung

Dieses Dokument dient als zentrale Single Source of Truth (SSoT) für die Validierung moderner Webtechnologien im Kontext unserer **Chrome 147/148/149+ Baseline**. Es basiert auf der originalen `check_readiness.js` und wurde massiv erweitert, um **25 absolute Bleeding-Edge-Features** der modernen Web-Plattform systematisch zu erkennen. 

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
.premium-dev-popover #diag-table {
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'dev-tools');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'feature-detection');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'chrome-baseline');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'diagnostics');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'easter-egg');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'DRINGEND NOCH BEHEBEN.md',
  'DRINGEND NOCH BEHEBEN',
  'active',
  'Danke, dass du diesen sehr detaillierten System-Prompt teilst. Du möchtest wissen, ob hier alles stimmig ist oder ob es Unstimmigkeiten gibt. Da ich als strenger Architekturbewerter agiere, habe ich ihn genau analysiert.

Die kurze Antwort: Der Prompt ist eine extrem wertvolle und strukturierte Momentaufnahme des Projekts, aber er enthält mehrere **schwerwiegende innere Widersprüche und Sync-Fehler**, die einen neuen KI-Assistenten sofort in architektonische Fallen laufen lassen würden. Diese müssen bereinigt werden, bevor der Prompt als verlässliches SSoT dienen kann.

Hier ist die detaillierte Fehleranalyse:

---

### Kritische Unstimmigkeiten (Müssen behoben werden)

#### 1. Gravierender Widerspruch im Changelog (`[F-001]`)
*   **Das Problem:** Die Präambel des Changelogs behauptet fälschlicherweise: *"Dieses Changelog trackt **ausschließlich** Dokumentations-, Planungs- und Verifikationsänderungen. Aufgrund der aktiven `.SPEC-ONLY-PHASE` wurden im aktuellen Release **keine** Änderungen am produktiven Programmquellcode (HTML, CSS, JS) vorgenommen."*
*   **Die Wirklichkeit im selben Dokument:** Genau dieses Changelog listet *danach* detailliert massive produktive Code-Änderungen auf (CSS Anchor Positioning, View Transitions API, OKLCH-Mandat, @scope-Isolation etc.).
*   **Die Folge:** Ein neuer KI-Assistent liest die Präambel und hält jegliche Diskussion über die gelisteten Code-Upgrades für einen Irrtum. Die `.SPEC-ONLY-PHASE` wird zudem im Changelog selbst als beendet erklärt, was dem einleitenden Satz doppelt widerspricht. Diese Inkonsistenz macht das gesamte Dokument als SSoT unglaubwürdig.

#### 2. Kategoriale Fehlbewertung in `DEV-INFO.md` (`[F-004]`)
*   **Das Problem:** Die Einleitung beschreibt korrekt die Philosophie, dass auf Basis von Chrome 148+ auch modernste Standards "Aktiviert (Produktiv)" sein können. Die darauf folgende Feature-Tabelle (`Field-Sizing`, `light-dark`, etc. sind als "Produktiv" markiert) setzt das aber inkonsequent um.
*   **Die Inkonsistenz:** Für das Projekt hochrelevante Features, die nachweislich in Chrome 148 funktionieren und teilweise bereits implementiert sind, werden in der Tabelle als **"Future-Proof (Inaktiv)"** geführt. Die krassesten Beispiele sind:
    *   **CSS Anchor Positioning:** Laut Changelog das Herzstück der Dropdown-Modernisierung. In `DEV-INFO` als "Inaktiv" markiert. Eine neue KI würde versuchen, diesen JS-Code zu "schützen", den es längst nicht mehr gibt.
    *   **View Transitions API:** Laut Changelog für Form-/Theme-Wechsel implementiert. In `DEV-INFO` als "Inaktiv" markiert.
    *   **CSS @scope:** Ebenfalls als "Inaktiv" markiert, obwohl für das Briefblatt implementiert.
*   **Die Folge:** Diese Tabelle ist das zentrale Bewertungsraster für Technologie-Entscheidungen. Ihre Fehlklassifizierungen führen zu fundamental falschen Architekturentscheidungen.

#### 3. Phantom-Phase: Der `.SPEC-ONLY-PHASE`-Widerspruch
*   **Das Problem:** Der Prompt beginnt mit einem scharfen Hinweis auf die `.SPEC-ONLY-PHASE`. Die Dateien `CHANGELOG.md` und `DECISION-LOG.md` im Prompt-Kontext dokumentieren aber bereits deren Aufhebung und die erfolgte Implementierung.
*   **Die Folge:** Eine neue KI könnte auf Basis dieses Prompts jegliche Code-Arbeit verweigern, weil die offizielle SSoT immer noch das Gegenteil behauptet. Die Systemdokumentation hängt in diesem Punkt der Realität hinterher.

#### 4. Technischer Anzeigefehler
*   **Das Problem:** Im CSS-Codebeispiel des Easter-Egg-Popovers in `DEV-INFO.md` (`[F-004]`) gibt es einen strukturellen Fehler. Zwei CSS-Selektoren (`#diag-table` und `#diag-table th`) wurden ohne den vorangestellten Selektor notiert. Beim Kopieren und Einfügen entsteht so ungültiges CSS.
*   **Die Folge:** Ein Nebenschauplatz, aber symptomatisch für kleine Unachtsamkeiten in einem ansonsten hochpräzisen Dokument.

### Bewertung und nächster Schritt

Die Basis des Prompts ist exzellent: Die Datei-Landkarte, die semantischen Tags und die Einbettung der Inhalte ergeben ein mächtiges Werkzeug. Aber die aufgezeigten Widersprüche zwischen den deklarierten Prinzipien und den dokumentierten Fakten sind gravierend. Sie machen den Prompt in seiner jetzigen Form unzuverlässig.

Die dringendste Aufgabe ist es, eine eindeutige, nachvollziehbare Wahrheit in den drei zentralen Dokumenten herzustellen:
1.  **`CHANGELOG.md`:** Die obsolete Präambel muss den aktuellen Gegebenheiten angepasst werden.
2.  **`DEV-INFO.md`:** Die Feature-Tabelle muss akribisch mit den tatsächlich implementierten Technologien abgeglichen und die Status-Labels korrigiert werden.
3.  **`MASTER-DO-DONT-DEPRECATED.md`:** Der Hinweis auf die `.SPEC-ONLY-PHASE` muss entfernt werden.

Soll ich für diese drei Punkte eine detaillierte, auf den Punkt genaue Korrekturanweisung erstellen, damit du die Änderungen selbst vornehmen kannst? Das wäre der letzte Schliff, um aus einem guten SSoT ein unerschütterliches Fundament zu machen.


Ich habe den zweiten Block des PLATINUM AI CONTEXT BUNDLE (F-010 bis F-025) genauso akribisch durchgearbeitet wie den ersten. Erneut zeigen sich mehrere **schwerwiegende Widersprüche zwischen dem dokumentierten Planungsstand und der tatsächlich bereits umgesetzten, hochmodernen Architektur**. Diese Unstimmigkeiten machen den System Prompt auch hier unzuverlässig.

Hier die detaillierte Analyse jedes relevanten Dokuments:

---

### Kritische Unstimmigkeiten im zweiten Block

#### 1. `README.md` (`F-011`) – Veralteter Phase-Lock und Mermaid-Diagramm

*   **Das Problem:** Das Master-Portal behauptet weiterhin, das Projekt befinde sich in einer reinen Planungsphase:
    *   *".SPEC-ONLY-PHASE Lockfile: Zeigt an, dass der produktive Quellcode derzeit eingefroren ist und sich das Projekt in einem reinen Planungs-, Dokumentations- und Verifikations-Lifecycle befindet."*
    *   Das zugehörige Mermaid-Diagramm („Spec-Kit-Lifecycle“) enthält den Knoten `LockCheck{Sperrdatei .SPEC-ONLY-PHASE aktiv?}` und blockiert die Implementierung.
*   **Die Wirklichkeit:** Die `.SPEC-ONLY-PHASE` wurde längst aufgehoben, und es wurden massive produktive Code-Upgrades (CSS Anchor Positioning, View Transitions, @scope etc.) implementiert, wie das Changelog und die ADRs dokumentieren.
*   **Die Folge:** Das zentrale Einstiegsdokument vermittelt einer neuen KI einen komplett falschen Projektzustand. Sie könnte sich weigern, über Code-Änderungen zu diskutieren, weil das „Gesetz“ noch aktiv zu sein scheint.

#### 2. `ROADMAP.md` (`F-012`) – Überholter Schutzstatus

*   **Das Problem:** Der Warnhinweis zu Beginn ist identisch veraltet:
    *   *"> [!WARNING] Aktueller Status: Keine Umsetzung in absehbarer Zeit geplant. Der Code verbleibt unter dem Schutz der `.SPEC-ONLY-PHASE` stabil eingefroren."*
*   **Die Wirklichkeit:** Der Code ist alles andere als eingefroren. Die Roadmap-Ideen können nun im Lichte der neuen Baseline (View Transitions API, Temporal API) neu bewertet werden, auch wenn sie weiterhin nur Brainstorming sind. Die Aussage ist sachlich falsch.
*   **Die Folge:** Die KI wird die Roadmap als absolut irrelevant einstufen, da sie unter dem Deckmantel eines nicht existenten Locks steht.

#### 3. `spec.md` (`F-013`) – Fundamentaler Architekturfehler in der Kernspezifikation

*   **Das Problem:** Die Spezifikation für das Kernfeature **Proportionaler CSS-Zoom** beschreibt eine veraltete, verworfene Implementierung:
    *   *"Ein `ResizeObserver` überwacht das Eltern-Element... Das Script berechnet das Skalierungsverhältnis... Der berechnete Zoom-Faktor wird als CSS Custom Property `--paper-zoom` geschrieben... Das Briefblatt nutzt `transform: scale(var(--paper-zoom))`"*
*   **Die Wirklichkeit:** Diese gesamte JS-basierte Skalierungslogik (ResizeObserver, `--paper-zoom`, `transform`) wurde in der tatsächlichen Architektur durch eine **rein deklarative, performantere CSS-Lösung** ersetzt: `height: 94vh; aspect-ratio: 210/297; container-type: size;` mit `cqw`/`cqh`-Einheiten. Die `spec.md` beschreibt also ein Phantom-Feature, das so nie gebaut wurde.
*   **Die Folge:** Dies ist ein schwerer SSoT-Bruch. Eine KI, die die Spezifikation als Bauplan nimmt, würde versuchen, das falsche, JS-lastige System zu implementieren oder zu "schützen".

#### 4. `tasks.md` (`F-014`) – Erfolgreich abgehakte, aber verworfene Aufgaben

*   **Das Problem:** Die Taskliste markiert mehrere Aufgaben als `[x]` (erledigt), deren Ergebnisse im finalen Code entweder nie existierten oder bewusst wieder entfernt wurden. Die gravierendsten Beispiele:
    *   `"Selection-Event-Listener zur Positionsberechnung mit 50ms Debouncing... programmieren"`
    *   `"Toolbar-Positionierung mit Viewport-Kollisionsprüfung... integrieren"`
    *   `"Toast-Popover mit animationend Kopplung für JS-Lifecycle-Cleanups (hidePopover) ausstatten"`
*   **Die Wirklichkeit:** Das JS-Debouncing und die manuelle Toolbar-Positionierung wurden durch **CSS Anchor Positioning** eliminiert. Der `animationend`-Listener für Toasts wurde durch eine Kombination aus `@starting-style`, `transition-behavior: allow-discrete` und einem simplen `setTimeout` ersetzt.
*   **Die Folge:** Die Taskliste dokumentiert Arbeitspakete, die nicht mehr zum System gehören. Das ist irreführend und suggeriert, der Code enthalte noch diese komplexe, fragile JS-Logik.

#### 5. `ADR-TECH-STACK.md` (`F-021`) – Veraltete Technik im Technologie-Stack

*   **Das Problem:** Die Tabelle der verwendeten Technologien listet noch die obsolete Toast-Steuerung:
    *   *"`animationend` Event + JS Safety Net | Popover Toast-Lebenszyklus | Fängt das Ende der CSS-Toast-Animationen ab... Ein paralleles 3.200ms Safety Timeout..."*
*   **Die Wirklichkeit:** Wie in Punkt 4 beschrieben, wurde der `animationend`-Listener vollständig aus dem Code entfernt. Der Toast-Lebenszyklus wird jetzt komplett über CSS-Transitions und einen einfachen JS-Timer gesteuert.
*   **Die Folge:** Der Tech-Stack behauptet, eine Technik zu nutzen, die aktiv aus dem Projekt verbannt wurde. Das ist ein direkter Widerspruch zur Architektur-Entscheidung.

#### 6. Zusätzliche kleinere Unstimmigkeiten

*   **`README-DB.md` (`F-010`):** Die Beispiel-SQL-Abfragen referenzieren die Tabelle `documents`. Das ist korrekt. Der Dateiname `DIN-Brief_docs.db` wird konsistent verwendet. **Kein Fehler.**
*   **`ADR-ANTIPATTERN.md` (`F-015`):** Alle neuen Antipatterns (Temporal, OKLCH) sind korrekt dokumentiert. **Kein Fehler.**
*   **`ADR-CSS.md` (`F-017`)** und **`ADR-FEATURE.md` (`F-018`):** Die Entscheidungen zu Anchor Positioning, @property, @scope und diskreten Transitions sind aktuell. **Keine Fehler.**

---

### Zusammenfassung der Befunde

Die Dateien aus dem zweiten Block sind zwar inhaltlich detailreich und auf einem hohen architektonischen Niveau, aber sie sind nicht als System synchron. Der Bruch zwischen dem alten Planungsstand (der `spec.md`, `tasks.md`, `ROADMAP.md` und `README.md`) und der neuen, bereits umgesetzten W3C-Architektur (der `ADR-CSS.md`, `ADR-FEATURE.md` und `ADR-JS.md`) ist eklatant.

Ein KI-Assistent, der diesen Prompt als SSoT nutzt, würde zwangsläufig fehlerhafte Entscheidungen treffen, weil er z. B. versuchen würde, die aufwändige JS-Zoom-Logik aus der `spec.md` zu bauen, während der reale Code eine viel modernere CSS-Lösung verwendet. Ebenso würde er den `animationend`-Listener als gültiges Pattern ansehen, das längst entfernt wurde.

Die dringendsten Korrekturen sind:
1.  **`spec.md`:** Muss von der alten JS-basierten Skalierung auf die neue CSS-Container-Lösung umgeschrieben werden.
2.  **`README.md` und `ROADMAP.md`:** Die Hinweise auf die aktive `.SPEC-ONLY-PHASE` müssen entfernt werden.
3.  **`tasks.md`:** Die überholten Tasks müssen entweder als "deprecated" markiert oder durch die tatsächlich umgesetzten Schritte ersetzt werden.
4.  **`ADR-TECH-STACK.md`:** Der Eintrag "`animationend` Event" muss durch die neue, CSS-getriebene Toast-Steuerung ersetzt werden.

Soll ich für diese spezifischen Punkte die präzisen Korrekturanweisungen formulieren, damit du die Dokumente selbst auf den neuesten Stand bringen kannst? Damit wäre der SSoT endlich wieder ein verlässliches Abbild der Realität.Ich habe den dritten und letzten Block des System-Prompts gescannt. Erneut tritt dasselbe Grundproblem auf: Die hochmoderne Architektur-Dokumentation hat die reale Codebasis in einigen entscheidenden Punkten überholt, ohne dass der Code angepasst wurde. Das führt zu einer gefährlichen Diskrepanz zwischen der Soll- und Ist-Architektur. Hier die detaillierte Analyse:

---

### **Graveierende Funde: Die Dokumentation verbietet, was der Code noch tut**

#### **1. Verbotene `execCommand`-Nutzung in `main.js` (`[F-036]`)**

*   **Das Verbot:** Die `longevity-guidelines.md` (`[F-026]`) und `ADR-ANTIPATTERN.md` (`[F-015]`) erklären `document.execCommand` für **strikt verboten und deprecated**. Die ADR schreibt die exklusive Nutzung der Selection & Range API vor.
*   **Die Realität im Code:** In `main.js` (`[F-036]`) wird `execCommand` **weiterhin aktiv verwendet**:
    *   `document.execCommand(''bold'', false, null);` (im `btnBold`-Handler)
    *   `document.execCommand(''underline'', false, null);` (im `btnUnderline`-Handler)
*   **Die Folge:** Das Herzstück der Textformatierung basiert auf einer verbannten Technologie. Jede KI, die den Architektur-Leitlinien folgt und eine moderne Lösung vorschlägt, würde mit Code kollidieren, der noch auf einem Antipattern beruht.

#### **2. Fehlende CSS Anchor Positioning in `main.js`**

*   **Die Spezifikation:** `ADR-CSS.md` (`[F-017]`) und `ADR-FEATURE.md` (`[F-018]`) beschreiben detailliert, dass die Positionierung der Formatierungs-Toolbar **vollständig deklarativ über CSS Anchor Positioning** erfolgt und jegliche JavaScript-Koordinatenberechnung eliminiert wurde.
*   **Die Realität im Code:** In `main.js` (`[F-036]`) berechnet die Funktion `handleSelectionChange` die Position der Toolbar **immer noch vollständig manuell in JavaScript**:
    *   Sie liest `rect.top`, `rect.left`, `formatToolbar.offsetHeight`, `window.innerWidth`.
    *   Sie berechnet die horizontale Zentrierung (`rect.left + rect.width / 2 - formatToolbar.offsetWidth / 2`).
    *   Sie wendet die Positionen über `formatToolbar.style.top` und `formatToolbar.style.left` an.
*   **Die Folge:** Das Kernstück der Modernisierung – die Entlastung von JS-Layout-Berechnungen – wurde nie in den Code überführt. Der Code tut genau das, was die ADR als veraltete Methode beschreibt. Das ist ein eklatanter Widerspruch.

#### **3. Veraltetes Skalierungskonzept in `no-scroll-techniques.md` (`[F-027]`)**

*   **Das Problem:** Der Guide präsentiert die **veraltete, verworfene Skalierungsmethode** für das DIN-A4-Blatt als aktuellen Standard:
    *   `transform: scale(var(--zoom-factor, 1));`
    *   Ein JavaScript-ResizeObserver, der `--paper-zoom` setzt.
*   **Die Wirklichkeit:** Wie bereits in der Analyse von `spec.md` festgestellt, ist diese JS-basierte Skalierung längst durch eine **rein deklarative CSS-Lösung** (`height: 94vh; aspect-ratio: 210/297; container-type: size;`) in `layout.css` ersetzt worden.
*   **Die Folge:** Das Dokument zur Scroll-Verhinderung empfiehlt eine Skalierungstechnik, die nicht mehr Teil der Architektur ist. Eine KI, die diesen Guide befolgt, würde das Projekt auf eine veraltete und problematische Codebasis zurückwerfen.

---

### **Zusammenfassung und Empfehlung**

Die Diskrepanz ist nun glasklar: Die System-Dokumentation (ADRs, Specs, Guides) beschreibt ein **hochmodernes, aufgeräumtes und JS-armes Zielsystem**, das auf den neuesten W3C-Standards basiert. Der eigentliche Quellcode (`main.js`) hinkt dieser Vision jedoch an zwei entscheidenden Stellen hinterher: Er verwendet noch die verbannten Methoden `execCommand` für die Textformatierung und eine manuelle JavaScript-Positionierung für die Toolbar, die laut Doku durch CSS Anchor Positioning ersetzt sein sollte.

Der Prompt ist daher als SSoT nur dann verlässlich, wenn er entweder den aktuellen (veralteten) Code-Stand widerspiegelt oder wenn der Code an die dokumentierte Architektur angeglichen wird. Die jetzige Mischung ist irreführend und macht eine konsistente KI-Unterstützung unmöglich, da die "Wahrheit" der ADRs mit der "Wahrheit" des Codes im Konflikt steht.

**Die dringendsten Maßnahmen zur Bereinigung sind:**
1.  **`main.js`** (`[F-036]`) muss an die dokumentierte Architektur angeglichen werden: Ersatz von `execCommand` durch die Selection/Range API und Entfernung der manuellen Toolbar-Positionierung zugunsten von CSS Anchor Positioning.
2.  **`no-scroll-techniques.md`** (`[F-027]`) muss von der alten `transform: scale()`-Methode auf die aktuelle CSS-Container-Lösung aktualisiert werden.

Erst wenn diese Code- und Dokumentationslücken geschlossen sind, ist das Projekt ein echtes, in sich geschlossenes "digitales Denkmal". Soll ich die detaillierte Korrektur der `main.js` als reinen Text ausformulieren, damit du die Änderungen selbst vornehmen kannst?',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DRINGEND NOCH BEHEBEN.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'FEATURE-INVENTORY.md',
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'FEATURE-INVENTORY.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'FEATURE-INVENTORY.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'FEATURE-INVENTORY.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/chrome-modern-css.md',
  'Modern CSS Features ab Chrome 148+',
  'active',
  '# Modern CSS Features ab Chrome 148+

> [!important] Chrome 148+ Exklusivität
> Da die Anwendung exklusiv für moderne Browser-Installationen ab Chrome 148+ entwickelt wird, können wir modernste APIs einsetzen. Dieses Dokument dient als Entwicklungs-Referenz für die erlaubten und empfohlenen Features.

---

## 1. Hell-/Dunkelmodus mit `light-dark()`
Keine JavaScript-Klassen-Toggles oder doppelte CSS-Regelsätze mehr. Wir definieren unsere Themes nativ über Custom Properties:

```css
:root {
  /* Browser anweisen, beide Farbschemen zu unterstützen */
  color-scheme: light dark;

  /* Farbräume dynamisch zuweisen */
  --bg-primary: light-dark(#ffffff, #121212);
  --text-primary: light-dark(#111111, #eeeeee);
  --border-color: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.15));
}
```

---

## 2. Der `oklch()` Farbraum
Für moderne Farbverläufe und barrierefreie Kontraste nutzen wir OKLCH. Es bietet im Vergleich zu HEX oder RGB einen wahrnehmungsbasierten Farbraum, in dem Helligkeitsänderungen konsistent wirken.

```css
:root {
  /* oklch(Luminanz Chroma Farbton) */
  --accent-color: oklch(65% 0.25 140); /* Leuchtendes, sattes Grün */
  --accent-hover: oklch(60% 0.23 140);
  --danger-color: oklch(62% 0.22 28);  /* Sattes Signalrot */
}
```

---

## 3. CSS Anchor Positioning
Tooltips und Dropdown-Menüs können im Markup frei platziert (z. B. am Ende des Bodys) und über CSS relativ an ein anderes Element verankert werden, ohne JavaScript zu bemühen:

```css
/* Der Auslöser */
#btn-open-menu {
  anchor-name: --menu-trigger;
}

/* Das Popover / Tooltip */
#dropdown-menu {
  position: absolute;
  position-anchor: --menu-trigger;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 4px;
}
```

---

## 4. `field-sizing: content`
Ideal für editierbare Formulare oder den Fließtext des Briefes. Eingabefelder passen ihre Größe dynamisch der Textmenge an, ohne dass das Layout springt.

```css
textarea, input[type="text"], [contenteditable] {
  field-sizing: content;
  min-width: 100px;
}
```

---

## 5. Die `:has()` Pseudo-Klasse (Parent Selector)
Die mächtigste CSS-Erweiterung der letzten Jahre. Sie ermöglicht es uns, übergeordnete Elemente basierend auf dem Zustand ihrer Kinder zu stylen:

```css
/* Ändert die Hintergrundfarbe des Viewports, wenn die Guides-Checkbox ausgewählt ist */
#paper-viewport:has(#state-guides:checked) din-a4 {
  --guide-opacity: 0.15;
}

/* Sidebar verkleinern, wenn ein Toggle aktiv ist */
#app-shell:has(#sidebar-collapse:checked) {
  grid-template-columns: 80px 1fr;
}
```

---

## 6. HTML Popover API & Invoker Commands
Einblenden und Schließen von Menüs und Dialogen ohne eine einzige Zeile JavaScript-EventListener:

```html
<!-- Der Auslöser -->
<button popovertarget="debug-menu">🛠️ Debug-Menü</button>

<!-- Das Popover-Element -->
<div id="debug-menu" popover>
  <h4>Entwickler-Werkzeuge</h4>
  <p>Status: Aktiv</p>
</div>
```


## Feature Checks
```javascript feature-check
f("CSS @scope (Isolation)", typeof CSSScopeRule !== "undefined", "Chrome 118", "Future-Proof"),
f("CSS Anchor Positioning", typeof CSS !== "undefined" && CSS.supports && CSS.supports("anchor-name: --foo"), "Chrome 125", "Future-Proof"),
f("CSS light-dark()", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: light-dark(black, white)"), "Chrome 123", "Produktiv"),
f("CSS Relative Color Syntax", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: oklch(from red l c h)"), "Chrome 119", "Produktiv")
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/chrome-modern-css.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/chrome-modern-css.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/chrome-modern-css.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/chrome-modern-css.md'), 'manual');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/chrome-modern-css.md'), 'css');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/din-5008-geometry.md',
  'DIN 5008 Geometry Master Data (SSoT)',
  'active',
  '# DIN 5008 Geometry Master Data (SSoT)

> [!important] Single Source of Truth
> Dieses Dokument dient als das absolute und hochpräzise **Single Source of Truth (SSoT)** Regelwerk für alle physischen Abstände, Geometrien, Schriftgrößen und Positionen der Anwendung **DIN-BriefNEO**.

---

## 1. Physische Blattgeometrie & Ränder
Ein DIN A4 Blatt hat die festen physischen Maße **210 mm Breite × 297 mm Höhe**.

| Parameter | Standard-Maß (DIN 5008) | Implementierungs-Maß (SSoT) | Quelle |
| :--- | :--- | :--- | :--- |
| **Blattbreite** | 210 mm | `100cqw` | DIN A4 Standard |
| **Blatthöhe** | 297 mm | `100cqh` | DIN A4 Standard |
| **Linker Seitenrand** | 25 mm | `11.905cqw` (25/210) | DIN 5008, Abs. 6.1 (Lochrand) |
| **Rechter Seitenrand** | 20 mm (Min: 8.1 mm) | `9.524cqw` (20/210) | DIN 5008, Abs. 6.2 |
| **Oberer Seitenrand (Form A)** | 27 mm | `9.091cqh` (27/297) | DIN 5008, Abs. 6.3 (Header-Start A) |
| **Oberer Seitenrand (Form B)** | 45 mm | `15.152cqh` (45/297) | DIN 5008, Abs. 6.3 (Header-Start B) |
| **Unterer Seitenrand** | 20 mm (Min: 10 mm) | `6.734cqh` (20/297) | DIN 5008, Abs. 6.4 |

---

## 2. Das Anschriftfeld (Empfängeradresse)
Das Anschriftfeld hat die festen Maße **85 mm Breite × 45 mm Höhe** und befindet sich linksbündig an der Fluchtlinie (`25 mm` vom linken Blattrand).

| Parameter / Zone | Form A | Form B | Schriftgröße | Max. Zeilen | Quelle |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Beginn Anschriftfeld (Y)** | **27 mm** | **45 mm** | — | — | DIN 5008, Abs. 16.1.4 |
| **Breite Anschriftfeld** | 85 mm | 85 mm | — | — | DIN 5008, Abs. 16.1.4 |
| **Höhe Anschriftfeld** | 45 mm | 45 mm | — | — | DIN 5008, Abs. 16.1.4 |
| **1. Zone: Rücksendezeile** | Y: 27 – 32 mm | Y: 45 – 50 mm | max. 8 pt (**2.82 mm**) | 1 Zeile (fix) | DIN 5008, Abs. 16.1.2 |
| **2. Zone: Zusatz/Vermerk** | Y: 32 – 44.7 mm | Y: 50 – 62.7 mm | 10 – 11 pt (**3.53 – 3.88 mm**) | 3 Zeilen | DIN 5008, Abs. 16.1.3 |
| **3. Zone: Empfängeranschrift**| Y: 44.7 – 72 mm | Y: 62.7 – 90 mm | 10 – 11 pt (**3.53 – 3.88 mm**) | 6 Zeilen | DIN 5008, Abs. 16.1.4 |

---

## 3. Absender-Zone (Branding / Header)
Die Absender-Zone nimmt den oberen Briefkopf (Branding-Bereich) ein.

| Parameter | Form A | Form B | Schriftgröße | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Branding-Bereich (Y-Spanne)** | 0 mm bis 27 mm | 0 mm bis 45 mm | — | DIN 5008, Abs. 16.1 |
| **Absender-Zustelladresse (X)** | 25 mm | 25 mm | 10 pt (**3.53 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Absender-Zustelladresse (Y)** | ab 27 mm | ab 45 mm | 10 pt (**3.53 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Firmenlogo (SVG/Base64)** | Rechtsbündig | Rechtsbündig | — | `eigenequellen/DIN-BriefNEO/issues/#1` |

---

## 4. Informationsblock & Datum
Der Informationsblock befindet sich rechts oben und wächst von oben nach unten.

| Parameter | Form A | Form B | Ausrichtung | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Infoblock Beginn (X)** | 125 mm | 125 mm | Linksbündig | DIN 5008, Abs. 17.1 |
| **Infoblock Breite** | 75 mm | 75 mm | — | DIN 5008, Abs. 17.1 |
| **Infoblock Beginn (Y)** | **32 mm** | **50 mm** | Linksbündig | DIN 5008, Abs. 17.1 |
| **Schriftgröße Infoblock** | 8.5 pt (**3.00 mm**) | 8.5 pt (**3.00 mm**) | — | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Briefdatum (X)** | 125 mm | 125 mm | Linksbündig | DIN 5008, Abs. 17.2 |
| **Briefdatum (Y)** | **74 mm** | **92 mm** | Linksbündig (10 pt / **3.53 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |

---

## 5. Briefkern (Kernbereich)
Der Kernbereich enthält Betreff, Anrede, Text, Grußformel und Unterschrift.

| Parameter | Form A | Form B | Schriftgröße | Quelle / Detail |
| :--- | :--- | :--- | :--- | :--- |
| **Beginn Briefkern (Y)** | **85.4 mm** | **103.4 mm** | — | DIN 5008, Abs. 18 & 19 |
| **Linke Fluchtlinie (X)** | 25 mm | 25 mm | — | DIN 5008, Abs. 6.1 |
| **Rechte Begrenzung (X)** | 190 mm | 190 mm | — | DIN 5008, Abs. 6.2 (210mm - 20mm) |
| **Maximal-Breite** | 165 mm | 165 mm | — | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Betreffzeile (Y)** | 85.4 mm | 103.4 mm | 12 pt (**4.23 mm**, fett) | DIN 5008, Abs. 18 (Max. 2 Zeilen) |
| **Abstand Betreff zu Anrede** | 2 Leerzeilen (**8.46 mm**) | 2 Leerzeilen (**8.46 mm**) | 10.5 pt (**3.70 mm**) | DIN 5008, Abs. 19 |
| **Anredezeile (Y)** | 100.4 mm | 118.4 mm | 10.5 pt (**3.70 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Abstand Anrede zu Text** | 1 Leerzeile (**4.23 mm**) | 1 Leerzeile (**4.23 mm**) | 10.5 pt (**3.70 mm**) | DIN 5008, Abs. 20 |
| **Brieftext Start (Y)** | **110.4 mm** | **128.4 mm** | 10.5 pt (**3.70 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Zeilenabstand** | **1.4** (ca. 5.18 mm) | **1.4** (ca. 5.18 mm) | — | DIN 5008, Abs. 20 |
| **Grußformel (Y)** | Dynamisch (Ende) | Dynamisch (Ende) | 10.5 pt (**3.70 mm**) | 1 Leerzeile Abstand zum Text |
| **Unterschrift (Y)** | Dynamisch (Ende) | Dynamisch (Ende) | 10.5 pt (**3.70 mm**) | 3 Leerzeilen für Unterschrift |

---

## 6. Faltmarken & Lochmarke
Die Hilfsmarken dienen der physischen Faltung und Lochung. Die Y-Werte beziehen sich auf den Abstand vom oberen Blattrand.

| Hilfsmarke | Form A | Form B | Breite / Stil | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Falzmarke 1 (oben)** | **87 mm** | **105 mm** | 3 mm (horizontal) | DIN 5008, Abs. 25 (var(--start) + 60mm) |
| **Falzmarke 2 (unten)** | **181 mm** | **199 mm** | 3 mm (horizontal) | DIN 5008, Abs. 25 (var(--start) + 154mm) |
| **Lochmarke (Mitte)** | **148.5 mm** | **148.5 mm** | 5 mm (horizontal) | DIN 5008, Abs. 25 (exakt Blatthöhe / 2) |

---

## 7. Fußzeile (Footer)
Die Fußzeile ist vier-spaltig aufgebaut und schließt das Blatt nach unten ab.

| Parameter | Form A & B | Details | Quelle |
| :--- | :--- | :--- | :--- |
| **Beginn Fußzeile (Y)** | **241 mm** | Feste vertikale Position | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Fußzeilen-Breite** | 165 mm | X: 25 mm bis X: 190 mm | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Spaltenanzahl** | 4 Spalten | Je 25 % Breite | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Schriftgröße** | 7.5 pt (**2.65 mm**) | Kleine, serifenlose Schrift | `eigenequellen/DIN-BriefNEO/issues/#1` |

---

## 8. Verhalten von Kopf- und Fußzeilen auf Folgeseiten
Gemäß dem DIN 5008 Standard für mehrseitige Briefe gelten für alle Folgeseiten (Seite 2+) folgende strikte Ausblendregeln:

- **Briefkopf (Absender & Branding):** Wird auf Folgeseiten vollständig **ausgeblendet**.
- **Anschriftfeld (Empfängeradresse):** Wird auf Folgeseiten vollständig **ausgeblendet**.
- **Informationsblock & Datum:** Werden vollständig **ausgeblendet**.
- **Faltmarken & Lochmarke:** Die Falzmarken (Falz oben, Falz unten) entfallen auf Folgeseiten, um das Druckbild rein zu halten. Die mittlere Lochmarke bleibt optional erhalten.
- **Seitenkopf-Zeile (Folgeseiten-Header):** Erhält eine dezente Zeile am oberen Rand (Y: 20 mm) mit der Paginierung (z. B. "Brief vom [Datum], Seite [X]") in 9 pt.
- **Fußzeile (Footer):** Bleibt auf allen Folgeseiten einheitlich zur Primärseite bei Y: 241 mm eingeblendet.

---

## 9. Überlauf- und Validierungsregeln (Checkliste weiche Anforderungen)
Um Layout-Sprengungen und unkontrolliertes Fließen (unter der No-Scroll-Bedingung) zu verhindern, gelten folgende Interaktions-Sperren:

### A. Empfängerfeld (Anschriftfeld)
- **Limit:** Maximal **6 Zeilen** Text in der Anschriftzone.
- **Verhalten bei Überlauf:** Wenn der eingegebene Text 6 Zeilen überschreitet (bzw. die Zone aus ihrer Begrenzung von 27.3 mm überfließt), erhält der Container einen **visuellen Warnrahmen** (rote gestrichelte Linie), und die Eingabe weiterer Zeilenumbrüche (Enter) wird blockiert. Das Löschen von Text hebt den Warnzustand wieder auf.

### B. Betreffzeile
- **Limit:** Maximal **2 Zeilen** Text.
- **Verhalten bei Überlauf:** Ähnlich dem Anschriftfeld blockiert das Keydown-Event ein weiteres Eingeben von Enter-Zeilenumbrüchen, sobald 2 Zeilen gefüllt sind. Visuelle Warnmarkierung wird aktiv.

### C. Brieftext & Paginierungs-Schnittstelle
- **Verhalten bei Überlauf:** Da Scrollen verboten ist, muss verhindert werden, dass Text über das untere Ende des Briefkerns hinausgeschrieben wird.
- **Implementierung:** 
  1. Sobald der geschriebene Text im `<din-text>`-Element die maximale vertikale Begrenzung (Y: 230 mm, also kurz vor Beginn der Fußzeile) berührt, färbt sich der Rand des Briefblatts dezent rot, und ein Toast-Hinweis meldet: *"Seite voll. Bitte neue Seite anlegen."*
  2. Der Anwender kann nun über den Navigationsknopf `+` eine Folgeseite anlegen. Der Cursor springt automatisch in das Textfeld der Folgeseite.
  3. *Langfristiger Ausblick:* Der Text wird später bei Erreichen des Seitenendes automatisch gesplittet und der Rest auf die Folgeseite verschoben (Auto-Pagination).

---

## 10. Dokumenten-Quellen-Verzeichnis (Citations)
Jede Zahl in diesem Dokument wurde penibel mit den folgenden Originalquellen abgeglichen und verifiziert:

1. **DIN 5008:2020-03 (Offizieller Standard):**
   - Ränder (Lochrand 25mm, rechter Rand 20mm, Unterkanten-Abstände).
   - Einteilung und Maße des Anschriftfeldes (85mm x 45mm, Zonenaufteilung: 5mm Rücksendezeile, 12.7mm Vermerke, 27.3mm Empfänger).
   - Positionierung des Informationsblocks (X: 125mm, Y: 32mm / 50mm).
2. **`alterarbeitsordner/issues/#1 DIN 5008 HTML Tag Glossar.md`:**
   - Positionen des Datums (Y: 74mm / 92mm) und des Briefkern-Starts (Y: 85.4mm / 103.4mm).
   - Vier-spaltiges Layout der Fußzeile bei Y: 241mm.
   - Proportionale CSS-Werte (`var(--din-y-header-start) + 60mm` bzw. `+ 154mm`) für die Faltmarken.
3. **`eigenequellen/din-5008-css-forked-for-later/index.html`:**
   - Geometrischer Randabstand der Linien-Markierungen (left: 2mm / 5mm, top: 87mm / 105mm).
4. **`fremdquellen/letter/css/style.css`:**
   - Genaue CSS-Pixel-Übersetzungen und Faltmarkierungs-Positionen (line-1 bei 105mm, line-2 bei 148.5mm, line-3 bei 210mm [Form A Alternative]).',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-geometry.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-geometry.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-geometry.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-geometry.md'), 'manual');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/din-5008-layout.md',
  'DIN 5008 Layout-Richtlinien (SSoT)',
  'active',
  '# DIN 5008 Layout-Richtlinien (SSoT)

> [!important] Single Source of Truth
> Dieses Dokument dient als Single Source of Truth (SSoT) für alle Abstände, Geometrien und Platzierungen auf dem virtuellen DIN A4 Briefblatt (210mm x 297mm).

---

## 1. Blattgeometrie & Ränder
Ein DIN A4 Blatt hat die Maße **210 mm Breite** und **297 mm Höhe**.
Die Ränder sind wie folgt festgelegt:
- **Linker Rand:** 25 mm (für Lochung und Abheftung)
- **Rechter Rand:** 20 mm (Standard) oder mindestens 8,1 mm (absolutes Minimum für Textüberläufe)
- **Oberer Rand:** 27 mm (Form A) oder 45 mm (Form B) für den Beginn des Briefkopfs / Anschriftfelds.

---

## 2. Die beiden Varianten (Form A vs. Form B)
Der Hauptunterschied liegt in der Höhe des Briefkopfs, was die Position aller darunter liegenden Elemente verschiebt.

| Element | Form A (Kleiner Kopf) | Form B (Großer Kopf) |
| :--- | :--- | :--- |
| **Höhe des Briefkopfs** | 27 mm | 45 mm |
| **Anschriftfeld (Beginn)** | 27 mm | 45 mm |
| **Infoblock (Beginn)** | 32 mm | 50 mm |
| **Fluchtlinie (links)** | 50 mm | 50 mm |
| **Falzmarke 1 (oben)** | 87 mm | 105 mm |
| **Falzmarke 2 (unten)** | 181 mm | 199 mm |
| **Lochmarke (Mitte)** | 148,5 mm | 148,5 mm |

---

## 3. Das Anschriftfeld (Zoneneinteilung)
Das Anschriftfeld ist exakt **85 mm breit** und **45 mm hoch**. Es ist links 20 mm vom Rand positioniert.

Das Feld unterteilt sich in:
- **Rücksendezeile (Absenderadresse):** 5 mm hoch, Schriftgröße max. 8pt. (Position: Ganz oben im Anschriftfeld).
- **Zusatz- und Vermerkzone:** 17,7 mm hoch (3 Zeilen für Einschreiben, Postzustellungsurkunden, etc.).
- **Anschriftzone (Empfängeradresse):** 27,3 mm hoch (6 Zeilen für Name, Straße, PLZ/Ort).

---

## 4. Der Informationsblock
Der Informationsblock befindet sich rechts oben und enthält Metadaten wie Aktenzeichen, Ansprechpartner, Durchwahl und das Datum.
- **Position (Standard):** Beginnt bei 125 mm von links.
- **Breite:** 75 mm.
- **Datum:** Steht standardmäßig in der letzten Zeile des Informationsblocks oder alternativ als alleinstehende Zeile mit 8,46 mm Abstand über dem Betreff.

---

## 5. Briefkern (Betreff, Anrede, Text)
Der eigentliche Textbereich (Briefkern) beginnt unterhalb des Anschriftfelds:
- **Betreff:** Beginnt bei **103,4 mm** von oben (Form B) bzw. **85,4 mm** (Form A). Der Betreff wird fett formatiert und erhält keinen Punkt am Ende.
- **Abstand zur Anrede:** 2 Leerzeilen (ca. 8,46 mm) unter dem Betreff.
- **Anrede:** Standard-Anredeformel ("Sehr geehrte Damen und Herren,", "Lieber Herr...").
- **Abstand zum Text:** 1 Leerzeile unter der Anrede.
- **Brieftext:** Fließtext in einer gut lesbaren Schriftgröße (10pt bis 12pt). Zeilenabstand einfach oder 1.2.
- **Grußformel:** 1 Leerzeile Abstand zum Brieftext.
- **Unterschrift:** Unter der Grußformel (oder Firmenname) folgen 3 Leerzeilen für die handschriftliche Unterschrift, gefolgt vom getippten Namen.
- **Anlagenvermerk:** Beginnt 1 Leerzeile unter dem getippten Namen.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-layout.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-layout.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-layout.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/din-5008-layout.md'), 'manual');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/glossary.md',
  'Fachbegriff-Glossar: glossary.md',
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
*   **Verweis:** Siehe [[ADR-CSS#4-natives-lightdark-mode-theme-light-dark|ADR-CSS.md]] und [variables.css](../website/css/variables.css).

### `localStorage` API
*   **Kurzdefinition:** Die stabilste und universellste Offline-Speicher-API im Browser zur persistenten Speicherung von Zeichenketten.
*   **Nutzen im Projekt:** Sichert Entwürfe, Einstellungen, API-Keys und Base64-Schriftarten lokal ab – **die einzige persistente API, die unter dem Doppelklick-Kontext `file:///` fehlerfrei funktioniert.**
*   **Verweis:** Siehe [[ADR-JS#2-reglementierte-aufgabenbereiche-fur-javascript|ADR-JS.md]] und [[ADR-ANTIPATTERN#3-komplexere-lokale-storage-apis-opfs-indexeddb-file-system-api|ADR-ANTIPATTERN.md]].

### `oklch()` Farbraum
*   **Kurzdefinition:** Ein zukunftsweisender, wahrnehmungsgleichmäßiger (perceptually uniform) CSS-Farbraum, basierend auf Helligkeit (L), Buntheit (C) und Farbton (H).
*   **Nutzen im Projekt:** Garantiert präzise Kontraststufen, fehlerfreie Grauabstufungen und ein absolut premium-artiges Dark-Paper-Theme ohne Farbverzerrungen.
*   **Verweis:** Siehe [[ADR-CSS#4-natives-lightdark-mode-theme-light-dark|ADR-CSS.md]] und [variables.css](../website/css/variables.css).

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
*   **Verweis:** Siehe [[ADR-API#5-zippopotam-plz-auto-lookup|ADR-API.md]].',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/glossary.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/glossary.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/glossary.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/glossary.md'), 'manual');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/glossary.md'), 'glossary');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/GUIDE-TEMPLATE.md',
  'Guide: [Thema des Guides]',
  'draft | active | deprecated',
  '# Guide: [Titel]

> [!tip] Was ist ein Guide?
> Im Gegensatz zu einem ADR (das eine einmalige Entscheidung dokumentiert), ist ein Guide ein lebendes Handbuch. Hier erklären wir, *wie* Dinge in unserem Projekt umgesetzt werden (z. B. "Wie nutzen wir CSS?", "Wie testen wir?").

## 1. Einleitung & Zielsetzung

Kurze Einleitung, warum dieser Guide existiert. Verlinke verwandte Konzepte per [[Wiki-Link]].

## 2. Best Practices

Nutze verschachtelte Listen und Checklisten, um Richtlinien klar zu formulieren:
- **Regel 1**: Schreibe klaren Code.
  - [x] Überprüft durch Linter
  - [ ] Noch nicht dokumentiert
- **Regel 2**: Nutze native APIs.

### Code-Beispiele (Vorher / Nachher)

Nutze Diff-Blöcke (`diff`), um Verbesserungen oder Refactorings zu veranschaulichen:

```diff
- const elements = document.querySelectorAll(''.old-class'');
- elements.forEach(el => el.style.display = ''none'');
+ // Neuer Zero-JS Ansatz via CSS
+ :root:has(#toggle:checked) .new-class { display: none; }
```

### Syntax Highlighting

Nutze spezifische Code-Blöcke (`css`, `javascript`, `html`), um die Lesbarkeit zu garantieren:

```css
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
```

## 3. Komplexere Zusammenhänge

Wenn ein Konzept schwer zu erklären ist, verstecke Randnotizen in einem Aufklapp-Menü:

<details>
<summary>Deep Dive: Wie funktioniert Backdrop-Filter? (Klicken)</summary>
Backdrop-Filter wendet grafische Effekte (wie Unschärfe) auf den Bereich *hinter* einem Element an. Das Element selbst muss dafür teilweise transparent sein (z.B. durch `rgba`).
</details>

## 4. Feature Checks

Gibt dieser Guide vor, bestimmte Web-APIs zu nutzen? Dann trage sie hier in das Compiler-System ein:

```javascript feature-check
// f("CSS backdrop-filter", CSS.supports("backdrop-filter: blur(10px)"), "Chrome 76", "Produktiv")
```',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/GUIDE-TEMPLATE.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/GUIDE-TEMPLATE.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/GUIDE-TEMPLATE.md'), 'template');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/longevity-guidelines.md',
  'Longevity & W3C Native Standards Guidelines (Longevity Guide)',
  'active',
  '# Longevity & W3C Native Standards Guidelines (Longevity Guide)

## 1. Die Philosophie der "Wartungsfreiheit auf Lebenszeit"

> [!important] 10+ Jahre Wartungsfreiheit
> Moderne Webentwicklung leidet unter massiver Kurzlebigkeit. Frameworks veralten in wenigen Jahren, Build-Tools brechen durch Node.js-Versionswechsel, und externe CDNs verschwinden oder ändern ihre Pfade. 
> 
> **DIN-BriefNEO** bricht radikal mit diesem Zyklus. Das Ziel ist eine **Überlebensdauer von 10+ Jahren** ohne eine einzige Code-Änderung oder Wartungsarbeit. Der Briefbogen muss im Jahr 2036 in jedem gängigen Webbrowser exakt so geladen, gerendert und bedient werden können wie heute.
> 
> Dies erreichen wir nicht durch Verzicht auf moderne Features, sondern durch das unnachgiebige Vertrauen in **native, standardisierte W3C/WHATWG Browser-Schnittstellen**.

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
Die Anwendung nutzt **keinen** Compiler, keinen Bundler und kein Transpilier-Werkzeug (kein Webpack, kein Vite, kein Babel, kein Sass-Compiler).
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

> [!TIP]
> **Nutzung von CSS Anchor Positioning ab Chrome 148+:**
> Da dieses Projekt exklusiv für moderne Laufzeitumgebungen ab Chrome 148+ entwickelt wird, nutzen wir das native **CSS Anchor Positioning** ohne Vorbehalte und ohne künstlichen JavaScript-Berechnungsoverhead! Dies vereinfacht die Positionierung von schwebenden Elementen (wie dem Format-Popover `#format-toolbar` oder Toasts) radikal, da sie rein deklarativ im CSS an ihren Anker gekoppelt werden. Ewiggestrige Browser-Engines ohne Support werden konsequent ignoriert (keine Rücksichtnahme für Plattformen, die hinterherhinken!).

---

## 5. Konsequenz

Jede Code-Modifikation wird im Code-Review unnachgiebig auf diese Richtlinien geprüft. Ein Feature, das eine externe Abhängigkeit einführt, die Offline-Kompatibilität beeinträchtigt oder auf nicht-standardisierten APIs aufbaut, wird bedingungslos abgelehnt. 

**Wir bauen kein kurzlebiges MVP – wir bauen ein digitales Denkmal.**',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/longevity-guidelines.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/longevity-guidelines.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/longevity-guidelines.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/longevity-guidelines.md'), 'manual');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/longevity-guidelines.md'), 'architecture');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/no-scroll-techniques.md',
  'Technischer Guide: No-Scroll-Techniken (Viewport-Perfect Layouts)',
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
  overflow: hidden; /* Scrollbalken komplett verbieten */
  user-select: none; /* Unbeabsichtigtes Markieren von UI verhindern */
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
- **Umgang mit langen Wörtern:** Verwende `word-break: break-word` und `hyphens: auto`, um horizontalen Textüberlauf zu verhindern.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/no-scroll-techniques.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/no-scroll-techniques.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/no-scroll-techniques.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/no-scroll-techniques.md'), 'manual');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/no-scroll-techniques.md'), 'css');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/no-scroll-techniques.md'), 'architecture');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/testing-guide.md',
  'Interaktiver Test-Leitfaden: testing-guide.md',
  'active',
  '# Interaktiver Test-Leitfaden: testing-guide.md

> [!info] Testing Guide
> Dieser Testing-Guide beschreibt alle manuellen Testfälle, um die Refactored Baseline-Features (Feature 1 bis Feature 6) von **DIN-BriefNEO** systematisch und reproduzierbar auf Fehler zu überprüfen.

---

## 🧪 Manuelle Testfälle (QA-Protokoll)

### Testfall 1: Plaintext-Paste-Filter
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist leer oder befüllt.
*   **Aktion:** 
    1. Öffne eine beliebige Webseite oder ein Word-Dokument.
    2. Markiere einen Absatz mit verschiedenen Schriftgrößen, bunten Farben und HTML-Links und kopiere diesen in die Zwischenablage (`Strg+C`).
    3. Setze den Cursor in das Brieftext-Feld und füge den Text mit `Strg+V` ein.
*   **Erwartetes Ergebnis:** 
    - Der Text wird eingefügt, aber **bedingungslos von allen Formatierungen, Farben, fremden Schriften und Links befreit**.
    - Es erscheint reiner Plaintext, der sich nahtlos an die Typografie des Briefbogens anpasst.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 2: Plaintext-Drag-and-Drop-Filter
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist aktiv.
*   **Aktion:** 
    1. Markiere einen formatierten Textbereich in einem separaten Browser-Tab oder Word-Dokument.
    2. Ziehe diesen Text per Drag-and-Drop direkt mit der Maus in das Brieftext-Feld.
*   **Erwartetes Ergebnis:** 
    - Der Text wird an der Position des Mauszeigers eingefügt.
    - Alle HTML-Stile, Farben und Format-Reste sind rückstandslos entfernt. Nur reiner Text wird im Brief abgelegt.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 3: WhatsApp-Style Selection Popover Toolbar
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Der Brieftext enthält Text.
*   **Aktion:** 
    1. Markiere ein oder mehrere Wörter im Brieftext mit der Maus oder Tastatur.
    2. Achte auf das Erscheinen der schwebenden Toolbar (`#format-toolbar`).
    3. Klicke auf den Button **B** (Fett) oder **U** (Unterstrichen).
    4. Hebe die Markierung auf und markiere den formatierten Bereich erneut.
*   **Erwartetes Ergebnis:** 
    - Die Toolbar schwebt präzise zentriert über der Textauswahl im globalen Top-Layer.
    - Bei Klick auf **B** wird der Text fett; bei Klick auf **U** unterstrichen.
    - Beim erneuten Markieren leuchtet der entsprechende Button im Popover smaragdgrün auf und signalisiert den aktiven Status.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 4: Blockquote-Toggling (Range API Unwrap)
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Ein Absatz im Brieftext ist markiert.
*   **Aktion:** 
    1. Klicke in der schwebenden Toolbar auf das Zitat-Symbol **»**.
    2. Markiere denselben Zitatbereich erneut und klicke nochmals auf **»**.
*   **Erwartetes Ergebnis:** 
    - Beim ersten Klick wird der markierte Bereich in ein graues, eingerücktes `<blockquote>` (Zitat) gewrappt.
    - Beim zweiten Klick wird das Zitat aufgelöst (Unwrap) und wieder in normalen Fließtext überführt – ohne den Text zu verdoppeln oder zu beschädigen.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 5: Toast-Notification Queue (Stacking-Schutz)
*   **Kategorie:** UI-Komponenten
*   **Ausgangssituation:** Die Sidebar ist geöffnet.
*   **Aktion:** 
    1. Klicke in der Sidebar extrem schnell hintereinander (5- bis 10-mal) auf den Layout-Button **Form A** und **Form B**.
*   **Erwartetes Ergebnis:** 
    - Es kommt zu **keinem hässlichen Übereinanderstapeln (Stacking)** der Toast-Meldungen im Top-Layer.
    - Jede Statusmeldung erscheint nacheinander, verweilt kurz, animiert heraus und macht Platz für die nächste Meldung in der Warteschlange.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 6: Schriftarten-Wechsel (System Stacks)
*   **Kategorie:** Schriftarten-Manager
*   **Ausgangssituation:** Der Briefbogen enthält Text.
*   **Aktion:** 
    1. Klicke in der Sidebar unter „Schriftarten-Manager“ nacheinander auf **Sans**, **Serif** und **Mono**.
*   **Erwartetes Ergebnis:** 
    - Die Schriftart des gesamten Briefbogens (inkl. Metadaten und Fließtext) ändert sich augenblicklich.
    - Sans nutzt moderne serifenlose Typografie, Serif klassische Buchschrift und Mono eine technische Schreibmaschinenschrift.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 7: WOFF2-Uploader (Base64 LocalStorage Persistenz)
*   **Kategorie:** Schriftarten-Manager
*   **Ausgangssituation:** Eine gültige `.woff2`-Schriftdatei (< 60 KB) liegt auf deinem Rechner bereit (z. B. *Inter-Regular.woff2*).
*   **Aktion:** 
    1. Klicke in der Sidebar auf „Schrift hochladen“ und wähle die Datei aus.
    2. Überprüfe die Änderung der Schriftart auf dem Briefpapier.
    3. Lade die Seite neu (`F5`).
*   **Erwartetes Ergebnis:** 
    - Nach dem Upload wird die Schriftart sofort auf das Briefpapier angewendet. Ein grüner Toast bestätigt den Erfolg.
    - Ein roter „Schrift zurücksetzen“-Button erscheint in der Sidebar.
    - Nach dem Neuladen der Seite bleibt die hochgeladene Schriftart dank des Base64-Speichers im `localStorage` erhalten.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 8: Dual-Provider Adress-Autocomplete
*   **Kategorie:** Externe APIs
*   **Ausgangssituation:** Die Internetverbindung ist aktiv.
*   **Aktion:** 
    1. Wähle **Photon** in der Sidebar. Tippe „Berliner Str.“ in die Suche.
    2. Wähle eine Adresse im Dropdown aus.
    3. Wähle **Geoapify** in der Sidebar. Trage einen ungültigen API-Key ein. Warte auf die Validierung.
    4. Trage einen gültigen API-Key ein, warte auf den grünen Toast und führe dieselbe Suche aus.
*   **Erwartetes Ergebnis:** 
    - Unter Photon erscheint sofort eine Liste von Adressvorschlägen. Bei Auswahl werden Straße, PLZ und Ort im Brief ausgefüllt.
    - Unter Geoapify mit falschem Key blockiert das Suchfeld und meldet einen Fehler.
    - Mit gültigem Key schaltet sich das Feld frei und liefert hochpräzise Vorschläge.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 9: PLZ-Proximity-Biasing & Zippopotam
*   **Kategorie:** Externe APIs
*   **Ausgangssituation:** Das Absenderfeld ist leer.
*   **Aktion:** 
    1. Schreibe eine Postleitzahl aus NRW (z. B. `40210 Düsseldorf`) in das Absenderfeld.
    2. Suche im Empfänger-Suchfeld nach einer generischen Straße (z. B. „Hauptstraße“).
    3. Gib im Empfängerort-Feld `#empfaenger-ort` manuell eine PLZ ein (z. B. `80331`).
*   **Erwartetes Ergebnis:** 
    - Durch die Absender-PLZ geocodiert das System im Hintergrund deine Koordinaten. Die Autocomplete-Suche priorisiert nun Hauptstraßen aus NRW (Proximity Biasing).
    - Bei manueller Eingabe von `80331` im Empfängerort fragt das System Zippopotam ab und vervollständigt das Feld automatisch zu `80331 München`.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 10: A4-Überlaufwarnung
*   **Kategorie:** Layout & CSS
*   **Ausgangssituation:** Der Brieftext enthält Text.
*   **Aktion:** 
    1. Schreibe oder füge extrem viel Text in das Brieftext-Feld ein, bis der Text das untere Ende (Y: 230mm) berührt.
*   **Erwartetes Ergebnis:** 
    - Sobald das Limit überschritten wird, färbt sich der Rand des Briefbogens dezent gestrichelt rot.
    - Ein rotes Warn-Badge „TEXT-ÜBERLAUF“ erscheint am Blattrand.
    - Ein Warn-Toast meldet, dass die Seite voll ist.
    - Löschen des Texts entfernt den Warnzustand sofort.
*   **Status:** `- [ ] (ungetestet)`',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/testing-guide.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/testing-guide.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/testing-guide.md'), 'guide');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/testing-guide.md'), 'manual');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'Guides/testing-guide.md'), 'qa');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'HYBRID-SPEC-DRIVEN-WORKFLOW.md',
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'workflow');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'spec-driven');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'reconciliation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'agents');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'HYBRID-SPEC-DRIVEN-WORKFLOW.md'), 'generalisierbarkeit');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'index.json',
  'index.json',
  'active',
  '{
  "documents": [
    {
      "path": "README.md",
      "title": "DIN-BriefNEO: Pure Refactored Edition (Master Wegweiser)",
      "status": "active",
      "tags": ["portal", "map", "index", "quickstart", "mermaid"]
    },
    {
      "path": "spec.md",
      "title": "Spezifikation (Spec) — DIN-BriefNEO Baseline Features",
      "status": "active",
      "tags": ["specifications", "baseline", "backlog", "acceptance-criteria"]
    },
    {
      "path": "tasks.md",
      "title": "Taskliste: Phase 2 (Code-Refactoring & Baseline-Stand)",
      "status": "active",
      "tags": ["checklist", "tasks", "milestones", "progress"]
    },
    {
      "path": "DECISION-LOG.md",
      "title": "Chronologisches Entscheidungs-Log",
      "status": "active",
      "tags": ["decision-log", "history", "timeline", "audit"]
    },
    {
      "path": "CHANGELOG.md",
      "title": "Changelog (Dokumentation)",
      "status": "active",
      "tags": ["changelog", "updates", "releases", "history"]
    },
    {
      "path": "ADR/ADR-HTML.md",
      "title": "ADR: HTML Architecture & Semantic Structure",
      "status": "accepted",
      "tags": ["html", "semantics", "contenteditable", "popover"]
    },
    {
      "path": "ADR/ADR-CSS.md",
      "title": "ADR: CSS Architecture & Proportional Zoom",
      "status": "accepted",
      "tags": ["css", "layout", "zoom", "containers", "theming"]
    },
    {
      "path": "ADR/ADR-JS.md",
      "title": "ADR: JavaScript Constraints & ''JS as a Crutch''",
      "status": "accepted",
      "tags": ["js", "scripting", "event-handling", "dom-selection", "constraints"]
    },
    {
      "path": "ADR/ADR-API.md",
      "title": "ADR: External API Integrations & Header Security",
      "status": "accepted",
      "tags": ["api", "autocomplete", "security", "photon", "geoapify", "zippopotam"]
    },
    {
      "path": "ADR/ADR-FEATURE.md",
      "title": "ADR: Feature Specifications & Premium UX",
      "status": "accepted",
      "tags": ["features", "popovers", "selections", "styling", "highlights"]
    },
    {
      "path": "ADR/ADR-ANTIPATTERN.md",
      "title": "Architectural Decision Record (ADR): Forbidden Practices & Antipatterns",
      "status": "accepted",
      "tags": ["antipattern", "rules", "boundaries", "security", "local-context"]
    },
    {
      "path": "ADR/ADR-TECH-STACK.md",
      "title": "Architectural Decision Record (ADR): Unified Web Technology Stack & Rationales",
      "status": "accepted",
      "tags": ["tech-stack", "architecture", "choices", "rationales", "w3c"]
    },
    {
      "path": "Guides/longevity-guidelines.md",
      "title": "Longevity & W3C Native Standards Guidelines",
      "status": "active",
      "tags": ["constitution", "w3c", "standards", "longevity"]
    },
    {
      "path": "Guides/din-5008-geometry.md",
      "title": "DIN 5008 Geometry Master Data (SSoT)",
      "status": "active",
      "tags": ["din-5008", "geometry", "spacing", "ssot"]
    },
    {
      "path": "Guides/glossary.md",
      "title": "Fachbegriff-Glossar",
      "status": "active",
      "tags": ["glossary", "dictionary", "definitions", "visualizations"]
    },
    {
      "path": "Guides/testing-guide.md",
      "title": "Interaktiver Test-Leitfaden",
      "status": "active",
      "tags": ["testing", "qa", "verification", "checklists"]
    },
    {
      "path": "MASTER-DO-DONT-DEPRECATED.md",
      "title": "MASTER-DO-DONT-DEPRECATED – Single Source of Truth",
      "status": "active",
      "tags": ["do", "dont", "deprecated", "lawbook", "standards"]
    },
    {
      "path": "DEV-INFO.md",
      "title": "Entwicklerbereich & Feature-Prüfung",
      "status": "active",
      "tags": ["dev-tools", "feature-detection", "chrome-baseline", "diagnostics"]
    },
    {
      "path": "README-DB.md",
      "title": "LLM-First Dokumenten-Datenbank & MCP-Architektur",
      "status": "active",
      "tags": ["database", "sqlite", "mcp", "llm-first", "tooling"]
    }
  ]
}
',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'index.json'), 'json');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'MASTER-DO-DONT-DEPRECATED.md',
  'DIN‑BriefNEO — Immutable Architectural Law: MUST‑USE vs. ANTIPATTERN Catalog',
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MASTER-DO-DONT-DEPRECATED.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MASTER-DO-DONT-DEPRECATED.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MASTER-DO-DONT-DEPRECATED.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MASTER-DO-DONT-DEPRECATED.md'), 'rules');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MASTER-DO-DONT-DEPRECATED.md'), 'standards');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'MIGRATION-ROADMAP-TO-BOILERPLATE.md',
  'Migrations-Roadmap DIN-Brief Neo zu Vanilla llm_boilerplate',
  'active',
  '# Migrations-Roadmap: DIN-Brief Neo → Vanilla llm_boilerplate

**Ziel:** Struktur so gestalten, dass nicht-projektspezifische Teile (vor allem Regeln, Tools, generische Dokumentation) später sauber und mit minimalem Aufwand in die generische `llm_boilerplate` übernommen werden können.

## Empfohlene Ziel-Struktur (bereits teilweise umgesetzt)

```
aktueller_arbeitsordner/
├── website/                    # Reine Anwendung – stark projektspezifisch, nicht extrahieren
│   ├── js/
│   ├── css/
│   └── index.html
│
├── tools/                      # ★ Kern für Extraktion
│   ├── antipatterns/           # Layered Rules – der wichtigste Teil für Generalisierbarkeit
│   │   ├── base.json           # Universell (Date API etc.)
│   │   ├── web.json            # HTML/CSS/JS – fast überall nutzbar
│   │   ├── nix.json            # (falls relevant) Linux/NixOS
│   │   └── project.json        # Nur DIN-Brief-spezifisch (Exemptions, eigene Regeln)
│   │
│   ├── reconciliation.js       # Generisch
│   ├── build_db.js             # Generisch
│   ├── log_session.js          # Generisch
│   ├── inject_yaml.js          # Generisch
│   └── ...
│
└── boilerplate.config.json     # Steuert active layers etc. – generisch nutzbar
```

## Migrations-Schritte (priorisiert)

### Phase 1: Layered Antipatterns (Hoch – Kern der Wiederverwendbarkeit)
1. `tools/antipatterns/` Verzeichnis anlegen (erledigt).
2. Aktuelle `antipatterns.json` in Schichten aufteilen:
   - `base.json`: universelle Regeln (z.B. Temporal/Date API).
   - `web.json`: allgemeine Web-Regeln (execCommand, XHR, innerHTML, Farben, externe Verbindungen).
   - `project.json`: DIN-spezifische Regeln + Exemptions (z.B. innerHTML im main.js).
3. `boilerplate.config.json` anlegen (mit `activeAntipatterns: ["base", "web", "project"]`).
4. `reconciliation.js` anpassen, damit es die Layer lädt und merged (erledigt – nutzt Map by ID, später layers können project.json überschreiben).
5. Alte `antipatterns.json` als Backup behalten oder entfernen, sobald stabil.

### Phase 2: Tools generisch machen
- Sicherstellen, dass `reconciliation.js`, `build_db.js`, `log_session.js`, `inject_yaml.js` keine harten DIN-spezifischen Annahmen enthalten (außer über Config).
- `log_session.js` und `reconciliation.js` ggf. aus `llm_boilerplate/tools/` nachziehen/angleichen, wenn Unterschiede bestehen.
- CUSTOM_CHECKS / FEATURE_CHECKS wo möglich in die JSON-Regeln oder Config auslagern.

### Phase 3: Dokumentation & Vertrag
- `AGENTS.md` finalisieren (bereits weitgehend generisch).
- Generische Teile aus `constitution.md`, `MASTER-DO-DONT-DEPRECATED.md`, Guides in die Boilerplate übernehmen (oder als Vorlage verwenden).
- Projektspezifische ADRs und website/ bleiben im Projekt.

### Phase 4: Aufräumen & Extraktion
- `project.json` als "Mülleimer" für alles DIN-spezifische pflegen.
- Test: Nach Änderungen immer Pre/Post-Build + 100% Fitness + Log.
- Wenn stabil: Die generischen Teile (`tools/antipatterns/{base,web}.json`, Tools, Config, Teile von AGENTS) in die `llm_boilerplate` kopieren/übernehmen.

## Aktueller Status (2026-06-12)

- `tools/antipatterns/{base,web,project}.json` angelegt und befüllt.
- `boilerplate.config.json` angelegt.
- `reconciliation.js` auf layered Loading umgestellt (Merge per ID, Project überschreibt).
- Fitness nach Anpassung wieder 100% (Exemption korrekt über Override).
- Entscheidung im DECISION-LOG dokumentiert.
- Nächste Schritte: ggf. weitere Tools angleichen, alte flat file aufräumen, Dokumentation prüfen.

## Prinzipien (aus AGENTS.md)

- Generalisierbarkeit bei **jeder** Lösung prüfen und vorschlagen.
- `project.json` für DIN-spezifisches.
- Alles andere so generisch wie möglich halten.

Diese Roadmap stellt sicher, dass die Extraktion später mechanisch und mit wenig manuellem Aufwand möglich ist.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MIGRATION-ROADMAP-TO-BOILERPLATE.md'), 'migration');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MIGRATION-ROADMAP-TO-BOILERPLATE.md'), 'boilerplate');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MIGRATION-ROADMAP-TO-BOILERPLATE.md'), 'antipatterns');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MIGRATION-ROADMAP-TO-BOILERPLATE.md'), 'generalisierbarkeit');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MIGRATION-ROADMAP-TO-BOILERPLATE.md'), 'tools');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'MODERNIZATION-GUIDE.md',
  'Modernisierungs-Leitfaden: MODERNIZATION-GUIDE.md',
  'active',
  '# Modernisierungs-Leitfaden: MODERNIZATION-GUIDE.md

Dieses Dokument analysiert die aktuell verwendeten Webtechnologien des **DIN-BriefNEO**-Baseline-Projekts und vergleicht sie mit zukünftigen, potenziellen W3C-Standardkandidaten. Es dient als strategischer Wegweiser für zukünftige Modernisierungen – **ohne sofortige Umsetzung** und unter strikter Wahrung der Longevity-Verfassung.

---

## 🧭 Modernisierungs-Matrix (Tech-Debt Roadmap)

| Aktuelle Technik | Potenzielle modernere Alternative | Status der Alternative | Empfehlung | Begründung & Longevity-Verweis |
| :--- | :--- | :--- | :--- | :--- |
| **Selection/Range API** (zur Y/X-Positionierung der Toolbar) | **CSS Anchor Positioning API** | In Chrome 148+ vollständig stabil. | **Jetzt nutzen** | Da Chrome 148+ unsere exklusive Target-Plattform ist, nutzen wir CSS Anchor Positioning ohne jegliche Rücksicht auf veraltete Safari/Firefox-Stände. Dies eliminiert JavaScript-Positionierungscode vollständig. |
| **`document.execCommand`** (Fett/Unterstreichen nativ) | **Custom Selection & Range DOM-Operationen** | W3C-Standard (Living Standard). | **Jetzt nutzen** | `execCommand` ist veraltet (*deprecated*). Wir haben dies für blockquotes bereits gelöst. Standard-Shortcuts überlassen wir dem Browser, was absolut stabil ist. |
| **Natives JS `Date`-Objekt** | **Temporal API** | In Chrome 148+ nativ und vollständig einsatzbereit. | **Jetzt nutzen** | Die `Temporal` API ist in Chrome 148+ fehlerfrei und nativ implementiert. Wir nutzen sie direkt zur präzisen Datumsberechnung und für Zeitstempel bei Entwürfen. |
| **`localStorage`** (für Base64 Custom Fonts & Drafts) | **Origin Private File System (OPFS)** / **IndexedDB** | W3C-Standard. | **Nie** | OPFS/IndexedDB setzen zwingend HTTPS voraus. Unter `file://` (Doppelklick) stürzen sie mit Security-Exceptions ab. `localStorage` ist laut [Säule 5 der Longevity-Guidelines](Guides/longevity-guidelines.md) die einzig stabile Option für Doppelklick-Apps. |
| **`@import`** in CSS-Dateien | Native **`link`-Tags** im HTML | W3C-Standard. | **Jetzt nutzen** | `@import` blockiert das parallele Laden von Stylesheets im Browser. Native `<link>`-Tags laden Stylesheets parallel und performanter. |
| **`console.log()`** (für Debugging im Quellcode) | Deaktivierbarer **Custom Logging Wrapper** | Standard JavaScript. | **Jetzt nutzen** | Verhindert, dass sensible Anwendungsdaten in der Produktionskonsole exponiert werden und schont CPU-Ressourcen bei der DOM-Verarbeitung. |
| **`var()` ohne Fallback** in CSS | **`var(--prop, fallback)`** | W3C-Standard. | **Jetzt nutzen** | Redundante Absicherung. Verhindert, dass UI-Elemente bei fehlenden Custom Properties visuell zerreißen. |
| **`innerHTML`** (für Autocomplete- dropdown) | **`textContent`** oder **`createTextNode`** | W3C-Standard. | **Bereits umgesetzt** | Verhindert Cross-Site Scripting (XSS) auf Browserebene. Alle APIs und Benutzereingaben werden strikt als Plaintext behandelt. |

---

## 🔗 Verweise
*   Siehe [longevity-guidelines.md](Guides/longevity-guidelines.md) zur Einhaltung der abwärtskompatiblen W3C-Schnittstellen.
*   Siehe [ADR-ANTIPATTERN.md](ADR/ADR-ANTIPATTERN.md) für die expliziten Dateispeicher- und CDN-Ausschlüsse.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'MODERNIZATION-GUIDE.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'PHASE1-SQLITE-VEC-IMPLEMENTATION.md',
  'Phase 1: sqlite-vec Integration – Detaillierte Umsetzungsanleitung',
  'active',
  '# Phase 1: sqlite-vec Integration – Detaillierte Umsetzungsanleitung

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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'PHASE1-SQLITE-VEC-IMPLEMENTATION.md'), 'phase1');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'PHASE1-SQLITE-VEC-IMPLEMENTATION.md'), 'sqlite-vec');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'PHASE1-SQLITE-VEC-IMPLEMENTATION.md'), 'hybrid-search');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'PHASE1-SQLITE-VEC-IMPLEMENTATION.md'), 'embedding');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'PHASE1-SQLITE-VEC-IMPLEMENTATION.md'), 'build');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'PHASE1-SQLITE-VEC-IMPLEMENTATION.md'), 'generalisierbarkeit');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'PHASE1-SQLITE-VEC-IMPLEMENTATION.md'), 'tools');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'README-DB.md',
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
*   ⚖️ **[MASTER-DO-DONT-DEPRECATED.md](MASTER-DO-DONT-DEPRECATED.md):** Unser unumstößliches Gesetzbuch für technologische Verbote.
*   📚 **[longevity-guidelines.md](Guides/longevity-guidelines.md):** Die übergeordnete W3C-Verfassung.
*   🛠️ **[DEV-INFO.md](DEV-INFO.md):** Unsere 25-Feature Diagnose- und Feature-Erkennungs-Matrix.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README-DB.md'), 'database');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README-DB.md'), 'sqlite');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README-DB.md'), 'mcp');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README-DB.md'), 'llm-first');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README-DB.md'), 'tooling');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'README.md',
  'DIN-BriefNEO: Pure Refactored Edition',
  'active',
  '# DIN-BriefNEO: Pure Refactored Edition

Willkommen im offiziellen Repository von **DIN-BriefNEO (Pure Refactored Edition)**. 

Dieses Projekt ist eine datenschutzkonforme, 100% offline-fähige und wartungsfreie Web-Applikation zur pixelperfekten Erstellung normkonformer Briefe nach dem offiziellen deutschen Standard **DIN 5008 (Form A und Form B)**.

---

## 🏛️ Die unbiegsame W3C-Verfassung (Longevity Covenant)

Dieses Projekt bricht radikal mit der Kurzlebigkeit moderner Web-Frameworks. Wir vertrauen zu 100% auf native, standardisierte W3C/WHATWG-Schnittstellen. Unser Ziel ist eine **Überlebensspanne von 10+ Jahren ohne eine einzige Zeile Wartungsaufwand**.

*   📚 **[Longevity Guidelines (longevity-guidelines.md)](Guides/longevity-guidelines.md):** Die unverrückbare „Verfassung“ dieses Repositories. Sie deklariert die 5 Säulen der Langlebigkeit (Zero-Dependency-Pakt, 100% Offline-Autarkie, W3C-Living-Standards, Build-Tool-Immunität, LocalStorage-Sovereignty) und tabelliert alle verbotenen Legacy-Techniken (wie `document.execCommand` oder OPFS/IndexedDB unter `file://`) samt deren modernen Alternativen.
*   ⚖️ **[Master Lawbook (MASTER-DO-DONT-DEPRECATED.md)](MASTER-DO-DONT-DEPRECATED.md):** Die zentrale, erschöpfende Referenz für alle technologischen Entscheidungen, Verbote und legacy-freie Ersatzstrategien. Es dient als SSoT-Gesetzbuch für Entwickler und KIs.

---

## 📂 Dokumenten-Landkarte & Wegweiser

Um das Projekt übersichtlich und hochgradig transparent zu halten, ist die Dokumentation in modular verlinkte Single Sources of Truth (SSoTs) gegliedert:

### 🌟 Status & Spezifikationen
*   📄 **[System-Spezifikation (spec.md)](spec.md):** Beschreibt die Kernanforderungen und Akzeptanzkriterien der Baseline-Features (1 bis 6) sowie die ruhende Feature-Roadmap für Phase 3 im Backlog.
*   📋 **[Aktive Taskliste (tasks.md)](tasks.md):** Unser detaillierter Abarbeitungs-Fahrplan zur Verfolgung aller Planungs- und Refactoring-Schritte.
*   🛠️ **[Entwicklerbereich & Feature-Prüfung (DEV-INFO.md)](DEV-INFO.md):** Die zentrale Diagnose-Ansicht und Feature-Erkennungs-Matrix basierend auf dem Chrome 147+ Baseline-Check. Enthält ein kopierbares F12-Konferenz-Skript zur Bereitschaftsprüfung.
*   🗄️ **[LLM-First Datenbank-Guide (README-DB.md)](README-DB.md):** Die Spezifikation unserer serverlosen, hybrid-kompilierten SQLite-Dokumenten-Datenbank und der MCP-Architektur für KI-Assistenten.
*   📜 **[AGENTS.md (Verhaltensvertrag für KI-Agenten)](../AGENTS.md):** Bindender Vertrag für alle KI-gestützten Arbeiten. Definiert Reconciliation Loop, Evolutionary Fitness Score (Ziel 100 %), zwingende Pre-/Post-Builds, Session-Logging mit `log_session.js` sowie die explizite Rolle von DIN-Brief Neo als Testballon für die generische llm_boilerplate („Testen → Verfeinern → Generalisieren“).

### ⚡ Aktueller Entwicklungsansatz (Light Mode vs. Full Mode)

Um Komplexität und Fehleranfälligkeit zu minimieren, nutzen wir einen **gestuften Workflow**:

| Modus       | Wann?                              | Schritte (immer: Pre-Build → Änderung → Post-Build 100% → Log) | Zusätzlich                                                                 | Dokumentation                          |
|-------------|------------------------------------|----------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------|
| **Light Mode** (Default) | Bugfixes, kleine Refactorings, kleine Anpassungen (~70-80% der Arbeit) | Pre + Änderung + Post (100%) + Log                             | Kurzer Generalisierungs-Vermerk (1-2 Sätze) im `DECISION-LOG.md`          | Minimal, im DECISION-LOG              |
| **Full Mode**     | Wichtige Features, Architektur, boilerplate-relevante Arbeit     | Wie Light + strukturierter Prozess                             | `specs/NNN-name/spec.md` (mit ausführlichem Generalisierungs-Check), optional plan.md/tasks.md + vollen Hybrid-Workflow | Explizit im Spec + DECISION-LOG + Roadmap |

Core Rules (Builds, 100% Fitness, Logging, Generalisierungs-Pflicht) gelten **immer**. Siehe `AGENTS.md` und `HYBRID-SPEC-DRIVEN-WORKFLOW.md` für Details.

### 📐 Architektur-Entscheidungen (ADR)
Alle grundlegenden Design-Entscheidungen sind thematisch im Ordner **`[ADR/](ADR/)`** modular dokumentiert und untereinander vernetzt:
*   🌐 **[ADR-HTML.md](ADR/ADR-HTML.md):** Custom Elements (IMR 4.0), native Popover API, striktes `contenteditable="plaintext-only"`-Sicherheitskonzept und Barrierefreiheit.
*   🎨 **[ADR-CSS.md](ADR/ADR-CSS.md):** Proportionaler Zoom (`94vh`), Container Queries (`cqw`/`cqh`) und native Farbthematisierung via `light-dark()`.
*   ⚡ **[ADR-JS.md](ADR/ADR-JS.md):** JavaScript-Reglementierung, Selection & Range API Formatierungen und XSS-Paste-Filter.
*   📡 **[ADR-API.md](ADR/ADR-API.md):** Dual-Provider Autocomplete (Photon keyless / Geoapify secure), API-Header-Security, PLZ-Lookups und Race-Condition-Aborting via AbortController.
*   🚫 **[ADR-ANTIPATTERN.md](ADR/ADR-ANTIPATTERN.md):** Das strikte Verbot von Frameworks, externen CDNs, Google Fonts, OPFS/IndexedDB unter `file://` und Scrollbalken.
*   🛠️ **[ADR-FEATURE.md](ADR/ADR-FEATURE.md):** WhatsApp-Selection-Popover, Toast-Queue-Lifecycles, Offline-Schriften-Manager und Proximity-Biasing.
*   📊 **[ADR-TECH-STACK.md](ADR/ADR-TECH-STACK.md):** Die zentrale tabellarische Übersicht über alle verwendeten modernen Webtechnologien und deren Rationale.

### 🔍 Bestandsaufnahmen & Roadmaps
*   📋 **[Feature-Bestandsaufnahme (FEATURE-INVENTORY.md)](FEATURE-INVENTORY.md):** Ein vollständiges, tabellarisches Inventar aller fertig implementierten Baseline-Funktionen und der dahinterstehenden W3C-Techniken.
*   🧭 **[Modernisierungs-Leitfaden (MODERNIZATION-GUIDE.md)](MODERNIZATION-GUIDE.md):** Eine strategische Gegenüberstellung aktueller Techniken mit zukünftigen W3C-Kandidaten (z. B. *CSS Anchor Positioning* oder *Temporal API*) zur Vermeidung von technischer Schuld.
*   💡 **[Zukunfts-Roadmap (ROADMAP.md)](ROADMAP.md):** Eine unverbindliche Ideensammlung für Zukunftsplanungen außerhalb des Spezifikations-Umfangs (z. B. Mehrseiten-Karussell, dictation).

---

## 📊 System-Visualisierungen & Lifecycles

Die folgenden Diagramme veranschaulichen die Architektur und unseren Entwicklungs-Lifecycle:

### A. Systemarchitektur-Übersicht
Zeigt, wie der Webbrowser als alleinige Laufzeitumgebung direkt auf nativen W3C-Standards aufbaut und wie sich die Dokumentationsstruktur darum spannt:

```mermaid
flowchart TD
    Browser[Webbrowser / Runtime] --> HTML[HTML5 Custom Elements]
    Browser --> CSS[CSS3 Container Queries / OKLCH]
    Browser --> JS[Vanilla ES-Modules / Web-APIs]
    HTML -.-> ADR_HTML[ADR-HTML.md]
    CSS -.-> ADR_CSS[ADR-CSS.md]
    JS -.-> ADR_JS[ADR-JS.md]
    ADR_HTML & ADR_CSS & ADR_JS -.-> TechStack[ADR-TECH-STACK.md]
    TechStack --> Verfassung[longevity-guidelines.md]
```

### B. Der Spec-First-Planungs-Lifecycle
Zeigt unseren disziplinierten Ablauf für nachhaltiges Refactoring:

```mermaid
flowchart TD
    Specify[Specify: User Story & Akzeptanzkriterien] --> Plan[Plan: Technische Rationale & ADRs]
    Plan --> Tasks[Tasks: Detaillierte Checklist]
    Tasks --> Implement[Implement: Code-Erstellung]
    Implement --> Verify[Verify: QA & Walkthrough]
```

---

## ⚡ Lokaler Schnellstart (Doppelklick-Kompatibel)

Dank der radikalen Build-Tool-Immunität benötigt dieses Projekt **kein NPM, kein Node.js, keine Server und keine Installation**.

1.  Klone oder lade dieses Repository herunter.
2.  Navigiere in den Ordner **`[website/](website/)`**.
3.  Öffne die Datei **`index.html`** per einfachem Doppelklick in deinem Chrome- oder Edge-Browser (`file:///index.html`).
4.  Der Briefbogen ist sofort einsatzbereit, speichert deinen Entwurf lokal auf deinem Rechner und ist zu 100% offline-fähig!

---

## 📐 Physische DIN-Abstandsdaten

Die hochpräzisen, physischen DIN-Abstände für Locher, Faltmarken, Anschriftfeld und Briefkern gemäß der offiziellen DIN 5008 Norm findest du in unserem Master-Guide:
*   📘 **[DIN 5008 Geometry Master Data (Guides/din-5008-geometry.md)](Guides/din-5008-geometry.md)**

---

**Wir bauen kein kurzlebiges MVP – wir bauen ein digitales Denkmal.**',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ROADMAP.md',
  'Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md',
  'active',
  '# Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md

Dieses Dokument dient als offene Ideensammlung für zukünftige Erweiterungen von **DIN-BriefNEO**. Alle Einträge sind **unverbindlich** und befinden sich im Status des reinen Brainstormings oder wurden aufgrund architektonischer Hürden zurückgestellt. 

---

## 💡 Ideensammlung & Brainstorming

### 1. Mehrseitiges Horizontal-Karussell
*   **Beschreibung:** Ermöglicht das Schreiben von mehrseitigen Briefen, die im Editor horizontal verschoben werden (Karussell-Effekt), um vertikales Scrollen im Viewport komplett zu vermeiden.
*   **Status:** **Zurückgestellt** (Aufgeschoben in Phase 1 / Backlog).
*   **Herausforderung:** Hohe JS-Komplexität bei der Paginierung und automatischen Text-Schnittstelle. Niedrige Priorität, da 95% aller DIN 5008 Briefe auf eine Seite passen.

### 2. Nativer PDF-Export (Client-side)
*   **Beschreibung:** Erzeugung eines echten PDF-Downloads direkt im Browser (z. B. via `pdf-lib` oder `jspdf`), anstatt den System-Druckdialog nutzen zu müssen.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Größeres Datenvolumen durch Bibliotheken. Verletzt die W3C-First und Zero-Dependency Säulen, da Client-Side PDF-Erzeugung im Browser extrem komplex ist. Bevorzugt bleibt der native, wartungsfreie Druckdialog (`window.print()`) mit optimiertem CSS.

### 3. Google Places API (Adress-Autocomplete Alternative)
*   **Beschreibung:** Einbindung der Google Places API als dritter Adress-Provider in der Sidebar für weltweite Premium-Ergebnisse.
*   **Status:** **Zurückgestellt** (Antipattern).
*   **Herausforderung:** Erfordert zwingend das Laden des Google Maps JS SDKs über CDN (verletzt Säule 2 und Säule 4) sowie eine Kreditkarte bei der Registrierung. Da Geoapify und Photon kostenfrei und rein REST-basiert über `fetch` laufen, bietet Google Places keinen architektonischen Benefit.

### 4. Erweiterte Formatierungsoptionen im Markdown-Parser
*   **Beschreibung:** Ausbau des `parseMarkdown`-Moduls in `logic.js` zur nativen Unterstützung von geordneten/ungeordneten Listen, Überschriften (`#`, `##`) und Tabellen im Briefkern.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Muss penibel mit dem WhatsApp-Selection-Popover synchronisiert werden, damit sich Formatierungen nicht gegenseitig blockieren.

### 5. Offline-Service-Worker (PWA)
*   **Beschreibung:** Integration eines Service Workers (`sw.js`) zum Caching aller lokalen Assets, um die Anwendung als installierbare Progressive Web App (PWA) auf dem Desktop zu betreiben.
*   **Status:** **Zurückgestellt**.
*   **Herausforderung:** Service Worker setzen zwingend HTTPS voraus. Unter `file:///` werfen sie Browser-Sicherheitsfehler. Da das Öffnen der lokalen `index.html` per Doppelklick auch ohne Service Worker offline perfekt funktioniert (da alle Assets lokal liegen), ist der Nutzen im Vergleich zum Risiko minimal.

### 6. Sprachsteuerung & Diktat (Web Speech API)
*   **Beschreibung:** Integration der nativen `webkitSpeechRecognition`-Schnittstelle in der Sidebar, um Brieftexte per Stimme einzudiktieren.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Web Speech ist derzeit noch plattformspezifisch (funktioniert hervorragend in Chrome/Safari, gar nicht in Firefox). Zudem erfordert es eine aktive Internetverbindung zur Google/Apple-Cloud zur Spracherkennung.

---

## 🔗 Verweise
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] zur Vermeidung von CDN- oder Drittanbieter-Bibliotheken bei diesen Ideen.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] für das strikte Verbot von CDN-Verbindungen.

- [ ] **Client-Side AI Integration**: API Key Eingabe via Settings-Modal (gespeichert in localStorage). Direkte Anbindung an OpenAI/Anthropic/Gemini via etch f�r Text-Expansion, Tonfall-�nderung und Rechtschreibkorrektur.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ROADMAP.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ROADMAP.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ROADMAP.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ROADMAP.md'), 'roadmap');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'ROADMAP.md'), 'future');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'spec.md',
  'Spezifikation (Spec) — DIN-BriefNEO Baseline Features',
  'active',
  '# Spezifikation (Spec) — DIN-BriefNEO Baseline Features

> [!NOTE]
> Die exakten Maße und Geometriedaten gemäß dem DIN 5008 Standard findest du in unserem hochpräzisen [DIN 5008 Geometry Master Data Guide](file:///c:/Users/morit/Documents/Obsidian_Main/Websites%20&%20Software/DIN-Brief%20Neo/aktueller_arbeitsordner/Guides/din-5008-geometry.md). Dieses Dokument dient als Single Source of Truth (SSoT) für alle physischen Abstände.

Dieses Dokument beschreibt die Kernfunktionen des Refactored Prototyps. Jedes Feature ist nach dem **Spec-Kit-Modell** in Anforderung (`Specify`), Plan (`Plan`) und Aufgaben (`Tasks`) unterteilt.

---

## Feature 1: Elastischer Viewport (No-Scroll Auto-Zoom)

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

## Feature 2: DIN Layout-Wechsler (Form A vs. Form B)

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

## Feature 3: Native Color Schemes (Light- & Dark-Mode)

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

## Feature 4: LocalStorage Auto-Save & Draft-Management

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

## Feature 5: Scroll-freier Multipage-Wechsler (Karussell)

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

## Feature 6: Zentralisierung aller Konstanten und Feedback-Meldungen (Toasts)

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
> Die folgenden Features befinden sich im ruhenden Planungs-Backlog. Aufgrund des aktiven `.SPEC-ONLY-PHASE`-Schutzes sind für diese Features **keine** aktiven Entwicklungsaufgaben (Tasks) oder Implementierungspläne freigegeben. Sie dienen rein als Spezifikations-Vorschau.

## Feature 7: Auto-Kompakt Layout-Modus (Form A/B Auto-Switch)
* **Specify (Das "Was"):** Als Briefschreiber möchte ich, dass die Anwendung bei langem Brieftext automatisch von Form B auf Form A wechselt, falls dadurch der Text gerade so auf eine einzige Seite passt, um Zeit und Papier zu sparen.
* **Akzeptanzkriterien:**
  - Option "Automatisch" in der Sidebar unter "DIN-Brief Layout".
  - Echtzeit-Berechnung des vertikalen Textüberlaufs über relative Ratios (Grenze: Y: 235mm, Ratio `0.791`).
  - Wenn Text in Form B überläuft, aber in Form A passt, erfolgt ein flüssiger Wechsel zu Form A.
  - Bei Textkürzung erfolgt der automatische Rückwechsel zu Form B.

## Feature 8: Anrede-Stil & Auto-Gender Engine
* **Specify (Das "Was"):** Als Briefschreiber möchte ich den Stil der Anrede (Förmlich, Höflich, Modern) in der Sidebar wählen können, und die Anwendung soll basierend auf dem Empfängernamen automatisch das Geschlecht ermitteln und die passende Anrede und Grußformel vorschlagen.
* **Akzeptanzkriterien:**
  - Segmented Control in der Sidebar für "Anrede-Stil" (Förmlich, Höflich, Modern).
  - Automatisches Scannen des Empfängernamens auf Titel (Dr., Prof.) und Geschlechtsmerkmale via RegExp.
  - Auto-Generierung von Anrede und Grußformel über "Ghost-Sync", solange der Benutzer diese nicht manuell editiert hat. Manual Overrides haben absolute Priorität.

## Feature 9: Integriertes Absender-Profil (Persönliche Daten)
* **Specify (Das "Was"):** Als regelmäßiger Briefschreiber möchte ich meine persönlichen Kontaktdaten, Bankdaten und Footer-Zusätze dauerhaft in der Sidebar speichern können, damit diese bei jedem neuen Brief automatisch in den Briefkopf und die Fußzeile eingepflegt werden.
* **Akzeptanzkriterien:**
  - Einklappbares Formular "Absender-Profil" in der Sidebar.
  - Persistent gespeicherte Profildaten unter `din_profile` im LocalStorage.
  - Automatisches Befüllen von `#absender`, `#info-tel` und Brieffooter beim Speichern und beim Systemstart.

## Feature 10: Premium Ambient Dark Mode (Time- & System-based)
* **Specify (Das "Was"):** Als Benutzer möchte ich abends und nachts dezent und ohne grelles Licht Briefe schreiben, ohne dass eine fehlerhafte Farbinversion die Brief-Ästhetik ruiniert. Der Nachtmodus soll sich abends automatisch aktivieren.
* **Akzeptanzkriterien:**
  - Segmented Control für "Theme" (Hell, Dunkel, Auto).
  - Modus "Auto" schaltet abends/nachts (18:00 - 06:00 Uhr) oder bei System-Dark-Preference automatisch in den Dark Mode um (30s clock interval check).
  - Keine Inversions-Filter! Das Briefpapier wird im Dark Mode in edles, warmes Dunkelgrau (`oklch(28% 0.01 250)`) gefärbt, das die Augen schont.
  - Beim Drucken wird das Papier ausnahmslos reinweiß mit schwarzem Text ausgegeben (Druck-Souveränität).

## Feature 11: Easter-Egg High-Integrity Dev-Panel (Popover-based)
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'spec.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'spec.md'), 'spec');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'spec.md'), 'requirements');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'specs/001-hybrid-workflow-integration/spec.md',
  '001 - Hybrid Spec-Driven Workflow Integration (spec-kit + Reconciliation)',
  'active',
  '# Spec: 001 - Hybrid Spec-Driven Workflow Integration

## Context / Background
We evaluated GitHub spec-kit for its clear phased Spec-Driven Development approach with AI agents. While lighter than our Reconciliation + Fitness system, it offers good ideas for structure and workflow clarity (numbered specs, .specify/ separation, explicit phases).

This spec defines how we integrate the useful parts without losing our strengths (Fitness Score, layered antipatterns, audit trail, Generalisierungs-Pflicht).

## Requirements
- Adopt .specify/ for agent-specific artifacts (constitution, templates, memory) to improve extractability to llm_boilerplate.
- Introduce numbered specs/NNN-name/ for better traceability and history (like spec-kit).
- Define a hybrid workflow that combines spec-kit phases with our mandatory Reconciliation gates.
- Keep all changes documented and logged per AGENTS.md.
- Maintain 100% Fitness Score throughout.

## Acceptance Criteria
- [x] .specify/ directory created with constitution.md and templates/.
- [x] specs/ directory with at least one example (001-...).
- [x] HYBRID-SPEC-DRIVEN-WORKFLOW.md created explaining the combined process.
- [x] Changes follow Pre/Post build + log_session + DECISION-LOG.
- [ ] Future features use the new numbered spec format.
- Generalisierbarkeit: The .specify/ + specs/ pattern itself is designed to be extractable as a boilerplate convention.

## Generalisierbarkeit Check (mandatory)
- The .specify/ structure and numbered specs/ approach can be directly reused in llm_boilerplate.
- Proposed extraction: Copy the folder layout and HYBRID-WORKFLOW doc (or parts) as recommended patterns.
- Risks: None major; this enhances rather than couples to DIN specifics.

## Related
- AGENTS.md (Core Rules, Generalisierungs-Pflicht)
- MIGRATION-ROADMAP-TO-BOILERPLATE.md
- .specify/constitution.md
- aktueller_arbeitsordner/constitution.md',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'specs/001-hybrid-workflow-integration/spec.md'), 'spec');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'specs/001-hybrid-workflow-integration/spec.md'), 'workflow');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'specs/001-hybrid-workflow-integration/spec.md'), 'integration');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'specs/001-hybrid-workflow-integration/spec.md'), 'spec-kit');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'specs/001-hybrid-workflow-integration/spec.md'), 'generalisierbarkeit');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'tasks.md',
  'Taskliste: Phase 2 (Code-Refactoring & WhatsApp-Style Editor)',
  'active',
  '# Taskliste: Phase 2 (Code-Refactoring & WhatsApp-Style Editor)

Dieses Dokument dient als abarbeitbare Taskliste für die anstehenden Code-Modifikationen im Workspace.

---

- [x] **⚙️ Schritt 1: constants.js (Zentralisierung aller UI-Meldungen & Toasts)**
  - [x] Alle systemweiten Toast-Meldungen (Erfolg, Info, Warnung, Fehler) aus `Constants` importieren
  - [x] Systemgrenzen (z. B. Dateigröße 60 KB, 1-Font-Limit) festlegen
  
- [x] **🎨 Schritt 2: reset.css & variables.css (Offline-Schriften & Themes)**
  - [x] Google Fonts entfernen
  - [x] Serifenlosen, DIN-konformen cross-plattform Font-Stack deklarieren (AptosCustom, Aptos, Segoe UI, Roboto, Helvetica, Arial)
  - [x] OKLCH-Farbräume für Light-/Dark-Mode mit `light-dark()` einpflegen
  
- [x] **📐 Schritt 3: layout.css (Elastischer Viewport & Proportionales Container-Modell)**
  - [x] `#viewport` auf `overflow: auto` einstellen und Zoom-Faktoren entfernen
  - [x] `<din-a4>` auf `height: 94vh; aspect-ratio: 210/297; container-type: size;` umstellen
  - [x] Alle physischen mm-Werte in relative Container-Query-Einheiten (`cqw`/`cqh`) überführen
  - [x] Brieftext-Editor `<din-text>` (oder `#brieftext`) mit Inline-Formatierungs-Unterstützung stylen
  - [x] Druck-Overrides (`@media print`) deklarieren (ausgeblendete Ränder/Sidebar, exakte A4-Skalierung)
  
- [x] **🔔 Schritt 4: floating.css (Popovers, Toasts & Text-Selection Toolbar)**
  - [x] Premium-Toast-Styles für `#toast-v4` mit `toast-platinum-cycle` Keyframes anlegen
  - [x] CSS-Styles für das Textauswahl-Formatting-Popover `#format-toolbar` entwerfen
  
- [x] **📄 Schritt 5: index.html (Custom Elements, Popovers & Toolbar)**
  - [x] Custom Elements (`<din-absender>`, `<din-anschriftfeld>`, `<din-infoblock>`, `<din-fuss>`) anlegen
  - [x] Textauswahl-Formatierungs-Toolbar `#format-toolbar` als Popover-Element (`popover="manual"`) deklarieren
  - [x] Offline-Font-Uploader-Schaltflächen in die Sidebar einfügen
  - [x] Popover-Toast `<div id="toast-v4" popover="manual">` einbetten
  
- [x] **⚡ Schritt 6: storage.js & main.js (Logik, Paste-Filter, Font-Uploader & Popover-Toolbar)**
  - [x] `storage.js` um Speicherfunktionen für Custom Fonts (1-Font-Limit Überschreiben) erweitern
  - [x] `main.js` Bootloader für Font-Injektion und Draft-Recovery schreiben
  - [x] Offline-Font-Uploader Logik implementieren (Base64-Konvertierung, Validation < 60 KB, localStorage-Sync)
  - [x] HTML-Paste-Filter zur Plaintext-Bereinigung einbauen
  - [x] Drag-and-Drop Filter zur Plaintext-Bereinigung einbauen
  - [x] Selection-Event-Listener zur dynamischen Zuweisung des externen Selection-Anchors im DOM programmieren
  - [x] Deklarative Toolbar-Positionierung über CSS Anchor Positioning an --selection-anchor anbinden
  - [x] Textformatierung über Selection und Range API (Wrap/Unwrap in `<b>`/`<u>` / Zitat-Shortcut) implementieren
  - [x] Standard-Browser-Shortcuts (`Strg+B`, `Strg+U`) nativ wirken lassen (kein preventDefault)
  - [x] Toast-Popover mit discrete transition (@starting-style, transition-behavior) und nativem JS-Timer ausstatten

- [x] **📅 Schritt 7: JS Temporal API Mandat & Datum-Autobefüllung**
  - [x] Strikten Legacy Date API Ban in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md` deklarieren
  - [x] W3C Temporal API in `ADR-TECH-STACK.md` und `ADR-JS.md` als exklusive Datums-Engine dokumentieren
  - [x] Nativer Temporal API Code in `loadDraftData()` zur zeitzonensicheren, unveränderlichen und fehlerfreien Bestimmung des lokalen Systemdatums im normativem deutschen Format implementieren
  - [x] Alle Dokumentations- und Code-Änderungen in `DIN-Brief_docs.db` kompilieren

- [x] **🎨 Schritt 8: CSS @scope Isolation & OKLCH Farbmandat**
  - [x] Briefblatt-Stile in `layout.css` innerhalb von `@scope (din-a4)` kapseln
  - [x] Alle HEX, RGBA und Named Colors im CSS und HTML in pure OKLCH-Farben konvertieren
  - [x] Reaktiven Parent Selector `:has()` für Briefbogen-Fokusierungen in `layout.css` implementieren
  - [x] Striktes OKLCH-Farbmandat und Verbot klassischer Farbräume in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md` verankern
  - [x] Alle neuen Änderungen in `DIN-Brief_docs.db` kompilieren

- [x] **🔒 Proaktive Verfassungs-Ausweitung (Antipatterns 8 bis 12)**
  - [x] Sass/Less/CSS-in-JS Verbot (Antipattern 8) in Doku verankern
  - [x] Icon-CDNs & Icon-Fonts Verbot (Antipattern 9) in Doku verankern
  - [x] Lodash & TS-Transpiler Verbot (Antipattern 10) in Doku verankern
  - [x] GSAP & JS-Animations-Libs Verbot (Antipattern 11) in Doku verankern
  - [x] Inline-Styles Verbot für Farben/Layouts (Antipattern 12) in Doku verankern
  - [x] Re-Kompilierung der SQLite-Wissensdatenbank durchführen',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'tasks.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'tasks.md'), 'tasks');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'tasks.md'), 'todo');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'tools/antipatterns/base.json',
  'tools/antipatterns/base.json',
  'active',
  '{
  "version": "1.0.0",
  "layer": "base",
  "description": "Base rules for all projects (migrated and generalized from DIN-Brief Neo).",
  "rules": [
    {
      "id": "B2",
      "severity": "critical",
      "category": "javascript",
      "description": "Legacy Date API (new Date, Date.now, Date.parse) is forbidden. Use Temporal API instead.",
      "graveyard_ref": "A1",
      "pattern": "\\bnew\\s+Date\\(|\\bDate\\.now\\(|\\bDate\\.parse\\(",
      "file_patterns": ["*.js"],
      "exemptions": []
    }
  ]
}
',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'tools/antipatterns/base.json'), 'json');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'tools/antipatterns/project.json',
  'tools/antipatterns/project.json',
  'active',
  '{
  "version": "1.0.0",
  "layer": "project",
  "description": "DIN-Brief Neo specific rules and overrides. These are not intended for the generic boilerplate.",
  "rules": [
    {
      "id": "W3",
      "severity": "high",
      "category": "javascript",
      "description": "Unsanitized innerHTML assignments are unsafe. Use textContent or Sanitizer API where possible. (DIN-specific exemption for contenteditable draft handling.)",
      "graveyard_ref": "A4",
      "pattern": "\\.innerHTML\\s*=",
      "file_patterns": ["*.js"],
      "exemptions": [
        {
          "file": "website/js/main.js",
          "reason": "Draft recovery loading/saving innerHTML and clearing contenteditable elements. Project-specific for now."
        }
      ]
    }
  ]
}
',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'tools/antipatterns/project.json'), 'json');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'tools/antipatterns/web.json',
  'tools/antipatterns/web.json',
  'active',
  '{
  "version": "1.0.0",
  "layer": "web",
  "description": "Rules for HTML, JS, and CSS frontend development (migrated from DIN-Brief Neo, made more general).",
  "rules": [
    {
      "id": "W1",
      "severity": "critical",
      "category": "javascript",
      "description": "document.execCommand is deprecated and forbidden. Use Selection & Range API.",
      "graveyard_ref": "A2",
      "pattern": "\\bexecCommand\\(|\\bqueryCommandState\\(",
      "file_patterns": ["*.js"],
      "exemptions": []
    },
    {
      "id": "W2",
      "severity": "high",
      "category": "javascript",
      "description": "XMLHttpRequest (XHR) is deprecated. Use fetch() API.",
      "graveyard_ref": "A3",
      "pattern": "\\bXMLHttpRequest\\b",
      "file_patterns": ["*.js"],
      "exemptions": []
    },
    {
      "id": "W3",
      "severity": "high",
      "category": "javascript",
      "description": "Unsanitized innerHTML assignments are unsafe. Use textContent or Sanitizer API where possible.",
      "graveyard_ref": "A4",
      "pattern": "\\.innerHTML\\s*=",
      "file_patterns": ["*.js"],
      "exemptions": []
    },
    {
      "id": "W4",
      "severity": "high",
      "category": "css",
      "description": "Hex colors (#RRGGBB, #RGB) are forbidden. Use oklch().",
      "graveyard_ref": "A16",
      "pattern": "#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b",
      "file_patterns": ["*.css"],
      "exemptions": []
    },
    {
      "id": "W5",
      "severity": "high",
      "category": "css",
      "description": "rgb/rgba colors are forbidden. Use oklch().",
      "graveyard_ref": "A17",
      "pattern": "\\brgba?\\(.*?\\)",
      "file_patterns": ["*.css"],
      "exemptions": []
    },
    {
      "id": "W6",
      "severity": "high",
      "category": "css",
      "description": "hsl/hsla colors are forbidden. Use oklch().",
      "graveyard_ref": "A18",
      "pattern": "\\bhsla?\\(.*?\\)",
      "file_patterns": ["*.css"],
      "exemptions": []
    },
    {
      "id": "A38",
      "severity": "critical",
      "category": "general",
      "description": "External connections (CDNs, scripts, stylesheets) are forbidden except for allowed autocomplete and reference APIs.",
      "graveyard_ref": "A38",
      "pattern": "https?:\\/\\/(?!(?:photon\\.komoot\\.io|api\\.geoapify\\.com|api\\.zippopotam\\.us|myprojects\\.geoapify\\.com|www\\.w3\\.org))[a-zA-Z0-9.-]+",
      "file_patterns": ["*.html", "*.css", "*.js"],
      "exemptions": []
    },
    {
      "id": "W7",
      "severity": "critical",
      "category": "general",
      "description": "Google Fonts are forbidden for DSGVO and offline security reasons.",
      "graveyard_ref": "A41",
      "pattern": "fonts\\.googleapis\\.com|fonts\\.gstatic\\.com",
      "file_patterns": ["*.html", "*.css"],
      "exemptions": []
    }
  ]
}
',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'tools/antipatterns/web.json'), 'json');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'tools/antipatterns.json',
  'tools/antipatterns.json',
  'active',
  '{
  "version": "1.0.0",
  "description": "Antipattern-Regeln fuer DIN-BriefNEO. Basierend auf MASTER-DO-DONT-DEPRECATED.md.",
  "rules": [
    {
      "id": "A1",
      "severity": "critical",
      "category": "javascript",
      "description": "Legacy Date API (new Date, Date.now, Date.parse) ist verboten. Verwende stattdessen die Temporal API.",
      "graveyard_ref": "A1",
      "pattern": "\\bnew\\s+Date\\(|\\bDate\\.now\\(|\\bDate\\.parse\\(",
      "file_patterns": ["*.js"],
      "exemptions": []
    },
    {
      "id": "A2",
      "severity": "critical",
      "category": "javascript",
      "description": "document.execCommand is veraltet und verboten. Nutze die Selection & Range API.",
      "graveyard_ref": "A2",
      "pattern": "\\bexecCommand\\(|\\bqueryCommandState\\(",
      "file_patterns": ["*.js"],
      "exemptions": []
    },
    {
      "id": "A3",
      "severity": "high",
      "category": "javascript",
      "description": "XMLHttpRequest (XHR) ist veraltet. Verwende stattdessen die fetch() API.",
      "graveyard_ref": "A3",
      "pattern": "\\bXMLHttpRequest\\b",
      "file_patterns": ["*.js"],
      "exemptions": []
    },
    {
      "id": "A4",
      "severity": "high",
      "category": "javascript",
      "description": "Ungepruefte innerHTML-Zuweisungen sind unsicher. Erlaubt sind nur Zuweisungen mit statischem, vertrauenswuerdigem Inhalt.",
      "graveyard_ref": "A4",
      "pattern": "\\.innerHTML\\s*=",
      "file_patterns": ["*.js"],
      "exemptions": [
        {
          "file": "website/js/main.js",
          "reason": "Draft recovery loading/saving innerHTML and clearing contenteditable elements."
        }
      ]
    },
    {
      "id": "A16",
      "severity": "high",
      "category": "css",
      "description": "Hex-Farben (#RRGGBB, #RGB) sind verboten. Verwende oklch().",
      "graveyard_ref": "A16",
      "pattern": "#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b",
      "file_patterns": ["*.css"],
      "exemptions": []
    },
    {
      "id": "A17",
      "severity": "high",
      "category": "css",
      "description": "rgb/rgba-Farben sind verboten. Verwende oklch().",
      "graveyard_ref": "A17",
      "pattern": "\\brgba?\\(.*?\\)",
      "file_patterns": ["*.css"],
      "exemptions": []
    },
    {
      "id": "A18",
      "severity": "high",
      "category": "css",
      "description": "hsl/hsla-Farben sind verboten. Verwende oklch().",
      "graveyard_ref": "A18",
      "pattern": "\\bhsla?\\(.*?\\)",
      "file_patterns": ["*.css"],
      "exemptions": []
    },
    {
      "id": "A38",
      "severity": "critical",
      "category": "general",
      "description": "Externe Verbindungen (CDNs, Skripte, Stylesheets) sind verboten. Erlaubt sind nur Autocomplete-APIs.",
      "graveyard_ref": "A38",
      "pattern": "https?:\\/\\/(?!(?:photon\\.komoot\\.io|api\\.geoapify\\.com|api\\.zippopotam\\.us|myprojects\\.geoapify\\.com|www\\.w3\\.org))[a-zA-Z0-9.-]+",
      "file_patterns": ["*.html", "*.css", "*.js"],
      "exemptions": []
    },
    {
      "id": "A41",
      "severity": "critical",
      "category": "general",
      "description": "Google Fonts sind wegen DSGVO und Offline-Sicherheit verboten.",
      "graveyard_ref": "A41",
      "pattern": "fonts\\.googleapis\\.com|fonts\\.gstatic\\.com",
      "file_patterns": ["*.html", "*.css"],
      "exemptions": []
    }
  ]
}
',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'tools/antipatterns.json'), 'json');

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
  'Unsanitized innerHTML assignments are unsafe. Use textContent or Sanitizer API where possible. (DIN-specific exemption for contenteditable draft handling.)',
  'A4',
  '\.innerHTML\s*=',
  '["*.js"]',
  '[{"file":"website/js/main.js","reason":"Draft recovery loading/saving innerHTML and clearing contenteditable elements. Project-specific for now."}]'
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
  adr_ref TEXT NOT NULL
);

INSERT INTO tbl_code_links (file_path, line_number, adr_ref) VALUES ('website/js/main.js', 1197, 'ADR-JS');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref) VALUES ('website/js/signature.js', 1, 'ADR-JS');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref) VALUES ('website/css/layout.css', 1, 'ADR-CSS');

