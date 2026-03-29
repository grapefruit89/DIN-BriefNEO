# DIN 5008:2020 Master Technical Specification

Dieses Dokument dient als verbindliche Grundlage für die Layout-Programmierung.

## 1. Seite & Ränder (Global)
- **Format**: DIN A4 (210 mm x 297 mm)
- **Linker Rand**: 25 mm (Heftrand)
- **Rechter Rand**: 20 mm (Standard)
- **Oberer Rand**: 27 mm (Form A) bzw. 45 mm (Form B)
- **Grund-Zeilenabstand**: 4,23 mm (entspricht 1/6 Zoll oder 12 pt)
- **Schriftgröße**: 11 pt (Standard) oder 12 pt

## 2. Layout-Formen (Positionierung)
Der Hauptunterschied liegt in der Höhe des Briefkopfes.

### Form A (Kleiner Briefkopf)
- **Rücksendezeile**: Beginnt bei 32 mm von oben.
- **Anschriftfeld**: Beginnt bei 32 mm von oben.
- **Faltmarke 1**: 87 mm von oben.
- **Faltmarke 2**: 192 mm von oben.

### Form B (Großer Briefkopf - Standard)
- **Rücksendezeile**: Beginnt bei 45 mm von oben.
- **Anschriftfeld**: Beginnt bei 50 mm von oben.
- **Faltmarke 1**: 105 mm von oben.
- **Faltmarke 2**: 210 mm von oben.

## 3. Das Anschriftfeld (85 mm x 45 mm)
Das Feld ist in drei Bereiche unterteilt:
- **Bereich 1: Rücksendeangabe (5 mm Höhe)**
  - Einzeilig, max. 85 mm breit, Schriftgröße 8 pt.
- **Bereich 2: Zusatz- und Vermerkzone (17,7 mm Höhe)**
  - Hier stehen Hinweise wie "Einschreiben" oder "Nicht nachsenden".
- **Bereich 3: Anschriftzone (27,3 mm Höhe)**
  - Max. 6 Zeilen für die eigentliche Adresse.

## 4. Informationsblock (Bezugszeichenblock)
- **Position**: Beginnt horizontal bei 125 mm von der linken Papierkante.
- **Vertikal**: Beginnt oft auf der gleichen Höhe wie die Adresse (32 mm bzw. 50 mm).
- **Inhalt**: Datum, Zeichen, Ansprechpartner. Das Datum steht immer am Ende des Blocks.

## 5. Textstruktur & Abstände
- **Betreffzeile**: 
  - Beginnt bei ca. 103,4 mm (Form B) oder früher (Form A).
  - Immer **fett** formatiert.
  - Das Wort "Betreff:" wird **nicht** geschrieben.
- **Anrede**: 2 Leerzeilen (Rastereinheiten) unter dem Betreff.
- **Brieftext**: 1 Leerzeile unter der Anrede.
- **Grußformel**: 1 Leerzeile unter dem Text.
- **Firmenname/Unterschrift**: Direkt unter der Grußformel.
- **Maschinenschriftlicher Name**: 3 Leerzeilen unter der Grußformel (Platz für Unterschrift).
- **Anlagen**: 1 Leerzeile unter dem Namen oder mit Abstand daneben.

## 6. Hilfsmarken
- **Lochmarke**: 148,5 mm von oben (Seitenmitte).
- **Position**: 7 mm von der linken Kante entfernt, 10 mm breit (als CSS-Linie).