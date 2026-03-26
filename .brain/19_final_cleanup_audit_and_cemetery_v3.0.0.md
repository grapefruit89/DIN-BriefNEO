---
tags: [aviation-grade, platinum-2026, architecture, legacy-purge, cemetery, guardrails]
status: cemented-pending-approval
version: 3.0.0
last_audit: 2026-03-21
id: BRAIN-019-TOMB
traceability: [BRAIN-017, BRAIN-018, BRAIN-008, BRAIN-015, BRAIN-003, MANDATE-NO-LEGACY]
holy_folder: "C:\\Users\\morit\\Documents\\antigravity\\DIN Brief\\Platinum_DIN_2026"
scope: "js/core/*, js/logic/*, js/ui/*, index.html, css/*, .brain/*"
---

# 19 — Final Cleanup Audit & Cemetery of Ideas v3.0.0

## Audit-Erklärung

Dieser Report ist das Ergebnis eines vollständigen Code-to-Spec-Alignment-Scans.
Jeder Befund basiert auf dem tatsächlich gelesenen Dateiinhalt.
Keine Spekulation. Keine Halluzination. Quellenangaben sind präzise.

**Geprüfte Dateien:**
- `js/core/app.js`, `js/core/cma-bridge.js`, `js/core/constants.js`, `js/core/state.js`
- `js/logic/logic.js`
- `js/ui/ui.js`, `js/ui/devmode.js`
- `index.html`
- `css/din5008-paper.css`, `css/sidebar.css`
- `.brain/` — alle versionierten Spec-Dateien

---

## KATEGORIE 1: DESTRUCTION LIST — Sofort löschbarer Dead Code

### D-001 | initCMABridge() — 14 setProperty-Calls | ADR-009 / TOMB-B001

**Fundstelle:** `js/core/app.js` Zeile 14 + Zeile 32
```
import { initCMABridge } from './cma-bridge.js';
initCMABridge(storedForm);
```
**Fundstelle:** `js/core/cma-bridge.js` — gesamte `initCMABridge()` Funktion (ca. 30 Zeilen)

**Befund:** `initCMABridge()` schreibt 14 CSS Custom Properties via `root.style.setProperty()`.
Alle 14 Werte sind identisch in `css/din5008-paper.css :root {}` vorhanden.
ADR-009 hat CSS als primäre SSoT zementiert. Die Bridge-Funktion ist Dead Code.
`switchForm()` in `cma-bridge.js` bleibt — sie schreibt EINEN dynamischen Wert
(`--address-top`) und setzt `paper.dataset.layout`. Das ist legitim.

**Lösch-Anweisung:**
1. `app.js`: Import-Zeile `import { initCMABridge } from './cma-bridge.js'` → löschen
2. `app.js`: `initCMABridge(storedForm)` Aufruf + Kommentar → löschen
3. `cma-bridge.js`: `initCMABridge()` Funktion komplett → löschen
4. `cma-bridge.js`: Export nur noch `switchForm` → anpassen
5. Vor Löschung: `/* DEAD: See TOMB-B001 */` Marker setzen

---

### D-002 | execCommand Toolbar-Bindings | ADR-008 / BRAIN-015 A-1

**Fundstelle:** `js/ui/ui.js` in `_bindTagInputs()`:
```javascript
document.getElementById('editor-toolbar')
  ?.querySelectorAll('[data-cmd]')
  .forEach(btn => btn.addEventListener('mousedown', e => {
    e.preventDefault();
    document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
  }));
```
**Fundstelle:** `index.html` im `#editor-toolbar`:
```html
<button data-cmd="bold"      title="Fett">B</button>
<button data-cmd="italic"    title="Kursiv">I</button>
<button data-cmd="underline" title="Unterstrichen">U</button>
```

**Befund:** `contenteditable="plaintext-only"` (ADR-008) verhindert HTML-Injektion strukturell.
`document.execCommand()` wird auf ein plaintext-only-Feld angewendet — Browser ignoriert es.
Die Buttons klicken ins Leere. Dead Code mit Täuschungspotenzial.

**Lösch-Anweisung:**
1. `ui.js`: gesamter `querySelectorAll('[data-cmd]')` Block → löschen
2. `index.html`: die drei `data-cmd` Buttons → löschen (Undo/Redo-Buttons behalten!)
3. Vor Löschung: `/* DEAD: See TOMB-EXEC-001 */` Marker setzen

---

### D-003 | _safeSetHTML() Methode | TOMB-L008 Zombie

**Fundstelle:** `js/ui/ui.js` Methode `_safeSetHTML()`:
```javascript
_safeSetHTML(el, html) {
  if (!el || document.activeElement === el) return;
  if (el.innerHTML !== html) el.innerHTML = html;
}
```

