---
tags: [aviation-grade, platinum-2026, spec-kit, architecture, forward-compat]
status: cemented
version: 3.1.0
last_audit: 2026-03-20
id: BRAIN-010
title: Future Web Standards — Nightly Pipeline Scan
traceability: [ADR-002, ADR-003, ADR-004, ADR-006, ADR-007, ADR-008, PLAN-010, BRAIN-013]
---

# 10 — Future Web Standards & JS-Audit-Integration

## ══════════════════════════════════════════════════════
## ENTSCHEIDUNGS-MATRIX (Zusammenfassung zuerst)
## ══════════════════════════════════════════════════════

### TIER-1 — SOFORT (stabil, kein Polyfill, sofortige Aktion)

| Standard / Massnahme | Status März 2026 | Konkreter Einsatz | Aktion |
|---|---|---|---|
| `execCommand()` entfernen | Dead Code (ADR-008) | Toolbar-Bindings in ui.js | **SOFORT löschen** |
| Native `<label>` für Datei-Trigger | HTML-Standard | Import-Button ersetzen | **SOFORT umbauen** |
| Sanitizer API (Ghost-Mirror) | Baseline 2025 | `setHTML()` für Mirror-Render | Bei Ghost-Mirror-Impl. |
| CSS `@property` | Baseline 2024 | CMA-Variablen typsicher | JETZT — CMA V4 |
| Popover API | Alle Modern | Zero-JS-Dialoge | BEREITS ZEMENTIERT |
| CSS `@scope` | Chrome 118+, FF 128+ | Paper-lokale Tag-Selektoren | JETZT — ADR-002+ |
| Temporal API (Polyfill) | Stage 3, polyfillbar | Datumslogik, Circuit-Breaker | JETZT — ANTI-016 |

### TIER-2 — VORBEREITEN (HTML heute anpassen, JS-Shim temporär)

| Standard | Status März 2026 | Blockierender Grund | Forward-Pattern |
|---|---|---|---|
| Invoker Commands | Chrome 133+ stabil, FF WIP | Firefox-Baseline fehlt | `commandfor`+`command` HEUTE an Buttons schreiben |
| CSS Anchor Positioning | Chrome 125+, FF: Flag | Firefox fehlt, MANDATE-FREEZE-Risiko | ADR-009 Kandidat nach FF-GA |
| View Transition API | Chrome stabil, FF WIP | Firefox-Parität fehlt | SPEC-029 Zukunft |

### TIER-3 — BEOBACHTEN (experimentell, kein Produktiv-Einsatz)

| Standard | Blockierender Grund | Vorbereitung heute |
|---|---|---|
| Typed `attr()` (CSS Values L5) | Kein GA, `@supports`-Guard reicht nicht | `data-cma-*` an alle `<din-*>` Tags (IMR 2.0 Sektion J) |
| CSS Masonry | W3C/Apple Spec-Konflikt offen | Abwarten; CMA-Positionierung bleibt |

---

## JS-AUDIT-INTEGRATION (aus BRAIN-013, 2026-03-20)

### TIER-1-MASSNAHME A: execCommand() — Strategische Entfernung

**Fundstelle:** `js/ui/ui.js`, Zeilen 62–67, `_bindTagInputs()`

```
// DEAD CODE — entfernen:
document.getElementById('editor-toolbar')
  ?.querySelectorAll('[data-cmd]')
  .forEach(btn => btn.addEventListener('mousedown', e => {
    e.preventDefault();
    document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
  }));
```

**Warum Dead Code und nicht "deprecated":**
`execCommand()` ist seit WHATWG 2016 deprecated. Entscheidend ist:
`contenteditable="plaintext-only"` (ADR-008) lässt `execCommand('bold')`
strukturell wirkungslos — der Browser verweigert die HTML-Injektion.
Das ist kein gradueller Verfall, sondern sofortiger struktureller Tod.

**Warum "strategischer Schutz":**
Dead Code ist die gefährlichste Form von Code: Er kompiliert, er läuft,
er erzeugt keinen Fehler — aber er tut nichts. Ein künftiger Entwickler
könnte `plaintext-only` entfernen, um die Toolbar zu "reparieren",
und damit ADR-008 rückgängig machen. Der Schutz liegt im Löschen,
nicht im Kommentieren.

**Was bleibt:** Undo/Redo-Buttons in der Toolbar bleiben erhalten.
Sie rufen `sm.undo()` / `sm.redo()` auf — keine execCommand-Abhängigkeit.

**Formatierungs-UX nach Entfernung:**
Toolbar zeigt nur noch Undo/Redo + einen "Markdown (?)" Info-Popover.
Kein Verlust: `**fett**` im Plaintext-Feld wird durch Ghost-Mirror gerendert.

---

