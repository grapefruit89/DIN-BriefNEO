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
  'ADR/ADR-ANTIPATTERN.md',
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
  'ADR/ADR-API.md',
  'ADR-API: External API Integrations & Header Security',
  'accepted',
  '# ADR-API: External API Integrations & Header Security

## 1. Context & Problem

**Sichere, serverlose Adress-Vervollständigung.**
- Viele Autocomplete-Lösungen (wie Google Places) benötigen dicke SDKs und zwingen Nutzer zur Kreditkartenangabe.
- DIN-BriefNEO benötigt ein schnelles, datenschutzkonformes API-Konzept, das vollständig im lokalen Kontext (`file:///`) läuft, ohne Backend-Server.
- API-Keys dürfen nicht via URL-Parameter geleakt werden.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Geoapify + Header-Auth) | Nutzung der REST-API via nativem `fetch()`, Key im Header (`X-Api-Key`) | Zero SDK, höchste Sicherheit vor Leaks, kostenloser Tier reicht | Benötigt eigenen API-Key | Keine | **Gewählt** |
| **Option B** (Google SDK) | Google Places Library laden | Bekannt, hohe Datenqualität | Zwang zu Kreditkarte, schwergewichtiges JS | Datenschutz | Abgelehnt |
| **Option C** (Photon API) | Kostenloses OSM-Backend | Kein Key nötig | Zu schlechte Datenqualität | Usability | Abgelehnt (Deprecated) |

## 3. Decision

**Wir haben uns für Option A (Geoapify & Zippopotam REST APIs) entschieden.**

### Begründung
- **Geoapify:** Einziger Provider für Adress-Autocomplete. Der API-Key wird **strikt per HTTP-Header** (`X-Api-Key`) gesendet, niemals in der URL.
- **Heartbeat:** Eingegebene Keys werden per asynchronem Test (`limit=1`) sofort auf Validität geprüft.
- **Zippopotam:** Die kostenfreie API (`api.zippopotam.us`) wird für das Auto-Ausfüllen von Ortsnamen bei 5-stelliger PLZ genutzt.
- **Race-Condition-Schutz:** Alle API-Aufrufe (`fetch()`) werden durch `AbortController` abgebrochen, wenn eine neue Eingabe erfolgt.

## 4. Consequences

### Positive Auswirkungen
- **Hohe Sicherheit:** Keys leaken nicht in Server-Logs oder Proxys.
- **Zero-Dependency:** Komplett nativ per `fetch()` gelöst, keine SDKs.
- **Top Performance:** AbortController verhindert überflüssige Netzwerk-Requests.

### Risiken & Negative Auswirkungen
- Setzt aktive Internetverbindung voraus für Autocomplete (manuelle Eingabe geht weiterhin offline).

## 5. Implementation & Verification

- Die Header-Security-Regel ist in `main.js` für jeden Geoapify-Aufruf verankert.
- Photon wurde restlos als Antipattern deklariert und aus dem Projekt entfernt.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-JS]]
- [[ADR-FEATURE]]
- [[longevity-guidelines]]',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'ADR/ADR-BETREFF.md',
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
  'ADR/ADR-CSS.md',
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
  'ADR/ADR-DATA-PERSISTENCE.md',
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
  'ADR/ADR-FEATURE.md',
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
  'ADR/ADR-GEOAPIFY.md',
  'ADR-GEOAPIFY: Adress-Autocomplete mit Geoapify',
  'accepted',
  '# ADR-GEOAPIFY: Adress-Autocomplete mit Geoapify

## 1. Context & Problem

**Performantes Autocomplete ohne DOM-Injektionen.**
- Die Eingabe von Empfängeradressen im `<din-anschriftfeld>` soll den Nutzer bestmöglich unterstützen.
- Lokale Treffer sollen zuerst erscheinen (Proximity Bias).
- Die offizielle Geoapify-Library (`@geoapify/geocoder-autocomplete`) injiziert eigene schwer anpassbare DOM-Elemente und bricht damit unsere WYSIWYG-Regel.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Custom Fetch + CSS Anchor) | 100% nativ: Eigener Fetch + natives Popover mit CSS Anchor Positioning | Zero Dependencies, 100% WYSIWYG-Treue | Caching muss selbst programmiert werden | Keine | **Gewählt** |
| **Option B** (Offizielle NPM Library) | Nutzung von `@geoapify/geocoder-autocomplete` | Schnell implementiert, Caching eingebaut | Zerstört WYSIWYG durch eigene DOM-Elemente, Bundle-Size +40KB | Wartung | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Custom Fetch + Native CSS Anchor) entschieden.**

### Begründung
- **Keine Dependencies:** Der Verzicht auf NPM-Libraries entspricht der Zero-JS-Philosophie.
- **Natives Dropdown:** Das Resultat-Popover verankert sich nahtlos über W3C CSS Anchor Positioning.
- **Dynamischer Proximity Bias:** Statt einem statischen Fallback (z.B. Bonn) extrahiert die Logik die PLZ des Absenders, ermittelt via Zippopotam die `lat`/`lon` und nutzt diese für `bias=proximity` bei Geoapify.
- **Performance:** Strenges Debouncing (`300ms`) und Limits (`limit=5`) halten die API-Calls minimal.

## 4. Consequences

