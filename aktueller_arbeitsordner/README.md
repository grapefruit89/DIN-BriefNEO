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
