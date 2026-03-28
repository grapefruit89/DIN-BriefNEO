# SPEC-076: Smart Deadline Popover (The "Magic" Feature)

## 1. Status Quo
Nutzer müssen Fristen (z. B. "14 Tage nach heute") manuell ausrechnen und eintippen. Das ist fehleranfällig und unterbricht den Schreibfluss.

## 2. Zielsetzung (Anforderung)
Einführung eines kontextsensitiven Popovers, das intelligente Frist-Vorschläge macht.
- **Trigger A:** Fokus im Feld `din-date`.
- **Trigger B:** Erkennung von Schlüsselwörtern ("Widerspruch", "Mahnung") im Brieftext.
- **Aktion:** Ein Klick berechnet das Zieldatum (Temporal API) und fügt es wahlweise als Ersatz (im Datumsfeld) oder als Textbaustein (im Textkörper) ein.

## 3. Akzeptanzkriterien
- Popover erscheint via **CSS Anchor Positioning** direkt am Feld.
- Berechnung erfolgt absolut präzise via **Temporal API**.
- Visuelle Hervorhebung ("Prominent") der wahrscheinlichsten Frist (z. B. 14 Tage bei Widerspruch).
- Schließverhalten: Popover verschwindet nach Auswahl oder bei Focus-Verlust.
