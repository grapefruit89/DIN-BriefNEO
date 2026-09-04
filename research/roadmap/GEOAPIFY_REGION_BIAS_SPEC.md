# Geoapify Autocomplete: Multi-Cluster Failover & Bonn-Bias Spezifikation

> **Quelle:** Geoapify Geocoder & Address Autocomplete API Documentation (EU & Global Cluster)  
> **Ziel:** Maximale Hochverfügbarkeit, DSGVO-Konformität (EU-Hosting) und regionale Fokussierung auf **Bonn** mit deutschlandweitem Fallback.

---

## 1. Multi-Cluster Endpoint Failover Architektur

Um gegen Rechenzentrums-Ausfälle, regionale Netzstörungen oder die Abschaltung eines Endpunkts gewappnet zu sein, ist eine kaskadierende Server-Pipeline implementiert:

| Priorität | Endpunkt | Zweck & Eigenschaften |
| :--- | :--- | :--- |
| **1. Primär (EU)** | `https://api-eu.geoapify.com/v1` | **EU-Infrastruktur / Frankfurt**. Volle DSGVO-Konformität, geringste Netzwerklatenz für Deutschland (~10-25 ms). |
| **2. Fallback (Global)** | `https://api.geoapify.com/v1` | **Globales Anycast-Netzwerk**. Greift automatisch ein, falls der EU-Cluster nicht erreichbar ist (HTTP 5xx, DNS-Fehler, Timeouts). |
| **3. Offline-Notfallnetz** | `localStorage (din_local_addresses)` | **0 ms Latenz, 100 % API-unabhängig**. Funktioniert selbst dann weiter, wenn Geoapify den Dienst komplett einstellen sollte. |

### Failover-Funktionsweise (`fetchWithServerFailover`):
Jeder API-Aufruf (Heartbeat-Check, Adresssuche, Absender-Koordinaten) durchläuft die Server-Liste. Schlägt der erste Endpunkt mit einem Netzwerkfehler fehl, springt der Request verzögerungsfrei auf den nächsten Server um.

---

## 2. Die zwei Filter- & Bias-Schlüsselparameter

Geoapify unterscheidet strikt zwischen harter Filterung und weicher Priorisierung:

| Parameter | Mechanismus | Auswirkung auf die Suche |
| :--- | :--- | :--- |
| **`filter=countrycode:de`** | **Hard Filter (Strikter Ausschluss)** | Schließt alle Adressen außerhalb Deutschlands aus. Keine falschen Treffer aus Österreich, der Schweiz oder Übersee. |
| **`bias=proximity:lon,lat`** | **Soft Bias (Gewichtung & Ranking)** | Sortiert Treffer im Umkreis der Koordinaten nach oben, schließt ferne deutsche Städte aber **nicht** aus. |

---

## 3. Standard-Mittelpunkt Bonn & Dynamischer Absender-Bias

- **Bonn Zentrum (Münsterplatz / Stadthaus):**
  - Breitengrad (Latitude): `50.7374`
  - Längengrad (Longitude): `7.0982`
  - URL-Syntax: `bias=proximity:7.0982,50.7374`

### Die 2-Stufen-Erkennungslogik:
1. **Stufe 1 (Standard): Bonn als Anker**
   - Ist noch keine Absenderadresse eingetragen, priorisiert die Suche automatisch Bonn und die umliegende Rhein-Sieg-Region (Beuel, Bad Godesberg, Sankt Augustin, Bornheim, Königswinter).
2. **Stufe 2 (Dynamisch): Adaptiver Absender-Radius**
   - Sobald im Brief eine deutsche Absender-PLZ hinterlegt wird, ermittelt das System im Hintergrund automatisch die Breiten- und Längengrade des Absender-Wohnorts und speichert sie in `din_sender_coords`.
   - Nachfolgende Empfänger-Suchen werden ab sofort mit dem individuellen Wohnort als Zentrum gewichtet.

---

## 4. Vollständige Request-Struktur

```text
GET https://api-eu.geoapify.com/v1/geocode/autocomplete
  ?text={suchbegriff}
  &apiKey={api_key}
  &lang=de
  &limit=6
  &format=json
  &filter=countrycode:de
  &bias=proximity:7.0982,50.7374
```

*(Bei Ausfall schaltet die Anfrage unterbrechungsfrei auf `https://api.geoapify.com/v1/...` um.)*

---

## 5. Was passiert bei einer kompletten Geoapify-Abschaltung?

Sollte Geoapify die Schnittstelle jemals ändern oder ganz vom Netz nehmen:
1. **Lokal-Adressbuch (LRU-Cache):** Die letzten 50 verwendeten Adressen bleiben im Browser gespeichert und stehen per Sofort-Fuzzy-Suche ohne Netzwerkzugriff zur Verfügung.
2. **Zippopotam Fallback:** Die automatische Postleitzahlen-Vervollständigung für deutsche Städte (`api.zippopotam.us`) läuft über eine separate, unabhängige Quelle und bleibt voll funktionsfähig.
3. **Plattform-Unabhängigkeit:** Die Failover-Tabelle in `43-geoapify.js` kann bei Bedarf innerhalb von 30 Sekunden um alternative Geocoding-Provider (z. B. Photon / OpenStreetMap Nominatim) erweitert werden.
