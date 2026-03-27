---
scope: LOCAL — js/ui/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/ui/ (DOM-Sync & Interaktion)

**MANDAT:** Dieser Ordner synchronisiert den State mit dem DOM (`din-*` Tags). Layout und UI-Zustände (Sichtbarkeiten) werden an CSS delegiert.

**EISERNE GESETZE:**
1. **Plaintext-Only Mandat:** Alle `<din-*>` Tags (inklusive `din-body`) sind `contenteditable="plaintext-only"`. 
2. **EditContext API:** Eingaben für den Body MÜSSEN über die `EditContext API` abgefangen werden, um unkontrollierte DOM-Mutationen zu verhindern.
3. **Cursor Safety:** Elemente dürfen per JS nur überschrieben werden, wenn sie NICHT den Fokus haben (`document.activeElement !== el`), um Cursor-Jumping zu verhindern.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-U001]: JS für Dialoge/Modals (`addEventListener('click')`). Nutze stattdessen native HTML Invoker Commands (`commandfor` & `command="show-popover"`).
- [TOMB-U002]: `innerHTML` ist strengstens verboten (XSS-Gefahr). Nutze `textContent` für Text und `setHTML({ sanitizer })` (Native Sanitizer API) für den Ghost-Mirror.
- [TOMB-V003]: JS zur Höhenberechnung von Textfeldern (`scrollHeight`). Nutze CSS `field-sizing: content`.
