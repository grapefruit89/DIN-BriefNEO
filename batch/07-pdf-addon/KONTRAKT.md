# Verträge zu 07-pdf-addon

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
| `website/js/core.js` | 279 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung. | `Constants`, `notify` |
| `website/js/field.js` | 33 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/format.js` | 451 | Formatiert eine eingegebene Telefonnummer nach DIN 5008 11.3.2 (Funktions- und | `currentISODate` |

## Wer diese Scheibe von aussen benutzt

| Modul | importiert aus | Symbole |
|---|---|---|
| `address.js` | `persistence.js` | `load, loadJSON, STORAGE_KEYS, save, saveJSON` |
| `draft-manager.js` | `persistence.js` | `isPrintTitleActive, loadJSON, remove, STORAGE_KEYS, save, saveJSON, stripHtmlToPlaintext` |
| `font-feature.js` | `persistence.js` | `DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON` |
| `main.js` | `persistence.js` | `initImportExport, MetadataService, requestPersistentStorage` |
| `salutation.js` | `persistence.js` | `DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON` |
| `settings.js` | `persistence.js` | `DEFAULT_SETTINGS, istAn, loadJSON, STORAGE_KEYS, saveJSON` |
