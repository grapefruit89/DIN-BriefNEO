# Fakten zu 04-seitenleiste-struktur

**Erzeugt von `tools/batch-facts.mjs --scheibe 04` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --scheibe 04 --check` bricht ab, wenn dieses Blatt
nicht mehr zum Quelltext passt.

## 1. `sidebar.css`

| Kennzahl | Wert |
|---|---:|
| Zeilen | 1309 |
| Blöcke mit geschweifter Klammer (inkl. @media) | 187 |
| ID-Selektoren | 96 |
| `!important` | 3 |
| `:has(` | 13 |
| `@media`-Blöcke | 5 |
| verschiedene CSS-Eigenschaften | 99 |
| selbst definierte Custom Properties | 3 |
| benutzte Custom Properties | 33 |

## 2. Die Modus-Regeln (das ist der Strukturvertrag)

**0** Regeln mit **0** Selektoren tragen die
Sichtbarkeit der beiden Modi. Sie liegen alle in einem Block ab
Zeile —.

Die Zahl aus Batch 01 („7 Modus-Regeln") ist damit **veraltet**: aus sieben
Regeln sind drei geworden, weil vier davon seit dem Umbau vom 2026-11-13
nichts mehr trafen und entfernt wurden (B14).

| Zeile | Selektoren | Deklaration |
|---:|---|---|

## 3. Modusschalter in `index.html`

| Zeile | `id` | vorausgewählt |
|---:|---|---|
| 67 | `modus-brief` | ja |
| 69 | `modus-einstellungen` | nein |

## 4. Zonen in `index.html`

| Zeile | Element | `id` | `aria-label` |
|---:|---|---|---|
| 90 | `<section>` | `zone-dokument` | — |
| 216 | `<section>` | `zone-werkzeuge` | — |
| 234 | `<section>` | `zone-setup` | „Einstellungen" |
| 323 | `<div>` | `zone-aktionen` | „Aktionen" |

## 5. Fokussierbares in `index.html` (statisch gezählt)

| Element | Anzahl |
|---|---:|
| `<input>` | 43 |
| `<button>` | 24 |
| `<select>` | 3 |
| `<textarea>` | 1 |
| `<a>` | 3 |
| **Summe** | **74** |

**Diese Zahl ist keine Tab-Reihenfolge.** Sie zählt Elemente im Quelltext,
nicht erreichbare Ziele: `sr-only`, `hidden`, `disabled` und der jeweils
ausgeblendete Modus zählen hier mit. Wer die Fokusfolge beurteilen will, muss
im Browser tabben (Messmethode im Auftrag, Aufgabe 3) — genau diese
Verwechslung hat am 2026-11-13 eine Zahl um eins verschoben.
