---
id: testbrief-generator
title: 'Testbrief-Generator — Adressleiter, Ankerleiter und Satzbausteine'
type: guide
status: active
created: '2026-10-26'
updated: '2026-11-08'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/guide
doc_links:
  - ADR-JS
  - glossary
code_links:
  - website/addons/testbrief/testbrief.js
  - website/js/main.js
error_patterns:
  - testbrief
  - testdaten
  - charaktere
  - held
  - empfaengerblock
  - adressleiter
  - ankerleiter
  - erfundene hausnummer
  - residenz-platzhalter
supersedes: []
depends_on: []
---

# Testbrief-Generator — Adressleiter, Ankerleiter und Satzbausteine

> [!tip] Wozu dieser Guide
> Er beschreibt die Regeln, nach denen der Knopf „Testbrief" aus den Charakterdaten
> in `website/addons/testbrief/charactere.json` einen Empfängerblock und einen
> Text baut. Die Regeln sind Laufzeitlogik in `website/addons/testbrief.js`; die JSON
> bleibt die Quelle der Wahrheit und wird dabei nicht verändert.

## 1. Grundsatz

**Die JSON behauptet, JavaScript formuliert.** Kein Satz und keine Adresszeile darf
eine Tatsache behaupten, die nicht in der JSON steht. Fehlt ein Fakt, entfällt die
Aussage — nicht der Brief.

Daraus folgt: ein kurzer, wahrer Brief ist besser als ein lebendiger, falscher.
Das ist die harte Grenze; Natürlichkeit, Abwechslung und Figurenzahl sind Ziele
darunter, nicht gleichrangig.

## 2. Adressleiter

Für die Anschriftenzeile gilt diese Reihenfolge. Sie wird zur Laufzeit abgearbeitet,
geschrieben wird nur das Ergebnis — nie ein Zwischenschritt.

| Priorität | Quelle | Beispiel |
| :--- | :--- | :--- |
| 1 | belegte Straßenadresse der Figur | `20 Ingram Street` |
| 2 | belegter Gebäudename der Figur | `Der Fuchsbau`, `Sanctuary` |
| 3 | Verneinung oder Platzhalter erkannt | Zeile bleibt leer |
| 4 | keine belegbare Anschrift | Zeile bleibt leer |

