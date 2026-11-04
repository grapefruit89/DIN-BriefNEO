---
status: draft
type: concept
tags: [din5008, briefneo, typografie, geschuetztes-leerzeichen, autokorrektur, microtypography]
summary: "Plan für die automatisierte Mikro-Typografie nach DIN 5008 (§ 7.2 und § 8.2): Geschützte Leerzeichen bei Abkürzungen, Einheiten, Paragrafen und Gedankenstrichen."
---

# Mikro-Typografie-Autokorrektur nach DIN 5008 (§ 7.2 & § 8.2)

**Normativer Bezug:** DIN 5008:2020-03, Abschnitt 7.2 („Geschütztes Leerzeichen“) und 8.2 („Gedankenstrich“ / „Langstrich“)  
**Aufwand:** S–M (~2–3 Stunden)  
**ROI:** ⭐⭐⭐⭐⭐ (Höchste typografische Qualität; verhindert unschöne, normwidrige Zeilenumbrüche im Ausdruck)

---

## 1. Problemstellung & Normvorgabe

In DIN 5008 ist das **geschützte Leerzeichen (Non-Breaking Space `\u00A0` bzw. `&nbsp;`)** an vielen Stellen zwingend vorgeschrieben, um zu verhindern, dass zusammengehörende Wortpaare, Abkürzungen oder Symbole durch einen automatischen Zeilenumbruch auseinandergerissen werden.

Im Alltag tippt kein Nutzer manuell `Strg + Umschalt + Leertaste` oder Unicode-Entities ein. Ein moderner Editor muss diese Veredelung **vollautomatisch und unaufdringlich** vornehmen.

### Betroffene Norm-Fälle:
1. **Mehrteilige Abkürzungen (§ 6.5 & § 7.2):**
   - `z. B.`, `d. h.`, `u. a.`, `i. d. R.`, `i. V.`, `i. A.`, `e. V.`, `s. o.`
   - Falsch: Umbruch zwischen `z.` und `B.`
2. **Zahlen mit Einheiten & Währungen (§ 6.6 & § 7.2):**
   - `100 EUR`, `25,00 €`, `15 %`, `3 Promille`, `10 m`, `50 km/h`, `230 V`, `400 m`
   - Falsch: Die Zahl steht am Zeilenende, die Einheit allein in der neuen Zeile.
3. **Paragrafen & Gesetzesverweise (§ 9.1 & § 7.2):**
   - `§ 25`, `§§ 38 f.`, `Art. 1`, `Abs. 2`, `Satz 1`
4. **Gedankenstriche (§ 8.2):**
   - DIN 5008 schreibt vor: Vor dem Gedankenstrich (Langstrich/Halbgeviertstrich `–`) steht ein geschütztes Leerzeichen, dahinter ein normales Leerzeichen (`Wort°– Wort`).
   - Verhindert, dass der Gedankenstrich als erstes Zeichen einer neuen Zeile steht!

---

## 2. Technische Umsetzung & Architektur

### Herausforderung bei `contenteditable`
Wird der DOM-Text während des aktiven Tippens (bei jedem Tastendruck) blind manipuliert, springt die Cursor-Position (`Selection` / `Range`) an den Anfang oder das Ende des Textknotens.

### Architektur-Strategie (Zweistufig & sicher):
1. **Stufe A: Blur- & Export-Politur (Zero-Risk):**
   - Beim Verlassen des Textfeldes (`blur`) sowie direkt vor dem Speichern (`export`) und Drucken (`beforeprint`) läuft eine pure Transformationsfunktion `formatMicroTypography(text)`.
2. **Stufe B: Tastatur-Ersetzung bei Satzzeichen (`beforeinput`):**
   - Tippt der Nutzer ein Leerzeichen nach einem bekannten Muster (z. B. nach `z.` + ` `), wird das Leerzeichen direkt als `\u00A0` eingefügt.

---

## 3. Transformations-Pipeline (Pure Function)

```javascript
/**
 * Wendet DIN-5008-Mikrotypografie (geschützte Leerzeichen) an.
 * @param {string} text
 * @returns {string}
 */
export function formatMicroTypography(text) {
  const NBSP = '\u00A0';

  return text
    // 1. Mehrteilige Abkürzungen
    .replace(/\b(z|d|u|i)\.\s*(B|h|a|R|V|A)\./gi, `$1.${NBSP}$2.`)
    .replace(/\b(e)\.\s*(V)\./gi, `$1.${NBSP}$2.`)

    // 2. Paragrafen & Gesetze
    .replace(/(§§?|Art\.|Abs\.|Satz)\s+(\d+)/g, `$1${NBSP}$2`)

    // 3. Zahlen mit Einheiten & Währungen
    .replace(/(\d+)\s*(EUR|CHF|USD|€|\$|%|‰|km\/h|kWh|kW|mm|cm|dm|m|km|kg|g|t|°C|V|A)\b/g, `$1${NBSP}$2`)

    // 4. Gedankenstrich (Langstrich –) vor neuem Wort
    // Bindestrich zwischen zwei Leerzeichen zu Halbgeviertstrich mit geschütztem Leerzeichen davor
    .replace(/\s+[-–—]\s+/g, `${NBSP}– `);
}
```

---

## 4. Akzeptanzkriterien & Verifikation
- [ ] `z. B.` wird im Textfluss niemals zwischen `z.` und `B.` umgebrochen.
- [ ] `150 EUR` bricht bei schmaler Spalte als Gesamteinheit in die nächste Zeile um.
- [ ] Gedankenstriche stehen niemals isoliert am Anfang einer Druckzeile.
- [ ] Keine Cursor-Sprünge beim normalen Tippen im Editor.
- [ ] 100% Konformität mit Säule 1 (Biome) und Säule 3c (Gate).
