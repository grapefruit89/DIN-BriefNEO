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

Die App nutzt modernen, nativen W3C-Code (ES-Modules, externe Boot-Scripts, CSS Layers) und muss deshalb wegen der Browser-CORS-Richtlinien über einen lokalen Webserver gestartet werden — `file://` reicht nicht.

**Als Nutzer (Windows):**
1. Doppelklick auf [`start.bat`](start.bat) — startet den lokalen Webserver (`tools/dev_server.ps1`, Port 8088, mit Cache-Busting) im Hintergrund und öffnet die App automatisch im Browser.
2. Losbriefen. Es wird nichts hochgeladen: Kein Tracking, keine Fonts von Fremdservern, keine Requests ins Netz.

**Als Entwickler / KI-Agent:**
- Linux ohne PowerShell: `node tools/build_db.js` (Fitness-Gate-Einstieg; `tools/reconciliation.js` ist nur ein Modul). Für die App selbst genügt ein beliebiger statischer Webserver auf dem Repo-Root, z. B. `python3 -m http.server 8088` — Aufruf dann unter `http://localhost:8088/website/index.html`.
- Windows/Voller Durchlauf: `.\tools\start.ps1` (gecachte Artefakte, `-Force` erzwingt den vollen Lauf).
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
| Stylesheets | 8 thematisch getrennte CSS-Dateien mit `@layer`-Architektur |
| JavaScript | Native ES-Modules; 2 blockierende Classic-Boot-Scripts (`boot-theme.js` gegen FOUC, `boot-state.js` für Restore) |
| UI-Mechanik | Popover API statt JS-Toggles, `:has()`-Selektoren statt JS-State |
| Farbwelt | Exklusiv OKLCH, semantische Tokens, automatischer Light/Dark-Wechsel via `light-dark()` |
| Storage | `localStorage` für Brief-Entwurf & Einstellungen, kein Backend |
| Sichtprüfung | Echte Chrome-DevTools-MCP-Regressionstests gegen die laufende App |

## 🧪 Verifikation statt Hoffnung

Geändert wird nur, was der Fitness Gate freigibt. Jede Session wird protokolliert (`tools/log_session.js`), jede Architekturentscheidung landet im [Decision-Log](docs/30-meta/DECISION-LOG.md). Regressionstests laufen live gegen die App im echten Chrome (Viewport, Sidebar, Anrede, Postvermerk) — Details in [`AI-AGENTS-CLI.md`](docs/30-meta/AI-AGENTS-CLI.md).

**Unit-Tests (Zero-Dependency):** `test/` enthält einen eigengebauten Mini-Runner (kein Framework, keine npm-Abhängigkeiten) mit Fokus auf den kritischsten Pfad — dem Draft-Sanitizing (XSS-Schutz). Ausführen: `test/index.html` im Browser öffnen (über denselben lokalen Webserver wie die App), Ergebnis erscheint auf der Seite und in der Konsole.

---

## 🗺️ Dokumentation

Das Projekt ist extrem detailliert dokumentiert, um KI-Agenten und Entwicklern einen perfekten Einstieg zu bieten.

👉 **Zur vollständigen [Dokumenten-Landkarte (docs/index.md)](docs/index.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

Root-Kurzguides: [`AI-AGENTS-CLI.md`](docs/30-meta/AI-AGENTS-CLI.md) (Browser sehen), [`mcp_research.md`](docs/30-meta/mcp_research.md) (Plattform nachschlagen).

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

## 📜 Lizenz

DIN-BriefNEO steht unter der [MIT-Lizenz](LICENSE) — frei nutzen, verändern und weitergeben, ohne Gewährleistung. Sicherheitsmeldungen bitte über [Private Vulnerability Reporting](SECURITY.md), nicht als öffentliches Issue.
