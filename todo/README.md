# DIN-BriefNEO — Zentrale To-Do- & Roadmap-Übersicht

> **Zentrale Sammelstelle für alle offenen Aufgaben, Pläne und Roadmap-Themen.**  
> Alle Detailpläne liegen direkt hier in diesem Ordner (`/home/moritz/repos/DIN-BriefNEO/todo/`).

---

## 🎯 Schnelle Übersicht & Prioritäten

| # | Vorhaben | Aufwand | ROI | Detailplan / Referenz | Status |
|---|---|---|---|---|---|
| **01** | **Mehrseitenunterstützung nach DIN 5008** | L–XL | ⭐⭐⭐⭐⭐ | [`01-mehrseiten-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/01-mehrseiten-plan.md) | In Vorbereitung (Strategie A) |
| **02** | **PWA & Offline-App (Chrome 150+)** | M | ⭐⭐⭐⭐⭐ | [`02-pwa-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/02-pwa-plan.md) | 5-Phasen-Konzept fertig |
| **03** | **Mobile Ansicht & Touch-UX** | M | ⭐⭐⭐⭐ | [`03-mobile-ansicht-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/03-mobile-ansicht-plan.md) | Dialog-Bottom-Sheet Konzept |
| **04** | **Telefonnummer-Formatierung DIN 5008** | M | ⭐⭐ | [`04-telefonnummer-formatierung-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/04-telefonnummer-formatierung-plan.md) | Ausgearbeitet (Blur / Helper) |
| **05** | **Brief-Verlauf & Historie (`din_history`)** | S–M | ⭐⭐⭐⭐ | [`05-brief-history-verlauf-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/05-brief-history-verlauf-plan.md) | Ausgearbeitet (10er Ringspeicher) |
| **06** | **Subpixel-Falzmarken (SVG vs. CSS)** | S | ⭐⭐⭐ | [`06-subpixel-falzmarken-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/06-subpixel-falzmarken-plan.md) | Ausgearbeitet (0,25 mm SVG) |
| **07** | **Micro-Copyfitting & 1-Seiten-Kompaktsatz** | M | ⭐⭐ | [`07-micro-copyfitting-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/07-micro-copyfitting-plan.md) | Ausgebaut / Konzeptphase |
| **08** | **Testbrief-Erzählung: Anlass × Besetzung × Lore-Anker** | L | ⭐⭐⭐⭐⭐ | [`08-testbrief-erzaehlung-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/08-testbrief-erzaehlung-plan.md) | Konzept (adaptiert, 3 Startanlässe) |
| **09** | **Modernisierung der Text- und Address Intelligence** | M | ⭐⭐⭐⭐⭐ | [`09-text-parsing-modernization-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/09-text-parsing-modernization-plan.md) | Konzept (Segmenter / RegExp /v / 3-Stufen) |
| **10** | **Mikro-Typografie nach DIN 5008 (§ 7.2 & § 8.2)** | S–M | ⭐⭐⭐⭐⭐ | [`10-mikro-typografie-autokorrektur-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/10-mikro-typografie-autokorrektur-plan.md) | Ausgearbeitet (Geschützte Leerzeichen & Gedankenstrich) |
| **11** | **Sensibler Betreff (§ 20.9.2 Kuvertschutz)** | XS | ⭐⭐⭐⭐ | [`11-sensibler-betreff-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/11-sensibler-betreff-plan.md) | Ausgearbeitet (2 Leerzeilen Tieferstellung via CSS `:has`) |
| **12** | **Teilbetreff nach DIN 5008 (§ 20.9.3)** | XS–S | ⭐⭐⭐ | [`12-teilbetreff-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/12-teilbetreff-plan.md) | Ausgearbeitet (Zwischenüberschriften im Text) |

---

## 📋 Detailübersicht der Vorhaben

### 1. Mehrseitenunterstützung (DIN 5008)
- **Fokus:** Mehrseitige Briefe mit normgerechter Zonierung.
- **Wichtigste Punkte:**
  - Falz- und Lochmarken auf jeder Seite.
  - Folgeseiten-Kopf bei 20 mm von der oberen Blattkante (`<din-folgeseitenkopf>`).
  - Fortsetzungsvermerk (`...`) deklarativ per `:has()` auf Nicht-Letztseiten.
  - Paginierung nach DIN 5008 Kap. 20.17 (`<din-seitenangabe>` mit „Seite X von Y“).
  - Horizontales Paging-Karussell im Editor (Zero-Scroll-Garantie **A43**).
  - Nativer Druckumbruch (`break-after: page`).
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/01-mehrseiten-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/01-mehrseiten-plan.md)

