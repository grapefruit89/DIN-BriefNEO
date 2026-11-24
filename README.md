<p align="center">
  <img src="envelope.svg" width="72" alt="DIN-BriefNEO Logo">
</p>

<h1 align="center">DIN-BriefNEO</h1>

<p align="center">
  <strong>Open-Source DIN-5008-Briefgenerator (Form A & Form B) als reine W3C-Web-Applikation.</strong><br>
  Wartungsfrei auf Lebenszeit. Ohne Backend. Keine Frameworks. Keine npm-Laufzeitabhängigkeiten.
</p>

<p align="center">
  <a href="https://grapefruit89.github.io/DIN-BriefNEO/"><strong>🚀 Live-App auf GitHub Pages öffnen</strong></a>
</p>

---

## 🏛️ Die 5 Architektur-Säulen

### 1. Zero-Dependency & Zero-Build
- **100 % nativer W3C-Standard:** Reines HTML5, modernstes CSS und modulare ES-Module (`<script type="module">`).
- **Baseline Chromium 150+ (Chrome only):** Wir nutzen modernste Webplattform-APIs ohne Polyfills, ohne Vendor-Präfixe und ohne Altlasten. Getestet mit Chrome/Helium 156.
- **Kein Frontend-Build:** Kein Node-Build-Schritt für die Ausführung der Web-App, keine Bundler (kein Vite, kein Webpack, kein Rollup), keine Frameworks (kein React, Vue oder Svelte). Der Code im Editor ist der Code im Browser.

### 2. Single Source of Truth (SSoT) & Columnar Gzip
- **Kompakt & Blitzschnell:** 10.184 deutsche Postleitzahlen, Orte und Bezirke komprimiert in verlustfreiem Columnar-JSON als [`website/data/orte.json.gz`](website/data/orte.json.gz) (81.745 B).
- **Native Dekomprimierung:** Laden im Browser via standardisierter `DecompressionStream('gzip')`-Streaming-API in unter 1 ms bei Tastendruck.
- **Data-as-Code Pipeline:** Kompiliert bit-deterministisch mit Level 9 und `mtime=0` über [`tools/build_plz_data.mjs`](tools/build_plz_data.mjs).
- **Automatisierte Pflege:** Quartalsweise automatische Updates via GitHub Actions ([`.github/workflows/update_plz_data.yml`](.github/workflows/update_plz_data.yml)).

### 3. Schema v5
- **Typisierter Payload:** [`website/js/persistence.js`](website/js/persistence.js) schreibt `schema_version: 5` mit Layout-Metadaten (`form`, `marks`), allen Textfeldern und der Signatur-Transformation.
- **Strenge Annahme:** Importiert wird ausschließlich v5. Ältere Stände werden mit klarer Fehlermeldung abgelehnt, statt halb migriert zu werden — ein Brief, der stillschweigend anders aussieht, ist schlimmer als eine Fehlermeldung.

### 4. Datensicherheit & Zero-Base64-Invariante
- **Clientseitig:** Sämtliche Daten verbleiben im Browser des Nutzers. Kein Tracking, keine Telemetrie.
- **Eine optionale externe Verbindung:** Die Adresssuche fragt auf Wunsch Geoapify (`api.geoapify.com`) — nur beim Tippen im Straßenfeld, nie automatisch. Ohne Netz arbeitet alles andere normal weiter.
- **Strikte Speichertrennung:**
  - `localStorage` dient als SSoT für reine Text-Entwürfe und UI-Einstellungen.
  - Clientseitige `IndexedDB` ([`website/js/binary-storage.js`](website/js/binary-storage.js)) dient als isolierter Speicher für Binär-Blobs (WOFF2-Fonts, Signatur-Grafiken) – **strikte Ablehnung von Base64 im LocalStorage**.

### 5. Die Entscheidungs-Leiter (HTML vor CSS vor JS)
> **Das unumstößliche Kern-Dogma von DIN-BriefNEO:**  
> **Alles, was im HTML gemacht werden kann, machen wir im HTML.**  
> **Alles, was dort nicht geht, machen wir mit CSS.**  
> **Und erst wenn CSS nachweislich nicht ausreicht, kommt JavaScript:**  
> 👉 **`JavaScript = Krücke`** — es ist das letzte Mittel, niemals das erste.

