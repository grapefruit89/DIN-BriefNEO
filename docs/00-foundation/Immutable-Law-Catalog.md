---
id: immutable-law-catalog
title: 'Immutable Law Catalog (MUST-USE vs FORBIDDEN)'
type: reference
status: active
created: '2026-06-26'
updated: '2026-10-02'
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

Die Browser-Baseline steht nur in [[longevity-guidelines]]: **Chrome 150+** (Chrome-only-Spezialisierung).

**Laufzeitkontext:** Die App läuft ausschliesslich über einen lokalen Webserver. `file://` ist seit
ESM + CSP kein unterstütztes Ziel mehr und darf **nicht** als Begründung für Normen herangezogen
werden — siehe [[ADR-RUNTIME-CONTEXT]]. „Offline“ bedeutet in diesem Projekt *netzunabhängig*,
nicht *serverlos*.

------

## Klassifikation

| Stufe | Bedeutung |
| :--- | :--- |
| HARD BAN | Darf nicht eingeführt oder weiterverwendet werden. |
| PREFERRED | Verbindlich bevorzugte moderne Lösung. |
| FALLBACK | Zulässig, wenn Preferred für den konkreten Fall keinen Vorteil hat oder ungeeignet ist. |
| INFO | Begründung oder Verweis, keine eigene Norm. |

Plattform-APIs in den MUST-USE-Tabellen sind PREFERRED native Lösungen. Eine neuere, stabile native Alternative darf sie nach Longevity-Check ersetzen. Das ist kein Gesetzesbruch.

------

## PART I — MUST-USE PRINCIPLES

### HTML Layer

| # | Stufe | MUST-USE | Zweck |
| :--- | :--- | :--- | :--- |
| H1 | HARD BAN Gegenteil | Semantische `<din-…>`-Tags für **instantierte** Atome der 45er Registry. Zonen sind Container, keine Atome. `customElements.define()` ist dafür nicht erforderlich. Implementierungs-Wrapper ohne Fachbedeutung sind verboten. Die Atomliste steht in der Architecture-Registry. | Eine Semantik, keine 15er Pflichtliste, keine 45 JS-Klassen |
| H2 | PREFERRED | Native Popover API wo Overlay/Toolbar/Hinweis gebraucht wird | Browser-Top-Layer statt z-index-JS |
| H3 | HARD BAN Gegenteil | `contenteditable="plaintext-only"` für Metadatenfelder | XSS- und Struktur-Schutz |
| H4 | PREFERRED | `contenteditable="true"` nur im Briefkern | kontrollierte Inline-Formatierung |
| H5 | PREFERRED | Invoker Commands (`commandfor`, `command`) wo nativ tragfähig | weniger Listener |
| H6 | PREFERRED | `<dialog>` für destruktive/modale Aktionen | Fokusfalle, Semantik |
| H7 | HARD BAN Gegenteil | `<script type="module">` | kein Bundler |
| H8 | HARD BAN Gegenteil | Kein Inline-JS außer anti-FOUC / Hydration | Trennung der Schichten |
| H9 | HARD BAN Gegenteil | Eindeutige `id`-Attribute | definiertes Targeting |
| H10 | PREFERRED | ARIA nur wo native Semantik nicht reicht | Zugänglichkeit |
| H11 | PREFERRED | `setHTML()` oder `textContent` als Default; `setHTMLUnsafe()` nur, wo ungefiltertes HTML die bewusste Anforderung ist | Ungefiltertes HTML ist der XSS-Pfad; die native Sanitizer API ist auf der Baseline da |

Es gibt keine Pflicht, ein `<meta name="chrome-minimum-version">` als Gesetz zu führen. Die Baseline steht in den Longevity-Guidelines.

### Storage & Persistence Layer

| # | Stufe | MUST-USE | Zweck |
| :--- | :--- | :--- | :--- |
| S1 | HARD BAN anderer Produktspeicher | `localStorage` für Produktdaten | **Synchron** (Boot-Restore ohne await, kein FOUC), Zero-Dependency, Datenmenge passt (ein Brief + Einstellungen). Andere Speicher-APIs sind nicht „unbrauchbar“, sondern für diesen Kontext nicht gewählt — siehe [[ADR-RUNTIME-CONTEXT]] |
| S2 | PREFERRED | JSON für gespeicherte Strukturen | prüfbares Format |
| S3 | PREFERRED | Base64 nur für optionale lokale WOFF2-Schriften | kein Font-CDN |

