# 13 · Review 2026-11-06 — Optimierungsvorschläge (validiert)

Status: offen · Typ: audit · Erstellt: 2026-11-06
Quelle: externer Review-Vorschlag (20 Punkte), gegen den Code geprüft.

## Kontext

Am 2026-11-06 wurde eine Liste mit 20 Optimierungsideen eingebracht. Jede Annahme
wurde vor der Aufnahme gegen den tatsächlichen Code geprüft (Dateien, Zählungen,
Werte). Mehrere Vorschläge beruhen auf falschen Annahmen oder sind bereits umgesetzt.

## Validierung (gemessen am 2026-11-06)

| # | Behauptung | Verdikt | Beleg |
|---|---|---|---|
| 1 | JSON.parse(JSON.stringify()) durch structuredClone ersetzen | falsch | 0 Vorkommen von beidem; #applyHistoryState parst draftStr (JSON-String), keine Deep-Copy |
| 2 | Handvalidierung durch Valibot ersetzen | teilweise | parseDinLetterPayload = 103 Zeilen, handgeschrieben; Projekt ist zero-dep (kein package.json) |
| 3 | style-Injection durch adoptedStyleSheets ersetzen | schon erledigt | 0x createElement(style), 11x adoptedStyleSheets in 2 Dateien |
| 4 | @ts-check ohne tsconfig | falsch | jsconfig.json existiert: checkJs true, allowJs, ES2024, ESNext.Temporal |
| 5 | address.js und layers.css fehlen | falsch | address.js vorhanden (81.794 B); layers.css existiert nicht, wird nur in einem Kommentar erwaehnt |
| 6 | App ist Chromium-only | wahr | @function 7x, attr(... type()) 100x, column-height 4x, @top-left 4x, ::search-text 1x, interpolate-size 1x |
| 7 | field-sizing und text-wrap pruefen | teilweise falsch | field-sizing 0x; interpolate-size 1x |
| 8 | Test-Suite aufsetzen | falsch | existiert: test/all.js (2075 Zeilen), test/runner.js, test/corpus/run.js (Node, zero-dep) |
| 9 | Cache-Busting durch Hash ersetzen | wahr | 7x ?v=live6, manuell gepflegt |
| 10 | Service Worker und Manifest | wahr | beides fehlt |
| 11 | Schema v4 mit sender/recipient/content/options | teilweise | Schema ist v3; Felder flach mit Praefix toggle- (nicht toggle--) |
| 12 | Ueberall console.error | teilweise | 19x gesamt, nicht ueberall |
| 13 | String-Errors durch Codes ersetzen | teilweise | {ok:false, reason} vorhanden, Codes fehlen |
| 14 | CloseWatcher als Progressive Enhancement | wahr | 4x in website/js/core.js |
| 15 | EventBus um once/waitFor erweitern | teilweise | Bus existiert (const Bus), publish 30x, subscribe 9x; once/waitFor fehlen |
| 16 | Export in weitere Formate | offen | kein Bedarf erkennbar |
| 17 | JSON-Schema-Export | offen | nur relevant fuer externe Validierung |
| 18 | devalue fuer Date-Erhalt | offen | generated_at ist String; aktuell kein Bedarf |
| 19 | Intl.Segmenter fuer Zeichenzaehlung | offen | 0x Intl.Segmenter; aktuell nicht kritisch |
| 20 | Temporal-Polyfill-Fallback | wahr | Temporal.Now mit try/catch, Fallback currentISODate() |

## Entscheidungen (2026-11-06)

1. Valibot: NEIN. Zero-dep bleibt. Stattdessen parseDinLetterPayload zerlegen in
   validiereFormat(), validiereLayout(), validiereFields(), validiereSignatur() —
   einzeln testbar. Valibot erst ab 200+ Zeilen Schema oder bei Sharing.
2. Chromium-only: dokumentieren, keine @supports-Fallbacks. Praezise Aussage:
   Bildschirm laeuft ueberall, Druck/PDF ist Chromium-only (@page-Randboxen,
   column-height/column-wrap).
3. Schema v4: NEIN. Erst wenn Format geteilt, Backend angebunden oder Feldliste
   unuebersichtlich wird.
4. Cache-Busting: manuell, aber ein einheitlicher Version-String pro Release
   (v7, v8, ...), dokumentiert im README. Kein Script.
5. Logger: ja, klein (ca. 30 Zeilen), aber beim naechsten Anfassen von main.js.
6. Tests: Node fuer pure Funktionen (Muster corpus/run.js, node:test). Browser-Suite
   bleibt unangetastet.
7. Rollback: git init + erster Commit empfohlen. Ohne git: Backup-ZIP vor jedem Eingriff.

## Arbeitsplan (Reihenfolge)

0. Rollback sichern: git init + erster Commit (ca. 5 Min) — VOR allem anderen.
1. Cross-Browser-README: Chromium-only, Druckpfad (ca. 30 Min).
2. layers.css-Kommentar bereinigen (toter Verweis, ca. 5 Min).
3. parseDinLetterPayload zerlegen + Node-Tests (ca. 2-3 Std, groesster Hebel).
4. optional: Logger-Wrapper beim Anfassen von main.js (ca. 30 Min).
5. optional: Cache-Busting-Konvention im README (ca. 10 Min).

## Bewusst nicht auf der Liste

- Valibot (zero-dep bleibt)
- Schema v4 (Migration, kosmetischer Nutzen)
- @supports-Fallbacks fuer den Druckpfad (eigenes Projekt)
- PWA (Service Worker + Manifest)
- Hash-Script fuer Cache-Busting (Build-Schritt)

## Risiken / Hinweise

- Lokal existiert kein .git. Aenderungen syncen ueber Syncthing (Ordner repos,
  sendreceive) nach nobara; Loeschungen wandern mit.
- Schritt 3 aendert Code und setzt Schritt 0 voraus.
- Die Browser-Suite ist DOM-basiert; Node-Tests ergaenzen sie, ersetzen sie nicht.

Nachtrag fuer den Cross-Browser-Abschnitt: plaintext-only (29x in index.html) ist in Firefox laut Vorschlag nicht verfuegbar (Bugzilla 1064798); beim Schreiben pruefen und dort ergaenzen.
