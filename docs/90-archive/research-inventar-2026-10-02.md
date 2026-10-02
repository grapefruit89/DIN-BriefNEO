---
id: research-inventar-2026-10-02
title: Inventar research/ — was ist umgesetzt, was ist noch Gold wert
status: archived
type: audit-report
created: '2026-10-02'
updated: '2026-10-02'
tags:
- din-briefneo
- meta
- audit
- research
doc_links:
- '[[BACKLOG]]'
- '[[DECISION-LOG]]'
- '[[Immutable-Law-Catalog]]'
code_links:
- 'website/js/43-geoapify.js'
- 'website/css/print.css'
depends_on: []
---

# Inventar `research/` — 2026-10-02

**Anlass.** Backlog-Posten B10 lautete „`research/` auslagern (1,1 MB)". Der Posten
war als Aufräumarbeit formuliert, ohne dass jemand hineingesehen hatte. Auf
Nachfrage des Projektinhabers wurde der Ordner zuerst **inhaltlich** erschlossen.
Ergebnis: Der Posten war in seiner bisherigen Form falsch gestellt.

## 1. Was der Ordner wirklich enthält

86 Dateien, 1,1 MB. Die Größenangabe führt in die Irre:

| Anteil | Inhalt |
|---|---|
| **476 KB (43 %)** | zwei SVGs: `DIN_5008,_Form_A.svg`, `DIN_5008_Form_B.svg` — die **Normgeometrie** |
| ~250 KB | 23 Python-Skripte: PLZ-Pipeline, Gender-Datensatz, Impressum-Testkorpus |
| ~230 KB | 39 Markdown-Dokumente: Roadmaps, UX-Spezifikationen, Provider-Benchmarks |
| Rest | Testergebnisse (JSON), Browser-Feature-Audit, Prototypen (`.js`) |

Es sind keine Wegwerfnotizen, sondern **Vorarbeit mit Entscheidungscharakter**.

## 2. Umsetzungsstand der 14 CSS-Features (`CSS_SNIPPETS_REFERENCE_2026.md`)

Gemessen gegen `website/css/` und `website/index.html`:

| # | Feature | Status |
|---|---|---|
| 1 | `field-sizing: content` | **umgesetzt** (`layout.css`, `sheet.css`) |
| 2 | `text-box-trim` / `text-box-edge` | offen — Nutzen aber **verfallen**, siehe 4. |
| 3 | `light-dark()` | **umgesetzt** (`variables.css`) |
| 4 | `color-mix()` | **umgesetzt** (3 Dateien) |
| 5 | `@starting-style` | **umgesetzt** (`floating.css`) |
| 6 | `interpolate-size` | **umgesetzt** (`variables.css`) |
| 7 | Anchor Positioning | **umgesetzt** (3 Dateien) |
| 8 | `text-wrap: balance/pretty` | **umgesetzt** |
| 9 | `@page` Margin Boxes, `counter(page)` | **offen** |
| 10 | `::highlight()` | **offen** |
| 11 | `@property` | **umgesetzt** (`variables.css`) |
| 12 | `subgrid` | **offen** |
| 13 | `font-display` / `font-width` | offen — gegenstandslos, siehe 4. |
| 14 | `@view-transition` | **umgesetzt** (`layout.css`) |

**9 von 14 erledigt.** Die JS- und HTML-Roadmaps (`roadmap_js_details.txt`,
`roadmap_html_details.txt`) sind in gleichem Maße abgearbeitet: `switch`,
`plaintext-only`, Popover-Toast, Invoker-Buttons, `appearance: base-select` —
alles im Code. `research/` ist also überwiegend eine **erledigte** Roadmap.

## 3. Der eigentliche Fund: drei UX-Spezifikationen sind NICHT umgesetzt

Und zwar genau die, die das heutige Verhalten als Fehler beschreiben.

### 3.1 `ADAPTIVE_DROPDOWN_THRESHOLD_SPEC.md` + `ZERO_CLICK_UNIQUE_AUTOCOMPLETE_UX.md`

Die Spezifikation fordert eine **3-Zonen-Logik**:

- Zone 1 (> 5 Treffer): **kein** Dropdown, nur Status „50 Treffer — bitte PLZ tippen"
- Zone 2 (2–5 Treffer): Liste anzeigen
- Zone 3 (genau 1 Treffer): **Zero-Click-Autofill**, ohne Klick und ohne Enter

