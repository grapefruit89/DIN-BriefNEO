---
id: befundpruefung-2026-11-05
title: Befundprüfung — 22 offene Punkte, 2026-11-05
status: archived
type: reference
created: '2026-11-05'
updated: '2026-11-05'
tags:
- din-briefneo
- audit
- befunde
- pruefung
doc_links:
- '[[BACKLOG]]'
- '[[ARCHITECTURE-MAP]]'
- '[[STRUCTURE]]'
code_links: []
depends_on: []
supersedes: []
---

# Befundprüfung — 22 offene Punkte

**Datum:** 2026-11-05 · **Methode:** Jeder Befund gegen den Code geprüft, nicht übernommen.
**Ergebnis:** 11 bestätigt · 3 widerlegt · 1 teilweise · 7 bereits erledigt.

## Bereits erledigt (vor dieser Prüfung)

| Befunde | Commit |
| :--- | :--- |
| 1.1, 1.2, 1.3, 1.4 | `3ca5673` — Persistenz (Fusszeilen-Toggle, Datum, Anlagentext, `placed`) |
| 4.1, 4.2, 4.3, 4.5 | `aa4a39b` — Dead Code |
| 4.4, 4.6, 4.7 | `aa4a39b` — widerlegt und dokumentiert |
| 2.5 | dokumentiert in [[ARCHITECTURE-MAP]] (nicht repariert, Debug-only) |

## Doku vs. Code

| Nr | Verdikt | Beleg | Empfehlung |
| :--- | :--- | :--- | :--- |
| 6.1 | **bestätigt (Kritisch)** | `persistence.js:336` `DINLETTER_FORMAT='dinletter'`, `:483` lehnt alles andere ab. `llms.txt:20-21` zeigt nur `$schema` + `schema_version`, **kein** `format` | `llms.txt`-Beispiel um `"format": "dinletter"` ergänzen — oder `parse` akzeptiert `$schema` |
| 6.2 | **bestätigt (Niedrig)** | `persistence.js:302` `'DIN-BriefNEO Platinum V5'` vs. `index.html:18` `'Pure Refactored'` | Einen Namen wählen (SSoT) |
| 6.3 | **bestätigt (Niedrig)** | `salutation.js:3` sagt „Keine Namensliste"; `:69-70` `MALE_NAMES`/`FEMALE_NAMES`, je mehrere hundert Einträge | Kopfzeile korrigieren |

## Cross-Modul

| Nr | Verdikt | Beleg | Empfehlung |
| :--- | :--- | :--- | :--- |
| 2.1 | **widerlegt** | `data-dirty` kommt in `salutation.js` **nicht** vor (0 Treffer) | nichts tun |
| 2.2 | **bestätigt (Hoch)** | `document.js:324` `text.split('\n').length` — `textContent` enthält für `<br>` kein `\n` | Zeilen zählen über `innerText` oder `<br>`-Anzahl |
| 2.3 | **bestätigt (Mittel)** | `document.js:909-912` `pvSelect.selectedIndex = 0` bedingungslos | Setzen, wenn `postvermerk-visible` fehlt |
| 2.4 | **teilweise** | Nur **ein** `ResizeObserver` (`multipage-controller.js:134`); `main.js` nutzt `requestAnimationFrame`. CSS-Pflaster bestätigt (`sheet-multipage.css:626`) | Warnung in JS oder CSS, nicht beides |
| 2.5 | **bestätigt** | `debug-panel.js:11` `persistence.js?v=p1` vs. `main.js:10` ohne Query | dokumentiert; nicht reparieren |

## Testbrief

| Nr | Verdikt | Beleg | Empfehlung |
| :--- | :--- | :--- | :--- |
| 3.1 | **bestätigt (Hoch)** | 6 Funktionen doppelt: `main.js:354,373,387,417,437,447` ↔ `testbrief.js:406,425,439,469,489,503` | Run 2: Addon als einzige Quelle |
| 3.2 | **bestätigt (Hoch)** | `main.js:451` `plzNeuWuerfeln()`, `:480,:492` `resolveOrtZeile`; `testbrief.js:359-360` `resolveOrt`, ohne Neu-Würfeln | Run 2: eine Semantik |
| 3.3 | **bestätigt (Mittel)** | `main.js:5` statischer Import aus dem Addon | Run 2: dynamischer Import |
| 3.4 | **bestätigt (Mittel)** | `fetch('data/charaktere_konsolidiert.json')` in `main.js:357` und `testbrief.js:409` | Run 2: Pfad im Plugin |

