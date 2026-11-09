---
id: guidelines-browser-upstream
title: Upstream Ground-Truth & Browser-Features
type: guideline
status: active
created: 2026-11-09
updated: 2026-11-09
tags:
  - architecture
  - standards
  - chromium
  - tooling
  - bcd
doc_links:
  - ADR-HTML
  - ADR-CSS
  - ADR-JS
code_links:
  - tools/query_chrome_feature.mjs
depends_on: []
---

# Upstream Ground-Truth & Browser-Features (Chromium 150+)

## 1. Zweck & Leitprinzip

Dieses Dokument definiert den verbindlichen Standard für die Recherche und Nutzung moderner Web-Plattform-Features im Projekt DIN-BriefNEO.

> **Leitprinzip:** Vor dem Entwurf spekulativer JavaScript-Workarounds, komplexer Polyfills oder heuristischer Layout-Rechnungen **MUSS** geprüft werden, ob Chromium (ab Version 150+) das Feature bereits nativ im C++-Compositor oder DOM bereitstellt.

### Schutz vor Halluzinationen
LLM-Trainingskorpora unterliegen oft einem Wissensstopp oder spiegeln veraltete Diskussionsstände wider:
* **Negativbeispiel (`string-set`):** LLMs schlagen häufig `string-set` / `string()` für Druckköpfe in CSS Paged Media vor. Eine Abfrage der Chrome-Platform-Status-API beweist in <500 ms: `string-set` existiert in Chromium nicht (0 Treffer).
* **Positivbeispiele:** Features wie das native `popover`-Attribut (Chrome 114+), CSS Anchor Positioning (`position-anchor`, `position-area`, Chrome 125+ / 129+), `Promise.withResolvers()` (Chrome 119+) oder Element-scoped View Transitions sind seit vielen Releases 100 % stabil verfügbar.

---

## 2. Maschinenlesbare Ground-Truth-Quellen

Verwende ausschließlich verifizierte, maschinenlesbare Quellen:

1. **Chrome Platform Status API (v0):**
   * Endpoint: `https://chromestatus.com/api/v0/features?q=<FEATURE>`
   * Milestone-Übersicht: `https://chromestatus.com/api/v0/features?milestone=<VERSION>`
   * Kriterium: Status `ENABLED_BY_DEFAULT` oder Chrome Desktop Milestone $\le$ 156.
   * *Hinweis:* Die API liefert JSON geschützt mit dem Präfix `)]}'\n`.

2. **MDN Browser-Compat-Data (BCD Raw JSON):**
   * Base-URL: `https://raw.githubusercontent.com/mdn/browser-compat-data/main/`
   * Relevante Pfade:
     * `html/elements.json` (HTML-Tags und native Controller)
     * `html/global_attributes.json` (`popover`, `anchor`, etc.)
     * `css/properties.json` (`position-area`, `position-anchor`, `interpolate-size`)
     * `css/selectors.json` (`:has()`, `:popover-open`)
     * `api/Document.json`, `api/Element.json`, `api/Popover.json`
   * Kriterium: `support.chrome.version_added` $\le$ aktuelle Baseline.

3. **WebDX Feature-Index:**
   * URL: `https://raw.githubusercontent.com/web-platform-dx/web-features/main/index.json`
   * Nutzung: Validierung von Baseline-Definitionen.

---

## 3. Tooling & Abfrage-Workflow

Zur schnellen Prüfung im Terminal steht das Skript `tools/query_chrome_feature.mjs` bereit:

```bash
# Prüfung eines konkreten Features
node tools/query_chrome_feature.mjs popover
node tools/query_chrome_feature.mjs "anchor positioning"

# Prüfung aller Features eines Chrome-Milestones
node tools/query_chrome_feature.mjs --milestone 150

# Über npm
npm run check:browser-feature popover
```

### Exemplarisches Abfragemuster (Node.js)

```javascript
const query = 'popover';
const res = await fetch(`https://chromestatus.com/api/v0/features?q=${encodeURIComponent(query)}`);
const raw = await res.text();
const data = JSON.parse(raw.replace(/^\)\]\}'\r?\n/, ''));

for (const f of data.features) {
  console.log(`${f.name} -> Chrome Desktop: ${f.browsers?.chrome?.desktop}`);
}
```
