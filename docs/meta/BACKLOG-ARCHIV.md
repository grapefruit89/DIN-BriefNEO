---
id: backlog-archiv
title: Backlog — erledigte und abgelehnte Einträge
status: archive
type: reference
created: '2026-11-14'
updated: '2026-11-17'
tags:
- din-briefneo
- meta
- archiv
doc_links:
- '[[BACKLOG]]'
- '[[DECISION-LOG]]'
- '[[ID-REGISTER]]'
code_links:
- 'website/js/boot.js'
- 'website/js/document.js'
- 'website/js/address.js'
depends_on: []
supersedes: []
---

# Backlog — erledigte und abgelehnte Einträge

Eine Zeile pro Punkt. Bis 2026-11-17 stand hier Fließtext (1.026 Zeilen); der Inhalt
ist auf das Destillat reduziert, die Begründungen leben weiter:

- **Spalte `Nachweis` = `DECISION-LOG`:** dort steht der Eintrag mit Messwerten.
- **Spalte `Nachweis` = Commit-Hash:** der Commit ist der Beleg.
- **Spalte `Nachweis` = `Historie`:** kein eigener Logeintrag. Auffindbar über
  `git log -S "B34" -- docs/30-meta/BACKLOG-ARCHIV.md` (der Fließtext steht in der
  Git-Historie dieser Datei) oder über `git log --grep "B34"`.

Lebende Liste: [[BACKLOG]]. Nummern und Vergaberegeln: [[ID-REGISTER]].

