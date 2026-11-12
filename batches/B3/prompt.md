# Review-Auftrag B3 — Adresslogik

## Rolle
Senior Reviewer für Vanilla-JavaScript/CSS ohne Framework. Du änderst **nichts**,
du berichtest. Deine Aufgabe ist, Schwächen zu finden, bevor sie teuer werden.

## Kontext
- Projekt: **DIN-BriefNEO** — Brief-Editor, der DIN 5008:2020 als A4-PDF druckt.
- Kein Framework, kein Build, ES-Module direkt im Browser.
- **Druck ist das Produkt**, der Bildschirm ist Vorschau. Die Geometrie-SSoT ist
  `docs/10-architecture/IMR-Registry.md` (nicht in diesem Batch).
- Tests: 278, headless. Gates: `build_db`, `biome`, `reconciliation`
  (49 Antipattern-Regeln), `repo-map-check`.
- Einzige externe Verbindung: `api.geoapify.com` (in der CSP als `connect-src`).
  Ohne Netz läuft alles außer den Adressvorschlägen.
- Historie: die fünf Empfängerfelder sind seit 2026-11-12 native `<input>`.

## Dateien dieses Batches
- `website/js/address.js`  (1063 Zeilen) — PLZ-/Ortsvorschläge, Spiegelung der
  Rücksendezeile, Absender-Sync
- `website/js/clipboard-parser.js`  (615 Zeilen) — Freitext aus der Zwischen-
  ablage in die Anschriftfelder verteilen
- `website/js/field.js`  (32 Zeilen) — Schreibnaht (`getValue`/`setValue`),
  winzig, aber hier relevant: über sie laufen alle stillen Überschreibungen
- `batches/B3/KONTRAKT.md`  — Verträge der Module, die **nicht** dabei sind

## Zuerst lesen: KONTRAKT.md

`KONTRAKT.md` steht oben in diesem Dokument, vor dem Code. Es nennt für jedes
Modul **außerhalb** dieses Batches die genutzten Symbole und umgekehrt die
Module, die diesen Batch benutzen — erzeugt aus dem echten Importgraph, nicht
geschätzt. Beurteile, ob der Batch seine Verträge richtig benutzt. Beurteile
**nicht**, wie die fremden Module intern aussehen: ihr Code ist absichtlich
nicht dabei, und „die Datei ist nicht da" ist kein Befund.

Besonders: `website/js/address-data.js` (Daten, Indizes) ist **Batch B8**, nicht
Teil dieses Batches. Seine Symbole (`AddressData`, `AddressIntelligence`,
`normalizeText`, …) stehen mit Signatur in `KONTRAKT.md`.

## Was wir schon wissen — nicht wiederholen

Alles unten ist am Code entschieden und getestet (2026-11-12). Melde es nicht
als Befund; prüfe höchstens, ob die Begründung trägt.

| Sache | Stand |
|---|---|
| Automatikzeile der Rücksendezeile erkennen | über das **Format** (≥ 2 Teile mit `" • "`), nicht über den Zeilenschluss. Grund: `maxlength` kürzte bei 85 Zeichen, danach passte der Schwanz nicht mehr und die Zeile galt als Nutzertext |
| Rücksendezeile `maxlength` | 120 (`index.html`); die *Anzeige* kürzt per CSS-Ellipse, der gespeicherte Wert bleibt vollständig |
| Empfängerfelder | native `<input data-atom>`, kein `contenteditable`; Zugriff ausschließlich über `Field.getValue`/`Field.setValue` |
| `field.js` | 8 Verbraucher — die Abstraktion ist gerechtfertigt |
| Vorschlags-Popover | `plz-suggestions-popover` und `anschrift-vorschlaege`, Anzeige über `showPopoverSafe` (fängt `InvalidStateError` bei nicht verbundenem Element) |
| `spiegelEntscheidung`-Zustand | `modus` + `letzterAutowert` leben im Modul, `targetLock` in `AddressIntelligence` |

