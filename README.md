<p align="center">
  <img src="envelope.svg" width="72" alt="DIN-BriefNEO Umschlag-Logo">
</p>

<h1 align="center">DIN-BriefNEO — Pure Refactored Edition</h1>

<p align="center">
  Die wartungsfreie, <strong>100 % offline-fähige</strong> Web-App für normkonforme DIN-Briefe.<br>
  Keine Frameworks. Keine npm-Abhängigkeiten. Purer nativer W3C-Standard.
</p>

<p align="center">
  👉 <a href="https://grapefruit89.github.io/DIN-BriefNEO/"><strong>Jetzt losschreiben!</strong></a> 👈
</p>

---

## ⚡ Quick Start

Die App nutzt modernen, nativen W3C-Code (ES-Modules, isoliertes Boot-Script, natives CSS) und muss deshalb wegen der Browser-CORS-Richtlinien über einen lokalen Webserver gestartet werden — `file://` reicht nicht.

**Als Nutzer (Windows):**
1. Doppelklick auf [`start.bat`](start.bat) — startet den lokalen Webserver (`tools/dev_server.ps1`, Port 8088, mit Cache-Busting) im Hintergrund und öffnet die App automatisch im Browser.
2. Losbriefen. Es wird nichts hochgeladen: Kein Tracking, keine Fonts von Fremdservern, keine Requests ins Netz.

**Als Entwickler / KI-Agent:**
- Linux: `node tools/build_db.js` (Fitness Gate + Index-Generierung). Lokaler Server via `./start.sh` oder `python3 -m http.server 8088`.
- Windows: `node tools/build_db.js` (Fitness Gate). Lokaler Server via `start.bat`.
- Der **Fitness Score muss 100 % betragen** — vor und nach jeder relevanten Änderung.
- Bindender Verhaltensvertrag: [`AGENTS.md`](AGENTS.md).

---

## 🏛️ Philosophie: Wartungsfreiheit auf Lebenszeit

Dieses Projekt bricht radikal mit der Kurzlebigkeit moderner Web-Frameworks. Wir vertrauen zu 100 % auf native, standardisierte W3C/WHATWG-Schnittstellen — mit dem Ziel einer Überlebensspanne von vielen Jahren ohne eine einzige Zeile Wartungsaufwand.

- 🚫 **Keine Frameworks:** Weder React, noch Vue, noch Svelte.
- 🚫 **Keine Compiler/Build-Tools:** Weder Webpack, noch Babel, noch Sass.
- 🚫 **Keine externen Abhängigkeiten:** Keine CDNs, keine Google Fonts, vollständige Offline-Autarkie (Privacy-first).
- 🚫 **Kein Inline-Code:** Null Inline-CSS, null Inline-JS — nur externe Dateien.
- 🚫 **Keine kurzlebigen APIs:** Kein `new Date()` (stattdessen Temporal), keine Legacy-Selektoren, keine veralteten Event-Muster.
- ✅ **Native Standards:** Container Queries, Popover API, CSS `light-dark()`, CSS Layers, Selection/Range API.

## 🎨 Technologie-Stand (2026-09)

| Bereich | Umsetzung |
|---|---|
| Browser-Baseline | Chrome 150+ (aktuellste Empirie schlägt Baseline-Daten — live geprüft via `CSS.supports()`) |
| Stylesheets | 4 thematisch getrennte CSS-Dateien (`base.css`, `sidebar.css`, `sheet.css`, `print.css`) |
| JavaScript | Native ES-Modules; 1 blockierendes Classic-Boot-Script (`boot-theme.js` gegen FOUC), Restore via `DraftManager` in `document.js` |
| UI-Mechanik | Popover API statt JS-Toggles, `:has()`-Selektoren statt JS-State |
| Farbwelt | Exklusiv OKLCH, semantische Tokens, automatischer Light/Dark-Wechsel via `light-dark()` |
| Storage | `localStorage` für Brief-Entwurf & Einstellungen, kein Backend |
| Sichtprüfung | Echte Chrome-DevTools-MCP-Regressionstests gegen die laufende App |

## 🧪 Verifikation statt Hoffnung

Geändert wird nur, was der Fitness Gate freigibt. Jede Session wird protokolliert (`tools/log_session.js`), jede Architekturentscheidung landet im [Decision-Log](docs/30-meta/DECISION-LOG.md). Regressionstests laufen live gegen die App im echten Chrome (Viewport, Sidebar, Anrede, Postvermerk) — Details in [`AI-AGENTS-CLI.md`](docs/30-meta/AI-AGENTS-CLI.md).

**Unit-Tests (Zero-Dependency):** `test/` enthält einen eigengebauten Mini-Runner (kein Framework, keine npm-Abhängigkeiten). Ausführen:

