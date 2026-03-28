---
tags: [aviation-grade, native-purity, future-proof, chrome-horizon]
status: pending-implementation
version: 1.0.0
last_audit: 2026-03-21
id: BRAIN-021
supersedes: 20_integrity_audit_v1.0.0.md
traceability: [BRAIN-015, BRAIN-017, BRAIN-018, BRAIN-019-TOMB, ADR-009, MANDATE-NO-LEGACY, CHROME-HORIZON]
scan_scope: "js/core/*, js/logic/*, js/ui/*, css/*, index.html"
---

# 21 — Native Purity Sweep v1.0.0 — Third Pass

## Prämisse

Dieser Report ist kein weiterer Audit-Klon.
Er ist ein präziser Migrations-Schießbefehl:
Was heute stirbt, stirbt heute. Was morgen stirbt, wird heute markiert.
Kein Mittelweg. Keine Ausnahmen ohne explizite Begründung.

Gescannt: Jede Zeile jeder JS- und CSS-Datei.
Datum: 2026-03-21. Ziel-Browser: Chrome 146+. Horizon: Chrome 150–160+.

---

## 1. JS → CSS/HTML Migration Candidates

| Datei | Zeile(n) | Aktuelles Pattern | Nativer Ersatz | Priorität | Kommentar |
|---|---|---|---|---|---|
| `app.js` | Z.32 | `initCMABridge(storedForm)` | ENTFÄLLT — `css/:root` ist SSoT | 🔴 SOFORT | TOMB-B001. Import in Z.14 ebenfalls löschen. |
| `app.js` | Z.38 | `formatDate(new Date(), fmt)` | `Temporal.Now.plainDate(Temporal.Now.timeZoneId())` | 🔴 SOFORT | TOMB-L001. `new Date()` für Timestamp-Generierung verboten. |
| `cma-bridge.js` | komplett | `initCMABridge()` 14x `setProperty` | CSS `:root {}` | 🔴 SOFORT | Nach Löschung: `cma-bridge.js` Datei komplett eliminieren wenn nur `switchForm()` übrig. |
| `cma-bridge.js` | `switchForm()` | `setProperty('--address-top', ...)` | Nur `paper.dataset.layout` setzen — CSS `project.overrides` übernimmt Rest | 🔴 SOFORT | TOMB-B002. `--address-top` ist statisch. CSS leistet das bereits. |
| `ui.js` | `_bindTagInputs()` | `entry.richText ? el.innerHTML : el.innerText.trim()` | Direkter `el.innerText.trim()` — `richText` existiert nicht | 🔴 SOFORT | TOMB-L008 Zombie. Immer `false`. Dead Condition. |
| `ui.js` | `_bindTagInputs()` | `execCommand`-Block mit `querySelectorAll('[data-cmd]')` | ENTFÄLLT — kein Ersatz nötig | 🔴 SOFORT | TOMB-EXEC-001. plaintext-only ignoriert execCommand strukturell. |
| `ui.js` | `_onContentChange()` | `entry.richText ? _safeSetHTML(...) : _safeSet(...)` | Direktes `_safeSet(...)` | 🔴 SOFORT | TOMB-L008 Zombie × 2. |
| `ui.js` | `_syncAllToDOM()` | `entry.richText ? _safeSetHTML(...) : _safeSet(...)` | Direktes `_safeSet(...)` | 🔴 SOFORT | TOMB-L008 Zombie × 2. |
| `ui.js` | `_safeSetHTML()` | `el.innerHTML = html` | ENTFÄLLT — MANDATE-INJ | 🔴 SOFORT | TOMB-U002. Dead Code + Sicherheitsrisiko. |
| `ui.js` | `_bindActions()` | `on('btn-import-trigger', () => fileInput.click())` | `<label for="file-import">` | 🔴 SOFORT | BRAIN-015 A-2. 1 EventListener eliminiert. |
| `ui.js` | `_bindProfileDialog()` | `document.getElementById('dialog-profile')?.hidePopover?.()` | `commandfor="dialog-profile" command="hide-popover"` am Save-Button | 🟠 NÄCHSTE | BRAIN-015 B-1. Invoker Command. Chrome 133+. |
| `ui.js` | `_bindActions()` | `document.getElementById('btn-dev-reset')?.addEventListener('click', ...)` | `commandfor="dlg-confirm-reset" command="show-popover"` (wenn Confirm-Dialog existiert) | 🟡 SPÄTER | Invoker Commands. Kein sofortiger Nutzen ohne Confirm-Dialog. |
| `ui.js` | `_toast()` | `setTimeout(() => el.remove(), 3200)` | **Partiell**: `animationend`-Event statt `setTimeout` | 🟡 SPÄTER | Animation läuft bereits 3.2s in CSS. `setTimeout(3200)` ist Duplikat. `el.addEventListener('animationend', () => el.remove())` ist robuster. Kein CSS-Ersatz möglich (DOM-Cleanup). |
| `ui.js` | `_setStatus()` | `el.textContent = msg` bei jedem Boot/Action | CSS `content: attr(data-status)` auf `#statusbar` | 🟡 SPÄTER | `statusbar.dataset.status = msg` → CSS rendert. Eliminiert DOM-Write. |
| `devmode.js` | `_renderTagInspector()` | `new Date().toLocaleTimeString('de')` | `Temporal.Now.plainTimeISO(Temporal.Now.timeZoneId())` | 🟠 NÄCHSTE | ANTI-016. `new Date()` für Timestamps verboten. Dritte Fundstelle nach `logic.js` und `app.js`. |
| `devmode.js` | `_bind5xClick()` | `body.dataset.toast = 'dev-unlocked'` + `setTimeout(() => delete body.dataset.toast, 3200)` | `@starting-style` für Entry-Animation bereits in CSS. `setTimeout` für Cleanup nötig — **kein vollständiger CSS-Ersatz**. | 🟡 SPÄTER | CSS übernimmt visuelle Animation. JS-Cleanup bleibt. |
| `devmode.js` | `_bindAkinatorTerminal()` | `btn.dataset.copied = 'true'` + `setTimeout(() => delete btn.dataset.copied, 1800)` | `@starting-style` für Button-Feedback-Animation | 🟡 SPÄTER | `[data-copied="true"]` CSS-Regel existiert bereits in `sidebar.css`. Timing bleibt JS. |
| `devmode.js` | `_startLiveInspector()` | `new MutationObserver(...)` auf `#paper` | **Kein nativer Ersatz** — bleibt | ✅ BLEIBT | contenteditable characterData-Changes sind nicht per CSS detektierbar. MutationObserver ist die korrekte API. |
| `model-blacklist.js` | `renderModelSelect()` | `el.innerHTML = ''` | `el.replaceChildren()` | 🟡 SPÄTER | `replaceChildren()` ist semantisch klarer, sicherer, native DOM API. `innerHTML = ''` ist hier kein MANDATE-INJ-Verstoß (kein User-Content), aber `replaceChildren()` ist die sauberere Alternative. |
| `state.js` | `save()` | `catch { /* quota exceeded — silent */ }` | `catch(e) { if (e instanceof DOMException && e.name === 'QuotaExceededError') { ... Prioritäts-Recovery ... } }` | 🟠 NÄCHSTE | G-002. BRAIN-009 v6.0.0 Teil V spezifiziert die Recovery-Logik. Typed catch ist erster Schritt. |
| `index.html` | L.1 | `<html data-layout="form-b">` | ENTFÄLLT — vollständig toter Code | 🔴 SOFORT | TOMB-HTML-002. Kein CSS-Selektor, kein JS liest `documentElement.dataset.layout`. Liegt immer auf `form-b` — lügt nach Form-Wechsel. |
| `index.html` | Radios | `onchange="document.getElementById('paper').dataset.layout=...;localStorage.setItem(...)"` | Event-Delegation in `ui.js:_bindActions()` | 🟠 NÄCHSTE | No-JS-Doctrine. Inline-Handler verletzen MANDATE-000 und erschweren Testing. |
| `index.html` | Checkbox | `onchange="document.getElementById('paper').dataset.guides=this.checked"` | Event-Delegation in `ui.js:_bindActions()` | 🟠 NÄCHSTE | Identisches Problem. |
| `index.html` | 6x | `popovertarget` / `popovertargetaction` | `commandfor` / `command` | 🟠 NÄCHSTE | BRAIN-015 B-2. Chrome 133+. Vollständige Tabelle in `20_integrity_audit_v1.0.0.md` N-002. |

