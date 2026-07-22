---
aliases:
- Longevity Guidelines
- W3C Standards
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: guide-longevity-guidelines
last-updated: 2026-07-02
project: DIN-BriefNEO
status: active
tags:
- obsidian
- documentation
- guide
- manual
- architecture
title: 'Guide: Longevity & W3C Native Standards Guidelines (Longevity Guide)'
type: guide
updated: '2026-07-07'
---

# Longevity & W3C Native Standards Guidelines (Longevity Guide)

## 1. Die Philosophie der "Wartungsfreiheit auf Lebenszeit"

> [!important] 10+ Jahre Wartungsfreiheit
> Moderne Webentwicklung leidet unter massiver Kurzlebigkeit. Frameworks veralten in wenigen Jahren, Build-Tools brechen durch Node.js-Versionswechsel, und externe CDNs verschwinden oder ändern ihre Pfade. 
> 
> **DIN-BriefNEO** bricht radikal mit diesem Zyklus. Ziel ist eine **möglichst lange Lebensdauer ohne Wartungsaufwand** (im Idealfall viele Jahre). Der Briefbogen muss im Jahr 2036 in jedem gängigen Webbrowser exakt so geladen, gerendert und bedient werden können wie heute.
> 
> Dies erreichen wir nicht durch Verzicht auf moderne Features, sondern durch das unnachgiebige Vertrauen in **native, standardisierte W3C/WHATWG Browser-Schnittstellen**.

### 1.1. Sicherheit vor Kompatibilität (Chrome 149+ Baseline)

---

## 2. Die 5 Säulen der Langlebigkeit (Longevity Pillars)

### Säule 1: Der "Zero-Dependency" Pakt

Es dürfen **keinerlei externe Bibliotheken** (weder npm-Packages noch Skripte über CDN) in das Projekt integriert werden.

*   **Konkret:** DOM-Manipulation erfolgt über native Methoden (`querySelector`, `append`), Datumsformatierung über die native `Intl`-API und Netzwerkanfragen über `fetch`.

### Säule 2: 100%ige Autarkie (Offline-by-Default)

Die Anwendung muss vollständig autark funktionieren und lauffähig sein, wenn sie lokal als `file:///index.html` per Doppelklick geöffnet wird – selbst ohne Internetverbindung.

*   **Warum?** Wenn die Anwendung externe Ressourcen (z. B. Google Fonts oder CDN-Skripte) lädt, bricht sie zusammen, sobald der Benutzer offline ist oder die Server der Drittanbieter nicht erreichbar sind. Zudem verstößt jeder ungefragte IP-Abfluss an Dritte gegen die DSGVO.

*   **Konkret:** Alle Stylesheets, SVG-Bilder und Schriften werden lokal abgelegt oder im Bedarfsfall (Schriften-Manager) als Base64-Strings direkt im LocalStorage gesichert.

### Säule 3: W3C / WHATWG "Living Standards" Vorrang

Es werden ausschließlich Features genutzt, die im offiziellen HTML-, CSS- und JS-Standard als stabile "Living Standards" verankert sind und breite Browser-Unterstützung genießen.

*   **Warum?** Experimentelle Browser-Features (z. B. Vendor-Präfixe wie `-webkit-` oder proprietäre APIs) können jederzeit entfernt werden. Standardisierte Schnittstellen sind durch die W3C-Garantie der Abwärtskompatibilität geschützt.

*   **Konkret:** Wir nutzen die native **Popover API** für Toolbars und Toasts, **Container Queries** (`cqw`/`cqh`) für die proportionale Skalierung und die **Selection/Range-API** für Textformatierungen.

### Säule 4: Build-Tool-Immunität (Kein Compiler)

Die Anwendung nutzt **keinen** Compiler, keinen Bundler und kein Transpilier-Werkzeug (kein Webpack, kein Vite, kein Babel, kein Sass-Compiler). Wir akzeptieren nur dann einen Bundler, wenn er optional und ohne Breaking Changes bleibt.

*   **Warum?** Build-Tools sind die häufigste Ursache, warum alte Webprojekte nach Jahren nicht mehr gebaut werden können. Node.js-Updates brechen alte Konfigurationen, Abhängigkeiten blockieren sich gegenseitig.

*   **Konkret:** Das JavaScript ist reines, natives **ES-Modules (ESM)** mit expliziten Dateiendungen (z. B. `import { x } from './y.js'`). Der Browser selbst ist der Laufzeit-Compiler. Das CSS ist reines CSS3 mit nativen CSS-Variablen und CSS Nesting.