```bash
node tools/test-runner.mjs              # headless, Exit-Code 0/1
node tools/test-runner.mjs --json      # maschinenlesbar
node tools/test-runner.mjs --filter=Salutation
```

Der Runner startet seinen eigenen HTTP-Server mit `Cache-Control: no-store` (kein `?v=`-Hochzählen mehr), findet Chromium über `CHROME_BIN` oder im Standardpfad und liest `window.__TEST_RESULTS` per CDP aus. Ohne Browser: `--allow-missing-browser` (Exit 0 mit SKIP). Alternative ohne CLI: `test/index.html` über den lokalen Webserver öffnen.

**Debug-Sitzung (Virgin-State + Aufzeichnung):**

```bash
node tools/debug-session.mjs            # sichtbares Fenster, App, CDP auf 9222
node tools/debug-session.mjs --test     # sichtbar, aber test/index.html
node tools/debug-session.mjs --headless # ohne Fenster
```

Frisches Profil pro Start (wird beim Beenden gelöscht), Server ohne Cache, CDP-
und DevTools-URL stehen im Terminal. Konsole, Netzwerk, `din_draft`-Änderungen
und Exceptions werden mitgeschnitten und beim Beenden als
`test/traces/session-<Datum>.json` abgelegt.

---

## 🗺️ Dokumentation

Das Projekt ist extrem detailliert dokumentiert, um KI-Agenten und Entwicklern einen perfekten Einstieg zu bieten.

