# Verträge zu B12 - Input-Migration

Dieser Batch enthält 13 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `test/runner.js` | 122 | test/runner.js — Zero-Dependency Mini-Test-Runner (Option B, DECISION-LOG 2026-09-10) | `assert`, `assertEqual`, `describe`, `it`, `run` |
| `website/addons/testbrief/testbrief.js` | 1514 | addons/testbrief.js — Testbrief-Generator-Addon für DIN-BriefNEO | `FLOSKELN`, `Figurenkatalog`, `SZENARIEN`, `bezeichne`, `buildAnschriftLines`, `floskele`, `franchiseKey`, `generateNerdText`, `generiereTestEmail`, `generiereTestTelefon`, `getCharHook`, `hatWonkaBezug`, `randomBetreff`, `setField`, `sindIdentisch`, `slugify`, `toT9`, `waehleAnker`, `waehleBesetzung`, `waehleSzenario` |
| `website/js/address.js` | 1104 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js` | `AddressData`, `AddressIntelligence`, `BUNDESLAENDER`, `bindListSelection`, `buildFirmenIndex`, `buildOrtIndex`, `feld`, `getDistrict`, `initAddressServices`, `initSenderSync`, `normalizePostcode`, `resolveCity`, `resolvePostcode`, `spiegelEntscheidung` |
| `website/js/binary-storage.js` | 129 | `localStorage` kann nur Strings speichern; Base64 bläht Binärdaten um ~33 % auf und ist | `deleteBlob`, `loadBlob`, `saveBlob` |
| `website/js/core.js` | 275 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Constants`, `Events`, `createEventBus`, `eventBus`, `hidePopoverSafe`, `initToastSystem`, `notify`, `showPopoverSafe` |
| `website/js/font-feature.js` | 291 | CSS Font Loading API Injection und Persistenz (FontFeature) | `FONT_PRESETS`, `FontFeature` |
| `website/js/settings.js` | 308 | Die Signatur-Engine liegt in `signature.js`, das Font-Management in `font-feature.js` | `SettingsManager` |
| `website/js/signature.js` | 322 | die Signatur-Engine teilt fachlich nichts mit Theme- und Layout-Toggles | `SignatureFeature` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/addons/testbrief/testbrief.js` | `Field`, `SalutationEngine`, `applyLetterDate` |
| `website/js/address.js` | `AddressData`, `AddressIntelligence`, `BUNDESLAENDER`, `ClipboardAddressParser`, `Field`, `STORAGE_KEYS`, `buildFirmenIndex`, `buildOrtIndex`, `fetchGzipJson`, `getDistrict`, `load`, `loadJSON`, `lowerBound`, `normalizePostcode`, `normalizeText`, `resolveCity`, `resolvePostcode`, `save`, `saveJSON`, `setCaretToEnd` |
| `website/js/font-feature.js` | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |
| `website/js/multipage-controller.js` | `Field` |
| `website/js/settings.js` | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `address-data.js`: `BUNDESLAENDER`, `fetchGzipJson`, `normalizePostcode`, `resolvePostcode`, `getDistrict`, `resolveCity`, `normalizeText`, `buildOrtIndex`, `buildOrtsteilIndex`, `buildFirmenIndex`, `lowerBound`, `AddressIntelligence`, `AddressData`
- `all.js`: nur Seiteneffekte
- `boot-state.js`: nur Seiteneffekte
- `clipboard-parser.js`: `ClipboardAddressParser`
- `document.js`: `sanitizeRichText`, `formatElementMicroTypography`, `getCaretCharacterOffset`, `setCaretCharacterOffset`, `setCaretToEnd`, `toggleBlockquote`, `toggleInlineFormat`, `syncFormatState`, `initFormatSync`, `UIProtections`, `EDITABLE_FIELD_SELECTOR`, `collectDraft`
- `draft-manager.js`: `DraftManager`
- `field.js`: `Field`
- `format.js`: `formatTelefonnummer`, `formatDatum`, `formatUhrzeit`, `formatIban`, `formatPostfach`, `formatGeldbetrag`, `currentISODate`, `formatLetterDate`, `applyLetterDate`, `applyMicroTypography`
- `main.js`: nur Seiteneffekte
- `persistence.js`: `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `load`, `save`, `remove`, `loadJSON`, `saveJSON`, `requestPersistentStorage`, `collectLetterIdentity`, `buildLetterFileName`, `isPrintTitleActive`, `MetadataService`, `DINLETTER_FORMAT`, `DOCUMENT_SCHEMA_V5`, `stripHtmlToPlaintext`, `buildDinLetterPayload`, `parseDinLetterPayload`, `exportDocumentToFile`, `registerDraftCollector`, `buildDINLetterJSON`, `applyImportedData`, `initImportExport`
- `salutation.js`: `SALUTATION_TONES`, `deriveSalutation`, `SalutationEngine`, `SalutationFeature`
