---
id: index
title: 'DIN-Brief Neo — Zentraler Dokumentations- & Architektur-Hub'
type: meta
status: active
created: '2026-07-03'
updated: '2026-09-30'
tags:
  - din-briefneo
  - din-briefneo/hub
  - status/active
  - type/meta
doc_links:
  - constitution
  - Immutable-Law-Catalog
  - spec
  - longevity-guidelines
  - IMR-Registry
  - ADR-ANTIPATTERN
  - ADR-OMNITRACEABILITY
  - Function-Traceability
  - ADR-OFFLINE-ADDRESS-INTELLIGENCE
  - Salutation-Engine
  - HYBRID-SPEC-DRIVEN-WORKFLOW
code_links:
  - website/index.html
  - website/js/main.js
  - website/css/layout.css
  - 30-meta/AI-AGENTS-CLI.md
error_patterns:
  - hub
  - navigation
  - omnitraceability
  - einstieg
  - übersicht
  - decimal frame
supersedes: []
depends_on: []
---

# DIN-Brief Neo: Zentraler Dokumentations- & Architektur-Hub

> **Willkommen im Dokumentationszentrum von DIN-Brief Neo.**  
> Autarker, serverloser DIN-5008-Briefbogen im Browser (Form A & B) — 100% offline-fähig, null Build-Tools, null externe Laufzeit-Abhängigkeiten, optimiert für Chrome 150+ (Standard-Baseline).

Werkzeug für die Sichtprüfung: **[AI-AGENTS-CLI.md](30-meta/AI-AGENTS-CLI.md)** (Chrome DevTools MCP an die laufende App).

---

## 🏛️ Der 5-stufige Dezimalrahmen

Das gesamte Projektwissen ist streng hierarchisch strukturiert. Tiefere Ebenen dürfen höhere Ebenen niemals verwässern oder außer Kraft setzen.

```
00-foundation/      --> Die unantastbare Verfassung (WAS & WARUM)
10-architecture/    --> Technische Leitplanken, IMR-Registry & ADRs (WIE im Entwurf)
20-implementation/  --> Praktische Guides, 80/20 B2B-Engine & Glossar (WIE im Code)
30-meta/            --> Projektgedächtnis, Tooling & Arbeitsweise (STATUS + WIE gearbeitet wird)
90-archive/         --> Historische Einmal-Artefakte (nicht mehr normativ)
```

---

### 1. [[00-foundation/README|00-foundation — Die Verfassungsebene (Unveränderlich)]]
*Streng schreibgeschützt für Automatismen. Definiert die Existenzberechtigung und Grundrechte des Projekts.*
- **[[constitution]]** ⭐⭐⭐ — 5 Grundrechte (Zero Dependencies, Longevity, Offline-First, Geometry-SSoT, Immutability).
- **[[Immutable-Law-Catalog]]** ⭐⭐⭐ — Normative Gesetzestexte: Stufe 1 (HARD BAN) bis Stufe 3 (FALLBACK).
- **[[spec]]** ⭐⭐⭐ — Fachliche Spezifikation aller Benutzerfunktionen (WAS das Produkt leistet).
- **[[longevity-guidelines]]** ⭐⭐ — 10-Jahres-Technologiekriterien und einzige Browser-Baseline (Chrome 150+).

---

