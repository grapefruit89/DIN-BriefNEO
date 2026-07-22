---
title: LLM Context Bundle
status: active
tags: [context, llm, prompt]
---

> [!IMPORTANT]
> **SYSTEM-PROMPT / CORE CONTEXT**
> Dieses Dokument ist eine automatisch generierte, aggregierte Landkarte der aktuellen Projektarchitektur.
> Es enthält alle kritischen Verfassungen, Guidelines und Spezifikationen, die du als KI-Agent zwingend beachten musst.
> Das Projekt "DIN-Brief Neo" strebt nach absoluter **Zero-Dependency** und **100% Offline-Fähigkeit** via W3C Living Standards in Chrome 148+.
> Nutze KEINE veralteten APIs (z.B. execCommand) und KEINE Frameworks.
> 
> Dies ist dein maßgeblicher System-Prompt.
> Generiert am: 2026-07-22T08:34:44.307Z
> ==============================================================================



# ==========================================
# FILE: README.md
# ==========================================

---
title: "DIN-BriefNEO: Pure Refactored Edition"
status: active
tags: [documentation, readme]
---

# ✉️ DIN-BriefNEO: Pure Refactored Edition

Willkommen im offiziellen Arbeitsverzeichnis von **DIN-BriefNEO (Pure Refactored Edition)**. 

Dieses Projekt ist eine datenschutzkonforme, **100% offline-fähige** und wartungsfreie Web-Applikation zur pixelperfekten Erstellung normkonformer Briefe nach dem offiziellen deutschen Standard **DIN 5008 (Form A und Form B)**.

---

## ⚡ Quick Start

Das Projekt nutzt modernen, nativen W3C-Code (ES-Modules und CSS Layers). Aufgrund von Browser-Sicherheitsrichtlinien (CORS) muss die App zwingend über einen lokalen Webserver gestartet werden, anstatt per `file://`-Protokoll.

1. **App starten (Nutzer):** Ein Doppelklick auf die `start.bat` im Hauptverzeichnis reicht aus. Es startet ein lokaler Python-Server (auf Port 8000) im Hintergrund und öffnet die App automatisch im Browser.
2. **Entwickler-Check (Agenten):** Führe das Skript `.\start.ps1` aus.
   - Dieses Skript prüft den Code (Reconciliation Loop) und stellt sicher, dass der **Fitness Score bei 100%** liegt.

---

## 🏛️ Die Philosophie (Wartungsfreiheit auf Lebenszeit)

Dieses Projekt bricht radikal mit der Kurzlebigkeit moderner Web-Frameworks. Wir vertrauen zu 100% auf native, standardisierte W3C/WHATWG-Schnittstellen. Unser Ziel ist eine **Überlebensspanne von vielen Jahren ohne eine einzige Zeile Wartungsaufwand**.

- 🚫 **Keine Frameworks:** Weder React, noch Vue, noch Svelte.
- 🚫 **Keine Compiler:** Weder Webpack, noch Babel, noch Sass.
- 🚫 **Keine externen Abhängigkeiten:** Keine CDNs, keine Google Fonts, vollständige Offline-Autarkie (Privacy-first).
- ✅ **Native Standards:** Wir nutzen Container Queries, Popover API, CSS `light-dark()` und die Selection/Range API.

---

## 🗺️ Dokumentation

Das Projekt ist extrem detailliert dokumentiert, um KI-Agenten und Entwicklern einen perfekten Einstieg zu bieten.

👉 **Zur vollständigen [Dokumenten-Landkarte (DOCUMENTATION-MAP.md)](docs/30-meta/DOCUMENTATION-MAP.md)**

Die Landkarte enthält Verweise auf alle Architekturentscheidungen (ADRs), Spezifikationen und Verhaltensregeln (`AGENTS.md`).

---

## 🤖 KI-Entwicklung (Light Mode vs. Full Mode)

Um Komplexität zu minimieren, nutzen KI-Agenten einen gestuften Workflow:

| Modus | Wann? | Schritte |
|---|---|---|
| 🟢 **Light Mode** | Bugfixes, kleine Anpassungen | Pre-Build → Änderung → Post-Build (100% Fitness Pflicht!) → Logging (`log_session.js`) |
| 🔴 **Full Mode** | Wichtige Features, Architektur | Wie Light Mode, aber **zusätzlich** ein Architektur-Dokument unter `specs/` anlegen. |

> **Achtung:** Jede Aktion in diesem Projekt muss strikt gegen die [Longevity Guidelines](docs/00-foundation/longevity-guidelines.md) geprüft werden.


# ==========================================
# FILE: docs/30-meta/DOCUMENTATION-MAP.md
# ==========================================

---
code_links: []
created: '2026-07-07'
depends_on: []
doc_links: []
id: documentation-map
status: active
tags:
- documentation
- map
title: Dokumenten-Landkarte & Wegweiser
type: concept
updated: '2026-07-07'
---

# Dokumenten-Landkarte & Wegweiser

Um das Projekt übersichtlich und hochgradig transparent zu halten, ist die Dokumentation in modular verlinkte Single Sources of Truth (SSoTs) gegliedert.

## 🏛️ Philosophie & Gesetzgebung

* **[Longevity Guidelines](../00-foundation/longevity-guidelines.md):** Die unverrückbare "Verfassung" für Wartungsfreiheit (Zero-Dependency, 100% Offline-Autarkie).

* **[Master Lawbook](../00-foundation/Immutable-Law-Catalog.md):** Die zentrale Referenz für alle technologischen Entscheidungen, Verbote und Ersatzstrategien.

* **[AGENTS.md](../../../AGENTS.md):** Bindender Vertrag für alle KI-Agenten (Reconciliation, 100% Fitness, Logging).

* **[DEV-INFO.md](DEV-INFO.md):** Entwicklerbereich & Feature-Prüfungs-Matrix.

## 🗺️ Status, Spezifikationen & Guides

* **[Spezifikation (spec.md)](../00-foundation/spec.md):** Die Kernanforderungen der Features und Backlog.

* **[No-Scroll Techniken](../20-implementation/Guides/no-scroll-techniques.md):** Anleitung für Viewport-Perfect Layouts.

