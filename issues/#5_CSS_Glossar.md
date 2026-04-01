---
title: "CSS Glossar — DIN-BriefNEO Platinum"
subtitle: "Complete CSS Reference for Pure & Flat Architecture"
version: "4.8.0"
version_date: 2026-04-01
status: active
github_issue: "#5"
baseline: "Chrome 147+"

# === DOKUMENT-TYP ===
type: specification
category: css
audience:
  - developers
  - architects
  - reviewers
  - management

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/css
  - din-briefneo/reference
  - din-briefneo/platinum
  - status/active
  - type/specification
  - tech/chrome-147
  - tech/css

# === ALIASES ===
aliases:
  - "CSS Reference"
  - "CSS Cheat Sheet"
  - "Platinum CSS Master"
  - "CSS Glossar"

# === DATAView Felder ===
baseline_version: "147"
zero_js_ui: true
css_first: true
features_v48: 5

# === ZEITSTEMPEL ===
date_created: 2026-03-31
date_updated: 2026-04-01
date_reviewed: 2026-04-01

# === AUTOR ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"

# === OBSIDIAN RENDERING ===
cssclasses:
  - table-stripes
  - wide-table
  - readable

# === GITHUB PAGES ===
permalink: /docs/css-glossar/
layout: default
---

# 📚 CSS Glossar — DIN-BriefNEO (v4.8.0)

> [!NOTE]
> Alle `mm`-Angaben sind absolute physische Maße und werden im Druck exakt umgesetzt. Die Platinum-Engine garantiert Sub-Millimeter-Präzision.

> [!IMPORTANT]
> **Chrome 147+ Baseline** – Keine Polyfills, keine `@supports`-Guards für Core-APIs. Das System nutzt native Browser-Features für maximale Performance und Sicherheit.

---

## 🚦 Status-System

| Symbol | Bedeutung |
|--------|-----------|
| ✅ **Aktiv** | Im Code implementiert und aktiv genutzt |
| 🟡 **Geplant** | Definitiv in nächsten 2 Sprints (Q2 2026) |
| 📋 **Roadmap** | Langfristige Planung (2026/2027) |
| 🧪 **Experimentell** | In Test-Suites aktiv, noch nicht produktiv |

---

## 📊 CSS Capability Matrix (Kern-Übersicht)

| Kategorie | Feature | Status | Chrome | Beschreibung |
|-----------|---------|--------|--------|--------------|
| **Logik** | Zero-JS State Management (`:has`) | ✅ Aktiv | 105+ | CSS-gesteuerte UI-Zustände (Layout/Theme/Guides) |
| **Logik** | Native Theme-Engine (`light-dark`) | ✅ Aktiv | 123+ | System-Farbschema-Umschaltung ohne JS-Toggles |
| **Architektur** | Kaskaden-Management (`@layer`) | ✅ Aktiv | 99+ | Trennung von Base, Theme und Structure |
| **Präzision** | Millimeter-Mathematik (`@property`, `round`) | ✅ Aktiv | 129+ | Typsichere Variablen für CMA-Koordinaten |
| **Resilience** | Overflow-Alarm (`@container scroll-state`) | ✅ Aktiv | 147+ | Native Überlauf-Warnung im Briefkern |
| **Eingabe** | Auto-Resize Inputs (`field-sizing`) | ✅ Aktiv | 129+ | Textfelder wachsen organisch mit dem Inhalt |
| **Design** | Perzeptive Farben (`oklch`, `color-mix`) | ✅ Aktiv | 111+ | Wahrnehmungsgetreue HD-Farben & dynamische Mischung |

---

## 🆕 Neue Features (v4.8.0)

| Feature | CSS / API | Beschreibung | Status | Chrome |
|---------|-----------|--------------|--------|--------|
| **3D-Carousel** | `--position`, `--i` CSS-Variablen | Dynamische 3D-Transformationen ohne JS | ✅ Aktiv | 147+ |
| **Toast-System** | `toast-platinum-cycle` Keyframes | CSS-Choreographie (Entry/Stay/Exit), kein `setTimeout` | ✅ Aktiv | 117+ |
| **Form C Layout** | `:has(#state-layout-c:checked)` | Flexbox-basiertes, gestapeltes Layout via Selektor-State | ✅ Aktiv | 105+ |
| **Ghost-Text** | `data-salutation`, `data-greeting` | Platzhalter-Vorschläge via CSS `:empty::before` | ✅ Aktiv | 147+ |
| **Footer Auto-Hide** | `din-fuss > *:empty { display: none }` | Leere Fußzeilen-Elemente werden automatisch ausgeblendet | ✅ Aktiv | Baseline |

---

## 1. Selektoren (Selectors)

