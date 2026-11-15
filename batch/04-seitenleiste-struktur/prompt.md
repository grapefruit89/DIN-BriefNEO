# Batch 04 — Seitenleiste: Struktur und Optik trennen

## Rolle

Du bist CSS-Architekt für **eine Datei, die zwei Verträge gleichzeitig trägt**.
Du änderst **nichts**. Du prüfst eine Frage: **`sidebar.css` enthält die
Gestaltung der Leiste und den Strukturvertrag der beiden Modi — lässt sich das
trennen, ohne dass ein fremdes Design die Modus-Logik kaputt macht?**

## Kontext

**DIN-BriefNEO** druckt DIN 5008 als A4 im Browser. Kein Framework, kein Build,
kein Präprozessor — vier `<link>`-Dateien, nativ, Baseline **Chrome 150+**.
Die Seitenleiste hat zwei Modi, umgeschaltet über eine Radiogruppe
(`#modus-brief` / `#modus-einstellungen`, `website/index.html:67/69`). Der
Umschalter ist **kein** eigenes Zustandsobjekt: eine `:checked`-Regel mit
`:has()` trägt alles.

Die Zahlen (aus `fakten.md`, dort mit Zeile belegt):

| | |
|---|---:|
| `sidebar.css` | **1.281** Zeilen, 39,5 KiB |
| ID-Selektoren darin | **111** |
| `!important` | 3 |
| `:has(` | 19 |
| `@media`-Blöcke | 3 |
| Modus-Regeln (echte Regeln, nicht Selektoren) | **3** mit **6** Selektoren, Zeilen 800/804/818 |
| Zonen in `index.html` | 4 (`zone-dokument`, `zone-werkzeuge`, `zone-setup`, `zone-aktionen`) |
| fokussierbare Elemente im Quelltext | 73 (statisch, **kein** Tab-Walk) |

Harte Randbedingungen:

- **Optik bleibt unverändert.** Das ist ein Struktur-Auftrag; kein „das könnte
  man schöner machen".
- Kein Framework, kein Build, keine neue Abhängigkeit, kein Präprozessor.
- Druck, Geometrie und Blattkoordinaten sind tabu (DIN-Maße).
- Der Strukturvertrag über `data-nur` wurde **abgelehnt** (Batch 01). Diese
  Aufgabe ist ohne ihn zu lösen — ein Vorschlag, der ihn wieder einführt, ist
  kein Vorschlag.

## Was seit dem letzten Review schon passiert ist

| Befund | Ausgang |
|---|---|
| „7 Modus-Regeln, davon 6 mit Design-Adressen" | ✅ **veraltet, korrigiert** — heute **3** Regeln mit 6 Selektoren (Zeilen 800/804/818); vier trafen nichts mehr und wurden entfernt (`B14`) |
| Fuß mit „Zurücksetzen" lag unter der Kante | ✅ **B74** — `position: sticky; bottom: 0` mit Hintergrund; 93 px Überlauf → 4 px bei 1007 px Höhe |
| Statuszeile im falschen Modus, Fokusziele ohne Zone, Zone „Daten" falsch benannt | ✅ **B75** — Statuszeile nur im Brief-Modus, vier benannte Gruppen, Zone heißt „Dateien & Testbrief" |
| Doppelte `display`-Regel an `#zone-setup` | ✅ **entfernt** (B14/A1) |
| `#btn-reset`-Regel mit zwei toten Selektoren | ✅ **entfernt** (B14) |
| `data-gesetzt` als zweiter Schreiber | ✅ **B62** — jetzt `:has(option:checked…)` |
| `sheet.css` als toter Ladeweg | ✅ **B60** — stillgelegt, Statuskopf, 0 Byte Netzlast |

## Was du bekommst

| Datei | Inhalt |
|---|---|
| `sidebar.css` | 1.281 Zeilen, komplett — die Datei **ist** der Gegenstand |
| `fakten.md` | Kennzahlen, die 3 Modus-Regeln mit Zeile und vollem Selektor, Modusschalter, alle 4 Zonen, statische Fokus-Zählung |

**Nicht im Anhang:** `index.html` (36 KiB — Zonen und Schalter stehen mit Zeile
in `fakten.md`), `base.css`, `sheet-*`. Zusammen mit `sidebar.css` wären das
80 KiB; dann wäre der Schnitt zu grob.

