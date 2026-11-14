# Verträge zu 01-architektur-vertrag

Diese Scheibe ist nach Thema geschnitten, der Code haengt aber an
Importen. Alles, was sie von aussen braucht, steht hier mit Rolle und
den tatsaechlich importierten Symbolen — ohne den Code der fremden
Module. Beurteile, ob die Scheibe die Naht richtig benutzt, nicht wie
die fremden Module intern aussehen.

Quelle: die `import`-Zeilen der Scheibe. Keine transitive Analyse —
was ein fremdes Modul selbst importiert, steht hier nicht.

## Was diese Scheibe von aussen braucht

| Modul | Zeilen | Rolle (Dateikopf) | genutzte Symbole |
|---|---:|---|---|
| `website/js/address.js` | 1315 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js`. | `AddressIntelligence`, `initAddressServices`, `initSenderSync` |
| `website/js/clipboard-parser.js` | 616 | (Impressum, Google-Maps-Copy, CSV) in Anschrift-Kandidaten und bietet die | `ClipboardAddressParser` |
| `website/js/core.js` | 276 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung. | `Events`, `eventBus`, `initToastSystem` |
| `website/js/document.js` | 933 | Bündelt: | `UIProtections`, `collectDraft`, `initFormatSync`, `toggleBlockquote`, `toggleInlineFormat` |
| `website/js/draft-manager.js` | 567 | Speicherzustand des Entwurfs. Aus `document.js` ausgelagert (2026-11-08): | `DraftManager` |
| `website/js/field.js` | 33 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/font-feature.js` | 296 | CSS Font Loading API Injection und Persistenz (FontFeature). | `FontFeature` |
| `website/js/format.js` | 451 | Formatiert eine eingegebene Telefonnummer nach DIN 5008 11.3.2 (Funktions- und | `applyLetterDate`, `formatTelefonnummer` |
| `website/js/persistence.js` | 877 | Bündelt die bisherigen 4 Module: | `MetadataService`, `initImportExport`, `requestPersistentStorage` |
| `website/js/salutation.js` | 341 | Anrede & Grußformel — bewusst klein (80/20), dafür verlässlich. | `SalutationFeature` |
| `website/js/settings.js` | 340 | Die Signatur-Engine liegt in `signature.js`, das Font-Management in `font-feature.js`. | `SettingsManager` |
| `website/js/signature.js` | 331 | und Persistenz der Unterschrift. Aus `settings.js` ausgelagert (2026-11-08): | `SignatureFeature` |

## Wer diese Scheibe von aussen benutzt

(niemand ausserhalb der Scheibe)
