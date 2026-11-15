---
id: perfekter-prompt
title: 'Was ein perfekter Prompt für diesen Agenten enthält'
type: reference
status: active
created: '2026-11-11'
updated: '2026-11-11'
tags:
  - din-briefneo
  - meta
  - agent
  - prompt
doc_links:
  - '[[AGENTS]]'
  - '[[AUFGABEN-WEGWEISER]]'
  - '[[ADR-MESS-SCHLEIFE]]'
code_links:
  - 'website/css/sheet-multipage.css'
  - 'test/all.js'
depends_on: []
---

# Was ein perfekter Prompt für diesen Agenten enthält

**Zweck:** Referenz beim Prompt-Schreiben. Keine Regel — die Regeln stehen in
[[AGENTS]]. Jede Aussage hier ist mit einem Vorfall aus der Session vom
2026-11-10/11 belegt (Runden 19–27).

**Grundlage:** Ausgewertet wurden die Runden, in denen ich gut gearbeitet habe,
und die, in denen ich Messzeit verbrannt habe. Der Unterschied lag fast nie an
meinem Können, sondern daran, ob der Prompt ein Entscheidungskriterium
enthielt.

---

## 1. Pflichtfelder

| Feld | Ohne dieses Feld passiert |
| :--- | :--- |
| Rolle & Vorbedingung | Ich prüfe den Stand doppelt und schreibe ihn in die Antwort |
| Betroffene Dateien (absolut) | Ich editiere die falsche von zwei ähnlichen Dateien |
| Was NICHT zu tun ist | Ich „repariere" angrenzenden Code und breche einen Vertrag |
| Gates (Befehl + Sollwert) | Ich melde grün, ohne das richtige Gate gelaufen zu sein |
| Akzeptanz-Kriterien (messbar) | Ich liefere „sieht gut aus" statt einer Zahl |
| Rollback-Regel | Ich baue auf einem roten Gate weiter |
| Output-Format | Der Bericht ist Prosa ohne Messwerte |
| Commit ja/nein | Ich committe ungefragt oder lasse Arbeit liegen |
| Push ja/nein | Ich pushe, obwohl niemand es wollte |
| Vorher/Nachher-Methode | Ich messe mit dem falschen Werkzeug (DOM statt PDF) |
| Erste Pflichtlektüre | Ich suche 20 Minuten, was in einer Datei steht |

### 1.1 Rolle & Vorbedingung

**Warum Pflicht:** Der Stand ändert sich zwischen den Runden. In dieser Session
war HEAD nacheinander `ed4b245`, `9204041`, `37f0040`, `f51fd76`, `7c524cc`,
`5a1da8c`. Ohne die Angabe „HEAD ist X, sauber" muss ich erst `git status` und
`git log` laufen lassen und rate sonst, ob ich auf einem fremden Stand arbeite.

**So sieht es aus:**

```
Du bist Senior Engineer für /home/moritz/repos/DIN-BriefNEO.
Vorbedingung: git status sauber. HEAD ist 5a1da8c (233/233, Fitness 100 %, Biome 0).
```

**Wenn es fehlt:** Ich schreibe den Stand selbst in die Antwort (korrekt, aber
verschwendet einen Tool-Call) — oder schlimmer: ich arbeite auf einem Stand, den
du nicht meintest, weil zwischen deinem Lesen und meinem Lauf ein Commit lag.

### 1.2 Betroffene Dateien — absolut

**Warum Pflicht:** Es gibt in diesem Repo Paare, die gleich heißen und
Verschiedenes tun. `#kern` hat seine Bildschirm-Regel in `website/css/sheet.css`
(`position: absolute; bottom: attr(data-bottom)` = 30 mm) und seine
Druck-Regel in `website/css/sheet-multipage.css` (`position: relative;
padding-bottom: 20mm`). Wer „das CSS für den Unterrand" sagt, meint die zweite
Datei — und ich habe in der Messrunde zu Messung B genau diese beiden Werte
gegeneinander halten müssen.

**So sieht es aus:**

```
Datei: /home/moritz/repos/DIN-BriefNEO/website/css/sheet-multipage.css
Regel: @media print > #kern
```

**Wenn es fehlt:** Ich grep-e über alle CSS-Dateien, finde beide Regeln und
muss raten, welche gilt. Das ist genau der Moment, in dem ein Fix an der
falschen Stelle landet und wirkungslos bleibt.

### 1.3 Was NICHT zu tun ist

