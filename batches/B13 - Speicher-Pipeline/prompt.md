# Review-Auftrag B13 — Speicher-Pipeline und Event-Bus

## Rolle

Senior Frontend-Architekt für Vanilla-JS ohne Framework, ohne Build. Du änderst
**nichts**, du analysierst und schlägst vor. Leitfrage: *Kann ein Nutzer Daten
verlieren oder einen falschen Speicherstatus sehen — und merkt es jemand?*

## Kontext

**DIN-BriefNEO** ist ein Brief-Editor, der DIN 5008 als A4 druckt. Kein
Framework, kein Build, ES-Module direkt im Browser. Baseline **Chrome 150+**.

Auslieferung öffentlich über GitHub Pages, CSP `script-src 'self'; style-src 'self'`.
Debug-Betrieb lokal auf `http://127.0.0.1:8088`.

Harte Regeln (Auszug, gelten):
- **A37:** kein Service Worker.
- **A49:** kein JS-Textfitting / DOM-Layout-Polling.
- **A61:** kein schreibender `innerHTML`-Zugriff (DOMParser + `replaceChildren`).
- **A48/TM1:** keine Legacy-Datums-API. **A50:** Temporal nur mit expliziter Zone.
- **Keine Abwärtskompatibilität:** Entwürfe sind versionslos, Exporte versioniert
  und werden bei fremdem Schema abgelehnt (nicht migriert).

## Dateien dieses Batches

| Datei | Warum dabei |
|---|---|
| `persistence.js` | die einzige Rohschreibstelle (`localStorage.setItem`), `save`/`saveJSON`/`remove`, Import/Export, Schema |
| `draft-manager.js` | Debounce, `flushPendingSave`, Undo/Redo-Stack (RAM), Restore, Multi-Tab, Save-Status |
| `binary-storage.js` | IndexedDB für Signatur und Schriftdatei (open/read/write/delete, blockiert, versionchange) |
| `signature.js` | Signaturbild laden/speichern, Platzierung, offener FOUC-Punkt |
| `font-feature.js` | Schriftdatei, `--active-font-family`, bewusst akzeptierter Systemschrift-FOUC |
| `main.js` | Boot-Kette, Save-Trigger, Lifecycle |
| `core.js` | Event-Bus (60 von 275 Zeilen), `Constants`, Toast |
| `index.html` | die Speicher-relevanten Controls und Dialoge |
| `speicher-inventur.txt` | **Fundstellen und Messwerte**: Schreibpfade, Fehlerfälle, Bus-Experiment |

## Der Befund in einem Satz

Es gibt genau **eine** Rohschreibstelle und einen getesteten Quota-Pfad — aber
drei Dinge sind ungeklärt: der **Undo-Stack lebt nur im RAM**, der
**Save-Status** kann „gespeichert" sagen, während der Speicher den alten Stand
hält (bekannter Fall aus B4), und die **Signatur** erscheint nach dem ersten
Paint auf dem Blatt (offener FOUC aus B11).

Gemessen 2026-11-13 am Event-Bus:

```
subscriber A wirft  ->  subscriber B laeuft trotzdem, publish wirft nicht
publish('falsches:topic')  ->  synchroner TypeError, bricht den Aufrufer ab
```

Der Bus ist also gegen werfende Handler isoliert, aber **nicht** gegen
Topic-Tippfehler — mitten im Boot- oder Save-Pfad.

## Deine Aufgaben

1. **Schreibpfad-Matrix.** Für jeden Pfad (Tippen → Debounce, `flushPendingSave`,
   Undo/Redo, Reset, Import, Multi-Tab, Signatur, Schrift): Was wird wann
   geschrieben, was passiert bei Fehler in der Mitte, wer erfährt davon?
   Beleg mit Datei + wörtlichem Zitat.
2. **Reihenfolge und Wettläufe.** Kann ein neuerer Stand von einem älteren
   überschrieben werden (Debounce vs. Flush vs. Multi-Tab vs. Undo)?
   Nenne konkrete Abläufe, keine Möglichkeiten.
3. **Save-Status-Wahrheit.** Wo kann „gespeichert" stehen, obwohl der Speicher
   etwas anderes hält? Welche Prüfung fehlt (Rücklesen, Vergleich)?
4. **IndexedDB-Fehlerfälle.** Privater Modus, blockierte DB (anderer Tab),
   gelöschte DB, Quota, `onversionchange`. Was sieht der Nutzer, was bleibt
   still? Was passiert mit einer bereits geladenen Signatur/Schrift?
5. **Import/Export.** Was wird geprüft, bevor geschrieben wird? Kann ein
   Teilimport halbe Daten hinterlassen? Gibt es ein Größenlimit, und was
   passiert beim Überschreiten?
6. **Undo über Reload.** Bewusst flüchtig oder Lücke? Wenn haltbar: kleinster
   Weg (z. B. ein Ring im localStorage) und was er kostet (Größe, Quota,
   Multi-Tab). Empfehlung mit Begründung.
7. **Event-Bus.** Topic-Tippfehler (`TypeError`), Fehler-Isolation,
   Doppel-Subscribe, Publish während Publish, Listener-Leichen bei
   Neu-Instanziierung (Tests, Reset, Theme-Wechsel). Was fehlt: Inventar?
   `AbortSignal`-Disziplin? Ein `publish`-Wrapper mit Log?
8. **Signatur/Schrift.** Ladezeitpunkt, reservierter Platz, Löschen/Ersetzen,
   Verhalten ohne IndexedDB. Den offenen FOUC aus `speicher-inventur.txt` (E)
   bewerten: lösen oder bewusst akzeptieren — mit Begründung.
9. **Beweisverfahren.** Wie weist man „kein Datenverlust" nach, ohne
   Screenshots? Crash mitten im Schreiben, Tab-Kill, Quota, Multi-Tab.

## Form deiner Antwort

- Kurz. Keine Zusammenfassung der Dateien — ich kenne sie.
- Jede Behauptung mit Beleg: Datei + wörtliches Zitat oder Messwert aus
  `speicher-inventur.txt`. Ohne Beleg: als **ungeprüft** markieren.
- Am Ende drei Blöcke:
  1. **Matrix** (Pfad × schreibt × Fehlerfall × sichtbar/still),
  2. **Zielbild** (A/B/C mit Begründung, was ausdrücklich so bleiben soll),
  3. **Schritte** (nummeriert, je mit Gegenprobe).

## Was du NICHT tun sollst

- Kein Framework, kein Build, keine npm-Abhängigkeit vorschlagen.
- Kein Service Worker (`A37`), kein `text-fit` (`P39`).
- Kein Backend, kein Sync-Server, keine Verschlüsselung vorschlagen —
  die App läuft rein im Browser.
- Keine Screenshots als Beweis fordern; Zahlen, Zitate und Abläufe reichen.
- `website/css/sheet.css` ist **nicht eingebunden** (kein `<link>`, kein
  `@import`) — als Befund melden, nicht als Quelle behandeln.
- Nichts „nebenbei" refactorn: der Auftrag ist Prüfung, nicht Umbau.
