# Verträge zu B8

Dieser Batch enthält 2 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/binary-storage.js` | 129 | `localStorage` kann nur Strings speichern; Base64 bläht Binärdaten um ~33 % auf und ist | `deleteBlob`, `loadBlob`, `saveBlob` |
| `website/js/core.js` | 267 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Constants`, `notify` |
| `website/js/persistence.js` | 849 | DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/js/address.js` | `AddressData`, `AddressIntelligence`, `BUNDESLAENDER`, `buildFirmenIndex`, `buildOrtIndex`, `fetchGzipJson`, `getDistrict`, `lowerBound`, `normalizePostcode`, `normalizeText`, `resolveCity`, `resolvePostcode` |
| `website/js/clipboard-parser.js` | `AddressData`, `AddressIntelligence`, `normalizeText` |
| `website/js/main.js` | `FontFeature` |
| `website/js/settings.js` | `FONT_PRESETS` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `address-data.js`: `BUNDESLAENDER`, `fetchGzipJson`, `normalizePostcode`, `resolvePostcode`, `getDistrict`, `resolveCity`, `normalizeText`, `buildOrtIndex`, `buildFirmenIndex`, `lowerBound`, `AddressIntelligence`, `AddressData`
- `font-feature.js`: `FONT_PRESETS`, `FontFeature`
