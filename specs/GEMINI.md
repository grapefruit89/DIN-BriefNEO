---
scope: LOCAL — specs/ & specify/ & plans/
version: 1.0.0
updated: 2026-03-20
parent: /GEMINI.md
authority: WORKFLOW-GATE — Kein Code ohne cemented Plan.
applies-to: [specs/, specify/, plans/]
---

# GEMINI.md — SDD-Wächter (specs/ & specify/ & plans/)
## Spec-Driven Development | What vs. How | Knowledge Shredder

Dieser Ordner-Komplex ist das Gehirn des Projekts. Jede technische
Entscheidung beginnt hier — niemals direkt im Code.

---

## DAS EHERNE GESETZ

```
KEIN Code-File darf angefasst werden,
solange der zugehoerige Plan-Status NICHT "cemented" ist.
```

Einzige Ausnahme: Hotfixes mit sofortigem Nachtraegen des Plans
(innerhalb von 24h, sonst gilt es als Regelverletzung).

---

## ORDNER-ZUSTAENDIGKEITEN

### /specs/ — Die Original-Anforderungen
- Unveraenderlich nach `status: cemented`.
- Enthaelt WHAT + HOW gemischt (Legacy-Format, wird nicht bereinigt).
- Dient als Referenz fuer Traceability.
- IDs (z.B. SPEC-007) sind heilig — niemals aendern.

### /specify/ — Die destillierte Fachlogik (reines WHAT)
- Nur DIN-Regeln, fachliche Anforderungen, Toleranzgrenzen.
- KEINE technischen Entscheidungen (kein "nutze CSS", kein "berechne via JS").
- Format: Tabellen fuer Masse, User Stories, Erfolgskriterien.
- Metadaten-Header MUSS erhalten bleiben (id, version, traceability).

### /plans/ — Die technische Umsetzung (reines HOW)
- Referenziert immer seinen Spec (spec: SPEC-007).
- Constitution Check-Tabelle ist PFLICHT am Anfang.
- Listet Anti-Pattern-Guards (anti-patterns: [ANTI-001, ...]).
- Status-Transitions: draft → active → cemented → archived.

---

## DER KNOWLEDGE SHREDDER WORKFLOW

```
1. LESEN:   spec.md aus /specs/ lesen
2. TRENNEN: WHAT (Fachlogik) → specify.md
            HOW (Technik)   → plan.md
3. PRUEFEN: Constitution Check in plan.md
4. CEMETERY: Veraltetes in .brain/05_anti_pattern_registry.md
5. CEMENTED: Status auf cemented setzen → Code-Freigabe
```

---

## METADATEN-PFLICHTFELDER (fuer alle Dateien in diesem Komplex)

### specify.md Pflicht-Header
```yaml
---
id: SPEC-007           # UNVERAENDERLICH — gleich wie Original-Spec
title: ...             # Beschreibender Titel
tags: [...]            # Semantische Kategorisierung
status: cemented|draft|active
version: 2.0.0         # Erhoehen bei jeder inhaltlichen Aenderung
traceability: [DIN-SYS-CMA]  # Rueckverfolgung zur Quelle
source: DIN 5008:2020-03     # Normative Quelle
depends-on: []         # Andere Specs als Abhaengigkeit
required-by: []        # Welche Specs brauchen diese hier
---
```

### plan.md Pflicht-Header
```yaml
---
id: PLAN-007
spec: SPEC-007         # Referenz zur Fachlogik-Spec
title: ...
status: draft|active|cemented|archived
anti-patterns: [ANTI-001, ANTI-007]   # Guards die gelten
adr: ADR-002           # Relevante Architektur-Entscheidungen
---
```

---

## QUALITAETS-GATES fuer specify.md

Eine Specify-Datei ist fertig wenn:
- [ ] Kein einziges technisches Wort vorkommt (kein "CSS", kein "JS", kein "function")
- [ ] Alle Masse haben eine Quellen-Traceability (DIN-Paragraf oder MehrCurry)
- [ ] Jede User Story hat mindestens 1 messbares Akzeptanz-Kriterium
- [ ] Erfolgskriterien sind quantifiziert (< 0.5mm, 100%, >= 95%)
- [ ] Aviation Grade Werte sind explizit als solche markiert

## QUALITAETS-GATES fuer plan.md

Ein Plan ist `cemented` wenn:
- [ ] Constitution Check-Tabelle ist vollstaendig (alle Gates: OK)
- [ ] Kein Anti-Pattern aus der Registry ist angewendet
- [ ] Cemetery-Eintrag fuer eliminierten Code ist erstellt
- [ ] Jede technische Entscheidung hat eine Begruendung (kein "weil es besser ist")

---

## CEMETERY — Abgelehnte Spec-Formate & Workflows

### [TOMB-S001] Mixed What/How Specs (Legacy-Format)
- **Was war es**: Original specs/007.../spec.md mischte Fachlogik mit
  technischen Implementierungs-Details ("Absolute Positioning Doctrine")
- **Geloescht**: 2026-03-20 | ANTI-023 (Spec-Contamination)
- **Grund**: Technische Aenderungen invalidieren faelschlicherweise
  die Fachlogik-Doku. Zwei Verantwortlichkeiten, eine Datei = Chaos.
- **Ersatz**: Strikte Trennung in /specify/ (WHAT) und /plans/ (HOW).

### [TOMB-S002] Status "active" ohne Constitution Check
- **Was war es**: Plans wurden auf "active" gesetzt ohne formalen Check
  gegen die Constitution-Regeln (Vanilla Purity, Visual Freeze, etc.)
- **Abgelehnt**: Projekt-Standard seit Session 3
- **Grund**: Fuehrt zu verspaetet entdeckten Architektur-Verst oessen,
  die teuer zu korrigieren sind.
- **Ersatz**: Constitution Check-Tabelle ist Pflicht-Gate fuer jeden Plan.

### [TOMB-S003] Code-First Entwicklung (ohne Spec)
- **Was war es**: Direkte Implementierung ohne vorherige Specify/Plan-Phase
- **Abgelehnt**: SDD-Grundprinzip
- **Grund**: "Code ohne Spec ist technische Schuld mit Zinseszins."
  Fehler werden spaet entdeckt, Refactoring ist teuer.
- **Ersatz**: Immer: Spec → Specify → Plan (cemented) → Code.
