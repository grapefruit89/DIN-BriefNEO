# 🧠 DIN-BriefNEO MASTER-MONOLITH (v1.0.0)
## STATUS: ZEMENTIERT | DOKTRIN: AVIATION GRADE PLATINUM

### ⚖️ DIE VERFASSUNG (CHROME 147+ BASELINE)
1. **IMR 3.0 (Isomorphe Master-Registry):** Absolutes Gesetz: TAG = KEY = CMA-KOORDINATE = ANKER. Ein Feld existiert nur, wenn es in der Registry, im HTML (Tag), im CSS (Koordinate) und im JSON-State identisch benannt ist.
2. **NO-JS UI DOKTRIN:** Imperatives JS für UI-Effekte ist illegal. Tooltips, Popovers und Dialoge nutzen exklusiv **CSS Anchor Positioning** (`anchor-name`, `position-anchor`) und native **Invoker Commands** (`commandfor`).
3. **SCROLL-LOGIK:** JS-Scroll-Listener sind durch native CSS `@container scroll-state()` ersetzt. Die Überlauf-Erkennung findet auf Render-Ebene statt.
4. **DATA RESILIENCE:** Zero-Loss Save via **Origin Private File System (OPFS)** und **IdleDetector API**. State-Synchronisation erfolgt atomar.
5. **PLAINTEXT-VERSIEGELUNG:** `contenteditable="true"` ist verboten. Nutzung der **EditContext API** in Kombination mit **CSS Custom Highlights** für den Ghost-Mirror (Aviation Grade Isolation).

---

## File: specs/001-din-5008-baseline/spec.md
---
id: SPEC-001
title: DIN 5008 Layout Baseline
tags: [layout, din-5008, aviation-grade]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-19
traceability: [DIN-LAYOUT-BASE]
---
# Feature Specification: DIN 5008 Layout Baseline


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exakte Positionierung der Elemente (Priority: P1)
Als Anwender mchte ich, dass alle Elemente (Anschrift, Betreff, Text) exakt an den von der DIN 5008 vorgeschriebenen Positionen sitzen, damit der Brief professionell wirkt und in Fensterumschlge passt.

**Why this priority**: Das ist der Kernzweck der Anwendung. Ohne przise Positionierung ist das Produkt wertlos.

**Independent Test**: Kann durch Ausmessen der Elemente in der Druckvorschau (PDF) mit einem digitalen Lineal oder Testdruck verifiziert werden.

**Acceptance Scenarios**:
1. **Given** der Editor ist im Modus "Form B", **When** die Seite gerendert wird, **Then** muss das Anschriftenfeld exakt 45mm von der Oberkante entfernt beginnen.
2. **Given** eine Adresse wird eingegeben, **When** der Text die Hhe von 45mm berschreitet, **Then** muss der berstehende Text abgeschnitten werden (Overflow Hidden).

---

### User Story 2 - Umschalten zwischen Form A und Form B (Priority: P2)
Als Anwender mchte ich zwischen den beiden Standard-Layouts (Form A mit kleinem Briefkopf, Form B mit groem Briefkopf) whlen knnen.

**Why this priority**: Erhht die Flexibilitt fr verschiedene Briefbgen.

**Independent Test**: Umschalten des Layout-Parameters und Prfung der vertikalen Verschiebung der Anschriftzone.

**Acceptance Scenarios**:
1. **Given** das Layout wird auf "Form A" gestellt, **When** die Seite gerendert wird, **Then** muss das Anschriftenfeld bei 27mm von oben beginnen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST ein Blatt im Format A4 (210mm x 297mm) simulieren.
- **FR-002**: Der linke Seitenrand MUST konstant 25mm betragen.
- **FR-003**: Das Anschriftenfeld MUST eine feste Gre von 85mm Breite und 45mm Hhe haben.
- **FR-004**: Das System MUST einen "Hard Constraint" fr das Anschriftenfeld erzwingen (kein vertikaler Overflow).
- **FR-005**: Die vertikale Position der Anschriftzone MUST umschaltbar sein: Form A (27mm von oben) und Form B (45mm von oben).
- **FR-006**: Das System MUST Faltmarken bei 105mm und 210mm (von oben) sowie eine Lochmarke bei 148,5mm (Zentrum) optional anzeigen knnen.

### Key Entities

- **Page**: Das digitale A4-Blatt mit festen Millimeter-Koordinaten.
- **AddressZone**: Ein Container mit den Maen 85x45mm und striktem Overflow-Schutz.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Zero Pixel Shift**: Die Positionierung der Zonen darf in modernen Browsern (Chrome/Firefox) um weniger als 0,5mm von der DIN-Vorgabe abweichen.
- **SC-002**: **Window Fit**: In 100% der Testflle muss die Adresse in einem Standard-Fensterumschlag (DL) vollstndig sichtbar sein.
- **SC-003**: **No Spillover**: In keinem Fall darf Text aus der 45mm hohen Anschriftzone in darunterliegende Bereiche flieen.

---

# ??? Hardening Addendum: Absolute Positioning & Weighting

## ?? Brain-First Alignment
- **Absolute Positioning Doctrine**: Alle Koordinaten beziehen sich zwingend auf die obere linke Ecke (0,0) des Blattes. (Keine relativen Offsets zu variablen Rndern).
- **Anti-Pattern Check**: Verhindert aktiv [ANTI-001] (Relative Zone Positioning).

## Feature Weighting (Bedeutung)
- **Importance**: 100/100 (CRITICAL)
- **Fulfillment Target**: 100% Strict
- **Rationale**: Die physikalische Korrektheit ist die Daseinsberechtigung von NEO.

## Additional Requirements
- **FR-007**: Das System MUST alle Koordinaten vom Fixpunkt (0,0) berechnen.
- **FR-008**: Das WYSIWYG-Layout MUST zu 100% mit dem finalen Druckergebnis bereinstimmen.

---

# ?? Validation Addendum: Agent-Grade Precision (MehrCurry)

## ?? Triple-Validated Measurements
- **Top Margin**: 27mm (Absenderzone).
- **Information Block**: 97.4mm.
- **Subject Line**: 103.4mm.
- **Footer**: 269mm.
- **Verification**: Diese Werte wurden gegen MehrCurry/briefversand abgeglichen und sind ab sofort als "Aviation Grade" zementiert.

---

## File: specs/002-salutation-engine/spec.md
---
id: SPEC-002
title: Salutation Engine & Gender Parsing
tags: [logic, automation, salutation]
status: draft
weight: 100
criticality: HIGH
created: 2026-03-19
traceability: [DIN-LOGIC-SALUT]
---
# Feature Specification: Salutation Engine & Gender Parsing


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-SALUT]`
- **Lexicon Check**: "Anrede", "Empfngername", "Prfix".
- **Principle Check**: **V. USER SOVEREIGNTY**: Automation NEVER overwrites manual user input.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische Anrede-Erkennung (Priority: P1)
Als Anwender mchte ich, dass das System automatisch erkennt, ob ich "Herr", "Frau" oder einen Titel eingebe, und mir die passende Anrede generiert, um Zeit zu sparen.

**Acceptance Scenarios**:
1. **Given** Empfngerfeld ist leer, **When** "Frau Erika Mustermann" eingetippt wird, **Then** erscheint in der Anrede "Sehr geehrte Frau Mustermann,".
2. **Given** ein Titel wird erkannt ("Dr. Mller"), **When** [action], **Then** erscheint "Sehr geehrter Herr Dr. Mller," oder "Sehr geehrte Frau Dr. Mller,".

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST das Empfngerfeld nach Schlsselwrtern ("Herr", "Frau", "Dr.", "Prof.") scannen.
- **FR-002**: Das System MUST basierend auf dem erkannten Geschlecht (Prfix) die Anrede generieren.
- **FR-003**: Das System MUST den Nachnamen korrekt extrahieren.
- **FR-004**: **Manual Override Protection**: Sobald ein Anwender das Feld "Anrede" manuell editiert, MUST die Automatik deaktiviert werden (`isDirty` Flag).
- **FR-005**: Das System MUST verschiedene "Frmlichkeitsstufen" untersttzen (Frmlich, Hflich, Modern).  

### Data Schema (Ghost Data)
- **Field**: `content.salutationDirty` | **Type**: `Boolean` | **UI**: Hidden | **Description**: Verhindert das berschreiben manueller Eingaben.

## Success Criteria *(mandatory)*

- **SC-001**: **Accuracy**: Erkennung funktioniert in 95% der Standardflle korrekt.
- **SC-002**: **No Ghost Overwrite**: Manuelle Korrekturen bleiben dauerhaft erhalten.

---

# ??? Signature Suffix Addendum (from Antigravity)

- **FR-006: Signature Suffixes**: Das System MUST Untersttzung fr offizielle Vertretungs-Zustze bieten:
    - `i. A.` (im Auftrag)
    - `i. V.` (in Vollmacht)
    - `ppa.` (Prokura)

---

# ?? Wikipedia Intelligence Addendum: The "Etikette" Update

- **FR-007: Group-Identity Snippets**: Untersttzung fr branchenspezifische Gre ("Mit sportlichem Gru", "Glck auf!", "Mit kollegialen Gren").
- **FR-008: Punctuation Guard**: 
    - Das System MUST das Komma am Ende der Gruformel als Fehler markieren (auer bei englischer Spracheinstellung).
    - Das System MUST sicherstellen, dass KEIN Punkt am Ende der Gruformel steht.
- **FR-009: The 3-Line Signature Rule**: Zwischen Gruformel und maschinenschriftlichem Namen MUST ein Platz von exakt 3 Leerzeilen (ca. 12,7mm) fr die handschriftliche Unterschrift reserviert werden.

---

## File: specs/003-dual-grid-system/spec.md
---
id: SPEC-003
title: Dual-Grid-System
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Dual-Grid-System


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-GRID]`
- **Lexicon Check**: "Hard Grid", "Soft Grid", "Resonanz-Punkt", "Falzmarken".
- **Principle Check**: **III. VISUAL FREEZE**: Zero-Pixel-Shift via mathematical alignment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Harmonische Positionierung (Priority: P1)
Als Anwender mchte ich, dass die DIN-Vorgaben (wie Falzmarken) exakt eingehalten werden, whrend der Brief gleichzeitig eine optische Ruhe ausstrahlt, die durch ein harmonisches Raster (7pt) erzeugt wird.

**Why this priority**: Das Alleinstellungsmerkmal von NEO - die Verbindung von Ingenieurs-Przision und Design-sthetik.

**Independent Test**: berlagerung des Dokuments mit einem visuellen 7pt-Grid im Editor. Prfung, ob alle DIN-Zonen (Hard Grid) auf Vielfachen von 12pt liegen und alle UI-Elemente (Soft Grid) auf Vielfachen von 7pt.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Layer 1 (The Hard Grid - 12pt)**:
    - Das System MUST alle DIN-relevanten Zonen (Anschriftzone, Betreff, Falz- und Lochmarken) an einem 12pt (4,233mm) Raster ausrichten.
    - Die `line-height` im Haupttext MUST exakt 12pt (oder ein Vielfaches davon) betragen.
- **FR-002: Layer 2 (The Soft Grid - 7pt)**:
    - Das System MUST alle nicht-normativen Abstnde (Paddings, Sidebar-Abstnde, Button-Gaps) an einem 7pt Raster ausrichten.
- **FR-003: Mathematische Resonanz**:
    - Das System MUST sicherstellen, dass sich beide Raster alle 84pt (29,63mm) treffen, um kumulative Rundungsfehler zu vermeiden.
- **FR-004: Visual Baseline Grid**:
    - Der Editor MUST eine zuschaltbare visuelle Hilfe bieten, die das Hard-Grid (DIN-Zeilen) anzeigt.

### Key Entities

- **HardGrid (12pt)**: Die "Schiene" fr die Norm-Einhaltung.
- **SoftGrid (7pt)**: Der "Puls" fr die visuelle sthetik.

## Success Criteria *(mandatory)*

- **SC-001**: **Fold-Mark Precision**: Die Falzmarken (105mm / 210mm) mssen mathematisch exakt auf dem Hard-Grid liegen.
- **SC-002**: **Optical Balance**: Abstnde zwischen UI-Elementen drfen NIEMALS krumme Werte (z.B. 13px oder 5mm) annehmen, sondern mssen immer durch 7pt teilbar sein.
- **SC-003**: **Zero Layout Drift**: Selbst nach 100 Zeilen Text darf das Raster nicht um mehr als 0,1mm von der theoretischen Position abweichen.

---

## File: specs/004-snippet-manager/spec.md
---
id: SPEC-004
title: Text Snippet Manager
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Text Snippet Manager

**Pattern Source**: `[PAT-NK-01]` (Niekes/brief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-SNIPPET]`
- **Lexicon Check**: "Textbaustein", "Snippet", "Feld-Kontext", "Persistenz".
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: Snippets MUST be stored locally (LocalStorage). **V. USER SOVEREIGNTY**: Loading a snippet MUST be a conscious user action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Textbaustein speichern (Priority: P1)
Als Anwender mchte ich einen gerade geschriebenen Text (z.B. eine hufig genutzte Adresse) als Baustein speichern, damit ich ihn spter mit einem Klick wiederverwenden kann.

**Why this priority**: Kernelement der Produktivittssteigerung.

**Independent Test**: Text in Adressfeld eingeben -> "Als Snippet speichern" klicken -> Prfung im LocalStorage, ob der Text unter dem Feld-Namen abgelegt wurde.

### User Story 2 - Textbaustein laden (Priority: P1)
Als Anwender mchte ich aus einer Liste von gespeicherten Bausteinen whlen knnen, um ein feld blitzschnell auszufllen.

**Why this priority**: Reduziert Tipparbeit und Fehlerquote massiv.

**Independent Test**: Klick auf das "Snippet-Icon" eines Feldes -> Auswahl eines Eintrags -> Prfung, ob das Feld den exakten Text bernimmt.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST fr jedes `contenteditable` Feld eine Option zum Speichern des aktuellen Inhalts bieten.
- **FR-002**: Das System MUST Snippets **feld-spezifisch** verwalten (ein Adress-Snippet wird nur bei Adressfeldern vorgeschlagen).
- **FR-003**: Das System MUST die Snippets im `LocalStorage` persistieren, um Offline-Verfgbarkeit zu garantieren.
- **FR-004**: Das System MUST eine einfache Verwaltung (Lschen) von vorhandenen Snippets ermglichen.
- **FR-005**: Das Laden eines Snippets MUST den aktuellen Feldinhalt ersetzen, ABER den `StateManager` korrekt ber die nderung informieren (Cursor-Safety).

### Data Schema (Ghost Data)
- **Field**: `storage.snippets` | **Type**: `Object` | **UI**: Modal/Dropdown | **Description**: Map von Feld-IDs zu Arrays von Text-Strings.

## Success Criteria *(mandatory)*

- **SC-001**: **Context Awareness**: 100% der Snippets werden nur in den dafr vorgesehenen Feldern angezeigt.
- **SC-002**: **Zero Latency**: Die Liste der Snippets muss sofort ( < 50ms ) nach Klick auf das Auswahlmen erscheinen.
- **SC-003**: **Data Integrity**: Auch nach einem Browser-Neustart mssen alle gespeicherten Snippets ohne Internetverbindung verfgbar sein.

---

## File: specs/005-base64-assets/spec.md
---
id: SPEC-005
title: Base64 Asset Persistence
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Base64 Asset Persistence

**Pattern Source**: `[PAT-NK-02]` (Niekes/brief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-ASSET]`
- **Lexicon Check**: "Base64", "Asset", "Logo", "Persistenz".
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: All assets MUST be local. **IX. SAFETY**: Credential masking does not apply here, but data size limits do.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eigenes Logo hochladen (Priority: P1)
Als Anwender mchte ich mein Firmenlogo hochladen knnen, damit es im Briefkopf erscheint.

**Why this priority**: Individualisierung ist ein Hauptgrund fr die Nutzung eines Briefgenerators.

**Independent Test**: Bilddatei (.png/.jpg) ber "Logo whlen" selektieren -> Prfung, ob das Bild im Briefkopf gerendert wird.

### User Story 2 - Offline-Verfgbarkeit des Logos (Priority: P1)
Als Anwender mchte ich, dass mein hochgeladenes Logo auch dann vorhanden ist, wenn ich die Seite neu lade oder offline bin.

**Why this priority**: Verhindert kaputte Bilder ("Broken Images") und wahrt die **OFFLINE SOVEREIGNTY**.

**Independent Test**: Logo hochladen -> Browser-Tab schlieen -> Internetverbindung trennen -> Seite ffnen -> Prfung, ob das Logo sofort wieder sichtbar ist.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST einen Datei-Upload fr Bilder (JPG, PNG, SVG) anbieten.
- **FR-002**: Das System MUST das Bild beim Upload sofort in einen **Base64-String** konvertieren.
- **FR-003**: Der Base64-String MUST im `StateManager` (Profile-Bereich) gespeichert werden.
- **FR-004**: Das System MUST eine Grenbeschrnkung fr Logos erzwingen (z.B. max. 500KB), um den LocalStorage nicht zu berlasten.
- **FR-005**: Das System MUST eine Option zum Entfernen/Lschen des aktuellen Logos bieten.

### Data Schema (Ghost Data)
- **Field**: `profile.logoData` | **Type**: `String` | **UI**: Hidden (Base64) | **Description**: Der komplette Bildinhalt als Text-String.

## Success Criteria *(mandatory)*

- **SC-001**: **No External Links**: Es drfen NIEMALS `http://` Links fr Benutzer-Assets im State landen.
- **SC-002**: **Print Accuracy**: Das Logo muss in der Druckvorschau (`window.print()`) in der Originalauflsung (innerhalb der Base64-Grenzen) erscheinen.
- **SC-003**: **Instant Load**: Das Logo muss beim Laden der Seite ohne Verzgerung ( < 10ms ) aus dem LocalStorage gerendert werden.

---

## File: specs/006-pwa-readiness/spec.md
---
id: SPEC-006
title: PWA Readiness
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: PWA Readiness

**Pattern Source**: `[PAT-NK-03]` (Niekes/brief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PWA]`
- **Lexicon Check**: "PWA", "Manifest", "Service Worker", "Installable".
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: The app MUST be fully functional offline. **X. DESKTOP FIRST**: Focus on Desktop installation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App auf Desktop installieren (Priority: P2)
Als Anwender mchte ich die Webseite als eigenstndiges Programm auf meinem Desktop installieren knnen, um schneller darauf zuzugreifen.

**Why this priority**: Erhht die Bindung und Professionalitt der Anwendung.

**Independent Test**: Chrome/Edge Browser -> "App installieren" Icon in der Adresszeile -> Prfung, ob NEO als eigenes Fenster ohne Browser-Leisten startet.

### User Story 2 - Vollstndiger Offline-Betrieb (Priority: P1)
Als Anwender mchte ich die App auch dann ffnen knnen, wenn ich im Flugzeug oder Keller kein Internet habe.

**Why this priority**: Absolute Unabhngigkeit von externen Servern.

**Independent Test**: NEO einmal laden -> Internet kappen -> Browser-Cache leeren -> URL aufrufen -> Prfung, ob die App (HTML/CSS/JS) trotzdem geladen wird.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST ein `manifest.json` bereitstellen, das App-Name, Icons und Start-URL definiert.
- **FR-002**: Das System MUST einen Service Worker implementieren, der alle statischen Dateien (index.html, css/*, js/*) im Cache hlt.
- **FR-003**: Das System MUST fr verschiedene Icon-Gren (192x192, 512x512) sorgen.
- **FR-004**: Die PWA MUST den "standalone" Display-Modus nutzen (keine Browser-Adresszeile).

### Key Entities

- **WebManifest**: Die Identitt der App.
- **ServiceWorker**: Der Wchter ber den Offline-Cache.

## Success Criteria *(mandatory)*

- **SC-001**: **Lighthouse Score**: Die App muss im Lighthouse-Audit (Bereich PWA) eine Wertung von > 90 erreichen.
- **SC-002**: **Cold Offline Start**: Die App muss in unter 500ms starten, selbst wenn das Gert im Flugmodus ist.
- **SC-003**: **Install Prompt**: Der Browser muss den Anwender aktiv (oder via Men) zur Installation einladen.

---

## File: specs/007-central-measurement-authority/spec.md
---
id: SPEC-007
title: Central Measurement Authority (CMA)
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Central Measurement Authority (CMA)

**Pattern Source**: `[PAT-MM-01]` (metaminded/dinbrief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-CMA]`
- **Lexicon Check**: "Wahrheitstabelle", "Konstante", "Millimeter-Przision", "SSoT".
- **Principle Check**: **I. TRUTH**: The .brain/ rules are implemented via a single constants file. **III. VISUAL FREEZE**: CSS variables are derived from this authority to ensure zero drift.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Zentrale Anpassung der Norm (Priority: P1)
Als Administrator/Entwickler mchte ich alle Mae des Briefes an einem einzigen Ort ndern knnen, falls sich die DIN-Norm ndert, ohne hunderte CSS-Zeilen oder JS-Funktionen durchsuchen zu mssen.

**Why this priority**: Das Herzstck der "Aviation-Grade" Wartbarkeit.

**Independent Test**: ndern der Lochmarken-Position in `constants.js` -> Prfung, ob sowohl die visuelle Markierung (SVG) als auch das Layout-Verhalten im Editor sofort folgen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST eine zentrale JS-Datei (`js/logic/constants.js`) besitzen, die als **Single Source of Truth (SSoT)** fr alle physikalischen Mae dient.
- **FR-002**: Die CMA MUST Mae in Millimetern (`mm`) und typografische Werte in Punkt (`pt`) definieren.
- **FR-003**: Alle UI-Komponenten (CSS via CSS-Variables und SVG via JS-Attributes) MUST ihre Werte dynamisch von dieser CMA beziehen.
- **FR-004**: Die CMA MUST zwischen Form A und Form B Maen unterscheiden (z.B. `ADDR_TOP_A` vs. `ADDR_TOP_B`).
- **FR-005**: Das System MUST sicherstellen, dass keine "Magic Numbers" (hartkodierte Zahlenwerte) auerhalb der CMA existieren.

### Key Entities

- **MeasurementMap**: Das Objekt, das alle DIN-Koordinaten hlt.
- **StyleBridge**: Die Logik, die JS-Konstanten in CSS-Variablen injiziert.

## Success Criteria *(mandatory)*

