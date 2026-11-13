# Review-Auftrag B15 — Seitenleiste: austauschbares Design und logischer Aufbau

## Rolle

Senior UX-Architekt mit Schwerpunkt **Designsysteme und Informationsarchitektur**.
Du änderst **nichts**. Du prüfst eine Seitenleiste unter zwei Linsen, die beim
letzten Review zu kurz kamen:

- **A — Austauschbarkeit:** Was bleibt richtig, wenn die gesamte optische
  Schicht ersetzt wird?
- **B — Logik:** Ist der Aufbau aus einer benennbaren Regel ableitbar, oder ist
  er gewachsen?

## Kontext

**DIN-BriefNEO** ist ein Brief-Editor, der DIN 5008 als A4 druckt. Kein
Framework, kein Build, ES-Module direkt im Browser. Baseline **Chrome 150+**
(`:has()`, `@scope`, Popover, `<dialog>`, `input switch`, `field-sizing`,
`anchor()`, `light-dark()` sind vorhanden und Absicht — 121× `oklch()`,
64× typisiertes `attr()`, 39× `:has()`, 25× Container Queries).

Auslieferung: GitHub Pages, CSP `script-src 'self'; style-src 'self'`.

### Was seit dem letzten Review passiert ist (Stand `51533d5` → `b502f41`)

Diese vier Befunde sind **behoben** — bitte nicht erneut melden:

| Befund | Stand heute |
|---|---|
| Layout-Block lag außerhalb `zone-dokument`, verwaistes `</section>` | Block und `<hr>` sind in der Zone, `<section>` 3 offen / 3 geschlossen |
| Statuszeile blieb im Einstellungs-Modus stehen | ausgeblendet (`getClientRects()` = 0) |
| Escape nur bei Fokus auf der Checkbox | hängt an `#seitenleiste`, offene Popover haben Vorrang, danach `focus()` |
| `role="group" aria-label` doppelte den `h3`-Text; statisches `aria-label` überschrieb beide Labels | `aria-labelledby`; Schalter-Name gemessen: „Einstellungen öffnen Zurück zum Brief" |

Zusätzlich entfernt: Mobil-Variante (Entscheidung: Chrome-150+-Desktop),
einheitliche Feld-Optik (Rahmen außen 2 px, Mehrzeiler 6 px, Radius 4 px).

## Dateien dieses Batches

| Datei (absolut) | Warum dabei |
|---|---|
| `/home/moritz/repos/DIN-BriefNEO/website/index.html` | die Leiste: 3 `<section class="seitenleiste-zone">`, 1 `<div id="zone-aktionen">`, 2 Kinder ganz ohne Zone |
| `/home/moritz/repos/DIN-BriefNEO/website/css/sidebar.css` | 1290 Zeilen; **7** Regeln hängen am Modusschalter, 6 davon adressieren Design-Klassen und IDs |
| `/home/moritz/repos/DIN-BriefNEO/website/css/base.css` | 73 Custom Properties: die Token-Schicht, auf der ein Austausch aufsetzen würde |
| `/home/moritz/repos/DIN-BriefNEO/website/js/settings.js` | `toggleSettingsModus`, `applySettings`, `rendereZustand`, Escape-Pfad |
| `/home/moritz/repos/DIN-BriefNEO/website/js/main.js` | Boot-Kette, `bootStep`-Reihenfolge |
| `/home/moritz/repos/DIN-BriefNEO/batches/B15 - Seitenleiste Design-Austausch/seitenleiste-2026-11-13.txt` | **Messwerte**: DOM-Kinder, Zonenzugehörigkeit, Tab-Stopps, Kopplungen |

## Linse A — Design austauschbar

Denk es radikal: `sidebar.css` wird durch ein fremdes Designsystem ersetzt —
andere Farben, Abstände, Radien, Klassennamen, vielleicht Utility-Klassen statt
IDs. **Was muss dann noch stimmen?** DOM-Reihenfolge, ARIA, Text, Zustand,
Bedienbarkeit, Moduswechsel. Alles andere darf weg.

Gemessene Ausgangslage:

```
JS manipuliert 0 Klassen (classList in settings.js/main.js: keine Treffer)
7 CSS-Regeln tragen den Moduswechsel, 6 davon selektieren nach IDs/Klassen
wie #zone-dokument, #zone-werkzeuge, #zone-setup, .seitenleiste-export-group,
.seitenleiste-zustand, .seitenleiste-header-row
```

### Aufgaben

**A1 — Klassifikation der 7 Modus-Regeln.** Für jede: trägt sie *Struktur*
(was ist sichtbar, was ist bedienbar, wo steht der Fokus) oder *Darstellung*
(wie sieht es aus)? Für jede strukturtragende: was müsste ein neues Design
nachbauen, damit der Moduswechsel nicht verloren geht?

**A2 — Semantik in CSS-Kleidern.** Wo hängt heute Bedeutung an einer
Darstellungs-Entscheidung? Kandidaten: `sr-only`-Überschriften als
Zonen-Namen, `.seitenleiste-*`-Klassen als Zonen-Bezeichner, `data-*` vs.
Klassen, `<div id="zone-aktionen" class="seitenleiste-footer">` als Zone ohne
`section`. Sag je Fall: akzeptabel, heilbar, oder Fehler.

