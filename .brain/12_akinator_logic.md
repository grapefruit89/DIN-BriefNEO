---
id: BRAIN-012
title: Akinator 3.0 — Few-Shot Specs & Copy-for-LLM
version: 1.0.0
created: 2026-03-20
status: CEMENTED | SPEC-050
traceability: [CAA-008, ADR-006, ADR-008, SPEC-038, PLAN-010]
---

# 12 — Akinator 3.0: Few-Shot Logik & Copy-for-LLM Button

## Uebersicht

Akinator 3.0 definiert zwei Zustände des "Copy for LLM"-Buttons:

1. **Empty State** — Brief leer. Button exportiert das nackte IMR-Schema
   als Referenz fuer die KI. Die KI weiss, was sie bekommt und was sie
   zurueckgeben soll, bevor sie die erste Frage stellt.

2. **Filled State** — Brief hat Inhalt. Button exportiert das belegte
   JSON + den Optimierungs-Kontext. Wird von `buildOptimizationPrompt()`
   in `logic.js` gebaut.

---

## SEKTION A: Copy-for-LLM — Empty State

**Trigger:** `readDOMasJSON()` liefert nur null-Werte (alle Felder leer).
**Ausgabe:** Das nackte IMR-Schema mit Kommentar-Annotation je Feld.

```
Erwarteter Output des Buttons (leer):

# DIN-BriefNEO — Referenz-Schema fuer KI-Interaktion
# IMR 2.0 | CAA-008 | Alle Keys = Pflicht | Leere Felder = null

{
  "sender":     null,   // <din-sender>      — Einzeilig: "M. Mustermann · Musterstr. 1 · 12345 Berlin"
  "note":       null,   // <din-note>        — Vermerkzone (Einschreiben, persoenlich, etc.)
  "recipient":  null,   // <din-recipient>   — Volle Anschrift, Zeilenumbrueche mit \n
  "date":       null,   // <din-date>        — DIN-Format: "20.03.2026" oder ISO "2026-03-20"
  "your_ref":   null,   // <din-your-ref>    — "Ihr Zeichen" (optional)
  "our_ref":    null,   // <din-our-ref>     — "Unser Zeichen" (optional)
  "subject":    null,   // <din-subject>     — Einzeilig, praeagnant, kein Punkt am Ende
  "salutation": null,   // <din-salutation>  — Vollstaendig: "Sehr geehrter Herr Mustermann,"
  "body":       null,   // <din-body>        — Fliesstext mit Markdown (s. Sektion C)
  "greeting":   null,   // <din-greeting>    — Kein Satzzeichen: "Mit freundlichen Gruessen"
  "signature":  null    // <din-signature>   — Nur Name (kein Titel): "Max Mustermann"
}
```

**Hinweis fuer die KI (im Prompt-Prefix des Empty-State):**
```
Du erhältst das kanonische Schema des DIN-BriefNEO-Systems.
Jeder JSON-Key ist genau einem HTML-Tag auf dem Papier zugeordnet.
Stelle maximal 5 Fragen, dann liefere das vollständig befüllte JSON.
ALLE Keys sind Pflicht. Leere = null, nicht weglassen.
Daten-Regeln: Nur im "body"-Feld ist Markdown erlaubt (s. Sektion C).
```

---

## SEKTION B: Few-Shot Beispiele — Chaotischer Input → Sauberes JSON

Diese Beispiele muessen in den Interview-Prompt eingebettet werden
(nach dem Schema, vor "Beginne mit Frage 1.").
Sie zeigen der KI explizit, wie sie unstrukturierten Nutzermtext
in das strikte IMR-Schema ueberfuehrt.

---

### BEISPIEL 1 — Impressum-Text → Sender-Feld

**Input des Nutzers (chaotisch):**
```
Absender:
Max Mustermann GmbH
Geschaeftsfuehrung: Max Mustermann
Adresse: Musterstraße 42, 12345 Berlin
Tel: +49 30 123456 | mail@example.de
Ust-ID: DE123456789
```

**Erwartetes JSON (sauber, IMR-konform):**
```json
{
  "sender":     "M. Mustermann GmbH · Musterstraße 42 · 12345 Berlin",
  "note":       null,
  "recipient":  null,
  "date":       null,
  "your_ref":   null,
  "our_ref":    null,
  "subject":    null,
  "salutation": null,
  "body":       null,
  "greeting":   null,
  "signature":  null
}
```

**Begründung:**
- Firmierung auf 1 Zeile, Name abgekürzt (M. Mustermann)
- Tel, Mail, USt-ID kommen NICHT in `sender` — sie gehören ins Profil (nicht im Brief)
- `sender` ist der Rücksendeadress-Einzeiler, nicht das vollständige Impressum

---

### BEISPIEL 2 — WhatsApp-Nachricht → Vollstaendiger Brief

