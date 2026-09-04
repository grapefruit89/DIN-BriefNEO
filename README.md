# ✉️ DIN-BriefNEO: Pure Refactored Edition

Willkommen im offiziellen Arbeitsverzeichnis von **DIN-BriefNEO (Pure Refactored Edition)**. 

Die wartungsfreie, **100% offline-fähige** Web-App für normkonforme DIN-Briefe.
Keine Frameworks. Keine npm-Abhängigkeiten. Purer nativer W3C-Standard.

👉 **[Jetzt losschreiben!](https://grapefruit89.github.io/DIN-BriefNEO/)**

---

## ⚡ Quick Start

Das Projekt nutzt modernen, nativen W3C-Code (ES-Modules und CSS Layers). Aufgrund von Browser-Sicherheitsrichtlinien (CORS) muss die App zwingend über einen lokalen Webserver gestartet werden, anstatt per `file://`-Protokoll.

1. **App starten (Nutzer):** Ein Doppelklick auf `scripts/start.bat` reicht aus. Es startet ein lokaler Python-Server (auf Port 8088, mit Cache-Busting) im Hintergrund und öffnet die App automatisch im Browser.
2. **Entwickler-Check (Agenten):** Führe das Skript `.\scripts\start.ps1` aus.
   - Dieses Skript prüft den Code (Reconciliation Loop) und stellt sicher, dass der **Fitness Score bei 100%** liegt.
   - Generierte Artefakte (LLM-Kontext, Doku-Datenbank) werden gecacht: sie laufen nur neu, wenn sich ihre Quelldateien seit dem letzten Lauf geändert haben. Der Fitness Gate selbst läuft immer ungecacht. Mit `-Force` lässt sich der volle Durchlauf erzwingen.
3. **Sichtprüfung im echten Chrome:** [`AI-AGENTS-CLI.md`](AI-AGENTS-CLI.md) — DevTools-MCP an die laufende App hängen (A4-Viewport, Sidebar, Anrede, Postvermerk).
4. **Plattform-Recherche (Roadmap):** [`mcp_research.md`](mcp_research.md) — Agent soll nachschauen, ob JS durch HTML/CSS/native APIs ersetzbar ist. Kein Live-Gesetz.

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

👉 **Zur vollständigen [Dokumenten-Landkarte (docs/index.md)](docs/index.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

Root-Kurzguides: [`AI-AGENTS-CLI.md`](AI-AGENTS-CLI.md) (Browser sehen), [`mcp_research.md`](mcp_research.md) (Plattform nachschlagen).

---

## 🧭 Repository-Contract & Agenten-Infrastruktur

- **[`repository.yaml`](repository.yaml)** beschreibt maschinenlesbar, woraus das Repository besteht (Struktur, Entrypoints, offene Punkte). Verbindliche Quelle für Verhaltensregeln bleibt `AGENTS.md`, für Technologie-Regeln der [Immutable Law Catalog](docs/00-foundation/Immutable-Law-Catalog.md) — `repository.yaml` verweist bewusst darauf, statt sie zu duplizieren.
- **[`AI-AGENTS-CLI.md`](AI-AGENTS-CLI.md)** — Chrome DevTools MCP: Agent sieht die laufende App.
- **[`mcp_research.md`](mcp_research.md)** — Roadmap: BCD/chromestatus on demand, nie als zweite Baseline.
- **[`agent/`](agent/)** enthält die Agenten-Infrastruktur, getrennt von `tools/` (den deterministischen Skripten):
  - `agent/skills/repository-operations/SKILL.md` — Entscheidungslogik (wann tue ich was, Discipline/Economy Layer, Plan → Execute → Verify).
  - `agent/skills/web-research/SKILL.md` — Forschungs-Quellenpyramide, Fragetyp-Routing und Evidence-Level fuer technische Recherche.
  - `agent/skills/implement-with-economy/SKILL.md` — HTML-vor-CSS-vor-JS-Entscheidungsleiter fuer Feature-Implementierung, keine externen Abhaengigkeiten ausser den erlaubten A38-Ausnahmen.
  - `agent/skills/architecture-drift-audit/SKILL.md` — periodischer Soll/Ist-Abgleich der Architektur gegen den tatsächlichen Code.
  - `agent/mcp/dinbrief-mcp/` — dünner MCP-artiger STDIO-Server, exponiert `repository.inspect`, `repository.validate` und `repository.execute` (feste Allowlist, keine freie Codeausführung). `execute` verlangt zwingend einen vorherigen Plan-Aufruf, technisch erzwungen über eine an den Repository-Zustand gebundene `plan_id`.

---

## 🤖 KI-Entwicklung (Light Mode vs. Full Mode)

Um Komplexität zu minimieren, nutzen KI-Agenten einen gestuften Workflow:

| Modus | Wann? | Schritte |
|---|---|
| 🟢 **Light Mode** | Bugfixes, kleine Anpassungen | Pre-Build → Änderung → Post-Build (100% Fitness Pflicht!) → Logging (`log_session.js`) |
| 🔴 **Full Mode** | Wichtige Features, Architektur | Wie Light Mode, aber **zusätzlich** ein Architektur-Dokument unter `specs/` anlegen. |

> **Achtung:** Jede Aktion in diesem Projekt muss strikt gegen die [Longevity Guidelines](docs/00-foundation/longevity-guidelines.md) geprüft werden.
