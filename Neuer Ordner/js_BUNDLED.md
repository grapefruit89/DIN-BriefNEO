---
title: "Antigravity Context Bundler – js"
created: 2026-03-27
exported_at: "2026-03-27 14:59:33"
source_path: "C:\Users\morit\Desktop\DIN-BriefNEO\js"
file_count: 14
total_chars: 77743
total_lines: 2208
version: "4.1"
llm_context: true
tags:
  - const
  - return
  - document
  - export
  - json
  - function
  - registry
  - data
  - container
  - true
  - getelementbyid
  - text
  - sanitizer
  - match
  - string
  - lines
  - state
  - console
  - config
  - elements
  - type
  - postmessage
  - temporal
  - entry
  - street
  - bias
  - city
  - response
  - error
  - addr
aliases:
  - "js Bundle"
---

# Antigravity Context Bundler – js

> LLM-ready context bundle with Obsidian [[links]] and Cemetery of Ideas.

## Inhaltsverzeichnis

1. [Statistik](#statistik)
2. [Verzeichnisbaum](#verzeichnisbaum)
3. [Dateiliste](#dateiliste)
5. [Datei-Inhalte](#datei-inhalte)

## Statistik

### Top-Keywords
`const` · `return` · `document` · `export` · `json` · `function` · `registry` · `data` · `container` · `true` · `getelementbyid` · `text` · `sanitizer` · `match` · `string` · `lines` · `state` · `console` · `config` · `elements` · `type` · `postmessage` · `temporal` · `entry` · `street` · `bias` · `city` · `response` · `error` · `addr`

## Verzeichnisbaum

```
js/
├── 📁 core/
│   ├── 📄 app.js ✓
│   ├── 📄 constants.js ✓
│   ├── 📄 io-coordinator.js ✓
│   ├── 📄 opfs-worker.js ✓
│   ├── 📄 state.js ✓
│   └── 📄 temporal-utils.js ✓
├── 📁 logic/
│   ├── 📄 greetings.js ✓
│   ├── 📄 layer ✓
│   └── 📄 logic.js ✓
└── 📁 ui/
    ├── 📄 address-service.js ✓
    ├── 📄 devmode.js ✓
    ├── 📄 ghost-mirror.js ✓
    ├── 📄 model-blacklist.js ✓
    └── 📄 ui.js ✓
```

## Dateiliste

| # | Pfad | Typ | Größe | Zeilen | Zeichen | Keywords |
|---|------|-----|-------|--------|---------|----------|
| 1 | `ui\address-service.js` | .js | 8.51 KB | 261 | 8334 | const, container, street, bias |
| 2 | `ui\devmode.js` | .js | 4.78 KB | 127 | 4371 | const, document, popover, function |
| 3 | `ui\ghost-mirror.js` | .js | 4.20 KB | 114 | 4068 | mirror, text, span, currentoffset |
| 4 | `ui\model-blacklist.js` | .js | 4.11 KB | 103 | 3950 | reason, pattern, since, const |
| 5 | `logic\greetings.js` | .js | 4.82 KB | 130 | 4687 | const, return, formality, gender |
| 6 | `logic\layer` |  | 6 B | 3 | 6 |  |
| 7 | `core\app.js` | .js | 1.59 KB | 59 | 1572 | export, state, pdfcoordinator, document |
| 8 | `core\constants.js` | .js | 3.03 KB | 83 | 2903 | sanitizer, object, freeze, registry |
| 9 | `core\opfs-worker.js` | .js | 6.01 KB | 174 | 5870 | const, await, data, name |
| 10 | `core\io-coordinator.js` | .js | 8.20 KB | 222 | 8057 | data, worker, state, type |
| 11 | `core\temporal-utils.js` | .js | 2.35 KB | 77 | 2217 | isostring, temporal, date, return |
| 12 | `ui\ui.js` | .js | 8.42 KB | 246 | 8172 | const, document, entry, target |
| 13 | `logic\logic.js` | .js | 10.28 KB | 268 | 9644 | const, return, export, function |
| 14 | `core\state.js` | .js | 13.90 KB | 341 | 13892 | elements, const, innertext, document |

## Datei-Inhalte

### [[ui/address-service.js]]

| Feld | Wert |
|------|------|
| Pfad | `ui\address-service.js` |
| Typ | `.js` |
| Größe | 8.51 KB |
| Zeilen | 261 |
| Zeichen | 8334 |
| Keywords | `const` `container` `street` `bias` `return` `city` `response` `error` `addr` `apikey` `confidence` `postcode` `result` `geoapify` `query` |

```javascript
/**
 * js/ui/address-service.js — Production Ready Autocomplete
 * [SPEC-038] Multi-Provider Support (Photon & Geoapify)
 * [CMD-8] Geographical Proximity Bias (Bonn/Troisdorf)
 * ─────────────────────────────────────────────────────────
 */

export class AddressService {
  constructor(sm, ui) {
    this.sm = sm;
    this.ui = ui;
    this.container = null;
    this.debounceTimer = null;
    this.targetEl = document.querySelector('din-recipient');
    
    // [PLATINUM-CIRCUIT-BREAKER]
    this.errorCount = 0;
    this.status = 'GREEN'; // GREEN, YELLOW, BLACK
    this.lastFailure = 0;
    
    // [PLATINUM-BIAS] Default: Bonn/Troisdorf Region (50.73, 7.1)
    this.bias = {
        lat: 50.7333,
        lon: 7.1000
    };
  }

  /**
   * [AVIATION-GRADE] Resilience Wrapper for Fetch
   */
  async _safeFetch(url) {
    if (this.status === 'BLACK') {
        const now = Date.now();
        if (now - this.lastFailure < 30000) { // 30s Cool-down
            console.warn("[CircuitBreaker] BLACK: Request blocked to prevent flapping.");
            return null;
        }
        this.status = 'YELLOW';
        console.info("[CircuitBreaker] YELLOW: Attempting trial request...");
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        // [HYSTERESE] Gradual Recovery instead of immediate zero-reset
        if (this.errorCount > 0) {
            this.errorCount--; 
            if (this.errorCount === 0) this.status = 'GREEN';
        }
        return response;
    } catch (e) {
        this.errorCount++;
        this.lastFailure = Date.now();
        
        if (this.errorCount >= 3) {
            this.status = 'BLACK';
            this.ui._toast("Adress-Dienst gestört. Blackout-Protokoll aktiv.", "error");
        }
        throw e;
    }
  }

  /**
   * [PLATINUM-AUTOCOMPLETE] Initializes the address suggestion engine.
   * Utilizes CSS Anchor Positioning (Chrome 125+) for native overlay alignment.
   */
  init() {
    if (!this.targetEl) return;

    // Create container for suggestions
    this.container = document.createElement('div');
    this.container.className = 'autocomplete-suggestions';
    
    // [ADR-020] Native Anchor Positioning
    // We assign an anchor name to the target element via JS inline style
    // and set the container to follow this anchor.
    this.targetEl.style.anchorName = '--address-target';
    this.container.setAttribute('popover', 'manual');
    this.container.style.positionAnchor = '--address-target';
    
    document.body.appendChild(this.container);

    this.targetEl.addEventListener('input', (e) => {
      const query = e.target.textContent.trim();
      if (query.length < 3) {
        this.close();
        return;
      }
      this.debounce(() => this.fetchSuggestions(query), 400);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && e.target !== this.targetEl) {
        this.close();
      }
    });

    // Initial Bias Check from State
    this._refreshBiasFromState();
  }

  /**
   * [AVIATION-GRADE] Debounce mechanism.
   * @param {Function} fn - The function to execute.
   * @param {number} ms - Delay in milliseconds.
   */
  debounce(fn, ms) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(fn, ms);
  }

  /**
   * [PLATINUM-GEO] Fetches address suggestions from the configured provider.
   * @param {string} query - The search string.
   */
  async fetchSuggestions(query) {
    const provider = this.sm.state.config.addressProvider || 'photon';
    const apiKey = this.sm.state.config.addressApiKey || '';
    
    let url = '';
    const biasParam = `proximity:${this.bias.lon},${this.bias.lat}`;

    if (provider === 'geoapify' && apiKey) {
      url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&bias=${biasParam}&apiKey=${apiKey}&limit=5&lang=de`;
    } else {
      url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${this.bias.lat}&lon=${this.bias.lon}&limit=5&lang=de`;
    }

    try {
      const response = await this._safeFetch(url);
      if (!response) return; 
      const data = await response.json();
      const results = this.parseResults(data, provider);
      this.render(results);
    } catch (e) {
      console.error('[AddressService] Fetch failed:', e);
    }
  }

  /**
   * [PLATINUM-UI] Renders the suggestion list using native Popover API.
   * Positioning is handled automatically via CSS Anchor Positioning.
   * @param {Array} results - The parsed address objects.
   */
  render(results) {
    if (!results.length) {
      this.close();
      return;
    }

    this.container.innerHTML = results.map(r => `
      <div class="autocomplete-suggestion" data-address='${JSON.stringify(r.data)}'>
        ${r.label}
      </div>
    `).join('');

    // Setup click listeners for each suggestion
    this.container.querySelectorAll('.autocomplete-suggestion').forEach(el => {
      el.addEventListener('click', () => {
        const addr = JSON.parse(el.dataset.address);
        this.applyAddress(addr);
        this.close();
      });
    });

    // Show using Top Layer (Popover API)
    if (!this.container.matches(':popover-open')) {
        this.container.showPopover();
    }
  }

  /**
   * [PLATINUM-GEO] Verifies a provided address for high confidence (Geoapify only).
   */
  async verifyAddress(street, postcode, city) {
    const provider = this.sm.state.config.addressProvider || 'geoapify';
    const apiKey = this.sm.state.config.addressApiKey || '';
    
    if (provider !== 'geoapify' || !apiKey) {
        return { ok: true, street, postcode, city };
    }

    const params = new URLSearchParams({
        street: street,
        postcode: postcode,
        city: city,
        filter: 'countrycode:de',
        bias: `proximity:${this.bias.lon},${this.bias.lat}`,
        limit: '1',
        lang: 'de',
        apiKey: apiKey
    });

    const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;

    try {
      const response = await this._safeFetch(url);
      if (!response) return; 
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          const rank = props.rank || {};
          const ACCEPT_LEVEL = 0.95;
          const confidence = rank.confidence || 0;
          
          const result = {
              ok: confidence >= ACCEPT_LEVEL,
              confidence: confidence,
              street: props.street || street,
              housenumber: props.housenumber || '',
              postcode: props.postcode || postcode,
              city: props.city || city,
              formatted: props.formatted,
              details: {
                  city_ok: (rank.confidence_city_level || 0) >= ACCEPT_LEVEL,
                  street_ok: (rank.confidence_street_level || 0) >= ACCEPT_LEVEL
              }
          };

          if (!result.ok) {
              if (!result.details.city_ok) result.error = 'Stadt oder PLZ nicht eindeutig';
              else if (!result.details.street_ok) result.error = 'Straße nicht eindeutig verifiziert';
              else result.error = 'Adresse konnte nicht exakt bestätigt werden';
          }

          return result;
      }
      return { ok: false, error: 'Keine Ergebnisse in Deutschland gefunden' };
    } catch (e) {
      console.error('[AddressService] Verification failed:', e);
      return { ok: false, error: 'Netzwerkfehler' };
    }
  }

  /**
   * [Sovereign-Sync] Applies selected address to the document.
   */
  applyAddress(addr) {
    const streetLine = addr.housenumber ? `${addr.street} ${addr.housenumber}` : addr.street;
    const cityLine = `${addr.postcode} ${addr.city}`;
    const full = `Herr/Frau\nName\n${streetLine}\n${cityLine}`;
    
    this.ui._updateDOMSafe(this.targetEl, full);
    this.sm.update('content.recipient', full, 'autocomplete');
    this.ui._toast('Adresse übernommen', 'success');
  }

  /**
   * [PLATINUM-UI] Hides the suggestion overlay.
   */
  close() {
    if (this.container && this.container.matches(':popover-open')) {
        this.container.hidePopover();
    }
  }
}

```

---

### [[ui/devmode.js]]

| Feld | Wert |
|------|------|
| Pfad | `ui\devmode.js` |
| Typ | `.js` |
| Größe | 4.78 KB |
| Zeilen | 127 |
| Zeichen | 4371 |
| Keywords | `const` `document` `popover` `function` `json` `true` `readdomasjson` `changelog` `getelementbyid` `rendertaginspector` `registry` `inspector` `return` `padend` `mode` |

```javascript
/**
 * js/ui/devmode.js — Easter Egg, Developer Mode & Live Tag-Inspector
 * DIN-BriefNEO · Platinum V14 | SPEC-049 | CAA-008 | PLAN-010
 * ─────────────────────────────────────────────────────────────────
 * Registry 2.0: Live-Inspector zeigt <din-*> Tag ↔ JSON-Key Abgleich.
 * MutationObserver scannt querySelectorAll('[din-*]') — kein ID-Lookup.
 *
 * ACTIVATION: 5x Klick auf #app-version (2s Reset-Window)
 * STORAGE:    localStorage 'neo_dev_mode' = 'true'
 */

import { buildInterviewPrompt, buildOptimizationPrompt, readDOMasJSON }
  from '../logic/logic.js';
import { Registry } from '../core/constants.js';
import { nowTimeISO } from '../core/temporal-utils.js';

const DEV_KEY      = 'neo_dev_mode';
const CLICK_TARGET = 5;

export function checkDevMode() {
  if (localStorage.getItem(DEV_KEY) === 'true') {
    document.body.dataset.devmode = 'true';
    document.body.classList.add('dev-mode');
  }
}

const changeLog = [];

export function initDevMode(sm) {
  sm.subscribe((path, val, scope) => {
    const cleanVal = typeof val === 'string' ? val.replace(/\s+/g, ' ').substring(0, 20) : val;
    changeLog.unshift({ path, val: cleanVal, scope, time: nowTimeISO() });
    if (changeLog.length > 8) changeLog.pop();
    
    const popover = document.getElementById('dev-popover');
    if (popover?.matches(':popover-open')) {
      _renderTagInspector(readDOMasJSON());
    }
  });

  _initPopoverInspector(sm);
  _bindAkinatorTerminal(sm);
}

/* ── Popover Inspector ─────────────────────────────────────── */
function _initPopoverInspector(sm) {
  const popover = document.getElementById('dev-popover');
  if (!popover) return;

  // Update inspector when popover opens
  popover.addEventListener('toggle', (e) => {
    if (e.newState === 'open') {
      _renderTagInspector(readDOMasJSON());
      document.body.classList.add('dev-mode');
    }
  });
}

/* ── Akinator Terminal ───────────────────────────────────────── */
function _bindAkinatorTerminal(sm) {
  const btn = document.getElementById('btn-akinator-export');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const json       = readDOMasJSON();
    const hasContent = Object.values(json).some(v => v !== null && String(v).trim().length > 0);
    const prompt     = hasContent ? buildOptimizationPrompt() : buildInterviewPrompt();

    const ta = document.getElementById('akinator-output');
    if (ta) ta.value = prompt;
    navigator.clipboard?.writeText(prompt).catch(() => {});

    btn.dataset.copied = 'true'; // CSS regelt den Reset der Anzeige via Animation
    _renderTagInspector(json);
  });
}

/* ── Live Tag↔JSON Inspector ─────────────────────────────────── */
export function refreshInspector() {
  if (localStorage.getItem(DEV_KEY) === 'true') {
    _renderTagInspector(readDOMasJSON());
  }
}

/**
 * Rendert den <din-tag> ↔ JSON-Key Abgleich im #decoder-output Panel.
 * Format: STATUS  TAG           KEY           WERT (40 Zeichen)
 * Injection-Proof: textContent, kein innerHTML [MANDATE-INJ]
 */
function _renderTagInspector(json) {
  const el = document.getElementById('decoder-output');
  if (!el) return;

  const header = `Registry 3.1 — Platinum Inspector (V18)  ${nowTimeISO()}\n`
               + `${'─'.repeat(52)}\n`
               + `  TAG               KEY              WERT\n`
               + `${'─'.repeat(52)}\n`;

  const cmaTop = getComputedStyle(document.documentElement).getPropertyValue('--addr-top').trim();
  const cmaStatus = `CMA: ${cmaTop} | Viewport: ${window.innerHeight}px\n`;

  const rows = Registry.map(({ tag, key }) => {
    const val     = json[key];
    const status  = val !== null ? '✓' : '○';
    
    // Check for EditContext
    const targetEl = document.querySelector(tag);
    const hasEC = targetEl?.editContext ? ' [EC]' : '';

    const preview = val
      ? String(val).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').substring(0, 24)
      : '—';
    const tagShort = `<${tag}>`.padEnd(20);
    const keyPad   = key.padEnd(16);
    return `${status}${hasEC} ${tagShort} ${keyPad} ${preview}`;
  }).join('\n');

  const logHeader = `\n\nTELEMETRIE (Letzte Änderungen)\n`
                  + `${'─'.repeat(52)}\n`;
  const logRows = changeLog.map(e => 
    `[${e.time}] ${e.scope.padEnd(8)} | ${e.path.padEnd(15)} | ${e.val}`
  ).join('\n');

  el.textContent = header + cmaStatus + rows + logHeader + logRows;
}

```

---

### [[ui/ghost-mirror.js]]

| Feld | Wert |
|------|------|
| Pfad | `ui\ghost-mirror.js` |
| Typ | `.js` |
| Größe | 4.20 KB |
| Zeilen | 114 |
| Zeichen | 4068 |
| Keywords | `mirror` `text` `span` `currentoffset` `cmd-` `sanitizer` `startnode` `endnode` `class` `ghost` `replace` `match` `node` `syntax` `markerranges` |

```javascript
/**
 * js/ui/ghost-mirror.js — Ghost-Mirror Implementation (SPEC-066)
 * [CMD-1] Structural Markdown via Sanitizer API & Mirror-Layer
 * [CMD-1] Syntax Coloring via CSS Custom Highlight API
 * ─────────────────────────────────────────────────────────
 */

import { PLATINUM_SANITIZER } from '../core/constants.js';

export class GhostMirror {
    constructor(elementId, mirrorId) {
        this.element = document.getElementById(elementId);
        this.mirror  = document.getElementById(mirrorId);
        if (!this.element || !this.mirror) return;

        // Highlights Registry (Syntax Coloring ONLY)
        this.markerRanges = [];
    }

    /**
     * Updates both the structural mirror and the syntax highlights.
     * [CMD-1] Weights (bold/italic) are rendered in the mirror.
     * [CMD-1] Markers (** / *) are highlighted in the input.
     */
    update(text) {
        this.updateMirror(text);
        this.updateSyntaxHighlights(text);
    }

    /**
     * [CMD-1] Structural Markdown (bold/italic) via Native Sanitizer
     * This layer provides the physical weight needed for LayoutNG calculations.
     * [SPEC-066] Zero-Width-Ghosting ensures the mirror has the same character count/width.
     */
    updateMirror(text) {
        if (!this.mirror) return;

        // [SPEC-066] Zero-Width-Ghosting: Markers are kept but hidden
        // This ensures the ghost mirror and real input have identical metrics.
        let html = (text || "")
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<span class="ghost">**</span><strong>$1</strong><span class="ghost">**</span>')
            .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<span class="ghost">*</span><em>$1</em><span class="ghost">*</span>');

        // [CMD-1] Secure Rehydration via Blink Native Sanitizer
        if (this.mirror.setHTML && PLATINUM_SANITIZER) {
            this.mirror.setHTML(html, { sanitizer: PLATINUM_SANITIZER });
        } else {
            this.mirror.setHTML(html); // Fallback
        }
    }

    /**
     * [CMD-1] Syntax Coloring (Markers only)
     * We only highlight the ** and * markers. Weights are handled by the mirror.
     */
    updateSyntaxHighlights(text) {
        this.markerRanges = [];
        if (!text) {
            this.applyHighlights();
            return;
        }

        const markerRegex = /(\*\*|\*)/g;
        let match;
        while ((match = markerRegex.exec(text)) !== null) {
            this.addHighlightRange(match.index, match.index + match[0].length, 'marker');
        }

        this.applyHighlights();
    }

    addHighlightRange(start, end, type) {
        let currentOffset = 0;
        const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let startNode = null, startNodeOffset = 0;
        let endNode = null, endNodeOffset = 0;

        while (node = walker.nextNode()) {
            const nodeLength = node.textContent.length;
            if (!startNode && start >= currentOffset && start <= currentOffset + nodeLength) {
                startNode = node;
                startNodeOffset = start - currentOffset;
            }
            if (!endNode && end >= currentOffset && end <= currentOffset + nodeLength) {
                endNode = node;
                endNodeOffset = end - currentOffset;
            }
            currentOffset += nodeLength;
            if (startNode && endNode) break;
        }

        if (startNode && endNode) {
            try {
                const range = new StaticRange({
                    startContainer: startNode,
                    startOffset: startNodeOffset,
                    endContainer: endNode,
                    endOffset: endNodeOffset
                });
                if (type === 'marker') this.markerRanges.push(range);
            } catch (e) {}
        }
    }

    applyHighlights() {
        CSS.highlights.set('din-marker', new Highlight(...this.markerRanges));
    }
}

```

---

### [[ui/model-blacklist.js]]

| Feld | Wert |
|------|------|
| Pfad | `ui\model-blacklist.js` |
| Typ | `.js` |
| Größe | 4.11 KB |
| Zeilen | 103 |
| Zeichen | 3950 |
| Keywords | `reason` `pattern` `since` `const` `blocked` `blacklist` `modelle` `string` `models` `grouped` `model` `deprecated` `return` `document` `statt` |

```javascript
/**
 * js/ui/model-blacklist.js — KI-Modell Blacklist Strategy
 * DIN-BriefNEO · Platinum V13 | SPEC-038
 * ─────────────────────────────────────────────────────────
 * PRINZIP: Blacklist statt Whitelist.
 *   Statt eine starre Liste erlaubter Modelle zu pflegen,
 *   werden VERALTETE Modelle gefiltert. Neue Modelle sind
 *   automatisch erlaubt — keine manuelle Freischaltung nötig.
 *
 * PATTERN:
 *   const models = await fetchAvailableModels(apiKey);
 *   const usable = filterModels(models);
 *   → renderModelSelect(usable);
 */

/**
 * Blacklist-Einträge: Muster für veraltete/ungeeignete Modelle.
 * Regex-basiert → "enthält X" statt "ist exakt Y".
 *
 * BLACKLIST PFLEGE-REGEL:
 *   Einträge werden NUR hinzugefügt (nie entfernt ohne Migration-Notiz).
 *   Format: { pattern: /regex/, reason: 'Warum gesperrt', since: 'YYYY-MM' }
 */
const MODEL_BLACKLIST = Object.freeze([
  { pattern: /gpt-3\.5/i,         reason: 'Zu alt für DIN-Präzision',     since: '2024-01' },
  { pattern: /gpt-4-0314/i,       reason: 'Deprecated (OpenAI)',           since: '2024-06' },
  { pattern: /gpt-4-0613/i,       reason: 'Deprecated (OpenAI)',           since: '2024-06' },
  { pattern: /text-davinci/i,     reason: 'Legacy completions API',        since: '2023-01' },
  { pattern: /claude-1/i,         reason: 'Claude 1.x deprecated',         since: '2024-01' },
  { pattern: /claude-2\.0$/i,     reason: 'Claude 2.0 deprecated',         since: '2024-03' },
  { pattern: /-preview$/i,        reason: 'Preview-Modelle instabil',      since: '2024-01' },
  { pattern: /instruct$/i,        reason: 'Instruct-only, kein Chat',      since: '2024-01' },
  { pattern: /vision-preview/i,   reason: 'Deprecated Vision-Preview',     since: '2024-09' },
]);

/**
 * Filtert eine Modellliste gegen die Blacklist.
 * @param {string[]} models — Liste der Modell-IDs vom Provider
 * @returns {string[]} — bereinigte Liste (Blacklist-Treffer entfernt)
 */
export function filterModels(models) {
  if (!Array.isArray(models)) return [];
  return models.filter(model =>
    !MODEL_BLACKLIST.some(entry => entry.pattern.test(model))
  );
}

/**
 * Erklärt warum ein Modell gesperrt ist (für Debug-Anzeige).
 * @param {string} modelId
 * @returns {{ blocked: boolean, reason?: string, since?: string }}
 */
export function explainBlock(modelId) {
  const hit = MODEL_BLACKLIST.find(e => e.pattern.test(modelId));
  if (!hit) return { blocked: false };
  return { blocked: true, reason: hit.reason, since: hit.since };
}

/**
 * Rendert ein <select>-Element mit den verfügbaren Modellen.
 * Gesperrte Modelle werden als disabled-Option mit Erklärung angezeigt.
 * @param {string} selectId — ID des <select>-Elements
 * @param {string[]} allModels — alle verfügbaren Modell-IDs
 */
export function renderModelSelect(selectId, allModels) {
  const el = document.getElementById(selectId);
  if (!el) return;

  el.textContent = '';   // MANDATE-INJ: textContent statt innerHTML

  const grouped = { available: [], blocked: [] };
  for (const m of allModels) {
    const info = explainBlock(m);
    info.blocked ? grouped.blocked.push({ id: m, ...info }) : grouped.available.push(m);
  }

  // Verfügbare Modelle
  const grpOk = document.createElement('optgroup');
  grpOk.label = '✓ Verfügbar';
  grouped.available.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    grpOk.appendChild(opt);
  });
  el.appendChild(grpOk);

  // Gesperrte Modelle (sichtbar aber disabled — Transparenz für Nutzer)
  if (grouped.blocked.length > 0) {
    const grpBlocked = document.createElement('optgroup');
    grpBlocked.label = '✗ Gesperrt (veraltet)';
    grouped.blocked.forEach(({ id, reason }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${id} — ${reason}`;
      opt.disabled = true;
      grpBlocked.appendChild(opt);
    });
    el.appendChild(grpBlocked);
  }
}