## Fragen — das ist der Auftrag

Antworte auf diese fünf Fragen. Befunde nur, wenn dir beim Antworten ein
echter Fehler auffällt.

**F1 — Umfang des Vorschlagspfads.** Welche Funktionen in `address.js` dienen
ausschließlich den Vorschlägen (PLZ, Ort, Straße) — nenne sie mit Zitat und
zähle ihre Zeilen zusammen. Welcher Teil davon ist Sonderfallbehandlung, die
kein Nutzer je erreicht? Rechtfertigt der Rest seinen Umfang?

**F2 — Stille Überschreibungen.** Wo schreibt die Spiegelung über
Nutzereingaben? Ist „manuell" immer erkennbar? Grenzfall: ein Nutzer tippt
selbst etwas, das wie eine Automatikzeile aussieht (zwei Teile mit `" • "`,
z. B. eine Adresse mit Trennzeichen) — was passiert dann, und wie würde der
Nutzer es merken?

**F3 — Wer besitzt den Zustand?** `modus`, `letzterAutowert` (Modul) und
`targetLock` (`AddressIntelligence`) beschreiben alle „ist das Feld gerade
automatisch oder vom Nutzer". Kann dieser Zustand auseinanderlaufen — bei
Feldwechsel, Tab-Wechsel, Undo, Reset, Testbrief? Nenne den Pfad, nicht die
Kategorie.

**F4 — Fehlerpfade der Vorschläge.** Was passiert bei: kein Netz, abgebrochener
Fetch, Timeout, leeres Ergebnis, sehr schnellem Tippen (Race), doppeltem
Öffnen des Popovers, Offline-Wiederkehr? Wo bleibt ein Zustand hängen, der
beim nächsten Versuch stört?

**F5 — `clipboard-parser.js`.** Welche Heuristik ist belegt (Kommentar, Test,
Daten), welche ist geraten? Wo kann eingefügter Freitext falsch verteilt
werden — Hausnummer in die Straße, Zusatz in den Namen, Firmenname als Person?
Was wäre der billigste Nachweis, dass eine Verteilung falsch ist?

## Harte Regeln
- Jeder Befund braucht eine Fundstelle: `datei` **plus wörtliche Zeile** aus dem
  Code, kopiert und nicht gezählt. Dieses Dokument hat keine Zeilennummern —
  die Nummer wird beim Triage nachgesetzt, deine Kopie ist der Beleg.
- Keine Behauptung über Code, den du nicht siehst. Fehlt eine Datei, schreibe
  „fehlt: <datei>" und prüfe den Punkt nicht.
- Keine Rewrites, keine Frameworks, kein „man könnte mal". Vorschlag = kleinste
  Änderung, die den Befund behebt.
- Kein Stil-Nitpicking (Formatierung, Benennung), außer es verursacht Fehler.
- Maximal 10 Befunde. Lieber 5 harte als 10 weiche.
- Unterscheide **BUG** (falsches Verhalten) von **RISIKO** (kann brechen) von
  **SMELL** (teuer, aber korrekt). Ein Befund ohne heutigen Auslöser ist
  SMELL, nicht BUG — sag das dann auch so.

## Output

1. **F1–F5** — je eine Zeile Antwort, auch wenn sie „nicht beantwortbar"
   lautet (dann mit Grund).
2. **Befunde** — *nur* wenn dir beim Antworten ein echter Fehler auffällt:

   | # | Typ | Datei + Zitat | Befund (1 Satz) | Warum es zählt | Kleinste Behebung | Aufwand S/M/L | Risiko |

   Eine leere Tabelle ist ein gutes Ergebnis. Kein Auffüllen mit Beobachtungen,
   die keine der fünf Fragen berühren.
3. **TOP 3** — nur wenn es Befunde gibt, je 2 Sätze.

„Nicht beantwortbar, weil <Grund>" ist eine vollwertige Antwort und besser als
eine Vermutung.
