---
tags: [aviation-grade, platinum-2026, architecture, final-cleanup, chrome-146]
status: cemented
version: 1.2.0
last_audit: 2026-03-21
id: BRAIN-003-BP
title: CSS Technical Blueprint — Das Reinheitsgebot (Final Seal)
supersedes: 03_technical_blueprint_v1.1.0.md
authority: Gilt für alle Dateien in css/ — FINAL
traceability: [BRAIN-017, BRAIN-015, ANTI-016, INCIDENT-002, MANDATE-NO-LEGACY]
delta: Traceability aktualisiert. Verweise auf IMR v2.4.0 und Resilience v6.0.0. Inhalt unverändert.
---

# 03 — CSS Technical Blueprint v1.2.0: Das Reinheitsgebot (Final Seal)

## Status dieses Dokuments

v1.2.0 ist die **versiegelte Endfassung** des CSS Technical Blueprint.
Alle Widersprüche aus BRAIN-017 (K-002, K-003, O-002) wurden in v1.1.0 behoben.
v1.2.0 aktualisiert ausschließlich die Traceability und Querverweise
auf die finalisierten Dokumente der Cleanup-Phase.

**Inhaltliche Änderungen gegenüber v1.1.0:** keine.
**Strukturelle Änderungen:** Traceability-Block, Querverweise, MANDATE-NO-LEGACY Tag.

---

## MANDATE: Chrome 145+ — Das Ziel-Plattform-Gesetz (FINAL)

> **DIN-BriefNEO ist für Chrome 145+ optimiert.**
> @supports-Guards für Anchor Positioning, Invoker Commands und
> die Sanitizer API sind VERBOTEN.
> Diese Features werden nativ und direkt eingesetzt. Punkt.

Das ist kein Vorschlag. Das ist die Plattform-Entscheidung.
Kein öffentliches Web-Produkt. Kein Cross-Browser-Kompromiss.
Chrome 145+ = volle Erfahrung.

### Was diese Entscheidung bedeutet (vollständige Liste)

- `@supports (anchor-name: --x) { ... }` → VERBOTEN
- Feature-Detection-JS für Invoker Commands → VERBOTEN
- `setHTML()` Fallback-Pfad → NICHT NÖTIG, kein Guard
- `@scope (#paper)` Guard → NICHT NÖTIG
- Polyfills für Temporal → NICHT NÖTIG (Chrome 130+ nativ)

---

## DIE HEILIGE LAYER-REIHENFOLGE v1.2 (FINAL) [ADR-002 + ADR-010]

```css
@layer latex.base, din.core, ui.theme, project.overrides;
/*      ^^^^^^^^^  ^^^^^^^^  ^^^^^^^^^  ^^^^^^^^^^^^^^^^
        Schwächst  DIN-mm    Ästhetik   State/Overrides
        typo-hints UNANTASTBAR Pico-Ext schlägt immer   */
```

Diese Deklaration ist VERFASSUNGSRANG. Sie steht als erste Zeile
in jeder CSS-Datei des Projekts. Abweichungen sind Bugs.

### Reihenfolge-Gesetz

```
latex.base  <  din.core  <  ui.theme  <  project.overrides
(schwächst)                              (stärkst)
```

**`latex.base`** — ADR-010 Safe-Extracts: nur hyphens, text-rendering,
font-feature-settings. Niemals position, mm-Werte, Layout-Properties.

**`din.core`** — UNANTASTBAR. Nur Tag-Selektoren + var(--cma-*).
Niemals Farben, Schatten, Animationen, px-Werte.

**`ui.theme`** — Ästhetik. Pico-Extracts. Niemals mm-Werte.

**`project.overrides`** — [data-*]-State, :has()-Logik. Schlägt IMMER.
Niemals mm-Positionswerte.

---

## SCHICHTEN 0–3: Unverändert gegenüber v1.1.0

Vollständige Spezifikation: `03_technical_blueprint_v1.1.0.md`.

Kurzreferenz:
- SCHICHT 0 `latex.base`: Typografie-Hints, 3 Safe-Extracts (ADR-010)
- SCHICHT 1 SETTINGS: `:root { --var: wert; }` — CMA SSoT (ADR-009)
- SCHICHT 2 ELEMENTS: `@layer din.core { din-tag { } }` — Tag-Isomorphie
- SCHICHT 3 HELPERS: `@layer project.overrides { [data-x] { } }` — No-JS State

---

## Chrome 146+ Native Features (FINAL — kein @supports)

| Feature | Chrome | Einsatz | Guard |
|---|---|---|---|
| CSS Anchor Positioning | 125+ | IMR 4. Dim. — alle 11 Anker | KEINER |
| Invoker Commands | 133+ | Alle Dialog-Buttons | KEINER |
| Sanitizer API setHTML() | 116+ | Ghost-Mirror Render | KEINER |
| @scope (#paper) | 118+ | din-* paper-lokal | KEINER |
| @starting-style | 117+ | Toast-Animationen | KEINER |
| @property | 85+ | 14 CMA-Variablen typisiert | KEINER |
| Relative Color Syntax | 119+ | Sidebar-Farben | KEINER |
| interpolate-size | 129+ | height:auto Transitions | KEINER |

---

## ADR-009 Bestätigung: CSS als primäre SSoT (FINAL)

`css/din5008-paper.css :root {}` ist die einzige Wahrheit für alle
statischen CMA-Maße. `cma-bridge.js initCMABridge()` ist Dead Code
(TOMB-B001). Nur `switchForm()` bleibt als dynamischer Konsument
für den Form-A/B-Toggle.

Vollständige Begründung: `14_adr_009_ssot.md`.

---

## Querverweise auf finale Dokumente (v1.2.0 Update)

| Dokument | Zweck | Verknüpfung |
|---|---|---|
| `08_isomorphic_schema_v2.4.0.md` | IMR — Strict Schema Gate | Sektion M |
| `08_isomorphic_schema_v2.3.0.md` | IMR — Alle 11 Anker, Ghost-Mirror | Sektionen K, L |
| `09_resilience_strategy_v6.0.0.md` | Circuit Breaker Final | CST, QuotaError |
| `18_logic_migration_temporal_v1.0.0.md` | TOMB-L001, todayISO() Spec | ANTI-016 |
| `16_adr_010_latex_css_v1.0.0.md` | ADR-010 latex.base | SCHICHT 0 |
| `14_adr_009_ssot.md` | ADR-009 CSS SSoT | SCHICHT 1 |
| `17_architecture_integrity_report_v1.0.0.md` | Audit-Basis | alle Fixes |

---

## Das Reinheitsgebot (Zusammenfassung — FINAL)

```
@layer latex.base, din.core, ui.theme, project.overrides;

SCHICHT 0  latex.base       → typo hints — kein mm-Einfluss
SCHICHT 1  :root { }        → CMA-Tokens — einzige Wahrheit
SCHICHT 2  @layer din.core  → din-* Tags — isomorph zum IMR
SCHICHT 3  @layer overrides → [data-*] State — JS-frei

Drei Verbote:
  1. Kein Magic Number für DIN-Maße → nur var(--cma-*)
  2. Keine relativen Positionen → nur position: absolute
  3. Kein CSS außerhalb des Layer-Systems

Chrome-Mandate:
  Kein @supports. Kein Polyfill. Chrome 145+ = native direkt.
```
