---
id: din-5008-css-architektur
title: 'DIN 5008 CSS-Architektur — Layout-Philosophie & Feature-Referenz'
type: guide
status: active
created: '2026-06-26'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/guide
  - tech/css
doc_links:
  - ADR-CSS
  - longevity-guidelines
  - no-scroll-techniques
  - chrome-modern-css
code_links:
  - website/css/layout.css
  - website/css/variables.css
error_patterns:
  - din 5008 layout
  - css architektur
  - container queries
  - absolute positionierung
  - latex lessons
  - light-dark
  - oklch
  - container units
  - cqw cqh
  - popover api
  - anchor positioning
supersedes:
  - din-5008-precise-layout-lessons
  - chrome-modern-css
depends_on: []
---

# DIN 5008 CSS-Architektur — Layout-Philosophie & Feature-Referenz

Zwei Perspektiven auf dieselbe Architektur: **Warum** wir so denken (Lessons Learned aus LaTeX) und **Was** wir konkret einsetzen (moderne CSS-Feature-Referenz für Chrome 148+).

---

## Teil 1 — Layout-Philosophie (Lessons Learned aus LaTeX)

In der frühen Explorationsphase haben wir das LaTeX-Paket `GerLaTeXLetter` tiefgehend analysiert. Während LaTeX für eine Web-Applikation ungeeignet ist, lieferte es entscheidende konzeptionelle Erkenntnisse, die direkt in unsere CSS-Architektur eingeflossen sind.

### 1.1 Absolute Koordinaten statt relativer Abstände

**LaTeX-Philosophie:** Ein Brief definiert sein Layout über absolute Koordinaten auf einem A4-Gitter (`\setplength{toaddrvpos}{45mm}`), nicht über relative Margins.

**Unsere Umsetzung im Web:**
- CSS Custom Properties (Typed): `--pos-y-address: 45mm;`
- Alle semantischen Zonen (`<din-address-zone>`, `<din-infoblock>`) werden absolut innerhalb der `<din-page>` positioniert.
- Dadurch garantieren wir pixel- und millimetergenaue PDF-Ausgaben, die exakt in ein DIN-Fensterkuvert passen.

### 1.2 Strikte Trennung von Form A und Form B

**LaTeX-Philosophie:** Harte Schalter für Form A (hoher Briefkopf) und Form B (niedriger Briefkopf), die das gesamte Y-Koordinatensystem verschieben.

**Unsere Umsetzung:** Ein simpler Toggle auf dem Root-Element (`<html data-form="A">`) überschreibt die Y-Koordinaten der CSS-Variablen. Kein JavaScript berechnet Zonen — das CSS-Grid adaptiert sich nahtlos.

### 1.3 Falz- und Lochmarken

**LaTeX-Philosophie:** Millimetergenaue Linien am linken Blattrand für Lochen und Falten.

**Unsere Umsetzung:** Rein per CSS (`::before` / `::after`) an fixen Y-Koordinaten (87mm, 105mm, 148.5mm, 192mm, 210mm). Im `print`-Stylesheet deaktivierbar für Blanko-Briefpapier.

### 1.4 Semantische Datenstruktur

**LaTeX-Philosophie:** Trennung von Daten (`\setkomavar{fromname}{Max Mustermann}`) und Repräsentation.

**Unsere Umsetzung:** Semantische Custom Elements (`<din-sender>`, `<din-recipient>`). Visuelle Struktur (CSS) strikt vom Inhalt getrennt.

> **Fazit:** LaTeX hat gelehrt, dass man für Briefe nicht in *Fließtext-Dokumenten*, sondern in *technischen Zeichnungen* denkt. DIN-Brief NEO ist im Kern keine Textverarbeitung, sondern eine technische Zeichnung auf einem A4-Canvas.

---

## Teil 2 — Moderne CSS-Feature-Referenz (Chrome 148+)

Da die App Chrome 148+ voraussetzt, nutzen wir hochmoderne Web-Plattform-Features nativ — ohne Polyfills, ohne Prefix-Hacks.

### 2.1 Farbthemen & Design Tokens

**`light-dark()` Funktion** — Gibt abhängig vom berechneten `color-scheme` entweder einen hellen oder dunklen Farbwert zurück.
> Relevanz: **Hoch.** Nativer Dark Mode ohne JavaScript-Klassen-Toggling.

**`oklch()` Farbraum** — Wahrnehmungsgerechter Farbraum mit konsistenten Helligkeitsstufen über alle Farbtöne.
> Relevanz: **Mittel.** Für präzise Schatten und sanfte Grauabstufungen in der Sidebar.

### 2.2 Layout & Responsiveness

**`container-type: size` + Container-Einheiten (`cqw` / `cqh`)** — Elemente orientieren sich an der Größe ihres Containers, nicht des Viewports.
> Relevanz: **Extrem Hoch.** Das Herzstück des No-Scroll-Layouts. Der Briefbogen (`<din-a4>`) skaliert dynamisch in den verfügbaren Platz. Alle DIN 5008-Abstände (Falzmarken) werden in `cqh`/`cqw` berechnet — stufenlos zoombar ohne Maßstabsbruch.

**`field-sizing: content`** — Input-Felder wachsen ohne JavaScript automatisch mit ihrem Inhalt.
> Relevanz: **Hoch.** Für Auto-Grow-Bereiche wie den Betreff ohne `contenteditable`.

### 2.3 Interaktion & UI

**`:has()` Pseudo-Klasse** — CSS-Parent-Selector: Elternelement basierend auf seinem Inhalt stylen.
> Relevanz: **Hoch.** Warn-Rahmen um den Briefkern, falls ein Kind-Element einen Überlauf erzeugt.

**Popover API (`popover`)** — Natives Top-Layer-Overlay mit Light-Dismiss und ESC-Support, ohne z-index-Kämpfe.
> Relevanz: **Hoch.** Für die schwebende Formatierungsleiste (Fett, Kursiv) über dem Text.

**CSS Anchor Positioning** — Positioniert ein Element relativ zu einem Anker-Element ohne DOM-Verschachtelung.
> Relevanz: **Niedrig (aktuell).** Zukünftig für Dropdowns bei der Adress-Autovervollständigung.

### 2.4 Feature-Stabilität

Alle oben genannten Features sind auf **Chrome 148+** stabil verfügbar. Ein manueller JavaScript-Feature-Check ist unnötig — wir definieren Chrome 148+ als harte Engine-Vorbedingung.