### TIER-1-MASSNAHME B: Native `<label>` für Datei-Trigger

**Fundstelle:** `js/ui/ui.js`, `_bindActions()`

```
// AKTUELL (unnötig):
on('btn-import-trigger', () => document.getElementById('file-import')?.click());

// ZIEL (kein JS nötig):
<label for="file-import" role="button" class="btn-secondary">📂 Import</label>
<input type="file" id="file-import" accept=".json" hidden />
```

**Warum das heute nicht so ist:** Unklar — vermutlich Konsistenz mit
anderen `<button>`-Elementen. Keine technische Notwendigkeit für JS.
Diese Massnahme entfernt einen EventListener ohne jede Funktionsänderung.

---

### TIER-2-MASSNAHME: Invoker Commands — Forward-Compatibility-Plan

**Ziel-Architektur (wenn Firefox GA):**
```html
<button commandfor="dlg-profil" command="show-popover">Profil</button>
<button commandfor="dlg-profil" command="hide-popover" id="btn-profile-save">Übernehmen</button>
```

**Was HEUTE zu tun ist (HTML-only, keine JS-Änderung):**
Alle Dialog-öffnenden und -schließenden Buttons erhalten die Attribute
`commandfor` und `command` — auch wenn der Browser sie noch ignoriert.
HTML-Attribute, die ein Browser nicht kennt, sind vollständig harmlos.

**Der JS-Shim (temporäre Krücke — explizit so benannt):**
```
// Feature-Detection:
if (!HTMLButtonElement.prototype.hasOwnProperty('commandForElement')) {
  // JS-Fallback für Nicht-Invoker-Browsers
  // → löschen wenn Firefox GA
}
```

**Migrations-Trigger:** Firefox implementiert Invoker Commands in GA.
Dann: Shim-Block löschen. HTML unverändert. Zero-Refactor.

---

### TIER-3-MASSNAHME: data-cma-* Attribute — Validierung & Vollständigkeit

Die Attribut-Tabelle aus IMR 2.0 Sektion J ist die einzige Massnahme,
die heute für Tier-3 ergriffen werden soll. Sie ist:
- Rein additiv (kein Breaking Change)
- Vollständig harmlos wenn Typed attr() nie GA wird
- Sofort konsumierbar wenn Typed attr() GA wird

Vollständige Tabelle: **08_isomorphic_schema.md Sektion J** (kanonisch).

**Migrations-Trigger:** `@supports (top: attr(data-cma-top type(<length>)))` 
liefert `true` in allen Ziel-Browsern. Dann:
1. `@layer din.core` auf `attr()`-Syntax umstellen
2. `cma-bridge.js: initCMABridge()` — 14 Zeilen löschen
3. `cma-bridge.js` ggf. ganz löschen (nur noch `switchForm()` würde bleiben,
   der durch CSS `[data-layout]` ebenfalls bereits abgedeckt ist)

---

## TIER-1 DETAIL: Temporal API

**Status:** TC39 Stage 3. Polyfill: `@js-temporal/polyfill` (stabil).
**Handlung:** Polyfill einbinden, `new Date()` in logic.js migrieren (ANTI-016).
**Zweiter Einsatzort:** Circuit-Breaker Kalender-Tag-Vergleich (BRAIN-009).

`Date`-Objekte sind mutierbar, zeitzonenabhängig und 0-basiert in Monaten.
Für Fristenberechnungen (§ 286 BGB) und den Daily-Strike-Vergleich ist das
inakzeptabel. `Temporal.PlainDate` ist unveränderlich, zeitzonenfrei.

---

## TIER-2 DETAIL: CSS Anchor Positioning

**Status:** Chrome 125+, Firefox: experimentelles Flag. KEIN Baseline.
**Handlung:** BEOBACHTEN. Kein Produktiv-Einsatz bis Firefox GA.

Erlaubt kontextsensitive Overlays ohne JS (Tooltips, Validierungshinweise).
`<din-subject>` könnte via `anchor-name: --din-subject` als Anker dienen.
**ADR-009 Kandidat** sobald Firefox stabile Unterstützung erreicht.

---

## TIER-3 DETAIL: Typed attr() — IMR als Zukunftsspeicher

Die `data-cma-*`-Attribute an allen `<din-*>`-Tags sind der Zukunftsspeicher.
Wir bauen heute die Voraussetzung, nicht die Abhängigkeit.

```html
<din-subject
  data-cma-top="103.4mm" data-cma-left="25mm" data-cma-width="165mm"
  contenteditable="plaintext-only">
</din-subject>
```

Wenn Typed attr() Baseline wird:
```css
din-subject { top: attr(data-cma-top type(<length>)); }
```
Vollständige Attribut-Tabelle: **08_isomorphic_schema.md Sektion J**.
