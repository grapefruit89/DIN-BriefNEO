# Review-Auftrag B10 — Boot-Zustand, FOUC und doppelte Wahrheit

## Rolle
Senior Frontend-Architekt für Vanilla-JS ohne Framework, ohne Build. Du änderst
**nichts**, du analysierst und schlägst vor. Deine Leitfrage: *Wie sieht ein
JavaScript-armer, sicherer, KISS-konformer Aufbau aus, in dem dieser Zustand
nur EINMAL existiert?*

## Kontext

**DIN-BriefNEO** ist ein Brief-Editor, der DIN 5008 als A4 druckt. Kein
Framework, kein Build, ES-Module direkt im Browser. Baseline **Chrome 150+**
(`@function`, `attr(… type(<number>))`, `@scope`, `:has()`, `field-sizing`,
Popover, `<dialog>`, `input switch`, Temporal, `ariaNotify` sind vorhanden und
Absicht — nicht als „modern" melden).

Auslieferung: **öffentlich** über GitHub Pages (`grapefruit89.github.io/DIN-BriefNEO/`),
CSP `script-src 'self'; style-src 'self'` (kein Inline-Script, kein Inline-Style).
Der Debug-Betrieb läuft lokal auf `http://127.0.0.1:8088`.

Harte Regeln des Projekts (Auszug, gelten):
- **A37:** kein Service Worker.
- **A49:** kein JS-Textfitting / DOM-Layout-Polling (Ausnahme dokumentiert für
  die Eingabe-Sperre bei voller Feldbreite).
- **A61:** kein schreibender `innerHTML`-Zugriff (DOMParser + `replaceChildren`).
- **A48/TM1:** keine Legacy-Datums-API (gemessene Zeiten über `performance.now()`).

## Dateien dieses Batches

| Datei | Warum dabei |
|---|---|
| `boot.js` | klassisches Script im `<head>`, setzt Theme/Layout/Marks vor dem Paint |
| `boot-state.js` | klassisches Script am Body-Ende, seedet Steuerelemente **und** Feldwerte |
| `main.js` | `bootStep`-Kette: wann welcher Pfad läuft |
| `settings.js` | zweiter Schreiber von `data-layout` / `data-marks` / Radios |
| `draft-manager.js` | zweiter Restore-Pfad: Felder, Schalter, `data-quelle` |
| `persistence.js` | `STORAGE_KEYS`, Entwurfsformat, Export/Import |
| `index.html` | die Defaults im Markup (`checked` auf Form B, Schalter) |
| `sidebar.css` | 22 `:checked`-Selektoren (Segment-Schalter) |
| `sheet-common.css`, `sheet-multipage.css` | 8 `:checked`-Selektoren für Blatt-Sichtbarkeit |
| `fouc-messungen.txt` | **Messwerte**: Zeitachsen und die Zählung der doppelten Wahrheiten |

## Der Befund in einem Satz

Derselbe Zustand existiert **dreimal** — `localStorage`, `<html data-…>` und
Formular-Control — mit **zwei** Restore-Pfaden und CSS, das teils auf
Attribute, teils auf `:checked` hört. Vier Runden FOUC an einem Tag kamen
genau aus dieser Doppelung.

Die gemessenen Zeitachsen (siehe `fouc-messungen.txt`) zeigen:
- erster Frame leer, Werte 5–90 ms später (Pfad B nach dem Paint),
- Schalter im ersten Frame falsch, weil der Seeder `'true'` statt `true` prüfte,
- Form-Pille falsch, weil die CSS-Position an `:checked` hing, das erst am
  Body-Ende gesetzt wird.

## Deine Aufgaben

1. **Ist-Zustand als Matrix.** Für jeden Zustand (Briefform, Falzmarken,
   Anlagen, Fußzeile, Postvermerk, alle Feldwerte, Theme, Schrift, Layout):
   Wo liegt er, wer schreibt ihn, wer liest ihn, wann (vor/nach Paint)?
   Markiere jede Stelle, an der zwei Schreiber dasselbe Feld anfassen.
2. **Fehlermodi.** Welche Reihenfolge kann sichtbar falsch werden? Nenne die
   konkreten Fälle (Profil leer, Entwurf älter als Schema, Undo/Reset,
   Import, mehrere Tabs, `prefers-reduced-motion`, Drucken direkt nach dem
   Laden). Belege mit den Messwerten, wo möglich.
3. **Zielbild.** Entwirf den kleinsten Aufbau, in dem jeder Zustand **genau eine**
   Wahrheit hat, und begründe die Richtung:
   - **A)** `<html data-…>` ist die Wahrheit; CSS liest nur Attribute;
     Controls sind reine Eingabegeräte; ein Setzer pro Zustand.
   - **B)** `localStorage` ist die Wahrheit; ein Loader am Body-Ende füllt
     DOM + Attribute; `settings.js`/`draft-manager.js` setzen beim Laden nichts.
   - **C)** etwas Drittes — wenn ja, warum.
   Sag ausdrücklich, was **kein JS** braucht (reines CSS), was in den `<head>`
   gehört und was ans Body-Ende.
4. **Migrationsplan.** Kleinste Schritte, jeder einzeln prüfbar:
   Datei → Änderung → wie man den Schritt widerlegt (Messung/Test). Nenne die
   31 `:checked`-Selektoren als Arbeitspaket, aber sag auch, welche davon
   **bleiben dürfen** (Control-Optik vs. Blatt-Verhalten).
5. **Sicherheit.** Wo kann ein Zustand aus `localStorage` ungeprüft in DOM oder
   CSS landen? (Attribut-Whitelists, `data-*`-Injektion, HTML im Entwurf.)
   Was muss validiert werden, bevor es in ein Attribut oder `innerHTML`-Ersatz
   geht?
6. **Beweisverfahren.** Ein Messprotokoll, das „kein FOUC" nachweist und in
   ~10 s läuft (kein Screenshot, keine Bild-Token): welche Werte, zu welchem
   Zeitpunkt, gegen welche Referenz.

## Form deiner Antwort

- Kurz. Keine Zusammenfassung der Dateien — ich kenne sie.
- Jede Behauptung mit Beleg: Datei + wörtliches Zitat oder Messwert aus
  `fouc-messungen.txt`. Ohne Beleg: als **ungeprüft** markieren.
- Am Ende drei Blöcke:
  1. **Matrix** (Zustand × Darstellung × Schreiber × Zeitpunkt),
  2. **Zielbild** (A/B/C mit Begründung, was CSS-only bleibt),
  3. **Schritte** (nummeriert, je mit Gegenprobe).

## Was du NICHT tun sollst

- Kein Framework, kein Build, keine npm-Abhängigkeit vorschlagen.
- Kein Service Worker, kein „einfach alles in einen Store" (Redux & Co.).
- Keine Screenshots als Beweis fordern — Zahlen reichen.
- Keine Bewertung von Modulen, die nicht dabei sind (`address.js`,
  `salutation.js`, `font-feature.js`): „fehlt" ist kein Befund.
