---
title: "ADR: JavaScript Constraints & 'JS as a Crutch'"
status: accepted
date: 2026-05-24
deciders: morit, antigravity
tags: [obsidian, adr, js, scripting, event-handling, dom-selection, constraints]
aliases: ["JavaScript Constraints & 'JS as a Crutch'"]
related: ["[[ADR-HTML]]", "[[ADR-CSS]]", "[[longevity-guidelines]]"]
---

# Architectural Decision Record (ADR): JavaScript Constraints & "JS as a Crutch"

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Moderne Webapplikationen neigen dazu, JavaScript für visuelle Effekte, Rendering-Operationen und Layout-Berechnungen einzusetzen. Dies erhöht die Fehleranfälligkeit, verschlechtert die Ladezeit und führt zu technischer Schuld. Im **DIN-BriefNEO**-Projekt soll JavaScript streng auf eine logische Begleitschicht reduziert werden.

---

## Entscheidungen

### 1. Striktes JS-Einsatzverbot für Styling & Rendering
Jegliche JavaScript-gestützte Steuerung von visuellen Effekten, Layout-Rendern oder CSS-Styles ist verboten.
*   **Keine Ausnahmen:** Da wir exklusiv für moderne Laufzeitumgebungen ab Chrome 148+ entwickeln, wird selbst die schwebende Textauswahl-Toolbar (`#format-toolbar`) rein CSS-basiert über **CSS Anchor Positioning** an die Selektion verankert. Es wird keinerlei JS zur Koordinaten-Berechnung benötigt.
*   **Begründung:** Stabilität, Robustheit und eine saubere Codebasis. Das Layout bleibt stabil, selbst wenn JavaScript abstürzt oder im Browser blockiert wird.

### 2. Reglementierte Aufgabenbereiche für JavaScript
JavaScript darf ausschließlich für folgende sechs Aufgabenbereiche eingesetzt werden:
1.  **Textauswahl & Format-Aktionen:** Ein gedrosselter `selectionchange`-Listener (50ms Debounce) steuert ausschließlich die Sichtbarkeit (Sichtbar-Zustand des Popovers) und setzt bei Klick Formatierungen über die Selection & Range API um. Die Positionierung der Toolbar erfolgt rein über CSS Anchor Positioning.
2.  **Sicherer Paste/Drop-Schutz:** Abfangen von Paste- und Drop-Events auf `#brieftext`, um HTML-Formatmüll unnachgiebig zu entfernen und ausschließlich reinen Plaintext (`text/plain`) einzufügen.
3.  **Daten-Synchronisation & Auto-Save:** Automatisches Speichern und Laden von Textinhalten in den LocalStorage bei jeder Eingabe.
4.  **Externe API-Anfragen:** Abfragen an Photon, Geoapify (inklusive Heartbeat-Check) und Zippopotam.
5.  **Toast-Queue & Popover-Lifecycle:** Verwaltung der Toast-Warteschlange zur Vermeidung von überlappenden Einblendungen.
6.  **Datum-Autobefüllung:** Nativer Einsatz der **W3C Temporal API** (`Temporal.Now.plainDateISO()`) zur zeitzonensicheren, unveränderlichen und fehlerfreien Bestimmung des lokalen Systemdatums im normativem deutschen Format beim Erststart.


### 3. Verbot von veraltetem `execCommand` für Custom-Formate
Für Zitate (`<blockquote>`) nutzen wir die native Selection & Range API (`extractContents` / `insertNode`) zum sauberen Wrappen und Entpacken (Unwrap) des DOMs.
*   **Zustandserkennung:** Wir ermitteln die aktiven Formate (Fett, Unterstrichen, Zitat) über eine zukunftssichere, native DOM-Baum-Traversierung nach oben bis zum Container `#brieftext`. Wir verzichten komplett auf veraltete APIs (wie `queryCommandState`).
*   **Shortcuts:** Wir überlassen standardmäßige Shortcuts (`Strg+B` / `Strg+U`) dem nativen Standardverhalten des Browsers im `contenteditable`-Bereich. Es werden keine eigenen Keydown-Handler für diese Shortcuts geschrieben.

### 4. Native View Transitions API für flüssige Zustandsübergänge
Wir kapseln alle Benutzer-initiierten UI-Layoutänderungen (z. B. Umschalten zwischen Form A und Form B) sowie Theme-Wechsel (Hell/Dunkel/Auto) vollständig in der modernen W3C View Transitions API (`document.startViewTransition()`).
*   **Begründung:** Durch die native Kapselung entfällt das Schreiben von manuellen CSS-Animationsklassen oder komplexen JavaScript-basierten Fade-Operationen. Der Browser erzeugt automatisch Vorher-Nachher-Snapshots und animiert die Layout-Elemente mit maximaler Hardware-Beschleunigung und seidenweichen Übergängen direkt auf der Render-Pipeline.
*   **Fallback:** Sollte das Feature nicht unterstützt werden, wird die Zustandsänderung synchron als direkter Fallback ohne visuelle Übergänge ausgeführt, wodurch die App abwärtskompatibel bleibt.


---

## Konsequenzen
*   **Vorteile:**
    *   Schlanker Code (<18 KB JavaScript insgesamt).
    *   Zukunftssichere APIs (Selection/Range, Popover).
    *   Hocheffizientes Drosseln verhindert Performance-Engpässe bei Mausbewegungen.
*   **Nachteile:**
    *   Erhöhter CSS-Einsatz für visuelle Statustoggles (z. B. Segmented Controls, Guides).

---

## Verknüpfungen
*   Siehe [[ADR-HTML|ADR-HTML.md]] für `contenteditable` und native Popover.
*   Siehe [[ADR-CSS|ADR-CSS.md]] für die reinen CSS-Zoom-Techniken.
*   Siehe [[ADR-API|ADR-API.md]] für API-Vorschriften.
*   Siehe [[ADR-FEATURE|ADR-FEATURE.md]] für Details zur Toast-Queue und Toolbar.
*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] für das Verbot von Frameworks.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.

### 5. Canvas-Komprimierung fOr groYe Binrdaten
Wir nutzen ein unsichtbares OffscreenCanvas oder regulres <canvas> (wie im SignatureFeature), um vom Nutzer hochgeladene Bilder clientseitig massiv zu komprimieren (max 400px), bevor sie als Base64 im localStorage gespeichert werden. Dies verhindert das schnelle Sprengen des 5MB Speicherlimits und zementiert die serverlose, offline-fhige Architektur der Anwendung.


## Feature Checks
```javascript feature-check
f("Temporal API", typeof globalThis.Temporal !== "undefined", "Chrome 146", "Future-Proof"),
f("View Transitions (Scoped)", typeof document.startViewTransition !== "undefined", "Chrome 146", "Future-Proof"),
f("Sanitizer API (Native)", typeof globalThis.Sanitizer !== "undefined", "Chrome 147", "Future-Proof"),
f("Promise.withResolvers()", typeof Promise.withResolvers !== "undefined", "Chrome 119", "Produktiv")
```
