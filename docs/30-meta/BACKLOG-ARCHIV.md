---
id: backlog-archiv
title: Backlog — erledigte und abgelehnte Einträge
status: archive
type: reference
created: '2026-11-14'
updated: '2026-11-14'
tags:
- din-briefneo
- meta
- archiv
doc_links:
- '[[BACKLOG]]'
- '[[DECISION-LOG]]'
- '[[AGENTS]]'
code_links:
- 'website/js/boot.js'
- 'website/js/document.js'
- 'website/js/address.js'
depends_on: []
supersedes: []

---

# Backlog-Archiv

Abgeschlossene Einträge aus [[BACKLOG]] — mit denselben IDs, damit Verweise in
Doku und Commits weiter auflösen. Neue Einträge entstehen **nie** hier; sie
werden beim Abschluss aus dem Backlog hierher verschoben.

## ✅ Bereits erledigt (2026-10-02)

| ID | Was | Commit |
| :--- | :--- | :--- |
| — | Fitness Gate repariert (war auf `main` rot, 99,88 %) | `5c4a4de` |
| — | Doku-Quick-Wins: 154 KB stale JSONs, Archiv-Status, `index.md` | `5c4a4de` |
| P1-1 | Metadata: doppelte Namensableitung → `collectLetterIdentity()` | `a30cdfc` |
| P1-2 | Settings-Race: `SalutationFeature` bekommt Owner injiziert | `a30cdfc` |
| — | Doku-Governance `AGENTS.md` §5 + DECISION-LOG-Schema | `5996411` |
| P1-3 | Postvermerk: drei Listener → ein Owner | `7d52cbe` |
| P2-2 | gzip-Pipeline 3× kopiert → `05-gzip.js` | `7d52cbe` |
| P2-5 | `setTimeout(…,100)` → natives `afterprint` | `7d52cbe` |
| P2-6 | `document.title`: zwei Schreiber → Vorrangregel | `7d52cbe` |
| **B1** | **`file://` als Laufzeitziel gestrichen** ([[ADR-RUNTIME-CONTEXT]]) | s. u. |
| **B2** | **`plz-embedded.js` (164 KB) + alle Protokoll-Guards entfernt** | s. u. |
| **B3** | **`ADR-ANTIPATTERN` aufgelöst → `A51`–`A62`, `H11` im Law Catalog** | s. u. |
| **B4** | **`GEMINI.md`/`CLAUDE.md` auf Wegweiser reduziert, Regeln nach `AGENTS.md`/Catalog** | s. u. |
| **B16** | **Terminologie-Kanon im Glossar + Gate-Durchsetzung (`tools/terminology.js`)** | s. u. |
| **B5** | **Agenten-Tooling nach `30-meta/`; `CHANGELOG` + `OBSIDIAN-SETUP-GUIDE` archiviert** | s. u. |
| **B8** | **Alle 12 Screen-`!important` aufgelöst + CSS-Ursachen bereinigt** | `809eb15` |
| **B17** | **Strukturprüfungen für Gesetze ausgebaut (Abdeckung 21 → 30 von 35)** | `a16899c` |
| **B15** | **DECISION-LOG-Behauptungen geprüft, Append-Only-Nachtrag für KISS + B8 + B17** | s. u. |
| **B7** | **`attr()`-Geometrie: Fallbacks entfernt, MUST-NOT 5 erfüllt** | s. u. |
| **B19** | **Adaptive 3-Zonen-Logik aktiv (Phase 1); Phase 2 geschlossen (KISS)** | s. u. |
| 7.1 | `formatLetterDate` braucht keinen `Intl`-Fallback — Temporal-only, Chrome-only (Chrome 150+) | — |

---

## Altbestand — IDs aus dem ersten Backlog (2026-10-02)

