# review2_grok.md

**Stand:** 2026-09-04  
**Autor:** Grok (xAI)  
**Ort:** Repo-Root (`main`)  
**Anlass:** Klärung von „JS-Kill Phase 2 — weitgehend da“  
**Bezug:** `research/reasearch_changelog.md` Prio 5, `website/` auf `main`  
**Vorgänger:** `docs/30-meta/review_grok.md`

---

## 1. Was „weitgehend da“ heißen sollte — und warum das ungenau war

Im ersten Review stand Phase 2 als „weitgehend da“.
Das klang nach: *nicht fertig*.

Das war die falsche Formulierung.

**JS-Kill Phase 2, so wie sie im Changelog definiert ist, ist fertig.**

„Weitgehend“ meinte etwas anderes: Neben dem abgehakten Phasen-Soll
liegen noch gemischte Sidebar-Steuerungen, die *nie* Teil der Phase-2-Akzeptanz
waren. Das ist Rest-Inkonsistenz, kein offenes Phase-2-Ticket.

```text
Phase-2-Soll          →  erfüllt
Sidebar-Restchrom     →  nicht Teil von Phase 2
Format-Toolbar-Anchor →  bewusst JS, nicht Phase-2-Scope
```

---

## 2. Phase-2-Soll laut Changelog (Prio 5)

Claim:

- über 175 Zeilen JS weg
- natives `contenteditable="plaintext-only"`
- Toast im Popover-Top-Layer
- semantisches `<input switch>` für Hilfslinien
- Sichtbarkeit über CSS `:has()`
- `z-index: 9999` und manuelle Drag-Listener weg
- Toast-Einblendung über `@starting-style`

Dateien:
`index.html`, `03-ui-protections.js`, `32-toast.js`,
`02-settings-manager.js`, `floating.css`, `layout.css`.

---

## 3. Abgleich Soll ↔ Ist

| Soll | Ist | Urteil |
|---|---|---|
| Hilfslinien = `<input type="checkbox" switch id="btn-guides-switch">` | vorhanden, default checked | **fertig** |
| Guides-Sichtbarkeit per `:has(#btn-guides-switch:checked)` | in CSS verdrahtet | **fertig** |
| Toast `#toast-v4` `popover="manual"` | vorhanden | **fertig** |
| Toast show/hide = `showPopover()` / `hidePopover()` | `32-toast.js` so | **fertig** |
| Kein `z-index: 9999` im HTML | nicht vorhanden | **fertig** |
| `plaintext-only` auf Einzeilern | vorhanden | **fertig** |
| Reset = natives `<dialog>` + `commandfor` / `command="show-modal"` | vorhanden | **fertig** |
| Format-Toolbar = `popover="hint"` + `commandfor` | vorhanden | **fertig** |
| Address-/Clipboard-Listen = `popover="auto"` | vorhanden | **fertig** |
| `03-ui-protections.js` ohne Popover-Display-Hacks | nur Zeilenlimit / Anlagen-Liste | **fertig** |
| KI-Toggle als Switch | `toggle-experimental-ai` ist `switch` | **darüber hinaus da** |

Phase 2 ist kein halber Umbau. Der Kern ist im Produkt.

---

## 4. Was *nicht* Phase 2 war — und trotzdem uneinheitlich ist

Das war der Grund für „weitgehend“. Es sind keine offenen Phase-2-Punkte.

### 4.1 Radios, die Switches werden sollen? Nein.

Form A/B und Brief-Stil sind **keine** An/Aus-Schalter:

- Layout: zwei sich ausschließende Normen (A oder B)
- Anrede: drei Stile (förmlich / höflich / locker)

Segmented Radios sind hier die richtige native Form.
Ein `switch` wäre falsch.

### 4.2 Anlagen ist ein Zwitter

```html
<input type="checkbox" id="toggle-anlagen" class="sr-only">
<button id="btn-anlagen-toggle" aria-pressed="false">Anlagen</button>
```

Sichtbarkeit auf dem Papier läuft über `:has(#toggle-anlagen:checked)`.
Der sichtbare Button setzt per JS `aria-pressed` **und** die Hidden-Checkbox.

Das funktioniert. Es ist aber nicht das Phase-2-Muster
„ein Switch, CSS macht den Rest“.

Sauberer Phase-2-Stil wäre:

```html
<input type="checkbox" switch id="toggle-anlagen" aria-label="Anlagen">
```

Kein zweites Button-JS. Optional, nicht Phase-2-Nacharbeitspflicht.

### 4.3 Postvermerk: Select + Hidden-Checkbox + editierbares Papierfeld

```text
sidebar-pv-select     →  Wahl
toggle-postvermerk    →  sr-only, wird vom Select mitgesetzt
din-postvermerk       →  contenteditable
```

Drei Schreiber. Das ist der rote Punkt aus `review_grok.md`.
Phase 2 hat den Select nicht angefasst und musste das auch nicht.

### 4.4 Format-Toolbar positioniert noch per JS

`31-format-toolbar.js` setzt `style.top` / `style.left` am `#selection-anchor`
und öffnet dann `showPopover()`.

Das ist kein Display-Hack für Sichtbarkeit. Es ist Caret-Geometrie.
Native Anchor Positioning (`position-anchor` / `anchor()`) könnte das
später ersetzen. Das wäre Phase 3, nicht Phase 2.

### 4.5 Toast-Interna noch `class="hidden"`

`#toast-badge` und `#toast-action` nutzen CSS-Klasse `hidden`.
Der Container selbst ist korrekt Popover. Kosmetik.

---

## 5. Urteil in einem Satz

**Phase 2 ist fertig.**
Offen sind nur Konsistenzreste außerhalb des Phasen-Solls:
Anlagen-Zwitter, Postvermerk-Drei-Schreiber, Toolbar-Anchor per JS.

---

## 6. Nicht tun

- Phase 2 nicht nochmal aufmachen
- Form A/B und Anrede nicht zu Switches machen
- Keine neue Popover-Bibliothek
- `z-index`-Stack nicht zurückbauen
- Dialog nicht durch JS-`showModal`-Wrapper ersetzen, `commandfor` bleibt

---

## 7. Falls überhaupt noch etwas

Nur wenn ihr die Sidebar weiter vereinheitlichen wollt — eigenes Mini-Ticket,
nicht „Phase 2 nachziehen“:

1. Anlagen: Hidden-Checkbox + Button → ein `switch`
2. Postvermerk: ein Schreiber (Select steuert, Papierfeld nicht editierbar)
3. Optional später: Toolbar-Position auf CSS Anchor Positioning

---

## 8. Dateien dieser Prüfung

- `website/index.html`
- `website/js/main.js`
- `website/js/03-ui-protections.js`
- `website/js/32-toast.js`
- `website/js/31-format-toolbar.js`
- `research/reasearch_changelog.md` (Prio 5)
