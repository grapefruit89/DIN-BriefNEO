# Review-Auftrag B2 — HTML + Boot

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
- `website/index.html`  (426 Zeilen) — DOM-Vertrag, lädt zwei Skripte
- `website/js/main.js`  (333 Zeilen) — der Modul-Einstieg, 21 Boot-Schritte
- `website/js/core.js`  (274 Zeilen) — EventBus, Toast, Popover
- `website/js/boot.js`  (75 Zeilen) — klassisches Skript im `<head>`, blockierend
- `website/js/field.js`  (32 Zeilen) — Naht input ↔ contenteditable
- `website/llms.txt`  (76 Zeilen) — Feldvertrag (Beilage, kein Code)
- `website/css/sheet-common.css`  (454 Zeilen) — **Beilage**: die Regeln, die
  `data-ready` und die Platzhalter steuern (`:root:not([data-ready="true"])`).
  Ohne sie ist F5 nicht beurteilbar.

## Beilage (nicht reviewen)

`website/css/sheet-common.css` ist nur für F5 dabei: dort stehen die
Platzhalterregeln (`:root:not([data-ready="true"]) …`) und der
`:placeholder-shown`-Reset. Bewerte dieses Stylesheet nicht als Ganzes — es
gehört zu B1. Lies es nur, um den FOUC-Mechanismus zu verstehen.

## Zuerst lesen: KONTRAKT.md

`KONTRAKT.md` steht oben in diesem Dokument, vor dem Code. Es nennt für jedes
Modul **außerhalb** dieses Batches die genutzten Symbole und umgekehrt die
Module, die diesen Batch benutzen — erzeugt aus dem echten Importgraph, nicht
geschätzt. Beurteile, ob der Batch seine Verträge richtig benutzt. Beurteile
**nicht**, wie die fremden Module intern aussehen: ihr Code ist absichtlich
nicht dabei, und „die Datei ist nicht da" ist kein Befund.

## Was die erste Runde ergeben hat — nicht wiederholen

Runde 1 (gleiche Dateien, ohne `main.js`) hat fünf Befunde gemeldet. Jeder ist
inzwischen am Code geprüft; das hier ist der Stand:

| Behauptung aus Runde 1 | Stand |
|---|---|
| localStorage-Fehler springt in den äußeren `try` und bricht den Boot ab | **widerlegt** — `boot.js` hat einen inneren `try` um `getItem` *und* `JSON.parse`; Defaults greifen |
| Der 2-s-Fallback liegt im äußeren `try` und fällt bei Fehler aus | **bestätigt, entschieden**: bleibt. Der Kommentar sagt jetzt, dass er nur Platzhalter freigibt und kein Startbeweis ist |
| `initToastSystem()` kann doppelt initialisieren | **behoben**: Guard `toastInitialisiert` |
| Labels simulieren Buttons per `role`/`tabindex` | **bestätigt** (zwei Labels in `index.html`), **entschieden**: bleiben — ein `<button>` müsste die Checkbox per JS klicken |
| `field.js` nur behalten, wenn mehrere Verbraucher | **beantwortet**: 8 Verbraucher |
| HTML-Marker möglicherweise unbenutzt | **erledigt**: 4 ungelesene Attribute gelöscht |
| Popover-Helfer als Sicherheitsnetz | **gemessen**: doppeltes `show`/`hide` wirft nichts; sie fangen nur Markup-Fehler. **Entschieden**: bleiben |

Zur Geometrie: die `data-*`-Werte in `index.html` werden von `tools/imr.js`
gegen das IMR-Inventar geprüft. Doppelpflege ist damit Gate-Sache, kein
Review-Thema.

## Folgeauftrag — die fünf offenen Fragen

Das ist **kein neues Gesamtinventar**. Beantworte diese fünf Fragen; Befunde
nur, wenn dir beim Antworten ein echter Fehler auffällt.

**F1 — Ist die Critical-Auswahl richtig?** Von 21 Boot-Schritten sind drei
`critical: true`: DOM-Grundgerüst, „Entwurf laden", „Globale Listener".
Zusätzlich laufen die drei Konstruktoren (DraftManager, UIProtections,
SettingsManager) durch `kritischerWert()`, das bei Fehler sichtbar abbricht.
Begründung: scheitert „Entwurf laden", startet die Seite leer und der nächste
Tastendruck überschreibt den Entwurf; scheitert „Globale Listener", tippt man
in eine App, die nichts speichert.

Prüfe die Auswahl, nicht die Mechanik: fehlt ein Schritt, ist einer zu viel,
und ist der Preis für „Entwurf laden" (roter Balken, halb initialisierte
Seite) verhältnismäßig? Nenne pro Kandidat den Schaden, nicht die Kategorie.

**F2 — Reihenfolge.** Welche Schritte setzen voraus, dass ein früherer
erfolgreich war? Wo hängt ein späterer Schritt an einem *nicht*-kritischen
Vorläufer, sodass der Fehler erst viel später sichtbar wird?

**F3 — Idempotenz.** Was überlebt einen zweiten `initApp()`-Lauf: Listener,
EventBus-Abos, Modulzustand (`dom`, `timer`, `current`, `toastInitialisiert`,
Caches)? Wenn später jemand „Einstellungen neu anwenden" als Re-Init
implementiert — was bricht? Szenario, nicht Bug.

**F4 — `data-ready` hat zwei Schreiber.** `boot.js` setzt es nach 2 s,
`main.js` im letzten Boot-Schritt. Doppelte Wahrheit oder harmlos? Was sieht
ein Leser (CSS, Test), wenn `initApp` kurz vor Ablauf der 2 s fertig wird?

**F5 — `boot.js` als klassisches Skript.** Der Kommentar begründet es mit FOUC
(gemessener FCP 96 ms). Die Platzhalterregeln liegen jetzt bei
(`sheet-common.css`, Abschnitt mit `:root:not([data-ready="true"])`), damit du
den Mechanismus sehen kannst, statt ihn zu vermuten.

Gibt es bei Baseline Chrome 150+ einen Weg zum selben Effekt ohne zweites,
blockierendes Skript — oder ist das die richtige Lösung? Wenn du den
Zusammenhang zwischen `boot.js`, `data-ready` und den Platzhalterregeln nach
dem Lesen immer noch nicht siehst, antworte „nicht beurteilbar, weil <Grund>".

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

1. **F1–F5** — je eine Zeile Antwort, auch wenn sie „nicht beantwortbar" lautet
   (dann mit Grund).
2. **Befunde** — *nur* wenn dir beim Beantworten ein echter Fehler auffällt:

   | # | Typ | Datei + Zitat | Befund (1 Satz) | Warum es zählt | Kleinste Behebung | Aufwand S/M/L | Risiko |

   Eine leere Tabelle ist ein gutes Ergebnis. Kein Auffüllen mit Beobachtungen,
   die keine der fünf Fragen berühren.
3. **TOP 3** — nur wenn es Befunde gibt, je 2 Sätze.

„Nicht beantwortbar, weil <Grund>" ist eine vollwertige Antwort und besser als
eine Vermutung.