---

## 2. CSS → HTML Attribute Migration Candidates

| Datei | Selektor / Regel | Aktuell | Vorgeschlagenes HTML + CSS | Priorität | Kommentar |
|---|---|---|---|---|---|
| `din5008-paper.css` | Z.17 | `@layer din.core, ui.theme, project.overrides;` | `@layer latex.base, din.core, ui.theme, project.overrides;` | 🔴 SOFORT | K-003 / BRAIN-015. `latex.base` fehlt noch. Spec zementiert in `03_technical_blueprint_v1.2.0.md`. |
| `din5008-paper.css` | `:root {}` | 14x untypisierte Custom Properties | `@property --subject-top { syntax:"<length>"; initial-value:103.4mm; inherits:true; }` × 14 | 🟠 NÄCHSTE | BRAIN-015 A-8. Chrome 85+. Typsicherheit, Animierbarkeit, Browser-Validierung. |
| `din5008-paper.css` | `@layer din.core` | Globale `din-*` Selektoren ohne Scope | `@scope (#paper) { @layer din.core { din-subject { ... } } }` | 🟠 NÄCHSTE | BRAIN-015 A-3. Chrome 118+. Strukturelle Isolation. |
| `din5008-paper.css` | `:root {}` | Kein `interpolate-size` | `:root { interpolate-size: allow-keywords; }` | 🟠 NÄCHSTE | BRAIN-015 A-5. Chrome 129+. Ermöglicht `height: auto` Transitions ohne JS. |
| `devmode.css` | `.toast` | `animation: toast-in-out 3.2s forwards` — Entry-Phase via Keyframe 0%–10% | `@starting-style { .toast { opacity: 0; transform: translateY(12px); } }` + Transition statt Keyframe für Entry | 🟠 NÄCHSTE | BRAIN-015 A-4. Chrome 117+. Saubere Trennung Entry/Exit-Animation. |
| `devmode.css` | `#toast-dev` | `bottom: -80px` default + `transition: bottom 0.3s` + `animation: toast-stay 3.2s` | `@starting-style { #toast-dev { opacity: 0; translate: 0 80px; } }` | 🟠 NÄCHSTE | Doppelt-Animation: einmal `transition`, einmal `@keyframes`. Widersprüchlich. `@starting-style` bereinigt das. |
| `devmode.css` | `#iban-ghost` | `position: absolute; inset: 0` auf Wrapper | Mit CSS Anchor Positioning: `#p-iban { anchor-name: --iban-field; }` → Ghost positioniert via `position-anchor` | 🟡 SPÄTER | Chrome 125+. Elegant aber kein dringender Defekt. Heutiger Stand funktioniert korrekt. |
| `sidebar.css` | `.sidebar-btn:hover` | `background: #333` (hardcoded Duplicate) | `oklch(from var(--sidebar-btn-bg) calc(l + 0.05) c h)` | 🟠 NÄCHSTE | BRAIN-015 D-1. Relative Color Syntax. Chrome 119+. Alle Hover/Active-Varianten mathematisch. |
| `sidebar.css` | `.sidebar-btn.primary:hover` | `background: #2a5a8a` (hardcoded) | `oklch(from var(--sidebar-btn-primary) calc(l + 0.05) c h)` | 🟠 NÄCHSTE | Identisch. |
| `sidebar.css` | `#akinator-output` | `rows="10"` Hardcoded + kein Resize-CSS | `textarea { field-sizing: content; min-height: 3lh; max-height: 60vh; }` | 🟠 NÄCHSTE | BRAIN-015 A-6. Chrome 123+. `rows` Attribut entfernen. |
| `din5008-paper.css` | `project.overrides` | `[data-placeholder]:empty::before { content: attr(data-placeholder); }` | Bereits korrekt — kein Handlungsbedarf | ✅ PERFEKT | Das ist die Vorlage für das Pattern. Kein Fix nötig. |
| `din5008-paper.css` | `din-salutation[data-gender="..."]` | `::before` rendert Placeholder | Bereits korrekt — CSS ohne JS | ✅ PERFEKT | No-JS-Doctrine vollständig erfüllt. |
| `devmode.css` | `body[data-devmode="true"] .dev-only` | `display: flex` | Korrekt — data-Attribut-gesteuerter Toggle | ✅ PERFEKT | ADR-003 erfüllt. |
| `din5008-paper.css` | `#paper:has([contenteditable]:focus-within) #editor-toolbar` | `:has()` Toolbar-Toggle | Bereits korrekt — pure CSS State Machine | ✅ PERFEKT | Vorzeige-Beispiel der No-JS-Doctrine. |
| `din5008-paper.css` | `@media print { ... !important }` | `!important` in Print-Reset | Durch `@layer` überflüssig — Print lebt außerhalb der Layer | 🟡 SPÄTER | Die `!important` in Print-Rules sind technisch korrekt (Print überschreibt Layer), aber mit `@layer`-Architektur könnten sie via Spezifität gelöst werden. Kein dringender Fix. |