### 2. PWA & Installierbare Offline-Web-App
- **Fokus:** Nahtlose Desktop-Installation ohne Electron/Build-Schritt.
- **Wichtigste Punkte:**
  - `manifest.webmanifest` mit `launch_handler: { client_mode: "focus-existing" }`.
  - Dateiverknüpfung (`file_handlers`) für `.dinbrief.json`.
  - Service Worker `sw.js` mit Chrome 150+ Static Routing API (`event.addRoutes()`).
  - Cache-Versionierung und `navigator.storage.persist()`.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/02-pwa-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/02-pwa-plan.md)

### 3. Mobile Ansicht & Touch-UX
- **Fokus:** Hervorragende Bedienbarkeit auf Smartphones und Tablets.
- **Wichtigste Punkte:**
  - Native `<dialog>`-Seitenleiste als modales Bottom-Sheet auf Bildschirmen < 768 px.
  - Zoombarer DIN-A4-Viewport mit horizontalem Scroll oder Fokus-Overlay.
  - Mindest-Touch-Target von 48×48 px für alle interaktiven Controls.
  - Native Popover-Positionierung mit `@position-try`.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/03-mobile-ansicht-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/03-mobile-ansicht-plan.md)

### 4. Telefonnummern-Formatierung nach DIN 5008 & Durchwahl-Erhalt
- **Fokus:** Gliederung deutscher und internationaler Rufnummern inkl. Erhalt des Bindestrichs als semantischer Durchwahl-Marker (z. B. `0151 1234567-89` → `+49 151 1234567-89`).
- **Wichtigste Punkte:**
  - Formatierung beim Verlassen des Feldes `#absender-tel` (`blur`-Handler).
  - Pure Hilfsfunktion `formatGermanPhone(input)` in `website/js/document.js`.
  - Trennung: Bindestrich vor dem Strippen isolieren und formatiert wieder anhängen (`-DW`).
  - Sichere Mobilfunk-Erkennung (`015x`–`017x`).
  - Offene Nutzerentscheidung: Durchwahl-Bindestrich auch bei Mobilfunk, sowie BNetzA-Ortsnetz-Lookup vs. Mobilfunk-only.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/04-telefonnummer-formatierung-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/04-telefonnummer-formatierung-plan.md)

### 5. Brief-Verlauf & Historie (`din_history`)
- **Fokus:** Schutz vor Datenverlust & Versionierung der letzten Entwürfe.
- **Wichtigste Punkte:**
  - Maximal 10 Briefstände im FIFO-Ringspeicher in `localStorage`.
  - Speichern bei PDF/Druck und über expliziten UI-Button.
  - Wiederherstellung über `restoreState` mit striktem `sanitizeRichText`-Filter.
  - Schlanke `<details>`-Liste in der Seitenleiste.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/05-brief-history-verlauf-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/05-brief-history-verlauf-plan.md)

### 6. Subpixel-Falz- und Lochmarken
- **Fokus:** Präzision beim Drucken und PDF-Export.
- **Wichtigste Punkte:**
  - Ersatz von CSS-Border (`1px solid`) durch inline SVG mit fester Stärke `0.25mm`.
  - Beseitigung von Rundungsunschärfen und Hairline-Druckfehlern.
  - Beibehaltung der deklarativen `data-*`-Koordinaten im HTML.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/06-subpixel-falzmarken-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/06-subpixel-falzmarken-plan.md)

### 8. Testbrief-Erzählung: Anlass × Besetzung × Lore-Anker
- **Fokus:** Briefe, in denen eine kanonische Figur mit einer **völlig anderen** Figur oder Institution in Kontakt tritt — die Figur bleibt in ihrer Welt, der Anlass ist Alltag (Reklamation, Termin, Auskunft).
- **Idee:** Drei unabhängige Komponenten ergeben den Brief: Absender (Figuren-JSON), Anlass (neue Szenario-Datei), Empfänger (Figuren-JSON, unabhängig gewählt). Der Kontrast erzeugt den Witz, nicht der zitierte Kanon.
- **Harte Grenze:** Szenario-Fakten sind keine Kanon-Fakten. Ein Anlass darf eine Alltagshandlung erfinden, aber keine Biografie. Fehlt eine Zutat, entfällt der Satz — nicht der Brief.
- **Anpassung an den Bestand:** `beruf`, `team` und `geschlecht` existieren nicht; Gegenstände stehen nur in `hooks` (31 von 325). Deshalb starten drei Anlässe, von denen nur die Reklamation einen Gegenstand braucht.
- **Datenbestände getrennt:** Die Figuren-JSON bleibt unverändert, die Anlässe bekommen eine eigene Datei — Dramaturgie, kein Charakterwissen.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/08-testbrief-erzaehlung-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/08-testbrief-erzaehlung-plan.md)

