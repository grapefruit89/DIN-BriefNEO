---
id: guide-[kurz-id]
title: "Guide: [Thema des Guides]"
type: guide
status: draft | active | deprecated
doc_links:
  - "[[ADR-XXX]]"
  - "[[longevity-guidelines]]"
code_links: []
tags: 
  - guide
  - documentation
---

# Guide: [Titel]

> [!tip] Was ist dieser Guide?
> Kurze Erklärung, warum dieser Guide existiert und für wen er gedacht ist.  
> Im Gegensatz zu einem ADR dokumentiert ein Guide *wie* etwas umgesetzt wird (Best Practices, Techniken, Workflows).

## 1. Einleitung & Zielsetzung

Kurze Einleitung:
- Was ist das Ziel dieses Guides?
- Welches Problem löst er?
- Welche Annahmen gibt es?

## 2. Best Practices & Regeln

Hier kommen die konkreten Richtlinien. Nutze Checklisten oder nummerierte Listen:

- **Regel 1**: ...
  - [x] Wird bereits umgesetzt
  - [ ] Noch ausstehend
- **Regel 2**: ...

### Vorher / Nachher Beispiele

Nutze `diff` Blöcke, wenn es um Code-Verbesserungen geht:

```diff
- // Alter Ansatz
- element.style.top = calculatedTop + 'px';

+ // Neuer deklarativer Ansatz
+ element.style.positionAnchor = '--selection-anchor';
```

## 3. Komplexere Zusammenhänge

Falls ein Thema tiefergehend erklärt werden muss:

<details>
<summary>Deep Dive: [Thema] (Klicken zum Ausklappen)</summary>

Hier können längere Erklärungen, Diagramme oder Hintergrundwissen stehen.

</details>

## 4. Feature Checks (falls relevant)

Falls dieser Guide moderne Web-APIs voraussetzt oder erklärt:

```javascript feature-check
// f("Feature Name", typeof globalThis.Feature !== "undefined", "Chrome XXX", "Produktiv")
```

## 5. Verwandte Dokumente

- [[longevity-guidelines]]
- [[ADR-XXX]]
- [[glossary]]

---

## Hinweise zur Nutzung dieses Templates

- **Frontmatter ist verpflichtend**
- Der Guide soll **praktisch** und **umsetzbar** sein (keine reinen Theorie-Texte)
- Nutze `diff`-Blöcke und `<details>` für bessere Lesbarkeit
- Halte den Guide möglichst **kurz und fokussiert** (max. 1–2 Bildschirmseiten ideal)
- Verlinke stark auf ADRs und andere Guides statt Inhalte zu duplizieren
