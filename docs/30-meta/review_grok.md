# review_grok.md

**Stand:** 2026-09-04  
**Autor:** Grok (xAI)  
**Scope:** `website/` auf `main`  
**Live:** https://grapefruit89.github.io/DIN-BriefNEO/  
**Quelle:** https://github.com/grapefruit89/DIN-BriefNEO/tree/main/website  
**Status:** Review, kein Patch, kein Produkt-Refactor

---

## 1. Gesamtbild

```text
website/
├── index.html          ~24 KB   HTML-SSoT + Hydration
├── css/                5 Dateien, Layer-Modell bleibt
├── js/                 nummerierte Module + addons/
└── data/               Brotli-PLZ + Embedded-Fallback
```

Die alte Schichtlogik ist noch da und das ist gut.

| Bereich | Urteil |
|---|---|
| Vanilla / Zero-Build | hält |
| HTML → CSS → JS | weitgehend gehalten |
| Temporal statt `Date` | gehalten |
| DIN-`data-*` am Papier | gehalten |
| `customElements.define()` | weiterhin nicht im Produktpfad |
| `48-text-fit.js` | weg, durch native CSS ersetzt |
| `33-postvermerk.js` | weg |
| Datumsformat-Radios | weg |

Das Produkt ist wieder da. Die Richtung ist schärfen, nicht neu erfinden.

---

## 2. Was besser geworden ist

### 2.1 Datum ist jetzt einfach

`website/js/47-date-format.js` setzt einmal die Langform
`dd. Monat YYYY` über `Temporal.Now.zonedDateTimeISO('Europe/Berlin')`.

Der Draft speichert und restauriert `#datum` nicht mehr.
Das war der Kernfehler der alten Datums-UI.

### 2.2 JS-Kill Phase 1 ist fachlich glaubwürdig

Native CSS übernimmt Textfit und Theme-Darstellung:

- `field-sizing: content`
- `text-fit`
- `text-wrap: pretty` / `balance`
- `light-dark()`
- Container Queries

Genau dafür sollte `48-text-fit.js` sterben.

### 2.3 Adress-Stack ist ein echter Produktgewinn

- `45-address-intelligence.js` + `website/data/*.json.br` + Embedded-Fallback
- `46-clipboard-address-parser.js`
- Geoapify bleibt optional

Das ist komplexe Logik, die JS verdient. Offline-first passt zur Constitution.

### 2.4 Sidebar ist aufgeräumt

Ein Theme-Button statt Hell/Dunkel-Radios, Guides als Switch,
Postvermerk-Select in der Sidebar, Anlagen als Button. Weniger Chrome.

### 2.5 `din-*`-Schnittmenge ist fast kanonisch

Instanzierte Tags im Markup (Auswahl):

`din-a4`, `din-falz-oben`, `din-falz-unten`, `din-lochmarke`,
`din-rucksendezeile`, `din-anschriftfeld`, `din-postvermerk`,
`din-empfaenger-firma`, `din-empfaenger-strasse`, `din-empfaenger-ort`,
`din-infoblock`, `din-absender-strasse`, `din-absender-ort`,
`din-absender-tel`, `din-absender-mail`, `din-datum`, `din-kern`,
`din-betreff`, `din-anrede`, `din-text`, `din-grussformel`,
`din-unterschrift`, `din-anlagen`, `din-fuss`

Das entspricht dem eingefrorenen Modell:

```text
Registry = vollständiger Baukasten
HTML     = konkrete Schnittmenge
```

---

## 3. Befunde nach Schärfe

### Rot — widersprüchliche Oberflächen

#### Postvermerk hat zwei Wahrheiten

Sidebar-`<select id="sidebar-pv-select">` ist die Steuerung.
Auf dem Papier ist `<din-postvermerk>` trotzdem `contenteditable`.

Drei Schreiber:

```text
Select  →  syncPostvermerkFromSidebar()
Toggle  →  checked, wenn Select einen Wert hat
Feld    →  User kann den Text frei überschreiben
```

Das bricht die Regel „Einstellungen nur in der Sidebar, Papier ist Dokument“.

Ziel: ein Schreiber. Entweder Feld nur Anzeige, oder Select nur Vorschlag.

#### SettingsManager spricht UI an, die im HTML fehlt

In `02-settings-manager.js` noch verdrahtet, in `index.html` nicht mehr:

- Theme-Dimmer (`themeDimmer`, `themeDimmerValue`)
- Copy-Tokens-Button

Kein Crash, aber tote Kopplung.
Entweder Dimmer wieder in die Sidebar, oder die JS-Pfade raus.

#### `btn-dev-mode` lebt ohne Dev-Tools-Modul

`54-dev-tools.js` ist weg. Der Button steht noch da und zeigt ein hartes Datum
(`04.09.2026`). Entweder echter Git-Build-Stamp oder Button entfernen.

