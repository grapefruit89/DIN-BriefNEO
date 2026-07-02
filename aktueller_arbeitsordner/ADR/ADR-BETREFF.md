---
tags: [obsidian, adr, ui, feature, betreff, print, pdf]
aliases: ["Betreff", "Falzmarken", "PDF-Export"]
---

# ADR: Betreff-Logik, Falzmarken und dynamischer PDF-Titel

## Kontext und Problem
1. **Falzmarken-Kollision:** Die Falzmarken (`.din-mark`) in `layout.css` waren versehentlich auf `width: 100%` gesetzt. Dadurch zogen sie sich als gestrichelte Linien quer über das gesamte Dokument und haben insbesondere den **[[Betreff]]** optisch durchschnitten.
2. **PDF-Export Dateiname:** Wenn der Nutzer den Brief via `window.print()` als PDF speichert (STRG + P -> "Als PDF speichern"), war der Standarddateiname der generische Name der Webseite. Gewünscht war eine automatische und dynamische Benennung nach dem Muster `YYYY-MM-DD_{empfänger} {Betreff}.pdf`.

## Entscheidung

### 1. Falzmarken (CSS)
Die Falzmarken (`.din-mark`) wurden chirurgisch auf `width: calc(8 / 210 * 100cqw);` gekürzt. Sie ragen nun exakt 8mm vom linken Rand herein und schneiden den **[[Betreff]]** nicht mehr durch.

### 2. Dynamischer PDF-Titel (JavaScript)
Es wurde eine zentrale Funktion `updateDocumentTitle()` in der `main.js` implementiert.
*   **Trigger:** Sie wird bei jedem Aufruf von `saveDraftData()` (also asynchron beim Tippen) und `loadDraftData()` (beim Laden) ausgeführt.
*   **Datenquellen:** Sie liest in Echtzeit `#betreff`, `#empfaenger-firma` und `#empfaenger-name` aus.
*   **Datum:** Gemäß der strikten Regel in [[ADR-ANTIPATTERN]] wird nach Möglichkeit **niemals** das veraltete `Date()` Objekt verwendet, sondern streng die W3C **Temporal API** (`Temporal.Now.plainDateISO().toString()`) genutzt. Sollte Temporal (wie auf manchen iOS Geräten ohne Polyfill) nicht greifen, sichert ein Date() Fallback die Funktionalität.
*   **Verhalten:** Das `<title>` Tag im HTML wird live manipuliert. Das zwingt den Chrome/Edge Print-Dialog beim "Als PDF speichern" dazu, diesen String als Standard-Dateinamen anzubieten.

## Konsequenzen
Jede zukünftige Logik, die sich auf den **[[Betreff]]** oder den Print-Dialog bezieht, muss dieses ADR kennen. Jegliche Versuche, den Dateinamen anders zu erzwingen (etwa via komplizierter `Blob` Erzeugung und unsichtbaren Download-Links) sind strengstens untersagt, da wir dem einfachen WYSIWYG + Print Paradigma treu bleiben.
