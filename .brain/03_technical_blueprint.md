---
tags: [aviation-grade, platinum-2026, spec-kit, architecture, css]
status: cemented
version: 1.0.0
last_audit: 2026-03-20
id: BRAIN-003-BP
title: CSS Technical Blueprint — Das Reinheitsgebot
authority: Gilt für alle Dateien in css/
traceability: [ADR-001, ADR-002, ADR-003, ADR-009, CAA-008, ANTI-023, ANTI-024]
---

# 03 — CSS Technical Blueprint: Das Reinheitsgebot

## Grundsatz: Beer CSS als Inspirationsquelle

Beer CSS (beercsss.com) organisiert seine Architektur in drei semantische
Schichten: Settings (Tokens), Elements (Tag-Selektoren), Helpers (Utilities).
Diese Philosophie deckt sich exakt mit dem DIN-BriefNEO-Ansatz:
Keine Klassen-Suppe, keine Framework-Abhängigkeit, maximale Isomorphie
zwischen Tag-Name und Styling-Selektor.

Die Adaptation für DIN-BriefNEO ist die folgende Dreischicht-Struktur,
die in der `@layer`-Deklaration von `din5008-paper.css` bereits zementiert ist:

```css
@layer din.core, ui.theme, project.overrides;
/*      ELEMENTS  SETTINGS  HELPERS              */
```

---

## SCHICHT 1: SETTINGS — Vakuum-Variablen als einzige Wahrheit

**Analogie zu Beer CSS:** Beer CSS definiert alle Design-Tokens in `:root`.
Kein Magic Number darf direkt in einer Regel stehen.

**In DIN-BriefNEO:** Die SETTINGS-Schicht sind die CSS Custom Properties
in `:root` von `din5008-paper.css`. Sie sind der **CMA Layer 3 Fallback** —
die statischen Werte, die immer greifen, wenn `cma-bridge.js` nicht läuft.

### Kanonische Variable-Gruppen

**Gruppe A: CMA-Koordinaten (Aviation Grade)**
```
--info-block-top:  97.4mm   M-009 — AVIATION GRADE: nie ändern
--subject-top:    103.4mm   M-010 — AVIATION GRADE: nie ändern
--footer-top:      269mm    M-014 — AVIATION GRADE: nie ändern
```

**Gruppe B: Layout-Dimensionen**
```
--page-width:      210mm    --page-height:     297mm
--margin-left:      25mm    --margin-right:     20mm
--address-width:    85mm    --address-height:   45mm
--text-width:      165mm    (= page - left - right)
```

**Gruppe C: Formspezifische Variablen (togglebar)**
```
--address-top:      45mm    (aktive Form: A=27mm, B=45mm)
--margin-top-a:     27mm    --margin-top-b:    45mm
```

**Gruppe D: Typografie**
```
--font-size-body:   11pt    --line-height:     14pt
```

**Gruppe E: Farb-Tokens (semantisch, nicht hexadezimal)**
```
--color-paper:   #ffffff    --color-bg:    #f0f0f0
--color-guide:   #cccccc    --color-error: #c0392b
--color-ok:      #27ae60    --color-focus: #2980b9
```

### Die SETTINGS-Invariante

> Kein mm-Wert darf direkt in einer CSS-Regel stehen.
> Jeder Positionswert ist ein `var(--cma-*)`.
> Ein Magic Number in `@layer din.core` ist ein ANTI-023-Verstoß.

Diese Regel ist prüfbar: `grep -rn "97\.4mm\|103\.4mm\|269mm" css/`
sollte nur Kommentare und `:root`-Definitionen treffen — niemals Regeln.

---

## SCHICHT 2: ELEMENTS — Tag-Selektoren ohne Klassen

**Analogie zu Beer CSS:** Beer CSS stylt HTML-Elemente direkt via Tag-Selektor.
`article { ... }`, `button { ... }` — keine künstlichen Klassen.

**In DIN-BriefNEO:** Die ELEMENTS-Schicht ist `@layer din.core`.
Sie stylt alle `<din-*>`-Custom-Tags direkt ohne ID oder Klasse.
Das ist die strukturelle Umsetzung der IMR-Isomorphie:

```
TAG-NAME   =  CSS-SELEKTOR     =  JSON-KEY
<din-subject>  →  din-subject { }  →  "subject"
```

