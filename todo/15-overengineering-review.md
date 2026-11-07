# 15 · Over-Engineering-Review (validiert)

Status: offen · Typ: audit · Erstellt: 2026-11-06
Quelle: dritte externe Ideenliste (11 Punkte). Jeder Punkt gegen den Code gemessen.

## Validierung

| # | Behauptung | Verdikt | Beleg |
|---|---|---|---|
| 1 | salutation.js: ~700 Namen | teilweise, Zahl zu klein | 951 Namen (408 m + 543 w) in nur 2 Zeilen (4120 und 5599 Zeichen); Datei 409 Zeilen |
| 2 | formatTelefonnummer ~80 Zeilen | falsch | 26 Zeilen (document.js:152-178); genau 1 Aufrufer, blur auf #absender-tel (573) |
| 3 | debug-panel.js ~800 Zeilen | wahr, sogar mehr | 1029 Zeilen; drag 54x, snap 30x, localStorage 15x, clamp 18x, minimize 14x; nur bei ?debug= aktiv |
| 4 | sanitizeRichText ~60 Zeilen | Groesse falsch | 41 Zeilen (document.js:38-79); Allowlist B/STRONG/S/BLOCKQUOTE/BR/DIV/P bestaetigt; Paste nutzt text/plain (365) |
| 5 | Multi-Tab-Sync halb gebaut | wahr | document.js:775-794; Kommentar woertlich vorhanden; navigator.locks nirgends |
| 6 | Enter-Handler mit addressFlow | wahr | document.js:319-340; Array exakt wie behauptet; offsetParent + getComputedStyle |
| 7 | @adr/@guide sind tote Verweise | falsch | 12 ADR-Dateien in docs/10-architecture; alle 4 @guide-Ziele existieren; 33 Tags gesamt |
| 8 | #seedAuto ist Heuristik | wahr | salutation.js:330-354 (24 Zeilen), prueft alle STYLES und CLOSINGS |
| 9 | Toast/CloseWatcher grenzwertig | grenzfall, kein Fehler | CloseWatcher 4x in core.js; verteidigbar |
| 10 | transitionOn ohne Fallback | teilweise wahr | 6 Zeilen (settings.js:27-33); kein Guard fuer fehlendes startViewTransition, wirft dort |
| 11 | initApp mit 12 try/catch | Zahl falsch | 16 try / 18 catch in main.js; initApp = 112 Zeilen (54-166) |

## Uebernommen (Handlungsbedarf)

### 18 · salutation.js: Namenslisten

951 Vornamen (408 m + 543 w) in zwei Zeilen. Die Heuristik raet Geschlecht, wenn
kein Herr/Frau im Feld steht; der Code kommentiert selbst "lieber neutral als
falsch geraten". Explizites Herr/Frau gewinnt bereits (Regex in Zeile 100).
Optionen: Listen streichen (dann immer "Sehr geehrte Damen und Herren" ohne
Anrede-Hinweis) oder auf explizites Herr/Frau begrenzen. Entscheidung offen.
Aufwand: S (Loeschen) bis M (Fallback-Verhalten sauber definieren).

### 19 · debug-panel.js reduzieren

1029 Zeilen fuer ein Panel, das nur mit ?debug=json oder ?debug=autocomplete
erscheint (main.js:142). Drag, Snap, Persistenz, Viewport-Clamping, Resize,
Keyboard-A11y. Vorschlag: auf Anzeigen/Kopieren/Leeren/Schliessen reduzieren.
Aufwand: M.

### 20 · Multi-Tab-Sync entfernen oder vollstaendig bauen

document.js:775-794: storage-Handler, Kommentar sagt selbst "kein Web-Locks,
Restrisiko akzeptiert". Der halbe Sync erzeugt eine Sicherheitsillusion.
Vorschlag: Handler streichen (Single-User-App) oder mit navigator.locks sauber
bauen. Aufwand: XS (streichen) / M (bauen).

### 21 · Enter-Handler mit addressFlow

