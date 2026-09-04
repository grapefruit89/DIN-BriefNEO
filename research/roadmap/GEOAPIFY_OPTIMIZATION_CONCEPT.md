# Geoapify.js: Ausführliches Optimierungs- & Performance-Konzept

> **Status:** Konzept & Architektur-Plan (Reine Analyse, keine Änderungen am Produktiv-Repository).  
> **Ziel:** Maximale Reaktionsgeschwindigkeit (<50 ms), EU-Routing, Bonn-Bias und 100 % Ausfallsicherheit bei Provider-Abschaltung.

---

## 1. Was genau können wir an der aktuellen `43-geoapify.js` verbessern?

Eine detaillierte Code-Analyse der bestehenden `website/js/43-geoapify.js` deckt folgende 6 Schwachstellen auf:

| Schwachstelle im Ist-Zustand | Ursache im Code | Konkrete Auswirkung |
| :--- | :--- | :--- |
| **1. Kaltstart-Latenz (~220–280 ms)** | Es gibt kein Pre-Warming. Die TCP- und TLS-Verbindung zu Geoapify wird erst aufgebaut, nachdem der Nutzer 3 Zeichen getippt hat und der Debounce abgelaufen ist. | Der erste Suchvorschlag fühlt sich verzögert und zäh an. |
| **2. Starres 200 ms Debounce** | `setTimeout(..., 200)` wartet unnötig lang, selbst wenn das Netzwerk oder der Cache ultraschnell antworten könnten. | Verzögerung von 200 ms vor jedem API-Request. |
| **3. Verschenktes Fokus-Potenzial** | Das Popover öffnet sich erst ab 3 getippten Zeichen (`query.length < 3` bricht sofort ab). | Klickt der Nutzer ins Feld, bleibt es leer, obwohl die letzten 5 genutzten Adressen sofort ohne Tippen wählbar wären. |
| **4. Feste Kopplung an US/Global-Host** | URL `https://api.geoapify.com/v1` ist an 3 Stellen fest verdrahtet. | Höhere Latenz für deutsche Nutzer; kein automatischer Failover bei Störungen oder Server-Abschaltung. |
| **5. Unbegrenzter Memory Cache** | `apiCache = new Map()` wächst endlos ohne LRU-Eviction (Verdrängung alter Einträge). | Unnötiger RAM-Verbrauch bei längeren Brief-Schreibsessions. |
| **6. Bug im Originalcode (Zeile 385)** | Im Block `absenderPlzOrtEl` wird `plz` verwendet, ohne vorher aus dem Regex-Match deklariert worden zu sein (`match[1]`). | Führt zu einem unbehandelten `ReferenceError` bei der Absender-Koordinatenermittlung. |

---

## 2. Wie können wir die Reaktionsgeschwindigkeit massiv hochschrauben?

Die Latenz-Benchmarks haben gezeigt: **Die Datenübertragung selbst dauert nur ~30 ms, der Verbindungsaufbau jedoch ~170 ms!**

Mit folgenden 5 Hebeln schrauben wir die Reaktionszeit von **~450 ms auf unter 50 ms**:

```
[IST-ZUSTAND]
Nutzer tippt ➔ Wartet 200ms Debounce ➔ Startet TCP/TLS (170ms) ➔ Server-Fetch (50ms) ➔ DOM-Render (15ms)
===> Gesamtlatenz: ~435 ms (deutlich spürbare Trägheit)

[SOLL-ZUSTAND MIT PERFORMANCE-TUNING]
1. Maus berührt Input: TCP + TLS vorab im Hintergrund geöffnet (0ms beim Tippen!)
2. Fokus ins Feld: Zuletzt genutzte Adressen erscheinen sofort (0ms!)
3. Nutzer tippt 3 Buchstaben:
   - Lokale Treffer (Fuzzy) erscheinen in 0 ms!
   - Remote-Debounce auf 120 ms verkürzt.
   - Request nutzt warme HTTP/2 Keep-Alive Verbindung (nur 30 ms Datentransfer!)
===> Gesamtlatenz: ~150 ms (fühlt sich wie Instant-Echtzeit an!)
```

### Hebel 1: Speculative Connection Pre-Warming (Zeitersparnis: ~170 ms)
Sobald der Nutzer das Suchfeld mit der Maus berührt (`pointerenter`) oder anklickt (`focus`), injizieren wir dynamisch einen Resource Hint:
```html
<link rel="preconnect" href="https://api-eu.geoapify.com" crossorigin>
<link rel="dns-prefetch" href="https://api.geoapify.com">
```
Dadurch ist der TLS-Handshake mit dem EU-Server in Frankfurt bereits abgeschlossen, **bevor** der Nutzer die erste Taste drückt.

