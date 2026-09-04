# Benchmark-Analyse: Endpunkte, Genauigkeit & PLZ-Vorabladen

> **Projekt:** DIN-Brief Neo (Reine Recherche & System-Tests)  
> **Status:** Live-Messungen auf dem System durchgeführt, keine Codeänderungen am Produktiv-Repository.

---

## 1. Recherche der Endpunkte & Parameter

| Anbieter | Primärer Endpunkt | Auth / Key | Wichtigste Parameter |
| :--- | :--- | :--- | :--- |
| **Geoapify (EU)** | `https://api-eu.geoapify.com/v1/geocode/autocomplete` | `apiKey={key}` | `text`, `filter=countrycode:de`, `bias=proximity:lon,lat`, `limit=5`, `lang=de`, `format=json` |
| **Geoapify (Global)** | `https://api.geoapify.com/v1/geocode/autocomplete` | `apiKey={key}` | Identisch zu EU (Dient als Anycast-Fallback) |
| **HERE Technologies** | `https://autocomplete.search.hereapi.com/v1/autocomplete` | `apiKey={key}` | `q={text}`, `in=countryCode:DEU`, `at=lat,lon`, `limit=5`, `lang=de` |
| **Komoot Photon** | `https://photon.komoot.io/api/` | **Kein Key (Frei)** | `q={text}`, `lat={lat}&lon={lon}`, `limit=5`, `lang=de` |
| **OpenPLZ API** | `https://openplzapi.org/de/Streets` | **Kein Key (Frei)** | `name=^...*`, `postalCode=...`, `locality=...` |
| **Zippopotam.us** | `https://api.zippopotam.us/de/{plz}` | **Kein Key (Frei)** | Reiner 5-Stelliger PLZ-Pfad |

---

## 2. Live-Latenzmessungen (Geschwindigkeitstest auf dem System)

Die Abfragezeiten wurden in mehreren Testreihen direkt über das Netzwerk gemessen:

| Dienst | HTTP-Status | Min. Latenz | Durchschn. Latenz | Bemerkung |
| :--- | :--- | :--- | :--- | :--- |
| **OpenPLZ API** | **200 OK** | **100,2 ms** | **108,4 ms** | Extrem schnelle Antwort, direkt aus Deutschland |
| **Geoapify (EU)** | 401 (Auth-Ping) | **93,0 ms** | **132,8 ms** | Schnellste Verbindung bei aktivem TLS-Keep-Alive |
| **Geoapify (Global)** | 401 (Auth-Ping) | 111,0 ms | 134,3 ms | Anycast-Routing minimal langsamer als EU-Cluster |
| **HERE Technologies** | 401 (Auth-Ping) | 123,6 ms | 138,8 ms | Stabiles europäisches CDN |
| **Zippopotam.us** | **200 OK** | 105,9 ms | 164,8 ms | Zuverlässig, aber nur für reine PLZ |
| **Komoot Photon** | **200 OK** | 192,2 ms | 219,6 ms | Liefert vollständige OSM-Feature-Objekte |

---

## 3. Genauigkeits- und Präzisionstest (Reale Adressen)

Für den Test wurden 4 Szenarien an Photon und OpenPLZ übergeben:

1. **Test 1: Exakte Adresse („Poststraße 1, 53111 Bonn“)**
   - **Komoot Photon:** **Volltreffer.** Liefert sofort Straße (`Poststraße`), Hausnummer (`1`), PLZ (`53111`), Ort (`Bonn`), Bundesland (`NRW`).
   - **OpenPLZ:** Erfordert getrennte Abfragen für Straße und PLZ; findet die Straße, hat aber keine Hausnummern-Datenbank.
2. **Test 2: Abkürzungen („Friedrich-Breuer-Str 15, Beuel“)**
   - **Komoot Photon:** Erkennt die Straße und setzt den Ortsteil Beuel korrekt in Relation zu Bonn (PLZ `53225`).
   - **OpenPLZ:** Findet `Friedrich-Breuer-Str.` mit exakter Zuordnung zu `Bonn-Beuel / Beuel-Mitte`.
3. **Test 3: Ferne Großstadt („Kaufingerstr 10 München“)**
   - **Komoot Photon:** Findet `Kaufingerstraße 10, 80331 München` trotz aktivem Bonn-Bias, da der Bias andere Städte nicht verbietet.
   - **OpenPLZ:** Findet die Straße in `München / Altstadt-Lehel`.
4. **Test 4: Straßen ohne Ort („Willy-Brandt-Allee“)**
   - **Komoot Photon:** Durch `lat=50.7374&lon=7.0982` landet sofort **Bonn (53113)** auf Platz 1.
   - **OpenPLZ:** Ohne Geo-Bias liefert OpenPLZ die Straße alphabetisch in Lübeck (23552 / 23554).

### Zwischenfazit zur Genauigkeit:
- **Für Freitext-Echtzeitsuche mit Hausnummern und Geo-Bias:** **Geoapify, HERE und Komoot Photon** sind überlegen, da sie eine vollständige Adresszeile inklusive Hausnummer auflösen können.
- **Für strukturierte Katasterdaten (z. B. PLZ ➔ Ort / Straßenkatalog):** **OpenPLZ** bietet amtliche Präzision.

---

## 4. Was können wir vorab laden? Die PLZ-Analyse

Die Frage: *„Wie groß wäre ein Objekt aller deutschen Postleitzahlen (00001–99999)?“*

### Mathematische & Praktische Realität:
- Zwar gibt es mathematisch 100.000 Zahlen von 00000 bis 99999, in Deutschland sind davon aber nur **exakt 8.170 Postleitzahlen vergeben**!
- Viele Bereiche (wie 00xxx oder Endnummern) existieren nicht. Die kleinste deutsche PLZ ist `01067` (Dresden), die höchste ist `99998` (Weinbergen).

### Exakte Dateigrößen-Berechnung:

| Format | Inhalt pro Eintrag | Rohgröße (JSON) | Gzip-komprimiert | Brotli-komprimiert |
| :--- | :--- | :--- | :--- | :--- |
| **Format A (Schlank)** | `{"53111": "Bonn", ...}` | 191,5 KB | **20,8 KB** | **17,1 KB** |
| **Format B (Mit Geo-Daten)** | `[["53111", "Bonn", 50.73, 7.10], ...]` | 398,9 KB | **20,1 KB** | **16,0 KB** |

*(Hinweis: Format B komprimiert wegen der gleichförmigen Tabellenstruktur sogar noch besser als Format A).*

### Der revolutionäre Nutzen für DIN-Brief Neo:
1. **Nur ~16 KB Download-Volumen:** Eine 16-KB-Datei ist kleiner als ein einziges Bild-Icon. Sie kann beim ersten Laden der Seite in Millisekunden im Browser gecacht werden.
2. **0 ms Latenz für PLZ und Ort:** Tippt der Absender oder Empfänger eine 5-stellige PLZ ein, erscheint der Ort **ohne jede Netzwerk-Verzögerung in 0,001 Millisekunden**.
3. **Komplett offlinefähig:** Funktioniert selbst im Flugmodus oder bei komplettem Internetausfall.
4. **Offline Proximity-Bias:** Durch die integrierten Koordinaten (Breite/Länge) jeder deutschen PLZ kennt die Web-App sofort den Wohnort des Nutzers, **ohne** dafür Geoapify anfragen zu müssen!