**Input des Nutzers (chaotisch):**
```
hey ich brauch nen brief an mein alten vermieter
der soll meine kaution zurueck zahlen, die hatten nen schimmelschaden
ich wohn jetzt schon 3 monate in der neuen wohnung aber nix gehört
maximal 300 euro darf abgezogen werden fuer kleine schäden sagt mein
anwalt. ich heiss tim meier, musterweg 3, 10115 berlin
empfaenger: Hans Schmidt Vermietungs-OHG, Hauptstr. 1, 80331 München
```

**Erwartetes JSON (sauber, IMR-konform):**
```json
{
  "sender":     "T. Meier · Musterweg 3 · 10115 Berlin",
  "note":       null,
  "recipient":  "Hans Schmidt Vermietungs-OHG\nHerrn Hans Schmidt\nHauptstraße 1\n80331 München",
  "date":       "20.03.2026",
  "your_ref":   null,
  "our_ref":    null,
  "subject":    "Rückforderung der Mietkaution — Mietverhältnis Musterweg 3, 10115 Berlin",
  "salutation": "Sehr geehrter Herr Schmidt,",
  "body":       "hiermit fordere ich die Rückzahlung meiner geleisteten Mietkaution für das o. g. Mietverhältnis.\n\nDas Mietverhältnis endete vor ca. 3 Monaten. Bis heute habe ich weder eine Abrechnung noch eine Rückzahlung erhalten. Gemäß § 548 BGB sind Sie verpflichtet, die Kaution unverzüglich abzurechnen.\n\nSoweit Schäden (inkl. des bekannten Feuchtigkeitsschadens) geltend gemacht werden sollen, weise ich darauf hin, dass der Vermieter die Schadenshöhe und das Verschulden des Mieters nachzuweisen hat. Eine pauschale Einbehaltung ist unzulässig.\n\nIch setze Ihnen hiermit eine Frist bis zum **03.04.2026**, die vollständige Kaution zurückzuzahlen, abzüglich einer nachgewiesenen und begründeten Gegenforderung.\n\nSollte bis zu diesem Termin keine Zahlung oder schriftliche Stellungnahme vorliegen, werde ich weitere rechtliche Schritte einleiten.",
  "greeting":   "Mit freundlichen Grüßen",
  "signature":  "Tim Meier"
}
```

**Begruendung:**
- Umgangssprache → formale Korrespondenzsprache
- Gesetzesreferenz (§ 548 BGB) eigenstaendig ergaenzt
- Frist berechnet (Eingabedatum + 14 Tage)
- `body` nutzt Markdown (`**datum**` fuer Fettschrift) — EINZIGES Feld
- `sender` abgekuerzt: "T. Meier" (kein Vorname ausgeschrieben)

---

### BEISPIEL 3 — Angebot-Text → Geschaeftsbrief mit Referenzzeilen

**Input des Nutzers (chaotisch):**
```
Betreff: Angebot Webentwicklung Projekt XY
An: Frau Dr. Lisa Berger, Berger Consulting AG, Koenigsallee 50, 40212 Düsseldorf
Von: Nexus Dev UG (haftungsbeschraenkt), Steinweg 7, 22085 Hamburg
Unsere Referenz: NX-2026-044
Ihre Anfrage vom: 15.03.2026

Wir bieten Ihnen gerne folgendes an:
- Entwicklung: 5.000 EUR
- Hosting 12 Monate: 1.200 EUR
- Support-Paket: 800 EUR
Gesamt: 7.000 EUR netto zzgl. 19% MwSt.
Angebot gültig 30 Tage.
```

**Erwartetes JSON (sauber, IMR-konform):**
```json
{
  "sender":     "Nexus Dev UG · Steinweg 7 · 22085 Hamburg",
  "note":       null,
  "recipient":  "Berger Consulting AG\nFrau Dr. Lisa Berger\nKönigsallee 50\n40212 Düsseldorf",
  "date":       "20.03.2026",
  "your_ref":   "Anfrage vom 15.03.2026",
  "our_ref":    "NX-2026-044",
  "subject":    "Angebot Webentwicklung — Projekt XY",
  "salutation": "Sehr geehrte Frau Dr. Berger,",
  "body":       "vielen Dank für Ihre Anfrage vom 15. März 2026. Wir unterbreiten Ihnen gerne folgendes Angebot:\n\n| Leistung | Betrag (netto) |\n|---|---|\n| Entwicklung | 5.000,00 EUR |\n| Hosting (12 Monate) | 1.200,00 EUR |\n| Support-Paket | 800,00 EUR |\n| **Gesamt** | **7.000,00 EUR** |\n\nZuzüglich gesetzlicher Umsatzsteuer (19 %) ergibt sich ein Bruttobetrag von **8.330,00 EUR**.\n\nDieses Angebot ist 30 Tage ab Datum gültig. Wir freuen uns auf Ihre Rückmeldung.",
  "greeting":   "Mit freundlichen Grüßen",
  "signature":  "Nexus Dev UG"
}
```

