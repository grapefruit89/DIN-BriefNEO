---
id: spec
title: 'Spezifikation (Spec) — DIN-BriefNEO Baseline Features'
type: spec
status: active
created: '2026-06-26'
updated: '2026-09-02'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/spec
doc_links:
  - constitution
  - Immutable-Law-Catalog
  - longevity-guidelines
code_links: []
error_patterns:
  - spec
  - baseline features
  - user story
  - akzeptanzkriterien
supersedes: []
depends_on: []
---

# Spezifikation (Spec) — DIN-BriefNEO Baseline

Dieses Dokument beschreibt **erforderliches Verhalten**. Es ist nicht die Quelle der Millimeter, nicht der Implementierungsplan und nicht die Roadmap.

Ausführbare DIN-Geometrie liegt am Dokument-Root in HTML (`<din-a4 data-*>`). CSS interpretiert sie. JS verändert sie nicht.

Ein Brief instantiiert aus der 45er Registry nur die fachlich nötige Teilmenge. Nicht-Vorkommen ist kein Spec-Verstoß. Instantiierte Atome werden als `<din-…>` repräsentiert, ohne `customElements.define()`.

Umsetzung (CSS-Einheiten, Dateinamen, Karussell-Rezepte) gehört nach Architecture / Implementation.

---

## Feature 1: Vollständiger Briefbogen ohne Dokument-Scroll

**Als** Anwender **möchte ich** den DIN-A4-Bogen vollständig im Arbeitsbereich sehen.

Akzeptanz:

- Das Blatt behält das Seitenverhältnis von DIN A4 (210:297 als Proportion, Zahlen im HTML).
- Das Browser-Dokument scrollt nicht.
- Bei Größenänderung des Fensters bleibt der Bogen vollständig sichtbar und proportional.

## Feature 2: Form A und Form B

**Als** Briefschreiber **möchte ich** zwischen DIN-5008-Form A und Form B wechseln.

Akzeptanz:

- Der Wechsel ist in der UI erreichbar.
- Absenderzone, Anschrift, Infoblock, Falz, Lochung und Briefkern folgen der gewählten Form.
- Die konkreten Y-Werte stehen nur in HTML-`data-*`, nicht in dieser Spec.

## Feature 3: Hell- und Dunkelmodus

**Als** Anwender **möchte ich** hell oder dunkel arbeiten.

Akzeptanz:

- Umschalter in der UI.
- Das Briefpapier bleibt in der Bearbeitung druckklar (helles Papier).
- Der Druck gibt weißes Papier mit dunklem Text aus.

## Feature 4: Lokale Entwürfe

**Als** Briefschreiber **möchte ich** Eingaben nicht verlieren.

Akzeptanz:

- Änderungen werden lokal gesichert.
- Der letzte Entwurf wird beim Öffnen wiederhergestellt.
- Speicherort ist localStorage (siehe Constitution).

## Feature 5: Rückmeldungen und zentrale Meldungstexte

**Als** Entwicklung **möchte ich** Systemrückmeldungen an einem Ort pflegen.

Akzeptanz:

- Nutzerfeedback ist sichtbar (Toast oder gleichwertig nativ).
- Meldungstexte und Speicher-Keys liegen nicht verstreut als Magie in jedem Modul.

---

## Bewusst nicht in dieser Spec

- Multipage-Karussell, Templates, CSS-Transforms
- automatischer Form-A/B-Wechsel nach Textlänge
- Geschlechtserkennung / RegExp-Anrede als Foundation-Pflicht
- zeitgesteuerter Dark Mode
- Easter-Egg-Diagnosepaneele
- Feldlisten des aktuellen HTML
- Container-Query-Rezepte, Viewport-Höhen in `vh`

Solche Themen liegen in Roadmap, ADR oder Implementation.
