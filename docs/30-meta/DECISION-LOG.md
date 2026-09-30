---
aliases:
- DECISION-LOG
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: decision-log
status: active
tags:
- obsidian
- core
- documentation
- decision-log
- architecture
title: 'Chronologisches Entscheidungs-Log: DECISION-LOG.md'
type: log
updated: '2026-08-08'
---

# Chronologisches Entscheidungs-Log: DECISION-LOG.md

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

*   **Quelle:** Ordner [ADR/](../10-architecture/)

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

*   **Quelle:** [ADR/](../10-architecture/), `build/index.json` (generiertes Build-Artefakt)

*   **Status:** Aktiviert

---

### 2026-05-24 – Etablierung des Entwicklerbereichs & Feature-Prüfung ([[DEV-INFO]])

*   **Entscheidung:** Schaffung einer dedizierten Diagnose-Referenz `DEV-INFO.md` zur systematischen Erkennung von 14 W3C-Living-Standards und experimentellen Features auf Basis von `check_readiness.js`.

*   **Grund:** Bietet vollständige Transparenz über den Reifegrad modernster Web-APIs in der Chrome 147/148/149+ Zielumgebung und liefert ein robustes, kopierbares F12-Konsole-Skript.

*   **Quelle:** [[DEV-INFO|DEV-INFO.md]], `build/index.json` (generiertes Build-Artefakt)

*   **Status:** Aktiviert

---

### 2026-05-24 – Massive Expansion des Diagnose-Guides & Easter-Egg Panel Spezifikation

*   **Entscheidung:** Erweiterung der Feature-Matrix in `DEV-INFO.md` von 14 auf 25 absolute Bleeding-Edge-Features der Web-Plattform und Spezifizierung eines 3-Klick-Easter-Eggs mit einem nativen HTML5 Popover-Overlay im Dokument `spec.md` (Feature 11).

*   **Grund:** Reaktion auf die exzellenten Browser-Testergebnisse des Benutzers (Chrome 148+), die unerwartet breite Unterstützung modernster Standards zeigen. Ermöglicht maximale JS-Einsparungen durch Nutzung nativer HTML5/CSS-Mechanismen (z. B. Popover API) für das zukünftige Entwickler-Dashboard.

*   **Quelle:** [[DEV-INFO|DEV-INFO.md]], [[spec|spec.md]]

*   **Status:** Aktiviert

---

### 2026-05-25 – Einführung der LLM-First SQLite-Datenbank-Architektur & [[README-DB]]

*   **Entscheidung:** Etablierung eines serverlosen Hybrid-Datenbankmodells zur KI-optimierten Aufbereitung des gesamten Projektwissens. Die Markdown-Dateien bleiben die Quell-Ebenen (Git-Master), während eine SQLite-Datenbank `docs.db` automatisch über ein Node.js-Kompilierskript `build_db.js` generiert und über einen Model Context Protocol (MCP) Server bereitgestellt wird. Spezifizierung der Architektur im Dokument `README-DB.md`.

*   **Grund:** Beseitigt Token-Engpässe, überwindet fehlende Indexierungsstrukturen unstrukturierter Verzeichnisse und befähigt KIs (z. B. Claude via Desktop-MCP), relationale, hocheffiziente Suchen (inkl. FTS5-Volltextsuche) auf der Doku auszuführen, anstatt ganze Dateien einlesen zu müssen.

*   **Quelle:** [[README-DB|README-DB.md]], `build/index.json` (generiertes Build-Artefakt), `build_db.js`, `github_action_workflow.txt`

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

*   **Entscheidung:** Registrierung der CSS-Custom-Property `--guide-opacity` als Typ `<number>`<number>` im CSS und Implementierung einer flüssigen Transition auf `:root`.

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

*   **Entscheidung:** AGENTS.md mit dem bereitgestellten Testballon-Vertrag wurde zunächst versehentlich im duplizierten Baum unter `Other_Projects\DIN-Brief Neo` angelegt (mit neuerarbeitsordner). Korrigiert und neu platziert direkt im aktiven Root: `Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\AGENTS.md`. Zusätzlich Eintrag in diesem DECISION-LOG und Pointer im aktueller_arbeitsordner/[[README]] hinzugefügt. Pre- und Post-Build mit vollem Reconciliation & Fitness Check (100 %) durchgeführt.

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

*   **Entscheidung:** Vollständig überarbeitete finale Version mit folgenden Verbesserungen: Kurze harte "Core Rules"-Zusammenfassung (TL;DR) ganz oben, Logging-Abschnitt praktikabel gemacht mit klarem Hinweis auf aktuellen Stand + Fallback auf llm_boilerplate, Generalisierungs-Pflicht noch präziser (bei jedem Feature/Regel + explizite Vorschlagspflicht), Sprache überall auf "muss / darf nicht / ist verboten" verschärft, explizite Erwähnung von [[constitution]] + MASTER-DO-DONT-DEPRECATED.md als zu respektierende Quellen, klarer Eskalationsmechanismus bei wiederholten Verstößen, kurzer Abschnitt zur Beziehung DIN-Brief Neo ↔ llm_boilerplate (kopieren vs. referenzieren), Regelung für Änderungen an AGENTS.md selbst hinzugefügt. Pre- und Post-Build mit 100% Fitness Score durchgeführt.

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

  - Created `specs/` with numbered structure (001-hybrid-workflow-integration/[[spec]] as first example) for traceability.

  - Created `HYBRID-SPEC-DRIVEN-WORKFLOW.md` defining the combined process (spec-kit phases Constitution→Spec→Plan→Tasks→Implement + our mandatory Reconciliation/Fitness/Log/Generalisierungs gates at the end).

  - Added `.specify/templates/spec.md` and `.specify/constitution.md` (reference).

  - All changes followed Pre/Post build (100%), log_session, and this DECISION-LOG entry.

*   **Grund:** spec-kit excels at lightweight, structured, agent-friendly workflow and organization. Our system is superior in quality enforcement and antifragility. Hybrid gives us the best of both for the Testballon goal (easy extraction of generic patterns to llm_boilerplate).

*   **Quelle:** Detailed user comparison of spec-kit vs our DIN + Boilerplate system, AGENTS.md Generalisierungs-Pflicht and Core Rules, existing MIGRATION-ROADMAP.

*   **Status:** Aktiviert

---

### 2026-06-12 – Light Mode vs Full Mode eingeführt (Vereinfachung zur Reduktion von Fehleranfälligkeit)

*   **Entscheidung:** Gestuften Workflow in AGENTS.md und [[HYBRID-SPEC-DRIVEN-WORKFLOW]] etabliert: 

  - **Light Mode** (Default für die meisten Änderungen): Pre-Build → Änderung → Post-Build (muss 100% Fitness) → Loggen + kurzer (1-2 Sätze) Generalisierungs-Vermerk im DECISION-LOG.md. Kein zwingendes [[spec]]/plan/tasks.

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

  - Für jeden Unterordner und den gesamten archiv/ eine klare [[README]] angelegt mit Herkunft, Archivierungsgrund und möglichem Nutzen.

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

- **2026-06-30 - Canvas Signature Compressor (Zero-JS/Offline)**: Ein neues Feature zum Einf�gen grafischer Unterschriften. Zur Schonung des 5MB localStorage Limits wird ein unsichtbarer Canvas-Kompressor genutzt. Generalisierbarkeit: Gro�e Bin�rdaten lassen sich im Browser per Canvas extrem ressourcenschonend f�r den localStorage aufbereiten (Zero-Server-Architektur).

---

### 2026-08-08 – Memory-Audit: claude.ai Projekt-Erinnerung gegen Code/Docs abgeglichen

*   **Entscheidung:** Die automatisch von claude.ai gepflegte Projekt-Memory wurde gegen den aktuellen Produktivcode (`website/js/`) und die Obsidian-Docs geprüft. Ergebnis: Sechs dort als "offen" gelistete Bugs existieren im aktuellen Code nicht mehr (SPEC-066/Ghost-Mirror bereits umgesetzt, `din-body`-Verstoß obsolet weil `din-body` durch `din-text`/`din-kern` ersetzt wurde, `data-layout`-Attribut obsolet durch CSS-`:has()`-Form-Switching, OPFS-Worker-Bug obsolet weil OPFS komplett zugunsten LocalStorage aufgegeben wurde, STORAGE_KEY-Versionsmismatch und CSS.highlights-Dead-Code nicht im Code auffindbar). Dagegen wurde ein bislang unentdeckter echter Fehler gefunden: `Feature-Matrix.md` führte "Profil-Management" als ✅ Aktiv, obwohl im Produktivcode keine Implementierung existiert (siehe [[ADR-PROFILE-MANAGEMENT]]).

*   **Grund:** Mo bat um eine Durchsicht vergangener Chats auf Findings/Verbesserungspotenzial. Da einzelne Chat-Transkripte nicht zugänglich sind, wurde stattdessen die claude.ai-Memory (als Cross-Chat-Zusammenfassung) gegen den verifizierbaren Ist-Zustand geprüft.

*   **Quelle:** `DIN-BriefNEO_memory_konsolidiert.md` (hatte dieselbe Diskrepanz bereits am 2026-08-07 vermerkt, ohne dass die claude.ai-Memory seither korrigiert wurde), Code-Grep über `website/js/`, [[ADR-PROFILE-MANAGEMENT]], [[Feature-Matrix]].

*   **Status:** Aktiviert — Feature-Matrix korrigiert, ADR-PROFILE-MANAGEMENT als offenes Backlog-Item angelegt.

*   **Offener Punkt:** Die claude.ai-Projekt-Memory selbst kann von hier aus nicht editiert werden (kein Dateizugriff darauf) — Mo müsste sie manuell in den claude.ai-Projekteinstellungen aktualisieren oder auf `DIN-BriefNEO_memory_konsolidiert.md` verweisen lassen.

---

### 2026-08-08 – Memory-Audit Teil 2: restliche offene CLAUDE.md-Punkte geklärt

*   **Entscheidung:** Die vier verbleibenden offenen Punkte aus `CLAUDE.md` ("Offene Punkte, Stand 2026-08-07") wurden im Code verifiziert. Ergebnis: (1) Salutation Engine SPEC-002 nur teilweise abgedeckt — Ghost-Text-Pattern und Punctuation-Validator fehlen, `Salutation-Engine.md` referenzierte zudem falsche Dateinamen (korrigiert auf `41-salutation-engine.js`). (2) IBAN Ghost-Text existiert nicht (deckt sich mit ADR-PROFILE-MANAGEMENT). (3) `--c-danger`/`--c-success` sind definiert, `--c-text-muted` ist eine tote Doku-Referenz ohne Code-Bezug. (4) History Stack Limit ist im Code `50`, nicht 20 oder 60 wie in beiden alten Doku-Versionen behauptet. Zusätzlich wurde ein toter Wikilink (`ADR-ÜBERSICHT`, Datei existiert nicht mehr) aus `10-architecture/README.md` entfernt.

*   **Grund:** Fortsetzung des Memory-Audits auf Mo's Wunsch, alle offenen Punkte durchzugehen statt nur den Profil-Management-Fund stehen zu lassen.

*   **Quelle:** Code-Grep über `website/js/`, `website/css/variables.css`, `docs/00-foundation/spec.md`, [[Salutation-Engine]], [[ADR-PROFILE-MANAGEMENT]].

*   **Status:** Aktiviert — `CLAUDE.md`, `Salutation-Engine.md`, `DIN-BriefNEO_memory_konsolidiert.md` und `10-architecture/README.md` entsprechend korrigiert.

*   **Offener Punkt:** History-Stack-Limit-Diskrepanz ist nur doku-seitig korrigiert markiert, nicht im Code geändert (50 ist der bestehende, funktionierende Wert — keine Code-Änderung nötig, nur Doku-Korrektur ausstehend an den Stellen, die noch 20/60 nennen).
---

### 2026-09-09 – AGENTS.md-Hygiene: 7 verifizierte Stale-Claims korrigiert + opencode.json

*   **Entscheidung:** `AGENTS.md` gegen den echten Repo-Zustand abgeglichen und korrigiert: (1) `.\scripts\start.ps1` → `tools/start.ps1` (Pfad existierte nicht; auch `repository.yaml` nennt `tools/`). (2) LLM-Kontext liegt in `agent/cache/LLM_CONTEXT.md` (Output von `tools/create_context.js`, start.ps1-Zeile 76), nicht im Root/`build/`. (3) Phantom-Templates `new-adr.py`/`new-guide.py` entfernt, real: `docs/30-meta/ADR-TEMPLATE.md` + `GUIDE-TEMPLATE.md`. (4) `file:///`-Bezug in §7 entfernt — App nutzt `<script type="module">` und braucht zwingend einen lokalen Webserver. (5) `FUTURE_IDEAS.md`-Fußnote entfernt (Datei existiert nicht). (6) Linux-Fitness-Gate-Einstieg dokumentiert: `node tools/build_db.js` (verifiziert, Score 100%); `reconciliation.js` allein ist ein stilles Modul. (7) Frontmatter-`updated` auf 2026-09-09 gezogen. Zusätzlich: `opencode.json` angelegt, das `AGENTS.md` + `repository.yaml` automatisch als Instructions lädt.

*   **Grund:** Mo bat um Verbesserung der Agenten-Arbeitsfähigkeit im Repo. Jeder Agent scheiterte an der ersten Pflicht-Anweisung des Vertrags (PowerShell-Pfad), und drei referenzierte Dateien existierten nicht. Beides verifiziert durch Ist-Prüfung (ls/run/rg) gegen `repository.yaml` und die Tools.

*   **Quelle:** Code-Grep über `tools/`, `create_context.js` (OUTPUT_FILE), `start.ps1`, `website/index.html`, Testlauf `node tools/build_db.js` (100%).

*   **Status:** Aktiviert — Fitness Gate Pre- und Post-Build je 100%, Session via `log_session.js` protokolliert.

*   **Offener Punkt:** `log_session.js` bricht auf frischem Clone mit SQLite-Error 14 ab, wenn `agent/cache/` nicht existiert (wird normalerweise von `start.ps1` angelegt) — Tool-Fix (mkdir) oder Start.ps1-Unabhängigkeit offen. `CLAUDE.md` hat dieselben `scripts/`-Pfadfehler und veraltete Struktur-Referenzen (u.a. `build/LLM_CONTEXT.md` falsch) — Korrektur ausstehend.

---

### 2026-09-09 – CLAUDE.md-Hygiene + opencode-Skills-Anschluss

*   **Entscheidung:** (1) `CLAUDE.md` gegen den echten Repo-Zustand korrigiert: Doppelklick-Mythos beseitigt (App braucht wegen `<script type="module">` zwingend einen lokalen Webserver), nicht existierender `scripts/`-Ordner-Block auf `tools/start.ps1` + Root-`start.bat` umgestellt, `build/LLM_CONTEXT.md` → `agent/cache/LLM_CONTEXT.md`, `agent/` und `opencode.json` in die Root-Struktur aufgenommen, Fitness-Check-Kommando gefixt (+ Linux-Alternative), alle weiteren `scripts/`-Referenzen gesäubert. (2) `opencode.json` um `skills.paths: ["agent/skills"]` erweitert — die vier Repo-Skills (Frontmatter-Validität verifiziert: name + description in allen SKILL.md) laden jetzt automatisch in opencode-Sessions, ohne Kopie; `agent/skills/` bleibt Single Source of Truth.

*   **Grund:** Fortsetzung der AGENTS.md-Hygiene (gleicher Tag): dieselben Stale-Claims standen in CLAUDE.md und würden Claude Code / Gemini CI in die Irre führen. Skills-Anschluss: Repository.yaml verlangt agent/ als Skill-Quelle — opencode erkennt die Ordner nativ via skills.paths.

*   **Quelle:** `tools/create_context.js` (OUTPUT_FILE), `tools/start.ps1`, `website/index.html` (type=module), `rg`-Sweep über AGENTS.md/CLAUDE.md (0 verbliebene `scripts/`-Treffer), Frontmatter-Check aller 4 SKILL.md.

*   **Status:** Aktiviert — Fitness Gate Post-Build 100%, Session via `log_session.js` protokolliert.

*   **Offener Punkt:** opencode-Restart nötig, damit Config + Skills greifen (Config wird beim Start geladen). Verifikation im Live-Chat ausstehend.

---

### 2026-09-09 – Repo-weite Eintrittspunkt-Hygiene + opencode-Friction-Setup