```

---

### [[logic/greetings.js]]

| Feld | Wert |
|------|------|
| Pfad | `logic\greetings.js` |
| Typ | `.js` |
| Größe | 4.82 KB |
| Zeilen | 130 |
| Zeichen | 4687 |
| Keywords | `const` `return` `formality` `gender` `tokens` `lastname` `greetingsmatrix` `includes` `export` `fallback` `lines` `currenttokens` `lowertokens` `settings` `formal` |

```javascript
/**
 * js/logic/greetings.js — Platinum Salutation Engine (Refined)
 * Production Ready Platinum | Chrome 147 Baseline
 * ─────────────────────────────────────────────────────────
 */

export const GreetingsMatrix = {
    settings: {
        fallback: "Sehr geehrte Damen und Herren,"
    },
    /**
     * [MANDATE-GREETING] Radikal flache Logik: M/F/U Erkennung.
     * KEINE akademischen Titel (Dr./Prof.).
     * Erkennt Adelstitel und Formality.
     */
    process: (text, formality = 'formal') => {
        if (!text) return GreetingsMatrix.settings.fallback;
        
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return GreetingsMatrix.settings.fallback;

        // Titel-Filter (Production Ready Purge)
        const TITLES = ['dr.', 'dr', 'prof.', 'prof', 'dipl.', 'dipl', 'ing.', 'ing', 'habil', 'habil.'];
        
        let gender = 'u'; // unknown
        let tokens = [];
        let foundLineIndex = -1;

        // Suche in allen Zeilen nach einer Anrede
        for (let i = 0; i < lines.length; i++) {
            const currentTokens = lines[i].split(/\s+/);
            const lowerTokens = currentTokens.map(t => t.toLowerCase().replace(/\.$/, ''));
            
            if (lowerTokens.includes('herr')) {
                gender = 'm';
                tokens = currentTokens;
                foundLineIndex = i;
                break;
            } else if (lowerTokens.includes('frau')) {
                gender = 'f';
                tokens = currentTokens;
                foundLineIndex = i;
                break;
            } else if (lowerTokens.includes('familie') || lowerTokens.includes('eheleute')) {
                gender = 'g';
                tokens = currentTokens;
                foundLineIndex = i;
                break;
            }
        }

        // Falls keine Anrede gefunden wurde, nimm die erste Zeile (Legacy-Verhalten)
        if (gender === 'u') {
            tokens = lines[0].split(/\s+/);
        }
        
        // 1. Titel entfernen
        tokens = tokens.filter(t => !TITLES.includes(t.toLowerCase().replace(/\.$/, '')));

        // 2. Nachnamen-Extraktion (Alles nach der Anrede in der gefundenen Zeile)
        let nameParts = [];
        let startCollecting = false;
        
        const triggerWords = ['herr', 'frau', 'familie', 'eheleute'];
        for (const token of tokens) {
            const lowToken = token.toLowerCase().replace(/\.$/, '');
            if (triggerWords.includes(lowToken)) {
                startCollecting = true;
                continue;
            }
            if (startCollecting) {
                nameParts.push(token);
            }
        }

        // Falls wir in einer Zeile gesammelt haben aber nichts nach der Anrede kam, 
        // nehmen wir das erste Wort der Zeile (Fallback)
        const lastName = nameParts.length > 0 ? nameParts.join(' ') : (gender === 'u' ? tokens[0] : "");

        // 4. Matrix-Dispatch
        if (gender === 'm') {
            if (formality === 'casual') return `Hallo ${lastName || 'unbekannt'},`;
            if (formality === 'polite') return `Guten Tag Herr ${lastName},`;
            return `Sehr geehrter Herr ${lastName},`;
        }
        if (gender === 'f') {
            if (formality === 'casual') return `Hallo ${lastName || 'unbekannt'},`;
            if (formality === 'polite') return `Guten Tag Frau ${lastName},`;
            return `Sehr geehrte Frau ${lastName},`;
        }
        if (gender === 'g') {
            return `Sehr geehrte Familie ${lastName},`;
        }

        return GreetingsMatrix.settings.fallback;
    }
};

