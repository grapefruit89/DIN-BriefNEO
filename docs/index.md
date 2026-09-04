---
id: index
title: 'DIN-Brief Neo — Zentraler Dokumentations- & Architektur-Hub'
type: meta
status: active
created: '2026-07-03'
updated: '2026-09-04'
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
  - ADR-006-Offline-Address-Intelligence
  - Salutation-Engine
  - HYBRID-SPEC-DRIVEN-WORKFLOW
code_links:
  - website/index.html
  - website/js/main.js
  - website/css/layout.css
  - AI-AGENTS-CLI.md
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
> Autarker, serverloser DIN-5008-Briefbogen im Browser (Form A & B) — 100% offline-fähig, null Build-Tools, null externe Laufzeit-Abhängigkeiten, optimiert für Chrome 148+ (Standard-Baseline).

Root-Werkzeug für Sichtprüfung: **[AI-AGENTS-CLI.md](../AI-AGENTS-CLI.md)** (Chrome DevTools MCP an die laufende App).

---

## 🏛️ Der 5-stufige Dezimalrahmen

Das gesamte Projektwissen ist streng hierarchisch strukturiert. Tiefere Ebenen dürfen höhere Ebenen niemals verwässern oder außer Kraft setzen.

```
00-foundation/      --> Die unantastbare Verfassung (WAS & WARUM)
10-architecture/    --> Technische Leitplanken, IMR-Registry & ADRs (WIE im Entwurf)
20-implementation/  --> Praktische Guides, 80/20 B2B-Engine & Glossar (WIE im Code)
30-meta/            --> Projektgedächtnis, Decision-Log, Changelog & Tooling (STATUS)
90-policy/          --> Entwicklungsprozess & Arbeitsweise (WIE gearbeitet wird)
```

---

### 1. [[00-foundation/README|00-foundation — Die Verfassungsebene (Unveränderlich)]]
*Streng schreibgeschützt für Automatismen. Definiert die Existenzberechtigung und Grundrechte des Projekts.*
- **[[constitution]]** ⭐⭐⭐ — 5 Grundrechte (Zero Dependencies, Longevity, Offline-First, Geometry-SSoT, Immutability).
- **[[Immutable-Law-Catalog]]** ⭐⭐⭐ — Normative Gesetzestexte: Stufe 1 (HARD BAN) bis Stufe 3 (FALLBACK).
- **[[spec]]** ⭐⭐⭐ — Fachliche Spezifikation aller Benutzerfunktionen (WAS das Produkt leistet).
- **[[longevity-guidelines]]** ⭐⭐ — 10-Jahres-Technologiekriterien und einzige Browser-Baseline (Chrome 148+).

---

### 2. [[10-architecture/README|10-architecture — Technische Architektur & ADRs]]
*Das technische Fundament: Regelt Geometrie, Datenfluss und architektonische Entscheidungen.*
- **[[IMR-Registry]]** ⭐⭐⭐ — Alleinige Quelle der Wahrheit (SSoT) für alle 45 Custom Tags und DIN-5008-Millimetermaße.
- **[[ADR-ANTIPATTERN]]** ⭐⭐⭐ — Das technische Verbotsregister (Vor jeder Änderung zwingend lesen!).
- **[[ADR-OMNITRACEABILITY]]** ⭐⭐ — Bidirektionale Verknüpfung von Quellcode und Dokumentation.
- **[[Function-Traceability]]** ⭐⭐ — Matrix aller JavaScript-Module und zugeordneter Architekturentscheidungen.
- **Thematische Architektur-Entscheidungen (ADRs):**
  - **[[ADR-HTML]]** — Semantische HTML-Struktur, WYSIWYG & Native Popover Toolbars (integriert ehem. ADR-FEATURE).
  - **[[ADR-CSS]]** — Container Queries, Falzmarken, Viewport-Sizing, oklch (integriert ehem. ADR-BETREFF).
  - **[[ADR-JS]]** — ES-Module, Temporal API, Zero-Framework-Regel.
  - **[[ADR-DATA-PERSISTENCE]]** — localStorage-Souveränität und synchroner Speicher-Manager.
  - **[[adr-toast-system]]** — Entkoppeltes Toast-System im Top-Layer.
  - **[[ADR-005-Sender-Synchronization]]** — Automatische Absender-Spiegelung (Absenderblock → Rücksendezeile/Maschinenschrift).
  - **[[ADR-006-Offline-Address-Intelligence]]** — 70,5 KB Brotli-Dictionary als Offline-Primärquelle (Tier 1) mit optionalem Online-Fallback.

