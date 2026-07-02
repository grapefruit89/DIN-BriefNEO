---
title: Taskliste: Phase 2 (Code-Refactoring & WhatsApp-Style Editor)
status: active
tags: [documentation, tasks, todo]
---

> [!WARNING]
> **ARCHIVIERT**: Veraltete Taskliste aus Phase 2. Nur zu historischen Zwecken hier abgelegt.


# Taskliste: Phase 2 (Code-Refactoring & WhatsApp-Style Editor)

Dieses Dokument dient als abarbeitbare Taskliste für die anstehenden Code-Modifikationen im Workspace.

---

- [x] **⚙️ Schritt 1: constants.js (Zentralisierung aller UI-Meldungen & Toasts)**
  - [x] Alle systemweiten Toast-Meldungen (Erfolg, Info, Warnung, Fehler) aus `Constants` importieren
  - [x] Systemgrenzen (z. B. Dateigröße 60 KB, 1-Font-Limit) festlegen
  
- [x] **🎨 Schritt 2: reset.css & variables.css (Offline-Schriften & Themes)**
  - [x] Google Fonts entfernen
  - [x] Serifenlosen, DIN-konformen cross-plattform Font-Stack deklarieren (AptosCustom, Aptos, Segoe UI, Roboto, Helvetica, Arial)
  - [x] OKLCH-Farbräume für Light-/Dark-Mode mit `light-dark()` einpflegen
  
- [x] **📐 Schritt 3: layout.css (Elastischer Viewport & Proportionales Container-Modell)**
  - [x] `#viewport` auf `overflow: auto` einstellen und Zoom-Faktoren entfernen
  - [x] `<din-a4>` auf `height: 94vh; aspect-ratio: 210/297; container-type: size;` umstellen
  - [x] Alle physischen mm-Werte in relative Container-Query-Einheiten (`cqw`/`cqh`) überführen
  - [x] Brieftext-Editor `<din-text>` (oder `#brieftext`) mit Inline-Formatierungs-Unterstützung stylen
  - [x] Druck-Overrides (`@media print`) deklarieren (ausgeblendete Ränder/Sidebar, exakte A4-Skalierung)
  
- [x] **🔔 Schritt 4: floating.css (Popovers, Toasts & Text-Selection Toolbar)**
  - [x] Premium-Toast-Styles für `#toast-v4` mit `toast-platinum-cycle` Keyframes anlegen
  - [x] CSS-Styles für das Textauswahl-Formatting-Popover `#format-toolbar` entwerfen
  
- [x] **📄 Schritt 5: index.html (Custom Elements, Popovers & Toolbar)**
  - [x] Custom Elements (`<din-absender>`, `<din-anschriftfeld>`, `<din-infoblock>`, `<din-fuss>`) anlegen
  - [x] Textauswahl-Formatierungs-Toolbar `#format-toolbar` als Popover-Element (`popover="manual"`) deklarieren
  - [x] Offline-Font-Uploader-Schaltflächen in die Sidebar einfügen
  - [x] Popover-Toast `<div id="toast-v4" popover="manual">` einbetten
  
- [x] **⚡ Schritt 6: storage.js & main.js (Logik, Paste-Filter, Font-Uploader & Popover-Toolbar)**
  - [x] `storage.js` um Speicherfunktionen für Custom Fonts (1-Font-Limit Überschreiben) erweitern
  - [x] `main.js` Bootloader für Font-Injektion und Draft-Recovery schreiben
  - [x] Offline-Font-Uploader Logik implementieren (Base64-Konvertierung, Validation < 60 KB, localStorage-Sync)
  - [x] HTML-Paste-Filter zur Plaintext-Bereinigung einbauen
  - [x] Drag-and-Drop Filter zur Plaintext-Bereinigung einbauen
  - [x] Selection-Event-Listener zur dynamischen Zuweisung des externen Selection-Anchors im DOM programmieren
  - [x] Deklarative Toolbar-Positionierung über CSS Anchor Positioning an --selection-anchor anbinden
  - [x] Textformatierung über Selection und Range API (Wrap/Unwrap in `<b>`/`<u>` / Zitat-Shortcut) implementieren
  - [x] Standard-Browser-Shortcuts (`Strg+B`, `Strg+U`) nativ wirken lassen (kein preventDefault)
  - [x] Toast-Popover mit discrete transition (@starting-style, transition-behavior) und nativem JS-Timer ausstatten

- [x] **📅 Schritt 7: JS Temporal API Mandat & Datum-Autobefüllung**
  - [x] Strikten Legacy Date API Ban in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md` deklarieren
  - [x] W3C Temporal API in `ADR-TECH-STACK.md` und `ADR-JS.md` als exklusive Datums-Engine dokumentieren
  - [x] Nativer Temporal API Code in `loadDraftData()` zur zeitzonensicheren, unveränderlichen und fehlerfreien Bestimmung des lokalen Systemdatums im normativem deutschen Format implementieren
  - [x] Alle Dokumentations- und Code-Änderungen in `DIN-Brief_docs.db` kompilieren

- [x] **🎨 Schritt 8: CSS @scope Isolation & OKLCH Farbmandat**
  - [x] Briefblatt-Stile in `layout.css` innerhalb von `@scope (din-a4)` kapseln
  - [x] Alle HEX, RGBA und Named Colors im CSS und HTML in pure OKLCH-Farben konvertieren
  - [x] Reaktiven Parent Selector `:has()` für Briefbogen-Fokusierungen in `layout.css` implementieren
  - [x] Striktes OKLCH-Farbmandat und Verbot klassischer Farbräume in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md` verankern
  - [x] Alle neuen Änderungen in `DIN-Brief_docs.db` kompilieren

- [x] **🔒 Proaktive Verfassungs-Ausweitung (Antipatterns 8 bis 12)**
  - [x] Sass/Less/CSS-in-JS Verbot (Antipattern 8) in Doku verankern
  - [x] Icon-CDNs & Icon-Fonts Verbot (Antipattern 9) in Doku verankern
  - [x] Lodash & TS-Transpiler Verbot (Antipattern 10) in Doku verankern
  - [x] GSAP & JS-Animations-Libs Verbot (Antipattern 11) in Doku verankern
  - [x] Inline-Styles Verbot für Farben/Layouts (Antipattern 12) in Doku verankern
  - [x] Re-Kompilierung der SQLite-Wissensdatenbank durchführen
