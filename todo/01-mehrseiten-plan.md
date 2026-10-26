---
status: draft
type: concept
tags: [din5008, briefneo, plan, mehrseiten]
summary: "Plan zur Mehrseitenunterstützung nach DIN 5008 für den DIN-BriefNEO-Generator."
---

# Mehrseitenunterstützung nach DIN 5008 – Plan für DIN-BriefNEO (Baseline Chrome 150+)

**Ziel:** Briefe über mehrere DIN-A4-Seiten hinweg normgerecht nach DIN 5008:2020-03 bearbeiten, drucken und als PDF exportieren können – unter strikter Einhaltung der Projekt-Invarianten (Zero-Scroll **A43**, eindeutige IDs **A42**, kein DOM-Layout-Polling beim Tippen **A49**, `@page { margin: 0 }`-Vermaßung).

---

## 1. Was DIN 5008 für mehrseitige Briefe verlangt (Fachlicher Rahmen)

1. **Falz- und Lochmarken auf jeder Seite:**
   - Der Normbriefbogen nach DIN 5008 definiert die Marken pro Blatt – bei einem mehrseitigen Brief trägt **jede** Seite die Falzmarken (Form A: 87 mm und 192 mm; Form B: 105 mm und 210 mm von oben) sowie die Lochmarke bei 148,5 mm.
   - Da `<din-falz-oben>`, `<din-falz-unten>` und `<din-lochmarke>` Custom Elements **ohne `id`** sind, werden sie in jeder `<din-a4>`-Instanz gerendert und erben automatisch die Form-A/B-Geometrie aus `website/css/sheet.css`.