**Befund:** Diese Methode ist ein TOMB-L008-Zombie. `entry.richText` wurde aus IMR entfernt.
Alle `entry.richText`-Checks in `_onContentChange()` und `_syncAllToDOM()` sind
daher immer `false/undefined`. `_safeSetHTML()` kann über diese Pfade nie
legitim aufgerufen werden. Zusätzlich: unkontrolliertes `innerHTML =` ist
ein MANDATE-INJ-Verstoß.

**Lösch-Anweisung:**
1. `ui.js`: `_safeSetHTML()` Methode → löschen
2. `ui.js` in `_onContentChange()`: `entry.richText ? this._safeSetHTML(...) :` Ternary-Arm → vereinfachen zu direktem `this._safeSet(...)` Aufruf
3. `ui.js` in `_syncAllToDOM()`: identisch
4. Vor Löschung: `/* DEAD: See TOMB-U002 */` Marker setzen

---

### D-004 | entry.richText Zombie-Referenzen | TOMB-L008

**Fundstellen:** `js/ui/ui.js`
- `_bindTagInputs()`: `const val = entry.richText ? el.innerHTML : el.innerText.trim();`
- `_onContentChange()`: `entry.richText ? this._safeSetHTML(...) : this._safeSet(...)`
- `_syncAllToDOM()`: `entry.richText ? this._safeSetHTML(...) : this._safeSet(...)`

**Befund:** `entry.richText` existiert nicht mehr im IMR-Array (`constants.js`).
Der Ternary-Operator wertet immer auf `false` aus. Dead Condition.
Nach D-003 (Löschen von `_safeSetHTML`) werden diese Stellen ohnehin vereinfacht.

**Lösch-Anweisung:** Ternary → direkter `textContent`/`innerText`-Pfad. `/* DEAD: See TOMB-L008 */`


---

## KATEGORIE 2: NATIVE REPLACEMENT — Chrome-Native Umstellungen

### N-001 | btn-import-trigger → native label | BRAIN-015 A-2

**Fundstelle:** `js/ui/ui.js` in `_bindActions()`:
```javascript
on('btn-import-trigger', () => document.getElementById('file-import')?.click());
```
**Fundstelle:** `index.html`:
```html
<button id="btn-import-trigger" class="sidebar-btn">📂 Import</button>
<input type="file" id="file-import" accept=".json" hidden>
```

**Befund:** `btn-import-trigger` existiert nur, um `file-import.click()` auszulösen.
Das ist die klassische HTML-Antipattern für File-Inputs.
Native Alternative: `<label for="file-import">` übernimmt den Klick ohne JS.

**Umstellungs-Anweisung:**
1. `index.html`: `<button id="btn-import-trigger">` → `<label for="file-import" ...>📂 Import</label>`
2. `ui.js`: `on('btn-import-trigger', ...)` Zeile → löschen
3. `file-import` `hidden` → `display:none` via CSS (label-click funktioniert unabhängig)

---

### N-002 | popovertarget → commandfor Migration | BRAIN-015 B-2

**Fundstellen:** `index.html` — 6 Buttons mit `popovertarget` / `popovertargetaction`:

| Zeile-Ca. | Element | Aktion | Migration |
|-----------|---------|--------|-----------|
| L60 | `<button popovertarget="sidebar-right">🔬 Debugger` | show | `commandfor="sidebar-right" command="show-popover"` |
| L61 | `<button popovertarget="dialog-profile">👤 Profil` | show | `commandfor="dialog-profile" command="show-popover"` |
| L64 | `<button popovertarget="sidebar-right">🔌 Inspector` | show | `commandfor="sidebar-right" command="show-popover"` |
| L142 | `<button popovertarget="sidebar-right" popovertargetaction="hide">✕` | hide | `commandfor="sidebar-right" command="hide-popover"` |
| L183 | `<button popovertarget="dialog-profile" popovertargetaction="hide">Abbrechen` | hide | `commandfor="dialog-profile" command="hide-popover"` |
| L185 | `<button popovertarget="dialog-profile" popovertargetaction="hide">✕` | hide | `commandfor="dialog-profile" command="hide-popover"` |

**Chrome 133+ stabil. Kein @supports nötig bei Chrome 145+ Mandate.**

---

### N-003 | todayISO() → Temporal | BRAIN-018 / TOMB-L001

**Fundstelle:** `js/logic/logic.js`:
```javascript
export function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
```

**Befund:** Aktiver ANTI-016-Verstoß. TOMB-L001 bestätigt. Muss zu
`Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())` migriert werden.
Outputvertrag `YYYY-MM-DD` bleibt identisch.

---

### N-004 | app.js: formatDate(new Date(), fmt) → Temporal | ANTI-016

**Fundstelle:** `js/core/app.js` im Boot-Block:
```javascript
sm.state.content.date = formatDate(new Date(), fmt);
```

