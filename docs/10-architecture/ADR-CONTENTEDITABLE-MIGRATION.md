---
id: adr-contenteditable-migration
title: 'ADR-CONTENTEDITABLE-MIGRATION: Einzeilige Felder von contenteditable zu input/textarea'
type: adr
status: proposed
created: '2026-11-10'
updated: '2026-11-10'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/proposed
  - type/adr
  - tech/html
doc_links:
  - '[[ADR-ANLAGEN-TEXTAREA]]'
  - '[[ADR-EINSEITEN-STILLGELEGT]]'
  - '[[ADR-HTML]]'
  - '[[IMR-Registry]]'
code_links:
  - 'website/js/field.js'
  - 'website/js/document.js'
  - 'website/js/draft-manager.js'
  - 'website/css/sheet-common.css'
depends_on: []
---

# ADR: Migration von contenteditable zu input/textarea

## Status

Proposed (2026-11-10).

## Kontext

Die einzeiligen Felder (`#empfaenger-*`, `#absender-*`, `#fuss-*` und die
übrigen) sind heute `contenteditable="plaintext-only"`. Sie sollen zu
`<input type="text">` werden. Die Anlagen-Migration
([[ADR-ANLAGEN-TEXTAREA]]) war der Pilot und hat 13 generische Fallstricke
aufgedeckt, die bei jeder Migration auftreten.

Bestand (gemessen 2026-11-10, `website/index.html`): **30** Felder mit
`contenteditable="true|plaintext-only"` und eigener ID, davon **26** ohne
Ausnahme und damit Migrationskandidaten. (Zwei weitere Vorkommen zählen nicht:
eine Kommentarzeile und `#spacer` mit `contenteditable="false"`.)

## Entscheidung

Die Migration erfolgt in Gruppen (Empfänger, Absender, Fuss, Rest), jeweils mit
Pixel-Perfect-Nachweis (Δ ≤ 0,5 px) gemäß `AGENTS.md`.

**Stand 2026-11-12: abgeschlossen.** Empfänger (4), Absender (5), Datum,
`#betreff`, `#vermerke`, `#anrede`, `#grussformel`, `#unterschrift` und die
12 Fußzeilen-Felder (`#fuss-*`) sind `<input type="text" data-atom>`.
Die P38-Ratsche steht bei **0** offenen Feldern; `#text` bleibt als Rich-Text
`contenteditable="true"`.

**Bewusst akzeptiert:** `#betreff` ist damit einzeilig; die frühere
Zweizeiligkeit (`data-feldtyp="zweizeilig"`, `text-wrap: balance`) entfällt
(Entscheid 2026-11-12, Nutzerwunsch: „erstmal egal, ich will vorankommen").

**Bleibt `contenteditable="true"`:** `#text` (Formatierung: fett, kursiv, Zitat).

## Fallstricke (aus dem Anlagen-Pilot)

| # | Fallstrick | Vorbeugung |
|---|---|---|
| 1 | CSS-Selektoren hängen an `[contenteditable]` | Gemeinsamer Selektor `:is([contenteditable], input[data-feldtyp], textarea[data-feldtyp])` |
| 2 | ID-Spezifität schlägt Klassen-Spezifität | Reset ohne ID-Selektor (`#anlagen-angabe { … }` → `[data-feldtyp] { … }`) |
| 3 | `cursor: pointer` auf Label | Label bleibt klickbar, aber ohne Handzeiger |
| 4 | `EDITABLE_FIELD_SELECTOR` findet das Feld nicht | Um `input/textarea[data-feldtyp]` erweitern |
| 5 | `resetDraft` leerte das Feld nicht | `Field.setValue(el, '')` für native Felder |
| 6 | `main.js`-Toggle legt `<li>` an | Auf `.value` umstellen |
| 7 | `testbrief.js` setzt `<li>` | Auf `.value` umstellen |
| 8 | `test/index.html`-Fixture | Auf native Elemente umstellen |
| 9 | Testzahl wächst unerwartet | Zwei bestehende Tests kodieren alte Verträge — auf neue umstellen, Assertions unverändert |
| 10 | Migration alter Drafts | `stripHtmlToPlaintext` in `#restoreState` (einmalig) |
| 11 | `field-sizing: content` nötig | Im CSS-Reset ergänzen |
| 12 | Popover-Blocker (`#undo-hinweis`, `#hinweis-v4`) | `display: none` im Grundzustand, `pointer-events: none` |
| 13 | `contain: size` + `container-type: size` zirkulär | Einzelseiten-Modus stillgelegt ([[ADR-EINSEITEN-STILLGELEGT]]) |

## Konsequenzen

- Jedes `contenteditable`-Feld, das migriert wird, folgt diesem Muster
  (`website/js/field.js`, Pixel-Perfect-Nachweis, Testumstellung).
- Die Ratsche `P38` (`tools/antipatterns/project.json`) meldet
  `contenteditable` auf den 26 offenen Feldern als `warning`; die vier
  erlaubten IDs sind per `exemptions` ausgenommen. Die Regel blockiert nicht
  (warning ist kein Gate), macht den Rest aber sichtbar.
- Nach der Migration: `P38` auf `critical` stellen und `max_violations` auf 0 —
  dann sind nur noch die vier erlaubten Felder zulässig.
- Kein Kommentar an jedem einzelnen Feld: 26 Kommentare wären Rauschen, der
  ADR ist die Referenz.

## Verwandte ADRs

- [[ADR-ANLAGEN-TEXTAREA]] (Pilot, ein Fall)
- [[ADR-EINSEITEN-STILLGELEGT]] (Fallstrick 13)