document.js:319-340: hartcodierte Reihenfolge name, strasse, ort, firma, betreff
(weicht von der DOM-Reihenfolge ab). Ersetzt Tab-Order. Vorschlag: Enter nur
preventDefault, Navigation dem Browser ueberlassen. Aufwand: XS.

### 22 · #seedAuto entfernen

salutation.js:330-354: raet nach Reload, ob der Anredetext auto-generiert war,
und setzt data-generated (nur Optik/italic). Nicht sicher entscheidbar.
Vorschlag: nach Reload kein data-generated. Aufwand: XS.

### 23 · initApp: try/catch-Struktur

main.js: 16 try / 18 catch, initApp 112 Zeilen. Absicht richtig (defensiv),
Form schwer lesbar. Vorschlag: Init-Schritte als Liste abarbeiten, ein
Error-Boundary. Aufwand: S.

## Nicht uebernommen (widerlegt)

- formatTelefonnummer: nur 26 Zeilen, nicht 80. Die Heuristik-Kritik mag stimmen,
  die Groessenangabe nicht. Kein Refactoring auf dieser Basis.
- sanitizeRichText: nur 41 Zeilen, nicht 60. Paste nutzt bereits text/plain.
  Kein akuter Handlungsbedarf.
- @adr/@guide: Verweise sind nicht tot. 12 ADR-Dateien und alle @guide-Ziele
  existieren (din-5008-css-architektur.md, glossary.md, no-scroll-techniques.md,
  geoapify-autocomplete.md). Kein Handlungsbedarf.
- Toast/CloseWatcher: vom Autor selbst als verteidigbar eingeordnet.

## Randnotiz

transitionOn (settings.js:27-33) hat keinen Guard fuer fehlendes
startViewTransition. In Chromium irrelevant, in anderen Browsern ein TypeError.
Gehoert fachlich zu 13 (Cross-Browser-Dokumentation), nicht zu diesem Review.

## 24 · Toast-System auf CSS-Auto-Dismiss reduzieren (Nachtrag 2026-11-06)

Status: offen, opportunistisch beim naechsten Anfassen von core.js.

Befund (gemessen): Toast-Block core.js:165-236, ca. 72 Zeilen
(initToastSystem, showToast, startTimer, armCloseWatcher, hide). Nutzt CloseWatcher
(4x in core.js), setTimeout und popover=manual. Das Toast-Element ist
#hinweis-v4 in index.html:366 mit popover="manual". Eine CSS-Animation fuer
Toasts existiert nicht.

Vorschlag: Ausblenden per CSS-Animation (animation ... forwards, animationend
loest hidePopover aus), feste Dauer 4-5 s statt dynamischer Formel,
CloseWatcher optional entfernen, popover="manual" behalten.

Fallstricke, die mit eingeplant werden muessen:
- prefers-reduced-motion darf das Ausblenden nicht abschalten (kurze Dauer
  statt animation:none).
- Bei erneutem showToast muss die Animation neu starten (Reflow oder
  @starting-style), sonst bleibt der Toast stehen.
- Die Keyframes muessen neu angelegt werden (base.css).
- Ohne CloseWatcher schliesst ESC den Toast nicht mehr; bei 4-5 s akzeptabel.

Aufwand: 30-45 Min. Abhaengigkeit: keine.

Nachtrag Abhaengigkeit: Nach dem Umbau entfaellt CloseWatcher; danach webapi.d.ts (31 Z., CloseWatcher + ariaNotify) bereinigen.

## Entscheidung 2026-11-07 (#18)

Die Namenslisten sind **ersatzlos entfernt** (MALE_NAMES/FEMALE_NAMES, 951 Einträge,
Schritt 6 in `derive()`). Geschlecht kommt nur noch aus `Herr`/`Frau`; sonst wird der Name
genannt oder neutral formuliert. Begründung und Grenzen: `docs/30-meta/DECISION-LOG.md`,
Eintrag „Anrede rät kein Geschlecht mehr“.
