---
tags: [aviation-grade, platinum-2026, architecture, chrome-146, incremental]
status: cemented
version: 1.0.0
last_audit: 2026-03-21
id: BRAIN-015
title: Chrome 146+ Modernisierungs-TODO — Kein Legacy
mandate: Ziel-Browser Chrome 145+. ALLES was dort nativ geht wird nativ. Kein @supports-Guard nötig.
---

# 15 — Chrome 146+ TODO: Vollständige JS→Native Substitution

> Kein Bock auf Legacy. Kein @supports. Kein Polyfill.
> Chrome 145+ ist die Baseline. Was dort läuft, wird implementiert.

---

## BLOCK A — SOFORT (0 Risiko, maximaler Gewinn)

### A-1: execCommand() LÖSCHEN — Strategische Entfernung
- Datei: js/ui/ui.js, Methode _bindTagInputs()
- Was: document.execCommand('bold'/'italic'/'underline') Toolbar-Bindings
- Warum Dead Code: ADR-008 — plaintext-only ignoriert execCommand strukturell.
  Browser verweigert HTML-Injektion. Die Buttons klicken ins Leere.
- Strategischer Schutz: Entfernen verhindert, dass ein zukünftiger Dev
  plaintext-only zurückdreht um die Toolbar zu "reparieren" → ADR-008 wäre gebrochen.
- Aktion: Toolbar reduzieren auf Undo/Redo + Markdown-Cheatsheet [popover]

### A-2: Import-Button → Native label
- Datei: index.html + js/ui/ui.js _bindActions()
- Was: on('btn-import-trigger', () => fileInput.click())
- Ersatz: label for="file-import" — HTML-Standard, 0 JS
- Aktion: 1 EventListener löschen, button durch label ersetzen

