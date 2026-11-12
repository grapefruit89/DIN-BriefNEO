# Review-Auftrag B14 — Seitenleiste: Informationsarchitektur und Einstellungs-Umschalter

## Rolle

Senior UX-Architekt und Frontend-Ingenieur für eine Ein-Zweck-Web-App ohne
Framework, ohne Build. Du änderst **nichts**, du analysierst und schlägst vor.
Leitfrage: *Findet ein Nutzer beim Schreiben das Richtige, ohne zu suchen —
und ist der Umschalter zwischen Brief und Einstellungen nach heutigen
Standards gebaut?*

## Kontext

**DIN-BriefNEO** ist ein Brief-Editor, der DIN 5008 als A4 druckt. Kein
Framework, kein Build, ES-Module direkt im Browser. Baseline **Chrome 150+**
(`:has()`, `@scope`, Popover, `<dialog>`, `input switch`, `field-sizing`,
`ariaNotify` sind vorhanden und Absicht).

Auslieferung öffentlich über GitHub Pages, CSP `script-src 'self'; style-src 'self'`.
Debug-Betrieb lokal auf `http://127.0.0.1:8088`.

Harte Regeln (Auszug, gelten):
- **A37:** kein Service Worker.
- **A49:** kein JS-Textfitting / DOM-Layout-Polling.
- **A61:** kein schreibender `innerHTML`-Zugriff (DOMParser + `replaceChildren`).
- **P39:** `text-fit` ist Projekt-Ban.
- **KISS:** erst prüfen, ob eine native Plattform-Lösung reicht (CSS,
  `<details>`, Popover, `switch`), bevor JS gebaut wird.

## Dateien dieses Batches

| Datei | Warum dabei |
|---|---|
| `index.html` | die Leiste: 4 Zonen, 33 fokussierbare Regler, der Modus-Schalter |
| `sidebar.css` | 1235 Zeilen; 10 Regeln hängen am Modus-Schalter (`:has(#toggle-modus:checked)`) |
| `settings.js` | `toggleSettingsModus`, `applySettings`, Schalter-Spiegelung |
| `main.js` | Boot-Kette, welche Regler wann verdrahtet werden |
| `document.js` | die Textformatierungs-Gruppe der Leiste (fett/kursiv/Zitat) |
| `seitenleiste-inventur.txt` | **Messwerte**: Zonen, Reihenfolge, Zählungen, Toggle-Markup |

## Der Ist-Zustand in Zahlen (gemessen 2026-11-13, 1912×1007)

```
4 Zonen · 33 fokussierbare Regler · 19 sichtbar im Brief-Modus · 14 versteckt
0 Ueberschriften (h1-h3) · 11 Flach-Labels · 2 fieldset/legend
1 fieldset in zone-dokument
Seitenleiste scrollt bei 1007 px nicht (scrollHeight == clientHeight)
#btn-print ist Tab-Stopp 3 von 19, steht aber im Kopf; #btn-reset im Fuß
```

Reihenfolge im Brief-Modus:

```
Layout (Form A/B) → Falzmarken → Stil/Anrede → Postvermerk →
Textformatierung → Anlagen → Fußzeile → Daten & Adressen
```

Der Modus-Schalter:

```html
<input type="checkbox" id="toggle-modus" class="sr-only" aria-label="Einstellungen">
<label for="toggle-modus" role="button" tabindex="0">Zahnrad</label>
<label for="toggle-modus" role="button" tabindex="0">Zurück</label>
```

Zwei Labels an einer Checkbox, **ohne** `switch`-Attribut — obwohl die zehn
Options-Schalter daneben `<input switch>` nutzen. Kein `aria-expanded`, kein
Escape-Pfad, kein Fokuswechsel in die geöffnete Zone.

## Deine Aufgaben

