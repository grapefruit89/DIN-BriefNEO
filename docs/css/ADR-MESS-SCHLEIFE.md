---
id: adr-mess-schleife
title: 'ADR-MESS-SCHLEIFE: Vier Ebenen für visuelle Bugs (Heatmap, PDF-Millimeter, Kollision, Mechanismus)'
type: adr
status: active
created: '2026-11-11'
updated: '2026-11-11'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/css
doc_links:
  - '[[ADR-CONTENTEDITABLE-MIGRATION]]'
  - '[[ADR-EINSEITEN-STILLGELEGT]]'
  - '[[IMR-Registry]]'
code_links:
  - 'website/css/sheet-multipage.css'
  - 'test/all.js'
depends_on: []
---

# ADR: Mess-Schleife bei visuellen Bugs

## Status

Accepted — 2026-11-11. Im Frontmatter steht `status: active`, weil dieses Repo
keine `status/accepted`-Vokabel führt ([[TEMPLATES]]).

## Kontext

Bei visuellen Bugs — Druck-Layout, Pixel-Verschiebung, Seitenumbruch — reicht
„sieht gut aus" nicht. Aber „zehn Variablen isolieren" reicht auch nicht: es
endet in zwanzig Minuten Messung ohne Entscheidung.

Die Runde, die den Viewport-, Unterrand- und Geschäftsangaben-Bug behebt
(`f51fd76`, `7c524cc`), hat den Unterschied gezeigt. Erst lief die Messung
orientierungslos; der Wendepunkt war eine Heatmap, die zeigte, **wo** der
Unterschied liegt. Danach fand die millimetergenaue PDF-Analyse den
eigentlichen Mechanismus (`box-decoration-break: clone`), den keine
Bildschirmmessung sichtbar gemacht hätte.

Diese ADR hält die **Methode** fest, nicht die Fixes. Die stehen im Code
und in den Commit-Messages.

## Entscheidung

### Ebene 1 — Prozess: Heatmap als Entscheidungsrahmen

Bei jedem visuellen Vorher/Nachher-Vergleich wird eine Heatmap gerendert
(`pdftoppm -r 96 -png` + `PIL.ImageChops.difference`, Schwelle > 10) und
zusätzlich die **Bounding-Box** der Diff-Pixel in Millimetern ausgegeben.

Die Heatmap beantwortet nicht „ist es korrekt?", sondern **„wo sind die
Unterschiede?"**. Genau das ist der Abbruchmechanismus gegen endloses
Isolieren: eine Zahl plus eine Zone statt einer Vermutung.

**Wichtig:** Die Heatmap allein reicht nicht. Sie zeigt Pixel-Diffs, nicht ob
die Verschiebung richtig ist. Eine Akzeptanzregel wie „Änderung im Textbereich
= ablehnen" ist zu grob — sie hätte den korrekten Fix aus `7c524cc` verworfen,
weil dort vier Zeilen bewusst auf Seite 2 wandern.

### Ebene 2 — Messmethode: millimetergenaue PDF-Analyse

Pixel-Diffs sind für Druck zu grob. Die Wahrheit ist das PDF:

- `pdfinfo` liefert Seitenzahl und Blattgröße.
- `pdftotext -bbox -f N -l N` liefert Wort-Koordinaten in PDF-Punkten
  (× 25,4/72 = Millimeter, Auflösung 0,01 mm).
- `pdftoppm -r 96 -png` rendert für pixelweise Prüfung (Falzmarken,
  Laufkopf, Geschäftsangaben).

**Zwei PDFs sind nie byte-gleich.** Chromium schreibt `CreationDate` und
`ModDate` in die Datei; ein `cmp` oder Hash-Vergleich meldet deshalb immer
„geändert". Verglichen werden:

1. die extrahierten **Wort-Koordinaten** (bbox), und
2. der **PNG-Diff** (0 Pixel bei Schwelle 10).

Ein Fix, der beide nicht messbar ändert, ist ein No-Op. Belegt: `padding-bottom:
20mm` auf `#kern` allein ließ Koordinaten und Pixel unverändert — der Unterrand
erschien erst mit `box-decoration-break: clone`.

**Die Print-Emulation lügt.** `getBoundingClientRect` unter
`Emulation.setEmulatedMedia({media:'print'})` ist viewport-relativ und durch
Scrollen sowie Flex-Zentrierung verfälscht. Gemessen: `blattTop = −101,87 mm`
in der Emulation, während dasselbe PDF den Briefkopf korrekt bei 51,36 mm
setzte. `Page.printToPDF` layoutet anschließend neu.

