---
title: Modern CSS Features ab Chrome 148+
status: active
tags: [documentation, guide, manual]
---

# Modern CSS Features ab Chrome 148+

Da die Anwendung exklusiv für moderne Browser-Installationen ab Chrome 148+ entwickelt wird, können wir modernste APIs einsetzen. Dieses Dokument dient als Entwicklungs-Referenz für die erlaubten und empfohlenen Features.

---

## 1. Hell-/Dunkelmodus mit `light-dark()`
Keine JavaScript-Klassen-Toggles oder doppelte CSS-Regelsätze mehr. Wir definieren unsere Themes nativ über Custom Properties:

```css
:root {
  /* Browser anweisen, beide Farbschemen zu unterstützen */
  color-scheme: light dark;

  /* Farbräume dynamisch zuweisen */
  --bg-primary: light-dark(#ffffff, #121212);
  --text-primary: light-dark(#111111, #eeeeee);
  --border-color: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.15));
}
```

---

## 2. Der `oklch()` Farbraum
Für moderne Farbverläufe und barrierefreie Kontraste nutzen wir OKLCH. Es bietet im Vergleich zu HEX oder RGB einen wahrnehmungsbasierten Farbraum, in dem Helligkeitsänderungen konsistent wirken.

```css
:root {
  /* oklch(Luminanz Chroma Farbton) */
  --accent-color: oklch(65% 0.25 140); /* Leuchtendes, sattes Grün */
  --accent-hover: oklch(60% 0.23 140);
  --danger-color: oklch(62% 0.22 28);  /* Sattes Signalrot */
}
```

---

## 3. CSS Anchor Positioning
Tooltips und Dropdown-Menüs können im Markup frei platziert (z. B. am Ende des Bodys) und über CSS relativ an ein anderes Element verankert werden, ohne JavaScript zu bemühen:

```css
/* Der Auslöser */
#btn-open-menu {
  anchor-name: --menu-trigger;
}

/* Das Popover / Tooltip */
#dropdown-menu {
  position: absolute;
  position-anchor: --menu-trigger;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 4px;
}
```

---

## 4. `field-sizing: content`
Ideal für editierbare Formulare oder den Fließtext des Briefes. Eingabefelder passen ihre Größe dynamisch der Textmenge an, ohne dass das Layout springt.

```css
textarea, input[type="text"], [contenteditable] {
  field-sizing: content;
  min-width: 100px;
}
```

---

## 5. Die `:has()` Pseudo-Klasse (Parent Selector)
Die mächtigste CSS-Erweiterung der letzten Jahre. Sie ermöglicht es uns, übergeordnete Elemente basierend auf dem Zustand ihrer Kinder zu stylen:

```css
/* Ändert die Hintergrundfarbe des Viewports, wenn die Guides-Checkbox ausgewählt ist */
#paper-viewport:has(#state-guides:checked) din-a4 {
  --guide-opacity: 0.15;
}

/* Sidebar verkleinern, wenn ein Toggle aktiv ist */
#app-shell:has(#sidebar-collapse:checked) {
  grid-template-columns: 80px 1fr;
}
```

---

## 6. HTML Popover API & Invoker Commands
Einblenden und Schließen von Menüs und Dialogen ohne eine einzige Zeile JavaScript-EventListener:

```html
<!-- Der Auslöser -->
<button popovertarget="debug-menu">🛠️ Debug-Menü</button>

<!-- Das Popover-Element -->
<div id="debug-menu" popover>
  <h4>Entwickler-Werkzeuge</h4>
  <p>Status: Aktiv</p>
</div>
```
