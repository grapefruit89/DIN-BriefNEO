# SPEC: THE BLACK-BOX-DECODER (VALIDATION OVERLAYS) (v1.0.0)
# Status: DRAFT | Doctrine: Aviation Grade Platinum | Stand: März 2026

## 1. NATIVE ANCHOR POSITIONING (Visual Tethering)
Validierungsfehler müssen physisch an das fehlerhafte IMR-Feld gebunden sein, ohne JS-Berechnungen.
- **Anchor Point:** Jedes `<din-*>` Element definiert einen eigenen `anchor-name` (z.B. `--anchor-body`, `--anchor-iban`).
- **Decoder Overlay:** Ein zentrales `<div popover id="black-box-decoder">` dient als Anzeige für Validierungsfehler.
- **Tethering:** Das Overlay wird via `position-anchor: var(--active-anchor)` an das aktuell fehlerhafte Feld gefesselt.

## 2. DECODER LOGIC (The Black Box)
- **Source:** Die Validierungs-Logik in `logic.js` (Deterministic State Machine) liefert Fehlermeldungen.
- **State Trigger:** Bei einem Fehler wird das Attribut `data-invalid="true"` am IMR-Element gesetzt. 
- **Message:** Die Fehlermeldung wird in ein `data-error-msg` Attribut geschrieben.

## 3. CSS REQUIREMENTS (The Mirror)
- **Positioning:** Das Decoder-Overlay nutzt `top: anchor(bottom)` und `left: anchor(left)`.
- **Visibility:** Das Overlay ist nur sichtbar, wenn ein Element den Fokus hat UND `data-invalid="true"` gesetzt ist. 
- **Fragmentierung:** Nutzung von `position-visibility: anchors-visible` zur Vermeidung von Fehlern bei Seitenumbrüchen.

## 4. SUCCESS CRITERIA
- [ ] Tooltip bewegt sich nativ mit dem Feld (z.B. bei Layout-Shifts).
- [ ] Tooltip verschwindet, wenn der Anker durch einen Seitenumbruch unsichtbar wird.
- [ ] 0 Zeilen JS-Code für die Positionsberechnung.

---
**GEZ. LEAD SYSTEMS ARCHITECT**
"Natively tethered errors. Zero-Pixel-Shift Validation."