# 23 — Geometrie-Ableitung (B1-Rest)

Offene Punkte aus dem B1-Review, die **nicht** sofort umgesetzt wurden, weil sie
Geometrie verschieben und dafür die Messschleife brauchen (Print-Emulation,
Δ ≤ 0,5 px).

## K8 — Zonen 17,7 / 27,3 mm aus `data-h="45"` ableiten

`website/css/sheet-multipage.css` setzt:

```css
#zusatzzone    { height: 17.7mm; flex: 0 0 17.7mm; }
#anschriftzone { height: 27.3mm; flex: 0 0 27.3mm; }
```

Der Container `din-anschriftfeld` trägt `data-h="45"`. Ändert jemand `data-h`,
bleibt die Aufteilung stehen — die 45 mm sind an zwei Stellen gepflegt, und die
DIN-Werte 17,7/27,3 sind nirgends als Attribut sichtbar.

- **A)** so lassen (0 Zeilen, aber zwei Wahrheiten)
- **B)** `--zusatz-h` / `--anschrift-h` als `data-*` am `din-anschriftfeld`
  führen und per `attr(… type(<number>))` lesen (M, neue Messung nötig)
- **C)** aus `data-h` ableiten (27,3 = h − 17,7), dann ist die Zusatzhöhe die
  einzige freie Zahl

**Empfehlung: C.** Zwei Zonen, ein Attribut, eine freie Zahl.

## K9 — Rasterzeile 4,23 mm steht an ≥ 5 Stellen

`#rucksendeangabe`, `#vermerke`, `margin-top`/`margin-bottom` an `#anrede` und
`#grussformel`, plus Print-Overrides. DIN 5008 Tab. B.1 Fussnote a
(„Zeilenhöhe 4,23 mm") ist damit mehrfach abgeschrieben.

- **A)** so lassen
- **B)** `--zeile: 4.23mm` einführen und die Stellen darauf umstellen
  (S–M, jede Stelle einzeln messen)

## K10 — Fusszeilen-Oberkante `top: 241mm` ohne Attribut

Kein `data-*`-Träger; die Zahl lebt nur im CSS. Kandidat für ein Attribut am
`din-geschaeftsangaben`-Block, wenn dort ohnehin gearbeitet wird.

## K11 — Print-`padding: 25mm 20mm 0 25mm` statt `var(--rand-o/l/r)`

Die Ränder existieren als Variablen; die Print-Regel schreibt sie erneut als
Literale. S, aber jede Änderung braucht einen Druck-Nachweis.

## Erledigt (B1, 2026-11-12)

- Platzhalter-Regel im Druck greift für alle vier Empfängerzeilen (vorher nur
  Firma und Straße) — geprüft in Print-Emulation: alle vier `display: none`.
- `body.schrift-eigene-aktiv din-blatt` entfernt (zeichengleiche Doppelregel).
- `.folgekopf-screen` in `sheet-common.css` entfernt (multipage definiert sie
  vollständig).
- `--spacer-hoehe` leitet sich aus `--falz-oben-y` + 2 mm ab; der Form-A-Block
  entfällt. Wichtig: die Definition steht auf `din-blatt`, weil `--falz-oben-y`
  dort lebt — auf `:root` kollabiert der Spacer (gemessen).
- `data-margin-bottom`/`data-margin-top` an `#betreff`, `#anrede`,
  `#grussformel` entfernt (das CSS liest sie nicht).
- `din-blatt[data-ueberlauf]::after` entfernt (Guard für den stillgelegten
  Einseiten-Modus).
