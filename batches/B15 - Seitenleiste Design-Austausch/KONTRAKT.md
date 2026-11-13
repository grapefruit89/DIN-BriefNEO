# Verträge zu B15 - Seitenleiste Design-Austausch

Dieser Batch enthält 3 Module (`settings.js`, `main.js`, `index.html`) und
2 Stylesheets. Alles, was er importiert und nicht enthält, steht unten mit
**Rolle, ohne Code**. Beurteile, ob dieser Batch die Naht richtig benutzt —
nicht, wie die fremden Module intern aussehen.

## Was dieser Batch von außen braucht

| Modul (absolut) | Zeilen | Rolle im Bezug auf die Leiste | genutzte Symbole |
|---|---:|---|---|
| `/home/moritz/repos/DIN-BriefNEO/website/js/core.js` | 275 | entkoppeltes Rückgrat; trägt den Event-Bus, über den die Leiste speichert und meldet | `Events`, `eventBus`, `initToastSystem` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/persistence.js` | 876 | Speicher- und Import/Export-Schicht hinter Speichern/Öffnen/Zurücksetzen | `DEFAULT_SETTINGS`, `loadJSON`, `STORAGE_KEYS`, `saveJSON`, `initImportExport`, `MetadataService`, `requestPersistentStorage` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/document.js` | 932 | Textformatierung der Leiste (fett/kursiv/Zitat) und `syncFormatState` | `collectDraft`, `initFormatSync`, `toggleBlockquote`, `toggleInlineFormat`, `UIProtections` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/address.js` | 1314 | Anschrift-Suche und Zwischenablage-Kandidaten in `zone-dokument` | `AddressIntelligence`, `initAddressServices`, `initSenderSync` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/clipboard-parser.js` | 615 | liest kopierte Anschrift/Impressum in Kandidaten | `ClipboardAddressParser` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/draft-manager.js` | 566 | Entwurf, Undo, Caret; hängt an den Feldern, nicht an der Leiste | `DraftManager` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/field.js` | 32 | minimale Feld-Abstraktion | `Field` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/font-feature.js` | 295 | Schriftwahl aus `zone-setup` | `FontFeature` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/format.js` | 450 | Datum und Mikrotypografie, ausgelöst über `main.js` | `applyLetterDate`, `formatTelefonnummer` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/salutation.js` | 346 | Anrede und Grußformel | `SalutationFeature` |
| `/home/moritz/repos/DIN-BriefNEO/website/js/signature.js` | 330 | Unterschrift/Stempel aus `zone-setup` | `SignatureFeature` |

## Wer diesen Batch von außen benutzt

| Modul | nutzt |
|---|---|
| `/home/moritz/repos/DIN-BriefNEO/website/js/font-feature.js` | `#select-schriftart` (die Auswahl in `zone-setup`) |
| `/home/moritz/repos/DIN-BriefNEO/website/js/address.js` | `#input-anschrift-suche`, `#anschrift-vorschlaege` |
| Büro-/Debug-Werkzeuge | `din-dev` öffnet `http://127.0.0.1:8088` (Wurzel = `website/`) |

## Export-Fläche dieses Batches

- `website/js/settings.js`: `SettingsManager`, `FONT_PRESETS`
- `website/js/main.js`: nur Seiteneffekte (Boot-Kette)
- `website/index.html`: das Dokument selbst — die Zonen, die Modus-Checkbox,
  die Statuszeile, die Dialoge

## Bekannte Grenzen, die im Review gelten

- Die Modus-Umschaltung ist **CSS-only** (`:has(#toggle-modus:checked)`);
  JS schaltet nur `checked` und spiegelt Attribute. Wer sie in JS verlagert,
  baut den FOUC-Schutz (`data-seeded`) neu — das ist entschieden.
- `website/css/sheet.css` ist **nicht eingebunden** (kein `<link>`, kein
  `@import`). Sie gehört nicht zu diesem Batch und ist keine Quelle.