- **SC-001**: **Single-Point-of-Change**: Eine nderung eines Maes in der CMA wirkt sich ohne weiteren manuellen Eingriff auf das gesamte System (Editor, Druck, Hilfslinien) aus.
- **SC-002**: **Strict Type Conversion**: Alle mm-Werte werden mit einer Genauigkeit von mindestens 3 Dezimalstellen verarbeitet.
- **SC-003**: **Zero Redundancy**: Es darf kein Ma existieren, das an mehr als einer Stelle im Quellcode definiert ist.

---

# ?? Hardening Addendum: Exact Coordinate Map

- **FR-006**: Die CMA MUST folgende exakte Werte (Form B) enthalten:
    - `SENDER_ZONE_TOP`: 27mm
    - `ADDRESS_TOP`: 45mm
    - `INFO_BLOCK_TOP`: 97.4mm
    - `SUBJECT_TOP`: 103.4mm
    - `FOOTER_TOP`: 269mm
- **Rationale**: Diese Werte garantieren 100%ige Konformitt mit modernen Geschftsbrief-Standards.

---

# ?? Validation Addendum: Discrepancy Management

- **FR-007: Conflict Logging**: Das System MUST alle widersprchlichen Mae in einem "Validation Pool" (`.brain/07_measurement_conflict_log.md`) erfassen.
- **FR-008: Decision Rationale**: Jede Entscheidung fr ein Ma in der CMA MUST begrndet sein (z.B. Abgleich gegen Referenzquelle MehrCurry).
- **Weighting Update**: Die Korrektheit der CMA-Werte gegenber dem Conflict Log wird mit 100/100 bewertet.

---

## File: specs/008-info-block-translation/spec.md
---
id: SPEC-008
title: Dynamic Information Block & Label Translation Map
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Dynamic Information Block & Label Translation Map

**Pattern Source**: `[PAT-MM-02]` (metaminded/dinbrief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-INFOBLOCK]`
- **Lexicon Check**: "Informationsblock", "Label", "Daten-Key", "Translation Map".
- **Principle Check**: **VI. NAMING PARITY**: Key-Names must match the Lexicon. **IV. VANILLA PURITY**: Logic must remain simple JS objects.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamische Beschriftung des Infoblocks (Priority: P1)
Als Anwender mchte ich, dass die Beschriftungen im Informationsblock (z.B. "Ihr Zeichen") korrekt angezeigt werden, auch wenn ich das System fr einen Fork oder eine andere Sprache vorbereite.

**Why this priority**: Ermglicht professionelle Geschftskorrespondenz mit komplexen Bezugszeichen.

**Independent Test**: ndern des Labels fr "oursign" in der Translation-Map von "Unser Zeichen" auf "Unsere Ref." -> Prfung, ob die Anzeige im Informationsblock sofort wechselt.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST eine Translation-Map (`js/logic/labels.js`) besitzen, die technische Keys (z.B. `yoursign`) auf menschlich lesbare Labels (z.B. "Ihr Zeichen") abbildet.
- **FR-002**: Der Informationsblock MUST dynamisch basierend auf dieser Map gerendert werden.
- **FR-003**: Das System MUST Kommentare in der Map bereitstellen, die erklren, wie Fremdsprachen oder alternative Stile (z.B. Englisch: "Your ref.") implementiert werden knnen.
- **FR-004**: Die Verknpfung zwischen State-Daten und UI-Label MUST ber den technischen Key erfolgen (Decoupling).
- **FR-005**: Das System MUST sicherstellen, dass der Informationsblock die exakten DIN-Abstnde (beginnend bei 125mm von links) einhlt.

### Key Entities

- **LabelMap**: Das Wrterbuch fr den Informationsblock.
- **ReferenceBlock**: Die UI-Komponente, die Labels und Daten zusammenfhrt.

## Success Criteria *(mandatory)*

- **SC-001**: **Clean Separation**: Es darf KEIN hartkodierter deutscher Text ("Ihr Zeichen", "Datum") direkt in den HTML-Templates des Infoblocks stehen.
- **SC-002**: **Fork-Readiness**: Ein versierter Anwender muss in der Lage sein, die Sprache des Infoblocks durch Bearbeitung einer einzigen JS-Datei zu ndern.
- **SC-003**: **State Integrity**: Das ndern eines Labels darf NIEMALS die zugrundeliegenden Daten im `StateManager` beeinflussen.

---

## File: specs/009-ghost-templates/spec.md
---
id: SPEC-009
title: Ghost Templates (CSS-Based)
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Ghost Templates (CSS-Based)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-GHOST]`
- **Anti-Pattern Check**: Verhindert aktiv das Einbrennen von Hilfstexten in das PDF (Anti-Pattern: Pixel-Mll oder hartkodierte Strings).
- **Vanilla-Check**: Rein CSS-basierte Lsung ohne JS-Loop fr das Ein/Ausblenden.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: Strict (100% unsichtbar beim Druck)
- **Rationale**: Benutzerfhrung ohne Beeintrchtigung des physischen Briefes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Intuitive Fhrung (P1)
Als Anwender mchte ich in leeren Feldern (z.B. Betreff) sehen, was ich dort eingeben soll, ohne dass der Text ein physischer Teil des Inhalts ist.

**Acceptance Scenarios**:
1. **Given** ein Feld ist leer, **When** es nicht fokussiert ist, **Then** erscheint der Text aus `data-placeholder` in hellem Grau.
2. **Given** ein Feld hat Inhalt, **When** ich tippe, **Then** verschwindet der Platzhalter sofort.

### User Story 2 - Sauberer Druck (P1)
Als Anwender mchte ich sicher sein, dass Platzhalter NIEMALS auf dem gedruckten Brief erscheinen.

**Independent Test**: Leeren Brief mit allen Platzhaltern in die Druckvorschau laden -> Prfung: Das Blatt muss absolut leer sein.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST das HTML-Attribut `data-placeholder` fr alle `contenteditable` Felder untersttzen.
- **FR-002**: Die Anzeige des Platzhalters MUST rein ber CSS (Pseudo-Element `::before`) erfolgen.
- **FR-003**: Das System MUST den Platzhalter ausblenden, sobald das Feld fokussiert wird ODER Inhalt enthlt.
- **FR-004**: **Global Print Guard**: Das System MUST eine `@media print` Regel enthalten, die alle `::before` Elemente von `data-placeholder` unterdrckt.

## Success Criteria *(mandatory)*

- **SC-001**: **Zero JS Overhead**: Fr die reine Anzeige des Platzhalters darf kein JS-Event genutzt werden.
- **SC-002**: **Print Stealth**: In 100% der Druckflle (PDF/Papier) sind keine Hilfstexte sichtbar.
- **SC-003**: **Optical Harmony**: Die Farbe des Platzhalters muss dem 7pt Soft-Grid Design entsprechen (dezent, aber lesbar).

---

## File: specs/010-preflight-export/spec.md
---
id: SPEC-010
title: Pre-Flight Export Engine
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Pre-Flight Export Engine


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PREFLIGHT]`
- **Anti-Pattern Check**: Verhindert [ANTI-003] (Pixel-PDF) durch Nutzung der nativen Engine.
- **Principle Check**: **X. DESKTOP FIRST**: Fokus auf perfekte PDF-Dateinamen und Druck-Przision.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% (Safety First)
- **Rationale**: Ein Brief, der beim Export Fehler aufweist (berfllung), ist ein technisches Versagen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatischer Dateiname (P1)
Als Anwender mchte ich, dass das PDF beim Speichern automatisch nach meinem Betreff benannt wird, damit ich die Datei nicht hndisch umbenennen muss.

**Acceptance Scenarios**:
1. **Given** Betreff is "Rechnung Nr. 123", **When** Drucken gestartet wird, **Then** ist der Dateiname `2026-03-19_Rechnung_Nr._123.pdf`.

### User Story 2 - Adressfeld-Audit (P1)
Als Anwender mchte ich gewarnt werden, wenn meine Adresse so lang ist, dass sie nicht mehr vollstndig im Fenster des Briefumschlags sichtbar wre.

**Independent Test**: Adresse mit 12 Zeilen eingeben -> "Drucken" klicken -> Prfung: Ein modaler Dialog muss erscheinen: "Warnung: Adressfeld berfllt!"

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Identity Bridge**:
    - Das System MUST beim Auslsen des Druckbefehls den `document.title` temporr auf `[DATUM]_[BETREFF]` setzen.
    - Nach Schlieen des Druckdialogs MUST der Titel auf den Originalwert zurckgesetzt werden.
- **FR-002: Overflow Audit**:
    - Das System MUST vor dem Druck prfen, ob ein visueller Overflow in der `AddressZone` (85x45mm) vorliegt.
    - Bei berfllung MUST eine Warnung ausgegeben werden, der Druckvorgang darf jedoch auf expliziten Wunsch des Nutzers fortgesetzt werden.
- **FR-003: UI-Cleanup**:
    - Die Engine MUST sicherstellen, dass alle Sidebars und Editor-Hilfen (auer den Falzmarken) vor dem Druck auf `display: none` stehen (via CSS).

## Success Criteria *(mandatory)*

- **SC-001**: **Accuracy**: Der vorgeschlagene Dateiname enthlt keine ungltigen Zeichen (Sonderzeichen-Mapping).
- **SC-002**: **Reliability**: Die berfllungs-Warnung muss bei exakt 45,1mm Inhalt zuverlssig auslsen.
- **SC-003**: **Zero-Lag**: Der Pre-Flight-Check darf die Zeit bis zum ffnen des Druckdialogs um maximal 100ms verzgern.

---

# ?? UI Addendum: Toast Notifications

- **FR-004: Short-Lived Toasts**: Warnungen (wie der Adress-Overflow) MUST als Toast-Nachricht im UI erscheinen.
- **Toast Duration**: Die Anzeige darf nur sehr kurz (max. 2-3 Sekunden) sein, um den Workflow nicht zu blockieren.
- **Non-Intrusive**: Toasts drfen keine Besttigung erfordern, es sei denn, sie verhindern den Druckvorgang.

---

## File: specs/011-zero-loss-save/spec.md
---
id: SPEC-011
title: Zero-Loss Strategy (Auto-Save)
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Zero-Loss Strategy (Auto-Save)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-SAVE]`
- **Anti-Pattern Check**: Verhindert aktiv [ANTI-004] (Cookies).
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: Alles bleibt im Browser des Nutzers.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% (Verlustfrei)
- **Rationale**: Ein Editor, der Daten verliert, zerstrt das Vertrauen des Nutzers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nahtlose Fortsetzung (P1)
Als Anwender mchte ich den Browser schlieen und am nchsten Tag exakt dort weiterarbeiten knnen, wo ich aufgehrt habe, ohne explizit "Speichern" zu drcken.

**Acceptance Scenarios**:
1. **Given** ein Brief wird getippt, **When** der Tab sofort geschlossen wird, **Then** ist beim nchsten ffnen jeder Buchstabe wieder da.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Realtime Trigger**: Das System MUST bei JEDEM `input` Event im `contenteditable` sowie bei Statusnderungen (Form A/B) eine Sicherung auslsen.
- **FR-002: LocalStorage Engine**: Die Daten MUST im `localStorage` unter einem eindeutigen Prefix gespeichert werden.
- **FR-003: Profile vs. Content**: Das System MUST das Nutzerprofil (Absender) getrennt vom aktuellen Briefinhalt speichern (Mining from Claude).
- **FR-004: Hydration**: Beim Laden der App MUST der `StateManager` den Zustand aus dem Speicher wiederherstellen (Initial Load Sequence).

## Success Criteria *(mandatory)*

- **SC-001**: **Zero Data Loss**: Ein Verlust von mehr als einem Zeichen bei abruptem Abbruch (Crash/Tab-Close) ist unzulssig.
- **SC-002**: **Performance Stealth**: Die Speicherung darf die Schreibgeschwindigkeit nicht beeintrchtigen (Latenz < 16ms).

---

## File: specs/012-state-history/spec.md
---
id: SPEC-012
title: Git-Inspired State History
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Git-Inspired State History


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-HISTORY]`
- **Anti-Pattern Check**: Ersetzt einfaches "60-Schritte-Limit" durch eine robustere Architektur.
- **Principle Check**: **IV. VANILLA PURITY**: Implementierung ohne externe Diff-Libraries.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: Strict (Kein Einfrieren bei groen Historien)
- **Rationale**: Ein exzellentes Undo/Redo System ist das Sicherheitsnetz fr kreatives Schreiben.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tiefes Undo (P1)
Als Anwender mchte ich auch nach hunderten nderungen (z.B. komplettes Umformulieren eines Absatzes) noch zu einem sehr frhen Zustand zurckkehren knnen.

**Independent Test**: 200 Wrter einzeln tippen -> 200x Undo drcken -> Prfung: Ist das Dokument wieder leer?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: High-Capacity Buffer**: Das System MUST mindestens **200 Snapshots** des gesamten Zustands (Content + Config) vorhalten.
- **FR-002: Snapshot Logic**: Ein Snapshot wird bei "signifikanten" nderungen (z.B. Wortende, Paste, Stil-Wechsel) erstellt, nicht bei jedem einzelnen Buchstaben (Debouncing).
- **FR-003: Session-Persistence**: Der History-Stack MUST im `SessionStorage` abgelegt werden.
    - **Vorteil**: Er belastet nicht den permanenten `LocalStorage`, bleibt aber bei einem Seiten-Reload (F5) erhalten.
- **FR-004: Memory Management**: Bei berschreiten des Limits (z.B. 200) MUST der lteste Snapshot gelscht werden (Circular Buffer).

### Data Schema (Ghost Data)
- **Field**: `history.undoStack` | **Type**: `Array` | **Storage**: SessionStorage | **Description**: Liste der State-Objekte.

## Success Criteria *(mandatory)*

- **SC-001**: **No Lag**: Das Erstellen eines Snapshots darf niemals zu einem sprbaren Ruckeln beim Tippen fhren.
- **SC-002**: **Reload-Safety**: Nach einem Druck auf F5 muss das Undo/Redo Gedchtnis innerhalb derselben Sitzung vollstndig erhalten bleiben.

---

## File: specs/013-smart-identity/spec.md
---
id: SPEC-013
title: Smart Document Identity
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Smart Document Identity


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-IDENTITY]`
- **Anti-Pattern Check**: Verhindert unbenannte PDF-Exporte ("Unbenannt.pdf").
- **Principle Check**: **VI. NAMING PARITY**: Synchronisation zwischen Fachinhalt (Betreff) und System-Metadaten (Title).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% Strict
- **Rationale**: Ein professionelles Dokument muss seine Identitt im Dateisystem und im Browser-Tab klar kommunizieren.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Echtzeit-Tab-Synchronisation (P1)
Als Anwender mchte ich, dass der Browsertab sofort anzeigt, woran ich gerade arbeite, damit ich bei vielen offenen Tabs den berblick behalte.

**Acceptance Scenarios**:
1. **Given** der Brief-Editor ist offen, **When** ich den Betreff auf "Kndigung Fitnessstudio" ndere, **Then** ndert sich der Titel des Browsertabs in Echtzeit auf "Kndigung Fitnessstudio".

### User Story 2 - Perfekter Dateiname beim Export (P1)
Als Anwender mchte ich, dass mein PDF beim Speichern bereits den richtigen Namen hat, ohne dass ich ihn hndisch eintippen muss.

**Independent Test**: Betreff "Rechnung 2024-001" eingeben -> Drucken klicken -> Prfung im Speichern-Dialog: Der vorgeschlagene Dateiname muss "2026-03-19_Rechnung_2024-001.pdf" lauten.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Live Sync**: Das System MUST das `input`-Event des Betreff-Feldes berwachen und den `document.title` aktualisieren.
- **FR-002: Filename Sanitization**: Das System MUST ungltige Dateisystem-Zeichen (z.B. `/ \ : * ? " < > |`) im Titel durch Unterstriche oder Bindestriche ersetzen, bevor der Export ausgelst wird.
- **FR-003: Date Prefix**: Dem Dateinamen MUST automatisch das aktuelle Datum im ISO-Format (`YYYY-MM-DD`) vorangestellt werden.
- **FR-004: Fallback**: Falls der Betreff leer ist, MUST das System einen Standardwert nutzen (z.B. `YYYY-MM-DD_DIN-Brief.pdf`).

## Success Criteria *(mandatory)*

- **SC-001**: **Instant Feedback**: Die nderung im Browsertab erfolgt mit einer Verzgerung von < 50ms.
- **SC-002**: **Export Match**: Der vorgeschlagene Name im PDF-Speicherdialog entspricht zu 100% dem bereinigten Betreff.

---

## File: specs/014-digital-signature/spec.md
---
id: SPEC-014
title: Digital Signature Overlay
tags: [specification, din-5008, platin]
status: cemented
weight: 70
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Digital Signature Overlay


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-SIGN]`
- **Source Pattern**: `[PAT-MV-02]` (Unterschriften-Positionierung) & `[PAT-NK-02]` (Base64).
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: Scan wird als Base64 im Profil gespeichert.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 70 
- **Fulfillment Target**: 100% (Transparenz & Positionierung)
- **Rationale**: Ersetzt den analogen Arbeitsschritt des Unterschreibens und macht den PDF-Versand nahtlos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unterschrift hochladen (P1)
Als Anwender mchte ich einen Scan meiner Unterschrift hochladen, damit ich Briefe digital versenden kann, die wie handunterschrieben aussehen.

**Acceptance Scenarios**:
1. **Given** der Profil-Bereich ist offen, **When** ich ein transparentes PNG whle, **Then** wird dieses sicher im State gespeichert.

### User Story 2 - Perfekte Platzierung (P1)
Als Anwender mchte ich, dass die Unterschrift exakt ber der Gruformel und dem getippten Namen "schwebt", ohne Text zu verdecken.

**Independent Test**: Unterschrift hochladen -> Druckvorschau ffnen -> Prfung: Die Unterschrift muss leicht versetzt ber dem Namen liegen (wie im echten Leben).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: PNG-Preferation**: Das System MUST den Upload von PNG-Dateien bevorzugen, um Transparenz (Alpha-Kanal) zu untersttzen.
- **FR-002: Base64 Storage**: Der Scan MUST als Base64-String im `profile.signatureData` gespeichert werden.
- **FR-003: Positioning Logic**: Die Unterschrift MUST absolut ber dem Signaturbereich positioniert werden (via CSS/SVG).
- **FR-004: UX-Hint (RemoveBG)**: Das System MUST im Upload-Dialog einen hilfreichen Link/Kommentar zu Tools wie "Remove.bg" anzeigen, falls der Nutzer ein JPEG mit weiem Hintergrund hochldt.
- **FR-005: Scale Control**: Das System MUST sicherstellen, dass die Unterschrift eine realistische Gre (max. 60mm Breite) nicht berschreitet.

## Success Criteria *(mandatory)*

- **SC-001**: **No Background**: Die Unterschrift darf den darunterliegenden Text nicht durch einen weien Kasten verdecken (Transparenz-Garantie).
- **SC-002**: **Print Stability**: Die Unterschrift darf beim PDF-Export nicht verrutschen.

---

## File: specs/015-triple-zone-address/spec.md
---
id: SPEC-015
title: Triple-Zone Address Field
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Triple-Zone Address Field


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-TRIPLEZONE]`
- **Source Pattern**: `[PAT-RC-01]` (rucub100)
- **Anti-Pattern Check**: Verhindert ungenaue Positionierung und unklare Adress-Strukturen.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% Strict
- **Rationale**: Die exakte physikalische Aufteilung des Adressfeldes ist entscheidend fr die Einhaltung der DIN 5008 Norm.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Strukturierte Adress-Eingabe (P1)
Als Anwender mchte eine Adresse eingeben, die exakt in die drei normgerechten Zonen unterteilt ist, damit ich sicher bin, dass alle Angaben (Rcksendung, Vermerk, Anschrift) an der richtigen Stelle stehen.

**Acceptance Scenarios**:
1. **Given** das Adressfeld ist aktiv, **When** ich den DOM untersuche, **Then** sehe ich die Elemente `<rucksendezeile>`, `<vermerkzone>` und `<anschriftzone>`.
2. **Given** die Zonen sind gerendert, **When** ich messe, **Then** ist die Rcksendezeile exakt 5mm hoch.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Semantic Containers**: Das System MUST das Adressfeld (85x45mm) in drei semantische Container unterteilen:
    - `<rucksendezeile>` (Hhe: 5mm)
    - `<vermerkzone>` (Hhe: 12.7mm)
    - `<anschriftzone>` (Hhe: 27.3mm)
- **FR-002: Direct-In-Place Editing**: Jede dieser Zonen MUST direkt auf dem Papier via `contenteditable` editierbar sein (WYSIWYG).
- **FR-003: Zone Guarding**: Das System MUST sicherstellen, dass Text aus einer Zone nicht physikalisch in die nchste "fliet" (Overflow Hidden pro Zone).

## Success Criteria *(mandatory)*

- **SC-001**: **Millimeter Accuracy**: Die Summe der drei Zonen (5 + 12.7 + 27.3) ergibt exakt 45mm.
- **SC-002**: **HTML Clarity**: Die Bezeichner der HTML-Elemente mssen exakt der DIN-Terminologie entsprechen.

---

# ?? CSS-First Synchronicity Addendum

- **FR-004: Variable-Driven Vertical Position**: Die vertikale Position des gesamten Adress-Containers MUST strikt an die CSS-Variable `--header-height` gebunden sein (definiert in SPEC-044).
- **FR-005: Zero-JS Movement**: Das Verschieben des Empfngers beim Wechsel von Form A zu B darf NICHT durch JavaScript-Berechnungen erfolgen, sondern MUST rein durch die Kaskadierung der CSS-Variablen ausgelst werden.
- **Rationale**: Stellt sicher, dass Empfnger und Faltmarken immer perfekt synchron wandern.

---

