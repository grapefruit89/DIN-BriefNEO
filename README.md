---
title: "DIN-BriefNEO: Pure Refactored Edition"
status: active
tags: [documentation, readme]
---

# ✉️ DIN-BriefNEO: Pure Refactored Edition

Willkommen im offiziellen Arbeitsverzeichnis von **DIN-BriefNEO (Pure Refactored Edition)**. 

Die wartungsfreie, **100% offline-fähige** Web-App für normkonforme DIN-Briefe.
Keine Frameworks. Keine npm-Abhängigkeiten. Purer nativer W3C-Standard.

👉 **[Jetzt losschreiben!](https://grapefruit89.github.io/DIN-BriefNEO/)**

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

👉 **Zur vollständigen [Dokumenten-Landkarte (docs/index.md)](docs/index.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

---

## 🤖 KI-Entwicklung (Light Mode vs. Full Mode)

Um Komplexität zu minimieren, nutzen KI-Agenten einen gestuften Workflow:

| Modus | Wann? | Schritte |
|---|---|---|
| 🟢 **Light Mode** | Bugfixes, kleine Anpassungen | Pre-Build → Änderung → Post-Build (100% Fitness Pflicht!) → Logging (`log_session.js`) |
| 🔴 **Full Mode** | Wichtige Features, Architektur | Wie Light Mode, aber **zusätzlich** ein Architektur-Dokument unter `specs/` anlegen. |

> **Achtung:** Jede Aktion in diesem Projekt muss strikt gegen die [Longevity Guidelines](docs/00-foundation/longevity-guidelines.md) geprüft werden.
