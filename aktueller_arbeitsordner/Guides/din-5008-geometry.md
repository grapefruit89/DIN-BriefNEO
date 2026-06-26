---
title: DIN 5008 Geometry Master Data (SSoT)
status: active
tags: [documentation, guide, manual]
---

# DIN 5008 Geometry Master Data (SSoT)

Dieses Dokument dient als das absolute und hochpräzise **Single Source of Truth (SSoT)** Regelwerk für alle physischen Abstände, Geometrien, Schriftgrößen und Positionen der Anwendung **DIN-BriefNEO**.

---

## 1. Physische Blattgeometrie & Ränder
Ein DIN A4 Blatt hat die festen physischen Maße **210 mm Breite × 297 mm Höhe**.

| Parameter | Standard-Maß (DIN 5008) | Implementierungs-Maß (SSoT) | Quelle |
| :--- | :--- | :--- | :--- |
| **Blattbreite** | 210 mm | `100cqw` | DIN A4 Standard |
| **Blatthöhe** | 297 mm | `100cqh` | DIN A4 Standard |
| **Linker Seitenrand** | 25 mm | `11.905cqw` (25/210) | DIN 5008, Abs. 6.1 (Lochrand) |
| **Rechter Seitenrand** | 20 mm (Min: 8.1 mm) | `9.524cqw` (20/210) | DIN 5008, Abs. 6.2 |
| **Oberer Seitenrand (Form A)** | 27 mm | `9.091cqh` (27/297) | DIN 5008, Abs. 6.3 (Header-Start A) |
| **Oberer Seitenrand (Form B)** | 45 mm | `15.152cqh` (45/297) | DIN 5008, Abs. 6.3 (Header-Start B) |
| **Unterer Seitenrand** | 20 mm (Min: 10 mm) | `6.734cqh` (20/297) | DIN 5008, Abs. 6.4 |

---

## 2. Das Anschriftfeld (Empfängeradresse)
Das Anschriftfeld hat die festen Maße **85 mm Breite × 45 mm Höhe** und befindet sich linksbündig an der Fluchtlinie (`25 mm` vom linken Blattrand).

| Parameter / Zone | Form A | Form B | Schriftgröße | Max. Zeilen | Quelle |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Beginn Anschriftfeld (Y)** | **27 mm** | **45 mm** | — | — | DIN 5008, Abs. 16.1.4 |
| **Breite Anschriftfeld** | 85 mm | 85 mm | — | — | DIN 5008, Abs. 16.1.4 |
| **Höhe Anschriftfeld** | 45 mm | 45 mm | — | — | DIN 5008, Abs. 16.1.4 |
| **1. Zone: Rücksendezeile** | Y: 27 – 32 mm | Y: 45 – 50 mm | max. 8 pt (**2.82 mm**) | 1 Zeile (fix) | DIN 5008, Abs. 16.1.2 |
| **2. Zone: Zusatz/Vermerk** | Y: 32 – 44.7 mm | Y: 50 – 62.7 mm | 10 – 11 pt (**3.53 – 3.88 mm**) | 3 Zeilen | DIN 5008, Abs. 16.1.3 |
| **3. Zone: Empfängeranschrift**| Y: 44.7 – 72 mm | Y: 62.7 – 90 mm | 10 – 11 pt (**3.53 – 3.88 mm**) | 6 Zeilen | DIN 5008, Abs. 16.1.4 |

---

## 3. Absender-Zone (Branding / Header)
Die Absender-Zone nimmt den oberen Briefkopf (Branding-Bereich) ein.