### Positive Auswirkungen
- **Maximale Kontrolle:** Das DOM bleibt sauber, keine Fremd-Elemente.
- **Hohe Relevanz:** Der dynamische Bias sorgt dafür, dass Adressen in der Nähe des Absenders priorisiert werden.

### Risiken & Negative Auswirkungen
- Caching muss bei Bedarf selbst in einer `Map` verwaltet werden (aktuell durch AbortController und Debouncing gut abgefangen).

## 5. Implementation & Verification

- Der Custom Fetch ist in `main.js` implementiert.
- Das Dropdown ist als `popover="manual"` mit CSS Anchor an das Eingabefeld gebunden.

## 6. Related Documents

- [[ADR-API]]
- [[ADR-ANTIPATTERN]]

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
  'ADR/ADR-HTML.md',
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
  'ADR/ADR-JS.md',
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
- **Sichere DOM-Manipulation:** Die Verwendung von `innerHTML` ist als Antipattern eingestuft und strikt verboten (XSS-Gefahr). Es dürfen ausschließlich sichere Native-Methoden wie `setHTML()`, `setHTMLUnsafe()` oder `textContent` zur DOM-Injektion genutzt werden.
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
  'ADR/ADR-MIGRATION.md',
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
  'ADR/ADR-TEMPLATE.md',
  'ADR-XXX: [Kurzer, präziser Titel der Entscheidung]',
  'draft | proposed | accepted | deprecated | rejected',
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
  'ADR/ADR-ÜBERSICHT.md',
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
  'ADR/Code-Referenzen.md',
  'Code-Referenzen',
  'active',
  '# Code-Referenzen

Diese Datei wird automatisch von `build_db.js` generiert und listet alle Architektur-Verknüpfungen aus dem Quellcode auf.

| Code Datei | Zeile | Architektur-Entscheidung |
| :--- | :--- | :--- |
| website/js/main.js | 1279 | [[ADR-JS]] |
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
  'archive/DRINGEND-NOCH-BEHEBEN.md',
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'archive/DRINGEND-NOCH-BEHEBEN.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'archive/MODERNIZATION-GUIDE.md',
  'Modernisierungs-Leitfaden: MODERNIZATION-GUIDE.md',
  'active',
  '> [!WARNING]
> **ARCHIVIERT**: Historisches Dokument. Einige der hier genannten Empfehlungen widersprechen der aktuellen `longevity-guidelines.md` (z.B. Temporal API).


# Modernisierungs-Leitfaden: MODERNIZATION-GUIDE.md

Dieses Dokument analysiert die aktuell verwendeten Webtechnologien des **DIN-BriefNEO**-Baseline-Projekts und vergleicht sie mit zukünftigen, potenziellen W3C-Standardkandidaten. Es dient als strategischer Wegweiser für zukünftige Modernisierungen – **ohne sofortige Umsetzung** und unter strikter Wahrung der Longevity-Verfassung.

---

## 🧭 Modernisierungs-Matrix (Tech-Debt Roadmap)

| Aktuelle Technik | Potenzielle modernere Alternative | Status der Alternative | Empfehlung | Begründung & Longevity-Verweis |
| :--- | :--- | :--- | :--- | :--- |
| **Selection/Range API** (zur Y/X-Positionierung der Toolbar) | **CSS Anchor Positioning API** | In Chrome 148+ vollständig stabil. | **Jetzt nutzen** | Da Chrome 148+ unsere exklusive Target-Plattform ist, nutzen wir CSS Anchor Positioning ohne jegliche Rücksicht auf veraltete Safari/Firefox-Stände. Dies eliminiert JavaScript-Positionierungscode vollständig. |
| **`document.execCommand`** (Fett/Unterstreichen nativ) | **Custom Selection & Range DOM-Operationen** | W3C-Standard (Living Standard). | **Jetzt nutzen** | `execCommand` ist veraltet (*deprecated*). Wir haben dies für blockquotes bereits gelöst. Standard-Shortcuts überlassen wir dem Browser, was absolut stabil ist. |
| **Natives JS `Date`-Objekt** | **Temporal API** | In Chrome 148+ nativ und vollständig einsatzbereit. | **Jetzt nutzen** | Die `Temporal` API ist in Chrome 148+ fehlerfrei und nativ implementiert. Wir nutzen sie direkt zur präzisen Datumsberechnung und für Zeitstempel bei Entwürfen. |
| **`localStorage`** (für Base64 Custom Fonts & Drafts) | **Origin Private File System (OPFS)** / **IndexedDB** | W3C-Standard. | **Nie** | OPFS/IndexedDB setzen zwingend HTTPS voraus. Unter `file://` (Doppelklick) stürzen sie mit Security-Exceptions ab. `localStorage` ist laut [Säule 5 der Longevity-Guidelines](../Guides/longevity-guidelines.md) die einzig stabile Option für Doppelklick-Apps. |
| **`@import`** in CSS-Dateien | Native **`link`-Tags** im HTML | W3C-Standard. | **Jetzt nutzen** | `@import` blockiert das parallele Laden von Stylesheets im Browser. Native `<link>`-Tags laden Stylesheets parallel und performanter. |
| **`console.log()`** (für Debugging im Quellcode) | Deaktivierbarer **Custom Logging Wrapper** | Standard JavaScript. | **Jetzt nutzen** | Verhindert, dass sensible Anwendungsdaten in der Produktionskonsole exponiert werden und schont CPU-Ressourcen bei der DOM-Verarbeitung. |
| **`var()` ohne Fallback** in CSS | **`var(--prop, fallback)`** | W3C-Standard. | **Jetzt nutzen** | Redundante Absicherung. Verhindert, dass UI-Elemente bei fehlenden Custom Properties visuell zerreißen. |
| **`innerHTML`** (für Autocomplete- dropdown) | **`textContent`** oder **`createTextNode`** | W3C-Standard. | **Bereits umgesetzt** | Verhindert Cross-Site Scripting (XSS) auf Browserebene. Alle APIs und Benutzereingaben werden strikt als Plaintext behandelt. |

