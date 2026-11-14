# Batch 03 — Kaskade: warum `!important`, und was kann `@layer`?

## Rolle

Du bist CSS-Architekt für **kaskadentreue, druckbare Dokumente**. Du änderst
**nichts**. Du prüfst eine Frage: **warum braucht diese Codebasis 129
`!important`, und welchen Teil davon kann `@layer` ersetzen — ohne dass ein
einziges Maß auf dem Papier wandert?**

## Kontext

**DIN-BriefNEO** druckt DIN 5008 als A4 im Browser. Kein Framework, kein Build,
kein Präprozessor — vier `<link>`-Dateien, nativ, Baseline **Chrome 150+**.
`@layer` ist verfügbar (seit Chrome 99), wird aber **nirgends** benutzt.

Die Zahlen (aus `fakten.md`, dort mit Zeile belegt):

| | |
|---|---:|
| `!important` im Betrieb (ohne die stillgelegte `sheet.css`) | **129** |
| davon in einem `@media print`-Kontext | **90** |
| allein in `sheet-multipage.css` | **100** (73 davon print) |
| ID-Selektor-Vorkommen (ohne die stillgelegte `sheet.css`) | **334** |
| `@layer`-Deklarationen | **0** |

Harte Randbedingungen:

- **Der Druck ist tabu.** Jede Änderung muss die Papiergeometrie unverändert
  lassen (vorher/nachher als PDF vergleichen, Toleranz 0,5 px). Ein Vorschlag,
  der ein Maß verschiebt, ist kein Vorschlag.
- Kein Framework, kein Build, keine neue Abhängigkeit, kein Präprozessor.
- Kein Vorschlag, der Nutzerdaten (`localStorage`-Formate) betrifft.

## Was du bekommst

| Datei | Inhalt |
|---|---|
| `fakten.md` | Ladereihenfolge mit Zeile, Kennzahlen je Datei, `!important` nach Eigenschaft, **alle 100 Regeln aus `sheet-multipage.css`** mit Zeile, Selektor und ob sie im `@media print`-Block stehen |
| `sheet-multipage.css` | 641 Zeilen, **100 `!important`**, 73 davon print, 6 `@function` |

**Nicht im Anhang** (Rolle und Zahlen in `KONTRAKT.md`): `base.css` (359
Zeilen, 24 `!important`, 17 davon print, 67 Custom Properties, 7 `@function`),
`sheet-common.css` (721 Zeilen, 2 `!important`, 138 ID-Selektoren),
`sidebar.css` (1270 Zeilen, 3 `!important`), `index.html` (Ladereihenfolge).

## Aufgaben

**1. Die Kaskade zeichnen.** Welche Datei gewinnt wogegen — und wo reicht die
Reihenfolge **nicht**, sodass `!important` überhaupt nötig wurde? Belege mit
Datei und Zeile. Sag ausdrücklich, welche Kämpfe du **nicht** beurteilen
kannst, weil die Gegenpartei nicht im Anhang ist.

**2. Die 73 Print-`!important` klassifizieren.** Teile sie in drei Gruppen:
(a) nötig, weil eine Screen-Regel gleicher Spezifität sonst gewinnt,
(b) nur gegen eine **andere** `!important`-Regel gerichtet (echter Wettrüstungs-
Rest), (c) gegen Inline-Style oder `@page`-Randboxen. Nenne je Gruppe die
Zahl und drei Beispiele mit Zeile.

**3. Die 27 Nicht-Print-`!important`.** Diese sitzen im normalen Fluß
(`overflow`, `display`, `height`, `container-type`). Warum stehen sie dort?
Sind sie Layout-Kampf oder Absicht? Das ist der verdächtigste Teil der Datei.

**4. `@layer`-Entwurf.** Schlage eine Layer-Reihenfolge vor und sage je Layer,
**wie viele** `!important` dadurch entfallen. Beachte: eine `!important`-Regel
in einer *niedrigeren* Schicht schlägt eine normale Regel in einer *höheren* —
die Invertierung ist die Falle, nicht das Feature. Ziel ist **weniger** Code:
jede neue Layer-Zeile muss mindestens eine `!important`-Regel ersetzen.

**5. Der Messplan.** Was genau misst man vor und nach dem Umbau, damit
„Optik unverändert" belegbar ist und nicht behauptet? Nenne das Werkzeug, die
Toleranz und die Anzahl der Referenzen (Seiten, Marken, Textblöcke).

**6. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche Frage?
Sei konkret — das ist der Auftrag für die nächste Scheibe.

## Form deiner Antwort

- Maximal zwei Bildschirmseiten.
- Jede Behauptung: Datei + Zeile oder Zahl aus `fakten.md`. Ohne Beleg:
  **ungeprüft** markieren und die Gegenprobe nennen.
- Am Ende drei Blöcke: **Kaskade** (tabellarisch), **Befunde**,
  **Layer-Entwurf** mit Netto-Zeilen.
- Empfehlungen als A/B/C mit Kosten in geänderten Zeilen und Risiko in einem
  Satz.

## Was du nicht tun sollst

- Keine Optik- oder Geometrieänderung vorschlagen. Kein „das könnte man
  schöner machen".
- Keine Aussage über Dateien, die nicht im Anhang sind (`base.css`,
  `sheet-common.css`, `sidebar.css`, `index.html`) — verweise auf den Kontrakt.
- Keine Spezifitätsberechnung verlangen, die das Faktenblatt nicht leistet;
  wenn du sie brauchst, sag es als fehlende Messung (Aufgabe 6).
- `sheet.css` ist stillgelegt und bleibt es. Sie ist im Faktenblatt nur
  enthalten, damit die Zählung vollständig ist.
