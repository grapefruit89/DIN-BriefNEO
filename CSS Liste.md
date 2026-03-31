# 📋 DIN-BriefNEO Capability Matrix (Platinum Edition)

Dieses Dokument listet alle eingesetzten und geplanten modernen Web-Features auf. Der Fokus liegt auf der Nutzung nativer Browser-APIs (Chrome 147+ Baseline), um eine Zero-JS UI Architektur zu gewährleisten.

---

## 🎨 CSS Capability Matrix

| Kategorie | Feature | Status | Chrome-Version | Beschreibung |
|-----------|---------|--------|----------------|--------------|
| **Architektur** | `CSS @layer` | ✅ Aktiv | 99+ | Trennung von Base, Theme und Struktur-Styles. |
| **Architektur** | `CSS Nesting` | ✅ Aktiv | 120+ | Native Verschachtelung ohne Präprozessoren. |
| **Logik** | `:has()` | ✅ Aktiv | 105+ | Zero-JS State Management für Layout/Theme/Guides. |
| **Logik** | `:is()` / `:where()` | ✅ Aktiv | 88+ | Selektoren-Gruppierung für sauberen Code. |
| **Layout** | `CSS Grid` | ✅ Aktiv | Baseline | Grundraster für Sidebar und A4-Viewport. |
| **Layout** | `Container Queries` | ✅ Aktiv | 105+ | Responsive Paper-Komponenten & Overflow-Alarm. |
| **Variablen** | `@property` | ✅ Aktiv | 85+ | Typisierte CSS-Variablen für saubere Maßeinheiten. |
| **Farben** | `oklch()` | ✅ Aktiv | 111+ | Wahrnehmungsgetreue Farbräume (Helligkeits-Linear). |
| **Farben** | `color-mix()` | ✅ Aktiv | 111+ | Dynamische Farbableitung für Hover/Active States. |
| **Theming** | `light-dark()` | ✅ Aktiv | 123+ | Native Unterstützung für System-Farbschemas. |
| **Animation** | `interpolate-size` | ✅ Aktiv | 129+ | Transitionen für `height: auto` (z.B. Sidebar). |
| **Interaktion** | `Anchor Positioning` | 📋 Geplant | 125+ | Tooltips und Popover ohne JS-Positionierung. |
| **Typografie** | `text-wrap: balance` | 📋 Geplant | 114+ | Optische Balance für Überschriften/Betreff. |
| **Typografie** | `text-wrap: pretty` | 📋 Geplant | 117+ | Vermeidung von "Hurenkindern" im Brieftext. |
| **Feedback** | `scroll-state` | ✅ Aktiv | 147+ | Automatischer Überlauf-Alarm bei Textüberschreitung. |

---

## 📄 HTML Capability Matrix

| Kategorie | Feature | Status | Chrome-Version | Beschreibung |
|-----------|---------|--------|----------------|--------------|
| **Komponenten** | `Custom Elements` | ✅ Aktiv | Baseline | Semantische Tags wie `<din-A4>`, `<din-falz-oben>`. |
| **Eingabe** | `plaintext-only` | ✅ Aktiv | 115+ | `contenteditable` ohne ungewollte HTML-Formatierung. |
| **Eingabe** | `inputmode` | ✅ Aktiv | 66+ | Optimierte Keyboards (z.B. numerisch für PLZ). |
| **Overlays** | `<dialog>` | ✅ Aktiv | 94+ | Native Modals für Profil-Editierung. |
| **Overlays** | `popover` | ✅ Aktiv | 114+ | Native Tooltips und Debug-Panels. |
| **Interaktion** | `Invoker Commands` | 🔜 Roadmap | 148+ | Zero-JS Button-Aktionen (`commandfor`). |
| **Interaktion** | `interesttarget` | 🔜 Roadmap | 147+ | Hover-Trigger für Tooltips ohne JS. |
| **Optimierung** | `field-sizing: content` | ✅ Aktiv | 129+ | Auto-resizing Textareas ohne JS-Listener. |

---

## 📊 Zusammenfassung der Tech-Stack Ziele

1.  **Zero-JS UI State:** Alle UI-Zustände (Layout A/B, Theme, Hilfslinien) werden über CSS-Pseudoklassen (`:has`, `:checked`) gesteuert.
2.  **Native Dimensions:** Alle DIN-Maße werden in `mm` über CSS-Variablen und `calc()` berechnet.
3.  **No Scrollbars:** Das Dokument ist auf Clipping und Resilience ausgelegt (`overflow: hidden`).
4.  **Security First:** Verzicht auf `innerHTML` zugunsten von `textContent` und `Sanitizer API`.

---
*Stand: März 2026 — DIN-BriefNEO Platinum Master*
