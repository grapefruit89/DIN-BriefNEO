---
status: draft
type: concept
tags: [din5008, briefneo, plan, mobile]
summary: "Plan für mobile Ansicht und Touch-UX des DIN-BriefNEO-Generators."
---

# Mobile Ansicht & Touch-UX – Plan für DIN-BriefNEO (Baseline Chrome 150+)

Unter der Baseline **Chrome 150+** stehen alle modernen CSS- und Web-APIs (Container Queries, `@function`, `attr()`, Popover, `<dialog>`, `env()`, `svh`/`dvh`, Anchor Positioning) nativ und ohne Polyfills zur Verfügung. Der Fokus liegt auf der **Umorganisation des Desktop-Layouts** für kleine Viewports, Touch-Bedienung und virtuelle Tastaturen.

---

## 1. Viewport-Meta und Safe Areas anpassen

Aktueller Viewport-Meta-Tag: `width=device-width, initial-scale=1.0`. Erweiterung für mobile App-Ansicht:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content">
```

- **`viewport-fit=cover`** aktiviert `env(safe-area-inset-*)`, damit Inhalte nicht hinter Notch, Dynamic Island oder Gestenleiste verschwinden (`padding-bottom: env(safe-area-inset-bottom)` für fixe Fußbereiche / Druck-Button).
- **`interactive-widget=resizes-content`** sorgt dafür, dass Chrome auf Android das Layout-Viewport verkleinert, wenn die virtuelle Tastatur erscheint. Ohne diesen Wert kann ein fixiertes Bottom Sheet oder ein fokussiertes `contenteditable`-Feld hinter der Tastatur verschwinden.
- **`svh` vs. `dvh`:** `dvh` reagiert **nicht** auf die Tastatur (misst nur Toolbar-/Adressleisten-Änderungen). Für stabile Vollbild-Layouts `100svh` (small viewport height) nutzen.

---

## 2. Layout-Umschaltung: Sidebar → Bottom Sheet

Die Sidebar ist auf Desktop mit `inline-size: 290px` fest dimensioniert (`grid-template-columns: 290px 1fr`). Auf 360–430 px breiten Smartphones bleibt für das Blatt kein Platz.

### Empfohlenes Muster: Sidebar als natives Bottom Sheet auf Mobilgeräten

Nutzung der vorhandenen `<dialog>`-Infrastruktur (`reset-dialog`, `import-dialog`, `din-info-dialog`) für ein Bottom-Sheet-Dialog unterhalb eines Breakpoints (`768px`).

**CSS-Skizze:**

```css
/* Desktop: Grid bleibt */
#app-shell {
  display: grid;
  grid-template-columns: 290px 1fr;
}

