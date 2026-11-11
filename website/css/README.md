# DIN-BriefNEO — CSS-Architektur & Stylesheet-Landkarte (`website/css/`)

> **Stand:** 09. November 2026  
> **Umfang:** 5 Dateien, 2.881 Zeilen CSS (394 Regeln)  
> **Plattform:** Reines natives Chromium 150+ Baseline (CSS `@function`, CSS Multi-column L2, Container Queries, OKLCH, native Popovers)

---

## 1. Stylesheet-Übersicht & Metriken

| Datei | Zeilen | Regeln | Bytes | Primäre Rolle | Zuständigkeit |
|---|:---:|:---:|:---:|---|---|
| [`base.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/base.css) | 351 | 44 | 10,8 KB | Reset, Tokens, Mathematik | Design-Tokens (OKLCH), Typografie-Stacks, relative `@function` (`--mm-rel-x`, `--mm-rel-y`, `--pt-rel`), App-Shell-Grid & gemeinsame Print-Resets |
| [`sheet-common.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-common.css) | 426 | 68 | 11,1 KB | DIN-5008-Geometrie (Gemeinsam) | Deklaratives Attribut-Mapping (`din-blatt { --blatt-breite: attr(...) }`), Falz- & Lochmarken, Anschriftfeld, Infoblock, Hilfslinien, Unterschrift |
| [`sheet.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet.css) | 299 | 33 | 9,4 KB | Einseiten-Layout (Screen/Print) | Viewport-Container, Einseiten-Briefkern, Skalierungs-Container, Paged Media `@page` & Einzelseiten-Druck |
| [`sheet-multipage.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-multipage.css) | 541 | 61 | 14,3 KB | Mehrseiten-Layout (Screen/Print) | Absolute `@function` (`--mm-abs-x`, `--mm-abs-y`, `--pt-abs`), CSS Multicol Level 2 Spaltenfluss, Paged Media `@page` & dynamische Folgeköpfe |
| [`sidebar.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sidebar.css) | 1.260 | 187 | 33,7 KB | App-Shell & UI-Komponenten | Werkzeugleiste, Form A/B Umschalter, Drag&Drop, Toasts (`#hinweis-v4`), Popovers, Adress-Vorschläge, Badges |

---

## 2. Kaskaden-Ablauf & Lade-Reihenfolge (Cascade Flow)

Die Stylesheets werden bewusst und ausschließlich über statische `<link rel="stylesheet">`-Tags im HTML-`<head>` von [`website/index.html`](file:///home/moritz/repos/DIN-BriefNEO/website/index.html) eingebunden:

```html
<!-- 1. Tokens, Basis-Reset & DIN-Mathematik (@function) -->
<link rel="stylesheet" href="css/base.css">

<!-- 2. UI-Shell, Sidebar-Steuerung, Dialoge & Popovers -->
<link rel="stylesheet" href="css/sidebar.css">

<!-- 3. Gemeinsame DIN-5008-Blattgeometrie & Faltmarken -->
<link rel="stylesheet" href="css/sheet-common.css">

<!-- 4. Blatt-Schnittstelle: fest mehrseitig (Einzelseiten-Modus stillgelegt) -->
<link rel="stylesheet" href="css/sheet-multipage.css">
```

### Cascade-Hierarchie:
1. **`base.css`**: Legt die CSS Custom Properties auf `:root` fest und deklariert die standardisierten mathematischen CSS Functions (`@function`).
2. **`sidebar.css`**: Definiert alle isolierten Bedienelemente außerhalb des Briefblatts. Beeinflusst das Blatt nicht (0 Custom-Property-Kollisionen).
3. **`sheet-common.css`**: Etabliert das Custom Element `<din-blatt>` als `container-type: inline-size` und berechnet DIN-Felder deterministisch via `attr(data-* type(<number>))` und `cqw`/`cqh`.
4. **`sheet.css` bzw. `sheet-multipage.css`**: Das spezialisierte Layout-Sheet vervollständigt den Kaskaden-Baum für den Inhaltskern (`#kern`, `#text`).

---

## 3. CSS-Schichten-Modell

```
┌────────────────────────────────────────────────────────────────────────┐
│ Layer 4: Utility-, Status- & Animations-Layer                          │
│   :root[data-theme], [data-plugin-*], [data-ueberlauf], @keyframes     │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 3: UI- & Seitenleisten-Layer                                     │
│   sidebar.css (Toolbar, Popovers, Segmented Controls, Badges, Toast)   │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 2: DIN-5008-Layout- & Blatt-Layer                                │
│   sheet-common.css · sheet.css · sheet-multipage.css                   │
│   (Form A/B Geometrie, Faltmarken, Paged Media @page, Print-Resets)    │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 1: Reset- & Shell-Layer                                          │
│   base.css (#app-shell Grid, Viewport-Scroll, Focus-Rings)             │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 0: Design-Tokens & Mathematische Funktionen                      │
│   base.css (:root OKLCH-Farben, Typografie-Stacks, @function Formeln)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Risiko-Prüfung & Neuralgische Punkte

### 4.1 Zirkuläre Importe & Lade-Konflikte
- **`@import`-Audit:** **0 Vorkommen.** Keine einzige Datei nutzt `@import`. Dadurch entfallen Netzwerkkaskaden und Latenzen auf dem Critical Rendering Path (FCP) vollständig.
- **Kein Sheet-Austausch mehr:** `sheet-multipage.css` ist fest verlinkt und damit render-blockierend — es gibt keinen Pfad mehr, auf dem ein zweites Layout nach dem ersten Paint nachrücken könnte.
  - Der Einzelseiten-Modus (`sheet.css`) ist stillgelegt, die Datei bleibt ungenutzt liegen: siehe [ADR-EINSEITEN-STILLGELEGT](file:///home/moritz/repos/DIN-BriefNEO/docs/10-architecture/ADR-EINSEITEN-STILLGELEGT.md).
  - Ein `link.href`-Tausch ist **nicht** render-blockierend; genau daran hing der gemessene FOUC (38 ms nackter Dokumentfluss, danach Blattlayout).

### 4.2 Custom Properties Single Source of Truth (SSoT)
- **Root-Definitionen:**
  - Alle 87 globalen Variablen sind auf `:root` bzw. `:root[data-theme]` in `base.css` deklariert (OKLCH Farbräume, Typografie, Schattierungen).
  - Variablen für die DIN-Geometrie (`--blatt-breite`, `--blatt-hoehe`, `--falzmarke-1-y`, `--infoblock-y`, etc.) werden exklusiv am Custom Element `din-blatt` gebunden.
- **Undeclared Variables Check:**
  - Alle Parameter (`--mm`, `--points`) sind Argumente nativer `@function`-Deklarationen.
  - Dynamische Variablen (`--sig-x`, `--sig-y`, `--sig-scale`, `--sig-rot`, `--i`) besitzen konsistente Fallback-Defaults (`var(--sig-x, 11.9cqw)`).
- **Namensraum-Kollisionen:**
  - Ein Kreuzvergleich zwischen den Custom Properties von `sidebar.css` und den Blatt-Stylesheets ergab exakt **0 Überschneidungen**. Komponenten überschreiben niemals versehentlich Blatt-Variablen.

### 4.3 Geometrie-Invarianz nach DIN 5008
- **Zentrale Maße Form A vs. Form B:**
  - Form B (Standard): Faltmarke 1 bei 105 mm, Anschriftfeld 45 mm, Infoblock Y = 40 mm.
  - Form A: Faltmarke 1 bei 87 mm, Anschriftfeld 27 mm, Infoblock Y = 32 mm.
- **Single Source of Truth im DOM:**
  - Die numerischen Maße stehen als HTML-Datenattribute am `<din-blatt>` (`data-falzmarke-1-y-b="105"`, `data-falzmarke-1-y-a="87"`).
  - [`sheet-common.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-common.css) transformiert diese Werte über `attr(... type(<number>))` und `@function --mm-y()` in relative Container-Units (`cqh`).
  - Es existieren **keine Millimeter-Dubletten** in `sidebar.css` oder JavaScript.

### 4.4 Print- vs. Screen-Isolierung
- **Druck-Resets:**
  - [`base.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/base.css) setzt im `@media print`-Block `color-scheme: light !important`, schaltet alle interaktiven Outlines ab und erzwingt `print-color-adjust: exact`.
  - [`sheet.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet.css) und [`sheet-multipage.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-multipage.css) unterdrücken garantiert alle Bildschirmelemente:
    ```css
    aside, .nicht-drucken, [popover], #hinweis-v4, #font-uploader,
    .unterschriftsbild-griff, .unterschriftsbild-drehgriff,
    #anschriftfeld::after { display: none !important; }
    ```
- **Spezifitäts-Hygiene:**
  - `!important` wird fast ausschließlich im Print-Block verwendet, um Browser-Defaults (wie automatische Druckränder oder Farbinversionen) zu überschreiben. Screen-Styles kommen ohne Spezifitätskriege aus.
