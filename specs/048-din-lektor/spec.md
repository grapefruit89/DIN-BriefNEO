---
id: SPEC-048
title: Smart Typo Correction (DIN-Lektor)
tags: [specification, din-5008, platin]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Smart Typo Correction (DIN-Lektor)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-LEKTOR]`
- **Lexicon Check**: "Zustellungsempfnger", "Abkrzungs-Leerschritt", "Obsolet-Prfix".
- **Principle Check**: **V. USER SOVEREIGNTY**: Silent corrections MUST be revertible (Undo). Warnings are preferred for stylistic choices.

---

## ?? Requirements *(mandatory)*

### FR-001: Missing Space Correction (Abkrzungs-Leerschritt)
- **Was**: Automatisches Einfgen von geschtzten Leerzeichen in DIN-typischen Abkrzungen.
- **Pattern**: 
    - `z.B.` -> `z. B.`
    - `u.a.` -> `u. a.`
    - `z.Hd.` -> `z. Hd.`
    - `i.A.` -> `i. A.`
- **Logik**: Das System MUST bei der Eingabe (on-blur oder nach Leerzeichen) das Muster erkennen und korrigieren.

### FR-002: Obsolete Prefix Stripping (Betreff-Reiniger)
- **Was**: Entfernung veralteter Begriffe vor dem eigentlichen Inhalt.
- **Pattern**: `Betreff:`, `Betr.:`, `Betr:` am Anfang der Betreffzeile.
- **Logik**: Das System MUST diese Prfixe automatisch entfernen, da sie laut DIN 5008 (seit 2011) obsolet sind. Die Betreffzeile wird stattdessen nur fett gedruckt.

### FR-003: Orthography Guard (Strae vs Strasse)
- **Was**: Sicherstellung der korrekten deutschen Rechtschreibung in Adressfeldern.
- **Pattern**: `Strasse` -> `Strae`.
- **Logik**: Falls das Land "Deutschland" oder "sterreich" ist, MUST das System den Nutzer per Toast warnen oder (je nach Guardrail-Einstellung SPEC-037) automatisch korrigieren.

### FR-004: Dual-Action Engine
- **Silent Mode**: Technische Korrekturen (Leerzeichen) erfolgen lautlos.
- **Toast Mode**: Stilistische oder inhaltliche Korrekturen (Prefix-Removal) lsen einen informativen Toast (SPEC-042) aus: "Hinweis: Das Wort Betreff ist laut DIN 5008 obsolet und wurde entfernt."

## Success Criteria *(mandatory)*
- **SC-001**: **No Amateur Look**: Ein mit NEO geschriebener Brief enthlt in 100% der Flle keine "z.B." (ohne Leerzeichen) Fehler mehr.
- **SC-002**: **Undo Integrity**: Jede automatische Korrektur kann durch STRG+Z sofort rckgngig gemacht werden.