2. **Folgeseiten-Kopf & Seitenzahl (ab Seite 2):**
   - Empfängeranschrift, Infoblock und großer Briefkopf erscheinen nur auf Seite 1.
   - Ab Seite 2 sitzt bei **20 mm** von der oberen Blattkante ein reduzierter **Folgeseiten-Kopf** (`<din-folgeseitenkopf data-top-mm="20">`): links Absender-Kurzbezeichnung / Empfänger / Betreff, rechtsbündig die Seitenzahl („Seite 2 von 2").
3. **Fortsetzungsvermerk (`...`):**
   - Am Ende der ersten Seite (und jeder Nicht-Letztseite) wird nach mindestens einer Leerzeile rechtsbündig der Hinweis auf eine Folgeseite (**drei Punkte `...`**) gesetzt.
   - **Deklarative Umsetzung (0 Zeilen JS via `:has()`):**
     ```css
     din-fortsetzungsvermerk { display: none; }
     #viewport:has(din-a4[data-page="2"]) din-a4[data-page="1"] din-fortsetzungsvermerk {
       display: block;
     }
     ```
4. **Schlussblock-Integrität (Schusterjungen-/Hurenkinder-Regel):**
   - Grußformel (`#grussformel`), Unterschrift (`.unterschrift-zeile`, `#unterschriftsbild-container`) und Anlagenvermerk (`#anlagen`) gehören immer auf die **letzte** aktive Seite und werden im Druck über `break-inside: avoid` / `break-after: avoid` zusammengehalten.

---

## 2. Druck-/PDF-Paginierung vs. `@page { margin: 0 }` Guard

### Warum DOM-Folgekopf statt `@page` Margin Boxes (`@top-right`)
Chrome 131+ / 150+ unterstützt zwar nativ `@page`-Margin-Boxen (`@top-right { content: "Seite " counter(page) " von " counter(pages); }`). In DIN-BriefNEO gilt jedoch in [`/home/moritz/repos/DIN-BriefNEO/website/css/print.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/print.css) der unantastbare **Architectural Guard**:
```css
@page {
  size: A4;
  margin: 0;
  page-margin-safety: auto;
}
```
- **Technischer Grund:** Alle `attr(data-*-mm)`-Koordinaten auf `<din-a4>` messen vom physischen Blattrand (`0mm`). Bei `margin: 0` haben `@page`-Margin-Boxen wie `@top-right` eine Höhe von `0mm` (unsichtbar). Ein `margin-top: 20mm` auf `@page` würde das gesamte Koordinatensystem der Folgeseite inklusive Falz- und Lochmarken um 20 mm nach unten verschieben.
- **Lösung:** Der Folgeseiten-Kopf inkl. Seitenzahl liegt als reguläres DOM-Element `<din-folgeseitenkopf>` direkt **innerhalb** von `<din-a4 data-page="2">`.
  - `@page { margin: 0 }` bleibt 100 % unangetastet.
  - Falz- und Lochmarken sitzen auf allen Seiten millimetergenau an derselben Stelle.
  - Echtes **WYSIWYG**: Der Nutzer sieht den Folgekopf und die Seitenzahl bereits live im Editor und nicht erst in der Druckvorschau.

### Druck-Umbruch in `website/css/print.css`
Aktuell steht in `website/css/print.css` `din-a4 { page-break-after: avoid; }`. Für Mehrseitigkeit wird dies präzisiert zu:
```css
din-a4 {
  break-after: page;
  page-break-after: always;
}
din-a4:last-of-type {
  break-after: avoid;
  page-break-after: avoid;
}
```

---

## 3. Bildschirm-Paginierung: Strategie A (Statische `<din-a4>`-Container + Paging-Karussell)

### Warum Strategie A statt virtueller Paginierung (Strategie B)
- Eine virtuelle Paginierungs-Engine (wie Tiptap Pages / Google Docs) mit dynamischer Zeilenmessung und automatischem Hin-und-her-Schieben von DOM-Knoten während des Tippens verstößt gegen **Gesetz A49** (kein DOM-Layout-Polling) und zerstört Caret-Positionen, Selektionen sowie den Undo-Stack.
- Ein Geschäftsbrief umfasst in 99 % der Fälle 1 Seite und im Ausnahmefall 2 Seiten.

### Konkrete Editor-Mechanik
1. **Zero-Scroll-Garantie (A43) durch Paging-Stepper:**
   - Im `#viewport` ist am Bildschirm immer genau **eine** `<din-a4>`-Seite aktiv sichtbar (damit die `100cqh`-Skalierung erhalten bleibt).
   - Ein kompakter Umschalter (`[ Seite 1 ] [ + Folgeseite / Seite 2 ]` bzw. `Strg+Enter`) wechselt zwischen den Seiten per nativer **View Transitions API** (`document.startViewTransition()`).
   - Im `@media print` werden alle vorhandenen `<din-a4>`-Seiten untereinander ausgegeben.
2. **Einhaltung von Gesetz A42 (Keine doppelten IDs):**
   - Seite 1 behält ihre kanonischen IDs (`#anschriftfeld`, `#betreff`, `#text` usw.).
   - Seite 2 (`<din-a4 data-page="2">`) nutzt eigene eindeutige IDs (z. B. `#text-folge-2`, `#folgeseitenkopf-2`) und gemeinsame `data-feldtyp`-Attribute (`data-feldtyp="rich"`), sodass `DraftManager` und `UIProtections` ohne Code-Duplizierung greifen.
3. **Visuelle Überlauf-Erkennung statt Zwangs-Splitting:**
   - Überschreitet `#text` auf Seite 1 die verfügbare Texthöhe (`scrollHeight > clientHeight`), erscheint am unteren Feldrand ein dezenter Hinweis (*„Seite 1 voll — Folgeseite anlegen"*), ohne dem Nutzer während des Tippens Text unter dem Cursor wegzureißen.

---

## 4. Datenmodell (`DraftManager` & `.dinbrief.json`)

- Abwärtskompatible Erweiterung des Draft-Payloads um `pages` (bzw. `text_page_2`), wobei bestehende einseitige `.json`-Entwürfe beim Import nahtlos als 1-Seiten-Brief geladen werden.

---

## 5. Konkrete Umsetzungs-Reihenfolge

1. **Schritt 1 — Druck-CSS (`website/css/print.css`):**
   - `din-a4 { break-after: page; }` + `din-a4:last-of-type { break-after: avoid; }` einrichten.
   - Sicherstellen, dass im Druck alle aktiven `<din-a4>`-Elemente unabhängig vom Editor-Tab sichtbar sind.
2. **Schritt 2 — Zweiter `<din-a4 data-page="2">`-Container & Geometrie (`website/index.html`, `website/css/sheet.css`):**
   - `<din-falz-oben>`, `<din-lochmarke>`, `<din-falz-unten>` für Seite 2.
   - `<din-folgeseitenkopf>` bei `data-top-mm="20"` mit Seitenzahl.
   - `<din-fortsetzungsvermerk>` (`...`) auf Seite 1 per `:has()` koppeln.
   - Schlussblock (`#grussformel`, Unterschrift, `#anlagen`) bei aktiver Folgeseite auf Seite 2 positionieren.
3. **Schritt 3 — Paging-Steuerung & Persistenz (`website/js/document.js`, `website/js/main.js`):**
   - Schalter „+ Folgeseite" und Seitenwechsel `[ Seite 1 | Seite 2 ]` mit View Transitions.
   - Speichern/Laden des Folgeseiten-Textes im `DraftManager` und `.dinbrief.json`-Export.

---

## 6. Verifizierte Upstream-Quellen

| Thema | Quelle | Relevanz für DIN-BriefNEO |
|---|---|---|
| Chrome 131+: `@page` & Paged Media | [Chrome for Developers: Print Margins](https://developer.chrome.com/blog/print-margins) | Erklärt `@page`-Geometrie, Margin-Box-Modell und `counter(page)`/`counter(pages)` |
| Chrome 150+: `page-margin-safety` | [W3C CSS Paged Media Level 3](https://drafts.csswg.org/css-page-3/) | Basis für den bestehenden `@page { size: A4; margin: 0; page-margin-safety: auto; }` Guard |
| CSS Fragmentation Level 3 | [W3C CSS Fragmentation](https://drafts.csswg.org/css-break/) | Spezifikation für `break-before`, `break-after`, `break-inside`, `orphans`, `widows` |
| CSS Paged Media vs. Paged.js | [Doppio Guide](https://doppio.sh/guide/css-paged-media-vs-pagedjs) | Abgrenzung nativer Browser-Fähigkeiten vs. JS-Polyfills |
| DIN 5008 Falz- & Lochmarken | [Wikipedia: Falzmarke (DIN 5008)](https://de.wikipedia.org/wiki/Falzmarke) | Normpositionen Form A (87/192 mm) und Form B (105/210 mm), Lochmarke (148,5 mm) |
| LibreOffice DIN-5008-Vorlage | [Document Foundation Wiki](https://wiki.documentfoundation.org) | Referenz für abweichende Folgeseiten-Vorlage (Folgekopf ab Seite 2) |
| View Transitions API | [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) | Flüssiger Seitenwechsel im Editor ohne Scroll-Bruch |