*   **Entscheidung:** (1) `README.md`, `GEMINI.md` und `AI-AGENTS-CLI.md` von den `scripts/`-Phantompfaden befreit (identische Klasse wie AGENTS.md/CLAUDE.md-Fixes vom selben Tag); README-Mythos „lokaler Python-Server" korrigiert (real: `tools/dev_server.ps1`, PowerShell/.NET). (2) `tools/log_session.js` hart gefixt: `fs.mkdirSync(agent/cache, {recursive: true})` vor dem DB-Open — behebt den dokumentierten Fresh-Clone-Absturz (SQLite-Error 14), live verifiziert. (3) `agent/cache/LLM_CONTEXT.md` erstmals erzeugt (`node tools/create_context.js`, 66 KB, 12 Kern-Dateien) — der Kontext-Schritt aus AGENTS.md §3 ist jetzt real begehbar. (4) `.opencode/command/fitness.md` angelegt (`/fitness`-Shortcut für den Fitness Gate) und `opencode.json` um `permission.bash: {"node tools/*": "allow"}` erweitert — Pflichtkommandos ohne Bestätigungs-Popup.

*   **Grund:** Mo bat um alles weitere, das Agenten-Sessions ohne Suchen macht. Bewusst NICHT angefasst: Verfassung, Law Catalog, ADRs und historische Doku — dort ist `file://` bewusste Design-Historie (Catalog nur per ADR änderbar); `docs/30-meta/tooling-overview.md` hat noch ~15 `scripts/`-Referenzen (offen).

*   **Quelle:** `rg`-Sweep über Root-Guides, `git check-ignore -v build/import.sql` (gitignored, wegwerfbar), Live-Testlauf `log_session.js` nach Fix.

*   **Status:** Aktiviert — Fitness Gate Pre- und Post-Build je 100%.

*   **Offener Punkt:** `docs/30-meta/tooling-overview.md` (Tool-Inventar, verlinkt aus repository.yaml) nennt noch durchgängig `scripts/start.ps1` und `build/LLM_CONTEXT.md` — Korrektur ausstehend. opencode-Restart für Config/Skills/Commands ausstehend.

---

### 2026-09-09 – docs/90-policy/ aufgelöst (1-Datei-Ordner) + Anlagen-Toggle-Zwitter gekillt

*   **Entscheidung:** (1) Der Ein-Datei-Ordner `docs/90-policy/` ist Geschichte: `HYBRID-SPEC-DRIVEN-WORKFLOW.md` zog nach `docs/30-meta/` (dort liegt Prozess-Doku ohnehin). Bewusst NICHT nach `00-foundation/` zurück — der frühere Umzug war dokumentierte Entscheidung („verlässt Fundament zur Wahrung des Gesetzescharakters", foundation_inventory.json), die Rückkehr hätte sie umgekehrt. Alle lebenden Referenzen aktualisiert: `repository.yaml` (90-policy-Subpath entfernt, 30-meta-Beschreibung erweitert), `docs/index.md` (Baum + Section 5), `docs/00-foundation/README.md` (3 Stellen), `CLAUDE.md`, Frontmatter-Tag `din-briefneo/policy` → `din-briefneo/meta`, Struktur-Keys in `foundation_inventory.json`. Historische Dokumente (FOUNDATION-RESTORATION-PLAN, memory_konsolidiert, OBSIDIAN-SETUP-GUIDE mit Vault-`_9`-Anker) blieben absichtlich unverändert. (2) Der Anlagen-Toggle-Zwitter (letzter offener JS-Kill-Restposten, review2_grok.md §4.2) ist gekillt: sr-only-Checkbox `#toggle-anlagen` + Button `#btn-anlagen-toggle` + aria-pressed-Sync-JS (main.js, ~17 Zeilen inkl. startViewTransition-Wrapper) entfernt — ersetzt durch natives `<input type="checkbox" switch>` im etablierten `sidebar-switch-row`-Muster (wie Hilfslinien/KI-Switch). Sichtbarkeit läuft unverändert rein über `:root:has(#toggle-anlagen:checked)`; das Label rendert nativ via CSS `::before content: attr(data-ui)`. Tote `.sidebar-addon-btn`-Regeln aus layout.css entfernt, ADR-HTML.md aktualisiert. (3) `tools/reconciliation.js`: View-Transitions-Nachweis von `main.js` auf `02-settings-manager.js` umgezogen (Feature lebt im Theme-Toggle weiter; der Gate-Check war auf die gelöschte Stelle festgenagelt).

*   **Grund:** Mon explizite Vorgabe gegen 1-Datei-Ordner (Struktur-Hygiene). Anlagen-Fix: review2_grok hatte das Muster schon verbindlich skizziert — ein Switch, CSS macht den Rest; der Button-JS-Sync war gegen das eigene Phase-2-Konsistenzversprechen. ViewTransition beim Anlagen-Toggle wurde bewusst fallengelassen: Der Guides-Switch (Phase-2-Kanon) nutzt ebenfalls keinen VT-Wrapper — Konsistenz schlägt Einzel-Nice-to-have.

*   **Quelle:** `rg`-Sweep `90-policy`/`HYBRID-SPEC`/`btn-anlagen-toggle`/`sidebar-addon-btn` über Repo (0 verbliebene lebende Treffer), `website/index.html:94-110`, `website/js/main.js:129-145`, `website/css/layout.css:653-670`, `website/css/floating.css:413` (natives data-ui-Rendering — kein JS-Dictionary nötig), review2_grok.md §4.2, tools/reconciliation.js:133.

*   **Status:** Aktiviert — Fitness Gate Post-Build je 100 % (bei beiden Änderungen; beim Anlagen-Fix zwischenzeitlich 96,43 % durch Gate-Pointer, nach Korrektur 100 %).

*   **Offener Punkt:** JS-Kill-Verbleib: nur noch Kosmetik laut review2_grok §4.5 (Toast-Interna `class="hidden"`) und Phase-3-Hebel Format-Toolbar-Positionierung → CSS Anchor Positioning. OBSIDIAN-SETUP-GUIDE führt den Vault-Anker `_9` (90-policy-Spiegel) — Obsidian-Vault-Anpassung ist separat zu prüfen. opencode-Restart für Config/Skills/Commands weiterhin ausstehend.

---

### 2026-09-09 – Toast-Interna: `hidden`-Klasse entfernt (Badge/Action waren faktisch tot)

*   **Entscheidung:** `hidden`-Klasse von `#toast-badge` und `#toast-action` in `website/index.html:255-256` entfernt (Restposten aus review2_grok.md §4.5, dort als „Kosmetik" gelistet). Kein weiterer Code nötig: Die Sichtbarkeit läuft vollständig über die bestehende CSS-`:empty`-Regel (`floating.css:57`) — `textContent` leer → `:empty` → `display:none`, Inhalt gesetzt → sichtbar. Die `hidden`-Utility-Klasse in `layout.css:797` bleibt (nutzt `addons/ai-assistant.js` für den Rewrite-Button).

*   **Grund:** Fund war schärfer als „Kosmetik": `32-toast.js` toggelt niemals `classList`, also hing `hidden` dauerhaft an beiden Elementen, und `.hidden { display:none !important }` schlug die `.toast-badge { display: inline-flex }`-Regel — das x2/x3-Dedupe-Badge und der Undo-Button waren faktisch unsichtbar. Der Fix ist zugleich popover-konsistent: Toast-Sichtbarkeit ist jetzt 100 % contentgetrieben über CSS, 0 JS-Sichtbarkeits-Toggles.

*   **Quelle:** `rg classList website/js/32-toast.js` (0 Treffer), `rg "\.hidden" website/css/`, `website/index.html:253-257`, `website/css/floating.css:57-88`, review2_grok.md §4.5.

*   **Status:** Aktiviert — Fitness Gate Post-Build 100 %, Session via `log_session.js` protokolliert.

*   **Offener Punkt:** Verbleibende JS-Kill-Kandidaten laut review2_grok.md: nur noch §4.4 (Format-Toolbar positioniert per JS → CSS Anchor Positioning, Phase 3). Postvermerk-Drei-Schreiber (§4.3) ist UX-Konsolidierung, kein JS-Kill.

---

## 2026-09-09 — Kleindateien-Bereinigung: Intl statt Monatstabelle, .br-Datenlader statt Inline-Wörterbuch

**Entscheidung:**
1. `47-date-format.js`: MONTHS-Array + padStart ersetzt durch `Intl.DateTimeFormat('de-DE', { day:'numeric', month:'long', year:'numeric' }).format(Temporal.Now.zonedDateTimeISO(...))`. Neben-Bug gefixt: Code lieferte „04. September" (padStart), ADR-JS-Beispiel und HTML-Placeholder verlangen „4. September 2026" (ohne führende Null).
2. `41-salutation-engine.js`: Verwaistes `data/de_vornamen_gender.json.br` (2,6 KB) verdrahtet statt Inline-Sets (951 Namen). Load via `fetch` + `DecompressionStream('brotli')` nach 45-Muster, file://-Guard, graceful Degradation → neutrale Anrede. Datei 415 → 330 Zeilen.

**Grund:** Handgepflegte Wörterbücher (Monate, Vornamen) sind redundant zu Platform-ICU bzw. zum existing Build-Artefakt in `research/research_results/n_gender.json.br` → `website/data/`. Beides verletzte auf je eine Art „Single Source of Truth": der Code widersprach dem ADR-Format, die `.br`-Datei war tot (Embedding hatte ROADMAP Step 2 ersetzt, ohne die Datei zu löschen oder zu nutzen).

**Quelle:** Context7 (Temporal-Spec / temporal-polyfill-Doku): `Intl.DateTimeFormat.format()` akzeptiert Temporal-Instanzen nativ → kein manualer Monatsindex nötig. research/README.md, docs/30-meta/ROADMAP.md (Namens-Dataset-Provenienz).

**Status:** Umgesetzt (Fitness Gate 100 %).

**Offener Punkt:** ADR-JS-Typdef kennt Intl-Temporal-Overloads nicht → lokaler `/** @type {any} */`-Cast (Codebase-Konvention aus 45). Nachfassen, wenn TS-Libs Temporal-Intl-Overloads ausrollen. Kleindateien-Merges (44→45, 51+52→51) weiterhin offen, warten auf Freigabe.

---

## 2026-09-09 — Chrome-Release-Notes-Scan 142–151: Temporal nativ stable, text-fit/page-margin-safety für Druck-Workflow

**Entscheidung:**
1. Vollständiger Scan der letzten 10 Chrome-Stable-Versionen (142–151, `developer.chrome.com/release-notes/<VERSION>`); Quelle `https://developer.chrome.com/release-notes/151` + Scan-Ergebnisse in `docs/30-meta/web-standards-tracking.md` §1/§4 dokumentiert (Versions-Tabelle mit Projekt-Mapping + Kernerkenntnisse).
2. Scan lieferte **kein Breaking-Change** für bestehende Patterns; Top-Fund-Kandidaten für künftige PoCs: `Temporal` nativ stable (144, erfüllt den `new Date()`-Ban nativ), `text-fit` (150, stable — kann Layout-Text-Fit-JS-Kandidat ersetzen), `page-margin-safety` (150 — Druckrand-Handling für print.css), `contrast-color()` (147), `Focusgroup` (146 OT/150, JS-Kill für Tastatur-Navigation), `meta name="text-scale"` (146).

**Grund:** Contract-gemäßer Basis-Scan auf neue CSS/native Features (§4 AGENTS.md-Geist: native Lösung vor JS); `webfetch` der Release-Notes 142–151 inkl. ICU-77-Warnung (143) für 47-date-format.js — Intl-Formate sind datengetrieben, keine hartcodierten Format-Annahmen. 152/153 existieren bereits als Beta/Preview (Vorgriff dokumentiert).

**Quelle:** developer.chrome.com Release Notes 142–151 (alle 10 Versionen am 2026-09-09 abgerufen), Context7-Quellen-Format aus web-standards-tracking §1.

**Status:** Umgesetzt — Fitness Gate Post-Build 100 %, Session via `log_session.js` protokolliert.

**Offener Punkt:** `text-fit` und `page-margin-safety` sind PoC-Kandidaten (isolierter PoC in scratch/, dann ADR-CSS-Update) — nächster Scan-Termin: Chrome 152/153 Stable. Generalisierbarkeit: Scan-Format (Release-Notes-Tabelle + Projekt-Mapping) übertragbar in `llm_boilerplate` als Standard-Recherche-Ritual.

---

## 2026-09-09 — PoCs text-fit/page-margin-safety (Chrome 150+): `contain` ist ungültig, `shrink` ist der Fix

