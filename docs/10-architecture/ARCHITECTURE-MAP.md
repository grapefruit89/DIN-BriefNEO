---
id: architecture-map
title: Architecture-Map — Lade-Trigger, Abhängigkeiten, Kaskade
status: active
type: reference
created: '2026-11-05'
updated: '2026-11-07'
tags:
- din-briefneo
- architecture
- map
- navigation
doc_links:
- '[[STRUCTURE]]'
- '[[ADR-JS]]'
- '[[ADR-DATA-PERSISTENCE]]'
- '[[ADR-EVENT-DRIVEN-ARCHITECTURE]]'
- '[[BACKLOG]]'
code_links:
- 'website/index.html'
- 'website/js/main.js'
- 'website/js/core.js'
- 'website/js/persistence.js'
depends_on: []
supersedes: []
---

# Architecture-Map — Lade-Trigger, Abhängigkeiten, Kaskade

Diese Datei beantwortet drei Fragen, die `docs/STRUCTURE.md` **nicht** beantwortet:
Wann wird eine Datei geladen? Wer hängt von wem ab? In welcher Reihenfolge wirken die Stylesheets?

> [!info] Abgrenzung
> **Dateiliste, ADR/Guide-Zuordnung und Haupt-Exporte:** siehe [[STRUCTURE]] — generiert
> von `tools/build_db.js` und damit immer aktuell. Diese Datei wiederholt das bewusst
> **nicht** (§5.1 „ein Fakt, ein Ort"). Sie ergänzt nur die Laufzeit-Sicht.

## 1. Einstiegspunkte und Lade-Trigger

| Datei | Rolle | Wann geladen | Besonderheit |
| :--- | :--- | :--- | :--- |
| `website/index.html` | Einzelseiten-Editor, **produktiv** | immer | lädt `boot-theme.js` + `boot-switches.js` (beide blockierend) + `main.js` (Modul) |
| `website/multipage.html` | Mehrseiten-Editor, **produktiv** | immer | ~94 % identisch mit `index.html`; eigene Stylesheets, eigener Controller |
| `website/mehrseiten-prototyp.html` | Prototyp | **nicht verlinkt** | liegt live im Auslieferungsordner — siehe [[BACKLOG]] B39 |
| `test/index.html` | Test-Runner (126 Fälle) | nur lokal | braucht einen HTTP-Server, ES-Module laden nicht über `file://` |
| `website/js/boot-theme.js` | Theme- und Stil-Boot | **blockierend, vor First Paint** | klassisches Script, kein Modul: Module sind deferred und kämen zu spät. Setzt `data-theme` **und** `data-style` |
| `website/js/boot-switches.js` | Schalter-Boot (Hilfslinien, Falz-/Lochmarken) | **blockierend, vor First Paint** | klassisches Script im `<head>`: liest `din_settings` und setzt die Checkboxen per `MutationObserver`, sobald sie geparst sind. Microtasks laufen vor dem Rendern — deshalb kein Wettlauf mit dem ersten Frame. Der HTML-Default muss `DEFAULT_SETTINGS` entsprechen |
| `website/js/main.js` | App-Start (Orchestrator) | Modul, deferred | verdrahtet alle Kernmodule; enthält keine Fachlogik |
| `website/addons/testbrief/testbrief.js` | Testbrief-Plugin | **dynamisch** per `import()`, nur bei Klick auf `#btn-testbrief` | Figurendaten liegen im Plugin-Ordner; ohne das Plugin bleibt der Button wirkungslos, die App startet normal |
| `website/addons/webmcp-bridge.js` | WebMCP-Bridge | **gar nicht** | derzeit nicht eingebunden, in [[STRUCTURE]] entsprechend markiert |

> **Dateiliste & Rollen:** `docs/10-architecture/repository.json` ist die
> Single Source of Truth für die Tabelle „Produktionscode" in [[STRUCTURE]].
> `tools/build_db.js` rendert sie von dort und bricht ab, wenn die `@adr`/`@guide`-
> Angaben in der JSON nicht zu den Annotationen in den Dateiköpfen passen.

## 2. Modul-Abhängigkeiten

```
core.js           → (nichts)                    ← Blatt: Konstanten, Events, Toast
persistence.js    → core.js
document.js       → core.js, persistence.js
settings.js       → core.js, persistence.js, binary-storage.js
signature.js      → core.js, binary-storage.js (settings.js nur als Typ)
draft-manager.js  → core.js, persistence.js, document.js (collectDraft, Caret-Helfer)
binary-storage.js → (nichts)                    ← Blatt: Blobs in IndexedDB (A34-Ausnahme)
salutation.js  → core.js, persistence.js
address.js     → core.js, document.js, persistence.js
clipboard-parser.js → core.js, address.js (AddressIntelligence.targetLock, feld, bindListSelection)
main.js        → allen oben; addons/testbrief/testbrief.js (dynamisch, nur bei Klick)
```

`core.js` ist der zirkelfreie Einstieg in die App-Schicht: Es importiert nichts und liefert
`eventBus`, `Events`, `Constants`, `showToast`. `binary-storage.js` importiert ebenfalls
nichts, kennt aber die App nicht — es spricht nur mit IndexedDB.

Zwei häufig gesuchte Einstiegspunkte: `applyLetterDate` liegt in `persistence.js`
(setzt das Briefdatum), `setCaretToEnd` in `document.js` (Cursor-Helfer, den `address.js` nutzt).

> [!warning] Duplikat-Falle: zwei HTML-Rümpfe
> `index.html` und `multipage.html` teilen ~94 % Markup. Gemeinsames Markup muss in
> **beiden** gepflegt werden. Genau daraus entstand der Boot-Block als Kopie, der
> `data-style` nur an einer Stelle setzte.

## 3. CSS-Kaskade

| # | Datei | Gültigkeit | Zweck |
| :--- | :--- | :--- | :--- |
| 1 | `css/base.css` | immer | Reset, Design-Tokens, Systemschrift-Kaskade |
| 2 | `css/sidebar.css` | immer | Seitenleiste, Formulare, Popover |
| 2' | `css/sheet-common.css` | **beide Seiten** | gemeinsame Blatt-Regeln: Typografie der Briefelemente, Inline-Formate, Interaktions-Zustände, Signatur-Overlay, Leer-Zustände |
| 3 | `css/sheet.css` | **nur `index.html`** | nur noch Geometrie/Positionierung (Einzelseite) |
| 3' | `css/sheet-multipage.css` | **nur `multipage.html`** | nur noch `column-count`/Paged-Setup |
| 4 | `css/print.css` | `media="print"` | Drucklayout; `orphans`/`widows`, Umbruchregeln |
| 4' | `css/print-multipage.css` | `media="print"` | ersetzt `print.css` im Mehrseiten-Modus |

Reihenfolge zählt: Spätere Dateien überschreiben frühere bei gleicher Spezifität.
`sheet.css` und `sheet-multipage.css` schließen sich **aus** — eine Seite lädt nie beide;
`sheet-common.css` lädt immer davor. Gemeinsame Druck-Resets (App-Shell verstecken,
Falzmarken, Leer-Zustände) liegen in `base.css` unter `@media print`.

## 4. Daten (zur Laufzeit geladen, nicht im Bundle)

| Pfad | Zweck | Format | Geladen von |
| :--- | :--- | :--- | :--- |
| `website/addons/testbrief/charactere.json` | Figurenkatalog, 303 Figuren | JSON | `addons/testbrief/testbrief.js` (modul-relativ via `import.meta.url`) |
| `website/data/orte.json.gz` | PLZ → Ort, **kanonisch** | gzip-JSON | `js/address.js` |
| `website/data/de_plz_ort.json.gz` | Kompatibilitätskopie von `orte` | gzip-JSON | `js/address.js` (Fallback) |
| `website/data/grosskunden.json.gz` | Großempfänger-Index, **kanonisch** | gzip-JSON | `js/address.js` |
| `website/data/de_grosskunden_plz.json.gz` | Kompatibilitätskopie | gzip-JSON | `js/address.js` (Fallback) |
| `website/data/de_districts.json.gz` | Ortsteile / Zustellbezirke | gzip-JSON | `js/address.js` |
| `website/data/bundesbehoerden.json.gz` | Bundesbehörden (498 PLZ) | gzip-JSON | **kein Laufzeit-Leser** — nur Ausgabe von `tools/build_plz_databases.py` |

Die App bündelt **keine** Daten. Alles kommt per `fetch` aus `website/data/` —
deshalb muss der Ordner beim Deploy mitgehen.

## 4a. Build-Zeit (nicht Laufzeit)

`tools/` enthält Build-Zeit-Skripte; nichts davon läuft im Browser.
Datenquelle der Adressdaten: `tools/build_plz_databases.py` schreibt `data/*.json.gz`
(`orte`, `grosskunden`, `bundesbehoerden`, `de_districts` sowie die
Kompatibilitätskopien `de_*`). Gate, Isolation, Links und IMR liegen ebenfalls dort —
Einzeleinträge in [[STRUCTURE]].

Konsequenz: `bundesbehoerden.json.gz` hat keinen Laufzeit-Leser, weil sie ein
Pipeline-Ergebnis ist, kein Laufzeit-Datum.

## 4b. Tests (nur lokal)

`test/index.html` lädt `test/all.js` (122 Tests). Braucht einen HTTP-Server —
ES-Module laden nicht über `file://`. **Nicht** mit `node test/all.js` aufrufen:
`localStorage` fehlt, die Tests brauchen den Browser.

4 Tests sind vorbestehend fehlgeschlagen — siehe [[BACKLOG]] B40.

## 5. Regeln für den Agenten

1. **Zwei Nachschlagewerke, zwei Zwecke:** [[STRUCTURE]] für Dateien, Exporte und
   ADR-Zuordnung; diese Map für Lade-Trigger, Abhängigkeiten und Kaskade. Nicht doppelt suchen.
2. **Kernmodule sind immer geladen.** Änderungen an `core.js`, `persistence.js`,
   `document.js`, `draft-manager.js`, `settings.js`, `signature.js`, `salutation.js`, `address.js`, `main.js` wirken sofort.
3. **Add-ons nur auf Trigger.** `testbrief.js` wird dynamisch geladen (nur bei Klick);
   `webmcp-bridge.js` wird gar nicht geladen. Vor Änderungen den Trigger-Pfad in `main.js` prüfen.
4. **Debug-Module sind nur mit `?debug=` aktiv** — aber Test-API. Nicht löschen, weil sie
   ohne Query-Parameter ungenutzt aussehen.
5. **CSS in Ladereihenfolge** (`base → sidebar → sheet → print`); `sheet` und
   `print` haben je eine Multipage-Variante, die sich gegenseitig ausschließt.
6. **Gemeinsames Markup doppelt pflegen:** `index.html` und `multipage.html` teilen den
   Rumpf. Nach jeder Änderung an gemeinsamem Markup beide Dateien prüfen.
