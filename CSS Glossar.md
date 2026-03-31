---
title: "CSS Glossar — DIN-BriefNEO Platinum"
version: 4.5.0
status: active
last_updated: 2026-03-31
tags: [css, reference, documentation, platinum, chrome-147]
---

# 📚 CSS Glossar — DIN-BriefNEO Platinum Edition

Dieses Dokument ist die **Single Source of Truth (SSoT)** für alle CSS-Technologien im Projekt. Wir nutzen die **Chrome 147+ Baseline**, um ein Zero-JS UI-System zu realisieren.

---

## 1. Selektoren (Selectors)

| Selektor | Verwendung | Beispiel | Status |
|----------|------------|---------|--------|
| **`:has()`** | Relationale Logik (Zero-JS State) | `:root:has(#state-layout-a:checked)` | ✅ Aktiv |
| **`:is()`** | Selektoren-Gruppierung | `:is(din-falz-oben, din-falz-unten)` | ✅ Aktiv |
| **`:not()`** | Ausschluss-Logik | `:root:not(:has(#state-guides:checked))` | ✅ Aktiv |
| **`:empty`** | Platzhalter-Steuerung | `din-absender:empty::before` | ✅ Aktiv |
| **`:checked`** | Status-Trigger via Radio/Checkbox | `input:checked ~ #app-shell` | ✅ Aktiv |
| **`:focus-visible`** | Tastatur-Fokus (A11y) | `:focus-visible { outline: 2px solid; }` | ✅ Aktiv |
| **`::selection`** | Markierungs-Branding | `::selection { background: var(--c-primary); }` | ✅ Aktiv |
| **`::before` / `::after`** | Dekorative Elemente / Ghost-Text | `#paper::after { content: "⚠️ OVERFLOW"; }` | ✅ Aktiv |

---

## 2. Eigenschaften (Properties)

| Property | Verwendung | Beispiel | Status |
|----------|------------|---------|--------|
| **`interpolate-size`** | Animation von `height: auto` | `interpolate-size: allow-keywords;` | ✅ Aktiv |
| **`field-sizing`** | Auto-Resize für Textfelder | `field-sizing: content;` | ✅ Aktiv |
| **`text-wrap`** | Typografische Balance | `text-wrap: balance` / `pretty` | ✅ Aktiv |
| **`oklch()`** | Perzeptive Farben (Helligkeits-Linear) | `color: oklch(60% 0.15 250);` | ✅ Aktiv |
| **`light-dark()`** | Native Theme-Umschaltung | `background: light-dark(#fff, #000);` | ✅ Aktiv |
| **`color-mix()`** | Dynamische Farbableitung | `color-mix(in oklch, var(--c), white 10%)` | ✅ Aktiv |
| **`aspect-ratio`** | Fixierung des Papierformats | `aspect-ratio: 210 / 297;` | ✅ Aktiv |
| **`container-type`** | Size- & Scroll-State Queries | `container-type: size scroll-state;` | ✅ Aktiv |
| **`anchor-name`** | Position-Anchor Definition | `anchor-name: --nav-anchor;` | 📋 Geplant |
| **`position-anchor`** | Bindung an Anker | `position-anchor: --nav-anchor;` | 📋 Geplant |

---

## 3. Funktionen (Functions)

| Funktion | Verwendung | Beispiel | Status |
|----------|------------|---------|--------|
| **`calc()`** | Dynamische mm-Positionierung | `calc(var(--start) + 35mm)` | ✅ Aktiv |
| **`var()`** | CSS-Variablen Zugriff | `top: var(--din-y-fold-1);` | ✅ Aktiv |
| **`oklch()`** | High-Definition Farben | `oklch(25% 0.05 250)` | ✅ Aktiv |
| **`color-mix()`** | Native Farbmischung | `color-mix(in oklch, var(--c), transparent 90%)` | ✅ Aktiv |
| **`linear-gradient`** | Komplexe Hintergründe | `linear-gradient(135deg, ...)` | ✅ Aktiv |
| **`round()`** | Mathematische Rundung (mm-Präzision) | `round(10.555mm, 0.1mm)` | 🆕 Neu |
| **`clamp()`** | Fluid-Typography | `font-size: clamp(10pt, 2vw, 12pt);` | ✅ Aktiv |

---

## 4. At-Rules

| At-Rule | Verwendung | Beispiel | Status |
|---------|------------|---------|--------|
| **`@layer`** | Kaskaden-Management | `@layer latex.base, ui.theme, din.structure;` | ✅ Aktiv |
| **`@property`** | Typisierte CSS-Variablen | `@property --din-y-abschnitt { syntax: "<length>"; }` | ✅ Aktiv |
| **`@container`** | Size- & Scroll-State Queries | `@container paper scroll-state(scrollable: block)` | ✅ Aktiv |
| **`@media print`** | Druck-Layout | `@media print { ... }` | ✅ Aktiv |
| **`@font-feature-values`** | Benannte OpenType-Sets | `@font-feature-values "Inter" { ... }` | ✅ Aktiv |
| **`@starting-style`** | Entry-Animationen (z.B. Toast) | `@starting-style { opacity: 0; }` | ✅ Aktiv |

---

## 5. Browser-Baseline

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| **Platinum Core** | **147+** | 128+ | 18+ | 147+ |

**Hinweis:** Wir optimieren exklusiv für die Chrome Platinum Baseline, um modernste APIs wie `scroll-state` und `interpolate-size` ohne Polyfills nutzen zu können.

---
*Stand: 31. März 2026 — DIN-BriefNEO Platinum Master*