---

## 3. Future-Proof Markers — Chrome 150–160+ Horizon

Diese Marker werden HEUTE in den Code geschrieben. Kein funktionaler Impact.
Signalisieren zukünftigen Agenten: „Hier wartet ein Upgrade."

---

### FP-001 | Typed `attr()` — `data-cma-*` Konsumtion
**Ziel-Feature:** CSS Values Level 5 — `top: attr(data-cma-top type(<length>))`
**Chrome-Horizon:** ~150 (experimentell), GA unbekannt
**Vorbereitung bereits erfolgt:** Alle `data-cma-*` Attribute sind im IMR Sektion J spezifiziert.
**Marker heute setzen in:** `css/din5008-paper.css` — Kommentar über `din-subject` Regel:
```
/* FUTURE-PROOF: Typed attr() ~Chrome 150 – wenn GA:
   top: attr(data-cma-top type(<length>)) ersetzt var(--subject-top).
   Dann: initCMABridge() + cma-bridge.js komplett eliminierbar. */
```
**Marker heute setzen in:** `index.html` — über jedem `<din-*>` Tag:
```html
<!-- data-cma-top="103.4mm" data-cma-left="25mm" data-cma-width="165mm"
     FUTURE-PROOF: CSS Values L5 Typed attr() ~Chrome 150 -->
```

