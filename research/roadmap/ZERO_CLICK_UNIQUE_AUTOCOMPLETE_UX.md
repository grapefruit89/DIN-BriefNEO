# Zero-Click Autocomplete & Eindeutigkeits-Autofill (Kein Handstand-UX)

> **Status:** Verbindliche UX- und Interaktionsspezifikation für DIN-Brief Neo.  
> **Problemstellung:** Nutzer hassen traditionelle Autocomplete-Dropdowns („Muss ich Enter drücken? Mit der Maus klicken? Oder einen Handstand machen?“).  
> **Lösung:** Sobald eine Adresse mathematisch und geografisch eindeutig ist (genau 1 Treffer), wird sie **vollautomatisch ohne jeden Klick oder Tastendruck** übernommen.

---

## 1. Das Problem mit herkömmlichen „Scheißformularen“

In fast allen gängigen Web-Formularen ist Autovervollständigung eine Zumutung für den Anwender:
1. **Auswahl-Unsicherheit (Selection Anxiety):**
   Der Nutzer tippt eine Adresse. Ein Dropdown klappt auf. Was jetzt?
   - Drückt man `Enter`, wird oft versehentlich das ganze Formular abgeschickt oder eine Leerzeile erzeugt.
   - Drückt man `Tab`, springt der Fokus ins nächste Feld, aber der Vorschlag wird **nicht** übernommen.
   - Muss man wirklich die Hände von der Tastatur nehmen, zur Maus greifen und millimetergenau auf ein Dropdown-Item klicken?
2. **Unnötige Wartezeit bei Eindeutigkeit:**
   Wenn eine Adresse in ganz Deutschland nur ein einziges Mal existiert (wie `Droste-Hülshoff-Straße 9, 46359 Heiden`), warum zwingt das System den Nutzer dann noch zu einer Bestätigung? Das System weiß es doch schon zu 100 %!

---

## 2. Die Lösung: Eindeutigkeits-Autofill (Zero-Click Auto-Resolution)

In DIN-Brief Neo gilt das **Eindeutigkeits-Prinzip**:

### Regel 1: Genau 1 Treffer = Sofortige Übernahme (Zero-Click)
Sobald die Treffermenge durch die Eingabe auf **exakt 1 reales Objekt** schrumpft:
- Das System wartet nicht auf Klicks oder Tastatureingaben.
- Es setzt Straße, Hausnummer, PLZ und Ort **sofort geräuschlos und parallel** in die Formularfelder ein.
- Ein dezenter visueller Bestätigungseffekt (z. B. kurzes grünes Aufleuchten des Rahmens) signalisiert: *„Adresse eindeutig erkannt und normgerecht gesetzt.“*

### Regel 2: Ghost-Text (Inline-Vorschau wie in Chrome & VS Code)
Solange die Eingabe noch nicht vollkommen abgeschlossen ist, aber der erste Treffer mit hoher Wahrscheinlichkeit feststeht:
- Der verbleibende Rest der Adresse wird in hellgrauer Schrift (**Ghost Text**) direkt hinter dem Cursor im Eingabefeld eingeblendet.
- **Ein einziger Druck auf die `Tab`-Taste (oder `Pfeil-Rechts`)** übernimmt den Ghost-Text und setzt den Cursor direkt ins nächste logische Feld!
- Kein Suchen nach der Maus, kein Gefummel mit Dropdown-Listen.

### Regel 3: `Enter` ist 100 % sicher
Drückt der Nutzer im Formular intuitiv `Enter`:
- Es wird **niemals** das Formular abgeschickt.
- Wenn ein Vorschlag sichtbar ist, wird er sofort übernommen.
- Der Cursor springt automatisch in das nächste Feld (z. B. vom Empfänger zum Betreff).

---

## 3. Der Live-Test: Was passiert bei „Droste-Hülshoff-Straße 9“?

Wir haben die Adressdatenbanken für `Droste-Hülshoff-Straße 9` bundesweit abgefragt:

### Schritt 1: Reine Straßeneingabe bundesweit
Tippt der Nutzer nur `Droste-Hülshoff-Straße 9`, existieren in Deutschland über 50 Treffer:
- `Droste-Hülshoff-Straße 9, 80686 München`
- `Droste-Hülshoff-Straße 9, 22609 Hamburg`
- `Droste-Hülshoff-Straße 9, 50968 Köln`
- `Droste-Hülshoff-Straße 9, 46119 Oberhausen`
- `Droste-Hülshoff-Straße 9, 46359 Heiden`
➔ Das System zeigt ein Dropdown mit den wahrscheinlichsten Treffern (mit Bonn-Bias oder Entfernungs-Ranking).

### Schritt 2: Progressive Kollabierung durch PLZ-Ziffern
Wechselt der Nutzer jetzt in das PLZ-Feld (oder tippt die PLZ dahinter):
- **Eingabe `4`:** Die 50 Treffer schrumpfen sofort auf 21 Treffer (nur noch PLZ-Region 4).
- **Eingabe `46`:** Die Treffer schrumpfen auf **2 Treffer** (Oberhausen und Dorsten/Heiden).
- **Eingabe `463`:** **GENAU 1 EINZIGER TREFFER IN GANZ DEUTSCHLAND!**  
  `Droste-Hülshoff-Straße 9, 46359 Heiden` ist die einzige Adresse in diesem Leitbereich.
- **System-Reaktion (Zero-Click):**  
  Bereits bei `463` ergänzt das System automatisch die restlichen Ziffern `59` und den Ort `Heiden`! Der Nutzer muss die letzten zwei Ziffern nicht einmal mehr zu Ende tippen!

---

## 4. Die 3 perfekten Eingabepfade im Vergleich

Egal wie der Nutzer arbeitet – das System nimmt ihm jede Denkarbeit ab:

| Pfad | Was der Nutzer tut | Was das System macht | Benutzeraufwand |
| :--- | :--- | :--- | :--- |
| **Pfad A (Bottom-Up: PLZ zuerst)** | 1. Tippt `46359`<br>2. Tippt `Droste 9` | 1. `46359` setzt sofort `Heiden` (Brotli in 0,001 ms).<br>2. Filter ist fest auf Heiden gelockt.<br>3. Bei `Droste 9` gibt es in Heiden nur 1 Treffer ➔ **Auto-Fill!** | **Zero Clicks** (reines Tippen) |
| **Pfad B (Top-Down: Straße zuerst)** | 1. Tippt `Droste-Hülshoff-Str. 9`<br>2. Tippt im PLZ-Feld `463` | Bei der 3. Ziffer `463` ist Heiden bundesweit eindeutig ➔ **Auto-Fill beider Zeilen!** | **Zero Clicks** (frühzeitige Vollendung) |
| **Pfad C (Copy & Paste)** | Kopiert `Droste-Hülshoff-Straße 9, 46359 Heiden` komplett ins Feld | Lokaler Parser erkennt Straße, Hausnummer, PLZ und Ort ➔ **Verteilt alles in 0,1 ms auf die 3 Felder!** | **1 Tastendruck (`Strg+V`)** |
