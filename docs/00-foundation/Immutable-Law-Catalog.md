---
id: immutable-law-catalog
title: 'Immutable Law Catalog (MUST-USE vs FORBIDDEN)'
type: reference
status: active
created: '2026-06-26'
updated: '2026-09-02'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/reference
doc_links:
  - constitution
  - longevity-guidelines
  - spec
code_links: []
error_patterns:
  - must-use
  - antipattern
  - forbidden
  - law catalog
  - technology catalog
  - banned
  - must-use replacement
supersedes: []
depends_on: []
---

# DIN-BriefNEO — Architectural Law: MUST-USE vs. ANTIPATTERN

**Status:** Bindend. Änderungen nur per ADR und menschlichem Entscheid.
**Override:** Jede Änderung referenziert dieses Dokument in einer ADR.

Dieses Dokument ist die autoritative Quelle für Verbote und Plattformprinzipien. Es wird **referenziert**, nicht an fünfzehn Stellen kopiert. Es enthält nicht die 45 Atomnamen und nicht die DIN-Millimeter.

Die Browser-Baseline steht nur in [[longevity-guidelines]].

------

## PART I — MUST-USE PRINCIPLES

Plattform-APIs in den Tabellen sind die **bevorzugte native Lösung**. Eine neuere, stabile native Alternative darf sie nach Longevity-Check ersetzen. Das ist kein Gesetzesbruch.

### HTML Layer

| # | MUST-USE | Zweck |
| :--- | :--- | :--- |
| H1 | Semantische `<din-…>`-Tags für **instantierte** Atome der 45er Registry. Zonen sind Container, keine Atome. `customElements.define()` ist dafür nicht erforderlich. Implementierungs-Wrapper ohne Fachbedeutung sind verboten. Die Atomliste steht in der Architecture-Registry. | Eine Semantik, keine 15er Pflichtliste, keine 45 JS-Klassen |
| H2 | Native Popover API wo Overlay/Toolbar/Toast gebraucht wird | Browser-Top-Layer statt z-index-JS |
| H3 | `contenteditable="plaintext-only"` für Metadatenfelder | XSS- und Struktur-Schutz |
| H4 | `contenteditable="true"` nur im Briefkern | kontrollierte Inline-Formatierung |
| H5 | Invoker Commands (`commandfor`, `command`) wo nativ tragfähig | weniger Listener |
| H6 | `<dialog>` für destruktive/modale Aktionen | Fokusfalle, Semantik |
| H7 | `<script type="module">` | kein Bundler |
| H8 | Kein Inline-JS außer anti-FOUC / Hydration | Trennung der Schichten |
| H9 | Eindeutige `id`-Attribute | definiertes Targeting |
| H10 | ARIA nur wo native Semantik nicht reicht | Zugänglichkeit |

Es gibt keine Pflicht, ein `<meta name="chrome-minimum-version">` als Gesetz zu führen. Die Baseline steht in den Longevity-Guidelines.

### Storage & Persistence Layer

| # | MUST-USE | Zweck |
| :--- | :--- | :--- |
| S1 | `localStorage` für Produktdaten | Offline / `file://`. Andere Speicher-APIs sind nicht „unbrauchbar“, sondern für diesen Kontext nicht gewählt |
| S2 | JSON für gespeicherte Strukturen | prüfbares Format |
| S3 | Base64 nur für optionale lokale WOFF2-Schriften | kein Font-CDN |

### Tooling & Dependencies

| # | MUST-USE | Zweck |
| :--- | :--- | :--- |
| T1 | Zero Runtime-Dependencies | Doppelklick auf die HTML-Datei |
| T2 | Keine CDNs im Produkt | DSGVO, Offline |
| T3 | System-Font-Stacks, optionale lokale WOFF2 | Offline-Typografie |
| T4 | Inline-SVG für Icons | keine Icon-Fonts |
| T5 | Node-Werkzeuge nur Entwicklung, nicht Auslieferung | Grenze Produkt / Tooling |

### Documentation

| # | MUST-USE | Zweck |
| :--- | :--- | :--- |
| D1 | Markdown + YAML-Frontmatter für Specs, ADRs, Guides | diff- und maschinenlesbar |
| D2 | Agenten **referenzieren** Constitution, Catalog und Spec per ID | keine Volltext-Spiegelung |
| D3 | Entwicklungs-Wissensbasis darf den Catalog **indexieren**, nicht als zweite Gesetzesschrift führen | eine SSoT |