👉 **Zur vollständigen [Dokumenten-Landkarte (docs/index.md)](docs/index.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

Für den Einstieg **ohne Dateisuche**: [Architecture-Map](docs/10-architecture/ARCHITECTURE-MAP.md) — Lade-Trigger, Modul-Abhängigkeiten und CSS-Kaskade auf einer Seite.

Root-Kurzguides: [`AI-AGENTS-CLI.md`](docs/30-meta/AI-AGENTS-CLI.md) (Browser sehen), [`mcp_research.md`](research/mcp_research.md) (Plattform nachschlagen).

## 🧭 Repository-Contract & Agenten-Infrastruktur

- **[`repository.yaml`](repository.yaml)** beschreibt maschinenlesbar, woraus das Repository besteht (Struktur, Entrypoints, offene Punkte). Verbindliche Quelle für Verhaltensregeln bleibt `AGENTS.md`, für Technologie-Regeln der [Immutable Law Catalog](docs/00-foundation/Immutable-Law-Catalog.md) — `repository.yaml` verweist bewusst darauf, statt sie zu duplizieren.
- **[`agent/`](agent/)** enthält die Agenten-Infrastruktur, getrennt von `tools/` (den deterministischen Skripten):
  - `agent/skills/repository-operations/SKILL.md` — Entscheidungslogik (wann tue ich was, Discipline/Economy Layer, Plan → Execute → Verify).
  - `agent/skills/web-research/SKILL.md` — Forschungs-Quellenpyramide, Fragetyp-Routing und Evidence-Level für technische Recherche.
  - `agent/skills/implement-with-economy/SKILL.md` — HTML-vor-CSS-vor-JS-Entscheidungsleiter für Feature-Implementierung, keine externen Abhängigkeiten außer den erlaubten A38-Ausnahmen.
  - `agent/skills/architecture-drift-audit/SKILL.md` — periodischer Soll/Ist-Abgleich der Architektur gegen den tatsächlichen Code.
  - `agent/mcp/dinbrief-mcp/` — dünner MCP-artiger STDIO-Server, exponiert `repository.inspect`, `repository.validate` und `repository.execute` (feste Allowlist, keine freie Codeausführung). `execute` verlangt zwingend einen vorherigen Plan-Aufruf, technisch erzwungen über eine an den Repository-Zustand gebundene `plan_id`.

## 🤖 KI-Entwicklung (Light Mode vs. Full Mode)

Um Komplexität zu minimieren, nutzen KI-Agenten einen gestuften Workflow:

| Modus | Wann? | Schritte |
|---|---|---|
| 🟢 **Light Mode** | Bugfixes, kleine Anpassungen | Pre-Build → Änderung → Post-Build (100 % Fitness Pflicht!) → Logging (`log_session.js`) → Decision-Log |
| 🔴 **Full Mode** | Wichtige Features, Architektur | Wie Light Mode, aber **zusätzlich** ein Architektur-Dokument unter `specs/` anlegen. |

> **Achtung:** Jede Aktion in diesem Projekt muss strikt gegen die [Longevity Guidelines](docs/00-foundation/longevity-guidelines.md) geprüft werden.

## 📮 PLZ- und Adressdaten

DIN-BriefNEO verfügt über ein integriertes, 100 % offlinefähiges Postleitzahlen- und Adressverzeichnis (`website/data/`), das beim ersten Tastendruck im Browser per nativer Streaming-Dekomprimierung (`DecompressionStream`) in < 1 ms geladen wird.

### 1. Quellen & Lizenzen
- **GeoNames** ([`export/zip/DE.zip`](https://download.geonames.org/export/zip/DE.zip), CC BY 4.0) – Primäre Ortsebene (Postleitzahlen bundesweit).
- **service.bund.de** ([Anschriftenverzeichnis des Bundesverwaltungsamts](https://www.service.bund.de/SharedDocs/CSV/Anschriftenverzeichnis-JSON.json?__blob=publicationFile), DL-DE-BY 2.0) – Alle Bundesbehörden, Ministerien, Ämter und Bundesgerichte.
- **Amtsgraph** ([`places_courts.jsonl`](https://huggingface.co/datasets/SNTIQ-Team/amtsgraph), CC BY-NC-SA 4.0) – Amtliche Zustell-PLZs und Gerichtsbezirke (rein zur Validierung und Konsistenzsicherung verwendet; nicht-kommerzielle Nutzung).
- **Großkunden-Verzeichnis** (Kuratierter Datenbestand aus Wikipedia-Großempfängern und Zauberware) – DAX-Konzerne, Großunternehmen, Universitäten und Institutionen.
- **Stadtteil-Verzeichnis** (`website/data/de_districts.json.gz`) – Enthält 304 Stadtteil-Zuordnungen für Ballungsräume (z. B. Bonn, Berlin, Köln). Dient als lokaler Anzeige-Bonus, stellt keine flächendeckende Abdeckung dar.

### 2. Datenstruktur (`website/data/`)
- `orte.json.gz` (68 KB gzip, 10.184 Einträge, 0 Firmen):
  ```json
  { "01053": "Dresden", "53111": "Bonn" }
  ```
- `bundesbehoerden.json.gz` (17 KB gzip, 498 PLZs, 1.800 Dienststellen):
  ```json
  {
    "11011": { "name": "Deutscher Bundestag", "city": "Berlin", "typ": "Behörde" },
    "97209": { "name": "10. Panzerdivision", "city": "Veitshöchheim", "typ": "Behörde", "all_names": ["10. Panzerdivision", "Bundeswehr-Dienstleistungszentrum Veitshöchheim", "Bundeswehrfachschule Würzburg"] }
  }
  ```
- `grosskunden.json.gz` (55 KB gzip, 2.732 Einträge):
  ```json
  {
    "01053": { "name": "Commerzbank AG", "city": "Dresden", "typ": "Firma" },
    "80920": { "name": "OSRAM GmbH", "city": "München", "typ": "Firma" }
  }
  ```

### 3. Wichtiger Hinweis zu Sonder-PLZs
`orte.json.gz` enthält **10.184 PLZs** – bestehend aus 8.158 amtlichen Gemeinde-/Zustell-PLZs und 2.026 bereinigten Sonder-PLZs (Postfächer und Großkunden mit reinem Ortsbezug). Sämtliche 642 Firmen-, Behörden- und Institutionsnamen wurden strikt aus `orte.json.gz` entfernt und in `grosskunden.json.gz` sowie `bundesbehoerden.json.gz` konsolidiert. Wenn ein Empfänger eine Großkunden- oder Postfach-PLZ besitzt, wird der korrekte Ortsname (z. B. `01053` → `Dresden`) automatisch aufgelöst, während der Firmenname separat im Firmenfeld platziert wird.

### 4. Automatisierter Update-Workflow
- **Zeitplan:** Vollautomatisch jeden 1. des Monats um 03:00 UTC via GitHub Actions ([`.github/workflows/update_plz_data.yml`](.github/workflows/update_plz_data.yml)).
- **Manuell:** Unter *Actions* → `update_plz_data` → `Run workflow`.
- **Validierungs-Gates:** Das Erstellungsskript ([`tools/build_plz_databases.py`](tools/build_plz_databases.py)) prüft vor jedem Commit strikt auf korrekte PLZ-Längen, vollständige Ortsnamen, 0 Firmen in der Ortsspalte und 0 UTF-8-Mojibake. Schlägt ein Gate fehl, bricht die Pipeline mit Fehler ab – **es wird kein fehlerhafter Stand committet**.
- **Deterministische Hashes:** Durch `mtime=0` und `sort_keys=True` entstehen bei unveränderten Upstream-Quellen keine Git-Diffs.

## 📜 Lizenz

DIN-BriefNEO steht unter der [MIT-Lizenz](LICENSE) — frei nutzen, verändern und weitergeben, ohne Gewährleistung. Sicherheitsmeldungen bitte über [Private Vulnerability Reporting](SECURITY.md), nicht als öffentliches Issue.
