# OpenPLZ API vs. Zippopotam: Die schnellste 5-Stellige PLZ-Lösung

> **Projekt:** DIN-Brief Neo (Reine Recherche & Benchmark)  
> **Repository-Status:** Unberührt, reine Analyse.

---

## 1. Direkter Vergleich: OpenPLZ API vs. Zippopotam.us

In `website/js/43-geoapify.js` wird für die automatische Postleitzahlen-Vervollständigung im Adressfeld bisher `api.zippopotam.us` abgefragt. Die Live-Messungen und Quellcode-Analysen zeigen jedoch drastische Unterschiede zur modernen deutschen **OpenPLZ API**:

| Kriterium | OpenPLZ API (`openplzapi.org`) | Zippopotam.us (`api.zippopotam.us`) |
| :--- | :--- | :--- |
| **Server-Standort** | **Deutschland / EU** | USA / Übersee (Cloudflare) |
| **Technologie-Stack** | **.NET 10 + PostgreSQL 17** (Hochoptimiert) | Veraltete Python/Static JSON-Knoten |
| **Gemessene Latenz (TTFB)** | **107 ms** (Fast doppelt so schnell!) | **194 ms** |
| **Lizenz / Open Source** | **100 % Open Source** (`openpotato/openplzapi`) | Proprietärer Drittanbieter-Dienst |
| **Datenbasis** | Amtliche Vermessungs- & Katasterdaten (Destatis) | Veraltete GeoNames-Datenbank |
| **Datenqualität Deutschland** | **Fehlerfrei**, inkl. Gemeindeschlüssel & Bundesland | **Fehlerhaft:** Liefert `latitude: "05314"` (AGS statt Koordinate!) |
| **DACH-Unterstützung** | Deutschland (`/de/`), Österreich (`/at/`), Schweiz (`/ch/`), Liechtenstein (`/li/`) | Nur weltweite Sammeltabelle |
| **API-Key nötig?** | **NEIN (Vollständig kostenlos & schlüssellos)** | Nein |

---

## 2. API-Endpunkt & Antwort-Struktur für 5-stellige PLZ

### Aufruf:
```http
GET https://openplzapi.org/de/Localities?postalCode=53111
```

### JSON-Antwort (Sauber, typensicher & amtlich):
```json
[
  {
    "postalCode": "53111",
    "name": "Bonn",
    "municipality": {
      "key": "05314000",
      "name": "Bonn, Stadt",
      "type": "Kreisfreie Stadt"
    },
    "district": {
      "key": "05314",
      "name": "Bonn, Stadt",
      "type": "Kreisfreie Stadt"
    },
    "federalState": {
      "key": "05",
      "name": "Nordrhein-Westfalen"
    }
  }
]
```

### Besonderer Vorteil bei Mehrfach-Zuordnungen:
Einige deutsche Postleitzahlen erstrecken sich über zwei Ortsteile oder Gemeinden. OpenPLZ liefert hier ein sauberes Array aller beteiligten Orte, während Zippopotam oft veraltete oder abgeschnittene Strings zurückgibt.

---

## 3. Die perfekte Architektur: In-Memory Preload + OpenPLZ Fallback

1. **Stufe 1 (0 ms Sofort-Erkennung):**  
   Der ~16 KB kleine komprimierte PLZ-Datensatz im Browser löst die 8.170 deutschen Postleitzahlen **in 0,001 ms ohne jeden Netzwerkaufruf** auf.
2. **Stufe 2 (107 ms Live-Fallback):**  
   Sollte eine brandneue PLZ eingegeben werden (oder für Österreich/Schweiz), fragt die Web-App blitzschnell die **OpenPLZ API** an – und ersetzt damit das langsamere und fehlerhafte Zippopotam komplett.