---

## 🔗 Verweise
*   Siehe [longevity-guidelines.md](../Guides/longevity-guidelines.md) zur Einhaltung der abwärtskompatiblen W3C-Schnittstellen.
*   Siehe [ADR-ANTIPATTERN.md](../ADR/ADR-ANTIPATTERN.md) für die expliziten Dateispeicher- und CDN-Ausschlüsse.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'archive/MODERNIZATION-GUIDE.md'), 'documentation');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'archive/tasks.md',
  'Taskliste: Phase 2 (Code-Refactoring & WhatsApp-Style Editor)',
  'active',
  '> [!WARNING]
> **ARCHIVIERT**: Veraltete Taskliste aus Phase 2. Nur zu historischen Zwecken hier abgelegt.


# Taskliste: Phase 2 (Code-Refactoring & WhatsApp-Style Editor)

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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'archive/tasks.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'archive/tasks.md'), 'tasks');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'archive/tasks.md'), 'todo');

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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'obsidian');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'core');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'dev-tools');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'feature-detection');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'chrome-baseline');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'diagnostics');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DEV-INFO.md'), 'easter-egg');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'docs/implementation/sqlite-vec.md',
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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/implementation/sqlite-vec.md'), 'phase1');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/implementation/sqlite-vec.md'), 'sqlite-vec');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/implementation/sqlite-vec.md'), 'hybrid-search');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/implementation/sqlite-vec.md'), 'embedding');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/implementation/sqlite-vec.md'), 'build');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/implementation/sqlite-vec.md'), 'generalisierbarkeit');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'docs/implementation/sqlite-vec.md'), 'tools');

INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'DOCUMENTATION-MAP.md',
  'Dokumenten-Landkarte & Wegweiser',
  'active',
  '# Dokumenten-Landkarte & Wegweiser

Um das Projekt übersichtlich und hochgradig transparent zu halten, ist die Dokumentation in modular verlinkte Single Sources of Truth (SSoTs) gegliedert.

## 🏛️ Philosophie & Gesetzgebung
* **[Longevity Guidelines](Guides/longevity-guidelines.md):** Die unverrückbare "Verfassung" für Wartungsfreiheit (Zero-Dependency, 100% Offline-Autarkie).
* **[Master Lawbook](MASTER-DO-DONT-DEPRECATED.md):** Die zentrale Referenz für alle technologischen Entscheidungen, Verbote und Ersatzstrategien.
* **[AGENTS.md](../AGENTS.md):** Bindender Vertrag für alle KI-Agenten (Reconciliation, 100% Fitness, Logging).
* **[DEV-INFO.md](DEV-INFO.md):** Entwicklerbereich & Feature-Prüfungs-Matrix.

## 🗺️ Status, Spezifikationen & Guides
* **[Spezifikation (spec.md)](spec.md):** Die Kernanforderungen der Features und Backlog.
* **[No-Scroll Techniken](Guides/no-scroll-techniques.md):** Anleitung für Viewport-Perfect Layouts.
* **[Testing Guide](Guides/testing-guide.md):** Interaktives QA-Protokoll und Testfälle.
* **[LLM-First Datenbank-Guide (README-DB.md)](README-DB.md):** Spezifikation der SQLite-DB und MCP-Architektur.
* **[DIN 5008 Master Data](Guides/din-5008-geometry.md):** SSoT für alle physischen Abstände des Briefs.

## 🏗️ Architektur-Entscheidungen (ADRs)
Alle grundlegenden Design-Entscheidungen sind thematisch im Ordner **[ADR/](ADR/)** dokumentiert:
* **[ADR-HTML](ADR/ADR-HTML.md):** Custom Elements, Popover API, `contenteditable`.
* **[ADR-CSS](ADR/ADR-CSS.md):** Proportionaler Zoom, Container Queries, `light-dark()`.
* **[ADR-JS](ADR/ADR-JS.md):** JavaScript-Reglementierung, Selection API.
* **[ADR-GEOAPIFY](ADR/ADR-GEOAPIFY.md):** Zero-Dependency Adress-Autocomplete.
* **[ADR-MIGRATION](ADR/ADR-MIGRATION.md):** Extraktion zur `llm_boilerplate`.

## 📦 Implementierungsdetails
* **[SQLite-Vec Integration](docs/implementation/sqlite-vec.md):** Plan für Vektor-Suche.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DOCUMENTATION-MAP.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'DOCUMENTATION-MAP.md'), 'map');

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
  'Guides/din-5008-geometry.md',
  'Guide: DIN 5008 Geometry Master Data (SSoT)',
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

Der Informationsblock befindet sich rechts oben und wächst von oben nach unten. Je nach Einsatzzweck unterscheidet die DIN 5008 zwischen geschäftlichen und privaten Briefen.

