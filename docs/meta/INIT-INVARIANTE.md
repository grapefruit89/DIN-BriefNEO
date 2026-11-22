---
id: init-invariante
title: "Init-Invariante: Initialisierung degradiert, sie bricht nicht ab"
type: meta
status: active
created: '2026-11-22'
updated: '2026-11-22'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/regel
doc_links:
  - DECISION-LOG
  - BRANCH-anrede-dropdown
code_links:
  - website/js/address.js
  - website/js/persistence.js
depends_on: []
---

# Init-Invariante: Initialisierung degradiert, sie bricht nicht ab

**Gilt für:** jede `init*`-Funktion in `website/js/` und `website/addons/`.
**Entstanden:** 2026-11-22, nachdem das Entfernen der Anschrift-Suche fast
Key-Status, Straßen- und Ortssuche mitgerissen hat.

---

## Die Regel

> Eine `init*`-Funktion steigt **nur dann vollständig aus**, wenn ihr
> *eigenes* Ziel fehlt. Fehlt ein optionales Bestandteil, wird **nur dieser
> Teil** nicht verdrahtet — der Rest läuft.

Zwei Formen sind verboten:

```js
// VERBOTEN: ein Guard über mehrere unabhängige Features
if (!keyFeld || !strassenFeld || !ortFeld || !suchfeld) return;

// VERBOTEN: Exit, obwohl nur ein Teil fehlt
if (!exportBtn || !importBtn || !importInput || !dialog) return;
```

Erlaubt und gewünscht:

```js
// Pflicht nur, was wirklich Pflicht ist
if (!absender) return;                 // ohne Ziel gibt es nichts zu spiegeln
infoName?.addEventListener(...);       // jedes Feld einzeln
if (importBtn && importInput) { ... }  // Feature-Slice
if (exportBtn) exportBtn.addEventListener(...)
```

## Warum

Die Anschrift-Suche stand am Anfang von `initAddressServices()`:

```js
if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !addressSearchContainer) return;
```

Vier Schlösser, eine Tür. `initAddressServices()` war aber der **einzige
Eingang** für vier unabhängige Dinge:

| Feature | Pflicht-Element |
|---|---|
| Geoapify-Key-Status | `#input-geoapify-key` |
| Straßensuche | `#input-geoapify-key` |
| Ortssuche | `#input-geoapify-key` |
| Anschrift-Suche (entfallen) | `#input-anschrift-suche` |

HTML der Suche löschen ⇒ alle vier Features tot, ohne dass eine Zeile
Straßensuche angefasst wurde. Gefunden beim Purge, behoben durch einen Guard
auf `inputGeoapifyKey`.

## Audit-Stand (2026-11-22)

| Funktion | Guard | Bewertung |
|---|---|---|
| `initAddressServices` | `!inputGeoapifyKey` | ✅ ein Feature-Bündel, Key ist Pflicht |
| `initSenderSync` | `!absender` | ✅ Ziel ist Pflicht, Quellen einzeln verdrahtet |
| `initImportExport` | keiner mehr | ✅ Export / Kopieren / Import als Slices |
| `initDatePicker` | `!feld \|\| !popover` | ✅ genau ein Feature (Kalender) |
| `initFormatSync` | `!textEl` | ✅ genau ein Feature |
| `initStateBinding` | pro Feld | ✅ |
| `initAddonDispatcher` | pro Klick | ✅ kein Init-Ausfall |
| `initToastSystem`, `initDebugPanel` | 1 Bedingung | ✅ |

## Wie man es prüft

Zwei Tests halten die Invariante (in `test/all.js`):

- `initSenderSync: ohne #unterschrift spiegelt der Name weiter`
- `initImportExport: ohne Import-Elemente exportiert der Knopf`

Wer eine `init*`-Funktion erweitert: **Test mit fehlendem Element** dazuschreiben.
Ein Guard, der mehr als ein Feature abschaltet, fällt dort sofort auf.