/* Mobile: Shell wird eindimensional, Sidebar verlässt den Fluss */
@media (max-width: 768px) {
  #app-shell {
    grid-template-columns: 1fr;
  }
  #seitenleiste {
    /* Aus dem Grid nehmen – sie wird zum Dialog */
    display: none; /* oder per [popover] / dialog.showModal() steuern */
  }
  #viewport {
    /* Das Blatt bekommt die volle Breite */
    padding: 1vh 1vw;
  }
}
```

**Native Bottom-Sheet-Mechanik (`<dialog data-position="bottom">`):**
- Liefert Fokus-Trapping, `::backdrop`, `closedby="any"` und Escape-Schließen kostenlos.

```css
.bottom-sheet {
  margin: 0;
  margin-top: auto; /* klebt am unteren Rand */
  max-height: 85svh;
  border-radius: 16px 16px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 3. DIN-A4-Blatt auf kleinen Viewports handhaben

Das Blatt skaliert aktuell über `width: min(100cqw, calc(100cqh * var(--blatt-breite) / var(--blatt-hoehe)))`. Auf 390 px Bildschirmbreite skaliert `--pt()` die Schrift zu klein zum Bearbeiten.

### Zwei Modi

- **Modus A – „Blatt als scrollbare Leinwand":**
  `#viewport` erhält auf Mobilgeräten `overflow: auto`, und `din-a4` bekommt eine feste Mindestbreite (`min-width: 500px` bzw. `600px`), sodass die DIN-Typografie lesbar bleibt. Das Blatt selbst behält `contain: strict` und `overflow: clip`, während `#viewport` scrollt.
- **Modus B – „Fokus-Editor pro Feld" (optional für Touch):**
  Das Blatt bleibt als Vorschau sichtbar; beim Antippen eines `contenteditable`-Feldes öffnet sich ein Bottom Sheet / Vollbild-Overlay nur für dieses Feld in großer Schrift (Rückschreiben per `input`-Event, Cursor-Sync über `setCaretCharacterOffset`/`setCaretToEnd` aus `website/js/document.js`).

```css
@media (max-width: 768px) {
  din-a4 {
    /* Blatt nicht unter 500px Breite schrumpfen */
    min-width: 500px;
  }
  #viewport {
    overflow: auto;
    place-items: start; /* nicht zentrieren, damit gescrollt werden kann */
  }
}
```

---

## 4. Virtuelle Tastatur und `contenteditable`

- Durchgängig `contenteditable="plaintext-only"` (außer `#text` mit `contenteditable="true"` für Rich-Text-Light).
- **`interactive-widget=resizes-content`** verkleinert das Layout-Viewport bei geöffneter Bildschirmtastatur.
- **`virtualKeyboardPolicy="manual"`** + `navigator.virtualKeyboard.show()` optional bei Nutzung eines eigenen Bottom-Sheet-Overlays, um Layout-Sprünge beim Einblenden zu verhindern.
- Vorhandene Paste-Flattening-Logik in `UIProtections` bleibt unter Chrome 150+ unverändert aktiv.

---

## 5. Touch-Ziele und Interaktionsgrößen (48 × 48 px)

Chrome/Lighthouse empfiehlt mindestens **48 × 48 CSS-Pixel** (WCAG 2.2 Minimum: 24 × 24 px, Empfehlung: 44 × 44 px).

```css
@media (max-width: 768px) {
  .btn,
  .seitenleiste-switch-row,
  .seitenleiste-select {
    min-height: 48px; /* oder 44px */
  }
  .btn-icon {
    min-width: 48px;
    min-height: 48px;
  }
  /* Abstand zwischen Zielen */
  .seitenleiste-btn-row { gap: 12px; }
}
```

Für die nativen `<input type="checkbox" switch>`-Elemente (`btn-hilfslinien-switch`, `toggle-copyfit`, `toggle-anlagen`, `toggle-fuss`) wird die umgebende Zeile als Touch-Ziel vergrößert (`padding-block: 8px`) oder die Switch-Größe auf 44 × 26 px angehoben.

---

## 6. Anchor Positioning für Popover auf kleinen Bildschirmen

Für `#anschrift-vorschlaege` und `#plz-suggestions-popover` deklarative Fallback-Positionen (Chrome 143+ / 150+) nutzen, damit das Dropdown bei geöffneter Tastatur nicht aus dem Viewport ragt:

```css
#anschrift-vorschlaege {
  position-try-fallbacks: flip-block, flip-inline;
  max-height: min(250px, 40svh);
}
```

---

## 7. Konkrete Reihenfolge für die Umsetzung

1. **Viewport-Meta erweitern** (`viewport-fit=cover`, `interactive-widget=resizes-content`) in `website/index.html`.
2. **Bottom Sheet für die Sidebar** bauen (`<dialog data-position="bottom">`, Trigger-Button, `max-height: 85svh`, `padding-bottom: env(safe-area-inset-bottom)`).
3. **Blatt-Scroll-Verhalten** festlegen (`#viewport { overflow: auto; place-items: start; }`, `din-a4 { min-width: 500px; }`).
4. **Touch-Ziele vergrößern** (`min-height: 48px` für `.btn`, Switch-Zeilen und Selects; `gap: 12px`).
5. **Popover-Fallbacks** für `#anschrift-vorschlaege` und `#plz-suggestions-popover` ergänzen (`position-try-fallbacks: flip-block, flip-inline`).
6. **Optional: Feld-Fokus-Overlay** für `#text` und `#betreff` mit Caret-Helfern aus `website/js/document.js`.

---

## 8. Weiterführende Upstream-Quellen

| Thema | Quelle |
|---|---|
| `svh`/`dvh`/`lvh` und der 100vh-Bug | OpenReplay: „When 100vh Lies“ |
| Viewport-Meta, Safe Areas, `interactive-widget` | W3Tweaks: „The Viewport Meta Tag“ |
| Chrome Tap-Target-Audit (48×48 px) | Chrome for Developers: „Tap targets“ |
| Native Bottom Sheets mit `<dialog>` + Popover | DEV Community: „Native-like bottom sheets on the web“ |
| `env()` und `safe-area-inset-*` | CSS-Tricks: „env()“ |
| `interactive-widget=resizes-content` | GitHub (Gemini/Open WebUI) |
| `virtualKeyboardPolicy` | MDN / W3C VirtualKeyboard API |
| Container Queries und `cqi` | Chrome for Developers / web.dev |
| Anchor Positioning Fallbacks | Chrome for Developers (Chrome 143+) |

## Messung 2026-11-06

- Seitenleiste fix: --seitenleiste-breite 18.75rem (base.css:172), inline-size/min/max in sidebar.css:13-15.
- 8 Media Queries im gesamten CSS, keine einzige zu Viewport-Breite (nur print, prefers-reduced-motion, forced-colors).
- touch-action: pan-y auf der Leiste (sidebar.css:27), touch-action: none auf dem Blatt.
