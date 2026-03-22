---
scope: LOCAL — js/logic/
version: 1.0.0
updated: 2026-03-20
parent: /GEMINI.md
authority: ERGAENZT Root. Lokale Regeln schlagen Root NICHT.
specs: [SPEC-002, SPEC-007, SPEC-026, SPEC-037]
---

# GEMINI.md — js/logic/ (Die Rechenzentrale)
## Fachlogik-Regeln | Zero DOM | Zero State

Dieser Ordner enthaelt AUSSCHLIESSLICH reine Eingabe→Ausgabe-Funktionen.
Kein DOM-Zugriff. Kein State-Import. Kein Side-Effect.

---

## GOLDENE REGEL DIESES ORDNERS

```
Input (Zahlen/Strings) → Funktion → Output (Zahlen/Strings)
NIEMALS: DOM lesen, DOM schreiben, state.* anfassen
```

Verstoss gegen diese Regel = sofortiger Refactor-Auftrag.

---

## ERLAUBTE OPERATIONEN in js/logic/

- Datum-Parsing und -Formatierung (DE/ISO/Long)
- IBAN-Validierung (Modulo-97-Algorithmus) und -Formatierung
- Empfaenger-Parsing (Praefix, Titel, Name-Extraktion)
- Salutation-Matrix-Lookup (3 Formalitaeten x 4 Geschlechter)
- Return-Line-Ableitung (Abkuerzung des Absendernamens)
- PLZ/Stadt-Hilfsfunktionen (reine String-Operationen)
- Berechnung von Verzugszinsen, Portogewicht, Fristdaten

---

## MASSE-REGEL: CMA-Pflicht [SPEC-007]

Jede Funktion, die mit physikalischen Massen rechnet, MUSS die Werte
aus dem CMA-Objekt beziehen, nicht hart kodieren.

```javascript
// VERBOTEN (Magic Number):
function calcPorto() { return weight > 20 ? 0.95 : 0.75; }

// KORREKT (CMA-referenziert):
import { CMA } from '../core/constants.js';
function calcPorto(weightG) {
  return weightG <= CMA.STANDARD_BRIEF_MAX_WEIGHT_G ? CMA.PORTO_STANDARD : CMA.PORTO_KOMPAKT;
}
```

---

## ANREDE-ENGINE REGELN [SPEC-002]

Die Salutation-Matrix lebt als DATEN-OBJEKT in logic.js, NICHT als
UI-String-Konkatenation in ui.js.

```javascript
// VERBOTEN (ANTI-025 — JS-String-Engine in UI):
// ui.js: salutEl.innerHTML = 'Sehr geehrter Herr ' + name;

// KORREKT: Fachlogik in logic.js, Attribut-Setter in ui.js
export const SALUTATION_MATRIX = { formal: { m: (n) => `Sehr geehrter Herr ${n},` ... } };
// ui.js schreibt NUR: el.dataset.gender = analysis.gender;
// CSS rendert Placeholder via content: attr(data-placeholder)
```

**Erlaubte JS-Schreiboperationen fuer Salutation:**
- `el.dataset.gender = analysis.gender` — CSS Attribut-Selektor reagiert
- `el.dataset.placeholder = deriveSalutation(...)` — CSS attr() liest
- `el.textContent = sal` — NUR wenn Feld leer UND data-auto="true"

---

## VERBOTENE MUSTER IN DIESEM ORDNER

```javascript
// VERBOTEN: DOM-Zugriff
document.getElementById('f-salut').innerHTML = ...;   // NEIN
document.querySelector('.address').style.top = ...;   // NEIN

// VERBOTEN: State-Import
import { StateManager } from '../core/state.js';      // NEIN

// VERBOTEN: Magic Numbers fuer DIN-Masse
const TOP = 97.4;   // ohne CMA-Import → NEIN

// VERBOTEN: Temporal API vergessen
const d = new Date();   // ANTI-016 — nutze Temporal.Now.plainDateISO()
```

---

## CEMETERY — Geloeschte Funktionen aus diesem Ordner

### [TOMB-L001] Inline-Regex-Validatoren (migriert zu HTML5 pattern)
- **Was war es**: Regex-Checks fuer PLZ, Tel, E-Mail, Datum-Format in logic.js
- **Geloescht**: 2026-03-20 | Knowledge Shredder 2.0
- **Ersatz**:
  - PLZ:   `<input pattern="[0-9]{5}" maxlength="5">`
  - Tel:   `<input type="tel" pattern="[\d\s\+\-\(\)]{7,20}">`
  - Email: `<input type="email">`
  - Datum: `<input pattern="\d{2}\.\d{2}\.\d{4}">`
- **Warum**: Browser-native Validierung, kein JS-Overhead, aria-invalid via CSS

### [TOMB-L002] JS-basierte Salutation-String-Injektion in DOM
- **Was war es**: `_deriveFields()` in ui.js schrieb direkt HTML in Anredefeld
- **Geloescht**: 2026-03-20 | ANTI-025
- **Ersatz**: JS setzt nur `data-gender` + `data-placeholder` Attribute,
  CSS rendert Placeholder via `content: attr(data-placeholder)`
- **Achtung**: `deriveSalutation()` als FUNKTION bleibt in logic.js erhalten.
  Nur das DOM-Schreiben ist eliminiert.

