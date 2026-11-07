# 22 · Mikro-Optimierungen (aus dem Durchsehen)

Status: offen · Typ: audit · Erstellt: 2026-11-06
Quelle: Sichtprüfung beim Durchsehen, keine externe Liste.

## Korrektur (kein TODO)

Dead-Code-Audit vom 2026-11-05, Befund 4.3 (Schwere "Hoch"): "js/boot-theme.js
wird nicht geladen" und "der Inline-Block setzt nur data-theme, nicht data-style".
Ueberholt: index.html:24 laedt js/boot-theme.js?v=live6, boot-theme.js:16-17 setzt
data-theme und data-style. Kein Handlungsbedarf. Das Audit bleibt als Snapshot
unveraendert.

## 43 · #moveCaretToEnd-Wrapper entfernen

address.js:18 importiert setCaretToEnd aus document.js. address.js:1216-1218
definiert zusaetzlich #moveCaretToEnd, das ausschliesslich delegiert.
Aufrufe: address.js:971 und 1162.
Vorschlag: Wrapper streichen, direkt setCaretToEnd aufrufen.
Aufwand: XS.

## 44 · Magic Numbers 50 und 130 als Konstanten

document.js:403 und 437: Fallback 50 fuer single-line-Felder, wenn kein Eintrag
in FIELD_MAX_LENGTHS existiert. document.js:406: Fallback 130 fuer eingefuegten
Text. Beide Zahlen stehen inline.
Vorschlag: benannte Konstanten (z. B. SINGLE_LINE_MAX = 50, PASTE_MAX = 130)
neben FIELD_MAX_LENGTHS.
Aufwand: XS.

## 45 · getElementById-Wiederholungen in address.js

Gemessen: empfaenger-ort 3x, empfaenger-strasse 3x, empfaenger-firma 2x,
plz-suggestions-popover 2x, absender-ort 2x, rucksendeangabe 2x,
anschrift-vorschlaege 2x, input-geoapify-key 2x.
Kein Fehler (id-Lookup ist billig), aber pro Funktion einmal aufloesen statt
mehrfach. Keine modulweiten Vorab-Caches, nur innerhalb eines Funktionslaufs.
Aufwand: XS, optional.

## Umsetzung 2026-11-07

43 und 44 sind umgesetzt: `#moveCaretToEnd` ist entfallen (beide Aufrufstellen rufen
`setCaretToEnd` direkt), die Fallbacks 50/130 heißen jetzt `SINGLE_LINE_MAX` und
`TWO_LINE_PASTE_MAX` (`website/js/document.js`).