### 4.1 Geschäftsbrief (Kompletter Infoblock)

Der klassische Geschäftsbrief nutzt den vollen, strukturierten Informationsblock für Geschäftszeichen, Ansprechpartner, Telefon und Datum.

| Parameter | Form A | Form B | Ausrichtung | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Infoblock Beginn (X)** | 125 mm | 125 mm | Linksbündig | DIN 5008, Abs. 17.1 |
| **Infoblock Breite** | 75 mm | 75 mm | — | DIN 5008, Abs. 17.1 |
| **Infoblock Beginn (Y)** | 32 mm | 50 mm | Linksbündig | DIN 5008, Abs. 17.1 |
| **Schriftgröße Infoblock** | 8.5 pt (3.00 mm) | 8.5 pt (3.00 mm) | — | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Briefdatum (X)** | 125 mm | 125 mm | Linksbündig | DIN 5008, Abs. 17.2 |
| **Briefdatum (Y)** | 74 mm | 92 mm | Linksbündig (10 pt / 3.53 mm) | `eigenequellen/DIN-BriefNEO/issues/#1` |

### 4.2 Privatbrief (Reduzierter Infoblock)

Für Privatbriefe entfallen die komplexen Geschäftszeichen. Der Informationsblock wird stark reduziert und enthält üblicherweise nur die Absender-Kontaktdaten.

**Beispielhafter Aufbau (rechtsbündig oder im Infoblock linksbündig platziert):**
- Moritz Baumeister
- Kettelerstraße 2
- 53844 Troisdorf
- Telefonnummer (optional)
- E-Mail-Adresse (optional)

*Geometrie:* Die Startpositionen (X: 125 mm, Y: 32/50 mm) gelten in der Regel weiterhin, um das einheitliche DIN-Fenster-Layout nicht zu brechen, jedoch ist der Inhalt freier formatierbar. Das Datum bildet meist den Abschluss.

---

## 5. Hauptinhalte (Betreff, Anrede, Brieftext)

Der Inhaltsbereich beginnt immer unterhalb des Informationsblocks und ist in strikte Abschnitte unterteilt. 

WICHTIG: Technisch (im HTML/CSS) befinden sich diese Elemente innerhalb eines gemeinsamen Flow-Containers (`#briefkern`), da sie sich gegenseitig nach unten schieben müssen (z. B. wenn der Betreff 2-zeilig wird). Hier sind die geometrischen Startpunkte:

### 5.1 Betreffzeile

Der Betreff ist das erste Element. Er wird fett formatiert und erhält keinen Punkt am Ende.

> **WICHTIG:** Der Betreff muss **unterhalb** der oberen Falzmarke (105 mm) positioniert werden, damit er beim Falten in den DL-Umschlag nicht geknickt wird.

| Parameter | Form A | Form B | Schriftgröße | Quelle / Detail |
| :--- | :--- | :--- | :--- | :--- |
| **Startposition (Y)** | **85.4 mm** | **109 mm** | 12 pt (**4.23 mm**, fett) | DIN 5008, Abs. 18 & 19 |
| **Linke Fluchtlinie (X)** | 25 mm | 25 mm | — | DIN 5008, Abs. 6.1 |
| **Rechte Begrenzung (X)** | 190 mm | 190 mm | — | DIN 5008, Abs. 6.2 |
| **Maximal-Zeilen** | 2 Zeilen | 2 Zeilen | — | DIN 5008, Abs. 18 |

### 5.2 Anrede

Die Anrede steht mit festem Abstand unter dem Betreff. Da die Betreffzeile in ihrer Höhe variieren kann (1 oder 2 Zeilen), wird die absolute Y-Position der Anredezeile oft dynamisch vom Betreff nach unten geschoben. Die unten genannten Y-Werte gelten für einen einzeiligen Betreff.

| Parameter | Form A | Form B | Schriftgröße | Quelle / Detail |
| :--- | :--- | :--- | :--- | :--- |
| **Abstand zum Betreff** | 2 Leerzeilen (8.46 mm) | 2 Leerzeilen (8.46 mm) | 10.5 pt (**3.70 mm**) | DIN 5008, Abs. 19 |
| **Erwartete Y-Position** | ~98 mm | ~122 mm | 10.5 pt (**3.70 mm**) | Beispiel bei einzeiligem Betreff |

### 5.3 Brieftext (Fließtext)

Der eigentliche Briefinhalt beginnt eine Leerzeile unter der Anrede.

| Parameter | Form A | Form B | Schriftgröße | Quelle / Detail |
| :--- | :--- | :--- | :--- | :--- |
| **Abstand zur Anrede** | 1 Leerzeile (4.23 mm) | 1 Leerzeile (4.23 mm) | 10.5 pt (**3.70 mm**) | DIN 5008, Abs. 20 |
| **Erwartete Y-Position** | ~106 mm | ~130 mm | 10.5 pt (**3.70 mm**) | Beispiel bei einzeiligem Betreff |
| **Zeilenabstand** | 1.4 (ca. 5.18 mm) | 1.4 (ca. 5.18 mm) | — | DIN 5008, Abs. 20 |
| **Grußformel (Y)** | Dynamisch | Dynamisch | 10.5 pt (**3.70 mm**) | 1 Leerzeile unter Textende |
| **Unterschrift (Y)** | Dynamisch | Dynamisch | 10.5 pt (**3.70 mm**) | 3 Leerzeilen für Unterschrift |

