# Spezifikation & Architekturkonzept: Mehrseitenunterstützung (DIN 5008 Folgeseiten)

> **Status:** Konzept & Spezifikation (Roadmap Priorität 1)  
> **Kontext:** DIN-BriefNEO Web Platform 2026  
> **Gültig für:** Zukünftige Implementierung (nicht im aktiven Core)  

---

## 1. Ausgangslage & Problemstellung

DIN-BriefNEO ist als nativer WYSIWYG-Editor für DIN-5008-konforme Briefe konzipiert. Bislang ist das Dokument strikt einseitig aufgebaut (`<din-a4 class="paper-theme page-1">`). 
Wenn ein Brieftext das verfügbare Kontingent von Seite 1 überschreitet, droht Überlauf oder Textkappung.

Ein DIN-5008-Brief über zwei oder mehr Seiten unterscheidet sich jedoch grundlegend von einer einfachen Textverarbeitung (wie MS Word):
1. **Seite 1 (Erstseite):** Trägt Anschriftfeld, Rücksendezeile, Falzmarken, Lochmarke und den vollständigen Infoblock (Absenderdaten).
2. **Folgeseiten (Seite 2+):** Haben **kein** Anschriftfeld, **keinen** Infoblock und **keine** Falzmarken, sondern zwingend einen normierten **Folgeseiten-Kopf** (Geschäftsangaben zur Zuordnung).
3. **Schlussblock (Grußformel, Unterschrift, Anlagen):** Muss immer auf die letzte Seite wandern, darf dort aber nach DIN 5008 niemals isoliert stehen (Schusterjungen-Regel: mindestens 2–3 Textzeilen vor der Grußformel).

Gleichzeitig verlangt die Architektur von DIN-BriefNEO:
- **Zero-Scroll-Doktrin:** Im interaktiven Viewport ist vertikales Scrollen physisch verboten (`overflow: clip; contain: strict;`).
- **Keine DOM-Messschleifen:** Teures JavaScript-Polling von Elementhöhen ist durch Law Catalog A49 strikt verboten.
- **Nativer Browser-Druck:** Erzeugung via `window.print()` ohne externe PDF-Bibliotheken.

---

## 2. Normative DIN-5008-Vorgaben für Folgeseiten

### 2.1 Zonen-Vergleich Erstseite vs. Folgeseite

```
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│ SEITE 1 (Erstseite)             │        │ SEITE 2+ (Folgeseite)           │
├─────────────────────────────────┤        ├─────────────────────────────────┤
│ • Falzmarken 1 & 2 (87/192 mm)  │        │ • Keine Anschriftzone           │
│ • Lochmarke (148,5 mm)          │        │ • Keine Falzmarken              │
│ • Rücksendezeile (5 mm Höhe)    │        │ • Optionale Lochmarke (148,5 mm)│
│ • Anschriftfeld (40 mm Höhe)    │        │ • Folgeseiten-Kopf (bei 20 mm): │
│ • Infoblock (Name, Tel, Mail)   │        │   - Empfänger oder Stichwort    │
│ • Datum (92 mm bzw. 74 mm)      │        │   - Datum (identisch Seite 1)   │
│ • Betreff & Anrede              │        │   - Seitennummer ("- 2 -")      │
│ • Brieftext (Beginn)            │        │ • Fortsetzung Brieftext         │
│ • Fußzeile                      │        │ • Grußformel & Unterschrift     │
│                                 │        │ • Anlagenvermerk                │
│                                 │        │ • Fußzeile                      │
└─────────────────────────────────┘        └─────────────────────────────────┘
```

### 2.2 Geometrie des Folgeseiten-Kopfes
- **Abstand oberer Blattrand:** 20 mm (nach DIN 5008).
- **Inhalt:**
  - Links: Name des Empfängers (oder Kurzbetreff)
  - Mitte / Rechts: Datum (z. B. `4. Oktober 2026`)
  - Rechtsbündig: Blatt-/Seitennummerierung (z. B. `Seite 2 von 2` oder `- 2 -`)
- **Unterer Abschluss:** Optional eine feine Haarlinie (0,5 pt) oder 1 Leerzeile Abstand zum fortgesetzten Text.

---

## 3. UI- & Interaktionskonzept im Editor (Zero-Scroll-Garantie)

Da die App-Shell und der Viewport kein vertikales Dokument-Scrolling erlauben, wird das **Horizontale Paging-Prinzip (Karussell-Stepper)** eingesetzt:

### 3.1 Virtuelle Bühne & Seiten-Stepper
- Der Viewport zeigt zu jedem Zeitpunkt genau **ein physisches Blatt** in nativer A4-Proportion (`aspect-ratio: 210 / 297`).
- Im Viewport-Kopf oder im Footer der Arbeitsfläche befindet sich ein kompakter, schwebender Paging-Balken:
  ```
  [ ◄ Seite 1 ]   Seite 1 von 2   [ Seite 2 ► ]   [ + Seite hinzufügen ]
  ```
