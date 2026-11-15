# Verträge zu 05-zustand-restore

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
| `website/js/address.js` | 1384 | Re-exportiert die rein datengetriebenen Lookup-Funktionen aus `address-data.js`. | `AddressIntelligence` |
| `website/js/core.js` | 279 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung. | `Constants`, `Events`, `eventBus` |
| `website/js/document.js` | 933 | Bündelt: | `EDITABLE_FIELD_SELECTOR`, `collectDraft`, `getCaretCharacterOffset`, `sanitizeRichText`, `setCaretCharacterOffset` |
| `website/js/field.js` | 33 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/persistence.js` | 896 | Bündelt die bisherigen 4 Module: | `STORAGE_KEYS`, `isPrintTitleActive`, `loadJSON`, `remove`, `save`, `saveJSON`, `stripHtmlToPlaintext` |

## Wer diese Scheibe von aussen benutzt

| Modul | importiert aus | Symbole |
|---|---|---|
| `main.js` | `draft-manager.js` | `DraftManager` |
