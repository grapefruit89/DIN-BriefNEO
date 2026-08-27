---
id: ADR-TEMPLATE
title: 'ADR-Template für neue Architektur-Entscheidungen'
type: meta
status: active
created: '2026-06-30'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/meta
doc_links:
  - longevity-guidelines
  - constitution
error_patterns:
  - adr template
  - neue adr
  - entscheidungsvorlage
  - architekturentscheidung
supersedes: []
depends_on: []
code_links: []
---

# ADR-XXX: [Kurzer, präziser Titel]

## 1. Context & Problem

**Kurze, präzise Beschreibung des Problems (max. 5–6 Sätze).**

- Was ist das konkrete Problem?

- Warum ist eine Entscheidung notwendig?

- Welcher Kontext ist relevant?

> [!info] Hintergrund (optional)
> Nur bei Bedarf für zusätzlichen Kontext. Nicht übertreiben.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** | ... | ... | ... | ... | ... |
| **Option B** | ... | ... | ... | ... | ... |
| **Option C** | ... | ... | ... | ... | ... |

## 3. Decision

**Wir haben uns für Option X entschieden.**

### Begründung

- Punkt 1 (kurz & präzise)

- Punkt 2

- Punkt 3

## 4. Consequences

### Positive Auswirkungen

- ...

### Risiken & Negative Auswirkungen

- ...

### Langfristige Auswirkungen

- ...

## 5. Implementation & Verification

- Was wurde konkret umgesetzt?

- Wie wird die Einhaltung sichergestellt? (Reconciliation, Code-Review, Tests, Antipattern-Regeln)

- Gibt es offene Punkte?

## 6. Related Documents

- [[longevity-guidelines]]

- [[ADR-YYY]]

- [[constitution]]

---

### Feature Checks (falls relevant)

```javascript feature-check
// f("Feature Name", Bedingung, "Chrome XXX", "Status")
```

---

## Hinweise zur Nutzung

- **Frontmatter ist verpflichtend** und muss vollständig ausgefüllt werden (Schema V6).
- **"Context & Problem"** soll kurz und fokussiert bleiben.
- Die **Entscheidung** muss klar und unmissverständlich formuliert sein.
- Redundanzen zu `longevity-guidelines.md` und `constitution.md` vermeiden — stattdessen verlinken.
- Jede ADR trifft **eine klare Entscheidung**, schreibt keine Essays.