---

### FP-002 | CSS `@function` — CMA mm→px Kalkulation
**Ziel-Feature:** CSS Custom Functions — `@function --mm-to-px(--mm) { result: calc(var(--mm) * 3.7795); }`
**Chrome-Horizon:** ~155 (Origin Trial 2025), GA unklar
**Heute relevanter Code:** `js/core/cma-bridge.js` — Px-Konversionslogik in `constants.js`
**Marker heute setzen in:** `css/din5008-paper.css` über `:root {}`:
```css
/* FUTURE-PROOF: CSS @function ~Chrome 155 – wenn GA:
   @function --mm-to-px(--mm) { result: calc(var(--mm) * 3.7795px); }
   Dann: CMA-px-Konversion in JS eliminierbar. */
```

---

### FP-003 | CSS `if()` — Inline-Konditionals für Sidebar-Theming
**Ziel-Feature:** CSS `if()` Inline-Funktion — `color: if(style(--scheme: dark): white; else: black)`
**Chrome-Horizon:** ~148 (Nightly 2025 verfügbar), GA ~150
**Heute relevanter Code:** `css/sidebar.css` — manuelle Dark-Theme Farbwerte
**Marker heute setzen in:** `css/sidebar.css` über Sidebar-Farb-Variablen:
```css
/* FUTURE-PROOF: CSS if() ~Chrome 148–150 – wenn GA:
   background: if(style(--sidebar-theme: light): var(--light-bg); else: var(--dark-bg));
   Eliminiert explizite body[data-devmode] Selektor-Duplikate. */
```

---

### FP-004 | `text-wrap: balance` für `din-subject`
**Ziel-Feature:** `text-wrap: balance` — Chrome 114+ (bereits stable!)
**Chrome-Stand: JETZT EINSETZBAR**
**Heute relevanter Code:** `din-subject { white-space: nowrap; }` in `@layer din.core`
**Handlungsbedarf:** `white-space: nowrap` ist korrekt (DIN 5008: Betreff einzeilig).
Für zukünftigen mehrzeiligen Modus (SPEC-Kandidat):
```css
/* FUTURE-PROOF: text-wrap: balance – Chrome 114+ stabil.
   Wenn din-subject mehrzeilig erlaubt wird (SPEC-Kandidat):
   din-subject { text-wrap: balance; white-space: normal; } */
```

---