/**
 * [SPEC-002] Hybrid-Adapter: Aktualisiert Placeholder/Content.
 */
export function updateSalutationHint(el, analysis, formality, recipientType, currentText = null) {
    if (!el || el.dataset.auto === 'false') return;
    
    const textToProcess = currentText !== null ? currentText : (document.querySelector('din-recipient')?.textContent || "");
    const sal = GreetingsMatrix.process(textToProcess, formality);
    
    el.dataset.placeholder = sal;
    
    if (!el.textContent.trim()) {
        el.textContent = sal;
    }
}

export const GREETING_MAP = {
    formal: 'Mit freundlichen Grüßen',
    polite: 'Freundliche Grüße',
    casual: 'Viele Grüße',
};

export function deriveSalutation(analysis, formality, recipientType) {
    const recipientEl = document.querySelector('din-recipient');
    return GreetingsMatrix.process(recipientEl ? recipientEl.textContent : "", formality);
}

export function deriveGreeting(formality = 'formal') {
    return GREETING_MAP[formality] || GREETING_MAP.formal;
}

```

---

### [[logic/layer]]

| Feld | Wert |
|------|------|
| Pfad | `logic\layer` |
| Typ | `` |
| Größe | 6 B |
| Zeilen | 3 |
| Zeichen | 6 |

```
# --- AUTO-INJECTED METADATA ---
# Path: logic\layer
# Role: Code source file
# Injected by: Antigravity Context Bundler v4.1
# Original created: 2026-03-22 17:47:12
# ====================================================

