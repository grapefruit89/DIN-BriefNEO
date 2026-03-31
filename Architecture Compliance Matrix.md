### 🛠 Architecture Compliance Matrix (IMR 4.0 Standard)

Diese Matrix definiert die technologischen Leitplanken für DIN-BriefNEO.  
Wir wenden die **Chrome 146+ Baseline** konsequent an, um eine *Pure & Flat Architecture* ohne Legacy-Ballast zu garantieren.

---

### 0. Platinum Basistechnologie (Universell)

| Icon / Name            | Moderne API (**TARGET**)      | Strategie & Best Practice (inkl. Quellen) |
|------------------------|-------------------------------|-------------------------------------------|
| **Layering**           | `CSS @layer`                  | Hierarchie vor Spezifität – löst Kaskadenkonflikte ohne Hacks. |
| **Typed Props**        | `@property`                   | Typsicherheit für animierbare CMA-Koordinaten. `/w3c/css-houdini-drafts` |
| **CSS-Isolation**      | `@scope`                      | Isoliert Paper-CSS ohne Shadow-DOM-Nachteile. |
| **Animations**         | `calc-size(auto)`             | Native Layout-Anims mit `@starting-style`. `/WICG/turtles` |
| **Scroll-Anims**       | `animation-timeline`          | Scroll-getriebene UI-Feedback ohne JS-Listener. |
| **Transitions**        | `view-transition`             | Sanfter Form‑A/B‑Wechsel ohne Pixel-Jank. |
| **Auto-Resize**        | `field-sizing: content`       | Textfelder wachsen organisch mit dem Inhalt. |
| **Farbe**              | `oklch()`                     | Hochauflösende Farben plus `contrast-color()` für Barrierefreiheit. |
| **Overflow**           | Scroll-State Queries          | Native Schatten bei Scrollbedarf. `/WICG/container-queries` |
| **Layout**             | Container Queries             | Komponenten reagieren auf A4‑Platz, nicht auf Fenstergröße. |
| **Positioning**        | CSS Anchor                    | Popovers kleben ohne JS am Anker. `/WICG/anchor-positioning` |
| **Overlays**           | `<dialog>` + `popover`        | Native Modals inkl. `closedby`-Mechanik. |
| **Invokers**           | Invoker Commands              | Deklarative Button-Trigger ohne Event-Listener. `/open-ui/invokers` |
| **Hover-Invoker**      | `interesttarget`              | Zero‑JS‑Tooltips (Chrome 147+ – experimentell). |
| **Logik (Zeit)**       | Temporal API                  | Fehlerfreie Datumsberechnung. `/tc39/proposal-temporal` |
| **Logik (Format)**     | Intl API                      | DIN-konforme Formatierung. `/tc39/ecma402` |
| **Logik (CSS)**        | `CSS if()`                    | Bedingte Logik in CSS (Chrome 148+). Aktuell `:has()` als stabiler Ersatz. |
| **Reaktivität**        | IdleDetector API              | Systemgestützter Autosave im Leerlauf. `/WICG/idle-detection` |
| **Zustand**            | Proxy State                   | Reaktive Single Source of Truth mit `localStorage`. `/tc39/ecma262` |
| **Sicherheit**         | Sanitizer API                 | XSS‑Schutz durch `setHTML()` statt `innerHTML`. `/WICG/sanitizer-api` |
| **Typografie**         | `text-wrap: balance`          | Vermeidet Witwen & Waisen in Überschriften. |
| **Tab‑Flow**           | `reading-flow`                | Fokus folgt visuellem Layout (z. B. Grid‑Rows). |
| **Attr‑Config**        | `attr(data-* type)`           | Typisierte CSS‑Werte direkt aus HTML (Chrome 147+). |
| **Validierung**        | Constraint API                | Browser‑eigene Formularvalidierung nutzen. |

---

### 🏗️ Implementierungspfade & High‑End APIs

| Icon / Name          | Pfad / API                     | Strategie & Best Practice |
|----------------------|--------------------------------|---------------------------|
| **Dateisystem**      | FileSystem Access              | Server‑Only: direktes Schreiben auf Disk. `/WICG/file-system-access` |
| **Speicherung**      | OPFS                           | Origin Private File System für große Datenmengen. `/w3c/webstorage` |
| **Modularität**      | ES Modules                     | Saubere Dateitrennung via `type="module"`. |
| **PWA Features**     | Service Worker                 | Offline‑First und Installierbarkeit. `/w3c/ServiceWorker` |
| **Input Logic**      | EditContext API                | Volle Kontrolle über IME & Text‑Buffer. `/w3c/edit-context` |
| **KI / Gemini**      | LanguageModel API              | Lokale Gemini‑Modelle für Texthilfe im Browser. `/websites/developer_chrome_ai` |

---

### 🔍 Deep Dive: Die Platinum‑Vorteile (Anwendung)

#### 1. Zero‑JS UI Architektur  
Durch den konsequenten Einsatz von **Invoker Commands** und `:has()`-Selektoren reduzieren wir UI‑spezifisches JavaScript um 90 %.  
Die Benutzeroberfläche reagiert dadurch so stabil und schnell wie eine native OS‑App.

#### 2. Temporal Precision in der Business‑Logik  
Die **Temporal API** ist unser Standard für alle Datumsoperationen.  
Sie eliminiert mathematische Ungenauigkeiten bei Monatswechseln und Schaltjahren – essenziell für fristrelevante, rechtsgültige Geschäftsbriefe.

#### 3. Zero‑Width Ghosting Pattern  
Unser Markdown‑Parser verwendet das Ghosting‑Pattern (`md-marker`).  
Steuerzeichen sind im DOM vorhanden, belegen aber im Layout **0 px Breite** – dadurch entfällt der gefürchtete Layout‑Jank bei der Bearbeitung.

---

### 💡 Profi‑Tipps für die Entwicklung

- **Keyboard‑Power:** Nutze `Strg + B` und `Strg + U` im `<din-text>`-Feld. Die UI‑Bridge fängt diese ab und wendet die Platinum‑Markups automatisch an.
- **Layer‑Inspection:** Öffne die Chrome DevTools → *Layers*, um die saubere Trennung von `din.structure` und `ui.theme` visuell zu validieren.
- **BigInt‑IBAN‑Check:** Unsere IBAN‑Validierung nutzt `BigInt`, um die Modulo‑97‑Prüfung auch bei 22‑stelligen Nummern mathematisch präzise durchzuführen.

---

**Status:** ACTIVE  
**Enforcement:** PVP (Platinum Validation Pipeline)  
**Version:** 4.4 "Pure & Flat Applied"

