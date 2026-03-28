---
tags: [aviation-grade, platinum-2026, architecture, legacy-purge, cemetery, guardrails]
status: cemented-pending-approval
version: 1.0.0
last_audit: 2026-03-21
id: BRAIN-019-TOMB-V2
supersedes: 19_final_cleanup_audit_and_cemetery_v3.0.0.md
traceability: [BRAIN-017, BRAIN-018, BRAIN-008, BRAIN-015, BRAIN-003, MANDATE-NO-LEGACY]
corrections: [I-002 herabgestuft, TOMB-B002 neu, TOMB-GHOST-001 neu, I-001 präzisiert]
---

# 20 — Integrity Audit v1.0.0 — Korrigierter Second Pass

## Audit-Erklärung

Dieser Report ersetzt `19_final_cleanup_audit_and_cemetery_v3.0.0.md`.
Korrigiert: 7 präzise Kritikpunkte (externe Peer-Review).
Methodik: Vollständiger Codebefund bleibt identisch.
Korrekturen: Bewertungen, Schärfe, neue TOMBs.

**KORREKTUREN GEGENÜBER v3.0.0:**
1. I-002: Von KRITISCH auf TECHNISCHE SCHULDEN herabgestuft → TOMB-STATE-002
2. switchForm() neu als TOMB-B002 (KRITISCH) — ADR-009 gilt ohne Ausnahme
3. I-001: Positiver Kontext ergänzt (10/11 Compliance)
4. Temporal: Klare parseDate()-Ausnahme nach BRAIN-018
5. data-layout am html: In DESTRUCTION LIST hochgestuft
6. Ghost-Mirror: Von PENDING auf KRITISCHER GAP hochgestuft → TOMB-GHOST-001
7. Inline-Handler, popovertarget, @property/@scope/field-sizing: Verschärft

---

## KATEGORIE 1: DESTRUCTION LIST — Sofort löschbarer Dead Code

### D-001 | initCMABridge() — 14 setProperty-Calls | ADR-009 / TOMB-B001

**Fundstelle:** `js/core/app.js` Z.14 + Z.32
**Fundstelle:** `js/core/cma-bridge.js` — `initCMABridge()` Funktion (~30 Zeilen)

**Befund:** `initCMABridge()` schreibt 14 CSS Custom Properties via `setProperty()`.
Alle 14 sind in `css/din5008-paper.css :root {}` identisch vorhanden.
ADR-009 erklärt CSS als primäre SSoT. Diese Funktion ist Dead Code.

**Lösch-Anweisung:**
1. `app.js`: Import-Zeile löschen
2. `app.js`: `initCMABridge(storedForm)` Aufruf + Kommentar löschen
3. `cma-bridge.js`: `initCMABridge()` Funktion löschen
4. `/* DEAD: See TOMB-B001 */` vor Löschung setzen

---

### D-002 | execCommand Toolbar-Bindings | ADR-008 / TOMB-EXEC-001

**Fundstelle:** `js/ui/ui.js` in `_bindTagInputs()` — `querySelectorAll('[data-cmd]')` Block
**Fundstelle:** `index.html` — `<button data-cmd="bold">`, `data-cmd="italic"`, `data-cmd="underline"`

**Befund:** `contenteditable="plaintext-only"` blockiert HTML-Injektion strukturell.
`execCommand` auf plaintext-only ist ein No-Op. Die Buttons täuschen Funktionalität vor.
Täuschung + Dead Code + Einladung zur ADR-008-Regression.

**Lösch-Anweisung:**
1. `ui.js`: gesamter `querySelectorAll('[data-cmd]')` Block löschen
2. `index.html`: 3x `data-cmd` Buttons löschen (Undo/Redo behalten!)
3. `/* DEAD: See TOMB-EXEC-001 */` setzen

---

### D-003 | _safeSetHTML() | TOMB-U002 | Sicherheitsrelevant

**Fundstelle:** `js/ui/ui.js` Methode `_safeSetHTML(el, html)`

