---
status: draft
type: concept
tags: [din5008, briefneo, plan, betreff, datenschutz, fensterbriefumschlag]
summary: "Plan für die DIN-5008-Option 'Sensibler Betreff' (§ 20.9.2): Tieferstellen des Betreffs um 1-2 Leerzeilen zum Schutz vertraulicher Daten im Sichtfenster."
---

# Sensibler Betreff (§ 20.9.2) — Schutz vertraulicher Daten im Fensterkuvert

**Normativer Bezug:** DIN 5008:2020-03, Abschnitt 20.9.2, Absatz 3 („Wortlaut des Betreffs“)  
**Aufwand:** XS (~30 Minuten)  
**ROI:** ⭐⭐⭐⭐ (Datenschutz-Feature für Banken, Kanzleien, Behörden, Personalabteilungen)

---

## 1. Problemstellung & Normvorgabe

DIN 5008 Abschnitt 20.9.2 formuliert eine explizite Empfehlung für den Datenschutz bei Fensterbriefhüllen:

> *„Sofern im Betreff vertrauliche oder sensible Daten angegeben werden und das Schriftstück in Briefhüllen oder Versandtaschen mit Sichtfenster verschickt werden, empfiehlt es sich, den Betreff um den Abstand von ein bis zwei Leerzeilen tiefer beginnen zu lassen. Dadurch soll verhindert werden, dass bei Verrutschen der Sendung beim Versand keinesfalls über das Sichtfenster Rückschlüsse auf den Inhalt des Schreibens gezogen werden können.“*

Wenn ein Brief im Fensterumschlag (DIN Lang: 90 × 45 mm Fenster) nach oben oder unten rutscht, kann bei Standard-Positionierung die Betreffzeile (z. B. *„Kündigung des Arbeitsverhältnisses“*, *„Pfändungs- und Überweisungsbeschluss“*, *„Diagnosebericht“*) am unteren Fensterrand sichtbar werden.

---

## 2. Technische Umsetzung

### UI (Seitenleiste / Bereich „Brief-Steuerung“):
Ein nativer W3C-Switch in der Seitenleiste:
```html
<div class="seitenleiste-switch-row">
  <label for="toggle-sensibler-betreff" class="seitenleiste-label" title="Schiebt den Betreff tiefer, damit er beim Verrutschen im Umschlag nicht im Fenster sichtbar wird">
    Sensibler Betreff (Kuvertschutz)
  </label>
  <input type="checkbox" switch id="toggle-sensibler-betreff">
</div>
```

### CSS (Rein deklarativ via `:has()`):
```css
/* Standard: 2 Leerzeilen nach Infoblock */
#betreff {
  margin-top: 0;
  transition: margin-top 0.15s ease-out;
}

/* Sensibler Betreff: 2 zusätzliche Leerzeilen (2 × 4,23 mm = 8,46 mm Tieferstellung) */
:root:has(#toggle-sensibler-betreff:checked) #betreff {
  margin-top: 8.46mm;
}
```

Bei der Mehrseiten-Workbench bzw. Fließtext-Logik schiebt dies den Betreff samt nachfolgendem Textfluss sauber nach unten, ohne das absolute Anschriftfeld zu tangieren.

### Persistenz:
In `din_settings` im `localStorage` speichern (`sensitiveSubject: boolean`).

---

## 3. Akzeptanzkriterien
- [ ] Schalter aktiviert: Betreff rückt exakt um 8,46 mm (2 DIN-Leerzeilen) nach unten.
- [ ] Anschriftfeld und Infoblock bleiben unberührt.
- [ ] Bei der Druckvorschau (`Strg + P`) wird die Tieferstellung 1:1 übernommen.
- [ ] Das Fensterkuvert-Visier (`Kuvert-Fenster 90 × 45 mm`) zeigt optisch, dass der Betreff auch bei maximalem Spielraum außerhalb des Sichtbereichs bleibt.
