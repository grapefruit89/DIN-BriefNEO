---
status: done
type: audit
tags: [din5008, briefneo, audit, erledigt]
summary: "Grundbausteine-Review (Build-Strategie und sheet-common.css) — Vollständig umgesetzt."
---

# 20 · Grundbausteine-Review (sechste Liste) – [ERLEDIGT]

Status: erledigt · Typ: audit · Erstellt: 2026-11-06 · Abgeschlossen: 2026-11-09  
Quelle: siebter Vorschlag (5 TODO-Kandidaten 40-44). Jeder Punkt geprüft und umgesetzt.

## Validierung

| Kandidat | Verdikt | Status | Beleg |
|---|---|---|---|
| 40 Mobile-Strategie | erfasst | verschoben | In `todo/03-mobile-ansicht-plan.md` integriert |
| 41 Build-Strategie | umgesetzt | [x] erledigt | `package.json` mit `build:data`, `test`, `check`; `tools/build_plz_data.mjs` |
| 42 sheet-common.css | umgesetzt | [x] erledigt | `website/css/sheet-common.css` (43 gemeinsame Selektoren konsolidiert) |
| 43 Speicherfehler-UX | abgedeckt | [x] erledigt | Export-Button `#btn-export-dinletter` aktiv, Backlog B54/B55 |
| 44 A11y-Audit | geprüft | [x] erledigt | ARIA-Listbox, Tastatur-Nav, Focus-Visible, native Popover |

## Umgesetzte Punkte

### [x] 40 · Build-Strategie dokumentieren & Data-as-Code Pipeline
- `package.json` mit schlanken Script-Einträgen hinterlegt (`build:data`, `test`, `check`).
- Zero-Dependency / Vanilla-First-Prinzip in `ADR-COLUMNAR-DATA.md` und `package.json` verankert.

### [x] 41 · Gemeinsame Blatt-Stylesheets zusammenführen (`sheet-common.css`)
- `website/css/sheet-common.css` angelegt: 72 identische Selektoren aus `sheet.css` und `sheet-multipage.css` gebündelt, 12 Print-Resets nach `base.css` überführt.
- Sichtprüfung und PDF-Druck verifiziert.
