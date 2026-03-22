# Claude Brief — DIN 5008 Generator

Modularer, Zero-Dependency DIN 5008 Brief-Generator.

## Struktur

```
Claude Brief/
├── index.html               ← Einstiegspunkt (ES6 module entry)
├── css/
│   ├── typography.css       ← @font-face + Schrift-System
│   ├── layout.css           ← App-Chrome, Sidebar, Dialoge, Toasts
│   └── din5008.css          ← Papier-Physik, DIN-Maße, Print-Engine
├── js/
│   ├── state.js             ← StateManager (Proxy, Undo/Redo, localStorage)
│   ├── logic.js             ← Reine Logik (Datum, Anrede, IBAN, Adresse)
│   ├── ui.js                ← DOM-Controller (Cursor-Guard, Events, Dialoge)
│   └── app.js               ← Orchestrator (Boot-Sequenz)
└── assets/
    └── fonts/
        └── README.md        ← Anleitung für lokale Schriften
```

## Starten

Einfach `index.html` in einem modernen Browser öffnen — kein Build-Schritt nötig.

> **Hinweis:** ES6 Module benötigen einen HTTP-Server (nicht `file://`).
> Empfehlung: [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
> in VS Code, oder:
> ```
> npx serve .
> ```

## Technische Highlights

- **Zero Dependencies** — 100 % Vanilla JS (ES6 Module)
- **Cursor-Safety** — DOM-Updates prüfen `document.activeElement` vor jedem Schreiben
- **Proxy-State** — reaktiver Datenkern mit Undo/Redo (60 Schritte)
- **Offline-First** — alle Daten in `localStorage`
- **DIN 5008 exact** — Form A (32 mm) / Form B (45 mm) umschaltbar
- **Multi-Page Print** — `break-inside: avoid` + `orphans/widows` für saubere PDF-Ausgabe
- **Anrede-Matrix** — formal / modern / locker × Herr / Frau / keine

## Lokale Schriften (optional)

Siehe `assets/fonts/README.md`.
