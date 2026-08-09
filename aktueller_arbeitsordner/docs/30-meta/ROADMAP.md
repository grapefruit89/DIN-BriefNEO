---
id: roadmap
title: 'Zukunfts-Roadmap — Ideen & Chrome-Modernisierungschancen'
type: roadmap
status: active
created: '2026-07-07'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/roadmap
doc_links:
  - longevity-guidelines
  - ADR-ANTIPATTERN
  - web-standards-tracking
error_patterns:
  - roadmap
  - zukunft
  - ideen
  - brainstorming
  - chrome features
  - modernisierung
supersedes: []
---

# Zukunfts-Roadmap — Ideen & Chrome-Modernisierungschancen

Alle Einträge sind **unverbindlich** — Brainstorming oder architektonisch zurückgestellt. Kein Commit ohne expliziten Beschluss.

---

## Ideen & Brainstorming

### 1. Mehrseitiges Horizontal-Karussell

Mehrseitige Briefe, die im Editor horizontal gescrollt werden, um vertikales Scrollen im Viewport zu vermeiden.

**Status:** Zurückgestellt (Phase 1 / Backlog). Hohe JS-Komplexität bei der Paginierung. 95% aller DIN 5008 Briefe passen auf eine Seite.

### 2. Nativer PDF-Export (Client-side)

Erzeugung eines echten PDF-Downloads direkt im Browser via `pdf-lib` oder `jspdf`.

**Status:** Brainstorming. Verletzt W3C-First und Zero-Dependency. Bevorzugt bleibt `window.print()` mit optimiertem CSS.

### 3. Erweiterte Formatierungsoptionen im Markdown-Parser

Ausbau des `parseMarkdown`-Moduls zur nativen Unterstützung von geordneten/ungeordneten Listen, Überschriften und Tabellen im Briefkern.

**Status:** Brainstorming. Muss mit dem Selection-Popover synchronisiert werden.

### 4. LLM-Features in der App (Zauberstab)

API-Keys im LocalStorage speichern, Buttons im UI für Textformatierung (förmlich, Füllwörter entfernen) per LLM-Aufruf.

**Status:** Geplant (auf Wunsch). LLM-Client in Vanilla JS ohne npm oder Bundle-Size-Explosion.

### 5. Offline-Service-Worker (PWA)

Service Worker für Cache-basiertes PWA-Erlebnis.

**Status:** Zurückgestellt. Service Worker setzen HTTPS voraus — unter `file:///` werfen sie Security Errors. `index.html` per Doppelklick funktioniert offline ohne SW.

### 6. Sprachsteuerung & Diktat (Web Speech API)

Native `webkitSpeechRecognition` für Diktat von Brieftexten.

**Status:** Brainstorming. Plattformspezifisch (Chrome/Safari OK, Firefox nicht). Erfordert Cloud-Verbindung.

### 7. LanguageTool API — Rechtschreib-/Grammatikprüfung

Externe API-Anbindung zur Prüfung des Brieftexts auf Rechtschreib- und Grammatikfehler direkt im Editor.

**Status:** Geplant (2026-08-08 festgehalten). Passt zum Editor-Zweck, optionale Enhancement-Schicht (kein Offline-Bruch, da nur bei aktiver Internetverbindung genutzt).

### 8. bzst.de Behördenwegweiser — Finanzamt-Adress-Lookup

Automatisches Auffinden der zuständigen Finanzamt-Adresse für den Empfänger, analog zum bestehenden Adress-Autocomplete (Geoapify/Photon).

**Status:** Geplant (2026-08-08 festgehalten). Nischen-Feature, aber spart Nutzern manuelle Suche bei Behördenbriefen.

**Zurückgestellt/verworfen aus derselben Ideen-Liste** (Chat-Audit 2026-08-08, zu nischig für einen allgemeinen Briefeditor): Justizadressen.nrw.de, gerichtsstand.net, insolvenzbekanntmachungen.de, Bundesbank-Webservice (Basiszinssatz/Verzugszins — nur relevant für Mahnschreiben), EZB-Referenzkurse, OpenThesaurus.de, OffeneRegister/OpenCorporates, Wikidata SPARQL, Open Legal Data.

---

## Chrome 148-151 Modernisierungschancen

Audit vom Juli 2026: **15 konkrete Opportunities** — netto -153 Zeilen imperativen JS. Alle Features seit Chrome 150/151 default-enabled.

### Bereich 1: CSS `text-fit` / Native Font Auto-Scaling (Chrome 150/151)

- **Opportunity 1.1** `#absender` Envelope Window — JS-Zeichenzählung durch natives `text-fit` ersetzen. Absenderzeile skaliert automatisch auf 85mm × 5mm.
- **Opportunity 1.2** `#betreff` Subject Line Overflow — dynamisches Font-Scaling ohne JS.
- **Opportunity 1.3** `.single-line` Input Fields — Overflow-Prävention ohne JS-Polling.

### Bereich 2: HTML `focusgroup` (Chrome 150/151)

- **Opportunity 2.1** Segmented Controls — native ArrowLeft/Right-Navigation ohne JS-Event-Listener.
- **Opportunity 2.2** Sidebar Buttons — ArrowUp/Down-Navigation ohne JS.

### Bereich 3: CSS `light-dark()` Erweiterungen (Chrome 149+)

- **Opportunity 3.1** Theme-adaptive Bilder & Icons — eliminiert JS-Theme-Toggle-Listener.
- **Opportunity 3.2** Focus-Border Adaptability — `oklch()` + `light-dark()` statt doppelter CSS-Regeln.

### Bereich 4: CSS Gap Decorations (`column-rule-inset`, `row-rule-*`) (Chrome 150+)

- Dekorative Trennlinien zwischen Sidebar-Sektionen rein per CSS ohne `<hr>`-Elemente.

### Bereich 5: Name-Only Container Queries (Chrome 149+)

- `@container sidebar` statt size-basierter Queries für semantisch klarere Stylesheet-Logik.

### Bereich 6: CSS Anchor Positioning (`position-area`) + `popover="hint"` (Chrome 150+)

- **Opportunity 6.1** Format Toolbar Anchor — präziseres Anchoring der Formatierungsleiste.
- **Opportunity 6.2** Adress-Autocomplete Dropdown — `popover="hint"` + `position-area` statt JS-Positionsberechnungen.
- **Opportunity 6.3** Hover Tooltips — native `popover="hint"` ohne JS-Listener.

### Bereich 7: HTML State & CSS `:has()` Toggle Patterns (Chrome 148+)

- **Opportunity 7.1** Form A/B Toggle — `<input type="radio">` + `:has()` statt JS-Klassen-Toggle.
- **Opportunity 7.2** Theme-Switcher — gleiches Pattern für Hell/Dunkel/Auto.

### Bereich 8: Native HTML5 `<dialog>` Modal (Chrome 148+)

- **Opportunity 8.1** Bestätigungs-Dialoge — `<dialog>` statt `window.confirm()`. Nicht-blockierend, stylebar, barrierefrei.

---

## Verweise

- [[longevity-guidelines]] — Verbote für CDN und Drittanbieter-Bibliotheken
- [[ADR-ANTIPATTERN]] — Strikte Verbote (CDN, npm, Polyfills)
- [[web-standards-tracking]] — Aktuelle W3C/Chrome-Feature-Tracking
