# Batch 06 — Layer-Kaskade: warum `@layer` hier nicht in einem Zug geht

## Rolle

Du bist CSS-Architekt für **kaskadentreue, druckbare Dokumente**. Du änderst
**nichts**. Du prüfst eine Frage: **in welcher Reihenfolge lässt sich diese
Kaskade auf `@layer` umstellen, ohne dass ein einziges Maß auf dem Papier oder
im Bildschirm-Layout wandert — und wo ist der Umbau nicht lohnend?**

## Kontext

**DIN-BriefNEO** druckt DIN 5008 als A4 im Browser. Kein Framework, kein Build,
kein Präprozessor — vier `<link>`-Dateien, nativ, Baseline **Chrome 150+**.
`@layer` ist verfügbar (Chrome 99+) und wird an **einer** Stelle benutzt
(`sheet-multipage.css`, `@layer screen` — siehe unten). `@scope` ist im Einsatz
(2 Blöcke).

Zahlen aus `fakten.md` (dort mit Zeile belegt, Zählweise **Vorkommen**):

| | |
|---|---:|
| `!important` in diesen zwei Dateien | **86** (50 Druck) |
| `!important` im ganzen Betrieb | **90** |
| `@scope`-Blöcke | 2 (`din-blatt`, Zeilen 111 und 607) |
| `@layer`-Deklarationen | 1 |
| Bildschirm-Regeln **ohne** `@media screen` | siehe `fakten.md` §3 |

## Was bereits gemessen ist (nicht erneut vorschlagen)

Zwei Umbauten wurden am 2026-11-15 durchgeführt und gemessen. **Beide Ergebnisse
sind verbindlich** — sie stehen ausführlich in
`docs/30-meta/B59-LAYER-PLAN.md`.