### Orange — Semantik / SSoT

#### Zwei generische Namens-`div`s

- `#empfaenger-name`
- `#info-name`

Das darf keine neuen Atome `din-empfaenger-name` / `din-absender-name` erzeugen.
Sie sind aber die einzigen fachlichen Felder ohne `<din-…>`-Tag.

Kompositionsregel sichtbar dokumentieren (Vorname + Nachname als eine Zeile)
oder ein vorhandenes Atom als Träger nutzen. Nicht halb-halb.

#### Doppelte Hydration

Inline-Script stellt Draft + Radios + Postvermerk her.
Danach macht `DraftManager.loadDraft()` denselben Restore noch einmal.

Funktioniert, ist aber zwei Wahrheiten. Ein Pfad reicht.

#### CSS-Leichen

`layout.css` / `floating.css` tragen noch:

- `#postvermerk-dropdown`
- `din-verteiler`
- widersprüchliches `display` am Postvermerk-Select

Nach JS-Kill Phase 2 gehört das auf die CSS-Kill-Liste.
Keine Geometrie ändern.

### Gelb — Architekturspannung

#### `website/data/` + `plz-embedded.js` (~135 KB)

Fachlich richtig (Offline). Architektonisch heikel:
generiertes Artefakt im Produktordner.

Entweder klar als Runtime-Asset akzeptieren oder die Pipeline
als einzigen Schreiber benennen. Zero-Build heißt kein Bundler,
nicht „es gibt keine generierten Dateien“.

#### AI-Addon

`js/addons/ai-assistant.js` ist opt-in, on-device, kein CDN.
Das verletzt nicht A38. Es verletzt die Stimmung
„so wenig JS wie möglich“, sobald der Toggle zur Default-Erwartung wird.

Als Addon in Ordnung. Nicht nach `main.js` ziehen.

#### Theme: drei Systeme gleichzeitig

```text
data-theme="auto|light|dark"
color-scheme / light-dark()
--theme-dim   (JS, ohne Slider im HTML)
```

`applyTheme('dark')` setzt Dimmer hart auf 1.
Auto + Dimmer + `light-dark()` werden sich beißen,
sobald der Slider wieder eingebaut wird.

---

## 4. Bewusst nicht anfassen

- Keine neue Ordnerarchitektur (`components/`, `core/`, …)
- Nummerierte JS-Dateien behalten
- DIN-Millimeter nicht aus HTML nach CSS/JS ziehen
- Keine 46./47. Registry-Atome für kombinierte Namen
- `contenteditable="plaintext-only"` auf Textfeldern behalten
- Native `<dialog>`, `popover`, `commandfor` behalten
- Chrome-Baseline nicht in `website/` neu erfinden

---

## 5. Fitness-Bild

| Check | Stand |
|---|---|
| Seite lädt wieder | ja |
| `Date` im Website-JS | nicht gesehen |
| `customElements.define` | nicht als Produktpfad |
| Datum immer heute Langform | vorgesehen, Draft interferiert nicht mehr |
| A4-Geometrie als `data-*` | ja |
| Text-Fit ohne JS-Loop | ja |
| Steuerung nur Sidebar | fast — Postvermerk-Feld ist die Ausnahme |
| Tote IDs JS↔HTML | Dimmer / Copy / Dev-Tools |
| CSS-Leichen | ja, wenige, aber echte |
| Live-Sidebar / Viewport | lokal gegen `100dvh` prüfen |

---

## 6. Nächste Schnitte — Reihenfolge

1. **Postvermerk eindeutig machen**  
   Papierfeld nicht editierbar, nur Anzeige des Select-Werts. Ein Schreiber.

2. **JS an tatsächliches HTML anbinden**  
   Dimmer/Copy-Tokens entweder wieder in die Sidebar oder aus
   `02-settings-manager.js` löschen. `btn-dev-mode` entscheiden.

3. **Hydration auf einen Pfad**  
   Inline *oder* `DraftManager.loadDraft()`, nicht beides mit gleicher Semantik.

4. **CSS-Kill der toten Selektoren** in `layout.css` / `floating.css`  
   Kein Refactor der Geometrie.

5. **Namenszeilen** als dokumentierte Komposition stehen lassen,  
   nicht in neue Tags zwingen.

Danach erst wieder Catalog/Foundation.
Der Code ist der Foundation inzwischen voraus — das ist okay,
solange Dokumente und Brief nicht gegeneinander verbogen werden.

---

## 7. Urteil in einem Satz

Die Überarbeitung ist ein klarer Gewinn.
Was noch fehlt, ist nicht große Architektur, sondern drei ehrliche
Source-of-Truth-Schnitte: Postvermerk, Settings-UI, Hydration.