* **[Testing Guide](../20-implementation/testing-guide.md):** Interaktives QA-Protokoll und Testfälle.

* **[LLM-First Datenbank-Guide (README-DB.md)](../40-tooling/README-DB.md):** Spezifikation der SQLite-DB und MCP-Architektur.

## 🏗️ Architektur-Entscheidungen (ADRs)

Alle grundlegenden Design-Entscheidungen sind thematisch im Ordner **[ADR/](../10-architecture/ADR/)** dokumentiert:

* **[ADR-HTML](../10-architecture/ADR/ADR-HTML.md):** Custom Elements, Popover API, `contenteditable`.

* **[ADR-CSS](../10-architecture/ADR/ADR-CSS.md):** Proportionaler Zoom, Container Queries, `light-dark()`.

* **[ADR-JS](../10-architecture/ADR/ADR-JS.md):** JavaScript-Reglementierung, Selection API.

* **[ADR-API](../10-architecture/ADR/ADR-API.md):** External Services & APIs (Geoapify, Zippopotam & Header Security).

* **[ADR-DATA-PERSISTENCE](../10-architecture/ADR/ADR-DATA-PERSISTENCE.md):** Lokale Speicherstrategien.

## 📦 Implementierungsdetails

* **[SQLite-Vec Integration](../20-implementation/implementation/sqlite-vec.md):** Plan für Vektor-Suche.

# ==========================================
# FILE: ../AGENTS.md
# ==========================================

# AGENTS.md — DIN-BriefNEO

**BINDENDER VERHALTENSVERTRAG FÜR ALLE KI-AGENTEN**  
Dieser Vertrag ist nicht verhandelbar. Verstöße führen zur Ablehnung der Änderung.

---

## 1. Höchste Autorität: Immutable Law Catalog

Das Dokument `docs/Meta/MASTER-DO-DONT-DEPRECATED.md` (Immutable Law Catalog) ist die **höchste autoritative Quelle** dieses Projekts.

- Es definiert verbindlich, welche Technologien und Patterns **MUST-USE** und welche **FORBIDDEN** sind.
- Bei Konflikten zwischen diesem Dokument (`AGENTS.md`) und dem Immutable Law Catalog hat **letzteres Vorrang**.
- Änderungen am Law Catalog dürfen nur über einen formalen ADR-Prozess erfolgen.

Jeder Agent muss den aktuellen Stand des Law Catalogs kennen und respektieren.

---

## 2. Unverhandelbare Kernprinzipien

- **Fitness Gate 100%**: Vor und nach jeder relevanten Änderung muss `.\start.ps1` ausgeführt werden. Der Fitness Score **muss 100 %** betragen.
- **Branchless Workflow**: Nur `main`-Branch. Feature-Branches sind verboten. Experimente erfolgen ausschließlich über `git stash`.
- **Surgical Changes & KISS**: Nur das ändern, was für die aktuelle Aufgabe strikt notwendig ist. Bevor JavaScript geschrieben wird, muss geprüft werden, ob moderne CSS- oder native Web-APIs ausreichen.
- **Generalisierbarkeit**: Jede neue Lösung ist auf ihre Übertragbarkeit in die `llm_boilerplate` zu prüfen und zu dokumentieren.

---

## 3. Workflow-Modi

### Light Mode (Default)
1. `.\start.ps1` ausführen (Pre-Build)
2. `LLM_CONTEXT.md` lesen
3. Änderung durchführen
4. `.\start.ps1` ausführen → **Fitness Score muss 100 %** sein
5. Mit `node tools/log_session.js` protokollieren
6. Generalisierungs-Vermerk in `DECISION-LOG.md` schreiben

### Full Mode
Zusätzlich:
- `specs/`-Ordner anlegen
- `spec.md` mit Anforderungen und Generalisierungs-Check erstellen
- Bei Bedarf `plan.md` + `tasks.md`

---

## 4. Context7 – Verbindliche Nutzung

**Context7 ist bei folgenden Situationen verpflichtend zu nutzen:**

- Unsicherheit über eine Web-API, CSS-Eigenschaft oder JavaScript-Methode
- Prüfung, ob eine native Lösung existiert (bevor JS geschrieben wird)
- Verifikation von Browser-Support (mind. Chrome 148+)
- Prüfung auf Deprecations oder bessere Alternativen

Die relevanten Erkenntnisse aus Context7 sind kurz im `DECISION-LOG.md` zu dokumentieren.

**Grundsatz:** Context7 hat Vorrang vor veraltetem Wissen oder Annahmen.

---

## 5. Dokumentations- & Traceability-Pflicht

- Neue ADRs und Guides müssen über die offiziellen Templates (`new-adr.py` / `new-guide.py`) erstellt werden.
- Jedes neue Dokument muss vollständiges Frontmatter nach Schema V6 enthalten.
- Die automatisierte Function Traceability Matrix darf **nur** durch `build_db.py` verändert werden.
- Neue Code-Funktionen müssen Traceability über `@adr` / `@guide` Kommentare herstellen.

---

## 6. Generalisierbarkeit & llm_boilerplate

DIN-BriefNEO ist ein **Testballon** für die `llm_boilerplate`. 

Bei jeder architektonischen oder tooling-bezogenen Entscheidung ist zu prüfen:
- Ist diese Regel/pattern generalisierbar?
- Sollte sie in die Boilerplate übernommen werden?

Erkenntnisse sind im `DECISION-LOG.md` festzuhalten.

---

## 7. Verbotene Technologien

Es gelten die Regeln des **Immutable Law Catalogs** (`docs/Meta/MASTER-DO-DONT-DEPRECATED.md`). 

Besonders streng verboten sind unter anderem:
- Frameworks und Build-Tools für das Frontend
- Legacy-APIs (`new Date()`, `document.execCommand()`, unsicheres `innerHTML` etc.)
- Hex/RGB/HSL-Farben (nur OKLCH erlaubt)
- Storage-Lösungen außer `localStorage` unter `file:///`

Der aktuelle, verbindliche Stand steht **ausschließlich** im Law Catalog.

---

## 8. Protokollierung

Jede relevante Aktion muss direkt nach erfolgreichem Post-Build protokolliert werden:

```bash
node tools/log_session.js --agent "<Name>" --action "<Aktion>" --file "<Datei>" --desc "<Was + Warum + Generalisierbarkeit + ggf. Context7-Erkenntnis>"
```

## 9. Zusammenfassung der harten Regeln

- Der Immutable Law Catalog ist die höchste Instanz.
- Context7 muss bei Unsicherheit über Web-Technologien genutzt werden.
- Fitness Score 100 % vor und nach relevanten Änderungen.
- Branchless auf main.
- Templates + vollständiges Frontmatter V6 bei neuer Dokumentation.
- Surgical Changes & KISS priorisieren.
- Generalisierbarkeit prüfen und dokumentieren.

Verstöße gegen diesen Vertrag führen zur Ablehnung der Änderung.

*Hinweis: Komplexe oder zukünftige Konzepte sind in FUTURE_IDEAS.md eingefroren. Konzentriere dich auf die oben genannten Regeln.*


# ==========================================
# FILE: docs/00-foundation/constitution.md
# ==========================================

---
aliases:
- constitution
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: constitution
status: active
tags:
- obsidian
- core
- documentation
title: Verfassung (Constitution) — DIN-BriefNEO
type: policy
updated: '2026-07-07'
---

# Verfassung (Constitution) — DIN-BriefNEO

Dieses Dokument ist das unverrückbare und absolut bindende Regelwerk (Rulebook) des Projekts **DIN-BriefNEO**. Jede technische Entscheidung und Code-Implementierung muss bedingungslos mit dieser Verfassung im Einklang stehen.

---

## 1. Mission & Vision

DIN-BriefNEO ist eine minimalistische, hochperformante und vollkommen autarke Webanwendung zur Erstellung und zum PDF-Druck formaler Briefe nach der deutschen Norm **DIN 5008 (Form A & B)**. 
Das Projekt ist extrem langlebig konzipiert: Es läuft vollständig lokal im Browser, ohne Server und ohne Build-Systeme, und bleibt über Jahrzehnte hinweg direkt ausführbar.

---

## 2. Die fundamentalen Verbote (DONT's)

### ❌ Fette Frameworks & Build-Tools

### ❌ Absolutes Scroll-Verbot

In der gesamten Anwendung darf **kein einziger Scrollbalken** auftauchen – weder vertikal noch horizontal. Jedes UI-Element, jede Sidebar und das Briefblatt selbst müssen sich elastisch und ohne Überlauf innerhalb der exakten Grenzen des Viewports bewegen.

### ❌ Keine Native App & Keine Browser-Erweiterung

DIN-BriefNEO wird ausschließlich als responsive, standardkonforme **Webseite / Web App (PWA)** entwickelt. Es werden unter keinen Umständen native Apps (Electron, Capacitor) oder Browser-Erweiterungen (WebExtensions) gebaut.

### ❌ Keine komplexen Server-Datenbanken

Wir verzichten auf serverseitige Datenbanken oder Speicher-APIs, die einen aktiven Serverkontext zwingend voraussetzen (wie OPFS ohne Service Worker).

### ❌ Keine externen Abhängigkeiten & CDNs (Absolute Dependency Purity)

Es dürfen keine externen CDNs, Bibliotheken, Web-Fonts (z. B. Google Fonts) oder Skripte über das Netzwerk geladen werden. Die Anwendung muss vollkommen autark und isoliert im Offline-Zustand funktionieren. Alle Ressourcen (Schriften, CSS, JS) müssen lokal im Verzeichnis liegen.

---

## 3. Die fundamentalen Gebote (DO's)

### ✅ HTML > CSS > JavaScript

Entwickelt wird streng nach dem Prinzip der absteigenden Komplexität:

1. **HTML First:** Verwendung nativer, semantischer HTML5-Elemente (z. B. `<dialog>`, `<popover>`, `contenteditable="plaintext-only"`).

2. **CSS Second:** Layouts (CSS Grid, Flexbox), Interaktionen (Checked-Tricks, native Popover-Events) und Themes werden vorrangig über CSS gelöst.

3. **JavaScript Last:** JS fungiert ausschließlich als deklarative Logik-Schicht (API-Abfragen, LocalStorage-Sync, Berechnungen).

### ✅ Lokale Persistenz rein über LocalStorage

Alle Briefentwürfe, Profileinstellungen und API-Schlüssel werden ausschließlich über die native **Web Storage API (LocalStorage)** des Browsers gesichert. Dies garantiert maximale Offline-Fähigkeit ohne Server.

### ✅ Nutzung moderner CSS-Features (Chrome 148+ Baseline)

Da die Ziel-Laufzeitumgebung Google Chrome v148+ ist, nutzen wir modernste native CSS-APIs:

- `light-dark()` zur automatischen Theme-Steuerung.

- `oklch()` für exakte, harmonische Farbräume.

- **CSS Anchor Positioning** für Tooltips und Menüs ohne JS.

- `field-sizing: content` für automatisch wachsende Eingaben ohne Scrollbars.

### ✅ Spec-First Workflow

Keine Codeänderung ohne Spezifikation. Jedes neue Feature durchläuft die Stufen:
`Specify` (Anforderung klären) ➔ `Plan` (Technologie wählen) ➔ `Tasks` (Tickets schreiben) ➔ `Implement` (Code schreiben).

### ✅ Technische Schuldenfreiheit

Jede Abweichung von den Kernprinzipien oder jede optionale Erweiterung/Abhängigkeit muss zwingend über eine MADR-konforme ADR begründet, dokumentiert und freigegeben werden. Technische Schulden sind ausgeschlossen.

# ==========================================
# FILE: docs/00-foundation/longevity-guidelines.md
# ==========================================

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

# ==========================================
# FILE: docs/00-foundation/Immutable-Law-Catalog.md
# ==========================================

---
aliases:
- MASTER-DO-DONT-DEPRECATED
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: Immutable-Law-Catalog
status: active
tags:
- obsidian
- core
- documentation
- rules
- standards
- law
title: Immutable Law Catalog (MUST-USE vs FORBIDDEN)
type: policy
updated: '2026-07-07'
---

# DIN‑BriefNEO — Immutable Architectural Law: MUST‑USE vs. ANTIPATTERN Catalog

