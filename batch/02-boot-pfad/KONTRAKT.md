# Verträge zu 02-boot-pfad

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
| `website/js/core.js` | 276 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung. | `Events`, `eventBus` |
| `website/js/persistence.js` | 877 | Bündelt die bisherigen 4 Module: | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |

## Wer diese Scheibe von aussen benutzt

| Modul | importiert aus | Symbole |
|---|---|---|
| `main.js` | `settings.js` | `SettingsManager` |
