# Das Zero-Scroll-Prinzip für DIN-Brief Neo: Physisches A4-Papier scrollt nicht!

> **Kern-Doktrin:** Ein DIN-A4-Blatt (210 mm × 297 mm) ist ein physisches Blatt Papier. Ein Blatt Papier hat keinen Scrollbalken.  
> **Ziel:** Scrollbalken werden nicht "hübsch gemacht", sondern **zu 100 % verboten und eliminiert**.  

---

## 1. Warum Scrollen im DIN-Brief ein absolutes No-Go ist

1. **Druck-Realität (WYSIWYG):** Was auf dem Bildschirm gescrollt wird, verschwindet im Druck oder wird abgeschnitten. Jeder vertikale Scrollbalken im Brief bedeutet einen fehlerhaften Brief!
2. **DIN 5008 Norm:** Die Positionen (Lochmarke bei 148,5 mm, Falzmarken bei 105 mm und 210 mm, Fußzeile) sind millimetergenau fixiert. Wenn Inhalt nach unten schiebt und scrollt, ist die Norm zerstört.

---

## 2. Die modernen CSS-Waffen gegen das Scrollen (Zero-Scroll-Stack)

Statt Scrollbalken abzufedern, erzwingen wir die physische Begrenzung mit den neuesten CSS-Standards:

### 1. `overflow: clip` statt `overflow: hidden`
- **Der Unterschied:** `overflow: hidden` erlaubt dem Browser immer noch programmatisches Scrollen (z. B. wenn der Nutzer mit der Maus zieht oder Text markiert, scrollt der Inhalt heimlich weg).
- **Die Lösung 2025/2026:** `overflow: clip;` verbietet jegliches Scrollen hardware-nah und vollständig. Der Container ist eine unbewegliche physische Wand.
```css
din-a4 {
  width: 210mm;
  height: 297mm;
  overflow: clip; /* Scrollen ist technisch komplett unmöglich! */
  contain: strict; /* Isoliert das Layout komplett vom Browser-Viewport */
}
```

---

### 2. `text-box-trim: both` (Stoppt das vertikale Verdrängen)
- **Das Problem heute:** Web-Fonts haben oben und unten unsichtbaren Leerraum (Ascender/Descender). Bei 30 Zeilen Brieftext summieren sich diese Leerräume auf bis zu 15–20 mm unnötige Höhe auf und drücken den Text über die Fußzeile hinaus!
- **Die Lösung:** `text-box-trim: both;` schneidet diesen toten Raum ab. Der Text bleibt kompakt und passt exakt auf das Blatt, ohne nach unten auszubrechen.

---

### 3. Container Query Units (`cqh` / `cqb`) statt Viewport (`vh`)
- **Das Problem:** Viewport-Einheiten (`vh`) orientieren sich am Monitor, nicht am Papier.
- **Die Lösung:** Das A4-Blatt wird als Container definiert (`container-type: size`). Alle Abstände, Textgrößen und Warnschwellen orientieren sich strikt an den **297 mm der physischen Blatt-Höhe** (`100cqh`).

---

### 4. Nativer Text-Überlaufschutz ohne JavaScript
- **Früher in `48-text-fit.js`:** Teures Polling von `scrollWidth > clientWidth` und MutationObserver, um Überläufe mühsam abzufangen.
- **Neu mit CSS:**
```css
/* Verhindert horizontales und vertikales Ausbrechen */
.single-line {
  field-sizing: content;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: clip;
}
```

---

## 3. Was passiert, wenn der Text wirklich zu lang ist?

Auf echtem Papier gibt es genau zwei saubere Lösungen:
1. **Schriftgröße schrumpfen:** Nativ über CSS clamp / dynamic text-fit.
2. **Seite 2 erzeugen (Paginierung):** Ein zweites physisches A4-Blatt (`din-a4.page-2`) daneben oder darunter rendern – **aber niemals ein Scrollbalken im Blatt!**
