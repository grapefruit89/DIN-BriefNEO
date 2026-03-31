# ðŸ“œ DIN-BriefNEO v4.0 MASTER HANDBOOK

# Status: LIVING DOCUMENT | Version: 4.0.0

# Authority: Lead Architect (Gemini CLI)

> **DOKTRIN-NOTIZ**: Dieses Handbuch ist die ultimative Single Source of Truth (SSoT). Es ist absichtlich _nicht_ zusammengefasst, sondern dient als kumulative Instanz aller aktiven Architektur-Entscheidungen (ADR), Spezifikationen und Mandate.

---

# ==========================================================================

# TEIL 1: CORE ARCHITECTURE & MANDATES

# ==========================================================================

## ðŸ„ Dokument: CONSTITUTION.md (Quelle: .brain)

---

id: BRAIN-001-CONST
title: "Architecture Specification (SSoT)"
version: 4.0.0
status: "verified"
compliance: "v4.0-Stable"
authority: "Lead Architect"
last_audit: 2026-03-28
tags:

- architecture
- ssot
- mission-critical
  related:
- "[[CORE_SPEC]]"
- "[[ANTI_PATTERN]]"
  aliases:
- "Architecture Protocol"

---

# Architecture Specification (SSoT)

## I. CORE ARCHITECTURAL PRINCIPLES

### §1 Technological Hierarchy (Structural Layering)

Each feature MUST be implemented at the lowest possible layer:

1. **Native HTML** (Structure, Semantics, Popover API, Invokers)
2. **Native CSS** (Layout @layer, 0.001mm-precision, OKLCH colors, contrast-color())
3. **Vanilla JavaScript** (IMR Registry, EditContext, Persistence, Logic)
4. **Public APIs** (Fault-tolerant external services — optional only)

### §2 Zero-Width Marker Strategy (WYSIWYG)

The physical 1:1 print preview is the primary constraint.

- Markdown control characters (`*`, `_`) visible in the editor MUST NOT affect text flow width.
- Execution: `.md-marker { display: inline-block; width: 0; overflow: visible; }`

### §3 Structural Zoning (IMR 4.0)

The document consists of 19 atomic fields defined in the `Isomorphic Master Registry`.

- **Category A (Atoms):** Single-line, `plaintext-only` fields (e.g., `<din-absender-vorname>`).
- **Category B (Flow):** The `<din-text>` element with EditContext support.

### §4 Chrome Baseline (147+)

- No polyfills. No `@supports` guards for core APIs (Anchor Positioning, Sanitizer, Temporal).
- The system evolves synchronously with the Blink engine.

## II. VISUAL STABILITY REQUIREMENT

Zero layout shift after initialization. Every pixel is deterministic.

## III. UNIFIED DATA STATE

The JSON data model is the single source of truth (SSoT). HTML is strictly the presentation layer.

---

## ðŸ„ Dokument: CORE_SPEC.md (Quelle: .brain)

---

id: BRAIN-002-SPEC
title: "Core Specification (IMR 4.0)"
version: 4.0.0
status: "active"
geometry: "DIN 5008:2020-03"
last_audit: 2026-03-28
tags:

- specification
- din-5008
- imr-4-0
  related:
- "[[CONSTITUTION]]"
- "[[ANTI_PATTERN]]"

---

# Core Specification (IMR 4.0)

## 1. ATOMIC CUSTOM ELEMENTS

The system implements a 19-atom model using native Custom Elements.

- **Header Atoms:** `din-absender-vorname`, `din-absender-nachname`, `din-absender-strasse`, `din-absender-ort`.
- **Recipient Atoms:** `din-empfaenger-firma`, `din-empfaenger-name`, `din-empfaenger-strasse`, `din-empfaenger-ort`.
- **Logic Atoms:** `din-text` (Source), `din-text-mirror` (View).
- **Behavior:** All atoms implement `contenteditable="plaintext-only"` and are bound via `EditContext API`.

## 2. TEMPORAL ENGINE

- **Capture:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`.
- **Target:** `<din-date>` (Standalone at 50mm Y / 125mm X).

## 3. PHYSICAL GEOMETRY (SSoT)

- **Form A (Small Header):** 27mm top offset for address zone.
- **Form B (Standard Header):** 45mm top offset for address zone.
- **Enforcement:** Zero-JS layout. Logic resides entirely in `app-ui.css` @layer geometry.

---

## ðŸ„ Dokument: ANTI_PATTERN.md (Quelle: .brain)

---

id: BRAIN-003-APR
title: "Anti-Pattern Registry (Banned & Deprecated)"
status: "verified"
enforcement: "AUTOMATED VALIDATION (PVP)"
last_audit: 2026-03-28
tags:

- anti-pattern
- technical-debt
- constraints
  related:
- "[[CONSTITUTION]]"
- "[[CORE_SPEC]]"

---

# Anti-Pattern Registry (Banned Patterns)

## 1. PERSISTENCE & STATE (DEP-P)

- **DEP-P001:** `localStorage` for high-volume data (Use OPFS/Batch instead).
- **DEP-P002:** External cloud sync for draft state (Violation of Local-First architecture).
- **DEP-P003:** `JSON.stringify()` on primary input thread (Performance regression).
- **DEP-P004:** Hard-coded state keys (e.g., `signatureName`). Use IMR 4.0 keys (`signature`).

## 2. LAYOUT & STRUCTURE (DEP-L)

- **DEP-L001:** `innerHTML` for user content (Security risk: XSS).
- **DEP-L002:** `contenteditable="true"` (Use `plaintext-only` or `EditContext`).
- **DEP-L003:** `execCommand` (Deprecated legacy API).
- **DEP-L004:** External CSS frameworks (Tailwind/Bootstrap).
- **DEP-L005:** `popovertarget` attribute in HTML (Use ID-based listeners in UIController for stability).
- **DEP-L006:** Inline `onchange` or `onclick` handlers in HTML.

## 3. LOGIC & APIS (DEP-C)

- **DEP-C001:** Legacy `Date` object (Use `Temporal API`). Exceptions: `parseDate` input handling.
- **DEP-C002:** Server-side dependencies for core logic (Client-Side-Only requirement).
- **DEP-C003:** External utility libraries (Moment.js, jspdf).
- **DEP-C004:** `setTimeout` for state debouncing (Use `requestIdleCallback`).

## 4. STYLING (DEP-S)

- **DEP-S001:** Hex colors (`#ffffff`) or `rgba()` in CSS. Use `oklch()`.
- **DEP-S002:** Hard-coded Hover colors. Use **Relative Color Syntax (RCS)**.
- **DEP-S003:** Scrollbars in DIN-A4 container. Use `field-sizing: content` and `overflow: hidden`.
- **DEP-S004:** `@supports` guards for Baseline features (Chrome 147+ is the floor).