### [TOMB-L003] state.config.* (Config-Zweig eliminiert)
- **Was war es**: `state.config.layout`, `.formality`, `.recipientType`,
  `.dateFormat`, `.showGuides` im StateManager-Proxy.
- **Geloescht**: 2026-03-20 | ANTI-025 | Session 8
- **Ersatz**: `#paper.dataset.*` — DOM-Attribute sind der Config-State.
  `data-layout`, `data-guides`, `data-formality`, `data-recipient-type`,
  `data-date-format` — gesetzt per `onchange`-Inline-Handler in index.html.
- **Warum**: Proxy-Overhead fuer reine Anzeige-Konfiguration unnoetig.
  DOM-Attribute sind nativ reaktiv (CSS `:has`, Attribut-Selektor).

### [TOMB-L004] UIController._applyLayout() / _applySidebarState()
- **Was war es**: JS-Funktionen (55 Zeilen) die CSS-Klassen und
  Radio-Checked-Zustaende basierend auf state.config synchronisierten.
- **Geloescht**: 2026-03-20 | Session 8
- **Ersatz**:
  - Form A/B:  `@layer project.overrides { #paper[data-layout="form-a"]... }`
  - Guides:    `#paper[data-guides="true"] .fold-mark { display: block; }`
  - Radios:    HTML `checked`-Attribut ist SSoT, kein JS-Sync

### [TOMB-L005] UIController._bindSettings() / _bindEditorToolbar() show/hide
- **Was war es**: Event-Listener fuer Radio-Gruppen (config-Sync),
  focusin/focusout fuer Toolbar-Sichtbarkeit (25 Zeilen).
- **Geloescht**: 2026-03-20 | Session 8
- **Ersatz**:
  - Radios:   `onchange="document.getElementById('paper').dataset.layout=this.value"`
  - Toolbar:  `#paper:has([contenteditable]:focus-within) #editor-toolbar { opacity:1 }`

### [TOMB-L006] Dialog showModal() / close() Event-Listener
- **Was war es**: querySelectorAll('[data-js="action:dialog-close"]').forEach...
  sowie _showConfirm(), _openProfile() als JS-Funktionen.
- **Geloescht**: 2026-03-20 | ADR-004 | Session 8
- **Ersatz**: Popover API — `popovertarget` / `popovertargetaction` Attribute.
  Zero-JS. Browser-nativ. Kein JS-Handler.

### [TOMB-L007] getElementById(domId) — ID-basierter DOM-Lookup (IMR 1.0)
- **Was war es**: readDOMasJSON() nutzte `document.getElementById(entry.domId)`
  mit hardcodierten IDs wie 'f-subject', 'f-salut', 'absender-zeile'
- **Geloescht**: 2026-03-20 | PLAN-010 | IMR 2.0
- **Ersatz**: `document.querySelector(entry.tag)` — Tag-Name ist der Selektor.
  Kein ID-Lookup mehr. Tag-Name = JSON-Key = CSS-Selektor = Eindeutige Wahrheit.

### [TOMB-U001] FIELD_MAP (HTML-ID → State-Key Mapping)
- **Was war es**: Objekt in ui.js das HTML-IDs auf State-Keys abbildete:
  `{ 'f-date': 'date', 'f-subject': 'subject', 'absender-zeile': 'returnAddress', ... }`
- **Geloescht**: 2026-03-20 | PLAN-010 | IMR 2.0
- **Ersatz**: `TAG_MAP` aus `IMR.map(e => [e.tag, e.key])` automatisch generiert.
  Kein Hardcoding mehr. Neues Feld in IMR (constants.js) erscheint automatisch in ui.js.

### [TOMB-U002] _cacheFields() mit getElementById
- **Was war es**: Loop ueber FIELD_MAP Keys → getElementById(id)
- **Geloescht**: 2026-03-20 | PLAN-010
- **Ersatz**: _cacheTags() → loop ueber IMR → querySelector(entry.tag)

### [TOMB-CSS001] ID-Selektoren in @layer din.core
- **Was war es**: `#f-subject { top: var(--subject-top); }` etc.
- **Geloescht**: 2026-03-20 | PLAN-010
- **Ersatz**: `din-subject { top: var(--subject-top); }` — Tag-Selektor.
  Spezifitaet: Tag-Selektor (0,0,1) < ID-Selektor (0,1,0).
  @layer din.core schuetzt vor Ueberschreibung — Spezifitaet irrelevant.

### [TOMB-HTML001] data-field Attribut auf Inhaltsfeldern
- **Was war es**: `<div data-field="subject" id="f-subject">` — doppelte Redundanz
- **Geloescht**: 2026-03-20 | PLAN-010
- **Ersatz**: Tag-Name `<din-subject>` ist die einzige Wahrheit.
  data-field entfaellt komplett auf din-* Tags.

### [TOMB-HTML002] contenteditable="true" auf Plaintext-Feldern
- **Was war es**: Alle Felder hatten `contenteditable="true"` (erlaubt HTML-Paste)
- **Geloescht**: 2026-03-20 | PLAN-010 | MANDATE-INJ
- **Ersatz**: `contenteditable="plaintext-only"` auf allen din-* Tags ausser din-body.
  Verhindert HTML-Injection durch Paste. Nur din-body (formatierter Text) bleibt "true".
