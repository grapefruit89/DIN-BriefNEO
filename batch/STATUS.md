# Batch-Status

Stand 2026-11-14. Diese Datei ist die Wahrheit über den Fortschritt der
Review-Scheiben — nicht der Chat.

## Review-Batches (externer Agent)

| Batch | Thema | Gebaut | Review | Ausgewertet | Dateien / Größe |
|---|---|---|---|---|---|
| 01 | Architektur-Vertrag: Schichten, Verstöße, prüfbare Regeln | ✅ | ✅ | ✅ teilweise | 3 / 55 KiB |
| 02 | Boot-Pfad: zwei Dateien, Zeitachse, zwei Marker | ✅ | ✅ | ✅ vollständig | 4 / 30 KiB |
| 03 | CSS-Kaskade: `!important` und `@layer` | Skizze ✅ | – | – | `batch/03-kaskade/` |
| 04 | `sidebar.css`: Optik und Struktur trennen | Skizze ✅ | – | – | `batch/04-seitenleiste-struktur/` |
| 05 | Zustand und Restore: die offenen Reste | Skizze ✅ | – | – | `batch/05-zustand-restore/` |
| 06 | PDF-Export als Addon | Skizze ✅ | – | – | zurückgestellt (Nutzerentscheidung) |

**Regel:** Die Skizzen enthalten nur die Fragen und Messpunkte — kein
vollständiger Auftrag. Ausformuliert wird erst, wenn die Scheibe dran ist
(files.txt, generierte Fakten, Anhang ≤ 30 KiB). Jede Scheibe
braucht 2–4 Dateien und einen Messblock; bei mehr als 30 KiB Anhang prüfen, ob
der Schnitt zu grob ist.

## Architekturarbeit (S1–S4 aus Batch 01)

| Punkt | Status | Beleg |
|---|---|---|
| S1 `data-anlagen`/`data-fuss` → `:has()` | ✅ erledigt | `ac62e65`, 30/30 vor und nach |
| S1 `data-visible` → `:not(:placeholder-shown)` | ✅ erledigt | `ac62e65`, 4 Writer entfernt |
| S1 `data-gesetzt` → `:has(option:checked…)` | ✅ erledigt (B62) | 30/30 statt 0/30 gefüllt, 2 Writer entfernt |
| S1 `data-layout` → eine Spur | ⬜ offen (B63) | Attribut an 3 Stellen + zweite `--active-idx`-Spur |
| S2 `@layer` statt `!important` | ⬜ offen (B59) | 0 `@layer`, 152 `!important`, 354 ID-Referenzen |
| S3 `sheet.css` entscheiden | ✅ entschieden (B60) | bleibt, nicht eingebunden, Statuskopf; 0 Byte Netzlast |
| S3 `sidebar.css` trennen | ⬜ offen (B64) | 1241 Z., 118 ID-Selektoren; Batch 04 |
| S4 Druck/Token/Animation | ⛔ nicht anfassen | Nutzerentscheidung |

## Was aus Batch 01 offen blieb

| Befund | Status |
|---|---|
| `main.js` komponiert nur (R4) | **verworfen** — Meinung, kein belegter Schaden |
| `style.cssText` im Boot-Fehlerkasten (R3) | **akzeptiert** — muss ohne CSS rendern |
| `import()` vor `data-ready` (R5) | in Batch 02 als Frage 4 enthalten |
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

1. **`@layer` (B59):** Freigabe für einen Umbau der Kaskade. Ohne sie bleibt es
   bei 152 `!important`.
2. **`sidebar.css` (Batch 04):** Soll die Modus-Sichtbarkeit aus der
   Design-Datei heraus (Strukturvertrag in `base.css`)? Das war im Batch 01 als
   `data-nur`-Vorschlag abgelehnt — bleibt abgelehnt, solange es keinen neuen
   Messwert gibt.
3. **PDF-Export:** eigener Batch, erst wenn die Struktur steht.
