# Verträge zu B11 - FOUC-Vollstaendigkeit

Dieser Batch enthält 11 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/address.js` | 1104 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js` | `AddressIntelligence`, `initAddressServices`, `initSenderSync` |
| `website/js/binary-storage.js` | 129 | `localStorage` kann nur Strings speichern; Base64 bläht Binärdaten um ~33 % auf und ist | `deleteBlob`, `loadBlob`, `saveBlob` |
| `website/js/clipboard-parser.js` | 615 | (Impressum, Google-Maps-Copy, CSV) in Anschrift-Kandidaten und bietet die | `ClipboardAddressParser` |
| `website/js/core.js` | 275 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Constants`, `Events`, `eventBus`, `initToastSystem`, `notify` |
| `website/js/document.js` | 916 | Native Selection- und Caret-Helfer (W3C Range / TreeWalker) | `EDITABLE_FIELD_SELECTOR`, `UIProtections`, `collectDraft`, `getCaretCharacterOffset`, `initFormatSync`, `sanitizeRichText`, `setCaretCharacterOffset`, `toggleBlockquote`, `toggleInlineFormat` |
| `website/js/field.js` | 32 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/format.js` | 450 | import { Field } from './field.js'; | `applyLetterDate`, `formatTelefonnummer` |
| `website/js/persistence.js` | 852 | DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API | `DEFAULT_SETTINGS`, `MetadataService`, `STORAGE_KEYS`, `initImportExport`, `isPrintTitleActive`, `loadJSON`, `remove`, `requestPersistentStorage`, `save`, `saveJSON`, `stripHtmlToPlaintext` |
| `website/js/signature.js` | 322 | die Signatur-Engine teilt fachlich nichts mit Theme- und Layout-Toggles | `SignatureFeature` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/addons/testbrief/testbrief.js` | `SalutationEngine` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `boot-state.js`: nur Seiteneffekte
- `boot.js`: nur Seiteneffekte
- `draft-manager.js`: `DraftManager`
- `font-feature.js`: `FONT_PRESETS`, `FontFeature`
- `main.js`: nur Seiteneffekte
- `salutation.js`: `SALUTATION_TONES`, `deriveSalutation`, `SalutationEngine`, `SalutationFeature`
- `settings.js`: `SettingsManager`, `FONT_PRESETS`