### Time

| # | Stufe | MUST-USE | Zweck |
| :--- | :--- | :--- | :--- |
| TM1 | HARD BAN im Produkt | `Temporal` für alle Datums-/Zeitoperationen in `website/` | `Date` ist in `website/` unzulässig. Tooling (`tools/`, `agent/`) ist ausgenommen. `moment.js`, `date-fns`, `luxon` bleiben überall verboten. |

### Tooling & Dependencies

| # | Stufe | MUST-USE | Zweck |
| :--- | :--- | :--- | :--- |
| T1 | HARD BAN Gegenteil | Zero Runtime-Dependencies | Doppelklick auf die HTML-Datei |
| T2 | HARD BAN Gegenteil | Keine CDNs im Produkt | DSGVO, Offline |
| T3 | PREFERRED | System-Font-Stacks, optionale lokale WOFF2 | Offline-Typografie |
| T4 | PREFERRED | Inline-SVG für Icons | keine Icon-Fonts |
| T5 | HARD BAN Gegenteil | Node-Werkzeuge nur Entwicklung, nicht Auslieferung | Grenze Produkt / Tooling |

### Color

| # | Stufe | Regel | Zweck |
| :--- | :--- | :--- | :--- |
| C1 | PREFERRED / FALLBACK | Farbkette **OKLCH → Lab/LCH → HSL → RGB → HEX → Named**. OKLCH ist Stufe 1. Eine niedrigere Stufe nur, wenn die höhere für den Fall keinen sinnvollen Vorteil bietet oder ungeeignet ist. | moderne Farbe ohne Verbot sinnvoller Tokens wie `#fff` |

### Documentation

| # | Stufe | MUST-USE | Zweck |
| :--- | :--- | :--- | :--- |
| D1 | PREFERRED | Markdown + YAML-Frontmatter für Specs, ADRs, Guides | diff- und maschinenlesbar |
| D2 | HARD BAN Gegenteil | Agenten **referenzieren** Constitution, Catalog und Spec per ID | keine Volltext-Spiegelung |
| D3 | HARD BAN Gegenteil | Entwicklungs-Wissensbasis darf den Catalog **indexieren**, nicht als zweite Gesetzesschrift führen | eine SSoT |

------

## PART II — FORBIDDEN ANTIPATTERNS

Soweit nicht anders markiert: HARD BAN.

### Time

| # | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- |
| A48 | `new Date()`, `Date.parse`, `Date.now` als Zeitquelle in `website/`; `moment.js`, `date-fns`, `luxon` überall | `Temporal` in `website/` | HARD BAN im Produkt. Gilt für `website/**`. `tools/`, `agent/` dürfen `Date` nutzen. Legacy-Date-Libraries bleiben projektweit verboten. |
| A50 | `Temporal.Now.plainDateISO()` (und andere `Temporal.Now`-Ableitungen) **ohne explizite IANA-Zeitzone** in `website/` | `Temporal.Now.zonedDateTimeISO('Europe/Berlin').toPlainDate().toString()` — zentral in `47-date-format.js` (`currentISODate()`), referenziert statt neu geschrieben | Ohne Zone nutzt `plainDateISO()` die System-Zeitzone (UTC in CI/VMs/Servern); zwischen 00:00 und ~02:00 deutscher Zeit liefert sie den Vortag → Dateiname/Metadaten widersprechen dem Briefdatum. „Heute" lebt in genau einem Modul (Single Source of Truth). |

### Color, CSS, Struktur

