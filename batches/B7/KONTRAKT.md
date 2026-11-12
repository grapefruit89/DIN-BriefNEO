# Verträge zu B7

Dieser Batch enthält 1 Module. Alles, was er importiert und
nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist
Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen
Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob
es die Module gibt, und nicht, wie sie intern aussehen.

## Was dieser Batch von außen braucht

| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |
|---|---:|---|---|
| `website/js/core.js` | 267 | Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung | `Events`, `eventBus` |
| `website/js/field.js` | 32 | Minimale Feld-Abstraktion. Wird bei der Migration zur vollen | `Field` |
| `website/js/format.js` | 446 | Formatiert eine eingegebene Telefonnummer nach DIN 5008 11.3.2 (Funktions- und | `applyLetterDate` |
| `website/js/salutation.js` | 342 | Anrede & Grußformel — bewusst klein (80/20), dafür verlässlich | `SalutationEngine` |

Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte
(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".

## Wer diesen Batch von außen benutzt

Niemand — dieser Batch wird nur intern benutzt.

## Export-Fläche dieses Batches

(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)

- `testbrief.js`: `bereinigeOrtsangabe`, `istStrassenadresse`, `resolveStrasse`, `resolveOrt`, `plzNeuWuerfeln`, `resolvePlz`, `resolveOrtZeile`, `istOrganisation`, `resolveFirma`, `waehleAnker`, `istBriefbar`, `getCharHook`, `hatHooks`, `franchiseKey`, `bezeichne`, `FLOSKELN`, `floskele`, `SZENARIEN`, `waehleSzenario`, `resolveAnlagenEintrag`, `resolvePostvermerk`, `randomBetreff`, `generateNerdText`, `Figurenkatalog`, `buildAnschriftLines`, `setField`, `slugify`, `emailSlug`, `generiereTestEmail`, `toT9`, `generiereTestTelefon`, `sindIdentisch`, `hatWonkaBezug`, `waehleBesetzung`, `fuelleBrief`, `erstelleLangenDemoText`, `fuelleDemoText`, `wuerfelTestbrief`, `starteTestbrief`