**Warum Pflicht:** Verbote sind in diesem Repo keine Höflichkeit, sondern
Verträge. Im Druck-Auftrag stand „keine Änderung an `@page :first`". Ich habe es
in einem Experiment trotzdem getestet: `@page :first { margin: 0 0 20mm 0 }`
machte aus dem einseitigen Brief **2 Seiten** (gemessen). Das Verbot war
berechtigt und hat den Rückfall verhindert.

**So sieht es aus:**

```
Was NICHT tun:
- Keine Änderung an @page :first (Fix aus 9204041).
- Keine Änderung an der CSP.
- Kein localStorage.clear() (würde Präferenzen löschen).
```

**Wenn es fehlt:** Ich optimiere mit. „Wenn du schon dabei bist" ist die
teuerste Nebenkostenposition in dieser Session.

### 1.4 Gates — Befehl **und** Sollwert

**Warum Pflicht:** Ein Gate ohne Zahl ist ein Gefühl. Die Sollwerte ändern sich
mit jedem Fix: 226 → 228 → 229 → 233 Tests. Im Auftrag stand „test-runner
(229 + 4 = 233 oder mehr)" — damit war klar, dass 229 Tests nicht mehr der
Ist-Stand sind, sondern 4 dazukommen.

**So sieht es aus:**

```
Gates:
- node tools/build_db.js -q           -> Fitness Score 100,0 %
- node tools/test-runner.mjs          -> 233/233
- npx @biomejs/biome@2.6.3 check website/  -> Exit 0
- node tools/reconciliation.js --only-rules -> 49 Regeln, 0 blockierend
- node tools/repo-map-check.mjs       -> 33 Pfade / 17 Module
```

**Wenn es fehlt:** Zwei Fehlerarten. Erstens: ich lasse ein Gate aus. Zweitens:
ich prüfe zu viel — `biome check test/` ist am HEAD `5a1da8c` schon rot
(Import-Sortierung, `useIterableCallbackReturn`), das Gate prüft aber nur
`website/`. Ohne den genauen Befehl hätte ich einen Altfehler als meinen
gemeldet.

### 1.5 Akzeptanz-Kriterien — messbar, nicht „sieht gut aus"

**Warum Pflicht:** „Δ ≤ 0,5 mm" ist entscheidbar, „sauber zentriert" nicht. In
der Heatmap-Runde war meine eigene Regel „Unterschiede im Textbereich → Fix
ablehnen" **zu grob**: sie hätte den korrekten Fix aus `7c524cc` verworfen, weil
dort vier Zeilen bewusst auf Seite 2 wandern. Erst das Kriterium
„gleichmäßige Verschiebung aller Anker (Δ ≤ 0,05 mm) statt Verzerrung" war
brauchbar.

**So sieht es aus:**

```
Akzeptanz: Seitenzahl unverändert (1 bleibt 1, 2 bleiben 2);
yMax Seite 1 <= 277 mm; alle 42 Marken je genau einmal;
Heatmap-Δ nur in y > 273 mm.
```

**Wenn es fehlt:** Ich liefere eine Tabelle mit Zahlen, aber ohne Urteil — und
du musst selbst entscheiden, ob 272,5 mm jetzt „richtig" ist. Genau das ist in
der Rücksendeangabe-Messung passiert: xMax = 109,44 mm, Soll ≤ 105 mm. Ohne
dein Soll wäre das nur eine Zahl gewesen.

### 1.6 Rollback-Regel

**Warum Pflicht:** Ohne sie baue ich auf Rot weiter. Der Adressdaten-Lazy-Load
wurde gebaut, gemessen (FCP 808 → 788 ms im Rauschen) und **zurückgerollt** —
weil der Auftrag „keine Änderung ohne messbaren Gewinn" enthielt. Ohne diese
Regel wäre eine wirkungslose Änderung im Commit gelandet.

**So sieht es aus:**

```
Wenn ein Gate rot wird: Änderung zurücknehmen, Ursache im Output melden,
NICHT das Gate umgehen. Kein Commit auf rotem Stand.
```

### 1.7 Output-Format

**Warum Pflicht:** Der Unterschied zwischen „ich habe den Druck gefixt" und
„1 Seite, 209,89 × 297,01 mm, linker Rand 25,00 mm, Falzmarken bei 105/210 mm"
ist der Unterschied zwischen Behauptung und Beleg. In der Druck-Runde hast du
das Format vorgegeben (Tabelle: Messpunkt | Soll | Ist | Delta | Bewertung),
und der Bericht war sofort prüfbar.

**So sieht es aus:**