| # | Stufe | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- | :--- |
| A16–A20 | FALLBACK-Politik | Farbe **oberhalb** der benötigten Kettenstufe ohne Vorteil erzwingen oder die Kette ignorieren | C1: OKLCH → Lab/LCH → HSL → RGB → HEX → Named | OKLCH bleibt Standard #1; Hex/RGB/HSL/Named sind nicht kategorisch verboten |
| A21 | HARD BAN | CSS-Preprozessoren | natives Nesting + Custom Properties | kein Build |
| A22 | HARD BAN | CSS-in-JS | Stylesheets | JS-Overhead, FOUC, bricht `@layer`-Kaskade und CSP ohne `unsafe-inline` |
| A23 | HARD BAN | `@import` in CSS-Dateien | `<link>` | Ladeblockade |
| A24 | HARD BAN | Produkt-Token ohne Definition in `:root` | Token in `:root` als Literal oder `var(--x, literal)` anlegen. Verbraucher dürfen `var(--token)` nutzen, wenn `--token` in `:root` steht. Rohe `var(--undeclared)` ohne Fallback bleiben verboten. | stilles Versagen |
| A25 | HARD BAN | Inline `style` für Farbe/Layout (`style.color`, `style.background`, `style.display`) | CSS | Ausnahme: kurzlebige Koordinaten am Selektionsanker; CSS Custom Properties für UI-Zustand (Dimmer, Signatur-Transform, Swipe) dürfen per JS gesetzt werden |
| A26 | HARD BAN | `filter: invert(1)` für Dark Mode | `light-dark()` | zerstört Papierfarbe |
| A42 | HARD BAN | doppelte `id` | eindeutige `id` | undefiniertes DOM |
| A43 | HARD BAN | unkontrolliertes Dokument-/Seiten-Scrolling | `overflow` am Dokument begrenzen; internes Scrollen MAY in abgegrenzter UI | Viewport bleibt Brief-Arbeitsfläche |
| A44 | HARD BAN | generisches `div`/`span` **für ein instantiiertes Registry-Atom** | kanonisches `<din-…>` | Kompositionsflächen (gemeinsame Namenszeile) und reine UI dürfen generisch bleiben |
| A45 | HARD BAN | jede Referenz aus `website/` heraus: `../..`, `/docs/`, `/tools/`, absolute Dateisystempfade, sowie **ladende** Verweise (Script/Style/Font/Bild) auf fremde Hosts | ausschliesslich Pfade **relativ innerhalb** `website/` | **`website/` ist auslieferbar.** Kopiert man den Ordner allein auf einen Webserver, muss die App vollstaendig starten — kein `docs/`, kein `tools/`, kein Repo drumherum. Erzwungen von `tools/isolation.js`. Ausgenommen: `@adr`/`@guide`-Kommentare (Traceability ohne Laufzeitwirkung) und optionale Fach-APIs per `fetch()` nach der A38-Allowlist. |
| A46 | HARD BAN | `page-break-before: always` auf Layout-Wurzeln | kontrolliertes Print | leere erste PDF-Seite. **Gegenpflicht:** Sperrt der Viewport per `overflow: hidden` + `height: 100vh` (A43), MUSS `@media print` ihn mit `html, body { overflow: visible; height: auto; }` wieder freigeben — sonst schneidet der Druck ab oder bleibt leer. |
| A47 | HARD BAN | komplexe UI in `contenteditable="true"` | Geschwister außerhalb des Edit-Roots | Browser löscht Innenstruktur |
| A49 | HARD BAN | JS-basiertes Text-Fitting & DOM-Layout-Polling (`scrollWidth > clientWidth`, MutationObserver für Textanpassung, `48-text-fit.js`) | CSS `field-sizing: content`, `overflow: clip`, `text-wrap: balance/pretty`, CSS `text-fit: shrink 60%` | Verursacht Layout Thrashing, Ruckeln und JS-Overhead. Natives CSS löst die dynamische Feld- und Textanpassung performant und 100% deklarativ. |

### Storage & Netz

| # | Stufe | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- | :--- |
| A34 | HARD BAN in diesem Produkt | IndexedDB **als Produktspeicher in dieser App** | `localStorage` | Asynchron → Boot-Restore bräuchte await und erzeugt FOUC; Transaktions-Overhead ohne Nutzen bei einem Brief. Kein generelles Verdikt über IndexedDB |
| A35 | HARD BAN in diesem Produkt | OPFS als Produktspeicher | `localStorage` | Für den Nutzer unsichtbarer Speicher (nicht im Dateisystem auffindbar), asynchron, Worker-nah — kein Gewinn gegenüber localStorage bei dieser Datenmenge |
| A36 | HARD BAN in diesem Produkt | File System Access API als **Pflicht**-Speicher | `localStorage` | Erzwingt für jeden Autosave eine Nutzergeste/Permission; als freiwilliger Export-Weg zulässig (siehe `52-import-export.js`) |
| A37 | HARD BAN in diesem Produkt | Service Worker | relative lokale Pfade | Cache-Invalidierung ist eine dauerhafte Wartungslast (Longevity-Ziel: null Wartung); die App lädt ohnehin rein lokal, es gibt nichts zu cachen |
| A38 | HARD BAN | externe CDNs und fremde Script-/CSS-Assets | lokale Ressourcen | Offline / DSGVO. Optionale Fach-APIs sind keine CDNs. Allowlist: Geoapify Geocoding, Photon (optionale Tier-2-Dienste; Grunddaten laufen primär über das lokale 70,5 KB Brotli-Dictionary laut ADR-006). Ohne Key bleibt das optionale Cloud-Feature tot. Kein Host darf Script, Font oder Stylesheet liefern. |

