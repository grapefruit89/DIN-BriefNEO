---
id: upstream-befund-2026-11-10
title: Upstream-Befund — 12 Behauptungen zu Web-Plattform-Features (2026-11-10)
status: archived
type: reference
created: '2026-11-10'
updated: '2026-11-10'
tags:
- din-briefneo
- meta
- audit
- web-platform
doc_links:
- '[[AGENTS]]'
- '[[ADR-JS]]'
- '[[DECISION-LOG]]'
code_links:
- 'website/js/document.js'
- 'website/js/address.js'
- 'website/js/main.js'
- 'website/js/salutation.js'
- 'website/js/boot.js'
- 'website/js/persistence.js'
- 'website/js/draft-manager.js'
- 'website/css/sheet.css'
- 'website/index.html'
depends_on: []
---

# Upstream-Befund — 12 Behauptungen zu Web-Plattform-Features

Eingefrorener Prüfbericht (Batch 1). Keine Code-Änderung: nur Befund, damit dieselben
Behauptungen nicht erneut gegen den Code geprüft werden müssen.

**Methode.** Chrome Platform Status API, MDN Browser-Compat-Data (Roh-JSON), CSSWG-Drafts
(`Overview.bs`) und webref als Upstream-Beleg; zusätzlich Live-Messung in
Chrome 156.0.8078.47 (Headless, eigenes Profil, `CSS.supports()` und `getBoundingClientRect`).
Ein Widerspruch zwischen Status-API und BCD wird ausdrücklich benannt, nicht geglättet.

**Gates.** `node tools/build_db.js -q` → 100.0 % clean; `node tools/test-runner.mjs` →
186/186. Arbeitsbaum vor und nach der Prüfung unverändert.

## 1. Ergebnis

| # | Behauptung | Status | Kernbeleg | Entscheidung |
|---|---|---|---|---|
| P1 | `text-fit: shrink` ist gültige Syntax | bestätigt (Quelle falsch) | Steht in **CSS Text 5** (`css-text-5/Overview.bs`), nicht Level 4 (dort 0 Treffer). BCD: Chrome 150, experimental. `CSS.supports` = true; `auto` = false. | nicht umsetzen |
| P2 | `margin-trim: block` ersetzt `.trim()` im String-Handler | widerlegt | BCD: Chrome 155, CSS Box 4. Isoliert wirksam (86 → 54 px), an `#text` gemessen **ohne** Wirkung (76 → 76 px). Und: trimmt Kind-Margins, nicht Zeichen. | nicht umsetzen |
| P3 | Safari 26.2 unterstützt `commandfor` | bestätigt, irrelevant | BCD `button.commandfor`: Chrome 135, Safari 26.2, Firefox 144. App nutzt es bereits (`index.html`). | nichts tun |
| P4 | Chrome 150–160 bringt `<usermedia>`/`<camera>`/`<microphone>` | spekulativ | Zwei Status-Einträge existieren, beide „Proposed", `milestone: null`. Keine Release-Note. | nicht in die Roadmap |
| P5 | `text-wrap: balance` wirkt bis 6 Zeilen | bestätigt | MDN: „six or less for Chromium". Live an `#betreff` (220 px): 3/5/6 Zeilen ändern sich, **7 Zeilen identisch**. | nichts ändern |
| P6 | `sanitizeRichText()` durch Sanitizer API ersetzbar | widerlegt | Sanitizer API ab Chrome 146 vorhanden, filtert aber Elemente/Attribute/Kommentare — keine Klassen-**Werte**. Der Code erlaubt genau `span.brief-kommentar` und verwirft sonst alle Attribute; Rückgabe ist ein `DocumentFragment`. | nicht umsetzen |
| P7 | `focusgroup` (Chrome 150) ersetzt Pfeiltasten-Navigation | widerlegt | Status-Eintrag: „In developer trial (Behind a flag)". Live: `'focusgroup' in div` = false. Die Handler in `address.js` steuern ein Listbox-Popover mit aktivem Index, kein roving tabindex. | nicht umsetzen |
| P8 | Drei `beforeprint`-Listener auf `window` | bestätigt | `document.js` (blur + Mikro-Typografie), `main.js` (`MetadataService.prepare/restore`), `multipage-controller.js` (Re-Layout). Nur `main.js` setzt `document.title`. | nicht konsolidieren |
| P9 | Zwei `close`-Listener auf `#reset-dialog` | bestätigt | `main.js` (Snapshot + Reset) und `salutation.js` (refresh). Beide lesen `returnValue === 'confirm'` und setzen ihn per `queueMicrotask` zurück. Reihenfolge hängt an der Boot-Reihenfolge (main vor Salutation). | prüfen bei Gelegenheit |
| P10 | `boot.js` setzt `data-erscheinungsbild` nicht | bestätigt, harmlos | `boot.js` setzt Theme, Layout, Stil, Hilfslinien, Marken, Plugin-Schalter — nicht das Erscheinungsbild. Statisch steht `"auto"` im Markup; `settings.js` korrigiert nach dem Init. Live mit gespeichertem `dark`: nach Reload korrekt. | prüfen bei Gelegenheit (kosmetisch) |
| P11 | `initSenderSync` überschreibt Nutzeredits nach Undo/Redo | bestätigt | `sync()` schreibt nur bei leerem Feld oder Gleichheit mit `lastSynced…`; der `DOCUMENT_CHANGED`-Handler setzt `lastSynced…` auf den aktuellen Text — genau das publiziert Undo/Restore. Live: Handedit → `DOCUMENT_CHANGED` → nächster Namens-Edit überschreibt. | Entscheidung nötig, nicht jetzt |
| P12 | Fuss- und Teilbetreff-Schalter lösen keinen Autosave aus | bestätigt | Kein `change`-Listener für beide; `collectDraft()` liest sie nur. Live: `din_draft_current` bleibt 0 B; Kontrolle Anlagen-Schalter → 695 B. | umsetzen (Batch 2) |