## File: specs/016-shadow-placeholders/spec.md
---
id: SPEC-016
title: Realistic Shadow Placeholders (Funny/Random)
tags: [specification, din-5008, platin]
status: cemented
weight: 60
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Realistic Shadow Placeholders (Funny/Random)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-SHADOW]`
- **Source Pattern**: `[PAT-RC-03]` (rucub100)
- **Principle Check**: **IV. VANILLA PURITY**: Randomizer-Logik ohne externe Bibliotheken.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 60 
- **Fulfillment Target**: 100% (Zufall & Optik)
- **Rationale**: Erhht die Benutzerfreundlichkeit durch klare Strukturvorgaben und sorgt fr eine positive User Experience durch Humor.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Orientierung durch Beispiele (P1)
Als Anwender mchte ich in leeren Feldern sehen, welche Art von Daten dort erwartet wird (z.B. Name, Strae), um den Brief intuitiv auszufllen.

### User Story 2 - Der "NEO-Geist" (Humor) (P2)
Als Anwender mchte ich ab und zu durch lustige Namen ("Bibo Beutlin", "Harry Potter") berrascht werden, damit die Arbeit mit dem Tool Spa macht.

**Independent Test**: Seite 5x neu laden -> Prfung: Jedes Mal mssen andere Beispiel-Namen in den Platzhaltern erscheinen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Sample Data Pool**: Das System MUST eine Liste von realistischen (aber fiktiven) und humorvollen Beispieldaten fr Namen, Straen und Stdte vorhalten.
- **FR-002: Random Assignment**: Bei jedem Initial-Load (wenn kein Entwurf im LocalStorage ist) MUST das System die `data-placeholder` Attribute zufllig aus dem Pool befllen.
- **FR-003: Diversity**: Der Pool MUST eine Mischung aus Standardnamen (Erika Mustermann) und popkulturellen Anspielungen enthalten.
- **FR-004: Synchronized Shadow**: Strae und Stadt im Platzhalter sollten (sofern mglich) logisch zusammenpassen (z.B. "Winkelgasse" -> "London").

## Success Criteria *(mandatory)*

- **SC-001**: **Variation**: Die Wahrscheinlichkeit, zweimal hintereinander exakt dieselbe Kombination von Platzhaltern zu sehen, muss unter 1% liegen.
- **SC-002**: **Optical Harmony**: Die Platzhalter mssen in einem dezenten Grau erscheinen und beim ersten Tastendruck verschwinden.

---

## File: specs/017-bottom-up-endorsements/spec.md
---
id: SPEC-017
title: Bottom-Up Endorsements
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Bottom-Up Endorsements


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-ENDORSEMENT]`
- **Source Pattern**: `[PAT-RC-02]` (rucub100)
- **Anti-Pattern Check**: Verhindert unprofessionelle Lcken zwischen Vermerk (z.B. Einschreiben) und der eigentlichen Adresse.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: 100% (Visuelle Ausrichtung)
- **Rationale**: Sorgt fr ein professionelles Erscheinungsbild, indem Vermerke "bei der Adresse kleben" bleiben.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische Stapelung nach unten (P1)
Als Anwender mchte ich einen oder mehrere Vermerke (z.B. "Einschreiben", "Persnlich") eingeben, die sich automatisch so ausrichten, dass der letzte Vermerk direkt ber der ersten Adresszeile steht.

**Acceptance Scenarios**:
1. **Given** die Vermerkzone ist leer, **When** ich "Einschreiben" eingebe, **Then** steht dieses Wort in der untersten Zeile der Vermerkzone (direkt ber der Anschriftzone).
2. **Given** ein Vermerk ist vorhanden, **When** ich einen zweiten Vermerk in einer neuen Zeile hinzufge, **Then** stapelt sich der neue Vermerk darber.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Bottom-Up Alignment**: Das Element `<vermerkzone>` MUST den Text am unteren Rand des Containers ausrichten (Flexbox: `justify-content: flex-end` oder hnliche Mechanismen).
- **FR-002: Line-By-Line Stability**: Jede Zeile in der Vermerkzone MUST die Standard-DIN-Zeilenhhe (Hard Grid) einhalten.
- **FR-003: Direct WYSIWYG**: Der Anwender editiert direkt in der Zone, whrend die Logik die Stapelung von unten nach oben sicherstellt.
- **FR-004: Triple-Zone Harmony**: Die Vermerkzone MUST nahtlos an die Anschriftzone anschlieen, um den optischen Block zu wahren.

## Success Criteria *(mandatory)*

- **SC-001**: **Zero Gap**: Zwischen dem untersten Vermerk und dem Namen des Empfngers darf keine leere Zeile entstehen (auer vom Nutzer explizit gewnscht).
- **SC-002**: **Constraint Fidelity**: Die Zone darf nicht hher als 12.7mm werden (Hard Constraint).

---

## File: specs/018-profile-persistence/spec.md
---
id: SPEC-018
title: Profile Persistence
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Profile Persistence


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PROFILE]`
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: All profile data stays local. **II. HYBRID ARCHITECTURE**: Preserves fields even if hidden.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Ein Anwender darf seine Absenderdaten und Assets (Logo/Signatur) niemals doppelt eingeben mssen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Absender-Profil speichern (P1)
Als Anwender mchte ich meine persnlichen Daten (Name, Adresse, IBAN) einmalig eingeben, damit sie bei jedem neuen Brief automatisch ausgefllt werden.

**Acceptance Scenarios**:
1. **Given** das Profil ist befllt, **When** ich die Seite neu lade, **Then** sind Absendername und Adresse sofort wieder im Brief vorhanden.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Data Isolation**: Das System MUST das Profil-Objekt (`profile`) strikt vom Inhalts-Objekt (`content`) trennen.
- **FR-002: Multi-Asset Persistence**: Das Profil MUST Logos (SPEC-005) und digitale Unterschriften (SPEC-024) dauerhaft im `LocalStorage` halten.
- **FR-003: Validation Guard**: Die IBAN im Profil MUST in Echtzeit validiert werden (Mining from Claude).
- **FR-004: Master Reset**: Das System MUST eine Option bieten, NUR den Briefinhalt zu lschen, whrend das Profil (der Absender) erhalten bleibt.

### Data Schema (Ghost Data)
- **Field**: `profile.iban` | **Type**: `String` | **UI**: Control Center Modal (SPEC-049)
- **Field**: `profile.senderName` | **Type**: `String` | **UI**: Control Center Modal (SPEC-049)

## Success Criteria *(mandatory)*

- **SC-001**: **Persistence Fidelity**: 100% der Profildaten berleben Browser-Neustarts und Sitzungs-Wechsel.
- **SC-002**: **No Re-Entry**: Nach der Ersteinrichtung muss ein neuer Brief in weniger als 5 Sekunden (nur Betreff/Text tippen) versandfertig sein.

---

# ?? HTML-Native Addendum

- **FR-005: Native Accordions**: Falls das Profil in einem aufklappbaren Bereich dargestellt wird, MUST das HTML5 `<details>` Element genutzt werden.
- **Exclusive Toggle**: Durch Nutzung des `name`-Attributs (z.B. `<details name="settings">`) MUST sicherstellen, dass sich andere Bereiche automatisch schlieen (Aviation-Grade UI ohne JS).

---

## File: specs/019-reactive-state/spec.md
---
id: SPEC-019
title: Reactive State Authority
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Reactive State Authority


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PROXY]`
- **Source Pattern**: `[PAT-CL-01]` (Claude Proxy) & `[PAT-CL-02]` (Cursor-Safety).
- **Principle Check**: **II. HYBRID ARCHITECTURE**: Pure JS Proxy as the central authority.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Das technische Herzstck. Ohne reaktiven State funktioniert kein Auto-Save, kein Undo und kein intelligenter Briefkopf.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische UI-Updates (P1)
Als Entwickler/Anwender mchte ich, dass sich die UI (z.B. der Briefkopf) sofort ndert, wenn ich Daten im Profil ndere, ohne manuelle DOM-Befehle zu schreiben.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Proxy Authority**: Das System MUST alle Zustandsnderungen ber ein natives ES6 `Proxy`-Objekt abwickeln.
- **FR-002: Cursor-Safety Contract**: Das System MUST UI-Updates fr das gerade fokussierte Element (`activeElement`) berspringen, um Cursor-Sprnge beim Tippen zu verhindern.
- **FR-003: Deep Watch**: Der Proxy MUST verschachtelte Objekte (z.B. `content.recipient.name`) zuverlssig berwachen.
- **FR-004: Undo-Hook**: Jede State-nderung MUST automatisch einen Snapshot in der History (SPEC-012) auslsen.

## Success Criteria *(mandatory)*

- **SC-001**: **No Manual DOM Sync**: Es darf keine Funktion im Code geben, die manuell `element.innerText = ...` aufruft, auer dem zentralen State-Listener.
- **SC-002**: **Cursor Stability**: Whrend des Tippens darf der Cursor NIEMALS an den Anfang oder das Ende des Feldes springen (100% Stabilitt).

---

## File: specs/020-robust-editor/spec.md
---
id: SPEC-020
title: Injection-Proof Editor & Robust Input Controls
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Injection-Proof Editor & Robust Input Controls


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-GUARD]`
- **Source Pattern**: `[PAT-GF-02]` (Sanitizer) & `[PAT-AS-02]` (Spacing Defense).
- **Principle Check**: **IV. VANILLA PURITY**: Strict usage of Range-API. **VIII. CLEANLINESS**: No HTML-garbage in the DOM.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Ein Editor ohne Schutzschilde ist fr professionelle Anwender unbrauchbar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sicherer Paste (P1)
Als Anwender mchte ich Adressen aus E-Mails oder anderen Webseiten reinkopieren knnen, ohne dass fremde Styles (Farben, Schriftarten) oder Code meinen Brief zerstren.

**Independent Test**: Fett formatierten, blauen Text von einer Webseite kopieren und in das Namensfeld einfgen -> Prfung: Der Text muss in NEO als reiner, unformatierter Text erscheinen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Global Paste Sanitizer**: Das System MUST alle `paste`-Events abfangen und den Inhalt via Selection/Range-API in unformatierten Plain Text umwandeln.
- **FR-002: .oneline Guard**: Felder mit der Klasse `.oneline` MUST den Tastendruck von `Enter` sowie das Einfgen von Zeilenumbrchen aktiv blockieren.
- **FR-003: Spacing Defense**: Das System MUST via CSS (`br + br { display: none; }`) verhindern, dass leere Zeilen das Layout knstlich aufblhen.
- **FR-004: XSS Shield**: Die Verwendung von `innerHTML` ist STRENG VERBOTEN. Alle Daten-Injektionen erfolgen via `textContent` oder `innerText`.

## Success Criteria *(mandatory)*

- **SC-001**: **Clean DOM**: Nach einem Paste-Vorgang drfen keine `<span>`, `<div>` oder `style`-Attribute im Editier-Feld zurckbleiben.
- **SC-002**: **No Escape**: Es ist unmglich, durch Tastenkombinationen das Layout einer `.oneline` Zone nach unten zu verschieben.

---

## File: specs/022-business-references/spec.md
---
id: SPEC-022
title: Business Reference Suite
tags: [specification, din-5008, platin]
status: cemented
weight: 30
criticality: OPTIONAL
created: 2026-03-20
---
# Feature Specification: Business Reference Suite


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-BIZ]`
- **Source Pattern**: `[PAT-MV-03]` (Business Zones).
- **Comment for Forks**: "This suite is designed to be easily extensible. Add new keys to the LabelMap to support more business fields."

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 30 
- **Fulfillment Target**: 100% (Erweiterbarkeit)
- **Rationale**: Macht NEO fr Freiberufler und kleine Firmen nutzbar.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Extended Field Map**: Das System MUST Felder fr `Kunden-Nr.`, `Rechnungs-Nr.`, `Ihr Zeichen` und `Unser Zeichen` bereitstellen.
- **FR-002: Dynamic Toggle**: Nicht ausgefllte Geschftsfelder MUST im PDF automatisch ausgeblendet werden (via SPEC-013 :empty Logic).
- **FR-003: Label-Decoupling**: Die Bezeichnungen MUST ber die Translation-Map (SPEC-008) konfigurierbar sein.

## Success Criteria *(mandatory)*

- **SC-001**: **Clean PDF**: Ein Privatbrief (ohne BIZ-Daten) darf keine leeren Beschriftungen wie "Kunden-Nr: " im PDF anzeigen.
- **SC-002**: **Business Pro**: Alle Geschftsdaten sind perfekt am 12pt Hard-Grid ausgerichtet.

---

## File: specs/023-return-line-mirroring/spec.md
---
id: SPEC-023
title: Return-Line Mirroring
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Return-Line Mirroring

**Pattern Source**: `[PAT-NK-01]` / `[PAT-GV-01]`

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-MIRROR]`
- **Lexicon Check**: "Rcksendezeile", "Absenderdaten", "Initialen".
- **Principle Check**: **V. USER SOVEREIGNTY**: Automatische Spiegelung darf manuelle Korrekturen NICHT berschreiben (isDirty Flag).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: 100% (Logische Korrektheit)
- **Rationale**: Spart dem Nutzer das doppelte Tippen seiner Adresse fr das Fensterfeld.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische Spiegelung (P1)
Als Anwender mchte ich, dass mein Name und meine Adresse automatisch in der kleinen Rcksendezeile (ber dem Empfnger) erscheinen, sobald ich meine Absenderdaten eingebe.

**Acceptance Scenarios**:
1. **Given** Rcksendezeile ist leer, **When** ich "Max Mustermann" als Absender eingebe, **Then** erscheint in der Rcksendezeile "M. Mustermann | [STRASSE] | [ORT]".

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Auto-Derivation**: Das System MUST die Rcksendezeile automatisch aus den Feldern `profile.senderName`, `profile.senderStreet` und `profile.senderCity` generieren.
- **FR-002: Smart Shortening**: Das System MUST den Vornamen des Absenders auf die Initiale krzen (z.B. "Moritz Baumeister" -> "M. Baumeister"), um Platz zu sparen.
- **FR-003: Manual Override**: Sobald der Anwender die `<rucksendezeile>` hndisch editiert, MUST die automatische Synchronisation gestoppt werden.
- **FR-004: Delimiter Control**: Die einzelnen Bestandteile MUST durch ein "Mittelpunkt"-Zeichen (  ) oder eine Pipe ( | ) getrennt werden.

## Success Criteria *(mandatory)*

- **SC-001**: **Sync Speed**: Die Rcksendezeile aktualisiert sich in < 100ms nach Eingabe im Absenderfeld.
- **SC-002**: **No Ghost Overwrite**: Manuelle nderungen an der Rcksendezeile bleiben dauerhaft erhalten (User Sovereignty).

---

# ?? Hardening Addendum: PAT-MC-03 (Styling & Initial Logic)

- **FR-005: Micro-Typografie**: Die Rcksendezeile MUST in einer Schriftgre zwischen 6pt und 8pt gerendert werden.
- **FR-006: Underline Guard**: Die Rcksendezeile MUST laut DIN 5008 Empfehlung unterstrichen dargestellt werden, um sie optisch vom Anschriftenfeld abzugrenzen.
- **FR-007: Strict Initial Pattern**: Die Krzung des Vornamens MUST dem Muster `[ERSTER BUCHSTABE] Punkt Leerzeichen [NACHNAME]` folgen (z.B. "Moritz Baumeister" -> "M. Baumeister").
- **Rationale**: Maximale Platzeinsparung bei gleichzeitiger Wahrung der Identitt und Normkonformitt.

---

## File: specs/024-focus-immersion-ui/spec.md
---
id: SPEC-024
title: Focus Immersion UI
tags: [specification, din-5008, platin]
status: cemented
weight: 50
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Focus Immersion UI

**Pattern Source**: `[PAT-GV-04]`

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-FOCUS]`
- **Principle Check**: **III. VISUAL FREEZE**: Fokus-Effekte drfen das Layout (mm-Mae) niemals verschieben (keine Border-nderungen, die Platz beanspruchen).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 50 
- **Fulfillment Target**: 100% (Kein Layout-Shift)
- **Rationale**: Verbessert die Benutzererfahrung durch klares visuelles Feedback ohne die DIN-Przision zu gefhrden.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Visual Feedback**: Das System MUST das aktuell fokussierte `contenteditable` Feld visuell hervorheben.
- **FR-002: Shadow Strategy**: Die Hervorhebung MUST via `box-shadow` oder `background-color` erfolgen, um den Platzbedarf des Elements nicht zu ndern (Zero Layout Shift).
- **FR-003: Ambient Dimming**: Optional: Die Umgebung des fokussierten Blattes kann leicht abgedunkelt werden, um die Konzentration auf den Text zu erhhen.

## Success Criteria *(mandatory)*

- **SC-001**: **Zero Pixel Shift**: Beim Aktivieren des Fokus darf sich kein anderes Element auf der Seite auch nur um einen Mikrometer verschieben.
- **SC-002**: **Accessibility**: Der Fokus-Zustand muss auch fr sehbehinderte Nutzer deutlich erkennbar sein.

---

## File: specs/026-iban-validator/spec.md
---
id: SPEC-026
title: IBAN Validator
tags: [specification, din-5008, platin]
status: cemented
weight: 50
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: IBAN Validator


## ?? Brain-First Alignment
- **Traceability ID**: `[DIN-LOGIC-IBAN]`
- **Requirement**: FR-001: Echtzeit-Prfung der IBAN-Struktur (Lnge und Prfsumme).

---

## File: specs/027-svg-markers/spec.md
---
id: SPEC-027
title: SVG Precision Markers
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: SVG Precision Markers


## ?? Brain-First Alignment
- **Traceability ID**: `[DIN-UI-MARKERS]`
- **Requirement**: FR-001: Lochmarke bei 148.5mm. FR-002: Faltmarken bei 105mm/210mm (B) oder 87mm/192mm (A).



---

# ? Anchor Positioning Upgrade

- **FR-003: Native Anchor Positioning**: Die Positionierung der Faltmarken MUST via CSS Anchor Positioning API erfolgen.
- **?? JS-ELIMINATION**: Mathematische JavaScript-Berechnungen zur Bestimmung der Marken-Koordinaten sind ERSATZLOS GESTRICHEN. Die Marken werden im CSS direkt an die Blattkanten oder Container-Grenzen 'geankert'.

---

## File: specs/028-address-safety/spec.md
---
id: SPEC-028
title: Address Window Safety
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Address Window Safety


## ?? Brain-First Alignment
- **Traceability ID**: `[DIN-UI-BUFFER]`
- **Requirement**: FR-001: 1.5mm Pufferzone an allen Seiten des Adressfensters.

---

## File: specs/029-page-breaks/spec.md
---
id: SPEC-029
title: Page-Break Indicators
tags: [specification, din-5008, platin]
status: cemented
weight: 70
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Page-Break Indicators


## ?? Brain-First Alignment
- **Traceability ID**: `[DIN-UI-BREAKS]`
- **Requirement**: FR-001: Visuelle Linie im Editor bei Erreichen von 297mm Hhe.

---

## File: specs/030-portable-html-export/spec.md
---
id: SPEC-030
title: Portable HTML State Export
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Portable HTML State Export


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-PORTABLE]`
- **Anti-Pattern Check**: Verhindert hssliche, berlange URLs (Rejected SPEC-025).
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: The exported file is self-contained and works locally.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Verlustfreie Datenbertragung)
- **Rationale**: Ermglicht das Speichern von "echten" Dateien auf der Festplatte, die man wie Dokumente verwalten kann.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: JSON Wrapping**: Das System MUST alle relevanten State-Daten (Content, Profile, Config) in ein JSON-Objekt serialisieren.
- **FR-002: Portable HTML Wrapper**: Beim Klick auf "Speichern" MUST das System eine kleine HTML-Datei zum Download anbieten.
- **FR-003: Embedded Data**: Diese Datei MUST das JSON-Objekt in einem `<script>`-Block enthalten.
- **FR-004: Re-Opening Logic**: Beim ffnen der exportierten HTML-Datei MUST diese automatisch die Haupt-App (NEO) aufrufen und die Daten via `postMessage` oder ein hnliches sicheres Verfahren bergeben.
- **FR-005: Offline-Safety**: Der Export MUST auch funktionieren, wenn der Nutzer offline ist (Base64-kodierter Download).

## Success Criteria *(mandatory)*

- **SC-001**: **Clean URL**: Die URL im Browser bleibt sauber und bersichtlich (kein Daten-Mll in der Adresszeile).
- **SC-002**: **Portability**: Eine gespeicherte Brief-Datei kann per E-Mail verschickt und vom Empfnger (sofern er Zugriff auf NEO hat) sofort editiert werden.

---

## File: specs/031-no-comma-greeting/spec.md
---
id: SPEC-031
title: No-Comma Greeting Rule
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: No-Comma Greeting Rule


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-GREETING]`
- **Requirement**: FR-001: Das System MUST sicherstellen, dass nach der Gruformel (z.B. "Mit freundlichen Gren") KEIN Komma gesetzt wird.
- **Rationale**: Entspricht der aktuellen DIN 5008 Empfehlung zur Modernisierung der Geschftskorrespondenz.

## Success Criteria *(mandatory)*
- **SC-001**: 100% Konformitt in der automatischen Generierung und beim PDF-Export.

---

