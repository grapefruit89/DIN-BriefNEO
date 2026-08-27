---
id: architecture-compliance-matrix
title: 'Architecture Compliance Matrix (IMR 4.0 Standard)'
type: reference
status: active
created: '2026-07-03'
updated: '2026-07-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/reference
doc_links:
  - IMR-Registry
  - ADR-ANTIPATTERN
  - constitution
  - longevity-guidelines
code_links: []
error_patterns:
  - compliance matrix
  - platinum baseline
  - imr 4.0
  - chrome 147
  - pvp
  - platinum validation
  - architektur leitplanken
supersedes: []
depends_on: []
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