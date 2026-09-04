# Intelligente Formular-Orchestrierung: Top-Down vs. Bottom-Up Eingabe

> **Status:** UX- & Architektur-Konzept (Reine Recherche, keine Änderungen am Produktiv-Repository).  
> **Kernfrage:** Nutzer beginnen unterschiedlich (manche bei der Straße, manche bei PLZ/Ort). Wie nutzen wir beide Wege maximal intelligent?

---

## 1. Die zwei realen Nutzertypen beim Briefschreiben

Auf dem DIN-5008-Briefbogen gibt es zwei getrennte Anschriftenzeilen:
```text
[Zeile 1]: empfaenger-strasse (z. B. "Adenauerallee 10")
[Zeile 2]: empfaenger-ort     (z. B. "53113 Bonn")
```

Beobachtet man Anwender, teilen sie sich in zwei Gruppen:

| Typ | Vorgehensweise | Psychologischer Grund |
| :--- | :--- | :--- |
| **Typ A: "Top-Down" (Klassisch)** | Fängt oben bei **Straße & Hausnummer** an, wechselt danach zu PLZ & Ort. | Gewohnte westliche Leserichtung (von oben nach unten). |
| **Typ B: "Bottom-Up" (PLZ-First)** | Fängt unten bei der **PLZ** an, weil Zahlen schneller getippt sind. | Weiß, dass die PLZ den Ort eindeutig definiert. |

Anstatt den Nutzer in ein starres Schema zu zwingen, können wir die Daten beider Wege **synergetisch miteinander verknüpfen**.

---

## 2. Der "Context-Boost": Was passiert bei Typ B (Erst PLZ / Ort)?

Das ist der genialste Hebel für Performance und Genauigkeit:

```text
1. Nutzer klickt in 'empfaenger-ort' und tippt "53111".
2. Lokale 20-KB Brotli-Tabelle ergänzt SOFORT (0 ms Latenz): "53111 Bonn".
3. SYSTEM-EFFEKT: Die App merkt sich den Kontext "Bonn" (und 53111).
4. Nutzer springt jetzt in 'empfaenger-strasse' und tippt "Post...".
5. ERGEBNIS: Die Straßen-API (Geoapify/HERE/Photon) sucht ab sofort
   NICHT mehr in ganz Deutschland, sondern EXKLUSIV im Radius von Bonn!
```

### Die massiven Vorteile von Szenario B:
- **Null Fehlstreuung:** Keine Verwechslung mit der Poststraße in Berlin, Hamburg oder Dresden.
- **Höchste Trefferrate:** Bereits nach 3 Buchstaben („Pos“) steht die Bonner Poststraße auf Platz 1.
- **Kürzere Suchzeit:** Der Suchfilter schrumpft den Suchbaum der API auf das Stadtgebiet zusammen.

---

## 3. Der "Auto-Fill-Sprint": Was passiert bei Typ A (Erst Straße & Hausnummer)?

Beginnt der Nutzer ganz klassisch oben bei der Straße:

```text
1. Nutzer klickt in 'empfaenger-strasse' und tippt "Adenauerallee 10".
2. Die Suche nutzt den Standard-Bonn-Bias (oder den Wohnort des Absenders).
3. Bonn-Treffer stehen ganz oben: "Adenauerallee 10, 53113 Bonn".
4. Klickt der Nutzer den Vorschlag an:
   ➔ 'empfaenger-strasse' erhält: "Adenauerallee 10"
   ➔ 'empfaenger-ort'     erhält: "53113 Bonn" (Vollautomatisch!)
5. Nutzer spart sich die gesamte Eingabe des zweiten Feldes!
```

---

## 4. Was passiert bei reinen Hand-Tippern (ohne Dropdown-Klick)?

Manche Nutzer ignorieren Autocomplete-Dropdowns und tippen einfach alles blind ein:
1. Der Nutzer tippt in die Straße: `Kaiserstraße 12`.
2. Er drückt `Tab` oder klickt in das Feld `PLZ & Ort`.
3. Er tippt: `53113`.
4. Die lokale Brotli-Tabelle erkennt nach der 5. Ziffer `53113` und hängt automatisch `Bonn` an (Ergebnis: `53113 Bonn`).
5. **Nutzen:** Der Nutzer spart sich das Tippen des Städtenamens und vertippt sich garantiert nicht im Ortsnamen.

