# 19 · Brainstorm-Verifikation (fuenfte Liste)

Status: offen · Typ: audit · Erstellt: 2026-11-06
Quelle: sechster Vorschlag (Punkte A-F). Jeder Punkt gegen den Code geprueft.

## Validierung

| Punkt | Verdikt | Beleg |
|---|---|---|
| A webmcp-bridge vs. CSP | teilweise, falsch gerahmt | ws://127.0.0.1:8333 (webmcp-bridge.js:68), CSP connect-src 'self' https://api.geoapify.com. ABER: Datei wird nirgends geladen; dead-code-audit 4.5 sagt "wird nirgends importiert", Status "liegen gelassen" |
| B charactere.json | wahr | 303 Figuren; Sauron.buergerlicherName = "Tom Marvolo Riddle"; Mickey/Micky Maus und Roronoa Zoro/Zorro doppelt; firma null 38 vs "" 94; plz null 2 vs "" 202; kein .gz |
| C llms.txt Container | wahr | Zeile 16 woertlich: "ein Container fuer beide folgt." |
| D docs/ und tools/ | existieren, teils CI | fitness.yml faehrt node tools/build_db.js; update_plz_data.yml faehrt tools/build_plz_databases.py |
| E Cross-Browser-Doku | bereits erfasst | Schritt 1 im Arbeitsplan von 13 |
| F Abhaengigkeiten | wahr | webapi.d.ts (31 Z.) enthaelt CloseWatcher und ariaNotify; test/all.js importiert address.js |

## 37 · webmcp-bridge: Entscheidung abschliessen

Befund: Die Bridge oeffnet ws://127.0.0.1:8333 (webmcp-bridge.js:68). Die CSP
erlaubt nur 'self' und https://api.geoapify.com. Damit waere jede Verbindung
blockiert. Der Punkt ist aber staerker: Die Datei wird von keiner HTML-Seite
geladen (kein script-Tag, kein dynamischer Import). Sie ist bereits als toter
Code dokumentiert (docs/90-archive/dead-code-audit-2026-11-05.md, Befund 4.5,
"wird nirgends importiert", Status "liegen gelassen").
Constraint aus demselben Audit (4.8): Verschieben nach docs/90-archive/ bricht
die TypeScript-Pruefung, weil jsconfig das Archiv einschliesst.

Entscheidung noetig: loeschen (mit jsconfig-Anpassung) oder verdrahten (dann CSP
um ws://127.0.0.1:8333 erweitern und die Sicherheitsentscheidung dokumentieren).
Nicht weiter "liegen lassen".
Aufwand: XS.

## 38 · charactere.json: Datenfehler, Gzip, Dateiname

Befund (gemessen, 303 Figuren):
- Sauron: buergerlicherName "Tom Marvolo Riddle" (Voldemort). Alias-Liste mischt
  zusaetzlich "Morgoth" (andere Figur) und "Tom Riddle" hinein.
- Doppelte Figuren: "Mickey Maus" und "Micky Maus"; "Roronoa Zoro" und
  "Roronoa Zorro".
  ✅ 2026-11-08 zusammengelegt (6 Paare: Zorro→Zoro, The Joker→Joker,
  Yennefer→Yennefer von Vengerberg, Mickey→Micky, Vimes→Mumm, Goku→Son-Goku).
  Dabei Sauron bereinigt: buergerlicherName war "Tom Marvolo Riddle" (Voldemort),
  Aliase mischten Morgoth und Voldemort. Offen bleiben: gzip und Dateiname.
- firma: 38x null vs. 94x leerer String. plz: 2x null vs. 202x leerer String.
- Keine charactere.json.gz (die anderen Daten liegen gzipped vor).
- Dateiname "charactere" (Tippfehler). Referenzen: testbrief.js:409,
  tools/build_db.js:117, docs/STRUCTURE.md, docs/10-architecture/
  ARCHITECTURE-MAP.md, docs/20-implementation/testbrief-generator.md,
  docs/30-meta/DECISION-LOG.md. Umbenennen zieht alle nach.

Aufwand: S (Bereinigung ca. 30 Min, Gzip ca. 15 Min, Umbenennung nur wenn gewollt).

## 39 · llms.txt: Container-Ankuendigung

Befund: website/llms.txt Zeile 16 behauptet "ein Container fuer beide folgt."
Es gibt keinen TODO und kein Konzept fuer diesen Container. llms.txt wird von
LLM-Crawlern gelesen.
Entscheidung: Satz streichen, oder einen echten TODO anlegen und den Satz
zeitlich fassen.
Aufwand: XS.

## Nicht uebernommen

- D (docs/tools): keine neue Aufgabe. Beide Verzeichnisse existieren; build_db.js
  und build_plz_databases.py laufen in GitHub Actions. Die uebrigen Werkzeuge
  (imr.js, adr-check.js, lawcoverage.js, structural-laws.js) werden nur von sich
  selbst referenziert, sind aber nicht Teil der CI.
- E (Cross-Browser-Doku): bereits Schritt 1 im Arbeitsplan von 13, kein
  zusaetzlicher Eintrag.

## Abhaengigkeiten (eingetragen)

- 24 (Toast ohne CloseWatcher): danach webapi.d.ts bereinigen (31 Z., enthaelt
  CloseWatcher und ariaNotify).
- 33-35 (address.js aufteilen): test/all.js mitziehen (importiert address.js).
