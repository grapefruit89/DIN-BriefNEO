---
title: Fachbegriff-Glossar: glossary.md
status: active
tags: [documentation, guide, manual]
---

# Fachbegriff-Glossar: glossary.md

Dieses Glossar bietet eine alphabetisch sortierte Übersicht und Kurzerklärungen zu allen Kerntechnologien, Web-APIs und Konzepten, die im **DIN-BriefNEO**-Projekt verwendet werden.

---

## 🔤 Begriffslexikon

### `AbortController`
*   **Kurzdefinition:** Eine native JavaScript-API, mit der eine oder mehrere Webanfragen (z. B. `fetch`) vorzeitig abgebrochen werden können.
*   **Nutzen im Projekt:** Schützt vor Race Conditions bei der Adress-Autovervollständigung, indem alte Netzwerk-Requests sofort abgebrochen werden, wenn der Benutzer einen neuen Buchstaben eintippt.
*   **Verweis:** Siehe [ADR-API.md](../ADR/ADR-API.md#4-race-condition-schutz-via-abortcontroller) und [longevity-guidelines.md](longevity-guidelines.md).

### `container-type: size`
*   **Kurzdefinition:** Eine CSS-Eigenschaft, die ein HTML-Element als Container deklariert, dessen Abmessungen (Breite und Höhe) isoliert überwacht werden, um relationale Abfragen für Kind-Elemente zu ermöglichen.
*   **Nutzen im Projekt:** Deklariert auf dem `<din-a4>`-Blatt, um proportionale CSS-Layoutberechnungen unabhängig von der Skalierung des übergeordneten Fensters durchzuführen.
*   **Verweis:** Siehe [ADR-CSS.md](../ADR/ADR-CSS.md#2-container-queries--proportionale-einheiten-cqw--cqh) und [din-5008-geometry.md](din-5008-geometry.md).

### `cqw` / `cqh` (CSS Container Query Units)
*   **Kurzdefinition:** Proportionale CSS-Maßeinheiten, die sich auf genau 1 % der Breite (`cqw`) oder Höhe (`cqh`) des nächsten übergeordneten Containers beziehen.
*   **Nutzen im Projekt:** Alle Ränder, Abstände und Schriftgrößen des DIN-Briefs sind in `cqw` deklariert. Dadurch wächst und schrumpft das gesamte Layout pixelperfekt proportional mit, wenn das Blatt skaliert wird (Vektor-Skalierung).
*   **Veranschaulichung:**
    ```mermaid
    flowchart LR
        A["Blatt &lt;din-a4&gt;<br/>(container-type: size)"]
        A -->|1% Breite| B["1 cqw"]
        A -->|1% Höhe| C["1 cqh"]
        B -.->|Beispiel: 25mm Lochrand| D["11.905 cqw"]
        C -.->|Beispiel: 45mm Kopfhöhe| E["15.152 cqh"]
    ```
*   **Verweis:** Siehe [ADR-CSS.md](../ADR/ADR-CSS.md#2-container-queries--proportionale-einheiten-cqw--cqh) und [din-5008-geometry.md](din-5008-geometry.md).

### `fetch()` API
*   **Kurzdefinition:** Die moderne, Promise-basierte JavaScript-Schnittstelle zum asynchronen Laden und Senden von Netzwerkressourcen.
*   **Nutzen im Projekt:** Führt die asynchronen Adresssuchen über Photon und Geoapify im Hintergrund aus und validiert den API-Key per Heartbeat.
*   **Verweis:** Siehe [ADR-API.md](../ADR/ADR-API.md#1-dual-provider-autocomplete-photon--geoapify).

### `Geoapify API`
*   **Kurzdefinition:** Ein kommerzieller, hochperformanter Premium-Geocoding-Dienst zur Adress-Vervollständigung und Validierung.
*   **Nutzen im Projekt:** Dient als optionaler Premium-Adress-Provider in der Sidebar (erfordert Key, geschützt über Header-Security).
*   **Verweis:** Siehe [ADR-API.md](../ADR/ADR-API.md#1-dual-provider-autocomplete-photon--geoapify) und [ADR-FEATURE.md](../ADR/ADR-FEATURE.md#4-automatisches-proximity-biasing).

### `IMR 4.0` (Input Mapping Registry)
*   **Kurzdefinition:** Die zentrale Architektur-Registry, die eine bidirektionale Verbindung zwischen Custom HTML5 Elements und Daten-Objektstrukturen deklariert.
*   **Nutzen im Projekt:** Synchronisiert die `contenteditable`-Felder lautlos mit dem internen Zustand für das Auto-Saving im LocalStorage.
*   **Verweis:** Siehe [ADR-HTML.md](../ADR/ADR-HTML.md#1-imr-40-custom-elements-fur-geometrie-bereiche) und [ADR-JS.md](../ADR/ADR-JS.md#2-reglementierte-aufgabenbereiche-fur-javascript).

### `light-dark()`
*   **Kurzdefinition:** Eine native CSS-Funktion, die automatisch den ersten übergebenen Farbwert wählt, wenn Light Mode aktiv ist, und den zweiten Wert, wenn Dark Mode aktiv ist.
*   **Nutzen im Projekt:** Ermöglicht die komplett JS-freie, flüssige Echtzeit-Themeumschaltung aller UI-Elemente direkt im CSS.
*   **Verweis:** Siehe [ADR-CSS.md](../ADR/ADR-CSS.md#4-natives-lightdark-mode-theme-light-dark) und [variables.css](../website/css/variables.css).

### `localStorage` API
*   **Kurzdefinition:** Die stabilste und universellste Offline-Speicher-API im Browser zur persistenten Speicherung von Zeichenketten.
*   **Nutzen im Projekt:** Sichert Entwürfe, Einstellungen, API-Keys und Base64-Schriftarten lokal ab – **die einzige persistente API, die unter dem Doppelklick-Kontext `file:///` fehlerfrei funktioniert.**
*   **Verweis:** Siehe [ADR-JS.md](../ADR/ADR-JS.md#2-reglementierte-aufgabenbereiche-fur-javascript) und [ADR-ANTIPATTERN.md](../ADR/ADR-ANTIPATTERN.md#3-komplexere-lokale-storage-apis-opfs-indexeddb-file-system-api).

### `oklch()` Farbraum
*   **Kurzdefinition:** Ein zukunftsweisender, wahrnehmungsgleichmäßiger (perceptually uniform) CSS-Farbraum, basierend auf Helligkeit (L), Buntheit (C) und Farbton (H).
*   **Nutzen im Projekt:** Garantiert präzise Kontraststufen, fehlerfreie Grauabstufungen und ein absolut premium-artiges Dark-Paper-Theme ohne Farbverzerrungen.
*   **Verweis:** Siehe [ADR-CSS.md](../ADR/ADR-CSS.md#4-natives-lightdark-mode-theme-light-dark) und [variables.css](../website/css/variables.css).

### `Photon API`
*   **Kurzdefinition:** Ein komplett kostenfreier, OpenStreetMap-basierter Geocoding-Suchdienst (betrieben von Komoot).
*   **Nutzen im Projekt:** Dient als Standard-Adress-Provider in der Sidebar. Funktioniert keyless und ohne Kreditkartenregistrierung.
*   **Verweis:** Siehe [ADR-API.md](../ADR/ADR-API.md#1-dual-provider-autocomplete-photon--geoapify).

### Popover API (`popover="manual"`)
*   **Kurzdefinition:** Der native HTML5-Standard zur Platzierung von Overlay-Elementen im globalen Top-Layer des Webbrowsers.
*   **Nutzen im Projekt:** Steuert die schwebende WhatsApp-Toolbar und die Popover-Toasts nativ auf Browserebene. Verhindert jegliche Z-Index-Kollisionen im CSS.
*   **Verweis:** Siehe [ADR-HTML.md](../ADR/ADR-HTML.md#2-native-html-popover-api--dialogs) und [ADR-FEATURE.md](../ADR/ADR-FEATURE.md#1-whatsapp-style-selection-toolbar-popover).

### Selection & Range API
*   **Kurzdefinition:** Native Browser-APIs zur präzisen Manipulation und Positionsberechnung von markierten Textbereichen im DOM-Baum.
*   **Nutzen im Projekt:** Platziert die Formatierungs-Toolbar pixelgenau über dem Cursor und formatiert Textbereiche (B, U, Blockquote) zukunftssicher ohne veraltete JavaScript-Befehle.
*   **Verweis:** Siehe [ADR-JS.md](../ADR/ADR-JS.md#3-verbot-von-verarbeitetem-execcommand-fur-custom-formate).

### `Zippopotam`
*   **Kurzdefinition:** Eine extrem schlanke, freie und globale API zur Geocodierung und Validierung von Postleitzahlen.
*   **Nutzen im Projekt:** Löst 5-stellige deutsche PLZs im Empfängerfeld im Hintergrund auf, um den Ortsnamen automatisch hinzuzufügen.
*   **Verweis:** Siehe [ADR-API.md](../ADR/ADR-API.md#5-zippopotam-plz-auto-lookup).
