---
id: datenfluss-und-laufzeit
title: 'Datenfluss & Laufzeitverhalten — verifizierter Ist-Stand'
type: guide
status: active
created: '2026-10-26'
updated: '2026-11-06'
tags:
  - din-briefneo
  - type/guide
  - status/active
  - thema/datenfluss
doc_links:
  - IMR-Registry
  - ADR-JS
  - ADR-CSS
  - ADR-DATA-PERSISTENCE
  - ADR-EVENT-DRIVEN-ARCHITECTURE
  - glossary
code_links:
  - website/index.html
  - website/js/main.js
  - website/js/document.js
  - website/js/persistence.js
  - website/js/core.js
supersedes: []
depends_on: []
error_patterns:
  - datenfluss
  - autosave
  - persistenz
---

# Datenfluss & Laufzeitverhalten — verifizierter Ist-Stand

Zweck: Einstieg in den tatsächlichen Code, geprüft am 2026-10-26 gegen HEAD `a57a754`.
Diese Notiz **dupliziert keine Normen**: Geometrie steht in der [[IMR-Registry]],
Technikverbote im Immutable Law Catalog, Verhalten in [[ADR-JS]].

## 1. Aufbau in drei Sätzen

`website/` ist das Produkt und läuft allein (A45). `index.html` trägt die DIN-Semantik
als `din-*`-Elemente mit `data-*`-Geometrie, vier CSS-Dateien rendern sie, acht ES-Module
in `website/js/` liefern Dynamik. Kopplung ausschließlich über `eventBus` aus `core.js`,
keine `window`-Globals für interne Logik.

## 2. Datenfluss: ein Feld bis zum Druck

```
Tastendruck in [contenteditable]
   └─ input-Event auf <din-blatt>          main.js:263
      └─ publish(DOCUMENT_SAVE_REQUESTED, {debounce:true})   main.js:270
         └─ DraftManager.scheduleAutoSave()                  document.js:679
            └─ setTimeout 500 ms                             document.js:668
               └─ saveDraft()                                document.js:755
                  ├─ collectDraft(): alle [contenteditable] aus dem Live-DOM,
                  │  Rich-Text vorher durch sanitizeRichText()  document.js:609
                  └─ saveJSON(STORAGE_KEYS.draft, draft)      persistence.js
                     └─ localStorage['din_draft_current']
```

Beim Laden: `migrateStorage()` → `new DraftManager()` → `loadDraft()` →
`loadJSON(STORAGE_KEYS.draft)` → `#restoreState()`.

Sofort-Speichern ohne Debounce gibt es auch: Adress-Autovervollständigung und
Absender-Sync publizieren `{debounce:false}` (`address.js`). Zusätzlich wird bei
`visibilitychange` (hidden) geflusht, damit ein Tab-Wechsel nichts verliert.

Druck: `#btn-print` → `window.print()`; `beforeprint` bereitet die Metadaten auf,
`afterprint` stellt sie zurück (`main.js:171-186`). Das Papierformat ist hart im CSS
verankert (`@page { size: A4; margin: 0; page-margin-safety: auto }`, in `sheet.css`),
damit Falz- und Lochmarke physisch exakt sitzen.

## 3. Mechaniken, die man sonst falsch annimmt

| Thema | Realität im Code |
|---|---|
| Autosave | `DEBOUNCE_DELAY = 500` ms (`document.js:668`), nicht 1000 |
| Datum | `Temporal.Now.zonedDateTimeISO('Europe/Berlin')` + `Intl` → „4. September 2026"; kein `new Date()` (A50) |
| Anrede | `SALUTATION_TONES` = `formal`, `polite`, `casual` (`salutation.js:18`) |
| Platzhalter | `[data-placeholder]:empty::before`, Inhalt via `attr()` (`sheet.css:94`) |
| Rücksendezeile | aus Absenderfeldern abgeleitet, aber editierbar — kein Read-only-Lock |
| Einzeiler | `contenteditable="plaintext-only"` + `enforceLineLimits` (A55/A49) |
| Storage | `localStorage`: `din_draft_current`, `din_settings`, `din_geoapify_key`, `din_local_addresses`, `din_sender_coords`, `din_schema_version`. Binär-Assets (Signaturbild, Schrift) als `Blob` in IndexedDB `briefneo-assets` |
| Debug-UI | `debug-panel.js` nur per dynamischem `import()` — kein Lastpfad für Nutzer |

## 4. Aus dem Altbestand verworfen

Diese Aussagen stammten aus dem Gedächtnis eines älteren Standalone-Repos und treffen
auf DIN-BriefNEO nicht zu: `#text-container`/Floating Content, Spec-IDs
`DIN-{LAYER}-{OBJECT}-{ACTION}` samt `data-spec`, PWA mit `sw.js`/`manifest.json`,
Desktop-Only-Blocker unter 1024 px, Hex-Farbpalette (C1 verlangt OKLCH), Autosave
1000 ms, `localStorage['din5008_history']`, Datums-Regex mit Punkte-Autoformat,
Empfänger bei 32/50 mm, Adressfeld bei 20 mm, Unterseite 20 mm, Lochmarke 4–5 mm,
Blueprint `theme.css`/`js/logic/formatters/`, Zombie-Dateien `index.tsx`,
05-History-Logging-Kanal, Deprecation-Historie des Altprojekts.

## 5. Offene Punkte

- `website/index.html:237` nutzt `onsubmit="return false;"` — der einzige Inline-Handler
  im Projekt. Die README-Aussage „null Inline-JS" stimmt damit nicht; bei CSP ohne
  `unsafe-inline` ist zusätzlich zu prüfen, ob der Handler greift.
