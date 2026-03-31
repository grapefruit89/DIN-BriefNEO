---
# === BASISINFORMATIONEN ===
title: "CSS Glossar — DIN-BriefNEO Platinum"
subtitle: "Complete CSS Reference for Pure & Flat Architecture"
description: "Katalogisiert alle CSS-Technologien im DIN-BriefNEO-Projekt – Single Source of Truth für Entwickler und KI-Agenten"
version: "4.7.0"
version_date: 2026-03-31
status: active

# === DOKUMENT-TYP ===
type: reference
category: css
audience:
  - developers
  - designers
  - ai-agents
  - code-reviewers

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/css
  - din-briefneo/reference
  - din-briefneo/platinum
  - status/active
  - type/reference
  - tech/css
  - tech/css-nesting
  - tech/css-container-queries
  - tech/css-anchor-positioning

# === ALIASES ===
aliases:
  - "03_CSS_Reference"
  - "CSS Reference"
  - "CSS Features"
  - "Platinum CSS"
  - "CSS Glossar"
  - "CSS Capabilities"

# === DATAVIEW Felder ===
css_features_total: 45
css_features_active: 28
css_features_planned: 12
css_features_roadmap: 5
baseline_version: "Chrome 147+"
zero_js_ui: true
css_first: true

# === FEATURE-KATEGORIEN ===
feature_categories:
  - selectors
  - properties
  - functions
  - at-rules
  - colors
  - layout
  - animations

# === VERWANDTE DOKUMENTE ===
related:
  - "01_Architecture_Compliance"
  - "02_IMR_Registry"
  - "04_CSS_Quick_Reference"
  - "05_Feature_Matrix"

# === ZEITSTEMPEL ===
date_created: 2026-03-31
date_updated: 2026-03-31
date_reviewed: 2026-03-31

# === AUTOR ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - wide-table
  - readable

# === GITHUB PAGES ===
permalink: /docs/css-reference/
layout: default
---

# 📚 CSS Glossar — DIN-BriefNEO

> [!NOTE]
> Alle `mm`-Angaben sind absolute physische Maße und werden im Druck exakt umgesetzt. Die Platinum-Engine garantiert Sub-Millimeter-Präzision.

> [!WARNING]
> `interpolate-size` und `field-sizing` erfordern Chrome 129+. Bei älteren Browsern entfallen diese Komfort-Features ohne funktionale Einbußen.

Dieses Dokument ist die **Single Source of Truth (SSoT)** für alle CSS-Technologien im Projekt. Wir nutzen die **Chrome 147+ Baseline** für ein Zero-JS UI-System.

---

## 🚦 Status-System
- ✅ **Aktiv**      → Im Code implementiert und aktiv genutzt.
- 🟡 **Geplant**    → Definitiv in nächsten 2 Sprints (Q2 2026).
- 📋 **Roadmap**    → Langfristige Planung (2026/2027).
- 🧪 **Experimentell** → In Test-Suites aktiv, noch nicht produktiv.

---

## 🆕 Neue Konzepte (Definitionen)

`@container scroll-state`
:   Ermöglicht die Erkennung von Überlauf ohne JavaScript. Wird für den **Overflow Alarm** im Briefkern verwendet.

`field-sizing: content`
:   Native CSS-Lösung für auto-resizing Textareas. Ersetzt komplexe JS-Resize-Listener.

`reading-flow`
:   Stellt sicher, dass die Tastatur-Navigation (Tab) der visuellen Anordnung folgt, unabhängig von der DOM-Reihenfolge.

`attr(data-* type)`
:   Erlaubt das Auslesen von HTML-Attributen als typisierte CSS-Werte (z.B. Längen in mm).

---

## 1. Selektoren (Selectors)