��
 
 
```

---

### [[core/app.js]]

| Feld | Wert |
|------|------|
| Pfad | `core\app.js` |
| Typ | `.js` |
| Größe | 1.59 KB |
| Zeilen | 59 |
| Zeichen | 1572 |
| Keywords | `export` `state` `pdfcoordinator` `document` `global` `const` `console` `info` `print` `initapp` `din-briefneo` `shell` `registry` `prepare` `high-precision` |

```javascript
# --- AUTO-INJECTED METADATA ---
# Path: core\app.js
# Role: Javascript source file
# Injected by: Antigravity Context Bundler v4.1
# Original created: 2026-03-19 22:44:02
# ====================================================

import { App } from './state.js';

/**
 * DIN-BriefNEO | Core App Shell
 * Handles Global UI Events and Registry (State Registry)
 */

/**
 * PDFCOORDINATOR (Vector-Based Export)
 */
const PDFCoordinator = {
    prepare: () => {
        console.info('[PDF] Locking state for high-precision export...');
        document.body.classList.add('js-printing');
        // Trigger any necessary state-sync before printing
        if (typeof App.saveSnapshot === 'function') App.saveSnapshot(true);
    },
    
    cleanup: () => {
        console.info('[PDF] Export finished. Unlocking state.');
        document.body.classList.remove('js-printing');
    },
    
    export: () => {
        PDFCoordinator.prepare();
        setTimeout(() => {
            window.print();
            PDFCoordinator.cleanup();
        }, 100);
    }
};

export const initApp = () => {
    console.info('[App] Initializing DIN-BriefNEO v1.0 Shell...');
    
    // Initialize state
    App.init();

    // 1. HIGH-PRECISION PRINT HANDLER
    const allPrintBtns = document.querySelectorAll('#print-trigger, [data-action="print"]');
    allPrintBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            PDFCoordinator.export();
        });
    });

    // 2. SETTINGS MODAL (Global Trigger for components)
    window.App = App; // Expose to global for inline onclick handlers in index.html
};

// Single Entry Point
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

```

---

### [[core/constants.js]]

| Feld | Wert |
|------|------|
| Pfad | `core\constants.js` |
| Typ | `.js` |
| Größe | 3.03 KB |
| Zeilen | 83 |
| Zeichen | 2903 |
| Keywords | `sanitizer` `object` `freeze` `registry` `export` `const` `platinum` `address` `action` `config` `elements` `sanitizerinstance` `constants` `page` `width` |

```javascript
/**
 * js/core/constants.js — Platinum Audit V4.1.0 (Registry 3.1)
 * Central Measurement Authority (CMA) — Layer 1: JS Constants
 * ─────────────────────────────────────────────────────────
 */

export const CMA = Object.freeze({
  PAGE_WIDTH:          210.000, PAGE_HEIGHT:        297.000,
  MARGIN_LEFT:          25.000, MARGIN_RIGHT:        20.000,
  ADDRESS_WIDTH:        85.000, ADDRESS_HEIGHT:      45.000,
  FORM: Object.freeze({
    A: Object.freeze({ ADDRESS_TOP: 32.000 }),
    B: Object.freeze({ ADDRESS_TOP: 45.000 }),
  }),
});

/**
 * Registry 3.1 Matrix (State Registry)
 * Strenge Kopplung zwischen physischem HTML-Tag und JSON-Key.
 */
export const Registry = Object.freeze([
  // 1. Identität & Branding
  { tag: "din-sender-details",  key: "sender_details" },

  // 2. Anschriftzone (Platinum V4)
  { tag: "din-ruecksendeangabe",     key: "return_line"  },
  { tag: "din-zusatz-vermerkzone",      key: "supplement"   },
  { tag: "din-recipient",       key: "recipient",   editContext: true },

  // 3. Metadaten & Leitwörter
  { tag: "din-ref-line",        key: "ref_line"  },
  { tag: "din-date",            key: "date"      },

  // 4. Brief-Kern (Blink-Direct)
  { tag: "din-subject",         key: "subject"    },
  { tag: "din-salutation",      key: "salutation" },
  { tag: "din-body",            key: "body",        editContext: true },
  { tag: "din-closing",         key: "closing"    },
  { tag: "din-signature",       key: "signature"  },
  { tag: "din-attachments",     key: "attachments"},

  // 5. Compliance & Sicherheit
  { tag: "din-ext-bankverbindung",       key: "bank_data" },
  { tag: "din-ext-steuerdaten",     key: "fiscal_data" },
]);

export const AI_INTENTS = Object.freeze({
  PRINT: "action:print",
  SAVE:  "action:save_local",
  GHOST: "action:toggle_guides"
});

/**
 * [ADR-014] Native Sanitizer (Production Ready Platinum)
 * [CMD-3] Whitelist Registry 3.1 Custom Tags based on SSoT.
 */
export const SANITIZER_CONFIG = {
  elements: [
    "din-5008", "din-page", "din-cma-sensor",
    "din-briefkopf", "din-logo", "din-sender-details", "din-ext-vcard",
    "din-anschriftfeld", "din-ruecksendeangabe", "din-zusatz-vermerkzone", "din-recipient",
    "din-informationsblock", "din-ref-line", "din-date",
    "din-subject", "din-salutation", "din-body", "din-closing", "din-signature", "din-attachments",
    "din-amount", "din-ext-bankverbindung", "din-ext-steuerdaten", "din-brieffuss",
    "br", "div", "span", "b", "i", "strong", "em"
  ],
  attributes: [
    { name: "data-placeholder", elements: ["*"] },
    { name: "data-form", elements: ["*"] }
  ]
};

let sanitizerInstance = null;
if (globalThis.Sanitizer) {
  try {
    sanitizerInstance = new Sanitizer(SANITIZER_CONFIG);
  } catch (e) {
    console.warn('[Sanitizer] Failed to initialize with config, falling back to null.', e);
  }
}
export const PLATINUM_SANITIZER = sanitizerInstance;

```

---

### [[core/opfs-worker.js]]

| Feld | Wert |
|------|------|
| Pfad | `core\opfs-worker.js` |
| Typ | `.js` |
| Größe | 6.01 KB |
| Zeilen | 174 |
| Zeichen | 5870 |
| Keywords | `const` `await` `data` `name` `root` `type` `json` `access` `self` `async` `getfilehandle` `true` `catch` `postmessage` `file` |

```javascript
/**
 * js/core/opfs-worker.js — Aviation-Grade Journaling Persistence
 * [SPEC-068] Shadow Paging & Journaling Protocol
 * ─────────────────────────────────────────────────────────
 */

const FILE_NAME = 'din-brief-neo.draft';
const JOURNAL_NAME = 'din-brief-neo.journal';
const LOG_NAME = 'blackbox.log';
const TMP_NAME  = 'din-brief-neo.draft.tmp';
const SNAPSHOTS_DIR = 'snapshots';

let saveCounter = 0;

self.onmessage = async (e) => {
  const { type, data, timestamp } = e.data;

  if (type === 'SAVE_DATA') {
    await saveWithJournaling(data);
  } else if (type === 'SAVE_LOG') {
    await appendToLog(data);
  } else if (type === 'LOAD_DATA') {
    await loadWithRecovery();
  } else if (type === 'LIST_SNAPSHOTS') {
    await listSnapshots();
  } else if (type === 'GET_SNAPSHOT') {
    await getSnapshot(timestamp);
  }
};

async function appendToLog(logData) {
    try {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle(LOG_NAME, { create: true });
        const access = await handle.createSyncAccessHandle();
        const size = access.getSize();
        const buffer = new TextEncoder().encode(JSON.stringify(logData) + '\n');
        access.write(buffer, { at: size });
        access.flush();
        access.close();
    } catch (e) {
        console.error('[OPFS] Log Appending failed:', e);
    }
}

async function listSnapshots() {
    try {
        const root = await navigator.storage.getDirectory();
        const snapshotsDir = await root.getDirectoryHandle(SNAPSHOTS_DIR, { create: true });
        const history = [];
        
        for await (const [name, handle] of snapshotsDir.entries()) {
            if (name.endsWith('.json')) {
                history.push({
                    timestamp: name.replace('.json', ''),
                    label: new Date(parseInt(name.replace('.json', ''))).toLocaleString('de-DE')
                });
            }
        }
        
        // Sort by newest first
        history.sort((a, b) => b.timestamp - a.timestamp);
        self.postMessage({ type: 'SNAPSHOT_LIST', history: history.slice(0, 10) });
    } catch (e) {
        console.error('[OPFS] List Snapshots failed:', e);
    }
}

async function getSnapshot(ts) {
    try {
        const root = await navigator.storage.getDirectory();
        const snapshotsDir = await root.getDirectoryHandle(SNAPSHOTS_DIR);
        const handle = await snapshotsDir.getFileHandle(`${ts}.json`);
        const file = await handle.getFile();
        const data = JSON.parse(await file.text());
        self.postMessage({ type: 'SNAPSHOT_DATA', data });
    } catch (e) {
        console.error('[OPFS] Get Snapshot failed:', e);
    }
}

async function createSnapshot(data) {
    try {
        const root = await navigator.storage.getDirectory();
        const snapshotsDir = await root.getDirectoryHandle(SNAPSHOTS_DIR, { create: true });
        const ts = Date.now();
        const handle = await snapshotsDir.getFileHandle(`${ts}.json`, { create: true });
        const access = await handle.createSyncAccessHandle();
        const buffer = new TextEncoder().encode(JSON.stringify(data));
        access.truncate(0);
        access.write(buffer, { at: 0 });
        access.flush();
        access.close();
        console.info('[OPFS] Snapshot created:', ts);
    } catch (e) {
        console.warn('[OPFS] Snapshot creation failed:', e);
    }
}

async function loadWithRecovery() {
  try {
    const root = await navigator.storage.getDirectory();
    let data = null;
    try {
      const fileHandle = await root.getFileHandle(FILE_NAME);
      const file = await fileHandle.getFile();
      data = JSON.parse(await file.text());
    } catch (e) {}

    try {
      const journalHandle = await root.getFileHandle(JOURNAL_NAME);
      const journalFile = await journalHandle.getFile();
      const journalText = await journalFile.text();
      if (journalText) {
          const journalData = JSON.parse(journalText);
          data = { ...data, ...journalData, _recovered: true };
      }
    } catch (e) {}
    
    self.postMessage({ type: 'LOAD_CONFIRMED', data });
  } catch (err) {
    self.postMessage({ type: 'LOAD_ERROR', error: err.message });
  }
}

