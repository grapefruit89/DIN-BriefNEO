---
# === BASISINFORMATIONEN ===
title: "Salutation & Logic Engine Matrix (IMR 4.0 Standard)"
subtitle: "Business Logic Architecture for DIN-BriefNEO"
description: "Architektur der Geschäftslogik mit klarer Trennung zwischen Datenverarbeitung (Engine) und Darstellung (UI-Bridge)"
version: "9.5.0"
version_date: 2026-03-31
status: active
compliance: "100% DIN 5008:2020-03"

# === DOKUMENT-TYP ===
type: implementation
category: business-logic
audience:
  - developers
  - implementers
  - testers
  - ai-agents

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/engine
  - din-briefneo/logic
  - din-briefneo/salutation
  - status/active
  - type/implementation
  - tech/temporal
  - tech/sanitizer-api
  - tech/proxy
  - tech/opfs

# === ALIASES ===
aliases:
  - "06_Salutation_Engine"
  - "Salutation Engine"
  - "Logic Engine"
  - "Business Logic"
  - "Engine Matrix"
  - "IMR 4.0 Engine"

# === DATAVIEW Felder ===
modules:
  engine: "State & Persistence"
  logic: "Business Logic & Markdown"
  salutation: "Etiquette & Anrede"
test_coverage_engine: 85
test_coverage_logic: 90
test_coverage_salutation: 95
performance_state_update: "2.1ms"
performance_markdown_parse: "28ms"
performance_iban_validate: "0.3ms"
performance_title_extract: "0.2ms"

# === VERWANDTE DOKUMENTE ===
related:
  - "01_Architecture_Compliance"
  - "02_IMR_Registry"
  - "03_CSS_Reference"
  - "05_Feature_Matrix"

# === ZEITSTEMPEL ===
date_created: 2025-10-01
date_updated: 2026-03-31
date_last_deployed: 2026-03-31

# === AUTOR ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"

# === GITHUB ===
npm_package: "@din-briefneo/salutation-engine"
github_repo: "din-briefneo/salutation-engine"
ci_status: "passing"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - wide-table
  - code-wrap

# === GITHUB PAGES ===
permalink: /docs/salutation-engine/
layout: default
---

# Salutation & Logic Engine Matrix (IMR 4.0 Standard)

> [!NOTE]
> Die Salutation Engine ist vollständig von der UI entkoppelt (ADR-017). Änderungen in `salutation.js` haben keinen Einfluss auf das visuelle Rendering.

> [!TIP]
> Für neue Anrede-Formate: Erweitere einfach die `TITLES`-Liste in `salutation.js` – die Engine priorisiert automatisch längere Titel.

Diese Matrix definiert die Architektur der Geschäftslogik für DIN-BriefNEO.  
Sie folgt dem **Flat & Pure Architecture [ADR-017]** Prinzip: Klare Trennung zwischen Datenverarbeitung (Engine) und Darstellung (UI-Bridge).

---

## 📌 Quick Links

| Bereich | Link |
|---------|------|
| 📖 **Dokumentation** | [Wiki](https://github.com/din-briefneo/salutation-engine/wiki) |
| 🐛 **Issues** | [Issues](https://github.com/din-briefneo/salutation-engine/issues) |
| 🔄 **CI/CD** | [Actions](https://github.com/din-briefneo/salutation-engine/actions) |
| 📊 **Test Coverage** | [Coverage Report](https://din-briefneo.github.io/salutation-engine/coverage/) |
| 📦 **npm Package** | [npm](https://www.npmjs.com/package/ @din-briefneo/salutation-engine) |

---

## 🚦 Status Badges

![Version](https://img.shields.io/badge/version-9.5--platinum-blue)
![Build](https://img.shields.io/github/actions/workflow/status/din-briefneo/salutation-engine/ci.yml?branch=main)
![Coverage](https://img.shields.io/codecov/c/github/din-briefneo/salutation-engine)
![License](https://img.shields.io/github/license/din-briefneo/salutation-engine)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## 🧠 Engine Architecture (The Core Three)


| Modul | Rolle | Fokus-Technologie | Strategischer Vorteil |
|-------|-------|-------------------|----------------------|
| **`engine.js`** | Der Verwalter | `Proxy` State + `localStorage` / `OPFS` | Reaktive SSoT mit Zero-Setup-Persistenz |
| **`logic.js`** | Der Handwerker | `Temporal` API + `Sanitizer` API | Robuste Date-Arithmetik und sicheres Markdown |
| **`salutation.js`** | Der Etikette-Experte | Pattern Matching & Sorting | Intelligente Anreden mit automatischer Titel-Priorisierung |

---

## 📋 Logik- & Validierungs-Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Markdown** | Zero-Width Ghosting Pattern | `logic.js` | Erhält Markdown-Marker für Editierbarkeit ohne Layout-Shift |
| **Zeit/Datum** | `Temporal.Now.plainDateISO()` | `logic.js` | Eliminiert Legacy `Date()`-Bugs bei Zeitzonen |
| **Adress-Check** | 6-Zeilen-Validierung | `logic.js` | DIN 5008: max. 6 Zeilen im Anschriftfeld |
| **IBAN-Check** | Modulo-97 (`BigInt`) | `logic.js` | Mathematisch korrekte Prüfziffernvalidierung |
| **Rücksendung** | Interpunktion-Generator | `logic.js` | DIN 5008: Einzeilige Rücksendezeile mit Mittelpunkten |

---

## 🎩 Salutation & Etiquette Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Titel-Scan** | Greedy Regex Matching (priorisiert Länge) | `salutation.js` | Erkennt "Prof. Dr." vor "Dr." – robust gegen Mehrfach-Titel |
| **Anrede-Stil** | 3‑stufiger Formality‑Switch | `salutation.js` | Formal / Modern (Guten Tag) / Locker (Hallo) |
| **Firmen-Fall** | Co‑Presence Detection | `salutation.js` | Erkennt "Firma ohne Person" → neutrale Anrede |
| **Grußformel** | Smart‑Default Generator | `salutation.js` | Passende Abschlüsse (Beste Grüße vs. Mit freundlichen Grüßen) |
| **DIN-Fehler** | Punctuation Validator | `salutation.js` | DIN 5008: Warnt bei Komma/Punkt nach Grußformel |

---

## 💻 Source Code (Platinum Edition)

### `engine.js` – State & Persistence

...

### `logic.js` – Business Logic & Constants

```javascript
/**
 * logic.js — Unified Business Logic & Constants (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * @module logic
 */

/* ── CONSTANTS & REGISTRY ──────────────────────────────────── */

> [!NOTE]
> Die IMR (Input Mapping Registry) wird zentral in der [[02_IMR_Registry]] gepflegt. Der folgende Code-Auszug dient der technischen Referenz innerhalb der Engine-Logik.

/**
 * IMR (Input Mapping Registry) – definiert die bidirektionale Bindung
...
  { tag: "din-falz-unten", key: "guides_fold_bottom", internal: true },
]);

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

```dataview
TABLE 
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
```


/* ── MARKDOWN PARSER ────────────────────────────────────────── */
...