**Status:** Eternal · Non‑Negotiable · Redundantly Embedded
**Baseline:** Chrome 148+ (2026) · Zero Dependencies · file:/// Offline‑First
**Override Rule:** Any change to this catalog requires a formal ADR explicitly referencing this document and a unanimous approval by all project architects.

------

## PART I — MUST‑USE TECHNOLOGY CATALOG

Every technology, API, pattern, and practice that MUST be used exclusively. No alternatives are permitted. Each entry includes: exact name, governing W3C/WHATWG specification or living standard, minimum Chrome version, and architectural purpose.

### HTML Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| H1   | Semantic Custom Elements (`<din‑5008>`, `<din‑page>`, `<din‑address‑zone>`, `<din‑recipient>`, `<din‑infoblock>`, `<din‑subject>`, `<din‑salutation>`, `<din‑body>`, `<din‑closing>`, `<din‑signature>`, `<din‑attachments>`, `<din‑footer>`, `<din‑bank‑data>`, `<din‑fiscal‑data>`, `<din‑vcard>`) | HTML Living Standard §4.13 Custom Elements | 54 | Isomorphic mapping to DIN 5008 semantic zones; enables @scope isolation, container queries, and LLM‑readable DOM structure |
| H2   | `popover="manual"` (Native Popover API) | HTML Living Standard §6.12 The popover attribute | 114 | Browser‑managed top‑layer; no z‑index collisions; light‑dismiss‑ready; used for format‑toolbar, toasts, all overlays |
| H3   | `contenteditable="plaintext‑only"` | HTML Living Standard §7.5 Editing | 132 | Structural XSS prevention for metadata fields; no HTML injection possible at browser level |
| H4   | `contenteditable="true"` (letter body only) | HTML Living Standard §7.5 Editing | 1 | Enables controlled inline formatting (bold, underline, blockquote) exclusively in the letter core |
| H5   | Invoker Commands API (`commandfor`, `command`) | HTML Living Standard §6.12.5 Invoker Commands | 135 | JS‑free triggering of popovers, dialogs, and custom commands; eliminates event‑listener overhead |
| H6   | `<dialog>` element with `.showModal()` | HTML Living Standard §4.11.4 The dialog element | 37 | Focus‑trapped, modal‑layer dialog for destructive actions; proper accessibility semantics |
| H7   | `<script type="module">` (ES Modules) | HTML Living Standard §4.12.1 The script element | 61 | Native module system; no bundlers; explicit dependency graph; file:/// compatible |
| H8   | No inline scripts (except anti‑FOUC IIFE) | Project Constitution | — | Prevents CSP violations; maintains strict separation of concerns |
| H9   | Unique `id` attributes throughout | HTML Living Standard §3.2.6 Global attributes | 1 | No undefined behavior from duplicate IDs; reliable JS/CSS targeting |
| H10  | WAI‑ARIA attributes (`aria‑pressed`, `aria‑hidden`) | WAI‑ARIA 1.2 / HTML Living Standard §3.2.6 | 1 | Screen‑reader feedback for formatting states and UI visibility; mandated by accessibility guidelines |
| H11  | `<meta name="chrome‑minimum‑version" content="148">` | Project Constitution | 148 | Explicitly guards against older Chrome versions that lack required APIs |

### CSS Layer

### JavaScript Layer

### Storage & Persistence Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| S1   | `localStorage` API EXCLUSIVELY | Web Storage Living Standard | 4 | Only stable, CORS‑free storage under file:///; holds drafts, settings, custom fonts, API keys |
| S2   | JSON serialization for all stored data | ECMAScript 2025 §JSON | 1 | Structured, parseable, debuggable persistence format |
| S3   | Base64 encoding for custom WOFF2 fonts | Web Storage Living Standard + FileReader API | 1 | Offline font storage without external CDNs |

### Tooling & External Dependencies Layer

| #    | MUST‑USE | Specification / Standard | Chrome | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| T1   | Zero runtime dependencies | Project Constitution | — | file:/// double‑click execution; no npm packages in production |
| T2   | No CDNs, no external servers | Project Constitution | — | DSGVO‑compliant; fully offline; no IP leaks to third parties |
| T3   | Local system‑font stacks | CSS Fonts Level 3 | 1 | Reliable, offline typography; optional WOFF2 uploader for custom fonts |
| T4   | Inline SVGs for all icons | SVG 1.1 / CSS Images Level 3 | 1 | No icon font downloads; crisp at any resolution; accessible |
| T5   | Node.js dev‑tools (Playwright, vision scripts) strictly limited to build‑time | Project Constitution | — | Clear boundary: dev‑tools are NOT part of the delivery artifact |

### Documentation & LLM‑First Layer

| #    | MUST‑USE | Specification / Standard | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| D1   | Markdown with YAML frontmatter for ALL specs, ADRs, guides, changelogs | CommonMark + YAML 1.2 | Human‑readable, Git‑diffable, machine‑parseable documentation |
| D2   | SQLite FTS5 knowledge base (`DIN‑Brief_docs.db`) | SQLite 3.43+ | LLM‑first hybrid keyword+fulltext search; prefix indexes (`'2 3'`); `unicode61` tokenizer for German |
| D3   | Automatic FTS5 sync triggers (`tbl_ai`, `tbl_ad`, `tbl_au`) | SQLite 3.43+ | Real‑time index updates on INSERT/DELETE/UPDATE |
| D4   | Pre‑defined views (`v_accepted_adrs`, `v_active_docs`, `v_document_index`) | SQLite 3.43+ | O(1) LLM access to common queries; no repetitive JOINs |
| D5   | `DIN‑Brief_docs.db` compiled directly via Node.js `node:sqlite` module | Node.js 22.5+ | Zero‑dependency build; no external `sqlite3.exe`; FTS5 guaranteed |
| D6   | `MASTER‑DO‑DONT‑DEPRECATED.md` as central SSoT lawbook | Project Constitution | Single authoritative reference for all MUST‑USE and ANTIPATTERN items |
| D7   | ALL AI agents receive this complete MUST‑USE/ANTIPATTERN catalog as system prompt | Project Constitution | No agent can plead ignorance; guaranteed compliance in every interaction |
| D8   | MCP configuration: exactly four relevant servers (SQLite documents, SQLite memory, project‑scoped filesystem, Context7) | Model Context Protocol 1.0 | Hermetic project isolation; no cross‑contamination with other projects |

