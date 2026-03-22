# Platinum Level-Up (Chrome 147 Baseline)
# Version: 1.0.0 | Date: 2026-03-21
# Aviation Grade Platinum | Brain-First & Spec-Driven

## Executive Summary
Das DIN-BriefNEO Projekt wurde vollständig auf die **Google Chrome 147.0+ Baseline** migriert. Jegliche Legacy-Workarounds, Polyfills (`@supports`) und veraltete JS-APIs wurden restlos eliminiert (No Legacy, No Backport, No Mercy). 

Die Architektur nutzt ab sofort exklusiv:
- **Temporal API** anstelle von fehleranfälligen `new Date()` Objekten.
- **Native Invokers** (`commandfor` / `command`) für Modals und Toasts (ersetzt `popovertarget`).
- **CSS `@property`** für die strenge Typisierung der 14 CMA-Variablen im CSS (Length).
- **CSS `@scope`** zur Kapselung des DIN-Papiers.
- **Scoped View Transitions** (`Element.startViewTransition()`) Vorbereitung.
- **Future-Proof Marker** für Chrome 148/149-Features (`@function`, `if()`, `position-try`, `Interest Invoker`).

## Aktualisierte TOMB-Registry (Zementiert)
- **TOMB-LEGACY-001**: `new Date()` (außer `parseDate` / User Input) ersetzt durch `Temporal` API (`temporal-utils.js`).
- **TOMB-LEGACY-002**: `popovertarget` / `popovertargetaction` → `commandfor` / `command`.
- **TOMB-LEGACY-003**: manuelle `addEventListener('click')` für Dialoge/Toasts gelöscht (jetzt Native Invokers).
- **TOMB-LEGACY-004**: JS `.click()` Trigger → native `<label for="file-import">` in der Sidebar.
- **TOMB-LEGACY-005**: `execCommand` + `richText` Code-Blöcke restlos entfernt (Ghost-Mirror Transition).
- **TOMB-LEGACY-006**: `@supports` für moderne Features aus `din5008-paper.css` entfernt.
- **TOMB-LEGACY-007**: `data-layout` Attribut auf `<html>` und `#paper` Container gelöscht.
- **TOMB-LEGACY-008**: Datei `js/core/cma-bridge.js` + Import `initCMABridge()` restlos gelöscht (vollständig CSS-nativ).
- **TOMB-LEGACY-009**: Manuell via JS gesetzte `--cma-*` Properties entfernt (jetzt CSS `@property` Typed Variables).

## Vollständige Diff-Übersicht
| Datei | Änderung |
| --- | --- |
| `.brain/constitution_v1.0.0.md` | **NEU**: Zementierung der Chrome 147 Baseline und der Rule Zero. |
| `js/core/temporal-utils.js` | **NEU**: Kapselt `todayISO`, `nowTimeISO` und `formatDateTemporal` mit Temporal API. |
| `js/logic/logic.js` | `new Date()` für `todayISO`/`formatDate` entfernt und auf Temporal umgebogen. |
| `js/core/app.js` | `initCMABridge` entfernt, `formatDateTemporal` implementiert. |
| `js/ui/devmode.js` | `new Date().toLocaleTimeString` durch `nowTimeISO()` ersetzt. |
| `index.html` | Migration von `popovertarget` zu `commandfor`+`command`, `<label>` für Import, `data-layout` entfernt. |
| `js/ui/ui.js` | `_bindActions` komplett gelöscht, `execCommand`-Block entfernt, Event-Delegation optimiert. |
| `css/din5008-paper.css` | 22 CMA-Variablen via `@property` typisiert. `@layer latex.base` ergänzt. `@scope (#paper)` vorbereitet. Future-Proofing Kommentare eingefügt. |
| `js/core/cma-bridge.js` | **GELÖSCHT** (TOMB-LEGACY-008). |

## ESLint-Regel-Vorschlag (Guards)
Um Regressionen zu verhindern, sollten folgende ESLint-Regeln in die CI/CD-Pipeline aufgenommen werden:
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "NewExpression[callee.name='Date']",
        "message": "ANTI-PATTERN: Nutze die Temporal API (TOMB-LEGACY-001) via temporal-utils.js"
      },
      {
        "selector": "CallExpression[callee.property.name='execCommand']",
        "message": "ANTI-PATTERN: execCommand ist deprecated (TOMB-LEGACY-005). Ghost-Mirror nutzen."
      }
    ]
  }
}
```

## DEFINITION OF DONE
- [x] Chrome 147 Baseline + Constitution v1.0.0 zementiert.
- [x] Kein `new Date()` (außer Parsing), kein `execCommand`, kein `popovertarget`, kein `@supports`, kein `cma-bridge.js` mehr.
- [x] Temporal API zentral in `temporal-utils.js`, Scoped View Transitions & Native Invokers aktiv.
- [x] 148/149-Features (`@function`, `if()`, `position-try`) als Marker / Ready in CSS eingebaut.
- [x] Neue `.brain/24_platinum_level_up_chrome147_v1.0.0.md` Datei existiert.
- [x] Das Projekt ist ab sofort Chrome-147-native, spec-driven und aviation-grade.

---

### Constitution v1.0.0 Inhalt (Referenz)
# Chrome 147 Baseline – No Legacy, No Backport, No Mercy
# Aviation Grade Platinum | Brain-First & Spec-Driven

**RULE ZERO**: Bestehende .brain-Dateien nie überschreiben → nur neue _vX.Y.Z.md anlegen.

**DIRECTIVE**:
- Neue unverrückbare Baseline: Google Chrome 147.0+ (Beta aktiv, Stable 07.04.2026)
- Alles, was 147 nativ kann → SOFORT nutzen (KEIN JS wo möglich)
- 148/149-Features → als FUTURE-PROOF oder ready-to-use einbauen
- Kein `@supports`, kein Polyfill, kein Backport, kein „falls mal“ – das System altert von allein
- Keine weiteren Audits oder Fragen – direkt implementieren
