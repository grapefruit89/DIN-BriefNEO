# Batch 07 — PDF-Export: braucht es eine Bibliothek, und wenn ja welche?

## Rolle

Du bist **Produkt- und Plattform-Architekt** für einen Browser-Druck-Workflow.
Du änderst **nichts**. Du prüfst eine Frage: **was fehlt dem heutigen
PDF-Weg wirklich — und rechtfertigt das eine Bibliothek?**

**Wichtig:** Der Auftrag legt **keine** Bibliothek nahe. jsPDF, pdf-lib,
pdfmake, PDFKit sind *Kandidaten unter anderen* und ausdrücklich nicht
gesetzt. „Ist halt so" ist kein Argument; jedes Kapitel deiner Antwort muss auf
einer Zahl, einer Zeile oder einem gemessenen Verhalten stehen.

## Kontext

**DIN-BriefNEO** druckt DIN 5008 als A4 im Browser. Kein Framework, kein Build,
kein Präprozessor, keine externen Assets (A38), kein Service Worker (A37).
`website/` ist auslieferbar und muss allein auf einem Webserver starten (A45).

Der Druck läuft **heute** so: Knopf → `window.print()` → der Browser-Dialog
erzeugt das PDF. Davor räumen `beforeprint`-Hooks auf (Mehrseiten-DOM,
Metadaten), danach stellen `afterprint`-Hooks den Zustand zurück.

Zahlen aus `fakten.md` (mit Zeile bzw. gemessen):

| | |
|---|---:|
| Auslieferung gesamt | **802 KB roh / 307 KB gzip** |
| davon JS | 404 KB / 134 KB gzip |
| davon CSS | 109 KB / 36 KB gzip |
| `@page`-Regeln | 2 Dateien (`sheet-multipage.css:455`, `sheet.css:310` – letztere stillgelegt) |
| Druck-Aufrufe im Code | 1 × `window.print()`, 4 × `before/afterprint` |
| PDF-Writer im Code | **keiner** |
| CSP | `script-src 'self'` — Bibliothek im Repo erlaubt, CDN nicht |

## Die Entscheidungsräume (alle vier ernst nehmen)

**A — Browser-Dialog bleibt.** `window.print()`; der Nutzer wählt „Als PDF
speichern". Ein Klick mehr, null Byte, Layout bleibt die Wahrheit (CSS).

**B — Eigener Writer baut das Layout nach** (jsPDF, pdf-lib, pdfmake, …).
Dann existieren **zwei Layouts**: CSS für den Schirm, Code für die Datei. Das
ist keine Fußnote, sondern das Ende des WYSIWYG-Versprechens — jede Änderung an
`sheet-*.css` müsste doppelt nachgezogen werden.

**C — Der Browser rendert und wir liefert nur die Datei.** Geprüft werden muss,
ob es dafür heute einen Web-Standard gibt (`showSaveFilePicker` gibt es schon
im Repo, aber nur für JSON; ein „print to file" ohne Dialog ist **nicht**
standardisiert). Wenn es ihn nicht gibt: sagen, mit Quelle.

**D — Etwas dazwischen.** Z. B. `beforeprint` verbessern (Metadaten,
Dateiname), damit der Dialogweg so gut wird, dass eine Bibliothek nichts mehr
hinzufügt.

Für jede Variante gilt: **Kosten in Byte, Zeilen und Wartung** und **was der
Nutzer dadurch wirklich gewinnt**. „Bessere Qualität" ist keine Antwort, wenn
das PDF schon Text (kein Raster) und eingebettete Schriften hat.

## Aufgaben

**1. Den Ist-Zustand festnageln.** Was genau liefert `window.print()` heute?
Belege am erzeugten PDF: Text oder Raster (`pdftotext` / `pdffonts`),
Seitenzahl, Papierformat, Metadaten (Titel/Autor). Wo setzt der Code den Titel
(`MetadataService`, `document.title`)? Nenne die Zeilen.

**2. Die Lücke benennen.** Was fehlt dem Nutzer *konkret*? Frag nicht „was wäre
schöner", sondern: welcher Schritt kostet ihn heute Zeit — Dialog, Dateiname,
Ablageort, Metadaten, mehrere Briefe auf einmal? Belege jeden Punkt, sonst
streich ihn.

**3. Variante B ehrlich rechnen.** Wenn ein Writer das Layout nachbaut: wie
viele Stellen müssten synchron gehalten werden? Nenne die Maße, die aus
`sheet-multipage.css` / den `data-*`-Attributen kommen (Betreff 107 mm,
Faltmarken, `--rand-u`, Absatzabstand 1,5 mm …) und schätze die Zeilen, die ein
Writer dafür bräuchte. Danach: **lohnt das?** Wenn nein, sag es mit diesen
Zahlen.

**4. Die Byte-Frage.** Was würde der kleinste sinnvolle Kandidat kosten —
roh und gzip — und wo läge er im Verhältnis zu den heutigen 307 KB gzip? Nur
Größenordnungen mit Quelle (Paket-Repository/Release, nicht geschätzt aus dem
Gedächtnis). **Lazy** laden wäre Pflicht; sag, was das im Boot-Pfad bedeutet.

**5. Der Andockpunkt.** Der Plugin-Punkt (B52) existiert **noch nicht**. Wie
käme ein PDF-Addon heute rein, ohne den Boot-Pfad zu belasten? Muster:
`website/addons/` + `import()` beim Klick. Was fehlt dafür (Registrierung,
Einstellung, Sichtbarkeit des Knopfs)?

**6. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche
Entscheidung?

## Messmethode (mitliefern, nicht nachfragen)

- PDF prüfen: `pdftotext -layout` (Text vorhanden?), `pdffonts` (Schriften
  eingebettet?), `pdfinfo` (Format, Seiten, Metadaten).
- Drucken: `tools/druck-pixel.mjs <ziel>` — 4 Referenzbriefe, 6 Seiten; jeder
  Eingriff in den Druckpfad wird damit pixelweise verglichen (Toleranz 0).
- „Ein Klick weniger" ist **keine** Messung. Wenn du es als Vorteil nennst,
  sag, wie viele Klicks heute nötig sind (mit Beleg aus dem Code).

## Form deiner Antwort

- Maximal zwei Bildschirmseiten.
- Jede Behauptung: Zahl, Zeile oder gemessenes Verhalten. Ohne Beleg:
  **ungeprüft** markieren und die Gegenprobe nennen.
- Am Ende: **Empfehlung A/B/C/D** mit Kosten in Byte/Zeilen, Risiko in einem
  Satz, und dem **einen Test**, der die Entscheidung absichert.
- Wenn deine Empfehlung „nichts bauen" ist, ist das ein vollwertiges Ergebnis.

## Was du nicht tun sollst

- **Keine Bibliothek voraussetzen** — auch nicht jsPDF „weil üblich".
- Kein CDN, kein Service Worker, kein Build-Schritt, kein Framework (A37,
  A38, A45).
- Keine Optik- oder Geometrieänderung vorschlagen; DIN-Maße sind tabu.
- Keine Empfehlung, die zwei Layouts nebeneinander pflegt, **ohne** die
  doppelte Pflege ausdrücklich zu beziffern.
- Keine Aussage über Dateien, die nicht im Anhang sind — verweise auf den
  Kontrakt.