## 5. TOOLING (DEP-T)

- **DEP-T001:** Context-fragmenting tools (`head`/`tail`).
- **DEP-T002:** Environment-specific stream syntax (`cat <<EOF`).
- **DEP-T003:** Manual file versioning via filename (`_v1.0.md`). Use Git.

---

# ==========================================================================

# TEIL 2: LIVING SPECIFICATIONS (Active Modules)

# ==========================================================================

## ðŸ„ Dokument: specify.md (Quelle: 059-persistence-pwa)

---

id: SPEC-059
title: Persistence & Desktop PWA Readiness
tags: [persistence, pwa, auto-save]
status: cemented
version: 1.0.0
traceability: [MANDATE-NAT, USER-SOUVEREIGNTY]

---

# Specify: Persistence & Desktop PWA (WHAT)

## 1. Zielsetzung

Maximale Datensicherheit durch intelligente Hintergrund-Speicherung und Transformation der Web-Oberfläche in eine installierbare Desktop-Anwendung (PWA).

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Denkpausen-Speicherung (Smart Auto-Save)

- Das System MUSS den aktuellen Schreibfortschritt automatisch persistieren.
- Der Speicherprozess DARF NICHT den Schreibfluss stören (keine Latenz).
- Die Speicherung erfolgt ereignisbasiert: Entweder bei Fokusverlust oder nach einer definierten Untätigkeit während des Tippens (Denkpause).

### FR-002: Desktop App Experience (Installability)

- Die Anwendung MUSS als eigenständige Desktop-App installierbar sein.
- Beim Start als App DARF KEINE Browser-UI (Adresszeile, Tabs) sichtbar sein.
- Die App MUSS offline-fähig sein (Basis-Ressourcen gecached).

## 3. Erfolgskriterien

- **SC-001**: Nach einem Browser-Absturz sind maximal die letzten 2 Sekunden der Eingabe verloren.
- **SC-002**: Ein "Installieren" Button erscheint in der Browser-Leiste.
- **SC-003**: Die App startet im Vollbild/Standalone-Modus.

---

## ðŸ„ Dokument: specify.md (Quelle: 058-native-sanitizer)

---

id: SPEC-058
title: Startup Performance & UI Polish
tags: [performance, ux, polish]
status: cemented
version: 1.0.0
traceability: [ANTI-FOUC, UX-FEEDBACK]

---

# Specify: Startup Performance & UI Polish (WHAT)

## 1. Zielsetzung

Die Anwendung muss sofort einsatzbereit wirken. Es darf kein visuelles Flackern beim Laden geben (Flicker of Unstyled Content). Das Feedback an den Nutzer (Toasts, Status) muss hochwertig und dezent wirken.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Instant Layout Restoration (ANTI-FOUC)

- Die gewählte Layout-Variante (Form A/B) MUSS vom Browser geladen sein, bevor das erste Element auf den Bildschirm gezeichnet wird.
- Ziel: Zero-Jank beim initialen Seitenaufruf.

### FR-002: Hochwertige Benachrichtigungen (Toasts)

- Rückmeldungen des Systems MÜSSEN flüssig eingeblendet werden.
- Die Art der Meldung (Erfolg, Warnung, Fehler) MUSS visuell sofort unterscheidbar sein.

### FR-003: Subtile Status-Anzeige

- Der Systemstatus MUSS präsent, aber nicht störend sein.
- Die Anzeige soll modern wirken (Transparenz, Blur).

## 3. Erfolgskriterien

- **SC-001**: Kein sichtbarer Sprung der Brief-Elemente beim Laden.
- **SC-002**: Toasts erscheinen mit einer gleitenden Animation.
- **SC-003**: Die Anwendung fühlt sich "fest" und "wertig" an.

---

## ðŸ„ Dokument: specify.md (Quelle: 061-v4.0-pipeline)

---

id: SPEC-061
title: v4.0 Validation Pipeline (PVP)
tags: [Validation, Security, Integrity, SDD]
status: cemented
version: 1.0.0
traceability: [MANDATE-INJ, MANDATE-NAT, MANDATE-PLN, MANDATE-FREEZE]
source: DIN-BriefNEO Constitution v16.0.1
depends-on: [SPEC-007, SPEC-051]
required-by: []

---

# SPEC-061: v4.0 Validation Pipeline (PVP)

## 1. Zielsetzung