**Der Anhang hat ~45 KiB statt der üblichen 30** — bewusst: die Frage lautet
„gehört diese Regel zur Optik oder zum Vertrag", und das lässt sich nur am
ganzen File entscheiden. Ein Auszug würde genau die Regeln wegschneiden, um die
es geht.

## Aufgaben

**1. Die drei Modus-Regeln klassifizieren.** Jede der 6 Selektoren entscheidet
über Sichtbarkeit (`display: none`) — das ist Struktur, nicht Optik, auch wenn
sie in der Design-Datei steht. Sag je Selektor: **was** verschwindet, **in
welchem Modus**, und ob ein fremdes Design diese Regel ersetzen dürfte.
Belege mit Zeile aus `fakten.md`.

**2. Der Mutationstest — die Gegenprobe.** Was passiert, wenn ein fremdes
Design `sidebar.css` ersetzt? Nimm an, die Datei wäre weg: welche Zonen sind
dann sichtbar, welche Fokusziele erreichbar, kommt man noch in den
Einstellungs-Modus? Nenne die **konkrete Messung** (Werkzeug, Auswahl,
Toleranz), nicht das Ergebnis — messen musst du nicht, aber der Auftrag soll
wissen, was zu messen wäre. Genau dieser Test entscheidet, was aus
`sidebar.css` nach `base.css` gehört.

**3. Die Fokusfolge, richtig gezählt.** `fakten.md` nennt 73 fokussierbare
Elemente **im Quelltext** — das ist keine Tab-Reihenfolge (`sr-only`, `hidden`,
`disabled`, ausgeblendeter Modus zählen mit). Beschreibe die Messung als
Tab-Walk (echte `Tab`-Tasten, `document.activeElement` protokollieren) und sag,
welche Zahl du als Sollwert erwartest — mit Begründung, nicht geschätzt. Am
2026-11-13 hat genau diese Verwechslung eine Zahl um eins verschoben.

**4. Die Naht benennen.** Wenn etwas nach `base.css` wandert: **was genau**, in
welcher Reihenfolge, und wie viele Zeilen bleiben? Nenne die Grenze als Regel
(„Sichtbarkeit gehört zu X, Aussehen zu Y") und prüfe sie gegen die 111
ID-Selektoren: wie viele davon sind Design, wie viele Struktur? Eine grobe
Zuordnung mit Zahl ist besser als eine perfekte ohne.

**5. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche Frage?
Sei konkret — das ist der Auftrag für die nächste Scheibe.

## Messmethode (mitliefern, nicht nachfragen)

- Browser: Chrome 150+, Dev-Server `python3 -m http.server 8088` im
  `website/`-Ordner, CDP auf Port 9222.
- `Network.setCacheDisabled` **ist Pflicht** — sonst misst du den alten Stand.
- Ein Stylesheet im laufenden Dokument abschalten:
  `document.styleSheets[i].disabled = true` (Index über `href` suchen, nicht
  raten). Danach `getComputedStyle` je Zone, nicht „sieht anders aus".
- Tab-Walk: `document.body.focus()`, dann echtes `Tab` per CDP
  (`Input.dispatchKeyEvent`), `document.activeElement.id` protokollieren.
  `querySelectorAll('input')` zählt DOM-Elemente und liegt daneben.

## Form deiner Antwort

- Maximal zwei Bildschirmseiten.
- Jede Behauptung: Datei + Zeile oder Zahl aus `fakten.md`. Ohne Beleg:
  **ungeprüft** markieren und die Gegenprobe nennen.
- Am Ende drei Blöcke: **Klassifikation** (tabellarisch, 6 Selektoren),
  **Naht** (was nach `base.css`, wie viele Zeilen), **Messplan**.
- Empfehlungen als A/B/C mit Kosten in geänderten Zeilen und Risiko in einem
  Satz.

## Was du nicht tun sollst

- Keine Optikänderung vorschlagen — kein Abstand, keine Farbe, keine
  Reihenfolge in der Leiste.
- `data-nur` nicht wieder einführen (abgelehnt in Batch 01).
- Keine Aussage über `index.html` jenseits der Zeilen aus `fakten.md`.
- Druck, Geometrie und DIN-Maße sind tabu.
- `sheet.css` ist stillgelegt und kommt hier nicht vor.
