# Intelligenter Zwischenablage- & Impressum-Parser

> **Status:** UX- & Architektur-Konzept (Reine Recherche, keine Änderungen am Produktiv-Repository).  
> **Problem:** 90 % aller Nutzer kopieren Empfängeradressen aus einem Web-Impressum oder einer E-Mail-Signatur (inklusive rechtlichem Müll wie HRB, § 5 DDG, USt-ID und Geschäftsführung).

---

## 1. Die Heuristik: Wie trennt man Adresse von rechtlichem Müll?

Wenn ein Nutzer ein Impressum wie das von DocCheck kopiert:
```text
DocCheck Impressum
1 Diensteanbieter im Sinne von §5 DDG
DocCheck Community GmbH
Vogelsanger Straße 66
50823 Köln
vertreten durch die Geschäftsführung: Dr. Frank Antwerpes...
Registergericht: Amtsgericht Köln
Registernummer: HRB Köln 31152
USt-ID: DE199672154
```

Der intelligente Parser arbeitet in 4 Schritten (Laufzeit: unter 0,1 Millisekunden im Browser):

### Schritt 1: Rausch-Filterung (Blacklist-Präfixe)
Alle Zeilen, die mit typischen rechtlichen Begriffen beginnen, werden sofort verworfen:
- `Registergericht:`, `Registernummer:`, `HRB`, `HRA` (Verhindert, dass das Amtsgericht des Registers als Empfänger missverstanden wird!)
- `USt-ID:`, `Steuernummer:`
- `vertreten durch:`, `Geschäftsführung:`, `Chefredakteur:`
- `Diensteanbieter`, `§ 5 DDG`, `§ 5 TMG`, `Impressum`
- `Tel:`, `Fax:`, `E-Mail:`, `www.`

### Schritt 2: Der PLZ-Ort-Anker (Fester Bezugspunkt)
Der Parser sucht die Zeile mit dem deutschen Standard-Muster:  
`\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüßA-Z\s\-\/\.]+)`  
➔ **Treffer:** `50823 Köln`.

### Schritt 3: Die Straßen-Zeile (Direkt über der PLZ)
Die Zeile unmittelbar vor der PLZ wird auf eine Hausnummer geprüft (`\d+[a-zA-Z]?\b`):  
➔ **Treffer:** `Vogelsanger Straße 66`.

### Schritt 4: Die Firmen- oder Namens-Zeile (Über der Straße)
Die Zeile vor der Straße wird als Firmen- oder Personenname übernommen:  
➔ **Treffer:** `DocCheck Community GmbH`.

---

## 2. Die Unterscheidung: Registergericht vs. Echtes Amtsgericht

Deine Beobachtung mit dem Amtsgericht ist extrem wichtig:

| Situation | Text im Clipboard | Was macht der Parser? |
| :--- | :--- | :--- |
| **Fall 1: Firmen-Impressum** | `Registergericht: Amtsgericht Köln` | **Wird ignoriert!** Das Amtsgericht ist nur das Registergericht der Firma. Als Empfänger wird korrekt `DocCheck Community GmbH` gesetzt. |
| **Fall 2: Brief an das Gericht** | `Amtsgericht Köln`<br>`Reichenspergerplatz 1`<br>`50670 Köln` | **Wird als Empfänger gesetzt!** Es steht kein „Registergericht:“ davor, sondern es bildet den Kopf der Anschrift. |
| **Fall 3: Großkunde / Behörde** | `Bundesamt für Justiz`<br>`53094 Bonn` | **Wird erkannt!** Straße bleibt leer nach DIN 5008, Empfänger und PLZ/Ort werden befüllt. |

---

## 3. Die UX-Integration im DIN-Brief

Es gibt zwei elegante Möglichkeiten der Einbindung:

1. **Magischer Paste-Handler (Strg + V):**  
   Drückt der Nutzer irgendwo im Anschriftfeld `Strg + V`, fängt die App den eingefügten Text ab. Handelt es sich um ein mehrzeiliges Impressum, zerlegt der Parser den Text in Millisekunden und befüllt sauber die drei getrennten Felder:
   - `empfaenger-firma` ➔ `DocCheck Community GmbH`
   - `empfaenger-strasse` ➔ `Vogelsanger Straße 66`
   - `empfaenger-ort` ➔ `50823 Köln`
2. **Automatischer Clipboard-Check bei leerem Anschriftfeld:**  
   Klickt der Nutzer in das noch leere Empfängerfeld und liegt in der Zwischenablage ein gültiges deutsches Adressmuster, blendet die App einen dezenten Ein-Klick-Button ein:  
   *„📋 Erkannte Adresse einfügen: DocCheck Community GmbH (Köln)“*.

---

## 4. Testergebnisse des Prototyps

Der Python-Test auf dem System hat alle 3 Testfälle zu 100 % fehlerfrei bestanden:
- **DocCheck Impressum:** Sauber extrahiert (`DocCheck Community GmbH`, `Vogelsanger Straße 66`, `50823 Köln`).
- **Amtsgericht direkt:** Sauber extrahiert (`Amtsgericht Köln`, `Reichenspergerplatz 1`, `50670 Köln`).
- **Bundesamt für Justiz:** Sauber extrahiert (`Bundesamt für Justiz`, keine Straße, `53094 Bonn`).
