# Batch-Status

Stand 2026-11-14. Diese Datei ist die Wahrheit über den Fortschritt der
Review-Scheiben — nicht der Chat.

## Review-Batches (externer Agent)

| Batch | Thema | Gebaut | Review | Ausgewertet | Dateien / Größe |
|---|---|---|---|---|---|
| 01 | Architektur-Vertrag: Schichten, Verstöße, prüfbare Regeln | ✅ | ✅ | ✅ teilweise | 3 / 55 KiB |
| 02 | Boot-Pfad: zwei Dateien, Zeitachse, zwei Marker | ✅ | ⬜ offen | – | 4 / 30 KiB |
| 03 | CSS-Kaskade: `sheet-multipage.css` (642 Z., 100 `!important`) | ⬜ | – | – | geplant |
| 04 | `sidebar.css`: Optik und Struktur trennen (1241 Z., 118 IDs) | ⬜ | – | – | geplant |
| 05 | `draft-manager.js` + dynamische Importe (Claudes Restfragen) | ⬜ | – | – | geplant |
| 06 | PDF-Export als Addon | ⬜ | – | – | zurückgestellt (Nutzerentscheidung) |

**Regel:** Batch 03 erst schneiden, wenn 02 ausgewertet ist. Jede Scheibe
braucht 2–4 Dateien und einen Messblock; bei mehr als 30 KiB Anhang prüfen, ob
der Schnitt zu grob ist.

## Architekturarbeit (S1–S4 aus Batch 01)

| Punkt | Status | Beleg |
|---|---|---|
| S1 `data-anlagen`/`data-fuss` → `:has()` | ✅ erledigt | `ac62e65`, 30/30 vor und nach |
| S1 `data-visible` → `:not(:placeholder-shown)` | ✅ erledigt | `ac62e65`, 4 Writer entfernt |
| S1 `data-gesetzt` → `:has(option:checked…)` | ⬜ offen (B62) | 2 Writer, 1 CSS-Leser |
| S1 `data-layout` → eine Spur | ⬜ offen (B63) | Attribut an 3 Stellen + zweite `--active-idx`-Spur |
| S2 `@layer` statt `!important` | ⬜ offen (B59) | 0 `@layer`, 152 `!important`, 354 ID-Referenzen |
| S3 `sheet.css` entscheiden | ⬜ offen (B60) | 297 Z., 0 Einbindungen — **Entscheidung des Nutzers** |
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

## Entscheidungen, die nur der Nutzer treffen kann

1. **`sheet.css`:** löschen oder einbinden (B60). 297 Zeilen, in 8 Dokus
   beschrieben, im Betrieb wirkungslos.
2. **`@layer` (B59):** Freigabe für einen Umbau der Kaskade. Ohne sie bleibt es
   bei 152 `!important`.
3. **`sidebar.css` (Batch 04):** Soll die Modus-Sichtbarkeit aus der
   Design-Datei heraus (Strukturvertrag in `base.css`)? Das war im Batch 01 als
   `data-nur`-Vorschlag abgelehnt — bleibt abgelehnt, solange es keinen neuen
   Messwert gibt.
4. **PDF-Export:** eigener Batch, erst wenn die Struktur steht.