| ID | Titel | Ausgang | Datum | Nachweis |
|---|---|---|---|---|
| B6 | Feldtypen deklarativ per `data-feldtyp` | erledigt | 2026-10-02 | Historie |
| B7 | `attr()`-Geometrie statt doppelter mm-Werte | erledigt | 2026-10-15 | Historie |
| B8 | Die 12 Nicht-Print-`!important` auflösen | erledigt | 2026-10-02 | `809eb15` |
| B9 | Caret-Utilities zusammenführen + `TreeWalker` | erledigt | 2026-10-02 | Historie |
| B10 | `research/` **statuskennzeichnen** (NICHT auslagern) | erledigt | 2026-10-17 | Historie |
| B11 | `_`-Prefix → `#private` vereinheitlichen | erledigt | 2026-10-02 | DECISION-LOG |
| B12 | Logging-Konvention | erledigt | 2026-10-02 | DECISION-LOG |
| B13 | Guard-Kommentare entdoppeln | erledigt | 2026-10-02 | DECISION-LOG |
| B14 | Vier ungenutzte IDs entfernen | erledigt | 2026-11-05 | DECISION-LOG |
| B15 | Log-Behauptungen gegen den Code prüfen | erledigt | 2026-10-02 | DECISION-LOG |
| B17 | Strukturprüfungen für die 14 nicht-regexfähigen Gesetze | erledigt | 2026-10-02 | `a16899c` |
| B18 | Adress-Dropdown mit der Tastatur bedienbar machen | erledigt | 2026-10-02 | DECISION-LOG |
| B19 | Adaptive 3-Zonen-Logik + Zero-Click-Autofill | erledigt | 2026-10-02 | Historie |
| B20 | `fetch()`-Zeitlimits in `43-geoapify.js` | erledigt | 2026-10-02 | DECISION-LOG |
| B21 | Offene CSS-Features bewerten: `@page`-Seitenzahlen, `::highlight()`, `subgrid` | erledigt | 2026-10-02 | DECISION-LOG |
| B22 | Automatisierter Guard gegen hartcodierte Geometriewerte | abgelehnt | 2026-11-20 | YAGNI; SSoT im HTML ist stabil und getestet |
| B23 | Fitness Gate: 5 A-Gesetze ohne maschinelle Prüfung (`law_coverage`) | erledigt | 2026-11-14 | Historie |
| B24 | Fitness Gate: `tooling-overview.md` überschreitet 400-Zeilen-Limit | erledigt | 2026-11-14 | Historie |
| B27 | Mehrseitige DIN-5008-Briefe (Karussell, Folgeseiten-Kopf, Überlauf-Erkennung) | erledigt | — | Historie |
| B28 | Multi-Provider Geocoding (Nominatim, Photon, BKG) | abgelehnt | 2026-11-20 | [[BENCHMARK-GEOCODING-2026-11-20]] |
| B29 | Geoapify Performance Tuning (Pre-Warming, Session-Debounce & LRU-Cache) | erledigt | 2026-11-15 | Historie |
| B30 | Geoapify Region Bias & Multi-Cluster Failover (EU/Global Endpunkte) | erledigt | 2026-11-15 | Historie |
| B34 | DIN-5008-Folgeseiten-Nummerierung (`<din-seitenangabe>`) | erledigt | 2026-11-14 | Historie |
| B35 | Subpixel-Falz- und Lochmarken (SVG vs. CSS-Border) | abgelehnt | 2026-11-15 | Historie |
| B36 | Schema-Datei für v3 anlegen oder Verweis endgültig streichen | erledigt | 2026-11-15 | `186664c` |
| B37 | View-Transition wirft `InvalidStateError` beim Seitenaufbau | erledigt | 2026-11-07 | Historie |
| B39 | `mehrseiten-prototyp.html` einordnen | erledigt | 2026-11-08 | Historie |
| B41 | Zweizeilig-Guard zählt `<br>` nicht als Zeilenumbruch | erledigt | 2026-11-07 | Historie |
| B42 | Postvermerk-Auswahl wird bedingungslos auf Index 0 gesetzt | erledigt | 2026-11-07 | Historie |
| B43 | `aria-pressed` am Einstellungen-Schalter bleibt bei direktem Klick stehen | erledigt | 2026-11-07 | Historie |
| B44 | `<li>` ohne `<ul>` in `din-anlagen-angabe` | erledigt | 2026-11-07 | Historie |
| B45 | Eingefügte `<div>`-Kinder in der Anlagenliste bleiben stehen | erledigt | 2026-11-07 | Historie |
| B46 | `save()`-Rückgabe beim Signaturzustand wird ignoriert | erledigt | 2026-11-07 | Historie |
| B47 | Doppelter Save-Request beim Export | erledigt | 2026-11-07 | Historie |
| B48 | Test-Runner für maschinenlesbare Ergebnisse | erledigt | 2026-11-07 | Historie |
| B49 | Test-Dossier ins Repo | erledigt | 2026-11-15 | Historie |
| B50 | Mobile Drawer für die Seitenleiste (< 768px) | abgelehnt | 2026-11-13 | Historie |
| B51 | Design-Tokens in `sidebar.css` durchziehen (2px-Basis-Raster) | erledigt | 2026-11-20 | Historie |
| B52 | Plugin-Punkt für Addons (`website/addons/`) | erledigt | 2026-11-20 | Historie |
| B53 | Speichern systematisch prüfen (stille Fehler, Rückgaben, Wettläufe) | erledigt | 2026-11-07 | `331a1f8` |
| B54 | Speicherfehler-Toast wirft selbst (`ariaNotify` mit ungültigem `priority`) | erledigt | 2026-11-07 | Historie |
| B55 | Import scheitert lautlos (Fehlerpfad unerreichbar) | erledigt | 2026-11-07 | Historie |
| B56 | Dead-Code: Restprüfung auf 'AptosCustom' entfernen | erledigt | 2026-11-06 | `7e59132` |
| B57 | CSS-Druckränder: `page-margin-safety` in `print.css` evaluieren | erledigt | 2026-11-15 | DECISION-LOG |
| B60 | `sheet.css` entscheiden | erledigt | 2026-11-14 | `9f65067` |
| B61 | `data-anlagen`/`data-fuss` migriert (2026-11-14) | erledigt | 2026-11-14 | Historie |
| B62 | `data-gesetzt` migrieren | erledigt | 2026-11-14 | Historie |
| B63 | `data-layout`: zwei Spuren auf eine | erledigt | 2026-11-14 | Historie |
| B64 | `sidebar.css`: Optik und Struktur trennen | erledigt | 2026-11-15 | DECISION-LOG |
| B65 | Boolean-Semantik vereinheitlichen | erledigt | 2026-11-14 | DECISION-LOG |
| B66 | `settings.js` schreibt `layout` ohne Whitelist | erledigt | 2026-11-14 | Historie |
| B67 | Seeder-Ausfall ist unsichtbar | erledigt | 2026-11-14 | DECISION-LOG |
| B68 | `typeof Temporal` entfernen | erledigt | 2026-11-14 | Historie |
| B69 | Zweite Restore-Logik im Seeder prüfen | erledigt | 2026-11-14 | DECISION-LOG |
| B70 | Marker-Frage: `data-seeded` vs. `data-ready` | erledigt | 2026-11-14 | DECISION-LOG |
| B71 | `boot.js` und `boot-state.js` zusammenlegen? | erledigt | 2026-11-14 | DECISION-LOG |
| B72 | Messprotokoll für den ersten Paint | erledigt | 2026-11-14 | Historie |
| B73 | Messwerte generieren, nicht tippen | erledigt | 2026-11-14 | DECISION-LOG |
| B74 | Seitenleiste: 93 px Überlauf und doppelte Statuszeile | erledigt | 2026-11-14 | DECISION-LOG |
| B75 | Seitenleiste: Fokusziele ohne Zone und der Name „Daten" | erledigt | 2026-11-14 | DECISION-LOG |
| B77 | `fakten.md` aus Scheibe 01 behauptet „maschinell erzeugt", wird aber nicht erzeugt | erledigt | 2026-11-14 | Historie |
| B78 | `tools/paint-probe.mjs` überschreibt seine eigene Beweislage | erledigt | 2026-11-14 | Historie |
| B79 | `doc-size`-Gate meldet einmalig 406 Zeilen für eine 405-Zeilen-Datei | erledigt | 2026-11-14 | Historie |
| B82 | Toast: Auto-Dismiss in CSS statt JS-Timer | erledigt | 2026-11-15 | DECISION-LOG |
| B83 | Signatur: globalen `pointerdown`-Listener durch `:focus-within` ersetzen | erledigt | 2026-11-07 | `286b5ea` |
| B84 | ClipboardAddressParser als On-Demand-Addon aus Boot-Pfad ausgelagert | erledigt | 2026-11-20 | website/addons/clipboard-parser/ |
| B86 | Tote Einstellung `copyfit` entfernen oder implementieren | erledigt | 2026-11-15 | Historie |
| B87 | Text- und Adress-Parsing modernisieren | abgelehnt | 2026-11-20 | Kein Schaden, bestehende Regex-Heuristik stabil |
| B88 | Kaskade: 35 spiegelnde `!important` auflösen | erledigt | 2026-11-15 | `ce445dc` |
| B89 | Chrome-157–160-Behauptungen prüfen, bevor sie ins Design gehen | erledigt | 2026-11-15 | Historie |
| B90 | `data-generated` ist tot, `--rand-u` könnte CSS lesen | erledigt | 2026-11-15 | Historie |
| B92 | Kaskade: die vier Restfälle aus dem Review | erledigt | 2026-11-15 | `9204041` |