**Befund:** Zweite `new Date()`-Verwendung für Zeitstempel-Generierung.
ANTI-016 Verstoß. `new Date()` für "heute" ist TOMB-L001-Scope.
Korrekte Migration: `formatDate(Temporal.Now.plainDate(Temporal.Now.timeZoneId()), fmt)`
wobei `formatDate()` entweder ein `Temporal.PlainDate` oder das bestehende
`Date`-Objekt akzeptieren muss (Input-Typ-Check).

---

### N-005 | Inline onchange-Handler | BRAIN-015 No-JS

**Fundstellen:** `index.html`:
```html
onchange="document.getElementById('paper').dataset.layout=this.value;
          localStorage.setItem('neo_form','A')"
```
(Form A + Form B Radios, Guides-Checkbox)

**Befund:** Inline-JS widerspricht der No-JS-Doctrine für neue Entwicklungen.
Form-A/B Toggle gehört in `ui.js:_bindActions()` per Event-Delegation.
Der `localStorage.setItem('neo_form',...)` Seiteneffekt fehlt dann im
`cma-bridge.js:switchForm()` Pfad — das muss konsistent gehalten werden.

---

### N-006 | CSS @layer deklaration — latex.base fehlt | K-003

**Fundstelle:** `css/din5008-paper.css` Zeile 17:
```css
@layer din.core, ui.theme, project.overrides;
```

**Befund:** K-003 wurde in BRAIN-017 und 03_technical_blueprint_v1.1.0.md
zementiert: `latex.base` als schwächster Layer. Die Spezifikation ist
korrekt, der CSS-Code wurde noch NICHT aktualisiert.
Aktueller Stand ist ein Spec-Code-Divergenz (kein Laufzeitfehler, da
latex.base noch keine Regeln enthält, aber die Deklaration fehlt).

**Erforderlich:**
```css
@layer latex.base, din.core, ui.theme, project.overrides;
```

---

### N-007 | @property für 14 CMA-Variablen fehlt | BRAIN-015 A-8

**Fundstelle:** `css/din5008-paper.css` `:root` Block.

**Befund:** Alle 14 CMA-Variablen sind untypisiert (String). Kein Browser-Validierung.
`@property --subject-top { syntax: "<length>"; initial-value: 103.4mm; inherits: true; }`
und 13 weitere sind in BRAIN-015 A-8 spezifiziert aber nicht implementiert.
Chrome 85+ stabil — kein Implementierungshindernis.

---

### N-008 | textarea field-sizing fehlt | BRAIN-015 A-6

**Fundstelle:** `css/sidebar.css` für `#akinator-output` Textarea.

**Befund:** `field-sizing: content` ist für Auto-Resize der Akinator-Textarea spezifiziert
(BRAIN-015 A-6, Chrome 123+) aber nicht implementiert.
Die Textarea hat noch `rows="10"` Hardcoded.


---

## KATEGORIE 3: ISOMORPHIC FIX — Tag-Alignment & Schema-Konsistenz

### I-001 | din-body contenteditable="true" — ADR-008 VERLETZUNG | KRITISCH

**Fundstelle:** `index.html`, Sektion E:
```html
<din-body
  contenteditable="true"
  aria-multiline="true"
  aria-label="Brieftext">
</din-body>
```
Kommentar direkt davor: `AUSNAHME: contenteditable="true" (formatierter Text erlaubt)` — FALSCH.

**Befund:** ADR-008 ist unmissverständlich: ALLE `<din-*>`-Tags tragen ausnahmslos
`contenteditable="plaintext-only"`. `din-body` ist KEINE Ausnahme.
Formatierungen laufen über den Ghost-Mirror (`<din-body-mirror>`), nicht
über `contenteditable="true"`.

Dies ist die einzige aktive ADR-008-Verletzung im Live-DOM.
Der Kommentar verstärkt die Falschaussage.

**Fix-Anweisung:**
1. `contenteditable="true"` → `contenteditable="plaintext-only"`
2. Kommentar `AUSNAHME: contenteditable="true"...` → ersetzen durch:
   `ADR-008: plaintext-only PFLICHT. Formatierung via din-body-mirror (Ghost-Mirror).`
3. `/* DEAD: See TOMB-HTML-003 */` auf den alten Kommentar setzen

---

### I-002 | state.js DEFAULT_STATE — 4 veraltete IMR v1 Keys | KRITISCH

**Fundstelle:** `js/core/state.js` `DEFAULT_STATE.content`:
```javascript
export const DEFAULT_STATE = Object.freeze({
  content: {
    date:             '',   // ← IMR-Key ✓
    subject:          '',   // ← IMR-Key ✓
    salutation:       '',   // ← IMR-Key ✓
    body:             '',   // ← IMR-Key ✓
    greeting:         '',   // ← IMR-Key ✓
    signatureName:    '',   // ← FALSCH! IMR-Key: "signature"
    returnAddress:    '',   // ← FALSCH! IMR-Key: "sender"
    recipientName:    '',   // ← FALSCH! IMR-Key: "recipient"
    specialNote:      '',   // ← FALSCH! IMR-Key: "note"
    // Erweiterte Felder:
    senderName:       '',   // ← OK: interne Profilfelder (kein IMR)
    senderStreet:     '',   // ← OK
    senderZipCity:    '',   // ← OK
    senderPhone:      '',   // ← OK (deprecated?)
    senderEmail:      '',   // ← OK (deprecated?)
  },
  ...
});
```

