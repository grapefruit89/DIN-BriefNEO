---
id: adr-html
title: 'ADR-HTML: HTML Architecture & Semantic Structure'
type: adr
status: active
created: '2026-06-26'
updated: '2026-07-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-CSS
  - ADR-JS
  - ADR-ANTIPATTERN
  - longevity-guidelines
code_links:
  - website/index.html
error_patterns:
  - html architektur
  - custom elements
  - contenteditable
  - plaintext-only
  - popover
  - din-a4
  - semantik
  - premium ux
  - wysiwyg
  - toolbar
  - anchor positioning
  - überlauf
supersedes:
  - adr-feature
depends_on: []
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

- **Native Popovers & Top-Layer:** Dialoge & Toolbars nutzen `popover="manual"` für ein konfliktfreies Rendern im **Top-Layer** (ohne `z-index`-Hacks).

- **Strict WYSIWYG & In-Place Editing (ehemals ADR-FEATURE):**
  Eingaben finden *ausschließlich* direkt auf dem virtuellen Papierbogen statt. Die Sidebar dient rein globalen Einstellungen (Toggles, Profile). Formularelemente werden nicht doppelt in einer Seitenleiste gespiegelt.

- **Kontextuelle Formatierungs-Toolbar (WhatsApp-Style, ehemals ADR-FEATURE):**
  Die Format-Toolbar schwebt als echtes Popover direkt am Textcursor und verankert sich per nativem CSS Anchor Positioning an der aktuellen Textselektion. JavaScript ist strikt von Positionsberechnungen (`getBoundingClientRect`) befreit und steuert lediglich Sichtbarkeit sowie Text-Range-Befehle (ohne `execCommand`).

- **Toasts & Dialoge (Top-Layer-Delegation, ehemals ADR-FEATURE):**
  Benachrichtigungen nutzen die native Popover API. Ein- und Ausblendanimationen werden vollständig an CSS (`@starting-style`, `transition-behavior: allow-discrete`) delegiert, sodass JavaScript keine Timer-Animationen rechnen muss.

- **Editierbarkeit:** Einzeilige Metadaten (Betreff, Anschrift) nutzen `contenteditable="plaintext-only"`. Nur der Briefkörper (`#brieftext`) nutzt `contenteditable="true"`.

- **A4-Überlauf-Erkennung (ehemals ADR-FEATURE):**
  JS prüft defensiv die Texthöhe (max. ca. 120 mm) und setzt bei Überschreitung der DIN-Grenzen eine Warn-Klasse für den visuellen Indikator, ohne erzwungene Scrollbalken auf dem Dokument zu provozieren.

- **Barrierefreiheit:** ARIA-Attribute (`aria-pressed="true/false"`) werden nativ für Toolbar-Buttons gepflegt.

## 4. Consequences

### Positive Auswirkungen

- **Maximale Lesbarkeit & Performance:** Der DOM-Baum ist selbsterklärend und semantisch korrekt; Popovers im Top-Layer sind vollständig hardwarebeschleunigt.

- **Wartungsfreiheit:** Keine externen UI-, Dialog- oder Toolbar-Libraries nötig.

- **Sicherheit:** `plaintext-only` schützt Strukturfelder zuverlässig vor unerwünschten Formatierungen aus der Zwischenablage.

### Risiken & Negative Auswirkungen

- `contenteditable="plaintext-only"` erfordert Chromium-basierte Browser (Chrome 148+, Edge).

- **Contenteditable Integrity Risk:** Das direkte Verschachteln von strukturellen oder interaktiven Elementen (wie z.B. `<img id="signature-image">`) als Kind-Elemente von `contenteditable="true"` führt bei Texteingabe zwingend zum Verlust der Struktur, da der Browser den inneren DOM-Baum rigoros überschreibt. Lösung: Immer als Geschwister-Elemente in einem isolierten Wrapper kapseln (Siehe Law Catalog A47).

## 5. Implementation & Verification

- Alle Brief-Elemente im `index.html` sind als `<din-*>` Tags deklariert.

- Popovers, Kontext-Toolbars und Toasts nutzen das `popover`-Attribut im Top-Layer.

- CSS Anchor Positioning und `@starting-style` steuern Toolbars und Einblendungen ohne JS-Positionslogik.

- Einhaltung von WYSIWYG und Zero-JS-Styling wird durch das Fitness Gate (`tools/reconciliation.js`) überprüft.

## 6. Related Documents

- [[ADR-CSS]]

- [[ADR-JS]]

- [[ADR-ANTIPATTERN]]

- [[longevity-guidelines]]