Der Umbau am 2026-11-14 hat erledigte Einträge ins Archiv **verschoben**. Sechs
IDs waren schon vorher **gelöscht** worden statt verschoben (aus dem ersten
Backlog `700fa35`, „Backlog der offenen Baustellen (B1-B15)"). Verweise darauf —
etwa im [[DECISION-LOG]] — lösten dadurch ins Leere. Sie stehen hier mit dem
Commit, der sie geschlossen hat; die Lücke im Nummernkreis ist damit erklärt,
nicht gefüllt.

| ID | Eintrag | geschlossen in |
|---|---|---|
| B1 | `file://`-Grundsatzentscheidung | `608f747` |
| B2 | Toten `file://`-Fallback + 164 KB entfernen | `608f747` |
| B3 | `ADR-ANTIPATTERN` in den Law Catalog auflösen | `197e47d` |
| B4 | `GEMINI.md` + `CLAUDE.md`-Verbote in `AGENTS.md` auflösen | `197e47d` |
| B5 | Agenten-Tooling-Docs nach `30-meta/` | `28704f4` |
| B16 | hatte nie einen eigenen Eintrag; mit B3/B4 erledigt | `197e47d` |

## Einzelne Einträge

### B54 · Speicherfehler-Toast wirft selbst (`ariaNotify` mit ungültigem `priority`) · **S** · ⭐⭐⭐ · ✅ ERLEDIGT 2026-11-07
`document.js:1059` ruft `document.ariaNotify('Fehler beim Speichern', { priority: 'important' })`.
Chrome 156 kennt `'important'` nicht; der Aufruf wirft `TypeError`. Weil er in
`#setSaveStatus('error')` steht, bricht `saveDraft()` **genau im Fehlerfall** ab
(`document.js:825`): kein Toast, kein `DOCUMENT_SAVE_FAILED`, kein Titel-Update, kein
Undo-Snapshot. Gemessen mit injiziertem `QuotaExceededError`: Status-Dot `error`, Toast
keiner, Wurf `TypeError`. Fix: gültigen Wert verwenden oder den Aufruf absichern.

### B55 · Import scheitert lautlos (Fehlerpfad unerreichbar) · **S** · ⭐⭐⭐ · ✅ ERLEDIGT 2026-11-07
`persistence.js:722-742`: `saveJSON` fängt Quota-Fehler intern ab und gibt `false` zurück,
wirft also nie. Der umgebende `try/catch` mit `IMPORT_STORAGE_ERROR` (`:737-742`) ist für
Speicherfehler damit unerreichbar. Der Dialog meldet Erfolg, `location.reload()` verwirft
den Import — der Nutzer sieht seinen alten Brief, ohne Hinweis. Fix: Rückgabe von
`saveJSON` prüfen und vor dem Reload abbrechen.

### B6 · Feldtypen deklarativ per `data-feldtyp` · **L** · ⭐⭐⭐ · ✅ PHASE 1 ERLEDIGT 2026-10-02
**Problem:** Mehrere Module kannten Feld-Sonderfälle über ID-Listen.
**Änderung:** `data-feldtyp` ist jetzt im HTML die Quelle für `rich`, `mehrzeilig`,
`zweizeilig`, `liste` und `systemwert`. Draft-Restore, Boot-Restore und UI-Schutz lesen
diese Eigenschaften statt parallele Feldlisten zu führen. Die gemeinsame Caret-Logik liegt
in `selection-utils.js`.
**Rest:** Ein vollständiger `fields.js`-Iterator ist erst sinnvoll, wenn weitere Feldtypen
hinzukommen; vorerst wäre er zusätzliche Abstraktion ohne weiteren Nutzerwert.

### B7 · `attr()`-Geometrie statt doppelter mm-Werte · **L** · ⭐⭐ · ✅ ERLEDIGT 2026-10-15
Liest die DIN-5008-Koordinaten via `attr(data-* type(<number>))` direkt aus den HTML-Attributen (SSoT aus IMR-Registry). Alle redundanten CSS-Fallback-Zahlen in `sheet.css` und `print.css` wurden entfernt. Damit ist Regel MUST-NOT 5 der IMR-Registry („normative Geometrie nicht in CSS duplizieren") vollständig erfüllt; CSS enthält null Millimeter-Werte.

### B8 · Die 12 Nicht-Print-`!important` auflösen · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Alle 12 Screen-`!important` in den Autoren-Styles (`floating.css`, `layout.css`, `sidebar.css`, `signature.css`)
restlos aufgelöst (Commit `809eb15`). Root-Causes bereinigt: verfehlt platzierte Seitenleisten-Labels
nach `sidebar.css`, DIN-Elemente nach `sheet.css`, Postvermerk-Styling in `layout.css` konsolidiert,
`.hidden` und `#btn-ai-rewrite` über Layer-Hierarchie und native Spezifität gelöst.
Nur die 5 normativen `prefers-reduced-motion`-Resets in `reset.css` und die 18 in `print.css` bleiben bestehen.

### B9 · Caret-Utilities zusammenführen + `TreeWalker` · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Die gemeinsame native Selection-/Caret-Logik liegt in `website/js/selection-utils.js`.
DraftManager und Offline-Adressintelligenz verwenden jetzt denselben Utility-Pfad;
der manuelle rekursive Node-Walk wurde durch `TreeWalker` ersetzt.

### B10 · `research/` **statuskennzeichnen** (NICHT auslagern) · **M** · ⭐⭐⭐ · ✅ TEIL BEREINIGT 2026-10-17
**Neu gefasst 2026-10-02 nach Inventur** — siehe `[[research-inventar-2026-10-02]]`.
Die alte Fassung („1,1 MB auslagern") war falsch gestellt: 476 KB davon sind die beiden
DIN-5008-Normgeometrie-SVGs, und der Ordner enthält **nicht umgesetzte** UX-Spezifikationen
(→ B18, B19). Ungelesenes Auslagern hätte dieses Wissen vernichtet.
**Aktualisierung 2026-10-17:** Der Ordner `research/roadmap/` (38 Dateien) wurde vollständig bereinigt und konsolidiert: 13 implementierte Features und 7 verworfene Ansätze wurden nach Überführung in Law Catalog / ADR gelöscht, 5 Spezifikationen in BACKLOG (B27–B31) und ROADMAP überführt, 12 Referenzdokumente nach `docs/` und das Diagnose-Tool nach `tools/browser-audit.html` verschoben.

### B11 · `_`-Prefix → `#private` vereinheitlichen · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
`01`, `41`, `53` mischen `#private`, `_underscore` und public. Rein mechanisch, kein
Verhaltensrisiko.

### B12 · Logging-Konvention · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
21 `console.*` ohne einheitliches Präfix. Vorschlag `[DIN-BriefNEO/<Modul>]`.
Zusätzlich: die beiden leeren `catch (e) {}` in `boot-theme.js`/`boot-state.js` loggen lassen —
aktuell sind Boot-Fehler inklusive Draft-Verlust unsichtbar.

### B13 · Guard-Kommentare entdoppeln · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
Fünf „🛡️ ARCHITECTURE GUARD"-Blöcke stehen wortgleich in `index.html` **und** im Modul
(~60 Z. Redundanz). Guard-Text ins Modul, HTML bekommt einen Einzeiler-Verweis
(`AGENTS.md` §5.4).

### B14 · Vier ungenutzte IDs entfernen · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
`btn-confirm-import`, `btn-confirm-reset`, `seitenleiste-ai-switch-row`,
`zwischenablage-anschrift-wrapper`.
**Korrektur 2026-11-05:** Der damalige Zusatz war falsch. `btn-style-formal|polite|casual`
werden **nicht** „per Template-String gebaut" — `getElementById('btn-style-…')` **sucht** ein
Element, es baut keines. Die IDs existieren nirgends; der Stil läuft über `#stil-select`.
Die Radio-Zweige in `salutation.js` sind am 2026-11-05 entfernt.
Siehe [[dead-code-audit-2026-11-05]].

### B15 · Log-Behauptungen gegen den Code prüfen · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
DECISION-LOG gegen den aktuellen Code-Stand abgeglichen. Neuer normativer Append-Only-Eintrag für die 5 KISS-Optimierungen (Event-Delegation, Caret-SSoT, Gzip-Pipeline, `.closest()`-Ancestor, StorageManager-Kapselung), den B8-Vollzug (`!important`-Beseitigung) und den B17-Phase-2-Gate-Ausbau (30/35 Gesetze) eingepflegt. Ältere historische Einträge bleiben gemäß DECISION-LOG-Governance strikt unverändert (Append-only).

### B41 · Zweizeilig-Guard zählt `<br>` nicht als Zeilenumbruch · **S** · ⭐⭐ · ✅ ERLEDIGT 2026-11-07
`document.js:324` prüft `text.split('\n').length`; `textContent` enthält für ein `<br>`
kein `\n`. Der Guard feuert dadurch nie. Zählen über `innerText` oder die `<br>`-Anzahl.

### B42 · Postvermerk-Auswahl wird bedingungslos auf Index 0 gesetzt · **S** · ⭐⭐ · ✅ ERLEDIGT 2026-11-07
`document.js:922` setzt `pvSelect.selectedIndex = 0`, auch wenn ein Vermerk aktiv ist
(weitere Stellen: `:1005`, `:1027`). Nur zurücksetzen, wenn kein Postvermerk gesetzt ist.

### B43 · `aria-pressed` am Einstellungen-Schalter bleibt bei direktem Klick stehen · **S** · ⭐⭐ · ✅ ERLEDIGT 2026-11-07
`settings.js:131-142` aktualisiert `aria-pressed` nur im programmatischen Pfad
`toggleSettingsModus`. Ein direkter Klick auf `#toggle-modus` feuert `change` ohne Listener.

### B44 · `<li>` ohne `<ul>` in `din-anlagen-angabe` · **S** · ⭐⭐ · ✅ ERLEDIGT 2026-11-07
`index.html:327` führt `<li>Anlage 1</li>` ohne Liste (`role="group"`). Entweder
`role="list"`/`role="listitem"` oder ein echtes `<ul>`.

### B45 · Eingefügte `<div>`-Kinder in der Anlagenliste bleiben stehen · **S** · ⭐⭐ · ✅ ERLEDIGT 2026-11-07
`document.js:485-497` normalisiert nur bei `children.length === 0`. Nach einem Paste mit
`<div>`-Kindern bleibt die Struktur ungültig.

### B46 · `save()`-Rückgabe beim Signaturzustand wird ignoriert · **S** · ⭐⭐ · ✅ ERLEDIGT 2026-11-07
`settings.js:567-571` reicht an `updateSettings()` → `saveJSON` weiter, ohne die Rückgabe
zu prüfen. Bei vollem Speicher verschwindet der Zustand still.

### B47 · Doppelter Save-Request beim Export · **S** · ⭐ · ✅ ERLEDIGT 2026-11-07
`persistence.js:661-662` publiziert `DOCUMENT_SAVE_REQUESTED` und baut das Payload direkt
danach aus dem DOM. Der Request ist für den Export funktionslos.

### B56 · Dead-Code: Restprüfung auf 'AptosCustom' entfernen · **S** · ⭐ · ✅ ERLEDIGT 2026-11-06
- **Quelle:** `docs/90-archive/dead-code-audit-2026-11-05.md` (Befund 4.7).
- **Problem:** `settings.js:200,313` verglich `fontFamily` gegen `'AptosCustom'`. Es gibt keinen Schreibpfad dafür (nur `CustomUserFont`).
- **Aufgabe:** Totes Branching in `settings.js` in Commit `7e59132` rückstandslos entfernt.

### B48 · Test-Runner für maschinenlesbare Ergebnisse · **M** · ⭐⭐⭐ · ✅ ERLEDIGT 2026-11-07
`tools/test-runner.mjs` existiert nicht. Jeder Lauf braucht ein handgebautes CDP-Skript,
weil `--dump-dom` die async-Tests abschneidet (`--virtual-time-budget` wartet nicht auf
IndexedDB-I/O). Ein Runner mit JSON-Ausgabe und Exit-Code würde das ersetzen.

### B50 · Mobile Drawer für die Seitenleiste (< 768px) · **L** · ⛔ ABGELEHNT 2026-11-13
`website/css/sidebar.css` hat kein Drawer-Muster; unter 768px bleibt die Seitenleiste
unbenutzbar. Reines CSS mit `:has()` wäre möglich, ohne JS-Umbau.
**Entschieden am 2026-11-13: keine Mobil-Variante.** Die App ist eine
Chrome-150+-Desktop-Anwendung; ungetesteter Responsive-Code ist Ballast. Ein
Zwischenstand (Schublade + Blattskalierung) wurde wieder entfernt.

### B53 · Speichern systematisch prüfen (stille Fehler, Rückgaben, Wettläufe) · **M** · ⭐⭐⭐ · ✅ ERLEDIGT 2026-11-07
Alle Speicherpfade durchgehen: Draft, Signatur, Schrift, Settings, Export, Import, Session,
Adressbuch, Geoapify-Key, Sender-Coords. Gesucht wird, was still scheitert oder sich
überholt. Stand 2026-11-06 (Dossier, `331a1f8`) sind die Funde erhoben:

- **13 ignorierte Rückgaben:** `document.js:974` (Undo/Redo), `settings.js:158`
  (`updateSettings`), `salutation.js:320`, sieben Stellen für den Geoapify-Key
  (`address.js:1838, 1859, 1872, 1876, 1884, 1891, 2011`), Adressbuch
  (`address.js:1913`), Sender-Coords (`address.js:2168`). Zwei davon sind eigene
  Einträge: **B54** (Fehler-Toast wirft) und **B55** (Import-Pfad).
- **`saveJSON` ruft `navigator.storage.persist()` bei jedem Write** (`persistence.js:191-193`)
  — beim Tippen etwa einmal pro Sekunde. Funktional harmlos, aber unnötiger Traffic.
- **Quota-Tests fehlen.** `grep -rn "Quota" test/` ist leer; Fault-Injection über ein
  überschriebenes `localStorage.setItem` hat sich als brauchbares Muster erwiesen.
- **`resetDraft()` cleart den Debounce-Timer nicht** (`document.js:989` vs. `:948-949`
  bei `undo`). Gemessen: nach einem Reset kurz nach dem Tippen folgt ein zusätzlicher
  Schreibvorgang. Alte Daten kehren dabei nicht zurück (der Timer liest das DOM erneut).
- **Doppelte Saves:** Export publiziert `DOCUMENT_SAVE_REQUESTED` und baut das Payload
  zusätzlich direkt (`persistence.js:661-662`); `undo()`/`redo()` schreiben zweimal
  (`document.js:950` + `:974`).

### B17 · Strukturprüfungen für die 14 nicht-regexfähigen Gesetze · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Vollständig umgesetzt (Commit `a16899c`):
1. `tools/structural-laws.js` prüft nun **A42** (doppelte IDs), **A57** (binäre Radios als Schalter), **A58** (Theme-Wahl als Radio), **A24** (Token ohne `:root`-Definition) und **A59** (Theme-Variablen auf dem DIN-A4-Blatt).
2. `tools/antipatterns/project.json` ergänzt um Sonden **P18** (A46: `page-break-before: always`), **P19** (A39: Icon-CDNs), **P20** (A21: CSS-Preprozessoren) und **P21** (A22: CSS-in-JS).
3. `tools/lawcoverage.js` verdrahtet die neuen Prüfer in `TOOL_ENFORCED`.
4. Gesetzliche Abdeckung von 21/35 auf **30/35 (85,7 %)** gesteigert. Die 5 verbleibenden Normen (A43, A44, A47, A60, A62) sind reine Gestaltungs-/UX-Grundsätze und werden bewusst nur berichtet.

### B18 · Adress-Dropdown mit der Tastatur bedienbar machen · **M** · ⭐⭐⭐⭐⭐ · ✅ ERLEDIGT 2026-10-02
**Härtester Fund der Research-Inventur und unabhängig von ihr gültig.**
`43-geoapify.js` → `renderSuggestions()` hängt ausschliesslich einen `click`-Listener an
jedes `<li>`. Kein `keydown`, kein `ArrowDown`/`ArrowUp`, kein `Enter`, kein
`role="listbox"`/`role="option"`, kein `aria-activedescendant`. Wer die Maus nicht
benutzt, kann keine Adresse übernehmen. Das wiegt schwerer als jedes offene CSS-Feature.
Umsetzung vor B19, weil B19 darauf aufbaut.

### B19 · Adaptive 3-Zonen-Logik + Zero-Click-Autofill · **L** · ⭐⭐⭐⭐ · ✅ ERLEDIGT (PHASE 1) / GESCHLOSSEN (PHASE 2) 2026-10-02
Quelle: ehemals `research/roadmap/ADAPTIVE_DROPDOWN_THRESHOLD_SPEC.md` und
`ZERO_CLICK_UNIQUE_AUTOCOMPLETE_UX.md` (konsolidiert). Phase 1 ist umgesetzt: > 5 Treffer zeigen
nur einen Eingrenzungshinweis, 2–5 Treffer erscheinen als Liste, genau 1 Treffer wird
nach dem vollständigen lokalen/Remote-Abgleich automatisch übernommen. Die vorherige
willkürliche `slice(0, 6)`-Anzeige ist entfernt. Phase 2 (bidirektionales Orchestrieren „Straße zuerst")
wird dauerhaft geschlossen: Die 1.500 Zeilen Adresslogik tragen bereits erhebliche Komplexität
und dürfen ohne dedizierte Unit-Tests nicht mit weiterem State-Sync-Overhead belastet werden (KISS-Prinzip).

### B20 · `fetch()`-Zeitlimits in `43-geoapify.js` · **S** · ⭐⭐⭐⭐ · ✅ ERLEDIGT 2026-10-02
Alle drei Geoapify-Anfragen haben jetzt ein natives 8-Sekunden-Limit über
`AbortSignal.timeout()`; die laufende Suche kombiniert es mit dem bestehenden
`AbortController` über `AbortSignal.any()`. Der H2-Guard (Key nur bei 401/403 löschen)
bleibt unverändert.

### B21 · Offene CSS-Features bewerten: `@page`-Seitenzahlen, `::highlight()`, `subgrid` · **M** · ⭐⭐ · ✅ BEWERTET 2026-10-02
Die drei Kandidaten ersetzen im aktuellen Ein-Seiten-/absoluten DIN-Layout keinen
bestehenden JavaScript-Pfad sicher. `@page`-Seitenzahlen warten auf die
Mehrseiten-Spec; `::highlight()` hat keinen vorhandenen DOM-Highlight-Renderer;
`subgrid` würde die IMR-Geometrie unnötig riskant umbauen. Keine Produktionsänderung.

### B39 · `mehrseiten-prototyp.html` einordnen · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-11-08 (Datei gelöscht, Mehrseiten ist ein Plugin)
`website/mehrseiten-prototyp.html` (315 Zeilen) ist von nichts im Repo verlinkt
(`index.html`, `multipage.html` und `docs/` geprüft: keine Verweise) und unterscheidet
sich in 756 Zeilen von `multipage.html` — also eine ältere, eigenständige Datei. Sie liegt
aber live im ausgelieferten `website/`-Ordner und ist damit öffentlich erreichbar.
**Zu entscheiden:** vergessene Live-Seite (dann verlinken) oder Dead Code (dann nach
`docs/90-archive/` verschieben). Vor einer Löschung prüfen, ob ein externer Link zeigt —
Referrer-Logs gibt es nicht. Siehe auch [[ARCHITECTURE-MAP]].

### B37 · View-Transition wirft `InvalidStateError` beim Seitenaufbau · **N** · ⭐ · ✅ ERLEDIGT 2026-11-07
Beim Laden erscheinen zwei `InvalidStateError: Transition was aborted because of
invalid state. Unsupported layout or style`. Kein sichtbarer Effekt für den Nutzer,
nur Konsole. Vermutlich ruft `startViewTransition()` auf, bevor das Layout bereit
ist. Zu prüfen: `settings.js` (`applyTheme`, `changeLayout`) und
`boot-switches.js`. Nicht akut — erst nach Schema v3 / Storage prüfen.

### B61 · `data-anlagen`/`data-fuss` migriert (2026-11-14) · **M** · ⭐⭐ · ✅ ERLEDIGT
Größter Zustands-Hebel: je **4 Writer** (`boot.js`, `main.js`,
`draft-manager.js`), Ziel ist `:has(#toggle-anlagen:checked)` im CSS. Messung vor dem Umbau: 30/30 kalte Läufe, `:root:has(...)` traf am
`firstPaint` bereits zu (Paint 48–96 ms). Nach dem Umbau dieselbe Messung:
30/30, Anlagen und Fußzeile sichtbar, keine Attribute mehr auf `<html>`,
Paint 40–88 ms. Entfernt: der Entwurfs-`JSON.parse` in `boot.js` (kritischer
Pfad) und sechs Spiegel-Zeilen in `main.js`/`draft-manager.js`.

### B23 · Fitness Gate: 5 A-Gesetze ohne maschinelle Prüfung (`law_coverage`) · **S** · ⭐
**Problem:** `tools/lawcoverage.js` meldet eine LOW-Warnung: 30/35 A-Gesetze maschinell geprüft, 5 ungeprüft (A43, A44, A47, A60, A62).
**Hintergrund:** Diese 5 Gesetze sind reine Gestaltungs- und UX-Prinzipien, die sich nicht sinnvoll per Regex prüfen lassen.
**Lösung:** Einführung einer `MANUAL_REVIEW_LAWS`-Konstante in `tools/lawcoverage.js`, die diese 5 Gesetze als bewusst manuell geprüft und dokumentiert führt, um die LOW-Warnung im Fitness Gate auf 0 Diagnosen zu senken.

✅ ERLEDIGT 2026-11-14 — Sonde **P40** prüft A62 (`classList.add('active')`), `MANUAL_REVIEW` in `tools/lawcoverage.js` führt A44 und A47 mit Begründung. Abdeckung: 36/36, keine `law_coverage`-Warnung mehr. 51 Antipattern-Regeln.

### B24 · Fitness Gate: `tooling-overview.md` überschreitet 400-Zeilen-Limit · **S** · ⭐
**Problem:** `docs/30-meta/tooling-overview.md` hat aktuell 482 Zeilen und löst die `doc-size`-Warnung (> 400 Zeilen) im Fitness Gate aus.
**Lösungsmöglichkeiten:**
- Option A: Aufteilung der Datei (z. B. historische/archivierte Tools nach `tooling-overview-legacy.md` auslagern).
- Option B: Konfiguriertes Limit in `tools/reconciliation.js` für `tooling-overview.md` auf 500 Zeilen anheben (begründet durch den Charakter als zentrale Tooling-SSoT, analog zur bestehenden Ausnahme für `DECISION-LOG.md`).

✅ ERLEDIGT 2026-11-14 — `docs/30-meta/tooling-overview.md` hat heute **272 Zeilen** (Limit 400). Die `doc-size`-Warnung ist weg, ohne Limit-Anhebung.

### B27 · Mehrseitige DIN-5008-Briefe (Karussell, Folgeseiten-Kopf, Überlauf-Erkennung) · **L** · ⭐⭐⭐⭐
**Kontext:** Konsolidiert aus `MULTI_PAGE_ARCHITECTURE_SPEC.md` (zugeordnet zu [[ROADMAP#Priorität 1 — Mehrseitige Briefe]]).
**Ziel:** Saubere Trennung zwischen Erstseite (Kopf/Anschrift/Falzmarken) und Folgeseiten (Folgeseiten-Kopf bei 20 mm). Horizontales Paging-Karussell im Editor mit View Transitions API (Zero-Scroll-Garantie). Explizite Folgeseiten-Generierung statt instabiler DOM-Messschleifen (A49). Nativer Druckumbruch per `page-break-after: always; break-after: page;`.

✅ ERLEDIGT — der Mehrseiten-Modus ist der **aktuelle** Zustand: `website/js/multipage-controller.js`, `website/css/sheet-multipage.css`, `data-plugin-multipage` fest auf `true` ([[ADR-EINSEITEN-STILLGELEGT]]). Karussell/View-Transitions und Folgeseiten-Kopf sind implementiert. Der Eintrag beschrieb einen Plan, der inzwischen Realität ist.

### B66 · `settings.js` schreibt `layout` ohne Whitelist · **S** · ⭐
`settings.js:89–90` setzt `data-layout` direkt aus den Einstellungen. `boot.js`
hat eine `LAYOUT_WHITELIST`. Ein manipulierter oder alter Wert landet heute
un geprüft im Attribut, auf das die Blattgeometrie hört.

✅ ERLEDIGT 2026-11-14 — `settings.js` prüft `layout` jetzt wie `boot.js`: `=== 'form-a' ? 'form-a' : 'form-b'`. Kein ungeprüfter Wert mehr im Attribut, auf das die Blattgeometrie hört.

### B67 · Seeder-Ausfall ist unsichtbar · **S** · ⭐⭐
`boot-state.js:141–143` hat ein leeres `catch {}`. Fällt der Seeder aus, bleiben
die Regler bis `data-ready` versteckt und niemand sieht warum. Vorschlag:
`console.error` wie in `boot.js`, plus ein Hinweis-Test (T2 aus Batch 02).

✅ ERLEDIGT 2026-11-14 — das leere `catch {}` in `boot-state.js` schreibt jetzt `console.error('[Boot-State] Seeder fehlgeschlagen:', e)`. Ein Ausfall ist sichtbar.

### B68 · `typeof Temporal` entfernen · **S** · ⭐
`boot-state.js:120` prüft `typeof Temporal !== 'undefined'`. Baseline ist
Chrome 150+, Temporal ist vorhanden. Die Prüfung suggeriert eine Kompatibilität,
die es nicht gibt.

✅ ERLEDIGT 2026-11-14 — `typeof Temporal !== 'undefined'` entfernt; Baseline ist Chrome 150+, gemessen im Browser (`typeof Temporal` = object).

### B60 · `sheet.css` entscheiden · **S** · ⭐⭐
298 Zeilen, **nirgends eingebunden** (kein `<link>`, kein `@import`), aber in
acht Doku-Dateien als Architektur beschrieben. Seit 2026-11-14 trägt die Datei
einen Statuskopf, der genau das erklärt — **nicht löschen, nicht einbinden**,
bis der Inhaber entscheidet. Es enthält kein `@function` —
die Behauptung einer Namenskollision mit `sheet-multipage.css` ist widerlegt
(2026-11-14). Zwei Wege: löschen (Doku nachziehen) oder einbinden. Bis dahin
ist es eine Falle für jeden, der die Doku liest.

✅ ERLEDIGT 2026-11-14 — Entscheidung gefallen: **die Datei bleibt und wird
nicht eingebunden.** `website/css/sheet.css` trägt seit `9f65067` einen
55-zeiligen Statuskopf („NICHT LÖSCHEN, NICHT EINBINDEN") mit Zahlen, Risiken,
Prüfschritten und den zwei widerlegten Gerüchten. Für 0 Byte Netzlast ist damit
alles gesagt; die Löschung wäre eine Entscheidung ohne Nutzen.

### B65 · Boolean-Semantik vereinheitlichen · **S** · ⭐⭐
Derselbe Einstellungswert wird an drei Stellen unterschiedlich gelesen:
`asBool` (boot.js:33, `undefined` → Default), `!== false` (boot-state.js:45, 64;
settings.js:102, `null` → true) und `Boolean()` (settings.js:103, 135, `null` →
false). Folge: `marks: null` setzt `data-marks="false"`, lässt den Schalter aber
an. Ein Kommentar in `persistence.js` (DEFAULT_SETTINGS) entscheidet, welche
Semantik gilt; danach alle drei angleichen. Ändert kein Speicherformat.

✅ ERLEDIGT 2026-11-14 — **eine** Semantik: `istAn(v) = v !== false && v !== 'false'`
(kanonisch in `website/js/persistence.js`, lokal gespiegelt in `boot.js` und
`boot-state.js`, per Test deckungsgleich gehalten). Nur ein explizites `false`
schaltet aus; fehlt der Wert, gilt der Default (`true` für `marks` und
`pluginTestbrief`). Gegenprobe im Browser mit `marks: null` und fehlendem
`pluginTestbrief`: Attribut und Schalter waren vorher gemischt (false/true,
true/false), jetzt gleich (true/true, true/true).

### B69 · Zweite Restore-Logik im Seeder prüfen · **M** · ⭐⭐
`boot-state.js:100–112` setzt jeden Schlüssel aus `din_draft_current` per
`getElementById`, ohne Allowlist und ohne Sanitizer — obwohl der Dateikopf
„keine zweite Restore-Logik" behauptet. Ob `draft-manager.js` beides hat, ist
ungeprüft. Vergleich beider Pfade, dann entweder gemeinsame Funktion oder
Allowlist im Seeder.

✅ ERLEDIGT 2026-11-14 — der Seeder schreibt nur noch in Elemente, die
`EDITABLE_FIELD_SELECTOR` matchen (`boot-state.js`, `el.matches(FELD_SELECTOR)`).
Der Selektor ist lokal gespiegelt (klassisches Skript, kein Import) und durch
einen Test gegen `document.js` gepinnt. Kein zweiter Sanitizer: `collectDraft`
ruft `sanitizeRichText` **vor dem Speichern** auf, der Seeder materialisiert nur
Gespeichertes. Die Behauptung im Dateikopf („keine zweite Restore-Logik")
bleibt bewusst bestehen — der Seeder ist ein Vorlauf, die Wahrheit liegt bei
`draft-manager.js`; deshalb Dokumentation statt Zusammenlegen (siehe DECISION-LOG
2026-11-12, „Was bewusst NICHT gemacht wurde").

### B70 · Marker-Frage: `data-seeded` vs. `data-ready` · **M** · ⭐⭐
13 CSS-Regeln hängen an `data-seeded`, 7 an `data-ready`. Messung 2026-11-14:
beide Marker vor dem ersten Paint (12/12). Der Kommentar in `boot-state.js:134`
sagt dagegen „`data-ready` ~20 ms nach dem Paint". Entscheidung erst nach
T1/T2 (B72): Zwei Marker sind nur nötig, wenn ein Lauf `seeded=true,
ready=false` zeigt, in dem eine `ready`-Regel etwas Falsches darstellt.

✅ ERLEDIGT 2026-11-14 — **zwei Marker bleiben, mit getrennten Aufgaben.**
`data-seeded` = „Zustand steht", `data-ready` = „Booten fertig oder aufgegeben".
Messung (`tools/paint-probe.mjs`, 3 Profile × 30): `ready` liegt in 16/30
(lokal), 30/30 (6× CPU) und 30/30 (150 ms RTT) **nach** dem ersten Paint, das
Fenster `seeded`→`ready` reicht bis 1720 ms (Median 1704 ms im langsamen Netz). Die frühere Angabe „12/12 vor dem
Paint" war eine lokale Einzelmessung. Geändert: die Platzhalter-Sperre in
`sheet-common.css` hing allein an `data-ready` und verschwand bis zu 1,9 s nach
dem Seeding — sie hängt jetzt an `:not([data-seeded]):not([data-ready])`.
T2 (Seeder künstlich zum Absturz gebracht): Regler sichtbar nach 88 ms, gesetzt
von `initApp`/`settings.js`; der 2-s-Timer in `boot.js` ist die letzte Instanz,
falls auch `main.js` ausfällt.

### B71 · `boot.js` und `boot-state.js` zusammenlegen? · **M** · ⭐
Die Zweiteilung ist nach **Element-Verfügbarkeit** begründet, nicht nach zwei
Dateien: `boot.js` (Head) kann die Controls nicht setzen, `boot-state.js`
(Body-Ende) könnte beides. Zusammenlegen spart ~50 Zeilen, einen Request und
einen `JSON.parse`. Preis: `data-theme` käme erst nach dem Body-Parse — ob das
einen hellen Frame erzeugt, ist ungemessen. Erst nach T1 (B72).

✅ ERLEDIGT (ENTSCHIEDEN, nicht gebaut) 2026-11-14 — **zwei Dateien bleiben.**
`boot.js` muss im `<head>` laufen (`data-theme` vor dem ersten Frame, sonst
heller Blitz im Dunkelmodus); der Seeder braucht den fertigen Body
(`getElementById` liefert im `<head>` null). Zusammenlegen ginge nur, indem eine
der beiden Aufgaben verloren geht: als Body-Skript kommt `data-theme` nach dem
Paint (im langsamen Netz gemessen: Seeder im Median 228 ms nach dem Paint,
`ready` 1930 ms nach dem Paint). Der Preis
wäre genau der FOUC, der 2026-11-08 behoben wurde. Der Kopfkommentar von
`boot-state.js` behauptete trotzdem „vor dem ersten Paint" — ersetzt durch die
Messung (lokal 30/30, 6× CPU 11/30, 150 ms RTT 1/30).

### B72 · Messprotokoll für den ersten Paint · **M** · ⭐⭐⭐
Heute wird „vor dem Paint" mit einer Abfrage **nach** dem `firstPaint`-Event
belegt — racy. Nötig: `performance.mark('seeded')` und `mark('ready')`, dann
`getEntriesByType('paint')` mit Zeitstempeln vergleichen. 3 Profile × 30 Läufe
(lokal, CPU 6× gedrosselt, Netz 150 ms RTT), Cache aus, voller Entwurf.
Zusätzlich T2: `throw` im Seeder injizieren und Zeit bis „Regler sichtbar"
messen. Ergebnis ist die Grundlage für B70/B71.

✅ ERLEDIGT 2026-11-14 — `tools/paint-probe.mjs` misst per CDP mit
`performance.mark` (im Code: `seeder-start`, `seeded`, `ready`) gegen
`getEntriesByType('paint')`. 3 Profile × 30 Läufe, Cache aus, voller Entwurf
(4250 Byte, 34 Felder). Ergebnis: `seeded` vor Paint 30/30 · 11/30 · 1/30,
`ready` vor Paint 14/30 · 0/30 · 0/30. Rohdaten:
`paint-probe-2026-11-14.json`. T2 ebenfalls gefahren (siehe B70). Nebenbefund
und behoben: die Marke `seeder-start` stand **außerhalb** des `try` und war
damit die einzige Zeile ohne Fehlerpfad — jetzt innerhalb, der `catch` aus B67
greift.

### B73 · Messwerte generieren, nicht tippen · **S** · ⭐⭐
Das `fakten.md` aus Batch 02 behauptete „alle Schreibzugriffe" und listete die
Hälfte. Konsequenz: die Fakten-Datei jeder Scheibe wird von einem Skript
erzeugt (wie in Batch 01), das Schreibzugriffe, Leser und Zeilen aus dem Code
zieht — kein handgeschriebener Fließtext.

✅ ERLEDIGT 2026-11-14 — `tools/batch-facts.mjs` erzeugt
`batch/02-boot-pfad/fakten.md` aus dem Quelltext: Ladereihenfolge aus
`index.html`, Schreibzugriffe mit Zeilennummern, `JSON.parse`-Aufrufstellen,
Marker-Regeln aus den CSS-Dateien, Messwerte aus `paint-probe-*.json`.
`--check` bricht bei Abweichung ab. Das handgetippte Blatt war binnen eines
Tages falsch (2 statt 3 `JSON.parse`-Stellen, Zeile 30 statt 25, sechs
fehlende Schreibzugriffe: `stil-select`, `select-schriftart`, `vermerke`,
Postvermerk-Auswahl, Entwurfsfelder, Datum).
