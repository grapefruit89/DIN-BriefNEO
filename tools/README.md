# Werkzeuge & Automatisierung (`tools/`)

Dieses Verzeichnis enthält die Build-, Test-, Validierungs- und Entwicklungswerkzeuge von **DIN-BriefNEO**.

> **Architektur-Hinweis (Law A45):**
> Die Skripte in `tools/` sind **reine Entwicklungsumgebung**. Sie werden nicht im Browser ausgeliefert. Die eigentliche Webanwendung (`website/`) läuft vollständig autark und hermetisch isoliert.

---

## 1. Übersicht nach Funktionsbereichen

### 🏗️ Kern-Build & Fitness-Gate

Verbindliche Schranken vor jedem Commit (`AGENTS.md` §2).

* **`build_db.js`**
  * **Was es tut:** Führt die Reality Reconciliation durch, prüft Verfassungsinvarianten (z. B. Vorhandensein von `Papierkorb/`) und generiert `docs/STRUCTURE.md` deterministisch.
  * **Aufruf:** `node tools/build_db.js -q` (bzw. `npm run check:fitness`)

* **`reconciliation.js`**
  * **Was es tut:** Die Reality-Reconciliation-Engine. Wertet Metadaten, Link-Integrität, Typisierungen und alle 36 Antipattern-Regeln aus und berechnet den *Evolutionary Fitness Score*.
  * **Aufruf:** `node tools/reconciliation.js --only-rules` (bzw. `npm run check:antipatterns`)

* **`structure-stand.js`**
  * **Was es tut:** Berechnet einen zeitinvarianten SHA-256-Hash über den Rumpf von `docs/STRUCTURE.md`, um Git-Drift zu verhindern.

---

### 🛡️ Architektur- & Verfassungswächter (Gates)

Sichern die Einhaltung der Gesetze aus `Immutable-Law-Catalog.md`.

* **`adr-check.js`**
  * **Was es tut:** Manuelles On-Demand-Audit-Tool. Prüft die Bijektion zwischen `code_links` in den ADRs und realen Dateien in `website/`, Header-Annotationen und Dateizähler.
  * **Aufruf:** `node tools/adr-check.js`

* **`imr.js`**
  * **Was es tut:** Prüft die 45 DIN-Atome, DIN-Geometrien, Zonen, Case-Contract (Kebab-Case) und das kanonische Vokabular gegen `docs/10-architecture/IMR-Registry.md`.

* **`isolation.js`**
  * **Was es tut:** Setzt Law A45 und A38 durch. Prüft, dass kein Pfad aus `website/` herausführt und keine verbotenen Fremd-Hosts geladen werden.

* **`structural-laws.js`**
  * **Was es tut:** AST- und DOM-Prüfung struktureller Gesetze: eindeutige IDs (A42), keine Binär-Radios als Schalter (A57), zyklischer Theme-Toggle (A58), CSS-Tokens (A24) und Verbot von Theme-Variablen auf dem DIN-Blatt (A59).

* **`links.js`**
  * **Was es tut:** Prüft alle Wikilinks `[[...]]`, Frontmatter-Links und `@adr`/`@guide`-Tags gegen existierende Dateien.

* **`lawcoverage.js`**
  * **Was es tut:** Meta-Gate. Stellt sicher, dass Antipattern-Regeln auf echte Gesetze verweisen und keine „toten Sonden“ existieren.

* **`terminology.js`**
  * **Was es tut:** Setzt „Ein Sachverhalt, ein Begriff“ durch. Gleicht Dokumente mit den Begriffspaaren aus `docs/20-implementation/glossary.md` ab.

* **`filematch.js`**
  * **Was es tut:** Geteiltes Glob-to-RegExp-Hilfsmodul für `reconciliation.js` und `lawcoverage.js`.

---

### 🧪 Test-Runner & Diagnose

Prüfen Funktionalität und Browser-Kompatibilität.

* **`test-runner.mjs`**
  * **Was es tut:** Startet einen Headless-Chromium via CDP, führt alle 183 Tests in `test/index.html` aus und wertet sie im Terminal aus.
  * **Aufruf:** `npm test` oder `node tools/test-runner.mjs`

