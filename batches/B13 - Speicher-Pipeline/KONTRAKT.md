# Verträge zu B13 - Speicher-Pipeline

Dieser Batch enthält 7 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/address.js` | 1169 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js` | `AddressIntelligence`, `initAddressServices`, `initSenderSync` |
| `website/js/clipboard-parser.js` | 615 | (Impressum, Google-Maps-Copy, CSV) in Anschrift-Kandidaten und bietet die | `ClipboardAddressParser` |
| `website/js/document.js` | 932 | Native Selection- und Caret-Helfer (W3C Range / TreeWalker) | `EDITABLE_FIELD_SELECTOR`, `UIProtections`, `collectDraft`, `getCaretCharacterOffset`, `initFormatSync`, `sanitizeRichText`, `setCaretCharacterOffset`, `toggleBlockquote`, `toggleInlineFormat` |
| `website/js/field.js` | 32 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/format.js` | 450 | import { Field } from './field.js'; | `applyLetterDate`, `currentISODate`, `formatTelefonnummer` |
| `website/js/salutation.js` | 346 | Anrede & Grußformel — bewusst klein (80/20), dafür verlässlich | `SalutationFeature` |
| `website/js/settings.js` | 308 | Die Signatur-Engine liegt in `signature.js`, das Font-Management in `font-feature.js` | `SettingsManager` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/addons/testbrief/testbrief.js` | `Events`, `eventBus` |
| `website/addons/webmcp-bridge.js` | `Events`, `eventBus` |
| `website/js/address.js` | `Constants`, `Events`, `STORAGE_KEYS`, `eventBus`, `hidePopoverSafe`, `load`, `loadJSON`, `notify`, `save`, `saveJSON`, `showPopoverSafe` |
| `website/js/clipboard-parser.js` | `Constants`, `Events`, `eventBus`, `hidePopoverSafe`, `notify`, `showPopoverSafe` |
| `website/js/salutation.js` | `Constants`, `DEFAULT_SETTINGS`, `Events`, `STORAGE_KEYS`, `eventBus`, `loadJSON`, `saveJSON` |
| `website/js/settings.js` | `DEFAULT_SETTINGS`, `Events`, `FONT_PRESETS`, `STORAGE_KEYS`, `eventBus`, `loadJSON`, `saveJSON` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `binary-storage.js`: `saveBlob`, `loadBlob`, `deleteBlob`
- `core.js`: `Constants`, `EVENT_PREFIX`, `Events`, `createEventBus`, `eventBus`, `initToastSystem`, `showToast`, `notify`, `showPopoverSafe`, `hidePopoverSafe`
- `draft-manager.js`: `DraftManager`
- `font-feature.js`: `FONT_PRESETS`, `FontFeature`
- `main.js`: nur Seiteneffekte
- `persistence.js`: `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `load`, `save`, `remove`, `loadJSON`, `saveJSON`, `requestPersistentStorage`, `collectLetterIdentity`, `buildLetterFileName`, `isPrintTitleActive`, `MetadataService`, `DINLETTER_FORMAT`, `DOCUMENT_SCHEMA_V5`, `stripHtmlToPlaintext`, `buildDinLetterPayload`, `parseDinLetterPayload`, `exportDocumentToFile`, `registerDraftCollector`, `buildDINLetterJSON`, `applyImportedData`, `initImportExport`
- `signature.js`: `SignatureFeature`
