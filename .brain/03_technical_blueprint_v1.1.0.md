---
tags: [aviation-grade, platinum-2026, architecture, integrity-fix]
status: cemented
version: 1.1.0
last_audit: 2026-03-21
id: BRAIN-003-BP
title: CSS Technical Blueprint — Das Reinheitsgebot
supersedes: 03_technical_blueprint.md (v1.0.0)
authority: Gilt für alle Dateien in css/
traceability: [BRAIN-017, ADR-001, ADR-002, ADR-003, ADR-009, ADR-010, CAA-008]
integrity_fixes: [K-002 Chrome-Widerspruch, K-003 Layer-Hierarchie, O-002 Blueprint-Sync]
---

# 03 — CSS Technical Blueprint v1.1.0: Das Reinheitsgebot

## ⚠️ Änderungen gegenüber v1.0.0 (BRAIN-017 Integrity Fix)

1. **K-002 behoben:** Chrome-145-Mandate ersetzt @supports-Empfehlungen
2. **K-003 behoben:** `latex.base` als schwächster Layer in alle @layer-Deklarationen
3. **O-002 behoben:** Blueprint synchron mit BRAIN-015 und IMR v2.2.0

---

## MANDATE: Chrome 145+ — Das Ziel-Plattform-Gesetz

> **DIN-BriefNEO ist für Chrome 145+ optimiert.**
> @supports-Guards für Anchor Positioning, Invoker Commands und
> die Sanitizer API sind in diesem Projekt NICHT zulässig.
> Diese Features werden nativ und direkt eingesetzt.

Das widerspricht dem allgemeinen Web-Baseline-Ansatz bewusst.
DIN-BriefNEO ist kein öffentliches Web-Produkt — es ist ein
spezialisiertes Werkzeug mit definierten Systemanforderungen.
Wer Chrome 145+ hat, bekommt die volle Erfahrung. Punkt.

**Was das für die Entwicklung bedeutet:**
- Kein `@supports (anchor-name: --x) { ... }` Wrapper
- Kein Feature-Detection-JS für Invoker Commands
- `setHTML()` mit Sanitizer API direkt, ohne Fallback
- `@scope (#paper)` direkt, ohne Guard

---

## DIE HEILIGE LAYER-REIHENFOLGE v1.1 [ADR-002 + ADR-010]

```css
@layer latex.base, din.core, ui.theme, project.overrides;
/*      ^^^^^^^^^  ^^^^^^^^  ^^^^^^^^^  ^^^^^^^^^^^^^^^^
        Schwächst  DIN-mm    Ästhetik   State/Overrides
        typography UNANTASTBAR Pico-Ext schlägt immer   */
```

**Neu in v1.1: `latex.base`** — der schwächste Layer.
Enthält ausschließlich die drei Safe-Extracts aus ADR-010 (Pattern Mining).
Seine Schwachheit ist strukturell garantiert: `din.core` überschreibt IMMER.

### Reihenfolge-Gesetz (VERFASSUNGSRANG)

```
latex.base (schwächst)  ← typography hints, hyphenation
din.core                ← DIN mm-Geometrie, Tag-Selektoren — UNANTASTBAR
ui.theme                ← Ästhetik, Farben, Schatten
project.overrides       ← data-* State, :has(), Sichtbarkeit — STÄRKST
```

Kein `!important` nötig. Kein Spezifitätskonflikt möglich.
Die Deklarationsreihenfolge ist die einzige Wahrheit.

### Warum `latex.base` als schwächster Layer mm-Drift ausschließt

`latex.base` enthält ausschließlich:
- `hyphens: auto` — Text-Property, kein Layout-Impact
- `hyphenate-limit-chars: 6 3 2` — Text-Property
- `text-rendering: optimizeLegibility` — Rendering-Hint, kein Layout
- `font-feature-settings: "kern" 1, "liga" 1` — Font-Feature, kein Layout
- Optionale Font-Stack-Ergänzung in `--font-paper` Variable

