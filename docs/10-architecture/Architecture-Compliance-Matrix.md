---
id: architecture-compliance-matrix
title: 'Architecture Compliance Matrix (IMR 4.0 Standard)'
type: reference
status: active
created: '2026-07-03'
updated: '2026-09-02'
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
  - chrome 148
  - pvp
  - platinum validation
  - architektur leitplanken
supersedes: []
depends_on: []
---

# Architecture Compliance Matrix (IMR 4.0 Standard)

> [!IMPORTANT]
> **Baseline:** Die einzige projektweite Plattformzahl steht in [[longevity-guidelines]]: **Chrome 148+**. Diese Matrix erfindet keine zweite Zahl. Ältere Browser werden explizit nicht unterstützt.

Diese Matrix definiert technologische Leitplanken für DIN-BriefNEO.
Die verbindliche Baseline ist ausschließlich die in den Longevity-Guidelines genannte **Chrome 148+**.

---

### Status-System

- **Aktiv** → Im Code implementiert und aktiv genutzt.
- **Geplant** → Nächste Sprints.
- **Roadmap** → Langfristige Planung.
- **Experimentell** → In Tests, noch nicht produktiv.

---

### 0. Basistechnologie

---

## Implementierungspfade & High-End APIs

| Icon / Name | Pfad / API | Strategie & Best Practice |
| --- | --- | --- |
| Dateisystem | FileSystem Access | Nicht Produktspeicher unter `file://`. Catalog A36. |
| Persistenz | OPFS | Nicht Produktspeicher unter `file://`. Catalog A35. |
| Reaktivität | `Proxy` Objects | Optional; keine zweite DIN-SSoT. |
| Grafik | SVG (inline) | Vektorscharfe Logos. Catalog T4. |
| Performance | `scheduler.postTask()` | Optional für UI-Priorisierung. |
| Events | Custom Events | Kommunikation zwischen Entitäten. |
| Sanitization | Sanitizer API / `setHTML()` | Statt unsicherem `innerHTML`. |
| Edit Context | `EditContext API` | Optional; `contenteditable` bleibt Standard. |
| Print Logic | `@media print` | PDF-Export. |

---

## Bekannte Architektur-Einschränkungen

### 1. IMR & Multi-Page Synchronisation

Die Registry beschreibt das fachliche Modell. Die aktuelle Implementierung synchronisiert über DOM-IDs primär die erste Seite.

- **Auswirkung:** Folgeseiten bekommen Kopfdaten nicht automatisch.
- **Strategie:** Aktuell akzeptabel, Kopfdaten stehen auf Seite 1.

### 2. PDF-Metadaten (Print-to-PDF)

XMP-Metadaten können über `window.print()` nicht in den PDF-Stream.

- **Strategie:** Dateiname über `document.title`.
