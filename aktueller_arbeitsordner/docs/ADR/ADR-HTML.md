---
aliases:
- HTML Architecture & Semantic Structure
chosen_option: ''
created: '2026-07-06'
date: 2026-05-24
deciders:
- morit
- antigravity
decision_options: []
depends_on: []
last-reviewed: 2026-07-02
project: DIN-BriefNEO
related:
- '[[ADR-CSS]]'
- '[[ADR-JS]]'
- '[[longevity-guidelines]]'
status: accepted
tags:
- adr
- html
- semantics
- contenteditable
- popover
title: 'ADR-HTML: HTML Architecture & Semantic Structure'
type: adr
updated: '2026-07-06'
---

# ADR-HTML: HTML Architecture & Semantic Structure

## 1. Context & Problem

**Strukturierung des Brief-Editors ohne überladenes DOM.**
- Klassische Texteditoren nutzen tiefe div-Suppen und komplexe JS-Dialoge.
- Der DIN-BriefNEO-Editor muss leichtgewichtig, nativ barrierefrei, performant und extrem standardkonform aufgebaut sein.
- Es muss verhindert werden, dass Nutzer versehentlich formatierte Inhalte in reine Datenfelder kopieren.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Native HTML5) | Custom Elements (`<din-*>`), `popover="manual"`, `contenteditable="plaintext-only"` | Zero Dependencies, semantic DOM, nativer Top-Layer | `plaintext-only` braucht moderne Browser | Keine | **Gewählt** |
| **Option B** (Div-Suppe + JS) | Alles in `<div>`, Dialoge über z-index und JS gesteuert | Abwärtskompatibel | `z-index` Kämpfe, schwere Lesbarkeit, JS-Aufwand | Hoher Wartungsaufwand | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Striktes HTML5 & Native APIs) entschieden.**

### Begründung
- **Custom Elements:** Wir nutzen semantische HTML5 Custom Elements (`<din-a4>`, `<din-absender>`, etc.), um Geometriebereiche im CSS klar zu trennen und die DOM-Lesbarkeit zu erhöhen.
- **Native Popovers:** Dialoge & Toolbars nutzen `popover="manual"` für ein konfliktfreies Rendern im **Top-Layer** (ohne `z-index`-Hacks).
- **Editierbarkeit:** Einzeilige Metadaten (Betreff, Anschrift) nutzen `contenteditable="plaintext-only"`. Nur der Briefkörper (`#brieftext`) nutzt `contenteditable="true"`.
- **Barrierefreiheit:** ARIA-Attribute (`aria-pressed="true/false"`) werden nativ für Toolbar-Buttons gepflegt.

## 4. Consequences

### Positive Auswirkungen
- **Maximale Lesbarkeit:** Der DOM-Baum ist selbsterklärend und semantisch korrekt.
- **Wartungsfreiheit:** Keine externen UI- oder Dialog-Libraries nötig.
- **Sicherheit:** `plaintext-only` schützt Strukturfelder zuverlässig vor unerwünschten Formatierungen aus der Zwischenablage.

### Risiken & Negative Auswirkungen
- `contenteditable="plaintext-only"` erfordert Chromium-basierte Browser (Chrome 148+, Edge).

## 5. Implementation & Verification

- Alle Brief-Elemente im `index.html` sind als `<din-*>` Tags deklariert.
- Popovers und Toolbars nutzen das `popover`-Attribut.
- Einhaltung wird durch die Anti-Pattern Linter-Regeln für JS-basiertes Styling überprüft.

## 6. Related Documents

- [[ADR-CSS]]
- [[ADR-JS]]
- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]