**Befund:** 4 Keys in DEFAULT_STATE entsprechen nicht dem IMR-Schema.
`_syncAllToDOM()` liest `c[entry.key]` (korrekte IMR-Keys: `signature`, `sender`,
`recipient`, `note`). Diese Keys existieren nicht in DEFAULT_STATE → `undefined` → `''`.

**Auswirkung:** Beim allerersten Boot (kein LocalStorage) bleiben alle 4 Felder leer
(korrekt für ein neues Dokument). Wenn der Nutzer tippt, werden die richtigen IMR-Keys
in den State geschrieben (via `_bindTagInputs()`). Nach Save/Reload funktioniert alles.
Die falschen Keys sind Dead Weight — aber Tick-Zeitbomben für zukünftige
State-Abfragen die DEFAULT_STATE als Schema-Referenz nutzen.

**Fix-Anweisung:**
- `signatureName` → `signature`
- `returnAddress` → `sender`
- `recipientName` → `recipient`
- `specialNote` → `note`
- Vor Fix: `/* LEGACY: See TOMB-STATE-001 */` Marker

---

### I-003 | din-body-mirror fehlt im DOM — Ghost-Mirror unimplementiert

**Fundstelle:** `index.html` — kein `<din-body-mirror>` Element vorhanden.

**Befund:** IMR v2.3.0 Sektion K spezifiziert `<din-body-mirror aria-hidden="true">`.
Der DOM enthält dieses Element nicht. Solange der Ghost-Mirror nicht existiert:
- State 2 (Blur-Visualisierung) funktioniert nicht
- Print-Layout nutzt `din-body` (mit plaintext-only-Inhalt) statt Mirror

Das ist kein Bug-Zustand (Browser druckt textContent korrekt), aber die
Ghost-Mirror-Spec ist nicht implementiert.

**Anweisung:** Dieses Item ist eine SPEC-IMPLEMENTATION-PENDING-Flag,
kein Fix-Ticket. Wird implementiert wenn Ghost-Mirror-Renderlogik gebaut wird.

---

### I-004 | break-inside: avoid fehlt in CSS @media print

**Fundstelle:** `css/din5008-paper.css` `@media print` Block — kein `break-inside`.

**Befund:** IMR v2.3.0 Sektion K spezifiziert `break-inside: avoid` für
`din-body-mirror blockquote, ul, ol, table`. Da `din-body-mirror` noch nicht
im DOM existiert (I-003), hat das Fehlen keine aktuelle Auswirkung.

**Anweisung:** Implementierung gemeinsam mit I-003 (Ghost-Mirror).

---

### I-005 | html[data-layout="form-b"] — redundantes Attribut

**Fundstelle:** `index.html` Zeile 1:
```html
<html lang="de" data-layout="form-b">
```

**Befund:** Der Wert `data-layout` am `<html>`-Element hat keine CSS-Selektoren.
Das Layout wird über `#paper[data-layout]` gesteuert. Das Attribut am `<html>` ist
ein Überbleibsel einer früheren Architektur und hat null Funktion.

**Fix-Anweisung:** `data-layout="form-b"` aus `<html>` entfernen.

---

### I-006 | state.js catch — zu breite Fehler-Unterdrückung | G-002

**Fundstelle:** `js/core/state.js:save()`:
```javascript
catch { /* quota exceeded — silent */ }
```

**Befund:** Der Kommentar nennt `quota exceeded`, aber `catch` ohne Typ fängt ALLES —
auch `JSON.stringify`-Fehler (circular references), TypeError usw.
09_resilience_strategy_v6.0.0.md Teil V spezifiziert eine Prioritäts-Hierarchie
und explizite `QuotaExceededError`-Behandlung. Der aktuelle Code implementiert nichts davon.

**Anweisung:** SPEC-IMPLEMENTATION-PENDING. Die v6.0.0 Recovery-Logik muss
implementiert werden. Kein sofortiger Fix — das ist eine eigene SPEC-Umsetzung.

---

### I-007 | @scope (#paper) fehlt in CSS | BRAIN-015 A-3

**Fundstelle:** `css/din5008-paper.css` — kein `@scope (#paper)`.

**Befund:** BRAIN-015 A-3 spezifiziert `@scope (#paper)` um `@layer din.core`
für strukturelle Isolation der `din-*` Selektoren. Nicht implementiert.
Chrome 118+ stabil. Kein Implementierungshindernis.

