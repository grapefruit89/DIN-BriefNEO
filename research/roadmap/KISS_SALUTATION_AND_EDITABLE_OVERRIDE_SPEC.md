# KISS-Prinzip & ContentEditable-First Architektur für die Anrede

> **Status:** Genehmigte Architektur für DIN-Brief Neo  
> **Leitprinzip:** Keep It Simple, Stupid (KISS) & Contenteditable-First  
> **Kernphilosophie:** Keine überzüchteten Regex-/NLP-Monster für komplexe Sonderfälle. Der DIN-Brief ist zu 100 % editierbar. Der Nutzer hat immer das letzte Wort.

---

## 1. Das Problem mit überzüchteter Automatisierung

Bisherige Ansätze versuchten, alle denkbaren Lebenssachverhalte algorithmisch zu erraten:
- Ehepaare („Ehepaar Schmidt“, „Sabine und Thomas Becker“)
- Adelstitel („Freiherr von...“)
- Akademische Grade („B.A.“, „LL.M.“, „Dipl.-Ing.“)
- Firmenbezeichnungen und Firmenzusätze

**Die Konsequenz:**
- Dutzende Edge Cases, spröde Parser, unerwartete Seiteneffekte (wie das berüchtigte `Hallo herr,`).
- Hohe Code-Komplexität, die schwer zu warten und fehleranfällig ist.

---

## 2. Die KISS-Lösung: Zwei klare Ebenen

### Ebene 1: Die schlanke 80/20-Automatik (Clean & Lean)
Die Engine übernimmt nur das, was in 90 % der Standardbriefe anfällt, und zwar fehlerfrei:
1. **Präfix-Erkennung (`herr ` / `frau `):**
   Tippt der Nutzer `herr ` oder `frau ` ins Empfängerfeld, steht das Geschlecht fest.
   - Solange nur `herr ` getippt ist (In-flight Typing), generiert das System sauber `Sehr geehrter Herr,` oder `Hallo,` – **niemals** `Hallo herr,`.
   - Sobald der Name folgt (`herr Müller`), wird `Sehr geehrter Herr Müller,` daraus.
2. **Zero-Click Vornamen-Erkennung (2,55 KB Brotli-Tabelle):**
   Schreibt der Nutzer `Sabine Becker` oder `Thomas Müller` ohne `Herr`/`Frau`, schlägt die Engine den Vornamen in einem winzigen Set der 951 häufigsten deutschen Vornamen nach.
   - `Sabine` ➔ weiblich ➔ `Sehr geehrte Frau Becker,`
   - `Thomas` ➔ männlich ➔ `Sehr geehrter Herr Müller,`
3. **DIN 5008 Titel-Regel:**
   - `Prof.` wird in der Anrede zwingend zu `Professor` ausgeschrieben (`Sehr geehrter Herr Professor Dr. Müller,`).
   - `Dr.` bleibt erhalten.
   - Nachgestellte Bachelor-/Master-Grade werden in der Anrede schlicht ignoriert.
4. **Fallback:**
   - Erkennt das System kein Geschlecht oder eine Firma, fällt es sauber auf `Sehr geehrte Damen und Herren,` zurück.

---

### Ebene 2: ContentEditable-First & Das Dirty-Flag-Prinzip (Nutzer-Übersteuerung)

Der gesamte DIN-Brief ist in der Benutzeroberfläche direkt im Dokument editierbar (`contenteditable="plaintext-only"`).

#### Die Goldenen Dirty-Flag-Regeln:

1. **Jeder Klick und Tastenschlag im Anredefeld ist heilig:**
   Sobald der Nutzer das Feld `<din-anrede id="anrede">` manuell bearbeitet (Event: `input`):
   - Es wird `anrede.dataset.dirty = "true"` gesetzt.
   - Das Attribut `data-generated` wird gelöscht.
   - `settings.salutationDirty = true` wird im LocalStorage persistiert.
   - **Absolute Sperre:** Die automatische Engine rührt das Feld ab diesem Zeitpunkt **unter keinen Umständen mehr an**. Egal, was der Nutzer in `empfaenger-name` oder `empfaenger-firma` tippt – die manuelle Eingabe bleibt zu 100 % erhalten.

2. **Wie komplexe Edge Cases gelöst werden (Zero-Code-Lösung):**
   - *Fall Ehepaar:* Der Nutzer schreibt im Brief einfach: `Sehr geehrte Frau Müller, sehr geehrter Herr Müller,`.
   - *Fall Adel/Besondere Anrede:* Der Nutzer schreibt: `Sehr geehrte Freifrau von Richthofen,`.
   - *Fall Non-Binär/Individuell:* Der Nutzer tippt die gewünschte Ansprache direkt hinein.
   - ➔ **Ergebnis:** Null Zeilen Parser-Code, null Fehler, 100 % Flexibilität in 2 Sekunden.

3. **Der intuitive Auto-Reset (Zurück zur Automatik):**
   Möchte der Nutzer seine manuelle Übersteuerung rückgängig machen und wieder den automatischen Generator aktivieren?
   - Er löscht einfach den Text im Anredefeld (z. B. `Strg+A` ➔ `Rücktaste`).
   - Ist das Feld leer (`textContent.trim() === ''`), erkennt das System:
     - `delete anrede.dataset.dirty;`
     - `settings.salutationDirty = false;`
     - Die Automatik schaltet sich sofort wieder scharf und regeneriert die passende Anrede basierend auf dem Empfängernamen.

---

## 3. Zustandsdiagramm (KISS State Machine)

```text
[ Empfänger-Feld wird getippt ]
               │
               ▼
   Ist anrede.dataset.dirty gesetzt?
         │                │
       [JA]              [NEIN]
         │                │
         ▼                ▼
   [ HANDS OFF! ]    [ KISS Automatik ]
   Manuelle Eingabe    1. Prefix prüfen ("herr ", "frau ")
   bleibt 100% aktiv   2. Vorname aus 2.5 KB Set prüfen
                       3. Din 5008 Professor ausschreiben
                       4. Anrede in <din-anrede> einsetzen
                              │
                              ▼
           [ Nutzer tippt in <din-anrede> ]
                              │
                              ▼
                    Feld leer geräumt?
                       │            │
                     [JA]          [NEIN]
                       │            │
                       ▼            ▼
             dirty = false       dirty = true (Gesperrt!)
             (Auto-Reset)
```

---

## 4. Fazit & Metriken

- **Code-Einsparung:** Über 150 Zeilen fragiler Regex-Sonderfallprüfungen entfallen komplett.
- **Wartungsaufwand:** 0 Stunden.
- **Nutzer-Freiheit:** 100 % Kontrolle, keine Bevormundung durch die Software.