### FP-005 | `text-wrap: pretty` für `din-body-mirror`
**Ziel-Feature:** `text-wrap: pretty` — Chrome 117+ (bereits stable!)
**Chrome-Stand: JETZT EINSETZBAR** wenn `din-body-mirror` implementiert wird
**Marker heute setzen in:** Kommentar in `css/din5008-paper.css` über `din-body` Regel:
```css
/* FUTURE-PROOF: text-wrap: pretty – Chrome 117+ stabil.
   Bei din-body-mirror Implementierung sofort setzen:
   din-body-mirror { text-wrap: pretty; }
   Verhindert typografisch unschöne letzte Zeilen (Hurenkinder). */
```

---

### FP-006 | CSS Container Queries — Responsive Sidebar
**Ziel-Feature:** `@container` Size Queries — Chrome 105+ (bereits stable!)
**Chrome-Stand: JETZT EINSETZBAR**
**Heute relevanter Code:** `css/sidebar.css` — feste 300px Breite, keine Responsive-Logik
**Marker heute setzen in:** `css/sidebar.css` über `#sidebar-left`:
```css
/* FUTURE-PROOF: @container bereits Chrome 105+ stabil.
   Wenn Responsive-Sidebar (z.B. Tablet-Modus) SPEC-Kandidat:
   #sidebar-left { container-type: inline-size; container-name: sidebar; }
   @container sidebar (width < 200px) { .sidebar-label { display: none; } } */
```

---

### FP-007 | CSS Style Queries — Dark/Light Theme via Custom Property
**Ziel-Feature:** `@container style(--theme: dark)` — Chrome 111+ für Custom Properties (bereits stable!)
**Chrome-Stand: JETZT EINSETZBAR** für Custom Property Style Queries
**Heute relevanter Code:** `css/devmode.css` — `body[data-devmode="true"]` Selektor-Muster
**Marker heute setzen in:** `css/devmode.css`:
```css
/* FUTURE-PROOF: CSS Style Queries Chrome 111+ (Custom Properties).
   Wenn Theme-System via CSS Custom Property statt data-Attribut:
   :root { --theme: dark; }
   @container style(--theme: dark) { .dev-only { ... } }
   Eliminiert body[data-devmode] Selektoren. */
```

---

### FP-008 | `position-try-fallbacks` für Anchor-Tooltips
**Ziel-Feature:** `position-try-fallbacks: flip-block flip-inline` — Chrome 125+ (bereits stable!)
**Chrome-Stand: JETZT EINSETZBAR** wenn Anchor-Tooltips implementiert werden
**Heute relevanter Code:** IMR v2.3.0 Sektion L — alle 11 Anker definiert, Tooltips aber nicht implementiert
**Marker heute setzen in:** Kommentar in zukünftiger Tooltip-Implementierung:
```css
/* FUTURE-PROOF: position-try-fallbacks Chrome 125+ stabil.
   Alle din-* Tooltips müssen dieses Pattern tragen:
   .din-hint {
     position-anchor: --din-[key];
     position-area: inline-end center;
     position-try-fallbacks: flip-inline, flip-block, flip-inline flip-block;
   }
   Verhindert Viewport-Overflow automatisch. Kein JS nötig. */
```

---

### FP-009 | `interestfor` + `popover=hint` — Native Tooltip-System
**Ziel-Feature:** `<button interestfor="tooltip-id">` + `<div popover="hint">` — Chrome 135+
**Chrome-Stand: Chrome 135+ stabil (hint variant)**
**Heute relevanter Code:** Keine Tooltip-Implementierung vorhanden
**Marker heute setzen in:** Kommentar in `index.html` über Editor-Toolbar:
```html
<!-- FUTURE-PROOF: interestfor + popover=hint Chrome 135+ stabil.
     Für alle 11 din-* Tooltips (IMR Sektion L):
     <din-subject interestfor="hint-subject">
     <div id="hint-subject" popover="hint">Betreff: max. 1 Zeile</div>
     Kein JS-hover-Handling mehr. CSS Anchor Positioning positioniert. -->
```


---

## 4. Checkliste für die nächste Implementierungs-Session

### 🔴 SOFORT — Kein Risiko, maximaler Gewinn (alle bekannt, alle spezifiziert)

