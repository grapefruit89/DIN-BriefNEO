# Batch 05 — Zustand und Restore: sind die zwei Pfade gleich?

> **STATUS: Der Review zu dieser Scheibe ist gelaufen und ausgewertet (2026-11-15).**
> Ergebnis: **F5 behoben** (Datum überlebt den Reload über `datum__dirty`),
> Vermerk-Leerzeichen im Seeder getrimmt, **F1/F6 gegenstandslos** (kein
> Element trägt `data-speichern`), **F3 nicht reproduziert**. Das Werkzeug
> `tools/seeder-diff.mjs` ist daraus entstanden. Nicht erneut verschicken.

## Rolle

Du bist JavaScript-Architekt für **Zustandsspeicherung in einer Ein-Datei-App**
(nativ, ES-Module, kein Framework, kein Build). Du änderst **nichts**. Du
prüfst eine Frage: **es gibt zwei Wege, denselben Entwurf in die Seite
zurückzuspielen — sind sie äquivalent, und was fällt zwischen ihnen durch?**

## Kontext

**DIN-BriefNEO** druckt DIN 5008 im Browser (Baseline Chrome 150+).
Gespeichert wird in `localStorage`: der Entwurf (`din_draft_current`) und die
Einstellungen (`din_settings`). Zwei Stellen wenden ihn an:

1. **`boot-state.js`** — klassisches Skript im `<body>`, läuft **vor** dem
   ersten Paint (als IIFE, kann nichts importieren). Setzt Einstellungen am
   `<html>` und Feldwerte, damit nichts aufblitzt.
2. **`draft-manager.js`** — ES-Modul, läuft **nach** dem Boot
   (`loadDraft()` → `#restoreState()`), kennt Historie, `data-quelle`-Marker
   und die Allowlist.

Die Zahlen (aus `fakten.md`, dort mit Zeile belegt):

| | |
|---|---:|
| `boot-state.js` | 183 Zeilen, IIFE 30–182 |
| `draft-manager.js` | 551 Zeilen, 18 Methoden |
| `persistence.js` | 896 Zeilen (nicht im Anhang, Zahlen in `fakten.md`) |
| `main.js` | 344 Zeilen (nicht im Anhang) |
| `DEFAULT_SETTINGS`-Schlüssel | **7** |
| tatsächlich benutzte `settings.<key>` | **9** (2 fehlen in den Defaults) |
| Stellen mit `EDITABLE_FIELD_SELECTOR` in `draft-manager.js` | 2 |
| `AddressIntelligence.targetLock = …` | **4** Stellen |
| dynamische `import()` | **4** Stellen |

Harte Randbedingungen:

- Kein Framework, kein Build, keine neue Abhängigkeit.
- **Nutzerdaten sind Format, nicht Beiwerk.** Ein geänderter Schlüssel in
  `localStorage` braucht Migration und einen Test, sonst verliert ein
  bestehender Nutzer seinen Entwurf.
- Optik, Druck und Geometrie sind tabu.
- Kein Vorschlag, der `localStorage`-Formate ohne Migrationspfad ändert.

## Was seit dem letzten Review schon behoben ist

Ohne diesen Block meldest du Erledigtes erneut. Alles hier ist committet und
getestet.

| Befund | Ausgang |
|---|---|
| Drei Schalter-Semantiken (`asBool`, `!== false`, `Boolean()`) | ✅ **B65** — `istAn` in `persistence.js:76`, lokale Kopien in `boot.js`/`boot-state.js`, ein Test hält alle drei deckungsgleich |
| `settings.js` schrieb `layout` ohne Whitelist | ✅ **B66** — `LAYOUT_WHITELIST` in `boot.js:45` |
| Seeder ohne Allowlist | ✅ **B69** — `boot-state.js` prüft `EDITABLE_FIELD_SELECTOR` (Zeile 122 ff.), dieselbe Bedingung wie der Draft-Manager |
| `data-gesetzt` als zweiter Schreiber | ✅ **B62** — jetzt `:has(option:checked…)`, kein Schreiber mehr |
| `sheet.css` als toter Ladeweg | ✅ **B60** — stillgelegt, Statuskopf, 0 Byte Netzlast |
| Erster Paint als „Zusage" (racy) | ✅ **B72** — `tools/paint-probe.mjs`, 3 Profile × 30 Läufe |

**Nicht** Teil dieser Scheibe: `data-layout` mit zwei Spuren (B63, offen).

## Was du bekommst

| Datei | Inhalt |
|---|---|
| `boot-state.js` | 183 Zeilen — der Seeder, komplett |
| `draft-manager.js` | 551 Zeilen — der zweite Pfad, komplett |
| `fakten.md` | Kennzahlen, alle Methoden mit Zeile, **alle vier `targetLock`-Stellen**, alle dynamischen Importe, `DEFAULT_SETTINGS` gegen die tatsächliche Nutzung |

**Nicht im Anhang** (Rolle und Zahlen in `KONTRAKT.md`): `persistence.js`
(`DEFAULT_SETTINGS`, `STORAGE_KEYS`, `istAn`, `loadJSON`), `main.js`
(Boot-Reihenfolge), `document.js` (`EDITABLE_FIELD_SELECTOR`,
`collectDraft`). Zusammen mit beiden Pfad-Dateien wären das 65 KiB — dann wäre
der Schnitt zu grob. Fehlt dir eine dieser Dateien für eine Antwort, sag es
unter Aufgabe 6.

