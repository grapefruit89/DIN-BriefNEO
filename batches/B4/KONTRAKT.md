# Verträge zu B4

Dieser Batch enthält 3 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/address.js` | 1063 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js` | `AddressIntelligence` |
| `website/js/core.js` | 267 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Constants`, `Events`, `eventBus`, `notify` |
| `website/js/document.js` | 671 | Native Selection- und Caret-Helfer (W3C Range / TreeWalker) | `EDITABLE_FIELD_SELECTOR`, `collectDraft`, `getCaretCharacterOffset`, `sanitizeRichText`, `setCaretCharacterOffset` |
| `website/js/field.js` | 32 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/format.js` | 446 | Formatiert eine eingegebene Telefonnummer nach DIN 5008 11.3.2 (Funktions- und | `currentISODate` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/js/address.js` | `STORAGE_KEYS`, `load`, `loadJSON`, `save`, `saveJSON` |
| `website/js/font-feature.js` | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `deleteBlob`, `loadBlob`, `loadJSON`, `saveBlob`, `saveJSON` |
| `website/js/main.js` | `DraftManager`, `MetadataService`, `initImportExport`, `requestPersistentStorage` |
| `website/js/salutation.js` | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |
| `website/js/settings.js` | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |
| `website/js/signature.js` | `deleteBlob`, `loadBlob`, `saveBlob` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `binary-storage.js`: `saveBlob`, `loadBlob`, `deleteBlob`
- `draft-manager.js`: `DraftManager`
- `persistence.js`: `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `load`, `save`, `remove`, `loadJSON`, `saveJSON`, `requestPersistentStorage`, `collectLetterIdentity`, `buildLetterFileName`, `isPrintTitleActive`, `MetadataService`, `DINLETTER_FORMAT`, `DOCUMENT_SCHEMA_V5`, `stripHtmlToPlaintext`, `buildDinLetterPayload`, `parseDinLetterPayload`, `exportDocumentToFile`, `registerDraftCollector`, `buildDINLetterJSON`, `applyImportedData`, `initImportExport`
