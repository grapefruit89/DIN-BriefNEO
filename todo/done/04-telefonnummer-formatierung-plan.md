---
status: done
type: concept
tags: [din5008, briefneo, plan, telefon, blur, durchwahl]
summary: "Plan zur Telefonnummern-Formatierung nach DIN 5008 (Blur-Handler / Format-Logik & Durchwahl-Bindestrich)."
---

# Telefonnummern-Formatierung nach DIN 5008 (Blur-Handler & Durchwahl-Erhalt)

**Quelle:** `neu 2.html`, Script-Block „logik für Rufnummern" (inkl. `if (/-/.test(input)) …`)  
**Stufe:** JS — Stufe 1 (HTML) und Stufe 2 (CSS) reichen nachweislich nicht:
- Kein HTML-Element/Attribut formatiert Telefonnummern (WHATWG HTML Living Standard: `<input type="tel">` bietet nur Tastatur-Hint, keine Formatierung).
- Keine CSS-Funktion (`::before`/`attr()` erlaubt keine Ziffern-Gruppierung).
- ECMA-402 `Intl.NumberFormat` unterstützt keinen `style: 'tel'` (Stand 2026, MDN Intl.NumberFormat).
- `libphonenumber` wäre die einzige echte Universallösung, ist aber eine externe Dependency → im Projekt verboten.

