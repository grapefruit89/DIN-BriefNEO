---
id: "b59-layer-plan"
title: "B59: was @layer hier kann, was nicht — und in welcher Reihenfolge"
status: "active"
type: "reference"
created: "2026-11-15"
updated: "2026-11-15"
tags:
- din-briefneo
- css
- kaskade
- plan
doc_links:
- '[[AGENTS]]'
- '[[DECISION-LOG]]'
code_links:
- 'website/css/base.css'
- 'website/css/sheet-multipage.css'
- 'tools/geometrie-zustaende.mjs'
depends_on: []
supersedes: []
---

# B59: `@layer` statt `!important`

**Diese Datei existiert, damit niemand dieselbe Untersuchung ein zweites Mal
macht.** Alle Zahlen sind am 2026-11-15 gemessen, nicht geschätzt.

## Kurzfassung

`@layer` funktioniert hier — aber **nicht** als „einzelne `!important`
austauschen". Zwei Tests, beide gemessen:

| Test | Vorgehen | Ergebnis |
|---|---|---|
| 1 | Bildschirm-Regel in `@layer screen`, `!important` weg | ✅ 6 PDF-Seiten **0 Pixel**, 8 Geometrie-Zustände **gleich** — 2 `!important` entfernt |
| 2 | Neun `!important` im Druckblock `#kern` einfach gestrichen | ❌ **2.871.046 Pixel** Unterschied, zurückgenommen |

**Das ist die ganze „billige" Ausbeute: 2 von 90.** Alles andere braucht den
Umbau unten.

## Bestand (2026-11-15)

| Datei | `!important` |
|---|---:|
| `website/css/sheet-multipage.css` | 61 |
| `website/css/base.css` | 25 |
| `website/css/sidebar.css` | 3 |
| `website/css/sheet-common.css` | 1 |
| **Summe** | **90** |

Davon 55 im Druckkontext (`@media print` + `@page`), 35 außerhalb.
Zählweise: **Vorkommen**, nicht Zeilen (`grep -o`, nicht `grep -c`).

## Warum Test 2 scheiterte — und das ist der Kern

Die Gegenregel zu `#kern` (Druck) ist **`@scope (din-blatt) #kern`**
(`sheet-multipage.css:259`). Sie liegt **nicht** in `@media print`, gilt also
auch auf Papier. Ihre **Scoping-Nähe** schlägt die Dateireihenfolge — der
Druckblock steht später, gewinnt aber nicht. Die neun `!important` dort sind
tragend.

## Die drei Sorten von `!important`

| Sorte | Erkennungsmerkmal | Umgang |
|---|---|---|
| **A: doppelter Grundwert** | dieselbe Deklaration steht ohne `!important` schon in `base.css`/`sheet-common.css` mit **gleichem Wert** | in eine Schicht legen, `!important` streichen — **das ist erledigt (2)** |
| **B: Kampf gegen `@scope`** | Gegner ist eine Regel in `@scope (din-blatt)` | nur lösbar, wenn die `@scope`-Regel in eine **niedrigere** Schicht wandert; Druck bleibt ungeschichtet |
| **C: Kampf gegen die Bildschirm-Sperre** | Gegner sind `sheet-multipage.css:72–107` — Regeln **ohne** `@media screen` | braucht den Umbau unten; vorher nicht anfassen |

## Der Umbau, in dieser Reihenfolge

**Regel — gemessen am 2026-11-15 im Zielbrowser, nicht aus dem Gedächtnis:**

| Fall | Ergebnis |
|---|---|
| normal: ungeschichtet gegen Schicht | **ungeschichtet gewinnt** |
| normal: Schicht `a` gegen Schicht `b` | **spätere Schicht gewinnt** (`b`) |
| `!important`: Schicht gegen ungeschichtet | **Schicht gewinnt** |
| `!important`: Schicht `a` gegen Schicht `b` | **frühere Schicht gewinnt** (`a`) |

