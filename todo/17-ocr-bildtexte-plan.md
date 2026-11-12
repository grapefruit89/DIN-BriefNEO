# 17 — Bildtexte per OCR nur aus den Bildern (offen)

**Stand:** 2026-11-12 · **Priorität:** P2 · **blockiert:** Version C (`DIN 5008 v.3 (C).md`)

## Ausgangslage

- Rohquelle: `Unraid/…` nein — lokal `Nobara-PC: /home/moritz/Downloads/DIN 5008_2020-03-00_DE_3134524.pdf`
  (128 Seiten, A4; **98 eingebettete Bildobjekte auf 57 Seiten** — `pdfimages -list`).
- `Nobara-PC: /home/moritz/Dokumente/din5008.md` (B) enthält die Bildtexte als
  `<br>`-Brei (1.819× Token `br`), markiert durch
  `<!-- Start of picture text --> … <!-- End of picture text -->` (88 Blöcke, 25 % der Datei).
- `Nobara-PC: /home/moritz/Dokumente/DIN 5008 v.2.md` (A) enthält die Bildtexte
  **gar nicht** — nur die 32 Bildunterschriften. A kann B also nicht ersetzen.

## Auftrag

OCR **nur über die Bildbereiche**, nicht über die 128 Seiten:

1. `pdfimages -png -p PDF /tmp/din-bilder/b` → 98 Objekte, jedes mit Seitenzahl im Namen.
2. `tesseract <bild>.png - -l deu --psm 6` je Objekt (PSM 6 = einheitlicher Textblock).
3. Vektorzeichnungen ohne eingebettetes Bild: Seite mit `pdftoppm -r 300 -f N -l N`
   rendern und den Bildbereich per Crop ausschneiden (Bounding-Box aus dem Textlayer).
4. Ergebnis gegen die 88 Blöcke in B matchen (Ankerwörter) und **nur dort** ersetzen,
   wo der neue Text messbar besser ist (Anteil Wörter mit Vokal, Anteil `br`).

## Abnahmekriterien

- Kein `br`-Token mehr in den ersetzten Blöcken.
- Text außerhalb der Bildblöcke byte-identisch zu B (Integritätscheck wie bei C).
- Je ersetztem Block: Quellseite + OCR-Konfidenz im Kommentar.

## Aufwand / Risiko

- Rechenzeit ~10 min (Bilder) statt ~60 min (128 Seiten).
- Risiko niedrig: reiner Leselauf, C wird neu erzeugt, Originale bleiben unberührt.

## Varianten (Entscheidung offen)

1. C so lassen (Bildtexte eingeklappt, `<details>`, Daten erhalten) — **fertig**.
2. C + OCR nur Bilder (dieser Plan).
3. Bilder ganz aus C entfernen (kleinste Datei, Inhalt geht verloren).
