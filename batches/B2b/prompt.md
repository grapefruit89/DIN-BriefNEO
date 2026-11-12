# Review-Auftrag B2b — Orchestrierung & Lebenszyklus

Folgeauftrag zu B2. B2 hatte drei Schwächen, die hier behoben sind: `main.js`
fehlte, das Dokument hat keine Zeilennummern, und die Fragen waren teils nicht
mit den gelieferten Dateien beantwortbar. Bitte prüfe **nicht** erneut, was
unten unter „Bereits geprüft" steht — diese Punkte sind am Code entschieden.

## Rolle
Senior Reviewer für Vanilla-JavaScript ohne Framework. Du änderst **nichts**,
du berichtest. Deine Aufgabe ist, Schwächen zu finden, bevor sie teuer werden.

## Kontext
- Projekt: **DIN-BriefNEO** — Brief-Editor, der DIN 5008:2020 als A4-PDF druckt.
- Kein Framework, kein Build, ES-Module direkt im Browser.
- **Druck ist das Produkt**, der Bildschirm ist Vorschau. Die Geometrie-SSoT ist
  `docs/10-architecture/IMR-Registry.md` (liegt nicht bei, wird aber von
  `tools/imr.js` maschinell gegen das HTML geprüft).
- Browser-Baseline des Projekts: **Chrome 150+**.
- Tests: 278, headless. Gates: `build_db`, `biome`, `reconciliation`,
  `repo-map-check`, `imr`.

## Dateien dieses Batches
- `website/index.html`  (427 Zeilen) — DOM-Vertrag, lädt zwei Skripte
- `website/js/main.js`  (304 Zeilen) — Orchestrator, 21 Boot-Schritte
- `website/js/boot.js`  (69 Zeilen) — klassisches Skript im `<head>`, blockierend
- `website/js/core.js`  (267 Zeilen) — EventBus, Toast, Popover
- `website/js/field.js`  (32 Zeilen) — Feld-Abstraktion

## Zuerst lesen: KONTRAKT.md

`KONTRAKT.md` steht oben in diesem Dokument, vor dem Code. Es nennt für jedes
Modul **außerhalb** dieses Batches die genutzten Symbole und umgekehrt die
Module, die diesen Batch benutzen — erzeugt aus dem echten Importgraph, nicht
geschätzt. Beurteile, ob der Batch seine Verträge richtig benutzt. Beurteile
**nicht**, wie die fremden Module intern aussehen: ihr Code ist absichtlich
nicht dabei, und „die Datei ist nicht da" ist kein Befund.

## Bereits geprüft — nicht wiederholen
Alles unten ist am Code entschieden (Commit-Stand siehe Kopf der Merge-Datei).

| Behauptung | Befund |
|---|---|
| „localStorage-Fehler landet im äußeren Catch und überspringt den Boot" | **Falsch.** `boot.js` hat einen eigenen inneren `try` um `getItem` *und* `JSON.parse`; Defaults greifen. |
| „2-Sekunden-Fallback liegt im äußeren `try`" | **Richtig, aber praktisch unerreichbar**: vor Zeile 62 kann nur `document.documentElement` oder `setProperty` werfen. Der Fallback gibt außerdem nur Platzhalter frei — er ist **kein** Nachweis eines erfolgreichen Starts. |
| „`initToastSystem()` kann mehrfach laufen" | **Behoben.** Ein Aufrufer, kein Retry; zusätzlich Guard `toastInitialisiert` als Vorsorge für einen späteren Re-Init. |
| „Labels simulieren Buttons per `role`/`tabindex`" | **Richtig**, aber an zwei anderen Stellen als zitiert (`index.html`: die zwei `role="button"`-Labels; das zitierte Segment-Control nutzt native Radios). **Entschieden: bleiben** — ein `<button>` müsste die Checkbox per JS klicken. |
| „`field.js` nur behalten, wenn mehrere Verbraucher" | **8 Verbraucher** (address, clipboard-parser, document, draft-manager, multipage-controller, persistence, salutation, testbrief). |
| „HTML-Marker möglicherweise unbenutzt" | **Erledigt.** Von 35 `data-*`-Attributen las der Code 31; die vier ungelesenen (`data-visier-top/w/h`, `data-richtung`) sind gelöscht. Repo-weit geprüft: 0 Lesestellen. |
| „Popover-Helfer fangen parallele Popover ab" | **Widerlegt per Messung** (2026-11-12, Chromium): doppeltes `show`/`hide` wirft nichts, Light Dismiss schließt den ersten still. Sie fangen `InvalidStateError` (Element nicht im DOM) und `NotSupportedError` (kein `popover`-Attribut) — beides Markup-Fehler. Entschieden: bleiben. |
| „Geometrie doppelt in HTML und Registry?" | **Gegatet**: `tools/imr.js` vergleicht `data-*`-Geometrie in `index.html` mit dem IMR-Inventar; Abweichung = Gate rot. |