```
[ ] D-001  app.js + cma-bridge.js: initCMABridge() komplett löschen
           /* DEAD: See TOMB-B001 */
[ ] D-001b cma-bridge.js: switchForm() auf reines dataset.layout reduzieren
           /* DEAD: See TOMB-B002 — setProperty entfernt */
[ ] D-001c cma-bridge.js: Wenn nur dataset.layout übrig → Datei eliminieren
           /* DEAD: See TOMB-B001 + TOMB-B002 — Datei stirbt */
[ ] I-001  index.html: din-body contenteditable="true" → "plaintext-only"
           <!-- ADR-008: plaintext-only PFLICHT. Kein richText. -->
[ ] D-002  ui.js + index.html: execCommand-Block + 3x data-cmd Buttons löschen
           /* DEAD: See TOMB-EXEC-001 */
[ ] D-003  ui.js: _safeSetHTML() Methode löschen
           /* DEAD: See TOMB-U002 — MANDATE-INJ */
[ ] D-004  ui.js: entry.richText Ternaries (3x) → direkter _safeSet() Aufruf
           /* DEAD: See TOMB-L008 */
[ ] D-005  index.html: data-layout="form-b" von <html> entfernen
           <!-- REMOVED: See TOMB-HTML-002 — vollständig toter Code -->
[ ] N-001  index.html + ui.js: btn-import-trigger → label for="file-import"
[ ] N-006  css/din5008-paper.css: @layer latex.base hinzufügen (erste Zeile)
[ ] app.js Z.38: formatDate(new Date()) MARKER setzen:
           /* NATIVE REPLACE ME – See TOMB-L001 / BRAIN-018: Temporal.Now.plainDate(timeZoneId) */
```

### 🟠 NÄCHSTE RUNDE — Spec-Debt + Chrome-Native Umstellungen

```
[ ] N-002  index.html: 6x popovertarget → commandfor/command
[ ] N-003  logic.js: todayISO() → Temporal.Now.plainDateISO(timeZoneId)
           parseDate() bleibt! (BRAIN-018 Tier-0-Ausnahme)
[ ] N-004  app.js: formatDate(new Date()) → Temporal.Now.plainDate(timeZoneId)
[ ] N-004b index.html: 3x Inline-onchange-Handler → Event-Delegation ui.js
[ ] N-009  cma-bridge.js: switchForm() setProperty löschen / Datei eliminieren
[ ] I-002  state.js: 4x falsche DEFAULT_STATE Keys korrigieren (Code-Smell)
[ ] N-006b css: @property für alle 14 CMA-Variablen
[ ] N-007  css: @scope (#paper) um @layer din.core
[ ] N-007b css: interpolate-size: allow-keywords in :root
[ ] N-008  css/sidebar.css: field-sizing: content für #akinator-output
[ ] CSS    css/sidebar.css: Relative Color Syntax für Hover-Farben
[ ] CSS    devmode.css: @starting-style für Toast Entry-Animation
[ ] devmode.js: new Date().toLocaleTimeString() → Temporal (dritte Fundstelle)
[ ] state.js: catch → catch(e) mit explizitem QuotaExceededError-Check
[ ] ui.js: _toast() setTimeout → animationend Event
[ ] ui.js: _setStatus() → dataset.status Pattern (content: attr(data-status))
[ ] model-blacklist.js: el.innerHTML = '' → el.replaceChildren()
```

### 🟣 FUTURE-PROOF MARKER SETZEN (heute, 0 funktionaler Impact)

```
[ ] FP-001 css/din5008-paper.css: Marker für Typed attr() ~Chrome 150
[ ] FP-002 css/din5008-paper.css: Marker für CSS @function ~Chrome 155
[ ] FP-003 css/sidebar.css: Marker für CSS if() ~Chrome 148–150
[ ] FP-004 css/din5008-paper.css: Marker für text-wrap: balance (din-subject)
[ ] FP-005 css/din5008-paper.css: Marker für text-wrap: pretty (din-body-mirror)
[ ] FP-006 css/sidebar.css: Marker für @container Responsive-Sidebar
[ ] FP-007 css/devmode.css: Marker für CSS Style Queries
[ ] FP-008 Tooltip-Implementierung: Marker für position-try-fallbacks
[ ] FP-009 index.html: Marker für interestfor + popover=hint
```

### 🟢 EIGENE SPECS — Große Implementierungs-Projekte

```
[ ] I-003+I-004  din-body-mirror im DOM + break-inside (KRITISCHER GAP)
                 Solange nicht implementiert: Print ist nicht DIN-konform für Markdown
[ ] G-002        ui.js JSON-Import: Strict Schema Gate (IMR v2.4.0 Sektion M)
                 Aktuell: blindes JSON.parse ohne Key-Validation → Datenverlust silent
[ ] I-005        state.js: QuotaExceededError Recovery (BRAIN-009 v6.0.0 Teil V)
```

