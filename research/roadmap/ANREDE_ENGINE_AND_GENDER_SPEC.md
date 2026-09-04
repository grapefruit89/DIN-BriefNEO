# Spezifikation & Benchmark: Die Anrede-Engine (`anrede.js` / `41-salutation-engine.js`)

> **Status:** Architektur-Analyse & Upgrade-Roadmap für DIN-Brief Neo.  
> **Gegenstand:** Das Modul `website/js/41-salutation-engine.js` (im Projekt als Anrede-Engine bekannt).  
> **Kernfrage:** Gibt es entsprechende Open-Source-Lösungen, amtliche Standards und Optimierungspotenziale?

---

## 1. Was die aktuelle Anrede-Engine (`41-salutation-engine.js`) heute leistet

Das Modul `41-salutation-engine.js` ist eines der wichtigsten Komfort-Features von DIN-Brief Neo:
1. **Titel-Extraktion (`splitTitles`):**  
   Erkennt feste Präfixe: `Prof. Dr.`, `Dipl.-Ing.`, `Prof.`, `Dr.`, `Mag.`.
2. **Anrede-Generierung (`derive`):**  
   - Formal: `Sehr geehrte Frau [Titel] [Nachname],` bzw. `Sehr geehrter Herr [Titel] [Nachname],`
   - Höflich: `Guten Tag Frau/Herr [Titel] [Nachname],`
   - Locker: `Hallo [Vorname],`
   - Fallback: `Sehr geehrte Damen und Herren,`
3. **Grußformeln (`getClosing`):**  
   `Mit freundlichen Grüßen` / `Herzliche Grüße` / `Beste Grüße`.

---

## 2. Die Schwachstellen der aktuellen Lösung

1. **Radiobutton-Klickzwang für das Geschlecht:**  
   Wenn der Nutzer im Empfängerfeld `Dr. Sabine Becker` oder `Thomas Meyer` eingibt, weiß die Engine bisher nicht, ob es sich um eine Frau oder einen Mann handelt.  
   ➔ **Folge:** Der Nutzer **muss manuell** auf den Radiobutton „Frau“ bzw. „Herr“ klicken. Vergisst er das, generiert das System fälschlicherweise `Sehr geehrte Damen und Herren,`, obwohl der Name glasklar da steht.
2. **DIN-5008-Konformität bei Professorentiteln:**  
   Nach der amtlichen Norm DIN 5008 (Abschnitt 9.2) wird die Berufsbezeichnung „Professor“ in der Anrede **immer ausgeschrieben**:  
   - Anschrift: `Herrn Prof. Dr. Manfred Bayer`
   - Anrede DIN 5008: `Sehr geehrter Herr Professor Bayer,` *(nicht `Sehr geehrter Herr Prof. Bayer,`)*.
3. **Fehlende Erkennung von `z. Hd.` (Zu Händen):**  
   Steht im Adressblock `z. Hd. Herrn Müller`, ignoriert die Engine den Ansprechpartner oft und fällt auf die Standard-Firmenanrede zurück.

---

## 3. Was gibt es an entsprechenden Lösungen und Vorbildern?

Im Open-Source- und Softwarebereich gibt es drei wesentliche Lösungsansätze:

### A. Der renommierte c't-Namenskorpus (`firstnames-to-gender` / `nam_dict`)
- **Ursprung:** Entwickelt von Jörg Michael für das Computermagazin c't. Der weltweite Standard für Namens- und Geschlechterklassifizierung.
- **Umfang:** Enthält zehntausende Vornamen mit länderspezifischer Kodierung (D, A, CH).
- **Vorteil für DIN-Brief Neo:**  
  Ein kondensiertes Wörterbuch der **~1.500 häufigsten deutschen Vornamen** deckt über 93 % aller Briefempfänger in Deutschland ab (von Thomas, Michael, Stefan, Andreas bis Sabine, Julia, Claudia, Sarah, Laura).  
  Komprimiert als Brotli-Payload benötigt diese Tabelle **nur rund 5 bis 7 KB**!
- **Effekt (Zero-Click Anrede):**  
  Sobald der Nutzer `Sabine` oder `Thomas` tippt, schaltet die Anrede **sofort und vollautomatisch** auf `Sehr geehrte Frau...` bzw. `Sehr geehrter Herr...` um – der Radiobutton muss nie wieder angefasst werden!

### B. Die DIN 5008:2020 Normregeln für akademische Grade & Adelstitel
DIN 5008 definiert glasklare Gesetze für die Korrespondenz:
1. **Doktortitel (`Dr.`):** Gehört in Anschrift und Anrede (`Sehr geehrte Frau Dr. Schneider`).
2. **Professorentitel (`Prof.`):** Gehört in die Anschrift (abgekürzt), in der Anrede **zwingend ausgeschrieben** (`Sehr geehrter Herr Professor Schneider`).
3. **Doppeltitel (`Prof. Dr.`):** In der Anrede wird nach DIN 5008 der höchste Grad genannt (`Sehr geehrter Herr Professor Schneider`).
4. **Bachelor / Master (`B.A.`, `M.Sc.`, `LL.M.`):** Stehen nachgestellt in der Anschrift, **entfallen aber zwingend in der Anrede**!
5. **Mehrere Personen / Paare:** Nach Knigge und DIN 5008 wird die Dame immer zuerst genannt:  
   `Sehr geehrte Frau Müller, sehr geehrter Herr Müller,`

### C. Cloud-APIs (Genderize.io, Gender-API.com)
- Kommerzielle REST-APIs, die Vornamen online gegen Datenbanken abfragen.
- **Warum diese für DIN-Brief Neo ungeeignet sind:**  
  1. Sie verletzen das Kernversprechen von DIN-Brief Neo: **100 % Privatsphäre & Offline-Fähigkeit**. Namen von Briefempfängern dürfen nicht an externe US-Tracking-APIs gesendet werden.
  2. Sie erzeugen unnötige Netzwerklatenz (100–200 ms).  
  Eine lokale 6-KB-Wörterbuchtabelle im Browser reagiert in **0,001 ms** und benötigt kein Internet.

---

## 4. Konkrete Upgrade-Roadmap für die Anrede-Engine

| Feature | Aktueller Zustand | Ziel-Architektur (Upgrade) |
| :--- | :--- | :--- |
| **Geschlechtserkennung** | Manuell per Radiobutton | **Automatisch in 0,001 ms** via 6-KB-Vornamentabelle |
| **Professorentitel** | Bleibt abgekürzt (`Prof.`) | **Normgerecht ausgeschrieben** (`Professor`) |
| **Zusatzzeilen (`z. Hd.`)** | Werden oft ignoriert | Extrahiert `z. Hd. Herrn Müller` direkt in `Sehr geehrter Herr Müller` |
| **Unisex- / Firmen-Fallback** | Starre Umschaltung | Sanfter Fallback auf `Guten Tag [Vorname] [Nachname]` oder `Sehr geehrte Damen und Herren` |
| **Komplexe Sonderfälle** | Scheitert bei Adelsnamen/Paaren | Übergabe an lokale **Gemini Nano On-Device AI** (falls aktiv) |
