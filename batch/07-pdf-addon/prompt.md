# Batch 07 — PDF-Export als Addon (SKIZZE, zurückgestellt)

> **Am 2026-11-15 von 06 auf 07 umnummeriert:** die 06 ist jetzt die
> Layer-Kaskade (B59), weil die Frage aktuell ist und der PDF-Export auf
> B52 (Plugin-Punkt) wartet.

> Noch nicht ausformuliert. Liegt absichtlich hinten: erst wenn die Struktur
> steht und der Plugin-Punkt (B52) existiert.

## Frage

Braucht der Export eine Bibliothek, oder reicht der Browser? Und wenn eine
Bibliothek: wie kommt sie rein, ohne den Boot-Pfad zu belasten?

## Was zu klären ist

- [ ] `window.print()` als Basisfall: Der Nutzer erhält ein echtes Text-PDF über
  den Druckdialog. Reicht das, oder ist der Dialog das Problem?
- [ ] Metadaten (Titel, Autor): über `window.print()` nicht setzbar — lohnt
  dafür eine Bibliothek?
- [ ] Kandidaten aus der Recherche: `pdf-lib` (Koordinaten, ~200 KB gzip),
  `jsPDF`, `pdfmake` — alle bauen das Layout **nach**. Das widerspricht der
  WYSIWYG-Grundlage des Projekts
- [ ] Bleeding-Edge-Optionen: `showSaveFilePicker()` (Dateiname/Ziel),
  `beforeprint`/`afterprint`, `CSS @page`-Metadaten — was davon trägt?
- [ ] Andockpunkt: `website/addons/` mit `import()` beim Klick (Muster
  `testbrief.js`), Registrierung nach `data-ready`

## Notizen

- Diese Scheibe ist ein **Produkt**-Thema, kein Architektur-Thema. Sie darf die
  Strukturarbeit nicht blockieren.
- Der DeepSeek-Mitschnitt vom 2026-11-14 liegt unter
  `/home/moritz/Downloads/` und ist die Grundlage der Fragen.
