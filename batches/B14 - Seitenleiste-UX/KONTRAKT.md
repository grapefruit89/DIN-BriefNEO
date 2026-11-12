# Verträge zu B14 - Seitenleiste-UX

Dieser Batch enthält 4 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/address.js` | 1177 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js` | `AddressIntelligence`, `initAddressServices`, `initSenderSync` |
| `website/js/clipboard-parser.js` | 615 | (Impressum, Google-Maps-Copy, CSV) in Anschrift-Kandidaten und bietet die | `ClipboardAddressParser` |
| `website/js/core.js` | 275 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Events`, `eventBus`, `initToastSystem` |
| `website/js/draft-manager.js` | 562 | die State-Machine hat nichts mit DOM- und Caret-Manipulation zu tun | `DraftManager` |
| `website/js/field.js` | 32 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/font-feature.js` | 291 | CSS Font Loading API Injection und Persistenz (FontFeature) | `FONT_PRESETS`, `FontFeature` |
| `website/js/format.js` | 450 | import { Field } from './field.js'; | `applyLetterDate`, `applyMicroTypography`, `formatTelefonnummer` |
| `website/js/persistence.js` | 852 | DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API | `DEFAULT_SETTINGS`, `MetadataService`, `STORAGE_KEYS`, `initImportExport`, `loadJSON`, `requestPersistentStorage`, `saveJSON` |
| `website/js/salutation.js` | 346 | Anrede & Grußformel — bewusst klein (80/20), dafür verlässlich | `SalutationFeature` |
| `website/js/signature.js` | 322 | die Signatur-Engine teilt fachlich nichts mit Theme- und Layout-Toggles | `SignatureFeature` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/js/address.js` | `setCaretToEnd` |
| `website/js/draft-manager.js` | `EDITABLE_FIELD_SELECTOR`, `collectDraft`, `getCaretCharacterOffset`, `sanitizeRichText`, `setCaretCharacterOffset` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `document.js`: `sanitizeRichText`, `formatElementMicroTypography`, `getCaretCharacterOffset`, `setCaretCharacterOffset`, `setCaretToEnd`, `toggleBlockquote`, `toggleInlineFormat`, `syncFormatState`, `initFormatSync`, `UIProtections`, `EDITABLE_FIELD_SELECTOR`, `collectDraft`
- `main.js`: nur Seiteneffekte
- `settings.js`: `SettingsManager`, `FONT_PRESETS`
