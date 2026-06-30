---
title: "ADR: HTML Architecture & Semantic Structure"
status: accepted
date: 2026-05-24
deciders: morit, antigravity
tags: [obsidian, adr, html, semantics, contenteditable, popover]
aliases: ["HTML Architecture & Semantic Structure"]
related: ["[[ADR-CSS]]", "[[ADR-JS]]", "[[longevity-guidelines]]"]
---

# Architectural Decision Record (ADR): HTML Architecture & Semantic Structure

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Klassische Texteditoren basieren oft auf riesigen, unübersichtlichen DOM-Bäumen und JavaScript-basierten Dialogen. Für den **DIN-BriefNEO**-Editor soll eine Struktur etabliert werden, die maximal wartbar, nativ barrierefrei, extrem performant und standardkonform ist. Die semantische Struktur soll den Browser-eigenen Dokumentenfluss respektieren und unnötige JavaScript-Krücken vermeiden.

---

## Entscheidungen

### 1. IMR 4.0 Custom Elements für Geometrie-Bereiche
Wir nutzen semantische HTML5 Custom Elements (z. B. `<din-a4>`, `<din-absender>`, `<din-anschriftfeld>`, `<din-infoblock>`, `<din-kern>`, `<din-text>`, `<din-fuss>`).
*   **Begründung:** Dies ermöglicht eine glasklare Trennung der DIN 5008 Geometriebereiche im CSS und erhöht die semantische Lesbarkeit des Dokuments drastisch.
*   **Verweis:** Siehe [[din-5008-geometry|din-5008-geometry.md]] für die exakten Geometrie-Vorgaben.

### 2. Native HTML Popover API & Dialogs
Für alle Popups (wie die schwebende Textauswahl-Toolbar und Toasts) nutzen wir das native HTML-Attribut `popover="manual"`.
*   **Begründung:** Native Popovers werden vom Browser automatisch im **Top-Layer** über allen anderen Elementen gerendert. Dies verhindert CSS-Z-Index-Kollisionen und macht Hilfsbibliotheken komplett überflüssig.

### 3. Strikte contenteditable-Reglementierung
*   Alle einzeiligen Metadaten-Felder (Betreff, Anschrift, Ränder, Infoblock) nutzen `contenteditable="plaintext-only"`.
*   Der Brieftext selbst (`#brieftext`) nutzt `contenteditable="true"`.
*   **Begründung:** `plaintext-only` verhindert nativ, dass der Benutzer formatierten HTML-Müll (z. B. Schriftgrößen oder Webfarben) in strukturelle Briefbereiche einfügt, während `contenteditable="true"` im Brieftext gezieltes Fett-, Unterstreichungs- und Zitat-Styling erlaubt.
*   **Verweis:** Siehe [[ADR-JS|ADR-JS.md]] für den dazugehörigen JavaScript Paste/Drop-Filter.

### 4. Barrierefreiheit (A11y)
*   Die Toolbar-Buttons erhalten bei aktiver Formatierung das Attribut `aria-pressed="true"`, andernfalls `aria-pressed="false"`.
*   Alle interaktiven Steuerelemente besitzen eindeutige IDs für Web-Tests und Screenreader.

---

## Konsequenzen
*   **Vorteile:**
    *   Glasklare, lesbare DOM-Struktur.
    *   Hervorragende Barrierefreiheit ohne JavaScript-Bibliotheken.
    *   Keine Z-Index-Kämpfe im Top-Layer.
*   **Nachteile:**
    *   `contenteditable="plaintext-only"` erfordert Chromium-basierte Browser (Chrome 148+, Edge), was durch unsere Baseline-Festlegung abgedeckt ist.

---

## Verknüpfungen
*   Siehe [[ADR-CSS|ADR-CSS.md]] für das proportionale Styling der Custom Elements.
*   Siehe [[ADR-JS|ADR-JS.md]] für die Validierung und Steuerung der Editables.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] für das Verbot von Frameworks.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.