------

## PART II — FORBIDDEN ANTIPATTERN CATALOG

Every technology, API, pattern, and practice that is eternally banned. Each entry includes: the banned item, the exact MUST‑USE replacement, and the precise reason for its banishment. Violations are rejected in code review automatically.

### Legacy JavaScript APIs

### Legacy Color Spaces & Styling

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A16  | Hex colors (`#RRGGBB`, `#RGB`) | `oklch()` | Non‑perceptually‑uniform; blocks Relative Color Syntax; unpredictable contrast scaling |
| A17  | `rgb()` / `rgba()` | `oklch()` | Non‑perceptually‑uniform; inferior to OKLCH for all color operations |
| A18  | `hsl()` / `hsla()` | `oklch()` | Perceptually distorted lightness; mathematically inferior for dynamic color computation |
| A19  | Named CSS colors (`white`, `black`, `red`, `gray`, etc.) | `oklch()` equivalents | Inconsistent rendering across browsers; cannot be used with Relative Color Syntax |
| A20  | `transparent` keyword | `oklch(0% 0 0 / 0%)` | Preferred to use OKLCH with zero alpha for consistency |
| A21  | CSS Preprocessors (Sass, Less, Stylus) | Native CSS Nesting + Custom Properties | Build‑step dependency; native CSS nesting is a W3C living standard |
| A22  | CSS‑in‑JS (Styled Components, Emotion, etc.) | Pure CSS stylesheets with `@scope` and `@property` | JS runtime overhead; violates CSS‑first principle; complicates file:/// execution |
| A23  | `@import` in CSS files | Native `<link>` tags in HTML | Blocks parallel loading; performance anti‑pattern |
| A24  | `var()` WITHOUT fallback | `var(--prop, fallback)` | Silent rendering failure if custom property is undefined |
| A25  | Inline `style="..."` attributes for colors or layout | External CSS stylesheets with `@scope` | Breaks `@scope` isolation; overrides Relative Color Syntax design tokens; the ONLY exception: temporary JS coordinates for the external selection anchor |
| A26  | `filter: invert(1)` for dark mode | `light‑dark()` with OKLCH | Destroys color integrity, especially on the letter paper; inaccessible |

### External Dependencies & Frameworks