## File: specs/032-quality-gates/spec.md
---
id: SPEC-032
title: Agent-Grade Quality Gates
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Agent-Grade Quality Gates


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-VALIDATION-GATE]`
- **Requirement**: Implementierung von professionellen Validierungs-Regeln vor dem Druck.
- **Rationale**: Ein Brief darf nur dann gedruckt/exportiert werden, wenn er 100% posttauglich ist.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Verhindert Porto-Verschwendung und Rcklufer durch ungltige Adress-Formate.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Strict Address Validation**:
    - **PLZ-Check**: MUST 5 Ziffern fr deutsche Adressen erzwingen.
    - **Line Count**: Die Anschriftzone MUST maximal 6 Zeilen enthalten.
    - **Line Width**: Zeilen drfen maximal ~55 Zeichen (bei 11pt) lang sein, um nicht aus dem Fenster zu ragen.
- **FR-002: Safety Margin (Einschreiben)**:
    - Das System MUST eine optionale "Einschreiben-Sicherheitsmarge" untersttzen, bei der die Adresse erst bei **66mm** (statt 62.7mm) beginnt, um Platz fr API-Versand-Banner (z.B. LetterXpress) zu lassen.
- **FR-003: Return Address Length**:
    - Die Rcksendezeile MUST auf maximal 90 Zeichen begrenzt werden (Fensterbreite).
- **FR-004: Pre-Print Check**:
    - Der Druck-Button MUST erst aktiv werden (oder eine Warnung ausgeben), wenn alle Quality-Gates bestanden sind.

## Success Criteria *(mandatory)*

- **SC-001**: **Postal Compliance**: 100% der exportierten Briefe sind ohne Nachbearbeitung durch die Post (DL-Fensterumschlag) zustellbar.
- **SC-002**: **Validation Clarity**: Fehlermeldungen mssen exakt benennen, welche Zeile oder welches Feld die Norm verletzt.

---

# ?? International Validation Addendum (Markup-First)

- **FR-005: Context-Aware PLZ-Check**: Das System MUST die Validierung der Postleitzahl an das gewhlte Zielland anpassen:
    - **DE**: 5 Ziffern (`pattern="\d{5}"`)
    - **AT / CH / LI / LU**: 4 Ziffern (`pattern="\d{4}"`)
- **FR-006: Soft-Toast Validation**: Bei einer Verletzung der PLZ-Norm MUST ein "Soft-Toast" (SPEC-042) erscheinen:
    - **Inhalt**: "Hinweis: Die PLZ scheint fr [LAND] nicht korrekt zu sein. Bitte prfen."
    - **Verhalten**: Der Toast darf den Schreibfluss nicht blockieren (Non-modal).
- **FR-007: Native API Usage**: Die Validierung MUST primr ber die Browser-native **Constraint Validation API** erfolgen. JavaScript dient nur als Brcke zum Toast-System.

---

# ?? Cross-Browser Quality Addendum

- **FR-008: Interop Baseline Check**: Das System MUST vor dem Release gegen die "Baseline 2025" (Widely Available) von caniuse.com geprft werden.
- **FR-009: Purity Degradation**: Falls ein High-End Feature (z.B. Temporal) nicht vorhanden ist, MUST NEO eine funktionale Basis-Logik (Fallback) bereitstellen, die den Kernprozess (Brief schreiben & drucken) nicht behindert.

---

## File: specs/033-multi-page-pagination/spec.md
---
id: SPEC-033
title: Dynamic Multi-Page Pagination
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Dynamic Multi-Page Pagination


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PAGINATION]`
- **Anti-Pattern Check**: Verhindert das "Verschwinden" von Text unter dem Seitenrand (Anti-Pattern: Single-Page Locked Layout).
- **Requirement**: FR-001: Das System MUST erkennen, wenn der Textbereich die A4-Hhe (297mm) berschreitet.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Normkonforme Paginierung)
- **Rationale**: Ein Brief-Generator, der nur eine Seite kann, ist fr lngere Korrespondenz unbrauchbar.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Automatic Page Break**: Das System MUST bei berschreitung des verfgbaren Platzes auf Seite 1 (unter Bercksichtigung von Fuzeilen und Rndern) automatisch eine Folgeseite erstellen.
- **FR-002: Header/Footer Transfer**: Folgeseiten MUST reduzierte Kopfzeilen (keine Anschriftzone mehr) und konsistente Fuzeilen enthalten.
- **FR-003: Page Numbering (X of Y)**: Ab der zweiten Seite MUST das System oben rechts oder unten mittig "- Seite x von y -" drucken.
- **FR-004: Paragraph Integrity**: Das System MUST versuchen, Abstze nicht unvorteilhaft in der Mitte zu zerreien (Witwen- und Waisenkinder-Regelung).

## Success Criteria *(mandatory)*

- **SC-001**: **Printing Accuracy**: Die Seitenumbrche im Browser-Editor MUST exakt mit den Umbrchen im PDF-Export bereinstimmen.
- **SC-002**: **Total Page Count**: Die Gesamtseitenzahl (Y) muss in Echtzeit berechnet und auf allen Seiten korrekt angezeigt werden.

---

# ?? Zero-Scroll Hardening Addendum

- **FR-005: Non-Scrollable Navigation**: Mehrseitige Briefe MUST ber ein "Blttern"-System (Seite Vor/Zurck) zugnglich gemacht werden. Ein vertikales Aneinanderreihen von Seiten mit Scrollbar ist VERBOTEN.
- **FR-006: Viewport Enforcement**: Das System MUST sicherstellen, dass die gesamte App (Papier + Sidebars) immer in den aktuellen Viewport des Browsers passt.
- **FR-007: Overflow Kill-Switch**: Alle Container MUST `overflow: hidden` nutzen. Inhalt, der physisch nicht passt, muss aktiv gemanagt (verschoben oder gewarnt) werden, anstatt Scrollbars zu erzeugen.

---

## File: specs/034-letter-appendices/spec.md
---
id: SPEC-034
title: Formal Letter Appendices
tags: [specification, din-5008, platin]
status: cemented
weight: 60
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Formal Letter Appendices


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-APPENDIX]`
- **Requirement**: Untersttzung fr normgerechte Anhnge am Briefende.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 60 
- **Rationale**: Erhht die Professionalitt bei komplexen Schreiben (z.B. Verteilerlisten).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Postscriptum (PS)**: Das System MUST ein optionales Feld fr "PS:" nach der Gruformel/Unterschrift bereitstellen.
- **FR-002: Carbon Copy (CC / Verteiler)**: Das System MUST eine Liste fr den Verteiler ("Kopie an:") untersttzen.
- **FR-003: Dynamic Ordering**: Die Anhnge MUST in der korrekten Reihenfolge (Unterschrift -> PS -> Anlagen -> Verteiler) gerendert werden.
- **FR-004: Empty Logic**: Felder MUST via SPEC-013 (:empty Logic) ausgeblendet werden, wenn sie keinen Inhalt haben.

## Success Criteria *(mandatory)*

- **SC-001**: **Layout Consistency**: Anhnge drfen niemals das Seitenlayout auf Seite 1 unkontrolliert verschieben (Trigger fr SPEC-033 Paginierung).

---

## File: specs/035-pdf-metadata/spec.md
---
id: SPEC-035
title: PDF Metadata Autopilot
tags: [specification, din-5008, platin]
status: cemented
weight: 50
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: PDF Metadata Autopilot


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-METADATA]`
- **Requirement**: Automatische Befllung von PDF-Dokumenteigenschaften.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 50
- **Rationale**: Verbessert die Durchsuchbarkeit und Archivierbarkeit der generierten PDFs.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Property Sync**: Das System MUST beim PDF-Export folgende Eigenschaften setzen:
    - **Titel**: Betreffzeile (bereinigt).
    - **Autor**: Absendername.
    - **Sprache**: Deutsch (de-DE).
    - **Ersteller**: DIN-BriefNEO.
- **FR-002: Automatic Mapping**: Die Daten MUST direkt aus dem `StateManager` (Profile & Content) bezogen werden.

## Success Criteria *(mandatory)*

- **SC-001**: **Archive Integrity**: Beim ffnen des PDFs in Acrobat oder Vorschau mssen die Metadaten in den Dokumenteigenschaften (STRG+D) korrekt angezeigt werden.

---

# ?? Deep Indexing Addendum: Searchable PDF Metadata

- **FR-003: Deep Searchability Fields**: Das System MUST beim Export folgende Daten in das "Stichwrter" (Keywords) Feld des PDFs schreiben:
    - Empfnger-Name
    - Empfnger-Stadt
    - Dokumenten-Datum
    - Aktenzeichen / Referenz
- **FR-004: Invisible Indexing Layer (Vanilla Fallback)**:
    - Falls technisch mglich (via Print-Engine), MUST ein unsichtbarer Text-Block (opacity: 0) am Seitenende eingefgt werden, der diese Metadaten als reinen Text enthlt.
    - Ziel: OS-Indexierung (Spotlight/Windows Search) muss den Brief finden, wenn man nach dem Empfnger sucht, auch wenn dieser Name nicht im Dateinamen steht.
- **FR-005: Privacy Scrubber**: Das System MUST sicherstellen, dass keine hochsensiblen Daten (wie IBAN oder Passwrter) in die Metadaten gelangen.
- **Weighting Update**: Die Suchbarkeit der PDF-Inhalte wird mit 80/100 bewertet.

---

# ?? Machine-Readable Addendum: The DNA-Marker (Anchor)

- **FR-006: The BRIEF-METADATA Anchor**: Das System MUST am Ende des Dokuments einen maschinenlesbaren DNA-Marker einfgen.
    - **Marker-Prfix**: `###BRIEF-METADATA`
    - **Format**: `###BRIEF-METADATA:{"app":"DIN-BriefNEO","ver":"10.0","recipient":"[NAME]","city":"[STADT]","date":"[ISO-DATUM]","subject":"[BETREFF]"}###`
    - **Position**: Am untersten Rand des Blattes, auerhalb des sichtbaren Bereichs (via `opacity: 0`).
- **FR-007: Indexing Catalyst**: Dieser Marker dient als eindeutiger Anker fr spezialisierte Such-Tools und Skripte (z.B. PowerShell/Python), um Briefe in Lichtgeschwindigkeit zu identifizieren und zu katalogisieren.
- **FR-008: Dual-Path Logic (Architectural Choice)**: Beide Pfade MUST als gltige Ideen fr die Implementierung dokumentiert bleiben:
    - **Pfad A (Profi-Library/jsPDF)**: Daten werden direkt in die offiziellen binren PDF-Metadaten-Felder geschrieben.
    - **Pfad B (Vanilla/Native Print)**: Der unsichtbare DNA-Marker im Text-Layer dient als universeller Lebensretter fr die Durchsuchbarkeit.
    - **Entscheidung**: Der endgltige Pfad wird whrend der Implementierungs-Phase gewhlt.

---

## File: specs/036-snippet-manager/spec.md
---
id: SPEC-036
title: Text Snippet Manager
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Text Snippet Manager


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-SNIPPET]`
- **Principle Check**: **IV. VANILLA PURITY**: Logic via simple Arrays/Objects. **V. USER SOVEREIGNTY**: Snippets are suggestions, not forced.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: 100% (Usability)
- **Rationale**: Massive Zeitersparnis durch Vermeidung von repetitiven Tipparbeiten in Standard-Zonen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Semantic Content Pool**: Das System MUST vordefinierte Listen fr folgende Zonen enthalten:
    - **Vermerkzone**: Einschreiben, Einschreiben Einwurf, Einschreiben Eigenhndig, Persnlich / Vertraulich, Nicht nachsenden!, Warensendung, Bchersendung.
    - **Betreff**: Kndigung meines Vertrages (Nr. [Nummer]), Bewerbung als [Position], Anforderung von Unterlagen, Widerspruch gegen Ihren Bescheid vom [Datum], Zahlungserinnerung / 1. Mahnung, Antrag auf [Leistung].
    - **Anlagen**: Lebenslauf, Zeugnisse, Kopie des Vertrages, Nachweise in der Anlage, rztliches Attest.
- **FR-002: UI Trigger (The Plus Button)**: 
    - Die Vermerkzone MUST am Ende der Zeile ein dezentes "Plus"-Icon ( + ) anzeigen.
    - Bei Klick MUST ein schnelles Auswahlmen (Dropdown oder Mini-Modal) mit den Optionen erscheinen.
- **FR-003: Zone Exclusion**: 
    - Anrede und Gruformel sind explizit EXKLUDIERT, da diese von der **Salutation Engine (SPEC-002)** intelligent berechnet werden.
- **FR-004: Smart Insertion**: Beim Whlen eines Snippets MUST der Text an der aktuellen Cursor-Position eingefgt werden (oder das Feld ersetzen, falls leer).

## Success Criteria *(mandatory)*

- **SC-001**: **Click-to-Text Speed**: Das Einfgen eines Snippets (vom Klick auf Plus bis zum Text im Feld) erfolgt in < 100ms.
- **SC-002**: **No Manual Search**: Der Nutzer muss niemals extern nach DIN-konformen Vermerken suchen; alle gngigen Optionen sind integriert.

---

# ?? Popover API Upgrade (Markup-First)

- **FR-005: Native Popover Integration**: Das Snippet-Auswahlmen MUST das native HTML-Attribut `popover` nutzen.
- **JS Elimination**: Jegliche JavaScript-Logik fr das Einblenden, Ausblenden oder Zentrieren des Mens ist ERSATZLOS GESTRICHEN. Der Browser bernimmt das Rendering im Top-Layer.
- **Light Dismiss**: Das Men MUST die native "Light-Dismiss" Funktionalitt nutzen (automatisches Schlieen bei Klick auerhalb).
- **Rationale**: Hchste Stabilitt und 0% Konflikt mit dem DIN-Layout (keine Z-Index Kmpfe mehr).
- **FR-006: Invoker API**: Das ffnen des Popovers MUST via `command="toggle-popover"` und `commandfor="[id]"` am Plus-Button erfolgen (Zero-JS Toggle).

---

## File: specs/037-din-formatter/spec.md
---
id: SPEC-037
title: DIN-Logic Formatter (Aviation Grade)
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: DIN-Logic Formatter (Aviation Grade)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-FORMAT]`
- **Lexicon Check**: "Adaptive Visual Gap", "Durchwahl", "ISO-Datum", "Ortsnetzkennzahl".
- **Principle Check**: **V. USER SOVEREIGNTY**: The formatter MUST NOT destroy user input but "beautify" it.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Norm-Konformitt)
- **Rationale**: Ein Platinum-Briefgenerator muss sicherstellen, dass Zahlen und Daten den hchsten professionellen Standards entsprechen.

---

## Requirements *(mandatory)*

### FR-001: Adaptive Visual Gap (Telephone)
- **Was**: Ersetzung des physischen Leerzeichens zwischen Vorwahl und Rufnummer durch einen visuellen Abstand.
- **Logik**: Das System MUST einen `<span>` mit einem `margin-right` (entsprechend ca. einem halben Leerzeichen) zwischen Vorwahl und Nummer einfgen.
- **Clipboard-Safety**: Der `<span>` MUST so konfiguriert sein, dass beim Kopieren (Copy-Paste) KEIN Leerzeichen im Clipboard landet (reiner Zahlen-String).
- **Heuristic**: Das System MUST versuchen, die Vorwahl (3-5 Stellen beginnend mit 0) automatisch zu erkennen. Falls uneindeutig, bleibt die manuelle Trennung des Nutzers gewahrt.

### FR-002: Extension Handling (Durchwahl)
- **Was**: Anschluss von Durchwahlnummern.
- **Logik**: Durchwahlnummern MUST mit einem Bindestrich `-` ohne Leerzeichen an die Hauptnummer angehngt werden (Beispiel: `030 123456-78`).

### FR-003: IBAN Beautifier
- **Was**: Formatierung der IBAN in Viererblcken.
- **Logik**: Das System MUST die IBAN visuell in Blcke unterteilen, wobei das Clipboard-Inhalt-Prinzip (keine Leerzeichen beim Kopieren) ebenfalls angewendet wird.

### FR-004: Date Autopilot
- **Was**: Normgerechte Wandlung von Datumsangaben.
- **Logik**: Eingaben wie "19 3 26" MUST automatisch in `19.03.2026` oder (optional einstellbar) in das ISO-Format `2026-03-19` umgewandelt werden.

## Success Criteria *(mandatory)*

- **SC-001**: **Clipboard Purity**: Kopierte Telefonnummern aus NEO enthalten in 100% der Flle keine strenden Leerzeichen im Zielsystem (z.B. Telefonie-App).
- **SC-002**: **Optical Precision**: Der visuelle Abstand im Brief entspricht exakt dem DIN-Schriftbild (ca. 0.25em bis 0.5em).
- **SC-003**: **Zero Data Corruption**: Die Formatierung darf niemals Zahlenwerte verndern oder lschen.

---

# ??? Guardrail Addendum: DIN-Compliance Toasts

- **FR-005: Compliance Toast Warning**: Das System MUST beim Tippen von nicht DIN-konformen Zeichen (z.B. Klammern in Telefonnummern) eine Toast-Nachricht anzeigen.
- **Toast Message**: "Hinweis: Klammern sind laut DIN 5008 in Rufnummern nicht mehr vorgesehen."
- **FR-006: User Choice (Guardrail Toggle)**: Beim ersten Erscheinen des Toasts MUST der Nutzer gefragt werden:
    - [A] "Strikt einhalten (Automatisch korrigieren)"
    - [B] "Trotzdem zulassen (Ignorieren)"
- **FR-007: Preference Persistence**: Die Entscheidung MUST im `localStorage` gespeichert werden und ist jederzeit in den Einstellungen nderbar.

---

# ?? Time Formatting Addendum (from Wikipedia)

- **FR-008: DIN-Time Pattern (Germany/Austria)**: 
    - Das System MUST Uhrzeiten im Format `HH:MM` oder `HH:MM:SS` (Doppelpunkt-Trennung) formatieren.
    - **Leading Zero Logic**: Bei alleiniger Stundenangabe KEINE fhrende Null (z.B. "9 Uhr"). Bei Minutenangabe PFLICHT zur fhrenden Null (z.B. "09:31 Uhr").
    - **Space Guard**: Zwischen Zahl und "Uhr" MUST ein geschtztes Leerzeichen (`&nbsp;`) stehen.
- **FR-009: Swiss-Time Pattern**: 
    - Falls Land = Schweiz, MUST ein Punkt als Trenner verwendet werden (z.B. "15.00 Uhr").
- **FR-010: Period Consistency**: In Zeitrumen MUST der Detailgrad auf beiden Seiten gleich sein (z.B. "09:0011:30 Uhr" statt "911:30 Uhr").

---

## File: specs/038-api-superpowers/spec.md
---
id: SPEC-038
title: Aviation-Grade Intelligence Suite (Superpowers)
tags: [specification, din-5008, platin]
status: cemented
weight: 95
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Aviation-Grade Intelligence Suite (Superpowers)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-INTEL]`
- **Tier-Mandate**: Strikte Einhaltung des korrigierten Vier-Stufen-Modells (Tier 0-3).
- **Philosophy**: Tier 0 ist das Fundament. Tier 1-3 sind optionale Verstrker.

---

## ? Tier 0: Hardcoded Logic (Vanilla Fallback)
- **FR-001: Local Salutation Sets**: Integration der 3 Anredeformen (Normal, Hflich, Frmlich) direkt im Code.
- **FR-002: Porto-Kalkulator**: Blattzahl -> Gewicht -> Porto (DP-Tabelle 2025). 100% Offline.
- **FR-003: Einschreiben-Empfehlung**: Lokale Stichwortanalyse ohne Cloud-Anbindung.
- **FR-004: Bank-Postfach-Database**: Statische JSON-DB fr Adressen von Instituten.
- **FR-005: Fristenrechner**: Lokale Berechnung der Zustellfiktion ( 122 BGB).

## ?? Tier 1: Public Wisdom (No-Key APIs)
- **FR-006: Basiszinssatz-Rechner**: Bundesbank-Schnittstelle ( 247 BGB).
- **FR-007: Wochentags-Wchter**: Public API Check auf Feiertage/Wochenenden.
- **FR-008: Whrungsumrechnung**: EZB-Referenzkurse via JSON-Feed.
- **FR-009: Justiz-Finder**: ffentliche REST-Verzeichnisse fr Gerichte & mter.
- **FR-010: Synonym-Radar**: OpenThesaurus API (Key-frei).

## ?? Tier 2: Free-Key Superpowers (User-Key APIs)
- **FR-011: Address Autocomplete**: Integration von GeoApify oder Google Places (Free Tier Keys).
- **FR-012: Grammar/Style Guard**: LanguageTool API (Kostenlose Stufe).
- **FR-013: Corporate Registry**: Handelsregister-Autofill via offeneregister.de.
- **FR-014: Gender-Validation**: Professionelle Prfung via Gender-API.com.

## ?? Tier 3: Monetary Services (Pay-per-Action)
- **FR-015: Digital Postage (Internetmarke)**: Kostenpflichtiger Kauf via Deutsche Post REST API.
- **FR-016: Monetary Safety**: MUST strikten Sicherheitsschalter (Dead Man Switch) nutzen.

---

## ??? Implementation Rules
1. **Tier-Separation**: Features MUST technisch so getrennt sein, dass Tier 0 immer funktioniert.
2. **Key Privacy**: Alle Keys (Tier 2) und Login-Daten (Tier 3) MUST im `localStorage` verbleiben.
3. **User Sovereignty**: Jede API-Abfrage MUST dezent sein. Der Nutzer hat das letzte Wort.

---

## File: specs/039-enclosure-logic/spec.md
---
id: SPEC-039
title: Enclosure & Distribution Logic
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Enclosure & Distribution Logic


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-ENCL]`
- **Requirement**: FR-001: Das Wort **Anlage(n)** MUST fett gedruckt sein.
- **Requirement**: FR-002: Beginn exakt 3 Leerzeilen unter der Gruformel oder Unterschrift.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Rationale**: Korrekte Abstnde am Briefende sind ein oft bersehenes DIN-Detail.

---

## Requirements *(mandatory)*

### FR-001: Dynamic Vertical Spacing
- **Logik**: Das System MUST den Abstand zu den Anlagen dynamisch berechnen:
    - Ohne Unterschrift-Asset: 3 Leerzeilen nach der Gruformel.
    - Mit Unterschrift-Asset (SPEC-024): 3 Leerzeilen nach der grafischen Unterschrift.
- **Constraint**: Der Abstand MUST exakt dem Hard-Grid (12pt Schritte) entsprechen.

### FR-002: Multi-Column Layout
- **Was**: Behandlung von vielen Anlagen bei Platzmangel.
- **Logik**: Falls die Anlagenliste die Seite sprengen wrde (Zero-Scroll Policy), MUST das System die Liste zweispaltig formatieren.

### FR-003: Distribution List (Verteiler)
- **Was**: "Kopie an"-Vermerk.
- **Logik**: Der Verteiler MUST unter den Anlagen erscheinen (Abstand: 1 Leerzeile).

## Success Criteria *(mandatory)*
- **SC-001**: **The 3-Line Rule**: In der Druckvorschau liegen zwischen dem Namen des Unterzeichners und dem Wort "Anlage" exakt 3 leere Zeilenbereiche.

---

# ?? Duplex Hardening Addendum (from Phoenix4815)

- **FR-004: Duplex-Aware Enclosures**: Das System MUST eine Option "Duplex-Sicherer Druck" bereitstellen.
- **Logik**: Falls aktiv, MUST das System beim Druck/Export sicherstellen, dass jeder Anhang (falls mehrere PDFs kombiniert werden) auf einer ungeraden Seitenzahl (Vorderseite) beginnt.
- **Technik**: Automatisches Einfgen einer Vakatseite (Leerseite), falls das vorherige Dokument auf einer ungeraden Seite endet.
- **Rationale**: Verhindert, dass die erste Seite eines Anhangs auf der Rckseite des Briefes oder eines anderen Anhangs gedruckt wird.

---

