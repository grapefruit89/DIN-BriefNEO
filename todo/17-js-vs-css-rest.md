# 17 · JS-macht-CSS: Restbestand (validiert)

Status: abgeschlossen (Verdikte) · Geprüft: 2026-11-12 · Typ: audit · Erstellt: 2026-11-06
Quelle: Nachmessung nach 16. Gesucht: JS, das native CSS/HTML-Aufgaben nachbaut.

## Korrektur zur Vorrunde

Die Vorrunde behauptete, es gebe keine innerWidth-Abfragen und keine
resize-Listener. Das ist falsch:

- window.innerWidth: 8 Vorkommen, davon 3 in address.js (893, 1006, 1183),
  5 in debug-panel.js.
- addEventListener('resize'): 2 (multipage-controller.js:144, debug-panel.js).
- matchMedia: 1 (settings.js, prefers-reduced-motion; legitim).

## Treffer (aufgenommen)

### 28 · Toter .active-Fallback nach showPopover()

address.js:1712-1738: nach popover.showPopover() bzw. hidePopover() wird im
catch-Zweig popover.classList.add/remove('active') gesetzt. Fuer den
Clipboard-Popover existiert kein CSS zu .active; in Chromium wirft showPopover
nicht. Der Fallback ist toter Code.

Aufwand: XS.

### 29 · Signatur-Bbox per globalem pointerdown statt CSS

settings.js:459-468: ein document-weiter pointerdown-Handler prueft
bbox.contains(target) und setzt .active. CSS-Regeln dafuer existieren
(sheet.css:550, sheet-multipage.css:602). Die Zusatzbedingung ist nur
"Bild vorhanden". Das laesst sich als [data-has-image="true"] plus :hover /
:focus-within abbilden; der globale Listener entfaellt.

Aufwand: S. Gewinn: ein document-Listener weniger.

### 30 · Typklassen nur in einer von zwei Listen gestylt

address.js:1087-1093: fuenfzweigiges if/else setzt ac-firma, ac-behoerde,
ac-gericht, ac-institution, ac-city. #renderUniversalSuggestions bedient BEIDE
Popover (isPlzList-Flag), aber CSS existiert nur unter
#plz-suggestions-popover (sidebar.css:1308-1312). Im Haupt-Popover
#anschrift-vorschlaege sind die Klassen wirkungslos.
Vorschlag: data-typ setzen und CSS fuer beide Listen, oder Klassen im
Haupt-Popover streichen.

Aufwand: XS.

### 31 · Redundanter window.resize-Listener

multipage-controller.js:143-144: ResizeObserver(kern) UND
window.addEventListener('resize', aktualisieren). Der Fenster-Listener ist
vermutlich redundant, weil die Seitenbreite in mm konstant ist.
Aufwand: XS. Beim Entfernen Druckpfad (beforeprint) mitpruefen.

### 32 · Breakpoint 600px dreimal dupliziert (Randfund, kein CSS-Fall)

address.js:893, 1006, 1183: window.innerWidth < 600 ? 8 : 12.
Die Zahl der Vorschlaege ist Datenlogik, nicht Layout; CSS kann das nicht.
Aber der Breakpoint gehoert zentral definiert. Aufwand: XS.

## Geprueft, kein Handlungsbedarf

- style.setProperty in settings.js:232/242 (Schriftfamilie) und 560-563
  (Signaturposition x/y/scale/rot): dynamische Werte, CSS kann das nicht.
- main.js:150/158 panel.hidden = false: Debug-Panel-Aktivierung, legitim.
- main.js:357 btnTestbrief.disabled = true: legitim.
- aria-selected/aria-expanded/aria-activedescendant in address.js: korrekte
  Combobox-A11y, nicht durch CSS ersetzbar.
- dataset.dirty/generated in document.js und salutation.js: Zustand fuer CSS,
  legitim.

## Umsetzung 2026-11-07 (#28, #31, #32)

28: `.active`-Fallback nach `showPopover()` entfernt.
31: `window.addEventListener('resize', …)` entfernt; `ResizeObserver` und `beforeprint` bleiben.
32: `maxSuggestions()` bündelt Breakpoint und Limits (`website/js/address.js`).
