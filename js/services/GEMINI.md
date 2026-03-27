---
scope: LOCAL — js/services/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/services/ (APIs & Resilience)

**MANDAT:** Die Anbindung an externe APIs (Tier 1 & Tier 2) ist ein optionales "Geschenk", kein lebensnotwendiges Organ. Fällt ein Service aus, darf der Briefeditor niemals ruckeln oder stoppen.

**EISERNE GESETZE:**
1. **Silent Failure (Tier 0 Souveränität):** Kein `alert()`, kein roter Toast im Editor bei API-Ausfällen. Fehler werden lautlos geschluckt oder im Flight-Recorder protokolliert.
2. **Circuit Breaker (Daily-Strike):** Jeder Fetch-Aufruf muss durch die Hysterese-Logik. Maximal 1 Fehler-Strike pro Kalendertag (via Temporal API). 
3. **Recovery:** Ein Service darf das "GREEN" (Aktiv) Flag erst zurückerhalten, wenn die "Consecutive Success Threshold" (CST = 3 aufeinanderfolgende Erfolge) erreicht ist.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-S001]: Synchrone UI-Blockaden durch langsame Fetch-Requests. Services operieren asynchron und liefern Fallbacks (LocalStorage-Cache oder leere Strings).
