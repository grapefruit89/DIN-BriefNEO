# Verträge zu B2b

Dieser Batch enthält 4 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/address.js` | 1063 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js` | `AddressIntelligence`, `initAddressServices`, `initSenderSync` |
| `website/js/clipboard-parser.js` | 615 | (Impressum, Google-Maps-Copy, CSV) in Anschrift-Kandidaten und bietet die | `ClipboardAddressParser` |
| `website/js/document.js` | 671 | Native Selection- und Caret-Helfer (W3C Range / TreeWalker) | `UIProtections`, `collectDraft`, `initFormatSync`, `toggleBlockquote`, `toggleInlineFormat` |
| `website/js/draft-manager.js` | 492 | die State-Machine hat nichts mit DOM- und Caret-Manipulation zu tun | `DraftManager` |
| `website/js/font-feature.js` | 283 | CSS Font Loading API Injection und Persistenz (FontFeature) | `FontFeature` |
| `website/js/format.js` | 446 | Formatiert eine eingegebene Telefonnummer nach DIN 5008 11.3.2 (Funktions- und | `applyLetterDate`, `formatTelefonnummer` |
| `website/js/persistence.js` | 849 | DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API | `MetadataService`, `initImportExport`, `requestPersistentStorage` |
| `website/js/salutation.js` | 342 | Anrede & Grußformel — bewusst klein (80/20), dafür verlässlich | `SalutationFeature` |
| `website/js/settings.js` | 289 | Die Signatur-Engine liegt in `signature.js`, das Font-Management in `font-feature.js` | `SettingsManager` |
| `website/js/signature.js` | 312 | die Signatur-Engine teilt fachlich nichts mit Theme- und Layout-Toggles | `SignatureFeature` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/addons/testbrief/testbrief.js` | `Events`, `Field`, `eventBus` |
| `website/addons/webmcp-bridge.js` | `Events`, `eventBus` |
| `website/js/address.js` | `Constants`, `Events`, `Field`, `eventBus`, `hidePopoverSafe`, `notify`, `showPopoverSafe` |
| `website/js/clipboard-parser.js` | `Constants`, `Events`, `Field`, `eventBus`, `hidePopoverSafe`, `notify`, `showPopoverSafe` |
| `website/js/document.js` | `Field` |
| `website/js/draft-manager.js` | `Constants`, `Events`, `Field`, `eventBus` |
| `website/js/font-feature.js` | `Constants`, `notify` |
| `website/js/multipage-controller.js` | `Field` |
| `website/js/persistence.js` | `Constants`, `Field`, `notify` |
| `website/js/salutation.js` | `Constants`, `Events`, `Field`, `eventBus` |
| `website/js/settings.js` | `Events`, `eventBus` |
| `website/js/signature.js` | `Constants`, `notify` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `boot.js`: nur Seiteneffekte
- `core.js`: `Constants`, `EVENT_PREFIX`, `Events`, `createEventBus`, `eventBus`, `initToastSystem`, `showToast`, `notify`, `showPopoverSafe`, `hidePopoverSafe`
- `field.js`: `Field`
- `main.js`: nur Seiteneffekte