### Säule 5: LocalStorage als einziger Datenspeicher

Alle persistenten Daten (Entwürfe, Profilvorlagen, Schriften) werden ausschließlich im **LocalStorage** gesichert.

*   **Warum?** Moderne APIs wie IndexedDB, OPFS (Origin Private File System) oder die File System Access API setzen aus Sicherheitsgründen einen sicheren Server-Kontext (HTTPS oder `localhost`) voraus. Im lokalen Kontext (`file:///`) werfen sie Sicherheitsfehler. LocalStorage ist seit Chrome 4 (2010) die stabilste, CORS-freie und universellste Speicher-API der Web-Geschichte.

---

## 3. Richtlinien für zukunftssicheres Schreiben von Code

### A. JavaScript: Deklarativ & Sicher vor "deprecation"

*   **Vermeide deprecated APIs:** Nutze niemals veraltete Methoden wie `document.execCommand` oder `document.queryCommandState` zur Textmanipulation. Nutze stattdessen die zukunftssichere **Selection & Range API**, um Textknoten im DOM-Baum sauber zu traversieren und zu verändern.

*   **Standard-Shortcuts respektieren:** Schreibe keine eigenen Keydown-Handler für Standard-Shortcuts wie `Strg+B` oder `Strg+U`. Überlasse diese dem Standardverhalten des Webbrowsers im `contenteditable`-Bereich.

*   **Explizite ESM-Importe:** Importiere Module immer mit ihrer vollständigen Dateiendung `.js`.

    ```javascript
    // Richtig
    import { StorageManager } from './storage.js';
    
    // Falsch
    import { StorageManager } from './storage';
    ```

### B. CSS: Proportional & Deklarativ statt JS-Berechnung

*   **Layout über CSS, nicht JS:** Berechne Schriftgrößen oder Abstände niemals mit JavaScript `ResizeObserver`-Schleifen. Nutze stattdessen **CSS Container Queries** (`container-type: size` auf `<din-a4>`) und proportionale Einheiten (`cqw` und `cqh`).

*   **Keine JS-Farbinversionen:** Nutze für den Dark Mode niemals globale Filter (`filter: invert(1)`). Definiere stattdessen saubere, kontraststarke Farbvariablen über die native CSS-Funktion `light-dark()` mit standardisierten **OKLCH-Farbräumen**.

*   **Natives CSS Nesting:** Nutze die moderne native CSS-Verschachtelung statt CSS-Preprozessoren (wie SCSS oder Less).

    ```css
    /* Richtig & Nativ */
    din-a4 {
      background: white;
      &.overflow-warn {
        outline: 2px dashed red;
      }
    }
    ```

---

## 4. Deprecated Web-APIs & ihre modernen, stabilen Alternativen (Chrome 148+ / W3C Living Standard)

Für Entwickler und KIs gilt diese Tabelle als striktes Verbot veralteter Techniken und als Richtlinie für deren modernen Ersatz:

> [!TIP]
> **Nutzung von CSS Anchor Positioning ab Chrome 148+:**
> Da dieses Projekt exklusiv für moderne Laufzeitumgebungen ab Chrome 148+ entwickelt wird, nutzen wir das native **CSS Anchor Positioning** ohne Vorbehalte und ohne künstlichen JavaScript-Berechnungsoverhead! Dies vereinfacht die Positionierung von schwebenden Elementen (wie dem Format-Popover `#format-toolbar` oder Toasts) radikal, da sie rein deklarativ im CSS an ihren Anker gekoppelt werden. Ewiggestrige Browser-Engines ohne Support werden konsequent ignoriert (keine Rücksichtnahme für Plattformen, die hinterherhinken!).

---

## 5. Konsequenz

Jede Code-Modifikation wird im Code-Review unnachgiebig auf diese Richtlinien geprüft. Ein Feature, das eine externe Abhängigkeit einführt, die Offline-Kompatibilität beeinträchtigt oder auf nicht-standardisierten APIs aufbaut, wird bedingungslos abgelehnt. 

**Wir bauen kein kurzlebiges MVP – wir bauen ein digitales Denkmal.**

## 6. Regelmäßige Review

Da Web-Standards stetig weiterentwickelt werden, empfehlen wir eine Überprüfung dieser Richtlinien in regelmäßigen Abständen (z. B. alle 2 Jahre), um neue, stabile W3C-Standards in das Projekt aufzunehmen.