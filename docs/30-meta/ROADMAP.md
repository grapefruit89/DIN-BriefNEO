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

# Zukunfts- & Modernisierungs-Roadmap 2026

> **Status:** Genehmigter Umsetzungsplan (Forschungsergebnisse aus `research/README.md`)  
> **Kernziel:** Maximale Code-Reduktion (~61% weniger JavaScript, ~40% weniger CSS-Hacks), 100% Offline-Autofill für Deutschland und strikte Einhaltung der Zero-Scroll-Papiergrenze.

---

## 📊 ROI-Übersicht (Nutzen vs. Aufwand)

| Priorität | Arbeitspaket | Aufwand | Nutzen | Primärer Hebel |
| :--- | :--- | :--- | :--- | :--- |
| **Prio 1** | **Salutation Engine V2 & Vornamen-Dictionary** | Sehr Gering (~30 min) | **Extrem Hoch** | 2,6 KB Vornamen-Brotli, 3 B2B-Pärchen, Adelspartikel-Schutz, Auto-Reset |
| **Prio 2** | **72 KB Offline-Brotli PLZ & Großempfänger** | Mittel (~2 h) | **Maximal (Gamechanger)** | 10.814 PLZs + 2.258 Großempfänger, 0 ms Latenz, 100% Offline, DSGVO |
| **Prio 3** | **Smart Clipboard Impressum-Parser** | Gering–Mittel (~1 h) | **Sehr Hoch** | 0,1ms Heuristik: 1-Klick-Übernahme kompletter Web-Impressen nach DIN 5008 |
| **Prio 4** | **JS-Kill Phase 1: Text-Fit & CSS-Modernisierung** | Gering (~45 min) | **Hoch** | `48-text-fit.js` löschen, `field-sizing: content`, `light-dark()`, `text-wrap` |
| **Prio 5** | **JS-Kill Phase 2: HTML-Switch, Popover & Top-Layer** | Mittel (~1,5 h) | **Hoch** | `contenteditable="plaintext-only"`, Popover API für Toasts, `<input switch>` |
| **Prio 6** | **Quartalsweise Open-Data Pipeline** | Gering (~30 min) | **Mittel** | GitHub Action + Python-Build für automatische PLZ-/Großempfänger-Updates |
| **Prio 7** | **Optionales On-Device KI-Addon (Gemini Nano)** | Mittel (~1,5 h) | **Optional / Experimentell** | Entkoppeltes Plugin via `window.ai` (Graceful Degradation ohne Cloud-Zwang) |

---

## 🚀 Detaillierte Umsetzungsschritte (Prio-Sortiert)

### 🟢 Priorität 1: Salutation Engine V2 Produktivschaltung (Quick Win)
* **Problem:** `website/js/main.js` importiert noch das veraltete `41-salutation-engine.js`. Nutzer müssen Geschlechter teils manuell wählen oder stoßen auf unvollständige Anreden während des Tippens.
* **Lösung:**
  1. Umhängen des Imports in `main.js` auf `website/js/41-salutation-engine.smart.js`.
  2. Kopieren von `research/research_results/de_vornamen_gender.json.br` (2,6 KB) nach `website/data/` und Integration des Offline-Lookups für Zero-Click-Geschlechtserkennung.
  3. Aktivierung der 3 B2B-Pärchen (Förmlich, Höflich, Locker), Adelspartikel-Erhalt (`von`, `zu`, `van`, `de`) und Dirty-Flag-Schutz mit Auto-Reset.
  4. Archivierung des alten `41-salutation-engine.js`.
* **Aufwand:** ~30 Minuten.
* **Nutzen:** Sofortige Beseitigung aller Anrede-Fehler auf dem echten Briefbogen.

---

### 🟢 Priorität 2: 72 KB Offline-Brotli PLZ- & Großempfänger-Engine (Gamechanger)
* **Problem:** Aktuell erzeugt jeder Tastenanschlag im Adressfeld langsame Cloud-Requests (150–250 ms) an Geoapify/Zippopotam. Ohne Internet funktioniert die Adresshilfe nicht.
* **Lösung:**
  1. `research/research_results/de_plz_ort.json.br` (72,1 KB) nach `website/data/` überführen.
  2. Implementierung eines schlanken Loaders über die native Browser `DecompressionStream`-API (Ladezeit unter 1 ms, Ausführung nativ in C++).
  3. Bidirektionale Logik:
     * Tippen von 5 Ziffern (z. B. `53111`) ➔ Sofortige Ergänzung von `Bonn` in 0,001 ms.
     * Tippen von Ortsnamen (z. B. `Bonn`) ➔ Sofortige Vorschläge der Stadtteile.
  4. Großempfänger-Automatik (OLG Frankfurt, Az. 6 U 170/13): Bei 2.258 Sonder-PLZs (Bundestag `11011`, Kanzleramt `11012`, Ministerien, Konzerne) wird die Straßenzeile normgerecht automatisch weggelassen.
  5. Entlastung von `website/js/43-geoapify.js`: Geoapify wird ausschließlich als optionale Tier-2-Suche für Straßen und Hausnummern aufgerufen.
* **Aufwand:** ~2 Stunden.
* **Nutzen:** 100% autarker Offline-Betrieb für ganz Deutschland, null API-Quota-Verbrauch für Standard-Briefe, 100% Datenschutz.

