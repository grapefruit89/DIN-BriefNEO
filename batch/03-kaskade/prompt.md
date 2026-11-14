# Batch 03 — Kaskade: `!important` und `@layer` (SKIZZE)

> Noch nicht ausformuliert. Nur die Punkte, die nicht verloren gehen dürfen.
> Schneiden, wenn Batch 02 ausgewertet ist.

## Frage

Warum braucht das Projekt **152 × `!important`** und **354 ID-Selektor-
Vorkommen**, und welche davon kann `@layer` ersetzen — ohne die Druckausgabe
anzufassen?

## Geplante Dateien

- `website/css/sheet-multipage.css` (642 Zeilen, **100 `!important`** — der
  größte Block)
- `website/css/base.css` (363 Zeilen, 7 `@function`, 24 `!important`)
- `website/css/sidebar.css` (1241 Zeilen, 3 `!important`) — nur wenn die
  Scheibe sonst zu klein ist; sonst Batch 04

## Was zu messen ist

- [ ] Reihenfolge der heutigen Kaskade: welche Datei gewinnt wogegen? (Tabelle)
- [ ] Welche der 152 `!important` stehen in `@media print`? (vermutlich ein
  großer Teil — die sind legitim)
- [ ] Welche `!important` schlagen nur eine andere `!important`-Regel?
- [ ] Wie viele ID-Selektoren sind reine Adressen (dürfen IDs bleiben) und wie
  viele erhöhen Spezifität gegen die eigene Absicht?
- [ ] Gegenprobe: Druck-PDF vor/nach, mm-Geometrie unverändert

## Notizen

- `@layer` und `!important` sind nicht orthogonal: eine `!important`-Regel in
  einer **niedrigeren** Schicht schlägt eine normale Regel in einer höheren.
  Layer-Reihenfolge zuerst festlegen, dann umziehen.
- Ziel ist **weniger** Code, nicht mehr: jede neue Layer-Deklaration muss eine
  `!important`-Regel ersetzen, sonst ist es Etikettenschwindel.
- `website/css/sheet.css` ist stillgelegt und bleibt es (Statuskopf in der
  Datei, B60).