Die v4.0 Validation Pipeline (PVP) ist das "High-Integrity" Sicherheitsnetz des Projekts. Sie stellt sicher, dass kein Agent (KI oder Mensch) die obersten Mandate des Projekts unbemerkt verletzt. Sie automatisiert die Einhaltung der Architektur-Integrität und eliminiert Agenten-Halluzinationen durch SSoT-basierte Kataloge.

## 2. Kern-Komponenten

### 2.1 IMR Component Catalog (Agent Guidance)

- **Anforderung**: Ein Tool muss existieren, das die `Isomorphic Master Registry (IMR)` aus der SSoT (`js/constants.js`) in ein maschinenlesbares JSON-Format extrahiert.
- **Zweck**: Agenten nutzen diesen Katalog, um exakte Tag-Namen (z.B. `din-date`) statt Halluzinationen (z.B. `din-datum`) zu verwenden.
- **Datenfelder**: Tag, JSON-Key, CMA-Koordinate (sofern vorhanden).

### 2.2 Automated Mandate Enforcement (Aviation Check)

Die Pipeline muss nach jeder Änderung folgende Prüfungen automatisiert durchführen:

#### A. Security Check (MANDATE-INJ)

- **Regel**: `innerHTML` Zuweisungen sind verboten.
- **Toleranz**: 0 Verstöße erlaubt in `js/`.
- **Ausnahme**: Nur in spezifisch markierten Render-Engines (z.B. Ghost-Mirror Renderer), sofern dort eine Sanitization stattfindet.

#### B. Native Check (MANDATE-NAT)

- **Regel**: Keine externen NPM-Imports oder CDN-Links, die nicht explizit in der Architektur freigegeben sind.
- **Zweck**: Erhalt der Abhängigkeitsfreiheit und Browser-Nativität.

#### C. Integrity Check (MANDATE-PLN)

- **Regel**: Alle `<din-*>` Elemente im HTML müssen das Attribut `contenteditable="plaintext-only"` tragen.
- **Ausnahme**: Keine. Selbst der Body nutzt `plaintext-only` (Visualisierung via Mirror).

#### D. Visual Freeze Check (MANDATE-FREEZE)

- **Regel**: Änderungen an CSS-Layer `din.core` sind kritisch zu prüfen.
- **Zweck**: Verhindern von Pixel-Shift in der DIN-Geometrie.

## 3. Akzeptanz-Kriterien

- [ ] Ein Aufruf von `scripts/get-catalog.mjs` liefert das aktuelle IMR-Schema als JSON.
- [ ] `scripts/post-session-verify.ps1` meldet Fehler, wenn `innerHTML` im Code gefunden wird.
- [ ] `scripts/post-session-verify.ps1` meldet Fehler, wenn ein `<din-*>` Tag ohne `plaintext-only` Attribut existiert.
- [ ] Die Pipeline ist in den Spec-kit Workflow (Phase: Implement/Verify) integriert.

## 4. Erfolgskriterien

- **Halluzinations-Rate**: 0% bei IMR-Tags.
- **Security-Regression**: 100% Erkennung von `innerHTML`-Injektionen.
- **Konformität**: 100% Abdeckung der Mandate in automatisierten Checks.

---

## ðŸ„ Dokument: specify.md (Quelle: 069-highlight)

---

id: SPEC-069
title: Native Highlight Editor — Paint-Time WYSIWYG
tags: [chrome-147, highlight-api, edit-context]
status: cemented
version: 1.0.0
traceability: [ADR-012, MANDATE-PLN]
source: v4.0 Audit 2026

---

# SPEC-069: Native Highlight Editor

## I. Zielsetzung (High-Integrity)

Ermöglichung von WYSIWYG-Formatierungen (Fett, Kursiv), ohne die Plaintext-Integrität des DOM zu verletzen. Die Formatierung wird vollständig von der Datenstruktur entkoppelt.

## II. Fachliche Anforderungen (WHAT)

### FR-001: Zero-Tag-Integrität

Der Briefinhalt (`body`) muss zu jedem Zeitpunkt als reiner Plaintext ohne HTML-Tags vorliegen. Ein `innerHTML`-Abruf muss identisch mit dem `textContent` sein.

### FR-002: Koordinaten-basierte Formatierung

Formatierungen werden über Start- und End-Indizes (Offsets) definiert.
Beispiel: `Text: "Hallo Welt"`, `Format: {type: 'bold', start: 0, end: 5}` -> "Hallo" erscheint fett.

### FR-003: Persistenz der Format-Matrix

Die Highlighting-Koordinaten müssen im Dokument-State gespeichert werden, um beim Neuladen wiederhergestellt zu werden.

### FR-004: Native Input-Souveränität

Die Eingabe erfolgt über die **EditContext API**. Das DOM-Element dient nur als Projektionsfläche für die Highlighting-Engine.

## III. Akzeptanzkriterien

1. `Strg+B` markiert den selektierten Text visuell fett, fügt aber KEINE `<b>` oder `<strong>` Tags in das DOM ein.
2. Ein Export des Briefes als JSON enthält das Feld `body` als sauberen String ohne Steuerzeichen.
3. Die Highlighting-Ebene bleibt bei Scroll-Bewegungen und Fenster-Resizing mathematisch deckungsgleich mit dem Text.
4. Das Kopieren von formatiertem Text aus dem Editor resultiert in sauberem Plaintext in der Zwischenablage (Integritäts-Schutz).

## IV. Definition of Done

- [ ] Keine `<b>`, `<i>` oder `<span>` Tags im `<din-text>`.
- [ ] CSS `::highlight()` steuert die gesamte Optik.
- [ ] EditContext fängt alle OS-Eingaben ab.

---

## ðŸ„ Dokument: specify.md (Quelle: 066-markdown-ghosting)