async function saveWithJournaling(data) {
  try {
    self.postMessage({ type: 'SAVE_START' });
    
    await navigator.locks.request('opfs-io-lock', { ifAvailable: true }, async (lock) => {
      if (!lock) {
          self.postMessage({ type: 'CONCURRENCY_CONFLICT', message: 'TAB-KONFLIKT: READ-ONLY' });
          return;
      }

      const root = await navigator.storage.getDirectory();
      const journalHandle = await root.getFileHandle(JOURNAL_NAME, { create: true });
      const jAccess = await journalHandle.createSyncAccessHandle();
      const buffer = new TextEncoder().encode(JSON.stringify(data));
      jAccess.truncate(0); 
      jAccess.write(buffer, { at: 0 });
      jAccess.flush();
      jAccess.close();

      saveCounter++;

      if (saveCounter >= 5) {
        const tmpHandle = await root.getFileHandle(TMP_NAME, { create: true });
        const accessHandle = await tmpHandle.createSyncAccessHandle();
        accessHandle.truncate(0);
        accessHandle.write(buffer, { at: 0 });
        accessHandle.flush();
        accessHandle.close();
        await tmpHandle.move(FILE_NAME);
        
        // Journal leeren
        const jFinal = await (await root.getFileHandle(JOURNAL_NAME)).createSyncAccessHandle();
        jFinal.truncate(0);
        jFinal.close();
        
        saveCounter = 0;
        
        // Permanenten Snapshot erstellen bei Compaction
        await createSnapshot(data);
      }
      
      self.postMessage({ type: 'SAVE_CONFIRMED', timestamp: Date.now() });
    });
  } catch (err) {
    self.postMessage({ type: 'SAVE_ERROR', error: err.message });
  }
}

```

---

### [[core/io-coordinator.js]]

| Feld | Wert |
|------|------|
| Pfad | `core\io-coordinator.js` |
| Typ | `.js` |
| Größe | 8.20 KB |
| Zeilen | 222 |
| Zeichen | 8057 |
| Keywords | `data` `worker` `state` `type` `save` `leader` `idledetector` `statusel` `phoenix` `opfs` `console` `return` `postmessage` `idle` `isleader` |

```javascript
/**
 * js/core/io-coordinator.js — Phoenix Protocol Coordinator
 * [MANDATE-PLATINUM] Zero-Loss Persistence & Leader Election
 * ─────────────────────────────────────────────────────────
 * Architecture:
 *   1. Leader Election (Web Locks API)
 *   2. Broadcast Sync (BroadcastChannel API)
 *   3. Background Saving (IdleDetector API)
 *   4. Dedicated Storage Worker (OPFS)
 */

export class IOCoordinator {
    constructor(stateManager) {
        this.sm = stateManager;
        this.channel = new BroadcastChannel('din_neo_sync');
        this.isLeader = false;
        this.worker = null;
        this.idleDetector = null;
    }

    async init() {
        // Phase 1: Web Locks API (Leader Election)
        // Using ifAvailable: true to immediately know if we are the Leader or Follower
        return navigator.locks.request('din_neo_opfs_leader', { ifAvailable: true }, async (lock) => {
            if (!lock) {
                this.initFollower();
                // In Follower mode, we don't return a "forever" promise here, 
                // because we want to retry occasionally if the leader tab closes.
                this.setupLockRetry(); 
                return;
            }

            // We are the LEADER
            await this.initLeader();
            
            // Return a promise that never resolves to keep the lock for the life of the tab
            return new Promise(() => {}); 
        });
    }

    /**
     * Periodically check if the leader has vacated the lock
     */
    setupLockRetry() {
        const retry = () => {
            if (document.visibilityState === 'visible' && !this.isLeader) {
                this.init(); // Retry elevation to leader
            }
        };

        window.addEventListener('visibilitychange', () => {
            if ('scheduler' in window) {
                // @ts-ignore
                scheduler.postTask(retry, { priority: 'background' });
            } else {
                setTimeout(retry, 0);
            }
        });
    }

    async initLeader() {
        this.isLeader = true;
        document.body.classList.remove('is-follower');
        console.info('[Phoenix] Primary Tab: Elected as Leader.');
        
        // Phase 2: Boot OPFS Worker
        this.worker = new Worker('js/core/opfs-worker.js');
        this.worker.onmessage = (e) => {
            const statusEl = document.querySelector('#storage-status span');
            
            if (e.data.type === 'SAVE_START') {
                if (statusEl) {
                    statusEl.className = 'status-warn blink';
                    statusEl.textContent = '[SYNCING...]';
                }
            }
            if (e.data.type === 'SAVE_CONFIRMED') {
                if (statusEl) {
                    statusEl.className = 'status-ok';
                    statusEl.textContent = '[IDLE]';
                }
                console.debug('[Phoenix] Save Confirmed:', e.data.timestamp);
            }
            if (e.data.type === 'SAVE_ERROR' || e.data.type === 'CONCURRENCY_CONFLICT') {
                if (statusEl) {
                    statusEl.className = 'status-err';
                    statusEl.textContent = '[ERROR]';
                }
            }
            if (e.data.type === 'LOAD_CONFIRMED') {
                console.info('[Phoenix] OPFS State Loaded.');
                this.sm.updateFromOPFS(e.data.data);
                if (statusEl) {
                    statusEl.className = 'status-ok';
                    statusEl.textContent = '[IDLE]';
                }
            }
            if (e.data.type === 'SNAPSHOT_LIST') {
                document.dispatchEvent(new CustomEvent('snapshot-list-ready', { detail: e.data.history }));
            }
            if (e.data.type === 'SNAPSHOT_DATA') {
                this.sm.load(e.data.data);
                console.info('[Phoenix] Snapshot restored.');
                location.reload(); 
            }
        };

        // Leader listens for Follower updates
        this.channel.onmessage = (msg) => {
            if (msg.data.type === 'STATE_DELTA') {
                // [CMD-R6] Schedule save as background task
                if ('scheduler' in window) {
                    // @ts-ignore
                    scheduler.postTask(() => this.save(msg.data.state), { priority: 'background' });
                } else {
                    this.save(msg.data.state);
                }
            }
        };

        // Request initial load from OPFS
        this.worker.postMessage({ type: 'LOAD_DATA' });

        // Phase 3: Idle Detector API (Native Debounce)
        await this.setupIdleDetection();
        
        // [W3C MANDATE] Hard Zero-Data-Loss Fallback on Exit
        this.setupExitGuard();
    }

    /**
     * [W3C MANDATE] visibilitychange / pagehide Guard
     * Ensures synchronous write to LocalStorage as ultimate fallback,
     * because the Worker thread might be terminated before OPFS flush completes.
     */
    setupExitGuard() {
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.info('[Phoenix] Tab hidden: Triggering emergency synchronous flush.');
                this.emergencySave();
            }
        });
        window.addEventListener('pagehide', () => {
            this.emergencySave();
        });
    }

    initFollower() {
        this.isLeader = false;
        document.body.classList.add('is-follower');
        console.info('[Phoenix] Secondary Tab: Following Leader.');
        
        // Follower sends state to Leader
        this.sm.subscribe((path, value, scope) => {
            if (scope === 'load' || scope === 'opfs') return;
            this.channel.postMessage({ type: 'STATE_DELTA', state: this.sm.state });
        });
    }

    async setupIdleDetection() {
        if (!('IdleDetector' in window)) {
            console.error('[Phoenix] IdleDetector API not supported. Falling back to explicit saves only.');
            return;
        }

        try {
            const state = await IdleDetector.requestPermission();
            if (state === 'granted') {
                this.idleDetector = new IdleDetector();
                this.idleDetector.addEventListener('change', () => {
                    // [CMD-1] Native Idle Detection for OPFS Sync
                    // Trigger OPFS background sync exclusively when user is "idle"
                    if (this.idleDetector.userState === 'idle') {
                        console.debug('[Phoenix] User Idle: Triggering OPFS Save.');
                        this.save(this.sm.state);
                    }
                });
                
                // Set threshold to 1 minute (60000ms is minimum allowed by spec)
                await this.idleDetector.start({ threshold: 60000 });
                console.info('[Phoenix] Native IdleDetector active.');
            }
        } catch (e) {
            console.warn('[Phoenix] IdleDetector failed:', e);
        }
    }

    save(state) {
        if (!this.isLeader || !this.worker) return;
        
        // [ADR-016] Direct Dispatch: No redundant requestIdleCallback.
        // The IdleDetector already ensures we save during low-activity phases.
        this.worker.postMessage({ type: 'SAVE_DATA', data: state });
    }

    saveLog(payload) {
        if (this.worker) {
            this.worker.postMessage({ type: 'SAVE_LOG', data: payload });
        }
    }

    requestHistory() {
        if (this.worker) this.worker.postMessage({ type: 'LIST_SNAPSHOTS' });
    }

    restoreSnapshot(timestamp) {
        if (this.worker) this.worker.postMessage({ type: 'GET_SNAPSHOT', timestamp });
    }

    /**
     * Emergency Save during Lifecycle Events
     */
    emergencySave() {
        if (this.isLeader && this.worker) {
            this.worker.postMessage({ type: 'SAVE_DATA', data: this.sm.state });
        } else {
            this.channel.postMessage({ type: 'STATE_DELTA', state: this.sm.state });
        }
    }
}

```

---

### [[core/temporal-utils.js]]

| Feld | Wert |
|------|------|
| Pfad | `core\temporal-utils.js` |
| Typ | `.js` |
| Größe | 2.35 KB |
| Zeilen | 77 |
| Zeichen | 2217 |
| Keywords | `isostring` `temporal` `date` `return` `format` `export` `function` `const` `tostring` `plaindate` `days` `ts-ignore` `plaindateiso` `string` `long` |

```javascript
/**
 * js/core/temporal-utils.js — Production Ready Date Handling
 * [TOMB-L001/L008] Mandatory Temporal API usage.
 * Baseline: Chrome 147+ (via Polyfill)
 * ─────────────────────────────────────────────────────────
 */

/**
 * Returns the current date in ISO format (YYYY-MM-DD)
 * Uses the system's local timezone to avoid the Midnight Bug.
 */
export function todayISO() {
    // @ts-ignore
    return Temporal.Now.plainDateISO().toString();
}