### Element-Kategorien in @layer din.core

**Kategorie 1: Basis-Reset für alle din-Tags**
```css
din-sender, din-note, din-recipient, din-date,
din-your-ref, din-our-ref, din-subject, din-salutation,
din-body, din-greeting, din-signature {
  display: block;
  position: absolute;
  font-size: var(--font-size-body);
  line-height: var(--line-height);
  outline: none;
  min-height: var(--line-height);
}
```
Diese Regel ist die Basis. Kein Tag kann ohne display:block und
position:absolute korrekt im DIN-Raster funktionieren.

**Kategorie 2: Einzel-Tag-Regeln (Aviation Grade)**
Jeder `<din-*>` Tag hat seine CMA-Position via Variable:
```
din-date:    top: 0; left: var(--info-col-right)
din-subject: top: 0; (relativ im #betreff-zone Container)
din-sender:  top: var(--sender-zone-top); left: var(--margin-left)
```

**Kategorie 3: Container-Elemente**
Strukturelle Wrapper sind klassische IDs, keine Tags — sie sind nicht im IMR:
```
#anschriftzone, #informationsblock, #betreff-zone, #textbereich
```
Diese Container sind reine Layout-Hüllen. Sie haben kein contenteditable,
keinen JSON-Key, keinen State. Sie dürfen IDs haben.

### ELEMENTS-Invariante

> `@layer din.core` enthält AUSSCHLIESSLICH:
> - `position`, `top`, `left`, `width`, `height` via `var(--cma-*)`
> - `font-size`, `line-height`, `display`, `overflow` als Basis-Properties
>
> `@layer din.core` enthält NIEMALS:
> - Farben, Schatten, border-radius, Animationen
> - px-Werte für Positionen
> - `[data-*]`-Selektoren (das ist Aufgabe von HELPERS)

Diese Trennung garantiert: Kein ästhetischer Eingriff kann je die
mm-genaue DIN-5008-Positionierung korrumpieren.

---

## SCHICHT 3: HELPERS — Minimalistische State-Maschine

**Analogie zu Beer CSS:** Beer CSS hat Utility-Klassen für schnelle
Layout-Tweaks (`.s`, `.m`, `.l` für Responsive-Breakpoints).

**In DIN-BriefNEO:** Die HELPERS-Schicht ist `@layer project.overrides`.
Sie ist die **CSS-Seite der No-JS-Doctrine**. Jede Regel hier ist eine
Zeile JS, die nicht existieren muss.

### Helper-Kategorien in @layer project.overrides

**Kategorie 1: Form-Toggle (A/B)**
```css
#paper[data-layout="form-a"] #anschriftzone { top: var(--margin-top-a); }
#paper[data-layout="form-b"] #anschriftzone { top: var(--margin-top-b); }
```
JS schreibt `paper.dataset.layout`. CSS reagiert. Kein klassenbasierter Toggle.

**Kategorie 2: Sichtbarkeits-Helpers**
```css
.fold-mark, .punch-mark { display: none; }
#paper[data-guides="true"] .fold-mark,
#paper[data-guides="true"] .punch-mark { display: block; }
```
Kein `classList.toggle()`. Das Attribut ist die SSoT.

**Kategorie 3: Toolbar via :has() (CSS-Intelligenz)**
```css
#editor-toolbar { opacity: 0; pointer-events: none; }
#paper:has([contenteditable]:focus-within) #editor-toolbar {
  opacity: 1; pointer-events: auto;
}
```
Dies eliminiert ~25 Zeilen JS (`focusin`/`focusout`-Handler). CSS
"weiß" via `:has()`, ob ein Feld im Paper fokussiert ist.

**Kategorie 4: Placeholder-System (data-* basiert)**
```css
[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: var(--color-guide);
  font-style: italic;
}
```
Kein JS-Placeholder-Management. Das Attribut im HTML ist die SSoT.

**Kategorie 5: Anrede-Intelligence (data-gender)**
```css
din-salutation[data-gender="m"]:empty::before {
  content: "Sehr geehrter Herr …";
}
din-salutation[data-gender="f"]:empty::before {
  content: "Sehr geehrte Frau …";
}
```
JS schreibt nur `el.dataset.gender = 'm'`. Die Anzeige-Logik gehört CSS.

