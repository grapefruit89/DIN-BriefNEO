# Verträge zu B3

Dieser Batch enthält 2 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/address-data.js` | 918 | Native Gzip-Decompression (DecompressionStream API) von `orte.json.gz` und `grosskunden.json.gz` | `AddressData`, `AddressIntelligence`, `BUNDESLAENDER`, `buildFirmenIndex`, `buildOrtIndex`, `fetchGzipJson`, `getDistrict`, `lowerBound`, `normalizePostcode`, `normalizeText`, `resolveCity`, `resolvePostcode` |
| `website/js/core.js` | 274 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Constants`, `Events`, `eventBus`, `hidePopoverSafe`, `notify`, `showPopoverSafe` |
| `website/js/document.js` | 671 | Native Selection- und Caret-Helfer (W3C Range / TreeWalker) | `setCaretToEnd` |
| `website/js/field.js` | 32 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/persistence.js` | 849 | DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API | `STORAGE_KEYS`, `load`, `loadJSON`, `save`, `saveJSON` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/js/draft-manager.js` | `AddressIntelligence` |
| `website/js/main.js` | `AddressIntelligence`, `ClipboardAddressParser`, `initAddressServices`, `initSenderSync` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `address.js`: `feld`, `bindListSelection`, `spiegelEntscheidung`, `initSenderSync`, `initAddressServices`, `AddressData`, `AddressIntelligence`, `BUNDESLAENDER`, `buildFirmenIndex`, `buildOrtIndex`, `ClipboardAddressParser`, `fetchGzipJson`, `getDistrict`, `lowerBound`, `normalizePostcode`, `normalizeText`, `resolveCity`, `resolvePostcode`
- `clipboard-parser.js`: `ClipboardAddressParser`
