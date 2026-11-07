# 20 · Grundbausteine-Review (sechste Liste)

Status: offen · Typ: audit · Erstellt: 2026-11-06
Quelle: siebter Vorschlag (5 TODO-Kandidaten 40-44). Jeder Punkt geprueft.

## Validierung

| Kandidat | Verdikt | Beleg |
|---|---|---|
| 40 Mobile-Strategie | bereits erfasst | todo/03-mobile-ansicht-plan.md existiert (status draft). Code-Beleg: Sidebar fix 18.75rem (base.css:172, sidebar.css:13-15); 8 Media Queries, keine einzige zu Viewport-Breite (nur print, reduced-motion, forced-colors) |
| 41 Build-Strategie | neu, wahr | kein "Zero-Build"/"Bundler"/"esbuild" in README.md, AGENTS.md oder llms.txt; kein package.json |
| 42 sheet-common.css | neu, wahr, stark | sheet.css hat 44 Selektoren, sheet-multipage.css 56; 43 davon sind identisch |
| 43 Speicherfehler-UX | abgeschwaecht | Export-Button #btn-export-dinletter ist immer sichtbar (index.html:55); BACKLOG B54/B55 decken den Fehlerpfad; "Retry" 0x |
| 44 A11y-Audit | kein Tooling, aber kein Befund | 0 Dateien/Referenzen zu axe, lighthouse oder a11y |

## Uebernommen

### 40 · Build-Strategie dokumentieren (Zero-Build bewusst oder esbuild)

Befund: 14 ES-Module, kein package.json, kein Bundler, kein Minifier. Weder
README.md noch AGENTS.md noch llms.txt sagen, ob das Philosophie oder Zufall
ist. Dynamische Importe (testbrief.js, debug-panel.js) sind bereits
Code-Splitting und bleiben in jedem Fall.
Entscheidung noetig: Zero-Build als Prinzip dokumentieren ODER esbuild als
einmaligen Build nach dist/. Aufwand: XS fuer die Entscheidung, 5 Min fuer den
README-Absatz.

### 41 · Gemeinsame Blatt-Stylesheets zusammenfuehren

Befund: sheet.css (653 Z., 44 Selektoren) und sheet-multipage.css (790 Z.,
56 Selektoren) teilen 43 Selektoren. Die Multipage-Variante ergaenzt im
Wesentlichen column-height/column-wrap und @page-Regeln.
Vorschlag: sheet-common.css mit den 43 gemeinsamen Regeln, beide Varianten
importieren sie und halten nur ihre Abweichungen.
Risiko: Druck-Regressionen. Nur mit Sichtpruefung des PDF und Ruecklage.
Aufwand: S-M.

## Nicht aufgenommen

- 40-Mobile: Dublette zu Plan 03 (todo/03-mobile-ansicht-plan.md, status draft).
  Der Code-Befund (keine Breiten-Media-Query) gehoert als Messwert in Plan 03.
- 43 Speicherfehler-UX: Der Export-Button ist immer da; der Fehlerpfad ist in
  B54/B55 beschrieben. Kein eigener TODO.
- 44 A11y-Audit: kein konkreter Befund, eigenes Projekt. Bleibt bewusst draussen.
- Performance-Messung: ohne konkretes Problem keine Messung; nur zusammen mit 40.

## Randnotiz fuer 13 (Cross-Browser-Doku)

plaintext-only ist in Firefox laut Vorschlag nicht verfuegbar (Bugzilla 1064798);
beim Schreiben des Cross-Browser-Abschnitts pruefen und dort ergaenzen, nicht
als eigener TODO.