> DOM-Rects aus der Emulation sind **Hinweise**. Die Wahrheit ist das PDF.
> Widersprechen sie sich, gewinnt das PDF.

### Ebene 3 — Diagnose: objektive Kriterien statt Augenmaß

**Wort-Kollision** (Überlappung zweier Texte):

> Zwei Wörter liegen auf derselben Grundlinie (Differenz der `yMax` < **0,5 mm**)
> und ihre x-Intervalle schneiden sich um mehr als **0,3 mm**. Die 0,3 mm sind
> Kerning-Toleranz; ohne sie meldet jede Ligatur eine Kollision.

**Verschiebung oder Verzerrung** (bei Änderungen im Textbereich):

> Drei Anker messen — Briefkopf, erste und letzte Marke. Verschieben sich alle
> um denselben Betrag (**Δ ≤ 0,05 mm** Abweichung, weil `pdftotext` auf 0,01 mm
> rundet), ist es eine **gleichmäßige Verschiebung**: akzeptabel, wenn die
> Zielposition die richtige ist. Unterscheiden sich die Beträge, ist es eine
> **Verzerrung**: ablehnen und die Ursache suchen.

**Nicht-deterministische Ausgabe** ist immer ein Bug, nie Geschmack:

> Derselbe Brief ergab je nach `data-seiten`-Zustand drei verschiedene
> Briefkopf-Positionen (51,36 / 54,01 / 61,94 mm). Eine Ausgabe, die vom
> inneren Zustand abhängt, ist falsch — auch wenn jeder Einzelzustand
> „plausibel" aussieht.

### Ebene 4 — Fix: Mechanismus statt Symptom

Ein Fix muss den Mechanismus adressieren. Zwei belegte Gegenpaare:

| Symptom-Fix (wirkungslos) | Mechanismus-Fix (wirkt) |
| :--- | :--- |
| `#kern { padding-bottom: 20mm }` allein — bei einem fragmentierten Block greift Padding nur am **Blockende** | zusätzlich `box-decoration-break: clone` — wiederholt die Box-Dekoration an **jeder** Seitengrenze |
| `body[data-seiten] #viewport` (1,1,1) — verliert gegen `body[data-seiten]:not([data-seiten="1"]) #viewport` (1,2,1) | `#app-shell #viewport` (2,0,0) — schlägt jeden Zustands-Selektor |

Die Regel dahinter: **erst die Kaskade bzw. das Fragmentierungsmodell
verstehen, dann schreiben.** Ein Selektor, der „auch matcht", ist kein Fix,
wenn ein spezifischerer ihn überstimmt.

### Harness-Disziplin

Der Messaufbau muss den **Nutzerpfad** nachbilden: Seite im Bildschirmmodus
laden, füllen, dann drucken.

Wird stattdessen unter aktiver Print-Emulation neu geladen, entsteht ein
Zustand, den kein Nutzer hat: der Mehrseiten-Controller findet `#probe` nicht
(`display: none` im Druck), setzt `data-seiten` nie, und die Bildschirmregel
mit 10 px Padding bleibt im Druck stehen. Genau dieser Zustand war der einzige,
in dem der Viewport-Bug reproduzierbar war.

Daraus folgen zwei Pflichten:

1. Weicht der Harness vom Nutzerpfad ab, wird das **im Output benannt** und der
   Bug-Fall **separat** gerendert — eine Nicht-Reproduktion im Normalpfad darf
   nicht als „kein Bug" verkauft werden.
2. Der Zustand wird protokolliert: `data-seiten` (Body und Viewport),
   berechnetes Viewport-Padding, `#probe`-Höhe, Seitenzahl des PDFs.

### Wann welche Ebene

| Situation | Ebene |
| :--- | :--- |
| Erster Blick auf einen visuellen Diff | 1 (Heatmap) |
| Heatmap zeigt Δ — ist das Ergebnis korrekt? | 2 (Millimeter) |
| Δ im Textbereich — Verschiebung oder Verzerrung? | 3 (Anker-Vergleich) |
| Fix gebaut — wirkt er wirklich? | 2 (Koordinaten + PNG-Diff) |
| Fix wirkt nicht — warum? | 4 (Mechanismus) |

## Akzeptanz-Kriterien

Ein visueller Fix ist akzeptiert, wenn:

1. **Delta nur in der erwarteten Zone** liegt (z. B. Unterrand ab 273 mm), nicht
   im Briefkopf (y < 60 mm) und nicht im Brieftext (60 < y < 270 mm).
2. Alle **Anker** sich um denselben Betrag verschieben (Δ ≤ 0,05 mm) — keine
   Verzerrung.
3. Die **Seitenzahl unverändert** ist (1 bleibt 1, 2 bleiben 2) und alle
   Testmarken je genau einmal vorkommen.