### Abhängigkeiten & Build

| # | Stufe | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- | :--- |
| A51 | HARD BAN | Frontend-Frameworks (React, Vue, Svelte, Angular, jQuery) und Build-/Bundler-Schritte (Vite, Webpack, Rollup, Parcel) als Produktbestandteil | Vanilla HTML + CSS + JS-ESM | Jedes Framework zieht eine Toolchain nach, die das Produkt an eine Ökosystem-Generation bindet. Longevity-Ziel ist null Wartung. Node-Werkzeuge in `tools/` bleiben zulässig (T5). |
| A53 | HARD BAN | Utility-Bibliotheken (Lodash, Underscore) und Produkt-Transpiler (TypeScript-Compile, Babel) im Auslieferungspfad | native Array-/Objekt-Methoden; JSDoc + `checkJs` für Typprüfung ohne Compile | ES2023+ deckt den Bedarf nativ. Ein Pflicht-Compile-Schritt macht die ausgelieferte Datei zum Artefakt statt zur Quelle. |
| A54 | HARD BAN | JS-Animationsbibliotheken (GSAP, Anime.js, Motion One) | CSS Transitions, `@keyframes`, `@starting-style`, `transition-behavior: allow-discrete`, View Transitions | Läuft auf dem Compositor statt im Main Thread, ohne Laufzeit-Abhängigkeit. |

### JavaScript statt Plattform

| # | Stufe | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- | :--- |
| A52 | HARD BAN | `document.execCommand()` in jeder Form — auch `'insertText'`, `'undo'`, `'bold'` | Selection & Range API (`deleteFromDocument()`, `range.insertNode()`); Undo über den History-Stack des `DraftManager` | Deprecated, in Randfällen browserabhängig, und das native Undo kollidiert mit dem eigenen Snapshot-Stack. |
| A55 | HARD BAN | JS-Interzeptoren, die Formatierung auf Plaintext-Feldern abfangen (`beforeInputFormatTypes`, `beforeInputParagraphTypes`, Regex-Sanitizer in `input`-Listenern) | `contenteditable="plaintext-only"` + `enterkeyhint` | Die Engine erzwingt das auf C++-Ebene lückenlos; die JS-Nachbildung war lückenhaft und teuer. |
| A56 | HARD BAN | manuelle Pointer-Drag-Schleifen (`pointerdown`/`pointermove`/`setPointerCapture`) für Swipe-to-Dismiss und manuelle `z-index`-Stapelung bei Toasts | Popover API (`popover="manual"`) im nativen Top-Layer + deklarative CSS-Transitions | Top-Layer beendet den z-index-Wettlauf mit Modals; 60+ Zeilen Pointer-Logik entfallen. |
| A61 | HARD BAN | **Schreibender** `innerHTML`-Zugriff und `setHTMLUnsafe()` zum Parsen von HTML-Strings | `setHTML()`, oder `DOMParser` + `replaceChildren(...doc.body.childNodes)` | XSS-Pfad. **Lesender** `.innerHTML`-Zugriff zum Serialisieren eines Entwurfs ist ausdrücklich zulässig — nur das Zurückschreiben muss gefiltert laufen. |

### UI-Zustand & Semantik

