---
name: implement-with-economy
description: >
  Entscheidungsleiter fuer die Umsetzung von Produktfeatures in website/:
  in welcher Layer-Reihenfolge (HTML vor CSS vor JS) eine Loesung gesucht
  wird, bevor neuer Code oder neue Abhaengigkeiten entstehen. Schaerft den
  generischen Economy Layer aus repository-operations speziell fuer
  Feature-Implementierung -- keine externen Bibliotheken/Abhaengigkeiten
  ausser den wenigen, bereits explizit erlaubten Ausnahmen (z. B.
  Adress-Autocomplete).
---

# Skill: implement-with-economy

Herkunft: Externe Ist-Pruefung (Grok, 2026-08-27) schlug vor, die
Karpathy-Disziplin- und Ponytail-Economy-Konzepte zu EINEM Skill zu
kombinieren statt in mehrere separate Dateien aufzuspalten ("so wenig
overengineering wie moeglich"), ergaenzt um eine praezisere
HTML-vor-CSS-vor-JS-Entscheidungsleiter. Der Nutzer hat das in derselben
Unterhaltung direkt verschaerft: "Javascript nur wenn es mit HTML oder
CSS nicht geht! Keine externen Bibliotheken und Abhaengigkeiten ... oder
nur ganz wenige ausgewaehlte wie Adress-Autocomplete." Dieser Skill setzt
genau das um.

## Verhaeltnis zum Economy Layer in repository-operations

`repository-operations/SKILL.md` enthaelt bereits eine generische
Ponytail-Entscheidungsleiter (6 Fragen, gilt fuer jede Tooling- und
Code-Entscheidung, auch in `tools/`). Dieser Skill dupliziert das nicht,
sondern schaerft es fuer den haeufigsten Fall in diesem Repository: die
Umsetzung eines Produktfeatures in `website/`. Wo die generische Leiter
fragt "kann die Plattform es", erzwingt dieser Skill eine feste
Reihenfolge: HTML vor CSS vor bestehendem JS vor neuem JS vor
Abhaengigkeit.

## Wann anwenden

Bei jeder neuen oder geaenderten Funktionalitaet in `website/` (Markup,
Styling, Interaktion) — nicht bei reinen Tooling-/Build-Skripten in
`tools/`, dort gilt weiterhin nur die generische Leiter aus
`repository-operations`.

## Die Leiter

Der Reihe nach pruefen, bei der ersten Stufe stoppen, die das Problem
tatsaechlich loest:

0. **Brauchen wir das Feature ueberhaupt?** Steht es in einer Spec/ADR,
   oder ist es eine unausgesprochene Annahme? (Discipline Layer:
   Goal-Driven Execution)
1. **Existiert es schon im Repo?** `website/js/`, `website/css/`,
   `sandbox/` als Proof-of-Concept durchsuchen, bevor neu gebaut wird.
2. **Geht es mit reinem HTML?** Native Elemente/Attribute pruefen
   (`<dialog>`, `<details>`, `popover`, `required`, `pattern`,
   Formularvalidierung) — vor jeder Zeile CSS oder JS.
3. **Geht es mit CSS, ohne JS?** Moderne CSS-Faehigkeiten pruefen
   (`:has()`, Container Queries, `@starting-style`, native
   View-Transitions). Web-API-Unsicherheit hier loest laut AGENTS.md
   Paragraph 4 die Context7-Pflicht aus.
4. **Reicht bestehendes vanilla JS im Repo?** Eine Funktion aus
   `website/js/*` erweitern statt ein neues Modul anzulegen.
5. **Neues, minimales vanilla JS?** Kleinstmoegliche Loesung, keine
   Abstraktion auf Vorrat (Discipline Layer: Simplicity First, Surgical
   Changes).
6. **Seltene, explizit erlaubte Ausnahme.** Eine externe Abhaengigkeit
   nur, wenn sie bereits in der Allowlist von Regel A38
   (`tools/antipatterns/web.json`, gespiegelt im Immutable Law Catalog)
   steht — aktuell: `api.geoapify.com`/`myprojects.geoapify.com` und
   `photon.komoot.io` (Adress-Autocomplete, siehe
   `website/js/43-geoapify.js`), `api.zippopotam.us` (PLZ-Lookup),
   `www.w3.org`. Eine neue Ausnahme hinzuzufuegen aendert die Allowlist
   selbst — das ist eine Aenderung am Immutable Law Catalog, keine
   Entscheidung, die dieser Skill im Vorbeigehen trifft.

## Was ist KEIN Verstoss gegen diese Leiter

- Eine bestehende, bereits erlaubte Ausnahme (Geoapify, Zippopotam) zu
  *nutzen* ist keine neue Abhaengigkeit — die Entscheidung ist schon
  getroffen.
- JS fuer Zustand/Interaktion, die HTML/CSS grundsaetzlich nicht abbilden
  koennen (z. B. Autosave, Undo/Redo-Stack, Formular-zu-PDF-Transformation)
  — die Leiter verlangt nicht, das Unmoegliche mit CSS zu erzwingen, nur
  die Stufen der Reihe nach tatsaechlich zu pruefen.
- Bestehenden Vanilla-JS-Code zu refactoren, ohne ihn durch eine
  Bibliothek zu ersetzen, ist keine neue Abhaengigkeit.

## Bezug zu anderen Skills/Dokumenten

- `agent/skills/repository-operations/SKILL.md`: generische
  Ponytail-Entscheidungsleiter und Discipline Layer, gelten weiterhin
  fuer Tooling-Entscheidungen ausserhalb von `website/`.
- `agent/skills/web-research/SKILL.md`: bei Unsicherheit in Stufe 2/3,
  ob eine native HTML/CSS-Loesung existiert.
- `docs/00-foundation/Immutable-Law-Catalog.md`, Regel A38: die
  tatsaechliche Allowlist fuer externe Verbindungen, massgeblich fuer
  Stufe 6.
