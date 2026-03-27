---
scope: LOCAL — js/logic/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/logic/ (Pure Business Logic)

**MANDAT:** Dieser Ordner enthält AUSSCHLIESSLICH reine `Input -> Funktion -> Output` Logik. 

**EISERNE GESETZE:**
1. **Kein DOM-Zugriff:** Keine Interaktion mit HTML-Elementen.
2. **Keine Mutationen:** Die Funktionen dürfen den State nicht direkt verändern, sondern geben Werte zurück, die die UI oder der State-Manager verarbeiten.
3. **Zeit-Determinismus:** Die native `Temporal API` ist das einzige erlaubte Zeit-Werkzeug.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-L001]: `new Date()` ist STRIKT VERBOTEN. Nutze ausschließlich `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`.
- [TOMB-L002]: JS-basierte HTML-Injektion (z.B. `<br>` für Anreden). Alles muss reiner Plaintext bleiben.
- [TOMB-L008]: Das `richText`-Flag aus dem IMR ist beerdigt. Der Datenstrom ist 100% Plaintext.