Der Code tut das Gegenteil. `website/js/43-geoapify.js`:

```js
renderSuggestions(combined.slice(0, 6), query);
```

Es werden stur „die ersten 6" gezeigt — exakt das Verhalten, das die
Spezifikation als „völlig willkürliche Auswahl" und „flackerndes UI-Rauschen"
verwirft. Weder Zonen noch Eindeutigkeitserkennung noch Ghost-Text existieren.

### 3.2 Zusätzlich entdeckt: das Dropdown ist nicht mit der Tastatur bedienbar

In `renderSuggestions()` hängt ausschließlich ein Maus-Listener:

```js
li.addEventListener('click', () => { selectSuggestion(item); });
```

Kein `keydown`, kein `ArrowDown`, kein `role="listbox"`/`role="option"`,
kein `aria-activedescendant`. Wer die Maus nicht benutzen kann oder will,
kann keine Adresse übernehmen. Das ist **unabhängig von der Spezifikation**
ein Mangel und wiegt schwerer als jeder der 14 CSS-Punkte.

### 3.3 `SMART_FORM_BIDIRECTIONAL_ORCHESTRATION.md`

Konzept für Top-Down- (Straße zuerst) und Bottom-Up-Eingabe (PLZ zuerst).
Nicht umgesetzt; baut auf 3.1 auf und ist ohne diese sinnlos.

## 4. Was im Research **verfallen** ist (bewusst nicht nachziehen)

Belege dafür, dass Research altert und nicht blind umgesetzt werden darf:

- **`text-box-trim` (#2)** verspricht, „15+ ungenaue `calc()`-Hacks" abzulösen.
  Gezählt: in `layout.css` + `sheet.css` stehen noch **3** `calc()`. Die Hacks
  wurden längst anders beseitigt. Der Nutzen ist weitgehend abgetragen; der Rest
  gehört fachlich zu Backlog **B7** (`attr()`-Geometrie) und trägt dessen Risiko.
- **`font-display: swap` (#13)** zielt auf `@font-face`. Die eigene Schrift wird
  aber über die **FontFace-API** in `boot-theme.js` geladen (CSP-Härtung H4) —
  ein `@font-face`-Deskriptor hätte dort keine Wirkung.
- **`README.md`** verspricht „~61 % JavaScript-Eliminierung". Das war die
  Ausgangsprognose; der Großteil ist realisiert. Die Zahl als offenes Ziel zu
  lesen, wäre ein Trugschluss.

## 5. Unabhängig vom Research gefundene Härtungslücke

Beim Durchsehen von `43-geoapify.js` fiel auf: **kein einziger `fetch()` hat ein
Zeitlimit.** Der `AbortController` (Z. 152 f.) dient nur dazu, eine ältere
Anfrage durch eine neuere zu ersetzen. `validateKeyWithHeartbeat()` (Z. 72) und
der PLZ-Abruf (Z. 329) laufen ganz ohne Signal. Hängt das Netz, hängt die UI
unbegrenzt. `AbortSignal.timeout()` bzw. `AbortSignal.any()` schließt das.

## 6. Empfehlung zu B10

**B10 in seiner bisherigen Form („auslagern") ist zurückzuweisen.** Begründung:

1. Die zwei DIN-SVGs sind Normreferenz und gehören ins Repository — sie machen
   43 % der beanstandeten Größe aus. 1,1 MB sind für dieses Repository ohnehin
   kein Problem; es gibt kein Platz-, sondern ein Ordnungsproblem.
2. Der Ordner enthält **nicht umgesetzte, wertvolle Spezifikationen** (3.1–3.3).
   Hätte man ihn ungelesen ausgelagert, wäre genau dieses Wissen verschwunden —
   der Fall, vor dem der Projektinhaber gewarnt hat.
3. Der echte Mangel ist, dass `research/` **keinen Statusvermerk** trägt. Man
   sieht keiner Datei an, ob sie erledigt, offen oder verfallen ist.

**Stattdessen:** Statuskennzeichnung je Dokument (`umgesetzt` / `offen` /
`verfallen`) und Überführung der offenen Punkte in den Backlog. Erst danach ist
zu entscheiden, ob Erledigtes nach `docs/90-archive/` wandert. Siehe B10 (neu
gefasst) und B18–B20 im Backlog.
