# Review-Auftrag B4 — Speichern/Undo

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
- `website/js/persistence.js`  (849 Zeilen)
- `website/js/draft-manager.js`  (492 Zeilen)
- `website/js/binary-storage.js`  (129 Zeilen)

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

## Harte Regeln
- Jeder Befund braucht eine Fundstelle: `datei:ZEILE`. Ohne Zeile kein Befund.
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

| # | Typ | Datei:Zeile | Befund (1 Satz) | Warum es zählt | Kleinste Behebung | Aufwand S/M/L | Risiko |

Danach:
1. **TOP 3** — die drei, die du zuerst beheben würdest, je 2 Sätze.
2. **JS-BUDGET** — konkrete Zahlen aus dem Batch: Zeilen JS, Event-Listener,
   Funktionen mit genau einem Aufrufer, Closures pro Modul. Wo ließe sich JS
   durch CSS/HTML ersetzen, und wie viele Zeilen wären das?
3. **OFFENE FRAGEN** — max 3, nur wenn die Antwort den Befund ändert.

## Zusatzfrage für diesen Batch
Ist der Speicherpfad ein Single-Writer? Kann Zustand verloren gehen (Debounce, Tab-Wechsel, Quota, Undo/Redo)?