## 2. Dauerhafte Lehren

- **`text-fit` ist kein Mythos, aber auch kein Allheilmittel.** Es skaliert nur, wenn
  Inline-Inhalt die Line-Box tatsächlich überläuft. Bei normalem Umbruch (Betreff) tut es
  nichts: gemessen 613 → 200 px `scrollWidth` nur mit `nowrap`, sonst 16 px/90 px unverändert.
  Für den Betreff wäre es normwidrig, weil 12 pt Schriftgröße vorgeschrieben sind.
- **`margin-trim` wirkt, aber nicht überall.** Im isolierten Block 86 → 54 px, im Zielkontext
  `#text` 76 → 76 px trotz `computed margin-trim: block` — auch mit Border und `overflow`
  unverändert. Ein Ersatz für `.trim()` ist es ohnehin nie (Margins ≠ Zeichen).
- **Das 6-Zeilen-Limit von `text-wrap: balance` ist real** und ab 7 Zeilen messbar inaktiv.
  Damit ist `balance` am Betreff richtig, an langen Textabschnitten aber wirkungslos.
- **Status-API und Compat-Daten können sich widersprechen.** `text-fit`: Status-API „Proposed",
  BCD „Chrome 150". `margin-trim`: Status-API „Proposed", BCD „Chrome 155". In beiden Fällen
  entschied die Live-Empirie (`CSS.supports`) — nicht die Statusseite.
- **`STRUCTURE.md` ist nicht veraltet.** `Stand: <hash>` ist ein SHA-256 über den Dateirumpf,
  kein Commit-Hash; die Reconciliation prüft ihn als kritische Regel. Fitness 100 % belegt
  Aktualität.

## 3. Nachprüfen (Kurzform)

```bash
# Feature-Version (maschinenlesbar)
curl -sL "https://chromestatus.com/api/v0/features?q=<name>" | sed "s/^)]}'//" | head -40
curl -sL "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/<name>.json"
# Spez nachsehen
curl -sL "https://raw.githubusercontent.com/w3c/csswg-drafts/main/css-text-5/Overview.bs" | grep -c "text-fit"
# Live-Empirie (eigener Headless-Profil, nie der Nutzer-Tab)
CSS.supports('text-fit: shrink'); CSS.supports('margin-trim: block')
```

Messungen mit festen Breiten und `!important` wiederholen: das Mehrseiten-Stylesheet setzt
`text-wrap: balance !important` und `#betreff`-Werte mit `!important`, sonst misst man zweimal
denselben Zustand.
