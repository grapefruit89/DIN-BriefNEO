---
aliases:
- Tech Compliance
- Platinum Baseline
- Browser Requirements
- IMR 4.0 Compliance
- Architecture Guidelines
- Chrome 147+ Spec
architecture_style: Pure & Flat
audience:
- developers
- architects
- reviewers
- management
author: '@din-briefneo/core-team'
baseline: Chrome 147+
baseline_version: '147'
category: architecture
code_links: []
created: '2026-07-03'
css_first: true
cssclasses:
- table-stripes
- wide-table
- readable
date_created: 2025-12-01
date_reviewed: 2026-04-01
date_updated: 2026-04-01
depends_on: []
description: Technologische Leitplanken für DIN-BriefNEO mit Chrome 147+ Baseline
doc_links: []
enforcement: PVP (Platinum Validation Pipeline)
id: architecture-compliance-matrix
layout: default
license: Proprietary
maintainer: '@grapefruit89'
next_review: 2026-06-30
permalink: /docs/architecture-compliance/
platform: Web
related:
- issues/#1 DIN 5008 HTML Tag Glossar
- 03_CSS_Reference
- 05_Feature_Matrix
- 06_Salutation_Engine
review_cycle: quarterly
sidebar: docs
status: active
subtitle: Pure & Flat Architecture Guidelines — Platinum Edition
tags:
- din-briefneo
- din-briefneo/architecture
- din-briefneo/compliance
- din-briefneo/platinum
- status/active
- type/specification
- tech/chrome-147
- tech/css
- tech/html
- tech/js
target_browser: Chrome
title: Architecture Compliance Matrix (IMR 4.0 Standard)
type: specification
updated: '2026-07-07'
version: 4.8.0
version_date: 2026-04-01
zero_js_ui: true
---

# 🛠 Architecture Compliance Matrix (IMR 4.0 Standard)

> [!IMPORTANT]
> **Baseline:** Chrome 147+ ist die verbindliche Plattform. Die Platinum Validation Pipeline (PVP) prüft alle Commits gegen diese Baseline. Ältere Browser werden explizit nicht unterstützt.

Diese Matrix definiert die technologischen Leitplanken für DIN-BriefNEO.  
Wir wenden die **Chrome 147+ Baseline** konsequent an, um eine *Pure & Flat Architecture* ohne Legacy-Ballast zu garantieren.

---

### 🚦 Status-System

- ✅ **Aktiv**      → Im Code implementiert und aktiv genutzt.

- 🟡 **Geplant**    → Definitiv in nächsten 2 Sprints (Q2 2026).

- 📋 **Roadmap**    → Langfristige Planung (2026/2027).

- 🧪 **Experimentell** → In Test-Suites aktiv, noch nicht produktiv.

> [!TIP]
> Nutze `npm run check:compliance`, um die Einhaltung dieser Matrix in deinem lokalen Workspace zu verifizieren.

---

### 0. Platinum Basistechnologie (Universell)

---

## 🏗️ Implementierungspfade & High‑End APIs

| Icon / Name          | Pfad / API                     | Strategie & Best Practice |
|----------------------|--------------------------------|---------------------------|
| **Dateisystem**      | FileSystem Access              | Server‑Only: direktes Schreiben auf Disk. `/WICG/file-system-access` |
| **Persistenz**       | OPFS                           | Origin Private File System für High‑Perf State. `/WICG/file-system-access` |
| **Reaktivität**      | `Proxy` Objects                | SSoT (Single Source of Truth) via Proxy Traps. `/tc39/ecma262` |
| **Grafik**           | SVG (inline)                   | Vektorscharfe Logos & Wasserzeichen. `/W3C/SVG2` |
| **Performance**      | `scheduler.postTask()`         | Priorisierung von UI‑Updates. `/WICG/scheduling-apis` |
| **Events**           | Custom Events                  | Kommunikation zwischen Entitäten. `/whatwg/html` |
| **Sanitization**     | Sanitizer API                  | Standardisierte HTML‑Säuberung. `/WICG/sanitizer-api` |
| **Edit Context**     | `EditContext API`              | Direkte Kontrolle über den Input-Stream. `/WICG/edit-context` |
| **Print Logic**      | `@media print`                 | Optimierung für PDF-Export. `/W3C/css-break-3` |

---

## ⚠️ Bekannte Architektur-Einschränkungen

### 1. IMR & Multi-Page Synchronisation

Die **Input Mapping Registry (IMR)** nutzt aktuell `document.querySelector()`, was konzeptionell nur das **erste Vorkommen** eines DIN-Tags im DOM synchronisiert. 

- **Auswirkung:** Auf Folgeseiten (`din-A4` Instanzen > 1) werden IMR-Daten (wie Kopfzeilen oder Absenderdaten) nicht automatisch aktualisiert, wenn sie dort erneut vorkommen.

- **Strategie:** Für die aktuelle Phase ist dies akzeptabel, da Kopfdaten nur auf Seite 1 gedruckt werden. Eine zukünftige Erweiterung auf `querySelectorAll()` mit Page-Index-Mapping ist für das Backlog (v5.0) geplant.

### 2. PDF-Metadaten (Print-to-PDF)

XMP-Metadaten können über den nativen Browser-Druckdialog (`window.print()`) nicht in den PDF-Stream eingebettet werden.

- **Strategie:** Wir nutzen die **OCR-Bridge** (unsichtbarer Textblock im Body) als Primärstrategie für Systeme wie Paperless-ngx. Dateinamen werden via `document.title` manipuliert.

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[issues/#2_Architecture_Compliance_Matrix]] | Technologie-Leitplanken |
| [[issues/#1 DIN 5008 HTML Tag Glossar]] | Alle 45+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.8 | **Letzte Sync:** 2026-04-01

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

---

**Status:** ACTIVE  
**Nächste Überprüfung:** 2026-06-30  
**Verantwortlich:** Lead Systems Architect