Also: für **normale** Deklarationen gewinnt das Ungeschichtete; für
**`!important`** ist die Reihenfolge umgekehrt und das Ungeschichtete steht
**unten**. (Gemessen mit `document.adoptedStyleSheets`, weil die CSP der App
inline `<style>` blockt.) Die erste Fassung dieses Plans sagte pauschal
„ungeschichtete Regeln schlagen jede Schicht" — das gilt nur für normale
Deklarationen.

**Konsequenz für den Umbau:** `!important` in eine Schicht zu legen **hebt**
es an. Wer die Bildschirm-Sperre samt `!important` in `@layer screen` legt,
macht sie damit stärker, nicht schwächer. Der saubere Weg ist deshalb:
Sperre **normal** machen (in `@layer screen`), Druck **normal** lassen
(ungeschichtet) — dann gewinnt der Druck durch die Schichtregel, ohne dass
irgendwo `!important` nötig ist. Genau das war Test 1.

1. **`@layer`-Reihenfolge deklarieren** — eine Zeile, ganz oben in `base.css`,
   vor jeder Regel: `@layer base, screen, druck;`
2. **`base.css` in `@layer base` legen** — mindestens `#app-shell` und
   `#viewport` (Zeilen 281–305). Sonst gewinnen diese ungeschichteten Regeln
   gegen die gleichnamigen in `@layer screen` und die Sperre kippt.
3. **Die Bildschirm-Sperre in `@layer screen` legen** —
   `sheet-multipage.css:72–107` (vier Regelblöcke, alle ohne `@media screen`).
4. **`@scope (din-blatt)`-Regeln in eine niedrigere Schicht** (`base`), damit
   Sorte B auflösbar wird.
5. **Erst jetzt** in den Druckblöcken die `!important` streichen — blockweise,
   nie dateiweit.
6. **Nach jedem Schritt 5 messen** (Protokoll unten). Ein Schritt ohne Messung
   ist kein Schritt.

**Reihenfolge-Verstoß = Test 2.** Wer bei Schritt 5 anfängt, bekommt
Millionen abweichender Pixel.

## Messprotokoll (verbindlich)

Beides, immer — der PDF-Vergleich allein sieht den Bildschirm nicht:

```bash
# 1. Druck: 4 Referenzbriefe (Form A/B × kurz/lang), 6 Seiten
node /tmp/opencode/b88-print.mjs /tmp/opencode/vorher      # bzw. die eigene Harness
pdftoppm -r 150 -png vorher/<name>.pdf out/<name>
# 2. Pixelvergleich mit PIL/ImageChops; Toleranz 0 Pixel

# 3. Bildschirm: 8 Zustände (2 Formen × data-seiten fehlt/1/2/3)
node tools/geometrie-zustaende.mjs /tmp/opencode/geo-vorher.json
node tools/geometrie-zustaende.mjs /tmp/opencode/geo-nachher.json
# 4. Die beiden JSON müssen identisch sein; jede Abweichung ist der Befund.
```

