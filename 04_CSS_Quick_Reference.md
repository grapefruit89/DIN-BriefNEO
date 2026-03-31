---
# === BASISINFORMATIONEN ===
title: "CSS Quick Reference — Platinum Edition"
subtitle: "At a Glance: All CSS Features"
description: "Kurze Übersicht aller CSS-Features mit Status und Chrome-Version – für schnelles Nachschlagen"
version: "1.0.0"
version_date: 2026-03-31
status: active

# === DOKUMENT-TYP ===
type: quick-reference
category: css
audience:
  - stakeholders
  - developers
  - project-managers

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/css
  - din-briefneo/quick-reference
  - status/active
  - type/quick-reference

# === ALIASES ===
aliases:
  - "04_CSS_Quick_Reference"
  - "CSS Quick Reference"
  - "CSS Cheat Sheet"
  - "CSS Overview"
  - "Platinum CSS Summary"

# === DATAVIEW Felder ===
css_features_active: 28
css_features_planned: 12
css_features_experimental: 5
baseline_version: "Chrome 147+"

# === VERWANDTE DOKUMENTE ===
related:
  - "03_CSS_Reference"

# === ZEITSTEMPEL ===
date_created: 2026-03-31
date_updated: 2026-03-31

# === AUTOR ===
author: "@din-briefneo/core-team"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - compact

# === GITHUB PAGES ===
permalink: /docs/css-quick-reference/
layout: default
---

# 📊 CSS Capability Matrix (Platinum Summary)

Kompakte Übersicht des technologischen Standards von DIN-BriefNEO. Detaillierte Erklärungen finden sich im [[03_CSS_Reference]].

---

## 🎯 Kern-Status (Top-Features)

| Kategorie | Feature | Status | Chrome |
|-----------|---------|--------|--------|
| **Logik** | Zero-JS State Management (`:has`) | ✅ Aktiv | 105+ |
| **Logik** | Native Theme-Engine (`light-dark`) | ✅ Aktiv | 123+ |
| **Architektur** | Kaskaden-Management (`@layer`) | ✅ Aktiv | 99+ |
| **Präzision** | Millimeter-Mathematik (`@property`, `round`) | ✅ Aktiv | 129+ |
| **Resilience** | Overflow-Alarm (`@container scroll-state`) | ✅ Aktiv | 147+ |
| **Eingabe** | Auto-Resize Inputs (`field-sizing`) | ✅ Aktiv | 129+ |
| **Design** | Perzeptive Farben (`oklch`, `color-mix`) | ✅ Aktiv | 111+ |

---

## 📋 Roadmap Highlights (Q2-Q4 2026)

- 🟡 **Seitenumbrüche:** Native CMA-Sensorik für Multi-Page Layouts.
- 🟡 **CSS-Isolation:** Einführung von `@scope` für Paper-spezifische Stile.
- 📋 **Zero-JS Interaktion:** Umstellung auf `Invoker Commands` und `interesttarget`.
- 📋 **Adaptive UI:** `anchor-positioning` für adaptive Tooltips und Kontextmenüs.

---

## 📈 Projekt-Compliance
- **Baseline:** Chrome 147+ Platinum Master
- **Architektur:** ADR-017 (Flat & Pure)
- **Status:** 72% Feature-Complete (v4.7)

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