---

### 🟢 Priorität 3: Smart Clipboard Impressum-Parser (Maximaler Nutzerkomfort)
* **Problem:** Nutzer müssen Adressen von Firmen-Websites (Impressum) mühsam Zeile für Zeile kopieren und einfügen, während tausende Zeilen Cookie-Banner, Menüs und Redaktionsmitglieder stören.
* **Lösung:**
  1. Integration des heuristischen Scoring-Parsers aus `research/roadmap/SMART_CLIPBOARD_IMPRESSUM_PARSER.md` als `paste`-Listener auf das Empfängerfeld.
  2. Erkennt eingefügte Textblöcke (> 3 Zeilen) und filtert in 0,1 ms:
     * Menüleisten, Social-Links, Cookie-Texte.
     * Handelsregisterdaten (`HRB ...`, `Amtsgericht ...`), USt-IdNr., Vorstände.
  3. Extrahiert exakt die DIN-5008-Felder: Firma, Ansprechpartner, Straße/Hausnummer, PLZ/Ort und befüllt das Adressfeld strukturiert mit einem Klick.
* **Aufwand:** ~1 Stunde.
* **Nutzen:** Enormer Zeitgewinn für jeden Anwender beim Erstellen geschäftlicher Antwortbriefe.

---

### 🟡 Priorität 4: JS-Kill Phase 1 — `48-text-fit.js` eliminieren & CSS-Bereinigung
* **Problem:** `website/js/48-text-fit.js` führt bei jedem Tastenanschlag DOM-Messungen (`scrollWidth > clientWidth`) und MutationObserver-Schleifen aus, was Layout Thrashing verursacht.
* **Lösung:**
  1. `website/js/48-text-fit.js` komplett löschen und aus `index.html` austragen.
  2. Aktivierung von nativem CSS: `field-sizing: content` (Standard in Chrome 123+) und `overflow: clip`.
  3. Bereinigung von `variables.css`: Ersatz redundanter Theme-Klassen durch CSS `light-dark()` und `color-mix()`.
  4. Betreff & Brieftext typografisch mit `text-wrap: balance` und `text-wrap: pretty` absichern (keine Waisen-Wörter am Zeilenende).
* **Aufwand:** ~45 Minuten.
* **Nutzen:** ~150 Zeilen fragiles JavaScript entfallen, 0 ms Reflow-Overhead, seidenweiches Tippen.

---

### 🟡 Priorität 5: JS-Kill Phase 2 — HTML-Switch, Popover & Top-Layer
* **Problem:** Keydown-Enter-Filter in `03-ui-protections.js` und manuelles Z-Index-/Timer-Management in `32-toast.js` blähen die Codebasis auf.
* **Lösung:**
  1. Einzeilige Felder in `website/index.html` mit nativem `contenteditable="plaintext-only"` und `enterkeyhint="done"` ausstatten (Browser blockiert Umbrüche und HTML-Formatting nativ).
  2. `03-ui-protections.js` um ca. 115 Zeilen Keydown-Interceptor erleichtern.
  3. Toast-System (`32-toast.js`) auf die native HTML Popover API (`popover="manual"`) umstellen. Mounten im Browser Top-Layer, Transitions über CSS `@starting-style` ohne JS-Timer.
  4. Sidebar-Schalter auf semantisches `<input type="checkbox" switch>` umstellen.
* **Aufwand:** ~1,5 Stunden.
* **Nutzen:** ~250 Zeilen weniger JavaScript, robuste Barrierefreiheit, z-index-Kämpfe gehören der Vergangenheit an.

---

### ⚪ Priorität 6: Automatische Quartals-Pipeline für Open-Data
* **Problem:** Postleitzahlen, Ortsumbenennungen und Großempfänger-Codes ändern sich gelegentlich.
* **Lösung:**
  1. GitHub Action `.github/workflows/update_plz_pipeline.yml` aus `research/research_scripts/` aktivieren.
  2. Quartalsweiser Cron-Job ruft Open-Data der Deutschen Post Direkt und von Destatis ab.
  3. Führt `update_plz_pipeline.py` aus, komprimiert die 72 KB Brotli-Payload neu und stellt einen automatischen Pull Request bereit.
* **Aufwand:** ~30 Minuten.
* **Nutzen:** Dauerhafte Wartungsfreiheit für die nächsten 10 Jahre.

---

### ⚪ Priorität 7: Optionales On-Device KI-Addon (Gemini Nano)
* **Problem:** Schreibblockaden oder unklare Formulierungen beim Briefeschreiben.
* **Lösung:**
  1. `research/roadmap/ai_assistant_addon.js` als modulares Addon in `website/js/addons/` platzieren.
  2. Nutzt die lokale Chrome Built-in AI (`window.ai` / `ai.rewriter` / `ai.writer`) ohne API-Keys und ohne Internetverbindung direkt auf der NPU/GPU des Nutzers.
  3. Strenges Opt-in mit Graceful Degradation: Auf Geräten ohne lokales Modell bleibt das Feature unsichtbar und beeinträchtigt die Kernanwendung in keiner Weise.
* **Aufwand:** ~1,5 Stunden.
* **Nutzen:** Privatsphärefreundliche, optionale KI-Hilfe für Power-User mit moderner Hardware.

---

## Historischer Ideenspeicher & Backlog

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
