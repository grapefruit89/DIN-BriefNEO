### 🛠 Architecture Compliance Matrix (IMR 4.0 Standard)

Diese Matrix definiert die technologischen Leitplanken für DIN-BriefNEO.  
Wir wenden die **Chrome 146+ Baseline** konsequent an, um eine *Pure & Flat Architecture* ohne Legacy-Ballast zu garantieren.

---

### 0. Platinum Basistechnologie (Universell)

| Icon / Name            | Moderne API (**TARGET**)      | Strategie & Best Practice (inkl. Quellen) | Status |
|------------------------|-------------------------------|-------------------------------------------|--------|
| **Layering**           | `CSS @layer`                  | Hierarchie vor Spezifität – löst Kaskadenkonflikte. | ✅ Aktiv |
| **Typed Props**        | `@property`                   | Typsicherheit für CMA-Koordinaten (mm-Präzision). | ✅ Aktiv |
| **CSS-Isolation**      | `@scope`                      | Isoliert Paper-CSS ohne Shadow-DOM-Nachteile. | 📋 Geplant |
| **Animations**         | `interpolate-size`            | Native Layout-Anims für `height: auto`. | ✅ Aktiv |
| **Farbe**              | `oklch()`                     | Wahrnehmungsgetreue Farben & `color-mix()`. | ✅ Aktiv |
| **Theming**            | `light-dark()`                | Zero-JS System-Farbschema-Umschaltung. | ✅ Aktiv |
| **Overflow**           | `@container scroll-state`     | Native Überlauf-Warnung ohne JS-Listener. | ✅ Aktiv |
| **Layout**             | Container Queries             | Komponenten reagieren auf A4‑Platz (`size`). | ✅ Aktiv |
| **Logik (CSS)**        | `:has()`                      | Zero-JS State Management (Layout/Theme/Guides). | ✅ Aktiv |
| **Typografie**         | `font-feature-settings`       | Tabellenziffern & Slashed-Zero für IBAN/Datum. | ✅ Aktiv |
| **Auto-Resize**        | `field-sizing: content`       | Textfelder wachsen organisch mit dem Inhalt. | ✅ Aktiv |
| **Positioning**        | CSS Anchor                    | Popovers kleben ohne JS am Anker. | 🔜 Roadmap |
| **Overlays**           | `<dialog>` + `popover`        | Native Modals & Tooltips (ADR-017). | ✅ Aktiv |
| **Invokers**           | Invoker Commands              | Deklarative Button-Trigger (`commandfor`). | 🔜 Roadmap |
| **Hover-Invoker**      | `interesttarget`              | Zero‑JS‑Tooltips (Chrome 147+). | 🔜 Roadmap |
| **Logik (Zeit)**       | Temporal API                  | Fehlerfreie Datumsberechnung (ADR-017). | ✅ Aktiv |
| **Sicherheit**         | Sanitizer API                 | XSS‑Schutz durch `setHTML()` statt `innerHTML`. | ✅ Aktiv |
| **Typografie**         | `text-wrap: balance / pretty` | Vermeidet Witwen & Waisen; optische Balance. | 📋 Geplant |
| **Attr‑Config**        | `attr(data-* type)`           | Typisierte CSS‑Werte direkt aus HTML. | 📋 Geplant |
| **Validierung**        | Constraint API                | Browser‑eigene Formularvalidierung nutzen. | ✅ Aktiv |

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

