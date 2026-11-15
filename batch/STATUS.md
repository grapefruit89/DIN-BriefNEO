# Batch-Status

Stand 2026-11-15. Diese Datei ist die Wahrheit über den Fortschritt der
Review-Scheiben — nicht der Chat.

## Review-Batches (externer Agent)

| Batch | Thema | Gebaut | Review | Ausgewertet | Dateien / Größe |
|---|---|---|---|---|---|
| 01 | Architektur-Vertrag: Schichten, Verstöße, prüfbare Regeln | ✅ | ✅ | ✅ teilweise | 3 / 55 KiB |
| 02 | Boot-Pfad: zwei Dateien, Zeitachse, zwei Marker | ✅ | ✅ | ✅ vollständig | 4 / 30 KiB |
| 03 | CSS-Kaskade: `!important` und `@layer` | ✅ | ✅ Review #1 **ausgewertet** | ✅ **B88 + B92** | 3 / 28 KiB |
| 04 | `sidebar.css`: Optik und Struktur trennen | ✅ | ✅ **ausgewertet** | ✅ **B64 umgesetzt** | 2 / **42 KiB** |
| 05 | Zustand und Restore: zwei Pfade, eine Frage | ✅ | ✅ **ausgewertet** | ✅ **F5 + Vermerk behoben** | 3 / **37 KiB** |
| 06 | Layer-Kaskade: `@layer` in welcher Reihenfolge | ✅ **15.11.** | ⬜ offen | – | 3 / **48 KiB** |
| 07 | PDF-Export als Addon | Skizze | – | – | zurückgestellt (Nutzerentscheidung) |

**Regel:** Die Skizzen enthalten nur die Fragen und Messpunkte — kein
vollständiger Auftrag. Ausformuliert wird erst, wenn die Scheibe dran ist
(files.txt, generierte Fakten, Anhang ≤ 30 KiB). Jede Scheibe
braucht 2–4 Dateien und einen Messblock; bei mehr als 30 KiB Anhang prüfen, ob
der Schnitt zu grob ist.

**Batch 03 ist abgeschlossen, nicht offen.** Das Review kam als GitHub #20 zurück
und ist ausgewertet: **B88** (35 spiegelnde `!important` entfernt, 0 Pixel
Unterschied) und **B92** (vier Restfälle geprüft, drei davon tragend). Der
Ordner enthält seit dem 15.11. einen **Neuschnitt** mit dem Stand nach dieser
Auswertung (92 statt 91) — der ist kein neuer Review-Auftrag, sondern die
Vorlage für **B59** (`@layer`). Wer ihn verschickt, fragt nach dem Umbau, nicht
nach dem Bestand.

**Ausnahme 06:** 48 KiB — die Frage ist eine *Dateigrenzen*-Frage
(`base.css` lädt zuerst, `sheet-multipage.css` zuletzt), beide Dateien und das
Faktenblatt mit allen 86 `!important` gehören zusammen. Wer eine weglässt,
schneidet die Gegenpartei weg.

**Ausnahmen 04 und 05:** 42 bzw. 37 KiB. Beide Fragen brauchen die
**vollständigen** Dateien: 05 zwei Pfade (183 + 551 Zeilen), 04 eine Datei, die
selbst der Gegenstand ist (1.281 Zeilen — ein Auszug schnitte genau die
Modus-Regeln weg, um die es geht). Der Schnitt ist nicht grob, er ist dicht.

## Was Batch 05 an Messwerten gebracht hat (15.11., vor dem Prompt)

Alle Zahlen stehen mit Zeile in `batch/05-zustand-restore/fakten.md`
(generiert, `node tools/batch-facts.mjs --scheibe 05 --check`).

