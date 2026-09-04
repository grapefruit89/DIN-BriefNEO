# Vergleich der Top-3 Adress-Autocomplete-Anbieter für Deutschland & DACH

> **Projekt:** DIN-Brief Neo (Reine Recherche & Konzeption)  
> **Ziel:** Eine flexible 3-Anbieter-Strategie für maximale Nutzerfreundlichkeit, Datenschutz und Ausfallsicherheit.

---

## 1. Die Top-3 Anbieter im direkten Systemvergleich

| Kriterium | 1. Geoapify (Standard) | 2. HERE Technologies (Enterprise) | 3. OpenPLZ / Photon (Zero-Config) |
| :--- | :--- | :--- | :--- |
| **Kostenloses Kontingent** | **3.000 Requests / Tag** | **250.000 Requests / Monat** (~8.300/Tag) | **Vollständig unbegrenzt** |
| **API-Key erforderlich?** | Ja (kostenlose Registrierung) | Ja (kostenlose Registrierung) | **NEIN (Sofort ohne Registrierung)** |
| **Unternehmenssitz / Recht** | **Deutschland (Augsburg)** | **Niederlande / Deutschland (Berlin)** | **Deutschland (Open-Source Community)** |
| **DSGVO & EU-Hosting** | 100 % DSGVO (EU-Cluster Frankfurt) | 100 % DSGVO (Europäischer Konzern) | 100 % DSGVO (Infrastruktur in DE) |
| **Datenbasis** | OpenStreetMap, OpenAddresses | HERE Navigationskarten (Automobil-Standard) | Amtliche Katasterdaten (Open Data) & OSM |
| **Hausnummern-Genauigkeit** | Sehr hoch (punktgenau) | Exzellent (Automotive-Qualität) | Photon: Sehr hoch / OpenPLZ: Straßenebene |
| **Proximity-Bias (Bonn)** | `bias=proximity:7.0982,50.7374` | `at=50.7374,7.0982` | Photon: `lat=50.7374&lon=7.0982` |
| **Deutschland-Filter** | `filter=countrycode:de` | `in=countryCode:DEU` | Nativ auf DACH beschränkt |

---

## 2. Detaillierte Stärken- und Schwächenanalyse

### 1. Geoapify (Die bewährte Deutschland-Lösung)
- **Vorteile:**
  - Deutsches Unternehmen mit Sitz in Bayern (Augsburg).
  - EU-Cluster in Frankfurt (`api-eu.geoapify.com`) mit extrem niedriger Latenz (~25 ms).
  - Hervorragende Bereinigung deutscher Straßennamen (z. B. "Str." vs. "Straße").
  - Ausgereifte Filter (`countrycode:de`) und Bias-Funktionen (`proximity`).
- **Nachteile:**
  - Erfordert einen API-Key; ohne Registrierung kann ein Erstnutzer die Suche nicht nutzen.

---

### 2. HERE Technologies (Der europäische Marktführer mit Mega-Kontingent)
- **Vorteile:**
  - Mit **250.000 Requests pro Monat** das mit Abstand größte kostenlose Kontingent am Markt.
  - Ehemals NAVTEQ / Nokia Maps; Entwicklungszentrum und Kartenkompetenz in Berlin.
  - Höchste Hausnummern- und Adressdichte in Deutschland durch jahrzehntelange Kartierung für Autohersteller (BMW, Mercedes, VW).
  - Autocomplete-API mit Echtzeit-Vervollständigung und Relevanz-Scoring.
- **Nachteile:**
  - API-Key erforderlich.
  - Das Antwortformat (JSON) ist etwas komplexer geschachtelt als bei Geoapify.

---

### 3. OpenPLZ API & Komoot Photon (Die schlüssellose Zero-Config Option)
- **Vorteile:**
  - **Funktioniert Out-of-the-Box für jeden Nutzer!** Kein API-Key, kein Account, keine Wartezeit.
  - **OpenPLZ:** Nutzt offizielle Daten der Landesvermessungsämter und Katasterbehörden (Destatis / Open Data). Kennt exakt alle deutschen Postleitzahlen, Straßen, Ortsteile und Gemeindeschlüssel.
  - **Photon:** Gehostet von Komoot in Deutschland, basierend auf OSM und Elasticsearch. Unterstützt Proximity-Bias und Hausnummern.
- **Nachteile:**
  - OpenPLZ liefert Daten bis zur Straßenebene (Hausnummer muss der Nutzer selbst eintippen).
  - Bei sehr hoher Last können öffentliche Community-Server gelegentlich schwanken.

---

## 3. Die empfohlene 3-Säulen-Architektur für DIN-Brief Neo

Statt sich auf einen einzigen Anbieter festzulegen, profitiert die Web-App von einer **hybriden Provider-Auswahl**:

```text
[Adress-Suche im DIN-Brief]
   │
   ├── Modus A: "Zero-Config" (Standard für neue Besucher)
   │     └── Komoot Photon / OpenPLZ (Kein Key nötig, sofort einsatzbereit!)
   │
   ├── Modus B: "Geoapify" (Für Nutzer mit eigenem Key)
   │     └── Deutsches EU-Cluster, 3.000 Req/Tag, Bonn-Bias
   │
   └── Modus C: "HERE Technologies" (Für Power-User mit eigenem Key)
         └── Europäischer Enterprise-Dienst, 250.000 Req/Monat
```

### Die Vorteile für den Anwender:
1. **Sofortiges Loslegen:** Wer die Seite zum ersten Mal öffnet, kann ohne Anmeldung und ohne Key sofort Adressen suchen.
2. **Volle Kontrolle:** Fortgeschrittene Nutzer können im Dropdown ihren bevorzugten Key (Geoapify oder HERE) hinterlegen.
3. **Automatischer Notfall-Failover:** Läuft das Kontingent von Geoapify voll (Fehler 429) oder ist ein Key ungültig, schaltet die App automatisch und unterbrechungsfrei auf die schlüssellose Lösung um.
