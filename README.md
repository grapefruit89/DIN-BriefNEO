<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Standard-DIN%205008-orange.svg" alt="DIN 5008">
  <img src="https://img.shields.io/badge/Tech-Vanilla%20JS-yellow.svg" alt="Vanilla JS">

  <br><br>

  <h1>✉️ DIN-Brief NEO</h1>
  <h3>Die wartungsfreie, 100% offline-fähige Web-App für normkonforme DIN-Briefe.</h3>

  <p>
    <strong>Keine Frameworks. Keine npm-Abhängigkeiten. Purer nativer W3C-Standard.</strong>
  </p>
</div>

<br>

## 🎯 Über das Projekt

**DIN-Brief NEO** ist eine moderne Neuauflage eines klassischen Brief-Generators. Das Ziel? Eine Web-App, die nicht nach zwei Jahren kaputtgeht, weil sich ein Framework ändert oder npm-Pakete veralten. 

Dieses Projekt verfolgt radikal das **Privacy-First** und **No-Build** Paradigma:
1. **Pixelperfekte Norm:** Der Editor hält sich strikt an den deutschen Standard für Geschäftsbriefe (DIN 5008, Form A und Form B). Falt- und Lochmarken sitzen millimetergenau.
2. **Datenschutz (Privacy First):** Alle Eingaben, Adressen und API-Keys (für die KI-Funktionen) verbleiben lokal in deinem Browser (`localStorage`). Nichts wird an unsere Server gesendet.
3. **Vanilla JS Architektur:** Wir nutzen modernste Browser-Features (Container Queries, ES-Modules, Popover API, CSS Layers), anstatt React, Vue oder Svelte zu laden. Keine Compiler, kein Webpack.

---

## ✨ Features

- 📏 **Echte DIN 5008 Konformität:** Maßstabsgetreue Anzeige des A4-Blattes im Browser (`Form A` & `Form B`).
- 🖨️ **Perfekter PDF-Print:** Angepasstes `@media print` CSS garantiert, dass der ausgedruckte Brief 100% in jedes handelsübliche Fensterkuvert passt.
- 🪄 **LLM Zauberstab (KI-Support):** Markiere Text und lasse ihn per Knopfdruck "förmlich umformulieren" oder von Füllwörtern befreien. *(OpenAI-kompatible API, lokaler Key)*
- 📍 **Adress-Autocomplete:** Schnelle Adresssuche über die Geoapify-API mit Tastaturnavigation.
- 💾 **Offline Drafts:** Der aktuelle Brief wird automatisch als Entwurf gespeichert, sodass beim Neuladen der Seite nichts verloren geht.
- 🛠️ **Dev-Mode Sidebar:** Echtzeit-Diagnose-Tool und LLM-Context-Viewer direkt in der App.

---

## 🚀 Quick Start (Für Nutzer)

Da moderne Browser aus Sicherheitsgründen (CORS) das native Laden von ES-Modulen über das `file://`-Protokoll blockieren, wird ein winziger lokaler Server benötigt.

1. Lade das Repository herunter oder klone es.
2. Gehe in den Ordner `aktueller_arbeitsordner`.
3. Mache einen **Doppelklick auf die `start.bat`** (Windows).
4. Ein lokaler Server startet im Hintergrund und öffnet deinen Browser auf `http://localhost:8000/website/`.

---

## 💻 Für Entwickler & KI-Agenten

Dieses Projekt nutzt eine strikte Dokumentations-Architektur für autonome LLM-Agenten.

### Der OmniTraceability Workflow
Wir haben eine *Function Traceability Matrix* gebaut!
1. Führe als Agent immer zuerst `.\start.ps1` im Arbeitsordner aus.
2. Dieses Skript sammelt alle Architekturentscheidungen (`ADRs`), generiert einen gebündelten System-Prompt (`LLM_CONTEXT.md`) und verifiziert die Fitness der Codebase.
3. Wir arbeiten im **Light Mode** (schnelle Fixes, Logging via `log_session.js`) oder **Full Mode** (neue Specs).

> 👉 **Mehr erfahren?** Schaue in die [Dokumenten-Landkarte](aktueller_arbeitsordner/docs/core/DOCUMENTATION-MAP.md) und in den [Verhaltensvertrag (AGENTS.md)](AGENTS.md).

---

## 🏛️ Die "Wartungsfreiheit auf Lebenszeit" (Longevity)

Die Web-Entwicklung dreht sich immer schneller. Frameworks kommen und gehen. Dieses Projekt ist ein Experiment in extremer Langlebigkeit:

- 🚫 **Keine Node.js Build-Schritte für das Frontend:** Wenn der Browser es nativ kann, nutzen wir es.
- 🚫 **Keine externen CDNs:** Keine Google Fonts, keine Analytics. Alles liegt im `website/` Ordner.
- ✅ **Semantisches HTML & CSS:** Nutzung von `oklch()` Farben, `:has()`, `@scope` und nativen HTML-Attributen wie `popover`.

---

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Es kann frei modifiziert und verwendet werden.
