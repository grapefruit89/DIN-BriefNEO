---
id: testbrief-generator
title: 'Testbrief-Generator — Adressleiter, Ankerleiter und Satzbausteine'
type: guide
status: active
created: '2026-10-26'
updated: '2026-10-26'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/guide
doc_links:
  - ADR-JS
  - glossary
code_links:
  - website/addons/testbrief.js
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
> in `website/data/charaktere_konsolidiert.json` einen Empfängerblock und einen
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

## 3. Ankerleiter für den Text

Ein „Anker" ist der belegte Anknüpfungspunkt, aus dem Betreff und Text gebaut werden.

| Priorität | Feld | Bedingung |
| :--- | :--- | :--- |
| 1 | `alias` | kein Platzhalter, keine bloße Wiederholung des eigenen Namens |
| 2 | `firma` | nur wenn der Wert **eine** Organisation benennt |
| 3 | `hooks` | freie Wahl aus den vorhandenen Stichwörtern |
| 4 | `franchise` | letzter belegter Wert; immer vorhanden |

### 3.1 Warum `firma` gefiltert wird

`firma` enthält bei den Comic-Figuren häufig einen Berufs-Blob statt eines
Arbeitgebers:

```
"Musician, adventurer, author; formerly talk show host"
"Haus Stark (Geburtshaus), Faceless Men (zeitweilig)"
```

Solche Werte werden verworfen, sobald sie `;`, `/` oder `formerly`/`ehemalig`
enthalten oder länger als 60 Zeichen sind. Von 273 gefüllten Werten bleiben
235 für die Firmenzeile nutzbar; Klammerzusätze wie `(freelance)` entfallen.

### 3.2 Warum `alias` vor `hooks` steht

Gemessen am Bestand: `alias` ist bei 304 von 325 Figuren gefüllt, `hooks` nur bei 31.
Eine Textlogik, die auf `hooks` aufbaut, trägt 9 % der Datenbank. Die Reihenfolge
folgt der Datenlage, nicht der Erwartung.

Ein Alias, der nur den eigenen Namen wiederholt (`Ron` für *Ron Weasley*,
`Bruce Wayne` für *Batman*), ist kein Thema und wird übersprungen.

## 4. Betreff und Text

Der Betreff setzt das Thema als Nachtrag hinter einen Doppelpunkt:

```
Dringende Mitteilung: Der Auserwählte
Fristsetzung und Aufforderung zur Stellungnahme: Aurorenbüro, Zaubereiministerium
```

Grund: Das Thema ist ein Substantiv ohne bekannten Kasus. Formulierungen wie
„bezüglich Netz" oder „hinsichtlich Wayne Enterprises" wären grammatisch falsch;
nach einem Doppelpunkt ist der Kasus gleichgültig.

Der Text verwendet ausschließlich:

- den bürgerlichen Namen der Figur,
- den Anker aus §3,
- den belegten Ort (oder eine neutrale Deixis wie „hier"),
- die gewürfelten Drittfiguren mit Namen und Anker.

Frei erfunden ist allein die **Handlung** des Briefes (Kündigung, Auskunftsersuchen,
Lagebericht). Sie ist Fiktion des Testbriefs und behauptet nichts über die Figur.

## 5. Testfälle (gemessen am Bestand vom 2026-10-26)

| Figur | Fall | Straßenzeile | Themenquelle |
| :--- | :--- | :--- | :--- |
| Harry Potter | echte Straße + Vorbehalt | `Ligusterweg 4` | `alias` |
| Ron Weasley | Gebäude, keine Straße | `Der Fuchsbau` | `firma` (Alias „Ron" trivial) |
| Spider-Man | Straße + Klammerzusatz | `20 Ingram Street` | `alias` |
| Batman | erfundene Hausnummer | `Wayne Manor` | `alias` |
| Thanos | Schiff | `Sanctuary` | `alias` |

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