---

## 6. Faltmarken & Lochmarke
Die Hilfsmarken dienen der physischen Faltung und Lochung. Die Y-Werte beziehen sich auf den Abstand vom oberen Blattrand.

| Hilfsmarke | Form A | Form B | Breite / Stil | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Falzmarke 1 (oben)** | **87 mm** | **105 mm** | 3 mm (horizontal) | Fixe Position nach DIN 5008 Form B. Nicht veränderbar, da relevant für Fensterumschlag. |
| **Falzmarke 2 (unten)** | **181 mm** | **210 mm** | 3 mm (horizontal) | Angepasste Position für mehr Freiraum. |
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


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/din-5008-layout.md',
  'Guide: DIN 5008 Layout-Richtlinien (SSoT)',
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
| **Falzmarke 2 (unten)** | 181 mm | **210 mm** |
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
- **Betreff:** Beginnt bei **109 mm** von oben (Form B) bzw. **85,4 mm** (Form A). Der Betreff wird fett formatiert und erhält keinen Punkt am Ende. *Der Betreff wird bewusst nach der oberen Falzmarke (105 mm) platziert, um ein Knicken beim Falten zu vermeiden.*
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


INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (
  'Guides/geoapify-autocomplete.md',
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
  'Guides/glossary.md',
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
  'Guides/GUIDE-TEMPLATE.md',
  'Guide: [Thema des Guides]',
  'active | draft | deprecated',
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
  'Guides/longevity-guidelines.md',
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
> - **DOM-Manipulation:** `innerHTML` ist strengstens untersagt. Es dürfen ausschließlich sichere, native Methoden wie `setHTML()`, `setHTMLUnsafe()` oder `textContent` zur Injektion von Daten genutzt werden.
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
  'Guides/no-scroll-techniques.md',
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
  'Guides/testing-guide.md',
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
  'LLM_CONTEXT.md',
  'LLM Context Bundle',
  'active',
  '> [!IMPORTANT]
> **SYSTEM-PROMPT / CORE CONTEXT**
> Dieses Dokument ist eine automatisch generierte, aggregierte Landkarte der aktuellen Projektarchitektur.
> Es enthält alle kritischen Verfassungen, Guidelines und Spezifikationen, die du als KI-Agent zwingend beachten musst.
> Das Projekt "DIN-Brief Neo" strebt nach absoluter **Zero-Dependency** und **100% Offline-Fähigkeit** via W3C Living Standards in Chrome 148+.
> Nutze KEINE veralteten APIs (z.B. execCommand) und KEINE Frameworks.
> 
> Dies ist dein maßgeblicher System-Prompt.
> Generiert am: 2026-07-02T13:13:41.244Z
> ==============================================================================



# ==========================================
# FILE: README.md
# ==========================================

---
title: DIN-BriefNEO: Pure Refactored Edition
status: active
tags: [documentation, readme]
---

# DIN-BriefNEO: Pure Refactored Edition

Willkommen im offiziellen Repository von **DIN-BriefNEO (Pure Refactored Edition)**. 

Dieses Projekt ist eine datenschutzkonforme, 100% offline-fähige und wartungsfreie Web-Applikation zur pixelperfekten Erstellung normkonformer Briefe nach dem offiziellen deutschen Standard **DIN 5008 (Form A und Form B)**.

---

## ⚡ Quick Start

Das Projekt nutzt keinen Build-Prozess und keinen Entwicklungsserver. Es ist ein "Zero-Dependency" Projekt.

1. **Starten:** Führe das Skript `start.ps1` im Root-Verzeichnis aus.
2. Dieses Skript prüft den Code (Reconciliation Loop) und stellt sicher, dass der **Fitness Score bei 100%** liegt.
3. Danach kannst du einfach die `website/index.html` per Doppelklick in Chrome 148+ (oder Edge/Opera) öffnen. Keine Installation, kein `npm install`.

---

## 🏛️ Die Philosophie (Wartungsfreiheit auf Lebenszeit)

Dieses Projekt bricht radikal mit der Kurzlebigkeit moderner Web-Frameworks. Wir vertrauen zu 100% auf native, standardisierte W3C/WHATWG-Schnittstellen. Unser Ziel ist eine **Überlebensspanne von vielen Jahren ohne eine einzige Zeile Wartungsaufwand**.

* **Keine Frameworks:** Weder React, noch Vue, noch Svelte.
* **Keine Compiler:** Weder Webpack, noch Babel, noch Sass.
* **Keine externen Abhängigkeiten:** Keine CDNs, keine Google Fonts, vollständige Offline-Autarkie (Privacy-first).
* **Native Standards:** Wir nutzen Container Queries, Popover API, CSS `light-dark()` und die Selection/Range API.

---

## 🗺️ Dokumentation

Das Projekt ist extrem detailliert dokumentiert, um KI-Agenten und Entwicklern einen perfekten Einstieg zu bieten.

👉 **Zur vollständigen [Dokumenten-Landkarte (DOCUMENTATION-MAP.md)](DOCUMENTATION-MAP.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

---

## 🤖 KI-Entwicklung (Light Mode vs. Full Mode)

Um Komplexität zu minimieren, nutzen KI-Agenten einen gestuften Workflow:

| Modus | Wann? | Schritte |
|---|---|---|
| **Light Mode** | Bugfixes, kleine Anpassungen | Pre-Build → Änderung → Post-Build (100% Fitness Pflicht!) → Logging (`log_session.js`) |
| **Full Mode** | Wichtige Features, Architektur | Wie Light Mode, aber **zusätzlich** ein Architektur-Dokument unter `specs/` anlegen. |

Jede Aktion in diesem Projekt muss strikt gegen die [Longevity Guidelines](Guides/longevity-guidelines.md) geprüft werden.


# ==========================================
# FILE: DOCUMENTATION-MAP.md
# ==========================================

---
title: Dokumenten-Landkarte & Wegweiser
status: active
tags: [documentation, map]
---

# Dokumenten-Landkarte & Wegweiser

Um das Projekt übersichtlich und hochgradig transparent zu halten, ist die Dokumentation in modular verlinkte Single Sources of Truth (SSoTs) gegliedert.

## 🏛️ Philosophie & Gesetzgebung
* **[Longevity Guidelines](Guides/longevity-guidelines.md):** Die unverrückbare "Verfassung" für Wartungsfreiheit (Zero-Dependency, 100% Offline-Autarkie).
* **[Master Lawbook](MASTER-DO-DONT-DEPRECATED.md):** Die zentrale Referenz für alle technologischen Entscheidungen, Verbote und Ersatzstrategien.
* **[AGENTS.md](../AGENTS.md):** Bindender Vertrag für alle KI-Agenten (Reconciliation, 100% Fitness, Logging).
* **[DEV-INFO.md](DEV-INFO.md):** Entwicklerbereich & Feature-Prüfungs-Matrix.

## 🗺️ Status, Spezifikationen & Guides
* **[Spezifikation (spec.md)](spec.md):** Die Kernanforderungen der Features und Backlog.
* **[No-Scroll Techniken](Guides/no-scroll-techniques.md):** Anleitung für Viewport-Perfect Layouts.
* **[Testing Guide](Guides/testing-guide.md):** Interaktives QA-Protokoll und Testfälle.
* **[LLM-First Datenbank-Guide (README-DB.md)](README-DB.md):** Spezifikation der SQLite-DB und MCP-Architektur.
* **[DIN 5008 Master Data](Guides/din-5008-geometry.md):** SSoT für alle physischen Abstände des Briefs.

## 🏗️ Architektur-Entscheidungen (ADRs)
Alle grundlegenden Design-Entscheidungen sind thematisch im Ordner **[ADR/](ADR/)** dokumentiert:
* **[ADR-HTML](ADR/ADR-HTML.md):** Custom Elements, Popover API, `contenteditable`.
* **[ADR-CSS](ADR/ADR-CSS.md):** Proportionaler Zoom, Container Queries, `light-dark()`.
* **[ADR-JS](ADR/ADR-JS.md):** JavaScript-Reglementierung, Selection API.
* **[ADR-GEOAPIFY](ADR/ADR-GEOAPIFY.md):** Zero-Dependency Adress-Autocomplete.
* **[ADR-MIGRATION](ADR/ADR-MIGRATION.md):** Extraktion zur `llm_boilerplate`.

## 📦 Implementierungsdetails
* **[SQLite-Vec Integration](docs/implementation/sqlite-vec.md):** Plan für Vektor-Suche.


# ==========================================
# FILE: ../AGENTS.md
# ==========================================

# AGENTS.md — DIN-Brief Neo (Testballon für LLM-Boilerplate)

**BINDENDER VERHALTENSVERTRAG FÜR ALLE KI-AGENTEN**

Dieser Vertrag ist **nicht verhandelbar**. Verstöße führen zur Ablehnung der Änderung.

## CORE RULES (TL;DR – diese gelten immer)

- Reconciliation Loop + **Evolutionary Fitness Score 100%** sind nicht verhandelbar.
- **Build vor jeder relevanten Änderung** (Pre-Flight) und **danach** (Post-Flight).
- Jede KI-Aktion **muss** sofort mit `log_session.js` protokolliert werden.
- **Generalisierbarkeit** muss bei jeder neuen Lösung/Regel geprüft und als Vorschlag dokumentiert werden.
- `constitution.md` und `MASTER-DO-DONT-DEPRECATED.md` müssen respektiert werden.
- DIN-Brief Neo ist Testballon – gute Patterns müssen aktiv in die `llm_boilerplate` überführt werden.

## Light Mode vs Full Mode (gestufter Workflow)

**Light Mode (Standard für die meisten Änderungen: Bugfixes, kleine Refactorings, kleine Anpassungen)**

1. Pre-Build ausführen (`.\start.ps1` generiert auch `LLM_CONTEXT.md`).
2. Generierte `LLM_CONTEXT.md` lesen, um den aktuellen System-Prompt zu erhalten.
3. Änderung durchführen (Core Rules einhalten).
4. Post-Build ausführen (`.\start.ps1`) → **muss EVOLUTIONARY FITNESS SCORE: 100%** ergeben.
5. Mit `log_session.js` protokollieren.
6. Kurzen Generalisierungs-Vermerk (1-2 Sätze) im `DECISION-LOG.md` schreiben.

**Beispiel Light Mode:**
"Kleinen Bug im Adress-Autocomplete gefixt (textContent statt unsicherem innerHTML). Pre- und Post-Build waren 100%. Generalisierbarkeit: Die Regel ist bereits in web.json → keine Extraktion nötig."

**Full Mode (nur für wichtige Features, Architektur-Änderungen, boilerplate-relevante Arbeit)**

Zusätzlich:
- `specs/NNN-kurzname/` Ordner anlegen.
- `spec.md` mit Anforderungen, Akzeptanzkriterien und ausführlichem Generalisierungs-Check erstellen.
- Optional `plan.md` und `tasks.md`.
- Den vollen Hybrid-Workflow aus HYBRID-SPEC-DRIVEN-WORKFLOW.md befolgen.

**Wann welchen Modus?**
- Light Mode als Default für schnelle, sichere Fortschritte.
- Full Mode bewusst wählen für große/wichtige Dinge.

Die Core Rules gelten immer.

## Kern-Elemente (behalten und respektieren)

- Reconciliation Engine + Fitness Score (hartes Gate, 100% Pflicht).
- Layered Antipatterns (`tools/antipatterns/base.json`, `web.json`, `project.json`).
- `log_session.js` (Audit Trail für alle KI-Aktionen).
- `build_db.js` + Reconciliation als Qualitätsfundament.
- `constitution.md` und `MASTER-DO-DONT-DEPRECATED.md` als primäre Quellen.

## Protokollierung (Pflicht)

Jede relevante Aktion muss direkt nach erfolgreichem Post-Build geloggt werden.

**Empfohlener Befehl (Light Mode):**
```bash
node tools/log_session.js --agent "GrokBuild" --action "<kurz>" --file "<pfad>" --desc "<was + warum + generalisierbarkeit>"
```

## Zusammenfassung – die harten Regeln (kurz & bündig)

- Build **vor jeder** relevanten Änderung (Pre-Flight) und **danach** (Post-Flight) → **100% Score** oder Änderung abgelehnt.
- Sofort loggen (mit aktuellem korrektem Pfad).
- Generalisierbarkeit bei **jeder** Lösung prüfen, vorschlagen und dokumentieren.
- Core Files und Tools respektieren.

Vertragsverletzung = Änderung wird abgelehnt.  
Wer das nicht einhält, arbeitet nicht konform mit diesem Vertrag.

---

**Hinweis:** Komplexe Konzepte (Capability Contracts, DCP, Adaptive Context Synthesis, etc.) sind eingefroren in FUTURE_IDEAS.md. Konzentriere dich auf den KISS-Ansatz und die Core Rules oben.

## Andrej Karpathy LLM Coding Principles

Um die bestmöglichen Ergebnisse zu erzielen, gelten für alle KI-Agenten in diesem Projekt zusätzlich die folgenden Kernprinzipien:

1. **Thinking Before Coding:**
   - Erstelle bei komplexeren Aufgaben erst einen `implementation_plan.md` und bitte um Freigabe (Planning Mode).
   - Analysiere den existierenden Code gründlich, bevor du Änderungen machst.

2. **Simplicity First (KISS):**
   - Bevorzuge einfache, native Lösungen (CSS statt JS, Vanilla JS statt Frameworks).
   - Vermeide "Overengineering" und komplizierte Architektur-Abstraktionen.

3. **Surgical Changes:**
   - Mache präzise, minimale Code-Änderungen.
   - Ändere nichts, was für das aktuelle Feature nicht strikt erforderlich ist.
   - Erhalte bestehende Kommentare und Formatierungen.

4. **Goal-Driven Execution:**
   - Behalte das Endziel im Fokus und verstricke dich nicht in Nebenproblemen, es sei denn, sie blockieren den Fortschritt.
   - Verifiziere das Ergebnis nach der Umsetzung.


# ==========================================
# FILE: constitution.md
# ==========================================

---
title: Verfassung (Constitution) — DIN-BriefNEO
status: active
tags: [obsidian, core, documentation]
aliases: ["constitution"]
---

# Verfassung (Constitution) — DIN-BriefNEO

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
Jede Abweichung von den Kernprinzipien oder jede optionale Erweiterung/Abhängigkeit muss zwingend über eine MADR-konforme ADR begründet, dokumentiert und freigegeben werden. Technische Schulden sind ausgeschlossen.


# ==========================================
# FILE: Guides/longevity-guidelines.md
# ==========================================

---
title: "Guide: Longevity & W3C Native Standards Guidelines (Longevity Guide)"
status: active
tags:
  - obsidian
  - documentation
  - guide
  - manual
  - architecture
aliases:
  - "Longevity Guidelines"
  - "W3C Standards"
last-updated: 2026-07-02
project: DIN-BriefNEO
type: guide
---

# Longevity & W3C Native Standards Guidelines (Longevity Guide)

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
> - **DOM-Manipulation:** `innerHTML` ist strengstens untersagt. Es dürfen ausschließlich sichere, native Methoden wie `setHTML()`, `setHTMLUnsafe()` oder `textContent` zur Injektion von Daten genutzt werden.
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
Da Web-Standards stetig weiterentwickelt werden, empfehlen wir eine Überprüfung dieser Richtlinien in regelmäßigen Abständen (z. B. alle 2 Jahre), um neue, stabile W3C-Standards in das Projekt aufzunehmen.

# ==========================================
# FILE: MASTER-DO-DONT-DEPRECATED.md
# ==========================================

---
title: DIN‑BriefNEO — Immutable Architectural Law: MUST‑USE vs. ANTIPATTERN Catalog
status: active
tags: [obsidian, core, documentation, rules, standards]
aliases: ["MASTER-DO-DONT-DEPRECATED"]
---

# DIN‑BriefNEO — Immutable Architectural Law: MUST‑USE vs. ANTIPATTERN Catalog

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

**This document is effective immediately and supersedes all prior technology guidelines. It applies to all present and future contributors—human and artificial.**


# ==========================================
# FILE: spec.md
# ==========================================

---
title: Spezifikation (Spec) — DIN-BriefNEO Baseline Features
status: active
tags: [documentation, spec, requirements]
---

# Spezifikation (Spec) — DIN-BriefNEO Baseline Features

> [!NOTE]
> Die exakten Maße und Geometriedaten gemäß dem DIN 5008 Standard findest du in unserem hochpräzisen [DIN 5008 Geometry Master Data Guide](file:///c:/Users/morit/Documents/Obsidian_Main/Websites%20&%20Software/DIN-Brief%20Neo/aktueller_arbeitsordner/Guides/din-5008-geometry.md). Dieses Dokument dient als Single Source of Truth (SSoT) für alle physischen Abstände.

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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'LLM_CONTEXT.md'), 'context');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'LLM_CONTEXT.md'), 'llm');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'LLM_CONTEXT.md'), 'prompt');

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
*   🛠️ **[DEV-INFO.md](DEV-INFO.md):** Unsere 25-Feature Diagnose- und Feature-Erkennungs-Matrix.