---

id: SPEC-066
title: Markdown-Shredder V2 — Zero-Width Ghosting
tags: [v4.0-2026, wysiwyg, integrity, css]
status: draft
version: 1.0.0
traceability: [ADR-008, ADR-011, MANDATE-FREEZE]
source: v4.0 Architecture Review 2026

---

# SPEC-066: Markdown-Shredder V2 (Zero-Width Ghosting)

## I. Zielsetzung (High-Integrity)

Gewährleistung einer 100%igen Übereinstimmung der Zeilenumbrüche zwischen dem Editor (Ghost-Mirror) und dem fertigen Dokument (Print/PDF). Dies wird durch die Erhaltung aller Markdown-Steuerzeichen im Mirror erreicht, wobei diese für die Layout-Engine "gewichtslos" (Breite = 0) gemacht werden.

## II. Fachliche Anforderungen (WHAT)

### FR-001: Non-Destructive Transformation

Der Parser darf Steuerzeichen (\*, \*\*, ~~, \_, >) nicht löschen. Er muss sie in ein schützendes Element (`<span class="md-marker">`) einwickeln, das die visuelle Formatierung (z.B. `<strong>`) umschließt oder flankiert.

### FR-002: Zero-Width Rendering

Die Marker-Elemente müssen für den Browser-Line-Breaker unsichtbar sein.

- Breite: 0px (zwingend)
- Überlauf: sichtbar (für menschliche Lesbarkeit)
- Interaktion: `pointer-events: none` und `user-select: none`

### FR-003: Kerning-Präzision

Um optisches "Kleben" von Markern an Wörtern zu verhindern, muss ein negativer Margin-Korrektor angewendet werden, der die physische Zeichenbreite im Editor neutralisiert.

### FR-004: EditContext-Offset-Parität

Die Anzahl der logischen Zeichen im `EditContext` muss exakt mit der Anzahl der sichtbaren (inkl. Ghosting) Zeichen im Mirror korrespondieren. HTML-Tags werden hierbei als Metadaten behandelt und dürfen die Selektions-Logik nicht verschieben.

### FR-005: EditContext Input-Capture

Der Input-Ghost (EditContext) muss alle OS-Eingabemethoden (Virtual Keyboard, Handschrift, Spracheingabe) abfangen, ohne dass ein physisches DOM-Element für die Datenhaltung existiert. Das DOM dient nur noch als 'Viewport' für den Mirror.

### FR-006: Atomic Character Bounds

Für die exakte Toolbar-Positionierung muss der EditContext die 'Character Bounds' des Mirrors kennen, damit das Anchor Positioning mathematisch korrekt auf den gerenderten Text (nicht auf den Plaintext) zeigt.

## III. Akzeptanzkriterien

1. Ein Wort, das im Editor mit `**fett**` markiert ist, bricht an exakt derselben Stelle um wie das Wort `fett` im Druck-Modus (wo die Marker ausgeblendet sind).
2. Die `Sanitizer API` lässt die `.md-marker`-Spans ohne Datenverlust passieren.
3. EditContext Events (`textupdate`) triggern die Mirror-Synchronisation verzögerungsfrei (< 16ms).
4. `contenteditable="plaintext-only"` wird durch das EditContext-Objekt als primäre Eingabemethode abgelöst.

## V. RegEx Priority Cascade (Cascading Priority Parsing)

Um Überlappungen zu vermeiden, muss die Transformation in folgender Reihenfolge erfolgen:

1. **Triple-Markers (Fett-Kursiv)**: `/(\*\*\*|___)(.*?)\1/g`  
   → `<strong class="md-bold"><em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em></strong>`
2. **Double-Markers (Fett / Strike)**:
   - Fett: `/(\*\*|__)(.*?)\1/g` → `<strong class="md-bold"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></strong>`
   - Durchgestrichen: `/(~~)(.*?)\1/g` → `<del class="md-del"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></del>`