## Die offenen Fragen (das ist der Auftrag)

**F1 — Ist die Critical-Auswahl richtig?** Von 21 Boot-Schritten sind jetzt
drei `critical: true`: DOM-Grundgerüst, „Entwurf laden", „Globale Listener";
zusätzlich laufen die drei Konstruktoren (DraftManager, UIProtections,
SettingsManager) durch `kritischerWert()`, das bei Fehler sichtbar abbricht.
Begründung: ein Fehlschlag bei „Entwurf laden" verbirgt den gespeicherten
Entwurf, und der nächste Tastendruck überschreibt ihn; ein Fehlschlag bei
„Globale Listener" lässt die App ohne Speichern weiterlaufen.

Prüfe die Auswahl, nicht die Mechanik: fehlt ein Schritt, ist einer zu viel,
und ist der Preis für „Entwurf laden" (roter Balken plus halb initialisierte
Seite) verhältnismäßig? Nenne pro Kandidat den Schaden, nicht die Kategorie.

**F2 — Reihenfolge.** Welche Schritte setzen voraus, dass ein früherer
erfolgreich war? Wo hängt ein späterer Schritt an einem *nicht*-kritischen
Vorläufer, sodass ein Fehler erst viel später sichtbar wird?

**F3 — Idempotenz.** Was überlebt einen zweiten `initApp()`-Lauf: Listener,
EventBus-Abos, Modulzustand (`dom`, `timer`, `current`, Caches)? Wenn jemand
später „Einstellungen neu anwenden" als Re-Init implementiert — was bricht?
Prüfe das als Szenario, nicht als Bug.

**F4 — `data-ready` hat zwei Schreiber.** `boot.js` setzt es nach 2 s, `main.js`
im letzten Boot-Schritt. Ist das eine doppelte Wahrheit, und was passiert, wenn
`initApp` kurz vor Ablauf der 2 s fertig wird? Wer darf es später lesen (CSS,
Tests), und was sähe ein solcher Leser in beiden Fällen?

**F5 — `boot.js` als klassisches Skript.** Der Kommentar begründet es mit FOUC
(gemessener FCP 96 ms). Gibt es heute (Chrome 150+) einen Weg, denselben Effekt
ohne zweites, blockierendes Skript zu erreichen — oder ist das die richtige
Lösung? Nur antworten, wenn du den FOUC-Mechanismus im HTML/CSS wirklich
siehst; sonst „nicht beurteilbar".

## Harte Regeln
- Jeder Befund braucht eine Fundstelle: `datei` **plus wörtliche Zeile** aus dem
  Code, kopiert und nicht gezählt. Dieses Dokument hat keine Zeilennummern —
  die Nummer wird beim Triage nachgesetzt, deine Kopie ist der Beleg.
- Keine Behauptung über Code, den du nicht siehst. Fehlt eine Datei, schreibe
  „fehlt: <datei>" und prüfe den Punkt nicht.
- Keine Rewrites, keine Frameworks, kein „man könnte mal". Vorschlag = kleinste
  Änderung, die den Befund behebt.
- Kein Stil-Nitpicking, außer es verursacht Fehler.
- Maximal 10 Befunde. Lieber 4 harte als 10 weiche.
- Unterscheide **BUG** (falsches Verhalten) von **RISIKO** (kann brechen) von
  **SMELL** (teuer, aber korrekt). Ein Befund ohne heutigen Auslöser ist
  SMELL, nicht BUG — sag das dann auch so.
- Wenn eine der Fragen F1–F5 mit den Dateien **nicht** beantwortbar ist, ist
  „nicht beantwortbar, weil <Grund>" die richtige Antwort. Rate nicht.

## Output
Tabelle:

| # | Typ | Datei + Zitat | Befund (1 Satz) | Warum es zählt | Kleinste Behebung | Aufwand S/M/L | Risiko |

Danach:
1. **F1–F5** — je eine Zeile Antwort, auch wenn die Antwort „nicht
   beantwortbar" lautet.
2. **TOP 3** — die drei, die du zuerst beheben würdest, je 2 Sätze.
3. **JS-BUDGET** — Zahlen stehen im Kopf der Merge-Datei unter „Messwerte".
   Zähle sie **nicht** selbst nach; interpretiere sie.
4. **OFFENE FRAGEN** — max 3, nur wenn die Antwort einen Befund ändert.