**Was `latex.base` NIEMALS enthält:**
- `position`, `top`, `left`, `width`, `height`
- mm-Werte irgendeiner Art
- body/html Margin/Padding Resets
- h1-h6 Größen-Hierarchien

Selbst wenn jemand versehentlich eine `position`-Regel in `latex.base`
schreibt, kann `din.core` sie nicht überschreiben — `din.core` ist stärker.
Der mm-Drift ist strukturell ausgeschlossen.

---

## GRUNDSATZ: Beer CSS als Inspirationsquelle (unverändert)

Beer CSS organisiert in drei Schichten: Settings (Tokens), Elements (Tags), Helpers (Utilities).
DIN-BriefNEO adaptiert das zu vier Schichten mit `latex.base` als Typografie-Fundament.

---

## SCHICHT 0: latex.base — Typografie-Fundament

**Beer CSS Analogie:** Externe Reset-Imports via `@import url() layer(reset)`.

**In DIN-BriefNEO:** ADR-010 (Pattern Mining aus latex.css):
Drei Safe-Extracts, kein Full Import.

```
Schicht 0 enthält NUR:
  hyphens: auto + hyphenate-limit-chars    ← Worttrennung
  text-rendering: optimizeLegibility       ← Font-Rendering
  font-feature-settings: kern + liga       ← Typografische Feinheiten
```

**Schutzprinzip:** latex.base ist stärker als der Browser-Default,
aber schwächer als alles was wir selbst schreiben. Kein Konflikt möglich.

---

## SCHICHT 1: SETTINGS — Vakuum-Variablen als einzige Wahrheit

Die SETTINGS-Schicht sind CSS Custom Properties in `:root` von `din5008-paper.css`.
Sie sind der CMA Layer 3 Fallback — immer korrekt, auch ohne JS.

**ADR-009 (SSoT-Entscheidung):**
CSS `:root {}` ist die primäre SSoT für alle statischen CMA-Maße.
`cma-bridge.js` ist als Dead Code markiert (nur `switchForm()` bleibt).

### Kanonische Variable-Gruppen

Gruppe A: CMA-Koordinaten (Aviation Grade)
```
--info-block-top:  97.4mm   *** AVIATION GRADE — nie ändern ***
--subject-top:    103.4mm   *** AVIATION GRADE — nie ändern ***
--footer-top:      269mm    *** AVIATION GRADE — nie ändern ***
```

Gruppe B: Layout-Dimensionen
```
--page-width: 210mm    --page-height: 297mm
--margin-left: 25mm    --margin-right: 20mm
--address-width: 85mm  --address-height: 45mm
--text-width: 165mm
```

Gruppe C: Formspezifische Variablen (Form A/B Toggle)
```
--address-top: 45mm  (Form B Default)
--margin-top-a: 27mm --margin-top-b: 45mm
```

Gruppe D: Typografie
```
--font-size-body: 11pt   --line-height: 14pt
```

Gruppe E: Farb-Tokens
```
--color-paper: #ffffff   --color-error: #c0392b
--color-guide: #cccccc   --color-ok: #27ae60
```

Gruppe F: @property Typisierung (Chrome 85+, BRAIN-015 A-8)
```
@property --subject-top { syntax: "<length>"; initial-value: 103.4mm; inherits: true; }
(für alle 14 CMA-Konstanten)
```

**SETTINGS-Invariante:**
Kein mm-Wert direkt in einer Regel. Jeder Positionswert ist `var(--cma-*)`.
`grep -rn "97\.4mm\|103\.4mm" css/` → nur `:root` und Kommentare.

---

## SCHICHT 2: ELEMENTS — Tag-Selektoren ohne Klassen

Die ELEMENTS-Schicht ist `@layer din.core`.
Sie stylt alle `<din-*>`-Tags direkt — keine IDs, keine Klassen.