| Messpunkt | Befund |
|---|---|
| `targetLock = null` | **vier** Stellen, nicht zwei: `draft-manager.js:274` (`#restoreState`), `:470` (`resetDraft`), `main.js:128` (nach `loadDraft`), `main.js:215` (nach `resetDraft`). Die zwei in `main.js` sind **redundant**: `loadDraft()` → `#restoreState()` (245→255→274) und `resetDraft()` (431→470) räumen selbst auf; im Fall „kein Entwurf" ist der statische Startwert ohnehin `null` (`address-data.js:433`). |
| dynamische `import()` | **vier**: `main.js:151` (Multipage-Controller, im `bootStep` „Plugins", **ohne** `await`), `:288/302/314` (Testbrief-Addon, lazy im Klick). JSDoc-`typeof import()` zählt nicht mit. |
| `DEFAULT_SETTINGS` | **7** Schlüssel, benutzt werden **9**: `signatureState` (2 Stellen) und `signatureImage` (3 Stellen) fehlen. `signatureState` hat im Lesepfad harte Fallbacks (`11.9/96.0/0.5`), `signatureImage` wird nur auf `undefined` gesetzt. |
| Seeder-Allowlist | seit B69 vorhanden: `boot-state.js` prüft `EDITABLE_FIELD_SELECTOR` (Zeile 122 ff.), zwei Prüfstellen auch im Draft-Manager (`fakten.md` §6). Damit ist der alte Skizzen-Punkt „Seeder hat keine Allowlist" **erledigt**. |

## Was Batch 05 ergeben hat (ausgewertet 2026-11-15)

| Befund | Ausgang |
|---|---|
| F5: Datum wird beim Reload überschrieben | ✅ **behoben** — `datum__dirty` speichert die Absicht (`document.js:927`, `draft-manager.js:346`), 3 Tests |
| Vermerk: Seeder zeigt Rand-Leerzeichen | ✅ **behoben** — `boot-state.js` trimmt `#vermerke` vor dem Paint |
| F1/F6: „Selects fallen durch" | ❌ **gegenstandslos** — kein Element trägt `data-speichern`, nur der Selektor-String existiert |
| F3: XSS über ungesäubertes HTML | ❌ **nicht reproduziert** — Probe mit `<img onerror>`: `window.__xss` blieb `null` |
| B93: `targetLock`-Doppel „redundant" | ⚠️ **zurückgestuft** — `DOCUMENT_CHANGED` kommt nach dem `null`, ein Listener kann neu setzen |
| Legacy-Liste zeigt Roh-Markup bis zum Paint | 🟡 **akzeptiert** — Migration im Seeder erzwänge einen zweiten Sanitizer |
| A: Differenztest | ✅ **`tools/seeder-diff.mjs`** — 7 Fixtures, 3 erwartete Abweichungen, 0 unerwartet |

## Architekturarbeit (S1–S4 aus Batch 01)

| Punkt | Status | Beleg |
|---|---|---|
| S1 `data-anlagen`/`data-fuss` → `:has()` | ✅ erledigt | `ac62e65`, 30/30 vor und nach |
| S1 `data-visible` → `:not(:placeholder-shown)` | ✅ erledigt | `ac62e65`, 4 Writer entfernt |
| S1 `data-gesetzt` → `:has(option:checked…)` | ✅ erledigt (B62) | 30/30 statt 0/30 gefüllt, 2 Writer entfernt |
| S1 `data-layout` → eine Spur | ⬜ offen (B63) | Attribut an 3 Stellen + zweite `--active-idx`-Spur |
| S2 `@layer` statt `!important` | ⬜ offen (B59), **freigegeben 15.11.** | Ist-Zustand neu gemessen: **92** `!important`-Vorkommen (55 Druck, 37 außerhalb) und **295** ID-Referenzen in 2.982 Zeilen; 0 `@layer` |
| S3 `sheet.css` entscheiden | ✅ entschieden (B60) | bleibt, nicht eingebunden, Statuskopf; 0 Byte Netzlast |
| S3 `sidebar.css` trennen | ✅ erledigt (B64) | Vertrag (3 Regeln/6 Selektoren) nach `base.css`: 1.281 → 1.263 Z., Sichtbarkeit identisch, 6 PDF-Seiten 0 Pixel. Die 93 Optik-Selektoren bleiben bewusst |
| S4 Druck/Token/Animation | ⛔ nicht anfassen | Nutzerentscheidung |

## Was aus Batch 01 offen blieb

| Befund | Status |
|---|---|
| `main.js` komponiert nur (R4) | **verworfen** — Meinung, kein belegter Schaden |
| `style.cssText` im Boot-Fehlerkasten (R3) | **akzeptiert** — muss ohne CSS rendern |
| `import()` vor `data-ready` (R5) | in Batch 02 als Frage 4 enthalten → jetzt Frage 3 in Batch 05 |
| `aria-pressed` statisch | beantwortet: `document.js:397–399` |
| `webmcp-bridge.js` | beantwortet: geparkt, Statuskopf in der Datei |
| `sheet.css` Ladeweg | beantwortet: tot |

## Was Batch 02 ergeben hat (ausgewertet 2026-11-14)

Acht Befunde, alle geschlossen. Belege in `fakten.md` (generiert) und im
DECISION-LOG-Eintrag „Der erste Paint ist keine Zusage".

| Befund | Ausgang |
|---|---|
| „nach `firstPaint`" ist racy | ✅ `tools/paint-probe.mjs` (3 Profile × 30, B72) |
| Zweite Restore-Logik ohne Allowlist | ✅ Seeder prüft `EDITABLE_FIELD_SELECTOR` (B69) |
| `fakten.md` §3 unvollständig | ✅ Blatt wird erzeugt, `--check` (B73) |
| Drei Boolean-Semantiken | ✅ `istAn` überall (B65) |
| `settings.js` ohne Layout-Whitelist | ✅ `2af7e9f` |
| `body[data-theme]` nur nach dem Paint | ✅ Dublette entfernt, `8b445e7` |
| Leerer `catch {}` | ✅ `console.error`, `2af7e9f` |
| `typeof Temporal` überflüssig | ✅ entfernt, `2af7e9f` |

## Entscheidungen, die nur der Nutzer treffen kann

1. **`@layer` (B59): freigegeben 2026-11-15.** Umbau etappenweise, jede Etappe
   mit **PDF-Pixelvergleich und** Geometrie-Dump (der PDF-Vergleich allein sieht
   `data-seiten="2"` nicht, siehe B92).
2. **`sidebar.css` (Batch 04):** Soll die Modus-Sichtbarkeit aus der
   Design-Datei heraus (Strukturvertrag in `base.css`)? Das war im Batch 01 als
   `data-nur`-Vorschlag abgelehnt — bleibt abgelehnt, solange es keinen neuen
   Messwert gibt.
3. **PDF-Export:** eigener Batch, erst wenn die Struktur steht.

## Werkzeuge für die Faktenblätter

| Scheibe | Aufruf |
|---|---|
| 01 | `node tools/batch-facts.mjs --scheibe 01` |
| 02 | `node tools/batch-facts.mjs` (Standard) |
| 03 | `node tools/batch-facts.mjs --scheibe 03` |
| 04 | `node tools/batch-facts.mjs --scheibe 04` |
| 05 | `node tools/batch-facts.mjs --scheibe 05` |
| 06 | `node tools/batch-facts.mjs --scheibe 06` |

Jeweils mit `--check` im Gate; `npm run docs:all` prüft Backlog-Tabelle,
Faktenblätter und Test-Dossier zusammen.