**Kategorie 6: Selection-Guard (ANTI-015)**
```css
body > *:not(#paper) { user-select: none; -webkit-user-select: none; }
```
Verhindert, dass Sidebar-Text bei Brief-Selektion mitmarkiert wird.

### HELPERS-Invariante

> `@layer project.overrides` enthält AUSSCHLIESSLICH:
> - `[data-*]`-Selektor-Regeln
> - `:has()`-Logik
> - Sichtbarkeits-Toggle via `display`/`opacity`/`pointer-events`
>
> `@layer project.overrides` enthält NIEMALS:
> - mm-Positionswerte
> - Absolute Koordinaten
> - Styles, die das DIN-Raster beeinflussen

---

## CSS-Datei-Zuständigkeiten

| Datei | Inhalte | @layer-Nutzung |
|---|---|---|
| `din5008-paper.css` | CMA-Variablen, din-* Tags, Anschriftzone | alle drei Layer |
| `sidebar.css` | App-Shell-Grid, Links/Rechts-Sidebar, Debug-Panel | `ui.theme` + `project.overrides` |
| `devmode.css` | Devmode-Overlays, Inspector-Panel | `ui.theme` nur |

### sidebar.css: Die Sidebar-Größen (s/m/l-Logik)

Die Sidebar-Architektur folgt einer zweigeteilten Struktur:

- `#sidebar-left`: 300px — fest, immer sichtbar, Haupt-Controls
- `#sidebar-right`: 360px — Popover-Panel, via `[popover]` API gesteuert
- `#paper-viewport`: `1fr` — Rest, zentriert das Paper

**Keine `display:none`-Klassen, keine JS-Toggle:**
Die rechte Sidebar ist ein `[popover]`-Element. Der Browser kontrolliert
ihre Sichtbarkeit nativ. Kein JS-Handler für show/hide.

---

## Chrome Baseline 146+ — Neue TIER-1-Features

**Kontext:** Chrome 146+ bringt Full Support für drei Standards, die
vorherige Sessions noch als TIER-2 (Beobachten) klassifiziert hatten.

| Standard | Status mit Chrome 146+ | Neues Tier | Konsequenz |
|---|---|---|---|
| CSS Anchor Positioning | Chrome 146+ Full Support | **TIER-1** | Tooltip-Overlays ohne JS möglich — ADR-009 Kandidat |
| Invoker Commands | Chrome 146+ Full Support | **TIER-1** | JS-Shims können entfernt werden wenn Firefox folgt |
| Sanitizer API | Chrome 146+ Full Support | **TIER-1** | `setHTML()` für Ghost-Mirror — sofort nutzbar |

**Kritische Einschränkung:**
"Chrome 146+ Full Support" ≠ "Web Baseline" im strengen Sinne.
Web Baseline bedeutet cross-browser (Chrome + Firefox + Safari).
Für MANDATE-FREEZE gilt: Ein Feature ist erst dann ohne `@supports`-Guard
einsetzbar, wenn alle Ziel-Browser es unterstützen.

**Empfehlung:**
- Sanitizer API: Sofort nutzen (Firefox 135+, Safari 17.4+ — echte Baseline 2025)
- CSS Anchor Positioning: Mit `@supports`-Guard verwenden (Firefox-Status prüfen)
- Invoker Commands: HTML-Attribute heute setzen, JS-Shim bis Firefox GA

---

## Das Reinheitsgebot (Zusammenfassung)

```
SETTINGS  →  :root { --var: wert; }            (Tokens — nie direkt im Code)
ELEMENTS  →  @layer din.core { din-tag { } }   (Tags — isomorph zum IMR)
HELPERS   →  @layer project.overrides {        (State — JS-frei via data-*)
               #paper[data-x] { ... }
             }
```

**Die drei Verbote (aus css/GEMINI.md, hier bestätigt):**
1. Keine Magic Numbers für DIN-Maße — nur `var(--cma-*)`
2. Keine relativen Positionierungen für DIN-Zonen — nur `position: absolute`
3. Kein CSS außerhalb des Layer-Systems — jede Regel in ihrem Layer

**Das Hierarchie-Gesetz:**
```
din.core (schwach) < ui.theme (mittel) < project.overrides (stark)
```
Kein `!important` nötig. Die Layer-Reihenfolge löst alle Spezifitätskonflikte.
