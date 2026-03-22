# Anti-Pattern Registry: Was wir NIEMALS tun
# Letzte Aktualisierung: 2026-03-20 | V12 Platinum

Diese Datei listet technische Ansaetze und UX-Entscheidungen auf,
die wir explizit ablehnen, um die Systemintegritaet zu wahren.
Jeder Eintrag hat eine ID, einen Ursprung und eine Gegenloesung.

---

## [ANTI-001] Relative Zone Positioning
- **Ursprung**: metaminded/dinbrief
- **Ansatz**: Positionierung von DIN-Zonen relativ zu variablen Blattraendern.
- **Grund**: Fuehrt zu Norm-Verletzungen. Adresse wandert aus dem Fenster.
- **Loesung**: **Absolute Positioning Doctrine** (0,0 ist immer die Blattecke).

## [ANTI-002] ContentEditable without Guardrails
- **Ursprung**: greatestview/letter
- **Ansatz**: Freies Tippen ohne strikte Feld-Grenzen.
- **Grund**: Zerschiesst das Layout bei Enter-Druck oder Paste von HTML-Muell.
- **Loesung**: **.oneline Constraint** & **Paste-Sanitizer** (textContent only).

## [ANTI-003] Pixel-Based Document Export
- **Verbot**: PDFs, Briefe oder Anhänge als Rastergrafik (PNG, JPG, Canvas-Capture).
- **Grund**: Text muss im PDF suchbar, markierbar und vektoriell scharf bleiben.
- **Loesung**: Native Print Engine (Vektoren). `drawElement` zu Canvas für Dokumenten-Output ist STRENGSTENS VERBOTEN.

## [ANTI-004] Cookie-Based Persistence
- **Verbot**: HTTP-Cookies zur Speicherung von Nutzerdaten.
- **Grund**: Cookie-Banner vermeiden. Groessenbeschraenkung. Datenschutz.
- **Loesung**: **LocalStorage** (persistent) und **SessionStorage** (fluechtig).

## [ANTI-005] Modal-Based Editing
- **Verbot**: Bearbeitung von Briefinhalten in separaten Fenstern oder Modals.
- **Grund**: Zerstoert den Schreibfluss und das WYSIWYG-Gefuehl.
- **Loesung**: **Direct-In-Place Editing**. Alle Felder direkt auf dem Papier.

## [ANTI-006] Logic-via-ID Mapping
- **Verbot**: Direkte Verkn\u00FCpfung von Logik an HTML-IDs.
- **Grund**: ID-Aenderungen fuer CSS brechen JS-Logik.
- **Loesung**: **Data-Attribut Binding** (`data-field="recipient"`).

## [ANTI-007] Global Window Pollution
- **Verbot**: Anwendungs-Logik direkt im `window` Objekt.
- **Grund**: Unsauberer Namespace, schwer zu testen, Kollisionsgefahr.
- **Loesung**: **ES6 Classes & Modules**. Isolation der Belange.

## [ANTI-008] Vertical/Horizontal Scrolling
- **Verbot**: Scrollbars (`overflow: scroll/auto`) im gesamten Projekt.
- **Grund**: Scroll ist ein Designfehler. Aviation-Grade braucht kein Scrollen.
- **Loesung**: **Strict Pagination & Viewport Fitting**. Blaettern statt Scrollen.

## [ANTI-009] Pay-to-Play Services
- **Verbot**: Dienste, die fuer den Endanwender zwingend Kosten verursachen.
- **Grund**: NEO muss ein freies, autarkes Werkzeug bleiben.
- **Loesung**: Strikte **Free-Tier-Only** Policy fuer alle API-Erweiterungen.

## [ANTI-010] Punctuation in German Salutations
- **Verbot**: Satzzeichen am Ende der deutschen Grussformel.
- **Grund**: DIN 5008: Grussformel endet ohne Punkt. Komma ist Anglizismus.
- **Loesung**: **Automatic Warning** via aria-invalid + CSS (kein JS-Toast noetig).

## [ANTI-011] Content-Based Discriminatory Salutations
- **Verbot**: Verbotene oder rechtlich bedenkliche Grussformeln.
- **Grund**: NEO muss den Nutzer vor rechtlichen Fallstricken schuetzen.
- **Loesung**: **Phrase-Guard-Blacklist** im Hintergrund.

