---
id: adr-anlagen-textarea
title: 'ADR-ANLAGEN-TEXTAREA: Anlagenangabe als natives textarea'
type: adr
status: active
created: '2026-11-10'
updated: '2026-11-10'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/html
doc_links:
  - '[[ADR-HTML]]'
  - '[[IMR-Registry]]'
  - '[[ADR-CSS]]'
  - '[[ADR-DATA-PERSISTENCE]]'
code_links:
  - 'website/index.html'
  - 'website/js/field.js'
  - 'website/js/document.js'
  - 'website/js/draft-manager.js'
  - 'website/css/sheet-common.css'
depends_on: []
---

# ADR-ANLAGEN-TEXTAREA: Anlagenangabe als natives textarea

## Status

Angenommen (2026-11-10). Ersetzt die bisherige contenteditable-Liste.

## Kontext

Die IMR-Registry führt `din-anlagen-angabe` als Komponente mit einer ID und
`contenteditable` (DIN 5008, Abschnitt 20.15.2). `tools/imr.js` erzwingt generisch:

- **IMR-4**: Ein Atom mit `export: true` und `id` braucht ein `contenteditable`
  mit dieser ID.
- **IMR-8**: Die ID eines Atoms muss auf dem Atom-Tag selbst sitzen.

Der Anlagenvermerk ist fachlich eine **mehrzeilige Textliste** (eine Anlage pro
Zeile), keine Rich-Text-Liste. Die bisherige Umsetzung mit
`contenteditable` + `<ul>/<li>` bildet Browser-Verhalten manuell nach:
`ensureListStructure`, `protectAnlagenList`, `#placeCaretIn`, Paste-Normalisierung
und ein Backspace-Guard.

## Entscheidung

Die **ID `anlagen-angabe` wandert auf ein natives `<textarea>`**. Die Komponente
`<din-anlagen-angabe>` bleibt als **Wrapper ohne ID** erhalten — damit bleiben
DIN-Struktur und IMR-Regeln unverändert gültig, statt eine Ausnahme in eine
HARD-Regel zu schneiden.

Die Komponente `din-anlagen-bezeichnung` entfällt; ihre Aufgabe übernimmt ein
`<label for="anlagen-angabe">`.

## Begründung

1. **Semantik:** Eine Textarea ist eine mehrzeilige Texteingabe, keine Liste.
2. **Weniger Code:** Die Listen-Normalisierung und das Caret-Handling entfallen.
3. **Native Eigenschaften:** `form.reset()`, `FormData`, `field-sizing: content`
   und `maxlength` ohne Nachbau.
4. **Plaintext statt Rich:** DIN 5008 schreibt keine Aufzählungszeichen vor;
   Spiegelstriche im Text genügen.
5. **Keine Regel-Aufweichung:** Der Wrapper ohne ID lässt IMR-4/IMR-8 generisch
   greifen; eine Sonderregel nur für dieses Feld wäre teurer als der Umbau.

## Konsequenzen

- **Registry:** `din-anlagen-angabe` verliert `id`, `export` und die Rolle
  `list`; `din-anlagen-bezeichnung` entfällt (siehe [[IMR-Registry]]).
- **Datenfluss:** `collectDraft`/`#restoreState` lesen und schreiben den Wert
  über die minimale Feld-Abstraktion `website/js/field.js` (nativ vs.
  contenteditable).
- **Migration:** Alte Entwürfe mit `<li>`-HTML werden beim Restore einmalig zu
  `\n`-Text normalisiert (`stripHtmlToPlaintext`).
- **Export:** `buildDinLetterPayload` braucht kein Sonder-Strippen mehr; der Wert
  ist bereits Plaintext.
- **Testbrief:** schreibt den Anlagentext als Textarea-Wert statt als `<li>`.
- **Pixel-Nachweis:** Baseline vor dem Umbau gemessen (`#anlagen-angabe`
  623,63 × 32 px). Nachher gilt Δ ≤ 0,5 px gemäß AGENTS.md.

## Alternativen

- **Ausnahme in IMR-4/IMR-8:** verworfen — eine HARD-Regel für ein einzelnes Feld
  zu lockern, schwächt die Komponenten-Invariante für alle.
- **Komponente vollständig entfernen:** möglich, aber der Wrapper hält die
  DIN-Struktur lesbar und vermeidet eine Lücke im Inventar.
- **Weiterhin contenteditable:** verworfen — hält ~130 Zeilen manuelles
  Browser-Verhalten am Leben.