| # | Stufe | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- | :--- |
| A57 | HARD BAN für neue Schalter | **binäre** Ein/Aus-Schalter als doppelte `<input type="radio" class="sr-only">` + zwei `<label>` + JS-Zustandssync | `<input type="checkbox" switch>`, Zustand per `:has(#schalter:checked)` | Halber DOM, kein JS. **Abgrenzung zu A60:** mehrwertige Schalter (3+ Zustände, z. B. Form A/B/C) bleiben Radio-Gruppen mit `:has()` — verboten ist nur der Radio-Nachbau eines Booleans. Bestand (`#btn-form-a`) ist bestandsgeschützt. |
| A58 | HARD BAN | Theme-Wahl als Radio-Segmented-Control mit je einem Button pro Modus | ein zyklischer Toggle (`Auto → Hell → Dunkel`) auf `:root[data-theme]`, dazu `light-dark()` und `color-scheme: light dark` | Zwei Radios können „Auto (System)" baulich nicht ausdrücken und verbrauchen zwei Klickziele. |
| A60 | HARD BAN | globalen UI-Zustand per JS-Klassen schalten (`classList.add('active')` auf Wrapper, um Sektionen ein-/auszublenden) | versteckter nativer Schalter + `:has()` im CSS; JS **nur** für Anti-FOUC-Restore beim Boot und zum Persistieren im `change`-Handler | Der Zustand lebt im DOM statt in einer JS-Variable, ist tastaturbedienbar und überlebt ohne Sync-Code. |
| A62 | HARD BAN | aktive Zustände von Bedienelementen über `classList.add('active')` ausdrücken | `aria-pressed="true\|false"`, Styling per `button[aria-pressed="true"]` | Eine Quelle für Semantik **und** Styling; Screenreader bekommen den Zustand geschenkt. |

### Theming & Papier

| # | Stufe | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- | :--- |
| A59 | HARD BAN | theme-abhängige Variablen (`--text-primary`, `--bg-surface`) **auf dem DIN-A4-Blatt** verwenden | papier-eigene Token (`--paper-bg`, `--paper-text`) oder feste `oklch()`-Werte | Das Blatt ist WYSIWYG-Abbild des Druckprodukts: **Papier ist weiß, Tinte ist schwarz** — auch im Dark Mode. Das UI-Theme darf nur Sidebar und Viewport-Hintergrund färben (ergänzt A26). |

### Icons & Fonts

| # | Stufe | ANTIPATTERN | Ersatz | Grund |
| :--- | :--- | :--- | :--- | :--- |
| A39 | HARD BAN | Icon-CDNs | Inline-SVG | Offline / DSGVO |
| A40 | HARD BAN | Icon-Fonts | Inline-SVG | unnötige Last |
| A41 | HARD BAN | Google Fonts / Font-Dienste | Systemfonts + optionale lokale WOFF2 | Offline / DSGVO |

------

## PART III — SINGLE SOURCE, KEINE 15 KOPIEN

Der Catalog existiert **einmal**. Andere Dokumente verlinken ihn.

Zulässig: Verweis, generierter Suchindex, Agent-Kontext mit Link/ID.
Unzulässig: den Volltext in Constitution, README, GEMINI, Review-Checklisten und Datenbank-„Gesetzesduplikaten“ zu spiegeln.

> [!warning] Vollzug 2026-10-02
> `ADR-ANTIPATTERN.md` war genau so ein Duplikat: eine zweite, parallel gepflegte Verbotsliste
> mit eigener Nummerierung (`Abschnitt 0–18`). Sie wurde **aufgelöst** — ihre Verbote stehen
> jetzt als `A51`–`A62`, `H11` hier, ihre Begründungen in den thematischen ADRs.
> Code und Doku referenzieren Gesetze **nur noch über die A-/H-/S-/T-ID**, nie über eine
> Abschnittsnummer. Siehe [[DECISION-LOG]], Eintrag 2026-10-02.

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

Code und Vorschläge, die ein HARD BAN einführen, werden zurückgewiesen.
PREFERRED darf nur zugunsten einer nach Longevity geprüften neueren nativen API weichen.
FALLBACK darf die höhere Kettenstufe nicht ohne konkreten Grund unterlaufen.
Agenten lesen dieses Dokument; sie kopieren es nicht in jedes Prompt.

**Dieses Dokument gilt ab sofort und ersetzt frühere MUST-USE-Listen mit festen Custom-Element-Katalogen und das Redundant-Embedding-Mandat E1–E15.**
