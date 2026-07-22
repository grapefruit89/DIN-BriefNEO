---
aliases:
- FEATURE-INVENTORY
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: feature-inventory
status: active
tags:
- obsidian
- core
- documentation
title: 'Feature-Bestandsaufnahme: FEATURE-INVENTORY.md'
type: concept
updated: '2026-07-07'
---

# Feature-Bestandsaufnahme: FEATURE-INVENTORY.md

Dieses Dokument bietet eine vollständige, tabellarische Bestandsaufnahme aller im Refactored Baseline-Prototyp von **DIN-BriefNEO** fertig implementierten Features, geordnet nach Funktionskategorien.

---

## 📊 Feature-Inventar (Baseline-Stand)

| Kategorie | Feature / Technik | Verwendete APIs / Techniken | Status | Hinweise / Modernisierungspotenzial |
| :--- | :--- | :--- | :--- | :--- |
| **Layout & CSS** | Proportionaler CSS-Zoom | `height: 94vh`, `aspect-ratio: 210/297`, `container-type: size`, CSS units `cqw`/`cqh` | **Implementiert** | Keine JS-ResizeObserver nötig. Vollkommen flüssiges Skalieren auf allen Displays. |
| **Layout & CSS** | Absolute Viewport-Sperre | CSS `overflow: hidden` auf `html` & `body` | **Implementiert** | Verhindert native Scrollbalken für echtes App-Shell-Erlebnis. |
| **Layout & CSS** | Layout-Modus A/B Toggler | CSS-Klassen `.form-a` und `.form-b` auf `#app-shell` gekoppelt mit relativen Positionen | **Implementiert** | Wird per Knopfdruck in der Sidebar getoggelt und speichert Einstellungen. |
| **Farben & Themes** | Natives Theme-Umschalten | CSS `light-dark()`, `@media (prefers-color-scheme)`, `style.colorScheme` | **Implementiert** | Umschaltbar über Sidebar (Hell, Dunkel, Auto). JS manipuliert nur das Attribut. |
| **Farben & Themes** | OKLCH Farb-Harmonisierung | CSS `oklch()` Farbdefinitionen in `variables.css` | **Implementiert** | Extrem glatte Farbverläufe und hervorragende Kontraststufen. |
| **Text & Format** | Strikter Plaintext-Schutz | `contenteditable="plaintext-only"` auf Metadaten-Feldern | **Implementiert** | Verhindert das Einfügen von HTML-Müll nativ auf Browserebene (Chrome 148+). |
| **Text & Format** | Formatierbarer Brieftext | `contenteditable="true"` auf `#brieftext` | **Implementiert** | Ermöglicht Inline-Stile (Fett, Unterstrichen, Blockquote) im Briefkern. |
| **Text & Format** | WhatsApp-Style Popover Toolbar | `popover="manual"`, CSS Anchor Positioning | **Implementiert** | Erscheint nativ im Top-Layer direkt an der Textselektion verankert. Viewport-Ausweichmanöver werden rein CSS-basiert gesteuert. |
| **Text & Format** | Sicherer Plaintext-Paste-Filter | Event-Handler `paste` & `drop` auf `#brieftext` mit `clipboardData.getData('text/plain')` | **Implementiert** | Bereinigt eingefügten Text bedingungslos von Word- & Web-HTML-Resten. |
| **UI-Komponenten** | Toast-Notification Queue | `popover="manual"`, JS `toastQueue` Stack, CSS `@keyframes` | **Implementiert** | Stapelt Toasts nacheinander ab. JS Safety-Net (3.200ms) verhindert Blockierung im Energiesparmodus. |
| **Persistenz** | persistent Auto-Save | `localStorage` API, serialisiertes JSON in `din_draft_current` | **Implementiert** | Sichert jeden Tastendruck sofort lokal und lädt Entwurf beim Systemstart. |
| **Schriftarten** | System-Font Toggler | Deklarierte CSS-Stapel `.font-stack-sans`, `.serif`, `.mono` | **Implementiert** | Umschaltbar über Segmented Control in der Sidebar. |
| **Schriftarten** | Offline WOFF2-Uploader | FileReader API, Base64-Injektion in `@font-face` im Head | **Implementiert** | Erlaubt Offline-Uploads eigener Schriften (< 60 KB). Speichert Base64 persistent im LocalStorage. |
| **Externe APIs** | Dual-Provider Autocomplete | Asynchrones `fetch()`, Signal-Aborting, UI switches | **Implementiert** | Umschaltung Photon (Komoot/OSM) keyless vs. Geoapify Premium (API-Key über Header `X-Api-Key`). |
| **Externe APIs** | Zippopotam PLZ-Lookup | Asynchrones `fetch()` auf Zippopotam API bei 5-stelliger PLZ | **Implementiert** | Vervollständigt den Ortsnamen im Feld `#empfaenger-ort` im Hintergrund. |
| **Externe APIs** | Proximity Biasing | PLZ-Extraktion auf `#absender`, caching und Koordinaten-Injektion | **Implementiert** | Priorisiert Autocomplete-Ergebnisse im Umkreis des Absenders (+100km). |
| **Barrierefreiheit** | A11y Status-Feedback | HTML `aria-pressed` & `aria-hidden` | **Implementiert** | Gibt den Aktivitätszustand der Toolbar barrierefrei an Screenreader weiter. |
| **Druck / Export** | Druck-Souveränität | CSS `@media print` Stylesheets | **Implementiert** | Blendet Guides & Sidebar aus, erzwingt reinweißes A4-Druckbild auf Papier. |

---

## 🔗 Verweise

*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die verbotenen Praktiken dieser Features.

*   Siehe [[ADR-TECH-STACK|ADR-TECH-STACK.md]] für die detaillierten Erläuterungen der Webtechniken.

*   Siehe [[spec|spec.md]] für die ursprünglichen Baseline-Anforderungen.