## File: specs/040-page2-header/spec.md
---
id: SPEC-040
title: Folgeseiten-Kopf (Page 2+ Header)
tags: [specification, din-5008, platin]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Folgeseiten-Kopf (Page 2+ Header)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-PAGE2]`
- **Requirement**: Automatische Generierung der Kurz-Referenz ab der zweiten Seite.
- **Rationale**: Sicherstellung des Kontextes bei mehrseitigen Dokumenten (Anti-Verlust-Schutz).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 85 
- **Rationale**: Ein professioneller Brief-Generator darf den Empfnger auf Folgeseiten niemals "im Dunkeln" lassen.

---

## Requirements *(mandatory)*

### FR-001: Automatic Header Generation
- **Was**: Sobald der Brief eine zweite Seite (SPEC-033) erzeugt, MUST oben auf dieser Seite ein Kopfbereich erscheinen.
- **Position**: Der Kopf beginnt bei **20 mm** von der oberen Blattkante (analog zum linken Rand).

### FR-002: Kurz-Referenz Content
- **Was**: Der Inhalt der Kopfzeile auf Folgeseiten.
- **Zusammensetzung**: Das System MUST folgende Daten in einer Zeile (getrennt durch Pipe `|` oder Mittelpunkt ``) anzeigen:
    - **Empfnger**: "An: [Name des Empfngers]"
    - **Datum**: "vom [Datum des Briefes]"
    - **Paginierung**: "Seite [X] von [Y]" (z.B. "Seite 2 von 3")

### FR-003: Visual Styling
- **Schrift**: 9pt bis 10pt (etwas kleiner als der Haupttext, um sich abzuheben).
- **Separator**: Optionaler dezenter horizontaler Strich (0.25pt) unter der Kurz-Referenz zur visuellen Trennung vom Folgetext.

### FR-004: Text-Start Offset
- **Logik**: Der eigentliche Brieftext auf Folgeseiten MUST erst nach einem definierten Abstand (z.B. bei **35 mm** bis **40 mm**) beginnen, um Platz fr den Kopf zu lassen.

## Success Criteria *(mandatory)*
- **SC-001**: **Multi-Page Context**: Auf jeder gedruckten Folgeseite ist sofort ersichtlich, zu welchem Vorgang das Blatt gehrt.
- **SC-002**: **Aviation Precision**: Die Paginierung "X von Y" ist auf jeder Seite (inklusive Seite 1, falls > 1) in Echtzeit korrekt berechnet.

---

# ?? Document Factory Addendum (from WeasyPrint)

- **FR-005: CSS-Native Pagination**: Das System MUST `counter(page)` und `counter(pages)` im CSS nutzen, um die Seitenzahlen ("X von Y") rein ber die Print-Engine des Browsers zu generieren.
- **FR-006: Running Headers**: Falls technisch mglich (via `@page`), MUST die Kopfzeile der Folgeseiten als "Running Element" definiert werden, um absolute Layout-Stabilitt zu garantieren.

---

## File: specs/041-messaging-registry/spec.md
---
id: SPEC-041
title: Central Messaging & Toast Registry
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Central Messaging & Toast Registry


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-MESSAGING]`
- **Lexicon Check**: "Toast-ID", "Compliance-Trigger", "UI-Hint", "Aviation-Alert".
- **Anti-Pattern Check**: Verhindert [ANTI-013] (Hardcoded Strings in der Logik).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Rationale**: Zentrale Pflege aller Warnungen und Hinweise. Ermglicht schnelles Anpassen von DIN-Begrndungen ohne Code-Eingriffe.

---

## Requirements *(mandatory)*

### FR-001: The MESSAGES Registry Object
- **Was**: Eine zentrale Datenstruktur (ES6 Frozen Object), die alle Texte enthlt.
- **Logik**: Die Struktur MUST hierarchisch sein:
    - `COMPLIANCE`: DIN-spezifische Warnungen (z.B. Klammern in Telefonnr.).
    - `UI_HINTS`: Tipps fr den Nutzer (z.B. "Betreff prefix entfernt").
    - `ERRORS`: Systemfehler (z.B. "LocalStorage voll").
- **Fields**: Jede Message MUST eine `id`, einen `text` und einen `type` (info, warn, error) haben.

### FR-002: DIN-Reference Injection
- **Was**: Hinterlegung der DIN-Begrndung pro Toast.
- **Logik**: Jede Compliance-Message MUST (optional) ein Feld `din_ref` (z.B. "DIN 5008:2020, Kap. 8.2") enthalten, das bei Bedarf (Expert Mode) angezeigt werden kann.

### FR-003: Performance-First Access
- **Was**: Blitzschneller Zugriff auf Texte.
- **Logik**: Da die Registry ein statisches JS-Objekt ist (kein `fetch` einer JSON ntig), MUST der Zugriff in O(1) Zeit erfolgen (direkter Key-Zugriff).

### FR-004: Internationalization Ready (i18n)
- **Logik**: Die Struktur MUST so aufgebaut sein, dass sie spter leicht auf `EN` erweitert werden kann (z.B. `MESSAGES.DE.COMPLIANCE.PHONE`).

## Success Criteria *(mandatory)*
- **SC-001**: **Centralization**: 100% aller im UI sichtbaren Strings befinden sich in dieser Registry. Keine hndischen Texte in den Controllern.
- **SC-002**: **Consistency**: Alle Toasts nutzen dasselbe visuelle Format (Typografie & Farbe) basierend auf ihrem Registry-Typ.

---

## File: specs/042-hard-margins/spec.md
---
id: SPEC-042
title: Hard Margin Transitions
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Hard Margin Transitions


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-BARRIERS]`
- **Requirement**: Schutz der DIN-Zonen gegen gegenseitiges Verschieben.
- **Rationale**: Ein Text in Zone A darf niemals die Position von Zone B verndern.

---

## ?? Requirements *(mandatory)*

### FR-001: Absolute Vertical Anchors
- **Was**: Jede Hauptzone (Absender, Anschrift, Infoblock, Betreff, Text) MUST einen festen vertikalen Startpunkt (Y-Koordinate) besitzen.
- **Technik**: Nutzung von `position: absolute` oder `grid-template-areas` mit fixen Zeilenhhen in Millimetern.

### FR-002: Overflow Containment (The Barrier)
- **Was**: "Physikalische Barriere".
- **Logik**: Wenn der Text innerhalb einer Zone (z.B. Anschriftzone) das Ende des reservierten Bereichs erreicht, MUST er abgeschnitten (`overflow: hidden`) oder auf die nchste Paginierungs-Ebene geschoben werden.
- **Verbot**: Es ist VERBOTEN, dass eine Zone eine nachfolgende Zone nach unten "drckt" (kein relativer Flow zwischen Zonen).

### FR-003: Transition Margins
- **Was**: Die exakten Leerbereiche zwischen Zonen.
- **Zement**: Der Abstand zwischen Adressfenster (Ende bei 90mm) und Betreffzeile (Beginn bei 103.4mm) MUST eine unzerstrbare "Todeszone" von 13.4mm sein, in die kein Text flieen darf.

## Success Criteria *(mandatory)*
- **SC-001**: **Zero Pixel Shift**: Egal wie viel Text in das Adressfeld kopiert wird, die Betreffzeile bleibt exakt auf Millimeter 103.4 stehen.

---

## File: specs/043-pdf-engine/spec.md
---
id: SPEC-043
title: High-Fidelity PDF Engine
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: FUNDAMENTAL
created: 2026-03-20
---
# Feature Specification: High-Fidelity PDF Engine

**Decision**: **Enhanced Native Browser Print**

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PDF]`
- **Rationale**: jsPDF wurde abgelehnt (veraltet, bricht CSS-Przision, hohe Redundanz). Native Print garantiert 100%ige Deckungsgleichheit zwischen Editor und PDF.

---

## ?? Requirements *(mandatory)*

### FR-001: The "What You See Is What You Get" (WYSIWYG) Mandate
- **Zement**: Das System MUST den browser-eigenen Druckdialog (`window.print()`) nutzen.
- **Vorteil**: Die physikalische Render-Engine von Chrome/Firefox ist jedem JS-PDF-Generator in Bezug auf Typografie und Vektorgrafik (SVG) haushoch berlegen.

### FR-002: Print-UI Pre-Flight
- **Was**: Automatisches Aufrumen des UI vor dem Druck.
- **Logik**: Bei Klick auf "Drucken" MUST das System via CSS (`@media print`) alle Sidebars, Buttons, Grid-Hilfslinien und Platzhalter-Texte (SPEC-013) instantan ausblenden.

### FR-003: Metadata Inception (Title Sync)
- **Logik**: Da Native Print keine binren Metadaten setzen kann, MUST das System das `document.title` Attribut vor dem Aufruf von `print()` auf den Betreff setzen. Browser nutzen den Seitentitel standardmig als Dateinamen beim "Speichern als PDF".

### FR-004: DNA-Marker Inclusion
- **Logik**: Der DNA-Marker (SPEC-035) MUST im Print-Layout enthalten sein (unsichtbar), um die Durchsuchbarkeit der erzeugten PDF-Datei zu garantieren.

## Success Criteria *(mandatory)*
- **SC-001**: **Zero Deviation**: Der Brief im Editor und das PDF sind auf den Mikrometer identisch.
- **SC-002**: **No Bloat**: Keine externe PDF-Library belastet das Projektbundle.

---

# ??? High-Fidelity Hardening Addendum (from Smashing Magazine)

- **FR-005: @page Physical Boundary**: Das System MUST das `@page` Rule-Set nutzen, um das physikalische Blatt (A4) vom Content-Layer zu isolieren.
- **FR-006: Color Fidelity Guarantee**: NEO MUST `print-color-adjust: exact !important` setzen, damit Logos und farbige Elemente (SPEC-046) im PDF niemals verblassen.
- **FR-007: Atomic Zone Break Protection**: Die Zonen Anschrift, Betreff und Signatur MUST mit `break-inside: avoid` markiert werden, um einen Seitenumbruch innerhalb dieser kritischen Blcke zu verhindern.
- **Rationale**: Stellt sicher, dass das PDF nicht nur wie der Editor aussieht, sondern auch auf jedem physischen Drucker weltweit die exakt gleichen Ergebnisse liefert.

---

## File: specs/044-form-toggle/spec.md
---
id: SPEC-044
title: Form A/B Dynamic Toggle
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Form A/B Dynamic Toggle


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-TOGGLE]`
- **Principle Check**: **V. USER SOVEREIGNTY**: Immediate feedback on layout change.
- **Visual Goal**: Clear distinction between Form A (27mm) and Form B (45mm).

---

## ?? Requirements *(mandatory)*

### FR-001: The Sliding Toggle (Schiebeschalter)
- **Was**: Die Auswahl zwischen Form A und B erfolgt nicht ber Radio-Buttons, sondern ber einen modernen, visuellen Schiebeschalter.
- **UI Design**: 
    - Links: Label "Form A"
    - Rechts: Label "Form B"
    - Ein aktiver "Slider" (Daumen), der sanft zwischen beiden Positionen gleitet.
- **Feedback**: Der aktive Zustand MUST durch eine Primrfarbe (z.B. Blau) und Fettschrift des entsprechenden Labels deutlich hervorgehoben werden.

### FR-002: Dynamic Layout Transition
- **Logik**: Bei Betaetigung des Schalters MUST das System alle physikalischen Koordinaten (CMA) instantan anpassen.
- **Visuals**: Das "Papier" im Editor soll die Verschiebung des Anschriftfelds und des Informationsblocks visuell (ggf. mit einer minimalen Animation) widerspiegeln.

### FR-003: Persistence
- **Logik**: Die gewaehlte Form (A oder B) MUST im `localStorage` gespeichert werden, damit beim nchsten Start die bevorzugte Vorlage geladen wird.

## Success Criteria *(mandatory)*
- **SC-001**: **Clarity**: Ein Nutzer erkennt in < 200ms auf den ersten Blick, welche Form (A oder B) gerade aktiv ist.
- **SC-002**: **Aviation Accuracy**: Die Umschaltung landet auf beiden Seiten exakt auf den Mikrometer-Werten der SVG-Referenz (27mm vs 45mm).

---

# ?? Synchronous Layout Logic Addendum (from CSS-First)

- **FR-004: CSS-Variable Layout Control**: Das gesamte Layout (Anschrift + Faltmarken) MUST ber zentrale CSS-Variablen auf dem Root-Element (`<body>` oder `.paper`) gesteuert werden.
    - Form A: `--header-height: 27mm; --fold-1: 87mm; --fold-2: 192mm;` 
    - Form B: `--header-height: 45mm; --fold-1: 105mm; --fold-2: 210mm;` 
- **FR-005: Atomic Switch**: Ein einziger Attribut-Wechsel am Body (`data-form="A"`) MUST durch Kaskadierung alle abhngigen Elemente (Anschriftfeld, Informationsblock, SVG-Faltmarken) simultan und perfekt synchron verschieben.
- **FR-006: SVG-Anchoring**: Die Faltmarken (SPEC-002) MUST via `top: var(--fold-1)` absolut zum Blatt positioniert werden, damit sie immer im perfekten DIN-Verhltnis zum Rest des Briefes bleiben.
- **FR-007: Mandatory Synchronicity**: Das System MUST garantieren, dass die CSS-Variable `--header-height` sowohl die `top`-Eigenschaft des Anschriftfeldes als auch die relative Position der Faltmarken steuert. Ein "Auseinanderdriften" dieser Elemente ist technisch unmglich.

- **?? JS-ELIMINATION**: Das manuelle Verschieben von DOM-Elementen via JavaScript-Styles ist fr den Layout-Wechsel VERBOTEN. Alles erfolgt rein ber CSS-Kaskadierung und Variablen-Switch am Root-Element.

---

## File: specs/045-rich-metadata/spec.md
---
id: SPEC-045
title: Rich Metadata & vCard QR
tags: [specification, din-5008, platin]
status: cemented
weight: 75
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Rich Metadata & vCard QR


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-RICHMETA]`
- **Requirement**: Erweiterung der Profildaten um rechtliche Pflichtangaben und digitale Kontaktwege.
- **Rationale**: Ein "Platinum" Brief-Generator muss auch die Anforderungen an Geschftsbriefe ( 80 AktG,  35a GmbHG) perfekt abbilden.

---

## ?? Requirements *(mandatory)*

### FR-001: The vCard QR-Generator
- **Was**: Ein optionaler QR-Code im Brief (z.B. im Infoblock oder Fu), der die Kontaktdaten des Absenders im vCard-Format (RFC 6350) enthlt.
- **Logik**: Das System MUST das JSON-Profil des Absenders automatisch in eine vCard-String wandeln und daraus ein SVG-QR-Code generieren.
- **Nutzen**: Der Empfnger scannt den Brief und hat sofort alle Kontaktdaten im Handy.

### FR-002: Legal Footer Grid (3-Column)
- **Was**: Ein hochgradig strukturiertes Raster fr den Fuzeilenbereich.
- **Zusammensetzung**: Das System MUST folgende Datenfelder im Fu untersttzen:
    - **Reihe 1**: Postanschrift | Steuer-Daten (St.-Nr., USt-IdNr.) | Register-Daten (Amtsgericht, HRB).
    - **Reihe 2**: Bankverbindungen | Geschftsfhrung / Vorstand | Sitz der Gesellschaft.
- **Styling**: Strikte Einhaltung der **Zero-Scroll Policy** durch Nutzung von Mikrotipografie (7pt - 8pt) im Fu.

### FR-003: Social & Digital Identifiers
- **Was**: Felder fr LinkedIn, GitHub, Website.
- **Visuals**: Optionale Nutzung von dezenten Icons (SPEC-002 SVG Spirit) zur Kennzeichnung dieser Felder im Infoblock.

## Success Criteria *(mandatory)*
- **SC-001**: **Legal Compliance**: Alle notwendigen Pflichtangaben fr eine GmbH oder AG knnen ohne Layout-Bruch im Fu untergebracht werden.
- **SC-002**: **QR-Scanability**: Der generierte QR-Code ist bei einer Druckgre von min. 15mm x 15mm mit Standard-Smartphones lesbar.

---

## File: specs/046-digital-postage/spec.md
---
id: SPEC-046
title: Digital Postage Overlay (Internetmarke)
tags: [specification, din-5008, platin]
status: cemented
weight: 70
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Digital Postage Overlay (Internetmarke)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-POSTAGE]`
- **Requirement**: Integration eines Asset-Layers fr digitale Briefmarken innerhalb der Vermerkzone.
- **Rationale**: Ermglicht den Direktdruck von frankierten Briefen fr Fensterumschlge.

---

## ?? Requirements *(mandatory)*

### FR-001: Postage Dropzone (Anschriftfeld)
- **Was**: Ein dedizierter Bereich innerhalb der **Zusatz- und Vermerkzone** (obere 17,7 mm des 45x85mm Fensters).
- **Position**: Die Marke MUST rechtsbndig innerhalb dieser Zone platziert werden, um nicht mit der Rcksendezeile (linksbndig) zu kollidieren.

### FR-002: Asset Upload & Transformation
- **Was**: Upload-Funktion fr Internetmarken-Dateien (PDF oder PNG).
- **Logik**: Das System MUST den DataMatrix-Code und den Preis-Block aus dem Asset extrahieren oder das Asset passgenau skalieren und im definierten Bereich einblenden.

### FR-003: Integrated Address Mode (Kombidruck)
- **Was**: Untersttzung fr Internetmarken, die bereits die Empfngeradresse enthalten.
- **Logik**: Falls aktiv, MUST die normale Adress-Anzeige von NEO in der Anschriftzone ausgeblendet werden, um Dopplungen zu vermeiden.

### FR-004: Visual Guard
- **Was**: Warnung bei Grenberschreitung.
- **Logik**: Falls die hochgeladene Marke grer als 17,7 mm ist, MUST ein Toast ("Asset zu gro fr Fenster") ausgegeben werden.

## Success Criteria *(mandatory)*
- **SC-001**: **Post-Check**: Die gedruckte Internetmarke ist durch die Post-Scanner (DL-Fensterumschlag) lesbar.
- **SC-002**: **No Overlap**: Die Internetmarke verdeckt niemals die Rcksendeangabe (links).

---

# ??? Safety & API Addendum: The "Dead Man Switch"

- **FR-005: The Arming Switch (Sicherheitsschalter)**: 
    - Das System MUST einen expliziten Schalter "Frankierung scharf schalten" besitzen.
    - Nur wenn dieser Schalter aktiv ist, darf der Button "Marke kostenpflichtig erzeugen" eingeblendet werden.
- **FR-006: Double-Confirmation Flow**: Vor jedem API-Call zum Kauf einer Marke MUST ein Besttigungs-Dialog erscheinen: "Achtung: Es werden jetzt [Betrag]  von Ihrer Portokasse abgebucht. Fortfahren?"
- **FR-007: Visual Indicator (Armed State)**: Solange die Frankierung "scharf" ist, MUST ein aufflliger Warn-Rahmen oder ein Icon in der Sidebar erscheinen, um versehentliche Kufe beim normalen Test-Druck zu verhindern.
- **FR-008: Private Key Model**: Das System nutzt das "Aviation-Grade Privacy Model": Der Nutzer trgt seine *eigene* Client-ID und Secret in den NEO-Einstellungen ein. NEO agiert nur als lokaler Vermittler (keine zentrale Registrierung durch den Entwickler ntig).

---

## File: specs/047-flight-recorder/spec.md
---
id: SPEC-047
title: Expert Flight Recorder & Data View
tags: [expert-mode, performance, ai, logging]
status: draft
weight: 90
criticality: HIGH
created: 2026-03-20
traceability: [DIN-SYS-RECORDER]
---
# Feature Specification: Expert Flight Recorder & Data View


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-RECORDER]`
- **Requirement**: Implementierung eines Black-Box Loggers und eines Akinator-Style KI-Interface-Blueprints.

---

## ?? Requirements *(mandatory)*

### FR-001: The Black-Box Logger (Session-Storage)
- **Was**: Ein internes Log-System, das Systemereignisse, Fehler und Warnungen erfasst.
- **Persistence**: Die letzten 50 Log-Eintraege MUST im `sessionStorage` persistiert werden.

### FR-002: Performance Tracing & Chrome Console
- **Grouping**: Logs MUST via `console.groupCollapsed()` unter "DIN-BriefNEO Flight-Recorder" gebndelt werden.
- **Timing**: Nutzung von `performance.mark()` zur Messung von ZIP-Latency und API-Dauer.

### FR-003: Expert Console UI (Dashboard)
- **Trigger**: 5-facher Klick auf V-Tag.
- **Features**: Live-Logs, JSON-State-Viewer, Log-Export (CSV/TXT).

### FR-004: The AI-Interview Protocol (Akinator-Style)
- **Was**: Ein "KI-Blueprint Button" im Data-Editor.
- **Prompt Content**: Der kopierte Prompt MUST die KI (Claude/Gemini) anweisen, ein interaktives Interview-Verfahren mit dem Nutzer zu starten:
    - **Phase 1 (Absender)**: Abfrage/Vervollstndigung der Absenderdaten.
    - **Phase 2 (Empfnger)**: Abfrage der Empfngerdaten inklusive KI-basierter Validierung.
    - **Phase 3 (Inhalt)**: Erstellung des Brieftextes im Dialog.
    - **Phase 4 (Extraktion)**: Automatische Generierung eines einzeiligen, prgnanten Betreffs aus dem fertigen Text.
- **Final Output**: Die KI MUST am Ende das vollstndige JSON-Paket fr den Re-Import in NEO bereitstellen.

### FR-005: Instant Schema Validation
- **Logik**: Der Data-Editor MUST eingefgte JSON-Pakete in Echtzeit gegen das NEO-Schema validieren.

## Success Criteria *(mandatory)*
- **SC-001**: **The Blueprint Flow**: Ein Nutzer kann ohne Vorwissen durch den KI-Prompt einen vollstndigen, validierten Briefinhalt im Dialog erzeugen.
- **SC-002**: **Performance Visibility**: In den Chrome DevTools (Performance Tab) sind die NEO-Timing-Marken (ZIP/API) sichtbar.

---

# ?? Vanilla UI Hardening Addendum (from Awesome Tips)

- **FR-011: CSS-Only Console Toggle**: Die Sichtbarkeit der Expert-Konsole MUST bevorzugt via CSS `:target` gesteuert werden, um die JavaScript-Logik fr das UI-State-Management minimal zu halten.
- **FR-012: Selection Purity**: Die gesamte Expert-Konsole MUST `user-select: none` nutzen, damit Log-Texte beim Markieren des Briefes niemals versehentlich mitkopiert werden.

---

# ?? CSS-Only Modal Architecture (from Awesome CSS)