4. **Rot-Nachweis gefahren** wurde: mit dem alten Stand müssen die Tests rot
   sein. Ohne Rot-Nachweis ist ein Test eine Behauptung, keine Prüfung.

## Konsequenzen

- Jeder Druck- und Layout-Bug durchläuft diese vier Ebenen.
- Die Heatmap ist Pflicht, aber nicht ausreichend — sie liefert die Zone, nicht
  das Urteil.
- `pdftotext -bbox` in Millimetern ist die Messwahrheit; die Print-Emulation
  liefert nur Hinweise.
- Ein Fix ohne Rot-Nachweis wird nicht committed.
- Der Aufwand pro Runde sinkt: die Zonen-Ausgabe der Heatmap beendet die
  Isolierschleife, bevor sie beginnt.

## Werkzeuge

- `tools/print-messung.mjs` — parametrisierte PDF-Messung:
  `--saetze N`, `--rand-u 20|30`, `--json`. Liefert Seitenzahl, `yMax` pro
  Seite und den Unterrand (`297 − yMax`); Referenzbrief aus
  `test/fixtures/brief-42.json`. Aufruf setzt einen Server auf
  `127.0.0.1:8099` voraus. Für #47/#48.
- `pdftotext -bbox`, `pdfinfo` — PDF-Analyse (poppler-utils). Wortkoordinaten
  in Punkt, für Millimeter mit `× 25,4 / 72` umrechnen.
- `pdftoppm` — PNG-Rendering für Pixel-Messungen (Falzmarken, Laufkopf,
  Unterstrich-Längen); Schwelle für „geändert" ist ein Pixel-Diff > 10.
- Chrome DevTools Protocol (`Page.printToPDF`, `Runtime.evaluate`) — Rendering
  und DOM-Messung. `printToPDF` mit `preferCSSPageSize` und
  `printBackground`; DOM-Rects sind scroll- und zentrierungsverfälscht und
  ersetzen die PDF-Messung nicht.

## Paging-Erkenntnisse (gemessen 2026-11-11, 6cad5bf)

Vier invariante Eigenschaften des Mehrseiten-Pagings. Wer eine davon ändert,
bricht das Paging ohne Fehlermeldung.

### 1. #kern-Höhe ist abgeleitet, nicht setzbar

`multipage-controller.js:67–75` berechnet die Seitenzahl aus
`kern.getBoundingClientRect().height` — es gibt keine Formel-Kopie im JS.
Die Kette ist CSS → `#kern`-Höhe → Paging. Wer `height` auf `#kern` setzt,
bricht die Ableitung still. Die CSS-Variable `--nutz` wirkt über
`column-height` auf das Layout, nicht direkt auf das Paging.

### 2. #kern-Höhe ist auf das Seiteraster quantisiert

Gemessen: 602,00 / 906,99 / 1211,99 mm = `n × 297 + (n−1) × 8`. Das erklärt,
warum 42, 45 und 47 Sätze bei randU=20 dieselbe Höhe ergeben (alle 602 mm) —
die Höhe springt auf ganze Seitenschritte, nicht kontinuierlich.

### 3. --nutz ist nicht als mm-Wert abfragbar

`getPropertyValue('--nutz')` liefert den Tokenstrom
(`calc(297mm - 25mm - 20mm)`), nicht `252mm` — die Property ist nicht per
`@property` registriert. Für Messungen `columnHeight` oder `columnHeightMm`
(aufgelöst) nutzen, nicht den Property-Wert.

### 4. row-gap: var(--zeilenabstand) hat keinen messbaren Einfluss

Gemessen: `--zeilenabstand` springt bei randU=30 von 53 auf 63 mm, aber
`#kern`-Höhe und Seitenzahl bleiben unverändert. Die Höhe kommt aus dem
Seiteraster (§2), nicht aus row-gap. Ungeklärt, ob das so gewollt ist —
eigener Auftrag, falls relevant.

## Verwandte ADRs

- [[ADR-CONTENTEDITABLE-MIGRATION]] — Pixel-Perfect bei Element-Umbauten
  (Δ ≤ 0,5 px), ergänzt diese ADR um den Fall „Element wird ersetzt".
- [[ADR-EINSEITEN-STILLGELEGT]] — der Einzelseiten-Modus, dessen Abschaltung
  den Mehrseiten-Druckpfad überhaupt erst zum Thema machte.
- [[AGENTS]] §7a „Pixel-Perfect-Nachweis bei Element-Umbauten" — die normative
  Regel; diese ADR beschreibt das Verfahren für Druck und Seitenumbruch.
