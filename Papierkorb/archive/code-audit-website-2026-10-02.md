---
id: code-audit-website-2026-10-02
title: Code-Audit website/ — 2026-10-02
status: archived
type: reference
created: '2026-10-02'
updated: '2026-10-02'
tags:
- din-briefneo
- meta
- audit
- governance
doc_links:
- '[[AGENTS]]'
- '[[Immutable-Law-Catalog]]'
- '[[ADR-JS]]'
- '[[DECISION-LOG]]'
code_links:
- 'website/js/53-metadata.js'
- 'website/js/41-salutation-engine.js'
- 'website/js/main.js'
depends_on: []
supersedes: []
---

# Code-Audit `/website` — Struktur & Code-Qualität

**Datum:** 2026-10-01 · **Umfang:** `website/` (index.html, 9 CSS, 18 JS, ~6.000 LOC)
**Modus:** Nur Analyse, keine Änderungen am Code vorgenommen.
**Leitplanken berücksichtigt:** `AGENTS.md`, Immutable Law Catalog (keine Frameworks/Build-Tools, OKLCH-only, native APIs statt JS, Surgical Changes, Fitness-Gate 100 %).

---

## 0. Gesamtbild

Der Code ist für ein Vanilla-Projekt überdurchschnittlich diszipliniert: klare Nummerierungs-Konvention der Module (`0x` Core, `3x` UI, `4x` Features, `5x` State), `@ts-check` überall, JSDoc-Typen, Private-Fields (`#`), echte Trennung von Sanitizing (`04-sanitize.js`) und Konsumenten, CSP ohne `unsafe-inline`, keine Legacy-Date-API. Es gibt **keine** gravierenden Architekturfehler.

Die Optimierungspotenziale liegen in drei Mustern:
1. **Mehrere Owner für denselben Zustand** (Settings, Draft-Restore, Postvermerk).
2. **Wiederholte DOM-/Daten-Primitiven** ohne gemeinsames Utility (gzip-Fetch, Feld-Listen, Dateinamen-Normalisierung).
3. **Harte ID-Kopplung** zwischen 18 Modulen und `index.html` (ca. 80 `getElementById`-Aufrufe über 16 Dateien).

Priorisierung unten: **P1** = echter Defekt-/Wartungsrisiko, **P2** = klare Qualitätsverbesserung, **P3** = Kosmetik.

---

## 1. Befunde JavaScript

### P1-1 — Doppelte Namens-Logik in `53-metadata.js` (echte Inkonsistenz)
`buildLetterFileName()` und `MetadataService.prepare()` berechnen dieselben vier Werte (lastName, recipientName, subjectClean, dateStr) **zweimal, mit abweichender Logik**:

```js
// buildLetterFileName()  — Zeile 24
.split(/[•,]/)[0]           // splittet auf Bullet UND Komma
// prepare()               — Zeile 36
.split(',')[0]              // splittet nur auf Komma  ← Grok-Bug-6-Fix fehlt hier
```

Folge: PDF-Metadatum `author` kann `M.Name•Straße•Ort` enthalten, während der Dateiname korrekt `M.Name` hat. `prepare()` ruft `buildLetterFileName()` bereits auf — die vier Felder sollten aus **einer** Funktion kommen (z. B. `collectLetterIdentity()` die `{dateStr, lastName, recipientName, subjectClean, fileName}` liefert). Spart ~12 Zeilen und schließt den Drift.

### P1-2 — Drei unabhängige Settings-Leser
`StorageManager.loadSettings()` wird in `02-settings-manager.js` (1×) und `41-salutation-engine.js` (2×: Konstruktor *und* `init()`) gerufen; zusätzlich parsen `boot-theme.js` und `boot-state.js` `din_settings` jeweils eigenhändig mit **eigenen Default-Objekten**:

| Ort | Defaults |
|---|---|
| `51-storage.js` | `{theme, layout, guides, formality}` |
| `boot-state.js` | `{theme, layout, formality}` — `guides` fehlt |
| `boot-theme.js` | `{theme}` |

`SalutationFeature` hält damit eine **zweite Kopie** des Settings-Objekts und schreibt sie per `StorageManager.saveSettings(this.settings)` zurück — wenn `SettingsManager` zwischenzeitlich `guides` geändert hat, kann die Salutation-Kopie das überschreiben (Last-Write-Wins auf veraltetem Snapshot). Empfehlung: `SalutationFeature` bekommt die Instanz von `SettingsManager` injiziert (wie es `SignatureFeature` über `sigContext` bereits korrekt macht) statt eigener `loadSettings()`.