## A11y / Semantik

| Nr | Verdikt | Beleg | Empfehlung |
| :--- | :--- | :--- | :--- |
| 5.1 | **bestätigt (Mittel)** | Kein `change`-Listener auf `toggle-modus` (`settings.js:128,133`); `aria-pressed` nur in `toggleSettingsModus:135` | `change`-Listener setzt `aria-pressed` |
| 5.2 | **bestätigt (Mittel)** | `index.html:326` `<din-anlagen-angabe id="anlagen-text"><li>` — `li` ohne `ul`/`ol` | `role="list"` + `role="listitem"` oder echtes `<ul>` |
| 5.3 | **bestätigt (Mittel)** | `document.js:486` repariert nur bei `children.length === 0`; `<div>`-Kinder bleiben | Bei Nicht-`li`-Kindern normalisieren |
| 5.4 | **bestätigt, kein Handlungsbedarf** | `index.html:97` `sr-only` + `tabindex="-1"`; `main.js:274-286` `click` + `change`; primär ist der Popover-Button | bewusst so lassen |

## Robustheit

| Nr | Verdikt | Beleg | Empfehlung |
| :--- | :--- | :--- | :--- |
| 7.1 | **bestätigt (Mittel)** | `persistence.js:30-38` `catch → ''` ohne `Intl`-Fallback; `buildDinLetterPayload` erzeugt dann `'T00:00:00Z'` | Fallback auf `Intl.DateTimeFormat` |
| 7.2 | **bestätigt (Mittel)** | `settings.js:559-583` `saveState()` ohne Rückgabeprüfung | `save()`-Ergebnis melden |
| 7.4 | **bestätigt (Niedrig)** | `persistence.js:720-724`: `handleExport` publiziert `DOCUMENT_SAVE_REQUESTED` und baut das Payload im nächsten Schritt direkt aus dem DOM (`buildDINLetterJSON(collectDraft)`). Der Save-Request ist für den Export funktionslos | Save-Request entfernen oder auf sein Ergebnis warten |

## Typografie / Absatzmodell

| Nr | Verdikt | Beleg | Empfehlung |
| :--- | :--- | :--- | :--- |
| 7.3 / 8.1 | **bestätigt (Hoch)** | `generateNerdText` liefert `\n\n`, `setField` setzt `textContent`; `#text` ist **ein** Block. Gemessen: 4 Zeilen ohne / 5 mit `pre-line` | Absätze als `<p>` — dann greifen `orphans`/`widows`/`pretty` je Absatz |
| 8.2 | **bestätigt (Mittel)** | `sheet-multipage.css:285-286` `orphans: 2`/`widows: 2` auf dem einen Block | nach 8.1 neu bewerten |
| 8.3 | **teilweise** | `#betreff` hat `text-wrap: balance` (`sheet.css:218`) ✓ · `#text` ohne eigenes `lang` ✓ · `pretty` = **Chrome 125+** laut Projekt-BCD (nicht 117) · Firefox unterstützt `orphans`/`widows` **nicht** (BCD) | Analyse-Korrekturen übernehmen |
| 8.4 | **widerlegt** | Keine `column-*` in `sheet-multipage.css`; `multipage-controller.js:42-66` zählt Seiten per JS (`--seite`, `--luecke`) und positioniert Folgeköpfe | Die Empfehlung „JS-Paginator" war richtig |

## Prüfer-Irrtümer (damit die Datei korrigierend wirkt)

1. **2.1** nennt `data-dirty` in `salutation.js` — existiert dort nicht.
2. **2.4** behauptet zwei `ResizeObserver` — es ist einer.
3. **8.4** behauptet CSS-Fragmentierung via `column-height`/`column-wrap` — existiert nicht; die Seite zählt per JS.
4. **8.3** nennt `pretty` = Chrome 117 und Firefox-Unterstützung für `orphans` — beides laut Projekt-BCD anders.
5. **3.1** zählt neun Duplikate — drei (`getCharHook`, `randomBetreff`, `generateNerdText`) waren bereits entfernt; es sind sechs.
