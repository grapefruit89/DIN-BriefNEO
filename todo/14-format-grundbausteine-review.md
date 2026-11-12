# 14 · Format- und Grundbausteine-Review (validiert)

Status: abgeschlossen (Verdikte) · Geprüft: 2026-11-12 · Typ: audit · Erstellt: 2026-11-06
Quelle: zweite externe Ideenliste (6 Punkte, dort TODO-11 bis TODO-16).
Jeder Punkt wurde gegen den Code geprüft.

## Hinweis zur Nummerierung

Die externe Liste nennt ihre Punkte TODO-11 bis TODO-16. Im Repo sind 11 und 12
bereits vergeben (Sensibler Betreff, Teilbetreff), 13 ist der Review vom 2026-11-06.
Die übernommenen Punkte laufen daher als 14 bis 17.

## Validierung

| extern | Repo | Thema | Verdikt | Beleg |
|---|---|---|---|---|
| 11 | 14 | JSON-Schema-Export fuer das Payload | real, bereits als B36 erfasst | website/schema/ existiert nicht; docs/30-meta/schema-v6.json ist Frontmatter-Schema, nicht Payload |
| 12 | 15 | Export .txt / .md / .docx | real, Luecke | nur exportDocumentToFile (JSON, File System Access API + Blob-Fallback); sonst nur Browser-Druck |
| 13 | 16 | Quota-Monitoring + Backup | real, teilweise als B54/B55 erfasst | storage.estimate 0x; storage.persist wird bei JEDEM saveJSON-Write gerufen (persistence.js:191-196) |
| 14 | - | devalue fuer Date-Erhalt | schon in 13 enthalten | generated_at ist String; in 13 unter bewusst nicht |
| 15 | - | Intl.Segmenter | schon in 13 enthalten | 0x Intl.Segmenter; in 13 unter bewusst nicht |
| 16 | 17 | Web Share API | real, klein | navigator.share 0x |

## 14 · JSON-Schema fuer das Payload

Ausgangslage: Die .json-Datei wird intern durch parseDinLetterPayload validiert,
extern durch nichts. Ein exportiertes Schema erlaubt $schema in der Datei,
IDE-Autocomplete und CI-Validierung.
Befund: Die Entscheidung ist bereits offen als BACKLOG B36 ("Schema-Datei fuer v3
anlegen oder Verweis endgueltig streichen", website/schema/v3/din-letter.json).
Das vorhandene docs/30-meta/schema-v6.json betrifft Markdown-Frontmatter, nicht
den Brief. ajv ist nirgends im Einsatz (0x).
Entscheidung: Nur wenn externe Validierung konkret gebraucht wird. Handschreiben,
kein ajv im Browser.
Abhaengigkeit: Nach der Zerlegung aus 13 (Punkt 3), damit das Schema aus den
Teilvalidatoren abgeleitet werden kann.

## 15 · Export in .txt / .md / .docx

Ausgangslage: exportDocumentToFile schreibt nur JSON; PDF entsteht ueber den
Druckdialog (@page ist vorhanden).
Befund: Kein weiterer Export im Code; exportJSON kommt nur in tools/browser-audit.html vor.
Entscheidung: .txt und .md sind trivial (1 Std). .docx nicht jetzt (ZIP + XML ohne
Package, ca. 1 Tag, kein Bedarf).
Abhaengigkeit: keine.

## 16 · Quota-Monitoring + Backup

Ausgangslage: localStorage (Draft, Settings) plus IndexedDB (Signatur, Schrift,
binary-storage.js). saveJSON ruft navigator.storage.persist() bei jedem Write auf,
also beim Tippen etwa einmal pro Sekunde. Quota wird nicht ueberwacht.
Befund: storage.estimate 0x im gesamten Code. BACKLOG B54/B55 beschreiben bereits
den stummen Fehlerpfad (saveJSON faengt QuotaExceededError und gibt false zurueck;
Import-Fehlerpfad unerreichbar). BACKLOG notiert ausserdem fehlende Quota-Tests.
Entscheidung: Quota-Monitoring klein (ca. 30 Min, Anzeige im Sidebar-Footer ueber
storage.estimate). persist() aus dem heissen Pfad herausziehen. Backup-ZIP spaeter.
Abhaengigkeit: keine; ueberschneidet sich mit B54/B55, dort mitpflegen.

## 17 · Web Share API

Ausgangslage: navigator.share ist nirgends verwendet (0x).
Entscheidung: Nur bei mobilem Fokus. Die App ist desktop-orientiert (Seitenleiste,
DIN-A4-Blatt); Mobilitaet ist Thema von Plan 03.
Abhaengigkeit: Plan 03 (Mobile Ansicht).

## Nicht uebernommen

- devalue: bereits in 13 unter bewusst nicht (bricht Standard-JSON).
- Intl.Segmenter: bereits in 13 unter bewusst nicht. Korrektur zur externen Liste:
  die Limits sind 30 bis 140 Zeichen, nicht 45 bis 140 (absender-tel 30,
  betreff 140). Gezaehlt wird mit .length/.substring, also UTF-16-Code-Units.

## Bestehende Fundstellen im Repo

- BACKLOG B36: Schema-Datei fuer v3 (offen).
- BACKLOG B54, B55: saveJSON-Quota-Fehlerpfad und Import.
- BACKLOG: persist() bei jedem Write, fehlende Quota-Tests.
- persistence.js:191-196 persist(), :556-600 exportDocumentToFile.
- document.js:253-270 FIELD_MAX_LENGTHS.