3. **Single-Markers (Kursiv / Code)**:
   - Kursiv: `/(\*|_)(.*?)\1/g` → `<em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em>`
   - Inline-Code: /(`)(.*?)\1/g → `<code class="md-code"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></code>`

## VI. Mathematischer Offset-Beweis (WYSIWYG-Parität)

- **Input (EditContext)**: `**Hallo**` (Length: 9)
- **Output (Mirror HTML)**: `<strong><span>**</span>Hallo<span>**</span></strong>`
- **Mirror textContent**: `**Hallo**` (Length: 9)
- **Ergebnis**: Parität = 100%. Der Cursor-Offset im `EditContext` entspricht exakt der Zeichenposition im Mirror, da der Browser HTML-Tags bei der `textContent`-Länge ignoriert.

## VII. Erweitertes Sanitizer-Gatekeeping

`v4.0_SANITIZER_CONFIG` muss `span` und die spezifischen `md-*` Klassen erlauben:

```javascript
const v4.0_SANITIZER_CONFIG = {
  allowElements: ['strong', 'em', 'del', 'code', 'span', 'p', 'br', 'blockquote', 'li', 'ul', 'ol'],
  allowAttributes: {
    'class': ['md-marker', 'md-bold', 'md-italic', 'md-del', 'md-code']
  }
};
```

---

## ðŸ„ Dokument: specify.md (Quelle: 057-dom-first-integrity)

---

id: SPEC-057
title: DOM-First Integrity & Anchor Positioning
tags: [chrome-147, anchor-positioning, zero-js]
status: active
version: 1.0.0
traceability: [MANDATE-NAT, ANTI-026]

---

# Specify: DOM-First Integrity (WHAT)

## 1. Zielsetzung

JavaScript soll vollständig von der Live-Synchronisation der Benutzereingaben entbunden werden. Das Dokument im Browser-Fenster (DOM) ist die einzige Quelle der Wahrheit während der Bearbeitung.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Passives State-Management

- Das System DARF NICHT bei jedem Tastendruck Daten in den JavaScript-Speicher spiegeln.
- Die Persistierung (LocalStorage) erfolgt nur noch ereignisbasiert (z.B. bei Fokusverlust oder in Intervallen), indem das DOM direkt gelesen wird.

### FR-002: Kontextsensitive Werkzeuge (Anchor Positioning)

- Die Toolbar für Formatierungen MUSS sich physisch an dem Feld ausrichten, das gerade bearbeitet wird.
- Diese Ausrichtung MUSS flüssig und ohne JavaScript-Berechnungen erfolgen.

### FR-003: Unlöschbare Feld-Identitäten

- Strukturelle Elemente des Briefes (wie das Wort "Datum" im Infoblock) MÜSSEN für den Nutzer unlöschbar sein.
- Diese Elemente dürfen nicht Teil des editierbaren Textes sein.

## 3. Erfolgskriterien

- **SC-001**: Die Performance des Tippens ist identisch mit einer statischen HTML-Seite.
- **SC-002**: Die Toolbar "springt" oder "gleitet" nativ zum fokussierten Feld.
- **SC-003**: Ein "Alles löschen" im Feld darf die Beschriftung (z.B. "Datum") nicht entfernen.

---

## ðŸ„ Dokument: specify.md (Quelle: 007-cma)

---

id: SPEC-007
title: Central Measurement Authority (CMA)
tags: [cma, din-5008, ssot]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
updated: 2026-03-20
version: 2.0.0
traceability: [DIN-SYS-CMA]
source: DIN 5008:2020-03, MehrCurry/briefversand (triple-validated)
depends-on: []
required-by: [SPEC-001, SPEC-003, SPEC-006, SPEC-027, SPEC-042]

---

# Specify: Central Measurement Authority (CMA)

## Fachbeschreibung: Warum eine "Wahrheitstabelle"?

Ein DIN 5008-Brief hat ~15 physikalische Zonen, jede mit exakt definierten
Millimeter-Koordinaten. Ohne zentrales Masssystem passiert folgendes:

- Der Entwickler schreibt `top: 97mm` direkt in das CSS einer Komponente.
- Eine andere Komponente nutzt `top: 97.5mm` — 0.5mm Drift.
- Im Druck: Adresse und Informationsblock ueberlappen im DL-Umschlag.

Die CMA verhindert das durch eine **Single Source of Truth (SSoT)**:
Jedes Mass existiert exakt einmal. Alle anderen Systemteile referenzieren
diese eine Quelle — niemals eigene Werte.

---

## Fachliche Anforderungen (WHAT — keine Technik)

### Datentabelle: Kanonische DIN 5008-Masse (High-Integrity)

| ID    | Konstante       | Mass    | Einheit | Quelle         | Form |
| ----- | --------------- | ------- | ------- | -------------- | ---- |
| M-001 | PAGE_WIDTH      | 210.000 | mm      | DIN 5008 §3    | A+B  |
| M-002 | PAGE_HEIGHT     | 297.000 | mm      | DIN 5008 §3    | A+B  |
| M-003 | MARGIN_LEFT     | 25.000  | mm      | DIN 5008 §4.1  | A+B  |
| M-004 | SENDER_ZONE_TOP | 27.000  | mm      | DIN 5008 §6.1  | A+B  |
| M-005 | ADDRESS_TOP_A   | 27.000  | mm      | DIN 5008 §6.1a | A    |
| M-006 | ADDRESS_TOP_B   | 45.000  | mm      | DIN 5008 §6.1b | B    |
| M-007 | ADDRESS_WIDTH   | 85.000  | mm      | DIN 5008 §5.2  | A+B  |
| M-008 | ADDRESS_HEIGHT  | 45.000  | mm      | DIN 5008 §5.2  | A+B  |
| M-009 | INFO_BLOCK_TOP  | 97.400  | mm      | MehrCurry (✓)  | A+B  |
| M-010 | SUBJECT_TOP     | 103.400 | mm      | MehrCurry (✓)  | A+B  |
| M-011 | FOLD_MARK_1     | 105.000 | mm      | DIN 5008 §7    | A+B  |
| M-012 | PUNCH_MARK      | 148.500 | mm      | DIN 5008 §7    | A+B  |
| M-013 | FOLD_MARK_2     | 210.000 | mm      | DIN 5008 §7    | A+B  |
| M-014 | FOOTER_TOP      | 269.000 | mm      | MehrCurry (✓)  | A+B  |
| M-015 | MARGIN_RIGHT    | 20.000  | mm      | DIN 5008 §4.2  | A+B  |

### Funktionale Anforderungen

| ID     | Anforderung                                                                                    |
| ------ | ---------------------------------------------------------------------------------------------- |
| FR-001 | Die CMA MUSS alle physikalischen Masse an exakt einer Stelle im System definieren              |
| FR-002 | Masse MUESSEN in Millimetern (mm), typografische Werte in Punkt (pt) vorliegen                 |
| FR-003 | Alle Systemteile (Layout, Druck, Hilfslinien, Berechnungen) MUESSEN Werte aus CMA nutzen       |
| FR-004 | Die CMA MUSS Form A und Form B als separate, benannte Werte unterscheiden                      |
| FR-005 | Das System MUSS das Vorhandensein von "Magic Numbers" ausserhalb der CMA verhindern            |
| FR-006 | Praezision MUSS mindestens 3 Dezimalstellen betragen (0.001mm Aufloesung)                      |
| FR-007 | Widerspruechliche Masse MUESSEN im `.brain/07_measurement_conflict_log.md` dokumentiert werden |
| FR-008 | Jedes Mass MUSS eine Traceability-Referenz (Quelle) besitzen                                   |

### Toleranzgrenzen (High-Integrity)

| Metrik                           | Grenzwert | Rationale                     |
| -------------------------------- | --------- | ----------------------------- |
| Visuelle Abweichung (Screen)     | < 0.5mm   | DL-Umschlag-Toleranz          |
| Druck-Abweichung (PDF)           | < 0.1mm   | Professioneller Druckstandard |
| Rundungsfehler bei Konvertierung | < 0.001mm | 3-Dezimalstellen-Pflicht      |

### Warum duerfen Zonen ihre Masse nicht selbst definieren?

Dies ist ein **fachliches Prinzip**, kein technisches. Eine Zone wie
"Informationsblock" ist fachlich **kein unabhaengiges Objekt** — sie ist
eine **Referenz** auf einen DIN-definierten Bereich des Briefs. Wuerde
die Zone ihr eigenes Mass kennen, entstuende eine zweite "Wahrheit".
Zwei Wahrheiten fuer dasselbe Mass sind strukturell identisch mit einem Fehler.

### Erfolgskriterien

| ID     | Kriterium                                                          | Messung                |
| ------ | ------------------------------------------------------------------ | ---------------------- |
| SC-001 | Single-Point-of-Change: Eine Aenderung in der CMA wirkt systemweit | Integrationstest       |
| SC-002 | Zero Redundancy: Kein Mass ist doppelt definiert                   | Statische Code-Analyse |
| SC-003 | Full Traceability: Jedes Mass hat eine Quellenangabe               | Code-Review            |
| SC-004 | Precision: Alle Werte auf >= 3 Dezimalstellen gespeichert          | Unit-Test              |

---

## ðŸ„ Dokument: specify.md (Quelle: 002-salutation-engine)

---

id: SPEC-002
title: Salutation Engine & Gender Parsing
tags: [salutation, logic, automation, din-5008, html-hybrid]
status: active
weight: 100
criticality: HIGH
created: 2026-03-19
updated: 2026-03-20
version: 2.0.0
traceability: [DIN-LOGIC-SALUT]
source: DIN 5008:2020-03, DIN 5008 Etikette-Addendum
depends-on: [SPEC-007]
required-by: [SPEC-013, SPEC-022]

---

# Specify: Salutation Engine & Gender Parsing

## Fachbeschreibung

Ein DIN 5008-konformer Brief erfordert eine praezise, normgerechte Anrede.
Das System erkennt aus der Empfaengereingabe das Geschlecht (Praefix) und
generiert automatisch die korrekte Anrede. Manuelle Ueberschreibungen durch
den Nutzer sind immer moeglich und dauerhaft (USER-001 Nutzersouveraenitaet).

---

## Fachliche Anforderungen (WHAT)

### FR-001: Schluesselwort-Erkennung

Das System MUSS das Empfaengerfeld nach diesen Praefixen scannen:

- `Herr` / `Herrn` → Maennlich (m)
- `Frau` → Weiblich (f)
- `Familie` / `Eheleute` → Familie (fam)
- Kein Praefix erkannt → Neutral (n)

### FR-002: Titel-Erkennung

Das System MUSS akademische Titel extrahieren und in der Anrede behalten:

- `Dr.`, `Prof.`, `Prof. Dr.`, `Dipl.-Ing.`, `Mag.`

### FR-003: Nachnamen-Extraktion

Das System MUSS den Nachnamen korrekt isolieren (letztes Wort nach Praefix + Titel).

### FR-004: Manual Override Protection (USER-001)

Sobald ein Nutzer das Anredefeld manuell editiert, MUSS die Automatik
deaktiviert werden. Kennzeichnung via `data-auto="false"` am Feld-Element.
Eine erneute Automatik ist nur nach explizitem Zuruecksetzen aktiv.

### FR-005: Frmlichkeitsstufen (3 Stufen)

Das System MUSS drei Stufen unterstuetzen:

- `formal`: "Sehr geehrter Herr / Sehr geehrte Frau / Sehr geehrte Damen und Herren,"
- `polite`: "Guten Tag, Herr / Guten Tag, Frau / Guten Tag,"
- `casual`: "Hallo [Vorname] / Hallo zusammen,"

### FR-006: Signatur-Zustze

Das System MUSS Vertretungs-Zustze unterhalb der Unterschrift anbieten:

- `i. A.` (im Auftrag), `i. V.` (in Vollmacht), `ppa.` (Prokura)

### FR-007: Branchen-Grussformeln

Das System MUSS branchenspezifische Grussformeln als Snippets anbieten
(z.B. "Mit sportlichem Gruss", "Glueck auf!", "Mit kollegialen Gruessen").

### FR-008: Punktuation Guard (DIN 5008)

- Kein Komma am Ende der Grussformel (deutsches DIN-Standard).
- Kein Punkt am Ende der Grussformel.
- Beide Faelle MUESSEN als Warnung markiert werden (aria-invalid="true").

### FR-009: 3-Leerzeilen-Regel

Zwischen Grussformel und maschinenschriftlichem Namen MUSS ein Platz von
exakt 3 Leerzeilen (ca. 12.7mm) fuer die handschriftliche Unterschrift
reserviert werden. Dieser Abstand ist ein DIN-Pflichtmass (Aufnahme in CMA).

### Anrede-Matrix (normativ)

| Formality | Gender m                          | Gender f                         | Gender n                      | Gender fam                  |
| --------- | --------------------------------- | -------------------------------- | ----------------------------- | --------------------------- |
| formal    | Sehr geehrter Herr [Titel] [Name] | Sehr geehrte Frau [Titel] [Name] | Sehr geehrte Damen und Herren | Sehr geehrte Familie [Name] |
| polite    | Guten Tag, Herr [Name]            | Guten Tag, Frau [Name]           | Guten Tag                     | Guten Tag, Familie [Name]   |
| casual    | Hallo [Vorname]                   | Hallo [Vorname]                  | Hallo zusammen                | Hallo Familie [Name]        |

---

## Erfolgskriterien

| ID     | Kriterium                                                             | Messung          |
| ------ | --------------------------------------------------------------------- | ---------------- |
| SC-001 | Erkennung in >= 95% der Standardfaelle korrekt                        | Unit-Test        |
| SC-002 | Manuelle Korrekturen bleiben nach Neurendering erhalten               | Integrationstest |
| SC-003 | Komma/Punkt am Ende der Grussformel → Warnung sichtbar (aria-invalid) | UI-Test          |
| SC-004 | 3-Leerzeilen-Abstand vor Unterschrift exakt 12.7mm                    | Drucktest        |

---

## ðŸ„ Dokument: specify.md (Quelle: 029-page-breaks)

---

id: SPEC-029
title: Multi-Page Pagination & Hybrid Height
tags: [print, pagination]
status: cemented
version: 2.0.0
traceability: [DIN-5008-PRINT]

---

# Specify: Multi-Page Pagination (WHAT)

## 1. Zielsetzung

Das System muss in der Lage sein, Briefe zu verarbeiten, die länger als eine DIN-A4 Seite sind. Während auf dem Bildschirm die Immersion eines einzelnen Blattes gewahrt bleibt, muss der Ausdruck (PDF) den Textfluss über beliebig viele Seiten ermöglichen.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Hybrid-Height Mode

- **Screen-Mode**: Das Papier hat eine fixe Höhe von 297mm. Text, der darüber hinausgeht, wird visuell markiert (Overflow-Wächter), aber nicht gescrollt.
- **Print-Mode**: Das Papier wechselt auf eine variable Höhe (`height: auto`). Der Text fließt natürlich auf Folgeseiten.

### FR-002: Typografische Integrität auf Folgeseiten

- Seitenumbrüche MÜSSEN so gesteuert werden, dass keine "Hurenkinder" oder "Schusterjungen" entstehen (mind. 3 Zeilen pro Absatz auf einer Seite).
- Tabellen oder Listen dürfen nicht unkontrolliert zerrissen werden.

### FR-003: Folgeseiten-Header

- (Zukünftig): Folgeseiten sollten eine Seitenzahl ("Seite 2") enthalten.

## 3. Erfolgskriterien

- **SC-001**: Ein Brief mit 5000 Wörtern wird im Druck auf ca. 10 Seiten aufgeteilt.
- **SC-002**: Der Briefkopf (Absender, Empfänger) erscheint nur auf der ersten Seite.
- **SC-003**: Die Textschärfe bleibt vektorbasiert.

---

## ðŸ„ Dokument: specify.md (Quelle: 056-environment-integrity)

---

id: SPEC-056
title: Zero-JS Environment Integrity & Bare Metal UI
tags: [chrome-147, chrome-148, zero-js, spec-kit]
status: cemented
version: 4.0.0
traceability: [MANDATE-NAT, MANDATE-VEC, ADR-011]

---

# Specify: Zero-JS Environment Integrity (WHAT)

## 1. Problemstellung

Klassische Web-Apps nutzen JavaScript, um UI-Zustände (z.B. Layout-Wechsel) zu verwalten. Dies führt zu Redundanz, Latenz und "Pixel-Shock". Ziel ist die vollständige Delegation der UI-Logik an die Browser-Engine.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Autonomes State-Management

- Das DOM MUSS der einzige Zustandshalter (SSoT) für UI-Optionen sein.
- Die Auswahl eines Layouts oder das Einblenden von Hilfsmitteln MUSS rein über native HTML-Formular-Elemente (Radio/Checkbox) erfolgen.

### FR-002: Implizite Visuelle Rückmeldung

- Der Browser MUSS Zustandsänderungen eigenständig animieren.
- Es DARF KEINE explizite JavaScript-Anweisung für Animationen oder Übergänge nötig sein.

### FR-003: Isolierte Daten-Integrität (Data-IO)

- JavaScript darf NUR für die Verarbeitung von Briefinhalten (IMR) genutzt werden.
- Export, Import und Zurücksetzen sind funktionale Aktionen, die vom UI-Zustand entkoppelt sein müssen.

## 3. Erfolgskriterien

- **SC-001**: 100% Funktionalität der UI-Steuerung bei deaktiviertem JavaScript (sofern die Engine CSS-Variablen auflöst).
- **SC-002**: Null Pixel-Shift beim Layout-Wechsel durch native Engine-Interpolation.

---

## ðŸ„ Dokument: specify.md (Quelle: 051-content-integrity)

---

id: SPEC-051
title: Content Integrity & Ghost-Mirror System
tags: [integrity, markdown, ghost-mirror]
status: active
version: 1.0.0
traceability: [ADR-008, DIN-5008-TYPO]
source: GEMINI.md ADR-008
depends-on: [SPEC-007]

---

# Specify: Content Integrity & Ghost-Mirror System (WHAT)

## 1. Problemstellung

`contenteditable="true"` erlaubt Browsern, beim Einfügen (Paste) unkontrolliertes HTML in das Dokument zu schreiben. Dies führt zu "Datenvergiftung" (unsichtbare Styles, Skripte, Spans), die bei einem Export oder einer KI-Verarbeitung zu Fehlern führen.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Plaintext-Only Doctrine (ADR-008)

- Jedes Eingabefeld (<din-\*>) MUSS strukturell gegen HTML-Injection geschützt sein.
- Der Browser DARF KEIN HTML in diese Felder schreiben, auch nicht beim Paste oder Drag-and-Drop.
- Die einzige Datenquelle für den Export MUSS `textContent` sein.

### FR-002: Markdown-Support im Briefkörper

- Der Nutzer MUSS Formatierungen im Feld `<din-text>` mittels einfacher Markdown-Syntax vornehmen können:
  - `**fett**` -> <strong>
  - `*kursiv*` -> <em>
  - `~~durchgestrichen~~` -> <del>
  - `> Zitat` -> <blockquote>
  - `- Punkt` -> <ul>/<li>
  - `1. Punkt` -> <ol>/<li>
  - `\n\n` -> <br><br> (Absatz-Trennung)

### FR-003: Ghost-Mirror Visualisierung (UX)

- Da der Nutzer im Plaintext-Feld nur Symbole (\*_, _) sieht, MUSS eine visuelle Echtzeit-Vorschau (Mirror) existieren.
- Der Mirror MUSS exakt über dem Eingabefeld liegen, damit der optische Eindruck eines formatierten Briefes erhalten bleibt.
- Der Mirror DARF NICHT fokussierbar oder editierbar sein.
- Beim Tippen MUSS der Mirror ausgeblendet werden (Cursor-Fokus), in der Leseansicht (Blur) MUSS er eingeblendet werden.

### FR-004: Typografische Integrität (High-Integrity)

- Das System MUSS sicherstellen, dass Absätze nicht durch unschöne Seitenumbrüche zerrissen werden.
- Mindestens 3 Zeilen eines Absatzes MÜSSEN am Seitenende oder -anfang zusammengehalten werden (Widows/Orphans).
- URLs MÜSSEN im Druckmodus voll ausgeschrieben hinter dem Link-Text erscheinen.

## 3. Erfolgskriterien

- **SC-001**: Ein Paste von formatiertem Text aus MS Word in `<din-text>` resultiert in REINEM TEXT ohne HTML-Tags.
- **SC-002**: Die Markdown-Syntax `**Text**` wird im Mirror-Element visuell fett dargestellt.
- **SC-003**: Im PDF-Export (Druck) ist die Markdown-Syntax unsichtbar, nur die Formatierung (Fett/Kursiv) ist zu sehen.
- **SC-004**: Keine "einzelnen Zeilen" auf Folgeseiten bei langen Briefen.

---

# ==========================================================================

# TEIL 3: PLANS (Implementation Roadmaps & Checklists)

# ==========================================================================

## ðŸ„ Dokument: 06_validation_anchor_plan.md (Quelle: plans)

# PLAN: BLACK-BOX-DECODER (CSS ANCHOR POSITIONING) (v1.0.0)

# Spec: SPEC_VALIDATION_ANCHOR_v1.0.0

# Status: DRAFT | Doctrine: High-Integrity v4.0 | Stand: März 2026

## CONSTITUTION CHECK

| Gate          | Status | Notiz                                             |
| ------------- | ------ | ------------------------------------------------- |
| [MANDATE-INJ] | OK     | Nur textContent für Fehlermeldungen.              |
| [MANDATE-NAT] | OK     | Nutzung nativer CSS Anchor Positioning API.       |
| [MANDATE-PLN] | OK     | Keine Beeinträchtigung der plaintext-only Felder. |

## 1. CSS CORE ARCHITECTURE (din.core)

Wir definieren die Ankerpunkte für alle IMR-Felder.

```css
din-text {
  anchor-name: --anchor-body;
}
din-subject {
  anchor-name: --anchor-subject;
}
/* ... (weitere IMR Tags) */

#black-box-decoder {
  position: fixed;
  position-anchor: var(--active-anchor);
  top: anchor(bottom);
  left: anchor(left);
  position-visibility: anchors-visible;
  margin-top: 5mm;
  padding: 2mm 5mm;
  background: var(--pico-ins-color); /* Warnfarbe */
  color: white;
  border-radius: 4px;
  font-size: 10pt;
}
```

## 2. DYNAMISCHES TETHERING (UI Bridge)

Das JS setzt nur den Anker-Kontext, der Browser erledigt die Geometrie.

```javascript
// In UIController.js (_bindNativeEvents)
paper.addEventListener("focusin", (e) => {
  const tag = e.target.tagName.toLowerCase();
  if (tag.startsWith("din-")) {
    document.documentElement.style.setProperty(
      "--active-anchor",
      `--anchor-${tag.slice(4)}`,
    );
  }
});
```

## 3. VISIBILITY LOGIC (Pure CSS)

```css
#black-box-decoder {
  display: none;
}

/* Nur anzeigen, wenn das fokussierte Element ungültig ist */
:root:has(din-*:focus[data-invalid="true"]) #black-box-decoder {
  display: block;
}
```

## 4. STEPS (Implementation)

1. [ ] CSS-Anker in `css/din5008-paper.css` hinzufügen.
2. [ ] Popover-HTML in `index.html` einfügen.
3. [ ] `UIController.js` erweitern für `--active-anchor` Property.
4. [ ] `logic.js` erweitern (Validierungstrigger für `data-invalid`).

---

**GEZ. LEAD SYSTEMS ARCHITECT**
"Zero-Pixel-Shift Layout. Natively Tethered Error UI."

---

ror UI."

---
