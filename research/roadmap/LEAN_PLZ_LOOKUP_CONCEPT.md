# Radikal schlanke PLZ-Erkennung: Warum Lat/Lon überflüssig sind

> **Architektur-Entscheidung:** DIN-Brief Neo (Recherche & Konzept)  
> **Prinzip:** Zero Bloat, 100 % DIN 5008 Fokus, maximale Einfachheit.

---

## 1. Das Problem mit Geokoordinaten (Lat / Lon)

Die ursprüngliche Überlegung, für jede deutsche Postleitzahl auch Breiten- und Längengrade mitzuführen, erweist sich bei genauerer Betrachtung als überflüssiger Ballast:

1. **Ein Brief kennt keine GPS-Koordinaten:**
   Nach der Norm **DIN 5008** besteht die Anschriftzeile ausschließlich aus:
   ```text
   [Empfänger Name]
   [Straße] [Hausnummer]
   [PLZ] [Ort]
   ```
   Niemand druckt GPS-Koordinaten auf einen Briefbogen.
2. **Aufgeblähte Datenstruktur:**
   Fließkommazahlen wie `50.7362` und `7.0982` verdoppeln die Datenmenge, erfordern Rundungslogik und bringen dem Nutzer beim Verfassen eines Briefes absolut null Mehrwert.
3. **Der Bonn-Bias braucht keine 8.000 Koordinaten:**
   Der Standard-Fokus auf den Großraum Bonn für Geoapify/Photon (`bias=proximity:7.0982,50.7374`) ist ein **fester Konfigurationswert** (1 Zeile Code). Dafür muss nicht jede deutsche PLZ geografisch vermessen im Browser liegen.

---

## 2. Die radikal einfache Lösung: Reine Key-Value Zuordnung

Die Tabelle besteht ausschließlich aus einer direkten Zuordnung von **5 Ziffern ➔ Ortsname**:

```json
{
  "53111": "Bonn",
  "53113": "Bonn",
  "53225": "Bonn",
  "80331": "München",
  "10115": "Berlin"
}
```

### Die Vorteile:
- **Einfachster Code der Welt:**
  ```javascript
  const ort = plzTabelle[plz]; // O(1) Lookup in 0,0001 ms!
  ```
- **Null Netzwerk-Overhead:** Keine HTTP-Anfrage, keine Latenz, keine Timeouts.
- **Keine Abhängigkeit:** Weder Zippopotam noch Geoapify noch OpenPLZ werden für die reine Stadt-Erkennung benötigt.
- **Flüsterleise Dateigröße:** Komprimiert rund **20 Kilobyte**.

---

## 3. Die 2-Ebenen-Arbeitsteilung im DIN-Brief

| Aufgabe | Wie wird es gelöst? | Dienst / Daten |
| :--- | :--- | :--- |
| **A. PLZ ➔ Ort (z. B. "53111" ➔ "Bonn")** | **Reine In-Memory Tabelle (0 ms)** | Lokale statische Zuordnung `{"53111": "Bonn"}` (Fallback bei unbekannter PLZ: OpenPLZ API) |
| **B. Vollständige Adresssuche mit Straße & Hausnummer** | **Externe Such-APIs (Autocomplete)** | Geoapify / HERE / Komoot Photon mit festem Bonn-Bias |

Damit bleibt die Anwendung absolut schlank, blitzschnell und frei von unnötigem Datenballast.
