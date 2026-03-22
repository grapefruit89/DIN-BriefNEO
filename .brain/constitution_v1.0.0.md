# Chrome 147 Baseline – No Legacy, No Backport, No Mercy
# Aviation Grade Platinum | Brain-First & Spec-Driven
# Constitution v1.0.0

## RULE ZERO
Bestehende .brain-Dateien nie überschreiben → nur neue _vX.Y.Z.md anlegen.

## DIRECTIVE
- Neue unverrückbare Baseline: Google Chrome 147.0+ (Beta aktiv, Stable 07.04.2026)
- Alles, was 147 nativ kann → SOFORT nutzen (KEIN JS wo möglich)
- 148/149-Features → als FUTURE-PROOF oder ready-to-use einbauen
- Kein `@supports`, kein Polyfill, kein Backport, kein „falls mal“ – das System altert von allein
- Keine weiteren Audits oder Fragen – direkt implementieren

## TOMB-Registry (Zementiert)
- **TOMB-LEGACY-001**: `new Date()` (außer `parseDate` / User Input) ersetzt durch `Temporal` API
- **TOMB-LEGACY-002**: `popovertarget` / `popovertargetaction` → `commandfor` + `command`
- **TOMB-LEGACY-003**: manuelle `addEventListener('click')` für Dialoge/Toasts
- **TOMB-LEGACY-004**: JS `.click()` Trigger → native `<label for="">`
- **TOMB-LEGACY-005**: `execCommand` + `richText` entfernt
- **TOMB-LEGACY-006**: `@supports` für moderne Features entfernt
- **TOMB-LEGACY-007**: `data-layout` auf `<html>` entfernt
- **TOMB-LEGACY-008**: `cma-bridge.js` + `switchForm()` + `initCMABridge()` gelöscht
- **TOMB-LEGACY-009**: manuell gesetzte `--cma-*` Properties via JS gelöscht

## NEU 147
- Scoped View Transitions (`Element.startViewTransition()`)
- `border-shape`, `contrast-color()`, width/style decoupling

## 148/149 FUTURE-PROOF
- CSS `@function`, `if()`, erweiterte `position-try`, Interest Invoker, Carousel/Masonry-Readiness