**Aufwand:** M (Grundlogik M, Durchwahl-Erweiterung XS < 10 min)  
**ROI:** ⭐⭐⭐ (DIN-5008-Konformität: Norm fordert explizit „vor der Durchwahl ein Bindestrich")

---

## 1. Was passiert
Beim Verlassen des Feldes `#absender-tel` (Blur) wird die eingegebene Nummer in die DIN-5008-Form gebracht:
- `0160 1221445` → `0160 1221445` bzw. `+49 160 1221445`
- `0151 1234567-89` → `+49 151 1234567-89` (Bindestrich bleibt als semantischer Marker für die Durchwahl erhalten)
- `+49 30 12345678`
- `030 12345678`

Die Eingabe bleibt frei, die Formatierung passiert erst nach dem Verlassen des Feldes (Blur).

---

## 2. Wie es funktioniert
1. **Durchwahl-Isolation:** Ein Bindestrich (`-`) wird vor dem Bereinigen anderer Trennzeichen isoliert (`[main, durchwahl] = original.split('-', 2)`).
2. **Bereinigung:** Alle übrigen Trennzeichen (`()`, `/`, `.`, `;`) werden aus Hauptnummer und Durchwahl entfernt.
3. `+` oder `00` am Anfang → internationales Präfix `+`.
4. `+49` oder `0049` → deutsche Nummer ohne führende `0`.
5. `0…` → deutsche Nummer; Vorwahl wird per Lookup erkannt (Mobilfunk 4-stellig `015x`–`017x`, Ortsnetz 2–5-stellig).
6. Vorwahl und Rufnummer werden mit Leerzeichen getrennt, die Durchwahl wird mit Bindestrich angehängt (`-DW`).

---

## 3. Original-Code (aus der Quelldatei `neu 2.html`)

```js
// neu 2.html, Script-Block „logik für Rufnummern"
function formatPhoneDin5008(input) {
  let num = input.replace(/[\s\/\-\.\(\);]+/g, '');
  let intl = '';
  if (num.startsWith('+')) { intl = '+'; num = num.slice(1); }
  else if (num.startsWith('00')) { intl = '+'; num = num.slice(2); }
  if (intl && num.startsWith('49')) {
    num = num.slice(2);
    if (num.startsWith('0')) num = num.slice(1);
    let vwlLen = findeVorwahl(num);
    if (vwlLen < 3) vwlLen = 3;
    const vorwahl = num.slice(0, vwlLen);
    let rest = num.slice(vwlLen);
    return `${intl}49 ${vorwahl} ${rest}`;
  }
  if (num.startsWith('0')) {
    let vwlLen = findeVorwahl(num);
    if (vwlLen < 3) vwlLen = 3;
    const vorwahl = num.slice(0, vwlLen);
    let rest = num.slice(vwlLen);
    let durchwahl = '';
    if (/-/.test(input)) {
      const [haupt, dw] = rest.split('-');
      rest = haupt;
      durchwahl = '-' + dw;
    }
    return `${vorwahl} ${rest}${durchwahl}`;
  }
  return input.replace(/[\s\/\-\.\(\);]+/g, '');
}
```

> [!WARNING] **Ehrliche Warnung zur Quelldatei**  
> Die `findeVorwahl`-Liste ist fehlerhaft. `032`, `030`, `040`, `050`, `060`, `070`, `080`, `090` sind normale Ortsnetze, keine „Sonder"-Vorwahlen — die Klassifizierung ist willkürlich. `0180`/`0181` sind Service-Nummern, `0700`/`0900` sind Premium-Dienste. Ohne gepflegte BNetzA-Daten ist die Vorwahl-Erkennung nicht zuverlässig. **Die Logik (Blur-Handler + Präfix-Normalisierung + Durchwahl-Erhalt) ist übernehmbar; die Vorwahlliste nicht.**

---

## 4. DIN-BriefNEO-Umsetzung

### HTML (`website/index.html`)
Keine Änderung erforderlich — `#absender-tel` existiert bereits als `contenteditable="plaintext-only"`.

### CSS (`website/css/sheet.css`)
Keine Änderung erforderlich.

### JS (`website/js/document.js`, in `UIProtections`)

```js
// Pure Funktion — testbar, kein DOM-Zugriff, Durchwahl-Marker '-' bleibt erhalten
export function formatGermanPhone(input) {
  const original = String(input || '');
  // Bindestrich isolieren (Durchwahl-Marker), alles andere strippen
  const [main, durchwahl] = original.split('-', 2).map(s => s || '');
  const digits = main.replace(/[\s/.\-();]+/g, '');
  if (!digits) return original;

  const dwClean = durchwahl.replace(/[\s/.\-();]+/g, '');
  const dwSuffix = dwClean ? `-${dwClean}` : '';

  const national = digits.startsWith('0') ? digits : null;
  const international = digits.startsWith('49') ? digits.slice(2) : null;

  for (const num of [national, international]) {
    if (num && /^1[5-7]\d/.test(num)) {
      const rest = num.slice(1);
      return `+49 ${rest.slice(0, 3)} ${rest.slice(3)}${dwSuffix}`;
    }
  }
  return original;
}
```

```js
// In UIProtections.init() ergänzen:
this.setupPhoneFormatting();

// Methode in UIProtections:
setupPhoneFormatting() {
  const tel = document.getElementById('absender-tel');
  if (!tel) return;
  tel.addEventListener('blur', () => {
    const current = (tel.textContent || '').trim();
    if (!current) return;
    const formatted = formatGermanPhone(current);
    if (formatted && formatted !== current) {
      tel.textContent = formatted;
      tel.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}
```

> [!IMPORTANT] **Integritäts-Regel**  
> Kein `execCommand`, kein `innerHTML`, kein `setTimeout`. Die Formatierung läuft über `textContent` + `input`-Event, damit der `DraftManager` die Änderung mitbekommt.

---

## 5. Betroffene Dateien
- `website/js/document.js` — exportierte Funktion `formatGermanPhone` + `UIProtections.setupPhoneFormatting()`
- `website/index.html` — keine Änderung nötig

---

## 6. Was der User entscheiden muss
1. **Durchwahl-Verhalten bei Mobilfunk:** Mobilfunk-Durchwahlen sind im Alltag selten (Mobilfunk endet typischerweise an der Hauptnummer). Soll der Bindestrich trotzdem erhalten bleiben (streng DIN-konform: Norm fordert explizit „vor der Durchwahl ein Bindestrich“), oder ist das für reine Mobilfunknummern überflüssig?
2. **Vorwahl-Datenquelle:** Ohne gepflegte Vorwahlliste bleibt die Vorwahl-Trennung auf Mobilfunknummern (`015x`–`017x`) beschränkt. Ortsnetz-Nummern (`030 …`, `0221 …`) würden unverändert bleiben. Ist das akzeptabel, oder soll eine BNetzA-Daten-Datei (statisch, ~50 KB JSON) eingebunden werden?
3. **Format für Ortsnetz (falls BNetzA-Daten eingebunden werden):** `030 12345678-89` (Vorwahl + Rufnummer-Durchwahl) oder `030 12 34 56-89` (Vorwahl + gruppierte Rufnummer-Durchwahl)?
4. **Trigger-Art:** Soll die Formatierung ausschließlich per `blur` beim Verlassen des Feldes passieren, oder soll zusätzlich ein expliziter Button `#btn-format-tel` bereitgestellt werden?