**Befund:** Unkontrolliertes `innerHTML =` ohne Sanitizer — MANDATE-INJ-Verstoß.
Methodenaufruf ist dead code (entry.richText immer undefined).
Existenz allein ist Sicherheitsrisiko — zukünftiger Entwickler könnte sie missbrauchen.
**Höchste Sicherheitspriorität im gesamten Dead-Code-Bestand.**

**Lösch-Anweisung:** Methode löschen. `/* DEAD: See TOMB-U002 — MANDATE-INJ */`

---

### D-004 | entry.richText Zombie-Ternaries | TOMB-L008

**Fundstellen:** `ui.js` — 3x `entry.richText ? ... : ...` (immer false)
`_bindTagInputs()`, `_onContentChange()`, `_syncAllToDOM()`

**Lösch-Anweisung:** Ternary vereinfachen zu direktem `_safeSet()`.
`/* DEAD: See TOMB-L008 */`

---

### D-005 | html[data-layout="form-b"] | TOMB-HTML-002 | HOCHGESTUFT

**Fundstelle:** `index.html` Z.1: `<html lang="de" data-layout="form-b">`
**Fundstelle:** Inline-Handler in den Form-Radios schreiben aktiv `data-layout` auf `#paper`.

**Befund (korrigiert gegenüber v3.0.0):**
Das Attribut am `<html>`-Element ist nicht nur Dead Weight — es ist eine
**aktive Inkonsistenz mit der No-JS-Doctrine**. Die Inline-onchange-Handler
auf den Radios schreiben `document.getElementById('paper').dataset.layout`,
nicht `document.documentElement.dataset.layout`. Das `<html>`-Attribut wird
nie aktualisiert, wenn der Nutzer Form wechselt. Es zeigt immer `form-b` —
unabhängig vom tatsächlichen Zustand.

Ein Attribut das beim App-Start `form-b` zeigt und beim Wechsel zu Form-A
nicht aktualisiert wird ist schlimmer als gar kein Attribut: Es lügt.

**Lösch-Anweisung:** `data-layout="form-b"` aus `<html>` entfernen.
`<!-- REMOVED: See TOMB-HTML-002 -->`


---

## KATEGORIE 2: NATIVE REPLACEMENT — Chrome-Native Umstellungen

### N-001 | btn-import-trigger → native label

**Fundstelle:** `ui.js:_bindActions()` + `index.html`

**Befund:** JS-Klick auf File-Input. Native Alternative seit HTML3.
`<label for="file-import">` übernimmt den Klick ohne JS.
1 EventListener eliminiert. 0 Risiko.

---

### N-002 | popovertarget → commandfor — BRAIN-015 B-2

**Fundstelle:** `index.html` — 6 Buttons mit `popovertarget` / `popovertargetaction`

| Button | Jetzt | Soll |
|--------|-------|------|
| Debugger öffnen | `popovertarget="sidebar-right"` | `commandfor="sidebar-right" command="show-popover"` |
| Profil öffnen | `popovertarget="dialog-profile"` | `commandfor="dialog-profile" command="show-popover"` |
| Inspector öffnen | `popovertarget="sidebar-right"` | `commandfor="sidebar-right" command="show-popover"` |
| Sidebar schließen ✕ | `popovertargetaction="hide"` | `command="hide-popover"` |
| Dialog Abbrechen | `popovertargetaction="hide"` | `command="hide-popover"` |
| Dialog schließen ✕ | `popovertargetaction="hide"` | `command="hide-popover"` |

Chrome 133+ stabil. Kein @supports bei Chrome 145+ Mandate.

---

### N-003 | todayISO() → Temporal | TOMB-L001 — KLARE DIFFERENZIERUNG

**Fundstelle:** `logic.js:todayISO()` — `new Date()` für Datumsberechnung (PFLICHT-MIGRATION)
**Fundstelle:** `app.js` Boot — `formatDate(new Date(), fmt)` (PFLICHT-MIGRATION)