**Der Anhang hat 37 KiB statt der üblichen 30** — bewusst: es sind zwei
vollständige Pfade (183 + 551 Zeilen). Eine Datei wegzulassen hieße, die Hälfte
der Frage wegzulassen. Der Schnitt ist nicht grob, er ist dicht.

## Aufgaben

**1. Die Schlüssel-Tabelle.** Welche Feld-IDs setzt der Seeder, welche setzt
`#restoreState`, welche beide? Belege mit Zeile. Nenne ausdrücklich die
Schlüssel, die **nur einer** kennt — das ist der interessante Teil.
Methode: `EDITABLE_FIELD_SELECTOR` (`document.js:878`) gegen
`collectDraft()` (`document.js`) stellen, nicht raten.

**2. `targetLock` viermal.** `fakten.md` zählt vier Setzstellen: 
`draft-manager.js:274` (in `#restoreState`), `:470` (in `resetDraft`),
`main.js:128` (nach `loadDraft()`), `main.js:215` (nach `resetDraft()`).
Prüfe die Aufrufkette (`loadDraft:245` → `#restoreState:255` und
`resetDraft:431`). Sind die beiden `main.js`-Zeilen beweisbar **tot**, oder
gibt es einen Pfad, auf dem sie etwas tun? Wenn tot: gehört das Entfernen in
diese Scheibe oder ist es zu riskant?

**3. Die vier dynamischen Importe.** `main.js:151` startet den
Mehrseiten-Controller (im `bootStep` „Plugins", **ohne** `await`), `:288/302/314`
laden das Testbrief-Addon im Klick-Handler. Welche davon hängen am Boot-Pfad,
und was passiert, wenn einer scheitert? Konkret: bleibt `data-ready` korrekt,
wenn `mountMultipage()` nach dem Boot fertig wird — und was sieht der Nutzer,
wenn es nie fertig wird?

**4. `DEFAULT_SETTINGS` ist unvollständig.** 7 Schlüssel dort, 9 werden
benutzt: `signatureImage` (3 Stellen) und `signatureState` (2 Stellen) fehlen.
`signatureState` hat im Lesepfad harte Fallbacks (`x: 11.9`, `y: 96.0`,
`scale: 0.5`), `signatureImage` wird nur auf `undefined` gesetzt. Ist das ein
Fehler oder Absicht? Was sieht ein **frisches Profil** (kein `localStorage`) —
und was passiert, wenn ein Nutzer aus einem alten Export importiert?

**5. Der Schnitt für eine gemeinsame Funktion.** Zielbild (aus der Skizze):
**eine** Funktion „Zustand aus einem Objekt anwenden", die beide Pfade
benutzen. Sag, wo genau die Naht liegt und wie viele Zeilen sie kostet —
oder belege, warum das **nicht** geht (der Seeder ist ein klassisches Skript,
kann also nichts importieren; wie löst man das ohne Build?). Ein „geht nicht"
mit Begründung ist hier ein vollwertiges Ergebnis.

**6. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche
Frage? Sei konkret — das ist der Auftrag für die nächste Scheibe.

## Messmethode (mitliefern, nicht nachfragen)

- Browser: Chrome 150+, Dev-Server `python3 -m http.server 8088` im
  `website/`-Ordner, CDP auf Port 9222.
- `Network.setCacheDisabled` **ist Pflicht** — sonst misst du den alten Stand.
- `focus`-Events feuern nur mit `Emulation.setFocusEmulationEnabled`.
- `localStorage`-Zustände setzt man **vor** dem Navigieren, nicht danach:
  `Page.navigate` auf die Origin, `Runtime.evaluate` zum Schreiben, dann
  `Page.reload({ ignoreCache: true })`.
- „Feld gefüllt" heißt `Field.getValue(el) !== ''`, nicht
  `el.value !== ''` (Contenteditable-Felder haben kein `value`).

## Form deiner Antwort

- Maximal zwei Bildschirmseiten.
- Jede Behauptung: Datei + Zeile. Ohne Beleg: **ungeprüft** markieren und die
  Gegenprobe nennen.
- Am Ende drei Blöcke: **Schlüssel-Tabelle**, **Befunde**,
  **Schnitt-Empfehlung** mit Zeilen und Risiko.
- Empfehlungen als A/B/C mit Kosten in geänderten Zeilen und Risiko in einem
  Satz.

## Was du nicht tun sollst

- Nichts ändern. Kein Patch, kein „so sollte es aussehen" als Codeblock-Umbau.
- Keine Aussage über Dateien, die nicht im Anhang sind (`persistence.js`,
  `main.js`, `document.js`) — verweise auf den Kontrakt.
- Keine Optik-, Druck- oder Geometrievorschläge.
- Kein Vorschlag, der einen `localStorage`-Schlüssel umbenennt oder entfernt,
  ohne Migrationspfad und Test.
- `sheet.css` ist stillgelegt und bleibt es; sie kommt in dieser Scheibe nicht
  vor.
