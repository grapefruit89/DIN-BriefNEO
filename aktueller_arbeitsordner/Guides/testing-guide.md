---
title: Interaktiver Test-Leitfaden: testing-guide.md
status: active
tags: [documentation, guide, manual]
---

# Interaktiver Test-Leitfaden: testing-guide.md

Dieser Testing-Guide beschreibt alle manuellen Testfälle, um die Refactored Baseline-Features (Feature 1 bis Feature 6) von **DIN-BriefNEO** systematisch und reproduzierbar auf Fehler zu überprüfen.

---

## 🧪 Manuelle Testfälle (QA-Protokoll)

### Testfall 1: Plaintext-Paste-Filter
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist leer oder befüllt.
*   **Aktion:** 
    1. Öffne eine beliebige Webseite oder ein Word-Dokument.
    2. Markiere einen Absatz mit verschiedenen Schriftgrößen, bunten Farben und HTML-Links und kopiere diesen in die Zwischenablage (`Strg+C`).
    3. Setze den Cursor in das Brieftext-Feld und füge den Text mit `Strg+V` ein.
*   **Erwartetes Ergebnis:** 
    - Der Text wird eingefügt, aber **bedingungslos von allen Formatierungen, Farben, fremden Schriften und Links befreit**.
    - Es erscheint reiner Plaintext, der sich nahtlos an die Typografie des Briefbogens anpasst.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 2: Plaintext-Drag-and-Drop-Filter
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist aktiv.
*   **Aktion:** 
    1. Markiere einen formatierten Textbereich in einem separaten Browser-Tab oder Word-Dokument.
    2. Ziehe diesen Text per Drag-and-Drop direkt mit der Maus in das Brieftext-Feld.
*   **Erwartetes Ergebnis:** 
    - Der Text wird an der Position des Mauszeigers eingefügt.
    - Alle HTML-Stile, Farben und Format-Reste sind rückstandslos entfernt. Nur reiner Text wird im Brief abgelegt.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 3: WhatsApp-Style Selection Popover Toolbar
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Der Brieftext enthält Text.
*   **Aktion:** 
    1. Markiere ein oder mehrere Wörter im Brieftext mit der Maus oder Tastatur.
    2. Achte auf das Erscheinen der schwebenden Toolbar (`#format-toolbar`).
    3. Klicke auf den Button **B** (Fett) oder **U** (Unterstrichen).
    4. Hebe die Markierung auf und markiere den formatierten Bereich erneut.
*   **Erwartetes Ergebnis:** 
    - Die Toolbar schwebt präzise zentriert über der Textauswahl im globalen Top-Layer.
    - Bei Klick auf **B** wird der Text fett; bei Klick auf **U** unterstrichen.
    - Beim erneuten Markieren leuchtet der entsprechende Button im Popover smaragdgrün auf und signalisiert den aktiven Status.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 4: Blockquote-Toggling (Range API Unwrap)
*   **Kategorie:** Text-Eingabe & Formatierung
*   **Ausgangssituation:** Ein Absatz im Brieftext ist markiert.
*   **Aktion:** 
    1. Klicke in der schwebenden Toolbar auf das Zitat-Symbol **»**.
    2. Markiere denselben Zitatbereich erneut und klicke nochmals auf **»**.
*   **Erwartetes Ergebnis:** 
    - Beim ersten Klick wird der markierte Bereich in ein graues, eingerücktes `<blockquote>` (Zitat) gewrappt.
    - Beim zweiten Klick wird das Zitat aufgelöst (Unwrap) und wieder in normalen Fließtext überführt – ohne den Text zu verdoppeln oder zu beschädigen.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 5: Toast-Notification Queue (Stacking-Schutz)
*   **Kategorie:** UI-Komponenten
*   **Ausgangssituation:** Die Sidebar ist geöffnet.
*   **Aktion:** 
    1. Klicke in der Sidebar extrem schnell hintereinander (5- bis 10-mal) auf den Layout-Button **Form A** und **Form B**.
*   **Erwartetes Ergebnis:** 
    - Es kommt zu **keinem hässlichen Übereinanderstapeln (Stacking)** der Toast-Meldungen im Top-Layer.
    - Jede Statusmeldung erscheint nacheinander, verweilt kurz, animiert heraus und macht Platz für die nächste Meldung in der Warteschlange.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 6: Schriftarten-Wechsel (System Stacks)