1. **HTML5 First:** Native Formular-Validierung (`pattern`, `minlength`, `maxlength`), Popover API, native Dialoge mit Invoker Commands (`commandfor`) und `contenteditable="plaintext-only"`.
2. **CSS Declarative:** State-Modeling über `:has()`, `@starting-style`, Container Queries, OKLCH-Farbraum (`color-mix()`), logische Properties und A4-Druckisolierung (`@media print`).
3. **Minimal Surgical JS:** Kein `new Date()` (ausschließlich `Temporal`), kein `innerHTML`, kein `eval` — durch Antipattern-Regeln maschinell erzwungen (siehe unten).

---

## 🅰️ Typografie

Der Brief braucht keine Systemschrift, um richtig auszusehen — er bringt seine eigene mit.

### Mitgeliefert (im Repo, SIL OFL 1.1)

| Datei | Größe | Rolle |
|---|---|---|
| `website/fonts/liberation-sans-regular.woff2` | 17.560 B | **Standard** für den ganzen Brief |
| `website/fonts/liberation-sans-bold.woff2` | 17.004 B | Betreff, Anlagen, `<b>` |
| `website/fonts/inter_18pt-regular.woff2` | 15.208 B | wählbare Alternative |
| `website/fonts/inter_18pt-bold.woff2` | 15.664 B | Betreff bei Inter |

- **Warum Liberation Sans:** DIN 5008 Kap. 20.7.1 nennt Arial und Helvetica. Liberation Sans ist deren freie, **metrisch identische** Umsetzung — ein Brief bricht zeilenweise genauso um wie ein Arial-Brief, auf Linux, Windows und macOS.
- **DACH-Zeichensatz:** ASCII, Umlaute, ẞ, typografische Anführungszeichen, `§`, `€`, Rechen- und Maßzeichen. Keine fremden Alphabete — was fehlt, fällt auf dieselbe Konstruktion zurück.
- **Einheitliche optische Größe:** `font-size-adjust: 0.535` normalisiert die x-Höhe über alle Schriften, auch in den Eingabefeldern.

### Lokale Testschriften (`fonts/`, nicht im Repo)

`fonts/` ist komplett gitignoriert. Der Dev-Server listet es unter `/__fonts` aus, die App baut daraus die Gruppe „Nur lokal" und lädt per `FontFace`-API. Auf GitHub Pages gibt es weder Liste noch Dateien.

### Eigene Schriftarten (lokal in IndexedDB)

Eigene Schriftdateien (`.woff2`, `.ttf`, `.otf`) können über „Eigene Schriftart laden" eingebunden werden. Sie werden lokal in IndexedDB (`briefneo-assets`) gespeichert, bleiben dauerhaft erhalten und werden per `font-size-adjust: 0.535` auf das DIN-5008-Raster skaliert.

---

## ⌨️ Bedienung

- **Kalender** ([`website/js/date-picker.js`](website/js/date-picker.js)): Monatsgitter auf `Temporal`, Pfeiltasten, „Heute".
- **Agenten-API** ([`website/js/api.js`](website/js/api.js)): `window.dinApi` mit `hilfe()`, `lesen()`, `setzen(id, wert)`, `anrede()`, `adresse()`, `datum()`, `exportieren()` — ein Agent kann den Brief füllen, ohne das DOM zu kennen.
- **Debug-Panel** ([`website/js/debug-panel.js`](website/js/debug-panel.js)): zeigt, welche Anrede- und Adressteile erkannt wurden, mit Kopierknöpfen.

---

## 🤖 Agenten

Der Brief lässt sich von einem Agenten schreiben — im Browser und in der
Kommandozeile. Eine Fähigkeitsschicht (`window.dinApi`), zwei Transporte:

- **WebMCP** ([Entwurf](https://developer.chrome.com/docs/ai/webmcp)): Chrome
  149+ hinter `chrome://flags/#enable-webmcp-testing` oder per Origin Trial. Die
  Seite registriert zehn Werkzeuge (`brief_schreiben`, `brief_lesen`, …), sobald
  `document.modelContext` vorhanden ist. Fehlt die API, passiert nichts.
- **MCP** (stdio, zero-dependency): `tools/mcp-live.mjs` — kein Debug-Port, die
  Seite meldet sich selbst am lokalen Kanal. Reicht genau die Werkzeuge der
  Seite durch, keine eigenen dazu.
- **Konsole/CDP**: `window.dinApi` und `window.dinBriefAgent` stehen nach dem
  Boot bereit, ohne Flag.

Details, MCP-Konfiguration und Grenzen:
[`docs/js/AGENTEN-WEBMCP.md`](docs/js/AGENTEN-WEBMCP.md).

---

## 💻 Entwickler-Workflow

### 1. Lokaler Start

Wegen nativer ES-Module und CORS-Regeln muss die App über einen statischen HTTP-Server serviert werden (`file://` genügt nicht):

```bash
# Linux (einziger Standard): alter Kram weg, No-Cache-Server auf 8088, Debug-Browser mit CDP auf 9222
./tools/dev.sh
./tools/dev.sh status     # Ports, Prozesse und Tabs
./tools/dev.sh --vanilla  # wie oben, aber Logs + Dev-Caches vorher leeren
./tools/dev.sh stop       # Server, Live-Kanal und Debug-Browser beenden
```

Die App ist anschließend unter `http://127.0.0.1:8088/index.html` erreichbar.

**Wichtig:** `tools/dev.sh` liefert `website/` als Wurzel aus und beendet vorher deterministisch alte Dev-Server (`serve.mjs`, `static-server.mjs`, `mcp-live.mjs`, `python http.server` auf 8088) sowie Debug-Browser der eigenen Profile. Die Dev-Extras `/__fonts` (lokale Schriften) und `/__geokey` (Geoapify-Key aus `~/.secrets/`) bleiben verfügbar, weil `tools/static-server.mjs` das Repo-Wurzelverzeichnis selbst kennt. Der Arbeits-Browser (`~/.config/net.imput.helium`, CDP 9223) wird nie angefasst.

### 2. Lokale Quality Gates

```bash
npm run check                # Biome Linter & Formatierung (website/)
npm test                     # Headless-Chrome-Tests: 420 Fälle + Korpus-Gate
npm run check:antipatterns   # 57 Antipattern-Regeln gegen die 40 A-Gesetze
node tools/build_db.js       # Fitness Gate (muss 100.0 % clean erreichen)
node tools/repo-map-check.mjs # Wegweiser: Pfade und Module vollständig
```

### 3. Git-Hooks scharfschalten

```bash
git config core.hooksPath githooks
```

Der `pre-commit`-Hook fährt Linter, Tests, Antipattern- und Fitness-Gate.

---

## 📜 Lizenz & Sicherheit

**Code:** [MIT-Lizenz](LICENSE) — frei nutzen, modifizieren und weitergeben.

**Schriften:** Die mitgelieferten Schriften stehen unter **SIL Open Font License 1.1**, die Lizenztexte liegen neben den Dateien:

| Schrift | Lizenz | Datei |
|---|---|---|
| Liberation Sans | SIL OFL 1.1 (© Red Hat / Google) | [`website/fonts/LICENSE-Liberation.txt`](website/fonts/LICENSE-Liberation.txt) |
| Inter | SIL OFL 1.1 (© The Inter Project Authors) | [`website/fonts/LICENSE-Inter.txt`](website/fonts/LICENSE-Inter.txt) |

**Nicht im Repo und nie ausgeliefert:** Aptos (Microsoft) und Michelangelus (Gusto IDS, „All rights reserved") liegen ausschließlich lokal in `fonts/` und sind über die veröffentlichte Seite nicht erreichbar.

Sicherheitsmeldungen bitte vertraulich über [Private Vulnerability Reporting](.github/SECURITY.md) melden.
