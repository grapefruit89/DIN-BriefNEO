---
id: adr-css
title: 'ADR-CSS: CSS Architecture & Proportional Zoom'
type: adr
status: active
created: '2026-06-26'
updated: '2026-07-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/css
doc_links:
  - ADR-HTML
  - ADR-JS
  - ADR-ANTIPATTERN
  - longevity-guidelines
code_links:
  - website/css/layout.css
  - website/css/variables.css
error_patterns:
  - css architektur
  - container queries
  - cqw cqh
  - anchor positioning
  - oklch
  - light-dark
  - aspect-ratio
  - overflow hidden
  - betreff
  - falzmarken
  - pdf titel
  - pdf dateiname
  - window.print
supersedes:
  - adr-betreff
depends_on: []
---

# ADR-CSS: CSS Architecture & Proportional Zoom

## 1. Context & Problem

**WYSIWYG Skalierung ohne Scrollbalken.**

- Klassische Webanwendungen brechen oft das WYSIWYG-Prinzip durch unkontrolliertes Scrollen oder verzerrte Proportionen.

- Der DIN-BriefNEO-Bogen muss unter allen Bedingungen pixelperfekt proportional skaliert und absolut ohne Scrollbalken im Fenster dargestellt werden.

- Komplexe Layout-Aufgaben (Zoom, Theming, Positionierung) sollen ohne JavaScript gelöst werden, um die Langlebigkeit zu maximieren.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Pure CSS) | `aspect-ratio`, Container Queries (`cqw`/`cqh`), native APIs (`light-dark`, Anchor Positioning) | 100% Zero-JS, maximale Performance | Erfordert Chrome 148+ | Text overflow bei zu viel Text | **Gewählt** |
| **Option B** (JS-Driven) | ResizeObserver + `transform: scale()` | Abwärtskompatibel | Ruckeln, asynchrone Berechnungen | Hoher Wartungsaufwand | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Pure CSS Architecture) entschieden.**

### Begründung

- **Reiner CSS-Zoom:** `<din-a4>` wird auf `height: 94vh` und `aspect-ratio: 210 / 297` fixiert.

- **Container Queries:** Alle inneren Maße verwenden `cqw` und `cqh`, um proportional zum Papierbogen zu skalieren.

- **Absolute Viewport- & Blatt-Sperre:** `overflow: hidden` auf `html`/`body` und `overflow: clip; contain: strict;` auf `<din-a4>` und `#briefkern` verbieten jegliches Scrollen physisch.

- **Natives Feldwachstum & Text-Fitting:** `field-sizing: content` lässt Eingabefelder mitwachsen; `text-fit: shrink 60%` skaliert überlange Zeilen rein deklarativ (JS-Kill Phase 1).

- **Typografische Umbruchbalance:** `text-wrap: balance` im Betreff und `text-wrap: pretty` im Fließtext verhindern Waisen- und Witwenwörter nativ.

- **Natives Theming:** Vollständige Nutzung von `light-dark()` und W3C Relative Color Syntax (RCS) im OKLCH-Farbraum ohne JS-Theming.

- **Anchor Positioning:** W3C CSS Anchor Positioning für Dropdowns (z.B. `#address-suggestions`, `#plz-suggestions-popover`).

- **CSS @property & interpolate-size:** Für flüssige native Transitionen auf Custom Properties und `auto`-Maße.

- **CSS @scope:** Vollständige Kapselung der Briefblatt-Stile (`@scope (din-a4)`).

- **Zero-JS State Toggles:** Nutzung von `:has()` und Checkboxen für UI-State.

- **Falzmarken-Kollisionsschutz (ehemals ADR-BETREFF):**
  Die Falzmarken (`.din-mark`, `din-falz-oben`, `din-falz-unten`) werden im CSS auf exakt 8 mm (`width: calc(8 / 210 * 100cqw);`) am linken Rand begrenzt. Dadurch wird verhindert, dass sie als 100 % breite Linien durch das Dokument schneiden und den Betreff (`<din-betreff>`) optisch überdecken.

- **Nativer Print-Workflow & Dynamischer PDF-Titel (ehemals ADR-BETREFF):**
  Ausschließliche Nutzung des nativen Browser-Drucks (`window.print()`). Externe PDF-Generatoren (`html2pdf` o.ä.) sind strikt verboten (Zero Dependencies). Der PDF-Dateiname wird dynamisch vor dem Drucken über `document.title = YYYY-MM-DD_{Empfänger}_{Betreff}` gesetzt (unter Verwendung der Temporal API für ISO-Datumsformate), sodass der Browser automatisch einen normgerechten, sprechenden Dateinamen vorschlägt.

## 4. Consequences

### Positive Auswirkungen

- Absolut flüssige, stufenlose Echtzeit-Skalierung auf allen Displays.

- 100% WYSIWYG-konform: Druck = Bildschirm.

- JavaScript wird von Layout-Aufgaben vollständig befreit.

- Automatisch harmonisierte Farbschemata (RCS) im perceptually uniform OKLCH-Farbraum.

### Risiken & Negative Auswirkungen

- Texte müssen in der Höhe begrenzt sein (z. B. auf 1 A4-Seite), da Overflow-Scrolling deaktiviert ist.

- Bindung an hochmoderne Chromium-Engines (Chrome 148+).

- **Print CSS Saftey:** Strenge Vorgaben im `@media print` erforderlich (`height: auto !important`, `overflow: visible !important`). Die Nutzung von `page-break-before: always;` auf Container-Ebene führt zwingend zu leeren PDFs (siehe Law Catalog A46).

### Langfristige Auswirkungen

- **Architektur-Stabilität:** Die Codebasis bleibt extrem JS-arm und profitiert direkt von Engine-Optimierungen.

## 5. Implementation & Verification

- Alle CSS-Variablen sind in `layout.css` als OKLCH deklariert.

- Container-Maße (`cqw`, `cqh`) sind in der CSS-Basis verankert.

- `overflow: hidden` ist produktiv.

- Einhaltung wird durch die Anti-Pattern-Linter-Regeln für JS-basiertes Styling überprüft.

## 6. Related Documents

- [[ADR-HTML]]

- [[ADR-JS]]

- [[longevity-guidelines]]

- [[ADR-ANTIPATTERN]]

---

### Feature Checks

```javascript feature-check
// f("Feature Name", Bedingung, "Chrome XXX", "Status")
f("CSS :has() Selektor", typeof CSS !== "undefined" && CSS.supports && CSS.supports("selector(:has(div))"), "Chrome 105", "Produktiv"),
f("CSS field-sizing: content", typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing: content"), "Chrome 123", "Produktiv")
```