*   **Kategorie:** Schriftarten-Manager
*   **Ausgangssituation:** Der Briefbogen enthält Text.
*   **Aktion:** 
    1. Klicke in der Sidebar unter „Schriftarten-Manager“ nacheinander auf **Sans**, **Serif** und **Mono**.
*   **Erwartetes Ergebnis:** 
    - Die Schriftart des gesamten Briefbogens (inkl. Metadaten und Fließtext) ändert sich augenblicklich.
    - Sans nutzt moderne serifenlose Typografie, Serif klassische Buchschrift und Mono eine technische Schreibmaschinenschrift.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 7: WOFF2-Uploader (Base64 LocalStorage Persistenz)
*   **Kategorie:** Schriftarten-Manager
*   **Ausgangssituation:** Eine gültige `.woff2`-Schriftdatei (< 60 KB) liegt auf deinem Rechner bereit (z. B. *Inter-Regular.woff2*).
*   **Aktion:** 
    1. Klicke in der Sidebar auf „Schrift hochladen“ und wähle die Datei aus.
    2. Überprüfe die Änderung der Schriftart auf dem Briefpapier.
    3. Lade die Seite neu (`F5`).
*   **Erwartetes Ergebnis:** 
    - Nach dem Upload wird die Schriftart sofort auf das Briefpapier angewendet. Ein grüner Toast bestätigt den Erfolg.
    - Ein roter „Schrift zurücksetzen“-Button erscheint in der Sidebar.
    - Nach dem Neuladen der Seite bleibt die hochgeladene Schriftart dank des Base64-Speichers im `localStorage` erhalten.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 8: Dual-Provider Adress-Autocomplete
*   **Kategorie:** Externe APIs
*   **Ausgangssituation:** Die Internetverbindung ist aktiv.
*   **Aktion:** 
    1. Wähle **Photon** in der Sidebar. Tippe „Berliner Str.“ in die Suche.
    2. Wähle eine Adresse im Dropdown aus.
    3. Wähle **Geoapify** in der Sidebar. Trage einen ungültigen API-Key ein. Warte auf die Validierung.
    4. Trage einen gültigen API-Key ein, warte auf den grünen Toast und führe dieselbe Suche aus.
*   **Erwartetes Ergebnis:** 
    - Unter Photon erscheint sofort eine Liste von Adressvorschlägen. Bei Auswahl werden Straße, PLZ und Ort im Brief ausgefüllt.
    - Unter Geoapify mit falschem Key blockiert das Suchfeld und meldet einen Fehler.
    - Mit gültigem Key schaltet sich das Feld frei und liefert hochpräzise Vorschläge.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 9: PLZ-Proximity-Biasing & Zippopotam
*   **Kategorie:** Externe APIs
*   **Ausgangssituation:** Das Absenderfeld ist leer.
*   **Aktion:** 
    1. Schreibe eine Postleitzahl aus NRW (z. B. `40210 Düsseldorf`) in das Absenderfeld.
    2. Suche im Empfänger-Suchfeld nach einer generischen Straße (z. B. „Hauptstraße“).
    3. Gib im Empfängerort-Feld `#empfaenger-ort` manuell eine PLZ ein (z. B. `80331`).
*   **Erwartetes Ergebnis:** 
    - Durch die Absender-PLZ geocodiert das System im Hintergrund deine Koordinaten. Die Autocomplete-Suche priorisiert nun Hauptstraßen aus NRW (Proximity Biasing).
    - Bei manueller Eingabe von `80331` im Empfängerort fragt das System Zippopotam ab und vervollständigt das Feld automatisch zu `80331 München`.
*   **Status:** `- [ ] (ungetestet)`

---

### Testfall 10: A4-Überlaufwarnung
*   **Kategorie:** Layout & CSS
*   **Ausgangssituation:** Der Brieftext enthält Text.
*   **Aktion:** 
    1. Schreibe oder füge extrem viel Text in das Brieftext-Feld ein, bis der Text das untere Ende (Y: 230mm) berührt.
*   **Erwartetes Ergebnis:** 
    - Sobald das Limit überschritten wird, färbt sich der Rand des Briefbogens dezent gestrichelt rot.
    - Ein rotes Warn-Badge „TEXT-ÜBERLAUF“ erscheint am Blattrand.
    - Ein Warn-Toast meldet, dass die Seite voll ist.
    - Löschen des Texts entfernt den Warnzustand sofort.
*   **Status:** `- [ ] (ungetestet)`