---

## Besondere Funde — Nicht in Audit-Vorgänger dokumentiert

### NEU-001 | `devmode.js` — Dritte `new Date()` Fundstelle | ANTI-016

`_renderTagInspector()` Z.~67: `new Date().toLocaleTimeString('de')`

Dritte ANTI-016-Verletzung. `toLocaleTimeString('de')` ist locale-abhängig UND
gibt keinen deterministischen String zurück. Wenn Temporal vollständig migriert ist:
`Temporal.Now.plainTimeISO(Temporal.Now.timeZoneId()).toLocaleString('de')` oder
schlicht `Temporal.Now.plainTime(Temporal.Now.timeZoneId()).toString().substring(0,8)`.

Marker setzen: `/* NATIVE REPLACE ME – See TOMB-L001 / ANTI-016: Temporal statt new Date() */`

---

### NEU-002 | `model-blacklist.js:renderModelSelect()` — `el.innerHTML = ''` Pattern

Technisch kein MANDATE-INJ-Verstoß (kein User-Content, nur UI-Reset).
Aber `el.innerHTML = ''` ist die schlechtere API verglichen mit `el.replaceChildren()`:
- `replaceChildren()` ist semantisch explizit ("alle Kinder ersetzen")
- `replaceChildren()` ist GC-freundlicher (entfernt Event-Listener auf Kinder)
- `replaceChildren()` Chrome 86+ stabil

Marker setzen: `/* NATIVE REPLACE ME: el.replaceChildren() statt innerHTML = '' */`

---

### NEU-003 | `devmode.css` Toast-Doppel-Animation — Widerspruch

`#toast-dev` hat sowohl `transition: bottom 0.3s ease` (für Slide-in)
als auch `animation: toast-stay 3.2s forwards` (für Stay+Slide-out).
Beide beeinflussen `bottom`. Das ist ein impliziter Konflikt:
CSS `transition` und CSS `animation` auf dieselbe Property auf demselben Element
sind undefined behavior in manchen Edge-Cases.

Saubere Lösung: `@starting-style` für Entry + `@keyframes` nur für Exit.
Kein `transition` auf `bottom` mehr nötig.

Marker setzen in `devmode.css`: `/* NATIVE REPLACE ME: @starting-style eliminiert transition + animation Konflikt */`

---

### NEU-004 | JSON-Import Strict Schema Gate fehlt (G-002 Grok-Kritik)

`ui.js:_bindActions()` FileReader `onload`:
```javascript
reader.onload = ev => {
  try { this.sm.load(JSON.parse(ev.target.result)); ... }
  catch { this._toast('❌ Ungültige Datei', 'error'); }
};
```

Kein Key-Validation. Ein JSON mit `sender_line`, `body_text` etc. wird akzeptiert
und still ignoriert. IMR v2.4.0 Sektion M fordert das Strict Schema Gate.
Marker setzen: `/* NATIVE REPLACE ME – See IMR v2.4.0 Sektion M: Strict Schema Gate fehlt */`

---

## SIGNATURE

```
Auditor:  Lead Native Purity Architect (Aviation Grade)
Datum:    2026-03-21
Methode:  Vollständiger Zeilenscan aller JS/CSS/HTML Dateien
          Context7 für Chrome 150–160+ Horizon-Features
Neu entdeckt: 4 Befunde die in v19/v20 fehlten (NEU-001 bis NEU-004)

Fazit:
Das System ist in einem besseren Zustand als sein Code-Debt vermuten lässt.
Die Kern-Architektur (IMR, @layer, ADR-008/009) ist sauber.
Der Debt ist konzentriert auf 5 Dead-Code-Blöcke (D-001 bis D-005),
eine ADR-008-Verletzung im DOM (I-001), und ausstehende Chrome-146+ Migrationen.

Kritischste Aktion: I-001 — ein Zeichen-Änderung im Live-DOM.
Kritischster Gap: Ghost-Mirror (din-body-mirror fehlt) — Print-Layout nicht DIN-konform.
Kritischster Security-Fund: _safeSetHTML() (D-003) — dead code mit innerHTML.

Future-Proof-Readiness: HOCH.
data-cma-* Attribute bereit für Typed attr(). @layer-Architektur bereit für latex.base.
IMR Sektion L bereit für Anchor Positioning. 9 Horizon-Marker identifiziert.
```