------

## PART II — FORBIDDEN ANTIPATTERNS

### Color, CSS, Struktur

| # | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- |
| A16–A20 | Hex / rgb / hsl / Named Colors / `transparent` als Design-Tokens | `oklch()` bzw. `oklch(… / 0)` | einheitlicher Farbraum |
| A21 | CSS-Preprozessoren | natives Nesting + Custom Properties | kein Build |
| A22 | CSS-in-JS | Stylesheets | JS-Overhead, `file://` |
| A23 | `@import` in CSS-Dateien | `<link>` | Ladeblockade |
| A24 | `var()` ohne Fallback | `var(--prop, fallback)` | stilles Versagen |
| A25 | Inline `style` für Farbe/Layout | CSS | Ausnahme: kurzlebige JS-Koordinaten für Selektionsanker |
| A26 | `filter: invert(1)` für Dark Mode | `light-dark()` | zerstört Papierfarbe |
| A42 | doppelte `id` | eindeutige `id` | undefiniertes DOM |
| A43 | unkontrolliertes Dokument-/Seiten-Scrolling | `overflow` am Dokument begrenzen; internes Scrollen MAY in abgegrenzter UI | Viewport bleibt Brief-Arbeitsfläche |
| A44 | generisches `div`/`span` **für ein instantiiertes Registry-Atom** | kanonisches `<din-…>` | Kompositionsflächen (gemeinsame Namenszeile) und reine UI dürfen generisch bleiben |
| A45 | projektfremde Pfade/Kontexte in der App | hermetische Grenzen | Kontamination |
| A46 | `page-break-before: always` auf Layout-Wurzeln | kontrolliertes Print | leere erste PDF-Seite |
| A47 | komplexe UI in `contenteditable="true"` | Geschwister außerhalb des Edit-Roots | Browser löscht Innenstruktur |

### Storage & Netz

| # | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- |
| A34 | IndexedDB **als Produktspeicher in dieser App** | `localStorage` | Entscheidung für `file://`, kein generelles Verdikt über IndexedDB |
| A35 | OPFS als Produktspeicher | `localStorage` | unzuverlässig unter `file://` im Zielkontext |
| A36 | File System Access API als Pflicht-Speicher | `localStorage` | braucht sicheren Kontext |
| A37 | Service Worker unter `file://` | relative lokale Pfade | Registration scheitert unter `file://` |
| A38 | externe CDNs | lokale Ressourcen | Offline / DSGVO |

### Icons & Fonts

| # | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- |
| A39 | Icon-CDNs | Inline-SVG | Offline / DSGVO |
| A40 | Icon-Fonts | Inline-SVG | unnötige Last |
| A41 | Google Fonts / Font-Dienste | Systemfonts + optionale lokale WOFF2 | Offline / DSGVO |

------

## PART III — SINGLE SOURCE, KEINE 15 KOPIEN

Der Catalog existiert **einmal**. Andere Dokumente verlinken ihn.

Zulässig: Verweis, generierter Suchindex, Agent-Kontext mit Link/ID.
Unzulässig: den Volltext in Constitution, README, GEMINI, Review-Checklisten und Datenbank-„Gesetzesduplikaten“ zu spiegeln.

------

## PART IV — AMENDMENT PROTOCOL

1. ADR, die dieses Dokument explizit referenziert.
2. Technische Begründung, keine bloße Meinung.
3. Freigabe durch die aktiven Projektverantwortlichen.
4. Nach Freigabe dieser Catalog und die direkten Verweise aktualisieren — nicht fünfzehn Kopien.
5. Entwicklungs-Index bei Bedarf neu aufbauen.

Keine Änderung gilt, bevor 1–4 erledigt sind.

------

## PART V — ENFORCEMENT

Code und Vorschläge, die ein ANTIPATTERN einführen, werden zurückgewiesen.
Agenten lesen dieses Dokument; sie kopieren es nicht in jedes Prompt.

**Dieses Dokument gilt ab sofort und ersetzt frühere MUST-USE-Listen mit festen Custom-Element-Katalogen und das Redundant-Embedding-Mandat E1–E15.**
