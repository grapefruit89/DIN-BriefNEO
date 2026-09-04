# Modern CSS 2026: Gesamtreferenz & Praxis-Snippets

> **Quelle:** MDN Web Docs & Chrome Platform Status 2026 (128 CSS-Features)  
> **Projekt:** DIN-Brief Neo (`website/css/`)  
> **Klassifizierung:** 8 architektonische Gamechanger (JS-Ablösung) + 6 ergänzende Spezial-Features.

---

## TEIL 1: DIE 8 GAMECHANGER (Ablösung von JavaScript & DIN-Präzision)

Diese 8 Funktionen tragen 90 % des Nutzens und eliminieren ~750 Zeilen JavaScript:

| # | Feature | Hauptaufgabe im Projekt | Ersetzt bisher |
| :--- | :--- | :--- | :--- |
| **1** | `field-sizing: content` | Automatisches Mitwachsen von Eingabefeldern | 48-text-fit.js (8 Funktionen) |
| **2** | `text-box-trim` & `text-box-edge` | Exakte DIN 5008 Millimeter-Maße ohne Font-Leading | 15+ ungenaue `calc()`-Hacks |
| **3** | `light-dark()` | Einzeilige Definition von Hell-/Dunkel-Farben | Doppelte Tokens in `:root` und `.dark` |
| **4** | `color-mix()` | Dynamische Dim-Stufen und Transparenzen | Statische Farb-Codes in JS/CSS |
| **5** | `@starting-style` | Weiche Transitions von `display: none` auf `display: block` | `@keyframes` & `setTimeout`-Klassen |
| **6** | `interpolate-size: allow-keywords` | Sanfte Animationen auf `height: auto` | JS `element.scrollHeight`-Messung |
| **7** | CSS Anchor Positioning | Toolbar & Marken direkt an DOM-Kanten verankern | `getBoundingClientRect()` in JS |
| **8** | `text-wrap: balance & pretty` | Typografischer Schutz vor Waisen-Wörtern | Manuelle Umbrüche im Brieftext |

---

## TEIL 2: DIE 6 ERGÄNZENDEN SPEZIAL-FEATURES (Druck, Fonts & Suche)

Neben den 8 Gamechangern gibt es aus dem 2026-Katalog 6 weitere nützliche CSS-Features für das Projekt:

### 9. `@page` Margin Boxes & `counter(page)` (Druck-Paginierung)
- **Was es macht:** Ermöglicht echte Seitennummerierung („Seite X von Y“) und Kopf-/Fußzeilen direkt im Druck-CSS.
- **Syntax & Snippet (`print.css`):**
```css
@page {
  size: A4 portrait;
  margin: 20mm;
  @bottom-right {
    content: "Seite " counter(page) " von " counter(pages);
    font-size: 9pt;
    color: #666;
  }
}
```
*Nutzen:* Keine künstlichen DOM-Container am Blattende für Seitenzahlen mehr nötig.

---

### 10. `::highlight(*)` (Universal Custom Highlight Selector)
- **Was es macht:** Hebt gefundene Suchbegriffe (z. B. bei der Adress-Suche oder im Text) direkt über die CSS Custom Highlight API hervor.
- **Syntax & Snippet (`floating.css`):**
```css
::highlight(search-match) {
  background-color: color-mix(in srgb, var(--accent-color) 30%, transparent);
  color: inherit;
}
```
*Nutzen:* Man muss den DOM-Text nicht mehr in separate `<span>`-Tags zerlegen (`innerHTML`-Sicherheitsrisiko entfällt).

---

### 11. `@property` (Typed CSS Custom Properties)
- **Was es macht:** Registriert CSS-Variablen mit festem Typ (z. B. `<color>`, `<length>`, `<percentage>`).
- **Syntax & Snippet (`variables.css`):**
```css
@property --theme-dim {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}
```
*Nutzen:* CSS-Variablen können jetzt flüssig animiert und interpoliert werden (z. B. beim Dimmen).

---

### 12. CSS `subgrid` (Perfekte Adress- & Infoblock-Ausrichtung)
- **Was es macht:** Lässt Kind-Elemente (z. B. im Anschriftfeld und Infoblock) das Raster des Eltern-Containers mitbenutzen.
- **Syntax & Snippet (`layout.css`):**
```css
din-anschriftfeld {
  display: grid;
  grid-template-rows: subgrid;
}
```
*Nutzen:* Garantiert, dass Zeilenhöhen im Anschriftfeld und im rechten Infoblock exakt parallel auf derselben DIN-Höhe verlaufen.

---

### 13. `font-palette` & Modern `@font-face` Descriptors
- **Was es macht:** Feine Steuerung von hochgeladenen WOFF2-Schriftarten (z. B. `font-width`, `font-display`).
- **Syntax & Snippet (`variables.css`):**
```css
@font-face {
  font-family: 'AptosCustom';
  src: url(...) format('woff2');
  font-display: swap;
  font-width: 100%;
}
```

---

### 14. Modern View Transitions (`@view-transition`)
- **Was es macht:** Weiche Übergänge bei großen Layout-Wechseln (z. B. Wechsel von DIN-Form A auf DIN-Form B).
- **Syntax & Snippet (`layout.css`):**
```css
@view-transition {
  navigation: auto;
}

din-a4 {
  view-transition-name: din-paper;
}
```
*Nutzen:* Wenn der Nutzer in der Sidebar zwischen Form A (27mm) und Form B (45mm) umschaltet, morphing-gleitet der Briefkopf flüssig in die neue Position.

---

## Zusammenfassung: Das komplette 14-Feature-Paket

| Gruppe | Anzahl | Hauptnutzen |
| :--- | :--- | :--- |
| **Kategorie 1: Gamechanger (Top 8)** | **8 Features** | JavaScript-Code löschen & DIN 5008 Präzision garantieren |
| **Kategorie 2: Spezial-Features (Top 6)** | **6 Features** | Echte Druckpaginierung, flüssige Form A/B Transitions, Highlighting |
| **GESAMTPAKET** | **14 CSS-Features** | Vollständige Modernisierung auf den Web-Stand 2026 |