## 🔍 Aktueller Status der Vektor-Suche (Semantic Search)
Es ist geplant, die reine FTS5-Volltextsuche durch eine **Hybrid Search (Volltext + semantische Suche)** zu ersetzen.
Dazu soll die Erweiterung `sqlite-vec` integriert werden, welche die Speicherung von Embeddings und Vektor-Distanzen nativ in SQLite erlaubt.
Der detaillierte Implementierungsplan liegt unter: **[docs/implementation/sqlite-vec.md](docs/implementation/sqlite-vec.md)**.',
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

## ⚡ Quick Start

Das Projekt nutzt keinen Build-Prozess und keinen Entwicklungsserver. Es ist ein "Zero-Dependency" Projekt.

1. **Starten:** Führe das Skript `start.ps1` im Root-Verzeichnis aus.
2. Dieses Skript prüft den Code (Reconciliation Loop) und stellt sicher, dass der **Fitness Score bei 100%** liegt.
3. Danach kannst du einfach die `website/index.html` per Doppelklick in Chrome 148+ (oder Edge/Opera) öffnen. Keine Installation, kein `npm install`.

---

## 🏛️ Die Philosophie (Wartungsfreiheit auf Lebenszeit)

Dieses Projekt bricht radikal mit der Kurzlebigkeit moderner Web-Frameworks. Wir vertrauen zu 100% auf native, standardisierte W3C/WHATWG-Schnittstellen. Unser Ziel ist eine **Überlebensspanne von vielen Jahren ohne eine einzige Zeile Wartungsaufwand**.

