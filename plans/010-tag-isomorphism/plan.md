---
id: PLAN-010
spec: CAA-008
title: Tag-Isomorphismus — Semantische HTML-Revolution (IMR 2.0)
status: cemented
created: 2026-03-20
version: 1.0.0
anti-patterns: [ANTI-006, ANTI-025, ANTI-026]
adr: ADR-006, ADR-007
---

# Technical Plan: Tag-Isomorphismus (IMR 2.0)

## Architektur-Entscheidung (ADR-007)

Custom HTML-Tags (`<din-subject>` etc.) werden als unbekannte/autonome
Elemente eingesetzt — OHNE customElements.define().

WARUM: Browser behandeln unbekannte Tags als HTMLElement-Instanzen mit
display:inline. CSS-Tag-Selektoren funktionieren vollstaendig. JS kann via
querySelectorAll('din-*') scannen. Kein JS-Overhead fuer Registrierung.

TRADEOFF: display muss explizit gesetzt werden (din-subject { display: block; }).
Das ist kein Nachteil — wir setzen alle geometrischen Eigenschaften ohnehin
explizit via @layer din.core.

## Constitution Check

| Gate             | Anforderung              | Status                              |
|------------------|--------------------------|-------------------------------------|
| VANILLA PURITY   | Kein Framework           | OK — kein customElements.define()   |
| NO-JS DOCTRINE   | Layout via CSS           | OK — Tag-Selektoren in @layer       |
| VISUAL FREEZE    | CSS immutable            | OK — CMA-Variablen unveraendert     |
| ANTI-006 Guard   | Keine ID-basierte Logik  | OK — JS scannt Tags, nicht IDs      |
| ANTI-025 Guard   | Kein DOM-String-Schreiben| OK — nur textContent / dataset      |

## Was sich aendert

### HTML: div → din-* Tag
```
VORHER: <div id="f-subject" data-field="subject" contenteditable="true">
NACHHER: <din-subject contenteditable="plaintext-only">
```

Vorteil:
- Tag-Name IS der Feld-Key (ohne "din-" Praefix)
- data-field-Attribut entfaellt (redundant)
- ID entfaellt fuer Inhaltsfelder (UI-IDs wie #paper bleiben)
- contenteditable="plaintext-only" verhindert HTML-Injection [MANDATE-INJ]

AUSNAHME: din-body behaelt contenteditable="true" (formatierter Text erlaubt)
AUSNAHME: Container-Elemente (#paper, #anschriftzone) bleiben als div

### CSS: #id → tag-name Selektoren
```
VORHER: @layer din.core { #f-subject { top: var(--subject-top); } }
NACHHER: @layer din.core { din-subject { top: var(--subject-top); } }
```

### JS: getElementById → querySelector
```
VORHER: document.getElementById('f-subject')
NACHHER: document.querySelector('din-subject')
```

### readDOMasJSON(): automatisch via Tag-Scan
```javascript
// Statt IMR-Lookup: Tag-Name direkt → JSON-Key
document.querySelectorAll('[data-din]')  // oder din-* pattern
  .forEach(el => { key = el.tagName.slice(4).toLowerCase() })
```

## Vollstaendige Tag-Tabelle (IMR 2.0)

| Tag              | JSON-Key       | CMA-Variable     | plaintext-only? |
|------------------|----------------|------------------|-----------------|
| din-sender       | sender         | --sender-zone-top| ja              |
| din-note         | note           | --address-top    | ja              |
| din-recipient    | recipient      | --address-top    | ja              |
| din-date         | date           | --info-block-top | ja              |
| din-your-ref     | your_ref       | --info-block-top | ja              |
| din-our-ref      | our_ref        | --info-block-top | ja              |
| din-subject      | subject        | --subject-top    | ja              |
| din-salutation   | salutation     | --salutation-top | ja (auto)       |
| din-body         | body           | dynamisch        | NEIN (rich)     |
| din-greeting     | greeting       | dynamisch        | ja              |
| din-signature    | signature      | --footer-top     | ja              |

## Cemetery (was beerdigt wird)

IDs auf Inhaltsfeldern:
  #absender-zeile, #vermerkzone, #empfaenger, #informationsblock,
  #betreff, #textbereich, #f-date, #f-your-ref, #f-our-ref,
  #f-subject, #f-salut, #f-body, #f-greeting, #f-sig-name

data-field Attribut auf Inhaltsfeldern (Tag-Name ist jetzt der Key)

CSS-Regeln mit diesen IDs in @layer din.core (ersetzt durch Tag-Selektoren)
