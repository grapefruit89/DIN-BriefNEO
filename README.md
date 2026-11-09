<p align="center">
  <img src="envelope.svg" width="72" alt="DIN-BriefNEO Logo">
</p>

<h1 align="center">DIN-BriefNEO</h1>

<p align="center">
  <strong>Open-Source DIN-5008-Briefgenerator (Form A & Form B) als reine W3C-Web-Applikation.</strong><br>
  Wartungsfrei auf Lebenszeit. 100 % offlinefähig. Keine Frameworks. Keine npm-Laufzeitabhängigkeiten.
</p>

<p align="center">
  <a href="https://grapefruit89.github.io/DIN-BriefNEO/"><strong>🚀 Live-App auf GitHub Pages öffnen</strong></a>
</p>

---

## 🏛️ Die 5 Architektur-Säulen

### 1. Zero-Dependency & Zero-Build
- **100 % nativer W3C-Standard:** Reines HTML5, modernstes CSS und modulare ES-Module (`<script type="module">`).
- **Baseline Chromium 150+ (Chrome only):** Wir nutzen modernste Webplattform-APIs ohne Polyfills, ohne Vendor-Präfixe und ohne Altlasten.
- **Kein Frontend-Build:** Kein Node-Build-Schritt für die Ausführung der Web-App, keine Bundler (kein Vite, kein Webpack, kein Rollup), keine Frameworks (kein React, Vue oder Svelte). Der Code im Editor ist der Code im Browser.

### 2. Single Source of Truth (SSoT) & Columnar Gzip
- **Kompakt & Blitzschnell:** 10.184 deutsche Postleitzahlen, Orte und Bezirke komprimiert in verlustfreiem Columnar-JSON als [`website/data/orte.json.gz`](website/data/orte.json.gz) (68 KB).
- **Native Dekomprimierung:** Laden im Browser via standardisierter `DecompressionStream('gzip')`-Streaming-API in unter 1 ms bei Tastendruck.
- **Data-as-Code Pipeline:** Kompiliert bit-deterministisch mit Level 9 und `mtime=0` über [`tools/build_plz_data.mjs`](tools/build_plz_data.mjs).
- **Automatisierte Pflege:** Quartalsweise automatische Updates via GitHub Actions ([`.github/workflows/update_plz_data.yml`](.github/workflows/update_plz_data.yml)).

### 3. Schema v4 (Tuple-Architektur)
- **Kompakte Persistenz:** Speicherung des Brief-Zustands über ein 35-teiliges kanonisches Tuple-Array (`DinLetterLayout` in [`website/js/persistence.js`](website/js/persistence.js)).
- **Deterministische Versionierung:** Schema v4 garantiert absolute Typ- und Reihenfolgestabilität. Altschemata (v1–v3) werden beim Import defensiv und isoliert migriert.

### 4. Datensicherheit & Zero-Base64-Invariante
- **Clientseitig & Offline-Autark:** Sämtliche Daten verbleiben zu 100 % im Browser des Nutzers. Kein Tracking, keine Telemetrie, keine externen Cloud-Verbindungen.
- **Strikte Speichertrennung:**
  - `localStorage` dient als SSoT für reine Text-Entwürfe (`din_draft`) und UI-Einstellungen.
  - Clientseitige `IndexedDB` ([`website/js/binary-storage.js`](website/js/binary-storage.js)) dient als isolierter Speicher für Binär-Blobs (WOFF2-Fonts, Signatur-Grafiken) – **striktes Verbot von Base64 im LocalStorage**.

### 5. Die Entscheidungs-Leiter (HTML vor CSS vor JS)
> **Das unumstößliche Kern-Dogma von DIN-BriefNEO:**  
> **Alles, was im HTML gemacht werden kann, machen wir im HTML.**  
> **Alles, was dort nicht geht, machen wir mit CSS.**  
> **Und erst wenn CSS nachweislich nicht ausreicht, kommt JavaScript:**  
> 👉 **`JavaScript = Krücke`** — es ist das letzte Mittel, niemals das erste.

1. **HTML5 First:** Native Formular-Validierung (`pattern`, `minlength`, `maxlength`), Popover API (`popover`, `popovertarget`), native Dialoge mit Invoker Commands (`commandfor`) und `contenteditable="plaintext-only"`.
2. **CSS Declarative:** State-Modeling über `:has()`, `@starting-style` für Einblendungen, Container Queries (`@container`), OKLCH-Farbraum (`color-mix()`), logische Properties (`margin-block`, `inset-inline`) und A4-Druckisolierung (`@media print`).
3. **Minimal Surgical JS:** Kein `new Date()` (Ausschließliche Nutzung der standardisierten `Temporal`-API), kein `innerHTML` (strikte XSS-Prävention) und modulares Pub-Sub-System via `eventBus`.

---

## 💻 Entwickler-Workflow

### 1. Lokaler Start
Wegen nativer ES-Module und CORS-Regeln muss die App über einen statischen HTTP-Server serviert werden (`file://` genügt nicht):

```bash
# Linux (Python-HTTP-Server & Debug-Browser mit CDP):
./tools/start.sh

# Windows (PowerShell-Live-Reload-Server):
tools\start.bat

# Oder über einen beliebigen statischen HTTP-Server:
python3 -m http.server 8088 --directory website/
```

Die App ist anschließend unter `http://localhost:8088` erreichbar.

### 2. Lokale Quality Gates
Das Repository erzwingt 100 % deterministische Code- und Architekturqualität:

```bash
# 1. Biome Linter & Code-Formatierung
npm run check

# 2. Headless Chrome Test-Suite (174 Unit- und Integrationstests)
npm test

# 3. Antipattern-Prüfung gegen die 36 Immutable Laws
npm run check:antipatterns

# 4. Evolutionäres Fitness Gate (muss 100.0 % clean erreichen)
node tools/build_db.js -q
```

### 3. Git-Hooks scharfschalten
Zur Absicherung vor versehentlichen Fehl-Commits verfügt das Repository über gehärtete Git-Hooks:

```bash
# Einmalig im lokalen Klon aktivieren:
git config core.hooksPath githooks
```

Der `pre-commit`-Hook führt automatisch Linter, Unit-Tests und das Fitness Gate aus.

---

## 📜 Lizenz & Sicherheit

DIN-BriefNEO steht unter der [MIT-Lizenz](LICENSE) — frei nutzen, modifizieren und weitergeben.  
Sicherheitsmeldungen bitte vertraulich über [Private Vulnerability Reporting](.github/SECURITY.md) melden.
