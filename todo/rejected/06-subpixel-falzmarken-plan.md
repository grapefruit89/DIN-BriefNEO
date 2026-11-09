---
status: rejected
type: concept
tags: [din5008, briefneo, plan, svg, falzmarken, verworfen]
summary: "Plan zur Umstellung von Falz- und Lochmarken auf SVG-Vektoren — VERWORFEN zugunsten der schlankeren CSS-Box-Lösung mit visibility: hidden; und Standard-Millimeter-Rastern. Inline-SVGs mit non-scaling-stroke erzeugen unnötigen DOM-Overhead ohne messbaren Mehrwert im PDF-Druck."
reason_rejected: "Verworfen zugunsten der schlankeren CSS-Box-Lösung mit visibility: hidden; und Standard-Millimeter-Rastern. Inline-SVGs mit non-scaling-stroke erzeugen unnötigen DOM-Overhead ohne messbaren Mehrwert im PDF-Druck."
---

# Subpixel-Falz- und Lochmarken (SVG vs. CSS-Border) – [VERWORFEN]

> 🚫 **Status: VERWORFEN**  
> **Begründung:** Verworfen zugunsten der schlankeren CSS-Box-Lösung mit `visibility: hidden;` und Standard-Millimeter-Rastern. Inline-SVGs mit `non-scaling-stroke` erzeugen unnötigen DOM-Overhead ohne messbaren Mehrwert im PDF-Druck.

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

## 2. Ursprünglicher Lösungsansatz (Verworfen)
Umstellung auf inline SVG-Elemente mit expliziter Strichstärke:
```html
<svg class="din-marke" viewBox="0 0 100 1" preserveAspectRatio="none">
  <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="currentColor" stroke-width="0.25mm" vector-effect="non-scaling-stroke" />
</svg>
```
- Exakte Strichstärke von 0,25 mm (oder 0,7 pt) gemäß typografischer Praxis.
- `vector-effect="non-scaling-stroke"` garantiert Unabhängigkeit von Transformationen.

---

## 3. Begründung für die Ablehnung
1. **Kein Mehrwert im PDF-Druck:** Moderne Chromium-PDF-Renderer (ab Chrome 120+) rasterisieren CSS-Border mit 0,5 pt bzw. 0,2 mm bereits subpixel-genau.
2. **DOM-Overhead:** Drei zusätzliche SVG-Elemente mit Vektorattributen vergrößern den DOM-Tree ohne visuellen Unterschied.
3. **Reflow-Schutz per CSS:** Durch die Umstellung auf `visibility: hidden;` (statt `display: none;`) beim Ausblenden von Marken bleiben die Layout-Boxen im Browser-Render-Tree stabil erhalten, ohne Reflows auszulösen.