* **`browser.mjs`**
  * **Was es tut:** Erkennt installierte Browser (Helium, Chromium, Google Chrome) plattformübergreifend.

* **`static-server.mjs`**
  * **Was es tut:** Zero-Dependency No-Cache HTTP-Server für lokale Test- und Debug-Läufe.

* **`debug-session.mjs`**
  * **Was es tut:** Startet eine sichtbare Browsersitzung mit flüchtigem Profil (`mkdtemp`) und schneidet Konsole, Netzwerk und Storage-Mutations mit.

* **`testbrief-messung.mjs`**
  * **Was es tut:** Headless-Stochastiktest für Testbrief-Szenarien, Franchises und Hooks.

* **`browser-audit.html`**
  * **Was es tut:** Grafische Oberfläche zur Live-Erkennung moderner CSS/HTML-Features direkt im Browser.

---

### 🌐 Upstream-Recherche & WebMCP

* **`query_chrome_feature.mjs`**
  * **Was es tut:** Fragt die offizielle Chrome Platform Status API (`chromestatus.com`) ab.
  * **Aufruf:** `node tools/query_chrome_feature.mjs "popover"`

* **`check-feature.js`**
  * **Was es tut:** Prüft lokale BCD- und Baseline-Kompatibilität gegen Chrome 150+.

* **`agent_gateway.py`**
  * **Was es tut:** Lokaler WebSocket-Server (Port 8333), um KI-Agenten direkt an offene Tabs in Helium anzudocken.

---

### 📦 Daten- & Schrift-Pipelines

* **`build_plz_data.mjs`**
  * **Was es tut:** Kompiliert 10.184 Postleitzahlen deterministisch nach `website/data/orte.json.gz`.
  * **Aufruf:** `npm run build:data`

* **`build_grosskunden_columnar.mjs`**
  * **Was es tut:** Kompiliert das Behörden- und Firmenverzeichnis nach `website/data/grosskunden.json.gz`.

* **`subset_fonts.py`**
  * **Was es tut:** Extrahiert den exakten DIN-5008-Zeichensatz (Anhang H/F) via `fontTools` in WOFF2-Dateien.

---

### 🚀 Lokale Starter & Umgebungs-Setup

* **`start.sh`** & **`start.bat`**
  * **Was sie tun:** 1-Klick-Starter für Linux (Python HTTP + Helium CDP) bzw. Windows (`dev_server.ps1` + Chrome).

* **`dev_server.ps1`**
  * **Was es tut:** Windows Live-Reload-Webserver auf Port 8088 (reines PowerShell/.NET).

* **`setup-din-home.sh`** & **`setup-din-home.ps1`**
  * **Was sie tun:** Initialisieren das Benutzerverzeichnis `~/.din-briefneo` für Caches und Tools.

---

### 🗄️ Daten- & Konfigurationsdateien im Ordner

* **`antipatterns/` (`base.json`, `web.json`, `project.json`):** Die 36 maschinenlesbaren Scrub-Regeln.
* **`data/plz_states.json`:** Statische Zuordnungstabelle von Postleitzahlen zu Bundesländern als Build-Input.
* **`boilerplate.config.json`:** Konfiguration der aktiven Prüfschichten für das Fitness-Gate.

---

## 2. Was mit den alten Skripten passiert ist (Archiv)

Folgende 7 Altskripte wurden im Zuge der Inventur nach **`Papierkorb/scripts/`** verschoben:

1. `bench_plz_formats.mjs` (V8-Benchmark erledigt, Entscheidung in `ADR-COLUMNAR-DATA.md`)
2. `check-charakter-pipeline.py` (veraltete Pfade auf gelöschte `charactere.json`)
3. `consolidate_all.py` (obsolete Popkultur-Pipeline)
4. `consolidate_characters.py` (obsolete Popkultur-Pipeline)
5. `enrich_data.py` (obsolete Popkultur-Pipeline)
6. `gate.py` (Legacy-Gatekeeper, der archivierte Skripte aufrief)
7. `migrate_figuren_tuples.mjs` (Einmal-Migration auf Tuple-Format v2.1 abgeschlossen)