| Test | Vorgehen | Ergebnis |
|---|---|---|
| 1 | `#viewport`-Regeln des Bildschirms in `@layer screen`, `!important` weg (Werte waren identisch mit `base.css`) | ✅ 6 PDF-Seiten **0 Pixel**, 8 Geometrie-Zustände **gleich** |
| 2 | Neun `!important` im Druckblock `#kern` gestrichen (Annahme: „steht später, gewinnt") | ❌ **2.871.046 Pixel** Unterschied, zurückgenommen |

**Ursache Test 2:** die Gegenregel ist `@scope (din-blatt) #kern`
(`sheet-multipage.css:259`). Sie liegt **nicht** in `@media print`, gilt also
auch auf Papier, und ihre **Scoping-Nähe** schlägt die Dateireihenfolge.

**Daraus folgt (belegt, nicht vermutet):** ungeschichtete Regeln schlagen jede
Schicht, unabhängig von der Spezifität. Deshalb muss zuerst das
Ungeschichtete in Schichten — sonst gewinnt es weiterhin.

## Was du bekommst

| Datei | Inhalt |
|---|---|
| `website/css/base.css` | 402 Zeilen — Fundament, lädt zuerst |
| `website/css/sheet-multipage.css` | 612 Zeilen — Bildschirm-Sperre und Druckblock, lädt zuletzt |
| `fakten.md` | Kennzahlen, `@scope`-Blöcke, die Sperre ohne `@media screen`, **alle 86 `!important`** mit Zeile, Kontext, `@scope`-Zugehörigkeit |

**Nicht im Anhang:** `sidebar.css` (1.263 Zeilen, 3 `!important`),
`sheet-common.css` (726 Zeilen, 1 `!important`), `index.html`
(Ladereihenfolge: `base.css` → `sidebar.css` → `sheet-common.css` →
`sheet-multipage.css`). Zusammen wären es 58 KiB; die Frage spielt sich
zwischen den beiden angehängten Dateien ab.

**Der Anhang hat 48 KiB statt 30** — bewusst: die Frage ist eine
*Dateigrenzen*-Frage („base.css lädt zuerst, sheet-multipage.css zuletzt"),
ein Auszug würde genau die Gegenpartei wegschneiden. Dazu das Faktenblatt mit
allen 86 `!important` und Zeile.

## Aufgaben

**1. Die Kaskade zeichnen, Datei für Datei.** Welche Regel gewinnt heute
wogegen — und wo reicht die Reihenfolge **nicht**? Belege mit Datei und Zeile.
Sag ausdrücklich, welche Kämpfe du **nicht** beurteilen kannst, weil die
Gegenpartei fehlt (`sidebar.css`, `sheet-common.css`, Inline-Styles aus JS).

**2. Die 86 klassifizieren** in genau drei Gruppen:
(a) doppelter Grundwert — dieselbe Deklaration steht mit gleichem Wert schon
woanders; (b) Kampf gegen `@scope`; (c) Kampf gegen die ungeschichtete
Bildschirm-Sperre. Nenne je Gruppe die Zahl und drei Beispiele mit Zeile.

**3. Die Sperre sezieren.** `fakten.md` §3 listet die Regeln, die **ohne**
`@media screen` dastehen und deshalb im Druck mitgelten. Prüfe je Regel: was
passiert, wenn sie in `@layer screen` wandert und `base.css` ungeschichtet
bleibt? (Antwort in einem Satz pro Regel, mit Zeile.)

**4. Der Umbauplan.** Schlage die Reihenfolge vor und begründe jeden Schritt
mit dem, was ohne ihn bricht. Nenne je Schritt: betroffene Zeilen, Anzahl
entfallender `!important`, **was zu messen ist**. Ziel ist **0 sichtbare
Änderung** — ein Vorschlag, der ein Maß verschiebt, ist kein Vorschlag.

**5. Der ehrliche Deckel.** Wie viele der 86 sind realistisch erreichbar, wenn
`base.css` mitgeschichtet wird — und welche bleiben **strukturell** (Inline-
Style, `*`-Kill-Switch unter `prefers-reduced-motion`, `@page`-Margin-Boxen)?
Zahl plus Begründung. Wenn der Umbau sich nicht lohnt: sag es mit Zahlen.

**6. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche Frage?

## Messmethode (mitliefern, nicht nachfragen)

- **Druck:** 4 Referenzbriefe (Form A/B × kurz/lang), `Page.printToPDF`,
  `pdftoppm -r 150`, Pixelvergleich, **Toleranz 0**.
- **Bildschirm:** `node tools/geometrie-zustaende.mjs <datei.json>` — 8
  Zustände (2 Formen × `data-seiten` fehlt/1/2/3), fester Entwurf. Ein
  Vorgänger ohne festen Entwurf meldete Abweichungen ohne jede CSS-Änderung.
- `Network.setCacheDisabled` ist Pflicht. Beides messen, immer: der
  PDF-Vergleich allein sieht `data-seiten="2"` nicht.

## Form deiner Antwort

- Maximal zwei Bildschirmseiten.
- Jede Behauptung: Datei + Zeile oder Zahl aus `fakten.md`. Ohne Beleg:
  **ungeprüft** markieren und die Gegenprobe nennen.
- Am Ende drei Blöcke: **Kaskade** (tabellarisch), **Umbauplan** (nummeriert),
  **Deckel** (Zahl + Begründung).
- Empfehlungen als A/B/C mit Kosten in geänderten Zeilen und Risiko in einem
  Satz.

## Was du nicht tun sollst

- Keine Optik- oder Geometrieänderung vorschlagen.
- `!important` nicht „einfach streichen" — Test 2 ist der Beleg, was passiert.
- Bildschirm-Regeln nicht in `@media screen` kapseln: 2026-11-15 gemessen,
  `data-seiten="2"` kippt (`align-items: safe center → center`, Blatt verliert
  40 mm Bodenabstand).
- `@page`-Regeln nicht in Schichten: die Margin-Boxen folgen der Kaskade nicht
  wie normale Regeln; `@top-left`/`@top-right` brauchen `!important` gegen das
  JS-Konstruktor-Stylesheet (`multipage-controller.js`).
- Keine Aussage über Dateien, die nicht im Anhang sind — verweise auf den
  Kontrakt.
- `sheet.css` ist stillgelegt und kommt hier nicht vor.