### Storage & Networking

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A34  | IndexedDB | `localStorage` | Requires HTTPS or localhost; throws SecurityError under file:///; overkill for DIN‑Brief data volumes |
| A35  | OPFS (Origin Private File System) | `localStorage` | Undefined, unreliable behavior under file:/// in Chrome on Windows; Corset Rule 7 explicitly forbids it |
| A36  | File System Access API | `localStorage` | Requires HTTPS; throws SecurityError under file:/// |
| A37  | Service Workers (under file:///) | Pure file:/// with relative paths (no SW needed) | Registration throws SecurityError under file:///; all assets are local, so offline capability is inherent |
| A38  | External CDNs (cdnjs, unpkg, Google Fonts, etc.) | Local system‑font stacks + optional WOFF2 Base64 upload | Breaches DSGVO (IP leak to third party); destroys offline capability; creates dependency on external server availability |

### Icons & Fonts

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A39  | Icon CDNs (FontAwesome, Lucide, Material Icons CDN) | Inline SVGs | DSGVO violation; offline‑killer; loads hundreds of unused glyphs |
| A40  | Icon fonts (any `.woff`/`.woff2` icon font) | Inline SVGs | Entire font loaded for a handful of icons; inaccessible; poor rendering at small sizes |
| A41  | Google Fonts or any external font service | Local system‑font stacks + optional WOFF2 Base64 upload | DSGVO violation; offline‑killer; IP leak to Google servers |

### Structural & Architectural

| #    | ANTIPATTERN | MUST‑USE Replacement | Reason for Banishment |
| :--- | :--- | :--- | :--- |
| A42  | Duplicate `id` attributes anywhere in the DOM | Unique `id` attributes (W3C conformance) | Undefined behavior; `getElementById()` returns unpredictable results; HTML validation failure |
| A43  | Scrollbars anywhere in the viewport | `overflow: hidden` on `html`/`body`; internal `overflow‑y: auto` with hidden scrollbar for sidebars | Destroys premium app‑shell aesthetics; violates DIN 5008 WYSIWYG proportionality |
| A44  | Non‑semantic `<div>`/`<span>` overuse | Semantic Custom Elements from the IMR 4.0 catalog | Impaired readability for developers and LLMs; no structural meaning; harder to style with `@scope` |
| A45  | Project‑crossing references (e.g., NixOS paths in DIN‑Brief configuration) | Hermetic project isolation; strict directory boundaries; MCP server scope enforcement | Hallucination risk; context contamination; corrupted audits |
| A46  | `page-break-before: always;` on layout roots | `page-break-after: avoid;` or controlled printing | Results in a completely blank first page during PDF generation |
| A47  | Complex UI components inside `contenteditable="true"` | Isolate text and visual components as siblings within a non-editable wrapper | Browser wipes inner HTML structure completely when user types |

------

## PART III — REDUNDANT EMBEDDING MANDATE

This catalog is not a suggestion. It is architectural law and must be redundantly embedded in every relevant project file. Loss of any single file must not result in loss of this knowledge.

The catalog (both MUST‑USE and ANTIPATTERN lists) shall be embedded, in whole or in structured parts, in the following locations:

| #    | File | Embedding Method |
| :--- | :--- | :--- |
| E1   | `constitution.md` (Project Constitution) | Full catalog as an appendix titled "Immutable Technology Law" |
| E2   | `MASTER‑DO‑DONT‑DEPRECATED.md` | This file IS the lawbook; it shall contain the complete, unabridged catalog as its primary content |
| E3   | `Guides/longevity‑guidelines.md` | MUST‑USE items integrated into the "5 Pillars of Longevity"; ANTIPATTERNS in the deprecated APIs table |
| E4   | `ADR/ADR‑TECH‑STACK.md` | All MUST‑USE items listed in the technology stack tables with rationale |
| E5   | `ADR/ADR‑ANTIPATTERN.md` | All ANTIPATTERN items documented with their full reasoning and replacements |
| E6   | `ADR/ADR‑CSS.md` | CSS‑specific MUST‑USE and ANTIPATTERN subsets |
| E7   | `ADR/ADR‑JS.md` | JS‑specific MUST‑USE and ANTIPATTERN subsets |
| E8   | `ADR/ADR‑HTML.md` | HTML‑specific MUST‑USE and ANTIPATTERN subsets |
| E9   | `DEV‑INFO.md` (Feature Detection Matrix) | Each MUST‑USE item listed with its detection method and Chrome baseline |
| E10  | `README‑DB.md` (LLM‑First Database Guide) | SQLite‑related MUST‑USE items documented as the database schema reference |
| E11  | `README.md` (Master Portal) | A summary section "Unser unveränderliches Technologie‑Gesetz" with a link to `MASTER‑DO‑DONT‑DEPRECATED.md` |
| E12  | `GEMINI.md` / System Prompt for ALL AI agents | Complete catalog injected as a system prompt or rules file; agents must reject any proposal violating an ANTIPATTERN |
| E13  | SQLite knowledge base (`DIN‑Brief_docs.db`) | The catalog document itself indexed into the `documents` table with tags `[law, must‑use, antipattern, immutable]` and full‑text searchable via FTS5 |
| E14  | `DIN‑Brief_docs.db` pre‑defined view `v_law_catalog` | A dedicated view exposing all MUST‑USE and ANTIPATTERN items for LLM retrieval |
| E15  | `.github/CODEREVIEW.md` or equivalent | Automated code review checklist referencing this catalog; any PR violating an ANTIPATTERN is auto‑rejected |

------

## PART IV — AMENDMENT PROTOCOL

This catalog is immutable. Any proposed change—addition, removal, or modification—must follow this protocol:

1. A formal ADR must be written, explicitly referencing this document.

2. The ADR must justify the change with technical evidence (not opinion).

3. The ADR must be reviewed and approved by all active project architects.

4. Upon approval, the ADR itself becomes part of the catalog, and all redundant embeddings (E1–E15) must be updated synchronously.

5. The SQLite knowledge base must be re‑compiled and the affected views refreshed.

No change takes effect until all five steps are complete.

------

## PART V — ENFORCEMENT

**Code Review:** Every pull request is checked against this catalog. Any line of code using an ANTIPATTERN is automatically rejected with a reference to the specific item number.

**AI Agents:** Every AI assistant receives this catalog as a system prompt or rules file. Any suggestion violating the catalog must be immediately retracted. AI agents may NOT suggest workarounds or exceptions.

**Build‑Time:** The Node.js build script (`build_db.js`) validates the catalog's presence in the database and logs a warning if the `v_law_catalog` view is missing or empty.

------

**This document is effective immediately and supersedes all prior technology guidelines. It applies to all present and future contributors—human and artificial.**

# ==========================================
# FILE: docs/00-foundation/spec.md
# ==========================================

---
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: spec
status: active
tags:
- documentation
- spec
- requirements
title: Spezifikation (Spec) — DIN-BriefNEO Baseline Features
type: specification
updated: '2026-07-07'
---

# Spezifikation (Spec) — DIN-BriefNEO Baseline Features

> [!NOTE]
> Die exakten Maße und Geometriedaten gemäß dem DIN 5008 Standard findest du in unserem hochpräzisen Dokument. Dieses Dokument dient als Single Source of Truth (SSoT) für alle physischen Abstände.

Dieses Dokument beschreibt die Kernfunktionen des Refactored Prototyps. Jedes Feature ist nach dem **Spec-Kit-Modell** in Anforderung (`Specify`), Plan (`Plan`) und Aufgaben (`Tasks`) unterteilt.

---

## 🟢 Baseline Features (Umgesetzt)

#### Feature 1: Elastischer Viewport (No-Scroll Auto-Zoom)

### 1. Specify (Das "Was")

* **User Story:** Als Anwender möchte ich den virtuellen DIN A4 Briefbogen auf jedem Bildschirm (Desktop, Laptop, Tablet) vollständig und ohne Scrollbalken im Blick haben, damit ich das Brief-Layout direkt bearbeiten kann.

* **Akzeptanzkriterien:**

  - Das Briefblatt behält das exakte Seitenverhältnis von 210:297 (DIN A4).

  - Es entstehen weder vertikale noch horizontale Scrollbalken im Browserfenster.

  - Bei Größenänderung des Browserfensters skaliert das Blatt flüssig.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:** 

  - Wir verzichten vollständig auf JavaScript-basierte Resize-Listener und transform-Skalierungen.

  - Das `<din-a4>` Element erhält eine feste, viewport-relative Höhe (`height: 94vh`) und ein exaktes DIN A4 Seitenverhältnis (`aspect-ratio: 210 / 297`).

  - Wir deklarieren `<din-a4>` als Container (`container-type: size`).

  - Alle Kind-Elemente, Schriftgrößen, Abstände und Positionen auf dem Briefbogen werden über relative Container Query Units (`cqw` und `cqh`) proportional skaliert. Bei Skalierung des Viewports skaliert das gesamte Brief-Layout pixelperfekt mit.

### 3. Tasks (Die Aufgaben)

- [x] `#viewport` und `din-a4` im HTML-Markup anlegen.

- [x] Globales `overflow: hidden` auf `html` und `body` setzen.

- [x] Container Query Units (`cqw`/`cqh`) und container-type deklarieren.

- [x] CSS-Sizing und proportionale Abstände in `css/layout.css` verankern.

---

### Feature 2: DIN Layout-Wechsler (Form A vs. Form B)

### 1. Specify (Das "Was")

* **User Story:** Als Briefschreiber möchte ich zwischen den offiziellen DIN 5008 Layouts "Form A" (Kopfhöhe 27mm) und "Form B" (Kopfhöhe 45mm) wechseln können, um verschiedene Briefbogen-Standards zu bedienen.

* **Akzeptanzkriterien:**

  - Der Wechsel erfolgt über eine Schaltfläche in der Sidebar.

  - Die Abstände von Absender, Empfänger, Infoblock, Faltmarken und Briefkern passen sich augenblicklich an die DIN-Vorgaben an.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Die Sidebar enthält Buttons für "Form A" und "Form B".

  - Das Script fügt bei Klick dem App-Shell-Element die Klasse `.form-a` oder `.form-b` hinzu.

  - Im CSS (`css/layout.css`) sind alle Positionen (z. B. Falzmarken, Top-Positionen des Briefkerns) in Abhängigkeit von dieser Klasse deklariert.

### 3. Tasks (Die Aufgaben)

- [x] Layout-Buttons im HTML-Sidebar-Bereich erstellen.

- [x] CSS-Positionierungsklassen für `.form-a` und `.form-b` schreiben.

- [x] Klick-Listener in `js/main.js` registrieren, der Klassen toggelt und die Einstellungen speichert.

---

### Feature 3: Native Color Schemes (Light- & Dark-Mode)

### 1. Specify (Das "Was")

* **User Story:** Als Anwender möchte ich die App in einem hellen, dunklen oder sich automatisch an das System anpassenden Modus nutzen, um ermüdungsfrei arbeiten zu können.

* **Akzeptanzkriterien:**

  - Umschalter in der Sidebar für "Hell", "Dunkel" und "System".

  - Die Farben passen sich harmonisch an. Das Briefpapier selbst bleibt für die Bearbeitungs-Klarheit weiß (analog zum physischen Druck).

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Nutzung des nativen CSS-Features `color-scheme: light dark` und `light-dark(hell, dunkel)`.

  - Farbzuweisung über OKLCH Custom Properties in `css/variables.css`.

  - JS manipuliert ausschließlich das Attribut `style.colorScheme` des HTML-Elements für manuelles Überschreiben.

### 3. Tasks (Die Aufgaben)

- [x] Theme-Variablen in `css/variables.css` mit `light-dark()` deklarieren.

- [x] Segmented Control in der Sidebar für Themes einrichten.

- [x] Theme-Anwendungslogik in `js/main.js` einbauen.

---

### Feature 4: LocalStorage Auto-Save & Draft-Management

### 1. Specify (Das "Was")

* **User Story:** Als Briefschreiber möchte ich, dass jeder geschriebene Buchstabe im Briefbogen sofort lokal gesichert wird, damit ich bei einem versehentlichen Tab-Schließen oder Browser-Absturz keine Daten verliere.

* **Akzeptanzkriterien:**

  - Automatisches lautloses Speichern im Hintergrund bei Tastatureingaben.

  - Automatisches Wiederherstellen des letzten Entwurfs beim Öffnen der Webseite.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Briefelemente nutzen `contenteditable="plaintext-only"`.

  - Jedes editierbare Element erhält eine eindeutige `id`.

  - Bei jedem `input`-Event auf einem Editier-Feld liest das Script alle Texte aus, baut ein JSON-Objekt und speichert es unter `din_draft_current` im LocalStorage.

  - Beim Laden der Seite (`DOMContentLoaded`) wird das Objekt eingelesen und die Felder befüllt.

### 3. Tasks (Die Aufgaben)

- [x] Eindeutige IDs und `contenteditable="plaintext-only"` im HTML vergeben.

- [x] Hilfsmodul `js/storage.js` für LocalStorage-Verwaltung anlegen.

- [x] Auto-Save Event-Listener in `js/main.js` verknüpfen.

- [x] Lade-Logik beim Systemstart implementieren.

---

### Feature 5: Scroll-freier Multipage-Wechsler (Karussell)

### 1. Specify (Das "Was")

* **User Story:** Als Briefschreiber möchte ich lange Briefe verfassen können, die über eine Seite hinausgehen, ohne dass Scrollbalken entstehen oder Text abgeschnitten wird, indem der Brief nahtlos auf neue, separat navigierbare Seiten paginiert wird.

* **Akzeptanzkriterien:**

  - Der Anwender kann über Navigationsbuttons im Viewport (Zurück, Weiter, Neue Seite) zwischen den Seiten wechseln.

  - Das Briefblatt scrollt nicht, sondern wird horizontal verschoben (Karussell-Effekt).

  - Ein Page-Indicator zeigt die aktuelle Seite und die Gesamtseitenanzahl an (z. B. "Seite 1 / 2").

  - Beim Drucken werden alle Seiten untereinander als reguläre Einzelseiten gedruckt.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Wir fügen einen horizontalen Flexbox-Träger (`#paper`) ein, der mehrere `<din-a4>`-Blätter nebeneinander enthält.

  - Die Navigation erfolgt über ein CSS-Translation-Attribut auf dem `#paper`-Element: `transform: translateX(calc(-100% * (var(--page-current, 1) - 1)))`.

  - JS manipuliert die CSS Variable `--page-current` und die Anzahl der Kind-Elemente.

  - Neue Seiten werden aus einem `<template id="tpl-din-page">` instanziiert und dem DOM hinzugefügt.

  - Für den Druck wird das Karussell per CSS aufgehoben (`transform: none`, `display: block` unter `@media print`).

### 3. Tasks (Die Aufgaben)

- [ ] Multipage-Träger `#paper` in `index.html` einbetten und Navigation-Controls ergänzen.

- [ ] HTML `<template id="tpl-din-page">` für neue Blätter definieren.

- [ ] CSS-Karussell-Transformation und Karussell-Button-Styles in `css/layout.css` implementieren.

- [ ] Druck-Layout in `css/layout.css` anpassen, um alle Seiten untereinander zu drucken.

- [ ] Paginierungs-, Navigations- und Add-Page-Logik in `js/main.js` integrieren.

- [ ] LocalStorage-Sicherungsmodul in `js/main.js` und `js/storage.js` anpassen, um mehrseitige Inhalte zu speichern.

---

### Feature 6: Zentralisierung aller Konstanten und Feedback-Meldungen (Toasts)

### 1. Specify (Das "Was")

* **User Story:** Als Entwickler möchte ich alle Systemgrenzen (z. B. Undo/Redo Limits, Dateigrößen, API-Debounce) und alle Systemrückmeldungen (Erfolgsmeldungen, Warnungen, Validierungsfehler) an einem zentralen Ort pflegen können, um den Code übersichtlich zu halten und spätere Übersetzungen (Lokalisierung) zu vereinfachen.

* **Akzeptanzkriterien:**

  - Keine hartcodierten Strings für Erfolgsmeldungen, Warnungen oder Fehler in den JavaScript-Dateien.

  - Alle Texte und Fehlermeldungen sind in einem zentralen Objekt gekapselt.

  - Systemkonstanten (wie Speicher-Keys oder Dateigrößenbegrenzungen) werden aus derselben SSoT bezogen.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Wir erstellen eine eigenständige ES-Moduldatei `js/constants.js`.

  - Alle UI-bezogenen Meldungen (Toasts), Storage-Keys und Grenzwerte werden als exportierbares `Constants`-Objekt bereitgestellt.

  - JS-Module (`js/main.js`, `js/storage.js` etc.) importieren dieses Modul und greifen dynamisch auf die Strings zu (z. B. `Constants.TOASTS.PROFILE_SAVED`).

### 3. Tasks (Die Aufgaben)

- [x] Zentrales Constants-Modul `js/constants.js` anlegen und befüllen.

- [x] JS-Logikdateien umschreiben, um hartcodierte Texte durch Importe aus `constants.js` zu ersetzen.

---

# Zukünftiges Backlog (Phase 3 Feature-Roadmap)

> [!NOTE]
> Die folgenden Features befinden sich im ruhenden Planungs-Backlog und werden aktuell nicht aktiv verfolgt.

## 🟡 Backlog (Geplant / Zurückgestellt)

> [!WARNING]
> Die folgenden Features befinden sich im Backlog und werden aktuell nicht aktiv verfolgt, da sie teilweise den strikten Zero-Dependency und Wartungsfreiheits-Regeln widersprechen könnten.

#### Feature 7: Auto-Kompakt Layout-Modus (Form A/B Auto-Switch)

* **Specify (Das "Was"):** Als Briefschreiber möchte ich, dass die Anwendung bei langem Brieftext automatisch von Form B auf Form A wechselt, falls dadurch der Text gerade so auf eine einzige Seite passt, um Zeit und Papier zu sparen.

* **Akzeptanzkriterien:**

  - Option "Automatisch" in der Sidebar unter "DIN-Brief Layout".

  - Echtzeit-Berechnung des vertikalen Textüberlaufs über relative Ratios (Grenze: Y: 235mm, Ratio `0.791`).

  - Wenn Text in Form B überläuft, aber in Form A passt, erfolgt ein flüssiger Wechsel zu Form A.

  - Bei Textkürzung erfolgt der automatische Rückwechsel zu Form B.

### Feature 8: Anrede-Stil & Auto-Gender Engine

* **Specify (Das "Was"):** Als Briefschreiber möchte ich den Stil der Anrede (Förmlich, Höflich, Modern) in der Sidebar wählen können, und die Anwendung soll basierend auf dem Empfängernamen automatisch das Geschlecht ermitteln und die passende Anrede und Grußformel vorschlagen.

* **Akzeptanzkriterien:**

  - Segmented Control in der Sidebar für "Anrede-Stil" (Förmlich, Höflich, Modern).

  - Automatisches Scannen des Empfängernamens auf Titel (Dr., Prof.) und Geschlechtsmerkmale via RegExp.

  - Auto-Generierung von Anrede und Grußformel über "Ghost-Sync", solange der Benutzer diese nicht manuell editiert hat. Manual Overrides haben absolute Priorität.

### Feature 9: Integriertes Absender-Profil (Persönliche Daten)

* **Specify (Das "Was"):** Als regelmäßiger Briefschreiber möchte ich meine persönlichen Kontaktdaten, Bankdaten und Footer-Zusätze dauerhaft in der Sidebar speichern können, damit diese bei jedem neuen Brief automatisch in den Briefkopf und die Fußzeile eingepflegt werden.

* **Akzeptanzkriterien:**

  - Einklappbares Formular "Absender-Profil" in der Sidebar.

  - Persistent gespeicherte Profildaten unter `din_profile` im LocalStorage.

  - Automatisches Befüllen von `#absender`, `#info-tel` und Brieffooter beim Speichern und beim Systemstart.

### Feature 10: Premium Ambient Dark Mode (Time- & System-based)

* **Specify (Das "Was"):** Als Benutzer möchte ich abends und nachts dezent und ohne grelles Licht Briefe schreiben, ohne dass eine fehlerhafte Farbinversion die Brief-Ästhetik ruiniert. Der Nachtmodus soll sich abends automatisch aktivieren.

* **Akzeptanzkriterien:**

  - Segmented Control für "Theme" (Hell, Dunkel, Auto).

  - Modus "Auto" schaltet abends/nachts (18:00 - 06:00 Uhr) oder bei System-Dark-Preference automatisch in den Dark Mode um (30s clock interval check).

  - Keine Inversions-Filter! Das Briefpapier wird im Dark Mode in edles, warmes Dunkelgrau (`oklch(28% 0.01 250)`) gefärbt, das die Augen schont.

  - Beim Drucken wird das Papier ausnahmslos reinweiß mit schwarzem Text ausgegeben (Druck-Souveränität).

### Feature 11: Easter-Egg High-Integrity Dev-Panel (Popover-based)

* **Specify (Das "Was"):** Als Entwickler möchte ich ein verstecktes Diagnose-Panel direkt in der Web-App aufrufen können, indem ich 3-mal schnell hintereinander auf das Versions-Badge im Fußbereich klicke, um den Bereitschaftsbericht aller 25 Bleeding-Edge-Features live einzusehen.

* **Akzeptanzkriterien:**

  - 3-Klick-Easter-Egg auf `#dev-easter-egg` im Footer (1000ms Timeout-Fenster).

  - Einblendung über ein natives HTML5 Popover `#dev-popover` (`popover="manual"`) ohne zusätzliche Bibliotheken.

  - Dynamisches Ausführen der 25 Diagnosetests bei jedem Öffnen und Befüllen der Tabelle.

  - Schließen-Button (`&times;`) und ein Button zum manuellen Leeren der Browser-Konsole im Overlay.

  - Perfekte Scrollbarkeit der Tabelle im Overlay ohne Beeinträchtigung des Haupt-Layouts.

  - Vollständig produktiv implementiert und einsatzbereit.