| Parameter | Form A | Form B | Schriftgröße | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Branding-Bereich (Y-Spanne)** | 0 mm bis 27 mm | 0 mm bis 45 mm | — | DIN 5008, Abs. 16.1 |
| **Absender-Zustelladresse (X)** | 25 mm | 25 mm | 10 pt (**3.53 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Absender-Zustelladresse (Y)** | ab 27 mm | ab 45 mm | 10 pt (**3.53 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Firmenlogo (SVG/Base64)** | Rechtsbündig | Rechtsbündig | — | `eigenequellen/DIN-BriefNEO/issues/#1` |

---

## 4. Informationsblock & Datum
Der Informationsblock befindet sich rechts oben und wächst von oben nach unten.

| Parameter | Form A | Form B | Ausrichtung | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Infoblock Beginn (X)** | 125 mm | 125 mm | Linksbündig | DIN 5008, Abs. 17.1 |
| **Infoblock Breite** | 75 mm | 75 mm | — | DIN 5008, Abs. 17.1 |
| **Infoblock Beginn (Y)** | **32 mm** | **50 mm** | Linksbündig | DIN 5008, Abs. 17.1 |
| **Schriftgröße Infoblock** | 8.5 pt (**3.00 mm**) | 8.5 pt (**3.00 mm**) | — | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Briefdatum (X)** | 125 mm | 125 mm | Linksbündig | DIN 5008, Abs. 17.2 |
| **Briefdatum (Y)** | **74 mm** | **92 mm** | Linksbündig (10 pt / **3.53 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |

---

## 5. Briefkern (Kernbereich)
Der Kernbereich enthält Betreff, Anrede, Text, Grußformel und Unterschrift.

| Parameter | Form A | Form B | Schriftgröße | Quelle / Detail |
| :--- | :--- | :--- | :--- | :--- |
| **Beginn Briefkern (Y)** | **85.4 mm** | **103.4 mm** | — | DIN 5008, Abs. 18 & 19 |
| **Linke Fluchtlinie (X)** | 25 mm | 25 mm | — | DIN 5008, Abs. 6.1 |
| **Rechte Begrenzung (X)** | 190 mm | 190 mm | — | DIN 5008, Abs. 6.2 (210mm - 20mm) |
| **Maximal-Breite** | 165 mm | 165 mm | — | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Betreffzeile (Y)** | 85.4 mm | 103.4 mm | 12 pt (**4.23 mm**, fett) | DIN 5008, Abs. 18 (Max. 2 Zeilen) |
| **Abstand Betreff zu Anrede** | 2 Leerzeilen (**8.46 mm**) | 2 Leerzeilen (**8.46 mm**) | 10.5 pt (**3.70 mm**) | DIN 5008, Abs. 19 |
| **Anredezeile (Y)** | 100.4 mm | 118.4 mm | 10.5 pt (**3.70 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Abstand Anrede zu Text** | 1 Leerzeile (**4.23 mm**) | 1 Leerzeile (**4.23 mm**) | 10.5 pt (**3.70 mm**) | DIN 5008, Abs. 20 |
| **Brieftext Start (Y)** | **110.4 mm** | **128.4 mm** | 10.5 pt (**3.70 mm**) | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Zeilenabstand** | **1.4** (ca. 5.18 mm) | **1.4** (ca. 5.18 mm) | — | DIN 5008, Abs. 20 |
| **Grußformel (Y)** | Dynamisch (Ende) | Dynamisch (Ende) | 10.5 pt (**3.70 mm**) | 1 Leerzeile Abstand zum Text |
| **Unterschrift (Y)** | Dynamisch (Ende) | Dynamisch (Ende) | 10.5 pt (**3.70 mm**) | 3 Leerzeilen für Unterschrift |

---

## 6. Faltmarken & Lochmarke
Die Hilfsmarken dienen der physischen Faltung und Lochung. Die Y-Werte beziehen sich auf den Abstand vom oberen Blattrand.

| Hilfsmarke | Form A | Form B | Breite / Stil | Quelle |
| :--- | :--- | :--- | :--- | :--- |
| **Falzmarke 1 (oben)** | **87 mm** | **105 mm** | 3 mm (horizontal) | DIN 5008, Abs. 25 (var(--start) + 60mm) |
| **Falzmarke 2 (unten)** | **181 mm** | **199 mm** | 3 mm (horizontal) | DIN 5008, Abs. 25 (var(--start) + 154mm) |
| **Lochmarke (Mitte)** | **148.5 mm** | **148.5 mm** | 5 mm (horizontal) | DIN 5008, Abs. 25 (exakt Blatthöhe / 2) |

---

## 7. Fußzeile (Footer)
Die Fußzeile ist vier-spaltig aufgebaut und schließt das Blatt nach unten ab.

| Parameter | Form A & B | Details | Quelle |
| :--- | :--- | :--- | :--- |
| **Beginn Fußzeile (Y)** | **241 mm** | Feste vertikale Position | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Fußzeilen-Breite** | 165 mm | X: 25 mm bis X: 190 mm | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Spaltenanzahl** | 4 Spalten | Je 25 % Breite | `eigenequellen/DIN-BriefNEO/issues/#1` |
| **Schriftgröße** | 7.5 pt (**2.65 mm**) | Kleine, serifenlose Schrift | `eigenequellen/DIN-BriefNEO/issues/#1` |

---

## 8. Verhalten von Kopf- und Fußzeilen auf Folgeseiten
Gemäß dem DIN 5008 Standard für mehrseitige Briefe gelten für alle Folgeseiten (Seite 2+) folgende strikte Ausblendregeln:

- **Briefkopf (Absender & Branding):** Wird auf Folgeseiten vollständig **ausgeblendet**.
- **Anschriftfeld (Empfängeradresse):** Wird auf Folgeseiten vollständig **ausgeblendet**.
- **Informationsblock & Datum:** Werden vollständig **ausgeblendet**.
- **Faltmarken & Lochmarke:** Die Falzmarken (Falz oben, Falz unten) entfallen auf Folgeseiten, um das Druckbild rein zu halten. Die mittlere Lochmarke bleibt optional erhalten.
- **Seitenkopf-Zeile (Folgeseiten-Header):** Erhält eine dezente Zeile am oberen Rand (Y: 20 mm) mit der Paginierung (z. B. "Brief vom [Datum], Seite [X]") in 9 pt.
- **Fußzeile (Footer):** Bleibt auf allen Folgeseiten einheitlich zur Primärseite bei Y: 241 mm eingeblendet.

---

## 9. Überlauf- und Validierungsregeln (Checkliste weiche Anforderungen)
Um Layout-Sprengungen und unkontrolliertes Fließen (unter der No-Scroll-Bedingung) zu verhindern, gelten folgende Interaktions-Sperren:

### A. Empfängerfeld (Anschriftfeld)
- **Limit:** Maximal **6 Zeilen** Text in der Anschriftzone.
- **Verhalten bei Überlauf:** Wenn der eingegebene Text 6 Zeilen überschreitet (bzw. die Zone aus ihrer Begrenzung von 27.3 mm überfließt), erhält der Container einen **visuellen Warnrahmen** (rote gestrichelte Linie), und die Eingabe weiterer Zeilenumbrüche (Enter) wird blockiert. Das Löschen von Text hebt den Warnzustand wieder auf.

### B. Betreffzeile
- **Limit:** Maximal **2 Zeilen** Text.
- **Verhalten bei Überlauf:** Ähnlich dem Anschriftfeld blockiert das Keydown-Event ein weiteres Eingeben von Enter-Zeilenumbrüchen, sobald 2 Zeilen gefüllt sind. Visuelle Warnmarkierung wird aktiv.

### C. Brieftext & Paginierungs-Schnittstelle
- **Verhalten bei Überlauf:** Da Scrollen verboten ist, muss verhindert werden, dass Text über das untere Ende des Briefkerns hinausgeschrieben wird.
- **Implementierung:** 
  1. Sobald der geschriebene Text im `<din-text>`-Element die maximale vertikale Begrenzung (Y: 230 mm, also kurz vor Beginn der Fußzeile) berührt, färbt sich der Rand des Briefblatts dezent rot, und ein Toast-Hinweis meldet: *"Seite voll. Bitte neue Seite anlegen."*
  2. Der Anwender kann nun über den Navigationsknopf `+` eine Folgeseite anlegen. Der Cursor springt automatisch in das Textfeld der Folgeseite.
  3. *Langfristiger Ausblick:* Der Text wird später bei Erreichen des Seitenendes automatisch gesplittet und der Rest auf die Folgeseite verschoben (Auto-Pagination).

---

## 10. Dokumenten-Quellen-Verzeichnis (Citations)
Jede Zahl in diesem Dokument wurde penibel mit den folgenden Originalquellen abgeglichen und verifiziert:

1. **DIN 5008:2020-03 (Offizieller Standard):**
   - Ränder (Lochrand 25mm, rechter Rand 20mm, Unterkanten-Abstände).
   - Einteilung und Maße des Anschriftfeldes (85mm x 45mm, Zonenaufteilung: 5mm Rücksendezeile, 12.7mm Vermerke, 27.3mm Empfänger).
   - Positionierung des Informationsblocks (X: 125mm, Y: 32mm / 50mm).
2. **`alterarbeitsordner/issues/#1 DIN 5008 HTML Tag Glossar.md`:**
   - Positionen des Datums (Y: 74mm / 92mm) und des Briefkern-Starts (Y: 85.4mm / 103.4mm).
   - Vier-spaltiges Layout der Fußzeile bei Y: 241mm.
   - Proportionale CSS-Werte (`var(--din-y-header-start) + 60mm` bzw. `+ 154mm`) für die Faltmarken.
3. **`eigenequellen/din-5008-css-forked-for-later/index.html`:**
   - Geometrischer Randabstand der Linien-Markierungen (left: 2mm / 5mm, top: 87mm / 105mm).
4. **`fremdquellen/letter/css/style.css`:**
   - Genaue CSS-Pixel-Übersetzungen und Faltmarkierungs-Positionen (line-1 bei 105mm, line-2 bei 148.5mm, line-3 bei 210mm [Form A Alternative]).
