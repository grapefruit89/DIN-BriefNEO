---
title: Technischer Guide: No-Scroll-Techniken (Viewport-Perfect Layouts)
status: active
tags: [documentation, guide, manual]
---

# Technischer Guide: No-Scroll-Techniken (Viewport-Perfect Layouts)

Dieses Dokument beschreibt die Design- und Implementierungsmuster, um ein ausnahmsloses Scroll-Verbot in der Anwendung durchzusetzen. Das Ziel ist eine Anwendung, die sich perfekt und elastisch in die Grenzen des Viewports einpasst.

---

## 1. Das globale Sicherheitsnetz
Um jegliches versehentliche Scrollen im Keim zu ersticken, erhält die oberste Ebene des HTML-Dokuments eine absolute Sperre:

```css
/* css/reset.css */
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100dvh; /* Dynamische Viewport-Höhe (beachtet mobile Adressleisten) */
  overflow: hidden; /* Scrollbalken komplett verbieten */
  user-select: none; /* Unbeabsichtigtes Markieren von UI verhindern */
}
```

---

## 2. Die Flexbox- & Grid-Kaskade
Die Benutzeroberfläche wird mit einem App-Shell-Layout strukturiert. Alle Container müssen die Höhe ihrer Eltern-Elemente erben und dürfen diese niemals überschreiten.

```css
#app-shell {
  display: grid;
  grid-template-columns: 280px 1fr; /* Feste Sidebar-Breite + flexibler Briefbereich */
  width: 100%;
  height: 100%;
}
```

### Die Sidebar (Links)
Die Sidebar erhält eine eigene Höhenbegrenzung. Wenn Steuerelemente den Platz überschreiten, muss ein elastischer Scrollbereich *nur* für diese Kontrollgruppe eingerichtet werden, wobei der äußere Scrollbalken ausgeblendet wird:

```css
aside {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  background-color: var(--sidebar-bg);
}

#sidebar-scroll-area {
  flex: 1;
  overflow-y: auto; /* Erlaubt internes Scrollen nur bei extrem kleinen Screens */
  scrollbar-width: none; /* Firefox: Scrollbalken ausblenden */
}

#sidebar-scroll-area::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Edge: Scrollbalken ausblenden */
}
```

---

## 3. Der Brief-Viewport (Rechts)
Der Briefbereich (Paper Viewport) muss das Briefblatt (A4) elegant skalieren, anstatt zu scrollen. 

### Skalierung statt Scrollen (Dynamic Zooming)
Anstatt das A4-Blatt (210mm x 297mm) auf kleineren Bildschirmen überstehen zu lassen, nutzen wir CSS-Skalierung, damit es immer komplett sichtbar bleibt:

```css
#paper-viewport {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--viewport-bg);
}

din-a4 {
  height: 94vh; /* Passt sich perfekt dem Viewport an */
  aspect-ratio: 210 / 297; /* Exaktes DIN A4 Seitenverhältnis */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background: white;
  container-type: size; /* Ermöglicht proportionale cqw/cqh Maße */
}
```

---

## 4. Auto-Resizing ohne Scroll-Auslöser
Wenn Text in ein Feld eingegeben wird, darf sich dieses nicht vergrößern und das Layout sprengen.

### Das `field-sizing` Wunder
Wir nutzen `field-sizing: content` auf unseren Texteingaben. Dies passt die Größe des Elements automatisch an den Inhalt an, verhindert aber in Verbindung mit `max-height` ein unbegrenztes Wachstum:

```css
din-text, [contenteditable] {
  field-sizing: content;
  max-height: 150mm; /* Maximale Texthöhe auf dem Blatt */
  overflow: hidden; /* Scrollbalken innerhalb der Textelemente unterbinden */
  outline: none;
}
```

---

## 5. Defensive CSS-Techniken zur Vermeidung von Layout-Sprengungen
- **Nutze `box-sizing: border-box`:** Jedes Element im Projekt muss diese Eigenschaft besitzen, damit Padding und Border die Gesamtbreite/-höhe nicht erhöhen.
- **Vermeide absolute Pixelwerte bei Höhen:** Nutze relative Einheiten wie `rem`, `%`, `vh` oder `dvh` für Layout-Skelette.
- **Umgang mit langen Wörtern:** Verwende `word-break: break-word` und `hyphens: auto`, um horizontalen Textüberlauf zu verhindern.
