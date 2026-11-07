# 18 · Over-Engineering: Massenbefund (validiert)

Status: offen · Typ: audit · Erstellt: 2026-11-06
Quelle: Nachmessung nach 15. Gesucht: die groessten Konstruktionen, gemessen
an Zeilen und Verantwortlichkeiten.

## Messung

| Ort | Groesse | Befund |
|---|---|---|
| address.js | 2176 Z., 2 Klassen, 18 statische Methoden | vier unabhaengige Concerns in einer Datei |
| address.js wireDOM | 235 Z. (830-1065) | ein Inline-Handler von ca. 110 Z. (878-990) |
| ClipboardAddressParser | parse 168, applyCandidate 62, isCorporate 49, isStreetLine 32 | ca. 311 Z. Heuristik |
| debug-panel.js | 1029 Z. | bereits 19 |
| salutation.js | 409 Z., derive 129 Z. | bereits 18 |
| main.js initApp | 16 try / 18 catch | bereits 23 |

## Uebernommen

### 33 · address.js als God-Modul aufteilen

Der Dateikopf nennt selbst vier Buendel:
1. Native Gzip-Decompression (fetchGzipJson)
2. AddressIntelligence + initSenderSync (offline PLZ und Grossempfaenger)
3. ClipboardAddressParser (Anschrift aus Zwischenablage)
4. initAddressServices (Geoapify mit Cache, Debounce, lokaler Historie)

Diese vier teilen sich nichts ausser Imports. Aufteilung in vier Module
(z. B. gzip.js, address-engine.js, clipboard-parser.js, geoapify.js) ist
mechanisch, kein Verhalten aendert sich.
Aufwand: M. Nutzen: Dateien von 2176 auf je 300-700 Zeilen.

### 34 · wireDOM: Inline-Handler herausziehen

address.js:830-1065. Der Handler fuer empfOrtEl input (878-990) enthaelt vier
Faelle (0-2 Zeichen, 5 Ziffern, 3-4 Ziffern, Text) plus Grosskunden-Automatik
inline in einem 110-Zeilen-Block. Als benannte Funktionen extrahieren,
wireDOM wird zur reinen Verdrahtung.
Aufwand: S.

### 35 · ClipboardAddressParser pruefen

parse (168 Z.) parst freien Text in Anschrift-Kandidaten, applyCandidate (62 Z.)
schreibt sie in die Felder. Erreichbar nur ueber wireSidebarButton (100 Z.).
Entscheidung noetig: Feature behalten und in kleinere Schritte teilen, oder
streichen. Ohne diese Entscheidung kein Umbau.
Aufwand: S-M.

### 36 · Kompatibilitaets-Wrapper entfernen

debug-recorder.js und debug-json-panel.js (je 11 Z.) re-exportieren nur aus
debug-panel.js. Referenzen existieren nur in test/all.js, kein
Produktionsnutzen. Entfernen und Tests anpassen.
Aufwand: XS.

## Schon erfasst (keine Dubletten)

- debug-panel.js 1029 Z.: 19
- salutation.js Namenslisten: 18
- Toast-System: 24
- initApp try/catch: 23
- Postvermerk-Popover: 25

## Beobachtung, kein TODO

- tools/: 30 Dateien, 262 KB Meta-Tooling (lawcoverage, structural-laws,
  reconciliation, imr, terminology, isolation, links). Teil des Guard-Systems,
  hier nicht bewertet.
- addons/testbrief/charactere.json: 161 KB Daten fuer Plan 08. Inhalt, kein Code.

Nachtrag Abhaengigkeit: test/all.js importiert address.js (1x). Bei der Aufteilung 33-35 die Test-Importe mitziehen.