/**
 * Returns the current timestamp in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function nowISO() {
    // @ts-ignore
    return Temporal.Now.zonedDateTimeISO().toString();
}

/**
 * Formats an ISO date string to a human-readable German format.
 * @param {string} isoString - YYYY-MM-DD
 * @param {string} format - 'de', 'iso', or 'long'
 */
export function formatDateTemporal(isoString, format = 'de') {
    if (!isoString) return '';
    try {
        // @ts-ignore
        const date = Temporal.PlainDate.from(isoString);
        
        if (format === 'iso') return date.toString();
        
        const options = format === 'long' 
            ? { day: '2-digit', month: 'long', year: 'numeric' }
            : { day: '2-digit', month: '2-digit', year: 'numeric' };
            
        // Using German locale as primary target for DIN 5008
        return date.toLocaleString('de-DE', options);
    } catch (e) {
        console.warn("[Temporal] Format failed for:", isoString, e);
        return isoString;
    }
}

/**
 * Adds a specific number of days to a date.
 * Useful for "Payment due by..." or "Reply until..."
 */
export function addDaysToISO(isoString, days = 14) {
    try {
        const start = isoString ? Temporal.PlainDate.from(isoString) : Temporal.Now.plainDateISO();
        return start.add({ days }).toString();
    } catch (e) {
        console.error("[Temporal] Add days failed:", e);
        return isoString;
    }
}

/**
 * Checks if a date is in the past.
 */
export function isPast(isoString) {
    try {
        const date = Temporal.PlainDate.from(isoString);
        const today = Temporal.Now.plainDateISO();
        return Temporal.PlainDate.compare(date, today) < 0;
    } catch (e) {
        return false;
    }
}

```

---

### [[ui/ui.js]]

| Feld | Wert |
|------|------|
| Pfad | `ui\ui.js` |
| Typ | `.js` |
| Größe | 8.42 KB |
| Zeilen | 246 |
| Zeichen | 8172 |
| Keywords | `const` `document` `entry` `target` `toast` `command` `container` `textcontent` `case` `break` `createelement` `input` `import` `logic` `ghosts` |

```javascript
/**
 * js/ui/ui.js — High-Precision DOM Controller (v1.8 - FULL RESTORE)
 * [TOMB-L008] NO innerHTML. NO setHTML. Pure DOM API.
 * [INVOKER] Native HTML Invoker Commands (Chrome 147+).
 * [CMD-4] EditContext & Ghost-Mirror Integration.
 */

import * as Logic from '../logic/logic.js';
import { GhostMirror } from './ghost-mirror.js';
import { AddressService } from './address-service.js';
import { Registry } from '../core/constants.js';

export class UIController {
  constructor(sm) {
    this.sm = sm;
    this.io = null;
    this._editors = {}; 
    this._ghosts  = {}; 
    this.addressService = new AddressService(sm, this);
    this._overflowDebounce = null;
  }

  setIO(io) { this.io = io; }

  init() {
    console.info("🚀 UI Controller v1.8: Reconstructed & Aviation Ready");
    this._initEditors();
    this._bindInvokers();
    this._bindNativeEvents();
    this._bindSidebarPreferences();
    this._bindKeyboardGuards();
    this._startAutoNightSync();
    this.addressService.init();
    
    this.sm.subscribe((path, val, scope, source) => this._onStateChange(path, val, scope, source));
    this._syncAllToDOM();
  }

  /**
   * [INVOKER] Central Command Hub
   * Mandate: Zero-JS Logic for standard UI actions.
   */
  _bindInvokers() {
    document.addEventListener('command', (e) => {
      const { command, targetId } = e.detail || { command: e.command, targetId: e.target?.getAttribute('commandfor') };
      
      switch (command) {
        case '--print': window.print(); break;
        case 'show-modal': document.getElementById(targetId)?.showModal(); break;
        case 'close': (document.getElementById(targetId) || e.target.closest('dialog'))?.close(); break;
        case '--export': this._handleExport(); break;
        case '--import': this._handleImport(); break;
        case '--reset': if (confirm("Alle Daten löschen?")) { localStorage.clear(); location.reload(); } break;
        case '--history': if (this.io) this.io.requestHistory(); break;
      }
    });

    // Invoker Polyfill for button clicks
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button[commandfor], button[command]');
      if (btn) {
        const cmd = btn.getAttribute('command');
        const target = btn.getAttribute('commandfor');
        btn.dispatchEvent(new CustomEvent('command', { bubbles: true, detail: { command: cmd, targetId: target } }));
      }
    });
  }

  /* ── 📜 HISTORY SYSTEM ───────────────────────────────────────── */
  _renderHistory(history) {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.textContent = ''; // [TOMB-L008] No innerHTML

    if (!history || history.length === 0) {
      const p = document.createElement('p');
      p.className = 'history-empty';
      p.textContent = 'Keine Snapshots gefunden.';
      container.appendChild(p);
      return;
    }

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = 'Entwurf';
      
      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = item.label;

      div.appendChild(label);
      div.appendChild(time);
      div.onclick = () => {
        if (confirm(`Wiederherstellen?`)) { if (this.io) this.io.restoreSnapshot(item.timestamp); }
      };
      container.appendChild(div);
    });
  }

  /* ── 🌙 AUTO NIGHT SYNC (Scheduler API) ─────────────────────── */
  _startAutoNightSync() {
    const checkPhase = () => {
      // @ts-ignore - Temporal API
      const hour = Temporal.Now.plainTimeISO().hour;
      const targetPhase = (hour >= 21 || hour < 6) ? 'night' : 'day';
      if (document.documentElement.dataset.theme !== targetPhase) {
        document.documentElement.dataset.theme = targetPhase;
        this.sm.update('config.theme', targetPhase);
      }
      if ('scheduler' in window) scheduler.postTask(checkPhase, { delay: 60000, priority: 'background' });
      else setTimeout(checkPhase, 60000);
    };
    if ('scheduler' in window) scheduler.postTask(checkPhase, { priority: 'background' });
    else setTimeout(checkPhase, 0);
  }

  /* ── 🍞 TOAST SYSTEM (Popover API) ────────────────────────── */
  _toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('popover', 'manual');
    container.appendChild(toast);
    toast.showPopover();
    setTimeout(() => { toast.hidePopover(); toast.remove(); }, 3000);
  }

  _bindKeyboardGuards() {
    document.addEventListener('keydown', (e) => {
      if (e.target.dataset?.singleLine === 'true' && e.key === 'Enter') {
        e.preventDefault();
        this._toast('Nur eine Zeile erlaubt', 'warn');
      }
    });
  }

  _initEditors() {
    Registry.forEach(entry => {
      const el = document.querySelector(entry.tag);
      if (el) {
        // [CMD-1] Ghost-Mirror
        if (entry.tag === 'din-body') {
          this._ghosts[entry.tag] = new GhostMirror('din-body', 'din-body-mirror');
        }
      }
    });
  }

  _onStateChange(path, value, scope, source) {
    if (source === 'ui') return;
    const key = path.split('.').pop();
    const entry = Registry.find(e => e.key === key);
    if (entry) {
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) {
        el.textContent = value || '';
        if (this._ghosts[entry.tag]) this._ghosts[entry.tag].update(value);
      }
    }
  }

  _syncAllToDOM() {
    Registry.forEach(entry => {
      const el = document.querySelector(entry.tag);
      if (el) el.textContent = this.sm.state.content[entry.key] || '';
    });
  }

  _handleExport() {
    const data = JSON.stringify(this.sm.serialize(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DIN-BriefNEO_${Logic.todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  _handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          try { this.sm.load(JSON.parse(re.target.result)); location.reload(); }
          catch (err) { alert("Import fehlgeschlagen"); }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  _bindNativeEvents() {
    document.addEventListener('input', (e) => {
      const tag = e.target.tagName.toLowerCase();
      const entry = Registry.find(et => et.tag === tag);
      if (entry) {
        const text = e.target.textContent;
        this.sm.update(`content.${entry.key}`, text, 'ui');
        if (this._ghosts[tag]) this._ghosts[tag].update(text);
        if (entry.key === 'body') this._checkOverflow(e.target);
      }
    });

    document.addEventListener('paste', (e) => {
      if (e.target.hasAttribute('contenteditable')) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    });
  }

  _checkOverflow(el) {
    clearTimeout(this._overflowDebounce);
    this._overflowDebounce = setTimeout(() => {
      const res = Logic.checkContentOverflow(el);
      if (res.overflow) el.style.borderRight = '3px solid red';
      else el.style.borderRight = 'none';
    }, 500);
  }

  _bindSidebarPreferences() {
    const sidebar = document.getElementById('sidebar-left');
    if (!sidebar) return;
    sidebar.addEventListener('change', (e) => {
      const { name, value } = e.target;
      if (name === 'layout') {
        document.body.dataset.layout = value;
        this.sm.update('config.layout', value);
      }
    });
  }
}
```

---

### [[logic/logic.js]]

| Feld | Wert |
|------|------|
| Pfad | `logic\logic.js` |
| Typ | `.js` |
| Größe | 10.28 KB |
| Zeilen | 268 |
| Zeichen | 9644 |
| Keywords | `const` `return` `export` `function` `length` `null` `clean` `entry` `json` `match` `text` `lines` `push` `join` `temporal` |

```javascript
/**
 * js/logic/logic.js — Pure Business Logic Engine (v1.8 - FULL RESTORE)
 * DIN-BriefNEO · Platinum V14 | SPEC-002, SPEC-007, CAA-008, PLAN-010, ADR-008
 * ─────────────────────────────────────────────────────────────────────────────
 * [TOMB-L001] NO new Date(). Using Temporal API exclusively.
 * [TOMB-L008] NO innerHTML. textContent SSoT.
 * [ARK-PROTECT] Content Integrity Shield for >280mm content.
 */

import { Registry, AI_INTENTS } from '../core/constants.js';
import { todayISO, formatDateTemporal as formatDate, addDaysToISO } from '../core/temporal-utils.js';
export * from './greetings.js';

/* ── Hilfsfunktion: Tag-Name → JSON-Key ──────────────────────── */
const tagToKey = tag => tag.toLowerCase().slice(4).replace(/-/g, '_');

/* ── Date Logic (Strict Temporal API) ────────────────────────── */

export { todayISO, formatDate, addDaysToISO };

const MONTHS_DE = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
];

/**
 * [TOMB-L001] Parses any date string into a Temporal.PlainDate.
 * Replaces legacy new Date() logic.
 */
export function parseDate(input) {
  if (!input) return null;
  const s = input.trim();

  try {
    // 1. ISO Format (JJJJ-MM-TT)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return Temporal.PlainDate.from(s);
    }

    // 2. DE Format (TT.MM.JJJJ)
    const m1 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m1) {
      return Temporal.PlainDate.from({ 
        year: parseInt(m1[3]), 
        month: parseInt(m1[2]), 
        day: parseInt(m1[1]) 
      });
    }

    // 3. Long Format (TT. Monat JJJJ)
    const m3 = s.match(/^(\d{1,2})\.?\s+([^\s]+)\s+(\d{4})$/);
    if (m3) {
      const monthName = m3[2].toLowerCase();
      const mi = MONTHS_DE.findIndex(mn => mn.toLowerCase().startsWith(monthName.substring(0,3)));
      if (mi !== -1) {
        return Temporal.PlainDate.from({ 
          year: parseInt(m3[3]), 
          month: mi + 1, 
          day: parseInt(m3[1]) 
        });
      }
    }

    return Temporal.PlainDate.from(s);
  } catch (e) {
    console.warn("[Logic] Date parsing failed for:", s);
    return null;
  }
}

