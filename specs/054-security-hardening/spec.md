---
id: SPEC-054
title: Security Hardening (CSP & SRI)
tags: [security, hardening, aviation-grade]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Security Hardening

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-SEC]`
- **Requirement**: Maximale Abschottung gegen XSS und Code-Injection.
- **Rationale**: Ein Tool, das persönliche Daten verarbeitet, darf keine Sicherheitslücken haben.

---

## ??? Requirements *(mandatory)*

### FR-001: Strict Content Security Policy (CSP)
- **Was**: Implementierung einer CSP via `<meta>` Tag.
- **Logik**: `script-src 'self'` und `style-src 'self'`. Externe Skripte sind STRENG VERBOTEN (Aviation Standard).
- **Ausnahme**: Explizit erlaubte Domains für Tier-2/3 APIs (SPEC-038).

### FR-002: Subresource Integrity (SRI)
- **Logik**: Falls ausnahmsweise ein externes Asset (z.B. ein spezialisierter Font) geladen wird, MUST ein Hash-Check (SRI) erfolgen.

### FR-003: Sandbox Isolation
- **Was**: Schutz des Haupt-DOMs vor Einflüssen aus den API-Modulen.

## Success Criteria *(mandatory)*
- **SC-001**: **Pentest Pass**: Keine automatisierte Sicherheits-Prüfung (z.B. OWASP ZAP) findet kritische Lücken in der Frontend-Architektur.