### 9. Modernisierung der Text- und Address Intelligence (Intl.Segmenter, RegExp /v & 3-Stufen-Pipeline)
- **Fokus:** Präzise, zero-dependency Extraktion und Zerlegung von Empfängern, Adressen und Zwischenablage-Texten.
- **Wichtigste Punkte:**
  - `Intl.Segmenter('de', { granularity: 'word' })` (ECMA-402) für native Wortsegmentierung, Bindestrich-Erhalt und Titel-Abtrennung ohne Allokationsspitzen.
  - ECMAScript 2024 RegExp `/v` Flag (`unicodeSets`) zur Beseitigung der ASCII-`\b`-Falle bei Umlauten und Abkürzungen mit Punkt (`Dr.`, `e.V.`).
  - Deterministische 3-Stufen-Pipeline für Zwischenablage-Adressen (Stufe 1: Metadata Stripper, Stufe 2: Anchor Pivot mit 5-stelliger PLZ, Stufe 3: Entity Classifier für Firma vs. Name).
  - Native Popover-Auswahl bei Mehrdeutigkeit mehrerer Adresskandidaten.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/09-text-parsing-modernization-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/09-text-parsing-modernization-plan.md)

### 10. Mikro-Typografie-Autokorrektur (DIN 5008 § 7.2 & § 8.2)
- **Fokus:** Automatisches Einfügen von geschützten Leerzeichen (`\u00A0`), um unschöne Zeilenumbrüche zu verhindern.
- **Wichtigste Punkte:**
  - Mehrteilige Abkürzungen (`z. B.`, `d. h.`, `u. a.`, `i. d. R.`).
  - Zahlen mit Einheiten und Währungscodes (`100 EUR`, `25,00 €`, `15 %`, `50 km/h`).
  - Paragrafen und Gesetzesbezeichnungen (`§ 25`, `Art. 1`).
  - Gedankenstriche (`Wort – Wort` mit geschütztem Leerzeichen davor).
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/10-mikro-typografie-autokorrektur-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/10-mikro-typografie-autokorrektur-plan.md)

### 11. Sensibler Betreff (§ 20.9.2 Kuvertschutz)
- **Fokus:** Tieferstellen des Betreffs um 2 Leerzeilen (8,46 mm), um vertrauliche Daten bei Verrutschen im Fensterumschlag vor Blicken zu schützen.
- **Wichtigste Punkte:**
  - Nativer Switch `#toggle-sensibler-betreff` in der Seitenleiste.
  - Rein deklaratives CSS via `:root:has(#toggle-sensibler-betreff:checked) #betreff`.
  - Persistenz in `din_settings`.
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/11-sensibler-betreff-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/11-sensibler-betreff-plan.md)

### 12. Teilbetreff nach DIN 5008 (§ 20.9.3)
- **Fokus:** Gliederung längerer Briefe durch fettgedruckte Zwischenüberschriften, die mit einem Punkt enden.
- **Wichtigste Punkte:**
  - Format-Snippet oder Tastatur-Shortcut für `.din-teilbetreff`.
  - Direkter Übergang in den nachfolgenden Text ohne Leerzeile.
  - CSS-Umbruchschutz (`break-after: avoid;`).
- **Dokumentation:** [`/home/moritz/repos/DIN-BriefNEO/todo/12-teilbetreff-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/12-teilbetreff-plan.md)

---

## 📌 Weitere Themen aus dem Backlog

| Backlog-ID | Thema | Aufwand | ROI |
|---|---|---|---|
| **B22** | `tools/check-geometry.js` — Automatisierter Wächter gegen hardcodierte Geometriewerte | M | ⭐⭐ |
| **B25** | Vorkonfigurierte Brief-Vorlagen (Privatbrief, Kündigung, Mahnung, formloser Antrag) | M | ⭐⭐⭐ |
| **B26** | Optionale DIN-5008-Validatoren (Anschrift-Zeilenlimit max. 6 Zeilen, IBAN Modulo-97) | S | ⭐⭐ |
| **B28** | Multi-Provider Geocoding (Nominatim, Photon, BKG Bund) | M | ⭐⭐⭐ |
| **B29**–**B30** | Geoapify Performance-Tuning (Pre-Warming, Session-Debounce, LRU-Cache, Bounding-Box) | S | ⭐⭐⭐ |
| **B31** | Native Browser-APIs (`queryLocalFonts()`, `EyeDropper`, `showPicker()`) | S | ⭐⭐ |

---

## 🚫 Bewusst verworfene Ideen & Anti-Nuggets

Um Feature Creep, Regressionen und wiederholte Schein-Optimierungen zu verhindern, werden verworfene Ansätze und deren Begründungen zentral dokumentiert:
👉 **[`ANTIPATTERNS-VERWORFEN.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/ANTIPATTERNS-VERWORFEN.md)** (26 verworfene Anti-Nuggets wie `contenteditable`-Toggle, Timeouts, CSS-Border-Falzmarken, Fremd-Dependencies und Heuristiken).
