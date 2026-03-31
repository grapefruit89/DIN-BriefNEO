---
title: "CSS Glossar — DIN-BriefNEO Platinum Master"
version: 4.7.0
status: active
last_updated: 2026-03-31
tags: [css, reference, documentation, platinum, chrome-147]
---

# 📚 CSS Glossar — DIN-BriefNEO

Dieses Dokument ist die **Single Source of Truth (SSoT)** für alle CSS-Technologien im Projekt. Wir nutzen die **Chrome 147+ Baseline** für ein Zero-JS UI-System.

---

## 🚦 Status-System
- ✅ **Aktiv**      → Im Code implementiert und aktiv genutzt.
- 🟡 **Geplant**    → Definitiv in nächsten 2 Sprints (Q2 2026).
- 📋 **Roadmap**    → Langfristige Planung (2026/2027).
- 🧪 **Experimentell** → In Test-Suites aktiv, noch nicht produktiv.

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
*Stand: 31. März 2026 — DIN-BriefNEO Platinum Master v4.7*