**A3 — Grenzziehung.** Formuliere eine kurze Regel: welche Adressen (IDs) darf
JS behalten, welche Klassen darf ein Design besitzen, und was darf keins von
beidem? Nenne die Kosten in Zahlen (betroffene Selektoren, Attribute, Zeilen).

**A4 — Gegenprobe.** Nenne **drei** Mutationen, die ein Designwechsel nicht
brechen darf (Beispiel: Einstellungs-Modus an → `#zone-dokument` hat
`offsetParent === null`). Sag je Mutation, welcher Nachweis heute fehlt und wie
er in einem Satz geprüft würde.

## Linse B — Logisch aufgebaut

Nicht „sieht sauber aus", sondern: **aus welcher Regel folgt die Reihenfolge?**
Beurteile gegen deine eigene Regel, nicht gegen Geschmack.

Gemessene Ausgangslage:

```
4 Zonenbegriffe: 3 × <section class=seitenleiste-zone>, 1 × <div id=zone-aktionen>
2 Elemente ganz ohne Zone: .seitenleiste-export-group, .seitenleiste-zustand
22 Tab-Stopps im Brief-Modus — davon 6 in KEINER Zone
11 Tab-Stopps im Einstellungs-Modus — davon 1 ohne Zone
2 sichtbare Überschriften (Brief, Einstellungen), 2 nur sr-only (Daten, Aktionen)
Seitenleiste scrollt bei 1007 px um 30 px
```

### Aufgaben

**B1 — Ordnungsregel.** Benenne *eine* Regel (z. B. „pro Brief / pro
Absenderprofil / pro Gerät / Entwickler / global"), ordne ihr alle 22 Regler zu
und markiere jeden Regler, der sich nicht einordnen lässt. Aus der Matrix folgt
die Reihenfolge — oder der Beweis, dass die heutige falsch ist.

**B2 — Ist „Zone" ein Konzept oder ein Zufall?** Drei `section`, eine `div`,
zwei Kinder ohne Zone. Welche Rolle spielt die Zone: Sprungmarke, Ausblend-
Einheit, Überschriften-Träger, Semantik? Was müsste ein neues Design über Zonen
wissen — und was, wenn es das nicht weiß?

**B3 — Namen prüfen.** „Daten" enthält Öffnen/Testbrief/Kopieren; „Aktionen"
enthält Zurücksetzen plus Speicherstatus; die Klasse heißt
`seitenleiste-export-group` und enthält Drucken **und** Speichern. Wo lügt ein
Name, und welche Folge hat das für Suche, Vorlesen und ein neues Design?

**B4 — Auffindbarkeit.** Vergleiche die 22 Tab-Stopps mit der visuellen
Reihenfolge (Liste im Messwert-File). Gibt es Sprünge, Umwege, Stellen an denen
man scrollen muss, oder einen Stopp, der vor der Hauptaktion liegt und dort
nicht hingehört? Nenne die Nummern, nicht die Meinung.

**B5 — Doppelungen.** Zwischenablage existiert 2×, Status existiert 2×
(Speicherstatus und Zustandszeile), „Einstellungen" ist Zone **und** Modus.
Welche Doppelung ist legitim (andere Aufgabe), welche ist ein Fehler?

**B6 — Messbare Kriterien.** 4–6 Zahlen mit Ist-Wert (aus dem Messwert-File)
und Zielwert, an denen „logischer" prüfbar wird.

## Form deiner Antwort

- Kurz. Keine Dateizusammenfassung.
- Jede Behauptung mit Beleg: Datei + wörtliches Zitat, oder Messwert aus
  `seitenleiste-2026-11-13.txt`. Ohne Beleg: **ungeprüft** markieren und die
  Gegenprobe nennen.
- Standards mit Fundstelle (APG-Pattern-Name, WCAG-Nummer, HTML-Spez).
- Drei Blöcke am Ende:
  1. **Designschicht** — Tabelle: Regel/Element × Struktur oder Darstellung ×
     Nachbau-Aufwand für ein neues Design,
  2. **Ordnungsmatrix** — Regler × Phase × Zone × Begründung,
  3. **Schritte** — nummeriert, je Datei → Änderung → Gegenprobe → Zielwert.

## Was du NICHT tun sollst

- Kein Framework, kein Build, kein npm, kein Design-System einführen.
- Kein Service Worker (`A37`), kein `text-fit` (`P39`).
- **Kein Mobil.** Entschieden: Chrome-150+-Desktop. Schmale Viewports nur als
  Befund, ohne Umbauvorschlag.
- **Keine Wiederholung der vier erledigten Befunde** (Tabelle oben).
- Entschiedene Themen (Radiogruppe statt Checkbox, `<details>` für
  Entwicklerwerkzeuge, Falzmarken in die Einstellungen) nur erneut aufmachen,
  wenn du einen **neuen Messwert** lieferst, der die Entscheidung kippt.
- Keine Screenshots als Beweis fordern — Zahlen und Zitate reichen.
- `website/css/sheet.css` ist **nicht eingebunden** (kein `<link>`, kein
  `@import`): als Befund melden, nie als Quelle behandeln.
- Keine erfundenen Standards.