### 2. [[10-architecture/README|10-architecture — Technische Architektur & ADRs]]
*Das technische Fundament: Regelt Geometrie, Datenfluss und architektonische Entscheidungen.*
- **[[IMR-Registry]]** ⭐⭐⭐ — Alleinige Quelle der Wahrheit (SSoT) für alle 45 Custom Tags und DIN-5008-Millimetermaße.
- **[[Immutable-Law-Catalog]]** ⭐⭐⭐ — Alle Verbote und MUST-USE (vor jeder Änderung zwingend lesen!).
- **[[ADR-ANTIPATTERN]]** — 2026-10-02 aufgelöst; enthält nur noch die Umschlüsselung `Abschnitt → Gesetz`.
- **[[ADR-OMNITRACEABILITY]]** ⭐⭐ — Bidirektionale Verknüpfung von Quellcode und Dokumentation.
- **[[Function-Traceability]]** ⭐⭐ — Matrix aller JavaScript-Module und zugeordneter Architekturentscheidungen (generiert, nicht versioniert).
- **Thematische Architektur-Entscheidungen (ADRs):**
  - **[[ADR-HTML]]** — Semantische HTML-Struktur, WYSIWYG & Native Popover Toolbars (integriert ehem. ADR-FEATURE).
  - **[[ADR-CSS]]** — Container Queries, Falzmarken, Viewport-Sizing, oklch (integriert ehem. ADR-BETREFF).
  - **[[ADR-JS]]** — ES-Module, Temporal API, Zero-Framework-Regel.
  - **[[ADR-DATA-PERSISTENCE]]** — localStorage-Souveränität und synchroner Speicher-Manager.
  - **[[ADR-TOAST-SYSTEM]]** — Entkoppeltes Toast-System im Top-Layer.
  - **[[ADR-SENDER-SYNCHRONIZATION]]** — Automatische Absender-Spiegelung (Absenderblock → Rücksendezeile/Maschinenschrift).
  - **[[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]** — 70,5 KB Brotli-Dictionary als Offline-Primärquelle (Tier 1) mit optionalem Online-Fallback.

---

### 3. [[20-implementation/README|20-implementation — Praktische Guides & How-Tos]]
*Konkretes Implementierungswissen für den Quelltext (`website/js/` und `website/css/`).* 
- **[[Salutation-Engine]]** — Anrede-Logik: Neuer 80/20 B2B-Standard, 3 verbindliche Pärchen, Offline-Vornamenerkennung, Adelspartikel und Auto-Reset.
- **[[din-5008-css-architektur]]** — DIN-5008-Layout, Druckvorstufe (@media print) und Container Queries.
- **[[no-scroll-techniques]]** — Zero-Scroll-Garantie: TextFit-Squeezing und A4-Viewport-Anpassung.
- **[[testing-guide]]** — Validierungs-Checklisten für Druckvorschau und responsive Ansichten.
- **[[glossary]]** — Zentrales Projektglossar (Ubiquitous Language von A bis Z).
- **[[README-DB]]** — lokale SQLite/FTS5-Wissensdatenbank für KI-Agenten. Die geparkte Vektorsuche liegt als [[sqlite-vec]] in `30-meta/` (Agenten-Tooling, kein Produktwissen).

---

### 4. [[30-meta/README|30-meta — Projektgedächtnis, Status & Werkzeuge]]
*Historische Protokolle, Statusberichte und Wissensmanagement.*
- **[[DECISION-LOG]]** — die lebende Entscheidungs- und Begründungschronik (append-only). Der alte `CHANGELOG` ist seit 2026-10-02 archiviert.
- **[[DECISION-LOG]]** — 31 KB Master-Log aller Sessions und historischer Kurskorrekturen.
- **[[Feature-Matrix]]** — Übersicht aller Features mit Reifegrad und Status.
- **`docs/30-meta/schema-v6.json`** — das Frontmatter-Schema V6 (Pflichtfelder, erlaubte `type`-Werte), maschinenlesbar und damit die einzige Quelle. Der frühere `OBSIDIAN-SETUP-GUIDE` ist seit 2026-10-02 archiviert.
- **[[tooling-overview]]** — Bestandsaufnahme aller Hilfswerkzeuge im Ordner `tools/`.
- **Vorlagen:** **[[ADR-TEMPLATE]]** (für neue Architektur-Entscheidungen) und **[[GUIDE-TEMPLATE]]** (für neue How-Tos).

---

### 5. [[30-meta/HYBRID-SPEC-DRIVEN-WORKFLOW|30-meta — Entwicklungsprozess]]
*Regelt, WIE am Projekt gearbeitet wird (Verfahrensordnung).*
- **[[HYBRID-SPEC-DRIVEN-WORKFLOW]]** — Der 7-Schritte-Zyklus: Von Spec-Prüfung über Code-Änderung bis zur Dokumentations-Synchronisation.

---

## 🤖 Maschinenlesbare Inventare (SSoT für KI-Agenten)

Lebende Quelle ist die lokal generierte Wissensdatenbank aus `tools/build_db.js`
(plus die generierten `Code-Referenzen.md` / `Function-Traceability.md`) — **nicht**
eingefrorene Snapshots. Die beiden früheren `*_inventory.json` (Stand 2026-09-04)
waren bereits stale und wurden am 2026-10-02 entfernt; siehe [[DECISION-LOG]].

Werkzeug zur Sichtprüfung:
- **[[AI-AGENTS-CLI]]** (`docs/30-meta/AI-AGENTS-CLI.md`) — Chrome DevTools MCP, Sichtprüfung der laufenden App.

---

## 🗄️ Archiv (`docs/90-archive/`)

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