/* ── ARK PROTOCOL: Content Integrity ─────────────────────────── */

/**
 * [ARK-001] Checks if content exceeds physical paper limits.
 * DIN A4 is 297mm. With margins, content > 280mm causes break.
 */
export function checkContentOverflow(element) {
  if (!element) return { overflow: false };
  // Baseline: 96 DPI -> 1mm = 3.78px. 280mm = 1058px.
  const heightMm = element.offsetHeight * (25.4 / 96);
  const limit = 280; 
  return {
    overflow: heightMm > limit,
    height: heightMm,
    limit: limit,
    delta: heightMm - limit
  };
}

/* ── Recipient Parsing (Platinum V4 — Intl.Segmenter) ────────── */

/**
 * [Production Ready] Recipient Parser 
 * Nutzt Intl.Segmenter für robuste Tokenisierung ohne Regex-Hell.
 */
export function parseRecipient(text) {
  if (!text) return { gender:'n', name:'', firstName:'', title:'', fullName:'' };
  
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || '';
  
  const segmenter = new Intl.Segmenter('de', { granularity: 'word' });
  const segments = Array.from(segmenter.segment(firstLine));
  const tokens = segments.filter(s => s.isWordLike).map(s => s.segment);

  let gender = 'n';
  let titles = [];
  let nameParts = [];

  const GENDER_MAP = { 'herr': 'm', 'herrn': 'm', 'frau': 'f', 'familie': 'fam', 'eheleute': 'fam' };
  const TITLE_SET = new Set(['dr', 'prof', 'dipl', 'mag', 'ing', 'h.c', 'mult']);

  for (const token of tokens) {
    const lower = token.toLowerCase().replace(/\.$/, '');
    if (GENDER_MAP[lower]) { gender = GENDER_MAP[lower]; continue; }
    if (TITLE_SET.has(lower)) { titles.push(token.endsWith('.') ? token : token + '.'); continue; }
    nameParts.push(token);
  }

  const title = titles.join(' ');
  const name = nameParts.length ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const fullName = [title, firstName, name].filter(Boolean).join(' ');

  return { gender, name, firstName, title, fullName };
}

/* ── Precision Math (Production Ready Guard) ────────────────────── */

export const PreciseMath = Object.freeze({
  sum(values) {
    if (!values || !Array.isArray(values)) return 0;
    // @ts-ignore - Chrome 147 Baseline
    if (typeof Math.sumPrecise === 'function') return Math.sumPrecise(values);
    const cents = values.reduce((acc, val) => acc + Math.round(val * 100), 0);
    return cents / 100;
  }
});

export function sumFinancials(values) { return PreciseMath.sum(values); }

/* ── Return Address (Production Ready) ─────────────────────────── */

export function deriveReturnLine({ name = '', co = '', street = '', zipCity = '' } = {}) {
  const abbr = raw => {
    if (!raw) return '';
    const clean = raw.replace(/^(Herr|Frau)\s+/i,'').trim();
    const parts = clean.split(/\s+/);
    return (parts.length > 1 && !parts[0].includes('.'))
      ? parts[0].charAt(0) + '. ' + parts.slice(1).join(' ')
      : clean;
  };
  const namePart = co ? `${abbr(name)} (c/o ${co})` : abbr(name);
  return [namePart, street, zipCity].filter(Boolean).join(' · ');
}

/* ── IBAN (Production Ready BigInt) ────────────────────────────── */

export function validateIBAN(raw) {
  if (!raw) return false;
  const clean = raw.replace(/\s+/g, '').toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numericStr = '';
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) numericStr += (code - 55).toString();
    else if (code >= 48 && code <= 57) numericStr += char;
    else return false; 
  }
  try { return BigInt(numericStr) % 97n === 1n; } catch { return false; }
}

export function validateAddressPlausibility(text) {
  if (!text) return { ok: true };
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const errors = [];
  if (lines.length < 3) errors.push('Anschrift zu kurz (mind. 3 Zeilen)');
  const lastLine = lines[lines.length - 1] || '';
  const zipMatch = lastLine.match(/^([D-Z]{1,3}-)?\s*(\d{5})\s+(.+)$/i);
  if (!zipMatch) errors.push('PLZ/Ort Format ungültig');
  else if (zipMatch[2].length !== 5) errors.push('PLZ muss 5-stellig sein');
  const streetLine = lines[lines.length - 2] || '';
  if (streetLine && !/\d/.test(streetLine)) errors.push('Hausnummer fehlt vermutlich');
  return { ok: errors.length === 0, errors };
}

