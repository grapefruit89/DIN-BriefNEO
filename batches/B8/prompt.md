# Review-Auftrag B8 — Adressdaten

## Rolle
Senior Reviewer für Vanilla-JavaScript/CSS ohne Framework. Du änderst **nichts**,
du berichtest. Deine Aufgabe ist, Schwächen zu finden, bevor sie teuer werden.

## Kontext
- Projekt: **DIN-BriefNEO** — Brief-Editor, der DIN 5008:2020 als A4-PDF druckt.
- Kein Framework, kein Build, ES-Module direkt im Browser.
- **Druck ist das Produkt**, der Bildschirm ist Vorschau. Die Geometrie-SSoT ist
  `docs/10-architecture/IMR-Registry.md` (liegt diesem Batch **nicht** bei).
- Tests: 278, headless gegen `test/index.html`. Gates: `build_db`, `biome`,
  `reconciliation` (49 Antipattern-Regeln), `repo-map-check`.
- Historie: contenteditable → `<input>` für fünf Anschriftfelder (2026-11-12).

## Dateien dieses Batches
- `website/js/address-data.js`  (918 Zeilen)
- `website/js/font-feature.js`  (283 Zeilen)

## Zuerst lesen: KONTRAKT.md

`KONTRAKT.md` steht oben in diesem Dokument, vor dem Code. Es nennt für jedes
Modul **außerhalb** dieses Batches die genutzten Symbole und umgekehrt die
Module, die diesen Batch benutzen — erzeugt aus dem echten Importgraph, nicht
geschätzt. Beurteile, ob der Batch seine Verträge richtig benutzt. Beurteile
**nicht**, wie die fremden Module intern aussehen: ihr Code ist absichtlich
nicht dabei, und „die Datei ist nicht da" ist kein Befund.

## Stand der Technik (wichtig für dein Urteil)

Das Projekt liegt bewusst auf Bleeding Edge: **Baseline Chrome 150+**, kein
Framework, kein Build. Diese Features sind vorhanden und **Absicht** — melde
sie nicht als "modern/ungewöhnlich":

- **CSS:** `@function` (eigene CSS-Funktionen, `--mm-y()`/`--mm-x()`),
  `attr(… type(<number>))` (Geometrie kommt aus HTML-Attributen), `:has()`,
  `:is()/:where()`, `@scope`, `@starting-style`, Anchor Positioning,
  `field-sizing`, `interpolate-size`, View Transitions.
- **HTML:** `popover` + `popovertargetaction`, `command`/`commandfor`
  (Invoker Commands), `closedby`, `<dialog>`, `<input switch>`.
- **JS:** `Temporal`, `AbortSignal.any()`/`AbortSignal.timeout()`,
  `Promise.withResolvers()`, `document.ariaNotify()`, `requestIdleCallback`.

Konsequenz: Prüfe **nicht**, ob diese Wege tragbar sind — sie sind es. Prüfe,
ob sie **konsequent** genutzt werden, und wo stattdessen noch von Hand
nachgebaut wird.

## Prüfauftrag, in dieser Reihenfolge
1. **KORREKTHEIT** — Logiklücken, Randfälle, stille Datenverluste, Zustandsfehler,
   doppelte Wahrheiten, Reihenfolge-/Race-Probleme.
2. **STRUKTUR** — Kopplung, Verantwortlichkeiten, Zyklen, versteckte Abhängigkeiten.
3. **KISS/YAGNI** — wo wird Aufwand für Nutzen gebaut, den niemand braucht?
4. **JAVASCRIPT-REDUKTION** — was könnte nativ (HTML/CSS/ARIA/Formular) statt JS?
   Nenne pro Befund die gesparten Zeilen.
5. **DUPLIKATE** — gleiche Logik an mehreren Stellen, kopierte Konstanten.
6. **FEHLERBEHANDLUNG** — fehlendes Element, leerer Wert, abgebrochener Fetch,
   doppeltes Event.