1. **Timeline-Matrix.** Trage jeden der 33 Regler in den Ablauf ein, in dem
   der Brief tatsächlich entsteht (Adressen → Datum/Betreff → Text → Anlagen →
   Gruß/Unterschrift → Fußzeile → Geometrie/Stil → Export). Bewerte je Regler:
   Häufigkeit, Rückholbarkeit, ob er auf dem Blatt sichtbar wirkt. Daraus
   folgt die Reihenfolge — begründet, nicht „weil es sauber aussieht".
2. **Trennung Brief/Einstellungen.** Kriterium entwickeln: Was gehört in den
   Brief-Modus, was in die Einstellungen? Heute liegen Form A/B (global) und
   Schrift/Unterrand (global) in verschiedenen Modi — das ist inkonsistent.
   Sag konkret, was umziehen soll und was nicht.
3. **Der Umschalter.** Bewerte das heutige Muster gegen ARIA APG
   (Disclosure, Switch), WCAG 2.2 (2.4.3, 2.4.7, 2.4.11, 2.5.8, 4.1.2) und
   die Plattform (`<input switch>`, `<details>`, Popover). Welches Muster ist
   hier das richtige, und was kostet der Wechsel? Kein Neubau „weil modern".
4. **Hierarchie.** Braucht die Leiste Überschriften, Fieldsets, Gruppen?
   Wie tief? Wie werden Gruppen benannt, damit sie sich nicht wiederholen?
5. **Progressive Disclosure.** Was bleibt immer sichtbar, was klappt auf, was
   gehört hinter „Erweitert"? Wann ist Verstecken ein Fehler (Auffindbarkeit,
   Rückgängigmachen)?
6. **Messbare Kriterien.** Definiere 4–6 Zahlen, an denen „besser" geprüft
   wird (z. B. Tab-Stopps bis zur Hauptaktion, Klicks bis zur häufigsten
   Änderung, Regler pro Gruppe, Scrollhöhe bei 1007 px, Zahl der Zonen).
   Nenne die Ist-Werte aus der Inventur und die Zielwerte.
7. **Schmale Viewports.** Was passiert unter 600 px, und was sollte passieren?
8. **Migrationsplan.** Kleinste Schritte, jeder einzeln widerlegbar
   (Datei → Änderung → Messung). Sag auch, was ausdrücklich **so bleiben
   soll** — inklusive CSS-only-Lösungen.
9. **Was du nicht anfassen sollst.** Der Formwechsel animiert das Blatt
   (data-layout, 0.28 s). Der Boot-Zustand wird vor dem ersten Paint gesetzt
   (`boot.js`, `boot-state.js`, `data-seeded`). Diese beiden sind entschieden.

## Form deiner Antwort

- Kurz. Keine Zusammenfassung der Dateien — ich kenne sie.
- Jede Behauptung mit Beleg: Datei + wörtliches Zitat, oder Messwert aus
  `seitenleiste-inventur.txt`. Ohne Beleg: als **ungeprüft** markieren.
- Standards mit Fundstelle nennen (APG-Pattern-Name, WCAG-Nummer), keine
  Buzzwords.
- Am Ende drei Blöcke:
  1. **Timeline-Matrix** (Regler × Phase × Häufigkeit × Zielort),
  2. **Zielbild** (A/B/C mit Begründung, was CSS-only bleibt),
  3. **Schritte** (nummeriert, je mit Gegenprobe und Zielwert).

## Was du NICHT tun sollst

- Kein Framework, kein Build, keine npm-Abhängigkeit, kein Design-System.
- Kein Service Worker (`A37`), kein `text-fit` (`P39`).
- Keine Screenshots als Beweis fordern — Zahlen und Zitate reichen.
- Kein „alles neu denken": die bestehende Struktur ist gewachsen und
  funktioniert; der Auftrag ist Ordnung, nicht Neubau.
- Keine erfundenen Standards. Wenn du eine Regel nennst, nenne die Quelle
  (APG-Pattern, WCAG-Erfolgskriterium, HTML-Spezifikation).
- `website/css/sheet.css` ist **nicht eingebunden** (kein `<link>`, kein
  `@import`) — als Befund melden, nicht als Quelle behandeln.
