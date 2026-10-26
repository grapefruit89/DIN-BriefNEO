---
status: draft
type: concept
tags: [din5008, briefneo, plan, svg, falzmarken]
summary: "Plan zur Umstellung von Falz- und Lochmarken auf SVG-Vektoren für Subpixel-Druckpräzision."
---

# Subpixel-Falz- und Lochmarken (SVG vs. CSS-Border) – Plan für DIN-BriefNEO

**Quelle:** Analyse alter Versionen & Backlog `B35`  
**Stufe:** HTML/CSS (SVG)  
**Aufwand:** S  
**ROI:** ⭐⭐⭐ (Druckqualität & Normgenauigkeit)

---

## 1. Problemstellung
Aktuell werden Falzmarken (`din-falz-oben`, `din-falz-unten`, `din-lochmarke`) meist als CSS-Border gezeichnet:
```css
border-top: 1px solid var(--clr-marken);
```
Auf Bildschirmen (96 DPI) und im Druckertreiber (300/600/1200 DPI) führt dies zu Rundungsdifferenzen (Hairline-Artefakte, asymmetrische Linienstärken bei Skalierung, minimale vertikale Abweichungen).

---

## 2. Lösungsansatz
Umstellung auf inline SVG-Elemente mit expliziter Strichstärke:
```html
<svg class="din-marke" viewBox="0 0 100 1" preserveAspectRatio="none">
  <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="currentColor" stroke-width="0.25mm" vector-effect="non-scaling-stroke" />
</svg>
```
- Exakte Strichstärke von 0,25 mm (oder 0,7 pt) gemäß typografischer Praxis.
- `vector-effect="non-scaling-stroke"` garantiert Unabhängigkeit von Transformationen.

---

## 3. Randbedingungen & Invarianten
1. **Geometrie-SSoT:** Die Y-Positionen (`data-falz-1-y="105"`, `data-falz-2-y="210"`, `data-loch-y="148.5"`) verbleiben als deklarative `data-*`-Attribute am HTML-Container (`<din-a4>`).
2. **`print.css`-Whitelisting:** Sicherstellen, dass globale SVGs beim Drucken nicht durch restriktive Druck-Styles (`display: none`) ausgeblendet werden.