**Anweisung:** SPEC-IMPLEMENTATION-PENDING. Nächste CSS-Session.


---

## KATEGORIE 4: CEMETERY NOMINATIONS — Zentrale Friedhofs-Registry

### ═══════════════════════════════════════════════════
### THE CEMETERY OF IDEAS — DIN-BriefNEO v3.0.0
### Epitaph-Regel (UNVERÄNDERLICH):
### "Before ANY future proposal you MUST cross-check this Registry.
###  Proposing a buried pattern = immediate Architecture-Audit-Failure.
###  Future agents MUST mark deleted code with /* DEAD: See TOMB-XXX */
###  before removal."
### ═══════════════════════════════════════════════════

---

### TOMB-B001 | initCMABridge() — 14x setProperty

- **ID:** TOMB-B001
- **Deceased Pattern:** `initCMABridge(form)` — schreibt 14 CSS Custom Properties
  via `root.style.setProperty()` beim App-Start
- **Cause of Death:** ADR-009 — CSS `:root {}` ist die primäre SSoT für alle
  statischen CMA-Koordinaten. Die Bridge dupliziert Werte die im CSS-Fallback
  bereits statisch korrekt vorliegen. Dopplung ist kein Feature — sie ist
  ein Wartungsrisiko (2 Stellen müssen synchron gehalten werden).
- **The Successor:** CSS `din5008-paper.css :root {}` direkt. `switchForm()` bleibt
  als einzige legitime Bridge-Funktion für den dynamischen Form-A/B-Toggle.
- **Status:** Spezifikation zementiert (ADR-009, 14_adr_009_ssot.md).
  Code noch nicht entfernt — **D-001 ist der Deletion-Ticket.**
- **Epitaph:** `/* DEAD: See TOMB-B001 — ADR-009: CSS ist SSoT */`

---

### TOMB-EXEC-001 | execCommand() Toolbar-Bindings

- **ID:** TOMB-EXEC-001
- **Deceased Pattern:** `document.execCommand('bold'/'italic'/'underline')` auf
  Toolbar-Buttons, gebunden via `querySelectorAll('[data-cmd]')`
- **Cause of Death:** ADR-008 — `contenteditable="plaintext-only"` blockiert
  HTML-Injektion strukturell. `execCommand` auf plaintext-only = No-Op.
  Die Buttons sind visuell vorhanden aber funktionslos. Täuschungsgefahr.
- **The Successor:** Ghost-Mirror-Pattern für Markdown-Formatierung im Body.
  Toolbar wird zu Undo/Redo + Markdown-Cheatsheet [popover].
- **Status:** Spezifikation zementiert (BRAIN-015 A-1). Code noch nicht entfernt.
  **D-002 ist der Deletion-Ticket.**
- **Epitaph:** `/* DEAD: See TOMB-EXEC-001 — ADR-008: execCommand auf plaintext-only = No-Op */`

---

### TOMB-U002 | _safeSetHTML() Methode

- **ID:** TOMB-U002
- **Deceased Pattern:** `_safeSetHTML(el, html) { el.innerHTML = html; }` in `ui.js`
- **Cause of Death:** TOMB-L008 (richText-Flag entfernt) + MANDATE-INJ (innerHTML
  für User-Content verboten). Die Methode kann nach TOMB-L008 über keine
  legitimen Codepfade mehr erreicht werden. Gleichzeitig ist ihr Kernmechanismus
  (`innerHTML =`) MANDATE-INJ-verletzend und sicherheitsrelevant.
- **The Successor:** `element.setHTML()` mit Sanitizer API (Chrome 116+, vollständig 146+)
  für den Ghost-Mirror-Renderer — sobald dieser implementiert wird.
  Bis dahin: keine Ersetzung nötig (Dead Code).
- **Status:** Code noch vorhanden. **D-003 ist der Deletion-Ticket.**
- **Epitaph:** `/* DEAD: See TOMB-U002 — MANDATE-INJ: innerHTML für User-Content verboten */`

---

### TOMB-V009 | CSS Preprocessors (SASS, SCSS, LESS, Stylus)

- **ID:** TOMB-V009
- **Deceased Pattern:** SASS/SCSS, LESS, Stylus, Mixins.
- **Cause of Death:** Zero-Build-Step Doktrin. Chrome 147+ Baseline natively supports CSS Nesting, Custom Properties, `@layer`, `@scope`, and native math functions. Preprocessors introduce unnecessary dependencies, build steps, and maintenance overhead.
- **The Successor:** Modern Native CSS Features (W3C Syntax).
- **Status:** Officially banned.
- **Epitaph:** `/* BANNED: See TOMB-V009 — Zero-Build-Step Doktrin: Native CSS is superior. */`

### TOMB-STATE-001 | DEFAULT_STATE Veraltete IMR v1 Keys