## Overengineering-Scan (eigener Abschnitt im Output)

Suche Stellen, an denen 120 % gegeben werden, wo 100 % reichen — und zwar
besonders dort, wo die Zusatzarbeit in **JavaScript** landet, obwohl HTML oder
CSS sie trägt. Konkrete Suchfragen:

- Wird ein Zustand doppelt geführt (Attribut **und** Variable, Klasse **und**
  `data-*`, zwei Enums für denselben Sachverhalt)?
- Wird etwas in JS nachgebaut, was ein natives Attribut/Element schon tut
  (`maxlength`, `required`, `pattern`, `popover`, `<dialog>`, `:has()`,
  `<label for>`, `<input type=…>`)?
- Gibt es Helfer, Fallbacks oder Abstraktionen für **einen** Aufrufer?
- Gibt es Konfigurierbarkeit ohne Konfiguration, Optionen ohne Aufrufer?
- Gibt es Fallbacks für Fälle, die im Zielbrowser (Chrome 150+) nicht eintreten?
- Gibt es Kommentare, die eine Entscheidung erklären, die niemand mehr braucht?

Für jeden Fund: **was fällt weg** (Zeilen), **was bleibt** (Verhalten),
**Preis** (Risiko oder Verlust). Kein "könnte man", nur "kann weg, weil …".
Was du **nicht** als Overengineering siehst, obwohl es so aussieht: ein Satz
Begründung genügt — das ist genauso wertvoll.

**Wo die Brechstange in diesem Batch ansetzt:** `address-data.js` hält
Adressdaten als Code; prüfe, was zur Laufzeit geparst wird, obwohl es
vorgerechnet sein könnte. Bei `font-feature.js`: braucht es die Injection über
`<style>`, oder reicht `@font-face` + `document.fonts`?

## Harte Regeln
- Jeder Befund braucht eine Fundstelle: `datei` **plus wörtliche Zeile** aus dem
  Code, kopiert und nicht gezählt. Dieses Dokument hat keine Zeilennummern —
  die Nummer wird beim Triage nachgesetzt, deine Kopie ist der Beleg.
- Keine Behauptung über Code, den du nicht siehst. Fehlt eine Datei, schreibe
  „fehlt: <datei>" und prüfe den Punkt nicht.
- Keine Rewrites, keine Frameworks, kein „man könnte mal". Vorschlag = kleinste
  Änderung, die den Befund behebt.
- Kein Stil-Nitpicking (Formatierung, Benennung), außer es verursacht Fehler.
- Maximal 12 Befunde. Lieber 5 harte als 12 weiche.
- Unterscheide **BUG** (falsches Verhalten) von **RISIKO** (kann brechen) von
  **SMELL** (teuer, aber korrekt).

## Output
Tabelle:

| # | Typ | Datei + Zitat | Befund (1 Satz) | Warum es zählt | Kleinste Behebung | Aufwand S/M/L | Risiko |

Danach:
1. **TOP 3** — die drei, die du zuerst beheben würdest, je 2 Sätze.
2. **JS-BUDGET** — die Zahlen stehen im Kopf dieses Dokuments unter
   „Messwerte". Zähle sie **nicht** selbst nach, das geht im Fließtext schief;
   interpretiere sie: wo ist Aufwand ohne Nutzen, wo ließe sich JS durch
   CSS/HTML ersetzen, und wie viele Zeilen wären das? Fehlt eine Zahl, schreibe
   „fehlt: <Zahl>" statt zu schätzen.
3. **OFFENE FRAGEN** — max 3, nur wenn die Antwort den Befund ändert.
4. **OVERENGINEERING** — je Fund: was wegfällt (Zeilen), was bleibt,
   Preis. Dazu ein kurzer Abschnitt "was ausdrücklich bleibt und warum".

## Zusatzfrage für diesen Batch
Sind die Adressdaten als Daten oder als Code abgelegt, und was kostet das beim Laden?