**Warum `tools/geometrie-zustaende.mjs` und nicht ein Ad-hoc-Dump:** der
Vorgänger setzte keinen Entwurf, jeder Lauf sah einen anderen Draft und damit
eine andere Seitenzahl — der Vergleich meldete Abweichungen ohne jede
CSS-Änderung („seiten 2 → 3"). Das Skript setzt einen festen 3-Seiten-Brief
und feste `din_settings` **vor** dem Boot und stellt den Nutzerzustand danach
zurück.

## Was NICHT funktioniert (alles gemessen oder belegt)

| Vorgehen | Warum nicht |
|---|---|
| `!important` einzeln streichen | Test 2: 2.871.046 Pixel |
| Bildschirm-Regeln in `@media screen` kapseln | B92: `data-seiten="2"` kippt (`align-items: safe center → center`, Blatt verliert 40 mm Bodenabstand) |
| `@layer` einführen, ohne `base.css` zu schichten | ungeschichtete Regeln schlagen jede Schicht — die Sperre wäre wirkungslos |
| `@page`-Regeln in Schichten | `@page`-Margin-Boxen folgen der Kaskade nicht wie normale Regeln; `@top-left/right` brauchen `!important` gegen das JS-Konstruktor-Stylesheet (`multipage-controller.js`) |
| `!important` gegen Inline-Style ersetzen | Immer noch nur durch `!important` schlagbar |
| Den `*`-Kill-Switch unter `prefers-reduced-motion` umbauen | `*` hat die niedrigste Spezifität; ohne `!important` gewinnt jede andere Regel. Bleibt. |

## Kosten und Abbruchkriterium

- **Schätzung:** 4–8 h, 10–15 Messteilläufe, Nutzen 90 → realistisch 40–50.
- **Abbruch:** wenn ein Schritt nach zwei Anläufen nicht auf 0 Pixel/8 gleiche
  Zustände kommt, wird er zurückgenommen und hier als „nicht ohne X lösbar"
  eingetragen. Kein dritter Anlauf ohne neue Erkenntnis.
- **Sichtbare Änderung:** Ziel ist **0**. Jede sichtbare Änderung ist ein
  Fehler, kein Fortschritt.

## Offener Prüfpunkt aus dem Review (2026-11-15)

Der Reviewer nennt eine statisch erkennbare Konkurrenz, die noch **nicht**
gemessen ist: die Druckregel für `#brief-ansicht` (`display: block
!important`, `width: 210mm !important`) gegen die Bildschirm-Regeln für
`data-seiten > 1` (`display: flex !important`, `width: 100% !important`).
Beide sind `!important`, beide gelten im Druck. Nach der Messung oben gewinnt
davon die **frühere** Regel, wenn beide in Schichten liegen — heute liegen
beide ungeschichtet, dort entscheidet Spezifität und Reihenfolge.

**Das ist der erste Punkt, der vor einem Umbau zu messen ist** (8 Zustände,
`data-seiten` 2 und 3). Er steht bewusst hier und nicht im Auftrag, weil er
zur Umsetzung gehört, nicht zur Bestandsaufnahme.

## Offene Fragen (nicht neu recherchieren, hier beantwortet)

| Frage | Antwort |
|---|---|
| Gibt es `@layer`-Unterstützung? | Ja, Chrome 99+. Baseline ist 150+. |
| Zählt `@page` als Druckkontext? | Ja — im Faktenblatt (`tools/batch-facts.mjs`) so behandelt. |
| Sind die fünf `container-type: normal !important` tot? | Nein. Sie schalten `container-type: size` aus `base.css:291` ab; `cqw`/`cqh` sind in `base.css:234/237` in Gebrauch. |
| Ist `#spacer { display: block !important }` nötig? | Ja. `sheet-common.css:51` setzt `display: none`. |
| Sind `@top-left`/`@top-right content: none !important` nötig? | Ja. Das JS schreibt `@page { @top-left { content: … } }` in ein Konstruktor-Stylesheet, das nach allen Dokument-CSS greift. |
| Warum 90 und nicht 92? | Test 1 hat zwei entfernt (`#viewport`, Bildschirm). |

## Werkzeuge

| Werkzeug | Zweck |
|---|---|
| `tools/geometrie-zustaende.mjs` | 8 Bildschirm-Zustände, fester Entwurf, Nutzerzustand wird zurückgestellt |
| `tools/print-messung.mjs` | PDF-Messung einzelner Werte (Seitenzahl, Unterrand), Port 8099 |
| `tools/mess-print.mjs` | Druck-Emulation in Millimetern ohne PDF |
| `tools/batch-facts.mjs --scheibe 03` | Faktenblatt zur Kaskade (Zahlen mit Zeile) |