```
1. Ist-Zustand (Code-Zitate)
2. Messung (Tabelle: Prüfpunkt | Soll | Ist | Delta | Bewertung)
3. Bewertung (Bug / kein Bug)
4. Falls Bug: Fix + Test + Gates + Commit
5. Falls kein Bug: Bestätigung, kein Commit
```

**Wenn es fehlt:** Ich schreibe Fließtext, du fragst nach Zahlen, ich messe
nach. Das kostet eine ganze Runde.

### 1.8 Commit und Push — getrennt entscheiden

**Warum Pflicht:** Zwei verschiedene Dinge, zwei verschiedene Risiken. In der
EXIF-Runde stand „kein Bug → kein Commit" und ich habe nichts committet
(richtig). In der Privacy-Runde stand „nur wenn ein Fix nötig war" und ich habe
`37f0040` gebaut. Wo beides fehlt, entsteht die Frage, ob ich „ohnehin" committe
— in Runde 20 ist das passiert.

**So sieht es aus:**

```
Commit: nur wenn Fix + grüne Gates. Push: nein (nur auf ausdrückliches "push").
```

### 1.9 Vorher/Nachher-Messmethode

**Warum Pflicht:** Das falsche Werkzeug liefert falsche Zahlen. In der
Viewport-Runde habe ich unter `Emulation.setEmulatedMedia` ein
`blattTop = −101,87 mm` gemessen, während dasselbe PDF den Briefkopf korrekt bei
51,36 mm setzte. Erst `pdftotext -bbox` in Millimetern war die Wahrheit.

**So sieht es aus ([[ADR-MESS-SCHLEIFE]]):**

```
Messung nur über Page.printToPDF + pdftotext -bbox.
Print-Emulation ist scroll-verfälscht und liefert nur Hinweise.
```

### 1.10 Was zuerst zu lesen ist

**Warum Pflicht:** In der Viewport-Runde habe ich 20 Minuten isoliert, was eine
einzige Datei erklärt hätte. Der Wegweiser ([[AUFGABEN-WEGWEISER]]) und die ADR
zur Mess-Schleife existierten da schon.

**So sieht es aus:**

```
Lies VOR dem ersten Edit: docs/30-meta/AUFGABEN-WEGWEISER.md (Sektion 1),
bei visuellen Bugs docs/10-architecture/ADR-MESS-SCHLEIFE.md.
```

---

## 2. Aufgabentypen

