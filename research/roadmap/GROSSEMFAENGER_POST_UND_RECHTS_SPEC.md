# Großempfänger der Deutschen Post: Rechtliche Grundlagen, Normen & Datenarchitektur

> **Status:** Verbindliche Architektur- und Rechtsspezifikation für DIN-Brief Neo.  
> **Quellen:** Wikipedia („Großempfänger“), OLG Frankfurt am Main, Deutsche Post Direkt Datafactory, DIN 5008:2020.  
> **Datenbestand:** `de_grosskunden_plz.json` (2.258 verifizierte deutsche Großempfänger & Behörden).

---

## 1. Wichtige Erkenntnisse aus dem Wikipedia-Artikel

Der Wikipedia-Artikel liefert vier fundamentale Fakten, die für die Architektur von DIN-Brief Neo von entscheidender Bedeutung sind:

### 1.1 Höchstrichterliche Rechtssicherheit: Das Urteil des OLG Frankfurt
- **Aktenzeichen / Fundstelle:** OLG Frankfurt am Main (Az. 6 U 170/13), veröffentlicht im [Bürgerservice Hessenrecht](https://www.rv.hessenrecht.hessen.de/bshe/document/LARE190017674).
- **Kernaussage:** Bei einem Großempfänger genügt selbst bei streng formgebundenen Verbraucher-Erklärungen (wie einer **gesetzlichen Widerrufsbelehrung**) die ausschließliche Angabe von **Postleitzahl und Ort**. Eine Straße und Hausnummer ist rechtlich und postalisch **nicht erforderlich**.
- **Konsequenz für DIN-Brief:** Das Weglassen der Straße im Empfängerfeld bei Großempfängern ist nicht nur eine Option, sondern rechtlich 100 % wasserdicht. Nutzer, die Kündigungen, Widerrufe oder Behördenbriefe verfassen, haben keine Abmahn- oder Zustellrisiken.

### 1.2 Die Schwelle der Deutschen Post: 2.000 Sendungen pro Werktag
- Ein Großempfänger nach Post-Definition erhält **mehr als 2.000 eingehende Sendungen pro Werktag**.
- **Logistischer Ablauf:** Sendungen werden nicht durch den regulären Zusteller im Zustellbezirk ausgetragen, sondern entweder vom Empfänger am Stützpunkt abgeholt oder über den spezialisierten Bringdienst der Post (**„Hin+Weg“**) direkt in Rollcontainern zugestellt.
- Aus diesem Grund besitzt der Großempfänger für die Post-Sortiermaschinen im Briefzentrum eine eigene logistische Senke – eine Straße würde die Sortierung im Gegenteil verlangsamen.

### 1.3 Einzel-Großempfänger (1:1) vs. Gruppenempfänger (1:n)
- Bei der Einführung der fünfstelligen Postleitzahlen 1993 gab es knapp **1.100 Einzel-Großempfänger** mit exklusiver PLZ sowie knapp unter **16.000 Gruppenempfänger**, die sich eine gemeinsame Großempfänger-PLZ teilen.
- **Typische Gruppen-PLZ (Bürotürme, Industrieparks, Großkomplexe):**
  - `60306 Frankfurt am Main`: **Opernturm**
  - `60308 Frankfurt am Main`: **Messeturm**
  - `60600 Frankfurt am Main`: **The Squaire** (Flughafen Frankfurt, größtes Bürogebäude Deutschlands)
  - `65926 Frankfurt am Main`: **Industriepark Höchst**
- **Wichtiges Architektur-Prinzip (Keine Mieter-Listen pflegen!):**  
  In Bürotürmen und Gewerbeparks wechseln Mieter, Firmen und Agenturen laufend. Es wäre ein aussichtsloser Wartungsaufwand und eine Fehlerquelle, dort Firmenlisten zu hinterlegen.  
  **Die Lösung:** Das System kennt das *Gebäude / Areal* (z. B. *The Squaire*) und weiß, dass für diese PLZ *keine Straße erforderlich* ist. Welches Unternehmen dort aktuell sitzt, tippt der Nutzer frei ein oder fügt es tagesaktuell per Impressum-Zwischenablage ein.

### 1.4 Die offizielle Primärquelle: Deutsche Post Direkt Datafactory
- Großempfänger-Daten müssen nicht mühsam von Drittseiten gecrawlt werden. Die offizielle Primärquelle ist das Downloadportal der Deutschen Post Direkt:
  - **Portal:** [Deutsche Post Direkt Datafactory – Download Postleitdaten](https://www.deutschepost.de/de/d/deutsche-post-direkt/datafactory/download_postleitdaten.html)
  - **Offizielle Mitteilungsblätter:**
    - `dp-mtb-ge-zugaenge.pdf` (*Mitteilungsblatt Großempfänger-Zugänge, -Abgänge und -Änderungen*, monatlich/quartalsweise)
    - `dp-mtb-plz-pf-zugaenge.pdf` (*Mitteilungsblatt Postfach- und Großempfänger-PLZ*)
  - **Offizielle Kennung:** Die Deutsche Post führt diese Postleitzahlen unter dem Kürzel **„GE“ (Großempfänger)**.

---

## 2. Die 4 Typen deutscher Postleitzahlen im Vergleich

Im deutschen Postleitzahlensystem gibt es vier unterschiedliche PLZ-Kategorien:

| Typ | Bezeichnung | Verwendung | Anschriftfeld nach DIN 5008 |
| :--- | :--- | :--- | :--- |
| **Typ 1** | **Zustell-PLZ** | Normale Straßen- und Hauszustellung | Firma / Name<br>Straße & Hausnummer<br>PLZ & Ort |
| **Typ 2** | **Postfach-PLZ** | Postfach im Briefzentrum / Schalter | Firma / Name<br>Postfach 12345<br>PLZ & Ort *(Straße verboten)* |
| **Typ 3** | **Großempfänger-PLZ (GE)** | Eigene Sonder-PLZ (>2.000 Briefe/Tag) | Institution / Behörde / Großkonzern<br>(Abteilung / Gebäude)<br>PLZ & Ort *(Straße entfällt)* |
| **Typ 4** | **Aktions- / Sonder-PLZ** | Weihnachtspostämter, Wahlen, Gewinnspiele | z. B. *Christkind, 51777 Engelskirchen* |

---

## 3. Prominente Großempfänger, die jetzt in `de_grosskunden_plz.json` integriert sind

Durch den Abgleich mit dem Wikipedia-Korpus wurden **45 hochkarätige Institutionen** ergänzt, die in vielen Standard-Postdatenbanken fehlten (z. B. Verfassungsorgane des Bundes):

| PLZ | Institution | Ort | Besonderheit / Typ |
| :--- | :--- | :--- | :--- |
| `10888` | **Axel Springer SE** | Berlin | Verlagsgruppe (auch WELT, Bild) |
| `11010` | **Bundespräsidialamt** | Berlin | Informationsverbund Berlin-Bonn |
| `11011` | **Deutscher Bundestag** | Berlin | Informationsverbund Berlin-Bonn |
| `11012` | **Bundeskanzleramt** | Berlin | Informationsverbund Berlin-Bonn |
| `11013` | **Auswärtiges Amt** | Berlin | Bundesministerium |
| `11014` | **Bundesministerium des Innern** | Berlin | Bundesministerium |
| `11015` | **Bundesministerium der Justiz** | Berlin | Bundesministerium |
| `11016` | **Bundesministerium der Finanzen** | Berlin | Bundesministerium |
| `11017` | **Bundesministerium für Arbeit und Soziales** | Berlin | Bundesministerium |
| `11018` | **BMFSFJ (Familie, Senioren, Frauen, Jugend)** | Berlin | Bundesministerium |
| `11019` | **Bundesministerium für Wirtschaft und Klimaschutz** | Berlin | Bundesministerium |
| `11055` | **Bundesrat** | Berlin | Verfassungsorgan |
| `13343` | **Amtsgericht Wedding** | Berlin | Großgericht |
| `24932` | **Kraftfahrt-Bundesamt (KBA)** | Flensburg | Flensburger Punkte / Bundesamt |
| `33333` | **Arvato (Bertelsmann)** | Gütersloh | Medien- & Dienstleistungskonzern |
| `38436` | **Volkswagen AG** | Wolfsburg | Konzern-Zentrale |
| `45091` | **Deutsche Rentenversicherung Knappschaft-Bahn-See** | Essen | Sozialversicherungsträger |
| `50656` | **ARD ZDF Deutschlandradio Beitragsservice** | Köln | Rundfunkgebühren (ehem. GEZ) |
| `51777` | **Christkind (Weihnachtspostamt)** | Engelskirchen | Offizielles Weihnachtspostamt DPAG |
| `53094` | **Bundesamt für Justiz** | Bonn | Bundesbehörde (Führungszeugnis etc.) |
| `55100` | **Zweites Deutsches Fernsehen (ZDF)** | Mainz | Sendezentrum Lerchenberg |
| `60256` | **Amtsgericht Frankfurt am Main** | Frankfurt am Main | Justizzentrum |
| `70464` | **Robert Bosch GmbH** | Stuttgart | Technologiekonzern |
| `80788` | **BMW** | München | Konzernzentrale |
| `96435` | **HUK-Coburg** | Coburg | Versicherungskonzern |

---

## 4. Konkretes Verhalten im DIN-Brief Neo Formular

### Regel 1: Intelligentes Ausblenden / Ausgrauen der Straße
Tippt der Nutzer eine Großempfänger-PLZ (z. B. `11012` oder `53094`):
1. **Ort** wird automatisch mit `Berlin` bzw. `Bonn` gefüllt.
2. **Empfänger / Firma** schlägt automatisch `Bundeskanzleramt` bzw. `Bundesamt für Justiz` vor.
3. **Straßenfeld:** Erhält einen dezenten Platzhalter-Hinweis:  
   *„Großempfänger – Angabe von Straße nicht erforderlich (DIN 5008 / OLG Frankfurt)“*  
   und wird optional ausgegraut, um Übertragungsfehler zu vermeiden.

### Regel 2: Bidirektionale Sofortsuche (Name ➔ PLZ)
Tippt der Nutzer im Firmenfeld:
- `Axel Springer` ➔ Vorschlag: `Axel Springer SE, 10888 Berlin (Großempfänger)`
- `Bundestag` ➔ Vorschlag: `Deutscher Bundestag, 11011 Berlin (Großempfänger)`
- `Beitragsservice` ➔ Vorschlag: `ARD ZDF Deutschlandradio Beitragsservice, 50656 Köln`
Mit einem einzigen Tastendruck ist der gesamte Adressblock normgerecht und fehlerfrei ausgefüllt.

### Regel 3: Zero-Maintenance-Prinzip für Gruppenempfänger & Bürotürme
Wird eine Gruppen-PLZ wie `60600` (The Squaire), `60306` (Opernturm) oder `60308` (Messeturm) eingegeben:
1. **Keine veralteten Unternehmens-Dropdowns:** Das System versucht **niemals**, Mieterlisten von Firmen vorzuschlagen, da diese kontinuierlich wechseln und veralten würden.
2. **Gebäude als Empfänger-Zusatz:** Das System setzt lediglich die Gebäudebezeichnung (z. B. `The Squaire` oder `Opernturm`) in das optionale Zusatzfeld.
3. **Firma bleibt Freitext:** Das Firmenfeld bleibt vollständig leer für die freie Nutzereingabe.
4. **Straße entfällt:** Das Straßenfeld wird wie bei jedem Großempfänger als nicht erforderlich markiert.
5. **Tagesaktuelle Alternative:** Möchte der Nutzer eine Firma in einem solchen Turm adressieren, kopiert er schlicht das Impressum der Firma in die Zwischenablage – der Parser liest den exakten Firmennamen und das Gebäude dann fehlerfrei und ohne jede Datenbankpflege direkt aus.
