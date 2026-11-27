---
id: index
title: "DIN-Brief Neo — Zentraler Dokumentations- & Architektur-Hub"
type: reference
status: active
created: '2026-07-03'
updated: '2026-10-16'
tags:
  - din-briefneo
  - docs
summary: "Dokumentation und Spezifikation für DIN-Brief Neo — Zentraler Dokumentations- & Architektur-Hub."
doc_links:
code_links:
depends_on:
---
# DIN-Brief Neo: Zentraler Dokumentations- & Architektur-Hub

> **Willkommen im Dokumentationszentrum von DIN-Brief Neo.**  
> Autarker, serverloser DIN-5008-Briefbogen im Browser (Form A & B) — 100% offline-fähig, null Build-Tools, null externe Laufzeit-Abhängigkeiten, optimiert für Chrome 150+ (Standard-Baseline).

Werkzeug für die Sichtprüfung: **[AI-AGENTS-CLI.md](meta/AI-AGENTS-CLI.md)** (Chrome DevTools MCP an die laufende App).

---

## 🏛️ Modulare 1:1 Dokumentations-Architektur

Die Dokumentation spiegelt die Struktur der Web-Applikation (`website/`) 1:1 wider, ergänzt um normative Vorgaben, Metadaten und Archiv:

```
docs/
├── norm/        --> Verfassung, Gesetze, DIN 5008 Spezifikation, IMR-Registry & Repository-Schema
├── css/         --> CSS-Architektur, ADR-CSS, B59-Layer-Plan, No-Scroll
├── js/          --> JS-Architektur, ADRs, Laufzeit, Testing, Salutation
├── data/        --> Adress- und Großempfänger-Intelligenz, PLZ-Maintenance
├── fonts/       --> Typografie & Font-Pipeline
├── addons/      --> Erweiterungen (Testbrief-Generator etc.)
├── meta/        --> Projektgedächtnis, DECISION-LOG, BACKLOG, Tooling, Wegweiser
└── archive/     --> Historische Einmal-Artefakte & Alt-Pläne (nicht mehr normativ)
```

---

### 1. `docs/norm/` — Verfassungsebene & Normative Spezifikationen
*Unveränderliche Projektprinzipien, Gesetze und DIN-Standards.*
- **[[constitution]]** ⭐⭐⭐ — Unveränderliche Projektprinzipien und die kanonische Quellenhierarchie.
- **[[Immutable-Law-Catalog]]** ⭐⭐⭐ — Normative Gesetzestexte: Stufe 1 (HARD BAN) bis Stufe 3 (FALLBACK).
- **[[din5008]]** ⭐⭐⭐ — Form A & Form B Bemaßung, Faltmarken, Abstände.
- **[[spec]]** ⭐⭐⭐ — Fachliche Spezifikation aller Benutzerfunktionen (WAS das Produkt leistet).
- **[[IMR-Registry]]** ⭐⭐⭐ — Alleinige Quelle der Wahrheit (SSoT) für alle 45 Custom Tags und Millimetermaße.
- **[[longevity-guidelines]]** ⭐⭐ — 10-Jahres-Technologiekriterien und Browser-Baseline.
- **[[ADR-HTML]]** — Semantische HTML-Struktur, WYSIWYG & Native Popovers.
- **[[ADR-KISS-MINIMAL-JS]]** ⭐⭐⭐ — 80/20-Prinzip, pragmatische FOUC-Toleranz und Minimal-JavaScript.
- **[[ADR-OMNITRACEABILITY]]** ⭐⭐ — Bidirektionale Verknüpfung von Quellcode und Dokumentation.
- **[[glossary]]** — Zentrales Projektglossar (Ubiquitous Language von A bis Z).

---

### 2. `docs/css/` — Stylesheet-Architektur & Drucklayout
*Layout, Druckvorstufe (@media print) und Container Queries (Spiegel zu `website/css/`).*
- **[[ADR-CSS]]** — Container Queries, Falzmarken, Viewport-Sizing, oklch.
- **[[din-5008-css-architektur]]** — DIN-5008-Layout und Druckvorstufe.
- **[[ADR-MESS-SCHLEIFE]]** — Mess-Schleifen-Architektur.
- **[[B59-LAYER-PLAN]]** — B59-Layout-Layering.
- **[[no-scroll-techniques]]** — Zero-Scroll-Garantie: TextFit-Squeezing und A4-Viewport-Anpassung.

---

