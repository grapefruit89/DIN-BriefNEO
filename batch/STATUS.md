# Batch-Status

Stand 2026-11-17. Diese Datei beantwortet nur noch **eine** Frage: welche Scheibe
ist gebaut und noch nicht reviewt. Alles Erledigte steht in [[BACKLOG-ARCHIV]],
alles Offene in [[BACKLOG]] — hier keine Doppelpflege mehr.

## Offen

| Batch | Thema | Gebaut | Review | Backlog |
|---|---|:---:|---|---|
| 06 | Layer-Kaskade: `@layer` in welcher Reihenfolge | ✅ 15.11. | ⬜ offen | **B94** |
| 07 | PDF-Export: Bibliothek oder Browser? | ✅ 15.11. | ⬜ offen | **B95** |

Beide Scheiben liegen versandfertig vor (`merge.txt` je Ordner, erzeugt mit
`python3 batch/merge.py batch/<scheibe>`). Der Review kommt als GitHub-Issue
zurück; bisher sind #18, #19 und #20 so eingegangen.

**Ausnahme 06 (48 KiB):** die Frage ist eine *Dateigrenzen*-Frage (`base.css`
lädt zuerst, `sheet-multipage.css` zuletzt), beide Dateien und das Faktenblatt
mit allen `!important` gehören zusammen. Wer eine weglässt, schneidet die
Gegenpartei weg.

## Geschnitten, aber nicht verschickt

`03-kaskade/` enthält seit dem 15.11. einen **Neuschnitt** (Stand 92 statt 91).
Das ist kein neuer Review-Auftrag, sondern die Vorlage für **B59** — wer ihn
verschickt, fragt nach dem Umbau, nicht nach dem Bestand.

## Entscheidungen, die nur der Nutzer treffen kann

1. **`@layer` (B59): freigegeben 2026-11-15.** Etappenweise, jede Etappe mit
   PDF-Pixelvergleich **und** Geometrie-Dump. Plan, Messprotokoll und
   Abbruchkriterium: [[B59-LAYER-PLAN]].
2. **`sidebar.css` (Batch 04):** Modus-Sichtbarkeit bleibt in der Design-Datei.
   Der `data-nur`-Vorschlag ist abgelehnt, solange kein neuer Messwert vorliegt.
3. **PDF-Export (Batch 07):** erst wenn die Struktur steht.
4. **S4 Druck/Token/Animation:** nicht anfassen (Entscheidung 2026-11-15).

## Abgeschlossen

Batches 01–05 sind ausgewertet, ihre Ergebnisse stehen in [[BACKLOG-ARCHIV]]
(B63, B64, B72, B88, B92 …) und im [[DECISION-LOG]]. Messwerte, die nur hier
standen, sind am 2026-11-17 in den DECISION-LOG nachgetragen — Stichwort
„Nachgetragenes Protokoll der Batch-Auswertungen 01–05".
