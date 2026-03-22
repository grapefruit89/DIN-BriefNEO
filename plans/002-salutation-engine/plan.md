---
id: PLAN-002
spec: SPEC-002
title: Technischer Plan — Salutation Engine (HTML/CSS Hybrid)
status: active
created: 2026-03-20
version: 1.0.0
anti-patterns: [ANTI-025]
adr: ADR-003 (No-JS Doctrine)
---

# Technical Plan: Salutation Engine (HTML/CSS Hybrid)

## Constitution Check

| Gate             | Anforderung                  | Status                              |
|------------------|------------------------------|-------------------------------------|
| NO-JS DOCTRINE   | Layout via CSS, nicht JS     | OK — CSS data-Attribut-Selektor     |
| VANILLA PURITY   | Kein Framework               | OK — Semantisches HTML + CSS        |
| USER-001         | Manuelle Override geschuetzt | OK — data-auto Flag                 |
| ANTI-025 Guard   | Keine JS-String-Generierung  | OK — JS nur fuer Fachlogik-Matrix   |

---

## Hybrid-Architektur: Was bleibt JS, was wird HTML/CSS

```
+------------------------------------------+
| JS (Fachlogik — bleibt):                 |
|   parseRecipient()  → gender, name, title|
|   deriveSalutation() → finaler String    |
|   deriveGreeting()  → Grussformel        |
|   SALUTATION_MATRIX (3x4 Tabelle)        |
+------------------------------------------+
| HTML (Semantik — neu):                   |
|   data-field="salutation"                |
|   data-gender="m|f|fam|n"               |
|   data-auto="true|false"                 |
|   data-formality="formal|polite|casual"  |
+------------------------------------------+
| CSS (Anzeige — neu):                     |
|   :empty::before { content: attr(...) }  |
|   [data-gender="m"]:empty::before {...}  |
|   [aria-invalid] Validierung             |
+------------------------------------------+
```

---

## Implementierung

### 1. HTML-Struktur fuer das Anredefeld

```html
<!-- Anredefeld: JS schreibt NUR Attribute, CSS rendert Placeholder -->
<div
  id="f-salut"
  data-field="salutation"
  data-gender="n"
  data-auto="true"
  data-placeholder="Sehr geehrte Damen und Herren,"
  data-formality="formal"
  contenteditable="true"
  aria-label="Anrede"
  spellcheck="true">
</div>

<!-- Grussformel mit Punctuation-Guard -->
<div
  id="f-greeting"
  data-field="greeting"
  contenteditable="true"
  aria-label="Grussformel">
</div>

<!-- Unterschriften-Abstand: DIN-Pflichtmass (FR-009) -->
<div class="signature-gap" aria-hidden="true"></div>

<div
  id="f-sig-name"
  data-field="signature-name"
  contenteditable="true"
  aria-label="Unterschrift (maschinenschriftlich)">
</div>
```

### 2. CSS: Placeholder via data-Attribut (kein JS fuer leere Felder)

```css
/* In @layer project.overrides */

/* Universeller Placeholder via CSS attr() */
[data-field="salutation"]:empty::before {
  content: attr(data-placeholder);
  color: var(--color-guide);
  pointer-events: none;
}

/* Gender-spezifische Placeholder als Vorschau */
[data-field="salutation"][data-gender="m"]:empty::before {
  content: "Sehr geehrter Herr \2026";
}
[data-field="salutation"][data-gender="f"]:empty::before {
  content: "Sehr geehrte Frau \2026";
}
[data-field="salutation"][data-gender="fam"]:empty::before {
  content: "Sehr geehrte Familie \2026";
}
[data-field="salutation"][data-gender="n"]:empty::before {
  content: "Sehr geehrte Damen und Herren,";
}

/* FR-009: Unterschriften-Abstand (12.7mm = 3 Leerzeilen DIN) */
.signature-gap {
  height: 12.7mm;
  display: block;
}
```

### 3. Punctuation Guard (FR-008) — CSS + minimales JS

```css
/* CSS zeigt Warnung wenn aria-invalid gesetzt */
[data-field="greeting"][aria-invalid="true"] {
  outline: 2px solid var(--color-error);
  outline-offset: 1px;
}
[data-field="greeting"][aria-invalid="true"]::after {
  content: " ← Kein Satzzeichen am Ende (DIN 5008)";
  color: var(--color-error);
  font-size: 0.75em;
}
```

```javascript
// Minimal-JS: Nur Attribut-Setter, kein DOM-Text-Schreiben
function checkGreetingPunctuation(el) {
  const text = el.textContent.trim();
  const hasBadEnd = /[,\.]$/.test(text);
  el.setAttribute('aria-invalid', hasBadEnd ? 'true' : 'false');
}
// Event: nur 1 Listener via Event Delegation am #paper (ANTI-021)
```

### 4. JS-Seite: Reduzierter updateSalutationHint()

```javascript
// Vorher: 30 Zeilen, schreibt HTML in DOM
// Nachher: 8 Zeilen, schreibt nur Attribute

function updateSalutationHint(analysis, formality, recipientType) {
  const el = document.getElementById('f-salut');
  if (!el || el.dataset.auto === 'false') return; // FR-004: Override-Schutz

  const sal = deriveSalutation(analysis, formality, recipientType);
  el.dataset.gender    = analysis.gender;
  el.dataset.formality = formality;
  el.dataset.placeholder = sal;

  // Nur in leeres/auto-Feld schreiben
  if (!el.textContent.trim()) {
    el.textContent = sal;
  }
}
```

---

## Cemetery-Eintraege (was geloescht wird)

Aus `js/ui/ui.js`:
```
_bindSettings() Radio-Sync         → onchange am HTML-Element (1 Zeile)
_applySidebarState() (20 Zeilen)   → HTML checked-Attribut ist SSoT
_applyLayout() (35 Zeilen)         → CSS @layer project.overrides
_bindEditorToolbar() show/hide     → CSS :has(:focus-within) (4 Zeilen)
Dialog-close EventListener (20L)   → Popover API popovertarget
```

Aus `js/core/state.js`:
```
state.config (gesamter Zweig)      → #paper.dataset.* (5 Attribute)
_makeProxy() fuer config           → entfaellt komplett
```

Aus `js/logic/logic.js` (Regex → HTML5 pattern):
```
Telefon-Validierungs-Regex         → <input type="tel" pattern="...">
E-Mail-Validierung                 → <input type="email">
PLZ-Validierung                    → <input pattern="[0-9]{5}" maxlength="5">
Datum-Format-Check                 → <input pattern="\d{2}\.\d{2}\.\d{4}">
```