---

## 5. Das Orchestrierungs-Fazit

```text
                         [Eingabe-Start]
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
[Nutzer startet bei PLZ]                   [Nutzer startet bei Straße]
          │                                           │
  0 ms Brotli-Lookup                          API mit Bonn-Bias
  ➔ Ergänzt Ort sofort                        ➔ Zeigt Straßen an
          │                                           │
  Setzt "Stadt-Kontext"                       Bei Klick: Befüllt
  für spätere Straßensuche                    BEIDE Felder sofort!
```

Egal wo der Nutzer beginnt:
- Fängt er bei der **PLZ** an, wird die Straßensuche durch den lokalen Kontext **ultra-präzise und lokal fixiert**.
- Fängt er bei der **Straße** an, wird das PLZ-Feld durch den Klick **automatisch mit ausgefüllt**.

---

## 6. Die Kaskaden-Falle: Warum Geoapify NIEMALS Brotli triggern darf

Die Frage des Anwenders: *„Wenn ich eine Straße eintippe (z. B. Droste-Hülshoff-Straße 9-5, 46359 Heiden), triggert dann Geoapify, setzt die PLZ ein, und wenn die PLZ steht, triggert Brotli und setzt den Ort ein? Ist das so falsch?“*

**Antwort: Ja, eine solche Kaskade wäre grundlegend falsch!**

### Warum das falsch und gefährlich wäre:
1. **Geoapify weiß den Ort bereits:**
   Wenn der Nutzer `Droste-Hülshoff-Straße 9-5, 46359 Heiden` auswählt, liefert die Geoapify-API bereits das vollständige Geocoder-Objekt zurück:
   - `postcode`: `46359`
   - `city`: `Heiden`
   - `street`: `Droste-Hülshoff-Straße`
   - `housenumber`: `9-5`
   Geoapify muss also gar nicht erst „nur die PLZ setzen, damit ein zweiter Mechanismus den Ort sucht“. Geoapify befüllt **in einem einzigen atomaren Schritt beide Felder** (`empfaenger-strasse` und `empfaenger-ort = "46359 Heiden"`).
2. **Gefahr von Event-Schleifen (Event Ping-Pong):**
   Würde das programmatische Setzen des PLZ-Feldes ein künstliches `input`-Event auslösen, würde Brotli unnötig losrechnen, obwohl der Ort bereits da ist.
3. **Gefahr von Ortsteil-Überschreibungen:**
   Einige deutsche Postleitzahlen teilen sich mehrere Ortsteile. Geoapify weiß aus der exakten Hausnummer-Georeferenzierung exakt, welcher Ortsteil gemeint ist. Würde danach unkontrolliert Brotli anspringen, könnte es den präzisen Ortsteil mit dem statistischen Hauptort überschreiben!

### Die saubere Lösung: Event-Guards (`isTrusted`)
- **Brotli hört AUSSCHLIESSLICH auf echte Handeingaben des Nutzers:**
  `if (!event.isTrusted) return;`  
  Brotli wird **nur dann** aktiv, wenn der Nutzer tatsächlich physisch mit den Fingern im Feld `empfaenger-ort` Ziffern eintippt.
- **Geoapify setzt beide Felder programmgesteuert („silent update“):**
  Wird ein Adressvorschlag angeklickt, schreibt der Geoapify-Handler Straße, PLZ und Ort direkt in die DOM-Elemente, **ohne** ein synthetisches `input`-Event für Brotli auszulösen.
- **Kopiert der Nutzer die ganze Zeile ins Straßenfeld:**
  Fügt der Nutzer den String `Droste-Hülshoff-Straße 9-5, 46359 Heiden` per Zwischenablage ein, trennt unser Zwischenablage-Parser die Bestandteile sofort auf und befüllt Straße, PLZ und Ort sauber parallel.
