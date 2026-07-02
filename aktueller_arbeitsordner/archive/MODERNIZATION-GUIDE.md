---
title: Modernisierungs-Leitfaden: MODERNIZATION-GUIDE.md
status: active
tags: [documentation]
---

> [!WARNING]
> **ARCHIVIERT**: Historisches Dokument. Einige der hier genannten Empfehlungen widersprechen der aktuellen `longevity-guidelines.md` (z.B. Temporal API).


# Modernisierungs-Leitfaden: MODERNIZATION-GUIDE.md

Dieses Dokument analysiert die aktuell verwendeten Webtechnologien des **DIN-BriefNEO**-Baseline-Projekts und vergleicht sie mit zukünftigen, potenziellen W3C-Standardkandidaten. Es dient als strategischer Wegweiser für zukünftige Modernisierungen – **ohne sofortige Umsetzung** und unter strikter Wahrung der Longevity-Verfassung.

---

## 🧭 Modernisierungs-Matrix (Tech-Debt Roadmap)

| Aktuelle Technik | Potenzielle modernere Alternative | Status der Alternative | Empfehlung | Begründung & Longevity-Verweis |
| :--- | :--- | :--- | :--- | :--- |
| **Selection/Range API** (zur Y/X-Positionierung der Toolbar) | **CSS Anchor Positioning API** | In Chrome 148+ vollständig stabil. | **Jetzt nutzen** | Da Chrome 148+ unsere exklusive Target-Plattform ist, nutzen wir CSS Anchor Positioning ohne jegliche Rücksicht auf veraltete Safari/Firefox-Stände. Dies eliminiert JavaScript-Positionierungscode vollständig. |
| **`document.execCommand`** (Fett/Unterstreichen nativ) | **Custom Selection & Range DOM-Operationen** | W3C-Standard (Living Standard). | **Jetzt nutzen** | `execCommand` ist veraltet (*deprecated*). Wir haben dies für blockquotes bereits gelöst. Standard-Shortcuts überlassen wir dem Browser, was absolut stabil ist. |
| **Natives JS `Date`-Objekt** | **Temporal API** | In Chrome 148+ nativ und vollständig einsatzbereit. | **Jetzt nutzen** | Die `Temporal` API ist in Chrome 148+ fehlerfrei und nativ implementiert. Wir nutzen sie direkt zur präzisen Datumsberechnung und für Zeitstempel bei Entwürfen. |
| **`localStorage`** (für Base64 Custom Fonts & Drafts) | **Origin Private File System (OPFS)** / **IndexedDB** | W3C-Standard. | **Nie** | OPFS/IndexedDB setzen zwingend HTTPS voraus. Unter `file://` (Doppelklick) stürzen sie mit Security-Exceptions ab. `localStorage` ist laut [Säule 5 der Longevity-Guidelines](Guides/longevity-guidelines.md) die einzig stabile Option für Doppelklick-Apps. |
| **`@import`** in CSS-Dateien | Native **`link`-Tags** im HTML | W3C-Standard. | **Jetzt nutzen** | `@import` blockiert das parallele Laden von Stylesheets im Browser. Native `<link>`-Tags laden Stylesheets parallel und performanter. |
| **`console.log()`** (für Debugging im Quellcode) | Deaktivierbarer **Custom Logging Wrapper** | Standard JavaScript. | **Jetzt nutzen** | Verhindert, dass sensible Anwendungsdaten in der Produktionskonsole exponiert werden und schont CPU-Ressourcen bei der DOM-Verarbeitung. |
| **`var()` ohne Fallback** in CSS | **`var(--prop, fallback)`** | W3C-Standard. | **Jetzt nutzen** | Redundante Absicherung. Verhindert, dass UI-Elemente bei fehlenden Custom Properties visuell zerreißen. |
| **`innerHTML`** (für Autocomplete- dropdown) | **`textContent`** oder **`createTextNode`** | W3C-Standard. | **Bereits umgesetzt** | Verhindert Cross-Site Scripting (XSS) auf Browserebene. Alle APIs und Benutzereingaben werden strikt als Plaintext behandelt. |

---

## 🔗 Verweise
*   Siehe [longevity-guidelines.md](Guides/longevity-guidelines.md) zur Einhaltung der abwärtskompatiblen W3C-Schnittstellen.
*   Siehe [ADR-ANTIPATTERN.md](ADR/ADR-ANTIPATTERN.md) für die expliziten Dateispeicher- und CDN-Ausschlüsse.