- **Tastatur-Navigation:** <kbd>Bild Auf</kbd> / <kbd>Bild Ab</kbd> oder <kbd>Alt</kbd>+<kbd>◄</kbd> / <kbd>Alt</kbd>+<kbd>►</kbd>.
- **Zustandsübergang:** Der Wechsel zwischen Seiten nutzt deklarativ die View Transitions API:
  ```javascript
  document.startViewTransition(() => {
    setActivePage(targetPageIndex);
  });
  ```
  Dadurch gleitet die neue Seite horizontal oder weich überblendet in den Viewport, ohne das Layout-Containment zu brechen.

---

## 4. Textfluss-Modelle (Evaluierung & Architekturentscheidung)

Das Web-Platform-Problem: Es gibt im interaktiven DOM keinen standardisierten Mechanismus für automatischen Element-zu-Element-Textüberlauf (CSS Regions ist obsolet).

### Modell 1: Explizite Folgeseite (WYSIWYG-Doktrin — EMPFOHLEN)
- **Mechanik:** Jede Seite besitzt ihr eigenes, begrenztes `<din-text>`-Feld (`text-1`, `text-2`).
- Wenn der Text auf Seite 1 das Blatt füllt, drückt der Nutzer <kbd>Strg</kbd>+<kbd>Enter</kbd> (oder den Button *Folgeseite hinzufügen*).
- Der Folgetext wird auf Seite 2 weitergeschrieben.
- **Vorteile:**
  - 100 % deterministisch, 0 ms Rechenzeit, keine DOM-Messschleifen (A49-konform).
  - Keine Cursor-Sprünge oder Layout-Ruckler beim schnellen Tippen.
  - Volle Kontrolle des Nutzers über Absatzumbrüche (kein unschöner automatischer Umbruch mitten im Satz).

### Modell 2: Automatischer JS-Paginator (NICHT empfohlen)
- Ein einziges virtuelles Textfeld. Ein Skript misst per Binary Search und Range API fortlaufend die Absatzhöhen und zerlegt Text in mehrere Blöcke.
- **Nachteile:** Extrem fehleranfällig bei Undo/Redo, zerstört natives Tastatur-Handling, verletzt das Verbot von DOM-Messschleifen (Catalog A49).

---

## 5. Druck-Architektur (`print.css` & `window.print()`)

Im Druck-Modus (`@media print`) entfällt die Einschränkung des Viewports. Hier werden alle existierenden Seiten nacheinander gerendert:

```css
@media print {
  /* Alle Seiten für den Druck sichtbar schalten */
  din-a4 {
    display: block !important;
    page-break-after: always;
    break-after: page;
    margin: 0 !important;
    width: calc(210 * 1mm) !important;
    height: calc(297 * 1mm) !important;
  }

  /* Verhindert eine leere Geisterseite am Ende des PDFs */
  din-a4:last-of-type {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Folgeseiten-Regeln via Scoping */
  din-a4.folgeseite din-anschriftfeld,
  din-a4.folgeseite din-infoblock,
  din-a4.folgeseite din-rucksendezeile,
  din-a4.folgeseite din-falz-oben,
  din-a4.folgeseite din-falz-unten {
    display: none !important;
  }

  din-a4.folgeseite din-folgekopf {
    display: flex !important;
  }
}
```

---

## 6. Datenmodell & Persistenz

### 6.1 Draft-Serialisierung (`01-draft-manager.js`)
Das Draft-Objekt im `localStorage` (`din_draft_current`) erweitert sich um Folgeseiten-Felder, bleibt für Seite 1 jedoch identisch:
```json
{
  "betreff": "Kündigung Vertrag ...",
  "anrede": "Sehr geehrte Damen und Herren,",
  "text": "Absatz 1 auf Seite 1 ...",
  "page_count": 2,
  "text_p2": "Fortsetzung auf Seite 2 ...",
  "grussformel": "Mit freundlichen Grüßen",
  "unterschrift": "Moritz Baumeister"
}
```

### 6.2 Abwärtskompatibilität
- Bestehende 1-Seiten-Entwürfe ohne `page_count` öffnen standardmäßig Seite 1 (`page_count = 1`).
- Alte Backups (`.json`) lassen sich ohne Datenverlust oder Migration weiter importieren.

---

## 7. Phasenplan zur späteren Umsetzung

1. **Phase 1: Folgeseiten-Geometrie in CSS & IMR**
   - Definition von `<din-folgekopf>` und Scoped Rules in `sheet.css` und `print.css`.
   - Null-JS-Drucktest mit statischem 2-Seiten-HTML.
2. **Phase 2: Seiten-Stepper & View Transition im Editor**
   - Horizontaler Paging-Balken ohne Viewport-Scrolling.
   - Umschalten von `data-active-page="1"` auf `data-active-page="2"`.
3. **Phase 3: Dynamischer Schlussblock-Umzug**
   - Grußformel und Unterschrift automatisch am Ende der letzten Seite platzieren.
4. **Phase 4: Draft-Persistenz & Export-Update**
   - Unterstützung für `text_p2` in `01-draft-manager.js` und `52-import-export.js`.