- **ID:** TOMB-STATE-001
- **Deceased Pattern:** `state.js DEFAULT_STATE.content` mit Keys:
  `signatureName`, `returnAddress`, `recipientName`, `specialNote`
- **Cause of Death:** IMR v2.0 (PLAN-010) hat die Keys umbenannt zu
  `signature`, `sender`, `recipient`, `note`. DEFAULT_STATE wurde nie
  synchronisiert. Die alten Keys sind Dead Weight — sie verhindern keinen
  Betrieb (IMR-Sync liest die richtigen Keys aus dem Proxy), aber sie
  signalisieren fälschlich ein falsches State-Schema an zukünftige Leser.
- **The Successor:** `DEFAULT_STATE.content` mit allen 11 korrekten IMR-Keys
  plus den legitimen internen Profilfeldern (`senderName`, etc.).
- **Status:** Code noch vorhanden. **I-002 ist der Fix-Ticket.**
- **Epitaph:** `/* LEGACY: See TOMB-STATE-001 — IMR v2.0: Key umbenannt */`

---

### TOMB-HTML-001 | din-body contenteditable="true"

- **ID:** TOMB-HTML-001
- **Deceased Pattern:** `<din-body contenteditable="true">` in `index.html`
  mit Kommentar `AUSNAHME: contenteditable="true" (formatierter Text erlaubt)`
- **Cause of Death:** ADR-008 (2026-03-20) — Ausnahmen für `din-body` wurden
  explizit abgeschafft und in TOMB-L008 beerdigt. Der falsche Kommentar
  ist eine Einladung zur Regression — jeder zukünftige Dev würde denken,
  rich text sei erlaubt.
- **The Successor:** `contenteditable="plaintext-only"`. Formatierung via Ghost-Mirror.
- **Status:** Code noch vorhanden. **I-001 ist der Fix-Ticket.**
- **Epitaph:** `<!-- ADR-008: plaintext-only PFLICHT. Kein richText. Kein HTML. -->`

---

### TOMB-HTML-002 | html[data-layout] redundantes Attribut

- **ID:** TOMB-HTML-002
- **Deceased Pattern:** `<html lang="de" data-layout="form-b">` in `index.html`
- **Cause of Death:** Das Attribut hat keine CSS-Selektoren und keine JS-Logik.
  Layout wird ausschließlich über `#paper[data-layout]` gesteuert.
  Das `<html>`-Attribut ist ein Überbleibsel aus einer früheren Architektur-Iteration.
- **The Successor:** Kein Ersatz nötig. Einfach entfernen.
- **Status:** Code noch vorhanden. **I-005 ist der Fix-Ticket.**
- **Epitaph:** `<!-- REMOVED: See TOMB-HTML-002 — layout is controlled via #paper[data-layout] -->`

---

### TOMB-L001 | new Date() für Zeitstempel-Generierung (BESTÄTIGT)

- **ID:** TOMB-L001
- **Deceased Pattern:** `new Date()` und `Date.now()` für Datumsberechnung/Zeitstempel
- **Fundstellen im Code:**
  1. `logic.js:todayISO()` — `const d = new Date()` (PRIMÄR)
  2. `app.js` Boot — `formatDate(new Date(), fmt)` (SEKUNDÄR)
- **Cause of Death:**
  1. Mutabilität: `Date`-Objekte sind mutable → ANTI-016
  2. UTC-Fehler: `new Date().toISOString()` gibt UTC zurück → Midnight-Bug (G-007)
  3. Locale-Abhängigkeit: `toLocaleDateString()` systemabhängig → deterministisch falsch