### 3. `docs/js/` — JavaScript-Architektur & Engines
*Laufzeit, Event-Bus und Business-Logik (Spiegel zu `website/js/`).*
- **[[ADR-JS]]** — ES-Module, Temporal API, Zero-Framework-Regel.
- **[[Salutation-Engine]]** — Anrede-Logik: 80/20 B2B-Standard, 3 verbindliche Pärchen, Offline-Vornamenerkennung.
- **[[datenfluss-und-laufzeit]]** — Datenfluss & Laufzeitverhalten: verifizierter Ist-Stand.
- **[[ADR-EVENT-DRIVEN-ARCHITECTURE]]** — Entkoppelter EventBus und Reaktionskette.
- **[[ADR-DATA-PERSISTENCE]]** — localStorage-Souveränität und synchroner Speicher-Manager.
- **[[ADR-TOAST-SYSTEM]]** — Entkoppeltes Toast-System im Top-Layer.
- **[[ADR-SENDER-SYNCHRONIZATION]]** — Automatische Absender-Spiegelung.
- **[[testing-guide]]** — Validierungs-Checklisten und Testausführung.

---

### 4. `docs/data/` — Address Intelligence & Stammdaten
*Spiegel zu `website/data/`.*
- **[[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]** — 70,5 KB Brotli-Dictionary als Offline-Primärquelle (Tier 1).
- **[[ADR-COLUMNAR-DATA]]** — Spaltenbasiertes Datenformat für High-Speed Scanning.
- **[[grossemfaenger-post-und-rechts-spec]]** — Post- und Rechtsvorgaben für Großempfänger.
- **[[plz-maintenance-and-update-lifecycle]]** — Lifecycle und Updates der PLZ-Daten.

---

### 5. `docs/fonts/` — Typografie & Font-Pipeline
*Spiegel zu `fonts/` und `website/fonts/`.*
- **[[ADR-TYPOGRAPHY]]** — Lokale System- & Subset-Fonts, Schriftgrößen, Schriftschnitte.

---

### 6. `docs/addons/` — Erweiterungen
*Spiegel zu `website/addons/`.*
- **[[testbrief-generator]]** — Erzeugung synthetischer Testbriefe für visuelle Regressionstests.

---

### 7. `docs/meta/` — Projektgedächtnis, Status & Werkzeuge
*Historische Protokolle, Statusberichte und Wissensmanagement.*
- **[[DECISION-LOG]]** — Lebende Entscheidungs- und Begründungschronik (append-only).
- **[[Feature-Matrix]]** — Übersicht aller Features mit Reifegrad und Status.
- **[[AUFGABEN-WEGWEISER]]** — Orientierungshilfe für Entwicklungsaufgaben.
- **`docs/meta/schema-v6.json`** — Frontmatter-Schema V6 (Pflichtfelder, Typen).
- **[[tooling-overview]]** — Bestandsaufnahme aller Hilfswerkzeuge in `tools/`.
- **[[TEMPLATES]]** — Vorlagen für neue Architektur-Entscheidungen und Guides.

---

### 8. `docs/archive/` — Archiv
*Historische Einmal-Artefakte (Reviews, Audits, Snapshots, überholte Pläne).*

Historische Einmal-Artefakte (Reviews, Audits, Snapshots) — nicht Teil des aktiven Doku-Satzes, aber aus Nachvollziehbarkeit behalten:
- `review_grok.md`, `review2_grok.md`, `chatgpt-review-prompt.md` — externe Reviews
- `architecture-drift-audit-2026-08-27.md` — erster Architektur-Drift-Durchlauf
- `FOUNDATION-RESTORATION-PLAN.md`, `PROJECT.md` — abgeschlossene Planungen

---

## ⚡ Eiserne Leitregeln für Entwickler & KI-Agenten

1. **Keine Frameworks / Kein Build-Schritt:** Ausschließlich natives HTML5, modernstes CSS3 und Vanilla JavaScript (.js mit ESM).
2. **Offline-Garantie:** Alle Kernfunktionen müssen **ohne Internetverbindung** laufen — kein CDN, keine Fremd-Fonts, kein Tracking, kein Backend. Ein **lokaler Webserver ist dagegen Voraussetzung** (`<script type="module">` + CSP schliessen `file://` aus, siehe [`README.md`](../README.md) und [[AGENTS]]). „Offline" heisst hier netzunabhängig, nicht serverlos.
3. **Single Source of Truth:** Definitionen existieren an genau einem Ort. Niemals Fakten oder Geometrien in Prompts oder Checklisten duplizieren.
4. **Main-Branch-Only:** Keine Feature-Branches. Alle Änderungen fließen sauber verifiziert direkt in `main`.
