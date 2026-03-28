# TECH-SPEC: EDITCONTEXT & CSS CUSTOM HIGHLIGHTS (v1.1.0)
# Status: CEMENTED | Doctrine: Chrome 147+ Baseline | Stand: März 2026

## 1. DECOUPLED INPUT (EditContext API)
Isolation der Eingabe von der DOM-Struktur.
- **Ziel:** `contenteditable="plaintext-only"` kombiniert mit der nativen `EditContext API`.
- **Logic:** Der Browser übergibt `textupdate` Events direkt an den JS-State. Das DOM dient nur als unstrukturierte Textschicht.

## 2. NATIVE LAYOUT-PROJECTION (CSS Custom Highlights)
Formatierung ohne HTML-Elemente.
- **Engine:** `CSS.highlights.set()` zur Projektion von Markdown-Styles (Fett, Kursiv).
- **Tooling:** `StaticRange` API zur Bindung von Offsets an `TextNode`-Elemente.
- **Purity:** Das DOM bleibt zu jedem Zeitpunkt 100% frei von Formatierungs-Tags (XSS-Schutz).

## 3. NATIVE CSS ANCHOR POSITIONING
Dynamische UI-Elemente ohne JS-Observer.
- **Anchor:** `anchor-name` auf allen IMR-Elementen.
- **Binding:** Overlays werden via `position-anchor` direkt an Felder gekoppelt.
- **Visibility:** `position-visibility: anchors-visible` zur Vermeidung von Layout-Glitches bei Seitenumbrüchen.

## 4. INTRINSIC SIZING (field-sizing)
- **Engine:** `field-sizing: content` zur automatischen Höhenanpassung von Eingabefeldern.
- **Guard:** Zwingende Definition von `max-height` zur Wahrung der DIN-Seitengeometrie.

---
**GEZ. LEAD SYSTEMS ARCHITECT**
"No logic-bloat. Native C++ engine utilization."