### P1-3 — Postvermerk hat zwei Sync-Owner
`main.js:syncPostvermerkFromSidebar()` und `boot-state.js:applyPv()` implementieren dieselbe Regel („nur füllen wenn leer") in zwei Sprachen, plus `boot-state.js` registriert **zusätzlich** `input`- *und* `change`-Listener am Select, während `main.js` noch einen dritten `change`-Listener anhängt. Bei einer Select-Änderung laufen also drei Handler. Die Kommentare dokumentieren das Problembewusstsein, lösen es aber nicht. Konsolidierung: Boot-Script setzt nur den Initialwert, Listener-Besitz liegt ausschließlich bei `main.js`.

### P2-1 — `querySelectorAll('[contenteditable]')` an 4 Stellen mit je eigener Ausnahme-Logik
`01-draft-manager.js` (2×), `03-ui-protections.js`, `main.js`. Jede Stelle kennt Sonderfälle als String-Literale:
- `id === 'datum'` → überspringen (3× dupliziert)
- `id === 'text' || id === 'anlagen-text'` → HTML statt Text (3× dupliziert, auch in `boot-state.js`)
- `multiLineIds` / `maxTwoLinesIds` als separate Arrays in `03`

Das ist die **brüchigste Stelle des Projekts**: ein neues Rich-Text-Feld muss an 4–5 Orten eingetragen werden. Vorschlag (null neue Abhängigkeiten, KISS-konform): deklarative Markierung direkt im HTML, z. B. `data-feld="rich"` / `data-feld="single"` / `data-feld="zweizeilig"` / `data-feld="fluechtig"` (für `datum`), und ein kleines `fields.js` mit `forEachField()`. Damit wird HTML zur Single Source of Truth und die Listen verschwinden aus 4 Modulen. Das entspricht exakt der Projektdoktrin „deklarativ vor imperativ".

### P2-2 — gzip-Fetch-Pipeline dreifach kopiert
Identischer 8-Zeiler (`fetch` → `DecompressionStream('gzip')` → `new Response(stream).text()` → `JSON.parse`) in `45-address-intelligence.js` (2×) und `41-salutation-engine.js` (1×), jeweils mit eigenem `try/catch`-Dialekt. Ein `fetchGzipJson(path)`-Helper (ca. 10 Zeilen, z. B. in einem `05-gzip.js`) ersetzt ~35 Zeilen und vereinheitlicht das Fehlerverhalten.

### P2-3 — Tote `file://`-Pfade
`45-address-intelligence.js` und `41-salutation-engine.js` verzweigen auf `window.location.protocol === 'file:'` und `45` lädt dann per Dynamic Import das 164-KB-Base64-Embed (`data/plz-embedded.js`). Laut README/AGENTS läuft die App aber **ausschließlich** über einen lokalen Webserver (ES-Modules + CSP machen `file://` unmöglich). Der Fallback ist damit unerreichbarer Code — und `plz-embedded.js` ist mit Abstand die größte Datei im Repo. Entscheidung nötig: entweder `file://`-Support offiziell streichen (dann ~170 KB + Fallback-Zweige weg) oder die Doktrin nachziehen. Aktuell widersprechen sich Code und Dokumentation.

### P2-4 — Caret-Utilities ohne Heimat
Range-/Selection-Manipulation existiert in `01-draft-manager.js` (`#getCaretCharacterOffsetWithin`, `#setCaretPosition`, rekursiver Node-Walk), `03-ui-protections.js` (`#placeCaretIn`, Paste-Insert) und `45-address-intelligence.js`. Der manuelle Node-Walk in `#setCaretPosition` (ca. 40 Zeilen) lässt sich mit nativem `document.createTreeWalker(elem, NodeFilter.SHOW_TEXT)` auf ~12 Zeilen reduzieren — native API statt handgeschriebener Rekursion, genau im Sinne von A49.

### P2-5 — `setTimeout(…, 100)` vor `window.print()`
`main.js:100` wartet blind 100 ms, damit injizierte `<meta>`-Tags wirksam werden. Robuster und ohne Magic Number: `requestAnimationFrame` doppelt verschachtelt, oder — sauberste Variante — `MetadataService.restore()` an das native `afterprint`-Event hängen statt an einen Timer. Aktuell wird bei einem langsamen Druckdialog potenziell zu früh restauriert.

### P2-6 — `_updateDocumentTitle()` kollidiert mit `MetadataService`
`DraftManager._updateDocumentTitle()` setzt `document.title = betreff` bei **jedem** Autosave. `MetadataService.prepare()` sichert `oldTitle` und setzt den Dateinamen. Tippt der Nutzer während offenem Druckdialog (möglich bei „Als PDF speichern"), überschreibt der Autosave den Dateinamen-Titel. Zwei Owner für `document.title` — zusammenführen.

### P3-1 — Namenskonvention uneinheitlich
Innerhalb derselben Klassen mischen sich `#private` (`01`, `03`), `_underscore` (`01._updateDocumentTitle`, `41._wireFormality`, `53._injectMetaTags`) und public. Da `#`-Felder bereits genutzt werden, sollte `_`-Prefix konsequent nach `#` migrieren (rein mechanisch, kein Verhaltensrisiko).

### P3-2 — `catch (e) {}` schluckt alles
`boot-theme.js` und `boot-state.js` enden je in einem leeren Catch über das **gesamte** Script. Ein Tippfehler im Boot-Restore ist dadurch unsichtbar — inklusive Draft-Verlust-Szenarien. Minimal: `catch (e) { console.warn('[boot] …', e); }`. Kostet nichts, bricht nichts, macht Boot-Fehler auditierbar (passt zur bestehenden `ariaNotify`-Fehlerdoktrin in `01`).

### P3-3 — 21 `console.*`-Aufrufe ohne Konvention
Mischung aus `console.error` (Storage), `console.warn` (Toast, AddressIntelligence) und stummen Catches. Für eine Offline-App ohne Telemetrie ist Logging legitim — aber ein einheitliches Präfix (`[DIN-BriefNEO/<Modul>]`) würde das Debugging in der DevTools-Konsole deutlich erleichtern; derzeit sind die Präfixe nur teilweise gesetzt.

---

## 2. Befunde HTML

### P2-7 — Sieben ungenutzte IDs
In `index.html` vergeben, aber weder in JS noch CSS referenziert:
`btn-confirm-import`, `btn-confirm-reset`, `btn-style-casual`, `btn-style-formal`, `btn-style-polite`, `seitenleiste-ai-switch-row`, `zwischenablage-anschrift-wrapper`.

**Wichtig:** die drei `btn-style-*` sind **nicht** wirklich tot — `41-salutation-engine.js:_applyUIState()` baut sie dynamisch per Template-String (`` `btn-style-${this.settings.formality}` ``). Genau deshalb finden statische Suchen sie nicht, und genau deshalb ist das Muster riskant: ein Umbenennen in HTML bricht die App stumm. Die übrigen vier können entfernt werden.

### P3-4 — Architektur-Kommentare als Code-Ballast
Fünf große „🛡️ BLEEDING EDGE ARCHITECTURE GUARD"-Blöcke stehen wortgleich doppelt: einmal in `index.html`, einmal im zugehörigen JS-Modul (Plaintext-Engine, Popover-Toast). Das sind ~60 Zeilen Redundanz, die bei Änderungen auseinanderlaufen. Empfehlung: Guard-Text **einmal** im Modul, im HTML nur ein Einzeiler-Verweis (`<!-- Guard: siehe js/03-ui-protections.js -->`). Die Schutzwirkung für künftige LLMs bleibt erhalten, die Drift-Gefahr sinkt.

### P3-5 — Postvermerk-Optionen hartcodiert
13 `<option>`-Werte im HTML; `din-postvermerk` ist gleichzeitig frei editierbar. Keine Validierung, keine gemeinsame Liste mit evtl. späterer Prüflogik. Unkritisch, aber eine `data`-getriebene Liste wäre konsistenter mit dem Rest.

---

## 3. Befunde CSS

### Positiv
`@layer`-Architektur sauber, 53 OKLCH-Farbangaben, **null** Hex/RGB/HSL-Verstöße (geprüft, einziger Treffer ist das Favicon-SVG im `data:`-URI — das ist zulässig, da SVG-Attribut, nicht CSS). Semantische Tokens in `variables.css`.

### P2-8 — 37× `!important`
Verteilung: `print.css` 18, `floating.css` 7, `reset.css` 5, `signature.css` 4, `sidebar.css` 2, `layout.css` 1.
In `print.css` sind sie vertretbar (Druck muss gewinnen), aber das Projekt nutzt bereits `@layer` — und Layers lösen Spezifitätskonflikte **per Design**. Die 12 `!important` außerhalb von `print.css` sind starke Indizien für fehlende oder falsch geordnete Layer-Zuweisungen (`signature.css` und `floating.css` liegen in unterschiedlichen Layern, kämpfen aber um dieselben Elemente). Empfehlung: diese 12 einzeln prüfen und durch korrekte Layer-Einordnung ersetzen.

### P2-9 — `.segmented-control` mit 13 Regelblöcken über mehrere Dateien verstreut
Das Muster taucht als Selektor-Präfix 13× auf. Zusammen mit `.save-status` (7×) und `.unterschriftsbild-*` (5+5+2) sind das drei Komponenten, deren Regeln nicht räumlich zusammenliegen. Da es keinen Build-Step gibt, ist Datei-Kohäsion die einzige Organisationsebene — eine `components.css` (oder Verschieben in die jeweils thematisch zuständige Datei) würde das Auffinden deutlich verbessern.

### P3-6 — 59 hartcodierte `mm`-Werte in CSS, parallel zu 17 `data-*-mm/y`-Attributen am `<din-a4>`
Die DIN-Geometrie existiert **zweimal**: als Data-Attribute im HTML und als Zahlen im CSS. Wenn die Data-Attribute die Quelle sein sollen (so liest es sich), sollten die CSS-Regeln über `attr()` mit Typ (`attr(data-datum-y-b type(<length>))`, Chrome 133+, passt zur Baseline 150+) darauf zugreifen, statt die Werte zu spiegeln. Das ist der größte verbliebene „Magic Number"-Cluster im Projekt — und ein echter Kandidat für „native CSS statt Duplikation".

---

## 4. Empfohlene Reihenfolge

| # | Maßnahme | Aufwand | Risiko | Nutzen |
|---|---|---|---|---|
| 1 | P1-1 Metadata-Namenslogik zusammenführen | klein | sehr gering | behebt realen Bug |
| 2 | P3-2 leere Catches loggen | winzig | keins | Debugbarkeit |
| 3 | P1-2 Settings-Owner konsolidieren (Injection in `SalutationFeature`) | mittel | gering | behebt Race |
| 4 | P1-3 Postvermerk-Listener entdoppeln | klein | gering | weniger Handler |
| 5 | P2-2 `fetchGzipJson()`-Helper | klein | gering | −35 LOC |
| 6 | P2-6 `document.title`-Owner vereinheitlichen | klein | gering | behebt Edge-Case |
| 7 | P2-5 `afterprint` statt `setTimeout(100)` | klein | gering | Robustheit |
| 8 | P2-1 Felder deklarativ per `data-feld` | **groß** | mittel | größter Struktur-Gewinn |
| 9 | P2-4 TreeWalker statt Rekursion | mittel | mittel | −30 LOC, nativ |
| 10 | P2-8 die 12 Nicht-Print-`!important` auflösen | mittel | mittel | Layer-Hygiene |
| 11 | P2-3 Entscheidung `file://`-Fallback | — | — | ggf. −170 KB |
| 12 | P3-6 `attr()`-Geometrie | groß | hoch | Doktrin-Konsistenz |

Punkte 1–7 sind „surgical" im Sinne von AGENTS.md §2 und je einzeln mit Fitness-Gate durchführbar. Punkt 8 und 12 wären Full-Mode-Vorhaben mit `specs/`-Ordner und ADR.

---

## 5. Was ich bewusst *nicht* beanstande

- Der `enforceLineLimits`-Keydown-Guard in `03` (als „JS wo CSS reichen würde" verdächtig) — die Kommentare belegen empirisch, dass `plaintext-only` LF durchlässt. Korrekt begründet, bleibt.
- Der eigene Undo-Stack in `01` statt nativem Undo — `replaceChildren` zerstört die native History. Korrekt.
- `sanitizeRichText` statt `setHTML()` — dokumentiert, dass Chrome 151 dabei `class` streift. Korrekt.
- Die Guard-Kommentare als Konzept — sie funktionieren nachweislich (ich hätte ohne sie mehrere davon „wegoptimiert"). Nur die Verdopplung HTML↔JS ist das Problem, nicht ihre Existenz.