- **FR-013: Expert-Mode Modal via :target**: Das ffnen und Schlieen der Expert-Konsole MUST bevorzugt via CSS `:target` Pseudo-Klasse gesteuert werden.
    - **Trigger**: Der V-Tag Button (5-Klick) lst einen `window.locationhash = "#expert-console"` aus.
    - **Visibility**: Das CSS `.expert-console:target { display: block; visibility: visible; }` reagiert sofort.
    - **Benefit**: Keine JS-Status-Variablen fr "isModalOpen" ntig. Das UI reagiert rein auf die URL-URL-ID-Verschmelzung. Das ist unkaputtbar (robust).

---

# ?? Popover API Upgrade (Expert Console)

- **FR-014: Top-Layer Console**: Die Expert-Konsole MUST das native `popover` Attribut nutzen.
- **JS Elimination**: Die Steuerung der Sichtbarkeit via JavaScript (Toggle-Funktionen) ist ERSATZLOS GESTRICHEN. Das Erscheinen wird rein ber das `popovertarget` Attribut am V-Tag gesteuert.
- **Top Layer Guarantee**: Da die Konsole im "Top Layer" des Browsers gerendert wird, kann sie niemals durch das fixierte DIN-Blatt oder andere Container verdeckt werden.

---

## File: specs/048-din-lektor/spec.md
---
id: SPEC-048
title: Smart Typo Correction (DIN-Lektor)
tags: [specification, din-5008, platin]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Smart Typo Correction (DIN-Lektor)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-LEKTOR]`
- **Lexicon Check**: "Zustellungsempfnger", "Abkrzungs-Leerschritt", "Obsolet-Prfix".
- **Principle Check**: **V. USER SOVEREIGNTY**: Silent corrections MUST be revertible (Undo). Warnings are preferred for stylistic choices.

---

## ?? Requirements *(mandatory)*

### FR-001: Missing Space Correction (Abkrzungs-Leerschritt)
- **Was**: Automatisches Einfgen von geschtzten Leerzeichen in DIN-typischen Abkrzungen.
- **Pattern**: 
    - `z.B.` -> `z. B.`
    - `u.a.` -> `u. a.`
    - `z.Hd.` -> `z. Hd.`
    - `i.A.` -> `i. A.`
- **Logik**: Das System MUST bei der Eingabe (on-blur oder nach Leerzeichen) das Muster erkennen und korrigieren.

### FR-002: Obsolete Prefix Stripping (Betreff-Reiniger)
- **Was**: Entfernung veralteter Begriffe vor dem eigentlichen Inhalt.
- **Pattern**: `Betreff:`, `Betr.:`, `Betr:` am Anfang der Betreffzeile.
- **Logik**: Das System MUST diese Prfixe automatisch entfernen, da sie laut DIN 5008 (seit 2011) obsolet sind. Die Betreffzeile wird stattdessen nur fett gedruckt.

### FR-003: Orthography Guard (Strae vs Strasse)
- **Was**: Sicherstellung der korrekten deutschen Rechtschreibung in Adressfeldern.
- **Pattern**: `Strasse` -> `Strae`.
- **Logik**: Falls das Land "Deutschland" oder "sterreich" ist, MUST das System den Nutzer per Toast warnen oder (je nach Guardrail-Einstellung SPEC-037) automatisch korrigieren.

### FR-004: Dual-Action Engine
- **Silent Mode**: Technische Korrekturen (Leerzeichen) erfolgen lautlos.
- **Toast Mode**: Stilistische oder inhaltliche Korrekturen (Prefix-Removal) lsen einen informativen Toast (SPEC-042) aus: "Hinweis: Das Wort Betreff ist laut DIN 5008 obsolet und wurde entfernt."

## Success Criteria *(mandatory)*
- **SC-001**: **No Amateur Look**: Ein mit NEO geschriebener Brief enthlt in 100% der Flle keine "z.B." (ohne Leerzeichen) Fehler mehr.
- **SC-002**: **Undo Integrity**: Jede automatische Korrektur kann durch STRG+Z sofort rckgngig gemacht werden.

---

## File: specs/049-paper-control-center/spec.md
---
id: SPEC-049
title: The Paper-First Control Center (Modal)
tags: [specification, ui, dialog, html5]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: The Paper-First Control Center (Modal)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-CONTROL]`
- **Anti-Pattern Check**: Verhindert das neue Anti-Pattern [ANTI-019] (Sidebar-Clutter).
- **Philosophy**: "What You See Is What You Get". Der Bildschirm gehrt zu 100% dem Papier. Alles andere ist Peripherie.

---

## ??? Requirements *(mandatory)*

### FR-001: The Omnipotent Dialog
- **Was**: Smtliche Einstellungen, die nicht direkt durch Tippen auf das Papier gelst werden knnen, MUST in einem zentralen, nativen HTML5 `<dialog>` Element (Modal) ausgelagert werden.
- **Inhalt des Modals**:
    - **Profil (SPEC-018)**: Eingabe von Absender, IBAN, Logo.
    - **APIs (SPEC-038)**: Eingabe und Validierung der privaten API-Keys.
    - **Layout (SPEC-044)**: Der Umschalter zwischen Form A und Form B.
    - **Aktionen**: Buttons fr "Drucken / PDF", "JSON Export", "Alles Lschen".

### FR-002: Native HTML5 Invoker (Zero-JS Open)
- **Logik**: Das ffnen des Modals (z.B. ber einen kleinen "Zahnrad"-Button am Bildschirmrand) MUST ber die modernsten HTML-Attribute (z.B. `popovertarget` oder die Invoker API) gesteuert werden, um den JS-Overhead zu minimieren.

### FR-003: Pure Paper View (Zero Peripheral Distraction)
- **Regel**: Wenn das Modal geschlossen ist, MUST der Bildschirm ausschlielich das 210x297mm groe DIN-Blatt (ggf. skaliert) und einen unaufflligen Zugangs-Button zum Control Center zeigen. Keine permanenten Sidebars, keine Menleisten.

## Success Criteria *(mandatory)*
- **SC-001**: **Absolute Immersion**: Der Nutzer hat das Gefhl, ein echtes Blatt Papier auf dem Schreibtisch liegen zu haben.
- **SC-002**: **No-Sidebar Guarantee**: Keine Sidebar nimmt dem Papier in der Breite Platz weg.

---

## File: specs/050-keyboard-shortcuts/spec.md
# Feature Specification: Aviation Command Center (Keyboard & Shortcuts)

**Feature Branch**: `050-keyboard-shortcuts`  
**Created**: 2026-03-20  
**Status**: Draft  
**Source**: Inspired by dypsilon/frontend-dev-bookmarks [PAT-KY-01]
**Weighting**: 80/100 | **Criticality**: HIGH (Efficiency)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-KEYBOARD]`
- **Requirement**: Implementierung einer konsistenten Tastatur-Steuerung.
- **Principle Check**: **IV. VANILLA PURITY**: Nutzung der nativen KeyboardEvent API.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Rationale**: Ein Profi-Editor muss "blind" bedienbar sein. Mauswege mssen minimiert werden.

---

## ??? Requirements *(mandatory)*

### FR-001: Standard DIN-Shortcuts
- **Was**: Untersttzung der gngigen Tastenkombinationen.
- **Zement**:
    - `STRG + S`: Trigger SPEC-030 (Portable HTML Export).
    - `STRG + P`: Trigger SPEC-011 (Pre-Flight Export Engine).
    - `STRG + Z / Y`: Undo / Redo Logik (SPEC-012).
    - `STRG + B / I / U`: Fett, Kursiv, Unterstrichen.

### FR-002: Seamless Zone Navigation (TAB)
- **Logik**: Die `TAB`-Taste MUST den Fokus in der logischen DIN-Reihenfolge verschieben:
    - Absender (falls auf Blatt) -> Empfnger -> Betreff -> Anrede -> Body -> Gruformel -> Anlagen.
- **Reverse**: `SHIFT + TAB` MUST die Reihenfolge umkehren.

### FR-003: Physical Layout Independence
- **Technik**: Das System MUST bei Shortcuts die `KeyboardEvent.code` API nutzen (z.B. `KeyS` statt `s`).
- **Warum**: Damit Shortcuts auch auf anderen Tastatur-Layouts (z.B. US/AZERTY) zuverlssig funktionieren.

### FR-004: Special Character Quick-Input
- **Was**: Erleichterte Eingabe von DIN-Sonderzeichen.
- **Logik**: NEO bietet Shortcuts fr:
    - `Mittelpunkt` (  ): Fr die Rcksendezeile (SPEC-006).
    - `Geschtztes Leerzeichen` (NBSP): Fr Einheiten und Abkrzungen.

## Success Criteria *(mandatory)*
- **SC-001**: **No-Mouse Challenge**: Ein versierter Nutzer kann einen vollstndigen Standard-Brief schreiben und als PDF speichern, ohne die Maus einmal zu berhren.
- **SC-002**: **Latency**: Die Reaktion auf einen Shortcut erfolgt in < 16ms (60fps Mandat).

---

## File: specs/051-content-integrity/spec.md
---
id: SPEC-051
title: Document Typography & Content Integrity
tags: [typography, printing, aviation-grade]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Document Typography & Content Integrity

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-TYPE-INTEGRITY]`
- **Requirement**: Schutz des Schriftbildes gegen logische Zerstrung beim Druck.
- **Rationale**: Ein professioneller Brief darf keine "verlorenen" Zeilen auf Folgeseiten haben.

---

## ??? Requirements *(mandatory)*

### FR-001: Widow & Orphan Guard
- **Was**: Schutz gegen einsame Zeilen am Seitenanfang oder -ende.
- **Logik**: Das System MUST via CSS (`widows: 3; orphans: 3;`) sicherstellen, dass mindestens 3 Zeilen eines Absatzes zusammengehalten werden.
- **Ziel**: Vermeidung von unschnen "Witwen" (einsame Zeile am Seitenanfang) und "Waisen" (einsame Zeile am Seitenende).

### FR-002: Print Link Expansion
- **Was**: Sichtbarkeit von URLs in gedruckten Dokumenten.
- **Logik**: Im Druckmodus MUST das System hinter jedem Link im Brieftext automatisch die Ziel-URL in Klammern einblenden.
- **CSS**: `a::after { content: " (" attr(href) ")"; font-size: 0.9em; }`
- **Ausnahme**: Interne Links (Anker) sind von dieser Regel ausgeschlossen.

### FR-003: Heading-Text Bonding
- **Was**: Verbot von berschriften am Seitenende.
- **Logik**: Das System MUST `break-after: avoid` auf Betreffzeilen und Zwischenberschriften anwenden, damit diese niemals ohne nachfolgenden Text am Ende einer Seite stehen.

## Success Criteria *(mandatory)*
- **SC-001**: **Visual Flow**: In 100% der Testflle mit Seitenumbrchen bleiben logische Sinneinheiten (Abstze) optisch zusammenhngend.
- **SC-002**: **Functional Print**: Ein Leser des physischen Briefes kann jede verlinkte Webseite manuell ber die aufgedruckte URL aufrufen.

---

# ?? Document Factory Hardening Addendum (from WeasyPrint)

- **FR-004: Native Hyphenation**: Das System MUST `hyphens: auto` in Verbindung mit dem korrekten `lang` Attribut (z.B. `lang="de"`) nutzen.
- **FR-005: Advanced Justification**: Flietext MUST mit `text-align: justify` und `text-justify: inter-word` formatiert werden, um ein ruhiges, gedrucktes Schriftbild ohne "Lcher" zu erzeugen.
- **FR-006: Dynamic Page Counters**: Die Paginierung ("Seite X von Y") MUST bevorzugt via CSS Generated Content (`content: counter(page) " von " counter(pages)`) berechnet werden.
- **Rationale**: Diese Techniken heben das Schriftbild von einer "Webseite" auf das Niveau einer professionellen "Dokumenten-Fabrik".

---

## File: specs/052-signal-architecture/spec.md
---
id: SPEC-052
title: Aviation Signal & Event Architecture
tags: [architecture, events, signals, platin]
status: cemented
weight: 60
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Aviation Signal Architecture


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-SIG]`
- **Requirement**: Ein deterministisches, entkoppeltes Kommunikationssystem zwischen State und UI.
- **Rationale**: Direkte DOM-Manipulationen fhren zu "Spaghetti-Code". Signale garantieren Vorhersehbarkeit.

---

## ??? Requirements *(mandatory)*

### FR-001: Custom Event Prefixing
- **Was**: Alle internen Events MUST mit `din:` geprfxt sein.
- **Zement**: `din:state-update`, `din:ui-reset`, `din:print-start`.

### FR-002: Event Delegation Authority
- **Was**: Es gibt nur EINEN zentralen Listener auf dem `#brief-container`.
- **Logik**: Nutzung von `.closest('[data-field]')` zur Identifizierung der Quelle. Keine fragmentierten Listener auf Einzel-Inputs [ANTI-021].

### FR-003: Atomic Abort Protocol
- **Zement**: Jeder dynamisch hinzugefgte Listener MUST einen `AbortController` nutzen. Cleanup erfolgt atomar beim Modul-Unload.

## Success Criteria *(mandatory)*
- **SC-001**: **Zero Ghost Listeners**: Nach einem UI-Reset sind keine alten Event-Listener im Memory Profiler sichtbar.

---

## File: specs/053-accessibility/spec.md
---
id: SPEC-053
title: Aviation Accessibility
tags: [a11y, screenreader, aria, platin]
status: cemented
weight: 70
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Aviation Accessibility

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-A11Y]`
- **Requirement**: Sicherstellung der Bedienbarkeit fr Menschen mit Einschrnkungen.
- **Rationale**: Ein professionelles Werkzeug muss inklusiv sein.

---

## ??? Requirements *(mandatory)*

### FR-001: Semantic ARIA Landmarks
- **Was**: Jede DIN-Zone MUST fr Screenreader identifizierbar sein.
- **Zement**: 
    - `<anschriftzone>` bekommt `role="region"` und `aria-label="Anschriftenfeld"`.
    - `<informationsblock>` bekommt `aria-label="Zusatzinformationen und Datum"`.

### FR-002: Focus Management
- **Logik**: Der Fokus-Ring (Visual Focus) MUST im Expert-Mode (SPEC-047) und Normal-Mode deutlich sichtbar sein (Aviation-Blue).

### FR-003: Contrast Guarantee
- **Zement**: Alle UI-Elemente (Sidebar, Buttons) MUST ein Kontrastverhltnis von mindestens 4.5:1 (WCAG AA) zum Hintergrund aufweisen.

## Success Criteria *(mandatory)*
- **SC-001**: **Lighthouse A11y**: Die App erreicht im Lighthouse-Audit Bereich "Accessibility" einen Score von 100.

---

## File: specs/054-security-hardening/spec.md
---
id: SPEC-054
title: Security Hardening (CSP & SRI)
tags: [security, hardening, aviation-grade]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Security Hardening

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-SEC]`
- **Requirement**: Maximale Abschottung gegen XSS und Code-Injection.
- **Rationale**: Ein Tool, das persnliche Daten verarbeitet, darf keine Sicherheitslcken haben.

---

## ??? Requirements *(mandatory)*

### FR-001: Strict Content Security Policy (CSP)
- **Was**: Implementierung einer CSP via `<meta>` Tag.
- **Logik**: `script-src 'self'` und `style-src 'self'`. Externe Skripte sind STRENG VERBOTEN (Aviation Standard).
- **Ausnahme**: Explizit erlaubte Domains fr Tier-2/3 APIs (SPEC-038).

### FR-002: Subresource Integrity (SRI)
- **Logik**: Falls ausnahmsweise ein externes Asset (z.B. ein spezialisierter Font) geladen wird, MUST ein Hash-Check (SRI) erfolgen.

### FR-003: Sandbox Isolation
- **Was**: Schutz des Haupt-DOMs vor Einflssen aus den API-Modulen.

## Success Criteria *(mandatory)*
- **SC-001**: **Pentest Pass**: Keine automatisierte Sicherheits-Prfung (z.B. OWASP ZAP) findet kritische Lcken in der Frontend-Architektur.

---

## File: specs/055-typo-hardening/spec.md
---
id: SPEC-055
title: Aviation Typography Hardening
tags: [typography, aesthetics, platin]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Aviation Typography Hardening

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-TYPE-HARDEN]`
- **Requirement**: Implementierung von High-End Typografie-Standards.
- **Rationale**: Ein professioneller Brief muss ein perfektes, lckenloses Schriftbild aufweisen.

---

## ??? Requirements *(mandatory)*

### FR-001: Language-Aware Hyphenation
- **Was**: Automatische Silbentrennung basierend auf der Sprache.
- **Zement**: Das Root-Element MUST `lang="de"` (oder die gewhlte Sprache) tragen.
- **CSS**: Der Brieftext MUST `hyphens: auto` nutzen, um "Lcher" im Textfluss bei schmalen Spalten zu vermeiden.

### FR-002: Optimized Justification (Blocksatz)
- **Was**: Harmonisierung von Wortabstnden im Blocksatz.
- **Logik**: Das System MUST `text-align: justify` in Kombination mit `text-justify: inter-word` nutzen.
- **Ziel**: Vermeidung von "weien Straen" (zu groen Lcken zwischen Wrtern).

### FR-003: Optical Margin Alignment
- **Logik**: Das System MUST sicherstellen, dass Satzzeichen am rechten Rand (Punkte, Kommata) leicht in den Rand ragen drfen (Optical Kerning), um eine gerade visuelle Linie zu erzeugen.

## Success Criteria *(mandatory)*
- **SC-001**: **Text Harmony**: Der Grauwert des Textes ist ber die gesamte Seite hinweg gleichmig. Keine aufflligen Lcken durch fehlende Silbentrennung.

---

## File: plans/047-flight-recorder/plan.md
---
id: PLAN-047
spec: BRAIN-047-SPEC
title: Implementation Plan: Flight Recorder Runtime (Black Box Decoder)
status: cemented
anti-patterns: [ANTI-025]
adr: [ADR-003, ADR-006]
---

# PLAN-047: Flight Recorder Runtime (Black Box Decoder)

## I. Summary
Implementierung des `FlightRecorder` Moduls zur Erfassung deterministischer Telemetriedaten (CMA-Sensordaten, IMR-Status, Time-Stamping via Temporal API).

## II. Module Definition (js/logic/flight-recorder.js)
Einführung der Sensoren zur Messung physischer DIN-Verste.

```javascript
import { IMR } from '../core/constants.js';

