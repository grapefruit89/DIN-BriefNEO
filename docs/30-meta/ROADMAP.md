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
depends_on: []
code_links: []
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

Audit vom Juli 2026 (ursprünglich `architecture_opportunities.md`, 19 Einzel-Opportunities in 8 Bereichen). **Verifiziert gegen den Code, 2026-08-09:** der Großteil ist bereits umgesetzt — nur noch 4 Punkte offen. Die Detaildatei wurde daher gelöscht, dieser Abschnitt ersetzt sie.

### Noch offen (4)

- **`focusgroup="vertical wrap"`** auf der Sidebar-Footer-Aktionsgruppe (`#btn-print`/`#btn-reset`) — ArrowUp/Down-Navigation ohne JS.
- **Name-Only Container Queries** (`@container paper { ... }`) statt size-basierter Queries — bisher nirgends im CSS verwendet.
- **`popover="hint"` + `interesttarget`** für reichhaltige, stylebare Tooltips statt nativer `title`-Attribute.
- **Container Scroll-State Query** (`@container scroll-state(overflow-y: true)`) für eine Text-Overflow-Warnung im Briefkern. Die alte JS-Variante (`checkTextOverflow`, `.scrollHeight`-Polling) wurde als buggy entfernt, nie migriert.

**Status:** Brainstorming / Nice-to-have, keine Bugs. Kein Zeitdruck.

### Bereits umgesetzt (verifiziert 2026-08-09)

`text-fit` auf Absender/Betreff/`.single-line` · `focusgroup="horizontal wrap"` auf allen Segmented Controls · `light-dark()` durchgängig in `variables.css` · Gap Decorations (`column-rule`/`column-rule-inset`) im Footer · CSS Anchor Positioning für alle Dropdowns und die Format-Toolbar · `:has()`-Radio-Pattern für Theme/Schriftart/Anrede/Datum/Unterschrift · natives `<dialog>` für die Reset-Bestätigung (sogar mit `command="show-modal"`, moderner als im Audit vorgeschlagen).

### Bewusst anders gelöst

Trennlinien in den Segmented Controls: statt der vorgeschlagenen `column-rule` wurde ein gleitendes Pill-Element (`::before`) gewählt.

---

## Verweise

- [[longevity-guidelines]] — Verbote für CDN und Drittanbieter-Bibliotheken
- [[ADR-ANTIPATTERN]] — Strikte Verbote (CDN, npm, Polyfills)
- [[web-standards-tracking]] — Aktuelle W3C/Chrome-Feature-Tracking
