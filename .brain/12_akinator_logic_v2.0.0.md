---
tags: [aviation-grade, platinum-2026, akinator, smart-paste, spec]
status: cemented
version: 2.0.0
last_audit: 2026-03-23
id: BRAIN-012-AKI
title: Smart-Paste Validierungs-Guard — Evidence-Based Extraction
supersedes: 12_akinator_logic.md
---

# 12 — Smart-Paste Validierungs-Guard v2.0.0

## I. INTENT
Sicherstellung der Datenwahrheit beim Import von unstrukturierten Texten (Impressum, E-Mails) durch den Akinator. Jede extrahierte Information muss eine nachprüfbare Quelle im Original-Dokument besitzen.

## II. DER EVIDENCE-LINK PROZESS (SCHUTZ GEGEN HALLUZINATIONEN)
Das vom Akinator zurückgegebene JSON-Objekt darf keine isolierten Werte enthalten. Jedes IMR-Feld erfordert ein korrespondierendes `_source` Fragment.

**Struktur-Vorgabe:**
```json
{
  "recipient_main": {
    "value": "Versicherung AG",
    "source_snippet": "Kopfzeile: Versicherung AG, Vorstand: Dr. Muster"
  },
  "recipient_street": {
    "value": "Gleisdreieck 1",
    "source_snippet": "Postanschrift: Gleisdreieck 1, 50667 Köln"
  }
}
```

## III. FUNKTIONALER ABGLEICH (DER GUARD)
Bevor die Daten in den DOM (die `din-*` Tags) fließen, erfolgt ein automatischer Abgleich:
1. **In-Text Verifikation:** Das System prüft mittels `indexOf()` oder Regex, ob `source_snippet` tatsächlich im Original-Paste-Buffer vorhanden ist.
2. **Warn-Indikator:** Falls ein Snippet fehlt oder der Wert (`value`) nicht im Snippet enthalten ist -> Das Feld wird im UI gelb markiert (Aviation-Warnung: "Nicht verifiziert").
3. **Korrektur-Modus:** Der Nutzer muss das Feld manuell bestätigen (Click-to-Verify), um die Warnung zu löschen.

## IV. VALIDIERUNG
- **Check:** Ist dieses Verfahren mit der "Vakuum-Versiegelung" vereinbar?
- **Result:** Ja. Das JSON-Speicherformat bleibt sauber; die `source_snippets` dienen nur dem initialen Import-Guard und werden nicht permanent persistiert.
