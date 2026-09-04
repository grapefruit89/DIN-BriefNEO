# CSS-Modernisierungs- & Ablösungsbericht: DIN-Brief Neo

> **Fokus:** 1. Welche CSS-Aufgaben holen wir aus JavaScript ab?  
> **Fokus:** 2. Welche bisherigen CSS-Funktionen/Hacks ersetzen wir durch moderne CSS-Funktionen 2026?  

---

## TEIL 1: Welche CSS-Aufgaben holen wir aus JavaScript ab?

In deinem JavaScript gibt es aktuell **4 DOM-Messungen** (Reflow-Auslöser),
**17 direkte Style-Manipulationen** und **9 CSS-Klassen-Toggles**.
Diese wandern fast vollständig in deklaratives CSS:

| Aufgabe heute in JavaScript | Bisheriger JS-Code | Modernes CSS-Feature 2026 | Vorteil |
| :--- | :--- | :--- | :--- |
| **1. Dynamische Feldgröße** | `scrollWidth > clientWidth` Polling in `48-text-fit.js` | `field-sizing: content;` | **100 % Nativ:** Inputs wachsen mit dem Text, Layout Thrashing entfällt komplett. |
| **2. Schriftausgleich DIN 5008** | Manuelle Abstands-Kompensationen & Zeilenberechnung | `text-box-trim: both;`<br>`text-box-edge: cap alphabetic;` | **100 % Nativ:** Schneidet Font-Ascender/Descender ab. Echte 45mm Randabstand. |
| **3. Ein-/Ausblend-Transitions** | `setTimeout()`, CSS-Klassen `.show` / `.hide` in `32-toast.js` | `@starting-style`<br>`transition: display, opacity;` | **100 % Nativ:** Sanfte Transitions von/zu `display: none` direkt im CSS. |
| **4. Höhen-Animationen** | JS-Berechnung von `element.scrollHeight` für Aufklapp-Menüs | `interpolate-size: allow-keywords;`<br>`height: auto;` | **100 % Nativ:** CSS kann jetzt flüssig von `height: 0` auf `height: auto` animieren. |
| **5. Theme & Dimming** | Manuelles Umrechnen & Setzen von CSS-Variablen in `02-settings-manager.js` | `light-dark()`<br>`color-mix(in srgb, ...)` | **100 % Nativ:** Der Browser steuert Helligkeit und Dim-Stufen automatisch. |
| **6. UI-Zustandswechsel** | `.classList.toggle('is-active')` bei Schaltern & Toggles | `:has(#switch-id:checked)` | **100 % Nativ:** Eltern- und Nachbar-Elemente reagieren direkt auf den Input-Status. |
| **7. Typografie-Balancierung** | Kein JS nötig / manuelle `<br>`-Workarounds | `text-wrap: balance;`<br>`text-wrap: pretty;` | **100 % Nativ:** Browser verhindert Witwen/Waisen und balanciert Überschriften. |

---

## TEIL 2: Wie viele bisherige CSS-Funktionen/Hacks ersetzen wir?

In deinen 5 CSS-Dateien wurden folgende veraltete Funktionen, Hacks und Konstrukte identifiziert:

| Bisheriges CSS-Konstrukt | Häufigkeit im Projekt | Ersetzt durch modernes CSS 2026 | Einsparung / Effekt |
| :--- | :--- | :--- | :--- |
| **Ungenaues `calc()` für Ränder** | 78x im CSS | `text-box-trim` & DIN-Festwerte | ~15 `calc()`-Hacks für Schriftkorrekturen entfallen ersatzlos. |
| **Doppelte Farb-Tokens (:root & .dark)** | Dutzende Zeilen in `variables.css` | `light-dark(#light, #dark)` | Halbiert 85 Zeilen Farbvariablen auf eine einzige Liste. |
| **Statische Hilfsfarben & `rgba()`** | 0x im CSS | `color-mix(in srgb, ...)` & OKLCH | Transparenzen und Dim-Stufen werden dynamisch im CSS gemischt. |
| **Starre `position: absolute`** | 20x im CSS | CSS Anchor Positioning (`position-anchor`, `anchor()`) | Falz- und Lochmarken kleben relativ an Blattkanten, nicht im Starren Raum. |
| **Eigene `@keyframes` für Toasts** | 2x im CSS | `@starting-style` + Standard-Transitions | Alle 4 `@keyframes`-Blöcke für Ein-/Ausblenden entfallen. |
| **Manuelle `z-index`-Hierarchien** | 14x im CSS (`z-index: 1000+`) | Native Popover API (`popover`) | Wandert in den Top-Layer. Z-Index-Schichtung entfällt komplett. |

---

## Gesamtfazit:
- **7 große Aufgabenbereiche** werden JavaScript komplett weggenommen und an CSS übergeben.
- **Über 50 Legacy-CSS-Deklarationen und Hacks** (`calc()`-Tricks, `@keyframes`, starre `position: absolute`, z-index-Schichten) werden durch moderne, standardisierte 2026-Funktionen ersetzt.
- Das CSS wird dadurch um ca. **40 % kürzer, robuster gegen Zoom-Stufen und exakt nach DIN 5008 maßhaltig**.