| Selektor | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`:has()`** | Zero-JS State Management | ✅ Aktiv | 105+ |
| **`:is()`** | Selektoren-Gruppierung (Kompaktheit) | ✅ Aktiv | 88+ |
| **`:not()`** | Negation für Ausnahmen (Print/UI) | ✅ Aktiv | Baseline |
| **`:empty`** | Ghost-Text Steuerung (Platzhalter) | ✅ Aktiv | Baseline |
| **`:checked`** | Radio/Checkbox-Trigger (UI State) | ✅ Aktiv | Baseline |
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
| **`color-mix()`** | Dynamische Farbableitung (Hover/Active) | ✅ Aktiv | 111+ |
| **`reading-flow`** | Fokus folgt visuellem Layout | 🟡 Geplant | 147+ |
| **`anchor-name`** | Definition von Ankerpunkten | 📋 Roadmap | 125+ |
| **`position-anchor`** | Bindung an Anker | 📋 Roadmap | 125+ |

---

## 3. Funktionen (Functions)

| Funktion | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`calc()`** | Dynamische mm-Positionierung | ✅ Aktiv | Baseline |
| **`round()`** | Mathematische Rundung (mm-Präzision) | ✅ Aktiv | 129+ |
| **`clamp()`** | Fluid Typography & Constraints | ✅ Aktiv | 79+ |
| **`attr(data-* type)`** | Typisierte Attribute (z.B. mm aus HTML) | 🟡 Geplant | 147+ |

---

## 4. At-Rules

| At-Rule | Verwendung | Status | Chrome |
|---------|------------|--------|--------|
| **`@layer`** | Kaskaden-Management (base, theme, structure) | ✅ Aktiv | 99+ |
| **`@property`** | Typisierte Variablen (z.B. für mm-Transitions) | ✅ Aktiv | 85+ |
| **`@container`** | Size- & Scroll-State Queries | ✅ Aktiv | 105+ |
| **`@starting-style`** | Entry-Animationen (Modals/Toasts) | ✅ Aktiv | 117+ |
| **`@scope`** | CSS-Isolation (Paper-Styles) | 🟡 Geplant | 118+ |
| **`@position-try`** | Fallback-Logik für Popover | 🧪 Experimentell | 125+ |

---

## 5. Platinum-Spezial (Chrome 147+)

| Feature | Beschreibung | Status | Chrome |
|---------|--------------|--------|--------|
| **`scroll-state`** | `@container scroll-state` für Overflow-Warnungen | ✅ Aktiv | 147+ |
| **`interesttarget`** | Zero-JS Tooltips & Info-Popups | 📋 Roadmap | 147+ |
| **`Invoker Commands`** | Deklarative Button-Aktionen (`commandfor`) | 📋 Roadmap | 148+ |

---

## 📋 Roadmap Highlights (Q2-Q4 2026)

| Feature | Beschreibung | Erwartet |
|---------|--------------|----------|
| 🟡 **CSS `@scope`** | CSS-Isolation für Paper-spezifische Stile | Q2 2026 |
| 📋 **Invoker Commands** | Deklarative Button-Trigger (`commandfor`) | Q3 2026 |
| 📋 **Anchor Positioning** | Popovers kleben ohne JS am Anker | Q3 2026 |
| 🧪 **`interesttarget`** | Zero-JS Tooltips (Hover → Popover) | Q4 2026 |

---

## 📈 Projekt-Compliance

| Metrik | Wert |
|--------|------|
| **Baseline** | Chrome 147+ Platinum Master |
| **Architektur** | ADR-017 (Flat & Pure) |
| **Zero-JS UI** | ✅ Aktiv (via `:has()`, Popover) |
| **CSS-First** | ✅ Aktiv |
| **Feature-Complete** | 85% (v4.8) |

---

## 🔗 Dokumenten-Navigation

| Issue | Dokument | Zweck |
|-------|----------|-------|
| [#1](https://github.com/grapefruit89/DIN-BriefNEO/issues/1) | IMR 4.0 Registry | Alle 45+ DIN-Tags |
| [#2](https://github.com/grapefruit89/DIN-BriefNEO/issues/2) | Architecture Compliance | Technologie-Leitplanken |
| [#5](https://github.com/grapefruit89/DIN-BriefNEO/issues/5) | CSS Glossar | CSS-Features Referenz |
| [#6](https://github.com/grapefruit89/DIN-BriefNEO/issues/6) | Salutation Engine | Logik-Dokumentation |

---

## 📝 Changelog

| Datum | Version | Änderung | Autor |
|-------|---------|----------|-------|
| 2026-04-01 | 4.8.0 | Konsolidierung von Reference & Quick-Reference zu Issue #5 | @grapefruit89 |
| 2026-04-01 | 4.8.0 | 3D-Carousel, Toast-System, Form C Layout & Ghost-Text ergänzt | @grapefruit89 |
| 2026-04-01 | 4.8.0 | Footer Auto-Hide (`din-fuss > *:empty`) dokumentiert | @grapefruit89 |
| 2026-03-31 | 4.7.0 | Initiale Version (getrennte Dokumente) | @din-briefneo/core-team |

---

**Status:** ACTIVE  
**Nächste Überprüfung:** 2026-04-30  
**Verantwortlich:** Lead Frontend Architect
