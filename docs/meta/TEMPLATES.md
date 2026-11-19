---
id: templates
title: 'Vorlagen für Dokumente (ADR & Guide)'
type: meta
status: active
created: '2026-06-30'
updated: '2026-11-09'
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
  - guide template
  - vorlage
  - neue adr
  - new guide
  - how-to
supersedes: []
depends_on: []
code_links: []
---

# Vorlagen für Dokumente (ADR & Guide)

Dieses Dokument bündelt die offiziellen Vorlagen zur Erstellung neuer Architekturentscheidungen (ADRs) und How-To Guides im DIN-BriefNEO-Repository.

---

## 1. ADR-Template (Architektur-Entscheidungen)

Vorlage für neue Dokumente unter `docs/10-architecture/ADR-*.md`.

```markdown
---
id: adr-xxx
title: 'ADR-XXX: [Kurzer, präziser Titel]'
type: adr
status: proposed
created: 'YYYY-MM-DD'
updated: 'YYYY-MM-DD'
tags:
  - din-briefneo
  - din-briefneo/adr
  - status/proposed
  - type/adr
doc_links:
  - constitution
  - longevity-guidelines
error_patterns: []
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
- [[constitution]]
```

---

## 2. Guide-Template (How-To Guides)

Vorlage für neue Guides und technische Anleitungen unter `docs/20-implementation/`.

```markdown
---
id: guide-name
title: 'Guide: [Thema]'
type: guide
status: active
created: 'YYYY-MM-DD'
updated: 'YYYY-MM-DD'
tags:
  - din-briefneo
  - din-briefneo/guide
  - status/active
  - type/guide
doc_links:
  - longevity-guidelines
error_patterns: []
supersedes: []
depends_on: []
code_links: []
---

# Guide: [Thema]

> [!tip] Was ist dieser Guide?
> Kurze Erklärung, warum dieser Guide existiert und für wen er gedacht ist.  
> Im Gegensatz zu einem ADR dokumentiert ein Guide *wie* etwas umgesetzt wird (Best Practices, Techniken, Workflows).

## 1. Einleitung & Zielsetzung

- Was ist das Ziel dieses Guides?
- Welches Problem löst er?
- Welche Annahmen gibt es?

## 2. Best Practices & Regeln

- **Regel 1**: ...
  - [x] Wird bereits umgesetzt
  - [ ] Noch ausstehend
- **Regel 2**: ...

### Vorher / Nachher Beispiele

```diff
- // Alter Ansatz
+ // Neuer deklarativer Ansatz
```

## 3. Komplexere Zusammenhänge

<details>
<summary>Deep Dive: [Thema] (Klicken zum Ausklappen)</summary>

Hier können längere Erklärungen, Diagramme oder Hintergrundwissen stehen.

</details>

## 4. Verwandte Dokumente

- [[longevity-guidelines]]
```

---

## Hinweise zur Nutzung

- **Frontmatter ist verpflichtend** — Schema V6.
- ADRs dokumentieren **warum** eine Richtungsentscheidung getroffen wurde; Guides beschreiben **wie** etwas praktisch umgesetzt wird.
- Halte Dokumente möglichst **fokussiert und schlank** (Reconciliation prüft Dateigrößen-Grenzen).
- Verlinke stets verwandte ADRs und Kernrichtlinien.