```
TAG-NAME = CSS-SELEKTOR = JSON-KEY
din-subject { ... } = "subject"
```

**ELEMENTS-Invariante:**
`@layer din.core` enthält AUSSCHLIESSLICH:
  position, top, left, width, height via var(--cma-*)
  font-size, line-height, display, overflow als Basis-Properties

`@layer din.core` enthält NIEMALS:
  Farben, Schatten, border-radius, Animationen, px-Werte für Positionen
  [data-*]-Selektoren (→ Schicht 3)

---

## SCHICHT 3: HELPERS — Minimalistische State-Maschine

Die HELPERS-Schicht ist `@layer project.overrides`.
Jede Regel hier ist eine Zeile JS die nicht existieren muss.

Kategorien:
  Form A/B Toggle:    #paper[data-layout="form-a"] #anschriftzone { ... }
  Sichtbarkeit:       #paper[data-guides="true"] .fold-mark { display: block; }
  Toolbar via :has(): #paper:has([contenteditable]:focus-within) #toolbar { ... }
  Placeholder:        [data-placeholder]:empty::before { content: attr(data-placeholder); }
  Anrede-Genus:       din-salutation[data-gender="m"]:empty::before { content: "..."; }
  Selection-Guard:    body > *:not(#paper) { user-select: none; }

**HELPERS-Invariante:**
`@layer project.overrides` enthält AUSSCHLIESSLICH:
  [data-*]-Selektoren, :has()-Logik, Sichtbarkeits-Toggle

`@layer project.overrides` enthält NIEMALS:
  mm-Positionswerte, absolute Koordinaten, DIN-Raster-Beeinflussung

---

## CSS-Datei-Zuständigkeiten

| Datei | Schichten | Enthält |
|---|---|---|
| `din5008-paper.css` | latex.base + din.core + ui.theme + project.overrides | CMA-Vars, din-* Tags, Zonen |
| `sidebar.css` | ui.theme + project.overrides | App-Shell-Grid, Sidebars |
| `devmode.css` | ui.theme only | Devmode-Overlays |

---

## Chrome 146+ Native Features — Kein @supports (K-002 Korrektur)

Da Chrome 145+ das Ziel ist, werden alle Features DIREKT eingesetzt:

| Feature | Chrome-Stand | Einsatz in DIN-BriefNEO |
|---|---|---|
| CSS Anchor Positioning | 125+ stabil | din-* Tags als Anker, Tooltips ohne JS |
| Invoker Commands | 133+ stabil | Alle Dialog-Buttons — kein addEventListener |
| Sanitizer API setHTML() | 116+ (vollst. 146+) | Ghost-Mirror Markdown→HTML |
| @scope (#paper) | 118+ stabil | din-* Selektoren paper-lokal |
| @starting-style | 117+ stabil | Toast-Animationen ohne JS-Timer |
| @property | 85+ stabil | Alle 14 CMA-Variablen typisiert |
| Relative Color Syntax | 119+ stabil | Sidebar-Farben mathematisch abgeleitet |
| interpolate-size | 129+ stabil | height: auto Transitions ohne JS |

---

## Das Reinheitsgebot (Zusammenfassung v1.1)

```
SCHICHT 0 (latex.base)    → Typografie-Hints (niemals mm-Layout)
SCHICHT 1 (SETTINGS)      → :root { --var: wert; } (einzige Wahrheit)
SCHICHT 2 (ELEMENTS)      → @layer din.core { din-tag { } } (mm-Präzision)
SCHICHT 3 (HELPERS)       → @layer project.overrides { [data-x] { } }
```

Die drei Verbote (unverändert):
1. Keine Magic Numbers für DIN-Maße — nur var(--cma-*)
2. Keine relativen Positionierungen für DIN-Zonen — nur position: absolute
3. Kein CSS außerhalb des Layer-Systems

Hierarchie-Gesetz:
```
latex.base < din.core < ui.theme < project.overrides
(schwächst)                        (stärkst)
```
