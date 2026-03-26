---
tags: [aviation-grade, platinum-2026, architecture, constitution]
status: cemented
version: 2.0.0
last_audit: 2026-03-23
id: BRAIN-001-CONST
title: DIN-BriefNEO Constitution — Die architektonische Verfassung
supersedes: constitution_v1.0.0.md
---

# 01 — DIN-BriefNEO Constitution v2.0.0

## I. DIE OBERSTEN GESETZE (SSoT)

### §1 Technologische Hierarchie (The Aviation Pyramid)
Jedes Feature MUSS auf der niedrigstmöglichen Ebene implementiert werden:
1. **Nativ HTML** (Struktur, Semantik, Interaktion via Popover/Commanders)
2. **Nativ CSS** (Layout via `@layer`, Präzision via `mm`, Logik via `:has()`)
3. **Vanilla JavaScript** (Datenhaltung/IMR, Ghost-Mirror Sync, LocalStorage)
4. **Public APIs** (Anonyme Dienste für PLZ/Zinsen — optional & resilient)

### §2 Das Mogel-Prinzip (Zero-Width-Marker)
Die physikalische 1:1 Druckvorschau ist heilig. 
- Im Editor sichtbare Markdown-Steuerzeichen (`*`, `_`) dürfen den Textfluss NICHT durch physikalische Breite beeinflussen.
- Lösung: `md-marker { display: inline-block; width: 0; overflow: hidden; }` im Mirror-Layer.

### §3 Rigidity Clause (Zonierung)
Das Dokument wird in zwei unverrückbare Kategorien unterteilt:
- **Kategorie A (Starre Kopfdaten):** Alle `din-*` Tags außer Body. Millimeter-präzise, einzeilig, `plaintext-only`.
- **Kategorie B (Flow-Zone Body):** Der `<din-body>`. Erlaubt dynamische Inhalte (Listen, Tabellen) und den Ghost-Mirror.

### §4 No-Mercy Baseline (Chrome 147+)
- Baseline: Google Chrome 147.0+.
- Strikte Nutzung nativer Features (Anchor Positioning, Invoker Commands, Sanitizer API).
- **VERBOT:** Keine Polyfills, keine `@supports` Guards, kein Backporting. Das System altert mit der Engine.

## II. MANDATE-FREZE (Visual Integrity)
Jeder Pixel-Shift nach der Initialisierung gilt als kritischer Systemfehler. Das Layout muss bei jedem Input-Event absolut stabil bleiben.

## III. DATEN-SOUVERÄNITÄT
Das JSON-Objekt ist die einzige Wahrheit der Daten. HTML ist nur das Gesicht. Wer das JSON kontrolliert, kontrolliert den Brief.
