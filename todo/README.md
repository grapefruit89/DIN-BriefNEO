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
