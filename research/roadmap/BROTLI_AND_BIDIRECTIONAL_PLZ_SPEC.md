# Brotli-Kompression & Bidirektionale PLZ-Ort-Architektur

> **Status:** Konzept & Machbarkeitsanalyse (Reine Recherche, keine Änderungen am Produktiv-Repository).  
> **Fokus:** Ladezeiten, Speicherlimits und die perfekte Balance zwischen Offline-Daten und Online-APIs.

---

## 1. Was ist Brotli-Kompression und wie schnell ist sie?

### Was ist Brotli?
- **Brotli (`.br`)** ist ein von Google entwickelter, moderner Kompressionsalgorithmus (RFC 7932), der speziell für Webinhalte (HTML, CSS, JavaScript, JSON) konzipiert wurde.
- **Warum ist Brotli bei Städtenamen so extrem stark?**  
  Brotli enthält ein **festes integriertes Wörterbuch** mit mehr als 13.000 gängigen Wörtern und Phrasen. Da viele deutsche Ortsnamen und Endungen („-hausen“, „-burg“, „-dorf“, „Bad“, „am Rhein“) in dieses Muster passen, erreicht Brotli typischerweise **20 % bis 26 % höhere Kompression als herkömmliches Gzip**.

### Wie schnell wird das im Browser entpackt?
- **Dekompressionszeit:** **Unter 1 Millisekunde** (typisch 0,2 bis 0,6 ms für 20 KB Daten).
- **Wie nutzt man das im Web?**
  1. **Nativ über HTTP-Header (Empfohlen):**  
     Jeder moderne Browser (Chrome, Edge, Firefox, Safari) sendet bei Anfragen automatisch:
     `Accept-Encoding: gzip, deflate, br`  
     Liefert der Webserver die vorberechnete Datei mit `Content-Encoding: br` aus, entpackt der Browser die Daten direkt in nativem C++-Maschinencode – **vollkommen transparent, ohne eine einzige Zeile JavaScript!**
  2. **Im Code via modernem Standard:**  
     Moderne Browser unterstützen die native `DecompressionStream`-API, falls komprimierte Blobs direkt im Client entpackt werden sollen.

---

## 2. Warum alle Straßen Deutschlands zu speichern Wahnsinn wäre

Deine Einschätzung ist zu 100 % zutreffend: **Alle Straßen in den Browser zu laden, wäre absolut unbrauchbar.**

### Die Zahlen im Vergleich:

| Datenumfang | Anzahl Einträge | Unkomprimierte Größe | Komprimiert | Browser-Auswirkung |
| :--- | :--- | :--- | :--- | :--- |
| **Alle deutschen Straßen** | **~1.250.000 Straßen** | **150 bis 280 Megabyte** | **~35 bis 50 MB** | 🛑 **Tödlich:** Sekundenlange Ladezeit, Speicherüberlauf (Heap-Crash), friert Smartphones und Laptops ein. |
| **Alle deutschen Hausnummern** | **> 22.000.000 Gebäude** | **Mehrere Gigabyte** | **> 400 MB** | 🛑 **Völlig unmöglich im Client.** |
| **Alle deutschen PLZ + Orte** | **Exakt 8.170 PLZ** | **~190 Kilobyte** | **~20 KB (Brotli)** | 🟢 **Perfekt:** Kleiner als ein Mini-Icon, in 1 ms geladen, 0 ms Latenz. |

### Das Fazit:
- **PLZ + Ort:** Gehört zu 100 % in den lokalen Offline-Speicher des Browsers.
- **Straßen + Hausnummern:** Dürfen **niemals** komplett vorgeladen werden, sondern werden bei Bedarf on-demand über die API (Geoapify / HERE / Photon) gesucht.

---

## 3. Die bidirektionale PLZ-Ort-Logik (Die perfekte Lösung)

Eine bidirektionale Zuordnung löst beide typischen Nutzergewohnheiten blitzschnell im Browser:

```text
[Eingabefeld im Brief: PLZ / Ort]
          │
          ├── Fall A: Nutzer tippt Zahl (z. B. "53111")
          │     └── Sofortige Ergänzung: "Bonn" (0 ms)
          │
          └── Fall B: Nutzer tippt Stadtname (z. B. "Bonn")
                └── Schlägt sofort die Haupt-PLZ "53111" vor
                    bzw. Dropdown: "53111 Bonn-Zentrum", "53225 Bonn-Beuel", "53177 Bad Godesberg"
```

### Wie ist das Datenobjekt aufgebaut?
Ein extrem kompaktes JSON-Objekt genügt:

```json
{
  "53111": "Bonn",
  "53113": "Bonn (Gronau)",
  "53115": "Bonn (Weststadt)",
  "53177": "Bonn (Bad Godesberg)",
  "53225": "Bonn (Beuel)",
  "80331": "München (Altstadt)",
  "10115": "Berlin (Mitte)"
}
```

### Die Vorteile in der Praxis:
1. **Zahlen-Eingabe (`5311x`):**  
   Tippt der Nutzer `53111`, springt der Ort sofort auf `Bonn`. Tippt er `53225`, erscheint sofort `Bonn (Beuel)`.
2. **Namen-Eingabe („Bonn“):**  
   Tippt der Nutzer `Bonn`, filtert eine einfache 2-Zeilen-Fuzzy-Suche im Speicher sofort die passenden Postleitzahlen heraus und setzt als Default die Zentrum-PLZ `53111`.
3. **Hausnummern bleiben individuell:**  
   Die Hausnummer wird vom Nutzer entweder manuell eingetippt oder bei der optionalen Straßen-Vervollständigung per API übernommen.