| Typ | Zusätzlich nötig | Beleg aus dieser Session |
| :--- | :--- | :--- |
| **Bugfix** (klar umrissen) | Reproduktion vor dem Fix, Rot-Nachweis, Seitenzahl/Akzeptanz | Druck-Bug: 2 PDF-Seiten → 1, Rot-Nachweis mit altem CSS |
| **Messung / Prüfung** | Soll-Werte, Messwerkzeug, Abbruchkriterium („kein Fix ohne Befund") | EXIF-Prüfung: 5 Kriterien, alle negativ → kein Commit |
| **Feature** | Wo das Element hingehört, was es nicht dürfen darf, IMR-Bezug | Einzelseiten-Modus stillgelegt: Schalter raus, ADR, Rückweg über Git |
| **Refactoring** | Verhaltens-Invariante + Pixel-Nachweis (Δ ≤ 0,5 px) | Anlagen-Migration: Δ 0,00 px, 218 Tests |
| **Doku** | Zielgruppe, Pflichtabschnitte, Frontmatter, Link-Ziele | ADR-Mess-Schleife: 4 Ebenen, Wegweiser-Zeile, 33 Pfade |
| **Ratsche** | Was die Regel fängt, was sie **nicht** fängt, Budget | `P38`: Kommentare wurden mitgezählt → Umformulierung statt Engine-Fix |
| **Migration** | Vertrag alt/neu, Fallstricke, Test-Anpassung, Rückweg | contenteditable → input: „Tests, die alte Verträge kodieren, umstellen" |
| **Regression-Fix** | Wann es zuletzt funktionierte, welcher Commit es brach | Viewport-Padding: `f51fd76` deckte nur `data-seiten="1"` ab |
| **Cleanup** | Nachweis, dass nichts mehr aufruft (`grep`), sonst nicht löschen | totes Multipage-Event: Aufrufer belegt, dann entfernt |

**Zwei Ergänzungen, die den Unterschied machen:**

- **Regression-Fix:** Nenne den Commit, der es brach, oder wenigstens den
  funktionierenden Zustand. „Es ging mal" reicht nicht — ich habe kein Gedächtnis
  über Sessions.
- **Ratsche:** Sag ausdrücklich, ob die Regel *Engine* oder *Konvention* ist.
  Bei `P38` war unklar, ob Kommentare mitzählen. Ich habe umformuliert statt zu
  fragen — der falsche Weg, aber der einzige, den der Prompt zuließ.

---

## 3. Anti-Patterns im Prompt

| Anti-Pattern | Warum es ablenkt | Besser |
| :--- | :--- | :--- |
| „Optimieren" ohne Zielgröße | Ich wähle eine beliebige Metrik (FCP, Bytes, Lesbarkeit) | „FCP unter 800 ms bei Slow 4G" |
| „Mach das mal schön" | Kein Akzeptanzkriterium, ich rate Geschmack | „Linienhöhe 4,5 mm, Δ ≤ 0,5 px" |
| „Und wenn du schon dabei bist …" | Scope-Creep, ich breche fremde Verträge | eigener Auftrag, eigene Gates |
| „Das ist doch einfach" | Signal, nicht zu messen — genau dann messe ich | „Erwartet: 1 Zeile, 5 Minuten" |
| „So wie [anderes Projekt]" | Ich kenne das andere Projekt nicht | „So wie `#anlagen-angabe`: textarea mit `data-feldtyp`" |
| „Nur schnell" | Signal, Gates zu überspringen | „Ohne Commit, nur Befund" |
| „Ich glaube, es liegt an X" | Hypothese wird ungeprüft übernommen | „Prüfe Hypothese X; wenn sie falsch ist, melde das" |
| „Wie beim letzten Mal" | Ich habe kein Session-Gedächtnis | „Muster: `<din-rucksendeangabe data-w>`" |

### 3.1 „Ich glaube, es liegt an X" — der teuerste Fall

In der Viewport-Runde lautete die Prämisse: „Der kurze Brief ergibt 2 Seiten
(Regression aus 9204041)." Das war im **Normalpfad falsch**: Seite im
Bildschirmmodus laden, drucken ergab 1 Seite. Die leere Seite 2 entstand nur im
Print-Boot-Zustand, den kein Nutzer hat. Die ungeprüfte Prämisse kostete eine
zusätzliche Isolier-Runde.

**Regel für den Prompt:** Eine Nutzer-Hypothese ist eine *Vermutung*, kein
Auftrag. Formuliere sie als zu prüfende Aussage:

```
Hypothese: kurzer Brief = 2 Seiten. Prüfe im Normalpfad UND im Print-Boot.
Wenn die Hypothese nicht reproduzierbar ist: melden, nicht "fixen".
```

### 3.2 „Nur schnell" — der Fall mit dem No-Op

Der Unterrand-Fix sollte „einfach" `padding-bottom: 20mm` sein. Die Messung
zeigte: **bit-gleiche Koordinaten und 0 Diff-Pixel** — `padding-bottom` greift an
einem fragmentierten Block nur am Blockende. Erst `box-decoration-break: clone`
änderte etwas (Seite 1: 294,99 → 272,50 mm). Hätte ich „nur schnell" committet,
wäre ein wirkungsloser Fix mit grünem Test in der Historie.

---

## 4. Positive Patterns

| Pattern | Warum es hilft | Beleg |
| :--- | :--- | :--- |
| „Miss X gegen Y, Akzeptanz Δ ≤ Z" | Entscheidbar ohne Rückfrage | Heatmap: Δ nur in y > 273 mm |
| „Wenn Gate rot: zurückrollen, Ursache melden" | Verhindert Bauen auf Sand | Adressdaten-Lazy-Load zurückgerollt |
| „Was NICHT tun: [Liste]" | Verhindert Kollateralschaden | `@page :first` blieb unangetastet |
| „Lies [Datei] VOR dem ersten Edit" | Spart die Suchschleife | Wegweiser + ADR-Mess-Schleife |
| „Rot-Nachweis: mit altem Code muss der Test rot sein" | Beweist, dass der Test den Bug fängt | 3 von 4 Tests rot mit HEAD-CSS |
| „Belege jede Behauptung mit [Methode]" | Verhindert „sieht gut aus" | `pdftotext -bbox` in mm |
| „Absolute Pfade in der Antwort" | Kopierbar, eindeutig | durchgängig in allen Berichten |
| „Kein Commit ohne grüne Gates" | Historie bleibt benutzbar | alle Commits dieser Session |

**Das stärkste Muster** war die Heatmap-Akzeptanz mit Bounding-Box: sie machte
aus „irgendwas hat sich geändert" ein „alles unterhalb 273,31 mm, Textbreite
25–190 mm". Damit war die Entscheidung in einem Satz möglich — statt in einer
weiteren Messrunde.

---

## 5. Rückfragen

**Wann fragen:**

1. Zwei messbare Optionen mit **unterscheidbaren Produktfolgen** (Unterstrich
   85 vs. 80 mm).
2. Ein Verbot und ein Messbefund widersprechen sich (Bug nur über
   `@page :first` lösbar, das aber verboten ist).
3. Eine Norm/ein Vertrag müsste geändert werden (IMR-Registry, `data-w`).

**Wann nicht fragen, sondern arbeiten:** wenn der Prompt die Entscheidung schon
enthält oder ich die Antwort selbst messen kann.

**Wie fragen:** eine Frage, zwei bis drei Optionen, je ein Satz Folge, und die
empfohlene Option zuerst. Keine rhetorischen Fragen, kein „soll ich X oder Y?",
wenn der Prompt X sagt.

**Das Muster, das am besten funktioniert hat:** In der IMR-Runde standen sich
„ID auf dem Wrapper" (Normverstoß) und „ID auf dem Partner-Element"
(Vertragsbruch) gegenüber. Statt A/B zu fragen, habe ich die **dritte Option**
gesucht: `id="anlagen-angabe"` auf das `<textarea>`, den Wrapper ohne ID. Beide
Seiten erfüllt, kein Vertrag gebrochen.

**Regel:** Bevor du A/B fragst, prüfe, ob es eine Option gibt, die **beide**
Bedingungen erfüllt. Frage erst, wenn du drei Optionen durchgerechnet hast.

---

## 6. Stoppen

**Die drei Stopp-Signale:**

| Signal | Beispiel | Was ich melde |
| :--- | :--- | :--- |
| **Rotes Gate** | Fitness 99,55 % wegen TS7006 in `test/all.js` | Fehler, Datei:Zeile, Fix-Vorschlag |
| **Unlösbarer Konflikt** | Bug nur über verbotene Regel lösbar | beide Wege + Folge, Entscheidung erbitten |
| **Fehlende Information** | Soll-Wert unbekannt (xMax-Grenze) | was ich messen kann, was fehlt |

**Was ich nicht tue:** raten, improvisieren, Gates überspringen, eine Norm
„passend" ändern.

**„Stoppen und fragen" vs. „stoppen und nachdenken":** Stoppen ist berechtigt,
wenn ein Vertrag, eine Norm oder eine Produktentscheidung betroffen ist. Es ist
verfrüht, wenn ich den Designraum noch nicht ausgeschöpft habe — in der IMR-Runde
war Stoppen richtig, die dritte Option zu suchen war besser.

**Rollback:** `git stash` bzw. `git checkout -- <datei>`, Gate erneut laufen,
dann im Output: was zurückgenommen wurde, wie das Gate aussah, nächster Schritt.

---

## 7. Output

**Pflichtfelder je Antwort:** Ist-Zustand · Messung (Zahl + Einheit) · Bewertung
· Änderung mit Datei:Zeile · Gates mit Ergebnis · Commit-Hash · offene Punkte.

**Was nicht hineingehört:** Entschuldigungen, „ich hoffe, das hilft",
Meta-Kommentare über den eigenen Prozess (außer wenn der Prozess der Befund
ist), Wiederholung des Auftrags.

**Länge:** knapp, wenn der Befund eindeutig ist („1 Seite, 210 × 297 mm, ok");
ausführlich, wenn eine Entscheidung ansteht — dann mit Tabelle und
Alternativen.

**Belegform je Aussage:**

| Aussage | Beleg |
| :--- | :--- |
| „Die Regel steht in Datei X" | `Datei:Zeile` + Zitat |
| „Der Wert ist Y" | Messbefehl + Rohwert |
| „Der Fix wirkt" | Vorher/Nachher in derselben Einheit |
| „Der Test fängt den Bug" | Rot-Nachweis mit altem Stand |

---

## 8. Prompt-Checkliste (vor dem Absenden)

- [ ] HEAD-Hash + Testzahl genannt?
- [ ] Betroffene Datei(en) absolut?
- [ ] Mindestens ein „Was NICHT tun"?
- [ ] Gates mit Befehl **und** Sollwert?
- [ ] Akzeptanz in Zahl + Einheit?
- [ ] Rollback-Regel?
- [ ] Commit/Push explizit?
- [ ] Messwerkzeug genannt (PDF, CDP, `rg`)?
- [ ] Erste Pflichtlektüre genannt?
- [ ] Bei Hypothesen: als zu prüfende Aussage formuliert?