## [ANTI-014] Layout Thrashing (Reflow Overkill)
- **Verbot**: Interleaved DOM Reads & Writes.
- **Grund**: Verursacht massives Neuberechnen des Layouts (Jitter).
- **Loesung**: **Batching**. Erst lesen, dann schreiben (RAF API).

## [ANTI-015] Selection Ghosting (UI-Pollution)
- **Verbot**: Selektierbarkeit von UI-Elementen waehrend der Briefarbeit.
- **Grund**: UI-Texte duerfen nicht in die Briefauswahl rutschen.
- **Loesung**: `user-select: none` fuer alle Nicht-Brief-Bereiche.

## [ANTI-016] Legacy Date Object (new Date())
- **Verbot**: Nutzung der nativen `new Date()` Klasse fuer neue Logik.
- **Grund**: Mutable, unintuitive API (Monate bei 0), Zeitzonen-Fehler.
- **Loesung**: **Temporal API**. Unveraenderlich, praezise, modern.

## [ANTI-017] Media Query Over-Engineering
- **Verbot**: Exzessive @media Breakpoints fuer Schriften und Abstaende.
- **Grund**: Stufen-Effekte, wartungsintensiver Code.
- **Loesung**: **Fluid UI (clamp() & Container Queries)**.

## [ANTI-018] JS-based UI Logic (Selector-Dependency)
- **Verbot**: JavaScript fuer visuelle Eltern-Kind-Beziehungen.
- **Grund**: Unnoetiger JS-Overhead, verzoegertes Rendering.
- **Loesung**: **CSS :has() Selector**. Hochkomplexe Logik in reinem CSS.

## [ANTI-019] Sidebar Clutter (UI-Pollution)
- **Verbot**: Permanente Sidebars neben dem Dokument.
- **Grund**: Zerstoert WYSIWYG-Immersion. "Wie aus dem dritten Jahrhundert."
- **Loesung**: **Paper-First Control Center**. Alles in HTML5 `<dialog>` Modal.

## [ANTI-020] JS-Interval Animations
- **Verbot**: `setInterval` oder `setTimeout` fuer visuelle Animationen.
- **Grund**: Ruckeln, bricht 60fps Mandat, CPU-Last.
- **Loesung**: **CSS Transitions** oder **Web Animations API (WAAPI)**.

## [ANTI-021] Listener Fragmentation
- **Verbot**: addEventListener direkt an hunderte Einzel-Elemente.
- **Grund**: Massiver Speicherverbrauch, Memory Leak Risiko.
- **Loesung**: **Event Delegation** am Root-Element.

## [ANTI-022] Ghost Listeners
- **Verbot**: Event-Listener ohne Aufraeumlogik.
- **Grund**: App wird nach Stunden traege (verwaiste Listener).
- **Loesung**: **AbortController** fuer atomares Cleanup.

## [ANTI-023] Pico CSS Full-Integration (Framework-Bloat)
- **Getestet**: 2026-03-20 | Context7 Deep Audit
- **Ansatz**: Pico CSS als vollstaendiges Base-Framework.
- **Grund**: Pico's body-Reset und rem-Spacing kollidiert mit mm-Units.
  ~80% der Regeln braeuchten !important. Verletzt VANILLA PURITY + VISUAL FREEZE.
- **Extrakt**: 3 Konzepte als Vanilla CSS (ADR-001):
  [PICO-EXTRACT-1] aria-invalid, [PICO-EXTRACT-2] dialog, [PICO-EXTRACT-3] color-scheme.

## [ANTI-024] CSS-Only CMA (Kein JS-Layer)
- **Ansatz**: Alle DIN-Masse nur als CSS Custom Properties.
- **Grund**: "97.4mm" als String ist fuer Berechnungen unbrauchbar.
  JS-Logik braucht reine Zahlen. CSS-String-Parsing ist ein gefaehrlicher Hack.
- **Loesung**: Drei-Schichten-CMA (PLAN-007):
  Layer 1: constants.js (SSoT), Layer 2: cma-bridge.js, Layer 3: CSS Fallback.