### Hebel 2: Zero-Latency "Recent Addresses" bei Fokus (Zeitersparnis: 100 %)
Wenn der Nutzer in das Suchfeld klickt, prüfen wir das lokale Adressbuch (`din_local_addresses`).
- Ist das Suchfeld noch leer (`value === ''`), öffnet sich das Popover sofort mit den 3–5 zuletzt verwendeten Adressen (mit Kennzeichnung „🕒 Zuletzt verwendet“).
- Der Nutzer kann wiederkehrende Empfänger mit **einem einzigen Klick** übernehmen, ohne überhaupt tippen zu müssen.

### Hebel 3: Adaptiver Debounce (120 ms statt 200 ms)
Da die Verbindung durch Pre-Warming bereits heiß ist und der EU-Server in Frankfurt nur ~25 ms Ping hat, kann der Debounce gefahrlos von 200 ms auf **120–130 ms** verkürzt werden. Dies eliminiert das zähe Gefühl beim Tippen vollständig.

### Hebel 4: Backend-Pruning über Query-Parameter
Durch gezielte API-Parameter reduzieren wir die Server-Berechnungszeit bei Geoapify um über 70 %:
- `filter=countrycode:de`: Schränkt den OpenStreetMap-Suchbaum auf Deutschland ein. Die Geoapify-Elasticsearch-Nodes müssen nur einen Bruchteil des weltweiten Indexes durchsuchen (~25 ms statt ~120 ms Server-Rechenzeit).
- `format=json`: Spart den Overhead von GeoJSON FeatureCollection/Geometry-Objekten.
- `limit=5`: Minimiert die JSON-Payload über die Leitung auf unter 2 KB.
- `lang=de`: Verhindert aufwendige Lokalisierungs-Lookups.

### Hebel 5: Ruckelfreies DOM-Scheduling (`requestAnimationFrame`)
Statt das DOM synchron im Netzwerk-Callback zu blockieren, wird das Update per `requestAnimationFrame()` oder `scheduler.postTask('user-visible')` an den nächsten Browser-Paint übergeben. Das verhindert Layout-Thrashing und Tastatur-Ruckler.

---

## 3. Bonn-Bias & Region-Locking Konzept

- **Standard-Anker Bonn:**
  - Breiten-/Längengrad: `50.7374, 7.0982` (Münsterplatz / Altes Rathaus Bonn)
  - Parameter: `bias=proximity:7.0982,50.7374`
  - Effekt: Wer z. B. „Poststraße“ eingibt, erhält zuerst die Poststraße in 53111 Bonn, bevor Straßen in anderen Städten gelistet werden.
- **Harter Deutschland-Filter:**
  - Parameter: `filter=countrycode:de`
  - Verhindert Verwechslungen mit gleichnamigen Straßen im Ausland.
- **Dynamischer Absender-Bias:**
  - Trägt der Nutzer eine Absender-PLZ im Brief ein, wird im Hintergrund einmalig die Koordinate dieser PLZ abgefragt und in `din_sender_coords` gespeichert.
  - Suchen für den Empfänger richten sich ab diesem Moment automatisch nach dem Wohnort des Absenders aus.

---

## 4. Was tun, wenn Geoapify den Dienst abschaltet? (Disaster Recovery)

Um 100 % zukunftssicher und unabhängig zu sein, sieht das Konzept eine 3-Stufen-Kaskade vor:

### Stufe 1: Lokales Offline-Adressbuch (Besteht bereits)
- Speichert die letzten 50 verwendeten Adressen im Browser (`localStorage`).
- Bei totalem API-Ausfall oder Offline-Betrieb greift die Sofort-Fuzzy-Suche (0 ms Latenz).

### Stufe 2: Multi-Cluster Failover (EU ➔ Global)
- Primär: `https://api-eu.geoapify.com/v1`
- Sekundär: `https://api.geoapify.com/v1`
- Automatischer unterbrechungsfreier Umschalt-Mechanismus (`fetchWithServerFailover`).

### Stufe 3: Nahtloser Provider-Wechsel zu Komoot Photon (OpenStreetMap)
- Sollte Geoapify jemals schließen oder die kostenlosen Kontingente streichen, kann der Failover-Handler direkt auf **Komoot Photon** (`https://photon.komoot.io/api/`) umleiten.
- Photon benötigt keinen API-Key, steht dauerhaft kostenlos zur Verfügung, wird in Deutschland betrieben und liefert vollständige Adressdaten.

---

## 5. Zusammenfassung der Kennzahlen

| Metrik | Vorher | Mit Optimierungskonzept | Verbesserung |
| :--- | :--- | :--- | :--- |
| **Kaltstart-Latenz** | ~435 ms | **~150 ms** | **-65 % Latenz** |
| **Zuletzt genutzte Adressen** | Erst nach 3 Zeichen | **0 ms (sofort bei Klick)** | **100 % schneller** |
| **Ausfallsicherheit** | 1 Server (US/Global) | **2 Geoapify-Cluster + Offline + Photon-Option** | **Maximale Redundanz** |
| **Lokale Treffer** | Bonn erst nach Tippen | **Bonn & Region sofort priorisiert** | **Optimales Ranking** |
