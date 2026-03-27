# CORE-SPEC: SEMANTIC ELEMENTS & TEMPORAL ENGINE (v1.2.0)
# Status: CEMENTED | Doctrine: Chrome 147+ Baseline | Stand: März 2026

## 1. SEMANTIC CUSTOM ELEMENTS (Data-DOM Isomorphism)
Wir nutzen ein striktes 11-Felder-Modell basierend auf nativen HTML5 Custom Elements.
- **Nomenklatur:** `<din-anschriftfeld>`, `<din-ruecksendeangabe>`, `<din-betreff>`, `<din-body>`, `<doc-date>`.
- **Constraint:** Jedes Element ist isomorph zu einem JSON-Key in der `constants.js` (IMR-Registry).
- **Behavior:** Elemente nutzen `contenteditable="plaintext-only"` zur strukturellen Absicherung gegen HTML-Injektion.

## 2. TEMPORAL API STRICT MODE
Vollständiger Ersatz des mutierbaren `Date`-Objekts durch die native Temporal API.
- **Engine:** `Temporal.Now.plainDateISO()` für die Erfassung.
- **Persistence:** Speicherung ausschließlich im ISO-8601 String-Format.
- **Formatting:** `Intl.DateTimeFormat('de-DE')` zur Render-Zeit.

## 3. PHYSICAL GEOMETRY (DIN 5008:2020)
- **Form A:** Header-Höhe fixiert auf 27mm.
- **Form B:** Header-Höhe fixiert auf 45mm.
- **Implementation:** Steuerung ausschließlich über CSS Custom Properties (Variables), die aus dem globalen State gespeist werden.

---
**GEZ. LEAD SYSTEMS ARCHITECT**
"Standardized language is the key to machine precision."