## [ANTI-025] JS-based String Engines (Layout/State via JS)
- **Entschieden**: 2026-03-20 | Knowledge Shredder 2.0
- **Betroffener Code**:
  - `ui.js._applyLayout()` (35 Zeilen): classList.toggle fuer Form A/B
  - `ui.js._applySidebarState()` (20 Zeilen): JS Radio-Button-Sync
  - `ui.js._bindSettings()` (25 Zeilen): Event-Listener fuer Config-Radios
  - `ui.js._bindEditorToolbar()` show/hide (20 Zeilen): focusin/focusout
  - `ui.js` Dialog-close-Bindings (20 Zeilen): querySelectorAll + close()
  - `state.js` config-Zweig (60 Zeilen): state.config.layout etc.
  - `logic.js` Regex-Validierungen fuer PLZ/Tel/Mail/Datum (30 Zeilen)
  **Gesamt: ~210 Zeilen JS eliminiert.**
- **Ersatz (2026 Browser-Standards)**:
  - Form A/B:      CSS `@layer project.overrides` + `#paper[data-layout]`
  - Radio-Sync:    HTML `checked`-Attribut ist SSoT, kein JS noetig
  - Toolbar:       CSS `#paper:has([contenteditable]:focus-within) #toolbar`
  - Dialoge:       Popover API `popovertarget` Attribut (Zero-JS)
  - Config-State:  `#paper.dataset.*` (5 Attribute, kein JS-Proxy)
  - Validierung:   HTML5 `pattern`, `type="email"`, `type="tel"` Attribute
- **Was BLEIBT (unersetzliche Fachlogik)**:
  - StateManager content + profile (Proxy, Undo/Redo, LocalStorage)
  - UIController._safeSet() (Cursor-Safety-Guard)
  - UIController._bindFieldInputs() (contenteditable → state)
  - deriveSalutation() / parseRecipient() (Anrede-Fachmatrix)
  - validateIBAN() / formatIBAN() (IBAN-Modulo-Pruefung)
  - formatDate() / parseDate() (DE-Datumsformat)
  - _doExport() / _doPrint() (Blob, window.print)
  - _bindKeyboard() (Ctrl+S, Ctrl+Z Shortcuts)

## [ANTI-026] JS-Shadow-Logic
- **Verbot**: Implementierung von Features in JavaScript, die bereits nativ in Chrome 147+ vorhanden sind.
- **Grund**: JS-Logik ist teurer (Parsing, Runtime, Memory) und fehleranfälliger als native Engine-Funktionen.
- **Sanktion**: Jede JS-Funktion, die durch ein natives Feature ersetzt werden kann, gilt als technischer Schuldenberg und muss bei Erscheinen des Browser-Updates gelöscht werden.

---

## 🪦 THE CEMETERY (TOMB-Registry)

### [TOMB-L012] Inline UI-Handlers (onchange/onclick)
- **Begraben**: 21.03.2026
- **Was es war**: `onchange="document.getElementById('paper').dataset.layout=..."`
- **Ersatz**: CSS `:has()` + Radio-Button Status.
- **Warum**: JS-Handler verunreinigen das HTML und sind schwer zu debuggen. Native State-Detection ist wartungsfrei.

### [TOMB-L013] JS-Driven Layout Toggles
- **Begraben**: 21.03.2026
- **Was es war**: `UIController._applyLayout()` Logik.
- **Ersatz**: CSS `if()` Logik + `--layout` Variable.
- **Warum**: Redundanz zwischen JS-Status und CSS-Selektoren eliminiert.

### [TOMB-L014] Manual View Transitions
- **Begraben**: 21.03.2026
- **Was es war**: `document.startViewTransition(() => { ... })` Aufrufe im JS.
- **Ersatz**: `view-transition-trigger: checked` im CSS.
- **Warum**: Der Browser erkennt den State-Change selbstständig und animiert ohne JS-Trigger.

### [TOMB-L015] CSS Attribute-Selectors for Geometry
- **Begraben**: 21.03.2026
- **Was es war**: `#paper[data-layout="form-a"] .zone { ... }`
- **Ersatz**: Native CSS-Variablen + `if()`.
- **Warum**: Drastische Reduktion der CSS-Spezifität und Komplexität.