---

### 3. [[20-implementation/README|20-implementation — Praktische Guides & How-Tos]]
*Konkretes Implementierungswissen für den Quelltext (`website/js/` und `website/css/`).* 
- **[[Salutation-Engine]]** — Anrede-Logik: Neuer 80/20 B2B-Standard, 3 verbindliche Pärchen, Offline-Vornamenerkennung, Adelspartikel und Auto-Reset.
- **[[din-5008-css-architektur]]** — DIN-5008-Layout, Druckvorstufe (@media print) und Container Queries.
- **[[no-scroll-techniques]]** — Zero-Scroll-Garantie: TextFit-Squeezing und A4-Viewport-Anpassung.
- **[[toast-system]]** — Praktische Nutzung der Benachrichtigungs-API (`showToast`).
- **[[testing-guide]]** — Validierungs-Checklisten für `file:///`, Druckvorschau und responsive Ansichten.
- **[[glossary]]** — Zentrales Projektglossar (Ubiquitous Language von A bis Z).
- **[[README-DB]]** & **[[sqlite-vec]]** — Lokale SQLite/FTS5-Wissensdatenbank und semantische Vektorsuche für KI-Agenten.

---

### 4. [[30-meta/README|30-meta — Projektgedächtnis, Status & Werkzeuge]]
*Historische Protokolle, Statusberichte und Wissensmanagement.*
- **[[CHANGELOG]]** — Chronologische Versionshistorie aller Releases bis v15.0.0.
- **[[DECISION-LOG]]** — 31 KB Master-Log aller Sessions und historischer Kurskorrekturen.
- **[[Feature-Matrix]]** — Übersicht aller Features mit Reifegrad und Status.
- **[[OBSIDIAN-SETUP-GUIDE]]** — Einrichtung des Obsidian-Vaults mit Schema V6, Dataview und Graph-View.
- **[[tooling-overview]]** — Bestandsaufnahme aller Hilfswerkzeuge im Ordner `tools/`.
- **Vorlagen:** **[[ADR-TEMPLATE]]** (für neue Architektur-Entscheidungen) und **[[GUIDE-TEMPLATE]]** (für neue How-Tos).

---

### 5. [[90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW|90-policy — Entwicklungsprozess]]
*Regelt, WIE am Projekt gearbeitet wird (Verfahrensordnung).*
- **[[HYBRID-SPEC-DRIVEN-WORKFLOW]]** — Der 7-Schritte-Zyklus: Von Spec-Prüfung über Code-Änderung bis zur Dokumentations-Synchronisation.

---

## 🤖 Maschinenlesbare Inventare (SSoT für KI-Agenten)

Für automatisierte Audits und Werkzeuge stehen zwei strukturierte JSON-Dateien bereit:
- **`docs/foundation_inventory.json`** — 21 Dokumente aus 00-foundation, 10-architecture und 90-policy mit lückenloser W-Fragelogik.
- **`docs/implementation_and_meta_inventory.json`** — 28 Dokumente aus 20-implementation und 30-meta.

Ausserhalb von `docs/`, im Repository-Root:
- **[`AI-AGENTS-CLI.md`](../AI-AGENTS-CLI.md)** — Chrome DevTools MCP, Sichtprüfung der laufenden App.

---

## ⚡ Eiserne Leitregeln für Entwickler & KI-Agenten

1. **Keine Frameworks / Kein Build-Schritt:** Ausschließlich natives HTML5, modernstes CSS3 und Vanilla JavaScript (.js mit ESM).
2. **Offline- & file:///-Garantie:** Alle Kernfunktionen müssen ohne Webserver und ohne Internetverbindung im lokalen Browser laufen.
3. **Single Source of Truth:** Definitionen existieren an genau einem Ort. Niemals Fakten oder Geometrien in Prompts oder Checklisten duplizieren.
4. **Main-Branch-Only:** Keine Feature-Branches. Alle Änderungen fließen sauber verifiziert direkt in `main`.