- **The Successor:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())` — deterministisch,
  lokal, immutable, immer `YYYY-MM-DD`
- **Ausnahme:** `parseDate()` darf `new Date(string)` für User-Input-Parsing behalten
  (BRAIN-018 explizite Erlaubnis als Tier-0 Fallback).
- **Status:** Code noch vorhanden. **N-003 und N-004 sind die Migration-Tickets.**
- **Epitaph:** `/* DEAD: See TOMB-L001 — ANTI-016: new Date() für Timestamps verboten. Nutze Temporal. */`

---

### TOMB-L007 | getElementById(domId) — IMR v1 (BEREITS ENTFERNT)

- **ID:** TOMB-L007
- **Status:** VOLLSTÄNDIG ENTFERNT. Nur in Kommentaren referenziert.
- **Beweis:** `logic.js` Kommentar: `CEMETERY [TOMB-L007]: Alter Ansatz getElementById(entry.domId) → entfernt.`
- **Epitaph:** In Ewigkeit begraben. Codebasis ist sauber.

---

### TOMB-L008 | richText-Flag (TEILWEISE ENTFERNT — Zombie-Referenzen)

- **ID:** TOMB-L008
- **Deceased Pattern:** `richText: true` Flag im IMR-Array + `innerHTML`-Nutzung für Body
- **Status:** AUS IMR ENTFERNT. Aber Zombie-Referenzen in `ui.js` verbleiben:
  - `entry.richText ? el.innerHTML : el.innerText.trim()` — totaler Ternary-Arm
  - `entry.richText ? this._safeSetHTML(...) : this._safeSet(...)` — 2x toter Ternary-Arm
  - `_safeSetHTML()` Methode (→ TOMB-U002)
- **Vollständige Bereinigung:** D-003 + D-004 abarbeiten.

---

### TOMB-M001 | Legacy Schema Mapping (SPEZIFIZIERT — nie existiert)

- **ID:** TOMB-M001
- **Deceased Pattern:** Mapping-Tabelle `sender_line → sender`, `special_note → note`, etc.
  (aus IMR v2.3.0 Sektion M, die in v2.4.0 ersetzt wurde)
- **Cause of Death:** Diese Feld-Namen wurden nie in Produktions-Backups geschrieben.
  Die Migrations-Tabelle war präventive Komplexität für ein nicht-existentes Problem.
- **The Successor:** Strict Schema Gate (IMR v2.4.0 Sektion M).
- **Status:** Spezifikation ersetzt. Code war nie implementiert.

---

### TOMB-C001 | .is-visible / .marks-visible Klassen-Toggle (BEREITS ENTFERNT)

- **ID:** TOMB-C001
- **Status:** VOLLSTÄNDIG ENTFERNT. Ersatz: `#paper[data-guides="true"]` CSS-Selektor.
- **Quelle:** css/GEMINI.md Cemetery-Eintrag.

---

### TOMB-C002 | JS-Toolbar show/hide via classList (BEREITS ENTFERNT)

- **ID:** TOMB-C002
- **Status:** VOLLSTÄNDIG ENTFERNT. Ersatz: `:has([contenteditable]:focus-within)` CSS.
- **Quelle:** css/GEMINI.md Cemetery-Eintrag.

---

### TOMB-C003 | Pico CSS Full-Integration (ABGELEHNT)

- **ID:** TOMB-C003
- **Status:** NIE IMPLEMENTIERT. ADR-001: nur Pattern Mining.
- **Quelle:** css/GEMINI.md Cemetery-Eintrag.

---

### TOMB-C004 | margin-top für DIN-Zonen (ABGELEHNT)

- **ID:** TOMB-C004
- **Status:** NIE IMPLEMENTIERT. position: absolute ist die Regel.
- **Quelle:** css/GEMINI.md Cemetery-Eintrag.


---

## SECURITY-SEKTION: Regex & XSS-Audit

### SEC-001 | Regex-Muster — Ergebnis: SICHER

**Geprüfte Regex in `logic.js`:**

| Pattern | Verwendung | Sicherheits-Urteil |
|---|---|---|
| `/(^|\|s)(Herr\|Herrn)\b/i` | Genus-Erkennung | SICHER — word-boundary, kein backtrack |
| `/(^|\|s)(Frau)\b/i` | Genus-Erkennung | SICHER |
| `/(^|\|s)(Familie\|Eheleute)\b/i` | Genus-Erkennung | SICHER |
| `/(Prof\.\|Dr\.\|Dipl\.-[A-Za-z]+\|Mag\.)/g` | Titel-Extraktion | SICHER — begrenzte Zeichenmenge |
| `/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/` | Datum-Parse | SICHER — vollständig anchored |
| `/^(\d{4})-(\d{2})-(\d{2})$/` | ISO-Datum | SICHER — vollständig anchored |
| `/^(\d{1,2})\.?\s+([^\s]+)\s+(\d{4})$/` | Long-Datum | SICHER — [^\s]+ in kontrolliertem Kontext |
| `/\s+/g`, `/.{1,4}/g` | IBAN-Format | SICHER — keine User-Input-Injection möglich |
| `/[^A-Za-z0-9]/g` | IBAN-Clean | SICHER — Whitelist-Ansatz |

**Kein ReDoS-Risiko** bei den geprüften Patterns. Alle quantifiers sind bounded
oder in anchored Contexts. kein catastrophic backtracking möglich.

### SEC-002 | _safeSetHTML() — Latentes XSS-Risiko

**Fundstelle:** `ui.js:_safeSetHTML()`:
```javascript
if (el.innerHTML !== html) el.innerHTML = html;
```

**Befund:** Die Methode verwendet rohes `innerHTML` ohne Sanitization.
Im Normalfall wird sie nicht aufgerufen (TOMB-L008 + TOMB-U002).
Aber ihre bloße Existenz ist ein Risiko: ein zukünftiger Entwickler
könnte sie direkt aufrufen. Kein aktives XSS-Risiko im aktuellen Stand,
da kein Codepfad sie mit User-Input aufruft.

**Beweis:** `_onContentChange()` und `_syncAllToDOM()` haben `entry.richText`
als Guard — der ist immer `undefined` (falsy). Methodenaufruf nie ausgelöst.

