# Review-Auftrag B11 — FOUC-Vollständigkeit: welcher Zustand kommt zu spät?

## Rolle

Senior Frontend-Architekt für Vanilla-JS ohne Framework, ohne Build. Du änderst
**nichts**, du analysierst und schlägst vor. Leitfrage: *Welcher Zustand wird
nach dem ersten Paint ins DOM geschrieben und von CSS gelesen — und wie
beweist man vollständig, dass keiner mehr übrig ist?*

## Kontext

**DIN-BriefNEO** ist ein Brief-Editor, der DIN 5008 als A4 druckt. Kein
Framework, kein Build, ES-Module direkt im Browser. Baseline **Chrome 150+**
(`attr(… type(<number>))`, `@scope`, `:has()`, `field-sizing`, Popover,
`<dialog>`, `input switch`, `ariaNotify` sind vorhanden und Absicht — nicht als
„modern" melden).

Auslieferung öffentlich über GitHub Pages, CSP `script-src 'self'`.
Debug-Betrieb lokal auf `http://127.0.0.1:8088`.

Harte Regeln des Projekts (Auszug, gelten):
- **A37:** kein Service Worker.
- **A49:** kein JS-Textfitting / DOM-Layout-Polling (Ausnahme dokumentiert für
  die Eingabe-Sperre bei voller Feldbreite).
- **A61:** kein schreibender `innerHTML`-Zugriff (DOMParser + `replaceChildren`).
- **A48/TM1:** keine Legacy-Datums-API (Zeiten über `performance.now()`).
- **P39:** `text-fit` ist Projekt-Ban.

## Dateien dieses Batches

| Datei | Warum dabei |
|---|---|
| `boot.js` | klassisches Script im `<head>`: setzt `data-theme`, `data-layout`, `data-style`, `data-marks`, `data-plugin-testbrief`, `data-plugin-multipage`, `data-anlagen`, `data-fuss` |
| `boot-state.js` | klassisches Script am Body-Ende: seedet Regler **und** Feldwerte, setzt am Ende `data-seeded` |
| `main.js` | `bootStep`-Kette: welcher Pfad wann läuft, `data-ready` |
| `settings.js` | zweiter Schreiber von `data-layout`/`data-marks`/Radios/Schaltern, `applySettings()` |
| `salutation.js` | setzt `#stil-select` (heute **nach** dem Paint) |
| `font-feature.js` | setzt `#select-schriftart` (heute **nach** dem Paint), View Transitions |
| `draft-manager.js` | zweiter Restore-Pfad: Felder, Schalter, `data-quelle`, Undo/Reset |
| `base.css` | Abschnitt 1a: `transition: none` bis `data-seeded` |
| `sidebar.css` | 30 Zustandsselektoren, u. a. `.seitenleiste-select:has(option:checked…)` |
| `sheet-common.css` | `data-layout`-Zonen, Formwechsel-Animation, Feld-Chrom |
| `sheet-multipage.css` | `data-anlagen`, Druckregeln, `#spacer` |
| `index.html` | die Defaults im Markup (erste Option, `checked` auf Form B) |
| `fouc-inventur.txt` | **Messwerte und Landkarte**: Boot-Kette, alle Regler, alle Übergänge, Messprotokoll |

## Der Befund in einem Satz

Der Zustand existiert an **drei** Orten (localStorage, `<html data-…>`,
Formular-Control) mit **zwei** Restore-Pfaden; CSS liest teils Attribute, teils
`:checked`. Nach dem Umbau vom 2026-11-12 ist die Klasse bekannt, aber **nicht
vollständig abgestellt** — es gibt vier Regler, die noch nach dem Paint gesetzt
werden, und mindestens einen CSS-Selektor, der an ihrem Wert hängt.

Gemessen (`fouc-inventur.txt`, CDP, Cache aus, FCP 64 ms):

```
 27 ms  #stil-select = "formal"   ← HTML-Standard im ersten Frame
 79 ms  #stil-select = "polite"   ← erst salutation.js setzt den Speicherwert
```

Der Select zeigt kurz den falschen Eintrag und springt dann. Derselbe Bauplan
bei `#select-schriftart`, `#btn-rand-u-30`, `#plugin-testbrief`.

Bereits behoben (nicht erneut vorschlagen): `data-anlagen`/`data-fuss` aus
Attributen, idempotente Schreiber (`setzeAttribut`/`setzeSchalter`),
`data-seeded` statt `data-ready`, Übergangssperre in `base.css` Abschnitt 1a.

## Deine Aufgaben

1. **Vollständigkeitsbeweis statt Stichprobe.** Prüfe in der Inventur, ob
   *jeder* sichtbare Regler vor dem ersten Paint seinen Wert hat. Nenne die
   Regler, die dort fehlen, mit Datei + wörtlichem Zitat. Bewerte auch:
   Gibt es Zustand, der gar nicht in der Inventur steht (Klassen, `hidden`,
   `popover`, `aria-*`, Font-Injektion, Unterschriftsbild, Undo-Restore,
   Multi-Tab-`storage`-Event)?
2. **Welche CSS-Regel darf Zustand lesen?** Trenne sauber:
   - Control-Optik, die der Nutzer selbst auslöst (Hover/Fokus/Aktiv) → `:checked`
     ist in Ordnung.
   - Blatt-/Sichtbarkeits-Verhalten, das aus dem Speicher kommt → nur Attribute,
     gesetzt vor dem Paint.
   Nenne jede Regel, die heute falsch einsortiert ist (Datei + Selektor + Zitat).
3. **Zielbild.** Wie sieht der kleinste Aufbau aus, in dem jeder Zustand genau
   eine Wahrheit hat und der erste Frame nachweisbar korrekt ist? Sag
   ausdrücklich, was in den `<head>` gehört, was ans Body-Ende, und was **kein
   JS** braucht.
4. **Migrationsplan.** Kleinste Schritte, jeder einzeln prüfbar:
   Datei → Änderung → wie man den Schritt widerlegt (Messung/Test). Sag auch,
   was bewusst **nicht** geändert werden soll.
5. **Beweisverfahren, das Vollständigkeit misst.** Ein Messprotokoll, das
   „kein FOUC" für **alle** Regler nachweist (nicht für drei) und in ~10 s
   läuft: welche Werte, zu welchem Zeitpunkt, gegen welche Referenz, wie erkennt
   man einen neu hinzugekommenen Regler automatisch? Kein Screenshot, keine
   Bild-Token.
6. **Fehlermodi.** Welche Reihenfolge kann sichtbar falsch werden: Profil leer,
   Entwurf älter als Schema, Undo/Reset, Import, mehrere Tabs,
   `prefers-reduced-motion`, Drucken direkt nach dem Laden, Seitenleiste
   ein-/ausgeklappt, Theme-Wechsel während des Ladens.

## Form deiner Antwort

- Kurz. Keine Zusammenfassung der Dateien — ich kenne sie.
- Jede Behauptung mit Beleg: Datei + wörtliches Zitat oder Messwert aus
  `fouc-inventur.txt`. Ohne Beleg: als **ungeprüft** markieren.
- Am Ende drei Blöcke:
  1. **Matrix** (Regler × Schreiber × Zeitpunkt × CSS-Leser),
  2. **Zielbild** (A/B/C mit Begründung, was CSS-only bleibt),
  3. **Schritte** (nummeriert, je mit Gegenprobe).

## Was du NICHT tun sollst

- Kein Framework, kein Build, keine npm-Abhängigkeit vorschlagen.
- Kein Service Worker (`A37`), kein `text-fit` (`P39`).
- Nicht vorschlagen, Elemente bis `data-ready` zu verstecken — das erzeugt nur
  einen anderen FOUC (leere Plätze); genau dieser Fehler ist 2026-11-12 passiert.
- Die Übergangssperre in `base.css` Abschnitt 1a nicht wegoptimieren und nicht
  auf einzelne Selektoren verengen.
- Keine Screenshots als Beweis fordern — Zahlen reichen.
- `website/css/sheet.css` ist **nicht eingebunden** (kein `<link>`, kein
  `@import`). Als Befund melden, nicht als Quelle behandeln.