**Migration:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`

**EXPLIZITE AUSNAHME (BRAIN-018 zementiert):**
`parseDate(input)` in `logic.js` darf `new Date(string)` behalten.
Begründung: `parseDate()` ist Tier-0-Fachlogik für das Parsen von
Nutzer-Input-Strings — kein Zeitstempel-Generator. Die Temporal-Migration
betrifft ausschließlich Funktionen die "jetzt" bestimmen, nicht solche
die fremde Strings parsen. Diese Grenze ist klar, nicht verhandelbar.

---

### N-004 | Inline onchange-Handler — No-JS-Doctrine Verletzung

**Fundstellen:** `index.html` — Form-A/B Radios + Guides-Checkbox:
```
onchange="document.getElementById('paper').dataset.layout=this.value;
          localStorage.setItem('neo_form','A')"
```

**Befund:** Inline-JS ist grundlegend mit der No-JS-Doctrine und MANDATE-000 unvereinbar.
Drei Probleme:
1. `localStorage.setItem` direkt im HTML — Seiteneffekt ohne Kontrolle
2. `document.getElementById('paper')` aus HTML heraus — DOM-Coupling
3. `switchForm()` in `cma-bridge.js` wird umgangen — Logik nicht zentralisiert

Migration: Event-Delegation in `ui.js:_bindActions()`.
Inline-Handler vollständig entfernen.

---

### N-005 | @layer latex.base fehlt — K-003 noch nicht implementiert

**Fundstelle:** `css/din5008-paper.css` Z.17: `@layer din.core, ui.theme, project.overrides;`

**Befund:** `03_technical_blueprint_v1.2.0.md` zementiert die Layer-Deklaration als:
`@layer latex.base, din.core, ui.theme, project.overrides;`
Spec und Code divergieren. Kein Laufzeitfehler (latex.base enthält noch keine Regeln),
aber die fehlende Deklaration muss vor dem ersten latex.base-Inhalt gesetzt werden.

---

### N-006 | @property für 14 CMA-Variablen fehlt — BRAIN-015 A-8

**Fundstelle:** `css/din5008-paper.css :root {}` — alle Variablen untypisiert

**Befund:** Untypisierte Custom Properties lassen fehlerhafte Werte
(`--subject-top: "hallo"`) ohne Browser-Feedback durch.
`@property --subject-top { syntax:"<length>"; initial-value:103.4mm; inherits:true; }`
Chrome 85+ stabil. Kein Implementierungshindernis. Ausstehend seit BRAIN-015 A-8.

---

### N-007 | @scope (#paper) fehlt — BRAIN-015 A-3

**Fundstelle:** `css/din5008-paper.css` — kein `@scope (#paper)`

**Befund:** `din-*` Selektoren haben globale Dokument-Reichweite.
BRAIN-015 A-3 fordert strukturelle Isolation via `@scope (#paper)`.
Chrome 118+ stabil. Ausstehend.

---

### N-008 | field-sizing fehlt — BRAIN-015 A-6

**Fundstelle:** `index.html` — `#akinator-output textarea rows="10"`

**Befund:** JS-scrollHeight-Hack für Auto-Resize. Native Alternative:
`textarea { field-sizing: content; min-height: 3lh; }`. Chrome 123+.

---

### N-009 | switchForm() — TOMB-B002 | ADR-009 VERLETZUNG

**Fundstelle:** `js/core/cma-bridge.js:switchForm()` + `app.js` Import-Aufruf

**Befund (NEU — KRITISCH, in v3.0.0 falsch bewertet):**
In v3.0.0 wurde `switchForm()` als „legitimer dynamischer Konsument" eingestuft.
Das war falsch im Kontext von ADR-009.

ADR-009 sagt: CSS ist die primäre SSoT für CMA-Koordinaten.
`--address-top: 27mm` (Form A) und `--address-top: 45mm` (Form B) sind
statische Konstanten — nicht dynamisch. Es gibt keine Laufzeit-Berechnung.
Es gibt nur zwei vordefinierte Werte.

Die CSS-Lösung existiert bereits in `@layer project.overrides`:
```css
#paper[data-layout="form-a"] #anschriftzone { top: var(--margin-top-a); }
#paper[data-layout="form-b"] #anschriftzone { top: var(--margin-top-b); }
```

`switchForm()` schreibt `--address-top` via `setProperty()` UND setzt
`paper.dataset.layout`. Der CSS-Layer `project.overrides` reagiert bereits
auf `paper.dataset.layout` — der `setProperty()`-Call in `switchForm()`
ist die Dopplung.

**Die saubere Lösung:** Nur `paper.dataset.layout` setzen (per Event-Delegation
aus dem Radio-Button). CSS `project.overrides` übernimmt den Rest automatisch.
`switchForm()` wird zu einem 1-Zeiler der nur `dataset.layout` setzt —
oder entfällt ganz.

**Lösch-Anweisung:** `setProperty('--address-top', ...)` aus `switchForm()` löschen.
`switchForm()` auf reines `paper.dataset.layout = ...` reduzieren oder eliminieren.
Wenn eliminiert: `cma-bridge.js` Datei komplett löschen + Import in `app.js` entfernen.
`/* DEAD: See TOMB-B002 — ADR-009: CSS project.overrides ist SSoT für Form-Toggle */`


---

## KATEGORIE 3: ISOMORPHIC FIX — Tag-Alignment & Schema-Konsistenz

### I-001 | din-body contenteditable="true" — ADR-008 VERLETZUNG | KRITISCH

**Fundstelle:** `index.html` — Sektion E:
```html
<din-body contenteditable="true" ...>
<!-- AUSNAHME: contenteditable="true" (formatierter Text erlaubt) -->
```

**Befund:**
ADR-008 ist ohne Ausnahmen: ALLE `<din-*>`-Tags tragen `contenteditable="plaintext-only"`.
Der Kommentar `AUSNAHME: ... (formatierter Text erlaubt)` ist eine Lüge im Live-DOM.
Er ist eine Einladung zur Regression — jeder künftige Entwickler der ihn liest
wird denken, rich text sei architektural erlaubt.

**Positiver Kontext (in v3.0.0 fehlend):**
10 von 11 `<din-*>`-Feldern sind bereits vollständig ADR-008-compliant:
`din-sender`, `din-note`, `din-recipient`, `din-date`, `din-your-ref`,
`din-our-ref`, `din-subject`, `din-salutation`, `din-greeting`, `din-signature`
— alle tragen korrekt `contenteditable="plaintext-only"`.

Nur `<din-body>` bricht das Gesetz. Ein einziges Feld von elf.
Das ist kein systemisches Versagen — es ist ein chirurgischer Fix.

**Fix-Anweisung:**
1. `contenteditable="true"` → `contenteditable="plaintext-only"`
2. Kommentar ersetzen durch:
   `<!-- ADR-008: plaintext-only PFLICHT. Formatierung via din-body-mirror. -->`
3. `<!-- TOMB-HTML-001: See TOMB-HTML-001 -->` auf alten Kommentar

---

### I-002 | state.js DEFAULT_STATE — Veraltete Keys | TECHNISCHE SCHULDEN (herabgestuft)

**Fundstelle:** `js/core/state.js DEFAULT_STATE.content`:
- `signatureName` → soll `signature` sein
- `returnAddress` → soll `sender` sein
- `recipientName` → soll `recipient` sein
- `specialNote` → soll `note` sein

**Befund (KORRIGIERT gegenüber v3.0.0 — war: "KRITISCH / Tick-Zeitbombe"):**

Das ist kein Laufzeit-Risiko und keine Tick-Zeitbombe. Die Bewertung in v3.0.0 war übertrieben.

Tatsächliches Verhalten:
- Beim ersten Boot (kein LocalStorage): alle Felder leer → korrekt
- Beim Tippen: `_bindTagInputs()` schreibt den richtigen IMR-Key direkt in den Proxy
- Nach Save/Reload: `loadFromStorage()` lädt gespeicherte echte Keys — die falschen
  DEFAULT_STATE-Keys werden durch den Merge-Mechanismus nie in den gespeicherten
  State geschrieben
- `_syncAllToDOM()` liest `c[entry.key]` (IMR-Keys) — diese werden korrekt gefunden

**Tatsächliches Problem:** Code-Smell + Documentation Debt.
Jemand der `DEFAULT_STATE` als Schema-Referenz liest, erhält ein falsches Bild.
Ein neuer Entwickler könnte `signatureName` in Prompts oder Tests verwenden.

**Bewertung:** TECHNISCHE SCHULDEN — kein aktives Risiko, keine Eile.
Neu: TOMB-STATE-002 (umbenannt, da TOMB-STATE-001 ursprünglich falsch bewertet).

---

### I-003 | din-body-mirror fehlt — KRITISCHER GAP | TOMB-GHOST-001

**Fundstelle:** `index.html` — kein `<din-body-mirror>` vorhanden.

**Befund (KRITISCH HOCHGESTUFT gegenüber v3.0.0):**

In v3.0.0 wurde dies als „SPEC-IMPLEMENTATION-PENDING" abgetan. Das war zu schwach.

IMR v2.3.0 Sektion K ist **zementiert**. GEMINI.md Sektion VII ist **SUPREME**.
ADR-008 ist das Fundament des gesamten Ghost-Mirror-Patterns.

Das Fehlen von `<din-body-mirror>` bedeutet:
1. **Print-Layout ist NICHT DIN-5008-konform** für Markdown-Body-Inhalte.
   Wenn `din-body` `contenteditable="plaintext-only"` trägt (nach I-001-Fix)
   und der Nutzer Markdown-Syntax tippt (`**fett**`), druckt der Browser
   die Asterisken als Literaltext. Das Paper zeigt `**Wichtiger Hinweis**`
   statt **Wichtiger Hinweis**. Das ist ein Produktionsfehler.

2. **ADR-008 Ghost-Mirror-Pflicht ist unerfüllt.**
   Die Architektur-Verfassung beschreibt State 1/2/3 der Ghost-Mirror-State-Maschine.
   Kein einziger dieser States funktioniert ohne `din-body-mirror`.

3. **Sektion K der IMR (v2.3.0) ist totes Papier** bis dieser Tag existiert.

Das ist kein "nice to have". Es ist der kritischste offene Implementierungs-Gap.

**Neu: TOMB-GHOST-001** — dokumentiert was entfernt wurde bevor der Mirror existiert.

---

### I-004 | break-inside fehlt in @media print | KRITISCHER GAP (mit I-003 verknüpft)

**Befund:** Ohne `din-body-mirror` ist `break-inside: avoid` nicht wirksam.
Beides zusammen implementieren — I-003 und I-004 sind ein atomares Ticket.

---

### I-005 | state.js:save() — zu breite catch | G-002

**Fundstelle:** `state.js:save()` — `catch { /* quota exceeded — silent */ }`

**Befund:** Fängt alles. QuotaExceededError-Recovery aus `09_resilience_strategy_v6.0.0.md`
nicht implementiert. SPEC-IMPLEMENTATION-PENDING.


---

## KATEGORIE 4: CEMETERY — Zentrales Register + Neue Gräber

### ══════════════════════════════════════════════════
### THE CEMETERY OF IDEAS — DIN-BriefNEO v1.0 (Final)
###
### LEGACY GATE GUARDRAIL (UNVERÄNDERLICH):
### "Before ANY future proposal you MUST cross-check this Registry.
###  Proposing a buried pattern = immediate Architecture-Audit-Failure.
###  Future agents MUST mark deleted code with /* DEAD: See TOMB-XXX */
###  before removal."
### ══════════════════════════════════════════════════

---

### TOMB-B001 | initCMABridge() 14x setProperty | ADR-009

- **Deceased:** `initCMABridge(form)` — 14 CSS Properties via `root.style.setProperty()`
- **Cause of Death:** ADR-009. CSS `:root {}` ist SSoT. Bridge dupliziert identische Werte.
- **Successor:** CSS `din5008-paper.css :root {}` direkt.
- **Status:** Code vorhanden → D-001
- **Epitaph:** `/* DEAD: See TOMB-B001 — ADR-009: CSS ist SSoT */`

---

### TOMB-B002 | switchForm() setProperty-Call | ADR-009 (NEU — KRITISCH)

- **Deceased:** `switchForm()` — `root.style.setProperty('--address-top', ...)`
- **Cause of Death:** ADR-009. `--address-top` ist eine statische Konstante (27mm/45mm).
  `@layer project.overrides` reagiert bereits korrekt auf `paper.dataset.layout`.
  Der `setProperty()`-Call ist eine Dopplung der bereits funktionierenden CSS-Logik.
  Eine Funktion die nur `dataset.layout` setzt braucht keine `cma-bridge.js` —
  das kann ein direkter DOM-Zugriff aus dem Event-Handler sein.
- **Successor:** Reines `paper.dataset.layout = 'form-a'`. CSS übernimmt den Rest.
- **Status:** Code vorhanden → N-009
- **Epitaph:** `/* DEAD: See TOMB-B002 — ADR-009: CSS project.overrides ist SSoT für Form-Toggle */`

---

### TOMB-EXEC-001 | execCommand() Toolbar-Bindings | ADR-008

- **Deceased:** `document.execCommand('bold'/'italic'/'underline')` auf plaintext-only
- **Cause of Death:** ADR-008. plaintext-only blockiert HTML-Injektion strukturell.
- **Successor:** Ghost-Mirror-Markdown für `din-body`. Toolbar: Undo/Redo only.
- **Status:** Code vorhanden → D-002
- **Epitaph:** `/* DEAD: See TOMB-EXEC-001 — ADR-008: execCommand auf plaintext-only = No-Op */`

---

### TOMB-U002 | _safeSetHTML() | MANDATE-INJ

- **Deceased:** `_safeSetHTML(el, html) { el.innerHTML = html; }`
- **Cause of Death:** TOMB-L008 (richText entfernt) + MANDATE-INJ (innerHTML für User-Content)
- **Successor:** `element.setHTML()` mit Sanitizer API für Ghost-Mirror-Renderer.
- **Status:** Code vorhanden → D-003
- **Epitaph:** `/* DEAD: See TOMB-U002 — MANDATE-INJ: innerHTML für User-Content verboten */`

---

### TOMB-GHOST-001 | Ghost-Mirror Stub ohne din-body-mirror | ADR-008 (NEU — KRITISCH)

- **Deceased:** Implizite Annahme dass Ghost-Mirror implementiert ist (IMR-Docs sagen es ist spec)
- **Cause of Death:** `<din-body-mirror>` existiert nicht im DOM.
  Das Ghost-Mirror-Pattern aus ADR-008/GEMINI.md Sektion VII/IMR v2.3.0 K ist
  Papier ohne Substanz. Print-Layout für Markdown ist nicht DIN-5008-konform.
- **Successor:** Vollständige Implementierung: `<din-body-mirror aria-hidden="true">` im DOM,
  State-Maschine (Fokus/Blur/Print), `setHTML()` mit Sanitizer API für Render-Pfad.
- **Status:** Nie implementiert → I-003 + I-004
- **Epitaph:** `<!-- GHOST-001: din-body-mirror implementieren vor Production-Release -->`

---

### TOMB-STATE-002 | DEFAULT_STATE Veraltete IMR v1-Keys | Code-Smell (herabgestuft)

- **Deceased:** `signatureName`, `returnAddress`, `recipientName`, `specialNote`
  in `state.js DEFAULT_STATE.content`
- **Cause of Death:** IMR v2.0 (PLAN-010) hat diese Keys zu `signature`, `sender`,
  `recipient`, `note` umbenannt. DEFAULT_STATE nicht synchronisiert.
- **Severity:** TECHNISCHE SCHULDEN — kein Laufzeit-Risiko (Proxy-Mechanismus
  schreibt korrekte Keys bei Nutzer-Interaktion).
- **Status:** Code vorhanden → I-002
- **Epitaph:** `/* LEGACY: See TOMB-STATE-002 — IMR v2.0: Key umbenannt. Nur Code-Smell. */`

---

### TOMB-HTML-001 | din-body contenteditable="true" Kommentar | ADR-008

- **Deceased:** `contenteditable="true"` + Kommentar `AUSNAHME: formatierter Text erlaubt`
- **Cause of Death:** ADR-008 kennt keine Ausnahmen für `din-body`. Falsch und regressionsfördernd.
- **Status:** Im Live-DOM → I-001
- **Epitaph:** `<!-- TOMB-HTML-001: ADR-008 gilt ohne Ausnahme -->`

---

### TOMB-HTML-002 | html[data-layout] Lügen-Attribut | No-JS-Doctrine

- **Deceased:** `<html lang="de" data-layout="form-b">`
- **Cause of Death:** Wird nie aktualisiert wenn Nutzer Form wechselt. Lügt dauerhaft.
  Aktive Inkonsistenz — schlimmer als Abwesenheit.
- **Status:** Im Live-DOM → D-005
- **Epitaph:** `<!-- REMOVED: See TOMB-HTML-002 -->`

---

### TOMB-L001 | new Date() für Zeitstempel (mit Ausnahme) | ANTI-016

- **Deceased:** `new Date()` für "heute" in `logic.js:todayISO()` + `app.js` Boot
- **Cause of Death:** ANTI-016, Mutabilität, UTC-Midnight-Bug (G-007), Locale-Abhängigkeit
- **Successor:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`
- **Ausnahme BRAIN-018:** `parseDate()` für User-Input-Parsing — bleibt. Kein Zeitstempel.
- **Status:** Code vorhanden → N-003
- **Epitaph:** `/* DEAD: See TOMB-L001 — Nutze Temporal. Ausnahme: parseDate(). */`

---

### TOMB-L007 | getElementById(domId) — IMR v1 | VOLLSTÄNDIG ENTFERNT ✓
### TOMB-L008 | richText-Flag | AUS IMR ENTFERNT, Zombie-Refs in ui.js → D-003/D-004
### TOMB-M001 | Legacy Schema Mapping | NIE IMPLEMENTIERT, ersetzt durch Strict Schema Gate
### TOMB-C001 | .is-visible Klassen-Toggle | VOLLSTÄNDIG ENTFERNT ✓
### TOMB-C002 | JS-Toolbar show/hide | VOLLSTÄNDIG ENTFERNT ✓
### TOMB-C003 | Pico CSS Full-Import | ABGELEHNT — ADR-001 ✓
### TOMB-C004 | margin-top für DIN-Zonen | ABGELEHNT ✓


---

## SECURITY-SEKTION

### SEC-001 | Regex-Patterns — SICHER
Alle Patterns in `logic.js` sind vollständig anchored, bounded, kein ReDoS-Risiko.

### SEC-002 | _safeSetHTML() — Latentes XSS | Höchste Lösch-Priorität
Kein aktiver Aufruf-Pfad. Existenz allein ist Risiko. → D-003.

### SEC-003 | Ghost-Mirror-Sanitizer — NICHT AKTIV
`din-body-mirror` fehlt. Wenn implementiert: `setHTML()` mit Sanitizer API
ist der EINZIGE erlaubte HTML-Schreib-Pfad für den Mirror. `innerHTML =` ist verboten.

---

## IMPLEMENTIERUNGS-CHECKLISTE (Priorisiert)

### SOFORT — Kritische Bugs + 0-Risiko Dead Code

```
[ ] I-001  index.html: din-body → plaintext-only + Kommentar korrigieren  ← KRITISCHSTER BUG
[ ] D-005  index.html: data-layout="form-b" von <html> entfernen
[ ] D-001  app.js + cma-bridge.js: initCMABridge() löschen
[ ] D-002  ui.js + index.html: execCommand-Block + data-cmd Buttons löschen
[ ] D-003  ui.js: _safeSetHTML() löschen                                  ← SICHERHEITS-PRIORITÄT
[ ] D-004  ui.js: entry.richText Ternaries vereinfachen
[ ] N-001  index.html + ui.js: btn-import-trigger → label for="file-import"
[ ] N-002  index.html: 6x popovertarget → commandfor/command
```

### NÄCHSTE RUNDE — Spec-Debt + Technische Schulden

```
[ ] N-003  logic.js: todayISO() → Temporal (parseDate bleibt!)
[ ] N-004  app.js: formatDate(new Date()) → Temporal
[ ] N-004  inline onchange-Handler → Event-Delegation in ui.js
[ ] N-009  cma-bridge.js: switchForm() setProperty löschen / Datei eliminieren
[ ] I-002  state.js: 4 falsche DEFAULT_STATE Keys korrigieren
[ ] N-005  css/din5008-paper.css: @layer latex.base hinzufügen
[ ] N-006  css: @property für 14 CMA-Variablen
[ ] N-007  css: @scope (#paper)
[ ] N-008  css/sidebar.css: field-sizing: content für Textarea
```

### EIGENE SPECS — Implementierungs-Projekte

```
[ ] I-003+I-004  din-body-mirror implementieren + break-inside  ← KRITISCHER GAP
[ ] I-005        state.js QuotaExceededError Recovery (v6.0.0)
```

---

## AUDIT-SIGNATUR

```
Datum:            2026-03-21
Report:           20_integrity_audit_v1.0.0.md
Supersedes:       19_final_cleanup_audit_and_cemetery_v3.0.0.md
Korrekturen:      7 (externe Peer-Review Grok)

KRITISCHE BUGS:   2
  I-001: din-body contenteditable="true" — ADR-008-Verletzung im Live-DOM
  I-003: din-body-mirror fehlt — Print-Layout nicht DIN-konform

DEAD CODE:        5 Blöcke (D-001 bis D-005)
NATIVE TODO:      9 (N-001 bis N-009)
NEUE TOMBS:       4 (TOMB-B002, TOMB-GHOST-001, TOMB-STATE-002, TOMB-HTML-001/002)

HERABGESTUFT:     I-002 (war KRITISCH, ist TECHNISCHE SCHULDEN)
HOCHGESTUFT:      I-003/I-004 (war PENDING, ist KRITISCHER GAP)
                  D-005 (war KURZ-ERWÄHNT, ist DESTRUCTION LIST)
                  N-009 switchForm() (war LEGITIM, ist KRITISCH)

SICHERHEIT:       Kein aktives XSS. _safeSetHTML() latent → D-003 höchste Prio.

FAZIT: System ist betriebsfähig. Kritischste Aktion ist I-001 (chirurgischer 1-Zeilen-Fix).
       Ghost-Mirror (I-003) ist der größte offene Gap bevor Production-Release.
```

---

## LEGACY GATE GUARDRAIL (FINAL — UNVERÄNDERLICH)

> **Vor JEDEM zukünftigen Vorschlag MUSS dieses Register geprüft werden.**
>
> Ein Vorschlag der ein beerdigtes Pattern wiederbelebt ist sofortiger
> Architecture-Audit-Failure. Keine Ausnahmen. Keine Diskussion.
>
> BEGRABEN (vollständige Liste):
> innerHTML direkt, richText-Flag, execCommand, new Date() für Timestamps,
> initCMABridge() setProperty-Batch, switchForm() setProperty-Call,
> Legacy-Key-Mapping, Pico-CSS-Full-Import, margin-top für DIN-Zonen,
> ID-basierte Felder-Selektoren (#f-subject etc.), JS-Klassen-Toggle für Sichtbarkeit,
> html[data-layout] als State-Träger, Inline-onchange-Handler.
>
> CEMETERY IDs:
> TOMB-B001, TOMB-B002, TOMB-EXEC-001, TOMB-U002, TOMB-GHOST-001,
> TOMB-STATE-002, TOMB-HTML-001, TOMB-HTML-002,
> TOMB-L001, TOMB-L007, TOMB-L008, TOMB-M001,
> TOMB-C001, TOMB-C002, TOMB-C003, TOMB-C004
