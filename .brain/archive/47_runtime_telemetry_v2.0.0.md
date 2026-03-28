---
id: BRAIN-047-RUNTIME-TELEMETRY
title: Runtime Telemetry Payload Specification
version: 2.0.0
status: finalized
last_audit: 2026-03-27
tags: [mission-critical, production-ready, runtime-telemetry, ai-native, spec]
supersedes: [47_specify_flight_recorder_v1.0.0.md]
authority: Data Interface Specification for Diagnostic Logging and AI-Driven Resolution.
---

# 47 — Runtime Telemetry Payload v2.0.0

## I. INTENT
This document specifies the data interface between the DIN-BriefNEO client and the Diagnostic Logger (AI-Agent). The objective is to provide a 100% consistent error context for deterministic error resolution and debugging.

## II. JSON PAYLOAD STRUCTURE
Every diagnostic request sent to the AI agent MUST adhere to this exact JSON structure:

```json
{
  "header": {
    "app": "DIN-BriefNEO Production-Ready",
    "version": "16.0.0",
    "timestamp": "Temporal.Now.instant()",
    "incident_id": "uuid-v7"
  },
  "context": {
    "error_type": "CONSTRAINT_VIOLATION | DOM_INCONSISTENCY | STATE_SYNCHRONIZATION",
    "error_message": "...",
    "stack_trace": "..."
  },
  "telemetry": {
    "model_state": { "current_keys": ["..."], "missing_keys": ["..."] },
    "constraint_violations": [
      { "tag": "din-subject", "current_y": 105.2, "target_y": 103.4, "delta": 1.8 }
    ],
    "console_buffer": [ "Last 10 System Logs" ]
  },
  "environment": {
    "engine": "Chrome 147+",
    "os": "...",
    "storage_quota_usage": 0.85 
  }
}
```

## III. DETERMINISTIC DIAGNOSTIC RESPONSES (AI)
The AI agent response MUST NOT contain free-form text for automated resolution. Responses MUST follow one of these predefined patterns:

1. **`UPDATE_DOM_ATTRIBUTE`**: For the automated correction of CSS or HTML attributes.
2. **`RESET_RESILIENCE_PHASE`**: For targeted resetting of application resilience and storage phases.
3. **`ALERT_USER_CONSTRAINT_VIOLATION`**: To notify the user when physical layout constraints make the requested input impossible (e.g., address field too small for the provided input).

## IV. VALIDATION
- **Compliance Check:** Ensure that all payload keys align with the **Semantic Data Model (v4.0.0)**.
- **Verification Result:** Confirmed. All field references in the payload utilize standardized tag names as defined in the master registry.
