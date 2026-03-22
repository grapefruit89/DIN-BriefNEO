---
scope: LOCAL — css/
version: 1.0.0
updated: 2026-03-20
parent: /GEMINI.md
authority: ERGAENZT Root. Layer-Reihenfolge ist VERFASSUNGSRANG.
specs: [SPEC-001, SPEC-007, ADR-001, ADR-002]
---

# GEMINI.md — css/ (Die Design-Festung)
## CSS Cascade Layers | @layer Architektur | Zero Magic Numbers

Dieser Ordner enthaelt das gesamte visuelle System von DIN-BriefNEO.
Die @layer-Struktur ist das Anti-Foot-Gun-System: kein Spezifitaets-Unfall
kann die mm-genauen DIN-Masse korrumpieren.

---

## DIE HEILIGE LAYER-REIHENFOLGE [ADR-002]

```css
/* ERSTE Zeile jeder neuen CSS-Datei in diesem Ordner: */
@layer din.core, ui.theme, project.overrides;
/*      ^^^^^^^  ^^^^^^^^^  ^^^^^^^^^^^^^^^^
        Schwach   Mittel     Stark (schlaegt immer)
        DIN-mm    Pico-Ext.  State/Overrides          */
```

**Reihenfolge ist VERFASSUNGSRANG.** Spaeter deklariert = hoehere Prioritaet.
Kein `!important` noetig, weil die Layer-Hierarchie das loest.

---

## LAYER-ZUSTAENDIGKEITEN (wer darf was)

### @layer din.core — UNANTASTBAR
Darf enthalten: `position`, `top`, `left`, `width`, `height` mit `var(--cma-*)`.
Darf NICHT enthalten: Farben, Schatten, border-radius, Animationen, px-Werte.
Darf NIEMALS ueberschrieben werden durch ui.theme oder project.overrides.

### @layer ui.theme — Aesthetik-Zone
Darf enthalten: Farben, box-shadow, border-radius, font-*, dialog-Styling.
Darf NICHT enthalten: mm-Positionswerte, `top:`, `left:` fuer DIN-Zonen.
Pico-Extrakte landen hier. Niemals ein Framework-Import.

### @layer project.overrides — State-Maschine
Darf enthalten: `[data-*]` Selektor-Regeln, `:has()` Logik, Sichtbarkeit.
Ist die CSS-Seite der No-JS Doctrine. Macht `.is-visible` obsolet.
Schlaegt immer — kein `!important` noetig.

---

## DIE 3 VERBOTE DIESES ORDNERS

### VERBOT 1: Keine Magic Numbers fuer DIN-Masse
```css
/* VERBOTEN: */
#informationsblock { top: 97.4mm; }    /* Magic Number — ANTI-023 */
#anschriftzone { top: 45mm; }          /* Magic Number — ANTI-023 */

/* KORREKT: */
#informationsblock { top: var(--info-block-top); }  /* CMA-Variable */
#anschriftzone { top: var(--address-top); }          /* CMA-Variable */
```

### VERBOT 2: Keine relativen Positionierungen fuer DIN-Zonen
```css
/* VERBOTEN (ANTI-001): */
#informationsblock { margin-top: 70mm; }    /* relativ → Drift-Risiko */
#betreff { margin-top: 6mm; }              /* relativ → Norm-Verletzung */

/* KORREKT: */
#informationsblock { position: absolute; top: var(--info-block-top); }
#betreff           { position: absolute; top: var(--subject-top); }
```

### VERBOT 3: Kein CSS ausserhalb des Layer-Systems
```css
/* VERBOTEN: Freistehende Regeln korrumpieren die Kaskade */
#paper { overflow: scroll; }    /* kein @layer → unkontrollierte Spezifitaet */

/* KORREKT: Jede Regel in ihrem Layer */
@layer din.core { #paper { overflow: hidden; } }
```

---

## CUSTOM PROPERTIES NOMENKLATUR

Alle CMA-Variablen folgen diesem Schema:
```
--[zone]-[eigenschaft]    → z.B. --info-block-top, --address-width
--color-[semantik]        → z.B. --color-error, --color-guide
--font-[eigenschaft]      → z.B. --font-size-body, --line-height
```

Variablen in `:root` sind der CSS-Fallback (Layer 3 des CMA-Systems).
Bei aktivem JS werden sie durch `cma-bridge.js` ueberschrieben.

---

## PRINT-REGEL

Print-Resets leben AUSSERHALB der Layer (`@media print { ... }`).
Sie ueberschreiben alles — das ist gewuenscht fuer den Druckfall.

---

## CEMETERY — Geloeschte CSS-Patterns aus diesem Ordner

### [TOMB-C001] .is-visible / .marks-visible Klassen-Toggle
- **Was war es**: JS schrieb `paper.classList.toggle('marks-visible', bool)`
- **Geloescht**: 2026-03-20 | ANTI-025
- **Ersatz**: `#paper[data-guides="true"] .fold-mark { display: block; }`
- **Warum**: DOM-Attribut ist SSoT, CSS reagiert direkt — kein JS-Mittler

### [TOMB-C002] JS-gesteuertes Toolbar show/hide via classList
- **Was war es**: `toolbar.classList.add('visible')` in `focusin` Event-Handler
- **Geloescht**: 2026-03-20 | 25 Zeilen JS → 4 Zeilen CSS
- **Ersatz**:
  ```css
  @layer project.overrides {
    #editor-toolbar { opacity: 0; pointer-events: none; transition: opacity .15s; }
    #paper:has([contenteditable]:focus-within) #editor-toolbar {
      opacity: 1; pointer-events: auto;
    }
  }
  ```

### [TOMB-C003] Pico CSS Full-Integration
- **Was war es**: Plan, Pico CSS als Base-Framework einzubinden (CDN)
- **Abgelehnt**: 2026-03-20 | ADR-001 | Context7 Deep Audit
- **Grund**: Pico's body-Reset kollidiert fundamental mit mm-Unit-System.
  ~80% der Pico-Regeln muessten mit !important ueberschrieben werden.
- **Extrakt**: 3 Konzepte als Vanilla CSS in @layer ui.theme umgesetzt.

### [TOMB-C004] margin-top fuer DIN-Zonen (Relative Positioning)
- **Was war es**: Zones mit `margin-top` relativ zum vorigen Element positioniert
- **Abgelehnt**: Projekt-Beginn | ANTI-001
- **Grund**: Aenderung eines Vorgaenger-Elements verschiebt alle Nachfolger.
  Im DL-Umschlag landet die Adresse ausserhalb des Sichtfensters.
- **Ersatz**: `position: absolute; top: var(--cma-variable);` — absolut, fest.
