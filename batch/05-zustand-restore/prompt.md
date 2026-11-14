# Batch 05 — Zustand und Restore: die offenen Reste (SKIZZE)

> Noch nicht ausformuliert. Nur die Punkte, die nicht verloren gehen dürfen.

## Frage

Es gibt **zwei Restore-Pfade** für denselben Zustand: `boot-state.js` (vor dem
Paint) und `draft-manager.js` (nach dem Boot). Sind sie äquivalent — und was
passiert mit Feldern, die nur einer von beiden kennt?

## Geplante Dateien

- `website/js/draft-manager.js` (550 Zeilen)
- `website/js/boot-state.js` (143 Zeilen)
- `website/js/persistence.js` (877 Zeilen) — `DEFAULT_SETTINGS`, `loadJSON`

## Was zu messen ist

- [ ] Welche Schlüssel aus `din_draft_current` setzt der Seeder, welche der
  Draft-Manager, welche beide? (Tabelle; Seeder hat **keine** Allowlist)
- [ ] Sanitizer: prüft `draft-manager.js` die Feld-ID gegen eine Allowlist?
  Der Seeder tut es nicht (B69)
- [ ] `targetLock = null` an zwei Reset-Stellen in `main.js` — gehört das in
  `draft-manager.js` (`loadDraft`/`resetDraft`)?
- [ ] Dynamische Importe: der Importgraph zählt `import()` nicht mit. Wie viele
  gibt es, und hängen sie am Boot-Pfad? (`main.js:317/331`, `:172`)
- [ ] Boolean-Semantik: `asBool` vs. `!== false` vs. `Boolean()` (B65) —
  welcher Wert gilt bei `null`/fehlend, und wo weichen sie ab?
- [ ] `DEFAULT_SETTINGS` als Wahrheit: welche Schlüssel fehlen dort?

## Notizen

- Es geht um **Gleichheit der Pfade**, nicht um Umbau. Zielbild: eine
  gemeinsame Funktion für „Zustand aus einem Objekt anwenden".
- `data-gesetzt` (B62) und `data-layout` (B63) sind eigene, kleinere Aufgaben
  und nicht Teil dieser Scheibe.
