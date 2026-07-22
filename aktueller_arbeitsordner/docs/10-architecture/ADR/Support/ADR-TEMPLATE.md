---
chosen_option: '[option-id]'
code_links: []
created: '2026-06-30'
decision_options:
- id: option-a
  label: '[Beschreibung Option A]'
  status: considered | chosen | rejected
- id: option-b
  label: '[Beschreibung Option B]'
  status: chosen
depends_on: []
doc_links:
- '[[ADR-YYY]]'
- '[[longevity-guidelines]]'
- '[[constitution]]'
id: adr-[xxx]
status: draft | proposed | accepted | deprecated | superseded
tags:
- adr
- architecture
title: 'ADR-XXX: [Kurzer, präziser Titel der Entscheidung]'
type: adr
updated: '2026-07-07'
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

- ...

### Risiken & Negative Auswirkungen

- ...

- ...

### Langfristige Auswirkungen

- ...

## 5. Implementation & Verification

- Was wurde konkret umgesetzt?

- Wie wird die Einhaltung der Entscheidung sichergestellt? (z.B. durch Reconciliation, Code-Review, Tests, Antipattern-Regeln)

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

## Hinweise zur Nutzung dieses Templates

- **Frontmatter ist verpflichtend** und muss vollständig ausgefüllt werden.

- Der Abschnitt **"Context & Problem"** soll kurz und fokussiert bleiben.

- Die **Entscheidung** muss klar und unmissverständlich formuliert sein.

- Redundanzen zu `longevity-guidelines.md` und `constitution.md` vermeiden — stattdessen verlinken.

- Jede ADR sollte **eine klare Entscheidung** treffen, keine Essays schreiben.