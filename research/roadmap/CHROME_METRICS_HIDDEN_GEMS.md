# Chrome UseCounter Telemetrie: Die verborgenen Schätze für DIN-Brief Neo

> **Quelle:** Chrome Anonymous Usage Statistics (429 Web Features UseCounters)  
> **Bedeutung:** Die Prozentzahlen zeigen, auf wie vielen aller weltweiten Webseiten-Aufrufe das jeweilige Feature heute bereits live im Einsatz ist.

---

## 1. Die 8 wertvollsten „Hidden Gems“ für deinen DIN-Brief

In deiner Telemetrie-Liste verbergen sich fantastische APIs und CSS-Features, die wir bisher noch gar nicht auf dem Schirm hatten:

---

### 💎 Gem 1: `LocalFonts` API (`window.queryLocalFonts()`) – Nutzungsrate: 0.0015%
- **Was es macht:** Ermöglicht Web-Apps den Zugriff auf alle Schriftarten, die lokal auf dem Windows-PC des Nutzers installiert sind.
- **Killer-Vorteil für DIN-Brief Neo:**
  Bisher muss der Nutzer eine `.woff2`-Datei suchen und hochladen (`02-settings-manager.js`). Mit `queryLocalFonts()` kann dein Schriftarten-Manager direkt auf die echten Windows-Systemschriften (wie *Aptos*, *Calibri*, *Arial*, *DIN Next*) zugreifen – **ohne Upload, ohne Base64-Speicher im LocalStorage**!

---

### 💎 Gem 2: `print-color-adjust: exact` – Nutzungsrate: 3.43%
- **Was es macht:** Verhindert, dass der Druckertreiber oder Chrome beim Drucken/PDF-Export Hintergrundfarben, zarte Grautöne und DIN-Hilfsmarken automatisch ausbleicht oder löscht.
- **Killer-Vorteil für `print.css`:**
```css
@media print {
  din-a4,
  .din-mark {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```
*Garantiert, dass die Falz- und Lochmarken im PDF gestochen scharf auf exakt 105mm/148.5mm gedruckt werden.*

---

### 💎 Gem 3: CSS `lh` und `rlh` Einheiten – Nutzungsrate: 1.45%
- **Was es macht:** `lh` ist die relative Höhe einer Textzeile (`1lh` = exakt eine Zeilenhöhe der aktuellen Schriftart).
- **Killer-Vorteil für `layout.css`:**
  DIN 5008 definiert Abstände oft in „Leerzeilen“ (z. B. *„Nach der Anschrift folgen 2 Leerzeilen bis zum Betreff“*).
  - Bisher: Ungenaues Umrechnen mit `calc(2 * 1.5rem)` oder `margin-bottom: 24px`.
  - Neu mit `lh`: `margin-bottom: 2lh;` ➔ **Exakt 2 echte Leerzeilen der gewählten Schriftart!**

---

### 💎 Gem 4: `overflow: clip` & `contain: strict` (Zero-Scroll-Garantie)
- **Was es macht:** Im Gegensatz zu `overflow: hidden` verbietet `overflow: clip` jegliches Scrollen technisch und hardware-nah (auch programmatisches Scrollen durch Markieren oder Ziehen mit der Maus).
- **Killer-Vorteil für `layout.css`:**
  Ein physisches DIN-A4-Blatt scrollt nicht! Mit `din-a4 { overflow: clip; contain: strict; }` wird das Blatt zu einer unbeweglichen physischen Wand. Scrollbalken existieren in der gesamten App schlichtweg nicht.

---

### 💎 Gem 5: `showPicker()` (`ShowPickerInput` & `ShowPickerSelect`)
- **Was es macht:** Öffnet den nativen Browser-Kalender oder das native Dropdown programmatisch über JavaScript.
- **Killer-Vorteil für dein Datumsfeld (`#datum`):**
  Klickt der Nutzer auf das Datum im Brief, öffnet `dateInput.showPicker()` sofort den schönen, nativen Windows-Kalender zur Auswahl des Datums.

---

### 💎 Gem 6: `EyeDropper` API – Nutzungsrate: 0.0061%
- **Was es macht:** Eine native Lupe/Pipette, mit der der Nutzer jeden Pixel auf seinem Bildschirm anklicken kann.
- **Killer-Vorteil:**
  Der Nutzer lädt sein Firmenlogo oder seine Unterschrift hoch und kann mit der Pipette mit einem Klick die Primärfarbe seines Briefkopfes exakt an das Logo anpassen (`const result = await new EyeDropper().open()`).

---

### 💎 Gem 7: `CompressionStreams` – Nutzungsrate: 25.89%
- **Was es macht:** Schnelle C++-native Gzip/Deflate-Komprimierung direkt im Browser.
- **Killer-Vorteil für `52-storage.js`:**
  Briefe mit eingebetteten Unterschriftenbildern (Base64) sprengen schnell das 5 MB Limit von `localStorage`. Durch Komprimierung mit `CompressionStream('gzip')` schrumpft der Speicherbedarf um **80–90 %**!

---

### 💎 Gem 8: `moveBefore()` – Nutzungsrate: 0.1177%
- **Was es macht:** Der allerneueste DOM-Standard zur Neuanordnung von Elementen.
- **Killer-Vorteil:**
  Wenn der Nutzer Anlagen per Drag-&-Drop verschiebt, zerstörte das alte `appendChild` bisher den Tastaturfokus und die Cursorposition. `parent.moveBefore(node, target)` verschiebt DOM-Elemente unter Erhalt des vollständigen Status!

---

## 2. Der Realitäts-Check: Welche Features sind bereits Mainstream?

Die UseCounter-Daten belegen schwarz auf weiß, dass unsere zuvor ausgewählten Modernisierungen keine riskanten Experimente sind, sondern bereits milliardenfach im Web laufen:

| Feature aus unserer Roadmap | Weltweite Nutzungsrate | Status |
| :--- | :--- | :--- |
| **`color-mix()`** | **16.86 %** aller Page-Loads | Absoluter Web-Standard |
| **`interpolate-size`** | **11.05 %** aller Page-Loads | Extrem rasanter Aufstieg! |
| **`dialog` (nativ)** | **9.85 %** aller Page-Loads | Etablierter Standard |
| **`checkVisibility()`** | **5.45 %** aller Page-Loads | Standard für schnelle Sichtbarkeitsprüfung |
| **Popover API** | **4.34 %** aller Page-Loads | Etablierter Top-Layer Standard |
| **`@starting-style`** | **3.94 %** aller Page-Loads | Breiter Einsatz für weiche Transitions |
| **`text-wrap: balance / pretty`** | **6.81 %** (kombiniert) | Standard für moderne Web-Typografie |
| **`field-sizing`** | **2.27 %** aller Page-Loads | Bereits auf Millionen Websites live aktiv! |
| **`light-dark()`** | **1.57 %** aller Page-Loads | Wachsender Standard für Theming |

---

## 3. Fazit

Diese Metrik-Liste ist eine echte Fundgrube. Vor allem **`LocalFonts`** (Systemschriften ohne Upload), **`print-color-adjust`** (Garantie für Falzmarken im Druck) und **`lh`-Einheiten** (echte DIN-Leerzeilen) sind geniale Ergänzungen für DIN-Brief Neo!
