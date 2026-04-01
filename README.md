---
title: "DIN-BriefNEO Platinum Master Index"
version: "4.8.0"
status: active
type: "index"
tags:
  - din-briefneo
  - platinum
  - documentation
  - index
aliases:
  - "00_README"
  - "Home"
  - "Master Index"
date_created: 2026-03-31
date_updated: 2026-04-01
---

# 📄 DIN-BriefNEO Platinum (v4.8)

Zentrale Einstiegsseite für die technische Dokumentation und Architektur von DIN-BriefNEO.

---

## 🏗️ Architektur-Überblick

Dieses Diagramm visualisiert das Zusammenspiel der atomaren Komponenten gemäß **ADR-017 (Flat & Pure)**.

```mermaid
graph TD
    subgraph UI_Layer ["UI-Layer (Zero-JS State)"]
        A[index.html] -- "Custom Elements" --> B[02_IMR_Registry]
        B -- "CSS State :has" --> C[style.css]
    end
    
    subgraph Logic_Layer ["Logic-Layer (Pure ES Modules)"]
        D[logic.js] -- "Sanitize/Format" --> E[StateManager]
        F[salutation.js] -- "Etiquette" --> E
    end
    
    subgraph Data_Layer ["Data-Layer (Persistence)"]
        E -- "OPFS / LocalStorage" --> G[engine.js]
    end
    
    UI_Layer <--> Logic_Layer
```

---

## 🗺️ Dokumenten-Landkarte

| Dok # | Dokument | Fokus | Zielgruppe |
|-------|----------|-------|------------|
| 01 | [[01_Architecture_Compliance]] | APIs, Chrome-Versionen, Leitplanken | Architekten |
| 02 | [[issues/#1_IMR_Registry]] | Alle 45+ HTML-Tags & Positionen (SSoT) | Entwickler |
| 03 | [[03_CSS_Reference]] | Detaillierte CSS-Features & Beispiele | Entwickler |
| 04 | [[04_CSS_Quick_Reference]] | Executive Summary der Tech-Highlights | Management |
| 05 | [[05_Feature_Matrix]] | Roadmap, Sprint-Status & Issues | Alle |
| 06 | [[06_Salutation_Engine]] | Logik-Code & Business-Regeln | Entwickler |

---

## 🚀 Platinum Baseline
- **Plattform:** Chrome 147+ (Native APIs only)
- **Architektur:** Flat & Pure (Keine Frameworks, kein UI-State in JS)
- **Compliance:** 100% DIN 5008:2020-03

---

## 🔗 Alle Dokumente (Dataview Query)

```dataview
TABLE subtitle AS "Untertitel", version AS "Version", status AS "Status"
FROM "0"
SORT file.name ASC
```

---

**Gesamtversion:** 4.8 | **Status:** ✅ Stabil | **Letzte Sync:** 2026-04-01
