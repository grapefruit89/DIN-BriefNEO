# SPEC-090: UI/UX Core Polish

## 1. Status Quo
Das UI ist funktional, wirkt aber an einigen Stellen noch "statisch". Abstände sind nicht systemisch definiert, und die visuelle Hierarchie bei offenen Dialogen könnte klarer sein.

## 2. Zielsetzung (Anforderung)
Einführung eines systemischen Designs zur Steigerung der wahrgenommenen Qualität ("Look & Feel").
- **Raster:** Einführung eines **7px-Spacings** als Basis für alle Abstände.
- **Hierarchie:** Einsatz von `backdrop-filter` (Blur) für Dialoge und Popover.
- **Interaktion:** Sanfte Micro-Transitions für alle Buttons und interaktiven Flächen.
- **Produktivität:** Implementierung globaler Keyboard-Shortcuts (Ctrl+S, Ctrl+P, Esc).

## 3. Akzeptanzkriterien
- Alle Abstände (Margin/Padding) nutzen Variablen basierend auf dem 7px-Raster.
- Dialoge dunkeln den Hintergrund ab und nutzen Blur.
- Buttons reagieren haptisch (Scale-Down) auf Klicks.
- Focus-Ringe sind nur bei Tastatur-Navigation sichtbar.
- Shortcuts funktionieren zuverlässig.