export function formatIBAN(raw) {
  if (!raw) return '';
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

/* ── DOM Scanning (Plaintext-Only Mandate) ───────────────────── */

export function readDOMasJSON() {
  const result = {};
  for (const entry of Registry) {
    const el = document.querySelector(entry.tag);
    // [ADR-008] Mandatory textContent. NO innerHTML.
    result[entry.key] = el?.textContent?.trim() || null;
  }
  return result;
}

export function getTag(key) {
  const entry = Registry.find(e => e.key === key);
  return entry ? document.querySelector(entry.tag) : null;
}

export function executeAIResponse(json) {
  if (!json || typeof json !== 'object') return;
  for (const entry of Registry) {
    if (json.hasOwnProperty(entry.key)) {
      const el = document.querySelector(entry.tag);
      if (el && json[entry.key] !== null) {
        el.textContent = json[entry.key];
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }
  if (json.intent === AI_INTENTS.PRINT) window.print();
}

/* ── PROMPT BUILDERS (Restored & Modernized) ─────────────────── */

export function buildInterviewPrompt() {
  const tagAnnotated = Registry.map(e => `  "${e.key}": null   // <${e.tag}>`).join(',\n');
  return `# DIN-BriefNEO — Production Ready Interview-Modus\n# State Registry 2.0 | CAA-008 | ADR-008 | PLAN-010\n\nDu bist ein Assistent für professionelle Korrespondenz (DIN 5008:2020-03).\n\n## Kanonisches Schema\n\`\`\`json\n{\n  "intent": null,\n${tagAnnotated}\n}\n\`\`\`\n\n## Regeln\n- ALLE Keys ausgeben (null bei Leerstand)\n- Markdown NUR im body erlaubt\n- greeting OHNE Satzzeichen am Ende`;
}

export function buildOptimizationPrompt() {
  const current = readDOMasJSON();
  const rows = Registry.map(({ key, tag }) => {
    const val = current[key];
    const display = val ? JSON.stringify(val).substring(0, 80) : 'null';
    return `  "${key}": ${display}   // <${tag}>`;
  }).join(',\n');
  return `# DIN-BriefNEO — Optimierungs-Modus\n\n## Aktueller Stand\n\`\`\`json\n{\n  "intent": null,\n${rows}\n}\n\`\`\`\n\n## Ziel\nOptimiere Betreff, Anrede und Body nach DIN 5008.`;
}

/**
 * Highlighting API for Markdown markers
 */
export function getMarkdownRanges(text, textNode) {
  if (!text || !textNode) return { bold: [], italic: [], marker: [] };
  const boldRanges = [];
  const italicRanges = [];
  const markerRanges = [];
  const scan = (regex, type) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      try {
        const range = new Range();
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        if (type === 'bold') boldRanges.push(range);
        else italicRanges.push(range);
      } catch (e) { }
    }
  };
  scan(/(\*\*)(.*?)\1/g, 'bold');
  scan(/(\*)(.*?)\1/g, 'italic');
  return { bold: boldRanges, italic: italicRanges, marker: markerRanges };
}
```

---

### [[core/state.js]]

| Feld | Wert |
|------|------|
| Pfad | `core\state.js` |
| Typ | `.js` |
| Größe | 13.90 KB |
| Zeilen | 341 |
| Zeichen | 13892 |
| Keywords | `elements` `const` `innertext` `document` `config` `data` `item` `history` `zone` `body` `sender` `getelementbyid` `json` `subject` `greeting` |

```javascript
/**
 * DIN-BriefNEO | State & Logic Management (v1.5)
 * [TOMB-L001] NO new Date(). Using Temporal API.
 * [TOMB-L008] NO innerHTML. Using textContent/DOM API.
 * CSS-FIRST EDITION: Positioning and UI constraints handled by CSS.
 */

import { todayISO, formatDateTemporal } from './temporal-utils.js';

export const App = {
    config: {
        layout: 'form-b',
        dateFormat: 'de',
        addressProvider: 'photon',
        apiKey: ''
    },
    
    elements: {},
    autocompleteDebounce: null,

    /**
     * CORE: Initialize all components and restore saved state
     */
    init() {
        console.info('[State] Initializing Data Logic (Temporal & CSS-First)...');
        
        this.elements = {
            sender: document.getElementById('sender-block'),
            zone1: document.getElementById('zone-1'),
            zone2: document.getElementById('zone-2'),
            dateField: document.getElementById('date-field'),
            historyList: document.getElementById('history-list'),
            modal: document.getElementById('settings-modal'),
            subject: document.getElementById('subject'),
            body: document.getElementById('letter-body'),
            greeting: document.getElementById('letter-greeting'),
            signature: document.getElementById('letter-signature'),
            providerSelect: document.getElementById('provider-select'),
            apiKeyGroup: document.getElementById('api-key-group'),
            apiKeyInput: document.getElementById('api-key-input')
        };

        // 1. Load configuration from Storage
        const savedConfig = localStorage.getItem('din5008_config');
        if (savedConfig) {
            try {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            } catch(e) { console.error("Config corrupt", e); }
        }
        
        // 2. Initial UI Sync
        this.applyConfigUI();
        this.updateBackAddress();
        this.updateDate();
        this.renderHistory();

        // 3. Event Binding
        this.elements.sender?.addEventListener('input', () => this.updateBackAddress());
        this.elements.zone2?.addEventListener('input', (e) => this.handleAddressInput(e));
        
        // Auto-save snapshot on print
        window.addEventListener('beforeprint', () => this.saveSnapshot(true));

        // Global Click handling for Popovers (Non-Invoker Fallback)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-suggestions') && e.target !== this.elements.zone2) {
                this.closeAutocomplete();
            }
        });
    },

    /**
     * SETTINGS: Preferences Management
     */
    openSettings() { this.elements.modal?.showModal(); },
    closeSettings() { this.elements.modal?.close(); },

    saveSetting(key, value) {
        this.config[key] = value;
        this.saveConfig();
        if (key === 'layout') document.body.className = value === 'form-a' ? 'layout-form-a' : 'layout-form-b';
        if (key === 'dateFormat') this.updateDate();
    },

    updateProviderUI(value) {
        this.config.addressProvider = value;
        this.saveConfig();
        if (this.elements.apiKeyGroup) {
            this.elements.apiKeyGroup.style.display = value === 'geoapify' ? 'block' : 'none';
        }
    },

    saveConfig() {
        localStorage.setItem('din5008_config', JSON.stringify(this.config));
    },

    applyConfigUI() {
        const layoutBtn = document.querySelector(`input[name="layout"][value="\${this.config.layout}"]`);
        if(layoutBtn) layoutBtn.checked = true;
        document.body.className = this.config.layout === 'form-a' ? 'layout-form-a' : 'layout-form-b';

        const dateBtn = document.querySelector(`input[name="dateFormat"][value="\${this.config.dateFormat}"]`);
        if(dateBtn) dateBtn.checked = true;

        if (this.elements.providerSelect) this.elements.providerSelect.value = this.config.addressProvider;
        if (this.elements.apiKeyInput) this.elements.apiKeyInput.value = this.config.apiKey;
        if (this.elements.apiKeyGroup) {
            this.elements.apiKeyGroup.style.display = this.config.addressProvider === 'geoapify' ? 'block' : 'none';
        }
    },

    /**
     * AUTOCOMPLETE: Data handling (CSS-First Positioning)
     */
    handleAddressInput(e) {
        const query = e.target.innerText.trim();
        if (query.length < 3) {
            this.closeAutocomplete();
            return;
        }
        clearTimeout(this.autocompleteDebounce);
        this.autocompleteDebounce = setTimeout(() => this.fetchSuggestions(query), 400);
    },

    async fetchSuggestions(query) {
        try {
            let url = '';
            if (this.config.addressProvider === 'photon') {
                url = `https://photon.komoot.io/api/?q=\${encodeURIComponent(query)}&lang=de&limit=5`;
            } else {
                if (!this.config.apiKey) return;
                url = `https://api.geoapify.com/v1/geocode/autocomplete?text=\${encodeURIComponent(query)}&apiKey=\${this.config.apiKey}&limit=5&lang=de`;
            }
            const response = await fetch(url);
            if (!response.ok) return;
            const data = await response.json();
            this.renderSuggestions(data.features);
        } catch (err) {
            console.error("[Autocomplete] Fetch error", err);
        }
    },

    renderSuggestions(features) {
        this.closeAutocomplete();
        if (!features || features.length === 0) return;
        
        const list = document.createElement('div');
        list.className = 'autocomplete-suggestions';

        features.forEach(feature => {
            const item = document.createElement('div');
            item.className = 'autocomplete-suggestion';
            
            const p = feature.properties;
            const addressObj = this.config.addressProvider === 'photon' ? {
                name: p.name || '',
                street: p.street || '',
                hnr: p.housenumber || '',
                zip: p.postcode || '',
                city: p.city || ''
            } : {
                formatted: p.formatted || '',
                isGeoapify: true
            };
            
            // Safe DOM Construction (No innerHTML)
            const strong = document.createElement('strong');
            strong.textContent = p.name || p.formatted?.split(',')[0] || '';
            item.appendChild(strong);
            
            const sub = document.createElement('span');
            sub.textContent = this.config.addressProvider === 'photon' 
                ? ` \${p.street || ''} \${p.housenumber || ''}, \${p.postcode || ''} \${p.city || ''}`
                : ` \${p.formatted?.split(',').slice(1).join(',') || ''}`;
            item.appendChild(sub);
            
            item.onclick = () => this.selectAddress(addressObj);
            list.appendChild(item);
        });
        document.body.appendChild(list);
    },

    selectAddress(addr) {
        let textToInsert = '';
        if (addr.isGeoapify) {
            textToInsert = addr.formatted.split(', ').join('\n');
        } else {
            const parts = [
                addr.name, 
                `\${addr.street} \${addr.hnr}`.trim(), 
                `\${addr.zip} \${addr.city}`.trim()
            ].filter(Boolean);
            textToInsert = parts.join('\n');
        }
        
        if (this.elements.zone2) {
            this.elements.zone2.innerText = textToInsert;
            this.elements.zone2.focus();
        }
        this.closeAutocomplete();
        this.saveSnapshot(true);
    },

    closeAutocomplete() {
        const existing = document.querySelector('.autocomplete-suggestions');
        if (existing) existing.remove();
    },

    /**
     * DIN LOGIC: Automatic Return Line Generation
     */
    updateBackAddress() {
        const fullText = this.elements.sender?.innerText.trim();
        if (!fullText) { if(this.elements.zone1) this.elements.zone1.innerText = ""; return; }
        
        let lines = fullText.split('\n').map(l => l.trim()).filter(l => l);
        lines = lines.filter(l => !/^(tel|fax|email|web|mobil|phone|mail)/i.test(l));
        
        let singleLine = lines.join(' - ');
        if (singleLine.length > 70) {
            singleLine = singleLine.replace(/Stra\u00dfe/g, 'Str.').replace(/stra\u00dfe/g, 'str.');
        }
        if (this.elements.zone1) this.elements.zone1.innerText = singleLine;
    },

    /**
     * [TOMB-L001] Date Logic using Temporal API
     */
    updateDate() {
        // Replacement for new Date()
        const iso = todayISO();
        const dateStr = formatDateTemporal(iso, this.config.dateFormat);
        if (this.elements.dateField) this.elements.dateField.innerText = dateStr;
    },

    /**
     * STORAGE: Snapshots & Data Portability
     */
    saveSnapshot(silent = false) {
        const history = JSON.parse(localStorage.getItem('din5008_history') || '[]');
        const snapshot = {
            id: Date.now(), // timestamp still numeric
            date: formatDateTemporal(todayISO(), 'de') + ' ' + new Date().toLocaleTimeString('de-DE'), // Time fallback for UI
            sender: this.elements.sender?.innerText || '',
            recipient: this.elements.zone2?.innerText || '',
            subject: this.elements.subject?.innerText || '',
            body: this.elements.body?.innerText || '',
            greeting: this.elements.greeting?.innerText || '',
            signature: this.elements.signature?.innerText || ''
        };
        history.unshift(snapshot);
        if (history.length > 15) history.pop();
        localStorage.setItem('din5008_history', JSON.stringify(history));
        if (!silent) this.renderHistory();
    },

    renderHistory() {
        if (!this.elements.historyList) return;
        this.elements.historyList.textContent = '';
        
        const history = JSON.parse(localStorage.getItem('din5008_history') || '[]');
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.onclick = () => this.loadHistoryItem(item.id);
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'history-date';
            dateSpan.textContent = item.date;
            
            const recipientLine = document.createElement('strong');
            recipientLine.textContent = (item.recipient || '').split('\n')[0] || 'Unbenannt';
            
            li.appendChild(dateSpan);
            li.appendChild(recipientLine);
            this.elements.historyList.appendChild(li);
        });
    },

    loadHistoryItem(id) {
        const history = JSON.parse(localStorage.getItem('din5008_history') || '[]');
        const item = history.find(i => i.id === id);
        if (item && confirm('Diesen Stand laden?')) {
            if(this.elements.sender) this.elements.sender.innerText = item.sender || '';
            if(this.elements.zone2) this.elements.zone2.innerText = item.recipient || '';
            if(this.elements.subject) this.elements.subject.innerText = item.subject || '';
            if(this.elements.body) this.elements.body.innerText = item.body || '';
            if(this.elements.greeting) this.elements.greeting.innerText = item.greeting || '';
            if(this.elements.signature) this.elements.signature.innerText = item.signature || '';
            this.updateBackAddress();
            this.closeSettings();
        }
    },

    exportData() {
        const data = {
            config: this.config,
            history: JSON.parse(localStorage.getItem('din5008_history') || '[]'),
            current: {
                sender: this.elements.sender?.innerText, 
                recipient: this.elements.zone2?.innerText,
                subject: this.elements.subject?.innerText, 
                body: this.elements.body?.innerText,
                greeting: this.elements.greeting?.innerText, 
                signature: this.elements.signature?.innerText
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Using current date for filename
        a.download = `brief_backup_\${todayISO()}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    },

    importData(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.config) { this.config = data.config; this.saveConfig(); this.applyConfigUI(); }
                if (data.history) localStorage.setItem('din5008_history', JSON.stringify(data.history));
                if (data.current) {
                    if(this.elements.sender) this.elements.sender.innerText = data.current.sender || '';
                    if(this.elements.zone2) this.elements.zone2.innerText = data.current.recipient || '';
                    if(this.elements.subject) this.elements.subject.innerText = data.current.subject || '';
                    if(this.elements.body) this.elements.body.innerText = data.current.body || '';
                    if(this.elements.greeting) this.elements.greeting.innerText = data.current.greeting || '';
                    if(this.elements.signature) this.elements.signature.innerText = data.current.signature || '';
                }
                this.renderHistory(); this.updateBackAddress(); alert('Import erfolgreich!');
            } catch (err) { alert('Ungültige Datei.'); }
        };
        reader.readAsText(file);
    }
};
```

---

## Export-Ende

```
╔══════════════════════════════════════════════════════════════╗
║  ANTIGRAVITY CONTEXT BUNDLER v4.1 – COMPLETE                 ║
╚══════════════════════════════════════════════════════════════╝
Quelle     : C:\Users\morit\Desktop\DIN-BriefNEO\js         
Dateien    : 14 Textdateien
Zeichen    : 77743
Zeilen     : 2208
Abgeschlossen: 2026-03-27 14:59:33
Fehler     : 0
```

<!-- ANTIGRAVITY_BUNDLE_EOF -->
