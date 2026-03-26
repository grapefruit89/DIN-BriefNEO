# PLAN: BLACK-BOX-DECODER (CSS ANCHOR POSITIONING) (v1.0.0)
# Spec: SPEC_VALIDATION_ANCHOR_v1.0.0
# Status: DRAFT | Doctrine: Aviation Grade Platinum | Stand: März 2026

## CONSTITUTION CHECK
| Gate | Status | Notiz |
|------|--------|-------|
| [MANDATE-INJ] | OK | Nur textContent für Fehlermeldungen. |
| [MANDATE-NAT] | OK | Nutzung nativer CSS Anchor Positioning API. |
| [MANDATE-PLN] | OK | Keine Beeinträchtigung der plaintext-only Felder. |

## 1. CSS CORE ARCHITECTURE (din.core)
Wir definieren die Ankerpunkte für alle IMR-Felder.
```css
din-body { anchor-name: --anchor-body; }
din-subject { anchor-name: --anchor-subject; }
/* ... (weitere IMR Tags) */

#black-box-decoder {
  position: fixed;
  position-anchor: var(--active-anchor);
  top: anchor(bottom);
  left: anchor(left);
  position-visibility: anchors-visible;
  margin-top: 5mm;
  padding: 2mm 5mm;
  background: var(--pico-ins-color); /* Warnfarbe */
  color: white;
  border-radius: 4px;
  font-size: 10pt;
}
```

## 2. DYNAMISCHES TETHERING (UI Bridge)
Das JS setzt nur den Anker-Kontext, der Browser erledigt die Geometrie.
```javascript
// In UIController.js (_bindNativeEvents)
paper.addEventListener("focusin", e => {
  const tag = e.target.tagName.toLowerCase();
  if (tag.startsWith("din-")) {
    document.documentElement.style.setProperty("--active-anchor", `--anchor-${tag.slice(4)}`);
  }
});
```

## 3. VISIBILITY LOGIC (Pure CSS)
```css
#black-box-decoder {
  display: none;
}

/* Nur anzeigen, wenn das fokussierte Element ungültig ist */
:root:has(din-*:focus[data-invalid="true"]) #black-box-decoder {
  display: block;
}
```

## 4. STEPS (Implementation)
1. [ ] CSS-Anker in `css/din5008-paper.css` hinzufügen.
2. [ ] Popover-HTML in `index.html` einfügen.
3. [ ] `UIController.js` erweitern für `--active-anchor` Property.
4. [ ] `logic.js` erweitern (Validierungstrigger für `data-invalid`).

---
**GEZ. LEAD SYSTEMS ARCHITECT**
"Zero-Pixel-Shift Layout. Natively Tethered Error UI."