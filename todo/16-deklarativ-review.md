# 16 · Deklarativ-Review (JS statt CSS/HTML) — validiert

Status: abgeschlossen (Verdikte) · Geprüft: 2026-11-12 · Typ: audit · Erstellt: 2026-11-06
Quelle: vierte externe Ideenliste. Jeder Punkt gegen den Code geprueft.

## Validierung

| Behauptung | Verdikt | Beleg |
|---|---|---|
| Postvermerk-Popover baut natives select nach, ~80 Zeilen JS | wahr | syncPostvermerkFromSidebar 29 Zeilen (main.js:17-46) + Block main.js:279-328 |
| Das native select existiert bereits, inkl. Gruppen | wahr | index.html:98-116, zwei optgroup (Versandarten, Vertraulichkeit) |
| CSS nutzt bereits appearance: base-select | irrefuehrend | Die Regel haengt an .seitenleiste-select, das ist der BUTTON (index.html:118), nicht das select. ::picker(select) matcht dort nie |
| Save-Status: CSS nutzt Klasse und data-state | falsch | sidebar.css nutzt nur .save-status.saved/.dirty/.error; data-state ist im CSS unbenutzt |
| toggleSettingsModus setzt title und aria-label doppelt | wahr | settings.js:139-140 |
| updateFontStatusUI: Body-Klasse + Button-State | wahr, legitim | settings.js:234/237, 244/247 |
| debug-panel nutzt root.hidden | wahr, minimal | debug-panel.js:413, 784, 914, 948 |
| initApp 12 try/catch | bereits erfasst | siehe 23 (gemessen: 16 try / 18 catch) |

## Uebernommen

### 25 · Postvermerk-Popover durch natives select ersetzen

Befund: Das native select (index.html:98-116) enthaelt bereits alle Optionen in
zwei optgroup, exakt parallel zum Custom-Popover (index.html:123-158). Die
Custom-Loesung kostet ca. 80 Zeilen JS (main.js:17-46 und 279-328) plus ca. 40
Zeilen HTML (Button 118-120, Popover 123-158).

Wichtig, anders als in der Vorlage behauptet: Die base-select-Regeln sind NICHT
schon wirksam. .seitenleiste-select sitzt auf dem Button; appearance: base-select
und .seitenleiste-select::picker(select) laufen dort ins Leere, ebenso
:has(option:checked). Fuer den Umbau muss die Klasse auf das select wandern.

Aufwand: 1-2 Std. Zu beachten:
- label for="btn-postvermerk-trigger" (index.html:97) muss auf das select zeigen.
- syncPostvermerkFromSidebar reduziert sich auf select.value = val.
- toggle/aria-expanded, click-Handler, Arrow/Escape-Handler entfallen.
- base-select ist Chromium 135+; passt zur Chromium-only-Entscheidung aus 13.

### 26 · Save-Status: data-state ist toter Zustand

Befund: #setSaveStatus (document.js:1049-1061) setzt Klasse, dataset.state,
textContent, title und ariaNotify. Das CSS nutzt ausschliesslich
.save-status.saved/.dirty/.error; ein Selektor auf data-state existiert fuer
den Save-Status nicht. dataset.state ist damit wirkungslos.

Vorschlag: dataset.state entfernen (Klassen bleiben) oder CSS auf data-state
umstellen und Klassen entfernen. Nicht beides. Aufwand: 5 Min.

### 27 · toggleSettingsModus: title doppelt zu aria-label

Befund: settings.js:138-140 setzt aria-pressed, title und aria-label; title und
aria-label haben denselben Text. Screen-Reader lesen aria-label, der Tooltip
liest title. Ein Attribut weniger ist moeglich, aber kosmetisch.
Aufwand: 5 Min. Nur beim naechsten Anfassen von settings.js.

## Nicht uebernommen

- updateFontStatusUI (Body-Klasse + fontState): zwei verschiedene Ebenen, legitim.
- debug-panel root.hidden: minimal, kein Handlungsbedarf.
- initApp try/catch: bereits als 23 erfasst, keine Dublette.

## Bestaetigt (nichts zu tun)

Die Liste der nicht gefundenen Sunden deckt sich mit den Messungen aus 13:
0x style-Injection, adoptedStyleSheets vorhanden, keine display-Toggles,
keine innerWidth-Abfragen, kein matchMedia-Theme-Detection.

## Umsetzung 2026-11-07 (#25, #26, #27)

25: Das native `<select>` ist jetzt das sichtbare Bedienelement; Button, Popover,
`aria-selected`-Pflege und Tastatur-Handler sind entfallen (`website/index.html`,
`website/multipage.html`, `website/js/main.js`). Die `base-select`-Regeln wirken damit
erstmals, weil die Klasse am `<select>` hängt. Beim Restore setzt `DraftManager` die Liste
aus dem Feldtext.
26/27: `dataset.state` am Save-Status und das doppelte `title` am Settings-Schalter sind weg.
