# 💎 Platinum Developer Handbook — DIN-BriefNEO
# Stand: März 2026 | Version: 1.0 (Consolidated)

Dieses Handbuch bündelt die technische Intelligenz und Architektur-Entscheidungen, die während der Entwicklung des DIN-BriefNEO Platinum Frameworks getroffen wurden.

---

## 📐 1. Central Measurement Authority (CMA)
Um Millimeter-Drift zu verhindern, nutzt das System eine **Single Source of Truth (SSoT)** für alle DIN-Masse.

### Kanonische Koordinaten
| Bereich | Mass (mm) | DIN-Bezug |
| :--- | :--- | :--- |
| Blattbreite | 210.000 | DIN 5008 §3 |
| Blatthöhe | 297.000 | DIN 5008 §3 |
| Anschriftzone Top (Form A) | 27.000 | DIN 5008 §6.1a |
| Anschriftzone Top (Form B) | 45.000 | DIN 5008 §6.1b |
| Infoblock Spalte 1 (Label) | 30.000 | DIN 5008 Standard |
| Falzmarke 1 | 105.000 | DIN 5008 §7 |
| Lochmarke | 148.500 | DIN 5008 §7 |

---

## 🤖 2. Salutation Engine (Gender Parsing)
Das System erkennt Geschlecht und Titel aus dem Empfängerfeld, um normgerechte Anreden zu generieren.

- **Keywords:** `Herr` (m), `Frau` (f), `Familie` (fam).
- **Titel-Extraktion:** `Dr.`, `Prof.`, `Dipl.-Ing.` werden automatisch in die Anrede übernommen.
- **Auto-Protection:** Manuelle Änderungen am Anredefeld setzen `data-auto="false"` und stoppen die Automatik, um Nutzer-Souveränität zu wahren.

---

## 👻 3. Markdown-Shredder (Zero-Width Ghosting)
Der Editor nutzt eine Mirror-Architektur, um 100%ige WYSIWYG-Parität zu erreichen.

- **Prinzip:** Markdown-Steuerzeichen (z.B. `**`) werden im Mirror in `<span class="md-marker">` gewickelt.
- **Zero-Width:** CSS erzwingt `width: 0px` für Marker, sodass der Zeilenumbruch im Editor exakt dem des reinen Textes im Druck entspricht.
- **EditContext API:** Die Eingabe erfolgt über einen unsichtbaren Ghost-Input, das DOM dient nur als Viewport.

---

## ⚓ 4. CSS Anchor Positioning (Black-Box Decoder)
Fehlermeldungen und Validierungshinweise werden nativ über die CSS Anchor API positioniert.

- **Dynamic Tethering:** Jedes `din-*` Tag definiert einen CSS-Anker (z.B. `--anchor-body`).
- **Zero JS Layout:** Die Positionierung (`top: anchor(bottom)`) erfolgt vollständig durch den Browser-Renderer, nicht durch JavaScript-Berechnungen.

---

## 📜 5. Core-Doktrinen
1. **Zero-JS Doctrine (ADR-003):** Grundlegende Geometrie (Form A/B) und Hilfslinien MÜSSEN über CSS `:has()` funktionieren.
2. **No-Scroll Doktrin (ADR-004):** Scrollbalken sind strengstens untersagt. Überlauf muss entweder `visible` (fließend) oder `hidden` sein.
3. **Aviation Grade Typing:** Textfelder nutzen `contenteditable="plaintext-only"` kombiniert mit einem Sanitizer-Gatekeeper.

---
**Status:** Consistently Verified via Chrome 147+.
