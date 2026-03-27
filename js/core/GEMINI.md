---
scope: LOCAL — js/core/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/core/ (Infrastruktur & State)

**MANDAT:** Dieser Ordner ist das Fundament (State-Proxy, Konstanten, FileSystem/OPFS). Er ist absolut "dumm" und weiß NICHTS vom Layout oder der UI.

**EISERNE GESETZE:**
1. **Kein DOM-Zugriff:** Befehle wie `document.getElementById`, `querySelector` oder `classList` sind hier FATAL ERROR.
2. **Keine Business-Logik:** Der `StateManager` darf keine Berechnungen durchführen. Er hält nur das `content` und `profile` Objekt und managt den Undo/Redo-Stack.
3. **SSoT für Konstanten:** `constants.js` ist die einzige Quelle der Wahrheit für IMR-Tags und CMA-Koordinaten.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-C001]: Der Config-Zweig im State ist beerdigt. Konfiguration lebt nativ im DOM (`#paper.dataset.*`).
- [TOMB-B001]: Die `initCMABridge` (die CSS-Werte per JS injiziert) ist als Dead Code markiert. CSS `:root` ist die primäre SSoT.