export const FlightRecorder = {
  /**
   * Misst physische Abweichungen der IMR-Zonen vom DIN-Standard.
   */
  measureCMA: () => {
    return IMR.map(entry => {
      const el = document.querySelector(entry.tag);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      // ... Konvertierung in mm via CMA_COORD_RATIO
      return { tag: entry.tag, height_px: rect.height };
    }).filter(Boolean);
  },

  /**
   * Generiert die vollstndige Payload fr den Black Box Decoder.
   */
  record: (errorType = 'MANUAL_TRIGGER', message = '') => {
    return {
      header: {
        app: "DIN-BriefNEO Platinum",
        version: "16.0.0",
        timestamp: Temporal.Now.instant().toString(),
        incident_id: crypto.randomUUID()
      },
      context: { error_type: errorType, error_message: message },
      telemetry: {
        cma_sensor: FlightRecorder.measureCMA(),
        imr_keys: Object.keys(readDOMasJSON())
      }
    };
  }
};
```

## III. UI-Integration (js/ui/ui.js)
Anbindung an den **Akinator-Export-Button**. Wenn das System einen `CMA_VIOLATION` (z.B. Text luft ber) via `scroll-state` Query (CSS) erkennt, wird dies in der Payload markiert.

## IV. Validation
- **Check**: `Temporal.Now.instant()` liefert gltigen ISO-String.
- **Check**: `crypto.randomUUID()` verfgbar (Chrome 147 Baseline).

---

## File: plans/066-markdown-ghosting/plan.md
---
id: PLAN-066
spec: SPEC-066
title: Implementation Plan: Markdown-Shredder V2 (Zero-Width Ghosting)
status: cemented
anti-patterns: [ANTI-023, ANTI-025, TOMB-LEGACY-053, TOMB-LEGACY-054]
adr: [ADR-008, ADR-011]
---

# PLAN-066: Markdown-Shredder V2 (Zero-Width Ghosting)

## I. Summary
Implementierung des non-destruktiven Markdown-Parsers mit Zero-Width-Ghosting. Steuerzeichen werden im `Ghost-Mirror` erhalten, aber fr das Layout "gewichtslos" gemacht.

## II. CSS-Spezifikation (@layer din.core)
Um die physikalische Integritt bei jeder Schriftgre (10pt - 12pt) zu neutralisieren, wird ein relativer negativer Margin genutzt.

```css
@layer din.core {
  .md-marker {
    display: inline-block;
    width: 0;
    white-space: nowrap;
    overflow: visible;
    opacity: 0.35;
    user-select: none;
    pointer-events: none;
    color: var(--color-guide);
    font-weight: normal;
    font-style: normal;
    /* Kerning-Neutralisierung: -1 Zeichenbreite */
    margin-right: -1ch;
    /* Vertikaler Ausgleich fr optische Zentrierung */
    vertical-align: baseline;
  }

  /* Fokus-Intelligenz: Marker nur im aktiven Feld zeigen */
  din-body:not(:focus-within) .md-marker {
    display: none;
  }
}
```

## III. Implementation: logic.js
Anpassung von `parseMarkdownToHTML` an die **Cascading Priority Cascade**.

```javascript
export function parseMarkdownToHTML(text) {
  if (!text) return '';
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let h = esc(text);

  // 1. Triple-Markers (Fett-Kursiv)
  h = h.replace(/(\*\*\*|___)(.*?)\1/g, 
    '<strong class="md-bold"><em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em></strong>');

  // 2. Double-Markers (Fett / Strike)
  h = h.replace(/(\*\*|__)(.*?)\1/g, 
    '<strong class="md-bold"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></strong>');
  h = h.replace(/(~~)(.*?)\1/g, 
    '<del class="md-del"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></del>');

  // 3. Single-Markers (Kursiv / Code)
  h = h.replace(/(\*|_)(.*?)\1/g, 
    '<em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em>');
  h = h.replace(/(`)(.*?)\1/g, 
    '<code class="md-code"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></code>');

  return h.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
}
```

## IV. Validation
- **Check**: `din-body-mirror.textContent.length === editContext.text.length`? (PASS)
- **Check**: Zeilenumbruch mit/ohne `**` identisch? (PASS via `width: 0`)

---

## File: plans/065-platinum-integrity/plan.md
---
id: PLAN-065
spec: SPEC-053
title: Aviation Grade Platinum Integrity — EditContext & A11y
status: draft
anti-patterns: [ANTI-023, ANTI-025]
adr: [ADR-008, ADR-011]
---

# Implementation Plan: PLAN-065 — Platinum Integrity

## Summary
Hrtung des DIN-BriefNEO Systems durch Einfhrung der **EditContext API** fr den Haupttextbereich (`din-body`) und Implementierung von **A11y Skip-Links**. Ziel ist die vollstndige Entkoppelung von Eingabemodell und Darstellung bei gleichzeitiger Maximierung der Barrierefreiheit fr Screenreader und Keyboard-Nutzer.

## Technical Context
**Language/Version**: HTML5, CSS3 (Chrome 147 Baseline), Vanilla JS (ES2026)
**Primary APIs**: EditContext API (Chrome 121+), Sanitizer API (Chrome 147+), Popover API
**Storage**: LocalStorage (State Persistence via StateManager)
**Target Platform**: Chrome 147+ (Aviation Grade Platinum)
**Project Type**: Web Application (Static Frontend)
**Performance Goals**: < 16ms Input Latency (60fps Mirror Sync)
**Constraints**: Zero pixel shift, Zero innerHTML injection

## Constitution Check

- [x] **MANDATE-INJ**: Zero innerHTML? (Nutzung von `setHTML()` mit Sanitizer fr Ghost-Mirror)
- [x] **MANDATE-FREEZE**: Visual Freeze garantiert? (Absolute Positionierung via CMA bleibt erhalten)
- [x] **MANDATE-VEC**: Vector-only export? (Native Print Engine bleibt SSoT)
- [x] **MANDATE-NAT**: Native-first? (EditContext + Sanitizer statt Framework-Hacks)
- [x] **MANDATE-PLN**: Plaintext-only? (EditContext liefert reinen String, Mirror rendert nur visuell)
- [x] **IMR-Sync**: Plan folgt der Isomorphic Master Registry (Tag=Key)
- [x] **NO-JS Doctrine**: JS auf Input-Mapping und Sanitizer-Sync beschrnkt
- [x] **AGENT SAFETY**: Chirurigscher Patch von `index.html` und `ui.js`

### Security Architect Review (BMAD Phase)

> **Architect Critique:**
> Der bergang zu `EditContext` ist der finale Schritt zur Eliminierung von `contenteditable`-Artefakten (div/br-Suppe). Da `EditContext` kein visuelles Feedback gibt, ist die Synchronisation mit dem Ghost-Mirror (Sanitizer-gesttzt) nun die *einzige* visuelle Wahrheit. Ein Ausfall des JS-Syncs fhrt zum "Blind-Typing". 
> **Gegenmanahme**: Ein Fail-Safe CSS-Fallback fr `din-body` (Sichtbarkeit des textContent) muss fr den Debug-Fall erhalten bleiben.
> **A11y**: Skip-Links mssen zwingend vor der Sidebar liegen, um WCAG 2.4.1 (Bypass Blocks) zu erfllen.

## Project Structure

### Documentation (this feature)
```text
plans/065-platinum-integrity/
├── plan.md              # This file
└── research.md          # EditContext Selection & IMI Handling
```

### Source Code Changes
```text
index.html               # Injection of Skip-Links & EditContext Attribute
js/ui/ui.js              # Initialization of EditContext for <din-body>
js/logic/logic.js        # Refined Sanitizer logic for EditContext text updates
css/din5008-paper.css    # A11y Skip-Link Styling & EditContext Focus-Ring
```

## Implementation Steps

### Phase 1: A11y Baseline
1.  Injektion von Skip-Links (`#skip-to-paper`, `#skip-to-sidebar`) in `index.html`.
2.  Styling der Skip-Links (visuell verborgen bis Fokus).
3.  Erweiterung der ARIA-Landmarks gem `SPEC-053`.

### Phase 2: EditContext Core
1.  Initialisierung der `EditContext` Instanz fr `din-body`.
2.  Binding der `textupdate` und `selectionchange` Events.
3.  Synchronisation des `EditContext`-Textes mit dem IMR-State.
4.  Anpassung des `Ghost-Mirror` Syncs an das neue Event-Modell.

### Phase 3: Sanitizer Hardening
1.  Verschiebung der Sanitizer-Konfiguration in eine globale Konstante.
2.  Implementierung eines strikten Schemas (Whitelisting von `strong`, `em`, `blockquote`).

## Success Criteria
- [ ] Skip-Links sind mit `Tab` erreichbar und funktional.
- [ ] Texteingabe in `din-body` erfolgt via `EditContext`.
- [ ] Keine `<div>` oder `<br>` Tags im IMR-JSON (reiner Plaintext).
- [ ] Screenreader liest den Text whrend der Eingabe korrekt vor.

---

## File: plans/002-salutation-engine/plan.md
---
id: PLAN-002
spec: SPEC-002
title: Technischer Plan  Salutation Engine (HTML/CSS Hybrid)
status: active
created: 2026-03-20
version: 1.0.0
anti-patterns: [ANTI-025]
adr: ADR-003 (No-JS Doctrine)
---

# Technical Plan: Salutation Engine (HTML/CSS Hybrid)

## Constitution Check

| Gate             | Anforderung                  | Status                              |
|------------------|------------------------------|-------------------------------------|
| NO-JS DOCTRINE   | Layout via CSS, nicht JS     | OK  CSS data-Attribut-Selektor     |
| VANILLA PURITY   | Kein Framework               | OK  Semantisches HTML + CSS        |
| USER-001         | Manuelle Override geschuetzt | OK  data-auto Flag                 |
| ANTI-025 Guard   | Keine JS-String-Generierung  | OK  JS nur fuer Fachlogik-Matrix   |

---

## Hybrid-Architektur: Was bleibt JS, was wird HTML/CSS

```
+------------------------------------------+
| JS (Fachlogik  bleibt):                 |
|   parseRecipient()   gender, name, title|
|   deriveSalutation()  finaler String    |
|   deriveGreeting()   Grussformel        |
|   SALUTATION_MATRIX (3x4 Tabelle)        |
+------------------------------------------+
| HTML (Semantik  neu):                   |
|   data-field="salutation"                |
|   data-gender="m|f|fam|n"               |
|   data-auto="true|false"                 |
|   data-formality="formal|polite|casual"  |
+------------------------------------------+
| CSS (Anzeige  neu):                     |
|   :empty::before { content: attr(...) }  |
|   [data-gender="m"]:empty::before {...}  |
|   [aria-invalid] Validierung             |
+------------------------------------------+
```

---

## Implementierung

### 1. HTML-Struktur fuer das Anredefeld

```html
<!-- Anredefeld: JS schreibt NUR Attribute, CSS rendert Placeholder -->
<div
  id="f-salut"
  data-field="salutation"
  data-gender="n"
  data-auto="true"
  data-placeholder="Sehr geehrte Damen und Herren,"
  data-formality="formal"
  contenteditable="true"
  aria-label="Anrede"
  spellcheck="true">
</div>

<!-- Grussformel mit Punctuation-Guard -->
<div
  id="f-greeting"
  data-field="greeting"
  contenteditable="true"
  aria-label="Grussformel">
</div>

<!-- Unterschriften-Abstand: DIN-Pflichtmass (FR-009) -->
<div class="signature-gap" aria-hidden="true"></div>

<div
  id="f-sig-name"
  data-field="signature-name"
  contenteditable="true"
  aria-label="Unterschrift (maschinenschriftlich)">
</div>
```

### 2. CSS: Placeholder via data-Attribut (kein JS fuer leere Felder)

```css
/* In @layer project.overrides */

/* Universeller Placeholder via CSS attr() */
[data-field="salutation"]:empty::before {
  content: attr(data-placeholder);
  color: var(--color-guide);
  pointer-events: none;
}

/* Gender-spezifische Placeholder als Vorschau */
[data-field="salutation"][data-gender="m"]:empty::before {
  content: "Sehr geehrter Herr \2026";
}
[data-field="salutation"][data-gender="f"]:empty::before {
  content: "Sehr geehrte Frau \2026";
}
[data-field="salutation"][data-gender="fam"]:empty::before {
  content: "Sehr geehrte Familie \2026";
}
[data-field="salutation"][data-gender="n"]:empty::before {
  content: "Sehr geehrte Damen und Herren,";
}

/* FR-009: Unterschriften-Abstand (12.7mm = 3 Leerzeilen DIN) */
.signature-gap {
  height: 12.7mm;
  display: block;
}
```

### 3. Punctuation Guard (FR-008)  CSS + minimales JS

```css
/* CSS zeigt Warnung wenn aria-invalid gesetzt */
[data-field="greeting"][aria-invalid="true"] {
  outline: 2px solid var(--color-error);
  outline-offset: 1px;
}
[data-field="greeting"][aria-invalid="true"]::after {
  content: "  Kein Satzzeichen am Ende (DIN 5008)";
  color: var(--color-error);
  font-size: 0.75em;
}
```

```javascript
// Minimal-JS: Nur Attribut-Setter, kein DOM-Text-Schreiben
function checkGreetingPunctuation(el) {
  const text = el.textContent.trim();
  const hasBadEnd = /[,\.]$/.test(text);
  el.setAttribute('aria-invalid', hasBadEnd ? 'true' : 'false');
}
// Event: nur 1 Listener via Event Delegation am #paper (ANTI-021)
```

### 4. JS-Seite: Reduzierter updateSalutationHint()

```javascript
// Vorher: 30 Zeilen, schreibt HTML in DOM
// Nachher: 8 Zeilen, schreibt nur Attribute

function updateSalutationHint(analysis, formality, recipientType) {
  const el = document.getElementById('f-salut');
  if (!el || el.dataset.auto === 'false') return; // FR-004: Override-Schutz

  const sal = deriveSalutation(analysis, formality, recipientType);
  el.dataset.gender    = analysis.gender;
  el.dataset.formality = formality;
  el.dataset.placeholder = sal;

  // Nur in leeres/auto-Feld schreiben
  if (!el.textContent.trim()) {
    el.textContent = sal;
  }
}
```

---

## Cemetery-Eintraege (was geloescht wird)

Aus `js/ui/ui.js`:
```
_bindSettings() Radio-Sync          onchange am HTML-Element (1 Zeile)
_applySidebarState() (20 Zeilen)    HTML checked-Attribut ist SSoT
_applyLayout() (35 Zeilen)          CSS @layer project.overrides
_bindEditorToolbar() show/hide      CSS :has(:focus-within) (4 Zeilen)
Dialog-close EventListener (20L)    Popover API popovertarget
```

Aus `js/core/state.js`:
```
state.config (gesamter Zweig)       #paper.dataset.* (5 Attribute)
_makeProxy() fuer config            entfaellt komplett
```

Aus `js/logic/logic.js` (Regex  HTML5 pattern):
```
Telefon-Validierungs-Regex          <input type="tel" pattern="...">
E-Mail-Validierung                  <input type="email">
PLZ-Validierung                     <input pattern="[0-9]{5}" maxlength="5">
Datum-Format-Check                  <input pattern="\d{2}\.\d{2}\.\d{4}">
```

---

## File: plans/007-cma/plan.md
---
id: PLAN-007
spec: SPEC-007
title: Technischer Plan  Central Measurement Authority (CMA)
status: active
created: 2026-03-20
version: 1.0.0
anti-patterns: [ANTI-001, ANTI-005, ANTI-014, ANTI-018, ANTI-023, ANTI-024]
pico-decision: SELECTIVE-EXTRACT (kein Full-Framework, ADR-001)
---

# Technical Plan: Central Measurement Authority (CMA)

## Constitution Check

| Gate            | Anforderung              | Status                           |
|-----------------|--------------------------|----------------------------------|
| VANILLA PURITY  | Kein Framework           | OK  Pure JS + CSS Custom Props  |
| VISUAL FREEZE   | CSS immutable            | OK  CMA ist einzige Schreibstelle |
| OFFLINE         | file:// tauglich         | OK  Keine externen Abhaengigkeiten |
| ANTI-001 Guard  | Kein relatives Positioning | OK  CMA liefert absolute Werte  |
| ANTI-014 Guard  | Kein Layout Thrashing    | OK  Einmaliger Batch-Write      |

---

## Architektur: Drei-Schichten-CMA

```
+------------------------------------------+
|  Layer 1: JS Constants  (Primaerquelle)  |  js/core/constants.js
|  Reine Zahlen, kein DOM-Kontakt          |
+------------------------------------------+
|  Layer 2: CSS Bridge    (Styling-Bruecke)|  js/core/cma-bridge.js
|  Injiziert JS-Werte als CSS Variables    |
+------------------------------------------+
|  Layer 3: CSS Fallback  (Static Safety)  |  css/din5008-paper.css
|  Hardcoded Fallbacks fuer file:// Modus  |
+------------------------------------------+
```

## Hardening: Magic Number Guard (FR-005)

Konvention fuer Code Reviews  jede direkt gesetzte Dimension ist ein Alarm:

```
// KORREKT:
element.style.top = `${CMA.INFO_BLOCK_TOP}mm`;

// VERBOTEN  ANTI-PATTERN-ALARM (Magic Number):
element.style.top = '97.4mm';
element.style.top = '97mm';  // Drift!
```

Pre-commit Regex (optional, fuer spaetere CI-Integration):
```
/style\s*\.\s*\w+\s*=\s*`\d+(\.\d+)?(mm|pt|px)/
```
Trifft jede direkt gesetzte Dimension und loest manuelle Review aus.

---

## Pico CSS Audit  Architektur-Entscheidung (ADR-001)

**VERDICT: SELECTIVE EXTRACT  Vanilla Pure. Kein Full-Framework.**

Drei Pico-Konzepte werden als natives Vanilla CSS extrahiert:
- [PICO-EXTRACT-1] aria-invalid Validation States
- [PICO-EXTRACT-2] Natives <dialog> Styling (Paper Control Center)
- [PICO-EXTRACT-3] color-scheme fuer system-native Inputs

Implementiert in: css/din5008-paper.css (Abschnitt "Pico Extracts")

**Grund der Ablehnung von Full-Pico:**
- Pico-Reset kollidiert mit `body { display: flex }` Layout
- Pico kennt keine mm-Units  gesamtes Spacing-System ist rem-basiert
- ~30KB Overhead fuer Styles, die zu 80% mit !important ueberschrieben wuerden
- Pico ist fuer Websites  NEO ist ein Print-First WYSIWYG-Dokument

---

## File: plans/010-tag-isomorphism/plan.md
---
id: PLAN-010
spec: CAA-008
title: Tag-Isomorphismus  Semantische HTML-Revolution (IMR 2.0)
status: cemented
created: 2026-03-20
version: 1.0.0
anti-patterns: [ANTI-006, ANTI-025, ANTI-026]
adr: ADR-006, ADR-007
---

# Technical Plan: Tag-Isomorphismus (IMR 2.0)

## Architektur-Entscheidung (ADR-007)

Custom HTML-Tags (`<din-subject>` etc.) werden als unbekannte/autonome
Elemente eingesetzt  OHNE customElements.define().

WARUM: Browser behandeln unbekannte Tags als HTMLElement-Instanzen mit
display:inline. CSS-Tag-Selektoren funktionieren vollstaendig. JS kann via
querySelectorAll('din-*') scannen. Kein JS-Overhead fuer Registrierung.

TRADEOFF: display muss explizit gesetzt werden (din-subject { display: block; }).
Das ist kein Nachteil  wir setzen alle geometrischen Eigenschaften ohnehin
explizit via @layer din.core.

## Constitution Check

| Gate             | Anforderung              | Status                              |
|------------------|--------------------------|-------------------------------------|
| VANILLA PURITY   | Kein Framework           | OK  kein customElements.define()   |
| NO-JS DOCTRINE   | Layout via CSS           | OK  Tag-Selektoren in @layer       |
| VISUAL FREEZE    | CSS immutable            | OK  CMA-Variablen unveraendert     |
| ANTI-006 Guard   | Keine ID-basierte Logik  | OK  JS scannt Tags, nicht IDs      |
| ANTI-025 Guard   | Kein DOM-String-Schreiben| OK  nur textContent / dataset      |

## Was sich aendert

### HTML: div  din-* Tag
```
VORHER: <div id="f-subject" data-field="subject" contenteditable="true">
NACHHER: <din-subject contenteditable="plaintext-only">
```

Vorteil:
- Tag-Name IS der Feld-Key (ohne "din-" Praefix)
- data-field-Attribut entfaellt (redundant)
- ID entfaellt fuer Inhaltsfelder (UI-IDs wie #paper bleiben)
- contenteditable="plaintext-only" verhindert HTML-Injection [MANDATE-INJ]

AUSNAHME: din-body behaelt contenteditable="true" (formatierter Text erlaubt)
AUSNAHME: Container-Elemente (#paper, #anschriftzone) bleiben als div

### CSS: #id  tag-name Selektoren
```
VORHER: @layer din.core { #f-subject { top: var(--subject-top); } }
NACHHER: @layer din.core { din-subject { top: var(--subject-top); } }
```

### JS: getElementById  querySelector
```
VORHER: document.getElementById('f-subject')
NACHHER: document.querySelector('din-subject')
```

### readDOMasJSON(): automatisch via Tag-Scan
```javascript
// Statt IMR-Lookup: Tag-Name direkt  JSON-Key
document.querySelectorAll('[data-din]')  // oder din-* pattern
  .forEach(el => { key = el.tagName.slice(4).toLowerCase() })
```

## Vollstaendige Tag-Tabelle (IMR 2.0)

| Tag              | JSON-Key       | CMA-Variable     | plaintext-only? |
|------------------|----------------|------------------|-----------------|
| din-sender       | sender         | --sender-zone-top| ja              |
| din-note         | note           | --address-top    | ja              |
| din-recipient    | recipient      | --address-top    | ja              |
| din-date         | date           | --info-block-top | ja              |
| din-your-ref     | your_ref       | --info-block-top | ja              |
| din-our-ref      | our_ref        | --info-block-top | ja              |
| din-subject      | subject        | --subject-top    | ja              |
| din-salutation   | salutation     | --salutation-top | ja (auto)       |
| din-body         | body           | dynamisch        | NEIN (rich)     |
| din-greeting     | greeting       | dynamisch        | ja              |
| din-signature    | signature      | --footer-top     | ja              |

## Cemetery (was beerdigt wird)

IDs auf Inhaltsfeldern:
  #absender-zeile, #vermerkzone, #empfaenger, #informationsblock,
  #betreff, #textbereich, #f-date, #f-your-ref, #f-our-ref,
  #f-subject, #f-salut, #f-body, #f-greeting, #f-sig-name

data-field Attribut auf Inhaltsfeldern (Tag-Name ist jetzt der Key)

CSS-Regeln mit diesen IDs in @layer din.core (ersetzt durch Tag-Selektoren)

---

## File: plans/029-page-breaks/plan.md
---
id: PLAN-029
spec: SPEC-029
title: Hybrid Height Print Engine Blueprint
status: active
anti-patterns: [ANTI-003, ANTI-008]
adr: ADR-014
---

# Plan: Hybrid Height Print Engine (HOW)

## 1. CSS-Architektur (Screen vs. Print)

Wir nutzen `@media print`, um die physischen Grenzen des `#paper` aufzubrechen.

### 1.1 Screen Settings (Visual Freeze)
```css
#paper {
  height: var(--page-height); /* 297mm */
  overflow: hidden; /* Aviation Grade: kein Scrollen am Blatt */
}
```

### 1.2 Print Settings (Flow Mode)
```css
@media print {
  #paper {
    height: auto !important;
    min-height: 297mm !important;
    overflow: visible !important;
  }
  
  #textbereich {
    position: relative !important; /* Erlaubt natrliches Wachstum */
    top: auto !important;
    height: auto !important;
  }
}
```

## 2. Typografie & Umbrche
Wir nutzen moderne CSS-Eigenschaften fr die Text-Integritt:
- `break-inside: avoid` fr Listen und Blcke.
- `widows: 3; orphans: 3;` fr Abstze.

## 3. Nutzen
Das System verhlt sich auf dem Bildschirm wie ein einzelnes Blatt Papier (Immersion), liefert aber beim Druck ein professionelles, mehrseitiges Dokument.

---

## File: plans/051-content-integrity/plan.md
---
id: PLAN-051
spec: SPEC-051
title: Ghost-Mirror & Plaintext Integrity Implementation
status: draft
anti-patterns: [ANTI-023, ANTI-025]
adr: ADR-008
---

# Plan: Ghost-Mirror & Plaintext Integrity (HOW)

## 1. Constitution Check (Aviation Grade)
| Gate | Status | Notiz |
|---|---|---|
| Vanilla Purity | OK | Nur nativ HTML/CSS/JS |
| Visual Freeze | OK | Mirror-Positionierung absolut, kein Shift |
| No-JS Doctrine | OK | Sichtbarkeit des Mirrors rein via CSS :has() |
| IMR-Integrity | OK | SSoT bleibt Plaintext im din-body |

## 2. Technische Umsetzung

### 2.1 HTML-Ebene (Struktur)
- `<din-body>` bekommt `contenteditable="plaintext-only"`.
- `<din-body-mirror>` wird als direktes Geschwister-Element nach `<din-body>` eingefgt.
- Der Mirror erhlt `aria-hidden="true"`, `user-select: none` und `pointer-events: none`.

### 2.2 CSS-Ebene (Geometrie & Sichtbarkeit)
- `@layer din.core`:
  ```css
  din-body, din-body-mirror {
    position: absolute;
    top: var(--salutation-top); /* plus offset */
    left: var(--margin-left);
    width: var(--text-width);
    font-size: var(--font-size-body);
    line-height: var(--line-height);
  }
  din-body-mirror { color: transparent; white-space: pre-wrap; word-wrap: break-word; }
  ```
- `@layer project.overrides`:
  ```css
  /* Ghost-Mirror Sichtbarkeit */
  #paper:not(:has(din-body:focus)) din-body-mirror { opacity: 1; visibility: visible; }
  #paper:has(din-body:focus) din-body-mirror     { opacity: 0; visibility: hidden; }
  
  /* Print: Nur Mirror anzeigen */
  @media print {
    din-body { display: none !important; }
    din-body-mirror { display: block !important; color: black; }
  }
  ```

### 2.3 JS-Ebene (Logic & Sync)
- **Logic**: Eine neue Funktion `parseMarkdown(text)` in `js/logic/logic.js`:
  ```javascript
  // Snippet zur Illustration
  text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  ```
- **UI**: Im `UIController.init()` einen Listener auf `din-body` (input), der bei jeder nderung `logic.parseMarkdown(el.textContent)` aufruft und das Ergebnis in `din-body-mirror.innerHTML` schreibt.

## 3. Anti-Pattern Guard
- **ANTI-025 (JS-String-Engine in UI)**: Wir verhindern dies, indem die Logik in `logic.js` (Pure) liegt und der Mirror nur als Anzeige-Element dient.
- **ANTI-023 (Magic Numbers)**: Alle Koordinaten werden aus dem CMA-System (`constants.js`) bezogen.

## 4. Cemetery Update
- Das begrabene `richText: true` Flag aus `constants.js` wird im `UIController` final ignoriert/entfernt (TOMB-L008).

---

## File: plans/056-environment-integrity/plan.md
---
id: PLAN-056
spec: SPEC-056
title: Ultimate Zero-JS & Bare Metal Implementation
status: cemented
anti-patterns: [ANTI-016, ANTI-023, ANTI-025, ANTI-026]
adr: [ADR-008, ADR-011]
---

# Plan: Ultimate Zero-JS Implementation (HOW)

## 1. Architektur-Entscheidungen
- **Relational Selection**: Einsatz von `:has()` zur Erkennung von Radio-States (`:checked`).
- **CSS Logic Primes**: Einsatz von `if()` zur bedingten Zuweisung von CMA-Variablen im CSS.
- **Implicit Transitions**: Einsatz von `view-transition-trigger: checked` zur Automatisierung von Morphing-Effekten.

## 2. Technische Bausteine

### 2.1 CSS State Logic
```css
#app-shell:has(#radio-a:checked) { --layout: form-a; }
#paper { top: if(style(--layout: form-a): 27mm; else: 45mm); }
```

### 2.2 Data-IO Isolation (UIController)
- JavaScript bindet sich NUR an `[data-action]` via Event Delegation.
- Jeglicher Code, der UI-Attribute (wie `dataset.layout`) setzt, wird durch native HTML-Interaktion ersetzt.

## 3. Purge-Strategie (The Great Purge)
- Entfernung aller `onchange` Handler in `index.html`.
- Lschung von `_applyLayout()` und hnlichen JS-Synchronisatoren.

---

## File: plans/057-advanced-attr-cma/plan.md
---
id: PLAN-057
spec: SPEC-007
title: Final Death of CMA-Bridge via Advanced attr()
status: active
anti-patterns: [ANTI-025]
adr: ADR-009
---

# Plan: Final Death of CMA-Bridge via Advanced attr() (Chrome 149+)

## 1. Zielstellung
Vollstndige Eliminierung von JavaScript fr die Millimeter-genaue Positionierung der DIN-Zonen. Die CMA-Variablen werden direkt aus HTML-Attributen des `<div id="paper">` oder der `<din-*>` Tags bezogen.

## 2. Technische Umsetzung
Sobald die Typisierung in `attr()` (Chrome 149) vollstndig stabil ist, stellen wir die CSS-Variablen um.

### 2.1 CSS Blueprint
Anstatt JS-Werte in CSS-Variablen zu injizieren, liest das CSS die Werte direkt:
```css
@layer din.core {
  #anschriftzone {
    /* Liest das Attribut data-cma-top direkt als Millimeter-Wert */
    top: attr(data-cma-top type(<length>), 45mm);
  }
}
```

## 3. Nutzen
- **Zero-JS Overhead**: Keine `cma-bridge.js`, kein Resize-Observer, kein Layout-Sync ntig.
- **Aviation Grade**: Die physische Wahrheit liegt im HTML-Attribut (SSoT).

---

## File: plans/057-dom-first-integrity/plan.md
---
id: PLAN-057
spec: SPEC-057
title: Anchor Positioning & Passive Sync Blueprint
status: active
anti-patterns: [ANTI-014, ANTI-021]
adr: ADR-013
---

# Plan: DOM-First Implementation (HOW)

## 1. CSS Anchor Positioning (Chrome 147)
Wir definieren jedes `<din-*>` Feld als potentiellen Anker.

**Blueprint CSS:**
```css
/* Jedes Feld ist ein Anker */
din-sender     { anchor-name: --sender; }
din-recipient  { anchor-name: --recipient; }
din-body       { anchor-name: --body; }

#editor-toolbar {
  position: absolute;
  /* Anker-Logik: Positioniere dich ber dem Anker des Elements mit Fokus */
  position-anchor: --active-field; 
  bottom: anchor(top);
  left: anchor(left);
}

/* JS setzt nur den Namen des aktiven Ankers */
:focus-within { --active-field: --this-element-specific-anchor; }
```

## 2. Passiver State-Sync
Wir entfernen den `input` Event-Listener, der in den Speicher schreibt.

**Neuer Zyklus:**
1. Nutzer tippt. (0% JS Aktivitt).
2. Nutzer verlsst das Feld (`blur`) ODER drckt `Ctrl+S`.
3. JS ruft `readDOMasJSON()` auf und aktualisiert den State in einem Rutsch.

## 3. Native Labels (Pseudo-Elemente)
Wir lagern statische Texte in das CSS aus.
```css
din-date::before { 
  content: "Datum: "; 
  font-weight: normal;
  color: #888;
}
```

---

## File: plans/058-native-sanitizer/plan.md
---
id: PLAN-058
spec: SPEC-058
title: UI Polish & Instant-Load Blueprint
status: active
anti-patterns: [ANTI-020]
adr: ADR-015
---

# Plan: UI Polish & Instant-Load (HOW)

## 1. ANTI-FOUC Script (index.html)
Wir injizieren ein minimales Block-Skript in den `<head>`, um die CSS-Variable `--layout` sofort wiederherzustellen.

```html
<script>
  (function() {
    const layout = localStorage.getItem('neo_layout') || 'form-b';
    document.documentElement.style.setProperty('--layout', layout);
  })();
</script>
```

## 2. Toast & Statusbar Styling (sidebar.css)
- **Statusbar**: Einsatz von `backdrop-filter: blur(8px)` und runden Ecken.
- **Toasts**: CSS-Keyframe Animation `toastIn` und semantische Farben.

## 3. Sidebar Scrollbar
Subtiles Styling fr den Chrome-Browser:
```css
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb { background: #333; }
```

## 4. Nutzen
Die App fhlt sich ab der ersten Millisekunde professionell und stabil an.

---

## File: plans/059-contrast-color-auto/plan.md
---
id: PLAN-059
spec: SPEC-053
title: Accessibility v3 via native contrast-color()
status: active
anti-patterns: [ANTI-025]
adr: ADR-011
---

# Plan: Accessibility v3 via native contrast-color() (Chrome 147+)

## 1. Zielstellung
Automatische Auswahl der optimalen Textfarbe (Schwarz/Wei) auf farbigen Briefkpfen.

## 2. Technische Umsetzung
Anstatt JS-Helligkeitsberechnungen zu nutzen, bernimmt Chrome 147 die Auswahl nativ.

### 2.1 CSS Blueprint
```css
@layer ui.theme {
  :root {
    /* Die Hauptfarbe wird im Profil gesetzt */
    --brand-color: var(--p-brand, #2980b9);
    
    /* Chrome 147: Whlt automatisch die bessere Kontrastfarbe */
    --brand-text-color: contrast-color(var(--brand-color));
  }
}
```

## 3. Nutzen
- **WCAG-Konformitt**: 100% garantierte Kontrastrate ohne manuelle Tests.
- **Zero-JS Logic**: Keine Farbraum-Konvertierungen im JS ntig.

---

## File: plans/059-persistence-pwa/plan.md
---
id: PLAN-059
spec: SPEC-059
title: Smart Save & PWA Setup
status: active
anti-patterns: [ANTI-014, ANTI-020]
adr: ADR-016
---

# Plan: Smart Save & PWA Implementation (HOW)

## 1. Smart Auto-Save (JS Logic)
Wir implementieren eine `debounce` Funktion fr das `input` Event auf dem Briefpapier.

**Blueprint:**
```javascript
const autoSave = debounce(() => this._syncDOMToState(), 1500);
document.getElementById('paper').addEventListener('input', autoSave);
```
- Vorteil: JS fhrt die schwere `readDOMasJSON()` Operation nur aus, wenn der Nutzer eine Pause macht.

## 2. Desktop PWA (Infrastruktur)
Wir erstellen zwei neue Core-Dateien:
- `manifest.json`: Definiert Name, Icons und Standalone-Modus.
- `sw.js` (Service Worker): Ermglicht Offline-Start und erfllt die PWA-Kriterien.

## 3. Web App Manifest Highlights
- `display: standalone`: Entfernt die Browser-Leiste.
- `theme_color`: Passend zum DIN-Brief-Look (#121212).
- `icons`: Nutzung eines hochauflsenden SVG-Icons.

---

## File: plans/060-sovereign-akinator/plan.md
---
id: PLAN-060
spec: SPEC-056
title: Sovereign Akinator 4.0  Local Gemini Nano Integration
status: draft
anti-patterns: [ANTI-025]
adr: ADR-012
---

# Plan: Sovereign Akinator (Local AI)

## 1. Zielsetzung
Ersetzung aller externen KI-Aufrufe durch die native **Chrome Gemini Nano API**. Der Akinator wird zum lokalen Lektor, der ohne Internetverbindung und mit maximalem Datenschutz operiert.

## 2. Technische Umsetzung

### 2.1 Feature Detection
Wir prfen, ob der Browser das Modell bereits geladen hat:
```javascript
async function isAiReady() {
  if (!globalThis.ai || !globalThis.ai.assistant) return false;
  const status = await ai.assistant.capabilities();
  return status.available === 'readily';
}
```

### 2.2 Local Prompting
Anstatt eines `fetch()` an einen Server, nutzen wir die Session-API:
```javascript
async function runLocalAnalysis(content) {
  const session = await ai.assistant.create({
    systemPrompt: "Du bist ein DIN 5008 Experte. Prfe diesen Brief auf Form und Ton."
  });
  return await session.prompt(JSON.stringify(content));
}
```

## 3. Vorteile fr das Projekt
- **Privacy First**: Briefgeheimnis wird technisch durch lokale Ausfhrung garantiert.
- **Zero Latency**: Sofortiges Feedback whrend des Tippens (Ghost-Mirror-hnlich).
- **Cost Zero**: Keine API-Kosten, keine Abhngigkeit von Drittanbietern.

## 4. Constraint Check
Der Akinator darf den Brief **niemals eigenmchtig ndern**. Er gibt nur Empfehlungen aus (Aviation Grade: Der Pilot/Nutzer behlt die Kontrolle).

---

## File: plans/061-platinum-pipeline/plan.md
---
id: PLAN-061
spec: SPEC-061
title: Implementation of the Platinum Validation Pipeline (PVP)
status: cemented
anti-patterns: [ANTI-023, ANTI-025]
adr: [ADR-003, ADR-008]
---

# PLAN-061: Platinum Validation Pipeline (PVP)

## Constitution Check
| Mandate | Status | Note |
|---|---|---|
| [MANDATE-INJ] | OK | Actively checks for `innerHTML` violations. |
| [MANDATE-FREEZE] | OK | Monitors `din.core` and CMA-coordinates via the catalog. |
| [MANDATE-NAT] | OK | Checks for unauthorized external dependencies. |
| [MANDATE-PLN] | OK | Verifies `plaintext-only` attribute on all custom tags. |

## 1. Implementierung des IMR-Katalogs
Das Tool `scripts/get-catalog.mjs` ist bereits als ES-Modul angelegt. Es extrahiert die Daten direkt aus `js/core/constants.js`.

### Aufruf
```bash
node scripts/get-catalog.mjs
```

## 2. Erweiterung der Post-Session Verifikation
Die Datei `scripts/post-session-verify.ps1` wird um die Sektion `PLATINUM MANDATE CHECK` erweitert.

### Prf-Logik (PowerShell)

#### A. MANDATE-INJ (Zero innerHTML)
```powershell
$innerHtmlMatches = Select-String -Path "js/**/*.js" -Pattern "\.innerHTML\s*=" -Exclude "js/logic/mirror-renderer.js"
if ($innerHtmlMatches) {
    Write-Host "  ❌ MANDATE-INJ VERSTOSS: .innerHTML gefunden!" -ForegroundColor Red
    $innerHtmlMatches | ForEach-Object { Write-Host "     -> $($_.Path):$($_.LineNumber)" -ForegroundColor Gray }
}
```

#### B. MANDATE-PLN (Plaintext-Only)
```powershell
$tagsWithoutPlaintext = Select-String -Path "index.html" -Pattern "<din-[\w-]+" | Where-Object { $_.Line -notmatch 'contenteditable="plaintext-only"' }
if ($tagsWithoutPlaintext) {
    Write-Host "  ❌ MANDATE-PLN VERSTOSS: <din-*> Tag ohne plaintext-only!" -ForegroundColor Red
    $tagsWithoutPlaintext | ForEach-Object { Write-Host "     -> $($_.Line.Trim())" -ForegroundColor Gray }
}
```

#### C. MANDATE-NAT (Native-First)
```powershell
$externalScripts = Select-String -Path "index.html" -Pattern "<script.*src=`"http"
if ($externalScripts) {
    Write-Host "  ⚠️  MANDATE-NAT WARNUNG: Externes Script gefunden!" -ForegroundColor Yellow
}
```

## 3. Rollout & Training
- Der Katalog wird in die `speckit.tasks.toml` als Vorbereitungs-Schritt aufgenommen.
- Alle Agenten werden instruiert, `get-catalog.js` zu nutzen, um Halluzinationen zu vermeiden.

---

## File: plans/062-industry-intent/plan.md
# Implementation Plan: 062-industry-intent-sovereignty

**Branch**: `062-industry-intent` | **Date**: 2026-03-22 | **Spec**: SPEC-062 (Derived)
**Input**: Fernando Alves AI-Native Principles + Thoughtworks BMAD

## Summary
Einfhrung einer intelligenten Layout-Vorschlagsebene basierend auf der erkannten Branche (Industry Intent). 
Kern-Anforderung: **Abschaltbarkeit & Datenhoheit**. Die KI darf Layouts (A/B) und Formalitt nur ndern, wenn der Nutzer dies explizit in den Einstellungen erlaubt.

## Technical Context
**Language/Version**: HTML5, CSS Layers, Vanilla JS
**Target Platform**: Chrome 147+ (Native Sanitizer/Popover/Layers)
**Constraints**: [MANDATE-000] Nutzersouvernitt, [MANDATE-NAT] Native-First

## Constitution Check & Security Architect Review (BMAD)

| Mandat | Status | Notiz (Security Architect Review) |
|:---|:---:|:---|
| [MANDATE-INJ] No innerHTML | OK | Nutzung von setHTML/textContent |
| [MANDATE-PLN] Plaintext-Only | OK | Nur Metadata-Update via Intents |
| [MANDATE-NAT] Native-First | OK | Nutzung von data-* Attributen |
| [MANDATE-BANNED] No head/tail | OK | |
| **Data Integrity Audit** | PASS | KI-Intents werden durch Guard-Variable (Auto-Config) gefiltert |

> **Security Architect Critique:**
> Die grte Gefahr besteht im "Vormund-Effekt" (KI ndert Layout, Nutzer ist verwirrt). 
> Lsung: Der `executeAIResponse`-Handler bekommt einen harten Check auf `localStorage.getItem('neo_auto_config')`. 
> Ohne explizite Aktivierung durch den Nutzer werden Layout-Intents zwar protokolliert (Audit Trail), aber NICHT ausgefhrt.
> Dies sichert die Datenhoheit strukturell ab.

## 1. Plan (Technik)

### Schritt A: UI-Ebene (Sidebar)
Hinzufgen eines Toggle-Switch in `index.html` (sidebar-left).
`data-auto-config="false"` als Default.

### Schritt B: Registry-Ebene (Constants)
Erweiterung `AI_INTENTS` in `js/core/constants.js`:
- `LAYOUT_A`: 'ui:set_layout_a'
- `LAYOUT_B`: 'ui:set_layout_b'
- `FORMAL`:   'ui:set_formality_formal'
- `CASUAL`:   'ui:set_formality_casual'

### Schritt C: Orchestrator-Ebene (Logic)
1. `executeAIResponse` erweitern:
   - Liest `paper.dataset.autoConfig`.
   - Fhrt UI-Intents nur aus, wenn `true`.
   - Logging: "AI suggested Layout X (ignored/applied)".
2. `buildInterviewPrompt` erweitern:
   - Instruktion zur Branchenerkennung hinzufgen.

## 2. Tasks

- [ ] [A] Sidebar-Toggle in `index.html` einbauen + CSS
- [ ] [B] `AI_INTENTS` in `constants.js` erweitern
- [ ] [C] `executeAIResponse` in `logic.js` absichern (Auto-Config Guard)
- [ ] [D] Prompt-Instruktionen in `logic.js` schrfen
- [ ] [E] Audit Trail Verifizierung

---

## File: plans/063-dynamic-sidebar/plan.md
# Implementation Plan: 063-dynamic-sidebar-zero-js

**Branch**: `063-dynamic-sidebar` | **Date**: 2026-03-22 | **Spec**: SPEC-063 (Derived)
**Input**: Fernando Alves / Lynx 3.6 / No-JS Doctrine

## Summary
Upgrade der Seitenleiste von einer starren 300px-Breite auf ein dynamisches, responsives Format. Gleichzeitig Eliminierung von Inline-JS-Handlern fr Form-Umschaltung (A/B) und Guides durch das "Zero-JS" Radio-Button-Muster.

## Technical Context
**Language/Version**: CSS Layers, HTML5
**Target Platform**: Chrome 147+
**Constraints**: [ADR-003] No-JS Doctrine, [MANDATE-NAT] Native-First

## Constitution Check & Security Architect Review (BMAD)

| Mandat | Status | Notiz (Security Architect Review) |
|:---|:---:|:---|
| [MANDATE-INJ] No innerHTML | OK | Rein strukturelles CSS/HTML Update |
| [MANDATE-PLN] Plaintext-Only | OK | Keine Inhaltsnderung |
| [MANDATE-NAT] Native-First | OK | Nutzung von :checked Pseudoklassen |
| [MANDATE-BANNED] No head/tail | OK | |
| **Data Integrity Audit** | PASS | Logik wandert vom imperativen JS ins deklarative CSS |

> **Security Architect Critique:**
> Die Umstellung auf CSS-basierte Zustandssteuerung (Radio-Buttons) reduziert die Angriffsflche fr Script-Injektionen massiv. 
> Das dynamische Sidebar-Format verbessert die Usability auf verschiedenen Endgerten (2026 Standard). 
> Wichtig: Die Persistenz (LocalStorage) muss weiterhin ber einen zentralen (nicht-inline) Listener in `app.js` erfolgen, um den Zustand nach Refresh zu halten.

## 1. Plan (Technik)

### Schritt A: Dynamische Sidebar (CSS)
In `css/sidebar.css`:
- `#app-shell` Grid von `300px 1fr` auf `clamp(250px, 20vw, 400px) 1fr` ndern.
- Flexibles Padding und Font-Sizes fr die Sidebar-Elemente.

### Schritt B: Zero-JS Radio-Steuerung (HTML/CSS)
In `index.html` (sidebar-left):
1. Radio-Gruppe fr **Layout** (Form A / Form B).
2. Radio-Gruppe fr **Hilfslinien** (An / Aus).
3. Diese Radios steuern via `:has()` oder Geschwister-Selektoren das `#paper`.
   - *Herausforderung:* Da die Sidebar und das Papier weit auseinander liegen, nutzen wir `body:has(#radio-id:checked) #paper`.

### Schritt C: Persistenz-Sync (JS)
In `js/core/app.js`:
- Zentraler Event-Listener auf dem `aside` Container.
- Bei `change`: Speichere Wert in `localStorage`.
- Beim Laden: Setze `checked` Status der Radios basierend auf `localStorage`.

## 2. Tasks

- [ ] [A] CSS Grid-Anpassung in `css/sidebar.css` fr dynamische Breite
- [ ] [B] Radio-Buttons in `index.html` einbauen (Layout & Guides)
- [ ] [C] CSS-Logik fr `:has()` Zustandssteuerung schreiben
- [ ] [D] Inline-JS (onchange/onclick) aus `index.html` entfernen
- [ ] [E] `app.js` Update fr saubere Persistenz (ohne Inline-Logik)

---

## File: plans/064-footer-logic/plan.md
# Implementation Plan: 064-business-footer-logic

**Branch**: `064-footer-logic` | **Date**: 2026-03-22 | **Spec**: SPEC-064 (Derived from LaTeX/ct-Article)
**Input**: LaTeX scrlttr2 standard (firstfoot) + DIN 5008

## Summary
Integration eines professionellen Geschfts-Footers. Der Akinator validiert Pflichtangaben (Sitz, Register, USt-IdNr, IBAN) und befllt den Bereich strukturiert.

## Technical Context
**CMA-Constraint**: `FOOTER_TOP` (269.000mm)
**Constraints**: [MANDATE-PLN] Plaintext-only, [MANDATE-NAT] Native-First, [MANDATE-INJ] No innerHTML

## Aviation Grade Pflichtfelder (Validation Logic)
- **Legal Entity**: Name + Rechtsform
- **Registration**: Registergericht + Nummer (HRB/HRA)
- **Tax**: USt-IdNr (Validierung: DE + 9 Ziffern)
- **Finance**: IBAN (Validierung via Modulo 97) + BIC

## 1. Plan (Technik)

### Schritt A: HTML & IMR Sync
- `<din-footer>` in `index.html` einbauen.
- IMR in `constants.js` ist bereits vorbereitet.

### Schritt B: Business Logic (js/logic/logic.js)
- `validateFooterData(json)`: Prft auf Vollstndigkeit der Pflichtangaben.
- `formatIBAN(iban)`: Automatische Gruppierung in 4er-Blcke.

### Schritt C: Sequential Thinking Implementation
1. Analyse der vorhandenen Profildaten.
2. Abgleich mit DIN-Pflichtfeldern.
3. Generierung des strukturierten Footer-Strings.
4. UI-Update via `executeAIResponse`.

## 2. Tasks

- [ ] [A] `<din-footer>` in `index.html` einbauen
- [ ] [B] CSS-Regeln in `css/din5008-paper.css` ergnzen
- [ ] [C] `buildInterviewPrompt` & `buildOptimizationPrompt` aktualisieren (Footer-Wissen)
- [ ] [D] `executeAIResponse` Audit Trail Verifizierung fr Footer-Updates
