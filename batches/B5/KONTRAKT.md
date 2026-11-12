# Verträge zu B5

Dieser Batch enthält 3 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/core.js` | 267 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Constants`, `Events`, `eventBus` |
| `website/js/field.js` | 32 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/persistence.js` | 849 | DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/addons/testbrief/testbrief.js` | `SalutationEngine`, `applyLetterDate` |
| `website/js/address.js` | `setCaretToEnd` |
| `website/js/draft-manager.js` | `EDITABLE_FIELD_SELECTOR`, `collectDraft`, `getCaretCharacterOffset`, `sanitizeRichText`, `setCaretCharacterOffset` |
| `website/js/main.js` | `SalutationFeature`, `UIProtections`, `applyLetterDate`, `collectDraft`, `formatTelefonnummer`, `initFormatSync`, `toggleBlockquote`, `toggleInlineFormat` |
| `website/js/persistence.js` | `currentISODate` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `document.js`: `sanitizeRichText`, `formatElementMicroTypography`, `getCaretCharacterOffset`, `setCaretCharacterOffset`, `setCaretToEnd`, `toggleBlockquote`, `toggleInlineFormat`, `syncFormatState`, `initFormatSync`, `UIProtections`, `EDITABLE_FIELD_SELECTOR`, `collectDraft`
- `format.js`: `formatTelefonnummer`, `formatDatum`, `formatUhrzeit`, `formatIban`, `formatPostfach`, `formatGeldbetrag`, `currentISODate`, `formatLetterDate`, `applyLetterDate`, `applyMicroTypography`
- `salutation.js`: `SALUTATION_TONES`, `deriveSalutation`, `SalutationEngine`, `SalutationFeature`