* **Keine Frameworks:** Weder React, noch Vue, noch Svelte.
* **Keine Compiler:** Weder Webpack, noch Babel, noch Sass.
* **Keine externen Abhängigkeiten:** Keine CDNs, keine Google Fonts, vollständige Offline-Autarkie (Privacy-first).
* **Native Standards:** Wir nutzen Container Queries, Popover API, CSS `light-dark()` und die Selection/Range API.

---

## 🗺️ Dokumentation

Das Projekt ist extrem detailliert dokumentiert, um KI-Agenten und Entwicklern einen perfekten Einstieg zu bieten.

👉 **Zur vollständigen [Dokumenten-Landkarte (DOCUMENTATION-MAP.md)](DOCUMENTATION-MAP.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

---

## 🤖 KI-Entwicklung (Light Mode vs. Full Mode)

Um Komplexität zu minimieren, nutzen KI-Agenten einen gestuften Workflow:

| Modus | Wann? | Schritte |
|---|---|---|
| **Light Mode** | Bugfixes, kleine Anpassungen | Pre-Build → Änderung → Post-Build (100% Fitness Pflicht!) → Logging (`log_session.js`) |
| **Full Mode** | Wichtige Features, Architektur | Wie Light Mode, aber **zusätzlich** ein Architektur-Dokument unter `specs/` anlegen. |

Jede Aktion in diesem Projekt muss strikt gegen die [Longevity Guidelines](Guides/longevity-guidelines.md) geprüft werden.',
  NULL,  -- content_hash (wird in Paket 2 gesetzt)
  NULL,  -- embedding (wird in Paket 3 gesetzt)
  'all-MiniLM-L6-v2',
  384
);

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'README.md'), 'readme');

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

INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'spec.md'), 'documentation');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'spec.md'), 'spec');
INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = 'spec.md'), 'requirements');

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
  "rules": []
}',
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
  'Unsanitized innerHTML assignments are unsafe. Use textContent or Sanitizer API where possible.',
  'A4',
  '\.innerHTML\s*=',
  '["*.js"]',
  '[]'
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

INSERT INTO tbl_code_links (file_path, line_number, adr_ref) VALUES ('website/js/main.js', 1279, 'ADR-JS');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref) VALUES ('website/js/signature.js', 1, 'ADR-JS');
INSERT INTO tbl_code_links (file_path, line_number, adr_ref) VALUES ('website/css/layout.css', 1, 'ADR-CSS');

