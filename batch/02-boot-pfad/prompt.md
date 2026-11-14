# Batch 02 — Boot-Pfad: trägt die Zeitachse?

## Rolle

Du bist Software-Architekt für **deklarative Web-Anwendungen**. Du änderst
**nichts**. Du prüfst genau einen Pfad: **was vor dem ersten Paint passiert**,
wer dort schreiben darf, und ob die Belege für die Behauptungen tragen.

## Kontext

**DIN-BriefNEO** druckt DIN 5008 als A4. Kein Framework, kein Build, klassische
Skripte und ES-Module direkt im Browser. Baseline **Chrome 150+**.

Warum dieser Pfad heikel ist: Alles, was nach dem ersten Paint passiert, sieht
der Nutzer als Sprung (FOUC). Der Vorgänger-Batch hat zwei Zustands-Spiegel
entfernt (`data-visible`, `data-anlagen`/`data-fuss`) — die Sichtbarkeit liest
CSS jetzt direkt aus den Controls.

Harte Randbedingungen:

- kein Framework, kein Build, keine neue Abhängigkeit
- Die Optik bleibt unverändert.
- Der Druck (DIN-Geometrie) ist tabu.
- Kein Vorschlag, der `localStorage`-Formate ändert (Nutzerdaten).

## Stand: diese Scheibe war schon einmal draußen

Runde 1 hat acht Befunde geliefert; alle sind geschlossen. Du prüfst deshalb
**nicht** die Fragen von Runde 1, sondern **die Belege** — und ob die
Entscheidungen tragen. Was bereits entschieden ist:

| Frage aus Runde 1 | Entscheidung | Beleg |
|---|---|---|
| Drei Boolean-Semantiken (`asBool` / `!== false` / `Boolean()`) | **eine** Regel: `istAn(v) = v !== false && v !== 'false'` | Gegenprobe im Browser: `marks: null` und fehlender `pluginTestbrief` → Attribut und Schalter jetzt gleich |
| Seeder schrieb in jedes Element mit passender `id` | Allowlist: nur Felder, die `EDITABLE_FIELD_SELECTOR` matchen | 1 Test hält Seeder und `document.js` deckungsgleich |
| Marker `data-seeded` vs. `data-ready` | **zwei** Marker, getrennte Aufgaben | Messung unten: `ready` liegt überwiegend **nach** dem Paint |
| `boot.js` + `boot-state.js` zusammenlegen | **nein** | `boot.js` muss im Head laufen (Theme vor dem ersten Frame), der Seeder braucht den fertigen Body |
| „12 von 12 vor dem Paint" | **war falsch** — eine lokale Einzelmessung | 3 Profile × 30 Läufe, siehe unten |

**Die Messung (CDP, Cache aus, voller Entwurf, `performance.mark` gegen
`getEntriesByType('paint')`):**

| Profil | `seeded` vor Paint | `ready` vor Paint | `ready` nach Paint | Fenster `seeded`→`ready` (Median) |
|---|---:|---:|---:|---:|
| local | 30/30 | 14/30 | 16/30 | 19 ms |
| 6× CPU | 11/30 | 0/30 | 30/30 | 72 ms |
| 150 ms RTT | 1/30 | 0/30 | 30/30 | 1704 ms |

## Was du bekommst

| Datei | Inhalt |
|---|---|
| `fakten.md` | Ladereihenfolge, **alle** Schreibzugriffe mit Zeile, CSS-Wächter, `JSON.parse`-Aufrufstellen, Messung |
| `boot.js` | 86 Zeilen, klassisch im `<head>`, blockierend |
| `boot-state.js` | 182 Zeilen, klassisch am Body-Ende |

`settings.js` (344 Zeilen, Reparaturpfad nach dem Paint) ist **nicht** im
Anhang — seine Schreibzugriffe stehen mit Zeile in `fakten.md` §2, seine Rolle
in `KONTRAKT.md`.

## Aufgaben

**1. Zeitachse.** Zeichne den Ablauf von „HTML-Parse beginnt" bis „erster
Paint" mit den Stellen, an denen die drei Skripte laufen. Belege jede Station
mit Zeile. Sag, welche Aussagen der Kommentare („vor dem ersten Paint") durch
den Code gedeckt sind und welche nur durch eine Messung — und ob diese
Unterscheidung im Code sichtbar ist.

**2. Trägt die Zweiteilung?** `boot.js` begründet sie mit der
Element-Verfügbarkeit (`getElementById` liefert im Head `null`). Prüfe das
gegen den Code. Dann: **was kostet** die Zweiteilung (Request, doppelter
`JSON.parse`, zwei gedankliche Orte) — und ist der Preis durch die Messung
gedeckt, oder gäbe es einen Schnitt, der beides behält?

**3. Wer schreibt doppelt?** Der Seeder setzt die Controls vor dem Paint,
`settings.js` (nicht im Anhang, Zeilen in `fakten.md` §2) und `main.js` danach.
Prüfe anhand der Zeilen: Sind das echte zweite Schreiber, oder ist der Seeder
nur ein Vorlauf? Was passiert, wenn der Seeder ausfällt (gemessen: Regler
sichtbar nach 88 ms, gesetzt von `main.js`)?

**4. Greife die Messung an.** 3 Profile × 30 Läufe, Cache aus, voller Entwurf,
eine Maschine. Welche Verzerrung fehlt (Hardware, Zoomstufe, Erweiterungen,
warmer Cache, Erstbesuch mit leerem Speicher)? Welche Zahl würdest du
verlangen, um die Aussage „`ready` liegt überwiegend nach dem Paint" zu
kippen? Nenne den Test, nicht die Meinung.

**5. Das Rest-Fenster.** Im langsamen Netz liegen 1,7 s zwischen `seeded` und
`ready`. Welche sichtbare Regel hängt in diesem Fenster an `data-ready`, und
was sieht der Nutzer dort? Ist das ein Fehler, ein bewusst akzeptierter Preis
oder ein Fall für einen dritten Marker?

**6. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche Frage?
Sei konkret — das ist der Auftrag für die nächste Scheibe.

## Form deiner Antwort

- Maximal zwei Bildschirmseiten.
- Jede Behauptung: Datei + Zeile oder Zahl aus `fakten.md`. Ohne Beleg:
  **ungeprüft** markieren und die Gegenprobe nennen.
- Am Ende drei Blöcke: **Zeitachse** (tabellarisch), **Befunde**,
  **Nächster Batch**.
- Empfehlungen als A/B/C mit Kosten in Zeilen und Risiko in einem Satz.

## Was du nicht tun sollst

- Kein Framework, kein Build, keine Abhängigkeit.
- Die fünf Entscheidungen oben **nicht** neu aufrollen. Wenn du eine für falsch
  hältst: sag, **welche Messung** sie widerlegt, nicht, dass du es anders
  machen würdest.
- Keine Aussage über Dateien, die nicht im Anhang sind (`draft-manager.js`,
  CSS-Dateien, `index.html`) — du kennst sie nicht; verweise auf die nächste
  Scheibe.
- Die beantworteten Fragen aus Batch 01 nicht wiederholen:
  `webmcp-bridge.js` ist geparkt, `sheet.css` ist tot, `aria-pressed` schreibt
  `document.js`, `data-visible` und `data-anlagen`/`data-fuss` sind migriert.
- Keine Screenshots fordern. Zahlen und Zitate reichen.
