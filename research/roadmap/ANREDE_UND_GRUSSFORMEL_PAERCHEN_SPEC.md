# 80/20 B2B-Standard: Anrede- & Grußformel-Pärchen

> **Leitlinie:** Radikales 80/20-Prinzip für DIN-Brief Neo.  
> **Fokus:** Echte, professionelle B2B-Korrespondenz.  
> **Bereinigung:** Veralteter und kühler Ballast (*Hochachtungsvoll*, *Mit verbindlichen Grüßen*) sowie überfrachtete Sonderfälle wurden ersatzlos gestrichen.  
> **Kern-Regel:** Klare Standard-Pärchen ohne Titel-Akrobatik. Alles Weitere übersteuert der Nutzer bei Bedarf direkt per ContentEditable.

---

## 1. Die amtlichen DIN-5008-Normabstände & Zeichensetzung

| Abschnitt | Vertikaler Abstand (Zeilen) | Interpunktion & Grammatik |
| :--- | :--- | :--- |
| **Betreff ➔ Anrede** | **2 Leerzeilen** (3 Zeilenschaltungen) | Kein Punkt nach dem Betreff. |
| **Anrede** | *Textzeile* | **Komma ist Pflicht** (`Sehr geehrte Frau Müller,`) |
| **Anrede ➔ Fließtext** | **1 Leerzeile** (2 Zeilenschaltungen) | 1. Satz beginnt **klein**, da er den Satz nach dem Komma fortsetzt (Ausnahme: Nomen / Höflichkeitsanrede *Sie*, *Ihr*). |
| **Fließtext ➔ Gruß** | **1 Leerzeile** (2 Zeilenschaltungen) | Letzter Satz endet regulär mit Punkt. |
| **Grußformel** | *Textzeile* | **STRENG KEIN KOMMA** nach der Grußformel (`Mit freundlichen Grüßen`). |
| **Gruß ➔ Name** | **3 Leerzeilen** (4 Zeilenschaltungen) | Platzhalter für die handschriftliche Unterschrift (ca. 15–20 mm). |
| **Namenswiedergabe** | *Textzeile* | Maschinenschriftlicher Vor- und Nachname. |
| **Zusatz / Funktion** | Direkt unter dem Namen (0 Leerzeilen) | z. B. *Geschäftsführer*, *Vertriebsleitung* oder digital `[gez.]`. |

---

## 2. Die 3 B2B-Kernpärchen (80/20-Standard)

Die Engine deckt 90 % aller geschäftlichen Briefe mit drei stimmigen, harmonischen Pärchen ab – schlank, ohne Titel-Ballast in der Standard-Anrede:

### 1. Förmlich (`formal`) – Der B2B-Klassiker
- **Anrede:**
  - Unbekannt / Behörde / Firma: `Sehr geehrte Damen und Herren,`
  - Weiblich: `Sehr geehrte Frau [Nachname],`
  - Männlich: `Sehr geehrter Herr [Nachname],`
- **Grußformel:**
  - `Mit freundlichen Grüßen`

### 2. Höflich (`polite`) – Zeitgemäß B2B (Laufender Kontakt)
- **Anrede:**
  - Weiblich: `Guten Tag Frau [Nachname],`
  - Männlich: `Guten Tag Herr [Nachname],`
  - Fallback: `Guten Tag,`
- **Grußformel:**
  - `Freundliche Grüße`

### 3. Locker (`casual`) – Kollegial & Direkt
- **Anrede:**
  - Bekannter Vorname: `Hallo [Vorname],`
  - Fallback / Nur Nachname: `Hallo [Nachname],`
- **Grußformel:**
  - `Beste Grüße`

---

## 3. Gestrichener Ballast (Zero Bloat)

Folgende Floskeln wurden im Sinne des 80/20-Prinzips und moderner Geschäftskorrespondenz entfernt:
- ❌ **`Hochachtungsvoll`:** Gilt heute im B2B-Alltag als verstaubt, emotional kühl bis feindselig (fast nur noch bei Abmahnungen und Kündigungen gebräuchlich).
- ❌ **`Mit verbindlichen Grüßen`:** Kanzleideutsch und Amtsjargon, unnatürlich in normaler Geschäftspost.
- ❌ **Exotische Sonderfall-Kombinationen:** Hunde, Kumpels, Adelstitel oder Dreifach-Absender erfordern keinen Code.

---

## 4. Wie Sonderwünsche gelöst werden (ContentEditable)

Möchte der Nutzer im Einzelfall einen Titel (`Dr.`, `Professor`) in der Anrede haben oder eine spezielle Grußformel verwenden:
- Er klickt direkt in das Feld auf dem Brief und tippt es ein.
- Das System setzt `dataset.dirty = "true"` und rührt das Feld nicht mehr an.
- Leert er das Feld, schaltet die Automatik zurück auf das 80/20-Standardpärchen.
