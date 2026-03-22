---
tags: [aviation-grade, platinum-2026, architecture, integrity-fix]
status: cemented
version: 1.0.0
last_audit: 2026-03-21
id: ADR-010
title: latex.css — Pattern Mining, kein Full Import
traceability: [BRAIN-017, BRAIN-013, CAA-008, ADR-002, ANTI-023]
integrity_fixes: [G-006 ADR-010 formalisiert]
source: 08_isomorphic_schema_v2.2.0.md Sektion M (extrahiert + formalisiert)
---

# ADR-010 — latex.css: Pattern Mining statt Full Import

**Status:** CEMENTED (2026-03-21)
**Entschieden in:** 08_isomorphic_schema_v2.2.0.md Sektion M
**Formalisiert:** BRAIN-017 G-006 (Gap: ADR fehlte als eigenständige Datei)

---

## 1. Kontext: Die Frage

latex.css (vincent/latex.css) ist ein bekannter Open-Source-Stylesheet der
LaTeX-Typografie-Konventionen ins Web bringt: Computer Modern Schrift,
Silbentrennung, typografische Feinheiten.

Die Frage: Soll DIN-BriefNEO latex.css vollständig importieren (`@import url()`)
oder nur ausgewählte Muster extrahieren ("Pattern Mining")?

---

## 2. Analyse: Warum Full Import scheitert

latex.css greift global auf html, body, p, h1-h6 zu. Konkret:

**Konflikt 1 — font-size Reset:**
  latex.css: `body { font-size: 10pt; }`
  DIN-BriefNEO: `--font-size-body: 11pt;`

  Wenn latex.css nach unseren Regeln geladen wird und @layer latex.base
  UNTERHALB von din.core deklariert ist, wird latex.css' font-size
  von din.core überschrieben. Aber: Die @layer-Deklaration muss korrekt
  sein. Ein Fehler in der Layer-Deklaration würde latex.css' Resets
  über din.core setzen → mm-Drift in der DIN-Positionierung.

**Konflikt 2 — body Margins:**
  latex.css setzt body-Margins in em-Einheiten.
  DIN-BriefNEO setzt alle Margins via absolute mm-Koordinaten.
  Ein em-Margin auf body würde den Ursprungspunkt aller absoluten
  Positionierungen verschieben.

**Konflikt 3 — Komplexität ohne Mehrwert:**
  Ein @import in @layer latex.base würde die Kaskade zähmen,
  aber latex.css' Resets wären immer noch präsent — sie tun nur nichts,
  weil sie von din.core überschrieben werden. Das sind Regeln die
  leben, aber nutzlos sind. Aviation Grade toleriert keine nutzlosen Regeln.

**Konflikt 4 — h1-h6 Hierarchien:**
  DIN-Briefe haben keine Überschriften-Hierarchie.
  h1-h6 Resets von latex.css sind 100% Dead Weight.

---

## 3. Entscheidung: Pattern Mining — die 3 Safe-Extracts

Statt Full Import: manuelles Extrahieren der drei Muster die
keinen Layout-Impact haben und nie mm-Drift verursachen können.

### Safe-Extract 1: Silbentrennung (Hyphenation)

```css
@layer latex.base {
  din-body, din-body-mirror {
    hyphens: auto;
    hyphenate-limit-chars: 6 3 2;
    text-align: justify;
  }
}
```

Warum kein Konflikt:
`hyphens` und `hyphenate-limit-chars` sind reine Text-Rendering-Properties.
Sie beeinflussen nie Position, Größe oder Layout-Dimensionen.
`text-align: justify` gilt nur für `din-body` — der Informationsblock,
die Anschrift und der Betreff bleiben unberührt.

### Safe-Extract 2: Font-Rendering (Qualität)

```css
@layer latex.base {
  #paper, #paper * {
    text-rendering: optimizeLegibility;
    font-kerning: normal;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  }
}
```

Warum kein Konflikt:
Font-Feature-Settings und text-rendering sind Rendering-Hints.
Sie verändern die visuelle Qualität der Schrift, aber keine
Layout-Dimensionen. Ein Buchstabe mit Kerning hat dieselbe
Bounding Box wie ohne Kerning — der Browser optimiert intern.

### Safe-Extract 3: Schrift-Stack-Ergänzung

```css
/* In css/typography.css — kein @layer nötig, nur Variable-Ergänzung: */
:root {
  --font-paper-latex: 'Latin Modern', 'Computer Modern', 'Libertinus Serif',
                      'Aptos', 'Segoe UI', sans-serif;
}
```

Warum kein Konflikt:
Es ist nur eine CSS Custom Property. Sie wird nur angewendet wenn
jemand explizit `font-family: var(--font-paper-latex)` schreibt.
Default-Schrift bleibt `--font-paper` (Aptos/Segoe-Stack).

---

## 4. Implementation-Pfad

1. `@layer latex.base` in die Layer-Deklaration als ERSTEN Layer aufnehmen:
   ```css
   @layer latex.base, din.core, ui.theme, project.overrides;
   ```

2. Die drei Safe-Extracts in `css/din5008-paper.css` in `@layer latex.base` schreiben.

3. **KEIN** `@import url("latex.css")` — nur die drei manuell extrahierten Regeln.

4. Wenn in Zukunft weitere typografische Verbesserungen aus latex.css
   gewünscht werden: Prüfung gegen "hat es Layout-Impact?" → Ja → ablehnen,
   Nein → in @layer latex.base aufnehmen.

---

## 5. Was WIR NICHT extrahieren (und warum)

| Regel | Grund |
|---|---|
| `body { font-size: 10pt; }` | Widerspricht --font-size-body: 11pt (DIN) |
| `body { margin: ... em; }` | em-Margin auf body = mm-Drift-Risiko |
| `h1-h6 { font-size: ... }` | DIN-Briefe haben keine Überschriften |
| `@media print { body { ... } }` | DIN 5008 definiert Print-Layout, nicht latex.css |
| `p { margin: 1em; }` | Würde DIN-Body-Abstände korrumpieren |

---

## 6. GEMINI.md ADR-Register Update

Folgende Zeile ist in GEMINI.md Sektion VI nachzutragen:

```
| 010 | latex.css: Pattern Mining (3 Safe-Extracts), kein Full Import |
```

---

## 7. Traceability

Hergeleitet aus: 08_isomorphic_schema_v2.2.0.md Sektion M (Audit 2026-03-21)
Gap identifiziert in: 17_architecture_integrity_report_v1.0.0.md G-006
Formalisiert als eigenständiger ADR: 2026-03-21
Implementierungsdetails: 03_technical_blueprint_v1.1.0.md SCHICHT 0
