# Werkzeuge & Automatisierung (`tools/`)

Dieses Verzeichnis enthält die konsolidierten Build-, Test-, Validierungs- und Entwicklungswerkzeuge von **DIN-BriefNEO**.

> **Architektur-Hinweis (Law A45):**
> Die Skripte in `tools/` sind **reine Entwicklungsumgebung**. Sie werden nicht im Browser ausgeliefert. Die eigentliche Webanwendung (`website/`) läuft vollständig autark und hermetisch isoliert.

---

## 1. Zentraler Einstiegspunkt: `tools/din.mjs`

Statt Dutzender verstreuter Einzeldateien gibt es einen kanonischen Einstiegspunkt für Mensch und Agent:

```bash
node tools/din.mjs <bereich> [befehl] [flags]
```

* **`din`** — Zeigt den interaktiven Hilfe-Baum aller Bereiche.
* **`din test`** — Startet die Test-Suite (430 Tests via Headless-Chromium CDP).
* **`din fitness [-q] [--only-rules]`** — Führt das Fitness-Gate aus (muss 100.0 % clean sein).
* **`din laws [all|imr|structure|isolation|links|terms|coverage|ids]`** — Führt die Verfassungs-Sonden aus.
* **`din dev [start|stop|status|live|key]`** — Dev-Server (Port 8088) + Debug-Browser (CDP 9222).
* **`din measure [sheet|print|pdf|brief|ttc|pixel]`** — Geometrie, Druck, PDF-Wahrheit und TTC messen.
* **`din data [plz|grosskunden]`** — Daten-Pipelines ausführen.
* **`din docs [backlog|tests|index]`** — Dokumentations-Tabellen synchronisieren oder prüfen.
* **`din content [feature|adr]`** — Upstream Chrome-Feature abfragen oder ADR-Check.
* **`din tools [--json]`** — Maschinenlesbare Werkzeug-Landkarte für Agenten.

---

## 2. Die 5 Deep Modules (`tools/*/`)

Alle Skripte sind modular in 5 Fachbereiche konsolidiert:

### 🚀 `tools/runtime/` — Browser- & Test-Infrastruktur
* `index.mjs` — Öffentliche Schnittstelle: `startServer`, `findBrowser`, `launch`, `runTests`, `startLive`.
* `browser.mjs` — Plattformübergreifende Chrome/Chromium-Erkennung (`findBrowser()`).
* `static-server.mjs` — Zero-Dependency Dual-Root HTTP-Server (Port 8088, no-cache, `/website/`, `/__fonts`, `/__geokey`).
* `launch.mjs` — Headless-Browser-Starter (`mkdtemp`-Profil, CDP-Port-Warten, automatischer Cleanup).
* `cdp.mjs` — Minimaler WebSocket/JSON-RPC CDP-Client (`findeSeite`, `verbinde`, `evaluate`).
* `runner.mjs` — Test-Runner für `test/index.html` mit Exit-Codes.
* `mcp-live.mjs` — Live-Kanal (stdio + SSE) für In-Browser-Debugging.
* `debug-session.mjs` — Manuelle Debug-Sitzung mit Trace-Aufzeichnung.
* `seed-geoapify.mjs` — Injiziert Geoapify-Schlüssel in das Testprofil.
* `setup-din-home.sh` — Initialisiert `~/.din-briefneo` für Caches.

### 📐 `tools/measure/` — Geometrie- & Drucksonden
* `index.mjs` — Öffentliche Schnittstelle: `measureSheet`, `measurePrint`, `measurePdf`, `measureBrief`, `probeTtc`, `diffPixels`.
* `inpage.js` — Autarke In-Page-Messfunktion für CDP `evaluate_script` (liefert Millimeter-Geometrie).
* `sheet.mjs` — Numerische Blattgeometrie über CDP 9222.
* `print.mjs` — Geometrie unter `@media print` Emulation.
* `pdf.mjs` — PDF-Druckergebnis numerisch auswerten (yMax, Seitenanzahl, Ränder).
* `brief.mjs` — Testbrief-Generator ohne Browser.
* `ttc.mjs` — Time-to-Click und Paint-Timing-Messungen.
* `pixel.mjs` — PDF-Referenzbriefe für Vorher/Nachher-Pixel-Diffs.

### 🏛️ `tools/laws/` — Verfassungs- & Architektur-Sonden
* `index.mjs` — Öffentliche Schnittstelle: `runLaws(names)`.
* `imr.js` — IMR-Registry-Sonde (DIN-Geometrie, Zonen, Case-Contract).
* `structural-laws.js` — Gesetze A42 (IDs), A57 (Radios), A58 (Theme-Toggle), A24/A59 (CSS-Tokens).
* `isolation.js` — Gesetze A45/A38: Hermetische Isolation von `website/`.
* `links.js` — Link-Integrität (Wikilinks, Frontmatter, Tags).
* `terminology.js` — Terminologie-Sonde gegen `docs/norm/glossary.md`.
* `lawcoverage.js` — Meta-Gate: Deckung aller Gesetze durch Sonden.
* `id-register.js` — ID-Register-Sonde (B-Referenzen, Präfixe).
* `scan.mjs` — Geteilte Glob-to-RegExp Hilfsfunktionen (`globToRegExp`, `matchFilePattern`).

### 🛡️ `tools/fitness/` — Reality Reconciliation & Fitness-Gate
* `index.mjs` — Öffentliche Schnittstelle: `runFitness`, `generateStructure`, `runRules`.
* `build_db.js` — Fitness-Gate-Hauptprogramm, generiert `docs/STRUCTURE.md`.
* `reconciliation.js` — Score-Engine, lädt Sonden aus `laws/` und berechnet den Fitness Score.
* `repo-map-check.mjs` — Validiert `docs/meta/AUFGABEN-WEGWEISER.md` gegen reale Dateipfade.
* `structure-stand.js` — SHA-256-Hash-Helfer gegen Git-Drift.

### 📦 `tools/content/` — Daten- & Inhalts-Pipelines
* `index.mjs` — Öffentliche Schnittstelle: `buildPlzData`, `buildGrosskunden`, `syncBacklog`, `generateDossier`, `queryFeature`, `checkAdr`.
* `build_plz_data.mjs` — PLZ-Stammdaten nach `website/data/orte.json.gz` kompilieren.
* `build_grosskunden_columnar.mjs` — Großkunden nach `website/data/grosskunden.json.gz` kompilieren.
* `backlog-sync.mjs` — Synchronisiert `docs/meta/BACKLOG.md`.
* `test-dossier.mjs` — Synchronisiert `docs/meta/TEST-DOSSIER.md`.
* `query_chrome_feature.mjs` — Upstream Chrome-Feature-Status (`chromestatus.com`).
* `adr-check.js` — ADR-Format-, Zähler- und Drift-Check.

---

## 3. Begleitordner

* **`tools/fonts/`:** `subset_fonts.py` (Inter Variable Font & lokale Testschriften dampfen).
* **`tools/oneoff/`:** Archivierte Einmal-Skripte (`check-feature.js`, `og-image.mjs`, `seeder-diff.mjs`).
* **`tools/antipatterns/`:** Layered JSON-Regelsätze (`base.json`, `web.json`, `project.json`).
* **`tools/data/`:** Statische Zuordnungen (`plz_states.json`).
* **`tools/dev.sh`:** Komfortabler Shell-Starter für Linux.
* **`tools/boilerplate.config.json`:** Konfiguration der Fitness-Schichten.