| Selektor | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`:has()`** | Zero-JS State Management (Layout/Theme/Guides) | ✅ Aktiv | 105+ |
| **`:is()`** | Selektoren-Gruppierung (Kompaktheit) | ✅ Aktiv | 88+ |
| **`:not()`** | Negation für Ausnahmen (Print/UI) | ✅ Aktiv | Baseline |
| **`:empty`** | Ghost-Text Steuerung (Platzhalter) | ✅ Aktiv | Baseline |
| **`:checked`** | Radio/Checkbox-Trigger | ✅ Aktiv | Baseline |
| **`:focus-visible`** | Tastatur-Fokus Styling (A11y) | ✅ Aktiv | 86+ |
| **`:focus-within`** | Container-Aktivierung bei Fokus | 🟡 Geplant | 63+ |
| **`:where()`** | Gruppierung mit Spezifität 0 | 🟡 Geplant | 88+ |
| **`::selection`** | Markierungs-Branding | ✅ Aktiv | Baseline |
| **`::backdrop`** | Dialog-Hintergrund Styling | ✅ Aktiv | 37+ |

---

## 2. Eigenschaften (Properties)

| Property | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`interpolate-size`** | Animation von `height: auto` | ✅ Aktiv | 129+ |
| **`field-sizing`** | Auto-Resize für Textfelder | ✅ Aktiv | 129+ |
| **`light-dark()`** | Native Theme-Umschaltung | ✅ Aktiv | 123+ |
| **`text-wrap`** | Typografische Balance (`balance`/`pretty`) | ✅ Aktiv | 114+ |
| **`scrollbar-gutter`** | Layout-Stabilität in der Sidebar | ✅ Aktiv | 94+ |
| **`oklch()`** | Perzeptive Farbräume | ✅ Aktiv | 111+ |
| **`reading-flow`** | Fokus folgt visuellem Layout | 🟡 Geplant | 147+ |
| **`anchor-name`** | Definition von Ankerpunkten | 📋 Roadmap | 125+ |
| **`position-anchor`** | Bindung an Anker | 📋 Roadmap | 125+ |
| **`overflow-anchor`** | Scroll-Stabilität bei Inhalt-Inject | 🟡 Geplant | 56+ |

---

## 3. Funktionen (Functions)

| Funktion | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`calc()`** | Dynamische mm-Positionierung | ✅ Aktiv | Baseline |
| **`color-mix()`** | Dynamische Farbableitung (Hover/Active) | ✅ Aktiv | 111+ |
| **`round()`** | Mathematische Rundung (mm-Präzision) | ✅ Aktiv | 129+ |
| **`attr(* type)`** | Typisierte Attribute (z.B. mm aus HTML) | 🟡 Geplant | 147+ |
| **`clamp()`** | Fluid Typography & Constraints | ✅ Aktiv | 79+ |
| **`oklch()`** | Device-unabhängige Farbwahrnehmung | ✅ Aktiv | 111+ |

---

## 4. At-Rules

| At-Rule | Verwendung | Status | Chrome |
|---------|------------|--------|--------|
| **`@layer`** | Kaskaden-Management (base, theme, structure) | ✅ Aktiv | 99+ |
| **`@property`** | Typisierte Variablen (z.B. für mm-Transitions) | ✅ Aktiv | 85+ |
| **`@container`** | Size- & Scroll-State Queries | ✅ Aktiv | 105+ |
| **`@scope`** | CSS-Isolation (Paper-Styles) | 🟡 Geplant | 118+ |
| **`@starting-style`** | Entry-Animationen (Modals/Toasts) | ✅ Aktiv | 117+ |
| **`@position-try`** | Fallback-Logik für Popover | 🧪 Experimentell | 125+ |

---

## 5. Platinum-Spezial (Chrome 147+)

| Feature | Beschreibung | Status | Chrome |
|---------|--------------|--------|--------|
| **`scroll-state`** | `@container scroll-state` für Overflow-Warnungen | ✅ Aktiv | 147+ |
| **`interesttarget`** | Zero-JS Tooltips & Info-Popups | 📋 Roadmap | 147+ |
| **`Invoker Commands`** | Deklarative Button-Aktionen (`commandfor`) | 📋 Roadmap | 148+ |

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