**Begruendung:**
- Referenzzeilen (`your_ref`, `our_ref`) aus Input extrahiert
- Markdown-Tabelle in `body` — laeuft durch Ghost-Mirror (Sektion VII GEMINI.md)
- Bruttobetrag eigenstaendig berechnet
- Firmenname als Signatur (kein Personenname vorhanden)

---

## SEKTION C: Markdown-Instruktion — Nur im `body`-Feld

Dies ist die kanonische Instruktion fuer alle KI-Agenten, die JSON
fuer DIN-BriefNEO generieren. Sie MUSS in jeden System-Prompt eingebettet sein.

### Die Regel (einzeilig, maschinenlesbar)
```
MARKDOWN_SCOPE: body-only | OTHER_FIELDS: plaintext-only
```

### Die Regel (vollstaendig, fuer LLM-Prompts)

```
## Markdown-Verwendungsregel — STRIKT EINZUHALTEN

Das DIN-BriefNEO-System nutzt contenteditable="plaintext-only" fuer
alle Felder AUSSER "body". Das bedeutet:

ERLAUBT (nur im "body"-Feld):
  *kursiv*                — Hervorhebung, Zitate
  **fett**                — Wichtige Begriffe, Fristen, Betraege
  ~~durchgestrichen~~     — Korrekturen, Streichungen
  > Zitat                 — Einzurueckende Passagen (AGB, Gesetzestexte)
  `code`                  — Aktenzeichen, Referenznummern
  - Listenpunkt           — Aufzaehlungen ohne Nummerierung
  1. Nummeriert           — Schrittfolgen, Maengellisten
  \n\n                    — Absatztrennung (Doppel-Newline)
  | Tabelle | Spalte |    — Preislistern, Gegenueberstellungen

VERBOTEN (in ALLEN anderen Feldern):
  Markdown-Syntax in: sender, note, recipient, date, your_ref,
  our_ref, subject, salutation, greeting, signature.
  Diese Felder MUESSEN reiner Plaintext sein.
  Zeilenumbrueche in "recipient" sind erlaubt (\n), aber kein Markdown.

BEGRUENDUNG:
  - "subject" mit **fett** wuerde auf dem DIN-Brief als Literaltext erscheinen
  - "salutation" mit *kursiv* ist orthografisch und DIN-technisch falsch
  - "signature" darf nur den Namen enthalten — keine Formatierung
  - "body" hat Ghost-Mirror: Markdown wird visuell gerendert (GEMINI.md Sekt. VII)
```

---

## SEKTION D: Technische Implementierung des Copy-for-LLM Buttons

### Button-Zustands-Logik (Pseudocode)

```javascript
function handleCopyForLLM() {
  const data = readDOMasJSON();
  const isEmpty = Object.values(data).every(v => v === null);

  const prompt = isEmpty
    ? buildInterviewPrompt()      // Leeres Schema + Frage-Instruktion
    : buildOptimizationPrompt();  // Belegtes Schema + Optimierungs-Instruktion

  navigator.clipboard.writeText(prompt);
  showToast('📋 Prompt kopiert — in KI einfügen');
}
```

### Einbettungsort der Few-Shot Beispiele

Die Beispiele aus Sektion B werden in `buildInterviewPrompt()` (logic.js)
als statischer String-Block eingebettet. Sie erscheinen ZWISCHEN dem
Schema und der "Beginne mit Frage 1"-Aufforderung.

**Struktureller Prompt-Aufbau (empty state):**
```
[Rollenbeschreibung: DIN 5008 Assistent]
[IMR-Schema: 11 Keys mit Kommentaren]
[Markdown-Regel: Sektion C Kurzform]
[Few-Shot Beispiele: 2-3 Stueck]
[Aufgabe: Stelle max. 5 Fragen, dann JSON]
```

### Datenschutz-Hinweis (Pflicht im UI)

Bevor der Button den Prompt in die Zwischenablage schreibt, MUSS
ein einmaliger (nicht wiederholender) Hinweis erscheinen:

```
⚠️ Der Prompt enthält den aktuellen Briefinhalt.
   Beim Einfügen in eine externe KI werden diese Daten übertragen.
   [Verstanden]
```

Dieser Hinweis wird nach einmaliger Bestaetigung in localStorage
als `din_llm_hint_shown: true` gespeichert.

---

## SEKTION E: Versionierung der Few-Shot Beispiele

| Version | Datum      | Aenderung                                    |
|---------|------------|----------------------------------------------|
| 1.0.0   | 2026-03-20 | Initiale 3 Beispiele (Impressum, Kaution, Angebot) |

Neue Beispiele werden hier versioniert und in `buildInterviewPrompt()`
als Array eingebettet. Maximal 3 Beispiele im Prompt (Token-Budget).
Das Array ist erweiterbar — der Prompt waehlt die letzten 3 aus.
