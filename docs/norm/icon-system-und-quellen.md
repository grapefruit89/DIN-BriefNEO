---
id: icon-system-und-quellen
title: 'Icon-System & SVG-Quellen'
type: guide
status: active
created: '2026-10-24'
updated: '2026-10-24'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/guide
doc_links:
  - din-5008-css-architektur
  - glossary
code_links:
  - website/index.html
  - website/css/sidebar.css
error_patterns:
  - icons
  - svg quellen
  - lucide
  - icon bibliothek
supersedes: []
depends_on: []
---

# Icon-System & SVG-Quellen

> [!INFO] Single Source of Truth für UI-Icons
> Dieses Dokument beschreibt das visuelle Icon-System von DIN-BriefNEO, die kanonische Quellbibliothek und empfohlene Alternativen für moderne Web-Interfaces.

---

## 1. Primäre Quellbibliothek: Lucide Icons

DIN-BriefNEO nutzt für alle Icons (Seitenleiste, Theme-Umschalter, Druck-Buttons, Dialoge) das quelloffene Icon-Set **Lucide**:

- **Offizieller Katalog & Suche:** [https://lucide.dev/icons](https://lucide.dev/icons)
- **Lizenz:** ISC / MIT (Open Source, uneingeschränkt kommerziell nutzbar)
- **Umfang:** > 1.500 minimalistische Linien-Icons
- **Vorteil:** Per 1-Klick ("Copy SVG") direkt als Inline-SVG ohne Abhängigkeiten nutzbar.

### Kanonischer SVG-Standard im Projekt

Alle SVGs in `website/index.html` und Komponenten folgen diesen einheitlichen Attributen:

```html
<svg xmlns="http://www.w3.org/2000/svg" 
     width="20" height="20" 
     viewBox="0 0 24 24" 
     fill="none" 
     stroke="currentColor" 
     stroke-width="2" 
     stroke-linecap="round" 
     stroke-linejoin="round" 
     class="lucide lucide-<name>" 
     aria-hidden="true">
  <!-- path d="..." -->
</svg>
```

- `fill="none"` & `stroke="currentColor"`: Passt sich automatisch den CSS-Farbwerten und Dark-/Light-Modes an.
- `aria-hidden="true"`: Dekorative Icons werden Screenreadern nicht störend vorgelesen (der Button trägt das `aria-label`).
- `viewBox="0 0 24 24"`: Standard-Raster für pixelgenaue Skalierung (z. B. auf 16×16, 20×20 oder 24×24 Pixel).

---

## 2. Vergleichbare hochwertige SVG-Icon-Bibliotheken

Für weitere Projekte oder alternative UI-Stile gibt es folgende etablierte Bibliotheken mit ähnlicher Qualität und Suchfunktion:

| Bibliothek | URL | Stil & Besonderheiten | Umfang |
| :--- | :--- | :--- | :--- |
| **Lucide Icons** | [lucide.dev/icons](https://lucide.dev/icons) | **Projektstandard:** Schlichte 24×24 Linien-Icons, Nachfolger von Feather Icons | ~1.500 |
| **Tabler Icons** | [tabler.io/icons](https://tabler.io/icons) | 24×24 Outline, Strichstärke (`stroke-width`) und Größe direkt im Web-Katalog einstellbar | > 5.200 |
| **Heroicons** | [heroicons.com](https://heroicons.com) | Von den Tailwind-Machern. Outline (24×24), Solid (24×24), Mini (20×20) und Micro (16×16) | ~300 |
| **Phosphor Icons** | [phosphoricons.com](https://phosphoricons.com) | Extrem flexibel: Jedes Icon in 6 Stilen (Thin, Light, Regular, Bold, Fill, Duotone) | > 9.000 |
| **Radix Icons** | [icons.radix-ui.com](https://icons.radix-ui.com) | 15×15 Grid, hochpräzise und kompakt für dichte Menüs und Toolbars | ~300 |
| **Simple Icons** | [simpleicons.org](https://simpleicons.org) | Kanonische Quelle für SVG-Markenlogos (GitHub, Google, Apple, Linux etc.) | > 3.000 |
| **Iconify** | [icon-sets.iconify.design](https://icon-sets.iconify.design) | Universelle Meta-Suchmaschine für über 150 Icon-Sets gleichzeitig | > 200.000 |