**Entscheidung:**
1. PoC in Helium (Chrome/151.0.7922.137) via CDP: `scratch/test-text-fit.html` (CSSOM-Validität + Skalierungsverhalten), `scratch/test-page-margin-safety.html` (Descriptor-Parsing über `CSSPageRule`), Auswerter `scratch/cdp-eval.js`. `jsconfig.json` schließt `scratch/` vom App-Typecheck aus (isoliertes PoC-Gerüst, kein Produktionscode).
2. Befund `text-fit`: `contain` wird in Chrome 150+ **verworfen** — die Spec-Grammatik (css-text-5) kennt `[none|grow|shrink] [consistent|per-line|per-line-all]? <percentage>?`, kein `contain`. Damit waren 3 Deklarationen in `layout.css` (#absender Z. 337, #betreff Z. 393, `.single-line` Z. 769) tot. Fix: `contain` → `shrink` (identische Zielwirkung: Text in Box skaliert). Live-Verifikation über die App: alle drei Regeln rechnen `shrink`. `shrink 60%` (Z. 790, 6-Elemente-Block) ist gültig und bleibt unverändert.
3. Befund `page-margin-safety`: Descriptor parst (`none`/`clamp`/`add` gültig, Garbage verworfen, `@page :first` ok). Semantik: `clamp` = max(Wert, `<safe-printable-inset>`), `add` = Wert + Inset, nur an Blatträndern. → Integration in `print.css` (DIN-5008-Druck) folgt im Layout-Split-Batch.

**Grund:** PoC vor Adoption (AGENTS.md-Geist: Verifikation vor Produktionsnutzung, Context7/Specs haben Vorrang vor Annahmen). MDN dokumentiert beide Features noch nicht — Validierung lief über Editor's Drafts (css-text-5, css-page-3) + realer Chrome-151-CSSOM-Prüfung statt veraltetem Wissen.

**Quelle:** `scratch/test-text-fit.html` + `scratch/test-page-margin-safety.html` (Helium CDP 9222), Spec-Auszüge css-text-5 `#text-fit-property` / css-page-3 `#page-margin-safety` (Editor's Drafts, Juni/März 2026), Ergebnisse in web-standards-tracking §4 (PoC-Ergebnisse-Sektion).

**Status:** Umgesetzt — Fitness Gate 100 % (vorher 99,84 % wegen scratch-Typecheck, via jsconfig-Exclude gelöst), Session geloggt.

**Offener Punkt:** `page-margin-safety`-Integration in `print.css` (Kandidat: `@page { page-margin-safety: clamp; }` als Absicherung der 25/20/30mm-Ränder gegen unbedruckbare Zonen). Generalisierbarkeit: PoC-Harness-Muster (isolierte HTML-Testdateien + CDP-Auswerter statt Framework-Testsuite) übertragbar in `llm_boilerplate` als Standard-Verifikationsritual für proprietäre/stabile Features ohne MDN-Doku.

---

## 2026-09-09 — Dark-Mode-Fix: DIN-A4-Blatt bleibt immer weiss (User-Bugfix)

**Entscheidung:** `--c-paper-night` von `oklch(0.18 0.02 260)` (nachtschwarzes Sheet) auf `oklch(0.94 0.008 260)` (gedimmtes Weiss) gesetzt; `--c-ink-night` → `oklch(0.13 0.01 260)` (dunkle Tinte), `--c-ghost-night` → `oklch(0.45 0.01 260)`. Das Blatt ist physisches DIN-5008-Papier und muss in beiden Themes hell sein — oklch erlaubt das feine Runterdimmen (L 94 % statt 100 %) gegen Blendung.

**Grund:** (1) UX: Ein schwarzes Briefblatt widerspricht der Papier-Metapher. (2) Print-Bug als Nebenfund: `light-dark()` hätte im dunklen Theme auch dunkel gedruckt (`print.css` erzwang nur `body`-weiss, nicht das Sheet). Der Fix behebt beides mit einem Satz Variablen.

**Quelle:** User-Fehlerbericht ("nachtschwarz"), Live-Verifikation in Helium/Chrome 151 (Dark via `din_settings`-localStorage, Hard-Reload `ignoreCache`): `din-a4` rechnet `oklch(0.94 0.008 260)` / Ink `oklch(0.13 0.01 260)`. Bereitgestellt in `variables.css` (Z. 46-51).

**Status:** Umgesetzt — Fitness Gate 100 %, Session geloggt.

**Offener Punkt:** Der eingebaute Theme-Dimmer (`--theme-dim`, settings `themeDim`) dimmt separat — Prüfen, ob Dimmer-Effekt + neues Paper-Weiss harmonieren (UI-Test im Full-Batch). Generalisierbarkeit: Regel "Surface, die physisches Papier repräsentiert, wechselt nicht das Theme" übertragbar in `llm_boilerplate`.

---

## 2026-09-10 — Format-Toolbar Phase-3-Finalisierung + Temporal/Intl-Bugfix (Init-Kette war halb tot)

**Entscheidung:**
1. **Rest-Cleanup Format-Toolbar** (Popover/Anchor-Positioning war aus Vorgänger-Session zu ~85 % nativ): Verdecktes Relay-Div `#format-command-target` gelöscht — `#format-toolbar` selbst ist jetzt Command-Target (`commandfor="format-toolbar"`, Invoker Commands M135 dispatcht das `CommandEvent` direkt auf den Popover). `31-format-toolbar.js`: Command-Listener an der Toolbar statt am Geister-Div, Button-Lookup in `#commandButtons`-Map gecacht (statt 4× `querySelector` pro selectionchange). CSS-Seite (floating.css) mit Phase-3-Kommentar dokumentiert.
2. **Kritischer Nebenfund beim Live-Test**: Die App-Init-Kette starb bereits vor `applyLetterDate` — `47-date-format.js:9` warf `TypeError: Invalid argument for Temporal` (Chrome 151: `Intl.DateTimeFormat.format()` akzeptiert **kein** `Temporal.ZonedDateTime`), und die unbehandelte Exception im DOMContentLoaded-Handler riss UIProtections, SettingsManager, Autosave und FormatToolbar mit ab (`#datum` leer, kein Draft-Save). **Fix: `letterDateFmt.format(zdt.toPlainDate())`** (+ `@type {any}`-Cast für Intl-Typings). Empirisch verifiziert in Chrome 151: `ZonedDateTime` → ERR, `PlainDate`/`PlainDateTime`/`Instant` → ok.
3. **Live-Test-Batterie (CDP/Helium, bestanden)**: selectionchange → Anker-Positionierung + `showPopover()` ✓; Button-Click → `CommandEvent` auf Toolbar → Bold- und Quote-Wrap ✓ (`<b>…</b>`, `<blockquote>…</blockquote>`); `aria-pressed`-Sync läuft; Collapse → `hidePopover()` ✓; Hard-Reload ohne Uncaught-Errors.

**Grund:** Native Mechanik vor JS-Restanten (§2 Surgical/KISS); der Bugfix folgt aus der Verifikationspflicht — der Temporal-Fehler war nicht durch die Toolbar-Änderung verursacht (Crash-Punkt lag davor), sondern seit der Option-A-Umstellung latent. Error-Capture via CDP (`Runtime.exceptionThrown`) statt Raten.

**Quelle:** Empirische Chrome-151-Prüfung über `scratch/cdp-eval.js` + `/tmp/opencode/cdp-errors.js` (Helium CDP 9222). Context7: keine Doku zur Temporal↔Intl-Integration verfügbar; Verifikation daher im Zielbrowser. MDN-Web-API-Scan gegen den JS-Bestand: Broadcast Channel (Multi-Tab-Draft-Sync), CloseWatcher, View Transition (Theme-Wechsel), CSS Font Loading/Local Font Access (Font-Injection) als künftige Kandidaten; CSS Custom Highlight API für `din-comment` verworfen (Persistenz/Print brauchen echte DOM-Knoten).

**Status:** Umgesetzt — Fitness Gate 100 % (vorher 99,84 % durch Intl-TS-Typing, via Cast gelöst), Session geloggt.

**Offener Punkt:** (1) `DecompressionStream('brotli')` wird von Helium/Chrome 151 nicht unterstützt (Warnung in `45-address-intelligence.js`, gefangen) — Fallback prüfen. (2) Toast-Countdown als CSS-Animation mit `animation-play-state: paused` bei `:hover` + `animationend`-Close (ersetzt JS-Pause/Resume-Timer) — Plan im nächsten Batch. Generalisierbarkeit: "Popover als eigener Command-Target"-Pattern + Temporal-Intl-Falle (`toPlainDate()` vor `Intl.format`) übertragbar in `llm_boilerplate`.

---

## 2026-09-10 — Native-API-Batch: FontFace-Injection, CloseWatcher-Toasts, View-Transition-Verifizierung + brotli→gzip-Datenmigration

**Entscheidung:**
1. **CSS Font Loading API statt `<style>`-Injection** (`02-settings-manager.js`): `injectFont()` ist jetzt async und baut einen `FontFace('AptosCustom', url(base64))`, lädt via `await face.load()` (Reject → Warn-Toast `FONT_FORMAT_ERROR` + Status-Reset), ersetzt die alte Face via `document.fonts.delete()` → `add()`. Reset-Handler entlädt die Face nativ statt `#din-custom-font-style`-String zu entfernen. Kein Style-Element mehr — Live verifiziert: valides TTF (fontTools-Subset) lädt, korruptes Base64 wirft Reject + Error-Toast, Delete/Reset räumt auf.
2. **Native `CloseWatcher` für Toast-Esc-Dismiss** (`32-toast.js`): `armCloseWatcher()`/`destroyCloseWatcher()`; `close`-Event ruft `clearTimer()` + `cleanupPopover()` — funktioniert auch für Sticky-Toasts ohne keydown-Handler. Live-Verifiziert mit **trusted** Esc-Events via CDP `Input.dispatchKeyEvent` (programmatische KeyboardEvents feuern CloseWatcher nicht!): Popover zu, `state.active=false`, `closer=null` → unser Cleanup-Pfad lief. Kein Fallback nötig (Feature-Detect-Guard drin).
3. **View Transition für Theme-Wechsel verifiziert statt neu gebaut**: War schon implementiert (`startViewTransition` + 2s-Crossfade-CSS). Zwei Nebenbugs dabei gefunden und gefixt: (a) Theme-Toggle feuerte `applyTheme(next)` UND `updateSettings()` → **zwei** Transitions pro Klick — jetzt nur noch `settings.theme = next; updateSettings();`; (b) `transition.finished` rejected bei abgebrochener Transition (`InvalidStateError`, Unhandled-Rejection-Spam) — jetzt `.catch(() => {})`.
4. **brotli→gzip-Datenmigration**: `DecompressionStream('brotli')` ist in Chrome **4–154 unshipped** (nur Firefox 147+, caniuse + Live-Test) — die Offline-PLZ/Großkunden/Gender-Datasets waren auf der Primärplattform tot. Alle 3 `.br`-Dateien + beide Embedded-Base64-Blobs (`plz-embedded.js`) via node `zlib.brotliDecompressSync` → `gzipSync(level 9)` konvertiert (Großenpreis: +15–21 %, z. B. 71,9→87,2 KB), Konstanten umbenannt (`PLZ_DATA_GZIP_B64`), 4 DecompressionStream-Sites + Fetch-Pfade auf `'gzip'`/`.gz` umgestellt (Bonus: die `@type {any}`-Casts fielen weg, `gzip` ist getypt). `.br`-Dateien gelöscht. Live verifiziert: Kein Init-Fehler mehr, PLZ-Suche (10115→Berlin, 187 City→PLZ-Treffer), Großkunde (10026→N26 AG), Zero-Click-Gender („Moritz Weber"→Herr, „Angelika Schmitt"→Frau).
5. **Ambient-Typen**: `website/js/webapi.d.ts` deklariert `CloseWatcher` für ts-check (lib ES2022/DOM kennt sie noch nicht).

**Grund:** Native APIs vor JS-Hacks (KISS); Streams-brotli ≠ HTTP-brotli (Content-Encoding seit Chrome 50) — der Verwechslungsfalle aufgesessen, erst der caniuse-Eintrag für die Streams-API klärte es. Test-Artefakte gelernt: (a) Hidden Tabs drosseln Timer/Task-Scheduling → Async-Evals timeouten scheinbar (`Page.bringToFront` vor Tests); (b) `document.fonts.check('12px NonExistentFamily')` returns `true` (Chrome-Quirk bei leerer Familie) — Faces via `[...document.fonts]` iterieren statt `check()`.

**Quelle:** Live-Verifikation über `scratch/cdp-eval.js` (+ neuer `awaitPromise: true` im Harness), `/tmp/opencode/cdp-errors.js`, `/tmp/opencode/cdp-key.js` (trusted Esc) — Helium Chrome 151, CDP 9222. caniuse `mdn-api_decompressionstream_decompressionstream_brotli`; MDN FontFace (via Context7 `/mdn/content`). Migrations-Skript: `/tmp/opencode/brotli2gzip.js` (One-off; falls Datensätze je regeneriert werden, gzip-Format beibehalten).

**Status:** Umgesetzt — Fitness Gate 100 %, alle Live-Tests bestanden.

**Offener Punkt:** (1) Toast-Countdown als CSS-Animation (siehe voriger Eintrag) — Plan unverändert. (2) Datengröße +15 % akzeptiert für Universal-Support; falls jemals brotli in Streams shipt, ist der Revert-Dokumentationspfad hier. Generalisierbarkeit: „Streams-API-Feature-Support ≠ HTTP-Content-Encoding-Support separat prüfen" + „check() auf unbekannte Familie ist true — direkt über FontFaceSet iterieren" übertragbar in `llm_boilerplate`.

## 2026-09-10 — Baseline-Verifizierung + Form-A/B-Animation-Fix + CSS-Context-Split (8 Dateien)

**Entscheidung:**
1. **`:active-view-transition` ersetzt JS-Klassen-Workaround** (Baseline 01/2026): Die 2s-Theme-Crossfade-Klasse `html.theme-transition` (JS `classList.add/remove` + `finished.finally().catch()`) ist jetzt `html:active-view-transition::view-transition-*` — rein CSS, drei JS-Zeilen + Rejection-Handling weg.
2. **Form-A/B-Klick löste fälschlich die 2s-Root-Transition aus**: `applySettings()` ruft bei jedem Settings-Update `applyTheme()` — das feuerte blind `startViewTransition()`, auch ohne Theme-Änderung. Fix: Guard `themeUnchanged` (data-theme-Vergleich) in `applyTheme()` + `changeLayout()` als eigener Pfad mit **element-scoped VT nur auf `din-a4`** (~0,25s statt 2s). Live verifiziert: Form-A-Klick → `rootCalls: 0, sheetCalls: 1`, `--fold-1-y` schaltet korrekt.
3. **`contrast-color()` für Inline-Feedback-Badges** (Baseline 04/2026, api.webstatus.dev: low_date 2026-04-10): `floating.css` `.input-feedback-msg` — manuelle Textfarben (`oklch(100% 0 0)` auf danger, `oklch(15%...)` auf warning) durch `contrast-color(var(--c-*))` ersetzt.
4. **Element-scoped VT auf Font-Status-Chip + PLZ-Trefferliste** (`02-settings-manager.js`/`45-address-intelligence.js`): Feature-Detect `typeof el.startViewTransition === 'function'` + Reduced-Motion-Guard + Fallback plain update; `popoverEl.startViewTransition(render)` um `replaceChildren`.
5. **CSS-Context-Split**: `layout.css` 861→368 Zeilen; Sektionen zu **`sidebar.css`** (385 Z.: Sidebar, Custom Inputs, Autocomplete, Comment-Format, Utilities, Adressbuch/Geoapify/Guides) und **`signature.css`** (111 Z.: UI-States + WYSIWYG-Editor) ausgegliedert. Reine Verschiebung ohne Selektoränderung; Link-Reihenfolge in index.html = alte Source-Order. Zielkorridor ~300-400 Zeilen/Datei (Kontextkosten pro Lesedurchgang). ADR-CSS §3 auf 8 Dateien aktualisiert.
6. **sibling-count()-Trap (Empirie schlägt Baseline-Datum)**: api.webstatus.dev meldet `sibling-count()` als „newly" 2026-08-18 — aber `CSS.supports('width','sibling-count()')` ist in Chrome 151 `false` (low_date = letzte der 3 Engines, Chrome fehlt noch). Umsetzung wurde live getestet, Pill-Width brach (0px) → sofort revertiert; die 4 toten Button-Varianten-Regeln blieben draußen.
7. **Baseline-Quellen maschinenlesbar aufgenommen** (ROADMAP → Verweise): `api.webstatus.dev/v1/features` (Query-DSL `baseline_status:newly`, `low_date`/`high_date`), OpenAPI-Spec (GoogleChrome/webstatus.dev), npm `web-features`, Community-MCP-Server (jlacher/Technickel-Dev/yamanoku) + Chrome-Labs-Beispiel. Bewertung: MCP-Server für dieses Projekt nicht nötig — API ist per curl abfragbar; sinnvoller wäre später ein Fitness-Gate-Probe.

**Grund:** Kontextkosten pro Lesedurchgang sind der treibende Faktor (KI-Agenten + Wartung): Zielfenster ~300-400 Zeilen pro CSS-Datei, Ausreißer splitten an Single-Responsibility-Schnitten. Baseline-Daten DIREKT aus der maschinenlesbaren Quelle verifizieren statt Blog-Digesten vertrauen — `newly`-Datum ≠ Chrome-Support (Punkt 6).

**Quelle:** api.webstatus.dev/v1/features (live gequeried: contrast-color 04/2026, sibling-count 08/2026, field-sizing 06/2026, :active-view-transition 01/2026, @function **limited**!), web.dev/articles/web-platform-dashboard-baseline, Context7 `/websites/modern-css` (@function: Chrome 139+, nicht Baseline; contrast-color-Beispiele). Live-Tests: cdp-eval/cdp-errors (Chrome 151), Fitness Gate 100 %, alle Regressionen grün (Pills 111,5/74,3px, sig-box grab, din-anlagen none, base-select, 8 Stylesheets geladen, KEINE FEHLER).

**Status:** Umgesetzt — Fitness Gate 100 %.

**Offener Punkt:** (1) `@function` (Chrome 139+, webstatus: **limited**) als Kandidat für das 28× `calc(X / var(--din-width) * 100cqh)`-Dedup in sheet.css — fällt durch den Baseline-Filter, nur mit ADR/Decision umsetzen. (2) sibling-count() nach Chrome-Shipping erneut prüfen (Probe ins Gate denkbar). (3) `:open`/Container style queries bleiben Backlog (kein aktueller Use-Case). Generalisierbarkeit: „Baseline-low_date = letzte Engine, nicht Chrome; immer `CSS.supports()`-Empirie gegen die eigene Mindestversion" + „Datei-Zielkorridor als Kontextkosten-Metrik" übertragbar in `llm_boilerplate`.

---

## 2026-09-10 — Session-Batch: VT-Abort-Fix, Toast-Policy, Chrome 150+-Baseline, Zero-Inline-JS

**Agent:** opencode-glm
**ADR-Betroffen:** [[ADR-CSS]], [[ADR-JS]]

### 1. `InvalidStateError` an allen `startViewTransition`-Sites abgefangen
Aborts der VT-Promises (z. B. durch Mid-Flight-Navigation/Reload) erzeugten „Uncaught (in promise)"-Exceptions. Fix: `.finished.catch(() => {})` an allen 4 Sites (02-settings-manager.js ×3, 45-address-intelligence.js ×1). Ursachenanalyse: 3 VTs feuerten beim Boot (Root, Font-Chip, PLZ-Popover) — Boot-VTs crossfaden ins Leere und wurden beim Reload abortet.
**Fix 2 (Root Cause):** Boot-VTs unterdrückt statt nur gefangen — Root-VT via `#themeBooted`-Flag (erstes `applyTheme` ist Initial-Apply, kein Crossfade), Chip-/Popover-VT via bestehende `isReady`-Guards. Live verifiziert: 0 EXC bei Navigate+Reload (cdp-vt-trace.js), echte Theme-/Form-Wechsel animieren weiterhin korrekt (root VT ×1 bei Toggle, sheet VT ×1 bei Formwechsel, root VT 0).

### 2. Toast-Policy: nur Fehler, Warnungen, fehlende User-Guidance
Theme-Toast („Darstellung: …" incl. toastNames-Map), PRINT_PENDING, FONT_UPLOAD_SUCCESS, „Eigene Schrift entfernt", „Theme-Werte kopiert", KI-aktiviert/-deaktiviert/-Progress/„erfolgreich formalisiert" entfernt. 11 Call-Sites verbleiben (3 ai-assistant Guidance, 6 settings Errors, 2 salutation nur bei `blur`). Tote Constants (PROFILE_SAVED, DRAFT_SAVED, PAGE_ADDED, RESET_SUCCESS, ADDRESS_SUCCESS, INTL_MODE_ON, PAGE_LIMIT_REACHED + ZIP_INVALID, RECIPIENT_LIMIT, SUBJECT_LIMIT, PAGE_OVERFLOW, ADDRESS_ERROR) aus `51-storage.js` gelöscht; toter CSS-Block `.input-feedback-msg` (34 Z., floating.css) entfernt. Live: Theme-Toggle → kein Toast (toast-v4 bleibt geschlossen).

### 3. Browser-Baseline auf Chrome 150+ spezialisiert (User-Entscheid)
Keine Multi-Browser-Matrix, kein `baseline-browser-mapping` (npm-Paket abgelehnt). Single Source of Truth: `docs/00-foundation/longevity-guidelines.md` („Einzige projektweite Baseline: Chrome 150+" + Chrome-only-Klausel). Mirrors aktualisiert: Immutable-Law-Catalog.md, AGENTS.md, constitution.md, README (Foundation). Konsequenz: Chrome-only-Features (z. B. `@function`, 139+) sind ab 150 prinzipiell im Baseline-Fenster; Empirie bleibt per `CSS.supports()`-Live-Test (sibling-count-Lesson bleibt bindend).

### 4. Zero-Inline-CSS/JS durchgesetzt — HTML ist jetzt script-src-only
Audit-Fund: 2 Inline-`<script>`-Blöcke in index.html (Z. 27 FOUC-Theme/Font-Boot, Z. 271 Draft/Radio/Theme/PV-Restore, ~86 Z.). Extrahiert in `js/boot-theme.js` (head, blockierend — Module sind deferred und kämen zu spät) und `js/boot-state.js` (Ende body, blockierend an Parse-Position — Draft-Restore muss VOR den ES-Modules laufen). Code 1:1 übernommen (surgical), JSDoc-Types ergänzt (Gate-Forderung). `style.setProperty('--var', …)`-Writes (02-settings `--theme-dim`, 42-signature `--x/--y/--scale/--rot`, 31-format-toolbar `--sel-x/--sel-y`) bleiben: etabliertes Pattern „JS feedet Daten, CSS konsumiert".
**Fix im selben Zug (Inline-CSS-Ausräumung):** ai-assistant.js 4× `style.display` → `classList.toggle('hidden')` (`.hidden { display:none !important; }`); Phantomklasse `.opacity-50` (nirgends definiert!) → CSS `sidebar.css`: `.sidebar-switch-row:has(input:disabled) { opacity: 0.5; }`; 02-settings 2× `style.colorScheme` gelöscht (variables.css hat komplette `[data-theme]`-color-scheme-Regeln); 31-format-toolbar `style.top/left` → `--sel-y/--sel-x` Custom Props + `#selection-anchor { top: var(--sel-y, auto); left: var(--sel-x, auto); }`.

### Verifikation
Fitness Gate 100 % (pre/post). Live (Chrome 151, frischer Tab): KEINE FEHLER bei Load, Theme-Toggle → root VT ×1 + kein Toast, Form A/B → sheet VT ×1 + root VT 0, Selektion → `--sel-x/--sel-y` gesetzt + Toolbar `:popover-open` (Anchor-Positioning via CSS), Draft-Restore (121 Z. Brieftext), Radio-Sync (layout form-a), `din-custom-font-style` nur bei gespeicherter Font, 4 externe Scripts, 0 inline.

**Generalisierbarkeit (llm_boilerplate):** (1) „Boot-VTs unterdrücken (isReady-Flag), nicht nur `.finished.catch`" — jedes VT-Feature braucht einen Boot-Guard. (2) „FOUC-/Restore-Boot-Code als externe blockierende Classic-Scripts statt Inline" — Zero-Inline-Policy kompatibel mit Timing-Anforderungen. (3) `:has(input:disabled)` statt JS-Styling-Opacity. (4) Chrome-only-Spezialisierung als alternative Longevity-Strategie zur Multi-Browser-Matrix.

**Quelle:** Context7 `/websites/modern-css` (View Transitions API: `.finished` Reject-Verhalten bei Abort); Live-Tests cdp-vt-trace.js/cdp-errors.js/cdp-eval.js (Chrome 151), Fitness Gate 100 %.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — README-Überarbeitung mit SVG-Header

**Kontext:** Haupt-README.md war inhaltlich veraltet (kein Wort zu CSS-Split, Zero-Inline-JS, Chrome-150+-Baseline, Linux-Workflow) und ohne Logo.

**Entscheidung:** README neu strukturiert — zentrierter Header mit `envelope.svg` (das im Repo liegende, eigens erstellte Twemoji-Umschlag-SVG als Identitätsträger), Quick Start getrennt nach Nutzer (start.bat) und Entwickler/Agent (`node tools/build_db.js` als Linux-Einstieg), neue Sektionen „Technologie-Stand 2026-09" (Tabelle: Chrome 150+, 8 CSS-Dateien, Classic-Boot-Scripts, OKLCH, localStorage) und „Verifikation statt Hoffnung". Bestehende Sektionen (Philosophie, Doku-Landkarte, Agenten-Infrastruktur, Light/Full Mode) inhaltlich erhalten, Text gestrafft.

**Generalisierbarkeit:** README-Pattern „SVG-Header + Nutzer/Agent-Split + Tech-Stand-Tabelle" ist direkt auf die `llm_boilerplate` übertragbar — Tech-Stand-Tabelle zwingt Maintainer, die Baseline im Kopf zu dokumentieren statt im Changelog zu verstecken.

**Quelle:** Kein externer Nachschlag nötig (reine Dokumentationsarbeit); Fitness Gate 100 % (pre + post).

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Sanitizing-Konsolidierung: eine Sicherheitsgrenze für Rich-Text

**Kontext:** Rich-Text hatte drei unterschiedlich strenge Pfade (setHTML mit Allowlist, ungefilterter DOMParser-Fallback in DraftManager, völlig ungesanitisierter DOMParser in boot-state.js). External Review bemerkte die inkonsistente Sicherheitsgrenze.

**Empirie (Chrome 151, live getestet):** `setHTML()` existiert und sanitiert, aber mit eigener `elements`-Allowlist werden **alle Attribute verworfen** (alle drei Spec-Formen von `attributes` getestet: Objekt-Map, per-Element-Entry, flaches Array — plus `new Sanitizer(...)`), inkl. `class` für `din-comment`. Default-Sanitizer behält `class`, aber auch zu viele Elemente (`<i>`, `<em>` überleben). Context7/BCD bestätigt nur Verfügbarkeit, nicht das Config-Verhalten.

**Entscheidung:** Der DOMParser-Walk mit exakter Allowlist (b/strong/u/s/blockquote + span.din-comment) ist ab jetzt **die einzige** Rich-Text-Sicherheitsgrenze — in `01-draft-manager.js` (#sanitizeRichText) und `31-format-toolbar.js` (Paste). `boot-state.js` (Boot-Quick-Restore vor den Modulen) nutzt `setHTML()` mit **Default**-Sanitizer: streng genug gegen Skripte, `class`-safe, null Config — der DraftManager übernimmt direkt danach mit der exakten Allowlist. Der setHTML-Dual-Path mit Verfügbarkeits-Check ist gelöscht (Baseline Chrome 150+).

**Verifikation:** Injektionstest im echten Chrome: `<b>` bleibt, `<em>` wird zu Text entkleidet, `<span class="din-comment">` bleibt inkl. class, Plain-Felder werden via `textContent` escaped. Fitness Gate 100 % (pre + post).

**Generalisierbarkeit:** „Live-Empirie schlägt Sanitizer-API-Doku" — API-Verfügbarkeit ≠ API-Fähigkeit; für die `llm_boilerplate`: immer eine Sanitizing-Funktion als Source of Truth, keine Verfügbarkeits-Branches bei fixer Browser-Baseline.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Tools-Entschlackung: archive/ + Obsidian-Tools geloescht

**Kontext:** Externer Code-Review empfahl Dependency-Check fuer tools/. Verifiziert: `tools/archive/` (10 Dateien), `tools/add_wikilinks.py`, `tools/build_canvas.js` haben keine Referenzen in `start.ps1`, `reconciliation.js`, `build_db.js` oder `repository.yaml` (ausser Doku-Erwaehnungen). Bewusst NICHT geloescht: `build_db.py` (gecachter Pipeline-Step + autoritativer Function-Traceability-Matrix-Generator) und `log_session.js` (bindende Protokollierungspflicht, AGENTS.md Paragraph 8) — der Reviewer kannte den Governance-Contract nicht und hatte beide als Loeschkandidaten gefuehrt.

**Entscheidung:** Loeschung von `tools/archive/` (Git-History haelt die historischen Migrationsskripte), `add_wikilinks.py` (Obsidian-Wikilink-Migration, einmalig abgeschlossen) und `build_canvas.js` (Obsidian-Canvas-Generator, nicht in Pipeline verankert). Stale-Referenzen bereinigt in: `CLAUDE.md` (Tool-Liste, Archiv-Block), `repository.yaml` (subpath), `docs/30-meta/tooling-overview.md` (Inventur Lauf 3: Abschnitte entfernt, Frontmatter aktualisiert), `docs/30-meta/OBSIDIAN-SETUP-GUIDE.md` (Kapitel 5 entfernt, 6-8 renumeriert, code_links), `docs/implementation_and_meta_inventory.json` (Snapshot konsistent gezogen).

**Verifikation:** Fitness Gate 100 % (Metadata/Coherence/Conformance/Features). Grep-Verifikation: keine Referenzen mehr auf geloeschte Pfade in aktiven Konfig-/Gate-Dateien.

**Generalisierbarkeit:** „Safe-to-delete-Hierarchie": 1) Archivverzeichnisse immer via Git-History statt Ordner im Tree; 2) Governance-Tools (`log_session`, Traceability-Generator) sind NICHT loeschbar, auch wenn sie wie Einmalskripte wirken; 3) beim Loeschen von Tools immer die fuenf Referenzorte pruefen: Startskript, Reconciliation-Regeln, repository.yaml, Inventur-Doku, code_links-Frontmatter.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Präsentations-Strings von JS in CSS verschoben (Economy-Layer)

**Kontext:** Externer Review fand feste Zustands-Strings (Theme-Label, Font-Chip) doppelt in `boot-state.js` und `02-settings-manager.js`, obwohl die Elemente bereits rein per CSS gerendert werden (`content: attr(data-ui)` bzw. `::before`). Falscher Layer plus doppelt gepflegte Dictionaries.

**Entscheidung:** Sichtbare Labels rendern jetzt ausschließlich CSS (`floating.css`): `#btn-theme-toggle[data-appearance=…]::before`, `#btn-font-action[data-font-mode=…]::before`, `#font-status-label::before` mit `body.font-custom-active`-Variante. JS setzt nur noch den Zustand (`data-appearance`, `data-font-mode`, `body.font-custom-active`); `data-ui` und die Label-Dictionaries entfallen aus beiden JS-Dateien und aus `index.html`. `title`/`aria-label` bleiben bewusst in JS (CSS kann keine echten a11y-Attribute setzen); die `titles`-Dictionaries verbleiben in beiden Dateien, weil `boot-state.js` vor den Modulen laufen muss.

**Verifikation:** Fitness Gate 100 %. Live im echten Chrome (frischer Tab, echte CDP-Maus-Events): Theme-Cycle light→dark mit korrektem Label/Titel, alle drei `data-appearance`-Zustände (`🌓 Auto`, `☀️ Hell`, `🌙 Dunkel`), Font-Chip reagiert sofort auf `body.font-custom-active`, Font-Button zeigt upload/reset-Labels korrekt. Test-Theme-Setting auf light zurückgesetzt.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Zustandsabhängige Festtexte gehören in CSS-Selektoren über Zustandsattribute/-klassen, nicht in JS-Dictionaries; JS schreibt nur den Zustand. Eine Regel: „Wenn der Text bereits per `content: attr()` gerendert wird, gehört auch die Zustandszuordnung ins CSS."

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Boot-Path-Shrink: boot-state.js hört auf, boot-theme.js zu kopieren

**Kontext:** Full-Mode-Spec `specs/2026-09-10-boot-path-shrink/` (A1). `boot-state.js` Z. 40–47 setzte `html/body data-theme` + `colorScheme` neu, obwohl `boot-theme.js` (Head, blockierend) als einziger Owner dieser Attribute etabliert ist — doppelter Schreibzugriff auf denselben Zustand direkt nach dem Boot.

**Analyse (Owner-Regel):** CSS deckt `body` komplett über `[data-theme="…"] body`-Descendant-Selektoren ab (`variables.css`), `color-scheme` erbt von `html`. Live-Probe bestätigt: die CSS-Kaskade löst über das html-Attribut allein auf. Die `body[data-theme]`-Tripel-Selektoren wurden bewusst NICHT angefasst (Churn ohne Nutzen).

**Entscheidung:** Block Z. 40–47 entfernt; Header-Kommentar aktualisiert („boot-theme.js ist Owner"). Radios, Draft-Quick-Restore, PV, Font-Klasse und Theme-Button-Block (`data-appearance` + title/aria) bleiben — das ist boot-state.js' eigener Zustand.

**Verifikation:** Fitness Gate 100 %. Frischer Tab, echte CDP-Maus-Events: `htmlTheme: light, bootLabel: "☀️ Hell", title: "Darstellung: Helles Design", bodyColorScheme: light` — alle Boot-States korrekt.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Jeder persistierte State braucht genau einen Boot-Owner; Kopier-Schreibzugriffe in Folge-Modulen sind Drift-Quellen. Regel: „Boot-Modul schreibt, Feature-Module lesen/ändern — nie beides doppelt beim Boot."

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — anchor-scope geprüft und vertagt (Segmented Controls)

**Kontext:** Full-Mode-Spec A2: Prüfung, ob `anchor-scope` (Chrome 131+) die Popover-Anker der Radio-Segmented-Controls vereinfacht.

**Empirie (caniuse + CSSWG-Spec, live):** Support Chrome 131+ → im 150+-Baseline ✓. Aber: (1) Anchor-Wechsel wird NICHT interpoliert — die 0.3s-Slide-Animation des Pills (Kern-UX der Controls) ginge verloren, `anchor-scope` springt hart. (2) Die Radio-Inputs sind `.sr-only` (1×1px, `layout.css` ~Z. 233) — der Anker müsste auf `input:checked + label` umziehen. (3) Das „unbegrenzte Optionen"-Motiv greift nicht: feste 2–3 Optionen.

**Entscheidung:** Vertagt. `anchor-scope` bietet hier keinen echten Gewinn gegenüber der bestehenden `:has()`-Positionslösung.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Bleeding-Edge-Funktion erst dann übernehmen, wenn sie ein konkretes Problem löst, das die bestehende Lösung nicht schon löst — „Baseline-tauglich" ist kein Übernahmegrund allein.

**Status:** Geprüft, bewusst nicht umgesetzt.

## 2026-09-10 — Theme-Transition: 0.6s + Klickbarkeit via Root-Opt-Out

**Kontext:** UX-Feedback: Theme-View-Transition dauerte 2s (`layout.css` „2-SECOND …") und der Theme-Button war währenddessen nicht klickbar. Anforderung: max 1s und klickbar während des Transitions.

**Empirie (Chrome 151, echte CDP-Maus-Events + Web-Recherche Bramus 2025-01-29 / CSSWG #11596 / MDN 2026-07-08):** (1) `pointer-events: none` auf `::view-transition` lässt Klicks zwar durchs Overlay fallen, ABER: solange `:root` am Transition teilnimmt, landet der Hit-Test empirisch auf `<html>` statt auf dem Button — bei Root-Capture überdeckt der Snapshot die ganze Seite. (2) Beweis nach dem Fix: Doppelklick 250ms auseinander → `["btn-theme-toggle","btn-theme-toggle"]`, VT aktiv, Theme zweimal weitgeschaltet (dark→auto→light). (3) Element-scoped VTs (Popover/Sheet/Chip) sind von `view-transition-name: none` unabhängig — ihr Pseudo-Baum sitzt im Element selbst (MDN).

**Entscheidung:** `animation-duration: 0.6s` (statt 2s); `:root { view-transition-name: none; }` (Root aus dem document-scoped Snapshot raus → Sidebar bleibt live-klickbar); `#viewport { view-transition-name: brief-viewport; }` crossfaded 0.6s; `::view-transition { pointer-events: none; }`. Sidebar/Body wechseln instant, der Brief-Bereich faded — bewusster Trade zugunsten der Klickbarkeit.

**Verifikation:** Fitness Gate 100 % (pre + post). Live: Doppelklick während aktiver Transition registriert beide Klicks; VT-Dauer ~639ms gemessen; Hilfslinien-Switch nach HTML-Umzug (in „DIN-Brief Layout", unter dem Form A/B-Segmented-Control) funktional und positionell verifiziert.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Document-scoped View Transitions frieren Hit-Testing des gesamten Root-Subtrees ein — `pointer-events: none` allein reicht nicht. Pattern: Root-Opt-Out + nur Inhaltsbereich benennen, wenn während des Transitions Interaktivität gewünscht ist.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Build-Stand: toter Button zu nicht-interaktivem Datum-Stempel

**Kontext:** `#btn-dev-mode` war ein `<button>` ohne einen einzigen JS-Listener — es zeigte nur ein hartkodiertes, veraltetes Datum („04.09.2026") via `data-ui`-CSS und behauptete fälschlich „Developer Mode aktivieren".

**Entscheidung:** Zu nicht-interaktivem `<span id="sidebar-build-date">` („Stand: DD.MM.YYYY") umgebaut. Kein Runtime-Fetch zur GitHub-API (A38-Allowlist) — stattdessen stampft der Deploy-Workflow (deploy.yml, Schritt nach Checkout) das echte Commit-Datum (`git log -1 --format='%cd'`) per sed in `data-ui`. Auf GitHub Pages immer aktuell; lokaler Stand zeigt das kommittierte Datum als Fallback.

**Verifikation:** Fitness Gate 100 %. Live: `<span>`, kein Button mehr, rendert „Stand: 10.09.2026".

**Generalisierbarkeit:** Für die `llm_boilerplate`: Version/Build-Stand gehört in die Deploy-Pipeline (Build-Time-Stamping), nicht in Runtime-Fetches (Offline-Regel) und nicht in hartkodierte Strings, die garantierter Drift unterliegen.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Postvermerk: 100% contenteditable (Doktrin-Verletzung behoben)

**Kontext:** `#postvermerk` war das EINZIGE DIN-Feld ohne `contenteditable` — Doktrin „alle einzeiligen DIN-Felder nutzen contenteditable=plaintext-only" (03-ui-protections.js Guard-Kommentar) war verletzt. Historisch begründet als „reine Anzeige" (review_grok.md rot), was Owner-Entscheidung aufgehoben hat.

**Entscheidung:** (1) `contenteditable="plaintext-only" enterkeyhint="done"` am Feld. (2) Boot-Sync (`main.js` syncPostvermerkFromSidebar, `boot-state.js` applyPv) füllt nur noch, wenn das Feld leer ist — manuell getippter Draft-Text hat Vorrang. (3) Aktive Select-Wahl (input/change-Listener) überschreibt weiter — bewusste Vorlagen-Wahl. (4) Sichtbarkeits-Trigger `din-postvermerk:not(:empty)` ergänzt (layout.css + floating.css): Custom-Text bleibt sichtbar, selbst wenn der Select zurückgesetzt wird.

**Verifikation:** Fitness Gate 100 %. Live (echtes CDP-Tippen, Input.insertText): Feld editierbar, Custom-Text „ EinwurfEinschreiben" überlebt Reload (Draft-Restore + kein Boot-Clobber), bleibt nach Select-Clear sichtbar, aktive Select-Wahl überschreibt („Einschreiben Einwurf"). 2-Zeilen-Limit + Paste-Flattening greifen automatisch über die bestehende maxTwoLinesIds-Registrierung.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Sidebar-Steuerung und Papierfeld dürfen nie exklusiv-trennend designed werden („Select ist einziger Schreiber") — Feld immer 100% editierbar, Sidebar-Controls sind Vorlagen-/Komfort-Schreiber. Boot-Sync schreibt nur in leere Felder.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Externes Review verarbeitet: Lizenz, SECURITY, Templates, Unit-Tests

**Kontext:** Umfangreiches externes Review identifizierte fehlende Open-Source-Basics (Lizenz, SECURITY.md, Issue-Templates, Linux-Doku) und keine automatisierten Tests.

**Akzeptiert & umgesetzt:**
1. **MIT-Lizenz** (`LICENSE`) + README-Sektion.
2. **SECURITY.md** — Datenschutz-Modell dokumentiert, Private Vulnerability Reporting als Meldekanal, Scope (XSS-Sanitizing-Pfad, MCP-Allowlist) + Out-of-Scope (Browser-Bugs, `file://`).
3. **Issue-Templates** (bug_report.yml, feature_request.yml, config.yml mit Hinweis auf Chrome-150+-Baseline und Architektur-Doktrin; Security-Issues nur via Advisory).
4. **Zero-Dependency Test-Runner** (`test/`): eigener Mini-Runner (~80 Zeilen, `describe`/`it`/`assert` + DOM-Report), gebaut nach externem Brainstorm (Option B). 6 Tests gegen die ECHTE Sanitizing-Route (localStorage → loadDraft → #sanitizeRichText → DOM), Draft-Roundtrip, Undo/Redo. Priorität: `#sanitizeRichText` ist die einzige Sicherheitsinstanz für Rich-Text — XSS-Vektoren (`<script>`, `onerror`, nicht-Allowlist-Tags) werden hier festnagelt. Live im echten Chrome verifiziert: 6/6 bestanden.
5. **README**: Linux-Workflow ergänzt (`python3 -m http.server`).

**Bewusst abgelehnt (dokumentierte Design-Entscheidungen):**
- **PWA/Single-File-HTML-Distribution:** Single-File würde die modulare Struktur (8 CSS-Dateien, nummerierte JS-Module, Git-Diff-Nachvollziehbarkeit) opfern; eine dist-Bündelung per Build-Script wäre möglich, widerspricht aber dem „Keine Build-Tools"-Prinzip und ist für die Zielgruppe (technisch versiert) nicht nötig.
- **Firefox/Safari-Unterstützung:** Chrome 150+ ist dokumentierte Baseline; Feature-Detect-Fallback für andere Browser wird nicht gebaut — die App degradiert nicht, sie lädt gar nicht erst kompromittiert.
- **Unit-Test-Frameworks (Jest/Vitest/Mocha):** widersprechen Zero-Dependencies; der Eigenbau-Runner deckt den risikoreichsten Pfad ab, CDP-Live-Verifikation bleibt die Methodik für Integrations-/CSS-Regression.
- **Performance-Benchmarks:** Keine Messbarkeits-Pflicht; App lädt lokal ohne Netzwerk — die wichtigen Metriken (nur lokale Requests, kein Parsing von Framework-Runtime) sind strukturell gegeben.
- **No-Scroll-Doktrin, Sprachbarriere (deutsch), Reset-Dialog:** bewusste Produkt-/Doktrin-Entscheidungen.
- **Contribution Guidelines/Code of Conduct:** Ein-Personen-Projekt; Issue-Templates + SECURITY.md genügen für den aktuellen Scope.

**Generalisierbarkeit:** Für `llm_boilerplate`: „Test-Runner statt Test-Framework" — ein eigener ~80-Zeilen-Runner gegen die echte Produkt-Route (nicht gemockt) passt zur Zero-Dependency-Doktrin; SECURITY.md-Datenschutz-Abschnitt folgt dem Muster „lokal-only, Netzwerk-Ausnahmen explizit benennen".

## 2026-09-10 — Modern-CSS-Audit (modern-css.com, 111 Snippets) verarbeitet

**Kontext:** Externe KI-Gegenprüfung der modern-css.com-Snippets gegen den Code ergab ~35 Snippets bereits umgesetzt, ~13 Vorschläge. Eigenverifikation gegen den echten Code vor Umsetzung.

**Akzeptiert & umgesetzt (alle live verifiziert):**
1. **`safe center`** in `#viewport` (layout.css) — overflow-sicheres Zentrieren, No-Scroll-Doktrin abgesichert bei kleinem Viewport.
2. **`z-index`-Aufräumen** (floating.css ×3): `#format-toolbar`, `#address-suggestions`, `#plz-suggestions-popover` sind Popovers im Top-Layer — z-index war wirkungslos und widersprach dem bestehenden Guard-Kommentar im Dateikopf.
3. **`@media (prefers-reduced-motion: reduce)` Kill-Switch** (reset.css) — CSS-seitige A11y-Ergänzung zum JS-Check (der VTs skippt).
4. **`@media (forced-colors: active)` Guard** (sidebar.css) — **wichtigster Fund**: `.btn`/`.btn-ghost`/Switch verlieren im Windows High Contrast Mode sonst Hintergrund+Border → unsichtbar. Systemfarben (ButtonFace/ButtonText) als Standardausnahme zur OKLCH-Regel dokumentiert.
5. **`scrollbar-width: thin` + `scrollbar-color`** für `.autocomplete-dropdown` — dezente Scrollbar.
6. **Totes CSS gelöscht** (layout.css, ~65 Zeilen): `#local-address-dropdown`, `#postvermerk-dropdown`, `.address-suggestion-item`, `.pv-item` — die Elemente existieren **nirgends** (auch nicht dynamisch per JS); die Review-KI hatte sie übersehen und sogar "Popover-Umbau" empfohlen.

**Bewusst abgelehnt:**
- `scrollbar-gutter: stable`: No-op — `html { overflow: hidden }` (No-Scroll-Doktrin), es entsteht nie eine Scrollbar.
- `text-spacing-trim`: CJK-Interpunktions-Feature, für deutsche Typografie ohne Nutzen.
- `@supports`-Fallback für `column-rule-inset` (Gap Decorations): Chrome 150+ ist dokumentierte Baseline — Firefox/Safari-Fallbacks werden bewusst nicht gebaut.
- `content-visibility: auto` für Sidebar-Sektionen: Containment kann Anchor-Positionierung/Popover-Verhalten der Enkel-Knoten beeinträchtigen — Marginalgewinn, nicht die Risikowert.
- `interpolate-size`-"Height-Hack-Auflösung" am `#geoapify-key-container`: Existiert nicht — `height: auto` wird über das global gesetzte `interpolate-size: allow-keywords` bereits nativ animiert.
- `@container style()`, `:is()`-Umstellung, CSS Nesting, `reading-flow`: kosmetisch, kein funktioneller Gewinn.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Popover-Elementen gehören KEINE z-index-Werte (Top-Layer); (b) forced-colors-Guard gehört zum Standard-Reset jeder Button-führenden App; (c) `safe center` als Default für Full-Viewport-Zentrierung; (d) Externe Snippet-Audits vor Umsetzung immer gegen den echten Code verifizieren — die Review-KI verortete totes CSS als活 Code.

## 2026-09-10 — Postvermerk-Sichtbarkeit: Select ist Hauptschalter (Bugfix, Owner-Entscheidung)

**Kontext:** Der `:not(:empty)`-Zusatz aus dem Postvermerk-Batch (heute früh) sorgte dafür, dass das Feld nach „— kein —" im Select sichtbar blieb, sobald manueller Text drin stand. Owner-Korrektur: „kein" = Feld muss verschwinden, Punkt.

**Entscheidung:** Die `:not(:empty)`-Trigger in layout.css und floating.css entfernt. Sichtbarkeit strikt select-getrieben (`:root:has(#sidebar-pv-select option:checked:not([value=""]))`). Manuelles Editieren bleibt möglich — aber nur innerhalb der durch den Select bestimmten Sichtbarkeit. Boot-Sync-Empty-Guard unverändert (Draft-Text-Schutz bleibt; boot-state.js füllt nur leere Felder).

**Verifikation:** Fitness Gate 100 %. Live: Template wählen → Feld sichtbar; „— kein —" → `display: none` auch bei vorhandenem Text. Doktrin-Kommentar in index.html angepasst.

**Generalisierbarkeit:** Für `llm_boilerplate`: Sidebar-Control mit Template-Funktion darf nicht doppelt determiniert werden (Sichtbarkeit über Select, Inhalt über Field) — ein Schalter pro Aspekt.

## 2026-09-10 — Build-Stand-Span entfernt (Owner-Entscheidung, KISS)

**Kontext:** Der `#sidebar-build-date`-Span verursachte 2-Zeilen-Umbrüche in der Sidebar-Header-Row ("Dunkel" wanderte um). Owner: „vielleicht lassen wir das einfach komplett weg — wer sich dafür interessiert kann ja auch auf den GitHub-Link gehen".

**Entscheidung:** Die Entscheidung vom heutigen Vormittag (toter Dev-Mode-Button → Build-Stand-Span) zurückgenommen: Span gelöscht, Stamp-Step aus deploy.yml entfernt. Header-Row enthält jetzt nur noch GitHub-Link + Theme-Toggle. Das Commit-Datum ist über den GitHub-Link bzw. das Repo erreichbar — die Sidebar braucht es nicht.

**Verifikation:** Fitness Gate 100 %. Live: Span weg, Header-Row = 2 Kinder, Theme-Button einzeilig (19px).

**Generalisierbarkeit:** Für `llm_boilerplate`: Meta-Informationen (Build-Stand, Version) gehören nicht in knapp bemessene UI-Header — Genauigkeit schlägt Gimmick.

## 2026-09-10 — Signatur-Editor: individuelle Transform-Eigenschaften (translate/rotate/scale)

**Kontext:** Externer Brainstorm (angestoßen via webstatus.dev baseline-2026) zur Frage „Bild/Unterschrift — wie viel geht ohne JS?".

**Entscheidung:**
1. **Umgesetzt:** `42-signature.js applyTransform()` schreibt jetzt `style.translate/rotate/scale` direkt (Chrome 104, Baseline 2023) statt Custom-Props + kombinierte `transform`-Matrix in signature.css. Feste Spec-Reihenfolge (translate → rotate → scale), keine Matrix-Konkatenation, einzeln im DevTools-Inspector lesbar. Visuell identisch: Scale ist ein Skalar, uniform Scale kommutiert mit Rotation um denselben Origin — die Gesten-Mathe (getBoundingClientRect, centerX/centerY, Pointer-Capture) bleibt unangetastet.
2. **Guard-Kommentar** zur Verzerrungsfreiheit: scale als Skalar ist die Garantie (1:1, nie verzerren) — width/height würden das Seitenverhältnis brechen, bewusst nicht genutzt.
3. **Abgelehnt:** `@property`+Transitions für „sanftes Einrasten" — es existiert KEINE JS-Easing-Schleife, die man ersetzen könnte (Ersparnis der Review-KI war spekulativ). Eine Transition während der Geste würde am Pointer nachziehen (Print-Präzision!) — sie müsste auf Release gefiltert werden, also Komplexität für ein Feature, das keiner verlangt hat.

**Festhalten (Antwort auf die Kernfrage):** Drag/Rotate/Resize-Gesten **müssen JS bleiben** (Pointer Events, setPointerCapture) — CSS kann keine Gesten. CSS übernimmt die komplette Transform-Ausführung. Der JS-Anteil ist damit minimal und korrekt.

**Verifikation:** Fitness Gate 100 %. Live im Chrome: individuelle Eigenschaften angewandt und per getComputedStyle verifiziert (12px 8px / 45deg / 1.25). applyTransform-Route selbst wird erst mit geladener Unterschrift aktiv (in Testsession kein Bild) — Code-Pfad ist mechanisch (Property-Zuweisung derselben Werte).

**Generalisierbarkeit:** Für `llm_boilerplate`: `transform: translate(...) scale(...) rotate(...)` → individuelle Eigenschaften; nie transform-Kaskaden, wenn einzeln animierbar/debugbar sein soll.

## 2026-09-10 — UIProtections-Guard präzisiert: Enter-Block ist NICHT nativ (Empirie schlägt Overstatement)

**Kontext:** Externer Review-Claim: „Der Enter-Block für Single-Line-Felder ist doppelt gemoppelt — `plaintext-only` + `enterkeyhint="done"` verhindern Zeilenumbrüche nativ, ~15 Zeilen Ersparnis." Der eigene Guard-Kommentar in `03-ui-protections.js` überzeichnete genau das („unterbindet … Zeilenumbrüche NATIV").

**Recherche + Empirie (Chrome 151, CDP trusted Input):**
- `enterkeyhint="done"` ist **nur ein Tastatur-Label** (virtuelle Tastatur), kein Verhalten.
- Chromium `plaintext-only` blockt Umbrüche NICHT — es wandelt sie in **LF-Zeichen (`\n`) statt `<br>`/`<div>`** um (Chromium quirk: force `white-space: pre-wrap`, Quellen: w3c/editing#419, whatwg/html#11350, mdn/browser-compat-data#26719). Live-Probe: `insertText "\n"` → textContent `abc\ndef`, kein break-Element.
- CDP kann realen Tastatur-Enter nicht emulieren (auch im `contenteditable=true`-Control kein Insert) — der Online-Konsens deckt das Verhalten trotzdem eindeutig ab.

**Entscheidung:** Ablehnung der ~15-Zeilen-Ersparnis (falsche Prämisse). `enforceLineLimits` (keydown-preventDefault + Paste-Flattening) bleibt die tatsächliche Umbruchs-Sperre. Nur der Guard-Kommentar präzisiert (0 Code-Änderung): Rich-Text nativ blockiert — Umbrüche nicht; Verweis auf den vergeblichen Entfernungsversuch, damit zukünftige KIs den Overstatement nicht erneut „korrigieren".

**Verifikation:** Fitness Gate 100 %. Kein Verhaltensunterschied (Kommentar-only).

**Generalisierbarkeit:** Für `llm_boilerplate`: Guard-Kommentare müssen exakt zwischen „nativ verhindert" und „nativ umgeformt" unterscheiden — ein überzeichnetes Guard-Statement erzeugt kontraproduktive „Entdoppelungs"-Vorschläge. Empirie (CDP-Probe) schlägt Annahme in beiden Richtungen.

## 2026-09-10 — Batch A: toter Code entfernt (externer Audit, gegen echten Code verifiziert)

**Kontext:** Externer Zeilen-für-Zeilen-Audit aller 18 JS-Module meldete ~107 Zeilen toten Code. Jede Behauptung wurde vor der Löschung einzeln gegen den Code verifiziert (drei Funde bestätigt, keine Widerrufe). Geoapify bleibt bewusst unverkabelt (Owner-Entscheidung) — nur `highlightMatch()` als toter Funktionskörper entfernt, Modullogik unangetastet.

**Entfernt (verifiziert tot):**
1. `02-settings-manager.js` (~60 Zeilen): `btnCopyThemeTokens`-Listener, `themeDimmer`/`themeDimmerValue` + `applyThemeDim()` + Aufruf in `applyTheme`, `btnGuidesOn`/`btnGuidesOff`-Radio-Fallback (3 Stellen), `this.shell` (nur Zuweisung). Alles gegen im HTML nicht existierende IDs.
2. `variables.css`: `@property --theme-dim` + Transition-Referenz + Initial — **kein** `var(--theme-dim)`-Leser im gesamten CSS/HTML (Zombie-Kette: Storage-Default → applyThemeDim → setProperty → @property, gelesen von niemandem).
3. `51-storage.js`: `themeDim: 0`-Default; `SCHEMA_VERSION`, `STORAGE.*` (5 Keys), `LIMITS.API_DEBOUNCE_MS`/`MAX_PAGES` — alle ohne Referenz. Dateikopf-Kommentar angepasst (behauptete fälschlich, StorageManager konsumiere die Konstanten; er nutzt Magic-Strings — `boot-theme`/`boot-state` sind klassische Skripte und können nicht importieren).
4. `43-geoapify.js`: `highlightMatch()` (definiert, nie aufgerufen).
5. `32-toast.js`: `update()`-Methode + `updateToast`-Export (importiert wird nur `showToast, initToastSystem`).
6. `sidebar.css`/`floating.css`: unerreichbare `:has(#btn-guides-on/:off:checked)`-Fallback-Selektoren (~6 Zeilen) — begingen dieselbe Zombie-Referenz wie das gelöschte JS.
7. `test/all.js`: `Constants.STORAGE.DRAFT_CURRENT` → Literal `'din_draft_current'` (Test war einziger Konstanten-Konsument).

**Abgelehnt/verschoben (strukturell, braucht Owner-Entscheid):** Toast-Queue/Pause-Resume, Sanitizer-Zentralisierung, boot-state-Draft-Restore (FOUC-Risiko), Popover-Duplikate 43/45, `53-metadata` Temporal-Doppelnutzung — alles bewusst NICHT angefasst.

**Verifikation:** Fitness Gate 100 % (erster Lauf 99,87 % durch den Test-Konstanten-Referenz, behoben). Live (CDP, frischer Tab, cache-disabled, kein Konsolenfehler): Theme-Toggle zyklisch + persistiert, Guides-Switch per **echtem** Mausklick (Input.dispatchMouseEvent) → opacity 0/0.55 + persistiert, `--theme-dim` aus computed style verschwunden. Stale `themeDim`-Key aus alter Settings-Storage bereinigt. Lektion: synthetische `.click()`-Evals auf `switch`-Inputs sind unzuverlässig (togglen teils gar nicht) — nur trusted Input zählt.

**Generalisierbarkeit:** Für `llm_boilerplate`: Toter-Code-Audits vor Umsetzung gegen den echten Code verifizieren (der Audit lag bei ~107 Zeilen, real ~120 inkl. CSS-Zombies + Test-Fix); CSS-`:has()`-Fallbacks auf nicht-existente Elemente sind eine eigene Zombie-Kategorie, die beim JS-Räumen leicht vergessen wird.

## 2026-09-10 — Temporal-Doppel aufgelöst: „heute" lebt in genau einem Modul

**Kontext:** `47-date-format.js` (Briefdatum) nutzte `zonedDateTimeISO('Europe/Berlin')`, `53-metadata.js` (PDF-Dateiname/Keywords) nutzte `plainDateISO()` — UTC-basiert. Zwischen 00:00 und ~02:00 deutscher Zeit wäre der Dateiname auf den Vortag gefallen (Briefdatum ≠ Dateiname). User-Frage „kann das nicht direkt ins HTML?": Nein — das Datum muss bei jedem Boot „heute" sein; HTML/CSS haben keine native „aktuelles Datum"-Funktion, und `#datum` bleibt contenteditable (User-Override + Neusetzung nach Draft-Load). Ein JS-Boot-Aufruf ist das Minimum.

**Entscheidung:** Single Source of Truth — `47-date-format.js` exportiert zusätzlich `currentISODate()` (`Temporal.Now.zonedDateTimeISO('Europe/Berlin').toPlainDate().toString()`, mit Guard-Kommentar gegen den UTC-Fehlschluss). `53-metadata.js` importiert es; eigener `Temporal`-Zugriff dort entfernt. `formatLetterDate()` unangetastet (unterschiedliche Rückgabetypen/Formate: DIN 5008 vs. ISO — bewusst NICHT zu einer Funktion verschmolzen).

**Verifikation (CDP, Chrome 151):** 1) Deterministischer Nacht-Beweis mit festem Instant `2026-09-02T23:30:00Z` (= 00:30 Berlin): `.toZonedDateTimeISO('Europe/Berlin').toPlainDate()` → `2026-09-03`, UTC → `2026-09-02` — `.toPlainDate()` honored die Zone. 2) `Emulation.setTimezoneOverride` auf UTC: `currentISODate()` → `2026-09-10` (systemzonenunabhängig), `formatLetterDate()` → „10. September 2026". Fitness Gate 100 %.

**Generalisierbarkeit:** Für `llm_boilerplate`: „Heute"-Ableitungen gehören in genau ein Modul; `Temporal.Now.plainDateISO()` ohne explizite Zone ist eine Falle (UTC), `zonedDateTimeISO(<Zone>)` + `.toPlainDate()` ist das korrekte Muster. Zwei Formate (Anzeige vs. maschinenlesbar) = zwei klar benannte Exports, keine konfigurierbare Zusammensetzung.

## 2026-09-10 — Postvermerk-Review geprüft und abgelehnt: R3 widerspricht der Select-Doktrin

**Kontext:** Externe Logik-Analyse präsentierte fünf Regeln (R1 Default-unsichtbar, R2 Select füllt+sichtbar, R3 „leer+Blur → unsichtbar", R4 „— kein —" blendet aus, R5 Select überschreibt manuellen Text) und empfahl Umbau auf Zustandsklasse `.has-postvermerk` + ~25 Zeilen Blur-JS. Behauptungen gegen den echten Code verifiziert:

1. **Zitiertes CSS existiert nicht:** `din-postvermerk:not(:empty)` wurde bereits 2026-09-08 entfernt (Commit df30c58, Owner-Korrektur „Feld strikt vom Select gesteuert"). Sichtbarkeit ist heute rein `:root:has(#sidebar-pv-select option:checked:not([value=""]))` (layout.css:40, floating.css:404). Die zentrale Prämisse („:not(:empty) macht R3 unmöglich") trifft den IST-Zustand nicht.
2. **R5-Behauptung falsch:** „syncPostvermerkFromSidebar Empty-Guard widerspricht R5" — nein: `boot-state.js:70-75` registriert Listener mit `applyPv()` (Default `overwrite=true`) und überschreibt manuellen Text bei jeder aktiven Select-Wahl. Der Guard in `main.js:27` schützt ausschließlich den Draft-Restore (soll manuell getippten Text nicht vernichten — korrekt). R5 ist erfüllt.
3. **R1/R2/R4/R5 sind alle erfüllt** mit purem CSS (`:has()`) + minimalen Fills. Nur R3 ist nie implementiert gewesen — bewusst.

**Entscheidung (Owner):** IST-Zustand behalten. R3 erzeugt ein inkonsistentes Drei-Zustands-Grau (Select zeigt „Einschreiben", Feld ist weg) und steht im Widerspruch zur zwei Tage alten Select-Master-Doktrin. Zusätzlich widerspricht sich der Vorschlag selbst: seine Edge-Case-Tabelle fordert „Feld leeren + Klick → verschwindet", sein eigener Code (`hasSelectValue || hasText` + Blur-Bedingung `!sel.value`) lässt das Feld bei gewähltem Select sichtbar. Der Umbau (CSS `:has()` → JS-Zustandsklasse über 3 Dateien) verletzte Economy (HTML vor CSS vor JS).

**Gültiger Restbefund:** Die Select-Sync-Logik liegt funktional widerspruchsfrei, aber redundant in zwei Modulen (boot-state.js: R5-Overwrite + FOUC-Fill; main.js: Draft-Restore-Fill). Kein Bug, bewusste Trennung Boot/Rest-Verhalten — wird nur bei künftiger Änderung an dieser Logik konsolidiert.

**Abschluss (Owner, 2026-09-10): R3 endgültig gestrichen.** Das Regelwerk lautet final: **R1** (Default unsichtbar), **R2** (Select-Wahl → sichtbar + Text gesetzt), **R4** („— kein —" → unsichtbar), **R5** (aktive Select-Wahl überschreibt manuellen Text). Ein leer gelassenes, sichtbares Feld zeigt den Placeholder-Hint und bleibt solange bestehen, bis der Select auf „— kein —" gestellt wird. Kein Blur-abhängiges Ausblenden — der Select ist alleiniger Master der Sichtbarkeit (dokumentiert im HTML-Kommentar bei `#sidebar-pv-select`).

**Generalisierbarkeit:** Für `llm_boilerplate`: AI-Reviews müssen gegen den aktuellen Commit geprüft werden, nicht gegen zitierte Snippets — veraltete Prämisse invalidiert die gesamte Folgerungskette. Zustandsgetriebene Sichtbarkeit über `:has()`-Selektoren dokumentieren und in Reviews als bewusste Architektur verteidigen, nicht als „Fallback" abwerten.

## 2026-09-10 — Sanitizer-Dedup + Low-Risk-Räumen (ChatGPT-JS-Review, gegen echten Code verifiziert)

**Kontext:** ChatGPT-Vollüberblick über alle 18 JS-Module. Umsetzung nach Einzelverifikation: (1) duplizierter Rich-Text-Sanitizer aus `01-draft-manager.js`/`31-format-toolbar.js` (zeilenweise identisch: Allowlist B/STRONG/U/S/BLOCKQUOTE + `span.din-comment`) in neues Modul `04-sanitize.js` extrahiert — Verhalten unverändert (Unwrap statt Strip, bewusst); Numerik: 0x-Core-Layer, Konsum von 01 (Draft-Restore) und 31 (Paste/Drop). (2) `this.paper` (03, nur Zuweisung) entfernt. (3) Zombie-Defaults `recipientType`/`dateFormat`/`addressProvider` aus `51-storage.js` entfernt (null Leser/Writer). (4) `Constants.LIMITS.HISTORY_MAX_ITEMS` in 01 verdrahtet statt hartem `50` (Konstante nutzen statt löschen — zentrale Config-Doktrin).

**Widerlegte Claims:** `_updateDocumentTitle()` ist NICHT tot (Aufruf `01:58` im Save-Pfad, `document.title = Betreff` ist lebendes Feature); Geoapify-„Offline-Doctrine-Konflikt" ist die dokumentierte A38-Owner-Entscheidung (optionale Tier-2-Fach-API), kein Fund. Abgelehnt: AI-Addon-Writer-Fix (D) und Platform-Guard-Entfernung (F) — Owner-Entscheid steht aus.

**Verifikation:** Fitness Gate 100 % (vorher 99,87 %: JSDoc-Block mit `/*` statt `/**` — Annotationspflicht unter `// @ts-check`). Live (CDP, frischer Tab, cache-disabled): 0 Konsolenfehler; Unit-Import-Test von `sanitizeRichText`; echter Paste-Pfad via `ClipboardEvent` + `DataTransfer` (text/html): `img`/`onerror` gestrippt, `blockquote`/`u`/`span.din-comment` erhalten. −35 Zeilen netto (63/98).

**Generalisierbarkeit:** Für `llm_boilerplate`: gemeinsame Sicherheitsgrenzen (Sanitizer) gehören in genau ein numerisch niedriges Utility-Modul; `@ts-check` erfordert `/**`-JSDoc (nicht `/*`); Reviews von Modularchitekturen müssen A-Allowlist-Kontext (z. B. Geoapify/A38) kennen, sonst melden sie dokumentierte Entscheidungen als „Doctrine Conflict".

## 2026-09-10 — Grok-Website-Review: 5 Batches umgesetzt (alle Claims gegen Code verifiziert)

**Kontext:** Grok-Vollreview über `website/` (HTML/CSS/JS/data). Umgesetzt nach Einzelverifikation in 5 Commits:

1. **Trivial (09672ea):** Tote `:has(#btn-font-sans/:serif)`-Regeln (variables.css) entfernt; BOM aus 31-format-toolbar.js gestrippt; `@layer`-Duplikat in variables.css entfernt — dabei echter Fund: das File lädt via `layer="tokens"`, seine `@layer`-Zeile legte also **nested** Layers an, keine Top-Level-Ordnung (HTML-Inline-Statement bleibt einziger Owner); HTML-Guard `index.html:173` präzisiert (LF-Empirie: Umbrüche werden NICHT nativ geblockt, Keydown-Guard bleibt).
2. **C1+C2+C3+H1 (845b561):** Boot-Restore ohne `setHTML` — Rich-Felder (`brieftext`/`anlagen-text`) bewusst an DraftManager delegiert (04-sanitize), Rest als `textContent` (Draft speichert Nicht-Rich-Felder ohnehin als textContent); boot-theme injiziert Custom-Font nur bei `data:*/*;base64,<Base64>`-Regex (Charset-Check macht CSS-Injection unmöglich, Mime flexibel wg. readAsDataURL → application/octet-stream); Undo/Redo auf `din-a4` gescoped + Shift+Ctrl+Z = Redo (vorher fiel jedes z auf undo()); Theme-Default `'auto'` überall (51-storage war 'light').
3. **H2 (d229e81):** Geoapify-Key-Wipe nur bei HTTP 401/403 (vorher löschte jeder Non-Abort-Fehler den Key); 429/5xx/Netzwerk → Warn-Toast, Key bleibt. Target-Lock doku-konform: laut Geoapify-apidocs (Context7) ist `postcode:` kein Filter-Typ und mehrere `filter=`-Params überschreiben sich — Lock jetzt via dokumentiertem Pattern „Straße, PLZ Ort" im `text`-Param; Cache-Key lock-sensitiv.
4. **H3 (b26688f):** `plz-embedded.js` (164 KB) vom statischen Modulgraphen entfernt — Dynamic-Import nur im Fallback (file:// / fehlende .gz). Live: `plz-embedded.js` im Resource-Timing ABWESEND, PLZ-Engine lebt via .gz-Fetch (50667→Köln, 17 Bonn-PLZs).
5. **H5 (cacad61):** AI-Addon von obsoletem `window.ai.*` auf Chrome-Globals portiert (`'Rewriter' in self`, Enum available/downloadable/downloading; Quellen: Chromium chrome-ai-dev-preview-Mailingliste + 2026-Dokus). Toter `writerInstance` + Writer-Tracking entfernt — Capability-Meldung konsistent. `Rewriter`-Deklaration in webapi.d.ts. Live (Chrome 151 ohne Flag): kein Global → supported:false, 0 Exceptions.

**Abgelehnt/vertagt:** M2 (Anlagen-UL/LI-Parameterisierung — Strukturverlust real, aber kein Datenverlust; Design-Entscheid nötig), M1 (A11y — eigener Batch), H4 (CRP/CSS-Bündelung — localhost-fine, Pages-Sache), M4 (CSP — nach Font-Guard M4-Hürden reduziert, eigener Batch), M5/M6/M7 Details (sender-sync input-Kaskade, README-Formulierung, document.title). **Neuer Zombie-Fund:** `body.font-stack-sans/serif` (reset.css:37-41) werden von nichts gesetzt — Kandidat für nächste Räumung nach Owner-Bestätigung.

**Verifikation:** Fitness Gate 100 % nach jedem Batch; CDP-Live-Checks pro Batch (poisoned-font-Probe, Boot-Restore mit din-comment, Undo-Scope sidebar/sheet/shiftZ, PLZ-Resource-Timing, AI-Feature-Detect). Diag-Lektion: `defaultPrevented` in Capture-Phase messen liefert immer false — Bubble-Phase prüfen.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Boot-Skripte dürfen keine HTML-Restore-Logik duplizieren — ein Owner pro Datenpfad; (2) String-in-CSS-Injektion braucht Charset-Regex, keine Prefix-Whitelist (Mime variiert je OS); (3) fremde API-Filter-Params vor dem Bugfix gegen die Doku lesen — der Doku-Befund änderte den Fix-Ansatz komplett.

## 2026-09-11 — H2-Fixes live gegen echte Geoapify-API verifiziert (Owner-Key)

**Kontext:** Owner stellte den API-Key zur Verfügung; die H2-Fixes (Key-Wipe, Target-Lock) waren bisher nur Code-Review-verifiziert. Live-Tests in der echten App (CDP, echte UI-Flows) plus direkte API-Vergleiche:

1. **429-Verhalten (fetch-Stub):** Key überlebt, Warn-Toast „⚠️ vorübergehend nicht erreichbar (Status 429)" — alter Bug (Wipe bei jedem Fehler) behoben.
2. **401-Verhalten (echte API):** Key wird gewiped + Toast „❌ ungültig oder abgelaufen". (Erste Messung verpasste den Toast — Capture-Timing, MutationObserver-Rerun bestätigt.)
3. **Basis-Autocomplete:** echter Key liefert korrekte Bonn-Adressen (Adenauerallee → 53113/53111).
4. **Target-Lock (Text-Pattern „Straße, PLZ Ort"):** dreifach verifiziert — (a) „Am Hauptgericht, 53177 Bonn" → 53177 auf Platz 1 (ohne Kontext matcht die Straße GAR nicht); (b) „Hauptstraße, 10115 Berlin" → nur noch 10827 Berlin (5 Treffer identisch) statt deutschlandweiter Streuung; (c) Straße, die in der Ziel-PLZ nicht existiert (Bahnhofstraße/Bad Godesberg) → korrekter Fallback auf nächste gleiche-Stadt-PLZ (53123 Bonn), kein Lock-Fehler. `boundary.circle` wurde als Alternative getestet und verworfen (Kombination `|countrycode:de` liefert leere Sets, Syntax fragil).

**Verifikation:** Alle Tests gegen `https://api.geoapify.com` mit echtem Key; HTTP-Statuscodes direkt geprüft (200 mit echten Payloads, kein Rate-Limit). Key nach dem 401-Test im App-Storage wiederhergestellt.

**Generalisierbarkeit:** Für `llm_boilerplate`: Live-Tests gegen die echte API schlagen Code-Review-Verifikation — der Test FAND den echten Verhaltensnachweis für das Text-Pattern, das Review nur „dokumentiert plausibel" bewertet hatte. Test-Toasts mit MutationObserver observieren statt Endzustand lesen (Toast-Timing).

## 2026-09-11 — Grok-Re-Review: 4 Batches (Blocker-Fixes, CSP, a11y)

**Kontext:** Grok bestätigte alle bisherigen Fixes (C1-C3, H1-H3, Font-Doktrin, Geoapify) und meldete zwei unvollendete Stellen + einen Datenverlust. Umgesetzt nach Verifikation:

1. **H5-Finish (9ecbed6):** `init()` retournierte weiterhin beim obsoleten `window.ai`-Gate VOR `_checkAvailability()` — der Port war produktions-tot (eigener unvollständiger Port, Grok gefunden). Gate gelöscht, Feature-Detect nur `'Rewriter' in self`.
2. **M2-Datenverlust (9ecbed6):** REAL — Sanitizer flattete UL/LI, `ensureListStructure` behandelte Text-Nodes als leer (`children.length===0` ignoriert Text!) und wippte via `replaceChildren(li)`. Fix: (a) `sanitizeRichText(html, { extraTags: ['UL','LI'] })` nur für anlagen-text (keine Attribute); (b) wrap-don't-wipe: Text-Nodes werden zeilenweise in `<li>` gewickelt statt gelöscht; (c) 2 Unit-Tests (LI-Restore + Wrap-Pfad). `#placeCaretIn` extrahiert.
3. **Toast-Ruhe + Danger-Token (aa5ad62):** Success-Toasts (Key gültig / Adresse übernommen) entfernt — verletzen die eigene TOASTS-Policy; Toast-Node `role="status"`/`aria-live="polite"` statt assertiver Alerts; `var(--danger-color)` (undefined) → `var(--c-danger)`.
4. **Font-Guard-Politur (72e5431):** Regex erlaubt optional `;charset=`; `font-custom-active`-Klasse in boot-state an denselben Base64-Gate gekoppelt (kein AptosCustom-Wunsch ohne registrierte Font).
5. **CSP (2499072):** `<meta http-equiv="Content-Security-Policy">` ohne 'unsafe-inline'/'unsafe-eval'. Voraussetzungen geschaffen: (a) Inline-`<style>@layer</style>` → **non-layered** `css/layers.css` als erster Stylesheet-Link (variables.css-Lektion: layer-Attribut + @layer-Statement = nested Layers); (b) Boot-Font-Injektion via `new FontFace` statt konstruiertem `<style>`-String. Live: 0 CSP-Violations, Layers/Theme/Guides intakt, Geoapify-Fetch 200.
6. **a11y Top-3 (2499072 + df194e3):** data-ui-Text jetzt als echte Text-Nodes (20 single-line Elemente + GitHub-Link; AT- und Select-to-Copy-tauglich), CSS-`content: attr(data-ui)`-Regeln entfernt (dynamische Zustands-Strings data-appearance/data-font-mode bewusst im CSS belassen — aria-label vorhanden). Tastaturpfad: **natives Ctrl+B führt in contenteditable NICHT zu <b> (live verifiziert)** — daher scoped keydown auf #brieftext → toggleFormat('B'/'U'), kein document-Hijack (C3-Lektion).

**Verifikation:** Gate 100 % nach jedem Batch (inkl. 2 neuer M2-Tests). Live (CDP): CSP-Reload ohne Violations; Geoapify-Fetch unter CSP 200; Labels echt (8 h3s, Form A, GitHub, Print-Btn, ::before=none); Ctrl+B real-keystroke → `<b>Brief</b>`; M2-Unit-Tests im Gate.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) unvollständige Ports passieren bei Multi-Punkt-Refactor — jede neu eingeführte Feature-Detect muss ALLE alten Gates derselben API finden (rg auf den API-Namen, nicht nur die benutzte Stelle); (b) `children.length===0` ist ein Wipe-Bug bei contenteditable (Text-Nodes zählen nicht) — wrap-don't-wipe ist das Default-Rettungsmuster; (c) CSP-fähige Zero-Build-App: @layer-Deklaration in non-layered Datei, FontFace statt Style-String, dann strict style-src.

## 2026-09-11 — Persistence-Block: .dinletter + schema_version + Autosave-Indikator (DeepSeek-Longevity-Review)

**Kontext:** DeepSeek-Longevity-Analyse (Owner mit >> annotiert): Import/Export als „wundester Punkt" bestätigt. Umgesetzt:

1. **`.dinletter` (52-import-export.js, neu):** JSON-Format mit Header `format/schema_version/app/created/tool` + Draft-Payload 1:1 aus `din_draft_current`. Export schreibt erst den Live-Draft (`onSaveDraft`) und lädt via Blob-Download (Dateiname = `buildLetterFileName()`). Import: File-Input → Validierung → Confirm-Dialog → `localStorage` + `location.reload()` — Restore läuft ausschließlich über den bewährten Boot-Pfad (EIN Owner, C1-Lektion). Pure Funktionen (`buildDinLetterPayload`/`parseDinLetterPayload`) sind unit-getestet (Roundtrip + 5 Fehlerfälle). `created` via `currentISODate()` (A48 — ein versehentlicher `new Date()`-Versuch wurde noch im Editor abgefangen).
2. **`SCHEMA_VERSION` + `migrate()`:** Konstante in `Constants` (Konsumenten: migrate + .dinletter-Header), `StorageManager.migrate()` stampft `din_schema_version` idempotent; Aufruf in `main.js` **vor** `loadDraft()`. Migrationsschritte künftig sequenziell.
3. **`buildLetterFileName()`** aus `53-metadata.js` extrahiert — PDF und Export nutzen denselben Namen (Single Source).
4. **Autosave-Indikator:** `#save-status`-Dot im Sidebar-Footer (grün/orange/rot, echte Text-Nodes + `role="status"`, print-css-safe) — getrieben aus `DraftManager.#setSaveStatus` (dirty bei scheduleAutoSave, saved/error bei saveDraft).

**Verifikation:** Gate 100 %; Testsuite **11/11** (echter Lauf via test/index.html, +3 .dinletter-Tests); Live (CDP): Export-Payload korrekt (format/schema/created/tool/draft), Import-Dialog → confirm → Storage aktualisiert → Reload, invalide Datei → Fehler-Toast ohne Dialog, Status-Dot dirty→saved, Boot-Diag clean.

**🚨 Gate-Fund (wichtig für zukünftige Agenten):** Der Fitness-Gate meldete die fehlgeschlagenen M2-Tests (fehlende `#anlagen-text`-Fixture) als 100 % — die Test-Komponente des Gates ist **nicht zuverlässig**. `node tools/build_db.js` allein genügt NICHT; echte Testläufe über `test/index.html` (Port 8890) sind Pflicht bei Test-Änderungen. Auch das Fix-Verhalten der Fixture: `#anlagen-text` fehlte komplett (M2-Tests crasheden mit „Test-Fixture fehlt") — jetzt gespiegelt wie in der App (UL + contenteditable=true).

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Datenformat vor Persistenz-Logik designen: Header-Version + reines JSON schlägt jedes binäre Format für 10-Jahres-Lesbarkeit; (b) Import = Validieren + Bestätigen + Neu-Booten, niemals ein zweiter Restore-Pfad; (c) Save-Status als Zustandsklassen statt Toasts — Erfolg ist still (TOASTS-Policy), Fehler wird sichtbar.

## 2026-09-12 — .dinletter-Härtung nach Grok-Persistence-Review (Verdicts umgesetzt)

**Kontext:** Grok bewertete die Frictions F1–F7 + 7 Bugs im Persistence-Block. Umgesetzt nach Verifikation:

**Adoptiert:** BOM-Strip in parse (F4 — Notepad/editors schreiben \uFEFF); 512-KB-Import-Cap (Bug 5 — main-thread-JSON.parse eines GB-Drops); Prototyp-Hygiene (F2-reject-list: Blacklist `__proto__`/`constructor`/`prototype` + `^[A-Za-z][\w-]*$`-Id-Pattern + `Object.create(null)` — Import kann weiterhin nur `din_draft_current` schreiben, aber Junk-Keys/Prototype-Pollution werden jetzt an der Quelle abgelehnt); Reload-Toast entfernt (Bug 1 — paintet nie + verletzt Success-still); `saveDraft()` gibt `bool` zurück und Export bricht bei Save-Fehler ab (Bug 3 — kein stale/leerer Export); Status-Dot `saved` nach `loadDraft` (F6); migrate-Stamp-and-skip-Vorwarnung als Kommentar (Bug 4 — Import MUSS file.schema_version → CURRENT transformieren, sobald Migrationsschritte existieren); `buildLetterFileName()` splittet auf `•`+`,` (Bug 6 — Rücksendezeile ist "M. Name • Straße • Ort", sonst schluckt der Name Straße+Ort).

**Verworfen (Grok-Verdicts bestätigt):** F1 (format_version/SHA-256/settings-Payload — „Notepad-editierbarer Hash ist Theatre", Draft-only ist der Privacy-Default), F3 (FSA-Picker — Permission-Chrome + file://-Hostilität, `<a download>` bleibt), F5 (Backup-Reminder — erst wenn jemand einen Brief verliert; höchstens später ein Titel-Attribut), F6-idle (vierter Zustand = Clutter), F7 (in-place-hydrate — Reimplementierung von boot = zweite Orchestrationsquelle; reload ist der getestete Pfad).

**Verifikation:** Tests **13/13** (echter Lauf, +BOM +Hygiene-Tests), Gate 100 %. Live (CDP): Boot-Dot = „Gespeichert", Filename-Split korrekt, `__proto__`-Datei via echte UI → Fehler-Toast „Ungültiger Feldname", kein Dialog.

**Diag-Lektionen:** (a) `{ '__proto__': 'x' }` als JS-Objektliteral setzt den Prototyp statt einen eigenen Key — Prototyp-Hygiene-Tests müssen Roh-JSON-Strings nutzen; (b) der B2-Detektor grept verbotene API-Literale auch in Kommentaren — Guards umschreiben, nicht zitieren; (c) mein erster `return saved;` stand vor der Undo-Snapshot-Logik (Return-Wert-Konsolidierung: Early-Returns dürfen Nebenpfade nicht schließen).

## 2026-09-12 — Chromium-2025/2026-Feature-Liste empirisch geprüft (Grok) — 18 Verdicts

**Methode:** Repo-Realität zuerst (rg), dann Live-Empirie in Chrome 151 via CDP (Projekt-Doktrin: Empirie schlägt Release-Notizen). Kernbefund: **Items 1, 2, 4, 6, 16 sind bereits umgesetzt** (commandfor ×5, popover="hint", focusgroup ×3, attr() L5 ×17 in sheet.css, element-scoped View Transitions in 02-settings-manager:93) — Grok übersieht den Ist-Stand; `BASELINE_RATIO` existiert nicht (erfundener Code).

**Verdicts (empirisch belegt):**
- **@function (CSS Custom Functions): ✅ parst in Chrome 151** — einziges neues Feature mit echtem Nutzen (Alt-Todo „28× calc in sheet.css").
- **ariaNotify: ✅ verfügbar** (`typeof document.ariaNotify === 'function'`) — Toast-Ansagen statt Live-Region-Zusatz; `role="status"` bleibt, Success-still-Policy bleibt.
- **::search-text (M144):** Ctrl+F-Kontrast vs. din-comment — 1 Selektor.
- **Sanitizer API (M146): 🧪 Live-Experiment gelaufen — REJECT.** `span.din-comment`+class und `ul/li` überleben ✓, ABER auch `<i>` und `<img src=x>` (nur onerror gestrippt). Plattformmodell ist safe-by-default-Profil, nicht exakte Allowlist (img MUSS verschwinden, i MUSS un-wrapped werden). 04-sanitize.js bleibt getestete Sicherheitsgrenze.
- **Unshipped (live bestätigt, nicht nutzbar):** interestfor (false in 151), clipboardchange (false), @custom-media (parst nicht), named-feature() (false — Groks „M150"-Claim falsch).
- **Doktrin-Konflikt REJECT:** line-clamp/text-overflow auf Brief-Feldern = stiller Datenverlust (Ellipsis auf Papier) — `text-fit: shrink` (A49) bleibt: Inhalt verkleinert, nie abgeschnitten.
- **Deferred (Produkt-Entscheid):** Web Install, Window Controls Overlay, Web Preferences, Openable API, clipboardchange-Parser-Hint.
- **Ignoriert (falsche Domäne/A34):** FSA-write, FileSystemObserver, EditContext, HTML Modules, Scoped Registry, `<geolocation>`, Rewriter-in-Core, WebGPU/FedCM/WebTransport-etc.

**Generalisierbarkeit:** Für `llm_boilerplate`: Feature-Listen von LLMs (1) gegen den eigenen Repo-Stand abgleichen bevor „Einbauen" — die Hälfte ist meist schon drin; (2) empirisch in der Ziel-Chrome-Version testen (Parse-/API-Probes via CDP), Release-Notizen lügen nicht, aber Versions-Zuordnungen sind unzuverlässig; (3) Plattform-Sanitizer ≠ exakte Allowlist — Sicherheitsgrenzen werden durch einen Test-Fixture ersetzt, nicht durch Namensähnlichkeit.

## 2026-09-12 — @function-Dedup + Mini-a11y (::search-text, ariaNotify) umgesetzt

**Umsetzung (Batch 2+3 der Chromium-Verdicts):**
1. **@function-Dedup (Alt-Todo erledigt):** 51 calc-Duplikate in sheet.css durch drei Custom Functions ersetzt — `--mm-x(mm)` (horizontal → cqw), `--mm-y(mm)` (vertikal → cqh), `--pt(N)` (Schriftgröße → 0.168cqw). Funktionen wohnen in variables.css (Tokens-Layer) mit Guard: „NIEMALS hart `calc(X / var(--din-*) * 100cq*)` daneben schreiben". calc-Bestand: 28 → 3 (Seitenverhältnis-Fit + oklch-Box-Shadow bleiben bewusst).
2. **::search-text** in floating.css: Ctrl+F-Treffer kontrastieren gegen Papier + din-comment (CSS.supports bestätigt supported in 151).
3. **ariaNotify** in 01-draft-manager: Save-FEHLER werden per `document.ariaNotify(..., {priority:'important'})` angesagt (unsichtbarer Status-Dot wird auditierbar; Success bleibt still per TOASTS-Policy; `role="status"` am Toast unverändert). Ambient-Deklaration in webapi.d.ts.

**Verifikation:** DIN-Vermaßung nach Refactor **live identisch** (Falz 105/210 mm, Lochmarke 148,5 mm, Fluchtrand 25 mm — die im Code stehennden HTML-Attribut-Werte sind Form-B, nicht 110/220 wie vorher fälschlich im Diag angenommen); Tests 13/13; Gate 100 %; ::search-text-Probe green; Boot-Dot „Gespeichert".

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) DIN-Vermaßung über Custom Functions statt harter calc-Duplikate — Abweichler werden sichtbar statt still verfälscht; (b) ariaNotify-Feature-Detect (typeof) mit Fallback: Status-Dot bleibt die visuelle Quelle; (c) Regelfall beim Feature-Audit: erst Repo-Grep („schon drin?"), dann Empirie („shipped?"), erst dann Design.

## 2026-09-26 — CSS-Review-Triage (ChatGPT) + Mini-Cleanups (Layout-Guard, toter Code, Doku-Drift)

**Kontext:** Externes ChatGPT-Review zu `website/index.html` und `website/css/layout.css`. Jeder Punkt vor Umsetzung gegen Repo-Ist-Stand und Upstream (Spec/MDN) geprüft — nichts blind übernommen.

**Verworfen (Review-Fehlschluss):** „`text-fit` nicht abgesichert" — PoC in Chrome 151 existiert (`web-standards-tracking.md:144-160`: `contain` verworfen, `shrink`/`shrink 60%` gültig). „`field-sizing` betrifft `contenteditable`" — korrekt und belegt: `css-forms-1 §7.1` = „elements with default preferred size", MDN listet nur Form-Controls → die Deklaration ist auf `<din-*>` inert (nicht schädlich; getragen von `text-fit` + fixen Zonenbreiten; `ADR-CSS:76` überzeichnet). „`padding: 3cqh` auf `#viewport`" — falsch: Container-Einheiten lösen gegen den **Vorfahren**-Container auf, nicht gegen sich selbst. Ferner Nicht-Themen/dokumentierte Entscheidungen: `100vw`-Scrollbar (`overflow:hidden` überall), `form-action` vs. `method="dialog"` (MDN: kein Submit/Navigation), `.hidden`→`[hidden]`, `role=article/group` (ADR-HTML §3).

**Umgesetzt (5 Mini-Cleanups):** (1) `layout.css:90` `calc(8 * 0.168cqw)` → `--pt(8)` — echter Guard-Verstoß (`variables.css:90-103` verbietet die Rohform ausdrücklich); (2) toter `.radio-menu`-Block + ungenutztes `.mb-0` gelöscht; (3) doppeltes `display:none` bei `din-postvermerk` entfernt (Gruppenregel `:31` deckt Default); (4) `ADR-CSS:76/186/194/269` `text-fit: contain` → `shrink` (Doku-Drift gegen PoC).

**Verifikation:** Gate 100 % (vor + nach); grep clean (`text-fit: contain`/`radio-menu`/`mb-0`/rohe calc-Form); `din-postvermerk`-Default weiterhin über die Gruppenregel.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) LLM-Reviews zuerst gegen Repo-Ist-Stand + eigene Empirie prüfen — die Mehrheit der „Funde" ist bereits umgesetzt oder dokumentiert (gleiches Muster wie 2026-09-12); (b) ein Review-Wunsch „bitte kommentieren/verifizieren" kann einen echten Guard-Verstoß verdecken (hier calc→`--pt`) — Fundort selbst nachmessen, nicht die Review-Kategorie übernehmen; (c) Plattform-Claims (`field-sizing`, Container-Units) gegen Spec-Paragraf statt gegen Bauchgefühl prüfen, sonst baut man eine Regression ein.

## 2026-09-26 — variables.css-Aufräumen (tote Tokens, guide-opacity-Dedup, --pt-SSOT)

**Kontext:** ChatGPT-Review zu `website/css/variables.css`. Gegen Verbraucher/Setzer geprüft (Layer-Reihenfolge `index.html:15-23`) — die eigentlichen Funde hatte das Review übersehen.

**Review-KEEP (bestätigt):** `@layer`-Kommentar; `@property --guide-opacity` (`inherits: true` ist load-bearing: `:root`-Set + `sheet.css:111`-Consume + Transition `variables.css:19`); `light-dark()`-Struktur; `data-theme="auto"`-Explizitheit; `--bg-sidebar-glass`; `--accent-hover` (1 Verwendung, aber semantischer Token); `[popover] { color-scheme: inherit }`.

**Umgesetzt:** (1) **5 tote Tokens entfernt** (nichts im Repo liest sie): `--guide-color`, `--paper-zoom`, `--shadow-sm`, `--accent-muted` + Kette `--c-accent-muted-day/night`, `--border-color-focus` (war nur vom bereits gelöschten toten `.radio-menu` referenziert). (2) **`--guide-opacity` dedupliziert:** tote `0.15` in `sidebar.css` (layout-Layer) entfernt — wurde nachweislich von `:root:has(#btn-guides-switch:checked){--guide-opacity:0.55}` in `floating.css` (floating-Layer, identischer Selektor) überschrieben; Default nur noch einmal (`variables.css:79`), floating-Dublette weg. (3) **`--pt()` bindet die Blattbreite an `var(--din-width)`** statt Magic-Constant `0.168cqw` (mathematisch identisch: 0.3528/210·100 = 0.168). (4) `tools/reconciliation.js`: Feature-Check „CSS Relative Color Syntax" zeigte auf `variables.css`, wo die Syntax nur im toten `--guide-color` stand → Anker auf `sheet.css` (6 echte `oklch(from …)`-Verwendungen) korrigiert.

**Verifikation:** Gate **100 %** (vor + nach; zwischenzeitlich 96,43 % wegen des Feature-Ankers — gefunden und behoben), grep clean (keine Referenz auf entfernte Tokens; `--guide-opacity` nur noch 1 Default + 1 Override + `@property`), `--pt`-Ergebnis mathematisch identisch. Rollback-Punkt: git.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) **Tote-Token-Scan** (definiert, aber nirgends per `var()` gelesen) findet echten Ballast, den ein Schönheits-Review nicht sieht — aber Primitive, die nur intern in derselben Datei referenziert werden, gehören NICHT in den „unused"-Topf; (b) **über Layer überschriebene Werte sind still tot** (identischer Selektor, spätere Lage gewinnt) — Layer-Reihenfolge beim Dedup zwingend prüfen; (c) Feature-Checks an den Ort echter Nutzung binden, nicht an die Datei, in der ein Token zufällig wohnt.

## 2026-09-26 — print.css: toten `.pv-select`-Block entfernt

**Kontext:** ChatGPT-Review zu `website/css/print.css`. Alle 12 Review-Punkte als KEEP bestätigt; der als „bitte prüfen" markierte `.pv-select`-Selektor war der einzige echte Fund.

**Befund:** `print.css` stylte `.pv-select`/`.pv-select::picker-icon`. Kein Element trägt diese Klasse — das echte Select ist `index.html:80` (`id="sidebar-pv-select" class="sidebar-select sidebar-pv-select"`); Klassen-Matching ist tokenweise, `.pv-select` ≠ `sidebar-pv-select`. Zusätzlich konzeptionell wirkungslos: das Select liegt im `<aside>`, das `print.css:20` per `display:none !important` ausblendet; der gedruckte Postvermerk läuft über `din-postvermerk` (JS-Spiegel). Rename-Leiche (vgl. `layout.css:114-118`, alte `.pv-item`-Regeln dort bereits entfernt).

**Umgesetzt:** `.pv-select` + `.pv-select::picker-icon` (9 Zeilen) entfernt. Übrige Punkte bewusst KEEP: `@page` (`size`/`margin`/`page-margin-safety`, im Datei-Kommentar belegt + PoC in `web-standards-tracking.md`), App-Shell-/`#viewport`-Print-Reset inkl. `container-type: normal`, `din-a4`-mm via `attr()`-SSOT, `[popover]`/`.no-print`/`[data-generated]`/Contenteditable-Reset, `page-break-after: avoid` (ein Blatt/Dokument), `#absender`-Drucklinie.

**Verifikation:** Gate **100 %** (vor + nach), grep clean; übrige Selektoren als live bestätigt (`no-print` 8×, `[placeholder]` 18×, `data-generated` gesetzt in `41-salutation-engine.js:326`).

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Klassen-Selektoren nach Umbenennungen per **Token-Vergleich** prüfen, nicht per Substring — `.pv-select` matcht `sidebar-pv-select` nicht; (b) ein Selektor kann zugleich **syntaktisch tot** (falsche Klasse) und **konzeptionell tot** (Element liegt in `display:none`-Container) sein — beides prüfen, bevor man ihn „repariert"; (c) Print-CSS selektoren auf Elemente in ausgeblendeten Containern sind immer Karteileichen.

## 2026-09-26 — Chrome-only-Aufräumen: reset.css + signature.css (Firefox-Rest, Dubletten, Font-SSOT, Datei-Organisation)

**Kontext:** ChatGPT-Review zu `layers.css`/`reset.css`/`signature.css`. Baseline bestätigt: **Chrome 150+, kein Firefox/Safari** (`Immutable-Law-Catalog.md:37`). Alle KEEPs bestätigt; ein echter Rest + drei optionale Redundanzen umgesetzt.

**Umgesetzt:** (1) `reset.css`: `-moz-osx-font-smoothing: grayscale` entfernt — Firefox-only, in Chromium No-op (Chrome-only-Baseline). (2) `reset.css`: `html { color-scheme: light dark }` entfernt — war von `:root { color-scheme: light dark }` (`variables.css:16`; höhere Spezifität *und* spätere Lage, gleiches Element) vollständig verdeckt. (3) `reset.css`: UI-Font-Literal durch `var(--font-active-stack)` ersetzt (SSOT; Token wird nie mutiert, Custom-Font läuft über `body.font-custom-active` via `02-settings-manager.js:145`). (4) `#btn-font-action`-Visualblock von `signature.css` nach `sidebar.css` verschoben (Schriftarten-Manager-CSS gehört nicht zur Unterschrift; beide `layout`-Layer → kaskadisch neutral, kein Konkurrenz-Selektor, vorher per grep verifiziert).

**Bewusst KEEP:** `layers.css` + Kommentar; `100vw/100dvh + overflow:hidden`; Reduced-Motion-Kill-Switch; `-webkit-font-smoothing` (wirkt in Chromium); `signature.css` pointer-events-Architektur, `:has()`-States, JS-inline `translate/rotate/scale` (`42-signature.js:158-160`), `touch-action:none`, `mix-blend-mode:multiply` (Print-QA), `z-index:100`. `max-width:100%` auf `#signature-image` ist **No-op** (Prozent-`max-width` gegen shrink-to-fit-inline-block in 0-Breite-Container → als `none` aufgelöst) — kein Defekt.

**Verifikation:** Gate **100 %** (vor + nach); grep: kein `-moz-`/`color-scheme` mehr in `reset.css`, `#btn-font-action`-Visualblock genau einmal (`sidebar.css:314`), `floating.css`-`:before`-Labels unverändert.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) bei Chrome-only-Baseline Vendor-Prefixe der Nicht-Ziel-Engines (`-moz-*`) als toten Ballast entfernen; (b) doppelte `color-scheme`-Deklarationen sind still verdeckt (`:root` schlägt `html` per Spezifität) — eine Theme-Quelle; (c) Datei-Organisation nach Feature statt Historie: Layout-Layer-Moves sind kaskadisch neutral, solange kein gleichspezifischer Konkurrenz-Selektor existiert — vorher per grep prüfen.

## 2026-09-26 — Repo-Aufräumen (Git-Noise + Tippfehler) + Struktur-Verdikt

**Kontext:** User-Eindruck „Ordnerstruktur wie ein Dickicht". Read-only-Inventar des Roots; danach nur das sicher Aufräumbare umgesetzt.

**Umgesetzt:** (1) `.gitignore`: lokalen Tool-/OS-Müll ergänzt — `.directory` (KDE), `.opencode/` + `opencode.json` (Agent/Editor-local-state, konsistent zur bestehenden `.claude/`-Gruppe), `scratch/` (lokale PoC-Testdateien). `git status` damit frei von untracked Noise. (2) Tippfehler-Datei `research/reasearch_changelog.md` → `research/research_changelog.md` (`git mv`) + 2 Referenzen in `docs/30-meta/review2_grok.md` nachgezogen.

**Bewusst NICHT verschoben (gegen den ersten Reflex „nach docs/"):** `specs/` ist vertraglich am Root verankert (`AGENTS.md:65`, `README.md:92`, `docs/30-meta/HYBRID-SPEC-DRIVEN-WORKFLOW.md`, `docs/foundation_inventory.json:326/480`, generiertes `agent/cache/LLM_CONTEXT.md`) — ein Move wäre eine Vertragsänderung über ≥5 Dateien + Gate-Risiko (V6-Frontmatter-Scan), kein Aufräumen. `scratch/` bleibt auf der Platte (Docs zitieren die PoC-Dateien, `jsconfig.json` schließt es aus), nur git-ignoriert. `CLAUDE.md`/`GEMINI.md` sind bewusste Multi-Tool-Einstiegspunkte (Claude Code liest `CLAUDE.md`, Gemini CLI `GEMINI.md`; Memory-Doc: „AI-Lobotomie-Prävention") — kein Nonsense.

**Verifikation:** Gate **100 %** (vor + nach); `git status --short` zeigt nur die 3 beabsichtigten Änderungen.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Root-„Wildwuchs" zuerst klassifizieren (Produkt/Doku/Build/Daten/Agent-Infra/lokaler Müll) statt reflexhaft zusammenzuschieben; (b) „fast leerer Ordner" ≠ Nonsense — vor Verschieben alle Vertrags-/Tool-Referenzen greppen; (c) lokale Tool-/OS-Reste in `.gitignore` (nicht löschen), `scratch` getrennt von versionierten PoC-Belegen behandeln.

## 2026-09-26 — P1: MCP-Retrieval (docs_search/docs_get, FTS5, Abschnitts-Chunking)

**Kontext:** Token-Sparsamkeit — Agenten sollen Dokumente per Suche/Abschnitt lesen, nicht als ganze Dateien. Prüfung ergab: `tools/build_db.js` schreibt nur `build/import.sql` (keine abfragbare DB; enthält `vec0` → mit `node:sqlite` nicht ausführbar), `agent/cache/DIN-Brief_docs.db` ist die **Session-Log**-DB (`tools/log_session.js`), und der „MCP-Server" war bislang **keine** MCP-Implementierung, sondern eine `{"operation":...}`-Zeilen-CLI.

**Umgesetzt:** (1) Neu `agent/mcp/dinbrief-mcp/docs.js` — scannt `.md` des Doku-Korpus, parst Frontmatter, zerlegt in **Abschnitte (H1-H6)** mit echten Datei-Zeilennummern und baut einen FTS5-Index `agent/cache/docs_search.db` (Standalone-`sections_fts`, `bm25`-Ranking, `snippet()`); Auto-Rebuild bei Staleness (mtime); getrennt vom Session-Log-DB (Namenskollision vermieden). (2) `index.js` spricht jetzt echten **MCP-stdio (JSON-RPC 2.0)**: `initialize` / `tools/list` / `tools/call` / `ping`, Tools `docs_search` + `docs_get` (Gerippe oder EIN Abschnitt, nie ganze Datei); der Legacy-`{"operation"}`-Modus bleibt erhalten. (3) `opencode.json`: MCP-Server `dinbrief` registriert; `opencode.json` aus `.gitignore` gelöst (versionierbar). (4) MCP-README aktualisiert.

**Verifikation:** FTS5 in `node:sqlite` v22.22 verifiziert; Index live gebaut (103 Dokumente / 1131 Abschnitte); `docs_search` + `docs_get` + `tools/list` + Legacy-`validate` per stdio getestet; Gate **100 %** (vor + nach). `vec0` fehlt in `node:sqlite` („no such module: vec0") → Vektor-/Semantik-Suche bewusst ausgeklammert.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) **Abschnitts-Chunking statt Datei-Retrieval** ist der eigentliche Token-Hebel — nicht das Format (MD bleibt Source of Truth, SQLite ist abgeleitet); (b) eine Doku-DB braucht einen Rebuild-Trigger (mtime) und eine klare Trennung zu Log-/Generat-DBs; (c) MCP-stdio ohne SDK ist ~60 Zeilen JSON-RPC — die SDK-Dependency ist vermeidbar; (d) Vektor-Suche setzt einen Embedding-Stack voraus, der die Zero-Dependency-Doktrin bricht → erst bei belegtem Bedarf.

## 2026-09-26 — Retrieval/Taxonomie/Automatik (P2–P5 + Phase 1–3)

**Kontext:** Batch aus der Doku-/Retrieval-Liste (P1 war bereits erledigt) plus dem verabschiedeten Phase-Plan.

**Umgesetzt:**
- **Phase 1 / Taxonomie:** `repository.yaml` → `taxonomy` (`allowed_top_level`, `allowed_root_files`, `roles`). `tools/reconciliation.js` → neuer `check_type "taxonomy"`: liest die Allowlists aus `repository.yaml` (SSOT), prüft per `git ls-files`, meldet Unbekanntes als `critical` (Build bricht ab). Negativtest bestanden (Streudatei → critical/99,88 % → 100 % nach Entfernen). Untracked Müll bleibt irrelevant.
- **Phase 2 / Ein Builder:** Neu `tools/docs_index.js` — Abschnitts-Chunking (H1–H6, Zeilennummern), Datei-Inventar (`files` per `git ls-files`), `documents`/`sections`/`sections_fts` (FTS5). `tools/build_db.js` baut den Index im Gate-Lauf mit (**ein Kommando = Gate + Index**). `agent/mcp/dinbrief-mcp/docs.js` → dünne Re-Export-Schicht (keine Doppel-Logik).
- **Phase 3 / Automatik:** `.githooks/pre-commit` (Gate + Index, bricht Commit bei < 100 %) + Aktivierung `git config core.hooksPath .githooks`; `.github/workflows/fitness.yml` als CI-Backstop.
- **P2:** Abschnitts-Chunking — durch den Index erfüllt.
- **P3:** `docs/90-archive/` eingeführt; 8 Einmal-Artefakte (2 Grok-Reviews, `chatgpt-review-prompt`, `PROJECT`, `FOUNDATION-RESTORATION-PLAN`, `architecture-drift-audit-2026-08-27`, 2 Inventar-Snapshots) verschoben; Zeiger in `docs/index.md`, `docs/00-foundation/README.md`, `repository.yaml`, `CLAUDE.md` nachgezogen (DECISION-LOG-Altbezüge bewusst NICHT umgeschrieben = Chronik).
- **P4:** Rollen der zwei Builder klargestellt: `build_db.js` kanonisch, `build_db.py` = optionaler Vektor-Zweig (Phase 4) — in `build_db.py`-Header + `tooling-overview.md`.
- **P5:** Gate-Warnung bei Doku > 400 Zeilen (Ausnahme `DECISION-LOG`/`Code-Referenzen`); feuert aktuell für `sqlite-vec.md` (410).

**Phase 4 (vorgemerkt, belegt machbar):** sqlite-vec läuft auch im Node-Stack — `node:sqlite` mit `{ allowExtension: true }` + `loadExtension('vec0.so')`, KNN live getestet (Upstream `asg017/sqlite-vec` v0.1.9). Offen ist nur die Embedding-Modell-Entscheidung (offline/zero-dep).

**Verifikation:** Gate **100 %** nach jeder Phase; MCP `docs_search`/`docs_get` grün; Index 104 Docs / 1138 Abschnitte / 222 Dateien; Hook läuft; CI-YAML vorhanden.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Platzierungs-Taxonomie als **kritische Gate-Regel** statt Doku-Konvention, Allowlists aus dem Contract lesen (SSOT); (b) **ein** Builder + Index im Gate-Lauf, MCP nur als Query-Schicht; (c) versionierte Hooks (`.githooks` + `core.hooksPath`) plus CI-Backstop; (d) Abschnitts-Chunking mit Zeilennummern ist der Token-Hebel, nicht das Datenformat.

## 2026-09-26 — Suche Stufe 1: FTS5-Prefix + Trigram (statt Vektor)

**Kontext:** Frage „Semantik einfacher als Vektor?" — Klärung gegen SQLite-FTS5-Doku (`sqlite.org/fts5.html`): echte Semantik (Bedeutung/Synonyme) = Vektor/Embeddings; ohne Modell geht nur lexikalischer Ausbau. Vektor bleibt Phase 4 (dauerhafte Modell-Dependency, query-seitig).

**Umgesetzt (`tools/docs_index.js`):** (1) `sections_fts` auf `unicode61 remove_diacritics 2`; (2) Prefix-Query (`"term"*`) für Wortvarianten; (3) zweite FTS-Tabelle `sections_fts_tri` (**trigram**) als Fallback für mittlere Teilwörter; `search()` zweistufig — Wort (bm25) zuerst, dann Trigram-Auffüllung, Treffer markiert mit `match: word|substring`. Bugfix unterwegs: fehlendes `DROP TABLE IF EXISTS sections_fts_tri` im Schema (Rebuild schlug sonst fehl; Gate blieb 100 %, Index wäre still kaputt).

**Verifikation:** Prefix `falzmark`→Falzmarken, `autosav`→Autosave; Trigram `slinien` findet „hilfslinien" (mittleres Teilwort). Grenze dokumentiert: Trigram = **Teilwort**, KEINE Tippfehler-Distance. Gate 100 %; Index 104 Docs / 1140 Abschnitte / 228 Dateien.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) für deutsche Suche ist Porters Stemmer unbrauchbar → **Prefix + Trigram** statt Stemming; (b) **keine Synonym-Map** — stattdessen wird das Vokabular projektweit vereinheitlicht (siehe Eintrag „Vokabular auf IMR-Atome normiert"); (c) Vektor erst bei nachgewiesener Lücke, weil das Modell auch zur Query-Zeit verfügbar sein muss.

## 2026-09-30 — Vokabular auf IMR-Atome normiert (CSS/HTML), tote Leiche entfernt

**Kontext:** IMR-Registry (`docs/10-architecture/IMR-Registry.md`) ist die SSOT des Fachvokabulars (45 Atome, Zonen, Rahmen). Drift-Prüfung ergab: die HTML-*Elemente* waren konform, aber CSS-Klassen/Properties/Attribute waren teils englisch, und `din-verteiler` war eine unregistrierte Leiche. Leitlinie: **ein Begriff pro Konzept, deutsch, aus der IMR** — wie „1 m ist immer 1 m".

**Änderung (`website/css/sheet.css`, `website/css/layout.css`, `website/index.html`):**
1. System-Atome werden per **Tag** selektiert statt per Klasse: `.din-mark`/`.din-fold-top`/`.din-fold-bottom`/`.din-punch` → `din-falz-oben`/`din-falz-unten`/`din-lochmarke`; die Klassen aus dem HTML entfernt.
2. Custom Properties + `data-*`-Attribute auf IMR-Begriffe: `--fold-1-y`/`--fold-2-y`/`--punch-y` → `--falz-oben-y`/`--falz-unten-y`/`--lochmarke-y`; `data-fold-1-a|b`, `data-fold-2-a|b`, `data-punch-y` → `data-falz-oben-y-a|b`, `data-falz-unten-y-a|b`, `data-lochmarke-y` (Muster `data-<atom|zone>-y-<form>`, wie schon bei `data-absender-y-a`).
3. `din-verteiler`-Regeln aus `layout.css` entfernt — kein `<din-verteiler>`-Element, kein `#toggle-verteiler`, kein IMR-Eintrag (als Atom wäre es #46 → laut Registry verboten).
4. Such-Synonym-Map ersatzlos entfernt (`tools/docs_synonyms.json` gelöscht, Expansion aus `buildWordQuery` raus) — Synonyme sind das Gegenteil von kontrolliertem Vokabular.

**Sicherung:** IMR vor jeder Änderung 1:1 kopiert nach `/home/moritz/.local/state/opencode-changes/DIN-BriefNEO/IMR-Registry.20260930-151745.md` (sha256 identisch), zusätzlich git-getrackt.

**Verifikation:** keine Restvorkommen (`grep` leer für `din-fold|din-punch|din-mark|din-verteiler|--fold-|--punch-|data-fold|data-punch`); Gate 100 %.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) kontrolliertes Vokabular braucht einen **maschinenlesbaren Anker** (Registry = SSOT) + **Gate-Regel**, sonst driftet Prosa/CSS in Synonyme/Englisch; (b) **Element-Namen als primäre Selektoren** (Atome direkt stylen) löscht eine ganze Klassen-Ebene — „das Atom ist der Begriff"; (c) IMR vor Modell-Änderungen immer sichern (sha256-verifiziert).

## 2026-09-30 — IMR als Vokabular-SSOT: 205 Renames + Gate-Regel + Nicht-Atom-Deklaration

**Kontext:** Ziel „ein Begriff pro Konzept, deutsch, 100 % aus der IMR". Sweep fand IMR-Synonyme quer durch den Code: `briefkern`/`brieftext`/`brief-fuss` (statt `kern`/`text`/`fuss`), `#absender` auf `din-rucksendezeile` (Rücksendezeile ≠ Absender), `#empfaenger` auf `din-anschriftfeld`, `info-street/-city/-tel/-email` auf `din-absender-*`, `signature-*`/`sig-*` (englisch), `address-*` (englisch), `guides`/`--guide-opacity` (englisch), Kürzel `pv`, sowie Nicht-Atome im `din-`-Namespace (`din-comment`, `din-a4-viewport`, `--din-width/-height`).

**Änderung:**
1. **205 Ersetzungen in 22 Dateien** (Codemod, nur kebab-Identifier): Atome/Zonen auf kanonische Namen; `--briefkern-y`→`--kern-y`; `#absender`→`#rucksendezeile`; `#empfaenger`→`#anschriftfeld`; `info-*`→`absender-*` bzw. `absender-namenszeile`; `empfaenger-name`→`empfaenger-namenszeile`; `signature-*`/`sig-*`→`unterschriftsbild-*` bzw. `unterschrift-zeile`; `address-*`→`anschrift-*`; `guides`→`hilfslinien`; `sidebar-pv-select`/`pv-item`→`postvermerk`; `din-comment`→`brief-kommentar`; `din-a4-viewport`→`brief-ansicht`; `--din-width/-height`→`--blatt-breite/-hoehe`. **Nicht angetastet:** JS-Variablennamen (intern) und Persistenz-Keys (`din_local_addresses` — keine Datenmigration riskieren).
2. **IMR-Registry** um Abschnitt „Nicht-atomare Bezeichner" erweitert (Präfix-Reservierung, `data-<atom|zone>-y-<form>`, Rendering-Bezeichner, Namenszeile als Komposition) — additiv, die 45 Atome bleiben unverändert. Vorher 1:1 gesichert (`/home/moritz/.local/state/opencode-changes/DIN-BriefNEO/IMR-Registry.20260930-151745.md`, sha256).
3. **Gate-Regel `imr`** in `tools/reconciliation.js`: parst die Registry als SSOT; jedes `din-*` im Website-Code muss registriert sein (Guide-Refs `@guide`/`[[…]]` ausgenommen); Verstoß = `critical`.

**Verifikation:** keine Restvorkommen (`grep` leer), `node --check` aller JS ok, keine doppelten IDs, ID-Konsistenz JS↔HTML ok, Negativtest der Regel greift (`din-bogus`/`din-namenszeile` → Verstoß), Gate 100 % (Index 104/1146/228).

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) kontrolliertes Vokabular = maschinenlesbare SSOT (Registry) + Gate-Regel; (b) Renames als Codemod mit explizitem Mapping und Ausnahme-Liste (Persistenz-Keys!) statt Handarbeit; (c) ein reservierter Namensraum (`din-`) verhindert Wildwuchs am wirksamsten; (d) „ein Begriff pro Konzept" macht Synonym-Ersetzung in der Suche überflüssig.

## 2026-09-30 — IMR formalisiert: Contract, Alias-Registry, Authority, maschinenlesbares Inventar

**Kontext:** Review der IMR-Registry (7,5/10 Entwurf) ergab: fehlender Namespace-/Alias-Vertrag, keine maschinenprüfbaren Invarianten, unmarkierte Normativität — und als wichtigsten Punkt **`data-*` als faktisch zweite Geometriequelle** (die Registry war Doku, nicht SSoT der Geometrie).

**Änderung:**
1. **Registry Contract** + **MUST-NOT** (8 Regeln) + einheitliches Regelvokabular MUST/MUST-NOT/SHOULD/MAY.
2. **Namespace**: jeder `din-*` gehört exakt einer Kategorie (DOCUMENT / ZONE / ATOM (42) / SYSTEM_ATOM (3)); UI-/Rendering-Bezeichner ohne `din-`.
3. **Synonym-/Alias-Registry** (erlaubte Kompositionen/Satelliten, verbotene Aliase `din-empfaenger-name`/`din-absender-name`) + **Authority** (DIN „zu verifizieren" / PROJECT / IMPLEMENTATION).
4. **Maschinenlesbares JSON-Inventar** in der Registry; neu **`tools/imr.js`** validiert (45 Atome / 3 System / 42 Inhalt, Duplikate, verbotene Aliase, Kompositions- und Geometrie-Bezüge), prüft Code auf nur-registrierte `din-*` und **leitet die `data-*`-Geometrie ab und vergleicht sie mit `website/index.html`** → Registry ist jetzt echte SSoT der Geometrie. Die Gate-Regel `imr` ruft das Werkzeug auf (kritisch).
5. **Letztes Synonym geschlossen:** Zonen-Geometrie `data-empfaenger-y-*` / `--empfaenger-y` → `data-anschriftfeld-y-*` / `--anschriftfeld-y` (die Zone heißt `din-anschriftfeld`).
6. `doc-size`-Ausnahme für die IMR-Registry (normative SSOT, darf nicht gesplittet werden).

**Verifikation:** `node tools/imr.js` → „51 registrierte din-Bezeichner, Inventar konsistent"; Negativtests greifen (fremdes Atom → 46/43; `data-kern-y-a="999"` → Abweichung); Gate 100 %.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) eine SSoT ist erst echt, wenn ihre abgeleiteten Artefakte (hier `data-*`) **generiert bzw. gegengeprüft** werden — sonst ist sie nur Doku; (b) Invarianten (Anzahl/Duplikate/Aliase) als Gate-Check statt Prosa; (c) Herkunft (normativ/projekt/implementierung) pro Wert markieren, sonst liest man Projektregeln später als Norm; (d) ein maschinenlesbarer JSON-Block im selben Dokument schlägt eine zweite Datei.

## 2026-09-30 — IMR-Vokabular Pass 3: Blatt, container-name-Ballast, UI-Englisch

**Kontext:** Zweiter Sweep in `website/css` + `website/index.html`. Gefunden: das Blatt hieß `paper`/`sheet`/`Blatt` gemischt; `#viewport` hatte **zwei** `container-name` (`viewport`, `sheet-stage`) und **alle** container-names waren ungenutzt; aria-labels nannten Atome/Zonen anders; UI-Texte sagten „Adresse" statt „Anschrift"; UI-Englisch (`font`, `toast`, `sidebar`, `data-*`).

**Änderung:**
1. **Blatt vereinheitlicht** (DIN-nah „Briefblatt", Registry „DIN-A4-Blatt"): `--paper-bg/-text/-ghost` → `--blatt-hintergrund/-text/-schwach`; `--c-paper-*`→`--c-blatt-*`, `--c-ink-*`→`--c-tinte-*`, `--c-ghost-*`→`--c-schwach-*`; `class="paper-theme"`→`blatt-theme`; Kommentare „Paper/FOOTER/sheet"→„Blatt/FUSS".
2. **container-name-Ballast entfernt:** alle `container-name`-Deklarationen gelöscht (kein `@container` im Projekt → ungenutzt; der Doppelname auf `#viewport` war ein toter Konflikt). `container-type` bleibt (cqw/cqh).
3. **aria-labels auf IMR-Namen:** „Brieftext"→„Text", „Briefinhalt"→„Briefkern", „Empfängeradresse"→„Anschriftfeld", „Absenderinformationen"→„Infoblock".
4. **„Adresse"→„Anschrift"** in UI-Texten (Ausnahme „E-Mail-Adresse").
5. **UI-Englisch verdeutscht:** `font`→`schrift` (explizite Identifier; `font-family`/`FontFace`/`fontsource` unberührt), `toast`→`hinweis` (Datei `32-toast.js` + kapitales JS-API `showToast`/`TOASTS` unberührt), `sidebar`→`seitenleiste` (Datei `sidebar.css` unberührt); `data-appearance/persist/dir/font-mode/action`→`data-erscheinungsbild/speichern/richtung/schrift-modus/aktion`; `page-1`→`seite-1`, `no-print`→`nicht-drucken`.
6. **Bugfix aus dem Rename:** JS-`dataset`-Zugriffe angepasst (`dataset.action`→`dataset.aktion`, `dataset.fontMode`→`dataset.schriftModus`) — sonst wären Signatur-Handles/Font-Umschalter stillschweigend kaputt. Bewusst gelassen: reine CSS-Konvention (`hidden`/`w-full`/`sr-only`/`single-line`, Farb-Rollen `--c-primary/-danger/-success/-warning`, `type-*`) — kein Vokabular, KISS.

**Verifikation:** keine Restvorkommen (grep leer), Schutz-Token intakt (`font-family`, `FontFace`, `fontsource`, `32-toast.js`, `css/sidebar.css`), `node --check` aller JS ok, ID-Konsistenz JS↔HTML ok, Gate 100 %, `imr.js` OK.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Renames über Guard-Regex (`(?!\.js|\.css)`) + explizite Native-/Brand-Ausnahmen statt Blanket; (b) **`dataset.camelCase` ist die Falle** beim Attribut-Rename — Attribut und JS-Zugriff müssen zusammen wandern; (c) tote `container-name` ohne `@container` einfach löschen statt harmonisieren.

## 2026-09-30 — Kanonisches Vokabular als IMR-Vertrag + Gate-Prüfung

**Kontext:** Der Sweep zeigte: `imr.js` kontrollierte bisher nur die `din-*`-Struktur, nicht das übrige Projektvokabular. Ziel: die IMR definiert **auch die erlaubte Sprache**, und das Gate prüft sie — damit kein manueller Sweep mehr nötig ist.

**Änderung:**
1. **IMR-Inventar** um `vocabulary` erweitert: `canonical`, `forbidden` (paper→Blatt, sheet→Blatt, Brieftext→Text, Briefinhalt→Briefkern, Empfängeradresse→Anschriftfeld, Absenderinformationen→Infoblock, sidebar→Seitenleiste, toast→Hinweis, page-1→seite-1), `forbiddenTokens` (`--paper-`/`--c-paper-`/`--c-ink-`/`--c-ghost-`/`--fold-`/`--punch-`/`--din-width`/`--din-height`/`--guide-opacity`), `exceptions` (Dateinamen), `notAutoChecked` (font/action/Adresse wegen native API bzw. Input-Parsing).
2. **`tools/imr.js`**: neue `checkVocabulary` — **case-sensitive** (kapitalisierte API-/Brand-Namen bleiben unberührt), Wortgrenzen mit `-`/`_`/`.`, überspringt `.js`/`.css`-Tokens und die Ausnahmen; `forbiddenTokens` als Literal-Scan. Verstöße sind Gate-`critical`.
3. **Residuen bereinigt:** Kommentar „Brieftext"→„Text", Meldung „Briefinhalt"→„Briefkern", JS-Variablen `sheet`→`blatt` (draft-manager/settings-manager), Kommentar „sheet"→„Blatt".

**Verifikation:** `node tools/imr.js` → „IMR OK"; Negativtest greift (`paper`/`sheet`/`sidebar`/`toast` geflaggt) und respektiert Ausnahmen (`font-family`, `touch-action`, `css/sidebar.css`, `showToast`, `32-toast.js`); Gate 100 %; `node --check` ok.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Terminologie deterministisch wie Struktur behandeln — kanonische Liste + verbotene Aliase + technische Ausnahmen als maschinenlesbarer Vertrag im selben SSOT-Dokument; (b) case-sensitive Wortgrenzen + Datei-Pfad-Ausnahmen verhindern die typischen False Positives (native CSS, API-Namen, Brands); (c) was nicht sicher prüfbar ist (native API, Eingabe-Parsing), wird ausdrücklich als `notAutoChecked` deklariert statt still weggelassen.

## 2026-09-30 — Case Contract (kebab HTML/CSS) + Case-Gate

**Vorbefund:** Bestandsaufnahme ergab **keinen** bestehenden Case-Vertrag in `ADR-CSS/-HTML/-JS` oder IMR → keine konkurrierende Regel. Ist-Code deckt sich mit dem Vorschlag (HTML/CSS kebab, JS camelCase, Klassen PascalCase); einzige echte Abweichung: `@keyframes shakeToast` (camelCase). Docs-Dateinamen sind gemischt (Pascal/kebab/snake) — **bewusst nicht umgebaut** (dateinamen-basierte `[[…]]`-Links).

**Änderung:**
1. **IMR `## Case Contract`** + maschinenlesbarer `caseContract` im Inventar: HTML/CSS kebab; JS camelCase / PascalCase / **UPPER_SNAKE für Konstanten**; Docs-Dateiname = bestehend, `id:` kebab; Dataset-Mapping `data-schrift-modus` → `dataset.schriftModus`; Exception für Plattform-Identifier.
2. **`tools/imr.js`: `checkCase`** — prüft HTML (`id`/`class`/`data-*`) und CSS (Klassen-/ID-Selektoren, Custom Properties, `@keyframes`, `@property`) auf kebab; Kommentare werden gestrippt, Hex-Farben ignoriert; **JS-Identifier und Dateinamen bewusst nicht**. Verstöße = Gate-`critical`, contract-getrieben (`caseContract.htmlCss`).
3. **Fix:** `@keyframes shakeToast` → `shake-hinweis` (inkl. `animation`-Referenz).

**Verifikation:** `node tools/imr.js` → OK; Negativtest: `BadClassName`/`bad_class_name`/`#BadId`/`--BadProp`/`@keyframes badName` → FAIL, Kommentar-Klasse ignoriert; JS `badClassName`/`BAD_CONSTANT`/`PascalClass` → PASS; `data-schrift-modus` → PASS; Gate 100 %.

**Generalisierbarkeit:** (a) Case und Vokabular sind **getrennte Achsen** — ein Identifier kann Case-konform/vokabular-falsch sein und umgekehrt; (b) pro Sprache/Artefakt den nativen Case, Übergänge über Plattform-Mapping (dataset); (c) nicht sicher Prüfbares (JS-Identifier, Dateinamen) ausdrücklich ausnehmen statt halbherzig prüfen.

## 2026-09-30 — Foundation-Dokumente nachgezogen (Verweis, Vokabular, Benennungs-Hinweis)

**Kontext:** Prüfung von `docs/00-foundation/` (per eigener Regel read-only für KI-Agenten; hier **menschlich freigegeben**). Funde: tote Klartext-Referenz `README.md:66` (`docs/30-meta/audits/` existiert nicht, kein `audit_summary` im Repo), „Toast" statt kanonisch „Hinweis".

**Änderung:** (1) README-Verweis strichlos auf `docs/90-archive/` umgebogen; (2) „Toast"→„Hinweis" in `spec.md` und `Immutable-Law-Catalog.md` (H2); (3) README ergänzt, dass **Benennung** (Vokabular + Case) in der IMR definiert und von `tools/imr.js` erzwungen wird; `updated`-Daten gesetzt.

**Verifikation:** Gate 100 %, `imr.js` OK, `[[…]]`-Links intakt, kein „Toast" mehr in Foundation.

**Generalisierbarkeit:** Foundation (WHY/Gesetze) referenziert die IMR (WAS/WIE) als SSOT — Benennung/Prosa gehört nicht in die Gesetzesebene, sondern in die Registry; Klartext-Pfade in Doku sind eine Lücke des Link-Gates (nur `[[…]]` werden geprüft).

## 2026-09-30 — docs/10-architecture-Audit: Baseline, Doc-id-Case, toter Link, Rename-Drift

**Kontext:** Audit `docs/10-architecture`. Funde: (1) **Baseline-Widerspruch** — Matrix + ADRs nennen **Chrome 148+** statt der einzigen Baseline **150+** (Foundation); (2) Doc-`id:` `ADR-005`/`ADR-006`/`ADR-OMNITRACEABILITY` groß (Case-Contract-Verstoß, vom Gate nicht geprüft); (3) toter inline-Link `[[ADR-MIGRATION]]` (kein File, Gate prüft inline `[[…]]` nicht); (4) **Rename-Drift**: ADR-HTML listete noch `data-punch-y`/`data-fold-*`/`data-empfaenger-y-*`.

**Änderung:** Baseline `148+`→`150+` in Matrix, ADR-HTML/CSS/ANTIPATTERN/006 und `docs/index.md`; Doc-ids auf kebab (auch `ADR-TEMPLATE`/`GUIDE-TEMPLATE`/`README-DB`); toten Link durch `docs/90-archive/`-Hinweis ersetzt; ADR-HTML-`data-*` auf kanonisch; **`checkCase` um Doc-Frontmatter-`id:`** erweitert (schließt die Lücke). Bewusst nicht: ADR-Dateien umbenennen (ADR-CSS 36 / ADR-JS 37 Link-Ziele), Matrizen mergen (2 von 3 generiert).

**Verifikation:** Gate 100 %, `imr.js` OK, Negativtest Doc-id (`ADR-BAD` → FAIL), keine `148`-Baseline mehr in `10-architecture`/`index`.

**Generalisierbarkeit:** (a) Die Baseline steht **einmal** (Foundation) — andere Docs referenzieren, statt die Zahl zu wiederholen (SSoT); (b) ein Case-Gate muss auch Doc-Frontmatter-`id:` prüfen, sonst driften ids unbemerkt; (c) das Link-Gate prüft nur Frontmatter-Relationen und `[]()`, **nicht** inline `[[…]]` — Lücke für tote Wiki-Links; (d) Datei-Umbenennungen sind bei klebrigen Wiki-Links hochriskant → Konvention dokumentieren statt migrieren.

## 2026-09-30 — Baseline repo-weit auf Chrome 150+ vereinheitlicht

**Kontext:** Nach dem 10-architecture-Audit verblieben Baseline-Nennungen „Chrome 148+" außerhalb. Die einzige Baseline ist **Chrome 150+** (Foundation).

**Änderung:** `148+` → `150+` in `20-implementation/README.md`, `20-implementation/din-5008-css-architektur.md` (4×), `30-meta/AI-AGENTS-CLI.md`, `30-meta/DEV-INFO.md:33` und `website/css/layout.css` (Code-Kommentar). Feature-/Recherche-Notizen bewusst unangetastet (`DEV-INFO`-Feature-Tabelle, `web-standards-tracking`, `ROADMAP`-Range, `mcp_research` Temporal-Support), denn das sind **Feature-Ship-Versionen**, keine Projekt-Baseline.

**Verifikation:** keine `148+`-Baseline mehr außerhalb der Feature-Notizen; Gate 100 %.

**Generalisierbarkeit:** Eine Versionszahl in der Doku ist entweder **Projekt-Baseline** (nur Foundation, sonst referenzieren) oder **Feature-Ship-Version** — beides darf nicht vermischt werden. Ein Sweep muss diesen Unterschied pro Zeile treffen, sonst „korrigiert" er Feature-Notizen kaputt.

## 2026-09-30 — Doppelpflege entfernt: Compliance-Matrix + Toast-Guide

**Kontext:** Zwei redundante Dateien: (1) `Architecture-Compliance-Matrix.md` (manuell; Tech-Tabelle ≈ [[Immutable-Law-Catalog]], ADR↔Datei-Zuordnung ≈ generierte `Function-Traceability`/`Code-Referenzen`); (2) `20-implementation/toast-system.md` (Guide, doppelt den ADR + **stale Pfade** `js/toast.js`).

**Änderung:** Matrix-Inhalt („Bekannte Einschränkungen") → Abschnitt 9 in `ADR-OMNITRACEABILITY`; Toast-**Warum** bleibt im `adr-toast-system` (neuer Hinweis: „Wie = Code, kein separater Guide"); beide Dateien gelöscht; Verweise in `10-architecture/README`, `20-implementation/README`, `docs/index.md`, `CLAUDE.md` und Memory nachgezogen. Build: 104 → 102 Docs.

**Verifikation:** Gate 100 %, `imr.js` OK, keine toten Restverweise.

**Generalisierbarkeit:** Eine Datei = eine Rolle; manuelle Matrizen, die generierte Duplizieren, streichen (kein „zweites Wissensmanagement"); das **Wie** gehört in Code/Guide, der ADR hält das **Warum**.

## 2026-09-30 — Traceability-Anker repariert (B) + generierte Artefakte enttrackt (C)

**Kontext:** Code-Annotationen `@adr`/`@guide` zeigten auf **nicht existierende** Doku (`chrome-modern-css`, `din-5008-geometry/-layout/-anschriftfeld`, `ADR-007-Smart-Clipboard-Impressum-Parser`) → die generierten Matrizen hatten unauflösbare Anker. Zudem war `Function-Traceability.md` als generiertes Artefakt getrackt.

**Änderung:** (B) Alle dangling-Annotationen auf existierende Ziele umgebogen: `chrome-modern-css` + `din-5008-*` → `din-5008-css-architektur`; `ADR-007-…` → `ADR-006-Offline-Address-Intelligence` (13 Dateien). (C) `Function-Traceability.md` enttrackt + in `.gitignore` (wie `Code-Referenzen.md`, `import.sql`, `LLM_CONTEXT.md`); READMEs markieren beide als „generiert, nicht versioniert".

**Verifikation:** Gate 100 %, keine dangling-Annotationen mehr.

**Generalisierbarkeit:** Generierte Artefakte **nie** versionieren (Git-Noise bei Zeilenverschiebungen); Traceability-Anker müssen auf existierende Doku zeigen — sonst lügt die Matrix.

## 2026-09-30 — Aufräum-Playbook + Pass über docs/30-meta

**Kontext:** Die wiederkehrende Aufräum-Methodik (Rolle, tote Links, generierte Artefakte, Vokabular, Case, Baseline, stale Pfade, Archiv) war nur implizit; `architecture-drift-audit` prüfte bislang nur Soll/Ist-Drift. Anwendung auf `docs/30-meta`.

**Änderung:** (1) `agent/skills/architecture-drift-audit/references/aufraeum-playbook.md` angelegt (Ablauf, 8 Prüfklassen, Scan-Vorlagen, Ausnahmen, DoD) + Verweis in `SKILL.md`. (2) 30-meta: tote Links repariert (`MASTER-DO-DONT-DEPRECATED`/`MODERNIZATION-GUIDE` → `ADR-ANTIPATTERN`/`web-standards-tracking`; `ADR-PROFILE-MANAGEMENT` → `ROADMAP`; `FEATURE-INVENTORY` + Review-Artefakte entfernt), Baseline-Nennungen auf „Chrome 150+ ([[longevity-guidelines]])" (DEV-INFO 25/109, memory 58), stale `js/00-core/`-Baum in memory an die reale flache `website/js/`-Struktur angepasst.

**Verifikation:** Beweis-Scan 0 ungewollte tote Links (nur `[[schema-v6.json]]`-Anhang, gewollt), Gate 100 %, `imr.js` OK.

**Generalisierbarkeit:** Aufräumen ist ein Standard-Pass mit fester Reihenfolge (**scannen → klassifizieren → fixen → beweisen → protokollieren**) und expliziten Ausnahmen (Code-Fences, Template-Platzhalter, Chronik). Chroniken (`DECISION-LOG`, `90-archive`) werden nie rückwärts „repariert"; eine Klasse pro Commit-Gruppe.

## 2026-09-30 — ADR-Präfix konsolidiert (`ADR-<THEMA>` uppercase)

**Kontext:** Das ADR-Namensschema war gemischt: nummeriert (`ADR-005-Sender-Synchronization`, `ADR-006-Offline-Address-Intelligence`) vs. thematisch-uppercase (`ADR-JS`, `ADR-CSS`, `ADR-HTML`, `ADR-DATA-PERSISTENCE`, `ADR-ANTIPATTERN`, `ADR-OMNITRACEABILITY`) vs. lowercase (`adr-toast-system`).

**Änderung:** 3 Renames auf einheitlich `ADR-<THEMA>` uppercase: `ADR-005-Sender-Synchronization` → `ADR-SENDER-SYNCHRONIZATION`, `ADR-006-Offline-Address-Intelligence` → `ADR-OFFLINE-ADDRESS-INTELLIGENCE`, `adr-toast-system` → `ADR-TOAST-SYSTEM`. Frontmatter-`id` auf kebab (`adr-sender-synchronization`, `adr-offline-address-intelligence`; `adr-toast-system` bleibt). Link-Migration in `10-architecture/README`, `docs/index.md`, `CLAUDE.md`, `website/js/45-address-intelligence.js`, `46-clipboard-address-parser.js` (inkl. `@adr`-Anker, Tabellen, Frontmatter-`doc_links`).

**Verifikation:** Gate 100 %, `imr.js` OK, 0 Rest-Referenzen außer Chronik (`DECISION-LOG`) und dem kebab-`id`.

**Generalisierbarkeit:** Ein Namensschema pro Doc-Typ — ADR = `ADR-<THEMA>` uppercase, `id` immer kebab. Nummern-Präfixe sind Ballast (das Thema trägt die Identität). Bei Rename **Datei + `id` + alle `[[…]]`/`@adr`/`doc_links` gemeinsam** migrieren, sonst driften Anker.

## 2026-09-30 — Link-Gate (D): tote Wikilinks/Frontmatter-Links werden erzwungen

**Kontext:** Der Gate prüfte nur klassische Markdown-Links und `relations:` — inline `[[…]]`-Wikilinks sowie Frontmatter-`doc_links`/`depends_on` waren ungeprüft. Dangling Links (ADR-001/`chrome-modern-css`/`ADR-PROFILE-MANAGEMENT` …) fielen dadurch erst bei manueller Aufräumarbeit auf.

**Änderung:** Neues `tools/links.js` (Muster wie `imr.js`) + Regel `links` (severity **critical**) in `tools/reconciliation.js`. Prüft alle `.md` gegen existierende Datei-Basenames. **Ausnahmen:** Code-Fences, Inline-Code-Spans (`` `[[…]]` `` = Syntax-Beispiel), Template-Platzhalter, Chronik (`DECISION-LOG`/`CHANGELOG`), `docs/90-archive/`, generierte Artefakte, `supersedes` (bewusste Lineage zu ersetzten Alt-Dokumenten). Dabei die verbliebenen echten Toten bereinigt: `CLAUDE.md` (`ADR-PROFILE-MANAGEMENT` → `ROADMAP`), `glossary.md` (Legacy `ADR-API`/`ADR-FEATURE`/`din-5008-geometry` → heutige ADRs), `din-5008-css-architektur.md` (`chrome-modern-css` entfernt), `geoapify-autocomplete.md` (`ADR-GEOAPIFY` → `ADR-OFFLINE-ADDRESS-INTELLIGENCE`).

**Verifikation:** Positiv 100 %; Negativtest (toter `[[…]]`) → `🔴 [CRITICAL] (links)` → 99,88 % / `success=false`.

**Generalisierbarkeit:** Ein Link-Gate muss **Wikilinks UND Frontmatter-Listen** prüfen — relative MD-Links allein genügen nicht. Beispiel-Syntax (Code-Fences/-Spans) und Lineage (`supersedes`) sind legitime Ausnahmen; ohne sie wird das Gate zum Rauschen.

## 2026-09-30 — Repo-Abspeckung (Caches, Research-Dumps, History-Purge)

**Kontext:** Der Ordner wirkte mit 86 MB „fett". Messung entkoppelt die drei Größen:
- **getrackter Inhalt:** nur 3,42 MB (228 Dateien)
- **`.git`-History:** 13 MB, davon ~10 MB **gelöschte Alt-Dumps** (`__wegweisende Beispiele/`, `*_BUNDLED.md`, `latex.pdf`, `aktueller_arbeitsordner/`, `docs/PLATINUM_HANDBOOK.md`) — nur noch in der History
- **gitignorierte lokal-Artefakte:** `.opencode/` 62 MB (opencodes eigener Dep-Baum, **nicht** Repo), `agent/cache/` 7 MB + `build/` 1,6 MB (regenerierbar)

**Änderung:**
1. Lokale Caches `agent/cache/` + `build/` gelöscht (~8,6 MB frei; regenerieren beim Gate).
2. Research-Rohdaten enttrackt + `.gitignore` (~1,1 MB; Dateien bleiben lokal).
3. History per `git filter-repo` von den gelöschten Großdateien + den Research-Dumps befreit, Force-Push (solo-Repo, Backup-Bundle vorher).
4. **Kein** `docs/metadata.json`: der maschinenlesbare Index existiert bereits (`tools/docs_index.js` → `agent/cache/docs_search.db`, abfragbar über MCP `docs_search`) — ein zweites Index-Artefakt wäre genau die Doppelpflege, die wir entfernt haben.

**Verifikation:** getrackt 3,42 → 2,30 MB; `.git` 13 → 4,4 MB; frischer Klon **15 → 7 MB**; Gate 100 %.

**Generalisierbarkeit:** Repo-Größe immer **dreifach getrennt** messen (getrackter Inhalt / `.git`-History / gitignorierte lokale Artefakte) — sonst verwechselt man `node_modules` mit Repo-Ballast. Große Roh-/Binärdaten nie committen (History ist ohne Rewrite unveränderlich); genau **ein** Index-Artefakt je Zweck.
