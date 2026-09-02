---
id: index
title: 'DIN-BriefNEO — OmniTraceability Hub'
type: meta
status: active
created: '2026-07-03'
updated: '2026-09-02'
tags:
  - din-briefneo
  - status/active
  - type/meta
doc_links:
  - OmniTraceability
  - Function-Traceability
  - spec
  - constitution
error_patterns:
  - hub
  - navigation
  - omnitraceability
  - einstieg
  - übersicht
supersedes: []
depends_on: []
code_links: []
---

# DIN-BriefNEO: OmniTraceability Hub

Navigator durch Architektur, Spezifikationen und Entscheidungen.

Foundation-Hierarchie: [[constitution]] → [[Immutable-Law-Catalog]] → [[spec]] → [[longevity-guidelines]]. Workflow ist Prozess, nicht Gesetz.

Die Spec ist Anforderung, nicht Geometrie-SSoT. Millimeter stehen im HTML.

## Kernnavigation

### Das Fundament

- **[[constitution]]**: Prinzipien.
- **[[Immutable-Law-Catalog]]**: Verbote und Plattformprinzipien.
- **[[spec]]**: Baseline-Verhalten.
- **[[OmniTraceability]]**: Nachverfolgbarkeit.
- **[[Function-Traceability]]**: Code-zu-Dokumentation.

### Die Umsetzung

- **[[Architecture-Compliance-Matrix]]**: Architektur-Regeln.
- **[[IMR-Registry]]**: 45er fachliches Vokabular (Architecture, nicht Foundation).
- **[[GUIDE-TEMPLATE]]**: Leitfäden.

---

## Für KI-Agenten

Feature-Branches sind untersagt. Arbeit auf `main`.

Agenten **referenzieren** Foundation-Dokumente; sie spiegeln sie nicht.

Wenn Dateien in `website/` geändert werden, gelten die in den Dateien verlinkten ADRs und Guides. Instantiierte Registry-Atome werden als `<din-…>` geführt, ohne `customElements.define()`.
