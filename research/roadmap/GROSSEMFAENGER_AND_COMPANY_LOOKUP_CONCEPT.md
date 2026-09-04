# Großempfänger, Behörden & Firmen: Die Besonderheit der deutschen Sonder-PLZ

> **Status:** Recherche- & Architekturbericht (Reine Analyse, keine Änderungen am Produktiv-Repository).  
> **Kontext:** Können wir Firmen, Behörden, Gerichte und Krankenkassen vorab laden?

---

## 1. Die zwei Welten bei Firmenanschriften in Deutschland

Man muss bei Unternehmen und Institutionen in Deutschland zwei völlig unterschiedliche Gruppen unterscheiden:

### Gruppe A: Reguläre Unternehmen (Normale Anschrift)
- **Anzahl:** Über **3,5 Millionen aktive Unternehmen** (GmbH, AG, GbR, Einzelunternehmen, Ärzte, Kanzleien).
- **Datenmenge:** Gigabytes. Das vollständige deutsche Handelsregister (HRB/HRA) lässt sich unmöglich im Browser vorab laden.
- **Lösung im DIN-Brief:** Läuft on-demand über die POI-Suche (Points of Interest) von **Geoapify oder HERE**. Tippt der Nutzer z. B. „Telekom Bonn“, liefert die API sofort `Friedrich-Ebert-Allee 140, 53113 Bonn`.

---

### Gruppe B: Großempfänger der Deutschen Post (Eigene Sonder-PLZ!)
- **Das Geheimnis:** Die Deutsche Post vergibt an Ministerien, Gerichte, Fernsehanstalten, Universitäten und Großkonzerne **eigene, dedizierte 5-stellige Postleitzahlen**.
- **Anzahl in ganz Deutschland:** **Nur rund 2.200 Institutionen!**
- **DIN-5008-Besonderheit:** Nach der offiziellen Norm DIN 5008 **benötigt ein Großempfänger überhaupt keine Straßenangabe!**  
  Der Brief wird schlicht adressiert als:
  ```text
  Bundesamt für Justiz
  53094 Bonn
  ```
  Die Post leitet Sendungen mit dieser PLZ direkt im Briefzentrum in die Rollcontainer der Behörde weiter.

---

## 2. Prominente Beispiele deutscher Großempfänger-PLZ

In unserer extrahierten Datei `de_grosskunden_plz.json` (2.213 Einträge) finden sich unter anderem:

| Institution / Großkunde | Eigene PLZ | Stadt | Besonderheit nach DIN 5008 |
| :--- | :--- | :--- | :--- |
| **Bundesamt für Justiz** | `53094` | Bonn | Straße entfällt komplett |
| **Bundesministerium der Verteidigung** | `53099` | Bonn | Hardthöhe, Direktzustellung |
| **Agentur für Arbeit Bonn** | `53104` | Bonn | Eigene Behörden-PLZ |
| **Deutscher Bundestag** | `11010` | Berlin | Verfassungsorgan |
| **Bundeskanzleramt** | `11011` | Berlin | Verfassungsorgan |
| **Bundesverfassungsgericht** | `76125` | Karlsruhe | Höchstes deutsches Gericht |
| **Bundesgerichtshof** | `76126` | Karlsruhe | Bundesgericht |
| **ZDF (Zweites Deutsches Fernsehen)** | `55100` | Mainz | Sendezentrum Lerchenberg |
| **WDR (Westdeutscher Rundfunk)** | `50656` | Köln | Rundfunkanstalt |
| **Allianz Lebensversicherung** | `70151` | Stuttgart | Großkonzern |
| **Volkswagen AG** | `38436` | Wolfsburg | Konzern-Zentrale |
| **Techniker Krankenkasse** | `22291` | Hamburg | Hauptverwaltung |

---

## 3. Der geniale UX-Hebel für den DIN-Brief

Da die Liste aller 2.213 deutschen Großempfänger winzig ist (komprimiert rund **12 KB**):

1. **Sofortige Firmen-/Behördenerkennung bei PLZ:**
   Tippt der Nutzer `53094`, erkennt die App:
   - Ort: `Bonn`
   - Empfänger: `Bundesamt für Justiz`
   - Straße: Wird automatisch auf *(Großempfänger – keine Straße erforderlich)* gesetzt oder ausgegraut!
2. **Umgekehrte Suche (Name ➔ Sonder-PLZ):**
   Tippt der Nutzer im Empfängerfeld „Bundesk...“, schlägt das Dropdown sofort:
   `Bundeskanzleramt (11011 Berlin)` vor.
   Mit einem einzigen Klick ist der gesamte Adressblock normgerecht nach DIN 5008 ausgefüllt!
