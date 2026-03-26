---
tags: [aviation-grade, platinum-2026, flight-recorder, ki-native, spec]
status: cemented
version: 1.0.0
last_audit: 2026-03-23
id: BRAIN-047-SPEC
title: Flight Recorder Payload — Das Diagnosedaten-Vakuum
supersedes: none
---

# 47 — Flight Recorder Payload v1.0.0

## I. INTENT
Spezifikation der Daten-Schnittstelle zwischen dem BriefNEO-Client und dem Black Box Decoder (KI-Agent). Das Ziel ist die Bereitstellung eines 100% konsistenten Fehler-Kontextes für deterministische Fehlerkorrektur.

## II. JSON-PAYLOAD STRUKTUR
Jeder KI-Decoder-Request MUSS diese exakte JSON-Struktur einhalten:

```json
{
  "header": {
    "app": "DIN-BriefNEO Platinum",
    "version": "16.0.0",
    "timestamp": "Temporal.Now.instant()",
    "incident_id": "uuid-v7"
  },
  "context": {
    "error_type": "CMA_VIOLATION | DOM_DRIFT | STATE_SYNC",
    "error_message": "...",
    "stack_trace": "..."
  },
  "telemetry": {
    "imr_state": { "current_keys": ["..."], "missing_keys": ["..."] },
    "cma_violations": [
      { "tag": "din-subject", "current_y": 105.2, "target_y": 103.4, "delta": 1.8 }
    ],
    "console_buffer": [ "Last 10 System Logs" ]
  },
  "environment": {
    "engine": "Chrome 147+",
    "os": "...",
    "local_storage_quota": 0.85 
  }
}
```

## III. DETERMINISTISCHE ANWEISUNGEN (KI-OUTPUT)
Die KI darf keine freien Texte senden. Die Antwort MUSS in eines dieser Muster fallen:
1. **`FIX_DOM_TAG_ATTRIBUTE`**: Korrektur von CSS/HTML-Attributen.
2. **`RESET_LOCAL_STORAGE_PHASE`**: Gezieltes Zurücksetzen der Resilienz-Phasen.
3. **`NOTIFY_USER_CMA_CRITICAL`**: Benutzerhinweis bei physischer Unmöglichkeit (z.B. Adressfeld zu klein für Input).

## IV. VALIDIERUNG
- **Check:** Stimmen die Schlüssel der Payload mit der IMR 2.5 überein?
- **Result:** Ja. Jede Feld-Referenz in der Payload nutzt den IMR-Tag-Namen.
