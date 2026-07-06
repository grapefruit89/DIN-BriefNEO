---
created: '2026-07-06'
depends_on: []
last-updated: 2026-07-02
project: DIN-BriefNEO
status: active
tags:
- css
- guide
- modern
title: 'Guide: Modern CSS Features (Chrome 148+ Baseline)'
type: guide
updated: '2026-07-06'
---

# Modern CSS Features (Chrome 148+ Baseline)

Dieses Dokument listet die modernen CSS-Features auf, die im Projekt **DIN-Brief Neo** verwendet werden. Da die App eine strikte Chrome 148+ (Edge/Opera äquivalent) Engine voraussetzt, können wir auf Polyfills und Fallbacks verzichten und hochmoderne Web-Plattform-Features nativ nutzen.

## 1. Farbthemen & Design Tokens

### 1.1 `light-dark()` Funktion
Eine CSS-Funktion, die abhängig vom berechneten `color-scheme` des Elements entweder einen hellen oder dunklen Farbwert zurückgibt.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Wir nutzen dies intensiv für unseren nativen Dark Mode ohne JavaScript-Klassen-Toggling auf jedem Element.

### 1.2 `oklch()` Farbraum
Ein wahrnehmungsgerechter Farbraum, der konsistente Helligkeitsstufen (Lightness) und Sättigungen (Chroma) über alle Farbtöne (Hue) hinweg bietet.

> **Relevanz für DIN-BriefNEO:** **Mittel**. Wird vereinzelt für extrem präzise Schatten und sanfte Grauabstufungen in der Sidebar genutzt, um ein Premium-Gefühl zu erzeugen.

---

## 2. Layout & Responsiveness

### 2.1 `container-type: size` + Container-Einheiten (`cqw` / `cqh`)
Container Queries erlauben es, dass sich Elemente an der Größe ihres *Containers* anstatt des Viewports orientieren. `cqw` und `cqh` sind prozentuale Einheiten bezogen auf diesen Container.

> **Relevanz für DIN-BriefNEO:** **Extrem Hoch**. Das ist das Herzstück unseres No-Scroll-Layouts! Der Briefbogen (`<din-a4>`) skaliert sich dynamisch in den verfügbaren Platz. Alle DIN 5008 Abstände (wie Falzmarken) werden in `cqh` und `cqw` berechnet, damit das Blatt stufenlos zoombar ist, ohne dass die Maßstäbe brechen.

### 2.2 `field-sizing: content`
Erlaubt Input-Feldern und Textareas, ohne JavaScript-Hacks automatisch mit ihrem Inhalt mitzuwachsen.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Perfekt für kleine, editierbare Bereiche (wie den Betreff), bei denen wir kein `contenteditable` nutzen, aber trotzdem ein Auto-Grow-Verhalten brauchen.

---

## 3. Interaktion & UI

### 3.1 `:has()` Pseudo-Klasse
Der CSS-Parent-Selector. Erlaubt es, ein Elternelement basierend auf seinem Inhalt (Kinder) zu stylen.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Wird genutzt, um z.B. Warn-Rahmen um den Briefkern zu zeichnen, falls eines der inneren Kinder (wie der Text) einen Überlauf (`overflow`) erzeugt.

### 3.2 Popover API (`popover`)
Ein nativer Weg, um UI-Elemente über den Rest der Seite zu legen (Top-Layer), inklusive Light-Dismiss (Schließen durch Klick daneben) und ESC-Taste-Support, völlig ohne z-index-Kämpfe.

> **Relevanz für DIN-BriefNEO:** **Hoch**. Wird für die schwebende "WhatsApp-Style" Formatierungsleiste (Fett, Kursiv) genutzt, die über dem Text auftaucht.

### 3.3 CSS Anchor Positioning
Ermöglicht das absolute Positionieren eines Elements (z.B. ein Tooltip) *relativ* zu einem anderen "Anker"-Element, ohne dass sie im DOM verschachtelt sein müssen.

> **Relevanz für DIN-BriefNEO:** **Niedrig (Aktuell)**. Zukünftig extrem spannend, um Dropdowns (wie bei der Adress-Autovervollständigung) präzise an ein `contenteditable`-Feld zu heften, ohne den Layout-Flow des DIN-Briefs zu stören.

---

## Feature-Stabilität & Prüfung

Da wir auf Engine-Version **Chrome 148+** (bzw. 149+) setzen, sind **alle oben genannten Features stabil verfügbar** und benötigen keine Prefix-Hacks oder Polyfills. Ein manueller Feature-Check per JavaScript (wie in alten Versionen dieses Dokuments) ist unnötig und entfernt worden, da wir eine harte Engine-Grenze als Vorbedingung für die Nutzung der Applikation definieren.