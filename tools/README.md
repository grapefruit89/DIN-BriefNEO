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

## 2. Die 5 Deep Modules

Alle Werkzeuge sind in **5 große, in sich geschlossene Deep Modules** verschmolzen:

### 🚀 `tools/runtime.mjs` — Browser-, Server- & Test-Infrastruktur (~30 KiB)
* **Static Server:** Dual-Root HTTP-Server (Port 8088, no-cache, `/website/`, `/__fonts`, `/__geokey`).
* **Browser Launcher:** Plattformübergreifende Erkennung & Headless-Chromium-Start mit `mkdtemp`-Profil und Port-Warten.
* **CDP-Client:** Minimaler WebSocket- und JSON-RPC-Client für Chromium.
* **Test-Runner:** Führt die gesamte 430-Test-Suite gegen `test/index.html` aus.
* **MCP-Live-Kanal:** Stdio- und SSE-Bridge für Live-Inspektion im Browser.
* **Debug-Session & Seeder:** Interaktives Debugging und Geoapify-Key-Injektion.

### 📐 `tools/measure.mjs` — Geometrie-, Druck- & Messsonden (~22 KiB)
* **Blatt- & Bildschirm-Geometrie:** Millimeter-genaue Messungen aller DIN-Felder via CDP (`measureSheet`).
* **Druck-Emulation:** Geometrie unter `@media print` (`measurePrint`).
* **PDF-Wahrheit:** Seitenanzahl, yMax und Rand-Geometrie aus echten PDFs (`measurePdf`).
* **Testbrief-Generator:** Deterministische Generierung von 300+ Testbriefen ohne Browser (`measureBrief`).
* **TTC & Paint-Timing:** Time-to-Click- und First-Paint-Messungen (`probeTtc`).
* **Pixel-Differenzierung:** PDF-Referenzbriefe für pixelgenaue Vorher/Nachher-Diffs (`diffPixels`).

### 🏛️ `tools/laws.mjs` — Verfassungs- & Architektur-Sonden (~65 KiB)
* **IMR-Registry-Sonde:** Prüft DIN-Zonen, Geometrie und Case-Verträge (`docs/norm/IMR-Registry.md`).
* **Struktur-Gesetze:** A42 (IDs), A57 (Radios), A58 (Theme), A24/A59 (Design-Tokens).
* **Isolations-Sonde:** Gesetze A45 & A38: Hermetische Isolation von `website/`.
* **Link-Integrität:** Frontmatter-, Wikilink- und Dateipfad-Validierung über die gesamte Doku.
* **Terminologie-Sonde:** Einheitliche Begrifflichkeiten gegen `docs/norm/glossary.md`.
* **Law-Coverage-Gate:** Meta-Gate: 100% Abdeckung aller 40 A-Gesetze durch Sonden.
* **ID-Register-Sonde:** Konsistenz aller B- und Gesetz-IDs.

### 🛡️ `tools/fitness.mjs` — Reality Reconciliation & Fitness-Gate (~58 KiB)
* **Reality Reconciliation Score:** Berechnet den Gesamt-Fitness-Score des Repositories (muss 100.0 % clean sein).
* **Antipattern-Prüfung:** Führt layered Checks gegen `tools/antipatterns/*.json` aus (`--only-rules`).
* **Wegweiser-Gate:** Verifiziert `docs/meta/AUFGABEN-WEGWEISER.md` gegen alle realen Pfade (`repo-map`).
* **Dokumentations-Index:** Generiert `docs/STRUCTURE.md` mit aktuellem Stand und Prüfsummen.

### 📦 `tools/content.mjs` — Daten- & Inhalts-Pipelines (~27 KiB)
* **PLZ-Pipeline:** Kompiliert Columnar-JSON nach `website/data/orte.json.gz` mit GeoNames-Import (`plz`).
* **Großkunden-Pipeline:** Kompiliert Großkundenverzeichnis nach `website/data/grosskunden.json.gz` (`grosskunden`).
* **Backlog-Sync:** Synchronisiert und prüft `docs/meta/BACKLOG.md` (`backlog`).
* **Test-Dossier:** Generiert die Gruppen- und Fallübersicht `docs/meta/TEST-DOSSIER.md` (`tests`).
* **Chrome-Feature-Status:** Ground-Truth-Abfrage bei `chromestatus.com` (`feature`).
* **ADR-Drift-Wächter:** Prüft Bijektion, Code-Links, Annotationen und verwaiste Assets (`adr`).

---

## 3. Hilfswerkzeuge & Konfiguration

* **`tools/dev.sh`:** Komfortabler Starter für Dev-Server (Port 8088) und Debug-Browser (Port 9222).
* **`tools/fonts/subset_fonts.py`:** DIN-5008-Font-Subsetting (Inter Variable Font & Schriften).
* **`tools/antipatterns/`:** Layered JSON-Regelsätze (`base.json`, `web.json`, `project.json`).
* **`tools/data/`:** Statische Zuordnungen (`plz_states.json`).
* **`tools/boilerplate.config.json`:** Konfiguration der Fitness-Schichten.
