# Verträge zu B6

Dieser Batch enthält 3 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/binary-storage.js` | 129 | `localStorage` kann nur Strings speichern; Base64 bläht Binärdaten um ~33 % auf und ist | `deleteBlob`, `loadBlob`, `saveBlob` |
| `website/js/core.js` | 267 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Constants`, `Events`, `eventBus`, `notify` |
| `website/js/font-feature.js` | 283 | CSS Font Loading API Injection und Persistenz (FontFeature) | `FONT_PRESETS` |
| `website/js/persistence.js` | 849 | DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API | `DEFAULT_SETTINGS`, `STORAGE_KEYS`, `loadJSON`, `saveJSON` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `website/js/main.js` | `SettingsManager`, `SignatureFeature` |

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `settings.js`: `SettingsManager`, `FONT_PRESETS`
- `signature.js`: `SignatureFeature`