**Nicht** erlaubt: erfundene Hausnummern, erfundene Postleitzahlen, aus anderen
Figuren geborgte Straßen. Ein Gebäudename in der Anschriftenzeile ist eine
bewusste Darstellungsentscheidung des Testbriefs („Anschrift des fiktiven
Empfängers"), keine Kanon-Aussage über eine Wohnadresse.

### 2.1 Was die Laufzeit entfernt

| Eingabe | Ausgabe | Grund |
| :--- | :--- | :--- |
| `Ligusterweg 4 (ehem.) / Hogwarts` | `Ligusterweg 4` | erster belegter Teil, Klammerzusatz entfällt |
| `20 Ingram Street (Forest Hills)` | `20 Ingram Street` | Klammerzusatz ist Stadtteil, nicht Straße |
| `Wayne Manor 1007` | `Wayne Manor` | Nummer ist nicht belegt |
| `Schloss Mühlenhof 1` | `Schloss Mühlenhof` | Nummer ist nicht belegt |
| `Hateno-Dorf Haus 1` | `Hateno-Dorf Haus 1` | „Haus" ist Teil der Bezeichnung |
| `Ahri-Residenz 1` | *(leer)* | generierter Platzhalter, kein Kanon |
| `Kein fester Wohnsitz (…)` | *(leer)* | Verneinung, keine Anschrift |

Die Scheinanschrift-Erkennung greift nur, wenn der Stamms des Werts **exakt** dem
Figurennamen entspricht. Kanonische Bezeichnungen wie `Hokage-Residenz` oder
`Broflovski-Residenz` bleiben dadurch erhalten.

## 3. Zwei Leitern: Person und Thema

Ein „Anker" ist der belegte Anknüpfungspunkt. Seit 2026-11-08 gibt es **zwei**
Leitern, weil Personenbezeichnung und Brief-Thema unterschiedliche Anforderungen
haben. Vorher zog beides dieselbe Leiter — deshalb stand fast immer ein Alias im
Betreff und der Gegenstand der Figur kam praktisch nie vor (gemessen: 1,4 %).

**Personenbezeichnung** (`bezeichne()` → `waehleAnker()`):

| Priorität | Feld | Bedingung |
| :--- | :--- | :--- |
| 1 | `alias` | kein Platzhalter, keine bloße Wiederholung des eigenen Namens |
| 2 | `firma` | nur wenn der Wert **eine** Organisation benennt |
| 3 | `hooks` | freie Wahl aus den vorhandenen Stichwörtern |
| 4 | `franchise` | letzter belegter Wert; immer vorhanden |

**Thema des Briefes** (`getCharHook()`) — Hook zuerst:

| Priorität | Feld | Bedingung |
| :--- | :--- | :--- |
| 1 | `hooks` | ein zufälliger Gegenstand der Figur |
| 2 | `alias` | wie oben |
| 3 | `firma` | wie oben |
| 4 | `franchise` | letzter belegter Wert |

Der Grund für die Trennung ist sprachlich: „Bruce Wayne, bekannt für Doppelleben"
wäre als Personenbezeichnung falsch, „zum Vorgang: Batarang" ist als Thema genau
richtig. Deshalb bleibt `bezeichne()` bei Alias-first, während `getCharHook()`
aggressiv auf die Hooks zugreift.

### 3.1 Warum `firma` gefiltert wird

`firma` enthält bei den Comic-Figuren häufig einen Berufs-Blob statt eines
Arbeitgebers:

```
"Musician, adventurer, author; formerly talk show host"
"Haus Stark (Geburtshaus), Faceless Men (zeitweilig)"
```

Solche Werte werden verworfen, sobald sie `;`, `/` oder `formerly`/`ehemalig`
enthalten oder länger als 60 Zeichen sind. Klammerzusätze wie `(freelance)` entfallen.

Ein Alias, der nur den eigenen Namen wiederholt (`Ron` für *Ron Weasley*,
`Bruce Wayne` für *Batman*), ist kein Thema und wird übersprungen.

### 3.2 Warum `alias` in der Personenbezeichnung vorn bleibt

`alias` ist bei 302 von 303 Figuren gefüllt, `hooks` bei 301. Für die
Personenbezeichnung ist der Alias die belastbarere Aussage: Er ist ein Name,
keine Deutung. Ein Hook als Zusatz („bekannt für …") wird nur noch verwendet,
wenn eine Figur weder Alias noch Organisation hat.

### 3.3 Bestand der Hooks (Stand 2026-11-08)

| Kennzahl | Wert |
| :--- | :--- |
| Figuren mit mindestens einem Hook | 301 von 303 (99,3 %) |
| Hooks insgesamt | 745 |
| Hooks je Figur | 2,46 im Schnitt |

Aufnahmeregel für neue Hooks: **nur konkrete Gegenstände** (Gegenstand, Werkzeug,
Waffe, Fahrzeug, Artefakt, Tier, Kleidungsstück, Gericht). Keine Orte, keine
Konzepte („Doppelleben"), keine Attacken („Rasengan"), kein Eigenname der Figur.
Grund: Der Hook wird als Doppelpunkt-Nachtrag eingesetzt; Orte und Konzepte lesen
dort schief, und ein Hook mit Figurnamen macht `bezeichne()` kaputt.

Zwei Figuren haben keine belegbaren Gegenstände (`Dele Adebayo`, `Krachbumm-Ente`).
Sie können deshalb nicht Absender sein, wohl aber Empfänger oder Beteiligte.

## 4. Betreff und Text

Der Betreff setzt das Thema als Nachtrag hinter einen Doppelpunkt. Es gibt sechs
Briefgattungen; **Betreff und Text stammen aus derselben Gattung**, damit
Überschrift und Inhalt nicht auseinanderlaufen:

| Gattung | Betreffmuster |
| :--- | :--- |
| Kündigung | `Außerordentliche Kündigung: <Thema>` |
| Beschwerde | `Dienstaufsichtsbeschwerde: <Thema>` |
| Schadensersatz | `Schadensersatzforderung: <Thema>` |
| Auskunft | `Auskunftsersuchen: <Thema>` |
| Abmahnung | `Abmahnung und Unterlassungsaufforderung: <Thema>` |
| Kooperation | `Angebot einer gemeinsamen Klärung: <Thema>` |

Grund für den Doppelpunkt: Das Thema ist ein nacktes Substantiv ohne bekannten
Kasus. „im Umgang mit Handtuch" wäre grammatisch falsch, „zum Vorgang: Handtuch"
ist kasusneutral und klingt bürokratisch.

Der Text verwendet ausschließlich:

- den Absender mit Personenbezeichnung aus §3,
- den Hook **des Absenders** als Thema (nicht den einer zufälligen Figur),
- den Empfänger mit Namen,
- die belegten Orte beider Seiten,
- die gewürfelten Drittfiguren als **Beteiligte** in einem Schlusssatz.

Frei erfunden ist allein die **Handlung** des Briefes. Sie ist Fiktion des
Testbriefs und behauptet nichts über die Figur.

### 4.1 Besetzung

| Rolle | Regel |
| :--- | :--- |
| Absender | Figur mit mindestens einem Hook; Thema ist einer ihrer Hooks |
| Empfänger | beliebige Figur aus einem **anderen** Franchise |
| Beteiligte | 0–3 Figuren aus dem Rest, nur im Schlusssatz genannt |

`franchise` wird für den Vergleich normalisiert (`Marvel Comics` → `Marvel`,
`Das Lied von Eis und Feuer` → `Game of Thrones`, `BioShock Infinite` → `BioShock`,
`Red Dead Redemption 2` → `Red Dead Redemption`), damit kein Universum an sich
selbst schreibt.

### 4.2 Messung statt Augenmaß

`tools/testbrief-messung.mjs` erzeugt Briefe über dieselben exportierten
Funktionen (`waehleBesetzung`, `getCharHook`, `waehleSzenario`,
`generateNerdText`) und prüft:

| Prüfung | Soll |
| :--- | :--- |
| Absender hat Hook | 100 % |
| Hook im Betreff | 100 % |
| Hook im Text | 100 % |
| Franchise-Kreuzung | 100 % |
| häufigster Hook | < 8 % |
| Szenarien | je 10–25 % |

Das Skript endet mit Exit-Code 1, sobald eine Grenze verletzt ist.

## 5. Testfälle (gemessen am Bestand vom 2026-11-08)

| Figur | Fall | Straßenzeile | Themenquelle |
| :--- | :--- | :--- | :--- |
| Harry Potter | echte Straße + Vorbehalt | `Ligusterweg 4` | `Feuerblitz` |
| Ron Weasley | Gebäude, keine Straße | `Der Fuchsbau` | `Deluminator` |
| Spider-Man | Straße + Klammerzusatz | `20 Ingram Street` | `Netzschleuder` |
| Batman | erfundene Hausnummer | `Wayne Manor` | `Batarang` |
| Thanos | Schiff | `Sanctuary` | `Unendlichkeitshandschuh` |

Bestand nach den Regeln: **317 von 325** Figuren sind briefbar. Die 8 übrigen haben
keinen belegten Ort (`Unbekannt`, `Unbekannte Stadt`) und werden nicht gezogen.
58 Figuren erhalten eine leere Straßenzeile, weil ihr einziger Wert ein generierter
Platzhalter war.

## 6. Offene Datenbefunde

Diese Punkte sind **Datenqualität**, nicht Laufzeitlogik. Sie werden durch
Kuratierung der JSON gelöst, nicht durch weitere Regeln im Code:

- 63 Werte in `strasse` folgen dem Muster `<Figurenname>-Residenz <n>` und sind
  erfunden. Aktuell werden sie zur Laufzeit verworfen.
- `ort` enthält teils Postleitzahlen, die zu fiktiven Städten gehören
  (`10001 Gotham City`). Die Laufzeit prüft keine PLZ; hier ist Kuratierung nötig.
- `franchise` führt 106 verschiedene Werte, darunter Figurennamen statt Reihen.

## 7. Generalisierbarkeit

Die Trennung „Faktenbestand (JSON) / Auswahlregeln (Laufzeit)" ist nicht
projektspezifisch. Für die `llm_boilerplate` übertragbar ist das Muster:

1. Platzhalter und Scheinwerte werden gegen das eigene Vokabular erkannt, nicht
   gegen eine generische Blacklist.
2. Fallback-Leitern sind explizit und nach Datenlage sortiert, nicht nach
   Plausibilität.
3. Eine leere Zeile ist ein gültiges Ergebnis, kein Fehlerzustand.