### A-3: @scope (#paper) um @layer din.core
- Datei: css/din5008-paper.css
- Was: din-*-Selektoren haben globale Dokument-Reichweite
- Ersatz: @scope (#paper) { @layer din.core { din-subject { ... } } }
- Chrome: 118+ Baseline 2024 — kein Guard bei 145+
- Nutzen: din-*-Selektoren STRUKTURELL unmöglich außerhalb #paper

### A-4: @starting-style für Toast-Animationen
- Datei: css/sidebar.css + js/ui/ui.js _toast()
- Was: JS opacity-Wechsel via setTimeout für Fade-In
- Ersatz CSS:
    .toast { opacity: 1; transition: opacity 0.3s; }
    @starting-style { .toast { opacity: 0; } }
- Chrome: 117+ Baseline 2024 — JS-Timer für Einblendung entfällt

### A-5: interpolate-size: allow-keywords global
- Datei: css/din5008-paper.css :root {}
- Was: height: 0 → height: auto nicht animierbar ohne JS
- Ersatz: :root { interpolate-size: allow-keywords; }
- Chrome: 129+ — 1 Zeile, global wirksam für alle Transitions

### A-6: field-sizing: content für Textarea
- Datei: css/sidebar.css + index.html #akinator-output
- Was: JS scrollHeight-Hack für Auto-Resize
- Ersatz: textarea { field-sizing: content; min-height: 3lh; }
- Chrome: 123+ — 1 Property, 0 JS

### A-7: Sanitizer API setHTML() für Ghost-Mirror
- Bei Ghost-Mirror-Implementierung direkt einbauen
- Chrome: 116+ (vollständig 146+)
- Whitelist: ['strong','em','del','code','blockquote','ul','ol','li','br']
- element.setHTML(html, { sanitizer: new Sanitizer({ allowElements: [...] }) })
- Kein XSS-Risiko bei Markdown→HTML-Konversion

### A-8: @property für ALLE 14 CMA-Variablen
- Datei: css/din5008-paper.css
- Was: --subject-top: 103.4mm ist untypisierter String — nicht validiert, nicht animierbar
- Ersatz:
    @property --subject-top { syntax: "<length>"; initial-value: 103.4mm; inherits: true; }
    (für alle 14 CMA-Konstanten)
- Chrome: 85+ (längst stabil bei 145+)
- Nutzen: Browser-Validierung. Falsches Typo --subject-top: "103mm4" → Browser-Fehler.
  Animierbar für zukünftige Übergänge. Kein JS-Overhead.

### A-9: calc-size() für Akkordeon-Animationen
- Details-Elemente, Sidebar-Sections
- Chrome: 129+ (calc-size), 131+ (::details-content Pseudo-Element)
- Ersatz:
    details::details-content { height: 0; overflow: clip; transition: 300ms allow-discrete; }
    details[open]::details-content { height: calc-size(auto, size); }
- Kein JS-Höhen-Rechner mehr

---

## BLOCK B — INVOKER COMMANDS (Chrome 133+)

Bei Chrome 145+ als Ziel kein Fallback nötig für Chrome.
Firefox noch nicht → wenn Projekt Chrome-only: sofort. Sonst Shim.

### B-1: Alle Dialog-Buttons umschreiben
- Betrifft: btn-profile, btn-profile-save, btn-dev-reset, alle Closer
- Vorher: dialog.showModal() / hidePopover() via EventListener
- Nachher: commandfor="dlg-profil" command="show-popover" am button
- JS addEventListener komplett entfernen für Standard-Dialog-Ops

### B-2: popovertarget → commandfor Migration
- Alle bestehenden popovertarget-Attribute ersetzen
- commandfor/command ist sprechender, zukunftssicher, spec-konform

---

## BLOCK C — CSS ANCHOR POSITIONING (Chrome 125+)

Kein @supports bei 145+ als Ziel. Direkter Einsatz.

### C-1: Grußformel-Validierungshinweis neben din-greeting
- Aktuell: aria-invalid setzt nur outline — kein erklärender Kontext-Hinweis
- Neu:
    din-greeting { anchor-name: --din-greeting; }
    .greeting-hint { position-anchor: --din-greeting; left: anchor(right); top: anchor(top); }
- Kein getBoundingClientRect, kein JS-Positions-Rechner

### C-2: Markdown-Cheatsheet Popover neben din-body
- Erscheint bei Fokus via :has(), positioniert via Anchor Positioning
- Kein JS für Positionierung

### C-3: IBAN-Validierungs-Tooltip neben #p-iban
- Ersetzt Toast unten rechts durch kontextuellen Hinweis direkt am Feld

### C-4: Alle din-* Tags als eigene Anker (IMR-Erweiterung)
- Pattern: din-subject { anchor-name: --din-subject; }
- TAG = KEY = KOORDINATE = CSS-ANKER
- Maximale IMR-Isomorphie — 4. Dimension der Drei-Einheit

---

## BLOCK D — RELATIVE COLOR SYNTAX (Chrome 119+)

### D-1: Sidebar-Farben aus einer Basis mathematisch ableiten
- Datei: css/sidebar.css
- Was: Hover/Active-Farben sind hardcoded Duplikate
- Ersatz:
    --sidebar-bg: oklch(20% 0.02 250);
    .sidebar-btn:hover { background: oklch(from var(--sidebar-bg) calc(l + 0.05) c h); }
- 1 Farbwert → alle Varianten mathematisch abgeleitet, kein Duplicate

---

## BLOCK E — SCROLL-DRIVEN ANIMATIONS (Chrome 115+)

### E-1: Brief-Overflow-Indikator am Paper-Rand
- Wenn din-body Inhalt länger als 1 Seite → visueller Hinweis
- animation-timeline: scroll() auf Overflow-Badge
- Kein JS für Scroll-Position-Tracking

### E-2: Seiten-Progress-Bar (SPEC-029, mehrseitig)
- animation-timeline: scroll() für Seite-1/2-Fortschrittsanzeige

---

## BLOCK F — TYPED attr() VORBEREITUNG (~Chrome 150, Tier-3)

### F-1: data-cma-* an alle din-* Tags in index.html schreiben
- Referenz: 08_isomorphic_schema_v2.2.0.md Sektion J (vollständige Tabelle)
- Heute harmlos. Wenn Typed attr() GA: initCMABridge() löschen.
- top: attr(data-cma-top type(<length>)) → CMA-Bridge tot

---

## PRIORISIERUNG

JETZT (diese Session / nächste Session):
  A-1  execCommand löschen          ← Dead Code, 0 Risiko
  A-2  label für Import             ← 5 Minuten
  A-3  @scope (#paper)              ← Strukturelle Sicherheit
  A-4  @starting-style Toasts       ← JS-Timer weg
  A-5  interpolate-size             ← 1 Zeile
  A-8  @property alle CMA-Vars      ← Typsicherheit

NÄCHSTE SPEC-RUNDE:
  B-1/B-2  Invoker Commands
  C-1..C-4 Anchor Positioning + IMR 4. Dimension
  A-6  field-sizing
  A-7  Sanitizer API (bei Ghost-Mirror)
  A-9  calc-size()
  D-1  Relative Color Syntax
  E-1  Scroll-Driven Overflow-Indikator

ZUKUNFT (~Chrome 150):
  F-1  Typed attr() → CMA-Bridge entfällt komplett

---

## UNVERZICHTBARES JS — KEIN NATIVER ERSATZ (NIEMALS)

  deriveSalutation()    Anrede-Matrix, deutsche Fachlogik
  validateIBAN()        BigInt Modulo-97 Prüfsumme
  StateManager Proxy    Undo/Redo History Stack
  parseRecipient()      Textanalyse + Genus-Erkennung
  readDOMasJSON()       IMR-Tag-Scanner
  Blob/FileReader       Export + Import
  ghostIBAN()           Dynamischer Tipp-Overlay
  Ctrl+S / Ctrl+P       Keyboard-Shortcuts

Netto-Bilanz nach vollständiger Umsetzung:
  ~715 Zeilen JS gesamt heute
  ~560 Zeilen Fachlogik — bleiben (unverzichtbar)
  ~155 Zeilen eliminiert (~22%)
  Eliminiert: DOM-Manipulation, Event-Binding — die fragilen Teile.
  Was bleibt: deterministische Fachlogik. Das ist der Wert.