**Empfehlung:** D-003 (Löschung) hat höchste Sicherheitspriorität.

### SEC-003 | Ghost-Mirror Sanitizer — NICHT YET ACTIVE

**Befund:** `din-body-mirror` existiert noch nicht im DOM.
Der Sanitizer-API-Aufruf `element.setHTML(html, { sanitizer: ... })` kann
daher noch nicht aktiviert sein. Sobald Ghost-Mirror implementiert wird,
muss `setHTML()` der einzige Schreib-Pfad für Mirror-HTML sein.
`innerHTML =` auf `din-body-mirror` ist unter allen Umständen verboten.

---

## IMPLEMENTIERUNGS-CHECKLISTE — Nächste Session

### SOFORT (keine Spezifikation nötig, 0 Risiko)

```
[ ] D-001  app.js: initCMABridge() Import + Aufruf löschen
[ ] D-001  cma-bridge.js: initCMABridge() Funktion löschen
[ ] D-002  ui.js: execCommand-Block löschen
[ ] D-002  index.html: data-cmd Buttons (3x) löschen
[ ] D-003  ui.js: _safeSetHTML() Methode löschen
[ ] D-004  ui.js: entry.richText Ternary → direkter _safeSet()-Aufruf
[ ] I-001  index.html: din-body contenteditable="true" → "plaintext-only"
[ ] I-001  index.html: falschen ADR-008 Kommentar korrigieren
[ ] I-002  state.js: 4 falsche DEFAULT_STATE Keys korrigieren
[ ] I-005  index.html: data-layout="form-b" von <html> entfernen
[ ] N-001  index.html: btn-import-trigger → label for="file-import"
[ ] N-001  ui.js: entsprechenden EventListener löschen
[ ] N-002  index.html: 6x popovertarget → commandfor/command migrieren
[ ] N-006  css/din5008-paper.css: @layer latex.base hinzufügen
```

### NÄCHSTE SPEC-RUNDE

```
[ ] N-003  logic.js: todayISO() auf Temporal migrieren (BRAIN-018)
[ ] N-004  app.js: formatDate(new Date()) auf Temporal migrieren
[ ] N-005  index.html: inline onchange-Handler in JS-EventDelegation migrieren
[ ] N-007  css: @property für alle 14 CMA-Variablen
[ ] N-008  css/sidebar.css: field-sizing: content für Textarea
[ ] I-007  css/din5008-paper.css: @scope (#paper) hinzufügen
```

### SPEC-IMPLEMENTATION-PENDING (eigene SPECs)

```
[ ] I-003  din-body-mirror in DOM implementieren (Ghost-Mirror)
[ ] I-004  break-inside: avoid in @media print (mit I-003)
[ ] I-006  state.js: QuotaExceededError Recovery (BRAIN-009 v6.0.0)
```

---

## LEGACY GATE GUARDRAIL (UNVERÄNDERLICH)

> **Vor JEDEM zukünftigen Vorschlag MUSS diese Registry geprüft werden.**
>
> Ein Vorschlag der ein beerdigtes Pattern wiederbelebt gilt als sofortiger
> Architecture-Audit-Failure. Keine Ausnahmen.
>
> **BEGRABEN:** innerHTML, richText, execCommand, new Date() für Timestamps,
> initCMABridge(), Legacy-Key-Mapping, Pico-CSS-Full-Import, margin-top für
> DIN-Zonen, ID-basierte Felder-Selektoren, JS-Klassen-Toggle für Sichtbarkeit.
>
> **CEMETERY ID-Nummern für Code-Marker:**
> TOMB-B001, TOMB-EXEC-001, TOMB-U002, TOMB-STATE-001,
> TOMB-HTML-001, TOMB-HTML-002, TOMB-L001, TOMB-L007, TOMB-L008,
> TOMB-M001, TOMB-C001, TOMB-C002, TOMB-C003, TOMB-C004

---

## AUDIT-SIGNATUR

```
Datum:          2026-03-21
Auditor:        Lead Systems Auditor (Aviation Grade)
Scan-Methode:   Vollständige Dateilektüre aller relevanten Quellen
Gefundene Bugs: 2 aktive (I-001 ADR-008-Verletzung, I-002 State-Schema)
Dead Code:      4 identifizierte Blöcke (D-001 bis D-004)
Native TODO:    8 identifizierte Umstellungen (N-001 bis N-008)
Neue TOMBs:     4 (TOMB-EXEC-001, TOMB-U002, TOMB-STATE-001, TOMB-HTML-001/002)
Sicherheit:     Kein aktives XSS. 1 latentes Risiko (SEC-002 → D-003)
Fazit:          System funktioniert korrekt trotz technischer Schulden.
                Kritischste Aktion: I-001 (ADR-008-Verletzung im DOM).
```
