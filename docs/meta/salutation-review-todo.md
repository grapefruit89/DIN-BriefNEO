---
id: salutation-review-todo
title: "To-do & Review-Auftrag: Salutation-Engine Grenzfälle (4/80 Korpus-Fälle)"
type: reference
status: active
created: '2026-11-19'
updated: '2026-11-19'
tags:
  - din-briefneo
  - salutation
  - todo
  - review
  - corpus
summary: "Dokumentation und Spezifikation für To-do & Review-Auftrag: Salutation-Engine Grenzfälle (4/80 Korpus-Fälle)."
doc_links:
  - [[Salutation-Engine]]
  - [[BACKLOG]]
  - [[AUFGABEN-WEGWEISER]]
code_links:
  - website/js/salutation.js
  - test/corpus/address-cases.json
  - test/corpus/run.js
depends_on:
---
# To-do: Review-Auftrag Salutation-Engine (4 offene Grenzfälle)

> 📌 **Status:** Dokumentiertes To-do (nicht ausgeführt, reserviert für Review-Lauf).  
> **Ziel:** 76/80 → 80/80 bestandene Tests im Regressions-Korpus (`node test/corpus/run.js`).

---

## 1. Ausgangslage

In `website/js/salutation.js` laufen aktuell 76 von 80 Testfällen im Korpus fehlerfrei durch.
Vier bekannte Randfälle sind in `test/corpus/address-cases.json` mit `"known_fail": true` markiert:

| ID | Testfall / Beschreibung | Eingabe | Erwartetes Ergebnis | Aktuelles Ist-Ergebnis |
| :--- | :--- | :--- | :--- | :--- |
| **`rev-sal-004`** | Initialen bei Namen übersteuern Fallback | `Frau E. K. Meier` | `Sehr geehrte Frau Meier,` | `Sehr geehrte Frau E. K. Meier,` |
| **`rev-sal-007`** | Bindestrich-Doppelname mit Adelstitel & Dr. | `Dr. Hans-Peter von Müller-Lüdenscheidt` | `Sehr geehrter Herr von Müller-Lüdenscheidt,` | `Sehr geehrte Damen und Herren,` |
| **`sal-multi-001`** | Mehrere akademische Titel inkl. `mult.` | `Prof. Dr. Dr. h.c. mult. Angela Merkel` | `Sehr geehrte Frau Merkel,` | `Sehr geehrte Damen und Herren,` |
| **`sal-casual-001`** | Legere Anrede bei Bindestrich-Name & Titel | `Dr. Hans-Peter von Müller-Lüdenscheidt` *(casual)* | `Hallo Hans-Peter,` | `Hallo,` |

---

## 2. Review-Leitfaden für den Bearbeiter (z. B. Gemini 4 Hydrogen)

### Zu bearbeitende Dateien:
* **Logik:** `website/js/salutation.js`
* **Testdefinitionen:** `test/corpus/address-cases.json` (nach erfolgreichem Fix `"known_fail": true` entfernen)

### Test-Befehle (Feedback-Schleife):
```bash
# 1. Korpus-Gate prüfen (~14 ms)
node test/corpus/run.js

# 2. Salutation-Unit-Tests prüfen (~90 ms)
node tools/test-runner.mjs --filter=Salutation

# 3. Gesamte Testsuite verifizieren
npm test
```

### Invarianten:
1. **Keine Regressionsfehler:** Alle bisherigen 76 Korpus-Fälle und 356 Unit-Tests müssen weiterhin uneingeschränkt bestehen.
2. **Vanilla JS / Zero-Dependencies:** Keine externen NLP-Bibliotheken; ausschließlich native String- und RegEx-Operationen.
3. **Kanonische Anreden:** Gesetzliche Vorgaben aus `docs/js/Salutation-Engine.md` beachten.
